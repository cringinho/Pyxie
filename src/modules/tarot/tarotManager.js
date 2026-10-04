const tarotService = require('../../services/tarot');
const tarotAlbumService = require('../../services/tarotAlbumService');

/**
 * TarotManager — Gerenciador do Ciclo de Vida do Módulo de Tarot Místico & Álbum
 * 
 * Segue o padrão de Cogs/Plugins modulares desacoplados (Red-DiscordBot):
 * - Isolamento limpo de ciclo de vida com zero resíduos em memória (Zero Memory Leak)
 * - Preservação estrita dos arquivos de banco de dados e estado dos usuários (tarot-state.json e tarot_album.json)
 * - Disponibilidade 24/7 com ativação padrão (defaultEnabled: true)
 */
class TarotManager {
  constructor() {
    this.client = null;
    this.started = false;
  }

  /**
   * Inicializa o módulo quando carregado pelo ModuleManager
   * @param {import('discord.js').Client} [client]
   */
  init(client = null) {
    if (client) this.client = client;
    this.started = true;
    console.log('[TarotManager] 🔮 Módulo de Tarot Místico & Álbum ativado com sucesso.');
  }

  /**
   * Desativa o módulo e limpa referências em memória (Zero Memory Leak)
   */
  stop() {
    this.started = false;
    this.client = null;
    console.log('[TarotManager] ⚪ Módulo de Tarot desativado e memória limpa.');
  }

  /**
   * Retorna o status atual do módulo
   */
  isStarted() {
    return this.started;
  }

  /**
   * Fornece acesso ao serviço principal de tiragens e suborno de Tarot
   */
  getTarotService() {
    return tarotService;
  }

  /**
   * Fornece acesso ao serviço de álbum de cartas e conquistas
   */
  getAlbumService() {
    return tarotAlbumService;
  }
}

const instance = new TarotManager();
module.exports = instance;
