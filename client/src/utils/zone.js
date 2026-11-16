// Zonas do site: o portal Pyxie é em inglês por padrão; o ecossistema Cringelândia é em PT-BR.
const CRINGELANDIA_SEGMENTS = ['cringelandia', 'museu', 'museum', 'parcerias', 'partnerships', 'hyperfokus', 'mercado', 'market', 'passe', 'pass'];

/** Primeiro segmento do caminho, ignorando o prefixo de idioma (/en). */
function firstSegment(pathname) {
  const parts = String(pathname || '/').toLowerCase().split('/').filter(Boolean);
  if (parts[0] === 'en') parts.shift();
  return parts[0] || '';
}

export function isCringelandiaPath(pathname) {
  return CRINGELANDIA_SEGMENTS.includes(firstSegment(pathname));
}

/** Idioma padrão da página quando o visitante ainda não escolheu nenhum. */
export function defaultLangFor(pathname) {
  return isCringelandiaPath(pathname) ? 'pt' : 'en';
}

/** Prioridade: ?lang= > prefixo /en > escolha salva > padrão da zona. */
export function resolveInitialLang(location, storage) {
  const queryLang = new URLSearchParams(location.search).get('lang');
  if (queryLang === 'pt' || queryLang === 'en') return queryLang;
  if (/^\/en(\/|$)/i.test(location.pathname)) return 'en';
  try {
    const stored = storage?.getItem('pyxie_lang');
    if (stored === 'pt' || stored === 'en') return stored;
  } catch (_) {
    /* storage bloqueado: segue para o padrão */
  }
  return defaultLangFor(location.pathname);
}
