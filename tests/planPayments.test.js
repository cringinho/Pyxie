const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('💳 Testes da assinatura mensal do servidor (Pix, cartão e webhook)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-plans-'));
process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-access-token';
process.env.PASS_PUBLIC_URL = 'https://pyxie.com.br';
delete process.env.MERCADOPAGO_WEBHOOK_SECRET;

const plans = require('../src/services/guildPlans');
const payments = require('../src/services/planPayments');
const notices = require('../src/services/planNotices');
const perks = require('../src/services/guildPerks');

const G = '1453890868980482090';
const DAY = 24 * 60 * 60 * 1000;
let requests = [];
const json = (data, ok = true, status = 200) => ({ ok, status, text: async () => JSON.stringify(data) });

function mock(handler) {
  requests = [];
  payments.setFetch(async (url, opts = {}) => {
    requests.push({ url: String(url), opts });
    return handler(String(url), opts);
  });
}

(async () => {
  // 1. Pix: cobrança com valor travado no servidor e QR de verdade
  mock(() =>
    json({
      id: 111,
      status: 'pending',
      transaction_amount: 7,
      point_of_interaction: { transaction_data: { qr_code: '00020126PIX', qr_code_base64: 'iVBORw0KGgo=' } },
    }),
  );
  assert.deepEqual(payments.providers(), { pix: true, card: true });
  assert.equal(payments.priceOf('basic'), 7);
  assert.equal(payments.priceOf('premium'), 20);

  const charge = await payments.createPixCharge({ guildId: G, plan: 'basic' });
  assert.equal(charge.ok, true);
  assert.equal(charge.qrCode, '00020126PIX');
  assert.equal(charge.amount, 7);
  const body = JSON.parse(requests[0].opts.body);
  assert.equal(requests[0].url, `${payments.MP_API}/v1/payments`);
  assert.equal(body.transaction_amount, 7, 'Valor vem do catálogo, nunca do cliente');
  assert.equal(body.payment_method_id, 'pix');
  assert.equal(body.external_reference, `plan|${G}|basic`);
  assert.equal(body.notification_url, 'https://pyxie.com.br/api/plans/webhook/mercadopago');
  assert.ok(payments.guildPlanInfo(G).pending, 'Cobrança pendente aparece no painel');
  console.log('  ✅ 1. Pix com QR, valor travado e referência do servidor.');

  // 2. Webhook aprovado ativa o plano e é idempotente
  mock((url) =>
    url.includes('/v1/payments/111')
      ? json({ id: 111, status: 'approved', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` })
      : json({}),
  );
  const approved = await payments.handleWebhook({ body: { type: 'payment', data: { id: '111' } } });
  assert.equal(approved.ok, true);
  assert.equal(approved.granted, true);
  const active = plans.getPlan(G);
  assert.equal(active.plan, 'basic');
  assert.equal(active.active, true);
  assert.ok(active.paidUntil > Date.now());
  const again = await payments.handleWebhook({ body: { type: 'payment', data: { id: '111' } } });
  assert.equal(again.duplicate, true, 'Mesmo pagamento não ativa duas vezes');
  console.log('  ✅ 2. Webhook aprovado ativa o plano uma única vez.');

  // 3. Valor menor que o preço é recusado
  mock(() => json({ id: 222, status: 'approved', transaction_amount: 0.5, currency_id: 'BRL', external_reference: `plan|${G}|premium` }));
  const cheap = await payments.handleWebhook({ body: { type: 'payment', data: { id: '222' } } });
  assert.equal(cheap.ok, false);
  assert.equal(cheap.reason, 'amount');
  assert.notEqual(plans.getPlan(G).plan, 'premium');
  console.log('  ✅ 3. Pagamento abaixo do preço não ativa nada.');

  // 4. Cartão: Preapproval + assinatura autorizada
  mock((url) => (url.endsWith('/preapproval') ? json({ id: 'pre-1', init_point: 'https://mp/checkout', status: 'pending' }) : json({})));
  const card = await payments.createCardSubscription({ guildId: G, plan: 'premium' });
  assert.equal(card.ok, true);
  assert.equal(card.initPoint, 'https://mp/checkout');
  const subBody = JSON.parse(requests[0].opts.body);
  assert.equal(subBody.auto_recurring.frequency, 1);
  assert.equal(subBody.auto_recurring.frequency_type, 'months');
  assert.equal(subBody.auto_recurring.transaction_amount, 20);

  mock(() => json({ id: 'pre-1', status: 'authorized', external_reference: `plan|${G}|premium`, next_payment_date: '2026-12-01T00:00:00.000Z' }));
  const subHook = await payments.handleWebhook({ body: { type: 'subscription_preapproval', data: { id: 'pre-1' } } });
  assert.equal(subHook.ok, true);
  assert.equal(plans.getPlan(G).plan, 'premium');
  console.log('  ✅ 4. Cartão recorrente (Preapproval) ativa o plano.');

  // 5. Reconciliação do Pix pendente (webhook atrasado)
  mock((url) =>
    url.endsWith('/v1/payments')
      ? json({ id: 333, status: 'pending', transaction_amount: 7, point_of_interaction: { transaction_data: { qr_code: 'PIX333' } } })
      : json({ id: 333, status: 'approved', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` }),
  );
  plans.revokePlan(G, 'canceled');
  await payments.createPixCharge({ guildId: G, plan: 'basic' });
  mock(() => json({ id: 333, status: 'approved', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` }));
  const rec = await payments.reconcilePending();
  assert.ok(rec.checked >= 1);
  assert.equal(rec.activated, 1, 'Reconciliação ativa o plano');
  const recAgain = await payments.reconcilePending();
  assert.equal(recAgain.activated, 0, 'Não reativa o mesmo pagamento');
  console.log('  ✅ 5. Reconciliação de Pix pendente sem duplicar.');

  // 6. Assinatura do webhook quando o segredo existe
  process.env.MERCADOPAGO_WEBHOOK_SECRET = 'segredo';
  assert.equal(payments.verifySignature({ headers: { 'x-signature': 'ts=1,v1=abc' }, dataId: '1' }), false, 'Assinatura inválida recusada');
  const manifest = 'id:444;request-id:req-1;ts:1700;';
  const sig = crypto.createHmac('sha256', 'segredo').update(manifest).digest('hex');
  assert.equal(payments.verifySignature({ headers: { 'x-signature': `ts=1700,v1=${sig}`, 'x-request-id': 'req-1' }, dataId: '444' }), true);
  delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  console.log('  ✅ 6. Assinatura x-signature do webhook validada.');

  // 7. Fila de avisos, dedupe e expiração
  assert.equal(notices.push({ guildId: G, kind: 'reminder' }), true);
  assert.equal(notices.push({ guildId: G, kind: 'reminder' }), false, 'Não duplica aviso em 12 h');
  assert.equal(notices.takeAll().length, 1);
  assert.equal(notices.takeAll().length, 0);
  plans.revokePlan(G, 'canceled');
  plans.grantPlan(G, 'basic', { months: 1 });
  assert.equal(perks.forGuild(G, Date.now() + 31 * DAY).dailyBonus, 0, 'Plano vencido zera o bônus');
  console.log('  ✅ 7. Fila de DMs, dedupe e expiração do plano.');

  console.log('💳 Assinaturas: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes de assinatura:', err);
  process.exit(1);
});
