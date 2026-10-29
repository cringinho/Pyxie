// Comando /py-reminder (py!lembrete, py!reminder) — Lembretes pessoais gentis (até 10 ativos por pessoa).
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const wellbeing = require('../services/wellbeingService');
const { t } = require('../utils/i18n');

const name = 'py-reminder';
const aliases = ['reminder', 'lembrete', 'py-lembrete', 'lembrar', 'remind', 'lembretes', 'reminders'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function renderListEmbed(userId, source) {
  const list = wellbeing.listUserReminders(userId);
  const body = list.length
    ? list
        .map((r) => `• \`#${r.id}\` — <t:${Math.floor(r.dueAt / 1000)}:R> · ${r.text}`)
        .join('\n')
    : t('wellbeing.reminderNone', source);

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle(t('wellbeing.reminderListTitle', source))
    .setDescription([body, `-# ${t('wellbeing.reminderHint', source, { max: `\`${wellbeing.MAX_REMINDERS_PER_USER}\`` })}`].join('\n\n'))
    .setFooter({ text: t('wellbeing.footer', source, { server: source?.guild?.name || 'Pyxie' }) })
    .setTimestamp();

  return { embeds: [embed], allowedMentions: NO_PING };
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Create, list, or cancel your personal gentle reminders.')
    .setDescriptionLocalizations({
      'pt-BR': 'Cria, lista ou cancela seus lembretes pessoais gentis.',
    })
    .addStringOption((opt) =>
      opt
        .setName('when')
        .setNameLocalizations({ 'pt-BR': 'quando' })
        .setDescription('Duration until reminder (e.g. 15m, 2h, 1d)')
        .setDescriptionLocalizations({ 'pt-BR': 'Tempo até o lembrete (ex.: 15m, 2h, 1d)' })
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName('text')
        .setNameLocalizations({ 'pt-BR': 'mensagem' })
        .setDescription('What should Pyxie remind you about?')
        .setDescriptionLocalizations({ 'pt-BR': 'Sobre o que a Pyxie deve lembrar você?' })
        .setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('cancel')
        .setNameLocalizations({ 'pt-BR': 'cancelar_id' })
        .setDescription('Reminder ID (#) to cancel')
        .setDescriptionLocalizations({ 'pt-BR': 'Número (#) do lembrete para cancelar' })
        .setMinValue(1)
        .setRequired(false)
    ),

  async executeSlash({ interaction }) {
    const respond = (payload) =>
      interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply(payload);

    if (interaction.guildId) {
      const cfg = wellbeing.getWellbeingGuildConfig(interaction.guildId);
      if (!cfg.enabled || !cfg.remindersEnabled) {
        return respond({ content: t('wellbeing.disabledInGuild', interaction), allowedMentions: NO_PING });
      }
    }

    const cancelId = interaction.options?.getInteger?.('cancel') || 0;
    const whenRaw = interaction.options?.getString?.('when') || '';
    const textRaw = interaction.options?.getString?.('text') || '';

    if (cancelId > 0) {
      const res = wellbeing.cancelReminder(interaction.user.id, cancelId);
      if (!res.ok) return respond({ content: t('wellbeing.reminderNotFound', interaction, { id: `\`#${cancelId}\`` }), allowedMentions: NO_PING });
      return respond({ content: t('wellbeing.reminderCancelled', interaction, { id: `\`#${cancelId}\`` }), allowedMentions: NO_PING });
    }

    if (!whenRaw && !textRaw) {
      return respond(renderListEmbed(interaction.user.id, interaction));
    }

    const durationMs = wellbeing.parseDurationString(whenRaw);
    if (!durationMs) {
      return respond({ content: t('wellbeing.reminderInvalidTime', interaction), allowedMentions: NO_PING });
    }
    if (!textRaw.trim()) {
      return respond({ content: t('wellbeing.reminderNeedText', interaction), allowedMentions: NO_PING });
    }

    const created = wellbeing.createReminder({
      userId: interaction.user.id,
      guildId: interaction.guildId || '',
      channelId: interaction.channelId || '',
      text: textRaw,
      durationMs,
    });
    if (!created.ok) {
      if (created.error === 'limit_reached') {
        return respond({ content: t('wellbeing.reminderLimitReached', interaction, { max: `\`${created.max}\`` }), allowedMentions: NO_PING });
      }
      return respond({ content: t('wellbeing.reminderInvalidTime', interaction), allowedMentions: NO_PING });
    }

    const embed = new EmbedBuilder()
      .setColor(0x10b981)
      .setTitle(t('wellbeing.reminderCreatedTitle', interaction))
      .setDescription(
        [
          t('wellbeing.reminderCreatedBody', interaction, {
            id: `\`#${created.reminder.id}\``,
            due: `<t:${Math.floor(created.reminder.dueAt / 1000)}:R>`,
            text: created.reminder.text,
          }),
        ].join('\n\n')
      )
      .setFooter({ text: t('wellbeing.footer', interaction, { server: interaction.guild?.name || 'Pyxie' }) })
      .setTimestamp();

    return respond({ embeds: [embed], allowedMentions: NO_PING });
  },

  async executePrefix({ message, args = [] }) {
    if (message.guildId) {
      const cfg = wellbeing.getWellbeingGuildConfig(message.guildId);
      if (!cfg.enabled || !cfg.remindersEnabled) {
        return message.reply({ content: t('wellbeing.disabledInGuild', message), allowedMentions: NO_PING });
      }
    }

    if (!args.length || ['list', 'lista', 'ver'].includes(String(args[0]).toLowerCase())) {
      return message.reply(renderListEmbed(message.author.id, message));
    }

    if (['cancel', 'cancelar', 'del', 'rm'].includes(String(args[0]).toLowerCase())) {
      const id = Number(String(args[1] || '').replace(/^#/, ''));
      const res = wellbeing.cancelReminder(message.author.id, id);
      if (!res.ok) return message.reply({ content: t('wellbeing.reminderNotFound', message, { id: `\`#${id || 0}\`` }), allowedMentions: NO_PING });
      return message.reply({ content: t('wellbeing.reminderCancelled', message, { id: `\`#${id}\`` }), allowedMentions: NO_PING });
    }

    const durationMs = wellbeing.parseDurationString(args[0]);
    const textRaw = args.slice(1).join(' ');
    if (!durationMs || !textRaw.trim()) {
      return message.reply({ content: t('wellbeing.reminderInvalidTime', message), allowedMentions: NO_PING });
    }

    const created = wellbeing.createReminder({
      userId: message.author.id,
      guildId: message.guildId || '',
      channelId: message.channelId || '',
      text: textRaw,
      durationMs,
    });
    if (!created.ok) {
      return message.reply({ content: t('wellbeing.reminderLimitReached', message, { max: `\`${wellbeing.MAX_REMINDERS_PER_USER}\`` }), allowedMentions: NO_PING });
    }

    return message.reply({
      content: t('wellbeing.reminderCreatedBody', message, {
        id: `\`#${created.reminder.id}\``,
        due: `<t:${Math.floor(created.reminder.dueAt / 1000)}:R>`,
        text: created.reminder.text,
      }),
      allowedMentions: NO_PING,
    });
  },
};

