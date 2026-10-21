const fs = require('node:fs');
const path = require('node:path');
const { getIntrospectedCommands } = require('./commandIntrospector');

const TELEMETRY_FILE = path.join(__dirname, '..', '..', 'data', 'commandTelemetry.json');
const FLUSH_INTERVAL_MS = 60 * 1000; // 60 segundos

let telemetryState = {
  version: 2,
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

/**
 * Garante que todos os comandos descobertos no código existam na telemetria viva
 */
function hydrateFromIntrospector() {
  try {
    const introspected = getIntrospectedCommands();
    for (const cmd of introspected) {
      const canonicalName = cmd.name;
      if (!telemetryState.commands[canonicalName]) {
        telemetryState.commands[canonicalName] = {
          name: canonicalName,
          category: cmd.category || 'utilidades',
          moduleId: cmd.moduleId || 'core',
          discordScope: cmd.discordScope || 'global',
          accessLevel: cmd.accessLevel || 'public',
          total: 0,
          slash: 0,
          prefix: 0,
          errors: 0,
          totalDurationMs: 0,
          firstUsed: Date.now(),
          lastUsed: 0,
          languages: { 'pt-BR': 0, en: 0 },
          guilds: {},
          users: {},
          hourly: {},
        };
      } else {
        // Atualiza categoria e módulo caso tenha mudado no código
        const existing = telemetryState.commands[canonicalName];
        if (cmd.category && (!existing.category || existing.category === 'general')) {
          existing.category = cmd.category;
        }
        if (cmd.moduleId && !existing.moduleId) {
          existing.moduleId = cmd.moduleId;
        }
        if (cmd.discordScope && !existing.discordScope) {
          existing.discordScope = cmd.discordScope;
        }
      }
    }
  } catch (err) {
    console.warn('[commandTelemetry] Aviso ao sincronizar com commandIntrospector:', err.message);
  }
}

function loadTelemetry() {
  try {
    if (fs.existsSync(TELEMETRY_FILE)) {
      const raw = fs.readFileSync(TELEMETRY_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.commands === 'object') {
        telemetryState = {
          version: parsed.version || 2,
          lastFlush: parsed.lastFlush || Date.now(),
          commands: parsed.commands || {},
          hourlyBuckets: parsed.hourlyBuckets || {},
        };
      }
    }
  } catch (err) {
    console.warn('[commandTelemetry] Não foi possível ler telemetria anterior, iniciando limpo:', err.message);
  }
  hydrateFromIntrospector();
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
 * Registra a execução de um comando no bot (Coletor Universal em Runtime)
 * @param {Object} params
 * @param {string} [params.name]
 * @param {string} [params.commandName]
 * @param {'slash'|'prefix'} [params.type='slash']
 * @param {'slash'|'prefix'} [params.executionType]
 * @param {string|null} [params.guildId]
 * @param {string|null} [params.userId]
 * @param {string} [params.lang='pt-BR']
 * @param {boolean} [params.success=true]
 * @param {boolean} [params.isError]
 * @param {number} [params.durationMs=0]
 * @param {number} [params.latencyMs]
 * @param {string|null} [params.error=null]
 * @param {string|null} [params.category]
 * @param {string|null} [params.moduleId]
 */
function recordCommand(params) {
  if (!params) return;
  const rawName = params.commandName || params.name;
  if (!rawName || typeof rawName !== 'string') return;

  const canonicalName = rawName.toLowerCase().trim();
  const type = params.executionType || params.type || 'slash';
  const isErr = params.isError !== undefined ? Boolean(params.isError) : params.success === false;
  const duration = Math.max(0, params.latencyMs || params.durationMs || 0);
  const guildId = params.guildId || null;
  const userId = params.userId || null;
  const lang = params.lang || 'pt-BR';
  const category = params.category || null;
  const moduleId = params.moduleId || 'core';

  const now = Date.now();
  const hourKey = getHourKey(now);

  if (!telemetryState.commands[canonicalName]) {
    telemetryState.commands[canonicalName] = {
      name: canonicalName,
      category: category || 'utilidades',
      moduleId: moduleId || 'core',
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
      hourly: {},
    };
  }

  const cmd = telemetryState.commands[canonicalName];
  if (category && (!cmd.category || cmd.category === 'general' || cmd.category === 'utilidades')) {
    cmd.category = category;
  }
  if (moduleId && cmd.moduleId === 'core') {
    cmd.moduleId = moduleId;
  }

  cmd.total += 1;
  if (type === 'prefix') {
    cmd.prefix += 1;
  } else {
    cmd.slash += 1;
  }

  if (isErr) {
    cmd.errors += 1;
  }
  cmd.totalDurationMs += duration;
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
  if (isErr) cmd.hourly[hourKey].errors += 1;

  // Bucket Global
  if (!telemetryState.hourlyBuckets[hourKey]) {
    telemetryState.hourlyBuckets[hourKey] = { total: 0, slash: 0, prefix: 0, errors: 0, byCommand: {} };
  }
  const globalBucket = telemetryState.hourlyBuckets[hourKey];
  globalBucket.total += 1;
  if (type === 'prefix') globalBucket.prefix += 1;
  else globalBucket.slash += 1;
  if (isErr) globalBucket.errors += 1;
  globalBucket.byCommand[canonicalName] = (globalBucket.byCommand[canonicalName] || 0) + 1;

  isDirty = true;
}

function flushSync() {
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
 * NUNCA retorna /none; se todos tiverem 0 chamadas, elege o principal comando de trabalho (/py-work)
 */
function getTopCommand() {
  hydrateFromIntrospector();

  let top = null;
  let maxCalls = 0;

  for (const cmd of Object.values(telemetryState.commands)) {
    if (cmd.total > maxCalls) {
      maxCalls = cmd.total;
      top = cmd;
    }
  }

  if (!top || maxCalls === 0) {
    // Busca comando prioritário canônico (ex: py-work ou trabalho)
    top =
      telemetryState.commands['work'] ||
      telemetryState.commands['py-work'] ||
      telemetryState.commands['trabalho'] ||
      telemetryState.commands['daily'] ||
      Object.values(telemetryState.commands)[0] || {
        name: 'py-work',
        category: 'economia',
        total: 0,
        slash: 0,
        prefix: 0,
        errors: 0,
        errorRate: 0,
        lastUsed: 0,
      };
  }

  const errorRate = top.total > 0 ? Number(((top.errors / top.total) * 100).toFixed(2)) : 0;
  return {
    name: top.name,
    category: top.category || 'economia',
    total: top.total || 0,
    slash: top.slash || 0,
    prefix: top.prefix || 0,
    errors: top.errors || 0,
    errorRate,
    lastUsed: top.lastUsed || 0,
  };
}

/**
 * Retorna ranking completo pesquisável e filtrável de comandos
 * Garante que 100% dos comandos do código constem na lista mesmo com 0 execuções
 */
function getRanking({
  timeWindow = 'all',
  category = null,
  lang = null,
  guildId = null,
  search = '',
} = {}) {
  hydrateFromIntrospector();

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

    const errorRate = total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0;
    const avgDuration = total > 0 && cmd.totalDurationMs ? Math.round(cmd.totalDurationMs / cmd.total) : 0;

    // Cálculo de média diária
    const daysSinceFirst = Math.max(1, Math.ceil((now - (cmd.firstUsed || now)) / (24 * 60 * 60 * 1000)));
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
      category: cmd.category || 'utilidades',
      moduleId: cmd.moduleId || 'core',
      total,
      slash,
      prefix,
      errors,
      errorRate,
      dailyAverage,
      last24hCalls,
      avgDuration,
      lastUsed: cmd.lastUsed || 0,
    });
  }

  // Ordena por maior volume de chamadas; desempate por ordem alfabética
  results.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.name.localeCompare(b.name);
  });

  return results;
}

