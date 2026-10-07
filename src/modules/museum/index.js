const museumManager = require('./museumManager');
const pyMuseuCmd = require('./commands/pyMuseu');

/**
 * Módulo Museu da Comunidade (Cog Pattern)
 * Acervo permanente de artes enviadas no canal configurado em data/museumConfig.json.
 */
module.exports = {
  id: 'museum',
  name: {
    'pt-BR': 'Galeria & Museu da Comunidade',
    en: 'Community Art Museum',
  },
  description: {
    'pt-BR': 'Acervo e catálogo permanente de criações com navegação retrô.',
    en: 'Permanent archive and catalog of creations with retro navigation.',
  },
  category: 'social',
  icon: '🏛️',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyMuseuCmd],

  async onLoad(ctx) {
    museumManager.init(ctx.client || null, ctx);
  },

  async onUnload() {
    museumManager.client = null;
    museumManager.urlCache.clear();
    museumManager.authorCache.clear();
  },

  setupWebRoutes(app) {
    museumManager.setupWebRoutes(app);
  },
};

