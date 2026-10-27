// Lado do bot da ponte site ↔ bot (ver botBridge.js). Responde só com dados do cache do discord.js
// ou de chamadas simples à API, sempre em JSON pequeno.
const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { BRIDGE_PREFIX } = require('./botBridge');

const handlers = {
  // Servidores onde a Pyxie está.
  async GUILD_LIST(client) {
    return client.guilds.cache.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.iconURL({ size: 128 }) || null,
      ownerId: g.ownerId,
      memberCount: g.memberCount || 0,
    }));
  },

  // Saúde do processo do bot e da conexão com o Discord.
  async BOT_HEALTH(client) {
    const mem = process.memoryUsage();
    return {
      ready: client.isReady(),
      wsPingMs: Math.round(client.ws.ping),
      wsStatus: client.ws.status,
      guildCount: client.guilds.cache.size,
      uptimeMs: client.uptime || 0,
      rssMb: +(mem.rss / 1024 / 1024).toFixed(1),
      heapUsedMb: +(mem.heapUsed / 1024 / 1024).toFixed(1),
    };
  },

  // Permissão atual de um membro: dono da guild, Administrator e cargos.
  async MEMBER_ACCESS(client, { guildId, userId }) {
    const guild = client.guilds.cache.get(String(guildId));
    if (!guild) return { inGuild: false, botInGuild: false };
    let member = guild.members.cache.get(String(userId));
    if (!member) {
      member = await guild.members.fetch(String(userId)).catch(() => null);
    }
    if (!member) return { inGuild: false, botInGuild: true };
    return {
      inGuild: true,
      botInGuild: true,
      isGuildOwner: guild.ownerId === member.id,
      isAdmin: guild.ownerId === member.id || member.permissions.has(PermissionFlagsBits.Administrator),
      roleIds: member.roles.cache.map((r) => r.id),
    };
  },

  async GUILD_CHANNELS(client, { guildId }) {
    const guild = client.guilds.cache.get(String(guildId));
    if (!guild) throw new Error('guild_not_found');
    return guild.channels.cache
      .filter((c) => c.type !== ChannelType.DM)
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId || null,
        position: c.rawPosition ?? c.position ?? 0,
      }))
      .sort((a, b) => a.position - b.position);
  },

  async GUILD_ROLES(client, { guildId }) {
    const guild = client.guilds.cache.get(String(guildId));
    if (!guild) throw new Error('guild_not_found');
    const botTop = guild.members.me?.roles.highest?.position ?? 0;
    return guild.roles.cache
      .filter((r) => r.id !== guild.id)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        position: r.position,
        managed: r.managed,
        assignable: !r.managed && r.position < botTop,
      }))
      .sort((a, b) => b.position - a.position);
  },
};

function registerBridgeHandler(type, fn) {
  handlers[type] = fn;
}

function reply(message) {
  process.stdout.write(`${BRIDGE_PREFIX}${JSON.stringify(message)}\n`);
}

async function handleBridgeRequest(client, data) {
  const handler = handlers[data.request];
  if (!handler) {
    reply({ id: data.id, ok: false, error: 'unknown_request' });
    return;
  }
  try {
    const result = await handler(client, data.payload || {});
    reply({ id: data.id, ok: true, data: result });
  } catch (err) {
    reply({ id: data.id, ok: false, error: err.message || 'bridge_error' });
  }
}

module.exports = { handleBridgeRequest, registerBridgeHandler, handlers };
