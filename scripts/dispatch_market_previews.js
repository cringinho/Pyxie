#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) do Mercado (/py-market) no canal 1461937203214024891.
 * Usa contas de teste e dados temporários. Uso: node scripts/dispatch_market_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-market-preview-'));

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const crafting = require('../src/services/crafting');
const market = require('../src/services/market');
const views = require('../src/modules/market/marketViews');

const stamp = Date.now();
const seller = `user_test_market_preview_s_${stamp}`;
const buyer = `user_test_market_preview_b_${stamp}`;

async function send(context, payload) {
  const result = await dispatchHomologationPreview({ commandName: '/py-market', context, embeds: payload.embeds, components: payload.components, files: payload.files });
  console.log(`[MarketPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  const source = { lang };
  economy.addCoins(buyer, 800);
  crafting.addMaterials(seller, { wood: 8, crystal: 3 });
  const listed = [];
  for (const [itemId, price] of [['chair_carved', 120], ['pet_fox', 450], ['craft_lantern', 260]]) {
    const instance = vault.grantItem(seller, itemId, { source: itemId.startsWith('craft_') ? 'craft' : 'shop' }).instance;
    listed.push(market.listItem(seller, instance.uid, price).listing);
  }
  market.listMaterial(seller, 'wood', 5, 40);
  market.listMaterial(seller, 'crystal', 2, 70);
  market.buy(buyer, market.listMaterial(seller, 'wood', 3, 27).listing.id);

  await send(`Vitrine (${lang})`, await views.buildMarketView({ viewerId: buyer, source }));
  await send(`Anúncio (${lang})`, await views.buildListingView({ viewerId: buyer, source, listingId: listed[1].id }));
  await send(`Meus anúncios (${lang})`, views.buildMineView({ viewerId: seller, source }));
  await send(`Vender materiais (${lang})`, views.buildSellMaterialView({ viewerId: seller, source }));
}

main()
  .catch((err) => {
    console.error('[MarketPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    economy.purgeTestAccounts();
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  });
