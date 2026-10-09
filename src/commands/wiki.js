const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { WIKI } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

function getWikiWebUrl() {
  const base = process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br';
  return `${base.replace(/\/$/, '')}/wiki`;
}

function buildWikiView(source = null, selectedTopic = null) {
  let title = t('wiki.title', source);
  let description = t('wiki.desc', source);

  if (selectedTopic === 'eco') {
    title = t('wiki.topicEcoTitle', source);
    description = t('wiki.topicEcoDesc', source);
  } else if (selectedTopic === 'work') {
    title = t('wiki.topicWorkTitle', source);
    description = t('wiki.topicWorkDesc', source);
  } else if (selectedTopic === 'tarot') {
    title = t('wiki.topicTarotTitle', source);
    description = t('wiki.topicTarotDesc', source);
  } else if (selectedTopic === 'social') {
    title = t('wiki.topicSocialTitle', source);
    description = t('wiki.topicSocialDesc', source);
  } else if (selectedTopic === 'games') {
    title = t('wiki.topicGamesTitle', source);
    description = t('wiki.topicGamesDesc', source);
  }

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple || '#8b5cf6')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: t('wiki.footer', source) })
    .setTimestamp();

  const selectOptions = [
    {
      label: t('wiki.optEco', source),
      value: 'eco',
      description: t('wiki.optEcoDesc', source).slice(0, 100),
      emoji: '🪙',
      default: selectedTopic === 'eco',
    },
    {
      label: t('wiki.optWork', source),
      value: 'work',
      description: t('wiki.optWorkDesc', source).slice(0, 100),
      emoji: '💼',
      default: selectedTopic === 'work',
    },
    {
      label: t('wiki.optTarot', source),
      value: 'tarot',
      description: t('wiki.optTarotDesc', source).slice(0, 100),
      emoji: '🔮',
      default: selectedTopic === 'tarot',
    },
    {
      label: t('wiki.optSocial', source),
      value: 'social',
      description: t('wiki.optSocialDesc', source).slice(0, 100),
      emoji: '💍',
      default: selectedTopic === 'social',
    },
    {
      label: t('wiki.optGames', source),
      value: 'games',
      description: t('wiki.optGamesDesc', source).slice(0, 100),
      emoji: '🎲',
      default: selectedTopic === 'games',
    },
  ];

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('wiki_topic_select')
      .setPlaceholder(t('wiki.categoryPlaceholder', source))
      .addOptions(selectOptions)
  );

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('wiki.btnOpenWeb', source))
      .setStyle(ButtonStyle.Link)
      .setURL(getWikiWebUrl())
      .setEmoji('🌐')
  );

  return { embeds: [embed], components: [selectRow, buttonRow] };
}

function isWikiInteraction(interaction) {
  return interaction.customId === 'wiki_topic_select';
}

async function handleWikiInteraction(interaction) {
  const selectedTopic = interaction.values[0];
  const view = buildWikiView(interaction, selectedTopic);
  return interaction.update(view);
}

module.exports = {
  name: WIKI,
  aliases: ['wiki', 'py-wiki'],
  buildWikiView,
  isWikiInteraction,
  handleWikiInteraction,
  data: new SlashCommandBuilder()
    .setName(WIKI)
    .setDescription('Open the official Pyxie encyclopedia and systems guide.')
    .setDescriptionLocalizations({
      'pt-BR': 'Abre a enciclopédia e guia oficial dos sistemas da Pyxie.',
    }),
  async executePrefix({ message }) {
    const view = buildWikiView(message);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildWikiView(interaction);
    await interaction.editReply(view);
  },
};
