// Página da Pyxie Devs (/devs em inglês, /devs/es, /devs/pt), renderizada no servidor.
// É um projeto à parte da Cringelândia: aqui não entra nenhuma referência às comunidades brasileiras.
const SITE_ORIGIN = 'https://pyxie.com.br';

const LANGS = {
  en: { path: '/devs', htmlLang: 'en', hreflang: 'en', locale: 'en_US', label: 'EN', name: 'English' },
  es: { path: '/devs/es', htmlLang: 'es', hreflang: 'es', locale: 'es_ES', label: 'ES', name: 'Español' },
  pt: { path: '/devs/pt', htmlLang: 'pt-BR', hreflang: 'pt-BR', locale: 'pt_BR', label: 'PT', name: 'Português' },
};
const DEFAULT_LANG = 'en';

const COPY = {
  en: {
    title: 'Pyxie Devs • Indie Roblox game development group',
    description: 'Pyxie Devs is an indie Roblox development group. We build original games, share what we learn and playtest everything with our community on Discord.',
    skip: 'Skip to content',
    navLabel: 'Main',
    navWhat: 'What we do',
    navGames: 'Games',
    navJoin: 'Join',
    langLabel: 'Language',
    eyebrow: '▶ Roblox game studio',
    h1: 'We build Roblox games, <em>together</em>.',
    lead: 'Pyxie Devs is an indie Roblox development group. We make our own games, share what we learn along the way and playtest everything with our community on Discord.',
    roblox: 'Roblox group',
    discord: 'Join our Discord',
    soon: 'soon',
    bubble: 'I\'m the mascot, not the QA team. …Fine. I\'ll test it. Just this once.',
    heroAlt: 'Pyxie, the Pyxie Devs mascot: a fairy in a black bear-ear beanie, a jacket and a purple skirt, winking and holding a wand',
    logoAlt: 'Pyxie Devs logo: Pyxie as a purple cat-bat-fairy with fairy wings, in pixel art',
    whatTitle: 'What we do',
    whatLead: 'Small team, big ideas, and a lot of playtesting.',
    cards: [
      ['play', 'Original games', 'Our own Roblox experiences, from the first sketch to release day.'],
      ['code', 'Systems in Luau', 'Server-side code built to be fair, fast and hard to exploit.'],
      ['cube', 'Worlds & interfaces', 'Maps, models, effects and UI that feel good on phone and PC.'],
      ['flask', 'Open playtests', 'New builds land on our Discord first. Players help shape every update.'],
    ],
    gamesTitle: 'Our games',
    gamesStatus: 'Loading first game',
    gamesText: 'Our first game is in the works. Join the Roblox group to be among the first to play it and to get playtest invites.',
    joinTitle: 'Join the crew',
    joinText: 'Scripters, builders, artists, animators and players who love to break things (on purpose). If you want to make games, there is room for you.',
    mascotTitle: 'Meet Pyxie',
    mascotText: 'Pyxie is our official mascot. She lives on our Discord, shows up in our games and pretends she isn\'t excited about every new update.',
    stickers: ['Pyxie smiling', 'Pyxie laughing', 'Pyxie annoyed', 'Pyxie celebrating a victory'],
    footer: 'Pyxie Devs is an independent group and is not affiliated with Roblox Corporation.',
  },
  es: {
    title: 'Pyxie Devs • Grupo indie de desarrollo de juegos en Roblox',
    description: 'Pyxie Devs es un grupo indie de desarrollo en Roblox. Creamos juegos originales, compartimos lo que aprendemos y probamos todo con nuestra comunidad en Discord.',
    skip: 'Saltar al contenido',
    navLabel: 'Principal',
    navWhat: 'Qué hacemos',
    navGames: 'Juegos',
    navJoin: 'Únete',
    langLabel: 'Idioma',
    eyebrow: '▶ Estudio de juegos en Roblox',
    h1: 'Hacemos juegos en Roblox, <em>juntos</em>.',
    lead: 'Pyxie Devs es un grupo indie de desarrollo en Roblox. Creamos nuestros propios juegos, compartimos lo que aprendemos en el camino y probamos todo con nuestra comunidad en Discord.',
    roblox: 'Grupo en Roblox',
    discord: 'Entra a nuestro Discord',
    soon: 'pronto',
    bubble: 'Soy la mascota, no el equipo de QA. …Bueno. Lo pruebo yo. Solo esta vez.',
    heroAlt: 'Pyxie, la mascota de Pyxie Devs: un hada con gorro negro de orejitas de oso, chaqueta y falda morada, guiñando un ojo y con una varita',
    logoAlt: 'Logo de Pyxie Devs: Pyxie como una gata-murciélago-hada morada con alas de hada, en pixel art',
    whatTitle: 'Qué hacemos',
    whatLead: 'Equipo pequeño, ideas grandes y muchas pruebas.',
    cards: [
      ['play', 'Juegos originales', 'Nuestras propias experiencias en Roblox, del primer boceto al día del lanzamiento.'],
      ['code', 'Sistemas en Luau', 'Código del lado del servidor pensado para ser justo, rápido y difícil de explotar.'],
      ['cube', 'Mundos e interfaces', 'Mapas, modelos, efectos e interfaces que se sienten bien en móvil y PC.'],
      ['flask', 'Pruebas abiertas', 'Las versiones nuevas llegan primero a nuestro Discord. Los jugadores ayudan a dar forma a cada actualización.'],
    ],
    gamesTitle: 'Nuestros juegos',
    gamesStatus: 'Cargando el primer juego',
    gamesText: 'Nuestro primer juego está en desarrollo. Únete al grupo de Roblox para estar entre los primeros en jugarlo y recibir invitaciones a las pruebas.',
    joinTitle: 'Únete al equipo',
    joinText: 'Scripters, builders, artistas, animadores y jugadores a los que les encanta romper cosas (a propósito). Si quieres hacer juegos, aquí hay lugar para ti.',
    mascotTitle: 'Conoce a Pyxie',
    mascotText: 'Pyxie es nuestra mascota oficial. Vive en nuestro Discord, aparece en nuestros juegos y finge que no le emociona cada actualización nueva.',
    stickers: ['Pyxie sonriendo', 'Pyxie riendo', 'Pyxie enojada', 'Pyxie celebrando una victoria'],
    footer: 'Pyxie Devs es un grupo independiente y no está afiliado a Roblox Corporation.',
  },
  pt: {
    title: 'Pyxie Devs • Grupo indie de desenvolvimento de jogos no Roblox',
    description: 'A Pyxie Devs é um grupo indie de desenvolvimento no Roblox. Criamos jogos autorais, dividimos o que aprendemos e testamos tudo com a nossa comunidade no Discord.',
    skip: 'Pular para o conteúdo',
    navLabel: 'Principal',
    navWhat: 'O que fazemos',
    navGames: 'Jogos',
    navJoin: 'Participar',
    langLabel: 'Idioma',
    eyebrow: '▶ Estúdio de jogos no Roblox',
    h1: 'Fazemos jogos no Roblox, <em>juntos</em>.',
    lead: 'A Pyxie Devs é um grupo indie de desenvolvimento no Roblox. Criamos nossos próprios jogos, dividimos o que aprendemos no caminho e testamos tudo com a nossa comunidade no Discord.',
    roblox: 'Grupo no Roblox',
    discord: 'Entrar no nosso Discord',
    soon: 'em breve',
    bubble: 'Eu sou a mascote, não a equipe de testes. …Tá bom. Eu testo. Só dessa vez.',
    heroAlt: 'Pyxie, a mascote da Pyxie Devs: uma fada de gorro preto com orelhinhas de urso, jaqueta e saia roxa, piscando e segurando uma varinha',
    logoAlt: 'Logo da Pyxie Devs: a Pyxie como gata-morcego-fada roxa com asas de fada, em pixel art',
    whatTitle: 'O que fazemos',
    whatLead: 'Equipe pequena, ideias grandes e muito teste.',
    cards: [
      ['play', 'Jogos autorais', 'Nossas próprias experiências no Roblox, do primeiro rascunho ao dia do lançamento.'],
      ['code', 'Sistemas em Luau', 'Código no servidor feito para ser justo, rápido e difícil de explorar.'],
      ['cube', 'Mundos e interfaces', 'Mapas, modelos, efeitos e interfaces que funcionam bem no celular e no PC.'],
      ['flask', 'Testes abertos', 'Versões novas chegam primeiro no nosso Discord. Quem joga ajuda a moldar cada atualização.'],
    ],
    gamesTitle: 'Nossos jogos',
    gamesStatus: 'Carregando o primeiro jogo',
    gamesText: 'Nosso primeiro jogo está em produção. Entre no grupo do Roblox para estar entre os primeiros a jogar e receber os convites dos testes.',
    joinTitle: 'Faça parte da equipe',
    joinText: 'Scripters, builders, artistas, animadores e jogadores que adoram quebrar coisas (de propósito). Se você quer fazer jogos, tem lugar para você.',
    mascotTitle: 'Conheça a Pyxie',
    mascotText: 'A Pyxie é a nossa mascote oficial. Ela mora no nosso Discord, aparece nos nossos jogos e finge que não fica animada com cada atualização nova.',
    stickers: ['Pyxie sorrindo', 'Pyxie rindo', 'Pyxie emburrada', 'Pyxie comemorando uma vitória'],
    footer: 'A Pyxie Devs é um grupo independente e não tem vínculo com a Roblox Corporation.',
  },
};

