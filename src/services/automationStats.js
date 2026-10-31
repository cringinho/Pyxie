// Números das automações para os cartões do painel (ex.: posts do animador, respondidos).
// Só o bot soma: em memória, gravado em lote a cada 5 min em data/guilds/<id>/automationStats.json.
const fs = require('node:fs');
const path = require('node:path');

const pending = new Map(); // guildId -> { key: { field: n } }
let timer = null;

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'automationStats.json');
}

function read(guildId) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

function flush() {
  const failed = new Map();
  for (const [guildId, keys] of pending) {
    try {
      const data = read(guildId);
      for (const [key, fields] of Object.entries(keys)) {
        data[key] = data[key] || {};
        for (const [field, n] of Object.entries(fields)) {
          if (field === 'lastAt' || field === 'lastErrorAt') data[key][field] = Math.max(data[key][field] || 0, n);
          else if (field === 'lastError') data[key].lastError = String(n).slice(0, 160);
          else data[key][field] = (data[key][field] || 0) + n;
        }
      }
      const file = fileFor(guildId);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
      fs.renameSync(`${file}.tmp`, file);
    } catch (_) {
      // BUG corrigido: uma gravação com erro derrubava o lote inteiro (as outras guildas
      // perdiam as contagens). Agora só a guilda que falhou volta para a fila.
      failed.set(guildId, keys);
    }
  }
  pending.clear();
  for (const [guildId, keys] of failed) pending.set(guildId, keys);
}

function bump(guildId, key, field = 'hits', n = 1, now = Date.now()) {
  const g = pending.get(guildId) || {};
  g[key] = g[key] || {};
  g[key][field] = (g[key][field] || 0) + n;
  g[key].lastAt = Math.max(g[key].lastAt || 0, now);
  pending.set(guildId, g);
  if (!timer) {
    timer = setInterval(() => {
      try {
        flush();
      } catch (_) {}
    }, 5 * 60 * 1000);
    timer.unref?.();
  }
}

/** Falha da automação (campo novo): conta, guarda a mensagem e quando foi a última. */
function recordFailure(guildId, key, err, now = Date.now()) {
  bump(guildId, key, 'failed', 1, now);
  const g = pending.get(guildId) || {};
  g[key] = g[key] || {};
  g[key].lastErrorAt = now;
  g[key].lastError = String(err?.message || err || 'erro').slice(0, 160);
  pending.set(guildId, g);
}

function reset(guildId, key = null) {
  const data = read(guildId);
  if (key) {
    delete data[key];
    if (pending.has(guildId)) delete pending.get(guildId)[key];
  } else {
    for (const k of Object.keys(data)) delete data[k];
    pending.delete(guildId);
  }
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
  fs.renameSync(`${file}.tmp`, file);
  return data;
}

function summary(guildId) {
  const auto = require('./automations');
  const schema = auto.publicSchema();
  const stats = read(guildId);
  const byGroup = {};
  let enabledCount = 0;
  let totalHits = 0;
  const items = [];

  for (const [key, def] of Object.entries(schema)) {
    const cfg = auto.getConfig(guildId, key);
    const st = stats[key] || {};
    // BUG corrigido: só `hits` e `posts` entravam no total — `answered`/`delivered` ficavam
    // de fora e o painel mostrava menos atividade do que a real.
    const actionFields = ['hits', 'posts', 'answered', 'delivered'];
    const hits = actionFields.reduce((sum, field) => sum + (Number(st[field]) || 0), 0);
    const group = def.group || 'utility';
    if (!byGroup[group]) byGroup[group] = { total: 0, enabled: 0, hits: 0 };
    byGroup[group].total += 1;
    if (cfg?.enabled) {
      enabledCount += 1;
      byGroup[group].enabled += 1;
    }
    byGroup[group].hits += hits;
    totalHits += hits;
    items.push({
      key,
      group,
      enabled: Boolean(cfg?.enabled),
      hits,
      answered: st.answered || 0,
      delivered: st.delivered || 0,
      failed: st.failed || 0,
      lastErrorAt: st.lastErrorAt || null,
      lastError: st.lastError || '',
      lastAt: st.lastAt || null,
    });
  }

  const top = [...items]
    .filter((i) => i.hits > 0)
    .sort((a, b) => b.hits - a.hits || (b.lastAt || 0) - (a.lastAt || 0))
    .slice(0, 6);

  return {
    totalCount: Object.keys(schema).length,
    enabledCount,
    totalHits,
    totalFailed: items.reduce((sum, i) => sum + i.failed, 0),
    byGroup,
    top,
    // Campo novo: a lista completa, para o painel nao precisar refazer a conta.
    items,
  };
}

/** Contagem crua por automação (campo novo, para o painel e para o alerta de falha). */
function perKey(guildId) {
  const stats = read(guildId);
  const out = {};
  for (const [key, fields] of Object.entries(stats)) {
    const counters = {};
    for (const [field, value] of Object.entries(fields || {})) {
      if (typeof value === 'number' && field !== 'lastAt' && field !== 'lastErrorAt') counters[field] = value;
    }
    out[key] = {
      ...counters,
      lastAt: fields?.lastAt || null,
      lastErrorAt: fields?.lastErrorAt || null,
      lastError: fields?.lastError || '',
      total: Object.values(counters).reduce((sum, n) => sum + n, 0),
    };
  }
  return out;
}

module.exports = { bump, flush, read, reset, summary, recordFailure, perKey };