const fs = require('fs');
const path = require('path');
const satori = require('satori').default || require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { getUserAccount, getUserRank, TITLES_CATALOG, THEMES_CATALOG } = require('./economy');
const { getAlbumStats, getUserAlbum } = require('./tarotAlbumService');
const { getCardByNumber } = require('../data/tarotCardsCatalog');
const marriageManager = require('../modules/marriage/marriageManager');
const professions = require('./professions');
const { getLanguage, t, formatCoins } = require('../utils/i18n');
const { readJson } = require('../utils/atomicJson');

// Cache de fontes em memória (leitura única em disco)
let _cinzelFont = null;
let _quicksandFont = null;

function loadFonts() {
  if (!_cinzelFont) {
    const cinzelPath = path.join(process.cwd(), 'assets', 'fonts', 'Cinzel-700.ttf');
    _cinzelFont = fs.readFileSync(cinzelPath);
  }
  if (!_quicksandFont) {
    const quicksandPath = path.join(process.cwd(), 'assets', 'fonts', 'Quicksand-Bold.ttf');
    _quicksandFont = fs.readFileSync(quicksandPath);
  }
  return [
    { name: 'Cinzel', data: _cinzelFont, weight: 700, style: 'normal' },
    { name: 'Quicksand', data: _quicksandFont, weight: 700, style: 'normal' },
  ];
}

// Cache LRU simples para imagens externas (avatar e ícone da guilda)
const imageBase64Cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

async function fetchImageBase64(url) {
  if (!url) return null;

  const cached = imageBase64Cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.dataUri;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/png';
    const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;

    if (imageBase64Cache.size > 200) {
      const oldestKey = imageBase64Cache.keys().next().value;
      imageBase64Cache.delete(oldestKey);
    }
    imageBase64Cache.set(url, { dataUri, timestamp: Date.now() });

    return dataUri;
  } catch (_) {
    return null;
  }
}

function getUserMuseumArtCount(userId) {
  try {
    const data = readJson(path.join(process.cwd(), 'data', 'museumData.json'), { arts: [] });
    if (data && Array.isArray(data.arts)) {
      return data.arts.filter((a) => a.authorId === userId).length;
    }
  } catch (_) {}
  return 0;
}

/**
 * Sanitiza textos para o card Satori/Resvg, convertendo caracteres estilizados
 * (como letras de fontes enclausuradas 🅲, 🆁) em ASCII e removendo emojis não suportados por fontes TTF.
 */
function sanitizeCardText(str, maxLength = 35) {
  if (!str || typeof str !== 'string') return '';
  // 1. Converter caracteres alfanuméricos especiais enclausurados (A-Z) para ASCII padrão
  let text = str.replace(/[\uD83C][\uDD00-\uDDFF]/g, (char) => {
    const code = char.codePointAt(0);
    if (code >= 0x1F130 && code <= 0x1F149) return String.fromCharCode(code - 0x1F130 + 65);
    if (code >= 0x1F150 && code <= 0x1F169) return String.fromCharCode(code - 0x1F150 + 65);
    if (code >= 0x1F170 && code <= 0x1F189) return String.fromCharCode(code - 0x1F170 + 65);
    return '';
  });

  // 2. Normalizar formas de compatibilidade Unicode (Mathematical Bold/Fraktur/Script, etc.)
  text = text.normalize('NFKD');

  // 3. Remover emojis e símbolos Unicode que não existem nas fontes TTF carregadas
  text = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu, '');

  // 4. Limpar espaços duplicados e truncar
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > maxLength) {
    text = text.slice(0, maxLength - 1) + '…';
  }
  return text;
}

/**
 * Paletas visuais atmosféricas profundas para os 7 temas de perfil.
 */
