// Automações por servidor com esquema declarativo: cada módulo declara seus campos uma vez.
// O mesmo esquema valida no servidor e monta o formulário do painel (seção Automações).
// Configuração em data/guilds/<id>/automations.json (só o painel grava; o bot relê a cada 30 s).
const fs = require('node:fs');
const path = require('node:path');

const ID_RE = /^\d{17,20}$/;
const CACHE_MS = 30 * 1000;

// Tipos de campo: toggle, number{min,max}, select{options}, multi{options}, channel, channels,
// role, roles, lines{max,maxLength}, text{maxLength}, hour.
const SCHEMA = {};

function register(key, def) {
  SCHEMA[key] = { group: 'utility', icon: 'Sparkles', ...def, fields: [{ key: 'enabled', type: 'toggle', default: false }, ...(def.fields || [])] };
}

function cleanField(f, value) {
  const d = f.default;
  switch (f.type) {
    case 'toggle':
      return value === undefined ? d : value === true;
    case 'number':
    case 'hour': {
      // BUG corrigido: campo `number` sem min/max gerava NaN (Math.min(undefined) = NaN)
      // e o painel mostrava "NaN" até alguém reabrir a tela.
      const [min, max] =
        f.type === 'hour' ? [0, 23] : [Number.isFinite(f.min) ? f.min : 0, Number.isFinite(f.max) ? f.max : 1_000_000];
      const n = Number(value);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : d;
    }
    case 'select':
      return f.options.includes(value) ? value : d;
    case 'multi':
      return Array.isArray(value) ? [...new Set(value.filter((v) => f.options.includes(v)))] : d;
    case 'channel':
    case 'role':
      return ID_RE.test(String(value || '')) ? String(value) : '';
    case 'channels':
    case 'roles':
      return Array.isArray(value) ? [...new Set(value.map(String).filter((v) => ID_RE.test(v)))].slice(0, f.max || 25) : d || [];
    case 'lines':
      return (Array.isArray(value) ? value : String(value || '').split('\n'))
        .map((l) => String(l).trim().slice(0, f.maxLength || 200))
        .filter(Boolean)
        .slice(0, f.max || 50);
    case 'text':
      return String(value ?? d ?? '').slice(0, f.maxLength || 500);
    case 'color': {
      const raw = String(value ?? d ?? '#8b5cf6').trim().toLowerCase();
      return /^#[0-9a-f]{6}$/.test(raw) ? raw : String(d || '#8b5cf6').toLowerCase();
    }
    default:
      return d;
  }
}

// Configs antigas ganham os campos novos sem perder o que já estava salvo.
const MIGRATIONS = {
  // O lembrete de bump tinha um cargo só (`roleId`); agora aceita até três (`roleIds`).
  bumpReminder: (raw, config) => {
    if (!config.roleIds.length && ID_RE.test(String(raw.roleId || ''))) config.roleIds = [String(raw.roleId)];
    return config;
  },
};

function normalize(key, raw = {}) {
  const def = SCHEMA[key];
  if (!def) return null;
  const config = Object.fromEntries(def.fields.map((f) => [f.key, cleanField(f, raw[f.key])]));
  return MIGRATIONS[key] ? MIGRATIONS[key](raw, config) : config;
}

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'automations.json');
}

function readAll(guildId) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

const cache = new Map();
// BUG corrigido: o cache crescia sem limite (guildId × chave) e ficava para sempre na memória.
const CACHE_MAX = 600;

function putCache(cacheKey, config) {
  cache.set(cacheKey, { at: Date.now(), config });
  if (cache.size <= CACHE_MAX) return;
  // Map mantém ordem de inserção: as primeiras entradas são as mais antigas.
  for (const key of [...cache.keys()].slice(0, cache.size - CACHE_MAX)) cache.delete(key);
}

function getConfig(guildId, key, { fresh = false } = {}) {
  const cacheKey = `${guildId}:${key}`;
  const hit = cache.get(cacheKey);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.config;
  const config = normalize(key, readAll(guildId)[key] || {});
  putCache(cacheKey, config);
  return config;
}

