const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const logsFile = path.join(dataDir, 'logs.json');
const statsFile = path.join(dataDir, 'stats.json');

const MAX_LOG_ENTRIES = 200;
const STATS_FLUSH_INTERVAL_MS = 10 * 1000; // Salva estatísticas a cada 10s se houver alterações
const LOGS_FLUSH_INTERVAL_MS = 5 * 1000;   // Salva logs a cada 5s se houver alterações

let cachedLogs = null;
let cachedStats = null;
let logsDirty = false;
let statsDirty = false;
let logsSaveTimeout = null;
let statsSaveTimeout = null;

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readJsonFile(filePath, fallback = {}) {
  ensureStorage();

  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  ensureStorage();
  const tempFile = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, filePath);
  } catch (error) {
    if (fs.existsSync(tempFile)) {
      try { fs.unlinkSync(tempFile); } catch (_) {}
    }
    // Fallback de escrita direta se renomeação falhar
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}

function scheduleLogsSave() {
  logsDirty = true;
  if (!logsSaveTimeout) {
    logsSaveTimeout = setTimeout(() => {
      logsSaveTimeout = null;
      if (logsDirty && cachedLogs) {
        writeJsonFile(logsFile, cachedLogs);
        logsDirty = false;
      }
    }, LOGS_FLUSH_INTERVAL_MS);
    if (logsSaveTimeout.unref) logsSaveTimeout.unref();
  }
}

function scheduleStatsSave() {
  statsDirty = true;
  if (!statsSaveTimeout) {
    statsSaveTimeout = setTimeout(() => {
      statsSaveTimeout = null;
      if (statsDirty && cachedStats) {
        writeJsonFile(statsFile, cachedStats);
        statsDirty = false;
      }
    }, STATS_FLUSH_INTERVAL_MS);
    if (statsSaveTimeout.unref) statsSaveTimeout.unref();
  }
}

function flushSync() {
  if (logsDirty && cachedLogs) {
    writeJsonFile(logsFile, cachedLogs);
    logsDirty = false;
  }
  if (statsDirty && cachedStats) {
    writeJsonFile(statsFile, cachedStats);
    statsDirty = false;
  }
}

function categorizeLogMessage(msg) {
  if (!msg || typeof msg !== 'string') return 'INFO';
  const m = msg.toUpperCase();
  if (m.includes('ERROR') || m.includes('ERR_') || m.includes('EXCEPTION') || m.includes('REJECTION') || m.includes('FAILED') || m.includes('FALHA') || m.includes('TYPEERROR')) {
    return 'ERROR';
  }
  if (m.includes('[CMD]') || m.includes('[COMMAND]') || m.includes('INTERACTION') || m.includes('SLASH') || m.includes('COMANDO') || m.includes('EXECUTOU')) {
    return 'COMMAND';
  }
  if (m.includes('[SYSTEM]') || m.includes('[IPC') || m.includes('SUPERVISOR') || m.includes('INICIANDO') || m.includes('ENCERRANDO') || m.includes('PM2') || m.includes('MÓDULO') || m.includes('READY') || m.includes('CONECTADA')) {
    return 'SYSTEM';
  }
  return 'INFO';
}

function isSpamLog(msg) {
  if (!msg || typeof msg !== 'string') return false;
  // Interrompe spam de leitura de arquivo em disco ou matchers repetitivos
  if (msg.includes('Emojis:Matcher') || msg.includes('[Matcher]') || msg.includes('Matcher:') || msg.includes('readJsonFile')) {
    return true;
  }
  return false;
}

function addLog(message, forcedCategory = null) {
  if (isSpamLog(message)) return;

  const timestamp = new Date().toISOString();
  if (!cachedLogs) {
    cachedLogs = readJsonFile(logsFile, { entries: [] });
    if (!Array.isArray(cachedLogs.entries)) cachedLogs.entries = [];
  }

  const category = forcedCategory || categorizeLogMessage(message);

  cachedLogs.entries.push({
    timestamp,
    message,
    category,
  });

  if (cachedLogs.entries.length > MAX_LOG_ENTRIES) {
    cachedLogs.entries = cachedLogs.entries.slice(-MAX_LOG_ENTRIES);
  }

  scheduleLogsSave();
}

function getLogs(limit = 100, categoryFilter = 'ALL') {
  if (!cachedLogs) {
    cachedLogs = readJsonFile(logsFile, { entries: [] });
    if (!Array.isArray(cachedLogs.entries)) cachedLogs.entries = [];
  }

  let entries = cachedLogs.entries;
  if (categoryFilter && categoryFilter !== 'ALL') {
    const filter = String(categoryFilter).toUpperCase();
    entries = entries.filter((e) => (e.category || categorizeLogMessage(e.message)) === filter);
  }

  return entries.slice(-limit).reverse();
}

function clearLogs() {
  cachedLogs = { entries: [] };
  writeJsonFile(logsFile, cachedLogs);
  logsDirty = false;
}

function normalizeStats(stats = {}) {
  return {
    startTime: stats.startTime || new Date().toISOString(),
    commandsExecuted: Number(stats.commandsExecuted || 0),
    messagesProcessed: Number(stats.messagesProcessed || 0),
    usersEngaged: Number(stats.usersEngaged || 0),
    totalMembers: Number(stats.totalMembers || stats.usersEngaged || 0),
    guildsCount: Number(stats.guildsCount || 1),
    uniqueUsers: Array.isArray(stats.uniqueUsers)
      ? stats.uniqueUsers.join(',')
      : typeof stats.uniqueUsers === 'string'
        ? stats.uniqueUsers
        : '',
    uptimeMs: Number(stats.uptimeMs || 0),
  };
}

function getStats() {
  if (!cachedStats) {
    const fromDisk = readJsonFile(statsFile, {
      startTime: new Date().toISOString(),
      commandsExecuted: 0,
      messagesProcessed: 0,
      usersEngaged: 0,
      totalMembers: 0,
      guildsCount: 1,
      uniqueUsers: '',
      uptimeMs: 0,
    });
    cachedStats = normalizeStats(fromDisk);
  }
  return cachedStats;
}

function updateStats(updates) {
  const current = getStats();
  cachedStats = normalizeStats({ ...current, ...updates });
  scheduleStatsSave();
  return cachedStats;
}

function incrementCommand() {
  const current = getStats();
  return updateStats({
    commandsExecuted: Number(current.commandsExecuted || 0) + 1,
  });
}

function incrementMessages() {
  const current = getStats();
  return updateStats({
    messagesProcessed: Number(current.messagesProcessed || 0) + 1,
  });
}

function recordUniqueUser(userId) {
  const current = getStats();
  const uniqueUsersStr = typeof current.uniqueUsers === 'string' ? current.uniqueUsers : '';
  const userSet = new Set(uniqueUsersStr.split(',').filter(Boolean));
  
  if (!userSet.has(String(userId))) {
    userSet.add(String(userId));
    return updateStats({
      uniqueUsers: Array.from(userSet).join(','),
      usersEngaged: userSet.size,
    });
  }

  return current;
}

function resetStats() {
  cachedStats = {
    startTime: new Date().toISOString(),
    commandsExecuted: 0,
    messagesProcessed: 0,
    usersEngaged: 0,
    uniqueUsers: '',
    uptimeMs: 0,
  };

  writeJsonFile(statsFile, cachedStats);
  statsDirty = false;
  return cachedStats;
}

module.exports = {
  addLog,
  getLogs,
  clearLogs,
  getStats,
  updateStats,
  incrementCommand,
  incrementMessages,
  recordUniqueUser,
  resetStats,
  flushSync,
};
