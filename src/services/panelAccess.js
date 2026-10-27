// Quem acessa o quê no painel novo.
//
// - Dono da Pyxie: todos os servidores onde a Pyxie está, mais a área global.
// - Cringelândia: só o dono (nem os admins de lá veem as funções exclusivas).
// - Servidor da Mary: só a Mary (se for admin lá) e o dono.
// - Outros servidores: dono da guild ou quem tem Administrator, conferido ao vivo pelo bot
//   a cada ação; se o dono da guild ligar a whitelist, também precisa estar nela.
const fs = require('node:fs');
const path = require('node:path');
const { OWNER_SNOWFLAKE, CRINGELANDIA_GUILD_ID, MARY_GUILD_ID, MARY_USER_ID } = require('../config/scopes');

const ADMINISTRATOR = 0x8n;

function getGuildDir(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId));
}

function getZone(guildId) {
  if (String(guildId) === CRINGELANDIA_GUILD_ID) return 'cringelandia';
  if (String(guildId) === MARY_GUILD_ID) return 'mary';
  return 'global';
}

function isOwner(userId) {
  return String(userId) === OWNER_SNOWFLAKE;
}

function hasAdminBit(permissions) {
  try {
    return (BigInt(permissions || '0') & ADMINISTRATOR) === ADMINISTRATOR;
  } catch (_) {
    return false;
  }
}

// Regra de zona, que vale antes de qualquer conferência de cargo.
function zoneAllows(userId, guildId) {
  if (isOwner(userId)) return true;
  const zone = getZone(guildId);
  if (zone === 'cringelandia') return false;
  if (zone === 'mary') return String(userId) === MARY_USER_ID;
  return true;
}

function readWhitelist(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(getGuildDir(guildId), 'panelAccess.json'), 'utf8'));
    return {
      enabled: Boolean(raw.enabled),
      userIds: Array.isArray(raw.userIds) ? raw.userIds.map(String) : [],
      roleIds: Array.isArray(raw.roleIds) ? raw.roleIds.map(String) : [],
    };
  } catch (_) {
    return { enabled: false, userIds: [], roleIds: [] };
  }
}

function writeWhitelist(guildId, data) {
  const clean = {
    enabled: Boolean(data.enabled),
    userIds: [...new Set((data.userIds || []).map(String).filter((id) => /^\d{17,20}$/.test(id)))].slice(0, 100),
    roleIds: [...new Set((data.roleIds || []).map(String).filter((id) => /^\d{17,20}$/.test(id)))].slice(0, 50),
  };
  const dir = getGuildDir(guildId);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'panelAccess.json');
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(clean, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return clean;
}

// Lista (sem chamar o bot) os servidores que aparecem no seletor: interseção dos servidores do
// login com os servidores onde a Pyxie está, filtrada pelas regras de zona.
function listAccessibleGuilds(session, botGuilds) {
  const botMap = new Map((botGuilds || []).map((g) => [String(g.id), g]));
  if (isOwner(session.userId)) {
    return [...botMap.values()].map((g) => ({ ...g, zone: getZone(g.id), role: 'owner' }));
  }
  return (session.guilds || [])
    .filter((g) => botMap.has(g.id) && (g.owner || hasAdminBit(g.permissions)) && zoneAllows(session.userId, g.id))
    .map((g) => ({ ...botMap.get(g.id), zone: getZone(g.id), role: getZone(g.id) === 'mary' ? 'mary' : 'admin' }));
}

// Conferência ao vivo, feita a cada pedido de API de um servidor.
// Devolve { ok, role, isGuildOwner, zone } ou { ok: false, reason }.
async function checkGuildAccess(bridge, userId, guildId) {
  const zone = getZone(guildId);
  if (!zoneAllows(userId, guildId)) return { ok: false, reason: 'zone_forbidden' };

  let member;
  try {
    member = await bridge.request('MEMBER_ACCESS', { guildId: String(guildId), userId: String(userId) });
  } catch (err) {
    return { ok: false, reason: err.code === 'bridge_offline' ? 'bot_offline' : 'bot_timeout' };
  }
  if (!member?.botInGuild) return { ok: false, reason: 'bot_not_in_guild' };

  if (isOwner(userId)) {
    return { ok: true, role: 'owner', zone, isGuildOwner: Boolean(member.isGuildOwner), canManageAccess: true };
  }
  if (!member.inGuild || !member.isAdmin) return { ok: false, reason: 'not_admin' };

  const whitelist = readWhitelist(guildId);
  if (whitelist.enabled && !member.isGuildOwner) {
    const allowed =
      whitelist.userIds.includes(String(userId)) || (member.roleIds || []).some((r) => whitelist.roleIds.includes(String(r)));
    if (!allowed) return { ok: false, reason: 'not_whitelisted' };
  }

  return {
    ok: true,
    role: zone === 'mary' ? 'mary' : 'admin',
    zone,
    isGuildOwner: Boolean(member.isGuildOwner),
    canManageAccess: Boolean(member.isGuildOwner),
  };
}

module.exports = {
  getZone,
  isOwner,
  hasAdminBit,
  zoneAllows,
  readWhitelist,
  writeWhitelist,
  listAccessibleGuilds,
  checkGuildAccess,
};
