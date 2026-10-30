import React, { useState } from 'react';
import { Sparkles, Compass, BookOpen, Gift, ShieldCheck, Menu, X, ExternalLink, Globe, Terminal } from 'lucide-react';

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
        <nav className="hidden md:flex items-center gap-1 xl:gap-2 overflow-x-auto scrollbar-none">
          <a
            href={`/?lang=${lang}#pilares`}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            {t('nav.features')}
          </a>
          <a
            href={`/?lang=${lang}#comandos`}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>{t('nav.commands')}</span>
          </a>
          <a
            href={`/hyperfokus?lang=${lang}`}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold text-white bg-pink-600/30 hover:bg-pink-600/50 border border-[#E60067]/60 shadow-[0_0_12px_rgba(230,0,103,0.35)] transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E60067] shrink-0" />
            <span>{t('nav.blog')}</span>
          </a>
          <a
            href={`/wiki?lang=${lang}`}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{t('nav.wiki')}</span>
          </a>
          <a
            href={`/museu?lang=${lang}`}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>{t('nav.museum')}</span>
          </a>
          <a
            href={`/bonus?lang=${lang}`}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{t('nav.bonus')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              10s
            </span>
          </a>
          <a
            href={`/parcerias?lang=${lang}`}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t('nav.partnerships')}</span>
          </a>
          <a
            href="/discord"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            {t('nav.support')}
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
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
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080410]/95 backdrop-blur-2xl border-b border-purple-500/20 px-4 pt-3 pb-6 flex flex-col gap-2 animate-fadeIn">
          <a
            href={`/?lang=${lang}#pilares`}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5"
          >
            {t('nav.features')}
          </a>
          <a
            href={`/?lang=${lang}#comandos`}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between"
          >
            <span>{t('nav.commands')}</span>
            <Terminal className="w-4 h-4 text-pink-400" />
          </a>
          <a
            href={`/hyperfokus?lang=${lang}`}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-base font-bold text-white bg-pink-600/25 border border-[#E60067]/50 flex items-center justify-between"
          >
            <span>{t('nav.blog')}</span>
            <Sparkles className="w-4 h-4 text-[#E60067]" />
          </a>
          <a
            href={`/wiki?lang=${lang}`}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between"
          >
            <span>{t('nav.wiki')}</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </a>
          <a
            href={`/museu?lang=${lang}`}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between"
          >
            <span>{t('nav.museum')}</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </a>
          <a
            href={`/bonus?lang=${lang}`}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between"
          >
            <span>{t('nav.bonus')}</span>
            <Gift className="w-4 h-4 text-amber-400" />
          </a>
          <a
            href={`/parcerias?lang=${lang}`}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between"
          >
            <span>{t('nav.partnerships')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </a>
          <a
            href="/discord"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5"
          >
            {t('nav.support')}
          </a>
          <div className="pt-2 border-t border-purple-500/15 flex flex-col gap-2">
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

