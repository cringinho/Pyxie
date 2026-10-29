// Guardião do servidor: regras puras (sem Discord) para o módulo server-guard.
// 1. Cargo que ganha permissão perigosa (Administrador, Gerenciar Servidor/Cargos/Webhooks, Banir).
// 2. Canal novo ou alterado que fica aberto a todo mundo dentro de uma categoria fechada.
// 3. Antinuke por limite (ações administrativas em massa em janela curta).
// 4. Botões de modo de emergência e verificação acessível por botão.
const { PermissionFlagsBits } = require('discord.js');

const DANGEROUS = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageWebhooks', 'BanMembers'];
const DEDUPE_MS = 60 * 1000;

// Permissões perigosas que o cargo não tinha e passou a ter.
function gainedDangerous(oldBits, newBits) {
  const before = BigInt(oldBits || 0);
  const after = BigInt(newBits || 0);
  return DANGEROUS.filter((name) => {
    const flag = PermissionFlagsBits[name];
    return (after & flag) === flag && (before & flag) !== flag;
  });
}

function bitsOf(names) {
  return names.reduce((acc, name) => acc | (PermissionFlagsBits[name] || 0n), 0n);
}

function namesOf(bits) {
  const value = BigInt(bits || 0);
  return DANGEROUS.filter((name) => (value & PermissionFlagsBits[name]) === PermissionFlagsBits[name]);
}

// Vazou: a categoria esconde de @everyone, o canal agora mostra, e antes não mostrava (ou é novo).
function isChannelLeak({ categoryPublic, nowPublic, wasPublic, isNew }) {
  if (categoryPublic || !nowPublic) return false;
  return Boolean(isNew) || wasPublic === false;
}

// Evita vários alertas seguidos para o mesmo cargo/canal (cada mudança gera eventos repetidos).
const recent = new Map();
function shouldAlert(key, now = Date.now()) {
  if (recent.size > 500) {
    for (const [k, at] of recent) if (now - at > DEDUPE_MS) recent.delete(k);
  }
  const last = recent.get(key);
  if (last && now - last < DEDUPE_MS) return false;
  recent.set(key, now);
  return true;
}

// Memória de ações administrativas por (guildId:executorId) para o Antinuke por limite.
const actionBuckets = new Map(); // key -> Array<{ at, type }>

function isTrusted(config = {}, userId = '', memberRoleIds = [], guildOwnerId = '', botId = '') {
  const uid = String(userId || '');
  if (!uid) return false;
  if (uid === String(guildOwnerId || '') || uid === String(botId || '')) return true;
  const trusted = new Set(Array.isArray(config?.antiNuke?.trustedIds) ? config.antiNuke.trustedIds.map(String) : []);
  if (trusted.has(uid)) return true;
  for (const rid of memberRoleIds || []) {
    if (trusted.has(String(rid))) return true;
  }
  return false;
}

function recordAdminAction(guildId, executorId, actionType, { maxActions = 5, windowSeconds = 30, now = Date.now() } = {}) {
  const key = `${guildId}:${executorId}`;
  const windowMs = Math.max(5, Number(windowSeconds) || 30) * 1000;
  const threshold = Math.max(2, Number(maxActions) || 5);
  const prev = actionBuckets.get(key) || [];
  const fresh = prev.filter((entry) => now - entry.at <= windowMs);
  fresh.push({ at: now, type: String(actionType || 'admin') });
  actionBuckets.set(key, fresh);

  if (actionBuckets.size > 1000) {
    for (const [k, list] of actionBuckets) {
      if (!list.length || now - list[list.length - 1].at > 300000) actionBuckets.delete(k);
    }
  }

  return {
    count: fresh.length,
    threshold,
    windowSeconds: Math.round(windowMs / 1000),
    triggered: fresh.length >= threshold,
    actions: fresh.map((x) => x.type),
  };
}

function resetMemory() {
  recent.clear();
  actionBuckets.clear();
}

// Botões dos alertas. Levam o id do servidor porque também funcionam na DM do dono.
const ids = {
  revert: (guildId, roleId, names) => `sg:role:${guildId}:${roleId}:${bitsOf(names).toString(36)}`,
  lock: (guildId, channelId) => `sg:lock:${guildId}:${channelId}`,
  keep: (guildId) => `sg:keep:${guildId}`,
  strip: (guildId, executorId) => `sg:strip:${guildId}:${executorId}`,
  emgoff: (guildId) => `sg:emgoff:${guildId}`,
  verify: (guildId) => `pyxv:verify:${guildId}`,
};

function parseId(customId) {
  const parts = String(customId || '').split(':');
  if (parts[0] !== 'sg') return null;
  const [, kind, guildId, targetId, bits] = parts;
  if (!/^\d{17,20}$/.test(guildId || '')) return null;
  if (kind === 'keep' || kind === 'emgoff') return { kind, guildId };
  if (!/^\d{17,20}$/.test(targetId || '')) return null;
  if (kind === 'lock' || kind === 'hook' || kind === 'strip') return { kind, guildId, targetId };
  if (kind === 'role' && /^[0-9a-z]+$/.test(bits || '')) {
    const value = [...bits].reduce((acc, ch) => acc * 36n + BigInt(parseInt(ch, 36)), 0n);
    return { kind, guildId, targetId, names: namesOf(value) };
  }
  return null;
}

function parseVerifyId(customId) {
  const parts = String(customId || '').split(':');
  if (parts[0] !== 'pyxv' || parts[1] !== 'verify') return null;
  const guildId = parts[2];
  if (!/^\d{17,20}$/.test(guildId || '')) return null;
  return { guildId };
}

module.exports = {
  DANGEROUS,
  gainedDangerous,
  bitsOf,
  namesOf,
  isChannelLeak,
  shouldAlert,
  isTrusted,
  recordAdminAction,
  resetMemory,
  ids,
  parseId,
  parseVerifyId,
};
