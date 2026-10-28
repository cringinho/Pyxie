const fs = require('fs');
const path = require('path');
const satori = require('satori').default || require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { getUserAccount, getUserRank, getTitleDefinition } = require('./economy');
const { TITLE_STYLES } = require('../utils/fancyText');
const { getAlbumStats, getUserAlbum } = require('./tarotAlbumService');
const marriageManager = require('../modules/marriage/marriageManager');
const professions = require('./professions');
const { getLanguage, t } = require('../utils/i18n');
const { readJson } = require('../utils/atomicJson');
const { getEmojiDataUri } = require('../utils/twemoji');
const { THEME_DESIGNS, getThemeDesign, normalizeProfileStyle } = require('./profileStyle');

// Card em retrato 4:5: ocupa a largura inteira da tela no celular e mantém o texto legível
const CARD_WIDTH = 960;
const CARD_HEIGHT = 1200;
const BANNER_HEIGHT = 440;
const OWNER_ID = '214153735281180673';

// =========================================================================
// Fontes (leitura única em disco)
// =========================================================================

let _fonts = null;

function loadFonts() {
  if (_fonts) return _fonts;
  const dir = path.join(__dirname, '..', '..', 'assets', 'fonts');
  _fonts = [
    { name: 'Quicksand', data: fs.readFileSync(path.join(dir, 'Quicksand-Bold.ttf')), weight: 700, style: 'normal' },
    { name: 'Cinzel', data: fs.readFileSync(path.join(dir, 'Cinzel-700.ttf')), weight: 700, style: 'normal' },
    // Fallback amplo (setas, dingbats, grego, cirílico): evita quadradinhos em nomes e títulos
    { name: 'DejaVu', data: fs.readFileSync(path.join(dir, 'DejaVuSans-Bold.ttf')), weight: 700, style: 'normal' },
  ];
  return _fonts;
}

// Satori pede emojis e glifos ausentes sob demanda
async function loadAdditionalAsset(languageCode, segment) {
  if (languageCode === 'emoji') return getEmojiDataUri(segment);
  return [];
}

// =========================================================================
// Imagens externas (avatar e ícone da guilda) com cache curto
// =========================================================================

