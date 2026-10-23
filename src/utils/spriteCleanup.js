/**
 * Limpeza de sprites PNG com remoção de fundo mal feita (assets da Pyxie, do Astaroth e emojis).
 *
 * O defeito típico é um anel de 1 a 2 px de pixels claros, acinzentados e semitransparentes
 * por fora do contorno escuro, mais algumas ilhas soltas do fundo antigo. A limpeza:
 * 1. zera o alfa muito baixo (poeira de antialias);
 * 2. descasca, em poucas passadas, pixels claros e pouco saturados que encostam no transparente,
 *    e depois os opacos que sobraram do lado de fora de um contorno escuro;
 * 3. remove ilhas opacas minúsculas desconectadas do desenho;
 * 4. reconstrói a borda: `edges: 'smooth'` (padrão) recria o antisserrilhado por superamostragem
 *    da máscara, `'hard'` deixa o alfa binário (pixel art) e `'keep'` mantém o alfa que sobrou.
 * Trabalha direto em buffers RGBA, então serve tanto para o sharp quanto para o canvas.
 */

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function defringeRgba(data, width, height, options = {}) {
  const {
    alphaCut = 96,
    passes = 2,
    opaquePasses = 1,
    minLum = 135,
    maxSat = 64,
    darkLum = 90,
    maxFringeAlpha = 255,
    minIsland = 6,
    edges = 'smooth',
  } = options;
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

  // Restos opacos do halo: claros, colados no transparente e encostados num contorno escuro
  for (let pass = 0; pass < opaquePasses; pass++) {
    const peel = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = y * width + x;
        if (alphaAt(p) === 0) continue;
        const r = data[p * 4];
        const g = data[p * 4 + 1];
        const b = data[p * 4 + 2];
        if (luminance(r, g, b) < minLum || Math.max(r, g, b) - Math.min(r, g, b) > maxSat) continue;
        let clear = false;
        let dark = false;
        for (const q of [p - 1, p + 1, p - width, p + width]) {
          if (alphaAt(q) === 0) clear = true;
          else if (luminance(data[q * 4], data[q * 4 + 1], data[q * 4 + 2]) < darkLum) dark = true;
        }
        if (clear && dark) peel.push(p);
      }
    }
    if (peel.length === 0) break;
    for (const p of peel) data[p * 4 + 3] = 0;
  }

  if (minIsland > 0) removeIslands(data, width, height, minIsland);

  if (edges === 'hard') {
    for (let p = 0; p < total; p++) data[p * 4 + 3] = data[p * 4 + 3] > 0 ? 255 : 0;
  } else if (edges === 'smooth') {
    smoothEdges(data, width, height, options);
  }
  return data;
}

/**
 * Antisserrilhado da silhueta: a máscara binária é ampliada `scale` vezes com interpolação
 * bilinear, levemente borrada, cortada em 50% e reduzida pela média de cada bloco. Bordas retas
 * continuam no mesmo lugar e os degraus das diagonais e curvas viram alfa parcial.
 * Antes, a cor dos pixels vizinhos ao desenho é "sangrada" para fora, para a borda nova não
 * puxar preto nem o branco do fundo antigo.
 */
function smoothEdges(data, width, height, { scale = 4, blur = 3 } = {}) {
  const total = width * height;
  const mask = new Float32Array(total);
  for (let p = 0; p < total; p++) mask[p] = data[p * 4 + 3] > 0 ? 1 : 0;
  bleedColors(data, width, height, mask, 2);

  const W = width * scale;
  const H = height * scale;
  let hi = new Float32Array(W * H);
  const at = (x, y) => (x < 0 || y < 0 || x >= width || y >= height ? 0 : mask[y * width + x]);
  for (let Y = 0; Y < H; Y++) {
    const fy = (Y + 0.5) / scale - 0.5;
    const y0 = Math.floor(fy);
    const ty = fy - y0;
    for (let X = 0; X < W; X++) {
      const fx = (X + 0.5) / scale - 0.5;
      const x0 = Math.floor(fx);
      const tx = fx - x0;
      const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
      const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
      hi[Y * W + X] = top * (1 - ty) + bottom * ty;
    }
  }
  if (blur > 0) hi = boxBlur(hi, W, H, Math.max(1, Math.round((blur * scale) / 2)));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let covered = 0;
      for (let sy = 0; sy < scale; sy++) {
        const row = (y * scale + sy) * W + x * scale;
        for (let sx = 0; sx < scale; sx++) if (hi[row + sx] >= 0.5) covered++;
      }
      data[(y * width + x) * 4 + 3] = Math.round((255 * covered) / (scale * scale));
    }
  }
  return data;
}

/** Copia para pixels transparentes vizinhos a média de cor dos pixels opacos ao redor. */
function bleedColors(data, width, height, mask, passes) {
  const filled = Float32Array.from(mask);
  for (let pass = 0; pass < passes; pass++) {
    const next = Float32Array.from(filled);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        if (filled[p]) continue;
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const q = ny * width + nx;
            if (!filled[q]) continue;
            r += data[q * 4];
            g += data[q * 4 + 1];
            b += data[q * 4 + 2];
            n++;
          }
        }
        if (n > 0) {
          data[p * 4] = Math.round(r / n);
          data[p * 4 + 1] = Math.round(g / n);
          data[p * 4 + 2] = Math.round(b / n);
          next[p] = 1;
        }
      }
    }
    filled.set(next);
  }
}

/** Borrão de caixa separável (horizontal e vertical) de raio `radius`. */
function boxBlur(src, width, height, radius) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = radius * 2 + 1;
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) sum += src[y * width + Math.min(width - 1, Math.max(0, x))];
    for (let x = 0; x < width; x++) {
      tmp[y * width + x] = sum / span;
      const add = Math.min(width - 1, x + radius + 1);
      const drop = Math.max(0, x - radius);
      sum += src[y * width + add] - src[y * width + drop];
    }
  }
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(height - 1, Math.max(0, y)) * width + x];
    for (let y = 0; y < height; y++) {
      out[y * width + x] = sum / span;
      const add = Math.min(height - 1, y + radius + 1);
      const drop = Math.max(0, y - radius);
      sum += tmp[add * width + x] - tmp[drop * width + x];
    }
  }
  return out;
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

module.exports = { defringeRgba, smoothEdges, removeIslands, cleanPngBuffer };