const THEME_PALETTES = {
  default: {
    color: '#e60067',
    bgGradient: 'linear-gradient(135deg, #09030c 0%, #1c061e 40%, #120417 75%, #050208 100%)',
    boxBg: 'rgba(230, 0, 103, 0.055)',
    boxBorder: 'rgba(230, 0, 103, 0.22)',
    avatarRing: 'linear-gradient(135deg, #e60067 0%, #8b5cf6 50%, #f472b6 100%)',
    avatarShadow: '0 0 28px rgba(230, 0, 103, 0.45)',
    titleBg: 'linear-gradient(90deg, rgba(230, 0, 103, 0.35) 0%, rgba(139, 92, 246, 0.22) 100%)',
    titleBorder: 'rgba(230, 0, 103, 0.75)',
    badgeBg: 'rgba(230, 0, 103, 0.12)',
    badgeBorder: 'rgba(230, 0, 103, 0.3)',
    accentText: '#f472b6',
    headerBg: 'rgba(230, 0, 103, 0.07)',
    headerBorder: 'rgba(230, 0, 103, 0.25)',
  },
  ouro: {
    color: '#facc15',
    bgGradient: 'linear-gradient(135deg, #100b02 0%, #241904 40%, #181102 75%, #080501 100%)',
    boxBg: 'rgba(250, 204, 21, 0.06)',
    boxBorder: 'rgba(250, 204, 21, 0.26)',
    avatarRing: 'linear-gradient(135deg, #facc15 0%, #ca8a04 50%, #fef08a 100%)',
    avatarShadow: '0 0 28px rgba(250, 204, 21, 0.45)',
    titleBg: 'linear-gradient(90deg, rgba(250, 204, 21, 0.35) 0%, rgba(202, 138, 4, 0.25) 100%)',
    titleBorder: 'rgba(250, 204, 21, 0.8)',
    badgeBg: 'rgba(250, 204, 21, 0.14)',
    badgeBorder: 'rgba(250, 204, 21, 0.35)',
    accentText: '#fde047',
    headerBg: 'rgba(250, 204, 21, 0.08)',
    headerBorder: 'rgba(250, 204, 21, 0.28)',
  },
  esmeralda: {
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #02120a 0%, #052617 40%, #03170e 75%, #010804 100%)',
    boxBg: 'rgba(16, 185, 129, 0.06)',
    boxBorder: 'rgba(16, 185, 129, 0.26)',
    avatarRing: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #6ee7b7 100%)',
    avatarShadow: '0 0 28px rgba(16, 185, 129, 0.45)',
    titleBg: 'linear-gradient(90deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.25) 100%)',
    titleBorder: 'rgba(16, 185, 129, 0.8)',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    badgeBorder: 'rgba(16, 185, 129, 0.35)',
    accentText: '#6ee7b7',
    headerBg: 'rgba(16, 185, 129, 0.08)',
    headerBorder: 'rgba(16, 185, 129, 0.28)',
  },
  galaxia: {
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #070417 0%, #160d38 40%, #0d0824 75%, #04020d 100%)',
    boxBg: 'rgba(139, 92, 246, 0.065)',
    boxBorder: 'rgba(139, 92, 246, 0.28)',
    avatarRing: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #c084fc 100%)',
    avatarShadow: '0 0 28px rgba(139, 92, 246, 0.45)',
    titleBg: 'linear-gradient(90deg, rgba(139, 92, 246, 0.38) 0%, rgba(99, 102, 241, 0.25) 100%)',
    titleBorder: 'rgba(139, 92, 246, 0.8)',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    badgeBorder: 'rgba(139, 92, 246, 0.35)',
    accentText: '#c084fc',
    headerBg: 'rgba(139, 92, 246, 0.08)',
    headerBorder: 'rgba(139, 92, 246, 0.3)',
  },
  cyberpunk: {
    color: '#ff1493',
    bgGradient: 'linear-gradient(135deg, #130018 0%, #2b0035 40%, #190022 75%, #0a000d 100%)',
    boxBg: 'rgba(255, 20, 147, 0.07)',
    boxBorder: 'rgba(255, 20, 147, 0.3)',
    avatarRing: 'linear-gradient(135deg, #ff1493 0%, #00f5d4 50%, #ff007f 100%)',
    avatarShadow: '0 0 32px rgba(255, 20, 147, 0.55)',
    titleBg: 'linear-gradient(90deg, rgba(255, 20, 147, 0.4) 0%, rgba(0, 245, 212, 0.25) 100%)',
    titleBorder: 'rgba(255, 20, 147, 0.85)',
    badgeBg: 'rgba(255, 20, 147, 0.16)',
    badgeBorder: 'rgba(255, 20, 147, 0.4)',
    accentText: '#ff69b4',
    headerBg: 'rgba(255, 20, 147, 0.09)',
    headerBorder: 'rgba(255, 20, 147, 0.35)',
  },
  chama: {
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #170404 0%, #350909 40%, #200505 75%, #0b0202 100%)',
    boxBg: 'rgba(239, 68, 68, 0.065)',
    boxBorder: 'rgba(239, 68, 68, 0.28)',
    avatarRing: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #fca5a5 100%)',
    avatarShadow: '0 0 28px rgba(239, 68, 68, 0.5)',
    titleBg: 'linear-gradient(90deg, rgba(239, 68, 68, 0.38) 0%, rgba(249, 115, 22, 0.25) 100%)',
    titleBorder: 'rgba(239, 68, 68, 0.8)',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    badgeBorder: 'rgba(239, 68, 68, 0.35)',
    accentText: '#f87171',
    headerBg: 'rgba(239, 68, 68, 0.08)',
    headerBorder: 'rgba(239, 68, 68, 0.3)',
  },
  diamante: {
    color: '#00f5d4',
    bgGradient: 'linear-gradient(135deg, #011114 0%, #03272e 40%, #02191d 75%, #000a0c 100%)',
    boxBg: 'rgba(0, 245, 212, 0.06)',
    boxBorder: 'rgba(0, 245, 212, 0.26)',
    avatarRing: 'linear-gradient(135deg, #00f5d4 0%, #38bdf8 50%, #a7f3d0 100%)',
    avatarShadow: '0 0 28px rgba(0, 245, 212, 0.45)',
    titleBg: 'linear-gradient(90deg, rgba(0, 245, 212, 0.35) 0%, rgba(56, 189, 248, 0.25) 100%)',
    titleBorder: 'rgba(0, 245, 212, 0.8)',
    badgeBg: 'rgba(0, 245, 212, 0.14)',
    badgeBorder: 'rgba(0, 245, 212, 0.35)',
    accentText: '#5eead4',
    headerBg: 'rgba(0, 245, 212, 0.08)',
    headerBorder: 'rgba(0, 245, 212, 0.28)',
  },
};

