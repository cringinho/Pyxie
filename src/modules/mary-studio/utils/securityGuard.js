const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MARY_DISCORD_ID = '1463644930080637140';
const OWNER_SNOWFLAKE = '214153735281180673';
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutos para link mágico
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias de sessão

function getSecretKey() {
  return process.env.MARY_STUDIO_SECRET || process.env.API_SECRET_TOKEN || process.env.PANEL_SECRET || 'mary_studio_secret_super_safe_2026';
}

function getSecurityFile() {
  return process.env.MARY_SECURITY_PATH || path.join(__dirname, '..', '..', '..', '..', 'data', 'marySecurity.json');
}

function readSecurityData() {
  const filePath = getSecurityFile();
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const initial = {
        sessions: {},
        usedNonces: {},
        ipAttempts: {},
        auditLogs: [],
      };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      sessions: parsed.sessions || {},
      usedNonces: parsed.usedNonces || {},
      ipAttempts: parsed.ipAttempts || {},
      auditLogs: parsed.auditLogs || [],
    };
  } catch (err) {
    console.error('[MarySecurity] Erro ao ler marySecurity.json:', err.message);
    return { sessions: {}, usedNonces: {}, ipAttempts: {}, auditLogs: [] };
  }
}

function writeSecurityData(data) {
  const filePath = getSecurityFile();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error('[MarySecurity] Erro ao salvar marySecurity.json:', err.message);
    return false;
  }
}

function isAuthorizedUser(userId) {
  if (!userId || typeof userId !== 'string') return false;
  const ownerEnv = process.env.OWNER_ID || process.env.DISCORD_OWNER_ID;
  return Boolean(userId === MARY_DISCORD_ID || userId === OWNER_SNOWFLAKE || (ownerEnv && userId === ownerEnv));
}

function normalizeIp(req) {
  let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '';
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return String(ip).trim() || '127.0.0.1';
}

function isCrawler(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes('discordbot') ||
    ua.includes('twitterbot') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('whatsapp') ||
    ua.includes('telegrambot') ||
    ua.includes('slackbot') ||
    ua.includes('googlebot') ||
    ua.includes('bingbot')
  );
}

function hashUserAgent(userAgent) {
  return crypto.createHash('sha256').update(String(userAgent || '')).digest('hex').slice(0, 32);
}

/**
 * Cria Link Mágico HMAC de uso único
 */
