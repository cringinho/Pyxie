/**
 * Extras contratados por servidor (hoje: `lojinha`).
 *
 * Persistência em data/guildAddons.json com escrita atômica e lock — mesmo padrão de
 * guildPlans. O extra não dá vantagem econômica (§5); ele só libera módulo.
 */
const fs = require('node:fs');
const path = require('node:path');
const { withFileLock } = require('../utils/fileLock');
const planAddons = require('../config/planAddons');

const DAY = 24 * 60 * 60 * 1000;
const STATUSES = ['active', 'expired', 'canceled'];
const GUILD_RE = /^\d{17,20}$/;

const fileFor = () =>
  path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guildAddons.json');

let cache = { mtime: -1, data: null };

function load() {
  const file = fileFor();
  try {
    const stat = fs.statSync(file);
    if (cache.data && cache.mtime === stat.mtimeMs) return cache.data;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) || {};
    cache = { mtime: stat.mtimeMs, data: parsed.guilds || {} };
    return cache.data;
  } catch (_) {
    cache = { mtime: -1, data: {} };
    return cache.data;
  }
}

function save(guilds) {
  const file = fileFor();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 1, guilds }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  cache = { mtime: -1, data: null };
  return guilds;
}

function normalizeRecord(raw = {}) {
  return {
    status: STATUSES.includes(raw.status) ? raw.status : 'active',
    source: String(raw.source || 'manual').slice(0, 24),
    since: Math.max(0, Number(raw.since) || 0),
    until: Math.max(0, Number(raw.until) || 0),
    lifetime: raw.lifetime === true,
    // Carência depois do vencimento: o módulo continua de pé por alguns dias.
    // A doc prometia 7 dias e o código fechava na hora (bug corrigido).
    graceDays: Math.min(30, Math.max(0, Math.round(Number(raw.graceDays ?? 0)))),
    renewals: Math.max(0, Math.round(Number(raw.renewals) || 0)),
    lastRenewedAt: Math.max(0, Number(raw.lastRenewedAt) || 0),
    revokedAt: Math.max(0, Number(raw.revokedAt) || 0),
    note: String(raw.note || '').slice(0, 200),
  };
}

/** Estado do extra: expira por `until` (+ carência), mas vitalício nunca expira. */
function status(guildId, addonId, now = Date.now()) {
  const id = String(guildId || '');
  const all = load()[id] || {};
  const key = String(addonId || '').toLowerCase();
  const record = normalizeRecord(all[key]);
  const exists = Boolean(all[key]);
  const graceMs = record.graceDays * DAY;
  const expiredByDate = !record.lifetime && record.until > 0 && now > record.until + graceMs;
  const expired = record.status === 'expired' || expiredByDate;
  const inGrace = !expired && !record.lifetime && record.until > 0 && now > record.until;
  const active = exists && !expired && record.status !== 'canceled';
  return { guildId: id, addonId, ...record, exists, active, expired, inGrace };
}

/** Dias até o vencimento (negativo = já venceu). `null` quando é vitalício. */
function daysLeft(guildId, addonId, now = Date.now()) {
  const state = status(guildId, addonId, now);
  if (state.lifetime) return null;
  if (!state.until) return 0;
  return Math.ceil((state.until - now) / DAY);
}

function isActive(guildId, addonId, now = Date.now()) {
  return status(guildId, addonId, now).active;
}

