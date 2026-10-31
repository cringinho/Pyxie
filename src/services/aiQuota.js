// Cota do Oráculo (IA) por servidor e por pessoa, em data/aiUsage.json.
// A janela é o dia de Brasília; o objetivo é proteger a margem do Premium e evitar que
// uma pessoa só consuma a cota do servidor inteiro.
const fs = require('node:fs');
const path = require('node:path');
const { withFileLock } = require('../utils/fileLock');

const GUILD_DAILY_CAP = 150;
const USER_DAILY_CAP = 20;
const USER_COOLDOWN_MS = 20 * 60 * 1000;
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

const dayKey = (now = Date.now()) => new Date(now - BRT_OFFSET_MS).toISOString().slice(0, 10);
const fileFor = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'aiUsage.json');

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(fileFor(), 'utf8')) || {};
    return data.guilds && typeof data.guilds === 'object' ? data : { guilds: {} };
  } catch (_) {
    return { guilds: {} };
  }
}

function save(state) {
  const file = fileFor();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 1, guilds: state.guilds }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return state;
}

function guildEntry(state, guildId, now) {
  const key = dayKey(now);
  const current = state.guilds[String(guildId)] || {};
  if (current.day !== key) return { day: key, used: 0, users: {} };
  return { day: key, used: Number(current.used) || 0, users: current.users && typeof current.users === 'object' ? current.users : {} };
}

/** Só lê: diz se pode perguntar agora e por quê não. */
function check(guildId, userId, { now = Date.now(), cap = GUILD_DAILY_CAP, userCap = USER_DAILY_CAP, cooldownMs = USER_COOLDOWN_MS } = {}) {
  const state = load();
  const entry = guildEntry(state, guildId, now);
  const user = entry.users[String(userId)] || { day: entry.day, count: 0, lastAt: 0 };
  const userCount = user.day === entry.day ? Number(user.count) || 0 : 0;
  const remaining = Math.max(0, cap - entry.used);
  if (remaining <= 0) return { allowed: false, reason: 'guild_cap', remaining: 0, retryMs: 0 };
  if (userCount >= userCap) return { allowed: false, reason: 'user_cap', remaining, retryMs: 0 };
  const waited = now - (Number(user.lastAt) || 0);
  if (waited < cooldownMs) return { allowed: false, reason: 'cooldown', remaining, retryMs: cooldownMs - waited };
  return { allowed: true, remaining, userRemaining: Math.max(0, userCap - userCount) };
}

/** Registra uma pergunta respondida pela IA (chamar só quando houve resposta de verdade). */
function consume(guildId, userId, { now = Date.now(), cap = GUILD_DAILY_CAP, userCap = USER_DAILY_CAP } = {}) {
  return withFileLock(fileFor(), () => {
    const state = load();
    const entry = guildEntry(state, guildId, now);
    if (entry.used >= cap) return { recorded: false, remaining: 0 };
    const user = entry.users[String(userId)] || { day: entry.day, count: 0, lastAt: 0 };
    const userCount = user.day === entry.day ? Number(user.count) || 0 : 0;
    if (userCount >= userCap) return { recorded: false, remaining: Math.max(0, cap - entry.used) };
    entry.used += 1;
    entry.users[String(userId)] = { day: entry.day, count: userCount + 1, lastAt: now };
    state.guilds[String(guildId)] = entry;
    save(state);
    return { recorded: true, remaining: Math.max(0, cap - entry.used) };
  });
}

function snapshot(guildId, { now = Date.now(), cap = GUILD_DAILY_CAP } = {}) {
  const entry = guildEntry(load(), guildId, now);
  return {
    day: entry.day,
    used: entry.used,
    cap,
    remaining: Math.max(0, cap - entry.used),
    people: Object.keys(entry.users).length,
  };
}

module.exports = { GUILD_DAILY_CAP, USER_DAILY_CAP, USER_COOLDOWN_MS, dayKey, check, consume, snapshot };
