// Monitor de links (plano 5.6). Registro em data/linkSentinel.json (escrita atômica).
// - Verificação diária às 4h (Brasília): HEAD, e se recusado GET; timeout de 8 s; cabeçalho de navegador.
// - Alerta só depois de 2 falhas seguidas.
// - Redirecionamento para outro domínio NUNCA troca sozinho (domínio expirado pode virar golpe):
//   vira proposta para o dono. No mesmo domínio, o link é atualizado.
// - Enquanto estiver fora: link reserva cadastrado ou a cópia mais recente do Web Archive.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const TIMEOUT_MS = 8000;
const FAILURES_TO_ALERT = 2;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

function fileFor() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'linkSentinel.json');
}

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(), 'utf8'));
    return { links: Array.isArray(raw.links) ? raw.links : [], lastRunDay: raw.lastRunDay || '' };
  } catch (_) {
    return { links: [], lastRunDay: '' };
  }
}

function save(state) {
  const file = fileFor();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

const isHttpUrl = (u) => /^https?:\/\/[^\s]+$/i.test(String(u || ''));
const hostOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch (_) {
    return '';
  }
};

function listLinks() {
  return load().links;
}

function upsertLink({ url, fallbackUrl = '', label = '', source = 'panel' }) {
  if (!isHttpUrl(url)) throw Object.assign(new Error('invalid_url'), { code: 'invalid_url' });
  if (fallbackUrl && !isHttpUrl(fallbackUrl)) throw Object.assign(new Error('invalid_fallback'), { code: 'invalid_fallback' });
  const state = load();
  let link = state.links.find((l) => l.url === url);
  if (!link) {
    link = { id: crypto.randomBytes(5).toString('hex'), url, failures: 0, status: 'unknown', lastCheckedAt: 0, mutedUntil: 0, createdAt: Date.now() };
    state.links.push(link);
  }
  Object.assign(link, { fallbackUrl: fallbackUrl || link.fallbackUrl || '', label: String(label || link.label || '').slice(0, 80), source: link.source || source });
  save(state);
  return link;
}

function removeLink(id) {
  const state = load();
  const before = state.links.length;
  state.links = state.links.filter((l) => l.id !== id);
  save(state);
  return state.links.length < before;
}

function updateLink(id, patch) {
  const state = load();
  const link = state.links.find((l) => l.id === id);
  if (!link) return null;
  if (patch.url !== undefined) {
    if (!isHttpUrl(patch.url)) throw Object.assign(new Error('invalid_url'), { code: 'invalid_url' });
    link.url = patch.url;
    link.failures = 0;
    link.proposedUrl = null;
  }
  if (patch.mutedUntil !== undefined) link.mutedUntil = Number(patch.mutedUntil) || 0;
  if (patch.fallbackUrl !== undefined) link.fallbackUrl = isHttpUrl(patch.fallbackUrl) ? patch.fallbackUrl : '';
  save(state);
  return link;
}