// ==========================================
// ÍCONES VETORIAIS SVG (ZERO TOFU / GLYPHS)
// ==========================================

function createSvg(children, width = 18, height = 18, viewBox = '0 0 24 24') {
  return {
    type: 'svg',
    props: {
      width: String(width),
      height: String(height),
      viewBox,
      fill: 'none',
      style: { display: 'flex', flexShrink: 0 },
      children,
    },
  };
}

function iconCoin(size = 18, color = '#fbbf24') {
  return createSvg(
    [
      { type: 'circle', props: { cx: '12', cy: '12', r: '9', stroke: color, strokeWidth: '2', fill: color, fillOpacity: '0.18' } },
      { type: 'circle', props: { cx: '12', cy: '12', r: '6', stroke: color, strokeWidth: '1.5', strokeDasharray: '2 2' } },
      { type: 'path', props: { d: 'M12 7v10M9.5 9.5h5a1 1 0 0 1 0 2h-5a1 1 0 0 0 0 2h5', stroke: color, strokeWidth: '1.5' } },
    ],
    size,
    size
  );
}

function iconBean(size = 18, color = '#10b981') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M12 22v-9', stroke: color, strokeWidth: '2', strokeLinecap: 'round' } },
      { type: 'path', props: { d: 'M12 13c0-4.5 4-7 8-7-0.5 4-3 8-8 7z', stroke: color, strokeWidth: '1.8', fill: color, fillOpacity: '0.25' } },
      { type: 'path', props: { d: 'M12 16c0-3.5-3-5.5-6-5.5 0.4 3 2.2 6 6 5.5z', stroke: color, strokeWidth: '1.8', fill: color, fillOpacity: '0.25' } },
    ],
    size,
    size
  );
}

function iconCrown(size = 18, color = '#facc15') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M2 19h20M4 19l2-11 5 6 5-6 2 11H4z', stroke: color, strokeWidth: '2', fill: color, fillOpacity: '0.22', strokeLinejoin: 'round' } },
      { type: 'circle', props: { cx: '6', cy: '7', r: '1.5', fill: color } },
      { type: 'circle', props: { cx: '12', cy: '5', r: '1.5', fill: color } },
      { type: 'circle', props: { cx: '18', cy: '7', r: '1.5', fill: color } },
    ],
    size,
    size
  );
}

