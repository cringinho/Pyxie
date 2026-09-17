const crypto = require('node:crypto');
const { speedupUserIncubator } = require('./pets');
const { markExpeditionDoubled } = require('./petExpedition');
const { addItem } = require('./inventory');
const { addCoins } = require('./economy');

const BONUS_SECRET = process.env.BONUS_SECRET || 'pyxie_magic_bonus_secret_key_2026';
const MIN_WAIT_SECONDS = 8; // Mínimo de 8-10s no servidor para evitar trapaça
const TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // Válido por 15 minutos
// Cache em memória para prevenção de resgate duplicado (anti-replay)
const claimedTokens = new Set();

/**
 * Cria uma nova sessão de bônus assinada com HMAC.
 */
function createBonusSession(userId, action = 'item_bonus', metadata = {}) {
  const createdAt = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = JSON.stringify({ userId, action, metadata, createdAt, nonce });
  const hmac = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');
  const token = Buffer.from(JSON.stringify({ payload, sig: hmac })).toString('base64url');

  const baseUrl = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org:3000';
  const url = `${baseUrl.replace(/\/$/, '')}/bonus?token=${token}`;

  return {
    token,
    url,
    userId,
    action,
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

  // 1. Aceleração de Chocadeira & Item de Ampulheta
  if (data.action === 'incubator_boost' || data.action === 'item_bonus' || data.action === 'hourglass_bonus') {
    // Adiciona o item à mochila
    addItem(data.userId, 'ampulheta_tempo_2h', 1);
    // Adiciona moedas de recompensa
    addCoins(data.userId, 150);

    // Se o usuário tiver ovos chocando e for a ação incubator_boost, também adianta direto
    let directSpeedup = false;
    if (data.action === 'incubator_boost') {
      const speedRes = speedupUserIncubator(data.userId, 2);
      if (speedRes.success) {
        directSpeedup = true;
      }
    }

    const boostMsg = directSpeedup
      ? '⚡ Sua Chocadeira foi adiantada em **2 horas** E você recebeu **+1 Ampulheta Mágica (2h) ⏳** + **150 Moedas 🪙** na mochila!'
      : '🎁 Você recebeu **1x Ampulheta Mágica (2h) ⏳** e **+150 Moedas 🪙** na sua mochila! Use na Chocadeira quando quiser.';

    return {
      success: true,
      action: data.action,
      userId: data.userId,
      itemAwarded: 'ampulheta_tempo_2h',
      coinsAwarded: 150,
      directSpeedup,
      message: boostMsg,
    };
  }

  // 2. Dobro de Recompensas na Expedição
  if (data.action === 'expedition_double') {
    const result = markExpeditionDoubled(data.userId);
    // Também concede moedas de bônus
    addCoins(data.userId, 100);
    addItem(data.userId, 'ampulheta_tempo_2h', 1);

    return {
      success: true,
      action: 'expedition_double',
      userId: data.userId,
      result,
      message: '💎 Bônus de **Recompensas em Dobro (2x)** ativado com sucesso! (+1 Ampulheta ⏳ e +100 Moedas 🪙 creditadas)',
    };
  }

  // 3. Bônus de Biscoito da Sorte Extra
  if (data.action === 'cookie_bonus') {
    const { grantExtraCookie } = require('./cookie');
    grantExtraCookie(data.userId);
    addCoins(data.userId, 100);
    addItem(data.userId, 'ampulheta_tempo_2h', 1);

    return {
      success: true,
      action: 'cookie_bonus',
      userId: data.userId,
      message: '🥠 **Biscoito da Sorte Extra Desbloqueado!** Você ganhou 1 abertura extra de biscoito (+1 Ampulheta ⏳ e +100 Moedas 🪙). Use `/py-biscoito` para abrir agora!',
    };
  }

  return { success: false, error: 'Ação de bônus desconhecida.' };
}

module.exports = {
  BONUS_SECRET,
  MIN_WAIT_SECONDS,
  createBonusSession,
  verifyAndClaimBonus,
};
