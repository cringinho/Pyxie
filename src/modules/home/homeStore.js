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
 *
 * Como conseguir uma casinha (ninguém ganha de graça só por abrir o comando):
 * - De graça, chegando ao Andar 3 das Catacumbas (vencendo o guardião do Andar 2);
 * - Comprando nas condições da casa do casamento: 2000 moedinhas + 2 feijões mágicos.
 * Casinhas criadas antes desta regra continuam com quem já tinha.
 *
 * Morar junto: quem tem casinha e é casado pode chamar o cônjuge. Quem mora junto decora a
 * mesma casa com os próprios itens (cada item à mostra guarda quem colocou, em `by`).
 * Separar bens (divórcio): a casa fica com a dona original e cada item colocado pela outra
 * pessoa volta para a mochila dela (os itens nunca saíram do cofre de quem colocou).
 */

const PREMIUM_DAILY_LIMIT = 1;
// Mesmas condições da antiga casa do casamento
const HOUSE_PRICE = { coins: 2000, beans: 2 };
// Andar das Catacumbas que dá a chave da casinha de graça
const FREE_HOUSE_FLOOR = 3;

function homesFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'homes.json');
}

function load() {
  const stored = readJson(homesFile(), {});
  return {
    homes: stored.homes && typeof stored.homes === 'object' ? stored.homes : {},
    purchases: stored.purchases && typeof stored.purchases === 'object' ? stored.purchases : {},
    totals: stored.totals && typeof stored.totals === 'object' ? stored.totals : { coinsSpent: 0, beansSpent: 0, purchases: 0, likes: 0 },
    livingIn: stored.livingIn && typeof stored.livingIn === 'object' ? stored.livingIn : {},
  };
}

/** Casa em que a pessoa mora: a do cônjuge, se mora junto; senão, a própria. */
function homeIdFor(state, userId) {
  const id = String(userId);
  const ownerId = state.livingIn[id];
  if (ownerId && state.homes[ownerId] && (state.homes[ownerId].residents || []).includes(id)) return ownerId;
  return id;
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
    residents: Array.isArray(home.residents) ? home.residents.map(String) : [],
    wallpaperBy: home.wallpaperBy || null,
    flooringBy: home.flooringBy || null,
    acquired: home.acquired || 'starter',
  };
}

/** Casinha nova: entrega os itens iniciais e monta um cantinho aconchegante. */
function createHome(state, userId, now, acquired = 'starter') {
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
  const home = normalizeHome({ placements, createdAt: now, updatedAt: now, acquired });
  state.homes[String(userId)] = home;
  return home;
}

/** Casa em que a pessoa mora (a compartilhada, se mora com o cônjuge). */
function getHome(userId) {
  const state = load();
  const home = state.homes[homeIdFor(state, userId)];
  return home ? normalizeHome(home) : null;
}

/** Só a casa que é da própria pessoa (para separar bens e saber se ela tem casa). */
function getOwnHome(userId) {
  const home = load().homes[String(userId)];
  return home ? normalizeHome(home) : null;
}

/** Dona da casa em que a pessoa mora. */
function getHomeOwnerId(userId) {
  return homeIdFor(load(), userId);
}

/**
 * Casa em que a pessoa mora, criando o kit inicial se ainda não existir. Quem decide se a pessoa
 * pode ter casa é o /py-home (getHomeAccess); aqui só os testes e as prévias criam direto.
 */
function ensureHome(userId, now = Date.now()) {
  const state = load();
  const existing = state.homes[homeIdFor(state, userId)];
  if (existing) return normalizeHome(existing);
  const home = createHome(state, userId, now);
  save(state);
  return home;
}

function dungeonBestFloor(userId) {
  try {
    return Number(require('../dungeon/dungeonStore').getPlayerStats(userId).bestFloor) || 0;
  } catch (_) {
    return 0;
  }
}

/** O que a pessoa pode fazer para ter uma casinha agora. */
function getHomeAccess(userId) {
  const state = load();
  const id = String(userId);
  const ownerId = homeIdFor(state, id);
  const bestFloor = dungeonBestFloor(id);
  return {
    hasOwnHome: Boolean(state.homes[id]),
    livingIn: ownerId !== id ? ownerId : null,
    hasAccess: Boolean(state.homes[ownerId]),
    bestFloor,
    freeFloor: FREE_HOUSE_FLOOR,
    canClaimFree: !state.homes[id] && bestFloor >= FREE_HOUSE_FLOOR,
    price: { ...HOUSE_PRICE },
  };
}

