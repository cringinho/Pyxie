const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Festival da Temporada (/py-festival): calendário das temporadas, Fagulhas (carteira, dungeon,
 * trabalho e mercado), monstros fantasiados, caixas com chances públicas e garantia, itens de
 * temporada no catálogo da Casinha e as telas PT/EN.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-festival-'));
process.env.MODULES_CONFIG_PATH = path.join(tmpDir, 'modulesConfig.json');
process.env.PYXIE_DATA_DIR = tmpDir;

const festival = require('../src/services/festival');
const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const market = require('../src/services/market');
const engine = require('../src/modules/dungeon/dungeonEngine');
const store = require('../src/modules/dungeon/dungeonStore');
const dungeonViews = require('../src/modules/dungeon/dungeonViews');
const { ITEMS, SETS } = require('../src/modules/home/homeCatalog');
const { SHEETS, getSprite } = require('../src/modules/home/homeSprites');
const views = require('../src/modules/festival/festivalViews');
const { emojify } = require('../src/utils/emojify');
const pyFestival = require('../src/modules/festival/commands/pyFestival');
const { t } = require('../src/utils/i18n');

const FILE = path.join(tmpDir, 'dungeon.json');
store._setDataFileForTests(FILE);
store.setSettingsProvider(() => ({ ticket: 50, dailyEntries: 9, runPayoutCap: 5000, dailyPayoutCap: 20000 }));

const runId = Date.now();
const U = `user_test_fest_${runId}`;
const V = `user_test_fest_v_${runId}`;
const W = `user_test_fest_w_${runId}`;
// Meio-dia de Brasília em datas fixas (o festival segue o calendário)
const at = (y, m, d) => Date.UTC(y, m - 1, d, 15);
const HALLOWEEN = at(2026, 10, 26);
const OFF = at(2026, 3, 1);
const seq = (...values) => {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
};

console.log('🎇 Iniciando testes do Festival da Temporada...');

