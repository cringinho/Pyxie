import React from 'react';

// Cartão base do painel: borda neon em degradê; `eyebrow` é a etiqueta pequena acima do título.
export function Card({ title, eyebrow, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`dash-card rounded-2xl p-4 sm:p-5 ${className}`}>
      {(title || eyebrow || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pyxie-bright/25 to-mystic-violet/25 text-pyxie-glow" aria-hidden="true">
                <Icon size={18} />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="truncate font-title text-lg font-bold">{title}</h2>}
              {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-wider text-mystic-glow/80">{eyebrow}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`flex items-center justify-between gap-3 py-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
    </label>
  );
}

export function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pyxie-glow ${
        checked ? 'bg-gradient-to-r from-pyxie-bright to-mystic-violet shadow-[0_0_14px_rgba(236,72,153,0.55)]' : 'bg-white/15'
      }`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
  const styles = {
    primary:
      'bg-gradient-to-r from-pyxie-bright to-mystic-violet text-white shadow-[0_0_18px_rgba(236,72,153,0.35)] hover:shadow-[0_0_26px_rgba(236,72,153,0.55)] hover:brightness-110',
    ghost: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] rounded-xl px-4 text-sm font-semibold transition disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Notice({ children, tone = 'info' }) {
  const tones = {
    info: 'border-mystic-violet/40 bg-mystic-violet/10',
    error: 'border-red-500/40 bg-red-500/10 text-red-200',
    ok: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  };
  return <p className={`rounded-xl border px-3 py-2 text-sm ${tones[tone]}`}>{children}</p>;
}

export function Spinner({ label }) {
  return (
    <p className="flex items-center justify-center gap-2 py-10 text-sm text-white/60" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-pyxie-glow/30 border-t-pyxie-glow motion-reduce:animate-none" aria-hidden="true" />
      {label}
    </p>
  );
}

// Selo de estado (Ligado/Desligado, zona, papel).
export function Badge({ children, tone = 'violet' }) {
  const tones = {
    violet: 'border-mystic-violet/40 bg-mystic-violet/15 text-mystic-glow',
    pink: 'border-pyxie-bright/40 bg-pyxie-bright/15 text-pyxie-glow',
    green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    muted: 'border-white/10 bg-white/5 text-white/60',
    red: 'border-red-400/40 bg-red-400/10 text-red-300',
  };
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function StatusDot({ online }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]'}`}
    />
  );
}

// Número grande em destaque, como os blocos do topo do painel.
export function StatTile({ label, value, icon: Icon, accent = 'pink', hint }) {
  const accents = {
    pink: 'from-pyxie-bright/30 to-pyxie-bright/5 text-pyxie-glow',
    violet: 'from-mystic-violet/30 to-mystic-violet/5 text-mystic-glow',
    cyan: 'from-cyber-cyan/30 to-cyber-cyan/5 text-cyber-cyan',
    green: 'from-cyber-emerald/30 to-cyber-emerald/5 text-emerald-300',
  };
  return (
    <div className="dash-card flex min-w-0 items-center gap-3 rounded-2xl p-3 sm:p-4">
      {Icon && (
        <span className={`hidden h-11 sm:flex w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]}`} aria-hidden="true">
          <Icon size={20} />
        </span>
      )}
      <dl className="min-w-0">
        <dt className="truncate text-xs text-white/60">{label}</dt>
        <dd className="truncate font-title text-base font-bold sm:text-xl">{value}</dd>
        {hint && <dd className="truncate text-[11px] text-white/45">{hint}</dd>}
      </dl>
    </div>
  );
}

export function GuildIcon({ guild, size = 40, className = 'rounded-xl' }) {
  if (guild?.icon) {
    return <img src={guild.icon} alt={guild.name} width={size} height={size} className={className} />;
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-mystic-deep to-pyxie-pink/60 font-bold ${className}`}
    >
      {Array.from((guild?.name || '').replace(/[^\p{L}\p{N}]/gu, ''))[0] || '?'}
    </span>
  );
}

// Seletor múltiplo de canais/cargos com caixas de marcação (funciona bem no toque).
export function MultiSelect({ options, value, onChange, emptyLabel }) {
  if (!options.length) return <p className="text-sm text-white/60">{emptyLabel}</p>;
  const set = new Set(value);
  return (
    <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 p-2">
      {options.map((o) => (
        <label key={o.id} className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-white/5">
          <input
            type="checkbox"
            className="h-4 w-4 accent-pink-500"
            checked={set.has(o.id)}
            onChange={(e) => {
              const next = new Set(set);
              if (e.target.checked) next.add(o.id);
              else next.delete(o.id);
              onChange([...next]);
            }}
          />
          <span className="truncate text-sm">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

// Gaveta lateral de configuração (direita). Fecha com Esc ou tocando fora; o link da página abre ela direto.
export function Drawer({ title, subtitle, onClose, closeLabel, children }) {
  React.useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label={closeLabel} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={title} className="dash-surface absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/10 sm:w-[460px]">
        <header className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
          <div className="min-w-0">
            <h2 className="truncate font-title text-lg font-bold">{title}</h2>
            {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
          </div>
          <button type="button" autoFocus onClick={onClose} aria-label={closeLabel} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-white/10">
            ✕
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}
