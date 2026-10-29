// Atividade por servidor: só contagens diárias (mensagens, entradas, saídas, comandos), sem
// conteúdo nem quem mandou. O bot soma em memória e grava em lote a cada 5 minutos em
// data/guilds/<id>/activity.json (escrita atômica, últimos 30 dias). O painel só lê o arquivo.
const fs = require('node:fs');
const path = require('node:path');

const FIELDS = ['messages', 'joins', 'leaves', 'commands'];
const KEEP_DAYS = 30;
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000; // Brasília, sem horário de verão desde 2019

const pending = new Map(); // guildId -> Map(day -> counts)
const emojiPending = new Map(); // guildId -> Map(emojiId -> { count, last })

function dayKey(now = Date.now()) {
  return new Date(now - BRT_OFFSET_MS).toISOString().slice(0, 10);
}

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'activity.json');
}

function empty() {
  return Object.fromEntries(FIELDS.map((f) => [f, 0]));
}

function bump(guildId, field, now = Date.now()) {
  if (!FIELDS.includes(field)) return;
  let days = pending.get(guildId);
  if (!days) pending.set(guildId, (days = new Map()));
  const key = dayKey(now);
  if (!days.has(key)) days.set(key, empty());
  days.get(key)[field] += 1;
}

// Uso dos emojis do próprio servidor (mensagens e reações): total e último uso.
function bumpEmoji(guildId, emojiId, now = Date.now()) {
  let map = emojiPending.get(guildId);
  if (!map) emojiPending.set(guildId, (map = new Map()));
  const cur = map.get(emojiId) || { count: 0, last: 0 };
  cur.count += 1;
  cur.last = now;
  map.set(emojiId, cur);
}

function emojiFile(guildId) {
  return path.join(path.dirname(fileFor(guildId)), 'emojiUsage.json');
}

function readEmojiUsage(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(emojiFile(guildId), 'utf8'));
    return { since: raw.since || null, emojis: raw.emojis || {} };
  } catch (_) {
    return { since: null, emojis: {} };
  }
}

function flushEmojis(now = Date.now()) {
  for (const [guildId, map] of emojiPending) {
    const data = readEmojiUsage(guildId);
    if (!data.since) data.since = now;
    for (const [id, { count, last }] of map) {
      const cur = data.emojis[id] || { count: 0, last: 0 };
      data.emojis[id] = { count: cur.count + count, last: Math.max(cur.last, last) };
    }
    const file = emojiFile(guildId);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
    fs.renameSync(`${file}.tmp`, file);
  }
  emojiPending.clear();
}

function readFile(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
    return raw && typeof raw.days === 'object' ? raw : { days: {} };
  } catch (_) {
    return { days: {} };
  }
}

// Soma o pendente no arquivo de cada servidor e esvazia a memória.
function flush(now = Date.now()) {
  const oldest = dayKey(now - (KEEP_DAYS - 1) * 86400000);
  for (const [guildId, days] of pending) {
    const data = readFile(guildId);
    for (const [key, counts] of days) {
      const day = { ...empty(), ...(data.days[key] || {}) };
      for (const f of FIELDS) day[f] += counts[f];
      data.days[key] = day;
    }
    for (const key of Object.keys(data.days)) if (key < oldest) delete data.days[key];
    const file = fileFor(guildId);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
    fs.renameSync(`${file}.tmp`, file);
  }
  pending.clear();
  flushEmojis(now);
}

// Resumo para o painel: hoje, últimos 7 dias, últimos 30 dias, comparativos e série diária.
function summary(guildId, now = Date.now()) {
  const { days } = readFile(guildId);
  const series = [];
  for (let i = KEEP_DAYS - 1; i >= 0; i--) {
    const key = dayKey(now - i * 86400000);
    series.push({ day: key, ...empty(), ...(days[key] || {}) });
  }
  const week = empty();
  for (const d of series.slice(-7)) for (const f of FIELDS) week[f] += d[f];
  week.netMembers = week.joins - week.leaves;

  const prevWeek = empty();
  for (const d of series.slice(-14, -7)) for (const f of FIELDS) prevWeek[f] += d[f];
  prevWeek.netMembers = prevWeek.joins - prevWeek.leaves;

  const month = empty();
  for (const d of series) for (const f of FIELDS) month[f] += d[f];
  month.netMembers = month.joins - month.leaves;

  const deltas = {};
  for (const f of FIELDS) {
    if (prevWeek[f] > 0) deltas[f] = Math.round(((week[f] - prevWeek[f]) / prevWeek[f]) * 100);
    else deltas[f] = week[f] > 0 ? 100 : 0;
  }

  const averages = {
    daily7d: {
      messages: +(week.messages / 7).toFixed(1),
      commands: +(week.commands / 7).toFixed(1),
    },
    daily30d: {
      messages: +(month.messages / KEEP_DAYS).toFixed(1),
      commands: +(month.commands / KEEP_DAYS).toFixed(1),
    },
  };

  let peakDay = series[0] || { day: dayKey(now), ...empty() };
  const weekdayBreakdown = Array.from({ length: 7 }, (_, i) => ({ weekday: i, messages: 0, commands: 0, joins: 0, leaves: 0 }));
  for (const d of series) {
    if (d.messages >= peakDay.messages) peakDay = d;
    const dt = new Date(`${d.day}T12:00:00Z`);
    const wd = dt.getUTCDay();
    if (weekdayBreakdown[wd]) {
      weekdayBreakdown[wd].messages += d.messages;
      weekdayBreakdown[wd].commands += d.commands;
      weekdayBreakdown[wd].joins += d.joins;
      weekdayBreakdown[wd].leaves += d.leaves;
    }
  }
  const retentionRate = month.joins > 0 ? Math.max(0, Math.min(100, Math.round(((month.joins - month.leaves) / month.joins) * 100))) : 100;

  return {
    today: series[series.length - 1],
    week,
    prevWeek,
    month,
    deltas,
    averages,
    peakDay,
    weekdayBreakdown,
    retentionRate,
    series,
    hasData: Object.keys(days).length > 0,
  };
}

function resetMemory() {
  pending.clear();
  emojiPending.clear();
}

module.exports = { bump, bumpEmoji, readEmojiUsage, flush, summary, dayKey, resetMemory, FIELDS };
