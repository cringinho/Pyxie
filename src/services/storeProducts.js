/**
 * Lojinha do servidor: produtos, estoque e entrega.
 *
 * Foco em venda de Robux e afins, aprendendo com quem vive disso:
 *  - **estoque finito** (códigos/vouchers) não pode vender o que não tem;
 *  - **entrega** varia: código da fila, link de gamepass ou manual (dono entrega);
 *  - **order bump** (pacote maior no fechamento) é o que sobe o ticket médio;
 *  - **margem** precisa considerar a taxa de 30% do Roblox e o custo do estoque;
 *  - **alerta de estoque baixo** evita perder venda em dia cheio.
 *
 * Persistência: `data/guilds/<id>/storeProducts.json` e `storeOrders.json`,
 * escrita atômica + lock (AGENTS §6). Só o painel e o bot gravam.
 */
const fs = require('node:fs');
const path = require('node:path');
const { withFileLock } = require('../utils/fileLock');
const { dataPath } = require('../utils/dataDir');

const ID_RE = /^[a-z0-9][a-z0-9-]{0,38}$/;
const ROLE_RE = /^\d{17,20}$/;
const DELIVERY_TYPES = ['code', 'message', 'manual'];
const MAX_PRODUCTS = 25;
const MAX_STOCK = 500;
const MIN_PRICE_CENTS = 100;
const MAX_PRICE_CENTS = 5_000_000;
const MAX_ORDERS = 1000;

/** Tabela de referência do mercado BR (guia de revenda de Robux). */
const BENCHMARK = [
  { robux: 400, minCents: 1200, maxCents: 1500 },
  { robux: 800, minCents: 2200, maxCents: 2700 },
  { robux: 1700, minCents: 4500, maxCents: 5500 },
  { robux: 4500, minCents: 11000, maxCents: 13500 },
];

const clampInt = (v, min, max, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : d;
};
const text = (v, max) => String(v ?? '').trim().slice(0, max);

const productsFile = (guildId) => dataPath('guilds', String(guildId), 'storeProducts.json');
const ordersFile = (guildId) => dataPath('guilds', String(guildId), 'storeOrders.json');

function readJson(file, fallback) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (_) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

// ------------------------------------------------------------------ matemática do Robux

/** Robux que chegam na conta quando o cliente paga `gross` numa gamepass (Roblox fica com 30%). */
function robuxNet(gross) {
  const n = Math.max(0, Math.floor(Number(gross) || 0));
  return Math.floor((n * 7) / 10); // inteiro: evita 1430*0.7 dar 1000.9999
}

/** Valor da gamepass para o cliente receber exatamente `net` Robux. */
function robuxGrossFor(net) {
  const n = Math.max(0, Math.floor(Number(net) || 0));
  return Math.ceil((n * 10) / 7); // inteiro: evita 700/0.7 dar 1000.0000001 -> 1001
}

/** Preço sugerido em centavos, interpolando a tabela de mercado pelo preço de 1k. */
function suggestPriceCents(robux, { per1kCents = 3700 } = {}) {
  const n = Math.max(0, Math.floor(Number(robux) || 0));
  if (!n) return 0;
  const exact = BENCHMARK.find((b) => b.robux === n);
  if (exact) return Math.round((exact.minCents + exact.maxCents) / 2);
  return Math.round((n / 1000) * Math.max(0, per1kCents));
}

/** Lucro e margem de um produto. `feeCents` cobre taxas de gateway/plataforma. */
function margin({ priceCents = 0, costCents = 0, feeCents = 0 } = {}) {
  const price = Math.max(0, Math.round(Number(priceCents) || 0));
  const cost = Math.max(0, Math.round(Number(costCents) || 0));
  const fee = Math.max(0, Math.round(Number(feeCents) || 0));
  const profit = price - cost - fee;
  return {
    priceCents: price,
    costCents: cost,
    feeCents: fee,
    profitCents: profit,
    marginPercent: price > 0 ? Math.round((profit / price) * 1000) / 10 : 0,
    healthy: price > 0 && profit > 0 && profit / price >= 0.2,
  };
}