function iconTrophy(size = 18, color = '#fbbf24') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2', stroke: color, strokeWidth: '2' } },
      { type: 'path', props: { d: 'M6 3h12v7a6 6 0 0 1-12 0V3z', stroke: color, strokeWidth: '2', fill: color, fillOpacity: '0.2' } },
      { type: 'path', props: { d: 'M12 16v3M8 21h8', stroke: color, strokeWidth: '2', strokeLinecap: 'round' } },
    ],
    size,
    size
  );
}

function iconGem(size = 18, color = '#38bdf8') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M6 3h12l4 6-10 12L2 9l4-6z', stroke: color, strokeWidth: '2', fill: color, fillOpacity: '0.2', strokeLinejoin: 'round' } },
      { type: 'path', props: { d: 'M2 9h20M12 21L7.5 9 10 3M12 21l4.5-12L14 3', stroke: color, strokeWidth: '1.5' } },
    ],
    size,
    size
  );
}

function iconBriefcase(size = 18, color = '#60a5fa') {
  return createSvg(
    [
      { type: 'rect', props: { x: '2', y: '7', width: '20', height: '14', rx: '2', stroke: color, strokeWidth: '2', fill: color, fillOpacity: '0.15' } },
      { type: 'path', props: { d: 'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 12h20M12 12v3', stroke: color, strokeWidth: '1.8' } },
    ],
    size,
    size
  );
}

function iconRing(size = 18, color = '#f43f5e') {
  return createSvg(
    [
      { type: 'circle', props: { cx: '9', cy: '13', r: '6', stroke: color, strokeWidth: '2', fill: color, fillOpacity: '0.12' } },
      { type: 'circle', props: { cx: '15', cy: '13', r: '6', stroke: '#fb7185', strokeWidth: '2', fill: '#fb7185', fillOpacity: '0.12' } },
      { type: 'path', props: { d: 'M9 5l1.5 2h-3L9 5z', fill: color } },
    ],
    size,
    size
  );
}

function iconCrystalBall(size = 18, color = '#c084fc') {
  return createSvg(
    [
      { type: 'circle', props: { cx: '12', cy: '10', r: '7', stroke: color, strokeWidth: '2', fill: color, fillOpacity: '0.2' } },
      { type: 'path', props: { d: 'M8 21h8M9 17l-2 4M15 17l2 4M10 7a3 3 0 0 1 3 3', stroke: color, strokeWidth: '1.8', strokeLinecap: 'round' } },
    ],
    size,
    size
  );
}

function iconPalette(size = 18, color = '#67e8f9') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M12 3a9 9 0 0 0-9 9c0 3.6 2.4 5.5 4.5 5.5.9 0 1.5-.7 1.5-1.5 0-.6.3-1.2.9-1.5.5-.3 1.1-.4 1.8-.4 4.5 0 8.3-3.6 8.3-8.1 0-4.4-3.6-8-8-8z', stroke: color, strokeWidth: '1.8', fill: color, fillOpacity: '0.15' } },
      { type: 'circle', props: { cx: '7.5', cy: '10.5', r: '1.2', fill: color } },
      { type: 'circle', props: { cx: '10.5', cy: '7.5', r: '1.2', fill: color } },
      { type: 'circle', props: { cx: '14.5', cy: '8.5', r: '1.2', fill: color } },
      { type: 'circle', props: { cx: '16', cy: '12', r: '1.2', fill: color } },
    ],
    size,
    size
  );
}

function iconSparkle(size = 18, color = '#e60067') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z', stroke: color, strokeWidth: '1.8', fill: color, fillOpacity: '0.25' } },
    ],
    size,
    size
  );
}

function iconCastle(size = 18, color = '#e2e8f0') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M3 21h18M5 21V9l2-2v4h2V7l2-2 2 2v4h2V7l2 2v12M9 21v-5a3 3 0 0 1 6 0v5', stroke: color, strokeWidth: '1.8' } },
    ],
    size,
    size
  );
}

function iconHammer(size = 18, color = '#94a3b8') {
  return createSvg(
    [
      { type: 'path', props: { d: 'M15 3l6 6-3 3-6-6 3-3zM9 12l-6 6a1.5 1.5 0 0 0 2.1 2.1l6-6', stroke: color, strokeWidth: '1.8', strokeLinecap: 'round' } },
    ],
    size,
    size
  );
}

