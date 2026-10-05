const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { getRanking, getStreakRanking } = require('../services/economy');
const { formatCoins } = require('./economyHelpers');
const { RANKING } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { getLanguage, t } = require('../utils/i18n');
const { applyPyxieEmotion } = require('../utils/pyxieEmotions');

async function buildRankingView(source, viewerId, category = 'coins') {
  let title = t('ranking.mainTitle', source);
  let desc = '';
  let color = PYXIE_COLORS.gold || '#facc15';

  const isStreaks = category === 'streaks' || category === 'streak' || category === 'ofensiva';
  const isSeasonal = category === 'seasonal' || category === 'sazonal';

  const { isSeasonalActive, loadConfig, resolveSeasonalEmoji, getTopSeasonalBalances } = require('../modules/seasonal/seasonalManager');
  const seasonalActive = isSeasonalActive();

  if (isSeasonal && seasonalActive) {
    const sCfg = loadConfig();
    const sEmoji = resolveSeasonalEmoji(source?.client || null, sCfg.assets?.emojis?.currency, '🎃');
    title = `🏆 Placar Sazonal: ${sCfg.eventName}`;
    color = '#7c3aed';
    const entries = getTopSeasonalBalances(10);
    const lines = entries.length
      ? entries.map((entry, idx) => {
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `**#${idx + 1}**`;
          return `${medal} <@${entry.userId}>\n> ${sEmoji} **${entry.balance} ${sCfg.currencyName || 'Abóboras'}**`;
        })
      : ['Ninguém pontuou no evento sazonal ainda. Abra baús ou envie artes para liderar!'];
    desc = [`Top 10 aventureiros acumulando **${sCfg.currencyName}**:`, '', ...lines].join('\n');
  } else if (category === 'beans') {
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
  } else if (isStreaks) {
    title = t('ranking.streaksTitle', source);
    color = '#f97316';
    const entries = getStreakRanking(10);
    const lines = entries.length
      ? entries.map((entry, idx) => {
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `**#${idx + 1}**`;
          const dayLabel = entry.dailyStreak === 1
            ? t('ranking.streakSingleDay', source)
            : t('ranking.streakMultiDays', source);
          return `${medal} <@${entry.userId}>\n> 🔥 **${entry.dailyStreak} ${dayLabel}**`;
        })
      : [t('ranking.emptyStreaks', source)];
    desc = [t('ranking.streaksDesc', source), '', ...lines].join('\n');
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

  const footerText = (isSeasonal && seasonalActive)
    ? 'Dica: Use /py-infoevento para entender a pontuação e prazos!'
    : pyxieFooter(t('ranking.footer', source));

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(desc)
    .setFooter({ text: footerText })
    .setTimestamp();

  const { getEmoji } = require('../utils/appEmojis');
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ranking_cat:coins:${viewerId}`)
      .setLabel(t('ranking.btnCoins', source))
      .setEmoji(getEmoji('COIN'))
      .setStyle(category === 'coins' && !isSeasonal ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ranking_cat:beans:${viewerId}`)
      .setLabel(t('ranking.btnBeans', source))
      .setEmoji(getEmoji('MAGIC_BEAN'))
      .setStyle(category === 'beans' ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ranking_cat:streaks:${viewerId}`)
      .setLabel(t('ranking.btnStreaks', source))
      .setEmoji('🔥')
      .setStyle(isStreaks ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  if (seasonalActive) {
    const sCfg = loadConfig();
    const sEmoji = resolveSeasonalEmoji(source?.client || null, sCfg.assets?.emojis?.currency, '🎃');
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`ranking_cat:seasonal:${viewerId}`)
        .setLabel(sCfg.currencyName || 'Sazonal')
        .setEmoji(sEmoji)
        .setStyle(isSeasonal ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  }

  const { attachment } = applyPyxieEmotion(embed, 'VICTORY', { pose: true });
  return { embeds: [embed], files: attachment ? [attachment] : [], components: [buttonRow] };
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
    .setDescription('Display global leaderboards for Coins, Magic Beans, and Daily Streaks.')
    .setDescriptionLocalizations({
      'pt-BR': 'Exibe os rankings globais de Moedas, Feijões e Maiores Streaks.',
    })
    .addStringOption((opt) =>
      opt
        .setName('category')
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
          { name: '🌱 Magic Beans', nameLocalizations: { 'pt-BR': '🌱 Feijões Mágicos' }, value: 'beans' },
          { name: '🔥 Daily Streaks', nameLocalizations: { 'pt-BR': '🔥 Maiores Streaks' }, value: 'streaks' }
        )
    ),
  async executePrefix({ message, args }) {
    const cat = String(args[0] || 'coins').toLowerCase();
    const validCat = ['coins', 'beans', 'streaks', 'streak', 'ofensiva', 'seasonal', 'sazonal'].includes(cat) ? cat : 'coins';
    const view = await buildRankingView(message, message.author.id, validCat);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const cat = interaction.options.getString('category') || interaction.options.getString('categoria') || 'coins';
    const view = await buildRankingView(interaction, interaction.user.id, cat);
    await interaction.editReply(view);
  },
};