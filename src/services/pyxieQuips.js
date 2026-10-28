// Falas curtas da Pyxie nos comandos interativos (banco em src/data/pyxieQuips.json, 20+ por comando, PT e EN).
// Entram no fim do primeiro embed da resposta como "-# 💬 ...", pelo gancho do REST (embedOverrides.js),
// então comando nenhum precisa mudar. A fala é a mesma durante toda a partida (semente = interação original).
// Nunca em erros (tom preocupado) e nunca nos comandos de acolhimento: eles nem estão no banco.
// O diário, o trabalho e o tarot já têm a voz própria (pyxieVoice.js) e também não estão aqui.
const fs = require('node:fs');
const path = require('node:path');

const BANK = require('../data/pyxieQuips.json');
const PREFIX = '-# 💬 ';

let aliasMap = null;
// Apelidos de prefixo (py!casal) -> nome do comando (py-ship), lidos dos próprios arquivos de comando.
function loadAliases() {
  if (aliasMap) return aliasMap;
  aliasMap = new Map();
  const root = path.join(__dirname, '..');
  const files = [];
  const commandsDir = path.join(root, 'commands');
  for (const f of fs.readdirSync(commandsDir)) if (f.endsWith('.js')) files.push(path.join(commandsDir, f));
  const modulesDir = path.join(root, 'modules');
  for (const m of fs.readdirSync(modulesDir)) {
    const dir = path.join(modulesDir, m, 'commands');
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) files.push(path.join(dir, f));
  }
  for (const file of files) {
    try {
      const mod = require(file);
      const name = mod?.data?.name || mod?.name;
      if (!name || !BANK[name]) continue;
      for (const alias of [name, name.replace(/^py-/, ''), ...(mod.aliases || [])]) aliasMap.set(String(alias).toLowerCase(), name);
    } catch (_) {}
  }
  return aliasMap;
}

/** "/py-ship", "py!casal" ou "py-ship" -> "py-ship" (ou null se o comando não tem falas). */
function commandKey(command) {
  if (!command) return null;
  const has = (k) => !k.startsWith('_') && Array.isArray(BANK[k]?.pt);
  const raw = String(command).toLowerCase();
  if (raw.startsWith('/')) return has(raw.slice(1)) ? raw.slice(1) : null;
  if (has(raw)) return raw;
  if (raw.startsWith('py!')) return loadAliases().get(raw.slice(3)) || null;
  return null;
}

function hash(text) {
  let h = 2166136261;
  for (const ch of String(text)) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
}

/** Fala para o comando no idioma. Com semente, sempre a mesma; sem, aleatória. */
function quipFor(command, lang = 'pt', seed = null) {
  const key = commandKey(command);
  if (!key) return null;
  const list = BANK[key][lang === 'en' ? 'en' : 'pt'];
  if (!list?.length) return null;
  const i = seed ? hash(`${key}:${seed}`) % list.length : Math.floor(Math.random() * list.length);
  return list[i];
}

/** Põe a fala no fim da descrição, sem repetir e sem passar do limite do Discord. */
function addQuip(embed, line) {
  if (!embed || !line) return embed;
  const desc = String(embed.description || '');
  if (desc.includes(line) || desc.includes(PREFIX)) return embed;
  const next = desc ? `${desc}\n\n${PREFIX}${line}` : `${PREFIX}${line}`;
  if (next.length > 4096) return embed;
  return { ...embed, description: next };
}

module.exports = { BANK, PREFIX, commandKey, quipFor, addQuip };
