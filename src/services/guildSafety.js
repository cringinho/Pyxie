// Segurança por servidor: escudo de links e guardião do servidor.
// Configuração em data/guilds/<id>/security.json (só o painel grava) e ocorrências em
// data/guilds/<id>/securityEvents.json (só o bot grava): arquivos separados para os dois
// processos nunca sobrescreverem um ao outro. Escrita atômica (.tmp + rename).
const fs = require('node:fs');
const path = require('node:path');
const { normalizeDomainList } = require('./lookalikeLinks');

const ID_RE = /^\d{17,20}$/;
const CACHE_MS = 30 * 1000; // o bot relê a configuração a cada 30 s
const MAX_EVENTS = 50;

function dataRoot() {
  return process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
}

function fileFor(guildId, name) {
  return path.join(dataRoot(), 'guilds', String(guildId), name);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return null;
  }
}

function writeAtomic(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function defaultConfig() {
  return {
    staffLogChannelId: '',
    linkShield: { enabled: true, action: 'delete', allowDomains: [] },
    guard: { enabled: true, mode: 'alert' },
    antiRaid: { enabled: true, joins: 10, seconds: 30, pauseMinutes: 60 },
  };
}

const PAUSE_OPTIONS = [30, 60, 120, 360, 1440];
const clamp = (n, min, max, fallback) => (Number.isFinite(Number(n)) ? Math.min(max, Math.max(min, Math.round(Number(n)))) : fallback);

function normalizeConfig(raw = {}) {
  const base = defaultConfig();
  const link = { ...base.linkShield, ...(raw.linkShield || {}) };
  const guard = { ...base.guard, ...(raw.guard || {}) };
  const raid = { ...base.antiRaid, ...(raw.antiRaid || {}) };
  return {
    staffLogChannelId: ID_RE.test(String(raw.staffLogChannelId || '')) ? String(raw.staffLogChannelId) : '',
    linkShield: {
      enabled: link.enabled !== false,
      action: link.action === 'warn' ? 'warn' : 'delete',
      allowDomains: normalizeDomainList(link.allowDomains),
    },
    guard: {
      enabled: guard.enabled !== false,
      mode: guard.mode === 'auto' ? 'auto' : 'alert',
    },
    antiRaid: {
      enabled: raid.enabled !== false,
      joins: clamp(raid.joins, 3, 100, 10),
      seconds: clamp(raid.seconds, 10, 120, 30),
      pauseMinutes: PAUSE_OPTIONS.includes(Number(raid.pauseMinutes)) ? Number(raid.pauseMinutes) : 60,
    },
  };
}

const cache = new Map(); // guildId -> { at, config }

function getConfig(guildId, { fresh = false } = {}) {
  const hit = cache.get(guildId);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.config;
  const config = normalizeConfig(readJson(fileFor(guildId, 'security.json')) || {});
  cache.set(guildId, { at: Date.now(), config });
  return config;
}

function saveConfig(guildId, input = {}) {
  const current = getConfig(guildId, { fresh: true });
  const next = normalizeConfig({
    ...current,
    ...input,
    linkShield: { ...current.linkShield, ...(input.linkShield || {}) },
    guard: { ...current.guard, ...(input.guard || {}) },
    antiRaid: { ...current.antiRaid, ...(input.antiRaid || {}) },
  });
  writeAtomic(fileFor(guildId, 'security.json'), next);
  cache.set(guildId, { at: Date.now(), config: next });
  return next;
}

function readEvents(guildId) {
  const raw = readJson(fileFor(guildId, 'securityEvents.json')) || {};
  return {
    counters: { link: 0, role: 0, channel: 0, raid: 0, ...(raw.counters || {}) },
    events: Array.isArray(raw.events) ? raw.events : [],
  };
}

// type: link | role | channel. Guarda só o necessário para a staff entender o que houve.
function recordEvent(guildId, event) {
  const state = readEvents(guildId);
  state.counters[event.type] = (state.counters[event.type] || 0) + 1;
  state.events = [{ at: Date.now(), ...event }, ...state.events].slice(0, MAX_EVENTS);
  writeAtomic(fileFor(guildId, 'securityEvents.json'), state);
  return state;
}

function resetCache() {
  cache.clear();
}

module.exports = { PAUSE_OPTIONS, getConfig, saveConfig, normalizeConfig, readEvents, recordEvent, resetCache, defaultConfig };
