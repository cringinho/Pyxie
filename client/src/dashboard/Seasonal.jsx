import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { Button, Card, MemberChip, Notice, Spinner, Toggle, useMemberLookup } from './ui';
import { apiErrorText, errorText } from './i18n';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const area = 'dash-field w-full rounded-xl p-3 text-sm';
const TEMPLATES = ['announcementText', 'dropEmbedFooter', 'artOfWeekWinner', 'infoEventTitle', 'infoEventDescription', 'infoEventRules', 'infoEventExtra'];

// ISO com fuso (-03:00) ↔ campo datetime-local.
const toLocal = (iso) => (iso ? String(iso).slice(0, 16) : '');
const fromLocal = (v) => (v ? `${v}:59-03:00` : '');

// Evento sazonal da Cringelândia (era o /admin/sazonal), com as APIs que já existiam.
export default function Seasonal({ t, guildId }) {
  const [cfg, setCfg] = useState(null);
  const [drops, setDrops] = useState(null);
  const [restr, setRestr] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [broadcast, setBroadcast] = useState(false);
  const [newUser, setNewUser] = useState('');
  const [resetId, setResetId] = useState('');
  const excludedNames = useMemberLookup(guildId, restr?.excludedUserIds || []);
  // Mesma regra do backend: ID do Discord tem 17 a 20 números (Q142).
  const isId = (v) => /^\d{17,20}$/.test(v);
  const resetInfo = useMemberLookup(guildId, isId(resetId) ? [resetId] : []).get(resetId);

  const load = useCallback(() => {
    api
      .seasonalConfig()
      .then((d) => {
        const e = d.config.assets?.emojis || {};
        setCfg({ ...d.config, decoysText: (e.dropDecoys || []).map((x) => `${x.id} | ${x.label}`).join('\n'), artText: (e.artOfWeek || []).join('\n') });
      })
      .catch((e) => setError(e.code || 'generic'));
    api.seasonalDrops().then(setDrops).catch(() => {});
    api.seasonalRestrictions().then((d) => setRestr(d.restrictions)).catch(() => {});
  }, []);
  useEffect(() => {
    load();
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles)).catch(() => {});
  }, [guildId, load]);

  if (error) return <Notice tone="error">{errorText(t, error)}</Notice>;
  if (!cfg) return <Spinner label={t('app.loading')} />;

  const run = async (fn, okKey) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      setNotice({ tone: 'ok', text: t(okKey) });
      load();
    } catch (e) {
      // Código conhecido vira texto em PT/EN; mensagem antiga do backend (só PT) só aparece em PT (Q154).
      setNotice({ tone: 'error', text: apiErrorText(t, e) });
    }
    setBusy(false);
  };

  const set = (path, value) => {
    const [a, b] = path.split('.');
    setCfg(b ? { ...cfg, [a]: { ...cfg[a], [b]: value } } : { ...cfg, [a]: value });
  };
  const save = () =>
    run(
      () =>
        api.saveSeasonalConfig({
          eventName: cfg.eventName,
          currencyName: cfg.currencyName,
          channels: cfg.channels,
          dates: cfg.dates,
          prizes: cfg.prizes,
          templates: cfg.templates,
          assets: {
            chestImageUrl: cfg.assets?.chestImageUrl || '',
            emojis: {
              currency: cfg.assets?.emojis?.currency || '',
              dropDecoys: cfg.decoysText
                .split('\n')
                .map((l) => l.split('|').map((x) => x.trim()))
                .filter(([id]) => id)
                .map(([id, label]) => ({ id, label: label || id })),
              artOfWeek: cfg.artText.split(/\s+/).filter(Boolean),
            },
          },
        }),
      'features.saved'
    );

  const channelSelect = (key) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{t(`seasonal.ch.${key}`)}</span>
      <select value={cfg.channels?.[key] || ''} onChange={(e) => set(`channels.${key}`, e.target.value)} className={`${field} bg-[#160d2a]`}>
        <option value="">—</option>
        {channels.map((c) => (
          <option key={c.id} value={c.id}>
            #{c.name}
          </option>
        ))}
      </select>
    </label>
  );
  const text = (path, label) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      <input value={path.split('.').reduce((o, k) => o?.[k], cfg) || ''} onChange={(e) => set(path, e.target.value)} className={field} />
    </label>
  );
  const roleName = (id) => roles.find((r) => r.id === id)?.name || id;

  return (
    <div className="space-y-4">
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <Card title={t('seasonal.statusTitle')}>
        <Toggle label={t('seasonal.active')} checked={Boolean(cfg.active)} disabled={busy} onChange={(v) => run(() => api.seasonalToggle(v, broadcast), 'features.saved')} />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={broadcast} onChange={(e) => setBroadcast(e.target.checked)} className="accent-pink-500" />
          {t('seasonal.broadcast')}
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="ghost" disabled={busy} onClick={() => run(() => api.seasonalTrigger('drop'), 'seasonal.done')}>
            {t('seasonal.testDrop')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => run(() => api.seasonalTrigger('art'), 'seasonal.done')}>
            {t('seasonal.tallyArt')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => run(() => api.seasonalTrigger('activity', { windowType: 'morning' }), 'seasonal.done')}>
            {t('seasonal.tallyMorning')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => run(() => api.seasonalTrigger('activity', { windowType: 'night' }), 'seasonal.done')}>
            {t('seasonal.tallyNight')}
          </Button>
        </div>
        {drops?.nextDrops?.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="mb-1 text-xs font-semibold text-white/70">{t('seasonal.nextDrops')}</p>
            <ul className="space-y-1 text-white/70">
              {drops.nextDrops.map((d, i) => (
                <li key={i}>
                  {d.dayName} · {d.timeFormatted}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card title={t('seasonal.eventTitle')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {text('eventName', t('seasonal.eventName'))}
          {text('currencyName', t('seasonal.currencyName'))}
          {channelSelect('dropsChannelId')}
          {channelSelect('artChannelId')}
          {channelSelect('announcementsChannelId')}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('seasonal.endDate')}</span>
            <input type="datetime-local" value={toLocal(cfg.dates?.endDate)} onChange={(e) => set('dates.endDate', fromLocal(e.target.value))} className={field} />
          </label>
          {text('prizes.firstPlace', t('seasonal.prize1'))}
          {text('prizes.secondPlace', t('seasonal.prize2'))}
          {text('prizes.thirdPlace', t('seasonal.prize3'))}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('seasonal.chest')}</span>
            <input value={cfg.assets?.chestImageUrl || ''} onChange={(e) => setCfg({ ...cfg, assets: { ...cfg.assets, chestImageUrl: e.target.value } })} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('seasonal.currencyEmoji')}</span>
            <input value={cfg.assets?.emojis?.currency || ''} onChange={(e) => setCfg({ ...cfg, assets: { ...cfg.assets, emojis: { ...cfg.assets?.emojis, currency: e.target.value } } })} className={`${field} font-mono`} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('seasonal.decoys')}</span>
            <textarea rows={4} value={cfg.decoysText} onChange={(e) => setCfg({ ...cfg, decoysText: e.target.value })} className={`${area} font-mono`} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('seasonal.artEmojis')}</span>
            <textarea rows={2} value={cfg.artText} onChange={(e) => setCfg({ ...cfg, artText: e.target.value })} className={`${area} font-mono`} />
          </label>
        </div>
      </Card>

      <Card title={t('seasonal.textsTitle')}>
        <p className="mb-3 text-xs text-white/50">{t('seasonal.textsHint')}</p>
        <div className="space-y-3">
          {TEMPLATES.map((k) => (
            <label key={k} className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t(`seasonal.tpl.${k}`)}</span>
              <textarea rows={k.endsWith('Title') || k === 'dropEmbedFooter' ? 1 : 4} value={cfg.templates?.[k] || ''} onChange={(e) => set(`templates.${k}`, e.target.value)} className={area} />
            </label>
          ))}
        </div>
      </Card>

      <div className="dash-surface sticky bottom-3 z-10 rounded-2xl p-2">
        <Button onClick={save} disabled={busy} className="w-full">
          {t('features.save')}
        </Button>
      </div>

      <Card title={t('seasonal.restrTitle')}>
        <p className="mb-3 text-xs text-white/50">{t('seasonal.restrHint')}</p>
        <ul className="mb-3 space-y-1 text-sm">
          {(restr?.excludedUserIds || []).map((id) => (
            <li key={id} className="flex min-w-0 items-center justify-between gap-2">
              <MemberChip id={id} info={excludedNames.get(id)} t={t} />
              <button type="button" className="text-xs text-pyxie-glow hover:underline" onClick={() => run(() => api.seasonalRestrict('unexclude-user', { userId: id }), 'features.saved')}>
                {t('seasonal.readmit')}
              </button>
            </li>
          ))}
          {(restr?.excludedRoleIds || []).map((id) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span>@{roleName(id)}</span>
              <button type="button" className="text-xs text-pyxie-glow hover:underline" onClick={() => run(() => api.seasonalRestrict('unexclude-role', { roleId: id }), 'features.saved')}>
                {t('seasonal.readmit')}
              </button>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isId(newUser)) return;
              run(() => api.seasonalRestrict('exclude-user', { userId: newUser.trim() }), 'features.saved').then(() => setNewUser(''));
            }}
          >
            <input value={newUser} maxLength={20} inputMode="numeric" onChange={(e) => setNewUser(e.target.value.replace(/\D/g, ''))} placeholder={t('seasonal.userId')} aria-label={t('seasonal.userId')} aria-invalid={Boolean(newUser) && !isId(newUser)} className={`${field} min-w-0 font-mono`} />
            <Button variant="ghost" type="submit" disabled={!isId(newUser)}>
              {t('seasonal.exclude')}
            </Button>
          </form>
          <select
            value=""
            aria-label={t('seasonal.excludeRole')}
            onChange={(e) => e.target.value && run(() => api.seasonalRestrict('exclude-role', { roleId: e.target.value }), 'features.saved')}
            className={`${field} bg-[#160d2a]`}
          >
            <option value="">{t('seasonal.excludeRole')}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        {newUser && !isId(newUser) && <p className="mt-1 text-xs text-red-300">{t('error.invalid_user')}</p>}
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isId(resetId)) return;
            const who = resetInfo?.name ? `${resetInfo.name} (${resetId})` : resetId;
            if (window.confirm(t('seasonal.confirmReset', { id: who }))) run(() => api.seasonalReset(resetId), 'seasonal.resetDone').then(() => setResetId(''));
          }}
        >
          <input value={resetId} maxLength={20} inputMode="numeric" onChange={(e) => setResetId(e.target.value.replace(/\D/g, ''))} placeholder={t('seasonal.resetUser')} aria-label={t('seasonal.resetUser')} aria-invalid={Boolean(resetId) && !isId(resetId)} className={`${field} min-w-0 font-mono`} />
          <Button variant="ghost" type="submit" disabled={!isId(resetId)} className="text-red-300">
            {t('seasonal.reset')}
          </Button>
        </form>
        {resetId && !isId(resetId) && <p className="mt-1 text-xs text-red-300">{t('error.invalid_user')}</p>}
        {isId(resetId) && resetInfo && (
          <p className="mt-1 flex items-center gap-1 text-xs text-white/60">
            {t('seasonal.resetWho')} <MemberChip id={resetId} info={resetInfo} t={t} />
          </p>
        )}
      </Card>
    </div>
  );
}
