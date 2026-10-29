import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { Badge, Button, Card, GuildIcon, Notice, Spinner } from './ui';

const MIN = 20;
const MAX = 1500;

function AppealForm({ t, server, onSent }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await api.sendAppeal(server.guildId, text);
      onSent();
    } catch (err) {
      setStatus(err.code || 'generic');
    }
    setBusy(false);
  };
  return (
    <form onSubmit={send} className="space-y-2">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-white/70">{t('appeal.textLabel')}</span>
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, MAX))} rows={6} className="dash-field w-full rounded-xl p-3 text-sm" />
      </label>
      <p className="text-xs text-white/50">{t('appeal.counter', { count: text.trim().length, max: MAX })}</p>
      {status && <Notice tone="error">{t(`appeal.error.${status}`).startsWith('appeal.') ? t('error.generic', { error: status }) : t(`appeal.error.${status}`)}</Notice>}
      <Button type="submit" disabled={busy || text.trim().length < MIN} className="w-full">
        {t('appeal.send')}
      </Button>
    </form>
  );
}

function PrivacyCard({ t }) {
  const [summary, setSummary] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .myPrivacy()
      .then((d) => setSummary(d.summary))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  const erase = async () => {
    if (!window.confirm(t('privacy.confirmErase'))) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.eraseMyData();
      setReceipt(res.receipt);
      load();
    } catch (e) {
      setError(e.code || 'generic');
    }
    setBusy(false);
  };

  return (
    <Card title={t('privacy.title')}>
      <p className="mb-3 text-sm text-white/70">{t('privacy.hint')}</p>
      {summary && (
        <p className="mb-3 text-xs text-white/60">
          {t('privacy.summary', { count: summary.totalRecordsFound || 0 })}
        </p>
      )}
      {receipt && (
        <div className="mb-3">
          <Notice tone="ok">
            {t('privacy.erased', { code: receipt.code, removed: receipt.totalRemoved || 0 })}
          </Notice>
        </div>
      )}
      {error && <Notice tone="error">{t('error.generic', { error })}</Notice>}
      <Button variant="ghost" onClick={erase} disabled={busy} className="w-full">
        {t('privacy.eraseBtn')}
      </Button>
    </Card>
  );
}

// Página de quem foi banido: motivo, pedido para voltar, resposta da staff e exclusão LGPD.
export default function Appeal({ t }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(() => {
    api.appeals().then((d) => setData(d.servers)).catch((e) => setError(e.code || 'generic'));
  }, []);
  useEffect(load, [load]);

  if (error) return <Notice tone="error">{t(`error.${error}`).startsWith('error.') ? t('error.generic', { error }) : t(`error.${error}`)}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;
  const date = (ms) => new Date(ms).toLocaleDateString();

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-white/70">{t('appeal.intro')}</p>
      {data.length === 0 && <Notice>{t('appeal.none')}</Notice>}
      {data.map((s) => (
        <Card key={s.guildId}>
          <div className="mb-3 flex items-center gap-3">
            <GuildIcon guild={{ name: s.name, icon: s.icon }} size={44} />
            <div className="min-w-0">
              <p className="truncate font-title text-lg font-bold">{s.name}</p>
              {s.banned ? <Badge tone="red">{t('appeal.banned')}</Badge> : <Badge tone="green">{t('appeal.notBanned')}</Badge>}
            </div>
          </div>
          {s.banned && <p className="mb-3 text-sm text-white/70">{t('appeal.reason', { reason: s.banReason || t('appeal.noReason') })}</p>}
          {s.appeal?.status === 'pending' && <Notice>{t('appeal.pending', { date: date(s.appeal.createdAt) })}</Notice>}
          {s.appeal?.status === 'approved' && <Notice tone="ok">{t('appeal.approved', { date: date(s.appeal.decidedAt) })}</Notice>}
          {s.appeal?.status === 'rejected' && <Notice tone="error">{t('appeal.rejected', { date: date(s.cooldownUntil || s.appeal.decidedAt) })}</Notice>}
          {s.canAppeal && (
            <div className="mt-3">
              <AppealForm t={t} server={s} onSent={load} />
            </div>
          )}
        </Card>
      ))}
      <PrivacyCard t={t} />
    </div>
  );
}
