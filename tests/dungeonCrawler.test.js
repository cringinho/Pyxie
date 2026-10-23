const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Isola configuração de módulos, estado da dungeon e economia durante os testes
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-dungeon-'));
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');
const economyFile = path.join(__dirname, '..', 'data', 'economy.json');
const originalEconomy = fs.existsSync(economyFile) ? fs.readFileSync(economyFile, 'utf8') : null;

function restoreEconomy() {
  if (originalEconomy === null) {
    if (fs.existsSync(economyFile)) fs.unlinkSync(economyFile);
  } else {
    fs.writeFileSync(economyFile, originalEconomy, 'utf8');
  }
}

// Qualquer falha síncrona também devolve o economy.json original
process.on('uncaughtException', (err) => {
  restoreEconomy();
  console.error(err);
  process.exit(1);
});

const engine = require('../src/modules/dungeon/dungeonEngine');
const store = require('../src/modules/dungeon/dungeonStore');
const data = require('../src/modules/dungeon/dungeonData');
const economy = require('../src/services/economy');
const { t, TRANSLATIONS } = require('../src/utils/i18n');

store._setDataFileForTests(path.join(tmpDir, 'dungeon.json'));

console.log('🕯️ Iniciando testes das Catacumbas de Veludo (dungeon crawler)...');

const DIRS = Object.values(data.DIRECTIONS);
function neighbors(rooms, key) {
  const { x, y } = engine.parseKey(key);
  return DIRS.map((d) => `${x + d.dx},${y + d.dy}`).filter((k) => rooms[k]);
}

function bfs(rooms, start) {
  const dist = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const k = queue.shift();
    for (const n of neighbors(rooms, k)) {
      if (!dist.has(n)) {
        dist.set(n, dist.get(k) + 1);
        queue.push(n);
      }
    }
  }
  return dist;
}

/** Próximo passo até a sala não visitada mais próxima (ou o guardião, quando tudo foi visto). */
function pathStep(run) {
  const rooms = run.map.rooms;
  const start = run.map.pos;
  const prev = new Map([[start, null]]);
  const queue = [start];
  const goals = [(r) => !r.visited && r.type !== 'guardian', (r) => r.type === 'guardian' && !r.cleared];
  for (const goal of goals) {
    prev.clear();
    prev.set(start, null);
    queue.length = 0;
    queue.push(start);
    while (queue.length) {
      const k = queue.shift();
      if (k !== start && goal(rooms[k])) {
        let cur = k;
        while (prev.get(cur) !== start) cur = prev.get(cur);
        const a = engine.parseKey(start);
        const b = engine.parseKey(cur);
        return Object.entries(data.DIRECTIONS).find(([, d]) => a.x + d.dx === b.x && a.y + d.dy === b.y)[0];
      }
      for (const n of neighbors(rooms, k)) {
        if (!prev.has(n)) {
          prev.set(n, k);
          queue.push(n);
        }
      }
    }
  }
  return null;
}

/** Política simples e determinística para levar um run até uma fase. */
function drive(run, until, maxSteps = 600) {
  for (let i = 0; i < maxSteps && !until(run) && !engine.isTerminal(run); i++) {
    const actions = engine.getAvailableActions(run).filter((a) => a.enabled && !a.id.startsWith('forfeit'));
    const order = ['bolt', 'attack', 'open', 'drink', 'pray', 'jump', 'pick', 'descend'];
    let next = order.map((id) => actions.find((a) => a.id === id)).find(Boolean);
    if (run.phase === 'explore') {
      const dir = pathStep(run);
      next = dir ? { id: 'move', arg: dir } : null;
    }
    if (run.phase === 'event' && run.event.type === 'merchant') next = actions.find((a) => a.id === 'leave');
    next = next || actions.find((a) => a.id === 'leave') || actions[0];
    if (!next) break;
    assert.ok(engine.applyAction(run, next.id, next.arg).ok, `Ação válida recusada: ${next.id}`);
  }
  return run;
}

