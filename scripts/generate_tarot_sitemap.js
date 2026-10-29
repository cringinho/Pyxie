#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { buildSitemapEntries } = require('../src/services/tarotCardPages');

/**
 * Reescreve, em public/sitemap.xml, o bloco das páginas de cartas do Tarot (índice + 78 cartas,
 * PT e EN com hreflang). O resto do sitemap fica intacto.
 * Uso: node scripts/generate_tarot_sitemap.js
 */

const START = '  <!-- tarot-cards:start (gerado por scripts/generate_tarot_sitemap.js) -->';
const END = '  <!-- tarot-cards:end -->';
const IMAGE_NS = 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

function updateSitemap(xml, lastmod) {
  const eol = xml.includes('\r\n') ? '\r\n' : '\n';
  let out = xml;
  if (!out.includes(IMAGE_NS)) {
    out = out.replace('xmlns:xhtml="http://www.w3.org/1999/xhtml">', `xmlns:xhtml="http://www.w3.org/1999/xhtml"${eol}        ${IMAGE_NS}>`);
  }
  const block = `${START}\n${buildSitemapEntries(lastmod)}\n${END}`.replace(/\r?\n/g, eol);
  const startIndex = out.indexOf(START);
  if (startIndex !== -1) {
    const endIndex = out.indexOf(END, startIndex) + END.length;
    return `${out.slice(0, startIndex)}${block}${out.slice(endIndex)}`;
  }
  return out.replace('</urlset>', `${eol}${block}${eol}</urlset>`);
}

if (require.main === module) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  fs.writeFileSync(sitemapPath, updateSitemap(xml, lastmod), 'utf8');
  console.log(`[Sitemap] Bloco das cartas do Tarot atualizado (${lastmod}).`);
}

module.exports = { updateSitemap };
