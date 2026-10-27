const pyMarket = require('./commands/pyMarket');
const market = require('../../services/market');

/**
 * Módulo Mercado (Cog Pattern): compra e venda entre jogadores com garantia, taxa de 5% que
 * sai da economia e histórico de preços (também no site, em /mercado). Faz parte do Mundo
 * Pyxie (some no modo clássico). Estado em data/market.json.
 */
module.exports = {
  id: 'market',
  // Exclusivo do servidor oficial (plano D5): comandos registrados só em CRINGELANDIA_GUILD_ID.
  guildScope: [require('../../config/scopes').CRINGELANDIA_GUILD_ID],
  name: {
    'pt-BR': 'Mercado entre Jogadores',
    en: 'Player Market',
  },
  description: {
    'pt-BR': 'Compra e venda de itens e materiais entre jogadores, com garantia, taxa de 5% e histórico de preços.',
    en: 'Players buy and sell items and materials with escrow, a 5% fee and price history.',
  },
  category: 'economia',
  icon: '🏪',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyMarket],

  async onLoad(ctx) {
    if (!ctx.client) return;
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyMarket.isMarketInteraction(interaction)) return;
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      if (await require('../../commands/setup').denyInteractionIfBlocked(interaction, 'py-market')) return;
      try {
        await pyMarket.handleMarketInteraction(interaction);
      } catch (err) {
        console.error('[market] Erro ao processar interação:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('market.reasons.save', getLanguage(interaction)), flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    });

    // Anúncios vencidos (7 dias) voltam para quem anunciou
    ctx.registerInterval(() => {
      try {
        market.expireListings();
      } catch (err) {
        console.warn('[market] Falha ao vencer anúncios:', err.message);
      }
    }, 10 * 60 * 1000);
  },

  getStatus() {
    return market.getMarketStats();
  },
};
