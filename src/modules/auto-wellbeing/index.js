// Automações de bem-estar e comunidade: pausa de hiperfoco, horário de descanso, primeira mensagem
// acolhida, ninguém sem resposta, cuidado em crise, marcos de membros e agradecimento de boost.
// Tom caloroso e sem ironia (AGENTS.md §12). Tudo desligado por padrão; liga em /dashboard → Automações.
const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const auto = require('../../services/automations');
const stats = require('../../services/automationStats');
const state = require('../../services/autoState');
const r3 = require('../../services/autoRules3');
const { inWindow } = require('../../services/animator');
const { staffAlert, NO_PING } = require('../../services/autoAlerts');
const { getVentChannelId } = require('../../services/guildConfigService');
const { t, getLanguage, TRANSLATIONS } = require('../../utils/i18n');

const MINUTE = 60000;
const focus = r3.createFocusTracker(20 * MINUTE);
const crisisSeen = new Map(); // guild:user -> última vez
const pending = new Map(); // canal ou tópico -> { guildId, authorId, messageId, at }

const on = (guildId, key) => {
  const cfg = auto.getConfig(guildId, key);
  return cfg.enabled ? cfg : null;
};
const duration = (lang, minutes) => (minutes >= 60 && minutes % 60 === 0 ? `\`${minutes / 60}\` h` : `\`${minutes}\` min`);

// ---------- Pausa de hiperfoco ----------
async function breakReminder(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'breakReminder');
  if (!cfg || !cfg.roleId || !message.member?.roles?.cache?.has(cfg.roleId)) return null;
  const key = `${message.guild.id}:${message.author.id}`;
  const s = focus.hit(key, now);
  if (now - s.start < cfg.minutes * MINUTE || s.count < cfg.messages || now - s.remindedAt < 4 * 3600000) return null;
  focus.reminded(key, now);
  const lang = getLanguage(message.guild.id);
  const dur = duration(lang, cfg.minutes);
  const content = cfg.customMessage?.trim()
    ? r3.fill(cfg.customMessage, { user: `<@${message.author.id}>`, minutes: dur })
    : t('autos3.break.text', lang, { user: `<@${message.author.id}>`, minutes: dur });
  const dm = await message.author.send?.({ content, allowedMentions: NO_PING }).catch(() => null);
  if (!dm && cfg.channelFallback !== false) {
    const sent = await message.reply({ content, allowedMentions: NO_PING }).catch(() => null);
    if (sent) setTimeout(() => sent.delete().catch(() => null), 2 * MINUTE).unref?.();
  }
  stats.bump(message.guild.id, 'breakReminder', 'hits');
  return 'reminded';
}

