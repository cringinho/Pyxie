import React, { useEffect, useRef, useState } from 'react';
import { BadgeCheck, CreditCard, Infinity as InfinityIcon, Package, QrCode, ShieldOff } from 'lucide-react';
import { api } from './api';
import { go } from './Shell';
import Paywall, { planFromCode } from './Paywall';
import { Button, Card, Notice, Spinner } from './ui';

// Assinatura mensal do servidor: Básico (R$ 7) e Premium (R$ 20), Pix por QR ou cartão recorrente.
// Motivo da falha em linguagem simples (error.<código>); só cai no genérico sem texto próprio.
function errorText(t, code) {
  const known = t(`error.${code}`);
  return known.startsWith('error.') ? t('error.generic', { error: code }) : known;
}

export default function Plans({ t, guildId, lang }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [extras, setExtras] = useState([]);
  // Lojinha: o cartão só aparece quando o extra está ativo (ou é a zona da Mary).
  const [store, setStore] = useState(null);
  // Ciclo escolhido: mensal (padrão) ou anual com 2 meses grátis.
  const [cycle, setCycle] = useState('month');
  // Botão clicado por último: dá retorno visual imediato ("gerando…") e marca a escolha.
  const [picked, setPicked] = useState(null);
  const checkoutRef = useRef(null);

  const load = () =>
    api
      .plan(guildId)
      .then((d) => setInfo(d))
      .catch((e) => setError(e.code || 'generic'));

  useEffect(() => {
    load();
    api
      .addons(guildId)
      .then((d) => setExtras(Array.isArray(d.addons) ? d.addons : []))
      .catch(() => {});
    // Sem o extra (ou fora da zona Mary) a rota devolve 403: o cartão simplesmente não aparece.
    api
      .storeProducts(guildId)
      .then((d) => setStore(d))
      .catch(() => setStore(null));
  }, [guildId]);

  // Quando o checkout chega, leva o usuário até ele (antes ficava lá embaixo e
  // parecia que o clique não tinha feito nada).
  useEffect(() => {
    if (checkout && checkoutRef.current) checkoutRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [checkout]);

  // A página só é substituída quando nem os dados iniciais chegaram. Erro de clique
  // aparece como aviso dentro da tela (antes a tela inteira sumia e parecia "não abriu").
  if (!info) {
    // Recurso travado pelo plano (a API responde 403 plan_required): paywall no lugar do erro cru.
    const lockedPlan = error ? planFromCode(error) : '';
    if (lockedPlan) return <Paywall t={t} requiredPlan={lockedPlan} guildId={guildId} />;
    return error ? <Notice tone="error">{errorText(t, error)}</Notice> : <Spinner label={t('app.loading')} />;
  }

  const current = info.plan || {};
  const active = Boolean(current.active);
  // BUG: com plano vitalício `paidUntil` é 0 e a tela mostrava "Ativo até null".
  const until = current.paidUntil ? new Date(current.paidUntil).toLocaleDateString() : null;
  const activeLine = current.lifetime
    ? t('plan.lifetime')
    : until
      ? t('plan.until', { date: until })
      : t('plan.noneHint');
  const priceTable = (cycle === 'year' ? info.pricesAnnual : info.prices) || info.prices || {};
  const saving = info.annualSavingPercent?.['premium'] || 0;

  const buy = async (plan, method) => {
    const key = `plan:${plan}:${method}:${cycle}`;
    setBusy(key);
    setPicked(key);
    setError(null);
    setCheckout(null);
    try {
      const res = await api.planCheckout(guildId, { plan, method, cycle, lang });
      const data = res.checkout || {};
      if (method === 'card' && data.initPoint) window.open(data.initPoint, '_blank', 'noopener');
      else setCheckout(data);
    } catch (e) {
      setError(e.code || 'generic');
    } finally {
      setBusy(null);
    }
  };

  const buyExtra = async (addonId, cycle, method = 'pix') => {
    const key = `extra:${addonId}:${cycle}:${method}`;
    setBusy(key);
    setPicked(key);
    setError(null);
    setCheckout(null);
    try {
      const res = await api.addonCheckout(guildId, addonId, { cycle, method });
      const data = res.checkout || {};
      const extra = extras.find((x) => x.id === addonId);
      setCheckout({
        ...data,
        title: `${extra ? extra.name : addonId} · ${cycle === 'year' ? t('plan.extras.year') : t('plan.extras.month')}`,
      });
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
      {error && <Notice tone="error">{errorText(t, error)}</Notice>}

      <div className="dash-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <BadgeCheck size={20} className={active ? 'text-emerald-400' : 'text-white/40'} aria-hidden="true" />
          <div>
            <p className="font-title font-bold">{active ? planLabel(current.plan) : t('plan.none')}</p>
            <p className="text-xs text-white/55">{active ? activeLine : t('plan.noneHint')}</p>
          </div>
        </div>
        {active && (
          <Button variant="ghost" disabled={busy === 'cancel'} onClick={cancel}>
            <ShieldOff size={16} aria-hidden="true" />
            {t('plan.cancel')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t('plan.cycle.month')}>
        {['month', 'year'].map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={cycle === c}
            onClick={() => setCycle(c)}
            className={`min-h-[40px] rounded-xl border px-4 text-sm font-semibold transition ${
              cycle === c ? 'border-pyxie-glow bg-pyxie-pink/20 text-white' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {t(`plan.cycle.${c}`)}
            {c === 'year' && saving > 0 && (
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">
                {t('plan.cycle.save', { percent: saving })}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {['basic', 'premium'].map((plan) => (
          <div key={plan} className="dash-card space-y-3 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-title text-lg font-bold">{planLabel(plan)}</p>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                R$ {priceTable[plan]}/{cycle === 'year' ? t('plan.perYear') : t('plan.perMonth')}
              </span>
            </div>
            <ul className="space-y-1 text-xs text-white/65">
              {[1, 2, 3, 4, 5]
                .map((n) => t(`plan.perk.${plan}.${n}`))
                .filter((line) => !line.startsWith(`plan.perk.`))
                .map((line) => (
                  <li key={line}>• {line}</li>
                ))}
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

      <p className="text-xs text-white/55">{t('plan.founder.perk')}</p>

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
              <div className="flex flex-wrap gap-2">
                {a.lifetime ? (
                  // Extra vitalício não tem o que renovar: cobrar aqui seria vender nada.
                  <span className="flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-300">
                    <InfinityIcon size={16} aria-hidden="true" />
                    {t('plan.extras.lifetime')}
                  </span>
                ) : (
                  [
                    { c: 'month', m: 'pix', label: `R$ ${Math.round(a.priceMonthly / 100)}/${t('plan.extras.month')}`, icon: QrCode },
                    { c: 'year', m: 'pix', label: `R$ ${Math.round(a.priceYearly / 100)}/${t('plan.extras.year')}`, icon: null },
                    { c: 'month', m: 'card', label: t('plan.payCard'), icon: CreditCard },
                  ].map((opt) => {
                    const key = `extra:${a.id}:${opt.c}:${opt.m}`;
                    const loading = busy === key;
                    const Icon = opt.icon;
                    return (
                      <Button
                        key={key}
                        variant={opt.c === 'year' || opt.m === 'card' ? 'ghost' : undefined}
                        disabled={Boolean(busy)}
                        onClick={() => buyExtra(a.id, opt.c, opt.m)}
                      >
                        {Icon && <Icon size={16} aria-hidden="true" />}
                        {loading ? t('plan.generating') : opt.label}
                      </Button>
                    );
                  })
                )}
              </div>
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
                      low: (store.products || []).filter(
                        (p) => p.delivery === 'code' && (p.stock || []).length <= p.minStock
                      ).length,
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

      {/* O que o extra de lojinha entrega, item por item: quem compra sabe exatamente o que recebe. */}
      {extras.some((a) => a.id === 'lojinha') && (
        <Card title={t('plan.lojinha.title')} icon={Package}>
          <p className="mb-2 text-sm text-white/70">{t('plan.lojinha.hint')}</p>
          <ul className="grid gap-1 text-xs text-white/65 sm:grid-cols-2">
            {Array.from({ length: 10 }, (_, i) => t(`plan.lojinha.f${i + 1}`))
              .filter((line) => !line.startsWith('plan.lojinha.'))
              .map((line) => (
                <li key={line}>• {line}</li>
              ))}
          </ul>
        </Card>
      )}

      {checkout?.qrCode && (
        <div ref={checkoutRef} className="dash-card space-y-3 rounded-2xl p-4">
          <p className="font-title font-bold">{checkout.title || t('plan.qrTitle', { plan: planLabel(checkout.plan) })}</p>
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

      {checkout?.initPoint && (
        <div ref={checkoutRef} className="dash-card space-y-3 rounded-2xl p-4">
          <p className="font-title font-bold">{checkout.title || t('plan.cardTitle')}</p>
          <p className="text-xs text-white/60">{t('plan.cardHint')}</p>
          <a
            href={checkout.initPoint}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
          >
            <CreditCard size={16} aria-hidden="true" />
            {t('plan.cardGo')}
          </a>
        </div>
      )}

      <p className="text-xs text-white/45">{t('plan.support', { email: info.support?.email || '' })}</p>
    </div>
  );
}
