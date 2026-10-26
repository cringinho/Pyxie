#!/usr/bin/env node
/**
 * Provisionador idempotente do servidor oficial Pyxie's Realm (blueprint em src/modules/realm/realmBlueprint.js).
 * Ordem: cargos → canais do portão e logs → modo Comunidade → demais canais → anúncios → AutoMod → Onboarding
 * → tela de boas-vindas. Itens são achados pelo ID salvo em data/realmState.json ou pelo nome; o script nunca
 * apaga nada. Sem --apply ele só mostra o que faria.
 * Uso: node scripts/realm/provision.js [--apply]
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const BP = require('../../src/modules/realm/realmBlueprint');

const APPLY = process.argv.includes('--apply');
const STATE_FILE = path.join(__dirname, '..', '..', 'data', 'realmState.json');
const G = BP.GUILD_ID;
const API = 'https://discord.com/api/v10';

const P = {
  VIEW: 1n << 10n,
  SEND: 1n << 11n,
  REACT: 1n << 6n,
  HISTORY: 1n << 16n,
  PUBLIC_THREADS: 1n << 35n,
  PRIVATE_THREADS: 1n << 36n,
  SEND_THREADS: 1n << 38n,
};
const TYPES = { text: 0, voice: 2, category: 4, announcement: 5, forum: 15 };

const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};
for (const k of ['roles', 'categories', 'channels', 'automod']) state[k] = state[k] || {};
const changes = [];

function note(text) {
  changes.push(text);
  console.log(`${APPLY ? '✅' : '🔎'} ${text}`);
}

async function api(method, route, body) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${API}${route}`, {
      method,
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'DiscordBot (pyxie-realm, 1.0)' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 429) {
      const wait = Number((await res.json().catch(() => ({}))).retry_after || 1);
      await new Promise((r) => setTimeout(r, (wait + 0.3) * 1000));
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${route} → ${res.status} ${text.slice(0, 400)}`);
    return text ? JSON.parse(text) : null;
  }
  throw new Error(`${method} ${route}: rate limit persistente`);
}

/** Escreve só com --apply; na simulação devolve um objeto falso com ID provisório. */
async function write(method, route, body, label) {
  note(label);
  if (!APPLY) return { id: `dry:${label}` };
  return api(method, route, body);
}

function overwrites(access) {
  if (access === BP.ACCESS.readonly) {
    return [{ id: G, type: 0, allow: String(P.VIEW | P.HISTORY | P.REACT), deny: String(P.SEND | P.SEND_THREADS | P.PUBLIC_THREADS | P.PRIVATE_THREADS) }];
  }
  if (access === BP.ACCESS.private) return [{ id: G, type: 0, allow: '0', deny: String(P.VIEW) }];
  return [];
}

async function ensureRoles() {
  const roles = await api('GET', `/guilds/${G}/roles`);
  const me = await api('GET', '/users/@me');
  const member = await api('GET', `/guilds/${G}/members/${me.id}`);
  const botRole = roles.filter((r) => member.roles.includes(r.id)).sort((a, b) => b.position - a.position)[0];
  for (const def of BP.ROLES) {
    let role = roles.find((r) => r.id === state.roles[def.key]) || roles.find((r) => r.name === def.name);
    const want = { name: def.name, color: def.color || 0, hoist: Boolean(def.hoist), mentionable: false };
    if (!role) {
      role = await write('POST', `/guilds/${G}/roles`, { ...want, permissions: '0' }, `cargo criado: ${def.name}`);
      roles.push(role);
    } else if (role.color !== want.color || role.hoist !== want.hoist || role.name !== want.name) {
      await write('PATCH', `/guilds/${G}/roles/${role.id}`, want, `cargo ajustado: ${def.name}`);
    }
    state.roles[def.key] = role.id;
    for (const userId of def.grantTo || []) {
      const target = await api('GET', `/guilds/${G}/members/${userId}`).catch(() => null);
      if (target && !target.roles.includes(role.id)) await write('PUT', `/guilds/${G}/members/${userId}/roles/${role.id}`, undefined, `cargo ${def.name} dado a ${userId}`);
    }
  }
  // Ordem: logo abaixo do cargo do bot, na sequência do blueprint
  if (APPLY && botRole) {
    const fresh = await api('GET', `/guilds/${G}/roles`);
    const top = fresh.find((r) => r.id === botRole.id).position;
    const wanted = BP.ROLES.map((def, i) => ({ id: state.roles[def.key], position: top - 1 - i })).filter((r) => r.position >= 1);
    const wrong = wanted.some((w) => fresh.find((r) => r.id === w.id)?.position !== w.position);
    if (wrong) {
      note('ordem dos cargos ajustada');
      await api('PATCH', `/guilds/${G}/roles`, wanted);
    }
  }
}

