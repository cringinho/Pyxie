import React, { useCallback, useEffect, useState } from 'react';
import { ImageDown, PackageCheck, PauseCircle, ShoppingBag, Trash2, PackageX } from 'lucide-react';
import { api } from './api';
import { Badge, Button, Card, Notice, Spinner, StatTile, Switch } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const OUT = new Set(['out_of_stock', 'inactive']);
const EMPTY = { link: '', titulo: '', preco: '', tag: '', taxa_comissao: '', imagem: '' };

// Vitrine de afiliados da Shopee (área global do dono), com as APIs que já existiam no /admin.
export default function Shopee({ t }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.shopee().then(setData).catch((e) => setError(e.code || 'generic'));
  }, []);
  useEffect(load, [load]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;

  const run = async (fn, okKey) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      setNotice({ tone: 'ok', text: t(okKey) });
      load();
    } catch (e) {
      setNotice({ tone: 'error', text: t('error.generic', { error: e.code || 'generic' }) });
    }
    setBusy(false);
  };

  const preview = async () => {
    if (!form.link) return;
    setBusy(true);
    try {
      const meta = await api.shopeePreview(form.link);
      setForm({ ...form, titulo: form.titulo || meta.title || '', imagem: meta.image || form.imagem });
    } catch (_) {
      setNotice({ tone: 'error', text: t('shopee.previewFailed') });
    }
    setBusy(false);
  };

  const { stats, items } = data;
  const input = (key, label, props = {}) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={field} {...props} />
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={ShoppingBag} label={t('shopee.total')} value={stats.total} hint={t('shopee.avgRate', { rate: stats.avgCommissionRate })} />
        <StatTile icon={PackageCheck} accent="green" label={t('shopee.active')} value={stats.activeCount} />
        <StatTile icon={PauseCircle} accent="violet" label={t('shopee.paused')} value={stats.pausedCount} />
        <StatTile icon={PackageX} accent="cyan" label={t('shopee.outOfStock')} value={stats.outOfStockCount} />
      </div>

      <Card title={t('shopee.addTitle')}>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => api.shopeeAdd(form), 'shopee.added').then(() => setForm(EMPTY));
          }}
        >
          <div className="sm:col-span-2">{input('link', t('shopee.link'), { required: true, type: 'url', placeholder: 'https://s.shopee.com.br/...' })}</div>
          {input('titulo', t('shopee.title'))}
          {input('preco', t('shopee.price'), { placeholder: 'R$ 29,90' })}
          {input('tag', t('shopee.tag'))}
          {input('taxa_comissao', t('shopee.rate'), { placeholder: '10%' })}
          {form.imagem && <img src={form.imagem} alt={form.titulo || t('shopee.title')} className="h-24 w-24 rounded-xl object-cover" />}
          <div className="flex gap-2 sm:col-span-2">
            <Button variant="ghost" onClick={preview} disabled={busy || !form.link}>
              {t('shopee.preview')}
            </Button>
            <Button type="submit" disabled={busy} className="flex-1">
              {t('shopee.add')}
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" disabled={busy} onClick={() => run(() => api.shopeeCheckAll(), 'shopee.checked')}>
          {t('shopee.checkAll')}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => run(() => api.shopeeSyncImages(), 'shopee.synced')}>
          {t('shopee.syncImages')}
        </Button>
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <ul className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="dash-card flex gap-3 rounded-2xl p-3">
            <img src={item.imagem} alt={item.titulo} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl bg-black/40 object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex items-start justify-between gap-2">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="line-clamp-2 font-semibold hover:underline">
                  {item.titulo}
                </a>
                <Switch checked={item.active !== false} label={t('shopee.toggle', { title: item.titulo })} onChange={(v) => run(() => api.shopeeToggle(item.id, v), 'shopee.saved')} />
              </div>
              <p className="text-white/60">
                {item.preco} · {item.loja} · {item.taxa_comissao}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={OUT.has(item.status) ? 'red' : item.active === false ? 'muted' : 'green'}>{t(`shopee.status.${OUT.has(item.status) ? 'out' : item.active === false ? 'paused' : 'active'}`)}</Badge>
                <button type="button" className="text-xs text-mystic-glow hover:underline" onClick={() => run(() => api.shopeeSyncImage(item.id), 'shopee.synced')}>
                  <ImageDown size={13} className="mr-1 inline" aria-hidden="true" />
                  {t('shopee.syncOne')}
                </button>
                <button
                  type="button"
                  className="ml-auto text-red-300"
                  aria-label={t('shopee.delete')}
                  onClick={() => window.confirm(t('shopee.confirmDelete', { title: item.titulo })) && run(() => api.shopeeDelete(item.id), 'shopee.deleted')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
