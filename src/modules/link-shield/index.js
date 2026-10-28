// Escudo de links: apaga (ou avisa sobre) links que imitam sites conhecidos, como discord.com
// escrito com letra de outro alfabeto. Só olha o endereço, sem abrir o site. Vale em todos os
// servidores; cada um liga, desliga e libera domínios no painel (/dashboard → Segurança).
const { findLookalikes } = require('../../services/lookalikeLinks');
const safety = require('../../services/guildSafety');
const alerts = require('../../services/securityAlerts');
const { shouldAlert } = require('../../services/serverGuard');

const NOTICE_TTL_MS = 2 * 60 * 1000;

async function onMessage(message, client) {
  if (!message?.guild || !message.content || message.author?.id === client?.user?.id) return null;
  const config = safety.getConfig(message.guild.id).linkShield;
  if (!config.enabled) return null;
  const hits = findLookalikes(message.content, { allowDomains: config.allowDomains });
  if (!hits.length) return null;

  const hit = hits[0];
  const { guild, channel, author } = message;
  let deleted = false;
  if (config.action === 'delete' && message.deletable) {
    deleted = await message.delete().then(() => true).catch(() => false);
  }

  // Um aviso por canal a cada minuto: numa onda de golpe, apaga tudo mas não enche o chat.
  if (shouldAlert(`ls:${guild.id}:${channel.id}`)) {
    const notice = alerts.linkChannelNotice(guild, { userId: author.id, imitates: hit.imitates, deleted });
    const sent = deleted ? await channel.send(notice).catch(() => null) : await message.reply(notice).catch(() => null);
    if (sent && deleted) setTimeout(() => sent.delete().catch(() => null), NOTICE_TTL_MS).unref?.();
  }
  if (deleted && !author.bot) {
    await author.send(alerts.linkAuthorDm(guild, { serverName: guild.name, imitates: hit.imitates, host: hit.host })).catch(() => null);
  }

  const staffId = safety.getConfig(guild.id).staffLogChannelId;
  if (staffId && shouldAlert(`ls:${guild.id}:${hit.host}`)) {
    const staff = guild.channels.cache.get(staffId) || (await guild.channels.fetch(staffId).catch(() => null));
    if (staff?.isTextBased?.()) await staff.send(alerts.linkStaffLog(guild, { serverName: guild.name, userId: author.id, channelId: channel.id, hit, deleted })).catch(() => null);
  }

  safety.recordEvent(guild.id, { type: 'link', host: hit.host, unicodeHost: hit.unicodeHost, imitates: hit.imitates, reason: hit.reason, action: deleted ? 'deleted' : 'warned', channelId: channel.id, userId: author.id });
  return { hit, deleted };
}

module.exports = {
  id: 'link-shield',
  name: { 'pt-BR': 'Escudo de Links', en: 'Link Shield' },
  description: {
    'pt-BR': 'Apaga links que imitam sites conhecidos (discord.com com letra de outro alfabeto, disc0rd, discord-nitro.gift) e avisa a pessoa por DM, porque a conta dela pode ter sido invadida.',
    en: 'Deletes links that imitate well-known sites (discord.com with a letter from another alphabet, disc0rd, discord-nitro.gift) and warns the sender by DM, since their account may have been taken over.',
  },
  icon: '🛡️',
  defaultEnabled: true,
  onMessage,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('messageCreate', (message) => {
      onMessage(message, ctx.client).catch((err) => console.error('[LinkShield] Erro ao conferir link:', err));
    });
    // Golpista também edita a mensagem depois de ela passar pelo filtro.
    ctx.registerListener('messageUpdate', (oldMessage, newMessage) => {
      if (newMessage.partial || oldMessage?.content === newMessage.content) return;
      onMessage(newMessage, ctx.client).catch((err) => console.error('[LinkShield] Erro ao conferir edição:', err));
    });
  },
};
