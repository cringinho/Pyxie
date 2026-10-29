import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Badge, Button, MultiSelect, Switch } from './ui';

// Kit das telas em "hub": grade de cartões de módulo + painel de configuração à direita
// (fixo ao lado no computador, tela cheia no celular) com rodapé Voltar / Salvar e prévia do Discord.

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

export function ModuleCard({ icon: Icon, emoji, title, desc, on, statusLabel, meta, active, onClick, onToggle, busy }) {
  return (
    <div
      className={`dash-card group flex w-full flex-col gap-2 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:brightness-110 motion-reduce:transform-none ${
        active ? 'ring-2 ring-pyxie-glow/70' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onClick}
          aria-pressed={active}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-pyxie-glow"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? 'bg-gradient-to-br from-pyxie-bright/35 to-mystic-violet/35 text-pyxie-glow' : 'bg-white/5 text-white/50'}`} aria-hidden="true">
            {Icon ? <Icon size={20} /> : <span className="text-xl">{emoji}</span>}
          </span>
          <span className="truncate font-title font-bold">{title}</span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={on ? 'green' : 'muted'}>{statusLabel}</Badge>
          {onToggle && <Switch checked={Boolean(on)} disabled={busy} onChange={(next) => onToggle(next)} label={title} />}
        </div>
      </div>
      <button type="button" onClick={onClick} className="flex flex-1 flex-col gap-1 text-left">
        {desc && <span className="line-clamp-2 text-xs text-white/60">{desc}</span>}
        {meta && <span className="mt-auto block pt-1 text-[11px] text-mystic-glow/80">{meta}</span>}
      </button>
    </div>
  );
}

// children = grade de cartões; aside = painel aberto (ou null).
export function HubLayout({ aside, children }) {
  return (
    <div className={aside ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-4' : ''}>
      <div className={`grid gap-3 sm:grid-cols-2 ${aside ? '' : 'xl:grid-cols-3'}`}>{children}</div>
      {aside}
    </div>
  );
}

export function HubGroup({ title, children }) {
  return (
    <>
      <h3 className="col-span-full mt-2 text-[11px] font-semibold uppercase tracking-wider text-mystic-glow/80">{title}</h3>
      {children}
    </>
  );
}

export function ConfigAside({ icon: Icon, title, subtitle, onBack, backLabel, onSave, saveLabel, saving, saveDisabled = false, footerNote, children }) {
  React.useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);
  return (
    <aside
      aria-label={title}
      className="dash-surface fixed inset-0 z-40 flex flex-col lg:sticky lg:inset-auto lg:top-20 lg:z-auto lg:max-h-[calc(100vh-12rem)] lg:rounded-2xl lg:border lg:border-white/10"
    >
      <header className="flex items-center gap-3 border-b border-white/10 p-4">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pyxie-bright/30 to-mystic-violet/30 text-pyxie-glow" aria-hidden="true">
            <Icon size={20} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate font-title text-lg font-bold">{title}</h2>
          {subtitle && <p className="truncate text-xs text-white/50">{subtitle}</p>}
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
      <footer className="border-t border-white/10 p-3">
        {footerNote}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="flex flex-1 items-center justify-center gap-2">
            <ArrowLeft size={16} aria-hidden="true" />
            {backLabel}
          </Button>
          {onSave && (
            <Button onClick={onSave} disabled={saving || saveDisabled} className="flex flex-[2] items-center justify-center gap-2">
              <Save size={16} aria-hidden="true" />
              {saveLabel}
            </Button>
          )}
        </div>
      </footer>
    </aside>
  );
}

// Markdown mínimo do Discord: ###, >, -# e **negrito**.
function inline(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="rounded bg-black/40 px-1 text-[0.85em]">{part.slice(1, -1)}</code>;
      return part;
    });
}

function DiscordText({ text }) {
  return String(text || '')
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('### ')) return <p key={i} className="mt-1 text-base font-bold">{inline(line.slice(4))}</p>;
      if (line.startsWith('-# ')) return <p key={i} className="text-[11px] text-[#949ba4]">{inline(line.slice(3))}</p>;
      if (line.startsWith('> ')) return <p key={i} className="border-l-4 border-[#4e5058] pl-2">{inline(line.slice(2))}</p>;
      return <p key={i}>{inline(line) || ' '}</p>;
    });
}

