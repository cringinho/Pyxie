// Guardião do servidor: avisa a staff quando um cargo ganha permissão perigosa, quando um
// canal fica aberto a todo mundo dentro de uma categoria fechada, ou quando alguém dispara ações
// destrutivas em massa (Antinuke por limite). Inclui Modo de Emergência Global e Verificação por Botão.
const { AuditLogEvent, ChannelType, MessageFlags, PermissionFlagsBits, WebhookType } = require('discord.js');
const { findLookalikes } = require('../../services/lookalikeLinks');
const guard = require('../../services/serverGuard');
const safety = require('../../services/guildSafety');
const alerts = require('../../services/securityAlerts');
const emergencyMode = require('../../services/emergencyMode');
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
    const entry = logs?.entries.find((e) => (!targetId || e.targetId === targetId) && Date.now() - e.createdTimestamp < 30000);
    if (entry) return entry.executorId || entry.executor?.id || null;
  }
  return null;
}

function panelUrl(guildId) {
  return `${getPublicUrl()}/dashboard#/guild/${guildId}/security`;
}

// Remove cargos gerenciáveis que possuam permissões perigosas de um membro que disparou o Antinuke.
async function stripDangerousMemberRoles(guild, executorId, reason = 'Pyxie: proteção Antinuke') {
  const member = guild.members.cache.get(executorId) || (await guild.members.fetch(executorId).catch(() => null));
  if (!member) return false;
  const dangerousMask = guard.bitsOf(guard.DANGEROUS);
  const rolesToRemove = member.roles.cache.filter(
    (r) => r.id !== guild.id && !r.managed && r.editable && (r.permissions.bitfield & dangerousMask) !== 0n
  );
  if (!rolesToRemove.size) return false;
  const ok = await member.roles
    .remove(rolesToRemove, reason)
    .then(() => true)
    .catch(() => false);
  return ok;
}

// Antinuke por limite: monitora ações administrativas repetidas em janela curta.
async function onAdminAction(guild, actionType, auditTypes, targetId, client) {
  if (!guild?.id) return null;
  const config = safety.getConfig(guild.id);
  if (!config.guard.enabled || !config.antiNuke?.enabled) return null;

  const executorId = await findExecutor(guild, auditTypes, targetId);
  if (!executorId) return null;

  const member = guild.members.cache.get(executorId) || (await guild.members.fetch(executorId).catch(() => null));
  const roleIds = member?.roles?.cache ? [...member.roles.cache.keys()] : [];
  if (guard.isTrusted(config, executorId, roleIds, guild.ownerId, client?.user?.id)) return null;

  const res = guard.recordAdminAction(guild.id, executorId, actionType, {
    maxActions: config.antiNuke.maxActions,
    windowSeconds: config.antiNuke.windowSeconds,
  });

  if (!res.triggered || !guard.shouldAlert(`sg:nuke:${guild.id}:${executorId}`)) return res;

  let stripped = false;
  if (config.antiNuke.mode === 'auto' || config.guard.mode === 'auto') {
    stripped = await stripDangerousMemberRoles(guild, executorId, 'Pyxie Antinuke: limite de ações excedido');
  }

  const dest = await alerts.resolveDestination(guild, config);
  if (dest) {
    const payload = alerts.antiNukeAlert(guild, {
      guildId: guild.id,
      serverName: guild.name,
      executorId,
      actionType,
      count: res.count,
      windowSeconds: res.windowSeconds,
      stripped,
      viaDm: dest.viaDm,
      panelUrl: panelUrl(guild.id),
    });
    await dest.target.send(payload).catch(() => null);
  }

  safety.recordEvent(guild.id, {
    type: 'antinuke',
    executorId,
    actionType,
    count: res.count,
    action: stripped ? 'stripped' : 'alerted',
  });
  return { ...res, stripped };
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

  const dest = await alerts.resolveDestination(guild, config);
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

  const dest = await alerts.resolveDestination(guild, config);
  if (dest) {
    const payload = alerts.channelAlert(guild, { guildId: guild.id, serverName: guild.name, channelId: channel.id, categoryName: channel.parent.name, executorId, locked, viaDm: dest.viaDm, panelUrl: panelUrl(guild.id) });
    await dest.target.send(payload).catch(() => null);
  }
  safety.recordEvent(guild.id, { type: 'channel', channelId: channel.id, channelName: channel.name, executorId, action: locked ? 'locked' : 'alerted' });
  return { locked };
}

