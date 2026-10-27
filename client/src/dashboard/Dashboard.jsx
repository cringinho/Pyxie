import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { detectLang, makeT } from './i18n';
import { Button, Card, GuildIcon, MultiSelect, Notice, Spinner, Toggle } from './ui';
import Studio from './Studio';
import { Links, Moderation } from './Safety';

// Rotas por hash: #/ (seletor), #/guild/<id>/<seção>, #/global/<seção>.
function parseHash() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'guild' && parts[1]) return { view: 'guild', guildId: parts[1], section: parts[2] || 'overview' };
  if (parts[0] === 'global') return { view: 'global', section: parts[1] || 'health' };
  return { view: 'picker' };
}

function useHashRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

const go = (hash) => {
  window.location.hash = hash;
};

function formatUptime(sec) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}min`;
}

export default function Dashboard() {
  const [lang, setLang] = useState(detectLang);
  const t = useMemo(() => makeT(lang), [lang]);
  const route = useHashRoute();
  const [me, setMe] = useState(null);
  const [authState, setAuthState] = useState('loading');
  const loginError = new URLSearchParams(window.location.search).get('error');

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = t('app.title');
    try {
      localStorage.setItem('pyxie_lang', lang);
    } catch (_) {}
  }, [lang, t]);

  useEffect(() => {
    api
      .me()
      .then((data) => {
        setMe(data);
        setAuthState('in');
      })
      .catch(() => setAuthState('out'));
  }, []);

  const logout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    window.location.href = '/dashboard';
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-16 pt-4">
      <header className="mb-5 flex items-center justify-between gap-3">
        <a href="#/" className="flex min-w-0 items-center gap-2">
          <img src="https://cdn.discordapp.com/emojis/1548443951596306552.webp" alt="Pyxie" width="32" height="32" />
          <h1 className="truncate font-title text-xl font-extrabold">{t('app.title')}</h1>
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}>
            {t('app.lang')}
          </Button>
          {authState === 'in' && (
            <Button variant="ghost" onClick={logout}>
              {t('app.logout')}
            </Button>
          )}
        </div>
      </header>

      {authState === 'loading' && <Spinner label={t('app.loading')} />}
      {authState === 'out' && <Login t={t} error={loginError} />}
      {authState === 'in' && route.view === 'picker' && <Picker t={t} me={me} />}
      {authState === 'in' && route.view === 'guild' && (
        <GuildView t={t} lang={lang} guildId={route.guildId} section={route.section} me={me} />
      )}
      {authState === 'in' && route.view === 'global' && me?.user?.isOwner && <GlobalView t={t} lang={lang} section={route.section} />}
    </div>
  );
}

function Login({ t, error }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <h2 className="font-title text-2xl font-bold">{t('login.title')}</h2>
        <p className="text-white/70">{t('login.subtitle')}</p>
        {error && <Notice tone="error">{t(`error.${error}`)}</Notice>}
        <a
          href="/auth/discord"
          className="flex min-h-[48px] items-center rounded-xl bg-[#5865F2] px-6 font-semibold hover:bg-[#4752c4]"
        >
          {t('login.button')}
        </a>
        <p className="text-xs text-white/50">{t('login.note')}</p>
      </div>
    </Card>
  );
}

function Picker({ t, me }) {
  return (
    <div className="space-y-4">
      {!me.botOnline && <Notice tone="error">{t('picker.botOffline')}</Notice>}
      {me.user.isOwner && (
        <button
          type="button"
          onClick={() => go('#/global/health')}
          className="glass-panel glass-panel-hover flex w-full items-center gap-3 rounded-2xl p-4 text-left"
        >
          <span className="text-2xl" aria-hidden="true">🧚</span>
          <span className="font-semibold">{t('picker.global')}</span>
        </button>
      )}
      <Card title={t('picker.title')}>
        {me.guilds.length === 0 && <p className="text-sm text-white/60">{t('picker.empty')}</p>}
        <ul className="space-y-2">
          {me.guilds.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => go(`#/guild/${g.id}/overview`)}
                className="flex min-h-[56px] w-full items-center gap-3 rounded-xl px-2 text-left hover:bg-white/5"
              >
                <GuildIcon guild={g} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{g.name}</span>
                  <span className="block text-xs text-white/60">
                    {t(`zone.${g.zone}`)} · {t(`role.${g.role}`)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <a href="/auth/discord" className="mt-3 inline-block text-sm text-mystic-glow underline">
          {t('picker.refresh')}
        </a>
      </Card>
    </div>
  );
}

