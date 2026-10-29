// Regras das telas da Mary no /dashboard (Lojinha, Ferramentas Robux, Aparência da Pyxie).
// As rotas ficam em src/routes/dashboardRoutes.js e só aceitam a zona "mary" (a Mary e o dono).
const manager = require('./maryStudioManager');
const robloxHelper = require('./utils/robloxHelper');
const templatesCatalog = require('./utils/templatesCatalog');
const convert = require('./studioConvert');
const studioStore = require('../../services/messageStudioStore');

const SNOWFLAKE_RE = /^\d{17,20}$/;
const STATUS = ['online', 'fila', 'offline'];
const FLAGS = ['ticketModule', 'antiLinkModule'];
const MAX_MACROS = 25;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const money = (v, min, max) => Math.min(max, Math.max(min, Math.round((Number(v) || 0) * 100) / 100));

// ---------- Lojinha ----------

function getStore() {
  const cfg = manager.loadConfig();
  const store = manager.loadStoreData();
  const reviews = Array.isArray(store.reviews) ? store.reviews : [];
  const tickets = Object.values(store.tickets || {});
  return {
    statusLoja: STATUS.includes(cfg.statusLoja) ? cfg.statusLoja : 'online',
    estoqueRobux: Number(cfg.estoqueRobux) || 0,
    preco1k: Number(cfg.preco1k) || 37,
    pixKey: cfg.pixKey || '',
    pixName: cfg.pixName || '',
    pixCity: cfg.pixCity || '',
    channelTickets: cfg.channelTickets || '',
    channelReviews: cfg.channelReviews || '',
    roleClient: cfg.roleClient || '',
    featureFlags: Object.fromEntries(FLAGS.map((k) => [k, Boolean(cfg.featureFlags?.[k])])),
    macros: Array.isArray(cfg.macros) ? cfg.macros : [],
    stats: {
      reviews: reviews.length,
      average: reviews.length ? Number((reviews.reduce((a, r) => a + (Number(r.stars) || 5), 0) / reviews.length).toFixed(1)) : null,
      openTickets: tickets.filter((x) => x && x.status !== 'closed').length,
      giveaways: Object.values(store.giveaways || {}).filter((g) => g && !g.ended).length,
    },
    variables: manager.getVariables(cfg),
  };
}

// channels/roles: listas do servidor (bridge) para recusar IDs de fora.
function saveStore(body = {}, { channels = [], roles = [] } = {}) {
  const cfg = manager.loadConfig();
  const next = { ...cfg, featureFlags: { ...(cfg.featureFlags || {}) } };
  if (body.statusLoja !== undefined) {
    if (!STATUS.includes(body.statusLoja)) return { ok: false, error: 'invalid_status' };
    next.statusLoja = body.statusLoja;
  }
  if (body.estoqueRobux !== undefined) next.estoqueRobux = Math.round(money(body.estoqueRobux, 0, 100000000));
  if (body.preco1k !== undefined) next.preco1k = money(body.preco1k, 0, 100000);
  if (body.pixKey !== undefined) next.pixKey = str(body.pixKey, 77);
  if (body.pixName !== undefined) next.pixName = str(body.pixName, 25);
  if (body.pixCity !== undefined) next.pixCity = str(body.pixCity, 15);
  const pick = (key, list, types) => {
    if (body[key] === undefined) return true;
    const id = String(body[key] || '');
    if (id && (!SNOWFLAKE_RE.test(id) || !list.some((x) => x.id === id && (!types || types.includes(x.type))))) return false;
    next[key] = id || null;
    return true;
  };
  if (!pick('channelTickets', channels, [4])) return { ok: false, error: 'invalid_channel' };
  if (!pick('channelReviews', channels, [0, 5])) return { ok: false, error: 'invalid_channel' };
  if (!pick('roleClient', roles)) return { ok: false, error: 'invalid_role' };
  if (body.featureFlags && typeof body.featureFlags === 'object') {
    for (const k of FLAGS) if (body.featureFlags[k] !== undefined) next.featureFlags[k] = Boolean(body.featureFlags[k]);
  }
  if (body.macros !== undefined) {
    if (!Array.isArray(body.macros)) return { ok: false, error: 'invalid_macros' };
    next.macros = body.macros.slice(0, MAX_MACROS).map((m, i) => ({
      id: str(m?.id, 20) || `m${i + 1}`,
      label: str(m?.label, 80),
      text: str(m?.text, 2000),
    })).filter((m) => m.label && m.text);
  }
  manager.saveConfig(next);
  return { ok: true, store: getStore() };
}

// ---------- Ferramentas Robux ----------

