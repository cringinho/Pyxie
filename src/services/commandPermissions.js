// Serviço de Regras de Permissão por Comando e Sincronização de Menu de Barra por Servidor.
// Adota a camada de configuração por escopo (`src/services/scopedConfig.js`).
// Modelo Red Permissions: "comando ou categoria × cargo / canal / pessoa × permitir / negar",
// onde a regra de canal vence a regra de servidor/cargo, e a regra de pessoa vence a de cargo.
const scopedConfig = require('./scopedConfig');
const { canonicalCommandName } = require('./guildFeatures');

const MAX_RULES_PER_GUILD = 100;
const SYNC_COOLDOWN_MS = 30 * 1000;
const lastSyncByGuild = new Map();

const VALID_TARGET_TYPES = new Set(['role', 'channel', 'user']);
const VALID_ACTIONS = new Set(['allow', 'deny']);

const permConfig = scopedConfig.forNamespace('command_permissions', {
  guild: {
    rules: [],
    lastMenuSyncAt: 0,
    syncedCommandCount: 0,
  },
});

function normalizeCommandTarget(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s || s === '*' || s === 'all') return '*';
  if (s.startsWith('cat:') || s.startsWith('group:')) {
    const cat = s.replace(/^(cat|group):/, '').trim();
    return cat ? `cat:${cat}` : '*';
  }
  const canon = canonicalCommandName(s);
  return canon || '*';
}

function normalizeRule(raw = {}, index = 0) {
  const id = String(raw.id || `rule_${index}_${Date.now().toString(36)}`).slice(0, 40);
  const command = normalizeCommandTarget(raw.command);
  const targetType = VALID_TARGET_TYPES.has(raw.targetType) ? raw.targetType : 'role';
  const targetId = String(raw.targetId || '').trim();
  const action = VALID_ACTIONS.has(raw.action) ? raw.action : 'deny';
  if (!/^\d{17,20}$/.test(targetId) && !targetId.startsWith('role_test') && !targetId.startsWith('chan_test') && !targetId.startsWith('user_test')) {
    return null;
  }
  const customMessage = String(raw.customMessage || '').trim().slice(0, 200);
  return customMessage ? { id, command, targetType, targetId, action, customMessage } : { id, command, targetType, targetId, action };
}

function getRules(guildId) {
  if (!guildId) return [];
  const data = permConfig.guild(guildId).get();
  return (Array.isArray(data.rules) ? data.rules : []).map(normalizeRule).filter(Boolean);
}

function setRules(guildId, rawRules = []) {
  const normalized = (Array.isArray(rawRules) ? rawRules : [])
    .slice(0, MAX_RULES_PER_GUILD)
    .map((r, i) => normalizeRule(r, i))
    .filter(Boolean);
  permConfig.guild(guildId).set({ rules: normalized });
  return normalized;
}

function addRule(guildId, rule) {
  const clean = normalizeRule(rule, Date.now());
  if (!clean) return { ok: false, error: 'invalid_rule' };
  const current = getRules(guildId);
  // Substitui regra idêntica (mesmo command + targetType + targetId)
  const filtered = current.filter(
    (r) => !(r.command === clean.command && r.targetType === clean.targetType && r.targetId === clean.targetId)
  );
  if (filtered.length >= MAX_RULES_PER_GUILD) return { ok: false, error: 'too_many_rules' };
  const next = [...filtered, clean];
  setRules(guildId, next);
  return { ok: true, rule: clean, rules: next };
}

function removeRule(guildId, ruleId) {
  const current = getRules(guildId);
  const next = current.filter((r) => r.id !== String(ruleId));
  setRules(guildId, next);
  return { ok: true, rules: next };
}

function commandCategoryFor(canonName) {
  try {
    const { COMMAND_CATEGORY_MAP } = require('../commands/commandHelpers');
    const bare = canonName.startsWith('py-') ? canonName.slice(3) : canonName;
    return COMMAND_CATEGORY_MAP[canonName] || COMMAND_CATEGORY_MAP[bare] || null;
  } catch (_) {
    return null;
  }
}

function ruleMatchesCommand(ruleCommand, canonName, category) {
  if (ruleCommand === '*') return { matches: true, specificity: 1 };
  if (ruleCommand.startsWith('cat:')) {
    const cat = ruleCommand.slice(4);
    if (category && category.toLowerCase() === cat.toLowerCase()) {
      return { matches: true, specificity: 2 };
    }
    return { matches: false, specificity: 0 };
  }
  if (ruleCommand === canonName) {
    return { matches: true, specificity: 3 };
  }
  return { matches: false, specificity: 0 };
}

