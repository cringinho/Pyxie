// Guardião do servidor: regras puras (sem Discord) para o módulo server-guard.
// 1. Cargo que ganha permissão perigosa (Administrador, Gerenciar Servidor/Cargos/Webhooks, Banir).
// 2. Canal novo ou alterado que fica aberto a todo mundo dentro de uma categoria fechada.
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

function resetMemory() {
  recent.clear();
}

// Botões dos alertas. Levam o id do servidor porque também funcionam na DM do dono.
const ids = {
  revert: (guildId, roleId, names) => `sg:role:${guildId}:${roleId}:${bitsOf(names).toString(36)}`,
  lock: (guildId, channelId) => `sg:lock:${guildId}:${channelId}`,
  keep: (guildId) => `sg:keep:${guildId}`,
};

function parseId(customId) {
  const parts = String(customId || '').split(':');
  if (parts[0] !== 'sg') return null;
  const [, kind, guildId, targetId, bits] = parts;
  if (!/^\d{17,20}$/.test(guildId || '')) return null;
  if (kind === 'keep') return { kind, guildId };
  if (!/^\d{17,20}$/.test(targetId || '')) return null;
  if (kind === 'lock' || kind === 'hook') return { kind, guildId, targetId };
  if (kind === 'role' && /^[0-9a-z]+$/.test(bits || '')) {
    const value = [...bits].reduce((acc, ch) => acc * 36n + BigInt(parseInt(ch, 36)), 0n);
    return { kind, guildId, targetId, names: namesOf(value) };
  }
  return null;
}

module.exports = { DANGEROUS, gainedDangerous, bitsOf, namesOf, isChannelLeak, shouldAlert, resetMemory, ids, parseId };
