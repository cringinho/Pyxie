const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');

/**
 * Funil de crescimento da Pyxie: de onde vêm os convites, quantos servidores
 * entram e saem por dia, quantos usam algum comando nas primeiras 24h e quantos
 * continuam com a Pyxie depois de 1, 7 e 30 dias.
 *
 * Bot e web rodam em processos separados (server.js faz spawn de index.js), então
 * cada processo grava o próprio arquivo:
 *   - data/growthGuilds.json  → bot (guildCreate, guildDelete, primeiro comando)
 *   - data/growthInvites.json → web (cliques em /invite e /install por origem)
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_WINDOWS = [1, 7, 30];
const DAILY_HISTORY_DAYS = 90;
const FLUSH_DELAY_MS = 30 * 1000;
const REF_PATTERN = /^[a-z0-9][a-z0-9_-]{0,31}$/;

function getDataDir() {
  return process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
}

function guildsFile() {
  return path.join(getDataDir(), 'growthGuilds.json');
}

function invitesFile() {
  return path.join(getDataDir(), 'growthInvites.json');
}

function dayKey(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10);
}

function pruneDaily(daily, now = Date.now()) {
  const oldest = dayKey(now - DAILY_HISTORY_DAYS * DAY_MS);
  for (const key of Object.keys(daily)) {
    if (key < oldest) delete daily[key];
  }
}

/** Normaliza a origem de um convite (?ref=topgg, ?ref=site...). Valores inválidos viram "direct". */
function normalizeRef(value) {
  const ref = String(value || '').trim().toLowerCase();
  return REF_PATTERN.test(ref) ? ref : 'direct';
}

// ---------------------------------------------------------------------------
// Servidores (processo do bot)
// ---------------------------------------------------------------------------

let guildState = null;
let flushTimer = null;

function loadGuildState() {
  if (!guildState) {
    const stored = readJson(guildsFile(), {});
    guildState = {
      guilds: stored.guilds && typeof stored.guilds === 'object' ? stored.guilds : {},
      daily: stored.daily && typeof stored.daily === 'object' ? stored.daily : {},
    };
  }
  return guildState;
}

function flushGuildState() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!guildState) return true;
  pruneDaily(guildState.daily);
  return writeJsonAtomic(guildsFile(), guildState);
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flushGuildState, FLUSH_DELAY_MS);
  if (typeof flushTimer.unref === 'function') flushTimer.unref();
}

function bumpDaily(field, ts) {
  const state = loadGuildState();
  const key = dayKey(ts);
  const day = state.daily[key] || { joins: 0, leaves: 0 };
  day[field] = (day[field] || 0) + 1;
  state.daily[key] = day;
}

function recordGuildJoin(guild, now = Date.now()) {
  if (!guild?.id) return null;
  const state = loadGuildState();
  const previous = state.guilds[guild.id];
  state.guilds[guild.id] = {
    name: guild.name || previous?.name || '',
    joinedAt: now,
    leftAt: null,
    memberCount: guild.memberCount || 0,
    firstCommandAt: null,
    commands: 0,
    rejoins: previous ? (previous.rejoins || 0) + 1 : 0,
  };
  bumpDaily('joins', now);
  flushGuildState();
  return state.guilds[guild.id];
}

function recordGuildLeave(guild, now = Date.now()) {
  if (!guild?.id) return null;
  const state = loadGuildState();
  const record = state.guilds[guild.id] || {
    name: guild.name || '',
    joinedAt: guild.joinedTimestamp || null,
    firstCommandAt: null,
    commands: 0,
    backfilled: true,
  };
  record.leftAt = now;
  record.memberCount = guild.memberCount || record.memberCount || 0;
  state.guilds[guild.id] = record;
  bumpDaily('leaves', now);
  flushGuildState();
  return record;
}

/** Marca o primeiro uso de comando e conta os usos por servidor (gravação adiada). */
function recordGuildCommand(guildId, now = Date.now()) {
  if (!guildId) return;
  const state = loadGuildState();
  const record = state.guilds[guildId];
  if (!record || record.leftAt) return;
  record.commands = (record.commands || 0) + 1;
  if (!record.firstCommandAt) {
    record.firstCommandAt = now;
    flushGuildState();
    return;
  }
  scheduleFlush();
}

/**
 * Registra os servidores em que a Pyxie já estava antes do funil existir. Eles ficam
 * marcados como backfilled e não entram nas taxas de retenção (seriam só sobreviventes).
 */
function backfillGuilds(guilds) {
  const state = loadGuildState();
  let added = 0;
  for (const guild of guilds) {
    if (!guild?.id) continue;
    const record = state.guilds[guild.id];
    if (record && !record.leftAt) {
      record.memberCount = guild.memberCount || record.memberCount || 0;
      record.name = guild.name || record.name;
      continue;
    }
    if (record?.leftAt) continue;
    state.guilds[guild.id] = {
      name: guild.name || '',
      joinedAt: guild.joinedTimestamp || Date.now(),
      leftAt: null,
      memberCount: guild.memberCount || 0,
      firstCommandAt: null,
      commands: 0,
      backfilled: true,
    };
    added += 1;
  }
  flushGuildState();
  return added;
}

