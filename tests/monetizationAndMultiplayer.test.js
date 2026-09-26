const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { createTradeProposal, confirmTrade, cancelTrade } = require('../src/services/trade');
const { getBalance, addCoins, addMagicBeans, buyTheme, equipTheme, getUserAccount } = require('../src/services/economy');
const { addItem, hasItem } = require('../src/services/inventory');
const { processTopggVote, verifyWebhookAuth } = require('../src/services/topgg');

const testRunId = Date.now();
const testUserA = `user_test_a_${testRunId}`;
const testUserB = `user_test_b_${testRunId}`;

try {
  // 1. Setup inicial de contas
  addCoins(testUserA, 2000);
  addCoins(testUserB, 2000);
  addMagicBeans(testUserA, 10);

  // 2. Teste de Trocas Seguras (Itens e Moedas)
  addItem(testUserA, 'ametista', 3);
  const tradeProp = createTradeProposal(testUserA, testUserB, { type: 'item', id: 'ametista', amount: 1 });
  assert.equal(tradeProp.success, true, 'Proposta de troca válida deve ser criada.');

  const confirm1 = confirmTrade(tradeProp.session.id, testUserA);
  assert.equal(confirm1.completed, false, 'Apenas 1 confirmação não deve concluir a troca.');

  const confirm2 = confirmTrade(tradeProp.session.id, testUserB);
  assert.equal(confirm2.completed, true, 'Após ambas as confirmações, a troca deve ser concluída.');
  assert.ok(hasItem(testUserB, 'ametista', 1), 'O receptor deve ter recebido o item.');

  // Teste de cancelamento de troca
  const testUserC = `user_test_c_${testRunId}`;
  const testUserD = `user_test_d_${testRunId}`;
  addItem(testUserC, 'ametista', 2);
  const cancelProp = createTradeProposal(testUserC, testUserD, { type: 'item', id: 'ametista', amount: 1 });
  assert.equal(cancelProp.success, true);
  const cancelRes = cancelTrade(cancelProp.session.id, testUserC);
  assert.equal(cancelRes.success, true, 'Cancelamento da proposta de troca deve funcionar.');

  // 3. Teste de Temas Visuais com Feijões Mágicos
  const themeBuy = buyTheme(testUserA, 'ouro');
  assert.equal(themeBuy.success, true, 'Compra de tema com Feijões Mágicos deve ter sucesso.');
  const userAcc = getUserAccount(testUserA);
  assert.equal(userAcc.equippedTheme, 'ouro', 'Tema Ouro deve estar equipado no perfil.');

  // 4. Teste de Votos Top.gg (Recompensas e Bônus Fim de Semana)
  assert.equal(verifyWebhookAuth('teste'), true, 'Sem secret configurado deve validar webhook.');

  const voteNormal = processTopggVote({ user: testUserA, isWeekend: false });
  assert.equal(voteNormal.success, true, 'Voto comum no Top.gg deve ser processado.');
  assert.equal(voteNormal.coins, 50, 'Recompensa comum deve ser 50 moedas.');
  assert.equal(hasItem(testUserA, 'ametista', 3), true, 'Usuário deve receber 1x Ametista Reluzente.');

  const voteWeekend = processTopggVote({ user: testUserB, isWeekend: true });
  assert.equal(voteWeekend.success, true, 'Voto no fim de semana no Top.gg deve ser processado.');
  assert.equal(voteWeekend.coins, 100, 'Recompensa de fim de semana deve ser 100 moedas (2x).');
  assert.equal(hasItem(testUserB, 'esmeralda', 1), true, 'Usuário deve receber 1x Esmeralda Nobre.');
  const accB = getUserAccount(testUserB);
  assert.equal(accB.magicBeans, 1, 'Fim de semana deve conceder 1 Feijão Mágico.');

  // 5. Teste do Gerenciador de Afiliados Shopee & Smartlink
  const shopeeManager = require('../src/services/shopeeManager');
  const allShopeeItems = shopeeManager.getAllItems();
  assert.ok(allShopeeItems.length >= 50, `Deve haver pelo menos 50 produtos cadastrados (atual: ${allShopeeItems.length})`);

  const activeShopeeItems = shopeeManager.getActiveItems({ shuffle: false });
  assert.ok(activeShopeeItems.length > 0, 'Deve haver produtos ativos para a vitrine');
  activeShopeeItems.forEach(item => {
    assert.equal(item.active, true, 'getActiveItems só deve retornar itens ativos');
    assert.ok(item.link && item.link.startsWith('https://s.shopee.com.br/'), 'Link de afiliado deve ser válido');
  });

  const sampleItems = shopeeManager.getActiveItems({ shuffle: true, limit: 10 });
  assert.equal(sampleItems.length, Math.min(10, activeShopeeItems.length), 'Amostragem com limite deve respeitar tamanho');

  const stats = shopeeManager.getSummaryStats();
  assert.equal(stats.total, allShopeeItems.length, 'Estatísticas de total devem bater');
  assert.ok(stats.activeCount > 0, 'Deve haver contagem de ativos');

  // Teste de alternância (toggle) de status
  const firstItem = allShopeeItems[0];
  const originalState = firstItem.active;
  shopeeManager.toggleItemActive(firstItem.id, false);
  assert.equal(shopeeManager.getItemById(firstItem.id).active, false, 'Item deve ter ficado inativo');
  shopeeManager.toggleItemActive(firstItem.id, originalState);
  assert.equal(shopeeManager.getItemById(firstItem.id).active, originalState, 'Item deve ter voltado ao estado original');

  // Verificação de Sincronização Automática de Imagens da Shopee
  assert.equal(typeof shopeeManager.extractShopeeMetadata, 'function', 'extractShopeeMetadata deve ser exportada');
  assert.equal(typeof shopeeManager.syncItemImage, 'function', 'syncItemImage deve ser exportada');
  assert.equal(typeof shopeeManager.syncAllItemImages, 'function', 'syncAllItemImages deve ser exportada');
  assert.ok(firstItem.imagem && firstItem.imagem.startsWith('http'), 'Produto da Shopee deve conter URL de imagem');
  assert.ok(!firstItem.imagem.includes('unsplash.com'), 'Produto da Shopee deve conter imagem oficial da Shopee e não Unsplash');

  // Verificação de Smartlink Canônico no bonus.html
  const bonusHtmlPath = path.join(__dirname, '..', 'public', 'bonus.html');
  const bonusHtml = fs.readFileSync(bonusHtmlPath, 'utf8');
  assert.ok(bonusHtml.includes('https://s.shopee.com.br/BU6Bod6Sw'), 'bonus.html deve conter o smartlink correto');
  assert.ok(!bonusHtml.includes('alwingulla.com'), 'bonus.html não pode conter scripts externos de anúncio');

  // Verificação de Controles de Imagens no admin.html e server.js
  const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'admin.html'), 'utf8');
  assert.ok(adminHtml.includes('btnSyncAllImages'), 'admin.html deve conter botão para sincronizar todas as imagens');
  assert.ok(adminHtml.includes('syncSingleImage'), 'admin.html deve conter função para sincronizar imagem individual');
  assert.ok(adminHtml.includes('handleLinkInputAutoPreview'), 'admin.html deve conter auto-preview de link da Shopee');

  const serverSrc = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.ok(serverSrc.includes('/api/admin/shopee/sync-image'), 'server.js deve implementar rota /api/admin/shopee/sync-image');
  assert.ok(serverSrc.includes('/api/admin/shopee/sync-all-images'), 'server.js deve implementar rota /api/admin/shopee/sync-all-images');
  assert.ok(serverSrc.includes('/api/admin/shopee/preview-link'), 'server.js deve implementar rota /api/admin/shopee/preview-link');

  console.log('Verificação de Top.gg, Trocas Seguras, Temas Visuais e Afiliados Shopee: OK');
} finally {
  const cleanFiles = [
    path.join(__dirname, '..', 'data', 'economy.json'),
    path.join(__dirname, '..', 'data', 'inventory.json'),
    path.join(__dirname, '..', 'data', 'trades.json'),
  ];

  for (const file of cleanFiles) {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        delete data[testUserA];
        delete data[testUserB];
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {}
    }
  }
}
