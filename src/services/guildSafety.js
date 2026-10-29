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
    linkShield: { enabled: true, action: 'delete', allowDomains: [], exemptRoleIds: [], exemptChannelIds: [], timeoutMinutes: 0 },
    guard: { enabled: true, mode: 'alert' },
    antiNuke: { enabled: true, maxActions: 5, windowSeconds: 30, mode: 'alert', trustedIds: [] },
    emergency: { active: false, activatedAt: 0, activatedBy: '', reason: '' },
    verification: {
      enabled: false,
      channelId: '',
      verifiedRoleId: '',
      unverifiedRoleId: '',
      title: '',
      description: '',
      buttonLabel: '',
    },
    antiRaid: { enabled: true, joins: 10, seconds: 30, pauseMinutes: 60, action: 'pause', minAccountAgeDays: 3 },
    appeals: { enabled: false, channelId: '' },
    fileShield: { enabled: true, action: 'delete', blockExecutables: true, exemptRoleIds: [], exemptChannelIds: [] },
    invites: { autoClean: false, days: 7 },
  };
}

const PAUSE_OPTIONS = [30, 60, 120, 360, 1440];
const clamp = (n, min, max, fallback) => (Number.isFinite(Number(n)) ? Math.min(max, Math.max(min, Math.round(Number(n)))) : fallback);

function normalizeIdList(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const id = String(item || '').trim();
    if (ID_RE.test(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out.slice(0, 50);
}

function normalizeConfig(raw = {}) {
  const base = defaultConfig();
  const link = { ...base.linkShield, ...(raw.linkShield || {}) };
  const guard = { ...base.guard, ...(raw.guard || {}) };
  const nuke = { ...base.antiNuke, ...(raw.antiNuke || {}) };
  const emg = { ...base.emergency, ...(raw.emergency || {}) };
  const ver = { ...base.verification, ...(raw.verification || {}) };
  const raid = { ...base.antiRaid, ...(raw.antiRaid || {}) };
  const appeals = { ...base.appeals, ...(raw.appeals || {}) };
  const files = { ...base.fileShield, ...(raw.fileShield || {}) };
  const inv = { ...base.invites, ...(raw.invites || {}) };
  return {
    staffLogChannelId: ID_RE.test(String(raw.staffLogChannelId || '')) ? String(raw.staffLogChannelId) : '',
    linkShield: {
      enabled: link.enabled !== false,
      action: link.action === 'warn' ? 'warn' : 'delete',
      allowDomains: normalizeDomainList(link.allowDomains),
      exemptRoleIds: normalizeIdList(link.exemptRoleIds),
      exemptChannelIds: normalizeIdList(link.exemptChannelIds),
      timeoutMinutes: clamp(link.timeoutMinutes, 0, 1440, 0),
    },
    guard: {
      enabled: guard.enabled !== false,
      mode: guard.mode === 'auto' ? 'auto' : 'alert',
    },
    antiNuke: {
      enabled: nuke.enabled !== false,
      maxActions: clamp(nuke.maxActions, 2, 30, 5),
      windowSeconds: clamp(nuke.windowSeconds, 10, 300, 30),
      mode: nuke.mode === 'auto' ? 'auto' : 'alert',
      trustedIds: normalizeIdList(nuke.trustedIds),
    },
    emergency: {
      active: emg.active === true,
      activatedAt: Number(emg.activatedAt) || 0,
      activatedBy: ID_RE.test(String(emg.activatedBy || '')) ? String(emg.activatedBy) : '',
      reason: String(emg.reason || '').trim().slice(0, 200),
    },
    verification: {
      enabled: ver.enabled === true,
      channelId: ID_RE.test(String(ver.channelId || '')) ? String(ver.channelId) : '',
      verifiedRoleId: ID_RE.test(String(ver.verifiedRoleId || '')) ? String(ver.verifiedRoleId) : '',
      unverifiedRoleId: ID_RE.test(String(ver.unverifiedRoleId || '')) ? String(ver.unverifiedRoleId) : '',
      title: String(ver.title || '').trim().slice(0, 100),
      description: String(ver.description || '').trim().slice(0, 600),
      buttonLabel: String(ver.buttonLabel || '').trim().slice(0, 60),
    },
    antiRaid: {
      enabled: raid.enabled !== false,
      joins: clamp(raid.joins, 3, 100, 10),
      seconds: clamp(raid.seconds, 10, 120, 30),
      pauseMinutes: PAUSE_OPTIONS.includes(Number(raid.pauseMinutes)) ? Number(raid.pauseMinutes) : 60,
      action: ['pause', 'kickYoung', 'alertOnly'].includes(raid.action) ? raid.action : 'pause',
      minAccountAgeDays: clamp(raid.minAccountAgeDays, 1, 30, 3),
    },
    appeals: {
      enabled: appeals.enabled === true,
      channelId: ID_RE.test(String(appeals.channelId || '')) ? String(appeals.channelId) : '',
    },
    fileShield: {
      enabled: files.enabled !== false,
      action: files.action === 'warn' ? 'warn' : 'delete',
      blockExecutables: files.blockExecutables !== false,
      exemptRoleIds: normalizeIdList(files.exemptRoleIds),
      exemptChannelIds: normalizeIdList(files.exemptChannelIds),
    },
    invites: {
      autoClean: inv.autoClean === true,
      days: clamp(inv.days, 3, 90, 7),
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
    antiNuke: { ...current.antiNuke, ...(input.antiNuke || {}) },
    emergency: { ...current.emergency, ...(input.emergency || {}) },
    verification: { ...current.verification, ...(input.verification || {}) },
    antiRaid: { ...current.antiRaid, ...(input.antiRaid || {}) },
    appeals: { ...current.appeals, ...(input.appeals || {}) },
    fileShield: { ...current.fileShield, ...(input.fileShield || {}) },
    invites: { ...current.invites, ...(input.invites || {}) },
  });
  writeAtomic(fileFor(guildId, 'security.json'), next);
  cache.set(guildId, { at: Date.now(), config: next });
  return next;
}

function readEvents(guildId) {
  const raw = readJson(fileFor(guildId, 'securityEvents.json')) || {};
  return {
    counters: {
      link: 0,
      role: 0,
      channel: 0,
      raid: 0,
      file: 0,
      webhook: 0,
      invites: 0,
      antinuke: 0,
      emergency: 0,
      verification: 0,
      ...(raw.counters || {}),
    },
    events: Array.isArray(raw.events) ? raw.events : [],
  };
}

// type: link | role | channel | antinuke | emergency | verification. Guarda só o necessário para a staff entender o que houve.
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
