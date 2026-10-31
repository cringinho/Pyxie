// Doações voluntárias (sem contrapartida): Pix de valor livre, registro para transparência
// e ranking de quem mais apoia. Reaproveita o mesmo webhook do Mercado Pago.
// Referência: donation|<userId>|<centavos>|<0|1 anônimo>
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { withFileLock } = require('../utils/fileLock');
const { SUPPORT_EMAIL } = require('../config/support');

const MP_API = 'https://api.mercadopago.com';
const PIX_TTL_MS = 30 * 60 * 1000;
const MIN_CENTS = 200; // R$ 2,00
const MAX_CENTS = 50000; // R$ 500,00
const PRESETS = [500, 1000, 2500, 5000]; // R$ 5, 10, 25, 50
const LEDGER_LIMIT = 2000;

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
    return { donations: Array.isArray(data.donations) ? data.donations : [], processed: Array.isArray(data.processed) ? data.processed : [] };
  } catch (_) {
    return { donations: [], processed: [] };
  }
}

function saveLedger(state) {
  const file = ledgerFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const donations = state.donations.slice(-LEDGER_LIMIT);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 1, donations, processed: state.processed.slice(-LEDGER_LIMIT) }, null, 2));
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
      date_of_expiration: new Date(now + PIX_TTL_MS).toISOString().replace('Z', '-03:00'),
      payer: { email: SUPPORT_EMAIL },
    }),
  });
  const data = await readJson(res);
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status, detail: data.message || data.error };
  const qr = data.point_of_interaction?.transaction_data || {};
  if (!qr.qr_code) return { ok: false, reason: 'qr_missing', status: res.status };
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
    const donation = {
      id,
      userId: ref.userId,
      name: String(name || '').slice(0, 40),
      cents: ref.cents,
      anonymous: ref.anonymous,
      at: Date.now(),
    };
    state.donations.push(donation);
    saveLedger(state);
    return { ok: true, donation };
  });
}

const dayKey = (now = Date.now()) => new Date(now - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Ranking de doadores (mês atual ou geral). Nomes anônimos não aparecem. */
function ranking({ period = 'month', limit = 10, now = Date.now() } = {}) {
  const cutoff = period === 'all' ? 0 : Date.parse(`${dayKey(now).slice(0, 7)}-01T00:00:00Z`);
  const totals = new Map();
  for (const donation of loadLedger().donations) {
    if (donation.at < cutoff) continue;
    const key = donation.anonymous ? 'anon' : donation.userId;
    const entry = totals.get(key) || { userId: key, name: '', cents: 0, count: 0, anonymous: Boolean(donation.anonymous) };
    entry.cents += donation.cents;
    entry.count += 1;
    if (!donation.anonymous && donation.name) entry.name = donation.name;
    totals.set(key, entry);
  }
  const list = [...totals.values()]
    .map((entry) => ({ ...entry, amount: entry.cents / 100, label: entry.anonymous ? null : entry.name || entry.userId }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, Math.max(1, Math.min(25, Number(limit) || 10)));
  return list;
}

function summary(now = Date.now()) {
  const donations = loadLedger().donations;
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
  const res = await fetchImpl(`${MP_API}/v1/payments/${dataId}`, { headers: { Authorization: `Bearer ${token()}` } });
  const payment = await readJson(res);
  if (!res.ok) return { ok: false, reason: 'provider', status: res.status };
  if (payment.status !== 'approved') return { ok: true, pending: true, status: payment.status };
  const ref = parseReference(payment.external_reference);
  if (!ref) return { ok: true, ignored: true };
  return applyDonation(payment);
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
  ranking,
  summary,
  handleWebhook,
};
