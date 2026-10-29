import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { Badge, Button, Card, Notice, Spinner } from './ui';

const CRINGELANDIA = '1453890868980482090';
const MARY = '1557399041443111025';
const CATEGORY_ORDER = ['economia', 'tarot', 'social', 'utilidades'];
const STATUS_TONE = { on: 'green', module_off: 'muted', disabled: 'muted', classic: 'muted', route: 'violet', channel: 'violet' };
const field = 'dash-field min-h-[40px] rounded-xl px-3 text-sm';

function scopeLabel(t, scope) {
  if (!scope.length) return t('cmds.scope.all');
  return scope.map((id) => (id === CRINGELANDIA ? t('zone.cringelandia') : id === MARY ? t('zone.mary') : id)).join(', ');
}

function CommandDiagnosticBox({ t, guildId, commands, channelList }) {
  const [cmd, setCmd] = useState(commands[0]?.name || 'py-work');
  const [channelId, setChannelId] = useState('');
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);

  const runDiag = async () => {
    if (!cmd) return;
    setBusy(true);
    try {
      const q = `?asMember=1${channelId ? `&channelId=${encodeURIComponent(channelId)}` : ''}`;
      const res = await api.diagnoseCommand(guildId, cmd, q);
      setReport(res.report);
    } catch (_) {}
    setBusy(false);
  };

  return (
    <Card title={t('cmds.diag.title')}>
      <p className="mb-3 text-sm text-white/70">{t('cmds.diag.hint')}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <select value={cmd} onChange={(e) => setCmd(e.target.value)} aria-label={t('cmds.diag.cmd')} className={`${field} bg-[#160d2a]`}>
          {commands.map((c) => (
            <option key={c.name} value={c.name}>
              /{c.name}
            </option>
          ))}
        </select>
        <select value={channelId} onChange={(e) => setChannelId(e.target.value)} aria-label={t('cmds.diag.channel')} className={`${field} bg-[#160d2a]`}>
          <option value="">{t('cmds.diag.anyChannel')}</option>
          {channelList.map((c) => (
            <option key={c.id} value={c.id}>
              #{c.name}
            </option>
          ))}
        </select>
        <Button onClick={runDiag} disabled={busy}>
          {t('cmds.diag.run')}
        </Button>
      </div>
      {report && (
        <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <p className="font-semibold">
            {report.ok ? `✅ ${t('cmds.diag.ok')}` : `🚫 ${t('cmds.diag.blocked', { step: report.failedStep })}`}
          </p>
          <ul className="space-y-1 text-xs text-white/80">
            {(report.steps || []).map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <span>{s.ok ? '✅' : '❌'}</span>
                <span className="font-mono font-semibold">{s.id}</span>
                <span className="text-white/60">({s.code})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function CommandPermissionsBox({ t, guildId, commands, channelList, roles }) {
  const [rules, setRules] = useState([]);
  const [cmdTarget, setCmdTarget] = useState('*');
  const [targetType, setTargetType] = useState('role');
  const [targetId, setTargetId] = useState('');
  const [action, setAction] = useState('deny');
  const [status, setStatus] = useState(null);
  const [syncMsg, setSyncMsg] = useState(null);

  useEffect(() => {
    api
      .commandPermissions(guildId)
      .then((d) => setRules(d.rules || []))
      .catch(() => {});
  }, [guildId]);

  const addRule = async () => {
    const cleanId = targetId.trim();
    if (!/^\d{17,20}$/.test(cleanId)) return;
    const next = [...rules.filter((r) => !(r.command === cmdTarget && r.targetType === targetType && r.targetId === cleanId)), { command: cmdTarget, targetType, targetId: cleanId, action }];
    try {
      const res = await api.saveCommandPermissions(guildId, next);
      setRules(res.rules || []);
      setTargetId('');
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };

  const removeRule = async (id) => {
    const next = rules.filter((r) => r.id !== id);
    try {
      const res = await api.saveCommandPermissions(guildId, next);
      setRules(res.rules || []);
    } catch (_) {}
  };

  const syncMenu = async () => {
    setSyncMsg(null);
    try {
      const res = await api.syncCommandMenu(guildId);
      setSyncMsg(t('cmds.perm.synced', { count: res.syncedCount || 0 }));
    } catch (e) {
      setSyncMsg(e.code === 'cooldown' ? t('cmds.perm.cooldown') : t('error.generic', { error: e.code || 'generic' }));
    }
  };

  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));
  const chanMap = Object.fromEntries(channelList.map((c) => [c.id, c.name]));

  return (
    <Card title={t('cmds.perm.title')}>
      <p className="mb-3 text-sm text-white/70">{t('cmds.perm.hint')}</p>
      <div className="grid gap-2 sm:grid-cols-5">
        <select value={cmdTarget} onChange={(e) => setCmdTarget(e.target.value)} aria-label={t('cmds.perm.cmd')} className={`${field} bg-[#160d2a]`}>
          <option value="*">{t('cmds.perm.allCmds')}</option>
          {CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={`cat:${cat}`}>
              {t(`cmds.cat.${cat}`)}
            </option>
          ))}
          {commands.map((c) => (
            <option key={c.name} value={c.name}>
              /{c.name}
            </option>
          ))}
        </select>
        <select
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value);
            setTargetId('');
          }}
          aria-label={t('cmds.perm.targetType')}
          className={`${field} bg-[#160d2a]`}
        >
          <option value="role">{t('cmds.perm.type.role')}</option>
          <option value="channel">{t('cmds.perm.type.channel')}</option>
          <option value="user">{t('cmds.perm.type.user')}</option>
        </select>
        {targetType === 'role' && (
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} aria-label={t('cmds.perm.target')} className={`${field} bg-[#160d2a]`}>
            <option value="">—</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                @{r.name}
              </option>
            ))}
          </select>
        )}
        {targetType === 'channel' && (
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} aria-label={t('cmds.perm.target')} className={`${field} bg-[#160d2a]`}>
            <option value="">—</option>
            {channelList.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
        )}
        {targetType === 'user' && (
          <input value={targetId} onChange={(e) => setTargetId(e.target.value.replace(/\D/g, ''))} placeholder="ID" aria-label="ID" className={field} />
        )}
        <select value={action} onChange={(e) => setAction(e.target.value)} aria-label={t('cmds.perm.action')} className={`${field} bg-[#160d2a]`}>
          <option value="allow">{t('cmds.perm.allow')}</option>
          <option value="deny">{t('cmds.perm.deny')}</option>
        </select>
        <Button onClick={addRule} disabled={!/^\d{17,20}$/.test(targetId)}>
          {t('cmds.perm.add')}
        </Button>
      </div>

      {rules.length > 0 && (
        <ul className="mt-3 divide-y divide-white/5 text-sm">
          {rules.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 py-2">
              <span>
                <code className="text-pyxie-glow">{r.command}</code> · {t(`cmds.perm.type.${r.targetType}`)}{' '}
                <code className="text-xs">
                  {r.targetType === 'role' ? `@${roleMap[r.targetId] || r.targetId}` : r.targetType === 'channel' ? `#${chanMap[r.targetId] || r.targetId}` : r.targetId}
                </code>{' '}
                → <Badge tone={r.action === 'allow' ? 'green' : 'red'}>{t(`cmds.perm.${r.action}`)}</Badge>
              </span>
              <Button variant="ghost" onClick={() => removeRule(r.id)}>
                ×
              </Button>
            </li>
          ))}
        </ul>
      )}
      {status === 'ok' && <div className="mt-2"><Notice tone="ok">{t('features.saved')}</Notice></div>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <p className="text-xs text-white/60">{t('cmds.perm.syncHint')}</p>
        <Button variant="ghost" onClick={syncMenu}>
          {t('cmds.perm.syncBtn')}
        </Button>
      </div>
      {syncMsg && <p className="mt-2 text-xs text-pyxie-glow">{syncMsg}</p>}
    </Card>
  );
}

