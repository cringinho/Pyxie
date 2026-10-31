// Assinatura mensal do servidor (Básico R$ 7 / Premium R$ 20).
// - Pix: cobrança avulsa de 30 dias, QR + copia-e-cola, renovação manual.
// - Cartão: Mercado Pago Preapproval (cobra sozinho todo mês).
// - O status e o valor vêm SEMPRE da API do Mercado Pago, nunca do corpo do webhook.
// - Quem não paga: guildPlans expira e guildPerks zera os benefícios (o módulo plans avisa por DM).
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const plans = require('./guildPlans');
const { withFileLock } = require('../utils/fileLock');
const { SUPPORT_EMAIL } = require('../config/support');

const MP_API = 'https://api.mercadopago.com';
const PIX_TTL_MS = 30 * 60 * 1000;
const CHARGE_LIMIT = 500;

let fetchImpl = (...args) => fetch(...args);
function setFetch(fn) {
  fetchImpl = fn || ((...args) => fetch(...args));
}

const publicUrl = () => String(process.env.PASS_PUBLIC_URL || process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '');
const token = () => String(process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim();

function providers() {
  const has = Boolean(token());
  return { pix: has, card: has };
}

const reference = (guildId, plan) => `plan|${guildId}|${plan}`;

function parseReference(ref) {
  const [kind, guildId, plan] = String(ref || '').split('|');
  if (kind !== 'plan' || !/^\d{17,20}$/.test(guildId || '') || !['basic', 'premium'].includes(plan)) return null;
  return { guildId, plan };
}

const priceOf = (plan) => (plans.PRICES[plan] || 0) / 100;

// ---------------------------------------------------------------- cobranças locais
const chargesFile = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'planCharges.json');

function loadCharges() {
  try {
    const parsed = JSON.parse(fs.readFileSync(chargesFile(), 'utf8')) || {};
    return { charges: parsed.charges || {}, processed: Array.isArray(parsed.processed) ? parsed.processed : [] };
  } catch (_) {
    return { charges: {}, processed: [] };
  }
}

function saveCharges(state) {
  const file = chargesFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const charges = Object.entries(state.charges)
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
    .slice(0, CHARGE_LIMIT);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 1, charges: Object.fromEntries(charges), processed: state.processed.slice(-CHARGE_LIMIT) }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return state;
}

const readJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (_) {
    return { raw: text };
  }
};

const authHeaders = (extra = {}) => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', ...extra });

// ---------------------------------------------------------------- Pix
async function createPixCharge({ guildId, plan, lang = 'pt', now = Date.now() } = {}) {
  if (!providers().pix) return { ok: false, reason: 'unavailable' };
  if (!plans.PRICES[plan]) return { ok: false, reason: 'invalid_plan' };
  if (!/^\d{17,20}$/.test(String(guildId || ''))) return { ok: false, reason: 'invalid_guild' };

  const amount = priceOf(plan);
  const res = await fetchImpl(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: authHeaders({ 'X-Idempotency-Key': `plan-${guildId}-${plan}-${now}` }),
    body: JSON.stringify({
      transaction_amount: amount,
      description: `${lang === 'en' ? 'Pyxie server plan' : 'Plano da Pyxie'} · ${plan} · ${guildId}`,
      payment_method_id: 'pix',
      external_reference: reference(guildId, plan),
      notification_url: `${publicUrl()}/api/plans/webhook/mercadopago`,
      date_of_expiration: new Date(now + PIX_TTL_MS).toISOString().replace('Z', '-03:00'),
      payer: { email: SUPPORT_EMAIL },
    }),
  });
  const data = await readJson(res);
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status, detail: data.message || data.error };
  const qr = data.point_of_interaction?.transaction_data || {};
  if (!qr.qr_code) return { ok: false, reason: 'qr_missing', status: res.status };

  const charge = {
    id: String(data.id),
    guildId: String(guildId),
    plan,
    method: 'pix',
    amount: Number(data.transaction_amount) || amount,
    status: data.status || 'pending',
    createdAt: now,
    expiresAt: now + PIX_TTL_MS,
  };
  withFileLock(chargesFile(), () => {
    const state = loadCharges();
    state.charges[charge.id] = charge;
    saveCharges(state);
  });

  return { ok: true, ...charge, qrCode: qr.qr_code, qrCodeBase64: qr.qr_code_base64 || null, ticketUrl: qr.ticket_url || null };
}

