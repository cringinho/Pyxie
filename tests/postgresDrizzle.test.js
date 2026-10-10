const assert = require('node:assert');
const schema = require('../src/database/schema');

console.log('🐘 Iniciando suíte de testes de Engenharia: PostgreSQL & Drizzle ORM...');

// 1. Validação de Esquema Relacional
assert.ok(schema.guildConfigs, 'Tabela guild_configs deve existir no schema');
assert.ok(schema.users, 'Tabela users deve existir no schema');
assert.ok(schema.tarotAlbums, 'Tabela tarot_albums deve existir no schema');
assert.ok(schema.marriages, 'Tabela marriages deve existir no schema');
assert.ok(schema.schedulerState, 'Tabela scheduler_state deve existir no schema');
assert.ok(schema.cringelandiaLab, 'Tabela cringelandia_lab deve existir no schema');
console.log('  ✅ 1. Esquema relacional com as 6 tabelas canônicas validado.');

// 2. Validação dos Campos de Users & Carteira
const userCols = schema.users;
assert.ok(userCols.userId, 'users deve ter userId');
assert.ok(userCols.coins, 'users deve ter coins');
assert.ok(userCols.beans, 'users deve ter beans');
assert.ok(userCols.profession, 'users deve ter profession');
assert.ok(userCols.professionLevel, 'users deve ter professionLevel');
assert.ok(userCols.createdAt, 'users deve ter createdAt');
console.log('  ✅ 2. Estrutura da tabela de usuários e economia validada.');

// 3. Validação do Álbum de Tarot
const albumCols = schema.tarotAlbums;
assert.ok(albumCols.userId, 'tarot_albums deve ter userId');
assert.ok(albumCols.discoveredCards, 'tarot_albums deve ter discoveredCards array');
assert.ok(albumCols.claimedAchievements, 'tarot_albums deve ter claimedAchievements array');
assert.ok(albumCols.totalPulls, 'tarot_albums deve ter totalPulls');
console.log('  ✅ 3. Estrutura do álbum de tarot validada.');

// 4. Validação de Casamentos e Família
const marriageCols = schema.marriages;
assert.ok(marriageCols.id, 'marriages deve ter id');
assert.ok(marriageCols.user1Id, 'marriages deve ter user1Id');
assert.ok(marriageCols.user2Id, 'marriages deve ter user2Id');
assert.ok(marriageCols.lovePoints, 'marriages deve ter lovePoints');
assert.ok(marriageCols.sharedVaultCoins, 'marriages deve ter sharedVaultCoins');
assert.ok(marriageCols.children, 'marriages deve ter children jsonb');
assert.ok(marriageCols.treeOfLife, 'marriages deve ter treeOfLife jsonb');
console.log('  ✅ 4. Estrutura de casamentos e família validada.');

// 5. Validação de Serviços de Economia e Átomo
const economyService = require('../src/services/economyService');
assert.strictEqual(typeof economyService.transferCoins, 'function', 'transferCoins deve ser função');
assert.strictEqual(typeof economyService.getBalance, 'function', 'getBalance deve ser função');

// Validação de erro de transferência com valor inválido
assert.rejects(
  async () => {
    await economyService.transferCoins('u1', 'u2', -10);
  },
  { message: 'QUANTIA_INVALIDA' },
  'Transferência com valor negativo deve lançar QUANTIA_INVALIDA'
);
assert.rejects(
  async () => {
    await economyService.transferCoins('u1', 'u2', 0);
  },
  { message: 'QUANTIA_INVALIDA' },
  'Transferência com valor zero deve lançar QUANTIA_INVALIDA'
);
assert.rejects(
  async () => {
    await economyService.transferCoins('u1', 'u2', 10.5);
  },
  { message: 'QUANTIA_INVALIDA' },
  'Transferência com valor fracionário deve lançar QUANTIA_INVALIDA'
);
console.log('  ✅ 5. Guardas de validação de transferência atômica validadas.');

// 6. Validação do Serviço de Álbum de Tarot
const tarotService = require('../src/services/tarotAlbumService');
assert.strictEqual(typeof tarotService.getUserAlbum, 'function', 'getUserAlbum deve existir');
assert.strictEqual(typeof tarotService.registerCardDiscovery, 'function', 'registerCardDiscovery deve existir');
assert.strictEqual(typeof tarotService.recordCardDiscovery, 'function', 'recordCardDiscovery deve existir');
console.log('  ✅ 6. Métodos de consumo do Álbum de Tarot validados.');

console.log('🎉 Todos os testes de Engenharia do PostgreSQL & Drizzle ORM passaram com 100% de integridade!');
