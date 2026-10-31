import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { request } from './api';
import { Button, Card, Notice, StatTile, Spinner } from './ui';

// Produtos da loja: preço, custo, estoque e entrega. API: /store/products.
const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const brl = (n) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;

const robuxFmt = (n) => Number(n || 0).toLocaleString('pt-BR');

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/50">{hint}</span>}
    </label>
  );
}

function Status({ t, status }) {
  if (!status) return null;
  if (status === 'ok') return <Notice tone="ok">{t('features.saved')}</Notice>;
  return <Notice tone="error">{t('error.generic', { error: status })}</Notice>;
}

export default function StoreProducts({ t, guildId }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', cost: '', robux: '', delivery: 'code' });
  const [codes, setCodes] = useState({});

  const url = `/api/dashboard/guilds/${guildId}/store/products`;
  const load = () =>
    request(url)
      .then((d) => setData(d))
      .catch((e) => setStatus(e.code || 'generic'));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  const cents = (v) => Math.round((Number(String(v).replace(',', '.')) || 0) * 100);
  const run = async (key, fn) => {
    setBusy(key);
    setStatus(null);
    try {
      await fn();
      await load();
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(null);
  };

  const save = () =>
    run('new', async () => {
      await request(url, {
        method: 'PUT',
        body: {
          name: form.name,
          priceCents: cents(form.price),
          costCents: cents(form.cost),
          robux: Number(form.robux) || 0,
          delivery: form.delivery,
        },
      });
      setForm({ name: '', price: '', cost: '', robux: '', delivery: 'code' });
    });

  const addStock = (id) =>
    run(`stock:${id}`, async () => {
      await request(`${url}/${id}/stock`, { method: 'POST', body: { codes: String(codes[id] || '').split('\n') } });
      setCodes({ ...codes, [id]: '' });
    });

  const remove = (id) => run(`del:${id}`, () => request(`${url}/${id}`, { method: 'DELETE' }));

  if (!data) return status ? <Status t={t} status={status} /> : <Spinner label={t('app.loading')} />;

  const products = data.products || [];
  const sales = data.sales || {};
  const marginOf = (p) => (p.priceCents > 0 ? Math.round(((p.priceCents - p.costCents) / p.priceCents) * 1000) / 10 : 0);
  return (
    <Card title={t('store.prod.title')} icon={Package}>
      <p className="mb-3 text-sm text-white/70">{t('store.prod.hint')}</p>
      <Status t={t} status={status} />

      <div className="mb-3 grid grid-cols-3 gap-2">
        <StatTile label={t('store.prod.sales')} value={sales.orders || 0} />
        <StatTile label={t('store.prod.revenue')} value={brl((sales.revenueCents || 0) / 100)} accent="violet" />
        <StatTile label={t('store.prod.ticket')} value={brl((sales.averageTicketCents || 0) / 100)} />
      </div>

      {products.length === 0 && <p className="mb-3 text-sm text-white/60">{t('store.prod.empty')}</p>}

      <div className="space-y-3">
        {products.map((p) => {
          const count = Array.isArray(p.stock) ? p.stock.length : 0;
          const low = p.delivery === 'code' && count <= p.minStock;
          return (
            <div key={p.id} className="rounded-xl border border-white/10 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-title font-bold">{p.name}</p>
                  <p className="text-xs text-white/60">
                    {brl(p.priceCents / 100)}
                    {p.robux ? ` · ${robuxFmt(p.robux)} Robux` : ''} · {t(`store.prod.delivery.${p.delivery}`)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {p.delivery === 'code' && (
                    <span
                      className={`rounded-full px-2 py-1 ${
                        count === 0 ? 'bg-red-500/20 text-red-200' : low ? 'bg-amber-500/20 text-amber-200' : 'bg-white/10'
                      }`}
                    >
                      {count === 0 ? t('store.prod.out') : low ? t('store.prod.low') : `${count} ${t('store.prod.stock')}`}
                    </span>
                  )}
                  <span className="rounded-full bg-white/10 px-2 py-1">
                    {t('store.prod.margin')} {marginOf(p)}%
                  </span>
                  <Button variant="ghost" disabled={Boolean(busy)} onClick={() => remove(p.id)}>
                    ×
                  </Button>
                </div>
              </div>
              {p.delivery === 'code' && (
                <div className="mt-2 space-y-1">
                  <textarea
                    rows={2}
                    value={codes[p.id] || ''}
                    onChange={(e) => setCodes({ ...codes, [p.id]: e.target.value })}
                    placeholder={t('store.prod.stockHint')}
                    aria-label={t('store.prod.addStock')}
                    className={`${field} py-2`}
                  />
                  <Button disabled={busy === `stock:${p.id}`} onClick={() => addStock(p.id)}>
                    {t('store.prod.addStock')}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-white/10 p-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('store.prod.name')}>
            <input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          </Field>
          <Field label={t('store.prod.price')}>
            <input type="number" min="1" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={field} />
          </Field>
          <Field label={t('store.prod.cost')}>
            <input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className={field} />
          </Field>
          <Field label={t('store.prod.robux')}>
            <input type="number" min="0" value={form.robux} onChange={(e) => setForm({ ...form, robux: e.target.value })} className={field} />
          </Field>
        </div>
        <Field label={t('store.prod.delivery')}>
          <select value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} className={`${field} bg-[#160d2a]`}>
            {['code', 'message', 'manual'].map((d) => (
              <option key={d} value={d}>
                {t(`store.prod.delivery.${d}`)}
              </option>
            ))}
          </select>
        </Field>
        <Button disabled={Boolean(busy)} onClick={save}>
          {t('store.prod.create')}
        </Button>
      </div>
    </Card>
  );
}
