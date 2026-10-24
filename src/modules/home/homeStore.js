const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const economy = require('../../services/economy');
const vault = require('../../services/itemVault');
const { STARTER_ITEMS, DEFAULT_WALLPAPER, DEFAULT_FLOORING, getItem } = require('./homeCatalog');
const engine = require('./homeEngine');

/**
 * Estado das casinhas (data/homes.json) e as ações que mexem em moedinhas, feijões e itens.
 * O cofre (data/itemVault.json) diz o que cada pessoa possui; a casinha diz o que está à mostra.
 * Só o processo do bot grava; tudo roda em sequência dentro do mesmo handler (Node é single thread).
 */

const PREMIUM_DAILY_LIMIT = 1;

function homesFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'homes.json');
}

function load() {
  const stored = readJson(homesFile(), {});
  return {
    homes: stored.homes && typeof stored.homes === 'object' ? stored.homes : {},
    purchases: stored.purchases && typeof stored.purchases === 'object' ? stored.purchases : {},
    totals: stored.totals && typeof stored.totals === 'object' ? stored.totals : { coinsSpent: 0, beansSpent: 0, purchases: 0, likes: 0 },
  };
}

function save(state) {
  return writeJsonAtomic(homesFile(), state);
}

function normalizeHome(home) {
  return {
    wallpaper: home.wallpaper || DEFAULT_WALLPAPER,
    flooring: home.flooring || DEFAULT_FLOORING,
    placements: Array.isArray(home.placements) ? home.placements : [],
    likes: Number(home.likes) || 0,
    likedBy: home.likedBy && typeof home.likedBy === 'object' ? home.likedBy : {},
    visits: Number(home.visits) || 0,
    createdAt: home.createdAt || Date.now(),
    updatedAt: home.updatedAt || Date.now(),
    bestCharm: Number(home.bestCharm) || 0,
  };
}

/** Casinha nova: entrega os itens iniciais e monta um cantinho aconchegante. */
function createHome(state, userId, now) {
  const granted = {};
  for (const itemId of STARTER_ITEMS) {
    const result = vault.grantItem(userId, itemId, { source: 'starter' }, now);
    if (result.ok) granted[itemId] = result.instance.uid;
  }
  // Cantinho inicial: janela com vela, mesinha com cadeira, passadeira e o Astaroth na caminha
  const layout = [
    ['window', 5, 0],
    ['runner_cream', 4, 3],
    ['pet_bed_orange', 2, 2],
    ['pet_astaroth', 2, 2],
    ['table_small', 8, 1],
    ['chair_wood', 9, 1],
    ['candle', 7, 1],
    ['plant_pot', 11, 0],
  ];
  const placements = layout
    .filter(([itemId]) => granted[itemId])
    .map(([itemId, x, y]) => ({ uid: granted[itemId], itemId, x, y, flip: false }));
  const home = normalizeHome({ placements, createdAt: now, updatedAt: now });
  state.homes[String(userId)] = home;
  return home;
}

function getHome(userId) {
  const state = load();
  const home = state.homes[String(userId)];
  return home ? normalizeHome(home) : null;
}

function ensureHome(userId, now = Date.now()) {
  const state = load();
  const existing = state.homes[String(userId)];
  if (existing) return normalizeHome(existing);
  const home = createHome(state, userId, now);
  save(state);
  return home;
}

function mutateHome(userId, now, mutator) {
  const state = load();
  const id = String(userId);
  if (!state.homes[id]) createHome(state, id, now);
  const home = normalizeHome(state.homes[id]);
  const result = mutator(home, state);
  if (result && result.ok === false) return result;
  home.updatedAt = now;
  home.bestCharm = Math.max(home.bestCharm, engine.computeCharm(home).score);
  state.homes[id] = home;
  if (!save(state)) return { ok: false, reason: 'save' };
  return { ok: true, home, ...(result || {}) };
}

/** Itens da mochila que ainda não estão à mostra (só os que vão para o quarto). */
function getAvailableInstances(userId, home = getHome(userId)) {
  const placed = new Set((home?.placements || []).map((p) => p.uid));
  return vault
    .listInstances(userId)
    .filter((it) => !placed.has(it.uid) && engine.isPlaceable(getItem(it.itemId)));
}

function placeItem(userId, uid, x, y, flip = false, now = Date.now()) {
  const instance = vault.getInstance(userId, uid);
  if (!instance) return { ok: false, reason: 'not_owned' };
  return mutateHome(userId, now, (home) => {
    if (home.placements.some((p) => p.uid === uid)) return { ok: false, reason: 'already_placed' };
    const check = engine.validatePlacement(home.placements, instance.itemId, x, y);
    if (!check.ok) return check;
    const entry = getItem(instance.itemId);
    home.placements.push({ uid, itemId: instance.itemId, x, y, flip: Boolean(flip && entry.flippable) });
    return null;
  });
}

function moveItem(userId, uid, x, y, flip = false, now = Date.now()) {
  return mutateHome(userId, now, (home) => {
    const placement = home.placements.find((p) => p.uid === uid);
    if (!placement) return { ok: false, reason: 'not_placed' };
    const check = engine.validatePlacement(home.placements, placement.itemId, x, y, uid);
    if (!check.ok) return check;
    placement.x = x;
    placement.y = y;
    placement.flip = Boolean(flip && getItem(placement.itemId)?.flippable);
    return null;
  });
}

function storeItem(userId, uid, now = Date.now()) {
  return mutateHome(userId, now, (home) => {
    const index = home.placements.findIndex((p) => p.uid === uid);
    if (index === -1) return { ok: false, reason: 'not_placed' };
    home.placements.splice(index, 1);
    return null;
  });
}

