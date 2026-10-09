const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { getLocalizedHtml, SEO_CONFIG, detectRequestLang } = require('../src/utils/seoRenderer');

console.log('🌐 [TEST] Auditoria & Quality Gate de SEO Bilíngue (PT-BR & EN)...');

const publicDir = path.join(__dirname, '..', 'public');
const pages = ['index', 'wiki', 'partnerships', 'museum', 'bonus'];

// 1. robots.txt
const robotsPath = path.join(publicDir, 'robots.txt');
assert.ok(fs.existsSync(robotsPath), 'robots.txt deve existir');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert.ok(robotsContent.includes('User-agent: *'), 'robots.txt deve ter User-agent: *');
assert.ok(robotsContent.includes('Allow: /'), 'robots.txt deve permitir /');
assert.ok(robotsContent.includes('Disallow: /admin'), 'robots.txt deve bloquear /admin');
assert.ok(robotsContent.includes('Disallow: /api/admin/'), 'robots.txt deve bloquear /api/admin/');
assert.ok(robotsContent.includes('Disallow: /console'), 'robots.txt deve bloquear /console');
assert.ok(robotsContent.includes('Sitemap: https://pyxie.com.br/sitemap.xml'), 'robots.txt deve referenciar o sitemap');
console.log('  ✅ 1. robots.txt validado e protegendo rotas privadas.');

// 2. sitemap.xml
const sitemapPath = path.join(publicDir, 'sitemap.xml');
assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml deve existir');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
['https://pyxie.com.br/', 'https://pyxie.com.br/wiki', 'https://pyxie.com.br/parcerias', 'https://pyxie.com.br/museu', 'https://pyxie.com.br/bonus'].forEach((url) => {
  assert.ok(sitemapContent.includes(url), `sitemap deve conter a URL ${url}`);
});
assert.ok(sitemapContent.includes('hreflang="pt-BR"'), 'sitemap deve ter anotação hreflang pt-BR');
assert.ok(sitemapContent.includes('hreflang="en"'), 'sitemap deve ter anotação hreflang en');
assert.ok(sitemapContent.includes('hreflang="x-default"'), 'sitemap deve ter anotação hreflang x-default');
// Versões em inglês mapeadas no sitemap
['https://pyxie.com.br/?lang=en', 'https://pyxie.com.br/wiki?lang=en', 'https://pyxie.com.br/parcerias?lang=en', 'https://pyxie.com.br/museu?lang=en', 'https://pyxie.com.br/bonus?lang=en'].forEach((url) => {
  assert.ok(sitemapContent.includes(url), `sitemap deve conter versão explicitamente em inglês ${url}`);
});
console.log('  ✅ 2. sitemap.xml validado com todas as URLs canônicas e hreflangs bidirecionais.');