// 1. Geração procedural dos andares: árvore conectada, guardião na ponta mais distante e salas especiais
for (let seed = 1; seed <= 60; seed++) {
  for (const floorDef of data.FLOORS) {
    const run = { rng: seed * 7919 + floorDef.id, player: { charms: [] }, talents: {} };
    const map = engine._internals.generateFloorMap(run, floorDef.id);
    const keys = Object.keys(map.rooms);
    assert.equal(keys.length, floorDef.rooms, `Andar ${floorDef.id} deve ter ${floorDef.rooms} salas`);
    const dist = bfs(map.rooms, map.start);
    assert.equal(dist.size, keys.length, 'Todas as salas devem ser alcançáveis a partir da entrada');
    const edges = keys.reduce((sum, k) => sum + neighbors(map.rooms, k).length, 0) / 2;
    assert.equal(edges, keys.length - 1, 'O mapa é uma árvore: cada sala adjacente é uma porta');
    const types = keys.map((k) => map.rooms[k].type);
    const guardianKey = keys.find((k) => map.rooms[k].type === 'guardian');
    assert.ok(guardianKey, 'Todo andar tem guardião');
    assert.equal(types.filter((tp) => tp === 'guardian').length, 1);
    assert.equal(map.rooms[guardianKey].enemy, floorDef.guardian);
    assert.equal(neighbors(map.rooms, guardianKey).length, 1, 'Guardião fica numa ponta');
    const maxDeadEndDist = Math.max(...keys.filter((k) => k !== map.start && neighbors(map.rooms, k).length === 1).map((k) => dist.get(k)));
    assert.equal(dist.get(guardianKey), maxDeadEndDist, 'Guardião fica na ponta mais distante');
    if (floorDef.id < data.FLOORS.length) {
      assert.ok(types.includes('treasure'), 'Andares 1-4 têm tesouro trancado');
      assert.ok(types.includes(floorDef.id % 2 === 0 ? 'merchant' : 'shrine'), 'Mercadora nos pares, altar nos ímpares');
      assert.ok(types.includes('candle'), 'Andares 1-4 garantem um estoque de velas');
    } else {
      assert.equal(map.rooms[guardianKey].enemy, 'nyx', 'O último andar guarda a Nyx');
    }
    assert.ok(types.filter((tp) => tp === 'monster').length >= 2, 'Cada andar tem monstros');
    for (const k of keys) {
      const room = map.rooms[k];
      if (room.type === 'monster') assert.ok(floorDef.enemies.includes(room.enemy), 'Monstro pertence ao bioma do andar');
    }
  }
}
console.log('  ✅ 1. 300 andares procedurais válidos (árvore, guardião distante, especiais, ritmo).');

// 2. Determinismo: mesma semente e mesmas ações geram exatamente o mesmo estado (sem rerrolar)
{
  const a = drive(engine.createRun({ ownerId: 'u', seed: 1234, now: 1 }), (r) => r.stats.kills >= 3);
  const b = drive(engine.createRun({ ownerId: 'u', seed: 1234, now: 1 }), (r) => r.stats.kills >= 3);
  const strip = (r) => JSON.stringify({ ...r, updatedAt: 0 });
  assert.equal(strip(a), strip(b), 'Mesma semente + mesmas ações = mesmo resultado');
  const c = engine.createRun({ ownerId: 'u', seed: 4321 });
  assert.notEqual(JSON.stringify(c.map.rooms), JSON.stringify(engine.createRun({ ownerId: 'u', seed: 1234 }).map.rooms));
}
console.log('  ✅ 2. RNG salvo no run: resultados determinísticos.');

// 3. Névoa de guerra, luz e escuridão
{
  const run = engine.createRun({ ownerId: 'u', seed: 42 });
  const visible = engine.getVisibleMap(run);
  const total = Object.keys(run.map.rooms).length;
  assert.ok(visible.rooms.length < total, 'No início só a entrada e as vizinhas aparecem');
  assert.ok(visible.rooms.every((r) => r.visited || run.map.rooms[r.key].seen), 'Nada fora da névoa é desenhado');
  for (const r of visible.rooms.filter((v) => !v.visited)) {
    const type = run.map.rooms[r.key].type;
    if (!['guardian', 'treasure', 'merchant', 'shrine'].includes(type)) assert.equal(r.display, 'unknown');
  }
  run.player.light = engine.DARK_THRESHOLD;
  assert.ok(engine.getVisibleMap(run).rooms.filter((v) => !v.visited).every((v) => v.display === 'unknown'), 'No escuro nada é revelado');
  run.player.charms.push('moth_lantern');
  assert.equal(engine.getVisibleMap(run).rooms.length, total, 'Lanterna de Mariposa revela o andar inteiro');

  const walker = engine.createRun({ ownerId: 'u', seed: 42 });
  const move = engine.getAvailableActions(walker).find((a) => a.id === 'move' && a.enabled);
  const blocked = engine.getAvailableActions(walker).find((a) => a.id === 'move' && !a.enabled);
  const lightBefore = walker.player.light;
  const cost = engine.moveLightCost(walker);
  if (blocked) {
    const snapshot = JSON.stringify(walker);
    assert.deepEqual(engine.applyAction(walker, 'move', blocked.arg), { ok: false, reason: 'disabled' });
    assert.equal(JSON.stringify(walker), snapshot, 'Ação recusada não altera o run');
  }
  assert.ok(engine.applyAction(walker, 'move', move.arg).ok);
  assert.ok(walker.player.light <= lightBefore - cost + 35, 'Andar gasta luz (ou acha velas)');
  assert.equal(walker.step, 1, 'Cada ação válida avança o step');
  assert.deepEqual(engine.applyAction(walker, 'fly'), { ok: false, reason: 'invalid' });
}
console.log('  ✅ 3. Névoa de guerra, luz, escuridão e validação de ações.');

