const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

console.log('🔎 [TEST] SEO de longo prazo (URLs por idioma, canonical, hreflang e sitemap)...');

const seo = require('../src/utils/seoRenderer');
const pages = require('../src/services/tarotCardPages');
const { getDefaultUrlList } = require('../src/services/indexNowService');
const publicDir = path.join(__dirname, '..', 'public');

// 1. Uma URL por idioma em todas as páginas do SEO_CONFIG
for (const key of Object.keys(seo.SEO_CONFIG)) {
  const links = seo.languageLinks(key);
  assert.ok(links, `${key}: languageLinks obrigatório`);
  assert.notEqual(links.urls.pt, links.urls.en, `${key}: PT e EN não podem compartilhar URL`);
  assert.ok(new URL(links.urls.en).pathname.startsWith('/en'), `${key}: EN precisa viver em /en/...`);
  assert.ok(!links.urls.pt.includes('?') && !links.urls.en.includes('?'), `${key}: URLs sem query`);
  assert.deepEqual(
    links.alternates.map((a) => a.hreflang),
    ['pt-BR', 'en', 'x-default'],
    `${key}: trio hreflang completo`,
  );
  assert.equal(links.alternates[2].href, links.urls.pt, `${key}: x-default aponta para o PT`);
}
console.log('  ✅ 1. Todas as páginas têm URL própria em PT e em /en/.');

// 2. HTML servido com canonical/hreflang no idioma certo e sem ?lang=
for (const key of Object.keys(seo.SEO_CONFIG)) {
  const urls = seo.pageUrls(key);
  const pt = seo.injectSeo(fs.readFileSync(path.join(publicDir, seo.SEO_CONFIG[key].file), 'utf8'), key, 'pt');
  const en = seo.injectSeo(fs.readFileSync(path.join(publicDir, seo.SEO_CONFIG[key].file), 'utf8'), key, 'en');
  assert.ok(pt.includes(`rel="canonical" href="${urls.pt}"`), `${key}: canonical PT`);
  assert.ok(en.includes(`rel="canonical" href="${urls.en}"`), `${key}: canonical EN`);
  assert.ok(en.includes(`<html lang="en">`), `${key}: <html lang="en">`);
  assert.ok(pt.includes(`<html lang="pt-BR">`), `${key}: <html lang="pt-BR">`);
  assert.ok(!/href="[^"]*\?lang=/.test(pt + en), `${key}: nenhum href com ?lang= depois da injeção`);
}
console.log('  ✅ 2. Canonical, hreflang e <html lang> corretos nos dois idiomas.');

// 3. ?lang= antigo responde 301 para o caminho definitivo
const handler = seo.serveLocalizedPage('tarot', publicDir);
const fakeRes = () => {
  const res = {
    statusCode: 0,
    redirect(code, target) {
      res.statusCode = code;
      res.target = target;
      return res;
    },
    setHeader() {},
    send() {},
  };
  return res;
};
for (const [query, target] of [
  [{ lang: 'en' }, '/en/tarot'],
  [{ lang: 'pt' }, '/tarot'],
  [{ lang: 'en', utm_source: 'x' }, '/en/tarot?utm_source=x'],
]) {
  const res = fakeRes();
  handler({ originalUrl: `/tarot?${new URLSearchParams(query)}`, query }, res);
  assert.equal(res.statusCode, 301, `?lang=${query.lang} deve ser 301`);
  assert.equal(res.target, target, `destino de ?lang=${query.lang}`);
}
console.log('  ✅ 3. `?lang=` vira 301 permanente (preservando os outros parâmetros).');

// 4. Sitemap: sem query, com cluster hreflang recíproco
const sitemap = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.ok(locs.length >= 184, `sitemap com todas as URLs (${locs.length})`);
assert.equal(new Set(locs).size, locs.length, 'sitemap sem duplicatas');
assert.ok(!sitemap.includes('?lang='), 'sitemap sem URLs com ?lang=');
const blocks = sitemap.split('<url>').slice(1);
const cluster = new Map();
for (const block of blocks) {
  const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  const alternates = [...block.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)].map((m) => m[1]);
  cluster.set(loc, alternates);
}
for (const [loc, alternates] of cluster) {
  assert.equal(alternates.length, 3, `${loc}: 3 hreflang no sitemap`);
  for (const href of alternates) assert.ok(cluster.has(href), `${loc}: hreflang ${href} também está no sitemap`);
}
console.log(`  ✅ 4. Sitemap com ${locs.length} URLs e hreflang recíproco em todo o cluster.`);

// 5. Tarot por caminho (hub e cartas) e IndexNow/robots alinhados
const tarotSitemap = pages.buildSitemapEntries('2026-10-31');
assert.ok(!tarotSitemap.includes('?lang='), 'sitemap do tarot sem ?lang=');
assert.ok(tarotSitemap.includes('<loc>https://pyxie.com.br/en/tarot/cartas</loc>'), 'hub EN no sitemap');
assert.ok(tarotSitemap.includes('<loc>https://pyxie.com.br/en/tarot/carta/o-louco</loc>'), 'carta EN no sitemap');
assert.ok(pages.renderHubPage('en').includes('href="/en/tarot/carta/'), 'links do hub EN apontam para /en/...');
assert.ok(!pages.renderCardPage(require('../src/data/tarotCardsCatalog').TAROT_CATALOG[0], 'en').includes('?lang='), 'carta EN sem ?lang=');
const indexNow = getDefaultUrlList();
assert.ok(indexNow.includes('https://pyxie.com.br/en/tarot'), 'IndexNow com a versão EN');
assert.ok(indexNow.every((url) => !url.includes('?lang=')), 'IndexNow sem ?lang=');
const robots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8');
assert.ok(robots.includes('Allow: /en/'), 'robots libera /en/');
assert.ok(robots.includes('Disallow: /dashboard'), 'robots bloqueia o painel');
console.log('  ✅ 5. Tarot, IndexNow e robots no novo esquema de URLs.');

console.log('🎉 tests/seoLongTerm.test.js concluído com 100% de sucesso!');
