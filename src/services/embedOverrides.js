// Personalização de qualquer embed da Pyxie num servidor (plano 5.2): cor, textos, imagens e troca de emojis.
// Os comandos não mudam: o gancho fica no REST do bot e altera o embed logo antes de ele sair para o Discord.
// - Catálogo automático: cada embed enviado no servidor vira uma entrada (comando + "esqueleto" do título),
//   com a última amostra e as últimas mensagens de canal, para editar e atualizar o que já foi enviado.
// - data/guilds/<guildId>/embedOverrides.json (mudanças do dono) e embedCatalog.json (escrito pelo bot).
// - Textos: vazio mantém o original; {original} insere o texto da Pyxie; {emoji:nome} vira o emoji do app.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { AsyncLocalStorage } = require('node:async_hooks');
const { CRINGELANDIA_GUILD_ID } = require('../config/scopes');
const quips = require('./pyxieQuips');

// Só o servidor oficial por enquanto (o painel também só mostra para o dono de lá).
const ENABLED_GUILDS = new Set([CRINGELANDIA_GUILD_ID]);
const CATALOG_LIMIT = 400;
const SENT_PER_ENTRY = 5;
const SWAPS_LIMIT = 40;
const LIMITS = { title: 256, description: 4096, footer: 2048, author: 256, fieldName: 256, fieldValue: 1024 };

// Rostinhos da Pyxie no ícone do rodapé (padrão visual em todos os servidores). Arquivos em
// assets/pyxie/sticker/footer/, servidos pelo site em /assets.
const FOOTER_MOODS = ['happy', 'sad', 'smile', 'worried'];
const footerIconUrl = (mood) => `${(process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '')}/assets/pyxie/sticker/footer/${mood}.png`;
const MOOD_RULES = [
  ['worried', /❌|⚠️|⛔|🚫|⏳|\berr(o|or)\b|falh|\bfail|não consegu|couldn.t|can.t|cannot|não pode|negad|denied|sem permiss|permission|aguarde|espere|cooldown|\bwait\b|inválid|invalid/i],
  ['sad', /perdeu|derrota|\blost\b|defeat|game over|morreu|\bdied\b|faliu|que pena|too bad|acabou o tempo|time.s up/i],
  ['happy', /✅|🎉|🏆|🥳|vitória|victory|venceu|\bwon\b|parabéns|congrat|ganhou|recompensa|reward|subiu de nível|level up|conquist|achievement/i],
];

function pickMood(embed) {
  const text = `${embed?.title || ''} ${embed?.author?.name || ''} ${String(embed?.description || '').slice(0, 300)}`;
  for (const [mood, re] of MOOD_RULES) if (re.test(text)) return mood;
  return 'smile';
}

/** Põe o rostinho no rodapé quando o embed tem texto de rodapé e ainda não tem ícone. */
function decorateFooter(embed, choice = 'auto') {
  if (!embed?.footer?.text || embed.footer.icon_url || choice === 'none') return embed;
  const mood = FOOTER_MOODS.includes(choice) ? choice : pickMood(embed);
  return { ...embed, footer: { ...embed.footer, icon_url: footerIconUrl(mood) } };
}

// Miniaturas decorativas da Pyxie. Automática só em poucos embeds: os curtos de comemoração sem imagem.
// Nos painéis fixos (cores, porta de entrada) a pixel art é posta direto na mensagem.
const assetUrl = (rel) => `${(process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '')}/assets/pyxie/${rel}`;
const THUMBS = { pixel: assetUrl('pyxie_pixelart.png'), victory: assetUrl('sticker/sticker_win_victory.png') };

function decorateThumb(embed) {
  if (!embed || embed.thumbnail?.url || embed.image?.url) return embed;
  const short = String(embed.description || '').length <= 400 && (embed.fields || []).length <= 3;
  if (!short || pickMood(embed) !== 'happy') return embed;
  return { ...embed, thumbnail: { url: THUMBS.victory } };
}

const decorate = (embed, o = {}) => {
  const withFooter = decorateFooter(embed, o.footerIcon);
  return o.thumbnailUrl === 'none' ? withFooter : decorateThumb(withFooter);
};

const als = new AsyncLocalStorage();

function dataDir(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId));
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

const str = (v, max) => String(v ?? '').slice(0, max);
const isHex = (v) => /^#[0-9a-f]{6}$/i.test(String(v || ''));
const isUrl = (v) => /^https:\/\/\S+$/.test(String(v || ''));

// ---------- Mudanças do dono ----------

