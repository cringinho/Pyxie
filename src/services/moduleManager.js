const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

/**
 * Pyxie Modular Engine (Inspirado no padrão Cog/Plugin do Red-DiscordBot)
 * 
 * Gerencia o ciclo de vida completo de módulos desacoplados:
 * - Descoberta automática em src/modules/
 * - Ativação, desativação e recarregamento sem reinicialização do bot
 * - Escopo isolado de recursos com GARANTIA DE ZERO RESÍDUOS (Zero Memory Leaks):
 *   * Remove listeners do Discord Client
 *   * Interrompe cron jobs
 *   * Cancela intervalos e timeouts
 *   * Desregistra comandos e aliases de commandsByName
 * - Persistência atômica de estado em data/modulesConfig.json
 * - Injeção dinâmica transparente na central de ajuda (/py-help) e catálogo web (/api/commands)
 */

const MODULES_DIR = path.join(__dirname, '..', 'modules');

function getModulesConfigFile() {
  return process.env.MODULES_CONFIG_PATH || path.join(__dirname, '..', '..', 'data', 'modulesConfig.json');
}

class ModuleManager extends EventEmitter {
  constructor() {
    super();
    this.modules = new Map(); // id -> moduleDescriptor
    this.activeScopes = new Map(); // id -> { commands, commandNames, listeners, crons, intervals, timeouts }
    this.client = null;
    this.commandsByName = null;
    this.slashCommands = null;
    this.app = null;
    this.sendIpc = null;
    this.initialized = false;
  }

