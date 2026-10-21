const fs = require('node:fs');
const path = require('node:path');
const { OWNER_SNOWFLAKE } = require('./adminAuth');
const { COMMAND_CATEGORY_MAP } = require('../commands/commandHelpers');

const SCOPES_FILE = path.join(__dirname, '..', '..', 'data', 'commandScopes.json');
const CRINGELANDIA_GUILD_ID = '1453890868980482090';

// Comandos do Criador / Owner Only
const OWNER_COMMANDS = new Set([
  'admin', 'py-admin',
  'seteco', 'py-seteco', 'setareconomia', 'py-setareconomia',
  'reseteco', 'py-reseteco', 'resetareconomia', 'py-resetareconomia',
  'ecoconfig', 'py-ecoconfig', 'configeconomia', 'py-configeconomia',
]);

// Comandos estritamente de Servidor (Guild Only)
const GUILD_ONLY_COMMANDS = new Set([
  'setup', 'py-setup',
  'welcome', 'py-welcome', 'setwelcome', 'py-setwelcome',
  'schedule', 'py-schedule', 'agenda', 'py-agenda',
  'admin', 'py-admin',
  'exportar', 'py-exportar', 'export', 'py-export', 'export-messages', 'py-export-messages',
  'seteco', 'py-seteco', 'setareconomia', 'py-setareconomia',
  'reseteco', 'py-reseteco', 'resetareconomia', 'py-resetareconomia',
  'ecoconfig', 'py-ecoconfig', 'configeconomia', 'py-configeconomia',
]);

let scopeOverrides = {};

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error('[commandScopeManager] Erro ao gravar commandScopes.json:', err.message);
  }
}

function loadScopeOverrides() {
  try {
    if (fs.existsSync(SCOPES_FILE)) {
      scopeOverrides = JSON.parse(fs.readFileSync(SCOPES_FILE, 'utf8')) || {};
    }
  } catch (_) {
    scopeOverrides = {};
  }
}

loadScopeOverrides();

/**
 * Retorna lista de todos os comandos e suas 4 dimensões de escopo
 */
function getAllCommandScopes() {
  const { commands } = require('../commands/index');
  const result = [];

  for (const cmd of commands || []) {
    const name = cmd.data?.name || cmd.name || 'unnamed';
    const override = scopeOverrides[name] || {};

    const category = COMMAND_CATEGORY_MAP[name] || 'utilidades';
    const isOwner = override.ownerOnly ?? (Boolean(cmd.ownerOnly) || OWNER_COMMANDS.has(name));
    const guildScope = override.guildScope ?? (Array.isArray(cmd.guildScope) ? cmd.guildScope : []);
    const allowedUserIds = override.allowedUserIds ?? (Array.isArray(cmd.allowedUserIds) ? cmd.allowedUserIds : []);
    const allowedRoleIds = override.allowedRoleIds ?? (Array.isArray(cmd.allowedRoleIds) ? cmd.allowedRoleIds : []);

    // 1. Escopo de Visibilidade Discord
    const discordScope = guildScope.length > 0 ? 'guildScope' : 'global';
    const isCringelandiaExclusive = guildScope.includes(CRINGELANDIA_GUILD_ID) && guildScope.length === 1;

    // 2. Nível de Acesso de Usuário
    let accessLevel = 'public';
    if (isOwner) {
      accessLevel = 'ownerOnly';
    } else if (allowedUserIds.length > 0 || allowedRoleIds.length > 0) {
      accessLevel = 'whitelist';
    }

    // 3. Ambiente de Execução
    let environment = override.environment || (GUILD_ONLY_COMMANDS.has(name) ? 'guildOnly' : 'both');

    // 4. Módulo Pai
    const parentModule = category;

    result.push({
      name,
      category,
      description: cmd.data?.description || cmd.description || '',
      discordScope,
      isCringelandiaExclusive,
      guildScope,
      accessLevel,
      ownerOnly: isOwner,
      allowedUserIds,
      allowedRoleIds,
      environment,
      parentModule,
      moduleActive: true, // Dinamicamente checado se módulo estiver desativado
    });
  }

  return result;
}

