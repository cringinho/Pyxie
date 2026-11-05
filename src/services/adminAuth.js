const crypto = require('node:crypto');

const OWNER_SNOWFLAKE = '214153735281180673';

// Sem segredo reserva no código: sem PANEL_SECRET/API_SECRET_TOKEN no .env, o acesso de
// máquina (chave mestra) recusa tudo.
function getAdminSecret() {
  return process.env.PANEL_SECRET || process.env.API_SECRET_TOKEN || null;
}

let missingSecretLogged = false;
function warnMissingSecret() {
  if (missingSecretLogged) return;
  missingSecretLogged = true;
  console.error('[AdminAuth] PANEL_SECRET não configurado no .env: o acesso por chave mestra fica recusado até ele existir.');
}

/*
 * Acesso às rotas antigas do dono (/api/admin/*, Sazonal, Museu, Parcerias, emojis).
 *
 * Auditoria Q263/Q267/Q279: a liberação por IP (lista fixa, 192.168.x e 10.x), o link
 * mágico do /py-admin e a chave mestra na URL (?token=) saíram. Agora só entram:
 *   1. o dono logado no painel com Discord (cookie da sessão do painel). Pedido que muda
 *      algo exige também o cabeçalho X-Pyxie-Panel, que outro site não consegue mandar
 *      sem CORS (proteção contra formulário escondido / CSRF);
 *   2. acesso de máquina com a chave mestra num CABEÇALHO (Authorization: Bearer ou
 *      X-API-Key). Cabeçalho não aparece em histórico nem em log de URL.
 */

/** Compara a chave mestra em tempo constante. */
function isMasterSecretValid(tokenOrSecret) {
  if (!tokenOrSecret || typeof tokenOrSecret !== 'string') return false;
  const secret = getAdminSecret();
  if (!secret) {
    warnMissingSecret();
    return false;
  }
  const a = Buffer.from(tokenOrSecret);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getCookie(req, name) {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// O dono logado no painel novo (login com Discord).
function hasOwnerPanelSession(req) {
  const panelSessions = require('./panelSessions');
  const session = panelSessions.readCookieValue(panelSessions.getCookie(req));
  return Boolean(session && session.userId === OWNER_SNOWFLAKE);
}

/** Chave mestra enviada por cabeçalho (nunca por ?token= na URL). */
function hasMachineSecret(req) {
  const authHeader = String(req.headers?.authorization || '');
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const apiKey = req.headers?.['x-api-key'];
  return Boolean((bearer && isMasterSecretValid(bearer)) || (typeof apiKey === 'string' && isMasterSecretValid(apiKey)));
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Pedido que muda algo precisa do cabeçalho do painel (anti-CSRF). */
function hasPanelHeader(req) {
  return String(req.headers?.['x-pyxie-panel'] || '') === '1';
}

/**
 * Decide o acesso sem depender do Express (testável):
 * 'ok' | 'csrf' (sessão certa, mas pedido sem o cabeçalho do painel) | 'denied'.
 */
function adminAccess(req) {
  if (hasMachineSecret(req)) return 'ok';
  if (hasOwnerPanelSession(req)) {
    if (!SAFE_METHODS.has(String(req.method || 'GET').toUpperCase()) && !hasPanelHeader(req)) return 'csrf';
    return 'ok';
  }
  return 'denied';
}

function requireAdminAuth(req, res, next) {
  const verdict = adminAccess(req);
  if (verdict === 'ok') return next();
  if (verdict === 'csrf') return res.status(403).json({ success: false, error: 'csrf_header_missing' });
  return res.status(401).json({ success: false, error: 'not_authenticated' });
}

module.exports = {
  OWNER_SNOWFLAKE,
  getAdminSecret,
  isMasterSecretValid,
  hasOwnerPanelSession,
  hasMachineSecret,
  adminAccess,
  requireAdminAuth,
  getCookie,
};