// Webhook mandando @everyone, link falso ou menção em massa: quem vaza um webhook costuma fazer isso.
async function onWebhookMessage(message, client) {
  if (!message?.guild || !message.webhookId) return null;
  if (message.applicationId && message.applicationId === message.webhookId) return null; // resposta de comando de bot
  if (message.flags?.has?.(MessageFlags.IsCrosspost)) return null; // anúncio de canal seguido
  const { guild } = message;
  const config = safety.getConfig(guild.id);
  if (!config.guard.enabled) return null;
  let reason = null;
  if (message.mentions?.everyone) reason = 'everyone';
  else if (findLookalikes(message.content).length) reason = 'lookalike';
  else if ((message.mentions?.users?.size || 0) >= 8) reason = 'massMention';
  if (!reason || !guard.shouldAlert(`sg:hook:${message.webhookId}`)) return null;

  const hooks = await message.channel?.fetchWebhooks?.().catch(() => null);
  const hook = hooks?.get?.(message.webhookId) || null;
  if (hook && (hook.owner?.id === client.user.id || hook.type === WebhookType.ChannelFollower)) return null;

  if (message.deletable) await message.delete().catch(() => null);
  let removed = false;
  if (config.guard.mode === 'auto' && hook?.delete) removed = await hook.delete('Pyxie: webhook mandou mensagem suspeita').then(() => true).catch(() => false);

  const dest = await alerts.resolveDestination(guild, config);
  if (dest) {
    const payload = alerts.webhookAlert(guild, { guildId: guild.id, serverName: guild.name, webhookId: message.webhookId, webhookName: hook?.name || message.author?.username, channelId: message.channel.id, reason, removed, viaDm: dest.viaDm, panelUrl: panelUrl(guild.id) });
    await dest.target.send(payload).catch(() => null);
  }
  safety.recordEvent(guild.id, { type: 'webhook', webhookId: message.webhookId, channelId: message.channel.id, reason, action: removed ? 'removed' : 'alerted' });
  return { reason, removed };
}

// Verificação acessível por botão (1 clique concede cargo verificado e remove cargo de quarentena).
async function handleVerificationButton(interaction, verifyParsed, client) {
  const guild = interaction.guild || client?.guilds?.cache?.get(verifyParsed.guildId);
  const reply = (content) => interaction.reply({ content, flags: EPHEMERAL, allowedMentions: alerts.NO_PING });
  if (!guild) return reply(t('verification.errorUnavailable', interaction));

  const config = safety.getConfig(guild.id);
  if (!config.verification?.enabled || !config.verification?.verifiedRoleId) {
    return reply(t('verification.errorDisabled', guild));
  }

  const verifiedRole = guild.roles.cache.get(config.verification.verifiedRoleId);
  if (!verifiedRole || !verifiedRole.editable || verifiedRole.managed) {
    return reply(t('verification.errorRoleHierarchy', guild));
  }

  const member = interaction.member?.roles?.add
    ? interaction.member
    : await guild.members.fetch(interaction.user.id).catch(() => null);
  if (!member) return reply(t('verification.errorUnavailable', guild));

  if (member.roles.cache?.has(verifiedRole.id)) {
    return reply(t('verification.alreadyVerified', guild, { role: `**${verifiedRole.name}**` }));
  }

  const added = await member.roles.add(verifiedRole.id, 'Pyxie: verificação por botão').then(() => true).catch(() => false);
  if (!added) return reply(t('verification.errorRoleHierarchy', guild));

  if (config.verification.unverifiedRoleId && member.roles.cache?.has(config.verification.unverifiedRoleId)) {
    const unverifiedRole = guild.roles.cache.get(config.verification.unverifiedRoleId);
    if (unverifiedRole?.editable && !unverifiedRole.managed) {
      await member.roles.remove(unverifiedRole.id, 'Pyxie: verificação concluída').catch(() => null);
    }
  }

  safety.recordEvent(guild.id, {
    type: 'verification',
    userId: interaction.user.id,
    roleId: verifiedRole.id,
    action: 'verified',
  });

  return reply(t('verification.success', guild, { server: guild.name, role: `**${verifiedRole.name}**` }));
}

