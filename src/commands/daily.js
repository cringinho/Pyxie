const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { claimDaily } = require('../services/economy');
const { createBonusSession } = require('../services/bonusTimer');
const { t, getLanguage, formatCoins, formatRemaining } = require('../utils/i18n');
const { DAILY } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

function getDailyCompliment(streak, source = null) {
  if (streak <= 2) return t('daily.complimentTier1', source);
  if (streak <= 5) return t('daily.complimentTier2', source);
  if (streak <= 9) return t('daily.complimentTier3', source);
  if (streak <= 19) return t('daily.complimentTier4', source);
  return t('daily.complimentTier5', source);
}

function buildDailyView(userId, guildOrSource = null, clientId = null) {
  const result = claimDaily(userId);
  const lang = getLanguage(guildOrSource);
  const bonusSession = createBonusSession(userId, 'item_bonus', {}, lang);

  if (!result.claimed) {
    const desc = [
      t('daily.descCooldown', guildOrSource, { time: formatRemaining(result.remainingMs, guildOrSource) }),
      ...(result.streak > 0 ? ['', t('daily.streakCooldown', guildOrSource, { streak: result.streak })] : []),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.violet || '#8b5cf6')
      .setTitle(t('daily.titleCooldown', guildOrSource))
      .setDescription(desc)
      .setFooter({ text: pyxieFooter(t('daily.footerCooldown', guildOrSource)) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(t('daily.btnWebBonus', guildOrSource))
        .setStyle(ButtonStyle.Link)
        .setURL(bonusSession.url)
        .setEmoji('🎁')
    );

    return { embeds: [embed], components: [row] };
  }

  const compliment = getDailyCompliment(result.streak, guildOrSource);
  const collectedLine = result.streak > 1
    ? t('daily.collectedStreak', guildOrSource, {
        normal: formatCoins(result.amount, guildOrSource),
        streakBonus: formatCoins(result.streakBonus, guildOrSource),
        streak: result.streak,
        compliment,
      })
    : t('daily.collected', guildOrSource, {
        amount: formatCoins(result.amount, guildOrSource),
        compliment,
      });

  const desc = [
    t('daily.descClaimed', guildOrSource),
    '',
    t('daily.summaryTitle', guildOrSource),
    collectedLine,
    t('daily.streakLine', guildOrSource, { streak: result.streak, compliment }),
    t('daily.balance', guildOrSource, { balance: formatCoins(result.balance, guildOrSource) }),
    ...(result.magicBeanBonus ? [t('daily.magicBean', guildOrSource, { total: result.magicBeans })] : []),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold || '#facc15')
    .setTitle(t('daily.titleClaimed', guildOrSource))
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(t('daily.footer', guildOrSource)) })
    .setTimestamp();

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('daily.btnWebBonus', guildOrSource))
      .setStyle(ButtonStyle.Link)
      .setURL(bonusSession.url)
      .setEmoji('🎁')
  );

  return { embeds: [embed], components: [buttonRow] };
}

module.exports = {
  name: DAILY,
  aliases: ['daily', 'diario', 'py-diario', 'diaria', 'py-daily'],
  buildDailyView,
  data: new SlashCommandBuilder()
    .setName(DAILY)
    .setDescription('Claim daily coins and maintain your streak.')
    .setDescriptionLocalizations({
      'pt-BR': 'Resgate moedas diárias e mantenha sua sequência.',
    }),
  async executePrefix({ message, client }) {
    const view = buildDailyView(message.author.id, message, client?.user?.id);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildDailyView(interaction.user.id, interaction, interaction.client?.user?.id);
    await interaction.editReply(view);
  },
};