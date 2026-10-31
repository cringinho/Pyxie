#!/usr/bin/env node
/**
 * Gera public/sitemap.xml a partir do SEO_CONFIG (uma URL por idioma, sem `?lang=`)
 * mais o bloco das 78 cartas de tarot (scripts/generate_tarot_sitemap.js mantém o mesmo bloco).
 * Uso: node scripts/generate_sitemap.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { SEO_CONFIG, languageLinks } = require('../src/utils/seoRenderer');
const { buildSitemapEntries } = require('../src/services/tarotCardPages');

const PRIORITY = {
  index: '1.0',
  tarot: '0.9',
  wiki: '0.8',
  pass: '0.8',
  cringelandia: '0.8',
  market: '0.7',
  museum: '0.7',
  transparency: '0.6',
  partnerships: '0.6',
  bonus: '0.5',
  parents: '0.5',
  terms: '0.3',
  privacy: '0.3',
};

const CHANGEFREQ = { index: 'daily', market: 'daily', tarot: 'weekly', cringelandia: 'weekly' };

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function pageEntry(pageKey, lang, lastmod) {
  const links = languageLinks(pageKey);
  if (!links) return '';
  const loc = lang === 'en' ? links.urls.en : links.urls.pt;
  const alternates = links.alternates
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${escapeXml(a.href)}" />`)
    .join('\n');
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${CHANGEFREQ[pageKey] || 'monthly'}</changefreq>
    <priority>${PRIORITY[pageKey] || '0.6'}</priority>
${alternates}
  </url>`;
}

function buildSitemap(lastmod = new Date().toISOString().slice(0, 10)) {
  const pages = Object.keys(SEO_CONFIG)
    .flatMap((pageKey) => [pageEntry(pageKey, 'pt', lastmod), pageEntry(pageKey, 'en', lastmod)])
    .filter(Boolean);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Páginas geradas por scripts/generate_sitemap.js a partir do SEO_CONFIG (uma URL por idioma). -->
${pages.join('\n')}

  <!-- tarot-cards:start (gerado por scripts/generate_tarot_sitemap.js) -->
${buildSitemapEntries(lastmod)}
  <!-- tarot-cards:end -->
</urlset>
`;
}

if (require.main === module) {
  const out = path.join(__dirname, '..', 'public', 'sitemap.xml');
  const xml = buildSitemap();
  fs.writeFileSync(out, xml, 'utf8');
  const total = (xml.match(/<loc>/g) || []).length;
  console.log(`[Sitemap] Gerado com ${total} URLs (${Object.keys(SEO_CONFIG).length} páginas × 2 idiomas + cartas do tarot).`);
}

module.exports = { buildSitemap, pageEntry };
