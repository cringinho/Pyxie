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
      const [min, max] = f.type === 'hour' ? [0, 23] : [f.min, f.max];
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

function normalize(key, raw = {}) {
  const def = SCHEMA[key];
  if (!def) return null;
  return Object.fromEntries(def.fields.map((f) => [f.key, cleanField(f, raw[f.key])]));
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
function getConfig(guildId, key, { fresh = false } = {}) {
  const cacheKey = `${guildId}:${key}`;
  const hit = cache.get(cacheKey);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.config;
  const config = normalize(key, readAll(guildId)[key] || {});
  cache.set(cacheKey, { at: Date.now(), config });
  return config;
}

function saveConfig(guildId, key, input = {}) {
  if (!SCHEMA[key]) return null;
  const all = readAll(guildId);
  const config = normalize(key, { ...getConfig(guildId, key, { fresh: true }), ...input });
  all[key] = config;
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(all, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  cache.set(`${guildId}:${key}`, { at: Date.now(), config });
  return config;
}

function saveBulk(guildId, patchMap = {}) {
  const all = readAll(guildId);
  const updated = {};
  for (const [key, patch] of Object.entries(patchMap || {})) {
    if (!SCHEMA[key] || !patch || typeof patch !== 'object') continue;
    const config = normalize(key, { ...getConfig(guildId, key, { fresh: true }), ...patch });
    all[key] = config;
    cache.set(`${guildId}:${key}`, { at: Date.now(), config });
    updated[key] = config;
  }
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(all, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return updated;
}

// Campos de canal/cargo para o site conferir que pertencem ao servidor.
function idsToCheck(key, config) {
  const out = { channels: [], roles: [] };
  for (const f of SCHEMA[key]?.fields || []) {
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

module.exports = { register, normalize, getConfig, saveConfig, saveBulk, readAll, idsToCheck, publicSchema, resetCache, SCHEMA };
