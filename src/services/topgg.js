const crypto = require('node:crypto');
const path = require('node:path');
const { registerUserVote, hasActiveVote, updateUserAccount, getUserAccount, VOTE_VALIDITY_MS } = require('./economy');
const { addLog } = require('./logging');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');

const DEFAULT_BOT_ID = '1543650200718155897';

/**
 * Recompensa por voto no Top.gg (autorizada pelo Criador): feijões mágicos, nunca moedinhas.
 * O Top.gg aceita um voto a cada 12h por pessoa; entregas repetidas do mesmo voto (o Top.gg
 * reenvia o webhook quando não recebe 200) caem na janela de 11h e não pagam de novo.
 */
const VOTE_BEANS = 1;
const WEEKEND_VOTE_BEANS = 2;
const DUPLICATE_VOTE_WINDOW_MS = 11 * 60 * 60 * 1000;
const USER_ID_PATTERN = /^[\w-]{1,64}$/;

/**
 * Retorna o link oficial de votação no Top.gg para a Pyxie.
 */
function getVoteUrl(botId = DEFAULT_BOT_ID) {
  if (process.env.TOPGG_VOTE_URL) return process.env.TOPGG_VOTE_URL;
  return `https://top.gg/bot/${botId || DEFAULT_BOT_ID}/vote`;
}

/**
 * Valida o segredo do webhook (campo Authorization configurado no Top.gg).
 * Sem segredo no .env o webhook recusa tudo: como o voto agora paga feijões,
 * aceitar requisições anônimas permitiria fabricar votos.
 */
function verifyWebhookAuth(authHeader, env = process.env) {
  const secret = env.TOPGG_WEBHOOK_AUTH || env.TOPGG_TOKEN;
  if (!secret || typeof authHeader !== 'string') return false;
  const expected = Buffer.from(secret);
  const received = Buffer.from(authHeader);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function statsFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'topggVotes.json');
}

function recordVoteStat(beans, now) {
  const file = statsFile();
  const stored = readJson(file, {});
  const day = new Date(now).toISOString().slice(0, 10);
  const daily = stored.daily && typeof stored.daily === 'object' ? stored.daily : {};
  daily[day] = (daily[day] || 0) + 1;
  const oldest = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  for (const key of Object.keys(daily)) {
    if (key < oldest) delete daily[key];
  }
  writeJsonAtomic(file, {
    totalVotes: (stored.totalVotes || 0) + 1,
    totalBeans: (stored.totalBeans || 0) + beans,
    lastVoteAt: now,
    daily,
  });
}

function getVoteStats() {
  const stored = readJson(statsFile(), {});
  return {
    totalVotes: stored.totalVotes || 0,
    totalBeans: stored.totalBeans || 0,
    lastVoteAt: stored.lastVoteAt || null,
    daily: stored.daily || {},
  };
}

/**
 * Processa o voto recebido do Top.gg e entrega os feijões mágicos.
 * @param {Object} payload { bot, user, type, isWeekend, query }
 */
function processTopggVote(payload, now = Date.now()) {
  const userId = String(payload?.user || '').trim();
  if (!USER_ID_PATTERN.test(userId)) {
    return { success: false, error: 'User ID ausente ou inválido no payload do Top.gg.' };
  }

  const isWeekend = Boolean(payload.isWeekend);

  // Botão "Send Test" do painel do Top.gg: confirma a integração sem pagar nada
  if (payload.type === 'test') {
    addLog(`[Top.gg Voto] Webhook de teste recebido para ${userId}.`);
    return { success: true, test: true, userId, coins: 0, magicBeans: 0, isWeekend, duplicate: false };
  }

  let beans = 0;
  let duplicate = false;
  const account = updateUserAccount(userId, (acc) => {
    const lastReward = acc.lastVoteRewardAt ? Date.parse(acc.lastVoteRewardAt) : 0;
    acc.lastVotedAt = new Date(now).toISOString();
    if (lastReward && now - lastReward < DUPLICATE_VOTE_WINDOW_MS) {
      duplicate = true;
      return;
    }
    beans = isWeekend ? WEEKEND_VOTE_BEANS : VOTE_BEANS;
    acc.magicBeans = (acc.magicBeans || 0) + beans;
    acc.lastVoteRewardAt = new Date(now).toISOString();
    acc.voteCount = (acc.voteCount || 0) + 1;
    acc.voteBeansEarned = (acc.voteBeansEarned || 0) + beans;
  });

  if (duplicate) {
    addLog(`[Top.gg Voto] Entrega repetida ignorada para ${userId} (voto já pago nas últimas 11h).`);
  } else {
    recordVoteStat(beans, now);
    addLog(`[Top.gg Voto] ${userId} votou na Pyxie e recebeu ${beans} feijão(ões) mágico(s)${isWeekend ? ' (fim de semana)' : ''}.`);
  }

  return {
    success: true,
    userId,
    coins: 0,
    magicBeans: beans,
    balanceBeans: account.magicBeans,
    voteCount: account.voteCount || 0,
    isWeekend,
    duplicate,
  };
}

/** Situação de voto de uma pessoa para o /py-vote e o lembrete do /py-daily. */
function getUserVoteStatus(userId, now = Date.now()) {
  const account = getUserAccount(userId);
  const lastVotedAt = account.lastVotedAt ? Date.parse(account.lastVotedAt) : 0;
  const nextVoteAt = lastVotedAt ? lastVotedAt + VOTE_VALIDITY_MS : 0;
  return {
    canVote: !nextVoteAt || now >= nextVoteAt,
    remainingMs: nextVoteAt ? Math.max(0, nextVoteAt - now) : 0,
    voteCount: account.voteCount || 0,
    beansEarned: account.voteBeansEarned || 0,
  };
}

module.exports = {
  VOTE_BEANS,
  WEEKEND_VOTE_BEANS,
  getVoteUrl,
  verifyWebhookAuth,
  processTopggVote,
  getUserVoteStatus,
  getVoteStats,
  registerUserVote,
  hasActiveVote,
  DEFAULT_BOT_ID,
};
