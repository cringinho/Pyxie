const { FLOORS, ENEMIES, CHARMS, EMPTY_FLAVORS, DIRECTIONS } = require('./dungeonData');

/**
 * Motor puro das Catacumbas de Veludo (sem I/O).
 *
 * - Andares procedurais em grade 7x7 (árvore de salas, estilo Isaac), com guardião na sala
 *   mais distante, tesouro trancado, altar ou mercadora.
 * - Combate por turnos com intenções telegrafadas: o jogador vê o próximo golpe e decide
 *   atacar, defender, gastar brilho ou chamar o Astaroth.
 * - Luz de vela que se gasta a cada sala; no escuro os monstros batem mais forte.
 * - Entre andares a jogadora escolhe descer (mais ouro, mais risco) ou fugir com o tesouro.
 *
 * O RNG (mulberry32) fica salvo no próprio run: repetir a mesma ação no mesmo estado
 * sempre dá o mesmo resultado, então não existe "rerrolar" saindo e voltando.
 */

const GRID = 7;
const FLOOR_COUNT = FLOORS.length;
const BASE = { hp: 24, atk: 5, crit: 0.1, maxSpark: 3, potions: 1, maxLight: 100 };
const DARK_THRESHOLD = 25;
const DEATH_SALVAGE = 0.1;
// Taxa da Lanterna: quanto mais raso a fuga, maior a comissão da Pyxie pelo resgate
const LANTERN_FEE = { 1: 0.3, 2: 0.2, 3: 0.1 };
const NYX_TREASURE = 60;
const MIN_MONSTERS = { 1: 2, 2: 3, 3: 3, 4: 4, 5: 2 };
const ROOM_WEIGHTS = [
  ['monster', 46],
  ['empty', 14],
  ['chest', 14],
  ['candle', 10],
  ['trap', 9],
  ['fountain', 7],
];
const TERMINAL_PHASES = new Set(['dead', 'extracted', 'victory']);

