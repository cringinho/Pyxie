const path = require('node:path');
const crypto = require('node:crypto');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { withFileLock } = require('../utils/fileLock');
const economy = require('./economy');

/**
 * Passe da Pyxie (/py-pass): uma temporada por mês (horário de Brasília), gerada sozinha.
 *
 * - 50 níveis, 300 XP cada. XP vem do que a pessoa já faz: bônus diário, turnos do /py-work,
 *   descidas nas Catacumbas, ataques no chefe da semana, oficina, mercado e caixas do Festival.
 * - Trilha grátis para todo mundo; trilha premium por R$ 5 (Pix/cartão no Mercado Pago) ou
 *   US$ 3 (PayPal), liberada pelo pagamento confirmado (src/services/passPayments.js).
 * - As recompensas de cada mês saem de uma semente do próprio mês: mesmas para todo mundo,
 *   diferentes a cada mês. O nível 50 premium dá um pet mítico e um título mítico exclusivos
 *   daquele mês (nunca voltam).
 * - Moedinhas só na trilha grátis e com teto (200 por mês) (AGENTS.md §5); a premium dá
 *   feijões, itens premium e cosméticos.
 *
 * data/battlePass.json: { users: { id: { months: { 'AAAA-MM': { xp, premium, claimed } } } }, payments, totals }
 */

const MAX_LEVEL = 50;
const XP_PER_LEVEL = 300;
const CLAIM_GRACE_DAYS = 7;
const PRICE = { BRL: 5, USD: 3 };
const BRT_OFFSET = 3 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

/** XP por atividade (as próprias atividades já têm limite e recarga). */
const XP_SOURCES = {
  daily: 120,
  work: 60,
  dungeon: 40,
  boss: 30,
  craft: 30,
  market: 20,
  festival: 15,
};

const MONTH_THEMES = [
  { pt: 'Glacial', en: 'Glacial', hue: 195, months: { pt: 'Janeiro', en: 'January' } },
  { pt: 'Floral', en: 'Floral', hue: 320, months: { pt: 'Fevereiro', en: 'February' } },
  { pt: 'Boreal', en: 'Boreal', hue: 150, months: { pt: 'Março', en: 'March' } },
  { pt: 'Primaveril', en: 'Vernal', hue: 95, months: { pt: 'Abril', en: 'April' } },
  { pt: 'Solar', en: 'Solar', hue: 45, months: { pt: 'Maio', en: 'May' } },
  { pt: 'Lunar', en: 'Lunar', hue: 230, months: { pt: 'Junho', en: 'June' } },
  { pt: 'Astral', en: 'Astral', hue: 265, months: { pt: 'Julho', en: 'July' } },
  { pt: 'Imperial', en: 'Imperial', hue: 0, months: { pt: 'Agosto', en: 'August' } },
  { pt: 'Celestial', en: 'Celestial', hue: 210, months: { pt: 'Setembro', en: 'September' } },
  { pt: 'Abissal', en: 'Abyssal', hue: 280, months: { pt: 'Outubro', en: 'October' } },
  { pt: 'Estelar', en: 'Starlit', hue: 55, months: { pt: 'Novembro', en: 'November' } },
  { pt: 'Polar', en: 'Polar', hue: 180, months: { pt: 'Dezembro', en: 'December' } },
];

/** Bases do pet mítico do mês (recoloridas com a cor do tema). */
const PET_BASES = ['pet_griffin', 'pet_unicorn', 'pet_fox', 'pet_owl', 'pet_pegasus', 'pet_dragon_red', 'pet_tiger', 'pet_bunny', 'pet_polar_bear', 'pet_fairy', 'pet_lion', 'pet_dragon_blue'];

// ---------------------------------------------------------------- arquivo
function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'battlePass.json');
}

function load() {
  const stored = readJson(stateFile(), {});
  return {
    users: stored.users && typeof stored.users === 'object' ? stored.users : {},
    payments: stored.payments && typeof stored.payments === 'object' ? stored.payments : {},
    totals: { xp: 0, premium: 0, claims: 0, revenueBRL: 0, revenueUSD: 0, ...(stored.totals || {}) },
  };
}

function save(state) {
  return writeJsonAtomic(stateFile(), state);
}

function locked(fn) {
  return withFileLock(stateFile(), fn);
}

