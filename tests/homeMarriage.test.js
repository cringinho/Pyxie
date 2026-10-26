const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Casinha e casamento: ninguém ganha casa só por abrir o /py-home; a chave sai no Andar 3 das
 * Catacumbas ou a casa é comprada nas condições do casamento (2000 moedinhas + 2 feijões).
 * Casados moram junto na casa de quem tem; no divórcio a casa fica com a dona original e os
 * itens da outra pessoa voltam para ela (separar bens).
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-home-marriage-'));
process.env.PYXIE_DATA_DIR = tmpDir;
process.env.MARRIAGE_DATA_PATH = path.join(tmpDir, 'marriageData.json');
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');

const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const store = require('../src/modules/home/homeStore');
const views = require('../src/modules/home/homeViews');
const pyHome = require('../src/modules/home/commands/pyHome');
const dungeonStore = require('../src/modules/dungeon/dungeonStore');
const marriage = require('../src/modules/marriage/marriageManager');
const { t } = require('../src/utils/i18n');

dungeonStore._setDataFileForTests(path.join(tmpDir, 'dungeon.json'));

const runId = Date.now();
const A = `user_test_hm_a_${runId}`;
const B = `user_test_hm_b_${runId}`;
const C = `user_test_hm_c_${runId}`;

function setDungeonBest(userId, floor) {
  const file = path.join(tmpDir, 'dungeon.json');
  const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { players: {}, runs: {}, totals: {} };
  state.players = state.players || {};
  state.players[userId] = { stats: { runs: 1, bestFloor: floor } };
  fs.writeFileSync(file, JSON.stringify(state));
}

function marry(a, b) {
  const proposal = marriage.createMarriageProposal(a, b, 'guild_test');
  const id = proposal.requestId || proposal.request?.id || proposal.id;
  return marriage.resolveMarriageProposal(id, b, true);
}

console.log('💞 Iniciando testes da Casinha com casamento...');