// Links dos guias da página /cringelandia e dos botões/embeds do estúdio entram sozinhos no registro.
function syncKnownLinks({ publicDir, studioDocs = [] } = {}) {
  const found = new Map();
  try {
    const html = fs.readFileSync(path.join(publicDir, 'cringelandia.html'), 'utf8');
    for (const m of html.matchAll(/href="(https?:\/\/[^"#]+)"/g)) {
      if (!/pyxie\.com\.br|discord\.(gg|com)|googletagmanager|fonts\.g/.test(m[1])) found.set(m[1], 'cringelandia');
    }
  } catch (_) {}
  for (const doc of studioDocs) {
    for (const b of doc.buttons || []) if (b.action?.type === 'link' && isHttpUrl(b.action.url)) found.set(b.action.url, `studio:${doc.id}`);
    for (const e of doc.embeds || []) if (isHttpUrl(e.url)) found.set(e.url, `studio:${doc.id}`);
  }
  const state = load();
  let added = 0;
  for (const [url, source] of found) {
    if (state.links.some((l) => l.url === url)) continue;
    state.links.push({ id: crypto.randomBytes(5).toString('hex'), url, fallbackUrl: '', label: '', source, failures: 0, status: 'unknown', lastCheckedAt: 0, mutedUntil: 0, createdAt: Date.now() });
    added++;
  }
  if (added) save(state);
  return added;
}

// ---------- Verificação ----------

async function probe(url, fetchImpl = fetch) {
  const attempt = async (method) => {
    const res = await fetchImpl(url, { method, redirect: 'manual', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { status: res.status, location: res.headers?.get?.('location') || null };
  };
  try {
    let r = await attempt('HEAD');
    // Muitos sites recusam HEAD (403/405/501): tenta GET antes de condenar.
    if ([403, 405, 501].includes(r.status) || r.status >= 500) r = await attempt('GET');
    if (r.status >= 300 && r.status < 400 && r.location) {
      const target = new URL(r.location, url).toString();
      return { ok: true, status: r.status, redirect: target, sameDomain: hostOf(target) === hostOf(url) };
    }
    return { ok: r.status < 400, status: r.status, diagnosis: r.status < 400 ? null : `HTTP ${r.status}` };
  } catch (err) {
    const timeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return { ok: false, status: 0, diagnosis: timeout ? 'timeout' : err.cause?.code || err.message };
  }
}

async function waybackSnapshot(url, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const data = await res.json();
    return data?.archived_snapshots?.closest?.available ? data.archived_snapshots.closest.url : null;
  } catch (_) {
    return null;
  }
}

/**
 * Verifica todos os links e devolve os alertas novos para o dono:
 * { link, kind: 'down'|'redirect', diagnosis, replacement }.
 */
async function checkAll({ now = Date.now(), fetchImpl = fetch } = {}) {
  const state = load();
  const alerts = [];
  for (const link of state.links) {
    const r = await probe(link.url, fetchImpl);
    link.lastCheckedAt = now;
    link.lastStatus = r.status;
    if (r.ok && r.redirect && !r.sameDomain) {
      link.status = 'redirect';
      if (link.proposedUrl !== r.redirect && link.mutedUntil <= now) alerts.push({ link: { ...link }, kind: 'redirect', diagnosis: `→ ${r.redirect}`, proposed: r.redirect });
      link.proposedUrl = r.redirect;
      link.failures = 0;
      continue;
    }
    if (r.ok) {
      if (r.redirect && r.sameDomain) link.url = r.redirect;
      link.status = 'ok';
      link.failures = 0;
      link.diagnosis = null;
      continue;
    }
    link.failures = (link.failures || 0) + 1;
    link.diagnosis = r.diagnosis;
    link.status = link.failures >= FAILURES_TO_ALERT ? 'down' : 'suspect';
    if (link.failures === FAILURES_TO_ALERT && link.mutedUntil <= now) {
      const replacement = link.fallbackUrl || (await waybackSnapshot(link.url, fetchImpl));
      link.replacementUrl = replacement || null;
      alerts.push({ link: { ...link }, kind: 'down', diagnosis: r.diagnosis, replacement });
    }
  }
  save(state);
  return alerts;
}

// Link a usar agora: o reserva ou a cópia do arquivo enquanto o original estiver fora.
function resolveLiveUrl(url) {
  const link = load().links.find((l) => l.url === url);
  if (link?.status === 'down') return link.fallbackUrl || link.replacementUrl || url;
  return url;
}

// Dia de Brasília (YYYY-MM-DD) e hora, para rodar uma vez por dia às 4h.
function brtParts(now = Date.now()) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(fmt.formatToParts(new Date(now)).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

function shouldRunDaily(now = Date.now()) {
  const { day, hour } = brtParts(now);
  return hour >= 4 && load().lastRunDay !== day;
}

function markDailyRun(now = Date.now()) {
  const state = load();
  state.lastRunDay = brtParts(now).day;
  save(state);
}

module.exports = {
  FAILURES_TO_ALERT,
  listLinks,
  upsertLink,
  removeLink,
  updateLink,
  syncKnownLinks,
  probe,
  checkAll,
  waybackSnapshot,
  resolveLiveUrl,
  shouldRunDaily,
  markDailyRun,
};
