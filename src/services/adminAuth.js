const crypto = require('node:crypto');

const OWNER_SNOWFLAKE = '214153735281180673';
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutos
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

const ADMIN_SECRET = process.env.PANEL_SECRET || process.env.API_SECRET_TOKEN || 'pyxie_owner_master_secret_2026';

// IPs autorizados para o painel administrativo
const DEFAULT_ALLOWED_IPS = new Set([
  '127.0.0.1',
  '::1',
  'localhost',
  '179.153.90.39',  // IP Público Oficial do Dono
  '26.194.245.13',  // Radmin VPN
  '192.168.0.81',   // Rede Local LAN
]);

// Sessões administrativas ativas em memória (Session Token -> Dados)
const activeAdminSessions = new Map();
// Cache de tokens mágicos de uso único já consumidos (anti-replay)
const consumedMagicTokens = new Set();

/**
 * Normaliza endereços IP recebidos pelo Express (trata IPv6-mapped IPv4 e proxies).
 */
function normalizeClientIp(req) {
  let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '';
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip.trim();
}

/**
 * Verifica se um IP pertence à allowlist do administrador.
 */
function isIpAllowed(req) {
  const ip = normalizeClientIp(req);
  if (!ip) return false;

  // Permite localhost e loopback
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;

  // Permite IPs explícitos configurados
  if (DEFAULT_ALLOWED_IPS.has(ip)) return true;

  // Permite IPs definidos no ambiente (.env)
  if (process.env.ADMIN_ALLOWED_IPS) {
    const envIps = process.env.ADMIN_ALLOWED_IPS.split(',').map((s) => s.trim());
    if (envIps.includes(ip)) return true;
  }

  // Permite redes privadas locais (192.168.x.x, 10.x.x.x)
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;

  return false;
}

/**
 * Gera um link de acesso mágico confidencial assinado com HMAC-SHA256,
 * de uso único, com expiração em 15 minutos, exclusivo para o Snowflake do Dono.
 */
function createOwnerMagicToken(userId) {
  if (userId !== OWNER_SNOWFLAKE) {
    return { success: false, error: 'Acesso restrito ao proprietário da Pyxie.' };
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const createdAt = Date.now();
  const expiresAt = createdAt + TOKEN_TTL_MS;

  const payload = JSON.stringify({
    userId,
    type: 'owner_magic_auth',
    nonce,
    createdAt,
    expiresAt,
  });

  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  const token = Buffer.from(JSON.stringify({ payload, sig })).toString('base64url');

  const baseUrl = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org:3000';
  const url = `${baseUrl.replace(/\/$/, '')}/admin?token=${token}`;

  return {
    success: true,
    token,
    url,
    expiresAt,
  };
}

/**
 * Valida um token mágico de uso único e gera uma sessão de administração autenticada.
 */
function verifyMagicToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token não fornecido.' };
  }

  if (consumedMagicTokens.has(token)) {
    return { valid: false, error: 'Este link mágico de acesso já foi utilizado. Gere um novo no Discord!' };
  }

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const { payload, sig } = JSON.parse(raw);

    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return { valid: false, error: 'Assinatura criptográfica do token inválida.' };
    }

    const data = JSON.parse(payload);
    if (data.userId !== OWNER_SNOWFLAKE) {
      return { valid: false, error: 'Identidade de usuário não corresponde ao proprietário.' };
    }

    if (Date.now() > data.expiresAt) {
      return { valid: false, error: 'Este link de acesso expirou. Solicite um novo no Discord.' };
    }

    // Marca como consumido (anti-replay)
    consumedMagicTokens.add(token);
    if (consumedMagicTokens.size > 500) {
      consumedMagicTokens.clear();
    }

    // Cria sessão administrativa de 12h
    const sessionToken = crypto.randomBytes(32).toString('hex');
    activeAdminSessions.set(sessionToken, {
      userId: data.userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    return { valid: true, sessionToken, userId: data.userId };
  } catch (err) {
    return { valid: false, error: 'Estrutura do token inválida ou corrompida.' };
  }
}

/**
 * Valida se uma sessão administrativa ainda é válida.
 */
function isValidAdminSession(sessionToken) {
  if (!sessionToken || typeof sessionToken !== 'string') return false;
  const session = activeAdminSessions.get(sessionToken);
  if (!session) return false;

  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(sessionToken);
    return false;
  }

  return session.userId === OWNER_SNOWFLAKE;
}

/**
 * Verifica chave mestra enviada diretamente via Header ou Query.
 */
function isMasterSecretValid(tokenOrSecret) {
  if (!tokenOrSecret || typeof tokenOrSecret !== 'string') return false;
  const secret = process.env.PANEL_SECRET || process.env.API_SECRET_TOKEN;
  if (!secret) return false;
  return tokenOrSecret === secret;
}

module.exports = {
  OWNER_SNOWFLAKE,
  DEFAULT_ALLOWED_IPS,
  normalizeClientIp,
  isIpAllowed,
  createOwnerMagicToken,
  verifyMagicToken,
  isValidAdminSession,
  isMasterSecretValid,
};

