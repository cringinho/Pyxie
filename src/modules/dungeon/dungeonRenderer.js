const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { ensureCanvasFonts, withEmojiFallback, EMOJI_FONT_FAMILY } = require('../../utils/canvasFonts');
const { getEmoji } = require('../../utils/appEmojis');
const engine = require('./dungeonEngine');
const { CHARMS, ENEMIES } = require('./dungeonData');

/**
 * Renderizador pixel art das Catacumbas de Veludo ("fofo e sombrio").
 *
 * - 800x640, pensado para o celular: o Discord mostra a imagem com ~340px de largura,
 *   então todo texto tem no mínimo 24px e contorno escuro para contraste.
 * - Inimigos, chefe, ícones e bênçãos usam os Application Emojis do próprio bot (catálogo do
 *   Developer Portal): arquivo empacotado em assets/dungeon/emojis (scripts/sync_dungeon_emojis.js),
 *   senão a CDN do Discord, e só em último caso o glifo Twemoji de reserva.
 * - Emojis do bot, o Astaroth e as poses da Pyxie são desenhados na arte original com escala
 *   suave (bordas antisserrilhadas); sprites escuros ganham um brilho lilás macio para não
 *   sumirem no fundo. A Pyxie heroína (pyxie_pixelart.png), os baús e os glifos de reserva
 *   seguem em pixel art, ampliados sem suavização.
 * - Os assets da Pyxie e do Astaroth vêm de assets/pyxie, com o recorte corrigido por
 *   scripts/clean_pyxie_assets.js.
 * - Nenhuma palavra fixa: todo texto humano chega pronto (localizado) em `options.text`.
 */

ensureCanvasFonts();

const RENDER_WIDTH = 800;
const RENDER_HEIGHT = 640;
const HUD_HEIGHT = 96;
const SCENE_TOP = HUD_HEIGHT;
const FLOOR_Y = 474;
const ASSET_DIR = path.join(__dirname, '..', '..', '..', 'assets', 'pyxie');
const EMOJI_DIRS = [path.join(ASSET_DIR, 'emojis'), path.join(__dirname, '..', '..', '..', 'assets', 'dungeon', 'emojis')];
const CDN_TIMEOUT_MS = 3000;
const CDN_RETRY_MS = 10 * 60 * 1000;
const DARK_OUTLINE = '#c9b3f2';

const INK = '#0d0714';
const UI = {
  text: '#fff7ff',
  muted: '#e3d4f5',
  hp: '#ff4f8b',
  hpBack: '#3b1328',
  poison: '#8fe36b',
  spark: '#d6b4ff',
  sparkEmpty: '#3a2a52',
  light: '#ffc061',
  lightBack: '#2d1d0e',
  danger: '#ff5c7a',
  gold: '#ffd166',
  heal: '#6cf2a0',
  block: '#8ecbff',
};

// 🪽 não existe na fonte Twemoji embarcada
const GLYPH_OVERRIDES = { '🪽': '🛡️' };

// Ícones da cena: [Application Emoji do bot, glifo de reserva]
const ICONS = {
  heart: ['9909pixelheart', '❤️'],
  candle: ['6942burningcandle', '🕯️'],
  candles: ['2101candle', '🕯️'],
  coin: ['goldcoin', '🪙'],
  coins: ['shineygoldcoinsi', '💰'],
  potion: ['44332darkpotion', '🧪'],
  poison: ['4422bottledpoison', '🧪'],
  key: ['38632pinkkey', '🗝️'],
  shield: ['badge_brick_wall_shield', '🛡️'],
  gem: ['206204pixeldiamond', '💎'],
  sparkle: ['8881shootingstars', '✨'],
  moon: ['984953pixelmoon', '🌙'],
  pool: ['8144bluecrystalmoon', '⛲'],
  lock: ['xtaken', '🔒'],
  fire: ['purpleflame', '🔥'],
  grave: ['914694pixelheadstone', '🪦'],
  crown: ['293484crown', '👑'],
  merchant: ['603398pixelcat', '🐈‍⬛'],
  knife: ['54416purplepixelknife', '🗡️'],
  knives: ['77510cyanpixelknife', '⚔️'],
  bomb: ['bomb', '💥'],
  web: ['9130heartweb', '🕸️'],
  heal: ['37775purplecrystalheart', '💚'],
  chest: ['54187box', '🧰'],
  trap: [null, '⚠️'],
  alert: [null, '❗'],
  done: [null, '✅'],
  crit: [null, '💥'],
  miss: [null, '💨'],
};

const ROOM_ICONS = {
  start: 'sparkle',
  monster: 'knife',
  treasure: 'gem',
  merchant: 'merchant',
  shrine: 'moon',
  shrine_used: 'moon',
  fountain: 'pool',
  chest: 'chest',
  trap: 'trap',
  grave: 'grave',
};

const INTENT_ICONS = {
  attack: 'knife',
  heavy: 'bomb',
  multi: 'knives',
  drain: 'candle',
  poison: 'poison',
  steal: 'coins',
  web: 'web',
  charge: 'fire',
  defend: 'shield',
  heal: 'heal',
};

const MERCHANT_ICONS = { potion: 'potion', candle: 'candle', key: 'key' };

const ASSETS = {
  pyxie: 'pyxie_pixelart.png',
  pyxieSitting: 'emojis/pyxie_sitting.png',
  pyxieVictory: 'emojis/pyxie_pose_victory.png',
  pyxieSad: 'emojis/pyxie_sad_face.png',
  pyxieShowing: 'emojis/pyxie_exibiting.png',
  astaroth_happy: 'emojis/astaroth_happy.png',
  astaroth_serious: 'emojis/astaroth_serious.png',
  astaroth_angry: 'emojis/astaroth_angry.png',
  astaroth_sad: 'emojis/astaroth_sad.png',
  astaroth_sleeping: 'emojis/astaroth_sleeping.png',
  astaroth_laugh: 'emojis/astaroth_laugh.png',
  astaroth_surprised: 'emojis/astaroth_surprised.png',
  astaroth_smug: 'emojis/astaroth_smug.png',
  astaroth_curious: 'emojis/astaroth_curious.png',
  astaroth_power: 'emojis/astaroth_power.png',
};

// Baús em pixel art desenhados à mão (o 🧰 do Twemoji parece caixa de ferramentas)
const CHEST_ART = [
  '..KKKKKKKKKKKKKK..',
  '.KLLLLLLLLLLLLLLK.',
  'KLWWWWWWWWWWWWWWLK',
  'KWWWWWWWWWWWWWWWWK',
  'KBBBBBBBBBBBBBBBBK',
  'KGGGGGGKKKKGGGGGGK',
  'KggggggKYYKggggggK',
  'KWWWWWWKYYKWWWWWWK',
  'KWWWWWWWKKWWWWWWWK',
  'KWWWWWWWWWWWWWWWWK',
  'KBWWWWWWWWWWWWWWBK',
  'KGGGGGGGGGGGGGGGGK',
  'KggggggggggggggggK',
  '.KKKKKKKKKKKKKKKK.',
];
const MIMIC_ART = [
  '..KKKKKKKKKKKKKK..',
  '.KLLLLLLLLLLLLLLK.',
  'KLWWRRWWWWWWRRWWLK',
  'KWWWRRWWWWWWRRWWWK',
  'KGGGGGGGGGGGGGGGGK',
  'KTTKTTKTTKTTKTTKTK',
  'KMMMMMMPPPPMMMMMMK',
  'KTKTTKTTKTTKTTKTTK',
  'KGGGGGGGGGGGGGGGGK',
  'KWWWWWWWWWWWWWWWWK',
  'KBWWWWWWWWWWWWWWBK',
  'KGGGGGGGGGGGGGGGGK',
  'KggggggggggggggggK',
  '.KKKKKKKKKKKKKKKK.',
];
// Fantasias do Festival (/py-festival): chapéu desenhado por cima dos monstros fantasiados
const FESTIVAL_HATS = {
  halloween: {
    rows: ['.......KK.......', '......KPPK......', '.....KPPPK......', '.....KPPPPK.....', '....KPPPPPK.....', '....KPOOOOPK....', '...KPPPPPPPPK...', 'KKKPPPPPPPPPPKKK', 'KPPPPPPPPPPPPPPK', '.KKKKKKKKKKKKKK.'],
    colors: { K: '#1a0d12', P: '#6b2fa0', O: '#f97316' },
  },
  christmas: {
    rows: ['............WW..', '..........KWWWK.', '.........KRRWK..', '.......KKRRRK...', '.....KKRRRRRK...', '....KRRRRRRRRK..', '...KRRRRRRRRRK..', '..KWWWWWWWWWWWWK', '..KWWWWWWWWWWWWK', '...KKKKKKKKKKKK.'],
    colors: { K: '#1a0d12', R: '#dc2626', W: '#f8fafc' },
  },
  easter: {
    rows: ['..KK........KK..', '.KWWK......KWWK.', '.KWPK......KPWK.', '.KWPK......KPWK.', '.KWPK......KPWK.', '.KWPK......KPWK.', '..KWPK....KPWK..', '..KWWKKKKKKWWK..', '...KWWWWWWWWK...', '....KKKKKKKK....'],
    colors: { K: '#1a0d12', W: '#f8fafc', P: '#f9a8d4' },
  },
  newyear: {
    rows: ['.......YY.......', '......KYYK......', '......KGVK......', '.....KGVVGK.....', '.....KVVGGK.....', '....KGGVVGGK....', '....KVVGGVVK....', '...KGGVVGGVVK...', '...KKKKKKKKKK...'],
    colors: { K: '#1a0d12', Y: '#fde047', G: '#eab308', V: '#8b5cf6' },
  },
  summer: {
    rows: ['.....KKKKKK.....', '....KYYYYYYK....', '...KYYYYYYYYK...', '...KRRRRRRRRK...', 'KKKYYYYYYYYYYKKK', 'KYYYYYYYYYYYYYYK', '.KKKKKKKKKKKKKK.'],
    colors: { K: '#1a0d12', Y: '#fcd34d', R: '#06b6d4' },
  },
};

