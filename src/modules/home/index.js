const pyHome = require('./commands/pyHome');
const pyLoja = require('./commands/pyLoja');
const store = require('./homeStore');

/**
 * Módulo Casinha da Pyxie (Cog Pattern): quarto em pixel art para decorar.
 *
 * - Móveis, decoração de parede, tapetes, pets, papéis de parede e pisos (arte CC0, ver
 *   assets/home/CREDITS.md), com conjuntos temáticos.
 * - py!loja (nov/2026): o catálogo inteiro à venda por moedinhas, sem raridade nem rotação diária.
 *   A casinha também sai por moedinhas. A oficina (/py-craft) e a chave grátis da dungeon saíram.
 * - Charme: pontuação de beleza (variedade, conjuntos, luz, pets, curtidas) e ranking.
 * - Visitas e curtidas (1 por visitante por dia). Luz do quarto segue o horário de Brasília.
 * - Itens ficam no cofre (src/services/itemVault.js), compartilhado com as conquistas.
 */
module.exports = {
  id: 'home',
  // Exclusivo do servidor oficial (plano D5): comandos registrados só em CRINGELANDIA_GUILD_ID.
  guildScope: [require('../../config/scopes').CRINGELANDIA_GUILD_ID],
  name: {
    'pt-BR': 'Casinha da Pyxie',
    en: "Pyxie's Cozy Room",
  },
  description: {
    'pt-BR': 'Quarto em pixel art: compre qualquer móvel ou pet na py!loja com moedinhas, decore, receba visitas e suba no ranking de Charme.',
    en: 'Pixel art room: buy any furniture or pet in the py!loja with coins, decorate, get visitors and climb the Charm ranking.',
  },
  category: 'economia',
  icon: '🏡',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyHome, pyLoja],

  async onLoad(ctx) {
    if (!ctx.client) return;

    // py!loja: escolher tipo, paginar e comprar
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyLoja.isLojaInteraction(interaction)) return;
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      if (await require('../../commands/setup').denyInteractionIfBlocked(interaction, 'py-loja')) return;
      try {
        await pyLoja.handleLojaInteraction(interaction);
      } catch (err) {
        console.error('[home] Erro na loja:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('loja.reasons.generic', getLanguage(interaction)), flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    });

    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyHome.isHomeInteraction(interaction)) return;
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      // Servidor no modo clássico ou canal não liberado no /py-setup
      if (await require('../../commands/setup').denyInteractionIfBlocked(interaction, 'py-home')) return;
      try {
        await pyHome.handleHomeInteraction(interaction);
      } catch (err) {
        console.error('[home] Erro ao processar interação:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('home.errors.save', { lang: getLanguage(interaction) }), flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    });

    // Aquece o cache de sprites para o primeiro clique não pagar o carregamento das folhas
    ctx.registerTimeout(async () => {
      try {
        const { renderHome } = require('./homeRenderer');
        await renderHome({ wallpaper: 'wp_cream', flooring: 'fl_oak', placements: [] }, { text: {} });
      } catch (err) {
        console.warn('[home] Aquecimento do renderizador falhou:', err.message);
      }
    }, 2000);
  },

  onUnload() {
    pyHome._sessions.clear();
  },

  getStatus() {
    return store.getHomeStats();
  },
};