// ---------- Horário de descanso ----------
async function quietTick(client, now = Date.now()) {
  const { hour } = r3.brtParts(now);
  for (const guild of client.guilds.cache.values()) {
    const cfg = auto.getConfig(guild.id, 'quietHours');
    const saved = state.read(guild.id, 'quietHours.json');
    const channels = saved.channels || {};
    const active = cfg.enabled && cfg.hourStart !== cfg.hourEnd && inWindow(hour, cfg.hourStart, (cfg.hourEnd + 23) % 24);
    const lang = getLanguage(guild.id);
    const wanted = active ? cfg.channelIds : [];
    // Entra no descanso.
    for (const id of wanted) {
      if (channels[id]) continue;
      const ch = guild.channels.cache.get(id);
      if (!ch?.isTextBased?.()) continue;
      const entry = { mode: cfg.mode };
      if (cfg.mode === 'lock') {
        const ow = ch.permissionOverwrites?.cache?.get(guild.id);
        entry.prev = ow?.allow?.has?.(PermissionFlagsBits.SendMessages) ? true : ow?.deny?.has?.(PermissionFlagsBits.SendMessages) ? false : null;
        const ok = await ch.permissionOverwrites.edit(guild.id, { SendMessages: false }, { reason: 'Pyxie: quiet hours' }).then(() => true).catch(() => false);
        if (!ok) continue;
        for (const rId of cfg.exemptRoleIds || []) {
          await ch.permissionOverwrites.edit(rId, { SendMessages: true }, { reason: 'Pyxie: quiet hours exempt' }).catch(() => null);
        }
      } else {
        entry.prev = ch.rateLimitPerUser || 0;
        const ok = await ch.setRateLimitPerUser(Math.max(30, entry.prev), 'Pyxie: quiet hours').then(() => true).catch(() => false);
        if (!ok) continue;
      }
      channels[id] = entry;
      const startText = cfg.customStartMessage?.trim()
        ? r3.fill(cfg.customStartMessage, { end: `${String(cfg.hourEnd).padStart(2, '0')}:00` })
        : t('autos3.quiet.start', lang, { mode: t(cfg.mode === 'lock' ? 'autos3.quiet.modeLock' : 'autos3.quiet.modeSlow', lang), end: `\`${String(cfg.hourEnd).padStart(2, '0')}:00\`` });
      await ch.send({ content: startText, allowedMentions: NO_PING }).catch(() => null);
      stats.bump(guild.id, 'quietHours', 'hits');
    }
    // Sai do descanso (ou automação desligada / canal tirado da lista): volta como estava.
    for (const [id, entry] of Object.entries(channels)) {
      if (wanted.includes(id)) continue;
      const ch = guild.channels.cache.get(id);
      if (ch) {
        if (entry.mode === 'lock') await ch.permissionOverwrites.edit(guild.id, { SendMessages: entry.prev }, { reason: 'Pyxie: quiet hours ended' }).catch(() => null);
        else await ch.setRateLimitPerUser(entry.prev, 'Pyxie: quiet hours ended').catch(() => null);
        const endText = cfg.customEndMessage?.trim() || t('autos3.quiet.end', lang);
        await ch.send({ content: endText, allowedMentions: NO_PING }).catch(() => null);
      }
      delete channels[id];
    }
    if (Object.keys(channels).length || saved.channels) state.write(guild.id, 'quietHours.json', { channels });
  }
}

// ---------- Primeira mensagem acolhida ----------
async function welcomeBuddy(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'welcomeBuddy');
  if (!cfg || !cfg.channelIds.includes(message.channel.id)) return null;
  const joined = message.member?.joinedTimestamp || 0;
  const maxDays = Number(cfg.maxJoinAgeDays) || 7;
  if (!joined || now - joined > maxDays * 86400000) return null;
  const seen = state.read(message.guild.id, 'welcomeBuddy.json');
  const list = seen.users || [];
  if (list.includes(message.author.id)) return null;
  state.write(message.guild.id, 'welcomeBuddy.json', { users: [...list, message.author.id].slice(-5000) });
  const lang = getLanguage(message.guild.id);
  const lines = cfg.lines.length ? cfg.lines : TRANSLATIONS[lang === 'en' ? 'en' : 'pt'].autos3.welcome.lines;
  const line = lines[Math.floor(Math.random() * lines.length)];
  stats.bump(message.guild.id, 'welcomeBuddy', 'hits');
  return message.reply({ content: r3.fill(line, { user: `<@${message.author.id}>` }), allowedMentions: NO_PING }).catch(() => null);
}

// ---------- Ninguém sem resposta ----------
function trackAnswer(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'noOneUnanswered');
  if (!cfg) return null;
  // Texto: a chave é o canal. Fórum: a chave é o tópico (criado em trackForumPost).
  const key = message.channel.id;
  const p = pending.get(key);
  if (p && p.authorId !== message.author.id) {
    pending.delete(key);
    return 'answered';
  }
  if (!p && !message.channel.isThread?.() && cfg.channelIds.includes(message.channel.id)) {
    pending.set(key, { guildId: message.guild.id, authorId: message.author.id, messageId: message.id, at: now });
    return 'waiting';
  }
  return null;
}

