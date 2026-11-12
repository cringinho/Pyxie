const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🛍️ Testes do link rotativo da Shopee (/go) e da oferta depois do bônus...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-go-'));
const rot = require('../src/services/shopeeRotator');

const item = (id, comissao, vendas, extra = {}) => ({ id, titulo: `Produto ${id}`, comissao, vendas, link: `https://s.shopee.com.br/${id}`, active: true, ...extra });
const items = [item('a', 'R$5,04', '2mil+'), item('b', 'R$50,37', '0'), item('c', 'R$12,78', '521'), item('d', 'R$9,31', '38')];

try {
  // 1. Peso: comissão em reais com prova de venda; sem venda ainda entra com peso mínimo.
  assert.equal(rot.salesOf('2mil+'), 2000);
  assert.equal(rot.salesOf('521'), 521);
  assert.ok(rot.weightOf(items[1]) > rot.weightOf(items[0]), 'Comissão alta vence a de R$ 5');
  assert.ok(rot.weightOf(items[2]) > rot.weightOf(items[3]), 'Mais prova de venda sobe o peso');
  assert.equal(rot.weightOf(item('x', '', '')), 1);
  console.log('  ✅ 1. Peso por comissão e prova de venda.');

  // 2. Rotação: todos aparecem, ninguém repete em seguida e o sorteio é ponderado.
  rot._resetRecent();
  const seen = [];
  for (let i = 0; i < 40; i += 1) seen.push(rot.pickItem({ items }).id);
  assert.equal(new Set(seen).size, items.length, 'Todos os produtos entram na rotação');
  for (let i = 1; i < seen.length; i += 1) assert.notEqual(seen[i], seen[i - 1], 'Sem repetir em seguida');
  assert.equal(rot.pickItem({ items: [] }), null);
  rot._resetRecent();
  assert.equal(rot.pickItem({ items: [item('solo', 'R$1', '1')] }).id, 'solo');
  console.log('  ✅ 2. Rotação sem repetir.');

  // 3. Segurança: só link da Shopee vira destino.
  assert.equal(rot.safeLink('https://s.shopee.com.br/abc'), 'https://s.shopee.com.br/abc');
  assert.equal(rot.safeLink('https://shopee.com.br/produto'), 'https://shopee.com.br/produto');
  for (const bad of ['http://s.shopee.com.br/x', 'https://evil.com/?u=shopee.com.br', 'https://shopee.com.br.evil.com/x', 'javascript:alert(1)', '//evil.com', '']) {
    assert.equal(rot.safeLink(bad), null, bad);
  }
  const poisoned = [item('p', 'R$9', '1', { link: 'https://evil.com/x' }), item('q', 'R$9', '1')];
  rot._resetRecent();
  for (let i = 0; i < 10; i += 1) assert.equal(rot.pickItem({ items: poisoned }).id, 'q', 'Link fora da Shopee nunca é sorteado');
  assert.equal(rot.targetFor(null), rot.FALLBACK_LINK);
  console.log('  ✅ 3. Só vai para a Shopee.');

  // 4. Cliques contados por produto, origem e dia; origem inválida vira "site".
  const T = Date.UTC(2026, 10, 12, 15, 0, 0);
  rot.recordClick({ id: 'a', source: 'bonus', now: T });
  rot.recordClick({ id: 'a', source: 'bonus', now: T + 1000 });
  rot.recordClick({ id: 'b', source: '../../etc', now: T + 2000 });
  const stats = rot.insights();
  assert.equal(stats.total, 3);
  assert.equal(stats.bySource.bonus, 2);
  assert.equal(stats.bySource.site, 1, 'Origem inválida cai em "site"');
  assert.equal(stats.byDay['2026-11-12'], 3);
  assert.equal(stats.top[0].id, 'a');
  assert.equal(stats.top[0].clicks, 2);
  assert.ok(!fs.existsSync(path.join(process.env.PYXIE_DATA_DIR, 'shopeeClicks.json.tmp')), 'Escrita atômica não deixa .tmp');
  console.log('  ✅ 4. Cliques por produto, origem e dia.');

  // 5. Oferta depois do bônus: botão por padrão, automática só se o dono ligar.
  assert.deepEqual(rot.bonusOffer({}), { mode: 'forced', url: '/go?src=bonus', delaySeconds: 2 });
  assert.equal(rot.bonusOffer({ SHOPEE_BONUS_REDIRECT: 'button' }).mode, 'button');
  assert.equal(rot.bonusOffer({ SHOPEE_BONUS_REDIRECT: 'auto' }).delaySeconds, 6);
  assert.equal(rot.bonusOffer({ SHOPEE_BONUS_REDIRECT: 'off' }), null);
  assert.equal(rot.bonusOffer({ SHOPEE_BONUS_REDIRECT: 'AUTO' }).mode, 'auto');
  assert.equal(rot.bonusOffer({ SHOPEE_BONUS_REDIRECT: 'qualquer' }).mode, 'forced');
  console.log('  ✅ 5. Oferta do bônus: forçada, automática, botão ou desligada.');

  // 6. A tela do bônus e a rota estão ligadas e /go fica fora dos buscadores.
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.match(server, /app\.get\(\['\/go', '\/go\/:id'\]/);
  assert.match(server, /shopee: shopeeRotator\.bonusOffer\(\)/);
  assert.match(server, /app\.get\('\/api\/bonus\/offer'/);
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), 'utf8'), /Disallow: \/go/);
  const i18n = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'utils', 'i18n.js'), 'utf8');
  assert.equal((i18n.match(/'bonus\.shopee\.cta'/g) || []).length, 2, 'Texto PT e EN do botão');
  console.log('  ✅ 6. Rota, robots e textos PT/EN.');

  console.log('🛍️ Link rotativo da Shopee: tudo certo.');
  process.exit(0);
} catch (err) {
  console.error('❌ Falha no link rotativo da Shopee:', err);
  process.exit(1);
}
