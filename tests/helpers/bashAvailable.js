/**
 * O `bash` (WSL no Windows) pode falhar no spawn sob pressão de memória — não é
 * "não existe". Duas tentativas com espera curta evitam que a verificação do hook
 * seja pulada e o gate acuse perda de check sem nenhuma regressão real.
 */
const { spawnSync } = require('node:child_process');

const sleeper = new Int32Array(new SharedArrayBuffer(4));
const sleepSync = (ms) => Atomics.wait(sleeper, 0, 0, ms);

function bashAvailable({ attempts = 3, waitMs = 400 } = {}) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      if (spawnSync('bash', ['--version'], { encoding: 'utf8' }).status === 0) return true;
    } catch (_) {}
    if (i < attempts - 1) sleepSync(waitMs);
  }
  return false;
}

module.exports = { bashAvailable };
