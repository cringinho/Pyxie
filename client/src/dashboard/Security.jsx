import React, { useEffect, useState } from 'react';
import { Link2Off, ShieldCheck, ShieldHalf, KeyRound, Hash } from 'lucide-react';
import { api } from './api';
import BotPermissions from './Permissions';
import { Button, Card, Notice, Spinner, StatTile, Toggle } from './ui';

const field = 'min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm';

function Choice({ name, value, current, label, onChange }) {
  return (
    <label className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm ${current === value ? 'border-pyxie-glow/60 bg-pyxie-bright/10' : 'border-white/10 bg-white/5'}`}>
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} className="accent-pink-500" />
      {label}
    </label>
  );
}

function eventText(t, e) {
  if (e.type === 'link') {
    const host = e.unicodeHost && e.unicodeHost !== e.host ? `${e.unicodeHost} (${e.host})` : e.host;
    return t('sec.event.link', { host, brand: e.imitates || t('sec.unknownBrand') });
  }
  if (e.type === 'role') return t('sec.event.role', { role: e.roleName, perms: (e.perms || []).map((p) => t(`sec.perm.${p}`)).join(', ') });
  return t('sec.event.channel', { channel: e.channelName });
}

// Segurança (todos os servidores): escudo de links e guardião do servidor.
export default function Security({ t, guildId }) {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .security(guildId)
      .then((d) => {
        setData(d);
        setDraft({ ...d.security, allowText: d.security.linkShield.allowDomains.join('\n') });
      })
      .catch((e) => setError(e.code || 'generic'));
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
  }, [guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data || !draft) return <Spinner label={t('app.loading')} />;

  const setLink = (patch) => setDraft({ ...draft, linkShield: { ...draft.linkShield, ...patch } });
  const setGuard = (patch) => setDraft({ ...draft, guard: { ...draft.guard, ...patch } });

  const save = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await api.saveSecurity(guildId, {
        staffLogChannelId: draft.staffLogChannelId,
        linkShield: { ...draft.linkShield, allowDomains: draft.allowText.split(/[\s,]+/).filter(Boolean) },
        guard: draft.guard,
      });
      setDraft({ ...res.security, allowText: res.security.linkShield.allowDomains.join('\n') });
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(false);
  };

  const { counters, events } = data;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Link2Off} label={t('sec.statLinks')} value={counters.link} />
        <StatTile icon={KeyRound} accent="violet" label={t('sec.statRoles')} value={counters.role} />
        <StatTile icon={Hash} accent="cyan" label={t('sec.statChannels')} value={counters.channel} />
      </div>

      <BotPermissions
        t={t}
        guildId={guildId}
        needs={[
          { perm: 'ManageMessages', why: 'perm.why.deleteLinks' },
          { perm: 'ViewAuditLog', why: 'perm.why.auditLog' },
          { perm: 'ManageRoles', why: 'perm.why.revertRoles' },
          { perm: 'ManageChannels', why: 'perm.why.lockChannels' },
        ]}
      />

      <Card title={t('sec.staffTitle')}>
        <p className="mb-3 text-sm text-white/70">{t('sec.staffHint')}</p>
        <select
          value={draft.staffLogChannelId}
          onChange={(e) => setDraft({ ...draft, staffLogChannelId: e.target.value })}
          aria-label={t('sec.staffTitle')}
          className={`${field} bg-[#160d2a]`}
        >
          <option value="">{t('sec.none')}</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              #{c.name}
            </option>
          ))}
        </select>
      </Card>

      <Card title={t('sec.linkTitle')} icon={ShieldCheck}>
        <p className="mb-3 text-sm text-white/70">{t('sec.linkHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.linkOn')} checked={draft.linkShield.enabled} onChange={(v) => setLink({ enabled: v })} />
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.linkTitle')}>
            <Choice name="ls-action" value="delete" current={draft.linkShield.action} label={t('sec.actionDelete')} onChange={(v) => setLink({ action: v })} />
            <Choice name="ls-action" value="warn" current={draft.linkShield.action} label={t('sec.actionWarn')} onChange={(v) => setLink({ action: v })} />
          </div>
          <p className="text-xs text-white/50">{t('sec.linkPerm')}</p>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.allow')}</span>
            <textarea
              value={draft.allowText}
              rows={3}
              onChange={(e) => setDraft({ ...draft, allowText: e.target.value })}
              placeholder="exemplo.com.br"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-sm"
            />
            <span className="mt-1 block text-xs text-white/50">{t('sec.allowHint')}</span>
          </label>
        </div>
      </Card>

      <Card title={t('sec.guardTitle')} icon={ShieldHalf}>
        <p className="mb-3 text-sm text-white/70">{t('sec.guardHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.guardOn')} checked={draft.guard.enabled} onChange={(v) => setGuard({ enabled: v })} />
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.guardTitle')}>
            <Choice name="sg-mode" value="alert" current={draft.guard.mode} label={t('sec.modeAlert')} onChange={(v) => setGuard({ mode: v })} />
            <Choice name="sg-mode" value="auto" current={draft.guard.mode} label={t('sec.modeAuto')} onChange={(v) => setGuard({ mode: v })} />
          </div>
          <p className="text-xs text-white/50">{t('sec.modeAutoHint')}</p>
        </div>
      </Card>

      {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
      {status && status !== 'ok' && (
        <Notice tone="error">{t(`error.${status}`).startsWith('error.') ? t('error.generic', { error: status }) : t(`error.${status}`)}</Notice>
      )}
      <div className="dash-surface sticky bottom-3 z-10 rounded-2xl p-2">
        <Button onClick={save} disabled={busy} className="w-full">
          {t('features.save')}
        </Button>
      </div>

      <Card title={t('sec.eventsTitle')}>
        {events.length === 0 && <p className="text-sm text-white/60">{t('sec.noEvents')}</p>}
        <ul className="divide-y divide-white/5">
          {events.map((e, i) => (
            <li key={i} className="py-2 text-sm">
              <span className="font-mono text-xs text-white/50">{new Date(e.at).toLocaleString()}</span>
              <span className="block break-words">
                {eventText(t, e)} · <span className="text-pyxie-glow">{t(`sec.action.${e.action}`)}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
