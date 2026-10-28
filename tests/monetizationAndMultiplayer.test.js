const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { getBalance, addCoins, addMagicBeans, buyTheme, equipTheme, getUserAccount, hasActiveVote } = require('../src/services/economy');
const { addItem, hasItem } = require('../src/services/inventory');
const { processTopggVote, verifyWebhookAuth, getUserVoteStatus, VOTE_BEANS, WEEKEND_VOTE_BEANS } = require('../src/services/topgg');

const testRunId = Date.now();
const voteStatsFile = path.join(__dirname, '..', 'data', 'topggVotes.json');
const voteStatsSnapshot = fs.existsSync(voteStatsFile) ? fs.readFileSync(voteStatsFile, 'utf8') : null;
const testUserA = `user_test_a_${testRunId}`;
const testUserB = `user_test_b_${testRunId}`;

try {
  // 1. Setup inicial de contas
  addCoins(testUserA, 2000);
  addCoins(testUserB, 2000);
  addMagicBeans(testUserA, 10);

  // 3. Teste de Temas Visuais com Feijões Mágicos
  const themeBuy = buyTheme(testUserA, 'ouro');
  assert.equal(themeBuy.success, true, 'Compra de tema com Feijões Mágicos deve ter sucesso.');
  const userAcc = getUserAccount(testUserA);
  assert.equal(userAcc.equippedTheme, 'ouro', 'Tema Ouro deve estar equipado no perfil.');

  // 4. Votos no Top.gg: feijões mágicos (nunca moedinhas), sem pagar duas vezes o mesmo voto
  assert.equal(verifyWebhookAuth('teste', {}), false, 'Sem segredo configurado o webhook deve recusar tudo.');
  assert.equal(verifyWebhookAuth('errado', { TOPGG_WEBHOOK_AUTH: 'segredo' }), false, 'Segredo errado deve ser recusado.');
  assert.equal(verifyWebhookAuth(undefined, { TOPGG_WEBHOOK_AUTH: 'segredo' }), false, 'Header ausente deve ser recusado.');
  assert.equal(verifyWebhookAuth('segredo', { TOPGG_WEBHOOK_AUTH: 'segredo' }), true, 'Segredo correto deve ser aceito.');

  const beansBeforeA = getUserAccount(testUserA).magicBeans;
  const voteNormal = processTopggVote({ user: testUserA, isWeekend: false });
  assert.equal(voteNormal.success, true, 'Voto comum no Top.gg deve ser processado.');
  assert.equal(voteNormal.coins, 0, 'Voto nunca concede moedinhas.');
  assert.equal(voteNormal.magicBeans, VOTE_BEANS, 'Voto comum concede o feijão configurado.');
  assert.equal(getUserAccount(testUserA).magicBeans, beansBeforeA + VOTE_BEANS, 'Feijão deve cair na conta.');

  const voteRetry = processTopggVote({ user: testUserA, isWeekend: false });
  assert.equal(voteRetry.duplicate, true, 'Reenvio do mesmo voto deve ser marcado como duplicado.');
  assert.equal(voteRetry.magicBeans, 0, 'Reenvio do mesmo voto não paga de novo.');
  assert.equal(getUserAccount(testUserA).magicBeans, beansBeforeA + VOTE_BEANS, 'Saldo não muda no reenvio.');

  const nextWindow = Date.now() + 12 * 60 * 60 * 1000 + 1000;
  const voteLater = processTopggVote({ user: testUserA, isWeekend: false }, nextWindow);
  assert.equal(voteLater.magicBeans, VOTE_BEANS, 'Novo voto após 12h volta a pagar.');
  assert.equal(getUserAccount(testUserA).voteCount, 2, 'voteCount conta apenas votos pagos.');

  const voteWeekend = processTopggVote({ user: testUserB, isWeekend: true });
  assert.equal(voteWeekend.success, true, 'Voto no fim de semana no Top.gg deve ser processado.');
  assert.equal(voteWeekend.coins, 0, 'Fim de semana também não concede moedinhas.');
  assert.equal(getUserAccount(testUserB).magicBeans, WEEKEND_VOTE_BEANS, 'Fim de semana concede o bônus de feijões.');

  const voteTest = processTopggVote({ user: `${testUserB}_x`, type: 'test' });
  assert.equal(voteTest.test, true, 'Webhook de teste do Top.gg deve ser reconhecido.');
  assert.equal(getUserAccount(`${testUserB}_x`).magicBeans, 0, 'Webhook de teste não paga feijões.');
  assert.equal(processTopggVote({ user: '' }).success, false, 'Payload sem usuário deve ser recusado.');
  assert.equal(processTopggVote({ user: '../../etc' }).success, false, 'ID de usuário inválido deve ser recusado.');

  const status = getUserVoteStatus(testUserB);
  assert.equal(status.canVote, false, 'Logo após votar, o próximo voto fica em espera.');
  assert.ok(status.remainingMs > 0, 'Tempo restante até o próximo voto deve ser positivo.');

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

  // Controles de imagens da Shopee no painel novo (/dashboard → Pyxie global → Shopee)
  const shopeeJsx = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'dashboard', 'Shopee.jsx'), 'utf8');
  assert.ok(shopeeJsx.includes('shopeeSyncImages'), 'Painel deve ter botão para atualizar todas as fotos');
  assert.ok(shopeeJsx.includes('shopeeSyncImage('), 'Painel deve atualizar a foto de um anúncio');
  assert.ok(shopeeJsx.includes('shopeePreview'), 'Painel deve puxar título e foto do link da Shopee');

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

  // 7. Teste de Monetização Segura Oficial (Exclusivo Shopee e Ausência de Adsterra/Bets)
  const ADSTERRA_PATTERNS = [
    'highrevenueformat.com',
    'profitableratecpmnetwork.com',
    'fbb18d996650a174db4ff64b5fba394f',
    '3057c5e3d039655f3a86a9ee6ae57808',
    'd9b7c704cc9d72eed445cd7653b5293a'
  ];

  [indexHtml, wikiHtml, bonusHtml].forEach((htmlContent) => {
    assert.ok(htmlContent.includes('.monetization-pt'), 'HTML deve conter estilos para modo PT');
    ADSTERRA_PATTERNS.forEach(pattern => {
      assert.ok(!htmlContent.includes(pattern), `HTML não deve conter scripts invasivos ou links do Adsterra (${pattern})`);
    });
  });

  assert.ok(!serverSrc.includes('profitableratecpmnetwork.com'), 'server.js não deve redirecionar para Adsterra');

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

  // 10. Validação Estrita de Sintaxe JavaScript nos Scripts de Páginas Web
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

  console.log('Verificação de Top.gg, Temas Visuais e Afiliados Shopee: OK');
} finally {
  // As estatísticas de voto são reais na VM: devolve o arquivo exatamente como estava
  if (voteStatsSnapshot === null) {
    try { fs.unlinkSync(voteStatsFile); } catch (_) {}
  } else {
    fs.writeFileSync(voteStatsFile, voteStatsSnapshot, 'utf8');
  }

  const cleanFiles = [
    path.join(__dirname, '..', 'data', 'economy.json'),
    path.join(__dirname, '..', 'data', 'inventory.json'),
  ];

  for (const file of cleanFiles) {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        delete data[testUserA];
        delete data[testUserB];
        delete data[`${testUserB}_x`];
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {}
    }
  }
}
