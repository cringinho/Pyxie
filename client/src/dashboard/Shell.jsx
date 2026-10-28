import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Ban,
  Boxes,
  Coins,
  Bug,
  Hash,
  Ghost,
  Handshake,
  HeartHandshake,
  Image,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MessageSquareText,
  Palette,
  Search,
  Server,
  ShieldAlert,
  ShoppingBag,
  ShieldCheck,
  Smile,
  Sparkles,
  ToggleRight,
  UsersRound,
  Wrench,
  X,
} from 'lucide-react';
import { GuildIcon, StatusDot } from './ui';

const PYXIE_ICON = 'https://cdn.discordapp.com/emojis/1548443951596306552.webp';

export const go = (hash) => {
  window.location.hash = hash;
};

// Ícone e grupo de cada seção. Seção nova sem entrada aqui cai em "Mais" com a chave inglesa.
export const SECTION_META = {
  overview: { icon: LayoutDashboard, group: 'core' },
  studio: { icon: MessageSquareText, group: 'messages' },
  embeds: { icon: Palette, group: 'messages' },
  features: { icon: ToggleRight, group: 'config' },
  channels: { icon: Hash, group: 'config' },
  roles: { icon: UsersRound, group: 'config' },
  access: { icon: KeyRound, group: 'config' },
  security: { icon: ShieldAlert, group: 'safety' },
  moderation: { icon: ShieldCheck, group: 'safety' },
  community: { icon: HeartHandshake, group: 'safety' },
  seasonal: { icon: Ghost, group: 'more' },
  partnerships: { icon: Handshake, group: 'more' },
  tools: { icon: Wrench, group: 'more' },
  health: { icon: Activity, group: 'system' },
  servers: { icon: Server, group: 'system' },
  trust: { icon: Ban, group: 'system' },
  economy: { icon: Coins, group: 'system' },
  errors: { icon: Bug, group: 'system' },
  modules: { icon: Boxes, group: 'system' },
  links: { icon: Link2, group: 'content' },
  assets: { icon: Image, group: 'content' },
  museum: { icon: Landmark, group: 'content' },
  shopee: { icon: ShoppingBag, group: 'content' },
  emojis: { icon: Smile, group: 'content' },
};

const GROUP_ORDER = ['core', 'messages', 'config', 'safety', 'system', 'content', 'more'];

export function sectionIcon(id) {
  return SECTION_META[id]?.icon || Wrench;
}

// Agrupa as seções liberadas para a barra lateral, na ordem fixa dos grupos.
export function buildNav(t, ids, active, hrefFor) {
  const groups = new Map();
  for (const id of ids) {
    const group = SECTION_META[id]?.group || 'more';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push({ id, label: t(`section.${id}`), icon: sectionIcon(id), href: hrefFor(id), active: id === active });
  }
  return GROUP_ORDER.filter((g) => groups.has(g)).map((g) => ({ id: g, label: t(`nav.group.${g}`), items: groups.get(g) }));
}

// Céu estrelado de fundo. Posições fixas (semente) para não "pular" a cada renderização.
export function Starfield() {
  const stars = useMemo(() => {
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: 70 }, () => ({
      top: `${rand() * 100}%`,
      left: `${rand() * 100}%`,
      size: rand() < 0.85 ? 1.5 : 2.5,
      delay: `${(rand() * 4).toFixed(2)}s`,
    }));
  }, []);
  const sparkles = [
    { top: '12%', left: '78%', color: '#F472B6', size: 18, delay: '0s', glyph: '✦' },
    { top: '68%', left: '6%', color: '#C084FC', size: 14, delay: '2s', glyph: '✧' },
    { top: '84%', left: '88%', color: '#38BDF8', size: 12, delay: '4s', glyph: '✦' },
    { top: '34%', left: '46%', color: '#F472B6', size: 10, delay: '6s', glyph: '✧' },
    { top: '6%', left: '22%', color: '#FBBF24', size: 16, delay: '3s', glyph: '☾' },
  ];
  return (
    <div className="dash-sky pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="dash-star" style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }} />
      ))}
      {sparkles.map((s, i) => (
        <span key={i} className="dash-sparkle" style={{ top: s.top, left: s.left, color: s.color, fontSize: s.size, animationDelay: s.delay }}>
          {s.glyph}
        </span>
      ))}
    </div>
  );
}

