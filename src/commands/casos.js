// Comando /py-case (py!caso, py!casos, py!case) — Consulta, edição de motivo e revogação de casos (#123).
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const modCases = require('../services/modCasesService');
const { canModerate } = require('./advertencia');
const { t } = require('../utils/i18n');

const name = 'py-case';
const aliases = ['case', 'caso', 'py-caso', 'casos', 'py-casos', 'cases', 'modcase'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function renderSingleCaseEmbed(caseItem, source) {
  const embed = new EmbedBuilder()
    .setColor(caseItem.revoked ? 0x64748b : 0x6366f1)
    .setTitle(t('modCases.caseTitle', source, { caseNumber: `#${caseItem.caseNumber}`, action: caseItem.action.toUpperCase() }))
    .setDescription(
      [
        t('modCases.caseMeta', source, {
          target: `\`<@${caseItem.targetId}>\``,
          moderator: `\`<@${caseItem.moderatorId}>\``,
          points: `\`${caseItem.points || 0}\``,
        }),
        t('modCases.issuedReason', source, { reason: caseItem.reason }),
        `-# ${t('modCases.caseTimestamp', source, { date: `<t:${Math.floor((caseItem.createdAt || Date.now()) / 1000)}:f>` })}`,
      ].join('\n\n')
    )
    .setFooter({ text: t('modCases.footer', source) })
    .setTimestamp();
  return { embeds: [embed], allowedMentions: NO_PING };
}

function renderCaseListEmbed(cases, userWarnings, targetId, source) {
  const lines = [];
  if (targetId && userWarnings) {
    lines.push(
      t('modCases.userActiveSummary', source, {
        target: `\`<@${targetId}>\``,
        points: `\`${userWarnings.totalPoints ?? userWarnings.activePoints ?? 0}\``,
        count: `\`${userWarnings.activeCount ?? (userWarnings.warnings || []).length}\``,
      })
    );
  }
  if (!cases.length) {
    lines.push(t('modCases.noCasesFound', source));
  } else {
    const items = cases.slice(0, 10).map((c) => {
      const pts = c.points ? ` (\`+${c.points}\`)` : '';
      return `• \`#${c.caseNumber}\` **${c.action}**${pts} — \`<@${c.targetId}>\` · ${c.reason.slice(0, 80)}`;
    });
    lines.push(items.join('\n'));
  }

  const embed = new EmbedBuilder()
    .setColor(0x6366f1)
    .setTitle(t('modCases.listTitle', source))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: t('modCases.footer', source) })
    .setTimestamp();
  return { embeds: [embed], allowedMentions: NO_PING };
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('View, filter, edit reason, or revoke a numbered moderation case (#123).')
    .setDescriptionLocalizations({
      'pt-BR': 'Consulta, filtra, edita o motivo ou revoga um caso numerado de moderação (#123).',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addIntegerOption((opt) =>
      opt
        .setName('number')
        .setNameLocalizations({ 'pt-BR': 'numero' })
        .setDescription('Case number (e.g. 12)')
        .setDescriptionLocalizations({ 'pt-BR': 'Número do caso (ex.: 12)' })
        .setMinValue(1)
        .setRequired(false)
    )
    .addUserOption((opt) =>
      opt
        .setName('user')
        .setNameLocalizations({ 'pt-BR': 'pessoa' })
        .setDescription('Filter cases and active points by member')
        .setDescriptionLocalizations({ 'pt-BR': 'Filtra casos e pontos ativos por membro' })
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName('reason')
        .setNameLocalizations({ 'pt-BR': 'novo_motivo' })
        .setDescription('Update the reason of the specified case number')
        .setDescriptionLocalizations({ 'pt-BR': 'Atualiza o motivo do caso informado' })
        .setRequired(false)
    )
    .addBooleanOption((opt) =>
      opt
        .setName('revoke')
        .setNameLocalizations({ 'pt-BR': 'revogar' })
        .setDescription('Revoke the warning points of the specified case number')
        .setDescriptionLocalizations({ 'pt-BR': 'Revoga os pontos de advertência do caso informado' })
        .setRequired(false)
    ),

  async executeSlash({ interaction }) {
    const respond = (payload) =>
      interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply(payload);

    if (!interaction.guild) {
      return respond({ content: t('partnerships.guild_only', interaction), allowedMentions: NO_PING });
    }

    const isMod = canModerate(interaction.member, interaction.guild, interaction.user.id);
    const caseNumber = interaction.options?.getInteger?.('number') || 0;
    const targetUser = interaction.options?.getUser?.('user') || null;
    const newReason = interaction.options?.getString?.('reason') || '';
    const revoke = interaction.options?.getBoolean?.('revoke') || false;

    // Sem permissão de moderação: permite ver apenas os próprios pontos ativos
    if (!isMod) {
      const ownWarnings = modCases.getUserWarnings(interaction.guild.id, interaction.user.id);
      const ownCases = modCases.listCases(interaction.guild.id, { targetId: interaction.user.id, limit: 10 });
      return respond(renderCaseListEmbed(ownCases, ownWarnings, interaction.user.id, interaction));
    }

    if (caseNumber > 0) {
      if (revoke) {
        const rev = await modCases.revokeWarningByCase(interaction.guild.id, caseNumber, { revokedBy: interaction.user.id });
        if (!rev?.ok) return respond({ content: t('modCases.caseNotFound', interaction, { caseNumber: `\`#${caseNumber}\`` }), allowedMentions: NO_PING });
      }
      if (newReason.trim()) {
        const updated = await modCases.updateCaseReason(interaction.guild.id, caseNumber, newReason, { updatedBy: interaction.user.id });
        if (!updated?.ok) return respond({ content: t('modCases.caseNotFound', interaction, { caseNumber: `\`#${caseNumber}\`` }), allowedMentions: NO_PING });
        return respond(renderSingleCaseEmbed(updated.caseRecord, interaction));
      }
      const found = modCases.getCase(interaction.guild.id, caseNumber);
      if (!found) return respond({ content: t('modCases.caseNotFound', interaction, { caseNumber: `\`#${caseNumber}\`` }), allowedMentions: NO_PING });
      return respond(renderSingleCaseEmbed(found, interaction));
    }

    const targetId = targetUser?.id || '';
    const list = modCases.listCases(interaction.guild.id, { targetId, limit: 10 });
    const warnings = targetId ? modCases.getUserWarnings(interaction.guild.id, targetId) : null;
    return respond(renderCaseListEmbed(list, warnings, targetId, interaction));
  },

  async executePrefix({ message, args = [] }) {
    if (!message.guild) {
      return message.reply({ content: t('partnerships.guild_only', message), allowedMentions: NO_PING });
    }
    const isMod = canModerate(message.member, message.guild, message.author.id);
    if (!isMod) {
      const ownWarnings = modCases.getUserWarnings(message.guild.id, message.author.id);
      const ownCases = modCases.listCases(message.guild.id, { targetId: message.author.id, limit: 10 });
      return message.reply(renderCaseListEmbed(ownCases, ownWarnings, message.author.id, message));
    }

    const first = String(args[0] || '').replace(/^#/, '');
    if (/^\d{1,6}$/.test(first)) {
      const caseNum = Number(first);
      const rest = args.slice(1).join(' ').trim();
      if (rest.toLowerCase() === 'revoke' || rest.toLowerCase() === 'revogar') {
        await modCases.revokeWarningByCase(message.guild.id, caseNum, message.author.id);
      } else if (rest) {
        await modCases.updateCaseReason(message.guild.id, caseNum, rest, message.author.id);
      }
      const found = modCases.getCase(message.guild.id, caseNum);
      if (!found) return message.reply({ content: t('modCases.caseNotFound', message, { caseNumber: `\`#${caseNum}\`` }), allowedMentions: NO_PING });
      return message.reply(renderSingleCaseEmbed(found, message));
    }

    const mentioned = message.mentions?.users?.first();
    const targetId = mentioned?.id || (/^\d{17,20}$/.test(first) ? first : '');
    const list = modCases.listCases(message.guild.id, { targetId, limit: 10 });
    const warnings = targetId ? modCases.getUserWarnings(message.guild.id, targetId) : null;
    return message.reply(renderCaseListEmbed(list, warnings, targetId, message));
  },
};
