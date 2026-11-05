const crypto = require('node:crypto');
const fs = require('node:fs');
const { addCoins } = require('./economy');
const { dataPath, ensureDataDir } = require('../utils/dataDir');

/**
 * Segredo que assina os links de bônus. Nunca uma chave fixa no código (quem lesse o
 * repositório forjaria tokens e geraria moedas). Ordem: `BONUS_SECRET` do ambiente; senão
 * um segredo aleatório criado uma vez em `data/bonusSecret.json` e compartilhado pelo bot
 * e pelo site (a criação usa `.tmp` + link exclusivo: os dois processos ficam com o mesmo).
 */
function resolveBonusSecret() {
  const fromEnv = String(process.env.BONUS_SECRET || '').trim();
  if (fromEnv.length >= 16) return fromEnv;
  const file = dataPath('bonusSecret.json');
  const readExisting = () => {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      return typeof parsed?.secret === 'string' && parsed.secret.length >= 32 ? parsed.secret : null;
    } catch (_) {
      return null;
    }
  };
  const existing = readExisting();
  if (existing) return existing;
  ensureDataDir();
  const tmp = `${file}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify({ secret: crypto.randomBytes(32).toString('hex'), createdAt: new Date().toISOString() }), { mode: 0o600 });
  try {
    fs.linkSync(tmp, file); // falha com EEXIST se outro processo criou antes: usamos o dele
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
  const secret = readExisting();
  if (!secret) throw new Error('[bonusTimer] Não consegui criar o segredo dos links de bônus.');
  if (process.env.NODE_ENV === 'production') {
    console.warn('[bonusTimer] BONUS_SECRET ausente: usando o segredo aleatório salvo em data/bonusSecret.json.');
  }
  return secret;
}

const BONUS_SECRET = resolveBonusSecret();
const MIN_WAIT_SECONDS = 8; // Mínimo de 8-10s no servidor para evitar trapaça
const TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // Válido por 15 minutos
const WEB_BONUS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 vez ao dia (24h)
// Moedinhas do biscoito extra pelo portal web (o /py-cookie mostra este valor)
const COOKIE_BONUS_COINS = 25;
// Teto do biscoito extra: 1 por 24h. Antes cada /py-cookie em espera gerava um link novo
// e cada link pagava +25, sem limite.
const COOKIE_BONUS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Marca o resgate na conta, sob a trava do economy.json (atômico entre bot e site):
 * o token usado fica gravado em disco (sobrevive a reinício) e o teto de 24h é checado
 * e gravado na mesma operação. Devolve 'ok' | 'used' | 'cooldown'.
 */
function markClaim(userId, tokenKey, cooldownField, cooldownMs, now) {
  const { updateUserAccount } = require('./economy');
  let outcome = 'ok';
  updateUserAccount(userId, (acc) => {
    const used = acc.bonusClaimedTokens && typeof acc.bonusClaimedTokens === 'object' ? acc.bonusClaimedTokens : {};
    for (const [key, ts] of Object.entries(used)) {
      if (now - Number(ts) > TOKEN_MAX_AGE_MS * 2) delete used[key];
    }
    acc.bonusClaimedTokens = used;
    if (used[tokenKey]) {
      outcome = 'used';
      return;
    }
    const last = acc[cooldownField] ? new Date(acc[cooldownField]).getTime() : 0;
    if (now - last < cooldownMs) {
      outcome = 'cooldown';
      return;
    }
    used[tokenKey] = now;
    acc[cooldownField] = new Date(now).toISOString();
  });
  return outcome;
}

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

  const baseUrl = process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br';
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
    return { success: false, code: 'invalid_token', error: 'Token inválido ou não fornecido. / Missing or invalid token.' };
  }

  let parsed;
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    parsed = JSON.parse(raw);
  } catch (_) {
    return { success: false, code: 'invalid_token', error: 'Formato de token corrompido. / Corrupted token.' };
  }

  const { payload, sig } = parsed || {};
  if (!payload || typeof payload !== 'string' || !sig || typeof sig !== 'string') {
    return { success: false, code: 'invalid_token', error: 'Estrutura de token inválida. / Invalid token.' };
  }

  const expectedSig = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');

  const sigOk =
    sig.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  if (!sigOk) {
    return { success: false, code: 'invalid_token', error: 'Assinatura de segurança inválida ou adulterada. / Invalid or tampered signature.' };
  }

  let data;
  try {
    data = JSON.parse(payload);
  } catch (_) {
    return { success: false, code: 'invalid_token', error: 'Payload de dados ilegível. / Unreadable token data.' };
  }

  const isEn = data.lang === 'en' || data.metadata?.lang === 'en';
  const now = Date.now();
  const elapsedSeconds = (now - data.createdAt) / 1000;

  if (typeof data.userId !== 'string' || !data.userId || !Number.isFinite(Number(data.createdAt))) {
    return { success: false, code: 'invalid_token', error: isEn ? 'Invalid token.' : 'Token inválido.' };
  }

  if (now - data.createdAt > TOKEN_MAX_AGE_MS) {
    return {
      success: false,
      code: 'expired',
      error: isEn
        ? 'This session has expired! Please generate a new link on Discord.'
        : 'Esta sessão expirou! Gere um novo link no Discord.',
    };
  }

  if (elapsedSeconds < MIN_WAIT_SECONDS) {
    return {
      success: false,
      code: 'too_early',
      error: isEn
        ? `Please wait the full 10 seconds on the page before claiming! (Elapsed: ${Math.floor(elapsedSeconds)}s)`
        : `Aguarde os 10 segundos completos na página antes de resgatar! (Tempo decorrido: ${Math.floor(elapsedSeconds)}s)`,
    };
  }

  const tokenKey = crypto.createHash('sha256').update(token).digest('hex').slice(0, 32);
  const alreadyClaimed = {
    success: false,
    code: 'already_claimed',
    error: isEn ? 'This bonus link was already claimed!' : 'Este bônus já foi resgatado anteriormente!',
  };

  // 1. Recompensa do Biscoito da Sorte (cookie_bonus) — 1 por 24h
  if (data.action === 'cookie_bonus') {
    const outcome = markClaim(data.userId, tokenKey, 'lastCookieWebBonusAt', COOKIE_BONUS_COOLDOWN_MS, now);
    if (outcome === 'used') return alreadyClaimed;
    if (outcome === 'cooldown') {
      return {
        success: false,
        code: 'cookie_cooldown',
        error: isEn
          ? 'You already got your extra fortune cookie today! Come back in 24 hours.'
          : 'Você já ganhou seu biscoito extra hoje! Volte em 24 horas.',
      };
    }
    const { grantExtraCookie } = require('./cookie');
    grantExtraCookie(data.userId);
    addCoins(data.userId, COOKIE_BONUS_COINS);
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
  const outcome = markClaim(data.userId, tokenKey, 'lastWebBonusAt', WEB_BONUS_COOLDOWN_MS, now);
  if (outcome === 'used') return alreadyClaimed;
  if (outcome === 'cooldown') {
    return {
      success: false,
      code: 'daily_cooldown',
      error: isEn
        ? 'You have already claimed your daily web bonus today! Please wait 24 hours.'
        : 'Você já resgatou seu bônus diário na web hoje! Aguarde 24 horas.',
    };
  }

  addCoins(data.userId, 75);

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
  COOKIE_BONUS_COINS,
  COOKIE_BONUS_COOLDOWN_MS,
  getWebBonusStatus,
  createBonusSession,
  verifyAndClaimBonus,
};
