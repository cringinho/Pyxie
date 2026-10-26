const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Catacumbas em threads: thread própria por descida, aviso 5 minutos antes do game over,
 * game over por inatividade (20 min) com resumo por DM e thread trancada, e os rankings de
 * sempre, da semana e do servidor. Estado da dungeon em diretório temporário; as moedinhas
 * ficam no data/economy.json real com contas de teste apagadas no fim.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-dungeon-threads-'));
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');
process.env.PYXIE_DATA_DIR = tmpDir;

const store = require('../src/modules/dungeon/dungeonStore');
const views = require('../src/modules/dungeon/dungeonViews');
const idle = require('../src/modules/dungeon/dungeonIdle');
const cmd = require('../src/modules/dungeon/commands/pyDungeon');
const economy = require('../src/services/economy');
const { t } = require('../src/utils/i18n');

store._setDataFileForTests(path.join(tmpDir, 'dungeon.json'));
store.setSettingsProvider(() => ({ ticket: 50, dailyEntries: 5, runPayoutCap: 500, dailyPayoutCap: 600 }));

const MIN = 60 * 1000;
const runId = Date.now();
const A = `user_test_dthread_a_${runId}`;
const B = `user_test_dthread_b_${runId}`;
const C = `user_test_dthread_c_${runId}`;
const t0 = Date.UTC(2026, 9, 21, 15, 0, 0); // quarta-feira

function setGold(userId, gold) {
  const file = path.join(tmpDir, 'dungeon.json');
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  const run = state.runs[state.players[userId].activeRunId];
  run.player.gold = gold;
  fs.writeFileSync(file, JSON.stringify(state));
}

console.log('🧵 Iniciando testes das Catacumbas em threads...');