// Ícones em pixel art (8x8), desenhados como retângulos.
const ICONS = {
  play: ['........', '.11.....', '.1111...', '.111111.', '.111111.', '.1111...', '.11.....', '........'],
  code: ['........', '..1..1..', '.1....1.', '1..11..1', '1..11..1', '.1....1.', '..1..1..', '........'],
  cube: ['...11...', '.111111.', '11.11.11', '1..11..1', '1..11..1', '1..11..1', '.111111.', '...11...'],
  flask: ['..1111..', '...11...', '...11...', '..1..1..', '.1....1.', '1.1111.1', '1111111.', '.111111.'],
};

function pixelIcon(name) {
  const rows = ICONS[name] || [];
  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === '1') rects.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    });
  });
  return `<svg viewBox="0 0 8 8" width="32" height="32" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true" focusable="false">${rects.join('')}</svg>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Idioma a partir do caminho: /devs/es, /devs/pt ou o padrão (inglês). */
function langFromPath(pathname) {
  const m = String(pathname || '').toLowerCase().match(/^\/devs\/(es|pt)\/?$/);
  return m ? m[1] : DEFAULT_LANG;
}

function urlFor(lang) {
  return `${SITE_ORIGIN}${LANGS[lang].path}`;
}

/**
 * links: { discord: url|null, roblox: url|null } (só para saber se o botão existe;
 * o link em si passa por /devs/discord e /devs/roblox).
 */
function renderDevsPage({ lang = DEFAULT_LANG, links = {} } = {}) {
  const L = LANGS[lang] ? lang : DEFAULT_LANG;
  const c = COPY[L];
  const meta = LANGS[L];
  const canonical = urlFor(L);
  const from = L === DEFAULT_LANG ? '' : `?from=${L}`;

  const button = (key, cls, label) => {
    if (links[key]) {
      return `<a class="btn ${cls}" href="/devs/${key}${from}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
    }
    return `<a class="btn ${cls}" aria-disabled="true" role="link">${escapeHtml(label)} <span class="soon">${escapeHtml(c.soon)}</span></a>`;
  };
  const ctas = `${button('roblox', 'btn--violet', c.roblox)}\n          ${button('discord', 'btn--ghost', c.discord)}`;

  const alternates = Object.entries(LANGS)
    .map(([, v]) => `<link rel="alternate" hreflang="${v.hreflang}" href="${SITE_ORIGIN}${v.path}" />`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LANG)}" />`)
    .join('\n  ');
  const ogAlternates = Object.entries(LANGS)
    .filter(([k]) => k !== L)
    .map(([, v]) => `<meta property="og:locale:alternate" content="${v.locale}" />`)
    .join('\n  ');
  const langSwitch = Object.entries(LANGS)
    .map(([k, v]) => `<a href="${v.path}" hreflang="${v.hreflang}" lang="${v.htmlLang}" title="${v.name}" aria-current="${k === L}">${v.label}</a>`)
    .join('');

  const cards = c.cards
    .map(([icon, title, text]) => `
        <article class="pcard reveal">
          <span class="pcard-icon">${pixelIcon(icon)}</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(text)}</p>
        </article>`)
    .join('');

  const stickerFiles = ['smile', 'happy', 'angry', 'win_victory'];
  const stickers = stickerFiles
    .map((f, i) => `<img src="/assets/brand/stickers/${f}.webp" width="320" height="320" alt="${escapeHtml(c.stickers[i])}" loading="lazy" />`)
    .join('\n          ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/devs#org`,
    name: 'Pyxie Devs',
    url: urlFor(DEFAULT_LANG),
    logo: `${SITE_ORIGIN}/assets/brand/pyxie-devs-logo.png?v=2`,
    description: c.description,
    knowsAbout: ['Roblox', 'Luau', 'Game development'],
  };

  return `<!DOCTYPE html>
<html lang="${meta.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>${escapeHtml(c.title)}</title>
  <meta name="description" content="${escapeHtml(c.description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#0d0716" />
  <link rel="canonical" href="${canonical}" />
  ${alternates}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(c.title)}" />
  <meta property="og:description" content="${escapeHtml(c.description)}" />
  <meta property="og:image" content="${SITE_ORIGIN}/assets/brand/og-devs.png?v=2" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(c.logoAlt)}" />
  <meta property="og:site_name" content="Pyxie Devs" />
  <meta property="og:locale" content="${meta.locale}" />
  ${ogAlternates}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(c.title)}" />
  <meta name="twitter:description" content="${escapeHtml(c.description)}" />
  <meta name="twitter:image" content="${SITE_ORIGIN}/assets/brand/og-devs.png?v=2" />
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  <link rel="icon" type="image/png" href="/assets/brand/pyxie-devs-icon.png?v=2" />
  <link rel="preload" as="image" href="/assets/brand/pyxie-hero.webp" type="image/webp" />
  <link rel="stylesheet" href="/css/fonts.css" />
  <link rel="stylesheet" href="/css/site.css?v=1" />
  <style>
    .devs-brand img { width: auto; height: 34px; image-rendering: pixelated; }
    .hero { display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: center; gap: 2rem; padding: clamp(2.5rem, 7vw, 5rem) 0 2rem; }
    .hero h1 { font-size: clamp(2.4rem, 6.2vw, 4.4rem); font-weight: 900; margin: 1rem 0 1.25rem; }
    .hero h1 em { font-style: normal; color: var(--violet-soft); text-shadow: 4px 4px 0 #2a1650; }
    .hero .lead { color: var(--muted); font-size: clamp(1.05rem, 1.6vw, 1.2rem); max-width: 56ch; }
    .hero-logo { width: min(380px, 100%); image-rendering: pixelated; margin-bottom: .5rem; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.75rem; }
    @media (max-width: 860px) {
      .hero { grid-template-columns: 1fr; text-align: center; }
      .hero .lead, .hero-logo { margin-inline: auto; }
      .hero-actions { justify-content: center; }
      .mascot { width: min(260px, 66vw); grid-row: 1; }
    }
    .section { padding-top: clamp(3rem, 7vw, 5rem); }
    .section h2 { font-size: clamp(1.7rem, 3.4vw, 2.4rem); font-weight: 800; }
    .section .sub { color: var(--muted); margin-top: .5rem; }
    .pgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1.75rem; }
    @media (max-width: 980px) { .pgrid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 540px) { .pgrid { grid-template-columns: 1fr; } }
    .pcard { background: #160d29; border: 2px solid #2d1d4f; padding: 1.4rem; box-shadow: 6px 6px 0 #05020a; border-radius: 4px; }
    .pcard h3 { font-size: 1.15rem; font-weight: 800; margin: .9rem 0 .4rem; }
    .pcard p { color: var(--muted); font-size: .95rem; }
    .pcard-icon { display: inline-grid; place-items: center; width: 52px; height: 52px; background: #241544; color: var(--violet-soft); border-radius: 4px; }
    .games { display: grid; grid-template-columns: auto 1fr; gap: 1.5rem; align-items: center; margin-top: 1.5rem; padding: clamp(1.25rem, 3vw, 2rem); background: #120a22; border: 2px dashed #3b2667; border-radius: 6px; }
    .games p { color: var(--muted); max-width: 62ch; }
    .loading { font-family: var(--font-mono); font-weight: 700; color: var(--violet-soft); font-size: .85rem; text-transform: uppercase; letter-spacing: .06em; }
    .bar { display: flex; gap: 4px; margin-top: .5rem; }
    .bar i { width: 18px; height: 18px; background: #2d1d4f; }
    .bar i.on { background: var(--violet); animation: blink 1.6s steps(1) infinite; }
    .bar i.on:nth-child(2) { animation-delay: .2s; } .bar i.on:nth-child(3) { animation-delay: .4s; }
    @keyframes blink { 50% { opacity: .35; } }
    @media (max-width: 640px) { .games { grid-template-columns: 1fr; } }
    .join { margin-top: 1.5rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem; padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: 6px;
      background: linear-gradient(120deg, #3b1d7a, #1c0f38); border: 2px solid #4c2c95; box-shadow: 8px 8px 0 #05020a; }
    .join p { color: #e4dafb; max-width: 60ch; }
    .join .hero-actions { margin: 0; }
    .meet { display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: center; }
    .meet p { color: var(--muted); max-width: 60ch; margin-top: .6rem; }
    .meet .stickers { margin-top: 1.25rem; justify-content: flex-start; }
    .meet .pixel { width: 150px; image-rendering: pixelated; }
    @media (max-width: 700px) { .meet { grid-template-columns: 1fr; text-align: center; } .meet .pixel { margin-inline: auto; grid-row: 1; } .meet .stickers { justify-content: center; } .meet p { margin-inline: auto; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#content">${escapeHtml(c.skip)}</a>
  <div class="sky" aria-hidden="true"><span class="glow glow--violet"></span></div>

  <header class="site-header">
    <div class="wrap">
      <a class="brand devs-brand" href="${meta.path}">
        <img src="/assets/brand/pyxie-devs-logo.svg?v=2" width="102" height="34" alt="Pyxie Devs" />
      </a>
      <nav class="nav" aria-label="${escapeHtml(c.navLabel)}">
        <a class="nav-link" href="#what">${escapeHtml(c.navWhat)}</a>
        <a class="nav-link" href="#games">${escapeHtml(c.navGames)}</a>
        <a class="nav-link" href="#join">${escapeHtml(c.navJoin)}</a>
        <span class="lang-switch" role="group" aria-label="${escapeHtml(c.langLabel)}">${langSwitch}</span>
      </nav>
    </div>
  </header>

  <main id="content">
    <section class="wrap hero">
      <div>
        <img class="hero-logo" src="/assets/brand/pyxie-devs-logo.svg?v=2" width="684" height="228" alt="${escapeHtml(c.logoAlt)}" />
        <span class="eyebrow">${escapeHtml(c.eyebrow)}</span>
        <h1>${c.h1}</h1>
        <p class="lead">${escapeHtml(c.lead)}</p>
        <div class="hero-actions">
          ${ctas}
        </div>
      </div>
      <figure class="mascot" style="margin:0">
        <p class="bubble">${escapeHtml(c.bubble)}</p>
        <picture>
          <source srcset="/assets/brand/pyxie-hero.webp" type="image/webp" />
          <img src="/assets/brand/pyxie-hero.png" width="562" height="796" fetchpriority="high" alt="${escapeHtml(c.heroAlt)}" />
        </picture>
      </figure>
    </section>

    <section class="wrap section" id="what" aria-labelledby="whatTitle">
      <h2 id="whatTitle">${escapeHtml(c.whatTitle)}</h2>
      <p class="sub">${escapeHtml(c.whatLead)}</p>
      <div class="pgrid">${cards}
      </div>
    </section>

    <section class="wrap section" id="games" aria-labelledby="gamesTitle">
      <h2 id="gamesTitle">${escapeHtml(c.gamesTitle)}</h2>
      <div class="games reveal">
        <div>
          <p class="loading">${escapeHtml(c.gamesStatus)}</p>
          <div class="bar" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div>
        </div>
        <p>${escapeHtml(c.gamesText)}</p>
      </div>
    </section>

    <section class="wrap section" id="join" aria-labelledby="joinTitle">
      <h2 id="joinTitle">${escapeHtml(c.joinTitle)}</h2>
      <div class="join reveal">
        <p>${escapeHtml(c.joinText)}</p>
        <div class="hero-actions">
          ${ctas}
        </div>
      </div>
    </section>

    <section class="wrap section meet reveal" aria-labelledby="meetTitle">
      <div>
        <h2 id="meetTitle">${escapeHtml(c.mascotTitle)}</h2>
        <p>${escapeHtml(c.mascotText)}</p>
        <div class="stickers">
          ${stickers}
        </div>
      </div>
      <img class="pixel" src="/assets/pyxie/pyxie_pixelart.png" width="166" height="166" alt="${escapeHtml(c.stickers[0])}" loading="lazy" />
    </section>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p>© ${new Date().getFullYear()} Pyxie Devs. ${escapeHtml(c.footer)}</p>
      <span class="lang-switch" role="group" aria-label="${escapeHtml(c.langLabel)}">${langSwitch}</span>
    </div>
  </footer>

  <script>
    (function () {
      document.documentElement.classList.add('js');
      var items = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('is-in'); }); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      items.forEach(function (el) { io.observe(el); });
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderDevsPage, langFromPath, LANGS, COPY, DEFAULT_LANG, urlFor };
