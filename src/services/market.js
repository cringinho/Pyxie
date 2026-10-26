const path = require('node:path');
const crypto = require('node:crypto');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { withFileLock } = require('../utils/fileLock');
const economy = require('./economy');
const vault = require('./itemVault');
const crafting = require('./crafting');

/**
 * Mercado entre jogadores (/py-market), com garantia (escrow):
 *
 * - Anunciar tira o item (ou os materiais) da mochila na hora: não dá para vender duas vezes
 *   nem usar enquanto está à venda. Cancelar ou vencer (7 dias) devolve tudo.
 * - Comprar reserva o anúncio primeiro (gravado sob trava), depois cobra quem compra, entrega e
 *   paga quem vendeu. Se a cobrança falhar, o anúncio volta à vitrine.
 * - Taxa de 5% sobre cada venda: as moedinhas da taxa saem da economia (AGENTS.md §5).
 * - Anúncio pode ser só para uma pessoa (oferta particular).
 * - Cada venda entra no histórico de preços (média, última venda), usado no bot e no site.
 *
 * data/market.json é gravado só pelo bot; o site lê para a página de preços.
 */

const TAX_RATE = 0.05;
const MAX_LISTINGS_PER_USER = 10;
const LISTING_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_PRICE = 1;
const MAX_PRICE = 1000000;
const MAX_SALES_KEPT = 5000;
const DAY = 24 * 60 * 60 * 1000;

function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'market.json');
}

function load() {
  const stored = readJson(stateFile(), {});
  return {
    listings: stored.listings && typeof stored.listings === 'object' ? stored.listings : {},
    sales: Array.isArray(stored.sales) ? stored.sales : [],
    totals: { listed: 0, sold: 0, cancelled: 0, expired: 0, taxCollected: 0, volume: 0, ...(stored.totals || {}) },
  };
}

function save(state) {
  return writeJsonAtomic(stateFile(), state);
}

function locked(fn) {
  return withFileLock(stateFile(), fn);
}

function newId() {
  return crypto.randomBytes(3).toString('hex');
}

function taxFor(price) {
  return Math.max(1, Math.floor(price * TAX_RATE));
}

/** Chave do histórico: item do catálogo ou material (`mat:wood`). */
function keyOf(listing) {
  return listing.kind === 'material' ? `mat:${listing.material}` : listing.itemId;
}

function validPrice(price) {
  const value = Math.floor(Number(price));
  return Number.isFinite(value) && value >= MIN_PRICE && value <= MAX_PRICE ? value : null;
}

// Recursos vendidos em lote: materiais da oficina e as Fagulhas do Festival (/py-festival)
const SPARKS = 'sparks';

function isResource(key) {
  return key === SPARKS || Boolean(crafting.MATERIALS[key]);
}

function resourceDef(key) {
  if (key === SPARKS) {
    const { CURRENCY } = require('./festival');
    return { emoji: CURRENCY.emoji, pt: CURRENCY.pt, en: CURRENCY.en };
  }
  return crafting.MATERIALS[key] || null;
}

function resourceLabel(key, lang) {
  const def = resourceDef(key);
  return def ? `${def.emoji} ${def[lang === 'en' ? 'en' : 'pt']}` : key;
}

/** Quanto a pessoa tem de cada recurso negociável (materiais + Fagulhas). */
function resourceBalances(userId) {
  return { ...crafting.getMaterials(userId), [SPARKS]: require('./festival').getSparks(userId) };
}

/** Soma ou tira um recurso; falso quando não há o bastante. */
function adjustResource(userId, key, qty) {
  if (key === SPARKS) return require('./festival').addSparks(userId, qty, 'market').ok;
  return crafting.addMaterials(userId, { [key]: qty }).ok;
}

function activeCount(state, userId) {
  return Object.values(state.listings).filter((l) => l.sellerId === String(userId)).length;
}

