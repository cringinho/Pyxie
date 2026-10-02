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

  // 6. Teste da Rotação Horária de Lojas Parceiras e Links sem Imagem
  const storePromos = shopeeManager.getStorePromos();
  assert.ok(Array.isArray(storePromos) && storePromos.length >= 70, `Deve haver pelo menos 70 lojas cadastradas (atual: ${storePromos.length})`);
  const promoNow = shopeeManager.getHourlyStorePromo();
  assert.ok(promoNow && promoNow.link && promoNow.link.startsWith('https://s.shopee.com.br/'), 'getHourlyStorePromo deve retornar link Shopee válido');
  assert.ok(promoNow.name, 'Promoção horária deve ter nome de loja');

  const baseHourTime = 1774656000000; // hora redonda
  const promoH0 = shopeeManager.getHourlyStorePromo(baseHourTime);
  const promoH1 = shopeeManager.getHourlyStorePromo(baseHourTime + 3600 * 1000);
  assert.notEqual(promoH0.id, promoH1.id, 'Lojas devem rotacionar a cada hora');

  assert.ok(serverSrc.includes('/promo'), 'server.js deve implementar rota /promo');
  assert.ok(serverSrc.includes('/api/shopee/hourly-promo'), 'server.js deve implementar rota /api/shopee/hourly-promo');

  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const wikiHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'wiki.html'), 'utf8');
  assert.ok(indexHtml.includes('href="/promo"'), 'index.html deve conter links direcionando para /promo');
  assert.ok(wikiHtml.includes('href="/promo"'), 'wiki.html deve conter links direcionando para /promo');
  assert.ok(bonusHtml.includes('href="/promo"'), 'bonus.html deve conter sponsorBtn direcionando para /promo');

  // 7. Teste de Segmentação Bilíngue de Monetização (Shopee no Brasil, Adsterra no Exterior)
  const ADSTERRA_KEYS = {
    smartlink: 'https://www.profitableratecpmnetwork.com/h5e79gd1n?key=95a94394d06a9e066a810f77a06ab813',
    banner468: 'fbb18d996650a174db4ff64b5fba394f',
    banner300: '3057c5e3d039655f3a86a9ee6ae57808',
    skyscraper160: 'd9b7c704cc9d72eed445cd7653b5293a',
  };

  [indexHtml, wikiHtml, bonusHtml].forEach((htmlContent) => {
    assert.ok(htmlContent.includes('.monetization-pt'), 'HTML deve conter estilos para modo PT');
    assert.ok(htmlContent.includes('.monetization-en'), 'HTML deve conter estilos para modo EN');
    assert.ok(htmlContent.includes(ADSTERRA_KEYS.smartlink), 'HTML deve conter Adsterra Smartlink para tráfego internacional');
    assert.ok(htmlContent.includes(ADSTERRA_KEYS.banner300), 'HTML deve conter banner Adsterra 300x250');
  });

  assert.ok(indexHtml.includes(ADSTERRA_KEYS.banner468), 'index.html deve conter banner Adsterra 468x60');
  assert.ok(indexHtml.includes(ADSTERRA_KEYS.skyscraper160), 'index.html deve conter skyscraper Adsterra 160x600');
  assert.ok(bonusHtml.includes(ADSTERRA_KEYS.skyscraper160), 'bonus.html deve conter skyscraper Adsterra 160x600');
  assert.ok(serverSrc.includes(ADSTERRA_KEYS.smartlink), 'server.js deve redirecionar tráfego EN para Adsterra Smartlink');

  // 8. Teste de Persistência Confiável de Idioma (pyxie_lang, URL sync e Cross-page)
  [indexHtml, wikiHtml, bonusHtml].forEach((htmlContent) => {
    assert.ok(htmlContent.includes('pyxie_lang'), 'Todas as páginas web devem utilizar a chave local pyxie_lang');
    assert.ok(htmlContent.includes('resolveInitialLang'), 'Todas as páginas web devem resolver idioma com hierarquia padronizada');
    assert.ok(htmlContent.includes('toggleLanguage'), 'Todas as páginas web devem fornecer alternador de idioma dinâmico');
    assert.ok(htmlContent.includes('replaceState'), 'Todas as páginas web devem sincronizar URL query params com history.replaceState');
  });

  // 9. Validação do Footer e Assistente Flutuante (Tradução e Posição Pré-Script)
  assert.ok(indexHtml.includes('data-i18n="footer.promo"'), 'index.html deve conter data-i18n="footer.promo" no rodapé');
  assert.ok(wikiHtml.includes('data-i18n="footerPromo"'), 'wiki.html deve conter data-i18n="footerPromo" no rodapé');
  assert.ok(indexHtml.indexOf('id="pyxieFloatingTip"') < indexHtml.indexOf('function initLang'), '#pyxieFloatingTip deve estar posicionado antes de initLang no index.html para parsing síncrono');
  assert.ok(wikiHtml.indexOf('id="pyxieFloatingTip"') < wikiHtml.indexOf('function applyLang'), '#pyxieFloatingTip deve estar posicionado antes de applyLang no wiki.html para parsing síncrono');

  // 10. Validação de Verificação de Domínio do Pinterest (Tag nos HTMLs e Arquivo Dedicado)
  const PINTEREST_VERIFY_TAG = '8da8f2e95821ed9fa6a1b3fce231664f';
  [indexHtml, wikiHtml, bonusHtml].forEach((htmlContent) => {
    assert.ok(htmlContent.includes(PINTEREST_VERIFY_TAG), 'Todas as páginas web principais devem conter a tag de verificação do Pinterest');
  });
  const pinterestFilePath = path.join(__dirname, '..', 'public', 'pinterest-8da8f2e95821ed9fa6a1b3fce231664f.html');
  assert.ok(fs.existsSync(pinterestFilePath), 'Arquivo de verificação HTML do Pinterest deve existir');

  // 11. Validação de Catálogo Dinâmico do Pinterest (CSV)
  const pinterestCatalogService = require('../src/services/pinterestCatalogService');
  const catalogCsv = pinterestCatalogService.generatePinterestCsv();
  assert.ok(catalogCsv.includes('id,title,description,link,image_link,price,availability'), 'CSV do Pinterest deve conter todos os cabeçalhos obrigatórios');
  assert.ok(catalogCsv.includes('pyxie_mascot_art'), 'CSV deve conter artes oficiais da Pyxie');
  assert.ok(catalogCsv.includes('tarot_card_1'), 'CSV deve conter cartas de Tarot');
  const catalogFilePath = path.join(__dirname, '..', 'public', 'pinterest-catalog.csv');
  assert.ok(fs.existsSync(catalogFilePath), 'Arquivo public/pinterest-catalog.csv deve existir');

  // 12. Validação Estrita de Sintaxe JavaScript nos Scripts de Páginas Web
  const vm = require('node:vm');
  [
    { name: 'index.html', content: indexHtml },
    { name: 'wiki.html', content: wikiHtml },
    { name: 'bonus.html', content: bonusHtml },
  ].forEach(({ name, content }) => {
    const scripts = content.match(/<script(?![^>]*src=)>([\s\S]*?)<\/script>/gi) || [];
    scripts.forEach((tag, idx) => {
      const code = tag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
      try {
        new vm.Script(code);
      } catch (err) {
        assert.fail(`Erro de sintaxe JavaScript em ${name} (script #${idx}): ${err.message}`);
      }
    });
  });

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
