/**
 * Cabeçalho e rodapé únicos das páginas estáticas do site (as que não usam o app React).
 * Visual idêntico ao Navbar/Footer do React (client/src/components/layout): mesma marca,
 * mesmos links, menu lateral no celular. Montado no servidor: sem salto de layout e
 * os links continuam visíveis para buscadores.
 *
 * Uso nas páginas: `<!--pyx:header-->` e `<!--pyx:footer-->` no HTML. `applySiteChrome`
 * troca os marcadores e injeta o CSS/JS compartilhados (public/css e public/js/site-chrome.*).
 */
const { t } = require('./i18n');
// Fonte única dos links (a mesma lista que o React usa).
const NAV = require('../config/siteNav.json');

const ASSET_VERSION = '2';

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Ícones (traço do Lucide, o mesmo pacote do React).
const ICONS = {
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  feather:
    '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
};

function icon(name, cls = '') {
  return `<svg class="pxc-icon ${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

/**
 * Caminho em PT (como está no siteNav.json) para o idioma pedido.
 * Páginas com SEO bilíngue vão para o caminho definitivo (/wiki -> /en/wiki); as demais
 * (/hyperfokus, /meu-perfil, /discord...) seguem limpas: o public/js/site-chrome.js
 * acrescenta lang=en no blog e na conta (regra de SEO: nada de ?lang= no HTML servido).
 */
function localizePath(ptHref, lang) {
  const raw = String(ptHref || '/');
  if (lang !== 'en' || /^https?:/i.test(raw)) return raw;
  const m = raw.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  const base = (m[1] || '/').replace(/\/+$/, '') || '/';
  const rest = `${m[2] || ''}${m[3] || ''}`;
  // Carregado na hora: o seoRenderer também usa este módulo.
  const { SEO_CONFIG, pagePath, pageUrls } = require('./seoRenderer');
  const key = Object.keys(SEO_CONFIG).find((k) => pagePath(k) === base);
  const urls = key && pageUrls(key);
  return urls ? `${new URL(urls.en).pathname}${rest}` : raw;
}

/** Compatibilidade: link de uma página por nome (home, wiki, museum...). */
function hrefFor(target, lang) {
  const byId = { home: '/', account: NAV.account.href };
  for (const it of [...NAV.header, ...NAV.community]) if (it.href) byId[it.id] = it.href;
  for (const g of NAV.footer) for (const l of g.links) if (l.href && !byId[l.id]) byId[l.id] = l.href;
  return localizePath(byId[target] || '/', lang);
}

const ext = (it) => (it.external ? ' target="_blank" rel="noopener noreferrer"' : '');

/**
 * Cabeçalho. `active` = id do link atual no siteNav.json (wiki, bonus, cringelandia...) para `aria-current`.
 * `altHref` = a mesma página no outro idioma (o botão de idioma leva para lá).
 */
function renderHeader({ lang = 'pt', active = '', altHref = '' } = {}) {
  const isEn = lang === 'en';
  const T = (k) => esc(t(`siteChrome.${k}`, lang));
  const home = localizePath('/', lang);
  const cur = (id) => (id && id === active ? ' aria-current="page"' : '');
  const switchHref = altHref || localizePath('/', isEn ? 'pt' : 'en');
  const tone = (it) => (it.tone ? `pxc-tone-${it.tone}` : '');

  const popItems = NAV.community
    .map((it) => `<li><a class="pxc-pop-link" href="${esc(localizePath(it.href, lang))}"${cur(it.id)}>${icon(it.icon, tone(it))}<span><strong>${T(`nav.${it.id}`)}</strong><small>${T(`navDesc.${it.id}`)}</small></span></a></li>`)
    .join('');

  const desktop = NAV.header
    .map((it) => {
      if (it.menu) {
        return `<div class="pxc-pop" data-pxc-pop>
        <button type="button" class="pxc-link" aria-expanded="false" aria-haspopup="true">${icon(it.icon, tone(it))}<span>${T(`nav.${it.id}`)}</span>${icon('chevron', 'pxc-chevron')}</button>
        <div class="pxc-pop-panel"><ul>${popItems}</ul></div>
      </div>`;
      }
      return `<a class="pxc-link" href="${esc(localizePath(it.href, lang))}"${cur(it.id)}${ext(it)}>${it.icon ? icon(it.icon, tone(it)) : ''}<span>${T(`nav.${it.id}`)}</span></a>`;
    })
    .join('\n      ');

  let i = 0;
  const drawerLink = (it) =>
    `<a class="pxc-drawer-link" style="--i:${i++}" href="${esc(localizePath(it.href, lang))}"${cur(it.id)}${ext(it)}><span>${T(`nav.${it.id}`)}</span>${it.icon ? icon(it.icon, tone(it)) : ''}</a>`;
  const drawerMain = NAV.header.filter((it) => !it.menu && !it.external).map(drawerLink).join('');
  const communityLabel = NAV.header.find((it) => it.menu);
  const drawerLabel = communityLabel ? `<p class="pxc-drawer-label" style="--i:${i++}">${T(`nav.${communityLabel.id}`)}</p>` : '';
  const drawerCommunity = NAV.community.map(drawerLink).join('');
  const drawerMore =
    NAV.header.filter((it) => it.external).map(drawerLink).join('') +
    `<a class="pxc-drawer-link" style="--i:${i++}" href="${esc(localizePath(NAV.account.href, lang))}"><span>${T('ui.account')}</span>${icon('user', 'pxc-tone-pink')}</a>`;

  return `<a class="pxc-skip" href="#pxc-main">${T('ui.skip')}</a>
<header class="pxc-header" data-pxc-header>
  <div class="pxc-header-inner">
    <a class="pxc-brand" href="${esc(home)}">
      <span class="pxc-brand-logo"><img src="/assets/pyxie/sticker/sticker_smile-128.webp" alt="Pyxie Mascot" width="36" height="36" /><span class="pxc-brand-dot" data-pxc-dot aria-hidden="true" hidden></span></span>
      <span class="pxc-brand-text"><span class="pxc-brand-name">Pyxie</span><span class="pxc-brand-status" data-pxc-status data-online="${T('ui.statusOnline')}" data-offline="${T('ui.statusOffline')}" hidden></span></span>
    </a>
    <nav class="pxc-nav" aria-label="${T('ui.mainMenu')}">
      ${desktop}
    </nav>
    <div class="pxc-actions">
      <a class="pxc-chip pxc-hide-lt-lg" href="${esc(localizePath(NAV.account.href, lang))}">${icon('user', 'pxc-tone-pink')}<span>${T('ui.account')}</span></a>
      <a class="pxc-chip" href="${esc(switchHref)}" hreflang="${isEn ? 'pt-BR' : 'en'}" data-pxc-lang="${isEn ? 'pt' : 'en'}" aria-label="${T('ui.langSwitch')}" title="${T('ui.langSwitch')}">${icon('globe', 'pxc-tone-pink')}<span>${T('ui.langCurrent')}</span></a>
      <a class="pxc-cta pxc-hide-lt-sm" href="${esc(NAV.cta.href)}" target="_blank" rel="noopener noreferrer">${icon('sparkles')}<span>${T('ui.invite')}</span></a>
      <button type="button" class="pxc-burger" data-pxc-open aria-controls="pxc-drawer" aria-expanded="false" aria-label="${T('ui.openMenu')}"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="pxc-progress" aria-hidden="true"><div class="pxc-progress-bar" data-pxc-progress></div></div>
</header>
<div class="pxc-scrim" data-pxc-scrim aria-hidden="true"></div>
<aside class="pxc-drawer" id="pxc-drawer" data-pxc-drawer aria-label="${T('ui.menu')}" aria-hidden="true" inert>
  <div class="pxc-drawer-head">
    <span class="pxc-brand-name">Pyxie</span>
    <button type="button" class="pxc-icon-btn" data-pxc-close aria-label="${T('ui.closeMenu')}">${icon('close')}</button>
  </div>
  <nav class="pxc-drawer-nav" aria-label="${T('ui.mainMenu')}">
    ${drawerMain}${drawerLabel}${drawerCommunity}
    <div class="pxc-drawer-sep"></div>
    ${drawerMore}
  </nav>
  <div class="pxc-drawer-foot">
    <a class="pxc-cta pxc-cta-block" href="${esc(NAV.cta.menuHref)}" target="_blank" rel="noopener noreferrer">${T('ui.invite')}</a>
  </div>
</aside>`;
}

/** Rodapé em colunas (2 no celular, 4 no desktop), igual ao do React. */
function renderFooter({ lang = 'pt' } = {}) {
  const T = (k) => esc(t(`siteChrome.${k}`, lang));
  const cols = NAV.footer
    .map((group) => {
      const title = T(`footerGroup.${group.id}`);
      const links = group.links
        .map((l) =>
          l.action === 'cookies'
            ? `<button type="button" class="pxc-footer-btn" data-pxc-cookies>${T(`footer.${l.id}`)}</button>`
            : `<a href="${esc(localizePath(l.href, lang))}"${ext(l)}>${T(`footer.${l.id}`)}</a>`,
        )
        .join('');
      return `<nav class="pxc-footer-col" aria-label="${title}"><p class="pxc-footer-title">${title}</p>${links}</nav>`;
    })
    .join('');
  return `<footer class="pxc-footer">
  <div class="pxc-footer-grid">
    <div class="pxc-footer-brand">
      <a class="pxc-footer-logo" href="${esc(localizePath('/', lang))}"><img src="/assets/pyxie/sticker/sticker_smile-128.webp" alt="Pyxie Mascot Mini" width="40" height="40" loading="lazy" /><span>Pyxie</span></a>
      <p>${T('ui.tagline')}</p>
    </div>
    ${cols}
  </div>
  <p class="pxc-footer-rights">${T('ui.rights')}</p>
</footer>`;
}

const ASSETS_TAG = `<link rel="stylesheet" href="/css/site-chrome.css?v=${ASSET_VERSION}" />\n<script src="/js/site-chrome.js?v=${ASSET_VERSION}" defer></script>`;

/**
 * Troca `<!--pyx:header-->` e `<!--pyx:footer-->` pelo cabeçalho/rodapé e injeta CSS/JS.
 * Página sem marcador volta intacta (nada muda nas páginas do app React).
 */
function applySiteChrome(html, { lang = 'pt', active = '', altHref = '' } = {}) {
  const src = String(html || '');
  const hasHeader = src.includes('<!--pyx:header-->');
  const hasFooter = src.includes('<!--pyx:footer-->');
  if (!hasHeader && !hasFooter) return src;
  let out = src;
  if (hasHeader) out = out.replace('<!--pyx:header-->', renderHeader({ lang, active, altHref }));
  if (hasFooter) out = out.replace('<!--pyx:footer-->', renderFooter({ lang }));
  if (!out.includes('/css/site-chrome.css')) {
    // Fontes do próprio domínio: sem elas a marca cairia na fonte do sistema.
    const fonts = out.includes('/css/fonts.css') ? '' : '<link rel="stylesheet" href="/css/fonts.css" />\n';
    out = out.replace(/<\/head>/i, `${fonts}${ASSETS_TAG}\n</head>`);
  }
  return out;
}

module.exports = { renderHeader, renderFooter, applySiteChrome, hrefFor, localizePath, NAV };