function calc({ robux, brl } = {}) {
  const rate = Number(manager.loadConfig().preco1k) || 37;
  if (robux !== undefined && robux !== '') {
    const n = Math.max(0, Math.min(10000000, Math.floor(Number(robux) || 0)));
    return { ok: true, mode: 'robux', robux: n, gamepass: robloxHelper.calcRobuxGamepass(n), price: robloxHelper.calcPriceBRL(n, rate), rate };
  }
  if (brl !== undefined && brl !== '') {
    const v = money(brl, 0, 1000000);
    const n = robloxHelper.calcReverseRobux(v, rate);
    return { ok: true, mode: 'brl', robux: n, gamepass: robloxHelper.calcRobuxGamepass(n), price: v, rate };
  }
  return { ok: false, error: 'missing_amount' };
}

async function inspectGamepass(input) {
  const value = str(input, 300);
  if (!value) return { ok: false, error: 'missing_input' };
  const result = await robloxHelper.fetchRobloxGamepass(value);
  return result.success ? { ok: true, gamepass: result } : { ok: false, error: 'roblox_not_found' };
}

async function inspectUser(username) {
  const value = str(username, 40);
  if (!/^[A-Za-z0-9_]{3,20}$/.test(value)) return { ok: false, error: 'invalid_username' };
  const result = await robloxHelper.fetchRobloxUser(value);
  return result.success ? { ok: true, user: result } : { ok: false, error: 'roblox_not_found' };
}

