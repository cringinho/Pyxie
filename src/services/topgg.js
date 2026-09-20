const { addCoins, addMagicBeans } = require('./economy');
const { addItem } = require('./inventory');
const { addLog } = require('./logging');

const DEFAULT_BOT_ID = '1453888365618270331';

/**
 * Retorna o link oficial de votação no Top.gg para o bot.
 */
function getVoteUrl(botId = DEFAULT_BOT_ID) {
  return `https://top.gg/bot/${botId}/vote`;
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
  const coinsReward = isWeekend ? 200 : 100;
  const itemRewardId = isWeekend ? 'esmeralda' : 'ametista';
  const itemName = isWeekend ? '🟢 1x Esmeralda Nobre' : '🟣 1x Ametista Reluzente';

  // 1. Entregar Moedas
  addCoins(userId, coinsReward);

  // 2. Entregar Item
  addItem(userId, itemRewardId, 1);

  // 3. Bônus de fim de semana: +1 Feijão Mágico
  if (isWeekend) {
    addMagicBeans(userId, 1);
  }

  addLog(
    `[Top.gg Voto] Usuário ${userId} votou no bot! Recompensa: +${coinsReward} 🪙, ${itemName}` +
      (isWeekend ? ' + 1 🌱 Feijão Mágico (Bônus Fim de Semana 2x Ativo!)' : '')
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
  processTopggVote,
  DEFAULT_BOT_ID,
};
