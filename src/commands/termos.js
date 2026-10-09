const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { TERMS } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

function getTermsWebUrl(source = null) {
  const base = process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br';
  const lang = getLanguage(source);
  return `${base.replace(/\/$/, '')}/termos${lang === 'en' ? '?lang=en' : ''}`;
}

function buildTermsView(source = null) {
  const isEn = getLanguage(source) === 'en';

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple || '#8b5cf6')
    .setTitle(t('terms.title', source))
    .setDescription(t('terms.desc', source))
    .addFields([
      {
        name: t('terms.fieldSafeguardTitle', source),
        value: t('terms.fieldSafeguardValue', source),
        inline: false,
      },
      {
        name: t('terms.fieldChannelsTitle', source),
        value: t('terms.fieldChannelsValue', source),
        inline: false,
      },
      {
        name: t('terms.fieldSupportTitle', source),
        value: t('terms.fieldSupportValue', source),
        inline: false,
      },
    ])
    .setFooter({ text: t('terms.footer', source) })
    .setTimestamp();

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('terms.btnOpenWeb', source))
      .setStyle(ButtonStyle.Link)
      .setURL(getTermsWebUrl(source))
      .setEmoji('🛡️')
  );

  return { embeds: [embed], components: [buttonRow] };
}

module.exports = {
  name: TERMS,
  aliases: ['terms', 'termos', 'py-terms', 'py-termos', 'regras', 'py-regras'],
  buildTermsView,
  data: new SlashCommandBuilder()
    .setName(TERMS)
    .setDescription('Read community terms, child safety framework, and emotional support hotlines.')
    .setDescriptionLocalizations({
      'pt-BR': 'Leia os termos de uso, salvaguarda de menores e canais de acolhimento e suporte.',
    }),
  async executePrefix({ message }) {
    const view = buildTermsView(message);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildTermsView(interaction);
    await interaction.editReply(view);
  },
};

