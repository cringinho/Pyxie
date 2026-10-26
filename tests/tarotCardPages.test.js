const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Páginas de significado das 78 cartas (SEO PT/EN) e cartas em inglês no bot.
 */

const { TAROT_CATALOG, localizeCard, getCardBySlug } = require('../src/data/tarotCardsCatalog');
const english = require('../src/data/tarot_en.json');
const pages = require('../src/services/tarotCardPages');
const { updateSitemap } = require('../scripts/generate_tarot_sitemap');
const { getDefaultUrlList } = require('../src/services/indexNowService');

console.log('🃏 Iniciando testes das páginas de cartas do Tarot...');

// 1. Dados em inglês e slugs
assert.equal(TAROT_CATALOG.length, 78);
assert.equal(Object.keys(english).length, 78, 'Toda carta tem versão em inglês.');
const slugs = new Set(TAROT_CATALOG.map((c) => c.slug));
const slugsEn = new Set(TAROT_CATALOG.map((c) => c.slugEn));
assert.equal(slugs.size, 78, 'Slugs PT únicos.');
assert.equal(slugsEn.size, 78, 'Slugs EN únicos.');
assert.ok([...slugs].every((s) => /^[a-z0-9-]+$/.test(s)), 'Slugs só com a-z, 0-9 e hífen.');
assert.ok([...slugs].every((s) => !slugsEn.has(s)), 'Nenhum slug EN colide com um slug PT.');
for (const card of TAROT_CATALOG) {
  const en = english[card.id];
  assert.ok(en.name && en.upright && en.reversed, `${card.id}: textos EN completos.`);
  assert.equal(en.keywords.length, card.keywords.length, `${card.id}: mesma quantidade de palavras-chave.`);
}
const fool = localizeCard(getCardBySlug('o-louco'), 'en');
assert.equal(fool.name, 'THE FOOL');
assert.equal(fool.arcana, 'Major Arcana');
const page = localizeCard(TAROT_CATALOG.find((c) => c.id === 'swords_page'), 'en');
assert.equal(page.num, 'PAGE', 'Cartas da corte com número em inglês.');
assert.equal(page.arcana, 'Minor Arcana • Swords');
assert.equal(localizeCard(TAROT_CATALOG[0], 'pt'), TAROT_CATALOG[0], 'PT devolve a carta original.');
console.log('  ✅ 1. 78 cartas em PT e EN com slugs únicos.');

