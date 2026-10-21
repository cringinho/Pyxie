const fs = require('node:fs');
const path = require('node:path');
const { COMMAND_CATEGORY_MAP, MODULE_METADATA } = require('../commands/commandHelpers');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';
const MARY_DEFAULT_GUILD_ID = '1453890868980482090'; // Guilda padrão do Estúdio da Mary

// Comandos exclusivos do criador (Owner Only)
const OWNER_COMMANDS = new Set([
  'admin', 'py-admin',
  'seteco', 'py-seteco', 'setareconomia', 'py-setareconomia',
  'reseteco', 'py-reseteco', 'resetareconomia', 'py-resetareconomia',
  'ecoconfig', 'py-ecoconfig', 'configeconomia', 'py-configeconomia',
]);

// Comandos restritos ao ambiente de servidor (Guild Only)
const GUILD_ONLY_COMMANDS = new Set([
  'setup', 'py-setup',
  'set', 'py-set', 'configurar', 'py-configurar',
  'schedule', 'py-schedule', 'agenda', 'py-agenda',
  'admin', 'py-admin',
  'exportar', 'py-exportar', 'export', 'py-export', 'export-messages', 'py-export-messages',
  'seteco', 'py-seteco', 'setareconomia', 'py-setareconomia',
  'reseteco', 'py-reseteco', 'resetareconomia', 'py-resetareconomia',
  'ecoconfig', 'py-ecoconfig', 'configeconomia', 'py-configeconomia',
]);

let cachedIntrospectedCommands = null;
let cachedCommandMap = null;
let lastScanTimestamp = 0;

/**
 * Normaliza um objeto de comando detectado em runtime ou disco
 */
function normalizeCommand(cmd, moduleId = 'core', moduleInfo = {}) {
  if (!cmd) return null;

  const rawName = cmd.data?.name || cmd.name || '';
  if (!rawName) return null;

  const name = rawName.toLowerCase().trim();
  const aliases = Array.isArray(cmd.aliases)
    ? cmd.aliases.map((a) => String(a).toLowerCase().trim())
    : [];

  // Resolução de Categoria (COMMAND_CATEGORY_MAP é a fonte canônica)
  let category = COMMAND_CATEGORY_MAP[name];
  if (!category) {
    for (const alias of aliases) {
      if (COMMAND_CATEGORY_MAP[alias]) {
        category = COMMAND_CATEGORY_MAP[alias];
        break;
      }
    }
  }
  if (!category) {
    category = cmd.category || moduleInfo.category || 'utilidades';
  }

  // Resolução de Descrição
  let descPt = cmd.descriptionPt || cmd.data?.description_localizations?.['pt-BR'] || '';
  let descEn = cmd.descriptionEn || cmd.data?.description || cmd.description || '';
  if (!descPt && typeof cmd.description === 'string' && !cmd.descriptionLocalizations) {
    descPt = cmd.description;
  }
  if (!descPt) descPt = descEn;
  if (!descEn) descEn = descPt;

  // Resolução de Escopo de Servidor
  let guildScope = Array.isArray(cmd.guildScope)
    ? [...cmd.guildScope]
    : Array.isArray(moduleInfo.guildScope)
    ? [...moduleInfo.guildScope]
    : [];

  // Módulos com escopos nativos específicos
  if (moduleId === 'mary-studio' && guildScope.length === 0) {
    guildScope = [MARY_DEFAULT_GUILD_ID];
  }

  const isCringelandiaExclusive =
    guildScope.length === 1 && guildScope.includes(CRINGELANDIA_GUILD_ID);
  const isMaryExclusive =
    moduleId === 'mary-studio' || (guildScope.length === 1 && guildScope.includes(MARY_DEFAULT_GUILD_ID));

  let discordScope = 'global';
  if (isCringelandiaExclusive) discordScope = 'cringelandia';
  else if (isMaryExclusive) discordScope = 'mary-studio';
  else if (guildScope.length > 0) discordScope = 'guildScope';

  // Resolução de Restrições de Usuário
  const isOwner = Boolean(cmd.ownerOnly) || OWNER_COMMANDS.has(name);
  const allowedUserIds = Array.isArray(cmd.allowedUserIds) ? [...cmd.allowedUserIds] : [];
  const allowedRoleIds = Array.isArray(cmd.allowedRoleIds) ? [...cmd.allowedRoleIds] : [];

  let accessLevel = 'public';
  if (isOwner) {
    accessLevel = 'ownerOnly';
  } else if (allowedUserIds.length > 0 || allowedRoleIds.length > 0) {
    accessLevel = 'whitelist';
  }

  // Resolução de Ambiente de Execução
  let environment = cmd.environment;
  if (!environment) {
    environment = GUILD_ONLY_COMMANDS.has(name) ? 'guildOnly' : 'both';
  }

  const hasSlash = Boolean(cmd.data || typeof cmd.executeSlash === 'function' || typeof cmd.execute === 'function');
  const hasPrefix = Boolean(typeof cmd.executePrefix === 'function' || typeof cmd.execute === 'function' || aliases.length > 0);

  return {
    name,
    rawName,
    aliases,
    category,
    moduleId,
    moduleName: moduleInfo.name || moduleId,
    description: descPt,
    descriptionEn: descEn,
    discordScope,
    isCringelandiaExclusive,
    isMaryExclusive,
    guildScope,
    accessLevel,
    ownerOnly: isOwner,
    allowedUserIds,
    allowedRoleIds,
    environment,
    hasSlash,
    hasPrefix,
    slashName: name.startsWith('py-') ? name : `py-${name}`,
    prefixName: `py!${name.replace(/^py-/, '')}`,
  };
}