(async () => {
  try {
    // 1. Configuração: 20 minutos por padrão, ajustável entre 5 e 1440
    assert.equal(store.DEFAULT_SETTINGS.idleMinutes, 20);
    assert.deepEqual(store.sanitizeSettings({ idleMinutes: 2 }), { idleMinutes: 5 });
    assert.equal(store.DEFAULT_SETTINGS.abandonAfterHours, undefined, 'O limite de 48h saiu');
    console.log('  ✅ 1. Game over por inatividade configurável (20 min por padrão).');

    // 2. Aviso 5 minutos antes, uma vez por pausa, e game over aos 20 minutos
    economy.setUserBalance(A, 200);
    const started = store.startRun(A, { lang: 'pt', now: t0, guildId: 'guild_x' });
    assert.equal(started.ok, true);
    assert.equal(started.run.guildId, 'guild_x');
    store.setRunThread(A, started.run.id, '900000000000000001');
    setGold(A, 300);

    assert.deepEqual(store.collectIdleWarnings(t0 + 10 * MIN), [], 'Sem aviso antes dos 15 minutos');
    const warnings = store.collectIdleWarnings(t0 + 16 * MIN);
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].threadId, '900000000000000001');
    assert.equal(warnings[0].minutesLeft, 4);
    assert.deepEqual(store.collectIdleWarnings(t0 + 17 * MIN), [], 'Um aviso por pausa');

    assert.equal(store.closeIdleRuns(t0 + 19 * MIN), 0, 'Ainda dentro dos 20 minutos');
    assert.equal(store.closeIdleRuns(t0 + 21 * MIN), 1);
    assert.equal(store.getActiveRun(A, t0 + 22 * MIN), null);
    assert.equal(economy.getBalance(A), 150 + 30, 'O Astaroth salva 10% do ouro');
    const notices = store.takeNotices();
    assert.equal(notices.length, 1);
    assert.equal(notices[0].userId, A);
    assert.equal(notices[0].threadId, '900000000000000001');
    assert.equal(notices[0].settlement.payout, 30);
    assert.equal(notices[0].idleMinutes, 20);
    assert.deepEqual(store.takeNotices(), [], 'Cada aviso sai da fila uma vez');
    console.log('  ✅ 2. Aviso aos 15 min, game over aos 20, salvamento de 10% e fila de avisos.');

    // 3. Resumo por DM e thread fechada; sem DM, o resumo vai na thread
    store.startRun(A, { lang: 'en', now: t0 + 30 * MIN, guildId: 'guild_x' });
    store.setRunThread(A, store.getActiveRun(A, t0 + 30 * MIN).id, '900000000000000002');
    const sent = { dm: [], thread: [], locked: 0, archived: 0 };
    const thread = {
      id: '900000000000000002',
      archived: false,
      isThread: () => true,
      send: async (p) => sent.thread.push(p),
      setLocked: async () => { sent.locked += 1; },
      setArchived: async (v) => { if (v) sent.archived += 1; },
    };
    let dmOpen = true;
    const client = {
      users: { fetch: async () => ({ send: async (p) => { if (!dmOpen) throw new Error('Cannot send messages to this user'); sent.dm.push(p); } }) },
      channels: { fetch: async (id) => (id === thread.id ? thread : null) },
    };
    await idle.sweep(client, t0 + 46 * MIN);
    assert.equal(sent.thread.length, 1, 'Aviso de 5 minutos na thread');
    assert.ok(sent.thread[0].content.includes(`<@${A}>`));
    assert.deepEqual(sent.thread[0].allowedMentions.users, [A], 'Só a dona da descida é marcada');
    const results = await idle.sweep(client, t0 + 51 * MIN);
    assert.deepEqual(results, [{ dmSent: true, thread: true }]);
    assert.equal(sent.dm.length, 1);
    const dmEmbed = sent.dm[0].embeds[0].toJSON();
    assert.equal(dmEmbed.title, t('dungeon.idle.title', 'en'));
    assert.ok(dmEmbed.description.includes('**20 minutes**'));
    assert.ok(sent.thread[1].content.includes('sent the summary'));
    assert.equal(sent.locked, 1);
    assert.equal(sent.archived, 1);

    dmOpen = false;
    store.startRun(A, { lang: 'pt', now: t0 + 60 * MIN, guildId: 'guild_x' });
    store.setRunThread(A, store.getActiveRun(A, t0 + 60 * MIN).id, '900000000000000002');
    const closedDm = await idle.sweep(client, t0 + 85 * MIN);
    assert.deepEqual(closedDm, [{ dmSent: false, thread: true }]);
    const last = sent.thread[sent.thread.length - 1];
    assert.equal(last.embeds.length, 1, 'Resumo na thread quando a DM está fechada');
    console.log('  ✅ 3. Resumo por DM, thread trancada e arquivada (ou resumo na thread sem DM).');

    // 4. Rankings: de sempre, da semana e do servidor
    const file = path.join(tmpDir, 'dungeon.json');
    const state = JSON.parse(fs.readFileSync(file, 'utf8'));
    const week = store.brtWeekKey(t0);
    state.players[B] = { stats: { runs: 4, bestFloor: 5, victories: 1, kills: 30, bestPayout: 400 }, weekly: { week, runs: 2, bestFloor: 3, victories: 0, kills: 9, coins: 80 }, guilds: { guild_y: t0 } };
    state.players[C] = { stats: { runs: 2, bestFloor: 2, victories: 0, kills: 5, bestPayout: 60 }, weekly: { week, runs: 2, bestFloor: 4, victories: 0, kills: 12, coins: 90 }, guilds: { guild_x: t0 } };
    fs.writeFileSync(file, JSON.stringify(state));
    const isTest = economy.isTestUser;
    economy.isTestUser = () => false; // as contas deste teste entram no ranking
    try {
      const all = store.getLeaderboard({ scope: 'all', now: t0 });
      assert.equal(all[0].userId, B, 'De sempre: andar mais fundo');
      const weekly = store.getLeaderboard({ scope: 'week', now: t0 });
      assert.equal(weekly[0].userId, C, 'Semana: andar mais fundo desde segunda');
      const nextWeek = store.getLeaderboard({ scope: 'week', now: t0 + 7 * 24 * 60 * MIN });
      assert.equal(nextWeek.length, 0, 'A semana vira na segunda');
      const guildX = store.getLeaderboard({ scope: 'week', guildId: 'guild_x', now: t0 });
      assert.deepEqual(guildX.map((r) => r.userId).sort(), [A, C].sort(), 'Servidor: só quem desceu a partir dele');

      const source = { guildId: 'guild_x', guild: { id: 'guild_x', name: 'Servidor X' }, lang: 'pt', user: { id: C } };
      const hall = views.buildHallView(source, { what: 'hallw', ownerId: C, now: t0 });
      assert.equal(hall.embeds[0].data.title, t('dungeon.hall.titleWeek', 'pt'));
      const tabs = hall.components[0].toJSON().components;
      assert.deepEqual(tabs.map((c) => c.custom_id), [`dgn:l:${C}:halla`, `dgn:l:${C}:hallw`, `dgn:l:${C}:hallg`]);
      assert.equal(tabs[1].disabled, true, 'Aba atual desligada');
      const guildHall = views.buildHallView(source, { what: 'hallg', ownerId: C, now: t0 });
      assert.ok(guildHall.embeds[0].data.description.includes('Servidor X'));
      const dmHall = views.buildHallView({ lang: 'en', user: { id: C } }, { what: 'hallg', ownerId: C, now: t0 });
      assert.equal(dmHall.components[0].toJSON().components.length, 2, 'Sem servidor, sem aba de servidor');
    } finally {
      economy.isTestUser = isTest;
    }
    console.log('  ✅ 4. Rankings de sempre, da semana (zera na segunda) e do servidor.');

    // 5. Botão Iniciar abre a thread, manda a descida nela e deixa o link no canal
    economy.setUserBalance(B, 200);
    const calls = [];
    const created = [];
    const channel = {
      isThread: () => false,
      permissionsFor: () => ({ has: () => true }),
      threads: {
        create: async (opts) => {
          const th = {
            id: '900000000000000777',
            guildId: 'guild_x',
            opts,
            members: { add: async (id) => calls.push(['add', id]) },
            send: async (p) => calls.push(['threadSend', p]),
            isThread: () => true,
          };
          created.push(th);
          return th;
        },
      },
    };
    const interaction = {
      customId: `dgn:l:${B}:start`,
      user: { id: B, username: 'bea' },
      member: { displayName: 'Bea' },
      guild: { id: 'guild_x', name: 'Servidor X', members: { me: {} } },
      guildId: 'guild_x',
      channel,
      channelId: '800',
      lang: 'pt',
      isButton: () => true,
      deferred: false,
      replied: false,
      deferUpdate: async () => calls.push(['deferUpdate']),
      editReply: async (p) => calls.push(['editReply', p]),
      update: async (p) => calls.push(['update', p]),
      reply: async (p) => calls.push(['reply', p]),
    };
    await cmd.handleDungeonInteraction(interaction);
    assert.deepEqual(calls.map((c) => c[0]), ['deferUpdate', 'add', 'threadSend', 'editReply']);
    assert.equal(created[0].opts.name, '🕯️ Catacumbas de Bea');
    assert.equal(created[0].opts.autoArchiveDuration, 60);
    assert.equal(calls[2][1].files.length, 1, 'Cena pixel art vai para a thread');
    assert.ok(!('attachments' in calls[2][1]), 'Mensagem nova não leva campos de edição');
    assert.ok(calls[3][1].content.includes('<#900000000000000777>'));
    assert.equal(calls[3][1].components[0].toJSON().components[0].url, 'https://discord.com/channels/guild_x/900000000000000777');
    const run = store.getActiveRun(B);
    assert.equal(run.threadId, '900000000000000777');
    assert.equal(run.guildId, 'guild_x');

    // Sem permissão para criar threads, a descida fica na própria mensagem
    const noPerm = { ...interaction, customId: `dgn:l:${C}:start`, user: { id: C, username: 'cy' }, channel: { ...channel, permissionsFor: () => ({ has: () => false }) } };
    economy.setUserBalance(C, 200);
    calls.length = 0;
    await cmd.handleDungeonInteraction(noPerm);
    assert.deepEqual(calls.map((c) => c[0]), ['update']);
    console.log('  ✅ 5. Iniciar abre a thread (ou segue na mensagem sem permissão).');

    console.log('✨ Catacumbas em threads validadas.');
  } catch (err) {
    console.error('❌ Falha nos testes das Catacumbas em threads:', err);
    process.exitCode = 1;
  } finally {
    store.setSettingsProvider(null);
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})();
