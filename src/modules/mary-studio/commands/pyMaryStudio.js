const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const securityGuard = require('../utils/securityGuard');
const { getLanguage, t } = require('../../../utils/i18n');
const maryStudioManager = require('../maryStudioManager');

const name = 'py-mary';
const aliases = ['mary', 'py-mary', 'estudio-mary', 'mary-studio'];

function buildQuickHubView(userId, source) {
  const isAuth = securityGuard.isAuthorizedUser(userId);
  if (!isAuth) {
    return {
      content: t('mary.access_denied', source),
      ephemeral: true,
    };
  }

  const magic = securityGuard.createMagicLink(userId);
  const config = maryStudioManager.loadConfig();

  let statusBadge = '🟢 Online (Pronta para entregar)';
  if (config.statusLoja === 'fila') statusBadge = '🟡 Fila de Pedidos';
  if (config.statusLoja === 'offline') statusBadge = '🔴 Lojinha Fechada';

  const embed = new EmbedBuilder()
    .setColor('#ec4899')
    .setTitle(t('mary.hub_title', source))
    .setDescription(
      t('mary.hub_desc', source, {
        status: statusBadge,
        estoque: (Number(config.estoqueRobux) || 0).toLocaleString('pt-BR'),
        preco: (Number(config.preco1k) || 37.0).toFixed(2).replace('.', ','),
      })
    )
    .setFooter({ text: '🎀 Mary Store • Central Administrativa Exclusiva' })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('mary.btn_open_web', source))
      .setEmoji('🌐')
      .setStyle(ButtonStyle.Link)
      .setURL(magic.url),
    new ButtonBuilder()
      .setCustomId('mary_quick:status')
      .setLabel(t('mary.btn_toggle_status', source))
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('mary_quick:stock_modal')
      .setLabel(t('mary.btn_update_stock', source))
      .setEmoji('💎')
      .setStyle(ButtonStyle.Success)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('mary_quick:send_dm')
      .setLabel(t('mary.btn_pin_dm', source))
      .setEmoji('📩')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('mary_quick:logout_all')
      .setLabel(t('mary.btn_logout_all', source))
      .setEmoji('🚨')
      .setStyle(ButtonStyle.Danger)
  );

  return {
    embeds: [embed],
    components: [row1, row2],
    ephemeral: true,
  };
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription("Open Mary's private studio panel and store management hub.")
    .setDescriptionLocalizations({
      'pt-BR': 'Abra o estúdio privado e central de lojinha de Robux da Mary.',
    }),

  async executeSlash({ interaction }) {
    await interaction.reply(buildQuickHubView(interaction.user.id, interaction));
  },

  async executePrefix({ message }) {
    const isAuth = securityGuard.isAuthorizedUser(message.author.id);
    if (!isAuth) {
      return message.reply({ content: t('mary.access_denied', message) });
    }

    // Na mensagem de prefixo em canal público, por privacidade, envia na DM da Mary
    const view = buildQuickHubView(message.author.id, message);
    try {
      await message.author.send(view);
      if (message.channel && message.channel.type !== 1) {
        await message.reply({
          content: '🔒 **Seu acesso ao Estúdio da Mary foi enviado diretamente no seu privado (DM)!**',
        });
      }
    } catch (_) {
      await message.reply({
        content: '❌ Não consegui enviar mensagem na sua DM. Por favor, libere suas mensagens diretas ou use o comando slash `/py-mary`!',
      });
    }
  },

  buildQuickHubView,
};

