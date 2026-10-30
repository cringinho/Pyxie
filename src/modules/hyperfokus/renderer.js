const { buildArticleSeo, buildHomeSeo, buildAuthorSeo, applyInternalLinks } = require('./seoEngine');
const { getContextualProducts } = require('./shopeeContext');
const { markdownToHtml } = require('./markdown');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(date, lang = 'pt') {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'medium',
  }).format(d);
}

/**
 * Base Shell CSS compartilhado para todas as páginas do Hyperfokus.
 */
function getSharedStyles() {
  return `
    :root {
      --bg: #080410;
      --card-bg: #120924;
      --card-border: rgba(168, 85, 247, 0.18);
      --accent-pink: #E60067;
      --accent-purple: #8B5CF6;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --reader-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --reader-font-size: 1.125rem;
      --reader-line-height: 1.75;
      --reader-max-width: 780px;
      --reader-bg: #080410;
      --reader-text: #f1f5f9;
    }

    body.theme-sepia {
      --reader-bg: #f5eedc;
      --reader-text: #2c251e;
      --card-bg: #ebe2ce;
      --card-border: #d4c8af;
    }

    body.theme-contrast {
      --reader-bg: #000000;
      --reader-text: #ffffff;
      --card-bg: #111111;
      --card-border: #ffffff;
    }

    body.font-dyslexic {
      --reader-font-family: "OpenDyslexic", "Comic Sans MS", -apple-system, sans-serif;
      letter-spacing: 0.05em;
      word-spacing: 0.1em;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background-color: var(--reader-bg);
      color: var(--reader-text);
      font-family: var(--reader-font-family);
      line-height: 1.6;
      overflow-x: hidden;
      min-width: 320px;
    }

    a { color: var(--accent-pink); text-decoration: none; transition: all 0.2s; }
    a:hover { color: #f43f5e; text-decoration: underline; }

    .site-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(8, 4, 16, 0.88);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--card-border);
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 1rem;
    }

    .hf-nav { display: flex; gap: 1.25rem; font-size: 0.875rem; font-weight: 700; }
    .hf-nav a { color: var(--text-muted); text-decoration: none; }
    .hf-nav a:hover, .hf-nav a:focus-visible { color: #fff; }
    .nav-actions { display: flex; align-items: center; gap: 0.5rem; }
    .hf-auth { font-size: 0.8rem; white-space: nowrap; }
    @media (max-width: 860px) { .hf-nav { display: none; } }
    @media (max-width: 560px) {
      .hf-hide-sm { display: none; }
      .hf-auth, .hf-lang { padding: 6px 10px; font-size: 0.75rem; }
      .brand { font-size: 1rem; gap: 0.4rem; }
      .brand > span { display: none; }
      .header-inner { gap: 0.5rem; }
    }
    .header-inner {
      gap: 1rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 900;
      font-size: 1.25rem;
      color: #ffffff;
      text-decoration: none;
    }
    .brand img { width: 34px; height: 34px; object-fit: contain; }
    .brand-tag {
      font-size: 0.75rem;
      background: var(--accent-pink);
      color: #fff;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
    }
    .btn-pink { background: var(--accent-pink); color: #fff; }
    .btn-pink:hover { background: #f43f5e; color: #fff; text-decoration: none; transform: translateY(-1px); }
    .btn-outline { background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid var(--card-border); }
    .btn-outline:hover { background: rgba(255, 255, 255, 0.1); text-decoration: none; }

    .main-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem 4rem;
    }

    /* Tag Pills */
    .tag-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(230, 0, 103, 0.12);
      color: var(--accent-pink);
      border: 1px solid rgba(230, 0, 103, 0.3);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Bento Cards */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-3px);
      border-color: rgba(230, 0, 103, 0.4);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    }

    .card-thumb {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: #1a0b36;
    }

    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0.5rem 0;
      color: #ffffff;
      line-height: 1.35;
    }
    .card-title a { color: inherit; text-decoration: none; }
    .card-title a:hover { color: var(--accent-pink); }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .author-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      background: #2e1065;
    }

    /* Layout com Sidebar */
    .layout-sidebar {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2.5rem;
      margin-top: 2rem;
    }

    @media (max-width: 900px) {
      .layout-sidebar {
        grid-template-columns: 1fr;
      }
    }

    /* Sidebar Widgets */
    .widget {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .widget-title {
      font-size: 1rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .shopee-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      align-items: center;
    }
    .shopee-item:last-child { border-bottom: none; }
    .shopee-thumb {
      width: 56px;
      height: 56px;
      border-radius: 0.5rem;
      object-fit: cover;
      background: #1a0b36;
      flex-shrink: 0;
    }
    .shopee-info { flex: 1; min-width: 0; }
    .shopee-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
    .shopee-price {
      font-size: 0.8125rem;
      color: #fb7185;
      font-weight: 800;
    }

    /* Leitor Acessível do Artigo */
    .reader-toolbar {
      position: sticky;
      top: 64px;
      z-index: 90;
      background: rgba(8, 4, 16, 0.94);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 0.5rem 1rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .reader-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .reader-btn {
      padding: 4px 10px;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 6px;
      border: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.05);
      color: var(--reader-text);
      cursor: pointer;
    }
    .reader-btn:hover { background: rgba(255, 255, 255, 0.15); }
    .reader-btn.active {
      background: var(--accent-pink);
      color: #fff;
      border-color: var(--accent-pink);
    }

    .article-wrap {
      max-width: var(--reader-max-width);
      margin: 0 auto;
      padding: 2rem 1rem 4rem;
    }

    .article-header { margin-bottom: 2rem; }
    .article-title {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 900;
      line-height: 1.2;
      color: #ffffff;
      margin: 0.75rem 0 1rem;
    }

    .article-meta-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      color: var(--text-muted);
      font-size: 0.875rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--card-border);
    }

    .article-content {
      font-size: var(--reader-font-size);
      line-height: var(--reader-line-height);
      color: var(--reader-text);
    }
    .article-content p { margin-bottom: 1.5rem; }
    .article-content h2 { font-size: 1.75rem; font-weight: 900; color: #fff; margin: 2.5rem 0 1rem; }
    .article-content h3 { font-size: 1.35rem; font-weight: 800; color: #f1f5f9; margin: 2rem 0 0.75rem; }
    .article-content img { max-width: 100%; height: auto; border-radius: 1rem; margin: 1.5rem 0; }
    .article-content blockquote {
      border-left: 4px solid var(--accent-pink);
      padding: 0.75rem 1.25rem;
      background: rgba(230, 0, 103, 0.06);
      border-radius: 0 0.75rem 0.75rem 0;
      margin: 1.5rem 0;
      font-style: italic;
    }
    .article-content pre {
      background: #040208;
      border: 1px solid var(--card-border);
      padding: 1rem;
      border-radius: 0.75rem;
      overflow-x: auto;
      margin: 1.5rem 0;
      font-size: 0.875rem;
    }
    .article-content code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .internal-seo-link {
      color: #ec4899;
      font-weight: 600;
      border-bottom: 1px dashed #ec4899;
      text-decoration: none;
    }
    .internal-seo-link:hover {
      color: #f43f5e;
      border-bottom-style: solid;
    }

    /* Modal de Coautores */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 200;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-backdrop.open { display: flex; }
    .modal-card {
      background: #120924;
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      width: 100%;
      max-width: 440px;
      padding: 1.5rem;
    }

    /* Footer */
    .site-footer {
      border-top: 1px solid var(--card-border);
      padding: 3rem 1rem 2rem;
      background: #05020a;
      font-size: 0.875rem;
      color: var(--text-muted);
      text-align: center;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
  `;
}

/**
 * Script injetado para o Leitor Acessível (Kindle-style, sem quebrar SEO e sem recarregar página).
 */
function getReaderScript() {
  return getReaderScriptBody();
}

/**
 * Cabeçalho único do Hyperfokus: navegação, idioma e entrada (Entrar / Criar conta ou Escrever / Meu perfil).
 * `path` é o caminho sem query; o botão de idioma e o redirect do login voltam para ele.
 */
function renderSiteHeader({ lang = 'pt', user = null, path = '/hyperfokus', brandLabel = 'Hyperfokus' } = {}) {
  const isEn = lang === 'en';
  const q = isEn ? '?lang=en' : '';
  const here = `${path}${q}`;
  const langHref = isEn ? path : `${path}?lang=en`;
  const authHtml = user
    ? `<a href="/meu-perfil/escrever${q}" class="btn btn-pink hf-auth">✍️ <span class="hf-hide-sm">${isEn ? 'Write' : 'Escrever'}</span></a>
        <a href="/meu-perfil${q}" class="btn btn-outline hf-auth">${isEn ? 'My profile' : 'Meu perfil'}</a>`
    : `<a href="/login?redirect=${encodeURIComponent(here)}${isEn ? '&lang=en' : ''}" class="btn btn-outline hf-auth">${isEn ? 'Sign in' : 'Entrar'}</a>
        <a href="/cadastro?redirect=${encodeURIComponent(here)}${isEn ? '&lang=en' : ''}" class="btn btn-pink hf-auth">${isEn ? 'Create account' : 'Criar conta'}</a>`;
  return `
  <header class="site-header">
    <div class="header-inner">
      <a href="/hyperfokus${q}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="${isEn ? 'Pyxie, the blog mascot' : 'Pyxie, mascote do blog'}" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">${escapeHtml(brandLabel)}</span></span>
      </a>
      <nav class="hf-nav" aria-label="${isEn ? 'Blog navigation' : 'Navegação do blog'}">
        <a href="/${q}">${isEn ? 'Pyxie home' : 'Início da Pyxie'}</a>
        <a href="/hyperfokus${q}">${isEn ? 'Articles' : 'Artigos'}</a>
        <a href="/hyperfokus/como-participar${q}">${isEn ? 'How to publish' : 'Como publicar'}</a>
      </nav>
      <div class="nav-actions">
        <a href="${langHref}" class="btn btn-outline hf-lang" hreflang="${isEn ? 'pt-BR' : 'en'}" aria-label="${isEn ? 'Ler em português' : 'Read in English'}">🌐 <span class="hf-hide-sm">${isEn ? 'Português' : 'English'}</span></a>
        ${authHtml}
      </div>
    </div>
  </header>`;
}

function getReaderScriptBody() {
  return `
    <script>
      (function() {
        const PREF_KEY = 'hyperfokus_reader_pref';
        let prefs = {
          size: 2, // 0..4 (14, 16, 18, 20, 22)
          width: 'normal', // compact, normal, wide
          lineHeight: '1.75',
          font: 'sans', // sans, dyslexic
          theme: 'dark' // dark, sepia, contrast
        };

        try {
          const saved = localStorage.getItem(PREF_KEY);
          if (saved) prefs = Object.assign(prefs, JSON.parse(saved));
        } catch (_) {}

        const SIZES = ['0.875rem', '1rem', '1.125rem', '1.25rem', '1.375rem'];
        const WIDTHS = { compact: '640px', normal: '780px', wide: '960px' };

        function applyPrefs() {
          const root = document.documentElement;
          const body = document.body;

          root.style.setProperty('--reader-font-size', SIZES[prefs.size] || '1.125rem');
          root.style.setProperty('--reader-max-width', WIDTHS[prefs.width] || '780px');
          root.style.setProperty('--reader-line-height', prefs.lineHeight);

          body.classList.remove('theme-sepia', 'theme-contrast');
          if (prefs.theme === 'sepia') body.classList.add('theme-sepia');
          if (prefs.theme === 'contrast') body.classList.add('theme-contrast');

          body.classList.remove('font-dyslexic');
          if (prefs.font === 'dyslexic') body.classList.add('font-dyslexic');

          try {
            localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
          } catch (_) {}
        }

        window.setReaderSize = function(delta) {
          prefs.size = Math.max(0, Math.min(4, prefs.size + delta));
          applyPrefs();
        };

        window.setReaderWidth = function(w) {
          prefs.width = w;
          applyPrefs();
        };

        window.setReaderLineHeight = function(lh) {
          prefs.lineHeight = lh;
          applyPrefs();
        };

        window.setReaderTheme = function(theme) {
          prefs.theme = theme;
          applyPrefs();
        };

        window.toggleReaderDyslexic = function() {
          prefs.font = prefs.font === 'dyslexic' ? 'sans' : 'dyslexic';
          applyPrefs();
        };

        document.addEventListener('DOMContentLoaded', applyPrefs);
        applyPrefs();
      })();
    </script>
  `;
}

/**
 * Renderiza a Home do Blog (/hyperfokus).
 */