// Recibo de entrega (vouch) com o botão de avaliação da lojinha.
function buildReceipt({ clientNick, clientRobux, clientPrice, proofImageUrl, notes } = {}) {
  const nick = str(clientNick, 40).replace(/[`@]/g, '');
  const robux = Math.floor(Number(clientRobux) || 0);
  if (!nick || robux <= 0) return { ok: false, error: 'missing_fields' };
  const price = Number(clientPrice) > 0 ? money(clientPrice, 0, 1000000) : robloxHelper.calcPriceBRL(robux, Number(manager.loadConfig().preco1k) || 37);
  const image = str(proofImageUrl, 500);
  const note = str(notes, 300);
  const embed = {
    color: 0x10b981,
    title: '🎀 Entrega concluída',
    description: [
      'Mais uma encomenda de Robux entregue com segurança na **Mary Store**!',
      '',
      `- 👤 **Cliente:** \`${nick}\``,
      `- 💎 **Quantidade:** \`${robux.toLocaleString('pt-BR')} Robux\``,
      `- 💰 **Valor:** \`R$ ${price.toFixed(2).replace('.', ',')}\``,
      '- ⏳ **Status:** comprado (o Roblox deixa pendente por 5 dias)',
      ...(note ? ['', `> ${note}`] : []),
      '',
      '-# 💖 Obrigada pela confiança! Deixe sua avaliação no botão abaixo.',
    ].join('\n'),
    footer: { text: 'Mary Store • Entregas e comprovantes' },
  };
  if (/^https:\/\//.test(image)) embed.image = { url: image };
  return {
    ok: true,
    payload: {
      content: `🎉 Parabéns pela compra, **${nick}**!`,
      embeds: [embed],
      components: [{ type: 1, components: [{ type: 2, style: 3, label: 'Avaliar atendimento', emoji: { name: '⭐' }, custom_id: 'mary_btn:review:vouch' }] }],
      allowed_mentions: { parse: [] },
    },
  };
}

async function sendReceipt(guildId, body = {}, { fetchImpl } = {}) {
  const channelId = String(body.channelId || '');
  if (!SNOWFLAKE_RE.test(channelId)) return { ok: false, error: 'invalid_channel' };
  const built = buildReceipt(body);
  if (!built.ok) return built;
  const channel = await studioStore.discord('GET', `/channels/${channelId}`, null, fetchImpl);
  if (String(channel.guild_id) !== String(guildId)) return { ok: false, error: 'channel_not_in_guild' };
  const sent = await studioStore.discord('POST', `/channels/${channelId}/messages`, built.payload, fetchImpl);
  return { ok: true, messageId: sent.id };
}

async function createGiveaway(guildId, body = {}, { fetchImpl } = {}) {
  const channelId = String(body.channelId || '');
  const prize = str(body.prize, 200);
  if (!SNOWFLAKE_RE.test(channelId)) return { ok: false, error: 'invalid_channel' };
  if (!prize) return { ok: false, error: 'missing_fields' };
  const channel = await studioStore.discord('GET', `/channels/${channelId}`, null, fetchImpl);
  if (String(channel.guild_id) !== String(guildId)) return { ok: false, error: 'channel_not_in_guild' };
  const giveawayHandler = require('./handlers/giveawayHandler');
  if (!giveawayHandler.manager) giveawayHandler.manager = manager;
  const result = await giveawayHandler.createGiveaway(
    {
      channelId,
      prize,
      durationMinutes: Math.min(10080, Math.max(5, Math.floor(Number(body.durationMinutes) || 60))),
      winnersCount: Math.min(10, Math.max(1, Math.floor(Number(body.winnersCount) || 1))),
    },
    { post: (id, payload) => studioStore.discord('POST', `/channels/${id}/messages`, payload, fetchImpl) }
  );
  return { ok: true, giveawayId: result.giveawayId, messageId: result.messageId };
}

// ---------- Aparência da Pyxie no servidor ----------

function getProfile() {
  const cfg = manager.loadConfig();
  return { nick: cfg.localNick || '', bio: cfg.localBio || '', avatarUrl: cfg.localAvatarUrl || '', bannerUrl: cfg.localBannerUrl || '' };
}

const imageOk = (v) => v === '' || /^https:\/\/\S+$/.test(v);

async function saveProfile(guildId, body = {}) {
  const patch = {};
  if (body.nick !== undefined) patch.nick = str(body.nick, 32);
  if (body.bio !== undefined) patch.bio = str(body.bio, 190);
  for (const [key, field] of [['avatar', 'avatarUrl'], ['banner', 'bannerUrl']]) {
    if (body[field] === undefined) continue;
    const url = str(body[field], 500);
    if (!imageOk(url)) return { ok: false, error: 'invalid_image' };
    patch[key] = url;
  }
  await manager.updateLocalProfile(guildId, patch);
  return { ok: true, profile: getProfile() };
}

// ---------- Mensagens: modelos, mensagens antigas e "✏️ Editar na Pyxie" ----------

function listTemplates() {
  return templatesCatalog.getAllTemplates().map((tpl) => ({ id: tpl.id, name: tpl.name, description: tpl.description, category: tpl.category }));
}

function createFromTemplate(guildId, templateId, { by = null } = {}) {
  const tpl = templatesCatalog.getTemplateById(String(templateId || ''));
  if (!tpl) return { ok: false, error: 'template_not_found' };
  const base = `mary-${tpl.id.replace(/_/g, '-')}`.slice(0, 34);
  let id = base;
  for (let n = 2; studioStore.getMessage(guildId, id); n += 1) id = `${base}-${n}`;
  const result = studioStore.saveMessage(guildId, convert.fromTemplate(tpl, id), { by });
  return result.ok ? { ok: true, id } : { ok: false, error: 'validation_failed', errors: result.errors };
}

// Leva as mensagens do estúdio antigo (data/marySavedMessages.json) para o estúdio do painel, ligadas às
// mensagens já postadas. O arquivo antigo não é apagado e cada registro só é levado uma vez.
function migrateLegacyMessages(guildId) {
  const legacy = manager.loadMessages();
  const cfg = manager.loadConfig();
  const done = new Set(Array.isArray(cfg.migratedToDashboard) ? cfg.migratedToDashboard : []);
  let migrated = 0;
  for (const record of Object.values(legacy.messages || {})) {
    if (!record?.recordId || done.has(record.recordId)) continue;
    if (record.guildId && String(record.guildId) !== String(guildId)) continue;
    const { doc, sent } = convert.fromLegacyRecord(record);
    if (!studioStore.getMessage(guildId, doc.id)) {
      const result = studioStore.saveMessage(guildId, doc);
      if (!result.ok) {
        console.warn(`[MaryStudio] Mensagem antiga ${record.recordId} não passou na validação do estúdio:`, result.errors);
        continue;
      }
      for (const s of sent) studioStore.recordSent(guildId, doc.id, s);
    }
    done.add(record.recordId);
    migrated += 1;
  }
  if (migrated) manager.saveConfig({ ...manager.loadConfig(), migratedToDashboard: [...done] });
  return migrated;
}

// Mensagem postada pela Pyxie → documento do estúdio (cria uma vez; depois só abre).
function importDiscordMessage(guildId, message) {
  const { doc, lostButtons } = convert.fromDiscordMessage(message);
  if (studioStore.getMessage(guildId, doc.id)) return { ok: true, id: doc.id };
  const existing = studioStore.listMessages(guildId).map((m) => studioStore.getMessage(guildId, m.id)).find((m) => (m?.sent || []).some((s) => s.messageId === message.id));
  if (existing) return { ok: true, id: existing.id };
  if (lostButtons) return { ok: false, error: 'unsupported_buttons' };
  const result = studioStore.saveMessage(guildId, doc);
  if (!result.ok) return { ok: false, error: 'validation_failed' };
  studioStore.recordSent(guildId, doc.id, { channelId: message.channelId, messageId: message.id, webhookId: null, threadId: null, mode: 'classic', sentAt: message.createdTimestamp || Date.now(), by: null });
  return { ok: true, id: doc.id };
}

function dashboardUrl(guildId, section, item = null) {
  const base = (process.env.PANEL_PUBLIC_URL || process.env.PUBLIC_BASE_URL || 'https://pyxie.com.br').replace(/\/+$/, '');
  return `${base}/dashboard#/guild/${guildId}/${section}${item ? `/${item}` : ''}`;
}

module.exports = {
  FLAGS,
  getStore,
  saveStore,
  calc,
  inspectGamepass,
  inspectUser,
  buildReceipt,
  sendReceipt,
  createGiveaway,
  getProfile,
  saveProfile,
  listTemplates,
  createFromTemplate,
  migrateLegacyMessages,
  importDiscordMessage,
  dashboardUrl,
};