/** Anuncia um item da mochila (tem que ser negociável e não pode estar à mostra na Casinha). */
function listItem(sellerId, uid, price, { buyerId = null, now = Date.now() } = {}) {
  const value = validPrice(price);
  if (!value) return { ok: false, reason: 'price' };
  const seller = String(sellerId);
  const instance = vault.getInstance(seller, uid);
  if (!instance) return { ok: false, reason: 'not_owned' };
  const { getItem } = require('../modules/home/homeCatalog');
  const entry = getItem(instance.itemId);
  if (!entry || entry.tradable === false) return { ok: false, reason: 'not_tradable' };
  if (require('../modules/home/homeStore').isInUse(seller, uid)) return { ok: false, reason: 'placed' };
  if (buyerId && String(buyerId) === seller) return { ok: false, reason: 'self' };

  return locked(() => {
    const state = load();
    if (activeCount(state, seller) >= MAX_LISTINGS_PER_USER) return { ok: false, reason: 'limit' };
    const taken = vault.takeInstance(seller, uid);
    if (!taken) return { ok: false, reason: 'not_owned' };
    const listing = {
      id: newId(),
      sellerId: seller,
      kind: 'item',
      itemId: taken.itemId,
      instance: taken,
      qty: 1,
      price: value,
      buyerId: buyerId ? String(buyerId) : null,
      createdAt: now,
      expiresAt: now + LISTING_TTL_MS,
    };
    state.listings[listing.id] = listing;
    state.totals.listed += 1;
    if (!save(state)) {
      vault.putInstance(seller, taken);
      return { ok: false, reason: 'save' };
    }
    return { ok: true, listing };
  });
}

/** Anuncia materiais da oficina ou Fagulhas (o lote inteiro sai junto por um preço). */
function listMaterial(sellerId, material, qty, price, { buyerId = null, now = Date.now() } = {}) {
  const value = validPrice(price);
  const amount = Math.floor(Number(qty));
  if (!value) return { ok: false, reason: 'price' };
  if (!isResource(material) || !Number.isFinite(amount) || amount < 1) return { ok: false, reason: 'qty' };
  const seller = String(sellerId);
  if (buyerId && String(buyerId) === seller) return { ok: false, reason: 'self' };
  return locked(() => {
    const state = load();
    if (activeCount(state, seller) >= MAX_LISTINGS_PER_USER) return { ok: false, reason: 'limit' };
    if (!adjustResource(seller, material, -amount)) return { ok: false, reason: 'not_enough' };
    const listing = {
      id: newId(),
      sellerId: seller,
      kind: 'material',
      material,
      qty: amount,
      price: value,
      buyerId: buyerId ? String(buyerId) : null,
      createdAt: now,
      expiresAt: now + LISTING_TTL_MS,
    };
    state.listings[listing.id] = listing;
    state.totals.listed += 1;
    if (!save(state)) {
      adjustResource(seller, material, amount);
      return { ok: false, reason: 'save' };
    }
    return { ok: true, listing };
  });
}

/** Devolve o que estava na garantia para quem anunciou. */
function returnEscrow(listing) {
  if (listing.kind === 'material') return adjustResource(listing.sellerId, listing.material, listing.qty);
  return vault.putInstance(listing.sellerId, listing.instance).ok;
}

function cancel(sellerId, listingId) {
  return locked(() => {
    const state = load();
    const listing = state.listings[listingId];
    if (!listing) return { ok: false, reason: 'missing' };
    if (listing.sellerId !== String(sellerId)) return { ok: false, reason: 'not_yours' };
    delete state.listings[listingId];
    state.totals.cancelled += 1;
    if (!save(state)) return { ok: false, reason: 'save' };
    returnEscrow(listing);
    return { ok: true, listing };
  });
}

/** Anúncios vencidos voltam para quem anunciou (rodado no módulo e antes de mostrar a vitrine). */
function expireListings(now = Date.now()) {
  return locked(() => {
    const state = load();
    const expired = Object.values(state.listings).filter((l) => l.expiresAt <= now);
    if (!expired.length) return 0;
    for (const listing of expired) delete state.listings[listing.id];
    state.totals.expired += expired.length;
    if (!save(state)) return 0;
    for (const listing of expired) returnEscrow(listing);
    return expired.length;
  });
}

/**
 * Compra. O anúncio sai da vitrine antes de cobrar (dois cliques ao mesmo tempo não compram duas
 * vezes); se a cobrança ou a entrega falharem, tudo volta ao lugar.
 */
