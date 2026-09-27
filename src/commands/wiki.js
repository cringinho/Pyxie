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
  const base = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';
  return `${base.replace(/\/$/, '')}/wiki`;
}

function buildWikiView(source = null, selectedTopic = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  let title = t('wiki.title', source);
  let description = t('wiki.desc', source);

  if (selectedTopic === 'bosque') {
    title = t('wiki.topicBosqueTitle', source);
    description = t('wiki.topicBosqueDesc', source);
  } else if (selectedTopic === 'espectral' || selectedTopic === 'smt') {
    title = t('wiki.topicSmtTitle', source);
    description = t('wiki.topicSmtDesc', source);
  } else if (selectedTopic === 'relics') {
    title = t('wiki.topicRelicsTitle', source);
    description = t('wiki.topicRelicsDesc', source);
  } else if (selectedTopic === 'bestiary') {
    title = t('wiki.topicBestiaryTitle', source);
    description = t('wiki.topicBestiaryDesc', source);
  } else if (selectedTopic === 'eco') {
    title = t('wiki.topicEcoTitle', source);
    description = t('wiki.topicEcoDesc', source);
  }

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple || '#8b5cf6')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: t('wiki.footer', source) })
    .setTimestamp();

  const selectOptions = [
    {
      label: t('wiki.optBosque', source),
      value: 'bosque',
      description: t('wiki.optBosqueDesc', source).slice(0, 100),
      emoji: '🌲',
      default: selectedTopic === 'bosque',
    },
    {
      label: t('wiki.optSmt', source),
      value: 'espectral',
      description: t('wiki.optSmtDesc', source).slice(0, 100),
      emoji: '🧠',
      default: selectedTopic === 'espectral' || selectedTopic === 'smt',
    },
    {
      label: t('wiki.optRelics', source),
      value: 'relics',
      description: t('wiki.optRelicsDesc', source).slice(0, 100),
      emoji: '🏺',
      default: selectedTopic === 'relics',
    },
    {
      label: t('wiki.optBestiary', source),
      value: 'bestiary',
      description: t('wiki.optBestiaryDesc', source).slice(0, 100),
      emoji: '📜',
      default: selectedTopic === 'bestiary',
    },
    {
      label: t('wiki.optEco', source),
      value: 'eco',
      description: t('wiki.optEcoDesc', source).slice(0, 100),
      emoji: '🪙',
      default: selectedTopic === 'eco',
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
  aliases: ['wiki'],
  buildWikiView,
  isWikiInteraction,
  handleWikiInteraction,
  data: new SlashCommandBuilder()
    .setName(WIKI)
    .setDescription('Open the official Pyxie and Gloom Realm encyclopedia and guide.')
    .setDescriptionLocalizations({
      'pt-BR': 'Abre a enciclopédia e guia oficial da Pyxie e Bosque da Penumbra.',
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