// Trilha de servidores à esquerda, no estilo do Discord.
function ServerRail({ t, me, activeGuildId, globalActive, onNavigate }) {
  const item = (key, active, label, onClick, child) => (
    <li key={key} className="relative flex justify-center">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-pyxie-glow transition-all ${active ? 'h-8' : 'h-0'}`}
      />
      <button
        type="button"
        onClick={() => {
          onClick();
          onNavigate?.();
        }}
        title={label}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`flex h-12 w-12 items-center justify-center overflow-hidden transition-all ${
          active ? 'rounded-2xl shadow-[0_0_16px_rgba(236,72,153,0.55)] ring-2 ring-pyxie-glow/70' : 'rounded-3xl hover:rounded-2xl'
        }`}
      >
        {child}
      </button>
    </li>
  );
  return (
    <nav aria-label={t('picker.title')} className="flex w-[72px] shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-white/5 bg-black/30 py-3">
      <ul className="flex flex-col gap-2">
        {item('home', !activeGuildId && !globalActive, t('nav.home'), () => go('#/'), (
          <img src={PYXIE_ICON} alt="" width="48" height="48" className="h-12 w-12 bg-mystic-deep/60 object-contain p-1.5" />
        ))}
        {me?.user?.isOwner &&
          item('global', globalActive, t('picker.global'), () => go('#/global/health'), (
            <span className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-pyxie-bright to-mystic-violet">
              <Sparkles size={20} aria-hidden="true" />
            </span>
          ))}
      </ul>
      <span className="my-1 h-px w-8 bg-white/10" aria-hidden="true" />
      <ul className="flex flex-col gap-2">
        {(me?.guilds || []).map((g) =>
          item(g.id, g.id === activeGuildId, g.name, () => go(`#/guild/${g.id}/overview`), <GuildIcon guild={g} size={48} className="rounded-none" />)
        )}
      </ul>
    </nav>
  );
}

