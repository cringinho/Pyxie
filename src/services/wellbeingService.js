// Pacote de Bem-Estar e Convivência (AGENTS.md §12) — Lembretes pessoais, AFK e Aniversários.
// - Lembretes pessoais: até MAX_REMINDERS_PER_USER por pessoa, entregues por DM ou no canal.
// - AFK: mensagem curta sanitizada (sem links, sem @everyone), limpa ao enviar mensagem e avisa sem ping.
// - Aniversários: opcional e privado (guarda apenas dia e mês, nunca ano/idade; a pessoa escolhe se anuncia).
// Usa scopedConfig ('wellbeing') para configuração por servidor/usuário + persistência atômica em data/wellbeing.json.
const path = require('node:path');
const { readJsonSafe, writeAtomic } = require('../utils/atomicJson');
const { registerNamespace } = require('./scopedConfig');

const MAX_REMINDERS_PER_USER = 10;
const MIN_REMINDER_MS = 30 * 1000; // 30s
const MAX_REMINDER_MS = 365 * 24 * 60 * 60 * 1000; // 1 ano

const wellbeingConfig = registerNamespace('wellbeing', {
  guild: {
    enabled: true,
    afkEnabled: true,
    remindersEnabled: true,
    birthdaysEnabled: true,
    birthdayChannelId: '',
    birthdayRoleId: '',
    lastBirthdayAnnounceDate: '', // 'MM-DD' para não anunciar duas vezes no mesmo dia
  },
  user: {
    afkMessage: '',
    afkSince: 0,
    birthdayDay: 0,
    birthdayMonth: 0,
    birthdayGuildIds: [],
  },
});

function storePath() {
  const dir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
  return path.join(dir, 'wellbeing.json');
}

function loadStore() {
  const raw = readJsonSafe(storePath(), {});
  return {
    seq: Number.isInteger(raw.seq) ? raw.seq : 0,
    reminders: Array.isArray(raw.reminders) ? raw.reminders : [],
    afk: raw.afk && typeof raw.afk === 'object' ? raw.afk : {},
    birthdays: raw.birthdays && typeof raw.birthdays === 'object' ? raw.birthdays : {},
  };
}

function saveStore(state) {
  writeAtomic(storePath(), state);
  return state;
}

function getWellbeingGuildConfig(guildId) {
  return wellbeingConfig.get('guild', String(guildId || ''));
}

function setWellbeingGuildConfig(guildId, patch = {}) {
  const current = getWellbeingGuildConfig(guildId);
  const next = {
    ...current,
    enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : current.enabled !== false,
    afkEnabled: patch.afkEnabled !== undefined ? Boolean(patch.afkEnabled) : current.afkEnabled !== false,
    remindersEnabled: patch.remindersEnabled !== undefined ? Boolean(patch.remindersEnabled) : current.remindersEnabled !== false,
    birthdaysEnabled: patch.birthdaysEnabled !== undefined ? Boolean(patch.birthdaysEnabled) : current.birthdaysEnabled !== false,
    birthdayChannelId:
      patch.birthdayChannelId !== undefined
        ? /^\d{17,20}$/.test(String(patch.birthdayChannelId || ''))
          ? String(patch.birthdayChannelId)
          : ''
        : current.birthdayChannelId || '',
    birthdayRoleId:
      patch.birthdayRoleId !== undefined
        ? /^\d{17,20}$/.test(String(patch.birthdayRoleId || ''))
          ? String(patch.birthdayRoleId)
          : ''
        : current.birthdayRoleId || '',
    lastBirthdayAnnounceDate:
      patch.lastBirthdayAnnounceDate !== undefined ? String(patch.lastBirthdayAnnounceDate || '') : current.lastBirthdayAnnounceDate || '',
  };
  return wellbeingConfig.set('guild', String(guildId || ''), next);
}

/**
 * Converte durações humanas simples ("10m", "2h", "1d", "45s", "1h30m") em milissegundos.
 */
function parseDurationString(input) {
  const raw = String(input || '').trim().toLowerCase();
  if (!raw) return null;
  const regex = /(\d+)\s*(d|dia|dias|day|days|h|hr|hora|horas|hour|hours|m|min|mins|minuto|minutos|s|seg|sec|secs|segundo|segundos)/g;
  let totalMs = 0;
  let matched = false;
  let m;
  while ((m = regex.exec(raw)) !== null) {
    matched = true;
    const val = Number(m[1]);
    const unit = m[2][0];
    if (unit === 'd') totalMs += val * 86400 * 1000;
    else if (unit === 'h') totalMs += val * 3600 * 1000;
    else if (unit === 'm') totalMs += val * 60 * 1000;
    else if (unit === 's') totalMs += val * 1000;
  }
  if (!matched && /^\d+$/.test(raw)) {
    // Número puro = minutos
    totalMs = Number(raw) * 60 * 1000;
    matched = true;
  }
  if (!matched || totalMs < MIN_REMINDER_MS || totalMs > MAX_REMINDER_MS) return null;
  return totalMs;
}