// 3. Páginas HTML públicas (Tags canônicas, hreflang, OG, Twitter, Schema.org, Alt texts, H1)
pages.forEach((key) => {
  const conf = SEO_CONFIG[key];
  const filePath = path.join(publicDir, conf.file);
  assert.ok(fs.existsSync(filePath), `Arquivo ${conf.file} deve existir`);
  const html = fs.readFileSync(filePath, 'utf8');

  // Canonical link
  assert.ok(/<link\s+rel=["']canonical["']/i.test(html), `${key}: deve ter link canonical`);
  assert.ok(html.includes(conf.canonical), `${key}: canonical deve ser ${conf.canonical}`);

  // Hreflang links
  assert.ok(html.includes('hreflang="pt-BR"'), `${key}: deve ter hreflang pt-BR`);
  assert.ok(html.includes('hreflang="en"'), `${key}: deve ter hreflang en`);
  assert.ok(html.includes('hreflang="x-default"'), `${key}: deve ter hreflang x-default`);

  // Open Graph
  assert.ok(/<meta\s+property=["']og:title["']/i.test(html), `${key}: deve ter og:title`);
  assert.ok(/<meta\s+property=["']og:description["']/i.test(html), `${key}: deve ter og:description`);
  assert.ok(/<meta\s+property=["']og:image["']/i.test(html), `${key}: deve ter og:image`);
  assert.ok(/<meta\s+property=["']og:site_name["']/i.test(html), `${key}: deve ter og:site_name`);
  assert.ok(/<meta\s+property=["']og:locale["']/i.test(html), `${key}: deve ter og:locale`);
  assert.ok(/<meta\s+property=["']og:image:width["']/i.test(html), `${key}: deve ter og:image:width`);
  assert.ok(/<meta\s+property=["']og:image:height["']/i.test(html), `${key}: deve ter og:image:height`);

  // Twitter
  assert.ok(/<meta\s+name=["']twitter:card["']/i.test(html), `${key}: deve ter twitter:card`);
  assert.ok(/<meta\s+name=["']twitter:title["']/i.test(html), `${key}: deve ter twitter:title`);
  assert.ok(/<meta\s+name=["']twitter:description["']/i.test(html), `${key}: deve ter twitter:description`);

  // Preconnect
  assert.ok(html.includes('https://cdn.discordapp.com'), `${key}: deve ter preconnect para discord cdn`);

  // Schema.org JSON-LD
  const jsonMatches = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  assert.ok(jsonMatches && jsonMatches.length > 0, `${key}: deve conter Schema.org JSON-LD`);
  jsonMatches.forEach((scriptTag) => {
    const raw = scriptTag.replace(/<script[^>]*>|<\/script>/gi, '').trim();
    const parsed = JSON.parse(raw);
    assert.equal(parsed['@context'], 'https://schema.org', `${key}: contexto Schema.org inválido`);
  });

  // Exatamente 1 H1
  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  assert.equal(h1Matches.length, 1, `${key}: deve ter exatamente 1 H1 semântico (encontrados: ${h1Matches.length})`);

  // Imagens com alt não vazio
  const imgRegex = /<img\s+[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    assert.ok(tag.includes('alt='), `${key}: tag img sem alt: ${tag}`);
    assert.ok(!/alt=["']\s*["']/.test(tag), `${key}: tag img com alt vazio: ${tag}`);
  }
});
console.log('  ✅ 3. Todas as 5 páginas HTML auditadas (Canonicals, Hreflang, OG, Twitter, Schema.org, H1 e Alt texts).');

// 4. seoRenderer dinâmico (PT vs EN)
pages.forEach((key) => {
  const conf = SEO_CONFIG[key];

  const ptHtml = getLocalizedHtml(key, 'pt', publicDir);
  assert.ok(ptHtml.includes('<html lang="pt-BR">'), `${key}: pt deve ter <html lang="pt-BR">`);
  assert.ok(ptHtml.includes(conf.pt.title), `${key}: pt deve conter título em português`);
  assert.ok(ptHtml.includes(conf.pt.description), `${key}: pt deve conter descrição em português`);
  assert.ok(ptHtml.includes('content="pt_BR"'), `${key}: pt deve ter locale pt_BR`);

  const enHtml = getLocalizedHtml(key, 'en', publicDir);
  assert.ok(enHtml.includes('<html lang="en">'), `${key}: en deve ter <html lang="en">`);
  assert.ok(enHtml.includes(conf.en.title), `${key}: en deve conter título em inglês`);
  assert.ok(enHtml.includes(conf.en.description), `${key}: en deve conter descrição em inglês`);
  assert.ok(enHtml.includes('content="en_US"'), `${key}: en deve ter locale en_US`);
});
console.log('  ✅ 4. seoRenderer dinâmico validado com entrega instantânea de metadados PT e EN.');

// 5. Detecção de idioma
assert.equal(detectRequestLang({ query: { lang: 'en' } }), 'en');
assert.equal(detectRequestLang({ query: { lang: 'pt' } }), 'pt');
assert.equal(detectRequestLang({ cookies: { pyxie_lang: 'en' } }), 'en');
assert.equal(detectRequestLang({ headers: { 'accept-language': 'en-US,en;q=0.9' } }), 'en');
assert.equal(detectRequestLang({ headers: { 'accept-language': 'pt-BR,pt;q=0.9' } }), 'pt');
assert.equal(detectRequestLang({}), 'pt');
console.log('  ✅ 5. Detecção de idioma de requisição (Query, Headers, Cookies) validada.');

console.log('🎉 [TEST] Quality Gate de SEO Bilíngue passou com 100% de sucesso!');
