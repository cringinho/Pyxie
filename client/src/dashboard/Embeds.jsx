import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { PreviewEmbed } from './Studio';
import { Button, Card, Notice, Spinner } from './ui';

// Embeds da Pyxie na Cringelândia (plano 5.2): qualquer embed que o bot manda aparece aqui sozinho e
// pode ganhar cor, textos, imagens e emojis do app. A mudança vale no próximo envio.
const field = 'min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm';
const area = 'w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm';
const emptyOverride = () => ({ color: '', title: '', description: '', footer: '', author: '', thumbnailUrl: '', imageUrl: '', footerIcon: 'auto', emojiSwaps: [] });
const FOOTER_ICONS = ['auto', 'smile', 'happy', 'worried', 'sad', 'none'];
// Atalhos de miniatura: as artes da Pyxie servidas pelo próprio site, ou nenhuma (tira até a automática).
const THUMB_PRESETS = [
  { id: 'auto', value: () => '' },
  { id: 'pixel', img: '/assets/pyxie/pyxie_pixelart.png', value: (origin) => `${origin}/assets/pyxie/pyxie_pixelart.png` },
  { id: 'victory', img: '/assets/pyxie/sticker/sticker_win_victory.png', value: (origin) => `${origin}/assets/pyxie/sticker/sticker_win_victory.png` },
  { id: 'none', value: () => 'none' },
];

// Embed da API do Discord -> formato da prévia do estúdio.
function toPreview(e = {}) {
  return {
    color: typeof e.color === 'number' ? `#${e.color.toString(16).padStart(6, '0')}` : '#1e1f22',
    author: { name: e.author?.name || '' },
    title: e.title || '',
    url: e.url || '',
    description: e.description || '',
    fields: (e.fields || []).map((f) => ({ name: f.name || '', value: f.value || '', inline: Boolean(f.inline) })),
    thumbnailUrl: e.thumbnail?.url || '',
    imageUrl: e.image?.url || '',
    footer: { text: e.footer?.text || '', iconUrl: e.footer?.icon_url || '' },
    timestamp: Boolean(e.timestamp),
  };
}

