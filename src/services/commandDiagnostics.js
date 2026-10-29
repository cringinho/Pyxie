// Diagnóstico de Comando (/py-diagnose e botão no painel).
// Roda exatamente as mesmas checagens do carregador de comandos (existência, módulo global,
// escopo de servidor, grupo/modo clássico, rota de canal, regras de permissão, permissões da
// Pyxie no canal e tempo de recarga) e devolve cada etapa com status claro em PT-BR e EN.
const { PermissionFlagsBits } = require('discord.js');
const moduleManager = require('./moduleManager');
const guildFeatures = require('./guildFeatures');
const commandCatalog = require('./commandCatalog');
const commandPermissions = require('./commandPermissions');
const economy = require('./economy');
const { OWNER_SNOWFLAKE } = require('./adminAuth');
const { OWNER_ONLY_COMMANDS } = require('../commands/commandHelpers');

function findCommandEntry(query) {
  const raw = String(query || '').trim().toLowerCase().replace(/^(\/|py!)/, '');
  if (!raw) return null;
  const all = commandCatalog.allCommands();
  return (
    all.find((c) => c.name === raw || c.name === `py-${raw}`) ||
    all.find((c) => Array.isArray(c.aliases) && c.aliases.map((a) => a.toLowerCase()).includes(raw)) ||
    null
  );
}

/**
 * Executa a cadeia completa de diagnóstico para um comando.
 * @param {object} params
 * @param {string} params.commandName Nome ou apelido do comando
 * @param {string} [params.guildId] ID do servidor
 * @param {string} [params.channelId] ID do canal
 * @param {string} [params.parentChannelId] ID do canal pai (se for thread)
 * @param {string} [params.userId] ID da pessoa testada
 * @param {string[]} [params.roleIds] Cargos da pessoa
 * @param {boolean} [params.isAdmin] Se a pessoa tem ManageGuild / Administrator
 * @param {object} [params.botChannelPerms] Permissões da Pyxie no canal ({ SendMessages: true, EmbedLinks: true, AttachFiles: true })
 */
