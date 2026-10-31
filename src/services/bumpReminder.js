// Lembrete de bump 2.0: um só lugar calcula o ciclo (aviso, agradecimento, marcos e métricas),
// para o módulo auto-tools, a agenda do servidor e o painel mostrarem exatamente a mesma coisa.
// Textos/embeds seguem docs/agents/09-embeds.md: título curto com UM emoji, blocos separados por
// \n\n, números em `código` e rodapé sempre com setFooter. Estado em data/guilds/<id>/bump.json.
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t } = require('../utils/i18n');
const { brtParts, fill } = require('./autoRules3');

const MINUTE = 60000;
const HOUR = 3600000;
const DAY = 24 * HOUR;
const BRT = 3 * HOUR;
const USER_CAP = 200;
const ROLE_CAP = 3;
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const DEFAULT_COLOR = '#ec4899';

const disboardUrl = (guildId) => `https://disboard.org/server/${guildId || ''}`;

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const str = (value, max = 200) => String(value ?? '').slice(0, max);
const counterArray = (value, size) => {
  const out = new Array(size).fill(0);
  if (Array.isArray(value)) for (let i = 0; i < size; i += 1) out[i] = Math.max(0, Math.round(num(value[i])));
  return out;
};

function emptyState() {
  return {
    version: 2,
    lastBump: { at: 0, channelId: '', messageId: '', userId: '', userName: '', dayKey: '' },
    reminder: { at: 0, channelId: '', reminded: false, messageId: '', deleteAt: 0, dmSent: false, sentAt: 0 },
    counters: { total: 0, reminders: 0, streak: 0, bestStreak: 0, lastDayKey: '', byUser: {}, byHour: new Array(24).fill(0), byWeekday: new Array(7).fill(0) },
  };
}

// Estado v1 (`{ channelId, at, reminded }`) continua sendo lido sem migração manual.
function normalizeState(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const legacy = src.reminder && typeof src.reminder === 'object' ? null : { at: num(src.at), channelId: str(src.channelId, 25), reminded: src.reminded === true };
  const bump = src.lastBump && typeof src.lastBump === 'object' ? src.lastBump : {};
  const rem = src.reminder && typeof src.reminder === 'object' ? src.reminder : legacy || {};
  const counters = src.counters && typeof src.counters === 'object' ? src.counters : {};

  const byUser = {};
  const users = counters.byUser && typeof counters.byUser === 'object' ? counters.byUser : {};
  for (const [id, entry] of Object.entries(users)) {
    if (!/^\d{17,20}$/.test(id) || !entry) continue;
    const n = Math.max(0, Math.round(num(entry.n ?? entry.count)));
    if (!n) continue;
    byUser[id] = { n, name: str(entry.name, 40), lastAt: Math.max(0, num(entry.lastAt)) };
  }
  const capped = Object.entries(byUser)
    .sort((a, b) => b[1].n - a[1].n || b[1].lastAt - a[1].lastAt)
    .slice(0, USER_CAP);

  return {
    version: 2,
    lastBump: {
      at: Math.max(0, num(bump.at)),
      channelId: str(bump.channelId, 25),
      messageId: str(bump.messageId, 25),
      userId: /^\d{17,20}$/.test(String(bump.userId || '')) ? String(bump.userId) : '',
      userName: str(bump.userName, 40),
      dayKey: str(bump.dayKey, 10),
    },
    reminder: {
      at: Math.max(0, num(rem.at)),
      channelId: str(rem.channelId, 25),
      reminded: rem.reminded === true,
      messageId: str(rem.messageId, 25),
      deleteAt: Math.max(0, num(rem.deleteAt)),
      dmSent: rem.dmSent === true,
      sentAt: Math.max(0, num(rem.sentAt)),
    },
    counters: {
      total: Math.max(0, Math.round(num(counters.total))),
      reminders: Math.max(0, Math.round(num(counters.reminders))),
      streak: Math.max(0, Math.round(num(counters.streak))),
      bestStreak: Math.max(0, Math.round(num(counters.bestStreak))),
      lastDayKey: str(counters.lastDayKey, 10),
      byUser: Object.fromEntries(capped),
      byHour: counterArray(counters.byHour, 24),
      byWeekday: counterArray(counters.byWeekday, 7),
    },
  };
}


