// Doações voluntárias (sem contrapartida): Pix de valor livre, registro para transparência
// e ranking de quem mais apoia. O aviso do Mercado Pago chega na rota dos planos
// (/api/plans/webhook/mercadopago), que entrega a doação para cá (auditoria Q243).
// A cobrança fica guardada como pendente (com o nome de quem doou) e a conferência
// periódica do módulo plans (`reconcilePending`) registra o que o aviso perdeu.
// Referência: donation|<userId>|<centavos>|<0|1 anônimo>
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { withFileLock } = require('../utils/fileLock');
const { SUPPORT_EMAIL } = require('../config/support');

const MP_API = 'https://api.mercadopago.com';
// Mesma validade dos planos (fonte única: planPayments.PIX_TTL_MS).
const { PIX_TTL_MS } = require('./planPayments');
const MIN_CENTS = 200; // R$ 2,00
const MAX_CENTS = 50000; // R$ 500,00
const PRESETS = [500, 1000, 2500, 5000]; // R$ 5, 10, 25, 50
const LEDGER_LIMIT = 2000;
const PENDING_MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000;
const REFUND_STATUSES = new Set(['refunded', 'charged_back']);

let fetchImpl = (...args) => fetch(...args);
function setFetch(fn) {
  fetchImpl = fn || ((...args) => fetch(...args));
}

const token = () => String(process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim();
const providers = () => ({ pix: Boolean(token()) });
const publicUrl = () => String(process.env.PASS_PUBLIC_URL || process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '');

const reference = (userId, cents, anonymous = false) => `donation|${userId}|${Math.round(cents)}|${anonymous ? 1 : 0}`;

function parseReference(ref) {
  const [kind, userId, cents, anon] = String(ref || '').split('|');
  if (kind !== 'donation' || !/^\d{17,20}$/.test(userId || '')) return null;
  const value = Number(cents);
  if (!Number.isFinite(value) || value < MIN_CENTS || value > MAX_CENTS) return null;
  return { userId, cents: Math.round(value), anonymous: anon === '1' };
}

const ledgerFile = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'donations.json');

function loadLedger() {
  try {
    const data = JSON.parse(fs.readFileSync(ledgerFile(), 'utf8')) || {};
    return {
      donations: Array.isArray(data.donations) ? data.donations : [],
      processed: Array.isArray(data.processed) ? data.processed : [],
      pending: data.pending && typeof data.pending === 'object' ? data.pending : {},
    };
  } catch (_) {
    return { donations: [], processed: [], pending: {} };
  }
}

function saveLedger(state) {
  const file = ledgerFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const donations = state.donations.slice(-LEDGER_LIMIT);
  // Pendentes: só as mais recentes (as antigas já foram conferidas ou expiraram).
  const pending = Object.fromEntries(
    Object.entries(state.pending || {})
      .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
      .slice(0, 500)
  );
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 2, donations, processed: state.processed.slice(-LEDGER_LIMIT), pending }, null, 2));
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

/** Cria a cobrança Pix de uma doação. Valor livre, mas sempre validado no servidor. */
async function createPixDonation({ userId, cents, anonymous = false, name = '', lang = 'pt', now = Date.now() } = {}) {
  if (!providers().pix) return { ok: false, reason: 'unavailable' };
  if (!/^\d{17,20}$/.test(String(userId || ''))) return { ok: false, reason: 'invalid_user' };
  const value = Math.round(Number(cents));
  if (!Number.isFinite(value) || value < MIN_CENTS || value > MAX_CENTS) return { ok: false, reason: 'invalid_amount' };

  const res = await fetchImpl(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': `donation-${userId}-${now}` },
    body: JSON.stringify({
      transaction_amount: value / 100,
      description: `${lang === 'en' ? 'Pyxie donation' : 'Doação para a Pyxie'} · ${userId}`,
      payment_method_id: 'pix',
      external_reference: reference(userId, value, anonymous),
      notification_url: `${publicUrl()}/api/plans/webhook/mercadopago`,
      date_of_expiration: require('./planPayments').pixExpiration(now),
      payer: { email: SUPPORT_EMAIL },
    }),
  });
  const data = await readJson(res);
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status, detail: data.message || data.error };
  const qr = data.point_of_interaction?.transaction_data || {};
  if (!qr.qr_code) return { ok: false, reason: 'qr_missing', status: res.status };
  // Guarda a cobrança pendente com o nome do momento do Pix: a confirmação usa esse nome
  // no ranking (antes o nome se perdia e aparecia o ID do Discord, Q244).
  withFileLock(ledgerFile(), () => {
    const state = loadLedger();
    state.pending[String(data.id)] = {
      id: String(data.id),
      userId: String(userId),
      name: anonymous ? '' : sanitizeName(name),
      cents: value,
      anonymous: Boolean(anonymous),
      status: 'pending',
      createdAt: now,
      expiresAt: now + PIX_TTL_MS,
    };
    saveLedger(state);
  });
  return {
    ok: true,
    id: String(data.id),
    amount: value / 100,
    cents: value,
    qrCode: qr.qr_code,
    qrCodeBase64: qr.qr_code_base64 || null,
    expiresAt: now + PIX_TTL_MS,
    anonymous,
    name,
  };
}

