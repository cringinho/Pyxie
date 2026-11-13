// LEGADO — cobrança desligada (a Pyxie não cobra por nada; acesso é vitalício ou por chave).
// Assinatura mensal do servidor (Básico R$ 7 / Premium R$ 20), mantida só atrás de PYXIE_PAYMENTS=on.
// - Pix: cobrança avulsa de 30 dias, QR + copia-e-cola, renovação manual.
// - Cartão: Mercado Pago Preapproval (cobra sozinho todo mês).
// - O status e o valor vêm SEMPRE da API do Mercado Pago, nunca do corpo do webhook.
// - Quem não paga: guildPlans expira e guildPerks zera os benefícios (o módulo plans avisa por DM).
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const plans = require('./guildPlans');
const planAddons = require('../config/planAddons');
const guildAddons = require('./guildAddons');
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

/**
 * Cobrança desligada por decisão do dono: a Pyxie é fechada e não cobra por nada.
 * O código de pagamento fica só para ler/estornar o histórico antigo; criar cobrança nova exige
 * `PYXIE_PAYMENTS=on` (nunca ligado em produção).
 */
const paymentsEnabled = () => String(process.env.PYXIE_PAYMENTS || '').toLowerCase() === 'on';

function providers() {
  const has = paymentsEnabled() && Boolean(token());
  return { pix: has, card: has };
}

// Mensal mantém a referência de 3 partes (cobranças já emitidas continuam válidas);
// o anual ganha a 4ª parte com o ciclo.
const reference = (guildId, plan, cycle = 'month') =>
  cycle === 'year' ? `plan|${guildId}|${plan}|year` : `plan|${guildId}|${plan}`;
// Extras: `addon|<guildId>|<addonId>|<cycle>`. Ciclo anual dá 2 meses grátis.
const addonReference = (guildId, addonId, cycle) => `addon|${guildId}|${addonId}|${cycle}`;

function parseReference(ref) {
  const parts = String(ref || '').split('|');
  if (parts[0] === 'plan') {
    const [, guildId, plan, cycle] = parts;
    if (!/^\d{17,20}$/.test(guildId || '') || !['basic', 'premium'].includes(plan)) return null;
    // 3 partes = cobrança antiga (mensal). O ciclo anual ganhou a 4ª parte.
    return { kind: 'plan', guildId, plan, cycle: cycle === 'year' ? 'year' : 'month' };
  }
  if (parts[0] === 'addon') {
    const [, guildId, addonId, cycle] = parts;
    const addon = planAddons.getAddon(addonId);
    if (!/^\d{17,20}$/.test(guildId || '') || !addon) return null;
    return { kind: 'addon', guildId, addonId: addon.id, cycle: cycle === 'year' ? 'year' : 'month' };
  }
  return null;
}

const priceOf = (plan, cycle = 'month') => plans.priceOf(plan, cycle) / 100;

/** Resolve o que está sendo cobrado (plano ou extra) com valor e referência. */
function resolveTarget({ guildId, plan, addonId = null, cycle = 'month' }) {
  if (addonId) {
    const addon = planAddons.getAddon(addonId);
    if (!addon) return null;
    const cyc = cycle === 'year' ? 'year' : 'month';
    return {
      kind: 'addon',
      addonId: addon.id,
      cycle: cyc,
      amount: planAddons.priceOf(addon.id, cyc) / 100,
      label: `${addon.id}-${cyc}`,
      ref: addonReference(guildId, addon.id, cyc),
    };
  }
  if (!plans.PRICES[plan]) return null;
  const cyc = cycle === 'year' ? 'year' : 'month';
  return {
    kind: 'plan',
    plan,
    cycle: cyc,
    amount: priceOf(plan, cyc),
    label: `${plan}-${cyc}`,
    ref: reference(guildId, plan, cyc),
  };
}

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

/**
 * Validade do Pix (PIX_TTL_MS a partir de `now`) no formato que o Mercado Pago espera, no
 * horário de Brasília. Antes o horário UTC ia rotulado como -03:00 e o Pix ficava pagável
 * ~3h30 a mais do que a tela dizia (Q249). Usada pelos planos e pelas doações.
 */
