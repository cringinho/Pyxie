import React, { useEffect, useState } from 'react';
import { DoorOpen, Flower2, HeartHandshake } from 'lucide-react';
import { api } from './api';
import { Button, Card, Notice, Spinner, Toggle } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const select = `${field} bg-[#160d2a]`;

function Labeled({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/50">{hint}</span>}
    </label>
  );
}

function Picker({ value, onChange, items, prefix, empty }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={select}>
      <option value="">{empty}</option>
      {items.map((i) => (
        <option key={i.id} value={i.id}>
          {prefix}
          {i.name}
        </option>
      ))}
    </select>
  );
}

// Acolhimento inicial: boas-vindas de quem chega, abraço de 24h e pacote de bem-estar (lembretes, AFK e aniversários).
export default function Welcome({ t, guildId }) {
  const [cfg, setCfg] = useState(null);
  const [wb, setWb] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState(null);
  useEffect(() => {
    api.welcome(guildId).then((d) => setCfg(d.welcome)).catch((e) => setStatus(e.code || 'generic'));
    api.wellbeing(guildId).then((d) => setWb(d.wellbeing)).catch(() => {});
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles.filter((r) => !r.managed))).catch(() => {});
  }, [guildId]);
  if (!cfg) return status ? <Notice tone="error">{t('error.generic', { error: status })}</Notice> : <Spinner label={t('app.loading')} />;

  const set = (patch) => setCfg({ ...cfg, ...patch });
  const setCheckin = (patch) => setCfg({ ...cfg, checkin: { ...cfg.checkin, ...patch } });
  const none = t('welcome.none');
  const channelPicker = (key) => <Picker value={cfg[key]} onChange={(v) => set({ [key]: v })} items={channels} prefix="#" empty={none} />;
  const save = async () => {
    setStatus(null);
    try {
      const res = await api.saveWelcome(guildId, cfg);
      setCfg(res.welcome);
      if (wb) {
        const wRes = await api.saveWellbeing(guildId, wb);
        setWb(wRes.wellbeing);
      }
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    }
  };
  const known = status && status !== 'ok' ? t(`error.${status}`) : '';

  return (
    <div className="space-y-4">
      <Card title={t('welcome.title')} icon={DoorOpen}>
        <p className="mb-3 text-sm text-white/70">{t('welcome.hint')}</p>
        <div className="space-y-3">
          <Toggle label={t('welcome.on')} checked={cfg.enabled} onChange={(v) => set({ enabled: v })} />
          <Labeled label={t('welcome.channel')}>{channelPicker('channelId')}</Labeled>
          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-white/70">{t('welcome.layout')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {['guide', 'custom'].map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={cfg.layout === l}
                  onClick={() => set({ layout: l })}
                  className={`rounded-xl border p-3 text-left text-sm ${cfg.layout === l ? 'border-pyxie-glow bg-pyxie-bright/15' : 'border-white/10 bg-white/5'}`}
                >
                  <span className="block font-semibold">{t(`welcome.layout.${l}`)}</span>
                  <span className="block text-xs text-white/60">{t(`welcome.layoutHint.${l}`)}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <Labeled label={t('welcome.pingRole')} hint={t('welcome.pingRoleHint')}>
            <Picker value={cfg.pingRoleId} onChange={(v) => set({ pingRoleId: v })} items={roles} prefix="@" empty={t('welcome.noPing')} />
          </Labeled>

          {cfg.layout === 'guide' ? (
            <>
              <Labeled label={t('welcome.rules')}>{channelPicker('rulesChannelId')}</Labeled>
              <Labeled label={t('welcome.guides')}>{channelPicker('guidesChannelId')}</Labeled>
              <Labeled label={t('welcome.roles')}>{channelPicker('rolesChannelId')}</Labeled>
              <Labeled label={t('welcome.image')}>
                <input type="url" value={cfg.guideImageUrl} onChange={(e) => set({ guideImageUrl: e.target.value })} placeholder="https://" className={field} />
              </Labeled>
            </>
          ) : (
            <>
              <Labeled label={t('welcome.msgTitle')}>
                <input value={cfg.title} maxLength={256} onChange={(e) => set({ title: e.target.value })} placeholder={t('welcome.defaultText')} className={field} />
              </Labeled>
              <Labeled label={t('welcome.msgText')} hint={t('welcome.vars')}>
                <textarea value={cfg.description} maxLength={2000} rows={4} onChange={(e) => set({ description: e.target.value })} placeholder={t('welcome.defaultText')} className={`${field} py-2`} />
              </Labeled>
              <div className="grid grid-cols-2 gap-2">
                <Labeled label={t('welcome.color')}>
                  <input type="color" value={cfg.color} onChange={(e) => set({ color: e.target.value })} className={`${field} p-1`} />
                </Labeled>
                <Labeled label={t('welcome.reactions')}>
                  <input value={cfg.autoReactions.join(' ')} onChange={(e) => set({ autoReactions: e.target.value.split(/\s+/).filter(Boolean).slice(0, 5) })} className={field} />
                </Labeled>
              </div>
              <Labeled label={t('welcome.image')}>
                <input type="url" value={cfg.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://" className={field} />
              </Labeled>
            </>
          )}

          <Labeled label={t('welcome.autoRole')} hint={t('welcome.autoRoleHint')}>
            <Picker value={cfg.autoRoleId} onChange={(v) => set({ autoRoleId: v })} items={roles.filter((r) => r.assignable !== false)} prefix="@" empty={none} />
          </Labeled>
          <p className="text-xs text-white/50">{t('welcome.discordToo')}</p>
        </div>
      </Card>

      <Card title={t('welcome.checkin.title')} icon={Flower2}>
        <p className="mb-3 text-sm text-white/70">{t('welcome.checkin.hint')}</p>
        <div className="space-y-3">
          <Toggle label={t('welcome.checkin.on')} checked={cfg.checkin.enabled} onChange={(v) => setCheckin({ enabled: v })} />
          <Labeled label={t('welcome.channel')}>
            <Picker value={cfg.checkin.channelId} onChange={(v) => setCheckin({ channelId: v })} items={channels} prefix="#" empty={none} />
          </Labeled>
          <Labeled label={t('welcome.checkin.silent')} hint={t('welcome.checkin.silentHint')}>
            <Picker value={cfg.checkin.silentRoleId} onChange={(v) => setCheckin({ silentRoleId: v })} items={roles} prefix="@" empty={none} />
          </Labeled>
        </div>
      </Card>

      {wb && (
        <Card title={t('welcome.wb.title')} icon={HeartHandshake}>
          <p className="mb-3 text-sm text-white/70">{t('welcome.wb.hint')}</p>
          <div className="space-y-3">
            <Toggle label={t('welcome.wb.reminders')} checked={wb.remindersEnabled !== false} onChange={(v) => setWb({ ...wb, remindersEnabled: v })} />
            <Toggle label={t('welcome.wb.afk')} checked={wb.afkEnabled !== false} onChange={(v) => setWb({ ...wb, afkEnabled: v })} />
            <Toggle label={t('welcome.wb.birthdays')} checked={wb.birthdaysEnabled !== false} onChange={(v) => setWb({ ...wb, birthdaysEnabled: v })} />
            <Labeled label={t('welcome.wb.bdayChannel')}>
              <Picker value={wb.birthdayChannelId || ''} onChange={(v) => setWb({ ...wb, birthdayChannelId: v })} items={channels} prefix="#" empty={none} />
            </Labeled>
            <Labeled label={t('welcome.wb.bdayRole')}>
              <Picker value={wb.birthdayRoleId || ''} onChange={(v) => setWb({ ...wb, birthdayRoleId: v })} items={roles.filter((r) => r.assignable !== false)} prefix="@" empty={none} />
            </Labeled>
          </div>
        </Card>
      )}

      {status === 'ok' && <Notice tone="ok">{t('features.saved')}</Notice>}
      {known && <Notice tone="error">{known.startsWith('error.') ? t('error.generic', { error: status }) : known}</Notice>}
      <Button className="w-full" onClick={save}>
        {t('features.save')}
      </Button>
    </div>
  );
}
