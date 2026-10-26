const economy = require('./economy');

/**
 * Materiais do trabalho e a oficina (/py-craft).
 *
 * - Cada turno certo no /py-work rende material da profissão: 1 unidade, +1 em turno de alta
 *   demanda e +1 a partir do nível 3 da carreira.
 * - A oficina transforma materiais (e uma taxa pequena em moedinhas, que sai da economia) em
 *   móveis que só existem por artesanato (fonte 'craft' no catálogo da Casinha).
 * - Os materiais ficam na conta da economia (`materials`), sempre alterados sob a trava.
 */

const MATERIALS = {
  wood: { emoji: '🪵', pt: 'Madeira', en: 'Wood' },
  ore: { emoji: '🪨', pt: 'Minério', en: 'Ore' },
  fabric: { emoji: '🧶', pt: 'Tecido', en: 'Fabric' },
  crystal: { emoji: '💎', pt: 'Cristal', en: 'Crystal' },
  flower: { emoji: '🌸', pt: 'Flor', en: 'Flower' },
  shell: { emoji: '🐚', pt: 'Concha', en: 'Shell' },
  scroll: { emoji: '📜', pt: 'Pergaminho', en: 'Scroll' },
  essence: { emoji: '✨', pt: 'Essência', en: 'Essence' },
};

/** Material que cada profissão traz do turno (sorteia entre os da lista). */
const PROFESSION_MATERIALS = {
  agricultor: ['flower', 'wood'],
  cozinheiro: ['shell', 'flower'],
  professor: ['scroll'],
  programador: ['crystal'],
  medico: ['flower', 'essence'],
  musico: ['wood'],
  fotografo: ['crystal'],
  mecanico: ['ore'],
  vendedor: ['fabric'],
  artista: ['fabric', 'flower'],
  dublador: ['scroll'],
  desenvolvedor_jogos: ['crystal'],
  psicologo: ['scroll'],
  telemarketing: ['scroll', 'fabric'],
  animador_festa: ['fabric'],
  advogada: ['scroll'],
  minerador: ['ore', 'crystal'],
  pescador: ['shell'],
  florista: ['flower'],
  marceneiro: ['wood'],
  costureiro: ['fabric'],
  arqueologo: ['scroll', 'crystal'],
  alquimista: ['essence', 'crystal'],
  mago: ['essence', 'scroll'],
  ferreiro: ['ore', 'crystal'],
  rei_rainha: ['fabric', 'ore'],
  domador_feras: ['wood', 'shell'],
  aniquilador_vegetais: ['flower', 'wood'],
};

/** Receitas da oficina: item do catálogo, materiais e taxa em moedinhas. */
const RECIPES = [
  { itemId: 'craft_flowerbed', materials: { flower: 4, wood: 1 }, coins: 20 },
  { itemId: 'craft_shell_jar', materials: { shell: 3 }, coins: 20 },
  { itemId: 'craft_polished_anvil', materials: { ore: 4 }, coins: 25 },
  { itemId: 'craft_fishing_net', materials: { shell: 2, fabric: 2 }, coins: 25 },
  { itemId: 'craft_quilt', materials: { fabric: 4 }, coins: 25 },
  { itemId: 'craft_tapestry', materials: { fabric: 3, flower: 1 }, coins: 30 },
  { itemId: 'craft_lantern', materials: { wood: 2, ore: 1, crystal: 1 }, coins: 30 },
  { itemId: 'craft_bookcase', materials: { wood: 3, scroll: 2 }, coins: 40 },
  { itemId: 'craft_shell_mirror', materials: { shell: 3, crystal: 1 }, coins: 35 },
  { itemId: 'craft_crystal_lamp', materials: { crystal: 3, ore: 1 }, coins: 45 },
  { itemId: 'craft_alchemy_table', materials: { essence: 3, wood: 2, crystal: 1 }, coins: 60 },
  { itemId: 'craft_star_globe', materials: { essence: 2, scroll: 2, crystal: 2 }, coins: 80 },
];

