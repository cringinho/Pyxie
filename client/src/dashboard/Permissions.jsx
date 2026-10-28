import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from './api';
import { Card } from './ui';

// Lista o que a Pyxie precisa em cada tela e confere ao vivo se ela tem (cargo da Pyxie no servidor).
// needs: [{ perm: 'ManageMessages', why: 'perm.why.deleteLinks' }]
export default function BotPermissions({ t, guildId, needs }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    api.botPermissions(guildId).then(setState).catch(() => setState({ error: true }));
  }, [guildId]);

  const missing = state?.permissions ? needs.filter((n) => !state.permissions[n.perm]).length : 0;
  return (
    <Card title={t('perm.title')} eyebrow={state?.permissions ? (missing ? t('perm.missingCount', { count: missing }) : t('perm.allOk')) : null}>
      <ul className="space-y-2">
        {needs.map((n) => {
          const has = state?.permissions?.[n.perm];
          return (
            <li key={n.perm + n.why} className="flex items-start gap-3 text-sm">
              {state?.permissions ? (
                has ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-label={t('perm.ok')} />
                ) : (
                  <XCircle size={18} className="mt-0.5 shrink-0 text-red-300" aria-label={t('perm.missing')} />
                )
              ) : (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-white/30" aria-hidden="true" />
              )}
              <span>
                <strong className="font-semibold">{t(`perm.name.${n.perm}`)}</strong>
                <span className="block text-white/60">{t(n.why)}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-white/50">{state?.error ? t('perm.unknown') : t('perm.hint', { role: state?.roleName || 'Pyxie' })}</p>
    </Card>
  );
}