function trackForumPost(thread, now = Date.now()) {
  if (!thread.guild || !thread.parentId) return null;
  const cfg = on(thread.guild.id, 'noOneUnanswered');
  if (!cfg || !cfg.channelIds.includes(thread.parentId) || thread.parent?.type !== ChannelType.GuildForum) return null;
  pending.set(thread.id, { guildId: thread.guild.id, authorId: thread.ownerId, messageId: null, at: now });
  return 'waiting';
}

async function unansweredTick(client, now = Date.now()) {
  for (const [key, p] of pending) {
    const cfg = auto.getConfig(p.guildId, 'noOneUnanswered');
    if (!cfg.enabled) {
      pending.delete(key);
      continue;
    }
    if (now - p.at < cfg.minutes * MINUTE) continue;
    pending.delete(key);
    const ch = client.channels.cache.get(key);
    if (!ch?.send) continue;
    const lang = getLanguage(p.guildId);
    const mainLine = cfg.customMessage?.trim()
      ? r3.fill(cfg.customMessage, { user: `<@${p.authorId}>` })
      : t('autos3.unanswered.text', lang, { user: `<@${p.authorId}>` });
    const lines = [mainLine];
    if (cfg.helperRoleId) lines.push(`-# ${t('autos3.unanswered.helper', lang, { role: `<@&${cfg.helperRoleId}>` })}`);
    // Só o cargo de ajudantes é marcado (é a função da automação); a pessoa não.
    const allowedMentions = { parse: [], users: [], roles: cfg.helperRoleId ? [cfg.helperRoleId] : [], repliedUser: false };
    const payload = { content: lines.join('\n'), allowedMentions };
    if (p.messageId) payload.reply = { messageReference: p.messageId, failIfNotExists: false };
    await ch.send(payload).catch(() => null);
    stats.bump(p.guildId, 'noOneUnanswered', 'hits');
  }
}

// ---------- Cuidado em crise ----------
function crisisEmbed(lang, serverName, customHelplineNote = '') {
  const parts = [
    t('autos3.crisis.dm', lang, { server: serverName }),
    t('autos3.crisis.br', lang),
    t('autos3.crisis.world', lang),
    customHelplineNote.trim() ? `> ${customHelplineNote.trim()}` : null,
    `> ${t('autos3.crisis.emergency', lang)}`,
    t('autos3.crisis.stay', lang),
  ].filter(Boolean);
  return new EmbedBuilder()
    .setColor(0x10b981)
    .setTitle(t('autos3.crisis.dmTitle', lang))
    .setDescription(parts.join('\n\n'))
    .setFooter({ text: t('autos.footer', lang) });
}

async function crisisCare(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'crisisCare');
  if (!cfg || cfg.exemptChannelIds.includes(message.channel.id) || message.channel.id === getVentChannelId(message.guild.id)) return null;
  if (!r3.isCrisis(message.content)) return null;
  const key = `${message.guild.id}:${message.author.id}`;
  if (now - (crisisSeen.get(key) || 0) < 6 * 3600000) return null;
  crisisSeen.set(key, now);
  const lang = getLanguage(message.guild.id);
  const card = crisisEmbed(lang, message.guild.name, cfg.customHelplineNote || '');
  const dm = await message.author.send?.({ embeds: [card] }).catch(() => null);
  if (!dm) await message.reply({ embeds: [card], allowedMentions: NO_PING }).catch(() => null);
  else await message.reply({ content: t('autos3.crisis.channel', lang, { user: `<@${message.author.id}>` }), allowedMentions: NO_PING }).catch(() => null);
  stats.bump(message.guild.id, 'crisisCare', 'hits');
  if (cfg.alertStaff) {
    await staffAlert(message.guild, {
      title: t('autos3.crisis.staffTitle', lang),
      color: 'ok',
      lines: [t('autos3.crisis.staff', lang, { user: `<@${message.author.id}>`, channel: `<#${message.channel.id}>` }), `> ${t('autos3.crisis.staffHint', lang, { url: message.url })}`],
    });
  }
  return dm ? 'dm' : 'channel';
}