// ---------------------------------------------------------------- Cartão (Preapproval)
async function createCardSubscription({ guildId, plan, lang = 'pt', now = Date.now() } = {}) {
  if (!providers().card) return { ok: false, reason: 'unavailable' };
  if (!plans.PRICES[plan]) return { ok: false, reason: 'invalid_plan' };
  const amount = priceOf(plan);
  const res = await fetchImpl(`${MP_API}/preapproval`, {
    method: 'POST',
    headers: authHeaders({ 'X-Idempotency-Key': `plan-sub-${guildId}-${plan}-${now}` }),
    body: JSON.stringify({
      reason: `${lang === 'en' ? 'Pyxie server plan' : 'Plano da Pyxie'} · ${plan}`,
      external_reference: reference(guildId, plan),
      notification_url: `${publicUrl()}/api/plans/webhook/mercadopago`,
      back_url: `${publicUrl()}/passe?status=plan${lang === 'en' ? '&lang=en' : ''}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'BRL',
      },
    }),
  });
  const data = await readJson(res);
  if (!res.ok || !data.init_point) return { ok: false, reason: 'provider', status: res.status, detail: data.message || data.error };

  withFileLock(chargesFile(), () => {
    const state = loadCharges();
    state.charges[`preapproval:${data.id}`] = {
      id: String(data.id),
      guildId: String(guildId),
      plan,
      method: 'card',
      amount,
      status: data.status || 'pending',
      createdAt: now,
    };
    saveCharges(state);
  });
  return { ok: true, preapprovalId: String(data.id), initPoint: data.init_point, status: data.status };
}

async function cancelCardSubscription(preapprovalId) {
  if (!providers().card) return { ok: false, reason: 'unavailable' };
  const res = await fetchImpl(`${MP_API}/preapproval/${encodeURIComponent(preapprovalId)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: 'canceled' }),
  });
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
  return { ok: true };
}

// ---------------------------------------------------------------- Webhook
/** Assinatura x-signature (manifesto id/request-id/ts, HMAC-SHA256), igual ao Passe. */
function verifySignature({ headers = {}, dataId }) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // sem segredo configurado o Mercado Pago não assina; ver README
  const signature = String(headers['x-signature'] || '');
  const requestId = String(headers['x-request-id'] || '');
  const parts = Object.fromEntries(signature.split(',').map((p) => p.trim().split('=')).filter((p) => p.length === 2));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${String(dataId || '').toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return expected.length === parts.v1.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}

function markProcessed(key, patch = {}) {
  return withFileLock(chargesFile(), () => {
    const state = loadCharges();
    if (state.processed.includes(key)) return false;
    state.processed.push(key);
    const chargeId = key.replace(/^mp:/, '');
    if (state.charges[chargeId]) state.charges[chargeId] = { ...state.charges[chargeId], ...patch, status: 'paid', paidAt: Date.now() };
    saveCharges(state);
    return true;
  });
}

async function applyApprovedPayment(payment) {
  const ref = parseReference(payment?.external_reference);
  if (!ref) return { ok: false, reason: 'reference' };
  if (payment.currency_id !== 'BRL') return { ok: false, reason: 'currency' };
  if (Number(payment.transaction_amount) + 0.01 < priceOf(ref.plan)) return { ok: false, reason: 'amount' };
  const first = markProcessed(`mp:${payment.id}`, {});
  if (!first) return { ok: true, duplicate: true, ...ref };
  const granted = plans.grantPlan(ref.guildId, ref.plan, { months: 1, source: 'mercadopago', note: `mp:${payment.id}` });
  return { ok: true, ...ref, granted: granted.ok, paidUntil: granted.record?.paidUntil || 0 };
}

async function handleWebhook({ body = {}, query = {}, headers = {}, now = Date.now() } = {}) {
  if (!providers().pix) return { ok: false, reason: 'unavailable' };
  const type = body.type || body.topic || query.type || query.topic;
  const dataId = query['data.id'] || body.data?.id || query.id || body.id;
  if (!type || !dataId) return { ok: true, ignored: true };

  // Pix / pagamento avulso
  if (type === 'payment') {
    if (!/^\d{1,20}$/.test(String(dataId))) return { ok: false, reason: 'payment_id' };
    if (!verifySignature({ headers, dataId })) return { ok: false, reason: 'signature' };
    const res = await fetchImpl(`${MP_API}/v1/payments/${dataId}`, { headers: authHeaders() });
    const payment = await readJson(res);
    if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
    if (payment.status !== 'approved') return { ok: true, pending: true, status: payment.status };
    return applyApprovedPayment(payment);
  }

  // Assinatura no cartão (Preapproval autorizado = plano ativo)
  if (type === 'subscription_preapproval' || type === 'preapproval') {
    if (!verifySignature({ headers, dataId })) return { ok: false, reason: 'signature' };
    const res = await fetchImpl(`${MP_API}/preapproval/${dataId}`, { headers: authHeaders() });
    const sub = await readJson(res);
    if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
    if (sub.status !== 'authorized') return { ok: true, pending: true, status: sub.status };
    const ref = parseReference(sub.external_reference);
    if (!ref) return { ok: false, reason: 'reference' };
    const month = String(sub.next_payment_date || new Date(now).toISOString()).slice(0, 7);
    const first = markProcessed(`pre:${dataId}:${month}`);
    if (!first) return { ok: true, duplicate: true, ...ref };
    const granted = plans.grantPlan(ref.guildId, ref.plan, { months: 1, source: 'mercadopago-card', note: `pre:${dataId}` });
    return { ok: true, ...ref, granted: granted.ok, paidUntil: granted.record?.paidUntil || 0 };
  }

  // Cobrança mensal de uma assinatura de cartão
  if (type === 'subscription_authorized_payment') {
    if (!verifySignature({ headers, dataId })) return { ok: false, reason: 'signature' };
    const res = await fetchImpl(`${MP_API}/authorized_payments/${dataId}`, { headers: authHeaders() });
    const charge = await readJson(res);
    if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
    if (charge.status !== 'approved') return { ok: true, pending: true, status: charge.status };
    const subRes = await fetchImpl(`${MP_API}/preapproval/${charge.preapproval_id}`, { headers: authHeaders() });
    const sub = await readJson(subRes);
    const ref = parseReference(sub.external_reference);
    if (!ref) return { ok: false, reason: 'reference' };
    const first = markProcessed(`mp:${dataId}`);
    if (!first) return { ok: true, duplicate: true, ...ref };
    const granted = plans.grantPlan(ref.guildId, ref.plan, { months: 1, source: 'mercadopago-card', note: `mp:${dataId}` });
    return { ok: true, ...ref, granted: granted.ok, paidUntil: granted.record?.paidUntil || 0 };
  }

  return { ok: true, ignored: true, type };
}

/** Rede de segurança: confere cobranças Pix pendentes direto na API (webhook pode atrasar). */
async function reconcilePending({ now = Date.now(), maxAgeMs = 2 * 24 * 60 * 60 * 1000 } = {}) {
  const state = loadCharges();
  let checked = 0;
  let activated = 0;
  for (const charge of Object.values(state.charges)) {
    if (charge.method !== 'pix' || charge.status !== 'pending') continue;
    if (now - (charge.createdAt || 0) > maxAgeMs) continue;
    checked += 1;
    const res = await fetchImpl(`${MP_API}/v1/payments/${charge.id}`, { headers: authHeaders() });
    const payment = await readJson(res);
    if (!res.ok) continue;
    if (payment.status === 'approved') {
      const applied = await applyApprovedPayment(payment);
      if (applied.ok && !applied.duplicate) activated += 1;
    }
  }
  return { checked, activated };
}

/** Tudo que a tela de assinatura precisa: plano atual, preços, meios e cobrança pendente. */
function guildPlanInfo(guildId, now = Date.now()) {
  const state = loadCharges();
  const own = Object.values(state.charges)
    .filter((charge) => charge.guildId === String(guildId))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const pending = own.find((charge) => charge.method === 'pix' && charge.status === 'pending' && charge.expiresAt > now) || null;
  return {
    plan: plans.getPlan(guildId, now),
    prices: { basic: plans.PRICES.basic / 100, premium: plans.PRICES.premium / 100 },
    providers: providers(),
    pending,
    lastCard: own.find((charge) => charge.method === 'card') || null,
    support: { email: SUPPORT_EMAIL },
    ai: require('./aiQuota').snapshot(guildId, { now }),
  };
}

module.exports = {
  MP_API,
  PIX_TTL_MS,
  setFetch,
  publicUrl,
  providers,
  reference,
  parseReference,
  priceOf,
  createPixCharge,
  createCardSubscription,
  cancelCardSubscription,
  verifySignature,
  handleWebhook,
  reconcilePending,
  guildPlanInfo,
};