function normalizeSwaps(list) {
  return (Array.isArray(list) ? list : [])
    .map((s) => ({ from: str(s?.from, 80).trim(), to: str(s?.to, 120).trim() }))
    .filter((s) => s.from && s.to && s.from !== s.to)
    .slice(0, SWAPS_LIMIT);
}

function normalizeOverride(raw = {}) {
  return {
    color: isHex(raw.color) ? raw.color.toLowerCase() : '',
    title: str(raw.title, LIMITS.title + 40),
    description: str(raw.description, LIMITS.description + 40),
    footer: str(raw.footer, LIMITS.footer),
    author: str(raw.author, LIMITS.author),
    // 'none' tira a miniatura (inclusive a automática).
    thumbnailUrl: raw.thumbnailUrl === 'none' ? 'none' : isUrl(raw.thumbnailUrl) ? str(raw.thumbnailUrl, 500) : '',
    imageUrl: isUrl(raw.imageUrl) ? str(raw.imageUrl, 500) : '',
    footerIcon: [...FOOTER_MOODS, 'none'].includes(raw.footerIcon) ? raw.footerIcon : 'auto',
    emojiSwaps: normalizeSwaps(raw.emojiSwaps),
  };
}

const isEmptyOverride = (o) =>
  !o.color && !o.title && !o.description && !o.footer && !o.author && !o.thumbnailUrl && !o.imageUrl && o.footerIcon === 'auto' && !o.emojiSwaps.length;

const overridesCache = new Map(); // guildId -> { at, data }
function loadOverrides(guildId) {
  const hit = overridesCache.get(guildId);
  if (hit && Date.now() - hit.at < 3000) return hit.data;
  const raw = readJson(path.join(dataDir(guildId), 'embedOverrides.json'), {});
  const data = { global: { emojiSwaps: normalizeSwaps(raw.global?.emojiSwaps) }, embeds: {} };
  for (const [key, o] of Object.entries(raw.embeds || {})) data.embeds[key] = { ...normalizeOverride(o), updatedAt: Number(o.updatedAt) || 0 };
  overridesCache.set(guildId, { at: Date.now(), data });
  return data;
}

function saveOverrides(guildId, data) {
  writeJson(path.join(dataDir(guildId), 'embedOverrides.json'), data);
  overridesCache.delete(guildId);
}

function setOverride(guildId, key, raw) {
  const data = loadOverrides(guildId);
  const next = normalizeOverride(raw);
  const embeds = { ...data.embeds };
  if (isEmptyOverride(next)) delete embeds[key];
  else embeds[key] = { ...next, updatedAt: Date.now() };
  saveOverrides(guildId, { ...data, embeds });
  return embeds[key] || null;
}

function setGlobalSwaps(guildId, swaps) {
  const data = loadOverrides(guildId);
  const global = { emojiSwaps: normalizeSwaps(swaps) };
  saveOverrides(guildId, { ...data, global });
  return global;
}

// ---------- Identidade de um embed ----------

const CUSTOM_EMOJI_RE = /<a?:\w+:\d+>/g;
const EMOJI_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}‍️]/gu;