// ---------------------------------------------------------------- RNG
function nextRandom(run) {
  run.rng = (run.rng + 0x6d2b79f5) >>> 0;
  let t = run.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function randInt(run, min, max) {
  return min + Math.floor(nextRandom(run) * (max - min + 1));
}

function chance(run, p) {
  return nextRandom(run) < p;
}

function pickOne(run, list) {
  return list[Math.floor(nextRandom(run) * list.length)];
}

function pickWeighted(run, entries) {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = nextRandom(run) * total;
  for (const [value, w] of entries) {
    roll -= w;
    if (roll < 0) return value;
  }
  return entries[entries.length - 1][0];
}

function shuffled(run, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom(run) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------------------------------------------------------------- helpers
const cellKey = (x, y) => `${x},${y}`;

function parseKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

function hasCharm(run, id) {
  return run.player.charms.includes(id);
}

function getFloorDef(floor) {
  return FLOORS[Math.max(0, Math.min(FLOOR_COUNT, floor) - 1)];
}

function isDark(run) {
  return run.player.light <= DARK_THRESHOLD;
}

function isTerminal(run) {
  return TERMINAL_PHASES.has(run.phase);
}

function log(run, k, p = {}) {
  run.log.push({ k, p });
}

function fx(run, type, data = {}) {
  run.fx.push({ type, ...data });
}

function scaleGold(run, amount) {
  return Math.max(0, Math.round(amount * (1 + run.player.goldBonus)));
}

function gainGold(run, amount) {
  const value = scaleGold(run, amount);
  run.player.gold += value;
  run.stats.goldEarned += value;
  if (value > 0) fx(run, 'gold', { amount: value });
  return value;
}

function heal(run, amount) {
  const p = run.player;
  const before = p.hp;
  p.hp = Math.min(p.maxHp, p.hp + Math.max(0, Math.round(amount)));
  const healed = p.hp - before;
  if (healed > 0) fx(run, 'heal', { amount: healed });
  return healed;
}

/** Dano fora de combate (armadilhas, frio, veneno andando) nunca mata: o Astaroth segura você. */
function hurtNonLethal(run, amount) {
  const p = run.player;
  const dmg = Math.max(0, Math.min(Math.round(amount), p.hp - 1));
  p.hp -= dmg;
  run.stats.damageTaken += dmg;
  if (dmg > 0) fx(run, 'dmgPlayer', { amount: dmg });
  return dmg;
}

function potionHealAmount(run) {
  const base = Math.ceil(run.player.maxHp * 0.35);
  return hasCharm(run, 'bottomless_flask') ? Math.ceil(base * 1.5) : base;
}

function moveLightCost(run) {
  const base = Math.max(1, 4 + run.floor - run.player.lightCostReduction);
  return hasCharm(run, 'eternal_candle') ? Math.ceil(base / 2) : base;
}

// ---------------------------------------------------------------- criação do run
function createRun({ ownerId, lang = 'pt', talents = {}, seed = null, now = Date.now(), id = null } = {}) {
  const tal = talents || {};
  const maxHp = BASE.hp + 3 * (Number(tal.vitality) || 0);
  const maxLight = BASE.maxLight + 15 * (Number(tal.wick) || 0);
  const runSeed = Number.isFinite(Number(seed)) && seed !== null ? Number(seed) >>> 0 : (Math.floor(Math.random() * 2 ** 32) >>> 0);

  const run = {
    id: id || `dg_${now.toString(36)}_${runSeed.toString(36)}`,
    version: 1,
    ownerId: String(ownerId || ''),
    lang: lang === 'en' ? 'en' : 'pt',
    createdAt: now,
    updatedAt: now,
    step: 0,
    seed: runSeed,
    rng: runSeed,
    floor: 1,
    phase: 'explore',
    talents: { ...tal },
    player: {
      hp: maxHp,
      maxHp,
      atk: BASE.atk + (Number(tal.wand) || 0),
      def: 0,
      crit: BASE.crit + 0.04 * (Number(tal.luck) || 0),
      critMult: 2,
      goldBonus: 0.05 * (Number(tal.luck) || 0),
      spark: 0,
      maxSpark: BASE.maxSpark,
      potions: BASE.potions + (Number(tal.satchel) || 0),
      light: maxLight,
      maxLight,
      lightCostReduction: Number(tal.wick) || 0,
      gold: 0,
      keys: 0,
      poison: 0,
      poisonTurns: 0,
      dodge: 0,
      fleeBonus: 0,
      charms: [],
    },
    map: null,
    combat: null,
    event: null,
    reward: null,
    confirmForfeit: false,
    outcome: null,
    lastPos: null,
    log: [],
    fx: [],
    stats: {
      rooms: 0,
      kills: 0,
      damageDealt: 0,
      damageTaken: 0,
      goldEarned: 0,
      floorsCleared: 0,
      guardians: 0,
    },
  };

  enterFloor(run, 1);
  return run;
}

// ---------------------------------------------------------------- mapa
function countNeighbors(cells, x, y) {
  let n = 0;
  for (const d of Object.values(DIRECTIONS)) {
    if (cells.has(cellKey(x + d.dx, y + d.dy))) n++;
  }
  return n;
}

function buildLayout(run, target, minDeadEnds) {
  const center = Math.floor(GRID / 2);
  for (let attempt = 0; attempt < 80; attempt++) {
    const cells = new Map([[cellKey(center, center), { x: center, y: center }]]);
    const frontier = [{ x: center, y: center }];
    let guard = 0;
    while (cells.size < target && guard++ < 600) {
      const from = pickOne(run, frontier);
      const d = DIRECTIONS[pickOne(run, ['n', 's', 'e', 'w'])];
      const nx = from.x + d.dx;
      const ny = from.y + d.dy;
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
      if (cells.has(cellKey(nx, ny))) continue;
      // Só aceita a sala se ela encostar em exatamente uma sala existente: o mapa vira uma árvore
      if (countNeighbors(cells, nx, ny) !== 1) continue;
      const cell = { x: nx, y: ny };
      cells.set(cellKey(nx, ny), cell);
      frontier.push(cell);
    }
    if (cells.size < target) continue;
    const startKey = cellKey(center, center);
    const deadEnds = [...cells.keys()].filter((k) => k !== startKey && countNeighbors(cells, ...Object.values(parseKey(k))) === 1);
    if (deadEnds.length < minDeadEnds) continue;
    return { cells, startKey, deadEnds };
  }

  // Fallback determinístico (praticamente inalcançável): corredor em L com galhos
  const cells = new Map();
  for (let x = 0; x < GRID && cells.size < target; x++) cells.set(cellKey(x, center), { x, y: center });
  for (let y = center + 1; y < GRID && cells.size < target; y++) cells.set(cellKey(GRID - 1, y), { x: GRID - 1, y });
  const startKey = cellKey(0, center);
  const deadEnds = [...cells.keys()].filter((k) => k !== startKey && countNeighbors(cells, ...Object.values(parseKey(k))) === 1);
  return { cells, startKey, deadEnds };
}

function distancesFrom(cells, startKey) {
  const dist = new Map([[startKey, 0]]);
  const queue = [startKey];
  while (queue.length > 0) {
    const key = queue.shift();
    const { x, y } = parseKey(key);
    for (const d of Object.values(DIRECTIONS)) {
      const nk = cellKey(x + d.dx, y + d.dy);
      if (cells.has(nk) && !dist.has(nk)) {
        dist.set(nk, dist.get(key) + 1);
        queue.push(nk);
      }
    }
  }
  return dist;
}

function generateFloorMap(run, floor) {
  const def = getFloorDef(floor);
  const isFinal = floor >= FLOOR_COUNT;
  const minDeadEnds = isFinal ? 2 : 3;
  const { cells, startKey, deadEnds } = buildLayout(run, def.rooms, minDeadEnds);
  const dist = distancesFrom(cells, startKey);

  const rooms = {};
  for (const [key, cell] of cells.entries()) {
    rooms[key] = { x: cell.x, y: cell.y, type: 'empty', visited: false, seen: false, cleared: false };
  }
  rooms[startKey].type = 'start';

  // Guardião na ponta mais distante; depois tesouro e altar/mercadora nas outras pontas
  const sortedEnds = [...deadEnds].sort((a, b) => dist.get(b) - dist.get(a) || a.localeCompare(b));
  const guardianKey = sortedEnds.shift();
  rooms[guardianKey].type = 'guardian';
  rooms[guardianKey].enemy = def.guardian;

  const otherEnds = shuffled(run, sortedEnds);
  const specials = isFinal ? ['shrine'] : ['treasure', floor % 2 === 0 ? 'merchant' : 'shrine'];
  for (const special of specials) {
    const key = otherEnds.shift();
    if (key) rooms[key].type = special;
  }

  const normalKeys = Object.keys(rooms).filter((k) => rooms[k].type === 'empty');
  for (const key of normalKeys) {
    rooms[key].type = pickWeighted(run, ROOM_WEIGHTS);
  }

  // Garantias de ritmo: monstros mínimos e ao menos uma vela nos andares 1 a 4
  const ordered = shuffled(run, normalKeys);
  const minMonsters = MIN_MONSTERS[floor] || 2;
  let monsters = ordered.filter((k) => rooms[k].type === 'monster').length;
  for (const key of ordered) {
    if (monsters >= minMonsters) break;
    if (rooms[key].type !== 'monster') {
      rooms[key].type = 'monster';
      monsters++;
    }
  }
  if (!isFinal && !ordered.some((k) => rooms[k].type === 'candle')) {
    const spare =
      ordered.find((k) => rooms[k].type !== 'monster') ||
      (monsters > minMonsters ? ordered.find((k) => rooms[k].type === 'monster') : null);
    if (spare) rooms[spare].type = 'candle';
  }

  const mimicChance = Math.min(0.5, 0.15 + 0.03 * floor);
  for (const key of Object.keys(rooms)) {
    const room = rooms[key];
    if (room.type === 'monster') room.enemy = pickOne(run, def.enemies);
    if (room.type === 'chest') room.mimic = chance(run, mimicChance);
  }

  return { grid: GRID, rooms, pos: startKey, start: startKey, revealed: false };
}

function revealAround(run) {
  const { x, y } = parseKey(run.map.pos);
  for (const d of Object.values(DIRECTIONS)) {
    const room = run.map.rooms[cellKey(x + d.dx, y + d.dy)];
    if (room) room.seen = true;
  }
}

function enterFloor(run, floor) {
  run.floor = floor;
  run.map = generateFloorMap(run, floor);
  const start = run.map.rooms[run.map.start];
  start.visited = true;
  start.seen = true;
  start.cleared = true;
  run.lastPos = null;
  run.phase = 'explore';
  run.event = null;
  run.combat = null;
  run.reward = null;
  revealAround(run);
  log(run, 'floorEnter', { floor });
}

/** Vista do mapa já filtrada pela névoa de guerra: o renderizador só desenha o que a jogadora sabe. */
function getVisibleMap(run) {
  const map = run.map;
  const lantern = hasCharm(run, 'moth_lantern') || map.revealed;
  const dark = isDark(run);
  const nose = Number(run.talents.nose) || 0;
  const list = [];
  for (const [key, room] of Object.entries(map.rooms)) {
    let display = null;
    if (room.visited) {
      display = displayVisited(room);
    } else if (lantern) {
      display = room.type;
    } else if (room.seen) {
      if (dark) display = 'unknown';
      else if (['guardian', 'treasure', 'merchant', 'shrine'].includes(room.type)) display = room.type;
      else if (room.type === 'trap' && nose >= 2) display = 'trap';
      else display = 'unknown';
    }
    if (!display) continue;
    list.push({ key, x: room.x, y: room.y, display, current: key === map.pos, visited: room.visited });
  }
  return { grid: map.grid, rooms: list, pos: map.pos };
}

function displayVisited(room) {
  if (room.type === 'start') return 'start';
  if (room.type === 'guardian') return room.cleared ? 'stairs' : 'guardian';
  if (room.type === 'merchant') return 'merchant';
  if (room.type === 'shrine') return room.cleared ? 'shrine_used' : 'shrine';
  if (room.type === 'treasure') return room.cleared ? 'cleared' : 'treasure';
  if (room.type === 'monster') return room.cleared ? 'cleared' : 'monster';
  if (room.type === 'chest') return room.cleared ? 'cleared' : 'chest';
  if (room.type === 'fountain') return room.cleared ? 'cleared' : 'fountain';
  return 'cleared';
}

function getNeighborKey(run, dir) {
  const d = DIRECTIONS[dir];
  if (!d) return null;
  const { x, y } = parseKey(run.map.pos);
  const key = cellKey(x + d.dx, y + d.dy);
  return run.map.rooms[key] ? key : null;
}

// ---------------------------------------------------------------- exploração
function moveTo(run, dir) {
  const targetKey = getNeighborKey(run, dir);
  const p = run.player;
  const cost = moveLightCost(run);
  if (p.light <= 0) {
    hurtNonLethal(run, 2);
    log(run, 'cold');
  }
  p.light = Math.max(0, p.light - cost);

  if (p.poisonTurns > 0) {
    const dmg = hurtNonLethal(run, p.poison);
    tickPoisonCounter(run);
    if (dmg > 0) log(run, 'poisonTick', { amount: dmg });
  }

  run.lastPos = run.map.pos;
  run.map.pos = targetKey;
  const room = run.map.rooms[targetKey];
  const firstVisit = !room.visited;
  room.visited = true;
  room.seen = true;
  if (firstVisit) run.stats.rooms++;
  revealAround(run);
  if (p.light === 0) log(run, 'darkness');
  else if (isDark(run)) log(run, 'dim');

  enterRoom(run, room, targetKey, firstVisit);
}

function enterRoom(run, room, key, firstVisit) {
  const f = run.floor;
  if (room.cleared) {
    if (room.type === 'merchant') return openMerchant(run, room);
    log(run, room.type === 'guardian' ? 'stairsRoom' : 'backtrack');
    return null;
  }

  switch (room.type) {
    case 'monster':
      log(run, 'monsterAppears', { enemy: room.enemy });
      return startCombat(run, room.enemy, { roomKey: key, kind: 'monster', hp: room.enemyHp });
    case 'guardian':
      log(run, getEnemyDef(room.enemy).boss ? 'bossAppears' : 'guardianAppears', { enemy: room.enemy });
      return startCombat(run, room.enemy, { roomKey: key, kind: 'guardian', hp: room.enemyHp });
    case 'chest': {
      const sniffed = Boolean(room.mimic) && (Number(run.talents.nose) || 0) >= 1;
      run.event = { type: 'chest', roomKey: key, sniffed, poked: false };
      run.phase = 'event';
      log(run, sniffed ? 'chestSniffed' : 'chestFound');
      return null;
    }
    case 'treasure':
      run.event = { type: 'treasure', roomKey: key };
      run.phase = 'event';
      log(run, 'treasureFound');
      return null;
    case 'merchant':
      return openMerchant(run, room);
    case 'shrine':
      run.event = { type: 'shrine', roomKey: key };
      run.phase = 'event';
      log(run, 'shrineFound');
      return null;
    case 'fountain':
      run.event = { type: 'fountain', roomKey: key };
      run.phase = 'event';
      log(run, 'fountainFound');
      return null;
    case 'trap':
      if ((Number(run.talents.nose) || 0) >= 2) {
        room.cleared = true;
        const gold = gainGold(run, randInt(run, 3, 6) * f);
        log(run, 'trapSniffed', { gold });
        return null;
      }
      run.event = { type: 'trap', roomKey: key, damage: 4 + 2 * f };
      run.phase = 'event';
      log(run, 'trapTriggered');
      return null;
    case 'grave':
      if (!room.grave) {
        room.cleared = true;
        return null;
      }
      run.event = { type: 'grave', roomKey: key, grave: room.grave, looted: false, prayed: false };
      run.phase = 'event';
      log(run, 'graveFound', { user: room.grave.ownerName || `<@${room.grave.ownerId}>`, floor: f });
      return null;
    case 'candle': {
      room.cleared = true;
      const before = run.player.light;
      run.player.light = Math.min(run.player.maxLight, run.player.light + 35);
      log(run, 'candleFound', { amount: run.player.light - before });
      return null;
    }
    default: {
      room.cleared = true;
      if (firstVisit) {
        const flavor = randInt(run, 0, EMPTY_FLAVORS.length - 1);
        log(run, 'emptyRoom', { flavor });
        if (chance(run, 0.3)) {
          const gold = gainGold(run, randInt(run, 2, 5) * f);
          log(run, 'foundGold', { gold });
        }
        if (chance(run, 0.08)) {
          run.player.keys += 1;
          log(run, 'foundKey');
        }
      } else {
        log(run, 'backtrack');
      }
      return null;
    }
  }
}

function merchantPrice(run, base) {
  return Math.round(base * (1 + 0.25 * (run.floor - 1)));
}

function openMerchant(run, room) {
  if (!room.stock) {
    const charmId = pickNewCharms(run, 1)[0] || null;
    room.stock = [
      { item: 'potion', price: merchantPrice(run, 14), sold: false },
      { item: 'candle', price: merchantPrice(run, 10), sold: false },
      { item: 'key', price: merchantPrice(run, 12), sold: false },
    ];
    if (charmId) room.stock.push({ item: 'charm', charmId, price: merchantPrice(run, 38), sold: false });
    room.cleared = true;
  }
  run.event = { type: 'merchant', roomKey: run.map.pos };
  run.phase = 'event';
  log(run, 'merchantFound');
  return null;
}

function pickNewCharms(run, count) {
  const available = Object.keys(CHARMS).filter((id) => !hasCharm(run, id));
  return shuffled(run, available).slice(0, count);
}

function applyCharm(run, id) {
  const p = run.player;
  if (!CHARMS[id] || hasCharm(run, id)) return false;
  p.charms.push(id);
  switch (id) {
    case 'velvet_ribbon':
      p.maxHp += 6;
      p.hp += 6;
      break;
    case 'moon_wand':
      p.atk += 2;
      break;
    case 'armored_wings':
      p.def += 1;
      break;
    case 'cursed_coin':
      p.goldBonus += 0.35;
      p.maxHp = Math.max(1, p.maxHp - 4);
      p.hp = Math.max(1, Math.min(p.hp, p.maxHp));
      break;
    case 'cat_eye':
      p.crit += 0.12;
      p.critMult = 2.5;
      break;
    case 'bottomless_flask':
      p.potions += 1;
      break;
    case 'master_key':
      p.keys += 2;
      break;
    case 'fairy_dust':
      p.fleeBonus += 0.15;
      p.dodge += 0.08;
      break;
    case 'waning_necklace':
      p.maxSpark += 1;
      break;
    default:
      break;
  }
  log(run, 'charmGained', { charm: id });
  return true;
}

// ---------------------------------------------------------------- eventos
function finishEvent(run) {
  run.event = null;
  run.phase = 'explore';
}

function chestLoot(run, multiplier = 1) {
  const base = randInt(run, 10, 16) * (1 + 0.4 * (run.floor - 1)) * multiplier;
  const gold = gainGold(run, base);
  log(run, 'chestGold', { gold });
  return gold;
}

function resolveEvent(run, action, arg) {
  const ev = run.event;
  const room = run.map.rooms[ev.roomKey];
  const p = run.player;
  const f = run.floor;

  if (ev.type === 'chest') {
    if (action === 'leave') {
      log(run, 'leftAlone');
      return finishEvent(run);
    }
    if (action === 'poke') {
      p.light = Math.max(0, p.light - 5);
      ev.poked = true;
      if (room.mimic) {
        log(run, 'mimicRevealed');
        room.cleared = false;
        run.event = null;
        return startCombat(run, 'mimic', { roomKey: ev.roomKey, kind: 'mimic', surprise: 6 });
      }
      log(run, 'pokeNothing');
      return null;
    }
    if (action === 'open') {
      if (room.mimic) {
        log(run, 'mimicAmbush');
        run.event = null;
        return startCombat(run, 'mimic', { roomKey: ev.roomKey, kind: 'mimic' });
      }
      room.cleared = true;
      chestLoot(run);
      if (chance(run, 0.25)) {
        p.keys += 1;
        log(run, 'foundKey');
      }
      if (chance(run, 0.2)) {
        p.potions += 1;
        log(run, 'foundPotion');
      }
      return finishEvent(run);
    }
  }

  if (ev.type === 'treasure') {
    if (action === 'leave') {
      log(run, 'leftAlone');
      return finishEvent(run);
    }
    if (action === 'open' || action === 'force') {
      if (action === 'open') {
        p.keys -= 1;
        log(run, 'usedKey');
      } else if (!chance(run, 0.45)) {
        const dmg = hurtNonLethal(run, 4 + f);
        p.light = Math.max(0, p.light - 10);
        log(run, 'forceFail', { amount: dmg });
        return null;
      } else {
        log(run, 'forceSuccess');
      }
      room.cleared = true;
      chestLoot(run, 2 * (hasCharm(run, 'master_key') ? 2 : 1));
      const [charmId] = pickNewCharms(run, 1);
      if (charmId) applyCharm(run, charmId);
      return finishEvent(run);
    }
  }

  if (ev.type === 'merchant') {
    if (action === 'leave') {
      log(run, 'merchantBye');
      return finishEvent(run);
    }
    if (action === 'buy') {
      const offer = room.stock[Number(arg)];
      p.gold -= offer.price;
      offer.sold = true;
      if (offer.item === 'potion') p.potions += 1;
      if (offer.item === 'candle') p.light = Math.min(p.maxLight, p.light + 40);
      if (offer.item === 'key') p.keys += 1;
      log(run, 'bought', { item: offer.item, price: offer.price });
      if (offer.item === 'charm') applyCharm(run, offer.charmId);
      return null;
    }
  }

  if (ev.type === 'shrine') {
    if (action === 'leave') {
      log(run, 'leftAlone');
      return finishEvent(run);
    }
    if (action === 'pray') {
      const dmg = hurtNonLethal(run, Math.ceil(p.maxHp * 0.2));
      log(run, 'prayed', { amount: dmg });
      const [charmId] = pickNewCharms(run, 1);
      if (charmId) applyCharm(run, charmId);
      else gainGold(run, 20);
      room.cleared = true;
      return finishEvent(run);
    }
    if (action === 'offer') {
      const price = shrineOfferPrice(run);
      p.gold -= price;
      p.hp = p.maxHp;
      p.poison = 0;
      p.poisonTurns = 0;
      fx(run, 'heal', { amount: p.maxHp });
      log(run, 'offered', { price });
      room.cleared = true;
      return finishEvent(run);
    }
  }

  if (ev.type === 'fountain') {
    if (action === 'leave') {
      log(run, 'leftAlone');
      return finishEvent(run);
    }
    if (action === 'drink') {
      room.cleared = true;
      const roll = nextRandom(run);
      if (roll < 0.5) {
        const amount = heal(run, Math.ceil(p.maxHp * 0.3));
        log(run, 'fountainHeal', { amount });
      } else if (roll < 0.75) {
        p.light = Math.min(p.maxLight, p.light + 20);
        run.map.revealed = true;
        log(run, 'fountainVision');
      } else {
        p.poison = Math.max(p.poison, 2);
        p.poisonTurns = 3;
        log(run, 'fountainMurky');
      }
      return finishEvent(run);
    }
  }

  if (ev.type === 'grave') {
    const grave = ev.grave;
    if (action === 'leave') {
      log(run, 'graveLeft');
      room.cleared = true;
      return finishEvent(run);
    }
    // Espólios: a parte do ouro perdido que o store reservou para esta pessoa
    if (action === 'loot') {
      const amount = Math.max(0, Math.floor(Number(grave.lootShare) || 0));
      p.gold += amount;
      ev.looted = true;
      run.coop = [...(run.coop || []), { type: 'loot', graveId: grave.id, amount }];
      log(run, 'graveLooted', { gold: amount });
      if (!grave.revivable) {
        room.cleared = true;
        return finishEvent(run);
      }
      return null;
    }
    // Oração: gasta vela; quem decide se a alma volta é o store (regra das 24h)
    if (action === 'revive') {
      p.light = Math.max(0, p.light - 10);
      ev.prayed = true;
      run.coop = [...(run.coop || []), { type: 'revive', graveId: grave.id }];
      log(run, 'gravePrayed', { user: grave.ownerName || `<@${grave.ownerId}>` });
      room.cleared = true;
      return finishEvent(run);
    }
  }

  if (ev.type === 'trap') {
    let dmg = ev.damage;
    if (action === 'jump') {
      if (chance(run, Math.min(0.9, 0.55 + p.fleeBonus + p.dodge))) {
        log(run, 'trapDodged');
        dmg = 0;
      }
    } else if (action === 'shield') {
      dmg = Math.ceil(dmg / 2);
      log(run, 'trapShielded');
    } else if (action === 'disarm') {
      p.light = Math.max(0, p.light - 8);
      if (chance(run, 0.8)) {
        const gold = gainGold(run, randInt(run, 4, 8) * f);
        log(run, 'trapDisarmed', { gold });
        dmg = 0;
      } else {
        log(run, 'trapDisarmFail');
      }
    }
    if (dmg > 0) {
      const taken = hurtNonLethal(run, dmg);
      log(run, 'trapHit', { amount: taken });
    }
    room.cleared = true;
    return finishEvent(run);
  }
  return null;
}

function shrineOfferPrice(run) {
  return 15 + 5 * run.floor;
}

// ---------------------------------------------------------------- combate
function getEnemyDef(id) {
  return ENEMIES[id];
}

function startCombat(run, enemyId, { roomKey, kind, hp = null, surprise = 0 } = {}) {
  const def = getEnemyDef(enemyId);
  const f = run.floor;
  let maxHp = def.hp;
  let atk = def.atk;
  if (def.scalesWithFloor) {
    maxHp = def.hp + 5 * (f - 1);
    atk = def.atk + f;
  } else if (f >= FLOOR_COUNT && !def.guardian) {
    // No Coração da Cripta os monstros comuns são versões de elite
    maxHp = Math.round(def.hp * 1.35);
    atk = Math.round(def.atk * 1.35);
  }
  const combat = {
    enemyId,
    kind,
    roomKey,
    hp: Number.isFinite(hp) && hp > 0 ? Math.min(hp, maxHp) : maxHp,
    maxHp,
    atk,
    shield: 0,
    dodge: def.dodge || 0,
    guardian: Boolean(def.guardian),
    boss: Boolean(def.boss),
    cycleIndex: 0,
    intent: null,
    lastIntent: null,
    charged: false,
    distracted: false,
    guarding: false,
    block: 0,
    turn: 1,
    stolen: 0,
    phase2: false,
    freeSwipeUsed: false,
  };
  run.combat = combat;
  run.event = null;
  run.phase = 'combat';
  run.player.spark = Math.min(run.player.maxSpark, 1 + (hasCharm(run, 'waning_necklace') ? 1 : 0));
  if (surprise > 0) {
    combat.hp = Math.max(1, combat.hp - surprise);
    fx(run, 'dmgEnemy', { amount: surprise });
    log(run, 'surpriseHit', { amount: surprise, enemy: enemyId });
  }
  chooseIntent(run);
  return null;
}

function chooseIntent(run) {
  const c = run.combat;
  const def = getEnemyDef(c.enemyId);
  let intent;
  if (c.charged) {
    intent = { type: 'heavy', mult: c.boss ? 2.4 : 2.2 };
    c.charged = false;
  } else if (Array.isArray(def.cycle)) {
    intent = def.cycle[c.cycleIndex % def.cycle.length];
    c.cycleIndex++;
    if (intent.type === 'heal' && c.hp >= c.maxHp) intent = { type: 'attack', mult: 1 };
  } else {
    const options = def.moves.filter((m) => {
      if (m.type === 'heal' && c.hp > c.maxHp * 0.7) return false;
      if (m.type === 'charge' && c.lastIntent?.type === 'heavy') return false;
      if (m.type === 'defend' && c.lastIntent?.type === 'defend') return false;
      return true;
    });
    intent = pickWeighted(run, options.map((m) => [m, m.w || 1]));
  }
  const { w, ...clean } = intent;
  c.intent = { ...clean };
}

/** Dano de um golpe do inimigo já com escuridão, distração do Astaroth e defesa da jogadora. */
function enemyHitDamage(run, mult) {
  const c = run.combat;
  let raw = c.atk * (mult || 1);
  if (isDark(run)) raw *= 1.25;
  if (c.distracted) raw *= 0.5;
  return Math.max(0, Math.round(raw) - run.player.def);
}

/** Resumo da próxima ação do inimigo para o telegrafo do embed e da imagem. */
function describeIntent(run) {
  const c = run.combat;
  if (!c || !c.intent) return null;
  const i = c.intent;
  const base = { type: i.type, distracted: c.distracted, dark: isDark(run) };
  switch (i.type) {
    case 'attack':
    case 'heavy':
      return { ...base, perHit: enemyHitDamage(run, i.mult), hits: 1 };
    case 'multi':
      return { ...base, perHit: enemyHitDamage(run, i.mult), hits: i.hits };
    case 'drain':
      return { ...base, perHit: enemyHitDamage(run, i.mult), hits: 1, light: c.distracted ? 0 : i.light };
    case 'poison':
      return { ...base, perHit: enemyHitDamage(run, i.mult), hits: 1, poison: i.poison, turns: i.turns };
    case 'steal':
      return { ...base, perHit: enemyHitDamage(run, i.mult), hits: 1, gold: c.distracted ? 0 : Math.min(run.player.gold, i.gold) };
    case 'web':
      return { ...base, perHit: enemyHitDamage(run, i.mult), hits: 1 };
    case 'defend':
      return { ...base, value: i.value };
    case 'heal':
      return { ...base, value: i.value };
    case 'charge':
    default:
      return { ...base };
  }
}

function rollPlayerDamage(run, base) {
  const p = run.player;
  let dmg = base;
  const crit = chance(run, Math.min(0.75, p.crit));
  if (crit) dmg = Math.floor(dmg * p.critMult);
  return { dmg: Math.max(1, dmg), crit };
}

function damageEnemy(run, amount, { ignoreShield = false } = {}) {
  const c = run.combat;
  let dmg = amount;
  if (!ignoreShield && c.shield > 0) {
    const absorbed = Math.min(c.shield, dmg);
    c.shield -= absorbed;
    dmg -= absorbed;
    if (absorbed > 0) fx(run, 'enemyBlock', { amount: absorbed });
  }
  const dealt = Math.min(c.hp, dmg);
  c.hp -= dealt;
  run.stats.damageDealt += dealt;
  if (dealt > 0 && hasCharm(run, 'cute_leech')) {
    const leech = Math.floor(dealt * 0.2);
    if (leech > 0) heal(run, leech);
  }
  checkBossPhase(run);
  return dealt;
}

function checkBossPhase(run) {
  const c = run.combat;
  if (c && c.boss && !c.phase2 && c.hp > 0 && c.hp <= c.maxHp / 2) {
    c.phase2 = true;
    c.atk = Math.round(c.atk * 1.3);
    log(run, 'eclipse', { enemy: c.enemyId });
    fx(run, 'eclipse');
  }
}

function playerAction(run, action) {
  const p = run.player;
  const c = run.combat;
  const f = run.floor;

  if (action === 'attack') {
    if (chance(run, c.dodge)) {
      log(run, 'playerMiss', { enemy: c.enemyId });
      fx(run, 'miss', { target: 'enemy' });
      return 'acted';
    }
    const { dmg, crit } = rollPlayerDamage(run, p.atk + randInt(run, -1, 1));
    const dealt = damageEnemy(run, dmg);
    fx(run, 'dmgEnemy', { amount: dealt, crit });
    log(run, crit ? 'playerCrit' : 'playerHit', { amount: dealt, enemy: c.enemyId });
    return 'acted';
  }

  if (action === 'guard') {
    c.block = 4 + f + p.def;
    c.guarding = true;
    p.spark = Math.min(p.maxSpark, p.spark + 1);
    fx(run, 'guard', { amount: c.block });
    log(run, 'playerGuard', { amount: c.block });
    return 'acted';
  }

  if (action === 'bolt') {
    p.spark -= boltCost(run);
    const { dmg, crit } = rollPlayerDamage(run, p.atk * 2 + randInt(run, 0, 2));
    const dealt = damageEnemy(run, dmg, { ignoreShield: true });
    fx(run, 'dmgEnemy', { amount: dealt, crit, spell: true });
    log(run, crit ? 'boltCrit' : 'boltHit', { amount: dealt, enemy: c.enemyId });
    return 'acted';
  }

  if (action === 'astaroth') {
    const cost = swipeCost(run);
    if (cost === 0) c.freeSwipeUsed = true;
    p.spark -= cost;
    const dmg = 2 + f + (hasCharm(run, 'astaroth_bell') ? 3 : 0);
    const dealt = damageEnemy(run, dmg);
    c.distracted = true;
    fx(run, 'dmgEnemy', { amount: dealt, cat: true });
    log(run, 'astarothSwipe', { amount: dealt, enemy: c.enemyId });
    return 'acted';
  }

  if (action === 'potion') {
    p.potions -= 1;
    const healed = heal(run, potionHealAmount(run));
    p.poison = 0;
    p.poisonTurns = 0;
    log(run, 'potionDrink', { amount: healed });
    return 'acted';
  }

  if (action === 'flee') {
    if (chance(run, Math.min(0.9, 0.5 + p.fleeBonus))) {
      const room = run.map.rooms[c.roomKey];
      if (room) {
        room.enemyHp = c.hp;
        if (c.kind === 'mimic') {
          room.type = 'monster';
          room.enemy = 'mimic';
          room.cleared = false;
        }
      }
      log(run, 'fled', { enemy: c.enemyId });
      run.combat = null;
      run.phase = 'explore';
      if (run.lastPos && run.map.rooms[run.lastPos]) {
        run.map.pos = run.lastPos;
        run.lastPos = null;
      }
      return 'fled';
    }
    log(run, 'fleeFail');
    return 'acted';
  }
  return 'invalid';
}

function boltCost(run) {
  return hasCharm(run, 'pocket_grimoire') ? 1 : 2;
}

function swipeCost(run) {
  return hasCharm(run, 'astaroth_bell') && !run.combat?.freeSwipeUsed ? 0 : 1;
}

function hitPlayer(run, perHit) {
  const p = run.player;
  const c = run.combat;
  if (p.dodge > 0 && chance(run, p.dodge)) {
    fx(run, 'miss', { target: 'player' });
    log(run, 'playerDodge');
    return 0;
  }
  let dmg = perHit;
  if (c.block > 0) {
    const absorbed = Math.min(c.block, dmg);
    c.block -= absorbed;
    dmg -= absorbed;
    if (absorbed > 0) fx(run, 'block', { amount: absorbed });
  }
  p.hp -= dmg;
  run.stats.damageTaken += dmg;
  if (dmg > 0) fx(run, 'dmgPlayer', { amount: dmg });
  return dmg;
}

function enemyTurn(run) {
  const c = run.combat;
  const p = run.player;
  const i = c.intent;
  const id = c.enemyId;
  let total = 0;

  const strike = (mult, hits = 1) => {
    const perHit = enemyHitDamage(run, mult);
    for (let h = 0; h < hits; h++) total += hitPlayer(run, perHit);
  };

  switch (i.type) {
    case 'attack':
    case 'heavy':
      strike(i.mult);
      log(run, i.type === 'heavy' ? 'enemyHeavy' : 'enemyAttack', { enemy: id, amount: total });
      break;
    case 'multi':
      strike(i.mult, i.hits);
      log(run, 'enemyMulti', { enemy: id, amount: total, hits: i.hits });
      break;
    case 'drain':
      strike(i.mult);
      if (!c.distracted) {
        p.light = Math.max(0, p.light - i.light);
        log(run, 'enemyDrain', { enemy: id, amount: total, light: i.light });
      } else {
        log(run, 'enemyAttack', { enemy: id, amount: total });
      }
      break;
    case 'poison':
      strike(i.mult);
      p.poison = Math.max(p.poison, i.poison);
      p.poisonTurns = Math.max(p.poisonTurns, i.turns);
      log(run, 'enemyPoison', { enemy: id, amount: total, poison: i.poison, turns: i.turns });
      break;
    case 'steal': {
      strike(i.mult);
      const stolen = c.distracted ? 0 : Math.min(p.gold, i.gold);
      p.gold -= stolen;
      c.stolen += stolen;
      log(run, stolen > 0 ? 'enemySteal' : 'enemyAttack', { enemy: id, amount: total, gold: stolen });
      break;
    }
    case 'web':
      strike(i.mult);
      p.spark = Math.max(0, p.spark - 1);
      log(run, 'enemyWeb', { enemy: id, amount: total });
      break;
    case 'charge':
      c.charged = true;
      log(run, 'enemyCharge', { enemy: id });
      break;
    case 'defend':
      c.shield += i.value;
      log(run, 'enemyDefend', { enemy: id, amount: i.value });
      break;
    case 'heal': {
      const before = c.hp;
      c.hp = Math.min(c.maxHp, c.hp + i.value);
      log(run, 'enemyHeal', { enemy: id, amount: c.hp - before });
      break;
    }
    default:
      break;
  }

  if (c.distracted && ['attack', 'heavy', 'multi', 'drain', 'poison', 'steal', 'web'].includes(i.type)) {
    log(run, 'astarothDistracted');
  }

  // Espinhos de Rosa Negra: quem bate em você enquanto você se defende se machuca
  if (c.guarding && hasCharm(run, 'rose_thorns') && ['attack', 'heavy', 'multi', 'drain', 'poison', 'steal', 'web'].includes(i.type)) {
    const dealt = damageEnemy(run, 4, { ignoreShield: true });
    if (dealt > 0) {
      fx(run, 'dmgEnemy', { amount: dealt, thorns: true });
      log(run, 'thorns', { amount: dealt, enemy: id });
    }
  }

  if (c.phase2) {
    p.light = Math.max(0, p.light - 5);
  }

  c.lastIntent = i;
  c.distracted = false;
}

function tickPoisonCounter(run) {
  const p = run.player;
  p.poisonTurns = Math.max(0, p.poisonTurns - 1);
  if (p.poisonTurns === 0) p.poison = 0;
}

function startNextTurn(run) {
  const c = run.combat;
  const p = run.player;
  c.turn++;
  c.block = 0;
  c.guarding = false;
  if (p.poisonTurns > 0) {
    const dmg = Math.min(p.hp, p.poison);
    p.hp -= dmg;
    run.stats.damageTaken += dmg;
    tickPoisonCounter(run);
    if (dmg > 0) {
      fx(run, 'dmgPlayer', { amount: dmg, poison: true });
      log(run, 'poisonTick', { amount: dmg });
    }
    if (p.hp <= 0) return die(run);
  }
  p.spark = Math.min(p.maxSpark, p.spark + 1);
  chooseIntent(run);
  return null;
}

function winCombat(run) {
  const c = run.combat;
  const def = getEnemyDef(c.enemyId);
  const room = run.map.rooms[c.roomKey];
  let goldBase = randInt(run, def.gold[0], def.gold[1]);
  if (def.scalesWithFloor) goldBase = Math.round(goldBase * (1 + 0.5 * (run.floor - 1)));
  const gold = gainGold(run, goldBase);
  if (c.stolen > 0) {
    run.player.gold += c.stolen;
    log(run, 'stolenBack', { gold: c.stolen });
  }
  run.stats.kills++;
  log(run, c.guardian ? 'guardianDefeated' : 'enemyDefeated', { enemy: c.enemyId, gold });
  // Festival: monstros fantasiados soltam Fagulhas (creditadas no fim da descida)
  if (run.festival) {
    const sparks = c.guardian ? Number(run.festival.perGuardian) || 3 : Number(run.festival.perKill) || 1;
    run.festival.collected = (Number(run.festival.collected) || 0) + sparks;
    log(run, 'festivalSpark', { sparks });
  }
  fx(run, 'victory');
  if (hasCharm(run, 'amethyst_heart')) {
    const healed = heal(run, 4);
    if (healed > 0) log(run, 'amethystHeal', { amount: healed });
  }
  if (room) {
    room.cleared = true;
    delete room.enemyHp;
  }
  run.combat = null;

  if (!c.guardian) {
    run.phase = 'explore';
    return null;
  }

  run.stats.floorsCleared++;
  run.stats.guardians++;
  if (c.boss) {
    gainGold(run, NYX_TREASURE);
    log(run, 'nyxTreasure', { gold: Math.round(NYX_TREASURE * (1 + run.player.goldBonus)) });
    return finishRun(run, 'victory');
  }

  const options = pickNewCharms(run, 3);
  if (options.length === 0) {
    gainGold(run, 20);
    return goCamp(run);
  }
  run.reward = { options };
  run.phase = 'reward';
  return null;
}

function goCamp(run) {
  const p = run.player;
  run.reward = null;
  run.phase = 'camp';
  const healed = heal(run, Math.ceil(p.maxHp * 0.25));
  const before = p.light;
  p.light = Math.min(p.maxLight, p.light + 40);
  p.poison = 0;
  p.poisonTurns = 0;
  log(run, 'campfire', { amount: healed, light: p.light - before });
  return null;
}

function die(run) {
  run.player.hp = 0;
  run.combat = null;
  return finishRun(run, 'dead');
}

function finishRun(run, outcome) {
  run.phase = outcome === 'victory' ? 'victory' : outcome === 'extracted' ? 'extracted' : 'dead';
  run.outcome = outcome;
  run.event = null;
  run.reward = null;
  run.confirmForfeit = false;
  return null;
}

// ---------------------------------------------------------------- ações disponíveis
/** Lista de ações válidas no estado atual, usada pelos botões e pela validação. */
function getAvailableActions(run) {
  const p = run.player;
  const actions = [];
  const add = (id, enabled = true, arg = null) => actions.push({ id, arg, enabled: Boolean(enabled) });

  if (isTerminal(run)) return actions;

  if (run.confirmForfeit) {
    add('forfeit_confirm');
    add('forfeit_cancel');
    return actions;
  }

  switch (run.phase) {
    case 'explore':
      for (const dir of ['w', 'n', 's', 'e']) add('move', Boolean(getNeighborKey(run, dir)), dir);
      add('potion', p.potions > 0 && p.hp < p.maxHp);
      add('forfeit');
      break;
    case 'combat': {
      const c = run.combat;
      add('attack');
      add('guard');
      add('bolt', p.spark >= boltCost(run));
      add('astaroth', p.spark >= swipeCost(run));
      add('potion', p.potions > 0);
      add('flee', !c.guardian);
      break;
    }
    case 'event': {
      const ev = run.event;
      const room = run.map.rooms[ev.roomKey];
      if (ev.type === 'chest') {
        add('open');
        if (!ev.poked) add('poke');
        add('leave');
      } else if (ev.type === 'treasure') {
        add('open', p.keys > 0);
        add('force');
        add('leave');
      } else if (ev.type === 'merchant') {
        room.stock.forEach((offer, index) => {
          if (offer.sold || (offer.item === 'charm' && hasCharm(run, offer.charmId))) return;
          add('buy', p.gold >= offer.price, String(index));
        });
        add('leave');
      } else if (ev.type === 'shrine') {
        add('pray');
        add('offer', p.gold >= shrineOfferPrice(run));
        add('leave');
      } else if (ev.type === 'fountain') {
        add('drink');
        add('leave');
      } else if (ev.type === 'trap') {
        add('jump');
        add('shield');
        add('disarm');
      } else if (ev.type === 'grave') {
        add('loot', !ev.looted && Number(ev.grave.lootShare) > 0);
        add('revive', Boolean(ev.grave.revivable) && !ev.prayed);
        add('leave');
      }
      break;
    }
    case 'reward':
      run.reward.options.forEach((_, index) => add('pick', true, String(index)));
      break;
    case 'camp':
      add('descend');
      add('extract');
      break;
    default:
      break;
  }
  return actions;
}

/**
 * Aplica uma ação ao run (mutação in-place). Ações inválidas não alteram nada.
 * @returns {{ ok: boolean, reason?: string }}
 */
function applyAction(run, action, arg = null, now = Date.now()) {
  if (!run || isTerminal(run)) return { ok: false, reason: 'finished' };
  const available = getAvailableActions(run);
  const match = available.find((a) => a.id === action && (a.arg === null || String(a.arg) === String(arg)));
  if (!match) return { ok: false, reason: 'invalid' };
  if (!match.enabled) return { ok: false, reason: 'disabled' };

  run.log = [];
  run.fx = [];
  const p = run.player;

  if (action === 'forfeit') {
    run.confirmForfeit = true;
  } else if (action === 'forfeit_cancel') {
    run.confirmForfeit = false;
  } else if (action === 'forfeit_confirm') {
    log(run, 'forfeited');
    finishRun(run, 'forfeit');
  } else if (run.phase === 'explore') {
    if (action === 'move') moveTo(run, arg);
    if (action === 'potion') {
      p.potions -= 1;
      const healed = heal(run, potionHealAmount(run));
      p.poison = 0;
      p.poisonTurns = 0;
      log(run, 'potionDrink', { amount: healed });
    }
  } else if (run.phase === 'combat') {
    const result = playerAction(run, action);
    if (result === 'acted') {
      if (run.combat.hp <= 0) {
        winCombat(run);
      } else {
        enemyTurn(run);
        if (p.hp <= 0) {
          die(run);
        } else if (run.combat.hp <= 0) {
          winCombat(run);
        } else {
          startNextTurn(run);
        }
      }
    }
  } else if (run.phase === 'event') {
    resolveEvent(run, action, arg);
  } else if (run.phase === 'reward') {
    applyCharm(run, run.reward.options[Number(arg)]);
    goCamp(run);
  } else if (run.phase === 'camp') {
    if (action === 'descend') {
      enterFloor(run, run.floor + 1);
    } else if (action === 'extract') {
      log(run, 'extracted');
      finishRun(run, 'extracted');
    }
  }

  run.step++;
  run.updatedAt = now;
  return { ok: true };
}

// ---------------------------------------------------------------- cooperação
const MAX_HELPERS = 2;

/**
 * Ajuda de quem assiste à descida (thread pública): uma vez por pessoa, até MAX_HELPERS por
 * descida e só em combate. Com pouca vida, cura 30%; senão, um golpe de 20% da vida do inimigo
 * que nunca termina a luta sozinho (a vitória é sempre de quem desce).
 */
function applyHelp(run, helperId, now = Date.now()) {
  if (!run || isTerminal(run)) return { ok: false, reason: 'finished' };
  if (run.phase !== 'combat' || !run.combat) return { ok: false, reason: 'not_combat' };
  const id = String(helperId);
  if (id === run.ownerId) return { ok: false, reason: 'self' };
  run.helpers = Array.isArray(run.helpers) ? run.helpers : [];
  if (run.helpers.includes(id)) return { ok: false, reason: 'already' };
  if (run.helpers.length >= MAX_HELPERS) return { ok: false, reason: 'limit' };

  run.log = [];
  run.fx = [];
  const p = run.player;
  let kind;
  let amount;
  if (p.hp < p.maxHp / 2) {
    kind = 'heal';
    amount = heal(run, Math.ceil(p.maxHp * 0.3));
    log(run, 'helpedHeal', { user: `<@${id}>`, amount });
  } else {
    kind = 'hit';
    const c = run.combat;
    amount = Math.min(Math.ceil(c.maxHp * 0.2), Math.max(0, c.hp - 1));
    c.hp -= amount;
    fx(run, 'dmgEnemy', { amount });
    log(run, 'helpedHit', { user: `<@${id}>`, amount });
  }
  run.helpers.push(id);
  run.step++;
  run.updatedAt = now;
  return { ok: true, kind, amount };
}

/**
 * Volta da morte depois da oração de outra pessoa: a descida continua na sala em que caiu,
 * fora de combate, com metade da vida e o ouro que sobrou (sem o resgate já pago e o saqueado).
 */
function reviveRun(run, { gold, now = Date.now(), prayerId = null } = {}) {
  const p = run.player;
  p.hp = Math.max(1, Math.ceil(p.maxHp / 2));
  p.gold = Math.max(0, Math.floor(gold));
  p.light = Math.max(p.light, 30);
  p.poison = 0;
  p.poisonTurns = 0;
  const room = run.map?.rooms?.[run.map.pos];
  if (room) room.cleared = true;
  run.phase = 'explore';
  run.outcome = null;
  run.combat = null;
  run.event = null;
  run.reward = null;
  run.confirmForfeit = false;
  run.log = [];
  run.fx = [];
  log(run, 'revived', { user: prayerId ? `<@${prayerId}>` : '' });
  run.step++;
  run.updatedAt = now;
  return run;
}

// ---------------------------------------------------------------- liquidação
function lanternFee(floor) {
  return LANTERN_FEE[floor] || 0;
}

/** Ouro levado para casa antes dos tetos: vencer leva tudo, fugir paga a Taxa da Lanterna, morrer salva 10%. */
function computeGrossPayout(run) {
  const gold = Math.max(0, Math.floor(run.player.gold));
  if (run.outcome === 'victory') return gold;
  if (run.outcome === 'extracted') return Math.floor(gold * (1 - lanternFee(run.floor)));
  return Math.floor(gold * DEATH_SALVAGE);
}

/** Ecos (moeda de talentos, nunca convertida em moedinhas). */
function computeEchoes(run) {
  let echoes = run.stats.guardians * 2 + Math.floor(run.stats.kills / 4);
  if (run.outcome === 'victory') echoes += 5;
  if (echoes === 0 && run.stats.rooms >= 4) echoes = 1;
  return echoes;
}

module.exports = {
  GRID,
  FLOOR_COUNT,
  BASE,
  DARK_THRESHOLD,
  DEATH_SALVAGE,
  NYX_TREASURE,
  MAX_HELPERS,
  createRun,
  applyAction,
  applyHelp,
  reviveRun,
  getAvailableActions,
  getVisibleMap,
  describeIntent,
  computeGrossPayout,
  computeEchoes,
  lanternFee,
  LANTERN_FEE,
  isTerminal,
  isDark,
  moveLightCost,
  potionHealAmount,
  boltCost,
  swipeCost,
  shrineOfferPrice,
  getFloorDef,
  getEnemyDef,
  hasCharm,
  parseKey,
  // expostos para testes
  _internals: { generateFloorMap, nextRandom, applyCharm, startCombat, chooseIntent },
};
