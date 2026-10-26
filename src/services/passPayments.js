const crypto = require('node:crypto');
const battlePass = require('./battlePass');

/**
 * Pagamento do Passe Premium.
 *
 * - Mercado Pago (Brasil, R$ 5): Checkout Pro com Pix e cartão. Quem paga pelo app do Nubank (ou
 *   qualquer banco) usa o Pix do Mercado Pago; o Nubank não tem API de cobrança para terceiros.
 *   Confirmação pelo webhook (/api/pass/webhook/mercadopago), conferido na API do Mercado Pago
 *   e, se MERCADOPAGO_WEBHOOK_SECRET existir, pela assinatura x-signature.
 * - PayPal (resto do mundo, US$ 3): Orders v2. A pessoa aprova no PayPal, volta para
 *   /api/pass/paypal/return e o pedido é capturado no servidor.
 * - Sem credenciais, cada forma de pagamento fica desligada (o site mostra "em breve").
 *
 * A pessoa chega no site por um link assinado gerado no /py-pass (token com id e mês).
 * Variáveis: MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET, PAYPAL_CLIENT_ID,
 * PAYPAL_CLIENT_SECRET, PAYPAL_ENV (sandbox|live), PASS_PUBLIC_URL, PASS_TOKEN_SECRET.
 */

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const MP_API = 'https://api.mercadopago.com';
const PAYPAL_API = { live: 'https://api-m.paypal.com', sandbox: 'https://api-m.sandbox.paypal.com' };

let fetchImpl = (...args) => fetch(...args);
let fallbackSecret = null;

/** Para os testes trocarem a rede por respostas prontas. */
function setFetch(fn) {
  fetchImpl = fn || ((...args) => fetch(...args));
}

function publicUrl() {
  return String(process.env.PASS_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/$/, '');
}

function tokenSecret() {
  if (process.env.PASS_TOKEN_SECRET) return process.env.PASS_TOKEN_SECRET;
  if (process.env.DISCORD_TOKEN) return crypto.createHash('sha256').update(`pyxie-pass:${process.env.DISCORD_TOKEN}`).digest('hex');
  if (!fallbackSecret) fallbackSecret = crypto.randomBytes(32).toString('hex');
  return fallbackSecret;
}

function providers() {
  return {
    mercadopago: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  };
}

// ---------------------------------------------------------------- link assinado
function sign(payload) {
  return crypto.createHmac('sha256', tokenSecret()).update(payload).digest('base64url');
}

/** Link do site para comprar o Premium do mês atual (vale 2 horas). */
function createPassToken(userId, { lang = 'pt', now = Date.now() } = {}) {
  const payload = Buffer.from(JSON.stringify({ u: String(userId), m: battlePass.monthKey(now), l: lang === 'en' ? 'en' : 'pt', e: now + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifyPassToken(token, now = Date.now()) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.u || !data.m || Number(data.e) < now) return null;
    return { userId: String(data.u), month: String(data.m), lang: data.l === 'en' ? 'en' : 'pt' };
  } catch (_) {
    return null;
  }
}

function passUrl(userId, { lang = 'pt', now = Date.now() } = {}) {
  const token = createPassToken(userId, { lang, now });
  return `${publicUrl()}/passe?token=${encodeURIComponent(token)}${lang === 'en' ? '&lang=en' : ''}`;
}

/** Referência gravada no pagamento: quem e qual mês. */
function reference(userId, month) {
  return `pass|${userId}|${month}`;
}

function parseReference(ref) {
  const match = /^pass\|([\w-]{1,40})\|(\d{4}-\d{2})$/.exec(String(ref || ''));
  return match ? { userId: match[1], month: match[2] } : null;
}

async function readJsonResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (_) {
    return { raw: text };
  }
}

// ---------------------------------------------------------------- Mercado Pago
async function createMercadoPagoCheckout({ userId, month, lang = 'pt' }) {
  if (!providers().mercadopago) return { ok: false, reason: 'unavailable' };
  const res = await fetchImpl(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: `pass-${month}`, title: lang === 'en' ? `Pyxie Premium Pass ${month}` : `Passe Premium da Pyxie ${month}`, quantity: 1, currency_id: 'BRL', unit_price: battlePass.PRICE.BRL }],
      external_reference: reference(userId, month),
      notification_url: `${publicUrl()}/api/pass/webhook/mercadopago`,
      back_urls: {
        success: `${publicUrl()}/passe?status=ok${lang === 'en' ? '&lang=en' : ''}`,
        pending: `${publicUrl()}/passe?status=pending${lang === 'en' ? '&lang=en' : ''}`,
        failure: `${publicUrl()}/passe?status=fail${lang === 'en' ? '&lang=en' : ''}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'PYXIE PASSE',
    }),
  });
  const data = await readJsonResponse(res);
  if (!res.ok || !data.init_point) return { ok: false, reason: 'provider', status: res.status };
  return { ok: true, url: data.init_point, id: data.id };
}

/** Confere a assinatura x-signature do webhook (manifesto id/request-id/ts, HMAC-SHA256). */
function verifyMercadoPagoSignature({ headers = {}, dataId }) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;
  const signature = String(headers['x-signature'] || '');
  const requestId = String(headers['x-request-id'] || '');
  const parts = Object.fromEntries(signature.split(',').map((p) => p.trim().split('=')).filter((p) => p.length === 2));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${String(dataId || '').toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return expected.length === parts.v1.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}

/**
 * Aviso do Mercado Pago. O corpo só diz "olha o pagamento X": o status e o valor vêm sempre da
 * API do Mercado Pago, nunca do corpo do aviso.
 */
async function handleMercadoPagoWebhook({ body = {}, query = {}, headers = {} }) {
  if (!providers().mercadopago) return { ok: false, reason: 'unavailable' };
  const type = body.type || body.topic || query.type || query.topic;
  const dataId = query['data.id'] || body.data?.id || query.id;
  if (type !== 'payment' || !dataId) return { ok: true, ignored: true };
  if (!/^\d{1,20}$/.test(String(dataId))) return { ok: false, reason: 'payment_id' };
  if (!verifyMercadoPagoSignature({ headers, dataId })) return { ok: false, reason: 'signature' };
  const res = await fetchImpl(`${MP_API}/v1/payments/${dataId}`, { headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` } });
  const payment = await readJsonResponse(res);
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
  if (payment.status !== 'approved') return { ok: true, pending: true, status: payment.status };
  const ref = parseReference(payment.external_reference);
  if (!ref) return { ok: false, reason: 'reference' };
  if (payment.currency_id !== 'BRL' || Number(payment.transaction_amount) < battlePass.PRICE.BRL) return { ok: false, reason: 'amount' };
  const result = battlePass.activatePremium(ref.userId, ref.month, { paymentId: `mp:${payment.id}`, provider: 'mercadopago', amount: Number(payment.transaction_amount), currency: 'BRL' });
  return { ...result, userId: ref.userId, month: ref.month };
}

