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
  const coinsReward = isWeekend ? 100 : 50;

  // 1. Entregar Moedas
  addCoins(userId, coinsReward);

  // 2. Bônus de fim de semana: +1 Feijão Mágico
  if (isWeekend) {
    addMagicBeans(userId, 1);
  }

  // 3. Registrar carimbo do voto para bônus no /py-daily (+20 moedas por 12h)
  registerUserVote(userId);

  addLog(
    `[Top.gg Voto] Usuário ${userId} votou na Cringelândia! Recompensa: +${coinsReward} 🪙` +
      (isWeekend ? ' + 1 🌱 Feijão Mágico (Bônus Fim de Semana 2x Ativo!)' : '') +
      ' (+20 moedas extras no /py-daily desbloqueadas por 12h)'
  );

  return {
    success: true,
    userId,
    coins: coinsReward,
    magicBeans: isWeekend ? 1 : 0,
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
