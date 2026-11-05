// Validação das imagens configuráveis do evento sazonal (baú, guia).
// O Discord só mostra imagem em embed se o endereço for https e apontar para
// um arquivo de imagem. O antigo padrão `link_do_bau_halloween.png` era um
// link provisório que nunca existiu: tratamos como vazio para não mandar
// embed com imagem quebrada.
const PLACEHOLDER_RE = /link_do_bau/i;
const IMAGE_URL_RE = /^https:\/\/[^\s"'<>]+\.(png|jpe?g|gif|webp)(\?[^\s"'<>]*)?$/i;

function isValidImageUrl(url) {
  if (typeof url !== 'string') return false;
  const clean = url.trim();
  if (!clean || clean.length > 1000) return false;
  if (PLACEHOLDER_RE.test(clean)) return false;
  return IMAGE_URL_RE.test(clean);
}

/** Primeiro endereço válido da lista, ou null (aí o embed sai sem imagem). */
function pickImageUrl(...candidates) {
  for (const c of candidates) {
    if (isValidImageUrl(c)) return c.trim();
  }
  return null;
}

module.exports = { isValidImageUrl, pickImageUrl };
