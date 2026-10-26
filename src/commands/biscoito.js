const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { COOKIE } = require('./commandNames');
const { getCookieStatus, claimCookie } = require('../services/cookie');
const { createBonusSession, COOKIE_BONUS_COINS } = require('../services/bonusTimer');
const { formatRemaining, getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const coinIcon = () => require('../utils/appEmojis').getEmoji('COIN') || '🪙';

function buildCookieView(userId, source = null) {
  const lang = getLanguage(source);
  const status = getCookieStatus(userId);

  if (!status.canOpen) {
    const bonusSession = createBonusSession(userId, 'cookie_bonus', {}, lang);
    const cooldownEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.purple || '#9b5de5')
      .setTitle(t('cookie.cooldownTitle', lang))
      .setDescription(
        [
          t('cookie.cooldownBody', lang, { time: formatRemaining(status.timeRemainingMs, lang) }),
          t('cookie.cooldownExtraHeader', lang),
          t('cookie.cooldownExtraBody', lang, { coins: COOKIE_BONUS_COINS, coin: coinIcon() }),
        ].join('\n\n')
      )
      .setFooter({ text: t('cookie.cooldownFooter', lang) });

    const { getEmoji } = require('../utils/appEmojis');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(t('cookie.btnExtra', lang))
        .setEmoji(getEmoji('SPARKLES'))
        .setStyle(ButtonStyle.Link)
        .setURL(bonusSession.url)
    );

    return { embeds: [cooldownEmbed], components: [row] };
  }

  const result = claimCookie(userId, lang);
  const lucky = result.fortuneType === 'positive';
  const embed = new EmbedBuilder()
    .setColor(lucky ? '#22c55e' : '#ef4444')
    .setTitle(t('cookie.title', lang))
    .setDescription(
      [
        t('cookie.intro', lang),
        t('cookie.wisdom', lang, { wisdom: result.wisdom }),
        t(lucky ? 'cookie.goodHeader' : 'cookie.badHeader', lang),
        t(lucky ? 'cookie.goodBody' : 'cookie.badBody', lang, { coins: Math.abs(Number(result.coinsChange) || 0), coin: coinIcon() }),
      ].join('\n\n')
    )
    .setFooter({
      text: result.remainingExtra > 0
        ? t('cookie.footerExtra', lang, { count: result.remainingExtra })
        : t('cookie.footerTomorrow', lang),
    });

  return { embeds: [embed], components: [] };
}

module.exports = {
  name: COOKIE,
  aliases: ['biscoito', 'py-biscoito', 'sorte', 'py-sorte', 'cookie'],
  data: new SlashCommandBuilder()
    .setName(COOKIE)
    .setDescription('Crack open your daily magical fortune cookie for wisdom, lucky numbers, and prizes.')
    .setDescriptionLocalizations({
      'pt-BR': 'Quebre seu biscoito da sorte diário para receber sabedoria, números da sorte e prêmios.',
    }),
  async executePrefix({ message }) {
    const view = buildCookieView(message.author.id, message);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildCookieView(interaction.user.id, interaction);
    await interaction.editReply(view);
  },
};