function getRecipe(itemId) {
  return RECIPES.find((recipe) => recipe.itemId === itemId) || null;
}

function normalizeMaterials(raw) {
  const out = {};
  for (const key of Object.keys(MATERIALS)) out[key] = Math.max(0, Math.floor(Number(raw?.[key]) || 0));
  return out;
}

function getMaterials(userId) {
  return normalizeMaterials(economy.getUserAccount(String(userId)).materials);
}

/** Soma (ou tira, com quantidade negativa) materiais. Nunca deixa ficar abaixo de zero. */
function addMaterials(userId, changes = {}) {
  let ok = true;
  const updated = economy.updateUserAccount(String(userId), (acc) => {
    const current = normalizeMaterials(acc.materials);
    for (const [key, qty] of Object.entries(changes)) {
      if (!MATERIALS[key]) continue;
      if (current[key] + qty < 0) ok = false;
    }
    if (!ok) return;
    for (const [key, qty] of Object.entries(changes)) {
      if (MATERIALS[key]) current[key] += Math.floor(qty);
    }
    acc.materials = current;
  });
  return { ok, materials: normalizeMaterials(updated.materials) };
}

/** Material do turno certo no /py-work. */
function grantWorkMaterials(userId, professionKey, { golden = false, level = 1, random = Math.random } = {}) {
  const pool = PROFESSION_MATERIALS[professionKey];
  if (!pool || !pool.length) return [];
  const qty = 1 + (golden ? 1 : 0) + (Number(level) >= 3 ? 1 : 0);
  const material = pool[Math.floor(random() * pool.length)];
  addMaterials(userId, { [material]: qty });
  return [{ material, qty }];
}

/**
 * Faz um item na oficina. Materiais e moedinhas saem sob a trava da economia; se o cofre não
 * aceitar o item (tiragem esgotada, erro de gravação), tudo volta.
 */
function craft(userId, itemId, now = Date.now()) {
  const id = String(userId);
  const recipe = getRecipe(itemId);
  if (!recipe) return { ok: false, reason: 'unknown_recipe' };
  let failure = null;
  economy.updateUserAccount(id, (acc) => {
    const current = normalizeMaterials(acc.materials);
    const missing = Object.entries(recipe.materials).filter(([key, qty]) => current[key] < qty);
    if (missing.length) {
      failure = { reason: 'materials', missing: Object.fromEntries(missing.map(([key, qty]) => [key, qty - current[key]])) };
      return;
    }
    if ((Number(acc.coins) || 0) < recipe.coins) {
      failure = { reason: 'coins', price: recipe.coins, balance: Number(acc.coins) || 0 };
      return;
    }
    for (const [key, qty] of Object.entries(recipe.materials)) current[key] -= qty;
    acc.materials = current;
    acc.coins -= recipe.coins;
    acc.craftCount = (Number(acc.craftCount) || 0) + 1;
  });
  if (failure) return { ok: false, ...failure };

  const granted = require('./itemVault').grantItem(id, itemId, { source: 'craft' }, now);
  if (!granted.ok) {
    economy.updateUserAccount(id, (acc) => {
      const current = normalizeMaterials(acc.materials);
      for (const [key, qty] of Object.entries(recipe.materials)) current[key] += qty;
      acc.materials = current;
      acc.coins = (Number(acc.coins) || 0) + recipe.coins;
      acc.craftCount = Math.max(0, (Number(acc.craftCount) || 0) - 1);
    });
    return { ok: false, reason: granted.reason || 'save' };
  }
  require('./battlePass').safeAddXp(id, 'craft', { now });
  return { ok: true, instance: granted.instance, recipe };
}

function materialLabel(key, lang) {
  const def = MATERIALS[key];
  return def ? `${def.emoji} ${def[lang === 'en' ? 'en' : 'pt']}` : key;
}

module.exports = {
  MATERIALS,
  PROFESSION_MATERIALS,
  RECIPES,
  getRecipe,
  getMaterials,
  addMaterials,
  grantWorkMaterials,
  craft,
  materialLabel,
};