// 4. Combate: intenção telegrafada, defesa, raio lunar, Astaroth, poção, fuga e morte
{
  const run = engine.createRun({ ownerId: 'u', seed: 99 });
  engine._internals.startCombat(run, 'rat', { roomKey: run.map.start, kind: 'monster' });
  run.combat.intent = { type: 'attack', mult: 1 };
  run.player.dodge = 0;
  const expected = engine.describeIntent(run).perHit;
  assert.equal(expected, 3, 'Ratinho telegrafa 3 de dano');
  const hpBefore = run.player.hp;
  run.combat.dodge = 0;
  assert.ok(engine.applyAction(run, 'attack').ok);
  if (run.phase === 'combat') assert.equal(run.player.hp, hpBefore - expected, 'O dano recebido é exatamente o telegrafado');

  const g = engine.createRun({ ownerId: 'u', seed: 5 });
  engine._internals.startCombat(g, 'granny_spider', { roomKey: g.map.start, kind: 'guardian' });
  g.combat.intent = { type: 'attack', mult: 1 };
  const blockHp = g.player.hp;
  assert.ok(engine.applyAction(g, 'guard').ok);
  assert.equal(g.player.hp, blockHp, 'Defender bloqueia o ataque do guardião (4 < 5 de bloqueio)');
  assert.equal(engine.getAvailableActions(g).find((a) => a.id === 'flee').enabled, false, 'Não se foge de guardiões');

  g.combat.shield = 50;
  g.player.spark = 3;
  const before = g.combat.hp;
  assert.ok(engine.applyAction(g, 'bolt').ok);
  assert.ok(g.combat.hp < before, 'Raio Lunar ignora o escudo');
  assert.equal(g.combat.shield, 50);

  g.combat.intent = { type: 'heavy', mult: 2.2 };
  const full = engine.describeIntent(g).perHit;
  g.player.spark = 1;
  g.combat.distracted = true;
  assert.equal(engine.describeIntent(g).perHit, Math.round(g.combat.atk * 2.2 * 0.5), 'Astaroth corta o golpe pela metade');
  assert.ok(engine.describeIntent(g).perHit < full);
  g.combat.distracted = false;

  g.player.hp = 5;
  const potions = g.player.potions;
  g.combat.intent = { type: 'defend', value: 2 };
  assert.ok(engine.applyAction(g, 'potion').ok);
  assert.equal(g.player.potions, potions - 1);
  assert.ok(g.player.hp > 5, 'Poção cura em combate');

  g.player.hp = 1;
  g.combat.intent = { type: 'attack', mult: 3 };
  g.player.dodge = 0;
  assert.ok(engine.applyAction(g, 'attack').ok);
  assert.equal(g.phase, 'dead', 'Vida zerada encerra o run');
  assert.equal(engine.isTerminal(g), true);
  assert.deepEqual(engine.applyAction(g, 'attack'), { ok: false, reason: 'finished' });

  const c = engine.createRun({ ownerId: 'u', seed: 8 });
  engine._internals.startCombat(c, 'grimoire', { roomKey: c.map.start, kind: 'monster' });
  c.combat.intent = { type: 'charge' };
  c.combat.dodge = 0;
  engine.applyAction(c, 'guard');
  assert.equal(c.combat.intent.type, 'heavy', 'Carregar leva sempre a um golpe pesado telegrafado');
}
console.log('  ✅ 4. Combate por turnos com intenções, defesa, magia, Astaroth, poção e morte.');

// 5. Fogueira, bênçãos, fuga e vitória sobre a Nyx
{
  const run = drive(engine.createRun({ ownerId: 'u', seed: 7, talents: { vitality: 3, wand: 1 } }), (r) => r.phase === 'reward' || r.phase === 'camp');
  assert.ok(['reward', 'camp'].includes(run.phase), 'Vencer o guardião leva à recompensa/fogueira');
  if (run.phase === 'reward') {
    assert.equal(run.reward.options.length, 3);
    assert.equal(new Set(run.reward.options).size, 3, 'Três bênçãos diferentes');
    engine.applyAction(run, 'pick', '0');
  }
  assert.equal(run.phase, 'camp');
  assert.equal(run.player.charms.length >= 1, true);
  const camp = engine.getAvailableActions(run).map((a) => a.id);
  assert.deepEqual(camp, ['descend', 'extract']);
  const gold = run.player.gold;
  engine.applyAction(run, 'extract');
  assert.equal(run.outcome, 'extracted');
  assert.equal(engine.computeGrossPayout(run), Math.floor(gold * (1 - engine.lanternFee(1))), 'Fuga no andar 1 paga a Taxa da Lanterna de 30%');

  assert.equal(engine.lanternFee(1), 0.3);
  assert.equal(engine.lanternFee(2), 0.2);
  assert.equal(engine.lanternFee(3), 0.1);
  assert.equal(engine.lanternFee(4), 0);

  const boss = engine.createRun({ ownerId: 'u', seed: 3 });
  boss.floor = 5;
  engine._internals.startCombat(boss, 'nyx', { roomKey: boss.map.start, kind: 'guardian' });
  assert.equal(boss.combat.boss, true);
  boss.combat.hp = 1;
  boss.combat.dodge = 0;
  boss.player.gold = 100;
  assert.equal(engine.applyAction(boss, 'bolt').reason, 'disabled', 'Raio Lunar exige 2 de brilho');
  boss.player.spark = 2;
  assert.ok(engine.applyAction(boss, 'bolt').ok);
  assert.equal(boss.phase, 'victory', 'Derrotar a Nyx vence as catacumbas');
  assert.ok(boss.player.gold >= 100 + engine.NYX_TREASURE, 'Vitória rende o Tesouro do Coração');
  assert.equal(engine.computeGrossPayout(boss), boss.player.gold, 'Vitória leva todo o ouro');
  assert.ok(engine.computeEchoes(boss) >= 5);

  const dead = engine.createRun({ ownerId: 'u', seed: 3 });
  dead.player.gold = 99;
  dead.outcome = 'dead';
  dead.phase = 'dead';
  assert.equal(engine.computeGrossPayout(dead), 9, 'Morrer salva só 10%');
}
console.log('  ✅ 5. Fogueira, bênçãos, Taxa da Lanterna, salvamento e vitória sobre a Nyx.');

