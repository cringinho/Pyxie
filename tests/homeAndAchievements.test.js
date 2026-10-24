const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Casinha da Pyxie, cofre de itens, drops das Catacumbas e conquistas com títulos especiais.
 * Casinhas, cofre e conquistas usam um diretório temporário (PYXIE_DATA_DIR). As moedinhas
 * ficam no data/economy.json real, então as contas de teste são apagadas no fim.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-home-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const catalog = require('../src/modules/home/homeCatalog');
const engine = require('../src/modules/home/homeEngine');
const store = require('../src/modules/home/homeStore');
const views = require('../src/modules/home/homeViews');
const { renderHome, renderShelf, WIDTH, HEIGHT } = require('../src/modules/home/homeRenderer');
const { getSprite, SHEETS } = require('../src/modules/home/homeSprites');
const pyHome = require('../src/modules/home/commands/pyHome');
const { rollDrops, POOLS } = require('../src/modules/dungeon/dungeonDrops');
const achievements = require('../src/services/achievements');
const { ACHIEVEMENTS, TIERS } = require('../src/data/achievementsCatalog');
const { ACHIEVEMENT_TITLES } = require('../src/data/achievementTitles');
const { stylize, formatStyledTitle, TITLE_STYLES } = require('../src/utils/fancyText');
const { t } = require('../src/utils/i18n');

const runId = Date.now();
const userA = `user_test_home_a_${runId}`;
const userB = `user_test_home_b_${runId}`;
const userC = `user_test_home_c_${runId}`;
const testUsers = [userA, userB, userC];
const ecoFile = path.join(__dirname, '..', 'data', 'economy.json');

console.log('🏡 Iniciando testes da Casinha, cofre de itens e conquistas...');

function mockInteraction({ userId, customId, values = null, kind = 'button', lang = 'pt' }) {
  const calls = [];
  const interaction = {
    customId,
    values,
    user: { id: userId, username: `u${userId.slice(-4)}`, globalName: null },
    member: { displayName: `Pessoa ${userId.slice(-4)}` },
    guild: { name: 'Servidor Teste' },
    guildId: null,
    locale: lang === 'en' ? 'en-US' : 'pt-BR',
    replied: false,
    deferred: false,
    isButton: () => kind === 'button',
    isStringSelectMenu: () => kind === 'select',
    isRepliable: () => true,
    update: async (payload) => { calls.push(['update', payload]); interaction.replied = true; },
    reply: async (payload) => { calls.push(['reply', payload]); interaction.replied = true; },
    followUp: async (payload) => { calls.push(['followUp', payload]); },
  };
  return { interaction, calls };
}

