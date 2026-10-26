/**
 * Prepara um diretório data/ mínimo para rodar `npm test` fora da VM (GitHub Actions).
 *
 * Na VM, data/ contém os arquivos reais (ignorados pelo git). No CI o diretório
 * nasce vazio, então este script grava apenas o registro do Criador, que os
 * testes do painel usam como âncora. Nunca sobrescreve arquivos existentes.
 */
const fs = require('node:fs');
const path = require('node:path');

const OWNER_SNOWFLAKE = '214153735281180673';
const dataDir = path.join(__dirname, '..', 'data');
const economyFile = path.join(dataDir, 'economy.json');

fs.mkdirSync(dataDir, { recursive: true });

if (fs.existsSync(economyFile)) {
  console.log('[seed_ci_fixtures] data/economy.json já existe; nada a fazer.');
  process.exit(0);
}

const economy = {
  [OWNER_SNOWFLAKE]: {
    coins: 0,
    bank: 0,
    magicBeans: 0,
    profession: 'programador',
    workCount: 0,
    lastDaily: 0,
    lastWork: 0,
  },
};

fs.writeFileSync(economyFile, JSON.stringify(economy, null, 2), 'utf8');
console.log('[seed_ci_fixtures] data/economy.json criado com o registro do Criador.');
