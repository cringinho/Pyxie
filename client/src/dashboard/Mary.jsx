import React, { useEffect, useState } from 'react';
import { Calculator, Copy, Gift, ImagePlus, LayoutTemplate, MessageSquareQuote, Receipt, Search, Sparkles, Store, UserRound, Wallet } from 'lucide-react';
import { api, request, ApiError } from './api';
import { Button, Card, Notice, Spinner, StatTile, Toggle } from './ui';
import { go } from './Shell';

// Telas da zona da Mary (servidor dela; só a Mary e o dono). API: /api/dashboard/guilds/:id/mary/*.
const base = (id) => `/api/dashboard/guilds/${id}/mary`;
const maryApi = {
  store: (id) => request(`${base(id)}/store`),
  saveStore: (id, body) => request(`${base(id)}/store`, { method: 'PUT', body }),
  calc: (id, body) => request(`${base(id)}/calc`, { method: 'POST', body }),
  gamepass: (id, input) => request(`${base(id)}/roblox/gamepass?input=${encodeURIComponent(input)}`),
  robloxUser: (id, username) => request(`${base(id)}/roblox/user?username=${encodeURIComponent(username)}`),
  receipt: (id, body) => request(`${base(id)}/receipt`, { method: 'POST', body }),
  giveaway: (id, body) => request(`${base(id)}/giveaway`, { method: 'POST', body }),
  profile: (id) => request(`${base(id)}/profile`),
  saveProfile: (id, body) => request(`${base(id)}/profile`, { method: 'PUT', body }),
  fromTemplate: (id, tpl) => request(`${base(id)}/templates/${encodeURIComponent(tpl)}`, { method: 'POST', body: {} }),
};

// A imagem vai crua (sem JSON) para caber até 8 MB.
async function uploadImage(guildId, file) {
  const res = await fetch(`${base(guildId)}/upload`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Pyxie-Panel': '1' },
    body: file,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new ApiError(data.error || `http_${res.status}`, res.status, data);
  return data.url;
}

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const brl = (n) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;
const robux = (n) => Number(n || 0).toLocaleString('pt-BR');

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/50">{hint}</span>}
    </label>
  );
}

