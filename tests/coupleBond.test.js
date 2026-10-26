const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Força do Laço (casamento): gestos do dia, dia de Sintonia e sequência, níveis com nome,
 * missão da semana (progresso vindo de outras partes do bot, lembrança para as duas pessoas),
 * conquistas/títulos pelo nível, tela PT/EN e o painel do casamento com o botão do Laço.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-bond-'));
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');
process.env.PYXIE_DATA_DIR = tmpDir;
process.env.MARRIAGE_DATA_PATH = path.join(tmpDir, 'marriageData.json');
process.env.DUNGEON_DATA_PATH = path.join(tmpDir, 'dungeon.json');

const manager = require('../src/modules/marriage/marriageManager');
const bond = require('../src/modules/marriage/coupleBond');
const bondViews = require('../src/modules/marriage/bondViews');
const pyCasamento = require('../src/modules/marriage/commands/pyCasamento');
const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const achievements = require('../src/services/achievements');
const { getItem } = require('../src/modules/home/homeCatalog');
const { t } = require('../src/utils/i18n');

const runId = Date.now();
const A = `user_test_bond_a_${runId}`;
const B = `user_test_bond_b_${runId}`;
const C = `user_test_bond_c_${runId}`;
const DAY = 24 * 60 * 60 * 1000;
// Meio-dia de Brasília numa quarta-feira
const T0 = Date.UTC(2026, 9, 28, 15);

function marry(x, y) {
  const proposal = manager.createMarriageProposal(x, y, 'g1');
  assert.equal(proposal.created, true);
  return manager.resolveMarriageProposal(proposal.id, y, true).marriage;
}

function editMarriage(fn) {
  const data = manager.readData();
  const marriage = Object.values(data.marriages).find((m) => m.spouses.includes(A));
  fn(marriage);
  manager.writeData(data);
}

console.log('💞 Iniciando testes da Força do Laço...');

