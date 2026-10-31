// Plano do servidor (free | founder | basic | premium) com validade mensal.
// A cobrança (Pix/cartão) entra na fase de assinaturas; aqui fica a leitura que o bot usa:
// expira sozinho quando `paidUntil` passa, sem apagar configuração nenhuma.
const fs = require('node:fs');
const path = require('node:path');
const { withFileLock } = require('../utils/fileLock');

const PLANS = ['free', 'founder', 'basic', 'premium'];
const DEFAULT_PLAN = 'free';
const DAY = 24 * 60 * 60 * 1000;
// Preços em centavos (R$ 7 e R$ 20) — usados pela cobrança mensal.
const PRICES = { basic: 700, premium: 2000 };
const STATUSES = ['active', 'past_due', 'expired', 'canceled', 'refunded'];

const fileFor = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guildPlans.json');

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
    plan: PLANS.includes(raw.plan) ? raw.plan : DEFAULT_PLAN,
    status: STATUSES.includes(raw.status) ? raw.status : 'active',
    source: String(raw.source || 'manual').slice(0, 24),
    since: Math.max(0, Number(raw.since) || 0),
    paidUntil: Math.max(0, Number(raw.paidUntil) || 0),
    // Vitalício: não expira nunca (Mary, Cringelândia e o servidor do dono).
    lifetime: raw.lifetime === true,
    note: String(raw.note || '').slice(0, 200),
  };
}

const rawFor = (guildId) => normalizeRecord(load()[String(guildId)]);

/** Plano efetivo: expira quando `paidUntil` passa (vitalício nunca expira). */
function getPlan(guildId, now = Date.now()) {
  const record = rawFor(guildId);
  if (record.plan === DEFAULT_PLAN) return { ...record, active: false, expired: false };
  const expired =
    record.status === 'expired' || (!record.lifetime && record.paidUntil > 0 && record.paidUntil <= now);
  const active = !expired && record.status !== 'canceled' && record.status !== 'refunded';
  return { ...record, active, expired };
}

function setPlan(guildId, patch = {}, now = Date.now()) {
  const id = String(guildId || '').trim();
  if (!/^\d{17,20}$/.test(id)) return { ok: false, reason: 'invalid_guild' };
  return withFileLock(fileFor(), () => {
    const guilds = { ...load() };
    const before = normalizeRecord(guilds[id]);
    const next = normalizeRecord({ ...before, ...patch, since: before.since || now });
    guilds[id] = next;
    save(guilds);
    return { ok: true, record: next };
  });
}

function grantPlan(guildId, plan, { months = 1, source = 'manual', note = '', lifetime = false, now = Date.now() } = {}) {
  if (!PLANS.includes(plan) || plan === DEFAULT_PLAN) return { ok: false, reason: 'invalid_plan' };
  if (lifetime) {
    // Vitalício: `paidUntil` fica 0 de propósito — quem decide é a flag `lifetime`.
    return setPlan(guildId, { plan, status: 'active', source, note, paidUntil: 0, lifetime: true }, now);
  }
  const base = Math.max(now, rawFor(guildId).paidUntil || 0);
  const paidUntil = base + Math.max(1, Math.round(Number(months) || 1)) * 30 * DAY;
  return setPlan(guildId, { plan, status: 'active', source, note, paidUntil, lifetime: false }, now);
}

function revokePlan(guildId, reason = 'canceled', now = Date.now()) {
  return setPlan(guildId, { plan: DEFAULT_PLAN, status: reason, paidUntil: 0, lifetime: false, note: reason }, now);
}

function listPlans() {
  return Object.entries(load()).map(([guildId, record]) => ({ guildId, ...normalizeRecord(record) }));
}

function _resetCacheForTests() {
  cache = { mtime: -1, data: null };
}

module.exports = { PLANS, DEFAULT_PLAN, DAY, PRICES, STATUSES, getPlan, setPlan, grantPlan, revokePlan, listPlans, _resetCacheForTests };
