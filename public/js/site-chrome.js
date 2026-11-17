/*
 * Comportamento do cabeçalho das páginas estáticas (src/utils/siteChrome.js).
 * Mesmo comportamento do Navbar do React: encolhe ao rolar, esconde ao descer no
 * celular, barra de progresso, submenu "Comunidade" e menu lateral.
 */
(function () {
  'use strict';
  // Páginas em inglês: blog e conta só trocam de idioma via ?lang=en (o HTML servido traz a URL limpa).
  if (document.documentElement.lang.toLowerCase().indexOf('en') === 0) {
    var langOnly = document.querySelectorAll('.pxc-header a[href^="/hyperfokus"], .pxc-header a[href^="/meu-perfil"], .pxc-drawer a[href^="/hyperfokus"], .pxc-drawer a[href^="/meu-perfil"], .pxc-footer a[href^="/hyperfokus"], .pxc-footer a[href^="/meu-perfil"]');
    for (var k = 0; k < langOnly.length; k++) {
      var href = langOnly[k].getAttribute('href');
      if (href.indexOf('lang=') === -1) langOnly[k].setAttribute('href', href + (href.indexOf('?') === -1 ? '?' : '&') + 'lang=en');
    }
  }

  var header = document.querySelector('[data-pxc-header]');
  if (!header) return;

  var body = document.body;
  var drawer = document.querySelector('[data-pxc-drawer]');
  var scrim = document.querySelector('[data-pxc-scrim]');
  var openBtn = header.querySelector('[data-pxc-open]');
  var closeBtn = drawer && drawer.querySelector('[data-pxc-close]');
  var progress = header.querySelector('[data-pxc-progress]');

  // Âncora do "pular para o conteúdo": o primeiro <main> da página (ou o que vem logo após o header).
  if (!document.getElementById('pxc-main')) {
    var main = document.querySelector('main') || (scrim && scrim.nextElementSibling && scrim.nextElementSibling.nextElementSibling);
    if (main) {
      main.id = main.id || 'pxc-main';
      if (main.id !== 'pxc-main') {
        var skip = document.querySelector('.pxc-skip');
        if (skip) skip.setAttribute('href', '#' + main.id);
      }
    }
  }

  // 1) Rolagem: encolhe, mostra progresso e esconde ao descer (volta ao subir).
  var lastY = window.scrollY;
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    header.classList.toggle('is-scrolled', y > 12);
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    var down = y > lastY + 6;
    var up = y < lastY - 6;
    if (y < 120 || up) header.classList.remove('is-hidden');
    else if (down && !body.classList.contains('pxc-menu-open')) header.classList.add('is-hidden');
    if (down || up) lastY = y;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // 2) Submenu "Comunidade": abre no hover (mouse) e no clique/teclado; fecha com Esc ou clique fora.
  var pop = header.querySelector('[data-pxc-pop]');
  if (pop) {
    var popBtn = pop.querySelector('button');
    var popLinks = pop.querySelectorAll('a');
    var setPop = function (open) {
      pop.classList.toggle('is-open', open);
      popBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      for (var i = 0; i < popLinks.length; i++) popLinks[i].tabIndex = open ? 0 : -1;
    };
    setPop(false);
    pop.addEventListener('mouseenter', function () { setPop(true); });
    pop.addEventListener('mouseleave', function () { setPop(false); });
    popBtn.addEventListener('click', function (e) {
      // Com mouse o hover já abriu; pelo teclado (detail 0) alterna.
      setPop(e.detail === 0 ? !pop.classList.contains('is-open') : true);
    });
    document.addEventListener('mousedown', function (e) {
      if (!pop.contains(e.target)) setPop(false);
    });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setPop(false);
        popBtn.focus();
      }
    });
  }

  // 3) Menu lateral.
  if (!drawer || !openBtn) return;
  var focusTimer = null;
  function setMenu(open) {
    body.classList.toggle('pxc-menu-open', open);
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      drawer.removeAttribute('inert');
      header.classList.remove('is-hidden');
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(function () {
        var first = drawer.querySelector('a, button');
        if (first) first.focus();
      }, 320);
    } else {
      drawer.setAttribute('inert', '');
      window.clearTimeout(focusTimer);
    }
  }
  openBtn.addEventListener('click', function () {
    var willOpen = !body.classList.contains('pxc-menu-open');
    setMenu(willOpen);
    if (!willOpen) openBtn.focus();
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); openBtn.focus(); });
  if (scrim) scrim.addEventListener('click', function () { setMenu(false); });
  drawer.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('pxc-menu-open')) {
      setMenu(false);
      openBtn.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && body.classList.contains('pxc-menu-open')) setMenu(false);
  });
  // Deslizar para a direita fecha.
  var startX = null;
  drawer.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  drawer.addEventListener('touchend', function (e) {
    if (startX === null) return;
    if (e.changedTouches[0].clientX - startX > 70) setMenu(false);
    startX = null;
  });

  // 4) Botão de idioma: guarda a escolha para as páginas do app React também.
  var langLink = header.querySelector('[data-pxc-lang]');
  if (langLink) {
    langLink.addEventListener('click', function () {
      try {
        window.localStorage.setItem('pyxie_lang', langLink.getAttribute('data-pxc-lang'));
      } catch (_) {
        /* storage bloqueado: só a navegação muda */
      }
    });
  }
})();
