const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Chefe da semana: um por servidor por semana, vida que cresce com quem entra na luta,
 * 3 ataques por dia, postura certa dobra o dano, ranking, recompensas únicas quando cai
 * (com teto semanal) e virada da semana guardando o resumo.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-boss-'));
process.env.PYXIE_DATA_DIR = tmpDir;
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');

const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const dungeonStore = require('../src/modules/dungeon/dungeonStore');
const store = require('../src/modules/guildBoss/bossStore');
const views = require('../src/modules/guildBoss/bossViews');
const pyBoss = require('../src/modules/guildBoss/commands/pyBoss');
const guildFeatures = require('../src/services/guildFeatures');
const { STANCES, INTENTS } = require('../src/modules/guildBoss/bossData');
const { t } = require('../src/utils/i18n');

dungeonStore._setDataFileForTests(path.join(tmpDir, 'dungeon.json'));

const runId = Date.now();
const G = 'guild_boss_test';
const U = Array.from({ length: 4 }, (_, i) => `user_test_boss_${i}_${runId}`);
const DAY = 24 * 60 * 60 * 1000;
const t0 = Date.UTC(2026, 9, 21, 15, 0, 0); // quarta-feira
const wordCount = (s) => s.trim().split(/\s+/).length;

console.log('👹 Iniciando testes do Chefe da Semana...');

