// Sessões do painel novo (login com Discord). Ficam em data/panelSessions.json com escrita
// atômica para sobreviver a reinícios. O cookie leva "<id>.<assinatura HMAC com PANEL_SECRET>".
// O access token do Discord nunca é guardado: só o perfil e a lista de servidores lidos no login.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const COOKIE_NAME = 'pyxie_panel';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionsFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'panelSessions.json');
}

function getSecret() {
  return process.env.PANEL_SECRET || process.env.API_SECRET_TOKEN || null;
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

function prune(now = Date.now()) {
  const state = load();
  let changed = false;
  for (const [id, s] of Object.entries(state.sessions)) {
    if (!s || s.expiresAt <= now) {
      delete state.sessions[id];
      changed = true;
    }
  }
  return changed;
}

function sign(id) {
  return crypto.createHmac('sha256', getSecret()).update(id).digest('hex');
}

function createSession({ user, guilds }) {
  if (!getSecret()) throw new Error('panel_secret_missing');
  const id = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const state = load();
  prune(now);
  state.sessions[id] = {
    userId: String(user.id),
    username: user.username || '',
    globalName: user.global_name || null,
    avatar: user.avatar || null,
    guilds: (guilds || []).map((g) => ({
      id: String(g.id),
      name: g.name,
      icon: g.icon || null,
      owner: Boolean(g.owner),
      permissions: String(g.permissions || '0'),
    })),
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  save();
  return { id, cookieValue: `${id}.${sign(id)}`, session: state.sessions[id] };
}

function readCookieValue(value) {
  if (!getSecret() || typeof value !== 'string') return null;
  const [id, sig] = value.split('.');
  if (!id || !sig) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  const session = load().sessions[id];
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    delete load().sessions[id];
    save();
    return null;
  }
  return { id, ...session };
}

function destroySession(id) {
  const state = load();
  if (state.sessions[id]) {
    delete state.sessions[id];
    save();
  }
}

function getCookie(req, name = COOKIE_NAME) {
  const header = req.headers?.cookie;
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildCookie(value, maxAgeMs = SESSION_TTL_MS) {
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(maxAgeMs / 1000)}`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// Só para testes: esquece o cache em memória.
function _resetCache() {
  cache = null;
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_MS,
  createSession,
  readCookieValue,
  destroySession,
  getCookie,
  buildCookie,
  clearCookie,
  _resetCache,
};
