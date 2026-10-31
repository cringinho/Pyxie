// Programa Fundador: 20 vagas de Básico grátis por 12 meses para servidores parceiros.
// Cada vaga é uma chave de resgate de uso único (7 dias para resgatar) ligada a um servidor.
// Sem atividade por 4 semanas depois do primeiro mês, a vaga é pausada.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const plans = require('./guildPlans');
const notices = require('./planNotices');
const { withFileLock } = require('../utils/fileLock');

const SEATS = 20;
const MONTHS = 12;
const KEY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const INACTIVE_GRACE_MS = 7 * DAY;

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

/** Cria uma vaga com chave de resgate. Limite duro de 20 vagas no programa inteiro. */
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

/** Resgata a chave: liga a vaga ao servidor e libera o Básico por 12 meses. */
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
    const granted = plans.grantPlan(guildId, 'founder', { months: MONTHS, source: 'founder', note: seat.note || by, now });
    if (!granted.ok) return { ok: false, reason: granted.reason || 'grant_failed' };
    seat.guildId = String(guildId);
    seat.status = 'active';
    seat.redeemedAt = now;
    save(state);
    notices.resetMarks(guildId);
    return { ok: true, seat, months: MONTHS, paidUntil: granted.record.paidUntil };
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
      daysLeft: plan?.paidUntil ? Math.max(0, Math.ceil((plan.paidUntil - now) / DAY)) : 0,
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
 * Manutenção: marca inatividade e pausa a vaga depois de 7 dias seguidos parada.
 * `activity` é injetável nos testes (guildActivity.summary por padrão).
 */
function sweep({ now = Date.now(), activity = null } = {}) {
  const readActivity = activity || ((guildId) => require('./guildActivity').summary(guildId, now));
  const result = { paused: [], flagged: [], expired: [] };
  withFileLock(fileFor(), () => {
    const state = load();
    for (const seat of state.seats) {
      if (seat.status !== 'active' || !seat.guildId) continue;
      const plan = plans.getPlan(seat.guildId, now);
      if (!plan.active) {
        if (plan.expired) {
          seat.status = 'expired';
          result.expired.push(seat.guildId);
        }
        continue;
      }
      // Só avalia inatividade depois do primeiro mês (tempo para a comunidade organizar).
      if (now - (seat.redeemedAt || now) < 30 * DAY) continue;
      let quiet = false;
      try {
        const summary = readActivity(seat.guildId) || {};
        quiet = Number(summary?.week?.messages || 0) === 0 && summary.hasData !== false;
      } catch (_) {
        quiet = false;
      }
      if (!quiet) {
        seat.inactiveSince = 0;
        continue;
      }
      if (!seat.inactiveSince) {
        seat.inactiveSince = now;
        result.flagged.push(seat.guildId);
      } else if (now - seat.inactiveSince >= INACTIVE_GRACE_MS) {
        seat.status = 'paused';
        result.paused.push(seat.guildId);
        plans.revokePlan(seat.guildId, 'past_due', now);
        notices.push({ guildId: seat.guildId, kind: 'expired', plan: 'founder' });
      }
    }
    save(state);
  });
  return result;
}

module.exports = { SEATS, MONTHS, KEY_TTL_MS, INACTIVE_GRACE_MS, createKey, redeem, revoke, checklist, list, stats, sweep };
