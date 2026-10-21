const os = require('node:os');

// Módulos monitorados
const MODULE_IDS = ['marriage', 'seasonal', 'museum', 'partnerships', 'mary-studio', 'admin'];

const moduleStats = new Map();
for (const id of MODULE_IDS) {
  moduleStats.set(id, {
    id,
    name: id === 'admin' ? 'Painel Admin (Backoffice)' : `Módulo: ${id}`,
    cpuTimeMs: 0,
    networkBytesIn: 0,
    networkBytesOut: 0,
    executionCount: 0,
    ramMb: id === 'admin' ? 32 : 18, // Baseline estimado em MB
  });
}

// Sub-painéis administrativos
const SUBPANEL_MAP = {
  '/admin/emojis': 'admin_emojis',
  '/api/admin/emojis': 'admin_emojis',
  '/api/admin/embeds': 'admin_emojis',
  '/admin/shopee': 'admin_shopee',
  '/api/admin/shopee': 'admin_shopee',
  '/admin/modules': 'admin_modules',
  '/api/admin/modules': 'admin_modules',
  '/api/admin/terminal': 'admin_terminal',
  '/admin/economia': 'admin_economia',
  '/admin/personalizacao': 'admin_personalizacao',
  '/admin/sazonal': 'admin_sazonal',
  '/admin/loja': 'admin_loja',
  '/admin/bosque': 'admin_bosque',
  '/admin/textos': 'admin_textos',
};

const subpanelStats = new Map();
const ALL_SUBPANELS = [
  'admin_core',
  'admin_emojis',
  'admin_shopee',
  'admin_modules',
  'admin_terminal',
  'admin_economia',
  'admin_personalizacao',
  'admin_sazonal',
  'admin_loja',
  'admin_bosque',
  'admin_textos',
];

for (const sp of ALL_SUBPANELS) {
  subpanelStats.set(sp, {
    id: sp,
    name: sp.replace('admin_', '').toUpperCase(),
    activeRequests: 0,
    totalHits: 0,
    cpuTimeMs: 0,
    networkBytes: 0,
    ramMb: 8.5, // Estimativa de cache por subpainel
  });
}

/**
 * Registra o consumo de processamento e rede de um módulo
 * @param {string} moduleId
 * @param {number} durationMs
 * @param {number} [bytesIn=0]
 * @param {number} [bytesOut=0]
 */
function trackModuleExecution(moduleId, durationMs, bytesIn = 0, bytesOut = 0) {
  const mod = moduleStats.get(moduleId) || {
    id: moduleId,
    name: `Módulo: ${moduleId}`,
    cpuTimeMs: 0,
    networkBytesIn: 0,
    networkBytesOut: 0,
    executionCount: 0,
    ramMb: 15,
  };

  mod.cpuTimeMs += Math.max(0, durationMs);
  mod.networkBytesIn += Math.max(0, bytesIn);
  mod.networkBytesOut += Math.max(0, bytesOut);
  mod.executionCount += 1;

  moduleStats.set(moduleId, mod);
}

/**
 * Middleware Express para monitorar tráfego e CPU de sub-painéis e do módulo admin
 */
function createExpressTelemetryMiddleware() {
  return (req, res, next) => {
    const startHr = process.hrtime.bigint();
    const bytesIn = parseInt(req.headers['content-length'] || 0, 10) || 0;
    let bytesOut = 0;

    let subpanelKey = 'admin_core';
    for (const [routePrefix, key] of Object.entries(SUBPANEL_MAP)) {
      if (req.originalUrl.startsWith(routePrefix)) {
        subpanelKey = key;
        break;
      }
    }

    const sp = subpanelStats.get(subpanelKey) || subpanelStats.get('admin_core');
    sp.activeRequests += 1;
    sp.totalHits += 1;

    // Intercepta escrita de resposta para medir bytesOut
    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = function (chunk, ...args) {
      if (chunk) {
        bytesOut += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
      }
      return originalWrite.apply(res, [chunk, ...args]);
    };

    res.end = function (chunk, ...args) {
      if (chunk) {
        bytesOut += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
      }
      return originalEnd.apply(res, [chunk, ...args]);
    };

    res.on('finish', () => {
      sp.activeRequests = Math.max(0, sp.activeRequests - 1);
      const endHr = process.hrtime.bigint();
      const durationMs = Number(endHr - startHr) / 1e6;

      sp.cpuTimeMs += durationMs;
      sp.networkBytes += bytesIn + bytesOut;

      // Alimenta o módulo 'admin' no ranking global de módulos
      if (req.originalUrl.startsWith('/admin') || req.originalUrl.startsWith('/api/admin')) {
        trackModuleExecution('admin', durationMs, bytesIn, bytesOut);
      }
    });

    next();
  };
}

/**
 * Retorna telemetria geral da VM e processo Node
 */
function getVmOverview() {
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    nodeMemory: {
      rssMb: Number((mem.rss / 1024 / 1024).toFixed(2)),
      heapUsedMb: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMb: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
      externalMb: Number((mem.external / 1024 / 1024).toFixed(2)),
    },
    systemMemory: {
      totalMb: Number((totalMem / 1024 / 1024).toFixed(2)),
      freeMb: Number((freeMem / 1024 / 1024).toFixed(2)),
      usedMb: Number((usedMem / 1024 / 1024).toFixed(2)),
      usedPercent: Number(((usedMem / totalMem) * 100).toFixed(1)),
    },
    cpus: os.cpus().length,
    loadAverage: os.loadavg(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: `${os.type()} ${os.arch()}`,
  };
}

/**
 * Retorna ranking e métricas detalhadas de cada módulo
 */
function getModuleMetrics() {
  const list = Array.from(moduleStats.values()).map((m) => {
    const netTotalKb = Number(((m.networkBytesIn + m.networkBytesOut) / 1024).toFixed(2));
    const avgCpuMs = m.executionCount > 0 ? Number((m.cpuTimeMs / m.executionCount).toFixed(2)) : 0;
    return {
      ...m,
      cpuTimeMs: Number(m.cpuTimeMs.toFixed(2)),
      avgCpuMs,
      netTotalKb,
    };
  });

  list.sort((a, b) => b.cpuTimeMs - a.cpuTimeMs);
  return list;
}

/**
 * Retorna telemetria de todos os sub-painéis administrativos
 */
function getSubpanelMetrics() {
  const list = Array.from(subpanelStats.values()).map((s) => ({
    ...s,
    cpuTimeMs: Number(s.cpuTimeMs.toFixed(2)),
    networkKb: Number((s.networkBytes / 1024).toFixed(2)),
  }));

  list.sort((a, b) => b.totalHits - a.totalHits);
  return list;
}

module.exports = {
  trackModuleExecution,
  createExpressTelemetryMiddleware,
  getVmOverview,
  getModuleMetrics,
  getSubpanelMetrics,
};
