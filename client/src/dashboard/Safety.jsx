import React, { useEffect, useState } from 'react';
import { api } from './api';
import BotPermissions from './Permissions';
import { Button, Card, MultiSelect, Notice, Spinner, Toggle } from './ui';

const field = 'min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm';

function useChannels(guildId) {
  const [channels, setChannels] = useState([]);
  useEffect(() => {
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5, 15].includes(c.type)))).catch(() => {});
  }, [guildId]);
  return channels.map((c) => ({ id: c.id, label: `#${c.name}` }));
}

function Status({ t, status }) {
  if (!status) return null;
  if (status === 'ok') return <Notice tone="ok">{t('features.saved')}</Notice>;
  return <Notice tone="error">{t('error.generic', { error: status })}</Notice>;
}

// Moderação da Cringelândia: modo blindagem (AutoMod nativo) e controle de brigas.
export function Moderation({ t, guildId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [shield, setShield] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [shieldStatus, setShieldStatus] = useState(null);
  const [conflictStatus, setConflictStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const channels = useChannels(guildId);

  useEffect(() => {
    api
      .moderation(guildId)
      .then((d) => {
        setData(d);
        setShield({ ...d.shield, termsText: d.shield.terms.join('\n') });
        setConflict(d.conflict);
      })
      .catch((e) => setError(e.code));
  }, [guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data || !shield || !conflict) return <Spinner label={t('app.loading')} />;

  const saveShield = async (patch = {}) => {
    setBusy(true);
    setShieldStatus(null);
    try {
      const next = { ...shield, ...patch };
      const res = await api.saveShield(guildId, {
        enabled: next.enabled,
        terms: next.termsText.split(/\n|,/).map((x) => x.trim()).filter(Boolean),
        exemptChannelIds: next.exemptChannelIds,
        customMessage: next.customMessage,
      });
      setShield({ ...res.shield, termsText: res.shield.terms.join('\n') });
      setShieldStatus('ok');
    } catch (e) {
      setShieldStatus(e.code || 'generic');
    }
    setBusy(false);
  };

  const saveConflict = async () => {
    setConflictStatus(null);
    try {
      const res = await api.saveConflict(guildId, conflict);
      setConflict(res.conflict);
      setConflictStatus('ok');
    } catch (e) {
      setConflictStatus(e.code || 'generic');
    }
  };

  return (
    <div className="space-y-4">
      <BotPermissions
        t={t}
        guildId={guildId}
        needs={[
          { perm: 'ManageGuild', why: 'perm.why.automod' },
          { perm: 'ManageChannels', why: 'perm.why.slowmode' },
          { perm: 'ModerateMembers', why: 'perm.why.timeout' },
        ]}
      />
      <Card title={t('mod.shieldTitle')}>
        <p className="mb-3 text-sm text-white/70">{t('mod.shieldHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('mod.shieldOn')} checked={shield.enabled} disabled={busy} onChange={(v) => saveShield({ enabled: v })} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('mod.terms')}</span>
            <textarea value={shield.termsText} rows={6} onChange={(e) => setShield({ ...shield, termsText: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm" aria-label={t('mod.terms')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('mod.customMessage')}</span>
            <input value={shield.customMessage} maxLength={150} onChange={(e) => setShield({ ...shield, customMessage: e.target.value })} className={field} />
          </label>
          <span className="block text-xs font-semibold text-white/70">{t('mod.exempt')}</span>
          <MultiSelect options={channels} value={shield.exemptChannelIds} emptyLabel={t('app.loading')} onChange={(v) => setShield({ ...shield, exemptChannelIds: v })} />
          <Status t={t} status={shieldStatus} />
          <Button onClick={() => saveShield()} disabled={busy} className="w-full">
            {t('features.save')}
          </Button>
        </div>
      </Card>

      <Card title={t('mod.conflictTitle')}>
        <p className="mb-3 text-sm text-white/70">{t('mod.conflictHint')}</p>
        <div className="space-y-3">
          <Toggle label={t('mod.conflictOn')} checked={conflict.enabled} onChange={(v) => setConflict({ ...conflict, enabled: v })} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/70">{t('mod.staffLog')}</span>
            <select value={conflict.staffLogChannelId} onChange={(e) => setConflict({ ...conflict, staffLogChannelId: e.target.value })} className={`${field} bg-[#160d2a]`}>
              <option value="">—</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <span className="block text-xs font-semibold text-white/70">{t('mod.conflictExempt')}</span>
          <MultiSelect options={channels} value={conflict.exemptChannelIds} emptyLabel={t('app.loading')} onChange={(v) => setConflict({ ...conflict, exemptChannelIds: v })} />
          <p className="text-xs text-white/50">{t('mod.ventNote')}</p>
          <Status t={t} status={conflictStatus} />
          <Button onClick={saveConflict} className="w-full">
            {t('features.save')}
          </Button>
        </div>
      </Card>

      <Card title={t('mod.incidents')}>
        {data.incidents.length === 0 && <p className="text-sm text-white/60">{t('mod.noIncidents')}</p>}
        <ul className="divide-y divide-white/5">
          {data.incidents.map((i, k) => (
            <li key={k} className="py-2 text-sm">
              <span className="font-mono text-xs text-white/50">{new Date(i.at).toLocaleString()}</span>
              <span className="block">{t(`mod.action.${i.action}`)} · {t('mod.level', { level: i.level })}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// Monitor de links (área global do dono).
export function Links({ t }) {
  const [links, setLinks] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ url: '', fallbackUrl: '', label: '' });
  const [results, setResults] = useState({});

  const load = () =>
    api
      .links()
      .then((d) => setLinks(d.links))
      .catch((e) => setError(e.code));
  useEffect(() => {
    load();
  }, []);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!links) return <Spinner label={t('app.loading')} />;

  const add = async () => {
    try {
      await api.addLink(draft);
      setDraft({ url: '', fallbackUrl: '', label: '' });
      load();
    } catch (e) {
      setError(e.code);
    }
  };
  const test = async (id) => {
    const res = await api.testLink(id).catch((e) => ({ result: { ok: false, diagnosis: e.code } }));
    setResults({ ...results, [id]: res.result });
  };
  const remove = async (id) => {
    await api.removeLink(id).catch(() => {});
    load();
  };
  const tone = { ok: 'text-emerald-300', down: 'text-red-300', suspect: 'text-amber-300', redirect: 'text-amber-300', unknown: 'text-white/50' };

  return (
    <div className="space-y-4">
      <Card title={t('links.title')}>
        <p className="mb-3 text-sm text-white/70">{t('links.hint')}</p>
        <ul className="divide-y divide-white/5">
          {links.map((l) => (
            <li key={l.id} className="space-y-1 py-3 text-sm">
              <p className="break-all font-mono text-xs">{l.url}</p>
              <p className="text-xs text-white/60">
                <span className={tone[l.status] || tone.unknown}>{t(`links.status.${l.status || 'unknown'}`)}</span>
                {l.label || l.source ? ` · ${l.label || l.source}` : ''}
                {l.diagnosis ? ` · ${l.diagnosis}` : ''}
              </p>
              {results[l.id] && <p className="text-xs">{results[l.id].ok ? `✅ HTTP ${results[l.id].status}` : `😿 ${results[l.id].diagnosis}`}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => test(l.id)}>
                  {t('links.test')}
                </Button>
                <Button variant="ghost" onClick={() => remove(l.id)}>
                  {t('studio.remove')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card title={t('links.add')}>
        <div className="space-y-2">
          <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://" aria-label="URL" className={field} />
          <input value={draft.fallbackUrl} onChange={(e) => setDraft({ ...draft, fallbackUrl: e.target.value })} placeholder={t('links.fallback')} aria-label={t('links.fallback')} className={field} />
          <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder={t('links.label')} aria-label={t('links.label')} className={field} />
          <Button onClick={add} disabled={!draft.url} className="w-full">
            {t('links.add')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
