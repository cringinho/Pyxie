const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getGuildAgenda } = require('../services/guildAgenda');
const { AGENDA } = require('./commandNames');
const { getAnimatedEmoji } = require('../utils/serverEmojis');
const { t } = require('../utils/i18n');

function isManager(source) {
  return source.member?.permissions?.has(PermissionFlagsBits.ManageGuild);
}

// Frequência legível de um item da agenda (src/services/guildAgenda.js).
function describeEvery(every, lang) {
  if (every.hours) return t('periodic.agenda.everyHours', lang, { hours: `\`${every.hours}\`` });
  if (every.daily) return t('periodic.agenda.daily', lang, { time: `\`${every.daily}\`` });
  if (every.afterBump) return t('periodic.agenda.afterBump', lang, { hours: `\`${every.afterBump}\`` });
  const days = (every.weekdays || []).map((d) => t(`periodic.agenda.weekday.${d}`, lang)).join(', ');
  return t('periodic.agenda.weekly', lang, { days, hour: `\`${String(every.hour).padStart(2, '0')}:00\`` });
}

function buildAgendaEmbed(guild, now = Date.now(), source = null) {
  const ctx = source || guild;
  const schedule = guild?.id ? getGuildAgenda(guild.id, now) : [];
  const guildName = guild?.name || '';

  const lines = schedule.length
    ? schedule.map((item) => {
        const emoji = getAnimatedEmoji(guild, [item.id, 'calendar', 'clock'], item.emoji);
        const at = Math.floor(item.nextAt / 1000);
        return [
          `### ${emoji} ${t(`periodic.agenda.name.${item.id}`, ctx)}`,
          `> ⏰ **${t('periodic.agenda.next', ctx)}** <t:${at}:F> (<t:${at}:R>)`,
          `> 📢 **${t('periodic.agenda.channel', ctx)}** <#${item.channelId}>`,
          `> 🔁 **${t('periodic.agenda.frequency', ctx)}** ${describeEvery(item.every, ctx)}`,
        ].join('\n');
      })
    : [`> *${t('periodic.agenda.empty', ctx)}*`];

  return new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle(t('admin.agendaTitle', ctx, { server: guildName ? ` — ${guildName}` : '' }))
    .setDescription([t('admin.agendaDesc', ctx), ...lines, `-# ${t('periodic.agenda.hint', ctx)}`].join('\n\n'))
    .setFooter({ text: `${guildName ? `${guildName} • ` : ''}${t('periodic.agenda.footer', ctx)}` })
    .setTimestamp();
}

function buildUsage(source = null) {
  return t('admin.noPermission', source);
}

module.exports = {
  name: AGENDA,
  aliases: ['schedule', 'agenda', 'py-agenda', 'py-schedule', 'automacoes'],
  buildAgendaEmbed,
  describeEvery,
  data: new SlashCommandBuilder()
    .setName(AGENDA)
    .setDescription('Shows upcoming scheduled automations and tasks.')
    .setDescriptionLocalizations({
      'pt-BR': 'Mostra os próximos disparos e verificações automáticas do bot.',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async executePrefix({ message }) {
    if (!isManager(message)) return message.reply(buildUsage(message));
    await message.reply({ embeds: [buildAgendaEmbed(message.guild, Date.now(), message)] });
  },
  async executeSlash({ interaction }) {
    if (!isManager(interaction)) return interaction.editReply(buildUsage(interaction));
    await interaction.editReply({ embeds: [buildAgendaEmbed(interaction.guild, Date.now(), interaction)] });
  },
};