function monthEntry(state, userId, month) {
  const id = String(userId);
  const user = state.users[id] || { months: {} };
  user.months = user.months && typeof user.months === 'object' ? user.months : {};
  const entry = user.months[month] || {};
  entry.xp = Math.max(0, Math.floor(Number(entry.xp) || 0));
  entry.premium = Boolean(entry.premium);
  entry.claimed = { free: Array.isArray(entry.claimed?.free) ? entry.claimed.free : [], premium: Array.isArray(entry.claimed?.premium) ? entry.claimed.premium : [] };
  user.months[month] = entry;
  state.users[id] = user;
  return entry;
}

// ---------------------------------------------------------------- calendário
function monthKey(now = Date.now()) {
  return new Date(now - BRT_OFFSET).toISOString().slice(0, 7);
}

function monthBounds(month) {
  const [y, m] = month.split('-').map(Number);
  return { start: Date.UTC(y, m - 1, 1) + BRT_OFFSET, end: Date.UTC(y, m, 1) + BRT_OFFSET };
}

function previousMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

function levelFor(xp) {
  return Math.min(MAX_LEVEL, Math.floor((Number(xp) || 0) / XP_PER_LEVEL));
}

// ---------------------------------------------------------------- recompensas do mês
function seededRandom(seedText) {
  let seed = crypto.createHash('sha256').update(seedText).digest().readUInt32LE(0);
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function themeFor(month) {
  return MONTH_THEMES[Number(month.split('-')[1]) - 1];
}

function petIdFor(month) {
  return `pass_pet_${month.replace('-', '_')}`;
}

function titleIdFor(month) {
  return `pass_title_${month.replace('-', '_')}`;
}

/** Pet mítico do mês (entrada do catálogo gerada na hora, ver homeCatalog.getItem). */
function validMonth(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(month || ''));
  return match && Number(match[2]) >= 1 && Number(match[2]) <= 12 ? match : null;
}

function buildMonthlyPet(month) {
  const match = validMonth(month);
  if (!match) return null;
  const { getBaseItem } = require('../modules/home/homeCatalog');
  const index = (Number(match[1]) * 12 + Number(match[2]) - 1) % PET_BASES.length;
  const base = getBaseItem(PET_BASES[index]);
  if (!base) return null;
  const theme = themeFor(month);
  const recolor = { from: [0, 360], to: theme.hue, minSat: 0, satMul: 1.35, lightAdd: 0.04 };
  return {
    ...base,
    id: petIdFor(month),
    name: { pt: `${base.name.pt} ${theme.pt}`, en: `${theme.en} ${base.name.en}` },
    rarity: 'mythic',
    sprite: base.sprite.pixels ? base.sprite : { ...base.sprite, recolor },
    source: 'pass',
    price: null,
    sets: [],
    maxSupply: 0,
    tradable: false,
    passMonth: month,
  };
}

/** Título mítico do mês (resolvido em economy.getTitleDefinition). */
function buildMonthlyTitle(month) {
  const match = validMonth(month);
  if (!match) return null;
  const theme = themeFor(month);
  const year = match[1];
  return {
    id: titleIdFor(month),
    series: 'pass',
    tier: 5,
    style: 'celestial',
    emoji: '🌌',
    name: { pt: `Lenda de ${theme.months.pt} ${year}`, en: `${theme.months.en} ${year} Legend` },
    desc: { pt: `Chegou ao nível 50 do Passe Premium de ${theme.months.pt} de ${year}.`, en: `Reached level 50 of the ${theme.months.en} ${year} Premium Pass.` },
  };
}

function titleIdToMonth(titleId) {
  const match = /^pass_title_(\d{4})_(\d{2})$/.exec(String(titleId || ''));
  return match ? `${match[1]}-${match[2]}` : null;
}

function petIdToMonth(itemId) {
  const match = /^pass_pet_(\d{4})_(\d{2})$/.exec(String(itemId || ''));
  return match ? `${match[1]}-${match[2]}` : null;
}

/**
 * As duas trilhas do mês. Cada recompensa: { type, qty?, material?, itemId? }.
 * Grátis: moedinhas nos níveis 5/15/25/35/45 (200 no total), item raro a cada 10, épico no 50.
 * Premium: feijões a cada 10, itens premium nos múltiplos de 5, pet e título míticos no 50.
 */