async function ensureChannel(channels, def, parentId) {
  let ch = channels.find((c) => c.id === state.channels[def.key]) || channels.find((c) => c.name === def.name && (c.parent_id || null) === (parentId || null));
  const type = def.type === 'announcement' ? TYPES.text : TYPES[def.type];
  if (!ch) {
    const body = { name: def.name, type, parent_id: parentId || undefined, permission_overwrites: overwrites(def.access) };
    if (def.topic && def.type !== 'voice') body.topic = def.topic;
    if (def.slowmode) body.rate_limit_per_user = def.slowmode;
    if (def.type === 'forum') {
      body.available_tags = (def.tags || []).map((tag) => ({ name: tag.name, emoji_name: tag.emoji, moderated: false }));
      if (def.defaultReaction) body.default_reaction_emoji = { emoji_name: def.defaultReaction };
      body.default_forum_layout = 1;
      body.default_sort_order = 0;
      if (def.requireTag) body.flags = 1 << 4;
    }
    ch = await write('POST', `/guilds/${G}/channels`, body, `canal criado: ${def.name}`);
    channels.push(ch);
  } else {
    const patch = {};
    if (def.topic && def.type !== 'voice' && ch.topic !== def.topic) patch.topic = def.topic;
    if ((def.slowmode || 0) !== (ch.rate_limit_per_user || 0) && def.type !== 'voice') patch.rate_limit_per_user = def.slowmode || 0;
    if (parentId && ch.parent_id !== parentId) patch.parent_id = parentId;
    if (def.type === 'forum') {
      const have = new Set((ch.available_tags || []).map((t) => t.name));
      const missing = (def.tags || []).filter((tag) => !have.has(tag.name));
      if (missing.length) patch.available_tags = [...(ch.available_tags || []), ...missing.map((tag) => ({ name: tag.name, emoji_name: tag.emoji }))];
    }
    if (Object.keys(patch).length) await write('PATCH', `/channels/${ch.id}`, patch, `canal ajustado: ${def.name} (${Object.keys(patch).join(', ')})`);
  }
  state.channels[def.key] = ch.id;
  return ch;
}

async function ensureCategories(onlyKeys = null) {
  const channels = await api('GET', `/guilds/${G}/channels`);
  for (const cat of BP.CATEGORIES) {
    const defs = cat.channels.filter((c) => !onlyKeys || onlyKeys.includes(c.key));
    if (!defs.length) continue;
    let parent = channels.find((c) => c.id === state.categories[cat.key]) || channels.find((c) => c.type === TYPES.category && c.name === cat.name);
    if (!parent) {
      parent = await write('POST', `/guilds/${G}/channels`, { name: cat.name, type: TYPES.category, permission_overwrites: overwrites(cat.access) }, `categoria criada: ${cat.name}`);
      channels.push(parent);
    }
    state.categories[cat.key] = parent.id;
    for (const def of defs) await ensureChannel(channels, def, parent.id);
  }
  return channels;
}

