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
// Helpers Específicos para Canais e Sistemas (Deduplicação & Exclusão Atômica)
// =========================================================================

const DEDICATED_CHANNEL_FEATURES = {
  welcome: {
    key: 'welcome',
    name: { 'pt-BR': 'Boas-Vindas', en: 'Welcome' },
    get: (cfg) => cfg.welcomeChannelId || cfg.welcomeConfig?.channelId || null,
    set: (updates, id, currentCfg) => {
      updates.welcomeChannelId = id;
      const currentWelcome = currentCfg.welcomeConfig || {};
      updates.welcomeConfig = {
        ...currentWelcome,
        channelId: id,
      };
    },
    clear: (updates, currentCfg) => {
      updates.welcomeChannelId = null;
      if (currentCfg.welcomeConfig) {
        updates.welcomeConfig = {
          ...currentCfg.welcomeConfig,
          channelId: null,
        };
      }
    },
  },
  vent: {
    key: 'vent',
    name: { 'pt-BR': 'Desabafos', en: 'Vent / Mutual Support' },
    get: (cfg) => cfg.ventChannelId || null,
    set: (updates, id) => {
      updates.ventChannelId = id;
    },
    clear: (updates) => {
      updates.ventChannelId = null;
      updates.lastVentStickyId = null;
    },
  },
  tarot: {
    key: 'tarot',
    name: { 'pt-BR': 'Tarot Diário', en: 'Daily Tarot' },
    get: (cfg) => cfg.tarotChannelId || null,
    set: (updates, id) => {
      updates.tarotChannelId = id;
    },
    clear: (updates) => {
      updates.tarotChannelId = null;
    },
  },
  tickets: {
    key: 'tickets',
    name: { 'pt-BR': 'Tickets & Atendimento', en: 'Tickets & Support' },
    get: (cfg) => cfg.ticketPanelChannelId || null,
    set: (updates, id) => {
      updates.ticketPanelChannelId = id;
    },
    clear: (updates) => {
      updates.ticketPanelChannelId = null;
      updates.ticketPanelMessageId = null;
    },
  },
};

/**
 * Atribui um canal exclusivo a uma funcionalidade com deduplicação rigorosa:
 * 1. Impede setar 2x o mesmo canal para a mesma função (ALREADY_ASSIGNED).
 * 2. Impede múltiplos canais para a mesma função: desvincula o anterior e prioriza o último.
 * 3. Identifica conflitos cruzados (se o canal já pertencia a outra função) e desvincula da anterior.
 * 4. Retorna metadados completos para avisos e notificações ao usuário.
 */
function assignDedicatedChannel(guildId, featureKey, channelId) {
  if (!guildId || !featureKey) {
    return { status: 'ERROR', message: 'GuildId e featureKey são obrigatórios.' };
  }

  const targetDef = DEDICATED_CHANNEL_FEATURES[featureKey];
  if (!targetDef) {
    return { status: 'ERROR', message: `Funcionalidade desconhecida: ${featureKey}` };
  }

  const normalized = normalizeChannelValue(channelId);
  if (!normalized) {
    return { status: 'ERROR', message: 'ID de canal inválido.' };
  }

  const currentCfg = getGuildConfig(guildId);
  const currentAssigned = targetDef.get(currentCfg);

  // 1. Caso o usuário tente setar 2x exatamente o mesmo canal para a mesma função
  if (currentAssigned === normalized) {
    return {
      status: 'ALREADY_ASSIGNED',
      featureKey,
      featureName: targetDef.name['pt-BR'],
      featureNameEn: targetDef.name.en,
      channelId: normalized,
      previousChannelId: null,
      conflictFeature: null,
      conflictFeatureEn: null,
      config: currentCfg,
    };
  }

  const previousChannelId = currentAssigned || null;
  const updates = {};
  let conflictFeature = null;
  let conflictFeatureEn = null;

  // 2. Conflito cruzado: se o canal estava sendo usado para OUTRA função dedicada
  for (const [otherKey, otherDef] of Object.entries(DEDICATED_CHANNEL_FEATURES)) {
    if (otherKey !== featureKey) {
      const otherChannel = otherDef.get(currentCfg);
      if (otherChannel === normalized) {
        conflictFeature = otherDef.name['pt-BR'];
        conflictFeatureEn = otherDef.name.en;
        otherDef.clear(updates, currentCfg);
      }
    }
  }

  // 3. Aplica a nova função ao canal, excluindo o vínculo anterior e dando prioridade à última configuração
  targetDef.set(updates, normalized, currentCfg);

  const updatedConfig = updateGuildConfig(guildId, updates);

  return {
    status: 'ASSIGNED',
    featureKey,
    featureName: targetDef.name['pt-BR'],
    featureNameEn: targetDef.name.en,
    channelId: normalized,
    previousChannelId,
    conflictFeature,
    conflictFeatureEn,
    config: updatedConfig,
  };
}