function getTrack(month) {
  const random = seededRandom(`pyxie-pass:${month}`);
  const { ITEMS } = require('../modules/home/homeCatalog');
  const pick = (pool) => pool[Math.floor(random() * pool.length)].id;
  const shopRare = ITEMS.filter((e) => e.source === 'shop' && e.rarity === 'rare');
  const shopEpic = ITEMS.filter((e) => e.source === 'shop' && e.rarity === 'epic');
  const premiumPool = ITEMS.filter((e) => e.source === 'premium');
  const materials = Object.keys(require('./crafting').MATERIALS);
  const small = (level, mult) => {
    const kind = level % 3;
    if (kind === 0) return { type: 'echoes', qty: 2 * mult };
    if (kind === 1) return { type: 'material', material: materials[Math.floor(random() * materials.length)], qty: 2 * mult };
    return { type: 'sparks', qty: 3 * mult };
  };
  const levels = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    let free;
    if (level === MAX_LEVEL) free = { type: 'item', itemId: pick(shopEpic) };
    else if (level % 10 === 0) free = { type: 'item', itemId: pick(shopRare) };
    else if (level % 5 === 0) free = { type: 'coins', qty: 40 };
    else free = small(level, 1);

    let premium;
    if (level === MAX_LEVEL) premium = { type: 'pet', itemId: petIdFor(month), title: titleIdFor(month) };
    else if (level % 10 === 0) premium = { type: 'beans', qty: 1 };
    else if (level % 5 === 0) premium = { type: 'item', itemId: pick(premiumPool) };
    else premium = small(level + 1, 2);
    levels.push({ level, free, premium });
  }
  return levels;
}

// ---------------------------------------------------------------- XP
/** Soma XP no mês atual. Devolve o nível antes/depois para avisar quem subiu. */
function addXp(userId, source, { amount = null, now = Date.now() } = {}) {
  const xp = Math.max(0, Math.floor(amount ?? XP_SOURCES[source] ?? 0));
  if (!xp || !userId) return null;
  const month = monthKey(now);
  return locked(() => {
    const state = load();
    const entry = monthEntry(state, userId, month);
    const before = levelFor(entry.xp);
    entry.xp = Math.min(entry.xp + xp, MAX_LEVEL * XP_PER_LEVEL);
    state.totals.xp += xp;
    if (!save(state)) return null;
    const after = levelFor(entry.xp);
    return { month, xp: entry.xp, gained: xp, before, after, levelUp: after > before };
  });
}

