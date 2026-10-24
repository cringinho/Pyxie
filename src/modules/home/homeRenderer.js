const { createCanvas } = require('@napi-rs/canvas');
const { ensureCanvasFonts, withEmojiFallback } = require('../../utils/canvasFonts');
const { getItem, itemName, rarityInfo } = require('./homeCatalog');
const { getSprite, TILE } = require('./homeSprites');
const engine = require('./homeEngine');

ensureCanvasFonts();

/**
 * Renderizador da Casinha. O quarto é montado em 16px nativos (192x128) e ampliado 4x sem
 * suavização, para a pixel art ficar nítida. Luz e textos entram depois, já na escala final.
 *
 * Cena 800x608 pensada para celular: cabeçalho de 72px, quarto 768x512, margem de 16px.
 */

const SCALE = 4;
const CELL = TILE * SCALE;
const ROOM_W = engine.ROOM.cols * TILE;
const ROOM_H = (engine.ROOM.wallRows + engine.ROOM.floorRows) * TILE;
const OFFSET_X = 16;
const OFFSET_Y = 80;
const WIDTH = ROOM_W * SCALE + OFFSET_X * 2;
const HEIGHT = OFFSET_Y + ROOM_H * SCALE + 16;
const WALL_PX = engine.ROOM.wallRows * TILE;

const INK = '#0d0714';
const TEXT = '#fff7ff';
const MUTED = '#e3d4f5';
const ACCENT = '#c084fc';

function font(size, weight = 'bold') {
  return withEmojiFallback(`${weight} ${size}px sans-serif`);
}

function brtHour(now) {
  return new Date(now - 3 * 60 * 60 * 1000).getUTCHours();
}

/** Luz ambiente pelo horário de Brasília: dia claro, entardecer quente, noite azulada. */
function ambientFor(now) {
  const hour = brtHour(now);
  if (hour >= 7 && hour < 17) return { name: 'day', dark: 0, tint: null, glow: 0.18 };
  if (hour >= 17 && hour < 19) return { name: 'dusk', dark: 0.18, tint: 'rgba(255, 140, 80, 0.10)', glow: 0.32 };
  if (hour >= 5 && hour < 7) return { name: 'dawn', dark: 0.15, tint: 'rgba(255, 190, 220, 0.10)', glow: 0.28 };
  return { name: 'night', dark: 0.38, tint: 'rgba(40, 30, 110, 0.18)', glow: 0.5 };
}

async function tileFill(ctx, itemId, x, y, w, h) {
  const entry = getItem(itemId);
  if (!entry) return;
  const tile = await getSprite(entry.sprite);
  for (let ty = y; ty < y + h; ty += TILE) {
    for (let tx = x; tx < x + w; tx += TILE) ctx.drawImage(tile, tx, ty);
  }
}

async function drawSprite(ctx, entry, px, py, flip = false, alpha = 1) {
  const sprite = await getSprite(entry.sprite);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (flip) {
    ctx.translate(px + sprite.width, py);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, 0, 0);
  } else {
    ctx.drawImage(sprite, px, py);
  }
  ctx.restore();
  return sprite;
}

/** Posição em pixels nativos do canto superior esquerdo do sprite (ancorado embaixo no piso). */
function spriteOrigin(entry, sprite, x, y) {
  if (entry.kind === 'wall') return { px: x * TILE, py: y * TILE };
  const [, footH] = entry.footprint;
  return { px: x * TILE, py: WALL_PX + (y + footH) * TILE - sprite.height };
}

