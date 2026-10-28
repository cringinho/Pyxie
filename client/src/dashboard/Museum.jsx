import React, { useCallback, useEffect, useState } from 'react';
import { Images, Pencil, RefreshCw, Trash2, UsersRound } from 'lucide-react';
import { api } from './api';
import { Button, Notice, Spinner, StatTile } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

// Museu da comunidade (área global do dono): acervo, edição, remoção e coleta de artes.
export default function Museum({ t }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api.museumArts(page, search).then(setData).catch((e) => setError(e.code || 'generic'));
  }, [page, search]);
  useEffect(load, [load]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;

  const run = async (fn, okKey) => {
    setNotice(null);
    try {
      await fn();
      setNotice({ tone: 'ok', text: t(okKey) });
      load();
    } catch (e) {
      setNotice({ tone: 'error', text: t('error.generic', { error: e.code || 'generic' }) });
    }
  };

  const h = data.harvester || {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatTile icon={Images} label={t('museum.arts')} value={data.totalUnfiltered.toLocaleString()} />
        <StatTile icon={UsersRound} accent="violet" label={t('museum.authors')} value={data.uniqueAuthorsCount.toLocaleString()} />
        <StatTile icon={RefreshCw} accent="cyan" label={t('museum.lastHarvest')} value={h.lastRunAt ? new Date(h.lastRunAt).toLocaleDateString() : '—'} hint={h.completed ? t('museum.harvestDone') : null} />
      </div>

      <div className="flex flex-wrap gap-2">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(query);
          }}
        >
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('museum.search')} aria-label={t('museum.search')} className={field} />
          <Button variant="ghost" type="submit">
            {t('museum.searchBtn')}
          </Button>
        </form>
        <Button onClick={() => run(() => api.museumHarvest(50), 'museum.harvestSent')}>{t('museum.harvest')}</Button>
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {data.arts.length === 0 && <p className="text-sm text-white/60">{t('museum.empty')}</p>}

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.arts.map((art) => (
          <li key={art.id} className="dash-card overflow-hidden rounded-2xl">
            <img src={art.imageUrl} alt={art.description || t('museum.artBy', { author: art.author })} loading="lazy" className="aspect-square w-full bg-black/40 object-cover" />
            <div className="space-y-2 p-3 text-sm">
              {editing?.id === art.id ? (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => api.museumEdit(art.id, { author: editing.author, description: editing.description }), 'museum.saved').then(() => setEditing(null));
                  }}
                >
                  <input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} aria-label={t('museum.author')} className={field} />
                  <textarea value={editing.description} rows={3} onChange={(e) => setEditing({ ...editing, description: e.target.value })} aria-label={t('museum.description')} className="dash-field w-full rounded-xl p-2 text-sm" />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {t('features.save')}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      {t('museum.cancel')}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-semibold">{art.author}</p>
                  {art.description && <p className="line-clamp-3 text-white/70">{art.description}</p>}
                  <p className="font-mono text-[11px] text-white/40">{new Date(art.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setEditing({ id: art.id, author: art.author, description: art.description })}>
                      <Pencil size={14} className="mr-1 inline" aria-hidden="true" />
                      {t('museum.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-300"
                      onClick={() => window.confirm(t('museum.confirmDelete', { author: art.author })) && run(() => api.museumDelete(art.id), 'museum.deleted')}
                    >
                      <Trash2 size={14} aria-label={t('museum.delete')} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center gap-3 text-sm">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          ←
        </Button>
        <span>{t('museum.page', { page: data.page, total: data.totalPages })}</span>
        <Button variant="ghost" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
          →
        </Button>
      </div>
    </div>
  );
}