// ---------- Janela de silêncio (madrugada em Brasília) ----------
function isQuiet(cfg = {}, now = Date.now()) {
  if (!cfg.quietEnabled) return false;
  const start = Math.min(23, Math.max(0, Math.round(num(cfg.quietStart, 23))));
  const end = Math.min(23, Math.max(0, Math.round(num(cfg.quietEnd, 8))));
  if (start === end) return false;
  const { hour } = brtParts(now);
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

// Primeira hora cheia fora do silêncio (topo da hora, horário de Brasília).
function quietResumeAt(cfg = {}, now = Date.now()) {
  const end = Math.min(23, Math.max(0, Math.round(num(cfg.quietEnd, 8))));
  const hourStart = Math.floor((now - BRT) / HOUR) * HOUR + BRT;
  let at = hourStart + ((end - brtParts(now).hour + 24) % 24) * HOUR;
  if (at <= now) at += DAY;
  return at;
}

// ---------- Quando o aviso deve sair ----------
// null = nada pendente. Usado pelo tick do módulo e pela agenda do servidor.
function nextReminderAt(cfg = {}, state = {}, now = Date.now()) {
  const s = normalizeState(state);
  const r = s.reminder;
  if (!r.at || !r.channelId) return null;
  const pending = !r.reminded;
  const nagMinutes = Math.max(0, Math.round(num(cfg.nagMinutes))) * MINUTE;
  if (!pending && !nagMinutes) return null;
  const wait = Math.max(1, Math.round(num(cfg.cooldownMinutes, 120))) * MINUTE;
  const base = pending ? r.at : r.sentAt || r.at + wait;
  let at = base + (pending ? wait : nagMinutes);
  if (isQuiet(cfg, at)) at = quietResumeAt(cfg, at);
  return at;
}

function milestoneFor(cfg = {}, total = 0) {
  const step = Math.max(0, Math.round(num(cfg.milestoneEvery)));
  if (!step || !total) return 0;
  return total % step === 0 ? total : 0;
}

// Quem bumpou de verdade: a mensagem do DISBOARD vem do bot, mas o Discord anexa a interação
// (`message.interaction.user`). Sem isso, o embed costuma citar a pessoa em <@id>.
function bumperFrom(message = {}) {
  const user = message?.interaction?.user;
  if (user?.id && /^\d{17,20}$/.test(String(user.id))) return { id: String(user.id), name: str(user.globalName || user.username, 40) };
  const author = message?.author;
  if (author?.id && !author.bot && /^\d{17,20}$/.test(String(author.id))) return { id: String(author.id), name: str(author.globalName || author.username, 40) };
  const parts = [message?.content || ''];
  for (const e of message?.embeds || []) {
    const data = e?.data || e || {};
    parts.push(data.description || '', ...(data.fields || []).map((f) => f?.value || ''));
  }
  const mention = parts.join(' ').match(/<@!?(\d{17,20})>/);
  return mention ? { id: mention[1], name: '' } : { id: '', name: '' };
}

// ---------- Registro de bump ----------
// Devolve o estado novo e o lembrete anterior (para apagar antes, se cleanPrevious).
function recordBump(state = {}, message = {}, now = Date.now()) {
  const s = normalizeState(state);
  const previous = { ...s.reminder };
  if (message?.id && s.lastBump.messageId === message.id) {
    return { state: s, duplicate: true, previous, total: s.counters.total, streak: s.counters.streak };
  }
  const { day, hour, weekday } = brtParts(now);
  const c = s.counters;
  if (c.lastDayKey !== day) {
    const cur = Date.parse(`${day}T00:00:00Z`);
    const prev = c.lastDayKey ? Date.parse(`${c.lastDayKey}T00:00:00Z`) : 0;
    c.streak = prev && Math.round((cur - prev) / DAY) === 1 ? (c.streak || 0) + 1 : 1;
    c.lastDayKey = day;
    c.bestStreak = Math.max(c.bestStreak || 0, c.streak);
  }
  c.total += 1;
  c.byHour[hour] = (c.byHour[hour] || 0) + 1;
  c.byWeekday[weekday] = (c.byWeekday[weekday] || 0) + 1;

  const bumper = bumperFrom(message);
  const userId = bumper.id;
  const userName = str(bumper.name || message?.member?.displayName || message?.author?.username || '', 40);
  if (userId) {
    const entry = c.byUser[userId] || { n: 0, name: '', lastAt: 0 };
    c.byUser[userId] = { n: entry.n + 1, name: userName || entry.name, lastAt: now };
  }

  s.lastBump = { at: now, channelId: str(message?.channel?.id, 25), messageId: str(message?.id, 25), userId, userName, dayKey: day };
  // Bump novo reinicia a contagem: o aviso anterior deixa de valer.
  s.reminder = { at: now, channelId: s.lastBump.channelId, reminded: false, messageId: '', deleteAt: 0, dmSent: false, sentAt: 0 };
  return { state: capState(s), duplicate: false, previous, total: c.total, streak: c.streak };
}

// Depois de mandar o aviso (guarda a mensagem para apagar e para saber quando repetir).
function recordReminder(state = {}, patch = {}, now = Date.now()) {
  const s = normalizeState(state);
  s.reminder = {
    ...s.reminder,
    reminded: true,
    sentAt: now,
    messageId: str(patch.messageId, 25),
    channelId: str(patch.channelId || s.reminder.channelId, 25),
    deleteAt: Math.max(0, num(patch.deleteAt)),
  };
  s.counters.reminders += 1;
  return s;
}

function markDmSent(state = {}) {
  const s = normalizeState(state);
  s.reminder.dmSent = true;
  return s;
}

function capState(state = {}) {
  const s = state;
  const entries = Object.entries(s.counters?.byUser || {});
  if (entries.length > USER_CAP) {
    s.counters.byUser = Object.fromEntries(entries.sort((a, b) => b[1].n - a[1].n || b[1].lastAt - a[1].lastAt).slice(0, USER_CAP));
  }
  return s;
}

function clearCounters() {
  return emptyState();
}

// Ranking/histórico desligado no painel (countStats = false): o ciclo continua, sem guardar quem bumpou.
function stripRanking(state = {}) {
  const s = normalizeState(state);
  s.counters.byUser = {};
  s.counters.byHour = new Array(24).fill(0);
  s.counters.byWeekday = new Array(7).fill(0);
  return s;
}

// ---------- Mensagens ----------
function varsFor(guild, cfg, s, lang) {
  const roles = (Array.isArray(cfg.roleIds) ? cfg.roleIds : []).filter((id) => /^\d{17,20}$/.test(String(id))).slice(0, ROLE_CAP);
  const mode = ['roles', 'bumper', 'both', 'none'].includes(cfg.pingMode) ? cfg.pingMode : 'roles';
  const roleMentions = mode === 'roles' || mode === 'both' ? roles.map((id) => `<@&${id}>`) : [];
  const bumper = s.lastBump.userId;
  const users = (mode === 'bumper' || mode === 'both') && bumper ? [bumper] : [];
  const mentions = [...roleMentions, ...users.map((id) => `<@${id}>`)];
  return {
    server: guild?.name || t('autos3.bump.fallbackServer', lang),
    role: roleMentions.join(' '),
    user: bumper ? `<@${bumper}>` : t('autos3.bump.someone', lang),
    name: s.lastBump.userName || '',
    count: s.counters.total,
    streak: s.counters.streak,
    hours: Math.max(1, Math.round((num(cfg.cooldownMinutes, 120) / 60) * 10) / 10),
    mentions,
    allowedMentions: { parse: [], users, roles: roleMentions.length ? roles : [], repliedUser: false },
  };
}

// Card do lembrete (embed por padrão; texto puro quando useEmbed = false).
function buildReminder(guild, cfg = {}, state = {}, lang = 'pt', now = Date.now()) {
  const s = normalizeState(state);
  const vars = varsFor(guild, cfg, s, lang);
  const mentionLine = vars.mentions.join(' ');
  const custom = String(cfg.customMessage || '').trim();

  const components = [];
  if (cfg.showButton !== false) {
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel(t('autos3.bump.open', lang)).setStyle(ButtonStyle.Link).setURL(disboardUrl(guild?.id)),
      ),
    );
  }

  if (cfg.useEmbed === false) {
    const text = custom
      ? fill(custom, vars)
      : mentionLine
        ? t('autos3.bump.withRole', lang, { ...vars, role: mentionLine })
        : t('autos3.bump.text', lang, vars);
    // Texto puro: a menção vai na frente, em linha própria, para não quebrar a frase.
    const content = custom && mentionLine ? `${mentionLine}\n${text}` : text;
    return { content: content.slice(0, 2000), allowedMentions: vars.allowedMentions, components };
  }

  const embedTitle = String(cfg.cardTitle || '').trim() ? fill(String(cfg.cardTitle).trim(), vars) : t('autos3.bump.embedTitle', lang, vars);
  const embedBody = custom ? fill(custom, vars) : t('autos3.bump.embedBody', lang, vars);
  const embed = new EmbedBuilder()
    .setColor(COLOR_RE.test(cfg.color || '') ? cfg.color : DEFAULT_COLOR)
    .setTitle(embedTitle.slice(0, 256))
    .setDescription(embedBody.slice(0, 4000))
    .setFooter({ text: t('autos3.bump.footer', lang, vars).slice(0, 2048) })
    .setTimestamp(now);
  const payload = { embeds: [embed], components, allowedMentions: vars.allowedMentions };
  if (mentionLine) payload.content = mentionLine;
  return payload;
}

