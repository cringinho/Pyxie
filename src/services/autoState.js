// Estado pequeno das automações em data/guilds/<id>/<nome>.json (só o bot grava; escrita atômica).
const fs = require('node:fs');
const path = require('node:path');

function fileFor(guildId, name) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), name);
}

function read(guildId, name) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(guildId, name), 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

function write(guildId, name, data) {
  const file = fileFor(guildId, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
  fs.renameSync(`${file}.tmp`, file);
  return data;
}

module.exports = { read, write };
