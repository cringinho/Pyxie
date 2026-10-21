const fs = require('node:fs');
const path = require('node:path');

const TELEMETRY_FILE = path.join(__dirname, '..', '..', 'data', 'commandTelemetry.json');
const FLUSH_INTERVAL_MS = 60 * 1000; // 60 segundos

let telemetryState = {
  version: 1,
  lastFlush: Date.now(),
  commands: {},
  hourlyBuckets: {}, // 'YYYY-MM-DD-HH': { total, slash, prefix, errors, byCommand: { [name]: count } }
};

let isDirty = false;
let flushTimer = null;

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error('[commandTelemetry] Erro ao gravar telemetria atomicamente:', err.message);
  }
}

function loadTelemetry() {
  try {
    if (fs.existsSync(TELEMETRY_FILE)) {
      const raw = fs.readFileSync(TELEMETRY_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.commands === 'object') {
        telemetryState = {
          version: parsed.version || 1,
          lastFlush: parsed.lastFlush || Date.now(),
          commands: parsed.commands || {},
          hourlyBuckets: parsed.hourlyBuckets || {},
        };
      }
    }
  } catch (err) {
    console.warn('[commandTelemetry] Não foi possível ler telemetria anterior, iniciando limpo:', err.message);
  }
}

function initTelemetry() {
  loadTelemetry();
  if (!flushTimer) {
    flushTimer = setInterval(() => {
      if (isDirty) {
        flushSync();
      }
    }, FLUSH_INTERVAL_MS);
    if (flushTimer.unref) flushTimer.unref();
  }
}

initTelemetry();

