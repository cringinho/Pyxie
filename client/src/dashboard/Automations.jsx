import React, { useEffect, useState } from 'react';
import { PartyPopper, RefreshCw, Sparkles } from 'lucide-react';
import { api } from './api';
import BotPermissions from './Permissions';
import { ConfigAside, DiscordPreview, HubGroup, HubLayout, ModuleCard, SchemaForm } from './hub';
import { Notice, Spinner } from './ui';

const ICONS = { PartyPopper, Sparkles };
const KNOWN_ERRORS = ['invalid_channel', 'invalid_role', 'unknown_automation', 'bridge_error'];
const GROUP_ORDER = ['community', 'safety', 'moderation', 'utility'];

// Prévia de cada automação. Recebe o rascunho e um número que troca o exemplo.
const PREVIEWS = {
  animator: (t, cfg, n) => {
    const types = cfg.types.length ? cfg.types : ['question'];
    const type = types[n % types.length];
    const intro = t(`auto.animator.prev.tone.${cfg.tone}`);
    const footer = `-# ${t('auto.animator.prev.footer')}`;
    const pause = { label: t('auto.animator.prev.pause'), style: 'secondary' };
    if (type === 'poll') {
      const [question, ...answers] = t('auto.animator.prev.sample.poll').split('|');
      return { content: `${intro}\n${footer}`, poll: { question, answers }, buttons: [pause] };
    }
    if (type === 'thisOrThat') {
      const [a, b] = t('auto.animator.prev.sample.thisOrThat').split('|');
      return { content: `${intro}\n### ${a} ${t('auto.animator.prev.or')} ${b}?\n${footer}`, buttons: [{ label: a, style: 'primary' }, { label: b, style: 'primary' }, pause] };
    }
    const sample = type === 'house' && cfg.houseLines?.[0] ? cfg.houseLines[0] : t(`auto.animator.prev.sample.${type}`);
    return { content: `${intro}\n### ${t(`auto.animator.types.${type}`)}\n> ${sample}\n${footer}`, buttons: [pause] };
  },
};

function metaFor(t, key, stats) {
  if (key === 'animator' && stats?.posts) return t('auto.animator.stats', { posts: stats.posts, answered: stats.answered || 0 });
  return null;
}

// Automações: cartões por grupo; o painel da direita edita a escolhida com prévia ao vivo.
export default function Automations({ t, guildId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sample, setSample] = useState(0);

  useEffect(() => {
    api.automations(guildId).then(setData).catch((e) => setError(e.code || 'generic'));
    api.channels(guildId).then((d) => setChannels(d.channels)).catch(() => {});
    api.roles(guildId).then((d) => setRoles(d.roles)).catch(() => {});
  }, [guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!data) return <Spinner label={t('app.loading')} />;

  const keys = Object.keys(data.schema);
  const groups = GROUP_ORDER.map((g) => [g, keys.filter((k) => data.schema[k].group === g)]).filter(([, ks]) => ks.length);
  const choose = (key) => {
    setOpen(key);
    setDraft({ ...data.configs[key] });
    setStatus(null);
    setSample(0);
  };
  const close = () => {
    setOpen(null);
    setDraft(null);
  };
  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await api.saveAutomation(guildId, open, draft);
      setData({ ...data, configs: { ...data.configs, [open]: res.config } });
      setDraft({ ...res.config });
      setStatus('ok');
    } catch (e) {
      setStatus(e.code || 'generic');
    } finally {
      setSaving(false);
    }
  };

  const def = open && data.schema[open];
  const preview = open && PREVIEWS[open]?.(t, draft, sample);
  const aside = def && (
    <ConfigAside
      icon={ICONS[def.icon] || Sparkles}
      title={t(`auto.${open}.title`)}
      subtitle={t(`auto.group.${def.group}`)}
      onBack={close}
      backLabel={t('auto.back')}
      onSave={save}
      saveLabel={t('auto.save')}
      saving={saving}
      footerNote={
        status && (
          <div className="mb-2" role="status">
            <Notice tone={status === 'ok' ? 'ok' : 'error'}>{status === 'ok' ? t('auto.saved') : KNOWN_ERRORS.includes(status) ? t(`auto.error.${status}`) : t('error.generic', { error: status })}</Notice>
          </div>
        )
      }
    >
      <p className="text-sm text-white/70">{t(`auto.${open}.desc`)}</p>
      {preview && (
        <div className="space-y-2">
          <DiscordPreview label={t('auto.preview')} content={preview.content} buttons={preview.buttons} poll={preview.poll} />
          <button type="button" onClick={() => setSample(sample + 1)} className="flex min-h-[36px] items-center gap-2 rounded-lg px-2 text-xs font-semibold text-mystic-glow hover:bg-white/5">
            <RefreshCw size={14} aria-hidden="true" />
            {t('auto.otherSample')}
          </button>
        </div>
      )}
      <SchemaForm t={t} schemaKey={open} fields={def.fields} value={draft} onChange={setDraft} channels={channels} roles={roles} />
      {def.needs.length > 0 && <BotPermissions t={t} guildId={guildId} needs={def.needs} />}
    </ConfigAside>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">{t('auto.intro')}</p>
      <HubLayout aside={aside}>
        {groups.map(([g, ks]) => (
          <HubGroup key={g} title={t(`auto.group.${g}`)}>
            {ks.map((k) => {
              const on = data.configs[k].enabled;
              return (
                <ModuleCard
                  key={k}
                  icon={ICONS[data.schema[k].icon] || Sparkles}
                  title={t(`auto.${k}.title`)}
                  desc={t(`auto.${k}.desc`)}
                  on={on}
                  statusLabel={on ? t('auto.on') : t('auto.off')}
                  meta={metaFor(t, k, data.stats[k])}
                  active={open === k}
                  onClick={() => choose(k)}
                />
              );
            })}
          </HubGroup>
        ))}
      </HubLayout>
    </div>
  );
}