/** Fração da altura do sprite acima do primeiro pixel visível (para o chapéu assentar na cabeça). */
function opaqueTopRatio(sprite) {
  if (!sprite) return 0;
  if (sprite.opaqueTop !== undefined) return sprite.opaqueTop;
  let ratio = 0;
  try {
    const data = sprite.getContext('2d').getImageData(0, 0, sprite.width, sprite.height).data;
    outer: for (let y = 0; y < sprite.height; y++) {
      for (let x = 0; x < sprite.width; x++) {
        if (data[(y * sprite.width + x) * 4 + 3] > 40) {
          ratio = y / sprite.height;
          break outer;
        }
      }
    }
  } catch (_) {}
  sprite.opaqueTop = ratio;
  return ratio;
}

function festivalHat(season) {
  const hat = FESTIVAL_HATS[season];
  return hat ? pixelArtSprite(`hat_${season}`, hat.rows, hat.colors) : null;
}

const CHEST_COLORS = {
  wood: { K: '#1a0d12', L: '#c98a4b', W: '#9a5a2b', B: '#5e3418', G: '#ffcf4a', g: '#c48a1a', Y: '#fff1a8', R: '#ff2b55', T: '#fff7ff', M: '#3a0610', P: '#ff6fa0' },
  velvet: { K: '#1a0d12', L: '#b98be0', W: '#7a3fa8', B: '#4a2068', G: '#ffd76a', g: '#c99422', Y: '#fff1a8', R: '#ff2b55', T: '#fff7ff', M: '#3a0610', P: '#ff6fa0' },
};

const imageCache = new Map();
const spriteCache = new Map();
require('../../services/memoryGuard').onPressure(() => {
  imageCache.clear();
  spriteCache.clear();
});
const emojiImages = new Map(); // ref -> { img, failedAt }
let assetsReady = null;

// ---------------------------------------------------------------- utilidades de cor e texto
function hexToRgb(hex) {
  const clean = String(hex || '#000000').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0');
  const num = parseInt(full.slice(0, 6), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const c = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(a.r, b.r)}${c(a.g, b.g)}${c(a.b, b.b)}`;
}

/** Ruído determinístico por coordenada, para texturas que não "tremem" entre quadros. */
function hash(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function font(size, weight = 'bold') {
  return withEmojiFallback(`${weight} ${size}px sans-serif`);
}

function str(value) {
  return value === undefined || value === null ? '' : String(value);
}

/** Reduz a fonte até caber (mínimo 24px) e corta com reticências se ainda assim não couber. */
function fitText(ctx, text, maxWidth, size, minSize = 24) {
  let current = size;
  ctx.font = font(current);
  while (current > minSize && ctx.measureText(text).width > maxWidth) {
    current -= 2;
    ctx.font = font(current);
  }
  let output = text;
  if (ctx.measureText(output).width > maxWidth) {
    while (output.length > 1 && ctx.measureText(`${output}…`).width > maxWidth) output = output.slice(0, -1);
    output = `${output.trimEnd()}…`;
  }
  return { text: output, size: current };
}

function drawText(ctx, text, x, y, { size = 28, color = UI.text, align = 'left', maxWidth = 0, stroke = INK, strokeWidth = 6, baseline = 'middle' } = {}) {
  const content = str(text);
  if (!content) return 0;
  const fitted = maxWidth > 0 ? fitText(ctx, content, maxWidth, size) : { text: content, size };
  ctx.font = font(fitted.size);
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineJoin = 'round';
  if (stroke && strokeWidth > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(fitted.text, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(fitted.text, x, y);
  return ctx.measureText(fitted.text).width;
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = str(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function glow(ctx, x, y, radius, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

// ---------------------------------------------------------------- sprites
async function loadAssets() {
  if (!assetsReady) {
    assetsReady = Promise.all(
      Object.entries(ASSETS).map(async ([key, rel]) => {
        try {
          imageCache.set(key, await loadImage(path.join(ASSET_DIR, rel)));
        } catch (err) {
          console.warn(`[dungeonRenderer] Asset ausente (${rel}):`, err.message);
          imageCache.set(key, null);
        }
      })
    );
  }
  return assetsReady;
}

/** Nome e ID do Application Emoji a partir de uma chave do appEmojis.js ou do nome no catálogo. */
function resolveEmojiRef(ref) {
  if (!ref) return null;
  const match = /^<a?:([\w~]+):(\d+)>$/.exec(String(getEmoji(ref) || ''));
  return match ? { name: match[1], id: match[2] } : null;
}

/** Todos os emojis do bot que a cena pode desenhar (ícones, inimigos e bênçãos). */
function listEmojiRefs() {
  const refs = new Set();
  for (const [ref] of Object.values(ICONS)) if (ref) refs.add(ref);
  for (const def of Object.values(ENEMIES)) {
    if (def.sprite) refs.add(def.sprite);
    if (def.phase2Sprite) refs.add(def.phase2Sprite);
  }
  for (const charm of Object.values(CHARMS)) if (charm.emoji) refs.add(charm.emoji);
  return [...refs];
}

async function fetchEmojiFromCdn(id) {
  if (typeof fetch !== 'function') return null;
  try {
    const res = await fetch(`https://cdn.discordapp.com/emojis/${id}.png?size=128`, { signal: AbortSignal.timeout(CDN_TIMEOUT_MS) });
    if (!res.ok) return null;
    return await loadImage(Buffer.from(await res.arrayBuffer()));
  } catch (_) {
    return null;
  }
}

/** Arquivo local (assets da Pyxie ou pacote da dungeon), senão a CDN do Discord. */
async function loadEmojiImage(ref) {
  const cached = emojiImages.get(ref);
  if (cached && (cached.img || Date.now() - cached.failedAt < CDN_RETRY_MS)) return cached.img;
  const info = resolveEmojiRef(ref);
  let img = null;
  if (info) {
    for (const dir of EMOJI_DIRS) {
      const file = path.join(dir, `${info.name}.png`);
      if (!fs.existsSync(file)) continue;
      try {
        img = await loadImage(file);
        break;
      } catch (_) {}
    }
    if (!img) img = await fetchEmojiFromCdn(info.id);
  }
  emojiImages.set(ref, { img, failedAt: img ? 0 : Date.now() });
  return img;
}

function ensureEmojis() {
  return Promise.all(listEmojiRefs().map((ref) => loadEmojiImage(ref)));
}

