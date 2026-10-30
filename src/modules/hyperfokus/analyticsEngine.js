const crypto = require('node:crypto');
const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');

const BOT_UA_REGEX = /bot|crawl|slurp|spider|mediapartners|google|yandex|bing|duckduck|baidu|pinterest|facebookexternalhit|whatsapp|telegrambot|curl|wget|lighthouse/i;

function getAnalyticsFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  return path.join(baseDir, 'hyperfokus', 'analytics_daily.json');
}

function loadAnalyticsStore() {
  return readJson(getAnalyticsFile(), {
    daily: {}, // chave: "<date>:<articleId>"
    salts: {}, // chave: "<date>" -> salt para hash anônimo (LGPD)
  });
}

function saveAnalyticsStore(store) {
  return writeJsonAtomic(getAnalyticsFile(), store);
}

function getTodayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

function getDailySalt(dateStr) {
  const store = loadAnalyticsStore();
  if (!store.salts[dateStr]) {
    store.salts[dateStr] = crypto.randomBytes(16).toString('hex');
    saveAnalyticsStore(store);
  }
  return store.salts[dateStr];
}

/**
 * Anonymiza o IP gerando um hash seguro com sal diário descartável.
 * Em conformidade com a LGPD: o IP cru NUNCA é persistido.
 */
function anonymizeIp(ip, dateStr) {
  if (!ip) return 'anonymous';
  const salt = getDailySalt(dateStr);
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 16);
}

/**
 * Categoriza a origem do tráfego a partir do Referer e parâmetros UTM.
 */
function categorizeReferrer(referer, utmSource) {
  if (utmSource && typeof utmSource === 'string') {
    const src = utmSource.toLowerCase().trim();
    if (src.includes('pinterest')) return 'Pinterest';
    if (src.includes('google')) return 'Google';
    if (src.includes('discord')) return 'Discord';
    if (src.includes('reddit')) return 'Reddit';
    if (src.includes('whatsapp')) return 'WhatsApp';
    if (src.includes('twitter') || src.includes('x.com')) return 'X/Twitter';
    return utmSource.slice(0, 24);
  }

  if (!referer || typeof referer !== 'string') return 'Direto';

  try {
    const host = new URL(referer).hostname.toLowerCase();
    if (host.includes('google.')) return 'Google';
    if (host.includes('bing.')) return 'Bing';
    if (host.includes('pinterest.')) return 'Pinterest';
    if (host.includes('discord.') || host.includes('discordapp.')) return 'Discord';
    if (host.includes('reddit.')) return 'Reddit';
    if (host.includes('whatsapp') || host.includes('wa.me')) return 'WhatsApp';
    if (host.includes('twitter.') || host.includes('t.co') || host.includes('x.com')) return 'X/Twitter';
    if (host.includes('pyxie.com.br')) return 'Navegação Interna';
    return host.replace(/^www\./, '').slice(0, 24);
  } catch (_) {
    return 'Outros';
  }
}

// Buffer em memória para escrita em lote (proteção de I/O e memoryGuard)
let eventBuffer = [];
let bufferVisitors = new Set();
let flushInterval = null;

function ensureRecord(store, dateStr, articleId) {
  const id = `${dateStr}:${articleId}`;
  if (!store.daily[id]) {
    store.daily[id] = {
      id,
      date: dateStr,
      articleId: String(articleId),
      pageViews: 0,
      uniqueVisitors: 0,
      scroll25: 0,
      scroll50: 0,
      scroll75: 0,
      scroll100: 0,
      totalReadingSeconds: 0,
      shopeeClicks: 0,
      inviteClicks: 0,
      topReferrers: {},
      searchTerms: {},
      visitors: [], // hashes únicos do dia
    };
  }
  return store.daily[id];
}

/**
 * Registra uma visualização de página no servidor.
 */