// "Esqueleto" do título: sem emojis, menções, números, links e nomes de quem usou o comando,
// para que o mesmo embed tenha a mesma chave para todo mundo.
function skeleton(text, names = []) {
  let s = String(text || '').toLowerCase();
  for (const n of names) if (n && n.length > 1) s = s.split(String(n).toLowerCase()).join(' ');
  return s
    .replace(CUSTOM_EMOJI_RE, ' ')
    .replace(/<[@#][!&]?\d+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(EMOJI_RE, ' ')
    .replace(/[^\p{L}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join(' ');
}

function embedKey(command, embed, names = []) {
  const base = embed?.title || embed?.author?.name || String(embed?.description || '').split('\n')[0];
  const shape = skeleton(base, names) || 'sem titulo';
  const cmd = command || 'automatico';
  const key = crypto.createHash('sha1').update(`${cmd}|${shape}`).digest('hex').slice(0, 12);
  return { key, command: cmd, shape };
}

// ---------- Aplicação ----------

let resolveEmojis = (text) => text;
try {
  // {emoji:nome} -> emoji do app, igual ao estúdio de mensagens.
  const { resolveText } = require('./messageStudio');
  resolveEmojis = (text) => resolveText(text, {});
} catch (_) {}

function swapText(text, swaps) {
  if (!text || !swaps.length) return text;
  let out = text;
  for (const s of swaps) out = out.split(s.from).join(s.resolvedTo);
  return out;
}

function template(tpl, original) {
  if (!tpl) return original;
  return resolveEmojis(tpl.split('{original}').join(original || ''));
}

const prepareSwaps = (...lists) => lists.flat().map((s) => ({ from: resolveEmojis(s.from), resolvedTo: resolveEmojis(s.to) }));

/** Aplica a mudança do dono e as trocas de emoji a um embed no formato da API. Devolve um objeto novo. */
function applyToEmbed(embed, override, globalSwaps = []) {
  const o = override || normalizeOverride({});
  const swaps = prepareSwaps(globalSwaps, o.emojiSwaps);
  const e = JSON.parse(JSON.stringify(embed || {}));
  const fit = (text, max) => (text && text.length > max ? `${text.slice(0, max - 1)}…` : text);
  if (o.color) e.color = parseInt(o.color.slice(1), 16);
  if (o.title || e.title) e.title = fit(swapText(template(o.title, e.title || ''), swaps), LIMITS.title) || undefined;
  if (o.description || e.description) e.description = fit(swapText(template(o.description, e.description || ''), swaps), LIMITS.description) || undefined;
  if (o.footer || e.footer?.text) e.footer = { ...(e.footer || {}), text: fit(swapText(template(o.footer, e.footer?.text || ''), swaps), LIMITS.footer) };
  if (o.author || e.author?.name) e.author = { ...(e.author || {}), name: fit(swapText(template(o.author, e.author?.name || ''), swaps), LIMITS.author) };
  if (Array.isArray(e.fields)) {
    e.fields = e.fields.map((f) => ({ ...f, name: fit(swapText(f.name, swaps), LIMITS.fieldName), value: fit(swapText(f.value, swaps), LIMITS.fieldValue) }));
  }
  if (o.thumbnailUrl === 'none') delete e.thumbnail;
  else if (o.thumbnailUrl) e.thumbnail = { url: o.thumbnailUrl };
  if (o.imageUrl) e.image = { url: o.imageUrl };
  if (e.footer && !e.footer.text) delete e.footer;
  if (e.author && !e.author.name) delete e.author;
  if (o.footerIcon === 'none' && e.footer) delete e.footer.icon_url;
  else if (o.footerIcon !== 'auto' && e.footer) e.footer.icon_url = footerIconUrl(o.footerIcon);
  return decorate(e, o);
}

// Emoji de botão ou menu: troca o emoji unicode (ou de outro servidor) pelo do app.
function swapComponentEmoji(emoji, swaps) {
  if (!emoji) return emoji;
  const current = emoji.id ? `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>` : emoji.name;
  const hit = swaps.find((s) => s.from === current);
  if (!hit) return emoji;
  const m = hit.resolvedTo.match(/^<(a?):(\w+):(\d+)>$/);
  return m ? { id: m[3], name: m[2], animated: Boolean(m[1]) } : { name: hit.resolvedTo };
}

function applyToComponents(components, globalSwaps) {
  const swaps = prepareSwaps(globalSwaps);
  if (!Array.isArray(components) || !swaps.length) return components;
  const walk = (c) => {
    const out = { ...c };
    if (out.emoji) out.emoji = swapComponentEmoji(out.emoji, swaps);
    if (Array.isArray(out.options)) out.options = out.options.map((opt) => (opt.emoji ? { ...opt, emoji: swapComponentEmoji(opt.emoji, swaps) } : opt));
    if (Array.isArray(out.components)) out.components = out.components.map(walk);
    if (out.accessory) out.accessory = walk(out.accessory);
    return out;
  };
  return components.map(walk);
}

// ---------- Contexto (quem e qual comando originou o envio) ----------

function langOf(source) {
  try {
    return require('../utils/i18n').getLanguage(source) === 'en' ? 'en' : 'pt';
  } catch (_) {
    return 'pt';
  }
}

function contextFromInteraction(i) {
  const names = [i.user?.username, i.user?.globalName, i.member?.nickname, i.member?.displayName].filter(Boolean);
  const command = i.commandName ? `/${i.commandName}` : i.message?.interaction?.commandName ? `/${i.message.interaction.commandName}` : i.customId ? `botão:${String(i.customId).split(/[:_|]/)[0]}` : null;
  // Semente da fala da Pyxie: a interação que abriu a mensagem, para a fala não mudar a cada botão.
  const seed = i.message?.interactionMetadata?.id || i.message?.interaction?.id || i.id || null;
  return { guildId: i.guildId || null, command, names, lang: langOf(i), seed };
}

function contextFromMessage(m) {
  const names = [m.author?.username, m.author?.globalName, m.member?.nickname, m.member?.displayName].filter(Boolean);
  const word = String(m.content || '').match(/^\s*py[!.]?\s*([\w-]+)/i);
  return { guildId: m.guildId || null, command: word ? `py!${word[1].toLowerCase()}` : 'mensagem', names, lang: langOf(m), seed: m.id || null };
}

// ---------- Catálogo (processo do bot) ----------

const catalogs = new Map(); // guildId -> { entries }
const dirty = new Set();

function loadCatalog(guildId) {
  if (!catalogs.has(guildId)) catalogs.set(guildId, readJson(path.join(dataDir(guildId), 'embedCatalog.json'), { entries: {} }));
  return catalogs.get(guildId);
}

function readCatalog(guildId) {
  return readJson(path.join(dataDir(guildId), 'embedCatalog.json'), { entries: {} });
}

function record(guildId, id, embed, sentRef = null) {
  const cat = loadCatalog(guildId);
  const prev = cat.entries[id.key];
  const sample = JSON.parse(JSON.stringify(embed));
  if (sample.description) sample.description = String(sample.description).slice(0, 1500);
  const entry = prev || { key: id.key, command: id.command, shape: id.shape, count: 0, sent: [] };
  entry.count += 1;
  entry.lastSeen = Date.now();
  entry.sample = sample;
  if (sentRef) entry.sent = [sentRef, ...entry.sent.filter((s) => s.messageId !== sentRef.messageId)].slice(0, SENT_PER_ENTRY);
  cat.entries[id.key] = entry;
  const keys = Object.keys(cat.entries);
  if (keys.length > CATALOG_LIMIT) {
    keys.sort((a, b) => (cat.entries[a].lastSeen || 0) - (cat.entries[b].lastSeen || 0));
    for (const k of keys.slice(0, keys.length - CATALOG_LIMIT)) delete cat.entries[k];
  }
  dirty.add(guildId);
}

function flushCatalogs() {
  for (const guildId of dirty) {
    try {
      writeJson(path.join(dataDir(guildId), 'embedCatalog.json'), catalogs.get(guildId));
    } catch (err) {
      console.error('[EmbedOverrides] Falha ao salvar o catálogo:', err.message);
    }
  }
  dirty.clear();
}

// ---------- Transformação de um pedido ao Discord ----------

const CHANNEL_MSG_RE = /^\/channels\/(\d+)\/messages(?:\/(\d+))?$/;
const CALLBACK_RE = /^\/interactions\/\d+\/[^/]+\/callback$/;
const WEBHOOK_RE = /^\/webhooks\/(\d+)\/[^/]+(?:\/messages\/(?:@original|\d+))?$/;

/**
 * Recebe o corpo de um envio e devolve { body, seen }. seen lista os embeds originais (para o catálogo).
 * Em qualquer lugar: rostinho no rodapé. Só nos servidores ligados: mudanças do dono e catálogo.
 */
function transformBody(guildId, body, ctx = {}) {
  if (!body || typeof body !== 'object') return { body, seen: [] };
  const target = body.data && typeof body.data === 'object' && (body.type === 4 || body.type === 7) ? body.data : body.data ? null : body;
  if (!target || (!Array.isArray(target.embeds) && !Array.isArray(target.components))) return { body, seen: [] };
  const enabled = Boolean(guildId) && ENABLED_GUILDS.has(String(guildId));
  const { global, embeds: overrides } = enabled ? loadOverrides(String(guildId)) : { global: { emojiSwaps: [] }, embeds: {} };
  const seen = [];
  const next = { ...target };
  if (Array.isArray(target.embeds)) {
    // Fala da Pyxie (pyxieQuips.js) só no primeiro embed dos comandos interativos e nunca em erro.
    const quip = target.embeds[0] && pickMood(target.embeds[0]) !== 'worried' ? quips.quipFor(ctx.command, ctx.lang, ctx.seed) : null;
    next.embeds = target.embeds.map((embed, index) => {
      const withQuip = index === 0 && quip ? quips.addQuip(embed, quip) : embed;
      if (!enabled) return decorate(withQuip);
      const id = embedKey(ctx.command, embed, ctx.names);
      seen.push({ id, index, original: embed });
      const o = overrides[id.key];
      return o || global.emojiSwaps.length ? applyToEmbed(withQuip, o, global.emojiSwaps) : decorate(withQuip);
    });
  }
  if (Array.isArray(target.components) && global.emojiSwaps.length) next.components = applyToComponents(target.components, global.emojiSwaps);
  return { body: target === body ? next : { ...body, data: next }, seen };
}

/** Liga o gancho no cliente do bot: contexto por evento e troca dos embeds no REST. */
function install(client) {
  if (client.__pyxieEmbedOverrides) return;
  client.__pyxieEmbedOverrides = true;

  const emit = client.emit.bind(client);
  client.emit = (event, ...args) => {
    try {
      if (event === 'interactionCreate' && args[0]) return als.run(contextFromInteraction(args[0]), () => emit(event, ...args));
      if (event === 'messageCreate' && args[0]) return als.run(contextFromMessage(args[0]), () => emit(event, ...args));
    } catch (_) {}
    return emit(event, ...args);
  };

  const rest = client.rest;
  const request = rest.request.bind(rest);
  rest.request = async (options) => {
    let seen = [];
    let channelId = null;
    let guildId = null;
    try {
      const route = options?.fullRoute || '';
      const method = options?.method;
      const ctx = als.getStore() || {};
      const channelMatch = route.match(CHANNEL_MSG_RE);
      let isMessage = false;
      if (channelMatch && (method === 'POST' || method === 'PATCH')) {
        isMessage = true;
        channelId = channelMatch[1];
        guildId = client.channels.cache.get(channelId)?.guildId || null;
      } else if ((CALLBACK_RE.test(route) && method === 'POST') || (WEBHOOK_RE.test(route) && route.split('/')[2] === client.application?.id && (method === 'POST' || method === 'PATCH'))) {
        isMessage = true;
        guildId = ctx.guildId || null;
      }
      if (isMessage) {
        const out = transformBody(guildId, options.body, ctx);
        seen = out.seen;
        if (out.body !== options.body) options = { ...options, body: out.body };
      }
    } catch (err) {
      console.error('[EmbedOverrides] Falha ao aplicar personalização (envio segue sem ela):', err.message);
      seen = [];
    }
    const result = await request(options);
    if (seen.length) {
      try {
        // Só mensagens de canal guardam referência para "atualizar as já enviadas".
        const messageId = channelId && options.method === 'POST' && result?.id ? result.id : null;
        for (const s of seen) record(guildId, s.id, s.original, messageId ? { channelId, messageId, index: s.index, original: s.original, at: Date.now() } : null);
      } catch (_) {}
    }
    return result;
  };

  setInterval(flushCatalogs, 15000).unref?.();
  process.once('beforeExit', flushCatalogs);
}

// ---------- Painel ----------

function listCatalog(guildId) {
  const { embeds } = loadOverrides(guildId);
  return Object.values(readCatalog(guildId).entries || {})
    .map((e) => ({
      key: e.key,
      command: e.command,
      shape: e.shape,
      title: e.sample?.title || e.sample?.author?.name || String(e.sample?.description || '').split('\n')[0].slice(0, 100),
      count: e.count,
      lastSeen: e.lastSeen,
      sentCount: (e.sent || []).length,
      customized: Boolean(embeds[e.key]),
    }))
    .sort((a, b) => a.command.localeCompare(b.command) || (b.lastSeen || 0) - (a.lastSeen || 0));
}

function getEntry(guildId, key) {
  const entry = readCatalog(guildId).entries?.[key];
  if (!entry) return null;
  const data = loadOverrides(guildId);
  return { entry, override: data.embeds[key] || normalizeOverride({}), global: data.global };
}

/** Reaplica a mudança atual nas mensagens de canal já enviadas (só embeds; botões ficam como estão). */
async function updateSent(guildId, key, discord) {
  const found = getEntry(guildId, key);
  if (!found) return { updated: 0, failed: 0 };
  let updated = 0;
  let failed = 0;
  for (const ref of found.entry.sent || []) {
    try {
      const msg = await discord('GET', `/channels/${ref.channelId}/messages/${ref.messageId}`);
      const embeds = [...(msg.embeds || [])];
      if (!embeds[ref.index]) throw new Error('embed_missing');
      embeds[ref.index] = applyToEmbed(ref.original, found.override, found.global.emojiSwaps);
      await discord('PATCH', `/channels/${ref.channelId}/messages/${ref.messageId}`, { embeds, allowed_mentions: { parse: [] } });
      updated++;
    } catch (_) {
      failed++;
    }
  }
  return { updated, failed };
}

module.exports = {
  ENABLED_GUILDS,
  FOOTER_MOODS,
  footerIconUrl,
  pickMood,
  decorateFooter,
  decorateThumb,
  THUMBS,
  normalizeOverride,
  loadOverrides,
  setOverride,
  setGlobalSwaps,
  skeleton,
  embedKey,
  applyToEmbed,
  applyToComponents,
  transformBody,
  contextFromInteraction,
  contextFromMessage,
  record,
  flushCatalogs,
  install,
  listCatalog,
  getEntry,
  updateSent,
  _als: als,
};
