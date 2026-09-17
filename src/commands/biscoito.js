const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { COOKIE } = require('./commandNames');
const { getCookieStatus, claimCookie } = require('../services/cookie');
const { createBonusSession } = require('../services/bonusTimer');
const { formatRemaining, getLanguage } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

function buildCookieView(userId, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const status = getCookieStatus(userId);

  if (!status.canOpen) {
    const bonusSession = createBonusSession(userId, 'cookie_bonus');

    const cooldownTitle = isEn ? '⏳ ✦ Cookie Already Opened Today' : '⏳ ✦ Biscoito Já Quebrado Hoje';
    const cooldownDesc = isEn
      ? `You have already cracked your daily fortune cookie! The next one will be fresh in **${formatRemaining(status.timeRemainingMs, 'en')}**.\n\n` +
        `✨ **Want to open an extra cookie right now?**\n` +
        `Visit our sponsored web portal, wait 10 seconds, and earn **1 Extra Cookie 🥠** + **100 Coins 💰** + **1 Hourglass ⏳**!`
      : `Você já quebrou o seu biscoito da sorte diário! O próximo estará fresquinho em **${formatRemaining(status.timeRemainingMs)}**.\n\n` +
        `✨ **Quer quebrar um biscoito extra agora?**\n` +
        `Acesse nosso portal patrocinado, aguarde 10 segundos e ganhe **1 Biscoito Extra 🥠** + **100 Moedas 💰** + **1 Ampulheta ⏳**!`;

    const cooldownEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.purple)
      .setTitle(cooldownTitle)
      .setDescription(cooldownDesc)
      .setFooter({ text: isEn ? 'Daily Fortune Cookie' : 'Biscoito da Sorte Diário' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(isEn ? '✨ Open Extra Cookie (10s Web)' : '✨ Abrir Biscoito Extra (10s Web)')
        .setStyle(ButtonStyle.Link)
        .setURL(bonusSession.url)
    );

    return { embeds: [cooldownEmbed], components: [row] };
  }

  const result = claimCookie(userId, lang);

  const title = isEn ? '🥠 ✦ Magical Fortune Cookie' : '🥠 ✦ Biscoito da Sorte Mágico';
  const intro = isEn
    ? `*You crack open the crispy shell and find a scented golden scroll:*\n\n> 📜 **"${result.wisdom}"**\n`
    : `*Você quebra a casquinha crocante e encontra um pequeno pergaminho perfumado:*\n\n> 📜 **"${result.wisdom}"**\n`;

  const luckyNumbersTitle = isEn ? '🍀 Your Lucky Numbers Today' : '🍀 Seus Números da Sorte de Hoje';
  const footerText = isEn
    ? (result.remainingExtra > 0 ? `You still have ${result.remainingExtra} extra cookie(s)!` : 'Come back tomorrow for more cosmic wisdom')
    : (result.remainingExtra > 0 ? `Você ainda tem ${result.remainingExtra} biscoito(s) extra(s)!` : 'Volte amanhã para mais sabedoria cósmica');

  const embed = new EmbedBuilder()
    .setColor('#facc15')
    .setTitle(title)
    .setDescription(intro)
    .addFields(
      {
        name: luckyNumbersTitle,
        value: `\`${result.luckyNumbers.map((n) => String(n).padStart(2, '0')).join(' • ')}\``,
        inline: false,
      }
    )
    .setFooter({ text: footerText })
    .setTimestamp();

  if (result.hasPrize) {
    embed.addFields({
      name: isEn ? '🎉 Golden Winning Ticket!' : '🎉 Bilhete Dourado Premiado!',
      value: isEn
        ? `✨ You found **+${result.rewardCoins} Coins 💰** baked inside the cookie!`
        : `✨ Você encontrou **+${result.rewardCoins} Moedas 💰** escondidas na massa do biscoito!`,
      inline: false,
    });
  }

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
