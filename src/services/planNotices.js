// Avisos do plano do servidor: fila (o site/webhook grava, o bot envia por DM) e
// marcações de lembrete (D-7, D-3, D-0 e expirado) para não repetir mensagem.
const fs = require('node:fs');
const path = require('node:path');
const { withFileLock } = require('../utils/fileLock');

const MAX_QUEUE = 200;
const DEDUPE_MS = 12 * 60 * 60 * 1000;
const fileFor = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'planNotices.json');

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(fileFor(), 'utf8')) || {};
    return { queue: Array.isArray(data.queue) ? data.queue : [], marks: data.marks || {} };
  } catch (_) {
    return { queue: [], marks: {} };
  }
}

function save(state) {
  const file = fileFor();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const queue = state.queue.slice(-MAX_QUEUE);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 1, queue, marks: state.marks }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return state;
}

/** Enfileira um aviso (activated | reminder | expired). Evita repetir o mesmo em 12 h. */
function push({ guildId, kind, plan = '', at = Date.now(), force = false } = {}) {
  if (!/^\d{17,20}$/.test(String(guildId || '')) || !['activated', 'reminder', 'expired'].includes(kind)) return false;
  return withFileLock(fileFor(), () => {
    const state = load();
    if (!force) {
      const duplicate = state.queue.some((item) => item.guildId === String(guildId) && item.kind === kind && at - item.at < DEDUPE_MS);
      if (duplicate) return false;
    }
    state.queue.push({ guildId: String(guildId), kind, plan, at });
    save(state);
    return true;
  });
}

function takeAll() {
  return withFileLock(fileFor(), () => {
    const state = load();
    const queue = state.queue;
    state.queue = [];
    save(state);
    return queue;
  });
}

const markKey = (kind) => (kind === 'reminder7' || kind === 'reminder3' || kind === 'reminder0' || kind === 'expired' ? kind : null);

function mark(guildId, kind, at = Date.now()) {
  const key = markKey(kind);
  if (!key) return false;
  return withFileLock(fileFor(), () => {
    const state = load();
    const entry = state.marks[String(guildId)] || {};
    entry[key] = at;
    state.marks[String(guildId)] = entry;
    save(state);
    return true;
  });
}

function hasMark(guildId, kind) {
  const key = markKey(kind);
  if (!key) return false;
  const entry = load().marks[String(guildId)] || {};
  return Boolean(entry[key]);
}

function resetMarks(guildId) {
  return withFileLock(fileFor(), () => {
    const state = load();
    delete state.marks[String(guildId)];
    save(state);
    return true;
  });
}

module.exports = { push, takeAll, mark, hasMark, resetMarks };