(async () => {
  try {
    // 1. Calendário: datas fixas, Páscoa móvel e virada do ano
    assert.equal(new Date(festival.easterDate(2026)).toISOString().slice(0, 10), '2026-04-05');
    assert.equal(new Date(festival.easterDate(2027)).toISOString().slice(0, 10), '2027-03-28');
    const cases = [
      [at(2026, 10, 15), 'halloween'],
      [at(2026, 11, 5), 'halloween'],
      [at(2026, 11, 6), null],
      [at(2026, 12, 10), 'christmas'],
      [at(2026, 12, 30), 'newyear'],
      [at(2027, 1, 5), 'newyear'],
      [at(2027, 1, 20), 'summer'],
      [at(2026, 3, 22), 'easter'],
      [at(2026, 4, 12), 'easter'],
      [OFF, null],
    ];
    for (const [now, expected] of cases) assert.equal(festival.getActiveSeason(now)?.id || null, expected, new Date(now).toISOString());
    assert.equal(festival.getActiveSeason(HALLOWEEN).key, 'halloween:2026');
    assert.equal(festival.getActiveSeason(at(2027, 1, 5)).key, 'newyear:2026', 'a virada pertence ao ano em que começa');
    assert.equal(festival.getNextSeason(OFF).id, 'easter');
    console.log('  ✅ 1. Temporadas abrem e fecham pelo calendário (Páscoa móvel incluída).');

    // 2. Catálogo: cada temporada tem itens, todos negociáveis e com sprite válido
    for (const id of Object.keys(festival.SEASONS)) {
      const pool = festival.seasonPool(id);
      assert.ok(pool.length >= 10, `${id}: itens`);
      assert.ok(pool.every((entry) => entry.tradable && entry.sets.includes(`season_${id}`)), `${id}: negociáveis e no conjunto`);
      assert.ok(SETS[`season_${id}`], `${id}: conjunto com nome`);
      assert.ok(pool.some((entry) => entry.kind === 'pet'), `${id}: tem pet exclusivo`);
    }
    const extras = ITEMS.filter((entry) => entry.source === 'festival' || (entry.source === 'shop' && entry.sprite.sheet && /^(seasonal|extra)-/.test(entry.sprite.sheet)));
    assert.ok(extras.length >= 150, 'itens novos no catálogo');
    for (const entry of extras) {
      const sheet = SHEETS[entry.sprite.sheet];
      assert.ok(sheet && fs.existsSync(path.join(__dirname, '..', 'assets', 'home', 'sheets', sheet.file)), `${entry.id}: folha`);
      if (entry.kind === 'wall') assert.ok(entry.footprint[1] <= 2, `${entry.id}: cabe na parede`);
    }
    for (const entry of extras.slice(0, 40)) {
      const sprite = await getSprite(entry.sprite);
      assert.ok(sprite.width >= 16 && sprite.height >= 16, `${entry.id}: sprite`);
    }
    console.log('  ✅ 2. Itens de temporada e extras no catálogo da Casinha.');

    // 3. Carteira de Fagulhas: nunca fica negativa
    assert.equal(festival.getSparks(U), 0);
    assert.equal(festival.addSparks(U, 30, 'dungeon').sparks, 30);
    assert.equal(festival.addSparks(U, -40).reason, 'sparks');
    assert.equal(festival.getSparks(U), 30);
    console.log('  ✅ 3. Carteira de Fagulhas.');

    // 4. Fontes: 20% das descidas fantasiadas e 5% dos turnos do trabalho
    const run = engine.createRun({ ownerId: U, seed: 1 });
    assert.equal(festival.decorateRun(run, OFF, () => 0), null, 'fora de temporada nada muda');
    assert.equal(festival.decorateRun(run, HALLOWEEN, () => 0.5), null, '80% das descidas normais');
    assert.equal(festival.decorateRun(run, HALLOWEEN, () => 0.1).season, 'halloween');
    assert.ok(run.log.some((entry) => entry.k === 'festivalRun'));
    engine._internals.startCombat(run, 'rat', { roomKey: run.map.pos, kind: 'monster' });
    run.combat.hp = 1;
    run.player.crit = 0;
    run.combat.dodge = 0;
    assert.equal(engine.applyAction(run, 'attack').ok, true);
    assert.equal(run.festival.collected, 1, 'monstro fantasiado solta 1 Fagulha');
    assert.ok(run.log.some((entry) => entry.k === 'festivalSpark'));
    for (const lang of ['pt', 'en']) {
      const logText = run.log.filter((entry) => entry.k.startsWith('festival')).map((entry) => dungeonViews.formatLogEntry(entry, lang)).join(' ');
      assert.ok(!logText.includes('{') && logText.includes('🎇'), `log do festival (${lang})`);
    }
    assert.equal(festival.rollWorkDrop(V, { now: OFF, random: () => 0 }), null);
    assert.equal(festival.rollWorkDrop(V, { now: HALLOWEEN, random: () => 0.06 }), null);
    const drop = festival.rollWorkDrop(V, { now: HALLOWEEN, random: seq(0.01, 0.99) });
    assert.equal(drop.qty, 3);
    assert.equal(festival.getSparks(V), 3);
    console.log('  ✅ 4. Monstros fantasiados e drop do trabalho.');

    // 5. Dungeon de verdade: a liquidação credita as Fagulhas coletadas
    economy.setUserBalance(W, 1000);
    const started = store.startRun(W, { now: HALLOWEEN, seed: 100, guildId: 'g1' });
    assert.equal(started.ok, true);
    assert.equal(started.run.festival.season, 'halloween', 'semente 100 cai nos 20%');
    const state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const live = state.runs[state.players[W].activeRunId];
    live.festival.collected = 7;
    live.player.hp = 1;
    live.player.def = 0;
    engine._internals.startCombat(live, 'granny_spider', { roomKey: live.map.pos, kind: 'monster' });
    fs.writeFileSync(FILE, JSON.stringify(state));
    for (let i = 0; i < 40 && store.getActiveRun(W, HALLOWEEN); i++) {
      const current = store.getActiveRun(W, HALLOWEEN);
      store.performAction(W, current.id, current.step, current.phase === 'combat' ? 'attack' : 'forfeit', null, HALLOWEEN + i);
    }
    const after = JSON.parse(fs.readFileSync(FILE, 'utf8')).players[W].lastRun;
    assert.ok(after.festival >= 7, 'Fagulhas na liquidação');
    assert.equal(festival.getSparks(W), after.festival, 'creditadas na carteira');
    for (const lang of ['pt', 'en']) assert.ok(t('dungeon.end.festival', lang, { sparks: 7, currency: festival.currencyLabel(lang, 7) }).includes('/py-festival'));
    console.log('  ✅ 5. Descida fantasiada credita as Fagulhas no fim.');

    // 6. Caixa da Temporada: cobra, entrega, garantia de épico a cada 15
    assert.equal(festival.openBox(U, 'sparks', { now: OFF }).reason, 'closed');
    assert.equal(festival.openBox(U, 'nada', { now: HALLOWEEN }).reason, 'unknown_box');
    festival.addSparks(U, 25 * 15 - 30, 'dungeon');
    const commonOnly = () => 0;
    const prizes = [];
    for (let i = 0; i < 15; i++) {
      const result = festival.openBox(U, 'sparks', { now: HALLOWEEN, random: commonOnly });
      assert.equal(result.ok, true, `caixa ${i + 1}`);
      prizes.push(result);
    }
    assert.ok(prizes.slice(0, 14).every((r) => r.item.rarity === 'common' && !r.pityHit));
    assert.equal(prizes[14].pityHit, true, 'garantia na 15ª');
    assert.equal(prizes[14].item.rarity, 'epic');
    assert.equal(prizes[14].item.season, 'halloween');
    assert.equal(festival.getSparks(U), 0);
    assert.equal(festival.openBox(U, 'sparks', { now: HALLOWEEN }).reason, 'sparks');
    assert.equal(vault.listInstances(U).filter((it) => it.origin.source === 'festival').length, 15);
    assert.equal(festival.getBoxStatus(U, HALLOWEEN).pitySparksLeft, 15, 'garantia recomeça');
    // Lendária só existe no Halloween; uma rolagem alta acha o piano
    festival.addSparks(U, 25, 'dungeon');
    const lucky = festival.openBox(U, 'sparks', { now: HALLOWEEN, random: () => 0.999 });
    assert.equal(lucky.item.rarity, 'legendary');
    console.log('  ✅ 6. Caixa da Temporada com garantia de épico.');

    // 7. Baú de Moedinhas: moedinhas saem da economia, limite de 5 por dia
    economy.setUserBalance(V, 450 * 6);
    for (let i = 0; i < 5; i++) assert.equal(festival.openBox(V, 'coins', { now: HALLOWEEN, random: commonOnly }).ok, true);
    assert.equal(festival.openBox(V, 'coins', { now: HALLOWEEN }).reason, 'daily_limit');
    assert.equal(economy.getUserAccount(V).coins, 450);
    assert.equal(festival.openBox(V, 'coins', { now: HALLOWEEN + 24 * 60 * 60 * 1000, random: commonOnly }).ok, true, 'outro dia, outro limite');
    economy.setUserBalance(V, 10);
    const broke = festival.openBox(V, 'coins', { now: HALLOWEEN + 2 * 24 * 60 * 60 * 1000 });
    assert.equal(broke.reason, 'coins');
    assert.equal(economy.getUserAccount(V).coins, 10);
    const stats = festival.getFestivalStats(HALLOWEEN);
    assert.equal(stats.coinBoxes, 6);
    assert.equal(stats.coinsRemoved, 450 * 6);
    assert.equal(stats.activeSeason, 'halloween');
    console.log('  ✅ 7. Baú de Moedinhas com limite diário e moedinhas fora da economia.');

    // 8. Chances efetivas somam 100% (raridade ausente passa para a de baixo)
    for (const id of Object.keys(festival.SEASONS)) {
      for (const kind of ['sparks', 'coins']) {
        const odds = festival.effectiveOdds(kind, id);
        const total = Object.values(odds).reduce((acc, v) => acc + v, 0);
        assert.ok(Math.abs(total - 100) < 0.01, `${id}/${kind}: ${total}`);
      }
    }
    assert.ok(!('legendary' in festival.effectiveOdds('sparks', 'christmas')), 'Natal não tem lendário');
    console.log('  ✅ 8. Chances públicas somam 100% em todas as temporadas.');

    // 9. Fagulhas e itens de temporada no mercado
    economy.setUserBalance(V, 500);
    const lot = market.listMaterial(W, 'sparks', 5, 40);
    assert.equal(lot.ok, true);
    assert.equal(festival.getSparks(W), after.festival - 5, 'Fagulhas em garantia');
    assert.equal(market.buy(V, lot.listing.id).ok, true);
    assert.equal(festival.getSparks(V), 3 + 5);
    const seasonal = vault.listInstances(U).find((it) => it.origin.source === 'festival');
    assert.equal(market.listItem(U, seasonal.uid, 99).ok, true, 'item de temporada é negociável');
    assert.ok(market.resourceLabel('sparks', 'en').includes('Sparks'));
    console.log('  ✅ 9. Fagulhas e itens de temporada vão ao mercado.');

    // 10. Telas PT/EN, botões e textos
    for (const locale of ['pt-BR', 'en-US']) {
      const source = { locale };
      const open = await views.buildFestivalView({ viewerId: U, source, now: HALLOWEEN });
      assert.ok(open.embeds[0].data.title.startsWith(emojify('🎃')), 'abóbora pixel do bot no título');
      assert.ok(!open.embeds[0].data.description.includes('{'));
      assert.equal(open.embeds[0].data.fields.filter((f) => f.inline).length, 2, 'as duas caixas lado a lado');
      assert.ok(open.embeds[0].data.fields.every((f) => !f.value.includes('{')));
      const ids = open.components[0].components.map((c) => c.data.custom_id);
      assert.deepEqual(ids, [`fest:open:${U}:sparks`, `fest:open:${U}:coins`, `fest:odds:${U}`]);
      const closed = await views.buildFestivalView({ viewerId: U, source, now: OFF });
      assert.equal(closed.components.length, 0);
      assert.ok(closed.embeds[0].data.fields.some((f) => f.value.includes('<t:')), 'data da próxima temporada');
      const odds = views.buildOddsView({ viewerId: U, source, now: HALLOWEEN });
      assert.ok(odds.embeds[0].data.description.length < 4096);
      assert.ok(odds.embeds[0].data.fields.every((f) => f.value.length <= 1024), 'chances e prêmios cabem nos campos');
      assert.equal(views.buildOddsView({ viewerId: U, source, now: OFF }), null);
      const prize = await views.buildPrizeView({ viewerId: U, source, result: lucky });
      assert.equal(prize.files.length, 1);
      assert.ok(prize.components[0].components.length <= 5);
    }
    for (const reason of ['closed', 'sparks', 'coins', 'daily_limit', 'full', 'sold_out', 'unknown_box', 'save']) {
      for (const lang of ['pt', 'en']) assert.ok(!t(`festival.reasons.${reason}`, lang).startsWith('festival.'), `${reason} (${lang})`);
    }
    for (const id of Object.keys(festival.SEASONS)) for (const lang of ['pt', 'en']) assert.ok(!t(`festival.intro.${id}`, lang).startsWith('festival.'));
    let replied = null;
    await pyFestival.handleFestivalInteraction({
      customId: `fest:open:${U}:sparks`,
      user: { id: V },
      locale: 'pt-BR',
      isButton: () => true,
      reply: async (payload) => { replied = payload; },
    });
    assert.equal(replied.content, t('festival.notYours', 'pt'));
    console.log('  ✅ 10. Telas PT/EN, chances, prêmio e botões travados para a dona.');

    console.log('🎉 [TEST] Festival da Temporada passou com 100% de sucesso!');
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    console.error('❌ [TEST] Falha no Festival da Temporada:', error);
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }
})();