(async () => {
  try {
    // 1. Sem casa grátis: a tela mostra os três caminhos
    const access = store.getHomeAccess(A);
    assert.equal(access.hasAccess, false);
    assert.equal(access.canClaimFree, false);
    const owner = { id: A, username: 'ana', displayName: 'Ana' };
    const noHome = await views.buildHomeView({ owner, viewer: owner, source: { lang: 'pt' } });
    assert.equal(noHome.embeds[0].data.title, t('home.nohome.title', 'pt'));
    const ids = noHome.components[0].toJSON().components;
    assert.deepEqual(ids.map((c) => c.custom_id), [`home:claim:${A}`, `home:buyhouse:${A}`]);
    assert.equal(ids[0].disabled, true, 'Sem o Andar 3, a chave fica trancada');
    assert.equal(store.getHome(A), null, 'Abrir o /py-home não cria casa');
    assert.equal(store.claimFreeHome(A).reason, 'need_dungeon');
    console.log('  ✅ 1. Ninguém ganha casa só por abrir o comando.');

    // 2. Chave grátis no Andar 3 das Catacumbas
    setDungeonBest(A, 3);
    assert.equal(store.getHomeAccess(A).canClaimFree, true);
    const claimed = store.claimFreeHome(A);
    assert.equal(claimed.ok, true);
    assert.equal(claimed.home.acquired, 'dungeon');
    assert.ok(claimed.home.placements.length > 0, 'Kit inicial dentro da casa');
    assert.equal(store.claimFreeHome(A).reason, 'has_home');
    console.log('  ✅ 2. Andar 3 das Catacumbas dá a chave de graça.');

    // 3. Compra nas condições do casamento (moedinhas e feijões, com devolução se faltar feijão)
    economy.setUserBalance(B, 2500);
    assert.equal(store.buyHouse(B).reason, 'house_beans');
    assert.equal(economy.getBalance(B), 2500, 'Sem feijões, as moedinhas voltam');
    economy.addMagicBeans(B, 2);
    const bought = store.buyHouse(B);
    assert.equal(bought.ok, true);
    assert.equal(economy.getBalance(B), 500);
    assert.equal(economy.getMagicBeans(B), 0);
    assert.equal(bought.home.acquired, 'purchase');
    economy.setUserBalance(C, 100);
    assert.equal(store.buyHouse(C).reason, 'house_coins');
    console.log('  ✅ 3. Compra por 2000 moedinhas + 2 feijões, sem cobrar pela metade.');

    // 4. Só casados dividem a casa
    assert.equal(store.moveIn(A, C).reason, 'not_spouse');
    economy.setUserBalance(A, 5000);
    const wed = marry(A, C);
    assert.equal(wed.accepted, true, 'Casamento de teste');
    assert.equal(views.canInviteSpouse(A), true, 'Botão de convite para o cônjuge');
    const invite = views.buildInviteMessage({ ownerId: A, spouseId: C, source: { lang: 'pt' } });
    assert.deepEqual(invite.allowedMentions.users, [C], 'Só o cônjuge é marcado');
    const buttons = invite.components[0].toJSON().components.map((c) => c.custom_id);
    assert.deepEqual(buttons, [`home:movein:${A}:${C}`, `home:stay:${A}:${C}`]);

    const calls = [];
    const click = (customId, userId) => ({
      customId,
      user: { id: userId, username: userId },
      lang: 'pt',
      isButton: () => true,
      isStringSelectMenu: () => false,
      reply: async (p) => calls.push(['reply', p]),
      update: async (p) => calls.push(['update', p]),
    });
    await pyHome.handleHomeInteraction(click(`home:movein:${A}:${C}`, B));
    assert.equal(calls.pop()[1].content, t('home.invite.notForYou', 'pt'), 'Outra pessoa não aceita por ela');
    await pyHome.handleHomeInteraction(click(`home:movein:${A}:${C}`, C));
    const accepted = calls.pop();
    assert.equal(accepted[0], 'update');
    assert.ok(accepted[1].content.includes(`<@${C}>`));
    assert.equal(store.livingTogether(A, C), true);
    assert.equal(store.getHomeOwnerId(C), A, 'C mora na casa de A');
    assert.equal(views.canInviteSpouse(A), false);
    assert.equal(marriage.hasSharedHome(marriage.getMarriage(A)), true, 'O casal tem casa para o cofre e os filhos');
    console.log('  ✅ 4. Casados moram junto; o convite é só do cônjuge.');

    // 5. Os dois decoram a mesma casa, cada um com os próprios itens
    const cItem = vault.grantItem(C, 'plant_pot', { source: 'admin' });
    const cWall = vault.grantItem(C, 'wp_cream', { source: 'admin' });
    assert.ok(cItem.ok && cWall.ok);
    const placed = store.placeItem(C, cItem.instance.uid, 0, 3);
    assert.equal(placed.ok, true, placed.reason);
    assert.equal(store.applySurface(C, 'wp_cream').ok, true);
    const shared = store.getHome(A);
    assert.ok(shared.placements.some((p) => p.uid === cItem.instance.uid && p.by === C), 'Item guarda quem colocou');
    assert.equal(shared.wallpaperBy, C);
    assert.equal(store.getHome(C).placements.length, shared.placements.length, 'Os dois veem a mesma casa');
    assert.ok(store.getAvailableInstances(C).every((it) => it.uid !== cItem.instance.uid), 'Item à mostra sai da lista');
    assert.equal(store.likeHome(C, A).reason, 'own_home', 'Ninguém curte a própria casa do casal');
    const homeView = await views.buildHomeView({ owner: { id: C, username: 'cy' }, viewer: { id: C, username: 'cy' }, source: { lang: 'pt' } });
    assert.ok(homeView.embeds[0].data.description.includes(`<@${A}> e <@${C}>`));
    console.log('  ✅ 5. Casa compartilhada: cada item lembra quem colocou.');

    // 6. Divórcio: a casa fica com A e os itens de C voltam para C (separar bens)
    const before = store.getHome(A).placements.length;
    const ended = marriage.endMarriage(C);
    assert.equal(ended.ended, true);
    assert.equal(ended.separation.separated, true);
    assert.equal(ended.separation.returned[C], 1);
    const after = store.getHome(A);
    assert.equal(after.placements.length, before - 1);
    assert.ok(after.placements.every((p) => (p.by || A) !== C));
    assert.equal(after.wallpaperBy, null, 'O papel de parede de C sai junto');
    assert.equal(store.getHomeOwnerId(C), C);
    assert.equal(store.getHome(C), null, 'C volta a não ter casa (a casa era de A)');
    assert.ok(vault.getInstance(C, cItem.instance.uid), 'O item continua no cofre de C');
    assert.ok(store.getAvailableInstances(C).some((it) => it.uid === cItem.instance.uid), 'E volta para a mochila dela');
    console.log('  ✅ 6. Divórcio separa os bens: casa com a dona, itens com quem colocou.');

    // 7. Casal que já tinha comprado a casa do casamento antigo continua com ela
    economy.setUserBalance(B, 5000);
    economy.setUserBalance(C, 5000);
    marry(B, C);
    const legacy = marriage.getMarriage(B);
    const file = process.env.MARRIAGE_DATA_PATH;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.marriages[legacy.id].house = { unlocked: true, unlockedAt: Date.now(), vaultBalance: 0, lastInterestClaim: 0 };
    fs.writeFileSync(file, JSON.stringify(data));
    assert.equal(marriage.hasSharedHome(marriage.getMarriage(B)), true);
    assert.equal(store.livingTogether(B, C), true, 'A compra antiga virou a casinha do casal (a de B, que já tinha casa)');
    assert.equal(store.getHomeOwnerId(C), B);
    console.log('  ✅ 7. Compras da casa antiga do casamento são honradas.');

    console.log('✨ Casinha com casamento validada.');
  } catch (err) {
    console.error('❌ Falha nos testes da Casinha com casamento:', err);
    process.exitCode = 1;
  } finally {
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})();
