// Moderação leve: menção fantasma, registro de calls, caps lock, canal só de mídia, limite de
// divulgação, imagem como spoiler e quem convidou quem. Tudo desligado por padrão; liga em
// /dashboard → Automações. Regras em src/services/autoRules3.js.
const { AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const auto = require('../../services/automations');
const stats = require('../../services/automationStats');
const state = require('../../services/autoState');
const r3 = require('../../services/autoRules3');
const { embed, NO_PING } = require('../../services/autoAlerts');
const { t, getLanguage } = require('../../utils/i18n');

const MAX_FILE = 8 * 1024 * 1024;
const capsWarned = new Map(); // guild:user -> última vez
const inviteUses = new Map(); // guildId -> Map(code -> { uses, inviterId })

const on = (guildId, key) => {
  const cfg = auto.getConfig(guildId, key);
  return cfg.enabled ? cfg : null;
};
const isStaff = (member) => Boolean(member?.permissions?.has?.(PermissionFlagsBits.ManageMessages));

async function notice(channel, content, ms = 8000) {
  const sent = await channel.send({ content, allowedMentions: NO_PING }).catch(() => null);
  if (sent && ms) setTimeout(() => sent.delete().catch(() => null), ms).unref?.();
  return sent;
}

// ---------- Menção fantasma ----------
async function ghostPing(message, now = Date.now()) {
  if (!message.guild || message.partial || message.author?.bot) return null;
  const cfg = on(message.guild.id, 'ghostPing');
  if (!cfg || now - (message.createdTimestamp || 0) > cfg.seconds * 1000) return null;
  const users = [...(message.mentions?.users?.values?.() || [])].filter((u) => !u.bot && u.id !== message.author.id);
  const roles = [...(message.mentions?.roles?.keys?.() || [])];
  if (!users.length && !roles.length) return null;
  const targets = [...users.map((u) => `<@${u.id}>`), ...roles.map((id) => `<@&${id}>`)].slice(0, 10).join(' ');
  stats.bump(message.guild.id, 'ghostPing', 'hits');
  return message.channel.send({ content: t('autos3.ghost.text', getLanguage(message.guild.id), { author: `<@${message.author.id}>`, users: targets }), allowedMentions: NO_PING }).catch(() => null);
}

// ---------- Registro de calls ----------
async function voiceLog(before, after) {
  const guild = after.guild || before.guild;
  const cfg = on(guild.id, 'voiceLog');
  if (!cfg || !cfg.channelId || before.channelId === after.channelId) return null;
  const member = after.member || before.member;
  if (!member || member.user?.bot) return null;
  const lang = getLanguage(guild.id);
  const user = `<@${member.id}>`;
  const text = !before.channelId
    ? t('autos3.voice.join', lang, { user, channel: `<#${after.channelId}>` })
    : !after.channelId
      ? t('autos3.voice.leave', lang, { user, channel: `<#${before.channelId}>` })
      : t('autos3.voice.move', lang, { user, from: `<#${before.channelId}>`, to: `<#${after.channelId}>` });
  const log = guild.channels.cache.get(cfg.channelId);
  return log?.send?.({ content: `-# <t:${Math.floor(Date.now() / 1000)}:T> ${text}`, allowedMentions: NO_PING }).catch(() => null);
}

// ---------- Caps lock ----------
async function capsCalm(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'capsCalm');
  if (!cfg) return null;
  const { letters, ratio } = r3.capsRatio(message.content);
  if (letters < cfg.minLength || ratio * 100 < cfg.percent) return null;
  const key = `${message.guild.id}:${message.author.id}`;
  if (cfg.action === 'delete') await message.delete().catch(() => null);
  stats.bump(message.guild.id, 'capsCalm', 'hits');
  if (cfg.action === 'warn' && now - (capsWarned.get(key) || 0) < 10 * 60000) return 'quiet';
  capsWarned.set(key, now);
  await notice(message.channel, t('autos3.caps.text', getLanguage(message.guild.id), { user: `<@${message.author.id}>` }), 15000);
  return cfg.action;
}

// ---------- Canal só de mídia ----------
async function mediaOnly(message) {
  const cfg = on(message.guild.id, 'mediaOnly');
  if (!cfg || !cfg.channelIds.includes(message.channel.id)) return false;
  if ((message.attachments?.size || 0) > 0 || (message.stickers?.size || 0) > 0) return false;
  if (cfg.allowLinks && r3.hasLink(message.content)) return false;
  await message.delete().catch(() => null);
  stats.bump(message.guild.id, 'mediaOnly', 'hits');
  await notice(message.channel, t('autos3.media.text', getLanguage(message.guild.id), { user: `<@${message.author.id}>` }));
  return true;
}

// ---------- Limite de divulgação ----------
async function selfPromo(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'selfPromoLimit');
  if (!cfg || !cfg.channelIds.includes(message.channel.id) || !r3.hasLink(message.content)) return false;
  const saved = state.read(message.guild.id, 'selfPromo.json');
  const key = `${message.channel.id}:${message.author.id}`;
  const last = saved[key] || 0;
  if (now - last >= cfg.hours * 3600000) {
    saved[key] = now;
    for (const [k, at] of Object.entries(saved)) if (now - at > 7 * 86400000) delete saved[k];
    state.write(message.guild.id, 'selfPromo.json', saved);
    return false;
  }
  await message.delete().catch(() => null);
  stats.bump(message.guild.id, 'selfPromoLimit', 'hits');
  await notice(message.channel, t('autos3.promo.text', getLanguage(message.guild.id), { user: `<@${message.author.id}>`, when: `<t:${Math.floor((last + cfg.hours * 3600000) / 1000)}:R>` }), 12000);
  return true;
}

