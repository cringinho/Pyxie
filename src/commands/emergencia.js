// Comando /py-emergency (py!emergencia, py!lockdown) — Modo de Emergência Global para qualquer servidor.
// Salva o estado anterior de todos os canais antes de trancar @everyone e restaura com segurança.
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const emergencyMode = require('../services/emergencyMode');
const alerts = require('../services/securityAlerts');
const { t } = require('../utils/i18n');

const name = 'py-emergency';
const aliases = ['emergency', 'emergencia', 'py-emergencia', 'lockdown', 'py-lockdown'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function isAdminMember(member, guild, userId) {
  if (!guild) return false;
  if (guild.ownerId === userId) return true;
  return Boolean(
    member?.permissions?.has?.(PermissionFlagsBits.Administrator) ||
      member?.permissions?.has?.(PermissionFlagsBits.ManageGuild)
  );
}

function buildStatusEmbed(guild, status, source) {
  const embed = new EmbedBuilder()
    .setColor(status.active ? 0xef4444 : 0x10b981)
    .setTitle(t(status.active ? 'serverGuard.emergencyTitleOn' : 'serverGuard.emergencyStatusIdleTitle', source))
    .setDescription(
      status.active
        ? [
            t('serverGuard.emergencyActivatedBody', source, {
              who: status.activatedBy ? `\`<@${status.activatedBy}>\`` : t('serverGuard.whoUnknown', source),
              count: `\`${status.lockedCount}\``,
            }),
            status.reason ? `> ${t('serverGuard.emergencyReason', source, { reason: status.reason })}` : `> ${t('serverGuard.emergencyHint', source)}`,
          ].join('\n\n')
        : t('serverGuard.emergencyStatusIdleBody', source)
    )
    .setFooter({ text: guild.name })
    .setTimestamp();
  return { embeds: [embed], allowedMentions: NO_PING };
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Activate, deactivate, or check Global Emergency Mode (locks channels & pauses invites safely).')
    .setDescriptionLocalizations({
      'pt-BR': 'Ativa, desativa ou consulta o Modo de Emergência (tranca canais e pausa convites com segurança).',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) =>
      opt
        .setName('mode')
        .setNameLocalizations({ 'pt-BR': 'modo' })
        .setDescription('Choose whether to turn emergency mode on, off, or check status')
        .setDescriptionLocalizations({ 'pt-BR': 'Escolha se deseja ligar, desligar ou ver o estado do modo de emergência' })
        .setRequired(false)
        .addChoices(
          { name: 'Turn ON (Lockdown)', name_localizations: { 'pt-BR': 'Ligar (Trancar canais)' }, value: 'on' },
          { name: 'Turn OFF (Restore channels)', name_localizations: { 'pt-BR': 'Desligar (Restaurar canais)' }, value: 'off' },
          { name: 'Check Status', name_localizations: { 'pt-BR': 'Ver Estado' }, value: 'status' }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName('reason')
        .setNameLocalizations({ 'pt-BR': 'motivo' })
        .setDescription('Optional reason for activating emergency mode')
        .setDescriptionLocalizations({ 'pt-BR': 'Motivo opcional para ativar o modo de emergência' })
        .setRequired(false)
    ),

  async executeSlash({ interaction }) {
    const respond = (payload) =>
      interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply(payload);

    if (!interaction.guild) {
      return respond({ content: t('partnerships.guild_only', interaction), allowedMentions: NO_PING });
    }
    if (!isAdminMember(interaction.member, interaction.guild, interaction.user.id)) {
      return respond({ content: t('serverGuard.noPermission', interaction), allowedMentions: NO_PING });
    }

    const mode = interaction.options?.getString?.('mode') || 'status';
    const reason = interaction.options?.getString?.('reason') || '';

    if (mode === 'on') {
      const res = await emergencyMode.activateEmergency(interaction.guild, {
        actorId: interaction.user.id,
        reason,
      });
      return respond(
        alerts.emergencyAlert(interaction, {
          guildId: interaction.guild.id,
          serverName: interaction.guild.name,
          active: true,
          actorId: interaction.user.id,
          reason: res.reason,
          lockedCount: res.lockedCount,
        })
      );
    }

    if (mode === 'off') {
      const res = await emergencyMode.deactivateEmergency(interaction.guild, {
        actorId: interaction.user.id,
      });
      return respond(
        alerts.emergencyAlert(interaction, {
          guildId: interaction.guild.id,
          serverName: interaction.guild.name,
          active: false,
          actorId: interaction.user.id,
          restoredCount: res.restoredCount,
        })
      );
    }

    const status = emergencyMode.getEmergencyStatus(interaction.guild.id);
    return respond(buildStatusEmbed(interaction.guild, status, interaction));
  },

  async executePrefix({ message, args = [] }) {
    if (!message.guild) {
      return message.reply({ content: t('partnerships.guild_only', message), allowedMentions: NO_PING });
    }
    if (!isAdminMember(message.member, message.guild, message.author.id)) {
      return message.reply({ content: t('serverGuard.noPermission', message), allowedMentions: NO_PING });
    }

    const sub = String(args[0] || '').toLowerCase();
    if (['on', 'ligar', 'ativar', 'lock'].includes(sub)) {
      const reason = args.slice(1).join(' ');
      const res = await emergencyMode.activateEmergency(message.guild, {
        actorId: message.author.id,
        reason,
      });
      return message.reply(
        alerts.emergencyAlert(message, {
          guildId: message.guild.id,
          serverName: message.guild.name,
          active: true,
          actorId: message.author.id,
          reason: res.reason,
          lockedCount: res.lockedCount,
        })
      );
    }

    if (['off', 'desligar', 'desativar', 'unlock'].includes(sub)) {
      const res = await emergencyMode.deactivateEmergency(message.guild, {
        actorId: message.author.id,
      });
      return message.reply(
        alerts.emergencyAlert(message, {
          guildId: message.guild.id,
          serverName: message.guild.name,
          active: false,
          actorId: message.author.id,
          restoredCount: res.restoredCount,
        })
      );
    }

    const status = emergencyMode.getEmergencyStatus(message.guild.id);
    return message.reply(buildStatusEmbed(message.guild, status, message));
  },
};