function Tabs({ items, active, onSelect }) {
  return (
    <nav className="-mx-4 mb-4 overflow-x-auto px-4" aria-label="sections">
      <div className="flex w-max gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onSelect(it.id)}
            aria-current={active === it.id ? 'page' : undefined}
            className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ${
              active === it.id ? 'bg-pyxie-pink text-white' : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function useLoad(loader, deps) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    loader()
      .then((data) => setState({ loading: false, data, error: null }))
      .catch((err) => setState({ loading: false, data: null, error: err.code || 'generic' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(reload, [reload]);
  return { ...state, reload, setData: (data) => setState({ loading: false, data, error: null }) };
}

function ErrorNotice({ t, code }) {
  const known = t(`error.${code}`);
  return <Notice tone="error">{known.startsWith('error.') ? t('error.generic', { error: code }) : known}</Notice>;
}

function GuildView({ t, lang, guildId, section, me }) {
  const info = useLoad(() => api.guild(guildId), [guildId]);
  if (info.loading) return <Spinner label={t('app.loading')} />;
  if (info.error) return <ErrorNotice t={t} code={info.error} />;
  const { guild, zone, role, sections } = info.data;
  const tabs = sections.map((id) => ({ id, label: t(`section.${id}`) }));
  if (zone === 'cringelandia' || zone === 'mary') tabs.push({ id: 'tools', label: t('section.tools') });
  const current = tabs.some((x) => x.id === section) ? section : 'overview';

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <GuildIcon guild={guild || me.guilds.find((g) => g.id === guildId)} size={48} />
        <div className="min-w-0">
          <h2 className="truncate font-title text-xl font-bold">{guild?.name || guildId}</h2>
          <p className="text-xs text-white/60">
            {t(`zone.${zone}`)} · {t(`role.${role}`)}
          </p>
        </div>
      </div>
      <Tabs items={tabs} active={current} onSelect={(id) => go(`#/guild/${guildId}/${id}`)} />
      {current === 'overview' && <Overview t={t} guild={guild} zone={zone} role={role} />}
      {current === 'studio' && <Studio t={t} guildId={guildId} guildName={guild?.name || ''} isOwner={me.user.isOwner} />}
      {current === 'features' && <Features t={t} guildId={guildId} />}
      {current === 'moderation' && <Moderation t={t} guildId={guildId} />}
      {current === 'channels' && <Channels t={t} guildId={guildId} />}
      {current === 'roles' && <Roles t={t} guildId={guildId} />}
      {current === 'access' && <Access t={t} guildId={guildId} />}
      {current === 'tools' && <Tools t={t} zone={zone} lang={lang} guildId={guildId} isOwner={me.user.isOwner} />}
    </div>
  );
}

function Overview({ t, guild, zone, role }) {
  return (
    <Card>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-white/60">{t('overview.members')}</dt>
          <dd className="font-mono text-lg">{guild?.memberCount ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-white/60">{t('overview.zone')}</dt>
          <dd className="font-semibold">{t(`zone.${zone}`)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-white/60">{t('overview.role')}</dt>
          <dd className="font-semibold">{t(`role.${role}`)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-white/60">{t('overview.hint')}</p>
    </Card>
  );
}

const TEXT_TYPES = new Set([0, 5, 15]);

function channelOptions(channels) {
  return channels.filter((c) => TEXT_TYPES.has(c.type)).map((c) => ({ id: c.id, label: `#${c.name}` }));
}

function Features({ t, guildId }) {
  const features = useLoad(() => api.features(guildId), [guildId]);
  const channels = useLoad(() => api.channels(guildId), [guildId]);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState(null);
  const [newRoute, setNewRoute] = useState('');

  useEffect(() => {
    if (features.data) setDraft(structuredClone(features.data.features));
  }, [features.data]);

  if (features.loading || !draft) return <Spinner label={t('app.loading')} />;
  if (features.error) return <ErrorNotice t={t} code={features.error} />;
  const opts = channelOptions(channels.data?.channels || []);

  const save = async () => {
    setStatus(null);
    try {
      const body = {
        groups: Object.fromEntries(draft.groups.map((g) => [g.id, g.enabled])),
        channels: { games: draft.channels.games },
        ...(draft.commandChannels ? { commandChannels: draft.commandChannels } : {}),
      };
      const res = await api.saveFeatures(guildId, body);
      setDraft(structuredClone(res.features));
      setStatus('ok');
    } catch (err) {
      setStatus(err.code || 'generic');
    }
  };

  return (
    <div className="space-y-4">
      <Card title={t('features.title')}>
        {draft.groups.map((g) => (
          <Toggle
            key={g.id}
            label={`${g.emoji} ${t(`group.${g.id}`)}`}
            checked={g.enabled}
            onChange={(v) => setDraft({ ...draft, groups: draft.groups.map((x) => (x.id === g.id ? { ...x, enabled: v } : x)) })}
          />
        ))}
      </Card>
      <Card title={t('features.gamesChannels')}>
        <p className="mb-2 text-xs text-white/60">{t('features.gamesChannelsHint')}</p>
        <MultiSelect
          options={opts}
          value={draft.channels.games}
          emptyLabel={t('channels.empty')}
          onChange={(v) => setDraft({ ...draft, channels: { ...draft.channels, games: v } })}
        />
      </Card>
      {draft.commandChannels && (
        <Card title={t('features.routes')}>
          <p className="mb-3 text-xs text-white/60">{t('features.routesHint')}</p>
          {Object.entries(draft.commandChannels).map(([cmd, ids]) => (
            <div key={cmd} className="mb-4">
              <p className="mb-1 font-mono text-sm">/{cmd}</p>
              <MultiSelect
                options={opts}
                value={ids}
                emptyLabel={t('channels.empty')}
                onChange={(v) => setDraft({ ...draft, commandChannels: { ...draft.commandChannels, [cmd]: v } })}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newRoute}
              onChange={(e) => setNewRoute(e.target.value.replace(/[^a-z0-9-]/g, ''))}
              placeholder={t('features.command')}
              aria-label={t('features.command')}
              className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
            />
            <Button
              variant="ghost"
              disabled={!newRoute}
              onClick={() => {
                setDraft({ ...draft, commandChannels: { ...draft.commandChannels, [newRoute]: [] } });
                setNewRoute('');
              }}
            >
              {t('features.addRoute')}
            </Button>
          </div>
        </Card>
      )}
      {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
      {status && status !== 'ok' && <ErrorNotice t={t} code={status} />}
      <Button onClick={save} className="w-full">
        {t('features.save')}
      </Button>
    </div>
  );
}

function channelTypeLabel(t, type) {
  if (type === 4) return t('channels.category');
  if (type === 0 || type === 5) return t('channels.text');
  if (type === 2 || type === 13) return t('channels.voice');
  if (type === 15) return t('channels.forum');
  return t('channels.other');
}

function Channels({ t, guildId }) {
  const channels = useLoad(() => api.channels(guildId), [guildId]);
  if (channels.loading) return <Spinner label={t('app.loading')} />;
  if (channels.error) return <ErrorNotice t={t} code={channels.error} />;
  const list = channels.data.channels;
  if (!list.length) return <Notice>{t('channels.empty')}</Notice>;
  return (
    <Card>
      <ul className="divide-y divide-white/5">
        {list.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className={`truncate ${c.type === 4 ? 'font-bold uppercase text-white/70' : ''}`}>{c.type === 4 ? c.name : `#${c.name}`}</span>
            <span className="shrink-0 text-xs text-white/50">{channelTypeLabel(t, c.type)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Roles({ t, guildId }) {
  const roles = useLoad(() => api.roles(guildId), [guildId]);
  if (roles.loading) return <Spinner label={t('app.loading')} />;
  if (roles.error) return <ErrorNotice t={t} code={roles.error} />;
  return (
    <Card>
      <ul className="divide-y divide-white/5">
        {roles.data.roles.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: r.color === '#000000' ? '#99aab5' : r.color }} aria-hidden="true" />
              <span className="truncate">{r.name}</span>
            </span>
            <span className={`shrink-0 text-xs ${r.assignable ? 'text-emerald-300' : 'text-white/40'}`}>
              {r.assignable ? t('roles.assignable') : t('roles.locked')}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Access({ t, guildId }) {
  const access = useLoad(() => api.access(guildId), [guildId]);
  const roles = useLoad(() => api.roles(guildId), [guildId]);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (access.data) setDraft({ ...access.data.whitelist, userText: access.data.whitelist.userIds.join('\n') });
  }, [access.data]);

  if (access.loading || !draft) return access.error ? <ErrorNotice t={t} code={access.error} /> : <Spinner label={t('app.loading')} />;

  const save = async () => {
    setStatus(null);
    try {
      const userIds = draft.userText.split(/[\s,]+/).filter(Boolean);
      const res = await api.saveAccess(guildId, { enabled: draft.enabled, userIds, roleIds: draft.roleIds });
      setDraft({ ...res.whitelist, userText: res.whitelist.userIds.join('\n') });
      setStatus('ok');
    } catch (err) {
      setStatus(err.code || 'generic');
    }
  };

  return (
    <div className="space-y-4">
      <Card title={t('access.title')}>
        <Toggle label={t('access.enabled')} checked={draft.enabled} onChange={(v) => setDraft({ ...draft, enabled: v })} />
        {!draft.enabled && <p className="text-xs text-white/60">{t('access.off')}</p>}
        <p className="mt-2 text-xs text-white/60">{t('access.ownerNote')}</p>
      </Card>
      {draft.enabled && (
        <>
          <Card title={t('access.users')}>
            <textarea
              value={draft.userText}
              onChange={(e) => setDraft({ ...draft, userText: e.target.value })}
              rows={4}
              aria-label={t('access.users')}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-sm"
            />
          </Card>
          <Card title={t('access.roles')}>
            <MultiSelect
              options={(roles.data?.roles || []).map((r) => ({ id: r.id, label: r.name }))}
              value={draft.roleIds}
              emptyLabel={t('app.loading')}
              onChange={(v) => setDraft({ ...draft, roleIds: v })}
            />
          </Card>
        </>
      )}
      {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
      {status && status !== 'ok' && <ErrorNotice t={t} code={status} />}
      <Button onClick={save} className="w-full">
        {t('features.save')}
      </Button>
    </div>
  );
}

function Tools({ t, zone, lang, guildId, isOwner }) {
  const suffix = lang === 'en' ? '?lang=en' : '';
  if (zone === 'mary') {
    return (
      <Card title={t('tools.mary')}>
        <p className="mb-4 text-sm text-white/70">{t('tools.maryHint')}</p>
        <a href="/mary" className="flex min-h-[44px] items-center justify-center rounded-xl bg-pyxie-pink font-semibold">
          {t('tools.mary')}
        </a>
      </Card>
    );
  }
  const links = [
    { href: `/admin/sazonal${suffix}`, label: t('tools.seasonal') },
    { href: `/admin/parcerias${suffix}`, label: t('tools.partnerships') },
    { href: '/admin', label: t('tools.legacy') },
  ];
  return (
    <div className="space-y-4">
      <Card title={t('tools.title')}>
        <p className="mb-4 text-sm text-white/70">{t('tools.hint')}</p>
        <div className="grid gap-2">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="flex min-h-[48px] items-center rounded-xl bg-white/5 px-4 font-semibold hover:bg-white/10">
              {l.label}
            </a>
          ))}
        </div>
      </Card>
      {isOwner && <PartnershipDm t={t} guildId={guildId} />}
    </div>
  );
}

// Texto da DM de aprovação de parceria puxado do fórum (só o dono, só na Cringelândia).
function PartnershipDm({ t, guildId }) {
  const source = useLoad(() => api.partnershipDm(guildId), [guildId]);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState(null);
  useEffect(() => {
    if (source.data) setDraft(source.data.dmSource);
  }, [source.data]);
  if (!draft) return source.error ? <ErrorNotice t={t} code={source.error} /> : <Spinner label={t('app.loading')} />;
  const digits = (v) => v.replace(/\D/g, '');
  const save = async () => {
    setStatus(null);
    try {
      const res = await api.savePartnershipDm(guildId, draft);
      setDraft(res.dmSource);
      setStatus('ok');
    } catch (err) {
      setStatus(err.code || 'generic');
    }
  };
  const input = (key, label) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      <input value={draft[key] || ''} onChange={(e) => setDraft({ ...draft, [key]: digits(e.target.value) })} inputMode="numeric" className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-sm" />
    </label>
  );
  return (
    <Card title={t('partnerDm.title')}>
      <p className="mb-3 text-sm text-white/70">{t('partnerDm.hint')}</p>
      <div className="space-y-3">
        {input('threadId', t('partnerDm.thread'))}
        {input('authorId', t('partnerDm.author'))}
        {input('reportChannelId', t('partnerDm.report'))}
        <p className="text-xs text-white/50">{t('partnerDm.fallback')}</p>
        {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
        {status && status !== 'ok' && <ErrorNotice t={t} code={status} />}
        <Button onClick={save} className="w-full">
          {t('features.save')}
        </Button>
      </div>
    </Card>
  );
}

function GlobalView({ t, lang, section }) {
  const tabs = ['health', 'errors', 'modules', 'links'].map((id) => ({ id, label: t(`section.${id}`) }));
  const current = tabs.some((x) => x.id === section) ? section : 'health';
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" onClick={() => go('#/')}>
          ← {t('nav.back')}
        </Button>
        <h2 className="font-title text-xl font-bold">{t('picker.global')}</h2>
      </div>
      <Tabs items={tabs} active={current} onSelect={(id) => go(`#/global/${id}`)} />
      {current === 'health' && <Health t={t} />}
      {current === 'errors' && <Errors t={t} />}
      {current === 'modules' && <Modules t={t} lang={lang} />}
      {current === 'links' && <Links t={t} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-white/60">{label}</dt>
      <dd className="font-mono text-base">{value}</dd>
    </div>
  );
}

function Health({ t }) {
  const health = useLoad(() => api.health(), []);
  useEffect(() => {
    const id = setInterval(health.reload, 30000);
    return () => clearInterval(id);
  }, [health.reload]);
  if (!health.data) return health.error ? <ErrorNotice t={t} code={health.error} /> : <Spinner label={t('app.loading')} />;
  const { web, bot, dataDirMb } = health.data;
  return (
    <div className="space-y-4">
      <Card title={t('health.bot')}>
        {bot.error ? (
          <ErrorNotice t={t} code={bot.error} />
        ) : (
          <dl className="grid grid-cols-2 gap-3">
            <Stat label={t('health.ping')} value={bot.ready ? `${bot.wsPingMs} ms` : t('health.offline')} />
            <Stat label={t('health.guilds')} value={bot.guildCount} />
            <Stat label={t('health.memory')} value={`${bot.rssMb} MB`} />
            <Stat label={t('health.uptime')} value={formatUptime(Math.floor(bot.uptimeMs / 1000))} />
          </dl>
        )}
      </Card>
      <Card title={t('health.web')}>
        <dl className="grid grid-cols-2 gap-3">
          <Stat label={t('health.memory')} value={`${web.rssMb} MB`} />
          <Stat label={t('health.uptime')} value={formatUptime(web.uptimeSec)} />
          <Stat label={t('health.data')} value={`${dataDirMb} MB`} />
          <Stat label="Node" value={web.node} />
        </dl>
      </Card>
    </div>
  );
}

function Errors({ t }) {
  const [win, setWin] = useState('7d');
  const errors = useLoad(() => api.errors(win), [win]);
  return (
    <Card title={t('errors.title')}>
      <div className="mb-3 flex gap-2">
        {['24h', '7d', '30d'].map((w) => (
          <Button key={w} variant={w === win ? 'primary' : 'ghost'} onClick={() => setWin(w)}>
            {w}
          </Button>
        ))}
      </div>
      {errors.loading && <Spinner label={t('app.loading')} />}
      {errors.error && <ErrorNotice t={t} code={errors.error} />}
      {errors.data && errors.data.commands.length === 0 && <p className="text-sm text-white/60">{t('errors.empty')}</p>}
      <ul className="divide-y divide-white/5">
        {(errors.data?.commands || []).map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="truncate font-mono">/{c.name}</span>
            <span className="shrink-0 text-xs text-red-300">{t('errors.calls', { errors: c.errors, total: c.total })}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Modules({ t, lang }) {
  const modules = useLoad(() => api.modules(), []);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  if (!modules.data) return modules.error ? <ErrorNotice t={t} code={modules.error} /> : <Spinner label={t('app.loading')} />;
  const key = lang === 'pt' ? 'pt-BR' : 'en';

  const toggle = async (m, enabled) => {
    setBusy(m.id);
    setError(null);
    try {
      await api.toggleModule(m.id, enabled);
      modules.setData({ ...modules.data, modules: modules.data.modules.map((x) => (x.id === m.id ? { ...x, enabled } : x)) });
    } catch (err) {
      setError(err.code || 'generic');
    }
    setBusy(null);
  };

  return (
    <Card>
      <p className="mb-3 text-sm text-white/60">{t('modules.hint')}</p>
      {error && <ErrorNotice t={t} code={error} />}
      <ul className="divide-y divide-white/5">
        {modules.data.modules.map((m) => (
          <li key={m.id} className="py-2">
            <Toggle
              label={`${m.name?.[key] || m.id}`}
              checked={m.enabled}
              disabled={busy === m.id}
              onChange={(v) => toggle(m, v)}
            />
            <p className="text-xs text-white/50">{m.description?.[key]}</p>
            {m.guildScope && <p className="text-xs text-mystic-glow">{t('modules.scoped', { guilds: m.guildScope.join(', ') })}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
