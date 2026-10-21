const fs = require('node:fs');
const path = require('node:path');
const { isBlacklisted } = require('./trustAndSafety');

const LIVE_SNAPSHOT_FILE = path.join(__dirname, '..', '..', 'data', 'liveGuildsSnapshot.json');
const LEGACY_SNAPSHOT_FILE = path.join(__dirname, '..', '..', 'data', 'guildsSnapshot.json');
const GUILD_CONFIGS_FILE = path.join(__dirname, '..', '..', 'data', 'guildConfigs.json');
const SEASONAL_CONFIG_FILE = path.join(__dirname, '..', '..', 'data', 'seasonalConfig.json');
const MARY_CONFIG_FILE = path.join(__dirname, '..', '..', 'data', 'maryStudioConfig.json');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error(`[guildDirectory] Erro ao gravar snapshot em ${filePath}:`, err.message);
  }
}

function formatDateBr(dateObj) {
  if (!dateObj) return 'Desconhecido';
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(d.getTime())) return 'Desconhecido';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Retorna os servidores default essenciais caso o bot ainda não tenha sincronizado
 */
function getBaselineGuilds() {
  return [
    {
      id: CRINGELANDIA_GUILD_ID,
      name: 'Cringelândia (Servidor Oficial)',
      iconUrl: 'https://cdn.discordapp.com/icons/1453890868980482090/a_canonical.png',
      joinedAt: '2026-08-01T12:00:00.000Z',
      joinedFormatted: '01/08/2026 12:00',
      joinedTimestamp: 1785585600000,
      memberCount: 350,
      ownerId: '214153735281180673',
    },
  ];
}

/**
 * Atualiza o snapshot de servidores a partir do cliente Discord vivo
 * Chamado nos eventos: ready, guildCreate, guildUpdate, guildDelete e na Onda de Verificação
 * @param {import('discord.js').Client} client
 */
function updateGuildsSnapshot(client) {
  if (!client || !client.guilds?.cache) return [];

  const guilds = [];
  for (const guild of client.guilds.cache.values()) {
    const joined = guild.joinedAt || new Date();
    guilds.push({
      id: guild.id,
      name: guild.name,
      iconUrl:
        guild.iconURL({ dynamic: true, size: 64 }) ||
        'https://cdn.discordapp.com/embed/avatars/0.png',
      joinedAt: joined.toISOString ? joined.toISOString() : new Date().toISOString(),
      joinedFormatted: formatDateBr(joined),
      joinedTimestamp: guild.joinedTimestamp || Date.now(),
      memberCount: guild.memberCount || 0,
      ownerId: guild.ownerId || '',
    });
  }

  // Ordena por data de ingresso (mais recentes primeiro)
  guilds.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp);

  // Persiste em liveGuildsSnapshot.json e no legado guildsSnapshot.json
  safeAtomicWrite(LIVE_SNAPSHOT_FILE, guilds);
  safeAtomicWrite(LEGACY_SNAPSHOT_FILE, guilds);

  return guilds;
}

/**
 * Retorna o diretório enriquecido de servidores para o /admin
 */
function getGuildsDirectory() {
  let snapshots = [];

  // Tenta ler liveGuildsSnapshot.json, com fallback para guildsSnapshot.json e baseline
  try {
    if (fs.existsSync(LIVE_SNAPSHOT_FILE)) {
      snapshots = JSON.parse(fs.readFileSync(LIVE_SNAPSHOT_FILE, 'utf8')) || [];
    } else if (fs.existsSync(LEGACY_SNAPSHOT_FILE)) {
      snapshots = JSON.parse(fs.readFileSync(LEGACY_SNAPSHOT_FILE, 'utf8')) || [];
    }
  } catch (_) {
    snapshots = [];
  }

  if (!Array.isArray(snapshots) || snapshots.length === 0) {
    snapshots = getBaselineGuilds();
    safeAtomicWrite(LIVE_SNAPSHOT_FILE, snapshots);
  }

  // Lê configurações específicas por guilda
  let configs = {};
  try {
    if (fs.existsSync(GUILD_CONFIGS_FILE)) {
      configs = JSON.parse(fs.readFileSync(GUILD_CONFIGS_FILE, 'utf8')) || {};
    }
  } catch (_) {
    configs = {};
  }

  // Lê configurações sazonais para detectar escopo de evento
  let seasonalScope = [];
  try {
    if (fs.existsSync(SEASONAL_CONFIG_FILE)) {
      const sCfg = JSON.parse(fs.readFileSync(SEASONAL_CONFIG_FILE, 'utf8')) || {};
      if (Array.isArray(sCfg.guildScope)) seasonalScope = sCfg.guildScope;
      else if (sCfg.active) seasonalScope = [CRINGELANDIA_GUILD_ID];
    }
  } catch (_) {}

  // Lê Mary Studio para detectar guilda vinculada
  let maryGuildId = CRINGELANDIA_GUILD_ID;
  try {
    if (fs.existsSync(MARY_CONFIG_FILE)) {
      const mCfg = JSON.parse(fs.readFileSync(MARY_CONFIG_FILE, 'utf8')) || {};
      if (mCfg.guildId) maryGuildId = mCfg.guildId;
    }
  } catch (_) {}

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

    // Calcula módulos ativos para este servidor
    const activeMods = new Set(Array.isArray(cfg.activeModules) ? cfg.activeModules : ['default', 'marriage', 'museum']);
    if (seasonalScope.includes(g.id)) {
      activeMods.add('seasonal');
    }
    if (g.id === maryGuildId) {
      activeMods.add('mary-studio');
    }

    const joinedDate = g.joinedAt ? new Date(g.joinedAt) : new Date(g.joinedTimestamp || Date.now());

    return {
      id: g.id,
      name: g.name,
      iconUrl: g.iconUrl,
      joinedAt: g.joinedAt || joinedDate.toISOString(),
      joinedFormatted: g.joinedFormatted || formatDateBr(joinedDate),
      joinedTimestamp: g.joinedTimestamp || joinedDate.getTime(),
      memberCount: g.memberCount || 0,
      ownerId: g.ownerId || '',
      lang: cfg.lang || (g.id === CRINGELANDIA_GUILD_ID ? 'pt-BR' : 'en'),
      prefix: cfg.prefix || 'py!',
      activeModules: Array.from(activeMods),
      commandVolume: totalCommands,
      blacklisted: bl.blacklisted,
      isOfficial: g.id === CRINGELANDIA_GUILD_ID,
    };
  });

  return enriched;
}

module.exports = {
  updateGuildsSnapshot,
  getGuildsDirectory,
  formatDateBr,
  LIVE_SNAPSHOT_FILE,
  LEGACY_SNAPSHOT_FILE,
};
