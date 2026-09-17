const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { getRanking } = require('../services/economy');
const { formatCoins } = require('./economyHelpers');
const { RANKING } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { getLanguage, t } = require('../utils/i18n');

async function buildRankingView(source, viewerId, category = 'coins') {
  let title = t('ranking.mainTitle', source);
  let desc = '';
  let color = PYXIE_COLORS.gold || '#facc15';

  if (category === 'beans') {
    title = t('ranking.beansTitle', source);
    color = PYXIE_COLORS.emerald || '#10b981';
    const entries = getRanking(10).sort((a, b) => (b.magicBeans || 0) - (a.magicBeans || 0));
    const lines = entries.length
      ? entries.map((entry, idx) => {
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `**#${idx + 1}**`;
          return `${medal} <@${entry.userId}>\n> 🌱 **${entry.magicBeans || 0} ${t('common.magicBeans', source)}**`;
        })
      : [t('ranking.emptyBeans', source)];
    desc = [t('ranking.beansDesc', source), '', ...lines].join('\n');
  } else {
    title = t('ranking.coinsTitle', source);
    color = PYXIE_COLORS.gold;
    const entries = getRanking(10);
    const lines = entries.length
      ? entries.map((entry, idx) => {
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `**#${idx + 1}**`;
          return `${medal} <@${entry.userId}>\n> 💰 **${formatCoins(entry.coins, source)}**`;
        })
      : [t('ranking.emptyCoins', source)];
    desc = [t('ranking.coinsDesc', source), '', ...lines].join('\n');
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(t('ranking.footer', source)) })
    .setTimestamp();

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ranking_cat:coins:${viewerId}`)
      .setLabel(t('ranking.btnCoins', source))
      .setStyle(category === 'coins' ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ranking_cat:beans:${viewerId}`)
      .setLabel(t('ranking.btnBeans', source))
      .setStyle(category === 'beans' ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [buttonRow] };
}

function isRankingInteraction(interaction) {
  return typeof interaction.customId === 'string' && interaction.customId.startsWith('ranking_cat:');
}

async function handleRankingInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const cat = parts[1] || 'coins';
  const viewerId = parts[2];

  const view = await buildRankingView(interaction, viewerId, cat);
  return interaction.update(view);
}

module.exports = {
  name: RANKING,
  aliases: ['rank', 'ranking', 'py-ranking', 'py-rank', 'placar', 'top', 'leaderboard'],
  buildRankingView,
  isRankingInteraction,
  handleRankingInteraction,
  data: new SlashCommandBuilder()
    .setName(RANKING)
    .setDescription('Display global leaderboards for Coins and Magic Beans.')
    .setDescriptionLocalizations({
      'pt-BR': 'Exibe os rankings globais de Moedas e Feijões Mágicos.',
    })
    .addStringOption((opt) =>
      opt
        .setName('categoria')
        .setNameLocalizations({
          'en-US': 'category',
          'en-GB': 'category',
          'pt-BR': 'categoria',
        })
        .setDescription('Ranking category to display.')
        .setDescriptionLocalizations({
          'pt-BR': 'Categoria do ranking para exibir.',
        })
        .setRequired(false)
        .addChoices(
          { name: '🪙 Coins', nameLocalizations: { 'pt-BR': '🪙 Moedas' }, value: 'coins' },
          { name: '🌱 Magic Beans', nameLocalizations: { 'pt-BR': '🌱 Feijões Mágicos' }, value: 'beans' }
        )
    ),
  async executePrefix({ message, args }) {
    const cat = String(args[0] || 'coins').toLowerCase();
    const validCat = ['coins', 'beans'].includes(cat) ? cat : 'coins';
    const view = await buildRankingView(message, message.author.id, validCat);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const cat = interaction.options.getString('categoria') || interaction.options.getString('category') || 'coins';
    const view = await buildRankingView(interaction, interaction.user.id, cat);
    await interaction.editReply(view);
  },
};