// ---------------------------------------------------------------------------
// Convites (processo web)
// ---------------------------------------------------------------------------

const INVITE_DEDUPE_MS = 10 * 60 * 1000;
const recentInviteVisitors = new Map();

/** true quando o mesmo visitante já foi contado nos últimos 10 minutos (cliques repetidos e robôs). */
function isRepeatedVisitor(visitorKey, now) {
  if (!visitorKey) return false;
  const last = recentInviteVisitors.get(visitorKey);
  if (last && now - last < INVITE_DEDUPE_MS) return true;
  recentInviteVisitors.set(visitorKey, now);
  if (recentInviteVisitors.size > 5000) {
    for (const [key, ts] of recentInviteVisitors) {
      if (now - ts >= INVITE_DEDUPE_MS) recentInviteVisitors.delete(key);
    }
  }
  return false;
}

function recordInviteClick(ref, kind = 'guild', { visitorKey = null, now = Date.now() } = {}) {
  if (isRepeatedVisitor(visitorKey ? `${kind}:${visitorKey}` : null, now)) {
    return { source: normalizeRef(ref), kind, counted: false };
  }
  const file = invitesFile();
  const stored = readJson(file, {});
  const daily = stored.daily && typeof stored.daily === 'object' ? stored.daily : {};
  const totals = stored.totals && typeof stored.totals === 'object' ? stored.totals : {};
  const source = normalizeRef(ref);
  const bucket = `${kind}:${source}`;
  const key = dayKey(now);
  daily[key] = daily[key] || {};
  daily[key][bucket] = (daily[key][bucket] || 0) + 1;
  totals[bucket] = (totals[bucket] || 0) + 1;
  pruneDaily(daily, now);
  writeJsonAtomic(file, { daily, totals });
  return { source, kind, counted: true };
}

// ---------------------------------------------------------------------------
// Resumo para o /admin e /api/public/system-truth
// ---------------------------------------------------------------------------

function rate(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : null;
}

function getFunnelSummary({ now = Date.now(), days = 30 } = {}) {
  const stored = guildState || readJson(guildsFile(), {});
  const guilds = Object.entries(stored.guilds || {}).map(([id, g]) => ({ id, ...g }));
  const dailyGuilds = stored.daily || {};
  const invites = readJson(invitesFile(), {});

  const series = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = dayKey(now - i * DAY_MS);
    const g = dailyGuilds[key] || {};
    const inv = invites.daily?.[key] || {};
    const inviteClicks = Object.values(inv).reduce((acc, n) => acc + n, 0);
    series.push({ date: key, joins: g.joins || 0, leaves: g.leaves || 0, inviteClicks });
  }

  const tracked = guilds.filter((g) => !g.backfilled && g.joinedAt);
  const retention = {};
  for (const windowDays of RETENTION_WINDOWS) {
    const cutoff = now - windowDays * DAY_MS;
    const cohort = tracked.filter((g) => g.joinedAt <= cutoff);
    const kept = cohort.filter((g) => !g.leftAt || g.leftAt - g.joinedAt >= windowDays * DAY_MS);
    retention[`d${windowDays}`] = { cohort: cohort.length, retained: kept.length, rate: rate(kept.length, cohort.length) };
  }

  const activationCohort = tracked.filter((g) => g.joinedAt <= now - DAY_MS);
  const activated = activationCohort.filter((g) => g.firstCommandAt && g.firstCommandAt - g.joinedAt <= DAY_MS);

  const sources = {};
  for (const [bucket, count] of Object.entries(invites.totals || {})) {
    const [kind, source] = bucket.split(':');
    sources[source] = sources[source] || { guild: 0, user: 0, total: 0 };
    sources[source][kind === 'user' ? 'user' : 'guild'] += count;
    sources[source].total += count;
  }

  const periodJoins = series.reduce((acc, d) => acc + d.joins, 0);
  const periodLeaves = series.reduce((acc, d) => acc + d.leaves, 0);
  const recentLeaves = guilds
    .filter((g) => g.leftAt)
    .sort((a, b) => b.leftAt - a.leftAt)
    .slice(0, 10)
    .map((g) => ({
      id: g.id,
      name: g.name,
      leftAt: g.leftAt,
      stayedHours: g.joinedAt ? Math.round((g.leftAt - g.joinedAt) / (60 * 60 * 1000)) : null,
      commands: g.commands || 0,
    }));

  return {
    periodDays: days,
    activeGuilds: guilds.filter((g) => !g.leftAt).length,
    periodJoins,
    periodLeaves,
    periodNet: periodJoins - periodLeaves,
    activation24h: { cohort: activationCohort.length, activated: activated.length, rate: rate(activated.length, activationCohort.length) },
    retention,
    inviteSources: sources,
    series,
    recentLeaves,
  };
}

function resetForTests() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  guildState = null;
  recentInviteVisitors.clear();
}

module.exports = {
  normalizeRef,
  recordGuildJoin,
  recordGuildLeave,
  recordGuildCommand,
  backfillGuilds,
  flushGuildState,
  recordInviteClick,
  getFunnelSummary,
  resetForTests,
};
