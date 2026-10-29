// Ferramentas do dia a dia: call temporária, contador de membros no nome do canal, respostas
// automáticas, recados agendados, resumo semanal para a staff, arquivo de fixadas e lembrete de bump.
// Tudo desligado por padrão; liga em /dashboard → Automações. Regras em src/services/autoRules3.js.
const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const auto = require('../../services/automations');
const stats = require('../../services/automationStats');
const state = require('../../services/autoState');
const r3 = require('../../services/autoRules3');
const { embed, NO_PING } = require('../../services/autoAlerts');
const { t, getLanguage } = require('../../utils/i18n');

const MINUTE = 60000;
const BUMP_MS = 2 * 3600000;
const faqCooldown = new Map(); // canal:índice -> última resposta

const on = (guildId, key) => {
  const cfg = auto.getConfig(guildId, key);
  return cfg.enabled ? cfg : null;
};

// ---------- Call temporária ----------
async function tempVoice(before, after) {
  const guild = after.guild || before.guild;
  const cfg = on(guild.id, 'tempVoice');
  const saved = state.read(guild.id, 'tempVoice.json');
  const ids = saved.ids || [];
  let changed = false;
  // Saiu de uma sala temporária que ficou vazia: apaga.
  if (before.channelId && before.channelId !== after.channelId && ids.includes(before.channelId)) {
    const room = guild.channels.cache.get(before.channelId);
    if (!room || room.members?.size === 0) {
      await room?.delete?.('Pyxie: empty temporary room').catch(() => null);
      ids.splice(ids.indexOf(before.channelId), 1);
      changed = true;
    }
  }
  let created = null;
  if (cfg && cfg.hubChannelId && after.channelId === cfg.hubChannelId && after.member && !after.member.user?.bot) {
    const hub = guild.channels.cache.get(cfg.hubChannelId);
    const lang = getLanguage(guild.id);
    const user = after.member.displayName || after.member.user?.username || '?';
    const name = r3.fill(cfg.nameTemplate.trim() || t('autos3.temp.name', lang, { user: '{user}' }), { user }).slice(0, 90);
    created = await guild.channels
      .create({
        name,
        type: ChannelType.GuildVoice,
        parent: hub?.parentId || undefined,
        userLimit: cfg.userLimit || undefined,
        permissionOverwrites: [{ id: after.member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers] }],
        reason: 'Pyxie: temporary room',
      })
      .catch(() => null);
    if (created) {
      ids.push(created.id);
      changed = true;
      await after.member.voice?.setChannel?.(created).catch(() => null);
      stats.bump(guild.id, 'tempVoice', 'hits');
    }
  }
  if (changed) state.write(guild.id, 'tempVoice.json', { ids: ids.slice(-200) });
  return created;
}

// Depois de um reinício, salas vazias que ficaram para trás.
async function tempVoiceSweep(client) {
  for (const guild of client.guilds.cache.values()) {
    const ids = state.read(guild.id, 'tempVoice.json').ids || [];
    if (!ids.length) continue;
    const keep = [];
    for (const id of ids) {
      const room = guild.channels.cache.get(id);
      if (room && room.members?.size > 0) keep.push(id);
      else await room?.delete?.('Pyxie: empty temporary room').catch(() => null);
    }
    if (keep.length !== ids.length) state.write(guild.id, 'tempVoice.json', { ids: keep });
  }
}

// ---------- Contador de membros ----------
async function counterTick(client) {
  for (const guild of client.guilds.cache.values()) {
    const cfg = on(guild.id, 'memberCounter');
    if (!cfg || !cfg.channelId) continue;
    const ch = guild.channels.cache.get(cfg.channelId);
    if (!ch?.setName) continue;
    const name = r3.fill(cfg.template.trim() || t('autos3.counter.default', getLanguage(guild.id), { count: '{count}' }), { count: guild.memberCount }).slice(0, 100);
    // O Discord só deixa renomear 2 vezes a cada 10 min: só mexe quando muda.
    if (ch.name !== name) await ch.setName(name, 'Pyxie: member counter').catch(() => null);
  }
}