function saveConfig(guildId, key, input = {}) {
  if (!SCHEMA[key]) return null;
  const all = readAll(guildId);
  const before = getConfig(guildId, key, { fresh: true });
  const config = normalize(key, { ...before, ...input });
  all[key] = config;
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(all, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  putCache(`${guildId}:${key}`, config);
  recordChange(guildId, key, input, { before, after: config });
  return config;
}

function saveBulk(guildId, patchMap = {}) {
  const all = readAll(guildId);
  const updated = {};
  for (const [key, patch] of Object.entries(patchMap || {})) {
    if (!SCHEMA[key] || !patch || typeof patch !== 'object') continue;
    const before = getConfig(guildId, key, { fresh: true });
    const config = normalize(key, { ...before, ...patch });
    all[key] = config;
    putCache(`${guildId}:${key}`, config);
    recordChange(guildId, key, patch, { before, after: config });
    updated[key] = config;
  }
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(all, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return updated;
}

// ------------------------------------------------------- histórico de mudanças (novo)
const AUDIT_MAX = 50;

function auditFile(guildId) {
  return path.join(
    process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'),
    'guilds',
    String(guildId),
    'automationsAudit.json'
  );
}

/** Campos que mudaram entre duas configs — usado no histórico e no aviso do painel. */
function diffConfig(key, before = {}, after = {}) {
  const def = SCHEMA[key];
  if (!def) return [];
  const changed = [];
  for (const f of def.fields) {
    const a = before[f.key];
    const b = after[f.key];
    const same = Array.isArray(a) || Array.isArray(b) ? JSON.stringify(a) === JSON.stringify(b) : a === b;
    if (!same) changed.push(f.key);
  }
  return changed;
}

function readAudit(guildId) {
  try {
    const parsed = JSON.parse(fs.readFileSync(auditFile(guildId), 'utf8')) || {};
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [], meta: parsed.meta || {} };
  } catch (_) {
    return { entries: [], meta: {} };
  }
}

function writeAudit(guildId, data) {
  const file = auditFile(guildId);
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2));
    fs.renameSync(`${file}.tmp`, file);
  } catch (_) {}
}

/** Registra quem mudou o quê (campos `updatedAt`/`updatedBy` por automação). */
function recordChange(guildId, key, patch = {}, { by = 'panel', now = Date.now(), before: beforeIn, after: afterIn } = {}) {
  try {
    if (!SCHEMA[key]) return [];
    const audit = readAudit(guildId);
    // efore tem de ser a config de ANTES da gravação: ler o arquivo aqui já pegava o valor novo.
    const before = beforeIn || audit.meta[key]?.config || getConfig(guildId, key, { fresh: true });
    const after = afterIn || normalize(key, { ...before, ...patch });
    const changed = diffConfig(key, before, after);
    if (!changed.length) return [];

    audit.entries = [...audit.entries, { key, changed, by, at: now }].slice(-AUDIT_MAX);
    audit.meta[key] = { updatedAt: now, updatedBy: by, changed, config: after };
    writeAudit(guildId, audit);
    return changed;
  } catch (_) {
    return [];
  }
}

/** `updatedAt`/`updatedBy` da última mudança de uma automação. */
function getMeta(guildId, key) {
  const meta = readAudit(guildId).meta[key];
  if (!meta) return { updatedAt: 0, updatedBy: '', changed: [] };
  return { updatedAt: meta.updatedAt || 0, updatedBy: meta.updatedBy || '', changed: meta.changed || [] };
}

/** Últimas mudanças do servidor (mais recente primeiro). */
function auditLog(guildId, { limit = 20 } = {}) {
  return readAudit(guildId)
    .entries.slice(-Math.min(AUDIT_MAX, Math.max(1, limit)))
    .reverse();
}

// Campos de canal/cargo para o site conferir que pertencem ao servidor.
// Campos escondidos pelo `showIf` (ex.: canal fixo desligado) não entram na conferência.
function matchesShowIf(showIf, config = {}) {
  return Object.entries(showIf || {}).every(([field, want]) => {
    const current = config[field];
    return Array.isArray(want) ? want.includes(current) : current === want;
  });
}

function idsToCheck(key, config) {
  const out = { channels: [], roles: [] };
  for (const f of SCHEMA[key]?.fields || []) {
    if (f.showIf && !matchesShowIf(f.showIf, config)) continue;
    const v = config[f.key];
    if (f.type === 'channel' && v) out.channels.push(v);
    if (f.type === 'channels') out.channels.push(...v);
    if (f.type === 'role' && v) out.roles.push(v);
    if (f.type === 'roles') out.roles.push(...v);
  }
  return out;
}

// Esquema sem nada de código, para o painel montar a tela.
function publicSchema() {
  return Object.fromEntries(Object.entries(SCHEMA).map(([k, d]) => [k, { group: d.group, icon: d.icon, needs: d.needs || [], fields: d.fields }]));
}

function resetCache() {
  cache.clear();
}

for (const [key, def] of Object.entries(require('../config/automationSchemas'))) register(key, def);

module.exports = {
  register,
  normalize,
  getConfig,
  saveConfig,
  saveBulk,
  readAll,
  idsToCheck,
  publicSchema,
  resetCache,
  diffConfig,
  getMeta,
  auditLog,
  SCHEMA,
};
