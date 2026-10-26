const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Mercado entre jogadores (/py-market): anunciar tira o item da mochila (garantia), cancelar e
 * vencer devolvem, comprar cobra quem compra e paga quem vendeu menos 5% de taxa, ofertas
 * particulares, materiais, itens não negociáveis ou em uso na Casinha, histórico de preços e telas.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-market-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const crafting = require('../src/services/crafting');
const market = require('../src/services/market');
const homeStore = require('../src/modules/home/homeStore');
const views = require('../src/modules/market/marketViews');
const pyMarket = require('../src/modules/market/commands/pyMarket');
const { t } = require('../src/utils/i18n');

const runId = Date.now();
const SELLER = `user_test_mkt_s_${runId}`;
const BUYER = `user_test_mkt_b_${runId}`;
const OTHER = `user_test_mkt_o_${runId}`;
const PT = { locale: 'pt-BR' };
const EN = { locale: 'en-US' };

const coins = (id) => economy.getUserAccount(id).coins;
const owns = (id, uid) => Boolean(vault.getInstance(id, uid));

console.log('🏪 Iniciando testes do mercado entre jogadores...');

(async () => {
  try {
    economy.addCoins(BUYER, 5000);
    economy.addCoins(SELLER, 3000);

    // 1. Anunciar item: sai da mochila na hora (garantia) e aparece na vitrine
    const chair = vault.grantItem(SELLER, 'chair_wood', { source: 'shop' }).instance;
    assert.ok(chair, 'item de teste entregue');
    assert.equal(market.listItem(SELLER, chair.uid, 0).reason, 'price');
    assert.equal(market.listItem(SELLER, chair.uid, market.MAX_PRICE + 1).reason, 'price');
    assert.equal(market.listItem(SELLER, 'nao_existe', 50).reason, 'not_owned');
    const listed = market.listItem(SELLER, chair.uid, 100);
    assert.ok(listed.ok, 'anúncio criado');
    assert.equal(owns(SELLER, chair.uid), false, 'item em garantia, fora da mochila');
    assert.equal(market.listItem(SELLER, chair.uid, 100).reason, 'not_owned', 'não vende duas vezes');
    assert.ok(market.browse({ viewerId: BUYER }).some((l) => l.id === listed.listing.id));
    console.log('  ✅ 1. Anúncio tira o item da mochila e aparece na vitrine.');

    // 2. Cancelar devolve o item com a mesma série e origem
    const cancelled = market.cancel(SELLER, listed.listing.id);
    assert.equal(market.cancel(BUYER, listed.listing.id).reason, 'missing');
    assert.ok(cancelled.ok);
    const back = vault.getInstance(SELLER, chair.uid);
    assert.ok(back, 'item voltou');
    assert.equal(back.serial, chair.serial);
    console.log('  ✅ 2. Cancelar devolve o mesmo item.');

    // 3. Comprar: debita quem compra, paga quem vendeu menos 5%, item muda de dona com histórico
    const again = market.listItem(SELLER, chair.uid, 200);
    assert.equal(market.cancel(BUYER, again.listing.id).reason, 'not_yours');
    assert.equal(market.buy(SELLER, again.listing.id).reason, 'self');
    const buyerBefore = coins(BUYER);
    const sellerBefore = coins(SELLER);
    const sale = market.buy(BUYER, again.listing.id);
    assert.ok(sale.ok, 'compra feita');
    assert.equal(sale.tax, 10);
    assert.equal(coins(BUYER), buyerBefore - 200);
    assert.equal(coins(SELLER), sellerBefore + 190, 'taxa de 5% sai da economia');
    const bought = vault.getInstance(BUYER, chair.uid);
    assert.ok(bought, 'item entregue');
    assert.equal(bought.history.at(-1).from, SELLER);
    assert.equal(market.buy(OTHER, again.listing.id).reason, 'missing', 'não compra duas vezes');
    assert.equal(market.taxFor(10), 1, 'taxa mínima de 1');
    console.log('  ✅ 3. Compra com taxa de 5% e histórico de dono.');

    // 4. Sem moedinhas: o anúncio volta à vitrine e ninguém perde nada
    const lamp = vault.grantItem(SELLER, 'chair_cushion', { source: 'shop' }).instance;
    const pricey = market.listItem(SELLER, lamp.uid, 999999);
    const broke = market.buy(OTHER, pricey.listing.id);
    assert.equal(broke.reason, 'coins');
    assert.ok(market.getListing(pricey.listing.id), 'anúncio voltou');
    assert.equal(owns(OTHER, lamp.uid), false);
    console.log('  ✅ 4. Compra sem saldo devolve o anúncio.');

    // 5. Oferta particular: só a pessoa convidada vê e compra
    market.cancel(SELLER, pricey.listing.id);
    assert.equal(market.listItem(SELLER, lamp.uid, 50, { buyerId: SELLER }).reason, 'self');
    const privateOffer = market.listItem(SELLER, lamp.uid, 50, { buyerId: BUYER });
    assert.ok(privateOffer.ok);
    assert.equal(market.browse({ viewerId: OTHER }).some((l) => l.id === privateOffer.listing.id), false);
    assert.ok(market.browse({ viewerId: BUYER }).some((l) => l.id === privateOffer.listing.id));
    economy.addCoins(OTHER, 500);
    assert.equal(market.buy(OTHER, privateOffer.listing.id).reason, 'private');
    assert.ok(market.buy(BUYER, privateOffer.listing.id).ok);
    console.log('  ✅ 5. Oferta particular só para quem foi convidado.');

    // 6. Itens não negociáveis e itens à mostra na Casinha ficam de fora
    const premium = vault.grantItem(SELLER, 'bed_lilac', { source: 'premium' }).instance;
    assert.equal(market.listItem(SELLER, premium.uid, 50).reason, 'not_tradable');
    const shown = vault.grantItem(SELLER, 'chair_white', { source: 'shop' }).instance;
    economy.addMagicBeans(SELLER, homeStore.HOUSE_PRICE.beans);
    assert.ok(homeStore.buyHouse(SELLER).ok, 'casa de teste comprada');
    assert.ok(homeStore.placeItem(SELLER, shown.uid, 1, 1).ok, 'item posto no quarto');
    assert.equal(homeStore.isInUse(SELLER, shown.uid), true);
    assert.equal(market.listItem(SELLER, shown.uid, 50).reason, 'placed');
    console.log('  ✅ 6. Itens premium e à mostra na Casinha não vão ao mercado.');

    // 7. Materiais: o lote sai junto e chega inteiro
    crafting.addMaterials(SELLER, { wood: 6 });
    assert.equal(market.listMaterial(SELLER, 'wood', 10, 30).reason, 'not_enough');
    assert.equal(market.listMaterial(SELLER, 'pedra_magica', 1, 30).reason, 'qty');
    const lot = market.listMaterial(SELLER, 'wood', 4, 40);
    assert.ok(lot.ok);
    assert.equal(crafting.getMaterials(SELLER).wood, 2);
    const woodBefore = crafting.getMaterials(BUYER).wood;
    assert.ok(market.buy(BUYER, lot.listing.id).ok);
    assert.equal(crafting.getMaterials(BUYER).wood, woodBefore + 4);
    console.log('  ✅ 7. Lotes de materiais vendidos inteiros.');

    // 8. Vencimento devolve; limite de anúncios por pessoa
    const old = market.listMaterial(SELLER, 'wood', 1, 10, { now: Date.now() - market.LISTING_TTL_MS - 1000 });
    assert.ok(old.ok);
    assert.equal(crafting.getMaterials(SELLER).wood, 1);
    assert.ok(market.expireListings() >= 1);
    assert.equal(market.getListing(old.listing.id), null);
    assert.equal(crafting.getMaterials(SELLER).wood, 2, 'material voltou');
    crafting.addMaterials(SELLER, { ore: 20 });
    for (let i = 0; i < market.MAX_LISTINGS_PER_USER; i += 1) assert.ok(market.listMaterial(SELLER, 'ore', 1, 5).ok);
    assert.equal(market.listMaterial(SELLER, 'ore', 1, 5).reason, 'limit');
    for (const listing of market.myListings(SELLER)) market.cancel(SELLER, listing.id);
    assert.equal(market.myListings(SELLER).length, 0);
    console.log('  ✅ 8. Vencimento devolve e há limite de anúncios.');

    // 9. Histórico de preços (por unidade) e números do mercado
    const summary = market.priceSummary('mat:wood');
    assert.equal(summary.last, 10, 'preço por unidade (40 / 4)');
    assert.equal(summary.count, 1);
    const chairSummary = market.priceSummary('chair_wood');
    assert.equal(chairSummary.last, 200);
    assert.equal(market.priceHistory('chair_wood').length, 1);
    const top = market.topTraded();
    assert.ok(top.some((row) => row.key === 'chair_wood' && Array.isArray(row.history)));
    const stats = market.getMarketStats();
    assert.equal(stats.sold, 3);
    assert.equal(stats.taxCollected, 10 + 2 + 2);
    assert.ok(stats.sales7d >= 3);
    console.log('  ✅ 9. Histórico de preços e estatísticas.');

    // 10. Telas PT/EN, customIds e oferta particular pelo modal
    const offer = vault.grantItem(SELLER, 'chair_carved', { source: 'shop' }).instance;
    const shelf = market.listItem(SELLER, offer.uid, 77);
    for (const source of [PT, EN]) {
      const view = await views.buildMarketView({ viewerId: BUYER, source });
      const ids = view.components.flatMap((row) => row.components.map((c) => c.data.custom_id));
      assert.ok(ids.every((id) => id.startsWith('mkt:') && id.split(':')[2] === BUYER), 'customIds com quem vê');
      assert.ok(view.embeds[0].data.title.length > 0);
      const detail = await views.buildListingView({ viewerId: BUYER, source, listingId: shelf.listing.id });
      const buyBtn = detail.components.flatMap((row) => row.components).find((c) => c.data.custom_id === `mkt:buy:${BUYER}:${shelf.listing.id}`);
      assert.ok(buyBtn, 'botão de comprar');
      assert.ok(views.buildSellItemView({ viewerId: SELLER, source }).embeds.length);
      assert.ok(views.buildSellMaterialView({ viewerId: SELLER, source }).embeds.length);
      assert.ok(views.buildMineView({ viewerId: SELLER, source }).embeds[0].data.description.length);
      const modal = views.buildSellModal({ viewerId: SELLER, source, kind: 'material', arg: 'wood' }).toJSON();
      assert.equal(modal.custom_id, `mkt:mmat:${SELLER}:wood`);
      assert.equal(modal.components.length, 3);
    }
    assert.equal(pyMarket.parseBuyer('<@214153735281180673>'), '214153735281180673');
    assert.equal(pyMarket.parseBuyer('  214153735281180673 '), '214153735281180673');
    assert.equal(pyMarket.parseBuyer('alguém'), null);
    assert.equal(pyMarket.parseBuyer(''), null);
    for (const reason of ['price', 'not_owned', 'not_tradable', 'placed', 'self', 'limit', 'not_enough', 'qty', 'missing', 'private', 'full', 'coins', 'not_yours', 'save']) {
      for (const lang of ['pt', 'en']) assert.ok(!t(`market.reasons.${reason}`, lang).startsWith('market.'), `motivo ${reason} (${lang})`);
    }
    console.log('  ✅ 10. Telas PT/EN, customIds e oferta particular pelo modal.');

    // 11. Interação: outra pessoa não mexe na vitrine de ninguém
    let replied = null;
    await pyMarket.handleMarketInteraction({
      customId: `mkt:buy:${BUYER}:${shelf.listing.id}`,
      user: { id: OTHER },
      locale: 'pt-BR',
      isButton: () => true,
      reply: async (payload) => { replied = payload; },
    });
    assert.equal(replied.content, t('market.notYours', 'pt'));
    assert.ok(market.getListing(shelf.listing.id), 'nada foi comprado');
    let updated = null;
    let dm = null;
    await pyMarket.handleMarketInteraction({
      customId: `mkt:buy:${BUYER}:${shelf.listing.id}`,
      user: { id: BUYER },
      locale: 'en-US',
      isButton: () => true,
      update: async (payload) => { updated = payload; },
      client: { users: { fetch: async () => ({ send: async (payload) => { dm = payload; } }) } },
    });
    assert.ok(updated.embeds[0], 'vitrine atualizada');
    assert.ok(owns(BUYER, offer.uid), 'comprado pelo botão');
    assert.ok(dm && dm.content.includes('77'), 'DM para quem vendeu');
    console.log('  ✅ 11. Botões travados para a dona da tela e DM de venda.');

    console.log('🎉 [TEST] Mercado entre jogadores passou com 100% de sucesso!');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    console.error('❌ [TEST] Falha no mercado entre jogadores:', error);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }
})();
