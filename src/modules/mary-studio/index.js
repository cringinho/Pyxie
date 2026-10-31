const maryStudioManager = require('./maryStudioManager');
const maryDashboard = require('./maryDashboard');
const buttonActionHandler = require('./handlers/buttonActionHandler');
const ticketHandler = require('./handlers/ticketHandler');
const reviewHandler = require('./handlers/reviewHandler');
const stickyAndFaqHandler = require('./handlers/stickyAndFaqHandler');
const giveawayHandler = require('./handlers/giveawayHandler');
const pyMaryStudioCmd = require('./commands/pyMaryStudio');
const pyMaryEditContextCmd = require('./commands/pyMaryEditContext');
const pyGamepassCmd = require('./commands/pyGamepass');
const storefront = require('./storefront');
const storeAlerts = require('./storeAlerts');
const securityGuard = require('./utils/securityGuard');
const { canUseStore } = require('./storeAccess');
const { MARY_GUILD_ID } = require('../../config/scopes');
const { getLanguage, t } = require('../../utils/i18n');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const NEXT_STATUS = { online: 'fila', fila: 'offline', offline: 'online' };

// Atalhos da central do /py-mary (status, estoque e o link do painel na DM).
async function handleQuickInteraction(interaction) {
  if (interaction.isButton() && interaction.customId.startsWith('mary_quick:')) {
    if (!securityGuard.isAuthorizedUser(interaction.user.id)) {
      return interaction.reply({ content: t('mary.access_denied', interaction), ephemeral: true });
    }
    const action = interaction.customId.replace('mary_quick:', '');

    if (action === 'status') {
      const cfg = maryStudioManager.loadConfig();
      cfg.statusLoja = NEXT_STATUS[cfg.statusLoja] || 'fila';
      maryStudioManager.saveConfig(cfg);
      const status = pyMaryStudioCmd.statusLabel(cfg.statusLoja, interaction);
      return interaction.reply({ content: t('mary.status_updated', interaction, { status }), ephemeral: true });
    }

    if (action === 'stock_modal') {
      const cfg = maryStudioManager.loadConfig();
      const modal = new ModalBuilder().setCustomId('mary_quick_modal:stock').setTitle(t('mary.stock_modal_title', interaction));
      const stockInput = new TextInputBuilder()
        .setCustomId('stock_val')
        .setLabel(t('mary.stock_label', interaction))
        .setValue(String(cfg.estoqueRobux ?? 25000))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      const priceInput = new TextInputBuilder()
        .setCustomId('price_val')
        .setLabel(t('mary.price_label', interaction))
        .setValue(String(cfg.preco1k || 37.0))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(stockInput), new ActionRowBuilder().addComponents(priceInput));
      return interaction.showModal(modal);
    }

    if (action === 'send_dm') {
      const dmEmbed = new EmbedBuilder()
        .setColor('#ec4899')
        .setTitle(t('mary.dm_title', interaction))
        .setDescription(t('mary.dm_desc', interaction))
        .setFooter({ text: t('mary.footer', interaction) });
      const dmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(t('mary.btn_open_web', interaction))
          .setEmoji('🌐')
          .setStyle(ButtonStyle.Link)
          .setURL(maryDashboard.dashboardUrl(MARY_GUILD_ID, 'maryStore'))
      );
      const sent = await interaction.user.send({ embeds: [dmEmbed], components: [dmRow] }).then(() => true).catch(() => false);
      return interaction.reply({ content: t(sent ? 'mary.dm_sent' : 'mary.dm_failed', interaction), ephemeral: true });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'mary_quick_modal:stock') {
    if (!securityGuard.isAuthorizedUser(interaction.user.id)) {
      return interaction.reply({ content: t('mary.access_denied', interaction), ephemeral: true });
    }
    const stockNum = parseInt(interaction.fields.getTextInputValue('stock_val').replace(/\D/g, ''), 10) || 0;
    const priceNum = parseFloat(interaction.fields.getTextInputValue('price_val').replace(',', '.')) || 37.0;
    const cfg = maryStudioManager.loadConfig();
    cfg.estoqueRobux = stockNum;
    cfg.preco1k = priceNum;
    maryStudioManager.saveConfig(cfg);
    return interaction.reply({
      content: t('mary.stock_updated', interaction, { stock: stockNum.toLocaleString('pt-BR'), price: priceNum.toFixed(2).replace('.', ',') }),
      ephemeral: true,
    });
  }
  return undefined;
}

// Vitrine pública da lojinha: o cliente escolhe o pacote no menu, confirma na ficha e recebe
// o código na hora. Vale na zona Mary e em qualquer servidor com o extra `lojinha` ativo.
const REASON_KEY = {
  repeat: 'storeOps.alreadyBought',
  sold_out: 'storeOps.soldOut',
  not_found: 'storeOps.unavailable',
  inactive: 'storeOps.unavailable',
};