function iconBaby(size = 18, color = '#fb7185') {
  return createSvg(
    [
      { type: 'circle', props: { cx: '12', cy: '8', r: '5', stroke: color, strokeWidth: '1.8', fill: color, fillOpacity: '0.2' } },
      { type: 'path', props: { d: 'M7 21a5 5 0 0 1 10 0', stroke: color, strokeWidth: '1.8', strokeLinecap: 'round' } },
    ],
    size,
    size
  );
}

/**
 * Constrói a barra visual de porcentagem (ex: [████████░░] 80%)
 */
function buildProgressBar(pct) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const filled = Math.round(clamped / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${clamped}%`;
}

/**
 * Gera o Card de Identidade Arcana em alta resolução (1200x675) via Satori + Resvg Rust.
 */
async function generateProfileCard({ targetUser, guild, source = null, client = null }) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const fonts = loadFonts();

  // Dados de identidade
  const userId = targetUser.id;
  const rawDisplayName = targetUser.displayName || targetUser.username;
  const displayName = sanitizeCardText(rawDisplayName, 26) || 'Adventurer';
  const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', size: 256 });

  // Dados da guilda de origem
  const rawGuildName = guild?.name || (isEn ? 'Discord Community' : 'Comunidade Discord');
  const guildName = sanitizeCardText(rawGuildName, 32) || 'Discord';
  const guildId = guild?.id || '0';
  const guildIconUrl = guild?.iconURL ? guild.iconURL({ extension: 'png', size: 128 }) : null;

  // Busca paralela de imagens
  const [avatarBase64, guildIconBase64] = await Promise.all([
    fetchImageBase64(avatarUrl),
    fetchImageBase64(guildIconUrl),
  ]);

  // Economia & Carreira
  const account = getUserAccount(userId);
  const rank = getUserRank(userId);
  const coins = Number(account.coins) || 0;
  const magicBeans = Number(account.magicBeans) || 0;
  const workCount = Number(account.workCount) || 0;
  const professionKey = account.profession;
  const professionLabel = professionKey
    ? t(`profession.labels.${professionKey}`, source) || professions[professionKey]?.label || professionKey
    : (isEn ? 'None (Use /py-profession)' : 'Nenhuma (Use /py-profissao)');
  const professionLevel = Math.max(1, Math.floor(workCount / 5) + 1);
  const rankStr = rank?.position ? `#${rank.position} Global` : (isEn ? 'Unranked' : 'Sem Rank');

  // Cosméticos e tema
  const equippedTitle = account.equippedTitle ? TITLES_CATALOG[account.equippedTitle] : null;
  const themeKey = account.equippedTheme && THEME_PALETTES[account.equippedTheme] ? account.equippedTheme : 'default';
  const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.default;
  const themeColor = palette.color;

  let bioText = isEn
    ? 'Exploring the cosmic realms and stars of Pyxie...'
    : 'Viajando pelas estrelas e reinos da Pyxie...';
  if (account.bio && account.bio.trim()) {
    bioText = sanitizeCardText(account.bio.trim(), 85);
  } else if (equippedTitle?.desc) {
    bioText = sanitizeCardText(equippedTitle.desc, 85);
  }

  // Módulo de Tarot
  const tarotStats = getAlbumStats(userId, lang);
  const userAlbum = getUserAlbum(userId);
  const discoveredCards = tarotStats.discoveredCount || 0;
  const discoveredPct = tarotStats.percent || 0;
  const achievementsClaimed = tarotStats.claimedCount || 0;

  let soulArcana = isEn ? 'None (Draw in /py-tarot)' : 'Nenhuma (Tire em /py-tarot)';
  if (userAlbum.discoveredCards && userAlbum.discoveredCards.length > 0) {
    const lastCardNum = userAlbum.discoveredCards[userAlbum.discoveredCards.length - 1];
    const cardData = getCardByNumber(lastCardNum);
    if (cardData) {
      soulArcana = `${cardData.num} - ${isEn ? (cardData.nameEn || cardData.name) : cardData.name}`;
    }
  }

  // Módulo de Casamento
  let marriage = null;
  try {
    marriage = marriageManager.getMarriage(userId);
  } catch (_) {}

  const isMarried = Boolean(marriage);
  let spouseName = isEn ? 'Single' : 'Solteiro(a)';
  let lovePoints = 0;
  let marriageDays = 0;
  let childrenCount = 0;
  let sharedVault = 0;

  if (isMarried) {
    const spouseId = marriageManager.getSpouseId(userId);
    const spouseUser = client?.users?.cache?.get(spouseId);
    const rawSpouse = spouseUser ? (spouseUser.displayName || spouseUser.username) : (isEn ? 'Beloved Spouse' : 'Cônjuge');
    spouseName = sanitizeCardText(rawSpouse, 20);
    lovePoints = Math.round(marriage.lovePoints || 100);
    marriageDays = Math.max(1, Math.floor((Date.now() - (marriage.marriedAt || Date.now())) / (24 * 60 * 60 * 1000)));
    childrenCount = Array.isArray(marriage.children) ? marriage.children.length : 0;
    sharedVault = Number(marriage.sharedVaultCoins) || 0;
  }

  // Módulo do Museu 3D
  const museumArtsCount = getUserMuseumArtCount(userId);

  // Insígnias do aventureiro (com ícones SVG vetoriais nítidos)
  const badges = [];
  if (userId === '214153735281180673') badges.push({ iconSvg: iconCrown(14, '#facc15'), label: isEn ? 'Creator' : 'Criador' });
  if (rank?.position && rank.position <= 10) badges.push({ iconSvg: iconTrophy(14, '#fbbf24'), label: isEn ? 'Top 10 Wealth' : 'Top 10 Riqueza' });
  if (discoveredCards >= 78) badges.push({ iconSvg: iconCrystalBall(14, '#c084fc'), label: isEn ? 'Master of 78' : 'Mestre dos 78' });
  else if (discoveredCards >= 22) badges.push({ iconSvg: iconCrystalBall(14, '#c084fc'), label: isEn ? 'Major Arcana' : 'Arcanos Maiores' });
  if (isMarried && lovePoints >= 90) badges.push({ iconSvg: iconRing(14, '#f43f5e'), label: isEn ? 'Eternal Love' : 'Amor Eterno' });
  if (workCount >= 30) badges.push({ iconSvg: iconBriefcase(14, '#60a5fa'), label: isEn ? 'Veteran Worker' : 'Veterano' });
  if (museumArtsCount > 0) badges.push({ iconSvg: iconPalette(14, '#67e8f9'), label: isEn ? `Artist (${museumArtsCount})` : `Artista (${museumArtsCount})` });
  if (badges.length === 0) badges.push({ iconSvg: iconSparkle(14, themeColor), label: isEn ? 'Novice Adventurer' : 'Aventureiro Iniciante' });

  // Construção declarativa da árvore Satori
  const cardNode = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '675px',
        backgroundColor: '#090812',
        backgroundImage: palette.bgGradient,
        color: '#ffffff',
        fontFamily: 'Quicksand',
        padding: '28px',
        border: `3px solid ${themeColor}`,
        borderRadius: '28px',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
        boxShadow: `0 0 45px ${themeColor}44, inset 0 0 25px ${themeColor}15`,
      },
      children: [
        // 1. Topo: Brasão da Comunidade Hospedeira (Valorização do Servidor)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: palette.headerBg,
              border: `1px solid ${palette.headerBorder}`,
              borderRadius: '16px',
              padding: '10px 18px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '12px' },
                  children: [
                    guildIconBase64
                      ? {
                          type: 'img',
                          props: {
                            src: guildIconBase64,
                            style: {
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: `1.5px solid ${themeColor}`,
                            },
                          },
                        }
                      : {
                          type: 'div',
                          props: {
                            style: {
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: `${themeColor}25`,
                              border: `1.5px solid ${themeColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            children: [iconCastle(18, themeColor)],
                          },
                        },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#e2e8f0',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                        },
                        children: `${isEn ? 'REGISTERED IN' : 'REGISTRADO EM'}: ${guildName.toUpperCase()} • ID: ${guildId}`,
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '13px',
                    color: palette.accentText,
                    backgroundColor: `${themeColor}22`,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${themeColor}66`,
                    fontWeight: 'bold',
                  },
                  children: `ID: ${userId}`,
                },
              },
            ],
          },
        },

        // 2. Cabeçalho de Perfil: Avatar + Nome + Título Real + Citação
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '24px', margin: '4px 0' },
            children: [
              // Avatar com borda temática e glow
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '112px',
                    height: '112px',
                    borderRadius: '56px',
                    border: `3px solid ${themeColor}`,
                    boxShadow: palette.avatarShadow,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#181824',
                    padding: '3px',
                    background: palette.avatarRing,
                  },
                  children: avatarBase64
                    ? [
                        {
                          type: 'img',
                          props: {
                            src: avatarBase64,
                            style: { width: '100%', height: '100%', borderRadius: '52px' },
                          },
                        },
                      ]
                    : [
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
                            children: [iconSparkle(42, themeColor)],
                          },
                        },
                      ],
                },
              },

              // Identificação do Usuário
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', flex: 1 },
                  children: [
                    // Prestige Title Banner (Destaque do Título Equipado)
                    equippedTitle
                      ? {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: palette.titleBg,
                              border: `1.5px solid ${palette.titleBorder}`,
                              padding: '4px 14px',
                              borderRadius: '20px',
                              boxShadow: `0 0 15px ${themeColor}44`,
                              marginBottom: '6px',
                              alignSelf: 'flex-start',
                            },
                            children: [
                              iconCrown(14, themeColor),
                              {
                                type: 'span',
                                props: {
                                  style: {
                                    fontSize: '13px',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                  },
                                  children: sanitizeCardText(equippedTitle.name, 35),
                                },
                              },
                            ],
                          },
                        }
                      : null,

                    // Nome em destaque
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Cinzel',
                          fontSize: '32px',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                          textShadow: `0 0 20px ${themeColor}66`,
                        },
                        children: `✦ ${displayName}`,
                      },
                    },

                    // Citação / Biografia
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#cbd5e1',
                          fontStyle: 'italic',
                          marginTop: '4px',
                          marginBottom: '8px',
                        },
                        children: `« ${bioText} »`,
                      },
                    },

                    // Métricas Rápidas de Carreira
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', gap: '12px', fontSize: '13px', color: '#94a3b8' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                padding: '4px 10px',
                                borderRadius: '8px',
                              },
                              children: [
                                iconBriefcase(14, '#60a5fa'),
                                {
                                  type: 'span',
                                  props: { children: `${professionLabel} (Nv. ${professionLevel})` },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                padding: '4px 10px',
                                borderRadius: '8px',
                              },
                              children: [
                                iconTrophy(14, '#fbbf24'),
                                {
                                  type: 'span',
                                  props: { children: rankStr },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                padding: '4px 10px',
                                borderRadius: '8px',
                              },
                              children: [
                                iconHammer(14, '#94a3b8'),
                                {
                                  type: 'span',
                                  props: { children: `${workCount} ${isEn ? 'Shifts' : 'Expedientes'}` },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ].filter(Boolean),
                },
              },
            ],
          },
        },

        // 3. Os 3 Pilares Centrais em Cards Elegantes com Cores Temáticas
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '18px', width: '100%' },
            children: [
              // Coluna 1: Patrimônio & Economia
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: palette.boxBg,
                    border: `1px solid ${palette.boxBorder}`,
                    borderRadius: '16px',
                    padding: '16px 18px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px',
                        },
                        children: [
                          iconCoin(18, '#fbbf24'),
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '15px',
                                color: '#fbbf24',
                                fontWeight: 'bold',
                              },
                              children: isEn ? 'WEALTH & ECONOMY' : 'PATRIMÔNIO & ECONOMIA',
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                        children: `• ${formatCoins(coins, lang)}`,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '15px', color: '#f1f5f9' },
                              children: `• ${magicBeans.toLocaleString(isEn ? 'en-US' : 'pt-BR')} ${isEn ? 'Magic Beans' : 'Feijões Mágicos'}`,
                            },
                          },
                          iconBean(14, '#10b981'),
                        ],
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13px', color: '#94a3b8' },
                        children: `• ${isEn ? 'Dedication' : 'Dedicação'}: ${workCount >= 50 ? 'Master' : workCount >= 20 ? 'Veteran' : 'Novice'}`,
                      },
                    },
                  ],
                },
              },

              // Coluna 2: Matrimônio & Família
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: palette.boxBg,
                    border: `1px solid ${palette.boxBorder}`,
                    borderRadius: '16px',
                    padding: '16px 18px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px',
                        },
                        children: [
                          iconRing(18, '#f43f5e'),
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '15px',
                                color: '#f43f5e',
                                fontWeight: 'bold',
                              },
                              children: isEn ? 'FAMILY & ROMANCE' : 'MATRIMÔNIO & FAMÍLIA',
                            },
                          },
                        ],
                      },
                    },
                    isMarried
                      ? {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column' },
                            children: [
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                                  children: `• ${isEn ? 'Spouse' : 'Cônjuge'}: ${spouseName}`,
                                },
                              },
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '13px', color: '#fb7185', marginBottom: '6px' },
                                  children: `• ${isEn ? 'Love' : 'Amor'}: ${buildProgressBar(lovePoints)}`,
                                },
                              },
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' },
                                  children: [
                                    {
                                      type: 'span',
                                      props: { children: `• ${marriageDays} ${isEn ? 'days' : 'dias'} •` },
                                    },
                                    iconBaby(13, '#fb7185'),
                                    {
                                      type: 'span',
                                      props: { children: `${childrenCount} ${isEn ? 'Children' : 'Filho(s)'}` },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        }
                      : {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column' },
                            children: [
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                                  children: `• ${isEn ? 'Status: Single' : 'Status: Solteiro(a)'}`,
                                },
                              },
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' },
                                  children: `• ${isEn ? 'Propose with /py-marriage' : 'Proposta via /py-marriage'}`,
                                },
                              },
                            ],
                          },
                        },
                  ],
                },
              },

              // Coluna 3: Tarot Místico & Grimório
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: palette.boxBg,
                    border: `1px solid ${palette.boxBorder}`,
                    borderRadius: '16px',
                    padding: '16px 18px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px',
                        },
                        children: [
                          iconCrystalBall(18, '#c084fc'),
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '15px',
                                color: '#c084fc',
                                fontWeight: 'bold',
                              },
                              children: isEn ? 'MYSTIC TAROT ALBUM' : 'ÁLBUM DE TAROT',
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                        children: `• ${discoveredCards}/78 ${isEn ? 'Cards' : 'Arcanos'} (${discoveredPct}%)`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                        children: `• ${achievementsClaimed}/10 ${isEn ? 'Achievements' : 'Conquistas'}`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13px', color: palette.accentText, fontStyle: 'italic' },
                        children: `• ${isEn ? 'Soul Arcana' : 'Alma Arcana'}: ${soulArcana}`,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 4. Faixa de Insígnias e Museu 3D
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: palette.boxBg,
              borderRadius: '12px',
              padding: '10px 16px',
              border: `1px solid ${palette.boxBorder}`,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '8px' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13px', color: '#a1a1aa', fontWeight: 'bold' },
                        children: `${isEn ? 'BADGES' : 'INSÍGNIAS'}:`,
                      },
                    },
                    ...badges.map((b) => ({
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          backgroundColor: palette.badgeBg,
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${palette.badgeBorder}`,
                        },
                        children: [
                          b.iconSvg,
                          {
                            type: 'span',
                            props: { children: b.label },
                          },
                        ],
                      },
                    })),
                  ],
                },
              },
              museumArtsCount > 0
                ? {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#67e8f9',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(103, 232, 249, 0.12)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(103, 232, 249, 0.3)',
                      },
                      children: [
                        iconPalette(15, '#67e8f9'),
                        {
                          type: 'span',
                          props: {
                            children: `${museumArtsCount} ${isEn ? 'Arts in 3D Museum' : 'Obras no Museu 3D'}`,
                          },
                        },
                      ],
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },

        // 5. Rodapé Honeypot de Divulgação
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${palette.boxBorder}`,
              paddingTop: '10px',
              fontSize: '13px',
              color: '#94a3b8',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { letterSpacing: '0.3px' },
                  children: `✦ Pyxie • pyxie.com.br • ${isEn ? 'The Magical Discord Bot' : 'O Bot Mágico do Discord'}`,
                },
              },
              {
                type: 'span',
                props: {
                  style: { color: palette.accentText, fontWeight: 'bold' },
                  children: isEn ? 'Generate yours with /py-profile' : 'Gere o seu com /py-profile',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(cardNode, {
    width: 1200,
    height: 675,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

module.exports = {
  generateProfileCard,
  sanitizeCardText,
  THEME_PALETTES,
};
