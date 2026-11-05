import React, { useEffect, useState } from 'react';
import { Feather, FileWarning, Link2Off, Ticket, ShieldCheck, ShieldHalf, KeyRound, Hash, Siren, AlertOctagon, UserCheck, Scale, Pencil, Trash2 } from 'lucide-react';
import { api } from './api';
import BotPermissions from './Permissions';
import { Badge, Button, Card, MemberChip, MultiSelect, Notice, Spinner, StatTile, Toggle, useMemberLookup } from './ui';
import { errorText } from './i18n';

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
          <Notice tone="error">{state === 'missing_manage_guild' ? t('sec.invNoPerm') : errorText(t, state)}</Notice>
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
        {err && <Notice tone="error">{errorText(t, err)}</Notice>}
        <Button onClick={toggle} disabled={busy} className="w-full">
          {status?.active ? t('sec.emgTurnOff') : t('sec.emgTurnOn')}
        </Button>
      </div>
    </Card>
  );
}

// Advertências por pontos + Casos de Moderação numerados (#1, #2...).
const THRESHOLD_ACTIONS = ['timeout', 'kick', 'ban', 'none'];

// Confere os limites antes de salvar com as mesmas regras do servidor (modCasesService.validateThresholds).
function thresholdProblem(list) {
  if (list.length > 10) return 'too_many_thresholds';
  const seen = new Set();
  for (const th of list) {
    const points = Number(th.points);
    if (!Number.isInteger(points) || points < 1 || points > 100) return 'invalid_threshold_points';
    if (seen.has(points)) return 'duplicate_threshold_points';
    seen.add(points);
    if (th.action === 'timeout') {
      const minutes = Number(th.durationMinutes);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 40320) return 'invalid_threshold_duration';
    }
  }
  return null;
}