// Lista de comandos: num servidor (o que vale ali e por quê) ou na área global (todos, com escopo).
export default function Commands({ t, lang, guildId = null }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState({});
  const [channelList, setChannelList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = guildId ? api.guildCommands(guildId) : api.allCommands();
    load.then((d) => setList(d.commands)).catch((e) => setError(e.code || 'generic'));
    if (guildId) {
      api
        .channels(guildId)
        .then((d) => {
          setChannels(Object.fromEntries(d.channels.map((c) => [c.id, c.name])));
          setChannelList(d.channels.filter((c) => [0, 5, 15].includes(c.type)));
        })
        .catch(() => {});
      api
        .roles(guildId)
        .then((d) => setRoles(d.roles || []))
        .catch(() => {});
    }
  }, [guildId]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\/|^py!/, '');
    const shown = (list || []).filter((c) => {
      if (filter === 'on' && (guildId ? c.status !== 'on' : !c.moduleEnabled)) return false;
      if (filter === 'off' && (guildId ? c.status === 'on' : c.moduleEnabled)) return false;
      if (!q) return true;
      return `${c.name} ${c.aliases.join(' ')} ${c.description.pt} ${c.description.en}`.toLowerCase().includes(q);
    });
    const byCat = new Map();
    for (const c of shown) {
      if (!byCat.has(c.category)) byCat.set(c.category, []);
      byCat.get(c.category).push(c);
    }
    const rank = (cat) => (CATEGORY_ORDER.includes(cat) ? CATEGORY_ORDER.indexOf(cat) : 99);
    return [...byCat.entries()].sort(([a], [b]) => rank(a) - rank(b));
  }, [list, query, filter, guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!list) return <Spinner label={t('app.loading')} />;

  const onCount = list.filter((c) => (guildId ? c.status === 'on' : c.moduleEnabled)).length;
  const fixLink = (c) => {
    if (!guildId) return c.moduleId ? `#/global/modules/${c.moduleId}` : null;
    if (c.status === 'disabled' || c.status === 'route' || c.status === 'channel') return `#/guild/${guildId}/features`;
    return null;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">{t(guildId ? 'cmds.hintGuild' : 'cmds.hintGlobal', { on: onCount, total: list.length })}</p>
      {guildId && (
        <div className="grid gap-4 xl:grid-cols-2">
          <CommandDiagnosticBox t={t} guildId={guildId} commands={list} channelList={channelList} />
          <CommandPermissionsBox t={t} guildId={guildId} commands={list} channelList={channelList} roles={roles} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('cmds.search')} aria-label={t('cmds.search')} className="dash-field min-h-[40px] min-w-0 flex-1 rounded-xl px-3 text-sm" />
        <div className="flex gap-1" role="radiogroup" aria-label={t('cmds.filter')}>
          {['all', 'on', 'off'].map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-[40px] rounded-xl px-3 text-sm font-semibold ${filter === f ? 'bg-gradient-to-r from-pyxie-bright to-mystic-violet' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {t(`cmds.filter.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="text-sm text-white/60">{t('cmds.none')}</p>}
      {groups.map(([cat, cmds]) => (
        <section key={cat}>
          <h2 className="mb-2 font-title text-lg font-bold">{t(`cmds.cat.${cat}`).startsWith('cmds.') ? cat : t(`cmds.cat.${cat}`)}</h2>
          <ul className="grid gap-2 lg:grid-cols-2">
            {cmds.map((c) => {
              const link = fixLink(c);
              const status = guildId ? c.status : c.moduleEnabled ? 'on' : 'module_off';
              return (
                <li key={c.name} className="dash-card rounded-2xl p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="font-mono font-semibold text-pyxie-glow">{c.slash ? `/${c.name}` : `py!${c.name.replace(/^py-/, '')}`}</code>
                    <Badge tone={STATUS_TONE[status] || 'muted'}>{t(`cmds.status.${status}`)}</Badge>
                    {c.ownerOnly && <Badge tone="pink">{t('cmds.ownerOnly')}</Badge>}
                    {!guildId && <Badge>{scopeLabel(t, c.guildScope)}</Badge>}
                    {guildId && c.guildScope.length > 0 && <Badge>{t('cmds.exclusive')}</Badge>}
                  </div>
                  <p className="mt-1 text-white/70">{lang === 'en' ? c.description.en : c.description.pt}</p>
                  {c.aliases.length > 0 && <p className="mt-1 font-mono text-[11px] text-white/40">py!{c.aliases.join(' · py!')}</p>}
                  {guildId && c.channels.length > 0 && (
                    <p className="mt-1 text-xs text-mystic-glow">{t('cmds.onlyIn', { channels: c.channels.map((id) => `#${channels[id] || id}`).join(', ') })}</p>
                  )}
                  {link && status !== 'on' && (
                    <a href={link} className="mt-1 inline-block text-xs text-pyxie-glow hover:underline">
                      {t('cmds.fix')} →
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
