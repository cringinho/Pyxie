// Chaves de acesso vitalício: o dono da Pyxie gera e entrega a quem quiser (a Pyxie é fechada e não cobra).
// Cada chave é de uso único (30 dias para resgatar) e, ao ser resgatada, liga o servidor ao acesso
// vitalício (plano Fundador + Estúdio de Loja). Vitalício nunca é pausado por inatividade nem expira.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const plans = require('./guildPlans');
const notices = require('./planNotices');
const { withFileLock } = require('../utils/fileLock');

const SEATS = 1000; // teto de segurança da lista, não é mais um número de vagas
const MONTHS = 0; // vitalício
const KEY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const INACTIVE_GRACE_MS = 0; // sem pausa por inatividade (mantido por compatibilidade de exportação)

const fileFor = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'founderProgram.json');

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(fileFor(), 'utf8')) || {};
    return { seats: Array.isArray(data.seats) ? data.seats : [] };
  } catch (_) {
    return { seats: [] };
  }
}

function save(state) {
  const file = fileFor();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 1, seats: state.seats.slice(0, SEATS) }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return state;
}

const makeCode = () => `FUND-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

/** Cria uma chave de resgate. Teto de segurança de `SEATS` chaves na lista. */
function createKey({ note = '', by = '', now = Date.now() } = {}) {
  return withFileLock(fileFor(), () => {
    const state = load();
    if (state.seats.length >= SEATS) return { ok: false, reason: 'full', seats: state.seats.length };
    const seat = {
      code: makeCode(),
      guildId: '',
      status: 'available',
      note: String(note || '').slice(0, 120),
      by: String(by || '').slice(0, 40),
      createdAt: now,
      keyExpiresAt: now + KEY_TTL_MS,
      redeemedAt: 0,
      checklist: { channel: false, announcement: false, activity: false },
      inactiveSince: 0,
    };
    state.seats.push(seat);
    save(state);
    return { ok: true, seat, seats: state.seats.length };
  });
}

/** Resgata a chave: liga a chave ao servidor e libera o acesso vitalício. */
function redeem(code, guildId, { now = Date.now(), by = '' } = {}) {
  const clean = String(code || '').trim().toUpperCase();
  if (!/^\d{17,20}$/.test(String(guildId || ''))) return { ok: false, reason: 'invalid_guild' };
  return withFileLock(fileFor(), () => {
    const state = load();
    const seat = state.seats.find((item) => item.code === clean);
    if (!seat) return { ok: false, reason: 'invalid_code' };
    if (seat.status !== 'available') return { ok: false, reason: 'used' };
    if (seat.keyExpiresAt && seat.keyExpiresAt < now) return { ok: false, reason: 'expired_key' };
    if (state.seats.some((item) => item.guildId === String(guildId) && item.status !== 'revoked')) {
      return { ok: false, reason: 'guild_already_founder' };
    }
    const granted = plans.grantPlan(guildId, 'founder', { lifetime: true, source: 'key', note: seat.note || by, now });
    if (!granted.ok) return { ok: false, reason: granted.reason || 'grant_failed' };
    // Estúdio de Loja também vem no acesso vitalício (antes era um extra pago).
    require('./guildAddons').grant(guildId, 'lojinha', { lifetime: true, source: 'key', note: seat.note || by, now });
    seat.guildId = String(guildId);
    seat.status = 'active';
    seat.redeemedAt = now;
    save(state);
    notices.resetMarks(guildId);
    return { ok: true, seat, lifetime: true, months: MONTHS, paidUntil: 0 };
  });
}

function revoke(guildId, { reason = 'revoked', now = Date.now() } = {}) {
  return withFileLock(fileFor(), () => {
    const state = load();
    const seat = state.seats.find((item) => item.guildId === String(guildId) && item.status !== 'revoked');
    if (!seat) return { ok: false, reason: 'not_found' };
    seat.status = reason === 'inactive' ? 'paused' : 'revoked';
    seat.revokedAt = now;
    save(state);
    plans.revokePlan(guildId, seat.status === 'paused' ? 'past_due' : 'canceled', now);
    try { require('./guildAddons').revoke(guildId, 'lojinha', 'canceled', now); } catch (_) {}
    return { ok: true, seat };
  });
}

function checklist(guildId, patch = {}) {
  return withFileLock(fileFor(), () => {
    const state = load();
    const seat = state.seats.find((item) => item.guildId === String(guildId) && item.status !== 'revoked');
    if (!seat) return { ok: false, reason: 'not_found' };
    for (const key of ['channel', 'announcement', 'activity']) {
      if (patch[key] !== undefined) seat.checklist[key] = Boolean(patch[key]);
    }
    save(state);
    return { ok: true, seat };
  });
}

/** Lista as vagas com o plano atual e o que falta no checklist. */
function list({ now = Date.now() } = {}) {
  return load().seats.map((seat) => {
    const plan = seat.guildId ? plans.getPlan(seat.guildId, now) : null;
    const done = Object.values(seat.checklist || {}).filter(Boolean).length;
    return {
      code: seat.code,
      guildId: seat.guildId,
      status: seat.status,
      note: seat.note,
      createdAt: seat.createdAt,
      keyExpiresAt: seat.keyExpiresAt,
      redeemedAt: seat.redeemedAt,
      checklist: seat.checklist,
      checklistDone: done,
      checklistTotal: 3,
      plan: plan ? { plan: plan.plan, active: plan.active, paidUntil: plan.paidUntil } : null,
      daysLeft: 0,
      lifetime: Boolean(plan?.lifetime),
      inactiveSince: seat.inactiveSince || 0,
    };
  });
}

function stats({ now = Date.now() } = {}) {
  const seats = list({ now });
  return {
    seats: SEATS,
    total: seats.length,
    available: seats.filter((s) => s.status === 'available').length,
    active: seats.filter((s) => s.status === 'active' && s.plan?.active).length,
    paused: seats.filter((s) => s.status === 'paused').length,
    revoked: seats.filter((s) => s.status === 'revoked').length,
    free: SEATS - seats.filter((s) => s.status !== 'revoked').length,
  };
}

/**
 * Manutenção: acesso vitalício não pausa por inatividade. Só reflete no registro das chaves
 * quem perdeu o plano por outro caminho (revogação manual), sem mexer no servidor.
 */
function sweep({ now = Date.now() } = {}) {
  const result = { paused: [], flagged: [], expired: [] };
  withFileLock(fileFor(), () => {
    const state = load();
    let changed = false;
    for (const seat of state.seats) {
      if (seat.status !== 'active' || !seat.guildId) continue;
      const plan = plans.getPlan(seat.guildId, now);
      if (!plan.active && plan.expired) {
        seat.status = 'expired';
        result.expired.push(seat.guildId);
        changed = true;
      }
    }
    if (changed) save(state);
  });
  return result;
}

module.exports = { SEATS, MONTHS, KEY_TTL_MS, INACTIVE_GRACE_MS, createKey, redeem, revoke, checklist, list, stats, sweep };