/** Apelido público: sem controle/HTML, até 40 caracteres. */
function sanitizeName(name) {
  return String(name || '')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .trim()
    .slice(0, 40);
}

/** Registra a doação aprovada (idempotente por paymentId). */
function applyDonation(payment, { name = '' } = {}) {
  const ref = parseReference(payment?.external_reference);
  if (!ref) return { ok: false, reason: 'reference' };
  if (payment.currency_id !== 'BRL') return { ok: false, reason: 'currency' };
  if (Number(payment.transaction_amount) + 0.01 < ref.cents / 100) return { ok: false, reason: 'amount' };

  return withFileLock(ledgerFile(), () => {
    const state = loadLedger();
    const id = `mp:${payment.id}`;
    if (state.processed.includes(id)) return { ok: true, duplicate: true, donation: state.donations.find((d) => d.id === id) || null };
    state.processed.push(id);
    const pending = state.pending[String(payment.id)];
    if (pending) state.pending[String(payment.id)] = { ...pending, status: 'paid' };
    const donation = {
      id,
      userId: ref.userId,
      name: ref.anonymous ? '' : sanitizeName(name || pending?.name),
      cents: ref.cents,
      anonymous: ref.anonymous,
      at: Date.now(),
    };
    state.donations.push(donation);
    saveLedger(state);
    return { ok: true, donation };
  });
}

/** Estorno/contestação (Q245): a doação sai do total e do ranking. Idempotente. */
function refundDonation(payment, { now = Date.now() } = {}) {
  const ref = parseReference(payment?.external_reference);
  if (!ref) return { ok: true, ignored: true };
  return withFileLock(ledgerFile(), () => {
    const state = loadLedger();
    const id = `mp:${payment.id}`;
    const refundKey = `refund:${id}`;
    if (state.processed.includes(refundKey)) return { ok: true, duplicate: true, refund: true };
    state.processed.push(refundKey);
    // Estorno antes da aprovação: reserva o id para uma aprovação atrasada não contar.
    if (!state.processed.includes(id)) state.processed.push(id);
    const donation = state.donations.find((d) => d.id === id);
    if (donation) Object.assign(donation, { refunded: true, refundedAt: now });
    const pending = state.pending[String(payment.id)];
    if (pending) state.pending[String(payment.id)] = { ...pending, status: 'refunded' };
    saveLedger(state);
    return { ok: true, refund: true, revoked: Boolean(donation) };
  });
}