function getHourKey(timestamp = Date.now()) {
  const d = new Date(timestamp);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}-${hh}`;
}

/**
 * Registra a execução de um comando no bot
 * @param {Object} params
 * @param {string} params.name
 * @param {'slash'|'prefix'} [params.type='slash']
 * @param {string|null} [params.guildId]
 * @param {string|null} [params.userId]
 * @param {string} [params.lang='pt-BR']
 * @param {boolean} [params.success=true]
 * @param {number} [params.durationMs=0]
 * @param {string|null} [params.error=null]
 * @param {string|null} [params.category]
 */
function recordCommand({
  name,
  type = 'slash',
  guildId = null,
  userId = null,
  lang = 'pt-BR',
  success = true,
  durationMs = 0,
  error = null,
  category = null,
}) {
  if (!name || typeof name !== 'string') return;
  const canonicalName = name.toLowerCase().trim();
  const now = Date.now();
  const hourKey = getHourKey(now);

  if (!telemetryState.commands[canonicalName]) {
    telemetryState.commands[canonicalName] = {
      name: canonicalName,
      category: category || 'general',
      total: 0,
      slash: 0,
      prefix: 0,
      errors: 0,
      totalDurationMs: 0,
      firstUsed: now,
      lastUsed: now,
      languages: { 'pt-BR': 0, en: 0 },
      guilds: {},
      users: {},
      hourly: {}, // 'YYYY-MM-DD-HH': { total, slash, prefix, errors }
    };
  }

  const cmd = telemetryState.commands[canonicalName];
  if (category && (!cmd.category || cmd.category === 'general')) {
    cmd.category = category;
  }

  cmd.total += 1;
  if (type === 'prefix') {
    cmd.prefix += 1;
  } else {
    cmd.slash += 1;
  }

  if (!success) {
    cmd.errors += 1;
  }
  cmd.totalDurationMs += Math.max(0, durationMs || 0);
  cmd.lastUsed = now;

  const resolvedLang = lang?.toLowerCase().startsWith('en') ? 'en' : 'pt-BR';
  cmd.languages[resolvedLang] = (cmd.languages[resolvedLang] || 0) + 1;

  if (guildId) {
    cmd.guilds[guildId] = (cmd.guilds[guildId] || 0) + 1;
  }
  if (userId) {
    cmd.users[userId] = (cmd.users[userId] || 0) + 1;
  }

  if (!cmd.hourly[hourKey]) {
    cmd.hourly[hourKey] = { total: 0, slash: 0, prefix: 0, errors: 0 };
  }
  cmd.hourly[hourKey].total += 1;
  if (type === 'prefix') cmd.hourly[hourKey].prefix += 1;
  else cmd.hourly[hourKey].slash += 1;
  if (!success) cmd.hourly[hourKey].errors += 1;

  // Bucket Global
  if (!telemetryState.hourlyBuckets[hourKey]) {
    telemetryState.hourlyBuckets[hourKey] = { total: 0, slash: 0, prefix: 0, errors: 0, byCommand: {} };
  }
  const globalBucket = telemetryState.hourlyBuckets[hourKey];
  globalBucket.total += 1;
  if (type === 'prefix') globalBucket.prefix += 1;
  else globalBucket.slash += 1;
  if (!success) globalBucket.errors += 1;
  globalBucket.byCommand[canonicalName] = (globalBucket.byCommand[canonicalName] || 0) + 1;

  isDirty = true;
}

function flushSync() {
  // Purga buckets horários com mais de 45 dias para economia de memória/disco
  const cutoffTime = Date.now() - 45 * 24 * 60 * 60 * 1000;
  for (const hourKey of Object.keys(telemetryState.hourlyBuckets)) {
    const [y, m, d, h] = hourKey.split('-').map(Number);
    const time = Date.UTC(y, m - 1, d, h);
    if (time < cutoffTime) {
      delete telemetryState.hourlyBuckets[hourKey];
    }
  }

  telemetryState.lastFlush = Date.now();
  safeAtomicWrite(TELEMETRY_FILE, telemetryState);
  isDirty = false;
}

/**
 * Retorna o comando mais chamado (Top 1 Global)
 */
function getTopCommand() {
  let top = null;
  let maxCalls = -1;

  for (const cmd of Object.values(telemetryState.commands)) {
    if (cmd.total > maxCalls) {
      maxCalls = cmd.total;
      top = cmd;
    }
  }

  if (!top) {
    return { name: 'none', total: 0, slash: 0, prefix: 0, errors: 0, errorRate: 0 };
  }

  const errorRate = top.total > 0 ? Number(((top.errors / top.total) * 100).toFixed(2)) : 0;
  return {
    name: top.name,
    category: top.category,
    total: top.total,
    slash: top.slash,
    prefix: top.prefix,
    errors: top.errors,
    errorRate,
    lastUsed: top.lastUsed,
  };
}

/**
 * Retorna ranking completo pesquisável e filtrável de comandos
 * @param {Object} options
 * @param {'24h'|'7d'|'30d'|'all'} [options.timeWindow='all']
 * @param {string|null} [options.category]
 * @param {string|null} [options.lang]
 * @param {string|null} [options.guildId]
 * @param {string} [options.search='']
 */
function getRanking({
  timeWindow = 'all',
  category = null,
  lang = null,
  guildId = null,
  search = '',
} = {}) {
  const now = Date.now();
  let windowMs = 0;
  if (timeWindow === '24h') windowMs = 24 * 60 * 60 * 1000;
  else if (timeWindow === '7d') windowMs = 7 * 24 * 60 * 60 * 1000;
  else if (timeWindow === '30d') windowMs = 30 * 24 * 60 * 60 * 1000;

  const results = [];

  for (const cmd of Object.values(telemetryState.commands)) {
    if (category && cmd.category !== category) continue;
    if (search && !cmd.name.toLowerCase().includes(search.toLowerCase())) continue;

    let total = 0;
    let slash = 0;
    let prefix = 0;
    let errors = 0;

    if (windowMs > 0) {
      // Agrega dados dos buckets horários dentro da janela
      const cutoff = now - windowMs;
      for (const [hourKey, bucket] of Object.entries(cmd.hourly || {})) {
        const [y, m, d, h] = hourKey.split('-').map(Number);
        const time = Date.UTC(y, m - 1, d, h);
        if (time >= cutoff) {
          total += bucket.total;
          slash += bucket.slash;
          prefix += bucket.prefix;
          errors += bucket.errors;
        }
      }
    } else {
      total = cmd.total;
      slash = cmd.slash;
      prefix = cmd.prefix;
      errors = cmd.errors;
    }

    if (guildId && cmd.guilds) {
      // Se filtrado por guilda, usa total específico da guilda se não houver timeWindow menor
      if (windowMs === 0) {
        total = cmd.guilds[guildId] || 0;
      }
    }

    if (lang && cmd.languages) {
      const key = lang.toLowerCase().startsWith('en') ? 'en' : 'pt-BR';
      if (windowMs === 0) {
        total = cmd.languages[key] || 0;
      }
    }

    if (total === 0 && windowMs > 0) continue;

    const errorRate = total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0;
    const avgDuration = total > 0 ? Math.round(cmd.totalDurationMs / cmd.total) : 0;

    // Cálculo de média diária
    const daysSinceFirst = Math.max(1, Math.ceil((now - cmd.firstUsed) / (24 * 60 * 60 * 1000)));
    const dailyAverage = Number((cmd.total / daysSinceFirst).toFixed(1));

    // Chamadas nas últimas 24h
    let last24hCalls = 0;
    const cutoff24h = now - 24 * 60 * 60 * 1000;
    for (const [hourKey, bucket] of Object.entries(cmd.hourly || {})) {
      const [y, m, d, h] = hourKey.split('-').map(Number);
      const time = Date.UTC(y, m - 1, d, h);
      if (time >= cutoff24h) {
        last24hCalls += bucket.total;
      }
    }

    results.push({
      name: cmd.name,
      category: cmd.category || 'general',
      total,
      slash,
      prefix,
      errors,
      errorRate,
      dailyAverage,
      last24hCalls,
      avgDuration,
      lastUsed: cmd.lastUsed,
    });
  }

  results.sort((a, b) => b.total - a.total);
  return results;
}

/**
 * Retorna série temporal filtrável para gráficos interativos
 * @param {Object} options
 * @param {'24h'|'7d'|'30d'} [options.timeWindow='24h']
 * @param {string|null} [options.commandName]
 */
function getTimeseries({ timeWindow = '24h', commandName = null } = {}) {
  const now = Date.now();
  let hoursCount = 24;
  if (timeWindow === '7d') hoursCount = 7 * 24;
  if (timeWindow === '30d') hoursCount = 30 * 24;

  const points = [];
  const cmd = commandName ? telemetryState.commands[commandName.toLowerCase().trim()] : null;

  for (let i = hoursCount - 1; i >= 0; i--) {
    const time = now - i * 60 * 60 * 1000;
    const hourKey = getHourKey(time);

    let total = 0;
    let slash = 0;
    let prefix = 0;
    let errors = 0;

    if (cmd) {
      const b = cmd.hourly?.[hourKey];
      if (b) {
        total = b.total;
        slash = b.slash;
        prefix = b.prefix;
        errors = b.errors;
      }
    } else {
      const b = telemetryState.hourlyBuckets[hourKey];
      if (b) {
        total = b.total;
        slash = b.slash;
        prefix = b.prefix;
        errors = b.errors;
      }
    }

    points.push({
      hourKey,
      timestamp: time,
      total,
      slash,
      prefix,
      errors,
    });
  }

  return points;
}

/**
 * Retorna resumo geral de telemetria
 */
function getSummary() {
  const top = getTopCommand();
  let totalCalls = 0;
  let totalSlash = 0;
  let totalPrefix = 0;
  let totalErrors = 0;

  for (const cmd of Object.values(telemetryState.commands)) {
    totalCalls += cmd.total;
    totalSlash += cmd.slash;
    totalPrefix += cmd.prefix;
    totalErrors += cmd.errors;
  }

  const globalErrorRate = totalCalls > 0 ? Number(((totalErrors / totalCalls) * 100).toFixed(2)) : 0;
  const slashRatio = totalCalls > 0 ? Number(((totalSlash / totalCalls) * 100).toFixed(1)) : 0;

  return {
    totalCommandsTracked: Object.keys(telemetryState.commands).length,
    totalCalls,
    totalSlash,
    totalPrefix,
    slashRatio,
    totalErrors,
    globalErrorRate,
    topCommand: top,
  };
}

module.exports = {
  recordCommand,
  getTopCommand,
  getRanking,
  getTimeseries,
  getSummary,
  flushSync,
};
