import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { api } from './api';
import { Badge, Card, Notice, Spinner } from './ui';

function every(t, e) {
  if (e.hours) return t('agenda.everyHours', { hours: e.hours });
  if (e.daily) return t('agenda.daily', { time: e.daily });
  if (e.afterBump) return t('agenda.afterBump', { hours: e.afterBump });
  if (e.afterJoin) return t('agenda.afterJoin', { hours: e.afterJoin });
  const days = (e.weekdays || []).map((d) => t(`agenda.weekday.${d}`)).join(', ');
  return t('agenda.weekly', { days, hour: `${String(e.hour).padStart(2, '0')}:00` });
}

// Agenda do servidor: o mesmo cálculo do /py-agenda (src/services/guildAgenda.js).
export default function Agenda({ t, guildId, lang }) {
  const [items, setItems] = useState(null);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    api.agenda(guildId).then((d) => setItems(d.agenda)).catch((e) => setError(e.code || 'generic'));
    api.channels(guildId).then((d) => setChannels(d.channels)).catch(() => {});
  }, [guildId]);
  if (!items) return error ? <Notice tone="error">{t('error.generic', { error })}</Notice> : <Spinner label={t('app.loading')} />;

  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const channelName = (id) => channels.find((c) => c.id === id)?.name || id;
  return (
    <Card title={t('agenda.title')} icon={CalendarDays}>
      <p className="mb-3 text-sm text-white/70">{t('agenda.hint')}</p>
      {!items.length && <Notice>{t('agenda.empty')}</Notice>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">
                <span aria-hidden="true">{item.emoji}</span> {t(`agenda.name.${item.id}`)}
              </span>
              <Badge>{new Date(item.nextAt).toLocaleString(locale, { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}</Badge>
            </div>
            <p className="mt-1 text-xs text-white/60">
              #{channelName(item.channelId)} · {every(t, item.every)}
            </p>
            <a href={`#/guild/${guildId}/${item.section}`} className="mt-1 inline-block text-xs font-semibold text-pyxie-glow hover:underline">
              {t('agenda.edit', { section: t(`section.${item.section}`) })}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
