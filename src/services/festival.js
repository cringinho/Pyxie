const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { withFileLock } = require('../utils/fileLock');
const economy = require('./economy');

/**
 * Festival da Pyxie (/py-festival): temporadas globais automáticas pelo calendário (horário de
 * Brasília) com uma moeda própria, as Fagulhas.
 *
 * - Fagulhas caem de monstros fantasiados na dungeon (cerca de 20% das descidas durante uma
 *   temporada) e em 5% dos turnos certos do /py-work. Não viram moedinhas (AGENTS.md §5).
 * - Gastam-se na Caixa da Temporada; o Baú de Moedinhas abre a mesma vitrine pagando em
 *   moedinhas (sai da economia). Chances públicas e garantia (pity) por temporada.
 * - Itens de temporada (source 'festival' no catálogo da Casinha) só saem das caixas enquanto a
 *   temporada está aberta, e podem ser vendidos no mercado, assim como as Fagulhas.
 *
 * data/festival.json: { users: { id: { sparks, earned, spent, boxes: { <temporada:ano>: {...} } } }, totals }
 */

const DAY = 24 * 60 * 60 * 1000;
const BRT_OFFSET = 3 * 60 * 60 * 1000;

const CURRENCY = { emoji: '🎇', pt: 'Fagulhas', en: 'Sparks', ptOne: 'Fagulha', enOne: 'Spark' };

/** Páscoa (domingo) pelo algoritmo de Meeus/Jones/Butcher. */
function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(year, month - 1, day);
}

/**
 * Temporadas. `window(year)` devolve [início, fim) em UTC "de parede" (meia-noite de Brasília
 * tratada como meia-noite UTC; a comparação usa o relógio deslocado para BRT).
 */
const SEASONS = {
  summer: {
    emoji: '🏖️',
    color: '#06b6d4',
    name: { pt: 'Férias de Verão', en: 'Summer Break' },
    window: (y) => [Date.UTC(y, 0, 15), Date.UTC(y, 1, 16)],
  },
  easter: {
    emoji: '🐰',
    color: '#a3e635',
    name: { pt: 'Caça aos Ovos', en: 'Egg Hunt' },
    window: (y) => [easterDate(y) - 14 * DAY, easterDate(y) + 8 * DAY],
  },
  halloween: {
    emoji: '🎃',
    color: '#f97316',
    name: { pt: 'Noite das Abóboras', en: 'Pumpkin Night' },
    window: (y) => [Date.UTC(y, 9, 15), Date.UTC(y, 10, 6)],
  },
  christmas: {
    emoji: '🎄',
    color: '#ef4444',
    name: { pt: 'Natal Encantado', en: 'Enchanted Christmas' },
    window: (y) => [Date.UTC(y, 11, 8), Date.UTC(y, 11, 29)],
  },
  newyear: {
    emoji: '🎆',
    color: '#eab308',
    name: { pt: 'Virada Estrelada', en: 'Starry New Year' },
    // Atravessa o ano: 29/12 até 10/01
    window: (y) => [Date.UTC(y, 11, 29), Date.UTC(y + 1, 0, 11)],
  },
};

/** Caixas: chances por raridade (%), preço e garantia. As chances são mostradas no bot. */
const BOXES = {
  sparks: {
    price: { sparks: 25 },
    odds: { common: 52, uncommon: 30, rare: 13, epic: 4.5, legendary: 0.5 },
    // A cada 15 caixas sem épico ou melhor, a 15ª vem épica (ou a melhor raridade da temporada)
    pity: { every: 15, rarity: 'epic' },
  },
  coins: {
    price: { coins: 450 },
    odds: { common: 62, uncommon: 29, rare: 8, epic: 1 },
    pity: { every: 10, rarity: 'rare' },
    dailyLimit: 5,
  },
};

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

const RUN_CHANCE = 0.2;
const WORK_CHANCE = 0.05;
const KILL_SPARKS = 1;
const GUARDIAN_SPARKS = 3;

function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'festival.json');
}

function load() {
  const stored = readJson(stateFile(), {});
  return {
    users: stored.users && typeof stored.users === 'object' ? stored.users : {},
    totals: { earned: 0, spent: 0, boxes: 0, coinBoxes: 0, coinsRemoved: 0, ...(stored.totals || {}) },
  };
}

