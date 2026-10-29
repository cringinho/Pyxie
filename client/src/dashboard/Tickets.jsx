import React, { useEffect, useState } from 'react';
import { Clock, FolderPlus, Hash, Image, Inbox, LayoutTemplate, Lock, RefreshCw, Send, Ticket, UserCheck, Users } from 'lucide-react';
import { api } from './api';
import BotPermissions from './Permissions';
import { DiscordPreview } from './hub';
import { Badge, Button, Card, MultiSelect, Notice, Spinner, StatTile, Switch, Toggle } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const TYPES = ['help', 'report'];
const TYPE_EMOJI = { help: '🆘', report: '🚨' };

const NEEDS = [
  { perm: 'ManageChannels', why: 'perm.why.ticketsRooms' },
  { perm: 'SendMessages', why: 'perm.why.ticketsPanel' },
  { perm: 'EmbedLinks', why: 'perm.why.ticketsPanel' },
  { perm: 'AttachFiles', why: 'perm.why.ticketsTranscript' },
];

function formFrom(data) {
  return { panelChannelId: data.config.panelChannelId, categoryId: data.config.categoryId, logChannelId: data.config.logChannelId, options: data.options };
}

function duration(ms) {
  const min = Math.round(ms / 60000);
  if (min >= 1440) return `${Math.floor(min / 1440)}d ${Math.floor((min % 1440) / 60)}h`;
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}min`;
  return `${min}min`;
}

// Fora do componente para o React não recriar o campo (e perder o foco) a cada tecla.
function Labeled({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-white/45">{hint}</span>}
    </label>
  );
}

function ChannelSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${field} bg-[#160d2a]`}>
      <option value="">—</option>
      {options.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  );
}

