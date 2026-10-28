import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Button, Drawer, Notice, Spinner, Toggle } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const CRINGELANDIA = '1453890868980482090';

function Stats({ t, stats }) {
  const entries = Object.entries(stats || {}).filter(([, v]) => typeof v === 'number' || typeof v === 'string');
  if (!entries.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-2 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="rounded-xl bg-white/5 p-2">
          <dt className="text-[11px] text-white/50">{t(`drawer.stat.${k}`).startsWith('drawer.') ? k : t(`drawer.stat.${k}`)}</dt>
          <dd className="font-mono">{typeof v === 'number' ? v.toLocaleString() : v}</dd>
        </div>
      ))}
    </dl>
  );
}

// Ajustes próprios de cada módulo (os que têm API de configuração).
function ModuleConfig({ t, id }) {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState({});
  const [state, setState] = useState('loading');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api
      .moduleConfig(id)
      .then((d) => {
        setData(d);
        setDraft(d.config || {});
        setState('ok');
      })
      .catch((e) => setState(e.status === 404 ? 'none' : e.code || 'generic'));
  }, [id]);

  if (state === 'loading') return <Spinner label={t('app.loading')} />;
  if (state === 'none') return <p className="text-sm text-white/60">{t('drawer.noConfig')}</p>;
  if (state !== 'ok') return <Notice tone="error">{t('error.generic', { error: state })}</Notice>;

  const save = async (body, okKey = 'features.saved') => {
    setNotice(null);
    try {
      const res = await api.saveModuleConfig(id, body);
      if (res.config) setDraft(res.config);
      if (res.stats) setData({ ...data, stats: res.stats });
      setNotice({ tone: 'ok', text: res.message || t(okKey) });
    } catch (e) {
      setNotice({ tone: 'error', text: e.data?.error || t('error.generic', { error: e.code || 'generic' }) });
    }
  };

  if (id === 'partnerships') {
    return (
      <a href={`#/guild/${CRINGELANDIA}/partnerships`} className="flex min-h-[44px] items-center justify-center rounded-xl bg-white/5 font-semibold hover:bg-white/10">
        {t('drawer.openPartnerships')}
      </a>
    );
  }

  if (id === 'battlePass') return <PassGrant t={t} data={data} notice={notice} onGrant={(body) => save(body, 'drawer.granted')} />;

  // Dungeon (números com limites) e Museu (textos e listas): formulário a partir da própria configuração.
  const bounds = data.bounds || {};
  const keys = Object.keys(draft).filter((k) => ['string', 'number', 'boolean'].includes(typeof draft[k]) || Array.isArray(draft[k]));
  return (
    <div className="space-y-3">
      <Stats t={t} stats={data.stats} />
      {keys.map((k) => {
        const v = draft[k];
        const label = t(`drawer.field.${k}`).startsWith('drawer.') ? k : t(`drawer.field.${k}`);
        if (typeof v === 'boolean') return <Toggle key={k} label={label} checked={v} onChange={(x) => setDraft({ ...draft, [k]: x })} />;
        const [min, max] = bounds[k] || [];
        return (
          <label key={k} className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">
              {label}
              {bounds[k] && <span className="ml-1 font-normal text-white/40">({min}–{max})</span>}
            </span>
            <input
              type={typeof v === 'number' ? 'number' : 'text'}
              min={min}
              max={max}
              value={Array.isArray(v) ? v.join(', ') : v}
              onChange={(e) => {
                const raw = e.target.value;
                setDraft({ ...draft, [k]: Array.isArray(v) ? raw.split(/[\s,]+/).filter(Boolean) : typeof v === 'number' ? Number(raw) : raw });
              }}
              className={`${field} ${Array.isArray(v) || /Id$/.test(k) ? 'font-mono' : ''}`}
            />
          </label>
        );
      })}
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Button className="w-full" onClick={() => save(draft)}>
        {t('features.save')}
      </Button>
    </div>
  );
}

// Passe: números do mês e liberação manual do Premium (ex.: Pix conferido à mão).
function PassGrant({ t, data, notice, onGrant }) {
  const [userId, setUserId] = useState('');
  const [month, setMonth] = useState(data.month || '');
  return (
    <div className="space-y-3">
      <Stats t={t} stats={data.stats} />
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (window.confirm(t('drawer.confirmGrant', { id: userId, month }))) onGrant({ grantUserId: userId, grantMonth: month });
        }}
      >
        <p className="text-xs font-semibold text-white/70">{t('drawer.grantTitle')}</p>
        <input value={userId} onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))} placeholder={t('seasonal.userId')} aria-label={t('seasonal.userId')} className={`${field} font-mono`} />
        <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-10" aria-label={t('drawer.month')} className={`${field} font-mono`} />
        <Button type="submit" className="w-full" disabled={!userId}>
          {t('drawer.grant')}
        </Button>
      </form>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
    </div>
  );
}

export default function ModuleDrawer({ t, lang, module: m, busy, onToggle, onClose }) {
  const key = lang === 'pt' ? 'pt-BR' : 'en';
  return (
    <Drawer title={`${m.icon || ''} ${m.name?.[key] || m.id}`.trim()} subtitle={m.id} onClose={onClose} closeLabel={t('nav.close')}>
      <Toggle label={t('drawer.enabled')} checked={m.enabled} disabled={busy} onChange={onToggle} />
      {m.description?.[key] && <p className="text-sm text-white/70">{m.description[key]}</p>}
      {m.guildScope && <p className="text-xs text-mystic-glow">{t('modules.scoped', { guilds: m.guildScope.join(', ') })}</p>}
      <div className="border-t border-white/10 pt-4">
        <p className="mb-3 font-title font-bold">{t('drawer.settings')}</p>
        <ModuleConfig t={t} id={m.id} />
      </div>
    </Drawer>
  );
}
