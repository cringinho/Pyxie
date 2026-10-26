const crypto = require('node:crypto');
const manager = require('./marriageManager');

/**
 * Força do Laço: o lado duradouro do casamento (a Barra do Amor cai 20% por dia; o Laço não cai).
 *
 * - Gesto do dia: cada pessoa do casal faz um gesto por dia (bilhete, café, abraço ou ver as
 *   estrelas): +15 de Laço e +5% de amor. Quando as duas fazem no mesmo dia, é dia de Sintonia:
 *   +20 de Laço e a sequência de dias em sintonia cresce.
 * - Missão da semana: um objetivo a dois que muda toda segunda (date nights, gestos, sintonia,
 *   árvore, turnos de trabalho ou descidas nas Catacumbas). Concluir dá +120 de Laço, enche a
 *   Barra do Amor e uma lembrança para a Casinha de cada pessoa (sem moedinhas, AGENTS.md §5).
 * - 10 níveis com nome; as conquistas bond_3/bond_7/bond_10 (src/data/achievementsCatalog.js)
 *   dão títulos às duas pessoas pelo nível do Laço.
 *
 * Tudo fica no próprio registro do casamento (`marriage.bond`), em data/marriageData.json.
 */

const BRT_OFFSET = 3 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const GESTURE_XP = 15;
const GESTURE_LOVE = 5;
const SYNC_XP = 20;
const WEEKLY_XP = 120;

const GESTURES = {
  note: { emoji: '💌' },
  coffee: { emoji: '☕' },
  hug: { emoji: '🫂' },
  stars: { emoji: '🌙' },
};

/** XP acumulado para chegar a cada nível (nível 1 começa no 0). */
const LEVEL_XP = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

const LEVEL_NAMES = [
  { pt: 'Recém-casados', en: 'Newlyweds' },
  { pt: 'Parceria', en: 'Partners' },
  { pt: 'Cumplicidade', en: 'Kindred' },
  { pt: 'Porto Seguro', en: 'Safe Harbor' },
  { pt: 'Duas Metades', en: 'Two Halves' },
  { pt: 'Abraço Infinito', en: 'Endless Hug' },
  { pt: 'Alma Gêmea', en: 'Soulmates' },
  { pt: 'Constelação a Dois', en: 'Shared Constellation' },
  { pt: 'Amor de Lenda', en: 'Legendary Love' },
  { pt: 'Laço Eterno', en: 'Eternal Bond' },
];

const WEEKLY_QUESTS = [
  { id: 'dates', target: 2 },
  { id: 'gestures', target: 10 },
  { id: 'sync', target: 4 },
  { id: 'tree', target: 3, needsTree: true },
  { id: 'work', target: 15 },
  { id: 'dungeon', target: 4 },
];

/** Lembranças da missão da semana (móveis da Casinha, iguais para as duas pessoas). */
const KEEPSAKES = ['vanity', 'mirror_round', 'mirror_tall', 'wp_rose_hearts', 'fl_pink_tiles', 'slime_pink', 'mirror_gilded'];

function brtDay(now) {
  return new Date(now - BRT_OFFSET).toISOString().slice(0, 10);
}

function brtWeekKey(now) {
  const d = new Date(now - BRT_OFFSET);
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - sinceMonday)).toISOString().slice(0, 10);
}

function weekEndsAt(now) {
  const [y, m, d] = brtWeekKey(now).split('-').map(Number);
  return Date.UTC(y, m - 1, d + 7) + BRT_OFFSET;
}

function hashPick(text, list) {
  const n = crypto.createHash('sha256').update(text).digest().readUInt32LE(0);
  return list[n % list.length];
}

function levelOf(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) if (xp >= LEVEL_XP[i]) level = i + 1;
  return level;
}

/** Desde quando o casal está junto (casamentos antigos usam a data do id `mar_<ms>_…`). */
function marriedAt(marriage) {
  if (marriage.createdAt) return Number(marriage.createdAt);
  const match = /^mar_(\d{12,14})_/.exec(String(marriage.id || ''));
  return match ? Number(match[1]) : null;
}