const imageBase64Cache = new Map();
require('./memoryGuard').onPressure(() => imageBase64Cache.clear());
const CACHE_TTL_MS = 10 * 60 * 1000;

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
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/png';
    const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;

    if (imageBase64Cache.size > 200) {
      imageBase64Cache.delete(imageBase64Cache.keys().next().value);
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

// =========================================================================
// Texto
// =========================================================================

function convertEnclosedLetters(str) {
  return str.replace(/[\uD83C][\uDD00-\uDDFF]/g, (char) => {
    const code = char.codePointAt(0);
    if (code >= 0x1F130 && code <= 0x1F149) return String.fromCharCode(code - 0x1F130 + 65);
    if (code >= 0x1F150 && code <= 0x1F169) return String.fromCharCode(code - 0x1F150 + 65);
    if (code >= 0x1F170 && code <= 0x1F189) return String.fromCharCode(code - 0x1F170 + 65);
    return char;
  });
}

function truncate(text, maxLength) {
  const chars = [...text];
  return chars.length > maxLength ? `${chars.slice(0, maxLength - 1).join('')}…` : text;
}

/**
 * Versão texto puro (sem emojis), usada onde não há renderização de imagem de emoji.
 */
function sanitizeCardText(str, maxLength = 35) {
  if (!str || typeof str !== 'string') return '';
  let text = convertEnclosedLetters(str).normalize('NFKD');
  text = text.replace(/[\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|‍/gu, '');
  text = text.replace(/\s+/g, ' ').trim();
  return truncate(text, maxLength);
}

/**
 * Prepara texto para o card mantendo emojis (renderizados como Twemoji):
 * letras estilizadas (𝑪, 🅲) viram ASCII e acentos são recompostos.
 */
function prepareCardText(str, maxLength = 35) {
  if (!str || typeof str !== 'string') return '';
  let text = convertEnclosedLetters(str);
  // NFKD só em letras matemáticas estilizadas, preservando emojis e sequências ZWJ
  text = text.replace(/[\u{1D400}-\u{1D7FF}]/gu, (ch) => ch.normalize('NFKD')).normalize('NFC');
  text = text.replace(/\s+/g, ' ').trim();
  return truncate(text, maxLength);
}

function formatNumber(n, lang) {
  return Number(n || 0).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR');
}

// =========================================================================
// Ícones SVG
// =========================================================================

function createSvg(children, size) {
  return {
    type: 'svg',
    props: { width: String(size), height: String(size), viewBox: '0 0 24 24', fill: 'none', style: { display: 'flex', flexShrink: 0 }, children },
  };
}

const ICONS = {
  coin: (s, c) => createSvg([
    { type: 'circle', props: { cx: '12', cy: '12', r: '9', stroke: c, strokeWidth: '2', fill: c, fillOpacity: '0.18' } },
    { type: 'path', props: { d: 'M12 7v10M9.5 9.5h5a1 1 0 0 1 0 2h-5a1 1 0 0 0 0 2h5', stroke: c, strokeWidth: '1.6' } },
  ], s),
  bean: (s, c) => createSvg([
    { type: 'path', props: { d: 'M7 3C4 3 2 6 2 11c0 6 3 10 9 10 5 0 11-4 11-10 0-5-3-8-8-8-2 0-3 1-5 1-1 0-1-1-2-1z', stroke: c, strokeWidth: '1.8', fill: c, fillOpacity: '0.3' } },
    { type: 'path', props: { d: 'M7 7c1-2 3-3 6-3', stroke: c, strokeWidth: '1.6', strokeLinecap: 'round' } },
  ], s),
  trophy: (s, c) => createSvg([
    { type: 'path', props: { d: 'M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2', stroke: c, strokeWidth: '2' } },
    { type: 'path', props: { d: 'M6 3h12v7a6 6 0 0 1-12 0V3z', stroke: c, strokeWidth: '2', fill: c, fillOpacity: '0.2' } },
    { type: 'path', props: { d: 'M12 16v3M8 21h8', stroke: c, strokeWidth: '2', strokeLinecap: 'round' } },
  ], s),
  briefcase: (s, c) => createSvg([
    { type: 'rect', props: { x: '2', y: '7', width: '20', height: '14', rx: '2', stroke: c, strokeWidth: '2', fill: c, fillOpacity: '0.15' } },
    { type: 'path', props: { d: 'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 12h20', stroke: c, strokeWidth: '1.8' } },
  ], s),
  crystal: (s, c) => createSvg([
    { type: 'circle', props: { cx: '12', cy: '10', r: '7', stroke: c, strokeWidth: '2', fill: c, fillOpacity: '0.2' } },
    { type: 'path', props: { d: 'M8 21h8M9 17l-2 4M15 17l2 4M10 7a3 3 0 0 1 3 3', stroke: c, strokeWidth: '1.8', strokeLinecap: 'round' } },
  ], s),
  hammer: (s, c) => createSvg([
    { type: 'path', props: { d: 'M15 3l6 6-3 3-6-6 3-3zM9 12l-6 6a1.5 1.5 0 0 0 2.1 2.1l6-6', stroke: c, strokeWidth: '1.8', strokeLinecap: 'round' } },
  ], s),
  flame: (s, c) => createSvg([
    { type: 'path', props: { d: 'M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z', stroke: c, strokeWidth: '1.8', fill: c, fillOpacity: '0.25', strokeLinejoin: 'round' } },
  ], s),
  palette: (s, c) => createSvg([
    { type: 'path', props: { d: 'M12 3a9 9 0 0 0-9 9c0 3.6 2.4 5.5 4.5 5.5.9 0 1.5-.7 1.5-1.5 0-.6.3-1.2.9-1.5.5-.3 1.1-.4 1.8-.4 4.5 0 8.3-3.6 8.3-8.1 0-4.4-3.6-8-8-8z', stroke: c, strokeWidth: '1.8', fill: c, fillOpacity: '0.15' } },
    { type: 'circle', props: { cx: '7.5', cy: '10.5', r: '1.2', fill: c } },
    { type: 'circle', props: { cx: '11', cy: '7.5', r: '1.2', fill: c } },
    { type: 'circle', props: { cx: '15', cy: '8.5', r: '1.2', fill: c } },
  ], s),
  ring: (s, c) => createSvg([
    { type: 'circle', props: { cx: '9', cy: '13', r: '6', stroke: c, strokeWidth: '2', fill: c, fillOpacity: '0.12' } },
    { type: 'circle', props: { cx: '15', cy: '13', r: '6', stroke: c, strokeWidth: '2' } },
    { type: 'path', props: { d: 'M9 5l1.5 2h-3L9 5z', fill: c } },
  ], s),
  crown: (s, c) => createSvg([
    { type: 'path', props: { d: 'M2 19h20M4 19l2-11 5 6 5-6 2 11H4z', stroke: c, strokeWidth: '2', fill: c, fillOpacity: '0.22', strokeLinejoin: 'round' } },
  ], s),
  sparkle: (s, c) => createSvg([
    { type: 'path', props: { d: 'M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z', stroke: c, strokeWidth: '1.8', fill: c, fillOpacity: '0.25' } },
  ], s),
};

// =========================================================================
// Arte do banner por tema (SVG gerado, determinístico por usuário)
// =========================================================================

function seededRandom(seedText) {
  let h = 1779033703 ^ String(seedText).length;
  for (const ch of String(seedText)) {
    h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const n2 = (v) => Number(v).toFixed(1);

function blob(cx, cy, r, color, opacity, id) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

function patternBody(design, rnd, W, H) {
  const { accent, accent2, mode } = design;
  const light = mode === 'light';
  const ink = light ? accent : '#ffffff';
  const parts = [];

  switch (design.pattern) {
    case 'stars': {
      for (let i = 0; i < 160; i++) {
        parts.push(`<circle cx="${n2(rnd() * W)}" cy="${n2(rnd() * H)}" r="${n2(0.6 + rnd() * 1.8)}" fill="#fff" opacity="${n2(0.25 + rnd() * 0.7)}"/>`);
      }
      for (let i = 0; i < 7; i++) {
        const x = rnd() * W, y = rnd() * H * 0.8, s = 6 + rnd() * 10;
        parts.push(`<path d="M${n2(x)} ${n2(y - s)} L${n2(x + s * 0.25)} ${n2(y - s * 0.25)} L${n2(x + s)} ${n2(y)} L${n2(x + s * 0.25)} ${n2(y + s * 0.25)} L${n2(x)} ${n2(y + s)} L${n2(x - s * 0.25)} ${n2(y + s * 0.25)} L${n2(x - s)} ${n2(y)} L${n2(x - s * 0.25)} ${n2(y - s * 0.25)}Z" fill="${i % 2 ? accent : accent2}" opacity="0.9"/>`);
      }
      break;
    }
    case 'petals': {
      for (let i = 0; i < 30; i++) {
        const x = rnd() * W, y = rnd() * H * 0.9, rot = rnd() * 360, s = 8 + rnd() * 12;
        const fill = [accent, accent2, light ? '#ffffff' : '#ffd1e6'][i % 3];
        parts.push(`<ellipse cx="${n2(x)}" cy="${n2(y)}" rx="${n2(s)}" ry="${n2(s * 0.5)}" fill="${fill}" opacity="${n2(0.35 + rnd() * 0.5)}" transform="rotate(${n2(rot)} ${n2(x)} ${n2(y)})"/>`);
      }
      break;
    }
    case 'rays': {
      const ox = W * 0.82, oy = -60;
      for (let i = 0; i < 26; i++) {
        const a1 = (Math.PI * (0.35 + i * 0.03)), a2 = a1 + 0.012;
        const L = 1400;
        parts.push(`<path d="M${ox} ${oy} L${n2(ox - Math.cos(a1) * L)} ${n2(oy + Math.sin(a1) * L)} L${n2(ox - Math.cos(a2) * L)} ${n2(oy + Math.sin(a2) * L)}Z" fill="${i % 2 ? accent : accent2}" opacity="${n2(0.06 + rnd() * 0.12)}"/>`);
      }
      for (let i = 0; i < 40; i++) {
        parts.push(`<circle cx="${n2(rnd() * W)}" cy="${n2(rnd() * H)}" r="${n2(1 + rnd() * 2.5)}" fill="${accent}" opacity="${n2(0.3 + rnd() * 0.6)}"/>`);
      }
      break;
    }
    case 'leaves': {
      for (let i = 0; i < 22; i++) {
        const x = rnd() * W, y = rnd() * H * 0.85, rot = rnd() * 360, s = 22 + rnd() * 30;
        parts.push(`<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(rot)})" opacity="${n2(0.25 + rnd() * 0.45)}"><path d="M0 0 Q${n2(s * 0.6)} ${n2(-s * 0.5)} ${n2(s * 1.4)} 0 Q${n2(s * 0.6)} ${n2(s * 0.5)} 0 0Z" fill="${i % 2 ? accent : accent2}"/><path d="M0 0 L${n2(s * 1.3)} 0" stroke="${light ? '#ffffff' : '#022c22'}" stroke-width="1.4"/></g>`);
      }
      break;
    }
    case 'grid': {
      const vx = W / 2, vy = H * 0.42;
      for (let i = -12; i <= 12; i++) {
        parts.push(`<line x1="${vx}" y1="${vy}" x2="${n2(vx + i * 90)}" y2="${H}" stroke="${accent}" stroke-width="1.6" opacity="0.55"/>`);
      }
      for (let k = 1; k <= 9; k++) {
        const y = vy + (H - vy) * Math.pow(k / 9, 1.8);
        parts.push(`<line x1="0" y1="${n2(y)}" x2="${W}" y2="${n2(y)}" stroke="${accent2}" stroke-width="1.4" opacity="${n2(0.25 + k * 0.05)}"/>`);
      }
      parts.push(`<rect x="0" y="${n2(vy - 2)}" width="${W}" height="3" fill="${accent2}" opacity="0.9"/>`);
      break;
    }
    case 'embers': {
      for (let i = 0; i < 90; i++) {
        const r = 1 + rnd() * 3.5;
        parts.push(`<circle cx="${n2(rnd() * W)}" cy="${n2(H * 0.15 + rnd() * H * 0.85)}" r="${n2(r)}" fill="${rnd() > 0.5 ? accent : '#fde047'}" opacity="${n2(0.35 + rnd() * 0.6)}"/>`);
      }
      break;
    }
    case 'crystals': {
      for (let i = 0; i < 16; i++) {
        const x = rnd() * W, y = rnd() * H * 0.85, s = 20 + rnd() * 50, rot = rnd() * 180;
        parts.push(`<polygon points="0,${n2(-s)} ${n2(s * 0.45)},${n2(-s * 0.2)} ${n2(s * 0.3)},${n2(s * 0.7)} ${n2(-s * 0.3)},${n2(s * 0.7)} ${n2(-s * 0.45)},${n2(-s * 0.2)}" transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(rot)})" fill="${i % 2 ? accent : accent2}" fill-opacity="${n2(0.12 + rnd() * 0.22)}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.2"/>`);
      }
      break;
    }
    case 'aurora': {
      for (let i = 0; i < 90; i++) {
        parts.push(`<circle cx="${n2(rnd() * W)}" cy="${n2(rnd() * H * 0.6)}" r="${n2(0.6 + rnd() * 1.4)}" fill="#fff" opacity="${n2(0.2 + rnd() * 0.6)}"/>`);
      }
      const bands = [[accent, 120], [accent2, 190], ['#22d3ee', 250]];
      bands.forEach(([color, y0], idx) => {
        let d = `M0 ${y0}`;
        for (let x = 0; x <= W; x += 80) d += ` Q${x + 40} ${n2(y0 - 40 + rnd() * 80)} ${x + 80} ${n2(y0 - 20 + rnd() * 40)}`;
        d += ` L${W} ${y0 + 140} L0 ${y0 + 140}Z`;
        parts.push(`<linearGradient id="ab${idx}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.65"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient><path d="${d}" fill="url(#ab${idx})" filter="url(#soft)"/>`);
      });
      break;
    }
    case 'sunset': {
      const cx = W / 2, cy = H * 0.5, r = 170;
      parts.push(`<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent2}"/><stop offset="1" stop-color="${accent}"/></linearGradient><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sun)"/>`);
      for (let k = 0; k < 6; k++) {
        parts.push(`<rect x="${cx - r}" y="${n2(cy + 10 + k * 26)}" width="${r * 2}" height="${n2(4 + k * 2.4)}" fill="${design.bg[1]}"/>`);
      }
      const vy = H * 0.72;
      parts.push(`<rect x="0" y="${n2(vy)}" width="${W}" height="${n2(H - vy)}" fill="${design.bg[0]}"/>`);
      for (let i = -14; i <= 14; i++) parts.push(`<line x1="${cx}" y1="${n2(vy)}" x2="${n2(cx + i * 80)}" y2="${H}" stroke="${accent}" stroke-width="1.5" opacity="0.7"/>`);
      for (let k = 1; k <= 6; k++) parts.push(`<line x1="0" y1="${n2(vy + (H - vy) * Math.pow(k / 6, 1.7))}" x2="${W}" y2="${n2(vy + (H - vy) * Math.pow(k / 6, 1.7))}" stroke="${accent}" stroke-width="1.4" opacity="0.6"/>`);
      break;
    }
    case 'dots': {
      for (let y = 20; y < H; y += 30) {
        for (let x = 20; x < W; x += 30) {
          parts.push(`<circle cx="${x}" cy="${y}" r="2.6" fill="${accent}" opacity="${n2(0.12 + rnd() * 0.2)}"/>`);
        }
      }
      break;
    }
    case 'lines': {
      for (let x = -H; x < W; x += 22) {
        parts.push(`<line x1="${x}" y1="0" x2="${x + H}" y2="${H}" stroke="#ffffff" stroke-width="1" opacity="0.08"/>`);
      }
      parts.push(`<circle cx="${W * 0.78}" cy="${H * 0.35}" r="150" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.35"/><circle cx="${W * 0.78}" cy="${H * 0.35}" r="110" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.2"/>`);
      break;
    }
    case 'pixels': {
      const size = 24;
      const palette = [accent, accent2, '#60a5fa', '#34d399'];
      for (let y = 0; y < H * 0.75; y += size) {
        for (let x = 0; x < W; x += size) {
          if (rnd() < 0.22 * (1 - y / H)) {
            parts.push(`<rect x="${x}" y="${y}" width="${size - 3}" height="${size - 3}" fill="${palette[Math.floor(rnd() * palette.length)]}" opacity="${n2(0.3 + rnd() * 0.55)}"/>`);
          }
        }
      }
      break;
    }
    default:
      break;
  }

  return { parts: parts.join(''), ink };
}

function buildBannerSvg(design, seed) {
  const W = CARD_WIDTH;
  const H = BANNER_HEIGHT;
  const rnd = seededRandom(seed);
  const { parts } = patternBody(design, rnd, W, H);
  const base = design.bg[0];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
<linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${design.bg[1]}"/><stop offset="1" stop-color="${base}"/></linearGradient>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.5" stop-color="${base}" stop-opacity="0"/><stop offset="1" stop-color="${base}" stop-opacity="1"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
${blob(W * 0.2, H * 0.25, 320, design.accent, design.mode === 'light' ? 0.25 : 0.45, 'g1')}
${blob(W * 0.85, H * 0.6, 300, design.accent2, design.mode === 'light' ? 0.22 : 0.4, 'g2')}
${parts}
<rect width="${W}" height="${H}" fill="url(#fade)"/>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// =========================================================================
// Paletas derivadas (compatibilidade com consumidores antigos)
// =========================================================================

const THEME_PALETTES = Object.fromEntries(
  Object.entries(THEME_DESIGNS).map(([id, d]) => [
    id,
    {
      color: d.accent,
      mode: d.mode,
      bgGradient: `linear-gradient(180deg, ${d.bg[1]} 0%, ${d.bg[0]} 45%, ${d.bg[2]} 100%)`,
      avatarRing: `linear-gradient(135deg, ${d.accent} 0%, ${d.accent2} 100%)`,
      titleBg: `linear-gradient(90deg, ${d.accent}40 0%, ${d.accent2}26 100%)`,
      accentText: d.accent,
    },
  ])
);

function buildTokens(design, layout) {
  const light = design.mode === 'light';
  const text = light ? '#1f2937' : '#f8fafc';
  const muted = light ? '#6b7280' : '#a8a3b8';
  const base = {
    text,
    muted,
    accent: design.accent,
    accent2: design.accent2,
    track: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)',
    chipBg: light ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.35)',
    chipBorder: light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.14)',
    iconBg: `${design.accent}26`,
  };

  if (layout === 'neon') {
    return {
      ...base,
      panel: {
        backgroundColor: light ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.28)',
        border: `2px solid ${design.accent}`,
        borderRadius: '22px',
        boxShadow: `0 0 22px ${design.accent}66`,
      },
    };
  }
  if (layout === 'minimal') {
    return {
      ...base,
      panel: {
        borderLeft: `5px solid ${design.accent}`,
        borderRadius: '4px',
      },
    };
  }
  return {
    ...base,
    panel: {
      backgroundColor: light ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.06)',
      border: `1.5px solid ${light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.13)'}`,
      borderRadius: '28px',
    },
  };
}

