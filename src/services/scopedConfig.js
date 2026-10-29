// Camada de configuração por escopo (inspirada no Red Config), com persistência atômica em JSON.
// Escopos suportados: 'global', 'guild', 'channel', 'role', 'member', 'user'.
// Hierarquia de resolução em servidor: member > channel > role (na ordem fornecida) > guild > global > default.
const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { withFileLock } = require('../utils/fileLock');

const VALID_SCOPES = new Set(['global', 'guild', 'channel', 'role', 'member', 'user']);

// Registro em memória de esquemas/defaults por namespace: { [ns]: { global: {}, guild: {}, ... } }
const registeredSchemas = new Map();

function sanitizeNamespace(namespace) {
  const clean = String(namespace || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  if (!clean) throw new Error('SCOPED_CONFIG_INVALID_NAMESPACE');
  return clean;
}

function fileForNamespace(namespace) {
  const clean = sanitizeNamespace(namespace);
  const root = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
  return path.join(root, 'scoped_config', `${clean}.json`);
}

function emptyStore() {
  return {
    global: {},
    guild: {},
    channel: {},
    role: {},
    member: {},
    user: {},
    updatedAt: 0,
  };
}

function loadNamespace(namespace) {
  const file = fileForNamespace(namespace);
  const raw = readJson(file, null);
  if (!raw || typeof raw !== 'object') return emptyStore();
  return {
    global: raw.global && typeof raw.global === 'object' ? raw.global : {},
    guild: raw.guild && typeof raw.guild === 'object' ? raw.guild : {},
    channel: raw.channel && typeof raw.channel === 'object' ? raw.channel : {},
    role: raw.role && typeof raw.role === 'object' ? raw.role : {},
    member: raw.member && typeof raw.member === 'object' ? raw.member : {},
    user: raw.user && typeof raw.user === 'object' ? raw.user : {},
    updatedAt: Number(raw.updatedAt) || 0,
  };
}

function saveNamespace(namespace, store) {
  const file = fileForNamespace(namespace);
  store.updatedAt = Date.now();
  return writeJsonAtomic(file, store);
}

function deepClone(val) {
  if (val === undefined) return undefined;
  return JSON.parse(JSON.stringify(val));
}

function isPlainObject(v) {
  return Boolean(v && typeof v === 'object' && !Array.isArray(v));
}

function deepMerge(base, override) {
  if (!isPlainObject(base)) return override !== undefined ? deepClone(override) : deepClone(base);
  const out = deepClone(base);
  if (!isPlainObject(override)) return out;
  for (const [k, v] of Object.entries(override)) {
    if (v === undefined) continue;
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = deepClone(v);
    }
  }
  return out;
}

function registerDefaultsInternal(namespace, defaultsByScope = {}) {
  const clean = sanitizeNamespace(namespace);
  const current = registeredSchemas.get(clean) || {};
  for (const scope of VALID_SCOPES) {
    if (defaultsByScope[scope] && isPlainObject(defaultsByScope[scope])) {
      current[scope] = deepMerge(current[scope] || {}, defaultsByScope[scope]);
    }
  }
  registeredSchemas.set(clean, current);
  return current;
}

/**
 * Registra os valores padrão (defaults) de cada escopo para um namespace e devolve o cliente do namespace.
 */
function registerNamespace(namespace, defaultsByScope = {}) {
  return forNamespace(namespace, defaultsByScope);
}

function getDefaults(namespace, scope) {
  const clean = sanitizeNamespace(namespace);
  const schema = registeredSchemas.get(clean);
  if (!schema || !schema[scope]) return {};
  return deepClone(schema[scope]);
}

function scopeKey(scope, id, secondaryId = null) {
  if (!VALID_SCOPES.has(scope)) throw new Error(`SCOPED_CONFIG_INVALID_SCOPE:${scope}`);
  if (scope === 'global') return 'global';
  if (scope === 'member') {
    const gId = String(id || '').trim();
    const uId = String(secondaryId || '').trim();
    if (!gId || !uId) throw new Error('SCOPED_CONFIG_MEMBER_REQUIRES_GUILD_AND_USER');
    return `${gId}:${uId}`;
  }
  const key = String(id || '').trim();
  if (!key) throw new Error(`SCOPED_CONFIG_EMPTY_KEY:${scope}`);
  return key;
}

function getScopeRaw(namespace, scope, id = null, secondaryId = null) {
  const store = loadNamespace(namespace);
  if (scope === 'global') return deepClone(store.global || {});
  const key = scopeKey(scope, id, secondaryId);
  return deepClone(store[scope]?.[key] || {});
}

