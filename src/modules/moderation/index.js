// Controle de brigas (plano 5.7): detector de troca rápida, classificação pelo Groq só quando dispara
// e ações graduais (aviso → modo lento → castigo de 15 min), sempre com registro para a staff.
const fs = require('node:fs');
const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const watch = require('../../services/conflictWatch');
const { getVentChannelId } = require('../../services/guildConfigService');
const { t } = require('../../utils/i18n');

const noPing = { parse: [] };
const escapeMentions = (s) => String(s || '').replace(/<@[!&]?(\d+)>/g, '`<@$1>`').replace(/@(everyone|here)/g, '`@$1`');

function guildsWithConfig() {
  const root = path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'guilds');
  try {
    return fs.readdirSync(root).filter((id) => fs.existsSync(path.join(root, id, 'moderation.json')));
  } catch (_) {
    return [];
  }
}

async function collectTranscript(channel, a, b) {
  const recent = await channel.messages.fetch({ limit: 40 }).catch(() => null);
  const list = recent ? [...recent.values()].reverse() : [];
  const pick = (id) => list.filter((m) => m.author.id === id && m.content).slice(-6);
  return [...pick(a), ...pick(b)]
    .sort((x, y) => x.createdTimestamp - y.createdTimestamp)
    .map((m) => ({ author: m.member?.displayName || m.author.username, authorId: m.author.id, content: m.content }));
}

async function logToStaff(guild, config, { level, label, a, b, channel, transcript, action }) {
  if (!config.staffLogChannelId) return;
  const staff = await guild.channels.fetch(config.staffLogChannelId).catch(() => null);
  if (!staff?.send) return;
  const lines = transcript.map((m) => `**${escapeMentions(m.author)}:** ${escapeMentions(m.content).slice(0, 180)}`).join('\n\n');
  await staff
    .send({
      embeds: [
        {
          color: level >= 3 ? 0xef4444 : level === 2 ? 0xf59e0b : 0x8b5cf6,
          title: t('moderation.logTitle', guild, { level }),
          description: [
            t('moderation.logWho', guild, { a: `\`<@${a}>\``, b: `\`<@${b}>\``, channel: `<#${channel.id}>` }),
            t('moderation.logVerdict', guild, { label }),
            t('moderation.logAction', guild, { action: t(`moderation.action.${action}`, guild) }),
            `### ${t('moderation.logExcerpt', guild)}`,
            lines.slice(0, 3500) || '—',
          ].join('\n\n'),
          timestamp: new Date().toISOString(),
        },
      ],
      allowedMentions: noPing,
    })
    .catch(() => null);
}

async function act(message, key, a, b) {
  const { guild, channel } = message;
  const config = watch.getConfig(guild.id);
  const transcript = await collectTranscript(channel, a, b);
  const { label } = await watch.classify(transcript);
  if (label !== 'hostil') {
    // Conversa animada não é problema; sem resposta do Groq, só registra para a staff decidir.
    if (label === 'desconhecida') await logToStaff(guild, config, { level: 0, label, a, b, channel, transcript, action: 'none' });
    return { label, action: 'none' };
  }

  const level = watch.nextLevel(key);
  let action = 'warn';
  if (level === 1) {
    await channel.send({ content: t('moderation.warn', guild, { a: `<@${a}>`, b: `<@${b}>` }), allowedMentions: noPing }).catch(() => null);
  } else if (level === 2 && guild.members.me?.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels) && channel.setRateLimitPerUser) {
    const slowSec = Number(config.slowmodeSeconds) || watch.SLOWMODE_SECONDS;
    watch.rememberSlowmode(guild.id, channel.id, channel.rateLimitPerUser || 0, Date.now() + watch.SLOWMODE_MS);
    await channel.setRateLimitPerUser(slowSec, 'Pyxie: conversa esquentou').catch(() => null);
    await channel.send({ content: t('moderation.slowmode', guild, { seconds: slowSec, minutes: watch.SLOWMODE_MS / 60000 }), allowedMentions: noPing }).catch(() => null);
    action = 'slowmode';
  } else if (level >= 3) {
    action = 'timeout';
    const timeoutMs = (Number(config.timeoutMinutes) || 15) * 60000;
    for (const id of [a, b]) {
      const member = await guild.members.fetch(id).catch(() => null);
      if (!member?.moderatable) continue;
      await member.timeout(timeoutMs, 'Pyxie: discussão continuou depois do aviso e do modo lento').catch(() => null);
      await member.send({ content: t('moderation.timeoutDm', guild, { server: guild.name }), allowedMentions: noPing }).catch(() => null);
    }
  }
  await logToStaff(guild, config, { level, label, a, b, channel, transcript, action });
  watch.recordIncident(guild.id, { at: Date.now(), channelId: channel.id, users: [a, b], level, action, label });
  return { label, action, level };
}

async function onMessage(message) {
  if (!message.guild || message.author.bot || !message.reference?.messageId) return null;
  const config = watch.getConfig(message.guild.id);
  if (!config.enabled) return null;
  const channelIds = [message.channel.id, message.channel.parentId].filter(Boolean);
  // D9: o Groq nunca lê desabafos; canais isentos (ex.: debate com regras próprias) ficam de fora.
  const ventId = getVentChannelId(message.guild.id);
  if (channelIds.some((id) => id === ventId || config.exemptChannelIds.includes(id))) return null;
  const replied = await message.fetchReference().catch(() => null);
  if (!replied || replied.author.bot) return null;
  const key = watch.trackReply({
    guildId: message.guild.id,
    channelId: message.channel.id,
    authorId: message.author.id,
    repliedToId: replied.author.id,
    windowMs: (Number(config.windowSeconds) || 120) * 1000,
    repliesToTrigger: Number(config.repliesToTrigger) || watch.REPLIES_TO_TRIGGER,
  });
  if (!key) return null;
  return act(message, key, message.author.id, replied.author.id);
}

module.exports = {
  id: 'moderation',
  name: { 'pt-BR': 'Controle de Brigas', en: 'Conflict Care' },
  description: {
    'pt-BR': 'Percebe discussões que esquentam, pede calma, liga modo lento temporário e, se continuar, aplica castigo de 15 minutos. Nunca bane. Registra tudo para a staff.',
    en: 'Notices heated arguments, asks for calm, turns on a temporary slow mode and, if it goes on, applies a 15-minute timeout. Never bans. Logs everything for the staff.',
  },
  icon: '🛡️',
  // Exclusivo do servidor oficial (plano 5.7): o Groq tem cota pequena e a regra é da comunidade.
  guildScope: [require('../../config/scopes').CRINGELANDIA_GUILD_ID],
  defaultEnabled: true,
  onMessage,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('messageCreate', (message) => {
      onMessage(message).catch((err) => console.error('[Moderation] Erro no detector:', err));
    });
    ctx.registerInterval(() => {
      watch.restoreExpiredSlowmodes(ctx.client, guildsWithConfig()).catch((err) => console.error('[Moderation] Erro ao restaurar modo lento:', err));
    }, 60000);
  },

  async onUnload() {
    watch.resetMemory();
  },
};