// Central de atendimento: a mesma em todo servidor; a Cringelândia ganha a Remoção de Conteúdo do Museu.
export default function Tickets({ t, guildId, isOwner }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(null);

  const load = () =>
    api
      .tickets(guildId)
      .then((d) => {
        setData(d);
        setForm(formFrom(d));
      })
      .catch((e) => setStatus({ tone: 'error', code: e.code || 'generic' }));
  useEffect(() => {
    load();
    api.channels(guildId).then((d) => setChannels(d.channels)).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  if (!data || !form) return status ? <Notice tone="error">{t('error.generic', { error: status.code })}</Notice> : <Spinner label={t('app.loading')} />;

  const { defaults, limits, stats } = data;
  const opts = form.options;
  const setOpt = (patch) => setForm({ ...form, options: { ...opts, ...patch } });
  const setType = (type, patch) => setOpt({ types: { ...opts.types, [type]: { ...opts.types[type], ...patch } } });
  const textChannels = channels.filter((c) => [0, 5].includes(c.type)).map((c) => ({ id: c.id, label: `# ${c.name}` }));
  const categories = channels.filter((c) => c.type === 4).map((c) => ({ id: c.id, label: `📁 ${c.name}` }));
  const roleOpts = roles.filter((r) => !r.managed && r.name !== '@everyone').map((r) => ({ id: r.id, label: r.name }));
  const errorText = (code) => {
    const known = t(`error.${code}`);
    return known.startsWith('error.') ? t('error.generic', { error: code }) : known;
  };

  const run = async (fn, okKey) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fn();
      setStatus({ tone: 'ok', text: typeof okKey === 'function' ? okKey(res) : t(okKey) });
      return res;
    } catch (e) {
      setStatus({ tone: 'error', text: errorText(e.code || 'generic') });
      return null;
    } finally {
      setBusy(false);
    }
  };
  const save = () =>
    run(
      async () => {
        const res = await api.saveTickets(guildId, form);
        setData(res);
        setForm(formFrom(res));
        return res;
      },
      (res) => t(res.panelUpdated ? 'tickets.savedPanel' : 'features.saved')
    );
  const publish = (repost) => run(() => api.publishTickets(guildId, repost).then((r) => (load(), r)), (r) => t(r.mode === 'edited' ? 'tickets.panelEdited' : 'tickets.panelPosted'));
  const createCategory = () =>
    run(async () => {
      const r = await api.createTicketCategory(guildId);
      api.channels(guildId).then((d) => setChannels(d.channels)).catch(() => {});
      setForm({ ...form, categoryId: r.categoryId });
      return r;
    }, 'tickets.categoryCreated');
  const closeTicket = (id) =>
    run(async () => {
      const r = await api.closeTicket(guildId, id);
      setClosing(null);
      await load();
      return r;
    }, 'tickets.closed');

  // Prévia do painel com os textos do formulário (o bot monta o mesmo layout)
  const enabledTypes = TYPES.filter((type) => opts.types[type].enabled);
  const withArt = Boolean(data.cringelandia && opts.artRemoval?.enabled);
  const typeLine = (type) => `• **${TYPE_EMOJI[type]} ${opts.types[type].label || defaults.types[type].name}:** ${opts.types[type].description || defaults.types[type].description}`;
  const previewEmbed = {
    color: '#8B5CF6',
    title: opts.panelTitle || defaults.panelTitle,
    description: [opts.panelIntro || defaults.panelIntro, defaults.panelSection, ...enabledTypes.map(typeLine), ...(withArt ? [defaults.optArt] : []), defaults.panelNote].join('\n\n'),
  };
  const previewButtons = [
    ...enabledTypes.map((type) => ({ label: opts.types[type].label || defaults.types[type].label, emoji: TYPE_EMOJI[type], style: type === 'help' ? 'primary' : 'secondary' })),
    ...(withArt ? [{ label: defaults.btnArt, emoji: '🖼️' }] : []),
  ];
  const brokenHealth = Object.entries(data.health).filter(([, ok]) => !ok).map(([k]) => k);

  return (
    <div className="space-y-4">
      <BotPermissions t={t} guildId={guildId} needs={NEEDS} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={Inbox} label={t('tickets.statOpen')} value={stats.open} />
        <StatTile icon={Ticket} accent="violet" label={t('tickets.statTotal')} value={stats.total} />
        <StatTile icon={UserCheck} accent="green" label={t('tickets.statClaimed')} value={stats.claimed} />
        <StatTile icon={Clock} accent="cyan" label={t('tickets.statAvg')} value={stats.closed ? duration(stats.avgResolutionMs) : '—'} hint={t('tickets.statByType', { help: stats.byType.help, report: stats.byType.report })} />
      </div>

      {brokenHealth.length > 0 && <Notice tone="error">{t('tickets.health', { items: brokenHealth.map((k) => t(`tickets.healthItem.${k}`)).join(', ') })}</Notice>}

      <Card title={t('tickets.channelsTitle')} icon={Hash}>
        <p className="mb-3 text-sm text-white/70">{t('tickets.channelsHint')}</p>
        <div className="space-y-3">
          <Labeled label={t('tickets.panelChannel')} hint={t('tickets.panelChannelHint')}>
            <ChannelSelect value={form.panelChannelId} options={textChannels} onChange={(v) => setForm({ ...form, panelChannelId: v })} />
          </Labeled>
          <Labeled label={t('tickets.category')} hint={t('tickets.categoryHint')}>
            <div className="flex gap-2">
              <ChannelSelect value={form.categoryId} options={categories} onChange={(v) => setForm({ ...form, categoryId: v })} />
              <Button variant="ghost" disabled={busy} onClick={createCategory} className="flex shrink-0 items-center gap-2">
                <FolderPlus size={16} aria-hidden="true" />
                {t('tickets.createCategory')}
              </Button>
            </div>
          </Labeled>
          <Labeled label={t('tickets.logChannel')} hint={t('tickets.logChannelHint')}>
            <ChannelSelect value={form.logChannelId} options={textChannels} onChange={(v) => setForm({ ...form, logChannelId: v })} />
          </Labeled>
        </div>
      </Card>

      <Card title={t('tickets.panelTitle')} icon={LayoutTemplate}>
        <div className="space-y-3">
          <Labeled label={t('tickets.panelHeading')}>
            <input value={opts.panelTitle} maxLength={limits.panelTitle} placeholder={defaults.panelTitle} onChange={(e) => setOpt({ panelTitle: e.target.value })} className={field} />
          </Labeled>
          <Labeled label={t('tickets.panelIntro')} hint={t('tickets.emptyDefault')}>
            <textarea rows={3} value={opts.panelIntro} maxLength={limits.panelIntro} placeholder={defaults.panelIntro} onChange={(e) => setOpt({ panelIntro: e.target.value })} className={`${field} py-2`} />
          </Labeled>
          {TYPES.map((type) => (
            <fieldset key={type} className="space-y-2 rounded-xl border border-white/10 p-3">
              <legend className="flex w-full items-center justify-between gap-3 px-1 text-sm font-semibold">
                <span>
                  {TYPE_EMOJI[type]} {t(`tickets.type.${type}`)}
                </span>
                <Switch checked={opts.types[type].enabled} onChange={(v) => setType(type, { enabled: v })} label={t('tickets.typeOn', { type: t(`tickets.type.${type}`) })} />
              </legend>
              <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                <Labeled label={t('tickets.typeLabel')}>
                  <input value={opts.types[type].label} maxLength={limits.label} placeholder={defaults.types[type].label} onChange={(e) => setType(type, { label: e.target.value })} className={field} />
                </Labeled>
                <Labeled label={t('tickets.typeDesc')}>
                  <input value={opts.types[type].description} maxLength={limits.description} placeholder={defaults.types[type].description} onChange={(e) => setType(type, { description: e.target.value })} className={field} />
                </Labeled>
              </div>
            </fieldset>
          ))}
          {enabledTypes.length === 0 && !withArt && <Notice>{t('tickets.noTypes')}</Notice>}
          <DiscordPreview label={t('tickets.preview')} embed={previewEmbed} buttons={previewButtons} />
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" disabled={busy || !data.config.panelChannelId} onClick={() => publish(false)} className="flex items-center gap-2">
              <RefreshCw size={16} aria-hidden="true" />
              {t(data.config.panelMessageId ? 'tickets.updatePanel' : 'tickets.publishPanel')}
            </Button>
            {data.config.panelMessageId && (
              <Button variant="ghost" disabled={busy} onClick={() => publish(true)} className="flex items-center gap-2">
                <Send size={16} aria-hidden="true" />
                {t('tickets.repostPanel')}
              </Button>
            )}
            {isOwner && (
              <Button variant="ghost" disabled={busy} onClick={() => run(() => api.ticketsPreview(guildId), 'tickets.previewSent')}>
                {t('tickets.homologation')}
              </Button>
            )}
          </div>
          <p className="text-xs text-white/50">{t(data.config.panelChannelId ? 'tickets.publishHint' : 'tickets.publishNeedsChannel')}</p>
        </div>
      </Card>

      <Card title={t('tickets.roomsTitle')} icon={Users}>
        <div className="space-y-3">
          <Labeled label={t('tickets.maxOpen')} hint={t('tickets.maxOpenHint', { min: limits.maxOpenPerUser.min, max: limits.maxOpenPerUser.max })}>
            <input type="number" min={limits.maxOpenPerUser.min} max={limits.maxOpenPerUser.max} value={opts.maxOpenPerUser} onChange={(e) => setOpt({ maxOpenPerUser: e.target.value })} className={field} />
          </Labeled>
          <span className="block text-xs font-semibold text-white/70">{t('tickets.staffRoles')}</span>
          <MultiSelect options={roleOpts} value={opts.staffRoleIds} emptyLabel={t('tickets.noRoles')} onChange={(v) => setOpt({ staffRoleIds: v.slice(0, limits.staffRoles) })} />
          <p className="text-[11px] text-white/45">{t('tickets.staffRolesHint')}</p>
          <Labeled label={t('tickets.roomMessage')} hint={t('tickets.roomMessageHint')}>
            <textarea rows={4} value={opts.roomMessage} maxLength={limits.roomMessage} placeholder={defaults.roomMessage} onChange={(e) => setOpt({ roomMessage: e.target.value })} className={`${field} py-2`} />
          </Labeled>
          <Toggle label={t('tickets.dmTranscript')} checked={opts.dmTranscript} onChange={(v) => setOpt({ dmTranscript: v })} />
        </div>
      </Card>

      {data.cringelandia && opts.artRemoval && (
        <Card title={t('tickets.artTitle')} eyebrow={t('zone.cringelandia')} icon={Image}>
          <p className="mb-3 text-sm text-white/70">{t('tickets.artHint')}</p>
          <div className="space-y-3">
            <Toggle label={t('tickets.artOn')} checked={opts.artRemoval.enabled} onChange={(v) => setOpt({ artRemoval: { ...opts.artRemoval, enabled: v } })} />
            <Labeled label={t('tickets.artChannel')}>
              <ChannelSelect value={opts.artRemoval.channelId} options={textChannels} onChange={(v) => setOpt({ artRemoval: { ...opts.artRemoval, channelId: v } })} />
            </Labeled>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mystic-glow/80">{t('tickets.artPending', { count: stats.artRemovalsPending })}</h3>
            {data.artRemovals.length === 0 ? (
              <p className="text-sm text-white/60">{t('tickets.artNone')}</p>
            ) : (
              <ul className="space-y-2">
                {data.artRemovals.map((r) => (
                  <li key={r.requestId} className="rounded-xl border border-white/10 p-3 text-sm">
                    <p className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="font-semibold">{r.userTag || r.userId}</strong>
                      <span className="text-[11px] text-white/45">{new Date(r.createdAt).toLocaleString()}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-line text-white/70">{r.details}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      )}

      {status && <Notice tone={status.tone === 'ok' ? 'ok' : 'error'}>{status.text || errorText(status.code)}</Notice>}
      <Button className="w-full" disabled={busy} onClick={save}>
        {t('features.save')}
      </Button>

      <Card title={t('tickets.openTitle')} icon={Lock} eyebrow={t('tickets.openCount', { count: stats.open })}>
        {data.open.length === 0 ? (
          <p className="text-sm text-white/60">{t('tickets.openNone')}</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {data.open.map((tk) => (
              <li key={tk.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-black/40 px-1 text-xs">#{String(tk.number).padStart(4, '0')}</code>
                    <Badge tone={tk.type === 'report' ? 'red' : 'violet'}>{t(`tickets.type.${tk.type}`)}</Badge>
                    {tk.claimedBy ? <Badge tone="green">{t('tickets.claimed')}</Badge> : <Badge tone="muted">{t('tickets.unclaimed')}</Badge>}
                  </span>
                  <span className="mt-0.5 block truncate text-white/70">
                    {tk.userTag || tk.userId} · {tk.channelName ? `#${tk.channelName}` : t('tickets.channelGone')} · {new Date(tk.createdAt).toLocaleString()}
                  </span>
                </span>
                {closing === tk.id ? (
                  <span className="flex gap-2">
                    <Button disabled={busy} onClick={() => closeTicket(tk.id)}>
                      {t('tickets.closeConfirm')}
                    </Button>
                    <Button variant="ghost" onClick={() => setClosing(null)}>
                      {t('tickets.cancel')}
                    </Button>
                  </span>
                ) : (
                  <Button variant="ghost" onClick={() => setClosing(tk.id)}>
                    {t('tickets.close')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-white/50">{t('tickets.closeHint')}</p>
      </Card>
    </div>
  );
}
