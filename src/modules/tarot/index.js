const pyTarot = require('./commands/pyTarot');
const pyAlbum = require('./commands/pyAlbum');
const tarotManager = require('./tarotManager');

/**
 * Módulo Oficial de Tarot Místico & Álbum da Pyxie (Cog Pattern)
 * 
 * Fornece:
 * - Tiragens diárias de tarot com as 78 cartas canônicas renderizadas dinamicamente em Canvas/WebP
 * - Mecânica de suborno à Pyxie com custo balanceado em moedas
 * - Álbum interativo de cartas descobertas com paginação e busca direta por número
 * - Sistema de conquistas colecionáveis com resgate de recompensas
 * - Persistência atômica segura preservando todo o progresso dos usuários
 */
module.exports = {
  id: 'tarot',
  name: {
    'pt-BR': 'Tarot Místico & Álbum',
    en: 'Mystic Tarot & Album',
  },
  description: {
    'pt-BR': 'Tiragens diárias de tarot com 78 cartas, oráculo do destino, álbum de arcanos colecionáveis e conquistas.',
    en: 'Daily 78-card tarot readings, fortune oracle, collectible card album, and achievements.',
  },
  category: 'tarot',
  icon: '🔮',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  // Comandos fornecidos pelo módulo
  commands: [
    pyTarot,
    pyAlbum,
  ],

  // Hook de ciclo de vida onLoad
  async onLoad(ctx) {
    if (ctx.client) {
      tarotManager.init(ctx.client);
    } else {
      tarotManager.init(null);
    }
  },

  // Hook de ciclo de vida onUnload (Zero Memory Leak)
  async onUnload(ctx) {
    tarotManager.stop();
  },
};
