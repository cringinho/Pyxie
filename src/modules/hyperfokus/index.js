const draftStore = require('./draftStore');
const articleStore = require('./articleStore');
const threadGuard = require('./threadGuard');
const pyAddCmd = require('./commands/pyAdd');
const pyConcluirCmd = require('./commands/pyConcluir');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';

/**
 * Módulo Pyxie Hyperfokus (Cog Pattern)
 * Portal editorial e ponte entre os tópicos de hiperfoco da Cringelândia e o site público.
 */
module.exports = {
  id: 'hyperfokus',
  name: {
    'pt-BR': 'Pyxie Hyperfokus (Blog)',
    en: 'Pyxie Hyperfokus (Blog)',
  },
  description: {
    'pt-BR': 'Portal editorial público integrado aos tópicos de hiperfoco da Cringelândia.',
    en: 'Public editorial portal integrated with Cringelândia hyperfocus topics.',
  },
  category: 'community',
  icon: '📖',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,
  guildScope: [CRINGELANDIA_GUILD_ID],

  commands: [pyAddCmd, pyConcluirCmd],

  async onLoad(ctx) {
    this.client = ctx.client || null;
    this.ctx = ctx;

    // Registra listeners do Discord via módulo manager
    if (ctx.registerListener) {
      ctx.registerListener('threadCreate', (thread, newlyCreated) => {
        threadGuard.onThreadCreate(thread, newlyCreated, ctx.client).catch(() => {});
      });

      ctx.registerListener('messageCreate', (message) => {
        threadGuard.onMessageCreate(message, ctx.client).catch(() => {});
      });

      ctx.registerListener('interactionCreate', (interaction) => {
        threadGuard.onInteractionCreate(interaction, ctx.client).catch(() => {});
      });
    }

    // Agendador de backup diário (apenas no processo do bot)
    if (ctx.isBotProcess && ctx.registerInterval) {
      ctx.registerInterval(() => {
        try {
          articleStore.exportBackup();
        } catch (err) {
          console.error('[Hyperfokus] Erro ao exportar backup diário:', err.message);
        }
      }, 24 * 60 * 60 * 1000);
    }
  },

  async onUnload() {
    this.client = null;
    this.ctx = null;
  },

  setupWebRoutes(app, ctx) {
    // Rotas de API e páginas públicas serão registradas aqui e em src/routes/hyperfokusRoutes.js
  },

  draftStore,
  articleStore,
  threadGuard,
};
