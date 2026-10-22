const path = require('path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { getBrtDateKey, getPreviousDateKey } = require('../utils/brtDate');

/**
 * Desafio do Dia: uma pergunta do banco do quiz por dia (BRT), igual para todo mundo,
 * com uma única tentativa por pessoa e sequência (streak) de acertos em dias seguidos.
 */

let DATA_FILE = path.join(__dirname, '../../data/dailyChallenge.json');

const CHALLENGE_LEVELS = [3, 4];
const BASE_REWARD = 3;
const STREAK_STEP_REWARD = 1;
const MAX_STREAK_STEPS = 5; // prêmio máximo: 3 + 1 * 5 = 8 moedinhas
const KEPT_DAYS = 14;

function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadState() {
  const state = readJson(DATA_FILE, {});
  return {
    players: state.players && typeof state.players === 'object' ? state.players : {},
    days: state.days && typeof state.days === 'object' ? state.days : {},
  };
}

function saveState(state) {
  const keys = Object.keys(state.days).sort();
  for (const old of keys.slice(0, Math.max(0, keys.length - KEPT_DAYS))) {
    delete state.days[old];
  }
  writeJsonAtomic(DATA_FILE, state);
}

/**
 * Escolhe a pergunta do dia de forma determinística. A ordem das alternativas também é fixa,
 * e idêntica em PT e EN, para que o índice da resposta valha nos dois idiomas.
 */
function pickChallenge(questions, dateKey, lang = 'pt') {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  const hardPool = questions.filter((q) => CHALLENGE_LEVELS.includes(Number(q.level)));
  const pool = hardPool.length > 0 ? hardPool : questions;
  const q = pool[hashString(`challenge:${dateKey}`) % pool.length];

  const data = q[lang] || q.pt || q;
  const wrongs = Array.isArray(data.wrongs) ? data.wrongs.slice(0, 3) : [];
  const base = [data.correct, ...wrongs];

  const order = base.map((_, i) => i);
  const rand = seededRandom(hashString(`choices:${dateKey}`));
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return {
    key: q.id || data.question,
    level: Number(q.level) || 3,
    topic: data.topic || q.topic || '',
    question: data.question,
    choices: order.map((i) => base[i]),
    correctIndex: order.indexOf(0),
    correctText: data.correct,
  };
}

function computeReward(streak) {
  const steps = Math.max(0, Math.min(MAX_STREAK_STEPS, (Number(streak) || 1) - 1));
  return BASE_REWARD + STREAK_STEP_REWARD * steps;
}

/** Sequência ainda válida: o último acerto foi hoje ou ontem. */
function getActiveStreak(player, dateKey) {
  if (!player || !player.lastCorrectKey) return 0;
  if (player.lastCorrectKey === dateKey || player.lastCorrectKey === getPreviousDateKey(dateKey)) {
    return Number(player.streak) || 0;
  }
  return 0;
}

function getPlayerState(userId, now = Date.now()) {
  const dateKey = getBrtDateKey(now);
  const player = loadState().players[userId] || {};
  const streak = getActiveStreak(player, dateKey);
  return {
    dateKey,
    attemptedToday: player.lastAttemptKey === dateKey,
    todayCorrect: player.lastAttemptKey === dateKey ? Boolean(player.lastResultCorrect) : null,
    streak,
    bestStreak: Number(player.bestStreak) || 0,
    nextReward: computeReward(player.lastCorrectKey === getPreviousDateKey(dateKey) ? streak + 1 : 1),
  };
}

/**
 * Registra a resposta do dia. Retorna o status e, em caso de acerto, o prêmio a creditar.
 * @returns {{ status: 'expired'|'already'|'correct'|'wrong', streak?: number, reward?: number }}
 */
function submitAnswer(userId, dateKey, choiceIndex, correctIndex, now = Date.now()) {
  if (dateKey !== getBrtDateKey(now)) return { status: 'expired' };

  const state = loadState();
  const player = state.players[userId] || {};
  if (player.lastAttemptKey === dateKey) {
    return { status: 'already', streak: getActiveStreak(player, dateKey) };
  }

  const isCorrect = Number(choiceIndex) === Number(correctIndex);
  const day = state.days[dateKey] || { attempts: 0, correct: 0 };
  day.attempts += 1;

  let streak = 0;
  let reward = 0;
  if (isCorrect) {
    streak = player.lastCorrectKey === getPreviousDateKey(dateKey) ? (Number(player.streak) || 0) + 1 : 1;
    reward = computeReward(streak);
    day.correct += 1;
    player.lastCorrectKey = dateKey;
    player.totalCorrect = (Number(player.totalCorrect) || 0) + 1;
    player.coinsEarned = (Number(player.coinsEarned) || 0) + reward;
  }

  player.streak = streak;
  player.bestStreak = Math.max(Number(player.bestStreak) || 0, streak);
  player.lastAttemptKey = dateKey;
  player.lastResultCorrect = isCorrect;
  player.totalAttempts = (Number(player.totalAttempts) || 0) + 1;

  state.players[userId] = player;
  state.days[dateKey] = day;
  saveState(state);

  return { status: isCorrect ? 'correct' : 'wrong', streak, reward };
}

function getDayStats(dateKey) {
  const day = loadState().days[dateKey];
  return { attempts: day?.attempts || 0, correct: day?.correct || 0 };
}

function getTopStreaks(limit = 5, now = Date.now()) {
  const dateKey = getBrtDateKey(now);
  return Object.entries(loadState().players)
    .map(([userId, p]) => ({ userId, streak: getActiveStreak(p, dateKey) }))
    .filter((row) => row.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, limit);
}

function _setDataFileForTests(file) {
  DATA_FILE = file;
}

module.exports = {
  BASE_REWARD,
  STREAK_STEP_REWARD,
  MAX_STREAK_STEPS,
  pickChallenge,
  computeReward,
  getPlayerState,
  submitAnswer,
  getDayStats,
  getTopStreaks,
  _setDataFileForTests,
};
