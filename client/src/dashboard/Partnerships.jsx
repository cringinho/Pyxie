import React, { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from './api';
import { Button, Card, MultiSelect, Notice, Spinner } from './ui';

const field = 'dash-field min-h-[40px] w-full rounded-xl px-3 text-sm';
const CHANNELS = ['welcomeChannelId', 'requestChannelId', 'modReviewChannelId', 'publishedChannelId', 'radarChannelId'];

// Parcerias da Cringelândia (era o /admin/parcerias): canais, cargos, painel e parceiros aprovados.
export default function Partnerships({ t, guildId, children }) {
  const [cfg, setCfg] = useState(null);
  const [partners, setPartners] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.partnershipConfig().then((d) => setCfg(d.config)).catch((e) => setError(e.code || 'generic'));
    api.partnerItems().then((d) => setPartners(d.partners || [])).catch(() => {});
  }, []);
  useEffect(() => {
    load();
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5, 15].includes(c.type)))).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles)).catch(() => {});
  }, [guildId, load]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!cfg) return <Spinner label={t('app.loading')} />;

  const run = async (fn, okKey) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      setNotice({ tone: 'ok', text: t(okKey) });
      load();
    } catch (e) {
      setNotice({ tone: 'error', text: e.data?.error || t('error.generic', { error: e.code || 'generic' }) });
    }
    setBusy(false);
  };
  const setChannel = (key, value) => setCfg({ ...cfg, channels: { ...cfg.channels, [key]: value } });

  return (
    <div className="space-y-4">
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Card title={t('partners.configTitle')}>
        <div className="grid gap-3 sm:grid-cols-2">
          {CHANNELS.map((key) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-white/70">{t(`partners.ch.${key}`)}</span>
              <select value={cfg.channels?.[key] || ''} onChange={(e) => setChannel(key, e.target.value)} className={`${field} bg-[#160d2a]`}>
                <option value="">—</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('partners.screeningRole')}</span>
            <select value={cfg.roles?.screeningRoleId || ''} onChange={(e) => setCfg({ ...cfg, roles: { ...cfg.roles, screeningRoleId: e.target.value } })} className={`${field} bg-[#160d2a]`}>
              <option value="">—</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span className="mb-1 mt-3 block text-xs font-semibold text-white/70">{t('partners.adminRoles')}</span>
        <MultiSelect
          options={roles.map((r) => ({ id: r.id, label: r.name }))}
          value={cfg.roles?.adminRoleIds || []}
          emptyLabel={t('app.loading')}
          onChange={(v) => setCfg({ ...cfg, roles: { ...cfg.roles, adminRoleIds: v } })}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled={busy} className="flex-1" onClick={() => run(() => api.savePartnershipConfig({ channels: cfg.channels, roles: cfg.roles }), 'features.saved')}>
            {t('features.save')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => run(() => api.partnerPostPanel(), 'partners.posted')}>
            {t('partners.postPanel')}
          </Button>
        </div>
      </Card>

      {children}

      <Card title={t('partners.listTitle', { count: partners.length })}>
        {partners.length === 0 && <p className="text-sm text-white/60">{t('partners.empty')}</p>}
        <ul className="divide-y divide-white/5">
          {partners.map((p) => (
            <li key={p.id} className="py-3 text-sm">
              {editing?.id === p.id ? (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const { id, ...body } = editing;
                    run(() => api.updatePartner(id, body), 'partners.updated').then(() => setEditing(null));
                  }}
                >
                  {['projectName', 'imageUrl', 'accessLink'].map((k) => (
                    <input key={k} value={editing[k] || ''} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} placeholder={t(`partners.f.${k}`)} aria-label={t(`partners.f.${k}`)} className={field} />
                  ))}
                  <textarea rows={3} value={editing.publicDesc || ''} onChange={(e) => setEditing({ ...editing, publicDesc: e.target.value })} aria-label={t('partners.f.publicDesc')} className="dash-field w-full rounded-xl p-3 text-sm" />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {t('features.save')}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      {t('museum.cancel')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-3">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.projectName} loading="lazy" className="h-12 w-12 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.projectName}</p>
                    {p.publicDesc && <p className="line-clamp-2 text-white/60">{p.publicDesc}</p>}
                    {p.accessLink && (
                      <a href={p.accessLink} target="_blank" rel="noopener noreferrer" className="text-xs text-mystic-glow hover:underline">
                        {p.accessLink}
                      </a>
                    )}
                  </div>
                  <Button variant="ghost" className="min-h-[36px] px-3" onClick={() => setEditing({ id: p.id, projectName: p.projectName, imageUrl: p.imageUrl, accessLink: p.accessLink, publicDesc: p.publicDesc })}>
                    {t('museum.edit')}
                  </Button>
                  <button
                    type="button"
                    aria-label={t('museum.delete')}
                    className="p-2 text-red-300"
                    onClick={() => window.confirm(t('partners.confirmDelete', { name: p.projectName })) && run(() => api.deletePartner(p.id), 'partners.deleted')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
