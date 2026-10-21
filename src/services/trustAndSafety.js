const fs = require('node:fs');
const path = require('node:path');

const BLACKLIST_FILE = path.join(__dirname, '..', '..', 'data', 'blacklist.json');

let blacklistData = {
  guilds: {},
  users: {},
};

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error('[trustAndSafety] Erro ao gravar blacklist:', err.message);
  }
}

function loadBlacklist() {
  try {
    if (fs.existsSync(BLACKLIST_FILE)) {
      const raw = fs.readFileSync(BLACKLIST_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed) {
        blacklistData = {
          guilds: parsed.guilds || {},
          users: parsed.users || {},
        };
      }
    }
  } catch (err) {
    console.warn('[trustAndSafety] Falha ao carregar blacklist, iniciando padrão vazio:', err.message);
  }
}

loadBlacklist();

// In-Memory Anomaly Tracker (Sliding Window 5 minutos)
const userStats = new Map();
const guildStats = new Map();
const redFlags = new Map(); // id -> { id, targetType, targetId, severity, reason, count, detectedAt }

const INJECTION_PATTERNS = [
  /(\bselect\b|\bunion\b|\bdrop\b|\binsert\b|\bdelete\b).+--/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /\b(exec|execute|xp_cmdshell|powershell|chmod\s+\+x)\b/i,
  /\b(nazi|pedofil|cp_links|childabuse|doxx|swatting)\b/i,
];

function cleanOldStats(map, windowMs = 5 * 60 * 1000) {
  const cutoff = Date.now() - windowMs;
  for (const [key, item] of map.entries()) {
    item.timestamps = item.timestamps.filter((t) => t > cutoff);
    item.errors = item.errors.filter((t) => t > cutoff);
    if (item.timestamps.length === 0 && item.errors.length === 0) {
      map.delete(key);
    }
  }
}

// Cleanup periódico a cada 2 minutos
const cleanupInterval = setInterval(() => {
  cleanOldStats(userStats);
  cleanOldStats(guildStats);

  // Expira red flags antigas após 30 minutos se não recorrentes
  const flagCutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, flag] of redFlags.entries()) {
    if (flag.detectedAt < flagCutoff) {
      redFlags.delete(key);
    }
  }
}, 2 * 60 * 1000);
if (cleanupInterval.unref) cleanupInterval.unref();

/**
 * Verifica se um usuário ou guilda está na Blacklist Global
 * @param {Object} params
 * @param {string|null} [params.guildId]
 * @param {string|null} [params.userId]
 * @returns {{ blacklisted: boolean, type: 'guild'|'user'|null, reason: string|null }}
 */
function isBlacklisted({ guildId = null, userId = null } = {}) {
  if (guildId && blacklistData.guilds[guildId]) {
    return {
      blacklisted: true,
      type: 'guild',
      reason: blacklistData.guilds[guildId].reason || 'Servidor banido na Blacklist Global.',
    };
  }
  if (userId && blacklistData.users[userId]) {
    return {
      blacklisted: true,
      type: 'user',
      reason: blacklistData.users[userId].reason || 'Usuário banido na Blacklist Global.',
    };
  }
  return { blacklisted: false, type: null, reason: null };
}

/**
 * Adiciona um alvo à Blacklist Global
 */
function blacklistTarget({ type, id, reason = 'Violação de Termos / Abuso', bannedBy = 'admin' }) {
  if (!id || (type !== 'guild' && type !== 'user')) {
    throw new Error('Parâmetros inválidos para blacklist: type deve ser "guild" ou "user".');
  }

  const record = {
    id: String(id),
    type,
    reason: String(reason),
    bannedBy: String(bannedBy),
    bannedAt: Date.now(),
  };

  if (type === 'guild') {
    blacklistData.guilds[String(id)] = record;
  } else {
    blacklistData.users[String(id)] = record;
  }

  safeAtomicWrite(BLACKLIST_FILE, blacklistData);
  return record;
}

/**
 * Remove um alvo da Blacklist Global
 */
function unblacklistTarget({ type, id }) {
  if (!id || (type !== 'guild' && type !== 'user')) {
    throw new Error('Parâmetros inválidos para desbanimento.');
  }

  let removed = false;
  if (type === 'guild' && blacklistData.guilds[String(id)]) {
    delete blacklistData.guilds[String(id)];
    removed = true;
  } else if (type === 'user' && blacklistData.users[String(id)]) {
    delete blacklistData.users[String(id)];
    removed = true;
  }

  if (removed) {
    safeAtomicWrite(BLACKLIST_FILE, blacklistData);
  }
  return removed;
}

/**
 * Retorna todos os registros da Blacklist
 */
function getBlacklist() {
  return {
    guilds: Object.values(blacklistData.guilds),
    users: Object.values(blacklistData.users),
  };
}

/**
 * Audita atividade de comandos e inputs para detecção de Red Flags
 */
