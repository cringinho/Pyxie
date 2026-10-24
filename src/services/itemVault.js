const crypto = require('node:crypto');
const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { getItem, RARITIES } = require('../modules/home/homeCatalog');

/**
 * Cofre de itens da Pyxie: cada item que alguém possui é uma instância própria, com origem
 * (loja, dungeon, conquista...) e, nos lendários e míticos, número de série (#7).
 * Itens com maxSupply têm tiragem limitada (#7/50) e esgotam.
 *
 * data/itemVault.json é gravado só pelo processo do bot (writeJsonAtomic); o web apenas lê.
 */

const NUMBERED_RARITIES = new Set(['legendary', 'mythic']);
const MAX_ITEMS_PER_USER = 600;

function vaultFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'itemVault.json');
}

function load() {
  const stored = readJson(vaultFile(), {});
  return {
    users: stored.users && typeof stored.users === 'object' ? stored.users : {},
    serials: stored.serials && typeof stored.serials === 'object' ? stored.serials : {},
    totals: stored.totals && typeof stored.totals === 'object' ? stored.totals : { granted: 0, removed: 0 },
  };
}

function save(state) {
  return writeJsonAtomic(vaultFile(), state);
}

function userBucket(state, userId) {
  const id = String(userId);
  if (!state.users[id] || !Array.isArray(state.users[id].items)) state.users[id] = { items: [] };
  return state.users[id];
}

function newUid() {
  return crypto.randomBytes(6).toString('hex');
}

function isSoldOut(state, entry) {
  return entry.maxSupply > 0 && (state.serials[entry.id] || 0) >= entry.maxSupply;
}

/**
 * Entrega um item. origin: { source: 'shop'|'premium'|'dungeon'|'achievement'|'starter'|'admin', detail }
 * Retorna { ok, instance } ou { ok: false, reason: 'unknown_item'|'sold_out'|'full'|'save' }.
 */
function grantItem(userId, itemId, origin = {}, now = Date.now()) {
  const entry = getItem(itemId);
  if (!entry) return { ok: false, reason: 'unknown_item' };
  const state = load();
  if (isSoldOut(state, entry)) return { ok: false, reason: 'sold_out' };
  const bucket = userBucket(state, userId);
  if (bucket.items.length >= MAX_ITEMS_PER_USER) return { ok: false, reason: 'full' };

  let serial = null;
  if (entry.maxSupply > 0 || NUMBERED_RARITIES.has(entry.rarity)) {
    serial = (state.serials[entry.id] || 0) + 1;
    state.serials[entry.id] = serial;
  }

  const instance = {
    uid: newUid(),
    itemId: entry.id,
    serial,
    origin: { source: origin.source || 'shop', detail: origin.detail || null, at: now },
  };
  bucket.items.push(instance);
  state.totals.granted = (state.totals.granted || 0) + 1;
  if (!save(state)) return { ok: false, reason: 'save' };
  return { ok: true, instance };
}

function removeInstance(userId, uid) {
  const state = load();
  const bucket = userBucket(state, userId);
  const index = bucket.items.findIndex((it) => it.uid === uid);
  if (index === -1) return false;
  bucket.items.splice(index, 1);
  state.totals.removed = (state.totals.removed || 0) + 1;
  return save(state);
}

function listInstances(userId) {
  const state = load();
  return (state.users[String(userId)]?.items || []).filter((it) => getItem(it.itemId));
}

function getInstance(userId, uid) {
  return listInstances(userId).find((it) => it.uid === uid) || null;
}

function ownsItem(userId, itemId) {
  return listInstances(userId).some((it) => it.itemId === itemId);
}

function countByItem(userId) {
  const counts = {};
  for (const it of listInstances(userId)) counts[it.itemId] = (counts[it.itemId] || 0) + 1;
  return counts;
}

/** Resumo da coleção para conquistas e perfil. */
function getCollectionStats(userId) {
  const instances = listInstances(userId);
  const distinct = new Set(instances.map((it) => it.itemId));
  const byRarity = Object.fromEntries(Object.keys(RARITIES).map((r) => [r, 0]));
  const distinctByKind = {};
  for (const id of distinct) {
    const entry = getItem(id);
    byRarity[entry.rarity] += 1;
    distinctByKind[entry.kind] = (distinctByKind[entry.kind] || 0) + 1;
  }
  return { total: instances.length, distinct: distinct.size, byRarity, distinctByKind };
}

function getSupply(itemId) {
  const entry = getItem(itemId);
  const state = load();
  return { minted: state.serials[itemId] || 0, max: entry?.maxSupply || 0 };
}

/** Números reais para o /admin e o system-truth. */
function getVaultStats() {
  const state = load();
  const users = Object.values(state.users);
  const byRarity = Object.fromEntries(Object.keys(RARITIES).map((r) => [r, 0]));
  let total = 0;
  for (const user of users) {
    for (const it of user.items || []) {
      const entry = getItem(it.itemId);
      if (!entry) continue;
      byRarity[entry.rarity] += 1;
      total += 1;
    }
  }
  return {
    owners: users.filter((u) => (u.items || []).length > 0).length,
    totalItems: total,
    byRarity,
    granted: state.totals.granted || 0,
    numbered: Object.values(state.serials).reduce((acc, n) => acc + n, 0),
  };
}

module.exports = {
  NUMBERED_RARITIES,
  MAX_ITEMS_PER_USER,
  grantItem,
  removeInstance,
  listInstances,
  getInstance,
  ownsItem,
  countByItem,
  getCollectionStats,
  getSupply,
  getVaultStats,
};
