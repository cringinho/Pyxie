const path = require('path');
const { rollDrops } = require('./dungeonDrops');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const { getBrtDateKey, msUntilNextBrtMidnight } = require('../../utils/brtDate');
const economy = require('../../services/economy');
const engine = require('./dungeonEngine');
const { TALENTS } = require('./dungeonData');

/**
 * Persistência e economia das Catacumbas de Veludo (data/dungeon.json, escrita atômica).
 *
 * Travas econômicas (AGENTS.md §5):
 * - Ticket de entrada debitado antes de criar o run; se a gravação falhar, o ticket é devolvido.
 * - Limite de entradas por dia (BRT), teto de pagamento por run e teto diário de pagamento.
 * - Cada ação carrega o `step` do run: botões antigos ou cliques duplos são recusados.
 * - O run é removido do arquivo ANTES do crédito: um segundo clique nunca paga de novo.
 * - Ecos (talentos) nunca viram moedinhas.
 * - Descida parada há mais de `idleMinutes` (20 por padrão) vira game over: o Astaroth resgata
 *   10% do ouro, o resumo vai por DM e a thread da descida é fechada (fila `notices`).
 */

let DATA_FILE = process.env.DUNGEON_DATA_PATH || path.join(__dirname, '..', '..', '..', 'data', 'dungeon.json');

const DEFAULT_SETTINGS = {
  ticket: 50,
  dailyEntries: 3,
  runPayoutCap: 500,
  dailyPayoutCap: 600,
  idleMinutes: 20,
};

// Faixas aceitas para cada ajuste (painel /admin e modulesConfig.json)
const SETTINGS_BOUNDS = {
  ticket: [1, 1000],
  dailyEntries: [1, 20],
  runPayoutCap: [0, 5000],
  dailyPayoutCap: [0, 20000],
  idleMinutes: [5, 1440],
};

let settingsProvider = null;

/** Lê os ajustes do criador em data/modulesConfig.json (modules.dungeon.data), nos processos do bot e da web. */
function readModuleConfigData() {
  const file = process.env.MODULES_CONFIG_PATH || path.join(__dirname, '..', '..', '..', 'data', 'modulesConfig.json');
  const cfg = readJson(file, {});
  return cfg.modules?.dungeon?.data || {};
}

/** Permite trocar a fonte dos ajustes (o módulo injeta ctx.getConfig; os testes injetam valores fixos). */
function setSettingsProvider(fn) {
  settingsProvider = typeof fn === 'function' ? fn : null;
}

/** Mantém só chaves conhecidas, inteiras e dentro das faixas. */
function sanitizeSettings(input = {}) {
  const clean = {};
  for (const [key, [min, max]] of Object.entries(SETTINGS_BOUNDS)) {
    const value = Number(input[key]);
    if (input[key] === undefined || input[key] === '' || !Number.isFinite(value)) continue;
    clean[key] = Math.min(max, Math.max(min, Math.floor(value)));
  }
  return clean;
}

function getSettings() {
  let custom = {};
  try {
    custom = (settingsProvider ? settingsProvider() : readModuleConfigData()) || {};
  } catch (_) {
    custom = {};
  }
  return { ...DEFAULT_SETTINGS, ...sanitizeSettings(custom) };
}

function emptyTotals() {
  return { runs: 0, coinsIn: 0, coinsOut: 0, deaths: 0, extractions: 0, victories: 0, forfeits: 0, abandoned: 0, echoesEarned: 0 };
}

function loadState() {
  const data = readJson(DATA_FILE, {});
  return {
    players: data.players && typeof data.players === 'object' ? data.players : {},
    runs: data.runs && typeof data.runs === 'object' ? data.runs : {},
    totals: { ...emptyTotals(), ...(data.totals || {}) },
    notices: Array.isArray(data.notices) ? data.notices : [],
  };
}

/** Semana do ranking: começa na segunda-feira 00:00 de Brasília (chave = data da segunda). */
function brtWeekKey(now = Date.now()) {
  const d = new Date(now - 3 * 60 * 60 * 1000);
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - sinceMonday)).toISOString().slice(0, 10);
}

/** Números da semana atual da pessoa (zera sozinho quando a semana vira). */
function weeklyStats(player, now) {
  const week = brtWeekKey(now);
  if (!player.weekly || player.weekly.week !== week) {
    player.weekly = { week, runs: 0, bestFloor: 0, victories: 0, kills: 0, coins: 0 };
  }
  return player.weekly;
}

function saveState(state) {
  return writeJsonAtomic(DATA_FILE, state);
}