function buy(buyerId, listingId, now = Date.now()) {
  const buyer = String(buyerId);
  return locked(() => {
    const state = load();
    const listing = state.listings[listingId];
    if (!listing || listing.expiresAt <= now) return { ok: false, reason: 'missing' };
    if (listing.sellerId === buyer) return { ok: false, reason: 'self' };
    if (listing.buyerId && listing.buyerId !== buyer) return { ok: false, reason: 'private' };
    if (listing.kind === 'item' && !vault.hasRoom(buyer)) return { ok: false, reason: 'full' };

    delete state.listings[listingId];
    if (!save(state)) return { ok: false, reason: 'save' };

    const restore = () => {
      state.listings[listingId] = listing;
      save(state);
    };
    const payment = economy.spendCoins(buyer, listing.price);
    if (!payment.spent) {
      restore();
      return { ok: false, reason: 'coins', price: listing.price, balance: payment.balance };
    }
    const delivered =
      listing.kind === 'material'
        ? adjustResource(buyer, listing.material, listing.qty)
        : vault.putInstance(buyer, listing.instance, { from: listing.sellerId, to: buyer, price: listing.price, at: now }).ok;
    if (!delivered) {
      economy.addCoins(buyer, listing.price);
      restore();
      return { ok: false, reason: 'save' };
    }

    const tax = taxFor(listing.price);
    economy.addCoins(listing.sellerId, listing.price - tax);
    state.sales.push({
      key: keyOf(listing),
      kind: listing.kind,
      qty: listing.qty,
      price: listing.price,
      unitPrice: Math.round((listing.price / listing.qty) * 100) / 100,
      at: now,
    });
    state.sales = state.sales.slice(-MAX_SALES_KEPT);
    state.totals.sold += 1;
    state.totals.taxCollected += tax;
    state.totals.volume += listing.price;
    save(state);
    const battlePass = require('./battlePass');
    battlePass.safeAddXp(buyer, 'market', { now });
    battlePass.safeAddXp(listing.sellerId, 'market', { now });
    return { ok: true, listing, tax, sellerGets: listing.price - tax, balance: payment.balance };
  });
}

/** Vitrine: mais novos primeiro; ofertas particulares só para quem foi convidado. */
function browse({ viewerId = null, kind = null, now = Date.now() } = {}) {
  return Object.values(load().listings)
    .filter((l) => l.expiresAt > now && (!kind || l.kind === kind) && (!l.buyerId || l.buyerId === String(viewerId) || l.sellerId === String(viewerId)))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function getListing(listingId) {
  return load().listings[listingId] || null;
}

function myListings(userId) {
  return Object.values(load().listings)
    .filter((l) => l.sellerId === String(userId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Resumo de preço por unidade: última venda, média e volume nos últimos `days` dias. */
function priceSummary(key, { days = 7, now = Date.now() } = {}) {
  const all = load().sales.filter((s) => s.key === key);
  const recent = all.filter((s) => s.at >= now - days * DAY);
  const last = all[all.length - 1] || null;
  const avg = recent.length ? Math.round(recent.reduce((acc, s) => acc + s.unitPrice, 0) / recent.length) : null;
  return { key, last: last ? last.unitPrice : null, avg, count: recent.length, totalSales: all.length };
}

/** Histórico por dia (para o gráfico do site): média por unidade em cada dia com venda. */
function priceHistory(key, { days = 30, now = Date.now() } = {}) {
  const buckets = new Map();
  for (const sale of load().sales) {
    if (sale.key !== key || sale.at < now - days * DAY) continue;
    const day = new Date(sale.at - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const bucket = buckets.get(day) || { day, total: 0, count: 0 };
    bucket.total += sale.unitPrice;
    bucket.count += 1;
    buckets.set(day, bucket);
  }
  return [...buckets.values()]
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((b) => ({ day: b.day, avg: Math.round(b.total / b.count), sales: b.count }));
}

/** Itens e materiais mais negociados (para o site e o /admin). */
function topTraded({ days = 30, limit = 20, now = Date.now() } = {}) {
  const counts = new Map();
  for (const sale of load().sales) {
    if (sale.at < now - days * DAY) continue;
    counts.set(sale.key, (counts.get(sale.key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, sales]) => ({ ...priceSummary(key, { days, now }), sales, history: priceHistory(key, { days, now }) }));
}

function getMarketStats(now = Date.now()) {
  const state = load();
  return {
    ...state.totals,
    activeListings: Object.values(state.listings).filter((l) => l.expiresAt > now).length,
    sales7d: state.sales.filter((s) => s.at >= now - 7 * DAY).length,
  };
}

module.exports = {
  TAX_RATE,
  MAX_LISTINGS_PER_USER,
  LISTING_TTL_MS,
  MAX_PRICE,
  SPARKS,
  stateFile,
  resourceLabel,
  resourceBalances,
  taxFor,
  keyOf,
  listItem,
  listMaterial,
  cancel,
  expireListings,
  buy,
  browse,
  getListing,
  myListings,
  priceSummary,
  priceHistory,
  topTraded,
  getMarketStats,
};
