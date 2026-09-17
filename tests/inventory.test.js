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
  assert.ok(allItems.length >= 10, 'O catálogo deve conter ao menos 10 itens.');

  const utilitarios = getItemsByCategory('utilitario');
  assert.ok(utilitarios.length >= 2, 'Deve haver ao menos 2 itens utilitários.');

  const cafe = getItemDefinition('cafe_expresso');
  assert.ok(cafe, 'Café Encantado deve existir no catálogo.');
  assert.equal(cafe.category, 'utilitario');

  // 2. Adicionar e Remover itens
  updateUserAccount(TEST_USER, (acc) => {
    acc.coins = 1000;
  });

  addItem(TEST_USER, 'cafe_expresso', 3);
  assert.equal(hasItem(TEST_USER, 'cafe_expresso', 3), true, 'Usuário deve ter 3 cafés.');
  assert.equal(hasItem(TEST_USER, 'cafe_expresso', 4), false, 'Usuário não deve ter 4 cafés.');

  removeItem(TEST_USER, 'cafe_expresso', 1);
  assert.equal(hasItem(TEST_USER, 'cafe_expresso', 2), true, 'Usuário deve ter 2 cafés restantes.');

  // 3. Compra de Itens na Loja
  const buyRes = buyItem(TEST_USER, 'cha_camomila', 1);
  assert.equal(buyRes.success, true, 'Compra de chá deve ser bem-sucedida.');
  assert.equal(hasItem(TEST_USER, 'cha_camomila', 1), true, 'Chá deve estar na mochila.');

  const accAfterBuy = getUserAccount(TEST_USER);
  assert.equal(accAfterBuy.coins, 1000 - 120, 'Saldo de moedas deve ser debitado.');

  // 4. Venda de Itens
  const sellRes = sellItem(TEST_USER, 'cha_camomila', 1);
  assert.equal(sellRes.success, true, 'Venda de chá deve ter sucesso.');
  assert.equal(hasItem(TEST_USER, 'cha_camomila', 1), false, 'Chá deve ter sido removido da mochila.');

  const accAfterSell = getUserAccount(TEST_USER);
  assert.equal(accAfterSell.coins, (1000 - 120) + 40, 'Moedas da venda devem ser creditadas.');

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

  console.log('Verificação do Inventário, Loja, Baús e Transações: OK');
} finally {
  fs.writeFileSync(inventoryFile, originalInventory, 'utf8');
  fs.writeFileSync(economyFile, originalEconomy, 'utf8');
}

