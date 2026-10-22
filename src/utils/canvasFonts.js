const path = require('path');

/**
 * Registra uma única vez as fontes de fallback do @napi-rs/canvas.
 * A VM só tem DejaVu instalada: sem isso, emojis em nomes e textos viram quadradinhos vazios.
 * Use `withEmojiFallback('bold 20px sans-serif')` ao definir `ctx.font`.
 */
const EMOJI_FONT_FAMILY = 'Twemoji';
let registered = false;

function ensureCanvasFonts() {
  if (registered) return;
  registered = true;
  try {
    const { GlobalFonts } = require('@napi-rs/canvas');
    GlobalFonts.registerFromPath(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Twemoji.Mozilla.ttf'), EMOJI_FONT_FAMILY);
  } catch (err) {
    console.warn('[canvasFonts] Falha ao registrar fonte de emojis:', err.message);
  }
}

function withEmojiFallback(font) {
  return `${font}, ${EMOJI_FONT_FAMILY}`;
}

module.exports = { ensureCanvasFonts, withEmojiFallback, EMOJI_FONT_FAMILY };