/** Normaliza o jogador no próprio objeto do estado: chamadas repetidas devolvem a mesma referência. */
function getPlayer(state, userId) {
  const id = String(userId);
  if (!state.players[id] || typeof state.players[id] !== 'object') state.players[id] = {};
  const player = state.players[id];
  player.echoes = Number(player.echoes) || 0;
  if (!player.talents || typeof player.talents !== 'object') player.talents = {};
  if (!player.entries) player.entries = { date: null, count: 0 };
  if (!player.payouts) player.payouts = { date: null, amount: 0 };
  player.activeRunId = player.activeRunId || null;
  player.pendingPayout = Number(player.pendingPayout) || 0;
  player.lastRun = player.lastRun || null;
  if (!player.stats || typeof player.stats !== 'object') player.stats = {};
  for (const key of ['runs', 'deaths', 'extractions', 'victories', 'bestFloor', 'bestPayout', 'kills', 'coinsWon', 'coinsSpent']) {
    player.stats[key] = Number(player.stats[key]) || 0;
  }
  return player;
}

function todayCounters(player, now) {
  const today = getBrtDateKey(now);
  if (player.entries.date !== today) player.entries = { date: today, count: 0 };
  if (player.payouts.date !== today) player.payouts = { date: today, amount: 0 };
  return today;
}

/** Credita pagamentos que falharam numa liquidação anterior (rede de segurança). */
function flushPendingPayout(state, userId) {
  const player = getPlayer(state, userId);
  if (player.pendingPayout <= 0) return 0;
  const amount = player.pendingPayout;
  player.pendingPayout = 0;
  if (!saveState(state)) {
    player.pendingPayout = amount;
    return 0;
  }
  try {
    economy.addCoins(userId, amount);
    return amount;
  } catch (err) {
    player.pendingPayout = amount;
    saveState(state);
    console.error('[dungeon] Falha ao creditar pagamento pendente:', err.message);
    return 0;
  }
}

/** Fecha a descida parada há mais de idleMinutes como "resgatada pelo Astaroth" (salvamento de 10%). */
function resolveAbandoned(state, userId, now) {
  const player = getPlayer(state, userId);
  const run = player.activeRunId ? state.runs[player.activeRunId] : null;
  if (player.activeRunId && !run) {
    player.activeRunId = null;
    return null;
  }
  if (!run) return null;
  if (now - (Number(run.updatedAt) || 0) < idleLimitMs()) return null;
  run.phase = 'dead';
  run.outcome = 'abandoned';
  return settleRun(state, userId, run, now);
}

function idleLimitMs() {
  return getSettings().idleMinutes * 60 * 1000;
}

function buildSettlement(state, userId, run, now) {
  const settings = getSettings();
  const player = getPlayer(state, userId);
  todayCounters(player, now);

  const gross = engine.computeGrossPayout(run);
  const runCapped = Math.min(gross, settings.runPayoutCap);
  const dailyLeft = Math.max(0, settings.dailyPayoutCap - player.payouts.amount);
  const payout = Math.min(runCapped, dailyLeft);
  let cappedBy = null;
  if (payout < gross) cappedBy = runCapped < gross && runCapped <= dailyLeft ? 'run' : 'daily';
  const echoes = engine.computeEchoes(run);
  const fee = run.outcome === 'extracted' ? engine.lanternFee(run.floor) : 0;
  const newBest = run.floor > (player.stats.bestFloor || 0);

  return {
    outcome: run.outcome,
    floor: run.floor,
    gold: Math.max(0, Math.floor(run.player.gold)),
    gross,
    payout,
    cappedBy,
    fee,
    echoes,
    newBest,
    kills: run.stats.kills,
    rooms: run.stats.rooms,
    drops: rollDrops(run),
  };
}