/** Limiar de alfa + contorno de 1px: deixa as bordas nítidas como pixel art. */
function crispen(canvas, outlineColor) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const d = image.data;
  let lumSum = 0;
  let count = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 110) {
      d[i + 3] = 255;
      lumSum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      count++;
    } else {
      d[i + 3] = 0;
    }
  }
  if (outlineColor !== null) {
    const isDarkSprite = count > 0 && lumSum / count < 0.22;
    const { r, g, b } = hexToRgb(outlineColor || (isDarkSprite ? DARK_OUTLINE : INK));
    const opaque = new Uint8Array(width * height);
    for (let p = 0; p < width * height; p++) opaque[p] = d[p * 4 + 3] === 255 ? 1 : 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        if (opaque[p]) continue;
        const near =
          (x > 0 && opaque[p - 1]) ||
          (x < width - 1 && opaque[p + 1]) ||
          (y > 0 && opaque[p - width]) ||
          (y < height - 1 && opaque[p + width]);
        if (near) {
          d[p * 4] = r;
          d[p * 4 + 1] = g;
          d[p * 4 + 2] = b;
          d[p * 4 + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Emoji pixelado (cacheado). `size` é a resolução nativa do sprite em pixels. */
function glyphSprite(glyph, size = 22, outlineColor) {
  const resolved = GLYPH_OVERRIDES[glyph] || glyph || '❔';
  const key = `g:${resolved}:${size}:${outlineColor}`;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const dim = size + 4;
  const canvas = createCanvas(dim, dim);
  const ctx = canvas.getContext('2d');
  ctx.font = `${size - 2}px ${EMOJI_FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(resolved, dim / 2, dim / 2 + 1);
  crispen(canvas, outlineColor);
  spriteCache.set(key, canvas);
  return canvas;
}

/** Application Emoji do bot pixelado para `size` px (lado maior); sem imagem, usa o glifo de reserva. */
function emojiSprite(ref, size, fallbackGlyph, outlineColor) {
  const entry = ref ? emojiImages.get(ref) : null;
  if (!entry || !entry.img) return glyphSprite(fallbackGlyph, size, outlineColor);
  return smoothSource(`e:${ref}`, entry.img);
}

/** Arte original pronta para escala suave; sprites escuros recebem `glow` lilás. */
function smoothSource(key, img) {
  if (spriteCache.has(key)) return spriteCache.get(key);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, img.width, img.height).data;
  let lumSum = 0;
  let count = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue;
    lumSum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
    count++;
  }
  canvas.smooth = true;
  canvas.glow = count > 0 && lumSum / count < 0.22 ? DARK_OUTLINE : null;
  spriteCache.set(key, canvas);
  return canvas;
}

/** Ícone da tabela ICONS no tamanho pedido. */
function icon(name, size = 18, outlineColor) {
  const [ref, glyph] = ICONS[name] || [null, '❔'];
  return emojiSprite(ref, size, glyph, outlineColor);
}

function pixelArtSprite(key, rows, colors) {
  const cacheKey = `p:${key}`;
  if (spriteCache.has(cacheKey)) return spriteCache.get(cacheKey);
  const w = Math.max(...rows.map((r) => r.length));
  const canvas = createCanvas(w, rows.length);
  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = colors[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  spriteCache.set(cacheKey, canvas);
  return canvas;
}

function chestSprite(kind = 'wood') {
  if (kind === 'mimic') return pixelArtSprite('mimic', MIMIC_ART, CHEST_COLORS.wood);
  return pixelArtSprite(`chest_${kind}`, CHEST_ART, CHEST_COLORS[kind] || CHEST_COLORS.wood);
}

function enemySprite(enemyId, def, phase2 = false) {
  if (enemyId === 'mimic') return chestSprite('mimic');
  const sprite = phase2 && def?.phase2Sprite ? def.phase2Sprite : def?.sprite;
  return emojiSprite(sprite, def?.boss ? 64 : def?.guardian ? 46 : 38, def?.glyph);
}

/** Asset oficial reduzido para `size` px (lado maior) e pronto para ampliar sem suavização. */
function assetSprite(name, size) {
  const key = `a:${name}:${size}`;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const img = imageCache.get(name);
  if (!img) return null;
  // Só a Pyxie heroína é pixel art de verdade; Astaroth e poses usam a arte com borda suave
  if (name !== 'pyxie') return smoothSource(`as:${name}`, img);
  const ratio = size / Math.max(img.width, img.height);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));
  const pad = name.startsWith('astaroth') ? 1 : 0;
  const canvas = createCanvas(w + pad * 2, h + pad * 2);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, pad, pad, w, h);
  crispen(canvas, name.startsWith('astaroth') ? DARK_OUTLINE : null);
  spriteCache.set(key, canvas);
  return canvas;
}

/** Tamanho final: escala livre e suave para arte original, inteira para pixel art. */
function spriteSize(sprite, targetHeight) {
  const scale = sprite.smooth ? targetHeight / sprite.height : Math.max(1, Math.round(targetHeight / sprite.height));
  return { w: Math.round(sprite.width * scale), h: Math.round(sprite.height * scale) };
}

/** Desenha um sprite ancorado pelo centro horizontal e pela base. */
function drawSprite(ctx, sprite, cx, bottom, targetHeight, { alpha = 1 } = {}) {
  if (!sprite) return { w: 0, h: 0 };
  const { w, h } = spriteSize(sprite, targetHeight);
  const x = Math.round(cx - w / 2);
  const y = Math.round(bottom - h);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (sprite.smooth) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (sprite.glow) {
      ctx.shadowColor = sprite.glow;
      ctx.shadowBlur = Math.max(6, Math.round(h * 0.06));
      ctx.drawImage(sprite, x, y, w, h);
      ctx.shadowBlur = 0;
    }
  } else {
    ctx.imageSmoothingEnabled = false;
  }
  ctx.drawImage(sprite, x, y, w, h);
  ctx.restore();
  return { w, h };
}

function drawSpriteCentered(ctx, sprite, cx, cy, targetHeight, options) {
  if (!sprite) return { w: 0, h: 0 };
  return drawSprite(ctx, sprite, cx, cy + spriteSize(sprite, targetHeight).h / 2, targetHeight, options);
}

function shadow(ctx, cx, y, w) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, y, w / 2, Math.max(6, w / 9), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- HUD
/** Marca discreta no canto: quem recebe o print encaminhado sabe de onde veio. */
function drawWatermark(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  drawText(ctx, 'pyxie.com.br', 12, RENDER_HEIGHT - 12, {
    size: 15,
    color: UI.text,
    align: 'left',
    baseline: 'bottom',
    strokeWidth: 4,
  });
  ctx.restore();
}

function drawHud(ctx, run, text, palette) {
  const p = run.player;
  const bg = ctx.createLinearGradient(0, 0, 0, HUD_HEIGHT);
  bg.addColorStop(0, '#22142f');
  bg.addColorStop(1, '#140b1d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, RENDER_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(0, HUD_HEIGHT - 4, RENDER_WIDTH, 4);

  // Selo do andar + nome
  const tag = str(text.floorTag) || `B${run.floor}`;
  ctx.font = font(26);
  const tagW = Math.max(64, ctx.measureText(tag).width + 28);
  roundRect(ctx, 14, 10, tagW, 40, 10);
  ctx.fillStyle = palette.accent;
  ctx.fill();
  drawText(ctx, tag, 14 + tagW / 2, 31, { size: 26, color: INK, align: 'center', stroke: null });

  // Contadores à direita: ouro, poções, chaves
  const counters = [
    { icon: 'key', value: p.keys },
    { icon: 'potion', value: p.potions },
    { icon: 'coin', value: p.gold, color: UI.gold },
  ];
  let right = RENDER_WIDTH - 14;
  for (const counter of counters) {
    ctx.font = font(28);
    const valueText = String(counter.value);
    const w = ctx.measureText(valueText).width;
    drawText(ctx, valueText, right, 31, { size: 28, color: counter.color || UI.text, align: 'right' });
    drawSpriteCentered(ctx, icon(counter.icon, 18), right - w - 22, 30, 36);
    right -= w + 62;
  }
  drawText(ctx, text.floorName, 28 + tagW, 31, { size: 26, color: UI.text, maxWidth: right - (28 + tagW) - 8 });

  // Vida
  const barY = 58;
  const hpX = 50;
  const hpW = 250;
  roundRect(ctx, hpX, barY, hpW, 28, 8);
  ctx.fillStyle = UI.hpBack;
  ctx.fill();
  const hpRatio = Math.max(0, Math.min(1, p.hp / Math.max(1, p.maxHp)));
  if (hpRatio > 0) {
    roundRect(ctx, hpX, barY, Math.max(16, hpW * hpRatio), 28, 8);
    ctx.fillStyle = p.poisonTurns > 0 ? UI.poison : UI.hp;
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(hpX + 6, barY + 4, Math.max(4, hpW * hpRatio - 12), 4);
  }
  drawText(ctx, text.hpLabel, hpX + 12, barY + 15, { size: 24, maxWidth: 110 });
  drawText(ctx, `${Math.max(0, p.hp)}/${p.maxHp}`, hpX + hpW - 10, barY + 15, { size: 24, align: 'right' });
  drawSpriteCentered(ctx, icon('heart', 18), 28, barY + 14, 40);

  // Brilho (pips em losango)
  let sx = 326;
  for (let i = 0; i < p.maxSpark; i++) {
    const filled = i < p.spark;
    ctx.save();
    ctx.translate(sx, barY + 14);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = filled ? UI.spark : UI.sparkEmpty;
    ctx.fillRect(-10, -10, 20, 20);
    ctx.lineWidth = 3;
    ctx.strokeStyle = filled ? '#ffffff' : '#6e5a8c';
    ctx.strokeRect(-10, -10, 20, 20);
    ctx.restore();
    sx += 34;
  }

  // Luz da vela
  const dark = engine.isDark(run);
  const lx = Math.max(sx + 26, 476);
  const lw = RENDER_WIDTH - 14 - lx;
  roundRect(ctx, lx, barY, lw, 28, 8);
  ctx.fillStyle = UI.lightBack;
  ctx.fill();
  const lightRatio = Math.max(0, Math.min(1, p.light / Math.max(1, p.maxLight)));
  if (lightRatio > 0) {
    roundRect(ctx, lx, barY, Math.max(16, lw * lightRatio), 28, 8);
    const lg = ctx.createLinearGradient(lx, 0, lx + lw, 0);
    lg.addColorStop(0, dark ? '#a31d3a' : '#ff8a3d');
    lg.addColorStop(1, dark ? UI.danger : UI.light);
    ctx.fillStyle = lg;
    ctx.fill();
  }
  drawText(ctx, text.lightLabel, lx + 38, barY + 15, { size: 24, maxWidth: lw - 130 });
  drawText(ctx, `${p.light}/${p.maxLight}`, lx + lw - 10, barY + 15, { size: 24, align: 'right' });
  drawSpriteCentered(ctx, icon('candle', 18), lx + 16, barY + 12, 40);
}

// ---------------------------------------------------------------- cenários
function drawBackdrop(ctx, palette, { dark = false, seed = 1, archX = 400, candles = [130, 670], candleY = 270 } = {}) {
  const wall = palette.wall;
  const g = ctx.createLinearGradient(0, SCENE_TOP, 0, FLOOR_Y);
  g.addColorStop(0, mix(wall, '#000000', 0.35));
  g.addColorStop(1, mix(wall, palette.floor, 0.5));
  ctx.fillStyle = g;
  ctx.fillRect(0, SCENE_TOP, RENDER_WIDTH, FLOOR_Y - SCENE_TOP);

  // Tijolos com variação de brilho
  const brickH = 30;
  const brickW = 66;
  for (let row = 0, y = SCENE_TOP; y < FLOOR_Y; row++, y += brickH) {
    const offset = row % 2 === 0 ? 0 : brickW / 2;
    for (let col = -1, x = -offset; x < RENDER_WIDTH; col++, x += brickW) {
      const n = hash(col, row, seed);
      const base = mix(mix(wall, palette.floor, 0.35), '#000000', 0.15 + n * 0.25);
      ctx.fillStyle = base;
      ctx.fillRect(x + 3, y + 3, brickW - 6, brickH - 6);
      ctx.fillStyle = rgba('#ffffff', 0.05 + n * 0.04);
      ctx.fillRect(x + 3, y + 3, brickW - 6, 4);
    }
  }

  // Arco escuro ao fundo, dá profundidade
  ctx.fillStyle = mix(wall, '#000000', 0.6);
  ctx.beginPath();
  ctx.moveTo(archX - 100, FLOOR_Y);
  ctx.lineTo(archX - 100, 300);
  ctx.quadraticCurveTo(archX, 190, archX + 100, 300);
  ctx.lineTo(archX + 100, FLOOR_Y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = mix(palette.accent, '#000000', 0.55);
  ctx.lineWidth = 8;
  ctx.stroke();

  // Chão em ladrilhos
  const fg = ctx.createLinearGradient(0, FLOOR_Y, 0, RENDER_HEIGHT);
  fg.addColorStop(0, mix(palette.floor, '#ffffff', 0.06));
  fg.addColorStop(1, mix(palette.floor, '#000000', 0.45));
  ctx.fillStyle = fg;
  ctx.fillRect(0, FLOOR_Y, RENDER_WIDTH, RENDER_HEIGHT - FLOOR_Y);
  ctx.fillStyle = rgba('#000000', 0.35);
  for (let x = 0; x < RENDER_WIDTH; x += 80) ctx.fillRect(x, FLOOR_Y, 4, RENDER_HEIGHT - FLOOR_Y);
  for (let y = FLOOR_Y + 40; y < RENDER_HEIGHT; y += 48) ctx.fillRect(0, y, RENDER_WIDTH, 4);
  ctx.fillStyle = rgba(palette.accent, 0.35);
  ctx.fillRect(0, FLOOR_Y, RENDER_WIDTH, 4);

  // Velas de parede (apagadas quando escurece)
  for (const cx of candles) {
    glow(ctx, cx, candleY - 32, dark ? 60 : 150, palette.glow, dark ? 0.12 : 0.38);
    drawSprite(ctx, icon('candle', 18), cx, candleY, 54, { alpha: dark ? 0.5 : 1 });
  }
}

function vignette(ctx, cx, cy, strength) {
  const g = ctx.createRadialGradient(cx, cy, 120, cx, cy, 620);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, SCENE_TOP, RENDER_WIDTH, RENDER_HEIGHT - SCENE_TOP);
}

function drawBanner(ctx, text, cx, y, { color = UI.text, accent = '#ff8fd6', size = 30, maxWidth = RENDER_WIDTH - 120, anchor = 'center' } = {}) {
  const content = str(text);
  if (!content) return;
  const fitted = fitText(ctx, content, maxWidth - 56, size);
  ctx.font = font(fitted.size);
  const w = ctx.measureText(fitted.text).width + 56;
  if (anchor === 'left') cx += w / 2;
  roundRect(ctx, cx - w / 2, y, w, 52, 26);
  ctx.fillStyle = 'rgba(13, 7, 20, 0.82)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = accent;
  ctx.stroke();
  drawText(ctx, fitted.text, cx, y + 27, { size: fitted.size, color, align: 'center', strokeWidth: 0 });
}

function astarothMood(run) {
  const p = run.player;
  if (run.phase === 'dead') return 'astaroth_sad';
  if (run.phase === 'victory') return 'astaroth_laugh';
  if (run.phase === 'extracted') return 'astaroth_smug';
  if (run.phase === 'camp') return 'astaroth_sleeping';
  if (run.phase === 'combat') {
    if (run.fx.some((f) => f.cat)) return 'astaroth_power';
    return p.hp <= p.maxHp * 0.35 ? 'astaroth_angry' : 'astaroth_serious';
  }
  if (run.phase === 'event') {
    if (run.event?.type === 'trap' || run.event?.sniffed) return 'astaroth_surprised';
    return 'astaroth_curious';
  }
  if (engine.isDark(run)) return 'astaroth_curious';
  return p.hp <= p.maxHp * 0.35 ? 'astaroth_sad' : 'astaroth_happy';
}

/** Chips numéricos dos efeitos da última ação (ouro, cura, dano) para cenas fora do combate. */
function drawFxChips(ctx, run, x, y) {
  const chips = [];
  for (const f of run.fx) {
    if (f.type === 'gold' && f.amount) chips.push({ sprite: icon('coin', 18), label: `+${f.amount}`, color: UI.gold });
    if (f.type === 'heal' && f.amount) chips.push({ sprite: icon('heal', 18), label: `+${f.amount}`, color: UI.heal });
    if (f.type === 'dmgPlayer' && f.amount) chips.push({ sprite: glyphSprite('💔', 18), label: `-${f.amount}`, color: UI.danger });
  }
  let cx = x;
  for (const chip of chips.slice(0, 4)) {
    ctx.font = font(28);
    const w = ctx.measureText(chip.label).width + 70;
    roundRect(ctx, cx, y, w, 48, 24);
    ctx.fillStyle = 'rgba(13, 7, 20, 0.85)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = chip.color;
    ctx.stroke();
    drawSpriteCentered(ctx, chip.sprite, cx + 26, y + 24, 36);
    drawText(ctx, chip.label, cx + 48, y + 25, { size: 28, color: chip.color });
    cx += w + 10;
  }
}

// ---------------------------------------------------------------- exploração
function drawStairs(ctx, cx, cy, size, palette) {
  const steps = 4;
  const stepW = size / steps;
  for (let i = 0; i < steps; i++) {
    const h = stepW * (i + 1);
    ctx.fillStyle = mix(palette.accent, '#000000', 0.15 + i * 0.12);
    ctx.fillRect(Math.round(cx - size / 2 + i * stepW), Math.round(cy + size / 2 - h), Math.ceil(stepW), Math.ceil(h));
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(Math.round(cx - size / 2), Math.round(cy - size / 2), Math.round(size), Math.round(size));
}

function drawExplore(ctx, run, text, palette) {
  const view = engine.getVisibleMap(run);
  const dark = engine.isDark(run);

  // Fundo: pedra escura com poeira estelar
  const bg = ctx.createLinearGradient(0, SCENE_TOP, 0, RENDER_HEIGHT);
  bg.addColorStop(0, mix(palette.wall, '#000000', 0.25));
  bg.addColorStop(1, mix(palette.wall, '#000000', 0.55));
  ctx.fillStyle = bg;
  ctx.fillRect(0, SCENE_TOP, RENDER_WIDTH, RENDER_HEIGHT - SCENE_TOP);
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(hash(i, 3, run.floor) * RENDER_WIDTH);
    const y = SCENE_TOP + Math.floor(hash(i, 7, run.floor) * (RENDER_HEIGHT - SCENE_TOP));
    ctx.fillStyle = rgba(palette.glow, 0.08 + hash(i, 11) * 0.12);
    ctx.fillRect(x, y, 4, 4);
  }

  const rooms = view.rooms;
  if (rooms.length === 0) return;
  const minX = Math.min(...rooms.map((r) => r.x));
  const maxX = Math.max(...rooms.map((r) => r.x));
  const minY = Math.min(...rooms.map((r) => r.y));
  const maxY = Math.max(...rooms.map((r) => r.y));
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const areaTop = SCENE_TOP + 16;
  const areaBottom = RENDER_HEIGHT - 76;
  const cell = Math.min(118, Math.floor(740 / cols), Math.floor((areaBottom - areaTop) / rows));
  const ox = Math.round((RENDER_WIDTH - cell * cols) / 2);
  const oy = Math.round(areaTop + (areaBottom - areaTop - cell * rows) / 2);
  const pad = Math.round(cell * 0.12);
  const tile = cell - pad * 2;
  const pos = (room) => ({ x: ox + (room.x - minX) * cell, y: oy + (room.y - minY) * cell });
  const byKey = new Map(rooms.map((r) => [r.key, r]));

  // Corredores entre salas vizinhas visíveis (o mapa é uma árvore: toda vizinhança é porta)
  const corridor = Math.max(14, Math.round(cell * 0.3));
  for (const room of rooms) {
    const a = pos(room);
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const other = byKey.get(`${room.x + dx},${room.y + dy}`);
      if (!other) continue;
      const lit = room.visited || other.visited;
      ctx.fillStyle = lit ? mix(palette.floor, palette.accent, 0.25) : mix(palette.floor, '#000000', 0.35);
      if (dx === 1) ctx.fillRect(a.x + cell - pad - 4, a.y + cell / 2 - corridor / 2, pad * 2 + 8, corridor);
      else ctx.fillRect(a.x + cell / 2 - corridor / 2, a.y + cell - pad - 4, corridor, pad * 2 + 8);
    }
  }

  let current = null;
  for (const room of rooms) {
    const { x, y } = pos(room);
    const tx = x + pad;
    const ty = y + pad;
    const isGuardian = room.display === 'guardian';
    const known = room.display !== 'unknown';
    if (room.current) {
      current = { x: tx + tile / 2, y: ty + tile / 2 };
      glow(ctx, current.x, current.y, cell * 1.1, palette.glow, dark ? 0.25 : 0.45);
    }

    // Ladrilho com chanfro em pixel
    const base = room.visited ? palette.floor : mix(palette.floor, '#000000', 0.45);
    roundRect(ctx, tx, ty, tile, tile, Math.max(6, tile * 0.12));
    ctx.fillStyle = base;
    ctx.fill();
    ctx.fillStyle = rgba('#ffffff', room.visited ? 0.12 : 0.05);
    ctx.fillRect(tx + 6, ty + 4, tile - 12, 5);
    ctx.fillStyle = rgba('#000000', 0.3);
    ctx.fillRect(tx + 6, ty + tile - 9, tile - 12, 5);
    for (let i = 0; i < 6; i++) {
      const px = tx + 8 + Math.floor(hash(room.x * 13 + i, room.y, run.floor) * (tile - 16));
      const py = ty + 10 + Math.floor(hash(room.y * 17 + i, room.x, run.floor) * (tile - 20));
      ctx.fillStyle = rgba('#000000', 0.18);
      ctx.fillRect(px, py, 4, 4);
    }
    ctx.lineWidth = room.current ? 5 : 3;
    ctx.strokeStyle = room.current ? palette.glow : isGuardian ? UI.danger : room.visited ? mix(palette.accent, '#000000', 0.35) : rgba(palette.accent, 0.35);
    roundRect(ctx, tx, ty, tile, tile, Math.max(6, tile * 0.12));
    ctx.stroke();

    const iconSize = Math.round(tile * 0.62);
    const cx = tx + tile / 2;
    const cy = ty + tile / 2;
    if (room.current) continue;
    if (!known) {
      drawText(ctx, '?', cx, cy + 2, { size: Math.max(28, Math.round(tile * 0.45)), color: rgba(UI.muted, 0.85), align: 'center' });
      continue;
    }
    if (room.display === 'stairs') {
      drawStairs(ctx, cx, cy, tile * 0.5, palette);
      continue;
    }
    if (room.display === 'cleared') {
      ctx.fillStyle = rgba(palette.accent, 0.3);
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
      continue;
    }
    const data = run.map.rooms[room.key];
    let iconSprite = icon(ROOM_ICONS[room.display] || 'sparkle', 20);
    if ((room.display === 'guardian' || (room.display === 'monster' && room.visited)) && data?.enemy) {
      const enemyDef = engine.getEnemyDef(data.enemy);
      iconSprite = emojiSprite(enemyDef?.sprite, 22, enemyDef?.glyph);
    }
    if (isGuardian) glow(ctx, cx, cy, tile * 0.6, UI.danger, 0.35);
    if (room.display === 'chest') iconSprite = chestSprite('wood');
    if (room.display === 'monster' && room.visited && data?.enemy === 'mimic') iconSprite = chestSprite('mimic');
    drawSpriteCentered(ctx, iconSprite, cx, cy, iconSize, { alpha: room.display === 'shrine_used' ? 0.4 : 1 });
  }

  // A Pyxie na sala atual
  if (current) {
    drawSprite(ctx, assetSprite('pyxie', 36), current.x, current.y + tile / 2 - 4, Math.round(tile * 0.95));
  }

  if (dark && current) vignette(ctx, current.x, current.y, 0.9);

  // Astaroth acompanhando no canto
  drawSprite(ctx, assetSprite(astarothMood(run), 30), RENDER_WIDTH - 62, RENDER_HEIGHT - 10, 90);
  drawFxChips(ctx, run, 16, RENDER_HEIGHT - 62);
  if (dark) drawBanner(ctx, text.darkWarning, RENDER_WIDTH / 2, RENDER_HEIGHT - 66, { color: '#ffd0d8', accent: UI.danger, size: 26 });
}

// ---------------------------------------------------------------- combate
function drawPopups(ctx, run, anchors) {
  const stacks = { enemy: 0, player: 0, top: 0 };
  const push = (target, draw) => {
    const anchor = anchors[target];
    if (!anchor) return;
    const y = anchor.y - stacks[target] * 54;
    stacks[target]++;
    draw(anchor.x, y);
  };
  for (const f of run.fx) {
    switch (f.type) {
      case 'dmgEnemy':
        push('enemy', (x, y) => {
          if (f.crit) drawSpriteCentered(ctx, icon('crit', 18), x - 70, y, 50);
          if (f.cat) drawSpriteCentered(ctx, assetSprite('astaroth_power', 18), x - 70, y, 44);
          drawText(ctx, `-${f.amount}${f.crit ? '!' : ''}`, x, y, { size: f.crit ? 52 : 44, color: f.crit ? UI.gold : f.spell ? '#c9a6ff' : '#ffffff', align: 'center', strokeWidth: 8 });
        });
        break;
      case 'enemyBlock':
        push('enemy', (x, y) => {
          drawSpriteCentered(ctx, icon('shield', 18), x - 40, y, 40);
          drawText(ctx, String(f.amount), x + 4, y, { size: 36, color: UI.block, strokeWidth: 7 });
        });
        break;
      case 'dmgPlayer':
        push('player', (x, y) => {
          if (f.poison) drawSpriteCentered(ctx, icon('poison', 18), x - 56, y, 40);
          drawText(ctx, `-${f.amount}`, x, y, { size: 44, color: f.poison ? UI.poison : UI.danger, align: 'center', strokeWidth: 8 });
        });
        break;
      case 'block':
        push('player', (x, y) => {
          drawSpriteCentered(ctx, icon('shield', 18), x - 36, y, 40);
          drawText(ctx, String(f.amount), x + 6, y, { size: 36, color: UI.block, strokeWidth: 7 });
        });
        break;
      case 'heal':
        push('player', (x, y) => {
          drawText(ctx, `+${f.amount}`, x, y, { size: 42, color: UI.heal, align: 'center', strokeWidth: 8 });
        });
        break;
      case 'miss':
        push(f.target === 'player' ? 'player' : 'enemy', (x, y) => {
          drawSpriteCentered(ctx, icon('miss', 18), x, y, 56);
        });
        break;
      case 'gold':
        push('top', (x, y) => {
          drawSpriteCentered(ctx, icon('coin', 18), x - 34, y, 40);
          drawText(ctx, `+${f.amount}`, x, y, { size: 34, color: UI.gold, strokeWidth: 7 });
        });
        break;
      default:
        break;
    }
  }
}

function drawCombat(ctx, run, text, palette) {
  const c = run.combat;
  const dark = engine.isDark(run);
  drawBackdrop(ctx, palette, { dark, seed: run.floor, candles: [44, 756], candleY: 400 });
  if (!c) return;
  const def = engine.getEnemyDef(c.enemyId) || {};

  // Eclipse da Nyx: tinge a cena e acende um sol negro
  if (c.phase2) {
    ctx.fillStyle = 'rgba(120, 0, 30, 0.28)';
    ctx.fillRect(0, SCENE_TOP, RENDER_WIDTH, RENDER_HEIGHT - SCENE_TOP);
    glow(ctx, 575, 330, 210, '#ff3355', 0.55);
    ctx.fillStyle = '#05010a';
    ctx.beginPath();
    ctx.arc(575, 330, 120, 0, Math.PI * 2);
    ctx.fill();
    // Faixas de glitch de Nyxiel (vermelho e verde), sempre no mesmo lugar para a cena não tremer
    const stripes = [[96, 0.18, '#ff2e55'], [214, 0.12, '#3dff8f'], [348, 0.16, '#ff2e55'], [462, 0.1, '#3dff8f'], [530, 0.14, '#ff2e55']];
    for (const [y, alpha, color] of stripes) {
      ctx.fillStyle = rgba(color, alpha);
      ctx.fillRect(0, SCENE_TOP + y, RENDER_WIDTH, 6);
    }
  }

  // Inimigo
  const enemySize = def.boss ? 300 : def.guardian ? 250 : 200;
  const ex = 575;
  const eBottom = 590;
  if (def.boss || def.guardian) glow(ctx, ex, eBottom - enemySize / 2, enemySize * 0.85, def.aura || (def.boss ? '#ffd36b' : palette.accent), def.boss ? 0.4 : 0.3);
  shadow(ctx, ex, eBottom - 4, enemySize * 0.8);
  const hit = run.fx.some((f) => f.type === 'dmgEnemy');
  const body = enemySprite(c.enemyId, def, c.phase2);
  const drawn = drawSprite(ctx, body, ex + (hit ? 6 : 0), eBottom, c.enemyId === 'mimic' ? enemySize * 0.8 : enemySize);
  if (def.crowned) drawSprite(ctx, icon('crown', 20), ex + (hit ? 6 : 0), eBottom - drawn.h + 24, 72);
  else if (run.festival && drawn.h > 0) {
    const headTop = eBottom - drawn.h + Math.round(drawn.h * opaqueTopRatio(body));
    drawSprite(ctx, festivalHat(run.festival.season), ex + (hit ? 6 : 0), headTop + Math.round(enemySize * 0.1), Math.round(enemySize * 0.4));
  }

  // Pyxie e Astaroth
  const guarding = run.fx.some((f) => f.type === 'guard');
  const px = 170;
  const pBottom = 600;
  shadow(ctx, px, pBottom - 4, 150);
  if (guarding) {
    glow(ctx, px, pBottom - 90, 130, UI.block, 0.35);
    ctx.strokeStyle = rgba(UI.block, 0.9);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(px, pBottom - 90, 110, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawSprite(ctx, assetSprite('pyxie', 42), px, pBottom, 168);
  drawSprite(ctx, assetSprite(astarothMood(run), 28), px + 135, pBottom, 84);
  if (run.player.poisonTurns > 0) {
    drawSpriteCentered(ctx, icon('poison', 18), px - 70, pBottom - 190, 40);
    drawText(ctx, String(run.player.poisonTurns), px - 44, pBottom - 190, { size: 28, color: UI.poison });
  }

  // Painel do inimigo: nome + vida + escudo
  const panelX = 356;
  const panelW = RENDER_WIDTH - 14 - panelX;
  roundRect(ctx, panelX, SCENE_TOP + 12, panelW, 76, 16);
  ctx.fillStyle = 'rgba(13, 7, 20, 0.82)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = def.guardian ? UI.danger : rgba(palette.accent, 0.8);
  ctx.stroke();
  const shieldW = c.shield > 0 ? 92 : 0;
  drawText(ctx, text.enemyName, panelX + 16, SCENE_TOP + 34, { size: 26, maxWidth: panelW - 32 });
  const barX = panelX + 16;
  const barW = panelW - 32 - shieldW;
  const barY = SCENE_TOP + 54;
  roundRect(ctx, barX, barY, barW, 26, 8);
  ctx.fillStyle = UI.hpBack;
  ctx.fill();
  const ratio = Math.max(0, Math.min(1, c.hp / Math.max(1, c.maxHp)));
  if (ratio > 0) {
    roundRect(ctx, barX, barY, Math.max(14, barW * ratio), 26, 8);
    ctx.fillStyle = c.phase2 ? '#ff3355' : '#e0457b';
    ctx.fill();
  }
  drawText(ctx, `${c.hp}/${c.maxHp}`, barX + barW / 2, barY + 14, { size: 24, align: 'center' });
  if (shieldW) {
    drawSpriteCentered(ctx, icon('shield', 18), barX + barW + 26, barY + 12, 38);
    drawText(ctx, String(c.shield), barX + barW + 48, barY + 14, { size: 26, color: UI.block });
  }

  // Balão de intenção (telegrafo do próximo golpe)
  const intent = engine.describeIntent(run);
  if (intent) {
    const bx = panelX;
    const by = SCENE_TOP + 100;
    const bw = panelW;
    const bh = 60;
    roundRect(ctx, bx, by, bw, bh, 18);
    ctx.fillStyle = 'rgba(255, 247, 255, 0.95)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ex - 18, by + bh - 2);
    ctx.lineTo(ex + 18, by + bh - 2);
    ctx.lineTo(ex, by + bh + 22);
    ctx.closePath();
    ctx.fill();
    drawSpriteCentered(ctx, icon(INTENT_ICONS[intent.type] || 'knife', 18), bx + 36, by + bh / 2, 42);
    const danger = ['heavy', 'charge'].includes(intent.type);
    drawText(ctx, text.intentText, bx + 66, by + bh / 2 + 1, { size: 28, color: danger ? '#b3123a' : INK, stroke: null, maxWidth: bw - 82 });
  }

  if (dark) vignette(ctx, 400, 380, 0.75);
  if (dark) drawBanner(ctx, text.darkWarning, 14, SCENE_TOP + 14, { color: '#ffd0d8', accent: UI.danger, size: 24, maxWidth: panelX - 10, anchor: 'left' });

  drawPopups(ctx, run, {
    enemy: { x: ex, y: eBottom - enemySize - 10 > SCENE_TOP + 210 ? eBottom - enemySize - 10 : SCENE_TOP + 236 },
    player: { x: px, y: pBottom - 220 },
    top: { x: 400, y: SCENE_TOP + 236 },
  });
}

// ---------------------------------------------------------------- eventos
function drawAltar(ctx, cx, bottom, palette) {
  ctx.fillStyle = mix(palette.wall, '#9d8fb5', 0.45);
  ctx.fillRect(cx - 90, bottom - 110, 180, 110);
  ctx.fillStyle = mix(palette.wall, '#c9bde0', 0.5);
  ctx.fillRect(cx - 110, bottom - 130, 220, 26);
  ctx.fillStyle = rgba('#000000', 0.25);
  for (let i = 0; i < 4; i++) ctx.fillRect(cx - 70 + i * 40, bottom - 96, 20, 80);
}

/** Agulhas em degraus de 6px, para manter o visual pixelado. */
function drawSpikes(ctx, cx, bottom) {
  const px = 6;
  for (let i = -3; i <= 4; i++) {
    const x = cx + i * 46;
    const rows = i % 2 === 0 ? 15 : 12;
    for (let r = 0; r < rows; r++) {
      const half = Math.max(1, Math.round(((r + 1) / rows) * 3)) * px;
      const y = bottom - (rows - r) * px;
      ctx.fillStyle = INK;
      ctx.fillRect(x - half - px, y, half * 2 + px * 2, px);
      ctx.fillStyle = '#e4e0ee';
      ctx.fillRect(x - half, y, half, px);
      ctx.fillStyle = '#9d97b3';
      ctx.fillRect(x, y, half, px);
    }
    ctx.fillStyle = '#ff5c7a';
    ctx.fillRect(x - px / 2, bottom - rows * px - px, px, px);
  }
}

function drawMerchant(ctx, run, palette) {
  const room = run.map.rooms[run.event.roomKey];
  const stock = Array.isArray(room?.stock) ? room.stock : [];

  // Gatinha mercadora atrás do balcão, sob um toldo listrado
  glow(ctx, 400, 290, 190, palette.glow, 0.3);
  roundRect(ctx, 250, 196, 300, 170, 20);
  ctx.fillStyle = mix(palette.wall, '#e9d8ff', 0.28);
  ctx.fill();
  const stripes = 10;
  const stripeW = 520 / stripes;
  for (let i = 0; i < stripes; i++) {
    const x = 140 + i * stripeW;
    ctx.fillStyle = i % 2 === 0 ? '#ff8fd6' : '#7a3fa8';
    ctx.fillRect(x, 176, stripeW, 30);
    ctx.beginPath();
    ctx.arc(x + stripeW / 2, 206, stripeW / 2, 0, Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = INK;
  ctx.fillRect(140, 170, 520, 8);
  drawSprite(ctx, icon('merchant', 32), 400, 360, 160);
  ctx.fillStyle = '#5b3a29';
  ctx.fillRect(110, 352, 580, 30);
  ctx.fillStyle = '#7a5038';
  ctx.fillRect(110, 352, 580, 8);
  ctx.fillStyle = '#3e271b';
  ctx.fillRect(130, 382, 540, 90);

  const slot = 124;
  const gap = 16;
  const totalW = stock.length * slot + Math.max(0, stock.length - 1) * gap;
  let sx = (RENDER_WIDTH - totalW) / 2;
  for (const offer of stock) {
    const offerSprite =
      offer.item === 'charm'
        ? emojiSprite(CHARMS[offer.charmId]?.emoji, 20, CHARMS[offer.charmId]?.glyph)
        : icon(MERCHANT_ICONS[offer.item], 20);
    const affordable = run.player.gold >= offer.price;
    roundRect(ctx, sx, 410, slot, slot, 16);
    ctx.fillStyle = offer.sold ? 'rgba(13, 7, 20, 0.55)' : 'rgba(30, 16, 44, 0.95)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = offer.sold ? '#4a3c5c' : affordable ? UI.gold : '#7d6a96';
    ctx.stroke();
    drawSpriteCentered(ctx, offerSprite, sx + slot / 2, 460, 66, { alpha: offer.sold ? 0.3 : 1 });
    if (offer.sold) {
      drawSpriteCentered(ctx, icon('done', 18), sx + slot / 2, 460, 44);
    } else {
      drawSpriteCentered(ctx, icon('coin', 16), sx + 30, 510, 30);
      drawText(ctx, String(offer.price), sx + 50, 511, { size: 26, color: affordable ? UI.gold : '#b9a8cf' });
    }
    sx += slot + gap;
  }
}

function drawEvent(ctx, run, text, palette) {
  const ev = run.event;
  const cx = 480;
  drawBackdrop(ctx, palette, { dark: engine.isDark(run), seed: run.floor + 7, archX: ev?.type === 'merchant' ? 400 : cx });
  if (!ev) return;
  const bottom = 560;

  if (ev.type === 'merchant') {
    drawMerchant(ctx, run, palette);
  } else if (ev.type === 'chest' || ev.type === 'treasure') {
    glow(ctx, cx, bottom - 110, 200, ev.type === 'treasure' ? UI.gold : palette.glow, 0.4);
    shadow(ctx, cx, bottom - 4, 260);
    drawSprite(ctx, chestSprite(ev.type === 'treasure' ? 'velvet' : 'wood'), cx, bottom, 196);
    if (ev.type === 'treasure') {
      drawSpriteCentered(ctx, icon('lock', 20), cx, bottom - 210, 72);
      drawSpriteCentered(ctx, icon('gem', 18), cx - 170, bottom - 200, 54);
      drawSpriteCentered(ctx, icon('sparkle', 18), cx + 170, bottom - 180, 54);
    }
    if (ev.sniffed) drawSpriteCentered(ctx, icon('alert', 18), cx + 120, bottom - 250, 70);
  } else if (ev.type === 'shrine') {
    glow(ctx, cx, 270, 200, '#d9c8ff', 0.45);
    drawAltar(ctx, cx, bottom, palette);
    drawSpriteCentered(ctx, icon('moon', 28), cx, 300, 140);
    drawSprite(ctx, icon('candles', 18), cx - 80, bottom - 130, 60);
    drawSprite(ctx, icon('candles', 18), cx + 80, bottom - 130, 60);
  } else if (ev.type === 'fountain') {
    const beam = ctx.createLinearGradient(0, SCENE_TOP, 0, bottom);
    beam.addColorStop(0, 'rgba(200, 220, 255, 0.45)');
    beam.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(cx - 60, SCENE_TOP);
    ctx.lineTo(cx + 60, SCENE_TOP);
    ctx.lineTo(cx + 170, bottom);
    ctx.lineTo(cx - 170, bottom);
    ctx.closePath();
    ctx.fill();
    shadow(ctx, cx, bottom - 4, 240);
    drawSprite(ctx, icon('pool', 40), cx, bottom, 230);
  } else if (ev.type === 'grave') {
    // Túmulo de outra pessoa: lápide pixel com velinhas e brilho frio
    glow(ctx, cx, bottom - 120, 220, '#a5b4fc', 0.35);
    shadow(ctx, cx, bottom - 4, 220);
    drawSprite(ctx, icon('grave', 40), cx, bottom, 220);
    drawSprite(ctx, icon('candles', 18), cx - 130, bottom - 10, 60);
    drawSprite(ctx, icon('candles', 18), cx + 130, bottom - 10, 60);
  } else if (ev.type === 'trap') {
    glow(ctx, cx, bottom - 60, 200, UI.danger, 0.3);
    drawSpikes(ctx, cx, bottom);
    drawSpriteCentered(ctx, icon('trap', 20), cx, 300, 130);
  }

  if (ev.type !== 'merchant') {
    drawSprite(ctx, assetSprite('pyxie', 42), 120, 600, 168);
    drawSprite(ctx, assetSprite(astarothMood(run), 28), 250, 600, 84);
  }
  if (engine.isDark(run)) vignette(ctx, 400, 380, 0.7);
  drawBanner(ctx, text.eventTitle, RENDER_WIDTH / 2, SCENE_TOP + 16, { accent: palette.accent });
  drawFxChips(ctx, run, 16, RENDER_HEIGHT - 62);
}

// ---------------------------------------------------------------- recompensa, acampamento e finais
function drawReward(ctx, run, text, palette) {
  drawBackdrop(ctx, palette, { seed: run.floor + 3 });
  ctx.fillStyle = 'rgba(8, 4, 14, 0.55)';
  ctx.fillRect(0, SCENE_TOP, RENDER_WIDTH, RENDER_HEIGHT - SCENE_TOP);
  drawBanner(ctx, text.rewardTitle, RENDER_WIDTH / 2, SCENE_TOP + 14, { color: UI.gold, accent: UI.gold });

  const options = run.reward?.options || [];
  const names = Array.isArray(text.charmNames) ? text.charmNames : [];
  const cardW = 236;
  const cardH = 392;
  const gap = 22;
  const startX = (RENDER_WIDTH - (options.length * cardW + (options.length - 1) * gap)) / 2;
  options.forEach((id, index) => {
    const x = startX + index * (cardW + gap);
    const y = SCENE_TOP + 86;
    glow(ctx, x + cardW / 2, y + 140, 170, palette.glow, 0.22);
    roundRect(ctx, x, y, cardW, cardH, 22);
    const cg = ctx.createLinearGradient(0, y, 0, y + cardH);
    cg.addColorStop(0, '#2e1a45');
    cg.addColorStop(1, '#150b21');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = palette.accent;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 34, y + 34, 24, 0, Math.PI * 2);
    ctx.fillStyle = palette.accent;
    ctx.fill();
    drawText(ctx, String(index + 1), x + 34, y + 36, { size: 30, color: INK, align: 'center', stroke: null });

    glow(ctx, x + cardW / 2, y + 140, 90, palette.glow, 0.35);
    drawSpriteCentered(ctx, emojiSprite(CHARMS[id]?.emoji, 30, CHARMS[id]?.glyph), x + cardW / 2, y + 140, 130);

    ctx.font = font(26);
    const lines = wrapLines(ctx, str(names[index]), cardW - 28, 3);
    lines.forEach((line, li) => {
      drawText(ctx, line, x + cardW / 2, y + 262 + li * 34, { size: 26, align: 'center', maxWidth: cardW - 24 });
    });
  });
}

function drawCamp(ctx, run, text, palette) {
  const sky = ctx.createLinearGradient(0, SCENE_TOP, 0, RENDER_HEIGHT);
  sky.addColorStop(0, '#07040f');
  sky.addColorStop(1, mix(palette.wall, '#1a0f26', 0.5));
  ctx.fillStyle = sky;
  ctx.fillRect(0, SCENE_TOP, RENDER_WIDTH, RENDER_HEIGHT - SCENE_TOP);
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(hash(i, 1, run.floor) * RENDER_WIDTH);
    const y = SCENE_TOP + Math.floor(hash(i, 2, run.floor) * 280);
    ctx.fillStyle = rgba('#fff3c4', 0.3 + hash(i, 5) * 0.6);
    ctx.fillRect(x, y, hash(i, 9) > 0.85 ? 6 : 4, hash(i, 9) > 0.85 ? 6 : 4);
  }
  ctx.fillStyle = mix(palette.floor, '#000000', 0.35);
  ctx.fillRect(0, 500, RENDER_WIDTH, RENDER_HEIGHT - 500);
  ctx.fillStyle = rgba(palette.accent, 0.3);
  ctx.fillRect(0, 500, RENDER_WIDTH, 4);

  const fx = 400;
  glow(ctx, fx, 480, 320, '#ff9a3d', 0.5);
  // Lenha cruzada e pedrinhas em volta da fogueira
  ctx.fillStyle = '#3e2317';
  ctx.fillRect(fx - 84, 548, 168, 24);
  ctx.fillStyle = '#6b3d24';
  ctx.fillRect(fx - 84, 548, 168, 8);
  ctx.fillStyle = '#2c180f';
  ctx.fillRect(fx - 60, 566, 120, 18);
  for (let i = -3; i <= 3; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#5d5670' : '#7a7390';
    ctx.fillRect(fx + i * 30 - 12, 576, 24, 16);
  }
  drawSprite(ctx, icon('fire', 32), fx, 556, 144);
  drawSprite(ctx, assetSprite('pyxie', 42), 200, 590, 168);
  drawSprite(ctx, assetSprite('astaroth_sleeping', 30), 610, 590, 120);
  drawBanner(ctx, text.campTitle, RENDER_WIDTH / 2, SCENE_TOP + 16, { color: '#ffe2b8', accent: '#ff9a3d' });
  drawFxChips(ctx, run, 16, RENDER_HEIGHT - 62);
}

function drawEnding(ctx, run, text, palette) {
  const phase = run.phase;
  const bg = ctx.createLinearGradient(0, SCENE_TOP, 0, RENDER_HEIGHT);
  if (phase === 'victory') {
    bg.addColorStop(0, '#3a2205');
    bg.addColorStop(1, '#120a1c');
  } else if (phase === 'extracted') {
    bg.addColorStop(0, '#1b2348');
    bg.addColorStop(1, '#120a1c');
  } else {
    bg.addColorStop(0, '#2a0711');
    bg.addColorStop(1, '#07030a');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, SCENE_TOP, RENDER_WIDTH, RENDER_HEIGHT - SCENE_TOP);

  if (phase === 'victory') {
    ctx.save();
    ctx.translate(400, 330);
    for (let i = 0; i < 16; i++) {
      ctx.rotate((Math.PI * 2) / 16);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 211, 107, 0.18)' : 'rgba(255, 143, 214, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-60, -520);
      ctx.lineTo(60, -520);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(i, 21, run.floor) * RENDER_WIDTH);
    const y = SCENE_TOP + Math.floor(hash(i, 22, run.floor) * (RENDER_HEIGHT - SCENE_TOP));
    ctx.fillStyle = phase === 'dead' ? rgba('#ff5c7a', 0.15) : rgba('#ffe9a8', 0.25);
    ctx.fillRect(x, y, 4, 4);
  }

  const titles = { victory: text.victoryTitle, extracted: text.extractedTitle, dead: text.deathTitle };
  const accent = phase === 'victory' ? UI.gold : phase === 'extracted' ? '#9ec1ff' : UI.danger;
  drawBanner(ctx, titles[phase], RENDER_WIDTH / 2, SCENE_TOP + 18, { color: UI.text, accent, size: 34 });

  if (phase === 'dead') {
    glow(ctx, 400, 330, 220, UI.danger, 0.25);
    drawSprite(ctx, icon('grave', 40), 400, 520, 240, { alpha: 0.95 });
    drawSprite(ctx, assetSprite('pyxieSad', 40), 190, 520, 160);
    drawSprite(ctx, assetSprite('astaroth_sad', 30), 610, 520, 120);
  } else if (phase === 'extracted') {
    glow(ctx, 400, 320, 230, '#9ec1ff', 0.3);
    drawSprite(ctx, icon('coins', 36), 400, 470, 200);
    drawSprite(ctx, assetSprite('pyxieShowing', 44), 180, 520, 176);
    drawSprite(ctx, assetSprite('astaroth_smug', 30), 620, 520, 120);
  } else {
    glow(ctx, 400, 330, 260, UI.gold, 0.45);
    drawSprite(ctx, icon('crown', 26), 400, 300, 120);
    drawSprite(ctx, assetSprite('pyxieVictory', 48), 400, 520, 200);
    drawSprite(ctx, assetSprite('astaroth_laugh', 30), 610, 520, 120);
    drawSpriteCentered(ctx, icon('sparkle', 18), 180, 300, 70);
    drawSpriteCentered(ctx, icon('sparkle', 18), 640, 260, 54);
  }

  const payout = str(text.payoutText);
  if (payout) {
    ctx.font = font(52);
    const w = Math.min(RENDER_WIDTH - 80, ctx.measureText(payout).width + 140);
    roundRect(ctx, 400 - w / 2, 540, w, 78, 39);
    ctx.fillStyle = 'rgba(13, 7, 20, 0.88)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = accent;
    ctx.stroke();
    drawSpriteCentered(ctx, icon('coin', 18), 400 - w / 2 + 48, 579, 48);
    drawText(ctx, payout, 400 + 24, 580, { size: 52, color: phase === 'dead' ? '#ffd0d8' : UI.gold, align: 'center', maxWidth: w - 120, strokeWidth: 0 });
  }
}

// ---------------------------------------------------------------- entrada pública
const canvas = createCanvas(RENDER_WIDTH, RENDER_HEIGHT);

/**
 * Renderiza a cena atual do run em PNG.
 * @param {object} run Estado do run (dungeonEngine)
 * @param {{ lang?: 'pt'|'en', text?: Record<string, any> }} [options]
 * @returns {Promise<Buffer>}
 */
async function renderDungeonScene(run, options = {}) {
  await loadAssets();
  await ensureEmojis();
  const text = options.text || {};
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
  const palette = engine.getFloorDef(run.floor)?.palette || { floor: '#2a1838', wall: '#160c20', accent: '#f5a742', glow: '#ffb35c' };
  if (!Array.isArray(run.fx)) run.fx = [];

  switch (run.phase) {
    case 'combat':
      drawCombat(ctx, run, text, palette);
      break;
    case 'event':
      drawEvent(ctx, run, text, palette);
      break;
    case 'reward':
      drawReward(ctx, run, text, palette);
      break;
    case 'camp':
      drawCamp(ctx, run, text, palette);
      break;
    case 'dead':
    case 'extracted':
    case 'victory':
      drawEnding(ctx, run, text, palette);
      break;
    case 'explore':
    default:
      drawExplore(ctx, run, text, palette);
      break;
  }
  drawHud(ctx, run, text, palette);
  drawWatermark(ctx);
  return canvas.toBuffer('image/png');
}

module.exports = {
  renderDungeonScene,
  listEmojiRefs,
  resolveEmojiRef,
  RENDER_WIDTH,
  RENDER_HEIGHT,
};
