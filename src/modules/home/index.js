const pyHome = require('./commands/pyHome');
const pyCraft = require('./commands/pyCraft');
const store = require('./homeStore');

/**
 * Módulo Casinha da Pyxie (Cog Pattern): quarto em pixel art para decorar.
 *
 * - Móveis, decoração de parede, tapetes, pets, papéis de parede e pisos (arte CC0, ver
 *   assets/home/CREDITS.md), com raridade, conjuntos temáticos e numeração nos lendários/míticos.
 * - Loja do dia por moedinhas (8 itens) e feijões mágicos (2 premium), girando à meia-noite BRT.
 * - Charme: pontuação de beleza (raridade, variedade, conjuntos, luz, pets, curtidas) e ranking.
 * - Visitas e curtidas (1 por visitante por dia). Luz do quarto segue o horário de Brasília.
 * - Itens ficam no cofre (src/services/itemVault.js), compartilhado com a dungeon e as conquistas.
 */
module.exports = {
  id: 'home',
  name: {
    'pt-BR': 'Casinha da Pyxie',
    en: "Pyxie's Cozy Room",
  },
  description: {
    'pt-BR': 'Quarto em pixel art: decore com móveis e pets, compre na loja do dia, receba visitas e suba no ranking de Charme.',
    en: 'Pixel art room: decorate with furniture and pets, shop the daily store, get visitors and climb the Charm ranking.',
  },
  category: 'economia',
  icon: '🏡',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyHome, pyCraft],

  async onLoad(ctx) {
    if (!ctx.client) return;

    // Oficina (/py-craft): materiais do trabalho viram móveis
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyCraft.isCraftInteraction(interaction)) return;
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      if (await require('../../commands/setup').denyInteractionIfBlocked(interaction, 'py-craft')) return;
      try {
        await pyCraft.handleCraftInteraction(interaction);
      } catch (err) {
        console.error('[home] Erro na oficina:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('craft.error', getLanguage(interaction)), flags: 64 };
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
