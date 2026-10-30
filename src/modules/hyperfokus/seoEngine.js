const articleStore = require('./articleStore');

const SITE_URL = 'https://pyxie.com.br';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extrai perguntas e respostas para o esquema Schema.org FAQPage.
 * Procura por <h2> ou <h3> que terminam com '?' e pega o parágrafo subsequente.
 */
function extractFaqFromHtml(html) {
  if (!html) return [];
  const faqList = [];
  const regex = /<h[23][^>]*>(.*?\?)<\/h[23]>\s*<p[^>]*>(.*?)<\/p>/gis;
  let match;
  while ((match = regex.exec(html)) !== null && faqList.length < 5) {
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    const answer = match[2].replace(/<[^>]+>/g, '').trim();
    if (question && answer) {
      faqList.push({ question, answer });
    }
  }
  return faqList;
}

/**
 * Gera Metadados e JSON-LD para Artigo do Blog.
 */
function buildArticleSeo({ article, lang = 'pt' }) {
  const isEn = lang === 'en';
  const slug = article.slug || article.id;
  const canonical = `${SITE_URL}/hyperfokus/${slug}`;
  const hreflangPt = canonical;
  const hreflangEn = `${canonical}?lang=en`;

  const title = article.seoTitle || `${article.title} • Pyxie Hyperfokus`;
  const description = article.metaDescription || (article.contentMarkdown || '').slice(0, 155).replace(/[#*`\n]/g, ' ').trim();
  const coverImage = article.coverImage || `${SITE_URL}/api/hyperfokus/og/${article.id}`;
  const publishedIso = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
  const updatedIso = article.updatedAt ? new Date(article.updatedAt).toISOString() : publishedIso;

  const authors = Array.isArray(article.authors) && article.authors.length > 0
    ? article.authors
    : [{ username: 'Comunidade Pyxie', userId: 'community' }];

  const authorSchema = authors.map((a) => ({
    '@type': 'Person',
    name: a.username,
    url: `${SITE_URL}/hyperfokus/autor/${a.userId}`,
    image: a.cachedAvatarWebp || `${SITE_URL}/assets/pyxie/sticker/sticker_smile.png`,
  }));

  // JSON-LD Schemas: BlogPosting + BreadcrumbList + Organization + FAQ (se aplicável)
  const jsonLdGraph = [
    {
      '@type': 'BlogPosting',
      '@id': `${canonical}#article`,
      isPartOf: {
        '@type': 'Blog',
        '@id': `${SITE_URL}/hyperfokus#blog`,
        name: 'Pyxie Hyperfokus',
        url: `${SITE_URL}/hyperfokus`,
      },
      headline: article.title,
      description,
      image: [coverImage],
      datePublished: publishedIso,
      dateModified: updatedIso,
      mainEntityOfPage: canonical,
      author: authorSchema.length === 1 ? authorSchema[0] : authorSchema,
      publisher: {
        '@type': 'Organization',
        name: 'Pyxie & Cringelândia',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/pyxie/sticker/sticker_smile.png`,
        },
      },
      inLanguage: isEn ? 'en-US' : 'pt-BR',
      keywords: (article.categoryTags || []).join(', '),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isEn ? 'Home' : 'Início',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Hyperfokus',
          item: `${SITE_URL}/hyperfokus`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: canonical,
        },
      ],
    },
  ];

  // Schema FAQPage se houver perguntas com '?' no texto
  const faqItems = extractFaqFromHtml(article.contentHtml);
  if (faqItems.length > 0) {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return {
    title,
    description,
    canonical,
    hreflangs: [
      { lang: 'pt-BR', href: hreflangPt },
      { lang: 'en', href: hreflangEn },
      { lang: 'x-default', href: hreflangPt },
    ],
    coverImage,
    publishedIso,
    updatedIso,
    authors,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': jsonLdGraph,
    },
  };
}

/**
 * Gera Metadados e JSON-LD para a Home do Blog (/hyperfokus).
 */
function buildHomeSeo({ lang = 'pt', tag = null } = {}) {
  const isEn = lang === 'en';
  const canonical = tag ? `${SITE_URL}/hyperfokus/categoria/${encodeURIComponent(tag)}` : `${SITE_URL}/hyperfokus`;
  const title = tag
    ? (isEn ? `Hyperfokus: #${tag} • Pyxie Portal` : `Hiperfocos sobre #${tag} • Blog da Pyxie`)
    : (isEn ? 'Pyxie Hyperfokus • Community Editorial Portal & Authentic Stories' : 'Pyxie Hyperfokus • Portal Editorial da Comunidade & Hiperfocos Autênticos');

  const description = isEn
    ? 'Authentic community-written articles, neurodivergent hyperfocus, and deep technical or artistic guides from the Cringelândia Discord sanctuary.'
    : 'Portal editorial de hiperfocos e artigos aprofundados escritos pela comunidade da Cringelândia e Pyxie. Conteúdo autêntico e 100% humano.';

  return {
    title,
    description,
    canonical,
    hreflangs: [
      { lang: 'pt-BR', href: canonical },
      { lang: 'en', href: `${canonical}?lang=en` },
      { lang: 'x-default', href: canonical },
    ],
    coverImage: `${SITE_URL}/assets/pyxie/sticker/sticker_smile.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonical,
      publisher: {
        '@type': 'Organization',
        name: 'Pyxie & Cringelândia',
        url: SITE_URL,
      },
    },
  };
}

/**
 * Auto-Internal Linker na hora da renderização (não altera o Markdown original do autor).
 * - Máximo 1 link por artigo-alvo.
 * - Máximo 5 links no total por artigo.
 * - Ignora blocos de código (<code>, <pre>), links já existentes (<a>), títulos (<h1>-<h6>) e blockquotes.
 * - Não vincula o artigo a ele mesmo.
 */
function buildAuthorSeo({ author, articleCount = 0, lang = 'pt' } = {}) {
  const isEn = lang === 'en';
  const canonical = `${SITE_URL}/hyperfokus/autor/${author.userId}`;
  const name = author.globalName || author.username;
  const title = isEn ? `${name} • Hyperfokus author` : `${name} • Autor(a) no Hyperfokus`;
  const description = isEn
    ? `${articleCount} article(s) written by ${name} for Pyxie Hyperfokus, the Cringelândia community blog.`
    : `${articleCount} artigo(s) escritos por ${name} no Pyxie Hyperfokus, o blog da comunidade Cringelândia.`;
  const image = author.cachedAvatarWebp
    ? `${SITE_URL}${author.cachedAvatarWebp.startsWith('/') ? '' : '/'}${author.cachedAvatarWebp}`
    : `${SITE_URL}/assets/pyxie/sticker/sticker_smile.png`;
  return {
    title,
    description,
    canonical,
    hreflangs: [
      { lang: 'pt-BR', href: canonical },
      { lang: 'en', href: `${canonical}?lang=en` },
      { lang: 'x-default', href: canonical },
    ],
    coverImage: image,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: canonical,
      name: title,
      mainEntity: { '@type': 'Person', name, alternateName: author.username, identifier: author.userId, image, url: canonical },
    },
  };
}

function applyInternalLinks(contentHtml, currentArticleId) {
  if (!contentHtml || typeof contentHtml !== 'string') return contentHtml;

  try {
    const { items: published } = articleStore.listArticles({ status: 'PUBLISHED', limit: 40 });
    const targets = (published || []).filter((a) => a.id !== currentArticleId && a.slug && a.title);

    if (targets.length === 0) return contentHtml;

    // Preserva áreas sensíveis usando tokens seguros
    const protectedBlocks = [];
    let processed = contentHtml.replace(/<(pre|code|a|h[1-6]|blockquote)\b[^>]*>.*?<\/\1>/gis, (match) => {
      const token = `@@@PROTECTED_BLOCK_${protectedBlocks.length}@@@`;
      protectedBlocks.push(match);
      return token;
    });

    let linksAdded = 0;
    const maxLinks = 5;

    for (const target of targets) {
      if (linksAdded >= maxLinks) break;
      const targetSlug = target.slug;
      const targetTitle = target.title.trim();

      // Padrão de busca: palavras-chave fortes do título (mínimo 5 letras para evitar falsos positivos)
      const keywords = targetTitle
        .split(/\s+/)
        .map((k) => k.replace(/[^a-zA-Z0-9áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]/g, ''))
        .filter((k) => k.length >= 6);

      const phraseCandidates = [targetTitle, ...keywords];

      for (const phrase of phraseCandidates) {
        if (linksAdded >= maxLinks) break;
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordRegex = new RegExp(`(?<![a-zA-Z0-9_])(${escaped})(?![a-zA-Z0-9_])`, 'i');

        if (wordRegex.test(processed)) {
          processed = processed.replace(wordRegex, (match) => {
            linksAdded++;
            return `<a href="/hyperfokus/${encodeURIComponent(targetSlug)}" class="internal-seo-link" title="Hiperfoco: ${escapeHtml(targetTitle)}">${match}</a>`;
          });
          break; // Máximo 1 link para este artigo-alvo
        }
      }
    }

    // Restaura blocos protegidos
    for (let i = 0; i < protectedBlocks.length; i++) {
      processed = processed.replace(`@@@PROTECTED_BLOCK_${i}@@@`, protectedBlocks[i]);
    }

    return processed;
  } catch (err) {
    console.warn('[Hyperfokus:SeoEngine] Erro no auto-internal linker:', err.message);
    return contentHtml;
  }
}

/**
 * Gera sitemap XML dedicado (/sitemap-hyperfokus.xml).
 */
function generateSitemapXml() {
  const { items: articles } = articleStore.listArticles({ status: 'PUBLISHED', limit: 500 });
  const nowIso = new Date().toISOString().slice(0, 10);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/hyperfokus</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${SITE_URL}/hyperfokus" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/hyperfokus?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/hyperfokus" />
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/hyperfokus/como-participar</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/hyperfokus/termos-e-regras</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

  for (const art of articles || []) {
    const loc = `${SITE_URL}/hyperfokus/${art.slug}`;
    const lastmod = art.updatedAt ? new Date(art.updatedAt).toISOString().slice(0, 10) : nowIso;
    const cover = art.coverImage ? `${SITE_URL}${art.coverImage.startsWith('/') ? '' : '/'}${art.coverImage}` : `${SITE_URL}/api/hyperfokus/og/${art.id}`;

    xml += `  <url>
    <loc>${escapeXml(loc)}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(loc)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(loc)}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(cover)}</image:loc>
      <image:title>${escapeXml(art.title)}</image:title>
    </image:image>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Gera RSS / Atom 2.0 com WebSub (/hyperfokus/rss.xml).
 */
function generateBlogRssXml(lang = 'pt') {
  const isEn = lang === 'en';
  const { items: articles } = articleStore.listArticles({ status: 'PUBLISHED', limit: 50 });
  const feedTitle = isEn ? 'Pyxie Hyperfokus • Community Blog' : 'Pyxie Hyperfokus • Portal de Hiperfocos';
  const feedDesc = isEn
    ? 'Authentic community-written articles, neurodivergent perspectives, and deep-dive technical explorations.'
    : 'Artigos autênticos escritos pela comunidade da Cringelândia e Pyxie. Hiperfocos reais sem inteligência artificial.';
  const feedUrl = `${SITE_URL}/hyperfokus/rss.xml${isEn ? '?lang=en' : ''}`;
  const siteUrl = `${SITE_URL}/hyperfokus${isEn ? '?lang=en' : ''}`;

  let itemsXml = '';
  for (const art of articles || []) {
    const link = `${SITE_URL}/hyperfokus/${art.slug}${isEn ? '?lang=en' : ''}`;
    const pubDate = new Date(art.publishedAt || art.createdAt || Date.now()).toUTCString();
    const authorName = art.authors && art.authors[0] ? art.authors[0].username : 'Comunidade Pyxie';
    const desc = art.metaDescription || (art.contentMarkdown || '').slice(0, 200).replace(/[#*`\n]/g, ' ').trim();
    const cover = art.coverImage ? `${SITE_URL}${art.coverImage.startsWith('/') ? '' : '/'}${art.coverImage}` : `${SITE_URL}/api/hyperfokus/og/${art.id}`;

    itemsXml += `
    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
      <description><![CDATA[${desc}]]></description>
      <content:encoded><![CDATA[
        <p><img src="${escapeXml(cover)}" alt="${escapeXml(art.title)}" /></p>
        <div>${art.contentHtml || desc}</div>
        <p><a href="${escapeXml(link)}">${isEn ? 'Read full article' : 'Ler artigo completo'}</a></p>
      ]]></content:encoded>
      <enclosure url="${escapeXml(cover)}" type="image/webp" length="50000" />
    </item>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(feedDesc)}</description>
    <language>${isEn ? 'en-US' : 'pt-BR'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />
    ${itemsXml}
  </channel>
</rss>`;
}

module.exports = {
  buildAuthorSeo,
  buildArticleSeo,
  buildHomeSeo,
  extractFaqFromHtml,
  applyInternalLinks,
  generateSitemapXml,
  generateBlogRssXml,
};

