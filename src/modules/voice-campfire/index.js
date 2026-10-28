// Fogueira de voz: quando uma call pública junta gente por um tempo, a Pyxie posta um cartão
// discreto convidando para entrar (sem marcar ninguém, sem nomes, só a contagem). O cartão some
// quando a call esvazia. Desligada por padrão; cada servidor liga em /dashboard → Recursos.
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const campfire = require('../../services/campfire');
const { t } = require('../../utils/i18n');

const CHECK_MS = 60 * 1000;
const calls = new Map(); // voiceChannelId -> { guildId, since, messageId, postChannelId, lastAnnouncedAt }

function humans(channel) {
  return channel?.members ? channel.members.filter((m) => !m.user.bot).size : 0;
}

function isPublic(channel) {
  const view = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Connect;
  return Boolean(channel.permissionsFor(channel.guild.roles.everyone)?.has(view));
}

function eligible(channel, cfg) {
  if (!channel || ![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(channel.type)) return false;
  if (channel.id === channel.guild.afkChannelId || cfg.excludedChannelIds.includes(channel.id)) return false;
  return isPublic(channel);
}

function card(guild, channel, people) {
  return {
    content: t('campfire.card', guild, { channel: `<#${channel.id}>`, count: `\`${people}\`` }),
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setURL(`https://discord.com/channels/${guild.id}/${channel.id}`).setLabel(t('campfire.join', guild)).setEmoji('🔥').setStyle(ButtonStyle.Link)
      ),
    ],
    allowedMentions: { parse: [] },
  };
}

// Marca quando a call passou do mínimo de pessoas (o tempo conta a partir daí).
function onVoiceState(oldState, newState) {
  for (const state of [oldState, newState]) {
    const channel = state?.channel;
    if (!channel?.guild) continue;
    const cfg = campfire.getConfig(channel.guild.id);
    if (!cfg.enabled) continue;
    const entry = calls.get(channel.id) || { guildId: channel.guild.id, since: null, messageId: null, postChannelId: null, lastAnnouncedAt: 0 };
    const people = humans(channel);
    if (people >= cfg.minPeople && entry.since == null) entry.since = Date.now();
    if (people < cfg.minPeople && !entry.messageId) entry.since = null;
    calls.set(channel.id, entry);
  }
}

async function tick(client, now = Date.now()) {
  for (const [channelId, entry] of calls) {
    const guild = client.guilds.cache.get(entry.guildId);
    const channel = guild?.channels.cache.get(channelId);
    const cfg = guild ? campfire.getConfig(guild.id) : null;
    if (!guild || !channel || !cfg?.enabled) {
      calls.delete(channelId);
      continue;
    }
    const people = humans(channel);
    const action = campfire.decide({ people, since: entry.since, announcedMessageId: entry.messageId, lastAnnouncedAt: entry.lastAnnouncedAt }, cfg, now);
    if (action === 'announce' && eligible(channel, cfg) && cfg.channelId) {
      const post = guild.channels.cache.get(cfg.channelId);
      const sent = post?.isTextBased?.() ? await post.send(card(guild, channel, people)).catch(() => null) : null;
      if (sent) Object.assign(entry, { messageId: sent.id, postChannelId: post.id, lastAnnouncedAt: now });
    } else if (action === 'remove') {
      const post = guild.channels.cache.get(entry.postChannelId);
      await post?.messages?.delete(entry.messageId).catch(() => null);
      Object.assign(entry, { messageId: null, postChannelId: null, since: null });
    }
    if (!entry.messageId && entry.since == null && people === 0) calls.delete(channelId);
  }
}

module.exports = {
  id: 'voice-campfire',
  name: { 'pt-BR': 'Fogueira de Voz', en: 'Voice Campfire' },
  description: {
    'pt-BR': 'Quando uma call pública junta gente por um tempo, posta um convite discreto (sem marcar ninguém) que some quando a call esvazia. Desligada por padrão.',
    en: 'When a public call gathers people for a while, posts a quiet invite (no pings) that disappears when the call empties. Off by default.',
  },
  icon: '🔥',
  defaultEnabled: true,
  onVoiceState,
  tick,
  card,
  _calls: calls,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('voiceStateUpdate', onVoiceState);
    ctx.registerInterval(() => tick(ctx.client).catch((err) => console.error('[Campfire] Erro:', err)), CHECK_MS);
  },

  async onUnload() {
    calls.clear();
  },
};
