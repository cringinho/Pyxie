// Converte mensagens do estúdio antigo da Mary (data/marySavedMessages.json), os modelos prontos
// e mensagens já postadas no Discord para o formato do estúdio do painel (src/services/messageStudio.js).
const MARY_KINDS = ['calculator', 'roblox_check', 'ticket', 'review'];
const STYLE = { Primary: 'primary', Secondary: 'secondary', Success: 'success', Danger: 'danger', Link: 'link' };
const SNOWFLAKE_RE = /^\d{17,20}$/;
const MARY_PINK = '#ec4899';

function legacyKind(actionType, id) {
  if (actionType === 'calculator' || id === 'calc') return 'calculator';
  if (actionType === 'open_review' || actionType === 'review' || id === 'btn_vouch_review') return 'review';
  if (MARY_KINDS.includes(actionType)) return actionType;
  return null;
}

function fromLegacyEmbed(e) {
  if (!e) return null;
  return {
    color: /^#[0-9a-f]{6}$/i.test(e.color || '') ? e.color : MARY_PINK,
    title: e.title || '',
    description: e.description || '',
    imageUrl: e.imageUrl || '',
    thumbnailUrl: e.thumbnailUrl || '',
    footer: { text: e.footerText || '', iconUrl: e.footerIconUrl || '' },
    timestamp: Boolean(e.showTimestamp),
    fields: (Array.isArray(e.fields) ? e.fields : []).filter((f) => f && f.name && f.value),
  };
}

// Botões do formato antigo: ação da lojinha, cargo, link ou card explicativo (vira aba privada).
function fromLegacyButtons(buttons = []) {
  const tabs = [];
  const out = (Array.isArray(buttons) ? buttons : []).slice(0, 25).map((btn, i) => {
    const base = { id: `b${i + 1}`, label: String(btn.label || '').slice(0, 80), emoji: String(btn.emoji || ''), style: STYLE[btn.style] || 'primary' };
    if (btn.style === 'Link' && btn.url) return { ...base, style: 'link', action: { type: 'link', url: btn.url } };
    const kind = legacyKind(btn.actionType, btn.id);
    if (kind) return { ...base, action: { type: 'mary', kind } };
    if (btn.actionType === 'role') {
      const roleId = SNOWFLAKE_RE.test(btn.roleId || '') ? btn.roleId : SNOWFLAKE_RE.test(btn.id || '') ? btn.id : '';
      if (roleId) return { ...base, action: { type: 'role', roleId, mode: 'toggle' } };
    }
    const tabId = `t${i + 1}`;
    tabs.push({
      id: tabId,
      label: base.label,
      content: '',
      embeds: [
        {
          color: MARY_PINK,
          description: btn.responseText || base.label || '✨',
          imageUrl: btn.responseImageUrl || '',
          footer: { text: '🎀 Mary Store • Guia Exclusivo' },
        },
      ],
    });
    return { ...base, action: { type: 'tab', tabId, private: btn.responseEphemeral !== false } };
  });
  return { buttons: out, tabs };
}

function fromLegacy({ id, name, content, embed, buttons }) {
  const { buttons: b, tabs } = fromLegacyButtons(buttons);
  const e = fromLegacyEmbed(embed);
  return {
    id,
    name: String(name || 'Mensagem').slice(0, 100),
    mode: 'classic',
    envelope: { content: content || '' },
    embeds: e ? [e] : [],
    tabs,
    buttons: b,
    delivery: {},
  };
}

// Registro salvo pelo estúdio antigo → documento do painel, com a mensagem já enviada ligada a ele.
function fromLegacyRecord(record) {
  const slug = String(record.recordId || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const title = record.embed?.title || record.content || record.recordId;
  const doc = fromLegacy({
    id: `mary-${slug}`.slice(0, 40),
    name: `${record.channelName ? `#${record.channelName} · ` : ''}${title}`,
    content: record.content,
    embed: record.embed,
    buttons: record.buttons,
  });
  const sent = record.messageId && record.channelId ? [{ channelId: record.channelId, messageId: record.messageId, webhookId: null, threadId: null, mode: 'classic', sentAt: record.createdAt || Date.now(), by: null }] : [];
  return { doc, sent };
}

function fromTemplate(template, id) {
  return fromLegacy({ id, name: template.name, content: template.data?.content, embed: template.data?.embed, buttons: template.data?.buttons });
}

// Mensagem que a Pyxie já postou (menu "✏️ Editar na Pyxie"): texto, embeds e botões que dá para refazer.
// lostButtons > 0: algum botão (sorteio, outro sistema) sumiria ao salvar, então quem chama recusa.
function fromDiscordMessage(message) {
  let lostButtons = 0;
  const hex = (n) => (Number.isInteger(n) ? `#${n.toString(16).padStart(6, '0')}` : MARY_PINK);
  const embeds = (message.embeds || []).slice(0, 10).map((raw) => {
    const e = typeof raw.toJSON === 'function' ? raw.toJSON() : raw;
    return {
      color: hex(e.color),
      title: e.title || '',
      url: e.url || '',
      description: e.description || '',
      author: { name: e.author?.name || '', iconUrl: e.author?.icon_url || '', url: e.author?.url || '' },
      fields: (e.fields || []).map((f) => ({ name: f.name, value: f.value, inline: Boolean(f.inline) })),
      thumbnailUrl: e.thumbnail?.url || '',
      imageUrl: e.image?.url || '',
      footer: { text: e.footer?.text || '', iconUrl: e.footer?.icon_url || '' },
      timestamp: Boolean(e.timestamp),
    };
  });
  const buttons = [];
  for (const row of message.components || []) {
    const r = typeof row.toJSON === 'function' ? row.toJSON() : row;
    for (const c of r.components || []) {
      if (c.type !== 2 || buttons.length >= 25) continue;
      const emoji = c.emoji ? (c.emoji.id ? `<${c.emoji.animated ? 'a' : ''}:${c.emoji.name}:${c.emoji.id}>` : c.emoji.name) : '';
      const base = { id: `b${buttons.length + 1}`, label: c.label || '', emoji, style: Object.values(STYLE)[c.style - 1] || 'primary' };
      if (c.url) buttons.push({ ...base, style: 'link', action: { type: 'link', url: c.url } });
      else {
        const [prefix, type, extra] = String(c.custom_id || '').split(':');
        const kind = prefix === 'mary_btn' ? legacyKind(type, extra) : null;
        if (kind) buttons.push({ ...base, action: { type: 'mary', kind } });
        else lostButtons += 1;
      }
    }
  }
  const doc = {
    id: `mary-msg-${message.id}`,
    name: (embeds[0]?.title || message.content || `Mensagem ${message.id}`).slice(0, 100),
    mode: 'classic',
    envelope: { content: message.content || '' },
    embeds,
    tabs: [],
    buttons,
    delivery: {},
  };
  return { doc, lostButtons };
}

module.exports = { MARY_KINDS, fromLegacyRecord, fromTemplate, fromDiscordMessage };
