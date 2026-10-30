import React, { useEffect, useState } from 'react';
import { CalendarClock, Moon, Rocket } from 'lucide-react';
import { api } from './api';
import { Button, Card, MultiSelect, Notice, Spinner, Toggle } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const select = `${field} bg-[#160d2a]`;

function ChannelSelect({ label, value, channels, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={select}>
        <option value="">—</option>
        {channels.map((c) => (
          <option key={c.id} value={c.id}>
            #{c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

// Mensagens periódicas: guia de apoio (bump) e anúncio diário do tarot, por servidor.
export default function Periodic({ t, guildId, lang }) {
  const [cfg, setCfg] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState(null);
  useEffect(() => {
    api.periodic(guildId).then((d) => setCfg(d.periodic)).catch((e) => setStatus(e.code || 'generic'));
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles.filter((r) => !r.managed))).catch(() => {});
  }, [guildId]);
  if (!cfg) return status ? <Notice tone="error">{t('error.generic', { error: status })}</Notice> : <Spinner label={t('app.loading')} />;

  const bump = (patch) => setCfg({ ...cfg, bumpGuide: { ...cfg.bumpGuide, ...patch } });
  const tarot = (patch) => setCfg({ ...cfg, tarot: { ...cfg.tarot, ...patch } });
  const toggleSite = (s) => bump({ sites: cfg.bumpGuide.sites.includes(s) ? cfg.bumpGuide.sites.filter((x) => x !== s) : [...cfg.bumpGuide.sites, s] });
  const save = async () => {
    setStatus(null);
    try {
      const res = await api.savePeriodic(guildId, { bumpGuide: cfg.bumpGuide, tarot: cfg.tarot, tarotChannelId: cfg.tarotChannelId });
      setCfg(res.periodic);
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };
  const known = status && status !== 'ok' ? t(`error.${status}`) : '';

  return (
    <div className="space-y-4">
      <Card title={t('periodic.bump.title')} icon={Rocket}>
        <p className="mb-3 text-sm text-white/70">{t('periodic.bump.hint')}</p>
        <div className="space-y-3">
          <Toggle label={t('periodic.bump.on')} checked={cfg.bumpGuide.enabled} onChange={(v) => bump({ enabled: v })} />
          <ChannelSelect label={t('periodic.channel')} value={cfg.bumpGuide.channelId} channels={channels} onChange={(v) => bump({ channelId: v })} />
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.bump.interval')}</span>
              <input type="number" min={2} max={72} value={cfg.bumpGuide.intervalHours} onChange={(e) => bump({ intervalHours: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.bump.color')}</span>
              <input type="color" value={cfg.bumpGuide.color || '#FF2A85'} onChange={(e) => bump({ color: e.target.value })} className={`${field} p-1`} />
            </label>
            <div>
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.bump.pingRole')}</span>
              <MultiSelect
                options={roles.map((r) => ({ id: r.id, label: r.name }))}
                value={cfg.bumpGuide.pingRoleIds || (cfg.bumpGuide.pingRoleId ? [cfg.bumpGuide.pingRoleId] : [])}
                emptyLabel={t('app.loading')}
                onChange={(v) => bump({ pingRoleIds: v, pingRoleId: v[0] || '' })}
              />
            </div>
          </div>
          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-white/70">{t('periodic.bump.sites')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {cfg.sites.map((s) => (
                <Toggle key={s} label={t(`periodic.site.${s}`)} checked={cfg.bumpGuide.sites.includes(s)} onChange={() => toggleSite(s)} />
              ))}
            </div>
          </fieldset>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.bump.customTitle')}</span>
              <input value={cfg.bumpGuide.customTitle || ''} maxLength={120} onChange={(e) => bump({ customTitle: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.bump.customFooter')}</span>
              <input value={cfg.bumpGuide.customFooter || ''} maxLength={120} onChange={(e) => bump({ customFooter: e.target.value })} className={field} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.bump.customIntro')}</span>
            <input value={cfg.bumpGuide.customIntro || ''} maxLength={400} onChange={(e) => bump({ customIntro: e.target.value })} className={field} />
          </label>
          {cfg.lastBumpGuideAt && <p className="text-xs text-white/50">{t('periodic.bump.last', { date: new Date(cfg.lastBumpGuideAt).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR') })}</p>}
        </div>
      </Card>

      <Card title={t('periodic.tarot.title')} icon={Moon}>
        <p className="mb-3 text-sm text-white/70">{t('periodic.tarot.hint')}</p>
        <div className="space-y-3">
          <Toggle label={t('periodic.tarot.on')} checked={cfg.tarot.enabled} onChange={(v) => tarot({ enabled: v })} />
          <ChannelSelect label={t('periodic.channel')} value={cfg.tarotChannelId} channels={channels} onChange={(v) => setCfg({ ...cfg, tarotChannelId: v })} />
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.tarot.role')}</span>
              <select value={cfg.tarot.roleId} onChange={(e) => tarot({ roleId: e.target.value })} className={select}>
                <option value="">{t('periodic.tarot.noRole')}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    @{r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.tarot.hour')}</span>
              <input type="number" min={0} max={23} value={cfg.tarot.hour ?? 0} onChange={(e) => tarot({ hour: Number(e.target.value) })} className={field} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('periodic.tarot.customGreeting')}</span>
            <input value={cfg.tarot.customGreeting || ''} maxLength={300} onChange={(e) => tarot({ customGreeting: e.target.value })} className={field} />
          </label>
          {cfg.tarot.credit && <p className="text-xs text-white/50">{t('periodic.tarot.credit')}</p>}
        </div>
      </Card>

      <Card title={t('periodic.more.title')} icon={CalendarClock}>
        <p className="text-sm text-white/70">{t('periodic.more.hint')}</p>
      </Card>

      {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
      {known && <Notice tone="error">{known.startsWith('error.') ? t('error.generic', { error: status }) : known}</Notice>}
      <Button className="w-full" onClick={save}>
        {t('features.save')}
      </Button>
    </div>
  );
}