function drawShadow(ctx, px, py, width) {
  ctx.fillStyle = 'rgba(13, 7, 20, 0.28)';
  ctx.beginPath();
  ctx.ellipse(px + width / 2, py - 1.5, width * 0.36, 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Quarto em 16px nativos: parede, rodapé, piso, tapetes, decoração de parede e móveis por profundidade. */
async function drawRoomNative(home, { ghost = null, hidden = null } = {}) {
  const canvas = createCanvas(ROOM_W, ROOM_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  await tileFill(ctx, home.wallpaper, 0, 0, ROOM_W, WALL_PX);
  await tileFill(ctx, home.flooring, 0, WALL_PX, ROOM_W, ROOM_H - WALL_PX);

  // Moldura do teto, rodapé de madeira e sombra no piso
  ctx.fillStyle = 'rgba(13, 7, 20, 0.45)';
  ctx.fillRect(0, 0, ROOM_W, 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(0, 1, ROOM_W, 1);
  ctx.fillStyle = '#5b3a29';
  ctx.fillRect(0, WALL_PX - 2, ROOM_W, 2);
  ctx.fillStyle = '#8a5a3c';
  ctx.fillRect(0, WALL_PX - 2, ROOM_W, 1);
  ctx.fillStyle = 'rgba(13, 7, 20, 0.22)';
  ctx.fillRect(0, WALL_PX, ROOM_W, 2);

  const placements = (home.placements || []).filter((p) => p.uid !== hidden);
  const withEntries = placements.map((p) => ({ ...p, entry: getItem(p.itemId) })).filter((p) => p.entry);
  const ghostEntry = ghost ? getItem(ghost.itemId) : null;
  const layer = (name) => withEntries.filter((p) => engine.layerOf(p.entry) === name);

  for (const p of layer('rug')) {
    const sprite = await getSprite(p.entry.sprite);
    const { px, py } = spriteOrigin(p.entry, sprite, p.x, p.y);
    await drawSprite(ctx, p.entry, px, py, p.flip);
  }
  if (ghostEntry && engine.layerOf(ghostEntry) === 'rug') await drawGhost(ctx, ghostEntry, ghost);

  for (const p of layer('wall')) {
    await drawSprite(ctx, p.entry, p.x * TILE, p.y * TILE, p.flip);
  }
  if (ghostEntry && engine.layerOf(ghostEntry) === 'wall') await drawGhost(ctx, ghostEntry, ghost);

  // Móveis e pets em ordem de profundidade (quem está mais embaixo no piso fica na frente)
  const floorItems = layer('floor').map((p) => ({ ...p, isGhost: false }));
  if (ghostEntry && engine.layerOf(ghostEntry) === 'floor') floorItems.push({ ...ghost, entry: ghostEntry, isGhost: true });
  const petLast = (p) => (p.entry.kind === 'pet' ? 1 : 0);
  floorItems.sort((a, b) => (a.y + a.entry.footprint[1]) - (b.y + b.entry.footprint[1]) || petLast(a) - petLast(b) || a.x - b.x);
  for (const p of floorItems) {
    const sprite = await getSprite(p.entry.sprite);
    const { px, py } = spriteOrigin(p.entry, sprite, p.x, p.y);
    if (p.entry.kind === 'pet') drawShadow(ctx, px, py + sprite.height, sprite.width);
    await drawSprite(ctx, p.entry, px, py, p.flip, p.isGhost ? 0.7 : 1);
  }
  return { canvas, placements: withEntries };
}

async function drawGhost(ctx, entry, ghost) {
  const sprite = await getSprite(entry.sprite);
  const { px, py } = spriteOrigin(entry, sprite, ghost.x, ghost.y);
  await drawSprite(ctx, entry, px, py, ghost.flip, 0.7);
}

/** Centro de um item em pixels finais (para a luz). */
function lightCenter(entry, x, y) {
  const [w, h] = entry.footprint;
  const baseY = entry.kind === 'wall' ? y * TILE : WALL_PX + y * TILE;
  return {
    cx: OFFSET_X + (x * TILE + (w * TILE) / 2) * SCALE,
    cy: OFFSET_Y + (baseY + (h * TILE) / 2) * SCALE,
  };
}

function drawLighting(ctx, placements, ambient) {
  const roomX = OFFSET_X;
  const roomY = OFFSET_Y;
  const roomW = ROOM_W * SCALE;
  const roomH = ROOM_H * SCALE;

  if (ambient.dark > 0) {
    ctx.fillStyle = `rgba(10, 6, 30, ${ambient.dark})`;
    ctx.fillRect(roomX, roomY, roomW, roomH);
  }
  if (ambient.tint) {
    ctx.fillStyle = ambient.tint;
    ctx.fillRect(roomX, roomY, roomW, roomH);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(roomX, roomY, roomW, roomH);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of placements) {
    const isWindow = p.entry.id.startsWith('window') && ambient.name === 'day';
    const radius = (p.entry.light || (isWindow ? 2 : 0)) * CELL;
    if (!radius) continue;
    const { cx, cy } = lightCenter(p.entry, p.x, p.y);
    const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius + CELL / 2);
    const color = isWindow ? '200, 230, 255' : '255, 176, 90';
    glow.addColorStop(0, `rgba(${color}, ${ambient.glow})`);
    glow.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(cx - radius - CELL, cy - radius - CELL, (radius + CELL) * 2, (radius + CELL) * 2);
  }
  ctx.restore();

  // Vinheta suave nas bordas
  const vignette = ctx.createRadialGradient(roomX + roomW / 2, roomY + roomH / 2, roomH * 0.45, roomX + roomW / 2, roomY + roomH / 2, roomW * 0.75);
  vignette.addColorStop(0, 'rgba(13, 7, 20, 0)');
  vignette.addColorStop(1, 'rgba(13, 7, 20, 0.35)');
  ctx.fillStyle = vignette;
  ctx.fillRect(roomX, roomY, roomW, roomH);
}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
  ctx.lineWidth = 1;
  for (let c = 1; c < engine.ROOM.cols; c++) {
    const x = OFFSET_X + c * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, OFFSET_Y);
    ctx.lineTo(x, OFFSET_Y + ROOM_H * SCALE);
    ctx.stroke();
  }
  for (let r = 1; r < engine.ROOM.wallRows + engine.ROOM.floorRows; r++) {
    const y = OFFSET_Y + r * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(OFFSET_X, y);
    ctx.lineTo(OFFSET_X + ROOM_W * SCALE, y);
    ctx.stroke();
  }
}

/** Retângulo do cursor (verde = cabe, vermelho = não cabe, amarelo = selecionando item). */
function drawCursor(ctx, cursor) {
  const [w, h] = cursor.size || [1, 1];
  const rowOffset = cursor.area === 'wall' ? 0 : engine.ROOM.wallRows;
  const x = OFFSET_X + cursor.x * CELL;
  const y = OFFSET_Y + (rowOffset + cursor.y) * CELL;
  const colors = { valid: '#4ade80', invalid: '#f87171', select: '#fde047' };
  const color = colors[cursor.state] || colors.select;
  ctx.fillStyle = `${color}2e`;
  ctx.fillRect(x, y, w * CELL, h * CELL);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(x + 2, y + 2, w * CELL - 4, h * CELL - 4);
  ctx.setLineDash([]);
}

function drawText(ctx, text, x, y, { size = 24, color = TEXT, align = 'left', weight = 'bold', maxWidth = 0 } = {}) {
  ctx.font = font(size, weight);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  let content = String(text ?? '');
  if (maxWidth > 0) {
    while (content.length > 1 && ctx.measureText(content).width > maxWidth) content = content.slice(0, -1);
    if (content !== String(text ?? '')) content = `${content.slice(0, -1)}…`;
  }
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeText(content, x, y);
  ctx.fillStyle = color;
  ctx.fillText(content, x, y);
}

function drawHud(ctx, text) {
  const bg = ctx.createLinearGradient(0, 0, 0, 72);
  bg.addColorStop(0, '#22142f');
  bg.addColorStop(1, '#140b1d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, 72);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 68, WIDTH, 4);
  drawText(ctx, text.title, 24, 26, { size: 28, maxWidth: WIDTH - 260 });
  drawText(ctx, text.subtitle, 24, 54, { size: 18, color: MUTED, weight: 'normal', maxWidth: WIDTH - 260 });
  // Selo de Charme à direita
  ctx.fillStyle = '#2d1b45';
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 3;
  roundRect(ctx, WIDTH - 210, 12, 190, 48, 14);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, text.charm, WIDTH - 115, 37, { size: 22, color: '#fde68a', align: 'center', maxWidth: 176 });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Renderiza a casinha. options:
 *   text:   { title, subtitle, charm, label? } (já traduzidos)
 *   cursor: { area: 'wall'|'floor', x, y, size: [w, h], state: 'valid'|'invalid'|'select' }
 *   ghost:  { itemId, x, y, flip } item sendo posicionado
 *   hidden: uid de um item que está sendo movido (some do lugar antigo)
 *   edit:   mostra a grade
 */
async function renderHome(home, { text = {}, cursor = null, ghost = null, hidden = null, edit = false, now = Date.now() } = {}) {
  const { canvas: native, placements } = await drawRoomNative(home, { ghost, hidden });
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#140b1d';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Moldura do quarto
  ctx.fillStyle = '#2a1a3a';
  ctx.fillRect(OFFSET_X - 8, OFFSET_Y - 8, ROOM_W * SCALE + 16, ROOM_H * SCALE + 16);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(native, OFFSET_X, OFFSET_Y, ROOM_W * SCALE, ROOM_H * SCALE);

  drawLighting(ctx, placements, ambientFor(now));
  if (edit) drawGrid(ctx);
  if (cursor) drawCursor(ctx, cursor);
  drawHud(ctx, {
    title: text.title || '',
    subtitle: text.subtitle || '',
    charm: text.charm || '',
  });
  if (text.label) drawText(ctx, text.label, OFFSET_X + 12, OFFSET_Y + ROOM_H * SCALE - 20, { size: 18, color: '#fde68a', maxWidth: ROOM_W * SCALE - 200 });

  ctx.save();
  ctx.globalAlpha = 0.6;
  drawText(ctx, 'pyxie.com.br', WIDTH - OFFSET_X - 10, HEIGHT - 28, { size: 15, align: 'right', weight: 'bold' });
  ctx.restore();
  return canvas.toBuffer('image/png');
}

/** Paredes e pisos aparecem como amostra 3x3 (um tile sozinho não mostra o padrão). */
async function swatchFor(entry) {
  const tile = await getSprite(entry.sprite);
  if (!['wallpaper', 'flooring'].includes(entry.kind)) return tile;
  const canvas = createCanvas(TILE * 3, TILE * 3);
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) ctx.drawImage(tile, x * TILE, y * TILE);
  return canvas;
}

/**
 * Vitrine (loja do dia) ou mochila: grade de cartas com o sprite, nome, raridade e preço/quantidade.
 * entries: [{ itemId, label, sublabel }]
 */
async function renderShelf(entries, { title = '', lang = 'pt', columns = 5 } = {}) {
  const cardW = 148;
  const cardH = 176;
  const gap = 12;
  const rows = Math.max(1, Math.ceil(entries.length / columns));
  const width = columns * cardW + (columns + 1) * gap;
  const height = 64 + rows * cardH + (rows + 1) * gap;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#140b1d';
  ctx.fillRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, 0, 56);
  bg.addColorStop(0, '#22142f');
  bg.addColorStop(1, '#140b1d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, 56);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 52, width, 4);
  drawText(ctx, title, 20, 28, { size: 24, maxWidth: width - 40 });

  for (let i = 0; i < entries.length; i++) {
    const { itemId, label, sublabel } = entries[i];
    const entry = getItem(itemId);
    if (!entry) continue;
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = gap + col * (cardW + gap);
    const y = 64 + gap + row * (cardH + gap);
    const rarity = rarityInfo(entry.rarity);

    ctx.fillStyle = '#21142f';
    roundRect(ctx, x, y, cardW, cardH, 14);
    ctx.fill();
    ctx.strokeStyle = rarity.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    const sprite = await swatchFor(entry);
    const scale = Math.max(1, Math.floor(Math.min(96 / sprite.width, 88 / sprite.height)));
    const sw = sprite.width * scale;
    const sh = sprite.height * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, x + (cardW - sw) / 2, y + 12 + (88 - sh) / 2, sw, sh);

    drawText(ctx, label || itemName(entry, lang), x + cardW / 2, y + 120, { size: 15, align: 'center', maxWidth: cardW - 12 });
    drawText(ctx, rarity[lang === 'en' ? 'en' : 'pt'], x + cardW / 2, y + 140, { size: 13, color: rarity.color, align: 'center', weight: 'normal' });
    if (sublabel) drawText(ctx, sublabel, x + cardW / 2, y + 160, { size: 15, color: '#fde68a', align: 'center', maxWidth: cardW - 12 });
  }
  return canvas.toBuffer('image/png');
}

module.exports = {
  WIDTH,
  HEIGHT,
  renderHome,
  renderShelf,
  ambientFor,
};
