// Faxina de convites: lista os convites que ninguém usou há dias e revoga os escolhidos.
// Evita o teto de 1.000 convites e tira de circulação links esquecidos. Nunca mexe no link
// personalizado do servidor nem nos convites do dono. Faxina semanal automática é opcional.
const fs = require('node:fs');
const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const safety = require('../../services/guildSafety');
const { registerBridgeHandler } = require('../../services/botBridgeHandlers');

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

function stateFile(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'guilds', String(guildId), 'inviteClean.json');
}

function lastRun(guildId) {
  try {
    return JSON.parse(fs.readFileSync(stateFile(guildId), 'utf8')).lastRunAt || 0;
  } catch (_) {
    return 0;
  }
}

function markRun(guildId, now) {
  const file = stateFile(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ lastRunAt: now }));
  fs.renameSync(`${file}.tmp`, file);
}

// Parado = zero usos, criado há mais de `days` dias, não é do dono nem o link personalizado.
function isStale(invite, guild, days, now = Date.now()) {
  if (!invite || invite.code === guild.vanityURLCode) return false;
  if ((invite.uses || 0) > 0) return false;
  if (invite.inviterId && invite.inviterId === guild.ownerId) return false;
  return Boolean(invite.createdTimestamp) && now - invite.createdTimestamp > days * DAY;
}

async function fetchStale(guild, days, now = Date.now()) {
  if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) throw new Error('missing_manage_guild');
  const invites = await guild.invites.fetch();
  return [...invites.values()].filter((i) => isStale(i, guild, days, now));
}

async function listStale(client, { guildId, days }) {
  const guild = client.guilds.cache.get(String(guildId));
  if (!guild) throw new Error('guild_not_found');
  return (await fetchStale(guild, days)).map((i) => ({
    code: i.code,
    inviter: i.inviter ? i.inviter.globalName || i.inviter.username : '',
    channel: i.channel?.name || '',
    createdAt: i.createdTimestamp,
    expiresAt: i.expiresTimestamp || null,
  }));
}

// Revoga só os códigos pedidos que continuam parados (confere de novo na hora).
async function revoke(client, { guildId, codes, days, by = null }) {
  const guild = client.guilds.cache.get(String(guildId));
  if (!guild) throw new Error('guild_not_found');
  const wanted = new Set(codes || []);
  const stale = (await fetchStale(guild, days)).filter((i) => !codes || wanted.has(i.code));
  let revoked = 0;
  for (const invite of stale) {
    if (await invite.delete('Pyxie: convite parado sem uso').then(() => true).catch(() => false)) revoked += 1;
  }
  if (revoked) safety.recordEvent(guild.id, { type: 'invites', count: revoked, executorId: by, action: 'revoked' });
  return { revoked };
}

async function autoClean(client, now = Date.now()) {
  for (const guild of client.guilds.cache.values()) {
    const cfg = safety.getConfig(guild.id).invites;
    if (!cfg.autoClean || now - lastRun(guild.id) < WEEK) continue;
    markRun(guild.id, now);
    await revoke(client, { guildId: guild.id, codes: null, days: cfg.days }).catch(() => null);
  }
}

module.exports = {
  id: 'invite-cleaner',
  name: { 'pt-BR': 'Faxina de Convites', en: 'Invite Cleanup' },
  description: {
    'pt-BR': 'Lista os convites que ninguém usou há dias e revoga os escolhidos. Nunca mexe no link personalizado nem nos convites do dono. Faxina semanal opcional.',
    en: 'Lists invites nobody used in days and revokes the chosen ones. Never touches the vanity link or the owner’s invites. Optional weekly cleanup.',
  },
  icon: '🧹',
  defaultEnabled: true,
  isStale,
  listStale,
  revoke,
  autoClean,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    registerBridgeHandler('INVITES_STALE', listStale);
    registerBridgeHandler('INVITES_REVOKE', revoke);
    ctx.registerInterval(() => autoClean(ctx.client).catch((err) => console.error('[InviteCleaner] Erro na faxina:', err)), 6 * 60 * 60 * 1000);
  },
};