function getScope(namespace, scope, id = null, secondaryId = null) {
  const defaults = getDefaults(namespace, scope);
  const raw = getScopeRaw(namespace, scope, id, secondaryId);
  return deepMerge(defaults, raw);
}

function setScope(namespace, scope, id, patch, secondaryId = null) {
  const file = fileForNamespace(namespace);
  return withFileLock(file, () => {
    const store = loadNamespace(namespace);
    if (scope === 'global') {
      const data = typeof id === 'object' && id !== null && patch === undefined ? id : patch;
      store.global = deepMerge(store.global || {}, data || {});
      saveNamespace(namespace, store);
      return getScope(namespace, 'global');
    }
    const key = scopeKey(scope, id, secondaryId);
    const current = store[scope]?.[key] || {};
    store[scope][key] = deepMerge(current, patch || {});
    saveNamespace(namespace, store);
    return getScope(namespace, scope, id, secondaryId);
  });
}

function updateScope(namespace, scope, id, updater, secondaryId = null) {
  const file = fileForNamespace(namespace);
  return withFileLock(file, () => {
    const store = loadNamespace(namespace);
    const defaults = getDefaults(namespace, scope);
    if (scope === 'global') {
      const fn = typeof id === 'function' ? id : updater;
      const working = deepMerge(defaults, store.global || {});
      const res = fn(working);
      store.global = res !== undefined ? res : working;
      saveNamespace(namespace, store);
      return deepMerge(defaults, store.global);
    }
    const key = scopeKey(scope, id, secondaryId);
    const working = deepMerge(defaults, store[scope]?.[key] || {});
    const res = updater(working);
    store[scope][key] = res !== undefined ? res : working;
    saveNamespace(namespace, store);
    return deepMerge(defaults, store[scope][key]);
  });
}

function clearScope(namespace, scope, id = null, secondaryId = null) {
  const file = fileForNamespace(namespace);
  return withFileLock(file, () => {
    const store = loadNamespace(namespace);
    if (scope === 'global') {
      store.global = {};
      return saveNamespace(namespace, store);
    }
    const key = scopeKey(scope, id, secondaryId);
    if (store[scope] && key in store[scope]) {
      delete store[scope][key];
      return saveNamespace(namespace, store);
    }
    return true;
  });
}

function listScopeEntries(namespace, scope) {
  if (!VALID_SCOPES.has(scope) || scope === 'global') return {};
  const store = loadNamespace(namespace);
  return deepClone(store[scope] || {});
}

/**
 * Resolve o valor efetivo em cascata:
 * global -> guild -> roleIds (na ordem do array) -> channelId -> member (guildId:userId) -> user (userId)
 */
function resolveEffective(namespace, { guildId = null, channelId = null, roleIds = [], userId = null } = {}) {
  const store = loadNamespace(namespace);
  let merged = deepMerge(getDefaults(namespace, 'global'), getDefaults(namespace, 'guild'));
  merged = deepMerge(merged, store.global || {});

  if (guildId) {
    const gKey = String(guildId);
    if (store.guild?.[gKey]) merged = deepMerge(merged, store.guild[gKey]);
  }
  if (Array.isArray(roleIds)) {
    for (const rId of roleIds) {
      const rKey = String(rId);
      if (store.role?.[rKey]) merged = deepMerge(merged, store.role[rKey]);
    }
  }
  if (channelId) {
    const cKey = String(channelId);
    if (store.channel?.[cKey]) merged = deepMerge(merged, store.channel[cKey]);
  }
  if (guildId && userId) {
    const mKey = `${guildId}:${userId}`;
    if (store.member?.[mKey]) merged = deepMerge(merged, store.member[mKey]);
  }
  if (userId) {
    const uKey = String(userId);
    if (store.user?.[uKey]) merged = deepMerge(merged, store.user[uKey]);
  }
  return merged;
}

/**
 * Apaga todos os registros vinculados a um userId (escopo 'user' e 'member' em qualquer guild)
 * em todos os namespaces registrados ou presentes em disco (usado na exclusão LGPD).
 */
