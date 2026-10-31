import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from './ui';
import { go } from './Shell';

// Paywall do painel: quando o plano não libera uma seção (ou uma rota devolve 403
// `plan_required`), a pessoa vê o caminho da compra — nunca o erro genérico de API.
// A tela esconde E o backend recusa (AGENTS §10): aqui é só o lado da tela.

/** Servidor do endereço atual (`#/guild/<id>/<seção>`). */
export function guildIdFromHash(hash = typeof window === 'undefined' ? '' : window.location.hash) {
  const match = String(hash || '').match(/#\/guild\/(\d{17,20})/);
  return match ? match[1] : '';
}

/** `plan_required:premium` -> `premium` (só basic/premium têm cadeado). */
export function planFromCode(code) {
  const match = String(code || '').match(/^plan_required:([a-z]+)$/);
  return match && ['basic', 'premium'].includes(match[1]) ? match[1] : '';
}

export default function Paywall({ t, requiredPlan = 'premium', guildId = '', feature = '' }) {
  const plan = ['basic', 'premium'].includes(requiredPlan) ? requiredPlan : 'premium';
  const id = guildId || guildIdFromHash();
  const accent = plan === 'basic' ? 'text-sky-300' : 'text-amber-300';
  return (
    <div className="dash-card space-y-3 rounded-2xl p-5">
      <p className="flex items-center gap-2 font-title text-lg font-bold">
        <Lock size={18} className={accent} aria-hidden="true" />
        {t('plan.lockedTitle')}
      </p>
      <p className="text-sm text-white/70">{t('plan.lockedBody', { plan: t(`plan.tier.${plan}`) })}</p>
      {feature && <p className="text-xs text-white/45">{feature}</p>}
      <div className="flex flex-wrap gap-2">
        {id && <Button onClick={() => go(`#/guild/${id}/planos`)}>{t('plan.lockedGo')}</Button>}
        {id && (
          <Button variant="ghost" onClick={() => go(`#/guild/${id}/overview`)}>
            {t('plan.lockedBack')}
          </Button>
        )}
      </div>
    </div>
  );
}