function save(state) {
  return writeJsonAtomic(stateFile(), state);
}

function locked(fn) {
  return withFileLock(stateFile(), fn);
}

function userOf(state, userId) {
  const id = String(userId);
  const user = state.users[id] || {};
  user.sparks = Math.max(0, Math.floor(Number(user.sparks) || 0));
  user.earned = Number(user.earned) || 0;
  user.spent = Number(user.spent) || 0;
  user.boxes = user.boxes && typeof user.boxes === 'object' ? user.boxes : {};
  state.users[id] = user;
  return user;
}

// ---------------------------------------------------------------- calendário
function seasonWindow(seasonId, now = Date.now()) {
  const season = SEASONS[seasonId];
  const wall = now - BRT_OFFSET;
  const year = new Date(wall).getUTCFullYear();
  for (const y of [year - 1, year, year + 1]) {
    const [start, end] = season.window(y);
    if (wall >= start && wall < end) return { start: start + BRT_OFFSET, end: end + BRT_OFFSET, year: y, active: true };
  }
  return null;
}

/** Temporada aberta agora (ou null). `key` separa a garantia de cada edição (halloween:2026). */
function getActiveSeason(now = Date.now()) {
  for (const id of Object.keys(SEASONS)) {
    const win = seasonWindow(id, now);
    if (win) return { id, key: `${id}:${win.year}`, ...SEASONS[id], start: win.start, end: win.end };
  }
  return null;
}

/** Próxima temporada a abrir (para a contagem regressiva fora de temporada). */
function getNextSeason(now = Date.now()) {
  const wall = now - BRT_OFFSET;
  const year = new Date(wall).getUTCFullYear();
  let best = null;
  for (const id of Object.keys(SEASONS)) {
    for (const y of [year, year + 1]) {
      const [start] = SEASONS[id].window(y);
      if (start > wall && (!best || start < best.start - BRT_OFFSET)) best = { id, ...SEASONS[id], start: start + BRT_OFFSET };
    }
  }
  return best;
}

function seasonName(season, lang) {
  return season ? `${season.emoji} ${season.name[lang === 'en' ? 'en' : 'pt']}` : '';
}

function currencyLabel(lang, qty = 2) {
  const en = lang === 'en';
  return `${CURRENCY.emoji} ${qty === 1 ? (en ? CURRENCY.enOne : CURRENCY.ptOne) : en ? CURRENCY.en : CURRENCY.pt}`;
}

// ---------------------------------------------------------------- carteira
function getSparks(userId) {
  const user = load().users[String(userId)];
  return Math.max(0, Math.floor(Number(user?.sparks) || 0));
}

/** Soma (ou tira, com valor negativo) Fagulhas. Nunca deixa ficar abaixo de zero. */
function addSparks(userId, qty, reason = 'other') {
  const amount = Math.floor(Number(qty) || 0);
  if (!amount) return { ok: true, sparks: getSparks(userId) };
  return locked(() => {
    const state = load();
    const user = userOf(state, userId);
    if (user.sparks + amount < 0) return { ok: false, reason: 'sparks', sparks: user.sparks };
    user.sparks += amount;
    if (amount > 0 && reason !== 'refund' && reason !== 'market') {
      user.earned += amount;
      state.totals.earned += amount;
      state.totals[`from_${reason}`] = (Number(state.totals[`from_${reason}`]) || 0) + amount;
    }
    if (!save(state)) return { ok: false, reason: 'save', sparks: user.sparks - amount };
    return { ok: true, sparks: user.sparks };
  });
}

// ---------------------------------------------------------------- fontes
/** 20% das descidas em temporada ganham monstros fantasiados (sorteio fixo pela semente do run). */
function decorateRun(run, now = Date.now(), random = null) {
  const season = getActiveSeason(now);
  if (!season || !run) return null;
  const roll = typeof random === 'function' ? random() : ((Number(run.seed) >>> 0) % 1000) / 1000;
  if (roll >= RUN_CHANCE) return null;
  run.festival = { season: season.id, key: season.key, collected: 0, perKill: KILL_SPARKS, perGuardian: GUARDIAN_SPARKS };
  if (Array.isArray(run.log)) run.log.push({ k: 'festivalRun', p: { season: season.id } });
  return run.festival;
}

