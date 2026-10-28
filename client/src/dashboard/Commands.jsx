import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { Badge, Notice, Spinner } from './ui';

const CRINGELANDIA = '1453890868980482090';
const MARY = '1557399041443111025';
const CATEGORY_ORDER = ['economia', 'tarot', 'social', 'utilidades'];
const STATUS_TONE = { on: 'green', module_off: 'muted', disabled: 'muted', classic: 'muted', route: 'violet', channel: 'violet' };

function scopeLabel(t, scope) {
  if (!scope.length) return t('cmds.scope.all');
  return scope.map((id) => (id === CRINGELANDIA ? t('zone.cringelandia') : id === MARY ? t('zone.mary') : id)).join(', ');
}

// Lista de comandos: num servidor (o que vale ali e por quê) ou na área global (todos, com escopo).
export default function Commands({ t, lang, guildId = null }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState({});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = guildId ? api.guildCommands(guildId) : api.allCommands();
    load.then((d) => setList(d.commands)).catch((e) => setError(e.code || 'generic'));
    if (guildId) api.channels(guildId).then((d) => setChannels(Object.fromEntries(d.channels.map((c) => [c.id, c.name])))).catch(() => {});
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
