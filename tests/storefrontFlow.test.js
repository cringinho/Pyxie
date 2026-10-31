// Vitrine da lojinha no Discord e alerta de estoque: compra, recibo, DM e clique repetido.
// (Antes a venda só existia no painel; agora o cliente compra pelos botões e o dono é avisado.)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🛍️ Testes da vitrine da lojinha e do alerta de estoque...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-storefront-'));

const store = require('../src/services/storeProducts');
const storefront = require('../src/modules/mary-studio/storefront');
const alerts = require('../src/modules/mary-studio/storeAlerts');
const { MARY_GUILD_ID } = require('../src/config/scopes');

// A zona da Mary sempre pode usar a lojinha (o extra `lojinha` é o outro caminho).
const G = String(MARY_GUILD_ID);
const BUYER = '987654321098765432';
const OTHER = '112233445566778899';

(async () => {
  // 1. Painel: menu com preço, Robux e estoque (nada de código nem custo).
  store.saveProduct(G, {
    name: '800 Robux',
    priceCents: 2400,
    costCents: 1680,
    robux: 800,
    delivery: 'code',
    minStock: 2,
  });
  store.addStock(G, '800-robux', ['CODE-A', 'CODE-B']);
  const panel = storefront.buildPanel(G, { lang: 'pt', guildName: 'Cringelândia' });
  const panelJson = panel.embeds[0].toJSON();
  assert.equal(panelJson.title, '🛍️ Lojinha aberta');
  assert.ok(panelJson.description.includes('Como comprar'));
  assert.ok(panelJson.footer.text.includes('Cringelândia'));
  assert.equal(panel.components.length, 1, 'Painel com produto precisa do menu');
  const menu = panel.components[0].toJSON().components[0];
  assert.equal(menu.custom_id, storefront.PANEL_ID);
  assert.equal(menu.options[0].value, '800-robux');
  assert.ok(menu.options[0].description.includes('R$ 24,00'));
  assert.ok(!JSON.stringify(menu).includes('CODE-A'), 'Código do estoque nunca aparece na vitrine');
  console.log('  ✅ 1. Painel com menu, preço e estoque, sem código nem custo.');

  // 2. Ficha do pacote com botão de comprar.
  const view = storefront.buildProduct(G, '800-robux', { lang: 'pt' });
  const viewJson = view.embeds[0].toJSON();
  assert.equal(viewJson.title, '🛒 800 Robux');
  const buttons = view.components[0].toJSON().components;
  assert.equal(buttons[0].custom_id, `${storefront.BUY_PREFIX}800-robux`);
  assert.equal(buttons[1].custom_id, storefront.BACK_ID);
  assert.ok(storefront.isBuy(buttons[0].custom_id));
  assert.equal(storefront.productIdOf(buttons[0].custom_id), '800-robux');
  assert.equal(storefront.buildProduct(G, 'nao-existe', { lang: 'pt' }), null);
  console.log('  ✅ 2. Ficha do pacote com botão de compra e volta para a vitrine.');

  // 3. Compra entrega o código e baixa o estoque.
  const first = storefront.purchase(G, '800-robux', { buyerId: BUYER });
  assert.equal(first.ok, true, 'Compra deve sair');
  assert.equal(first.order.status, 'paid');
  assert.equal(first.order.payload, 'CODE-A', 'O código mais antigo sai primeiro');
  assert.equal(first.stockCount, 1);
  const receipt = storefront.receipt(first.order, { lang: 'pt' }).toJSON();
  assert.ok(receipt.description.includes('CODE-A'), 'Recibo mostra o código uma vez');
  assert.ok(receipt.description.includes(first.order.id));
  console.log('  ✅ 3. Compra entrega o código, baixa o estoque e emite recibo.');

  // 4. Clique repetido na mesma janela não vende duas vezes.
  const again = storefront.purchase(G, '800-robux', { buyerId: BUYER, now: first.order.createdAt + 1000 });
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'repeat');
  console.log('  ✅ 4. Clique repetido em 30 s é recusado (não vende duas vezes).');

  // 5. Passada a janela, outro cliente compra o último código.
  const second = storefront.purchase(G, '800-robux', {
    buyerId: OTHER,
    now: first.order.createdAt + storefront.REPEAT_WINDOW_MS + 1000,
  });
  assert.equal(second.ok, true);
  assert.equal(second.order.payload, 'CODE-B');
  assert.equal(second.stockCount, 0);
  assert.equal(second.lowStock, true, 'Estoque no mínimo avisa para repor');
  console.log('  ✅ 5. Janela vencida libera a compra e o estoque baixo é sinalizado.');

  // 6. Esgotado: nada de pedido, nada de código perdido.
  const soldOut = storefront.purchase(G, '800-robux', {
    buyerId: OTHER,
    now: second.order.createdAt + storefront.REPEAT_WINDOW_MS + 1000,
  });
  assert.equal(soldOut.ok, false);
  assert.equal(soldOut.reason, 'sold_out');
  assert.equal(store.getProduct(G, '800-robux').stock.length, 0);
  console.log('  ✅ 6. Pacote esgotado recusa a compra sem tocar no estoque.');

  // 7. Entrega manual: pedido pendente e aviso para o dono com o link do painel.
  store.saveProduct(G, {
    name: 'Mil Robux',
    priceCents: 3200,
    robux: 1000,
    delivery: 'manual',
    minStock: 0,
  });
  const manual = storefront.purchase(G, 'mil-robux', { buyerId: BUYER });
  assert.equal(manual.ok, true);
  assert.equal(manual.order.status, 'pending');
  const ownerCard = storefront.ownerNotice(manual.order, { lang: 'pt', guildId: G, buyer: 'cliente#0001' }).toJSON();
  assert.equal(ownerCard.title, '🛒 Pedido novo na lojinha');
  assert.ok(ownerCard.description.includes('cliente#0001'));
  assert.ok(ownerCard.description.includes(manual.order.id));
  assert.ok(ownerCard.description.includes(`#/guild/${G}/maryStore`), 'Aviso leva ao painel da loja');
  const manualReceipt = storefront.receipt(manual.order, { lang: 'pt' }).toJSON();
  assert.ok(manualReceipt.description.includes('Pedido registrado'));
  console.log('  ✅ 7. Entrega manual fica pendente e avisa o dono com o link do painel.');

  // 8. Alerta de estoque baixo: uma vez por produto dentro da janela.
  const low = storefront.lowStockEmbed(G, { lang: 'pt', guildName: 'Cringelândia' });
  assert.ok(low, 'Produto no estoque mínimo precisa gerar alerta');
  assert.equal(low.report.needsAttention, true);
  assert.ok(low.embed.toJSON().description.includes('800 Robux'));

  const now = Date.now() + 5 * 60 * 1000;
  const pending = alerts.pendingAlerts(G, { now });
  assert.equal(pending.length, 1, 'Só o pacote esgotado entra no aviso');
  alerts.markNotified(G, pending.map((p) => p.id), now);
  assert.equal(alerts.pendingAlerts(G, { now: now + 60 * 1000 }).length, 0, 'Aviso não se repete no mesmo dia');
  assert.equal(alerts.pendingAlerts(G, { now: now + alerts.DEFAULT_EVERY_MS + 1 }).length, 1, 'No dia seguinte volta');
  assert.equal(alerts.shouldNotify(now, now + 1000), false);
  assert.equal(alerts.shouldNotify(0, now), true);
  console.log('  ✅ 8. Alerta de estoque baixo: um por dia, sem repetir na mesma janela.');

  // 9. Varredura manda a DM e não insiste quando não há nada novo.
  const dms = [];
  const guild = {
    id: G,
    name: 'Cringelândia',
    fetchOwner: async () => ({ id: '1', send: async (body) => dms.push(body) }),
  };
  const clients = { guilds: { cache: new Map([[G, guild]]) } };
  alerts.clearNotified(G, ['800-robux']);
  const sweep = await alerts.scan(clients, { now });
  assert.equal(sweep.checked, 1);
  assert.equal(sweep.sent, 1);
  assert.equal(dms.length, 1);
  assert.deepEqual(dms[0].allowedMentions, { parse: [], users: [], roles: [] }, 'DM sem ping');
  const sweepAgain = await alerts.scan(clients, { now: now + 1000 });
  assert.equal(sweepAgain.sent, 0, 'Já avisado: não manda de novo');
  console.log('  ✅ 9. Varredura envia a DM ao dono, sem ping e sem repetir.');

  // 10. Servidor sem o extra não recebe varredura (nada de DM fora do escopo).
  const outsider = { id: '111111111111111111', name: 'Outro servidor', fetchOwner: async () => null };
  const stranger = { guilds: { cache: new Map([[outsider.id, outsider]]) } };
  const outside = await alerts.scan(stranger, { now });
  assert.equal(outside.checked, 0);
  console.log('  ✅ 10. Servidor sem a lojinha fica fora do alerta.');

  // 11. O handler da interação liga o menu à ficha do pacote (wiring do módulo).
  const maryModule = require('../src/modules/mary-studio');
  const replies = [];
  const select = {
    guildId: G,
    isStringSelectMenu: () => true,
    isButton: () => false,
    customId: storefront.PANEL_ID,
    values: ['800-robux'],
    reply: async (payload) => replies.push(payload),
  };
  await maryModule.storefrontInteraction(select);
  assert.equal(replies.length, 1);
  assert.equal(replies[0].ephemeral, true, 'Ficha do pacote abre só para quem clicou');
  assert.ok(replies[0].embeds[0].toJSON().title.includes('800 Robux'));
  console.log('  ✅ 11. O menu da vitrine abre a ficha do pacote para quem clicou.');

  // 12. Compra manual pelo botão: recibo efêmero, pedido pendente e DM ao dono.
  store.addStock(G, '800-robux', ['CODE-C']);
  const ownerDms = [];
  const buyerDms = [];
  const buy = {
    guildId: G,
    isStringSelectMenu: () => false,
    isButton: () => true,
    customId: `${storefront.BUY_PREFIX}mil-robux`,
    user: { id: OTHER, tag: 'cliente#0002', send: async (body) => buyerDms.push(body) },
    guild: { name: 'Cringelândia', fetchOwner: async () => ({ send: async (body) => ownerDms.push(body) }) },
    reply: async (payload) => replies.push(payload),
  };
  const before = replies.length;
  await maryModule.storefrontInteraction(buy);
  assert.equal(replies.length, before + 1);
  const manualReply = replies[replies.length - 1];
  assert.equal(manualReply.ephemeral, true);
  // O idioma do recibo segue o servidor (a zona Mary responde em EN): checamos o conteúdo neutro.
  const manualDescription = manualReply.embeds[0].toJSON().description;
  assert.ok(manualDescription.includes('Mil Robux'), 'Recibo precisa dizer qual pacote');
  assert.ok(/ord-/.test(manualDescription), 'Recibo leva o número do pedido');
  assert.equal(ownerDms.length, 1, 'Pedido manual avisa o dono na hora');
  assert.deepEqual(ownerDms[0].allowedMentions, { parse: [], users: [], roles: [] });
  assert.equal(buyerDms.length, 0, 'Entrega manual não manda código nenhum para o comprador');
  console.log('  ✅ 12. Compra manual: recibo efêmero, pedido pendente e DM sem ping para o dono.');

  console.log('✅ Vitrine da lojinha e alerta de estoque: todos os testes passaram!');
})().catch((err) => {
  console.error('❌ Falha nos testes da vitrine:', err);
  process.exitCode = 1;
});
