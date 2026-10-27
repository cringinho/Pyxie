// Ponte de pedido e resposta entre o processo do site (server.js) e o processo do bot (index.js).
//
// Ida: server.js escreve no stdin do bot uma linha { type: 'BRIDGE_REQUEST', id, request, payload }.
// Volta: o bot escreve no stdout uma linha com o prefixo BRIDGE_PREFIX seguido de { id, ok, data, error }.
// O supervisor reconhece o prefixo e entrega a resposta aqui em vez de jogar a linha no log.
const crypto = require('node:crypto');

const BRIDGE_PREFIX = '@@PYXIE_BRIDGE@@';
const DEFAULT_TIMEOUT_MS = 5000;

function createBotBridge({ send, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const pending = new Map();

  function request(type, payload = {}, options = {}) {
    const id = crypto.randomBytes(8).toString('hex');
    const limit = options.timeoutMs || timeoutMs;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        const err = new Error(`bridge_timeout:${type}`);
        err.code = 'bridge_timeout';
        reject(err);
      }, limit);
      if (timer.unref) timer.unref();
      pending.set(id, { resolve, reject, timer });

      const delivered = send({ type: 'BRIDGE_REQUEST', id, request: type, payload });
      if (!delivered) {
        clearTimeout(timer);
        pending.delete(id);
        const err = new Error('bridge_offline');
        err.code = 'bridge_offline';
        reject(err);
      }
    });
  }

  // Devolve true quando a linha era uma resposta da ponte (e não deve ir para o log).
  function handleLine(line) {
    if (typeof line !== 'string' || !line.startsWith(BRIDGE_PREFIX)) return false;
    let msg;
    try {
      msg = JSON.parse(line.slice(BRIDGE_PREFIX.length));
    } catch (_) {
      return true;
    }
    const entry = msg && pending.get(msg.id);
    if (!entry) return true;
    clearTimeout(entry.timer);
    pending.delete(msg.id);
    if (msg.ok) {
      entry.resolve(msg.data);
    } else {
      const err = new Error(msg.error || 'bridge_error');
      err.code = msg.error || 'bridge_error';
      entry.reject(err);
    }
    return true;
  }

  return { request, handleLine, pendingCount: () => pending.size };
}

module.exports = { BRIDGE_PREFIX, createBotBridge };