function diagnoseCommand({
  commandName,
  guildId = null,
  channelId = null,
  parentChannelId = null,
  userId = null,
  roleIds = [],
  isAdmin = false,
  botChannelPerms = null,
  now = Date.now(),
} = {}) {
  const entry = findCommandEntry(commandName);
  const steps = [];

  if (!entry) {
    steps.push({
      id: 'exists',
      ok: false,
      code: 'not_found',
      detail: { query: String(commandName || '').slice(0, 40) },
    });
    return {
      ok: false,
      command: null,
      failedStep: 'exists',
      steps,
    };
  }

  steps.push({
    id: 'exists',
    ok: true,
    code: 'found',
    detail: { name: entry.name, slash: entry.slash, category: entry.category, aliases: entry.aliases },
  });

  const isOwner = String(userId || '') === OWNER_SNOWFLAKE;

  // 2. Comando exclusivo do dono da Pyxie
  if (entry.ownerOnly || OWNER_ONLY_COMMANDS.has(entry.name)) {
    const ownerOk = isOwner;
    steps.push({
      id: 'owner',
      ok: ownerOk,
      code: ownerOk ? 'owner_ok' : 'owner_only',
      detail: {},
    });
    if (!ownerOk) {
      return { ok: false, command: entry, failedStep: 'owner', steps };
    }
  }

  // 3. Módulo global ligado/desligado
  const moduleOk = Boolean(entry.moduleEnabled);
  steps.push({
    id: 'module',
    ok: moduleOk,
    code: moduleOk ? 'module_on' : 'module_off',
    detail: { moduleId: entry.moduleId || 'core' },
  });
  if (!moduleOk) {
    return { ok: false, command: entry, failedStep: 'module', steps };
  }

  // 4. Escopo de servidor (exclusivo da Cringelândia / Estúdio da Mary / etc.)
  if (entry.guildScope && entry.guildScope.length > 0) {
    const scopeOk = Boolean(guildId && entry.guildScope.includes(String(guildId)));
    steps.push({
      id: 'scope',
      ok: scopeOk,
      code: scopeOk ? 'scope_ok' : 'scope_restricted',
      detail: { guildScope: entry.guildScope },
    });
    if (!scopeOk) {
      return { ok: false, command: entry, failedStep: 'scope', steps };
    }
  } else {
    steps.push({
      id: 'scope',
      ok: true,
      code: 'scope_global',
      detail: {},
    });
  }

  // 5. Grupo de recursos do servidor e modo Mundo Pyxie
  if (guildId && entry.group) {
    if (entry.group === 'mmo') {
      const mmoOk = guildFeatures.isMmoActive(guildId, now);
      steps.push({
        id: 'group',
        ok: mmoOk,
        code: mmoOk ? 'group_on' : 'classic_mode',
        detail: { group: entry.group },
      });
      if (!mmoOk) return { ok: false, command: entry, failedStep: 'group', steps };
    } else {
      const grpOk = guildFeatures.isGroupEnabled(guildId, entry.group, now);
      steps.push({
        id: 'group',
        ok: grpOk,
        code: grpOk ? 'group_on' : 'group_disabled',
        detail: { group: entry.group },
      });
      if (!grpOk) return { ok: false, command: entry, failedStep: 'group', steps };
    }
  } else {
    steps.push({
      id: 'group',
      ok: true,
      code: 'group_always_on',
      detail: { group: entry.group || 'core' },
    });
  }

  // 6. Regras de permissão por comando (cargo / canal / pessoa)
  let permEval = { allowed: true, matchedRule: null };
  if (guildId) {
    permEval = commandPermissions.evaluateCommandPermissions(guildId, entry.name, {
      channelId,
      userId,
      roleIds,
      isAdmin,
      isOwner,
    });
    steps.push({
      id: 'permission_rules',
      ok: permEval.allowed,
      code: permEval.allowed
        ? permEval.matchedRule
          ? 'rule_allowed'
          : 'no_blocking_rule'
        : permEval.reason || 'permission_rule',
      detail: {
        matchedRule: permEval.matchedRule || null,
        allowedChannels: permEval.allowedChannels || [],
        allowedRoles: permEval.allowedRoles || [],
      },
    });
    if (!permEval.allowed) {
      return { ok: false, command: entry, failedStep: 'permission_rules', steps };
    }
  }

  // 7. Canal permitido (rota específica do comando ou canais do grupo)
  if (guildId) {
    const channelObj = channelId ? { id: String(channelId), parentId: parentChannelId ? String(parentChannelId) : null } : null;
    const access = guildFeatures.checkCommandAccess({
      guildId,
      channel: channelObj,
      command: entry.name,
      userId,
      roleIds,
      isAdmin,
      isOwner,
      now,
    });
    const channelOk = access.allowed || (access.reason !== 'route' && access.reason !== 'channel');
    const routeChannels = guildFeatures.commandRoute(guildId, entry.name);
    const groupChannels = entry.group ? guildFeatures.getGuildFeatures(guildId).channels[entry.group] || [] : [];
    steps.push({
      id: 'channel',
      ok: channelOk,
      code: channelOk
        ? routeChannels.length || groupChannels.length
          ? 'channel_in_list'
          : 'channel_any'
        : access.reason === 'route'
        ? 'channel_not_in_route'
        : 'channel_not_in_group',
      detail: {
        allowedChannels: access.channels || (routeChannels.length ? routeChannels : groupChannels),
      },
    });
    if (!channelOk) {
      return { ok: false, command: entry, failedStep: 'channel', steps };
    }
  }

  // 8. Permissões da própria Pyxie no canal
  if (botChannelPerms && typeof botChannelPerms === 'object') {
    const missing = [];
    if (botChannelPerms.ViewChannel === false) missing.push('ViewChannel');
    if (botChannelPerms.SendMessages === false) missing.push('SendMessages');
    if (botChannelPerms.EmbedLinks === false) missing.push('EmbedLinks');
    const botPermsOk = missing.length === 0;
    steps.push({
      id: 'bot_permissions',
      ok: botPermsOk,
      code: botPermsOk ? 'bot_perms_ok' : 'bot_perms_missing',
      detail: { missing },
    });
    if (!botPermsOk) {
      return { ok: false, command: entry, failedStep: 'bot_permissions', steps };
    }
  } else {
    steps.push({
      id: 'bot_permissions',
      ok: true,
      code: 'bot_perms_assumed_ok',
      detail: { missing: [] },
    });
  }

  // 9. Cooldown ativo da pessoa (para comandos com recarga, como work, daily, quiz)
  if (userId) {
    let cooldownRemainingMs = 0;
    if (entry.name === 'py-work') {
      cooldownRemainingMs = economy.getWorkStatus(userId, now).remainingMs || 0;
    } else if (entry.name === 'py-quiz') {
      cooldownRemainingMs = economy.getQuizStatus(userId, now).remainingMs || 0;
    } else if (entry.name === 'py-daily') {
      const acc = economy.getUserAccount(userId);
      const last = acc.lastDailyAt ? new Date(acc.lastDailyAt).getTime() : 0;
      cooldownRemainingMs = Math.max(0, 24 * 60 * 60 * 1000 - (now - last));
    }
    const cdOk = cooldownRemainingMs === 0;
    steps.push({
      id: 'cooldown',
      ok: cdOk,
      code: cdOk ? 'cooldown_ready' : 'cooldown_active',
      detail: { remainingMs: cooldownRemainingMs, remainingMinutes: Math.ceil(cooldownRemainingMs / 60000) },
    });
    if (!cdOk) {
      return { ok: false, command: entry, failedStep: 'cooldown', steps };
    }
  } else {
    steps.push({
      id: 'cooldown',
      ok: true,
      code: 'cooldown_ready',
      detail: { remainingMs: 0 },
    });
  }

  return {
    ok: true,
    command: entry,
    failedStep: null,
    steps,
  };
}

/**
 * Extrai as permissões da Pyxie em um canal do Discord.js para passar ao diagnóstico.
 */
function inspectBotChannelPermissions(guild, channel) {
  if (!guild || !channel) return null;
  try {
    const me = guild.members?.me;
    if (!me || typeof channel.permissionsFor !== 'function') return null;
    const perms = channel.permissionsFor(me);
    if (!perms) return null;
    return {
      ViewChannel: perms.has(PermissionFlagsBits.ViewChannel),
      SendMessages: perms.has(PermissionFlagsBits.SendMessages),
      EmbedLinks: perms.has(PermissionFlagsBits.EmbedLinks),
      AttachFiles: perms.has(PermissionFlagsBits.AttachFiles),
    };
  } catch (_) {
    return null;
  }
}

module.exports = {
  findCommandEntry,
  diagnoseCommand,
  inspectBotChannelPermissions,
};

