const {
  TAROT_CATALOG,
  SUIT_CONFIG,
  getCardBySlug,
  getCardByEnglishSlug,
  localizeCard,
} = require('../data/tarotCardsCatalog');

/**
 * Páginas públicas de significado das 78 cartas (SEO de cauda longa: "significado carta o louco",
 * "the fool tarot meaning"). O HTML sai pronto do servidor: crawlers e pré-visualizações de link
 * (WhatsApp, Discord, Pinterest) leem tudo sem executar JavaScript.
 *
 * URLs (AGENTS.md §8): /tarot/carta/<slug-pt> é a canônica em PT e /tarot/carta/<slug-pt>?lang=en
 * a versão em inglês, cada uma com canonical autorreferencial e hreflang bidirecional.
 * /tarot/carta/<slug-en> redireciona (301) para a versão em inglês.
 */

const SITE = 'https://pyxie.com.br';
const HUB_PATH = '/tarot/cartas';
const CARD_PATH = '/tarot/carta';
const CARD_IMAGE_WIDTH = 600;
const CARD_IMAGE_HEIGHT = 1024;

const COPY = {
  pt: {
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    home: 'Início',
    tarot: 'Tarot',
    hub: 'As 78 cartas',
    cardTitle: '{name} no Tarot: significado em pé e invertido • Pyxie',
    cardH1: '{name}: significado da carta no Tarot',
    cardIntro: '{name} é {position}. Palavras-chave: {keywords}.',
    positionNumbered: 'a carta {num} {group}',
    positionCourt: 'uma carta {group}',
    groupMajor: 'dos Arcanos Maiores',
    groupMinor: 'do {suit}',
    imageAlt: 'Ilustração da carta {name} do Tarot da Pyxie',
    upright: 'Significado em pé',
    reversed: 'Significado invertido',
    keywords: 'Palavras-chave',
    ctaTitle: 'Tire esta carta no Discord',
    ctaBody: 'A Pyxie tira uma carta do dia para cada pessoa, guarda no seu álbum dos 78 arcanos e mostra a mensagem com arte ilustrada.',
    ctaInvite: 'Adicionar a Pyxie ao Discord',
    ctaOnline: 'Tirar uma carta online',
    prev: 'Carta anterior',
    next: 'Próxima carta',
    allCards: 'Ver as 78 cartas',
    switchLang: 'English',
    hubTitle: 'Significado das 78 cartas do Tarot • Oráculo da Pyxie',
    hubDescription: 'Significado de todas as 78 cartas do Tarot, em pé e invertidas: Arcanos Maiores e os naipes de Paus, Copas, Espadas e Ouros, com palavras-chave e conselhos.',
    hubH1: 'Significado das 78 cartas do Tarot',
    hubIntro: 'Escolha uma carta para ler o significado em pé, o significado invertido e as palavras-chave. Todas as cartas também podem ser tiradas no Discord com a Pyxie.',
    footer: 'Pyxie • A fada companheira do seu servidor no Discord',
    terms: 'Termos',
    privacy: 'Privacidade',
    wiki: 'Wiki',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    home: 'Home',
    tarot: 'Tarot',
    hub: 'All 78 cards',
    cardTitle: '{name} Tarot Card Meaning: Upright & Reversed • Pyxie',
    cardH1: '{name} tarot card meaning',
    cardIntro: '{name} is {position}. Keywords: {keywords}.',
    positionNumbered: 'card {num} {group}',
    positionCourt: 'a card {group}',
    groupMajor: 'of the Major Arcana',
    groupMinor: 'of the {suit}',
    imageAlt: 'Illustration of the {name} card from the Pyxie Tarot',
    upright: 'Upright meaning',
    reversed: 'Reversed meaning',
    keywords: 'Keywords',
    ctaTitle: 'Draw this card on Discord',
    ctaBody: 'Pyxie draws a daily card for each person, saves it to their 78-card album and shows the message with illustrated art.',
    ctaInvite: 'Add Pyxie to Discord',
    ctaOnline: 'Draw a card online',
    prev: 'Previous card',
    next: 'Next card',
    allCards: 'See all 78 cards',
    switchLang: 'Português',
    hubTitle: 'All 78 Tarot Card Meanings • Pyxie Oracle',
    hubDescription: 'Meanings of all 78 Tarot cards, upright and reversed: the Major Arcana and the suits of Wands, Cups, Swords and Pentacles, with keywords and advice.',
    hubH1: 'All 78 Tarot card meanings',
    hubIntro: 'Pick a card to read its upright meaning, reversed meaning and keywords. Every card can also be drawn on Discord with Pyxie.',
    footer: 'Pyxie • The companion fairy for your Discord server',
    terms: 'Terms',
    privacy: 'Privacy',
    wiki: 'Wiki',
  },
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;');
}

