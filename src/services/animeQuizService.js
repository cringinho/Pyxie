const fs = require('fs');
const path = require('path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');

/**
 * Maratona Otaku: corrida solo de 5 perguntas de anime e cultura geek, com dificuldade crescente.
 * Cada acerto rende poucas moedinhas na hora; errar encerra a corrida mantendo o que já foi ganho.
 */

const QUESTIONS_FILE = path.join(__dirname, '../data/anime_questions.json');
let DATA_FILE = path.join(__dirname, '../../data/animeQuiz.json');

const RUN_LEVELS = [1, 2, 3, 4, 4];
const REWARD_PER_CORRECT = 1;
const PERFECT_BONUS = 3; // corrida perfeita: 5 x 1 + 3 = 8 moedinhas
const RUN_COOLDOWN_MS = 3 * 60 * 60 * 1000;

let cachedQuestions = null;
let cachedMtime = 0;

function loadAnimeQuestions() {
  try {
    const stats = fs.statSync(QUESTIONS_FILE);
    if (cachedQuestions && stats.mtimeMs === cachedMtime) return cachedQuestions;
    const data = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    if (Array.isArray(data)) {
      cachedQuestions = data;
      cachedMtime = stats.mtimeMs;
    }
  } catch (_) {}
  return cachedQuestions || [];
}

function shuffle(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function buildQuestion(q, lang) {
  const data = q[lang] || q.pt || q;
  const choices = shuffle([
    { text: data.correct, correct: true },
    ...data.wrongs.slice(0, 3).map((w) => ({ text: w, correct: false })),
  ]);
  return {
    id: q.id,
    level: Number(q.level) || 1,
    topic: data.topic || q.topic || '',
    question: data.question,
    choices: choices.map((c) => c.text),
    correctIndex: choices.findIndex((c) => c.correct),
    correctText: data.correct,
  };
}

/** Sorteia uma pergunta por nível da corrida, sem repetir. */
function pickRunQuestions(questions, lang = 'pt') {
  const used = new Set();
  const picked = [];
  for (const level of RUN_LEVELS) {
    const pool = questions.filter((q) => Number(q.level) === level && !used.has(q.id));
    const fallback = questions.filter((q) => !used.has(q.id));
    const source = pool.length > 0 ? pool : fallback;
    if (source.length === 0) break;
    const q = source[Math.floor(Math.random() * source.length)];
    used.add(q.id);
    picked.push(buildQuestion(q, lang));
  }
  return picked;
}

function loadState() {
  const data = readJson(DATA_FILE, {});
  return { players: data.players && typeof data.players === 'object' ? data.players : {} };
}

function getRunStatus(userId, now = Date.now()) {
  const player = loadState().players[userId] || {};
  const remainingMs = Math.max(0, RUN_COOLDOWN_MS - (now - (Number(player.lastRunAt) || 0)));
  return {
    available: remainingMs === 0,
    remainingMs,
    bestScore: Number(player.bestScore) || 0,
    perfectRuns: Number(player.perfectRuns) || 0,
  };
}

/** Marca o início da corrida (consome o cooldown). */
function startRun(userId, now = Date.now()) {
  const status = getRunStatus(userId, now);
  if (!status.available) return { started: false, ...status };
  const state = loadState();
  const player = state.players[userId] || {};
  player.lastRunAt = now;
  player.runs = (Number(player.runs) || 0) + 1;
  state.players[userId] = player;
  writeJsonAtomic(DATA_FILE, state);
  return { started: true, ...status };
}

/** Grava o resultado final da corrida e devolve o recorde atualizado. */
function finishRun(userId, correctCount, totalQuestions) {
  const state = loadState();
  const player = state.players[userId] || {};
  const isPerfect = correctCount === totalQuestions && totalQuestions > 0;
  const previousBest = Number(player.bestScore) || 0;
  player.bestScore = Math.max(previousBest, correctCount);
  player.totalCorrect = (Number(player.totalCorrect) || 0) + correctCount;
  if (isPerfect) player.perfectRuns = (Number(player.perfectRuns) || 0) + 1;
  state.players[userId] = player;
  writeJsonAtomic(DATA_FILE, state);
  return { isPerfect, bestScore: player.bestScore, newRecord: correctCount > previousBest };
}

function _setDataFileForTests(file) {
  DATA_FILE = file;
}

module.exports = {
  RUN_LEVELS,
  REWARD_PER_CORRECT,
  PERFECT_BONUS,
  RUN_COOLDOWN_MS,
  loadAnimeQuestions,
  pickRunQuestions,
  getRunStatus,
  startRun,
  finishRun,
  _setDataFileForTests,
};
