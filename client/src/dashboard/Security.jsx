import React, { useEffect, useState } from 'react';
import { Feather, FileWarning, Link2Off, Ticket, ShieldCheck, ShieldHalf, KeyRound, Hash, Siren, AlertOctagon, UserCheck, Scale } from 'lucide-react';
import { api } from './api';
import BotPermissions from './Permissions';
import { Badge, Button, Card, Notice, Spinner, StatTile, Toggle } from './ui';

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
  if (e.type === 'file') return t('sec.event.file', { file: e.fileName, reason: t(`sec.fileReason.${e.reason}`) });
  if (e.type === 'invites') return t('sec.event.invites', { count: e.count });
  if (e.type === 'webhook') return t('sec.event.webhook', { id: e.webhookId });
  if (e.type === 'raid') return t('sec.event.raid', { joins: e.joins, young: e.young });
  if (e.type === 'antinuke') return t('sec.event.antinuke', { count: e.count || 0 });
  if (e.type === 'emergency') return t('sec.event.emergency', { count: e.lockedCount || e.restoredCount || 0 });
  if (e.type === 'verification') return t('sec.event.verification');
  if (e.type === 'role') return t('sec.event.role', { role: e.roleName, perms: (e.perms || []).map((p) => t(`sec.perm.${p}`)).join(', ') });
  return t('sec.event.channel', { channel: e.channelName });
}

