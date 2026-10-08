const partnershipManager = require('./partnershipManager');
const pyParceriaCmd = require('./commands/pyParceria');

/**
 * Módulo Solicitações de Parcerias (Cog Pattern)
 * Wizard stateless (modal etapa 1 -> botão -> modal etapa 2 -> termos) com aprovação pela staff.
 */
module.exports = {
  id: 'partnerships',
  name: {
    'pt-BR': 'Central de Parcerias',
    en: 'Partnership Hub',
  },
  description: {
    'pt-BR': 'Triagem de parcerias com formulário em etapas, aprovação da staff e mural com bump de 24h.',
    en: 'Partnership screening with a step-by-step form, staff approval and a website board with 24h bump.',
  },
  category: 'social',
  icon: '🤝',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyParceriaCmd],

  async onLoad(ctx) {
    partnershipManager.init(ctx.client || null, ctx);
  },

  async onUnload() {
    partnershipManager.client = null;
    partnershipManager.bumpHits.clear();
  },

  setupWebRoutes(app, ctx) {
    partnershipManager.setupWebRoutes(app, ctx);
  },
};

