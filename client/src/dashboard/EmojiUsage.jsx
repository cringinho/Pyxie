import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { Badge, Notice, Spinner } from './ui';

const DAY = 24 * 60 * 60 * 1000;

// Uso dos emojis do próprio servidor: do menos usado para o mais usado. Não apaga nada.
export default function EmojiUsage({ t, guildId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [idleOnly, setIdleOnly] = useState(false);
  useEffect(() => {
    api.emojiUsage(guildId).then(setData).catch((e) => setError(e.code || 'generic'));
  }, [guildId]);

  const list = useMemo(() => {
    if (!data) return [];
    const now = Date.now();
    return data.emojis
      .map((e) => ({ ...e, idle: !e.lastUsedAt || now - e.lastUsedAt > 60 * DAY }))
      .filter((e) => !idleOnly || e.idle)
      .sort((a, b) => a.count - b.count || (a.lastUsedAt || 0) - (b.lastUsedAt || 0));
  }, [data, idleOnly]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;
  const date = (ms) => new Date(ms).toLocaleDateString();
  const exportCsv = () => {
    if (!data?.emojis) return;
    const header = 'id,name,count,lastUsedAt,idle\n';
    const rows = data.emojis.map((e) => `${e.id},${e.name},${e.count},${e.lastUsedAt || 0},${Boolean(e.idle)}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pyxie-emojis-${guildId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const idleCount = data.emojis.filter((e) => !e.lastUsedAt || Date.now() - e.lastUsedAt > 60 * DAY).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">{data.since ? t('emojiUse.since', { date: date(data.since) }) : t('emojiUse.starting')}</p>
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={idleOnly} onChange={(e) => setIdleOnly(e.target.checked)} className="accent-pink-500" />
          {t('emojiUse.idleOnly', { count: idleCount })}
        </label>
        <button type="button" onClick={exportCsv} className="min-h-[36px] rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold hover:bg-white/10 text-white">
          {t('emojiUse.exportCsv')}
        </button>
      </div>
      {data.emojis.length === 0 && <p className="text-sm text-white/60">{t('emojiUse.none')}</p>}
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => (
          <li key={e.id} className="dash-card flex items-center gap-3 rounded-2xl p-3 text-sm">
            <img src={e.url} alt={`:${e.name}:`} width="32" height="32" loading="lazy" className="h-8 w-8 object-contain" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono">:{e.name}:</span>
              <span className="block text-xs text-white/50">{e.lastUsedAt ? t('emojiUse.last', { date: date(e.lastUsedAt) }) : t('emojiUse.never')}</span>
            </span>
            <span className="text-right">
              <span className="block font-title font-bold">{e.count.toLocaleString()}</span>
              {e.idle && <Badge tone="muted">{t('emojiUse.idle')}</Badge>}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-white/40">{t('emojiUse.note')}</p>
    </div>
  );
}
