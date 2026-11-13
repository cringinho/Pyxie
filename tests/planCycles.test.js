// Plano anual (10 meses) e bloqueio de recursos por plano (Básico/Premium).
process.env.PYXIE_PAYMENTS = 'on'; // cobrança é legado: o teste liga a chave que produção nunca liga
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('💳 Testes do plano anual e do bloqueio por plano...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-plancycle-'));
process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-token';
process.env.PASS_PUBLIC_URL = 'https://pyxie.com.br';

const plans = require('../src/services/guildPlans');
const payments = require('../src/services/planPayments');
const features = require('../src/config/planFeatures');

const G = '123456789012345678';
const DAY = 24 * 60 * 60 * 1000;

// 1. Preço mensal e anual (anual = 10 meses)
assert.equal(plans.priceOf('basic', 'month'), 700);
assert.equal(plans.priceOf('basic', 'year'), 7000);
assert.equal(plans.priceOf('premium', 'year'), 20000);
assert.equal(plans.priceOf('free', 'year'), 0);
console.log('  ✅ 1. Anual custa 10 meses (2 grátis).');

// 2. Referência com ciclo e compatibilidade com as cobranças antigas
assert.equal(payments.parseReference(`plan|${G}|premium|year`).cycle, 'year');
assert.equal(payments.parseReference(`plan|${G}|premium|month`).cycle, 'month');
assert.equal(payments.parseReference(`plan|${G}|basic`).cycle, 'month');
assert.equal(payments.parseReference(`plan|${G}|ouro|year`), null);
console.log('  ✅ 2. Referência aceita ciclo e não quebra a antiga.');

