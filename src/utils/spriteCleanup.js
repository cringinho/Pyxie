/**
 * Limpeza de sprites PNG com remoção de fundo mal feita (assets da Pyxie, do Astaroth e emojis).
 *
 * O defeito típico é um anel de 1 a 2 px de pixels claros, acinzentados e semitransparentes
 * por fora do contorno escuro, mais algumas ilhas soltas do fundo antigo. A limpeza:
 * 1. zera o alfa muito baixo (poeira de antialias);
 * 2. descasca, em poucas passadas, pixels claros e pouco saturados que encostam no transparente;
 * 3. remove ilhas opacas minúsculas desconectadas do desenho;
 * 4. opcionalmente endurece o alfa (bordas nítidas para pixel art).
 * Só descasca pixels semitransparentes, então rodar de novo num arquivo já limpo não muda nada.
 * Trabalha direto em buffers RGBA, então serve tanto para o sharp quanto para o canvas.
 */

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function defringeRgba(data, width, height, options = {}) {
  const { alphaCut = 96, passes = 2, minLum = 135, maxSat = 64, maxFringeAlpha = 255, minIsland = 6, hardEdge = true } = options;
  const total = width * height;
  const alphaAt = (p) => data[p * 4 + 3];

  for (let p = 0; p < total; p++) {
    if (alphaAt(p) < alphaCut) data[p * 4 + 3] = 0;
  }

  for (let pass = 0; pass < passes; pass++) {
    const peel = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        const a = alphaAt(p);
        if (a === 0 || a >= maxFringeAlpha) continue;
        const touchesClear =
          x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
          alphaAt(p - 1) === 0 || alphaAt(p + 1) === 0 || alphaAt(p - width) === 0 || alphaAt(p + width) === 0;
        if (!touchesClear) continue;
        const r = data[p * 4];
        const g = data[p * 4 + 1];
        const b = data[p * 4 + 2];
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        if (luminance(r, g, b) >= minLum && sat <= maxSat) peel.push(p);
      }
    }
    if (peel.length === 0) break;
    for (const p of peel) data[p * 4 + 3] = 0;
  }

  if (minIsland > 0) removeIslands(data, width, height, minIsland);

  if (hardEdge) {
    for (let p = 0; p < total; p++) data[p * 4 + 3] = data[p * 4 + 3] > 0 ? 255 : 0;
  }
  return data;
}

/** Apaga grupos opacos (vizinhança 8) menores que `minSize` pixels. */
function removeIslands(data, width, height, minSize) {
  const total = width * height;
  const seen = new Uint8Array(total);
  const stack = [];
  for (let start = 0; start < total; start++) {
    if (seen[start] || data[start * 4 + 3] === 0) continue;
    const group = [];
    stack.push(start);
    seen[start] = 1;
    while (stack.length > 0) {
      const p = stack.pop();
      group.push(p);
      const x = p % width;
      const y = (p - x) / width;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const n = ny * width + nx;
          if (!seen[n] && data[n * 4 + 3] > 0) {
            seen[n] = 1;
            stack.push(n);
          }
        }
      }
    }
    if (group.length < minSize) for (const p of group) data[p * 4 + 3] = 0;
  }
}

/** Limpa um PNG (Buffer) e devolve outro PNG, via sharp. */
async function cleanPngBuffer(buffer, options = {}) {
  const sharp = require('sharp');
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  defringeRgba(data, info.width, info.height, options);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

module.exports = { defringeRgba, removeIslands, cleanPngBuffer };