function bondOf(marriage) {
  const bond = marriage.bond && typeof marriage.bond === 'object' ? marriage.bond : {};
  bond.xp = Math.max(0, Math.floor(Number(bond.xp) || 0));
  bond.daily = bond.daily && typeof bond.daily === 'object' ? bond.daily : {};
  bond.streak = Math.max(0, Math.floor(Number(bond.streak) || 0));
  bond.bestStreak = Math.max(bond.streak, Math.floor(Number(bond.bestStreak) || 0));
  bond.lastSyncDay = bond.lastSyncDay || null;
  bond.weeksDone = Math.max(0, Math.floor(Number(bond.weeksDone) || 0));
  marriage.bond = bond;
  return bond;
}

/** Missão da semana do casal (sorteada pelo id do casamento + semana; nova toda segunda). */
function weeklyOf(marriage, now) {
  const bond = bondOf(marriage);
  const key = brtWeekKey(now);
  if (!bond.week || bond.week.key !== key) {
    const pool = WEEKLY_QUESTS.filter((quest) => !quest.needsTree || marriage.treeOfLife?.unlocked);
    const quest = hashPick(`${marriage.id}:${key}`, pool);
    bond.week = { key, quest: quest.id, target: quest.target, progress: 0, done: false, keepsake: hashPick(`${marriage.id}:${key}:gift`, KEEPSAKES) };
  }
  return bond.week;
}

function findMarriage(data, userId) {
  return Object.values(data.marriages).find((m) => Array.isArray(m.spouses) && m.spouses.includes(String(userId))) || null;
}

/** Soma Laço; `levelUps` recebe cada nível novo alcançado. */
function addBondXp(marriage, amount, levelUps) {
  const bond = bondOf(marriage);
  const before = levelOf(bond.xp);
  bond.xp += amount;
  const after = levelOf(bond.xp);
  for (let level = before + 1; level <= after; level++) levelUps.push(level);
  return { before, after };
}

/** Avança a missão da semana. Concluir entrega Laço, amor cheio e a lembrança. */
function advanceWeekly(marriage, kind, qty, now, levelUps) {
  const week = weeklyOf(marriage, now);
  if (week.done || week.quest !== kind) return null;
  week.progress = Math.min(week.target, week.progress + qty);
  if (week.progress < week.target) return null;
  week.done = true;
  week.doneAt = now;
  const bond = bondOf(marriage);
  bond.weeksDone += 1;
  marriage.loveBar = 100;
  addBondXp(marriage, WEEKLY_XP, levelUps);
  return { completed: true, keepsake: week.keepsake };
}

function deliverKeepsake(marriage, keepsake, now) {
  const vault = require('../../services/itemVault');
  for (const spouse of marriage.spouses) {
    try {
      vault.grantItem(spouse, keepsake, { source: 'marriage', detail: 'weekly' }, now);
    } catch (_) {}
  }
}

/**
 * Gesto do dia. Uma vez por pessoa por dia (horário de Brasília); as duas no mesmo dia = Sintonia.
 */
