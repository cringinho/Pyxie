import React, { useEffect, useState } from 'react';
import {
  Coffee,
  Moon,
  HandHeart,
  MessageCircleHeart,
  LifeBuoy,
  Trophy,
  Gem,
  Ghost,
  AudioLines,
  CaseUpper,
  Images,
  Timer,
  EyeOff,
  Route,
  DoorOpen,
  Users,
  MessageCircleQuestion,
  CalendarClock,
  ChartNoAxesColumn,
  Archive,
  AlarmClock,
  Activity,
  AtSign,
  Bot,
  Contrast,
  Copy,
  Eraser,
  FileText,
  Gauge,
  Headphones,
  Link2,
  Megaphone,
  MessagesSquare,
  PartyPopper,
  Pin,
  RefreshCw,
  ScrollText,
  Siren,
  Sparkles,
  SpellCheck,
  Star,
  ThumbsUp,
  Unlink,
  UserRoundX,
  VenetianMask,
  Search,
  RotateCcw,
} from 'lucide-react';
import { api } from './api';
import BotPermissions from './Permissions';
import { ConfigAside, DiscordPreview, HubGroup, HubLayout, ModuleCard, SchemaForm } from './hub';
import { Button, Notice, Spinner, StatTile } from './ui';

const ICONS = {
  Coffee,
  Moon,
  HandHeart,
  MessageCircleHeart,
  LifeBuoy,
  Trophy,
  Gem,
  Ghost,
  AudioLines,
  CaseUpper,
  Images,
  Timer,
  EyeOff,
  Route,
  DoorOpen,
  Users,
  MessageCircleQuestion,
  CalendarClock,
  ChartNoAxesColumn,
  Archive,
  AlarmClock,
  Activity,
  AtSign,
  Bot,
  Contrast,
  Copy,
  Eraser,
  FileText,
  Gauge,
  Headphones,
  Link2,
  Megaphone,
  MessagesSquare,
  PartyPopper,
  Pin,
  ScrollText,
  Siren,
  Sparkles,
  SpellCheck,
  Star,
  ThumbsUp,
  Unlink,
  UserRoundX,
  VenetianMask,
};
// Automações que mandam embed (prévia com título e texto) ou só texto.
const EMBED_PREVIEW = [
  'newAccountGate',
  'staffImpersonation',
  'crossChannelSpam',
  'massMention',
  'modCanary',
  'modLog',
  'roleContrast',
  'discordStatus',
  'crisisCare',
  'inviteTracker',
  'weeklyDigest',
  'pinArchive',
];
const TEXT_PREVIEW = [
  'inviteFilter',
  'autoSlowmode',
  'linkFixer',
  'longPaste',
  'breakReminder',
  'quietHours',
  'welcomeBuddy',
  'noOneUnanswered',
  'memberMilestones',
  'boostThanks',
  'ghostPing',
  'voiceLog',
  'capsCalm',
  'mediaOnly',
  'selfPromoLimit',
  'spoilerGuard',
  'tempVoice',
  'memberCounter',
  'faqReplies',
  'scheduledMessages',
  'bumpReminder',
];
const KNOWN_ERRORS = ['invalid_channel', 'invalid_role', 'unknown_automation', 'bridge_error', 'automod_exists', 'missing_permission', 'automod_error'];
const GROUP_ORDER = ['community', 'safety', 'moderation', 'utility'];

// Prévia de cada automação. Recebe o rascunho e um número que troca o exemplo.
const PREVIEWS = {
  animator: (t, cfg, n) => {
    const types = cfg.types.length ? cfg.types : ['question'];
    const type = types[n % types.length];
    const intro = t(`auto.animator.prev.tone.${cfg.tone}`);
    const footer = `-# ${t('auto.animator.prev.footer')}`;
    const pause = { label: t('auto.animator.prev.pause'), style: 'secondary' };
    if (type === 'poll') {
      const [question, ...answers] = t('auto.animator.prev.sample.poll').split('|');
      return {
        content: `${intro}\n${footer}`,
        poll: { question, answers },
        buttons: [pause],
      };
    }
    if (type === 'thisOrThat') {
      const [a, b] = t('auto.animator.prev.sample.thisOrThat').split('|');
      return {
        content: `${intro}\n### ${a} ${t('auto.animator.prev.or')} ${b}?\n${footer}`,
        buttons: [{ label: a, style: 'primary' }, { label: b, style: 'primary' }, pause],
      };
    }
    const sample = type === 'house' && cfg.houseLines?.[0] ? cfg.houseLines[0] : t(`auto.animator.prev.sample.${type}`);
    return {
      content: `${intro}\n### ${t(`auto.animator.types.${type}`)}\n> ${sample}\n${footer}`,
      buttons: [pause],
    };
  },
  starboard: (t, cfg) => ({
    content: `${cfg.emoji || '⭐'} \`${cfg.threshold}\` · #geral`,
    embed: {
      color: '#f59e0b',
      title: t('auto.starboard.prev.title'),
      description: t('auto.starboard.prev.body'),
      footer: t('auto.footer'),
    },
  }),
  stickyMessage: (t, cfg) => ({
    content: `${cfg.text?.trim() || t('auto.stickyMessage.prev.content')}\n-# ${t('auto.stickyMessage.prev.label')}`,
  }),
  ...Object.fromEntries(
    EMBED_PREVIEW.map((k) => [
      k,
      (t) => ({
        embed: {
          title: t(`auto.${k}.prev.title`),
          description: t(`auto.${k}.prev.body`),
          footer: t('auto.footer'),
        },
      }),
    ]),
  ),
  ...Object.fromEntries(TEXT_PREVIEW.map((k) => [k, (t) => ({ content: t(`auto.${k}.prev.content`) })])),
};

