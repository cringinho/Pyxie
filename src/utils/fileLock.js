const fs = require('node:fs');

/**
 * Trava de arquivo entre processos (bot e web gravam os mesmos JSON em data/).
 *
 * O lock é um arquivo <alvo>.lock criado com O_EXCL: só um processo consegue criá-lo. Quem não
 * consegue espera alguns milissegundos e tenta de novo. Um lock esquecido por um processo que
 * caiu (mais velho que STALE_MS) é removido. Tudo síncrono, como as leituras/gravações de JSON.
 */

const STALE_MS = 10 * 1000;
const RETRY_MS = 5;
const sleeper = new Int32Array(new SharedArrayBuffer(4));
const held = new Set();

function sleepSync(ms) {
  Atomics.wait(sleeper, 0, 0, ms);
}

/** Executa fn() com o arquivo travado. Reentrante dentro do mesmo processo. */
function withFileLock(file, fn, { timeoutMs = 3000 } = {}) {
  const lockPath = `${file}.lock`;
  if (held.has(lockPath)) return fn();

  const started = Date.now();
  let fd = null;
  while (fd === null) {
    try {
      fd = fs.openSync(lockPath, 'wx');
      fs.writeSync(fd, String(process.pid));
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Diretório ainda não existe: sem disputa possível, segue sem lock
        return fn();
      }
      if (err.code !== 'EEXIST') throw err;
      try {
        if (Date.now() - fs.statSync(lockPath).mtimeMs > STALE_MS) fs.unlinkSync(lockPath);
      } catch (_) {}
      if (Date.now() - started > timeoutMs) throw new Error(`LOCK_TIMEOUT ${lockPath}`);
      sleepSync(RETRY_MS);
    }
  }

  held.add(lockPath);
  try {
    return fn();
  } finally {
    held.delete(lockPath);
    try { fs.closeSync(fd); } catch (_) {}
    try { fs.unlinkSync(lockPath); } catch (_) {}
  }
}

module.exports = { withFileLock };
