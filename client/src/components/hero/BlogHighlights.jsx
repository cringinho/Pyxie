import React, { useEffect, useState } from 'react';
import { ArrowRight, Feather } from 'lucide-react';

// "Do blog": os 3 artigos mais recentes do Hyperfokus. Sem artigo publicado, a seção não aparece.
export default function BlogHighlights({ t, lang }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let alive = true;
    fetch('/api/hyperfokus/latest?limit=3')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d?.articles && setArticles(d.articles))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!articles.length) return null;
  const q = lang === 'en' ? '?lang=en' : '';
  const dateFmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'medium', timeZone: 'America/Sao_Paulo' });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" aria-labelledby="home-blog-title">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5" /> {t('home.blog.kicker')}
          </p>
          <h2 id="home-blog-title" className="font-title font-black text-2xl sm:text-3xl text-white mt-1">
            {t('home.blog.title')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t('home.blog.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/meu-perfil/escrever${q}`} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 border border-purple-500/30 hover:bg-white/5">
            {t('home.blog.write')}
          </a>
          <a href={`/hyperfokus${q}`} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-pink-600/80 hover:bg-pink-600 inline-flex items-center gap-1.5">
            {t('home.blog.all')} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <a
            key={a.slug}
            href={`/hyperfokus/${encodeURIComponent(a.slug)}${q}`}
            className="group flex flex-col rounded-2xl overflow-hidden bg-[#120a24]/80 border border-purple-500/20 hover:border-pink-500/50 transition-colors"
          >
            <img src={a.cover} alt="" loading="lazy" className="w-full aspect-[1200/630] object-cover" />
            <div className="p-4 flex flex-col gap-2 flex-1">
              {a.tags?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {a.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-bold uppercase text-pink-300 bg-pink-500/10 border border-pink-500/30 rounded-full px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="font-title font-bold text-white text-lg leading-snug group-hover:text-pink-300 transition-colors">{a.title}</h3>
              {a.excerpt && <p className="text-sm text-slate-400 line-clamp-2">{a.excerpt}</p>}
              <p className="mt-auto text-xs text-slate-400">
                {[a.author, a.publishedAt ? dateFmt.format(new Date(a.publishedAt)) : null, t('home.blog.minutes').replace('{n}', a.readingTimeMinutes)]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