// ---------- Respostas automáticas ----------
async function faq(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'faqReplies');
  if (!cfg || (cfg.channelIds.length && !cfg.channelIds.includes(message.channel.id))) return null;
  const pairs = r3.parseFaq(cfg.pairs);
  const hit = r3.matchFaq(pairs, message.content, cfg.matchMode || 'word');
  if (!hit) return null;
  const key = `${message.channel.id}:${pairs.indexOf(hit)}`;
  const cooldownMs = (Number(cfg.cooldownSeconds) || 120) * 1000;
  if (now - (faqCooldown.get(key) || 0) < cooldownMs) return null;
  faqCooldown.set(key, now);
  if (faqCooldown.size > 2000) faqCooldown.delete(faqCooldown.keys().next().value);
  stats.bump(message.guild.id, 'faqReplies', 'hits');
  return message.reply({ content: hit.answer.slice(0, 1900), allowedMentions: NO_PING }).catch(() => null);
}

// ---------- Recados agendados ----------
async function scheduledTick(client, now = Date.now()) {
  const { day, hour, weekday } = r3.brtParts(now);
  for (const guild of client.guilds.cache.values()) {
    const cfg = on(guild.id, 'scheduledMessages');
    if (!cfg || !cfg.channelId || !cfg.text.trim() || hour !== cfg.hour || !cfg.weekdays.includes(String(weekday))) continue;
    const saved = state.read(guild.id, 'scheduled.json');
    if (saved.lastDay === day) continue;
    const ch = guild.channels.cache.get(cfg.channelId);
    const lang = getLanguage(guild.id);
    const payload = cfg.useEmbed
      ? {
          embeds: [
            new EmbedBuilder()
              .setColor(/^#[0-9a-f]{6}$/i.test(cfg.color || '') ? cfg.color : '#8b5cf6')
              .setTitle(cfg.title?.trim() || null)
              .setDescription(cfg.text)
              .setFooter({ text: t('autos.footer', lang) })
              .setTimestamp(now),
          ],
          allowedMentions: NO_PING,
        }
      : { content: cfg.text, allowedMentions: NO_PING };
    const sent = await ch?.send?.(payload).catch(() => null);
    if (!sent) continue;
    state.write(guild.id, 'scheduled.json', { lastDay: day });
    stats.bump(guild.id, 'scheduledMessages', 'hits');
  }
}

// ---------- Resumo semanal ----------
async function digestTick(client, now = Date.now()) {
  const { hour, weekday } = r3.brtParts(now);
  const week = r3.weekKey(now);
  for (const guild of client.guilds.cache.values()) {
    const cfg = on(guild.id, 'weeklyDigest');
    if (!cfg || !cfg.channelId || String(weekday) !== cfg.weekday || hour < 10) continue;
    const saved = state.read(guild.id, 'digest.json');
    if (saved.week === week) continue;
    const lang = getLanguage(guild.id);
    const s = require('../../services/guildActivity').summary(guild.id, now).week;
    // Ações da semana = total agora menos a foto da semana passada.
    const totals = Object.fromEntries(Object.entries(stats.read(guild.id)).map(([k, v]) => [k, v.hits || v.posts || 0]));
    const top = Object.entries(totals)
      .map(([k, v]) => [k, v - (saved.totals?.[k] || 0)])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `- ${t(`autos3.names.${k}`, lang)} · \`${v}\``);
    const lines = [t('autos3.digest.body', lang, s), top.length ? `${t('autos3.digest.autos', lang)}\n${top.join('\n')}` : t('autos3.digest.none', lang)];
    const ch = guild.channels.cache.get(cfg.channelId);
    const sent = await ch?.send?.({ embeds: [embed(lang, { title: t('autos3.digest.title', lang), lines })], allowedMentions: NO_PING }).catch(() => null);
    if (sent) state.write(guild.id, 'digest.json', { week, totals });
  }
}