// ------------------------------------------------------------------ normalização

function normalizeProduct(raw = {}, now = Date.now()) {
  const delivery = DELIVERY_TYPES.includes(raw.delivery) ? raw.delivery : 'manual';
  const stock = Array.isArray(raw.stock)
    ? [...new Set(raw.stock.map((s) => text(s, 200)).filter(Boolean))].slice(0, MAX_STOCK)
    : [];
  return {
    id: ID_RE.test(String(raw.id || '').toLowerCase()) ? String(raw.id).toLowerCase() : '',
    name: text(raw.name, 80),
    description: text(raw.description, 300),
    priceCents: clampInt(raw.priceCents, MIN_PRICE_CENTS, MAX_PRICE_CENTS, 0),
    costCents: clampInt(raw.costCents, 0, MAX_PRICE_CENTS, 0),
    robux: clampInt(raw.robux, 0, 1_000_000, 0),
    delivery,
    deliveryUrl: /^https?:\/\/\S{4,280}$/.test(String(raw.deliveryUrl || '')) ? String(raw.deliveryUrl) : '',
    deliveryNote: text(raw.deliveryNote, 300),
    stock,
    minStock: clampInt(raw.minStock, 0, 100, 5),
    roleId: ROLE_RE.test(String(raw.roleId || '')) ? String(raw.roleId) : '',
    orderBumpId: ID_RE.test(String(raw.orderBumpId || '').toLowerCase()) ? String(raw.orderBumpId).toLowerCase() : '',
    warrantyDays: clampInt(raw.warrantyDays, 0, 90, 0),
    active: raw.active !== false,
    createdAt: Math.max(0, Number(raw.createdAt) || now),
    updatedAt: Math.max(0, Number(raw.updatedAt) || now),
  };
}

function slugify(name) {
  const slug = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 38);
  return ID_RE.test(slug) ? slug : `item-${Date.now().toString(36).slice(-6)}`;
}

/** Visão segura: nunca expõe os códigos do estoque. */
function publicView(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    robux: product.robux,
    delivery: product.delivery,
    deliveryNote: product.deliveryNote,
    inStock: product.delivery === 'code' ? product.stock.length : null,
    available: product.active && (product.delivery !== 'code' || product.stock.length > 0),
    warrantyDays: product.warrantyDays,
  };
}

// ------------------------------------------------------------------ produtos

function loadProducts(guildId) {
  const data = readJson(productsFile(guildId), {});
  const out = {};
  for (const [id, raw] of Object.entries(data.products || {})) {
    const p = normalizeProduct({ ...raw, id });
    if (p.name) out[p.id] = p;
  }
  return out;
}

function saveProducts(guildId, products) {
  writeJson(productsFile(guildId), { version: 1, products });
  return products;
}

