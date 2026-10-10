const seasonalManager = require('./seasonalManager');
const pyInfoEvento = require('./commands/pyInfoEvento');

/**
 * Módulo Sazonal da Cringelândia (Cog Oficial)
 * 
 * Fornece eventos temáticos sazonais com:
 * - Drops surpresa do Baú da Pyxie
 * - Competição e votação de Arte da Semana
 * - Moeda sazonal e ranking dinâmico integrado ao /py-rank
 * - Painel de controle no dashboard administrativo
 * - Comando /py-infoevento catalogado nativamente na categoria Economia
 */
module.exports = {
  id: 'seasonal',
  name: {
    'pt-BR': 'Evento Sazonal',
    en: 'Seasonal Event',
  },
  description: {
    'pt-BR': 'Eventos sazonais dinâmicos com baús da sorte, arte da semana e placar de líderes.',
    en: 'Dynamic seasonal events featuring mystery loot chests, weekly art contests and leaderboard.',
  },
  category: 'economia',
  icon: '🎃',
  version: '1.0.0',
  author: 'Pyxie Team',
  guildScope: ['1453890868980482090'],
  defaultEnabled: false,

  // Comandos fornecidos pelo módulo
  commands: [
    pyInfoEvento,
  ],

  // Hook executado quando o módulo é ativado
  async onLoad(ctx) {
    if (ctx.app) {
      seasonalManager.init(null, ctx.app, ctx.sendIpc);
    }
    if (ctx.client) {
      seasonalManager.init(ctx.client, ctx.app, ctx.sendIpc);
      seasonalManager.start();
    }
  },

  // Hook executado quando o módulo é desativado (Zero Memory Leak)
  async onUnload(ctx) {
    seasonalManager.stop(false);
  },

  // Registro de rotas web do módulo no supervisor Express
  setupWebRoutes(app, ctx) {
    if (typeof seasonalManager.setupWebRoutes === 'function') {
      seasonalManager.setupWebRoutes(app);
    }
  },
};
