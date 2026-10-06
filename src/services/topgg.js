const { addCoins, addMagicBeans, registerUserVote, hasActiveVote } = require('./economy');
const { addLog } = require('./logging');

const DEFAULT_BOT_ID = '1453888365618270331';

const CRINGELANDIA_VOTE_URL = 'https://top.gg/discord/servers/874440609402134528/vote';

/**
 * Retorna o link oficial de votação no Top.gg para o servidor da Cringelândia.
 */
function getVoteUrl() {
  return process.env.TOPGG_VOTE_URL || CRINGELANDIA_VOTE_URL;
}

/**
 * Valida a senha/token configurado no Webhook do Top.gg.
 */
function verifyWebhookAuth(authHeader) {
  const secret = process.env.TOPGG_WEBHOOK_AUTH || process.env.TOPGG_TOKEN;
  if (!secret) return true; // Se não houver segredo cadastrado, aceita
  return authHeader === secret;
}

/**
 * Processa a entrega de recompensas quando um voto é recebido do Top.gg.
 * @param {Object} payload { bot, user, type, isWeekend, query }
 */
function processTopggVote(payload) {
  const userId = payload?.user;
  if (!userId) {
    return { success: false, error: 'User ID não fornecido no payload do Top.gg.' };
  }

  const isWeekend = Boolean(payload.isWeekend);

  // Votos no Top.gg agora são puramente de apoio voluntário (sem premiação/bônus em moedas)
  addLog(`[Top.gg Voto] Usuário ${userId} votou na Cringelândia (apoio voluntário à comunidade).`);

  return {
    success: true,
    userId,
    coins: 0,
    magicBeans: 0,
    isWeekend,
  };
}

module.exports = {
  getVoteUrl,
  verifyWebhookAuth,
  processTopggVote,
  registerUserVote,
  hasActiveVote,
  DEFAULT_BOT_ID,
};
