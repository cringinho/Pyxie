const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const { withFileLock } = require('../../utils/fileLock');

/**
 * Fichas de personagem do roleplay (uma por pessoa, valem em qualquer servidor) e estado das cenas.
 * Tudo em data/roleplay.json, gravado sob trava. A mochila e as condições são narrativas: não
 * mexem na economia nem nos itens da Casinha.
 */

const STATS = ['str', 'mag', 'agi', 'spi'];
const POINTS = 10; // soma dos quatro atributos na criação (cada um de 1 a 5)
const STAT_MIN = 1;
const STAT_CREATE_MAX = 5;
const STAT_MAX = 8;
const XP_PER_LEVEL = 100;
const XP_PER_TURN = 5;
const XP_DAILY_CAP = 40;
const REST_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const MAX_ITEMS = 12;
const MAX_CONDITIONS = 5;

// Origens do universo da Pyxie: cada uma dá +1 num atributo
const ANCESTRIES = {
  fairy: { bonus: 'mag', name: { pt: 'Fada', en: 'Fairy' } },
  human: { bonus: 'spi', name: { pt: 'Humano(a) que ainda acredita', en: 'Human who still believes' } },
  winged_cat: { bonus: 'agi', name: { pt: 'Gato alado', en: 'Winged cat' } },
  digital_spirit: { bonus: 'spi', name: { pt: 'Espírito digital', en: 'Digital spirit' } },
  nyxiel_defector: { bonus: 'str', name: { pt: 'Desertor(a) de Nyxiel', en: 'Nyxiel defector' } },
};

function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'roleplay.json');
}

function load() {
  const data = readJson(stateFile(), {});
  return { characters: data.characters || {}, scenes: data.scenes || {} };
}