function purgeUserAcrossNamespaces(userId) {
  const uid = String(userId || '').trim();
  if (!uid) return { namespacesCleared: 0, recordsRemoved: 0 };
  const fs = require('node:fs');
  const root = path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'scoped_config');
  const namespaces = new Set([...registeredSchemas.keys()]);
  try {
    if (fs.existsSync(root)) {
      for (const f of fs.readdirSync(root)) {
        if (f.endsWith('.json')) namespaces.add(f.slice(0, -5));
      }
    }
  } catch (_) {}

  let namespacesCleared = 0;
  let recordsRemoved = 0;
  for (const ns of namespaces) {
    const file = fileForNamespace(ns);
    if (!fs.existsSync(file)) continue;
    withFileLock(file, () => {
      const store = loadNamespace(ns);
      let changed = false;
      if (store.user && uid in store.user) {
        delete store.user[uid];
        recordsRemoved += 1;
        changed = true;
      }
      if (store.member) {
        for (const mKey of Object.keys(store.member)) {
          if (mKey.endsWith(`:${uid}`)) {
            delete store.member[mKey];
            recordsRemoved += 1;
            changed = true;
          }
        }
      }
      if (changed) {
        saveNamespace(ns, store);
        namespacesCleared += 1;
      }
    });
  }
  return { namespacesCleared, recordsRemoved };
}

/**
 * Cria um cliente de configuração vinculado a um namespace específico (estilo Red Config).
 */
function forNamespace(namespace, defaultsByScope = null) {
  const clean = sanitizeNamespace(namespace);
  if (defaultsByScope) registerDefaultsInternal(clean, defaultsByScope);
  return {
    namespace: clean,
    registerDefaults: (defs) => registerDefaultsInternal(clean, defs),
    get: (scope, id = null, secondaryId = null) => getScope(clean, scope, id, secondaryId),
    getRaw: (scope, id = null, secondaryId = null) => getScopeRaw(clean, scope, id, secondaryId),
    set: (scope, id, patch, secondaryId = null) => setScope(clean, scope, id, patch, secondaryId),
    update: (scope, id, fn, secondaryId = null) => updateScope(clean, scope, id, fn, secondaryId),
    clear: (scope, id = null, secondaryId = null) => clearScope(clean, scope, id, secondaryId),
    global: () => ({
      get: () => getScope(clean, 'global'),
      set: (patch) => setScope(clean, 'global', patch),
      update: (fn) => updateScope(clean, 'global', fn),
      clear: () => clearScope(clean, 'global'),
    }),
    guild: (guildId) => ({
      get: () => getScope(clean, 'guild', guildId),
      getRaw: () => getScopeRaw(clean, 'guild', guildId),
      set: (patch) => setScope(clean, 'guild', guildId, patch),
      update: (fn) => updateScope(clean, 'guild', guildId, fn),
      clear: () => clearScope(clean, 'guild', guildId),
    }),
    channel: (channelId) => ({
      get: () => getScope(clean, 'channel', channelId),
      getRaw: () => getScopeRaw(clean, 'channel', channelId),
      set: (patch) => setScope(clean, 'channel', channelId, patch),
      update: (fn) => updateScope(clean, 'channel', channelId, fn),
      clear: () => clearScope(clean, 'channel', channelId),
    }),
    role: (roleId) => ({
      get: () => getScope(clean, 'role', roleId),
      getRaw: () => getScopeRaw(clean, 'role', roleId),
      set: (patch) => setScope(clean, 'role', roleId, patch),
      update: (fn) => updateScope(clean, 'role', roleId, fn),
      clear: () => clearScope(clean, 'role', roleId),
    }),
    member: (guildId, userId) => ({
      get: () => getScope(clean, 'member', guildId, userId),
      getRaw: () => getScopeRaw(clean, 'member', guildId, userId),
      set: (patch) => setScope(clean, 'member', guildId, patch, userId),
      update: (fn) => updateScope(clean, 'member', guildId, fn, userId),
      clear: () => clearScope(clean, 'member', guildId, userId),
    }),
    user: (userId) => ({
      get: () => getScope(clean, 'user', userId),
      getRaw: () => getScopeRaw(clean, 'user', userId),
      set: (patch) => setScope(clean, 'user', userId, patch),
      update: (fn) => updateScope(clean, 'user', userId, fn),
      clear: () => clearScope(clean, 'user', userId),
    }),
    list: (scope) => listScopeEntries(clean, scope),
    resolve: (ctx) => resolveEffective(clean, ctx),
  };
}

module.exports = {
  VALID_SCOPES,
  registerNamespace,
  getDefaults,
  getScope,
  getScopeRaw,
  setScope,
  updateScope,
  clearScope,
  listScopeEntries,
  resolveEffective,
  purgeUserAcrossNamespaces,
  forNamespace,
};
