import React, { useEffect, useState } from 'react';
import { BadgeCheck, CreditCard, QrCode, ShieldOff } from 'lucide-react';
import { api } from './api';
import { Button, Notice, Spinner } from './ui';

// Assinatura mensal do servidor: Básico (R$ 7) e Premium (R$ 20), Pix por QR ou cartão recorrente.
export default function Plans({ t, guildId, lang }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [checkout, setCheckout] = useState(null);

  const load = () =>
    api
      .plan(guildId)
      .then((d) => setInfo(d))
      .catch((e) => setError(e.code || 'generic'));

  useEffect(() => {
    load();
  }, [guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!info) return <Spinner label={t('app.loading')} />;

  const current = info.plan || {};
  const active = Boolean(current.active);
  const until = current.paidUntil ? new Date(current.paidUntil).toLocaleDateString() : null;

  const buy = async (plan, method) => {
    setBusy(`${plan}:${method}`);
    setCheckout(null);
    try {
      const res = await api.planCheckout(guildId, { plan, method, lang });
      const data = res.checkout || {};
      if (method === 'card' && data.initPoint) window.open(data.initPoint, '_blank', 'noopener');
      else setCheckout(data);
    } catch (e) {
      setError(e.code || 'generic');
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    setBusy('cancel');
    try {
      await api.planCancel(guildId);
      await load();
    } catch (e) {
      setError(e.code || 'generic');
    } finally {
      setBusy(null);
    }
  };

  const planLabel = (plan) => t(`plan.name.${plan}`);

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">{t('plan.intro')}</p>

      <div className="dash-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <BadgeCheck size={20} className={active ? 'text-emerald-400' : 'text-white/40'} aria-hidden="true" />
          <div>
            <p className="font-title font-bold">{active ? planLabel(current.plan) : t('plan.none')}</p>
            <p className="text-xs text-white/55">
              {active ? t('plan.until', { date: until }) : t('plan.noneHint')}
            </p>
          </div>
        </div>
        {active && (
          <Button variant="ghost" disabled={busy === 'cancel'} onClick={cancel}>
            <ShieldOff size={16} aria-hidden="true" />
            {t('plan.cancel')}
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {['basic', 'premium'].map((plan) => (
          <div key={plan} className="dash-card space-y-3 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-title text-lg font-bold">{planLabel(plan)}</p>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">R$ {info.prices[plan]}/mês</span>
            </div>
            <ul className="space-y-1 text-xs text-white/65">
              <li>• {t(`plan.perk.${plan}.1`)}</li>
              <li>• {t(`plan.perk.${plan}.2`)}</li>
              <li>• {t('plan.perk.support')}</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button disabled={Boolean(busy)} onClick={() => buy(plan, 'pix')}>
                <QrCode size={16} aria-hidden="true" />
                {t('plan.payPix')}
              </Button>
              <Button variant="ghost" disabled={Boolean(busy)} onClick={() => buy(plan, 'card')}>
                <CreditCard size={16} aria-hidden="true" />
                {t('plan.payCard')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {checkout?.qrCode && (
        <div className="dash-card space-y-3 rounded-2xl p-4">
          <p className="font-title font-bold">{t('plan.qrTitle', { plan: planLabel(checkout.plan) })}</p>
          <p className="text-xs text-white/60">{t('plan.qrHint')}</p>
          {checkout.qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${checkout.qrCodeBase64}`}
              alt={t('plan.qrAlt')}
              width={220}
              height={220}
              className="rounded-xl bg-white p-2"
            />
          )}
          <code className="block break-all rounded-xl bg-black/40 p-3 text-[11px] text-white/80">{checkout.qrCode}</code>
          <p className="text-xs text-white/50">{t('plan.qrExpires', { date: new Date(checkout.expiresAt).toLocaleTimeString() })}</p>
        </div>
      )}

      <p className="text-xs text-white/45">{t('plan.support', { email: info.support?.email || '' })}</p>
    </div>
  );
}