/** Categorias e canais na ordem do blueprint (os canais antigos do servidor ficam depois). */
async function ensurePositions() {
  if (!APPLY) return;
  const channels = await api('GET', `/guilds/${G}/channels`);
  const wanted = [];
  BP.CATEGORIES.forEach((cat, i) => {
    wanted.push({ id: state.categories[cat.key], position: i });
    cat.channels.forEach((def, j) => wanted.push({ id: state.channels[def.key], position: j }));
  });
  const wrong = wanted.filter((w) => w.id && channels.find((c) => c.id === w.id)?.position !== w.position);
  if (!wrong.length) return;
  note(`ordem de ${wrong.length} canal(is) ajustada`);
  await api('PATCH', `/guilds/${G}/channels`, wanted.filter((w) => w.id));
}

async function ensureCommunity() {
  const guild = await api('GET', `/guilds/${G}`);
  const c = BP.COMMUNITY;
  const ch = (key) => state.channels[key];
  const need =
    !guild.features.includes('COMMUNITY') ||
    guild.verification_level < c.verificationLevel ||
    guild.explicit_content_filter !== c.explicitContentFilter ||
    guild.rules_channel_id !== ch(c.rulesChannel) ||
    guild.public_updates_channel_id !== ch(c.updatesChannel) ||
    guild.description !== c.description;
  if (!need) return;
  await write(
    'PATCH',
    `/guilds/${G}`,
    {
      features: [...new Set([...guild.features, 'COMMUNITY'])],
      verification_level: Math.max(guild.verification_level, c.verificationLevel),
      explicit_content_filter: c.explicitContentFilter,
      rules_channel_id: ch(c.rulesChannel),
      public_updates_channel_id: ch(c.updatesChannel),
      safety_alerts_channel_id: ch(c.safetyAlertsChannel),
      description: c.description,
      preferred_locale: 'en-US',
    },
    'modo Comunidade, verificação e filtro de conteúdo'
  );
}

async function ensureAnnouncementTypes() {
  if (!APPLY) return;
  const channels = await api('GET', `/guilds/${G}/channels`);
  for (const cat of BP.CATEGORIES) {
    for (const def of cat.channels.filter((c) => c.type === 'announcement')) {
      const ch = channels.find((c) => c.id === state.channels[def.key]);
      if (ch && ch.type !== TYPES.announcement) await write('PATCH', `/channels/${ch.id}`, { type: TYPES.announcement }, `canal de anúncios: ${def.name}`);
    }
  }
}

const sorted = (list) => [...(list || [])].map(String).sort();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** A regra no servidor já tem o que o blueprint pede? */
function sameRule(rule, body) {
  const meta = Object.keys(body.trigger_metadata).every((k) => same(rule.trigger_metadata?.[k], body.trigger_metadata[k]));
  const actions = same(
    rule.actions.map((a) => [a.type, a.metadata?.channel_id || null, a.metadata?.duration_seconds || null]),
    body.actions.map((a) => [a.type, a.metadata?.channel_id || null, a.metadata?.duration_seconds || null])
  );
  return rule.name === body.name && rule.enabled && meta && actions && same(sorted(rule.exempt_channels), sorted(body.exempt_channels));
}

async function ensureAutomod() {
  const rules = await api('GET', `/guilds/${G}/auto-moderation/rules`);
  const appId = (await api('GET', '/users/@me')).id;
  const logs = state.channels.logs;
  for (const def of BP.AUTOMOD) {
    const actions = def.actions.map((a) => {
      if (a === 'block') return { type: 1, metadata: { custom_message: 'Pyxie blocked this: it looks like Nyxiel malware or breaks the Realm laws.' } };
      if (a === 'alert') return { type: 2, metadata: { channel_id: logs } };
      return { type: 3, metadata: { duration_seconds: BP.TIMEOUT_SECONDS } };
    });
    const body = {
      name: def.name,
      event_type: 1,
      trigger_type: def.triggerType,
      trigger_metadata: def.metadata,
      actions,
      enabled: true,
      exempt_channels: (def.exemptChannels || []).map((key) => state.channels[key]).filter(Boolean),
    };
    const existing = rules.find((r) => r.id === state.automod[def.key]) || rules.find((r) => r.name === def.name) || rules.find((r) => r.trigger_type === def.triggerType && def.triggerType !== 1);
    if (existing && existing.creator_id !== appId) {
      // Regra padrão criada pelo próprio Discord (ex.: "Block Mention Spam"): o bot não pode editar
      // e só cabe uma por tipo, então ela fica como está
      console.log(`ℹ️ AutoMod "${existing.name}" é do Discord; mantido como está.`);
      state.automod[def.key] = existing.id;
      continue;
    }
    if (existing && sameRule(existing, body)) {
      state.automod[def.key] = existing.id;
      continue;
    }
    const rule = existing
      ? await write('PATCH', `/guilds/${G}/auto-moderation/rules/${existing.id}`, { ...body, trigger_type: undefined, event_type: undefined }, `AutoMod atualizado: ${def.name}`)
      : await write('POST', `/guilds/${G}/auto-moderation/rules`, body, `AutoMod criado: ${def.name}`);
    state.automod[def.key] = rule.id;
  }
}