function listProducts(guildId) {
  return Object.values(loadProducts(guildId)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function getProduct(guildId, id) {
  const key = String(id || '').toLowerCase();
  return loadProducts(guildId)[key] || null;
}

/** Cria ou atualiza um produto. `codes` no estoque são salvos como lista. */
function saveProduct(guildId, input = {}, now = Date.now()) {
  const file = productsFile(guildId);
  return withFileLock(file, () => {
    const products = loadProducts(guildId);
    const existing = input.id ? products[String(input.id).toLowerCase()] : null;
    if (!existing && Object.keys(products).length >= MAX_PRODUCTS) {
      return { ok: false, reason: 'too_many_products', limit: MAX_PRODUCTS };
    }
    const id = existing ? existing.id : slugify(input.name);
    if (!existing && products[id]) return { ok: false, reason: 'duplicate_id' };

    // Preço e custo fora da faixa são recusados com motivo, nunca "corrigidos" calados para
    // R$ 1,00 ou para o teto (auditoria Q121). Produto novo precisa de preço.
    const hasPrice = input.priceCents !== undefined && input.priceCents !== null && input.priceCents !== '';
    if (!existing || hasPrice) {
      const price = Number(input.priceCents);
      if (!hasPrice || !Number.isFinite(price) || price <= 0) return { ok: false, reason: 'price_required' };
      if (!Number.isInteger(price) || price < MIN_PRICE_CENTS || price > MAX_PRICE_CENTS) {
        return { ok: false, reason: 'price_out_of_range', min: MIN_PRICE_CENTS, max: MAX_PRICE_CENTS };
      }
    }
    if (input.costCents !== undefined && input.costCents !== null && input.costCents !== '') {
      const cost = Number(input.costCents);
      if (!Number.isInteger(cost) || cost < 0 || cost > MAX_PRICE_CENTS) return { ok: false, reason: 'cost_out_of_range', max: MAX_PRICE_CENTS };
    }
    if (input.deliveryUrl && !/^https?:\/\/\S{4,280}$/.test(String(input.deliveryUrl))) return { ok: false, reason: 'delivery_url_invalid' };

    const merged = normalizeProduct(
      {
        ...(existing || {}),
        ...input,
        id,
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now,
      },
      now
    );

    if (!merged.name) return { ok: false, reason: 'name_required' };
    if (!merged.priceCents) return { ok: false, reason: 'price_required' };
    if (merged.delivery === 'message' && !merged.deliveryUrl) return { ok: false, reason: 'delivery_url_required' };
    if (merged.orderBumpId && merged.orderBumpId === id) return { ok: false, reason: 'bump_self' };

    products[id] = merged;
    saveProducts(guildId, products);
    return { ok: true, product: merged };
  });
}

function removeProduct(guildId, id) {
  const file = productsFile(guildId);
  return withFileLock(file, () => {
    const products = loadProducts(guildId);
    const key = String(id || '').toLowerCase();
    if (!products[key]) return { ok: false, reason: 'not_found' };
    delete products[key];
    // Quem apontava para este produto como order bump perde a referência.
    for (const p of Object.values(products)) if (p.orderBumpId === key) p.orderBumpId = '';
    saveProducts(guildId, products);
    return { ok: true };
  });
}

// ------------------------------------------------------------------ estoque

/** Repõe o estoque. Códigos repetidos são ignorados (não vende o mesmo código duas vezes). */
function addStock(guildId, id, codes = []) {
  const file = productsFile(guildId);
  return withFileLock(file, () => {
    const products = loadProducts(guildId);
    const key = String(id || '').toLowerCase();
    const product = products[key];
    if (!product) return { ok: false, reason: 'not_found' };

    const incoming = (Array.isArray(codes) ? codes : String(codes || '').split('\n'))
      .map((c) => text(c, 200))
      .filter(Boolean);
    const before = product.stock.length;
    const all = [...new Set([...product.stock, ...incoming])];
    const merged = all.slice(0, MAX_STOCK);
    // A tela mostra quantos eram repetidos e quantos ficaram de fora pelo teto (Q123).
    const cut = all.length - merged.length;
    const duplicates = incoming.length - (all.length - before);
    product.stock = merged;
    product.updatedAt = Date.now();
    products[key] = product;
    saveProducts(guildId, products);
    return {
      ok: true,
      added: merged.length - before,
      skipped: incoming.length - (merged.length - before),
      duplicates,
      cut,
      max: MAX_STOCK,
      stockCount: merged.length,
      lowStock: merged.length <= product.minStock,
    };
  });
}

/** Retira um código do estoque (fila: o mais antigo sai primeiro). */
function takeStock(guildId, id) {
  const file = productsFile(guildId);
  return withFileLock(file, () => {
    const products = loadProducts(guildId);
    const key = String(id || '').toLowerCase();
    const product = products[key];
    if (!product) return { ok: false, reason: 'not_found' };
    if (!product.stock.length) return { ok: false, reason: 'out_of_stock' };
    const code = product.stock.shift();
    product.updatedAt = Date.now();
    products[key] = product;
    saveProducts(guildId, products);
    return { ok: true, code, stockCount: product.stock.length, lowStock: product.stock.length <= product.minStock };
  });
}

function stockLevel(guildId, id) {
  const product = getProduct(guildId, id);
  if (!product) return null;
  return {
    id: product.id,
    stockCount: product.stock.length,
    minStock: product.minStock,
    lowStock: product.delivery === 'code' && product.stock.length <= product.minStock,
    outOfStock: product.delivery === 'code' && product.stock.length === 0,
  };
}

/** Produtos que precisam de reposição (para o alerta automático). */
function lowStock(guildId) {
  return listProducts(guildId)
    .filter((p) => p.active && p.delivery === 'code' && p.stock.length <= p.minStock)
    .map((p) => ({ id: p.id, name: p.name, stockCount: p.stock.length, minStock: p.minStock }));
}


// ------------------------------------------------------------------ pedidos e entrega

function loadOrders(guildId) {
  const data = readJson(ordersFile(guildId), {});
  return Array.isArray(data.orders) ? data.orders.filter((o) => o && o.id) : [];
}

function saveOrders(guildId, orders) {
  writeJson(ordersFile(guildId), { version: 1, orders: orders.slice(-MAX_ORDERS) });
  return orders;
}

function newOrderId(now = Date.now()) {
  return `ord-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Registra a venda e separa a entrega.
 * `code` já sai com o código; `message` sai com o link; `manual` fica pendente para o dono.
 */
function deliver(guildId, productId, { buyerId = '', bump = false, now = Date.now() } = {}) {
  const product = getProduct(guildId, productId);
  if (!product) return { ok: false, reason: 'not_found' };
  if (!product.active) return { ok: false, reason: 'inactive' };
  if (!/^\d{17,20}$/.test(String(buyerId || ''))) return { ok: false, reason: 'invalid_buyer' };

  let payload = '';
  let status = 'pending';
  let stockCount = null;

  if (product.delivery === 'code') {
    const taken = takeStock(guildId, product.id);
    if (!taken.ok) return { ok: false, reason: taken.reason };
    payload = taken.code;
    stockCount = taken.stockCount;
    status = 'paid';
  } else if (product.delivery === 'message') {
    if (!product.deliveryUrl) return { ok: false, reason: 'delivery_url_required' };
    payload = product.deliveryUrl;
    status = 'paid';
  }

  const order = {
    id: newOrderId(now),
    guildId: String(guildId),
    productId: product.id,
    productName: product.name,
    buyerId: String(buyerId),
    priceCents: product.priceCents,
    robux: product.robux,
    delivery: product.delivery,
    payload,
    bump,
    status,
    createdAt: now,
    deliveredAt: status === 'paid' ? now : 0,
    note: '',
  };

  const file = ordersFile(guildId);
  withFileLock(file, () => {
    const orders = loadOrders(guildId);
    orders.push(order);
    saveOrders(guildId, orders);
  });

  return {
    ok: true,
    order,
    stockCount,
    lowStock: stockCount !== null && stockCount <= product.minStock,
  };
}

/** Dono confirma na mão (entrega `manual`) ou marca um pedido pendente como pago. */
function confirmOrder(guildId, orderId, { payload = '', now = Date.now() } = {}) {
  const file = ordersFile(guildId);
  return withFileLock(file, () => {
    const orders = loadOrders(guildId);
    const order = orders.find((o) => o.id === String(orderId));
    if (!order) return { ok: false, reason: 'not_found' };
    if (order.status === 'paid') return { ok: false, reason: 'already_paid' };
    order.status = 'paid';
    order.deliveredAt = now;
    if (payload) order.payload = text(payload, 500);
    saveOrders(guildId, orders);
    return { ok: true, order };
  });
}

/** Pedido que não vai sair: devolve o código para a frente da fila e marca como falho. */
function failOrder(guildId, orderId, reason = 'manual', now = Date.now()) {
  const file = ordersFile(guildId);
  return withFileLock(file, () => {
    const orders = loadOrders(guildId);
    const order = orders.find((o) => o.id === String(orderId));
    if (!order) return { ok: false, reason: 'not_found' };
    if (order.status === 'failed') return { ok: false, reason: 'already_failed' };

    if (order.delivery === 'code' && order.payload) {
      const products = loadProducts(guildId);
      const product = products[order.productId];
      if (product) {
        product.stock = [order.payload, ...product.stock.filter((c) => c !== order.payload)].slice(0, MAX_STOCK);
        product.updatedAt = now;
        products[product.id] = product;
        saveProducts(guildId, products);
      }
    }

    order.status = 'failed';
    order.note = text(reason, 120);
    saveOrders(guildId, orders);
    return { ok: true, order };
  });
}

function listOrders(guildId, { limit = 25, buyerId = '' } = {}) {
  const orders = loadOrders(guildId);
  const filtered = buyerId ? orders.filter((o) => o.buyerId === String(buyerId)) : orders;
  return filtered.slice(-Math.min(200, Math.max(1, limit))).reverse();
}

/** Números do painel: receita, pedidos, ticket médio e campeão de vendas. */
function salesStats(guildId, { days = 30, now = Date.now() } = {}) {
  const since = now - days * 24 * 60 * 60 * 1000;
  const all = loadOrders(guildId);
  const paid = all.filter((o) => o.status === 'paid' && o.createdAt >= since);
  const revenue = paid.reduce((sum, o) => sum + (Number(o.priceCents) || 0), 0);
  const byProduct = {};
  for (const o of paid) {
    byProduct[o.productId] = byProduct[o.productId] || { id: o.productId, name: o.productName, count: 0, revenueCents: 0 };
    byProduct[o.productId].count += 1;
    byProduct[o.productId].revenueCents += Number(o.priceCents) || 0;
  }
  const top = Object.values(byProduct).sort((a, b) => b.revenueCents - a.revenueCents)[0] || null;
  return {
    days,
    orders: paid.length,
    revenueCents: revenue,
    averageTicketCents: paid.length ? Math.round(revenue / paid.length) : 0,
    robuxDelivered: paid.reduce((sum, o) => sum + (Number(o.robux) || 0), 0),
    top,
    pending: all.filter((o) => o.status === 'pending').length,
    failed: all.filter((o) => o.status === 'failed').length,
  };
}


// ------------------------------------------------------------------ vitrine

/** Pacote maior sugerido no fechamento (order bump), com a economia do cliente. */
function orderBumpFor(guildId, productId) {
  const product = getProduct(guildId, productId);
  if (!product) return null;
  const explicit = product.orderBumpId ? getProduct(guildId, product.orderBumpId) : null;
  const candidate =
    (explicit && explicit.active && explicit.id !== product.id ? explicit : null) ||
    listProducts(guildId)
      .filter((p) => p.active && p.id !== product.id && p.priceCents > product.priceCents)
      .sort((a, b) => a.priceCents - b.priceCents)[0] ||
    null;
  if (!candidate) return null;
  return {
    id: candidate.id,
    name: candidate.name,
    priceCents: candidate.priceCents,
    robux: candidate.robux,
    deltaCents: candidate.priceCents - product.priceCents,
    savingsPercent:
      candidate.priceCents > 0 ? Math.round((1 - product.priceCents / candidate.priceCents) * 1000) / 10 : 0,
    explicit: Boolean(explicit && explicit.active),
  };
}

/** Catálogo seguro para o Discord (sem códigos e sem custo). */
function publicCatalog(guildId) {
  return listProducts(guildId)
    .filter((p) => p.active)
    .map(publicView);
}

/** Resumo para o alerta automático de estoque. */
function stockReport(guildId) {
  const low = lowStock(guildId);
  const coded = listProducts(guildId).filter((p) => p.delivery === 'code');
  return {
    products: coded.length,
    codes: coded.reduce((sum, p) => sum + p.stock.length, 0),
    low,
    needsAttention: low.length > 0,
  };
}

module.exports = {
  DELIVERY_TYPES,
  MAX_PRODUCTS,
  MAX_STOCK,
  BENCHMARK,
  robuxNet,
  robuxGrossFor,
  suggestPriceCents,
  margin,
  normalizeProduct,
  listProducts,
  getProduct,
  saveProduct,
  removeProduct,
  addStock,
  takeStock,
  stockLevel,
  lowStock,
  deliver,
  confirmOrder,
  failOrder,
  listOrders,
  salesStats,
  orderBumpFor,
  publicCatalog,
  stockReport,
};
