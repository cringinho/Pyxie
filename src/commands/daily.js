const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { claimDaily } = require('../services/economy');
const { getVoteUrl } = require('../services/topgg');
const { createBonusSession } = require('../services/bonusTimer');
const { t, getLanguage, formatCoins, formatRemaining } = require('../utils/i18n');
const { DAILY } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

function isWeekend() {
  const now = new Date();
  const brDateStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const day = new Date(brDateStr).getDay();
  return day === 0 || day === 6;
}

function buildDailyView(userId, guildOrSource = null, clientId = null) {
  const result = claimDaily(userId);
  const lang = getLanguage(guildOrSource);
  const weekend = isWeekend();
  const bonusSession = createBonusSession(userId, 'item_bonus', {}, lang);
  const isTopggEnabled = Boolean(process.env.TOPGG_ENABLED === 'true');
  const voteUrl = getVoteUrl(clientId);

  const extraSection = isTopggEnabled
    ? (weekend ? t('daily.voteWeekendBonus', guildOrSource) : t('daily.voteWeekdayBonus', guildOrSource))
    : t('daily.webBonusTitle', guildOrSource);

  if (!result.claimed) {
    const desc = [
      t('daily.descCooldown', guildOrSource, { time: formatRemaining(result.remainingMs, guildOrSource) }),
      '',
      extraSection,
      ...(isTopggEnabled ? ['', t('vote.cta', guildOrSource)] : []),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.violet || '#8b5cf6')
      .setTitle(t('daily.titleCooldown', guildOrSource))
      .setDescription(desc)
      .setFooter({ text: pyxieFooter(isTopggEnabled ? t('daily.footerCooldown', guildOrSource) : t('daily.footerWebBonus', guildOrSource)) })
      .setTimestamp();

    const buttons = [];
    if (isTopggEnabled) {
      buttons.push(
        new ButtonBuilder()
          .setLabel(t('daily.btnLabelCooldown', guildOrSource))
          .setEmoji('🗳️')
          .setStyle(ButtonStyle.Link)
          .setURL(voteUrl)
      );
    }
    buttons.push(
      new ButtonBuilder()
        .setLabel(t('daily.btnWebBonus', guildOrSource))
        .setStyle(ButtonStyle.Link)
        .setURL(bonusSession.url)
        .setEmoji('🎁')
    );

    const row = new ActionRowBuilder().addComponents(buttons);
    return { embeds: [embed], components: [row] };
  }

  const desc = [
    t('daily.descClaimed', guildOrSource),
    '',
    t('daily.summaryTitle', guildOrSource),
    t('daily.collected', guildOrSource, { amount: formatCoins(result.amount, guildOrSource) }),
    t('daily.balance', guildOrSource, { balance: formatCoins(result.balance, guildOrSource) }),
    ...(result.magicBeanBonus ? [t('daily.magicBean', guildOrSource, { total: result.magicBeans })] : []),
    '',
    extraSection,
    ...(isTopggEnabled ? ['', t('vote.cta', guildOrSource)] : []),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold || '#facc15')
    .setTitle(t('daily.titleClaimed', guildOrSource))
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(isTopggEnabled ? t('daily.footer', guildOrSource) : t('daily.footerWebBonus', guildOrSource)) })
    .setTimestamp();

  const buttons = [];
  if (isTopggEnabled) {
    buttons.push(
      new ButtonBuilder()
        .setLabel(t('daily.btnLabel', guildOrSource))
        .setEmoji('🗳️')
        .setStyle(ButtonStyle.Link)
        .setURL(voteUrl)
    );
  }
  buttons.push(
    new ButtonBuilder()
      .setLabel(t('daily.btnWebBonus', guildOrSource))
      .setStyle(ButtonStyle.Link)
      .setURL(bonusSession.url)
      .setEmoji('🎁')
  );

  const buttonRow = new ActionRowBuilder().addComponents(buttons);
  return { embeds: [embed], components: [buttonRow] };
}

module.exports = {
  name: DAILY,
  aliases: ['daily', 'diario', 'py-diario', 'diaria', 'py-daily'],
  buildDailyView,
  data: new SlashCommandBuilder()
    .setName(DAILY)
    .setDescription('Claim daily coins & unlock Top.gg voting bonus.')
    .setDescriptionLocalizations({
      'pt-BR': 'Resgate moedas diárias e desbloqueie bônus no Top.gg.',
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