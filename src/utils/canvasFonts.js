const path = require('path');

/**
 * Fontes do @napi-rs/canvas. A VM não tem fontconfig: os nomes genéricos (`sans-serif`, `serif`)
 * não resolvem direito (sans-serif virava DejaVu Serif) e não existe fonte de emoji,
 * então emojis e símbolos viravam quadradinhos vazios.
 * Use `withEmojiFallback('bold 20px sans-serif')` ao definir `ctx.font`: troca o nome genérico
 * por famílias concretas e adiciona o fallback de emojis coloridos.
 */
const EMOJI_FONT_FAMILY = 'Twemoji';
const BUNDLED_SANS_FAMILY = 'PyxieSans';
let registered = false;

function ensureCanvasFonts() {
  if (registered) return;
  registered = true;
  try {
    const { GlobalFonts } = require('@napi-rs/canvas');
    const dir = path.join(__dirname, '..', '..', 'assets', 'fonts');
    GlobalFonts.registerFromPath(path.join(dir, 'Twemoji.Mozilla.ttf'), EMOJI_FONT_FAMILY);
    // Rede de segurança caso o sistema não tenha DejaVu instalada
    GlobalFonts.registerFromPath(path.join(dir, 'DejaVuSans-Bold.ttf'), BUNDLED_SANS_FAMILY);
  } catch (err) {
    console.warn('[canvasFonts] Falha ao registrar fontes de fallback:', err.message);
  }
}

function withEmojiFallback(font) {
  const tail = `${BUNDLED_SANS_FAMILY}, ${EMOJI_FONT_FAMILY}`;
  if (/\bsans-serif\s*$/.test(font)) return font.replace(/\bsans-serif\s*$/, `"DejaVu Sans", ${tail}`);
  if (/\bserif\s*$/.test(font)) return font.replace(/\bserif\s*$/, `"DejaVu Serif", "DejaVu Sans", ${tail}`);
  return `${font}, ${tail}`;
}

module.exports = { ensureCanvasFonts, withEmojiFallback, EMOJI_FONT_FAMILY };