// 3. Checkout Pix anual cobra o valor anual
let lastBody = null;
(async () => {
  payments.setFetch(async (url, opts = {}) => {
  lastBody = JSON.parse(opts.body || '{}');
  return {
    ok: true,
    status: 201,
    text: async () =>
      JSON.stringify({
        id: '555',
        transaction_amount: lastBody.transaction_amount,
        point_of_interaction: { transaction_data: { qr_code: 'QR', qr_code_base64: 'B64' } },
      }),
  };
});
const yearly = await payments.createPixCharge({ guildId: G, plan: 'premium', cycle: 'year' });
assert.equal(yearly.ok, true);
assert.equal(lastBody.transaction_amount, 200);
assert.equal(lastBody.external_reference, `plan|${G}|premium|year`);
console.log('  ✅ 3. Pix anual de R$ 200,00 com referência do ciclo.');

// 4. Pagamento anual libera 12 meses
const paid = await payments.applyApprovedPayment({
  id: 'mp-year-1',
  external_reference: `plan|${G}|premium|year`,
  currency_id: 'BRL',
  transaction_amount: 200,
});
assert.equal(paid.ok, true);
assert.equal(paid.granted, true);
const state = plans.getPlan(G);
assert.equal(state.plan, 'premium');
const days = Math.round((state.paidUntil - Date.now()) / DAY);
assert.ok(days >= 359 && days <= 361, `esperava ~360 dias, veio ${days}`);
console.log('  ✅ 4. Pagamento anual dá 12 meses de plano.');

// 5. Valor de mensal não paga o anual
const cheap = await payments.applyApprovedPayment({
  id: 'mp-year-2',
  external_reference: `plan|${G}|basic|year`,
  currency_id: 'BRL',
  transaction_amount: 7,
});
assert.equal(cheap.ok, false);
assert.equal(cheap.reason, 'amount');
console.log('  ✅ 5. Pagar preço de mês no ciclo anual é recusado.');

// 6. Cartão anual repete a cada 12 meses
payments.setFetch(async (url, opts = {}) => {
  lastBody = JSON.parse(opts.body || '{}');
  return { ok: true, status: 201, text: async () => JSON.stringify({ id: 'pre-9', init_point: 'https://mp/card' }) };
});
const card = await payments.createCardSubscription({ guildId: G, plan: 'basic', cycle: 'year' });
assert.equal(card.ok, true);
assert.equal(lastBody.auto_recurring.frequency, 12);
assert.equal(lastBody.auto_recurring.transaction_amount, 70);
console.log('  ✅ 6. Cartão anual cobra a cada 12 meses.');

// 7. Bloqueio por plano (o que a tela mostra com cadeado e o backend recusa)
assert.equal(features.canUse('free', 'theme_custom'), false);
assert.equal(features.canUse('basic', 'theme_custom'), true);
assert.equal(features.canUse('basic', 'embeds'), false);
assert.equal(features.canUse('premium', 'embeds'), true);
assert.equal(features.canUse('premium', 'oracle_ai'), true);
assert.equal(features.canUse('basic', 'oracle_ai'), false);
console.log('  ✅ 7. Básico libera tema; Premium libera embeds e IA.');

// 8. Plano exigido e lista de travados
assert.equal(features.planFor('embeds'), 'premium');
assert.equal(features.planFor('theme_custom'), 'basic');
assert.equal(features.planFor('nao_existe'), 'free');
const lockedFree = features.lockedFor('free').map((f) => f.id);
assert.ok(lockedFree.includes('theme_custom') && lockedFree.includes('embeds'));
const lockedBasic = features.lockedFor('basic').map((f) => f.id);
assert.ok(!lockedBasic.includes('theme_custom'));
assert.ok(lockedBasic.includes('embeds'));
console.log('  ✅ 8. Lista de recursos travados por plano.');

// 9. Cortesia (founder) e premium no topo
assert.equal(features.rankOf('founder'), 3);
assert.equal(features.canUse('founder', 'oracle_ai'), true);
assert.equal(features.rankOf('free'), 0);
console.log('  ✅ 9. Founder e Premium passam por tudo.');

// 10. Catálogo para o painel (nada de lista fixa no HTML)
const catalog = features.catalog();
assert.deepEqual(catalog.tiers, ['free', 'basic', 'premium']);
assert.ok(catalog.features.length >= 5);
assert.ok(catalog.features.every((f) => f.id && f.plan && typeof f.rank === 'number'));
assert.ok(catalog.features.every((f) => f.pt && f.en), 'todo recurso precisa de PT e EN');
console.log('  ✅ 10. Catálogo bilíngue e completo.');

// 11. Perfil da Pyxie (Básico) x status da lojinha (Premium) e teto de mensagens cíclicas.
assert.equal(features.planFor('maryProfile'), 'basic', 'perfil da Pyxie entra no Básico');
assert.equal(features.canUse('basic', 'maryProfile'), true);
assert.equal(features.canUse('free', 'maryProfile'), false);
assert.equal(features.planFor('storeStatus'), 'premium', 'status da lojinha é Premium');
assert.equal(features.canUse('basic', 'storeStatus'), false);
assert.equal(features.canUse('premium', 'storeStatus'), true);
assert.equal(features.limitFor('free', 'periodicMessages'), 1);
assert.equal(features.limitFor('basic', 'periodicMessages'), 1);
assert.equal(features.limitFor('founder', 'periodicMessages'), 4);
assert.equal(features.limitFor('premium', 'periodicMessages'), 10);
assert.equal(features.limitFor('premium', 'nao_existe'), 0);
assert.equal(features.planForLimit('periodicMessages', 1), 'free', '1 mensagem cabe no gratuito');
assert.equal(features.planForLimit('periodicMessages', 2), 'premium', 'a 2ª mensagem pede Premium (Fundador é cortesia)');
assert.equal(features.planForLimit('periodicMessages', 5), 'premium', 'acima de 4 só no Premium');
assert.equal(catalog.limits.periodicMessages.premium, 10, 'o catálogo leva os tetos para o painel');
console.log('  ✅ 11. Perfil (Básico), status (Premium) e teto de mensagens cíclicas 1/4/10.');

console.log('💳 Plano anual e bloqueio: tudo certo.');

})();
