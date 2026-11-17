import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, BookOpen, Gift, ShieldCheck, X, Globe, Terminal, User, ChevronDown, Feather, Palette, Heart } from 'lucide-react';
import { localeHref, switchLangHref } from '../../utils/localePath';

// Links do desktop: sublinhado em gradiente que cresce no hover (classe .nav-link no index.css).
const linkBase =
  'nav-link whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5';
const drawerLink =
  'drawer-item px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 active:bg-white/10 flex items-center justify-between';

// Itens do grupo "Comunidade": o blog é um item comum aqui (o destaque da home é o "Adicionar Pyxie").
function communityItems(lang, t) {
  return [
    { href: localeHref('/hyperfokus', lang), label: t('nav.blog'), desc: t('nav.blogDesc'), Icon: Feather, color: 'text-pink-400' },
    { href: localeHref('/museu', lang), label: t('nav.museum'), desc: t('nav.museumDesc'), Icon: Palette, color: 'text-fuchsia-400' },
    { href: localeHref('/parcerias', lang), label: t('nav.partnerships'), desc: t('nav.partnershipsDesc'), Icon: ShieldCheck, color: 'text-emerald-400' },
    { href: localeHref('/cringelandia', lang), label: t('nav.cringelandia'), desc: t('nav.cringelandiaDesc'), Icon: Heart, color: 'text-rose-400' },
  ];
}

