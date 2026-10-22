const fs = require('fs');
const path = require('path');

/**
 * Emojis coloridos para cards Satori: o Satori pede cada emoji via `loadAdditionalAsset('emoji', segmento)`
 * e espera uma imagem. Buscamos o SVG do Twemoji uma única vez e guardamos em memória e em disco.
 */
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/';
const CACHE_DIR = path.join(__dirname, '..', '..', 'data', 'cache', 'twemoji');
const FETCH_TIMEOUT_MS = 3000;
const EMPTY_SVG = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"/>').toString('base64')}`;

const memoryCache = new Map();

/** Converte o emoji no nome de arquivo do Twemoji (ex.: "1f469-200d-1f4bb"). */
function toTwemojiCode(segment) {
  const chars = [...String(segment)];
  // Twemoji descarta o seletor de variação FE0F, exceto em sequências com ZWJ (200D)
  const keepVs = chars.some((c) => c.codePointAt(0) === 0x200d);
  return chars
    .map((c) => c.codePointAt(0))
    .filter((cp) => keepVs || cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join('-');
}

function readDiskCache(code) {
  try {
    const file = path.join(CACHE_DIR, `${code}.svg`);
    if (fs.existsSync(file)) return fs.readFileSync(file);
  } catch (_) {}
  return null;
}

function writeDiskCache(code, buffer) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(path.join(CACHE_DIR, `${code}.svg`), buffer);
  } catch (_) {}
}

async function fetchSvg(code) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${TWEMOJI_BASE}${code}.svg`, { signal: controller.signal });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retorna um data URI SVG do emoji. Em caso de falha devolve um SVG vazio (nunca um quadradinho).
 */
async function getEmojiDataUri(segment) {
  const code = toTwemojiCode(segment);
  if (!code) return EMPTY_SVG;
  if (memoryCache.has(code)) return memoryCache.get(code);

  let svg = readDiskCache(code);
  if (!svg) {
    svg = await fetchSvg(code);
    // Alguns emojis só existem no Twemoji com o FE0F mantido
    if (!svg && String(segment).includes('️')) {
      const withVs = [...String(segment)].map((c) => c.codePointAt(0).toString(16)).join('-');
      svg = await fetchSvg(withVs);
    }
    if (svg) writeDiskCache(code, svg);
  }

  const dataUri = svg ? `data:image/svg+xml;base64,${svg.toString('base64')}` : EMPTY_SVG;
  if (svg) {
    if (memoryCache.size > 500) memoryCache.delete(memoryCache.keys().next().value);
    memoryCache.set(code, dataUri);
  }
  return dataUri;
}

module.exports = { getEmojiDataUri, toTwemojiCode, EMPTY_SVG };
