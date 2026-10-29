// Estúdio de mensagens por servidor: modelo, validação pelos limites do Discord e montagem do
// payload da API (formato clássico com embeds ou formato novo Components V2).
//
// Os documentos moram em data/guilds/<guildId>/messages.json (ver messageStudioStore.js).
// O envio é feito pela REST do Discord (funciona no processo do site e no do bot); os cliques nos
// botões chegam ao bot pelo módulo src/modules/message-studio (customId "pyxs:<ação>:<msg>:<botão>").

const MESSAGE_FLAGS = {
  SUPPRESS_NOTIFICATIONS: 1 << 12,
  IS_COMPONENTS_V2: 1 << 15,
};

const LIMITS = {
  content: 2000,
  embeds: 10,
  embedTotal: 6000,
  title: 256,
  description: 4096,
  fields: 25,
  fieldName: 256,
  fieldValue: 1024,
  footer: 2048,
  author: 256,
  buttons: 25,
  buttonsPerRow: 5,
  buttonLabel: 80,
  v2Components: 40,
  v2Text: 4000,
  galleryImages: 10,
  modalFields: 5,
};

const BUTTON_STYLES = { primary: 1, secondary: 2, success: 3, danger: 4, link: 5 };
const ID_RE = /^[a-z0-9-]{1,40}$/;
const BUTTON_ID_RE = /^[a-z0-9]{1,12}$/;
const SNOWFLAKE_RE = /^\d{17,20}$/;
const MARY_KINDS = ['calculator', 'roblox_check', 'ticket', 'review'];

const str = (v, max = 10000) => (typeof v === 'string' ? v.slice(0, max) : '');
const isUrl = (v) => typeof v === 'string' && /^https:\/\/\S+$/i.test(v);
const isUrlOrVar = (v) => isUrl(v) || /^\{(user\.avatar|server\.icon|bot\.avatar)\}$/.test(v || '');

function slugify(text) {
  return (
    String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || `msg-${Date.now().toString(36)}`
  );
}

function normalizeEmbed(raw = {}) {
  return {
    color: /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : '#8b5cf6',
    author: { name: str(raw.author?.name, 300), iconUrl: str(raw.author?.iconUrl, 500), url: str(raw.author?.url, 500) },
    title: str(raw.title, 300),
    url: str(raw.url, 500),
    description: str(raw.description, 5000),
    fields: (Array.isArray(raw.fields) ? raw.fields : [])
      .slice(0, 30)
      .map((f) => ({ name: str(f?.name, 300), value: str(f?.value, 1100), inline: Boolean(f?.inline) })),
    thumbnailUrl: str(raw.thumbnailUrl, 500),
    imageUrl: str(raw.imageUrl, 500),
    footer: { text: str(raw.footer?.text, 2100), iconUrl: str(raw.footer?.iconUrl, 500) },
    timestamp: Boolean(raw.timestamp),
  };
}

