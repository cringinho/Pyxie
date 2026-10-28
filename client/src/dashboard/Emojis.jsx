import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { Button, Notice, Spinner } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

function SlotEmoji({ slot }) {
  if (slot.currentUrl) return <img src={slot.currentUrl} alt={slot.currentName || slot.label} width="28" height="28" className="h-7 w-7 object-contain" />;
  return <span className="text-xl" aria-hidden="true">{slot.fallback}</span>;
}

// Escolha de emoji do app (grade com busca).
function Picker({ t, emojis, onPick, onClose }) {
  const [q, setQ] = useState('');
  const list = q ? emojis.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())) : emojis;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t('emojis.pick')} className="dash-card w-full max-w-lg rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('emojis.searchEmoji')} aria-label={t('emojis.searchEmoji')} className={`${field} mb-3`} />
        <div className="grid max-h-80 grid-cols-6 gap-2 overflow-y-auto sm:grid-cols-8">
          {list.map((e) => (
            <button key={e.id} type="button" title={e.name} onClick={() => onPick(e)} className="flex h-11 items-center justify-center rounded-lg hover:bg-white/10">
              <img src={e.url} alt={e.name} loading="lazy" className="h-8 w-8 object-contain" />
            </button>
          ))}
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={onClose}>
          {t('museum.cancel')}
        </Button>
      </div>
    </div>
  );
}

// Emojis dos embeds da Pyxie (área global do dono): troca o emoji de cada espaço sem reiniciar.
export default function Emojis({ t }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [currencies, setCurrencies] = useState(null);

  const load = useCallback(() => {
    api.embedSlots().then(setData).catch((e) => setError(e.code || 'generic'));
    api.currencies().then((d) => setCurrencies(d.currencies)).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const embeds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = data?.embeds || [];
    return q ? all.filter((e) => `${e.name} ${e.id} ${e.category}`.toLowerCase().includes(q)) : all;
  }, [data, query]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;

  const saveCurrency = async (key, emojiId) => {
    setNotice(null);
    try {
      const res = await api.saveCurrency(key, emojiId);
      setCurrencies(res.currencies);
      setNotice({ tone: 'ok', text: t('emojis.saved') });
    } catch (e) {
      setNotice({ tone: 'error', text: t('error.generic', { error: e.code || 'generic' }) });
    }
  };

  const save = async (embedId, slotKey, emojiId) => {
    setNotice(null);
    try {
      await api.saveEmbedSlot(embedId, slotKey, emojiId);
      setNotice({ tone: 'ok', text: t(emojiId ? 'emojis.saved' : 'emojis.reset') });
      load();
    } catch (e) {
      setNotice({ tone: 'error', text: t('error.generic', { error: e.code || 'generic' }) });
    }
  };

  return (
    <div className="space-y-4">
      {currencies && (
        <div className="dash-card rounded-2xl p-4">
          <p className="mb-3 font-title font-bold">{t('emojis.currencies')}</p>
          <ul className="space-y-2">
            {['coins', 'magicBeans'].map((key) => {
              const c = currencies[key];
              if (!c) return null;
              return (
                <li key={key} className="flex items-center gap-3 text-sm">
                  <img src={c.currentUrl} alt={t(`emojis.currency.${key}`)} width="28" height="28" className="h-7 w-7 object-contain" />
                  <span className="min-w-0 flex-1 font-semibold">{t(`emojis.currency.${key}`)}</span>
                  <Button variant="ghost" className="min-h-[36px] px-3" onClick={() => setEditing({ currencyKey: key })}>
                    {t('emojis.change')}
                  </Button>
                  {c.isCustomized && (
                    <button type="button" className="text-xs text-white/50 hover:text-white" onClick={() => saveCurrency(key, c.defaultId)}>
                      {t('emojis.default')}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="text-sm text-white/60">{t('emojis.hint', { count: data.count })}</p>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('emojis.search')} aria-label={t('emojis.search')} className={field} />
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <ul className="grid gap-3 lg:grid-cols-2">
        {embeds.map((embed) => (
          <li key={embed.id} className="dash-card rounded-2xl p-4">
            <p className="font-title font-bold">{embed.name}</p>
            <p className="mb-3 text-xs text-white/50">
              {embed.category} · <span className="font-mono">{embed.id}</span>
            </p>
            <ul className="space-y-2">
              {embed.slots.map((slot) => (
                <li key={slot.key} className="flex items-center gap-3 text-sm">
                  <SlotEmoji slot={slot} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{slot.label}</span>
                    {slot.description && <span className="block truncate text-xs text-white/50">{slot.description}</span>}
                  </span>
                  <Button variant="ghost" className="min-h-[36px] px-3" onClick={() => setEditing({ embedId: embed.id, slotKey: slot.key })}>
                    {t('emojis.change')}
                  </Button>
                  <button type="button" className="text-xs text-white/50 hover:text-white" onClick={() => save(embed.id, slot.key, '')}>
                    {t('emojis.default')}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {editing && (
        <Picker
          t={t}
          emojis={data.appEmojis}
          onClose={() => setEditing(null)}
          onPick={(e) => {
            if (editing.currencyKey) saveCurrency(editing.currencyKey, e.id);
            else save(editing.embedId, editing.slotKey, e.id);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
