const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

/**
 * Sprites da Casinha: recorte das folhas CC0 em assets/home/sheets (ver assets/home/CREDITS.md),
 * recoloração seletiva para variantes de cor e papéis de parede/pisos gerados em pixel art.
 * Tudo é desenhado em 16px nativos; o renderizador amplia sem suavização.
 */

const TILE = 16;
const SHEETS_DIR = path.join(__dirname, '..', '..', '..', 'assets', 'home', 'sheets');

const SHEETS = {
  indoors: { file: 'kenney-roguelike-indoors.png', stride: 17 },
  rpg: { file: 'kenney-roguelike-rpg.png', stride: 17 },
  town: { file: 'kenney-tiny-town.png', stride: 16, columns: 12, base: 0 },
  dungeon: { file: 'kenney-tiny-dungeon.png', stride: 16, columns: 12, base: 0 },
  creatures: { file: 'tiny-creatures.png', stride: 16, columns: 10, base: 1 },
  slimes: { file: 'blob-slimes.png', stride: 16 },
};
// Folhas sazonais e extras (seasonal-*, extra-*): chave = nome do arquivo sem .png
for (const meta of require('../../../assets/home/seasonal-candidates.json').sheets) {
  const key = meta.file.replace(/\.png$/, '');
  if (!Object.values(SHEETS).some((known) => known.file === meta.file)) {
    SHEETS[key] = { file: meta.file, stride: meta.stride, tile: meta.tile, columns: meta.columns, base: 0 };
  }
}

const sheetCache = new Map();
const spriteCache = new Map();
require('../../services/memoryGuard').onPressure(() => {
  sheetCache.clear();
  spriteCache.clear();
});

async function loadSheet(name) {
  if (!sheetCache.has(name)) {
    const meta = SHEETS[name];
    if (!meta) throw new Error(`Folha de sprites desconhecida: ${name}`);
    sheetCache.set(name, loadImage(fs.readFileSync(path.join(SHEETS_DIR, meta.file))));
  }
  return sheetCache.get(name);
}

