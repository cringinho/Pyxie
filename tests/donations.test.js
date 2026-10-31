const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('💜 Testes das doações voluntárias (Pix livre + ranking)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-donations-'));
process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-access-token';
process.env.PASS_PUBLIC_URL = 'https://pyxie.com.br';

const donations = require('../src/services/donations');

const U1 = '700000000000000011';
const U2 = '700000000000000012';
let requests = [];
const json = (data, ok = true, status = 200) => ({ ok, status, text: async () => JSON.stringify(data) });

function mock(handler) {
  requests = [];
  donations.setFetch(async (url, opts = {}) => {
    requests.push({ url: String(url), opts });
    return handler(String(url), opts);
  });
}

(async () => {
  mock(() => json({ id: 900, status: 'pending', transaction_amount: 10, point_of_interaction: { transaction_data: { qr_code: 'PIXDOACAO', qr_code_base64: 'iVBORw0KGgo=' } } }));

  // 1. Pix de valor livre, sempre validado no servidor
  assert.equal(donations.MIN_CENTS, 200);
  assert.equal(donations.MAX_CENTS, 50000);
  assert.equal((await donations.createPixDonation({ userId: U1, cents: 100 })).reason, 'invalid_amount', 'Abaixo do mínimo recusa');
  assert.equal((await donations.createPixDonation({ userId: U1, cents: 999999 })).reason, 'invalid_amount', 'Acima do teto recusa');
  const created = await donations.createPixDonation({ userId: U1, cents: 1000, name: 'Ana' });
  assert.equal(created.ok, true);
  assert.equal(created.amount, 10);
  assert.equal(created.qrCode, 'PIXDOACAO');
  const body = JSON.parse(requests[0].opts.body);
  assert.equal(body.transaction_amount, 10);
  assert.equal(body.payment_method_id, 'pix');
  assert.equal(body.external_reference, `donation|${U1}|1000|0`);
  assert.equal(body.notification_url, 'https://pyxie.com.br/api/plans/webhook/mercadopago');
  console.log('  ✅ 1. Pix de doação com valor livre e referência correta.');

  // 2. Webhook aprovado registra uma única vez
  mock(() => json({ id: 900, status: 'approved', transaction_amount: 10, currency_id: 'BRL', external_reference: `donation|${U1}|1000|0` }));
  const first = await donations.handleWebhook({ body: { type: 'payment', data: { id: '900' } } });
  assert.equal(first.ok, true);
  assert.equal(first.donation.cents, 1000);
  const again = await donations.handleWebhook({ body: { type: 'payment', data: { id: '900' } } });
  assert.equal(again.duplicate, true, 'Mesmo pagamento não entra duas vezes');
  console.log('  ✅ 2. Doação aprovada e idempotente.');

  // 3. Doação anônima não aparece com nome no ranking
  mock(() => json({ id: 901, status: 'approved', transaction_amount: 25, currency_id: 'BRL', external_reference: `donation|${U2}|2500|1` }));
  const anon = await donations.applyDonation({ id: 901, status: 'approved', transaction_amount: 25, currency_id: 'BRL', external_reference: `donation|${U2}|2500|1` }, { name: 'Bea' });
  assert.equal(anon.ok, true);
  assert.equal(anon.donation.anonymous, true);

  // 4. Ranking, resumo e recusa de valor menor
  const month = donations.ranking({ period: 'month' });
  assert.equal(month[0].cents, 2500, 'Maior doação primeiro');
  assert.equal(month.find((row) => row.anonymous)?.label, null, 'Anônimo sem nome');
  const summary = donations.summary();
  assert.equal(summary.total, 35);
  assert.equal(summary.count, 2);
  const cheap = donations.applyDonation({ id: 902, status: 'approved', transaction_amount: 0.5, currency_id: 'BRL', external_reference: `donation|${U2}|2500|0` });
  assert.equal(cheap.ok, false);
  assert.equal(cheap.reason, 'amount');
  console.log('  ✅ 3. Ranking, anonimato e recusa de valor menor.');

  console.log('💜 Doações: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes de doação:', err);
  process.exit(1);
});