/**
 * Avalia as regras de permissão para um comando no contexto informado.
 * Ordem de precedência (do mais específico para o mais geral):
 *   1. Escopo do comando: comando exato (3) > categoria (2) > todos '*' (1)
 *   2. Tipo de alvo: user (3) > channel (2) > role (1)
 *   (A regra de canal vence a regra de cargo/servidor; a regra de pessoa vence a de canal/cargo).
 *   3. No mesmo nível (ex.: a pessoa tem 2 cargos com regras opostas), 'allow' vence 'deny' se explícito,
 *      mas 'deny' bloqueia quando é a única regra aplicável ou quando não há 'allow' de maior/igual prioridade.
 *
 * Retorna:
 *   { allowed: true, matchedRule: rule | null }
 *   ou
 *   { allowed: false, reason: 'permission_rule', matchedRule: rule }
 */
function evaluateCommandPermissions(guildId, commandName, { channelId = null, userId = null, roleIds = [], isAdmin = false, isOwner = false } = {}) {
  if (!guildId) return { allowed: true, matchedRule: null };
  // Dono da Pyxie e administradores do servidor nunca ficam trancados fora de comandos administrativos
  const canon = canonicalCommandName(commandName);
  if (!canon) return { allowed: true, matchedRule: null };
  if (isOwner) return { allowed: true, matchedRule: null };

  const rules = getRules(guildId);
  if (!rules.length) return { allowed: true, matchedRule: null };

  const category = commandCategoryFor(canon);
  const roleSet = new Set((Array.isArray(roleIds) ? roleIds : []).map(String));
  const uId = userId ? String(userId) : null;
  const cId = channelId ? String(channelId) : null;

  // Filtra regras cujo comando/categoria bate
  const applicableForCommand = [];
  for (const r of rules) {
    const m = ruleMatchesCommand(r.command, canon, category);
    if (m.matches) applicableForCommand.push({ rule: r, cmdSpec: m.specificity });
  }
  if (!applicableForCommand.length) return { allowed: true, matchedRule: null };

  // Verifica se alguma regra bate diretamente no usuário, no canal ou nos cargos dele
  const directMatches = [];
  for (const item of applicableForCommand) {
    const { rule, cmdSpec } = item;
    if (rule.targetType === 'user' && uId && rule.targetId === uId) {
      directMatches.push({ rule, score: cmdSpec * 10 + 3 });
    } else if (rule.targetType === 'channel' && cId && rule.targetId === cId) {
      directMatches.push({ rule, score: cmdSpec * 10 + 2 });
    } else if (rule.targetType === 'role' && roleSet.has(rule.targetId)) {
      directMatches.push({ rule, score: cmdSpec * 10 + 1 });
    }
  }

  if (directMatches.length > 0) {
    directMatches.sort((a, b) => b.score - a.score || (a.rule.action === 'allow' ? -1 : 1));
    const winner = directMatches[0].rule;
    if (winner.action === 'deny' && !isAdmin) {
      return { allowed: false, reason: 'permission_rule', matchedRule: winner };
    }
    return { allowed: true, matchedRule: winner };
  }

  // Se existem regras 'allow' exclusivas para este comando (ex.: "só o cargo X ou só o canal Y pode usar"),
  // e o membro/canal atual não bateu em nenhuma delas, verifica se o comando está em modo whitelist:
  // Só tratamos 'allow' como restritivo quando NÃO há regras 'deny' do mesmo tipo para o mesmo comando
  // ou quando todas as regras do comando para aquele targetType são 'allow'.
  const exactAllowChannelRules = applicableForCommand.filter(
    (x) => x.cmdSpec >= 2 && x.rule.targetType === 'channel' && x.rule.action === 'allow'
  );
  if (exactAllowChannelRules.length > 0 && cId && !isAdmin) {
    return {
      allowed: false,
      reason: 'permission_rule_channel_whitelist',
      matchedRule: exactAllowChannelRules[0].rule,
      allowedChannels: exactAllowChannelRules.map((x) => x.rule.targetId),
    };
  }

  const exactAllowRoleRules = applicableForCommand.filter(
    (x) => x.cmdSpec >= 2 && x.rule.targetType === 'role' && x.rule.action === 'allow'
  );
  if (exactAllowRoleRules.length > 0 && !isAdmin) {
    return {
      allowed: false,
      reason: 'permission_rule_role_whitelist',
      matchedRule: exactAllowRoleRules[0].rule,
      allowedRoles: exactAllowRoleRules.map((x) => x.rule.targetId),
    };
  }

  return { allowed: true, matchedRule: null };
}

