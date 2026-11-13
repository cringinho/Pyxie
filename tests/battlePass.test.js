const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Passe da Pyxie (/py-pass): trilhas geradas por mês, pet e título míticos do mês, XP das
 * atividades, resgate (grátis, Premium retroativo, mochila cheia, mês anterior), Premium
 * idempotente por pagamento, link assinado, Mercado Pago (rede simulada) e as telas.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-pass-'));
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');
process.env.PYXIE_DATA_DIR = tmpDir;
for (const key of ['MERCADOPAGO_ACCESS_TOKEN', 'MERCADOPAGO_WEBHOOK_SECRET']) delete process.env[key];
process.env.PASS_TOKEN_SECRET = 'test-pass-secret';
process.env.PASS_PUBLIC_URL = 'https://pyxie.test';

const battlePass = require('../src/services/battlePass');
const payments = require('../src/services/passPayments');
const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const crafting = require('../src/services/crafting');
const festival = require('../src/services/festival');
const store = require('../src/modules/dungeon/dungeonStore');
const { getItem } = require('../src/modules/home/homeCatalog');
const { getSprite } = require('../src/modules/home/homeSprites');
const views = require('../src/modules/battlePass/passViews');
const { emojify } = require('../src/utils/emojify');
const pyPass = require('../src/modules/battlePass/commands/pyPass');
const { t } = require('../src/utils/i18n');

const DUNGEON_FILE = path.join(tmpDir, 'dungeon.json');
store._setDataFileForTests(DUNGEON_FILE);

const runId = Date.now();
const U = `user_test_pass_${runId}`;
const P = `user_test_pass_p_${runId}`;
const F = `user_test_pass_f_${runId}`;
// Meio-dia de Brasília em datas fixas
const at = (y, m, d, h = 15) => Date.UTC(y, m - 1, d, h);
const OCT = at(2026, 10, 26);
const echoesOf = (id) => {
  try {
    return JSON.parse(fs.readFileSync(DUNGEON_FILE, 'utf8')).players?.[id]?.echoes || 0;
  } catch (_) {
    return 0;
  }
};
const json = (status, body) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) });

console.log('💎 Iniciando testes do Passe da Pyxie...');

