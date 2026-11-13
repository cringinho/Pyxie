import React, { useEffect, useState } from 'react';
import { BadgeCheck, Infinity as InfinityIcon, KeyRound, Package } from 'lucide-react';
import { api } from './api';
import { go } from './Shell';
import Paywall, { planFromCode } from './Paywall';
import { Button, Card, Notice, Spinner } from './ui';
import { errorText } from './i18n';

// Acesso do servidor. A Pyxie não cobra por nada: servidores que já a tinham são vitalícios e
// quem não tem recebe uma chave do dono (/py-fundador). Esta tela só mostra o estado e o caminho.
function planErrorText(t, code) {
  const general = errorText(t, code);
  return general !== t('error.generic') ? general : t('plan.err.unknown');
}

export default function Plans({ t, guildId }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [extras, setExtras] = useState([]);
  // Lojinha: o cartão só aparece quando o extra está ativo (ou é a zona da Mary).
  const [store, setStore] = useState(null);

  useEffect(() => {
    api
      .plan(guildId)
      .then((d) => setInfo(d))
      .catch((e) => setError(e.code || 'generic'));
    api
      .addons(guildId)
      .then((d) => setExtras(Array.isArray(d.addons) ? d.addons : []))
      .catch(() => {});
    api
      .storeProducts(guildId)
      .then((d) => setStore(d))
      .catch(() => setStore(null));
  }, [guildId]);

  if (!info) {
    const lockedPlan = error ? planFromCode(error) : '';
    if (lockedPlan) return <Paywall t={t} requiredPlan={lockedPlan} guildId={guildId} />;
    return error ? <Notice tone="error">{planErrorText(t, error)}</Notice> : <Spinner label={t('app.loading')} />;
  }

  const current = info.plan || {};
  const active = Boolean(current.active);
  const until = current.paidUntil ? new Date(current.paidUntil).toLocaleDateString() : null;
  const statusLine = current.lifetime ? t('plan.lifetime') : until ? t('plan.until', { date: until }) : t('plan.noneHint');

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">{t('plan.intro')}</p>

      <div className="dash-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <BadgeCheck size={20} className={active ? 'text-emerald-400' : 'text-white/40'} aria-hidden="true" />
          <div>
            <p className="font-title font-bold">{active ? t('plan.accessOn') : t('plan.none')}</p>
            <p className="text-xs text-white/55">{active ? statusLine : t('plan.noneHint')}</p>
          </div>
        </div>
        {active && current.lifetime && (
          <span className="flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-300">
            <InfinityIcon size={16} aria-hidden="true" />
            {t('plan.lifetime')}
          </span>
        )}
      </div>

      {!active && (
        <Card title={t('plan.key.title')} icon={KeyRound}>
          <p className="text-sm text-white/70">{t('plan.key.body')}</p>
          <code className="mt-2 block rounded-xl bg-black/40 p-3 text-xs text-white/80">/py-fundador chave:FUND-XXXX-XXXX</code>
        </Card>
      )}

      {extras.length > 0 && (
        <div className="space-y-2">
          <p className="font-title text-sm font-bold text-white/80">{t('plan.extras.title')}</p>
          {extras.map((a) => (
            <div key={a.id} className="dash-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
              <div className="min-w-0">
                <p className="font-title font-bold">{a.name}</p>
                <p className="text-xs text-white/55">
                  {a.active
                    ? a.lifetime
                      ? t('plan.extras.lifetime')
                      : t('plan.extras.activeUntil', { date: new Date(a.until).toLocaleDateString() })
                    : t('plan.extras.hint')}
                </p>
              </div>
              {a.lifetime && (
                <span className="flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-300">
                  <InfinityIcon size={16} aria-hidden="true" />
                  {t('plan.extras.lifetime')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {store && (
        <div className="dash-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
          <div className="flex min-w-0 items-start gap-3">
            <Package size={20} className="mt-0.5 shrink-0 text-pyxie-glow" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-title font-bold">{t('plan.store.title')}</p>
              <p className="text-xs text-white/55">
                {(store.products || []).length
                  ? t('plan.store.body', {
                      products: (store.products || []).length,
                      low: (store.products || []).filter((p) => p.delivery === 'code' && (p.stock || []).length <= p.minStock).length,
                    })
                  : t('plan.store.empty')}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => go(`#/guild/${guildId}/maryStore`)}>
            <Package size={16} aria-hidden="true" />
            {t('plan.store.open')}
          </Button>
        </div>
      )}

      <p className="text-xs text-white/45">{t('plan.support', { email: info.support?.email || '' })}</p>
    </div>
  );
}
