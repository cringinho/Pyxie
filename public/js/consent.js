/*
 * Consentimento de cookies (LGPD) — auditoria Q034.
 *
 * Carrega ANTES do Google Tag Manager, do gtag e do AdSense e liga o Consent Mode do Google
 * com tudo negado por padrão: Analytics e anúncios só usam cookies depois do "Aceitar".
 * "Só os necessários" mantém a negação (o AdSense passa a servir anúncios não personalizados).
 * A escolha fica salva neste navegador e pode ser mudada pelo link "Preferências de cookies".
 */
(function () {
  var KEY = 'pyxie_cookie_consent';
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  if (typeof window.gtag !== 'function') window.gtag = gtag;

  function readChoice() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'granted' || v === 'denied' ? v : null;
    } catch (_) {
      return null;
    }
  }

  function signals(state) {
    return {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    };
  }

  var choice = readChoice();
  var initial = signals(choice === 'granted' ? 'granted' : 'denied');
  initial.functionality_storage = 'granted';
  initial.security_storage = 'granted';
  initial.wait_for_update = 500;
  gtag('consent', 'default', initial);
  gtag('set', 'ads_data_redaction', choice !== 'granted');

  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.requestNonPersonalizedAds = choice === 'granted' ? 0 : 1;

  var TEXT = {
    pt: {
      label: 'Aviso de cookies',
      body: 'Usamos cookies do Google (estatísticas de visita e anúncios) só se você deixar. Os necessários, como idioma e login, funcionam sempre.',
      accept: 'Aceitar',
      reject: 'Só os necessários',
      more: 'Política de Privacidade',
      moreHref: '/privacidade',
    },
    en: {
      label: 'Cookie notice',
      body: 'We only use Google cookies (visit statistics and ads) if you allow it. Necessary ones, like language and sign-in, always work.',
      accept: 'Accept',
      reject: 'Necessary only',
      more: 'Privacy Policy',
      moreHref: '/en/privacy',
    },
  };

  function lang() {
    var l = String(document.documentElement.getAttribute('lang') || '').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'pt';
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, state);
    } catch (_) {}
    gtag('consent', 'update', signals(state));
    gtag('set', 'ads_data_redaction', state !== 'granted');
    window.adsbygoogle.requestNonPersonalizedAds = state === 'granted' ? 0 : 1;
    var el = document.getElementById('pyxie-consent');
    if (el) el.parentNode.removeChild(el);
  }

  function show() {
    if (document.getElementById('pyxie-consent')) return;
    var tx = TEXT[lang()];
    var box = document.createElement('div');
    box.id = 'pyxie-consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', tx.label);
    box.style.cssText =
      'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:560px;margin:0 auto;' +
      'background:#140a26;color:#f1f5f9;border:1px solid rgba(236,72,153,.45);border-radius:16px;' +
      'padding:14px 16px;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5);';
    var p = document.createElement('p');
    p.style.cssText = 'margin:0 0 10px;';
    p.textContent = tx.body + ' ';
    var a = document.createElement('a');
    a.href = tx.moreHref;
    a.textContent = tx.more;
    a.style.cssText = 'color:#f9a8d4;text-decoration:underline;';
    p.appendChild(a);
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;';
    function btn(label, primary, onClick) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText =
        'min-height:40px;padding:8px 16px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;' +
        (primary
          ? 'background:#db2777;color:#fff;border:1px solid #db2777;'
          : 'background:transparent;color:#f1f5f9;border:1px solid rgba(203,213,225,.5);');
      b.addEventListener('click', onClick);
      return b;
    }
    // Os dois botões têm o mesmo peso de escolha: recusar é tão fácil quanto aceitar.
    row.appendChild(btn(tx.reject, false, function () { save('denied'); }));
    row.appendChild(btn(tx.accept, true, function () { save('granted'); }));
    box.appendChild(p);
    box.appendChild(row);
    document.body.appendChild(box);
  }

  window.PyxieConsent = { open: show, choice: readChoice };

  if (!choice) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
    else show();
  }
})();
