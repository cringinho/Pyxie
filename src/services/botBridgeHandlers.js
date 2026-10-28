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
      memory: require('./memoryGuard').status(),
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

  // Lista pública dos servidores com a Pyxie (área global do dono): só o que qualquer membro vê.
  async GUILD_DIRECTORY(client) {
    const out = [];
    for (const g of client.guilds.cache.values()) {
      const owner = client.users.cache.get(g.ownerId) || (await client.users.fetch(g.ownerId).catch(() => null));
      out.push({
        id: g.id,
        name: g.name,
        icon: g.iconURL({ size: 64 }) || null,
        description: g.description || '',
        memberCount: g.memberCount || 0,
        ownerId: g.ownerId,
        ownerName: owner ? owner.globalName || owner.username : '',
        createdAt: g.createdTimestamp,
        joinedAt: g.joinedTimestamp || null,
      });
    }
    return out.sort((a, b) => b.memberCount - a.memberCount);
  },

  // Emojis do servidor (para a tela de uso dos emojis).
  async GUILD_EMOJIS(client, { guildId }) {
    const guild = client.guilds.cache.get(String(guildId));
    if (!guild) throw new Error('guild_not_found');
    return guild.emojis.cache.map((e) => ({ id: e.id, name: e.name, animated: Boolean(e.animated), url: e.imageURL({ size: 64 }), createdAt: e.createdTimestamp }));
  },

  // Alertas automáticos de uso estranho: são contados no processo do bot.
  async RED_FLAGS() {
    return require('./trustAndSafety').getActiveRedFlags();
  },

  // Permissões da Pyxie no servidor (o painel mostra o que falta para cada recurso).
  async BOT_PERMISSIONS(client, { guildId }) {
    const guild = client.guilds.cache.get(String(guildId));
    if (!guild) throw new Error('guild_not_found');
    const me = guild.members.me;
    const names = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'ManageMessages', 'ModerateMembers', 'ViewAuditLog', 'ManageWebhooks', 'SendMessages', 'EmbedLinks', 'BanMembers'];
    return {
      permissions: Object.fromEntries(names.map((n) => [n, Boolean(me?.permissions.has(PermissionFlagsBits[n]))])),
      roleName: me?.roles.highest?.name || '',
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