// ---------- Arquivo de fixadas ----------
async function pinArchive(channel) {
  if (!channel?.guild) return 0;
  const cfg = on(channel.guild.id, 'pinArchive');
  if (!cfg || !cfg.archiveChannelId || channel.id === cfg.archiveChannelId || !channel.messages?.fetchPinned) return 0;
  const pins = await channel.messages.fetchPinned().catch(() => null);
  if (!pins || pins.size < cfg.keep) return 0;
  const archive = channel.guild.channels.cache.get(cfg.archiveChannelId);
  if (!archive?.send) return 0;
  const lang = getLanguage(channel.guild.id);
  const oldest = [...pins.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp).slice(0, pins.size - cfg.keep + 1).slice(0, 3);
  let moved = 0;
  for (const m of oldest) {
    const image = [...(m.attachments?.values?.() || [])].find((a) => /^image\//.test(a.contentType || ''));
    const card = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle(t('autos3.pins.title', lang))
      .setDescription([m.content?.slice(0, 3000), t('autos3.pins.moved', lang, { channel: `<#${channel.id}>`, user: `<@${m.author?.id}>` }), `[${t('autos3.pins.jump', lang)}](${m.url})`].filter(Boolean).join('\n\n'))
      .setFooter({ text: t('autos.footer', lang) })
      .setTimestamp(m.createdTimestamp);
    if (image) card.setImage(image.url);
    const sent = await archive.send({ embeds: [card], allowedMentions: NO_PING }).catch(() => null);
    if (!sent) break;
    await m.unpin('Pyxie: pin archive').catch(() => null);
    moved += 1;
  }
  if (moved) stats.bump(channel.guild.id, 'pinArchive', 'hits', moved);
  return moved;
}

// ---------- Lembrete de bump ----------
function noteBump(message, now = Date.now()) {
  if (!message.guild || !r3.isBumpDone(message) || !on(message.guild.id, 'bumpReminder')) return false;
  state.write(message.guild.id, 'bump.json', { channelId: message.channel.id, at: now, reminded: false });
  return true;
}

async function bumpTick(client, now = Date.now()) {
  for (const guild of client.guilds.cache.values()) {
    const cfg = on(guild.id, 'bumpReminder');
    if (!cfg) continue;
    const saved = state.read(guild.id, 'bump.json');
    const waitMs = (Number(cfg.cooldownMinutes) || 120) * MINUTE;
    if (!saved.at || saved.reminded || now - saved.at < waitMs) continue;
    const ch = guild.channels.cache.get(saved.channelId);
    const lang = getLanguage(guild.id);
    let content;
    if (cfg.customMessage?.trim()) {
      content = r3.fill(cfg.customMessage, { role: cfg.roleId ? `<@&${cfg.roleId}>` : '' });
    } else {
      content = cfg.roleId ? t('autos3.bump.withRole', lang, { role: `<@&${cfg.roleId}>` }) : t('autos3.bump.text', lang);
    }
    // O cargo escolhido é marcado de propósito: é o lembrete.
    const sent = await ch?.send?.({ content, allowedMentions: { parse: [], users: [], roles: cfg.roleId ? [cfg.roleId] : [] } }).catch(() => null);
    if (!sent) continue;
    state.write(guild.id, 'bump.json', { ...saved, reminded: true });
    stats.bump(guild.id, 'bumpReminder', 'hits');
  }
}

async function onMessage(message) {
  if (!message.guild) return;
  if (noteBump(message)) return;
  if (message.author?.bot || message.webhookId) return;
  await faq(message);
}

module.exports = {
  id: 'auto-tools',
  name: { 'pt-BR': 'Ferramentas Automáticas', en: 'Automatic Tools' },
  description: {
    'pt-BR': 'Call temporária, contador de membros, respostas automáticas, recados agendados, resumo semanal, arquivo de fixadas e lembrete de bump. Tudo desligado por padrão.',
    en: 'Temporary voice rooms, member counter, automatic replies, scheduled messages, weekly summary, pin archive and bump reminder. All off by default.',
  },
  icon: '🛠️',
  defaultEnabled: true,
  tempVoice,
  tempVoiceSweep,
  counterTick,
  faq,
  scheduledTick,
  digestTick,
  pinArchive,
  noteBump,
  bumpTick,
  onMessage,
  _reset: () => faqCooldown.clear(),

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = (label, fn) => (...args) => Promise.resolve(fn(...args)).catch((err) => console.error(`[AutoTools] ${label}:`, err));
    ctx.registerListener('messageCreate', safe('mensagem', onMessage));
    ctx.registerListener('voiceStateUpdate', safe('sala', tempVoice));
    ctx.registerListener('channelPinsUpdate', safe('fixadas', (channel) => pinArchive(channel)));
    ctx.registerInterval(safe('contador', () => counterTick(ctx.client)), 10 * MINUTE);
    ctx.registerInterval(safe('salas', () => tempVoiceSweep(ctx.client)), 10 * MINUTE);
    ctx.registerInterval(safe('agendados', () => scheduledTick(ctx.client)), 5 * MINUTE);
    ctx.registerInterval(safe('resumo', () => digestTick(ctx.client)), 15 * MINUTE);
    ctx.registerInterval(safe('bump', () => bumpTick(ctx.client)), MINUTE);
  },
};