// Agradecimento público a cada bump (opcional).
function buildThanks(guild, cfg = {}, state = {}, lang = 'pt', user = {}) {
  if (!cfg.thanksEnabled) return null;
  const s = normalizeState(state);
  const vars = { ...varsFor(guild, cfg, s, lang), user: user.id ? `<@${user.id}>` : t('autos3.bump.someone', lang), name: str(user.name || s.lastBump.userName, 40) };
  const custom = String(cfg.thanksText || '').trim();
  const content = custom ? fill(custom, vars) : t('autos3.bump.thanks', lang, vars);
  return {
    content: content.slice(0, 2000),
    allowedMentions: { parse: [], users: user.id ? [user.id] : [], roles: [], repliedUser: false },
  };
}

// Marco de bumps (milestoneEvery > 0).
function buildMilestone(guild, state = {}, total = 0, lang = 'pt') {
  if (!total) return null;
  const s = normalizeState(state);
  const vars = { ...varsFor(guild, {}, s, lang), count: total };
  return { content: t('autos3.bump.milestone', lang, vars).slice(0, 2000), allowedMentions: NO_PING };
}

// DM para quem deu o último bump.
function buildDM(guild, cfg = {}, state = {}, lang = 'pt') {
  if (!cfg.dmBumper) return null;
  const s = normalizeState(state);
  if (!s.lastBump.userId) return null;
  const vars = varsFor(guild, cfg, s, lang);
  return { content: t('autos3.bump.dm', lang, vars).slice(0, 2000), allowedMentions: NO_PING };
}

