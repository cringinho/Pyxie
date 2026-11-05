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

  const before = plans.getPlan(G);
  mock(() => json({ id: 'pre-1', status: 'authorized', external_reference: `plan|${G}|premium`, next_payment_date: '2026-12-01T00:00:00.000Z' }));
  const subHook = await payments.handleWebhook({ body: { type: 'subscription_preapproval', data: { id: 'pre-1' } } });
  assert.equal(subHook.ok, true);
  assert.equal(plans.getPlan(G).paidUntil, before.paidUntil, 'Assinatura autorizada sozinha não libera tempo (Q241)');
  // A cobrança aprovada é quem libera, uma vez só e com valor conferido.
  mock((url) =>
    url.includes('/authorized_payments/')
      ? json({ id: 'ap-1', status: 'approved', preapproval_id: 'pre-1', transaction_amount: 20, currency_id: 'BRL' })
      : json({ id: 'pre-1', status: 'authorized', external_reference: `plan|${G}|premium` }),
  );
  const paid = await payments.handleWebhook({ body: { type: 'subscription_authorized_payment', data: { id: 'ap-1' } } });
  assert.equal(paid.ok, true);
  assert.equal(paid.granted, true);
  assert.equal(plans.getPlan(G).plan, 'premium');
  const paidUntilAfter = plans.getPlan(G).paidUntil;
  const paidAgain = await payments.handleWebhook({ body: { type: 'subscription_authorized_payment', data: { id: 'ap-1' } } });
  assert.equal(paidAgain.duplicate, true);
  const preAgain = await payments.handleWebhook({ body: { type: 'subscription_preapproval', data: { id: 'pre-1' } } });
  assert.equal(preAgain.ok, true);
  assert.equal(plans.getPlan(G).paidUntil, paidUntilAfter, 'Aviso repetido da assinatura não soma tempo');
  mock((url) =>
    url.includes('/authorized_payments/')
      ? json({ id: 'ap-2', status: 'approved', preapproval_id: 'pre-1', transaction_amount: 1, currency_id: 'BRL' })
      : json({ id: 'pre-1', status: 'authorized', external_reference: `plan|${G}|premium` }),
  );
  const cheapCard = await payments.handleWebhook({ body: { type: 'subscription_authorized_payment', data: { id: 'ap-2' } } });
  assert.equal(cheapCard.reason, 'amount', 'Cobrança no cartão abaixo do preço é recusada');
  console.log('  ✅ 4. Cartão recorrente: só a cobrança aprovada libera, uma vez e com valor conferido.');

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

  // 8. Prazo do Pix no horário de Brasília e Pix pendente com o copia-e-cola (Q249)
  assert.equal(payments.mpExpiration(Date.UTC(2026, 0, 1, 12, 0, 0)), '2026-01-01T09:00:00.000-03:00', 'UTC 12h = 09h em Brasília');
  const nowPix = Date.now();
  mock(() => json({ id: 444, status: 'pending', transaction_amount: 7, point_of_interaction: { transaction_data: { qr_code: 'PIX444' } } }));
  plans.revokePlan(G, 'canceled');
  await payments.createPixCharge({ guildId: G, plan: 'basic', now: nowPix });
  const expBody = JSON.parse(requests[0].opts.body);
  assert.equal(Date.parse(expBody.date_of_expiration), nowPix + payments.PIX_TTL_MS, 'Mercado Pago recebe o mesmo prazo que a tela mostra');
  const pendingInfo = payments.guildPlanInfo(G, nowPix).pending;
  assert.equal(pendingInfo.qrCode, 'PIX444', 'Painel recupera o Pix pendente depois de recarregar');
  console.log('  ✅ 8. Prazo do Pix em Brasília e Pix pendente recuperável no painel.');

  // 9. Benefício não gravado: nada é marcado e o reenvio libera (Q246)
  mock(() => json({ id: 444, status: 'approved', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` }));
  const realGrant = plans.grantPlan;
  plans.grantPlan = () => {
    throw new Error('EIO disco cheio');
  };
  const failed = await payments.handleWebhook({ body: { type: 'payment', data: { id: '444' } } });
  plans.grantPlan = realGrant;
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, 'save', 'Falha ao gravar vira erro (a rota responde 500 e o Mercado Pago reenvia)');
  assert.equal(plans.getPlan(G).active, false, 'Nada foi liberado');
  const retried = await payments.handleWebhook({ body: { type: 'payment', data: { id: '444' } } });
  assert.equal(retried.granted, true, 'Reenvio libera (não cai como duplicado)');
  assert.equal(payments.guildPlanInfo(G).pending, null, 'Pix pago some da lista de pendentes');
  const serverSrc = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.ok(/reason === 'save'\) return res\.status\(500\)/.test(serverSrc), 'Rotas do webhook respondem 500 quando o benefício não foi gravado');
  console.log('  ✅ 9. Falha ao gravar não marca o pagamento e o reenvio libera.');

  // 10. Estorno/contestação retira o tempo daquele pagamento (Q245)
  const beforeRefund = plans.getPlan(G).paidUntil;
  mock(() => json({ id: 444, status: 'refunded', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` }));
  const refunded = await payments.handleWebhook({ body: { type: 'payment', data: { id: '444' } } });
  assert.equal(refunded.refund, true);
  assert.equal(refunded.revoked, true);
  assert.ok(plans.getPlan(G).paidUntil <= beforeRefund - 29 * DAY, 'Os 30 dias do pagamento estornado saem');
  assert.equal(plans.getPlan(G).active, false, 'Sem tempo pago sobrando, o plano para');
  assert.equal(plans.getPlan(G).status, 'refunded');
  const refundAgain = await payments.handleWebhook({ body: { type: 'payment', data: { id: '444' } } });
  assert.equal(refundAgain.duplicate, true, 'Estorno repetido não tira duas vezes');
  // Estorno que chega antes da aprovação: a aprovação atrasada não libera.
  mock(() => json({ id: 445, status: 'charged_back', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` }));
  await payments.handleWebhook({ body: { type: 'payment', data: { id: '445' } } });
  mock(() => json({ id: 445, status: 'approved', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` }));
  const lateApproval = await payments.handleWebhook({ body: { type: 'payment', data: { id: '445' } } });
  assert.equal(lateApproval.duplicate, true, 'Pagamento contestado não libera depois');
  console.log('  ✅ 10. Estorno e contestação retiram o benefício, uma vez só.');

  // 11. Pix do Básico pago com Premium ativo não rebaixa o servidor (Q253)
  plans.revokePlan(G, 'canceled');
  plans.grantPlan(G, 'premium', { months: 1 });
  const premiumUntil = plans.getPlan(G).paidUntil;
  mock(() => json({ id: 446, status: 'approved', transaction_amount: 7, currency_id: 'BRL', external_reference: `plan|${G}|basic` }));
  const lower = await payments.handleWebhook({ body: { type: 'payment', data: { id: '446' } } });
  assert.equal(lower.granted, true);
  assert.equal(lower.plan, 'premium', 'O aviso diz o plano que ficou');
  assert.equal(plans.getPlan(G).plan, 'premium', 'Premium continua');
  assert.equal(plans.getPlan(G).paidUntil, premiumUntil + 11 * DAY, 'R$ 7 viram ~11 dias de Premium (proporcional)');
  const routesSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'routes', 'dashboardRoutes.js'), 'utf8');
  const checkoutRoute = routesSrc.slice(routesSrc.indexOf("'/api/dashboard/guilds/:guildId/plan/checkout'"));
  assert.ok(checkoutRoute.slice(0, checkoutRoute.indexOf('router.', 10)).includes("'plan_downgrade'"), 'Checkout recusa plano menor com um maior ativo');
  console.log('  ✅ 11. Plano menor com o maior ativo não perde os dias pagos.');

  // 12. Doação do /py-home chega pela rota dos planos (Q243)
  const donations = require('../src/services/donations');
  const U = '700000000000000099';
  const beforeDon = donations.summary().count;
  mock(() => json({ id: 447, status: 'approved', transaction_amount: 5, currency_id: 'BRL', external_reference: `donation|${U}|500|0` }));
  const don = await payments.handleWebhook({ body: { type: 'payment', data: { id: '447' } } });
  assert.equal(don.ok, true);
  assert.equal(don.kind, 'donation');
  assert.equal(donations.summary().count, beforeDon + 1, 'Doação entra no total');
  const donAgain = await payments.handleWebhook({ body: { type: 'payment', data: { id: '447' } } });
  assert.equal(donAgain.duplicate, true, 'Doação não entra duas vezes');
  console.log('  ✅ 12. Doação do /py-home registrada pela rota dos planos.');

  // 13. Lembrete de quem renova no cartão não pede para pagar de novo (Q255)
  const plansModule = require('../src/modules/plans');
  const CARD_G = '1557399041443111025';
  mock(() => json({ id: 'pre-card', init_point: 'https://mp/x', status: 'pending' }));
  await payments.createCardSubscription({ guildId: CARD_G, plan: 'basic' });
  assert.equal(plansModule.reminderKindFor(CARD_G, {}), 'card_reminder');
  assert.equal(plansModule.reminderKindFor('1453890868980482091', {}), 'reminder');
  const cardMsg = plansModule.payloadFor({ kind: 'card_reminder', guildId: CARD_G, plan: 'basic', paidUntil: Date.UTC(2026, 11, 10, 15) }, 'pt');
  assert.ok(cardMsg.lines[0].includes('10/12/2026'), 'Mostra a data da cobrança automática');
  assert.ok(!/Renove no painel/.test(cardMsg.lines[0]), 'Não pede para renovar');
  assert.ok(plansModule.payloadFor({ kind: 'card_reminder', guildId: CARD_G, plan: 'basic', paidUntil: Date.UTC(2026, 11, 10, 15) }, 'en').lines[0].includes('automatic charge'));
  console.log('  ✅ 13. Lembrete do cartão com a data da cobrança, sem pedir renovação.');

  console.log('💳 Assinaturas: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes de assinatura:', err);
  process.exit(1);
});
