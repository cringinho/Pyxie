const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Catacumbas em grupo: túmulo deixado por quem morre, saque dos espólios, oração que traz a
 * pessoa de volta (até 24h e sem descida nova), descida revivida esperando a dona voltar,
 * ajuda de quem assiste à luta e os títulos que evoluem em 1/10/50/100.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-dungeon-coop-'));
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');
process.env.PYXIE_DATA_DIR = tmpDir;

const engine = require('../src/modules/dungeon/dungeonEngine');
const store = require('../src/modules/dungeon/dungeonStore');
const views = require('../src/modules/dungeon/dungeonViews');
const cmd = require('../src/modules/dungeon/commands/pyDungeon');
const economy = require('../src/services/economy');
const achievements = require('../src/services/achievements');
const { ACHIEVEMENT_TITLES, seriesTitles } = require('../src/data/achievementTitles');
const { t } = require('../src/utils/i18n');

const FILE = path.join(tmpDir, 'dungeon.json');
store._setDataFileForTests(FILE);
store.setSettingsProvider(() => ({ ticket: 50, dailyEntries: 9, runPayoutCap: 5000, dailyPayoutCap: 20000 }));

const runId = Date.now();
const A = `user_test_coop_a_${runId}`; // morre e é revivida
const B = `user_test_coop_b_${runId}`; // acha o túmulo, saqueia e reza
const C = `user_test_coop_c_${runId}`; // morre e começa outra descida
const D = `user_test_coop_d_${runId}`; // ajuda
const E = `user_test_coop_e_${runId}`;
const HOUR = 60 * 60 * 1000;
const t0 = Date.now() - HOUR; // o menu usa o relógio real

const readState = () => JSON.parse(fs.readFileSync(FILE, 'utf8'));
const writeState = (state) => fs.writeFileSync(FILE, JSON.stringify(state));
function editRun(userId, fn) {
  const state = readState();
  const run = state.runs[state.players[userId].activeRunId];
  fn(run, state);
  writeState(state);
  return run;
}

/** Faz a pessoa morrer no andar 1 com o ouro pedido. */
function dieWith(userId, gold, now) {
  editRun(userId, (run) => {
    run.player.gold = gold;
    run.player.hp = 1;
    run.player.def = 0;
    engine._internals.startCombat(run, 'rat', { roomKey: run.map.pos, kind: 'monster' });
    // O rato não pode cair antes (uma vitória somaria ouro e mudaria o túmulo)
    run.combat.hp = 999;
  });
  for (let i = 0; i < 60; i++) {
    const run = store.getActiveRun(userId, now);
    if (!run) return;
    if (run.phase !== 'combat') {
      editRun(userId, (r) => {
        r.player.hp = 1;
        engine._internals.startCombat(r, 'rat', { roomKey: r.map.pos, kind: 'monster' });
        r.combat.hp = 999;
      });
      continue;
    }
    store.performAction(userId, run.id, run.step, 'attack', null, now);
  }
  throw new Error('não morreu');
}

console.log('🪦 Iniciando testes das Catacumbas em grupo...');