(async () => {
  try {
    // 1. Casamento novo começa no nível 1, com data e missão da semana
    const marriage = marry(A, B);
    assert.ok(marriage.createdAt, 'casamento novo guarda a data');
    assert.equal(bond.marriedAt({ id: 'mar_1700000000000_ab12' }), 1700000000000, 'casamento antigo usa a data do id');
    let status = bond.getBondStatus(A, T0);
    assert.equal(status.level, 1);
    assert.equal(status.levelName.pt, 'Recém-casados');
    assert.equal(status.spouseId, B);
    assert.ok(bond.WEEKLY_QUESTS.some((q) => q.id === status.week.quest));
    assert.notEqual(status.week.quest, 'tree', 'sem árvore, sem missão da árvore');
    assert.equal(bond.getBondStatus(C, T0), null);
    console.log('  ✅ 1. Laço começa no nível 1 com a missão da semana.');

    // 2. Gesto do dia: uma vez por pessoa por dia
    assert.equal(bond.doGesture(A, 'dança', T0).reason, 'invalid');
    assert.equal(bond.doGesture(C, 'hug', T0).reason, 'not_married');
    let result = bond.doGesture(A, 'note', T0);
    assert.equal(result.ok, true);
    assert.equal(result.synced, false);
    assert.equal(result.xp, bond.GESTURE_XP);
    assert.equal(bond.doGesture(A, 'hug', T0 + 1000).reason, 'done_today');
    console.log('  ✅ 2. Um gesto por pessoa por dia.');

    // 3. As duas pessoas no mesmo dia: Sintonia e sequência
    result = bond.doGesture(B, 'coffee', T0 + 2000);
    assert.equal(result.synced, true);
    assert.equal(result.streak, 1);
    assert.equal(result.xp, 2 * bond.GESTURE_XP + bond.SYNC_XP);
    bond.doGesture(A, 'stars', T0 + DAY);
    assert.equal(bond.doGesture(B, 'hug', T0 + DAY).streak, 2, 'dia seguinte soma');
    status = bond.getBondStatus(B, T0 + DAY);
    assert.equal(status.mine, 'hug');
    assert.equal(status.theirs, 'stars');
    assert.equal(bond.getBondStatus(A, T0 + 3 * DAY).streak, 0, 'um dia sem sintonia zera a sequência visível');
    bond.doGesture(A, 'note', T0 + 3 * DAY);
    assert.equal(bond.doGesture(B, 'note', T0 + 3 * DAY).streak, 1, 'sequência recomeça');
    assert.equal(bond.getBondStatus(A, T0 + 3 * DAY).bestStreak, 2);
    console.log('  ✅ 3. Sintonia, sequência e recorde.');

    // 4. Missão da semana com progresso de fora (trabalho), lembrança para as duas pessoas
    editMarriage((m) => {
      m.bond.week = { key: m.bond.week.key, quest: 'work', target: 2, progress: 0, done: false, keepsake: 'mirror_round' };
      m.loveBar = 40;
    });
    const xpBefore = bond.getBondStatus(A, T0 + 3 * DAY).xp;
    assert.equal(bond.recordActivity(A, 'dungeon', 1, T0 + 3 * DAY), null, 'outra missão não conta');
    assert.equal(bond.recordActivity(A, 'work', 1, T0 + 3 * DAY).progress, 1);
    const done = bond.recordActivity(B, 'work', 1, T0 + 3 * DAY);
    assert.equal(done.completed, true);
    status = bond.getBondStatus(A, T0 + 3 * DAY);
    assert.equal(status.week.done, true);
    assert.equal(status.love, 100, 'Barra do Amor cheia');
    assert.equal(status.xp - xpBefore, bond.WEEKLY_XP);
    assert.equal(status.weeksDone, 1);
    for (const spouse of [A, B]) assert.ok(vault.listInstances(spouse).some((it) => it.itemId === 'mirror_round'), `lembrança de ${spouse}`);
    assert.equal(bond.recordActivity(A, 'work', 1, T0 + 3 * DAY), null, 'missão concluída não conta de novo');
    for (const id of bond.KEEPSAKES) assert.ok(getItem(id), `lembrança ${id} existe`);
    console.log('  ✅ 4. Missão da semana concluída com lembrança e amor cheio.');

    // 5. Nova semana, nova missão; date night conta quando a missão é de dates
    const nextWeek = bond.getBondStatus(A, T0 + 7 * DAY).week;
    assert.equal(nextWeek.done, false);
    assert.equal(nextWeek.progress, 0);
    // Força a missão de dates na semana real (o date night usa o relógio de verdade)
    editMarriage((m) => {
      const current = bond.getBondStatus(A).week;
      m.bond.week = { key: current.key, quest: 'dates', target: 2, progress: 0, done: false, keepsake: 'slime_pink' };
    });
    manager.resolveDateNight(marriage.id, true);
    assert.equal(bond.getBondStatus(A).week.progress, 1, 'date night conta na missão');
    console.log('  ✅ 5. Semana nova e date night na missão.');

    // 6. Níveis com nome e conquistas com título para as duas pessoas
    editMarriage((m) => {
      m.bond.xp = bond.LEVEL_XP[2];
    });
    assert.equal(bond.bondLevelOf(A), 3);
    assert.equal(achievements.collectStats(A).bondLevel, 3);
    for (const spouse of [A, B]) {
      const granted = achievements.checkAndGrant(spouse);
      assert.ok(granted.some((g) => g.entry.id === 'bond_3'), `conquista bond_3 de ${spouse}`);
      assert.ok(economy.getUserAccount(spouse).titles.includes('laco_firme'));
    }
    editMarriage((m) => {
      m.bond.xp = bond.LEVEL_XP[9] - 5;
      m.bond.daily = {};
    });
    result = bond.doGesture(A, 'hug', T0 + 10 * DAY);
    assert.deepEqual(result.levelUps, [10]);
    assert.equal(bond.getBondStatus(A, T0 + 10 * DAY).nextLevelXp, null, 'nível máximo');
    assert.equal(bond.LEVEL_NAMES.length, bond.LEVEL_XP.length);
    console.log('  ✅ 6. Níveis com nome e títulos pelas conquistas.');

    // 7. Telas PT/EN e botões
    for (const locale of ['pt-BR', 'en-US']) {
      const lang = locale.startsWith('pt') ? 'pt' : 'en';
      const view = bondViews.buildBondView({ viewerId: B, source: { locale }, now: T0 + 10 * DAY });
      assert.equal(view.embeds[0].data.title, t('bond.title', lang));
      assert.ok(!view.embeds[0].data.description.includes('{'));
      const buttons = view.components[0].components;
      assert.equal(buttons.length, 5);
      assert.ok(buttons.slice(0, 4).every((b) => b.data.custom_id.startsWith(`bond:g:${B}:`) && !b.data.disabled), 'B ainda não fez o gesto');
      const afterA = bondViews.buildBondView({ viewerId: A, source: { locale }, now: T0 + 10 * DAY });
      assert.ok(afterA.components[0].components.slice(0, 4).every((b) => b.data.disabled), 'A já fez o gesto');
      const single = bondViews.buildBondView({ viewerId: C, source: { locale } });
      assert.equal(single.components.length, 0);
      for (const reason of ['not_married', 'done_today', 'invalid', 'not_yours']) assert.ok(!t(`bond.reasons.${reason}`, lang).startsWith('bond.'));
      for (const quest of bond.WEEKLY_QUESTS) assert.ok(!t(`bond.quests.${quest.id}`, lang, { target: 1 }).startsWith('bond.'));
      const notice = bondViews.gestureNotice({ ok: true, gesture: 'coffee', spouseId: A, synced: true, streak: 3, levelUps: [4], weekly: { completed: true, keepsake: 'vanity' } }, lang);
      assert.ok(!notice.includes('{') && notice.includes(`<@${A}>`));
    }
    let replied = null;
    await bondViews.handleBondInteraction({ customId: `bond:g:${A}:hug`, user: { id: B }, locale: 'pt-BR', isButton: () => true, reply: async (p) => { replied = p; } });
    assert.equal(replied.content, t('bond.reasons.not_yours', 'pt'));
    let updated = null;
    await bondViews.handleBondInteraction({ customId: `bond:g:${B}:note`, user: { id: B }, locale: 'en-US', isButton: () => true, update: async (p) => { updated = p; } });
    assert.ok(updated.embeds[0].data.description.startsWith('> 💌'), 'gesto pelo botão');
    console.log('  ✅ 7. Tela PT/EN, botões e gestos pelo botão.');

    // 8. Painel do casamento mostra o Laço e abre a tela; "carinho" é o abraço do dia
    let payload = null;
    const interaction = { user: { id: A }, locale: 'pt-BR', options: { getSubcommand: () => 'status' }, editReply: async (p) => { payload = p; } };
    await pyCasamento.executeSlash({ interaction });
    assert.ok(payload.embeds[0].data.fields.some((f) => f.name === t('bond.fieldName', 'pt')));
    assert.equal(payload.components[0].components[0].data.custom_id, `bond:home:${A}`);
    await pyCasamento.executeSlash({ interaction: { ...interaction, options: { getSubcommand: () => 'bond' } } });
    assert.equal(payload.embeds[0].data.title, t('bond.title', 'pt'));
    await pyCasamento.executeSlash({ interaction: { ...interaction, user: { id: C }, options: { getSubcommand: () => 'affection' } } });
    assert.equal(payload, t('marriage.notMarried', 'pt'));
    const json = pyCasamento.data.toJSON();
    assert.ok(json.options.some((o) => o.name === 'bond' && o.description_localizations['pt-BR']));
    console.log('  ✅ 8. Painel do casamento com o Laço e o abraço do dia.');

    // 9. Divórcio leva o Laço junto
    assert.equal(manager.endMarriage(A).ended, true);
    assert.equal(bond.getBondStatus(A), null);
    assert.equal(bond.bondLevelOf(B), 0);
    assert.ok(economy.getUserAccount(A).titles.includes('laco_firme'), 'título conquistado fica');
    console.log('  ✅ 9. Divórcio encerra o Laço e os títulos ficam.');

    console.log('🎉 [TEST] Força do Laço passou com 100% de sucesso!');
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    console.error('❌ [TEST] Falha na Força do Laço:', error);
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }
})();
