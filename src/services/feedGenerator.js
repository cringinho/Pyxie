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
        items.push({
          title: isEn
            ? `🎨 Community Artwork: ${art.title || 'Creative Lore'} by ${art.author || 'Member'}`
            : `🎨 Arte da Comunidade: ${art.title || 'Criação da Comunidade'} por ${art.author || 'Membro'}`,
          link: `${SITE_URL}/museu?art=${art.id}&utm_source=rss_museum&lang=${lang}`,
          guid: `museum-art-${art.id}`,
          pubDate: new Date(art.submittedAt || art.timestamp || Date.now() - 3600000).toUTCString(),
          description: isEn
            ? `Original artwork displayed at the Pyxie Community Museum. Author: ${art.author || 'Artist'}. Category: ${art.category || 'Fanart'}. Visit the full interactive art gallery on Pyxie.`
            : `Obra original em exibição no Museu de Criações da Pyxie. Autor: ${art.author || 'Artista'}. Categoria: ${art.category || 'Fanart'}. Conheça o acervo completo da comunidade.`,
          imageUrl: art.url || `${SITE_URL}/assets/pyxie/pyxie_mascot.png`,
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
      ? '📖 Complete Guide: 16 Interactive Careers & Living Economy in Pyxie'
      : '📖 Guia Completo: 16 Profissões com Minigames & Economia Viva na Pyxie',
    link: `${SITE_URL}/wiki?sec=profissoes&utm_source=rss_wiki&lang=${lang}`,
    guid: 'wiki-professions-guide-16',
    pubDate: new Date(Date.now() - 86400000).toUTCString(),
    description: isEn
      ? 'Explore the 16 full careers available in Pyxie bot, including Programmer, Doctor, Game Developer, Musician, and more with interactive turn-based minigames.'
      : 'Conheça as 16 profissões completas da Pyxie, incluindo Programador, Médico, Desenvolvedor de Jogos, Músico e mais com minigames práticos no Discord.',
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

module.exports = {
  getDailyTarotCard,
  getFeedItems,
  generateRssXml,
  generateAtomXml,
  generateJsonFeed,
};