function grant(
  guildId,
  addonId,
  { months = 1, years = 0, lifetime = false, source = 'manual', note = '', graceDays, now = Date.now() } = {}
) {
  const id = String(guildId || '').trim();
  const addon = planAddons.getAddon(addonId);
  if (!GUILD_RE.test(id)) return { ok: false, reason: 'invalid_guild' };
  if (!addon) return { ok: false, reason: 'invalid_addon' };

  return withFileLock(fileFor(), () => {
    const guilds = { ...load() };
    const current = { ...(guilds[id] || {}) };
    const before = normalizeRecord(current[addon.id]);
    const since = before.since || now;
    // Campos novos: quantas vezes renovou e quando foi a última (o painel mostrava só "desde").
    const renewals = (before.renewals || 0) + 1;
    const keepGrace = graceDays === undefined ? before.graceDays : graceDays;
    const record = lifetime
      ? normalizeRecord({ status: 'active', source, note, since, renewals, lastRenewedAt: now, graceDays: keepGrace, until: 0, lifetime: true })
      : normalizeRecord({
          status: 'active',
          source,
          note,
          since,
          renewals,
          lastRenewedAt: now,
          graceDays: keepGrace,
          lifetime: false,
          until:
            Math.max(now, before.lifetime ? now : before.until || 0) +
            (years > 0 ? Math.round(years * 365) * DAY : Math.max(1, Math.round(Number(months) || 1)) * 30 * DAY),
        });
    current[addon.id] = record;
    guilds[id] = current;
    save(guilds);
    return { ok: true, record: { guildId: id, addonId: addon.id, ...record } };
  });
}

function revoke(guildId, addonId, reason = 'canceled', now = Date.now()) {
  const id = String(guildId || '').trim();
  const addon = planAddons.getAddon(addonId);
  if (!GUILD_RE.test(id) || !addon) return { ok: false, reason: 'invalid' };
  return withFileLock(fileFor(), () => {
    const guilds = { ...load() };
    const current = { ...(guilds[id] || {}) };
    if (!current[addon.id]) return { ok: false, reason: 'not_found' };
    // BUG corrigido: revogar sobrescrevia `since`, `until` e o contador de renovações,
    // apagando o histórico de quando o extra existiu.
    current[addon.id] = normalizeRecord({
      ...current[addon.id],
      status: 'canceled',
      note: reason,
      revokedAt: now,
      until: 0,
      lifetime: false,
    });
    guilds[id] = current;
    save(guilds);
    return { ok: true };
  });
}

/** Todos os extras de um servidor, com estado calculado. */
function listForGuild(guildId, now = Date.now()) {
  return planAddons.listAddons().map((addon) => {
    const state = status(guildId, addon.id, now);
    return {
      id: addon.id,
      name: addon.i18n['pt-BR'].name,
      nameEn: addon.i18n.en.name,
      priceMonthly: addon.priceMonthly,
      priceYearly: addon.priceYearly,
      modules: addon.modules,
      active: state.active,
      until: state.until,
      lifetime: state.lifetime,
      since: state.since,
    };
  });
}

function listAll() {
  const now = Date.now();
  return Object.keys(load()).flatMap((guildId) =>
    planAddons.listAddons().map((addon) => status(guildId, addon.id, now))
  );
}

/**
 * Varredura periódica (nova): grava `expired` de quem passou da carência.
 * Antes o vencimento era só calculado na leitura — o arquivo continuava dizendo "active",
 * então painel, logs e o DM de pausa saíam de estados diferentes.
 */
function sweep(now = Date.now()) {
  return withFileLock(fileFor(), () => {
    const guilds = load();
    const next = { ...guilds };
    const touched = [];
    for (const [guildId, addons] of Object.entries(guilds)) {
      for (const [addonId, raw] of Object.entries(addons || {})) {
        const record = normalizeRecord(raw);
        if (record.lifetime || record.status !== 'active' || !record.until) continue;
        if (now > record.until + record.graceDays * DAY) {
          next[guildId] = { ...next[guildId], [addonId]: { ...record, status: 'expired' } };
          touched.push({ guildId, addonId, until: record.until });
        }
      }
    }
    if (touched.length) save(next);
    return touched;
  });
}

function _resetCacheForTests() {
  cache = { mtime: -1, data: null };
}

module.exports = {
  DAY,
  STATUSES,
  status,
  isActive,
  grant,
  revoke,
  listForGuild,
  listAll,
  daysLeft,
  sweep,
  _resetCacheForTests,
};