function renderHomePage({ articles = [], total = 0, page = 1, totalPages = 1, activeTab = 'recent', activeTag = null, lang = 'pt', user = null, tags = [] } = {}) {
  const isEn = lang === 'en';
  const seo = buildHomeSeo({ lang, tag: activeTag });
  const featured = articles[0] || null;
  const list = featured ? articles.slice(1) : [];

  const shopeeProducts = getContextualProducts(activeTag ? [activeTag] : ['tecnologia', 'autismo'], 4);


  const tagPillsHtml = tags.map((t) => {
    const isActive = activeTag === t;
    const url = isActive ? `/hyperfokus${isEn ? '?lang=en' : ''}` : `/hyperfokus/categoria/${encodeURIComponent(t)}${isEn ? '?lang=en' : ''}`;
    return `<a href="${url}" class="tag-pill" style="${isActive ? 'background: var(--accent-pink); color: #fff;' : ''}">#${escapeHtml(t)}</a>`;
  }).join(' ');

  const cardsHtml = list.map((art) => {
    const cover = art.coverImage || `/api/hyperfokus/og/${art.id}`;
    const author = art.authors && art.authors[0] ? art.authors[0] : { username: 'Comunidade Pyxie' };
    const dateStr = formatDate(art.publishedAt || art.createdAt, lang);
    const readingTime = `${art.readingTimeMinutes || 2} min`;

    return `
      <article class="card">
        <a href="/hyperfokus/${encodeURIComponent(art.slug)}${isEn ? '?lang=en' : ''}">
          <img src="${escapeHtml(cover)}" alt="Capa do artigo: ${escapeHtml(art.title)}" class="card-thumb" loading="lazy" />
        </a>
        <div class="card-body">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${(art.categoryTags || []).slice(0, 2).map((tg) => `<span class="tag-pill">#${escapeHtml(tg)}</span>`).join('')}
          </div>
          <h2 class="card-title">
            <a href="/hyperfokus/${encodeURIComponent(art.slug)}${isEn ? '?lang=en' : ''}">${escapeHtml(art.title)}</a>
          </h2>
          <div class="card-meta">
            <img src="${escapeHtml(author.cachedAvatarWebp || '/assets/pyxie/sticker/sticker_smile.png')}" alt="Foto de perfil de ${escapeHtml(author.username)}" class="author-avatar" loading="lazy" />
            <span>${escapeHtml(author.username)}</span>
            <span style="margin-left:auto;">${dateStr} • ⏳ ${readingTime}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}">
  <link rel="canonical" href="${escapeHtml(seo.canonical)}">
  ${seo.hreflangs.map((h) => `<link rel="alternate" hreflang="${h.lang}" href="${escapeHtml(h.href)}">`).join('\n  ')}
  <meta name="robots" content="index, follow, max-image-preview:large">

  <!-- OpenGraph & Twitter -->
  <meta property="og:title" content="${escapeHtml(seo.title)}">
  <meta property="og:description" content="${escapeHtml(seo.description)}">
  <meta property="og:url" content="${escapeHtml(seo.canonical)}">
  <meta property="og:image" content="${escapeHtml(seo.coverImage)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(seo.title)}">
  <meta name="twitter:description" content="${escapeHtml(seo.description)}">
  <meta name="twitter:image" content="${escapeHtml(seo.coverImage)}">

  <!-- RSS Feed Link -->
  <link rel="alternate" type="application/rss+xml" title="Pyxie Hyperfokus RSS" href="/hyperfokus/rss.xml${isEn ? '?lang=en' : ''}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(seo.jsonLd)}
  </script>

  <style>
    ${getSharedStyles()}
  </style>
</head>
<body>
  ${renderSiteHeader({ lang, user, path: activeTag ? `/hyperfokus/categoria/${encodeURIComponent(activeTag)}` : '/hyperfokus' })}

  <main class="main-container">
    <!-- Header Hero Banner -->
    <div style="margin-bottom: 2rem; text-align: left;">
      <h1 style="font-size: clamp(2.2rem, 5vw, 3.2rem); font-weight: 900; line-height: 1.15; color: #fff;">
        ${isEn ? 'Authentic Stories, Deep Guides & Neurodivergent Hyperfocus' : 'Histórias Autênticas, Guias Profundos & Hiperfocos Reais'}
      </h1>
      <p style="color: var(--text-muted); font-size: 1.125rem; margin-top: 0.75rem; max-width: 780px;">
        ${isEn 
          ? 'Written 100% by humans from the Cringelândia community. No generic AI sludge, just authentic passion.' 
          : 'Escrito 100% por humanos da comunidade da Cringelândia. Nada de textos gerados por IA, apenas pura paixão autêntica.'}
      </p>

      <!-- Category Filter Pills -->
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.25rem;">
        <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="tag-pill" style="${!activeTag ? 'background: var(--accent-pink); color: #fff;' : ''}">#${isEn ? 'ALL' : 'TODOS'}</a>
        ${tagPillsHtml}
      </div>
    </div>

    <!-- Featured Hero Card (se houver) -->
    ${featured ? `
      <section style="margin-bottom: 3rem;">
        <div class="card" style="border-color: rgba(230,0,103,0.4); background: linear-gradient(135deg, #18092e 0%, #0d041a 100%);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));">
            <a href="/hyperfokus/${encodeURIComponent(featured.slug)}${isEn ? '?lang=en' : ''}">
              <img src="${escapeHtml(featured.coverImage || `/api/hyperfokus/og/${featured.id}`)}" alt="Capa destaque: ${escapeHtml(featured.title)}" style="width: 100%; height: auto; aspect-ratio: 1200 / 630; object-fit: cover; display: block;" />
            </a>
            <div class="card-body" style="padding: 2rem;">
              <span class="brand-tag" style="align-self: flex-start;">🌟 ${isEn ? 'Featured Hyperfocus' : 'Hiperfoco em Destaque'}</span>
              <h2 class="card-title" style="font-size: clamp(1.5rem, 3vw, 2.2rem); margin: 1rem 0;">
                <a href="/hyperfokus/${encodeURIComponent(featured.slug)}${isEn ? '?lang=en' : ''}">${escapeHtml(featured.title)}</a>
              </h2>
              <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 1.5rem;">
                ${escapeHtml((featured.metaDescription || featured.contentMarkdown || '').slice(0, 180))}...
              </p>
              <div class="card-meta">
                <img src="${escapeHtml((featured.authors && featured.authors[0] && featured.authors[0].cachedAvatarWebp) || '/assets/pyxie/sticker/sticker_smile.png')}" alt="Foto de perfil de ${escapeHtml((featured.authors && featured.authors[0] && featured.authors[0].username) || 'Autor')}" class="author-avatar" />
                <span>${escapeHtml((featured.authors && featured.authors[0] && featured.authors[0].username) || 'Comunidade Pyxie')}</span>
                <span style="margin-left:auto;">${formatDate(featured.publishedAt, lang)} • ⏳ ${featured.readingTimeMinutes || 3} min</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    ` : ''}

    <!-- Layout Bento + Sidebar -->
    <div class="layout-sidebar">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h2 style="font-size: 1.5rem; font-weight: 900; color: #fff;">
            ${isEn ? 'Explore Articles' : 'Explorar Artigos'}
          </h2>
          <div style="display: flex; gap: 0.5rem;">
            <a href="/hyperfokus?sort=recent${activeTag ? `&tag=${activeTag}` : ''}${isEn ? '&lang=en' : ''}" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;">${isEn ? 'Recent' : 'Recentes'}</a>
            <a href="/hyperfokus?sort=likes${activeTag ? `&tag=${activeTag}` : ''}${isEn ? '&lang=en' : ''}" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;">❤️ ${isEn ? 'Popular' : 'Curtidos'}</a>
          </div>
        </div>

        <div class="bento-grid">
          ${cardsHtml.length > 0 ? cardsHtml : `<p style="color: var(--text-muted);">${isEn ? 'No articles found in this category yet.' : 'Nenhum artigo encontrado nesta categoria ainda.'}</p>`}
        </div>
      </div>

      <!-- Sidebar -->
      <aside>
        <!-- Discord Community Sanctuary -->
        <div class="widget">
          <h3 class="widget-title">🏰 ${isEn ? 'Cringelândia Discord' : 'Comunidade Cringelândia'}</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">
            ${isEn 
              ? 'Join our welcoming Discord sanctuary. Discuss special interests, unlock custom roles, and share your hyperfocus.' 
              : 'Faça parte do nosso santuário acolhedor no Discord. Converse sobre hiperfocos, ganhe cargos exclusivos e publique artigos.'}
          </p>
          <a href="/discord" target="_blank" rel="noopener noreferrer" class="btn btn-pink" style="width: 100%;">
            👾 ${isEn ? 'Join Sanctuary' : 'Entrar no Servidor'}
          </a>
        </div>

        <!-- Shopee Contextual Affiliate Widget -->
        ${shopeeProducts.length > 0 ? `
          <div class="widget">
            <h3 class="widget-title">🛍️ ${isEn ? 'Curated Essentials' : 'Recomendações da Loja'}</h3>
            <div>
              ${shopeeProducts.map((p) => `
                <a href="${escapeHtml(p.link)}" target="_blank" rel="${p.rel}" class="shopee-item">
                  <img src="${escapeHtml(p.imagem)}" alt="${escapeHtml(p.titulo)}" class="shopee-thumb" loading="lazy" />
                  <div class="shopee-info">
                    <span class="shopee-name">${escapeHtml(p.titulo)}</span>
                    <span class="shopee-price">${escapeHtml(p.preco)}</span>
                  </div>
                </a>
              `).join('')}
            </div>
            <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.75rem;">
              * Link afiliado Shopee. Ajuda a manter a Pyxie e os servidores online.
            </p>
          </div>
        ` : ''}

        <!-- Institutional Links -->
        <div class="widget">
          <h3 class="widget-title">📖 ${isEn ? 'About the Project' : 'Sobre o Projeto'}</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem;">
            <li><a href="/hyperfokus/como-participar${isEn ? '?lang=en' : ''}">👉 ${isEn ? 'How to participate & publish' : 'Como participar e publicar'}</a></li>
            <li><a href="/hyperfokus/termos-e-regras${isEn ? '?lang=en' : ''}">📜 ${isEn ? 'Community guidelines & rules' : 'Regras da comunidade e licença'}</a></li>
            <li><a href="/wiki${isEn ? '?lang=en' : ''}">🔮 ${isEn ? 'Pyxie Encyclopedia & Tarot' : 'Enciclopédia da Pyxie & Tarot'}</a></li>
          </ul>
        </div>
      </aside>
    </div>
  </main>

  <!-- Parede de Engajamento Acolhedora (Automação 10: 1x por sessão, não bloqueia leitura) -->
  <aside id="engagement-wall" style="display:none; position:fixed; bottom:20px; right:20px; max-width:360px; background:#120924; border:2px solid #E60067; border-radius:1rem; padding:1.25rem; box-shadow:0 12px 35px rgba(0,0,0,0.7); z-index:999;" aria-label="Aviso da Comunidade">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
      <strong style="color:#fff; font-size:0.95rem;">💡 ${isEn ? 'Enjoying this read?' : 'Gostando do hiperfoco?'}</strong>
      <button onclick="closeEngagementWall()" aria-label="Fechar" style="background:none; border:none; color:var(--text-muted); font-size:1.3rem; cursor:pointer; line-height:1;">&times;</button>
    </div>
    <p style="font-size:0.8125rem; color:var(--text-muted); margin:0.5rem 0 1rem; line-height:1.4;">
      ${isEn 
        ? 'Written with authentic passion by a real human in our community. Join our Discord sanctuary to meet other neurodivergent minds!' 
        : 'Escrito por quem realmente vive o tema, 100% livre de IA. Faça parte da Cringelândia no Discord ou compartilhe seu próprio relato!'}
    </p>
    <div style="display:flex; gap:0.5rem;">
      <a href="/discord" target="_blank" rel="noopener noreferrer" onclick="trackClick('invite')" class="btn btn-pink" style="font-size:0.75rem; padding:6px 12px; flex:1; text-align:center;">
        👾 ${isEn ? 'Join Discord' : 'Entrar no Servidor'}
      </a>
      <button onclick="closeEngagementWall()" class="btn btn-outline" style="font-size:0.75rem; padding:6px 12px;">
        ${isEn ? 'Keep reading' : 'Continuar lendo'}
      </button>
    </div>
  </aside>

  <footer class="site-footer">
    <div class="footer-links">
      <a href="/">${isEn ? 'Home' : 'Início'}</a>
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}">Blog Hyperfokus</a>
      <a href="/wiki${isEn ? '?lang=en' : ''}">Wiki</a>
      <a href="/termos${isEn ? '?lang=en' : ''}">${isEn ? 'Terms' : 'Termos'}</a>
      <a href="/privacidade${isEn ? '?lang=en' : ''}">${isEn ? 'Privacy' : 'Privacidade'}</a>
      <a href="/hyperfokus/rss.xml${isEn ? '?lang=en' : ''}">RSS Feed</a>
    </div>
    <p>Pyxie Hyperfokus • Santuário de Mentes Livres & Conteúdo Autêntico</p>
  </footer>
</body>
</html>`;
}

/**
 * Renderiza a Página Completa do Artigo (/hyperfokus/:slug).
 */
function renderArticlePage({ article, lang = 'pt', user = null } = {}) {
  const isEn = lang === 'en';
  const seo = buildArticleSeo({ article, lang });
  const processedHtml = applyInternalLinks(article.contentHtml, article.id);
  const primaryAuthor = (article.authors && article.authors[0]) || { username: 'Comunidade Pyxie', userId: 'community' };
  const coAuthors = (article.authors || []).slice(1);
  const publishedDate = formatDate(article.publishedAt || article.createdAt, lang);
  const readingTime = `${article.readingTimeMinutes || 3} min`;

  const shopeeProducts = getContextualProducts(article.categoryTags || [], 3);

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}">
  <link rel="canonical" href="${escapeHtml(seo.canonical)}">
  ${seo.hreflangs.map((h) => `<link rel="alternate" hreflang="${h.lang}" href="${escapeHtml(h.href)}">`).join('\n  ')}
  <meta name="robots" content="index, follow, max-image-preview:large">

  <!-- OpenGraph & Twitter -->
  <meta property="og:title" content="${escapeHtml(seo.title)}">
  <meta property="og:description" content="${escapeHtml(seo.description)}">
  <meta property="og:url" content="${escapeHtml(seo.canonical)}">
  <meta property="og:image" content="${escapeHtml(seo.coverImage)}">
  <meta property="og:type" content="article">
  <meta property="article:published_time" content="${escapeHtml(seo.publishedIso)}">
  <meta property="article:modified_time" content="${escapeHtml(seo.updatedIso)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(seo.title)}">
  <meta name="twitter:description" content="${escapeHtml(seo.description)}">
  <meta name="twitter:image" content="${escapeHtml(seo.coverImage)}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(seo.jsonLd)}
  </script>

  <style>
    ${getSharedStyles()}
  </style>
</head>
<body>
  <!-- Header do Site -->
  ${renderSiteHeader({ lang, user, path: `/hyperfokus/${encodeURIComponent(article.slug)}` })}

  <!-- Barra de Leitura Acessível (Kindle style) -->
  <nav class="reader-toolbar" aria-label="${isEn ? 'Reading tools' : 'Ferramentas de leitura'}">
    <div class="reader-controls">
      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${isEn ? 'SIZE:' : 'TAMANHO:'}</span>
      <button class="reader-btn" onclick="setReaderSize(-1)" title="${isEn ? 'Smaller text' : 'Diminuir texto'}">A−</button>
      <button class="reader-btn" onclick="setReaderSize(1)" title="${isEn ? 'Larger text' : 'Aumentar texto'}">A+</button>

      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">${isEn ? 'WIDTH:' : 'LARGURA:'}</span>
      <button class="reader-btn" onclick="setReaderWidth('compact')">${isEn ? 'Narrow' : 'Estreito'}</button>
      <button class="reader-btn" onclick="setReaderWidth('normal')">${isEn ? 'Default' : 'Padrão'}</button>
      <button class="reader-btn" onclick="setReaderWidth('wide')">${isEn ? 'Wide' : 'Largo'}</button>

      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">${isEn ? 'SPACING:' : 'ESPAÇAMENTO:'}</span>
      <button class="reader-btn" onclick="setReaderLineHeight('1.4')">1.4</button>
      <button class="reader-btn" onclick="setReaderLineHeight('1.75')">1.75</button>
      <button class="reader-btn" onclick="setReaderLineHeight('2.0')">2.0</button>
    </div>

    <div class="reader-controls">
      <button class="reader-btn" onclick="toggleReaderDyslexic()" title="${isEn ? 'High-legibility font' : 'Fonte de alta legibilidade'}">${isEn ? 'Dyslexia' : 'Dislexia'}</button>
      <button class="reader-btn" onclick="setReaderTheme('dark')">${isEn ? 'Dark' : 'Escuro'}</button>
      <button class="reader-btn" onclick="setReaderTheme('sepia')">${isEn ? 'Sepia' : 'Sépia'}</button>
      <button class="reader-btn" onclick="setReaderTheme('contrast')">${isEn ? 'Contrast' : 'Contraste'}</button>
    </div>
  </nav>

  <!-- Container do Artigo -->
  <main class="article-wrap">
    <!-- Categoria Tags -->
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
      ${(article.categoryTags || []).map((t) => `<a href="/hyperfokus/categoria/${encodeURIComponent(t)}${isEn ? '?lang=en' : ''}" class="tag-pill">#${escapeHtml(t)}</a>`).join('')}
    </div>

    <!-- Título Único H1 Obrigatório por SEO -->
    <h1 class="article-title">${escapeHtml(article.title)}</h1>

    <!-- Barra de Metadados do Artigo -->
    <div class="article-meta-bar">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <img src="${escapeHtml(primaryAuthor.cachedAvatarWebp || '/assets/pyxie/sticker/sticker_smile.png')}" alt="Foto de perfil de ${escapeHtml(primaryAuthor.username)}" class="author-avatar" />
        <a href="/hyperfokus/autor/${encodeURIComponent(primaryAuthor.userId)}${isEn ? '?lang=en' : ''}" style="color:inherit; font-weight:700;">
          ${escapeHtml(primaryAuthor.username)}
        </a>
      </div>

      ${coAuthors.length > 0 ? `
        <button onclick="document.getElementById('coauthors-modal').classList.add('open')" class="btn btn-outline" style="padding:2px 8px; font-size:0.75rem;">
          + e outros ${coAuthors.length}
        </button>
      ` : ''}

      <span>📅 ${publishedDate}</span>
      <span>⏳ ${readingTime} de leitura</span>
    </div>

    <!-- Capa do Artigo (Sem marca d'água dentro do artigo) -->
    ${article.coverImage ? `
      <figure style="margin: 2rem 0;">
        <img src="${escapeHtml(article.coverImage)}" alt="Ilustração de capa do artigo: ${escapeHtml(article.title)}" style="width:100%; max-height:500px; object-fit:cover; border-radius:1rem;" />
      </figure>
    ` : ''}

    <!-- Corpo do Artigo Sanitizado Anti-XSS e com Auto-Internal Links -->
    <article class="article-content" id="article-body">
      ${processedHtml}
    </article>

    <!-- Ações e Engajamento (Curtidas & Compartilhamento) -->
    <section style="margin: 3rem 0; padding: 1.5rem; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <button id="like-btn" class="btn btn-pink" onclick="toggleLike('${article.id}')">
          ❤️ Curtir (<span id="likes-count">${article.likesCount || 0}</span>)
        </button>
        <span style="font-size:0.875rem; color:var(--text-muted);">${isEn ? 'Share your feedback' : 'Gostou do relato? Deixe sua curtida!'}</span>
      </div>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(seo.canonical)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size:0.75rem;">
          Twitter
        </a>
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title} - ${seo.canonical}`)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size:0.75rem;">
          WhatsApp
        </a>
        <a href="/api/hyperfokus/share-image/${article.id}" download="hiperfoco-${article.slug}.webp" class="btn btn-outline" style="font-size:0.75rem;">
          📥 Baixar Card
        </a>
      </div>
    </section>

    <!-- Recomendações Shopee Contextual -->
    ${shopeeProducts.length > 0 ? `
      <section style="margin: 3rem 0; padding: 1.5rem; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 1rem;">
        <h3 style="font-size:1.125rem; font-weight:800; color:#fff; margin-bottom:1rem;">🛍️ Itens Relacionados ao Hiperfoco</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          ${shopeeProducts.map((p) => `
            <a href="${escapeHtml(p.link)}" target="_blank" rel="${p.rel}" style="display:flex; align-items:center; gap:0.75rem; background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:0.75rem; border:1px solid var(--card-border);">
              <img src="${escapeHtml(p.imagem)}" alt="${escapeHtml(p.titulo)}" style="width:48px; height:48px; object-fit:cover; border-radius:0.5rem;" loading="lazy" />
              <div>
                <span style="font-size:0.75rem; font-weight:700; color:#f1f5f9; display:block; line-height:1.2;">${escapeHtml(p.titulo)}</span>
                <span style="font-size:0.75rem; color:#fb7185; font-weight:800;">${escapeHtml(p.preco)}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Seção de Comentários -->
    <section style="margin-top: 3rem;">
      <h3 style="font-size: 1.5rem; font-weight: 900; color: #fff; margin-bottom: 1.5rem;">
        💬 ${isEn ? 'Comments & Discussion' : 'Comentários & Conversa'}
      </h3>

      <div style="margin-bottom: 2rem;">
        ${user ? '' : `<div class="card" style="padding:1rem 1.25rem; display:flex; flex-wrap:wrap; gap:0.75rem; align-items:center; justify-content:space-between;">
          <span style="color:var(--text-muted); font-size:0.9rem;">${isEn ? 'Sign in to like and comment. Email or Discord, your choice.' : 'Entre para curtir e comentar. Com e-mail ou Discord, como preferir.'}</span>
          <span style="display:flex; gap:0.5rem;">
            <a class="btn btn-outline" href="/login?redirect=${encodeURIComponent(`/hyperfokus/${article.slug}${isEn ? '?lang=en' : ''}`)}${isEn ? '&lang=en' : ''}">${isEn ? 'Sign in' : 'Entrar'}</a>
            <a class="btn btn-pink" href="/cadastro?redirect=${encodeURIComponent(`/hyperfokus/${article.slug}${isEn ? '?lang=en' : ''}`)}${isEn ? '&lang=en' : ''}">${isEn ? 'Create account' : 'Criar conta'}</a>
          </span>
        </div>`}
        <form id="comment-form" ${user ? '' : 'hidden'} onsubmit="submitComment(event, '${article.id}')" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <textarea id="comment-text" rows="3" placeholder="${isEn ? 'Write a friendly comment...' : 'Deixe um comentário amigável sobre o hiperfoco...'}" style="width: 100%; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 0.75rem; padding: 0.75rem; color: #fff; font-family: inherit; font-size: 0.875rem;" maxlength="1000" required></textarea>
          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" class="btn btn-pink">
              ${isEn ? 'Post Comment' : 'Enviar Comentário'}
            </button>
          </div>
        </form>
      </div>

      <div id="comments-list" style="display: flex; flex-direction: column; gap: 1rem;">
        <!-- Injetado via client script -->
        <p style="color:var(--text-muted); font-size:0.875rem;">${isEn ? 'Loading comments...' : 'Carregando comentários...'}</p>
      </div>
    </section>
  </main>

  <!-- Modal de Coautores -->
  ${coAuthors.length > 0 ? `
    <div id="coauthors-modal" class="modal-backdrop" onclick="if(event.target === this) this.classList.remove('open')">
      <div class="modal-card">
        <h3 style="font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:1rem;">Coautores do Artigo</h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${article.authors.map((a) => `
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${escapeHtml(a.cachedAvatarWebp || '/assets/pyxie/sticker/sticker_smile.png')}" alt="Foto de perfil de ${escapeHtml(a.username)}" class="author-avatar" />
              <div>
                <a href="/hyperfokus/autor/${encodeURIComponent(a.userId)}" style="font-weight:700; color:#fff;">${escapeHtml(a.username)}</a>
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">${a.role === 'AUTHOR' ? 'Autor Principal' : 'Colaborador'}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
          <button class="btn btn-outline" onclick="document.getElementById('coauthors-modal').classList.remove('open')">Fechar</button>
        </div>
      </div>
    </div>
  ` : ''}

  <!-- Parede de Engajamento Acolhedora (Automação 10: 1x por sessão, suave, não bloqueia leitura) -->
  <aside id="engagement-wall" style="display:none; position:fixed; bottom:20px; right:20px; max-width:360px; background:#120924; border:2px solid #E60067; border-radius:1rem; padding:1.25rem; box-shadow:0 12px 35px rgba(0,0,0,0.7); z-index:999;" aria-label="Aviso da Comunidade">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
      <strong style="color:#fff; font-size:0.95rem;">💡 ${isEn ? 'Enjoying this read?' : 'Gostando do hiperfoco?'}</strong>
      <button onclick="closeEngagementWall()" aria-label="Fechar" style="background:none; border:none; color:var(--text-muted); font-size:1.3rem; cursor:pointer; line-height:1;">&times;</button>
    </div>
    <p style="font-size:0.8125rem; color:var(--text-muted); margin:0.5rem 0 1rem; line-height:1.4;">
      ${isEn 
        ? 'Written with authentic passion by a real human in our community. Join our Discord sanctuary to meet other neurodivergent minds!' 
        : 'Escrito por quem realmente vive o tema, 100% livre de IA. Faça parte da Cringelândia no Discord ou compartilhe seu próprio relato!'}
    </p>
    <div style="display:flex; gap:0.5rem;">
      <a href="/discord" target="_blank" rel="noopener noreferrer" onclick="trackClick('invite')" class="btn btn-pink" style="font-size:0.75rem; padding:6px 12px; flex:1; text-align:center;">
        👾 ${isEn ? 'Join Discord' : 'Entrar no Servidor'}
      </a>
      <button onclick="closeEngagementWall()" class="btn btn-outline" style="font-size:0.75rem; padding:6px 12px;">
        ${isEn ? 'Keep reading' : 'Continuar lendo'}
      </button>
    </div>
  </aside>

  <!-- Parede de Engajamento Acolhedora (Automação 10: 1x por sessão, não bloqueia leitura) -->
  <aside id="engagement-wall" style="display:none; position:fixed; bottom:20px; right:20px; max-width:360px; background:#120924; border:2px solid #E60067; border-radius:1rem; padding:1.25rem; box-shadow:0 12px 35px rgba(0,0,0,0.7); z-index:999;" aria-label="Aviso da Comunidade">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
      <strong style="color:#fff; font-size:0.95rem;">💡 ${isEn ? 'Enjoying this read?' : 'Gostando do hiperfoco?'}</strong>
      <button onclick="closeEngagementWall()" aria-label="Fechar" style="background:none; border:none; color:var(--text-muted); font-size:1.3rem; cursor:pointer; line-height:1;">&times;</button>
    </div>
    <p style="font-size:0.8125rem; color:var(--text-muted); margin:0.5rem 0 1rem; line-height:1.4;">
      ${isEn 
        ? 'Written with authentic passion by a real human in our community. Join our Discord sanctuary to meet other neurodivergent minds!' 
        : 'Escrito por quem realmente vive o tema, 100% livre de IA. Faça parte da Cringelândia no Discord ou compartilhe seu próprio relato!'}
    </p>
    <div style="display:flex; gap:0.5rem;">
      <a href="/discord" target="_blank" rel="noopener noreferrer" onclick="trackClick('invite')" class="btn btn-pink" style="font-size:0.75rem; padding:6px 12px; flex:1; text-align:center;">
        👾 ${isEn ? 'Join Discord' : 'Entrar no Servidor'}
      </a>
      <button onclick="closeEngagementWall()" class="btn btn-outline" style="font-size:0.75rem; padding:6px 12px;">
        ${isEn ? 'Keep reading' : 'Continuar lendo'}
      </button>
    </div>
  </aside>

  <footer class="site-footer">
    <p>Pyxie Hyperfokus • Santuário de Mentes Livres</p>
  </footer>

  ${getReaderScript()}

  <!-- Client Script para Like e Comentários -->
  <script>
    const HF_LOGIN_URL = '/login?redirect=' + encodeURIComponent(location.pathname + location.search);
    function hfEscape(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
    }
    async function toggleLike(articleId) {
      try {
        const res = await fetch('/api/hyperfokus/articles/' + articleId + '/like', { method: 'POST' });
        if (res.status === 401) { location.href = HF_LOGIN_URL; return; }
        const data = await res.json();
        if (data.success) {
          document.getElementById('likes-count').innerText = data.likesCount;
        }
      } catch (err) {
        console.error('Falha ao curtir:', err);
      }
    }

    async function loadComments(articleId) {
      try {
        const res = await fetch('/api/hyperfokus/articles/' + articleId + '/comments');
        const data = await res.json();
        const container = document.getElementById('comments-list');
        if (!data.comments || data.comments.length === 0) {
          container.innerHTML = '<p style="color:var(--text-muted); font-size:0.875rem;">${isEn ? 'No comments yet. Be the first!' : 'Seja o primeiro a comentar!'}</p>';
          return;
        }
        container.innerHTML = data.comments.map(c => \`
          <div style="background:var(--card-bg); border:1px solid var(--card-border); border-radius:0.75rem; padding:1rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
              <img src="\${hfEscape(c.cachedAvatarWebp || '/assets/pyxie/sticker/sticker_smile.png')}" alt="${isEn ? 'Profile picture of' : 'Foto de perfil de'} \${hfEscape(c.username)}" class="author-avatar" />
              <strong style="font-size:0.875rem; color:#fff;">\${hfEscape(c.username)}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted); margin-left:auto;">\${new Date(c.createdAt).toLocaleDateString('${isEn ? 'en-US' : 'pt-BR'}')}</span>
            </div>
            <p style="font-size:0.875rem; color:var(--text-main); white-space:pre-wrap;">\${hfEscape(c.content)}</p>
          </div>
        \`).join('');
      } catch (err) {
        console.error('Falha ao carregar comentários:', err);
      }
    }

    async function submitComment(e, articleId) {
      e.preventDefault();
      const text = document.getElementById('comment-text').value;
      if (!text) return;
      try {
        const res = await fetch('/api/hyperfokus/articles/' + articleId + '/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text })
        });
        if (res.status === 401) { location.href = HF_LOGIN_URL; return; }
        const data = await res.json();
        if (data.success) {
          document.getElementById('comment-text').value = '';
          loadComments(articleId);
        }
      } catch (err) {
        console.error('Falha ao enviar comentário:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', () => loadComments('${article.id}'));

    // Analytics Beacon (Scroll 25/50/75/100, Tempo Ativo, Cliques)
    const trackedScroll = { 25: false, 50: false, 75: false, 100: false };
    let readingSeconds = 0;

    function sendBeacon(payload) {
      const data = JSON.stringify(Object.assign({ articleId: '${article.id}' }, payload));
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/hyperfokus/beacon', data);
      } else {
        fetch('/api/hyperfokus/beacon', { method: 'POST', body: data, keepalive: true }).catch(() => {});
      }
    }

    window.trackClick = function(target) {
      sendBeacon({ event: 'click', target });
    };

    window.closeEngagementWall = function() {
      const wall = document.getElementById('engagement-wall');
      if (wall) wall.style.display = 'none';
      try { sessionStorage.setItem('pyxie_engagement_wall', '1'); } catch (_) {}
    };

    window.addEventListener('scroll', function() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrolled = (window.scrollY / docHeight) * 100;

      [25, 50, 75, 100].forEach(function(depth) {
        if (scrolled >= depth && !trackedScroll[depth]) {
          trackedScroll[depth] = true;
          sendBeacon({ event: 'scroll', depth });
        }
      });

      if (scrolled >= 70) {
        try {
          if (!sessionStorage.getItem('pyxie_engagement_wall')) {
            const wall = document.getElementById('engagement-wall');
            if (wall && wall.style.display === 'none') {
              wall.style.display = 'block';
            }
          }
        } catch (_) {}
      }
    }, { passive: true });

    setInterval(function() {
      if (!document.hidden && document.hasFocus()) {
        readingSeconds += 5;
        if (readingSeconds % 30 === 0) {
          sendBeacon({ event: 'time', seconds: 30 });
        }
      }
    }, 5000);

    window.addEventListener('beforeunload', function() {
      const rem = readingSeconds % 30;
      if (rem > 0) sendBeacon({ event: 'time', seconds: rem });
    });
  </script>
</body>
</html>`;
}

/**
 * Renderiza Páginas Estáticas Institucionais (/como-participar e /termos-e-regras).
 */
function renderStaticInfoPage({ pageKey = 'como-participar', lang = 'pt', user = null } = {}) {
  const isEn = lang === 'en';
  const isRules = pageKey === 'termos-e-regras';

  const title = isRules
    ? (isEn ? 'Community Rules & Terms • Pyxie Hyperfokus' : 'Termos & Regras da Comunidade • Pyxie Hyperfokus')
    : (isEn ? 'How to Participate & Publish • Pyxie Hyperfokus' : 'Como Participar & Publicar • Pyxie Hyperfokus');

  const q = isEn ? '?lang=en' : '';
  const signup = user ? `/meu-perfil/escrever${q}` : `/cadastro?redirect=${encodeURIComponent(`/meu-perfil/escrever${q}`)}${isEn ? '&lang=en' : ''}`;
  const description = isRules
    ? (isEn ? 'What can be published on Pyxie Hyperfokus: human-written texts only, care with sensitive topics and your copyright.' : 'O que pode ser publicado no Pyxie Hyperfokus: só texto humano, cuidado com temas sensíveis e seus direitos autorais.')
    : (isEn ? 'Publish your hyperfocus on Pyxie Hyperfokus: write on the site with an account (email or Discord) or in the Cringelândia forum.' : 'Publique seu hiperfoco no Pyxie Hyperfokus: escreva pelo site com uma conta (e-mail ou Discord) ou pelo fórum da Cringelândia.');

  const rulesPt = `
    <h2>1. Só texto escrito por gente</h2>
    <p>O Hyperfokus existe para relatos e guias de quem vive o assunto. Texto gerado por IA é recusado na revisão. Corretor ortográfico pode; escrever por você, não.</p>
    <h2>2. Cite as fontes</h2>
    <p>Fato, número ou estudo citado precisa de link para a fonte. Experiência pessoal não precisa: ela é a fonte.</p>
    <h2>3. Cuidado com temas sensíveis</h2>
    <p>Saúde mental, autismo, luto e crises sensoriais são bem-vindos, com tom responsável. Nada de glorificar automutilação ou sofrimento. Se você estiver em crise agora, ligue para o CVV no <strong>188</strong> (24 horas, gratuito).</p>
    <h2>4. Seu texto continua seu</h2>
    <p>Você mantém a autoria. Ao publicar, autoriza a Pyxie a exibir e divulgar o texto (site, RSS e redes sociais da Pyxie), sempre com o seu nome. Quem copiar precisa dar crédito e link para o artigo original.</p>
    <h2>5. Remoção</h2>
    <p>Quer tirar um artigo do ar ou corrigir algo? Abra <a href="/meu-perfil${q}">Meu perfil</a> e use <em>Solicitar remoção</em>. A equipe responde pelo suporte.</p>`;
  const rulesEn = `
    <h2>1. Human-written only</h2>
    <p>Hyperfokus is for stories and guides by people who live the topic. AI-generated text is rejected in review. Spell checkers are fine; something writing for you is not.</p>
    <h2>2. Cite your sources</h2>
    <p>Facts, numbers or studies need a link to the source. Personal experience doesn't: you are the source.</p>
    <h2>3. Care with sensitive topics</h2>
    <p>Mental health, autism, grief and sensory crises are welcome, written responsibly. No glorifying self-harm or suffering. If you are in crisis right now, please reach out to a local helpline (in Brazil, CVV: <strong>188</strong>).</p>
    <h2>4. Your text stays yours</h2>
    <p>You keep authorship. By publishing, you allow Pyxie to display and share the text (site, RSS and Pyxie's social media), always credited to you. Anyone reusing it must credit you and link to the original article.</p>
    <h2>5. Removal</h2>
    <p>Want an article taken down or fixed? Open <a href="/meu-perfil${q}">My profile</a> and use <em>Request removal</em>. The team answers through support.</p>`;

  const howPt = `
    <p>Dá para publicar de dois jeitos. <strong>Não precisa ter Discord.</strong></p>
    <h2>Pelo site</h2>
    <ol>
      <li><a href="${signup}">Crie sua conta</a> com e-mail e senha ou entre com o Discord.</li>
      <li>Em <strong>Meu perfil</strong>, clique em <strong>Escrever</strong>. O texto fica salvo como rascunho na sua conta enquanto você escreve.</li>
      <li>Quando terminar, clique em <strong>Enviar para análise</strong>.</li>
      <li>A equipe lê o texto. Se aprovar, o artigo vai para o blog com o seu nome e aparece na sua página de autor.</li>
    </ol>
    <p><a class="btn btn-pink" href="${signup}">${user ? 'Escrever agora' : 'Criar conta e escrever'}</a></p>
    <h2>Pelo Discord (Cringelândia)</h2>
    <ol>
      <li><a href="/discord" rel="noopener">Entre na Cringelândia</a> e abra o fórum de Hiperfocos.</li>
      <li>Crie uma postagem. Enquanto ela é um rascunho, só você e seus coautores conseguem escrever ali; outras mensagens são removidas.</li>
      <li>Quer escrever junto? Use <code>/py-add</code> ou <code>py!add @pessoa</code>.</li>
      <li>Terminou? Use <code>/py-concluir</code>, <code>py!concluir</code> ou o botão na mensagem da Pyxie. O tópico abre para comentários e o texto vai para a análise.</li>
      <li>Se aprovado, a Pyxie avisa no tópico com o link do artigo.</li>
    </ol>
    <h2>O que a revisão olha</h2>
    <ul>
      <li>Texto seu, sem IA (veja as <a href="/hyperfokus/termos-e-regras${q}">regras</a>).</li>
      <li>Fontes nos fatos que você citar.</li>
      <li>Formatação: títulos, negrito, listas, links e imagens (o editor tem botões para tudo isso).</li>
    </ul>
    <p>A equipe pode ajustar a formatação e o título que aparece no Google, sem mudar o que você disse.</p>
    <h2>Dúvidas comuns</h2>
    <h3>Posso editar depois de publicado?</h3>
    <p>Peça a correção em Meu perfil, em <em>Solicitar remoção</em>, explicando o que mudar.</p>
    <h3>Quanto tempo demora a análise?</h3>
    <p>A equipe é pequena e humana; o andamento aparece em Meu perfil.</p>`;
  const howEn = `
    <p>There are two ways to publish. <strong>You don't need Discord.</strong></p>
    <h2>On the website</h2>
    <ol>
      <li><a href="${signup}">Create your account</a> with email and password, or sign in with Discord.</li>
      <li>In <strong>My profile</strong>, click <strong>Write</strong>. Your text is saved as a draft in your account while you write.</li>
      <li>When you're done, click <strong>Submit for review</strong>.</li>
      <li>The team reads it. If approved, it goes live on the blog with your name and shows up on your author page.</li>
    </ol>
    <p><a class="btn btn-pink" href="${signup}">${user ? 'Write now' : 'Create account and write'}</a></p>
    <h2>On Discord (Cringelândia)</h2>
    <ol>
      <li><a href="/discord" rel="noopener">Join Cringelândia</a> and open the Hyperfocus forum.</li>
      <li>Create a post. While it's a draft, only you and your co-authors can write there; other messages are removed.</li>
      <li>Writing with someone? Use <code>/py-add</code> or <code>py!add @person</code>.</li>
      <li>Done? Use <code>/py-concluir</code>, <code>py!conclude</code> or the button in Pyxie's message. The post opens for comments and goes to review.</li>
      <li>If approved, Pyxie posts the article link in the thread.</li>
    </ol>
    <h2>What review checks</h2>
    <ul>
      <li>Your own words, no AI (see the <a href="/hyperfokus/termos-e-regras${q}">rules</a>).</li>
      <li>Sources for the facts you cite.</li>
      <li>Formatting: headings, bold, lists, links and images (the editor has buttons for all of it).</li>
    </ul>
    <p>The team may adjust formatting and the title shown on Google, without changing what you said.</p>
    <h2>Common questions</h2>
    <h3>Can I edit after it's published?</h3>
    <p>Ask for a fix in My profile, under <em>Request removal</em>, explaining what to change.</p>
    <h3>How long does review take?</h3>
    <p>The team is small and human; you can follow the status in My profile.</p>`;

  const contentHtml = isRules ? (isEn ? rulesEn : rulesPt) : (isEn ? howEn : howPt);
  const canonical = `https://pyxie.com.br/hyperfokus/${isRules ? 'termos-e-regras' : 'como-participar'}`;

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="pt-BR" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${canonical}?lang=en">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://pyxie.com.br/assets/pyxie/sticker/sticker_smile.png">
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical, inLanguage: isEn ? 'en' : 'pt-BR' })}</script>
  <style>${getSharedStyles()}</style>
</head>
<body>
  ${renderSiteHeader({ lang, user, path: `/hyperfokus/${pageKey}` })}

  <main class="article-wrap">
    <h1 class="article-title">${escapeHtml(title)}</h1>
    <div class="article-content">
      ${contentHtml}
    </div>
  </main>

  <!-- Parede de Engajamento Acolhedora (Automação 10: 1x por sessão, não bloqueia leitura) -->
  <aside id="engagement-wall" style="display:none; position:fixed; bottom:20px; right:20px; max-width:360px; background:#120924; border:2px solid #E60067; border-radius:1rem; padding:1.25rem; box-shadow:0 12px 35px rgba(0,0,0,0.7); z-index:999;" aria-label="Aviso da Comunidade">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
      <strong style="color:#fff; font-size:0.95rem;">💡 ${isEn ? 'Enjoying this read?' : 'Gostando do hiperfoco?'}</strong>
      <button onclick="closeEngagementWall()" aria-label="Fechar" style="background:none; border:none; color:var(--text-muted); font-size:1.3rem; cursor:pointer; line-height:1;">&times;</button>
    </div>
    <p style="font-size:0.8125rem; color:var(--text-muted); margin:0.5rem 0 1rem; line-height:1.4;">
      ${isEn 
        ? 'Written with authentic passion by a real human in our community. Join our Discord sanctuary to meet other neurodivergent minds!' 
        : 'Escrito por quem realmente vive o tema, 100% livre de IA. Faça parte da Cringelândia no Discord ou compartilhe seu próprio relato!'}
    </p>
    <div style="display:flex; gap:0.5rem;">
      <a href="/discord" target="_blank" rel="noopener noreferrer" onclick="trackClick('invite')" class="btn btn-pink" style="font-size:0.75rem; padding:6px 12px; flex:1; text-align:center;">
        👾 ${isEn ? 'Join Discord' : 'Entrar no Servidor'}
      </a>
      <button onclick="closeEngagementWall()" class="btn btn-outline" style="font-size:0.75rem; padding:6px 12px;">
        ${isEn ? 'Keep reading' : 'Continuar lendo'}
      </button>
    </div>
  </aside>

  <footer class="site-footer">
    <p>Pyxie Hyperfokus • Santuário de Mentes Livres</p>
  </footer>
</body>
</html>`;
}



/**
 * Página de Login de Contas Unificadas (/login)
 */
function renderLoginPage({ lang = 'pt', redirect = '/meu-perfil', error = null, message = null } = {}) {
  const isEn = lang === 'en';
  const sharedCss = getSharedStyles();

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Login • Pyxie Hyperfokus' : 'Entrar • Pyxie Hyperfokus'}</title>
  <meta name="robots" content="noindex, follow">
  <link rel="icon" type="image/png" href="/assets/pyxie/sticker/sticker_smile.png">
  <style>
    ${sharedCss}
    .auth-card {
      max-width: 440px;
      margin: 3rem auto;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      text-align: center;
    }
    .form-group { text-align: left; margin-bottom: 1.25rem; }
    .form-label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem; }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.85rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .form-input:focus { outline: none; border-color: var(--accent-pink); box-shadow: 0 0 12px rgba(230, 0, 103, 0.3); }
    .alert-box { padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: left; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">Hyperfokus</span></span>
      </a>
      <div class="nav-actions">
        <a href="${isEn ? '/login' : '/login?lang=en'}" class="btn btn-outline" style="font-size:0.75rem;">
          🌐 ${isEn ? 'Português' : 'English'}
        </a>
      </div>
    </div>
  </header>

  <main class="main-container">
    <div class="auth-card">
      <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="64" height="64" style="margin-bottom:1rem;" />
      <h1 style="font-size:1.6rem; font-weight:900; margin-bottom:0.5rem; color:#fff;">
        ${isEn ? 'Welcome Back!' : 'Entrar no Hyperfokus'}
      </h1>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem; font-style:italic;">
        ${isEn
          ? '“Look who showed up! Get in already before I change my mind and lock the portal!”'
          : '“Apareceu, fantasma desnutrido? Entra logo antes que eu mude de ideia e tranque o portal!”'}
      </p>

      ${error ? `<div class="alert-box alert-error">${escapeHtml(error)}</div>` : ''}
      ${message ? `<div class="alert-box alert-success">${escapeHtml(message)}</div>` : ''}
      <div id="client-error" class="alert-box alert-error" style="display:none;"></div>


      <a href="/auth/discord?next=${encodeURIComponent(redirect)}" class="btn" style="width:100%; justify-content:center; background:#5865F2; color:#fff; margin-bottom:1rem;">
        ${isEn ? 'Sign in with Discord' : 'Entrar com Discord'}
      </a>
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; color:var(--text-muted); font-size:0.8rem;">
        <span style="flex:1; height:1px; background:var(--card-border);"></span>
        ${isEn ? 'or with email' : 'ou com e-mail'}
        <span style="flex:1; height:1px; background:var(--card-border);"></span>
      </div>
      <form id="login-form">
        <div class="form-group">
          <label class="form-label" for="login-email">${isEn ? 'Email Address' : 'Endereço de E-mail'}</label>
          <input type="email" id="login-email" class="form-input" required autocomplete="email" placeholder="seu@email.com" />
        </div>

        <div class="form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <label class="form-label" for="login-pass" style="margin-bottom:0;">${isEn ? 'Password' : 'Sua Senha'}</label>
            <a href="/esqueci-senha${isEn ? '?lang=en' : ''}" style="font-size:0.75rem;">${isEn ? 'Forgot password?' : 'Esqueceu a senha?'}</a>
          </div>
          <input type="password" id="login-pass" class="form-input" required autocomplete="current-password" placeholder="••••••••" />
        </div>

        <button type="submit" id="btn-submit" class="btn btn-pink" style="width:100%; padding:0.85rem; font-size:1rem; margin-top:0.5rem;">
          ✨ ${isEn ? 'Enter Portal' : 'Acessar Conta'}
        </button>
      </form>

      <div style="margin-top:1.75rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,0.08); font-size:0.85rem; color:var(--text-muted);">
        ${isEn ? "Don't have an account yet?" : 'Ainda não tem uma conta?'}
        <a href="/cadastro${isEn ? '?lang=en' : ''}" style="font-weight:700; margin-left:4px;">
          ${isEn ? 'Sign up for free' : 'Cadastre-se grátis'}
        </a>
      </div>
    </div>
  </main>

  <script>
    document.getElementById('login-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const errBox = document.getElementById('client-error');
      const btn = document.getElementById('btn-submit');
      errBox.style.display = 'none';

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-pass').value;

      btn.disabled = true;
      btn.innerText = '${isEn ? 'Authenticating...' : 'Autenticando...'}';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, lang: '${lang}' })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '${redirect}';
        } else {
          errBox.textContent = data.message || '${isEn ? 'Invalid credentials' : 'Credenciais inválidas'}';
          errBox.style.display = 'block';
        }
      } catch (err) {
        errBox.textContent = '${isEn ? 'Connection error' : 'Erro de conexão'}';
        errBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.innerText = '✨ ${isEn ? 'Enter Portal' : 'Acessar Conta'}';
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Página de Cadastro de Contas (/cadastro)
 */
function renderRegisterPage({ lang = 'pt', redirect = '/meu-perfil', error = null } = {}) {
  const isEn = lang === 'en';
  const sharedCss = getSharedStyles();

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Create Account • Pyxie Hyperfokus' : 'Criar Conta • Pyxie Hyperfokus'}</title>
  <meta name="robots" content="noindex, follow">
  <link rel="icon" type="image/png" href="/assets/pyxie/sticker/sticker_smile.png">
  <style>
    ${sharedCss}
    .auth-card {
      max-width: 460px;
      margin: 3rem auto;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      text-align: center;
    }
    .form-group { text-align: left; margin-bottom: 1.25rem; }
    .form-label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem; }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.85rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .form-input:focus { outline: none; border-color: var(--accent-pink); box-shadow: 0 0 12px rgba(230, 0, 103, 0.3); }
    .alert-box { padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: left; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">Hyperfokus</span></span>
      </a>
      <div class="nav-actions">
        <a href="${isEn ? '/cadastro' : '/cadastro?lang=en'}" class="btn btn-outline" style="font-size:0.75rem;">
          🌐 ${isEn ? 'Português' : 'English'}
        </a>
      </div>
    </div>
  </header>

  <main class="main-container">
    <div class="auth-card">
      <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="64" height="64" style="margin-bottom:1rem;" />
      <h1 style="font-size:1.6rem; font-weight:900; margin-bottom:0.5rem; color:#fff;">
        ${isEn ? 'Join as an Author' : 'Criar Conta de Autor'}
      </h1>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem; font-style:italic;">
        ${isEn
          ? '“A new author? Tsc, more work for me... Fine. Pick Discord or a strong password, I won\'t say it twice!”'
          : '“Autor novo? Tsc, mais trabalho pra mim... Tá. Entra com o Discord ou escolhe uma senha forte, não vou repetir!”'}
      </p>

      ${error ? `<div class="alert-box alert-error">${escapeHtml(error)}</div>` : ''}
      <div id="client-error" class="alert-box alert-error" style="display:none;"></div>


      <a href="/auth/discord?next=${encodeURIComponent(redirect)}" class="btn" style="width:100%; justify-content:center; background:#5865F2; color:#fff; margin-bottom:1rem;">
        ${isEn ? 'Sign up with Discord' : 'Criar conta com Discord'}
      </a>
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; color:var(--text-muted); font-size:0.8rem;">
        <span style="flex:1; height:1px; background:var(--card-border);"></span>
        ${isEn ? 'or with email' : 'ou com e-mail'}
        <span style="flex:1; height:1px; background:var(--card-border);"></span>
      </div>
      <form id="reg-form">
        <div class="form-group">
          <label class="form-label" for="reg-email">${isEn ? 'Email Address' : 'Endereço de E-mail'}</label>
          <input type="email" id="reg-email" class="form-input" required autocomplete="email" placeholder="seu@email.com" />
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-pass">${isEn ? 'Password (minimum 8 characters)' : 'Senha (mínimo 8 caracteres)'}</label>
          <input type="password" id="reg-pass" class="form-input" minlength="8" required autocomplete="new-password" placeholder="••••••••" />
        </div>

        <div class="form-group" style="margin-bottom:1.5rem;">
          <label style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.8rem; color:var(--text-muted); cursor:pointer;">
            <input type="checkbox" required style="margin-top:2px;" />
            <span>
              ${isEn
                ? 'I pledge to write 100% human-authored content and agree to the <a href="/hyperfokus/termos-e-regras?lang=en" target="_blank">Anti-AI Terms</a>.'
                : 'Concordo em escrever conteúdo 100% autoral humano e aceito os <a href="/hyperfokus/termos-e-regras" target="_blank">Termos Anti-IA</a>.'}
            </span>
          </label>
        </div>

        <button type="submit" id="btn-submit" class="btn btn-pink" style="width:100%; padding:0.85rem; font-size:1rem;">
          📝 ${isEn ? 'Create My Account' : 'Finalizar Cadastro'}
        </button>
      </form>

      <div style="margin-top:1.75rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,0.08); font-size:0.85rem; color:var(--text-muted);">
        ${isEn ? 'Already have an account?' : 'Já possui uma conta?'}
        <a href="/login${isEn ? '?lang=en' : ''}" style="font-weight:700; margin-left:4px;">
          ${isEn ? 'Sign in' : 'Entrar aqui'}
        </a>
      </div>
    </div>
  </main>

  <script>
    document.getElementById('reg-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const errBox = document.getElementById('client-error');
      const btn = document.getElementById('btn-submit');
      errBox.style.display = 'none';

      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-pass').value;

      btn.disabled = true;
      btn.innerText = '${isEn ? 'Creating account...' : 'Criando conta...'}';

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, lang: '${lang}' })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '${redirect}';
        } else {
          errBox.textContent = data.message || (data.error === 'email_already_registered' ? '${isEn ? 'Email already registered' : 'Este e-mail já está cadastrado'}' : '${isEn ? 'Registration error' : 'Erro no cadastro'}');
          errBox.style.display = 'block';
        }
      } catch (err) {
        errBox.textContent = '${isEn ? 'Connection error' : 'Erro de conexão'}';
        errBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.innerText = '📝 ${isEn ? 'Create My Account' : 'Finalizar Cadastro'}';
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Página de Perfil do Usuário (/meu-perfil)
 */
function renderProfilePage({ account, stats, lang = 'pt', message = null, error = null } = {}) {
  const isEn = lang === 'en';
  const sharedCss = getSharedStyles();
  const emailPrefix = account.email ? account.email.split('@')[0] : 'Autor';
  const userDiscord = account.discordUserId ? `@${account.discordUserId}` : null;
  const isVerified = account.verifiedEmail === 1;

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'My Profile • Pyxie Hyperfokus' : 'Meu Perfil • Pyxie Hyperfokus'}</title>
  <meta name="robots" content="noindex, follow">
  <link rel="icon" type="image/png" href="/assets/pyxie/sticker/sticker_smile.png">
  <style>
    ${sharedCss}
    .profile-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.5rem;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .stat-pill {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      padding: 1.25rem 1rem;
      text-align: center;
    }
    .article-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      margin-bottom: 0.75rem;
      transition: all 0.2s;
    }
    .article-item:hover { border-color: rgba(230, 0, 103, 0.3); }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .status-published { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-draft { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">Hyperfokus</span></span>
      </a>
      <div class="nav-actions">
        <a href="/meu-perfil/escrever${isEn ? '?lang=en' : ''}" class="btn btn-pink">
          ✍️ ${isEn ? 'Write Article' : 'Escrever Artigo'}
        </a>
        <button id="btn-logout" class="btn btn-outline" style="font-size:0.75rem;">
          🚪 ${isEn ? 'Sign Out' : 'Sair'}
        </button>
      </div>
    </div>
  </header>

  <main class="main-container">
    <div class="profile-card">
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1.5rem;">
        <div style="display:flex; align-items:center; gap:1.25rem;">
          <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Avatar" width="68" height="68" style="border-radius:50%; border:2px solid var(--accent-pink);" />
          <div>
            <h1 style="font-size:1.5rem; font-weight:900; color:#fff; margin-bottom:0.25rem;">
              ${escapeHtml(account.email || emailPrefix)}
            </h1>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center; font-size:0.8rem;">
              <span class="status-badge ${isVerified ? 'status-published' : 'status-pending'}">
                ${isVerified ? (isEn ? 'Verified Author' : 'E-mail Verificado') : (isEn ? 'Pending Email Verification' : 'E-mail Pendente')}
              </span>
              ${userDiscord ? `<span style="color:var(--text-muted);">Discord: <b>${escapeHtml(userDiscord)}</b></span>` : ''}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:0.75rem;">
          <a href="/meu-perfil/escrever${isEn ? '?lang=en' : ''}" class="btn btn-pink">
            ✨ ${isEn ? 'New Article' : 'Novo Artigo'}
          </a>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:1rem; margin-top:2rem;">
        <div class="stat-pill">
          <span style="font-size:0.75rem; color:var(--text-muted);">${isEn ? 'Total Articles' : 'Total Artigos'}</span>
          <p style="font-size:1.6rem; font-weight:900; color:#fff; margin-top:0.25rem;">${stats.totalArticles || 0}</p>
        </div>
        <div class="stat-pill">
          <span style="font-size:0.75rem; color:var(--text-muted);">${isEn ? 'Published' : 'Publicados'}</span>
          <p style="font-size:1.6rem; font-weight:900; color:#34d399; margin-top:0.25rem;">${stats.publishedCount || 0}</p>
        </div>
        <div class="stat-pill">
          <span style="font-size:0.75rem; color:var(--text-muted);">${isEn ? 'In Review' : 'Em Análise'}</span>
          <p style="font-size:1.6rem; font-weight:900; color:#fbbf24; margin-top:0.25rem;">${stats.pendingCount || 0}</p>
        </div>
        <div class="stat-pill">
          <span style="font-size:0.75rem; color:var(--text-muted);">${isEn ? 'Total Likes' : 'Curtidas Recebidas'}</span>
          <p style="font-size:1.6rem; font-weight:900; color:var(--accent-pink); margin-top:0.25rem;">${stats.totalLikes || 0}</p>
        </div>
        <div class="stat-pill">
          <span style="font-size:0.75rem; color:var(--text-muted);">${isEn ? 'Comments' : 'Comentários'}</span>
          <p style="font-size:1.6rem; font-weight:900; color:#c084fc; margin-top:0.25rem;">${stats.totalComments || 0}</p>
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr; gap:2rem;">
      <div class="profile-card" style="margin-bottom:0;">
        <h2 style="font-size:1.25rem; font-weight:900; color:#fff; margin-bottom:1.25rem;">
          📚 ${isEn ? 'My Published & Submitted Articles' : 'Meus Artigos Publicados & Em Análise'}
        </h2>

        ${(!stats.articles || stats.articles.length === 0) ? `
          <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted); font-size:0.9rem;">
            ${isEn ? 'You haven’t submitted any articles yet. Start writing today!' : 'Você ainda não possui artigos enviados. Clique em "Escrever Artigo" e compartilhe seu hiperfoco!'}
          </div>
        ` : `
          <div style="display:flex; flex-direction:column;">
            ${stats.articles.map((art) => `
              <div class="article-item">
                <div style="min-width:0; flex:1; margin-right:1rem;">
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                    <span class="status-badge ${art.status === 'PUBLISHED' ? 'status-published' : 'status-pending'}">
                      ${art.status === 'PUBLISHED' ? (isEn ? 'Published' : 'Publicado') : (isEn ? 'In Review' : 'Em Análise')}
                    </span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">/${art.slug}</span>
                  </div>
                  <h3 style="font-size:1.05rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${escapeHtml(art.title)}
                  </h3>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
                    👁️ ${art.viewsCount || 0} views • ❤️ ${art.likesCount || 0} curtidas
                  </div>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                  ${art.status === 'PUBLISHED' ? `
                    <a href="/hyperfokus/${art.slug}" class="btn btn-outline" style="font-size:0.75rem; padding:0.4rem 0.75rem;" target="_blank">
                      🔗 ${isEn ? 'View' : 'Abrir'}
                    </a>
                  ` : ''}
                  <button onclick="requestRemoval('${art.id}', '${escapeHtml(art.title)}')" class="btn btn-outline" style="font-size:0.75rem; padding:0.4rem 0.75rem; color:#fca5a5;">
                    🗑️ ${isEn ? 'Remove' : 'Remover'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="profile-card">
        <h2 style="font-size:1.25rem; font-weight:900; color:#fff; margin-bottom:1.25rem;">
          📝 ${isEn ? 'My Web Drafts' : 'Meus Rascunhos no Site'}
        </h2>

        ${(!stats.drafts || stats.drafts.length === 0) ? `
          <div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.9rem;">
            ${isEn ? 'No drafts currently saved.' : 'Nenhum rascunho em aberto no momento.'}
          </div>
        ` : `
          <div style="display:flex; flex-direction:column;">
            ${stats.drafts.map((d) => `
              <div class="article-item">
                <div style="min-width:0; flex:1; margin-right:1rem;">
                  <span class="status-badge status-draft">${d.status}</span>
                  <h3 style="font-size:1.05rem; font-weight:700; color:#fff; margin-top:0.25rem;">
                    ${escapeHtml(d.title || (isEn ? 'Untitled Draft' : 'Rascunho Sem Título'))}
                  </h3>
                  <span style="font-size:0.75rem; color:var(--text-muted);">
                    ${isEn ? 'Last edited:' : 'Última edição:'} ${new Date(d.updatedAt).toLocaleDateString(isEn ? 'en-US' : 'pt-BR')}
                  </span>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                  <a href="/meu-perfil/escrever?draftId=${d.id}${isEn ? '&lang=en' : ''}" class="btn btn-pink" style="font-size:0.75rem; padding:0.4rem 0.75rem;">
                    ✍️ ${isEn ? 'Edit' : 'Editar'}
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="profile-card">
        <h2 style="font-size:1.25rem; font-weight:900; color:#fff; margin-bottom:0.5rem;">
          👁️ ${isEn ? 'Saved Reader Preferences' : 'Preferências de Leitura Salvas'}
        </h2>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem;">
          ${isEn ? 'Synchronize your accessibility settings across all your devices.' : 'Sincronize sua experiência de leitura acessível em todos os seus dispositivos.'}
        </p>

        <div style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center;">
          <div>
            <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.25rem;">${isEn ? 'Theme' : 'Tema Padrão'}</label>
            <select id="pref-theme" style="padding:0.5rem 0.75rem; border-radius:0.75rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid var(--card-border);">
              <option value="dark" ${account.readingPreferences?.theme === 'dark' ? 'selected' : ''}>🌙 Escuro</option>
              <option value="sepia" ${account.readingPreferences?.theme === 'sepia' ? 'selected' : ''}>📜 Sépia</option>
              <option value="contrast" ${account.readingPreferences?.theme === 'contrast' ? 'selected' : ''}>⚡ Alto Contraste</option>
            </select>
          </div>

          <div>
            <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.25rem;">${isEn ? 'Font Size' : 'Tamanho da Fonte'}</label>
            <select id="pref-size" style="padding:0.5rem 0.75rem; border-radius:0.75rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid var(--card-border);">
              <option value="small" ${account.readingPreferences?.fontSize === 'small' ? 'selected' : ''}>A- Pequeno</option>
              <option value="normal" ${account.readingPreferences?.fontSize === 'normal' || !account.readingPreferences?.fontSize ? 'selected' : ''}>A Normal</option>
              <option value="large" ${account.readingPreferences?.fontSize === 'large' ? 'selected' : ''}>A+ Grande</option>
            </select>
          </div>

          <div style="margin-top:1.25rem;">
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:#fff; cursor:pointer;">
              <input type="checkbox" id="pref-dyslexic" ${account.readingPreferences?.dyslexicFont ? 'checked' : ''} />
              <span>${isEn ? 'Dyslexia-friendly Font' : 'Fonte para Dislexia (OpenDyslexic)'}</span>
            </label>
          </div>

          <div style="margin-top:1.25rem;">
            <button id="btn-save-pref" class="btn btn-outline" style="font-size:0.8rem;">
              💾 ${isEn ? 'Save Preferences' : 'Salvar Preferências'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    document.getElementById('btn-logout').addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/hyperfokus';
    });

    document.getElementById('btn-save-pref').addEventListener('click', async () => {
      const theme = document.getElementById('pref-theme').value;
      const fontSize = document.getElementById('pref-size').value;
      const dyslexicFont = document.getElementById('pref-dyslexic').checked;
      const btn = document.getElementById('btn-save-pref');

      btn.innerText = 'Salvando...';
      await fetch('/api/user/reading-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, fontSize, dyslexicFont })
      });
      btn.innerText = '✓ Salvo com sucesso!';
      setTimeout(() => { btn.innerText = '💾 ${isEn ? 'Save Preferences' : 'Salvar Preferências'}'; }, 2000);
    });

    async function requestRemoval(articleId, title) {
      const reason = prompt('${isEn ? 'Please specify why you are requesting removal or revision of this article:' : 'Informe o motivo da solicitação de remoção ou revisão deste artigo:'}');
      if (!reason) return;
      try {
        const res = await fetch('/api/user/removal-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId, reason })
        });
        const data = await res.json();
        alert(data.message || 'Ticket registrado com sucesso!');
      } catch (_) {
        alert('Erro ao registrar solicitação.');
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Editor Autoral Web com Importador do GitHub (/meu-perfil/escrever)
 */
function renderWebEditorPage({ account, draft = null, lang = 'pt' } = {}) {
  const isEn = lang === 'en';
  const sharedCss = getSharedStyles();

  const titleVal = draft?.title || '';
  const contentVal = draft?.contentMarkdown || '';
  const coverVal = draft?.coverImage || '';
  const tagsVal = (draft?.categoryTags || []).join(', ');
  const initialHtml = contentVal ? markdownToHtml(contentVal) : '';

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Write Article • Pyxie Hyperfokus' : 'Escrever Hiperfoco • Pyxie Hyperfokus'}</title>
  <meta name="robots" content="noindex, follow">
  <link rel="icon" type="image/png" href="/assets/pyxie/sticker/sticker_smile.png">
  <style>
    ${sharedCss}
    .editor-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 1024px) {
      .editor-layout { grid-template-columns: 1fr 1fr; }
    }
    .editor-panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.5rem;
      padding: 1.5rem;
    }
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem; }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.85rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .form-input:focus { outline: none; border-color: var(--accent-pink); box-shadow: 0 0 12px rgba(230, 0, 103, 0.3); }
    .textarea-md {
      width: 100%;
      min-height: 480px;
      padding: 1rem;
      border-radius: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      resize: vertical;
    }
    .textarea-md:focus { outline: none; border-color: var(--accent-pink); }
    .preview-pane {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      padding: 1.5rem;
      max-height: 600px;
      overflow-y: auto;
    }
    .anti-ai-banner {
      background: rgba(230, 0, 103, 0.1);
      border: 1px solid rgba(230, 0, 103, 0.3);
      border-radius: 1rem;
      padding: 1rem 1.25rem;
      font-size: 0.85rem;
      color: #fbcfe8;
      margin-bottom: 1.5rem;
    }
    .github-tool {
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 1rem;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/meu-perfil${isEn ? '?lang=en' : ''}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">Editor</span></span>
      </a>
      <div class="nav-actions">
        <a href="/meu-perfil${isEn ? '?lang=en' : ''}" class="btn btn-outline" style="font-size:0.8rem;">
          ← ${isEn ? 'Back to Profile' : 'Voltar ao Perfil'}
        </a>
        <button id="btn-save-draft" class="btn btn-outline" style="font-size:0.8rem;">
          💾 ${isEn ? 'Save Draft' : 'Salvar Rascunho'}
        </button>
        <button id="btn-submit-review" class="btn btn-pink" style="font-size:0.8rem;">
          🚀 ${isEn ? 'Submit for Review' : 'Enviar para Moderação'}
        </button>
      </div>
    </div>
  </header>

  <main class="main-container">
    <h1 style="font-size:1.8rem; font-weight:900; margin-bottom:1rem; color:#fff;">
      ${isEn ? 'Write Your Authentic Hyperfocus' : 'Escreva seu Hiperfoco Autoral'}
    </h1>

    <div class="anti-ai-banner">
      🛡️ <b>${isEn ? '100% Human-Authored Commitment:' : 'Compromisso 100% Humano:'}</b>
      ${isEn
        ? 'Pyxie Hyperfokus celebrates authentic passion and real experiences. Pure AI-generated texts will be rejected during moderation.'
        : 'O Pyxie Hyperfokus celebra a paixão autêntica e a pesquisa aprofundada. Artigos puramente gerados por IA são terminantemente recusados na moderação.'}
    </div>

    <div class="editor-layout">
      <!-- Coluna da Esquerda: Formulário e Markdown -->
      <div class="editor-panel">
        <div class="form-group">
          <label class="form-label" for="inp-title">${isEn ? 'Article Title' : 'Título do Artigo'}</label>
          <input type="text" id="inp-title" class="form-input" value="${escapeHtml(titleVal)}" placeholder="${isEn ? 'E.g., Complete Guide to Backyard Astronomy' : 'Ex: Guia Completo de Astronomia Amadora'}" />
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label" for="inp-tags">${isEn ? 'Tags / Categories (comma separated)' : 'Tags / Categorias (separadas por vírgula)'}</label>
            <input type="text" id="inp-tags" class="form-input" value="${escapeHtml(tagsVal)}" placeholder="ciência, espaço, hobbies" />
          </div>
          <div class="form-group">
            <label class="form-label" for="inp-cover">${isEn ? 'Cover Image URL (Optional)' : 'URL da Capa (Opcional)'}</label>
            <input type="text" id="inp-cover" class="form-input" value="${escapeHtml(coverVal)}" placeholder="https://..." />
          </div>
        </div>

        <!-- Ferramenta de Importação do GitHub -->
        <div class="github-tool">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <label class="form-label" style="margin-bottom:0; color:#c084fc;">
              🐙 ${isEn ? 'Import Snippet from GitHub' : 'Importar Trecho de Código do GitHub'}
            </label>
            <span style="font-size:0.75rem; color:var(--text-muted);">github.com/.../blob/...#L10-L30</span>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" id="inp-github-url" class="form-input" placeholder="https://github.com/owner/repo/blob/main/file.js#L1-L20" style="font-size:0.8rem;" />
            <button type="button" id="btn-import-github" class="btn btn-outline" style="font-size:0.75rem; white-space:nowrap;">
              ${isEn ? 'Import' : 'Importar'}
            </button>
          </div>
        </div>

        <div class="form-group">
          <span class="form-label" id="lbl-content">${isEn ? 'Your article' : 'Seu artigo'}</span>
          <div id="pyx-editor" aria-labelledby="lbl-content"></div>
          <noscript><textarea id="inp-markdown-ns" class="textarea-md" disabled>${escapeHtml(contentVal)}</textarea></noscript>
          <textarea id="inp-markdown" class="textarea-md" hidden aria-hidden="true">${escapeHtml(contentVal)}</textarea>
        </div>
      </div>

      <!-- Coluna da Direita: dicas de escrita -->
      <aside class="editor-panel" aria-labelledby="tips-title">
        <h2 id="tips-title" style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:0.75rem;">💡 ${isEn ? 'Before you submit' : 'Antes de enviar'}</h2>
        <ul style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.9rem; color:var(--text-muted); padding-left:1.1rem;">
          <li>${isEn ? 'Use <strong>Heading</strong> and <strong>Subheading</strong> to split the text; it helps people (and Google) read it.' : 'Use <strong>Título</strong> e <strong>Subtítulo</strong> para dividir o texto; ajuda quem lê (e o Google).'}</li>
          <li>${isEn ? 'Link the source of every fact or number you cite.' : 'Coloque link para a fonte de cada fato ou número que citar.'}</li>
          <li>${isEn ? 'Code from GitHub: use the GitHub button in the toolbar.' : 'Código do GitHub: use o botão do GitHub na barra do editor.'}</li>
          <li>${isEn ? 'Your words only, no AI.' : 'Só palavras suas, sem IA.'} <a href="/hyperfokus/termos-e-regras${isEn ? '?lang=en' : ''}">${isEn ? 'Rules' : 'Regras'}</a></li>
          <li>${isEn ? 'Save often. Drafts stay private in your account until you submit them.' : 'Salve sempre. O rascunho fica só na sua conta até você enviar.'}</li>
        </ul>
      </aside>
    </div>
  </main>

  <script src="/js/pyxie-editor.js?v=3"></script>
  <script>
    let activeDraftId = '${draft ? draft.id : ''}';

    const inpTitle = document.getElementById('inp-title');
    const inpMarkdown = document.getElementById('inp-markdown');
    let editor = null;
    function currentMarkdown() {
      return editor ? editor.getMarkdown() : inpMarkdown.value;
    }
    window.PyxieEditor.mount(document.getElementById('pyx-editor'), {
      lang: '${isEn ? 'en' : 'pt'}',
      html: ${JSON.stringify(initialHtml).replace(/</g, '\\u003c')},
      label: '${isEn ? 'Your article' : 'Seu artigo'}',
      onGithub: () => document.getElementById('inp-github-url').focus(),
    }).then((ed) => { editor = ed; }).catch(() => {
      inpMarkdown.hidden = false;
      inpMarkdown.removeAttribute('aria-hidden');
    });

    // Importador de código do GitHub
    document.getElementById('btn-import-github').addEventListener('click', async () => {
      const url = document.getElementById('inp-github-url').value.trim();
      if (!url) return alert('${isEn ? 'Please paste a valid GitHub blob URL' : 'Cole uma URL válida do GitHub'}');

      const btn = document.getElementById('btn-import-github');
      btn.innerText = 'Importando...';

      try {
        const res = await fetch('/api/hyperfokus/github-snippet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (data.success && data.snippet) {
          if (editor) {
            editor.insertCode('// ' + data.snippet.originalUrl + '\\n' + data.snippet.snippetCode, data.snippet.language);
          } else {
            inpMarkdown.value += '\\n\\n' + data.snippet.markdownSnippet + '\\n\\n';
          }
          alert('${isEn ? 'Code snippet successfully imported!' : 'Trecho de código importado com sucesso!'}');
          document.getElementById('inp-github-url').value = '';
        } else {
          alert(data.error || 'Erro ao importar código do GitHub');
        }
      } catch (err) {
        alert('Erro ao conectar ao GitHub.');
      } finally {
        btn.innerText = '${isEn ? 'Import' : 'Importar'}';
      }
    });

    // Salvar Rascunho
    async function saveDraft() {
      const title = inpTitle.value.trim();
      const contentMarkdown = currentMarkdown();
      const categoryTags = document.getElementById('inp-tags').value.split(',').map(s => s.trim()).filter(Boolean);
      const coverImage = document.getElementById('inp-cover').value.trim();

      const btn = document.getElementById('btn-save-draft');
      btn.innerText = 'Salvando...';

      try {
        let res;
        if (activeDraftId) {
          res = await fetch('/api/hyperfokus/web-drafts/' + activeDraftId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, contentMarkdown, categoryTags, coverImage })
          });
        } else {
          res = await fetch('/api/hyperfokus/web-drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, contentMarkdown, categoryTags, coverImage })
          });
        }
        const data = await res.json();
        if (data.success && data.draft) {
          activeDraftId = data.draft.id;
          btn.innerText = '✓ Rascunho Salvo!';
          setTimeout(() => { btn.innerText = '💾 ${isEn ? 'Save Draft' : 'Salvar Rascunho'}'; }, 2000);
          return data.draft;
        } else {
          alert(data.error || 'Erro ao salvar rascunho.');
        }
      } catch (_) {
        alert('Erro ao salvar.');
      } finally {
        btn.innerText = '💾 ${isEn ? 'Save Draft' : 'Salvar Rascunho'}';
      }
    }

    document.getElementById('btn-save-draft').addEventListener('click', saveDraft);

    // Enviar para Moderação
    document.getElementById('btn-submit-review').addEventListener('click', async () => {
      const draft = await saveDraft();
      if (!draft || !activeDraftId) return;

      if (!confirm('${isEn ? 'Submit this article to the editorial moderation queue?' : 'Enviar este artigo para a fila de moderação editorial?'}')) {
        return;
      }

      const btn = document.getElementById('btn-submit-review');
      btn.innerText = 'Enviando...';

      try {
        const res = await fetch('/api/hyperfokus/web-drafts/' + activeDraftId + '/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          alert(data.message || 'Artigo enviado com sucesso!');
          window.location.href = '/meu-perfil';
        } else {
          alert(data.error || 'Erro ao submeter artigo.');
        }
      } catch (_) {
        alert('Erro de submissão.');
      } finally {
        btn.innerText = '🚀 ${isEn ? 'Submit for Review' : 'Enviar para Moderação'}';
      }
    });
  </script>
</body>
</html>`;
}


/**
 * Vitrine Pública de Projetos, Criadores e Serviços (/hyperfokus/projetos)
 * Fase 8: Suporte a bordas cosméticas (Neon Lilás, Cyber-Pink animada, Ouro Místico)
 * Respeita estritamente prefers-reduced-motion.
 */
function renderProjectsShowcasePage({ partners = [], activeCategory = 'all', lang = 'pt', user = null } = {}) {
  const isEn = lang === 'en';
  const sharedCss = getSharedStyles();

  const categories = [
    { id: 'all', label: { pt: 'Todos os Projetos', en: 'All Projects' } },
    { id: 'creator', label: { pt: 'Criadores de Conteúdo', en: 'Content Creators' } },
    { id: 'service', label: { pt: 'Lojas & Freelancers', en: 'Shops & Freelancers' } },
    { id: 'community', label: { pt: 'Comunidades & Fóruns', en: 'Communities & Forums' } },
    { id: 'ong', label: { pt: 'Causas Sociais & ONGs', en: 'Social Causes & NGOs' } },
  ];

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Projects & Creators Showcase • Pyxie Hyperfokus' : 'Vitrine de Projetos & Criadores • Pyxie Hyperfokus'}</title>
  <meta name="description" content="${isEn ? 'Discover authentic projects, indie creators, shops and communities supported by Pyxie.' : 'Conheça projetos autorais, criadores independentes, lojinhas e causas apoiadas pela Pyxie.'}">
  <link rel="canonical" href="https://pyxie.com.br/hyperfokus/projetos">
  <link rel="alternate" hreflang="pt-BR" href="https://pyxie.com.br/hyperfokus/projetos">
  <link rel="alternate" hreflang="en" href="https://pyxie.com.br/hyperfokus/projetos?lang=en">
  <link rel="icon" type="image/png" href="/assets/pyxie/sticker/sticker_smile.png">
  <style>
    ${sharedCss}
    @keyframes cyberPulse {
      0%, 100% { box-shadow: 0 0 12px rgba(230, 0, 103, 0.4); border-color: #E60067; }
      50% { box-shadow: 0 0 24px rgba(230, 0, 103, 0.8); border-color: #ff3388; }
    }
    .animated-border {
      animation: cyberPulse 2.8s infinite ease-in-out;
    }
    @media (prefers-reduced-motion: reduce) {
      .animated-border {
        animation: none !important;
      }
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .project-card {
      background: var(--card-bg);
      border-radius: 1.25rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .project-card:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  ${renderSiteHeader({ lang, user, path: '/hyperfokus/projetos', brandLabel: isEn ? 'Projects' : 'Projetos' })}

  <main class="main-container">
    <div style="margin-bottom: 2rem; text-align: left;">
      <h1 style="font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 900; color: #fff; margin-bottom: 0.5rem;">
        ${isEn ? 'Independent Creators, Shops & Projects' : 'Projetos, Criadores Independentes & Lojas'}
      </h1>
      <p style="font-size: 1rem; color: var(--text-muted); max-width: 720px;">
        ${isEn
          ? 'Showcase of authentic creators, artisans, communities and social causes partnering with the Pyxie ecosystem.'
          : 'Vitrine oficial de criadores, artistas, lojinhas e iniciativas parceiras da comunidade Pyxie & Cringelândia.'}
      </p>
    </div>

    <!-- Category Tabs Filter -->
    <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem;">
      ${categories.map((c) => `
        <a href="/hyperfokus/projetos${c.id !== 'all' ? '?category=' + c.id : ''}${isEn ? (c.id !== 'all' ? '&lang=en' : '?lang=en') : ''}"
           class="btn ${activeCategory === c.id ? 'btn-pink' : 'btn-outline'}" style="font-size:0.8rem;">
          ${isEn ? c.label.en : c.label.pt}
        </a>
      `).join('')}
    </div>

    <!-- Projects Grid -->
    <div class="projects-grid">
      ${(!partners || partners.length === 0) ? `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          ${isEn ? 'No projects found in this category.' : 'Nenhum projeto encontrado nesta categoria.'}
        </div>
      ` : partners.map((p) => {
        const borderStyle = p.badge?.borderStyle || 'border: 1px solid var(--card-border);';
        const animatedClass = p.badge?.tier >= 2 ? 'animated-border' : '';
        return `
          <div class="project-card ${animatedClass}" style="${borderStyle}">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.75rem;">
                <h3 style="font-size:1.2rem; font-weight:800; color:#fff;">${escapeHtml(p.projectName || p.name || 'Projeto')}</h3>
                ${p.badge?.label ? `
                  <span style="font-size:0.65rem; font-weight:800; padding:2px 8px; border-radius:999px; background:${p.badge.color}22; color:${p.badge.color}; border:1px solid ${p.badge.color}55; white-space:nowrap;">
                    ${isEn ? p.badge.label.en : p.badge.label.pt}
                  </span>
                ` : ''}
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6; margin-bottom:1rem;">
                ${escapeHtml(p.description || p.proposal || '')}
              </p>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:1rem; margin-top:0.5rem;">
              <span style="font-size:0.75rem; color:var(--text-muted);">
                🚀 ${p.bumpCount || 0} bumps
              </span>
              <a href="${p.accessLink || p.url || '#'}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-pink" style="font-size:0.75rem; padding:0.4rem 0.85rem;">
                ${isEn ? 'Visit Project →' : 'Conhecer Projeto →'}
              </a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </main>

  <footer class="site-footer">
    <p>Pyxie Hyperfokus • Vitrine Autoral & Parcerias</p>
  </footer>
</body>
</html>`;
}


/**
 * Página pública de autor (/hyperfokus/autor/:userId): quem é, quantos artigos e a lista deles.
 */
function renderAuthorPage({ author, articles = [], lang = 'pt', user = null } = {}) {
  const isEn = lang === 'en';
  const q = isEn ? '?lang=en' : '';
  const seo = buildAuthorSeo({ author, articleCount: author.articleCount, lang });
  const name = author.globalName || author.username;
  const avatar = author.cachedAvatarWebp || '/assets/pyxie/sticker/sticker_smile.png';
  const isSelf = Boolean(user && user.discordUserId && user.discordUserId === author.userId);

  const cardsHtml = articles.map((art) => {
    const cover = art.coverImage || `/api/hyperfokus/og/${art.id}`;
    const role = (art.authors || []).find((a) => a.userId === author.userId)?.role;
    return `
      <article class="card">
        <a href="/hyperfokus/${encodeURIComponent(art.slug)}${q}">
          <img src="${escapeHtml(cover)}" alt="${isEn ? 'Article cover' : 'Capa do artigo'}: ${escapeHtml(art.title)}" class="card-thumb" loading="lazy" />
        </a>
        <div class="card-body">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${(art.categoryTags || []).slice(0, 2).map((tg) => `<a href="/hyperfokus/categoria/${encodeURIComponent(tg)}${q}" class="tag-pill">#${escapeHtml(tg)}</a>`).join('')}
            ${role === 'COLLABORATOR' ? `<span class="tag-pill">${isEn ? 'co-author' : 'coautoria'}</span>` : ''}
          </div>
          <h2 class="card-title"><a href="/hyperfokus/${encodeURIComponent(art.slug)}${q}">${escapeHtml(art.title)}</a></h2>
          <div class="card-meta">
            <span>${formatDate(art.publishedAt || art.createdAt, lang)} • ⏳ ${art.readingTimeMinutes || 2} min</span>
            <span style="margin-left:auto;">❤️ ${Number(art.likesCount || 0)}</span>
          </div>
        </div>
      </article>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}">
  <link rel="canonical" href="${escapeHtml(seo.canonical)}">
  ${seo.hreflangs.map((h) => `<link rel="alternate" hreflang="${h.lang}" href="${escapeHtml(h.href)}">`).join('\n  ')}
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:title" content="${escapeHtml(seo.title)}">
  <meta property="og:description" content="${escapeHtml(seo.description)}">
  <meta property="og:url" content="${escapeHtml(seo.canonical)}">
  <meta property="og:image" content="${escapeHtml(seo.coverImage)}">
  <meta property="og:type" content="profile">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}</script>
  <style>${getSharedStyles()}</style>
</head>
<body>
  ${renderSiteHeader({ lang, user, path: `/hyperfokus/autor/${encodeURIComponent(author.userId)}` })}
  <main class="main-container">
    <section class="card" style="padding:1.75rem; margin-bottom:2rem; display:flex; flex-wrap:wrap; align-items:center; gap:1.25rem;">
      <img src="${escapeHtml(avatar)}" alt="${isEn ? 'Profile picture of' : 'Foto de perfil de'} ${escapeHtml(name)}" width="88" height="88" style="border-radius:50%; border:3px solid var(--accent-pink); object-fit:cover;" />
      <div style="flex:1; min-width:220px;">
        <h1 style="font-size:clamp(1.6rem, 4vw, 2.2rem); font-weight:900; color:#fff;">${escapeHtml(name)}</h1>
        ${author.globalName && author.globalName !== author.username ? `<p style="color:var(--text-muted);">@${escapeHtml(author.username)}</p>` : ''}
        <p style="color:var(--text-muted); margin-top:0.5rem;">
          📝 <strong style="color:#fff;">${author.articleCount}</strong> ${isEn ? (author.articleCount === 1 ? 'article' : 'articles') : (author.articleCount === 1 ? 'artigo publicado' : 'artigos publicados')}
          &nbsp;•&nbsp; ❤️ <strong style="color:#fff;">${author.likes}</strong> ${isEn ? 'likes received' : 'curtidas recebidas'}
        </p>
      </div>
      ${isSelf ? `<a href="/meu-perfil${q}" class="btn btn-outline">${isEn ? 'Manage my articles' : 'Gerenciar meus artigos'}</a>` : ''}
    </section>
    <h2 style="font-size:1.5rem; font-weight:900; color:#fff; margin-bottom:1rem;">${isEn ? `Articles by ${escapeHtml(name)}` : `Artigos de ${escapeHtml(name)}`}</h2>
    <div class="bento-grid">${cardsHtml}</div>
  </main>
  <footer class="site-footer">
    <div class="footer-links">
      <a href="/${q}">${isEn ? 'Pyxie home' : 'Início da Pyxie'}</a>
      <a href="/hyperfokus${q}">Blog Hyperfokus</a>
      <a href="/hyperfokus/como-participar${q}">${isEn ? 'How to publish' : 'Como publicar'}</a>
    </div>
  </footer>
</body>
</html>`;
}

module.exports = {
  renderAuthorPage,
  renderSiteHeader,
  renderHomePage,
  renderArticlePage,
  renderStaticInfoPage,
  renderLoginPage,
  renderRegisterPage,
  renderProfilePage,
  renderWebEditorPage,
  renderProjectsShowcasePage,
  formatDate,
};