function createMagicLink(userId, options = {}, customBaseUrl = null) {
  if (!isAuthorizedUser(userId)) {
    return { success: false, error: 'Acesso negado. Este estúdio é exclusivo da Mary.' };
  }

  const nonce = crypto.randomBytes(32).toString('hex');
  const createdAt = Date.now();
  const expiresAt = createdAt + TOKEN_TTL_MS;

  const payload = JSON.stringify({
    userId,
    nonce,
    createdAt,
    expiresAt,
    editMessageId: options.editMessageId || null,
    channelId: options.channelId || null,
  });

  const secret = getSecretKey();
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const token = Buffer.from(JSON.stringify({ payload, sig })).toString('base64url');

  const baseUrl = (customBaseUrl || process.env.PUBLIC_BASE_URL || process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org:3000').replace(/\/+$/, '');
  const url = `${baseUrl}/mary/auth/magic?token=${token}`;

  return {
    success: true,
    token,
    url,
    expiresAt,
    nonce,
  };
}

/**
 * Consome token mágico (Single-Use Token)
 */
function consumeMagicToken(token, req, client = null) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token não fornecido.' };
  }

  let parsedToken;
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    parsedToken = JSON.parse(raw);
  } catch (_) {
    return { valid: false, error: 'Token corrompido ou formato inválido.' };
  }

  if (!parsedToken?.payload || !parsedToken?.sig) {
    return { valid: false, error: 'Token incompleto.' };
  }

  const secret = getSecretKey();
  const expectedSig = crypto.createHmac('sha256', secret).update(parsedToken.payload).digest('hex');
  if (parsedToken.sig !== expectedSig) {
    return { valid: false, error: 'Assinatura inválida do token.' };
  }

  let data;
  try {
    data = JSON.parse(parsedToken.payload);
  } catch (_) {
    return { valid: false, error: 'Payload do token inválido.' };
  }

  if (!isAuthorizedUser(data.userId)) {
    return { valid: false, error: 'Usuário não autorizado.' };
  }

  if (Date.now() > data.expiresAt) {
    return { valid: false, error: 'Este link mágico de acesso expirou. Gere um novo no Discord!' };
  }

  const security = readSecurityData();
  if (security.usedNonces[data.nonce]) {
    return { valid: false, error: 'Este link mágico já foi consumido e não pode ser reutilizado.' };
  }

  // Consome nonce
  security.usedNonces[data.nonce] = Date.now();

  // Limpa nonces antigos (> 24h)
  const now = Date.now();
  for (const [n, ts] of Object.entries(security.usedNonces)) {
    if (now - ts > 24 * 60 * 60 * 1000) delete security.usedNonces[n];
  }

  // Emite cookie de sessão
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const userAgent = req?.headers ? req.headers['user-agent'] : '';
  const ip = req ? normalizeIp(req) : '127.0.0.1';

  security.sessions[sessionToken] = {
    userId: data.userId,
    ip,
    userAgentHash: hashUserAgent(userAgent),
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  security.auditLogs.unshift({
    event: 'LOGIN_SUCCESS',
    userId: data.userId,
    ip,
    userAgent: String(userAgent).slice(0, 100),
    timestamp: now,
  });

  if (security.auditLogs.length > 200) {
    security.auditLogs = security.auditLogs.slice(0, 200);
  }

  writeSecurityData(security);

  // Alerta em tempo real na DM da Mary
  if (client && typeof client.users?.fetch === 'function') {
    client.users.fetch(MARY_DISCORD_ID).then((maryUser) => {
      if (maryUser && typeof maryUser.send === 'function') {
        const timeStr = new Date().toLocaleTimeString('pt-BR');
        maryUser.send({
          content: `🔐 **Novo acesso ao seu Estúdio Web!**\n• Horário: \`${timeStr}\`\n• IP: \`${ip}\`\nSe não foi você, use \`/py-mary\` no servidor e clique em **🚨 Desconectar Todos os Aparelhos**.`,
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  return {
    valid: true,
    sessionToken,
    userId: data.userId,
    editMessageId: data.editMessageId || null,
    channelId: data.channelId || null,
  };
}

/**
 * Valida sessão ativa
 */
function isValidSession(sessionToken) {
  if (!sessionToken || typeof sessionToken !== 'string') return false;
  const security = readSecurityData();
  const session = security.sessions[sessionToken];
  if (!session) return false;

  if (Date.now() > session.expiresAt) {
    delete security.sessions[sessionToken];
    writeSecurityData(security);
    return false;
  }

  return isAuthorizedUser(session.userId);
}

/**
 * Revoga todas as sessões ativas
 */
function revokeAllSessions() {
  const security = readSecurityData();
  const count = Object.keys(security.sessions).length;
  security.sessions = {};
  security.auditLogs.unshift({
    event: 'REVOKE_ALL_SESSIONS',
    timestamp: Date.now(),
  });
  writeSecurityData(security);
  return { success: true, count };
}

/**
 * Registra tentativa falha e checa rate limit por IP
 */
function recordFailedAttempt(ip) {
  const security = readSecurityData();
  const now = Date.now();
  const record = security.ipAttempts[ip] || { count: 0, firstAttempt: now, blockedUntil: 0 };

  if (record.blockedUntil > now) {
    return { blocked: true, remainingSec: Math.ceil((record.blockedUntil - now) / 1000) };
  }

  // Janela de 10 minutos
  if (now - record.firstAttempt > 10 * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
  } else {
    record.count += 1;
  }

  if (record.count >= 5) {
    record.blockedUntil = now + 60 * 60 * 1000; // 60 min block
    security.ipAttempts[ip] = record;
    writeSecurityData(security);
    return { blocked: true, remainingSec: 3600 };
  }

  security.ipAttempts[ip] = record;
  writeSecurityData(security);
  return { blocked: false, count: record.count };
}

function isIpBlocked(ip) {
  const security = readSecurityData();
  const record = security.ipAttempts[ip];
  if (!record || !record.blockedUntil) return false;
  return record.blockedUntil > Date.now();
}

/**
 * Extrai cookie do request
 */
function getCookie(req, name) {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Middleware de Rate Limit
 */
function rateLimiterMiddleware(req, res, next) {
  const ip = normalizeIp(req);
  if (isIpBlocked(ip)) {
    return res.status(429).json({
      error: 'Muitas tentativas inválidas. IP bloqueado temporariamente por 60 minutos por segurança.',
    });
  }
  next();
}

/**
 * Middleware de Autenticação da Mary
 */
function requireMaryAuth(req, res, next) {
  const sessionCookie = getCookie(req, 'mary_session');
  const authHeader = req.headers?.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = sessionCookie || bearerToken;

  if (token && isValidSession(token)) {
    return next();
  }

  const ip = normalizeIp(req);
  recordFailedAttempt(ip);

  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Use /py-mary no Discord para entrar.' });
  }

  // Página bloqueada amigável para acessos diretos no navegador
  return res.status(403).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Restrito • Estúdio da Mary</title>
  <style>
    body { background: #141418; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 16px; }
    .card { background: #1e1e26; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 20px; padding: 32px; max-width: 460px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
    h1 { color: #ec4899; font-size: 22px; margin-bottom: 12px; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .badge { display: inline-block; background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; color: #d8b4fe; padding: 8px 16px; border-radius: 12px; font-weight: 600; font-family: monospace; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 48px; margin-bottom: 12px;">🔒</div>
    <h1>Painel Privado da Mary</h1>
    <p>Este estúdio administrativo é de uso exclusivo da <strong>Mary</strong>.<br>Para entrar com 1 clique pelo seu celular ou computador:</p>
    <div class="badge">/py-mary</div>
    <p style="margin-top: 16px; font-size: 13px;">Digite o comando acima dentro do seu servidor no Discord e toque no botão secreto de acesso.</p>
  </div>
</body>
</html>`);
}

/**
 * Middleware CSRF
 */
function csrfProtection(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (req.path === '/api/mary/auth/consume-magic') {
      return next();
    }
    const csrfHeader = req.headers['x-mary-csrf'];
    if (csrfHeader !== '1' && csrfHeader !== 'true') {
      return res.status(403).json({ error: 'Cabeçalho CSRF ausente ou inválido.' });
    }
  }
  next();
}

module.exports = {
  MARY_DISCORD_ID,
  OWNER_SNOWFLAKE,
  TOKEN_TTL_MS,
  SESSION_TTL_MS,
  isAuthorizedUser,
  normalizeIp,
  isCrawler,
  createMagicLink,
  consumeMagicToken,
  isValidSession,
  revokeAllSessions,
  recordFailedAttempt,
  isIpBlocked,
  getCookie,
  rateLimiterMiddleware,
  requireMaryAuth,
  csrfProtection,
  readSecurityData,
  writeSecurityData,
};
