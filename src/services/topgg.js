const { addCoins, addMagicBeans, registerUserVote, getUserAccount } = require('./economy');
const { addItem } = require('./inventory');
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
 * Verifica se o usuário possui voto ativo nas últimas 12 horas.
 */
function hasActiveVote(userId, now = Date.now()) {
  const account = getUserAccount(userId);
  if (!account?.lastVotedAt) return false;
  const lastVotedTime = new Date(account.lastVotedAt).getTime();
  return (now - lastVotedTime) <= (12 * 60 * 60 * 1000);
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
  const itemRewardId = isWeekend ? 'esmeralda' : 'ametista';
  const itemName = isWeekend ? '🟢 1x Esmeralda Nobre' : '🟣 1x Ametista Reluzente';

  // 1. Entregar Moedas
  addCoins(userId, coinsReward);

  // 2. Entregar Item
  addItem(userId, itemRewardId, 1);

  // 3. Registrar voto na conta do usuário (desbloqueia +20 moedas em /py-daily por 12h)
  registerUserVote(userId);

  // 4. Bônus de fim de semana: +1 Feijão Mágico
  if (isWeekend) {
    addMagicBeans(userId, 1);
  }

  addLog(
    `[Top.gg Voto] Usuário ${userId} votou no bot! Recompensa: +${coinsReward} 🪙, ${itemName}` +
      (isWeekend ? ' + 1 🌱 Feijão Mágico (Bônus Fim de Semana 2x Ativo!)' : '') +
      ' [Bônus de +20 moedas no /py-daily liberado por 12h!]'
  );

  return {
    success: true,
    userId,
    coins: coinsReward,
    item: itemRewardId,
    itemName,
    isWeekend,
  };
}

module.exports = {
  getVoteUrl,
  verifyWebhookAuth,
  hasActiveVote,
  processTopggVote,
  DEFAULT_BOT_ID,
};
