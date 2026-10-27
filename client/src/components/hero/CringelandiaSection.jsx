import React from 'react';
import { HeartHandshake, Map, Palette } from 'lucide-react';

// A outra metade do site (plano 5.11): a Cringelândia, casa da Pyxie.
export default function CringelandiaSection({ t }) {
  const cards = [
    { id: 'c1', icon: HeartHandshake, iconColor: 'text-pink-400', podBg: 'bg-pink-500/10 border-pink-500/30' },
    { id: 'c2', icon: Map, iconColor: 'text-violet-300', podBg: 'bg-violet-500/10 border-violet-500/30' },
    { id: 'c3', icon: Palette, iconColor: 'text-amber-300', podBg: 'bg-amber-500/10 border-amber-500/30' },
  ];

  return (
    <section id="cringelandia" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-500/10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-200 text-xs font-bold mb-3">
          <span>{t('cring.badge')}</span>
        </div>
        <h2 className="font-title font-black text-3xl sm:text-4xl text-white tracking-tight">{t('cring.title')}</h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-2">{t('cring.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map(({ id, icon: Icon, iconColor, podBg }) => (
          <div key={id} className="glass-panel rounded-2xl p-6">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${podBg}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
            </div>
            <h3 className="font-title font-bold text-lg text-white mb-2">{t(`cring.${id}Title`)}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{t(`cring.${id}Desc`)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/cringelandia" className="min-h-[48px] inline-flex items-center px-6 rounded-xl bg-pyxie-pink hover:bg-pyxie-neon text-white font-semibold">
          {t('cring.btnHub')}
        </a>
        <a href="/discord" target="_blank" rel="noopener" className="min-h-[48px] inline-flex items-center px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold">
          {t('cring.btnJoin')}
        </a>
        <a href="/pais-e-profissionais" className="min-h-[48px] inline-flex items-center px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold">
          {t('cring.btnParents')}
        </a>
      </div>
    </section>
  );
}