// Botões dos alertas (no canal da staff ou na DM do dono) e botão de verificação.
async function handleInteraction(interaction, client) {
  if (!interaction.isButton?.()) return;

  const verifyParsed = guard.parseVerifyId(interaction.customId);
  if (verifyParsed) {
    return handleVerificationButton(interaction, verifyParsed, client);
  }

  const parsed = guard.parseId(interaction.customId);
  if (!parsed) return;
  const guild = client.guilds.cache.get(parsed.guildId);
  const reply = (key) => interaction.reply({ content: t(key, guild || interaction), flags: EPHEMERAL });
  if (!guild) return reply('serverGuard.failed');

  const member = await guild.members.fetch(interaction.user.id).catch(() => null);
  const isOwner = guild.ownerId === interaction.user.id;
  const isAdmin = Boolean(member?.permissions.has(PermissionFlagsBits.Administrator));
  const canLock = isOwner || isAdmin || Boolean(member?.permissions.has(PermissionFlagsBits.ManageChannels));
  const canHook = isOwner || isAdmin || Boolean(member?.permissions.has(PermissionFlagsBits.ManageWebhooks));
  const allowed = parsed.kind === 'lock' ? canLock : parsed.kind === 'hook' ? canHook : isOwner || isAdmin;
  if (!allowed) return reply('serverGuard.noPermission');

  const done = (key, extra = {}) =>
    interaction.update({ content: t(key, guild, { user: `\`<@${interaction.user.id}>\``, ...extra }), components: [], allowedMentions: alerts.NO_PING });

  if (parsed.kind === 'keep') return done('serverGuard.doneKept');

  if (parsed.kind === 'emgoff') {
    const res = await emergencyMode.deactivateEmergency(guild, { actorId: interaction.user.id });
    if (!res.ok) return reply('serverGuard.failed');
    return done('serverGuard.doneEmergencyOff', { count: `\`${res.restoredCount}\`` });
  }

  if (parsed.kind === 'strip') {
    const stripped = await stripDangerousMemberRoles(guild, parsed.targetId, `Pyxie Antinuke: cargos perigosos removidos por ${interaction.user.tag}`);
    if (!stripped) return reply('serverGuard.failed');
    safety.recordEvent(guild.id, { type: 'antinuke', executorId: parsed.targetId, actorId: interaction.user.id, action: 'stripped' });
    return done('serverGuard.doneStripped');
  }

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

  if (parsed.kind === 'hook') {
    const ok = await guild
      .fetchWebhooks()
      .then((hooks) => {
        const hook = hooks.get(parsed.targetId);
        return hook ? hook.delete(`Pyxie: apagado por ${interaction.user.tag}`).then(() => true) : false;
      })
      .catch(() => false);
    if (!ok) return reply('serverGuard.failed');
    safety.recordEvent(guild.id, { type: 'webhook', webhookId: parsed.targetId, executorId: interaction.user.id, action: 'removed' });
    return done('serverGuard.doneWebhook');
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
    'pt-BR': 'Protege contra cargos com permissão perigosa, canais abertos por engano, ações destrutivas em massa (Antinuke) e oferece Modo de Emergência e Verificação por Botão.',
    en: 'Protects against dangerous role permissions, accidentally opened channels, mass destructive actions (Antinuke), and provides Global Emergency Mode and Button Verification.',
  },
  icon: '🔐',
  defaultEnabled: true,
  onRoleChange,
  onChannelChange,
  onWebhookMessage,
  onAdminAction,
  stripDangerousMemberRoles,
  handleInteraction,
  handleVerificationButton,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const run = (label, fn) => (...args) => fn(...args, ctx.client).catch((err) => console.error(`[ServerGuard] Erro em ${label}:`, err));
    ctx.registerListener('roleCreate', run('roleCreate', async (role, client) => {
      await onRoleChange(null, role, client);
      await onAdminAction(role.guild, 'roleCreate', [AuditLogEvent.RoleCreate], role.id, client);
    }));
    ctx.registerListener('roleUpdate', run('roleUpdate', onRoleChange));
    ctx.registerListener('roleDelete', run('roleDelete', (role, client) => onAdminAction(role.guild, 'roleDelete', [AuditLogEvent.RoleDelete], role.id, client)));
    ctx.registerListener('channelCreate', run('channelCreate', async (channel, client) => {
      await onChannelChange(null, channel, client);
      await onAdminAction(channel.guild, 'channelCreate', [AuditLogEvent.ChannelCreate], channel.id, client);
    }));
    ctx.registerListener('channelUpdate', run('channelUpdate', onChannelChange));
    ctx.registerListener('channelDelete', run('channelDelete', (channel, client) => onAdminAction(channel.guild, 'channelDelete', [AuditLogEvent.ChannelDelete], channel.id, client)));
    ctx.registerListener('guildBanAdd', run('guildBanAdd', (ban, client) => onAdminAction(ban.guild, 'ban', [AuditLogEvent.MemberBanAdd], ban.user?.id, client)));
    ctx.registerListener('guildMemberRemove', run('guildMemberRemove', (member, client) => onAdminAction(member.guild, 'kick', [AuditLogEvent.MemberKick], member.id, client)));
    ctx.registerListener('emojiDelete', run('emojiDelete', (emoji, client) => onAdminAction(emoji.guild, 'emojiDelete', [AuditLogEvent.EmojiDelete], emoji.id, client)));
    ctx.registerListener('messageCreate', run('messageCreate', onWebhookMessage));
    ctx.registerListener('interactionCreate', run('interactionCreate', handleInteraction));
  },

  async onUnload() {
    guard.resetMemory();
  },
};
