// Idioma do site público: o CAMINHO manda (/en/... = inglês; sem /en = português), igual ao
// canonical e ao hreflang que o servidor gera (src/utils/seoRenderer.js). Navegador e
// preferência salva não trocam o idioma de uma URL (senão o Google indexa a página PT em EN).

// Espelho de EN_SLUGS do seoRenderer: páginas com versão /en/ própria.
const EN_SLUGS = {
  '/': '/',
  '/tarot': '/tarot',
  '/wiki': '/wiki',
  '/bonus': '/bonus',
  '/cringelandia': '/cringelandia',
  '/parcerias': '/partnerships',
  '/museu': '/museum',
  '/mercado': '/market',
  '/passe': '/pass',
  '/termos': '/terms',
  '/privacidade': '/privacy',
  '/pais-e-profissionais': '/parents',
  '/transparencia': '/transparency',
  '/planos': '/plans',
};

export function isEnPath(pathname = window.location.pathname) {
  return pathname === '/en' || pathname.startsWith('/en/');
}

/** Idioma da página atual: caminho /en primeiro; `?lang=` só vale em páginas sem versão /en. */
export function pathLang() {
  if (isEnPath()) return 'en';
  const q = new URLSearchParams(window.location.search).get('lang');
  return q === 'en' ? 'en' : 'pt';
}

/** Link interno no idioma certo: `/museu` → `/en/museum` em inglês. Sem versão /en: `?lang=en`. */
export function localizedHref(ptPath, lang, hash = '') {
  if (lang !== 'en') return `${ptPath}${hash}`;
  const slug = EN_SLUGS[ptPath];
  if (slug) return `${slug === '/' ? '/en/' : `/en${slug}`}${hash}`;
  return `${ptPath}?lang=en${hash}`;
}

/**
 * URL da página atual no outro idioma. O servidor transforma `?lang=` num 301 para o caminho
 * definitivo (/tarot?lang=en → /en/tarot), mantendo os outros parâmetros.
 */
export function switchLangHref(next) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  return `${url.pathname}${url.search}${url.hash}`;
}
