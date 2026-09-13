const crypto = require('node:crypto');
const { speedupUserIncubator } = require('./pets');
const { markExpeditionDoubled } = require('./petExpedition');

const BONUS_SECRET = process.env.BONUS_SECRET || 'pyxie_magic_bonus_secret_key_2026';
const MIN_WAIT_SECONDS = 8; // Mínimo de 8-10s no servidor para evitar trapaça
const TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // Válido por 15 minutos
const MONETAG_DIRECT_LINK = process.env.MONETAG_DIRECT_LINK || 'https://omg10.com/4/11793877';

// Cache em memória para prevenção de resgate duplicado (anti-replay)
const claimedTokens = new Set();

/**
 * Cria uma nova sessão de bônus assinada com HMAC.
 */
function createBonusSession(userId, action, metadata = {}) {
  const createdAt = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = JSON.stringify({ userId, action, metadata, createdAt, nonce });
  const hmac = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');
  const token = Buffer.from(JSON.stringify({ payload, sig: hmac })).toString('base64url');

  const baseUrl = process.env.PANEL_PUBLIC_URL || 'http://136.113.26.120:3000';
  const url = `${baseUrl.replace(/\/$/, '')}/bonus?token=${token}`;

  return {
    token,
    url,
    userId,
    action,
    createdAt,
    monetagLink: MONETAG_DIRECT_LINK,
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

  const now = Date.now();
  const elapsedSeconds = (now - data.createdAt) / 1000;

  if (now - data.createdAt > TOKEN_MAX_AGE_MS) {
    return { success: false, error: 'Esta sessão expirou! Gere um novo link no Discord.' };
  }

  if (elapsedSeconds < MIN_WAIT_SECONDS) {
    return {
      success: false,
      error: `Aguarde os 10 segundos completos na página antes de resgatar! (Tempo decorrido: ${Math.floor(elapsedSeconds)}s)`,
    };
  }

  claimedTokens.add(token);
  if (claimedTokens.size > 5000) {
    claimedTokens.clear();
  }

  // 1. Aceleração de Chocadeira
  if (data.action === 'incubator_boost') {
    const result = speedupUserIncubator(data.userId, 2);
    if (!result.success) {
      return { success: false, error: result.message || 'Não há ovos para acelerar.' };
    }
    return {
      success: true,
      action: 'incubator_boost',
      userId: data.userId,
      result,
      message: '⚡ Chocadeira adiantada em **2 horas** com sucesso!',
    };
  }

  // 2. Dobro de Recompensas na Expedição
  if (data.action === 'expedition_double') {
    const result = markExpeditionDoubled(data.userId);
    if (!result.success) {
      return { success: false, error: result.message || 'Nenhuma expedição ativa para dobrar.' };
    }
    return {
      success: true,
      action: 'expedition_double',
      userId: data.userId,
      result,
      message: '💎 Bônus de **Recompensas em Dobro (2x)** ativado com sucesso!',
    };
  }

  return { success: false, error: 'Ação de bônus desconhecida.' };
}

module.exports = {
  BONUS_SECRET,
  MIN_WAIT_SECONDS,
  MONETAG_DIRECT_LINK,
  createBonusSession,
  verifyAndClaimBonus,
};
