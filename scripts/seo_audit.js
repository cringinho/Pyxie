#!/usr/bin/env node
/**
 * Auditoria de SEO de longo prazo (AGENTS §8).
 * - Confere o sitemap (sem `?lang=`, sem duplicata, hreflang recíproco).
 * - Confere o HTML servido de cada página nos dois idiomas (canonical, hreflang, <html lang>, H1).
 * - Com `--remote`, busca cada URL na produção e exige status 200 (2xx) e canonical correto.
 *
 * Uso: node scripts/seo_audit.js [--remote]
 */
const fs = require('node:fs');
const path = require('node:path');
const { SEO_CONFIG, languageLinks, getLocalizedHtml, pageUrls } = require('../src/utils/seoRenderer');

const publicDir = path.join(__dirname, '..', 'public');
const remote = process.argv.includes('--remote');
const problems = [];
const fail = (message) => problems.push(message);
const count = (text, pattern) => (String(text).match(pattern) || []).length;

// 1. Sitemap
const sitemapPath = path.join(publicDir, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) fail('sitemap.xml não existe');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!locs.length) fail('sitemap.xml sem <loc>');
if (new Set(locs).size !== locs.length) fail('sitemap.xml com URLs duplicadas');
for (const loc of locs) {
  if (loc.includes('?lang=')) fail(`sitemap lista URL com ?lang= (${loc})`);
  if (!loc.startsWith('https://pyxie.com.br')) fail(`sitemap com domínio inesperado (${loc})`);
}

// 2. Páginas do SEO_CONFIG
const titles = new Map();
for (const key of Object.keys(SEO_CONFIG)) {
  const links = languageLinks(key);
  if (!links) {
    fail(`${key}: sem URLs de idioma`);
    continue;
  }
  const urls = pageUrls(key);
  if (urls.pt === urls.en) fail(`${key}: PT e EN com a mesma URL`);
  for (const loc of [urls.pt, urls.en]) {
    if (!locs.includes(loc)) fail(`${key}: ${loc} fora do sitemap`);
  }
  for (const lang of ['pt', 'en']) {
    const html = getLocalizedHtml(key, lang, publicDir);
    if (!html) {
      fail(`${key} (${lang}): HTML não encontrado`);
      continue;
    }
    const canonical = lang === 'en' ? urls.en : urls.pt;
    if (count(html, /<link\s+rel=["']canonical["']/gi) !== 1) fail(`${key} (${lang}): canonical duplicado/ausente`);
    if (!html.includes(`rel="canonical" href="${canonical}"`)) fail(`${key} (${lang}): canonical deveria ser ${canonical}`);
    if (!html.includes(`hreflang="pt-BR" href="${urls.pt}"`)) fail(`${key} (${lang}): hreflang pt-BR errado`);
    if (!html.includes(`hreflang="en" href="${urls.en}"`)) fail(`${key} (${lang}): hreflang en errado`);
    if (!html.includes(`hreflang="x-default" href="${urls.pt}"`)) fail(`${key} (${lang}): x-default errado`);
    if (!html.includes(`<html lang="${lang === 'en' ? 'en' : 'pt-BR'}">`)) fail(`${key} (${lang}): <html lang> errado`);
    if (/href="[^"]*\?lang=/.test(html)) fail(`${key} (${lang}): link com ?lang= no HTML`);
    if (count(html, /<h1[\s>]/gi) !== 1) fail(`${key} (${lang}): deve ter exatamente 1 H1`);
    const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
    if (!title) fail(`${key} (${lang}): sem <title>`);
    if (titles.has(title)) fail(`título repetido "${title}" (${titles.get(title)} e ${key} ${lang})`);
    else titles.set(title, `${key} ${lang}`);
  }
}

// 3. Cartas do tarot (hub + primeira carta, nos dois idiomas)
const pages = require('../src/services/tarotCardPages');
const { TAROT_CATALOG } = require('../src/data/tarotCardsCatalog');
for (const lang of ['pt', 'en']) {
  const hub = pages.renderHubPage(lang);
  if (!hub.includes(`rel="canonical" href="${pages.hubUrl(lang)}"`)) fail(`tarot hub (${lang}): canonical errado`);
  if (hub.includes('?lang=')) fail(`tarot hub (${lang}): link com ?lang=`);
  const card = pages.renderCardPage(TAROT_CATALOG[0], lang);
  if (!card.includes(`rel="canonical" href="${pages.cardUrl(TAROT_CATALOG[0], lang)}"`)) fail(`tarot carta (${lang}): canonical errado`);
  if (card.includes('?lang=')) fail(`tarot carta (${lang}): link com ?lang=`);
}

// 4. robots.txt
const robots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8');
if (!robots.includes('Allow: /en/')) fail('robots.txt sem Allow: /en/');
for (const rule of ['Disallow: /dashboard', 'Disallow: /admin', 'Sitemap: https://pyxie.com.br/sitemap.xml']) {
  if (!robots.includes(rule)) fail(`robots.txt sem "${rule}"`);
}

// 5. IndexNow sem ?lang=
const { getDefaultUrlList } = require('../src/services/indexNowService');
for (const url of getDefaultUrlList()) {
  if (url.includes('?lang=')) fail(`IndexNow com ?lang= (${url})`);
}

// 6. Remoto (opcional): status e canonical de cada URL publicada
async function checkRemote() {
  if (!remote) return;
  if (typeof fetch !== 'function') {
    fail('Node sem fetch global: não é possível checar a produção');
    return;
  }
  for (const loc of locs) {
    try {
      const res = await fetch(loc, { redirect: 'manual' });
      if (res.status !== 200) fail(`${loc}: status ${res.status}`);
      const html = await res.text();
      if (!html.includes(`rel="canonical" href="${loc}"`)) fail(`${loc}: canonical diferente da URL publicada`);
    } catch (err) {
      fail(`${loc}: ${err.message}`);
    }
  }
}

(async () => {
  await checkRemote();
  if (problems.length) {
    console.error(`❌ Auditoria de SEO com ${problems.length} problema(s):`);
    for (const message of problems) console.error(` - ${message}`);
    process.exit(1);
  }
  const total = Object.keys(SEO_CONFIG).length * 2 + pages.getAllTarotPageUrls().length;
  console.log(`✅ SEO ok: ${Object.keys(SEO_CONFIG).length} páginas × 2 idiomas, ${locs.length} URLs no sitemap, ${total} URLs públicas${remote ? ' (produção verificada)' : ''}.`);
})();
