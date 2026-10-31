// E2: cobrança do extra `lojinha` (R$ 3/mês ou R$ 30/ano) pelo mesmo fluxo Pix dos planos.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('💳 Testes do checkout do extra (lojinha)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-addonpay-'));
process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-access-token';
process.env.PASS_PUBLIC_URL = 'https://pyxie.com.br';

const payments = require('../src/services/planPayments');
const addons = require('../src/services/guildAddons');

const G = '123456789012345678';
let lastBody = null;

payments.setFetch(async (url, opts = {}) => {
  lastBody = JSON.parse(opts.body || '{}');
  return {
    ok: true,
    status: 201,
    text: async () =>
      JSON.stringify({
        id: '998877',
        point_of_interaction: { transaction_data: { qr_code: 'QR-CODE-PIX', qr_code_base64: 'B64', ticket_url: 'https://mp/ticket' } },
      }),
  };
});

(async () => {
  // 1. Mensal: R$ 3,00 e referência com o ciclo
  const monthly = await payments.createPixCharge({ guildId: G, addonId: 'lojinha', cycle: 'month' });
  assert.equal(monthly.ok, true);
  assert.equal(lastBody.transaction_amount, 3);
  assert.equal(lastBody.external_reference, `addon|${G}|lojinha|month`);
  console.log('  ✅ 1. Pix mensal de R$ 3,00 com referência do extra.');

  // 2. Anual: R$ 30,00
  const yearly = await payments.createPixCharge({ guildId: G, addonId: 'lojinha', cycle: 'year' });
  assert.equal(yearly.ok, true);
  assert.equal(lastBody.transaction_amount, 30);
  assert.equal(lastBody.external_reference, `addon|${G}|lojinha|year`);
  console.log('  ✅ 2. Pix anual de R$ 30,00.');

  // 3. Extra inválido é recusado antes de chamar o provedor
  const invalid = await payments.createPixCharge({ guildId: G, addonId: 'nao_existe' });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.reason, 'invalid_addon');
  console.log('  ✅ 3. Extra inexistente é recusado.');

  // 4. Pagamento aprovado libera o extra
  const paid = await payments.applyApprovedPayment({
    id: 'mp-1',
    external_reference: `addon|${G}|lojinha|month`,
    currency_id: 'BRL',
    transaction_amount: 3,
  });
  assert.equal(paid.ok, true);
  assert.equal(paid.granted, true);
  assert.equal(addons.isActive(G, 'lojinha'), true);
  console.log('  ✅ 4. Pagamento aprovado ativa o extra.');

  // 5. Valor menor que o preço é recusado
  const cheap = await payments.applyApprovedPayment({
    id: 'mp-2',
    external_reference: `addon|${G}|lojinha|year`,
    currency_id: 'BRL',
    transaction_amount: 3,
  });
  assert.equal(cheap.ok, false);
  assert.equal(cheap.reason, 'amount');
  console.log('  ✅ 5. Valor abaixo do preço do ciclo é recusado.');

  // 6. Mesmo pagamento duas vezes não estende nem duplica
  const again = await payments.applyApprovedPayment({
    id: 'mp-1',
    external_reference: `addon|${G}|lojinha|month`,
    currency_id: 'BRL',
    transaction_amount: 3,
  });
  assert.equal(again.duplicate, true);
  console.log('  ✅ 6. Webhook repetido é ignorado (idempotência).');

  // 7. Referência de plano continua funcionando
  const parsed = payments.parseReference('plan|' + G + '|premium');
  assert.equal(parsed.kind, 'plan');
  assert.equal(parsed.plan, 'premium');
  console.log('  \u2705 7. Refer\u00eancia de plano n\u00e3o foi afetada.');

  // 8. Cart\u00e3o: assinatura mensal de R$ 3,00 (Preapproval)
  payments.setFetch(async (url, opts = {}) => {
    lastBody = JSON.parse(opts.body || '{}');
    return { ok: true, status: 201, text: async () => JSON.stringify({ id: 'pre-1', init_point: 'https://mp/card' }) };
  });
  const cardMonthly = await payments.createCardSubscription({ guildId: G, addonId: 'lojinha', cycle: 'month' });
  assert.equal(cardMonthly.ok, true);
  assert.equal(cardMonthly.initPoint, 'https://mp/card');
  assert.equal(lastBody.external_reference, `addon|${G}|lojinha|month`);
  assert.deepEqual(lastBody.auto_recurring, {
    frequency: 1,
    frequency_type: 'months',
    transaction_amount: 3,
    currency_id: 'BRL',
  });
  console.log('  \u2705 8. Cart\u00e3o mensal: R$ 3,00 recorrente.');

  // 9. Cart\u00e3o anual repete a cada 12 meses
  await payments.createCardSubscription({ guildId: G, addonId: 'lojinha', cycle: 'year' });
  assert.equal(lastBody.auto_recurring.frequency, 12);
  assert.equal(lastBody.auto_recurring.transaction_amount, 30);
  assert.equal(lastBody.external_reference, `addon|${G}|lojinha|year`);
  console.log('  \u2705 9. Cart\u00e3o anual: R$ 30,00 a cada 12 meses.');

  console.log('💳 Checkout do extra: tudo certo.');
})();