function WarningsAndCases({ t, guildId, initialCfg, initialCases, channels }) {
  const [cfg, setCfg] = useState(initialCfg || { enabled: true, defaultExpireDays: 30, logChannelId: '', dmOnWarn: true, thresholds: [] });
  const [cases, setCases] = useState(initialCases || []);
  const [editId, setEditId] = useState(null);
  const [editReason, setEditReason] = useState('');
  const [status, setStatus] = useState(null);
  const [caseErr, setCaseErr] = useState(null);
  const [filter, setFilter] = useState('');
  const thresholds = Array.isArray(cfg.thresholds) ? cfg.thresholds : [];
  const people = useMemberLookup(guildId, cases.flatMap((c) => [c.targetId, c.moderatorId]));

  const setThreshold = (i, patch) => setCfg({ ...cfg, thresholds: thresholds.map((th, j) => (j === i ? { ...th, ...patch } : th)) });
  const expireOk = Number.isInteger(Number(cfg.defaultExpireDays)) && Number(cfg.defaultExpireDays) >= 1 && Number(cfg.defaultExpireDays) <= 365;
  const problem = !expireOk ? 'invalid_expire_days' : thresholdProblem(thresholds);

  const saveCfg = async () => {
    setStatus(null);
    if (problem) {
      setStatus(problem);
      return;
    }
    const banTh = thresholds.find((th) => th.action === 'ban');
    // Banimento automático é grave: confirma antes de gravar (Q148).
    // eslint-disable-next-line no-alert
    if (banTh && cfg.enabled !== false && !window.confirm(t('sec.warnBanConfirm', { points: banTh.points }))) return;
    try {
      const res = await api.saveWarningsConfig(guildId, {
        ...cfg,
        defaultExpireDays: Number(cfg.defaultExpireDays),
        thresholds: thresholds.map((th) => ({ points: Number(th.points), action: th.action, durationMinutes: th.action === 'timeout' ? Number(th.durationMinutes) : 0 })),
      });
      setCfg(res.config);
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };

  const saveReason = async (caseNumber) => {
    setCaseErr(null);
    try {
      const res = await api.updateModCase(guildId, caseNumber, { reason: editReason });
      setCases(cases.map((c) => (c.caseNumber === caseNumber ? res.caseRecord : c)));
      setEditId(null);
    } catch (e) {
      setCaseErr({ caseNumber, code: e.code || 'generic' });
    }
  };

  const revokeCase = async (c) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('sec.caseRevokeConfirm', { n: c.caseNumber, who: people.get(c.targetId)?.name || c.targetId }))) return;
    setCaseErr(null);
    try {
      const res = await api.updateModCase(guildId, c.caseNumber, { revoke: true });
      setCases(cases.map((x) => (x.caseNumber === c.caseNumber ? res.caseRecord : x)));
    } catch (e) {
      setCaseErr({ caseNumber: c.caseNumber, code: e.code || 'generic' });
    }
  };

  const q = filter.trim().toLowerCase();
  const shown = q
    ? cases.filter((c) => {
        const target = people.get(c.targetId);
        return c.targetId.includes(q) || `${target?.name || ''} ${target?.username || ''}`.toLowerCase().includes(q);
      })
    : cases;
  const actionLabel = (a) => {
    const key = `sec.caseAction.${a}`;
    const txt = t(key);
    return txt === key ? a : txt;
  };

  return (
    <Card title={t('sec.warnTitle')} icon={Scale}>
      <p className="mb-3 text-sm text-white/70">{t('sec.warnHint')}</p>
      <div className="space-y-3">
        <Toggle label={t('sec.warnOn')} checked={cfg.enabled !== false} onChange={(v) => setCfg({ ...cfg, enabled: v })} />
        <Toggle label={t('sec.warnDm')} checked={cfg.dmOnWarn !== false} onChange={(v) => setCfg({ ...cfg, dmOnWarn: v })} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.warnExpireDays')}</span>
            <input
              type="number"
              min="1"
              max="365"
              value={cfg.defaultExpireDays ?? ''}
              onChange={(e) => setCfg({ ...cfg, defaultExpireDays: e.target.value === '' ? '' : Number(e.target.value) })}
              aria-invalid={!expireOk}
              className={`${field} ${expireOk ? '' : 'border-red-400'}`}
            />
            {!expireOk && <span className="mt-1 block text-xs text-red-300">{t('error.invalid_expire_days')}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.warnLogChannel')}</span>
            <select
              value={cfg.logChannelId || ''}
              onChange={(e) => setCfg({ ...cfg, logChannelId: e.target.value || null })}
              className={`${field} bg-[#160d2a]`}
            >
              <option value="">{t('sec.warnLogNone')}</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-white/50">{t('sec.warnLogHint')}</span>
          </label>
        </div>

        <fieldset className="space-y-2 rounded-xl border border-white/10 p-3">
          <legend className="px-1 text-xs font-semibold uppercase text-white/60">{t('sec.thTitle')}</legend>
          <p className="text-xs text-white/60">{t('sec.thHint')}</p>
          {thresholds.length === 0 && <p className="text-sm text-white/50">{t('sec.thEmpty')}</p>}
          {thresholds.map((th, i) => (
            <div key={i} className={`flex flex-wrap items-end gap-2 rounded-lg p-2 ${th.action === 'ban' ? 'border border-red-400/50 bg-red-500/10' : 'bg-white/5'}`}>
              <label className="block w-24">
                <span className="mb-1 block text-xs text-white/60">{t('sec.thPoints')}</span>
                <input type="number" min="1" max="100" value={th.points ?? ''} onChange={(e) => setThreshold(i, { points: e.target.value === '' ? '' : Number(e.target.value) })} className={field} />
              </label>
              <label className="block min-w-0 flex-1 basis-36">
                <span className="mb-1 block text-xs text-white/60">{t('sec.thAction')}</span>
                <select value={th.action} onChange={(e) => setThreshold(i, { action: e.target.value, durationMinutes: e.target.value === 'timeout' ? th.durationMinutes || 60 : 0 })} className={`${field} bg-[#160d2a]`}>
                  {THRESHOLD_ACTIONS.map((a) => (
                    <option key={a} value={a}>
                      {t(`sec.thAction.${a}`)}
                    </option>
                  ))}
                </select>
              </label>
              {th.action === 'timeout' && (
                <label className="block w-28">
                  <span className="mb-1 block text-xs text-white/60">{t('sec.thMinutes')}</span>
                  <input type="number" min="1" max="40320" value={th.durationMinutes ?? ''} onChange={(e) => setThreshold(i, { durationMinutes: e.target.value === '' ? '' : Number(e.target.value) })} className={field} />
                </label>
              )}
              <Button variant="ghost" aria-label={t('sec.thRemove', { points: th.points || '?' })} onClick={() => setCfg({ ...cfg, thresholds: thresholds.filter((_, j) => j !== i) })}>
                <Trash2 size={16} aria-hidden="true" />
              </Button>
              {th.action === 'ban' && <p className="w-full text-xs font-semibold text-red-300">{t('sec.thBanWarn', { points: th.points || '?' })}</p>}
            </div>
          ))}
          {thresholds.length < 10 && (
            <Button
              variant="ghost"
              onClick={() => {
                const top = thresholds.reduce((m, th) => Math.max(m, Number(th.points) || 0), 0);
                setCfg({ ...cfg, thresholds: [...thresholds, { points: Math.min(100, top + 1 || 1), action: 'timeout', durationMinutes: 60 }] });
              }}
            >
              {t('sec.thAdd')}
            </Button>
          )}
        </fieldset>

        {problem && status !== 'ok' && <Notice tone="warn">{t(`error.${problem}`)}</Notice>}
        <Button onClick={saveCfg} disabled={Boolean(problem)} className="w-full">
          {t('sec.warnSave')}
        </Button>
        {status === 'ok' && <Notice tone="ok">{t('sec.warnSaved')}</Notice>}
        {status && status !== 'ok' && <Notice tone="error">{errorText(t, status)}</Notice>}

        <div className="border-t border-white/10 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase text-white/60">{t('sec.casesTitle')}</p>
          {cases.length > 0 && (
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('sec.caseFilter')}
              aria-label={t('sec.caseFilter')}
              className={`${field} mb-2`}
            />
          )}
          {cases.length === 0 && <p className="text-sm text-white/50">{t('sec.casesEmpty')}</p>}
          {cases.length > 0 && shown.length === 0 && <p className="text-sm text-white/50">{t('sec.caseFilterEmpty')}</p>}
          <ul className="max-h-96 divide-y divide-white/5 overflow-y-auto text-sm">
            {shown.map((c) => (
              <li key={c.caseNumber} className="min-w-0 space-y-1 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <code className="font-bold text-pyxie-glow">#{c.caseNumber}</code>
                    <Badge>{actionLabel(c.action)}</Badge>
                    <MemberChip id={c.targetId} info={people.get(c.targetId)} t={t} />
                    {c.points > 0 && <span className="text-xs text-white/60">{t('sec.casePoints', { points: c.points })}</span>}
                    {!c.active && <Badge tone="muted">{t('sec.caseRevoked')}</Badge>}
                  </span>
                  <span className="flex gap-1">
                    <Button
                      variant="ghost"
                      aria-label={t('sec.caseEditReason', { n: c.caseNumber })}
                      title={t('sec.caseEditReason', { n: c.caseNumber })}
                      onClick={() => {
                        setEditId(c.caseNumber);
                        setEditReason(c.reason || '');
                      }}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </Button>
                    {c.active && (
                      <Button variant="ghost" aria-label={t('sec.caseRevokeAria', { n: c.caseNumber })} onClick={() => revokeCase(c)}>
                        {t('sec.caseRevokeBtn')}
                      </Button>
                    )}
                  </span>
                </div>
                <p className="flex flex-wrap items-center gap-1 text-xs text-white/50">
                  {c.createdAt ? <time dateTime={new Date(c.createdAt).toISOString()}>{new Date(c.createdAt).toLocaleString()}</time> : null}
                  {c.moderatorId && (
                    <>
                      <span aria-hidden="true">·</span>
                      {t('sec.caseBy')} <MemberChip id={c.moderatorId} info={people.get(c.moderatorId)} />
                    </>
                  )}
                </p>
                {editId === c.caseNumber ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      aria-label={t('sec.caseReasonField', { n: c.caseNumber })}
                      maxLength={500}
                      className={`${field} min-w-0 flex-1 basis-48`}
                    />
                    <Button onClick={() => saveReason(c.caseNumber)}>{t('features.save')}</Button>
                    <Button variant="ghost" onClick={() => setEditId(null)}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                ) : (
                  <p className="break-words text-xs text-white/70">{c.reason || '—'}</p>
                )}
                {caseErr?.caseNumber === c.caseNumber && <Notice tone="error">{errorText(t, caseErr.code)}</Notice>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

// Lista branca do antinuke (Q141): cargos pelo seletor e pessoas por ID com nome e avatar à
// vista. ID com formato errado é recusado na hora, com o motivo, em vez de sumir ao salvar.
const ID_RE = /^\d{17,20}$/;
function TrustedList({ t, guildId, roles, ids, onChange }) {
  const [input, setInput] = useState('');
  const [err, setErr] = useState(null);
  const roleIds = new Set(roles.map((r) => r.id));
  const roleOpts = roles.filter((r) => !r.managed).map((r) => ({ id: r.id, label: `@${r.name}` }));
  const people = ids.filter((id) => !roleIds.has(id));
  const names = useMemberLookup(guildId, people);
  const add = () => {
    const id = input.trim().replace(/[<@!>]/g, '');
    if (!ID_RE.test(id)) return setErr('sec.trustedBadId');
    if (ids.includes(id)) return setErr('sec.trustedDup');
    if (ids.length >= 50) return setErr('sec.trustedMax');
    setErr(null);
    setInput('');
    onChange([...ids, id]);
    return null;
  };
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-white/70">{t('sec.nukeTrusted')}</p>
      <p className="text-xs text-white/50">{t('sec.trustedRoles')}</p>
      <MultiSelect
        options={roleOpts}
        value={ids.filter((id) => roleIds.has(id))}
        emptyLabel={t('roles.emptyList')}
        onChange={(v) => onChange([...ids.filter((id) => !roleIds.has(id)), ...v])}
      />
      <p className="text-xs text-white/50">{t('sec.trustedPeople')}</p>
      {people.length > 0 && (
        <ul className="space-y-1">
          {people.map((id) => (
            <li key={id} className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1 text-sm">
              <MemberChip id={id} info={names.get(id)} t={t} />
              <Button variant="ghost" aria-label={t('sec.trustedRemove', { who: names.get(id)?.name || id })} onClick={() => onChange(ids.filter((x) => x !== id))}>
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setErr(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          inputMode="numeric"
          placeholder={t('sec.trustedPlaceholder')}
          aria-label={t('sec.trustedPlaceholder')}
          aria-invalid={Boolean(err)}
          className={`${field} min-w-0 flex-1 basis-48 font-mono`}
        />
        <Button variant="ghost" onClick={add} disabled={!input.trim()}>
          {t('sec.trustedAdd')}
        </Button>
      </div>
      {err && <p className="text-xs text-red-300">{t(err)}</p>}
      <p className="text-xs text-white/40">{t('access.howToCopyId')}</p>
    </div>
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
        });
      })
      .catch((e) => setError(e.code || 'generic'));
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles || [])).catch(() => {});
  }, [guildId]);

  if (error) return <Notice tone="error">{errorText(t, error)}</Notice>;
  if (!data || !draft) return <Spinner label={t('app.loading')} />;

  const setLink = (patch) => setDraft({ ...draft, linkShield: { ...draft.linkShield, ...patch } });
  const setFiles = (patch) => setDraft({ ...draft, fileShield: { ...draft.fileShield, ...patch } });
  const setAppeals = (patch) => setDraft({ ...draft, appeals: { ...draft.appeals, ...patch } });
  const setRaid = (patch) => setDraft({ ...draft, antiRaid: { ...draft.antiRaid, ...patch } });
  const setGuard = (patch) => setDraft({ ...draft, guard: { ...draft.guard, ...patch } });
  const setNuke = (patch) => setDraft({ ...draft, antiNuke: { ...(draft.antiNuke || {}), ...patch } });
  const setVer = (patch) => setDraft({ ...draft, verification: { ...(draft.verification || {}), ...patch } });

  const channelOpts = channels.map((c) => ({ id: c.id, label: `#${c.name}` }));
  const roleOpts = roles.filter((r) => !r.managed).map((r) => ({ id: r.id, label: `@${r.name}` }));

  const save = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await api.saveSecurity(guildId, {
        staffLogChannelId: draft.staffLogChannelId,
        linkShield: { ...draft.linkShield, allowDomains: draft.allowText.split(/[\s,]+/).filter(Boolean) },
        guard: draft.guard,
        antiNuke: { ...(draft.antiNuke || {}), trustedIds: draft.antiNuke?.trustedIds || [] },
        verification: draft.verification,
        antiRaid: draft.antiRaid,
        appeals: draft.appeals,
        fileShield: draft.fileShield,
        invites: draft.invites,
      });
      setDraft({
        ...res.security,
        allowText: (res.security.linkShield?.allowDomains || []).join('\n'),
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.linkTitle')}>
            <Choice name="ls-action" value="delete" current={draft.linkShield.action} label={t('sec.actionDelete')} onChange={(v) => setLink({ action: v })} />
            <Choice name="ls-action" value="warn" current={draft.linkShield.action} label={t('sec.actionWarn')} onChange={(v) => setLink({ action: v })} />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.linkTimeout')}</span>
            <input
              type="number"
              min="0"
              max="1440"
              value={draft.linkShield.timeoutMinutes ?? 0}
              onChange={(e) => setLink({ timeoutMinutes: Number(e.target.value) })}
              className={field}
            />
          </label>
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.exemptRoles')}</span>
              <MultiSelect options={roleOpts} value={draft.linkShield.exemptRoleIds || []} emptyLabel={t('auto.none')} onChange={(v) => setLink({ exemptRoleIds: v })} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.exemptChannels')}</span>
              <MultiSelect options={channelOpts} value={draft.linkShield.exemptChannelIds || []} emptyLabel={t('auto.none')} onChange={(v) => setLink({ exemptChannelIds: v })} />
            </div>
          </div>
        </div>
      </Card>

      <Card title={t('sec.fileTitle')} icon={FileWarning}>
        <p className="mb-3 text-sm text-white/70">{t('sec.fileHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.fileOn')} checked={draft.fileShield.enabled} onChange={(v) => setFiles({ enabled: v })} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.fileTitle')}>
            <Choice name="fs-action" value="delete" current={draft.fileShield.action} label={t('sec.actionDelete')} onChange={(v) => setFiles({ action: v })} />
            <Choice name="fs-action" value="warn" current={draft.fileShield.action} label={t('sec.actionWarn')} onChange={(v) => setFiles({ action: v })} />
          </div>
          <Toggle label={t('sec.fileExec')} checked={draft.fileShield.blockExecutables} onChange={(v) => setFiles({ blockExecutables: v })} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.exemptRoles')}</span>
              <MultiSelect options={roleOpts} value={draft.fileShield.exemptRoleIds || []} emptyLabel={t('auto.none')} onChange={(v) => setFiles({ exemptRoleIds: v })} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.exemptChannels')}</span>
              <MultiSelect options={channelOpts} value={draft.fileShield.exemptChannelIds || []} emptyLabel={t('auto.none')} onChange={(v) => setFiles({ exemptChannelIds: v })} />
            </div>
          </div>
        </div>
      </Card>

      <Card title={t('sec.guardTitle')} icon={ShieldHalf}>
        <p className="mb-3 text-sm text-white/70">{t('sec.guardHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.guardOn')} checked={draft.guard.enabled} onChange={(v) => setGuard({ enabled: v })} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.guardTitle')}>
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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('sec.nukeTitle')}>
              <Choice name="an-mode" value="alert" current={draft.antiNuke?.mode || 'alert'} label={t('sec.nukeModeAlert')} onChange={(v) => setNuke({ mode: v })} />
              <Choice name="an-mode" value="auto" current={draft.antiNuke?.mode || 'alert'} label={t('sec.nukeModeAuto')} onChange={(v) => setNuke({ mode: v })} />
            </div>
            <TrustedList t={t} guildId={guildId} roles={roles} ids={draft.antiNuke?.trustedIds || []} onChange={(trustedIds) => setNuke({ trustedIds })} />
          </div>
        </div>
      </Card>

      <Card title={t('sec.verTitle')} icon={UserCheck}>
        <p className="mb-3 text-sm text-white/70">{t('sec.verHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.verOn')} checked={Boolean(draft.verification?.enabled)} onChange={(v) => setVer({ enabled: v })} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
          {verStatus && verStatus !== 'ok' && <Notice tone="error">{errorText(t, verStatus)}</Notice>}
        </div>
      </Card>

      <Card title={t('sec.raidTitle')} icon={Siren}>
        <p className="mb-3 text-sm text-white/70">{t('sec.raidHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('sec.raidOn')} checked={draft.antiRaid.enabled} onChange={(v) => setRaid({ enabled: v })} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidJoins')}</span>
              <input type="number" min="3" max="100" value={draft.antiRaid.joins} onChange={(e) => setRaid({ joins: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidSeconds')}</span>
              <input type="number" min="10" max="120" value={draft.antiRaid.seconds} onChange={(e) => setRaid({ seconds: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidPause')}</span>
              <select value={draft.antiRaid.pauseMinutes} onChange={(e) => setRaid({ pauseMinutes: Number(e.target.value) })} className={`${field} bg-[#160d2a]`}>
                {[30, 60, 120, 360, 1440].map((m) => (
                  <option key={m} value={m}>
                    {m < 60 ? t('sec.minutes', { count: m }) : t('sec.hours', { count: m / 60 })}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidMinAge')}</span>
              <input type="number" min="1" max="30" value={draft.antiRaid.minAccountAgeDays ?? 7} onChange={(e) => setRaid({ minAccountAgeDays: Number(e.target.value) })} className={field} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('sec.raidAction')}</span>
            <select value={draft.antiRaid.action || 'pause'} onChange={(e) => setRaid({ action: e.target.value })} className={`${field} bg-[#160d2a]`}>
              {['pause', 'kickYoung', 'alertOnly'].map((a) => (
                <option key={a} value={a}>
                  {t(`sec.raidAction.${a}`)}
                </option>
              ))}
            </select>
          </label>
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
        <Notice tone="error">{t(`error.${status}`).startsWith('error.') ? errorText(t, status) : t(`error.${status}`)}</Notice>
      )}
      <div className="dash-surface sticky bottom-3 z-10 rounded-2xl p-2">
        <Button onClick={save} disabled={busy} className="w-full">
          {t('sec.saveProtections')}
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