function getVentChannelId(guildId) {
  return getGuildConfig(guildId).ventChannelId || null;
}

function setVentChannelId(guildId, channelId) {
  const res = assignDedicatedChannel(guildId, 'vent', channelId);
  return res.config || updateGuildConfig(guildId, { ventChannelId: normalizeChannelValue(channelId) });
}

function getTarotChannelId(guildId) {
  return getGuildConfig(guildId).tarotChannelId || null;
}

function setTarotChannelId(guildId, channelId) {
  const res = assignDedicatedChannel(guildId, 'tarot', channelId);
  return res.config || updateGuildConfig(guildId, { tarotChannelId: normalizeChannelValue(channelId) });
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
  const current = getWelcomeConfig(guildId);
  let baseConfig = current;

  if (welcomeConfig.channelId !== undefined) {
    const res = assignDedicatedChannel(guildId, 'welcome', welcomeConfig.channelId);
    if (res.config && Object.keys(welcomeConfig).length === 1) {
      return res.config;
    }
    if (res.config?.welcomeConfig) {
      baseConfig = res.config.welcomeConfig;
    }
  }

  const updatedWelcomeConfig = {
    ...baseConfig,
    ...welcomeConfig,
    channelId: welcomeConfig.channelId !== undefined ? normalizeChannelValue(welcomeConfig.channelId) : baseConfig.channelId,
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
    ticketPanelMessageId: cfg.ticketPanelMessageId || null,
  };
}

function setTicketConfig(guildId, updates = {}) {
  const current = getTicketConfig(guildId);
  const normalizedUpdates = {
    ticketPanelChannelId: updates.ticketPanelChannelId !== undefined ? normalizeChannelValue(updates.ticketPanelChannelId) : current.ticketPanelChannelId,
    ticketCategoryId: updates.ticketCategoryId !== undefined ? normalizeChannelValue(updates.ticketCategoryId) : current.ticketCategoryId,
    ticketPanelMessageId: updates.ticketPanelMessageId !== undefined ? updates.ticketPanelMessageId : current.ticketPanelMessageId,
  };
  return updateGuildConfig(guildId, normalizedUpdates);
}

function getTicketPanelChannelId(guildId) {
  return getTicketConfig(guildId).ticketPanelChannelId;
}

function setTicketPanelChannelId(guildId, channelId) {
  const res = assignDedicatedChannel(guildId, 'tickets', channelId);
  return res.config || setTicketConfig(guildId, { ticketPanelChannelId: channelId });
}

function getTicketCategoryId(guildId) {
  return getTicketConfig(guildId).ticketCategoryId;
}

function setTicketCategoryId(guildId, categoryId) {
  return setTicketConfig(guildId, { ticketCategoryId: categoryId });
}

module.exports = {
  GUILD_CONFIGS_FILE,
  DEDICATED_CHANNEL_FEATURES,
  assignDedicatedChannel,
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