function doGesture(userId, gesture, now = Date.now()) {
  if (!GESTURES[gesture]) return { ok: false, reason: 'invalid' };
  const data = manager.readData();
  const marriage = findMarriage(data, userId);
  if (!marriage) return { ok: false, reason: 'not_married' };
  manager.applyLazyDecay(marriage);
  const bond = bondOf(marriage);
  const id = String(userId);
  const today = brtDay(now);
  if (bond.daily[id]?.day === today) return { ok: false, reason: 'done_today', gesture: bond.daily[id].gesture };

  const levelUps = [];
  bond.daily[id] = { day: today, gesture, at: now };
  marriage.loveBar = Math.min(100, (Number(marriage.loveBar) || 0) + GESTURE_LOVE);
  marriage.lastAffectionAt = now;
  addBondXp(marriage, GESTURE_XP, levelUps);
  let weekly = advanceWeekly(marriage, 'gestures', 1, now, levelUps);

  const spouseId = marriage.spouses.find((s) => s !== id);
  let synced = false;
  if (spouseId && bond.daily[spouseId]?.day === today && bond.lastSyncDay !== today) {
    synced = true;
    const yesterday = brtDay(now - DAY);
    bond.streak = bond.lastSyncDay === yesterday ? bond.streak + 1 : 1;
    bond.bestStreak = Math.max(bond.bestStreak, bond.streak);
    bond.lastSyncDay = today;
    addBondXp(marriage, SYNC_XP, levelUps);
    weekly = advanceWeekly(marriage, 'sync', 1, now, levelUps) || weekly;
  }
  manager.writeData(data);
  if (weekly?.completed) deliverKeepsake(marriage, weekly.keepsake, now);
  return { ok: true, gesture, spouseId, synced, streak: bond.streak, love: marriage.loveBar, xp: bond.xp, level: levelOf(bond.xp), levelUps, weekly };
}

/** Progresso da missão da semana vindo de outras partes do bot (trabalho, Catacumbas, date…). */
function recordActivity(userId, kind, qty = 1, now = Date.now()) {
  try {
    const data = manager.readData();
    const marriage = findMarriage(data, userId);
    if (!marriage) return null;
    const week = weeklyOf(marriage, now);
    // Só grava quando é a missão da semana e ela ainda está aberta
    if (week.quest !== kind || week.done) return null;
    const levelUps = [];
    const weekly = advanceWeekly(marriage, kind, qty, now, levelUps);
    manager.writeData(data);
      if (weekly?.completed) deliverKeepsake(marriage, weekly.keepsake, now);
    return { progress: week.progress, target: week.target, completed: Boolean(weekly?.completed) };
  } catch (err) {
    console.warn('[marriage] Missão da semana não registrada:', err.message);
    return null;
  }
}

/** Nível do Laço de quem é casado (0 sem casamento), para as conquistas. */
function bondLevelOf(userId) {
  const marriage = findMarriage(manager.readData(), userId);
  return marriage ? levelOf(bondOf(marriage).xp) : 0;
}

/** Tudo o que a tela do Laço mostra. */
function getBondStatus(userId, now = Date.now()) {
  const data = manager.readData();
  const marriage = findMarriage(data, userId);
  if (!marriage) return null;
  manager.applyLazyDecay(marriage);
  const bond = bondOf(marriage);
  const week = weeklyOf(marriage, now);
  const id = String(userId);
  const spouseId = marriage.spouses.find((s) => s !== id) || null;
  const today = brtDay(now);
  const level = levelOf(bond.xp);
  const since = marriedAt(marriage);
  // Sequência quebrada (mais de um dia sem sintonia) aparece como 0
  const streakAlive = bond.lastSyncDay === today || bond.lastSyncDay === brtDay(now - DAY);
  return {
    marriageId: marriage.id,
    spouseId,
    love: Math.round(Number(marriage.loveBar) || 0),
    xp: bond.xp,
    level,
    levelName: LEVEL_NAMES[level - 1],
    levelStart: LEVEL_XP[level - 1],
    nextLevelXp: LEVEL_XP[level] ?? null,
    days: since ? Math.max(0, Math.floor((now - since) / DAY)) : null,
    streak: streakAlive ? bond.streak : 0,
    bestStreak: bond.bestStreak,
    weeksDone: bond.weeksDone,
    mine: bond.daily[id]?.day === today ? bond.daily[id].gesture : null,
    theirs: spouseId && bond.daily[spouseId]?.day === today ? bond.daily[spouseId].gesture : null,
    week: { ...week, endsAt: weekEndsAt(now) },
  };
}

module.exports = {
  GESTURES,
  GESTURE_XP,
  SYNC_XP,
  WEEKLY_XP,
  LEVEL_XP,
  LEVEL_NAMES,
  WEEKLY_QUESTS,
  KEEPSAKES,
  levelOf,
  bondLevelOf,
  marriedAt,
  doGesture,
  recordActivity,
  getBondStatus,
};