// =========================================================================
// Blocos do card
// =========================================================================

function div(style, children) {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}

function text(content, style) {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children: content } };
}

function img(src, size, style = {}) {
  return { type: 'img', props: { src, width: size, height: size, style: { width: `${size}px`, height: `${size}px`, ...style } } };
}

function buildAvatar({ avatarBase64, initial, frame, tokens }) {
  const size = 196;
  const radius = frame === 'squircle' ? '56px' : '50%';
  const inner = avatarBase64
    ? img(avatarBase64, size, { borderRadius: radius, objectFit: 'cover' })
    : div({ width: `${size}px`, height: `${size}px`, borderRadius: radius, backgroundColor: tokens.accent, alignItems: 'center', justifyContent: 'center' }, [
      text(initial, { fontSize: '88px', color: '#ffffff', fontFamily: 'Cinzel' }),
    ]);

  const ring = div({
    padding: '8px',
    borderRadius: frame === 'squircle' ? '64px' : '50%',
    backgroundImage: `linear-gradient(135deg, ${tokens.accent} 0%, ${tokens.accent2} 100%)`,
    boxShadow: `0 0 34px ${tokens.accent}88`,
  }, [inner]);

  if (frame !== 'halo') return ring;
  return div({
    padding: '8px',
    borderRadius: '50%',
    border: `3px solid ${tokens.accent2}`,
    boxShadow: `0 0 60px ${tokens.accent}cc`,
  }, [ring]);
}