/** Registra o fim do run no estado (sem gravar). O crédito de moedas acontece depois do save. */
function settleRun(state, userId, run, now) {
  const player = getPlayer(state, userId);
  const settlement = buildSettlement(state, userId, run, now);
  const s = player.stats;
  const t = state.totals;

  player.echoes += settlement.echoes;
  player.payouts.amount += settlement.payout;
  s.bestFloor = Math.max(s.bestFloor || 0, run.floor);
  s.bestPayout = Math.max(s.bestPayout || 0, settlement.payout);
  s.kills = (s.kills || 0) + run.stats.kills;
  s.coinsWon = (s.coinsWon || 0) + settlement.payout;
  if (run.outcome === 'victory') s.victories = (s.victories || 0) + 1;
  else if (run.outcome === 'extracted') s.extractions = (s.extractions || 0) + 1;
  else s.deaths = (s.deaths || 0) + 1;

  const week = weeklyStats(player, now);
  week.bestFloor = Math.max(week.bestFloor, run.floor);
  week.kills += run.stats.kills;
  week.coins += settlement.payout;
  if (run.outcome === 'victory') week.victories += 1;

  t.coinsOut += settlement.payout;
  t.echoesEarned += settlement.echoes;
  if (run.outcome === 'victory') t.victories++;
  else if (run.outcome === 'extracted') t.extractions++;
  else if (run.outcome === 'forfeit') t.forfeits++;
  else if (run.outcome === 'abandoned') t.abandoned++;
  else t.deaths++;

  player.lastRun = { ...settlement, endedAt: now };
  player.activeRunId = null;
  player.pendingPayout += settlement.payout;
  if (settlement.drops.length) {
    player.pendingDrops = [...(player.pendingDrops || []), ...settlement.drops.map((itemId) => ({ itemId, runId: run.id, floor: run.floor }))];
  }
  delete state.runs[run.id];

  // Game over por inatividade: o bot manda o resumo por DM e fecha a thread da descida
  if (run.outcome === 'abandoned') {
    state.notices.push({
      userId: String(userId),
      runId: run.id,
      threadId: run.threadId || null,
      guildId: run.guildId || null,
      lang: run.lang || 'pt',
      floor: run.floor,
      rooms: run.stats.rooms,
      kills: run.stats.kills,
      idleMinutes: getSettings().idleMinutes,
      settlement: { ...settlement },
      endedAt: now,
    });
    state.notices = state.notices.slice(-200);
  }
  return settlement;
}

/**
 * Entrega os itens pendentes no cofre da Casinha. Como as moedas, ficam pendentes no estado
 * da dungeon até a entrega dar certo, então uma queda no meio nunca perde nem duplica item.
 */
function flushPendingDrops(state, userId) {
  const player = getPlayer(state, userId);
  const pending = Array.isArray(player.pendingDrops) ? player.pendingDrops : [];
  if (!pending.length) return [];
  let vault;
  try {
    vault = require('../../services/itemVault');
  } catch (_) {
    return [];
  }
  const delivered = [];
  const remaining = [];
  for (const drop of pending) {
    const result = vault.grantItem(userId, drop.itemId, { source: 'dungeon', detail: `floor ${drop.floor}` });
    if (result.ok) delivered.push(result.instance);
    else if (result.reason === 'save') remaining.push(drop);
  }
  player.pendingDrops = remaining;
  saveState(state);
  return delivered;
}

/** Grava o estado e só então credita as moedas e os itens pendentes da liquidação. */
function commitAndPay(state, userId) {
  if (!saveState(state)) throw new Error('DUNGEON_SAVE_FAILED');
  const paid = flushPendingPayout(state, userId);
  flushPendingDrops(state, userId);
  return paid;
}

function getLobbyStatus(userId, now = Date.now()) {
  const state = loadState();
  const abandoned = resolveAbandoned(state, userId, now);
  if (abandoned) commitAndPay(state, userId);
  else flushPendingPayout(state, userId);

  const settings = getSettings();
  const player = getPlayer(state, userId);
  todayCounters(player, now);
  const run = player.activeRunId ? state.runs[player.activeRunId] : null;
  return {
    settings,
    balance: economy.getBalance(userId),
    entriesUsed: player.entries.count,
    entriesLeft: Math.max(0, settings.dailyEntries - player.entries.count),
    payoutToday: player.payouts.amount,
    payoutLeft: Math.max(0, settings.dailyPayoutCap - player.payouts.amount),
    resetInMs: msUntilNextBrtMidnight(now),
    echoes: player.echoes,
    talents: { ...player.talents },
    stats: { ...player.stats },
    lastRun: player.lastRun,
    abandoned,
    activeRun: run || null,
  };
}

function getActiveRun(userId, now = Date.now()) {
  const state = loadState();
  const abandoned = resolveAbandoned(state, userId, now);
  if (abandoned) {
    commitAndPay(state, userId);
    return null;
  }
  const player = getPlayer(state, userId);
  return player.activeRunId ? state.runs[player.activeRunId] || null : null;
}

/**
 * Cobra o ticket e abre um run novo.
 * @returns {{ ok: boolean, reason?: 'active'|'limit'|'coins'|'save', run?: object, balance?: number }}
 */