function recordPageView({ articleId = 'global', ip = '', userAgent = '', referer = '', utmSource = '', searchTerm = '' } = {}) {
  // Ignora robôs e rastreadores para manter métricas reais
  if (userAgent && BOT_UA_REGEX.test(userAgent)) {
    return;
  }

  const dateStr = getTodayStr();
  const anonId = anonymizeIp(ip, dateStr);
  const source = categorizeReferrer(referer, utmSource);

  eventBuffer.push({
    type: 'view',
    dateStr,
    articleId: String(articleId || 'global'),
    anonId,
    source,
    searchTerm: searchTerm ? String(searchTerm).slice(0, 60).toLowerCase() : null,
    timestamp: Date.now(),
  });

  if (eventBuffer.length >= 100) {
    flush();
  }
}

/**
 * Registra um evento de beacon (scroll, tempo de leitura ou clique).
 */
function recordBeacon({ articleId = 'global', ip = '', event = '', depth = 0, seconds = 0, target = '' } = {}) {
  const dateStr = getTodayStr();
  const anonId = anonymizeIp(ip, dateStr);

  eventBuffer.push({
    type: 'beacon',
    dateStr,
    articleId: String(articleId || 'global'),
    anonId,
    event,
    depth: Number(depth) || 0,
    seconds: Math.min(120, Number(seconds) || 0), // teto de 2 min por beacon para evitar inflação
    target: String(target || ''),
    timestamp: Date.now(),
  });

  if (eventBuffer.length >= 100) {
    flush();
  }
}

/**
 * Descarrega o buffer em memória para persistência atômica e banco relacional.
 */
function flush() {
  if (eventBuffer.length === 0) return;

  const currentEvents = eventBuffer;
  eventBuffer = [];

  try {
    const store = loadAnalyticsStore();

    for (const ev of currentEvents) {
      // 1. Atualiza registro específico do artigo
      const rec = ensureRecord(store, ev.dateStr, ev.articleId);
      // 2. Atualiza registro agregado global do dia
      const globalRec = ev.articleId !== 'global' ? ensureRecord(store, ev.dateStr, 'global') : null;

      if (ev.type === 'view') {
        rec.pageViews++;
        if (!rec.visitors.includes(ev.anonId)) {
          rec.visitors.push(ev.anonId);
          rec.uniqueVisitors++;
        }
        if (ev.source && ev.source !== 'Navegação Interna') {
          rec.topReferrers[ev.source] = (rec.topReferrers[ev.source] || 0) + 1;
        }
        if (ev.searchTerm) {
          rec.searchTerms[ev.searchTerm] = (rec.searchTerms[ev.searchTerm] || 0) + 1;
        }

        if (globalRec) {
          globalRec.pageViews++;
          if (!globalRec.visitors.includes(ev.anonId)) {
            globalRec.visitors.push(ev.anonId);
            globalRec.uniqueVisitors++;
          }
          if (ev.source && ev.source !== 'Navegação Interna') {
            globalRec.topReferrers[ev.source] = (globalRec.topReferrers[ev.source] || 0) + 1;
          }
        }
      } else if (ev.type === 'beacon') {
        if (ev.event === 'scroll') {
          if (ev.depth >= 25) { rec.scroll25++; if (globalRec) globalRec.scroll25++; }
          if (ev.depth >= 50) { rec.scroll50++; if (globalRec) globalRec.scroll50++; }
          if (ev.depth >= 75) { rec.scroll75++; if (globalRec) globalRec.scroll75++; }
          if (ev.depth >= 100) { rec.scroll100++; if (globalRec) globalRec.scroll100++; }
        } else if (ev.event === 'time') {
          rec.totalReadingSeconds += ev.seconds;
          if (globalRec) globalRec.totalReadingSeconds += ev.seconds;
        } else if (ev.event === 'click') {
          if (ev.target === 'shopee') {
            rec.shopeeClicks++;
            if (globalRec) globalRec.shopeeClicks++;
          } else if (ev.target === 'invite') {
            rec.inviteClicks++;
            if (globalRec) globalRec.inviteClicks++;
          }
        }
      }
    }

    saveAnalyticsStore(store);

    // Opcional: sincronização assíncrona com PostgreSQL via Drizzle
    syncWithPostgres(store).catch(() => {});
  } catch (err) {
    console.error('[Hyperfokus:AnalyticsEngine] Erro ao descarregar analytics:', err.message);
  }
}