// ---------- Métricas do painel ----------
function insights(state = {}, cfg = {}, now = Date.now()) {
  const s = normalizeState(state);
  const c = s.counters;
  const top = Object.entries(c.byUser)
    .map(([id, u]) => ({ id, name: u.name, n: u.n, lastAt: u.lastAt }))
    .sort((a, b) => b.n - a.n || b.lastAt - a.lastAt)
    .slice(0, 5);
  const byHour = c.byHour.map((n, hour) => ({ hour, n })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const byWeekday = c.byWeekday.map((n, weekday) => ({ weekday, n })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  return {
    total: c.total,
    reminders: c.reminders,
    streak: c.streak,
    bestStreak: c.bestStreak,
    lastAt: s.lastBump.at || null,
    lastUser: s.lastBump.userId || null,
    lastUserName: s.lastBump.userName || '',
    lastChannelId: s.lastBump.channelId || '',
    pending: Boolean(s.reminder.at) && !s.reminder.reminded,
    sentAt: s.reminder.sentAt || null,
    nextAt: nextReminderAt(cfg, s, now),
    top,
    bestHour: byHour.length ? byHour[0].hour : null,
    bestWeekday: byWeekday.length ? byWeekday[0].weekday : null,
  };
}

module.exports = {
  MINUTE,
  HOUR,
  USER_CAP,
  ROLE_CAP,
  DEFAULT_COLOR,
  emptyState,
  normalizeState,
  isQuiet,
  quietResumeAt,
  nextReminderAt,
  bumperFrom,
  milestoneFor,
  recordBump,
  recordReminder,
  markDmSent,
  capState,
  stripRanking,
  clearCounters,
  buildReminder,
  buildThanks,
  buildMilestone,
  buildDM,
  insights,
};