function recordActivity({ userId, guildId, success = true, textInput = null, context = '' }) {
  const now = Date.now();

  // 1. Auditoria de Usuário
  if (userId) {
    const uId = String(userId);
    if (!userStats.has(uId)) {
      userStats.set(uId, { timestamps: [], errors: [] });
    }
    const u = userStats.get(uId);
    u.timestamps.push(now);
    if (!success) u.errors.push(now);

    // Detecção de Flood / Spam (> 25 comandos em 60 segundos)
    const recentCommands = u.timestamps.filter((t) => now - t <= 60 * 1000).length;
    if (recentCommands > 25) {
      redFlags.set(`user_flood_${uId}`, {
        id: `user_flood_${uId}`,
        targetType: 'user',
        targetId: uId,
        severity: 'HIGH',
        reason: `Pico anômalo de comandos: ${recentCommands} requisições/minuto.`,
        count: recentCommands,
        detectedAt: now,
      });
    }

    // Detecção de Taxa de Erro Anômala (> 5 erros em 60s)
    const recentErrors = u.errors.filter((t) => now - t <= 60 * 1000).length;
    if (recentErrors >= 6) {
      redFlags.set(`user_errors_${uId}`, {
        id: `user_errors_${uId}`,
        targetType: 'user',
        targetId: uId,
        severity: 'MEDIUM',
        reason: `Alta frequência de erros operacionais: ${recentErrors} falhas recentes.`,
        count: recentErrors,
        detectedAt: now,
      });
    }
  }

  // 2. Auditoria de Guilda
  if (guildId) {
    const gId = String(guildId);
    if (!guildStats.has(gId)) {
      guildStats.set(gId, { timestamps: [], errors: [] });
    }
    const g = guildStats.get(gId);
    g.timestamps.push(now);
    if (!success) g.errors.push(now);

    // Detecção de Raid / Bot Storm (> 80 comandos em 60s no servidor)
    const recentGuildCmds = g.timestamps.filter((t) => now - t <= 60 * 1000).length;
    if (recentGuildCmds > 80) {
      redFlags.set(`guild_raid_${gId}`, {
        id: `guild_raid_${gId}`,
        targetType: 'guild',
        targetId: gId,
        severity: 'CRITICAL',
        reason: `Possível ataque de raid / flood em massa: ${recentGuildCmds} comandos/minuto no servidor.`,
        count: recentGuildCmds,
        detectedAt: now,
      });
    }
  }

  // 3. Verificação de Text Inputs contra injeções ou termos ilegais
  if (textInput && typeof textInput === 'string') {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(textInput)) {
        const flagId = `input_flag_${userId || guildId}_${Date.now()}`;
        redFlags.set(flagId, {
          id: flagId,
          targetType: userId ? 'user' : 'guild',
          targetId: userId || guildId,
          severity: 'CRITICAL',
          reason: `Tentativa de injeção ou termo ilícito detectado no input (${context || 'geral'}).`,
          snippet: textInput.slice(0, 100),
          detectedAt: now,
        });
        break;
      }
    }
  }
}

/**
 * Retorna lista de Red Flags ativas para o topo do Dashboard Admin
 */
function getActiveRedFlags() {
  const flags = Array.from(redFlags.values());
  flags.sort((a, b) => {
    const sevOrder = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
    return (sevOrder[b.severity] || 0) - (sevOrder[a.severity] || 0) || b.detectedAt - a.detectedAt;
  });
  return flags;
}

/**
 * 1-Click Action: Forçar Saída do Servidor (Force Leave Guild)
 */
async function forceLeaveGuild(client, guildId) {
  if (!client) throw new Error('Cliente Discord não conectado.');
  const guild = client.guilds.cache.get(String(guildId)) || (await client.guilds.fetch(String(guildId)).catch(() => null));
  if (!guild) {
    throw new Error(`Servidor ${guildId} não encontrado no cache nem na API.`);
  }

  const guildName = guild.name;
  await guild.leave();
  console.log(`[Trust&Safety] Pyxie forçou saída imediata do servidor: ${guildName} (${guildId})`);
  return { success: true, guildId, guildName };
}

/**
 * 1-Click Action: Exportar Dossiê de Compliance Legal (JSON e CSV)
 */
function exportComplianceDossier(targetType, targetId) {
  const id = String(targetId);
  const now = new Date().toISOString();

  // Coleta dados disponíveis de economia, logs e configurações
  let economyData = null;
  let configData = null;
  const historyLogs = [];

  try {
    const ecoFile = path.join(__dirname, '..', '..', 'data', 'economy.json');
    if (fs.existsSync(ecoFile)) {
      const allEco = JSON.parse(fs.readFileSync(ecoFile, 'utf8'));
      if (targetType === 'user' && allEco[id]) {
        economyData = allEco[id];
      }
    }
  } catch (_) {}

  try {
    const cfgFile = path.join(__dirname, '..', '..', 'data', 'guildConfigs.json');
    if (fs.existsSync(cfgFile)) {
      const allCfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
      if (targetType === 'guild' && allCfg[id]) {
        configData = allCfg[id];
      }
    }
  } catch (_) {}

  const dossierJson = {
    metadata: {
      generatedAt: now,
      purpose: 'Compliance Dossier & Legal Audit (LGPD / GDPR / Marco Civil da Internet)',
      targetType,
      targetId: id,
      blacklisted: isBlacklisted({ [targetType === 'guild' ? 'guildId' : 'userId']: id }).blacklisted,
    },
    data: {
      economy: economyData,
      guildConfig: configData,
    },
    recentRedFlags: Array.from(redFlags.values()).filter((f) => f.targetId === id),
  };

  // Montagem do CSV
  const csvRows = [
    ['CAMPO', 'VALOR'],
    ['TargetType', targetType],
    ['TargetID', id],
    ['GeradoEm', now],
    ['Blacklisted', dossierJson.metadata.blacklisted ? 'SIM' : 'NAO'],
    ['SaldoMoedas', economyData?.coins ?? 'N/A'],
    ['FeijoesMagicos', economyData?.magicBeans ?? 'N/A'],
    ['RedFlagsDetectadas', dossierJson.recentRedFlags.length],
  ];

  const csv = csvRows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

  return {
    json: dossierJson,
    csv,
  };
}

module.exports = {
  isBlacklisted,
  blacklistTarget,
  unblacklistTarget,
  getBlacklist,
  recordActivity,
  getActiveRedFlags,
  forceLeaveGuild,
  exportComplianceDossier,
};

