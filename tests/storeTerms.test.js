// Aceite de termos do Estúdio de Loja: servidor de cliente não salva antes de aceitar;
// a Mary (zona própria) não passa por isso.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('📜 Testes do aceite de termos do Estúdio de Loja...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-terms-'));

const dashboard = require('../src/modules/mary-studio/maryDashboard');
const { MARY_GUILD_ID } = require('../src/config/scopes');

const CLIENT = '123456789012345678';

// 1. Mary não precisa aceitar nada
const marySave = dashboard.saveStore(MARY_GUILD_ID, { estoqueRobux: 1000 }, {});
assert.equal(marySave.ok, true, 'Mary salva normalmente');
assert.equal(dashboard.getStore(MARY_GUILD_ID).requiresTerms, false);
console.log('  ✅ 1. Mary continua sem exigência de termos.');

// 2. Servidor de cliente é bloqueado sem aceite
const blocked = dashboard.saveStore(CLIENT, { estoqueRobux: 500 }, {});
assert.equal(blocked.ok, false);
assert.equal(blocked.error, 'terms_required');
assert.equal(dashboard.getStore(CLIENT).requiresTerms, true);
console.log('  ✅ 2. Cliente sem aceite é recusado com terms_required.');

// 3. Com aceite, salva e registra data + IP
const accepted = dashboard.saveStore(CLIENT, { estoqueRobux: 500 }, { meta: { acceptTerms: true, ip: '203.0.113.7' } });
assert.equal(accepted.ok, true);
const after = dashboard.getStore(CLIENT);
assert.equal(after.requiresTerms, false);
assert.ok(after.termsAcceptedAt > 0, 'guarda a data do aceite');
assert.equal(after.termsVersion, '2026-10');
console.log('  ✅ 3. Com aceite, salva e registra data/versão.');

// 4. O estoque do cliente não vaza para a Mary
assert.equal(dashboard.getStore(CLIENT).estoqueRobux, 500);
assert.equal(dashboard.getStore(MARY_GUILD_ID).estoqueRobux, 1000);
console.log('  ✅ 4. Cada servidor mantém o próprio estoque.');

// 5. Depois de aceito, os próximos salvamentos não exigem aceite de novo
const second = dashboard.saveStore(CLIENT, { preco1k: 25 }, {});
assert.equal(second.ok, true);
console.log('  ✅ 5. Aceite vale para os salvamentos seguintes.');

console.log('📜 Termos do Estúdio de Loja: tudo certo.');