function normalizeButton(raw = {}, index = 0) {
  const action = raw.action || {};
  const type = ['link', 'role', 'modal', 'tab', 'silent', 'mary'].includes(action.type) ? action.type : 'link';
  const clean = {
    id: BUTTON_ID_RE.test(raw.id || '') ? raw.id : `b${index}`,
    label: str(raw.label, 100),
    emoji: str(raw.emoji, 100),
    style: BUTTON_STYLES[raw.style] ? raw.style : type === 'link' ? 'link' : 'primary',
    row: Number.isInteger(raw.row) && raw.row >= 0 && raw.row < 5 ? raw.row : null,
    action: { type },
  };
  if (type === 'link') {
    clean.style = 'link';
    clean.action.url = str(action.url, 512);
  } else if (clean.style === 'link') {
    clean.style = 'primary';
  }
  if (type === 'role') {
    clean.action.roleId = SNOWFLAKE_RE.test(action.roleId || '') ? action.roleId : '';
    clean.action.mode = ['toggle', 'add', 'remove'].includes(action.mode) ? action.mode : 'toggle';
  }
  if (type === 'modal') {
    clean.action.title = str(action.title, 45);
    clean.action.targetChannelId = SNOWFLAKE_RE.test(action.targetChannelId || '') ? action.targetChannelId : '';
    clean.action.fields = (Array.isArray(action.fields) ? action.fields : []).slice(0, LIMITS.modalFields).map((f) => ({
      label: str(f?.label, 45),
      style: f?.style === 'paragraph' ? 'paragraph' : 'short',
      required: f?.required !== false,
    }));
  }
  // Ações da lojinha da Mary (calculadora, conferir nick, ticket, avaliação): só no servidor dela.
  if (type === 'mary') clean.action.kind = MARY_KINDS.includes(action.kind) ? action.kind : 'calculator';
  if (type === 'tab') {
    clean.action.tabId = BUTTON_ID_RE.test(action.tabId || '') ? action.tabId : '';
    clean.action.private = action.private !== false;
  }
  return clean;
}

