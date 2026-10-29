// Comando /py-birthday (py!aniversario, py!niver) — Aniversários opcionais e privados.
// Nunca pede nem guarda o ano de nascimento ou idade; a pessoa escolhe se quer parabéns no servidor.
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const wellbeing = require('../services/wellbeingService');
const { t } = require('../utils/i18n');

const name = 'py-birthday';
const aliases = ['birthday', 'aniversario', 'py-aniversario', 'niver', 'bday'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function formatDayMonth(day, month) {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
}

module.exports = {
  name,
  aliases,
  category: 'social',
  ephemeral: true,

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Save or remove your birthday (day and month only, never birth year or age).')
    .setDescriptionLocalizations({
      'pt-BR': 'Salva ou remove o seu aniversário (apenas dia e mês, nunca ano de nascimento ou idade).',
    })
    .addIntegerOption((opt) =>
      opt
        .setName('day')
        .setNameLocalizations({ 'pt-BR': 'dia' })
        .setDescription('Day of your birthday (1 to 31)')
        .setDescriptionLocalizations({ 'pt-BR': 'Dia do seu aniversário (1 a 31)' })
        .setMinValue(1)
        .setMaxValue(31)
        .setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('month')
        .setNameLocalizations({ 'pt-BR': 'mes' })
        .setDescription('Month of your birthday (1 to 12)')
        .setDescriptionLocalizations({ 'pt-BR': 'Mês do seu aniversário (1 a 12)' })
        .setMinValue(1)
        .setMaxValue(12)
        .setRequired(false)
    )
    .addBooleanOption((opt) =>
      opt
        .setName('announce')
        .setNameLocalizations({ 'pt-BR': 'anunciar_aqui' })
        .setDescription('Allow Pyxie to congratulate you in this server on your birthday?')
        .setDescriptionLocalizations({ 'pt-BR': 'Permitir que a Pyxie dê parabéns a você neste servidor?' })
        .setRequired(false)
    )
    .addBooleanOption((opt) =>
      opt
        .setName('remove')
        .setNameLocalizations({ 'pt-BR': 'remover' })
        .setDescription('Remove your saved birthday completely')
        .setDescriptionLocalizations({ 'pt-BR': 'Remove completamente o seu aniversário salvo' })
        .setRequired(false)
    ),

  async executeSlash({ interaction }) {
    const respond = (payload) =>
      interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply({ ...payload, ephemeral: true });

    const remove = interaction.options?.getBoolean?.('remove') || false;
    if (remove) {
      wellbeing.removeBirthday(interaction.user.id);
      return respond({ content: t('wellbeing.birthdayRemoved', interaction), allowedMentions: NO_PING });
    }

    const day = interaction.options?.getInteger?.('day') || 0;
    const month = interaction.options?.getInteger?.('month') || 0;
    const announceOpt = interaction.options?.getBoolean?.('announce');

    if (!day && !month) {
      const current = wellbeing.getBirthday(interaction.user.id);
      if (!current) {
        return respond({ content: t('wellbeing.birthdayEmpty', interaction), allowedMentions: NO_PING });
      }
      const inGuild = Boolean(interaction.guildId && current.guildIds?.includes(interaction.guildId));
      const embed = new EmbedBuilder()
        .setColor(0xf472b6)
        .setTitle(t('wellbeing.birthdaySavedTitle', interaction))
        .setDescription(
          [
            t('wellbeing.birthdayCurrentBody', interaction, {
              date: `\`${formatDayMonth(current.day, current.month)}\``,
              status: inGuild ? t('wellbeing.birthdayOptInYes', interaction) : t('wellbeing.birthdayOptInNo', interaction),
            }),
            `-# ${t('wellbeing.birthdayPrivacyHint', interaction)}`,
          ].join('\n\n')
        )
        .setFooter({ text: t('wellbeing.footer', interaction, { server: interaction.guild?.name || 'Pyxie' }) });
      return respond({ embeds: [embed], allowedMentions: NO_PING });
    }

    const res = wellbeing.setBirthday(interaction.user.id, {
      day,
      month,
      guildId: interaction.guildId || '',
      optInGuild: announceOpt !== false,
    });
    if (!res.ok) {
      return respond({ content: t('wellbeing.birthdayInvalidDate', interaction), allowedMentions: NO_PING });
    }

    const embed = new EmbedBuilder()
      .setColor(0xf472b6)
      .setTitle(t('wellbeing.birthdaySavedTitle', interaction))
      .setDescription(
        [
          t('wellbeing.birthdaySavedBody', interaction, {
            date: `\`${formatDayMonth(res.birthday.day, res.birthday.month)}\``,
            status: announceOpt !== false ? t('wellbeing.birthdayOptInYes', interaction) : t('wellbeing.birthdayOptInNo', interaction),
          }),
          `-# ${t('wellbeing.birthdayPrivacyHint', interaction)}`,
        ].join('\n\n')
      )
      .setFooter({ text: t('wellbeing.footer', interaction, { server: interaction.guild?.name || 'Pyxie' }) });
    return respond({ embeds: [embed], allowedMentions: NO_PING });
  },

  async executePrefix({ message, args = [] }) {
    const first = String(args[0] || '').toLowerCase();
    if (['remove', 'remover', 'apagar', 'clear', 'off'].includes(first)) {
      wellbeing.removeBirthday(message.author.id);
      return message.reply({ content: t('wellbeing.birthdayRemoved', message), allowedMentions: NO_PING });
    }

    if (!first) {
      const current = wellbeing.getBirthday(message.author.id);
      if (!current) return message.reply({ content: t('wellbeing.birthdayEmpty', message), allowedMentions: NO_PING });
      return message.reply({
        content: t('wellbeing.birthdayCurrentBody', message, {
          date: `\`${formatDayMonth(current.day, current.month)}\``,
          status: message.guildId && current.guildIds?.includes(message.guildId)
            ? t('wellbeing.birthdayOptInYes', message)
            : t('wellbeing.birthdayOptInNo', message),
        }),
        allowedMentions: NO_PING,
      });
    }

    const m = first.match(/^(\d{1,2})[/-](\d{1,2})$/);
    const day = m ? Number(m[1]) : Number(args[0]);
    const month = m ? Number(m[2]) : Number(args[1]);
    const res = wellbeing.setBirthday(message.author.id, {
      day,
      month,
      guildId: message.guildId || '',
      optInGuild: true,
    });
    if (!res.ok) {
      return message.reply({ content: t('wellbeing.birthdayInvalidDate', message), allowedMentions: NO_PING });
    }

    return message.reply({
      content: t('wellbeing.birthdaySavedBody', message, {
        date: `\`${formatDayMonth(res.birthday.day, res.birthday.month)}\``,
        status: t('wellbeing.birthdayOptInYes', message),
      }),
      allowedMentions: NO_PING,
    });
  },
};