// ---------- Imagem como spoiler ----------
async function spoilerGuard(message, fetchImpl = fetch) {
  const cfg = on(message.guild.id, 'spoilerGuard');
  if (!cfg || !cfg.channelIds.includes(message.channel.id)) return false;
  const visible = [...(message.attachments?.values?.() || [])].filter((a) => /^(image|video)\//.test(a.contentType || '') && !a.spoiler && !String(a.name || '').startsWith('SPOILER_'));
  if (!visible.length) return false;
  const files = [];
  for (const a of message.attachments.values()) {
    if ((a.size || 0) > MAX_FILE) return false; // grande demais para reenviar: deixa como está
    const res = await fetchImpl(a.url).catch(() => null);
    if (!res?.ok) return false;
    const name = String(a.name || 'arquivo').replace(/^SPOILER_/, '');
    files.push(new AttachmentBuilder(Buffer.from(await res.arrayBuffer()), { name: `SPOILER_${name}` }));
  }
  const lang = getLanguage(message.guild.id);
  const header = t('autos3.spoiler.text', lang, { user: `<@${message.author.id}>` });
  const body = message.content ? `\n${message.content.slice(0, 1800)}` : '';
  const sent = await message.channel.send({ content: `${header}${body}`, files, allowedMentions: NO_PING }).catch(() => null);
  if (!sent) return false;
  await message.delete().catch(() => null);
  stats.bump(message.guild.id, 'spoilerGuard', 'hits');
  return true;
}

// ---------- Quem convidou ----------
async function snapshotInvites(guild) {
  const list = await guild.invites?.fetch?.().catch(() => null);
  if (!list) return null;
  const map = new Map([...list.values()].map((i) => [i.code, { uses: i.uses || 0, inviterId: i.inviterId || i.inviter?.id || null }]));
  inviteUses.set(guild.id, map);
  return map;
}

async function inviteTracker(member) {
  const cfg = on(member.guild.id, 'inviteTracker');
  if (!cfg || !cfg.channelId) return null;
  const before = inviteUses.get(member.guild.id) || new Map();
  const after = await snapshotInvites(member.guild);
  if (!after) return null;
  let used = null;
  for (const [code, inv] of after) if (inv.uses > (before.get(code)?.uses || 0)) used = { code, ...inv };
  // Convite de uso único some ao ser usado: se só um sumiu, foi ele.
  if (!used) {
    const gone = [...before.keys()].filter((code) => !after.has(code));
    if (gone.length === 1) used = { code: gone[0], ...before.get(gone[0]), uses: (before.get(gone[0]).uses || 0) + 1 };
  }
  const lang = getLanguage(member.guild.id);
  const line = used
    ? t('autos3.invites.by', lang, { member: `<@${member.id}>`, code: used.code, inviter: used.inviterId ? `<@${used.inviterId}>` : '?', uses: used.uses })
    : t('autos3.invites.unknown', lang, { member: `<@${member.id}>` });
  stats.bump(member.guild.id, 'inviteTracker', 'hits');
  const log = member.guild.channels.cache.get(cfg.channelId);
  await log?.send?.({ embeds: [embed(lang, { title: t('autos3.invites.title', lang), lines: [line] })], allowedMentions: NO_PING }).catch(() => null);
  return used;
}

async function onMessage(message) {
  if (!message.guild || message.author?.bot || message.webhookId || isStaff(message.member)) return;
  if (await spoilerGuard(message)) return;
  if (await mediaOnly(message)) return;
  if (await selfPromo(message)) return;
  await capsCalm(message);
}

module.exports = {
  id: 'auto-guard',
  name: { 'pt-BR': 'Moderação Leve', en: 'Light Moderation' },
  description: {
    'pt-BR': 'Menção fantasma, registro de calls, caps lock, canal só de mídia, limite de divulgação, imagem como spoiler e quem convidou quem. Tudo desligado por padrão.',
    en: 'Ghost pings, voice log, caps lock, media-only channels, self-promo limit, images as spoilers and invite tracking. All off by default.',
  },
  icon: '🪶',
  defaultEnabled: true,
  ghostPing,
  voiceLog,
  capsCalm,
  mediaOnly,
  selfPromo,
  spoilerGuard,
  snapshotInvites,
  inviteTracker,
  onMessage,
  _reset: () => {
    capsWarned.clear();
    inviteUses.clear();
  },

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = (label, fn) => (...args) => Promise.resolve(fn(...args)).catch((err) => console.error(`[AutoGuard] ${label}:`, err));
    ctx.registerListener('messageCreate', safe('mensagem', onMessage));
    ctx.registerListener('messageDelete', safe('fantasma', (m) => ghostPing(m)));
    ctx.registerListener('voiceStateUpdate', safe('call', voiceLog));
    ctx.registerListener('guildMemberAdd', safe('convite', inviteTracker));
    const refresh = safe('convites', (invite) => (invite.guild && on(invite.guild.id, 'inviteTracker') ? snapshotInvites(invite.guild) : null));
    // Só convite novo atualiza a foto: o apagado fica, para descobrir convites de uso único na entrada.
    ctx.registerListener('inviteCreate', refresh);
    // Foto inicial dos convites (e de novo a cada 30 min, para quem ligou depois).
    const snapshotAll = safe('foto', async () => {
      for (const guild of ctx.client.guilds.cache.values()) if (on(guild.id, 'inviteTracker') && !inviteUses.has(guild.id)) await snapshotInvites(guild);
    });
    ctx.registerInterval(snapshotAll, 30 * 60000);
    setTimeout(snapshotAll, 15000).unref?.();
  },
};