// 6. Todas as chaves de log, intenção e eventos do motor existem em PT e EN
{
  const engineSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'modules', 'dungeon', 'dungeonEngine.js'), 'utf8');
  const logKeys = [...new Set([...engineSrc.matchAll(/log\(run, '([a-zA-Z]+)'/g)].map((m) => m[1]))];
  assert.ok(logKeys.length > 60, 'O motor narra dezenas de acontecimentos');
  for (const key of logKeys) {
    for (const lang of ['pt', 'en']) {
      assert.ok(typeof TRANSLATIONS[lang].dungeon.log[key] === 'string', `dungeon.log.${key} ausente em ${lang}`);
    }
  }
  for (const type of ['attack', 'heavy', 'multi', 'drain', 'poison', 'steal', 'web', 'charge', 'defend', 'heal']) {
    assert.ok(TRANSLATIONS.pt.dungeon.intent[type] && TRANSLATIONS.en.dungeon.intent.short[type], `Intenção ${type} sem tradução`);
  }
  for (const type of ['chest', 'treasure', 'merchant', 'shrine', 'fountain', 'trap']) {
    assert.ok(TRANSLATIONS.pt.dungeon.titles[type] && TRANSLATIONS.en.dungeon.render[type], `Evento ${type} sem tradução`);
  }
  for (const group of [data.ENEMIES, data.CHARMS, data.TALENTS]) {
    for (const [id, entry] of Object.entries(group)) {
      assert.ok(entry.name.pt && entry.name.en, `${id} precisa de nome em PT e EN`);
      if (entry.desc) assert.ok(entry.desc.pt && entry.desc.en, `${id} precisa de descrição em PT e EN`);
    }
  }
  for (const f of data.FLOORS) assert.ok(f.name.pt && f.name.en && f.flavor.pt && f.flavor.en);
  for (const f of data.EMPTY_FLAVORS) assert.ok(f.pt && f.en);
}
console.log('  ✅ 6. Narrativa e conteúdo 100% bilíngues (PT/EN).');

// 7. Emojis do repertório do bot: as chaves do conteúdo resolvem Application Emojis reais
{
  const { getEmoji } = require('../src/utils/appEmojis');
  const keys = new Set();
  for (const group of [data.ENEMIES, data.CHARMS]) for (const entry of Object.values(group)) keys.add(entry.emoji);
  for (const k of ['ASTAROTH', 'ASTAROTH_HAPPY', 'DUNGEON_CANDLE', 'DUNGEON_GOLD', 'DUNGEON_KEY', 'DUNGEON_SKULL']) keys.add(k);
  for (const key of keys) {
    assert.ok(/^<a?:[\w~]+:\d+>$/.test(getEmoji(key)), `Emoji ${key} deve vir do catálogo de Application Emojis (veio ${getEmoji(key)})`);
  }
  const portal = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'appEmojis.js'), 'utf8');
  for (const file of ['dungeonData.js', 'dungeonEngine.js', 'dungeonViews.js', 'dungeonRenderer.js', 'dungeonStore.js', 'index.js']) {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'modules', 'dungeon', file), 'utf8');
    assert.ok(!src.includes('1548444170488778954') && !src.includes('portalframe98'), `${file} não pode usar o portal do Minecraft`);
  }
  assert.ok(portal.includes("ASTAROTH: { name: 'astaroth_main_icon'"));
}
console.log('  ✅ 7. Emojis resolvidos pelo appEmojis.js (Astaroth e repertório pixel do bot).');