/** Aplica papel de parede ou piso que a pessoa possui. */
function applySurface(userId, itemId, now = Date.now()) {
  const entry = getItem(itemId);
  if (!entry || !['wallpaper', 'flooring'].includes(entry.kind)) return { ok: false, reason: 'not_surface' };
  if (!vault.ownsItem(userId, itemId)) return { ok: false, reason: 'not_owned' };
  return mutateHome(userId, now, (home) => {
    home[entry.kind === 'wallpaper' ? 'wallpaper' : 'flooring'] = itemId;
    return null;
  });
}

/**
 * Compra na loja do dia. Debita antes de entregar; se a entrega falhar, devolve.
 * Premium (feijões): no máximo 1 por item por dia.
 */
function buyItem(userId, itemId, now = Date.now()) {
  const entry = getItem(itemId);
  const shop = engine.getDailyShop(engine.brtDayKey(now));
  if (!entry || !shop.items.includes(itemId)) return { ok: false, reason: 'not_in_shop' };
  ensureHome(userId, now);

  const state = load();
  const dayKey = shop.dayKey;
  const purchaseKey = `${userId}:${dayKey}`;
  const todays = state.purchases[purchaseKey] || {};
  const isPremium = Boolean(entry.price?.beans);
  if (isPremium && (todays[itemId] || 0) >= PREMIUM_DAILY_LIMIT) return { ok: false, reason: 'premium_limit' };

  let refund = null;
  if (isPremium) {
    const paid = economy.spendMagicBeans(userId, entry.price.beans);
    if (!paid.spent) return { ok: false, reason: 'beans', balance: paid.balance, price: entry.price.beans };
    refund = () => economy.addMagicBeans(userId, entry.price.beans);
  } else {
    const paid = economy.spendCoins(userId, entry.price.coins);
    if (!paid.spent) return { ok: false, reason: 'coins', balance: paid.balance, price: entry.price.coins };
    refund = () => economy.addCoins(userId, entry.price.coins);
  }

  const granted = vault.grantItem(userId, itemId, { source: isPremium ? 'premium' : 'shop', detail: dayKey }, now);
  if (!granted.ok) {
    refund();
    return { ok: false, reason: granted.reason };
  }

  // Limpa compras de dias anteriores e registra a de hoje
  for (const key of Object.keys(state.purchases)) {
    if (!key.endsWith(`:${dayKey}`)) delete state.purchases[key];
  }
  todays[itemId] = (todays[itemId] || 0) + 1;
  state.purchases[purchaseKey] = todays;
  state.totals.purchases = (state.totals.purchases || 0) + 1;
  if (isPremium) state.totals.beansSpent = (state.totals.beansSpent || 0) + entry.price.beans;
  else state.totals.coinsSpent = (state.totals.coinsSpent || 0) + entry.price.coins;
  save(state);

  return { ok: true, instance: granted.instance, entry };
}

/** Curtida de visita: 1 por visitante por casinha por dia, nunca na própria casa. */
function likeHome(visitorId, ownerId, now = Date.now()) {
  if (String(visitorId) === String(ownerId)) return { ok: false, reason: 'own_home' };
  const state = load();
  const owner = state.homes[String(ownerId)];
  if (!owner) return { ok: false, reason: 'no_home' };
  const home = normalizeHome(owner);
  const today = engine.brtDayKey(now);
  if (home.likedBy[String(visitorId)] === today) return { ok: false, reason: 'already_liked' };
  home.likedBy[String(visitorId)] = today;
  home.likes += 1;
  // Guarda só as curtidas de hoje para o arquivo não crescer sem limite
  for (const [visitor, day] of Object.entries(home.likedBy)) {
    if (day !== today) delete home.likedBy[visitor];
  }
  home.bestCharm = Math.max(home.bestCharm, engine.computeCharm(home).score);
  state.homes[String(ownerId)] = home;
  state.totals.likes = (state.totals.likes || 0) + 1;
  if (!save(state)) return { ok: false, reason: 'save' };
  return { ok: true, likes: home.likes };
}

function recordVisit(visitorId, ownerId) {
  if (String(visitorId) === String(ownerId)) return;
  const state = load();
  const owner = state.homes[String(ownerId)];
  if (!owner) return;
  owner.visits = (Number(owner.visits) || 0) + 1;
  save(state);
}

function getLeaderboard(limit = 10) {
  const state = load();
  return Object.entries(state.homes)
    .map(([userId, home]) => {
      const normalized = normalizeHome(home);
      return { userId, charm: engine.computeCharm(normalized).score, likes: normalized.likes, items: normalized.placements.length };
    })
    .sort((a, b) => b.charm - a.charm || b.likes - a.likes)
    .slice(0, limit);
}

/** Números reais para o /admin, o Visual DB e o system-truth. */
function getHomeStats() {
  const state = load();
  const homes = Object.values(state.homes).map(normalizeHome);
  return {
    homes: homes.length,
    placedItems: homes.reduce((acc, home) => acc + home.placements.length, 0),
    likes: state.totals.likes || 0,
    purchases: state.totals.purchases || 0,
    coinsSpent: state.totals.coinsSpent || 0,
    beansSpent: state.totals.beansSpent || 0,
    bestCharm: homes.reduce((max, home) => Math.max(max, engine.computeCharm(home).score), 0),
    vault: vault.getVaultStats(),
  };
}

module.exports = {
  PREMIUM_DAILY_LIMIT,
  getHome,
  ensureHome,
  getAvailableInstances,
  placeItem,
  moveItem,
  storeItem,
  applySurface,
  buyItem,
  likeHome,
  recordVisit,
  getLeaderboard,
  getHomeStats,
};
