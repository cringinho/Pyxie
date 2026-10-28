// Guardião do servidor: avisa a staff quando um cargo ganha permissão perigosa ou quando um
// canal fica aberto a todo mundo dentro de uma categoria fechada. Por padrão só alerta, com
// botão de desfazer; no modo automático, a Pyxie desfaz sozinha. Vale em todos os servidores.
const { AuditLogEvent, ChannelType, PermissionFlagsBits } = require('discord.js');
const guard = require('../../services/serverGuard');
const safety = require('../../services/guildSafety');
const alerts = require('../../services/securityAlerts');
const { getPublicUrl } = require('../../services/discordOAuth');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;
const AUDIT_DELAY_MS = 1500; // o registro de auditoria chega um pouco depois do evento

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Quem fez a mudança, pelo registro de auditoria (precisa de "Ver registro de auditoria").
async function findExecutor(guild, types, targetId) {
  if (!guild.members.me?.permissions.has(PermissionFlagsBits.ViewAuditLog)) return null;
  await wait(AUDIT_DELAY_MS);
  for (const type of types) {
    const logs = await guild.fetchAuditLogs({ type, limit: 5 }).catch(() => null);
    const entry = logs?.entries.find((e) => e.targetId === targetId && Date.now() - e.createdTimestamp < 30000);
    if (entry) return entry.executorId || entry.executor?.id || null;
  }
  return null;
}

// Canal de alertas da staff; sem ele, DM para o dono do servidor.
async function resolveDestination(guild, config) {
  if (config.staffLogChannelId) {
    const channel = guild.channels.cache.get(config.staffLogChannelId) || (await guild.channels.fetch(config.staffLogChannelId).catch(() => null));
    if (channel?.isTextBased?.()) return { target: channel, viaDm: false };
  }
  const owner = await guild.fetchOwner().catch(() => null);
  return owner ? { target: owner, viaDm: true } : null;
}

function panelUrl(guildId) {
  return `${getPublicUrl()}/dashboard#/guild/${guildId}/security`;
}

async function onRoleChange(oldRole, role, client) {
  const { guild } = role;
  const config = safety.getConfig(guild.id);
  if (!config.guard.enabled) return null;
  const names = guard.gainedDangerous(oldRole ? oldRole.permissions.bitfield : 0n, role.permissions.bitfield);
  if (!names.length || !guard.shouldAlert(`sg:role:${role.id}`)) return null;

  const executorId = await findExecutor(guild, [oldRole ? AuditLogEvent.RoleUpdate : AuditLogEvent.RoleCreate], role.id);
  if (executorId && (executorId === guild.ownerId || executorId === client.user.id)) return null;

  let reverted = false;
  if (config.guard.mode === 'auto' && executorId && !role.managed && role.editable) {
    const next = role.permissions.bitfield & ~guard.bitsOf(names);
    reverted = await role.setPermissions(next, 'Pyxie: permissão perigosa dada sem o dono').then(() => true).catch(() => false);
  }

  const dest = await resolveDestination(guild, config);
  if (dest) {
    const payload = alerts.roleAlert(guild, { guildId: guild.id, serverName: guild.name, roleId: role.id, roleName: role.name, names, executorId, reverted, viaDm: dest.viaDm, panelUrl: panelUrl(guild.id) });
    await dest.target.send(payload).catch(() => null);
  }
  safety.recordEvent(guild.id, { type: 'role', roleId: role.id, roleName: role.name, perms: names, executorId, action: reverted ? 'reverted' : 'alerted' });
  return { names, reverted };
}

async function onChannelChange(oldChannel, channel, client) {
  const guild = channel.guild;
  if (!guild || channel.type === ChannelType.GuildCategory || channel.isThread?.() || !channel.parent) return null;
  const config = safety.getConfig(guild.id);
  if (!config.guard.enabled) return null;
  const everyone = guild.roles.everyone;
  const view = PermissionFlagsBits.ViewChannel;
  const leak = guard.isChannelLeak({
    categoryPublic: channel.parent.permissionsFor(everyone)?.has(view),
    nowPublic: channel.permissionsFor(everyone)?.has(view),
    wasPublic: oldChannel ? oldChannel.permissionsFor(everyone)?.has(view) : undefined,
    // Canal novo ou trazido de outra categoria conta como novo.
    isNew: !oldChannel || oldChannel.parentId !== channel.parentId,
  });
  if (!leak || !guard.shouldAlert(`sg:channel:${channel.id}`)) return null;

  const types = oldChannel
    ? [AuditLogEvent.ChannelOverwriteUpdate, AuditLogEvent.ChannelOverwriteCreate, AuditLogEvent.ChannelOverwriteDelete, AuditLogEvent.ChannelUpdate]
    : [AuditLogEvent.ChannelCreate];
  const executorId = await findExecutor(guild, types, channel.id);
  if (executorId && (executorId === guild.ownerId || executorId === client.user.id)) return null;

  let locked = false;
  if (config.guard.mode === 'auto' && executorId && channel.manageable) {
    locked = await channel.permissionOverwrites
      .edit(everyone, { ViewChannel: false }, { reason: 'Pyxie: canal abriu dentro de categoria fechada' })
      .then(() => true)
      .catch(() => false);
  }

  const dest = await resolveDestination(guild, config);
  if (dest) {
    const payload = alerts.channelAlert(guild, { guildId: guild.id, serverName: guild.name, channelId: channel.id, categoryName: channel.parent.name, executorId, locked, viaDm: dest.viaDm, panelUrl: panelUrl(guild.id) });
    await dest.target.send(payload).catch(() => null);
  }
  safety.recordEvent(guild.id, { type: 'channel', channelId: channel.id, channelName: channel.name, executorId, action: locked ? 'locked' : 'alerted' });
  return { locked };
}