(async () => {
  try {
    // 1. Um chefe por semana, vida que cresce com quem entra
    const status = store.getStatus(G, U[0], t0);
    assert.equal(status.maxHp, store.SETTINGS.baseHp);
    assert.equal(store.getStatus(G, U[0], t0 + DAY).bossId, status.bossId, 'Mesmo chefe a semana toda');
    const intent = store.intentFor(G, t0);
    const counter = Object.keys(STANCES).find((s) => STANCES[s].beats === intent);
    const weak = INTENTS[intent].weak;
    const hit1 = store.attack(G, U[0], counter, t0, () => 0.5);
    assert.equal(hit1.ok, true);
    assert.equal(hit1.counter, true);
    assert.equal(hit1.maxHp, store.SETTINGS.baseHp + store.SETTINGS.hpPerFighter, 'Quem entra deixa o chefe mais forte');
    const hit2 = store.attack(G, U[0], weak, t0, () => 0.5);
    assert.equal(hit2.weak, true);
    assert.ok(hit1.damage > hit2.damage * 3, 'Postura certa dobra, errada divide');
    assert.equal(hit2.maxHp, hit1.maxHp, 'A mesma pessoa não aumenta de novo');
    console.log('  ✅ 1. Um chefe por semana, vida por pessoa e posturas.');

    // 2. 3 ataques por dia
    assert.equal(store.attack(G, U[0], counter, t0, () => 0.5).ok, true);
    assert.equal(store.attack(G, U[0], counter, t0, () => 0.5).reason, 'no_attacks');
    assert.equal(store.getStatus(G, U[0], t0 + DAY).attacksLeft, 3, 'Renova no dia seguinte');
    assert.equal(store.attack(G, U[0], 'nope', t0).reason, 'invalid');
    console.log('  ✅ 2. Limite de 3 ataques por dia.');

    // 3. Queda: recompensas uma vez só, pódio e itens
    for (const u of U) economy.setUserBalance(u, 0);
    // Todo mundo bate 3 vezes por dia (de quinta a domingo, mesma semana) até ele cair
    let day = t0;
    let defeated = false;
    for (let d = 1; d <= 4 && !defeated; d++) {
      day = t0 + d * DAY;
      for (let n = 0; n < 3 && !defeated; n++) {
        for (const u of U) {
          const intentToday = store.intentFor(G, day);
          const best = Object.keys(STANCES).find((st) => STANCES[st].beats === intentToday);
          const result = store.attack(G, u, best, day, () => 0.05); // crítico sempre
          if (result.defeated) {
            defeated = true;
            break;
          }
        }
      }
    }
    const final = store.getStatus(G, U[0], day);
    assert.ok(final.defeatedAt, 'O chefe cai com o grupo batendo');
    assert.equal(final.hp, 0);
    assert.equal(store.attack(G, U[1], counter, day).reason, 'defeated', 'Ninguém bate depois da queda');
    const rewards = final.rewards;
    assert.equal(rewards.length, U.length);
    assert.equal(rewards[0].coins, store.SETTINGS.participantCoins + store.SETTINGS.podiumCoins[0]);
    assert.ok(rewards[0].items.includes('boss_trophy'));
    assert.ok(rewards.every((r) => r.items.includes('boss_banner')));
    const top = rewards[0].userId;
    assert.equal(economy.getBalance(top), rewards[0].coins, 'Pagamento entregue uma vez');
    assert.ok(vault.ownsItem(top, 'boss_trophy'));
    assert.ok(dungeonStore.getLobbyStatus(top).echoes >= store.SETTINGS.participantEchoes, 'Ecos para as Catacumbas');
    console.log('  ✅ 3. Queda paga uma vez, com pódio, itens e Ecos.');

    // 4. Teto semanal de moedinhas por servidor
    const many = { damage: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`x${i}`, 1000 - i])) };
    const plan = store.planRewards(many);
    assert.ok(plan.reduce((a, r) => a + r.coins, 0) <= store.SETTINGS.weeklyCoinCap);
    console.log('  ✅ 4. Teto semanal de moedinhas.');

    // 5. Virada da semana guarda o resumo e chama outro chefe
    const nextWeek = store.getStatus(G, U[0], t0 + 7 * DAY);
    assert.equal(nextWeek.defeatedAt, null);
    assert.equal(nextWeek.lastWeek.defeated, true);
    assert.equal(nextWeek.lastWeek.top[0].userId, top);
    console.log('  ✅ 5. Semana nova com resumo da anterior.');

    // 6. Painel público e golpe pelo botão (privado para quem bateu)
    for (const lang of ['pt', 'en']) {
      const view = views.buildBossView({ guildId: G, userId: U[0], source: { lang }, now: t0 + 7 * DAY });
      const data = view.embeds[0].data;
      assert.ok(/^(\p{Extended_Pictographic}|<a?:\w+:\d+>)/u.test(data.title) && wordCount(data.title) <= 8, data.title);
      assert.ok(data.fields.every((f) => f.value.length <= 1024 && !f.value.includes('{')), 'campos do painel completos');
      assert.ok(!/━|═|-{6,}/.test(data.description));
      assert.deepEqual(view.components[0].toJSON().components.map((c) => c.custom_id), ['boss:hit:strike', 'boss:hit:guard', 'boss:hit:spell', 'boss:view']);
      assert.deepEqual(view.allowedMentions, { parse: [] });
    }
    const calls = [];
    const interaction = {
      customId: 'boss:hit:strike',
      guildId: G,
      user: { id: U[2] },
      lang: 'pt',
      isButton: () => true,
      update: async (p) => calls.push(['update', p]),
      reply: async (p) => calls.push(['reply', p]),
      followUp: async (p) => calls.push(['followUp', p]),
    };
    assert.ok(pyBoss.isBossInteraction(interaction));
    await pyBoss.handleBossInteraction(interaction);
    assert.equal(calls[0][0], 'update');
    assert.ok(calls[0][1].embeds[0].data.description.includes(`<@${U[2]}>`), 'Golpe aparece no painel');
    assert.equal(calls[1][0], 'followUp');
    assert.equal(calls[1][1].flags, 64, 'Ataques restantes em privado');
    const dm = { ...interaction, guildId: null, reply: async (p) => calls.push(['dm', p]) };
    await pyBoss.handleBossInteraction(dm);
    assert.equal(calls[calls.length - 1][1].content, t('boss.guildOnly', 'pt'));
    console.log('  ✅ 6. Painel público, golpe pelo botão e respostas privadas.');

    // 7. Parte do Mundo Pyxie: some no modo clássico
    assert.equal(guildFeatures.getCommandGroup(pyBoss), 'mmo');
    assert.equal(guildFeatures.getCommandGroup('py-boss'), 'mmo');
    console.log('  ✅ 7. Bloqueado no modo clássico do servidor.');

    console.log('✨ Chefe da Semana validado.');
  } catch (err) {
    console.error('❌ Falha nos testes do Chefe da Semana:', err);
    process.exitCode = 1;
  } finally {
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})();
