const path = require('node:path');
const rawCards = require('./tarot.json');
const englishCards = require('./tarot_en.json');

const SUIT_CONFIG = {
  major: { namePt: 'Arcanos Maiores', nameEn: 'Major Arcana', emoji: '🔮' },
  wands: { namePt: 'Naipe de Paus', nameEn: 'Suit of Wands', emoji: '🔥' },
  swords: { namePt: 'Naipe de Espadas', nameEn: 'Suit of Swords', emoji: '⚔️' },
  cups: { namePt: 'Naipe de Copas', nameEn: 'Suit of Cups', emoji: '🏆' },
  pentacles: { namePt: 'Naipe de Ouros', nameEn: 'Suit of Pentacles', emoji: '🪙' },
};

/** "ÁS DE PAUS" → "as-de-paus" (URL das páginas /tarot/carta/:slug). */
function slugify(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getSuitFromId(id, index) {
  if (id.startsWith('major_') || index < 22) return 'major';
  if (id.startsWith('wands_') || (index >= 22 && index < 36)) return 'wands';
  if (id.startsWith('cups_') || (index >= 36 && index < 50)) return 'cups';
  if (id.startsWith('swords_') || (index >= 50 && index < 64)) return 'swords';
  return 'pentacles';
}

const TAROT_CATALOG = rawCards.map((card, idx) => {
  const number = idx + 1;
  const pad = String(number).padStart(2, '0');
  const suit = getSuitFromId(card.id, idx);
  const suitInfo = SUIT_CONFIG[suit];

  return {
    number,
    id: card.id,
    num: card.num || String(number),
    name: card.name,
    arcana: card.arcana,
    suit,
    suitNamePt: suitInfo.namePt,
    suitNameEn: suitInfo.nameEn,
    suitEmoji: suitInfo.emoji,
    keywords: card.keywords || [],
    upright: card.upright || '',
    reversed: card.reversed || '',
    fileName: `card_${pad}.webp`,
    slug: slugify(card.name),
    slugEn: slugify(englishCards[card.id]?.name || card.name),
  };
});

const CARD_BY_NUMBER = new Map(TAROT_CATALOG.map((c) => [c.number, c]));
const CARD_BY_ID = new Map(TAROT_CATALOG.map((c) => [c.id, c]));

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'tarot');

function getCardByNumber(num) {
  const parsed = Number.parseInt(num, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 78) return null;
  return CARD_BY_NUMBER.get(parsed) || null;
}

function getCardById(id) {
  if (!id) return null;
  return CARD_BY_ID.get(id) || null;
}

function getCardBySlug(slug) {
  const key = String(slug || '').toLowerCase();
  return TAROT_CATALOG.find((card) => card.slug === key) || null;
}

function getCardByEnglishSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return TAROT_CATALOG.find((card) => card.slugEn === key) || null;
}

const COURT_NUM_EN = { 'ÁS': 'ACE', PAJEM: 'PAGE', CAVALEIRO: 'KNIGHT', RAINHA: 'QUEEN', REI: 'KING' };

const ARCANA_EN = {
  'Arcanos Maiores': 'Major Arcana',
  'Arcanos Menores • Paus': 'Minor Arcana • Wands',
  'Arcanos Menores • Copas': 'Minor Arcana • Cups',
  'Arcanos Menores • Espadas': 'Minor Arcana • Swords',
  'Arcanos Menores • Ouros': 'Minor Arcana • Pentacles',
};

/**
 * Carta no idioma pedido: nome, palavras-chave e significados em inglês para 'en'.
 * Aceita tanto o item do catálogo quanto o objeto cru de tarot.json (mesmo id).
 */
function localizeCard(card, lang = 'pt') {
  if (!card) return card;
  if (lang !== 'en') return card;
  const en = englishCards[card.id];
  if (!en) return card;
  return {
    ...card,
    name: en.name,
    keywords: en.keywords,
    upright: en.upright,
    reversed: en.reversed,
    arcana: ARCANA_EN[card.arcana] || card.arcana,
    num: COURT_NUM_EN[card.num] || card.num,
  };
}

function getCardAssetPath(num) {
  const card = getCardByNumber(num);
  if (!card) return path.join(ASSETS_DIR, 'ui', 'card_locked.webp');
  return path.join(ASSETS_DIR, 'cards', card.fileName);
}

function getLockedAssetPath() {
  return path.join(ASSETS_DIR, 'ui', 'card_locked.webp');
}

function getCoverAssetPath() {
  return path.join(ASSETS_DIR, 'ui', 'album_cover.webp');
}

module.exports = {
  TOTAL_CARDS: 78,
  TAROT_CATALOG,
  getCardByNumber,
  getCardById,
  getCardBySlug,
  getCardByEnglishSlug,
  localizeCard,
  slugify,
  SUIT_CONFIG,
  getCardAssetPath,
  getLockedAssetPath,
  getCoverAssetPath,
};
