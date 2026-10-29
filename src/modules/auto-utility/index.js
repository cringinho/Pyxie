// Automações de utilidade: mural de destaques, tópico automático, reações automáticas, publicar
// anúncios, mensagem fixa no fim do canal, links com prévia, mensagem longa vira arquivo, aviso de
// instabilidade do Discord e cargo de quem está em call. Tudo desligado por padrão; cada uma liga em
// /dashboard → Automações. Regras em src/services/autoRules.js.
const fs = require('node:fs');
const path = require('node:path');
const { AttachmentBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const auto = require('../../services/automations');
const stats = require('../../services/automationStats');
const rules = require('../../services/autoRules');
const { embed, NO_PING } = require('../../services/autoAlerts');
const { t, getLanguage } = require('../../utils/i18n');

const STATUS_URL = 'https://discordstatus.com/api/v2/incidents/unresolved.json';
const stickyCount = new Map(); // channelId -> mensagens desde a última fixa

const on = (guildId, key) => {
  const cfg = auto.getConfig(guildId, key);
  return cfg.enabled ? cfg : null;
};

function stateFile(guildId, name) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'guilds', String(guildId), name);
}
function readState(guildId, name) {
  try {
    return JSON.parse(fs.readFileSync(stateFile(guildId, name), 'utf8')) || {};
  } catch (_) {
    return {};
  }
}
function writeState(guildId, name, data) {
  const file = stateFile(guildId, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
  fs.renameSync(`${file}.tmp`, file);
}

// ---------- Mural de destaques ----------
function sameEmoji(reactionEmoji, wanted) {
  const custom = /<a?:\w+:(\d{17,20})>/.exec(wanted || '');
  return custom ? reactionEmoji.id === custom[1] : reactionEmoji.name === String(wanted || '').trim();
}

function starPost(message, cfg, count, lang) {
  const image = [...(message.attachments?.values?.() || [])].find((a) => /^image\//.test(a.contentType || ''));
  const colorHex = /^#[0-9a-f]{6}$/i.test(cfg.color || '') ? cfg.color : '#f59e0b';
  const card = new EmbedBuilder()
    .setColor(colorHex)
    .setAuthor({ name: message.member?.displayName || message.author?.username || '?', iconURL: message.author?.displayAvatarURL?.() })
    .setDescription([message.content?.slice(0, 3500), `[${t('autos.starboard.jump', lang)}](${message.url})`].filter(Boolean).join('\n\n'))
    .setFooter({ text: t('autos.footer', lang) })
    .setTimestamp(message.createdTimestamp || Date.now());
  if (image) card.setImage(image.url);
  return { content: `${cfg.emoji} \`${count}\` · <#${message.channelId}>`, embeds: [card], allowedMentions: NO_PING };
}

async function onReaction(reaction, user) {
  if (reaction.partial) reaction = await reaction.fetch().catch(() => null);
  const message = reaction?.message?.partial ? await reaction.message.fetch().catch(() => null) : reaction?.message;
  if (!message?.guild) return null;
  const cfg = on(message.guild.id, 'starboard');
  if (!cfg || !cfg.channelId || message.channelId === cfg.channelId || !sameEmoji(reaction.emoji, cfg.emoji)) return null;
  if ((cfg.ignoreChannelIds || []).includes(message.channelId)) return null;
  if (!cfg.selfStar && user?.id && message.author?.id && user.id === message.author.id && reaction.count <= cfg.threshold) {
    // Se o próprio autor reagiu e selfStar é false, desconta 1 se o autor estiver na contagem
    if (reaction.count - 1 < cfg.threshold) return null;
  }
  if (reaction.count < cfg.threshold) return null;
  const board = message.guild.channels.cache.get(cfg.channelId);
  if (!board?.isTextBased?.()) return null;
  const lang = getLanguage(message.guild.id);
  const state = readState(message.guild.id, 'starboard.json');
  const post = starPost(message, cfg, reaction.count, lang);
  if (state[message.id]) {
    await board.messages.edit(state[message.id], post).catch(() => null);
    return 'updated';
  }
  const sent = await board.send(post).catch(() => null);
  if (!sent) return null;
  const ids = Object.keys(state);
  if (ids.length >= 500) delete state[ids[0]];
  writeState(message.guild.id, 'starboard.json', { ...state, [message.id]: sent.id });
  stats.bump(message.guild.id, 'starboard', 'hits');
  return 'posted';
}

// ---------- Mensagens ----------
async function longPaste(message) {
  const cfg = on(message.guild.id, 'longPaste');
  if (!cfg || cfg.exemptChannelIds.includes(message.channel.id)) return false;
  if ((cfg.exemptRoleIds || []).some((id) => message.member?.roles?.cache?.has?.(id))) return false;
  const lines = rules.lineCount(message.content);
  if (lines < cfg.maxLines) return false;
  const lang = getLanguage(message.guild.id);
  const file = new AttachmentBuilder(Buffer.from(message.content, 'utf8'), { name: lang === 'en' ? 'message.txt' : 'mensagem.txt' });
  const previewN = Math.max(0, Number(cfg.keepPreviewLines) || 0);
  const previewBlock = previewN > 0 ? `\n> ${String(message.content || '').split('\n').slice(0, previewN).join('\n> ').slice(0, 600)}\n> …` : '';
  const sent = await message.channel.send({ content: `${t('autos.longPaste.notice', lang, { user: `<@${message.author.id}>`, lines: `\`${lines}\`` })}${previewBlock}`, files: [file], allowedMentions: NO_PING }).catch(() => null);
  if (!sent) return false;
  await message.delete().catch(() => null);
  stats.bump(message.guild.id, 'longPaste', 'hits');
  return true;
}

async function linkFixer(message) {
  const cfg = on(message.guild.id, 'linkFixer');
  if (!cfg || (cfg.exemptChannelIds || []).includes(message.channel?.id || message.channelId)) return null;
  const links = rules.fixLinks(message.content, cfg.sites);
  if (!links.length) return null;
  if (cfg.deleteOriginal) await message.delete().catch(() => null);
  else await message.suppressEmbeds?.(true).catch(() => null);
  const lang = getLanguage(message.guild.id);
  stats.bump(message.guild.id, 'linkFixer', 'hits');
  const sendFn = cfg.deleteOriginal ? (p) => message.channel.send(p) : (p) => message.reply(p);
  return sendFn({ content: `-# ${t('autos.linkFixer.label', lang)}\n${links.join('\n')}`, allowedMentions: NO_PING }).catch(() => null);
}

async function autoThread(message) {
  const cfg = on(message.guild.id, 'autoThread');
  if (!cfg || !cfg.channelIds.includes(message.channel.id) || message.hasThread || !message.startThread) return null;
  const lang = getLanguage(message.guild.id);
  const user = message.member?.displayName || message.author.username;
  const first = String(message.content || '')
    .replace(/<[@#&!:a-z0-9]+>/gi, '')
    .replace(/https?:\/\/\S+/g, '')
    .split('\n')[0]
    .trim()
    .slice(0, 80);
  let name;
  if (cfg.nameTemplate && cfg.nameTemplate.trim()) {
    name = cfg.nameTemplate.replace(/\{user\}/g, user).replace(/\{channel\}/g, message.channel.name || '').slice(0, 80);
  } else {
    name = first.length >= 3 ? first : t('autos.thread.name', lang, { user }).slice(0, 80);
  }
  const autoArchiveDuration = [60, 1440, 4320, 10080].includes(Number(cfg.archiveMinutes)) ? Number(cfg.archiveMinutes) : undefined;
  const thread = await message.startThread({ name, ...(autoArchiveDuration ? { autoArchiveDuration } : {}) }).catch(() => null);
  if (thread) stats.bump(message.guild.id, 'autoThread', 'hits');
  return thread;
}

async function autoReact(message) {
  const cfg = on(message.guild.id, 'autoReactions');
  if (!cfg || !cfg.channelIds.includes(message.channel.id)) return 0;
  if (cfg.ignoreBots !== false && message.author?.bot) return 0;
  let n = 0;
  for (const emoji of rules.parseEmojis(cfg.emojis)) n += (await message.react(emoji).then(() => 1).catch(() => 0));
  if (n > 0) stats.bump(message.guild.id, 'autoReactions', 'hits');
  return n;
}

const publishRate = rules.createRateCounter();
async function autoPublish(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'autoPublish');
  if (!cfg || !cfg.channelIds.includes(message.channel.id) || message.channel.type !== ChannelType.GuildAnnouncement || !message.crosspostable) return false;
  if (cfg.ignoreBots && (message.author?.bot || message.webhookId)) return false;
  const limit = Number(cfg.maxPerHour) || 10;
  if (publishRate.count(message.channel.id, now, 3600000) >= limit) return false;
  const ok = await message.crosspost().then(() => true).catch(() => false);
  if (ok) {
    publishRate.hit(message.channel.id, now, 3600000);
    stats.bump(message.guild.id, 'autoPublish', 'hits');
  }
  return ok;
}

async function sticky(message) {
  const cfg = on(message.guild.id, 'stickyMessage');
  if (!cfg || cfg.channelId !== message.channel.id || !cfg.text.trim()) return null;
  const n = (stickyCount.get(message.channel.id) || 0) + 1;
  stickyCount.set(message.channel.id, n);
  if (n < cfg.every) return null;
  stickyCount.set(message.channel.id, 0);
  const state = readState(message.guild.id, 'sticky.json');
  if (state[message.channel.id]) await message.channel.messages.delete(state[message.channel.id]).catch(() => null);
  const lang = getLanguage(message.guild.id);
  const payload = cfg.useEmbed
    ? {
        embeds: [
          new EmbedBuilder()
            .setColor(/^#[0-9a-f]{6}$/i.test(cfg.color || '') ? cfg.color : '#8b5cf6')
            .setDescription(cfg.text)
            .setFooter({ text: t('autos.sticky.label', lang) }),
        ],
        allowedMentions: NO_PING,
      }
    : { content: `${cfg.text}\n-# ${t('autos.sticky.label', lang)}`, allowedMentions: NO_PING };
  const sent = await message.channel.send(payload).catch(() => null);
  if (sent) {
    writeState(message.guild.id, 'sticky.json', { ...state, [message.channel.id]: sent.id });
    stats.bump(message.guild.id, 'stickyMessage', 'hits');
  }
  return sent;
}

async function onMessage(message, client) {
  if (!message.guild) return;
  // Anúncio publicado por bot (ou pela própria Pyxie) também é publicado.
  await autoPublish(message);
  if (message.author?.id === client?.user?.id) return;
  if (message.author?.bot || message.webhookId) {
    await sticky(message);
    return;
  }
  if (await longPaste(message)) return;
  await linkFixer(message);
  await autoThread(message);
  await autoReact(message);
  await sticky(message);
}

// ---------- Status do Discord ----------
async function statusTick(client, fetchImpl = fetch) {
  const guilds = [...client.guilds.cache.values()].filter((g) => on(g.id, 'discordStatus')?.channelId);
  if (!guilds.length) return null;
  const res = await fetchImpl(STATUS_URL).catch(() => null);
  if (!res?.ok) return null;
  const incidents = rules.unresolvedIncidents(await res.json().catch(() => ({})));
  for (const guild of guilds) {
    const cfg = auto.getConfig(guild.id, 'discordStatus');
    const channel = guild.channels.cache.get(cfg.channelId);
    if (!channel?.isTextBased?.()) continue;
    const lang = getLanguage(guild.id);
    const state = readState(guild.id, 'discordStatus.json');
    const posted = state.posted || {};
    for (const inc of incidents) {
      if (posted[inc.id]) continue;
      const sent = await channel
        .send({
          embeds: [embed(lang, { title: t('autos.status.title', lang), color: 'warn', lines: [t('autos.status.body', lang, { name: inc.name, status: inc.status }), `> ${t('autos.status.hint', lang)}`, `[${t('autos.status.follow', lang)}](${inc.url})`] })],
          allowedMentions: NO_PING,
        })
        .catch(() => null);
      if (sent) {
        posted[inc.id] = { messageId: sent.id, name: inc.name };
        stats.bump(guild.id, 'discordStatus', 'hits');
      }
    }
    // Resolvido: a mesma mensagem vira "normalizado", sem post novo.
    for (const [id, p] of Object.entries(posted)) {
      if (incidents.some((i) => i.id === id)) continue;
      await channel.messages.edit(p.messageId, { embeds: [embed(lang, { title: t('autos.status.resolvedTitle', lang), color: 'ok', lines: [t('autos.status.resolved', lang, { name: p.name })] })] }).catch(() => null);
      delete posted[id];
    }
    writeState(guild.id, 'discordStatus.json', { posted });
  }
  return incidents.length;
}

// ---------- Cargo de quem está em call ----------
async function onVoice(before, after) {
  const guild = after.guild || before.guild;
  const cfg = on(guild.id, 'voiceRole');
  if (!cfg || !cfg.roleId) return null;
  const member = after.member || before.member;
  if (!member || member.user?.bot) return null;
  if ((cfg.exemptRoleIds || []).some((id) => member.roles?.cache?.has?.(id))) return null;
  const inCall = Boolean(after.channelId) && !cfg.excludeChannelIds.includes(after.channelId);
  const has = member.roles.cache.has(cfg.roleId);
  if (inCall && !has) {
    const added = await member.roles.add(cfg.roleId, 'Pyxie: in voice').then(() => 'added').catch(() => null);
    if (added && cfg.dmNotice) {
      const lang = getLanguage(guild.id);
      member.send?.({ content: t('autos.voiceRole.dm', lang, { server: guild.name }), allowedMentions: NO_PING }).catch(() => null);
    }
    return added;
  }
  if (!inCall && has) return member.roles.remove(cfg.roleId, 'Pyxie: left voice').then(() => 'removed').catch(() => null);
  return null;
}

module.exports = {
  id: 'auto-utility',
  name: { 'pt-BR': 'Automações de Utilidade', en: 'Utility Automations' },
  description: {
    'pt-BR': 'Mural de destaques, tópico e reações automáticas, publicar anúncios, mensagem fixa, links com prévia, mensagem longa vira arquivo, aviso de instabilidade do Discord e cargo de quem está em call. Tudo desligado por padrão.',
    en: 'Starboard, automatic threads and reactions, auto-publish announcements, sticky message, link previews, long messages as files, Discord outage notices and an in-voice role. All off by default.',
  },
  icon: '🧰',
  defaultEnabled: true,
  onReaction,
  onMessage,
  longPaste,
  linkFixer,
  autoThread,
  autoReact,
  autoPublish,
  sticky,
  statusTick,
  onVoice,
  _stickyCount: stickyCount,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = (label, fn) => (...args) => Promise.resolve(fn(...args)).catch((err) => console.error(`[AutoUtility] ${label}:`, err));
    ctx.registerListener('messageCreate', safe('mensagem', (message) => onMessage(message, ctx.client)));
    ctx.registerListener('messageReactionAdd', safe('destaque', (reaction) => onReaction(reaction)));
    ctx.registerListener('voiceStateUpdate', safe('call', onVoice));
    ctx.registerInterval(safe('status', () => statusTick(ctx.client)), 5 * 60000);
  },
};