// 8. Economia: ticket, limite diário, tetos, step anti-duplo-clique e liquidação única
const U = 'test_dungeon_player';
economy.setUserBalance(U, 120);
store.setSettingsProvider(() => ({ ticket: 50, dailyEntries: 2, runPayoutCap: 40, dailyPayoutCap: 55 }));
const day = Date.parse('2026-10-20T15:00:00Z');
{
  let res = store.startRun(U, { lang: 'pt', now: day, seed: 7 });
  assert.equal(res.ok, true, 'Primeira descida abre');
  assert.equal(economy.getBalance(U), 70, 'Ticket de 50 debitado');
  assert.equal(store.startRun(U, { now: day }).reason, 'active', 'Só um run ativo por vez');

  const run = res.run;
  const firstMove = engine.getAvailableActions(run).find((a) => a.id === 'move' && a.enabled);
  assert.equal(store.performAction(U, run.id, 99, 'move', firstMove.arg, day).reason, 'stale', 'Step errado é recusado');
  assert.equal(store.performAction('test_intruder', run.id, 0, 'move', firstMove.arg, day).reason, 'missing', 'Outra pessoa não joga o run');
  res = store.performAction(U, run.id, 0, 'move', firstMove.arg, day);
  assert.equal(res.ok, true);
  assert.equal(store.performAction(U, run.id, 0, 'move', firstMove.arg, day).reason, 'stale', 'Clique duplo no mesmo botão é recusado');

  // Leva o run salvo até a fogueira e foge com o ouro, respeitando o teto por run (40)
  let live = store.getActiveRun(U, day);
  drive(live, (r) => r.phase === 'camp');
  live.player.gold = 300;
  live.phase = 'camp';
  live.confirmForfeit = false;
  const stateFile = path.join(tmpDir, 'dungeon.json');
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  state.runs[live.id] = live;
  fs.writeFileSync(stateFile, JSON.stringify(state));
  res = store.performAction(U, live.id, live.step, 'extract', null, day);
  assert.equal(res.ok, true);
  assert.equal(res.settlement.payout, 40, 'Teto por descida aplicado');
  assert.equal(res.settlement.cappedBy, 'run');
  assert.equal(economy.getBalance(U), 110, 'Pagamento creditado uma única vez');
  assert.equal(store.performAction(U, live.id, live.step, 'extract', null, day).reason, 'missing', 'Run liquidado não paga de novo');
  assert.equal(economy.getBalance(U), 110);

  // Segunda descida do dia: o teto diário (55) deixa só 15
  res = store.startRun(U, { now: day + 1000, seed: 8 });
  assert.equal(res.ok, true);
  const second = store.getActiveRun(U, day + 1000);
  second.player.gold = 300;
  second.phase = 'camp';
  const st2 = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  st2.runs[second.id] = second;
  fs.writeFileSync(stateFile, JSON.stringify(st2));
  res = store.performAction(U, second.id, second.step, 'extract', null, day + 2000);
  assert.equal(res.settlement.payout, 15, 'Teto diário aplicado');
  assert.equal(res.settlement.cappedBy, 'daily');
  assert.equal(store.startRun(U, { now: day + 3000 }).reason, 'limit', 'Limite de descidas por dia');

  // Novo dia BRT: limite renovado; sem saldo suficiente o ticket é recusado sem debitar
  economy.setUserBalance(U, 10);
  res = store.startRun(U, { now: day + 24 * 60 * 60 * 1000 });
  assert.equal(res.reason, 'coins');
  assert.equal(economy.getBalance(U), 10, 'Saldo insuficiente não debita nada');

  // Run abandonado por mais de 48h é resgatado pelo Astaroth (10%)
  economy.setUserBalance(U, 100);
  const day3 = day + 2 * 24 * 60 * 60 * 1000;
  res = store.startRun(U, { now: day3, seed: 9 });
  assert.equal(res.ok, true);
  const st3 = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  st3.runs[res.run.id].player.gold = 200;
  fs.writeFileSync(stateFile, JSON.stringify(st3));
  const lobby = store.getLobbyStatus(U, day3 + 49 * 60 * 60 * 1000);
  assert.equal(lobby.activeRun, null, 'Run esquecido é encerrado');
  assert.equal(lobby.abandoned.outcome, 'abandoned');
  assert.equal(lobby.abandoned.payout, 20, 'Resgate do Astaroth salva 10%');
  assert.equal(economy.getBalance(U), 70, '100 - 50 de ticket + 20 de resgate');

  // Talentos com Ecos
  const status = store.getLobbyStatus(U, day3 + 50 * 60 * 60 * 1000);
  assert.ok(status.echoes >= 0);
  const stFile = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  stFile.players[U].echoes = 5;
  fs.writeFileSync(stateFile, JSON.stringify(stFile));
  assert.deepEqual(store.buyTalent(U, 'vitality'), { ok: true, rank: 1, cost: 4, echoes: 1 });
  assert.equal(store.buyTalent(U, 'vitality').reason, 'echoes');
  assert.equal(store.buyTalent(U, 'nope').reason, 'invalid');
  const stMax = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  stMax.players[U].echoes = 100;
  stMax.players[U].talents.wand = 1;
  fs.writeFileSync(stateFile, JSON.stringify(stMax));
  assert.equal(store.buyTalent(U, 'wand').reason, 'max', 'Varinha Treinada tem um único nível');
  const withTalent = engine.createRun({ ownerId: U, talents: { vitality: 1, wand: 1 }, seed: 1 });
  assert.equal(withTalent.player.maxHp, engine.BASE.hp + 3);
  assert.equal(withTalent.player.atk, engine.BASE.atk + 1);

  const stats = store.getDungeonStats();
  assert.equal(stats.totals.runs, 3);
  assert.equal(stats.totals.coinsIn, 150);
  assert.equal(stats.totals.coinsOut, 75);
  assert.equal(stats.totals.abandoned, 1);
  assert.equal(stats.activeRuns, 0);
  assert.ok(store.getHallOfFame().every((h) => !economy.isTestUser(h.userId)), 'Contas de teste ficam fora do Hall');

  assert.deepEqual(store.sanitizeSettings({ ticket: '75', dailyEntries: 0, runPayoutCap: 999999, hack: 1 }), { ticket: 75, dailyEntries: 1, runPayoutCap: 5000 });
}
store.setSettingsProvider(null);
console.log('  ✅ 8. Ticket de 50, limite diário, tetos, anti-duplo-clique, liquidação única, resgate e talentos.');

