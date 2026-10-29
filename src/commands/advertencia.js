// Comando /py-warn (py!warn, py!advertir) — Advertências por pontos + casos numerados (#123).
// Tom claro, respeitoso e sem ironia (AGENTS.md §12). Soma pontos ativos (com validade) e aplica
// a ação configurada no limite (silenciamento, expulsão ou banimento) quando a Pyxie tem permissão.
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const modCases = require('../services/modCasesService');
const safety = require('../services/guildSafety');
const { getPublicUrl } = require('../services/discordOAuth');
const { t } = require('../utils/i18n');

const name = 'py-warn';
const aliases = ['warn', 'advertir', 'py-advertir', 'advertencia', 'py-advertencia', 'aviso', 'warnings', 'advertencias'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function canModerate(member, guild, userId) {
  if (!guild) return false;
  if (guild.ownerId === userId) return true;
  return Boolean(
    member?.permissions?.has?.(PermissionFlagsBits.ModerateMembers) ||
      member?.permissions?.has?.(PermissionFlagsBits.KickMembers) ||
      member?.permissions?.has?.(PermissionFlagsBits.BanMembers) ||
      member?.permissions?.has?.(PermissionFlagsBits.ManageGuild) ||
      member?.permissions?.has?.(PermissionFlagsBits.Administrator)
  );
}

async function applyThresholdAction(guild, targetId, thresholdAction, caseNumber) {
  if (!thresholdAction || !guild) return { applied: false, action: null };
  const member = guild.members?.cache?.get(targetId) || (await guild.members?.fetch?.(targetId).catch(() => null));
  const reason = `Pyxie Case #${caseNumber}: limite de ${thresholdAction.threshold} pontos atingido`;

  if (thresholdAction.action === 'timeout') {
    if (!member || !member.moderatable) return { applied: false, action: 'timeout' };
    const ms = Math.max(1, Number(thresholdAction.durationMinutes) || 60) * 60 * 1000;
    const ok = await member.timeout(ms, reason).then(() => true).catch(() => false);
    return { applied: ok, action: 'timeout', durationMinutes: thresholdAction.durationMinutes };
  }

  if (thresholdAction.action === 'kick') {
    if (!member || !member.kickable) return { applied: false, action: 'kick' };
    const ok = await member.kick(reason).then(() => true).catch(() => false);
    return { applied: ok, action: 'kick' };
  }

  if (thresholdAction.action === 'ban') {
    if (member && !member.bannable) return { applied: false, action: 'ban' };
    const ok = await guild.members?.ban?.(targetId, { reason }).then(() => true).catch(() => false);
    return { applied: ok, action: 'ban' };
  }

  return { applied: false, action: null };
}

function buildUserDmEmbed(guild, { caseRecord, warningRecord, activePoints, thresholdResult }) {
  const sec = safety.getConfig(guild.id);
  const appealUrl = `${getPublicUrl()}/appeal?guild=${guild.id}`;
  const lines = [
    t('modCases.dmIntro', guild, { server: `**${guild.name}**`, caseNumber: `\`#${caseRecord.caseNumber}\`` }),
    t('modCases.dmDetails', guild, {
      reason: caseRecord.reason,
      points: `\`+${warningRecord.points}\``,
      total: `\`${activePoints}\``,
      expires: `<t:${Math.floor(warningRecord.expiresAt / 1000)}:D>`,
    }),
  ];
  if (thresholdResult?.applied) {
    lines.push(`> ${t(`modCases.dmThreshold.${thresholdResult.action}`, guild)}`);
  }
  if (sec.appeals?.enabled) {
    lines.push(`-# ${t('modCases.dmAppealHint', guild, { link: `[${t('modCases.appealLinkLabel', guild)}](${appealUrl})` })}`);
  }
  return new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle(t('modCases.dmTitle', guild, { caseNumber: `#${caseRecord.caseNumber}` }))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: guild.name })
    .setTimestamp();
}