/** Converte { sheet, n } (numeração dos arquivos de cada pacote) em coordenadas de tile. */
function resolveCell(sprite) {
  if (sprite.n !== undefined) {
    const { columns = 12, base = 0 } = SHEETS[sprite.sheet];
    const index = sprite.n - base;
    return { x: index % columns, y: Math.floor(index / columns), w: 1, h: 1 };
  }
  return { x: sprite.x, y: sprite.y, w: sprite.w || 1, h: sprite.h || 1 };
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const conv = (t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [Math.round(conv(hue + 1 / 3) * 255), Math.round(conv(hue) * 255), Math.round(conv(hue - 1 / 3) * 255)];
}

function inHueRange(h, [min, max]) {
  return min <= max ? h >= min && h <= max : h >= min || h <= max;
}

/**
 * Recolore só os pixels saturados de uma faixa de matiz (o tecido laranja de uma cama vira lilás,
 * a madeira continua madeira). recolor: { from: [hMin, hMax], to: hue, minSat, satMul, lightAdd }
 */
function applyRecolor(ctx, width, height, recolor) {
  const rules = Array.isArray(recolor) ? recolor : [recolor];
  const image = ctx.getImageData(0, 0, width, height);
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    const [h, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
    for (const rule of rules) {
      if (s < (rule.minSat ?? 0.45) || !inHueRange(h, rule.from)) continue;
      const [r, g, b] = hslToRgb(rule.to, Math.min(1, s * (rule.satMul ?? 1)), Math.max(0, Math.min(1, l + (rule.lightAdd ?? 0))));
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      break;
    }
  }
  ctx.putImageData(image, 0, 0);
}

/** Sprite pronto em 16px nativos (canvas), com cache por item. */
async function getSprite(def) {
  const key = JSON.stringify(def);
  if (spriteCache.has(key)) return spriteCache.get(key);
  const promise = (async () => {
    if (def.pattern) return drawPattern(def.pattern);
    if (def.pixels) return drawPixelArt(def.pixels);
    const sheet = await loadSheet(def.sheet);
    const { stride, tile = TILE } = SHEETS[def.sheet];
    const cell = resolveCell(def);
    const canvas = createCanvas(cell.w * TILE, cell.h * TILE);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let dy = 0; dy < cell.h; dy++) {
      for (let dx = 0; dx < cell.w; dx++) {
        ctx.drawImage(sheet, (cell.x + dx) * stride, (cell.y + dy) * stride, tile, tile, dx * TILE, dy * TILE, TILE, TILE);
      }
    }
    if (def.recolor) applyRecolor(ctx, canvas.width, canvas.height, def.recolor);
    return canvas;
  })();
  spriteCache.set(key, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Papéis de parede e pisos em pixel art (16x16, gerados por código)
// ---------------------------------------------------------------------------

const PATTERN_DRAWERS = {
  // Parede lisa com textura leve
  plain(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    for (const [x, y] of [[3, 4], [11, 2], [7, 10], [14, 13], [1, 14]]) ctx.fillRect(x, y, 1, 1);
  },
  stripes(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    ctx.fillRect(2, 0, 3, TILE);
    ctx.fillRect(10, 0, 1, TILE);
  },
  dots(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    for (const [x, y] of [[3, 3], [11, 11]]) {
      ctx.fillRect(x, y - 1, 2, 4);
      ctx.fillRect(x - 1, y, 4, 2);
    }
  },
  stars(ctx, [base, accent, extra]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    ctx.fillRect(4, 2, 1, 5);
    ctx.fillRect(2, 4, 5, 1);
    ctx.fillStyle = extra || accent;
    for (const [x, y] of [[12, 9], [9, 14], [14, 2], [1, 12]]) ctx.fillRect(x, y, 1, 1);
  },
  hearts(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    const heart = [[1, 0], [2, 0], [4, 0], [5, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [2, 3], [3, 3], [4, 3], [3, 4]];
    for (const [x, y] of heart) ctx.fillRect(x + 1, y + 2, 1, 1);
    for (const [x, y] of heart) ctx.fillRect(((x + 9) % TILE), ((y + 10) % TILE), 1, 1);
  },
  moons(ctx, [base, accent, extra]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    for (const [x, y] of [[4, 2], [3, 3], [3, 4], [3, 5], [4, 6], [5, 6]]) ctx.fillRect(x, y, 1, 1);
    ctx.fillStyle = extra || accent;
    for (const [x, y] of [[12, 11], [10, 4], [7, 13]]) ctx.fillRect(x, y, 1, 1);
  },
  checks(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillRect(8, 8, 8, 8);
  },
  bricks(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    for (const y of [3, 7, 11, 15]) ctx.fillRect(0, y, TILE, 1);
    for (const [x, y] of [[4, 0], [12, 4], [4, 8], [12, 12]]) ctx.fillRect(x, y, 1, 3);
  },
  diamonds(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(8 + i, i, 1, 1);
      ctx.fillRect(8 - i, i, 1, 1);
      ctx.fillRect(i, 8 + i, 1, 1);
      ctx.fillRect(TILE - 1 - i, 8 + i, 1, 1);
    }
  },
  // Pisos
  planks(ctx, [base, accent, extra]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    for (const y of [3, 7, 11, 15]) ctx.fillRect(0, y, TILE, 1);
    for (const [x, y] of [[6, 0], [13, 4], [3, 8], [10, 12]]) ctx.fillRect(x, y, 1, 3);
    ctx.fillStyle = extra || accent;
    for (const [x, y] of [[2, 1], [9, 5], [14, 9], [5, 13]]) ctx.fillRect(x, y, 2, 1);
  },
  tiles(ctx, [base, accent, extra]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillStyle = extra || accent;
    ctx.fillRect(0, 7, TILE, 1);
    ctx.fillRect(7, 0, 1, TILE);
    ctx.fillRect(0, 15, TILE, 1);
    ctx.fillRect(15, 0, 1, TILE);
  },
  carpet(ctx, [base, accent]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    for (const [x, y] of [[1, 2], [5, 6], [9, 1], [13, 5], [3, 11], [11, 13], [7, 9], [14, 10]]) ctx.fillRect(x, y, 1, 1);
  },
  stone(ctx, [base, accent, extra]) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 7, 8, 1);
    ctx.fillRect(8, 15, 8, 1);
    ctx.fillRect(7, 0, 1, 8);
    ctx.fillRect(15, 8, 1, 8);
    ctx.fillRect(8, 3, 8, 1);
    ctx.fillRect(0, 11, 8, 1);
    ctx.fillStyle = extra || accent;
    for (const [x, y] of [[3, 3], [12, 9], [4, 13]]) ctx.fillRect(x, y, 1, 1);
  },
};

function drawPattern({ kind, colors }) {
  const canvas = createCanvas(TILE, TILE);
  const ctx = canvas.getContext('2d');
  const drawer = PATTERN_DRAWERS[kind] || PATTERN_DRAWERS.plain;
  drawer(ctx, colors);
  return canvas;
}

// ---------------------------------------------------------------------------
// Pixel art desenhada à mão para a Pyxie (o pacote CC0 não tem gatinhos)
// o contorno · b corpo · s sombra · e olho · n focinho/orelha · w brilho
// ---------------------------------------------------------------------------

const PIXEL_ART = {
  cat: [
    '................',
    '...o.......o....',
    '..ono.....ono...',
    '..onbooooobno...',
    '..obbbbbbbbbo...',
    '.obbebbbbbebbo..',
    '.obbebbbbbebbo..',
    '.obbbbbnbbbbbo..',
    '..obbbsssbbbo...',
    '...obbbbbbbo..o.',
    '..obbbbbbbbbo.ob',
    '.obsbbbbbbbsbo.o',
    '.obsbbbbbbbsbob.',
    '.obbbbbbbbbbbo..',
    '.obbobbbbbobbo..',
    '..oo.ooooo.oo...',
  ],
};

function drawPixelArt({ art, palette }) {
  const rows = PIXEL_ART[art] || PIXEL_ART.cat;
  const canvas = createCanvas(TILE, TILE);
  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = palette[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  });
  return canvas;
}

function clearSpriteCache() {
  spriteCache.clear();
}

module.exports = {
  TILE,
  SHEETS,
  PATTERN_KINDS: Object.keys(PATTERN_DRAWERS),
  getSprite,
  resolveCell,
  applyRecolor,
  rgbToHsl,
  clearSpriteCache,
};
