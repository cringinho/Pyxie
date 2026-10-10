import React from 'react';
import { Heart, ShieldCheck, Sparkles, BookOpen, Gift } from 'lucide-react';

export default function Footer({ t }) {
  return (
    <footer className="w-full bg-[#06030c] border-t border-purple-500/15 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex items-center gap-3">
          <img
            src="/assets/pyxie/pyxie_pixelart_face.png"
            alt="Pyxie Mascot Mini"
            className="w-8 h-8 rounded-lg border border-purple-500/30"
          />
          <div>
            <span className="font-title font-bold text-white text-base">Pyxie</span>
            <p className="text-xs text-slate-400">{t('footer.rights')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-300">
          <a href="/wiki" className="hover:text-pink-400 transition-colors">
            {t('footer.wiki')}
          </a>
          <a href="/museu" className="hover:text-pink-400 transition-colors">
            {t('footer.museum')}
          </a>
          <a href="/bonus" className="hover:text-pink-400 transition-colors">
            {t('footer.bonus')}
          </a>
          <a href="/termos" className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            {t('footer.terms')}
          </a>
          <a href="/promo" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
            Shopee
          </a>
          <a href="/discord" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}