(async () => {
  const realRandom = Math.random;
  try {
    for (const u of [A, B, C, D, E]) economy.setUserBalance(u, 1000);

    // 1. Morte deixa túmulo com espólios (metade do ouro perdido)
    assert.equal(store.startRun(A, { now: t0, guildId: 'g1' }).ok, true);
    dieWith(A, 200, t0 + 1000);
    const graves = store.getGraves();
    assert.equal(graves.length, 1);
    const grave = graves[0];
    assert.equal(grave.ownerId, A);
    assert.equal(grave.floor, 1);
    assert.equal(grave.goldLost, 180, '200 de ouro − 20 de resgate');
    assert.equal(grave.lootLeft, 90, 'Metade do ouro perdido vira espólio');
    console.log('  ✅ 1. Morte deixa túmulo com espólios.');

    // 2. Quem desce no mesmo andar pode achar o túmulo (uma vez só)
    Math.random = () => 0.1;
    const started = store.startRun(B, { now: t0 + 2000, guildId: 'g1' });
    Math.random = realRandom;
    const graveRoom = Object.entries(started.run.map.rooms).find(([, room]) => room.type === 'grave');
    assert.ok(graveRoom, 'Túmulo injetado no andar');
    assert.equal(graveRoom[1].grave.lootShare, 45, 'Cada saque leva 25% do ouro perdido');
    assert.equal(graveRoom[1].grave.revivable, true);
    assert.ok(store.getGraves()[0].visitedBy.includes(B));

    // B entra na sala do túmulo
    const [graveKey, room] = graveRoom;
    editRun(B, (run) => {
      run.map.pos = graveKey;
      run.event = { type: 'grave', roomKey: graveKey, grave: room.grave, looted: false, prayed: false };
      run.phase = 'event';
    });
    let runB = store.getActiveRun(B, t0 + 3000);
    const embed = views.buildRunEmbed(runB, { lang: 'pt' }, 'pt').toJSON();
    assert.equal(embed.title, t('dungeon.titles.grave', 'pt'));
    assert.ok(embed.description.includes(`<@${A}>`));
    const ids = views.buildRunComponents(runB, 'pt').flatMap((r) => r.toJSON().components).map((c) => c.custom_id);
    assert.ok(ids.some((id) => id.endsWith(':loot')) && ids.some((id) => id.endsWith(':revive')));

    const goldBefore = runB.player.gold;
    let res = store.performAction(B, runB.id, runB.step, 'loot', null, t0 + 4000);
    assert.equal(res.ok, true);
    assert.equal(res.run.player.gold, goldBefore + 45);
    assert.equal(store.getGraves()[0].lootLeft, 45);
    console.log('  ✅ 2. Túmulo aparece no andar e o saque sai do espólio real.');

    // 3. Rezar traz A de volta: descida pausada, metade da vida, ouro que sobrou
    runB = store.getActiveRun(B, t0 + 5000);
    res = store.performAction(B, runB.id, runB.step, 'revive', null, t0 + 5000);
    assert.equal(res.ok, true);
    assert.ok(res.run.log.some((l) => l.k === 'reviveWorked'));
    const revived = store.getActiveRun(A, t0 + 6000);
    assert.ok(revived, 'A voltou');
    assert.equal(revived.phase, 'explore');
    assert.equal(revived.awaitingReturn, true);
    assert.equal(revived.player.hp, Math.ceil(revived.player.maxHp / 2));
    assert.equal(revived.player.gold, 135, '180 perdido − 45 saqueado');
    const statsB = store.getPlayerStats(B);
    assert.equal(statsB.revives, 1);
    assert.equal(statsB.looted, 45);
    assert.equal(store.getGraves().length, 0, 'Túmulo some depois da volta');
    const notices = store.takeReviveNotices();
    assert.equal(notices.length, 1);
    assert.equal(notices[0].ownerId, A);
    const dm = views.buildReviveNoticeView(notices[0]).embeds[0].toJSON();
    assert.ok(dm.description.includes(`<@${B}>`));

    // A descida revivida espera a dona por até 24h
    store.closeIdleRuns(t0 + 2 * HOUR); // fecha só a descida parada de B
    assert.ok(store.getActiveRun(A, t0 + 2 * HOUR), 'A descida revivida não fecha em 20 minutos');
    assert.equal(store.getActiveRun(B, t0 + 2 * HOUR), null);
    const lobby = views.buildLobbyView({ id: A }, { lang: 'pt' });
    assert.ok(lobby.embeds[0].data.description.includes(t('dungeon.lobby.revived', 'pt')));
    const back = store.getActiveRun(A, t0 + 3 * HOUR);
    const moved = engine.getAvailableActions(back).find((a) => a.id === 'move' && a.enabled);
    res = store.performAction(A, back.id, back.step, 'move', moved.arg, t0 + 3 * HOUR);
    assert.equal(res.ok, true);
    assert.equal(store.getActiveRun(A, t0 + 3 * HOUR).awaitingReturn, false, 'Voltou a jogar: tempo normal');
    console.log('  ✅ 3. Oração revive com metade da vida e o ouro restante; a descida espera a dona.');

    // 4. Sem volta: descida nova depois da morte (ou mais de 24h)
    assert.equal(store.startRun(C, { now: t0, guildId: 'g1' }).ok, true);
    dieWith(C, 100, t0 + 1000);
    const graveC = store.getGraves().find((g) => g.ownerId === C);
    assert.ok(graveC);
    const state = readState();
    assert.equal(store.canRevive(state, state.graves[graveC.id], t0 + 2000), true);
    assert.equal(store.startRun(C, { now: t0 + 3000, guildId: 'g1' }).ok, true, 'C começou outra descida');
    const state2 = readState();
    assert.equal(store.canRevive(state2, state2.graves[graveC.id], t0 + 4000), false, 'Quem já desceu de novo não volta');
    assert.equal(store.canRevive(state2, { ...state2.graves[graveC.id], runsAtDeath: state2.players[C].stats.runs }, t0 + 25 * HOUR), false, 'Depois de 24h não volta');
    console.log('  ✅ 4. Regra das 24h e da descida nova.');

    // 5. Ajuda de quem assiste: uma vez por pessoa, até 2, nunca a dona
    assert.equal(store.startRun(E, { now: t0, guildId: 'g1' }).ok, true);
    const fightRun = editRun(E, (run) => {
      run.player.hp = run.player.maxHp;
      engine._internals.startCombat(run, 'rat', { roomKey: run.map.pos, kind: 'monster' });
    });
    const tag = views.runTag(fightRun);
    const combatRows = views.buildRunComponents(store.getActiveRun(E, t0), 'pt').flatMap((r) => r.toJSON().components);
    assert.ok(combatRows.some((c) => c.custom_id === `dgn:h:${E}:${tag}`), 'Botão de ajuda na luta em servidor');
    assert.equal(store.helpRun(E, E, tag, t0).reason, 'self');
    const help1 = store.helpRun(D, E, tag, t0 + 1000);
    assert.equal(help1.ok, true);
    assert.equal(help1.kind, 'hit', 'Com vida cheia, ajuda batendo');
    assert.ok(help1.run.combat.hp >= 1, 'A ajuda nunca termina a luta sozinha');
    assert.equal(store.helpRun(D, E, tag, t0 + 2000).reason, 'already');
    assert.equal(store.helpRun(B, E, tag, t0 + 3000).ok, true);
    assert.equal(store.helpRun(C, E, tag, t0 + 4000).reason, 'limit');
    assert.equal(store.getPlayerStats(D).helps, 1);

    const calls = [];
    const mock = (customId, userId) => ({
      customId,
      user: { id: userId },
      lang: 'pt',
      isButton: () => true,
      reply: async (p) => calls.push(['reply', p]),
      update: async (p) => calls.push(['update', p]),
    });
    await cmd.handleDungeonInteraction(mock(`dgn:h:${E}:${tag}`, D));
    assert.equal(calls[0][0], 'reply');
    assert.equal(calls[0][1].content, t('dungeon.coop.already', 'pt'));
    console.log('  ✅ 5. Ajuda de quem assiste, com limites e sem terminar a luta.');

    // 6. Títulos que evoluem em 1/10/50/100
    assert.deepEqual(seriesTitles('revive').map((x) => x.style), ['spark', 'arcane', 'eclipse', 'celestial']);
    assert.deepEqual(seriesTitles('ally').map((x) => x.style), ['spark', 'arcane', 'eclipse', 'celestial']);
    const statsAll = achievements.collectStats(B);
    assert.equal(statsAll.dungeonRevives, 1);
    const unlocked = achievements.checkAndGrant(B);
    assert.ok(unlocked.some((u) => (u.entry?.id || u.id) === 'revive_1'), 'Primeira oração desbloqueia o título');
    assert.ok(ACHIEVEMENT_TITLES.prece_sincera && ACHIEVEMENT_TITLES.santidade_catacumbas);
    console.log('  ✅ 6. Títulos de oração e de ajuda evoluem em 4 degraus.');

    console.log('✨ Catacumbas em grupo validadas.');
  } catch (err) {
    console.error('❌ Falha nos testes das Catacumbas em grupo:', err);
    process.exitCode = 1;
  } finally {
    Math.random = realRandom;
    store.setSettingsProvider(null);
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})();