// ---------- Marcos e boost ----------
async function milestone(member) {
  const cfg = on(member.guild.id, 'memberMilestones');
  const count = member.guild.memberCount;
  if (!cfg || !cfg.channelId || !r3.isMilestone(count, cfg.step)) return null;
  const saved = state.read(member.guild.id, 'milestones.json');
  if ((saved.done || []).includes(count)) return null;
  state.write(member.guild.id, 'milestones.json', { done: [...(saved.done || []), count] });
  const ch = member.guild.channels.cache.get(cfg.channelId);
  stats.bump(member.guild.id, 'memberMilestones', 'hits');
  const lang = getLanguage(member.guild.id);
  const text = cfg.customMessage?.trim()
    ? r3.fill(cfg.customMessage, { count: `\`${count}\``, server: member.guild.name || '' })
    : t('autos3.milestone.text', lang, { count });
  return ch?.send?.({ content: text, allowedMentions: NO_PING }).catch(() => null);
}

async function boostThanks(before, after) {
  if (before.premiumSince || !after.premiumSince) return null;
  const cfg = on(after.guild.id, 'boostThanks');
  if (!cfg || !cfg.channelId) return null;
  if (cfg.rewardRoleId) await after.roles?.add?.(cfg.rewardRoleId, 'Pyxie: boost reward role')?.catch?.(() => null);
  const ch = after.guild.channels.cache.get(cfg.channelId);
  const user = `<@${after.id}>`;
  const lang = getLanguage(after.guild.id);
  const content = cfg.text.trim() ? r3.fill(cfg.text, { user }) : t('autos3.boost.text', lang, { user });
  stats.bump(after.guild.id, 'boostThanks', 'hits');
  if (cfg.useEmbed) {
    const card = new EmbedBuilder()
      .setColor(/^#[0-9a-f]{6}$/i.test(cfg.color || '') ? cfg.color : '#f472b6')
      .setDescription(content)
      .setFooter({ text: t('autos.footer', lang) });
    return ch?.send?.({ content: user, embeds: [card], allowedMentions: { parse: [], users: [after.id], roles: [] } }).catch(() => null);
  }
  // Quem deu boost é marcado de propósito: é o agradecimento.
  return ch?.send?.({ content, allowedMentions: { parse: [], users: [after.id], roles: [] } }).catch(() => null);
}

async function onMessage(message) {
  if (!message.guild || message.author?.bot || message.webhookId) return;
  trackAnswer(message);
  if (await crisisCare(message)) return;
  await welcomeBuddy(message);
  await breakReminder(message);
}

module.exports = {
  id: 'auto-wellbeing',
  name: { 'pt-BR': 'Automações de Bem-estar', en: 'Wellbeing Automations' },
  description: {
    'pt-BR': 'Pausa de hiperfoco, horário de descanso, primeira mensagem acolhida, ninguém sem resposta, cuidado em crise, marcos de membros e agradecimento de boost. Tudo desligado por padrão.',
    en: 'Hyperfocus breaks, quiet hours, welcomed first messages, nobody left unanswered, crisis care, member milestones and boost thanks. All off by default.',
  },
  icon: '💜',
  defaultEnabled: true,
  breakReminder,
  quietTick,
  welcomeBuddy,
  trackAnswer,
  trackForumPost,
  unansweredTick,
  crisisCare,
  milestone,
  boostThanks,
  onMessage,
  _pending: pending,
  _reset: () => {
    focus.reset();
    crisisSeen.clear();
    pending.clear();
  },

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = (label, fn) => (...args) => Promise.resolve(fn(...args)).catch((err) => console.error(`[AutoWellbeing] ${label}:`, err));
    ctx.registerListener('messageCreate', safe('mensagem', onMessage));
    ctx.registerListener('threadCreate', safe('fórum', (thread) => trackForumPost(thread)));
    ctx.registerListener('guildMemberAdd', safe('marco', milestone));
    ctx.registerListener('guildMemberUpdate', safe('boost', boostThanks));
    ctx.registerInterval(safe('descanso', () => quietTick(ctx.client)), 5 * MINUTE);
    ctx.registerInterval(safe('sem resposta', () => unansweredTick(ctx.client)), MINUTE);
  },
};