(async () => {
  try {
    // 1. Calendário e trilhas do mês
    assert.equal(battlePass.monthKey(at(2026, 11, 1, 2)), '2026-10', '23h de 31/10 em Brasília ainda é outubro');
    assert.equal(battlePass.monthKey(at(2026, 11, 1, 4)), '2026-11');
    const oct = battlePass.getTrack('2026-10');
    assert.equal(oct.length, 50);
    assert.deepEqual(oct, battlePass.getTrack('2026-10'), 'mesma trilha para todo mundo');
    assert.notDeepEqual(oct, battlePass.getTrack('2026-11'), 'trilha muda a cada mês');
    assert.equal(oct.filter((row) => row.free.type === 'coins').reduce((acc, row) => acc + row.free.qty, 0), 200, 'teto de 200 moedinhas por mês');
    assert.ok(oct.every((row) => row.premium.type !== 'coins'), 'Premium não dá moedinhas');
    assert.equal(oct.filter((row) => row.premium.type === 'beans').length, 4);
    for (const row of oct) for (const reward of [row.free, row.premium]) if (reward.itemId) assert.ok(getItem(reward.itemId), `item ${reward.itemId}`);
    assert.deepEqual(oct[49].premium, { type: 'pet', itemId: 'pass_pet_2026_10', title: 'pass_title_2026_10' });
    console.log('  ✅ 1. Trilhas geradas por mês, iguais para todo mundo.');

    // 2. Pet e título míticos do mês
    const pet = getItem('pass_pet_2026_10');
    assert.equal(pet.rarity, 'mythic');
    assert.equal(pet.tradable, false);
    assert.equal(pet.kind, 'pet');
    assert.notEqual(getItem('pass_pet_2026_11').name.pt, pet.name.pt, 'cada mês tem o seu');
    assert.equal(getItem('pass_pet_2026_13'), null);
    assert.ok((await getSprite(pet.sprite)).width >= 16);
    const titlePt = economy.getTitleDefinition('pass_title_2026_10', 'pt');
    const titleEn = economy.getTitleDefinition('pass_title_2026_10', 'en');
    assert.equal(titlePt.name, 'Lenda de Outubro 2026');
    assert.equal(titleEn.name, 'October 2026 Legend');
    assert.ok(titlePt.display.includes('꧁'));
    console.log('  ✅ 2. Pet e título míticos gerados para cada mês.');

    // 3. XP: níveis, teto e ganchos nas atividades
    let gain = battlePass.addXp(U, 'work', { now: OCT });
    assert.equal(gain.gained, 60);
    gain = battlePass.addXp(U, 'x', { amount: 300, now: OCT });
    assert.equal(gain.levelUp, true);
    assert.equal(gain.after, 1);
    assert.equal(battlePass.addXp(U, 'nada', { now: OCT }), null);
    battlePass.addXp(F, 'x', { amount: 999999, now: OCT });
    assert.equal(battlePass.getStatus(F, OCT).level, 50, 'teto no nível 50');
    economy.setUserBalance(P, 0);
    const before = battlePass.getStatus(P).xp;
    assert.equal(economy.claimDaily(P).claimed, true);
    assert.equal(battlePass.getStatus(P).xp - before, battlePass.XP_SOURCES.daily, 'diário dá XP');
    economy.setUserBalance(P, 500);
    crafting.addMaterials(P, { shell: 3 });
    assert.equal(crafting.craft(P, 'craft_shell_jar').ok, true);
    assert.equal(battlePass.getStatus(P).xp - before, battlePass.XP_SOURCES.daily + battlePass.XP_SOURCES.craft, 'oficina dá XP');
    console.log('  ✅ 3. XP das atividades, níveis e teto.');

    // 4. Resgate das duas trilhas (12 níveis cada): a trilha premium é grátis para todo mundo
    const D = `user_test_pass_d_${runId}`;
    battlePass.addXp(D, 'x', { amount: 12 * 300, now: OCT });
    economy.setUserBalance(D, 0);
    const first = battlePass.claimAll(D, { now: OCT });
    assert.equal(first.delivered.length, 24, 'trilha grátis + premium, sem pagamento');
    assert.equal(first.delivered.filter((d) => d.track === 'free').length, 12);
    assert.equal(first.delivered.filter((d) => d.track === 'premium').length, 12);
    assert.equal(economy.getUserAccount(D).coins, 40, 'moedinhas do nível 5 (o 10 dá móvel)');
    assert.equal(battlePass.claimAll(D, { now: OCT }).delivered.length, 0, 'não entrega duas vezes');
    const expectedEchoes = oct.slice(0, 12).reduce((acc, row) => acc + (row.free.type === 'echoes' ? row.free.qty : 0) + (row.premium.type === 'echoes' ? row.premium.qty : 0), 0);
    assert.equal(echoesOf(D), expectedEchoes);
    assert.ok(vault.listInstances(D).some((it) => it.itemId === oct[9].free.itemId), 'item do nível 10');
    console.log('  ✅ 4. Resgate das duas trilhas sem pagar nada.');

    // 5. Premium: idempotente por pagamento e retroativo
    assert.equal(battlePass.activatePremium(D, '2026-10', { paymentId: null }).reason, 'payment');
    assert.equal(battlePass.activatePremium('nao-e-id', '2026-10', { paymentId: 'x' }).reason, 'user');
    const act = battlePass.activatePremium(D, '2026-10', { paymentId: 'mp:1', provider: 'mercadopago', amount: 5, currency: 'BRL', now: OCT });
    assert.equal(act.ok, true);
    assert.equal(battlePass.activatePremium(D, '2026-10', { paymentId: 'mp:1', provider: 'mercadopago', amount: 5 }).duplicate, true);
    assert.equal(battlePass.isPremium(D, '2026-10'), true);
    const premiumClaim = battlePass.claimAll(D, { now: OCT });
    assert.equal(premiumClaim.delivered.length, 0, 'Premium já veio no primeiro resgate (grátis para todos)');
    assert.equal(economy.getUserAccount(D).magicBeans >= 1, true, 'feijão do nível 10');
    const stats = battlePass.getPassStats(OCT);
    assert.ok(stats.premiumThisMonth >= 1);
    assert.equal(stats.revenueBRL, 5);
    console.log('  ✅ 5. Premium idempotente e retroativo.');

    // 6. Nível 50 Premium entrega pet e título míticos
    battlePass.activatePremium(F, '2026-10', { paymentId: 'mp:FULL1', provider: 'mercadopago', amount: 5, currency: 'BRL', now: OCT });
    const full = battlePass.claimAll(F, { now: OCT });
    assert.equal(full.delivered.length, 100);
    assert.ok(vault.listInstances(F).some((it) => it.itemId === 'pass_pet_2026_10'));
    assert.ok(economy.getUserAccount(F).titles.includes('pass_title_2026_10'));
    assert.equal(economy.equipTitle(F, 'pass_title_2026_10').success, true, 'título pode ser equipado');
    console.log('  ✅ 6. Nível 50: pet e título míticos.');

    // 7. Mochila cheia: o item fica pendente; mês anterior vale por 7 dias
    const B = `user_test_pass_b_${runId}`;
    for (let i = 0; i < vault.MAX_ITEMS_PER_USER; i++) vault.grantItem(B, 'chair_wood', { source: 'shop' });
    battlePass.addXp(B, 'x', { amount: 10 * 300, now: OCT });
    const blocked = battlePass.claimAll(B, { now: OCT });
    assert.equal(blocked.blocked, true);
    assert.equal(blocked.delivered.length, 18, 'os itens dos níveis 5 (premium) e 10 (grátis) ficaram');
    assert.equal(battlePass.getStatus(B, OCT).claimable, 2);
    vault.removeInstance(B, vault.listInstances(B)[0].uid);
    assert.equal(battlePass.claimAll(B, { now: at(2026, 11, 5) }).delivered.length, 1, 'outubro ainda resgatável em 5/11');
    battlePass.addXp(B, 'x', { amount: 300, now: OCT });
    assert.equal(battlePass.claimAll(B, { now: at(2026, 11, 20) }).delivered.length, 0, 'depois de 7 dias o mês fecha');
    console.log('  ✅ 7. Mochila cheia e prazo do mês anterior.');

    // 8. Link assinado
    const token = payments.createPassToken(P, { lang: 'en' });
    const session = payments.verifyPassToken(token);
    assert.deepEqual(session, { userId: P, month: battlePass.monthKey(), lang: 'en' });
    assert.equal(payments.verifyPassToken(`${token}x`), null, 'assinatura adulterada');
    const [payload, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ u: 'outra_pessoa', m: battlePass.monthKey(), l: 'pt', e: Date.now() + 1000 })).toString('base64url');
    assert.equal(payments.verifyPassToken(`${forged}.${sig}`), null, 'payload trocado');
    assert.equal(payments.verifyPassToken(token, Date.now() + 3 * 60 * 60 * 1000), null, 'vence em 2h');
    assert.ok(payload.length > 10);
    assert.ok(payments.passUrl(P, { lang: 'en' }).startsWith('https://pyxie.test/passe?token='));
    assert.deepEqual(payments.parseReference(payments.reference(P, '2026-10')), { userId: P, month: '2026-10' });
    assert.equal(payments.parseReference('pass|x|2026-1'), null);
    console.log('  ✅ 8. Link assinado e referência do pagamento.');

    // 9. Cobrança desligada: o Passe Premium é grátis para todos e nenhum checkout abre
    assert.equal(battlePass.isPremium(U), true, 'premium para qualquer pessoa');
    assert.deepEqual(payments.providers(), { mercadopago: false });
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-mp';
    assert.deepEqual(payments.providers(), { mercadopago: false }, 'credencial sozinha não liga a cobrança (só PYXIE_PAYMENTS=on)');
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    assert.equal((await payments.createCheckout('mercadopago', token)).reason, 'already', 'ninguém precisa pagar');
    assert.equal((await payments.createCheckout('mercadopago', 'lixo')).reason, 'token');
    // Benefício não gravado vira erro: a rota (legada) responde 500 e o Mercado Pago reenvia (Q246).
    const serverSource = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    const passRoute = serverSource.slice(serverSource.indexOf("app.post('/api/pass/webhook/mercadopago'"), serverSource.indexOf("app.post('/api/plans/webhook/mercadopago'"));
    assert.ok(passRoute.includes("result.reason === 'save') return res.status(500)"), 'Passe: falha ao gravar responde 500');
    console.log('  ✅ 9. Passe Premium grátis e cobrança desligada.');

    // 11. Telas PT/EN
    for (const locale of ['pt-BR', 'en-US']) {
      const source = { locale };
      const home = await views.buildPassView({ viewerId: D, source, now: OCT });
      assert.ok(home.embeds[0].data.title.startsWith(emojify('💎')), 'título com o diamante pixel do bot');
      assert.ok(!home.embeds[0].data.description.includes('{'));
      assert.ok(!home.embeds[0].data.fields?.length, 'tela principal sem colunas: tudo em blocos na descrição');
      const order = ['nextHeader', 'todoHeader', 'xpHeader'].map((key) => home.embeds[0].data.description.indexOf(emojify(t(`pass.${key}`, source.locale.startsWith('en') ? 'en' : 'pt', { level: 1 })).split('`')[0]));
      assert.ok(order.every((pos, i) => pos >= 0 && (i === 0 || pos > order[i - 1])), 'ordem: próximo prêmio → o que fazer → como ganhar XP');
      const maxedId = `user_test_pass_max_${runId}`;
      battlePass.addXp(maxedId, 'preview', { amount: battlePass.MAX_LEVEL * battlePass.XP_PER_LEVEL, now: OCT });
      const maxed = (await views.buildPassView({ viewerId: maxedId, source, now: OCT })).embeds[0].data.description;
      assert.ok(maxed.includes(`\`${battlePass.MAX_LEVEL}\``) && !maxed.includes(emojify(t('pass.xpHeader', source.locale.startsWith('en') ? 'en' : 'pt'))), 'nível máximo: sem "como ganhar XP"');
      const buttons = home.components[0].components;
      assert.equal(buttons[0].data.custom_id, `bp:claim:${D}`);
      assert.ok(home.files.length === 1);
      const free = await views.buildPassView({ viewerId: U, source });
      assert.ok(!free.components[0].components.some((c) => c.data.url), 'sem botão de compra: o Premium é de graça');
      for (let page = 0; page < 5; page++) {
        const levels = views.buildLevelsView({ viewerId: D, source, page, now: OCT });
        assert.ok(levels.embeds[0].data.description.length < 4096, `página ${page}`);
        assert.ok(!levels.embeds[0].data.description.includes('{'));
        assert.ok(levels.embeds[0].data.fields.every((f) => f.value.length <= 1024 && !f.value.includes('{')), `colunas da página ${page}`);
      }
      assert.ok(views.claimNotice({ delivered: [], blocked: true }, locale.startsWith('pt') ? 'pt' : 'en').length > 0);
    }
    let replied = null;
    await pyPass.handlePassInteraction({ customId: `bp:claim:${D}`, user: { id: U }, locale: 'pt-BR', isButton: () => true, reply: async (payload) => { replied = payload; } });
    assert.equal(replied.content, t('pass.notYours', 'pt'));
    for (const key of ['premiumDm', 'claimFull', 'claimNothing', 'sentDm', 'useSlash', 'error']) for (const lang of ['pt', 'en']) assert.ok(!t(`pass.${key}`, lang).startsWith('pass.'), `${key} (${lang})`);
    console.log('  ✅ 11. Telas PT/EN, níveis paginados e botões travados para a dona.');

    console.log('🎉 [TEST] Passe da Pyxie passou com 100% de sucesso!');
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    console.error('❌ [TEST] Falha no Passe da Pyxie:', error);
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }
})();
