import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, BookOpen, Gift, ShieldCheck, Menu, X, Globe, Terminal, User, ChevronDown, Feather, Palette, Heart } from 'lucide-react';

const linkBase =
  'whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5';
const drawerLink =
  'px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between';

// Itens do grupo "Comunidade": o blog é um item comum aqui (o destaque da home é o "Adicionar Pyxie").
function communityItems(lang, t) {
  return [
    { href: `/hyperfokus?lang=${lang}`, label: t('nav.blog'), desc: t('nav.blogDesc'), Icon: Feather, color: 'text-pink-400' },
    { href: `/museu?lang=${lang}`, label: t('nav.museum'), desc: t('nav.museumDesc'), Icon: Palette, color: 'text-fuchsia-400' },
    { href: `/parcerias?lang=${lang}`, label: t('nav.partnerships'), desc: t('nav.partnershipsDesc'), Icon: ShieldCheck, color: 'text-emerald-400' },
    { href: `/cringelandia?lang=${lang}`, label: t('nav.cringelandia'), desc: t('nav.cringelandiaDesc'), Icon: Heart, color: 'text-rose-400' },
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
        className={`${linkBase} ${open ? 'text-white bg-white/5' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        // Com mouse o hover já abriu, então o clique só confirma; pelo teclado (detail 0) alterna.
        onClick={(e) => setOpen((v) => (e.detail === 0 ? !v : true))}
      >
        <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
        <span>{t('nav.community')}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <ul className="w-72 rounded-2xl border border-purple-500/25 bg-[#0f0820]/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/50">
            {communityItems(lang, t).map(({ href, label, desc, Icon, color }) => (
              <li key={href}>
                <a href={href} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 focus-visible:bg-white/5 outline-none">
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
      )}
    </div>
  );
}

export default function Navbar({ lang, setLang, t }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLang = () => {
    const next = lang === 'pt' ? 'en' : 'pt';
    setLang(next);
    localStorage.setItem('pyxie_lang', next);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState({}, '', url);
  };
  const close = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080410]/85 backdrop-blur-2xl border-b border-purple-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <img
              src="/assets/pyxie/sticker/sticker_smile.png"
              alt="Pyxie Mascot"
              width="36"
              height="36"
              className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080410] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-title font-black text-lg tracking-tight text-white group-hover:text-pink-400 transition-colors leading-none">
              Pyxie
            </span>
            <span className="text-[9px] font-mono font-medium text-purple-300/70 tracking-wider uppercase mt-1">
              v14 • Online
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 xl:gap-2" aria-label={lang === 'pt' ? 'Menu principal' : 'Main menu'}>
          <a href={`/?lang=${lang}#pilares`} className={linkBase}>
            {t('nav.features')}
          </a>
          <a href={`/?lang=${lang}#comandos`} className={linkBase}>
            <Terminal className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>{t('nav.commands')}</span>
          </a>
          <CommunityMenu lang={lang} t={t} />
          <a href={`/wiki?lang=${lang}`} className={linkBase}>
            <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{t('nav.wiki')}</span>
          </a>
          <a href={`/bonus?lang=${lang}`} className={`${linkBase} hidden lg:flex`}>
            <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{t('nav.bonus')}</span>
          </a>
          <a href="/discord" target="_blank" rel="noopener noreferrer" className={`${linkBase} hidden lg:flex`}>
            {t('nav.support')}
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`/meu-perfil?lang=${lang}`}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-pink-500/40 transition-all whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5 text-pink-400" />
            <span>{t('nav.account')}</span>
          </a>

          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="Switch Language / Alternar Idioma"
          >
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>{lang === 'pt' ? 'PT-BR' : 'EN'}</span>
          </button>

          <a
            href="/invite?ref=site"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span>{t('nav.invite')}</span>
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-purple-500/20"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#080410]/95 backdrop-blur-2xl border-b border-purple-500/20 px-4 pt-3 pb-6 flex flex-col gap-1 animate-fadeIn">
          <a href={`/?lang=${lang}#pilares`} onClick={close} className={drawerLink}>
            {t('nav.features')}
          </a>
          <a href={`/?lang=${lang}#comandos`} onClick={close} className={drawerLink}>
            <span>{t('nav.commands')}</span>
            <Terminal className="w-4 h-4 text-pink-400" />
          </a>
          <a href={`/wiki?lang=${lang}`} onClick={close} className={drawerLink}>
            <span>{t('nav.wiki')}</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </a>
          <a href={`/bonus?lang=${lang}`} onClick={close} className={drawerLink}>
            <span>{t('nav.bonus')}</span>
            <Gift className="w-4 h-4 text-amber-400" />
          </a>

          <p className="mt-3 mb-1 px-4 text-[11px] font-bold uppercase tracking-wider text-purple-300/70">{t('nav.community')}</p>
          {communityItems(lang, t).map(({ href, label, Icon, color }) => (
            <a key={href} href={href} onClick={close} className={drawerLink}>
              <span>{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </a>
          ))}

          <div className="mt-3 pt-3 border-t border-purple-500/15 flex flex-col gap-1">
            <a href="/discord" target="_blank" rel="noopener noreferrer" className={drawerLink}>
              {t('nav.support')}
            </a>
            <a href={`/meu-perfil?lang=${lang}`} onClick={close} className={drawerLink}>
              <span>{t('nav.account')}</span>
              <User className="w-4 h-4 text-pink-400" />
            </a>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="/invite?ref=site-menu"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-neon-pink"
            >
              {t('nav.invite')}
            </a>
            <a
              href="/install?ref=site-menu"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 rounded-xl font-bold text-slate-100 border border-purple-500/40 hover:bg-white/5"
            >
              {t('nav.install')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