// Botões dos alertas (no canal da staff ou na DM do dono).
async function handleInteraction(interaction, client) {
  if (!interaction.isButton?.()) return;
  const parsed = guard.parseId(interaction.customId);
  if (!parsed) return;
  const guild = client.guilds.cache.get(parsed.guildId);
  const reply = (key) => interaction.reply({ content: t(key, guild || interaction), flags: EPHEMERAL });
  if (!guild) return reply('serverGuard.failed');

  const member = await guild.members.fetch(interaction.user.id).catch(() => null);
  const isOwner = guild.ownerId === interaction.user.id;
  const isAdmin = Boolean(member?.permissions.has(PermissionFlagsBits.Administrator));
  const canLock = isOwner || isAdmin || Boolean(member?.permissions.has(PermissionFlagsBits.ManageChannels));
  if (parsed.kind === 'lock' ? !canLock : !(isOwner || isAdmin)) return reply('serverGuard.noPermission');

  const done = (key) =>
    interaction.update({ content: t(key, guild, { user: `\`<@${interaction.user.id}>\`` }), components: [], allowedMentions: alerts.NO_PING });

  if (parsed.kind === 'keep') return done('serverGuard.doneKept');

  if (parsed.kind === 'role') {
    const role = guild.roles.cache.get(parsed.targetId);
    if (!role?.editable) return reply('serverGuard.failed');
    const ok = await role
      .setPermissions(role.permissions.bitfield & ~guard.bitsOf(parsed.names), `Pyxie: desfeito por ${interaction.user.tag}`)
      .then(() => true)
      .catch(() => false);
    if (!ok) return reply('serverGuard.failed');
    safety.recordEvent(guild.id, { type: 'role', roleId: role.id, roleName: role.name, perms: parsed.names, executorId: interaction.user.id, action: 'reverted' });
    return done('serverGuard.doneReverted');
  }

  const channel = guild.channels.cache.get(parsed.targetId);
  if (!channel?.manageable) return reply('serverGuard.failed');
  const ok = await channel.permissionOverwrites
    .edit(guild.roles.everyone, { ViewChannel: false }, { reason: `Pyxie: trancado por ${interaction.user.tag}` })
    .then(() => true)
    .catch(() => false);
  if (!ok) return reply('serverGuard.failed');
  safety.recordEvent(guild.id, { type: 'channel', channelId: channel.id, channelName: channel.name, executorId: interaction.user.id, action: 'locked' });
  return done('serverGuard.doneLocked');
}

module.exports = {
  id: 'server-guard',
  name: { 'pt-BR': 'Guardião do Servidor', en: 'Server Guard' },
  description: {
    'pt-BR': 'Avisa a staff quando um cargo ganha Administrador ou outra permissão perigosa, ou quando um canal fica aberto a todo mundo dentro de uma categoria fechada. Um botão desfaz.',
    en: 'Warns the staff when a role gains Administrator or another dangerous permission, or when a channel opens to everyone inside a closed category. One button undoes it.',
  },
  icon: '🔐',
  defaultEnabled: true,
  onRoleChange,
  onChannelChange,
  handleInteraction,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const run = (label, fn) => (...args) => fn(...args, ctx.client).catch((err) => console.error(`[ServerGuard] Erro em ${label}:`, err));
    ctx.registerListener('roleCreate', run('roleCreate', (role, client) => onRoleChange(null, role, client)));
    ctx.registerListener('roleUpdate', run('roleUpdate', onRoleChange));
    ctx.registerListener('channelCreate', run('channelCreate', (channel, client) => onChannelChange(null, channel, client)));
    ctx.registerListener('channelUpdate', run('channelUpdate', onChannelChange));
    ctx.registerListener('interactionCreate', run('interactionCreate', handleInteraction));
  },

  async onUnload() {
    guard.resetMemory();
  },
};
