import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { Button, Card, Notice, Spinner, Toggle } from './ui';

const field = 'min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm';
const area = 'w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm';
const uid = () => Math.random().toString(36).slice(2, 8);

const emptyEmbed = () => ({
  color: '#8b5cf6',
  author: { name: '', iconUrl: '', url: '' },
  title: '',
  url: '',
  description: '',
  fields: [],
  thumbnailUrl: '',
  imageUrl: '',
  footer: { text: '', iconUrl: '' },
  timestamp: false,
});

const emptyMessage = () => ({
  id: '',
  name: '',
  mode: 'classic',
  envelope: { content: '', silent: true, identity: { useWebhook: false, username: '', avatarUrl: '' } },
  embeds: [emptyEmbed()],
  v2: { accentColor: '#8b5cf6', blocks: [{ type: 'text', content: '' }] },
  tabs: [],
  buttons: [],
  delivery: { channelId: '', schedule: null, repeat: null, sticky: null, source: null },
});

function Label({ children }) {
  return <span className="mb-1 block text-xs font-semibold text-white/70">{children}</span>;
}

function Input({ label, value, onChange, placeholder, maxLength, type = 'text' }) {
  return (
    <label className="block">
      <Label>
        {label}
        {maxLength ? <span className="float-right font-normal text-white/40">{(value || '').length}/{maxLength}</span> : null}
      </Label>
      <input type={type} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={field} />
    </label>
  );
}