function startRun(userId, { lang = 'pt', now = Date.now(), seed = null, guildId = null } = {}) {
  const state = loadState();
  const abandoned = resolveAbandoned(state, userId, now);
  if (abandoned) commitAndPay(state, userId);

  const settings = getSettings();
  const player = getPlayer(state, userId);
  todayCounters(player, now);

  if (player.activeRunId && state.runs[player.activeRunId]) {
    return { ok: false, reason: 'active', run: state.runs[player.activeRunId] };
  }
  if (player.entries.count >= settings.dailyEntries) {
    return { ok: false, reason: 'limit' };
  }

  const payment = economy.spendCoins(userId, settings.ticket);
  if (!payment.spent) return { ok: false, reason: 'coins', balance: payment.balance };

  const run = engine.createRun({ ownerId: userId, lang, talents: player.talents, seed, now });
  run.guildId = guildId ? String(guildId) : null;
  state.runs[run.id] = run;
  if (run.guildId) {
    player.guilds = player.guilds && typeof player.guilds === 'object' ? player.guilds : {};
    player.guilds[run.guildId] = now;
  }
  weeklyStats(player, now).runs += 1;
  player.activeRunId = run.id;
  player.entries.count += 1;
  player.stats.runs = (player.stats.runs || 0) + 1;
  player.stats.coinsSpent = (player.stats.coinsSpent || 0) + settings.ticket;
  state.totals.runs++;
  state.totals.coinsIn += settings.ticket;

  if (!saveState(state)) {
    economy.addCoins(userId, settings.ticket);
    return { ok: false, reason: 'save' };
  }
  return { ok: true, run, balance: payment.balance };
}

/**
 * Executa uma ação do run validando dono, run ativo e o step do botão.
 * @returns {{ ok: boolean, reason?: string, run?: object, settlement?: object, balance?: number }}
 */
function performAction(userId, runId, step, action, arg = null, now = Date.now()) {
  const state = loadState();
  const player = getPlayer(state, userId);
  const run = state.runs[runId];
  if (!run || player.activeRunId !== runId || run.ownerId !== String(userId)) {
    return { ok: false, reason: 'missing' };
  }
  if (Number(step) !== run.step) return { ok: false, reason: 'stale', run };

  const result = engine.applyAction(run, action, arg, now);
  if (!result.ok) return { ok: false, reason: result.reason, run };

  let settlement = null;
  if (engine.isTerminal(run)) {
    settlement = settleRun(state, userId, run, now);
    commitAndPay(state, userId);
    return { ok: true, run, settlement, balance: economy.getBalance(userId) };
  }
  if (!saveState(state)) return { ok: false, reason: 'save', run };
  return { ok: true, run, settlement };
}

/** Liga a descida à thread aberta para ela (o fechamento por inatividade arquiva a thread). */
function setRunThread(userId, runId, threadId) {
  const state = loadState();
  const run = state.runs[runId];
  if (!run || run.ownerId !== String(userId)) return false;
  run.threadId = threadId ? String(threadId) : null;
  return saveState(state);
}

/**
 * Fecha todas as descidas paradas há mais de idleMinutes (rodado a cada minuto pelo módulo).
 * Paga o salvamento de cada pessoa depois de gravar e devolve quantas foram fechadas.
 */
function closeIdleRuns(now = Date.now()) {
  const state = loadState();
  const limit = idleLimitMs();
  const owners = [];
  for (const run of Object.values(state.runs)) {
    if (now - (Number(run.updatedAt) || 0) < limit) continue;
    run.phase = 'dead';
    run.outcome = 'abandoned';
    settleRun(state, run.ownerId, run, now);
    owners.push(run.ownerId);
  }
  if (!owners.length) return 0;
  if (!saveState(state)) throw new Error('DUNGEON_SAVE_FAILED');
  for (const userId of new Set(owners)) {
    flushPendingPayout(state, userId);
    flushPendingDrops(state, userId);
  }
  return owners.length;
}

// A thread recebe um aviso 5 minutos antes do game over (uma vez por pausa)
const IDLE_WARNING_MS = 5 * 60 * 1000;

/** Descidas em thread perto do game over que ainda não receberam o aviso desta pausa. */
function collectIdleWarnings(now = Date.now()) {
  const state = loadState();
  const limit = idleLimitMs();
  const warnAt = Math.max(limit - IDLE_WARNING_MS, Math.floor(limit / 2));
  const warnings = [];
  for (const run of Object.values(state.runs)) {
    if (!run.threadId) continue;
    const idle = now - (Number(run.updatedAt) || 0);
    if (idle < warnAt || idle >= limit || run.idleWarnedFor === run.updatedAt) continue;
    run.idleWarnedFor = run.updatedAt;
    warnings.push({
      userId: run.ownerId,
      threadId: run.threadId,
      lang: run.lang || 'pt',
      minutesLeft: Math.max(1, Math.ceil((limit - idle) / 60000)),
    });
  }
  if (warnings.length && !saveState(state)) return [];
  return warnings;
}

