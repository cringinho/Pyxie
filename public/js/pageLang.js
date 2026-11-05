/*
 * Idioma das páginas institucionais (Termos, Privacidade, Transparência, Para pais).
 * Uma regra só para todas (auditoria Q025/Q027):
 *   1. o idioma é o que o servidor entregou em <html lang> (decidido pela URL: /en/... = inglês);
 *   2. trocar de idioma leva à URL do outro idioma (tirada do <link rel="alternate" hreflang>),
 *      e o idioma escolhido fica salvo para as próximas visitas.
 */
(function () {
  function serverLang() {
    var l = String(document.documentElement.getAttribute('lang') || '').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'pt';
  }

  function save(lang) {
    try {
      localStorage.setItem('pyxie_lang', lang);
    } catch (_) {}
  }

  function urlFor(lang) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + (lang === 'en' ? 'en' : 'pt-BR') + '"]');
    if (!link) return null;
    try {
      var u = new URL(link.getAttribute('href'), window.location.href);
      if (u.search) return null; // link antigo com ?lang=: troca na própria página
      return u.pathname + window.location.hash;
    } catch (_) {
      return null;
    }
  }

  window.PyxiePageLang = {
    initial: serverLang,
    save: save,
    /** Vai para a URL do idioma pedido. Devolve false quando a troca deve ser feita na própria página. */
    go: function (next) {
      save(next);
      var target = urlFor(next);
      if (target && target !== window.location.pathname + window.location.hash) {
        window.location.assign(target);
        return true;
      }
      return false;
    },
  };
})();
