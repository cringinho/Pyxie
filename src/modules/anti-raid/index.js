// Anti-raid: percebe entrada em massa e liga a pausa nativa do Discord de convites e DMs entre
// membros, com prazo. Quando o prazo acaba, o próprio Discord desfaz (mesmo se a Pyxie cair).
// Vale em todos os servidores; cada um ajusta no painel (/dashboard → Segurança).
const { PermissionFlagsBits } = require('discord.js');
const raid = require('../../services/raidWatch');
const safety = require('../../services/guildSafety');
const alerts = require('../../services/securityAlerts');
const { getPublicUrl } = require('../../services/discordOAuth');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;

// Pausa (ou encerra, com until = null) convites e DMs. Precisa de Gerenciar Servidor.
function setPause(client, guildId, until) {
  const iso = until ? new Date(until).toISOString() : null;
  return client.rest.put(`/guilds/${guildId}/incident-actions`, { body: { invites_disabled_until: iso, dms_disabled_until: iso } });
}

async function onMemberAdd(member, client, now = Date.now()) {
  const { guild } = member;
  const config = safety.getConfig(guild.id).antiRaid;
  if (!config.enabled) return null;
  const result = raid.trackJoin(guild.id, { now, accountCreatedAt: member.user.createdTimestamp, joins: config.joins, seconds: config.seconds, memberCount: guild.memberCount });
  if (!result.triggered) return null;

  const until = now + config.pauseMinutes * 60 * 1000;
  raid.markActive(guild.id, until);
  const paused = await setPause(client, guild.id, until).then(() => true).catch(() => false);

  const dest = await alerts.resolveDestination(guild, safety.getConfig(guild.id));
  if (dest) {
    const payload = alerts.raidAlert(guild, {
      guildId: guild.id,
      serverName: guild.name,
      total: result.total,
      young: result.young,
      seconds: config.seconds,
      paused,
      until,
      viaDm: dest.viaDm,
      panelUrl: `${getPublicUrl()}/dashboard#/guild/${guild.id}/security`,
    });
    await dest.target.send(payload).catch(() => null);
  }
  safety.recordEvent(guild.id, { type: 'raid', joins: result.total, young: result.young, action: paused ? 'paused' : 'failed', until });
  return { ...result, paused, until };
}

// Botão "Encerrar pausa agora".
async function handleInteraction(interaction, client) {
  if (!interaction.isButton?.() || !String(interaction.customId).startsWith('ar:end:')) return;
  const guildId = interaction.customId.split(':')[2];
  const guild = client.guilds.cache.get(guildId);
  const reply = (key) => interaction.reply({ content: t(key, guild || interaction), flags: EPHEMERAL });
  if (!guild) return reply('serverGuard.failed');
  const member = await guild.members.fetch(interaction.user.id).catch(() => null);
  const allowed = guild.ownerId === interaction.user.id || Boolean(member?.permissions.has(PermissionFlagsBits.ManageGuild));
  if (!allowed) return reply('antiRaid.noPermission');
  const ok = await setPause(client, guild.id, null).then(() => true).catch(() => false);
  if (!ok) return reply('antiRaid.endFailed');
  raid.clearActive(guild.id);
  return interaction.update({ content: t('antiRaid.ended', guild, { user: `\`<@${interaction.user.id}>\`` }), components: [], allowedMentions: alerts.NO_PING });
}

module.exports = {
  id: 'anti-raid',
  name: { 'pt-BR': 'Anti-raid', en: 'Anti-raid' },
  description: {
    'pt-BR': 'Percebe quando muitas contas entram de uma vez e liga a pausa do Discord para convites e DMs entre membros, com prazo. A pausa acaba sozinha.',
    en: 'Notices when many accounts join at once and turns on Discord’s pause for invites and DMs between members, with a time limit. The pause ends on its own.',
  },
  icon: '🚨',
  defaultEnabled: true,
  onMemberAdd,
  handleInteraction,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('guildMemberAdd', (member) => {
      onMemberAdd(member, ctx.client).catch((err) => console.error('[AntiRaid] Erro ao contar entrada:', err));
    });
    ctx.registerListener('interactionCreate', (interaction) => {
      handleInteraction(interaction, ctx.client).catch((err) => console.error('[AntiRaid] Erro no botão:', err));
    });
    ctx.registerInterval(() => raid.sweep(), 5 * 60 * 1000);
  },

  async onUnload() {
    raid.resetMemory();
  },
};
