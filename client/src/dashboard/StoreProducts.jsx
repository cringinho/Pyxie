import React, { useEffect, useState } from 'react';
import { Package, Pencil, Trash2 } from 'lucide-react';
import { request } from './api';
import { Button, Card, Notice, StatTile, Spinner } from './ui';
import { errorText } from './i18n';

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
  if (typeof status === 'object' && status.stock) {
    const r = status.stock;
    return <Notice tone={r.cut > 0 ? 'warn' : 'ok'}>{t('store.prod.stockResult', { added: r.added || 0, dup: r.duplicates || 0, cut: r.cut || 0, total: r.stockCount || 0, max: r.max || 500 })}</Notice>;
  }
  return <Notice tone="error">{errorText(t, status)}</Notice>;
}

// Faixas iguais às do servidor (storeProducts.js): preço de R$ 1,00 a R$ 50.000,00.
const MIN_PRICE = 1;
const MAX_PRICE = 50000;
const emptyForm = { id: '', name: '', price: '', cost: '', robux: '', delivery: 'code', deliveryUrl: '' };

export default function StoreProducts({ t, guildId }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [codes, setCodes] = useState({});
  // Vitrine no Discord: escolher o canal e publicar o painel com o menu de compra.
  const [channels, setChannels] = useState([]);
  const [panelChannel, setPanelChannel] = useState('');
  const [panelStatus, setPanelStatus] = useState(null);

  const base = `/api/dashboard/guilds/${guildId}/store`;
  const url = `${base}/products`;
  const load = () =>
    request(url)
      .then((d) => setData(d))
      .catch((e) => setStatus(e.code || 'generic'));

  useEffect(() => {
    load();
    request(`/api/dashboard/guilds/${guildId}/channels`)
      .then((d) => setChannels((d.channels || []).filter((c) => c.type === 0)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  const cents = (v) => Math.round((Number(String(v).replace(',', '.')) || 0) * 100);
  const run = async (key, fn) => {
    setBusy(key);
    setStatus(null);
    try {
      const result = await fn();
      await load();
      setStatus(result?.stockCount !== undefined ? { stock: result } : 'ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(null);
  };

  // Validação igual à do servidor, com o motivo embaixo do campo (Q121/Q122).
  const priceNum = Number(String(form.price).replace(',', '.'));
  const costNum = form.cost === '' ? 0 : Number(String(form.cost).replace(',', '.'));
  const formErrors = {
    name: !form.name.trim() ? 'store.prod.err.name' : null,
    price: form.price === '' || !(priceNum > 0) ? 'store.prod.err.price' : priceNum < MIN_PRICE || priceNum > MAX_PRICE ? 'store.prod.err.priceRange' : null,
    cost: !Number.isFinite(costNum) || costNum < 0 || costNum > MAX_PRICE ? 'store.prod.err.cost' : null,
    deliveryUrl: form.delivery === 'message' && !/^https?:\/\/\S{4,280}$/.test(form.deliveryUrl.trim()) ? 'store.prod.err.url' : null,
  };
  const formOk = !Object.values(formErrors).some(Boolean);
  const [touched, setTouched] = useState(false);

  const save = () => {
    setTouched(true);
    if (!formOk) return null;
    return run('new', async () => {
      await request(url, {
        method: 'PUT',
        body: {
          ...(form.id ? { id: form.id } : {}),
          name: form.name,
          priceCents: cents(form.price),
          costCents: cents(form.cost),
          robux: Number(form.robux) || 0,
          delivery: form.delivery,
          deliveryUrl: form.delivery === 'message' ? form.deliveryUrl.trim() : '',
        },
      });
      setForm(emptyForm);
      setTouched(false);
    });
  };

  // Editar abre o formulário preenchido; o estoque de códigos continua intacto (Q123).
  const edit = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      price: (p.priceCents / 100).toFixed(2),
      cost: p.costCents ? (p.costCents / 100).toFixed(2) : '',
      robux: p.robux ? String(p.robux) : '',
      delivery: p.delivery,
      deliveryUrl: p.deliveryUrl || '',
    });
    setTouched(false);
    setTimeout(() => document.getElementById('store-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const addStock = (id) =>
    run(`stock:${id}`, async () => {
      const res = await request(`${url}/${id}/stock`, { method: 'POST', body: { codes: String(codes[id] || '').split('\n') } });
      setCodes({ ...codes, [id]: '' });
      return res;
    });

  const remove = (p) => {
    const count = Array.isArray(p.stock) ? p.stock.length : 0;
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('store.prod.removeConfirm', { name: p.name, count }))) return;
    run(`del:${p.id}`, () => request(`${url}/${p.id}`, { method: 'DELETE' }));
  };

  // Publica a vitrine no canal escolhido (o backend manda a mensagem com o token do bot).
  const publishPanel = async () => {
    setBusy('panel');
    setPanelStatus(null);
    try {
      await request(`${base}/panel`, { method: 'POST', body: { channelId: panelChannel } });
      setPanelStatus('ok');
    } catch (e) {
      setPanelStatus(e.code || 'generic');
    }
    setBusy(null);
  };

  if (!data) return status ? <Status t={t} status={status} /> : <Spinner label={t('app.loading')} />;

  const products = data.products || [];
  const sales = data.sales || {};
  const marginOf = (p) => (p.priceCents > 0 ? Math.round(((p.priceCents - p.costCents) / p.priceCents) * 1000) / 10 : 0);
  return (
    <Card title={t('store.prod.title')} icon={Package}>
      <p className="mb-3 text-sm text-white/70">{t('store.prod.hint')}</p>
      <Status t={t} status={status} />

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <StatTile label={t('store.prod.sales')} value={sales.orders || 0} />
        <StatTile label={t('store.prod.revenue')} value={brl((sales.revenueCents || 0) / 100)} accent="violet" />
        <StatTile label={t('store.prod.ticket')} value={brl((sales.averageTicketCents || 0) / 100)} />
      </div>

      <div className="mb-3 rounded-xl border border-white/10 p-3">
        <p className="font-title text-sm font-bold">{t('store.prod.panelTitle')}</p>
        <p className="mt-1 text-xs text-white/55">{t('store.prod.panelHint')}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={panelChannel}
            onChange={(e) => setPanelChannel(e.target.value)}
            className={`${field} max-w-xs`}
            aria-label={t('store.prod.panelChannel')}
          >
            <option value="">{t('store.prod.panelChannel')}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
          <Button disabled={!panelChannel || busy === 'panel'} onClick={publishPanel}>
            {busy === 'panel' ? t('plan.generating') : t('store.prod.panelGo')}
          </Button>
        </div>
        {panelStatus === 'ok' && <Notice tone="ok">{t('store.prod.panelOk')}</Notice>}
        {panelStatus && panelStatus !== 'ok' && (
          <Notice tone="error">{errorText(t, panelStatus)}</Notice>
        )}
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
                  <Button variant="ghost" disabled={Boolean(busy)} aria-label={t('store.prod.editAria', { name: p.name })} title={t('store.prod.edit')} onClick={() => edit(p)}>
                    <Pencil size={16} aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" disabled={Boolean(busy)} aria-label={t('store.prod.removeAria', { name: p.name })} title={t('store.prod.removeAria', { name: p.name })} onClick={() => remove(p)}>
                    <Trash2 size={16} aria-hidden="true" />
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

      <div id="store-product-form" className="mt-4 space-y-2 rounded-xl border border-white/10 p-3">
        <p className="font-title text-sm font-bold">{form.id ? t('store.prod.editing', { name: form.name || form.id }) : t('store.prod.newTitle')}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label={t('store.prod.name')} hint={touched && formErrors.name ? <span className="text-red-300">{t(formErrors.name)}</span> : null}>
            <input value={form.name} maxLength={80} disabled={Boolean(form.id)} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={touched && Boolean(formErrors.name)} className={field} />
          </Field>
          <Field label={t('store.prod.price')} hint={formErrors.price && (touched || form.price !== '') ? <span className="text-red-300">{t(formErrors.price)}</span> : t('store.prod.priceHint')}>
            <input type="number" min={MIN_PRICE} max={MAX_PRICE} step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} aria-invalid={Boolean(formErrors.price) && (touched || form.price !== '')} className={field} />
          </Field>
          <Field label={t('store.prod.cost')} hint={formErrors.cost ? <span className="text-red-300">{t(formErrors.cost)}</span> : null}>
            <input type="number" min="0" max={MAX_PRICE} step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} aria-invalid={Boolean(formErrors.cost)} className={field} />
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
        {form.delivery === 'message' && (
          <Field label={t('store.prod.deliveryUrl')} hint={touched && formErrors.deliveryUrl ? <span className="text-red-300">{t(formErrors.deliveryUrl)}</span> : t('store.prod.deliveryUrlHint')}>
            <input type="url" inputMode="url" required value={form.deliveryUrl} maxLength={290} placeholder="https://www.roblox.com/game-pass/..." onChange={(e) => setForm({ ...form, deliveryUrl: e.target.value })} aria-invalid={touched && Boolean(formErrors.deliveryUrl)} className={field} />
          </Field>
        )}
        <div className="flex flex-wrap gap-2">
          <Button disabled={Boolean(busy) || (touched && !formOk)} onClick={save}>
            {form.id ? t('store.prod.saveEdit') : t('store.prod.create')}
          </Button>
          {form.id && (
            <Button variant="ghost" onClick={() => setForm(emptyForm)}>
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
