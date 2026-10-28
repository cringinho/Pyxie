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
      for (const [field, n] of Object.entries(fields)) data[key][field] = (data[key][field] || 0) + n;
    }
    const file = fileFor(guildId);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
    fs.renameSync(`${file}.tmp`, file);
  }
  pending.clear();
}

function bump(guildId, key, field, n = 1) {
  const g = pending.get(guildId) || {};
  g[key] = g[key] || {};
  g[key][field] = (g[key][field] || 0) + n;
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

module.exports = { bump, flush, read };