function EmojiPicker({ t, guildId, onPick, onClose }) {
  const [emojis, setEmojis] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => {
    api.studioEmojis(guildId).then((d) => setEmojis(d.emojis)).catch(() => setEmojis([]));
  }, [guildId]);
  const list = (emojis || []).filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 240);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={t('embeds.pickEmoji')}>
      <div className="glass-panel w-full max-w-lg rounded-2xl p-4">
        <div className="mb-3 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('studio.search')} aria-label={t('studio.search')} className={field} autoFocus />
          <Button variant="ghost" onClick={onClose}>
            {t('studio.close')}
          </Button>
        </div>
        {!emojis ? (
          <Spinner label={t('app.loading')} />
        ) : (
          <div className="grid max-h-80 grid-cols-6 gap-2 overflow-y-auto sm:grid-cols-8">
            {list.map((e) => (
              <button key={e.id} type="button" title={e.name} onClick={() => onPick(`{emoji:${e.name}}`)} className="flex h-11 items-center justify-center rounded-lg hover:bg-white/10">
                <img src={e.url} alt={e.name} loading="lazy" className="h-7 w-7" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Lista de trocas "este emoji → emoji do app".
function SwapList({ t, guildId, swaps, onChange }) {
  const [picking, setPicking] = useState(null);
  const set = (i, patch) => onChange(swaps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-2">
      {swaps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={s.from} onChange={(e) => set(i, { from: e.target.value })} placeholder="🪙" aria-label={t('embeds.swapFrom')} className={`${field} w-20 shrink-0 text-center`} />
          <span aria-hidden="true">→</span>
          <input value={s.to} onChange={(e) => set(i, { to: e.target.value })} placeholder="{emoji:pyxie_coin}" aria-label={t('embeds.swapTo')} className={field} />
          <Button variant="ghost" onClick={() => setPicking(i)}>
            🙂
          </Button>
          <Button variant="ghost" onClick={() => onChange(swaps.filter((_, j) => j !== i))}>
            ✕
          </Button>
        </div>
      ))}
      <Button variant="ghost" onClick={() => onChange([...swaps, { from: '', to: '' }])}>
        {t('embeds.addSwap')}
      </Button>
      {picking !== null && (
        <EmojiPicker
          t={t}
          guildId={guildId}
          onClose={() => setPicking(null)}
          onPick={(code) => {
            set(picking, { to: code });
            setPicking(null);
          }}
        />
      )}
    </div>
  );
}

function GlobalSwaps({ t, guildId, initial }) {
  const [swaps, setSwaps] = useState(initial);
  const [status, setStatus] = useState(null);
  const save = async () => {
    try {
      const res = await api.saveEmbedsGlobal(guildId, swaps.filter((s) => s.from && s.to));
      setSwaps(res.global.emojiSwaps);
      setStatus({ ok: true, text: t('embeds.saved') });
    } catch (e) {
      setStatus({ ok: false, text: t('error.generic', { error: e.code }) });
    }
  };
  return (
    <Card title={t('embeds.globalTitle')}>
      <p className="mb-3 text-sm text-white/70">{t('embeds.globalHint')}</p>
      <SwapList t={t} guildId={guildId} swaps={swaps} onChange={setSwaps} />
      <Button onClick={save} className="mt-3 w-full sm:w-auto">
        {t('embeds.save')}
      </Button>
      {status && <Notice tone={status.ok ? 'success' : 'error'}>{status.text}</Notice>}
    </Card>
  );
}

function TextField({ t, label, value, onChange, multiline, onEmoji }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold text-white/70">
        {label}
        <button type="button" onClick={onEmoji} className="rounded px-2 py-1 text-white/70 hover:bg-white/10" aria-label={t('embeds.pickEmoji')}>
          🙂
        </button>
      </span>
      <Tag value={value} onChange={(e) => onChange(e.target.value)} rows={multiline ? 5 : undefined} placeholder={t('embeds.keepPlaceholder')} className={multiline ? area : field} />
    </label>
  );
}

function Editor({ t, guildId, embedKey, onClose, onSaved }) {
  const [data, setData] = useState(null);
  const [o, setO] = useState(emptyOverride());
  const [after, setAfter] = useState(null);
  const [picking, setPicking] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .embed(guildId, embedKey)
      .then((d) => {
        setData(d);
        setO({ ...emptyOverride(), ...d.override });
      })
      .catch((e) => setStatus({ ok: false, text: t('error.generic', { error: e.code }) }));
  }, [guildId, embedKey]);

  // Prévia com a mesma regra do bot (feita no servidor), meio segundo depois de parar de digitar.
  useEffect(() => {
    if (!data) return undefined;
    const timer = setTimeout(() => {
      api.previewEmbed(guildId, embedKey, o).then((d) => setAfter(d.after)).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [o, data, guildId, embedKey]);

  if (!data) return status ? <Notice tone="error">{status.text}</Notice> : <Spinner label={t('app.loading')} />;
  const set = (patch) => setO({ ...o, ...patch });
  const run = async (fn, okText) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fn();
      setStatus({ ok: true, text: typeof okText === 'function' ? okText(res) : okText });
      onSaved();
    } catch (e) {
      setStatus({ ok: false, text: t('error.generic', { error: e.code }) });
    }
    setBusy(false);
  };
  const ctx = { emojis: new Map(), guildName: 'Cringelândia' };
  const sent = data.entry.sent?.length || 0;

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onClose}>
        ← {t('embeds.back')}
      </Button>
      <Card title={`${data.entry.command} · ${data.entry.sample?.title || data.entry.shape}`}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold text-white/60">{t('embeds.original')}</p>
            <PreviewEmbed e={toPreview(data.entry.sample)} ctx={ctx} />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold text-white/60">{t('embeds.withChanges')}</p>
            <PreviewEmbed e={toPreview(after || data.entry.sample)} ctx={ctx} />
          </div>
        </div>
        <p className="mt-3 text-xs text-white/50">{t('embeds.sampleNote')}</p>
      </Card>

      <Card title={t('embeds.editTitle')}>
        <p className="mb-3 text-sm text-white/70">{t('embeds.templateHint')}</p>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/70">{t('embeds.color')}</span>
            <input type="color" value={o.color || '#8b5cf6'} onChange={(e) => set({ color: e.target.value })} aria-label={t('embeds.color')} className="h-11 w-16 rounded" />
            {o.color && (
              <Button variant="ghost" onClick={() => set({ color: '' })}>
                {t('embeds.keepColor')}
              </Button>
            )}
          </label>
          <TextField t={t} label={t('embeds.title')} value={o.title} onChange={(v) => set({ title: v })} onEmoji={() => setPicking('title')} />
          <TextField t={t} label={t('embeds.description')} value={o.description} onChange={(v) => set({ description: v })} onEmoji={() => setPicking('description')} multiline />
          <TextField t={t} label={t('embeds.author')} value={o.author} onChange={(v) => set({ author: v })} onEmoji={() => setPicking('author')} />
          <TextField t={t} label={t('embeds.footer')} value={o.footer} onChange={(v) => set({ footer: v })} onEmoji={() => setPicking('footer')} />
          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-white/70">{t('embeds.footerIcon')}</legend>
            <div className="flex flex-wrap gap-2">
              {FOOTER_ICONS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={o.footerIcon === id}
                  onClick={() => set({ footerIcon: id })}
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm ${o.footerIcon === id ? 'bg-fuchsia-500/30 ring-1 ring-fuchsia-300' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  {!['auto', 'none'].includes(id) && <img src={`/assets/pyxie/sticker/footer/${id}.png`} alt="" className="h-5 w-5" />}
                  {t(`embeds.icon.${id}`)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('embeds.thumbnail')}</span>
            <input value={o.thumbnailUrl === 'none' ? '' : o.thumbnailUrl} onChange={(e) => set({ thumbnailUrl: e.target.value })} placeholder={t('embeds.thumbAuto')} className={field} />
          </label>
          <div className="flex flex-wrap gap-2">
            {THUMB_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={o.thumbnailUrl === p.value(location.origin)}
                onClick={() => set({ thumbnailUrl: p.value(location.origin) })}
                className={`flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm ${o.thumbnailUrl === p.value(location.origin) ? 'bg-fuchsia-500/30 ring-1 ring-fuchsia-300' : 'bg-white/5 hover:bg-white/10'}`}
              >
                {p.img && <img src={p.img} alt="" className="h-6 w-6" />}
                {t(`embeds.thumb.${p.id}`)}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('embeds.image')}</span>
            <input value={o.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://" className={field} />
          </label>
          <div>
            <p className="mb-1 text-xs font-semibold text-white/70">{t('embeds.swapsHere')}</p>
            <SwapList t={t} guildId={guildId} swaps={o.emojiSwaps} onChange={(emojiSwaps) => set({ emojiSwaps })} />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button disabled={busy} onClick={() => run(() => api.saveEmbed(guildId, embedKey, { ...o, emojiSwaps: o.emojiSwaps.filter((s) => s.from && s.to) }), t('embeds.saved'))}>
            {t('embeds.save')}
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await api.resetEmbed(guildId, embedKey);
                setO(emptyOverride());
              }, t('embeds.resetDone'))
            }
          >
            {t('embeds.reset')}
          </Button>
          {sent > 0 && (
            <Button variant="ghost" disabled={busy} onClick={() => run(() => api.updateSentEmbed(guildId, embedKey), (r) => t('embeds.updatedSent', { updated: r.updated, failed: r.failed }))}>
              {t('embeds.updateSent', { count: sent })}
            </Button>
          )}
        </div>
        {status && <Notice tone={status.ok ? 'success' : 'error'}>{status.text}</Notice>}
      </Card>
      {picking && (
        <EmojiPicker
          t={t}
          guildId={guildId}
          onClose={() => setPicking(null)}
          onPick={(code) => {
            set({ [picking]: `${o[picking] || ''}${code}` });
            setPicking(null);
          }}
        />
      )}
    </div>
  );
}

