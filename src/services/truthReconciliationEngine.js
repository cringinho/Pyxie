const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const EventEmitter = require('node:events');

const commandTelemetry = require('./commandTelemetry');
const guildDirectory = require('./guildDirectory');
const resourceTelemetry = require('./resourceTelemetry');
const visualDbExplorer = require('./visualDbExplorer');
const commandScopeManager = require('./commandScopeManager');
const acervoAuditService = require('./acervoAuditService');
const trustAndSafety = require('./trustAndSafety');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const PUBLIC_TRUTH_FILE = path.join(DATA_DIR, 'publicTruthSnapshot.json');
const RECONCILE_INTERVAL_MS = 30 * 1000; // 30 segundos por onda

class TruthReconciliationEngine extends EventEmitter {
  constructor() {
    super();
    this.lastStateHash = '';
    this.lastWaveTimestamp = 0;
    this.cycleTimer = null;
    this.fsWatchers = [];
    this.botClient = null;
    this.expressApp = null;
    this.isReconciling = false;
  }

  /**
   * Inicia o ciclo contínuo de Ondas de Verificação
   */
  /**
   * Purgador SSOT de chaves e sistemas legados obsoletos (shop, relic_t*, etc)
   */
  purgeObsoleteLegacyData() {
    try {
      const candidates = [
        path.join(__dirname, '..', 'data', 'emojis.json'),
        path.join(DATA_DIR, 'emojis.json'),
      ];
      const obsoleteKeys = [
        'shop_chest',
        'shop_gem',
        'relic_t1',
        'relic_t2',
        'relic_t3',
        'relic_t4',
        'relic_t5',
        'phantom_coin',
        'vigor_energy',
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf8');
          const data = JSON.parse(raw);
          let changed = false;
          for (const k of obsoleteKeys) {
            if (k in data) {
              delete data[k];
              changed = true;
            }
          }
          if (changed) {
            fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
          }
        }
      }
    } catch (_) {}
  }

  startCycle(botClient = null, expressApp = null) {
    this.purgeObsoleteLegacyData();
    this.botClient = botClient;
    this.expressApp = expressApp;

    // Executa primeira onda imediatamente
    this.runVerificationWave({ force: true }).catch((err) => {
      console.warn('[TruthReconciliationEngine] Falha na primeira onda:', err.message);
    });

    // Agenda ciclos automáticos a cada 30 segundos
    if (!this.cycleTimer) {
      this.cycleTimer = setInterval(() => {
        this.runVerificationWave({ force: false }).catch(() => null);
      }, RECONCILE_INTERVAL_MS);
      if (this.cycleTimer.unref) this.cycleTimer.unref();
    }

    // Monitora arquivos em data/ com debounce para disparar onda instantânea em caso de alteração
    this.setupFileWatchers();
  }

  setupFileWatchers() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const ignoredFiles = new Set([
        'publicTruthSnapshot.json',
        'publicTruthFallback.json',
        'logs.json',
        'stats.json',
        'commandTelemetry.json',
        'liveGuildsSnapshot.json',
        'guildsSnapshot.json',
      ]);

      let debounceTimer = null;
      const watcher = fs.watch(DATA_DIR, (eventType, filename) => {
        if (!filename || filename.endsWith('.tmp') || filename.includes('.tmp.') || filename.endsWith('.bak') || ignoredFiles.has(filename)) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.runVerificationWave({ force: false, trigger: `fs.watch:${filename}` }).catch(() => null);
        }, 1500);
      });

      this.fsWatchers.push(watcher);
    } catch (err) {
      console.warn('[TruthReconciliationEngine] Não foi possível ativar fs.watch no data/:', err.message);
    }
  }

  stopCycle() {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
    for (const w of this.fsWatchers) {
      try {
        w.close();
      } catch (_) {}
    }
    this.fsWatchers = [];
  }

  /**
   * Executa uma Onda de Verificação completa (SSOT: VM <-> Painel <-> Site)
   */
  async runVerificationWave({ force = false, trigger = 'timer', tab = null } = {}) {
    if (this.isReconciling) return null;
    this.isReconciling = true;

    try {
      this.purgeObsoleteLegacyData();
      const now = Date.now();

      // 1. Atualiza snapshot de servidores se o cliente Discord estiver disponível
      if (this.botClient) {
        try {
          guildDirectory.updateGuildsSnapshot(this.botClient);
        } catch (_) {}
      }

      // 2. Coleta o estado vivo de cada subsistema
      const telemetrySummary = commandTelemetry.getSummary();
      const telemetryRanking = commandTelemetry.getRanking();
      const guilds = guildDirectory.getGuildsDirectory();
      const vmOverview = resourceTelemetry.getVmOverview();
      const moduleMetrics = resourceTelemetry.getModuleMetrics();
      const subpanelMetrics = resourceTelemetry.getSubpanelMetrics();
      const dbUsers = visualDbExplorer.queryPartition({ partition: 'users', page: 1, limit: 50 });
      const dbGlobal = visualDbExplorer.queryPartition({ partition: 'global' });
      const commandScopes = commandScopeManager.getAllCommandScopes();
      const acervoStats = acervoAuditService.getAcervoStats();
      const redFlags = trustAndSafety.getActiveRedFlags();

      const snapshot = {
        timestamp: now,
        trigger,
        telemetrySummary,
        guildsCount: guilds.length,
        commandsCount: commandScopes.length,
        careersCount: acervoStats.careers?.totalProfessions || 22,
        quizQuestionsCount: acervoStats.quiz?.totalQuestions || 600,
        seasonalActive: Boolean(dbGlobal.records?.find((r) => r.id === 'seasonal_state')?.active),
      };

      // 3. Calcula hash do estado consolidado
      const stateHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(snapshot))
        .digest('hex');

      const hasChanged = stateHash !== this.lastStateHash;

      if (hasChanged || force) {
        this.lastStateHash = stateHash;
        this.lastWaveTimestamp = now;

        // 4. Hidrata o snapshot de verdade pública em data/publicTruthSnapshot.json
        this.updatePublicTruthSnapshot({
          now,
          commandScopes,
          acervoStats,
          guilds,
          dbGlobal,
        });

        this.emit('waveCompleted', {
          timestamp: now,
          stateHash,
          hasChanged,
          force,
          trigger,
        });
      }

      return {
        success: true,
        timestamp: now,
        formattedTime: new Date(now).toLocaleTimeString('pt-BR'),
        stateHash,
        hasChanged,
        force,
        trigger,
        tab,
        data: tab ? this.getTabData(tab) : snapshot,
      };
    } finally {
      this.isReconciling = false;
    }
  }

  /**
   * Retorna os dados atualizados para uma aba específica
   */
  getTabData(tabName) {
    switch (tabName) {
      case 'telemetry':
      case 'analytics':
        return {
          summary: commandTelemetry.getSummary(),
          ranking: commandTelemetry.getRanking(),
          categories: commandTelemetry.getCategoryBreakdown(),
        };
      case 'guilds':
      case 'servidores':
        return {
          guilds: guildDirectory.getGuildsDirectory(),
        };
      case 'vm':
      case 'recursos':
        return {
          vmOverview: resourceTelemetry.getVmOverview(),
          moduleMetrics: resourceTelemetry.getModuleMetrics(),
          subpanelMetrics: resourceTelemetry.getSubpanelMetrics(),
        };
      case 'database':
      case 'visualdb':
        return {
          users: visualDbExplorer.queryPartition({ partition: 'users', page: 1, limit: 20 }),
          global: visualDbExplorer.queryPartition({ partition: 'global' }),
          dictionary: visualDbExplorer.getMetadataDictionary(),
        };
      case 'scopes':
      case 'escopos':
        return {
          scopes: commandScopeManager.getAllCommandScopes(),
        };
      case 'acervo':
      case 'controle':
        return {
          acervo: acervoAuditService.getAcervoStats(),
        };
      case 'trust':
      case 'seguranca':
        return {
          redFlags: trustAndSafety.getActiveRedFlags(),
          blacklist: trustAndSafety.getBlacklist(),
        };
      default:
        return {
          summary: commandTelemetry.getSummary(),
          vmOverview: resourceTelemetry.getVmOverview(),
        };
    }
  }

  /**
   * Atualiza o arquivo de snapshot de verdade pública para consumo pelo site e Wiki
   */
  updatePublicTruthSnapshot({ now, commandScopes, acervoStats, guilds, dbGlobal }) {
    try {
      // 1. Filtra comandos públicos (ocultando estritamente comandos de owner e comandos privados)
      const publicCommands = (commandScopes || [])
        .filter((cmd) => !cmd.ownerOnly && cmd.accessLevel === 'public' && cmd.discordScope === 'global')
        .map((cmd) => ({
          name: cmd.name,
          slashName: cmd.slashName || (cmd.name.startsWith('py-') ? cmd.name : `py-${cmd.name}`),
          prefixName: cmd.prefixName || `py!${cmd.name.replace(/^py-/, '')}`,
          category: cmd.category || 'utilidades',
          descriptionPt: cmd.description || '',
          descriptionEn: cmd.descriptionEn || cmd.description || '',
          hasSlash: cmd.hasSlash,
          hasPrefix: cmd.hasPrefix,
        }));

      // Categorias de comandos com contagem
      const categoriesCount = {};
      for (const cmd of publicCommands) {
        categoriesCount[cmd.category] = (categoriesCount[cmd.category] || 0) + 1;
      }

      // 2. Acervo de artes do museu com formatação de milestones ("50+", "100+", "150+")
      let museumCount = 0;
      try {
        const musPath = path.join(DATA_DIR, 'museum_arts.json');
        if (fs.existsSync(musPath)) {
          const arts = JSON.parse(fs.readFileSync(musPath, 'utf8'));
          museumCount = Array.isArray(arts) ? arts.length : Object.keys(arts).length;
        }
      } catch (_) {}

      let museumBadge = `${museumCount}`;
      if (museumCount >= 150) museumBadge = '150+';
      else if (museumCount >= 100) museumBadge = '100+';
      else if (museumCount >= 50) museumBadge = '50+';
      else if (museumCount >= 20) museumBadge = '20+';

      // 3. Impacto social da Cringelândia
      let cringelandiaHelpedCount = 0;
      try {
        const cringDataPath = path.join(DATA_DIR, 'cringelandia', 'helpMetrics.json');
        if (fs.existsSync(cringDataPath)) {
          const cData = JSON.parse(fs.readFileSync(cringDataPath, 'utf8'));
          cringelandiaHelpedCount = cData.totalHelped || cData.totalClicks || 0;
        }
      } catch (_) {}

      // 4. Profissões ativas e cenários de trabalho
      const professionsCount = acervoStats.careers?.totalProfessions || 22;
      const workScenariosCount = acervoStats.careers?.totalQuestions || 2836;
      const quizQuestionsCount = acervoStats.quiz?.totalQuestions || 600;

      const truthPayload = {
        updatedAt: now,
        formattedDate: new Date(now).toISOString(),
        version: '1.0.0',
        commands: {
          total: publicCommands.length,
          categories: categoriesCount,
          list: publicCommands,
        },
        professions: {
          total: professionsCount,
          workScenariosCount,
          list: acervoStats.careers?.items || [],
        },
        currencies: [
          {
            id: 'coins',
            namePt: 'Moedinhas',
            nameEn: 'Coins',
            iconUrl: 'https://cdn.discordapp.com/emojis/1548443880066777098.gif',
            descPt: 'Moeda comum da Pyxie ganha trabalhando, oráculos e bônus diário.',
            descEn: 'Standard Pyxie currency earned through working, oracle, and daily bonus.',
          },
          {
            id: 'magicBeans',
            namePt: 'Feijões Mágicos',
            nameEn: 'Magic Beans',
            iconUrl: 'https://cdn.discordapp.com/emojis/1551356415543742554.gif',
            descPt: 'Moeda arcana sagrada obtida em conquistas épicas e eventos especiais.',
            descEn: 'Sacred arcane currency earned in epic achievements and special events.',
          },
          {
            id: 'seasonal',
            namePt: 'Moedas do Evento',
            nameEn: 'Event Tokens',
            iconUrl: 'https://cdn.discordapp.com/emojis/1548443994902757427.png',
            descPt: 'Moedas comemorativas de eventos sazonais.',
            descEn: 'Commemorative seasonal event tokens.',
          },
        ],
        milestones: {
          museumArts: {
            raw: museumCount,
            badge: museumBadge,
          },
          quizQuestions: {
            raw: quizQuestionsCount,
            badge: `${quizQuestionsCount}+`,
          },
          tarotCards: 78,
          activeGuilds: guilds.length,
          cringelandiaHelped: cringelandiaHelpedCount,
        },
      };

      const dir = path.dirname(PUBLIC_TRUTH_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${PUBLIC_TRUTH_FILE}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
      fs.writeFileSync(tmp, JSON.stringify(truthPayload, null, 2), 'utf8');
      try {
        fs.renameSync(tmp, PUBLIC_TRUTH_FILE);
      } catch (renameErr) {
        try {
          fs.copyFileSync(tmp, PUBLIC_TRUTH_FILE);
          if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[TruthReconciliationEngine] Falha ao atualizar publicTruthSnapshot.json:', err.message);
    }
  }
}

const instance = new TruthReconciliationEngine();
module.exports = instance;
