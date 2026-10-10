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
    <header className="sticky top-0 z-50 w-full bg-[#080410]/80 backdrop-blur-2xl border-b border-purple-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/assets/pyxie/pyxie_pixelart_face.png"
              alt="Pyxie Mascot"
              className="w-10 h-10 object-contain rounded-xl border border-pink-500/30 group-hover:border-pink-500/60 transition-all shadow-neon-pink"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080410] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-title font-extrabold text-xl tracking-tight text-white group-hover:text-pink-400 transition-colors">
              Pyxie
            </span>
            <span className="text-[10px] font-mono font-medium text-purple-300/70 tracking-wider uppercase">
              Discord.js v14
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <a
            href={`/?lang=${lang}#pilares`}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            {t('nav.features')}
          </a>
          <a
            href={`/?lang=${lang}#comandos`}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-pink-400" />
            {t('nav.commands')}
          </a>
          <a
            href={`/wiki?lang=${lang}`}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            {t('nav.wiki')}
          </a>
          <a
            href={`/museu?lang=${lang}`}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            {t('nav.museum')}
          </a>
          <a
            href={`/bonus?lang=${lang}`}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            {t('nav.bonus')}
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              10s
            </span>
          </a>
          <a
            href="/discord"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            {t('nav.support')}
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5"
            title="Switch Language / Alternar Idioma"
          >
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>{lang === 'pt' ? 'PT-BR' : 'EN'}</span>
          </button>

          <a
            href="/invite"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 text-pink-200" />
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
            href="/discord"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5"
          >
            {t('nav.support')}
          </a>
          <div className="pt-2 border-t border-purple-500/15 flex flex-col gap-2">
            <a
              href="/invite"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-neon-pink"
            >
              {t('nav.invite')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