/** Chave achada nas Catacumbas: casinha de graça para quem chegou ao Andar 3. */
function claimFreeHome(userId, now = Date.now()) {
  const state = load();
  const id = String(userId);
  if (state.homes[id]) return { ok: false, reason: 'has_home' };
  if (dungeonBestFloor(id) < FREE_HOUSE_FLOOR) return { ok: false, reason: 'need_dungeon', floor: FREE_HOUSE_FLOOR };
  const home = createHome(state, id, now, 'dungeon');
  if (!save(state)) return { ok: false, reason: 'save' };
  return { ok: true, home };
}

/** Compra da casinha nas condições do casamento. Debita antes; se algo falhar, devolve. */
function buyHouse(userId, now = Date.now()) {
  const id = String(userId);
  if (load().homes[id]) return { ok: false, reason: 'has_home' };
  const coins = economy.spendCoins(id, HOUSE_PRICE.coins);
  if (!coins.spent) return { ok: false, reason: 'house_coins', price: HOUSE_PRICE.coins, balance: coins.balance };
  const beans = economy.spendMagicBeans(id, HOUSE_PRICE.beans);
  if (!beans.spent) {
    economy.addCoins(id, HOUSE_PRICE.coins);
    return { ok: false, reason: 'house_beans', price: HOUSE_PRICE.beans, balance: economy.getMagicBeans(id) };
  }
  const state = load();
  const home = createHome(state, id, now, 'purchase');
  state.totals.coinsSpent = (state.totals.coinsSpent || 0) + HOUSE_PRICE.coins;
  state.totals.beansSpent = (state.totals.beansSpent || 0) + HOUSE_PRICE.beans;
  state.totals.housesBought = (state.totals.housesBought || 0) + 1;
  if (!save(state)) {
    economy.addCoins(id, HOUSE_PRICE.coins);
    economy.addMagicBeans(id, HOUSE_PRICE.beans);
    return { ok: false, reason: 'save' };
  }
  return { ok: true, home };
}

function spouseOf(userId) {
  try {
    return require('../../services/marriage').getSpouseId(String(userId)) || null;
  } catch (_) {
    return null;
  }
}

/** O cônjuge aceita morar na casinha da outra pessoa. Só casados dividem a casa. */
function moveIn(ownerId, residentId, now = Date.now()) {
  const owner = String(ownerId);
  const resident = String(residentId);
  if (owner === resident) return { ok: false, reason: 'own_home' };
  if (spouseOf(owner) !== resident) return { ok: false, reason: 'not_spouse' };
  const state = load();
  if (!state.homes[owner]) return { ok: false, reason: 'no_home' };
  if (homeIdFor(state, resident) === owner) return { ok: false, reason: 'already_together' };
  if (homeIdFor(state, owner) !== owner) return { ok: false, reason: 'owner_lives_elsewhere' };
  const home = normalizeHome(state.homes[owner]);
  home.residents = [...new Set([...home.residents, resident])];
  home.updatedAt = now;
  state.homes[owner] = home;
  state.livingIn[resident] = owner;
  if (!save(state)) return { ok: false, reason: 'save' };
  return { ok: true, home };
}

/** As duas pessoas moram na mesma casinha? */
function livingTogether(a, b) {
  const state = load();
  return homeIdFor(state, a) === homeIdFor(state, b) && Boolean(state.homes[homeIdFor(state, a)]);
}

/**
 * Separar bens: a casa fica com a dona original; os itens que a outra pessoa colocou (e o
 * papel de parede ou piso dela) saem da casa e continuam no cofre dela, prontos para usar.
 */
function separateHomes(userA, userB, now = Date.now()) {
  const state = load();
  const result = { separated: false, returned: {} };
  for (const [owner, resident] of [[String(userA), String(userB)], [String(userB), String(userA)]]) {
    const raw = state.homes[owner];
    if (!raw || state.livingIn[resident] !== owner) continue;
    const home = normalizeHome(raw);
    const kept = home.placements.filter((p) => String(p.by || owner) !== resident);
    result.returned[resident] = home.placements.length - kept.length;
    home.placements = kept;
    if (home.wallpaperBy === resident) {
      home.wallpaper = DEFAULT_WALLPAPER;
      home.wallpaperBy = null;
    }
    if (home.flooringBy === resident) {
      home.flooring = DEFAULT_FLOORING;
      home.flooringBy = null;
    }
    home.residents = home.residents.filter((r) => r !== resident);
    home.updatedAt = now;
    state.homes[owner] = home;
    delete state.livingIn[resident];
    result.separated = true;
  }
  if (result.separated) save(state);
  return result;
}

/**
 * Casais que já tinham comprado a casa no casamento antigo: a compra vale como a casinha do
 * casal (a de quem já tinha casinha, ou a do primeiro cônjuge) e os dois passam a morar nela.
 */
