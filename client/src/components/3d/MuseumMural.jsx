import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Mural 2D do Museu para celular: sem three.js (a cena 3D pesa ~490 KB e nem é desenhada
 * no celular). Só obras reais da API; sem obras ou com falha, um aviso honesto.
 */
export default function MuseumMural({ t, lang }) {
  const [arts, setArts] = useState(null); // null = carregando
  const museumHref = lang === 'en' ? '/en/museum' : '/museu';

  useEffect(() => {
    let alive = true;
    fetch('/api/museum/arts?limit=12')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => alive && setArts(data && data.success && Array.isArray(data.arts) ? data.arts : []))
      .catch(() => alive && setArts([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="museu-deck" className="relative py-12 border-t border-purple-500/10">
      <div className="px-4 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>{t('museum.badge')}</span>
        </div>
        <h2 className="font-title font-black text-3xl text-white tracking-tight">{t('museum.mobileTitle')}</h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto mt-2">{t('museum.mobileSubtitle')}</p>
      </div>

      {arts === null ? (
        <div className="flex gap-4 overflow-hidden px-4" aria-busy="true" aria-label={t('museum.loading')}>
          {[0, 1].map((i) => (
            <div key={i} className="shrink-0 w-64 h-[300px] rounded-2xl glass-panel border border-pink-500/20 animate-pulse" />
          ))}
        </div>
      ) : arts.length === 0 ? (
        <p className="px-6 text-center text-slate-300 text-sm">{t('museum.emptyGallery')}</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto px-4 py-2 scrollbar-none snap-x">
          {arts.map((art) => (
            <a
              key={art.id}
              href={`${museumHref}?art=${encodeURIComponent(art.id)}`}
              className="shrink-0 w-64 rounded-2xl glass-panel p-3 border border-pink-500/30 snap-center"
            >
              <img
                src={art.imageUrl}
                alt={t('museum.artAlt').replace('{author}', `@${art.authorUsername || art.author || t('museum.author')}`)}
                loading="lazy"
                width="232"
                height="232"
                className="w-full h-56 object-contain rounded-xl bg-black/40"
              />
              <div className="mt-3 text-left">
                <div className="text-pink-400 font-bold text-sm truncate">@{art.authorUsername || art.author}</div>
                {art.description && <div className="text-slate-300 text-xs truncate">{art.description}</div>}
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <a
          href={museumHref}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 border border-purple-400/30"
        >
          <Sparkles className="w-4 h-4 text-pink-300" />
          <span>{t('museum.exploreAll')}</span>
        </a>
      </div>
    </section>
  );
}
