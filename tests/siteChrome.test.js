const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { renderHeader, renderFooter, applySiteChrome } = require('../src/utils/siteChrome');
const { getLocalizedHtml } = require('../src/utils/seoRenderer');

console.log('Verificando o cabeçalho e o rodapé únicos das páginas estáticas...');
const publicDir = path.join(__dirname, '..', 'public');

// 1. Bilíngue (AGENTS §1): os dois idiomas saem traduzidos e com os links do idioma certo.
const hPt = renderHeader({ lang: 'pt', active: 'wiki', altHref: '/en/wiki' });
const hEn = renderHeader({ lang: 'en', active: 'wiki', altHref: '/wiki' });
assert.ok(hPt.includes('Comunidade') && hPt.includes('href="/wiki"'));
assert.ok(hEn.includes('Community') && hEn.includes('href="/en/wiki"'));
assert.ok(hEn.includes('href="/wiki" hreflang="pt-BR"'), 'botão de idioma leva para a mesma página no outro idioma');
assert.ok(hPt.includes('aria-current="page"'), 'link da página atual marcado');
assert.ok(renderFooter({ lang: 'pt' }).includes('Confiança') && renderFooter({ lang: 'en' }).includes('Trust &amp; safety'));

// 2. SEO (AGENTS §8): nada de ?lang= no HTML servido; um só <h1>; imagens com alt.
for (const html of [hPt, hEn, renderFooter({ lang: 'pt' }), renderFooter({ lang: 'en' })]) {
  assert.ok(!/href="[^"]*\?lang=/.test(html), 'cabeçalho/rodapé sem ?lang=');
  assert.ok(!/<h1/i.test(html), 'cabeçalho/rodapé não podem ter <h1>');
  for (const img of html.match(/<img [^>]*>/g) || []) assert.ok(/ alt="[^"]+"/.test(img), `imagem sem alt: ${img}`);
}

// 3. Marcadores: página sem marcador volta intacta; com marcador, recebe CSS/JS e fontes uma vez só.
assert.strictEqual(applySiteChrome('<html><head></head><body>x</body></html>'), '<html><head></head><body>x</body></html>');
const applied = applySiteChrome('<html><head></head><body><!--pyx:header--><main></main><!--pyx:footer--></body></html>', { lang: 'pt' });
assert.ok(applied.includes('data-pxc-header') && applied.includes('class="pxc-footer"'));
assert.strictEqual((applied.match(/site-chrome\.css/g) || []).length, 1);
assert.strictEqual((applied.match(/css\/fonts\.css/g) || []).length, 1);

// 4. Páginas estáticas convertidas: servidas com cabeçalho e rodapé, sem marcador sobrando.
for (const key of ['cringelandia', 'market', 'pass', 'tarot', 'terms', 'privacy', 'plans', 'transparency', 'parents']) {
  for (const lang of ['pt', 'en']) {
    const html = getLocalizedHtml(key, lang, publicDir);
    assert.ok(html && html.includes('data-pxc-header') && html.includes('class="pxc-footer"'), `${key}/${lang}: sem cabeçalho/rodapé`);
    assert.ok(!html.includes('<!--pyx:'), `${key}/${lang}: marcador sobrando`);
  }
}

// 5. Páginas de erro também usam os marcadores.
for (const f of ['404.html', '500.html']) {
  const raw = fs.readFileSync(path.join(publicDir, f), 'utf8');
  assert.ok(raw.includes('<!--pyx:header-->') && raw.includes('<!--pyx:footer-->'), `${f} sem marcadores`);
}

console.log('✔ Cabeçalho e rodapé únicos ok.');