function buildStatTile(stat, tokens) {
  return div({
    ...tokens.panel,
    width: '424px',
    height: '132px',
    padding: '18px 22px',
    alignItems: 'center',
    gap: '20px',
  }, [
    div({ width: '68px', height: '68px', borderRadius: '20px', backgroundColor: tokens.iconBg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, [
      stat.icon(38, tokens.accent),
    ]),
    div({ flexDirection: 'column', gap: '2px', overflow: 'hidden' }, [
      text(stat.label.toUpperCase(), { fontSize: '19px', color: tokens.muted, letterSpacing: '1px' }),
      text(stat.value, { fontSize: '38px', color: tokens.text, lineHeight: 1.15 }),
      ...(stat.sub ? [text(stat.sub, { fontSize: '19px', color: tokens.muted })] : []),
    ]),
  ]);
}

function buildProgress(label, valueText, pct, tokens) {
  const clamped = Math.max(0, Math.min(100, pct));
  return div({ flexDirection: 'column', gap: '10px', width: '100%' }, [
    div({ justifyContent: 'space-between', width: '100%' }, [
      text(label, { fontSize: '22px', color: tokens.muted }),
      text(valueText, { fontSize: '22px', color: tokens.text }),
    ]),
    div({ width: '100%', height: '16px', borderRadius: '8px', backgroundColor: tokens.track }, [
      div({
        width: `${Math.max(clamped, 2)}%`,
        height: '16px',
        borderRadius: '8px',
        backgroundImage: `linear-gradient(90deg, ${tokens.accent} 0%, ${tokens.accent2} 100%)`,
      }, []),
    ]),
  ]);
}

function buildChip(children, tokens, extra = {}) {
  return div({
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    borderRadius: '999px',
    backgroundColor: tokens.chipBg,
    border: `1.5px solid ${tokens.chipBorder}`,
    ...extra,
  }, children);
}

// =========================================================================
// Geração
// =========================================================================

/**
 * Gera o card de perfil (960x1200, retrato) via Satori + Resvg.
 * `overrides` permite pré-visualizar tema/estilo sem salvar (Estúdio do Perfil).
 */
async function generateProfileCard({ targetUser, guild, source = null, client = null, overrides = null }) {
  // Disjuntor de memória: sob pressão o perfil sai só em texto (quem chama já trata o null).
  if (require('./memoryGuard').isUnderPressure()) return null;
  const lang = getLanguage(source);
  const fonts = loadFonts();
  const tr = (key, rep) => t(`profileCard.${key}`, source, rep);

  const userId = targetUser.id;
  const account = getUserAccount(userId);
  const style = normalizeProfileStyle({ ...account.profileStyle, ...(overrides?.style || {}) });
  const themeId = overrides?.theme || account.equippedTheme || 'default';
  const design = getThemeDesign(themeId);
  const tokens = buildTokens(design, style.layout);

  // Identidade
  const rawName = targetUser.displayName || targetUser.globalName || targetUser.username || 'Pyxie';
  const displayName = prepareCardText(rawName, 22) || 'Pyxie';
  const initial = sanitizeCardText(rawName, 2).slice(0, 1).toUpperCase() || 'P';
  const avatarUrl = typeof targetUser.displayAvatarURL === 'function'
    ? targetUser.displayAvatarURL({ extension: 'png', size: 256 })
    : null;
  const guildName = guild?.name ? prepareCardText(guild.name, 28) : tr('dm');
  const guildIconUrl = guild?.iconURL ? guild.iconURL({ extension: 'png', size: 128 }) : null;

  // Títulos de conquista usam o nome comum no cartão (a fonte não tem os alfabetos especiais)
  // e ganham um selo com as cores do estilo.
  const equippedTitle = getTitleDefinition(account.equippedTitle, lang);
  const titleStyle = equippedTitle?.style ? TITLE_STYLES[equippedTitle.style] : null;

  const [avatarBase64, guildIconBase64, stickerUri, titleEmojiUri] = await Promise.all([
    fetchImageBase64(avatarUrl),
    fetchImageBase64(guildIconUrl),
    style.sticker !== 'none' ? getEmojiDataUri(style.sticker) : Promise.resolve(null),
    equippedTitle?.emoji ? getEmojiDataUri(equippedTitle.emoji) : Promise.resolve(null),
  ]);

  // Dados
  const rank = getUserRank(userId);
  const workCount = Number(account.workCount) || 0;
  const level = Math.max(1, Math.floor(workCount / 5) + 1);
  const professionKey = account.profession;
  const professionLabel = professionKey
    ? (t(`profession.labels.${professionKey}`, source) || professions[professionKey]?.label || professionKey)
    : tr('no_profession');

  const tarotStats = getAlbumStats(userId, lang);
  const discovered = tarotStats.discoveredCount || 0;
  getUserAlbum(userId);

  let marriage = null;
  try {
    marriage = marriageManager.getMarriage(userId);
  } catch (_) {}
  const marriageDays = marriage
    ? Math.max(1, Math.floor((Date.now() - (marriage.marriedAt || Date.now())) / 86400000))
    : 0;
  const museumCount = getUserMuseumArtCount(userId);

  const bio = account.bio && account.bio.trim()
    ? prepareCardText(account.bio.trim(), 110)
    : (equippedTitle?.desc ? prepareCardText(equippedTitle.desc, 110) : tr('bio_default'));

  const STAT_DEFS = {
    coins: { icon: ICONS.coin, label: tr('stat_coins'), value: formatNumber(account.coins, lang) },
    beans: { icon: ICONS.bean, label: tr('stat_beans'), value: formatNumber(account.magicBeans, lang) },
    rank: { icon: ICONS.trophy, label: tr('stat_rank'), value: rank?.position ? `#${rank.position}` : tr('unranked') },
    level: { icon: ICONS.briefcase, label: tr('stat_level'), value: tr('level_value', { level }), sub: prepareCardText(professionLabel, 22) },
    tarot: { icon: ICONS.crystal, label: tr('stat_tarot'), value: `${discovered}/78` },
    works: { icon: ICONS.hammer, label: tr('stat_works'), value: formatNumber(workCount, lang) },
    streak: { icon: ICONS.flame, label: tr('stat_streak'), value: tr(Number(account.dailyStreak) === 1 ? 'streak_value_one' : 'streak_value', { days: Number(account.dailyStreak) || 0 }) },
    museum: { icon: ICONS.palette, label: tr('stat_museum'), value: tr('museum_value', { count: museumCount }) },
    love: { icon: ICONS.ring, label: tr('stat_love'), value: marriage ? tr('married_value', { days: marriageDays }) : tr('single') },
  };
  const showcase = style.showcase.map((key) => STAT_DEFS[key]).filter(Boolean);

  // Insígnias
  const badges = [];
  if (userId === OWNER_ID) badges.push({ icon: ICONS.crown, label: tr('badge_creator') });
  if (rank?.position && rank.position <= 10) badges.push({ icon: ICONS.trophy, label: tr('badge_top10') });
  if (discovered >= 78) badges.push({ icon: ICONS.crystal, label: tr('badge_master78') });
  else if (discovered >= 22) badges.push({ icon: ICONS.crystal, label: tr('badge_major') });
  if (marriage && (marriage.lovePoints || 0) >= 90) badges.push({ icon: ICONS.ring, label: tr('badge_love') });
  if (workCount >= 30) badges.push({ icon: ICONS.briefcase, label: tr('badge_veteran') });
  if (museumCount > 0) badges.push({ icon: ICONS.palette, label: tr('badge_artist', { count: museumCount }) });
  if (!badges.length) badges.push({ icon: ICONS.sparkle, label: tr('badge_novice') });

  // Árvore Satori
  const header = div({ position: 'absolute', top: '32px', left: '40px', right: '40px', justifyContent: 'space-between', alignItems: 'center' }, [
    buildChip([
      guildIconBase64
        ? img(guildIconBase64, 40, { borderRadius: '12px' })
        : div({ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: tokens.iconBg, alignItems: 'center', justifyContent: 'center' }, [ICONS.sparkle(24, tokens.accent)]),
      text(guildName, { fontSize: '24px', color: tokens.text }),
    ], tokens, { padding: '8px 22px 8px 8px' }),
    buildChip([
      ICONS.trophy(26, tokens.accent),
      text(rank?.position ? `#${rank.position}` : tr('unranked'), { fontSize: '24px', color: tokens.text }),
    ], tokens),
  ]);

  const nameSize = [...displayName].length > 15 ? '46px' : '56px';
  const identity = div({ alignItems: 'flex-end', gap: '30px', width: '100%' }, [
    buildAvatar({ avatarBase64, initial, frame: style.frame, tokens }),
    div({ flexDirection: 'column', gap: '14px', paddingBottom: '12px', flex: 1, overflow: 'hidden' }, [
      text(displayName, { fontFamily: 'Cinzel', fontSize: nameSize, color: tokens.text, lineHeight: 1.1 }),
      equippedTitle
        ? buildChip([
          ...(titleEmojiUri ? [img(titleEmojiUri, 28)] : []),
          text(prepareCardText(equippedTitle.name, 26), { fontSize: '24px', color: tokens.text }),
        ], tokens, titleStyle
          ? {
            backgroundImage: `linear-gradient(90deg, ${titleStyle.colors[0]} 0%, ${titleStyle.colors[1]} 100%)`,
            border: `2px solid ${titleStyle.colors[1]}`,
            boxShadow: `0 0 18px ${titleStyle.colors[1]}`,
            alignSelf: 'flex-start',
          }
          : { backgroundImage: `linear-gradient(90deg, ${tokens.accent}55 0%, ${tokens.accent2}33 100%)`, alignSelf: 'flex-start' })
        : text(prepareCardText(professionLabel, 26), { fontSize: '24px', color: tokens.muted }),
    ]),
  ]);

  const bioBlock = div({ ...tokens.panel, padding: '22px 30px', width: '100%' }, [
    text(`“${bio}”`, { fontSize: '27px', color: tokens.text, lineHeight: 1.4 }),
  ]);

  const grid = div({ flexWrap: 'wrap', gap: '22px', width: '100%' }, showcase.map((s) => buildStatTile(s, tokens)));

  const careerPct = ((workCount % 5) / 5) * 100;
  const progress = div({ ...tokens.panel, flexDirection: 'column', gap: '20px', padding: '24px 30px', width: '100%' }, [
    buildProgress(tr('bar_tarot'), `${discovered}/78`, (discovered / 78) * 100, tokens),
    buildProgress(`${tr('bar_career')} • ${tr('level_value', { level: level + 1 })}`, `${workCount % 5}/5`, careerPct, tokens),
  ]);

  const badgesRow = div({ flexWrap: 'wrap', gap: '14px', width: '100%' }, badges.slice(0, 4).map((b) =>
    buildChip([b.icon(24, tokens.accent), text(b.label, { fontSize: '21px', color: tokens.text })], tokens)
  ));

  // Rodapé no fluxo da coluna: nunca sobrepõe as insígnias
  const footer = div({ marginTop: 'auto', width: '100%', justifyContent: 'space-between', alignItems: 'center' }, [
    text('pyxie.com.br', { fontSize: '21px', color: tokens.accent }),
    text(tr('footer_cta'), { fontSize: '21px', color: tokens.muted }),
  ]);

  const children = [
    img(buildBannerSvg(design, `${userId}:${themeId}`), CARD_WIDTH, { position: 'absolute', top: '0px', left: '0px', width: `${CARD_WIDTH}px`, height: `${BANNER_HEIGHT}px` }),
    header,
  ];
  if (stickerUri) {
    children.push(img(stickerUri, 150, { position: 'absolute', top: '130px', right: '64px' }));
  }
  children.push(
    div({ position: 'absolute', top: '232px', bottom: '26px', left: '44px', right: '44px', flexDirection: 'column', gap: '20px' }, [
      identity,
      bioBlock,
      grid,
      progress,
      badgesRow,
      footer,
    ])
  );

  const cardNode = div({
    position: 'relative',
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
    backgroundImage: `linear-gradient(180deg, ${design.bg[1]} 0%, ${design.bg[0]} 40%, ${design.bg[2]} 100%)`,
    fontFamily: 'Quicksand, DejaVu',
    color: tokens.text,
  }, children);

  const svg = await satori(cardNode, { width: CARD_WIDTH, height: CARD_HEIGHT, fonts, loadAdditionalAsset });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: CARD_WIDTH } });
  return resvg.render().asPng();
}

module.exports = {
  generateProfileCard,
  sanitizeCardText,
  prepareCardText,
  buildBannerSvg,
  THEME_PALETTES,
  CARD_WIDTH,
  CARD_HEIGHT,
};
