const fs = require('node:fs');
const path = require('node:path');
const { normalizeChannelValue, getGuildSettings, setGuildSettings } = require('./database');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const GUILD_CONFIGS_FILE = path.join(DATA_DIR, 'guildConfigs.json');
const GUILD_CONFIGS_BACKUP = `${GUILD_CONFIGS_FILE}.bak`;

let cache = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAllConfigs() {
  ensureDataDir();
  if (cache) return cache;

  if (fs.existsSync(GUILD_CONFIGS_FILE)) {
    try {
      const raw = fs.readFileSync(GUILD_CONFIGS_FILE, 'utf8');
      cache = JSON.parse(raw) || {};
      return cache;
    } catch (_) {
      try {
        if (fs.existsSync(GUILD_CONFIGS_BACKUP)) {
          cache = JSON.parse(fs.readFileSync(GUILD_CONFIGS_BACKUP, 'utf8')) || {};
          return cache;
        }
      } catch (__) {}
    }
  }

  cache = {};
  return cache;
}

function writeAllConfigs(data) {
  ensureDataDir();
  cache = data;
  const tmpFile = `${GUILD_CONFIGS_FILE}.${process.pid}.${Date.now()}.tmp`;
  const serialized = JSON.stringify(data, null, 2);

  try {
    fs.writeFileSync(tmpFile, serialized, 'utf8');
    if (fs.existsSync(GUILD_CONFIGS_FILE)) {
      try { fs.copyFileSync(GUILD_CONFIGS_FILE, GUILD_CONFIGS_BACKUP); } catch (_) {}
    }
    fs.renameSync(tmpFile, GUILD_CONFIGS_FILE);
  } catch (err) {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
    console.error('[guildConfigService] Erro ao gravar guildConfigs.json:', err.message);
  }
}

function getGuildConfig(guildId) {
  if (!guildId) return {};
  const all = readAllConfigs();
  const legacy = getGuildSettings(guildId) || {};
  return {
    ...legacy,
    ...(all[guildId] || {}),
  };
}

function updateGuildConfig(guildId, updates = {}) {
  if (!guildId) return {};
  const all = readAllConfigs();
  const current = all[guildId] || {};
  const updated = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
  };

  all[guildId] = updated;
  writeAllConfigs(all);

  // Mantém sincronização com legacy settings.json
  try {
    const legacyUpdates = {};
    if (updates.welcomeChannelId !== undefined) legacyUpdates.welcomeChannelId = updates.welcomeChannelId;
    if (updates.prefix !== undefined) legacyUpdates.prefix = updates.prefix;
    if (Object.keys(legacyUpdates).length > 0) {
      setGuildSettings(guildId, legacyUpdates);
    }
  } catch (_) {}

  return updated;
}

// =========================================================================
// Helpers Específicos para Canais e Sistemas
// =========================================================================

function getVentChannelId(guildId) {
  return getGuildConfig(guildId).ventChannelId || null;
}

function setVentChannelId(guildId, channelId) {
  const normalized = normalizeChannelValue(channelId);
  return updateGuildConfig(guildId, { ventChannelId: normalized });
}

function getTarotChannelId(guildId) {
  return getGuildConfig(guildId).tarotChannelId || null;
}

function setTarotChannelId(guildId, channelId) {
  const normalized = normalizeChannelValue(channelId);
  return updateGuildConfig(guildId, { tarotChannelId: normalized });
}

function getWelcomeConfig(guildId) {
  const cfg = getGuildConfig(guildId);
  return cfg.welcomeConfig || {
    channelId: cfg.welcomeChannelId || null,
    title: '🎉  ✦  Boas-vindas a {server}!',
    description: 'Que bom ter você aqui, {user}! Seja muito bem-vindo(a) à nossa comunidade.\nAtualmente somos **{memberCount}** pessoas.',
    imageUrl: '',
    color: '#8b5cf6',
    autoReactions: ['💗', '✨'],
    autoRoleId: null,
  };
}

function setWelcomeConfig(guildId, welcomeConfig) {
  const channelId = welcomeConfig.channelId ? normalizeChannelValue(welcomeConfig.channelId) : null;
  const current = getWelcomeConfig(guildId);
  const updatedWelcomeConfig = {
    ...current,
    ...welcomeConfig,
    channelId: channelId || current.channelId,
  };

  return updateGuildConfig(guildId, {
    welcomeChannelId: updatedWelcomeConfig.channelId,
    welcomeConfig: updatedWelcomeConfig,
  });
}

function getAllTarotGuildConfigs() {
  const all = readAllConfigs();
  const results = [];
  for (const [guildId, cfg] of Object.entries(all)) {
    if (cfg.tarotChannelId) {
      results.push({ guildId, channelId: cfg.tarotChannelId });
    }
  }
  return results;
}

// =========================================================================
// Helpers Específicos para Tickets Multi-Tenant
// =========================================================================

function getTicketConfig(guildId) {
  const cfg = getGuildConfig(guildId);
  return {
    ticketPanelChannelId: cfg.ticketPanelChannelId || null,
    ticketCategoryId: cfg.ticketCategoryId || null,
  };
}

function setTicketConfig(guildId, updates = {}) {
  const current = getTicketConfig(guildId);
  const updated = {
    ticketPanelChannelId: updates.ticketPanelChannelId !== undefined ? normalizeChannelValue(updates.ticketPanelChannelId) : current.ticketPanelChannelId,
    ticketCategoryId: updates.ticketCategoryId !== undefined ? normalizeChannelValue(updates.ticketCategoryId) : current.ticketCategoryId,
  };
  return updateGuildConfig(guildId, updated);
}

function getTicketPanelChannelId(guildId) {
  return getTicketConfig(guildId).ticketPanelChannelId;
}

function setTicketPanelChannelId(guildId, channelId) {
  return setTicketConfig(guildId, { ticketPanelChannelId: channelId });
}

function getTicketCategoryId(guildId) {
  return getTicketConfig(guildId).ticketCategoryId;
}

function setTicketCategoryId(guildId, categoryId) {
  return setTicketConfig(guildId, { ticketCategoryId: categoryId });
}

module.exports = {
  GUILD_CONFIGS_FILE,
  readAllConfigs,
  writeAllConfigs,
  getGuildConfig,
  updateGuildConfig,
  getVentChannelId,
  setVentChannelId,
  getTarotChannelId,
  setTarotChannelId,
  getWelcomeConfig,
  setWelcomeConfig,
  getAllTarotGuildConfigs,
  getTicketConfig,
  setTicketConfig,
  getTicketPanelChannelId,
  setTicketPanelChannelId,
  getTicketCategoryId,
  setTicketCategoryId,
};

