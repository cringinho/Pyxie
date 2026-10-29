// Comando /py-afk (py!afk, py!ausente, py!voltoja) — Aviso gentil de ausência sem exposição.
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const wellbeing = require('../services/wellbeingService');
const { t } = require('../utils/i18n');

const name = 'py-afk';
const aliases = ['afk', 'ausente', 'voltoja', 'brb'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function buildAfkSetPayload(entry, source) {
  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle(t('wellbeing.afkSetTitle', source))
    .setDescription(
      [
        entry.message
          ? t('wellbeing.afkSetWithReason', source, { reason: entry.message })
          : t('wellbeing.afkSetNoReason', source),
        `-# ${t('wellbeing.afkAutoClearHint', source)}`,
      ].join('\n\n')
    )
    .setFooter({ text: t('wellbeing.footer', source, { server: source?.guild?.name || 'Pyxie' }) })
    .setTimestamp();

  return { embeds: [embed], allowedMentions: NO_PING };
}

module.exports = {
  name,
  aliases,
  category: 'social',

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Set a gentle AFK status that clears automatically when you return.')
    .setDescriptionLocalizations({
      'pt-BR': 'Ativa um aviso gentil de ausência (AFK) que sai sozinho quando você voltar a conversar.',
    })
    .addStringOption((opt) =>
      opt
        .setName('message')
        .setNameLocalizations({ 'pt-BR': 'recado' })
        .setDescription('Short optional note (no need to share sensitive details)')
        .setDescriptionLocalizations({ 'pt-BR': 'Recado curto opcional (não precisa expor motivos delicados)' })
        .setRequired(false)
    ),

  async executeSlash({ interaction }) {
    const respond = (payload) =>
      interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply(payload);

    if (interaction.guildId) {
      const cfg = wellbeing.getWellbeingGuildConfig(interaction.guildId);
      if (!cfg.enabled || !cfg.afkEnabled) {
        return respond({ content: t('wellbeing.disabledInGuild', interaction), allowedMentions: NO_PING });
      }
    }

    const note = interaction.options?.getString?.('message') || '';
    const entry = wellbeing.setAfk(interaction.user.id, note);
    return respond(buildAfkSetPayload(entry, interaction));
  },

  async executePrefix({ message, args = [] }) {
    if (message.guildId) {
      const cfg = wellbeing.getWellbeingGuildConfig(message.guildId);
      if (!cfg.enabled || !cfg.afkEnabled) {
        return message.reply({ content: t('wellbeing.disabledInGuild', message), allowedMentions: NO_PING });
      }
    }
    const note = args.join(' ');
    const entry = wellbeing.setAfk(message.author.id, note);
    return message.reply(buildAfkSetPayload(entry, message));
  },
};