/**
 * Retorna série temporal filtrável para gráficos interativos (Chart.js)
 * @param {Object} options
 * @param {'24h'|'7d'|'30d'} [options.timeWindow='24h']
 * @param {string|null} [options.commandName]
 * @param {string|null} [options.category]
 */
function getTimeseries({ timeWindow = '24h', commandName = null, category = null } = {}) {
  hydrateFromIntrospector();

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
    } else if (category) {
      for (const c of Object.values(telemetryState.commands)) {
        if (c.category === category && c.hourly?.[hourKey]) {
          total += c.hourly[hourKey].total;
          slash += c.hourly[hourKey].slash;
          prefix += c.hourly[hourKey].prefix;
          errors += c.hourly[hourKey].errors;
        }
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
 * Retorna divisão de volume e contagem de comandos por categoria
 */
function getCategoryBreakdown() {
  hydrateFromIntrospector();
  const categories = {};

  for (const cmd of Object.values(telemetryState.commands)) {
    const cat = cmd.category || 'utilidades';
    if (!categories[cat]) {
      categories[cat] = { category: cat, totalCalls: 0, commandsCount: 0, slashCalls: 0, prefixCalls: 0 };
    }
    categories[cat].totalCalls += cmd.total || 0;
    categories[cat].slashCalls += cmd.slash || 0;
    categories[cat].prefixCalls += cmd.prefix || 0;
    categories[cat].commandsCount += 1;
  }

  return Object.values(categories);
}

/**
 * Retorna resumo geral de telemetria
 */
function getSummary() {
  hydrateFromIntrospector();
  const top = getTopCommand();
  const all = Object.values(telemetryState.commands);

  let totalCalls = 0;
  let totalSlash = 0;
  let totalPrefix = 0;
  let totalErrors = 0;

  for (const cmd of all) {
    totalCalls += cmd.total || 0;
    totalSlash += cmd.slash || 0;
    totalPrefix += cmd.prefix || 0;
    totalErrors += cmd.errors || 0;
  }

  const slashRatio = totalCalls > 0 ? Number(((totalSlash / totalCalls) * 100).toFixed(1)) : 100;
  const globalErrorRate = totalCalls > 0 ? Number(((totalErrors / totalCalls) * 100).toFixed(2)) : 0;

  return {
    trackedCommandsCount: all.length,
    totalCalls,
    totalSlash,
    totalPrefix,
    totalErrors,
    slashRatio,
    globalErrorRate,
    topCommand: top,
    categories: getCategoryBreakdown(),
  };
}

module.exports = {
  recordCommand,
  getTopCommand,
  getRanking,
  getTimeseries,
  getCategoryBreakdown,
  getSummary,
  flushSync,
};
