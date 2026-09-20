const crypto = require('node:crypto');
const { addCoins } = require('./economy');

const BONUS_SECRET = process.env.BONUS_SECRET || 'pyxie_magic_bonus_secret_key_2026';
const MIN_WAIT_SECONDS = 8; // Mínimo de 8-10s no servidor para evitar trapaça
const TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // Válido por 15 minutos
const WEB_BONUS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 vez ao dia (24h)
const claimedTokens = new Set();

/**
 * Retorna o status de disponibilidade do bônus diário na web (24h).
 */
function getWebBonusStatus(userId, now = Date.now()) {
  const { getUserAccount } = require('./economy');
  const account = getUserAccount(userId);
  const lastWebBonusAt = account.lastWebBonusAt ? new Date(account.lastWebBonusAt).getTime() : 0;
  const remainingMs = Math.max(0, WEB_BONUS_COOLDOWN_MS - (now - lastWebBonusAt));

  return {
    available: remainingMs === 0,
    remainingMs,
    nextBonusAt: remainingMs ? new Date(now + remainingMs).toISOString() : null,
  };
}

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

  // 1. Recompensa do Chefão do Bosque (gloom_boss)
  if (data.action === 'gloom_boss') {
    claimedTokens.add(token);
    if (claimedTokens.size > 5000) claimedTokens.clear();

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

  // 2. Recompensa do Biscoito da Sorte (cookie_bonus)
  if (data.action === 'cookie_bonus') {
    claimedTokens.add(token);
    if (claimedTokens.size > 5000) claimedTokens.clear();

    const { grantExtraCookie } = require('./cookie');
    grantExtraCookie(data.userId);
    addCoins(data.userId, 25);
    const message = isEn
      ? '🥠 **Extra Fortune Cookie Unlocked!** You received **+25 Coins 🪙** and 1 extra fortune cookie spin!'
      : '🥠 **Biscoito da Sorte Extra Desbloqueado!** Você recebeu **+25 Moedinhas 🪙** e 1 giro adicional no biscoito!';

    return {
      success: true,
      action: data.action,
      userId: data.userId,
      coinsAwarded: 25,
      beansAwarded: 0,
      message,
    };
  }

  // 3. Bônus Diário Web Padrão (item_bonus) — 1 vez ao dia (24h), apenas moedas
  const status = getWebBonusStatus(data.userId, now);
  if (!status.available) {
    return {
      success: false,
      error: isEn
        ? 'You have already claimed your daily web bonus today! Please wait 24 hours.'
        : 'Você já resgatou seu bônus diário na web hoje! Aguarde 24 horas.',
    };
  }

  claimedTokens.add(token);
  if (claimedTokens.size > 5000) claimedTokens.clear();

  addCoins(data.userId, 75);
  const { updateUserAccount } = require('./economy');
  updateUserAccount(data.userId, (acc) => {
    acc.lastWebBonusAt = new Date(now).toISOString();
  });

  const message = isEn
    ? '🎁 **Daily Web Bonus Claimed!** You received **+75 Coins 🪙** in your vault!'
    : '🎁 **Bônus Diário Web Resgatado!** Você recebeu **+75 Moedinhas 🪙** no seu cofre!';

  return {
    success: true,
    action: data.action,
    userId: data.userId,
    coinsAwarded: 75,
    beansAwarded: 0,
    message,
  };
}

module.exports = {
  BONUS_SECRET,
  MIN_WAIT_SECONDS,
  WEB_BONUS_COOLDOWN_MS,
  getWebBonusStatus,
  createBonusSession,
  verifyAndClaimBonus,
};