const dayKey = (now = Date.now()) => new Date(now - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Ranking de doadores (mês atual ou geral). Nomes anônimos não aparecem. */
function ranking({ period = 'month', limit = 10, now = Date.now() } = {}) {
  const cutoff = period === 'all' ? 0 : Date.parse(`${dayKey(now).slice(0, 7)}-01T00:00:00Z`);
  const totals = new Map();
  for (const donation of loadLedger().donations) {
    if (donation.at < cutoff || donation.refunded) continue;
    const key = donation.anonymous ? 'anon' : donation.userId;
    const entry = totals.get(key) || { key, name: '', cents: 0, count: 0, anonymous: Boolean(donation.anonymous) };
    entry.cents += donation.cents;
    entry.count += 1;
    if (!donation.anonymous && donation.name) entry.name = donation.name;
    totals.set(key, entry);
  }
  // O ID do Discord nunca sai daqui: o ranking é público (Q244). Sem nome guardado, a
  // tela mostra "Apoiador(a)" em vez do número.
  const list = [...totals.values()]
    .map(({ key, ...entry }) => ({ ...entry, amount: entry.cents / 100, label: entry.anonymous ? null : entry.name || null }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, Math.max(1, Math.min(25, Number(limit) || 10)));
  return list;
}

function summary(now = Date.now()) {
  const donations = loadLedger().donations.filter((d) => !d.refunded);
  const month = ranking({ period: 'month', limit: 25, now });
  return {
    total: donations.reduce((sum, d) => sum + d.cents, 0) / 100,
    count: donations.length,
    monthTotal: month.reduce((sum, d) => sum + d.cents, 0) / 100,
    top: month,
  };
}

/** Evento de pagamento aprovado vindo do webhook (só doações). */
async function handleWebhook({ body = {}, query = {}, headers = {}, now = Date.now() } = {}) {
  if (!providers().pix) return { ok: false, reason: 'unavailable' };
  const type = body.type || body.topic || query.type || query.topic;
  const dataId = query['data.id'] || body.data?.id || query.id || body.id;
  if (type !== 'payment' || !dataId) return { ok: true, ignored: true };
  if (!/^\d{1,20}$/.test(String(dataId))) return { ok: false, reason: 'payment_id' };
  // Mesma assinatura x-signature do Passe/planos: o aviso só vale se veio do Mercado Pago.
  if (!require('./planPayments').verifySignature({ headers, dataId })) return { ok: false, reason: 'signature' };
  const res = await fetchImpl(`${MP_API}/v1/payments/${dataId}`, { headers: { Authorization: `Bearer ${token()}` } });
  const payment = await readJson(res);
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
  if (!parseReference(payment.external_reference)) return { ok: true, ignored: true };
  if (REFUND_STATUSES.has(payment.status)) return refundDonation(payment);
  if (payment.status !== 'approved') {
    markPendingStatus(String(payment.id), payment.status);
    return { ok: true, pending: true, status: payment.status };
  }
  return applyDonation(payment);
}

function markPendingStatus(paymentId, status) {
  if (!['cancelled', 'rejected', 'expired'].includes(String(status))) return;
  withFileLock(ledgerFile(), () => {
    const state = loadLedger();
    const entry = state.pending[paymentId];
    if (!entry || entry.status !== 'pending') return;
    state.pending[paymentId] = { ...entry, status: String(status) };
    saveLedger(state);
  });
}

/**
 * Rede de segurança (Q243): confere direto na API as doações Pix ainda pendentes, como o
 * módulo plans já faz com os planos. Roda no processo do bot, junto do tick dos planos.
 */
async function reconcilePending({ now = Date.now(), maxAgeMs = PENDING_MAX_AGE_MS } = {}) {
  if (!providers().pix) return { checked: 0, registered: 0 };
  const state = loadLedger();
  let checked = 0;
  let registered = 0;
  for (const entry of Object.values(state.pending)) {
    if (entry.status !== 'pending' || now - (entry.createdAt || 0) > maxAgeMs) continue;
    if (!/^\d{1,20}$/.test(String(entry.id))) continue;
    checked += 1;
    const res = await fetchImpl(`${MP_API}/v1/payments/${entry.id}`, { headers: { Authorization: `Bearer ${token()}` } });
    const payment = await readJson(res);
    if (!res.ok) continue;
    if (payment.status === 'approved') {
      const applied = applyDonation(payment);
      if (applied.ok && !applied.duplicate) registered += 1;
    } else if (REFUND_STATUSES.has(payment.status)) {
      refundDonation(payment);
    } else {
      markPendingStatus(String(entry.id), payment.status);
    }
  }
  return { checked, registered };
}

module.exports = {
  MIN_CENTS,
  MAX_CENTS,
  PRESETS,
  setFetch,
  providers,
  publicUrl,
  reference,
  parseReference,
  createPixDonation,
  applyDonation,
  refundDonation,
  reconcilePending,
  ranking,
  summary,
  handleWebhook,
};
