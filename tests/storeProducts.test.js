// Lojinha de Robux: estoque, entrega, order bump e margem (o que faz a venda funcionar).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🛒 Testes da lojinha de Robux...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-storeprod-'));

const store = require('../src/services/storeProducts');

const G = '123456789012345678';
const B = '987654321098765432';

// 1. Taxa do Roblox (30%)
assert.equal(store.robuxNet(1000), 700);
assert.equal(store.robuxGrossFor(700), 1000);
assert.equal(store.robuxGrossFor(1000), 1429);
console.log('  ✅ 1. Robux líquido e bruto com a taxa de 30%.');

// 2. Preço sugerido (tabela de mercado + preço de 1k)
assert.equal(store.suggestPriceCents(400), 1350);
assert.equal(store.suggestPriceCents(1700), 5000);
assert.equal(store.suggestPriceCents(5000, { per1kCents: 3700 }), 18500);
console.log('  ✅ 2. Preço sugerido usa a tabela e o preço de 1k.');

// 3. Margem
const good = store.margin({ priceCents: 1500, costCents: 800, feeCents: 50 });
assert.equal(good.profitCents, 650);
assert.equal(good.marginPercent, 43.3);
assert.equal(good.healthy, true);
const bad = store.margin({ priceCents: 1000, costCents: 950 });
assert.equal(bad.healthy, false);
console.log('  ✅ 3. Margem e alerta de margem apertada.');

// 4. Produto novo (id gerado pelo nome)
const created = store.saveProduct(G, {
  name: '400 Robux',
  priceCents: 1400,
  costCents: 900,
  robux: 400,
  delivery: 'code',
  minStock: 2,
});
assert.equal(created.ok, true);
assert.equal(created.product.id, '400-robux');
assert.equal(created.product.delivery, 'code');
console.log('  ✅ 4. Produto criado com id automático.');

// 5. Validações
assert.equal(store.saveProduct(G, { name: 'Sem preço' }).reason, 'price_required');
assert.equal(
  store.saveProduct(G, { name: 'Link', priceCents: 500, delivery: 'message' }).reason,
  'delivery_url_required'
);
// Q121: preço vazio, zero, abaixo de R$ 1,00 ou acima do teto é recusado (antes virava R$ 1,00 calado).
assert.equal(store.saveProduct(G, { name: 'Vazio', priceCents: '' }).reason, 'price_required');
assert.equal(store.saveProduct(G, { name: 'Zero', priceCents: 0 }).reason, 'price_required');
assert.equal(store.saveProduct(G, { name: 'Baratinho', priceCents: 50 }).reason, 'price_out_of_range');
assert.equal(store.saveProduct(G, { name: 'Caro', priceCents: 99999999 }).reason, 'price_out_of_range');
assert.equal(store.saveProduct(G, { name: 'Custo', priceCents: 500, costCents: -1 }).reason, 'cost_out_of_range');
assert.equal(store.saveProduct(G, { name: 'Link ruim', priceCents: 500, delivery: 'message', deliveryUrl: 'roblox.com' }).reason, 'delivery_url_invalid');
// Editar só o preço de um produto que já existe mantém o resto (estoque incluído).
const edited = store.saveProduct(G, { id: '400-robux', priceCents: 1500 });
assert.equal(edited.ok, true);
assert.equal(edited.product.priceCents, 1500);
assert.equal(edited.product.robux, 400);
assert.equal(store.saveProduct(G, { id: '400-robux', priceCents: 1400 }).product.priceCents, 1400, 'Volta ao preço original');
console.log('  ✅ 5. Preço e link de entrega são obrigatórios.');

// 6. Estoque com código repetido não duplica
const stock = store.addStock(G, '400-robux', ['CODIGO-1', 'CODIGO-2', 'CODIGO-1']);
assert.equal(stock.ok, true);
assert.equal(stock.added, 2);
assert.equal(stock.skipped, 1);
assert.equal(stock.stockCount, 2);
console.log('  ✅ 6. Código repetido é ignorado no estoque.');