/**
 * Calcula quais comandos slash devem aparecer no menu de barra específico do servidor,
 * levando em conta grupos desligados, modo clássico e regras que negam o comando inteiro.
 */
function computeGuildSlashCommands(guildId) {
  const { commands } = require('../commands');
  const scopeManager = require('./commandScopeManager');
  const guildFeatures = require('./guildFeatures');
  const moduleManager = require('./moduleManager');
  const { COMMAND_MODULE_MAP } = require('./commandCatalog');

  const gId = String(guildId);
  const enabledList = [];
  const hiddenList = [];

  for (const cmd of commands) {
    if (!cmd.data || typeof cmd.data.toJSON !== 'function') continue;
    const name = cmd.name || cmd.data.name;
    const canon = canonicalCommandName(name);

    // 1. Escopo de servidor (ex.: comandos exclusivos da Cringelândia ou Mary)
    if (!scopeManager.isCommandAllowedInGuild(name, gId)) {
      hiddenList.push({ name: canon, reason: 'scope' });
      continue;
    }

    // 2. Módulo global desligado
    const modId = COMMAND_MODULE_MAP[canon];
    if (modId && !moduleManager.isEnabledForGuild(modId, gId)) {
      hiddenList.push({ name: canon, reason: 'module_off' });
      continue;
    }

    // 3. Grupo de recursos desligado no servidor (games, marriage, tarot) ou modo clássico
    const access = guildFeatures.checkCommandAccess(gId, null, canon, { skipPermissionRules: true });
    if (!access.allowed && (access.reason === 'disabled' || access.reason === 'classic_mode')) {
      hiddenList.push({ name: canon, reason: access.reason });
      continue;
    }

    enabledList.push(cmd.data.toJSON());
  }

  return { enabled: enabledList, hidden: hiddenList };
}

/**
 * Sincroniza o menu de comandos de barra (ApplicationGuildCommands) de um servidor no Discord,
 * com proteção contra rate-limit (cooldown de 30s por servidor).
 */
async function syncGuildSlashMenu(guildId, { restClient = null, now = Date.now(), force = false } = {}) {
  const gId = String(guildId || '').trim();
  if (!gId) return { ok: false, error: 'invalid_guild' };

  const last = lastSyncByGuild.get(gId) || 0;
  if (!force && now - last < SYNC_COOLDOWN_MS) {
    return {
      ok: false,
      error: 'cooldown',
      retryAfterSeconds: Math.ceil((SYNC_COOLDOWN_MS - (now - last)) / 1000),
    };
  }

  const { enabled, hidden } = computeGuildSlashCommands(gId);
  lastSyncByGuild.set(gId, now);

  const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
  const token = process.env.DISCORD_TOKEN;

  // Em ambiente de teste ou quando enviado um restClient customizado
  if (restClient && typeof restClient.put === 'function') {
    await restClient.put(gId, enabled);
    permConfig.guild(gId).set({ lastMenuSyncAt: now, syncedCommandCount: enabled.length });
    return { ok: true, syncedCount: enabled.length, hiddenCount: hidden.length, hidden };
  }

  if (!token || !clientId) {
    permConfig.guild(gId).set({ lastMenuSyncAt: now, syncedCommandCount: enabled.length });
    return { ok: true, simulated: true, syncedCount: enabled.length, hiddenCount: hidden.length, hidden };
  }

  try {
    const { REST, Routes } = require('discord.js');
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationGuildCommands(clientId, gId), { body: enabled });
    permConfig.guild(gId).set({ lastMenuSyncAt: now, syncedCommandCount: enabled.length });
    return { ok: true, syncedCount: enabled.length, hiddenCount: hidden.length, hidden };
  } catch (err) {
    return { ok: false, error: err.message || 'discord_sync_failed' };
  }
}

function getMenuSyncStatus(guildId) {
  const cfg = permConfig.guild(guildId).get();
  const { enabled, hidden } = computeGuildSlashCommands(guildId);
  return {
    lastMenuSyncAt: cfg.lastMenuSyncAt || 0,
    syncedCommandCount: cfg.syncedCommandCount || 0,
    activeCount: enabled.length,
    hiddenCount: hidden.length,
    hidden,
  };
}

function _resetCooldownsForTests() {
  lastSyncByGuild.clear();
}

module.exports = {
  MAX_RULES_PER_GUILD,
  SYNC_COOLDOWN_MS,
  permConfig,
  normalizeCommandTarget,
  normalizeRule,
  getRules,
  setRules,
  addRule,
  removeRule,
  evaluateCommandPermissions,
  computeGuildSlashCommands,
  syncGuildSlashMenu,
  getMenuSyncStatus,
  _resetCooldownsForTests,
};

