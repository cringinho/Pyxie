import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import BotPermissions from './Permissions';
import { Button, Card, MultiSelect, Notice, Spinner, Toggle } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const PACK_ORDER = ['gender', 'sexuality', 'neuro', 'colors24', 'colors48', 'colors75'];

function Flag({ stripes, size = 28 }) {
  return (
    <span className="inline-flex shrink-0 flex-col overflow-hidden rounded ring-1 ring-white/20" style={{ width: size * 1.4, height: size }} aria-hidden="true">
      {stripes.map((hex, i) => (
        <span key={i} className="flex-1" style={{ background: `#${hex}` }} />
      ))}
    </span>
  );
}

function Choice({ name, value, current, label, onChange, disabled }) {
  return (
    <label className={`flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-sm ${disabled ? 'opacity-40' : 'cursor-pointer'} ${current === value ? 'border-pyxie-glow/60 bg-pyxie-bright/10' : 'border-white/10 bg-white/5'}`}>
      <input type="radio" name={name} checked={current === value} disabled={disabled} onChange={() => onChange(value)} className="accent-pink-500" />
      {label}
    </label>
  );
}

// Injeções: cargos prontos com bandeiras e painel de escolha (ou Canais e cargos do Discord).
export default function Injections({ t, lang, guildId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pack, setPack] = useState(null);
  const [opts, setOpts] = useState(null);
  const [job, setJob] = useState(null);

  const load = useCallback(() => {
    api.injections(guildId).then(setData).catch((e) => setError(e.code || 'generic'));
  }, [guildId]);
  useEffect(() => {
    load();
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles)).catch(() => {});
  }, [guildId, load]);

  // Acompanha a tarefa no bot até terminar.
  useEffect(() => {
    if (!job?.jobId || job.state !== 'running') return undefined;
    const id = setInterval(() => {
      api
        .injectionJob(guildId, job.jobId)
        .then((d) => {
          setJob({ ...d.job, jobId: job.jobId });
          if (d.job.state !== 'running') load();
        })
        .catch(() => setJob({ ...job, state: 'error', error: 'job_not_found' }));
    }, 1500);
    return () => clearInterval(id);
  }, [job, guildId, load]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;
  const { packs, info } = data;
  const name = (item) => (lang === 'en' ? item.en : item.pt);

  const choosePack = (id) => {
    setPack(id);
    setJob(null);
    setOpts({ items: packs[id].items.map((i) => i.id), mode: packs[id].defaultMode, format: 'select', publish: true, channelId: '', allowedRoleIds: [], position: 'top', onboarding: false, title: '', description: '' });
  };
  const toggleItem = (id) => setOpts({ ...opts, items: opts.items.includes(id) ? opts.items.filter((x) => x !== id) : [...opts.items, id] });
  const run = async () => {
    if (!window.confirm(t('inj.confirm', { count: opts.items.length }))) return;
    try {
      const res = await api.startInjection(guildId, { pack, options: opts, lang });
      setJob({ jobId: res.jobId, state: 'running', done: 0, total: opts.items.length });
    } catch (e) {
      setJob({ state: 'error', error: e.code || 'generic' });
    }
  };
  const removeInj = async (i, roles) => {
    if (!window.confirm(t(roles ? 'inj.confirmRemoveRoles' : 'inj.confirmRemove'))) return;
    await api.removeInjection(guildId, i.id, roles).catch(() => null);
    load();
  };
  const errorText = (code) => (t(`inj.error.${code}`).startsWith('inj.') ? t('error.generic', { error: code }) : t(`inj.error.${code}`));

  return (
    <div className="space-y-4">
      <BotPermissions
        t={t}
        guildId={guildId}
        needs={[
          { perm: 'ManageRoles', why: 'perm.why.injectRoles' },
          { perm: 'ManageGuild', why: 'perm.why.onboarding' },
        ]}
      />
      <p className="text-sm text-white/60">{t(info.roleIcons ? 'inj.iconsOn' : 'inj.iconsOff')}</p>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PACK_ORDER.map((id) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => choosePack(id)}
              aria-pressed={pack === id}
              className={`dash-card dash-card-hover flex h-full w-full flex-col gap-2 rounded-2xl p-4 text-left ${pack === id ? 'ring-2 ring-pyxie-glow' : ''}`}
            >
              <span className="font-title font-bold">
                {packs[id].emoji} {t(`inj.pack.${id}`)}
              </span>
              <span className="text-xs text-white/60">{t('inj.items', { count: packs[id].items.length })}</span>
              <span className="flex flex-wrap gap-1">
                {packs[id].items.slice(0, 8).map((i) => (
                  <Flag key={i.id} stripes={i.stripes} size={14} />
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {pack && opts && (
        <>
          <Card title={t('inj.chooseTitle', { pack: t(`inj.pack.${pack}`) })}>
            <div className="mb-3 flex gap-2 text-xs">
              <button type="button" className="text-pyxie-glow hover:underline" onClick={() => setOpts({ ...opts, items: packs[pack].items.map((i) => i.id) })}>
                {t('inj.all')}
              </button>
              <button type="button" className="text-pyxie-glow hover:underline" onClick={() => setOpts({ ...opts, items: [] })}>
                {t('inj.none')}
              </button>
              <span className="text-white/50">{t('inj.selected', { count: opts.items.length })}</span>
            </div>
            <ul className="grid max-h-96 gap-1 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
              {packs[pack].items.map((i) => (
                <li key={i.id}>
                  <label className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-white/5">
                    <input type="checkbox" checked={opts.items.includes(i.id)} onChange={() => toggleItem(i.id)} className="accent-pink-500" />
                    <Flag stripes={i.stripes} size={18} />
                    <span className="truncate">{name(i)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={t('inj.optionsTitle')}>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-white/70">{t('inj.position')}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Choice name="pos" value="top" current={opts.position} label={t('inj.posTop')} onChange={(v) => setOpts({ ...opts, position: v })} />
                  <Choice name="pos" value="bottom" current={opts.position} label={t('inj.posBottom')} onChange={(v) => setOpts({ ...opts, position: v })} />
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-white/70">{t('inj.mode')}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Choice name="mode" value="multi" current={opts.mode} label={t('inj.modeMulti')} onChange={(v) => setOpts({ ...opts, mode: v })} />
                  <Choice name="mode" value="single" current={opts.mode} label={t('inj.modeSingle')} onChange={(v) => setOpts({ ...opts, mode: v })} />
                </div>
              </div>
              <Toggle label={t('inj.publish')} checked={opts.publish} onChange={(v) => setOpts({ ...opts, publish: v })} />
              {opts.publish && (
                <div className="space-y-3 rounded-xl border border-white/10 p-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-white/70">{t('inj.channel')}</span>
                    <select value={opts.channelId} onChange={(e) => setOpts({ ...opts, channelId: e.target.value })} className={`${field} bg-[#160d2a]`}>
                      <option value="">—</option>
                      {channels.map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Choice name="fmt" value="select" current={opts.format} label={t('inj.fmtSelect')} onChange={(v) => setOpts({ ...opts, format: v })} />
                    <Choice name="fmt" value="buttons" current={opts.format} label={t('inj.fmtButtons')} disabled={opts.items.length > 20} onChange={(v) => setOpts({ ...opts, format: v })} />
                  </div>
                  <input value={opts.title} onChange={(e) => setOpts({ ...opts, title: e.target.value })} placeholder={t('inj.customTitle')} aria-label={t('inj.customTitle')} className={field} />
                  <textarea value={opts.description} rows={2} onChange={(e) => setOpts({ ...opts, description: e.target.value })} placeholder={t('inj.customDesc')} aria-label={t('inj.customDesc')} className="dash-field w-full rounded-xl p-3 text-sm" />
                </div>
              )}
              <div>
                <p className="mb-1 text-xs font-semibold text-white/70">{t('inj.whoCan')}</p>
                <MultiSelect options={roles.map((r) => ({ id: r.id, label: r.name }))} value={opts.allowedRoleIds} emptyLabel={t('app.loading')} onChange={(v) => setOpts({ ...opts, allowedRoleIds: v })} />
                <p className="mt-1 text-xs text-white/50">{t('inj.whoCanHint')}</p>
              </div>
              <Toggle label={t('inj.onboarding')} checked={opts.onboarding} disabled={!info.community} onChange={(v) => setOpts({ ...opts, onboarding: v })} />
              <p className="text-xs text-white/50">{t(info.community ? 'inj.onboardingHint' : 'inj.onboardingOff')}</p>
              {job?.state === 'running' && (
                <div role="status" aria-live="polite">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-gradient-to-r from-pyxie-bright to-mystic-violet transition-all" style={{ width: `${job.total ? (job.done / job.total) * 100 : 5}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-white/60">{t('inj.progress', { done: job.done, total: job.total || opts.items.length })}</p>
                </div>
              )}
              {job?.state === 'done' && (
                <Notice tone="ok">
                  {t('inj.done', { created: job.result.created, reused: job.result.reused })}
                  {job.result.panelUrl && (
                    <>
                      {' '}
                      <a href={job.result.panelUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        {t('inj.seePanel')}
                      </a>
                    </>
                  )}
                  {job.result.onboarding !== 'skipped' && ` ${t(`inj.onb.${job.result.onboarding}`)}`}
                </Notice>
              )}
              {job?.state === 'error' && <Notice tone="error">{errorText(job.error)}</Notice>}
              <Button className="w-full" disabled={!opts.items.length || (opts.publish && !opts.channelId) || job?.state === 'running'} onClick={run}>
                {t('inj.run', { count: opts.items.length })}
              </Button>
            </div>
          </Card>
        </>
      )}

      {info.injections.length > 0 && (
        <Card title={t('inj.doneTitle')}>
          <ul className="divide-y divide-white/5 text-sm">
            {info.injections.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  {packs[i.pack]?.emoji} {t(`inj.pack.${i.pack}`)} · {t('inj.items', { count: i.count })} · {new Date(i.createdAt).toLocaleDateString()}
                  {i.onboarding && ` · ${t('inj.inOnboarding')}`}
                </span>
                <span className="flex gap-3 text-xs">
                  <button type="button" className="text-pyxie-glow hover:underline" onClick={() => removeInj(i, false)}>
                    {t('inj.removePanel')}
                  </button>
                  <button type="button" className="text-red-300 hover:underline" onClick={() => removeInj(i, true)}>
                    {t('inj.removeAll')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
