import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { Badge, Button, Card, Notice, Spinner } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

function useRunner(load, t) {
  const [notice, setNotice] = useState(null);
  const run = async (fn, okKey) => {
    setNotice(null);
    try {
      await fn();
      setNotice({ tone: 'ok', text: t(okKey) });
      load();
    } catch (e) {
      setNotice({ tone: 'error', text: e.data?.error || e.data?.message || t('error.generic', { error: e.code || 'generic' }) });
    }
  };
  return [notice, run];
}

// Bloqueios (área global do dono): alertas automáticos e lista de servidores/pessoas bloqueadas.
export function Trust({ t }) {
  const [data, setData] = useState(null);
  const [flags, setFlags] = useState([]);
  const [form, setForm] = useState({ type: 'user', id: '', reason: '' });
  const load = useCallback(() => {
    api.blacklist().then(setData).catch(() => setData({ guilds: [], users: [] }));
    api.redFlags().then((d) => setFlags(d.redFlags || [])).catch(() => {});
  }, []);
  useEffect(load, [load]);
  const [notice, run] = useRunner(load, t);
  if (!data) return <Spinner label={t('app.loading')} />;

  const block = (type, id, reason) => {
    const msg = type === 'guild' ? t('trust.confirmGuild', { id }) : t('trust.confirmUser', { id });
    if (window.confirm(msg)) run(() => api.blockTarget({ type, id, reason }), 'trust.blocked');
  };
  const list = (type, items) => (
    <Card title={t(`trust.${type}s`, { count: items.length })}>
      {items.length === 0 && <p className="text-sm text-white/60">{t('trust.none')}</p>}
      <ul className="divide-y divide-white/5">
        {items.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="block font-mono">{r.id}</span>
              <span className="block text-xs text-white/50">
                {r.reason} · {new Date(r.bannedAt).toLocaleDateString()}
              </span>
            </span>
            <button type="button" className="shrink-0 text-xs text-pyxie-glow hover:underline" onClick={() => run(() => api.unblockTarget({ type, id: r.id }), 'trust.unblocked')}>
              {t('trust.unblock')}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );

  return (
    <div className="space-y-4">
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Card title={t('trust.flagsTitle')}>
        <p className="mb-3 text-xs text-white/50">{t('trust.flagsHint')}</p>
        {flags.length === 0 && <p className="text-sm text-white/60">{t('trust.noFlags')}</p>}
        <ul className="divide-y divide-white/5">
          {flags.map((f) => (
            <li key={f.id} className="flex items-start justify-between gap-3 py-2 text-sm">
              <span className="min-w-0">
                <Badge tone={f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'red' : 'muted'}>{f.severity}</Badge>
                <span className="ml-2 font-mono">{f.targetId}</span>
                <span className="block text-xs text-white/60">{f.reason}</span>
              </span>
              <button type="button" className="shrink-0 text-xs text-red-300 hover:underline" onClick={() => block(f.targetType, f.targetId, f.reason)}>
                {t('trust.block')}
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card title={t('trust.addTitle')}>
        <form
          className="grid gap-2 sm:grid-cols-[auto_1fr]"
          onSubmit={(e) => {
            e.preventDefault();
            block(form.type, form.id, form.reason || undefined);
          }}
        >
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label={t('trust.type')} className={`${field} bg-[#160d2a]`}>
            <option value="user">{t('trust.typeUser')}</option>
            <option value="guild">{t('trust.typeGuild')}</option>
          </select>
          <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value.replace(/\D/g, '') })} placeholder="ID" aria-label="ID" className={`${field} font-mono`} />
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={t('trust.reason')} aria-label={t('trust.reason')} className={`${field} sm:col-span-2`} />
          <Button type="submit" disabled={!/^\d{17,20}$/.test(form.id)} className="sm:col-span-2">
            {t('trust.block')}
          </Button>
        </form>
        <p className="mt-2 text-xs text-white/50">{t('trust.guildNote')}</p>
      </Card>
      {list('guild', data.guilds || [])}
      {list('user', data.users || [])}
    </div>
  );
}

// Economia (área global do dono): faixa de moedas do bônus diário.
export function Economy({ t }) {
  const [cfg, setCfg] = useState(null);
  const load = useCallback(() => {
    api.botConfig().then((d) => setCfg(d.economy)).catch(() => setCfg({ minimum: 25, maximum: 60, error: true }));
  }, []);
  useEffect(load, [load]);
  const [notice, run] = useRunner(load, t);
  if (!cfg) return <Spinner label={t('app.loading')} />;
  return (
    <Card title={t('economy.dailyTitle')}>
      <p className="mb-3 text-sm text-white/70">{t('economy.dailyHint')}</p>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => api.saveEconomy(Number(cfg.minimum), Number(cfg.maximum)), 'features.saved');
        }}
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/70">{t('economy.min')}</span>
          <input type="number" min="0" value={cfg.minimum} onChange={(e) => setCfg({ ...cfg, minimum: e.target.value })} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/70">{t('economy.max')}</span>
          <input type="number" min="0" value={cfg.maximum} onChange={(e) => setCfg({ ...cfg, maximum: e.target.value })} className={field} />
        </label>
        <Button type="submit" className="col-span-2">
          {t('features.save')}
        </Button>
      </form>
      {notice && <div className="mt-3"><Notice tone={notice.tone}>{notice.text}</Notice></div>}
    </Card>
  );
}
