/**
 * Itens que as Catacumbas deixam cair para a Casinha (cofre em src/services/itemVault.js).
 * Sorteio determinístico pela id da descida: repetir a mesma liquidação nunca muda o resultado.
 *
 * - Vitória sobre a Nyx: 1 lendário garantido + 1 raro (25% de chance de ser épico).
 * - Fuga com o tesouro no andar f: chance de 15% + 10% por andar extra (máx. 45%) de 1 item.
 * - Morte a partir do andar 3: 10% de chance de achar algo no caminho.
 */

const POOLS = {
  common: ['candle', 'mushrooms', 'skull', 'potion_red', 'potion_blue', 'sconce', 'torch'],
  rare: ['gravestone', 'candelabra', 'gems', 'window_stained', 'pet_bat', 'pet_crow', 'pet_mushroom', 'pet_flytrap'],
  epic: ['pet_eye', 'crystal_orb', 'dead_tree'],
  legendary: ['bed_night', 'mimic', 'gargoyle', 'gold_pile', 'pet_unicorn', 'pet_griffin', 'pet_dragon_red', 'pet_dragon_blue', 'pet_dragon_green'],
};

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rngFor(seedText) {
  let a = hashString(seedText);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(pool, rng) {
  return pool[Math.floor(rng() * pool.length) % pool.length];
}

/** Lista de itemIds que a descida rendeu (vazia se o módulo da Casinha não estiver disponível). */
function rollDrops(run) {
  let available;
  try {
    const { getItem } = require('../home/homeCatalog');
    available = (id) => Boolean(getItem(id));
  } catch (_) {
    return [];
  }
  const rng = rngFor(`pyxie-dungeon-drop:${run.id}`);
  const floor = Number(run.floor) || 1;
  const drops = [];

  if (run.outcome === 'victory') {
    drops.push(pick(POOLS.legendary, rng));
    drops.push(rng() < 0.25 ? pick(POOLS.epic, rng) : pick(POOLS.rare, rng));
  } else if (run.outcome === 'extracted') {
    const chance = Math.min(0.45, 0.15 + 0.1 * (floor - 1));
    if (rng() < chance) {
      if (floor <= 2) drops.push(pick(POOLS.common, rng));
      else drops.push(rng() < 0.1 ? pick(POOLS.epic, rng) : pick(POOLS.rare, rng));
    }
  } else if (run.outcome === 'dead' && floor >= 3) {
    if (rng() < 0.1) drops.push(pick(POOLS.common, rng));
  }
  return drops.filter(available);
}

module.exports = { POOLS, rollDrops };
