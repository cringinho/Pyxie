// Idioma pela URL (AGENTS.md §1 e §8): PT na raiz, EN em /en/... — o mesmo mapa do
// src/utils/seoRenderer.js (EN_SLUGS). Assim o React mostra o idioma que o servidor
// entregou e os links já apontam para a URL final, sem passar pelo 301 do `?lang=`.

// Páginas com versão própria em cada idioma (canonical PT -> slug EN).
const LOCALIZED = {
  '/': '/',
  '/wiki': '/wiki',
  '/bonus': '/bonus',
  '/tarot': '/tarot',
  '/parcerias': '/partnerships',
  '/museu': '/museum',
  '/mercado': '/market',
  '/termos': '/terms',
  '/privacidade': '/privacy',
  '/pais-e-profissionais': '/parents',
  '/transparencia': '/transparency',
};

const EN_TO_PT = Object.fromEntries(Object.entries(LOCALIZED).map(([pt, en]) => [en, pt]));

function cleanPath(pathname) {
  const p = String(pathname || '/').split(/[?#]/)[0].replace(/\/+$/, '');
  return p || '/';
}

/** 'en' em /en ou /en/..., 'pt' numa página localizada em PT, null fora delas. */
export function langFromPath(pathname) {
  const p = cleanPath(pathname).toLowerCase();
  if (p === '/en' || p.startsWith('/en/')) return 'en';
  if (LOCALIZED[p] || EN_TO_PT[p]) return 'pt';
  return null;
}

/**
 * Link de uma página no idioma pedido. Recebe o caminho em PT (ex.: '/museu', '/#pilares').
 * Páginas sem versão por URL (ex.: /hyperfokus, /meu-perfil) seguem com `?lang=`.
 */
export function localeHref(ptHref, lang) {
  const raw = String(ptHref || '/');
  const hashIdx = raw.indexOf('#');
  const hash = hashIdx >= 0 ? raw.slice(hashIdx) : '';
  const base = cleanPath(hashIdx >= 0 ? raw.slice(0, hashIdx) : raw);
  if (Object.prototype.hasOwnProperty.call(LOCALIZED, base)) {
    if (lang !== 'en') return `${base}${hash}`;
    const en = LOCALIZED[base];
    return `${en === '/' ? '/en/' : `/en${en}`}${hash}`;
  }
  return `${base}?lang=${lang === 'en' ? 'en' : 'pt'}${hash}`;
}

/** URL equivalente da página atual no outro idioma (null se a página não tiver versão por URL). */
export function switchLangHref(location, nextLang) {
  const p = cleanPath(location.pathname);
  const lower = p.toLowerCase();
  let ptBase = null;
  if (lower === '/en' || lower.startsWith('/en/')) {
    const rest = cleanPath(lower.slice(3));
    ptBase = EN_TO_PT[rest] || (LOCALIZED[rest] ? rest : null);
  } else if (LOCALIZED[lower]) {
    ptBase = lower;
  } else if (EN_TO_PT[lower]) {
    ptBase = EN_TO_PT[lower];
  }
  if (!ptBase) return null;
  const target = localeHref(ptBase, nextLang);
  const params = new URLSearchParams(location.search || '');
  params.delete('lang');
  const qs = params.toString();
  return `${target}${qs ? `?${qs}` : ''}${location.hash || ''}`;
}
