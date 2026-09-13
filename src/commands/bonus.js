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
        '> ⏳ **1x Magic Hourglass (2h)** (`ampulheta_tempo_2h`)',
        '> *Use anytime in `/py-inventory` or Chocadeira to speed up eggs by 2 hours!*',
        '> 🪙 **+150 Coins** added directly to your account',
        '',
        '🔒 *Your link is securely signed and valid for 15 minutes.*',
      ].join('\n')
    : [
        '✨ **Resgate seu Bônus Web Gratuito (10s)!**',
        '',
        'Clique no botão abaixo para abrir seu link exclusivo. Ao aguardar **10 segundos** na página, você receberá automaticamente:',
        '',
        '> ⏳ **1x Ampulheta Mágica (2h)** (`ampulheta_tempo_2h`)',
        '> *Guarde na mochila (`/py-inventory`) para acelerar qualquer ovo na chocadeira quando quiser!*',
        '> 🪙 **+150 Moedas** creditadas na sua conta',
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
    .setDescription('Claim free Magic Hourglasses and Coins via a 10s sponsored link.')
    .setDescriptionLocalizations({
      'pt-BR': 'Resgata Ampulhetas Mágicas e Moedas gratuitas através do link de 10s.',
    }),
  async executeSlash({ interaction }) {
    const session = createBonusSession(interaction.user.id, 'item_bonus');
    const view = buildBonusEmbed(interaction.user.id, session.url, interaction);
    await interaction.editReply(view);
  },
  async executePrefix({ message }) {
    const session = createBonusSession(message.author.id, 'item_bonus');
    const view = buildBonusEmbed(message.author.id, session.url, message);
    await message.reply(view);
  },
};
