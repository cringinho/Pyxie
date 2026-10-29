const { buildArticleSeo, buildHomeSeo, applyInternalLinks } = require('./seoEngine');
const { getContextualProducts } = require('./shopeeContext');

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

    .header-inner {
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
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
function renderHomePage({ articles = [], total = 0, page = 1, totalPages = 1, activeTab = 'recent', activeTag = null, lang = 'pt' } = {}) {
  const isEn = lang === 'en';
  const seo = buildHomeSeo({ lang, tag: activeTag });
  const featured = articles[0] || null;
  const list = featured ? articles.slice(1) : [];

  const shopeeProducts = getContextualProducts(activeTag ? [activeTag] : ['tecnologia', 'autismo'], 4);

  const tags = ['autismo', 'programacao', 'games', 'tecnologia', 'setup', 'livros', 'botanica'];

  const tagPillsHtml = tags.map((t) => {
    const isActive = activeTag === t;
    const url = isActive ? `/hyperfokus${isEn ? '?lang=en' : ''}` : `/hyperfokus?tag=${t}${isEn ? '&lang=en' : ''}`;
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
  <header class="site-header">
    <div class="header-inner">
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">Hyperfokus</span></span>
        <span class="brand-tag">${isEn ? 'Portal' : 'Blog'}</span>
      </a>
      <div class="nav-actions">
        <a href="${isEn ? '/hyperfokus' : '/hyperfokus?lang=en'}" class="btn btn-outline" style="font-size:0.75rem;">
          🌐 ${isEn ? 'Português' : 'English'}
        </a>
        <a href="/hyperfokus/como-participar${isEn ? '?lang=en' : ''}" class="btn btn-pink">
          ✨ ${isEn ? 'How to Publish' : 'Como Publicar'}
        </a>
      </div>
    </div>
  </header>

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
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
            <a href="/hyperfokus/${encodeURIComponent(featured.slug)}${isEn ? '?lang=en' : ''}">
              <img src="${escapeHtml(featured.coverImage || `/api/hyperfokus/og/${featured.id}`)}" alt="Capa destaque: ${escapeHtml(featured.title)}" style="width: 100%; height: 100%; min-height: 280px; max-height: 420px; object-fit: cover;" />
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
  <header class="site-header">
    <div class="header-inner">
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">Hyperfokus</span></span>
      </a>
      <div class="nav-actions">
        <a href="${isEn ? `/hyperfokus/${article.slug}` : `/hyperfokus/${article.slug}?lang=en`}" class="btn btn-outline" style="font-size:0.75rem;">
          🌐 ${isEn ? 'Português' : 'English'}
        </a>
      </div>
    </div>
  </header>

  <!-- Barra de Leitura Acessível (Kindle style) -->
  <nav class="reader-toolbar" aria-label="Ferramentas de Leitura Acessível">
    <div class="reader-controls">
      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">TAMANHO:</span>
      <button class="reader-btn" onclick="setReaderSize(-1)" title="Diminuir texto">A−</button>
      <button class="reader-btn" onclick="setReaderSize(1)" title="Aumentar texto">A+</button>

      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">LARGURA:</span>
      <button class="reader-btn" onclick="setReaderWidth('compact')">Estreito</button>
      <button class="reader-btn" onclick="setReaderWidth('normal')">Padrão</button>
      <button class="reader-btn" onclick="setReaderWidth('wide')">Largo</button>

      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">ESPAÇAMENTO:</span>
      <button class="reader-btn" onclick="setReaderLineHeight('1.4')">1.4</button>
      <button class="reader-btn" onclick="setReaderLineHeight('1.75')">1.75</button>
      <button class="reader-btn" onclick="setReaderLineHeight('2.0')">2.0</button>
    </div>

    <div class="reader-controls">
      <button class="reader-btn" onclick="toggleReaderDyslexic()" title="Fonte de alta legibilidade">Dislexia</button>
      <button class="reader-btn" onclick="setReaderTheme('dark')">Escuro</button>
      <button class="reader-btn" onclick="setReaderTheme('sepia')">Sépia</button>
      <button class="reader-btn" onclick="setReaderTheme('contrast')">Contraste</button>
    </div>
  </nav>

  <!-- Container do Artigo -->
  <main class="article-wrap">
    <!-- Categoria Tags -->
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
      ${(article.categoryTags || []).map((t) => `<a href="/hyperfokus?tag=${t}${isEn ? '&lang=en' : ''}" class="tag-pill">#${escapeHtml(t)}</a>`).join('')}
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
        <form id="comment-form" onsubmit="submitComment(event, '${article.id}')" style="display: flex; flex-direction: column; gap: 0.75rem;">
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
        <p style="color:var(--text-muted); font-size:0.875rem;">Carregando comentários...</p>
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

  <footer class="site-footer">
    <p>Pyxie Hyperfokus • Santuário de Mentes Livres</p>
  </footer>

  ${getReaderScript()}

  <!-- Client Script para Like e Comentários -->
  <script>
    async function toggleLike(articleId) {
      try {
        const res = await fetch('/api/hyperfokus/articles/' + articleId + '/like', { method: 'POST' });
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
          container.innerHTML = '<p style="color:var(--text-muted); font-size:0.875rem;">Seja o primeiro a comentar!</p>';
          return;
        }
        container.innerHTML = data.comments.map(c => \`
          <div style="background:var(--card-bg); border:1px solid var(--card-border); border-radius:0.75rem; padding:1rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
              <img src="\${c.cachedAvatarWebp || '/assets/pyxie/sticker/sticker_smile.png'}" alt="Foto de perfil de \${c.username}" class="author-avatar" />
              <strong style="font-size:0.875rem; color:#fff;">\${c.username}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted); margin-left:auto;">\${new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <p style="font-size:0.875rem; color:var(--text-main);">\${c.content}</p>
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
  </script>
</body>
</html>`;
}

/**
 * Renderiza Páginas Estáticas Institucionais (/como-participar e /termos-e-regras).
 */
function renderStaticInfoPage({ pageKey = 'como-participar', lang = 'pt' } = {}) {
  const isEn = lang === 'en';
  const isRules = pageKey === 'termos-e-regras';

  const title = isRules
    ? (isEn ? 'Community Rules & Terms • Pyxie Hyperfokus' : 'Termos & Regras da Comunidade • Pyxie Hyperfokus')
    : (isEn ? 'How to Participate & Publish • Pyxie Hyperfokus' : 'Como Participar & Publicar • Pyxie Hyperfokus');

  const contentHtml = isRules ? `
    <h2>1. Compromisso com Conteúdo 100% Humano (Anti-IA)</h2>
    <p>O Hyperfokus é um santuário para mentes neurodivergentes e entusiastas compartilharem experiências reais. Conteúdos gerados automaticamente por modelos de linguagem (IA) são estritamente rejeitados na moderação editorial.</p>
    
    <h2>2. Segurança Psicológica e Temas Sensíveis</h2>
    <p>Artigos sobre saúde mental, autismo, luto ou crises sensoriais devem manter tom responsável e respeitoso. Não glorificamos automutilação ou sofrimento; o espaço é de acolhimento.</p>

    <h2>3. Direitos Autorais e Licenciamento</h2>
    <p>Você é o autor do seu texto. Ao publicar no Pyxie Hyperfokus, você concede licença de exibição e divulgação não exclusiva na web, RSS e redes sociais da Pyxie, preservando permanentemente os seus créditos.</p>
  ` : `
    <h2>1. Inicie seu Rascunho no Discord</h2>
    <p>Acesse o canal de fórum <code>#hiperfocos</code> no servidor oficial da <strong>Cringelândia</strong> e crie uma nova postagem. O título do seu tópico será o título provisório do artigo.</p>

    <h2>2. Escreva com Tranquilidade (Trava de Rascunho)</h2>
    <p>Enquanto você escreve, o <strong>Thread Guard</strong> da Pyxie protege seu tópico contra intromissões: apenas você e os coautores que você adicionar podem enviar mensagens.</p>

    <h2>3. Adicione Coautores</h2>
    <p>Quer escrever em conjunto com um amigo do servidor? Use o comando <code>/py-add @usuario</code> para convidá-lo como colaborador.</p>

    <h2>4. Conclua e Envie para a Fila</h2>
    <p>Quando o relato estiver completo, use <code>/py-concluir</code> ou clique no botão verde <em>"Concluir e postar"</em> na mensagem fixada. O artigo seguirá imediatamente para a revisão editorial do painel!</p>
  `;

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${getSharedStyles()}</style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="brand">
        <img src="/assets/pyxie/sticker/sticker_smile.png" alt="Pyxie Mascot" width="34" height="34" />
        <span>Pyxie <span style="color:var(--accent-pink);">Hyperfokus</span></span>
      </a>
      <a href="/hyperfokus${isEn ? '?lang=en' : ''}" class="btn btn-outline">← ${isEn ? 'Back to Blog' : 'Voltar ao Blog'}</a>
    </div>
  </header>

  <main class="article-wrap">
    <h1 class="article-title">${escapeHtml(title)}</h1>
    <div class="article-content">
      ${contentHtml}
    </div>
  </main>

  <footer class="site-footer">
    <p>Pyxie Hyperfokus • Santuário de Mentes Livres</p>
  </footer>
</body>
</html>`;
}

module.exports = {
  renderHomePage,
  renderArticlePage,
  renderStaticInfoPage,
  formatDate,
};
