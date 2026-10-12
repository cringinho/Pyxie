const path = require('node:path');
const tarotCards = require('../data/tarot.json');
const museumManager = require('../modules/museum/museumManager');
const partnershipManager = require('../modules/partnerships/partnershipManager');

const SITE_URL = 'https://pyxie.com.br';

function getBrasiliaDateStr(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(now));
}

/**
 * Seleciona determinística e harmonicamente a Carta do Dia com base na data de Brasília
 */
function getDailyTarotCard(dateStr = getBrasiliaDateStr()) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const index = hash % tarotCards.length;
  const isReversed = (hash % 7) === 0; // 1 em 7 chances de cair invertida
  return {
    card: tarotCards[index],
    orientation: isReversed ? 'REVERSED' : 'UPRIGHT',
    dateStr,
  };
}

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') unsafe = String(unsafe || '');
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Sanitiza menções e emojis específicos do Discord para apresentação externa limpa
 */
function sanitizeDiscordText(text) {
  if (typeof text !== 'string') return '';
  return text
    // Remove menções de usuários <@123> ou <@!123>
    .replace(/<@!?\d+>/g, '')
    // Remove menções de cargos <@&123>
    .replace(/<@&\d+>/g, '')
    // Remove menções de canais <#123>
    .replace(/<#\d+>/g, '')
    // Remove emojis customizados do Discord <:nome:123> ou <a:nome:123>
    .replace(/<a?:([a-zA-Z0-9_~]+):\d+>/g, '')
    // Remove múltiplos espaços e quebras de linha redundantes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Coleta os itens mais relevantes e dinâmicos para o feed público
 */
function getFeedItems(lang = 'pt') {
  const isEn = lang === 'en';
  const items = [];
  const now = new Date();
  const daily = getDailyTarotCard();
  const card = daily.card;
  const isReversed = daily.orientation === 'REVERSED';

  const cardPosLabel = isReversed
    ? (isEn ? 'Reversed' : 'Invertida')
    : (isEn ? 'Upright' : 'Em Pé');

  const cardDesc = isReversed ? card.reversed : card.upright;
  const cardImageUrl = `${SITE_URL}/api/tarot/card-image?id=${card.id}&pos=${isReversed ? 'reversed' : 'upright'}&lang=${lang}`;

  // 1. Carta do Dia de Tarot (Destaque Principal com imagem de alta resolução para Pinterest/Redes)
  items.push({
    title: isEn
      ? `🔮 Daily Tarot: ${card.name} (${cardPosLabel}) • Pyxie Oracle`
      : `🔮 Carta do Dia: ${card.name} (${cardPosLabel}) • Oráculo da Pyxie`,
    link: `${SITE_URL}/tarot?id=${card.id}&pos=${isReversed ? 'reversed' : 'upright'}&utm_source=rss_daily_tarot&lang=${lang}`,
    guid: `tarot-${daily.dateStr}-${card.id}`,
    pubDate: now.toUTCString(),
    description: isEn
      ? `Daily Tarot Card: ${card.name} (${card.arcana}). Keywords: ${card.keywords.join(', ')}. Reading: ${cardDesc} • Draw your personal daily card on Pyxie's interactive web portal.`
      : `Carta do dia no Tarot da Pyxie: ${card.name} (${card.arcana}). Palavras-chave: ${card.keywords.join(', ')}. Conselho: ${cardDesc} • Tire sua carta pessoal diária no portal interativo da Pyxie.`,
    imageUrl: cardImageUrl,
    category: isEn ? 'Tarot & Oracle' : 'Tarot e Oráculo',
  });

  // 2. Últimas Artes do Museu da Comunidade
  try {
    const artsResult = museumManager.listArts(1, 4);
    if (artsResult && artsResult.arts && artsResult.arts.length > 0) {
      artsResult.arts.forEach((art) => {
        const cleanDesc = sanitizeDiscordText(art.description);
        const artTitle = cleanDesc.length >= 3
          ? (isEn ? `🎨 Community Artwork: ${cleanDesc.slice(0, 45)} by ${art.author}` : `🎨 Arte da Comunidade: ${cleanDesc.slice(0, 45)} por ${art.author}`)
          : (isEn ? `🎨 Community Artwork by ${art.author}` : `🎨 Arte da Comunidade por ${art.author}`);
        items.push({
          title: artTitle,
          link: `${SITE_URL}/museu?art=${art.id}&utm_source=rss_museum&lang=${lang}`,
          guid: `museum-art-${art.id}`,
          pubDate: new Date(art.submittedAt || art.timestamp || Date.now() - 3600000).toUTCString(),
          description: isEn
            ? `Original artwork displayed at the Pyxie Community Museum. Author: ${art.author}. ${cleanDesc ? `"${cleanDesc}". ` : ''}Visit the full interactive art gallery on Pyxie.`
            : `Obra original em exibição no Museu de Criações da Pyxie. Autor: ${art.author}. ${cleanDesc ? `"${cleanDesc}". ` : ''}Conheça o acervo completo da comunidade.`,
          imageUrl: `${SITE_URL}/api/museum/art-image/${encodeURIComponent(art.id)}.webp`,
          category: isEn ? 'Community Art' : 'Arte Comunitária',
        });
      });
    }
  } catch (_) {}

  // 3. Parcerias & Alianças
  try {
    const partResult = partnershipManager.listPartnerships(1, 3);
    if (partResult && partResult.catalog && partResult.catalog.length > 0) {
      partResult.catalog.forEach((p) => {
        items.push({
          title: isEn
            ? `🤝 Partner Community: ${p.name || 'Allied Community'}`
            : `🤝 Comunidade Parceira: ${p.name || 'Comunidade Aliada'}`,
          link: `${SITE_URL}/parcerias?partner=${p.id}&utm_source=rss_partners&lang=${lang}`,
          guid: `partner-${p.id}`,
          pubDate: new Date(Date.now() - 7200000).toUTCString(),
          description: isEn
            ? `${p.shortDescription || p.description || 'Allied Discord community part of Pyxie partnerships mural.'}`
            : `${p.shortDescription || p.description || 'Comunidade aliada em destaque no mural de parcerias da Pyxie.'}`,
          imageUrl: p.bannerUrl || p.logoUrl || `${SITE_URL}/assets/pyxie/pyxie_mascot.png`,
          category: isEn ? 'Partnerships' : 'Parcerias',
        });
      });
    }
  } catch (_) {}

  // 4. Guia & Wiki Oficial
  items.push({
    title: isEn
      ? '📖 Complete Guide: 22 Interactive Careers & Living Economy in Pyxie'
      : '📖 Guia Completo: 22 Profissões com Minigames & Economia Viva na Pyxie',
    link: `${SITE_URL}/wiki?sec=profissoes&utm_source=rss_wiki&lang=${lang}`,
    guid: 'wiki-professions-guide-22',
    pubDate: new Date(Date.now() - 86400000).toUTCString(),
    description: isEn
      ? 'Explore the 22 full careers available in Pyxie bot, including Programmer, Doctor, Game Developer, Musician, and more with interactive turn-based minigames.'
      : 'Conheça as 22 profissões completas da Pyxie, incluindo Programador, Médico, Desenvolvedor de Jogos, Músico e mais com minigames práticos no Discord.',
    imageUrl: `${SITE_URL}/assets/pyxie/pyxie_mascot.png`,
    category: isEn ? 'Documentation' : 'Documentação',
  });

  return items;
}

/**
 * Gera Feed RSS 2.0 com suporte a namespaces Media RSS e Atom
 */
function generateRssXml(lang = 'pt') {
  const isEn = lang === 'en';
  const title = isEn ? 'Pyxie Discord Bot • Updates & Daily Tarot Oracle' : 'Pyxie Bot Discord • Novidades & Oráculo de Tarot Diário';
  const desc = isEn
    ? 'Official RSS feed for Pyxie Discord Bot: daily tarot reading, community museum artworks, allied communities, and game updates.'
    : 'Feed RSS oficial da Pyxie para Discord: carta do dia de tarot, criações do museu da comunidade, alianças de parcerias e novidades.';
  const feedUrl = `${SITE_URL}/rss.xml${isEn ? '?lang=en' : ''}`;
  const siteUrl = `${SITE_URL}/${isEn ? '?lang=en' : ''}`;

  const items = getFeedItems(lang);
  const itemsXml = items.map((it) => `
    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${escapeXml(it.link)}</link>
      <guid isPermaLink="false">${escapeXml(it.guid)}</guid>
      <pubDate>${it.pubDate}</pubDate>
      <category>${escapeXml(it.category)}</category>
      <description><![CDATA[${it.description}]]></description>
      ${it.imageUrl ? `
      <enclosure url="${escapeXml(it.imageUrl)}" type="image/png" length="150000" />
      <media:content url="${escapeXml(it.imageUrl)}" medium="image">
        <media:title>${escapeXml(it.title)}</media:title>
      </media:content>` : ''}
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(desc)}</description>
    <language>${isEn ? 'en-US' : 'pt-BR'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/assets/pyxie/pyxie_mascot.png</url>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(siteUrl)}</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;
}

/**
 * Gera Feed Atom 1.0
 */
function generateAtomXml(lang = 'pt') {
  const isEn = lang === 'en';
  const title = isEn ? 'Pyxie Discord Bot • Daily Oracle & Community Feed' : 'Pyxie Bot Discord • Oráculo Diário & Comunidade';
  const feedUrl = `${SITE_URL}/atom.xml${isEn ? '?lang=en' : ''}`;
  const siteUrl = `${SITE_URL}/${isEn ? '?lang=en' : ''}`;
  const items = getFeedItems(lang);

  const entriesXml = items.map((it) => `
  <entry>
    <id>${escapeXml(it.guid)}</id>
    <title>${escapeXml(it.title)}</title>
    <link href="${escapeXml(it.link)}" />
    <updated>${new Date(it.pubDate).toISOString()}</updated>
    <summary><![CDATA[${it.description}]]></summary>
    <category term="${escapeXml(it.category)}" />
    ${it.imageUrl ? `<link rel="enclosure" type="image/png" href="${escapeXml(it.imageUrl)}" />` : ''}
  </entry>`).join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <link href="${escapeXml(siteUrl)}" />
  <link href="${escapeXml(feedUrl)}" rel="self" />
  <id>${SITE_URL}/</id>
  <updated>${new Date().toISOString()}</updated>
  ${entriesXml}
</feed>`;
}

/**
 * Gera JSON Feed 1.1
 */
function generateJsonFeed(lang = 'pt') {
  const isEn = lang === 'en';
  const items = getFeedItems(lang);
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: isEn ? 'Pyxie Discord Bot Official Feed' : 'Feed Oficial da Pyxie para Discord',
    home_page_url: `${SITE_URL}/`,
    feed_url: `${SITE_URL}/feed.json${isEn ? '?lang=en' : ''}`,
    description: isEn ? 'Daily tarot card reading and community updates from Pyxie' : 'Oráculo de tarot diário e atualizações da comunidade Pyxie',
    icon: `${SITE_URL}/assets/pyxie/pyxie_mascot.png`,
    favicon: `${SITE_URL}/assets/pyxie/pyxie_pixelart_face.png`,
    items: items.map((it) => ({
      id: it.guid,
      url: it.link,
      title: it.title,
      content_text: it.description,
      date_published: new Date(it.pubDate).toISOString(),
      image: it.imageUrl,
      tags: [it.category],
    })),
  };
}

/**
 * Gera Feed RSS 2.0 dedicado e otimizado para o Pinterest com as artes do Museu da Comunidade
 * Inclui namespaces de rich media (<enclosure>, <media:content>, <content:encoded>, <dc:creator>)
 * e URLs com marca d'água persistente queimada em disco (.webp).
 */
function generatePinterestRssXml(lang = 'pt') {
  const isEn = lang === 'en';
  const title = isEn
    ? 'Pyxie Community Art Museum • Official Gallery (Pinterest Feed)'
    : 'Museu de Artes da Comunidade Pyxie • Galeria Oficial (Feed Pinterest)';
  const desc = isEn
    ? 'Official high-resolution Pinterest RSS feed for Pyxie Community Museum. Artworks, fanarts, and illustrations with persistent watermark and creator attribution.'
    : 'Feed RSS oficial para o Pinterest com o acervo em alta resolução do Museu de Criações da Pyxie & Cringelândia. Fanarts e ilustrações com marca d\'água permanente e créditos aos artistas.';
  const feedUrl = `${SITE_URL}/rss-pinterest.xml${isEn ? '?lang=en' : ''}`;
  const siteUrl = `${SITE_URL}/museu${isEn ? '?lang=en' : ''}`;

  const allArts = museumManager.getAllArts(100);
  let itemsXml = '';

  if (!allArts || allArts.length === 0) {
    const welcomeTitle = isEn
      ? '🎨 Pyxie Community Museum • Creative Showcase'
      : '🎨 Museu da Comunidade Pyxie • Galeria Criativa';
    const welcomeDesc = isEn
      ? 'Permanent showcase of artworks, illustrations, and fanarts created by the Discord community. Visit Pyxie\'s official interactive museum.'
      : 'Acervo permanente de ilustrações, fanarts e criações visuais da comunidade do Discord. Acesse a galeria interativa oficial da Pyxie.';
    const welcomeImg = `${SITE_URL}/assets/pyxie/pyxie_mascot.png`;

    itemsXml = `
    <item>
      <title>${escapeXml(welcomeTitle)}</title>
      <link>${escapeXml(siteUrl)}</link>
      <guid isPermaLink="false">museum-showcase-welcome</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <dc:creator>Pyxie Team</dc:creator>
      <category>${escapeXml(isEn ? 'Community Art' : 'Arte Comunitária')}</category>
      <description><![CDATA[${welcomeDesc}]]></description>
      <content:encoded><![CDATA[
        <p><img src="${welcomeImg}" alt="${escapeXml(welcomeTitle)}" /></p>
        <p>${welcomeDesc}</p>
        <p><a href="${siteUrl}">${isEn ? 'Visit the Pyxie Museum' : 'Visitar o Museu da Pyxie'}</a></p>
      ]]></content:encoded>
      <enclosure url="${escapeXml(welcomeImg)}" type="image/png" length="150000" />
      <media:content url="${escapeXml(welcomeImg)}" medium="image" type="image/png" width="1200">
        <media:title>${escapeXml(welcomeTitle)}</media:title>
        <media:description>${escapeXml(welcomeDesc)}</media:description>
        <media:credit role="author">Pyxie Team</media:credit>
      </media:content>
    </item>`;
  } else {
    itemsXml = allArts.map((art) => {
      const author = art.author || (isEn ? 'Community Artist' : 'Artista da Comunidade');
      const cleanDesc = sanitizeDiscordText(art.description);
      const artTitle = cleanDesc.length >= 3
        ? (isEn ? `🎨 ${cleanDesc.slice(0, 65)} — by ${author} • Pyxie Gallery` : `🎨 ${cleanDesc.slice(0, 65)} — por ${author} • Museu Pyxie`)
        : (isEn ? `🎨 Artwork by ${author} • Pyxie Community Museum` : `🎨 Obra de ${author} • Museu da Comunidade Pyxie`);

      const pinDesc = cleanDesc.length >= 3
        ? (isEn
          ? `"${cleanDesc}" — Artwork created by ${author} in the Pyxie & Cringelândia Discord community. Explore the full gallery with community fanarts and creations at the Official Museum.`
          : `"${cleanDesc}" — Obra criada por ${author} na comunidade da Pyxie & Cringelândia. Conheça a galeria completa no Museu Oficial da Pyxie.`)
        : (isEn
          ? `Original artwork created by ${author} in the Pyxie community. Discover the full Community Museum gallery at https://pyxie.com.br/museu.`
          : `Ilustração original criada por ${author} na comunidade da Pyxie. Descubra o acervo completo da galeria em https://pyxie.com.br/museu.`);

      const artLink = `${SITE_URL}/museu?art=${encodeURIComponent(art.id)}&utm_source=pinterest_rss&utm_medium=social&utm_campaign=museum_art${isEn ? '&lang=en' : ''}`;
      const imageUrl = `${SITE_URL}/api/museum/art-image/${encodeURIComponent(art.id)}.webp`;
      const pubDate = new Date(art.createdAt || art.submittedAt || Date.now()).toUTCString();

      return `
    <item>
      <title>${escapeXml(artTitle)}</title>
      <link>${escapeXml(artLink)}</link>
      <guid isPermaLink="false">museum-art-${escapeXml(art.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(author)}</dc:creator>
      <category>${escapeXml(isEn ? 'Digital Art' : 'Arte Digital')}</category>
      <description><![CDATA[${pinDesc}]]></description>
      <content:encoded><![CDATA[
        <p><img src="${escapeXml(imageUrl)}" alt="${escapeXml(artTitle)}" /></p>
        <p>${pinDesc}</p>
        <p>✦ <strong>${isEn ? 'Artist' : 'Artista'}:</strong> ${escapeXml(author)} | <a href="${escapeXml(artLink)}">${isEn ? 'View in Pyxie Community Gallery' : 'Ver na Galeria da Comunidade'}</a></p>
        <p><small>✦ Pyxie • Galeria Oficial da Comunidade • <a href="https://pyxie.com.br/">https://pyxie.com.br/</a></small></p>
      ]]></content:encoded>
      <enclosure url="${escapeXml(imageUrl)}" type="image/webp" length="250000" />
      <media:content url="${escapeXml(imageUrl)}" medium="image" type="image/webp" width="1200">
        <media:title>${escapeXml(artTitle)}</media:title>
        <media:description>${escapeXml(pinDesc)}</media:description>
        <media:credit role="author">${escapeXml(author)}</media:credit>
      </media:content>
    </item>`;
    }).join('');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(desc)}</description>
    <language>${isEn ? 'en-US' : 'pt-BR'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/assets/pyxie/pyxie_mascot.png</url>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(siteUrl)}</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;
}

module.exports = {
  getDailyTarotCard,
  getFeedItems,
  generateRssXml,
  generateAtomXml,
  generateJsonFeed,
  generatePinterestRssXml,
  sanitizeDiscordText,
};

