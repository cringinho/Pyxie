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
const { formatRemaining } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

function buildCookieView(userId) {
  const status = getCookieStatus(userId);

  if (!status.canOpen) {
    const bonusSession = createBonusSession(userId, 'cookie_bonus');

    const cooldownEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.purple)
      .setTitle('⏳ ✦ Biscoito Já Quebrado Hoje')
      .setDescription(
        `Você já quebrou o seu biscoito da sorte diário! O próximo estará fresquinho em **${formatRemaining(status.timeRemainingMs)}**.\n\n` +
        `✨ **Quer quebrar um biscoito extra agora?**\n` +
        `Acesse nosso portal patrocinado, aguarde 10 segundos e ganhe **1 Biscoito Extra 🥠** + **100 Moedas 💰** + **1 Ampulheta ⏳**!`
      )
      .setFooter(pyxieFooter('Biscoito da Sorte Diário'))
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('✨ Abrir Biscoito Extra (10s Web)')
        .setStyle(ButtonStyle.Link)
        .setURL(bonusSession.url)
    );

    return { embeds: [cooldownEmbed], components: [row] };
  }

  const result = claimCookie(userId);

  const embed = new EmbedBuilder()
    .setColor('#facc15')
    .setTitle('🥠 ✦ Biscoito da Sorte Mágico')
    .setDescription(
      `*Você quebra a casquinha crocante e encontra um pequeno pergaminho perfumado:*\n\n` +
      `> 📜 **"${result.wisdom}"**\n`
    )
    .addFields(
      {
        name: '🍀 Seus Números da Sorte de Hoje',
        value: `\`${result.luckyNumbers.map((n) => String(n).padStart(2, '0')).join(' • ')}\``,
        inline: false,
      }
    )
    .setFooter(pyxieFooter(result.remainingExtra > 0 ? `Você ainda tem ${result.remainingExtra} biscoito(s) extra(s)!` : 'Volte amanhã para mais sabedoria cósmica'))
    .setTimestamp();

  if (result.hasPrize) {
    embed.addFields({
      name: '🎉 Bilhete Dourado Premiado!',
      value: `✨ Você encontrou **+${result.rewardCoins} Moedas 💰** escondidas na massa do biscoito!`,
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
    const view = buildCookieView(message.author.id);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildCookieView(interaction.user.id);
    await interaction.editReply(view);
  },
};