/**
 * Varre todos os comandos de src/commands/ e src/modules/
 */
function scanAllCommands(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedIntrospectedCommands && now - lastScanTimestamp < 15000) {
    return cachedIntrospectedCommands;
  }

  const discoveredMap = new Map();

  // 1. Inspeciona comandos do núcleo (src/commands/)
  try {
    const { commands: coreCommands } = require('../commands/index');
    if (Array.isArray(coreCommands)) {
      for (const cmd of coreCommands) {
        const norm = normalizeCommand(cmd, 'core', { name: 'Núcleo do Bot', category: 'utilidades' });
        if (norm) {
          discoveredMap.set(norm.name, norm);
        }
      }
    }
  } catch (err) {
    console.warn('[commandIntrospector] Aviso ao ler src/commands/index:', err.message);
  }

  // 2. Inspeciona módulos dinâmicos (src/modules/*)
  const modulesDir = path.join(__dirname, '..', 'modules');
  if (fs.existsSync(modulesDir)) {
    const moduleEntries = fs.readdirSync(modulesDir, { withFileTypes: true });
    for (const entry of moduleEntries) {
      if (!entry.isDirectory()) continue;
      const modId = entry.name;
      const modIndexPath = path.join(modulesDir, modId, 'index.js');
      const modCmdsDir = path.join(modulesDir, modId, 'commands');

      let modExport = null;
      try {
        if (fs.existsSync(modIndexPath)) {
          modExport = require(modIndexPath);
        }
      } catch (_) {}

      const modInfo = {
        name: (typeof modExport?.name === 'object' ? modExport.name['pt-BR'] : modExport?.name) || modId,
        category: modExport?.category || 'utilidades',
        guildScope: modExport?.guildScope || [],
      };

      // Inspeciona array de comandos exportados no index.js do módulo
      if (Array.isArray(modExport?.commands)) {
        for (const cmd of modExport.commands) {
          const norm = normalizeCommand(cmd, modId, modInfo);
          if (norm && !discoveredMap.has(norm.name)) {
            discoveredMap.set(norm.name, norm);
          }
        }
      }

      // Inspeciona arquivos soltos em src/modules/<id>/commands/
      if (fs.existsSync(modCmdsDir)) {
        const cmdFiles = fs.readdirSync(modCmdsDir);
        for (const file of cmdFiles) {
          if (!file.endsWith('.js')) continue;
          try {
            const cmd = require(path.join(modCmdsDir, file));
            const norm = normalizeCommand(cmd, modId, modInfo);
            if (norm && !discoveredMap.has(norm.name)) {
              discoveredMap.set(norm.name, norm);
            }
          } catch (_) {}
        }
      }
    }
  }

  cachedIntrospectedCommands = Array.from(discoveredMap.values());
  cachedCommandMap = discoveredMap;
  lastScanTimestamp = now;

  return cachedIntrospectedCommands;
}

/**
 * Retorna todos os comandos introspectados
 */
function getIntrospectedCommands(forceRefresh = false) {
  return scanAllCommands(forceRefresh);
}

/**
 * Retorna mapa de comandos por nome e aliases
 */
function getIntrospectedCommandMap(forceRefresh = false) {
  scanAllCommands(forceRefresh);
  const aliasMap = new Map();
  for (const cmd of cachedIntrospectedCommands) {
    aliasMap.set(cmd.name, cmd);
    for (const alias of cmd.aliases) {
      if (!aliasMap.has(alias)) {
        aliasMap.set(alias, cmd);
      }
    }
  }
  return aliasMap;
}

module.exports = {
  getIntrospectedCommands,
  getIntrospectedCommandMap,
  normalizeCommand,
  OWNER_COMMANDS,
  GUILD_ONLY_COMMANDS,
  CRINGELANDIA_GUILD_ID,
  MARY_DEFAULT_GUILD_ID,
};
