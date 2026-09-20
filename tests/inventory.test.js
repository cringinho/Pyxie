const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  getUserInventory,
  getItemDefinition,
  getAllItems,
  getItemsByCategory,
  addItem,
  removeItem,
  hasItem,
  buyItem,
  sellItem,
  openChest,
  flushInventorySync,
} = require('../src/services/inventory');
const { updateUserAccount, getUserAccount } = require('../src/services/economy');

const inventoryFile = path.join(__dirname, '..', 'data', 'inventory.json');
const economyFile = path.join(__dirname, '..', 'data', 'economy.json');

const originalInventory = fs.existsSync(inventoryFile) ? fs.readFileSync(inventoryFile, 'utf8') : '{}';
const originalEconomy = fs.existsSync(economyFile) ? fs.readFileSync(economyFile, 'utf8') : '{}';

const TEST_USER = `test_inv_user_${Date.now()}`;

try {
  // 1. Catálogo de Itens
  const allItems = getAllItems();
  assert.ok(allItems.length >= 9, 'O catálogo deve conter ao menos 9 itens (baús e joias).');

  const joias = getItemsByCategory('joia');
  assert.ok(joias.length === 6, 'Deve haver exatamente 6 joias preciosas.');

  const ametista = getItemDefinition('ametista');
  assert.ok(ametista, 'Ametista Reluzente deve existir no catálogo.');
  assert.equal(ametista.category, 'joia');
  assert.equal(ametista.sellPrice, 100);

  const jade = getItemDefinition('jade_imperial');
  assert.ok(jade, 'Jade Imperial deve existir no catálogo.');
  assert.equal(jade.sellPrice, 10000);

  // 2. Adicionar e Remover itens
  updateUserAccount(TEST_USER, (acc) => {
    acc.coins = 2000;
  });

  addItem(TEST_USER, 'ametista', 3);
  assert.equal(hasItem(TEST_USER, 'ametista', 3), true, 'Usuário deve ter 3 ametistas.');
  assert.equal(hasItem(TEST_USER, 'ametista', 4), false, 'Usuário não deve ter 4 ametistas.');

  removeItem(TEST_USER, 'ametista', 1);
  assert.equal(hasItem(TEST_USER, 'ametista', 2), true, 'Usuário deve ter 2 ametistas restantes.');

  // 3. Compra de Itens na Loja (Opala = 600 moedas)
  const buyRes = buyItem(TEST_USER, 'opala', 1);
  assert.equal(buyRes.success, true, 'Compra de opala deve ser bem-sucedida.');
  assert.equal(hasItem(TEST_USER, 'opala', 1), true, 'Opala deve estar na mochila.');

  const accAfterBuy = getUserAccount(TEST_USER);
  assert.equal(accAfterBuy.coins, 2000 - 600, 'Saldo de moedas deve ser debitado.');

  // 4. Venda de Itens (Opala = 250 moedas)
  const sellRes = sellItem(TEST_USER, 'opala', 1);
  assert.equal(sellRes.success, true, 'Venda de opala deve ter sucesso.');
  assert.equal(hasItem(TEST_USER, 'opala', 1), false, 'Opala deve ter sido removida da mochila.');

  const accAfterSell = getUserAccount(TEST_USER);
  assert.equal(accAfterSell.coins, (2000 - 600) + 250, 'Moedas da venda devem ser creditadas.');

  // 5. Abertura de Baús
  addItem(TEST_USER, 'bau_madeira', 1);
  assert.equal(hasItem(TEST_USER, 'bau_madeira', 1), true);

  const chestRes = openChest(TEST_USER, 'bau_madeira');
  assert.equal(chestRes.success, true, 'Abertura de baú deve suceder.');
  assert.ok(chestRes.coinsAwarded >= 100, 'Baú deve premiar moedas.');
  assert.equal(hasItem(TEST_USER, 'bau_madeira', 1), false, 'Baú deve ser consumido após abertura.');

  // 6. Flush Síncrono
  flushInventorySync();
  assert.ok(fs.existsSync(inventoryFile), 'Arquivo inventory.json deve existir.');

  console.log('Verificação do Inventário, Joias, Loja, Baús e Transações: OK');
} finally {
  fs.writeFileSync(inventoryFile, originalInventory, 'utf8');
  fs.writeFileSync(economyFile, originalEconomy, 'utf8');
}