function buildStaffConfirmEmbed(source, { caseRecord, warningRecord, activePoints, thresholdResult }) {
  const lines = [
    t('modCases.issuedSummary', source, {
      caseNumber: `\`#${caseRecord.caseNumber}\``,
      target: `\`<@${caseRecord.targetId}>\``,
      points: `\`+${warningRecord.points}\``,
      total: `\`${activePoints}\``,
    }),
    t('modCases.issuedReason', source, { reason: caseRecord.reason }),
    `-# ${t('modCases.issuedExpires', source, { date: `<t:${Math.floor(warningRecord.expiresAt / 1000)}:D>` })}`,
  ];
  if (thresholdResult?.action) {
    const key = thresholdResult.applied ? `modCases.thresholdApplied.${thresholdResult.action}` : 'modCases.thresholdFailed';
    lines.push(`> ${t(key, source, { points: `\`${activePoints}\`` })}`);
  }
  return new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle(t('modCases.issuedTitle', source, { caseNumber: `#${caseRecord.caseNumber}` }))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: t('modCases.footer', source) })
    .setTimestamp();
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  canModerate,

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Issue a point-based warning with an official numbered moderation case.')
    .setDescriptionLocalizations({
      'pt-BR': 'Registra uma advertência por pontos com número de caso oficial de moderação.',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt
        .setName('user')
        .setNameLocalizations({ 'pt-BR': 'pessoa' })
        .setDescription('Member to warn')
        .setDescriptionLocalizations({ 'pt-BR': 'Membro que receberá a advertência' })
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('reason')
        .setNameLocalizations({ 'pt-BR': 'motivo' })
        .setDescription('Clear and respectful explanation of the rule broken')
        .setDescriptionLocalizations({ 'pt-BR': 'Explicação clara e respeitosa da regra descumprida' })
        .setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('points')
        .setNameLocalizations({ 'pt-BR': 'pontos' })
        .setDescription('Warning points (1 to 10)')
        .setDescriptionLocalizations({ 'pt-BR': 'Pontos desta advertência (1 a 10)' })
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('days')
        .setNameLocalizations({ 'pt-BR': 'validade_dias' })
        .setDescription('Days until these points expire (1 to 365)')
        .setDescriptionLocalizations({ 'pt-BR': 'Dias até os pontos expirarem (1 a 365)' })
        .setMinValue(1)
        .setMaxValue(365)
        .setRequired(false)
    ),

  async executeSlash({ interaction }) {
    const respond = (payload) =>
      interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply(payload);

    if (!interaction.guild) {
      return respond({ content: t('partnerships.guild_only', interaction), allowedMentions: NO_PING });
    }
    if (!canModerate(interaction.member, interaction.guild, interaction.user.id)) {
      return respond({ content: t('modCases.noPermission', interaction), allowedMentions: NO_PING });
    }

    const target = interaction.options?.getUser?.('user');
    if (!target || target.bot || target.id === interaction.user.id) {
      return respond({ content: t('modCases.invalidTarget', interaction), allowedMentions: NO_PING });
    }

    const reason = interaction.options?.getString?.('reason') || t('modCases.defaultReason', interaction);
    const points = interaction.options?.getInteger?.('points') || undefined;
    const expireDays = interaction.options?.getInteger?.('days') || undefined;

    const cfg = modCases.getGuildWarningsConfig(interaction.guild.id);
    const result = modCases.issueWarning(interaction.guild.id, {
      userId: target.id,
      moderatorId: interaction.user.id,
      reason,
      points,
      expireDays,
    });

    const thresholdResult = result.triggeredThreshold
      ? await applyThresholdAction(interaction.guild, target.id, result.triggeredThreshold, result.caseRecord.caseNumber)
      : null;

    const fullResult = {
      caseRecord: result.caseRecord,
      warningRecord: result.warnRecord,
      activePoints: result.totalPoints,
      thresholdResult,
    };

    if (cfg.dmOnWarn && typeof target.send === 'function') {
      const dmEmbed = buildUserDmEmbed(interaction.guild, fullResult);
      await target.send({ embeds: [dmEmbed], allowedMentions: NO_PING }).catch(() => null);
    }

    const staffEmbed = buildStaffConfirmEmbed(interaction, fullResult);
    return respond({ embeds: [staffEmbed], allowedMentions: NO_PING });
  },

  async executePrefix({ message, args = [] }) {
    if (!message.guild) {
      return message.reply({ content: t('partnerships.guild_only', message), allowedMentions: NO_PING });
    }
    if (!canModerate(message.member, message.guild, message.author.id)) {
      return message.reply({ content: t('modCases.noPermission', message), allowedMentions: NO_PING });
    }

    const target = message.mentions?.users?.first() || (args[0] && /^\d{17,20}$/.test(args[0]) ? await message.client.users.fetch(args[0]).catch(() => null) : null);
    if (!target || target.bot || target.id === message.author.id) {
      return message.reply({ content: t('modCases.usageWarn', message), allowedMentions: NO_PING });
    }

    const reason = args.slice(1).join(' ').trim() || t('modCases.defaultReason', message);
    const cfg = modCases.getGuildWarningsConfig(message.guild.id);
    const result = modCases.issueWarning(message.guild.id, {
      userId: target.id,
      moderatorId: message.author.id,
      reason,
    });

    const thresholdResult = result.triggeredThreshold
      ? await applyThresholdAction(message.guild, target.id, result.triggeredThreshold, result.caseRecord.caseNumber)
      : null;

    const fullResult = {
      caseRecord: result.caseRecord,
      warningRecord: result.warnRecord,
      activePoints: result.totalPoints,
      thresholdResult,
    };

    if (cfg.dmOnWarn && typeof target.send === 'function') {
      const dmEmbed = buildUserDmEmbed(message.guild, fullResult);
      await target.send({ embeds: [dmEmbed], allowedMentions: NO_PING }).catch(() => null);
    }

    const staffEmbed = buildStaffConfirmEmbed(message, fullResult);
    return message.reply({ embeds: [staffEmbed], allowedMentions: NO_PING });
  },
};