function Pick({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${field} bg-[#160d2a]`}>
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Status({ t, status }) {
  if (!status) return null;
  if (status === 'ok') return <Notice tone="ok">{t('features.saved')}</Notice>;
  if (status.startsWith('done:')) return <Notice tone="ok">{t(status.slice(5))}</Notice>;
  const known = t(`mary.err.${status}`);
  return <Notice tone="error">{known.startsWith('mary.err.') ? t('error.generic', { error: status }) : known}</Notice>;
}

function useChannels(guildId) {
  const [channels, setChannels] = useState([]);
  useEffect(() => {
    api.channels(guildId).then((d) => setChannels(d.channels)).catch(() => {});
  }, [guildId]);
  return channels;
}

function ImageInput({ t, guildId, label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(guildId, file));
    } catch (err) {
      setError(err.code || 'generic');
    }
    setBusy(false);
  };
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input value={value || ''} placeholder="https://" onChange={(e) => onChange(e.target.value)} className={field} />
        <label className={`flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold hover:bg-white/10 ${busy ? 'opacity-50' : ''}`}>
          <ImagePlus size={16} aria-hidden="true" />
          {busy ? t('mary.uploading') : t('mary.upload')}
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="sr-only" onChange={pick} disabled={busy} />
        </label>
      </div>
      {value && /^https:\/\//.test(value) && <img src={value} alt={label} className="mt-2 max-h-32 rounded-lg border border-white/10" />}
      {error && (
        <div className="mt-1">
          <Status t={t} status={error} />
        </div>
      )}
    </Field>
  );
}

// ---------- Lojinha ----------

export function MaryStore({ t, guildId }) {
  const [data, setData] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const channels = useChannels(guildId);
  useEffect(() => {
    maryApi
      .store(guildId)
      .then((d) => {
        setData(d);
        setCfg(d.store);
      })
      .catch((e) => setStatus(e.code || 'generic'));
    api.roles(guildId).then((d) => setRoles(d.roles)).catch(() => {});
  }, [guildId]);
  if (!cfg) return status ? <Status t={t} status={status} /> : <Spinner label={t('app.loading')} />;

  const set = (patch) => setCfg({ ...cfg, ...patch });
  const save = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { stats, variables, ...body } = cfg;
      const res = await maryApi.saveStore(guildId, body);
      setCfg(res.store);
      setData({ ...data, store: res.store });
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(false);
  };
  const applyTemplate = async (id) => {
    setStatus(null);
    try {
      const res = await maryApi.fromTemplate(guildId, id);
      go(`#/guild/${guildId}/studio/${res.id}`);
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };
  const copy = (m) => {
    const text = m.text.replaceAll('{pix_key}', cfg.pixKey || '').replaceAll('{pix_name}', cfg.pixName || '');
    navigator.clipboard?.writeText(text).then(() => setCopied(m.id)).catch(() => {});
  };
  const macros = cfg.macros || [];
  const setMacro = (i, patch) => set({ macros: macros.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const { stats } = data.store;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label={t('mary.stat.reviews')} value={stats.reviews} />
        <StatTile label={t('mary.stat.average')} value={stats.average ?? '—'} accent="violet" />
        <StatTile label={t('mary.stat.tickets')} value={stats.openTickets} />
        <StatTile label={t('mary.stat.giveaways')} value={stats.giveaways} accent="violet" />
      </div>

      <Card title={t('mary.store.title')} icon={Store}>
        <p className="mb-3 text-sm text-white/70">{t('mary.store.hint')}</p>
        <div className="mb-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('mary.store.status')}>
          {['online', 'fila', 'offline'].map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={cfg.statusLoja === s}
              onClick={() => set({ statusLoja: s })}
              className={`min-h-[44px] rounded-xl border px-2 text-sm font-semibold ${cfg.statusLoja === s ? 'border-pyxie-glow bg-pyxie-pink/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
              {t(`mary.status.${s}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('mary.store.stock')}>
            <input type="number" min="0" value={cfg.estoqueRobux} onChange={(e) => set({ estoqueRobux: e.target.value })} className={field} />
          </Field>
          <Field label={t('mary.store.price')}>
            <input type="number" min="0" step="0.5" value={cfg.preco1k} onChange={(e) => set({ preco1k: e.target.value })} className={field} />
          </Field>
        </div>
      </Card>

      <Card title={t('mary.pix.title')} icon={Wallet}>
        <p className="mb-3 text-sm text-white/70">{t('mary.pix.hint')}</p>
        <div className="space-y-3">
          <Field label={t('mary.pix.key')}>
            <input value={cfg.pixKey} maxLength={77} onChange={(e) => set({ pixKey: e.target.value })} className={field} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('mary.pix.name')}>
              <input value={cfg.pixName} maxLength={25} onChange={(e) => set({ pixName: e.target.value })} className={field} />
            </Field>
            <Field label={t('mary.pix.city')}>
              <input value={cfg.pixCity} maxLength={15} onChange={(e) => set({ pixCity: e.target.value })} className={field} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title={t('mary.tickets.title')} icon={MessageSquareQuote}>
        <div className="space-y-3">
          <Toggle label={t('mary.flag.ticketModule')} checked={cfg.featureFlags.ticketModule} onChange={(v) => set({ featureFlags: { ...cfg.featureFlags, ticketModule: v } })} />
          <Pick label={t('mary.tickets.category')} value={cfg.channelTickets} onChange={(v) => set({ channelTickets: v })} options={channels.filter((c) => c.type === 4).map((c) => ({ id: c.id, label: c.name }))} />
          <Pick label={t('mary.tickets.reviews')} value={cfg.channelReviews} onChange={(v) => set({ channelReviews: v })} options={channels.filter((c) => [0, 5].includes(c.type)).map((c) => ({ id: c.id, label: `#${c.name}` }))} />
          <Pick label={t('mary.tickets.role')} value={cfg.roleClient} onChange={(v) => set({ roleClient: v })} options={roles.filter((r) => r.assignable).map((r) => ({ id: r.id, label: r.name }))} />
          <Toggle label={t('mary.flag.antiLinkModule')} checked={cfg.featureFlags.antiLinkModule} onChange={(v) => set({ featureFlags: { ...cfg.featureFlags, antiLinkModule: v } })} />
        </div>
      </Card>

      <Card title={t('mary.macros.title')} icon={Copy}>
        <p className="mb-3 text-sm text-white/70">{t('mary.macros.hint')}</p>
        <div className="space-y-3">
          {macros.map((m, i) => (
            <div key={m.id || i} className="space-y-2 rounded-xl border border-white/10 p-3">
              <input value={m.label} maxLength={80} aria-label={t('mary.macros.label')} placeholder={t('mary.macros.label')} onChange={(e) => setMacro(i, { label: e.target.value })} className={field} />
              <textarea value={m.text} maxLength={2000} rows={3} aria-label={t('mary.macros.text')} onChange={(e) => setMacro(i, { text: e.target.value })} className={`${field} py-2`} />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => copy(m)}>
                  {copied === m.id ? t('mary.macros.copied') : t('mary.macros.copy')}
                </Button>
                <Button variant="ghost" onClick={() => set({ macros: macros.filter((_, j) => j !== i) })}>
                  {t('studio.remove')}
                </Button>
              </div>
            </div>
          ))}
          {macros.length < 25 && (
            <Button variant="ghost" className="w-full" onClick={() => set({ macros: [...macros, { id: `m${Date.now().toString(36)}`, label: '', text: '' }] })}>
              + {t('mary.macros.add')}
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-2">
        <Status t={t} status={status} />
        <Button className="w-full" onClick={save} disabled={busy}>
          {t('features.save')}
        </Button>
      </div>

      <Card title={t('mary.vars.title')} icon={Sparkles}>
        <p className="mb-3 text-sm text-white/70">{t('mary.vars.hint')}</p>
        <ul className="divide-y divide-white/5 text-sm">
          {Object.entries(data.store.variables).map(([k, v]) => (
            <li key={k} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">{`{${k}}`}</code>
              <span className="text-white/70">{v}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title={t('mary.templates.title')} icon={LayoutTemplate}>
        <p className="mb-3 text-sm text-white/70">{t('mary.templates.hint')}</p>
        <ul className="space-y-2">
          {data.templates.map((tpl) => (
            <li key={tpl.id} className="flex flex-col gap-2 rounded-xl border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0">
                <span className="block font-semibold">{tpl.name}</span>
                <span className="block text-xs text-white/60">{tpl.description}</span>
              </span>
              <Button variant="ghost" className="shrink-0" onClick={() => applyTemplate(tpl.id)}>
                {t('mary.templates.use')}
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ---------- Ferramentas Robux ----------

export function MaryTools({ t, guildId }) {
  const channels = useChannels(guildId);
  const text = channels.filter((c) => [0, 5].includes(c.type)).map((c) => ({ id: c.id, label: `#${c.name}` }));
  return (
    <div className="space-y-4">
      <CalcCard t={t} guildId={guildId} />
      <GamepassCard t={t} guildId={guildId} />
      <PlayerCard t={t} guildId={guildId} />
      <ReceiptCard t={t} guildId={guildId} channels={text} />
      <GiveawayCard t={t} guildId={guildId} channels={text} />
    </div>
  );
}

function CalcCard({ t, guildId }) {
  const [input, setInput] = useState({ robux: '', brl: '' });
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const run = async (body) => {
    setStatus(null);
    try {
      setResult((await maryApi.calc(guildId, body)).result);
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };
  return (
    <Card title={t('mary.calc.title')} icon={Calculator}>
      <p className="mb-3 text-sm text-white/70">{t('mary.calc.hint')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-end gap-2">
          <Field label={t('mary.calc.robux')}>
            <input type="number" min="1" value={input.robux} onChange={(e) => setInput({ ...input, robux: e.target.value })} className={field} />
          </Field>
          <Button onClick={() => run({ robux: input.robux })}>{t('mary.calc.go')}</Button>
        </div>
        <div className="flex items-end gap-2">
          <Field label={t('mary.calc.brl')}>
            <input type="number" min="1" step="0.5" value={input.brl} onChange={(e) => setInput({ ...input, brl: e.target.value })} className={field} />
          </Field>
          <Button onClick={() => run({ brl: input.brl })}>{t('mary.calc.go')}</Button>
        </div>
      </div>
      <div className="mt-3">
        <Status t={t} status={status} />
        {result && (
          <ul className="space-y-1 rounded-xl bg-white/5 p-3 text-sm">
            <li>{t('mary.calc.receive', { robux: robux(result.robux) })}</li>
            <li>{t('mary.calc.gamepass', { robux: robux(result.gamepass) })}</li>
            <li>{t('mary.calc.price', { price: brl(result.price), rate: brl(result.rate) })}</li>
          </ul>
        )}
      </div>
    </Card>
  );
}

function GamepassCard({ t, guildId }) {
  const [input, setInput] = useState('');
  const [gp, setGp] = useState(null);
  const [status, setStatus] = useState(null);
  const run = async () => {
    setStatus(null);
    setGp(null);
    try {
      setGp((await maryApi.gamepass(guildId, input)).gamepass);
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };
  return (
    <Card title={t('mary.gamepass.title')} icon={Search}>
      <p className="mb-3 text-sm text-white/70">{t('mary.gamepass.hint')}</p>
      <div className="flex items-end gap-2">
        <Field label={t('mary.gamepass.input')}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://www.roblox.com/game-pass/..." className={field} />
        </Field>
        <Button onClick={run} disabled={!input.trim()}>
          {t('mary.calc.go')}
        </Button>
      </div>
      <div className="mt-3">
        <Status t={t} status={status} />
        {gp && (
          <div className="flex gap-3 rounded-xl bg-white/5 p-3 text-sm">
            {gp.iconUrl && <img src={gp.iconUrl} alt={gp.name} className="h-16 w-16 rounded-lg" />}
            <ul className="min-w-0 space-y-1">
              <li className="font-semibold">{gp.name}</li>
              <li>{t('mary.gamepass.creator', { name: gp.creatorName })}</li>
              <li>{t('mary.gamepass.price', { price: robux(gp.priceInRobux), liquid: robux(gp.liquidRobux) })}</li>
              <li>{gp.isForSale ? t('mary.gamepass.forSale') : t('mary.gamepass.notForSale')}</li>
              <li>
                <a href={gp.buyUrl} target="_blank" rel="noreferrer" className="text-pyxie-glow underline">
                  {t('mary.gamepass.open')}
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

function PlayerCard({ t, guildId }) {
  const [nick, setNick] = useState('');
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const run = async () => {
    setStatus(null);
    setUser(null);
    try {
      setUser((await maryApi.robloxUser(guildId, nick.trim())).user);
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };
  return (
    <Card title={t('mary.player.title')} icon={UserRound}>
      <p className="mb-3 text-sm text-white/70">{t('mary.player.hint')}</p>
      <div className="flex items-end gap-2">
        <Field label={t('mary.player.nick')}>
          <input value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} className={field} />
        </Field>
        <Button onClick={run} disabled={!nick.trim()}>
          {t('mary.calc.go')}
        </Button>
      </div>
      <div className="mt-3">
        <Status t={t} status={status} />
        {user && (
          <div className="flex gap-3 rounded-xl bg-white/5 p-3 text-sm">
            {user.avatarUrl && <img src={user.avatarUrl} alt={user.displayName} className="h-16 w-16 rounded-lg" />}
            <ul className="min-w-0 space-y-1">
              <li className="font-semibold">
                {user.displayName} (@{user.name})
              </li>
              <li>ID: {user.id}</li>
              <li>
                <a href={user.profileUrl} target="_blank" rel="noreferrer" className="text-pyxie-glow underline">
                  {t('mary.player.profile')}
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

function ReceiptCard({ t, guildId, channels }) {
  const [form, setForm] = useState({ channelId: '', clientNick: '', clientRobux: '', clientPrice: '', proofImageUrl: '', notes: '' });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (patch) => setForm({ ...form, ...patch });
  const send = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await maryApi.receipt(guildId, form);
      setStatus('done:mary.receipt.sent');
      setForm({ ...form, clientNick: '', clientRobux: '', clientPrice: '', proofImageUrl: '', notes: '' });
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(false);
  };
  return (
    <Card title={t('mary.receipt.title')} icon={Receipt}>
      <p className="mb-3 text-sm text-white/70">{t('mary.receipt.hint')}</p>
      <div className="space-y-3">
        <Pick label={t('mary.channel')} value={form.channelId} onChange={(v) => set({ channelId: v })} options={channels} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('mary.receipt.nick')}>
            <input value={form.clientNick} maxLength={40} onChange={(e) => set({ clientNick: e.target.value })} className={field} />
          </Field>
          <Field label={t('mary.receipt.robux')}>
            <input type="number" min="1" value={form.clientRobux} onChange={(e) => set({ clientRobux: e.target.value })} className={field} />
          </Field>
        </div>
        <Field label={t('mary.receipt.price')} hint={t('mary.receipt.priceHint')}>
          <input type="number" min="0" step="0.01" value={form.clientPrice} onChange={(e) => set({ clientPrice: e.target.value })} className={field} />
        </Field>
        <ImageInput t={t} guildId={guildId} label={t('mary.receipt.proof')} value={form.proofImageUrl} onChange={(v) => set({ proofImageUrl: v })} />
        <Field label={t('mary.receipt.notes')}>
          <input value={form.notes} maxLength={300} onChange={(e) => set({ notes: e.target.value })} className={field} />
        </Field>
        <Status t={t} status={status} />
        <Button className="w-full" onClick={send} disabled={busy || !form.channelId || !form.clientNick || !form.clientRobux}>
          {t('mary.receipt.send')}
        </Button>
      </div>
    </Card>
  );
}

function GiveawayCard({ t, guildId, channels }) {
  const [form, setForm] = useState({ channelId: '', prize: '', durationMinutes: 60, winnersCount: 1 });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (patch) => setForm({ ...form, ...patch });
  const send = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await maryApi.giveaway(guildId, form);
      setStatus('done:mary.giveaway.sent');
      set({ prize: '' });
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(false);
  };
  return (
    <Card title={t('mary.giveaway.title')} icon={Gift}>
      <p className="mb-3 text-sm text-white/70">{t('mary.giveaway.hint')}</p>
      <div className="space-y-3">
        <Pick label={t('mary.channel')} value={form.channelId} onChange={(v) => set({ channelId: v })} options={channels} />
        <Field label={t('mary.giveaway.prize')}>
          <input value={form.prize} maxLength={200} onChange={(e) => set({ prize: e.target.value })} className={field} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('mary.giveaway.minutes')}>
            <input type="number" min="5" max="10080" value={form.durationMinutes} onChange={(e) => set({ durationMinutes: e.target.value })} className={field} />
          </Field>
          <Field label={t('mary.giveaway.winners')}>
            <input type="number" min="1" max="10" value={form.winnersCount} onChange={(e) => set({ winnersCount: e.target.value })} className={field} />
          </Field>
        </div>
        <Status t={t} status={status} />
        <Button className="w-full" onClick={send} disabled={busy || !form.channelId || !form.prize.trim()}>
          {t('mary.giveaway.send')}
        </Button>
      </div>
    </Card>
  );
}

// ---------- Aparência da Pyxie no servidor ----------

export function MaryProfile({ t, guildId }) {
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    maryApi
      .profile(guildId)
      .then((d) => {
        setProfile(d.profile);
        setSaved(d.profile);
      })
      .catch((e) => setStatus(e.code || 'generic'));
  }, [guildId]);
  if (!profile) return status ? <Status t={t} status={status} /> : <Spinner label={t('app.loading')} />;
  const set = (patch) => setProfile({ ...profile, ...patch });
  const save = async () => {
    setBusy(true);
    setStatus(null);
    try {
      // Só o que mudou: trocar avatar e banner à toa esbarra no limite do Discord.
      const changed = Object.fromEntries(Object.entries(profile).filter(([k, v]) => v !== saved[k]));
      const res = await maryApi.saveProfile(guildId, changed);
      setProfile(res.profile);
      setSaved(res.profile);
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(false);
  };
  return (
    <Card title={t('mary.profile.title')} icon={Sparkles}>
      <p className="mb-3 text-sm text-white/70">{t('mary.profile.hint')}</p>
      <div className="space-y-3">
        <Field label={t('mary.profile.nick')}>
          <input value={profile.nick} maxLength={32} onChange={(e) => set({ nick: e.target.value })} className={field} />
        </Field>
        <Field label={t('mary.profile.bio')} hint={t('mary.profile.bioHint')}>
          <textarea value={profile.bio} maxLength={190} rows={3} onChange={(e) => set({ bio: e.target.value })} className={`${field} py-2`} />
        </Field>
        <ImageInput t={t} guildId={guildId} label={t('mary.profile.avatar')} value={profile.avatarUrl} onChange={(v) => set({ avatarUrl: v })} />
        <ImageInput t={t} guildId={guildId} label={t('mary.profile.banner')} value={profile.bannerUrl} onChange={(v) => set({ bannerUrl: v })} />
        <p className="text-xs text-white/50">{t('mary.profile.resetHint')}</p>
        <Status t={t} status={status} />
        <Button className="w-full" onClick={save} disabled={busy}>
          {t('features.save')}
        </Button>
      </div>
    </Card>
  );
}
