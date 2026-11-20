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
    gamesLead: 'What we are building right now.',
    projectStatus: 'In development · Alpha',
    projectTagline: 'From the ashes of humanity, a spark was born. Of hope. Or of revenge.',
    projectSummary: 'A horror roguelike set in an open world on Roblox, with deck-building combat. You explore the world from an isometric view, go down into dungeons in first person and fight on a 3D board with cards taken from the essence of the enemies you defeat.',
    projectScope: 'The Alpha covers the surface (Tiers 1 to 6) and the Salt Caves, with one target: the Necromancer Skeleton King.',
    projectTags: ['Roguelike', 'Deck-builder', 'Open world', 'Horror'],
    loreTitle: 'The lore',
    loreText: 'A war from Avalon came through portals and reached Earth. Colossal beasts, strong enough to survive even atomic bombs, wiped out humanity. The last human woman gave birth to the first Pilgrim, a new species marked by the magic of the beasts. Centuries later, the Pilgrims built Ashen Hold, a gothic kingdom with Obscura as its capital. You are an Altair: you protect the kingdom, absorb the essence of your enemies and dig up relics to find out how humanity came to an end.',
    trailersLabel: 'Trailers',
    trailerPlay: 'Play trailer',
    trailerReplay: 'Watch again',
    trailerFallback: 'Your browser can\'t play this video.',
    trailerDownload: 'Download the trailer',
    trailers: { rocklings: ['Rocklings dance', 'The rocklings take over the dance floor in a voxel cave.'] },
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
    gamesLead: 'Lo que estamos construyendo ahora mismo.',
    projectStatus: 'En desarrollo · Alpha',
    projectTagline: 'De las cenizas de la humanidad nació una chispa de esperanza. O de venganza.',
    projectSummary: 'Un roguelike de terror en mundo abierto en Roblox, con combate de construcción de mazos. Exploras el mundo en vista isométrica, bajas a las mazmorras en primera persona y luchas en un tablero 3D con cartas sacadas de la esencia de los enemigos que derrotas.',
    projectScope: 'La Alpha abarca la superficie (Tiers 1 a 6) y las Cuevas de Sal, con un objetivo: el Rey Esqueleto Nigromante.',
    projectTags: ['Roguelike', 'Construcción de mazos', 'Mundo abierto', 'Terror'],
    loreTitle: 'La historia',
    loreText: 'Una guerra de Avalon atravesó portales y llegó a la Tierra. Bestias colosales, capaces de sobrevivir incluso a bombas atómicas, acabaron con la humanidad. La última mujer humana dio a luz al primer Pilgrim, una especie nueva marcada por la magia de las bestias. Siglos después, los Pilgrims levantaron Ashen Hold, un reino gótico con capital en Obscura. Tú eres un Altair: proteges el reino, absorbes la esencia de tus enemigos y desentierras reliquias para descubrir cómo terminó la humanidad.',
    trailersLabel: 'Tráilers',
    trailerPlay: 'Ver tráiler',
    trailerReplay: 'Ver de nuevo',
    trailerFallback: 'Tu navegador no puede reproducir este video.',
    trailerDownload: 'Descargar el tráiler',
    trailers: { rocklings: ['El baile de los rocklings', 'Los rocklings se adueñan de la pista de baile en una cueva de vóxeles.'] },
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
    gamesLead: 'O que estamos construindo agora.',
    projectStatus: 'Em andamento · Alpha',
    projectTagline: 'Das cinzas da humanidade nasceu uma centelha de esperança. Ou de vingança.',
    projectSummary: 'Um roguelike de terror em mundo aberto no Roblox, com combate de deck-builder. Você explora o mundo em visão isométrica, desce às masmorras em primeira pessoa e luta num tabuleiro 3D com cartas tiradas da essência dos inimigos que derrota.',
    projectScope: 'A Alpha cobre a superfície (Tiers 1 a 6) e as Cavernas de Sal, com um alvo: o Rei Esqueleto Necromante.',
    projectTags: ['Roguelike', 'Deck-builder', 'Mundo aberto', 'Terror'],
    loreTitle: 'A lore',
    loreText: 'Uma guerra de Avalon atravessou portais e chegou à Terra. Bestas colossais, que resistiram até a bombas atômicas, acabaram com a humanidade. Da última mulher humana nasceu o primeiro Pilgrim, uma espécie nova marcada pela magia das bestas. Séculos depois, os Pilgrims ergueram Ashen Hold, um reino gótico com capital em Obscura. Você é um Altair: protege o reino, absorve a essência dos inimigos e escava relíquias para descobrir como a humanidade chegou ao fim.',
    trailersLabel: 'Trailers',
    trailerPlay: 'Ver trailer',
    trailerReplay: 'Ver de novo',
    trailerFallback: 'Seu navegador não consegue tocar este vídeo.',
    trailerDownload: 'Baixar o trailer',
    trailers: { rocklings: ['A dança dos rocklings', 'Os rocklings tomam conta da pista de dança numa caverna de voxel.'] },
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

