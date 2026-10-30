const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const COOKIE_NAME = 'pyxie_account';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function getSessionsFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
  return path.join(baseDir, 'accountSessions.json');
}

function getSecret() {
  return process.env.PANEL_SECRET || process.env.API_SECRET_TOKEN || 'pyxie_secret_salt_account_default';
}

let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = JSON.parse(fs.readFileSync(getSessionsFile(), 'utf8'));
    cache = raw && typeof raw.sessions === 'object' ? raw : { sessions: {} };
  } catch (_) {
    cache = { sessions: {} };
  }
  return cache;
}

function save() {
  const file = getSessionsFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
  fs.renameSync(tmp, file);
}

function sign(id) {
  return crypto.createHmac('sha256', getSecret()).update(id).digest('hex');
}

function createSession(accountId) {
  const id = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const state = load();

  state.sessions[id] = {
    id,
    accountId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  save();
  return `${id}.${sign(id)}`;
}

function readSession(cookieValue) {
  if (!cookieValue || typeof cookieValue !== 'string') return null;
  const [id, sig] = cookieValue.split('.');
  if (!id || !sig) return null;
  if (sig !== sign(id)) return null;

  const state = load();
  const s = state.sessions[id];
  if (!s || s.expiresAt <= Date.now()) {
    if (s) {
      delete state.sessions[id];
      save();
    }
    return null;
  }
  return s;
}

function destroySession(cookieValue) {
  if (!cookieValue) return;
  const [id] = cookieValue.split('.');
  if (!id) return;
  const state = load();
  if (state.sessions[id]) {
    delete state.sessions[id];
    save();
  }
}

function getCookie(req) {
  const h = req.headers.cookie;
  if (!h) return null;
  for (const part of h.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === COOKIE_NAME) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function buildCookie(value) {
  const isSecure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

function setCookie(res, value) {
  const isSecure = process.env.NODE_ENV === 'production';
  const cookieStr = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookieStr);
}

function clearCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

module.exports = {
  createSession,
  readSession,
  destroySession,
  getCookie,
  setCookie,
  buildCookie,
  clearCookie,
};

