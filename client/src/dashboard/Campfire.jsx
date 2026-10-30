import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { api } from './api';
import { Button, Card, MultiSelect, Notice, Spinner, Toggle } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';

// Fogueira de voz: convite discreto quando uma call pública fica animada.
export default function Campfire({ t, guildId }) {
  const [cfg, setCfg] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState(null);
  useEffect(() => {
    api.campfire(guildId).then((d) => setCfg(d.campfire)).catch((e) => setStatus(e.code || 'generic'));
    api.channels(guildId).then((d) => setChannels(d.channels)).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles.filter((r) => !r.managed))).catch(() => {});
  }, [guildId]);
  if (!cfg) return status ? <Notice tone="error">{t('error.generic', { error: status })}</Notice> : <Spinner label={t('app.loading')} />;

  const text = channels.filter((c) => [0, 5].includes(c.type));
  const voice = channels.filter((c) => [2, 13].includes(c.type)).map((c) => ({ id: c.id, label: `🔊 ${c.name}` }));
  const num = (key, min, max) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{t(`campfire.${key}`)}</span>
      <input type="number" min={min} max={max} value={cfg[key]} onChange={(e) => setCfg({ ...cfg, [key]: e.target.value })} className={field} />
    </label>
  );
  const save = async () => {
    setStatus(null);
    try {
      const res = await api.saveCampfire(guildId, cfg);
      setCfg(res.campfire);
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };

  return (
    <Card title={t('campfire.title')} icon={Flame}>
      <p className="mb-3 text-sm text-white/70">{t('campfire.hint')}</p>
      <div className="space-y-3">
        <Toggle label={t('campfire.on')} checked={cfg.enabled} onChange={(v) => setCfg({ ...cfg, enabled: v })} />
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('campfire.channel')}</span>
            <select value={cfg.channelId} onChange={(e) => setCfg({ ...cfg, channelId: e.target.value })} className={`${field} bg-[#160d2a]`}>
              <option value="">—</option>
              {text.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('campfire.pingRole')}</span>
            <MultiSelect
              options={roles.map((r) => ({ id: r.id, label: r.name }))}
              value={cfg.pingRoleIds || (cfg.pingRoleId ? [cfg.pingRoleId] : [])}
              emptyLabel={t('app.loading')}
              onChange={(v) => setCfg({ ...cfg, pingRoleIds: v, pingRoleId: v[0] || '' })}
            />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('campfire.color')}</span>
            <input type="color" value={cfg.color || '#FF2A85'} onChange={(e) => setCfg({ ...cfg, color: e.target.value })} className={`${field} p-1`} />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {num('minPeople', 3, 50)}
          {num('minMinutes', 5, 120)}
          {num('cooldownMinutes', 30, 1440)}
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/70">{t('campfire.customMessage')}</span>
          <input value={cfg.customMessage || ''} maxLength={300} onChange={(e) => setCfg({ ...cfg, customMessage: e.target.value })} className={field} />
        </label>
        <Toggle label={t('campfire.autoDeleteWhenEmpty')} checked={cfg.autoDeleteWhenEmpty !== false} onChange={(v) => setCfg({ ...cfg, autoDeleteWhenEmpty: v })} />
        <span className="block text-xs font-semibold text-white/70">{t('campfire.exclude')}</span>
        <MultiSelect options={voice} value={cfg.excludedChannelIds} emptyLabel={t('channels.empty')} onChange={(v) => setCfg({ ...cfg, excludedChannelIds: v })} />
        <p className="text-xs text-white/50">{t('campfire.privacy')}</p>
        {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
        {status && status !== 'ok' && <Notice tone="error">{t('error.generic', { error: status })}</Notice>}
        <Button className="w-full" onClick={save}>
          {t('features.save')}
        </Button>
      </div>
    </Card>
  );
}