// 7. Fila FIFO
const taken = store.takeStock(G, '400-robux');
assert.equal(taken.code, 'CODIGO-1');
assert.equal(taken.stockCount, 1);
console.log('  ✅ 7. Estoque sai em ordem (primeiro que entrou).');

// 8. Entrega via código
const order = store.deliver(G, '400-robux', { buyerId: B });
assert.equal(order.ok, true);
assert.equal(order.order.status, 'paid');
assert.equal(order.order.payload, 'CODIGO-2');
assert.equal(store.stockLevel(G, '400-robux').stockCount, 0);
console.log('  ✅ 8. Entrega por código é imediata e baixa o estoque.');


// 9. Sem estoque não vende
const soldOut = store.deliver(G, '400-robux', { buyerId: B });
assert.equal(soldOut.ok, false);
assert.equal(soldOut.reason, 'out_of_stock');
console.log('  ✅ 9. Estoque zerado bloqueia a venda.');

// 10. Pedido falho devolve o código para a frente da fila
store.addStock(G, '400-robux', ['CODIGO-3']);
const second = store.deliver(G, '400-robux', { buyerId: B });
assert.equal(second.order.payload, 'CODIGO-3');
const failed = store.failOrder(G, second.order.id, 'cliente desistiu');
assert.equal(failed.ok, true);
assert.equal(store.stockLevel(G, '400-robux').stockCount, 1);
assert.equal(store.takeStock(G, '400-robux').code, 'CODIGO-3');
console.log('  ✅ 10. Pedido falho devolve o código (não perde produto).');

// 11. Entrega manual fica pendente até o dono confirmar
store.saveProduct(G, { name: '1700 Robux', priceCents: 4900, robux: 1700, delivery: 'manual' });
const manual = store.deliver(G, '1700-robux', { buyerId: B });
assert.equal(manual.order.status, 'pending');
const confirmed = store.confirmOrder(G, manual.order.id, { payload: 'gamepass: 1700' });
assert.equal(confirmed.ok, true);
assert.equal(confirmed.order.status, 'paid');
assert.equal(confirmed.order.payload, 'gamepass: 1700');
console.log('  ✅ 11. Pedido manual espera a confirmação do dono.');

// 12. Order bump sugere o próximo pacote maior
const bump = store.orderBumpFor(G, '400-robux');
assert.equal(bump.id, '1700-robux');
assert.equal(bump.deltaCents, 3500);
assert.equal(bump.explicit, false);
console.log('  ✅ 12. Order bump aponta o pacote maior e a diferença.');

// 13. Estoque baixo aparece no relatório
store.saveProduct(G, { name: '800 Robux', priceCents: 2400, robux: 800, delivery: 'code', minStock: 3 });
store.addStock(G, '800-robux', ['A', 'B']);
const report = store.stockReport(G);
assert.equal(report.needsAttention, true);
assert.ok(report.low.some((p) => p.id === '800-robux'));
console.log('  ✅ 13. Alerta de estoque baixo lista o produto certo.');

// 14. Vitrine não vaza código
const catalog = store.publicCatalog(G);
assert.ok(catalog.length >= 3);
assert.ok(catalog.every((p) => p.stock === undefined && p.costCents === undefined));
console.log('  ✅ 14. Catálogo público nunca mostra códigos nem custo.');

// 15. Números de venda
const stats = store.salesStats(G);
assert.equal(stats.orders, 2);
assert.equal(stats.revenueCents, 1400 + 4900);
assert.equal(stats.averageTicketCents, 3150);
assert.equal(stats.top.id, '1700-robux');
assert.equal(stats.pending, 0);
console.log('  ✅ 15. Receita, ticket médio e campeão de vendas.');

// 16. Não passa do limite de produtos
for (let i = 0; i < store.MAX_PRODUCTS + 2; i += 1) {
  store.saveProduct(G, { name: `Extra ${i}`, priceCents: 500, delivery: 'manual' });
}
const limited = store.saveProduct(G, { name: 'Um a mais', priceCents: 500, delivery: 'manual' });
assert.equal(limited.ok, false);
assert.equal(limited.reason, 'too_many_products');
console.log('  ✅ 16. Limite de produtos por servidor é respeitado.');

console.log('🛒 Lojinha de Robux: tudo certo.');