async function ensureOnboarding() {
  const o = BP.ONBOARDING;
  const ids = (keys) => (keys || []).map((key) => state.channels[key]).filter(Boolean);
  const roles = (keys) => (keys || []).map((key) => state.roles[key]).filter(Boolean);
  const body = {
    enabled: true,
    mode: 0,
    default_channel_ids: ids(o.defaultChannels),
    prompts: o.prompts.map((prompt, i) => ({
      id: String(1000 + i),
      type: 0,
      title: prompt.title,
      single_select: prompt.single,
      required: prompt.required,
      in_onboarding: true,
      options: prompt.options.map((opt, j) => ({
        id: String(2000 + i * 100 + j),
        title: opt.title,
        description: opt.description || null,
        emoji_name: opt.emoji,
        role_ids: roles(opt.roles),
        channel_ids: ids(opt.channels),
      })),
    })),
  };
  const current = await api('GET', `/guilds/${G}/onboarding`).catch(() => null);
  const shape = (o) => ({
    enabled: o.enabled,
    defaults: sorted(o.default_channel_ids),
    prompts: (o.prompts || []).map((p) => [p.title, p.required, p.single_select, (p.options || []).map((opt) => [opt.title, opt.description || null, sorted(opt.role_ids), sorted(opt.channel_ids)])]),
  });
  if (current && same(shape(current), shape(body))) return;
  await write('PUT', `/guilds/${G}/onboarding`, body, `Onboarding: ${body.prompts.length} perguntas, ${body.default_channel_ids.length} canais padrão`);
}

async function ensureWelcomeScreen() {
  const w = BP.WELCOME_SCREEN;
  const body = { enabled: true, description: w.description, welcome_channels: w.channels.map((c) => ({ channel_id: state.channels[c.channel], description: c.description, emoji_name: c.emoji })) };
  const current = await api('GET', `/guilds/${G}/welcome-screen`).catch(() => null);
  const shape = (s) => [s.description, (s.welcome_channels || []).map((c) => [c.channel_id, c.description, c.emoji_name])];
  if (current && same(shape(current), shape(body))) return;
  await write('PATCH', `/guilds/${G}/welcome-screen`, body, 'tela de boas-vindas');
}

(async () => {
  if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN ausente no .env');
  console.log(APPLY ? "🌸 Provisionando Pyxie's Realm (aplicando)…" : "🌸 Simulação do Pyxie's Realm (use --apply para aplicar)…");
  await ensureRoles();
  await ensureCategories(['rules', 'announcements', 'logs']);
  await ensureCommunity();
  await ensureCategories();
  await ensureAnnouncementTypes();
  await ensurePositions();
  await ensureAutomod();
  await ensureOnboarding();
  await ensureWelcomeScreen();
  if (APPLY) {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  }
  console.log(`\n${changes.length} ${APPLY ? 'mudança(s) aplicada(s)' : 'mudança(s) na simulação'}.`);
})().catch((err) => {
  console.error('❌ [provision]', err.message);
  if (APPLY) fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  process.exit(1);
});
