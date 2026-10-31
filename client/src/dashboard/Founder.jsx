import React, { useEffect, useState } from 'react';
import { Award, Check, KeyRound, RotateCcw, Trash2, UserPlus } from 'lucide-react';
import { api } from './api';
import { Badge, Button, Notice, Spinner, StatTile } from './ui';

// Programa Fundador: 20 vagas de Básico grátis por 12 meses para servidores parceiros.
// Painel do dono: gerar chave, resgatar, checklist de contrapartida e revogar.
const CHECKS = ['channel', 'announcement', 'activity'];

export default function Founder({ t }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [note, setNote] = useState('');
  const [code, setCode] = useState('');
  const [guildId, setGuildId] = useState('');

  const load = () =>
    api
      .founder()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e.code || 'generic'));

  useEffect(() => {
    load();
  }, []);

  const run = async (key, action) => {
    setBusy(key);
    setNotice(null);
    try {
      await action();
      await load();
    } catch (e) {
      setNotice({ tone: 'error', text: t(`founder.error.${e.code || 'generic'}`) });
    } finally {
      setBusy(null);
    }
  };

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;

  const { stats, seats } = data;
  const statusLabel = (status) => t(`founder.status.${status}`) || status;

  const createKey = () =>
    run('create', async () => {
      const res = await api.founderKey(note.trim());
      setNote('');
      setNotice({ tone: 'ok', text: t('founder.newKey', { code: res.seat.code }) });
    });

  const redeem = () =>
    run('redeem', async () => {
      await api.founderRedeem(code.trim(), guildId.trim());
      setCode('');
      setGuildId('');
      setNotice({ tone: 'ok', text: t('founder.redeemed') });
    });

  const toggle = (seat, key) =>
    run(`check:${seat.guildId}:${key}`, () => api.founderChecklist(seat.guildId, { [key]: !seat.checklist[key] }));

  const revoke = (seat) => run(`revoke:${seat.guildId}`, () => api.founderRevoke(seat.guildId));

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">{t('founder.intro')}</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Award} accent="violet" label={t('founder.stats.total')} value={`${stats.total} / ${stats.seats}`} />
        <StatTile icon={Check} accent="green" label={t('founder.stats.active')} value={stats.active} />
        <StatTile icon={KeyRound} accent="cyan" label={t('founder.stats.available')} value={stats.available} />
        <StatTile icon={RotateCcw} accent="pink" label={t('founder.stats.paused')} value={stats.paused} />
      </div>

      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="dash-card space-y-3 rounded-2xl p-4">
          <p className="font-title font-bold">{t('founder.generate')}</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('founder.notePlaceholder')}
            aria-label={t('founder.notePlaceholder')}
            className="dash-field min-h-[40px] w-full rounded-xl px-3 text-sm"
          />
          <Button onClick={createKey} disabled={busy === 'create' || stats.available <= 0}>
            <KeyRound size={16} aria-hidden="true" />
            {t('founder.generateBtn')}
          </Button>
        </div>

        <div className="dash-card space-y-3 rounded-2xl p-4">
          <p className="font-title font-bold">{t('founder.redeemTitle')}</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('founder.redeemCode')}
            aria-label={t('founder.redeemCode')}
            className="dash-field min-h-[40px] w-full rounded-xl px-3 font-mono text-sm uppercase"
          />
          <input
            value={guildId}
            onChange={(e) => setGuildId(e.target.value.replace(/\D/g, ''))}
            placeholder={t('founder.redeemGuild')}
            aria-label={t('founder.redeemGuild')}
            className="dash-field min-h-[40px] w-full rounded-xl px-3 font-mono text-sm"
          />
          <Button onClick={redeem} disabled={busy === 'redeem' || !code.trim() || !guildId.trim()}>
            <UserPlus size={16} aria-hidden="true" />
            {t('founder.redeemBtn')}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {seats.length === 0 && <Notice>{t('founder.empty')}</Notice>}
        {seats.map((seat) => (
          <div key={seat.code} className="dash-card flex flex-wrap items-center gap-3 rounded-2xl p-3 text-sm">
            <code className="rounded-lg bg-white/5 px-2 py-1 font-mono text-xs">{seat.code}</code>
            <Badge tone={seat.status === 'active' ? 'green' : seat.status === 'available' ? 'violet' : 'muted'}>{statusLabel(seat.status)}</Badge>
            <span className="font-mono text-xs text-white/50">{seat.guildId || '—'}</span>
            {seat.note && <span className="truncate text-xs text-white/60">{seat.note}</span>}
            <span className="text-xs text-white/50">{t('founder.days', { n: seat.daysLeft })}</span>

            {seat.guildId && seat.status !== 'revoked' && (
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {CHECKS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={Boolean(seat.checklist[key])}
                    onClick={() => toggle(seat, key)}
                    disabled={busy === `check:${seat.guildId}:${key}`}
                    className={`min-h-[32px] rounded-lg border px-2 text-[11px] font-semibold ${
                      seat.checklist[key] ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-200' : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                  >
                    {t(`founder.checklist.${key}`)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => revoke(seat)}
                  disabled={busy === `revoke:${seat.guildId}`}
                  aria-label={t('founder.revoke')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