// Prévia de mensagem como no Discord. buttons: [{ label, emoji, style: 'primary'|'secondary' }];
// poll: { question, answers }; embed: { color, title, description, footer }; selects: [placeholder].
export function DiscordPreview({ label, author = 'Pyxie', avatar, botTag = 'APP', content, buttons = [], poll, embed, selects = [], moreButtons = 0 }) {
  return (
    <figure>
      {label && <figcaption className="mb-1 text-xs font-semibold text-white/70">{label}</figcaption>}
      <div className="flex gap-3 rounded-xl bg-[#313338] p-3 text-sm text-[#dbdee1]">
        {avatar ? (
          <img src={avatar} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full" />
        ) : (
          <span className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-pyxie-bright to-mystic-violet" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="flex items-center gap-1">
            <span className="font-semibold text-white">{author}</span>
            <span className="rounded bg-[#5865f2] px-1 text-[10px] font-bold text-white">{botTag}</span>
          </p>
          {content && <DiscordText text={content} />}
          {embed && (
            <div className="mt-1 max-w-md space-y-1.5 rounded border-l-4 bg-[#2b2d31] p-3" style={{ borderColor: embed.color || '#ec4899' }}>
              {embed.title && <p className="font-semibold text-white">{embed.title}</p>}
              <div className="space-y-1">
                <DiscordText text={embed.description} />
              </div>
              {embed.footer && <p className="pt-1 text-[11px] text-[#b5bac1]">{embed.footer}</p>}
            </div>
          )}
          {selects.map((placeholder, i) => (
            <p key={i} className="mt-1.5 flex max-w-md items-center justify-between rounded border border-[#1e1f22] bg-[#1e1f22] px-3 py-2 text-[#949ba4]">
              {placeholder}
              <span aria-hidden="true">⌄</span>
            </p>
          ))}
          {poll && (
            <div className="mt-2 max-w-sm space-y-1.5 rounded-lg bg-[#2b2d31] p-3">
              <p className="font-semibold text-white">{poll.question}</p>
              {poll.answers.map((a) => (
                <p key={a} className="rounded-md border border-[#4e5058] px-3 py-1.5">{a}</p>
              ))}
            </div>
          )}
          {buttons.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1.5">
              {buttons.map((b) => (
                <span key={b.label} className={`rounded px-3 py-1.5 text-xs font-medium text-white ${b.style === 'primary' ? 'bg-[#5865f2]' : 'bg-[#4e5058]'}`}>
                  {b.emoji && `${b.emoji} `}
                  {b.label}
                </span>
              ))}
              {moreButtons > 0 && <span className="px-1 py-1.5 text-xs text-[#949ba4]">+{moreButtons}</span>}
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}

// Fora do formulário para o React não recriar o campo (e perder o foco) a cada tecla.
function Wrap({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      {children}
    </label>
  );
}

// Formulário montado pelo esquema das automações. Rótulos: auto.<key>.<campo>[.<opção>].
export function SchemaForm({ t, schemaKey, fields, value, onChange, channels = [], roles = [] }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const label = (f) => t(`auto.${schemaKey}.${f.key}`);
  const text = channels.filter((c) => [0, 5, 15].includes(c.type)).map((c) => ({ id: c.id, label: `# ${c.name}` }));
  const voice = channels.filter((c) => [2, 13].includes(c.type)).map((c) => ({ id: c.id, label: `🔊 ${c.name}` }));
  const roleOpts = roles.filter((r) => !r.managed && r.name !== '@everyone').map((r) => ({ id: r.id, label: r.name }));
  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const v = value[f.key];
        if (f.type === 'toggle') {
          return (
            <div key={f.key} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm font-semibold">{f.key === 'enabled' ? t('auto.enabled') : label(f)}</span>
              <Switch checked={v} onChange={(x) => set(f.key, x)} label={f.key === 'enabled' ? t('auto.enabled') : label(f)} />
            </div>
          );
        }
        if (f.type === 'number') {
          return (
            <Wrap key={f.key} label={label(f)}>
              <input type="number" min={f.min} max={f.max} value={v} onChange={(e) => set(f.key, e.target.value)} className={field} />
              <span className="mt-0.5 block text-[11px] text-white/45">{t('auto.range', { min: f.min, max: f.max })}</span>
            </Wrap>
          );
        }
        if (f.type === 'hour' || f.type === 'select') {
          const opts = f.type === 'hour' ? Array.from({ length: 24 }, (_, h) => [h, `${String(h).padStart(2, '0')}:00`]) : f.options.map((o) => [o, t(`auto.${schemaKey}.${f.key}.${o}`)]);
          return (
            <Wrap key={f.key} label={label(f)}>
              <select value={v} onChange={(e) => set(f.key, f.type === 'hour' ? Number(e.target.value) : e.target.value)} className={field}>
                {opts.map(([o, l]) => (
                  <option key={o} value={o}>{l}</option>
                ))}
              </select>
            </Wrap>
          );
        }
        if (f.type === 'multi') {
          return (
            <fieldset key={f.key}>
              <legend className="mb-1 text-xs font-semibold text-white/70">{label(f)}</legend>
              <div className="flex flex-wrap gap-2">
                {f.options.map((o) => {
                  const on = v.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set(f.key, on ? v.filter((x) => x !== o) : [...v, o])}
                      className={`min-h-[36px] rounded-full border px-3 text-xs font-semibold transition ${on ? 'border-pyxie-glow/60 bg-pyxie-bright/15 text-pyxie-glow' : 'border-white/10 bg-white/5 text-white/60'}`}
                    >
                      {t(`auto.${schemaKey}.${f.key}.${o}`)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        }
        if (f.type === 'channels' || f.type === 'roles') {
          return (
            <fieldset key={f.key}>
              <legend className="mb-1 text-xs font-semibold text-white/70">{label(f)}</legend>
              <MultiSelect options={f.type === 'roles' ? roleOpts : f.kind === 'voice' ? voice : text} value={v} onChange={(x) => set(f.key, x)} emptyLabel={t('auto.none')} />
            </fieldset>
          );
        }
        if (f.type === 'channel' || f.type === 'role') {
          const anyCh = channels.filter((c) => c.type !== 4).map((c) => ({ id: c.id, label: [2, 13].includes(c.type) ? `🔊 ${c.name}` : `# ${c.name}` }));
          const opts = f.type === 'role' ? roleOpts : f.kind === 'voice' ? voice : f.kind === 'any' ? anyCh : text;
          return (
            <Wrap key={f.key} label={label(f)}>
              <select value={v} onChange={(e) => set(f.key, e.target.value)} className={field}>
                <option value="">{t('auto.none')}</option>
                {opts.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </Wrap>
          );
        }
        if (f.type === 'lines') {
          return (
            <Wrap key={f.key} label={label(f)}>
              <textarea rows={4} value={Array.isArray(v) ? v.join('\n') : v} onChange={(e) => set(f.key, e.target.value.split('\n'))} className={`${field} py-2`} />
              <span className="mt-0.5 block text-[11px] text-white/45">{t('auto.linesHint', { max: f.max })}</span>
            </Wrap>
          );
        }
        if (f.type === 'text') {
          return (
            <Wrap key={f.key} label={label(f)}>
              <textarea rows={3} maxLength={f.maxLength} value={v} onChange={(e) => set(f.key, e.target.value)} className={`${field} py-2`} />
            </Wrap>
          );
        }
        if (f.type === 'color') {
          const hex = /^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : f.default || '#8b5cf6';
          const swatches = ['#ec4899', '#8b5cf6', '#38bdf8', '#10b981', '#f59e0b', '#ef4444'];
          return (
            <Wrap key={f.key} label={label(f)}>
              <div className="flex flex-wrap items-center gap-2">
                <input type="color" value={hex} onChange={(e) => set(f.key, e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-1" />
                <code className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/80">{hex}</code>
                <div className="flex items-center gap-1.5">
                  {swatches.map((sw) => (
                    <button
                      key={sw}
                      type="button"
                      aria-label={sw}
                      onClick={() => set(f.key, sw)}
                      style={{ backgroundColor: sw }}
                      className={`h-6 w-6 rounded-full border ${hex.toLowerCase() === sw ? ' scale-110 border-white ring-2 ring-pyxie-glow' : 'border-white/20 opacity-80 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
            </Wrap>
          );
        }
        return null;
      })}
    </div>
  );
}