/**
 * Atualiza override de escopo de um comando
 */
function updateCommandScope(commandName, updates = {}) {
  const canonicalName = String(commandName).toLowerCase().trim();
  if (!scopeOverrides[canonicalName]) {
    scopeOverrides[canonicalName] = {};
  }

  if (typeof updates.ownerOnly === 'boolean') {
    scopeOverrides[canonicalName].ownerOnly = updates.ownerOnly;
  }
  if (Array.isArray(updates.guildScope)) {
    scopeOverrides[canonicalName].guildScope = updates.guildScope;
  }
  if (Array.isArray(updates.allowedUserIds)) {
    scopeOverrides[canonicalName].allowedUserIds = updates.allowedUserIds;
  }
  if (Array.isArray(updates.allowedRoleIds)) {
    scopeOverrides[canonicalName].allowedRoleIds = updates.allowedRoleIds;
  }
  if (updates.environment && ['guildOnly', 'dmOnly', 'both'].includes(updates.environment)) {
    scopeOverrides[canonicalName].environment = updates.environment;
  }

  safeAtomicWrite(SCOPES_FILE, scopeOverrides);
  return scopeOverrides[canonicalName];
}

/**
 * Simulador de Visibilidade de Comandos
 * @param {Object} params
 * @param {string} [params.guildId]
 * @param {'owner'|'admin'|'whitelist'|'member'} [params.userType='member']
 * @param {string} [params.userId]
 * @param {Array<string>} [params.userRoleIds=[]]
 * @param {'guild'|'dm'} [params.environment='guild']
 */
function simulateVisibility({
  guildId = CRINGELANDIA_GUILD_ID,
  userType = 'member',
  userId = '123456789',
  userRoleIds = [],
  environment = 'guild',
} = {}) {
  const allScopes = getAllCommandScopes();
  const visible = [];
  const hidden = [];

  for (const cmd of allScopes) {
    let canSee = true;
    let reason = 'Comando público disponível';

    // 1. Verificação de Ambiente
    if (environment === 'dm' && cmd.environment === 'guildOnly') {
      canSee = false;
      reason = 'Bloqueado em DM (Requer servidor)';
    }

    // 2. Verificação de Escopo de Servidor
    if (canSee && cmd.guildScope && cmd.guildScope.length > 0) {
      if (!guildId || !cmd.guildScope.includes(String(guildId))) {
        canSee = false;
        reason = `Exclusivo de servidor específico (Não registrado para ${guildId || 'DM'})`;
      }
    }

    // 3. Verificação de Nível de Usuário
    if (canSee) {
      if (cmd.ownerOnly) {
        if (userType !== 'owner' && userId !== OWNER_SNOWFLAKE) {
          canSee = false;
          reason = 'Exclusivo do Criador da Pyxie (ownerOnly)';
        }
      } else if (cmd.accessLevel === 'whitelist') {
        const hasUser = cmd.allowedUserIds.includes(String(userId));
        const hasRole = userRoleIds.some((r) => cmd.allowedRoleIds.includes(String(r)));
        if (!hasUser && !hasRole && userType !== 'owner' && userType !== 'admin') {
          canSee = false;
          reason = 'Restrito à Whitelist de Usuários / Cargos autorizados';
        }
      }
    }

    if (canSee) {
      visible.push({ ...cmd, reason });
    } else {
      hidden.push({ ...cmd, reason });
    }
  }

  return {
    context: { guildId, userType, userId, environment },
    totalCommands: allScopes.length,
    visibleCount: visible.length,
    hiddenCount: hidden.length,
    visibleCommands: visible,
    hiddenCommands: hidden,
  };
}

module.exports = {
  getAllCommandScopes,
  updateCommandScope,
  simulateVisibility,
  CRINGELANDIA_GUILD_ID,
};
