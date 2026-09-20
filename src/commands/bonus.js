const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createBonusSession, getWebBonusStatus } = require('../services/bonusTimer');
const { BONUS } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { getLanguage, formatRemaining, t } = require('../utils/i18n');

function buildBonusCooldownEmbed(remainingMs, source = null) {
  const isEn = getLanguage(source) === 'en';
  const desc = isEn
    ? `⏳ You already claimed your daily web bonus today. Please wait **${formatRemaining(remainingMs, source)}** before claiming again!`
    : `⏳ Você já resgatou seu bônus diário na web hoje. Espere **${formatRemaining(remainingMs, source)}** para resgatar novamente!`;

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.violet || '#8b5cf6')
    .setTitle(isEn ? '🎁  ✦  Daily Web Bonus on Cooldown' : '🎁  ✦  Bônus Web Diário em Cooldown')
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(isEn ? 'Bonus resets every 24 hours' : 'Bônus renovado a cada 24 horas') })
    .setTimestamp();
}

function buildBonusEmbed(userId, sessionUrl, source = null) {
  const isEn = getLanguage(source) === 'en';

  const desc = isEn
    ? [
        '✨ **Claim your Free Web Bonus (10s)!**',
        '✨ **Claim your Free Daily Web Bonus (10s)!**',
        '',
        'Click the button below to open your personalized bonus link. After waiting **10 seconds** on the web page, you will automatically receive:',
        '',
        '> 🪙 **+75 Coins** added directly to your account',
        '> 🌱 **+1 Magic Bean** to customize your profile themes',
        '> 📦 **1x Rustic Mystery Chest** stored in your backpack (`/py-inventory`)',
        '',
        '🔒 *Your link is securely signed and valid for 15 minutes.*',
        '🔒 *Your link is securely signed, single-use, and valid for 15 minutes.*',
      ].join('\n')
    : [
        '✨ **Resgate seu Bônus Web Gratuito (10s)!**',
        '✨ **Resgate seu Bônus Web Diário Gratuito (10s)!**',
        '',
        'Clique no botão abaixo para abrir seu link exclusivo. Ao aguardar **10 segundos** na página, você receberá automaticamente:',
        '',
        '> 🪙 **+75 Moedas** creditadas na sua conta',
        '> 🌱 **+1 Feijão Mágico** para comprar temas no perfil',
        '> 📦 **1x Baú Rústico Misterioso** guardado na mochila (`/py-inventario`)',
        '> 🪙 **+75 Moedas** creditadas diretamente na sua conta',
        '',
        '🔒 *Seu link é seguro, pessoal e válido por 15 minutos.*',
        '🔒 *Seu link é seguro, de uso único e válido por 15 minutos.*',
      ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold || '#facc15')
    .setTitle(isEn ? '🎁  ✦  Pyxie Magic Bonus & Rewards' : '🎁  ✦  Bônus Mágico & Recompensas da Pyxie')
    .setTitle(isEn ? '🎁  ✦  Pyxie Daily Web Bonus' : '🎁  ✦  Bônus Web Diário da Pyxie')
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(isEn ? 'Rewards sponsored by Monetag (24h cooldown)' : 'Recompensa diária patrocinada (Cooldown de 24h)') })
    .setTimestamp();

  const { getEmoji } = require('../utils/appEmojis');
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(isEn ? 'Open 10s Bonus Page' : 'Abrir Página de Bônus (10s)')
      .setURL(sessionUrl)
      .setStyle(ButtonStyle.Link)
      .setEmoji(getEmoji('GIFT'))
  );

  return { embeds: [embed], components: [buttonRow] };
}

module.exports = {
  name: BONUS,
  aliases: ['bonus', 'recompensa', 'py-bonus', 'py-recompensa', 'patrocinio', 'reward'],
  buildBonusEmbed,
  buildBonusCooldownEmbed,
  data: new SlashCommandBuilder()
    .setName(BONUS)
    .setDescription('Claim 75 free daily Coins via a 10s sponsored link.')
    .setDescriptionLocalizations({
      'pt-BR': 'Resgata Moedas, Feijões Mágicos e Baús Misteriosos gratuitos através do link de 10s.',
      'pt-BR': 'Resgata 75 Moedas diárias gratuitas através do link de 10s.',
    }),
  async executeSlash({ interaction }) {
    const status = getWebBonusStatus(interaction.user.id);
    if (!status.available) {
      const cooldownEmbed = buildBonusCooldownEmbed(status.remainingMs, interaction);
      return interaction.editReply({ embeds: [cooldownEmbed], components: [] });
    }

    const lang = getLanguage(interaction);
    const session = createBonusSession(interaction.user.id, 'item_bonus', {}, lang);
    const view = buildBonusEmbed(interaction.user.id, session.url, interaction);
    await interaction.editReply(view);
  },
  async executePrefix({ message }) {
    const status = getWebBonusStatus(message.author.id);
    if (!status.available) {
      const cooldownEmbed = buildBonusCooldownEmbed(status.remainingMs, message);
      return message.reply({ embeds: [cooldownEmbed], components: [] });
    }

    const lang = getLanguage(message);
    const session = createBonusSession(message.author.id, 'item_bonus', {}, lang);
    const view = buildBonusEmbed(message.author.id, session.url, message);
    await message.reply(view);
  },
};