// ---------------------------------------------------------------- PayPal
function paypalBase() {
  return process.env.PAYPAL_ENV === 'live' ? PAYPAL_API.live : PAYPAL_API.sandbox;
}

async function paypalToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetchImpl(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await readJsonResponse(res);
  return res.ok ? data.access_token : null;
}

async function createPayPalCheckout({ userId, month, lang = 'pt' }) {
  if (!providers().paypal) return { ok: false, reason: 'unavailable' };
  const token = await paypalToken();
  if (!token) return { ok: false, reason: 'provider' };
  const res = await fetchImpl(`${paypalBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: reference(userId, month),
        description: lang === 'en' ? `Pyxie Premium Pass ${month}` : `Passe Premium da Pyxie ${month}`,
        amount: { currency_code: 'USD', value: battlePass.PRICE.USD.toFixed(2) },
      }],
      application_context: {
        brand_name: 'Pyxie',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: `${publicUrl()}/api/pass/paypal/return${lang === 'en' ? '?lang=en' : ''}`,
        cancel_url: `${publicUrl()}/passe?status=cancel${lang === 'en' ? '&lang=en' : ''}`,
      },
    }),
  });
  const data = await readJsonResponse(res);
  const approve = (data.links || []).find((link) => link.rel === 'approve' || link.rel === 'payer-action');
  if (!res.ok || !approve) return { ok: false, reason: 'provider', status: res.status };
  return { ok: true, url: approve.href, id: data.id };
}

/** Captura o pedido aprovado e libera o Premium (valor e referência conferidos na resposta). */
async function capturePayPalOrder(orderId) {
  if (!providers().paypal) return { ok: false, reason: 'unavailable' };
  if (!/^[A-Z0-9]{8,40}$/.test(String(orderId || ''))) return { ok: false, reason: 'order' };
  const token = await paypalToken();
  if (!token) return { ok: false, reason: 'provider' };
  const res = await fetchImpl(`${paypalBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await readJsonResponse(res);
  if (!res.ok || data.status !== 'COMPLETED') return { ok: false, reason: 'provider', status: res.status };
  const unit = data.purchase_units?.[0] || {};
  const capture = unit.payments?.captures?.[0] || {};
  const ref = parseReference(unit.custom_id || capture.custom_id);
  if (!ref) return { ok: false, reason: 'reference' };
  const amount = Number(capture.amount?.value || unit.amount?.value || 0);
  const currency = capture.amount?.currency_code || unit.amount?.currency_code;
  if (currency !== 'USD' || amount < battlePass.PRICE.USD) return { ok: false, reason: 'amount' };
  const result = battlePass.activatePremium(ref.userId, ref.month, { paymentId: `pp:${data.id}`, provider: 'paypal', amount, currency: 'USD' });
  return { ...result, userId: ref.userId, month: ref.month };
}

/** Começa o pagamento escolhido para quem chegou pelo link assinado. */
async function createCheckout(provider, token, now = Date.now()) {
  const session = verifyPassToken(token, now);
  if (!session) return { ok: false, reason: 'token' };
  if (session.month !== battlePass.monthKey(now)) return { ok: false, reason: 'expired' };
  if (battlePass.isPremium(session.userId, session.month)) return { ok: false, reason: 'already' };
  if (provider === 'mercadopago') return createMercadoPagoCheckout(session);
  if (provider === 'paypal') return createPayPalCheckout(session);
  return { ok: false, reason: 'provider' };
}

module.exports = {
  setFetch,
  providers,
  publicUrl,
  createPassToken,
  verifyPassToken,
  passUrl,
  reference,
  parseReference,
  createCheckout,
  createMercadoPagoCheckout,
  verifyMercadoPagoSignature,
  handleMercadoPagoWebhook,
  createPayPalCheckout,
  capturePayPalOrder,
};
