// Escudo de arquivos: apaga (ou avisa sobre) scripts que roubam token/senha e, se o servidor
// quiser, executáveis enviados no chat. Lê só anexos pequenos de texto (até 256 KB).
// Vale em todos os servidores; ajustes em /dashboard → Segurança.
const { inspectAttachments } = require('../../services/fileThreats');
const safety = require('../../services/guildSafety');
const alerts = require('../../services/securityAlerts');
const { shouldAlert } = require('../../services/serverGuard');

const NOTICE_TTL_MS = 2 * 60 * 1000;

async function onMessage(message, client, { fetchImpl } = {}) {
  if (!message?.guild || !message.attachments?.size || message.author?.id === client?.user?.id) return null;
  const config = safety.getConfig(message.guild.id).fileShield;
  if (!config.enabled) return null;
  const hit = await inspectAttachments(message.attachments.values(), { blockExecutables: config.blockExecutables, fetchImpl });
  if (!hit) return null;

  const { guild, channel, author } = message;
  let deleted = false;
  if (config.action === 'delete' && message.deletable) deleted = await message.delete().then(() => true).catch(() => false);
  if (shouldAlert(`fs:${guild.id}:${channel.id}`)) {
    const notice = alerts.fileChannelNotice(guild, { userId: author.id, reason: hit.reason, deleted });
    const sent = deleted ? await channel.send(notice).catch(() => null) : await message.reply(notice).catch(() => null);
    if (sent && deleted) setTimeout(() => sent.delete().catch(() => null), NOTICE_TTL_MS).unref?.();
  }
  if (deleted && !author.bot && hit.reason === 'grabber') await author.send(alerts.fileAuthorDm(guild, { serverName: guild.name })).catch(() => null);
  const staffId = safety.getConfig(guild.id).staffLogChannelId;
  if (staffId) {
    const staff = guild.channels.cache.get(staffId) || (await guild.channels.fetch(staffId).catch(() => null));
    if (staff?.isTextBased?.()) await staff.send(alerts.fileStaffLog(guild, { serverName: guild.name, userId: author.id, channelId: channel.id, fileName: hit.name, reason: hit.reason, deleted })).catch(() => null);
  }
  safety.recordEvent(guild.id, { type: 'file', fileName: String(hit.name).slice(0, 80), reason: hit.reason, action: deleted ? 'deleted' : 'warned', channelId: channel.id, userId: author.id });
  return { hit, deleted };
}

module.exports = {
  id: 'file-shield',
  name: { 'pt-BR': 'Escudo de Arquivos', en: 'File Shield' },
  description: {
    'pt-BR': 'Apaga scripts que roubam token ou senha (lê só arquivos pequenos de texto) e, se o servidor quiser, executáveis enviados no chat.',
    en: 'Deletes scripts that steal tokens or passwords (reads only small text files) and, if the server wants, executables posted in chat.',
  },
  icon: '🧪',
  defaultEnabled: true,
  onMessage,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('messageCreate', (message) => {
      onMessage(message, ctx.client).catch((err) => console.error('[FileShield] Erro ao conferir anexo:', err));
    });
  },
};
