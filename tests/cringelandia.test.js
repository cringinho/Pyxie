const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const cringelandiaService = require('../src/services/cringelandiaService');

console.log('💜 [TEST] Auditoria & Quality Gate da Cringelândia (Acolhimento & Direitos)...');

// 1. Contador de Impacto Social
const initialCount = cringelandiaService.getImpactCount();
assert.ok(typeof initialCount === 'number' && initialCount >= 1420, 'Contador de impacto deve iniciar em no mínimo 1420');

// Teste de clique de ajuda
const testIp1 = `test_ip_${Date.now()}_1`;
const res1 = cringelandiaService.trackHelpClick(testIp1);
assert.equal(res1.success, true, 'Primeiro clique deve ser bem sucedido');
assert.equal(res1.count, initialCount + 1, 'Contador deve incrementar em 1');

// Teste de rate limit (mesmo IP dentro do cooldown)
const res2 = cringelandiaService.trackHelpClick(testIp1);
assert.equal(res2.success, false, 'Segundo clique do mesmo IP deve ser barrado por cooldown');
assert.equal(res2.rateLimited, true, 'Flag rateLimited deve ser true');

// Teste de IP diferente
const testIp2 = `test_ip_${Date.now()}_2`;
const res3 = cringelandiaService.trackHelpClick(testIp2);
assert.equal(res3.success, true, 'Clique de IP diferente deve ser aceito');
assert.equal(res3.count, initialCount + 2, 'Contador deve incrementar novamente');
console.log('  ✅ 1. Contador de impacto social e rate-limiting por IP validados com sucesso.');

// 2. Diretório das 27 UFs (CIPTEA)
assert.equal(cringelandiaService.CIPTEA_STATES.length, 27, 'Devem existir exatamente 27 UFs cadastradas');
const ufs = new Set(cringelandiaService.CIPTEA_STATES.map((s) => s.uf));
assert.equal(ufs.size, 27, 'Todas as 27 siglas de Estados devem ser únicas');

cringelandiaService.CIPTEA_STATES.forEach((item) => {
  assert.ok(item.uf && item.uf.length === 2, `UF inválida: ${item.uf}`);
  assert.ok(item.state && item.state.length > 0, `Nome de Estado ausente em ${item.uf}`);
  assert.ok(item.organ && item.organ.length > 0, `Órgão responsável ausente em ${item.uf}`);
  assert.ok(item.url && item.url.startsWith('http'), `URL oficial inválida em ${item.uf}: ${item.url}`);
  assert.ok(item.docs && item.docs.length > 0, `Checklist de documentos ausente em ${item.uf}`);
});
console.log('  ✅ 2. Todas as 27 UFs para emissão da CIPTEA validadas com órgãos, URLs e documentos.');

// 3. Estrutura do Frontend (public/cringelandia.html)
const htmlPath = path.join(__dirname, '..', 'public', 'cringelandia.html');
assert.ok(fs.existsSync(htmlPath), 'cringelandia.html deve existir em public/');
const html = fs.readFileSync(htmlPath, 'utf8');

// Proibição estrita de AdSense no portal da Cringelândia
assert.ok(!html.includes('adsbygoogle'), 'cringelandia.html NÃO pode conter AdSense');
assert.ok(!html.includes('ca-pub-'), 'cringelandia.html NÃO pode conter tag de anunciante AdSense');

// Proibição do emoji de Minecraft (Regra 7)
assert.ok(!html.includes('portalframe98'), 'cringelandia.html NÃO pode conter emoji portalframe98');

// Elementos obrigatórios
assert.ok(html.includes('shopee-slider-track'), 'Deve conter slider de produtos Shopee');
assert.ok(html.includes('mascot-avatar'), 'Deve conter mascote Pyxie com balão de fala');
assert.ok(html.includes('tenorioadvogados.com/laudo-de-autista'), 'Deve conter link de referência jurídica de Tenório Advogados');
assert.ok(html.includes('roblox.com/share/g/35473881'), 'Deve conter link oficial do grupo Roblox da Cringelândia');
assert.ok(html.includes('cvv.org.br') && html.includes('188'), 'Deve conter CVV 188');
assert.ok(html.includes('192'), 'Deve conter SAMU 192');
assert.ok(html.includes('Ligue 100') || html.includes('Disque 100'), 'Deve conter Disque 100');
assert.ok(html.includes('180'), 'Deve conter Ligue 180');
assert.ok(html.includes('F84.0') && html.includes('6A02'), 'Deve citar CID-10 e CID-11');
assert.ok(html.includes('Lei nº 13.146/2015') || html.includes('13.146'), 'Deve citar Lei Brasileira de Inclusão');
console.log('  ✅ 3. Requisitos institucionais, monetização ética, leis e links essenciais validados no HTML.');

console.log('🎉 TODOS OS TESTES DA CRINGELÂNDIA PASSARAM COM 100% DE SUCESSO!\n');