function SideNav({ title, subtitle, groups, onNavigate }) {
  return (
    <div className="flex w-60 shrink-0 flex-col overflow-y-auto px-3 py-4">
      <div className="mb-4 pl-2 pr-10 lg:pr-2">
        <p className="truncate font-title text-base font-bold">{title}</p>
        {subtitle && <p className="truncate text-xs text-white/50">{subtitle}</p>}
      </div>
      <nav aria-label={title} className="space-y-5">
        {groups.map((g) => (
          <div key={g.id}>
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.icon;
                return (
                  <li key={it.id}>
                    <a
                      href={it.href}
                      onClick={onNavigate}
                      aria-current={it.active ? 'page' : undefined}
                      className={`flex min-h-[40px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                        it.active
                          ? 'bg-gradient-to-r from-pyxie-bright/25 to-mystic-violet/15 text-white shadow-[inset_2px_0_0_#F472B6]'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={17} aria-hidden="true" className={it.active ? 'text-pyxie-glow' : ''} />
                      <span className="truncate">{it.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

// Busca rápida (Ctrl/⌘ + K): pula para uma seção ou servidor.
function CommandPalette({ t, open, onClose, entries }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setIndex(0);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? entries.filter((e) => `${e.label} ${e.hint || ''}`.toLowerCase().includes(q)) : entries;
  }, [entries, query]);

  if (!open) return null;

  const pick = (entry) => {
    onClose();
    go(entry.href);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[index]) pick(results[index]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t('search.open')} className="dash-card w-full max-w-lg overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search size={18} className="text-white/50" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            className="min-h-[52px] flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2" role="listbox" aria-label={t('search.open')}>
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-white/50">{t('search.empty')}</li>}
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <li key={r.key} role="option" aria-selected={i === index}>
                <button
                  type="button"
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => pick(r)}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${i === index ? 'bg-gradient-to-r from-pyxie-bright/25 to-mystic-violet/15' : ''}`}
                >
                  {r.guild ? <GuildIcon guild={r.guild} size={24} className="rounded-lg" /> : Icon && <Icon size={18} aria-hidden="true" className="text-pyxie-glow" />}
                  <span className="min-w-0 flex-1 truncate">{r.label}</span>
                  {r.hint && <span className="shrink-0 text-xs text-white/40">{r.hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-white/10 px-4 py-2 text-[11px] text-white/40">{t('search.hint')}</p>
      </div>
    </div>
  );
}

// Moldura do painel: trilha de servidores + menu de seções (gaveta no celular) + barra do topo.
export function Layout({ t, lang, setLang, me, onLogout, nav, crumbs, activeGuildId, globalActive, children }) {
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const entries = useMemo(() => {
    const list = [];
    for (const g of nav.groups) for (const it of g.items) list.push({ key: `s:${it.id}`, label: it.label, hint: g.label, icon: it.icon, href: it.href });
    if (me?.user?.isOwner) list.push({ key: 'global', label: t('picker.global'), icon: Sparkles, href: '#/global/health' });
    for (const g of me?.guilds || []) list.push({ key: `g:${g.id}`, label: g.name, hint: t('search.servers'), guild: g, href: `#/guild/${g.id}/overview` });
    return list;
  }, [nav, me, t]);

  const side = (onNavigate) => (
    <>
      <ServerRail t={t} me={me} activeGuildId={activeGuildId} globalActive={globalActive} onNavigate={onNavigate} />
      <SideNav title={nav.title} subtitle={nav.subtitle} groups={nav.groups} onNavigate={onNavigate} />
    </>
  );

  const user = me?.user;
  return (
    <div className="min-h-screen">
      <Starfield />
      <aside className="dash-surface fixed inset-y-0 left-0 z-30 hidden border-r border-white/5 lg:flex">{side()}</aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label={t('nav.close')} className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <aside className="dash-surface absolute inset-y-0 left-0 flex max-w-[90vw] border-r border-white/10">
            {side(() => setDrawer(false))}
            <button
              type="button"
              aria-label={t('nav.close')}
              onClick={() => setDrawer(false)}
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-[312px]">
        <header className="dash-surface sticky top-0 z-20 flex min-h-[60px] items-center gap-2 border-b border-white/5 px-3 sm:px-5">
          <button
            type="button"
            aria-label={t('nav.menu')}
            onClick={() => setDrawer(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-white/10 lg:hidden"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <ol className="hidden min-w-0 items-center gap-2 text-sm text-white/50 md:flex">
            {crumbs.map((c, i) => (
              <li key={i} className="flex min-w-0 items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {c.href ? (
                  <a href={c.href} className="truncate hover:text-white">
                    {c.label}
                  </a>
                ) : (
                  <span className="truncate font-semibold text-white">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
          <span className="truncate font-title font-bold md:hidden">{crumbs[crumbs.length - 1]?.label}</span>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-label={t('search.open')}
              className="dash-field flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-white/50 hover:text-white"
            >
              <Search size={16} aria-hidden="true" />
              <span className="hidden xl:inline">{t('search.open')}</span>
              <kbd className="hidden rounded border border-white/15 px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
            </button>
            {me && (
              <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold sm:flex">
                <StatusDot online={me.botOnline} />
                {t(me.botOnline ? 'status.online' : 'status.offline')}
              </span>
            )}
            <button type="button" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} className="h-10 rounded-xl px-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
              {t('app.lang')}
            </button>
            {user && (
              <>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.globalName || user.username} width="36" height="36" className="h-9 w-9 rounded-full ring-2 ring-pyxie-glow/60" />
                ) : (
                  <GuildIcon guild={{ name: user.globalName || user.username }} size={36} className="rounded-full" />
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label={t('app.logout')}
                  title={t('app.logout')}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <LogOut size={18} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">{children}</main>
      </div>

      <CommandPalette t={t} open={palette} onClose={() => setPalette(false)} entries={entries} />
    </div>
  );
}
