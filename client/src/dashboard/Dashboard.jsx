import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Boxes, Check, DoorOpen, LogIn, MessageCircle, Terminal, Clock, Cpu, Crown, HardDrive, Layers, MapPin, Server, Sparkles, UsersRound, Wifi } from 'lucide-react';
import { api } from './api';
import { detectLang, makeT } from './i18n';
import { Badge, Button, Card, GuildIcon, MultiSelect, Notice, Spinner, StatTile, StatusDot, Switch, Toggle } from './ui';
import { Layout, Starfield, buildNav, go, sectionIcon } from './Shell';
import Studio from './Studio';
import { Links, Moderation } from './Safety';
import { Assets, CommunitySettings } from './Community';
import Embeds from './Embeds';
import Security from './Security';
import Museum from './Museum';
import BotPermissions from './Permissions';

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
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

function formatUptime(sec) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}min`;
}

const PYXIE_ICON = 'https://cdn.discordapp.com/emojis/1548443951596306552.webp';

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

  if (authState === 'loading') {
    return (
      <div className="min-h-screen">
        <Starfield />
        <Spinner label={t('app.loading')} />
      </div>
    );
  }
  if (authState === 'out') return <Login t={t} lang={lang} setLang={setLang} error={loginError} />;

  const shell = { t, lang, setLang, me, onLogout: logout };
  if (route.view === 'guild') return <GuildView shell={shell} guildId={route.guildId} section={route.section} />;
  if (route.view === 'global' && me?.user?.isOwner) return <GlobalView shell={shell} section={route.section} />;
  return <Picker shell={shell} />;
}

// Título da página (o único <h1>) com ícone e selos.
function PageHeader({ icon, title, subtitle, badges }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      {icon}
      <div className="min-w-0">
        <h1 className="truncate font-title text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="truncate text-sm text-white/60">{subtitle}</p>}
        {badges && <div className="mt-1.5 flex flex-wrap gap-1.5">{badges}</div>}
      </div>
    </div>
  );
}

function Login({ t, lang, setLang, error }) {
  const perms = ['login.perm.identify', 'login.perm.guilds', 'login.perm.noEmail'];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Starfield />
      <button
        type="button"
        onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
        className="absolute right-4 top-4 h-10 rounded-xl px-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
      >
        {t('app.lang')}
      </button>
      <section className="dash-card relative w-full max-w-md rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(236,72,153,0.25)] sm:p-8">
        <span className="absolute -left-3 -top-3 text-2xl text-pyxie-glow drop-shadow-[0_0_8px_#F472B6]" aria-hidden="true">✦</span>
        <span className="absolute -bottom-3 -right-2 text-xl text-mystic-glow drop-shadow-[0_0_8px_#C084FC]" aria-hidden="true">✧</span>
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-pyxie-glow/30 bg-pyxie-bright/10 px-3 py-1 text-xs font-semibold text-pyxie-glow">
          <Sparkles size={13} aria-hidden="true" /> {t('app.title')}
        </p>
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pyxie-bright/40 to-mystic-violet/40 p-1 shadow-[0_0_40px_rgba(236,72,153,0.45)]">
          <img src={PYXIE_ICON} alt="Pyxie" width="80" height="80" className="h-20 w-20 rounded-full bg-obsidian-900 object-contain p-2" />
        </div>
        <h1 className="font-title text-2xl font-extrabold">{t('login.title')}</h1>
        <p className="mt-2 text-sm text-white/70">{t('login.subtitle')}</p>
        <ul className="my-6 space-y-2 text-left">
          {perms.map((key) => (
            <li key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pyxie-bright to-mystic-violet" aria-hidden="true">
                <Check size={14} />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
        {error && (
          <div className="mb-4">
            <Notice tone="error">{t(`error.${error}`)}</Notice>
          </div>
        )}
        <a
          href="/auth/discord"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pyxie-bright via-fuchsia-500 to-mystic-violet px-6 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.5)] transition hover:brightness-110"
        >
          {t('login.button')} <ArrowRight size={18} aria-hidden="true" />
        </a>
        <p className="mt-4 text-xs text-white/50">{t('login.note')}</p>
      </section>
    </div>
  );
}

function pickerNav(t, me) {
  const groups = [{ id: 'core', label: t('nav.group.core'), items: [{ id: 'picker', label: t('picker.title'), icon: Server, href: '#/', active: true }] }];
  if (me.user.isOwner) groups[0].items.push({ id: 'global', label: t('picker.global'), icon: Sparkles, href: '#/global/health', active: false });
  return { title: t('app.title'), subtitle: me.user.globalName || me.user.username, groups };
}

function Picker({ shell }) {
  const { t, me } = shell;
  return (
    <Layout {...shell} nav={pickerNav(t, me)} crumbs={[{ label: t('app.title') }]}>
      <PageHeader title={t('picker.title')} subtitle={t('picker.subtitle')} />
      <div className="space-y-4">
        {!me.botOnline && <Notice tone="error">{t('picker.botOffline')}</Notice>}
        {me.user.isOwner && (
          <button
            type="button"
            onClick={() => go('#/global/health')}
            className="dash-card dash-card-hover flex w-full items-center gap-4 rounded-2xl p-4 text-left"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pyxie-bright to-mystic-violet shadow-[0_0_18px_rgba(236,72,153,0.5)]" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-title text-lg font-bold">{t('picker.global')}</span>
              <span className="block text-sm text-white/60">{t('sectionDesc.global')}</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-pyxie-glow" aria-hidden="true" />
          </button>
        )}
        {me.guilds.length === 0 && (
          <Card>
            <p className="text-sm text-white/60">{t('picker.empty')}</p>
          </Card>
        )}
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {me.guilds.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => go(`#/guild/${g.id}/overview`)}
                className="dash-card dash-card-hover flex h-full min-h-[88px] w-full items-center gap-3 rounded-2xl p-4 text-left"
              >
                <GuildIcon guild={g} size={52} className="rounded-2xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{g.name}</span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone={g.zone === 'global' ? 'muted' : 'pink'}>{t(`zone.${g.zone}`)}</Badge>
                    <Badge>{t(`role.${g.role}`)}</Badge>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <a href="/auth/discord" className="inline-block text-sm text-mystic-glow underline">
          {t('picker.refresh')}
        </a>
      </div>
    </Layout>
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

