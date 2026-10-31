// Extra `lojinha` (Estúdio de Loja): catálogo, validade, vitalício e revogação.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🛍️ Testes do extra Estúdio de Loja (lojinha)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-addons-'));

const catalog = require('../src/config/planAddons');
const addons = require('../src/services/guildAddons');

const G = '123456789012345678';
const DAY = 24 * 60 * 60 * 1000;

// 1. Catálogo e preço (R$ 3/mês, R$ 30/ano — em centavos)
assert.equal(catalog.priceOf('lojinha', 'month'), 300);
assert.equal(catalog.priceOf('lojinha', 'year'), 3000);
assert.equal(catalog.getAddon('nao_existe'), null);
assert.equal(catalog.labelOf('lojinha', 'pt'), 'Estúdio de Loja');
assert.equal(catalog.labelOf('lojinha', 'en'), 'Store Studio');
console.log('  ✅ 1. Catálogo com preço mensal/anual e bilíngue.');

// 2. Servidor sem extra está inativo
assert.equal(addons.isActive(G, 'lojinha'), false);
console.log('  ✅ 2. Servidor sem contratação não tem o módulo.');

// 3. Concessão mensal ativa
const monthly = addons.grant(G, 'lojinha', { months: 1, source: 'test' });
assert.equal(monthly.ok, true);
const nowState = addons.status(G, 'lojinha');
assert.equal(nowState.active, true);
assert.ok(nowState.until > Date.now(), 'deve vencer no futuro');
console.log('  ✅ 3. Concessão mensal ativa o módulo.');

// 4. Expira depois do período
const later = addons.status(G, 'lojinha', Date.now() + 31 * DAY);
assert.equal(later.active, false);
assert.equal(later.expired, true);
console.log('  ✅ 4. Extra mensal expira depois de 30 dias.');

// 5. Anual cobre um período maior
addons.grant(G, 'lojinha', { years: 1, source: 'test' });
assert.equal(addons.status(G, 'lojinha', Date.now() + 200 * DAY).active, true);
console.log('  ✅ 5. Contratação anual segue ativa depois de 200 dias.');

// 6. Vitalício nunca expira (Mary, Cringelândia, cortesias)
addons.grant(G, 'lojinha', { lifetime: true, source: 'lifetime', note: 'cortesia' });
const forever = addons.status(G, 'lojinha', Date.now() + 10 * 365 * DAY);
assert.equal(forever.active, true);
assert.equal(forever.lifetime, true);
assert.equal(forever.until, 0);
console.log('  ✅ 6. Extra vitalício não expira (10 anos depois continua ativo).');

// 7. Revogação desliga na hora
addons.revoke(G, 'lojinha', 'canceled');
assert.equal(addons.isActive(G, 'lojinha'), false);
console.log('  ✅ 7. Revogação desliga o módulo imediatamente.');

// 8. Entradas inválidas não gravam nada
assert.equal(addons.grant('abc', 'lojinha', {}).ok, false);
assert.equal(addons.grant(G, 'nao_existe', {}).ok, false);
console.log('  ✅ 8. Servidor ou extra inválido é recusado.');

// 9. Listagem por servidor (o que o painel consome)
const list = addons.listForGuild(G);
assert.equal(list.length, 1);
assert.equal(list[0].id, 'lojinha');
assert.equal(list[0].priceMonthly, 300);
assert.equal(list[0].active, false, 'foi revogado no passo 7');
console.log('  ✅ 9. Painel recebe catálogo com estado do servidor.');

console.log('🛍️ Estúdio de Loja: tudo certo.');
