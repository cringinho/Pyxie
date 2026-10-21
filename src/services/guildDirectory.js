const fs = require('node:fs');
const path = require('node:path');
const { isBlacklisted } = require('./trustAndSafety');

const SNAPSHOT_FILE = path.join(__dirname, '..', '..', 'data', 'guildsSnapshot.json');
const GUILD_CONFIGS_FILE = path.join(__dirname, '..', '..', 'data', 'guildConfigs.json');

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error('[guildDirectory] Erro ao gravar guildsSnapshot.json:', err.message);
  }
}

/**
 * Atualiza o snapshot de servidores a partir do cliente Discord
 * @param {import('discord.js').Client} client
 */
function updateGuildsSnapshot(client) {
  if (!client || !client.guilds?.cache) return [];

  const guilds = [];
  for (const guild of client.guilds.cache.values()) {
    guilds.push({
      id: guild.id,
      name: guild.name,
      iconUrl: guild.iconURL({ dynamic: true, size: 64 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
      joinedAt: guild.joinedAt ? guild.joinedAt.toISOString() : null,
      joinedTimestamp: guild.joinedTimestamp || Date.now(),
      memberCount: guild.memberCount || 0,
      ownerId: guild.ownerId,
    });
  }

  safeAtomicWrite(SNAPSHOT_FILE, guilds);
  return guilds;
}

/**
 * Retorna o diretório enriquecido de servidores para o /admin
 */
function getGuildsDirectory() {
  let snapshots = [];
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      snapshots = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')) || [];
    }
  } catch (_) {
    snapshots = [];
  }

  let configs = {};
  try {
    if (fs.existsSync(GUILD_CONFIGS_FILE)) {
      configs = JSON.parse(fs.readFileSync(GUILD_CONFIGS_FILE, 'utf8')) || {};
    }
  } catch (_) {
    configs = {};
  }

  // Coleta volume de comandos por guilda da telemetria
  let cmdTelemetry = {};
  try {
    const teleFile = path.join(__dirname, '..', '..', 'data', 'commandTelemetry.json');
    if (fs.existsSync(teleFile)) {
      const parsed = JSON.parse(fs.readFileSync(teleFile, 'utf8'));
      cmdTelemetry = parsed.commands || {};
    }
  } catch (_) {}

  const enriched = snapshots.map((g) => {
    const cfg = configs[g.id] || {};
    const bl = isBlacklisted({ guildId: g.id });

    // Calcula volume total de comandos neste servidor
    let totalCommands = 0;
    for (const cmd of Object.values(cmdTelemetry)) {
      if (cmd.guilds && cmd.guilds[g.id]) {
        totalCommands += cmd.guilds[g.id];
      }
    }

    return {
      id: g.id,
      name: g.name,
      iconUrl: g.iconUrl,
      joinedAt: g.joinedAt,
      joinedTimestamp: g.joinedTimestamp,
      memberCount: g.memberCount,
      ownerId: g.ownerId,
      lang: cfg.lang || 'pt-BR',
      prefix: cfg.prefix || 'py!',
      activeModules: Array.isArray(cfg.activeModules) ? cfg.activeModules : ['default'],
      commandVolume: totalCommands,
      blacklisted: bl.blacklisted,
      blacklistReason: bl.reason,
    };
  });

  enriched.sort((a, b) => b.memberCount - a.memberCount);
  return enriched;
}

module.exports = {
  updateGuildsSnapshot,
  getGuildsDirectory,
};

