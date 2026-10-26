const { ITEMS, SETS, getItem, rarityInfo } = require('./homeCatalog');

/**
 * Regras puras da Casinha (sem disco): geometria do quarto, validação de posição,
 * Charme (pontuação de beleza) e a loja que gira todo dia.
 *
 * Quarto: 12 colunas, parede com 2 fileiras e piso com 6. Coordenadas da parede e do piso são
 * independentes: itens de parede usam (x, y) na parede, o resto usa (x, y) no piso.
 */

const ROOM = { cols: 12, wallRows: 2, floorRows: 6 };
const LIMITS = { placements: 48, pets: 6 };
const SET_BONUS_MIN = 4;
const SET_BONUS = 12;
const SHOP_COIN_SLOTS = 8;
const SHOP_PREMIUM_SLOTS = 2;

/** Camada de ocupação: tapetes não colidem com móveis; parede é uma grade própria. */
function layerOf(entry) {
  if (entry.kind === 'wall') return 'wall';
  if (entry.kind === 'rug') return 'rug';
  return 'floor';
}

function areaRows(layer) {
  return layer === 'wall' ? ROOM.wallRows : ROOM.floorRows;
}

function cellsOf(entry, x, y) {
  const [w, h] = entry.footprint;
  const cells = [];
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) cells.push(`${x + dx},${y + dy}`);
  return cells;
}

function isPlaceable(entry) {
  return Boolean(entry) && ['floor', 'wall', 'rug', 'pet'].includes(entry.kind);
}

/**
 * Valida uma posição. placements: [{ uid, itemId, x, y }]. ignoreUid permite mover um item
 * sem colidir com ele mesmo. Retorna { ok, reason }.
 */
function validatePlacement(placements, itemId, x, y, ignoreUid = null) {
  const entry = getItem(itemId);
  if (!isPlaceable(entry)) return { ok: false, reason: 'not_placeable' };
  const layer = layerOf(entry);
  const [w, h] = entry.footprint;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x + w > ROOM.cols || y + h > areaRows(layer)) {
    return { ok: false, reason: 'bounds' };
  }
  const others = placements.filter((p) => p.uid !== ignoreUid);
  if (!ignoreUid && others.length >= LIMITS.placements) return { ok: false, reason: 'full' };
  if (entry.kind === 'pet' && !ignoreUid && others.filter((p) => getItem(p.itemId)?.kind === 'pet').length >= LIMITS.pets) {
    return { ok: false, reason: 'pets' };
  }
  // Pets podem deitar em caminhas e pufes (petSpot); dois pets nunca dividem a mesma célula
  const sharesCell = (a, b) => (a.kind === 'pet' && b.petSpot) || (a.petSpot && b.kind === 'pet');
  const taken = new Set();
  for (const p of others) {
    const other = getItem(p.itemId);
    if (!other || layerOf(other) !== layer || sharesCell(entry, other)) continue;
    for (const cell of cellsOf(other, p.x, p.y)) taken.add(cell);
  }
  if (cellsOf(entry, x, y).some((cell) => taken.has(cell))) return { ok: false, reason: 'occupied' };
  return { ok: true };
}

/** Primeira posição livre para um item novo (varre de cima para baixo, da esquerda para a direita). */
function findFreeSpot(placements, itemId) {
  const entry = getItem(itemId);
  if (!isPlaceable(entry)) return null;
  const rows = areaRows(layerOf(entry));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < ROOM.cols; x++) {
      if (validatePlacement(placements, itemId, x, y).ok) return { x, y };
    }
  }
  return null;
}

/** Item ocupando a célula (x, y) de uma camada; móveis têm prioridade sobre tapetes no piso. */
function findPlacementAt(placements, area, x, y) {
  const candidates = placements.filter((p) => {
    const entry = getItem(p.itemId);
    if (!entry) return false;
    const layer = layerOf(entry);
    if (area === 'wall' ? layer !== 'wall' : layer === 'wall') return false;
    return cellsOf(entry, p.x, p.y).includes(`${x},${y}`);
  });
  return candidates.find((p) => layerOf(getItem(p.itemId)) === 'floor') || candidates[0] || null;
}