// 9. Interface: embeds no padrão Pyxie, botões válidos para mobile e IDs dentro do limite
const views = require('../src/modules/dungeon/dungeonViews');
const { ButtonStyle } = require('discord.js');
function checkEmbed(embed, label) {
  const json = embed.toJSON();
  const words = json.title.trim().split(/\s+/);
  assert.ok(words.length <= 9, `${label}: título curto (emoji + até 8 palavras): ${json.title}`);
  assert.ok(/^\p{Extended_Pictographic}/u.test(json.title), `${label}: título começa com emoji`);
  assert.ok(!/━|═|-{10,}/.test(json.description || ''), `${label}: sem divisores ASCII legados`);
  assert.ok(json.footer && typeof json.footer.text === 'string', `${label}: footer { text }`);
  assert.ok((json.description || '').length <= 4096);
}
function checkComponents(rows, label) {
  assert.ok(rows.length <= 5, `${label}: no máximo 5 linhas`);
  for (const row of rows) {
    const comps = row.toJSON().components;
    assert.ok(comps.length >= 1 && comps.length <= 5, `${label}: 1 a 5 botões por linha`);
    for (const c of comps) {
      if (c.style !== ButtonStyle.Link) {
        assert.ok(c.custom_id.length <= 100, `${label}: custom_id até 100 caracteres`);
        assert.ok(views.parseCustomId(c.custom_id), `${label}: custom_id interpretável`);
      }
      if (c.label) assert.ok(c.label.length <= 34, `${label}: rótulo curto (${c.label})`);
      assert.ok(c.label || c.emoji, `${label}: botão com rótulo ou emoji`);
    }
  }
}
{
  const source = { guild: { name: 'Servidor Teste' }, lang: 'pt' };
  for (const lang of ['pt', 'en']) {
    const src = { ...source, lang };
    for (const seed of [7, 11, 21, 33, 45]) {
      const run = engine.createRun({ ownerId: '100000000000000001', lang, seed, talents: { vitality: 3 } });
      const seen = new Set();
      for (let i = 0; i < 400 && !engine.isTerminal(run); i++) {
        const tag = run.phase + (run.event ? `:${run.event.type}` : '');
        if (!seen.has(tag)) {
          seen.add(tag);
          checkEmbed(views.buildRunEmbed(run, src, lang), `${lang}/${tag}`);
          checkComponents(views.buildRunComponents(run, lang), `${lang}/${tag}`);
          const text = views.buildRenderText(run, lang);
          assert.ok(!Object.values(text).some((v) => typeof v === 'string' && v.startsWith('dungeon.')), 'Textos da cena traduzidos');
        }
        for (const entry of run.log) assert.ok(!views.formatLogEntry(entry, lang).startsWith('dungeon.'), `Log ${entry.k} traduzido`);
        drive(run, () => false, 1);
      }
      checkEmbed(views.buildRunEmbed(run, src, lang), `${lang}/end`);
      checkComponents(views.buildRunComponents(run, lang), `${lang}/end`);
    }
    const run2 = engine.createRun({ ownerId: '100000000000000001', seed: 1 });
    engine.applyAction(run2, 'forfeit');
    checkEmbed(views.buildRunEmbed(run2, src, lang), `${lang}/confirm`);
    checkComponents(views.buildRunComponents(run2, lang), `${lang}/confirm`);
    const lobby = views.buildLobbyView({ id: '100000000000000001' }, src);
    checkEmbed(lobby.embeds[0], `${lang}/lobby`);
    checkComponents(lobby.components, `${lang}/lobby`);
    checkEmbed(views.buildHelpView(src).embeds[0], `${lang}/help`);
    const talents = views.buildTalentsView({ id: '100000000000000001' }, src);
    checkEmbed(talents.embeds[0], `${lang}/talents`);
    checkComponents(talents.components, `${lang}/talents`);
    checkEmbed(views.buildHallView(src).embeds[0], `${lang}/hall`);
  }
  const parsed = views.parseCustomId('dgn:a:123:abcdef:4:buy:2');
  assert.deepEqual(parsed, { kind: 'a', ownerId: '123', tag: 'abcdef', step: 4, action: 'buy', arg: '2' });
  assert.equal(views.parseCustomId('anq:1:2'), null);
}
console.log('  ✅ 9. Embeds (título curto, emoji, sem ASCII, footer) e botões mobile-friendly em PT e EN.');