function honorLegacyCoupleHouse(spouses = [], now = Date.now()) {
  const [a, b] = spouses.map(String);
  if (!a || !b || livingTogether(a, b)) return livingTogether(a, b);
  const state = load();
  const owner = state.homes[a] ? a : state.homes[b] ? b : a;
  const other = owner === a ? b : a;
  if (!state.homes[owner]) {
    createHome(state, owner, now, 'legacy');
    save(state);
  }
  return moveIn(owner, other, now).ok;
}

function mutateHome(userId, now, mutator) {
  const state = load();
  const id = homeIdFor(state, userId);
  if (!state.homes[id]) return { ok: false, reason: 'no_home' };
  const home = normalizeHome(state.homes[id]);
  const result = mutator(home, state);
  if (result && result.ok === false) return result;
  home.updatedAt = now;
  home.bestCharm = Math.max(home.bestCharm, engine.computeCharm(home).score);
  state.homes[id] = home;
  if (!save(state)) return { ok: false, reason: 'save' };
  return { ok: true, home, ...(result || {}) };
}

/**
 * O item está em uso numa casa (à mostra no quarto, ou é a única cópia do papel de parede / piso
 * aplicado)? Usado pelo mercado para não deixar vender o que está na casa.
 */
function isInUse(userId, uid) {
  const instance = vault.getInstance(userId, uid);
  if (!instance) return false;
  const homes = [getHome(userId), getOwnHome(userId)].filter(Boolean);
  if (homes.some((home) => (home.placements || []).some((p) => p.uid === uid))) return true;
  const entry = getItem(instance.itemId);
  if (!entry || !['wallpaper', 'flooring'].includes(entry.kind)) return false;
  const applied = homes.some((home) => home[entry.kind] === instance.itemId && home[`${entry.kind}By`] === String(userId));
  return applied && vault.listInstances(userId).filter((it) => it.itemId === instance.itemId).length <= 1;
}

/** Itens da mochila que ainda não estão à mostra (só os que vão para o quarto). */
function getAvailableInstances(userId, home = getHome(userId)) {
  // Um item à mostra na própria casa ou na casa do casal não aparece de novo
  const own = getOwnHome(userId);
  const placed = new Set([...(home?.placements || []), ...(own?.placements || [])].map((p) => p.uid));
  return vault
    .listInstances(userId)
    .filter((it) => !placed.has(it.uid) && engine.isPlaceable(getItem(it.itemId)));
}

function placeItem(userId, uid, x, y, flip = false, now = Date.now()) {
  const instance = vault.getInstance(userId, uid);
  if (!instance) return { ok: false, reason: 'not_owned' };
  if (getAvailableInstances(userId).every((it) => it.uid !== uid)) return { ok: false, reason: 'already_placed' };
  return mutateHome(userId, now, (home) => {
    if (home.placements.some((p) => p.uid === uid)) return { ok: false, reason: 'already_placed' };
    const check = engine.validatePlacement(home.placements, instance.itemId, x, y);
    if (!check.ok) return check;
    const entry = getItem(instance.itemId);
    home.placements.push({ uid, itemId: instance.itemId, x, y, flip: Boolean(flip && entry.flippable), by: String(userId) });
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
    const field = entry.kind === 'wallpaper' ? 'wallpaper' : 'flooring';
    home[field] = itemId;
    home[`${field}By`] = String(userId);
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
  const homeId = homeIdFor(state, ownerId);
  if (homeId === homeIdFor(state, visitorId)) return { ok: false, reason: 'own_home' };
  const owner = state.homes[homeId];
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
  state.homes[homeId] = home;
  state.totals.likes = (state.totals.likes || 0) + 1;
  if (!save(state)) return { ok: false, reason: 'save' };
  return { ok: true, likes: home.likes };
}

function recordVisit(visitorId, ownerId) {
  if (String(visitorId) === String(ownerId)) return;
  const state = load();
  const homeId = homeIdFor(state, ownerId);
  if (homeId === homeIdFor(state, visitorId)) return;
  const owner = state.homes[homeId];
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
    housesBought: state.totals.housesBought || 0,
    couplesTogether: Object.keys(state.livingIn).length,
    bestCharm: homes.reduce((max, home) => Math.max(max, engine.computeCharm(home).score), 0),
    vault: vault.getVaultStats(),
  };
}

module.exports = {
  PREMIUM_DAILY_LIMIT,
  HOUSE_PRICE,
  FREE_HOUSE_FLOOR,
  getHome,
  getOwnHome,
  getHomeOwnerId,
  getHomeAccess,
  claimFreeHome,
  buyHouse,
  moveIn,
  livingTogether,
  separateHomes,
  honorLegacyCoupleHouse,
  ensureHome,
  getAvailableInstances,
  isInUse,
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