function metaFor(t, key, stats) {
  if (key === 'animator' && stats?.posts)
    return t('auto.animator.stats', {
      posts: stats.posts,
      answered: stats.answered || 0,
    });
  if (stats?.hits) return t('auto.hits', { n: stats.hits });
  return null;
}

// Automações: cartões por grupo; o painel da direita edita a escolhida com prévia ao vivo.
export default function Automations({ t, guildId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sample, setSample] = useState(0);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [togglingKey, setTogglingKey] = useState(null);

  useEffect(() => {
    api
      .automations(guildId)
      .then(setData)
      .catch((e) => setError(e.code || 'generic'));
    api
      .channels(guildId)
      .then((d) => setChannels(d.channels))
      .catch(() => {});
    api
      .roles(guildId)
      .then((d) => setRoles(d.roles))
      .catch(() => {});
  }, [guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;

  const keys = Object.keys(data.schema);
  const q = query.trim().toLowerCase();
  const filteredKeys = keys.filter((k) => {
    const on = Boolean(data.configs[k]?.enabled);
    if (statusFilter === 'on' && !on) return false;
    if (statusFilter === 'off' && on) return false;
    if (groupFilter !== 'all' && data.schema[k].group !== groupFilter) return false;
    if (q) {
      const text = `${t(`auto.${k}.title`)} ${t(`auto.${k}.desc`)} ${k}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const groups = GROUP_ORDER.map((g) => [g, filteredKeys.filter((k) => data.schema[k].group === g)]).filter(([, ks]) => ks.length);
  const enabledCount = keys.filter((k) => data.configs[k]?.enabled).length;
  const totalHits = keys.reduce((acc, k) => acc + (data.stats?.[k]?.hits || 0) + (data.stats?.[k]?.posts || 0), 0);
  const topEntry = keys
    .map((k) => ({ key: k, hits: (data.stats?.[k]?.hits || 0) + (data.stats?.[k]?.posts || 0) }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)[0];

  const choose = (key) => {
    setOpen(key);
    setDraft({ ...data.configs[key] });
    setStatus(null);
    setSample(0);
  };
  const close = () => {
    setOpen(null);
    setDraft(null);
  };
  const quickToggle = async (key, nextEnabled) => {
    setTogglingKey(key);
    try {
      const nextBody = { ...data.configs[key], enabled: Boolean(nextEnabled) };
      const res = await api.saveAutomation(guildId, key, nextBody);
      setData((prev) => ({ ...prev, configs: { ...prev.configs, [key]: res.config } }));
      if (open === key) setDraft((prev) => (prev ? { ...res.config } : prev));
    } catch (e) {
      setOpen(key);
      setDraft({ ...data.configs[key], enabled: Boolean(nextEnabled) });
      setStatus(e.code || 'generic');
    } finally {
      setTogglingKey(null);
    }
  };
  const resetStats = async (key) => {
    try {
      const res = await api.resetAutomationStats(guildId, key);
      setData((prev) => ({ ...prev, stats: res.stats, summary: res.summary }));
    } catch (_) {}
  };
  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await api.saveAutomation(guildId, open, draft);
      setData({ ...data, configs: { ...data.configs, [open]: res.config } });
      setDraft({ ...res.config });
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    } finally {
      setSaving(false);
    }
  };

  const def = open && data.schema[open];
  const preview = open && PREVIEWS[open]?.(t, draft, sample);
  const openStats = open ? data.stats?.[open] : null;
  const openHits = (openStats?.hits || 0) + (openStats?.posts || 0);
  const aside = def && (
    <ConfigAside
      icon={ICONS[def.icon] || Sparkles}
      title={t(`auto.${open}.title`)}
      subtitle={t(`auto.group.${def.group}`)}
      onBack={close}
      backLabel={t('auto.back')}
      onSave={save}
      saveLabel={t('auto.save')}
      saving={saving}
      footerNote={
        status && (
          <div className="mb-2" role="status">
            <Notice tone={status === 'ok' ? 'ok' : 'error'}>
              {status === 'ok' ? t('auto.saved') : KNOWN_ERRORS.includes(status) ? t(`auto.error.${status}`) : t('error.generic', { error: status })}
            </Notice>
          </div>
        )
      }
    >
      <p className="text-sm text-white/70">{t(`auto.${open}.desc`)}</p>
      {(openHits > 0 || openStats?.lastAt) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
          <div className="space-y-0.5">
            {openHits > 0 && <p className="font-semibold text-mystic-glow">{metaFor(t, open, openStats)}</p>}
            {openStats?.lastAt && (
              <p className="text-white/50">
                {t('auto.lastTriggered', { date: new Date(openStats.lastAt).toLocaleString() })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => resetStats(open)}
            className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={13} aria-hidden="true" />
            {t('auto.resetStats')}
          </button>
        </div>
      )}
      {preview && (
        <div className="space-y-2">
          <DiscordPreview label={t('auto.preview')} {...preview} />
          {open === 'animator' && (
            <button type="button" onClick={() => setSample(sample + 1)} className="flex min-h-[36px] items-center gap-2 rounded-lg px-2 text-xs font-semibold text-mystic-glow hover:bg-white/5">
              <RefreshCw size={14} aria-hidden="true" />
              {t('auto.otherSample')}
            </button>
          )}
        </div>
      )}
      <SchemaForm t={t} schemaKey={open} fields={def.fields} value={draft} onChange={setDraft} channels={channels} roles={roles} />
      {def.needs.length > 0 && <BotPermissions t={t} guildId={guildId} needs={def.needs} />}
    </ConfigAside>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">{t('auto.intro')}</p>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatTile icon={Sparkles} accent="green" label={t('auto.kpiActive')} value={`${enabledCount} / ${keys.length}`} />
        <StatTile icon={Activity} accent="violet" label={t('auto.kpiTriggers')} value={totalHits.toLocaleString()} />
        <StatTile
          icon={Trophy}
          accent="cyan"
          label={t('auto.kpiTop')}
          value={topEntry ? t(`auto.${topEntry.key}.title`) : '—'}
          hint={topEntry ? t('auto.hits', { n: topEntry.hits }) : null}
        />
      </div>

      <div className="dash-card flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('auto.searchPlaceholder')}
            aria-label={t('auto.searchPlaceholder')}
            className="dash-field min-h-[40px] w-full rounded-xl pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'on', 'off'].map((st) => (
            <button
              key={st}
              type="button"
              aria-pressed={statusFilter === st}
              onClick={() => setStatusFilter(st)}
              className={`min-h-[36px] rounded-xl border px-3 text-xs font-semibold transition ${
                statusFilter === st ? 'border-pyxie-glow bg-pyxie-bright/20 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {t(`auto.filter.${st}`)}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" aria-hidden="true" />
          {['all', ...GROUP_ORDER].map((grp) => (
            <button
              key={grp}
              type="button"
              aria-pressed={groupFilter === grp}
              onClick={() => setGroupFilter(grp)}
              className={`min-h-[36px] rounded-xl border px-3 text-xs font-semibold transition ${
                groupFilter === grp ? 'border-mystic-glow bg-mystic-violet/25 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {grp === 'all' ? t('auto.filter.allGroups') : t(`auto.group.${grp}`)}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <Notice>{t('auto.emptyFilter')}</Notice>
      ) : (
        <HubLayout aside={aside}>
          {groups.map(([g, ks]) => (
            <HubGroup key={g} title={t(`auto.group.${g}`)}>
              {ks.map((k) => {
                const on = data.configs[k].enabled;
                return (
                  <ModuleCard
                    key={k}
                    icon={ICONS[data.schema[k].icon] || Sparkles}
                    title={t(`auto.${k}.title`)}
                    desc={t(`auto.${k}.desc`)}
                    on={on}
                    statusLabel={on ? t('auto.on') : t('auto.off')}
                    meta={metaFor(t, k, data.stats[k])}
                    active={open === k}
                    busy={togglingKey === k}
                    onToggle={(nextOn) => quickToggle(k, nextOn)}
                    onClick={() => choose(k)}
                  />
                );
              })}
            </HubGroup>
          ))}
        </HubLayout>
      )}
    </div>
  );
}
