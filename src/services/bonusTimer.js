const crypto = require('node:crypto');
const { addItem } = require('./inventory');
const { addCoins, addMagicBeans } = require('./economy');

const BONUS_SECRET = process.env.BONUS_SECRET || 'pyxie_magic_bonus_secret_key_2026';
const MIN_WAIT_SECONDS = 8; // Mínimo de 8-10s no servidor para evitar trapaça
const TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // Válido por 15 minutos
const claimedTokens = new Set();

/**
 * Cria uma nova sessão de bônus assinada com HMAC.
 */
function createBonusSession(userId, action = 'item_bonus', metadata = {}, lang = 'pt') {
  let finalAction = action;
  let finalMeta = metadata;
  let finalLang = lang;

  if (finalAction === 'pt' || finalAction === 'en') {
    finalLang = finalAction;
    finalAction = 'item_bonus';
  } else if (typeof metadata === 'string') {
    finalLang = metadata;
    finalMeta = {};
  }
  finalLang = finalLang === 'en' ? 'en' : 'pt';

  const createdAt = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = JSON.stringify({ userId, action: finalAction, metadata: finalMeta, createdAt, nonce, lang: finalLang });
  const hmac = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');
  const token = Buffer.from(JSON.stringify({ payload, sig: hmac })).toString('base64url');

  const baseUrl = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org:3000';
  const url = `${baseUrl.replace(/\/$/, '')}/bonus?token=${token}&lang=${finalLang}&action=${finalAction}`;

  return {
    token,
    url,
    userId,
    action: finalAction,
    lang: finalLang,
    createdAt,
  };
}

/**
 * Valida a sessão de bônus, verifica se passaram os 10s e credita o benefício.
 */
function verifyAndClaimBonus(token) {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Token inválido ou não fornecido.' };
  }

  if (claimedTokens.has(token)) {
    return { success: false, error: 'Este bônus já foi resgatado anteriormente!' };
  }

  let parsed;
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    parsed = JSON.parse(raw);
  } catch (_) {
    return { success: false, error: 'Formato de token corrompido.' };
  }

  const { payload, sig } = parsed || {};
  if (!payload || typeof payload !== 'string' || !sig || typeof sig !== 'string') {
    return { success: false, error: 'Estrutura de token inválida.' };
  }

  const expectedSig = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');

  if (sig !== expectedSig) {
    return { success: false, error: 'Assinatura de segurança inválida ou adulterada.' };
  }

  let data;
  try {
    data = JSON.parse(payload);
  } catch (_) {
    return { success: false, error: 'Payload de dados ilegível.' };
  }

  const isEn = data.lang === 'en' || data.metadata?.lang === 'en';
  const now = Date.now();
  const elapsedSeconds = (now - data.createdAt) / 1000;

  if (now - data.createdAt > TOKEN_MAX_AGE_MS) {
    return {
      success: false,
      error: isEn
        ? 'This session has expired! Please generate a new link on Discord.'
        : 'Esta sessão expirou! Gere um novo link no Discord.',
    };
  }

  if (elapsedSeconds < MIN_WAIT_SECONDS) {
    return {
      success: false,
      error: isEn
        ? `Please wait the full 10 seconds on the page before claiming! (Elapsed: ${Math.floor(elapsedSeconds)}s)`
        : `Aguarde os 10 segundos completos na página antes de resgatar! (Tempo decorrido: ${Math.floor(elapsedSeconds)}s)`,
    };
  }

  claimedTokens.add(token);
  if (claimedTokens.size > 5000) {
    claimedTokens.clear();
  }

  // Recompensa específica por tipo de ação
  if (data.action === 'gloom_boss') {
    const { unlockBossExtraAttack } = require('./gloomRealm');
    unlockBossExtraAttack(data.userId);
    const message = isEn
      ? '🌙 **Extra Strike Unlocked!** You received **+50 Phantom Coins 👻** and your extra strike in Pyxie\'s Grove is now ready!'
      : '🌙 **Investida Extra Desbloqueada!** Você recebeu **+50 Phantom Coins 👻** e sua investida no Bosque da Pyxie já está liberada!';

    return {
      success: true,
      action: data.action,
      userId: data.userId,
      phantomCoinsAwarded: 50,
      message,
    };
  }

  // Recompensas da economia padrão (bônus geral e biscoito da sorte)
  addCoins(data.userId, 200);
  addMagicBeans(data.userId, 1);
  addItem(data.userId, 'bau_madeira', 1);

  let message;
  if (data.action === 'cookie_bonus') {
    const { grantExtraCookie } = require('./cookie');
    grantExtraCookie(data.userId);
    message = isEn
      ? '🥠 **Extra Fortune Cookie Unlocked!** You received **+200 Coins 🪙**, **+1 Magic Bean 🌱** and **1x Rustic Chest 📦**!'
      : '🥠 **Biscoito da Sorte Extra Desbloqueado!** Você recebeu **+200 Moedinhas 🪙**, **+1 Feijão Mágico 🌱** e **1x Baú Rústico 📦**!';
  } else {
    message = isEn
      ? '🎁 **Bonus Claimed!** You received **+200 Coins 🪙**, **+1 Magic Bean 🌱** and **1x Rustic Chest 📦** in your inventory!'
      : '🎁 **Bônus Resgatado com Sucesso!** Você recebeu **+200 Moedinhas 🪙**, **+1 Feijão Mágico 🌱** e **1x Baú Rústico 📦** na sua mochila!';
  }

  return {
    success: true,
    action: data.action,
    userId: data.userId,
    coinsAwarded: 200,
    beansAwarded: 1,
    message,
  };
}

module.exports = {
  BONUS_SECRET,
  MIN_WAIT_SECONDS,
  createBonusSession,
  verifyAndClaimBonus,
};