// 2. Páginas de carta
function auditPage(html, label) {
  assert.equal((html.match(/<h1[\s>]/gi) || []).length, 1, `${label}: exatamente 1 H1.`);
  assert.ok(/<link rel="canonical" href="https:\/\/pyxie\.com\.br\/[^"#]*"/.test(html), `${label}: canonical absoluta.`);
  for (const lang of ['pt-BR', 'en', 'x-default']) {
    assert.ok(html.includes(`hreflang="${lang}"`), `${label}: hreflang ${lang}.`);
  }
  for (const tag of ['og:title', 'og:description', 'og:image', 'og:image:width', 'og:image:height', 'og:site_name', 'og:locale']) {
    assert.ok(html.includes(`property="${tag}"`), `${label}: ${tag}.`);
  }
  for (const tag of ['twitter:card', 'twitter:title', 'twitter:description']) {
    assert.ok(html.includes(`name="${tag}"`), `${label}: ${tag}.`);
  }
  assert.ok(html.includes('https://cdn.discordapp.com'), `${label}: preconnect Discord CDN.`);
  const blocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  assert.ok(blocks.length >= 1, `${label}: JSON-LD.`);
  for (const block of blocks) {
    const data = JSON.parse(block.replace(/<\/?script[^>]*>/g, ''));
    assert.equal(data['@context'], 'https://schema.org', `${label}: @context.`);
  }
  const imgs = html.match(/<img\s[^>]*>/g) || [];
  for (const img of imgs) {
    assert.ok(/alt="[^"]+"/.test(img), `${label}: img com alt: ${img}`);
  }
  const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(description.length >= 70 && description.length <= 160, `${label}: description com ${description.length} caracteres.`);
}

for (const card of TAROT_CATALOG) {
  for (const lang of ['pt', 'en']) {
    const html = pages.renderCardPage(card, lang);
    const label = `${card.slug} (${lang})`;
    auditPage(html, label);
    const expected = pages.cardUrl(card, lang);
    assert.ok(html.includes(`<link rel="canonical" href="${expected}" />`), `${label}: canonical autorreferencial.`);
    assert.ok(html.includes(`<html lang="${lang === 'en' ? 'en' : 'pt-BR'}">`), `${label}: idioma do documento.`);
    assert.ok(html.includes(`hreflang="pt-BR" href="${pages.cardUrl(card, 'pt')}"`));
    assert.ok(html.includes(`hreflang="en" href="${pages.cardUrl(card, 'en')}"`));
    const localized = localizeCard(card, lang);
    assert.ok(html.includes(localized.upright.replace(/'/g, '&#39;')), `${label}: significado em pé no idioma certo.`);
    assert.ok(html.includes('/invite?ref=tarot-card'), `${label}: CTA de convite com origem.`);
  }
}
const ptHtml = pages.renderCardPage(TAROT_CATALOG[0], 'pt');
assert.ok(ptHtml.includes('O Louco: significado da carta no Tarot'));
assert.ok(ptHtml.includes('/assets/tarot/cards/card_01.jpg'), 'PT usa a arte estática.');
const enHtml = pages.renderCardPage(TAROT_CATALOG[0], 'en');
assert.ok(enHtml.includes('The Fool tarot card meaning'));
assert.ok(enHtml.includes('/api/tarot/card-image?id=major_00&amp;lang=en'), 'EN usa a arte com textos em inglês (& escapado no atributo).');
assert.ok(!/<script>(?!.*ld\+json)/.test(ptHtml), 'Página sem JavaScript de cliente.');
console.log('  ✅ 2. 156 páginas de carta auditadas (H1, canonical, hreflang, OG, Twitter, JSON-LD, alt e description).');

// 3. Índice
for (const lang of ['pt', 'en']) {
  const hub = pages.renderHubPage(lang);
  auditPage(hub, `índice (${lang})`);
  const links = new Set(hub.match(/href="\/tarot\/carta\/[a-z0-9-]+(\?lang=en)?"/g));
  assert.equal(links.size, 78, `Índice ${lang} liga as 78 cartas.`);
  assert.ok(hub.includes(`<link rel="canonical" href="${pages.hubUrl(lang)}" />`));
}
console.log('  ✅ 3. Índice das 78 cartas em PT e EN.');

// 4. Rotas
assert.equal(pages.resolveCardRequest('o-louco').card.id, 'major_00');
assert.deepEqual(pages.resolveCardRequest('the-fool'), { redirect: '/tarot/carta/o-louco?lang=en' }, 'Slug em inglês redireciona.');
assert.deepEqual(pages.resolveCardRequest('nao-existe'), {});
assert.deepEqual(pages.resolveCardRequest('../../etc/passwd'), {});
const serverSource = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
assert.ok(serverSource.includes("app.get('/tarot/carta/:slug'"), 'Rota da carta registrada.');
assert.ok(serverSource.includes("app.get('/tarot/cartas'"), 'Rota do índice registrada.');
console.log('  ✅ 4. Rotas, redirecionamento 301 e 404.');

// 5. Sitemap, IndexNow e feed
const sitemap = fs.readFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), 'utf8');
for (const url of pages.getAllTarotPageUrls()) {
  assert.ok(sitemap.includes(`<loc>${url.replace(/&/g, '&amp;')}</loc>`), `sitemap contém ${url}`);
}
assert.ok(sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));
const lastmod = sitemap.match(/tarot-cards:start[\s\S]*?<lastmod>([^<]+)<\/lastmod>/)[1];
assert.equal(updateSitemap(sitemap, lastmod), sitemap, 'Gerador do sitemap é idempotente (rode scripts/generate_tarot_sitemap.js).');
const indexNowUrls = getDefaultUrlList();
assert.ok(indexNowUrls.includes('https://pyxie.com.br/tarot/carta/o-louco'), 'IndexNow inclui as páginas das cartas.');
assert.ok(indexNowUrls.includes('https://pyxie.com.br/tarot/cartas?lang=en'));
const robots = fs.readFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), 'utf8');
assert.ok(robots.includes('Disallow: /mary'), 'robots.txt bloqueia /mary (AGENTS.md §8).');
const { getFeedItems } = require('../src/services/feedGenerator');
const feedEn = getFeedItems('en')[0];
assert.ok(/^https:\/\/pyxie\.com\.br\/tarot\/carta\/[a-z0-9-]+\?lang=en&utm_source=rss_daily_tarot$/.test(feedEn.link), 'Feed EN leva à página da carta.');
assert.ok(!/[ÃÕÇÁÉÍÓÚ]/.test(feedEn.title), 'Título do feed EN com o nome da carta em inglês.');
console.log('  ✅ 5. Sitemap com hreflang e imagens, IndexNow, robots e feed apontando para as cartas.');

// 6. Bot: carta no idioma do servidor e botão para a página
const pyTarot = require('../src/modules/tarot/commands/pyTarot');
const rootTarot = require('../src/commands/tarot');
const raw = require('../src/data/tarot.json')[0];
for (const command of [pyTarot, rootTarot]) {
  const embedEn = command.buildTarotEmbed({ card: raw, orientation: 'UPRIGHT', discovery: null }, { lang: 'en' }).toJSON();
  assert.ok(embedEn.description.includes('THE FOOL'), 'Embed EN com nome em inglês.');
  assert.ok(embedEn.description.includes('Freedom'), 'Embed EN com palavras-chave em inglês.');
  const embedPt = command.buildTarotEmbed({ card: raw, orientation: 'UPRIGHT', discovery: null }, { lang: 'pt' }).toJSON();
  assert.ok(embedPt.description.includes('O LOUCO'));
  const row = command.buildBribeRow({ lang: 'en' }, raw).toJSON().components;
  assert.equal(row.length, 2);
  assert.equal(row[1].url, 'https://pyxie.com.br/tarot/carta/o-louco?lang=en&utm_source=discord_tarot');
  assert.equal(command.buildBribeRow({ lang: 'pt' }).toJSON().components.length, 1, 'Sem carta, só o botão de nova tiragem.');
}
console.log('  ✅ 6. /py-tarot em inglês nos servidores EN e botão para o significado completo.');

console.log('🎉 tests/tarotCardPages.test.js concluído com 100% de sucesso!');
