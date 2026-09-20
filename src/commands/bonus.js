const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createBonusSession } = require('../services/bonusTimer');
const { BONUS } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { getLanguage, t } = require('../utils/i18n');

function buildBonusEmbed(userId, sessionUrl, source = null) {
  const isEn = getLanguage(source) === 'en';

  const desc = isEn
    ? [
        '✨ **Claim your Free Web Bonus (10s)!**',
        '',
        'Click the button below to open your personalized bonus link. After waiting **10 seconds** on the web page, you will automatically receive:',
        '',
        '> 🪙 **+200 Coins** added directly to your account',
        '> 🌱 **+1 Magic Bean** to customize your profile themes',
        '> 📦 **1x Rustic Mystery Chest** stored in your backpack (`/py-inventory`)',
        '',
        '🔒 *Your link is securely signed and valid for 15 minutes.*',
      ].join('\n')
    : [
        '✨ **Resgate seu Bônus Web Gratuito (10s)!**',
        '',
        'Clique no botão abaixo para abrir seu link exclusivo. Ao aguardar **10 segundos** na página, você receberá automaticamente:',
        '',
        '> 🪙 **+200 Moedas** creditadas na sua conta',
        '> 🌱 **+1 Feijão Mágico** para comprar temas no perfil',
        '> 📦 **1x Baú Rústico Misterioso** guardado na mochila (`/py-inventario`)',
        '',
        '🔒 *Seu link é seguro, pessoal e válido por 15 minutos.*',
      ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold || '#facc15')
    .setTitle(isEn ? '🎁  ✦  Pyxie Magic Bonus & Rewards' : '🎁  ✦  Bônus Mágico & Recompensas da Pyxie')
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(isEn ? 'Rewards sponsored by Monetag' : 'Recompensas patrocinadas com amor') })
    .setTimestamp();

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(isEn ? '⚡ Open 10s Bonus Page' : '⚡ Abrir Página de Bônus (10s)')
      .setURL(sessionUrl)
      .setStyle(ButtonStyle.Link)
      .setEmoji('🎁')
  );

  return { embeds: [embed], components: [buttonRow] };
}

module.exports = {
  name: BONUS,
  aliases: ['bonus', 'recompensa', 'py-bonus', 'py-recompensa', 'patrocinio', 'reward'],
  buildBonusEmbed,
  data: new SlashCommandBuilder()
    .setName(BONUS)
    .setDescription('Claim free Coins, Magic Beans, and Mystery Chests via a 10s sponsored link.')
    .setDescriptionLocalizations({
      'pt-BR': 'Resgata Moedas, Feijões Mágicos e Baús Misteriosos gratuitos através do link de 10s.',
    }),
  async executeSlash({ interaction }) {
    const lang = getLanguage(interaction);
    const session = createBonusSession(interaction.user.id, 'item_bonus', {}, lang);
    const view = buildBonusEmbed(interaction.user.id, session.url, interaction);
    await interaction.editReply(view);
  },
  async executePrefix({ message }) {
    const lang = getLanguage(message);
    const session = createBonusSession(message.author.id, 'item_bonus', {}, lang);
    const view = buildBonusEmbed(message.author.id, session.url, message);
    await message.reply(view);
  },
};