/**
 * Charme: raridade de tudo que está à mostra + variedade + conjuntos completos (4+ peças do
 * mesmo tema) + luz + pets + curtidas recebidas. Parede e piso aplicados também contam.
 */
function computeCharm(home) {
  const placed = (home.placements || []).map((p) => getItem(p.itemId)).filter(Boolean);
  const applied = [getItem(home.wallpaper), getItem(home.flooring)].filter(Boolean);
  const all = [...placed, ...applied];

  const rarity = all.reduce((acc, entry) => acc + rarityInfo(entry.rarity).charm, 0);
  const variety = new Set(placed.map((entry) => entry.id)).size;

  const setCounts = {};
  for (const entry of all) {
    for (const set of entry.sets) setCounts[set] = (setCounts[set] || 0) + 1;
  }
  const activeSets = Object.entries(setCounts)
    .filter(([, count]) => count >= SET_BONUS_MIN)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
  const sets = activeSets.length * SET_BONUS;

  const light = Math.min(20, placed.reduce((acc, entry) => acc + (entry.light || 0) * 2, 0));
  const pets = Math.min(LIMITS.pets, placed.filter((entry) => entry.kind === 'pet').length) * 3;
  const likes = Math.min(100, Number(home.likes) || 0);

  return {
    score: rarity + variety + sets + light + pets + likes,
    breakdown: { rarity, variety, sets, light, pets, likes },
    activeSets,
  };
}

// ---------------------------------------------------------------------------
// Loja do dia (igual para todo mundo, gira à meia-noite de Brasília)
// ---------------------------------------------------------------------------

function brtDayKey(now = Date.now()) {
  return new Date(now - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHOP_WEIGHTS = { common: 10, uncommon: 6, rare: 3, epic: 1 };

function pickWeighted(pool, rng, count) {
  const chosen = [];
  const remaining = [...pool];
  while (chosen.length < count && remaining.length) {
    const total = remaining.reduce((acc, entry) => acc + (SHOP_WEIGHTS[entry.rarity] || 1), 0);
    let roll = rng() * total;
    let index = 0;
    for (; index < remaining.length - 1; index++) {
      roll -= SHOP_WEIGHTS[remaining[index].rarity] || 1;
      if (roll <= 0) break;
    }
    chosen.push(remaining.splice(index, 1)[0]);
  }
  return chosen;
}

/** Vitrine do dia: 8 itens por moedinhas (com pelo menos um pet) e 2 premium por feijões. */
function getDailyShop(dayKey = brtDayKey()) {
  const rng = mulberry32(hashString(`pyxie-home-shop:${dayKey}`));
  const coinPool = ITEMS.filter((entry) => entry.source === 'shop' && entry.price?.coins);
  const premiumPool = ITEMS.filter((entry) => entry.source === 'premium' && entry.price?.beans);

  const petPool = coinPool.filter((entry) => entry.kind === 'pet');
  const [pet] = pickWeighted(petPool, rng, 1);
  const rest = pickWeighted(coinPool.filter((entry) => entry !== pet), rng, SHOP_COIN_SLOTS - 1);
  const coinsItems = [pet, ...rest].filter(Boolean).sort((a, b) => a.price.coins - b.price.coins);
  const premiumItems = pickWeighted(premiumPool, rng, SHOP_PREMIUM_SLOTS);

  return {
    dayKey,
    items: [...coinsItems, ...premiumItems].map((entry) => entry.id),
  };
}

function setName(setId, lang = 'pt') {
  return SETS[setId]?.[lang === 'en' ? 'en' : 'pt'] || setId;
}

module.exports = {
  ROOM,
  LIMITS,
  SET_BONUS_MIN,
  SET_BONUS,
  layerOf,
  cellsOf,
  isPlaceable,
  validatePlacement,
  findFreeSpot,
  findPlacementAt,
  computeCharm,
  brtDayKey,
  getDailyShop,
  mulberry32,
  hashString,
  setName,
};