function mutate(fn) {
  const file = stateFile();
  return withFileLock(file, () => {
    const state = load();
    const result = fn(state);
    writeJsonAtomic(file, state);
    return result;
  });
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const dayKey = (now) => new Date(now).toISOString().slice(0, 10);

function maxHp(stats) {
  return 8 + stats.str * 2 + stats.spi;
}

function maxMp(stats) {
  return 4 + stats.mag * 2 + stats.spi;
}

function levelOf(xp) {
  return 1 + Math.floor((xp || 0) / XP_PER_LEVEL);
}

function getCharacter(userId) {
  return load().characters[String(userId)] || null;
}

/** Valida e cria a ficha. Devolve { ok, character } ou { ok: false, reason }. */
function createCharacter(userId, { name, ancestry, bio = '', stats }, now = Date.now()) {
  const cleanName = String(name || '').trim().slice(0, 32);
  if (cleanName.length < 2) return { ok: false, reason: 'name' };
  if (!ANCESTRIES[ancestry]) return { ok: false, reason: 'ancestry' };
  const base = {};
  for (const s of STATS) {
    const v = Number(stats?.[s]);
    if (!Number.isInteger(v) || v < STAT_MIN || v > STAT_CREATE_MAX) return { ok: false, reason: 'stat_range' };
    base[s] = v;
  }
  const total = STATS.reduce((sum, s) => sum + base[s], 0);
  if (total !== POINTS) return { ok: false, reason: 'stat_total', total };
  base[ANCESTRIES[ancestry].bonus] += 1;
  return mutate((state) => {
    if (state.characters[String(userId)]) return { ok: false, reason: 'exists' };
    const character = {
      name: cleanName,
      ancestry,
      bio: String(bio || '').trim().slice(0, 300),
      stats: base,
      hp: maxHp(base),
      mp: maxMp(base),
      items: [],
      conditions: [],
      xp: 0,
      unspent: 0,
      xpDay: { day: dayKey(now), amount: 0 },
      restedAt: 0,
      createdAt: now,
    };
    state.characters[String(userId)] = character;
    return { ok: true, character };
  });
}

function updateBio(userId, bio) {
  return mutate((state) => {
    const c = state.characters[String(userId)];
    if (!c) return { ok: false, reason: 'missing' };
    c.bio = String(bio || '').trim().slice(0, 300);
    return { ok: true, character: c };
  });
}

/** Gasta um ponto ganho por nível num atributo. */
function trainStat(userId, stat) {
  return mutate((state) => {
    const c = state.characters[String(userId)];
    if (!c) return { ok: false, reason: 'missing' };
    if (!STATS.includes(stat)) return { ok: false, reason: 'stat' };
    if (c.unspent <= 0) return { ok: false, reason: 'no_points' };
    if (c.stats[stat] >= STAT_MAX) return { ok: false, reason: 'stat_max' };
    c.stats[stat] += 1;
    c.unspent -= 1;
    return { ok: true, character: c };
  });
}

/** Descanso: vida e mana cheias e condições curadas, uma vez a cada 6 horas. */
function rest(userId, now = Date.now()) {
  return mutate((state) => {
    const c = state.characters[String(userId)];
    if (!c) return { ok: false, reason: 'missing' };
    if (now - (c.restedAt || 0) < REST_COOLDOWN_MS) return { ok: false, reason: 'cooldown', readyAt: c.restedAt + REST_COOLDOWN_MS };
    c.hp = maxHp(c.stats);
    c.mp = maxMp(c.stats);
    c.conditions = [];
    c.restedAt = now;
    return { ok: true, character: c };
  });
}

/**
 * Efeitos que a narradora pediu, já limitados: vida e mana mudam no máximo 5 por turno e nunca
 * chegam a 0 (ninguém morre sem consentimento); itens e condições são textos curtos.
 */
function applyEffects(userId, effect = {}) {
  return mutate((state) => {
    const c = state.characters[String(userId)];
    if (!c) return null;
    const applied = {};
    const hp = clamp(Math.round(Number(effect.hp) || 0), -5, 5);
    const mp = clamp(Math.round(Number(effect.mp) || 0), -5, 5);
    if (hp) {
      const before = c.hp;
      c.hp = clamp(c.hp + hp, 1, maxHp(c.stats));
      applied.hp = c.hp - before;
    }
    if (mp) {
      const before = c.mp;
      c.mp = clamp(c.mp + mp, 0, maxMp(c.stats));
      applied.mp = c.mp - before;
    }
    const text = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (text(effect.item_add) && c.items.length < MAX_ITEMS && !c.items.includes(text(effect.item_add))) {
      c.items.push(text(effect.item_add));
      applied.itemAdded = text(effect.item_add);
    }
    if (text(effect.item_remove) && c.items.includes(text(effect.item_remove))) {
      c.items = c.items.filter((i) => i !== text(effect.item_remove));
      applied.itemRemoved = text(effect.item_remove);
    }
    if (text(effect.condition_add) && c.conditions.length < MAX_CONDITIONS && !c.conditions.includes(text(effect.condition_add))) {
      c.conditions.push(text(effect.condition_add));
      applied.conditionAdded = text(effect.condition_add);
    }
    if (text(effect.condition_remove) && c.conditions.includes(text(effect.condition_remove))) {
      c.conditions = c.conditions.filter((i) => i !== text(effect.condition_remove));
      applied.conditionRemoved = text(effect.condition_remove);
    }
    return { character: c, applied };
  });
}

/** XP por participar de um turno narrado, com teto diário; devolve níveis ganhos. */
function grantTurnXp(userId, now = Date.now()) {
  return mutate((state) => {
    const c = state.characters[String(userId)];
    if (!c) return 0;
    if (!c.xpDay || c.xpDay.day !== dayKey(now)) c.xpDay = { day: dayKey(now), amount: 0 };
    const gain = Math.min(XP_PER_TURN, XP_DAILY_CAP - c.xpDay.amount);
    if (gain <= 0) return 0;
    const before = levelOf(c.xp);
    c.xp += gain;
    c.xpDay.amount += gain;
    const levels = levelOf(c.xp) - before;
    c.unspent += levels;
    return levels;
  });
}

// ---------------------------------------------------------------- cenas

function getScene(threadId) {
  return load().scenes[String(threadId)] || null;
}

function updateScene(threadId, fn) {
  return mutate((state) => {
    const id = String(threadId);
    const scene = state.scenes[id] || { participants: [], summary: '', turns: [], rolls: {}, narrations: 0, day: { key: '', calls: 0 }, createdAt: Date.now() };
    const result = fn(scene);
    scene.turns = scene.turns.slice(-16);
    state.scenes[id] = scene;
    return result === undefined ? scene : result;
  });
}

function listScenes() {
  return Object.entries(load().scenes).map(([id, scene]) => ({ id, ...scene }));
}

function countCharacters() {
  return Object.keys(load().characters).length;
}

module.exports = {
  STATS,
  POINTS,
  STAT_MAX,
  XP_PER_LEVEL,
  ANCESTRIES,
  REST_COOLDOWN_MS,
  stateFile,
  maxHp,
  maxMp,
  levelOf,
  getCharacter,
  createCharacter,
  updateBio,
  trainStat,
  rest,
  applyEffects,
  grantTurnXp,
  getScene,
  updateScene,
  listScenes,
  countCharacters,
};
