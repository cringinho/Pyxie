const fs = require('node:fs');
const path = require('node:path');
const shopeeManager = require('../services/shopeeManager');

const FEED_FILE = path.join(__dirname, '..', '..', 'data', 'pinterest_feed.json');
const BASE_URL = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';
const MAX_FEED_ITEMS = 50;

let schedulerTimer = null;

/**
 * Escapa strings para XML seguro.
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Carrega a fila do feed histórico.
 */
function loadFeed() {
  try {
    if (fs.existsSync(FEED_FILE)) {
      const content = fs.readFileSync(FEED_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('[RSS Pin Generator] Erro ao carregar feed JSON:', err.message);
  }
  return [];
}

/**
 * Salva atomicamente a fila do feed no disco.
 */
function saveFeed(items) {
  try {
    const dataDir = path.dirname(FEED_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const trimmed = items.slice(0, MAX_FEED_ITEMS);
    const tempFile = `${FEED_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(trimmed, null, 2), 'utf8');
    fs.renameSync(tempFile, FEED_FILE);
    return true;
  } catch (err) {
    console.error('[RSS Pin Generator] Erro ao salvar pinterest_feed.json:', err.message);
    return false;
  }
}

/**
 * Gera 5 novos registros de Pins para o dia com horários espaçados.
 */
function generateDailyPins(count = 5) {
  const currentFeed = loadFeed();
  const shopeeProducts = shopeeManager.getAllItems().filter((p) => p.active !== false);

  if (!shopeeProducts || shopeeProducts.length === 0) {
    console.warn('[RSS Pin Generator] Nenhum produto da Shopee disponível para gerar Pins.');
    return currentFeed;
  }

  // Embaralha para variar as recomendações diárias
  const shuffled = [...shopeeProducts].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const now = new Date();
  const newPins = [];

  selected.forEach((prod, index) => {
    const uniqueId = `shopee_${prod.id || Date.now()}_${Date.now()}_${index}`;
    
    // Título conciso com SEO (40 a 70 caracteres)
    let rawTitle = prod.titulo || 'Achadinho Exclusivo Shopee';
    rawTitle = rawTitle.replace(/\.\.\.$/, '').trim();
    let title = `${rawTitle} | Achadinho Shopee`;
    if (title.length > 70) {
      title = `${rawTitle.slice(0, 50)}... | Shopee`;
    }
    if (title.length < 40) {
      title = `✨ ${rawTitle} • Oferta Especial Shopee`;
    }

    // Imagem pública vertical terminando em .jpg
    let imageUrl = prod.imagem || `${BASE_URL}/assets/locations/portao_penumbra.png`;
    if (imageUrl.includes('susercontent.com') && !imageUrl.match(/\.(jpg|jpeg|png)$/i)) {
      imageUrl = `${imageUrl}.jpg`;
    }

    // Link de destino (link do afiliado direto ou promo page)
    const targetLink = prod.link || prod.productLink || `${BASE_URL}/promo`;

    // Descrição rica com keywords, preço, CTA e tag #afiliado
    const priceText = prod.preco ? `por apenas ${prod.preco}` : 'com desconto exclusivo';
    const tagText = prod.tag ? `Categoria: ${prod.tag}. ` : '';
    const description = `💖 ${rawTitle} ${priceText}! Garanta o seu com cupom de desconto e frete grátis na Shopee Oficial. ${tagText}Clique no link para conferir! #afiliado #achadinhosshopee #shopeebrasil #comprinhas`;

    // Espaça os horários de publicação ao longo do dia (ex: 08:00, 11:30, 15:00, 18:30, 21:00)
    const pinTime = new Date(now.getTime() - (count - 1 - index) * 3 * 60 * 60 * 1000);
    const pubDate = pinTime.toUTCString();

    newPins.push({
      id: uniqueId,
      title: title.slice(0, 70),
      description: description.slice(0, 500),
      link: targetLink,
      imageUrl,
      pubDate,
    });
  });

  // Insere os novos itens no topo da lista histórica
  const updatedFeed = [...newPins, ...currentFeed].slice(0, MAX_FEED_ITEMS);
  saveFeed(updatedFeed);

  console.log(`[RSS Pin Generator] ✅ ${newPins.length} novos Pins gerados com sucesso no feed RSS.`);
  return updatedFeed;
}

/**
 * Constrói o documento XML no padrão RSS 2.0 com extensões Media RSS compatíveis com o Pinterest.
 */
function buildRssXml() {
  let feedItems = loadFeed();

  // Se o feed estiver vazio na primeira chamada, gera o lote inicial imediatamente
  if (feedItems.length === 0) {
    feedItems = generateDailyPins(10);
  }

  const siteLink = BASE_URL;
  const rssLink = `${BASE_URL}/rss/pins.xml`;
  const lastBuildDate = new Date().toUTCString();

  const itemsXml = feedItems
    .map((item) => {
      const title = escapeXml(item.title);
      const link = escapeXml(item.link);
      const guid = escapeXml(item.id);
      const pubDate = item.pubDate || new Date().toUTCString();
      const imageUrl = escapeXml(item.imageUrl);
      const descriptionCdata = item.description || '';

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${descriptionCdata}]]></description>
      <enclosure url="${imageUrl}" type="image/jpeg" length="0" />
      <media:content url="${imageUrl}" medium="image" type="image/jpeg" />
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pyxie • Achadinhos Shopee &amp; Catálogo Oficial</title>
    <link>${siteLink}</link>
    <description>Feed RSS automatizado para auto-pinning no Pinterest com os melhores achadinhos da Shopee e novidades da Pyxie.</description>
    <language>pt-br</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${rssLink}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Inicia o Agendador Diário (Cron Daemon às 03:00 da manhã).
 */
function startRssScheduler() {
  if (schedulerTimer) return;

  // Se o feed estiver vazio, cria a semente inicial
  const existing = loadFeed();
  if (existing.length === 0) {
    console.log('[RSS Pin Generator] Inicializando feed com 10 Pins...');
    generateDailyPins(10);
  }

  // Tenta usar node-cron se disponível, caso contrário usa timer diário robusto
  let cronLoaded = false;
  try {
    const cron = require('node-cron');
    if (cron && typeof cron.schedule === 'function') {
      cron.schedule('0 3 * * *', () => {
        console.log('[RSS Pin Generator] Executando cron diário (03:00) para novos Pins no Pinterest...');
        generateDailyPins(5);
      });
      cronLoaded = true;
      console.log('[RSS Pin Generator] Daemon node-cron ativado (03:00 diariamente).');
    }
  } catch (_) {}

  if (!cronLoaded) {
    // Fallback nativo: roda a cada 24 horas
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    schedulerTimer = setInterval(() => {
      console.log('[RSS Pin Generator] Executando rotina diária de novos Pins no Pinterest...');
      generateDailyPins(5);
    }, ONE_DAY_MS);
    console.log('[RSS Pin Generator] Daemon de agendamento ativado (Ciclo: 24h).');
  }
}

/**
 * Para o agendador.
 */
function stopRssScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('[RSS Pin Generator] Agendador finalizado.');
  }
}

module.exports = {
  loadFeed,
  saveFeed,
  generateDailyPins,
  buildRssXml,
  startRssScheduler,
  stopRssScheduler,
};