async function run() {
  // 1. Catálogo e arte
  const ids = new Set();
  for (const entry of catalog.ITEMS) {
    assert.ok(!ids.has(entry.id), `Item duplicado: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(entry.name.pt && entry.name.en, `${entry.id}: nome PT/EN.`);
    assert.ok(catalog.RARITIES[entry.rarity], `${entry.id}: raridade válida.`);
    assert.ok(entry.footprint.every((n) => Number.isInteger(n) && n >= 1), `${entry.id}: footprint inteiro.`);
    for (const set of entry.sets) assert.ok(catalog.SETS[set], `${entry.id}: conjunto ${set} existe.`);
    if (entry.source === 'shop') assert.ok(entry.price?.coins > 0, `${entry.id}: item de loja custa moedinhas.`);
    if (entry.source === 'premium') {
      assert.ok(entry.price?.beans > 0, `${entry.id}: premium custa feijões.`);
      assert.equal(entry.tradable, false, `${entry.id}: premium não é trocável.`);
    }
    if (['dungeon', 'achievement', 'starter'].includes(entry.source)) assert.equal(entry.price, null, `${entry.id}: não está à venda.`);
    if (['achievement', 'starter'].includes(entry.source)) assert.equal(entry.tradable, false, `${entry.id}: vinculado à conta.`);
    const sprite = await getSprite(entry.sprite);
    assert.ok(sprite.width >= 16 && sprite.height >= 16, `${entry.id}: sprite desenhado.`);
  }
  assert.ok(catalog.ITEMS.length >= 150, `Catálogo amplo (${catalog.ITEMS.length} itens).`);
  assert.ok(catalog.ITEMS.filter((e) => e.kind === 'pet').length >= 40, 'Ao menos 40 pets.');
  for (const id of catalog.STARTER_ITEMS) assert.ok(catalog.getItem(id), `Kit inicial: ${id}.`);
  const credits = fs.readFileSync(path.join(__dirname, '..', 'assets', 'home', 'CREDITS.md'), 'utf8');
  for (const sheet of Object.values(SHEETS)) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'home', 'sheets', sheet.file)), `Folha ${sheet.file} no repositório.`);
    assert.ok(credits.includes(sheet.file), `${sheet.file} creditada (CC0).`);
  }
  console.log(`  ✅ 1. Catálogo com ${catalog.ITEMS.length} itens PT/EN, preços coerentes e arte CC0 creditada.`);

  // 2. Regras do quarto
  const P = (uid, itemId, x, y) => ({ uid, itemId, x, y });
  assert.equal(engine.validatePlacement([], 'table_dining', 10, 0).reason, 'bounds', 'Mesa 3x1 não passa da borda.');
  assert.equal(engine.validatePlacement([], 'window_tall', 0, 1).reason, 'bounds', 'Janelão 1x2 só cabe na parede inteira.');
  assert.equal(engine.validatePlacement([P('a', 'chair_wood', 3, 3)], 'table_small', 3, 3).reason, 'occupied');
  assert.ok(engine.validatePlacement([P('a', 'chair_wood', 3, 0)], 'window', 3, 0).ok, 'Parede e piso são grades separadas.');
  assert.ok(engine.validatePlacement([P('a', 'rug_square_brown', 0, 0)], 'bed_orange', 0, 0).ok, 'Tapete fica por baixo dos móveis.');
  assert.ok(engine.validatePlacement([P('a', 'pet_bed_orange', 1, 1)], 'pet_bunny', 1, 1).ok, 'Pet deita na caminha.');
  assert.equal(engine.validatePlacement([P('a', 'pet_bed_orange', 1, 1), P('b', 'pet_bunny', 1, 1)], 'pet_fox', 1, 1).reason, 'occupied', 'Dois pets não dividem a caminha.');
  assert.equal(engine.validatePlacement([P('a', 'chair_wood', 1, 1)], 'pet_bunny', 1, 1).reason, 'occupied', 'Pet não sobe em cadeira.');
  const sixPets = Array.from({ length: 6 }, (_, i) => P(`p${i}`, 'slime_green', i, 5));
  assert.equal(engine.validatePlacement(sixPets, 'pet_bunny', 0, 0).reason, 'pets', 'Limite de pets.');
  assert.deepEqual(engine.findFreeSpot([P('a', 'chair_wood', 0, 0)], 'chair_wood'), { x: 1, y: 0 });

  const themed = {
    wallpaper: 'wp_lilac_stripes', flooring: 'fl_lilac_wood', likes: 3,
    placements: [P('1', 'chair_lilac', 0, 0), P('2', 'bed_lilac', 1, 0)],
  };
  const charm = engine.computeCharm(themed);
  assert.equal(charm.activeSets[0].id, 'lilas', '4 peças lilás ativam o conjunto Sonho Lilás.');
  assert.equal(charm.breakdown.sets, engine.SET_BONUS);
  assert.equal(charm.breakdown.likes, 3);

  const shopA = engine.getDailyShop('2026-10-24');
  assert.deepEqual(engine.getDailyShop('2026-10-24'), shopA, 'Loja do dia é igual para todo mundo.');
  assert.notDeepEqual(engine.getDailyShop('2026-10-25').items, shopA.items, 'Loja muda no dia seguinte.');
  const shopEntries = shopA.items.map(catalog.getItem);
  assert.equal(shopEntries.filter((e) => e.price.coins).length, 8);
  assert.equal(shopEntries.filter((e) => e.price.beans).length, 2);
  assert.ok(shopEntries.some((e) => e.kind === 'pet' && e.price.coins), 'Sempre há um pet por moedinhas.');
  assert.equal(engine.brtDayKey(Date.UTC(2026, 9, 25, 2)), '2026-10-24', 'Dia vira à meia-noite de Brasília.');
  console.log('  ✅ 2. Grade, colisões, pets em caminhas, Charme com conjuntos e loja do dia determinística.');

  // 3. Cofre: numeração, tiragem limitada e estatísticas
  const legendary = vault.grantItem(userC, 'pet_unicorn', { source: 'dungeon' });
  assert.equal(legendary.ok, true);
  assert.equal(legendary.instance.serial, 1, 'Lendário recebe número de série.');
  assert.equal(vault.grantItem(userC, 'pet_unicorn', { source: 'dungeon' }).instance.serial, 2);
  assert.equal(vault.grantItem(userC, 'chair_wood').instance.serial, null, 'Comum não é numerado.');
  const limited = catalog.getItem('throne_nyx');
  limited.maxSupply = 1;
  try {
    assert.equal(vault.grantItem(userC, 'throne_nyx', { source: 'achievement' }).ok, true);
    assert.equal(vault.grantItem(userB, 'throne_nyx', { source: 'achievement' }).reason, 'sold_out', 'Tiragem limitada esgota.');
  } finally {
    limited.maxSupply = 0;
  }
  assert.equal(vault.grantItem(userC, 'nao_existe').reason, 'unknown_item');
  const statsC = vault.getCollectionStats(userC);
  assert.equal(statsC.distinct, 3);
  assert.equal(statsC.byRarity.legendary, 1);
  assert.equal(statsC.byRarity.mythic, 1);
  const chair = vault.listInstances(userC).find((it) => it.itemId === 'chair_wood');
  assert.equal(vault.removeInstance(userC, chair.uid), true);
  assert.equal(vault.ownsItem(userC, 'chair_wood'), false);
  console.log('  ✅ 3. Cofre com instâncias, números de série, tiragem limitada e estatísticas.');

  // 4. Casinha: kit inicial, compra, posicionar, mover, guardar, parede/piso, curtidas
  const home = store.ensureHome(userA);
  assert.ok(home.placements.length >= 6, 'Kit inicial já monta um cantinho.');
  for (const p of home.placements) {
    const others = home.placements.filter((o) => o.uid !== p.uid);
    assert.ok(engine.validatePlacement(others, p.itemId, p.x, p.y, p.uid).ok, `Kit inicial válido: ${p.itemId}.`);
  }
  assert.equal(store.ensureHome(userA).placements.length, home.placements.length, 'Kit inicial só uma vez.');

  const shopToday = engine.getDailyShop();
  const coinItem = shopToday.items.map(catalog.getItem).find((e) => e.price.coins && engine.isPlaceable(e));
  const beanItem = shopToday.items.map(catalog.getItem).find((e) => e.price.beans);
  economy.addCoins(userA, coinItem.price.coins);
  const coinsBefore = economy.getUserAccount(userA).coins;
  const bought = store.buyItem(userA, coinItem.id);
  assert.equal(bought.ok, true);
  assert.equal(economy.getUserAccount(userA).coins, coinsBefore - coinItem.price.coins, 'Compra debita as moedinhas.');
  assert.equal(store.buyItem(userA, coinItem.id).reason, 'coins', 'Sem saldo, a compra é recusada.');
  const notInShop = catalog.ITEMS.find((e) => e.price?.coins && !shopToday.items.includes(e.id));
  assert.equal(store.buyItem(userA, notInShop.id).reason, 'not_in_shop');
  assert.equal(store.buyItem(userA, 'pet_unicorn').reason, 'not_in_shop', 'Drop da dungeon não é vendido.');
  economy.addMagicBeans(userA, beanItem.price.beans * 2);
  assert.equal(store.buyItem(userA, beanItem.id).ok, true);
  assert.equal(store.buyItem(userA, beanItem.id).reason, 'premium_limit', 'Premium: um de cada por dia.');

  const spot = engine.findFreeSpot(store.getHome(userA).placements, coinItem.id);
  const placed = store.placeItem(userA, bought.instance.uid, spot.x, spot.y);
  assert.equal(placed.ok, true);
  assert.equal(store.placeItem(userA, bought.instance.uid, spot.x, spot.y).reason, 'already_placed');
  assert.equal(store.placeItem(userA, 'nao-existe', 0, 0).reason, 'not_owned');
  assert.equal(store.placeItem(userB, bought.instance.uid, 0, 0).reason, 'not_owned', 'Ninguém mexe no item dos outros.');
  assert.equal(store.storeItem(userA, bought.instance.uid).ok, true);
  assert.ok(store.getAvailableInstances(userA).some((it) => it.uid === bought.instance.uid), 'Item guardado volta para a mochila.');

  assert.equal(store.applySurface(userA, 'wp_aurora').reason, 'not_owned');
  assert.equal(store.applySurface(userA, 'fl_oak').ok, true);
  assert.equal(store.applySurface(userA, 'chair_wood').reason, 'not_surface');

  store.ensureHome(userB);
  assert.equal(store.likeHome(userA, userA).reason, 'own_home');
  assert.equal(store.likeHome(userB, userA).ok, true);
  assert.equal(store.likeHome(userB, userA).reason, 'already_liked', 'Uma curtida por dia.');
  assert.equal(store.likeHome(userB, userA, Date.now() + 26 * 60 * 60 * 1000).ok, true, 'No dia seguinte pode curtir de novo.');
  assert.equal(store.getHome(userA).likes, 2);
  store.recordVisit(userB, userA);
  assert.equal(store.getHome(userA).visits, 1);
  assert.equal(store.getLeaderboard(5)[0].userId, userA);
  const homeStats = store.getHomeStats();
  assert.ok(homeStats.coinsSpent >= coinItem.price.coins && homeStats.purchases >= 2);
  console.log('  ✅ 4. Kit inicial, loja (moedinhas e premium), posicionar/guardar, parede e piso, curtidas e ranking.');

  // 5. Renderização
  const day = await renderHome(store.getHome(userA), { text: { title: 'Casinha', subtitle: 'teste', charm: '✦ 10' }, now: Date.UTC(2026, 9, 24, 16) });
  const night = await renderHome(store.getHome(userA), { text: { title: 'Casinha' }, edit: true, cursor: { area: 'floor', x: 0, y: 0, size: [1, 1], state: 'invalid' }, now: Date.UTC(2026, 9, 25, 2) });
  for (const png of [day, night]) {
    assert.equal(png.readUInt32BE(16), WIDTH);
    assert.equal(png.readUInt32BE(20), HEIGHT);
  }
  assert.notDeepEqual(day, night, 'Dia e noite iluminam diferente.');
  const shelf = await renderShelf(shopToday.items.map((itemId) => ({ itemId, sublabel: '🪙 1' })), { title: 'Loja' });
  assert.ok(shelf.length > 1000);
  console.log('  ✅ 5. Cena 800x608 de dia, de noite e em edição; vitrine renderizada.');

  // 6. Telas e embeds (AGENTS.md §9)
  const ownerA = { id: userA, username: 'a', displayName: 'Pessoa A' };
  const ownerB = { id: userB, username: 'b', displayName: 'Pessoa B' };
  for (const lang of ['pt', 'en']) {
    const source = { lang, guild: { name: 'Servidor' } };
    const ownerView = await views.buildHomeView({ owner: ownerA, viewer: ownerA, source });
    const visitorView = await views.buildHomeView({ owner: ownerA, viewer: ownerB, source });
    for (const view of [ownerView, visitorView, await views.buildShopView({ owner: ownerA, source }), await views.buildBagView({ owner: ownerA, source }), await views.buildPickView({ owner: ownerA, source })]) {
      const embed = view.embeds[0].toJSON();
      assert.ok(embed.title.replace(/<a?:\w+:\d+>/g, 'X').split(/\s+/).length <= 8, `${lang}: título curto (${embed.title}).`);
      assert.ok(embed.description.includes('\n\n'), `${lang}: respiro entre linhas.`);
      assert.ok(!/[━═]{3,}|-{5,}/.test(embed.description), `${lang}: sem divisores ASCII.`);
      assert.ok(view.files.length === 1, `${lang}: imagem anexada.`);
    }
    const ownerButtons = ownerView.components.flatMap((r) => r.toJSON().components.map((c) => c.custom_id));
    assert.ok(ownerButtons.some((idValue) => idValue.startsWith('home:pick:')), 'Dona vê Decorar.');
    const visitorButtons = visitorView.components.flatMap((r) => r.toJSON().components.map((c) => c.custom_id));
    assert.ok(visitorButtons.some((idValue) => idValue.startsWith('home:like:')), 'Visita vê Curtir.');
    assert.ok(!visitorButtons.some((idValue) => idValue.startsWith('home:pick:')), 'Visita não decora.');
    const shopView = await views.buildShopView({ owner: ownerA, source });
    assert.equal(shopView.components[0].toJSON().components[0].options.length, 10, 'Menu da loja com os 10 itens.');
  }
  console.log('  ✅ 6. Telas da dona, da visita, loja, mochila e decoração em PT/EN dentro do padrão de embeds.');

  // 7. Fluxo completo pelos botões
  economy.addCoins(userA, 5000);
  let mock = mockInteraction({ userId: userA, customId: `home:pick:${userA}:0` });
  await pyHome.handleHomeInteraction(mock.interaction);
  assert.equal(mock.calls[0][0], 'update');
  const options = mock.calls[0][1].components[0].toJSON().components[0].options;
  mock = mockInteraction({ userId: userA, customId: `home:select:${userA}:0`, values: [options[0].value], kind: 'select' });
  await pyHome.handleHomeInteraction(mock.interaction);
  assert.ok(pyHome._sessions.get(userA)?.mode === 'place', 'Escolher item abre o posicionamento.');
  for (const dir of ['r', 'd']) {
    mock = mockInteraction({ userId: userA, customId: `home:mv:${userA}:${dir}` });
    await pyHome.handleHomeInteraction(mock.interaction);
  }
  const before = store.getHome(userA).placements.length;
  const session = pyHome._sessions.get(userA);
  const free = engine.findFreeSpot(store.getHome(userA).placements, session.itemId);
  session.x = free.x;
  session.y = free.y;
  mock = mockInteraction({ userId: userA, customId: `home:put:${userA}` });
  await pyHome.handleHomeInteraction(mock.interaction);
  assert.equal(store.getHome(userA).placements.length, before + 1, 'Colocar aqui grava no quarto.');
  assert.ok(!pyHome._sessions.has(userA), 'Sessão encerrada depois de colocar.');

  mock = mockInteraction({ userId: userB, customId: `home:pick:${userA}:0` });
  await pyHome.handleHomeInteraction(mock.interaction);
  assert.equal(mock.calls[0][0], 'reply', 'Visita recebe aviso privado em vez de decorar.');
  assert.equal(mock.calls[0][1].flags, 64);

  mock = mockInteraction({ userId: userA, customId: `home:arrange:${userA}` });
  await pyHome.handleHomeInteraction(mock.interaction);
  const target = store.getHome(userA).placements.find((p) => engine.layerOf(catalog.getItem(p.itemId)) === 'floor');
  const arrange = pyHome._sessions.get(userA);
  arrange.x = target.x;
  arrange.y = target.y;
  arrange.area = 'floor';
  mock = mockInteraction({ userId: userA, customId: `home:store:${userA}` });
  await pyHome.handleHomeInteraction(mock.interaction);
  assert.ok(!store.getHome(userA).placements.some((p) => p.uid === target.uid), 'Guardar tira o item do quarto.');

  mock = mockInteraction({ userId: userA, customId: `home:sel_buy:${userA}`, values: [coinItem.id], kind: 'select' });
  await pyHome.handleHomeInteraction(mock.interaction);
  const owned = vault.listInstances(userA).length;
  mock = mockInteraction({ userId: userA, customId: `home:buy:${userA}:${coinItem.id}` });
  await pyHome.handleHomeInteraction(mock.interaction);
  assert.equal(vault.listInstances(userA).length, owned + 1, 'Comprar pelo botão entrega o item.');

  mock = mockInteraction({ userId: userC, customId: `home:like:${userA}` });
  await pyHome.handleHomeInteraction(mock.interaction);
  assert.equal(mock.calls[0][0], 'reply');
  assert.equal(store.getHome(userA).likes, 3);
  console.log('  ✅ 7. Fluxo pelos botões: escolher, mover, colocar, arrumar, guardar, comprar e curtir.');

  // 8. Drops das Catacumbas
  const victory = rollDrops({ id: 'run-1', outcome: 'victory', floor: 5 });
  assert.deepEqual(rollDrops({ id: 'run-1', outcome: 'victory', floor: 5 }), victory, 'Sorteio determinístico.');
  assert.equal(victory.length, 2);
  assert.ok(POOLS.legendary.includes(victory[0]), 'Vitória dá um lendário.');
  assert.deepEqual(rollDrops({ id: 'run-2', outcome: 'dead', floor: 1 }), [], 'Morrer no andar 1 não dá nada.');
  assert.deepEqual(rollDrops({ id: 'run-3', outcome: 'forfeit', floor: 4 }), []);
  let extractedDrops = 0;
  for (let i = 0; i < 400; i++) extractedDrops += rollDrops({ id: `ext-${i}`, outcome: 'extracted', floor: 4 }).length;
  assert.ok(extractedDrops > 120 && extractedDrops < 240, `Fuga no andar 4 rende ~45% (${extractedDrops}/400).`);
  for (const pool of Object.values(POOLS)) for (const id of pool) assert.ok(catalog.getItem(id), `Drop ${id} existe no catálogo.`);
  console.log('  ✅ 8. Drops das Catacumbas determinísticos, com lendário garantido na vitória.');

  // 9. Conquistas e títulos especiais
  assert.equal(stylize('Oráculo', 'boldScript'), '𝓞𝓻𝓪́𝓬𝓾𝓵𝓸', 'Acento preservado como marca combinante.');
  assert.equal(stylize('CHQ', 'doubleStruck'), 'ℂℍℚ', 'Exceções do double-struck.');
  for (const title of Object.values(ACHIEVEMENT_TITLES)) {
    assert.ok(TITLE_STYLES[title.style], `${title.id}: estilo existe.`);
    assert.notEqual(formatStyledTitle(title.name.pt, title.style), title.name.pt, `${title.id}: formatação especial.`);
  }
  for (const entry of ACHIEVEMENTS) {
    assert.ok(TIERS[entry.tier] && entry.target > 0 && entry.name.pt && entry.name.en && entry.desc.en);
    for (const itemId of entry.reward.items || []) assert.ok(catalog.getItem(itemId), `${entry.id}: item ${itemId} existe.`);
    if (entry.reward.title) assert.ok(ACHIEVEMENT_TITLES[entry.reward.title], `${entry.id}: título existe.`);
    if (entry.tier === 'mythic') assert.ok(entry.reward.title, `${entry.id}: mítica dá título especial.`);
    assert.ok((entry.reward.coins || 0) <= 500 && (entry.reward.beans || 0) <= 4, `${entry.id}: recompensa limitada (§5).`);
  }
  assert.ok(Object.keys(achievements.collectStats(userB)).length >= 20, 'Estatísticas de todos os sistemas.');

  economy.updateUserAccount(userB, (acc) => { acc.workCount = 500; });
  const coinsB = economy.getUserAccount(userB).coins;
  const beansB = economy.getUserAccount(userB).magicBeans;
  const unlocked = achievements.checkAndGrant(userB).map((u) => u.entry.id);
  for (const idValue of ['work_10', 'work_100', 'work_500']) assert.ok(unlocked.includes(idValue), `${idValue} desbloqueada.`);
  const accountB = economy.getUserAccount(userB);
  assert.equal(accountB.coins, coinsB + 100, 'Primeiro Salário paga 100 moedinhas.');
  assert.equal(accountB.magicBeans, beansB + 2, 'Pé-de-Boi paga 2 feijões.');
  assert.ok(accountB.titles.includes('coroa_oficios'), 'Título mítico entregue.');
  assert.ok(vault.ownsItem(userB, 'golden_piano'), 'Item mítico entregue no cofre.');
  assert.equal(vault.listInstances(userB).find((it) => it.itemId === 'golden_piano').serial, 1, 'Item mítico numerado.');
  assert.deepEqual(achievements.checkAndGrant(userB), [], 'Nunca paga duas vezes.');
  assert.equal(economy.getUserAccount(userB).coins, coinsB + 100);

  const title = economy.getTitleDefinition('coroa_oficios', 'pt');
  assert.ok(title.achievement && title.display.includes('𝑪𝒐𝒓𝒐𝒂'), 'Título de conquista com formatação especial.');
  assert.equal(economy.equipTitle(userB, 'coroa_oficios').success, true, 'Título de conquista é equipável.');
  assert.equal(economy.equipTitle(userA, 'coroa_oficios').success, false, 'Só equipa quem desbloqueou.');
  assert.equal(economy.getTitleDefinition('magnata').display, economy.TITLES_CATALOG.magnata.name, 'Títulos comprados continuam iguais.');

  const unlockEmbed = achievements.buildUnlockEmbed([{ entry: ACHIEVEMENTS.find((e) => e.id === 'work_500'), delivered: { coins: 0, beans: 0, items: [], title: 'coroa_oficios' } }], { lang: 'en' }).toJSON();
  assert.ok(unlockEmbed.title.startsWith('🏆'));
  assert.ok(unlockEmbed.description.includes('♛'), 'Aviso mostra o título formatado.');

  economy.updateUserAccount(userC, (acc) => { acc.workCount = 10; });
  achievements.resetForTests();
  const notMock = mockInteraction({ userId: userC, customId: 'x' });
  notMock.interaction.replied = true;
  const first = await achievements.notifyNewAchievements(notMock.interaction);
  assert.ok(first.some((u) => u.entry.id === 'work_10'));
  assert.equal(notMock.calls[0][0], 'followUp');
  assert.equal(notMock.calls[0][1].flags, 64, 'Aviso privado.');
  economy.updateUserAccount(userC, (acc) => { acc.workCount = 100; });
  assert.deepEqual(await achievements.notifyNewAchievements(notMock.interaction), [], 'Limite de uma verificação a cada 15s.');
  const unanswered = mockInteraction({ userId: userA, customId: 'y' });
  assert.deepEqual(await achievements.notifyNewAchievements(unanswered.interaction), [], 'Sem resposta ainda, não verifica.');

  const { buildAchievementsView } = require('../src/commands/conquistas');
  for (const lang of ['pt', 'en']) {
    const view = buildAchievementsView({ owner: { id: userB, username: 'b' }, viewerId: userB, source: { lang }, category: 'trabalho' });
    const embed = view.embeds[0].toJSON();
    assert.ok(/✅|lightpurplecheck/.test(embed.description), `${lang}: conquistas concluídas marcadas (✅ ou o check do bot).`);
    assert.equal(view.components[0].toJSON().components[0].options.length, 8, `${lang}: 8 categorias no menu.`);
    const secrets = buildAchievementsView({ owner: { id: userB, username: 'b' }, viewerId: userB, source: { lang }, category: 'segredos' }).embeds[0].toJSON();
    assert.ok(secrets.description.includes('???'), `${lang}: conquistas secretas escondidas.`);
  }
  console.log('  ✅ 9. Conquistas pagam uma vez, títulos míticos formatados e equipáveis, aviso privado com limite.');

  // 10. Integração com o painel, o catálogo de comandos e a API
  const moduleManager = require('../src/services/moduleManager');
  const discovered = moduleManager.discoverModules();
  assert.ok(discovered.get('home')?.commands?.some((c) => c.data?.name === 'py-home'), 'Módulo home descoberto com /py-home.');
  const { COMMAND_CATEGORY_MAP } = require('../src/commands/commandHelpers');
  for (const name of ['py-home', 'casinha', 'py-achievements', 'conquistas']) assert.ok(COMMAND_CATEGORY_MAP[name], `${name} no catálogo de comandos.`);
  const { queryPartition } = require('../src/services/visualDbExplorer');
  const record = queryPartition({ partition: 'global', limit: 100 }).records.find((r) => r.id === 'home_state');
  assert.ok(record && record.homesCount >= 2 && record.vaultItems > 0, 'Visual DB com números reais da Casinha.');
  const { getAllEmbedsWithResolvedSlots } = require('../src/utils/embedRegistry');
  const embedIds = getAllEmbedsWithResolvedSlots().map((e) => e.id);
  for (const idValue of ['home_room', 'home_shop', 'achievements_view', 'achievement_unlock']) assert.ok(embedIds.includes(idValue), `${idValue} no embedRegistry.`);
  const topgg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'topgg_commands.json'), 'utf8')).map((c) => c.name);
  assert.ok(topgg.includes('py-home') && topgg.includes('py-achievements'), 'Listagem do Top.gg atualizada.');
  const registerSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'registerSlashCommands.js'), 'utf8');
  assert.ok(registerSource.includes("'py-home'"), '/py-home instalável na conta.');
  console.log('  ✅ 10. Módulo, catálogo de comandos, Visual DB, embedRegistry e Top.gg sincronizados.');
}

run()
  .then(() => console.log('🎉 tests/homeAndAchievements.test.js concluído com 100% de sucesso!'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    try {
      const eco = JSON.parse(fs.readFileSync(ecoFile, 'utf8'));
      for (const id of testUsers) delete eco[id];
      fs.writeFileSync(ecoFile, JSON.stringify(eco, null, 2), 'utf8');
    } catch (_) {}
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