/** Fagulhas de um turno certo no /py-work: 5% de chance, 1 a 3 (só em temporada). */
function rollWorkDrop(userId, { now = Date.now(), random = Math.random } = {}) {
  const season = getActiveSeason(now);
  if (!season || random() >= WORK_CHANCE) return null;
  const qty = 1 + Math.floor(random() * 3);
  const result = addSparks(userId, qty, 'work');
  return result.ok ? { qty, season } : null;
}

// ---------------------------------------------------------------- caixas
function seasonPool(seasonId) {
  const { ITEMS } = require('../modules/home/homeCatalog');
  return ITEMS.filter((entry) => entry.source === 'festival' && entry.season === seasonId);
}

/** Raridades que existem na temporada; uma raridade sem itens cai para a mais próxima abaixo. */
function resolveRarity(pool, rarity) {
  const have = new Set(pool.map((entry) => entry.rarity));
  for (let i = RARITY_ORDER.indexOf(rarity); i >= 0; i--) if (have.has(RARITY_ORDER[i])) return RARITY_ORDER[i];
  return pool[0]?.rarity || null;
}

function rollRarity(odds, random) {
  const total = Object.values(odds).reduce((acc, v) => acc + v, 0);
  let roll = random() * total;
  for (const [rarity, weight] of Object.entries(odds)) {
    roll -= weight;
    if (roll < 0) return rarity;
  }
  return Object.keys(odds)[0];
}

function rarityAtLeast(rarity, floor) {
  return RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf(floor);
}

function boxProgress(user, seasonKey) {
  const entry = user.boxes[seasonKey] || {};
  const out = {
    sparks: Number(entry.sparks) || 0,
    coins: Number(entry.coins) || 0,
    pitySparks: Number(entry.pitySparks) || 0,
    pityCoins: Number(entry.pityCoins) || 0,
    coinDay: entry.coinDay || null,
    coinToday: Number(entry.coinToday) || 0,
  };
  user.boxes[seasonKey] = out;
  return out;
}

function brtDay(now) {
  return new Date(now - BRT_OFFSET).toISOString().slice(0, 10);
}

/** Quanto falta para a garantia e quantas caixas de moedinhas restam hoje. */
function getBoxStatus(userId, now = Date.now()) {
  const season = getActiveSeason(now);
  const state = load();
  const user = state.users[String(userId)] ? userOf(state, userId) : userOf({ users: {} }, userId);
  const progress = season ? boxProgress(user, season.key) : null;
  const coinToday = progress && progress.coinDay === brtDay(now) ? progress.coinToday : 0;
  return {
    season,
    sparks: user.sparks,
    opened: progress ? progress.sparks + progress.coins : 0,
    pitySparksLeft: BOXES.sparks.pity.every - (progress?.pitySparks || 0),
    pityCoinsLeft: BOXES.coins.pity.every - (progress?.pityCoins || 0),
    coinBoxesLeft: Math.max(0, BOXES.coins.dailyLimit - coinToday),
  };
}

/**
 * Abre uma caixa. Cobra (Fagulhas ou moedinhas) sob trava, sorteia, entrega no cofre; se o cofre
 * recusar, devolve o pagamento e a garantia volta ao que era.
 */
