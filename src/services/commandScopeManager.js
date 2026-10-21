const fs = require('node:fs');
const path = require('node:path');
const { OWNER_SNOWFLAKE } = require('./adminAuth');
const { getIntrospectedCommands, OWNER_COMMANDS, GUILD_ONLY_COMMANDS, CRINGELANDIA_GUILD_ID, MARY_DEFAULT_GUILD_ID } = require('./commandIntrospector');

const SCOPES_FILE = path.join(__dirname, '..', '..', 'data', 'commandScopes.json');

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
 * Cobre 100% dos comandos em src/commands/ e todos os submódulos em src/modules/
 */
function getAllCommandScopes() {
  const introspected = getIntrospectedCommands();
  const result = [];

  for (const cmd of introspected) {
    const name = cmd.name;
    const override = scopeOverrides[name] || {};

    const category = cmd.category || 'utilidades';
    const isOwner = override.ownerOnly ?? (Boolean(cmd.ownerOnly) || OWNER_COMMANDS.has(name));
    
    // Escopo de Servidor
    let guildScope = override.guildScope !== undefined
      ? (Array.isArray(override.guildScope) ? override.guildScope : [])
      : (Array.isArray(cmd.guildScope) ? cmd.guildScope : []);

    const isCringelandiaExclusive =
      guildScope.includes(CRINGELANDIA_GUILD_ID) && guildScope.length === 1;
    const isMaryExclusive =
      cmd.moduleId === 'mary-studio' || (guildScope.includes(MARY_DEFAULT_GUILD_ID) && guildScope.length === 1);

    let discordScope = 'global';
    if (override.serverScope) {
      discordScope = override.serverScope;
    } else if (isCringelandiaExclusive) {
      discordScope = 'cringelandia';
    } else if (isMaryExclusive) {
      discordScope = 'mary-studio';
    } else if (guildScope.length > 0) {
      discordScope = 'guildScope';
    }

    // Escopo de Usuário
    const allowedUserIds = override.allowedUserIds ?? (Array.isArray(cmd.allowedUserIds) ? cmd.allowedUserIds : []);
    const allowedRoleIds = override.allowedRoleIds ?? (Array.isArray(cmd.allowedRoleIds) ? cmd.allowedRoleIds : []);

    let accessLevel = 'public';
    if (override.userScope) {
      accessLevel = override.userScope;
    } else if (isOwner) {
      accessLevel = 'ownerOnly';
    } else if (allowedRoleIds.length > 0) {
      accessLevel = 'staff';
    } else if (allowedUserIds.length > 0) {
      accessLevel = 'whitelist';
    }

    // Ambiente de Execução
    let environment = override.environment || cmd.environment || (GUILD_ONLY_COMMANDS.has(name) ? 'guildOnly' : 'both');

    result.push({
      name,
      category,
      moduleId: cmd.moduleId || 'core',
      description: cmd.description || '',
      discordScope,
      serverScope: discordScope,
      isCringelandiaExclusive,
      isMaryExclusive,
      guildScope,
      accessLevel,
      userScope: accessLevel,
      ownerOnly: isOwner,
      allowedUserIds,
      allowedRoleIds,
      environment,
      parentModule: category,
      moduleActive: true,
      hasSlash: cmd.hasSlash,
      hasPrefix: cmd.hasPrefix,
    });
  }

  // Ordena por nome
  result.sort((a, b) => a.name.localeCompare(b.name));
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
  if (updates.serverScope) {
    scopeOverrides[canonicalName].serverScope = updates.serverScope;
    if (updates.serverScope === 'global') {
      scopeOverrides[canonicalName].guildScope = [];
    } else if (updates.serverScope === 'cringelandia') {
      scopeOverrides[canonicalName].guildScope = [CRINGELANDIA_GUILD_ID];
    } else if (updates.serverScope === 'mary-studio') {
      scopeOverrides[canonicalName].guildScope = [MARY_DEFAULT_GUILD_ID];
    }
  }
  if (Array.isArray(updates.guildScope)) {
    scopeOverrides[canonicalName].guildScope = updates.guildScope;
  }
  if (updates.userScope) {
    scopeOverrides[canonicalName].userScope = updates.userScope;
    if (updates.userScope === 'ownerOnly') {
      scopeOverrides[canonicalName].ownerOnly = true;
    } else if (updates.userScope === 'public') {
      scopeOverrides[canonicalName].ownerOnly = false;
      scopeOverrides[canonicalName].allowedUserIds = [];
      scopeOverrides[canonicalName].allowedRoleIds = [];
    }
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
    let reason = '';

    // 1. Verificação de Ambiente (guild vs dm)
    if (environment === 'dm' && cmd.environment === 'guildOnly') {
      canSee = false;
      reason = 'Comando restrito a servidores (Guild Only). Não pode ser executado em DM.';
    } else if (environment === 'guild' && cmd.environment === 'dmOnly') {
      canSee = false;
      reason = 'Comando restrito a mensagens diretas (DM Only).';
    }

    // 2. Verificação de Escopo de Servidor
    if (canSee && cmd.guildScope && cmd.guildScope.length > 0) {
      if (!cmd.guildScope.includes(guildId)) {
        canSee = false;
        reason = `Comando restrito a servidores autorizados (${cmd.guildScope.join(', ')}).`;
      }
    }

    // 3. Verificação de Nível de Usuário
    if (canSee) {
      const isOwnerUser = userType === 'owner' || userId === OWNER_SNOWFLAKE;
      if (cmd.ownerOnly && !isOwnerUser) {
        canSee = false;
        reason = 'Comando exclusivo do Criador da Pyxie (Owner Only).';
      } else if (cmd.accessLevel === 'staff' && !isOwnerUser && userType !== 'admin') {
        const hasRole = Array.isArray(cmd.allowedRoleIds) && cmd.allowedRoleIds.some((r) => userRoleIds.includes(r));
        if (!hasRole) {
          canSee = false;
          reason = 'Comando exclusivo para Staff / Administradores.';
        }
      } else if (cmd.accessLevel === 'whitelist' && !isOwnerUser) {
        const isUserAllowed = Array.isArray(cmd.allowedUserIds) && cmd.allowedUserIds.includes(userId);
        const isRoleAllowed = Array.isArray(cmd.allowedRoleIds) && cmd.allowedRoleIds.some((r) => userRoleIds.includes(r));
        if (!isUserAllowed && !isRoleAllowed) {
          canSee = false;
          reason = 'Usuário não consta na Whitelist deste comando.';
        }
      }
    }

    if (canSee) {
      visible.push(cmd);
    } else {
      hidden.push({ ...cmd, hideReason: reason });
    }
  }

  return {
    params: { guildId, userType, userId, environment },
    totalCommands: allScopes.length,
    visibleCount: visible.length,
    hiddenCount: hidden.length,
    visible,
    hidden,
    visibleCommands: visible,
    hiddenCommands: hidden,
  };
}

module.exports = {
  getAllCommandScopes,
  updateCommandScope,
  simulateVisibility,
  CRINGELANDIA_GUILD_ID,
  MARY_DEFAULT_GUILD_ID,
  OWNER_COMMANDS,
  GUILD_ONLY_COMMANDS,
};