// Faxina de convites: procura os parados, mostra e revoga os escolhidos.
function InviteCleanup({ t, guildId, cfg, onChange }) {
  const [list, setList] = useState(null);
  const [state, setState] = useState(null);
  const search = async () => {
    setState('loading');
    try {
      const d = await api.staleInvites(guildId, cfg.days);
      setList(d.invites);
      setState(null);
    } catch (e) {
      setState(e.code || 'generic');
    }
  };
  const revokeAll = async () => {
    if (!window.confirm(t('sec.invConfirm', { count: list.length }))) return;
    try {
      const d = await api.revokeInvites(guildId, list.map((i) => i.code), cfg.days);
      setState({ ok: d.revoked });
      setList([]);
    } catch (e) {
      setState(e.code || 'generic');
    }
  };
  return (
    <Card title={t('sec.invTitle')} icon={Ticket}>
      <p className="mb-3 text-sm text-white/70">{t('sec.invHint')}</p>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.invDays')}</span>
          <input type="number" min="3" max="90" value={cfg.days} onChange={(e) => onChange({ days: e.target.value })} className={field} />
        </label>
        <Toggle label={t('sec.invAuto')} checked={cfg.autoClean} onChange={(v) => onChange({ autoClean: v })} />
        <Button variant="ghost" className="w-full" onClick={search} disabled={state === 'loading'}>
          {t('sec.invSearch')}
        </Button>
        {state && typeof state === 'string' && state !== 'loading' && (
          <Notice tone="error">{state === 'missing_manage_guild' ? t('sec.invNoPerm') : t('error.generic', { error: state })}</Notice>
        )}
        {state?.ok !== undefined && <Notice tone="ok">{t('sec.invDone', { count: state.ok })}</Notice>}
        {list && list.length === 0 && state === null && <p className="text-sm text-white/60">{t('sec.invNone')}</p>}
        {list && list.length > 0 && (
          <>
            <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto text-sm">
              {list.map((i) => (
                <li key={i.code} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="font-mono">{i.code}</span>
                  <span className="truncate text-xs text-white/50">
                    {i.inviter || '—'} · #{i.channel || '—'} · {new Date(i.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={revokeAll}>
              {t('sec.invRevoke', { count: list.length })}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

// Modo de emergência global (Qualquer servidor): tranca canais salvando o estado anterior para destrancar com segurança.
function EmergencyBanner({ t, guildId, status, onChanged }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const toggle = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await api.toggleEmergency(guildId, { active: !status?.active, reason });
      onChanged(res.status || { active: res.active, lockedCount: res.lockedCount || 0 });
    } catch (e) {
      setErr(e.code || 'generic');
    }
    setBusy(false);
  };

  return (
    <Card title={t('sec.emgTitle')} icon={AlertOctagon}>
      <p className="mb-3 text-sm text-white/70">{t('sec.emgHint')}</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={status?.active ? 'red' : 'green'}>
            {status?.active ? t('sec.emgActive', { count: status.lockedCount || 0 }) : t('sec.emgInactive')}
          </Badge>
        </div>
        {!status?.active && (
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('sec.emgReason')}
            aria-label={t('sec.emgReason')}
            className={field}
          />
        )}
        {err && <Notice tone="error">{t('error.generic', { error: err })}</Notice>}
        <Button onClick={toggle} disabled={busy} className="w-full">
          {status?.active ? t('sec.emgTurnOff') : t('sec.emgTurnOn')}
        </Button>
      </div>
    </Card>
  );
}

// Advertências por pontos + Casos de Moderação numerados (#1, #2...).
function WarningsAndCases({ t, guildId, initialCfg, initialCases, channels }) {
  const [cfg, setCfg] = useState(initialCfg || { enabled: true, defaultExpireDays: 30, logChannelId: '', dmOnWarn: true, thresholds: [] });
  const [cases, setCases] = useState(initialCases || []);
  const [editId, setEditId] = useState(null);
  const [editReason, setEditReason] = useState('');
  const [status, setStatus] = useState(null);

  const saveCfg = async () => {
    setStatus(null);
    try {
      const res = await api.saveWarningsConfig(guildId, cfg);
      setCfg(res.config);
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };

  const saveReason = async (caseNumber) => {
    try {
      const res = await api.updateModCase(guildId, caseNumber, { reason: editReason });
      setCases(cases.map((c) => (c.caseNumber === caseNumber ? res.caseRecord : c)));
      setEditId(null);
    } catch (_) {}
  };

  const revokeCase = async (caseNumber) => {
    try {
      const res = await api.updateModCase(guildId, caseNumber, { revoke: true });
      setCases(cases.map((c) => (c.caseNumber === caseNumber ? res.caseRecord : c)));
    } catch (_) {}
  };

  return (
    <Card title={t('sec.warnTitle')} icon={Scale}>
      <p className="mb-3 text-sm text-white/70">{t('sec.warnHint')}</p>
      <div className="space-y-3">
        <Toggle label={t('sec.warnOn')} checked={cfg.enabled !== false} onChange={(v) => setCfg({ ...cfg, enabled: v })} />
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.warnExpireDays')}</span>
            <input
              type="number"
              min="1"
              max="365"
              value={cfg.defaultExpireDays || 30}
              onChange={(e) => setCfg({ ...cfg, defaultExpireDays: Number(e.target.value) })}
              className={field}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.warnLogChannel')}</span>
            <select
              value={cfg.logChannelId || ''}
              onChange={(e) => setCfg({ ...cfg, logChannelId: e.target.value || null })}
              className={`${field} bg-[#160d2a]`}
            >
              <option value="">—</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button variant="ghost" onClick={saveCfg} className="w-full">
          {t('sec.warnSave')}
        </Button>
        {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}

        <div className="border-t border-white/10 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase text-white/60">{t('sec.casesTitle')}</p>
          {cases.length === 0 && <p className="text-sm text-white/50">{t('sec.casesEmpty')}</p>}
          <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto text-sm">
            {cases.map((c) => (
              <li key={c.caseNumber} className="space-y-1 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <code className="font-bold text-pyxie-glow">#{c.caseNumber}</code> · <Badge>{c.action}</Badge> · <code className="text-xs">{c.targetId}</code>
                    {c.points > 0 && <span className="ml-1 text-xs text-white/60">({c.points} pts)</span>}
                    {!c.active && <Badge tone="muted">{t('sec.caseRevoked')}</Badge>}
                  </span>
                  <span className="flex gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditId(c.caseNumber);
                        setEditReason(c.reason || '');
                      }}
                    >
                      ✏️
                    </Button>
                    {c.active && (
                      <Button variant="ghost" onClick={() => revokeCase(c.caseNumber)}>
                        {t('sec.caseRevokeBtn')}
                      </Button>
                    )}
                  </span>
                </div>
                {editId === c.caseNumber ? (
                  <div className="flex gap-2">
                    <input value={editReason} onChange={(e) => setEditReason(e.target.value)} className={field} />
                    <Button onClick={() => saveReason(c.caseNumber)}>{t('features.save')}</Button>
                  </div>
                ) : (
                  <p className="text-xs text-white/70">{c.reason || '—'}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

// Segurança (todos os servidores): escudo de links, guardião, antinuke, emergência, verificação e casos.
export default function Security({ t, guildId }) {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [verStatus, setVerStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .security(guildId)
      .then((d) => {
        setData(d);
        setDraft({
          ...d.security,
          allowText: (d.security.linkShield?.allowDomains || []).join('\n'),
          trustedText: (d.security.antiNuke?.trustedIds || []).join('\n'),
        });
      })
      .catch((e) => setError(e.code || 'generic'));
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles || [])).catch(() => {});
  }, [guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data || !draft) return <Spinner label={t('app.loading')} />;

  const setLink = (patch) => setDraft({ ...draft, linkShield: { ...draft.linkShield, ...patch } });
  const setFiles = (patch) => setDraft({ ...draft, fileShield: { ...draft.fileShield, ...patch } });
  const setAppeals = (patch) => setDraft({ ...draft, appeals: { ...draft.appeals, ...patch } });
  const setRaid = (patch) => setDraft({ ...draft, antiRaid: { ...draft.antiRaid, ...patch } });
  const setGuard = (patch) => setDraft({ ...draft, guard: { ...draft.guard, ...patch } });
  const setNuke = (patch) => setDraft({ ...draft, antiNuke: { ...(draft.antiNuke || {}), ...patch } });
  const setVer = (patch) => setDraft({ ...draft, verification: { ...(draft.verification || {}), ...patch } });

  const save = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await api.saveSecurity(guildId, {
        staffLogChannelId: draft.staffLogChannelId,
        linkShield: { ...draft.linkShield, allowDomains: draft.allowText.split(/[\s,]+/).filter(Boolean) },
        guard: draft.guard,
        antiNuke: { ...(draft.antiNuke || {}), trustedIds: (draft.trustedText || '').split(/[\s,]+/).filter(Boolean) },
        verification: draft.verification,
        antiRaid: draft.antiRaid,
        appeals: draft.appeals,
        fileShield: draft.fileShield,
        invites: draft.invites,
      });
      setDraft({
        ...res.security,
        allowText: (res.security.linkShield?.allowDomains || []).join('\n'),
        trustedText: (res.security.antiNuke?.trustedIds || []).join('\n'),
      });
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
    setBusy(false);
  };

  const publishVerification = async () => {
    setVerStatus(null);
    try {
      await api.publishVerification(guildId);
      setVerStatus('ok');
    } catch (e) {
      setVerStatus(e.code || 'generic');
    }
  };

  const { counters, events } = data;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={Link2Off} label={t('sec.statLinks')} value={counters.link} />
        <StatTile icon={KeyRound} accent="violet" label={t('sec.statRoles')} value={counters.role} />
        <StatTile icon={Hash} accent="cyan" label={t('sec.statChannels')} value={counters.channel} />
        <StatTile icon={Siren} accent="green" label={t('sec.statRaids')} value={counters.raid || 0} />
      </div>

      <BotPermissions
        t={t}
        guildId={guildId}
        needs={[
          { perm: 'ManageMessages', why: 'perm.why.deleteLinks' },
          { perm: 'ViewAuditLog', why: 'perm.why.auditLog' },
          { perm: 'ManageRoles', why: 'perm.why.revertRoles' },
          { perm: 'ManageChannels', why: 'perm.why.lockChannels' },
          { perm: 'ManageGuild', why: 'perm.why.raidPause' },
          { perm: 'BanMembers', why: 'perm.why.appeals' },
          { perm: 'ManageWebhooks', why: 'perm.why.webhooks' },
        ]}
      />

      <EmergencyBanner
        t={t}
        guildId={guildId}
        status={data.emergencyStatus}
        onChanged={(nextStatus) => setData({ ...data, emergencyStatus: nextStatus })}
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

      <Card title={t('sec.fileTitle')} icon={FileWarning}>
        <p className="mb-3 text-sm text-white/70">{t('sec.fileHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.fileOn')} checked={draft.fileShield.enabled} onChange={(v) => setFiles({ enabled: v })} />
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.fileTitle')}>
            <Choice name="fs-action" value="delete" current={draft.fileShield.action} label={t('sec.actionDelete')} onChange={(v) => setFiles({ action: v })} />
            <Choice name="fs-action" value="warn" current={draft.fileShield.action} label={t('sec.actionWarn')} onChange={(v) => setFiles({ action: v })} />
          </div>
          <Toggle label={t('sec.fileExec')} checked={draft.fileShield.blockExecutables} onChange={(v) => setFiles({ blockExecutables: v })} />
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

          <div className="border-t border-white/10 pt-3 space-y-3">
            <p className="font-semibold text-sm">{t('sec.nukeTitle')}</p>
            <p className="text-xs text-white/60">{t('sec.nukeHint')}</p>
            <Toggle label={t('sec.nukeOn')} checked={draft.antiNuke?.enabled !== false} onChange={(v) => setNuke({ enabled: v })} />
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.nukeMax')}</span>
                <input type="number" min="2" max="30" value={draft.antiNuke?.maxActions || 5} onChange={(e) => setNuke({ maxActions: Number(e.target.value) })} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.nukeWindow')}</span>
                <input type="number" min="10" max="300" value={draft.antiNuke?.windowSeconds || 30} onChange={(e) => setNuke({ windowSeconds: Number(e.target.value) })} className={field} />
              </label>
            </div>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.nukeTitle')}>
              <Choice name="an-mode" value="alert" current={draft.antiNuke?.mode || 'alert'} label={t('sec.nukeModeAlert')} onChange={(v) => setNuke({ mode: v })} />
              <Choice name="an-mode" value="auto" current={draft.antiNuke?.mode || 'alert'} label={t('sec.nukeModeAuto')} onChange={(v) => setNuke({ mode: v })} />
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.nukeTrusted')}</span>
              <textarea
                value={draft.trustedText || ''}
                rows={2}
                onChange={(e) => setDraft({ ...draft, trustedText: e.target.value })}
                placeholder="ID"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-sm"
              />
            </label>
          </div>
        </div>
      </Card>

      <Card title={t('sec.verTitle')} icon={UserCheck}>
        <p className="mb-3 text-sm text-white/70">{t('sec.verHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.verOn')} checked={Boolean(draft.verification?.enabled)} onChange={(v) => setVer({ enabled: v })} />
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.verChannel')}</span>
              <select value={draft.verification?.channelId || ''} onChange={(e) => setVer({ channelId: e.target.value })} className={`${field} bg-[#160d2a]`}>
                <option value="">—</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.verRole')}</span>
              <select value={draft.verification?.verifiedRoleId || ''} onChange={(e) => setVer({ verifiedRoleId: e.target.value })} className={`${field} bg-[#160d2a]`}>
                <option value="">—</option>
                {roles.filter((r) => r.assignable !== false).map((r) => (
                  <option key={r.id} value={r.id}>
                    @{r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.verUnverifiedRole')}</span>
              <select value={draft.verification?.unverifiedRoleId || ''} onChange={(e) => setVer({ unverifiedRoleId: e.target.value })} className={`${field} bg-[#160d2a]`}>
                <option value="">—</option>
                {roles.filter((r) => r.assignable !== false).map((r) => (
                  <option key={r.id} value={r.id}>
                    @{r.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Button variant="ghost" onClick={publishVerification} disabled={!draft.verification?.channelId || !draft.verification?.verifiedRoleId} className="w-full">
            {t('sec.verPublish')}
          </Button>
          {verStatus === 'ok' && <Notice tone="ok">{t('sec.verPublished')}</Notice>}
          {verStatus && verStatus !== 'ok' && <Notice tone="error">{t('error.generic', { error: verStatus })}</Notice>}
        </div>
      </Card>

      <Card title={t('sec.raidTitle')} icon={Siren}>
        <p className="mb-3 text-sm text-white/70">{t('sec.raidHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.raidOn')} checked={draft.antiRaid.enabled} onChange={(v) => setRaid({ enabled: v })} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidJoins')}</span>
              <input type="number" min="3" max="100" value={draft.antiRaid.joins} onChange={(e) => setRaid({ joins: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidSeconds')}</span>
              <input type="number" min="10" max="120" value={draft.antiRaid.seconds} onChange={(e) => setRaid({ seconds: e.target.value })} className={field} />
            </label>
            <label className="col-span-2 block sm:col-span-1">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidPause')}</span>
              <select value={draft.antiRaid.pauseMinutes} onChange={(e) => setRaid({ pauseMinutes: Number(e.target.value) })} className={`${field} bg-[#160d2a]`}>
                {[30, 60, 120, 360, 1440].map((m) => (
                  <option key={m} value={m}>
                    {m < 60 ? t('sec.minutes', { count: m }) : t('sec.hours', { count: m / 60 })}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-white/50">{t('sec.raidYoung')}</p>
        </div>
      </Card>

      <WarningsAndCases
        t={t}
        guildId={guildId}
        initialCfg={data.warningsConfig}
        initialCases={data.cases}
        channels={channels}
      />

      <InviteCleanup t={t} guildId={guildId} cfg={draft.invites} onChange={(patch) => setDraft({ ...draft, invites: { ...draft.invites, ...patch } })} />

      <Card title={t('sec.appealsTitle')} icon={Feather}>
        <p className="mb-3 text-sm text-white/70">{t('sec.appealsHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.appealsOn')} checked={draft.appeals.enabled} onChange={(v) => setAppeals({ enabled: v })} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.appealsChannel')}</span>
            <select value={draft.appeals.channelId} onChange={(e) => setAppeals({ channelId: e.target.value })} className={`${field} bg-[#160d2a]`}>
              <option value="">—</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-white/50">{t('sec.appealsLink')}</p>
          <code className="block break-all rounded-xl bg-white/5 p-2 text-xs">{`${window.location.origin}/dashboard#/appeal`}</code>
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