// 10. Catálogo, módulo, introspector, embeds registrados e slash localizado
{
  const moduleManager = require('../src/services/moduleManager');
  const discovered = moduleManager.discoverModules();
  assert.ok(discovered.has('dungeon'), 'Módulo dungeon descoberto em src/modules/');
  const mod = discovered.get('dungeon');
  assert.equal(mod.defaultEnabled, true);
  assert.equal(mod.commands[0].name, 'py-dungeon');
  const meta = moduleManager.getAllModules().find((m) => m.id === 'dungeon');
  assert.equal(meta.commandsCount, 1);
  assert.equal(meta.nameLocalized.en, 'Velvet Catacombs');

  const { COMMAND_CATEGORY_MAP } = require('../src/commands/commandHelpers');
  for (const alias of ['py-dungeon', ...mod.commands[0].aliases]) assert.equal(COMMAND_CATEGORY_MAP[alias], 'economia', `${alias} no catálogo`);
  assert.ok(mod.commands[0].aliases.includes('masmorra') && mod.commands[0].aliases.includes('dungeon'), 'Aliases PT e EN');

  const json = mod.commands[0].data.toJSON();
  assert.ok(json.description.length <= 100 && json.description_localizations['pt-BR'].length <= 100);

  const { getIntrospectedCommandMap } = require('../src/services/commandIntrospector');
  const introspected = getIntrospectedCommandMap(true).get('py-dungeon');
  assert.ok(introspected, 'Introspector enxerga o comando');
  assert.equal(introspected.moduleId, 'dungeon');
  assert.equal(introspected.discordScope, 'global');
  assert.equal(introspected.accessLevel, 'public');

  const { EMBED_REGISTRY } = require('../src/utils/embedRegistry');
  for (const id of ['dungeon_lobby', 'dungeon_explore', 'dungeon_combat', 'dungeon_end']) assert.ok(EMBED_REGISTRY.has(id), `Embed ${id} registrado`);

  const { queryPartition, METADATA_DICTIONARY } = require('../src/services/visualDbExplorer');
  const record = queryPartition({ partition: 'global' }).records.find((r) => r.id === 'dungeon_state');
  assert.ok(record && record.status.includes('Ativo'), 'Visual DB expõe o estado real da dungeon');
  assert.ok(METADATA_DICTIONARY.dungeonCoinsOut, 'Dicionário de metadados documenta os campos');
}
console.log('  ✅ 10. Módulo, catálogo, introspector, embeds e Visual DB sincronizados.');

// 11. Guardrail dos agentes (.agents/hooks): os arquivos novos passam no veto PreToolUse
{
  const hook = path.join(__dirname, '..', '.agents', 'hooks', 'pre-tool-validator.sh');
  const bash = spawnSync('bash', ['--version']);
  if (fs.existsSync(hook) && bash.status === 0) {
    const files = ['index.js', 'dungeonData.js', 'dungeonEngine.js', 'dungeonStore.js', 'dungeonViews.js', 'dungeonRenderer.js', 'commands/pyDungeon.js'];
    for (const rel of files) {
      const abs = path.join(__dirname, '..', 'src', 'modules', 'dungeon', rel);
      const candidate = abs.replace(/\.js$/, '.hookcheck.js');
      const payload = JSON.stringify({ toolCall: { args: { TargetFile: candidate, CodeContent: fs.readFileSync(abs, 'utf8') } } });
      const out = spawnSync('bash', [hook], { input: payload, encoding: 'utf8' });
      assert.ok(/"allow_tool": true/.test(out.stdout), `Hook vetou ${rel}: ${out.stdout}`);
    }
    console.log('  ✅ 11. Hook PreToolUse aprova os 7 arquivos do módulo.');
  } else {
    console.log('  ⏭️ 11. bash indisponível: verificação do hook pulada.');
  }
}