async function handleStorefrontInteraction(interaction) {
  const guildId = interaction.guildId;
  if (!guildId || !canUseStore(guildId)) return undefined;
  const lang = getLanguage(guildId);

  if (interaction.isStringSelectMenu() && interaction.customId === storefront.PANEL_ID) {
    const productId = (interaction.values && interaction.values[0]) || '';
    const view = storefront.buildProduct(guildId, productId, { lang });
    if (!view) return interaction.reply({ content: t('storeOps.unavailable', lang), ephemeral: true });
    return interaction.reply({ ...view, ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === storefront.BACK_ID) {
    const panel = storefront.buildPanel(guildId, { lang, guildName: interaction.guild?.name || '' });
    return interaction.reply({ ...panel, ephemeral: true });
  }

  if (!(interaction.isButton() && storefront.isBuy(interaction.customId))) return undefined;

  const productId = storefront.productIdOf(interaction.customId);
  const result = storefront.purchase(guildId, productId, { buyerId: interaction.user.id });
  if (!result.ok) {
    const key = REASON_KEY[result.reason] || 'storeOps.error';
    return interaction.reply({ content: t(key, lang), ephemeral: true });
  }

  const order = result.order;
  const embed = storefront.receipt(order, { lang });

  // O código vai por DM (fica guardado); se a DM estiver fechada, o efêmero ainda mostra tudo.
  if (order.delivery !== 'manual') {
    await interaction.user.send({ embeds: [embed] }).catch(() => null);
  } else {
    // Entrega manual: o dono recebe o pedido na hora e confirma no painel.
    const owner = await interaction.guild?.fetchOwner?.().catch(() => null);
    if (owner?.send) {
      await owner
        .send({
          embeds: [
            storefront.ownerNotice(order, {
              lang,
              guildId,
              buyer: interaction.user.tag || interaction.user.username || order.buyerId,
            }),
          ],
          allowedMentions: { parse: [], users: [], roles: [] },
        })
        .catch(() => null);
    }
  }

  return interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = {
  id: 'mary-studio',
  name: {
    'pt-BR': 'Estúdio & Central da Mary',
    en: "Mary's Studio & Hub",
  },
  description: {
    'pt-BR': 'Lojinha de Robux da Mary: tickets, avaliações, calculadora, sorteios e telas no painel (/dashboard).',
    en: "Mary's Robux store: tickets, reviews, calculator, giveaways and screens in the dashboard (/dashboard).",
  },
  category: 'utilidades',
  icon: '🎀',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyMaryStudioCmd, pyMaryEditContextCmd, pyGamepassCmd],

  // Peças exportadas para teste (a vitrine não depende de um cliente do Discord).
  storefront,
  storeAlerts,
  storefrontInteraction: handleStorefrontInteraction,

  async onLoad(ctx) {
    maryStudioManager.buttonActionHandler = buttonActionHandler;
    maryStudioManager.ticketHandler = ticketHandler;
    maryStudioManager.reviewHandler = reviewHandler;
    maryStudioManager.stickyAndFaqHandler = stickyAndFaqHandler;
    maryStudioManager.giveawayHandler = giveawayHandler;

    maryStudioManager.init(ctx.client || null, ctx);

    // Mensagens do estúdio antigo vão para o estúdio do painel (uma vez; só o processo do bot grava).
    if (ctx.isBotProcess) {
      try {
        const moved = maryDashboard.migrateLegacyMessages(MARY_GUILD_ID);
        if (moved) console.log(`[MaryStudio] ${moved} mensagem(ns) do estúdio antigo levada(s) para o painel.`);
      } catch (err) {
        console.error('[MaryStudio] Falha ao levar as mensagens antigas para o painel:', err);
      }
    }

    if (typeof ctx.registerListener === 'function') {
      ctx.registerListener('interactionCreate', async (interaction) => {
        try {
          await handleQuickInteraction(interaction);
        } catch (e) {
          console.error('[MaryStudio] Erro na interação rápida:', e);
        }
      });
      // Vitrine da lojinha (menu + compra). Separado da central: uma falha aqui não derruba a outra.
      ctx.registerListener('interactionCreate', async (interaction) => {
        try {
          await handleStorefrontInteraction(interaction);
        } catch (e) {
          console.error('[MaryStudio] Erro na vitrine:', e);
        }
      });
    }

    // Estoque baixo: DM ao dono, uma vez por dia por produto (o dado já existia, faltava o aviso).
    if (ctx.isBotProcess) {
      const alertCycle = () =>
        storeAlerts.scan(ctx.client || null, {}).catch((err) => console.error('[MaryStudio] Alerta de estoque:', err));
      if (typeof ctx.registerInterval === 'function') ctx.registerInterval(alertCycle, 6 * 60 * 60 * 1000);
      if (typeof ctx.registerTimeout === 'function') ctx.registerTimeout(alertCycle, 3 * 60 * 1000);
    }
  },

  async onUnload() {
    maryStudioManager.stop();
  },

  // Só a pasta de imagens (/api/mary/media): as telas estão no /dashboard.
  setupWebRoutes(app) {
    maryStudioManager.setupWebRoutes(app);
  },
};

