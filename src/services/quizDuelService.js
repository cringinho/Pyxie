const path = require('path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { getBrtDateKey } = require('../utils/brtDate');

/**
 * Duelo de Quiz: dois jogadores, melhor de 3. Em cada rodada a primeira resposta certa leva o ponto;
 * quem erra fica de fora até a próxima pergunta. Partidas vivem em memória, estatísticas e o limite
 * diário de prêmios ficam em data/quizDuels.json.
 */

let DATA_FILE = path.join(__dirname, '../../data/quizDuels.json');

const TOTAL_ROUNDS = 3;
const WIN_SCORE = 2;
const WIN_REWARD = 5;
const DAILY_REWARD_LIMIT = 3;
const DUEL_LEVELS = [2, 3];

const activeDuels = new Map();

function shuffle(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function buildRoundQuestion(q, lang) {
  const data = q[lang] || q.pt || q;
  const wrongs = Array.isArray(data.wrongs) ? shuffle(data.wrongs).slice(0, 3) : [];
  const choices = shuffle([
    { text: data.correct, correct: true },
    ...wrongs.map((w) => ({ text: w, correct: false })),
  ]);
  return {
    question: data.question,
    topic: data.topic || q.topic || '',
    choices: choices.map((c) => c.text),
    correctIndex: choices.findIndex((c) => c.correct),
    correctText: data.correct,
  };
}

function pickDuelQuestions(questions, lang = 'pt') {
  const pool = questions.filter((q) => DUEL_LEVELS.includes(Number(q.level)));
  const source = pool.length >= TOTAL_ROUNDS ? pool : questions;
  return shuffle(source).slice(0, TOTAL_ROUNDS).map((q) => buildRoundQuestion(q, lang));
}

function isUserInDuel(userId) {
  for (const duel of activeDuels.values()) {
    if (duel.status !== 'finished' && (duel.challengerId === userId || duel.opponentId === userId)) {
      return true;
    }
  }
  return false;
}

function createDuel({ challengerId, opponentId, lang = 'pt', questions = [], now = Date.now() }) {
  const roundQuestions = pickDuelQuestions(questions, lang);
  if (roundQuestions.length < TOTAL_ROUNDS) return { error: 'no_questions' };
  if (isUserInDuel(challengerId)) return { error: 'challenger_busy' };
  if (isUserInDuel(opponentId)) return { error: 'opponent_busy' };

  const duel = {
    id: `qd${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending',
    challengerId,
    opponentId,
    lang,
    questions: roundQuestions,
    round: 0,
    scores: { [challengerId]: 0, [opponentId]: 0 },
    lockedOut: [],
    lastRound: null,
    createdAt: now,
  };
  activeDuels.set(duel.id, duel);
  return { duel };
}

function getDuel(id) {
  return activeDuels.get(id) || null;
}

function isPlayer(duel, userId) {
  return duel.challengerId === userId || duel.opponentId === userId;
}

function acceptDuel(id, userId) {
  const duel = getDuel(id);
  if (!duel || duel.status !== 'pending') return { error: 'not_pending' };
  if (userId !== duel.opponentId) return { error: 'not_opponent' };
  duel.status = 'active';
  duel.round = 1;
  return { duel };
}

/** Recusa (oponente) ou cancela (desafiante) um duelo pendente. */
function declineDuel(id, userId) {
  const duel = getDuel(id);
  if (!duel || duel.status !== 'pending') return { error: 'not_pending' };
  if (!isPlayer(duel, userId)) return { error: 'not_player' };
  activeDuels.delete(id);
  return { duel, cancelled: userId === duel.challengerId };
}

function expirePendingDuel(id) {
  const duel = getDuel(id);
  if (!duel || duel.status !== 'pending') return null;
  activeDuels.delete(id);
  return duel;
}

function loadStats() {
  const data = readJson(DATA_FILE, {});
  return { players: data.players && typeof data.players === 'object' ? data.players : {} };
}

function getPlayerStats(userId) {
  const p = loadStats().players[userId] || {};
  return { wins: p.wins || 0, losses: p.losses || 0, draws: p.draws || 0 };
}

/** Grava o resultado e decide o prêmio do vencedor respeitando o limite diário (BRT). */
function recordResult({ winnerId, loserId, drawIds = [] }, now = Date.now()) {
  const data = loadStats();
  const dayKey = getBrtDateKey(now);
  const touch = (id) => {
    if (!data.players[id]) data.players[id] = { wins: 0, losses: 0, draws: 0 };
    return data.players[id];
  };

  let reward = 0;
  let rewardLimited = false;
  if (winnerId) {
    const winner = touch(winnerId);
    winner.wins += 1;
    touch(loserId).losses += 1;
    if (winner.rewardDay !== dayKey) {
      winner.rewardDay = dayKey;
      winner.rewardCount = 0;
    }
    if (winner.rewardCount < DAILY_REWARD_LIMIT) {
      winner.rewardCount += 1;
      reward = WIN_REWARD;
    } else {
      rewardLimited = true;
    }
  }
  for (const id of drawIds) touch(id).draws += 1;

  writeJsonAtomic(DATA_FILE, data);
  return { reward, rewardLimited };
}

function finishDuel(duel, now) {
  duel.status = 'finished';
  activeDuels.delete(duel.id);
  const a = duel.scores[duel.challengerId];
  const b = duel.scores[duel.opponentId];
  if (a === b) {
    recordResult({ drawIds: [duel.challengerId, duel.opponentId] }, now);
    return { draw: true, winnerId: null, loserId: null, reward: 0, rewardLimited: false };
  }
  const winnerId = a > b ? duel.challengerId : duel.opponentId;
  const loserId = winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
  const { reward, rewardLimited } = recordResult({ winnerId, loserId }, now);
  return { draw: false, winnerId, loserId, reward, rewardLimited };
}

function closeRound(duel, winnerId, now) {
  const q = duel.questions[duel.round - 1];
  if (winnerId) duel.scores[winnerId] += 1;
  duel.lastRound = { round: duel.round, winnerId: winnerId || null, answer: q.correctText };

  const someoneWon = Object.values(duel.scores).some((s) => s >= WIN_SCORE);
  if (someoneWon || duel.round >= TOTAL_ROUNDS) {
    return { finished: true, outcome: finishDuel(duel, now) };
  }
  duel.round += 1;
  duel.lockedOut = [];
  return { finished: false };
}

/**
 * Processa um clique de resposta.
 * @returns {{ error?: string, result?: 'wrong'|'round_won'|'round_void', finished?: boolean, outcome?: object }}
 */
function submitAnswer(id, userId, round, choiceIndex, now = Date.now()) {
  const duel = getDuel(id);
  if (!duel || duel.status !== 'active') return { error: 'not_found' };
  if (!isPlayer(duel, userId)) return { error: 'not_player' };
  if (Number(round) !== duel.round) return { error: 'stale_round' };
  if (duel.lockedOut.includes(userId)) return { error: 'locked_out' };

  const q = duel.questions[duel.round - 1];
  if (Number(choiceIndex) === q.correctIndex) {
    return { result: 'round_won', ...closeRound(duel, userId, now) };
  }

  duel.lockedOut.push(userId);
  if (duel.lockedOut.length >= 2) {
    return { result: 'round_void', ...closeRound(duel, null, now) };
  }
  return { result: 'wrong', finished: false };
}

/** Encerra a rodada por tempo esgotado, sem ponto para ninguém. */
function timeoutRound(id, round, now = Date.now()) {
  const duel = getDuel(id);
  if (!duel || duel.status !== 'active' || duel.round !== Number(round)) return null;
  return { result: 'round_void', ...closeRound(duel, null, now) };
}

function _setDataFileForTests(file) {
  DATA_FILE = file;
}

module.exports = {
  TOTAL_ROUNDS,
  WIN_SCORE,
  WIN_REWARD,
  DAILY_REWARD_LIMIT,
  activeDuels,
  createDuel,
  getDuel,
  isUserInDuel,
  acceptDuel,
  declineDuel,
  expirePendingDuel,
  submitAnswer,
  timeoutRound,
  getPlayerStats,
  recordResult,
  _setDataFileForTests,
};