function CommunityMenu({ lang, t }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`${linkBase} ${open ? 'text-white' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        // Com mouse o hover já abriu, então o clique só confirma; pelo teclado (detail 0) alterna.
        onClick={(e) => setOpen((v) => (e.detail === 0 ? !v : true))}
      >
        <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
        <span>{t('nav.community')}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {/* Sempre montado: o menu "desce" com fade e escala em vez de aparecer seco */}
      <div className={`nav-pop absolute left-0 top-full pt-2 z-50 ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <ul className="w-72 rounded-2xl border border-purple-500/25 bg-[#0f0820]/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/50">
          {communityItems(lang, t).map(({ href, label, desc, Icon, color }) => (
            <li key={href}>
              <a href={href} tabIndex={open ? 0 : -1} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 focus-visible:bg-white/5 outline-none">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                <span>
                  <span className="block text-sm font-semibold text-white">{label}</span>
                  <span className="block text-xs text-slate-400">{desc}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Navbar({ lang, setLang, t, stats }) {
  // Selo ligado ao status real do bot (/api/stats): verde só quando o processo está no ar.
  const online = stats?.online;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const progressRef = useRef(null);
  const drawerRef = useRef(null);
  const menuBtnRef = useRef(null);
  const touchStartX = useRef(null);

  const close = useCallback(() => setMenuOpen(false), []);

  const toggleLang = () => {
    const next = lang === 'pt' ? 'en' : 'pt';
    try {
      localStorage.setItem('pyxie_lang', next);
    } catch (_) {}
    // Páginas com URL por idioma: vai para a URL do outro idioma (/wiki <-> /en/wiki).
    const target = switchLangHref(window.location, next);
    if (target) {
      window.location.assign(target);
      return;
    }
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState({}, '', url);
  };

  // Rolagem: encolhe o header, mostra a barra de progresso e esconde ao descer (volta ao subir).
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrolled(y > 12);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, y / max)})`;
      const goingDown = y > lastY + 6;
      const goingUp = y < lastY - 6;
      if (y < 120 || goingUp) setHidden(false);
      else if (goingDown) setHidden(true);
      if (goingDown || goingUp) lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Menu lateral: trava a rolagem do fundo, fecha com Esc e devolve o foco ao botão.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    const focusTimer = window.setTimeout(() => drawerRef.current?.querySelector('a, button')?.focus(), 320);
    const btn = menuBtnRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(focusTimer);
      btn?.focus?.();
    };
  }, [menuOpen]);

  // Deslizar o menu para a direita fecha.
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > 70) close();
  };

  const headerState = `${scrolled ? 'is-scrolled' : ''} ${hidden && !menuOpen ? 'is-hidden' : ''}`;
  const hasStatus = online !== null && online !== undefined;

  return (
    <>
      <header className={`pyx-header sticky top-0 z-50 w-full ${headerState}`}>
        <div className="pyx-header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Marca */}
          <a href={localeHref('/', lang)} className="flex items-center gap-2.5 group shrink-0 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/assets/pyxie/sticker/sticker_smile-128.webp"
                alt="Pyxie Mascot"
                width="36"
                height="36"
                className="pyx-logo w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
              />
              {hasStatus && (
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080410] ${online ? 'bg-emerald-400' : 'bg-slate-500'}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-title font-black text-lg tracking-tight text-white group-hover:text-pink-400 transition-colors leading-none">
                Pyxie
              </span>
              {hasStatus && (
                <span className="text-[9px] font-mono font-medium text-purple-300/70 tracking-wider uppercase mt-1 hidden min-[380px]:block">
                  {t(online ? 'nav.statusOnline' : 'nav.statusOffline')}
                </span>
              )}
            </div>
          </a>

          {/* Navegação desktop (a partir de 1024px; abaixo disso entra o menu lateral) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label={t('nav.mainMenu')}>
            <a href={localeHref('/#pilares', lang)} className={linkBase}>
              {t('nav.features')}
            </a>
            <a href={localeHref('/#comandos', lang)} className={linkBase}>
              <Terminal className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>{t('nav.commands')}</span>
            </a>
            <CommunityMenu lang={lang} t={t} />
            <a href={localeHref('/wiki', lang)} className={linkBase}>
              <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{t('nav.wiki')}</span>
            </a>
            <a href={localeHref('/bonus', lang)} className={linkBase}>
              <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('nav.bonus')}</span>
            </a>
            <a href="/discord" target="_blank" rel="noopener noreferrer" className={linkBase}>
              {t('nav.support')}
            </a>
          </nav>

          {/* Ações */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={localeHref('/meu-perfil', lang)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-pink-500/40 transition-all whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-pink-400" />
              <span>{t('nav.account')}</span>
            </a>

            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px]"
              title="Switch Language / Alternar Idioma"
            >
              <Globe className="w-3.5 h-3.5 text-pink-400" />
              <span>{lang === 'pt' ? 'PT-BR' : 'EN'}</span>
            </button>

            <a
              href="/discord?ref=site"
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-200" />
              <span>{t('nav.invite')}</span>
            </a>

            {/* Hambúrguer que vira X */}
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-200 bg-white/5 hover:bg-white/10 border border-purple-500/20"
              aria-label={t('nav.toggleMenu')}
              aria-expanded={menuOpen}
              aria-controls="pyx-drawer"
            >
              <span className={`pyx-burger ${menuOpen ? 'is-open' : ''}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        {/* Barra de progresso de leitura */}
        <div className="pyx-progress" aria-hidden="true">
          <div ref={progressRef} className="pyx-progress-bar" />
        </div>
      </header>

      {/* Menu lateral (slide da direita) + fundo escurecido */}
      <div className={`pyx-scrim lg:hidden ${menuOpen ? 'is-open' : ''}`} onClick={close} aria-hidden="true" />
      <aside
        id="pyx-drawer"
        ref={drawerRef}
        className={`pyx-drawer lg:hidden ${menuOpen ? 'is-open' : ''}`}
        aria-label={t('nav.mainMenu')}
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : ''}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-purple-500/15">
          <span className="font-title font-black text-lg text-white">Pyxie</span>
          <button
            type="button"
            onClick={close}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-white bg-white/5 border border-purple-500/20"
            aria-label={t('nav.toggleMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 flex flex-col gap-1" aria-label={t('nav.mainMenu')}>
          <a href={localeHref('/#pilares', lang)} onClick={close} className={drawerLink} style={{ '--i': 0 }}>
            <span>{t('nav.features')}</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </a>
          <a href={localeHref('/#comandos', lang)} onClick={close} className={drawerLink} style={{ '--i': 1 }}>
            <span>{t('nav.commands')}</span>
            <Terminal className="w-4 h-4 text-pink-400" />
          </a>
          <a href={localeHref('/wiki', lang)} onClick={close} className={drawerLink} style={{ '--i': 2 }}>
            <span>{t('nav.wiki')}</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </a>
          <a href={localeHref('/bonus', lang)} onClick={close} className={drawerLink} style={{ '--i': 3 }}>
            <span>{t('nav.bonus')}</span>
            <Gift className="w-4 h-4 text-amber-400" />
          </a>

          <p className="drawer-item mt-4 mb-1 px-4 text-[11px] font-bold uppercase tracking-wider text-purple-300/70" style={{ '--i': 4 }}>
            {t('nav.community')}
          </p>
          {communityItems(lang, t).map(({ href, label, Icon, color }, idx) => (
            <a key={href} href={href} onClick={close} className={drawerLink} style={{ '--i': 5 + idx }}>
              <span>{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </a>
          ))}

          <div className="mt-3 pt-3 border-t border-purple-500/15 flex flex-col gap-1">
            <a href="/discord" target="_blank" rel="noopener noreferrer" className={drawerLink} style={{ '--i': 9 }}>
              <span>{t('nav.support')}</span>
            </a>
            <a href={localeHref('/meu-perfil', lang)} onClick={close} className={drawerLink} style={{ '--i': 10 }}>
              <span>{t('nav.account')}</span>
              <User className="w-4 h-4 text-pink-400" />
            </a>
          </div>
        </nav>

        <div className="shrink-0 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-purple-500/15 bg-[#0a0516]/80">
          <a
            href="/discord?ref=site-menu"
            target="_blank"
            rel="noopener noreferrer"
            className="shimmer block w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-neon-pink"
          >
            {t('nav.invite')}
          </a>
        </div>
      </aside>
    </>
  );
}
