/**
 * Caminho de `data/` do PROCESSO (dados de execução).
 *
 * Regra: sempre passe por aqui. Nunca monte `path.join(__dirname, '..', '..', 'data')`
 * direto — era o que fazia 25 arquivos ignorarem `PYXIE_DATA_DIR` e escrever no data/
 * de desenvolvimento mesmo quando o processo roda isolado (bot de teste, suíte, CI).
 *
 * `src/data/` (dados estáticos do repositório: emojis, catálogo Shopee) NÃO passa por aqui.
 */
const path = require('node:path');
const fs = require('node:fs');

function dataDir() {
  const dir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
  return path.resolve(dir);
}

function dataPath(...parts) {
  return path.join(dataDir(), ...parts);
}

/** Garante que a pasta existe (para quem grava pela primeira vez). */
function ensureDataDir() {
  fs.mkdirSync(dataDir(), { recursive: true });
  return dataDir();
}

module.exports = { dataDir, dataPath, ensureDataDir };