/** JSON-LD dentro de <script>: impede que "</script>" no conteúdo feche a tag. */
function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function fill(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

/** "O LOUCO" → "O Louco"; preposições ficam em minúsculas ("Ás de Paus"). */
function titleCase(name, lang) {
  const small = lang === 'en' ? new Set(['of', 'the']) : new Set(['de', 'da', 'do', 'das', 'dos']);
  return String(name)
    .toLowerCase()
    .split(' ')
    .map((word, index) => (index > 0 && small.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

function langQuery(lang) {
  return lang === 'en' ? '?lang=en' : '';
}

function cardUrl(card, lang = 'pt') {
  return `${SITE}${CARD_PATH}/${card.slug}${langQuery(lang)}`;
}

function hubUrl(lang = 'pt') {
  return `${SITE}${HUB_PATH}${langQuery(lang)}`;
}

/** PT usa a arte estática; EN usa a mesma arte renderizada com os textos em inglês. */
function cardImageUrl(card, lang = 'pt') {
  if (lang === 'en') return `${SITE}/api/tarot/card-image?id=${card.id}&lang=en`;
  return `${SITE}/assets/tarot/cards/${card.fileName.replace(/\.webp$/, '.jpg')}`;
}

function suitName(suit, lang) {
  const info = SUIT_CONFIG[suit];
  return lang === 'en' ? info.nameEn : info.namePt;
}

const STYLES = `
  :root { --bg: #07040d; --card: rgba(24, 14, 40, 0.92); --line: rgba(168, 85, 247, 0.28); --violet: #8b5cf6;
    --pink: #ec4899; --gold: #facc15; --text: #f8fafc; --muted: #cbd5e1; --dim: #94a3b8; }
  * { box-sizing: border-box; }
  body { margin: 0; background: radial-gradient(circle at 20% 0%, #1d0f33 0%, var(--bg) 55%); background-color: var(--bg);
    color: var(--text); font-family: 'Outfit', system-ui, sans-serif; line-height: 1.65; }
  a { color: #f0abfc; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 24px 16px 48px; }
  nav.crumbs { font-size: 0.9rem; color: var(--dim); display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  nav.crumbs a { color: var(--muted); text-decoration: none; }
  .top { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
  .lang { border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; text-decoration: none; color: var(--text); font-size: 0.9rem; }
  h1 { font-family: 'Cinzel', serif; font-size: clamp(1.6rem, 5vw, 2.4rem); line-height: 1.2; margin: 8px 0 12px; }
  h2 { font-family: 'Cinzel', serif; font-size: 1.25rem; margin: 0 0 8px; color: #e9d5ff; }
  .card-layout { display: grid; grid-template-columns: minmax(0, 300px) minmax(0, 1fr); gap: 28px; align-items: start; }
  .card-layout img { width: 100%; height: auto; border-radius: 18px; border: 1px solid var(--line); box-shadow: 0 18px 50px rgba(139, 92, 246, 0.25); }
  .panel { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 18px 20px; margin-bottom: 16px; }
  .intro { color: var(--muted); font-size: 1.05rem; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 0; list-style: none; }
  .chips li { background: rgba(139, 92, 246, 0.18); border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; font-size: 0.92rem; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
  .btn { display: inline-block; padding: 10px 18px; border-radius: 12px; font-weight: 700; text-decoration: none; color: #fff; }
  .btn-primary { background: linear-gradient(135deg, var(--violet), var(--pink)); }
  .btn-ghost { border: 1px solid var(--line); }
  .pager { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
  .pager a { text-decoration: none; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 14px; margin-bottom: 26px; }
  .grid a { text-decoration: none; color: var(--text); font-size: 0.88rem; text-align: center; display: block; }
  .grid img { width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); display: block; margin-bottom: 6px; }
  footer { margin-top: 36px; color: var(--dim); font-size: 0.88rem; display: flex; flex-wrap: wrap; gap: 14px; }
  footer a { color: var(--muted); }
  @media (max-width: 680px) { .card-layout { grid-template-columns: 1fr; } .card-layout img { max-width: 280px; margin: 0 auto; display: block; } }
`;

function renderHead({ lang, title, description, canonical, ptUrl, enUrl, image, imageAlt, imageWidth, imageHeight, schemas }) {
  const copy = COPY[lang];
  return `<!doctype html>
<html lang="${copy.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="pt-BR" href="${ptUrl}" />
  <link rel="alternate" hreflang="en" href="${enUrl}" />
  <link rel="alternate" hreflang="x-default" href="${ptUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Pyxie" />
  <meta property="og:locale" content="${copy.ogLocale}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="${imageWidth}" />
  <meta property="og:image:height" content="${imageHeight}" />
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="preconnect" href="https://cdn.discordapp.com" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
  ${schemas.map((schema) => `<script type="application/ld+json">${jsonLd(schema)}</script>`).join('\n  ')}
  <style>${STYLES}</style>
</head>`;
}

function renderFooter(lang) {
  const copy = COPY[lang];
  const q = langQuery(lang);
  return `<footer>
      <span>${escapeHtml(copy.footer)}</span>
      <a href="/${q}">${escapeHtml(copy.home)}</a>
      <a href="/wiki${q}">${escapeHtml(copy.wiki)}</a>
      <a href="/termos${q}">${escapeHtml(copy.terms)}</a>
      <a href="/privacidade${q}">${escapeHtml(copy.privacy)}</a>
    </footer>`;
}

function breadcrumbSchema(lang, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function renderCardPage(baseCard, lang = 'pt') {
  const copy = COPY[lang];
  const card = localizeCard(baseCard, lang);
  const name = titleCase(card.name, lang);
  const keywords = card.keywords.join(', ');
  const group = baseCard.suit === 'major'
    ? copy.groupMajor
    : fill(copy.groupMinor, { suit: suitName(baseCard.suit, lang) });
  const isNumbered = /^(0|[IVXL]+)$/.test(String(baseCard.num));
  const position = fill(isNumbered ? copy.positionNumbered : copy.positionCourt, { num: card.num, group });
  const intro = fill(copy.cardIntro, { name, position, keywords });
  const title = fill(copy.cardTitle, { name });
  const description = truncate(`${intro} ${card.upright}`, 158);
  const canonical = cardUrl(baseCard, lang);
  const image = cardImageUrl(baseCard, lang);
  const imageAlt = fill(copy.imageAlt, { name });
  const index = TAROT_CATALOG.indexOf(baseCard);
  const prev = TAROT_CATALOG[(index + TAROT_CATALOG.length - 1) % TAROT_CATALOG.length];
  const next = TAROT_CATALOG[(index + 1) % TAROT_CATALOG.length];
  const q = langQuery(lang);
  const otherLang = lang === 'en' ? 'pt' : 'en';

  const crumbs = [
    { name: copy.home, url: `${SITE}/${q}` },
    { name: copy.tarot, url: `${SITE}/tarot${q}` },
    { name: copy.hub, url: hubUrl(lang) },
    { name, url: canonical },
  ];

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: title,
      headline: fill(copy.cardH1, { name }),
      description,
      inLanguage: copy.htmlLang,
      url: canonical,
      image: { '@type': 'ImageObject', url: image, width: CARD_IMAGE_WIDTH, height: CARD_IMAGE_HEIGHT },
      keywords,
      about: { '@type': 'Thing', name: `${name} (${card.arcana})` },
      isPartOf: { '@type': 'WebSite', name: 'Pyxie', url: SITE },
      publisher: { '@type': 'Organization', name: 'Pyxie', url: SITE },
    },
    breadcrumbSchema(lang, crumbs),
  ];

  return `${renderHead({
    lang,
    title,
    description,
    canonical,
    ptUrl: cardUrl(baseCard, 'pt'),
    enUrl: cardUrl(baseCard, 'en'),
    image,
    imageAlt,
    imageWidth: CARD_IMAGE_WIDTH,
    imageHeight: CARD_IMAGE_HEIGHT,
    schemas,
  })}
<body>
  <main class="wrap">
    <div class="top">
      <nav class="crumbs" aria-label="breadcrumb">
        <a href="/${q}">${escapeHtml(copy.home)}</a> › <a href="/tarot${q}">${escapeHtml(copy.tarot)}</a> ›
        <a href="${HUB_PATH}${q}">${escapeHtml(copy.hub)}</a> › <span>${escapeHtml(name)}</span>
      </nav>
      <a class="lang" href="${CARD_PATH}/${baseCard.slug}${langQuery(otherLang)}" hreflang="${COPY[otherLang].htmlLang}">${escapeHtml(copy.switchLang)}</a>
    </div>
    <div class="card-layout">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}" width="${CARD_IMAGE_WIDTH}" height="${CARD_IMAGE_HEIGHT}" />
      <article>
        <h1>${escapeHtml(fill(copy.cardH1, { name }))}</h1>
        <p class="intro">${escapeHtml(intro)}</p>
        <section class="panel">
          <h2>${escapeHtml(copy.upright)}</h2>
          <p>${escapeHtml(card.upright)}</p>
        </section>
        <section class="panel">
          <h2>${escapeHtml(copy.reversed)}</h2>
          <p>${escapeHtml(card.reversed)}</p>
        </section>
        <section class="panel">
          <h2>${escapeHtml(copy.keywords)}</h2>
          <ul class="chips">${card.keywords.map((kw) => `<li>${escapeHtml(kw)}</li>`).join('')}</ul>
        </section>
        <section class="panel">
          <h2>${escapeHtml(copy.ctaTitle)}</h2>
          <p>${escapeHtml(copy.ctaBody)}</p>
          <div class="actions">
            <a class="btn btn-primary" href="/invite?ref=tarot-card" rel="nofollow">${escapeHtml(copy.ctaInvite)}</a>
            <a class="btn btn-ghost" href="/tarot${q}">${escapeHtml(copy.ctaOnline)}</a>
          </div>
        </section>
        <div class="pager">
          <a href="${CARD_PATH}/${prev.slug}${q}">← ${escapeHtml(copy.prev)}: ${escapeHtml(titleCase(localizeCard(prev, lang).name, lang))}</a>
          <a href="${HUB_PATH}${q}">${escapeHtml(copy.allCards)}</a>
          <a href="${CARD_PATH}/${next.slug}${q}">${escapeHtml(copy.next)}: ${escapeHtml(titleCase(localizeCard(next, lang).name, lang))} →</a>
        </div>
      </article>
    </div>
    ${renderFooter(lang)}
  </main>
</body>
</html>`;
}

function renderHubPage(lang = 'pt') {
  const copy = COPY[lang];
  const q = langQuery(lang);
  const otherLang = lang === 'en' ? 'pt' : 'en';
  const canonical = hubUrl(lang);
  const cover = cardImageUrl(TAROT_CATALOG[0]);

  const sections = Object.keys(SUIT_CONFIG).map((suit) => {
    const cards = TAROT_CATALOG.filter((card) => card.suit === suit);
    const items = cards.map((baseCard) => {
      const name = titleCase(localizeCard(baseCard, lang).name, lang);
      return `<a href="${CARD_PATH}/${baseCard.slug}${q}"><img src="${cardImageUrl(baseCard)}" alt="${escapeHtml(fill(copy.imageAlt, { name }))}" width="${CARD_IMAGE_WIDTH}" height="${CARD_IMAGE_HEIGHT}" loading="lazy" />${escapeHtml(name)}</a>`;
    }).join('\n        ');
    return `<section>
      <h2>${escapeHtml(suitName(suit, lang))}</h2>
      <div class="grid">
        ${items}
      </div>
    </section>`;
  }).join('\n    ');

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: copy.hubTitle,
      description: copy.hubDescription,
      inLanguage: copy.htmlLang,
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: 'Pyxie', url: SITE },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: TAROT_CATALOG.length,
        itemListElement: TAROT_CATALOG.map((card, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: titleCase(localizeCard(card, lang).name, lang),
          url: cardUrl(card, lang),
        })),
      },
    },
    breadcrumbSchema(lang, [
      { name: copy.home, url: `${SITE}/${q}` },
      { name: copy.tarot, url: `${SITE}/tarot${q}` },
      { name: copy.hub, url: canonical },
    ]),
  ];

  return `${renderHead({
    lang,
    title: copy.hubTitle,
    description: copy.hubDescription,
    canonical,
    ptUrl: hubUrl('pt'),
    enUrl: hubUrl('en'),
    image: cover,
    imageAlt: fill(copy.imageAlt, { name: titleCase(localizeCard(TAROT_CATALOG[0], lang).name, lang) }),
    imageWidth: CARD_IMAGE_WIDTH,
    imageHeight: CARD_IMAGE_HEIGHT,
    schemas,
  })}
<body>
  <main class="wrap">
    <div class="top">
      <nav class="crumbs" aria-label="breadcrumb">
        <a href="/${q}">${escapeHtml(copy.home)}</a> › <a href="/tarot${q}">${escapeHtml(copy.tarot)}</a> › <span>${escapeHtml(copy.hub)}</span>
      </nav>
      <a class="lang" href="${HUB_PATH}${langQuery(otherLang)}" hreflang="${COPY[otherLang].htmlLang}">${escapeHtml(copy.switchLang)}</a>
    </div>
    <h1>${escapeHtml(copy.hubH1)}</h1>
    <p class="intro">${escapeHtml(copy.hubIntro)}</p>
    <div class="actions" style="margin-bottom: 26px;">
      <a class="btn btn-primary" href="/invite?ref=tarot-hub" rel="nofollow">${escapeHtml(copy.ctaInvite)}</a>
      <a class="btn btn-ghost" href="/tarot${q}">${escapeHtml(copy.ctaOnline)}</a>
    </div>
    ${sections}
    ${renderFooter(lang)}
  </main>
</body>
</html>`;
}