function normalizeV2(raw) {
  if (!raw || typeof raw !== 'object') return { accentColor: '#8b5cf6', blocks: [] };
  const blocks = (Array.isArray(raw.blocks) ? raw.blocks : []).slice(0, 40).map((b) => {
    switch (b?.type) {
      case 'separator':
        return { type: 'separator', spacing: b.spacing === 'large' ? 'large' : 'small', divider: b.divider !== false };
      case 'gallery':
        return {
          type: 'gallery',
          images: (Array.isArray(b.images) ? b.images : []).slice(0, 12).map((i) => ({ url: str(i?.url, 500), description: str(i?.description, 1024) })),
        };
      case 'section':
        return {
          type: 'section',
          text: str(b.text, 4100),
          accessory:
            b.accessory?.type === 'button'
              ? { type: 'button', buttonId: str(b.accessory.buttonId, 12) }
              : b.accessory?.type === 'thumbnail'
                ? { type: 'thumbnail', url: str(b.accessory.url, 500) }
                : null,
        };
      case 'buttons':
        return { type: 'buttons', buttonIds: (Array.isArray(b.buttonIds) ? b.buttonIds : []).map((x) => str(x, 12)).slice(0, 5) };
      default:
        return { type: 'text', content: str(b?.content, 4100) };
    }
  });
  return { accentColor: /^#[0-9a-f]{6}$/i.test(raw.accentColor || '') ? raw.accentColor : '#8b5cf6', blocks };
}

function normalizeTab(raw = {}, index = 0) {
  return {
    id: BUTTON_ID_RE.test(raw.id || '') ? raw.id : `t${index}`,
    label: str(raw.label, 80),
    content: str(raw.content, 2100),
    embeds: (Array.isArray(raw.embeds) ? raw.embeds : []).slice(0, LIMITS.embeds).map(normalizeEmbed),
  };
}

const snowflake = (v) => (SNOWFLAKE_RE.test(String(v || '')) ? String(v) : '');
const clampInt = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

// Envio: agendado (data e hora), repetição com atividade mínima, fixa no fim do canal e fonte de fórum.
function normalizeDelivery(raw = {}) {
  const schedule = raw?.schedule && Number(raw.schedule.at) > 0 && snowflake(raw.schedule.channelId)
    ? { at: Number(raw.schedule.at), channelId: snowflake(raw.schedule.channelId) }
    : null;
  const repeat = raw?.repeat && snowflake(raw.repeat.channelId) && Number(raw.repeat.everyHours) > 0
    ? { everyHours: clampInt(raw.repeat.everyHours, 1, 168), minMessages: clampInt(raw.repeat.minMessages, 0, 100), channelId: snowflake(raw.repeat.channelId) }
    : null;
  const sticky = raw?.sticky && snowflake(raw.sticky.channelId)
    ? { channelId: snowflake(raw.sticky.channelId), delaySec: clampInt(raw.sticky.delaySec || 15, 5, 120) }
    : null;
  const source = raw?.source && snowflake(raw.source.threadId) && snowflake(raw.source.authorId)
    ? { threadId: snowflake(raw.source.threadId), authorId: snowflake(raw.source.authorId) }
    : null;
  return { channelId: snowflake(raw?.channelId), schedule, repeat, sticky, source };
}

// Documento limpo e completo, com os campos do modelo do plano (seção 5.3).
function normalizeMessage(raw = {}) {
  const mode = raw.mode === 'v2' ? 'v2' : 'classic';
  return {
    id: ID_RE.test(raw.id || '') ? raw.id : slugify(raw.name),
    name: str(raw.name, 100) || 'Mensagem',
    mode,
    envelope: {
      content: str(raw.envelope?.content, 2100),
      silent: Boolean(raw.envelope?.silent),
      identity: {
        useWebhook: Boolean(raw.envelope?.identity?.useWebhook),
        username: str(raw.envelope?.identity?.username, 80),
        avatarUrl: str(raw.envelope?.identity?.avatarUrl, 500),
      },
    },
    embeds: (Array.isArray(raw.embeds) ? raw.embeds : []).slice(0, 12).map(normalizeEmbed),
    v2: mode === 'v2' ? normalizeV2(raw.v2) : null,
    tabs: (Array.isArray(raw.tabs) ? raw.tabs : []).slice(0, 10).map(normalizeTab),
    buttons: (Array.isArray(raw.buttons) ? raw.buttons : []).slice(0, 30).map(normalizeButton),
    delivery: normalizeDelivery(raw.delivery),
  };
}

// ---------- Validação (limites do Discord) ----------

function embedLength(e) {
  return (
    e.title.length +
    e.description.length +
    e.author.name.length +
    e.footer.text.length +
    e.fields.reduce((n, f) => n + f.name.length + f.value.length, 0)
  );
}

function countV2Components(doc) {
  // Container conta como 1; cada bloco e seus filhos também.
  let n = 1;
  const byId = new Map(doc.buttons.map((b) => [b.id, b]));
  for (const b of doc.v2.blocks) {
    if (b.type === 'section') n += 2 + (b.accessory ? 1 : 0);
    else if (b.type === 'buttons') n += 1 + b.buttonIds.filter((id) => byId.has(id)).length;
    else if (b.type === 'gallery') n += 1;
    else n += 1;
  }
  return n;
}

// Devolve uma lista de { code, path, limit? }; vazia quando está tudo certo.
function validateMessage(doc) {
  const errors = [];
  const push = (code, p, limit) => errors.push(limit ? { code, path: p, limit } : { code, path: p });

  if (doc.envelope.content.length > LIMITS.content) push('too_long', 'envelope.content', LIMITS.content);
  if (doc.buttons.length > LIMITS.buttons) push('too_many', 'buttons', LIMITS.buttons);

  if (doc.mode === 'classic') {
    if (doc.embeds.length > LIMITS.embeds) push('too_many', 'embeds', LIMITS.embeds);
    let total = 0;
    doc.embeds.forEach((e, i) => {
      const p = `embeds.${i}`;
      if (e.title.length > LIMITS.title) push('too_long', `${p}.title`, LIMITS.title);
      if (e.description.length > LIMITS.description) push('too_long', `${p}.description`, LIMITS.description);
      if (e.author.name.length > LIMITS.author) push('too_long', `${p}.author.name`, LIMITS.author);
      if (e.footer.text.length > LIMITS.footer) push('too_long', `${p}.footer.text`, LIMITS.footer);
      if (e.fields.length > LIMITS.fields) push('too_many', `${p}.fields`, LIMITS.fields);
      e.fields.forEach((f, j) => {
        if (!f.name.trim() || !f.value.trim()) push('empty_field', `${p}.fields.${j}`);
        if (f.name.length > LIMITS.fieldName) push('too_long', `${p}.fields.${j}.name`, LIMITS.fieldName);
        if (f.value.length > LIMITS.fieldValue) push('too_long', `${p}.fields.${j}.value`, LIMITS.fieldValue);
      });
      for (const key of ['thumbnailUrl', 'imageUrl']) {
        if (e[key] && !isUrlOrVar(e[key])) push('invalid_url', `${p}.${key}`);
      }
      if (e.url && !isUrl(e.url)) push('invalid_url', `${p}.url`);
      if (!embedLength(e) && !e.imageUrl && !e.thumbnailUrl) push('empty_embed', p);
      total += embedLength(e);
    });
    if (total > LIMITS.embedTotal) push('too_long', 'embeds', LIMITS.embedTotal);
    if (!doc.envelope.content.trim() && doc.embeds.length === 0) push('empty_message', 'message');
    const rows = new Map();
    doc.buttons.forEach((b, i) => {
      const r = b.row ?? Math.floor(i / LIMITS.buttonsPerRow);
      rows.set(r, (rows.get(r) || 0) + 1);
    });
    for (const [r, n] of rows) if (n > LIMITS.buttonsPerRow) push('too_many', `buttons.row${r}`, LIMITS.buttonsPerRow);
  } else {
    // Formato novo: proibido texto avulso e embeds clássicos.
    if (doc.envelope.content.trim()) push('v2_no_content', 'envelope.content');
    if (doc.embeds.length) push('v2_no_embeds', 'embeds');
    if (!doc.v2.blocks.length) push('empty_message', 'v2.blocks');
    const comps = countV2Components(doc);
    if (comps > LIMITS.v2Components) push('too_many', 'v2.components', LIMITS.v2Components);
    const textTotal = doc.v2.blocks.reduce((n, b) => n + (b.content?.length || 0) + (b.text?.length || 0), 0);
    if (textTotal > LIMITS.v2Text) push('too_long', 'v2.text', LIMITS.v2Text);
    doc.v2.blocks.forEach((b, i) => {
      if (b.type === 'gallery') {
        if (!b.images.length || b.images.length > LIMITS.galleryImages) push('too_many', `v2.blocks.${i}.images`, LIMITS.galleryImages);
        b.images.forEach((img, j) => {
          if (!isUrlOrVar(img.url)) push('invalid_url', `v2.blocks.${i}.images.${j}`);
        });
      }
      if (b.type === 'section' && b.accessory?.type === 'thumbnail' && !isUrlOrVar(b.accessory.url)) push('invalid_url', `v2.blocks.${i}.accessory`);
      if ((b.type === 'text' && !b.content.trim()) || (b.type === 'section' && !b.text.trim())) push('empty_block', `v2.blocks.${i}`);
    });
  }

  doc.buttons.forEach((b, i) => {
    const p = `buttons.${i}`;
    if (!b.label && !b.emoji) push('button_empty', p);
    if (b.label.length > LIMITS.buttonLabel) push('too_long', `${p}.label`, LIMITS.buttonLabel);
    if (b.action.type === 'link' && !/^(https:\/\/|discord:\/\/)/.test(b.action.url || '')) push('invalid_url', `${p}.url`);
    if (b.action.type === 'role' && !b.action.roleId) push('missing_role', p);
    if (b.action.type === 'modal') {
      if (!b.action.targetChannelId) push('missing_channel', p);
      if (!b.action.fields.length) push('missing_fields', p);
      if (!b.action.title) push('missing_title', p);
    }
    if (b.action.type === 'tab' && !doc.tabs.some((t) => t.id === b.action.tabId)) push('missing_tab', p);
  });
  const ids = doc.buttons.map((b) => b.id);
  if (new Set(ids).size !== ids.length) push('duplicate_button', 'buttons');

  return errors;
}

// ---------- Variáveis e emojis ----------

// AGENTS.md §7: o portal do Minecraft (portalframe98) é proibido em todo o ecossistema.
const FORBIDDEN_EMOJI_IDS = new Set(['1548444170488778954']);

let emojiIndex = null;
function getAppEmojiIndex() {
  if (emojiIndex) return emojiIndex;
  emojiIndex = new Map();
  try {
    const data = require('../data/discordAppEmojis.json');
    for (const e of data.items || []) {
      if (!FORBIDDEN_EMOJI_IDS.has(String(e.id))) emojiIndex.set(e.name.toLowerCase(), e);
    }
  } catch (_) {}
  return emojiIndex;
}

const emojiUrl = (id, animated) => `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`;

// Emojis do app mais as chaves canônicas do appEmojis.js (ex.: {emoji:map}), já resolvidas.
function listAppEmojis() {
  const list = [...getAppEmojiIndex().values()].map((e) => ({ name: e.name, id: e.id, animated: Boolean(e.animated), url: emojiUrl(e.id, e.animated) }));
  const names = new Set(list.map((e) => e.name.toLowerCase()));
  try {
    const { listCanonicalKeys } = require('../utils/appEmojis');
    for (const key of listCanonicalKeys()) {
      const name = key.toLowerCase();
      const m = resolveEmojiKey(key).match(/^<(a?):\w+:(\d+)>$/);
      if (!m || names.has(name)) continue;
      names.add(name);
      list.unshift({ name, id: m[2], animated: Boolean(m[1]), url: emojiUrl(m[2], m[1]), canonical: true });
    }
  } catch (_) {}
  return list;
}

function resolveEmojiKey(key) {
  const e = getAppEmojiIndex().get(String(key).toLowerCase());
  if (e) return `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`;
  // Chaves canônicas do appEmojis.js (ex.: {emoji:MAP}).
  try {
    const { getEmoji } = require('../utils/appEmojis');
    const resolved = getEmoji(String(key).toUpperCase());
    if (resolved && resolved !== String(key).toUpperCase() && ![...FORBIDDEN_EMOJI_IDS].some((id) => resolved.includes(id))) return resolved;
  } catch (_) {}
  return '';
}

// ctx: { user: {id, username, avatarUrl}, guild: {name, iconUrl}, botAvatarUrl, now }
function resolveText(text, ctx = {}) {
  if (!text) return '';
  const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short' }).format(ctx.now || new Date());
  return text
    .replace(/\{emoji:([a-zA-Z0-9_]+)\}/g, (_, k) => resolveEmojiKey(k))
    .replace(/\{user\.avatar\}/g, ctx.user?.avatarUrl || '')
    .replace(/\{user\}/g, ctx.user?.id ? `<@${ctx.user.id}>` : '')
    .replace(/\{server\.icon\}/g, ctx.guild?.iconUrl || '')
    .replace(/\{server\}/g, ctx.guild?.name || '')
    .replace(/\{bot\.avatar\}/g, ctx.botAvatarUrl || '')
    .replace(/\{date\}/g, date)
    .replace(/\{([a-z0-9_]+)\}/g, (m, k) => (ctx.vars && Object.prototype.hasOwnProperty.call(ctx.vars, k) ? ctx.vars[k] : m));
}

// Variáveis próprias de um servidor ({estoque}, {preco_1k}... na lojinha da Mary).
function guildVars(guildId) {
  if (String(guildId) !== require('../config/scopes').MARY_GUILD_ID) return null;
  try {
    return require('../modules/mary-studio/maryStudioManager').getVariables();
  } catch (_) {
    return null;
  }
}

// ---------- Montagem do payload ----------

const hexToInt = (hex) => parseInt(String(hex).replace('#', ''), 16) || 0x8b5cf6;

function parseEmoji(raw) {
  if (!raw) return undefined;
  const custom = raw.match(/^<(a?):(\w+):(\d+)>$/);
  if (custom) return { id: custom[3], name: custom[2], animated: Boolean(custom[1]) };
  return { name: raw };
}

function buildButton(doc, b, ctx) {
  const emojiRaw = b.emoji ? resolveText(b.emoji, ctx) : '';
  const out = { type: 2, style: BUTTON_STYLES[b.style] || 1 };
  if (b.label) out.label = resolveText(b.label, ctx).slice(0, LIMITS.buttonLabel);
  if (emojiRaw) out.emoji = parseEmoji(emojiRaw);
  // Link fora do ar (monitor de links): usa o reserva ou a cópia do Web Archive enquanto isso.
  if (b.action.type === 'link') out.url = require('./linkSentinel').resolveLiveUrl(b.action.url);
  else if (b.action.type === 'mary') out.custom_id = `mary_btn:${b.action.kind}:${b.id}`;
  else out.custom_id = `pyxs:${b.action.type}:${doc.id}:${b.id}`;
  return out;
}

function buildEmbedJson(e, ctx) {
  const out = { color: hexToInt(e.color) };
  if (e.title) out.title = resolveText(e.title, ctx);
  if (e.url) out.url = e.url;
  if (e.description) out.description = resolveText(e.description, ctx);
  if (e.author.name) {
    out.author = { name: resolveText(e.author.name, ctx) };
    if (e.author.iconUrl) out.author.icon_url = resolveText(e.author.iconUrl, ctx);
    if (e.author.url) out.author.url = e.author.url;
  }
  if (e.fields.length) out.fields = e.fields.map((f) => ({ name: resolveText(f.name, ctx), value: resolveText(f.value, ctx), inline: f.inline }));
  if (e.thumbnailUrl) out.thumbnail = { url: resolveText(e.thumbnailUrl, ctx) };
  if (e.imageUrl) out.image = { url: resolveText(e.imageUrl, ctx) };
  if (e.footer.text) {
    out.footer = { text: resolveText(e.footer.text, ctx) };
    if (e.footer.iconUrl) out.footer.icon_url = resolveText(e.footer.iconUrl, ctx);
  }
  if (e.timestamp) out.timestamp = (ctx.now || new Date()).toISOString();
  return out;
}

function buildButtonRows(doc, buttons, ctx) {
  const rows = [];
  buttons.forEach((b, i) => {
    const r = b.row ?? Math.floor(i / LIMITS.buttonsPerRow);
    rows[r] = rows[r] || { type: 1, components: [] };
    rows[r].components.push(buildButton(doc, b, ctx));
  });
  return rows.filter(Boolean);
}

// Payload pronto para POST /channels/{id}/messages (ou PATCH na edição).
// options.tab: id da aba a renderizar no lugar do conteúdo principal (formato clássico).
function buildPayload(doc, ctx = {}, options = {}) {
  const flags = doc.envelope.silent ? MESSAGE_FLAGS.SUPPRESS_NOTIFICATIONS : 0;
  const allowedMentions = options.allowedMentions || { parse: [], users: [], roles: [] };
  const byId = new Map(doc.buttons.map((b) => [b.id, b]));

  if (doc.mode === 'v2') {
    const usedInBlocks = new Set();
    const components = doc.v2.blocks
      .map((b) => {
        if (b.type === 'text') return { type: 10, content: resolveText(b.content, ctx) };
        if (b.type === 'separator') return { type: 14, divider: b.divider, spacing: b.spacing === 'large' ? 2 : 1 };
        if (b.type === 'gallery') {
          return {
            type: 12,
            items: b.images.map((i) => ({ media: { url: resolveText(i.url, ctx) }, ...(i.description ? { description: i.description } : {}) })),
          };
        }
        if (b.type === 'section') {
          const section = { type: 9, components: [{ type: 10, content: resolveText(b.text, ctx) }] };
          if (b.accessory?.type === 'thumbnail') section.accessory = { type: 11, media: { url: resolveText(b.accessory.url, ctx) } };
          if (b.accessory?.type === 'button' && byId.has(b.accessory.buttonId)) {
            usedInBlocks.add(b.accessory.buttonId);
            section.accessory = buildButton(doc, byId.get(b.accessory.buttonId), ctx);
          }
          // Seção sem acessório não é aceita pelo Discord: vira texto simples.
          return section.accessory ? section : section.components[0];
        }
        if (b.type === 'buttons') {
          const row = b.buttonIds.filter((id) => byId.has(id)).map((id) => {
            usedInBlocks.add(id);
            return buildButton(doc, byId.get(id), ctx);
          });
          return row.length ? { type: 1, components: row } : null;
        }
        return null;
      })
      .filter(Boolean);
    const rest = doc.buttons.filter((b) => !usedInBlocks.has(b.id));
    const container = { type: 17, accent_color: hexToInt(doc.v2.accentColor), components };
    return {
      flags: flags | MESSAGE_FLAGS.IS_COMPONENTS_V2,
      components: [container, ...buildButtonRows(doc, rest, ctx)],
      allowed_mentions: allowedMentions,
    };
  }

  const tab = options.tab ? doc.tabs.find((t) => t.id === options.tab) : null;
  const content = resolveText(tab ? tab.content : doc.envelope.content, ctx);
  const embeds = (tab ? tab.embeds : doc.embeds).map((e) => buildEmbedJson(e, ctx));
  const payload = { allowed_mentions: allowedMentions };
  if (content) payload.content = content;
  if (embeds.length) payload.embeds = embeds;
  const rows = buildButtonRows(doc, doc.buttons, ctx);
  if (rows.length) payload.components = rows;
  if (flags) payload.flags = flags;
  return payload;
}

/**
 * Monta um modelo pronto de "Escolha seus cargos" (Item #7) com até 25 botões de cargo
 * no Estúdio de Mensagens, verificando limites e organizando em linhas de 5.
 */
function buildRolePanelPreset({ id = '', name = '', title = '', description = '', roles = [], channelId = '' } = {}) {
  const validRoles = (Array.isArray(roles) ? roles : [])
    .filter((r) => r && SNOWFLAKE_RE.test(String(r.id || r.roleId || '')))
    .slice(0, LIMITS.buttons);

  const buttons = validRoles.map((r, idx) => ({
    id: `r${idx + 1}`,
    label: str(r.label || r.name || `Cargo ${idx + 1}`, LIMITS.buttonLabel),
    emoji: str(r.emoji || '🏷️', 60),
    style: BUTTON_STYLES[r.style] ? r.style : 'secondary',
    row: Math.floor(idx / LIMITS.buttonsPerRow),
    action: {
      type: 'role',
      roleId: String(r.id || r.roleId),
      mode: ['toggle', 'add', 'remove'].includes(r.mode) ? r.mode : 'toggle',
    },
  }));

  const roleLines = validRoles.map((r) => `• ${r.emoji || '🏷️'} **${str(r.label || r.name, 80)}**`);
  const defaultDesc = [
    description || 'Clique nos botões abaixo para adicionar ou remover seus cargos quando quiser.',
    roleLines.length ? roleLines.join('\n') : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return normalizeMessage({
    id: id || `cargos-${Date.now().toString(36)}`,
    name: name || 'Escolha seus cargos',
    mode: 'classic',
    envelope: { content: '', silent: true },
    embeds: [
      {
        color: '#8b5cf6',
        title: title || '🏷️ Escolha seus cargos',
        description: defaultDesc,
        footer: { text: '{server}' },
        timestamp: false,
      },
    ],
    buttons,
    delivery: { channelId: snowflake(channelId) },
  });
}

module.exports = {
  LIMITS,
  MESSAGE_FLAGS,
  MARY_KINDS,
  guildVars,
  slugify,
  normalizeMessage,
  validateMessage,
  resolveText,
  listAppEmojis,
  buildPayload,
  buildRolePanelPreset,
};