(async () => {
  try {
    // 12. Renderizador pixel art: PNG 800x640 em todas as fases, rápido o bastante para o Discord
    const { renderDungeonScene, RENDER_WIDTH, RENDER_HEIGHT } = require('../src/modules/dungeon/dungeonRenderer');
    assert.equal(RENDER_WIDTH, 800);
    assert.equal(RENDER_HEIGHT, 640);
    const samples = [];
    const r1 = engine.createRun({ ownerId: 'u', seed: 7, talents: { vitality: 3 } });
    samples.push(JSON.parse(JSON.stringify(r1)));
    drive(r1, (r) => r.phase === 'combat');
    samples.push(JSON.parse(JSON.stringify(r1)));
    drive(r1, (r) => r.phase === 'camp' || r.phase === 'reward');
    samples.push(JSON.parse(JSON.stringify(r1)));
    drive(r1, () => false);
    samples.push(r1);
    for (const sample of samples) {
      const started = Date.now();
      const png = await renderDungeonScene(sample, { lang: 'pt', text: views.buildRenderText(sample, 'pt') });
      assert.ok(Buffer.isBuffer(png) && png.subarray(1, 4).toString() === 'PNG', `Cena ${sample.phase} gera PNG`);
      assert.equal(png.readUInt32BE(16), 800);
      assert.equal(png.readUInt32BE(20), 640);
      assert.ok(Date.now() - started < 2000, 'Render abaixo do tempo limite');
    }
    console.log('  ✅ 12. Renderizador gera cenas 800x640 em todas as fases.');

    // 13. Fluxo completo pelos botões do Discord (mock de interação), com liquidação real
    const cmd = require('../src/modules/dungeon/commands/pyDungeon');
    const P = 'test_dungeon_flow';
    economy.setUserBalance(P, 200);
    const mockInteraction = (customId, userId = P) => {
      const calls = [];
      return {
        customId,
        user: { id: userId },
        guild: { id: 'test_guild', name: 'Servidor Teste' },
        guildId: 'test_guild',
        isButton: () => true,
        replied: false,
        deferred: false,
        reply: async (p) => calls.push(['reply', p]),
        update: async (p) => calls.push(['update', p]),
        followUp: async (p) => calls.push(['followUp', p]),
        calls,
      };
    };
    let i = mockInteraction(`dgn:l:${P}:start`);
    assert.equal(cmd.isDungeonInteraction(i), true);
    await cmd.handleDungeonInteraction(i);
    assert.equal(i.calls[0][0], 'update', 'Iniciar transforma o menu na tela do run');
    assert.equal(i.calls[0][1].files.length, 1, 'Cena pixel art anexada');
    assert.ok(i.calls[0][1].embeds[0].toJSON().image.url.startsWith('attachment://'));
    assert.equal(economy.getBalance(P), 150);

    const other = mockInteraction(`dgn:l:${P}:start`, 'test_dungeon_other');
    await cmd.handleDungeonInteraction(other);
    assert.equal(other.calls[0][0], 'reply');
    assert.equal(other.calls[0][1].flags, 64, 'Outra pessoa recebe aviso privado');

    let active = store.getActiveRun(P);
    let finalPayload = null;
    for (let step = 0; step < 600 && active; step++) {
      const actions = engine.getAvailableActions(active).filter((a) => a.enabled && !a.id.startsWith('forfeit'));
      let next = ['bolt', 'attack', 'open', 'drink', 'jump', 'pick', 'extract'].map((id) => actions.find((a) => a.id === id)).find(Boolean);
      if (active.phase === 'explore') next = { id: 'move', arg: pathStep(active) };
      if (active.phase === 'event' && ['merchant', 'shrine'].includes(active.event.type)) next = actions.find((a) => a.id === 'leave');
      next = next || actions.find((a) => a.id === 'leave') || actions[0];
      i = mockInteraction(views.actionId(active, next.id, next.arg));
      await cmd.handleDungeonInteraction(i);
      assert.equal(i.calls[0][0], 'update', `Ação ${next.id} atualiza a mensagem`);
      finalPayload = i.calls[0][1];
      active = store.getActiveRun(P);
    }
    assert.equal(active, null, 'O run termina (fuga ou derrota)');
    const endEmbed = finalPayload.embeds[0].toJSON();
    assert.ok(/Moedinhas recebidas|Coins received/.test(endEmbed.description), 'Tela final mostra a liquidação');
    const last = store.getLobbyStatus(P).lastRun;
    assert.equal(economy.getBalance(P), 150 + last.payout, 'Saldo final = ticket debitado + pagamento');

    const stale = mockInteraction(`dgn:a:${P}:zzzzzz:0:attack`);
    await cmd.handleDungeonInteraction(stale);
    assert.equal(stale.calls[0][0], 'update', 'Botão de run encerrado volta ao menu');
    for (const what of ['help', 'tal', 'hall']) {
      const it = mockInteraction(`dgn:l:${P}:${what}`);
      await cmd.handleDungeonInteraction(it);
      assert.equal(it.calls[0][1].flags, 64, `${what} abre em modo privado`);
    }
    console.log('  ✅ 13. Fluxo completo pelos botões: início, jogo, liquidação, botões antigos e telas privadas.');

    restoreEconomy();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('🎉 tests/dungeonCrawler.test.js concluído com 100% de sucesso!');
    process.exit(0);
  } catch (err) {
    restoreEconomy();
    console.error(err);
    process.exit(1);
  }
})();
