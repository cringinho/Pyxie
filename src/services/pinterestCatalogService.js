const fs = require('node:fs');
const path = require('node:path');
const { TAROT_CATALOG } = require('../data/tarotCardsCatalog');
const shopeeManager = require('./shopeeManager');

const BASE_URL = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';

/**
 * Escapa valores para CSV padrão RFC 4180.
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/[\r\n]+/g, ' ').trim();
  if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Normaliza preço para o formato estrito do Pinterest ('XX.XX BRL').
 */
function normalizePrice(rawPrice) {
  if (!rawPrice) return '0.00 BRL';
  const cleaned = String(rawPrice).replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return '0.00 BRL';
  return `${num.toFixed(2)} BRL`;
}

/**
 * Gera todos os itens do catálogo formatados para o feed do Pinterest.
 */
function getCatalogItems() {
  const items = [];

  // 1. Baralho Canônico dos 78 Arcanos do Tarot da Pyxie
  for (const card of TAROT_CATALOG) {
    const suitName = card.suitNamePt || card.suit;
    const meaning = card.upright || (card.keywords && card.keywords.join(', ')) || 'Arcano Místico';
    const imgUrl = `${BASE_URL}/assets/tarot/cards/${card.fileName}`;
    const targetLink = `${BASE_URL}/`;

    items.push({
      id: `tarot_card_${card.number}`,
      title: `Tarot da Pyxie • ${card.name} (${suitName})`,
      description: `Carta nº ${card.number} do Baralho Oficial dos 78 Arcanos da Pyxie. Significado divinatório: ${meaning}. Consulte sua tiragem diária no Discord.`,
      link: targetLink,
      image_link: imgUrl,
      price: '0.00 BRL',
      availability: 'in stock',
      condition: 'new',
      brand: 'Pyxie Tarot',
      item_group_id: 'tarot_deck',
      google_product_category: 'Arts & Entertainment > Hobbies & Creative Arts > Collectibles',
    });
  }

  // 3. Mascote & Artes Oficiais da Pyxie
  items.push(
    {
      id: 'pyxie_mascot_art',
      title: 'Pyxie • Mascote Oficial Fada Mágica para Discord',
      description: 'Pyxie é a fada mágica do Discord com Tarot de 78 Arcanos, Economia viva com moedinhas e feijões mágicos, minigames e carreiras interativas.',
      link: `${BASE_URL}/`,
      image_link: `${BASE_URL}/assets/pyxie/pyxie_mascot.png`,
      price: '0.00 BRL',
      availability: 'in stock',
      condition: 'new',
      brand: 'Pyxie',
      item_group_id: 'artes_oficiais',
      google_product_category: 'Software > Digital Goods',
    },
    {
      id: 'pyxie_space_banner',
      title: 'Pyxie • Arte Oficial Galáxia & Estrelas',
      description: 'Banner oficial temático da Pyxie para comunidades e servidores do Discord.',
      link: `${BASE_URL}/`,
      image_link: `${BASE_URL}/assets/pyxie/pyxie_space_banner.jpg`,
      price: '0.00 BRL',
      availability: 'in stock',
      condition: 'new',
      brand: 'Pyxie',
      item_group_id: 'artes_oficiais',
      google_product_category: 'Arts & Entertainment > Hobbies & Creative Arts > Collectibles',
    }
  );

  // 4. Produtos & Achadinhos Temáticos (Shopee & Sanrio)
  const shopeeProducts = shopeeManager.getAllItems();
  for (const prod of shopeeProducts) {
    if (prod.active === false) continue;
    const title = prod.titulo || 'Achadinho Temático Shopee';
    const desc = `Produto selecionado para a comunidade: ${title}. Categoria: ${prod.tag || 'Sanrio / Moda'}. Disponível na Shopee.`;
    const targetLink = `${BASE_URL}/promo`;
    const imgUrl = prod.imagem || `${BASE_URL}/assets/pyxie/pyxie_mascot.png`;
    const priceFormatted = normalizePrice(prod.preco);

    items.push({
      id: `shopee_${prod.id}`,
      title: `${title} (Achadinhos da Pyxie)`,
      description: desc,
      link: targetLink,
      image_link: imgUrl,
      price: priceFormatted,
      availability: 'in stock',
      condition: 'new',
      brand: 'Shopee / Pyxie',
      item_group_id: 'achadinhos_shopee',
      google_product_category: 'Apparel & Accessories',
    });
  }

  return items;
}

/**
 * Gera o conteúdo CSV completo compatível com o Catálogo do Pinterest.
 */
function generatePinterestCsv() {
  const headers = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'price',
    'availability',
    'condition',
    'brand',
    'item_group_id',
    'google_product_category',
  ];

  const items = getCatalogItems();
  const rows = [headers.join(',')];

  for (const item of items) {
    const row = headers.map((h) => escapeCsv(item[h]));
    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}

/**
 * Salva o arquivo CSV atualizado em public/pinterest-catalog.csv.
 */
function syncPinterestCatalogFile() {
  try {
    const csvContent = generatePinterestCsv();
    const publicDir = path.join(__dirname, '..', '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const targetPath = path.join(publicDir, 'pinterest-catalog.csv');
    fs.writeFileSync(targetPath, '\uFEFF' + csvContent, 'utf8'); // UTF-8 com BOM para compatibilidade máxima
    return { success: true, count: getCatalogItems().length, path: targetPath };
  } catch (err) {
    console.error('Erro ao sincronizar pinterest-catalog.csv:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getCatalogItems,
  generatePinterestCsv,
  syncPinterestCatalogFile,
};