  /**
   * Lê a configuração persistida de módulos de data/modulesConfig.json
   */
  loadConfig() {
    const configFile = getModulesConfigFile();
    try {
      if (!fs.existsSync(configFile)) {
        const dir = path.dirname(configFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const initial = { modules: {} };
        fs.writeFileSync(configFile, JSON.stringify(initial, null, 2), 'utf8');
        return initial;
      }
      const raw = fs.readFileSync(configFile, 'utf8');
      return JSON.parse(raw) || { modules: {} };
    } catch (err) {
      console.error('[ModuleManager] Erro ao ler modulesConfig.json:', err.message);
      return { modules: {} };
    }
  }

  /**
   * Salva a configuração atualizada de forma atômica
   */
  saveConfig(config) {
    const configFile = getModulesConfigFile();
    try {
      const dir = path.dirname(configFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tempPath = `${configFile}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(config, null, 2), 'utf8');
      fs.renameSync(tempPath, configFile);
      return true;
    } catch (err) {
      console.error('[ModuleManager] Erro ao salvar modulesConfig.json:', err.message);
      return false;
    }
  }

  /**
   * Obtém o estado de ativação de um módulo específico
   */
  isModuleEnabled(moduleId) {
    const config = this.loadConfig();
    if (config.modules && config.modules[moduleId] !== undefined) {
      return Boolean(config.modules[moduleId].enabled);
    }
    const mod = this.modules.get(moduleId);
    return Boolean(mod?.defaultEnabled);
  }

  /**
   * Salva o estado de um módulo específico no arquivo de configuração
   */
  setModuleConfigState(moduleId, enabled) {
    const config = this.loadConfig();
    if (!config.modules) config.modules = {};
    config.modules[moduleId] = {
      ...(config.modules[moduleId] || {}),
      enabled: Boolean(enabled),
      updatedAt: Date.now(),
    };
    this.saveConfig(config);
  }

  /**
   * Varre src/modules/ e descobre todos os descritores válidos de módulo
   */
  discoverModules() {
    this.modules.clear();
    if (!fs.existsSync(MODULES_DIR)) return this.modules;

    const entries = fs.readdirSync(MODULES_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const moduleIndexPath = path.join(MODULES_DIR, entry.name, 'index.js');
        if (fs.existsSync(moduleIndexPath)) {
          try {
            // Limpa cache de require para permitir hot-reload
            delete require.cache[require.resolve(moduleIndexPath)];
            const mod = require(moduleIndexPath);
            if (mod && mod.id) {
              if (Array.isArray(mod.commands) && Array.isArray(mod.guildScope)) {
                for (const cmd of mod.commands) {
                  if (!cmd.guildScope) {
                    cmd.guildScope = mod.guildScope;
                  }
                }
              }
              this.modules.set(mod.id, mod);
            }
          } catch (err) {
            console.error(`[ModuleManager] Falha ao carregar módulo ${entry.name}:`, err);
          }
        }
      }
    }
    return this.modules;
  }

  /**
   * Inicializa o gerenciador com referências do ambiente (Bot ou Supervisor Web)
   */
  init({ client = null, commandsByName = null, slashCommands = null, app = null, sendIpc = null } = {}) {
    if (client) this.client = client;
    if (commandsByName) this.commandsByName = commandsByName;
    if (slashCommands) this.slashCommands = slashCommands;
    if (app) this.app = app;
    if (sendIpc) this.sendIpc = sendIpc;

    this.discoverModules();

    // Monta rotas web de todos os módulos que fornecem setupWebRoutes
    if (this.app) {
      for (const [id, mod] of this.modules.entries()) {
        if (typeof mod.setupWebRoutes === 'function') {
          try {
            mod.setupWebRoutes(this.app, this.createContext(mod));
          } catch (err) {
            console.error(`[ModuleManager] Erro ao registrar rotas web do módulo ${id}:`, err);
          }
        }
      }
    }

    // Ativa módulos habilitados na configuração
    for (const [id, mod] of this.modules.entries()) {
      const isEnabled = this.isModuleEnabled(id);
      if (isEnabled && !this.activeScopes.has(id)) {
        this.enableModule(id, false).catch((err) => {
          console.error(`[ModuleManager] Erro ao ativar módulo ${id} na inicialização:`, err);
        });
      } else if (isEnabled && this.activeScopes.has(id) && client) {
        // Se o client do Discord acabou de ficar pronto, notifica o módulo
        if (typeof mod.onLoad === 'function') {
          mod.onLoad(this.createContext(mod)).catch((err) => {
            console.error(`[ModuleManager] Erro ao conectar client no módulo '${id}':`, err);
          });
        }
      }
    }

    this.initialized = true;
    return this;
  }

  /**
   * Cria o contexto de execução com injeção segura de escopo para um módulo
   */
  createContext(mod) {
    let scope = this.activeScopes.get(mod.id);
    if (!scope) {
      scope = {
        commands: [],
        commandNames: [],
        listeners: [],
        crons: [],
        intervals: [],
        timeouts: [],
      };
      this.activeScopes.set(mod.id, scope);
    }

    return {
      moduleId: mod.id,
      client: this.client,
      app: this.app,
      sendIpc: this.sendIpc,
      isBotProcess: Boolean(this.client),
      isWebProcess: Boolean(this.app),

      // Registro de Listeners de Eventos do Discord com rastreamento para unhook automático
      registerListener: (event, handler) => {
        if (this.client) {
          const wrappedHandler = (...args) => {
            if (Array.isArray(mod.guildScope) && mod.guildScope.length > 0) {
              const firstArg = args[0];
              const eventGuildId =
                firstArg?.guildId ||
                firstArg?.guild?.id ||
                (typeof firstArg === 'string' && firstArg.length >= 17 ? firstArg : null);
              if (eventGuildId && !mod.guildScope.includes(eventGuildId)) {
                return;
              }
            }
            return handler(...args);
          };
          this.client.on(event, wrappedHandler);
          scope.listeners.push({ event, handler: wrappedHandler, originalHandler: handler });
        }
      },

      // Registro de Cron Jobs com rastreamento para stop automático
      registerCron: (cronTime, onTick, options = {}) => {
        const cron = require('node-cron');
        const job = cron.schedule(cronTime, onTick, options);
        scope.crons.push(job);
        return job;
      },

      // Registro de Timers para cancelamento automático
      registerInterval: (fn, ms) => {
        const id = setInterval(fn, ms);
        scope.intervals.push(id);
        return id;
      },
      registerTimeout: (fn, ms) => {
        const id = setTimeout(fn, ms);
        scope.timeouts.push(id);
        return id;
      },

      // Configuração modular
      getConfig: () => {
        const fullConfig = this.loadConfig();
        return fullConfig.modules?.[mod.id]?.data || {};
      },
      saveConfig: (data) => {
        const fullConfig = this.loadConfig();
        if (!fullConfig.modules) fullConfig.modules = {};
        if (!fullConfig.modules[mod.id]) fullConfig.modules[mod.id] = { enabled: true };
        fullConfig.modules[mod.id].data = data;
        fullConfig.modules[mod.id].updatedAt = Date.now();
        this.saveConfig(fullConfig);
      },
    };
  }

  /**
   * Ativa um módulo específico, vincula comandos e listeners, e executa onLoad()
   */
  async enableModule(moduleId, persist = true) {
    let mod = this.modules.get(moduleId);
    if (!mod) {
      this.discoverModules();
      mod = this.modules.get(moduleId);
    }
    if (!mod) {
      throw new Error(`Módulo '${moduleId}' não encontrado em src/modules/`);
    }

    // Se já estiver ativo, desativa antes de reativar para garantir limpeza
    if (this.activeScopes.has(moduleId)) {
      await this.disableModule(moduleId, false);
    }

    const scope = {
      commands: [],
      commandNames: [],
      listeners: [],
      crons: [],
      intervals: [],
      timeouts: [],
    };
    this.activeScopes.set(moduleId, scope);
    const ctx = this.createContext(mod);

    // 1. Registra os comandos do módulo no despachante commandsByName
    if (Array.isArray(mod.commands)) {
      for (const cmd of mod.commands) {
        if (Array.isArray(mod.guildScope) && !cmd.guildScope) {
          cmd.guildScope = mod.guildScope;
        }
        scope.commands.push(cmd);
        if (this.commandsByName) {
          const mainName = cmd.name || cmd.data?.name;
          if (mainName) {
            this.commandsByName.set(mainName, cmd);
            scope.commandNames.push(mainName);
            if (mainName.startsWith('py-')) {
              const bare = mainName.slice(3);
              this.commandsByName.set(bare, cmd);
              scope.commandNames.push(bare);
            } else {
              const prefixed = `py-${mainName}`;
              this.commandsByName.set(prefixed, cmd);
              scope.commandNames.push(prefixed);
            }
          }
          if (Array.isArray(cmd.aliases)) {
            for (const alias of cmd.aliases) {
              this.commandsByName.set(alias, cmd);
              scope.commandNames.push(alias);
              if (alias.startsWith('py-')) {
                const bare = alias.slice(3);
                this.commandsByName.set(bare, cmd);
                scope.commandNames.push(bare);
              } else {
                const prefixed = `py-${alias}`;
                this.commandsByName.set(prefixed, cmd);
                scope.commandNames.push(prefixed);
              }
            }
          }
        }
      }
    }

    // 2. Executa o hook onLoad do módulo
    if (typeof mod.onLoad === 'function') {
      try {
        await mod.onLoad(ctx);
      } catch (err) {
        console.error(`[ModuleManager] Erro durante onLoad do módulo '${moduleId}':`, err);
      }
    }

    // 3. Persiste o estado caso solicitado
    if (persist) {
      this.setModuleConfigState(moduleId, true);
    }

    this.emit('moduleEnabled', { moduleId, module: mod });
    console.log(`[ModuleManager] 🟢 Módulo '${moduleId}' ativado com sucesso (${scope.commands.length} comandos vinculados).`);
    return true;
  }

  /**
   * Desativa um módulo específico com GARANTIA DE ZERO RESÍDUOS (Zero Memory Leaks)
   */
  async disableModule(moduleId, persist = true) {
    const mod = this.modules.get(moduleId);
    const scope = this.activeScopes.get(moduleId);

    if (mod && typeof mod.onUnload === 'function') {
      try {
        await mod.onUnload(this.createContext(mod));
      } catch (err) {
        console.error(`[ModuleManager] Erro durante onUnload do módulo '${moduleId}':`, err);
      }
    }

    if (scope) {
      // 1. Remove listeners registrados no client do Discord
      if (this.client) {
        for (const { event, handler } of scope.listeners) {
          try {
            this.client.removeListener(event, handler);
          } catch (_) {}
        }
      }

      // 2. Para todos os cron jobs iniciados pelo módulo
      for (const job of scope.crons) {
        try {
          job.stop();
        } catch (_) {}
      }

      // 3. Cancela intervalos e timeouts
      for (const id of scope.intervals) {
        try {
          clearInterval(id);
        } catch (_) {}
      }
      for (const id of scope.timeouts) {
        try {
          clearTimeout(id);
        } catch (_) {}
      }

      // 4. Remove todos os comandos e aliases de commandsByName
      if (this.commandsByName) {
        for (const name of scope.commandNames) {
          this.commandsByName.delete(name);
        }
      }

      this.activeScopes.delete(moduleId);
    }

    // 5. Persiste o estado caso solicitado
    if (persist) {
      this.setModuleConfigState(moduleId, false);
    }

    this.emit('moduleDisabled', { moduleId });
    console.log(`[ModuleManager] ⚪ Módulo '${moduleId}' desativado e memória limpa.`);
    return true;
  }

  /**
   * Alterna o estado (ON/OFF) de um módulo
   */
  async toggleModule(moduleId, forceState = null) {
    const currentlyActive = this.activeScopes.has(moduleId);
    const shouldEnable = forceState !== null ? Boolean(forceState) : !currentlyActive;

    if (shouldEnable) {
      await this.enableModule(moduleId, true);
    } else {
      await this.disableModule(moduleId, true);
    }
    return shouldEnable;
  }

  /**
   * Recarrega um módulo em tempo real
   */
  async reloadModule(moduleId) {
    this.discoverModules();
    const wasActive = this.activeScopes.has(moduleId) || this.isModuleEnabled(moduleId);
    await this.disableModule(moduleId, false);
    if (wasActive) {
      await this.enableModule(moduleId, false);
    }
    return true;
  }

  /**
   * Verifica se um comando está autorizado a responder em determinado servidor
   */
  isCommandInGuildScope(command, guildId) {
    if (!command?.guildScope || !Array.isArray(command.guildScope) || command.guildScope.length === 0) {
      return true; // Comando universal / global
    }
    if (!guildId) return false;
    return command.guildScope.includes(guildId);
  }

  /**
   * Retorna a lista de comandos fornecidos por todos os módulos atualmente ATIVOS.
   * Utilizado por commandHelpers.js para catalogação dinâmica na Web e Ajuda (/py-help).
   */
  getActiveCommands(guildId = null) {
    const cmds = [];
    for (const [id, scope] of this.activeScopes.entries()) {
      const mod = this.modules.get(id);
      if (guildId && Array.isArray(mod?.guildScope) && mod.guildScope.length > 0 && !mod.guildScope.includes(guildId)) {
        continue;
      }
      const defaultCategory = mod?.category || 'utilidades';
      for (const cmd of scope.commands) {
        if (guildId && !this.isCommandInGuildScope(cmd, guildId)) {
          continue;
        }
        // Assegura que o comando possua categoria explícita herdada do módulo
        if (!cmd.category) {
          cmd.category = defaultCategory;
        }
        cmds.push(cmd);
      }
    }
    return cmds;
  }

  /**
   * Retorna a categoria nativa de um comando pertencente a um módulo
   */
  getCommandCategory(commandName) {
    const bare = commandName.startsWith('py-') ? commandName.slice(3) : commandName;
    for (const mod of this.modules.values()) {
      if (Array.isArray(mod.commands)) {
        for (const cmd of mod.commands) {
          const mainName = cmd.name || cmd.data?.name;
          const mainBare = mainName?.startsWith('py-') ? mainName.slice(3) : mainName;
          if (mainName === commandName || mainBare === bare) {
            return cmd.category || mod.category || 'utilidades';
          }
          if (Array.isArray(cmd.aliases)) {
            for (const alias of cmd.aliases) {
              const aliasBare = alias.startsWith('py-') ? alias.slice(3) : alias;
              if (alias === commandName || aliasBare === bare) {
                return cmd.category || mod.category || 'utilidades';
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Retorna metadados de todos os módulos instalados para exibição no painel administrativo
   */
  getAllModules() {
    this.discoverModules();
    const result = [];
    for (const [id, mod] of this.modules.entries()) {
      const isEnabled = this.isModuleEnabled(id);
      const isActive = this.activeScopes.has(id);
      const commandsList = (mod.commands || []).map((cmd) => {
        const name = cmd.name || cmd.data?.name || 'unknown';
        return {
          name: name.startsWith('py-') ? name : `py-${name}`,
          aliases: cmd.aliases || [],
          description: cmd.data?.description || cmd.description || '',
        };
      });

      result.push({
        id,
        name: typeof mod.name === 'object' ? mod.name['pt-BR'] || mod.name.en : mod.name,
        nameLocalized: mod.name,
        description: typeof mod.description === 'object' ? mod.description['pt-BR'] || mod.description.en : mod.description,
        descriptionLocalized: mod.description,
        category: mod.category || 'utilidades',
        icon: mod.icon || '🧩',
        version: mod.version || '1.0.0',
        author: mod.author || 'Pyxie Team',
        guildScope: mod.guildScope || null,
        enabled: isEnabled,
        active: isActive,
        commandsCount: commandsList.length,
        commands: commandsList,
      });
    }
    return result;
  }
}

// Exporta instância única (Singleton)
const instance = new ModuleManager();
module.exports = instance;