/** Retira da fila os avisos de game over por inatividade (cada um é entregue uma vez). */
function takeNotices() {
  const state = loadState();
  if (!state.notices.length) return [];
  const notices = state.notices;
  state.notices = [];
  if (!saveState(state)) return [];
  return notices;
}

/**
 * Ranking das Catacumbas. scope 'all' (recorde de sempre) ou 'week' (semana atual, desde segunda
 * 00:00 BRT); com guildId, só quem já desceu a partir daquele servidor.
 */
function getLeaderboard({ scope = 'all', guildId = null, now = Date.now() } = {}) {
  const state = loadState();
  const week = brtWeekKey(now);
  return Object.entries(state.players)
    .filter(([userId, p]) => !economy.isTestUser?.(userId) && (!guildId || (p.guilds && p.guilds[String(guildId)])))
    .map(([userId, p]) => {
      if (scope === 'week') {
        const w = p.weekly && p.weekly.week === week ? p.weekly : null;
        return {
          userId,
          runs: Number(w?.runs) || 0,
          bestFloor: Number(w?.bestFloor) || 0,
          victories: Number(w?.victories) || 0,
          kills: Number(w?.kills) || 0,
          coins: Number(w?.coins) || 0,
        };
      }
      return {
        userId,
        runs: Number(p.stats?.runs) || 0,
        bestFloor: Number(p.stats?.bestFloor) || 0,
        victories: Number(p.stats?.victories) || 0,
        kills: Number(p.stats?.kills) || 0,
        coins: Number(p.stats?.bestPayout) || 0,
      };
    })
    .filter((row) => row.runs > 0)
    .sort((a, b) => b.bestFloor - a.bestFloor || b.victories - a.victories || b.kills - a.kills || b.coins - a.coins);
}

/** Compra um nível de talento com Ecos. */
function buyTalent(userId, talentId) {
  const talent = TALENTS[talentId];
  if (!talent) return { ok: false, reason: 'invalid' };
  const state = loadState();
  const player = getPlayer(state, userId);
  const rank = Number(player.talents[talentId]) || 0;
  if (rank >= talent.costs.length) return { ok: false, reason: 'max', rank };
  const cost = talent.costs[rank];
  if (player.echoes < cost) return { ok: false, reason: 'echoes', cost, echoes: player.echoes };
  player.echoes -= cost;
  player.talents[talentId] = rank + 1;
  if (!saveState(state)) return { ok: false, reason: 'save' };
  return { ok: true, rank: rank + 1, cost, echoes: player.echoes };
}

/** Ranking do Hall dos Corajosos de sempre (atalho mantido para chamadas antigas). */
function getHallOfFame(limit = 5) {
  return getLeaderboard({ scope: 'all' })
    .slice(0, limit)
    .map((row) => ({ userId: row.userId, bestFloor: row.bestFloor, victories: row.victories, bestPayout: row.coins, runs: row.runs }));
}

/** Métricas reais para o /admin, Visual DB e /api/public/system-truth. */
function getDungeonStats() {
  const state = loadState();
  const players = Object.values(state.players);
  return {
    settings: getSettings(),
    totals: { ...state.totals },
    players: players.length,
    activeRuns: Object.keys(state.runs).length,
    deepestFloor: players.reduce((max, p) => Math.max(max, Number(p.stats?.bestFloor) || 0), 0),
    victories: state.totals.victories,
  };
}

/** Estatísticas de uma pessoa nas Catacumbas (para as conquistas). */
function getPlayerStats(userId) {
  const state = loadState();
  const player = state.players[String(userId)];
  return { ...(player?.stats || {}) };
}

function _setDataFileForTests(file) {
  DATA_FILE = file;
}

module.exports = {
  DEFAULT_SETTINGS,
  SETTINGS_BOUNDS,
  setSettingsProvider,
  sanitizeSettings,
  getSettings,
  getLobbyStatus,
  getActiveRun,
  startRun,
  performAction,
  buyTalent,
  getHallOfFame,
  getLeaderboard,
  brtWeekKey,
  setRunThread,
  closeIdleRuns,
  collectIdleWarnings,
  takeNotices,
  getDungeonStats,
  getPlayerStats,
  _setDataFileForTests,
};
