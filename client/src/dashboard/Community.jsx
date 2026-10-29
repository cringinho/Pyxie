import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Button, Card, MultiSelect, Notice, Spinner } from './ui';

const field = 'min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm';

function Num({ label, value, onChange, min, max }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className={field} />
    </label>
  );
}

// Comunidade da Cringelândia: fórum de hiperfocos e radar de notícias.
export function CommunitySettings({ t, guildId }) {
  const [cfg, setCfg] = useState(null);
  const [channels, setChannels] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.community(guildId).then((d) => setCfg({ ...d.community, feedsText: d.community.radar.feeds.join('\n') })).catch((e) => setStatus(e.code));
    api.channels(guildId).then((d) => setChannels(d.channels)).catch(() => {});
  }, [guildId]);

  if (!cfg) return status ? <Notice tone="error">{t('error.generic', { error: status })}</Notice> : <Spinner label={t('app.loading')} />;
  const forums = channels.filter((c) => c.type === 15).map((c) => ({ id: c.id, label: `#${c.name}` }));
  const texts = channels.filter((c) => [0, 5].includes(c.type));
  const h = cfg.hyperfocus;
  const r = cfg.radar;
  const setH = (patch) => setCfg({ ...cfg, hyperfocus: { ...h, ...patch } });
  const setR = (patch) => setCfg({ ...cfg, radar: { ...r, ...patch } });
  const select = (value, onChange) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${field} bg-[#160d2a]`}>
      <option value="">—</option>
      {texts.map((c) => (
        <option key={c.id} value={c.id}>
          #{c.name}
        </option>
      ))}
    </select>
  );

  const save = async () => {
    setStatus(null);
    try {
      const res = await api.saveCommunity(guildId, { hyperfocus: h, radar: { ...r, feeds: cfg.feedsText.split(/\s+/).filter(Boolean) } });
      setCfg({ ...res.community, feedsText: res.community.radar.feeds.join('\n') });
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };

  return (
    <div className="space-y-4">
      <Card title={t('community.hyperTitle')}>
        <p className="mb-3 text-sm text-white/70">{t('community.hyperHint')}</p>
        <div className="space-y-3">
          <span className="block text-xs font-semibold text-white/70">{t('community.forums')}</span>
          <MultiSelect options={forums} value={h.forumIds} emptyLabel={t('community.noForums')} onChange={(v) => setH({ forumIds: v })} />
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('community.reactionEmoji')}</span>
              <input value={h.reactionEmoji || '🫂'} onChange={(e) => setH({ reactionEmoji: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('community.customComment')}</span>
              <input value={h.customComment || ''} placeholder="Ex: Que hiperfoco incrível!" onChange={(e) => setH({ customComment: e.target.value })} className={field} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Num label={t('community.wait')} value={h.waitMinutes} min={5} max={120} onChange={(v) => setH({ waitMinutes: v })} />
            <Num label={t('community.coins')} value={h.rewardCoins} min={0} max={30} onChange={(v) => setH({ rewardCoins: v })} />
            <Num label={t('community.minChars')} value={h.minChars} min={50} max={2000} onChange={(v) => setH({ minChars: v })} />
          </div>
        </div>
      </Card>
      <Card title={t('community.radarTitle')}>
        <p className="mb-3 text-sm text-white/70">{t('community.radarHint')}</p>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('community.feeds')}</span>
            <textarea value={cfg.feedsText} rows={4} onChange={(e) => setCfg({ ...cfg, feedsText: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs" aria-label={t('community.feeds')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('community.staffChannel')}</span>
            {select(r.staffChannelId, (v) => setR({ staffChannelId: v }))}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('community.maxItemsPerCycle')}</span>
              <input type="number" min={1} max={10} value={r.maxItemsPerCycle || 3} onChange={(e) => setR({ maxItemsPerCycle: Number(e.target.value) })} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('community.radarColor')}</span>
              <input type="color" value={r.color || '#3b82f6'} onChange={(e) => setR({ color: e.target.value })} className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-transparent p-1" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('community.publishChannel')}</span>
            {select(r.publishChannelId, (v) => setR({ publishChannelId: v }))}
          </label>
        </div>
      </Card>
      {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
      {status && status !== 'ok' && <Notice tone="error">{t('error.generic', { error: status })}</Notice>}
      <Button onClick={save} className="w-full">
        {t('features.save')}
      </Button>
      <ColorsCard t={t} guildId={guildId} texts={texts} />
    </div>
  );
}

// Canal de cores: cria os 75 cargos (reaproveitando os 1–51) e publica o painel no canal escolhido.
function ColorsCard({ t, guildId, texts }) {
  const [channelId, setChannelId] = useState('1453897828941168670');
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const publish = async () => {
    if (!window.confirm(t('colorsPanel.confirm'))) return;
    setBusy(true);
    setState(null);
    try {
      const res = await api.publishColors(guildId, channelId);
      setState({ ok: true, text: t(res.edited ? 'colorsPanel.updated' : 'colorsPanel.done', { created: res.created, reused: res.reused, renamed: res.renamed || 0 }) });
    } catch (e) {
      setState({ ok: false, text: t('error.generic', { error: e.code }) });
    }
    setBusy(false);
  };
  return (
    <Card title={t('colorsPanel.title')}>
      <p className="mb-3 text-sm text-white/70">{t('colorsPanel.hint')}</p>
      <select value={channelId} onChange={(e) => setChannelId(e.target.value)} aria-label={t('colorsPanel.title')} className={`${field} mb-3 bg-[#160d2a]`}>
        {texts.map((c) => (
          <option key={c.id} value={c.id}>
            #{c.name}
          </option>
        ))}
      </select>
      {state && <Notice tone={state.ok ? 'ok' : 'error'}>{state.text}</Notice>}
      <Button onClick={publish} disabled={busy} className="mt-3 w-full">
        {t('colorsPanel.publish')}
      </Button>
    </Card>
  );
}

// Registro das artes da Pyxie: marcar IA/humana e o crédito do artista.
export function Assets({ t }) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('unknown');
  const [error, setError] = useState(null);
  const load = () => api.assets().then(setData).catch((e) => setError(e.code));
  useEffect(() => {
    load();
  }, []);
  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;

  const update = async (file, patch) => {
    const res = await api.saveAsset({ file, ...patch }).catch((e) => setError(e.code));
    if (res) setData({ ...data, assets: data.assets.map((a) => (a.file === file ? { ...a, ...res.asset } : a)) });
  };
  const s = data.summary;
  const list = data.assets.filter((a) => filter === 'all' || a.origin === filter);

  return (
    <Card title={t('assets.title')}>
      <p className="mb-3 text-sm text-white/70">{t('assets.hint', { total: s.total, ai: s.ai, human: s.human, unknown: s.unknown })}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {['unknown', 'ai', 'human', 'all'].map((f) => (
          <Button key={f} variant={f === filter ? 'primary' : 'ghost'} onClick={() => setFilter(f)}>
            {t(`assets.filter.${f}`)}
          </Button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((a) => (
          <li key={a.file} className="rounded-xl border border-white/10 p-3">
            <img src={a.url} alt={a.file} loading="lazy" className="mb-2 h-28 w-full rounded-lg bg-black/30 object-contain" />
            <p className="mb-2 break-all font-mono text-[11px] text-white/60">{a.file}</p>
            <div className="mb-2 flex gap-1">
              {['ai', 'human', 'unknown'].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => update(a.file, { origin: o })}
                  className={`min-h-[36px] flex-1 rounded-lg text-xs font-semibold ${a.origin === o ? 'bg-pyxie-pink' : 'bg-white/5'}`}
                >
                  {t(`assets.origin.${o}`)}
                </button>
              ))}
            </div>
            {a.origin === 'human' && (
              <input
                defaultValue={a.artist}
                placeholder={t('assets.artist')}
                aria-label={t('assets.artist')}
                onBlur={(e) => e.target.value !== a.artist && update(a.file, { artist: e.target.value })}
                className={field}
              />
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
