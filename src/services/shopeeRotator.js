// Link único e rotativo para a Shopee: um endereço (`/go`) que a cada clique leva a um produto
// diferente do catálogo ativo, conta o clique no servidor e nunca depende de UTM no link curto.
// Escolha: peso = comissão em reais x prova de venda, sem repetir os últimos produtos (phraseDeck).
// Cliques em data/shopeeClicks.json (escrita atômica, tamanho limitado): por produto, origem e dia.
const fs = require('node:fs');
const path = require('node:path');
const shopeeManager = require('./shopeeManager');

const FALLBACK_LINK = 'https://s.shopee.com.br/BU6Bod6Sw';
const SOURCE_RE = /^[a-z0-9_-]{1,24}$/;
const DAY_KEEP = 90;
const PRODUCT_CAP = 300;
const NEW_ITEM_WEIGHT = 1; // produto sem venda ainda entra na rotação com chance pequena
const SAFE_HOST = /^(?:[a-z0-9-]+\.)*shopee\.com\.br$/i;

const clickFile = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'shopeeClicks.json');

const money = (value) => parseFloat(String(value ?? '').replace(/[^0-9,.]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')) || 0;

function salesOf(value) {
  const text = String(value ?? '').toLowerCase().replace(/\s/g, '');
  const n = parseFloat(text.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
  if (/mil/.test(text)) return n * 1000;
  return n;
}

/** Só segue para a Shopee: link vindo do catálogo nunca vira redirecionamento para outro site. */
function safeLink(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === 'https:' && SAFE_HOST.test(u.hostname) ? u.toString() : null;
  } catch (_) {
    return null;
  }
}

/** Quanto vale mostrar este produto: comissão em reais x (1 + log da prova de venda). */
function weightOf(item) {
  const commission = money(item.comissao);
  const proof = 1 + Math.log10(1 + salesOf(item.vendas));
  return Math.max(NEW_ITEM_WEIGHT, commission * proof);
}

function usable(items) {
  return items.filter((item) => safeLink(item.link || item.productLink));
}

const RECENT = 6;
const recentIds = [];

/** Sorteio ponderado pelo ganho esperado, sem repetir os últimos produtos entregues. */
function pickItem({ items = shopeeManager.getActiveItems({ shuffle: false }), rng = Math.random } = {}) {
  const list = usable(items);
  if (!list.length) return null;
  const memory = Math.min(RECENT, list.length - 1);
  let candidates = list.filter((i) => !recentIds.slice(-memory || recentIds.length).includes(String(i.id)));
  if (!memory || !candidates.length) candidates = list;
  const total = candidates.reduce((sum, i) => sum + weightOf(i), 0);
  let roll = rng() * total;
  let chosen = candidates[candidates.length - 1];
  for (const item of candidates) {
    roll -= weightOf(item);
    if (roll <= 0) {
      chosen = item;
      break;
    }
  }
  recentIds.push(String(chosen.id));
  while (recentIds.length > RECENT) recentIds.shift();
  return chosen;
}

function _resetRecent() {
  recentIds.length = 0;
}

function targetFor(item) {
  return safeLink(item?.link || item?.productLink) || FALLBACK_LINK;
}

// ---------- Cliques ----------
function readClicks() {
  try {
    const raw = JSON.parse(fs.readFileSync(clickFile(), 'utf8'));
    return raw && typeof raw === 'object' ? raw : {};
  } catch (_) {
    return {};
  }
}

function dayKey(now) {
  return new Date(now - 3 * 3600000).toISOString().slice(0, 10);
}

/** Conta o clique. Falha de disco nunca impede o redirecionamento. */
function recordClick({ id = 'fallback', source = 'site', now = Date.now() } = {}) {
  try {
    const src = SOURCE_RE.test(String(source)) ? String(source) : 'site';
    const data = readClicks();
    const day = dayKey(now);
    data.total = (Number(data.total) || 0) + 1;
    data.bySource = data.bySource || {};
    data.bySource[src] = (Number(data.bySource[src]) || 0) + 1;
    data.byDay = data.byDay || {};
    data.byDay[day] = (Number(data.byDay[day]) || 0) + 1;
    for (const key of Object.keys(data.byDay).sort().slice(0, Math.max(0, Object.keys(data.byDay).length - DAY_KEEP))) delete data.byDay[key];
    data.byProduct = data.byProduct || {};
    const pid = String(id).slice(0, 40);
    const entry = data.byProduct[pid] || { n: 0, lastAt: 0, sources: {} };
    entry.n += 1;
    entry.lastAt = now;
    entry.sources[src] = (Number(entry.sources[src]) || 0) + 1;
    data.byProduct[pid] = entry;
    const keep = Object.entries(data.byProduct).sort((a, b) => b[1].n - a[1].n || b[1].lastAt - a[1].lastAt).slice(0, PRODUCT_CAP);
    data.byProduct = Object.fromEntries(keep);
    const file = clickFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
    fs.renameSync(`${file}.tmp`, file);
    return true;
  } catch (_) {
    return false;
  }
}

/** Resolve o destino (produto pedido ou rotativo) e conta o clique. */
function resolve({ id = null, source = 'site', now = Date.now(), rng = Math.random } = {}) {
  let item = null;
  if (id) {
    const found = shopeeManager.getItemById(id);
    if (found && found.active !== false && found.status !== 'out_of_stock' && found.status !== 'inactive') item = found;
  }
  if (!item) item = pickItem({ rng });
  const url = targetFor(item);
  recordClick({ id: item?.id || 'fallback', source, now });
  return { url, item };
}

function insights(limit = 10) {
  const data = readClicks();
  const items = shopeeManager.getAllItems();
  const names = new Map(items.map((i) => [String(i.id), i.titulo]));
  const top = Object.entries(data.byProduct || {})
    .map(([id, e]) => ({ id, title: names.get(id) || id, clicks: e.n, lastAt: e.lastAt, sources: e.sources }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
  return { total: Number(data.total) || 0, bySource: data.bySource || {}, byDay: data.byDay || {}, top };
}

/** Oferta mostrada depois do bônus: 'button' (padrão), 'auto' (redireciona em 6 s, dá para cancelar) ou 'off'. */
function bonusOffer(env = process.env) {
  const mode = ['off', 'button', 'auto'].includes(String(env.SHOPEE_BONUS_REDIRECT || '').toLowerCase())
    ? String(env.SHOPEE_BONUS_REDIRECT).toLowerCase()
    : 'button';
  if (mode === 'off') return null;
  return { mode, url: '/go?src=bonus', delaySeconds: 6 };
}

module.exports = { _resetRecent, FALLBACK_LINK, safeLink, weightOf, salesOf, pickItem, targetFor, recordClick, resolve, insights, bonusOffer };