export default function Embeds({ t, guildId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const load = () =>
    api
      .embeds(guildId)
      .then(setData)
      .catch((e) => setError(e.code));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  const groups = useMemo(() => {
    const list = (data?.embeds || []).filter((e) => `${e.command} ${e.title} ${e.shape}`.toLowerCase().includes(q.toLowerCase()));
    const map = new Map();
    for (const e of list) map.set(e.command, [...(map.get(e.command) || []), e]);
    return [...map.entries()];
  }, [data, q]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;
  if (open) return <Editor t={t} guildId={guildId} embedKey={open} onClose={() => setOpen(null)} onSaved={load} />;

  return (
    <div className="space-y-4">
      <GlobalSwaps t={t} guildId={guildId} initial={data.global.emojiSwaps} />
      <Card title={t('embeds.listTitle')}>
        <p className="mb-3 text-sm text-white/70">{t('embeds.listHint')}</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('embeds.search')} aria-label={t('embeds.search')} className={`${field} mb-3`} />
        {groups.length === 0 && <Notice>{t('embeds.empty')}</Notice>}
        <div className="space-y-4">
          {groups.map(([command, items]) => (
            <div key={command}>
              <p className="mb-1 font-mono text-xs text-white/60">{command}</p>
              <ul className="space-y-1">
                {items.map((e) => (
                  <li key={e.key}>
                    <button type="button" onClick={() => setOpen(e.key)} className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl bg-white/5 px-3 text-left text-sm hover:bg-white/10">
                      <span className="min-w-0 truncate">{e.title || e.shape}</span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-white/60">
                        {e.customized && <span className="rounded-full bg-fuchsia-500/30 px-2 py-0.5 text-fuchsia-100">{t('embeds.customized')}</span>}
                        {t('embeds.uses', { count: e.count })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