async function syncWithPostgres(store) {
  try {
    const { db } = require('../../database');
    const schema = require('../../database/schema');
    if (!db || !schema.hyperfokusAnalyticsDaily) return;

    for (const [id, rec] of Object.entries(store.daily)) {
      const recordToSave = {
        id,
        date: rec.date,
        articleId: rec.articleId,
        pageViews: rec.pageViews,
        uniqueVisitors: rec.uniqueVisitors,
        scroll25: rec.scroll25,
        scroll50: rec.scroll50,
        scroll75: rec.scroll75,
        scroll100: rec.scroll100,
        totalReadingSeconds: rec.totalReadingSeconds,
        shopeeClicks: rec.shopeeClicks,
        inviteClicks: rec.inviteClicks,
        topReferrers: rec.topReferrers,
        searchTerms: rec.searchTerms,
      };

      await db.insert(schema.hyperfokusAnalyticsDaily).values(recordToSave).onConflictDoUpdate({
        target: schema.hyperfokusAnalyticsDaily.id,
        set: recordToSave,
      });
    }
  } catch (_) {
    // Ignora se Postgres estiver indisponível no ambiente de teste/local
  }
}

/**
 * Inicia cron leve de flush a cada 30 segundos.
 */
function startEngine() {
  if (!flushInterval) {
    flushInterval = setInterval(flush, 30000);
    if (flushInterval.unref) flushInterval.unref();
  }
}

/**
 * Retorna resumo analítico consolidado dos últimos N dias para o painel.
 */
function getAnalyticsSummary({ days = 30, articleId = null } = {}) {
  flush(); // Garante dados mais recentes
  const store = loadAnalyticsStore();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(days));
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  let targetRecords = Object.values(store.daily).filter((r) => r.date >= cutoffStr);

  if (articleId) {
    targetRecords = targetRecords.filter((r) => r.articleId === String(articleId));
  } else {
    // Global summary
    targetRecords = targetRecords.filter((r) => r.articleId === 'global');
  }

  targetRecords.sort((a, b) => a.date.localeCompare(b.date));

  let totalPageViews = 0;
  let totalUniqueVisitors = 0;
  let totalReadingSeconds = 0;
  let scroll25 = 0;
  let scroll50 = 0;
  let scroll75 = 0;
  let scroll100 = 0;
  let shopeeClicks = 0;
  let inviteClicks = 0;
  const referrersMap = {};

  for (const r of targetRecords) {
    totalPageViews += r.pageViews || 0;
    totalUniqueVisitors += r.uniqueVisitors || 0;
    totalReadingSeconds += r.totalReadingSeconds || 0;
    scroll25 += r.scroll25 || 0;
    scroll50 += r.scroll50 || 0;
    scroll75 += r.scroll75 || 0;
    scroll100 += r.scroll100 || 0;
    shopeeClicks += r.shopeeClicks || 0;
    inviteClicks += r.inviteClicks || 0;

    for (const [src, count] of Object.entries(r.topReferrers || {})) {
      referrersMap[src] = (referrersMap[src] || 0) + count;
    }
  }

  const avgReadingMinutes = totalPageViews > 0
    ? (totalReadingSeconds / totalPageViews / 60).toFixed(1)
    : '0.0';

  const completionRate = totalPageViews > 0
    ? Math.round((scroll100 / totalPageViews) * 100)
    : 0;

  const topReferrers = Object.entries(referrersMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    periodDays: days,
    totalPageViews,
    totalUniqueVisitors,
    avgReadingMinutes,
    completionRate,
    shopeeClicks,
    inviteClicks,
    scrollDepths: {
      scroll25,
      scroll50,
      scroll75,
      scroll100,
    },
    topReferrers,
    dailySeries: targetRecords.map((r) => ({
      date: r.date,
      views: r.pageViews,
      uniques: r.uniqueVisitors,
    })),
  };
}

// Inicia motor
startEngine();

module.exports = {
  recordPageView,
  recordBeacon,
  flush,
  getAnalyticsSummary,
  anonymizeIp,
  categorizeReferrer,
  loadAnalyticsStore,
  saveAnalyticsStore,
};