/** Atalho para os ganchos: nunca deixa uma falha do Passe atrapalhar o comando que deu XP. */
function safeAddXp(userId, source, options) {
  try {
    return addXp(userId, source, options);
  } catch (err) {
    console.warn('[battlePass] XP não registrado:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------- status e resgate
function getStatus(userId, now = Date.now()) {
  const month = monthKey(now);
  const state = load();
  const entry = monthEntry({ users: { [String(userId)]: state.users[String(userId)] || { months: {} } } }, userId, month);
  const level = levelFor(entry.xp);
  const track = getTrack(month);
  const claimableFree = track.filter((row) => row.level <= level && !entry.claimed.free.includes(row.level)).length;
  const claimablePremium = entry.premium ? track.filter((row) => row.level <= level && !entry.claimed.premium.includes(row.level)).length : 0;
  return {
    month,
    xp: entry.xp,
    level,
    intoLevel: level >= MAX_LEVEL ? XP_PER_LEVEL : entry.xp - level * XP_PER_LEVEL,
    premium: entry.premium,
    claimed: entry.claimed,
    claimable: claimableFree + claimablePremium,
    endsAt: monthBounds(month).end,
    track,
  };
}

/** Entrega uma recompensa. Falso quando não dá para entregar agora (mochila cheia). */
function deliver(userId, reward, month, now) {
  const id = String(userId);
  switch (reward.type) {
    case 'coins':
      economy.addCoins(id, reward.qty);
      return true;
    case 'beans':
      economy.addMagicBeans(id, reward.qty);
      return true;
    case 'echoes':
      require('../modules/dungeon/dungeonStore').addEchoes(id, reward.qty);
      return true;
    case 'material':
      return require('./crafting').addMaterials(id, { [reward.material]: reward.qty }).ok;
    case 'sparks':
      return require('./festival').addSparks(id, reward.qty, 'pass').ok;
    case 'item':
    case 'pet': {
      const granted = require('./itemVault').grantItem(id, reward.itemId, { source: 'pass', detail: month }, now);
      if (!granted.ok) return false;
      if (reward.title) economy.grantTitle(id, reward.title);
      return true;
    }
    default:
      return false;
  }
}

/** Meses que ainda aceitam resgate: o atual e o anterior até 7 dias depois de fechar. */
function claimableMonths(now) {
  const current = monthKey(now);
  const previous = previousMonth(current);
  return now - monthBounds(previous).end <= CLAIM_GRACE_DAYS * DAY ? [current, previous] : [current];
}

/**
 * Resgata tudo o que já foi liberado (grátis, e premium se tiver). Marca antes de entregar (dois
 * cliques não entregam duas vezes); o que não puder ser entregue volta a ficar pendente.
 */
function claimAll(userId, { now = Date.now() } = {}) {
  const id = String(userId);
  const delivered = [];
  let blocked = false;
  for (const month of claimableMonths(now)) {
    const reserved = locked(() => {
      const state = load();
      const entry = monthEntry(state, id, month);
      const level = levelFor(entry.xp);
      const track = getTrack(month);
      const picks = [];
      for (const row of track) {
        if (row.level > level) break;
        if (!entry.claimed.free.includes(row.level)) picks.push({ track: 'free', level: row.level, reward: row.free });
        if (entry.premium && !entry.claimed.premium.includes(row.level)) picks.push({ track: 'premium', level: row.level, reward: row.premium });
      }
      for (const p of picks) entry.claimed[p.track].push(p.level);
      if (picks.length && !save(state)) return [];
      return picks;
    });
    const failed = [];
    for (const pick of reserved) {
      if (deliver(id, pick.reward, month, now)) delivered.push({ ...pick, month });
      else failed.push(pick);
    }
    if (failed.length) {
      blocked = true;
      locked(() => {
        const state = load();
        const entry = monthEntry(state, id, month);
        for (const p of failed) entry.claimed[p.track] = entry.claimed[p.track].filter((lvl) => lvl !== p.level);
        save(state);
      });
    }
  }
  if (delivered.length) {
    locked(() => {
      const state = load();
      state.totals.claims += delivered.length;
      save(state);
    });
  }
  return { ok: true, delivered, blocked };
}

// ---------------------------------------------------------------- premium
/**
 * Libera a trilha premium de um mês. Idempotente pelo id do pagamento (o mesmo aviso do
 * Mercado Pago ou do PayPal pode chegar mais de uma vez).
 */
function activatePremium(userId, month, { paymentId, provider, amount = 0, currency = 'BRL', now = Date.now() } = {}) {
  if (!/^\d{17,20}$/.test(String(userId)) && !String(userId).startsWith('user_test_')) return { ok: false, reason: 'user' };
  if (!validMonth(month)) return { ok: false, reason: 'month' };
  if (!paymentId) return { ok: false, reason: 'payment' };
  return locked(() => {
    const state = load();
    if (state.payments[paymentId]) return { ok: true, duplicate: true, month };
    const entry = monthEntry(state, userId, month);
    const already = entry.premium;
    entry.premium = true;
    state.payments[paymentId] = { userId: String(userId), month, provider, amount: Number(amount) || 0, currency, at: now, already };
    if (!already) state.totals.premium += 1;
    if (currency === 'BRL') state.totals.revenueBRL = Math.round((state.totals.revenueBRL + (Number(amount) || 0)) * 100) / 100;
    if (currency === 'USD') state.totals.revenueUSD = Math.round((state.totals.revenueUSD + (Number(amount) || 0)) * 100) / 100;
    if (!save(state)) return { ok: false, reason: 'save' };
    return { ok: true, month, already };
  });
}

function isPremium(userId, month = monthKey()) {
  const user = load().users[String(userId)];
  return Boolean(user?.months?.[month]?.premium);
}

function getPassStats(now = Date.now()) {
  const state = load();
  const month = monthKey(now);
  const entries = Object.values(state.users).map((u) => u.months?.[month]).filter(Boolean);
  return {
    month,
    players: entries.length,
    premiumThisMonth: entries.filter((e) => e.premium).length,
    maxed: entries.filter((e) => levelFor(e.xp) >= MAX_LEVEL).length,
    averageLevel: entries.length ? Math.round((entries.reduce((acc, e) => acc + levelFor(e.xp), 0) / entries.length) * 10) / 10 : 0,
    payments: Object.keys(state.payments).length,
    ...state.totals,
  };
}

module.exports = {
  MAX_LEVEL,
  XP_PER_LEVEL,
  XP_SOURCES,
  PRICE,
  CLAIM_GRACE_DAYS,
  stateFile,
  monthKey,
  monthBounds,
  levelFor,
  themeFor,
  getTrack,
  buildMonthlyPet,
  buildMonthlyTitle,
  petIdFor,
  titleIdFor,
  petIdToMonth,
  titleIdToMonth,
  addXp,
  safeAddXp,
  getStatus,
  claimAll,
  activatePremium,
  isPremium,
  getPassStats,
};
