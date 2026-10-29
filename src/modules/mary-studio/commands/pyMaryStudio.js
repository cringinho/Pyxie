const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const securityGuard = require('../utils/securityGuard');
const { t } = require('../../../utils/i18n');
const maryStudioManager = require('../maryStudioManager');
const maryDashboard = require('../maryDashboard');
const { MARY_GUILD_ID } = require('../../../config/scopes');

const name = 'py-mary';
const aliases = ['mary', 'py-mary', 'estudio-mary', 'mary-studio'];

function statusLabel(statusLoja, source) {
  if (statusLoja === 'fila') return t('mary.status_queue', source);
  if (statusLoja === 'offline') return t('mary.status_offline', source);
  return t('mary.status_online', source);
}

// Central rápida: status, estoque e o link do painel (o login com Discord do /dashboard protege o resto).
function buildQuickHubView(userId, source) {
  if (!securityGuard.isAuthorizedUser(userId)) {
    return { content: t('mary.access_denied', source), ephemeral: true };
  }

  const config = maryStudioManager.loadConfig();

  let desc = t('mary.hub_desc', source, {
    status: statusLabel(config.statusLoja, source),
    estoque: (Number(config.estoqueRobux) || 0).toLocaleString('pt-BR'),
    preco: (Number(config.preco1k) || 37.0).toFixed(2).replace('.', ','),
  });
  if (config.localBio) desc += `\n\n${t('mary.hub_about', source, { bio: config.localBio })}`;

  const embed = new EmbedBuilder()
    .setColor('#ec4899')
    .setTitle(t('mary.hub_title', source))
    .setDescription(desc)
    .setFooter({ text: t('mary.footer', source) });

  if (/^https:\/\//.test(config.localAvatarUrl || '')) embed.setThumbnail(config.localAvatarUrl);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('mary.btn_open_web', source))
      .setEmoji('🌐')
      .setStyle(ButtonStyle.Link)
      .setURL(maryDashboard.dashboardUrl(MARY_GUILD_ID, 'maryStore')),
    new ButtonBuilder()
      .setCustomId('mary_quick:status')
      .setLabel(t('mary.btn_toggle_status', source))
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('mary_quick:stock_modal')
      .setLabel(t('mary.btn_update_stock', source))
      .setEmoji('💎')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('mary_quick:send_dm')
      .setLabel(t('mary.btn_pin_dm', source))
      .setEmoji('📩')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row], ephemeral: true };
}

module.exports = {
  // Zona da Mary (plano 5.1): registrado e usado só no servidor dela.
  guildScope: [MARY_GUILD_ID],
  name,
  aliases,
  category: 'utilidades',
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription("Open Mary's store hub and the link to her dashboard.")
    .setDescriptionLocalizations({
      'pt-BR': 'Abra a central da lojinha da Mary e o link do painel dela.',
    }),

  async executeSlash({ interaction }) {
    await interaction.reply(buildQuickHubView(interaction.user.id, interaction));
  },

  async executePrefix({ message }) {
    if (!securityGuard.isAuthorizedUser(message.author.id)) {
      return message.reply({ content: t('mary.access_denied', message) });
    }

    // Em canal público, por privacidade, a central vai na DM da Mary.
    const { ephemeral, ...view } = buildQuickHubView(message.author.id, message);
    try {
      await message.author.send(view);
      if (message.channel && message.channel.type !== 1) {
        await message.reply({ content: t('mary.prefix_sent', message) });
      }
    } catch (_) {
      await message.reply({ content: t('mary.dm_failed', message) });
    }
  },

  buildQuickHubView,
  statusLabel,
};
