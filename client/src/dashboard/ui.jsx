import React from 'react';

export function Card({ title, children, className = '' }) {
  return (
    <section className={`glass-panel rounded-2xl p-4 sm:p-5 ${className}`}>
      {title && <h2 className="font-title text-lg font-bold mb-3">{title}</h2>}
      {children}
    </section>
  );
}

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`flex items-center justify-between gap-3 py-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-pyxie-pink' : 'bg-white/15'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  );
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
  const styles = {
    primary: 'bg-pyxie-pink hover:bg-pyxie-neon text-white',
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
    <p className="py-8 text-center text-sm text-white/60" role="status">
      {label}
    </p>
  );
}

export function GuildIcon({ guild, size = 40 }) {
  if (guild?.icon) {
    return <img src={guild.icon} alt={guild.name} width={size} height={size} className="rounded-xl" />;
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-xl bg-mystic-deep font-bold"
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
