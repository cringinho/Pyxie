// Comando /py-diagnose (py!diagnostico, py!diagnose) — Diagnóstico de comando.
// Roda exatamente a mesma checagem do carregador de comandos e explica passo a passo por que
// um comando funciona ou não para aquela pessoa, naquele canal e servidor.
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { diagnoseCommand, inspectBotChannelPermissions } = require('../services/commandDiagnostics');
const { t } = require('../utils/i18n');

const name = 'py-diagnose';
const aliases = ['diagnose', 'diagnostico', 'py-diagnostico', 'diagnosticar'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function renderDiagnosticEmbed(report, source) {
  const cmdDisplay = report.command?.name || report.canonicalName || report.query || 'comando';
  const stepLines = report.steps.map((s) => {
    const icon = s.ok ? '✅' : '❌';
    const stepKey = s.id || s.step;
    const label = t(`diagnose.step.${stepKey}`, source);
    let detail = t(`diagnose.code.${s.code}`, source, {
      module: s.detail?.moduleId ? `\`${s.detail.moduleId}\`` : '',
      group: s.detail?.group ? `\`${s.detail.group}\`` : '',
      missing: Array.isArray(s.detail?.missing) ? s.detail.missing.map((m) => `\`${m}\``).join(', ') : '',
      channels: Array.isArray(s.detail?.allowedChannels) && s.detail.allowedChannels.length
        ? s.detail.allowedChannels.map((id) => `<#${id}>`).join(', ')
        : '',
    });
    return `${icon} **${label}** — ${detail}`;
  });

  const summaryLine = report.ok
    ? `> ✅ ${t('diagnose.summaryOk', source, { command: `\`/${cmdDisplay}\`` })}`
    : `> ❌ ${t('diagnose.summaryBlocked', source, {
        command: `\`/${cmdDisplay}\``,
        step: `**${t(`diagnose.step.${report.failedStep}`, source)}**`,
      })}`;

  const embed = new EmbedBuilder()
    .setColor(report.ok ? 0x10b981 : 0xf59e0b)
    .setTitle(t('diagnose.title', source, { command: cmdDisplay }))
    .setDescription([summaryLine, `### 🔎 ${t('diagnose.stepsHeader', source)}`, stepLines.join('\n')].join('\n\n'))
    .setFooter({ text: t('diagnose.footer', source) })
    .setTimestamp();

  return { embeds: [embed], allowedMentions: NO_PING };
}

function runForContext({ query, guild, channel, member, userId }) {
  const roleIds = member?.roles?.cache
    ? [...member.roles.cache.keys()]
    : Array.isArray(member?.roles)
      ? member.roles
      : [];
  const isAdmin = Boolean(
    member?.permissions?.has?.(PermissionFlagsBits.Administrator) ||
      member?.permissions?.has?.(PermissionFlagsBits.ManageGuild)
  );
  const botPerms = inspectBotChannelPermissions(guild, channel);

  return diagnoseCommand({
    commandName: query,
    guildId: guild?.id || null,
    channelId: channel?.id || null,
    parentChannelId: channel?.parentId || null,
    userId,
    roleIds,
    isAdmin,
    botChannelPerms: botPerms,
  });
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  ephemeral: true,
  renderDiagnosticEmbed,
  runForContext,

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Check step-by-step why a command works or is blocked in this channel.')
    .setDescriptionLocalizations({
      'pt-BR': 'Verifica passo a passo por que um comando funciona ou está bloqueado neste canal.',
    })
    .addStringOption((opt) =>
      opt
        .setName('command')
        .setNameLocalizations({ 'pt-BR': 'comando' })
        .setDescription('Command name to diagnose (e.g. py-tarot, daily, warn)')
        .setDescriptionLocalizations({ 'pt-BR': 'Nome do comando para diagnosticar (ex.: py-tarot, daily, warn)' })
        .setRequired(true)
    ),

  async executeSlash({ interaction }) {
    const query = interaction.options?.getString?.('command') || '';
    const report = runForContext({
      query,
      guild: interaction.guild,
      channel: interaction.channel,
      member: interaction.member,
      userId: interaction.user.id,
    });
    const payload = renderDiagnosticEmbed(report, interaction);
    return interaction.deferred || interaction.replied
      ? interaction.editReply(payload)
      : interaction.reply({ ...payload, ephemeral: true });
  },

  async executePrefix({ message, args = [] }) {
    const query = args[0] || '';
    if (!query) {
      return message.reply({ content: t('diagnose.needCommand', message), allowedMentions: NO_PING });
    }
    const report = runForContext({
      query,
      guild: message.guild,
      channel: message.channel,
      member: message.member,
      userId: message.author.id,
    });
    return message.reply(renderDiagnosticEmbed(report, message));
  },
};
