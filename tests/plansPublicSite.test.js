// Página pública de planos e paywall do painel: os preços do site têm de sair do catálogo
// (mensal, anual e extra) e a tela precisa abrir o paywall em vez do erro genérico.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

console.log('💳 Testes da página pública de planos e do paywall...');

const plans = require('../src/services/guildPlans');
const addons = require('../src/config/planAddons');

const root = path.join(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const pages = {
  pt: read('public', 'planos.html'),
  en: read('public', 'planos.en.html'),
};
const clientI18n = read('client', 'src', 'dashboard', 'i18n.js');
const clientApi = read('client', 'src', 'dashboard', 'api.js');
const dashboard = read('client', 'src', 'dashboard', 'Dashboard.jsx');
const paywall = read('client', 'src', 'dashboard', 'Paywall.jsx');
const routes = read('src', 'routes', 'dashboardRoutes.js');

/** `R$ 7` casa, `R$ 70` não casa quando o esperado é 7 (sem confundir centena). */
const hasPrice = (html, cents) => new RegExp(`R\\$\\s*${Math.round(cents / 100)}(?!\\d)`).test(html);
const count = (text, needle) => text.split(needle).length - 1;

// 1. Mensal e anual de cada plano aparecem nos dois idiomas.
for (const [lang, html] of Object.entries(pages)) {
  for (const plan of ['basic', 'premium']) {
    assert.ok(hasPrice(html, plans.PRICES[plan]), `${lang}: falta o mensal de ${plan}`);
    assert.ok(hasPrice(html, plans.PRICES_ANNUAL[plan]), `${lang}: falta o anual de ${plan}`);
  }
  console.log(`  ✅ 1.${lang} Mensal e anual dos dois planos aparecem na página.`);
}

// 2. Extra da lojinha (mensal e anual) aparece nos dois idiomas.
for (const [lang, html] of Object.entries(pages)) {
  assert.ok(hasPrice(html, addons.priceOf('lojinha', 'month')), `${lang}: falta o mensal do extra`);
  assert.ok(hasPrice(html, addons.priceOf('lojinha', 'year')), `${lang}: falta o anual do extra`);
  assert.ok(html.includes('2 meses grátis') || html.includes('2 months free'), `${lang}: falta o aviso de 2 meses grátis`);
}
console.log('  ✅ 2. Extra de lojinha com mensal, anual e a economia anunciada.');

// 3. SEO: um <h1>, canonical, hreflang recíproco e JSON-LD com os preços anuais.
for (const [lang, html] of Object.entries(pages)) {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${lang}: precisa de exatamente um <h1>`);
  assert.ok(/rel="canonical"/.test(html), `${lang}: falta canonical`);
  for (const hreflang of ['pt-BR', 'en', 'x-default']) {
    assert.ok(html.includes(`hreflang="${hreflang}"`), `${lang}: falta hreflang ${hreflang}`);
  }
  assert.ok(html.includes('application/ld+json'), `${lang}: falta JSON-LD`);
  assert.ok(html.includes(`"price":"${(plans.PRICES_ANNUAL.premium / 100).toFixed(2)}"`), `${lang}: JSON-LD sem o anual`);
  assert.ok(html.includes(`"price":"${(addons.priceOf('lojinha', 'month') / 100).toFixed(2)}"`), `${lang}: JSON-LD sem o extra`);
  const images = html.match(/<img\b[^>]*>/g) || [];
  assert.ok(images.every((tag) => /\balt=/.test(tag)), `${lang}: imagem sem alt`);
}
console.log('  ✅ 3. SEO bilíngue: um h1, canonical, hreflang, JSON-LD e alt nas imagens.');

// 4. O painel abre o paywall em vez do erro genérico.
assert.ok(clientApi.includes('plan_required:'), 'api.js precisa carregar o plano exigido no código do erro');
assert.ok(paywall.includes('export function planFromCode'), 'Paywall precisa expor planFromCode');
assert.ok(dashboard.includes('planFromCode(code)'), 'ErrorNotice precisa reconhecer o bloqueio por plano');
assert.ok(dashboard.includes('<Paywall'), 'Seção travada precisa renderizar o paywall');
console.log('  ✅ 4. 403 `plan_required` vira paywall (seção e rota), não erro genérico.');

// 5. Chaves novas do painel nos dois idiomas (paridade PT/EN da interface).
for (const key of ['plan.lockedGo', 'plan.lockedBack', 'plan.store.title', 'plan.store.open', 'store.prod.panelGo', 'store.prod.panelOk']) {
  assert.equal(count(clientI18n, `"${key}"`), 2, `${key}: precisa existir em PT e EN`);
}
console.log('  ✅ 5. Chaves do paywall e do painel da lojinha em PT e EN.');

// 6. Backend do painel publicado: rota da vitrine existe e exige o extra.
assert.ok(routes.includes("'/api/dashboard/guilds/:guildId/store/panel'"), 'falta a rota que publica a vitrine');
assert.ok(/store\/panel[\s\S]{0,200}requireMaryOrAddon/.test(routes), 'a rota da vitrine precisa do gate do extra');
console.log('  ✅ 6. Rota do painel da lojinha com o gate do extra no backend.');

console.log('✅ Página pública de planos e paywall: todos os testes passaram!');