/** Todas as URLs públicas das páginas de cartas (índice + 78), nas duas línguas. */
function getAllTarotPageUrls() {
  const urls = [hubUrl('pt'), hubUrl('en')];
  for (const card of TAROT_CATALOG) {
    urls.push(cardUrl(card, 'pt'), cardUrl(card, 'en'));
  }
  return urls;
}

/** Bloco <url> do sitemap para o índice e as 78 cartas, com hreflang bidirecional. */
function buildSitemapEntries(lastmod) {
  const entry = (loc, page, lang) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${page.pt}" />
    <xhtml:link rel="alternate" hreflang="en" href="${page.en}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${page.pt}" />
    <image:image>
      <image:loc>${escapeXml(cardImageUrl(page.card, lang))}</image:loc>
    </image:image>
  </url>`;
  const pages = [
    { pt: hubUrl('pt'), en: hubUrl('en'), priority: '0.85', card: TAROT_CATALOG[0] },
    ...TAROT_CATALOG.map((card) => ({ pt: cardUrl(card, 'pt'), en: cardUrl(card, 'en'), priority: '0.7', card })),
  ];
  return pages.flatMap((page) => [entry(page.pt, page, 'pt'), entry(page.en, page, 'en')]).join('\n');
}

/** Resolve a URL pedida: carta em PT, redirecionamento do slug em inglês ou nada. */
function resolveCardRequest(slug) {
  const card = getCardBySlug(slug);
  if (card) return { card };
  const english = getCardByEnglishSlug(slug);
  if (english) return { redirect: `${CARD_PATH}/${english.slug}?lang=en` };
  return {};
}

module.exports = {
  HUB_PATH,
  CARD_PATH,
  cardUrl,
  hubUrl,
  renderCardPage,
  renderHubPage,
  resolveCardRequest,
  getAllTarotPageUrls,
  buildSitemapEntries,
  titleCase,
};