function pixExpiration(now = Date.now()) {
  return new Date(now + PIX_TTL_MS - 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00');
}

// Status do Mercado Pago que devolvem o dinheiro: o benefício sai junto (Q245).
const REFUND_STATUSES = new Set(['refunded', 'charged_back']);

const authHeaders = (extra = {}) => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', ...extra });

// ---------------------------------------------------------------- Pix
async function createPixCharge({ guildId, plan, addonId = null, cycle = 'month', lang = 'pt', now = Date.now() } = {}) {
  if (!providers().pix) return { ok: false, reason: 'unavailable' };
  const target = resolveTarget({ guildId, plan, addonId, cycle });
  if (!target) return { ok: false, reason: addonId ? 'invalid_addon' : 'invalid_plan' };
  if (!/^\d{17,20}$/.test(String(guildId || ''))) return { ok: false, reason: 'invalid_guild' };

  const amount = target.amount;
  const res = await fetchImpl(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: authHeaders({ 'X-Idempotency-Key': `${target.kind}-${guildId}-${target.label}-${now}` }),
    body: JSON.stringify({
      transaction_amount: amount,
      description: `${lang === 'en' ? 'Pyxie' : 'Pyxie'} · ${target.label} · ${guildId}`,
      payment_method_id: 'pix',
      external_reference: target.ref,
      notification_url: `${publicUrl()}/api/plans/webhook/mercadopago`,
      date_of_expiration: pixExpiration(now),
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
    kind: target.kind,
    addonId: target.addonId || null,
    cycle: target.cycle,
    status: data.status || 'pending',
    createdAt: now,
    expiresAt: now + PIX_TTL_MS,
    // Copia-e-cola guardado: o painel volta a mostrar o mesmo Pix depois de recarregar (Q249).
    qrCode: qr.qr_code,
  };
  withFileLock(chargesFile(), () => {
    const state = loadCharges();
    state.charges[charge.id] = charge;
    saveCharges(state);
  });

  return { ok: true, ...charge, qrCodeBase64: qr.qr_code_base64 || null, ticketUrl: qr.ticket_url || null };
}

// ---------------------------------------------------------------- Cartão (Preapproval)
async function createCardSubscription({ guildId, plan, addonId = null, cycle = 'month', lang = 'pt', now = Date.now() } = {}) {
  if (!providers().card) return { ok: false, reason: 'unavailable' };
  const target = resolveTarget({ guildId, plan, addonId, cycle });
  if (!target) return { ok: false, reason: addonId ? 'invalid_addon' : 'invalid_plan' };
  const res = await fetchImpl(`${MP_API}/preapproval`, {
    method: 'POST',
    headers: authHeaders({ 'X-Idempotency-Key': `${target.kind}-sub-${guildId}-${target.label}-${now}` }),
    body: JSON.stringify({
      reason: `Pyxie · ${target.label}`,
      external_reference: target.ref,
      notification_url: `${publicUrl()}/api/plans/webhook/mercadopago`,
      // Volta para a aba Planos do painel, que confirma o pagamento (auditoria Q065).
      back_url: `${publicUrl()}/dashboard?paid=plan&guild=${encodeURIComponent(guildId)}${lang === 'en' ? '&lang=en' : ''}`,
      auto_recurring: {
        frequency: target.cycle === 'year' ? 12 : 1,
        frequency_type: 'months',
        transaction_amount: target.amount,
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
      kind: target.kind,
      plan: target.plan || null,
      addonId: target.addonId || null,
      cycle: target.cycle || 'month',
      method: 'card',
      amount: target.amount,
      status: data.status || 'pending',
      createdAt: now,
    };
    saveCharges(state);
  });
  return { ok: true, preapprovalId: String(data.id), initPoint: data.init_point, status: data.status };
}

/**
 * Reembolso pelo painel do dono (Q245): devolve o dinheiro no Mercado Pago e já retira o
 * benefício (plano, extra, Passe ou doação do ranking). Idempotente: repetir não devolve
 * de novo (chave de idempotência fixa) nem retira duas vezes.
 */
async function refundPayment(paymentId, { now = Date.now() } = {}) {
  if (!token()) return { ok: false, reason: 'unavailable' };
  const id = String(paymentId || '').trim();
  if (!/^\d{1,20}$/.test(id)) return { ok: false, reason: 'payment_id' };
  const res = await fetchImpl(`${MP_API}/v1/payments/${id}/refunds`, {
    method: 'POST',
    headers: authHeaders({ 'X-Idempotency-Key': `refund-${id}` }),
    body: JSON.stringify({}),
  });
  const refund = await readJson(res);
  if (!res.ok && res.status !== 400) return { ok: false, reason: 'provider', status: res.status };
  // 400 costuma ser "já estornado": confere o status real antes de seguir.
  const payRes = await fetchImpl(`${MP_API}/v1/payments/${id}`, { headers: authHeaders() });
  const payment = await readJson(payRes);
  if (!payRes.ok) return { ok: false, reason: 'provider', status: payRes.status };
  if (!res.ok && !REFUND_STATUSES.has(payment.status)) {
    return { ok: false, reason: 'refund_refused', detail: refund.message || refund.error || null };
  }
  const refunded = { ...payment, status: REFUND_STATUSES.has(payment.status) ? payment.status : 'refunded' };
  const passRef = require('./passPayments').parseReference(payment.external_reference);
  if (passRef) {
    const result = require('./battlePass').refundPremium(`mp:${id}`, { userId: passRef.userId, month: passRef.month, now });
    return { ...result, refund: true, kind: 'pass', userId: passRef.userId, month: passRef.month };
  }
  const result = await applyRefundedPayment(refunded);
  if (result.ignored) return { ok: false, reason: 'reference' };
  return result;
}

async function cancelCardSubscription(preapprovalId) {
  if (!providers().card) return { ok: false, reason: 'unavailable' };
  const res = await fetchImpl(`${MP_API}/preapproval/${encodeURIComponent(preapprovalId)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
  withFileLock(chargesFile(), () => {
    const state = loadCharges();
    const key = `preapproval:${preapprovalId}`;
    if (state.charges[key]) {
      state.charges[key] = { ...state.charges[key], status: 'cancelled', canceledAt: Date.now() };
      saveCharges(state);
    }
  });
  return { ok: true };
}

/** Assinatura de cartão do plano deste servidor que ainda renova (nunca a de outro servidor). */
function activeCardSubscription(guildId) {
  const own = Object.values(loadCharges().charges)
    .filter((c) => c.method === 'card' && c.kind !== 'addon' && c.guildId === String(guildId))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const last = own[0];
  if (!last || ['cancelled', 'canceled'].includes(last.status)) return null;
  return last;
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

/**
 * Libera uma única vez por pagamento (auditoria Q246). A marca de "processado" só é
 * gravada DEPOIS que o benefício foi salvo: se a gravação falhar, nada é marcado e o
 * reenvio do Mercado Pago (ou a conferência automática) tenta de novo. Tudo dentro da
 * trava do arquivo de cobranças, então dois avisos simultâneos não liberam em dobro.
 */
function grantOnce(key, chargeId, grantFn) {
  return withFileLock(chargesFile(), () => {
    const state = loadCharges();
    if (state.processed.includes(key)) return { duplicate: true };
    let result;
    try {
      result = grantFn();
    } catch (err) {
      return { failed: true, error: err.message };
    }
    if (!result || result.ok === false) return { failed: true, result };
    state.processed.push(key);
    if (chargeId && state.charges[chargeId]) {
      const { qrCode, ...rest } = state.charges[chargeId];
      state.charges[chargeId] = { ...rest, status: 'paid', paidAt: Date.now() };
    }
    saveCharges(state);
    return { result };
  });
}

const grantRef = (ref, source, note) =>
  ref.kind === 'addon'
    ? guildAddons.grant(ref.guildId, ref.addonId, ref.cycle === 'year' ? { years: 1, source, note } : { months: 1, source, note })
    : plans.grantPlan(ref.guildId, ref.plan, { months: ref.cycle === 'year' ? 12 : 1, source, note, protectHigher: true });

function grantResult(ref, granted) {
  if (granted.duplicate) return { ok: true, duplicate: true, ...ref };
  if (granted.failed) return { ok: false, reason: 'save', ...ref };
  const record = granted.result.record || {};
  return ref.kind === 'addon'
    ? { ok: true, ...ref, granted: true, until: record.until || 0 }
    : { ok: true, ...ref, plan: granted.result.kept || ref.plan, granted: true, paidUntil: record.paidUntil || 0 };
}

const donationsSvc = () => require('./donations');
const isDonationRef = (ref) => String(ref || '').startsWith('donation|');

async function applyApprovedPayment(payment) {
  // Doação do /py-home usa o mesmo aviso: vai para o livro das doações (Q243).
  if (isDonationRef(payment?.external_reference)) {
    const donation = donationsSvc().applyDonation(payment);
    return { ...donation, kind: 'donation' };
  }
  const ref = parseReference(payment?.external_reference);
  if (!ref) return { ok: false, reason: 'reference' };
  if (payment.currency_id !== 'BRL') return { ok: false, reason: 'currency' };

  const expected =
    ref.kind === 'addon' ? planAddons.priceOf(ref.addonId, ref.cycle) / 100 : priceOf(ref.plan, ref.cycle);
  if (Number(payment.transaction_amount) + 0.01 < expected) return { ok: false, reason: 'amount' };

  const granted = grantOnce(`mp:${payment.id}`, String(payment.id), () => grantRef(ref, 'mercadopago', `mp:${payment.id}`));
  return grantResult(ref, granted);
}

/**
 * Estorno, devolução ou contestação (Q245): tira o tempo que aquele pagamento comprou.
 * Idempotente (`refund:<chave>`); só retira o que de fato foi liberado por esse pagamento.
 */
function applyRefund(key, ref, { chargeId = null, now = Date.now() } = {}) {
  return withFileLock(chargesFile(), () => {
    const state = loadCharges();
    const refundKey = `refund:${key}`;
    if (state.processed.includes(refundKey)) return { ok: true, duplicate: true, refund: true, ...ref };
    const wasGranted = state.processed.includes(key);
    if (wasGranted) {
      const result =
        ref.kind === 'addon'
          ? guildAddons.refund(ref.guildId, ref.addonId, ref.cycle === 'year' ? { years: 1, note: `refund:${key}`, now } : { months: 1, note: `refund:${key}`, now })
          : plans.refundPlan(ref.guildId, { months: ref.cycle === 'year' ? 12 : 1, note: `refund:${key}`, now });
      // Vitalício/sem registro: nada a retirar, mas o estorno fica anotado.
      if (!result.ok && !['lifetime', 'not_found', 'no_plan'].includes(result.reason)) return { ok: false, reason: 'save', ...ref };
    } else {
      // Estorno antes da aprovação: reserva a chave para uma aprovação atrasada não liberar.
      state.processed.push(key);
    }
    state.processed.push(refundKey);
    if (chargeId && state.charges[chargeId]) {
      const { qrCode, ...rest } = state.charges[chargeId];
      state.charges[chargeId] = { ...rest, status: 'refunded', refundedAt: now };
    }
    saveCharges(state);
    return { ok: true, refund: true, revoked: wasGranted, ...ref };
  });
}

async function applyRefundedPayment(payment) {
  if (isDonationRef(payment?.external_reference)) return { ...donationsSvc().refundDonation(payment), kind: 'donation' };
  const ref = parseReference(payment?.external_reference);
  if (!ref) return { ok: true, ignored: true, reason: 'reference' };
  return applyRefund(`mp:${payment.id}`, ref, { chargeId: String(payment.id) });
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
    if (REFUND_STATUSES.has(payment.status)) return applyRefundedPayment(payment);
    if (payment.status !== 'approved') {
      markChargeStatus(String(payment.id), payment.status);
      return { ok: true, pending: true, status: payment.status };
    }
    return applyApprovedPayment(payment);
  }

  // Assinatura no cartão autorizada: só registra o status. Quem libera tempo de
  // plano é a COBRANÇA aprovada (subscription_authorized_payment) logo abaixo;
  // liberar aqui também dava ~2 meses pagando 1 (auditoria Q241).
  if (type === 'subscription_preapproval' || type === 'preapproval') {
    if (!verifySignature({ headers, dataId })) return { ok: false, reason: 'signature' };
    const res = await fetchImpl(`${MP_API}/preapproval/${dataId}`, { headers: authHeaders() });
    const sub = await readJson(res);
    if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
    const ref = parseReference(sub.external_reference);
    if (!ref) return { ok: false, reason: 'reference' };
    withFileLock(chargesFile(), () => {
      const state = loadCharges();
      const id = `preapproval:${dataId}`;
      if (state.charges[id]) {
        state.charges[id] = { ...state.charges[id], status: String(sub.status || state.charges[id].status), updatedAt: now };
        saveCharges(state);
      }
    });
    return { ok: true, subscription: true, status: sub.status, ...ref };
  }

  // Cobrança mensal de uma assinatura de cartão
  if (type === 'subscription_authorized_payment') {
    if (!verifySignature({ headers, dataId })) return { ok: false, reason: 'signature' };
    const res = await fetchImpl(`${MP_API}/authorized_payments/${dataId}`, { headers: authHeaders() });
    const charge = await readJson(res);
    if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
    const chargeStatus = String(charge.payment?.status || charge.status || '');
    const refunded = REFUND_STATUSES.has(chargeStatus);
    if (charge.status !== 'approved' && !refunded) return { ok: true, pending: true, status: charge.status };
    const subRes = await fetchImpl(`${MP_API}/preapproval/${charge.preapproval_id}`, { headers: authHeaders() });
    const sub = await readJson(subRes);
    if (!subRes.ok) return { ok: false, reason: 'provider', status: subRes.status };
    const ref = parseReference(sub.external_reference);
    if (!ref) return { ok: false, reason: 'reference' };
    if (refunded) return applyRefund(`mp:${dataId}`, ref, { now });
    // Mesmo cuidado do Pix: moeda e valor conferidos antes de liberar.
    if (charge.currency_id && charge.currency_id !== 'BRL') return { ok: false, reason: 'currency' };
    const expectedCard =
      ref.kind === 'addon' ? planAddons.priceOf(ref.addonId, ref.cycle) / 100 : priceOf(ref.plan, ref.cycle);
    if (Number(charge.transaction_amount) + 0.01 < expectedCard) return { ok: false, reason: 'amount' };
    const granted = grantOnce(`mp:${dataId}`, null, () => grantRef(ref, 'mercadopago-card', `mp:${dataId}`));
    return grantResult(ref, granted);
  }

  return { ok: true, ignored: true, type };
}

/** Grava o status final de um Pix que não foi pago (expirado/cancelado/recusado). */
function markChargeStatus(chargeId, status) {
  if (!['cancelled', 'rejected', 'expired'].includes(String(status))) return;
  withFileLock(chargesFile(), () => {
    const state = loadCharges();
    const charge = state.charges[chargeId];
    if (!charge || charge.status !== 'pending') return;
    const { qrCode, ...rest } = charge;
    state.charges[chargeId] = { ...rest, status: String(status) };
    saveCharges(state);
  });
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
    } else if (REFUND_STATUSES.has(payment.status)) {
      await applyRefundedPayment(payment);
    } else {
      markChargeStatus(String(charge.id), payment.status);
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
    pricesAnnual: { basic: plans.PRICES_ANNUAL.basic / 100, premium: plans.PRICES_ANNUAL.premium / 100 },
    // Quanto o anual economiza em relação a 12 meses (para a tela mostrar a conta).
    annualSavingPercent: {
      basic: Math.round((1 - plans.PRICES_ANNUAL.basic / (plans.PRICES.basic * 12)) * 100),
      premium: Math.round((1 - plans.PRICES_ANNUAL.premium / (plans.PRICES.premium * 12)) * 100),
    },
    providers: providers(),
    pending,
    lastCard: own.find((charge) => charge.method === 'card') || null,
    // Só existe o que cancelar quando há cartão do plano ainda renovando.
    canCancelRenewal: Boolean(activeCardSubscription(guildId)),
    support: { email: SUPPORT_EMAIL },
    ai: require('./aiQuota').snapshot(guildId, { now }),
  };
}

module.exports = {
  MP_API,
  PIX_TTL_MS,
  pixExpiration,
  setFetch,
  publicUrl,
  providers,
  paymentsEnabled,
  reference,
  addonReference,
  parseReference,
  resolveTarget,
  applyApprovedPayment,
  applyRefundedPayment,
  refundPayment,
  REFUND_STATUSES,
  priceOf,
  createPixCharge,
  createCardSubscription,
  cancelCardSubscription,
  activeCardSubscription,
  verifySignature,
  handleWebhook,
  reconcilePending,
  guildPlanInfo,
};