// Projeto em andamento. Trailer novo: arquivo em public/assets/devs/sanctum/ (MP4 H.264 com
// +faststart e capa .webp + .jpg), uma entrada aqui e o título/descrição em COPY[lang].trailers.
// Com mais de um trailer, a página mostra os botões para trocar de vídeo.
const SANCTUM = {
  name: 'Sanctum Obscura',
  trailers: [
    {
      id: 'rocklings',
      src: '/assets/devs/sanctum/rocklings-dance-trailer.mp4',
      poster: '/assets/devs/sanctum/rocklings-dance-poster.webp',
      posterJpg: '/assets/devs/sanctum/rocklings-dance-poster.jpg',
      seconds: 30,
      uploadDate: '2026-11-20',
    },
  ],
};

function clock(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const PLAY_ICON = '<svg viewBox="0 0 8 8" width="28" height="28" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true" focusable="false"><rect x="2" y="1" width="1" height="6"/><rect x="3" y="2" width="1" height="4"/><rect x="4" y="2" width="1" height="4"/><rect x="5" y="3" width="1" height="2"/><rect x="6" y="3.5" width="1" height="1"/></svg>';

function renderProject(c) {
  const [first] = SANCTUM.trailers;
  const meta = (t) => c.trailers[t.id] || [t.id, ''];
  const [firstTitle] = meta(first);
  const label = (t) => `${meta(t)[0]} · ${clock(t.seconds)}`;

  const list = SANCTUM.trailers.length > 1
    ? `<div class="trailer-list" role="group" aria-label="${escapeHtml(c.trailersLabel)}">${SANCTUM.trailers.map((t, i) => `
            <button type="button" class="trailer-pick" data-src="${t.src}" data-poster="${t.poster}" data-label="${escapeHtml(label(t))}" data-title="${escapeHtml(meta(t)[0])}" aria-pressed="${i === 0}">
              <img src="${t.poster}" width="160" height="90" alt="${escapeHtml(meta(t)[0])}" loading="lazy" />
              <span>${escapeHtml(label(t))}</span>
            </button>`).join('')}
          </div>`
    : '';

  const tags = c.projectTags.map((t) => `<li>${escapeHtml(t)}</li>`).join('');

  return `
      <article class="project reveal" aria-labelledby="sanctumTitle">
        <div class="project-media">
          <div class="player" data-player>
            <span class="player-badge" aria-hidden="true">TRAILER</span>
            <video class="player-video" controls playsinline preload="none" poster="${first.poster}" aria-label="${escapeHtml(`${SANCTUM.name}: ${firstTitle}`)}">
              <source src="${first.src}" type="video/mp4" />
              <p>${escapeHtml(c.trailerFallback)} <a href="${first.src}" download>${escapeHtml(c.trailerDownload)}</a></p>
            </video>
            <button type="button" class="player-play" data-play data-replay="${escapeHtml(c.trailerReplay)}" aria-label="${escapeHtml(`${c.trailerPlay}: ${firstTitle}`)}">
              <span class="player-icon">${PLAY_ICON}</span>
              <span class="player-text"><strong>${escapeHtml(c.trailerPlay)}</strong><small data-label>${escapeHtml(label(first))}</small></span>
            </button>
          </div>
          ${list}
        </div>
        <div class="project-info">
          <p class="project-status"><span class="dot" aria-hidden="true"></span>${escapeHtml(c.projectStatus)}</p>
          <h3 id="sanctumTitle" class="project-title">${escapeHtml(SANCTUM.name)}</h3>
          <p class="project-tagline">“${escapeHtml(c.projectTagline)}”</p>
          <p>${escapeHtml(c.projectSummary)}</p>
          <p>${escapeHtml(c.projectScope)}</p>
          <ul class="project-tags">${tags}</ul>
        </div>
        <div class="project-lore">
          <h4>${escapeHtml(c.loreTitle)}</h4>
          <p>${escapeHtml(c.loreText)}</p>
        </div>
      </article>`;
}

function projectJsonLd(c, lang) {
  return {
    '@type': 'VideoGame',
    '@id': `${SITE_ORIGIN}/devs#sanctum-obscura`,
    name: SANCTUM.name,
    inLanguage: LANGS[lang].htmlLang,
    description: `${c.projectSummary} ${c.projectScope}`,
    genre: c.projectTags,
    gamePlatform: 'Roblox',
    author: { '@id': `${SITE_ORIGIN}/devs#org` },
    trailer: SANCTUM.trailers.map((t) => ({
      '@type': 'VideoObject',
      name: `${SANCTUM.name}: ${(c.trailers[t.id] || [t.id])[0]}`,
      description: (c.trailers[t.id] || ['', ''])[1],
      thumbnailUrl: `${SITE_ORIGIN}${t.posterJpg}`,
      contentUrl: `${SITE_ORIGIN}${t.src}`,
      uploadDate: t.uploadDate,
      duration: `PT${t.seconds}S`,
    })),
  };
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
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/devs#org`,
        name: 'Pyxie Devs',
        url: urlFor(DEFAULT_LANG),
        logo: `${SITE_ORIGIN}/assets/brand/pyxie-devs-logo.png?v=3`,
        description: c.description,
        knowsAbout: ['Roblox', 'Luau', 'Game development'],
      },
      projectJsonLd(c, L),
    ],
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
  <meta property="og:image" content="${SITE_ORIGIN}/assets/brand/og-devs.png?v=3" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(c.logoAlt)}" />
  <meta property="og:site_name" content="Pyxie Devs" />
  <meta property="og:locale" content="${meta.locale}" />
  ${ogAlternates}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(c.title)}" />
  <meta name="twitter:description" content="${escapeHtml(c.description)}" />
  <meta name="twitter:image" content="${SITE_ORIGIN}/assets/brand/og-devs.png?v=3" />
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  <link rel="icon" type="image/png" href="/assets/brand/pyxie-devs-icon.png?v=3" />
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
    /* Projeto em andamento: Sanctum Obscura (paleta do jogo: preto, roxo, ouro, ametista e vinho) */
    .project { --sanctum-gold: #e3c27a; --sanctum-wine: #5a1530; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); gap: clamp(1.25rem, 3vw, 2.25rem); align-items: start;
      margin-top: 1.75rem; padding: clamp(1rem, 2.6vw, 1.75rem); background: linear-gradient(160deg, #150b26 0%, #0f0818 60%, #1a0a17 100%); border: 2px solid #3b2667; border-radius: 6px; box-shadow: 8px 8px 0 #05020a; }
    .player { position: relative; aspect-ratio: 16 / 9; background: #05020a; border: 2px solid #4c2c95; border-radius: 4px; overflow: hidden; box-shadow: 0 0 0 4px #0b0614, 0 24px 60px -24px rgba(139, 92, 246, .55); }
    .player-video { display: block; width: 100%; height: 100%; object-fit: cover; background: #05020a; }
    .player-badge { position: absolute; z-index: 2; top: .75rem; left: .75rem; padding: .25rem .55rem; font-family: var(--font-mono); font-size: .7rem; font-weight: 700; letter-spacing: .12em; color: #120a22; background: var(--sanctum-gold); box-shadow: 3px 3px 0 #05020a; pointer-events: none; transition: opacity .25s; }
    .player-play { display: none; }
    .js .player-play { position: absolute; z-index: 1; inset: 0; display: flex; align-items: flex-end; gap: 1rem; padding: clamp(1rem, 3vw, 1.6rem); border: 0; cursor: pointer; text-align: left; color: #fff; font: inherit;
      background: linear-gradient(to top, rgba(7, 3, 14, .9) 0%, rgba(7, 3, 14, .35) 45%, rgba(7, 3, 14, 0) 70%); transition: opacity .25s; }
    .player-icon { display: grid; place-items: center; flex: none; width: clamp(56px, 8vw, 76px); height: clamp(56px, 8vw, 76px); background: var(--violet); color: #fff; border-radius: 4px; box-shadow: 5px 5px 0 #05020a, 0 0 0 3px rgba(196, 181, 253, .25); transition: transform .2s, background .2s; }
    .player-play:hover .player-icon, .player-play:focus-visible .player-icon { transform: translate(-2px, -2px); background: #9d74ff; }
    .player-play:focus-visible { outline: 3px solid var(--violet-soft); outline-offset: -6px; }
    .player-text { display: grid; gap: .15rem; }
    .player-text strong { font-family: var(--font-title); font-size: clamp(1.1rem, 2.2vw, 1.45rem); font-weight: 800; text-shadow: 2px 2px 0 #05020a; }
    .player-text small { font-family: var(--font-mono); font-size: .78rem; color: var(--sanctum-gold); letter-spacing: .04em; }
    .player.is-playing .player-play, .player.is-playing .player-badge { opacity: 0; pointer-events: none; }
    .trailer-list { display: flex; gap: .6rem; margin-top: .8rem; overflow-x: auto; padding-bottom: .25rem; }
    .trailer-pick { flex: none; display: grid; gap: .3rem; width: 160px; padding: 0; background: none; border: 0; color: var(--muted); font: .75rem var(--font-mono); text-align: left; cursor: pointer; }
    .trailer-pick img { width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; border: 2px solid #2d1d4f; border-radius: 3px; }
    .trailer-pick[aria-pressed="true"] { color: var(--sanctum-gold); }
    .trailer-pick[aria-pressed="true"] img { border-color: var(--sanctum-gold); }
    .project-info p { color: var(--muted); margin-top: .75rem; }
    .project-status { display: inline-flex; align-items: center; gap: .5rem; margin: 0 !important; padding: .3rem .65rem; font-family: var(--font-mono); font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
      color: var(--sanctum-gold) !important; background: rgba(227, 194, 122, .08); border: 1px solid rgba(227, 194, 122, .35); border-radius: 3px; }
    .project-status .dot { width: 8px; height: 8px; background: var(--sanctum-gold); animation: pulse 1.6s steps(2) infinite; }
    @keyframes pulse { 50% { opacity: .25; } }
    .project-title { font-size: clamp(1.8rem, 3.6vw, 2.6rem); font-weight: 900; margin-top: .8rem; letter-spacing: .01em; color: #f6ecd2; text-shadow: 3px 3px 0 var(--sanctum-wine); }
    .project-info .project-tagline { color: var(--violet-soft); font-style: italic; font-size: 1.02rem; border-left: 3px solid var(--violet); padding-left: .8rem; }
    .project-tags { display: flex; flex-wrap: wrap; gap: .45rem; list-style: none; padding: 0; margin: 1.1rem 0 0; }
    .project-tags li { padding: .25rem .6rem; font-family: var(--font-mono); font-size: .75rem; color: #e4dafb; background: #241544; border: 1px solid #3b2667; border-radius: 3px; }
    .project-lore { grid-column: 1 / -1; padding-top: 1.25rem; border-top: 2px dashed rgba(227, 194, 122, .25); }
    .project-lore h4 { font-family: var(--font-mono); font-size: .8rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--sanctum-gold); }
    .project-lore p { margin-top: .6rem; color: #d9cfee; max-width: 92ch; line-height: 1.7; }
    @media (max-width: 900px) { .project { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) { .project-status .dot { animation: none; } .player-icon, .player-play, .player-badge { transition: none; } }
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
        <img src="/assets/brand/pyxie-devs-logo.svg?v=3" width="110" height="34" alt="Pyxie Devs" />
      </a>
      <nav class="nav" aria-label="${escapeHtml(c.navLabel)}">
        <a class="nav-link" href="#games">${escapeHtml(c.navGames)}</a>
        <a class="nav-link" href="#what">${escapeHtml(c.navWhat)}</a>
        <a class="nav-link" href="#join">${escapeHtml(c.navJoin)}</a>
        <span class="lang-switch" role="group" aria-label="${escapeHtml(c.langLabel)}">${langSwitch}</span>
      </nav>
    </div>
  </header>

  <main id="content">
    <section class="wrap hero">
      <div>
        <img class="hero-logo" src="/assets/brand/pyxie-devs-logo.svg?v=3" width="684" height="212" alt="${escapeHtml(c.logoAlt)}" />
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

    <section class="wrap section" id="games" aria-labelledby="gamesTitle">
      <h2 id="gamesTitle">${escapeHtml(c.gamesTitle)}</h2>
      <p class="sub">${escapeHtml(c.gamesLead)}</p>${renderProject(c)}
    </section>

    <section class="wrap section" id="what" aria-labelledby="whatTitle">
      <h2 id="whatTitle">${escapeHtml(c.whatTitle)}</h2>
      <p class="sub">${escapeHtml(c.whatLead)}</p>
      <div class="pgrid">${cards}
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
    // Player do trailer: sem JS, o vídeo fica com os controles nativos; com JS, a capa vira um botão grande.
    (function () {
      document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var play = player.querySelector('[data-play]');
        if (!video || !play) return;
        var title = play.querySelector('strong');
        var label = play.querySelector('[data-label]');
        var playText = title.textContent;
        video.controls = false;
        function idle(text) {
          video.controls = false;
          title.textContent = text;
          player.classList.remove('is-playing');
        }
        play.addEventListener('click', function () {
          player.classList.add('is-playing');
          video.controls = true;
          var p = video.play();
          if (p && p.catch) p.catch(function () { idle(playText); });
          video.focus();
        });
        video.addEventListener('ended', function () { idle(play.dataset.replay); play.focus(); });
        var picks = player.parentNode.querySelectorAll('.trailer-pick');
        picks.forEach(function (pick) {
          pick.addEventListener('click', function () {
            picks.forEach(function (b) { b.setAttribute('aria-pressed', String(b === pick)); });
            video.pause();
            video.poster = pick.dataset.poster;
            video.querySelector('source').src = pick.dataset.src;
            video.load();
            label.textContent = pick.dataset.label;
            play.setAttribute('aria-label', playText + ': ' + pick.dataset.title);
            idle(playText);
          });
        });
      });
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderDevsPage, langFromPath, LANGS, COPY, DEFAULT_LANG, urlFor };