function TextArea({ label, value, onChange, maxLength, rows = 4 }) {
  return (
    <label className="block">
      <Label>
        {label}
        {maxLength ? <span className="float-right font-normal text-white/40">{(value || '').length}/{maxLength}</span> : null}
      </Label>
      <textarea value={value || ''} rows={rows} onChange={(e) => onChange(e.target.value)} className={area} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${field} bg-[#160d2a]`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------- Prévia estilo Discord ----------

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMarkdown(text, ctx) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/\{emoji:([a-zA-Z0-9_]+)\}/g, (_, k) => {
    const e = ctx.emojis.get(k.toLowerCase());
    return e ? `<img src="${e.url}" alt=":${e.name}:" class="inline h-5 w-5 align-text-bottom" />` : `:${k}:`;
  });
  html = html
    .replace(/\{user\}/g, '<span class="rounded bg-indigo-500/30 px-1 text-indigo-200">@você</span>')
    .replace(/\{server\}/g, escapeHtml(ctx.guildName || ''))
    .replace(/\{date\}/g, new Date().toLocaleDateString('pt-BR'));
  const lines = html.split('\n').map((line) => {
    if (/^### /.test(line)) return `<span class="block text-base font-bold">${line.slice(4)}</span>`;
    if (/^## /.test(line)) return `<span class="block text-lg font-bold">${line.slice(3)}</span>`;
    if (/^# /.test(line)) return `<span class="block text-xl font-bold">${line.slice(2)}</span>`;
    if (/^-# /.test(line)) return `<span class="block text-xs text-white/50">${line.slice(3)}</span>`;
    if (/^&gt; /.test(line)) return `<span class="block border-l-4 border-white/30 pl-2">${line.slice(5)}</span>`;
    return line;
  });
  return lines
    .join('<br/>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-black/40 px-1">$1</code>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<span class="text-sky-400">$1</span>')
    .replace(/(<\/span>)<br\/>/g, '$1');
}

function Md({ text, ctx, className = '' }) {
  return <div className={`whitespace-normal break-words ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(text, ctx) }} />;
}

const styleClass = {
  primary: 'bg-[#5865F2]',
  secondary: 'bg-[#4e5058]',
  success: 'bg-[#248046]',
  danger: 'bg-[#da373c]',
  link: 'bg-[#4e5058]',
};

function PreviewButton({ b, ctx }) {
  return (
    <span className={`inline-flex min-h-[32px] items-center gap-1 rounded px-3 text-sm font-medium ${styleClass[b.style] || styleClass.primary}`}>
      {b.emoji && <Md text={b.emoji} ctx={ctx} className="inline" />}
      {b.label}
      {b.action.type === 'link' && <span aria-hidden="true">↗</span>}
    </span>
  );
}

function PreviewEmbed({ e, ctx }) {
  return (
    <div className="mt-1 max-w-[520px] rounded border-l-4 bg-[#2b2d31] p-3" style={{ borderColor: e.color }}>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {e.author.name && <p className="text-xs font-semibold">{e.author.name}</p>}
          {e.title && <Md text={e.title} ctx={ctx} className={`font-bold ${e.url ? 'text-sky-400' : ''}`} />}
          {e.description && <Md text={e.description} ctx={ctx} className="text-sm text-white/90" />}
          {e.fields.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {e.fields.map((f, i) => (
                <div key={i} className={f.inline ? '' : 'sm:col-span-3'}>
                  <Md text={f.name} ctx={ctx} className="text-xs font-bold" />
                  <Md text={f.value} ctx={ctx} className="text-sm" />
                </div>
              ))}
            </div>
          )}
        </div>
        {e.thumbnailUrl && /^https:/.test(e.thumbnailUrl) && <img src={e.thumbnailUrl} alt="" className="h-16 w-16 rounded object-cover" />}
      </div>
      {e.imageUrl && /^https:/.test(e.imageUrl) && <img src={e.imageUrl} alt="" className="mt-2 max-h-64 rounded" />}
      {(e.footer.text || e.timestamp) && (
        <p className="mt-2 text-xs text-white/60">
          {e.footer.text}
          {e.footer.text && e.timestamp ? ' • ' : ''}
          {e.timestamp ? new Date().toLocaleString('pt-BR') : ''}
        </p>
      )}
    </div>
  );
}

function Preview({ doc, ctx, t }) {
  const byId = new Map(doc.buttons.map((b) => [b.id, b]));
  const used = new Set();
  let body;
  if (doc.mode === 'v2') {
    body = (
      <div className="mt-1 max-w-[520px] space-y-2 rounded-lg border-l-4 bg-[#2b2d31] p-3" style={{ borderColor: doc.v2.accentColor }}>
        {doc.v2.blocks.map((b, i) => {
          if (b.type === 'text') return <Md key={i} text={b.content} ctx={ctx} className="text-sm" />;
          if (b.type === 'separator') return <hr key={i} className={`${b.divider ? 'border-white/20' : 'border-transparent'} ${b.spacing === 'large' ? 'my-3' : 'my-1'}`} />;
          if (b.type === 'gallery')
            return (
              <div key={i} className="grid grid-cols-2 gap-1">
                {b.images.filter((im) => /^https:/.test(im.url)).map((im, j) => (
                  <img key={j} src={im.url} alt={im.description || ''} className="w-full rounded object-cover" />
                ))}
              </div>
            );
          if (b.type === 'section') {
            const btn = b.accessory?.type === 'button' ? byId.get(b.accessory.buttonId) : null;
            if (btn) used.add(btn.id);
            return (
              <div key={i} className="flex items-center justify-between gap-3">
                <Md text={b.text} ctx={ctx} className="min-w-0 flex-1 text-sm" />
                {btn && <PreviewButton b={btn} ctx={ctx} />}
                {b.accessory?.type === 'thumbnail' && /^https:/.test(b.accessory.url) && <img src={b.accessory.url} alt="" className="h-14 w-14 rounded object-cover" />}
              </div>
            );
          }
          if (b.type === 'buttons')
            return (
              <div key={i} className="flex flex-wrap gap-2">
                {b.buttonIds.map((id) => byId.get(id)).filter(Boolean).map((btn) => {
                  used.add(btn.id);
                  return <PreviewButton key={btn.id} b={btn} ctx={ctx} />;
                })}
              </div>
            );
          return null;
        })}
      </div>
    );
  } else {
    body = (
      <>
        {doc.envelope.content && <Md text={doc.envelope.content} ctx={ctx} className="text-sm" />}
        {doc.embeds.map((e, i) => (
          <PreviewEmbed key={i} e={e} ctx={ctx} />
        ))}
      </>
    );
  }
  const loose = doc.buttons.filter((b) => !used.has(b.id));
  return (
    <div className="rounded-xl bg-[#313338] p-3">
      <p className="mb-1 text-sm">
        <span className="font-semibold">Pyxie</span>
        <span className="ml-1 rounded bg-[#5865F2] px-1 text-[10px] font-bold">APP</span>
        {doc.envelope.silent && <span className="ml-2 text-xs text-white/50">🔕 {t('studio.silent')}</span>}
      </p>
      {body}
      {loose.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {loose.map((b) => (
            <PreviewButton key={b.id} b={b} ctx={ctx} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Editores ----------

function EmbedEditor({ e, onChange, onRemove, t, limits }) {
  const set = (patch) => onChange({ ...e, ...patch });
  return (
    <div className="space-y-3 rounded-xl border border-white/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="color" value={e.color} onChange={(ev) => set({ color: ev.target.value })} aria-label={t('studio.color')} className="h-9 w-12 rounded" />
          {t('studio.color')}
        </label>
        <Button variant="ghost" onClick={onRemove}>
          {t('studio.remove')}
        </Button>
      </div>
      <Input label={t('studio.author')} value={e.author.name} maxLength={limits.author} onChange={(v) => set({ author: { ...e.author, name: v } })} />
      <Input label={t('studio.authorIcon')} value={e.author.iconUrl} placeholder="https://… ou {server.icon}" onChange={(v) => set({ author: { ...e.author, iconUrl: v } })} />
      <Input label={t('studio.title2')} value={e.title} maxLength={limits.title} onChange={(v) => set({ title: v })} />
      <Input label={t('studio.titleUrl')} value={e.url} placeholder="https://" onChange={(v) => set({ url: v })} />
      <TextArea label={t('studio.description')} value={e.description} maxLength={limits.description} rows={6} onChange={(v) => set({ description: v })} />
      <div className="space-y-2">
        <Label>{t('studio.fields')}</Label>
        {e.fields.map((f, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-white/5 p-2">
            <Input label={t('studio.fieldName')} value={f.name} maxLength={limits.fieldName} onChange={(v) => set({ fields: e.fields.map((x, j) => (j === i ? { ...x, name: v } : x)) })} />
            <TextArea label={t('studio.fieldValue')} value={f.value} maxLength={limits.fieldValue} rows={2} onChange={(v) => set({ fields: e.fields.map((x, j) => (j === i ? { ...x, value: v } : x)) })} />
            <div className="flex items-center justify-between">
              <Toggle label={t('studio.inline')} checked={f.inline} onChange={(v) => set({ fields: e.fields.map((x, j) => (j === i ? { ...x, inline: v } : x)) })} />
              <Button variant="ghost" onClick={() => set({ fields: e.fields.filter((_, j) => j !== i) })}>
                {t('studio.remove')}
              </Button>
            </div>
          </div>
        ))}
        {e.fields.length < limits.fields && (
          <Button variant="ghost" onClick={() => set({ fields: [...e.fields, { name: '', value: '', inline: true }] })}>
            + {t('studio.addField')}
          </Button>
        )}
      </div>
      <Input label={t('studio.thumbnail')} value={e.thumbnailUrl} placeholder="https://… ou {user.avatar}" onChange={(v) => set({ thumbnailUrl: v })} />
      <Input label={t('studio.image')} value={e.imageUrl} placeholder="https://" onChange={(v) => set({ imageUrl: v })} />
      <Input label={t('studio.footer')} value={e.footer.text} maxLength={limits.footer} onChange={(v) => set({ footer: { ...e.footer, text: v } })} />
      <Input label={t('studio.footerIcon')} value={e.footer.iconUrl} placeholder="https://… ou {bot.avatar}" onChange={(v) => set({ footer: { ...e.footer, iconUrl: v } })} />
      <Toggle label={t('studio.timestamp')} checked={e.timestamp} onChange={(v) => set({ timestamp: v })} />
    </div>
  );
}

function V2Editor({ v2, buttons, onChange, t }) {
  const setBlock = (i, patch) => onChange({ ...v2, blocks: v2.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)) });
  const add = (block) => onChange({ ...v2, blocks: [...v2.blocks, block] });
  const move = (i, d) => {
    const blocks = [...v2.blocks];
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    onChange({ ...v2, blocks });
  };
  const btnOptions = [{ value: '', label: '—' }, ...buttons.map((b) => ({ value: b.id, label: b.label || b.emoji || b.id }))];
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="color" value={v2.accentColor} onChange={(e) => onChange({ ...v2, accentColor: e.target.value })} aria-label={t('studio.color')} className="h-9 w-12 rounded" />
        {t('studio.accent')}
      </label>
      {v2.blocks.map((b, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase text-white/60">{t(`studio.block.${b.type}`)}</span>
            <span className="flex gap-1">
              <Button variant="ghost" onClick={() => move(i, -1)} aria-label="↑">↑</Button>
              <Button variant="ghost" onClick={() => move(i, 1)} aria-label="↓">↓</Button>
              <Button variant="ghost" onClick={() => onChange({ ...v2, blocks: v2.blocks.filter((_, j) => j !== i) })}>
                {t('studio.remove')}
              </Button>
            </span>
          </div>
          {b.type === 'text' && <TextArea label={t('studio.text')} value={b.content} onChange={(v) => setBlock(i, { content: v })} rows={5} />}
          {b.type === 'separator' && (
            <>
              <Toggle label={t('studio.divider')} checked={b.divider} onChange={(v) => setBlock(i, { divider: v })} />
              <Select label={t('studio.spacing')} value={b.spacing} onChange={(v) => setBlock(i, { spacing: v })} options={[{ value: 'small', label: t('studio.small') }, { value: 'large', label: t('studio.large') }]} />
            </>
          )}
          {b.type === 'section' && (
            <>
              <TextArea label={t('studio.text')} value={b.text} onChange={(v) => setBlock(i, { text: v })} rows={3} />
              <Select
                label={t('studio.sideButton')}
                value={b.accessory?.type === 'button' ? b.accessory.buttonId : ''}
                onChange={(v) => setBlock(i, { accessory: v ? { type: 'button', buttonId: v } : null })}
                options={btnOptions}
              />
              {b.accessory?.type !== 'button' && (
                <Input label={t('studio.sideImage')} value={b.accessory?.type === 'thumbnail' ? b.accessory.url : ''} placeholder="https://" onChange={(v) => setBlock(i, { accessory: v ? { type: 'thumbnail', url: v } : null })} />
              )}
            </>
          )}
          {b.type === 'gallery' && (
            <>
              {b.images.map((im, j) => (
                <div key={j} className="flex gap-2">
                  <input value={im.url} placeholder="https://" aria-label={t('studio.image')} onChange={(e) => setBlock(i, { images: b.images.map((x, k) => (k === j ? { ...x, url: e.target.value } : x)) })} className={field} />
                  <Button variant="ghost" onClick={() => setBlock(i, { images: b.images.filter((_, k) => k !== j) })}>×</Button>
                </div>
              ))}
              {b.images.length < 10 && (
                <Button variant="ghost" onClick={() => setBlock(i, { images: [...b.images, { url: '', description: '' }] })}>
                  + {t('studio.addImage')}
                </Button>
              )}
            </>
          )}
          {b.type === 'buttons' && (
            <div className="space-y-1">
              {buttons.map((btn) => (
                <label key={btn.id} className="flex min-h-[40px] items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-pink-500"
                    checked={b.buttonIds.includes(btn.id)}
                    onChange={(e) => setBlock(i, { buttonIds: e.target.checked ? [...b.buttonIds, btn.id].slice(0, 5) : b.buttonIds.filter((x) => x !== btn.id) })}
                  />
                  {btn.label || btn.id}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {[
          { type: 'text', content: '' },
          { type: 'section', text: '', accessory: null },
          { type: 'separator', spacing: 'small', divider: true },
          { type: 'gallery', images: [{ url: '', description: '' }] },
          { type: 'buttons', buttonIds: [] },
        ].map((blk) => (
          <Button key={blk.type} variant="ghost" onClick={() => add(blk)}>
            + {t(`studio.block.${blk.type}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ButtonEditor({ b, onChange, onRemove, t, roles, channels, tabs }) {
  const set = (patch) => onChange({ ...b, ...patch });
  const setAction = (patch) => onChange({ ...b, action: { ...b.action, ...patch } });
  return (
    <div className="space-y-2 rounded-xl border border-white/10 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Input label={t('studio.label')} value={b.label} maxLength={80} onChange={(v) => set({ label: v })} />
        <Input label={t('studio.emoji')} value={b.emoji} placeholder="✨ ou {emoji:map}" onChange={(v) => set({ emoji: v })} />
      </div>
      <Select
        label={t('studio.action')}
        value={b.action.type}
        onChange={(type) => onChange({ ...b, style: type === 'link' ? 'link' : b.style === 'link' ? 'primary' : b.style, action: { type } })}
        options={['link', 'role', 'modal', 'tab', 'silent'].map((v) => ({ value: v, label: t(`studio.actionType.${v}`) }))}
      />
      {b.action.type !== 'link' && (
        <Select
          label={t('studio.style')}
          value={b.style}
          onChange={(v) => set({ style: v })}
          options={['primary', 'secondary', 'success', 'danger'].map((v) => ({ value: v, label: t(`studio.styleName.${v}`) }))}
        />
      )}
      {b.action.type === 'link' && <Input label="URL" value={b.action.url} placeholder="https://" onChange={(v) => setAction({ url: v })} />}
      {b.action.type === 'role' && (
        <>
          <Select
            label={t('studio.role')}
            value={b.action.roleId || ''}
            onChange={(v) => setAction({ roleId: v })}
            options={[{ value: '', label: '—' }, ...roles.filter((r) => r.assignable).map((r) => ({ value: r.id, label: r.name }))]}
          />
          <Select
            label={t('studio.roleMode')}
            value={b.action.mode || 'toggle'}
            onChange={(v) => setAction({ mode: v })}
            options={['toggle', 'add', 'remove'].map((v) => ({ value: v, label: t(`studio.roleModeName.${v}`) }))}
          />
        </>
      )}
      {b.action.type === 'modal' && (
        <>
          <Input label={t('studio.formTitle')} value={b.action.title} maxLength={45} onChange={(v) => setAction({ title: v })} />
          <Select
            label={t('studio.formTarget')}
            value={b.action.targetChannelId || ''}
            onChange={(v) => setAction({ targetChannelId: v })}
            options={[{ value: '', label: '—' }, ...channels.map((c) => ({ value: c.id, label: `#${c.name}` }))]}
          />
          {(b.action.fields || []).map((f, i) => (
            <div key={i} className="flex gap-2">
              <input value={f.label} placeholder={t('studio.question')} aria-label={t('studio.question')} onChange={(e) => setAction({ fields: b.action.fields.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} className={field} />
              <select value={f.style} aria-label={t('studio.style')} onChange={(e) => setAction({ fields: b.action.fields.map((x, j) => (j === i ? { ...x, style: e.target.value } : x)) })} className={`${field} w-28 bg-[#160d2a]`}>
                <option value="short">{t('studio.short')}</option>
                <option value="paragraph">{t('studio.long')}</option>
              </select>
              <Button variant="ghost" onClick={() => setAction({ fields: b.action.fields.filter((_, j) => j !== i) })}>×</Button>
            </div>
          ))}
          {(b.action.fields || []).length < 5 && (
            <Button variant="ghost" onClick={() => setAction({ fields: [...(b.action.fields || []), { label: '', style: 'short', required: true }] })}>
              + {t('studio.addQuestion')}
            </Button>
          )}
        </>
      )}
      {b.action.type === 'tab' && (
        <>
          <Select
            label={t('studio.tab')}
            value={b.action.tabId || ''}
            onChange={(v) => setAction({ tabId: v })}
            options={[{ value: '', label: '—' }, ...tabs.map((x) => ({ value: x.id, label: x.label || x.id }))]}
          />
          <Toggle label={t('studio.tabPrivate')} checked={b.action.private !== false} onChange={(v) => setAction({ private: v })} />
        </>
      )}
      {b.action.type === 'silent' && <p className="text-xs text-white/60">{t('studio.silentHint')}</p>}
      <Button variant="ghost" onClick={onRemove}>
        {t('studio.remove')}
      </Button>
    </div>
  );
}

function EmojiPicker({ emojis, t, onClose }) {
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState('');
  const list = emojis.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 200);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={t('studio.emojis')}>
      <div className="glass-panel w-full max-w-lg rounded-2xl p-4">
        <div className="mb-3 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('studio.search')} aria-label={t('studio.search')} className={field} autoFocus />
          <Button variant="ghost" onClick={onClose}>
            {t('studio.close')}
          </Button>
        </div>
        <p className="mb-2 text-xs text-white/60">{copied ? t('studio.copied', { code: copied }) : t('studio.emojiHint')}</p>
        <div className="grid max-h-80 grid-cols-6 gap-2 overflow-y-auto sm:grid-cols-8">
          {list.map((e) => (
            <button
              key={e.id}
              type="button"
              title={e.name}
              onClick={() => {
                const code = `{emoji:${e.name}}`;
                navigator.clipboard?.writeText(code).catch(() => {});
                setCopied(code);
              }}
              className="flex h-11 items-center justify-center rounded-lg hover:bg-white/10"
            >
              <img src={e.url} alt={e.name} loading="lazy" className="h-7 w-7" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function validationText(t, err) {
  return t(`studio.err.${err.code}`, { path: err.path, limit: err.limit ?? '' });
}

// ---------- Tela ----------

export default function Studio({ t, guildId, guildName, isOwner }) {
  const [list, setList] = useState(null);
  const [limits, setLimits] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const loadList = () =>
    api
      .studioList(guildId)
      .then((d) => {
        setList(d.messages);
        setLimits(d.limits);
      })
      .catch((e) => setError(e.code));

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  if (error) return <Notice tone="error">{t('error.generic', { error })}</Notice>;
  if (!list || !limits) return <Spinner label={t('app.loading')} />;
  if (editing) {
    return (
      <Editor
        t={t}
        guildId={guildId}
        guildName={guildName}
        isOwner={isOwner}
        limits={limits}
        initial={editing}
        onClose={() => {
          setEditing(null);
          loadList();
        }}
      />
    );
  }
  return (
    <Card title={t('studio.title')}>
      <p className="mb-3 text-sm text-white/60">{t('studio.hint')}</p>
      {list.length === 0 && <p className="mb-3 text-sm text-white/60">{t('studio.empty')}</p>}
      <ul className="mb-3 divide-y divide-white/5">
        {list.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => api.studioGet(guildId, m.id).then((d) => setEditing(d.message))}
              className="flex min-h-[52px] w-full items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{m.name}</span>
                <span className="block text-xs text-white/50">
                  {t(`studio.mode.${m.mode}`)} · {t('studio.sentCount', { count: m.sentCount })}
                </span>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
      <Button onClick={() => setEditing(emptyMessage())} className="w-full">
        + {t('studio.new')}
      </Button>
    </Card>
  );
}

function Editor({ t, guildId, guildName, isOwner, limits, initial, onClose }) {
  const [doc, setDoc] = useState(() => ({ ...emptyMessage(), ...initial, v2: initial.v2 || emptyMessage().v2 }));
  const [isNew] = useState(!initial.id);
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const [picker, setPicker] = useState(false);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [target, setTarget] = useState(initial.delivery?.channelId || '');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(initial.history || []);
  const [sentCount, setSentCount] = useState((initial.sent || []).length);

  useEffect(() => {
    api.roles(guildId).then((d) => setRoles(d.roles)).catch(() => {});
    api.channels(guildId).then((d) => setChannels(d.channels.filter((c) => [0, 5].includes(c.type)))).catch(() => {});
    api.studioEmojis(guildId).then((d) => setEmojis(d.emojis)).catch(() => {});
  }, [guildId]);

  const ctx = useMemo(() => ({ emojis: new Map(emojis.map((e) => [e.name.toLowerCase(), e])), guildName }), [emojis, guildName]);
  const set = (patch) => setDoc((d) => ({ ...d, ...patch }));
  const msgId = doc.id || slug(doc.name);

  const run = async (fn) => {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
    } catch (err) {
      if (err.code === 'validation_failed') setStatus('invalid');
      else setStatus(`error:${err.code}`);
    }
    setBusy(false);
  };

  const save = () =>
    run(async () => {
      if (!msgId) throw Object.assign(new Error('name'), { code: 'missing_name' });
      const body = { ...doc, embeds: doc.mode === 'classic' ? doc.embeds : [], v2: doc.mode === 'v2' ? doc.v2 : null, envelope: { ...doc.envelope, content: doc.mode === 'classic' ? doc.envelope.content : '' }, delivery: { ...doc.delivery, channelId: target } };
      const res = await api.studioSave(guildId, msgId, body).catch((err) => {
        if (err.data?.errors) setErrors(err.data.errors);
        throw err;
      });
      setErrors([]);
      setDoc({ ...res.message, v2: res.message.v2 || emptyMessage().v2 });
      setHistory(res.message.history || []);
      setStatus('saved');
    });

  const send = () =>
    run(async () => {
      await api.studioSend(guildId, msgId, target);
      setSentCount((n) => n + 1);
      setStatus('sent');
    });

  const updateSent = () =>
    run(async () => {
      const res = await api.studioUpdateSent(guildId, msgId);
      const failed = res.results.filter((r) => !r.ok).length;
      setStatus(failed ? `error:update_partial_${failed}` : 'updated');
    });

  const preview = () =>
    run(async () => {
      await api.studioPreview(guildId, msgId);
      setStatus('previewed');
    });

  const restore = (index) =>
    run(async () => {
      const res = await api.studioRestore(guildId, msgId, index);
      setDoc({ ...res.message, v2: res.message.v2 || emptyMessage().v2 });
      setHistory(res.message.history || []);
      setStatus('saved');
    });

  const remove = () =>
    run(async () => {
      if (!window.confirm(t('studio.confirmDelete'))) return;
      await api.studioDelete(guildId, msgId);
      onClose();
    });

  const saved = !isNew || Boolean(doc.updatedAt);

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onClose}>
        ← {t('nav.back')}
      </Button>
      <Card>
        <div className="space-y-3">
          <Input label={t('studio.name')} value={doc.name} maxLength={100} onChange={(v) => set({ name: v })} />
          {isNew && <p className="text-xs text-white/50">{t('studio.idHint', { id: msgId || '…' })}</p>}
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('studio.format')}>
            {['classic', 'v2'].map((m) => (
              <Button key={m} variant={doc.mode === m ? 'primary' : 'ghost'} onClick={() => set({ mode: m })}>
                {t(`studio.mode.${m}`)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-white/50">{t(`studio.modeHint.${doc.mode}`)}</p>
          <Toggle label={t('studio.silentSend')} checked={doc.envelope.silent} onChange={(v) => set({ envelope: { ...doc.envelope, silent: v } })} />
          <Button variant="ghost" onClick={() => setPicker(true)}>
            😊 {t('studio.emojis')}
          </Button>
        </div>
      </Card>

      <Card title={t('studio.preview')}>
        <Preview doc={doc} ctx={ctx} t={t} />
      </Card>

      {doc.mode === 'classic' ? (
        <Card title={t('studio.content')}>
          <TextArea label={t('studio.text')} value={doc.envelope.content} maxLength={limits.content} onChange={(v) => set({ envelope: { ...doc.envelope, content: v } })} />
          <div className="mt-3 space-y-3">
            {doc.embeds.map((e, i) => (
              <EmbedEditor
                key={i}
                e={e}
                t={t}
                limits={limits}
                onChange={(ne) => set({ embeds: doc.embeds.map((x, j) => (j === i ? ne : x)) })}
                onRemove={() => set({ embeds: doc.embeds.filter((_, j) => j !== i) })}
              />
            ))}
            {doc.embeds.length < limits.embeds && (
              <Button variant="ghost" onClick={() => set({ embeds: [...doc.embeds, emptyEmbed()] })}>
                + {t('studio.addEmbed')}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card title={t('studio.content')}>
          <V2Editor v2={doc.v2} buttons={doc.buttons} t={t} onChange={(v2) => set({ v2 })} />
        </Card>
      )}

      <Card title={t('studio.buttons')}>
        <div className="space-y-3">
          {doc.buttons.map((b, i) => (
            <ButtonEditor
              key={b.id}
              b={b}
              t={t}
              roles={roles}
              channels={channels}
              tabs={doc.tabs}
              onChange={(nb) => set({ buttons: doc.buttons.map((x, j) => (j === i ? nb : x)) })}
              onRemove={() => set({ buttons: doc.buttons.filter((_, j) => j !== i) })}
            />
          ))}
          {doc.buttons.length < limits.buttons && (
            <Button variant="ghost" onClick={() => set({ buttons: [...doc.buttons, { id: uid(), label: '', emoji: '', style: 'link', row: null, action: { type: 'link', url: '' } }] })}>
              + {t('studio.addButton')}
            </Button>
          )}
        </div>
      </Card>

      {doc.mode === 'classic' && (
        <Card title={t('studio.tabs')}>
          <p className="mb-3 text-xs text-white/60">{t('studio.tabsHint')}</p>
          <div className="space-y-3">
            {doc.tabs.map((tab, i) => (
              <div key={tab.id} className="space-y-2 rounded-xl border border-white/10 p-3">
                <Input label={t('studio.tabName')} value={tab.label} maxLength={80} onChange={(v) => set({ tabs: doc.tabs.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
                <TextArea label={t('studio.text')} value={tab.content} onChange={(v) => set({ tabs: doc.tabs.map((x, j) => (j === i ? { ...x, content: v } : x)) })} />
                {(tab.embeds || []).map((e, k) => (
                  <EmbedEditor
                    key={k}
                    e={e}
                    t={t}
                    limits={limits}
                    onChange={(ne) => set({ tabs: doc.tabs.map((x, j) => (j === i ? { ...x, embeds: x.embeds.map((y, z) => (z === k ? ne : y)) } : x)) })}
                    onRemove={() => set({ tabs: doc.tabs.map((x, j) => (j === i ? { ...x, embeds: x.embeds.filter((_, z) => z !== k) } : x)) })}
                  />
                ))}
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => set({ tabs: doc.tabs.map((x, j) => (j === i ? { ...x, embeds: [...(x.embeds || []), emptyEmbed()] } : x)) })}>
                    + {t('studio.addEmbed')}
                  </Button>
                  <Button variant="ghost" onClick={() => set({ tabs: doc.tabs.filter((_, j) => j !== i) })}>
                    {t('studio.remove')}
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" onClick={() => set({ tabs: [...doc.tabs, { id: uid(), label: '', content: '', embeds: [emptyEmbed()] }] })}>
              + {t('studio.addTab')}
            </Button>
          </div>
        </Card>
      )}

      <Card title={t('studio.actions')}>
        <div className="space-y-3">
          {errors.length > 0 && (
            <Notice tone="error">
              {t('studio.invalid')}
              <ul className="mt-1 list-disc pl-5">
                {errors.slice(0, 8).map((e, i) => (
                  <li key={i}>{validationText(t, e)}</li>
                ))}
              </ul>
            </Notice>
          )}
          {status && status !== 'invalid' && (
            <Notice tone={status.startsWith('error:') ? 'error' : 'ok'}>
              {status.startsWith('error:') ? t('error.generic', { error: status.slice(6) }) : t(`studio.status.${status}`)}
            </Notice>
          )}
          <Button onClick={save} disabled={busy || !doc.name} className="w-full">
            {t('studio.save')}
          </Button>
          <Select
            label={t('studio.channel')}
            value={target}
            onChange={setTarget}
            options={[{ value: '', label: '—' }, ...channels.map((c) => ({ value: c.id, label: `#${c.name}` }))]}
          />
          <p className="text-xs text-white/50">{t('studio.saveFirst')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="ghost" onClick={send} disabled={busy || !saved || !target}>
              {t('studio.send')}
            </Button>
            <Button variant="ghost" onClick={updateSent} disabled={busy || !saved || sentCount === 0}>
              {t('studio.updateSent', { count: sentCount })}
            </Button>
            {isOwner && (
              <Button variant="ghost" onClick={preview} disabled={busy || !saved}>
                {t('studio.homologation')}
              </Button>
            )}
            {saved && (
              <Button variant="ghost" onClick={remove} disabled={busy}>
                {t('studio.delete')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {history.length > 0 && (
        <Card title={t('studio.history')}>
          <ul className="divide-y divide-white/5">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{new Date(h.savedAt).toLocaleString()}</span>
                <Button variant="ghost" onClick={() => restore(i)} disabled={busy}>
                  {t('studio.restore')}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {picker && <EmojiPicker emojis={emojis} t={t} onClose={() => setPicker(false)} />}
    </div>
  );
}

function slug(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}
