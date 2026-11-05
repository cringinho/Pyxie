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
  assert.equal(first.donation.name, 'Ana', 'O nome guardado na criação do Pix chega ao registro pelo webhook');
  assert.equal(donations.ranking({ period: 'month' }).find((row) => !row.anonymous)?.label, 'Ana', 'Ranking mostra o nome, não o ID do Discord');
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
  // Q075: o apelido do Pix (id 900) chega ao ranking pelo webhook; o ID do Discord nunca sai.
  assert.equal(month.find((row) => !row.anonymous)?.label, 'Ana', 'Apelido salvo na criação do Pix aparece no ranking');
  assert.ok(month.every((row) => !('userId' in row)), 'Ranking público não expõe o ID do Discord');
  // Q066: validade do Pix em UTC de verdade (30 min), sem trocar só o rótulo do fuso.
  const { pixExpiration, PIX_TTL_MS } = require('../src/services/planPayments');
  const now0 = Date.UTC(2026, 0, 1, 12, 0, 0);
  assert.equal(Date.parse(pixExpiration(now0)) - now0, PIX_TTL_MS, 'Pix expira em 30 min reais');
  assert.equal(Date.parse(body.date_of_expiration) - Date.now() <= PIX_TTL_MS, true, 'Pedido ao Mercado Pago com validade de até 30 min');
  const summary = donations.summary();
  assert.equal(summary.total, 35);
  assert.equal(summary.count, 2);
  const cheap = donations.applyDonation({ id: 902, status: 'approved', transaction_amount: 0.5, currency_id: 'BRL', external_reference: `donation|${U2}|2500|0` });
  assert.equal(cheap.ok, false);
  assert.equal(cheap.reason, 'amount');
  console.log('  ✅ 3. Ranking, anonimato e recusa de valor menor.');

  // 5. Nome guardado no Pix e ID do Discord fora do ranking público (Q244)
  mock(() => json({ id: 910, status: 'pending', transaction_amount: 50, point_of_interaction: { transaction_data: { qr_code: 'PIX910' } } }));
  const U3 = '700000000000000013';
  const named = await donations.createPixDonation({ userId: U3, cents: 5000, name: 'Carol' });
  assert.equal(named.ok, true);
  const createBody = JSON.parse(requests[0].opts.body);
  assert.ok(/-03:00$/.test(createBody.date_of_expiration), 'Prazo no fuso de Brasília');
  mock(() => json({ id: 910, status: 'approved', transaction_amount: 50, currency_id: 'BRL', external_reference: `donation|${U3}|5000|0` }));
  // 6. Conferência periódica registra a doação cujo aviso se perdeu (Q243)
  const rec = await donations.reconcilePending();
  assert.equal(rec.registered, 1, 'Doação pendente aprovada é registrada pela conferência');
  assert.equal((await donations.reconcilePending()).registered, 0, 'Sem registrar duas vezes');
  const top = donations.ranking({ period: 'month' });
  assert.equal(top[0].label, 'Carol', 'Ranking mostra o nome guardado no Pix, não o ID');
  for (const row of [...top, ...donations.ranking({ period: 'all' })]) {
    assert.equal('userId' in row, false, 'Ranking público não expõe o ID do Discord');
    assert.ok(!JSON.stringify(row).includes('70000000000000001'), 'Nenhum ID vaza na linha');
  }
  // Doação anônima pelo menu
  mock(() => json({ id: 911, status: 'pending', transaction_amount: 5, point_of_interaction: { transaction_data: { qr_code: 'PIX911' } } }));
  await donations.createPixDonation({ userId: U3, cents: 500, anonymous: true, name: 'Carol' });
  assert.equal(JSON.parse(requests[0].opts.body).external_reference, `donation|${U3}|500|1`);
  console.log('  ✅ 4. Nome guardado, ID fora do ranking e conferência das pendentes.');

  // 7. Estorno tira a doação do total e do ranking (Q245)
  const totalBefore = donations.summary().total;
  mock(() => json({ id: 910, status: 'refunded', transaction_amount: 50, currency_id: 'BRL', external_reference: `donation|${U3}|5000|0` }));
  const refund = await donations.handleWebhook({ body: { type: 'payment', data: { id: '910' } } });
  assert.equal(refund.refund, true);
  assert.equal(donations.summary().total, totalBefore - 50, 'Doação estornada sai do total');
  assert.ok(!donations.ranking({ period: 'month' }).some((row) => row.label === 'Carol'), 'E sai do ranking');
  console.log('  ✅ 5. Doação estornada sai do total e do ranking.');

  // 8. Botão de doação anônima e textos de erro com próximo passo (Q244/Q257)
  const { t } = require('../src/utils/i18n');
  for (const lang of ['pt', 'en']) {
    for (const code of ['unavailable', 'invalid_amount', 'provider', 'qr_missing', 'invalid_user', 'generic']) {
      assert.ok(!t(`home.donate.errors.${code}`, { lang }).startsWith('home.'), `Erro ${code} tem texto em ${lang}`);
    }
    assert.ok(!t('home.donate.optionAnon', { lang }, { amount: 5 }).startsWith('home.'));
    assert.ok(!t('home.donors.supporter', { lang }).startsWith('home.'));
  }
  console.log('  ✅ 6. Doação anônima no menu e erros com texto em PT e EN.');

  console.log('💜 Doações: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes de doação:', err);
  process.exit(1);
});