function openBox(userId, kind, { now = Date.now(), random = Math.random } = {}) {
  const box = BOXES[kind];
  if (!box) return { ok: false, reason: 'unknown_box' };
  const season = getActiveSeason(now);
  if (!season) return { ok: false, reason: 'closed' };
  const pool = seasonPool(season.id);
  if (!pool.length) return { ok: false, reason: 'closed' };
  const id = String(userId);
  const vault = require('./itemVault');
  if (!vault.hasRoom(id)) return { ok: false, reason: 'full' };

  const pityKey = kind === 'sparks' ? 'pitySparks' : 'pityCoins';
  const reserved = locked(() => {
    const state = load();
    const user = userOf(state, id);
    const progress = boxProgress(user, season.key);
    const today = brtDay(now);
    if (kind === 'coins') {
      if (progress.coinDay !== today) {
        progress.coinDay = today;
        progress.coinToday = 0;
      }
      if (progress.coinToday >= box.dailyLimit) return { ok: false, reason: 'daily_limit', limit: box.dailyLimit };
    }
    if (kind === 'sparks') {
      if (user.sparks < box.price.sparks) return { ok: false, reason: 'sparks', price: box.price.sparks, balance: user.sparks };
    } else {
      const payment = economy.spendCoins(id, box.price.coins);
      if (!payment.spent) return { ok: false, reason: 'coins', price: box.price.coins, balance: payment.balance };
    }

    let rarity = rollRarity(box.odds, random);
    const pityHit = progress[pityKey] + 1 >= box.pity.every && !rarityAtLeast(rarity, box.pity.rarity);
    if (pityHit) rarity = box.pity.rarity;
    rarity = resolveRarity(pool, rarity);
    const choices = pool.filter((entry) => entry.rarity === rarity);
    const prize = choices[Math.floor(random() * choices.length)];

    const before = { ...progress, sparks: user.sparks };
    if (kind === 'sparks') {
      user.sparks -= box.price.sparks;
      user.spent += box.price.sparks;
      state.totals.spent += box.price.sparks;
      progress.sparks += 1;
      state.totals.boxes += 1;
    } else {
      progress.coins += 1;
      progress.coinToday += 1;
      state.totals.coinBoxes += 1;
      state.totals.coinsRemoved += box.price.coins;
    }
    progress[pityKey] = rarityAtLeast(prize.rarity, box.pity.rarity) || pityHit ? 0 : progress[pityKey] + 1;
    if (!save(state)) {
      if (kind === 'coins') economy.addCoins(id, box.price.coins);
      return { ok: false, reason: 'save' };
    }
    return { ok: true, prize, pityHit, before };
  });
  if (!reserved.ok) return reserved;

  const granted = vault.grantItem(id, reserved.prize.id, { source: 'festival', detail: season.key }, now);
  if (!granted.ok) {
    locked(() => {
      const state = load();
      const user = userOf(state, id);
      const progress = boxProgress(user, season.key);
      if (kind === 'sparks') {
        user.sparks += box.price.sparks;
        user.spent -= box.price.sparks;
        state.totals.spent -= box.price.sparks;
        progress.sparks -= 1;
        state.totals.boxes -= 1;
      } else {
        economy.addCoins(id, box.price.coins);
        progress.coins -= 1;
        progress.coinToday = Math.max(0, progress.coinToday - 1);
        state.totals.coinBoxes -= 1;
        state.totals.coinsRemoved -= box.price.coins;
      }
      progress[pityKey] = reserved.before[pityKey];
      save(state);
    });
    return { ok: false, reason: granted.reason === 'sold_out' ? 'sold_out' : 'save' };
  }
  return { ok: true, kind, season, item: reserved.prize, instance: granted.instance, pityHit: reserved.pityHit, status: getBoxStatus(id, now) };
}

/** Chances efetivas da temporada (raridades sem item somam na de baixo), para mostrar no bot. */
function effectiveOdds(kind, seasonId) {
  const pool = seasonPool(seasonId);
  const out = {};
  for (const [rarity, weight] of Object.entries(BOXES[kind].odds)) {
    const target = resolveRarity(pool, rarity);
    if (target) out[target] = Math.round(((out[target] || 0) + weight) * 10) / 10;
  }
  return out;
}

function getFestivalStats(now = Date.now()) {
  const state = load();
  const season = getActiveSeason(now);
  const holders = Object.values(state.users).filter((u) => Number(u.sparks) > 0);
  return {
    ...state.totals,
    activeSeason: season ? season.id : null,
    seasonEndsAt: season ? season.end : null,
    nextSeason: season ? null : getNextSeason(now)?.id || null,
    sparksInCirculation: holders.reduce((acc, u) => acc + (Number(u.sparks) || 0), 0),
    holders: holders.length,
    seasonItems: season ? seasonPool(season.id).length : 0,
  };
}

module.exports = {
  CURRENCY,
  SEASONS,
  BOXES,
  RUN_CHANCE,
  WORK_CHANCE,
  KILL_SPARKS,
  GUARDIAN_SPARKS,
  stateFile,
  easterDate,
  getActiveSeason,
  getNextSeason,
  seasonName,
  currencyLabel,
  getSparks,
  addSparks,
  decorateRun,
  rollWorkDrop,
  seasonPool,
  getBoxStatus,
  openBox,
  effectiveOdds,
  getFestivalStats,
};
