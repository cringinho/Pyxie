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
  for (const [guildId, keys] of pending) {
    const data = read(guildId);
    for (const [key, fields] of Object.entries(keys)) {
      data[key] = data[key] || {};
      for (const [field, n] of Object.entries(fields)) {
        if (field === 'lastAt') data[key].lastAt = Math.max(data[key].lastAt || 0, n);
        else data[key][field] = (data[key][field] || 0) + n;
      }
    }
    const file = fileFor(guildId);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
    fs.renameSync(`${file}.tmp`, file);
  }
  pending.clear();
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
    const hits = (st.hits || 0) + (st.posts || 0);
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
    byGroup,
    top,
  };
}

module.exports = { bump, flush, read, reset, summary };