// Permissões que a Pyxie precisa em cada seção (o cartão confere ao vivo).
const SECTION_NEEDS = {
  studio: [
    { perm: 'SendMessages', why: 'perm.why.studioSend' },
    { perm: 'EmbedLinks', why: 'perm.why.studioEmbeds' },
    { perm: 'ManageRoles', why: 'perm.why.studioRoles' },
  ],
  community: [
    { perm: 'SendMessages', why: 'perm.why.communitySend' },
    { perm: 'EmbedLinks', why: 'perm.why.radarEmbeds' },
    { perm: 'ManageRoles', why: 'perm.why.colorRoles' },
  ],
};

// Atividade real do servidor (contagens diárias gravadas pelo bot a cada 5 minutos).
function Activity({ t, guildId }) {
  const activity = useLoad(() => api.activity(guildId), [guildId]);
  if (!activity.data) return activity.error ? <ErrorNotice t={t} code={activity.error} /> : <Spinner label={t('app.loading')} />;
  const { today, week, series, hasData } = activity.data;
  const max = Math.max(1, ...series.map((d) => d.messages));
  const fmt = (n) => n.toLocaleString();
  return (
    <div>
      <h2 className="mb-1 font-title text-lg font-bold">{t('activity.title')}</h2>
      <p className="mb-3 text-sm text-white/60">{t(hasData ? 'activity.hint' : 'activity.empty')}</p>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={MessageCircle} label={t('activity.messagesToday')} value={fmt(today.messages)} />
        <StatTile icon={LogIn} accent="green" label={t('activity.joinsWeek')} value={fmt(week.joins)} />
        <StatTile icon={DoorOpen} accent="violet" label={t('activity.leavesWeek')} value={fmt(week.leaves)} />
        <StatTile icon={Terminal} accent="cyan" label={t('activity.commandsWeek')} value={fmt(week.commands)} />
      </div>
      <Card className="mt-3" title={t('activity.chartTitle')}>
        <div className="flex h-28 items-end gap-[3px]" role="img" aria-label={t('activity.chartLabel', { total: fmt(series.reduce((a, d) => a + d.messages, 0)) })}>
          {series.map((d) => (
            <span
              key={d.day}
              title={`${d.day.split('-').reverse().slice(0, 2).join('/')}: ${fmt(d.messages)}`}
              style={{ height: `${Math.max(2, (d.messages / max) * 100)}%` }}
              className="flex-1 rounded-t bg-gradient-to-t from-mystic-violet/60 to-pyxie-bright"
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-white/40">
          <span>{series[0].day.split('-').reverse().slice(0, 2).join('/')}</span>
          <span>{t('activity.today')}</span>
        </div>
      </Card>
    </div>
  );
}

// Seções de formulário ficam numa coluna mais estreita; as de grade usam a largura toda.
const WIDE_SECTIONS = new Set(['overview', 'features', 'embeds']);

function GuildView({ shell, guildId, section }) {
  const { t, lang, me } = shell;
  const info = useLoad(() => api.guild(guildId), [guildId]);
  const fallbackGuild = me.guilds.find((g) => g.id === guildId);
  const loadingNav = { title: fallbackGuild?.name || guildId, groups: [] };

  if (info.loading || info.error) {
    return (
      <Layout {...shell} nav={loadingNav} crumbs={[{ label: t('app.title'), href: '#/' }, { label: loadingNav.title }]} activeGuildId={guildId}>
        {info.error ? <ErrorNotice t={t} code={info.error} /> : <Spinner label={t('app.loading')} />}
      </Layout>
    );
  }

  const { guild, zone, role, sections } = info.data;
  const ids = [...sections];
  if (zone === 'cringelandia' || zone === 'mary') ids.push('tools');
  const current = ids.includes(section) ? section : 'overview';
  const g = guild || fallbackGuild;
  const name = g?.name || guildId;
  const nav = {
    title: name,
    subtitle: `${t(`zone.${zone}`)} · ${t(`role.${role}`)}`,
    groups: buildNav(t, ids, current, (id) => `#/guild/${guildId}/${id}`),
  };
  const crumbs = [{ label: t('app.title'), href: '#/' }, { label: name, href: `#/guild/${guildId}/overview` }, { label: t(`section.${current}`) }];
  const CurrentIcon = sectionIcon(current);

  return (
    <Layout {...shell} nav={nav} crumbs={crumbs} activeGuildId={guildId}>
      <PageHeader
        icon={current === 'overview' ? <GuildIcon guild={g} size={64} className="rounded-2xl ring-2 ring-pyxie-glow/40" /> : <SectionBadge icon={CurrentIcon} />}
        title={current === 'overview' ? name : t(`section.${current}`)}
        subtitle={current === 'overview' ? null : name}
        badges={
          current === 'overview' && (
            <>
              <Badge tone="pink">{t(`zone.${zone}`)}</Badge>
              <Badge>{t(`role.${role}`)}</Badge>
            </>
          )
        }
      />
      <div className={WIDE_SECTIONS.has(current) ? '' : 'max-w-3xl'}>
        {current === 'overview' && <Overview t={t} guild={g} zone={zone} role={role} ids={ids} guildId={guildId} botOnline={me.botOnline} />}
        {current === 'studio' && (
          <div className="space-y-4">
            <BotPermissions t={t} guildId={guildId} needs={SECTION_NEEDS.studio} />
            <Studio t={t} guildId={guildId} guildName={name} isOwner={me.user.isOwner} />
          </div>
        )}
        {current === 'features' && <Features t={t} guildId={guildId} />}
        {current === 'embeds' && <Embeds t={t} guildId={guildId} />}
        {current === 'security' && <Security t={t} guildId={guildId} />}
        {current === 'moderation' && <Moderation t={t} guildId={guildId} />}
        {current === 'community' && (
          <div className="space-y-4">
            <BotPermissions t={t} guildId={guildId} needs={SECTION_NEEDS.community} />
            <CommunitySettings t={t} guildId={guildId} />
          </div>
        )}
        {current === 'channels' && <Channels t={t} guildId={guildId} />}
        {current === 'roles' && <Roles t={t} guildId={guildId} />}
        {current === 'access' && <Access t={t} guildId={guildId} />}
        {current === 'tools' && <Tools t={t} zone={zone} lang={lang} guildId={guildId} isOwner={me.user.isOwner} />}
      </div>
    </Layout>
  );
}

function SectionBadge({ icon: Icon }) {
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pyxie-bright/30 to-mystic-violet/30 text-pyxie-glow shadow-[0_0_20px_rgba(236,72,153,0.3)]" aria-hidden="true">
      <Icon size={26} />
    </span>
  );
}

// Atalhos em grade para cada seção liberada, com a descrição de cada uma.
function SectionGrid({ t, ids, hrefFor }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ids.map((id) => {
        const Icon = sectionIcon(id);
        const desc = t(`sectionDesc.${id}`);
        return (
          <li key={id}>
            <a href={hrefFor(id)} className="dash-card dash-card-hover flex h-full flex-col gap-3 rounded-2xl p-4">
              <span className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pyxie-bright/25 to-mystic-violet/25 text-pyxie-glow" aria-hidden="true">
                  <Icon size={19} />
                </span>
                <ArrowRight size={16} className="text-white/40" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-title font-bold">{t(`section.${id}`)}</span>
                {!desc.startsWith('sectionDesc.') && <span className="mt-1 block text-sm text-white/60">{desc}</span>}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function Overview({ t, guild, zone, role, ids, guildId, botOnline }) {
  const shortcuts = ids.filter((id) => id !== 'overview');
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={UsersRound} label={t('overview.members')} value={guild?.memberCount != null ? guild.memberCount.toLocaleString() : '—'} />
        <StatTile icon={MapPin} accent="violet" label={t('overview.zone')} value={t(`zone.${zone}`)} />
        <StatTile icon={Crown} accent="cyan" label={t('overview.role')} value={t(`role.${role}`)} />
        <StatTile
          icon={Wifi}
          accent="green"
          label={t('overview.status')}
          value={
            <span className="flex items-center gap-2">
              <StatusDot online={botOnline} />
              {t(botOnline ? 'health.online' : 'health.offline')}
            </span>
          }
          hint={t('overview.sections', { count: shortcuts.length })}
        />
      </div>
      <Activity t={t} guildId={guildId} />
      <div>
        <h2 className="mb-1 font-title text-lg font-bold">{t('overview.shortcuts')}</h2>
        <p className="mb-3 text-sm text-white/60">{t('overview.hint')}</p>
        <SectionGrid t={t} ids={shortcuts} hrefFor={(id) => `#/guild/${guildId}/${id}`} />
      </div>
    </div>
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
      <div>
        <h2 className="mb-3 font-title text-lg font-bold">{t('features.title')}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {draft.groups.map((g) => (
            <li key={g.id}>
              <ModuleTile
                t={t}
                emoji={g.emoji}
                name={t(`group.${g.id}`)}
                enabled={g.enabled}
                onChange={(v) => setDraft({ ...draft, groups: draft.groups.map((x) => (x.id === g.id ? { ...x, enabled: v } : x)) })}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
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
      </div>
      {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
      {status && status !== 'ok' && <ErrorNotice t={t} code={status} />}
      <div className="dash-surface sticky bottom-3 z-10 rounded-2xl p-2">
        <Button onClick={save} className="w-full">
          {t('features.save')}
        </Button>
      </div>
    </div>
  );
}

// Cartão de módulo/grupo com selo Ligado/Desligado e interruptor.
function ModuleTile({ t, emoji, icon: Icon, name, description, extra, enabled, disabled, onChange }) {
  return (
    <div className={`dash-card flex h-full flex-col gap-3 rounded-2xl p-4 transition ${enabled ? 'shadow-[0_0_22px_rgba(236,72,153,0.18)]' : 'opacity-80'}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pyxie-bright/25 to-mystic-violet/25 text-xl text-pyxie-glow" aria-hidden="true">
          {emoji || (Icon && <Icon size={19} />)}
        </span>
        <Switch checked={enabled} onChange={onChange} label={name} disabled={disabled} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-title font-bold">{name}</p>
        {description && <p className="mt-1 text-sm text-white/60">{description}</p>}
        {extra}
      </div>
      <div>
        <Badge tone={enabled ? 'green' : 'muted'}>{t(enabled ? 'status.on' : 'status.off')}</Badge>
      </div>
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

function GlobalView({ shell, section }) {
  const { t, lang } = shell;
  const ids = ['health', 'servers', 'errors', 'modules', 'links', 'assets', 'museum'];
  const current = ids.includes(section) ? section : 'health';
  const nav = { title: t('picker.global'), subtitle: t('sectionDesc.global'), groups: buildNav(t, ids, current, (id) => `#/global/${id}`) };
  const crumbs = [{ label: t('app.title'), href: '#/' }, { label: t('picker.global'), href: '#/global/health' }, { label: t(`section.${current}`) }];
  return (
    <Layout {...shell} nav={nav} crumbs={crumbs} globalActive>
      <PageHeader icon={<SectionBadge icon={sectionIcon(current)} />} title={t(`section.${current}`)} subtitle={t(`sectionDesc.${current}`)} />
      <div className={['health', 'modules', 'servers', 'museum'].includes(current) ? '' : 'max-w-3xl'}>
        {current === 'health' && <Health t={t} />}
        {current === 'servers' && <ServerDirectory t={t} />}
        {current === 'errors' && <Errors t={t} />}
        {current === 'modules' && <Modules t={t} lang={lang} />}
        {current === 'links' && <Links t={t} />}
        {current === 'assets' && <Assets t={t} />}
        {current === 'museum' && <Museum t={t} />}
      </div>
    </Layout>
  );
}

// Lista pública dos servidores com a Pyxie: só o que qualquer membro vê. Não dá acesso a nada.
function ServerDirectory({ t }) {
  const dir = useLoad(() => api.servers(), []);
  const [query, setQuery] = useState('');
  if (!dir.data) return dir.error ? <ErrorNotice t={t} code={dir.error} /> : <Spinner label={t('app.loading')} />;
  const all = dir.data.servers;
  const q = query.trim().toLowerCase();
  const list = q ? all.filter((g) => `${g.name} ${g.id} ${g.ownerName} ${g.ownerId}`.toLowerCase().includes(q)) : all;
  const date = (ms) => (ms ? new Date(ms).toLocaleDateString() : '—');
  return (
    <div className="space-y-4">
      <Notice>{t('dir.privacyNote')}</Notice>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">{t('dir.total', { count: all.length, members: all.reduce((a, g) => a + g.memberCount, 0).toLocaleString() })}</p>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('dir.search')} aria-label={t('dir.search')} className="dash-field min-h-[40px] w-full rounded-xl px-3 text-sm sm:w-72" />
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {list.map((g) => (
          <li key={g.id} className="dash-card flex gap-3 rounded-2xl p-4">
            <GuildIcon guild={g} size={48} className="rounded-xl" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-title text-base font-bold">{g.name}</p>
              <p className="font-mono text-xs text-white/50">{g.id}</p>
              <p className="mt-2 text-white/70">{g.description || <span className="italic text-white/40">{t('dir.noDescription')}</span>}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-white/50">{t('dir.owner')}</dt>
                <dd className="truncate">
                  {g.ownerName || '—'} <span className="font-mono text-white/40">{g.ownerId}</span>
                </dd>
                <dt className="text-white/50">{t('dir.members')}</dt>
                <dd>{g.memberCount.toLocaleString()}</dd>
                <dt className="text-white/50">{t('dir.joined')}</dt>
                <dd>{date(g.joinedAt)}</dd>
              </dl>
            </div>
          </li>
        ))}
      </ul>
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
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-title text-lg font-bold">
          {!bot.error && <StatusDot online={bot.ready} />}
          {t('health.bot')}
        </h2>
        {bot.error ? (
          <ErrorNotice t={t} code={bot.error} />
        ) : (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatTile icon={Wifi} accent="green" label={t('health.ping')} value={bot.ready ? `${bot.wsPingMs} ms` : t('health.offline')} />
            <StatTile icon={Server} accent="violet" label={t('health.guilds')} value={bot.guildCount} />
            <StatTile icon={Cpu} label={t('health.memory')} value={`${bot.rssMb} MB`} />
            <StatTile icon={Clock} accent="cyan" label={t('health.uptime')} value={formatUptime(Math.floor(bot.uptimeMs / 1000))} />
          </div>
        )}
      </div>
      <div>
        <h2 className="mb-3 font-title text-lg font-bold">{t('health.web')}</h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile icon={Cpu} label={t('health.memory')} value={`${web.rssMb} MB`} />
          <StatTile icon={Clock} accent="cyan" label={t('health.uptime')} value={formatUptime(web.uptimeSec)} />
          <StatTile icon={HardDrive} accent="violet" label={t('health.data')} value={`${dataDirMb} MB`} />
          <StatTile icon={Layers} accent="green" label="Node" value={web.node} />
        </div>
      </div>
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
    <div className="space-y-4">
      {error && <ErrorNotice t={t} code={error} />}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modules.data.modules.map((m) => (
          <li key={m.id}>
            <ModuleTile
              t={t}
              icon={Boxes}
              name={m.name?.[key] || m.id}
              description={m.description?.[key]}
              extra={m.guildScope && <p className="mt-1 text-xs text-mystic-glow">{t('modules.scoped', { guilds: m.guildScope.join(', ') })}</p>}
              enabled={m.enabled}
              disabled={busy === m.id}
              onChange={(v) => toggle(m, v)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