function sanitizeSafeNote(text, maxLen = 180) {
  return String(text || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/@(everyone|here)/gi, '')
    .replace(/<@&\d+>/g, '')
    .replace(/[`\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// ---------- Lembretes Pessoais ----------

function listUserReminders(userId) {
  const uid = String(userId || '');
  const state = loadStore();
  return state.reminders
    .filter((r) => String(r.userId) === uid)
    .sort((a, b) => a.dueAt - b.dueAt);
}

function createReminder({ userId, guildId = '', channelId = '', text = '', durationMs = 0, now = Date.now() }) {
  const uid = String(userId || '');
  const cleanText = sanitizeSafeNote(text, 240);
  if (!uid || !cleanText) return { ok: false, error: 'empty_text' };
  const ms = Number(durationMs);
  if (!Number.isFinite(ms) || ms < MIN_REMINDER_MS || ms > MAX_REMINDER_MS) {
    return { ok: false, error: 'invalid_duration' };
  }

  const state = loadStore();
  const active = state.reminders.filter((r) => String(r.userId) === uid);
  if (active.length >= MAX_REMINDERS_PER_USER) {
    return { ok: false, error: 'limit_reached', max: MAX_REMINDERS_PER_USER };
  }

  state.seq += 1;
  const item = {
    id: state.seq,
    userId: uid,
    guildId: String(guildId || ''),
    channelId: String(channelId || ''),
    text: cleanText,
    createdAt: now,
    dueAt: now + Math.round(ms),
  };
  state.reminders.push(item);
  saveStore(state);
  return { ok: true, reminder: item };
}

function cancelReminder(userId, reminderId) {
  const uid = String(userId || '');
  const id = Number(reminderId);
  const state = loadStore();
  const idx = state.reminders.findIndex((r) => String(r.userId) === uid && Number(r.id) === id);
  if (idx === -1) return { ok: false, error: 'not_found' };
  const [removed] = state.reminders.splice(idx, 1);
  saveStore(state);
  return { ok: true, removed };
}

function popDueReminders(now = Date.now()) {
  const state = loadStore();
  const due = [];
  const remaining = [];
  for (const r of state.reminders) {
    if (Number(r.dueAt) <= now) due.push(r);
    else remaining.push(r);
  }
  if (due.length > 0) {
    state.reminders = remaining;
    saveStore(state);
  }
  return due;
}

// ---------- AFK ----------

function setAfk(userId, message = '', now = Date.now()) {
  const uid = String(userId || '');
  const clean = sanitizeSafeNote(message, 120);
  const state = loadStore();
  const entry = {
    userId: uid,
    message: clean,
    since: now,
  };
  state.afk[uid] = entry;
  saveStore(state);
  wellbeingConfig.set('user', uid, { afkMessage: clean, afkSince: now });
  return entry;
}

function getAfk(userId) {
  const uid = String(userId || '');
  const state = loadStore();
  return state.afk[uid] || null;
}

function clearAfk(userId) {
  const uid = String(userId || '');
  const state = loadStore();
  const existing = state.afk[uid] || null;
  if (existing) {
    delete state.afk[uid];
    saveStore(state);
    wellbeingConfig.set('user', uid, { afkMessage: '', afkSince: 0 });
  }
  return existing;
}

// ---------- Aniversários (apenas dia/mês, nunca ano/idade) ----------

const DAYS_IN_MONTH = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isValidDayMonth(day, month) {
  const d = Number(day);
  const m = Number(month);
  if (!Number.isInteger(d) || !Number.isInteger(m)) return false;
  if (m < 1 || m > 12) return false;
  return d >= 1 && d <= DAYS_IN_MONTH[m];
}

function setBirthday(userId, { day, month, guildId = '', optInGuild = true } = {}) {
  const uid = String(userId || '');
  const d = Number(day);
  const m = Number(month);
  if (!uid || !isValidDayMonth(d, m)) {
    return { ok: false, error: 'invalid_date' };
  }

  const state = loadStore();
  const prev = state.birthdays[uid] || { day: d, month: m, guildIds: [] };
  const guildSet = new Set(Array.isArray(prev.guildIds) ? prev.guildIds.map(String) : []);
  if (guildId) {
    if (optInGuild) guildSet.add(String(guildId));
    else guildSet.delete(String(guildId));
  }

  const record = {
    userId: uid,
    day: d,
    month: m,
    guildIds: [...guildSet],
    updatedAt: Date.now(),
  };
  state.birthdays[uid] = record;
  saveStore(state);
  wellbeingConfig.set('user', uid, {
    birthdayDay: d,
    birthdayMonth: m,
    birthdayGuildIds: record.guildIds,
  });
  return { ok: true, birthday: record };
}

function getBirthday(userId) {
  const uid = String(userId || '');
  const state = loadStore();
  return state.birthdays[uid] || null;
}

function removeBirthday(userId) {
  const uid = String(userId || '');
  const state = loadStore();
  const existed = Boolean(state.birthdays[uid]);
  if (existed) {
    delete state.birthdays[uid];
    saveStore(state);
    wellbeingConfig.set('user', uid, { birthdayDay: 0, birthdayMonth: 0, birthdayGuildIds: [] });
  }
  return { ok: true, existed };
}

function getGuildBirthdaysForDate(guildId, day, month) {
  const gid = String(guildId || '');
  const d = Number(day);
  const m = Number(month);
  const state = loadStore();
  return Object.values(state.birthdays).filter(
    (b) => Number(b.day) === d && Number(b.month) === m && Array.isArray(b.guildIds) && b.guildIds.includes(gid)
  );
}

module.exports = {
  MAX_REMINDERS_PER_USER,
  wellbeingConfig,
  getWellbeingGuildConfig,
  setWellbeingGuildConfig,
  parseDurationString,
  sanitizeSafeNote,
  listUserReminders,
  createReminder,
  cancelReminder,
  popDueReminders,
  setAfk,
  getAfk,
  clearAfk,
  isValidDayMonth,
  setBirthday,
  getBirthday,
  removeBirthday,
  getGuildBirthdaysForDate,
};

