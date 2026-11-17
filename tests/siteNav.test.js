const assert = require('node:assert');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const NAV = require('../src/config/siteNav.json');
const { t } = require('../src/utils/i18n');
const { renderHeader, renderFooter } = require('../src/utils/siteChrome');

// A lista única de links (src/config/siteNav.json) alimenta o menu do React e o das páginas
// estáticas. Este teste garante que os dois lados têm todos os textos, nos dois idiomas (AGENTS §1).
(async () => {
  console.log('Verificando a lista única de links do site...');
  const { I18N } = await import(pathToFileURL(path.join(__dirname, '../client/src/utils/i18n.js')).href);
  const cap = (id) => id.charAt(0).toUpperCase() + id.slice(1);

  const clientKeys = new Set();
  const serverKeys = new Set();
  for (const it of NAV.header) {
    clientKeys.add(`nav.${it.id}`);
    serverKeys.add(`nav.${it.id}`);
  }
  for (const it of NAV.community) {
    clientKeys.add(`nav.${it.id}`).add(`nav.${it.id}Desc`);
    serverKeys.add(`nav.${it.id}`).add(`navDesc.${it.id}`);
  }
  for (const g of NAV.footer) {
    clientKeys.add(`footer.group${cap(g.id)}`);
    serverKeys.add(`footerGroup.${g.id}`);
    for (const l of g.links) {
      clientKeys.add(`footer.${l.id}`);
      serverKeys.add(`footer.${l.id}`);
    }
  }
  for (const lang of ['pt', 'en']) {
    for (const k of clientKeys) assert.ok(I18N[lang][k], `client/src/utils/i18n.js sem "${k}" em ${lang}`);
    for (const k of serverKeys) {
      const v = t(`siteChrome.${k}`, lang);
      assert.ok(v && v !== `siteChrome.${k}`, `src/utils/i18n.js sem "siteChrome.${k}" em ${lang}`);
    }
  }

  // Todo link interno começa com "/" e nada de ?lang= (SEO, AGENTS §8).
  const all = [...NAV.header, ...NAV.community, ...NAV.footer.flatMap((g) => g.links), NAV.account, NAV.cta];
  for (const it of all) if (it.href) assert.ok(it.href.startsWith('/') && !it.href.includes('lang='), `href inválido: ${it.href}`);

  // O cabeçalho estático mostra exatamente os links da lista (mesmo número que o React).
  const header = renderHeader({ lang: 'pt' });
  const desktopLinks = NAV.header.filter((it) => !it.menu).length;
  assert.strictEqual((header.match(/class="pxc-link" href=/g) || []).length, desktopLinks);
  assert.strictEqual((header.match(/class="pxc-pop-link"/g) || []).length, NAV.community.length);
  const footer = renderFooter({ lang: 'en' });
  const footerItems = NAV.footer.reduce((n, g) => n + g.links.length, 0);
  assert.strictEqual((footer.match(/<a href=|data-pxc-cookies/g) || []).length, footerItems, 'rodapé com todos os links da lista');
  assert.ok(!header.includes('#pilares'), 'nada de âncora para a home antiga');

  console.log('✔ Lista única de links ok.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
