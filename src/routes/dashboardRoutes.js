// Painel novo: login com Discord e API /api/dashboard/*.
// Toda rota de servidor confere a permissão ao vivo pelo bot (panelAccess.checkGuildAccess):
// esconder na tela não basta, o backend recusa.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const oauth = require('../services/discordOAuth');
const sessions = require('../services/panelSessions');
const access = require('../services/panelAccess');
const guildFeatures = require('../services/guildFeatures');
const commandTelemetry = require('../services/commandTelemetry');
const messageStudio = require('../services/messageStudio');
const studioStore = require('../services/messageStudioStore');
const accountStore = require('../modules/accounts/accountStore');
const accountSessions = require('../services/accountSessions');

const STATE_COOKIE = 'pyxie_oauth_state';
const NEXT_COOKIE = 'pyxie_oauth_next';
const GUILD_ID_RE = /^\d{17,20}$/;

// Seções de cada servidor. Uma seção só entra aqui quando a tela e a API dela existem.
const SECTION_REGISTRY = [];

function registerDashboardSection(section) {
  SECTION_REGISTRY.push(section);
}

// Telas da zona da Mary (client/src/dashboard/Mary.jsx; API no bloco "Estúdio da Mary" abaixo).
for (const id of ['maryStore', 'maryTools', 'maryProfile']) registerDashboardSection({ id, zones: ['mary'] });
registerDashboardSection({ id: 'hyperfokus', zones: ['cringelandia'], roles: ['owner'] });
// Módulos que antes só se configuravam pelo Discord: tela e API para todo servidor.
['agenda', 'periodic', 'welcome'].forEach((id) => registerDashboardSection({ id }));

function getSections(guildAccess) {
  const base = ['overview', 'commands', 'studio', 'features', 'automations', 'injections', 'security', 'channels', 'roles', 'emojiUsage', 'planos'];
  if (guildAccess.canManageAccess) base.push('access');
  if (guildAccess.zone === 'cringelandia' && guildAccess.role === 'owner') base.push('embeds', 'moderation', 'community', 'seasonal', 'partnerships');
  const extra = SECTION_REGISTRY.filter((s) => !s.zones || s.zones.includes(guildAccess.zone))
    .filter((s) => !s.roles || s.roles.includes(guildAccess.role))
    .map((s) => s.id);
  // Set: uma seção registrada nos dois lugares não pode aparecer duas vezes no menu.
  return [...new Set([...base, ...extra])];
}

let missingConfigLogged = false;
function logMissingConfig() {
  if (missingConfigLogged) return;
  missingConfigLogged = true;
  console.error(
    '[Dashboard] Login do painel desligado: falta DISCORD_CLIENT_SECRET ou PANEL_SECRET no .env. ' +
      `Cadastre ${oauth.getRedirectUri()} como URL de retorno no Developer Portal.`
  );
}

// Tamanho da pasta data/ (cache de 1 minuto: a pasta tem milhares de arquivos).
let dataSizeCache = { at: 0, bytes: 0 };
function getDataDirBytes() {
  if (Date.now() - dataSizeCache.at < 60000) return dataSizeCache.bytes;
  const root = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
  let total = 0;
  const walk = (dir) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        try {
          total += fs.statSync(full).size;
        } catch (_) {}
      }
    }
  };
  walk(root);
  dataSizeCache = { at: Date.now(), bytes: total };
  return total;
}

function serializeFeatures(guildId, zone) {
  const f = guildFeatures.getGuildFeatures(guildId);
  const groups = Object.entries(guildFeatures.FEATURE_GROUPS)
    .filter(([, def]) => def.toggleable)
    .map(([id, def]) => ({ id, emoji: def.emoji, enabled: !f.disabled.includes(id), channelScoped: def.channelScoped, commands: def.names }));
  return {
    groups,
    channels: { games: f.channels.games || [] },
    // Rotas por comando: só a Cringelândia usa (ex.: /py-dungeon só no canal das Catacumbas).
    commandChannels: zone === 'cringelandia' ? f.commandChannels : null,
  };
}

function createDashboardRouter({ bridge, fetchImpl, moduleManager, sendIpcToBot, getWebStatus } = {}) {
  const router = express.Router();
  const doFetch = fetchImpl || ((...args) => fetch(...args));

  async function getBotGuilds() {
    return bridge.request('GUILD_LIST');
  }

  function requireSession(req, res, next) {
    const session = sessions.readCookieValue(sessions.getCookie(req));
    if (!session) return res.status(401).json({ success: false, error: 'not_authenticated' });
    // Pedidos que mudam algo exigem um cabeçalho próprio: outro site não consegue mandá-lo sem CORS.
    if (req.method !== 'GET' && req.get('X-Pyxie-Panel') !== '1') {
      return res.status(403).json({ success: false, error: 'csrf_header_missing' });
    }
    req.panelSession = session;
    return next();
  }

  async function requireGuild(req, res, next) {
    const { guildId } = req.params;
    if (!GUILD_ID_RE.test(guildId)) return res.status(400).json({ success: false, error: 'invalid_guild' });
    const result = await access.checkGuildAccess(bridge, req.panelSession.userId, guildId);
    if (!result.ok) {
      const status = result.reason === 'bot_offline' || result.reason === 'bot_timeout' ? 503 : 403;
      return res.status(status).json({ success: false, error: result.reason });
    }
    req.guildAccess = result;
    return next();
  }

  // Tela do painel (React em client/, build em public/dist/dashboard). Fora dos buscadores.
  router.get(['/dashboard', '/dashboard/'], (req, res) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(path.join(__dirname, '..', '..', 'public', 'dist', 'dashboard', 'dashboard.html'));
  });

  router.get('/auth/discord', (req, res) => {
    if (!oauth.isConfigured()) {
      logMissingConfig();
      return res.status(503).json({ success: false, error: 'panel_not_configured' });
    }
    const state = crypto.randomBytes(16).toString('hex');
    // ?next=/caminho: login vindo do site (blog, perfil). Só caminhos internos, para não virar redirecionamento aberto.
    const next = typeof req.query.next === 'string' && /^\/(?![/\\])[^\r\n]*$/.test(req.query.next) ? req.query.next : '';
    const cookies = [`${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/auth/discord; Max-Age=600`];
    cookies.push(`${NEXT_COOKIE}=${encodeURIComponent(next)}; HttpOnly; Secure; SameSite=Lax; Path=/auth/discord; Max-Age=${next ? 600 : 0}`);
    res.setHeader('Set-Cookie', cookies);
    return res.redirect(oauth.buildAuthorizeUrl(state));
  });

  router.get('/auth/discord/callback', async (req, res) => {
    const clearState = `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/auth/discord; Max-Age=0`;
    if (!oauth.isConfigured()) {
      logMissingConfig();
      return res.status(503).json({ success: false, error: 'panel_not_configured' });
    }
    const { code, state } = req.query;
    const expected = sessions.getCookie(req, STATE_COOKIE);
    if (!code || !state || !expected || typeof state !== 'string' || state !== expected) {
      res.setHeader('Set-Cookie', clearState);
      return res.redirect('/dashboard?error=login_state');
    }
    try {
      const token = await oauth.exchangeCode(String(code), doFetch);
      const profile = await oauth.fetchProfile(token, doFetch);
      await oauth.revokeToken(token, doFetch);
      const { cookieValue } = sessions.createSession(profile);
      // Uma identidade só: o mesmo login abre a conta do site (blog, comentários, Meu perfil).
      const account = accountStore.upsertDiscordAccount(profile.user);
      const accountCookie = accountSessions.buildCookie(accountSessions.createSession(account.id));
      const next = decodeURIComponent(sessions.getCookie(req, NEXT_COOKIE) || '');
      const clearNext = `${NEXT_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/auth/discord; Max-Age=0`;
      res.setHeader('Set-Cookie', [clearState, clearNext, sessions.buildCookie(cookieValue), accountCookie]);
      const target = /^\/(?![/\\])[^\r\n]*$/.test(next) ? next : '/dashboard';
      // Conta nova criada a partir do site (?next=): antes de seguir, a tela de boas-vindas oferece adicionar
      // a Pyxie (dá para recusar). Quem entra pelo painel vai direto para ele.
      if (account.justCreated && next) return res.redirect(`/boas-vindas?next=${encodeURIComponent(target)}`);
      return res.redirect(target);
    } catch (err) {
      console.error('[Dashboard] Falha no login com Discord:', err.message);
      res.setHeader('Set-Cookie', clearState);
      return res.redirect('/dashboard?error=login_failed');
    }
  });

  router.post('/auth/logout', (req, res) => {
    const session = sessions.readCookieValue(sessions.getCookie(req));
    if (session) sessions.destroySession(session.id);
    res.setHeader('Set-Cookie', sessions.clearCookie());
    return res.json({ success: true });
  });

  router.get('/api/dashboard/me', requireSession, async (req, res) => {
    const s = req.panelSession;
    let botGuilds = [];
    let botOnline = true;
    try {
      botGuilds = await getBotGuilds();
    } catch (_) {
      botOnline = false;
    }
    return res.json({
      success: true,
      botOnline,
      user: {
        id: s.userId,
        username: s.username,
        globalName: s.globalName,
        avatarUrl: s.avatar ? `https://cdn.discordapp.com/avatars/${s.userId}/${s.avatar}.png?size=128` : null,
        isOwner: access.isOwner(s.userId),
      },
      guilds: access.listAccessibleGuilds(s, botGuilds),
    });
  });

  // ---------- Item #1: Apagar meus dados (LGPD) ----------
  router.get('/api/dashboard/me/privacy', requireSession, (req, res) => {
    const privacyService = require('../services/privacyService');
    return res.json({ success: true, summary: privacyService.inspectUserData(req.panelSession.userId) });
  });

  router.post('/api/dashboard/me/privacy/erase', requireSession, async (req, res) => {
    if (req.body?.confirm !== true) return res.status(400).json({ success: false, error: 'confirmation_required' });
    const privacyService = require('../services/privacyService');
    const receipt = await privacyService.eraseUserData(req.panelSession.userId);
    return res.json({ success: true, receipt });
  });

  router.delete('/api/dashboard/me/privacy', requireSession, async (req, res) => {
    if (req.body?.confirm !== true) return res.status(400).json({ success: false, error: 'confirmation_required' });
    const privacyService = require('../services/privacyService');
    const receipt = await privacyService.eraseUserData(req.panelSession.userId);
    return res.json({ success: true, receipt });
  });

  router.get('/api/dashboard/guilds/:guildId', requireSession, requireGuild, async (req, res) => {
    let guild = null;
    try {
      guild = (await getBotGuilds()).find((g) => g.id === req.params.guildId) || null;
    } catch (_) {}
    return res.json({
      success: true,
      guild,
      zone: req.guildAccess.zone,
      role: req.guildAccess.role,
      canManageAccess: req.guildAccess.canManageAccess,
      sections: getSections(req.guildAccess),
    });
  });

  router.get('/api/dashboard/guilds/:guildId/channels', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, channels: await bridge.request('GUILD_CHANNELS', { guildId: req.params.guildId }) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.get('/api/dashboard/guilds/:guildId/roles', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, roles: await bridge.request('GUILD_ROLES', { guildId: req.params.guildId }) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.get('/api/dashboard/guilds/:guildId/access', requireSession, requireGuild, (req, res) => {
    if (!req.guildAccess.canManageAccess) return res.status(403).json({ success: false, error: 'guild_owner_only' });
    return res.json({ success: true, whitelist: access.readWhitelist(req.params.guildId) });
  });

  router.put('/api/dashboard/guilds/:guildId/access', requireSession, requireGuild, (req, res) => {
    if (!req.guildAccess.canManageAccess) return res.status(403).json({ success: false, error: 'guild_owner_only' });
    const whitelist = access.writeWhitelist(req.params.guildId, req.body || {});
    return res.json({ success: true, whitelist });
  });

  router.get('/api/dashboard/guilds/:guildId/features', requireSession, requireGuild, (req, res) => {
    return res.json({ success: true, features: serializeFeatures(req.params.guildId, req.guildAccess.zone) });
  });

  router.put('/api/dashboard/guilds/:guildId/features', requireSession, requireGuild, async (req, res) => {
    const { guildId } = req.params;
    const body = req.body || {};
    // Canais de jogos e rotas por comando precisam ser deste servidor (o bot confere ao vivo).
    const wanted = [...(Array.isArray(body.channels?.games) ? body.channels.games : []), ...Object.values(body.commandChannels && typeof body.commandChannels === 'object' ? body.commandChannels : {}).flat()].map(String).filter(Boolean);
    if (wanted.length) {
      try {
        const channels = await bridge.request('GUILD_CHANNELS', { guildId });
        if (!wanted.every((id) => channels.some((c) => c.id === id))) return res.status(400).json({ success: false, error: 'invalid_channel' });
      } catch (err) {
        return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
      }
    }
    if (body.groups && typeof body.groups === 'object') {
      for (const [group, enabled] of Object.entries(body.groups)) {
        if (guildFeatures.FEATURE_GROUPS[group]?.toggleable) guildFeatures.setGroupEnabled(guildId, group, Boolean(enabled));
      }
    }
    if (Array.isArray(body.channels?.games)) guildFeatures.setGroupChannels(guildId, 'games', body.channels.games);
    if (body.commandChannels && typeof body.commandChannels === 'object') {
      if (req.guildAccess.zone !== 'cringelandia') return res.status(403).json({ success: false, error: 'cringelandia_only' });
      guildFeatures.setCommandChannels(guildId, body.commandChannels);
    }
    return res.json({ success: true, features: serializeFeatures(guildId, req.guildAccess.zone) });
  });

  // ---------- Estúdio de mensagens ----------
  const MSG_ID_RE = /^[a-z0-9-]{1,40}$/;
  function requireMsgId(req, res, next) {
    if (!MSG_ID_RE.test(req.params.msgId)) return res.status(400).json({ success: false, error: 'invalid_message_id' });
    return next();
  }
  const studioError = (res, err) => {
    const status = err.code === 'message_not_found' ? 404 : err.code === 'channel_not_in_guild' ? 403 : 502;
    return res.status(status).json({ success: false, error: err.code || 'studio_error' });
  };

  router.get('/api/dashboard/guilds/:guildId/studio', requireSession, requireGuild, (req, res) => {
    return res.json({ success: true, messages: studioStore.listMessages(req.params.guildId), limits: messageStudio.LIMITS });
  });

  router.get('/api/dashboard/guilds/:guildId/studio-emojis', requireSession, requireGuild, (req, res) => {
    return res.json({ success: true, emojis: messageStudio.listAppEmojis() });
  });

  // Item #7: Modelo rápido de "Escolha seus cargos" por botão no Estúdio
  router.post('/api/dashboard/guilds/:guildId/studio-presets/role-panel', requireSession, requireGuild, async (req, res) => {
    const body = req.body || {};
    const wantedRoles = (Array.isArray(body.roles) ? body.roles : []).map((r) => String(r?.id || r?.roleId || '')).filter(Boolean);
    if (!wantedRoles.length) return res.status(400).json({ success: false, error: 'missing_roles' });
    try {
      const guildRoles = await bridge.request('GUILD_ROLES', { guildId: req.params.guildId });
      for (const rid of wantedRoles) {
        const found = guildRoles.find((gr) => gr.id === rid);
        if (!found) return res.status(400).json({ success: false, error: 'invalid_role' });
        if (!found.assignable) return res.status(400).json({ success: false, error: 'role_not_assignable', roleName: found.name });
      }
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    const presetDoc = messageStudio.buildRolePanelPreset(body);
    const saved = studioStore.saveMessage(req.params.guildId, presetDoc, { by: req.panelSession.userId });
    if (!saved.ok) return res.status(422).json({ success: false, error: 'validation_failed', errors: saved.errors });
    return res.json({ success: true, message: saved.doc });
  });

  router.get('/api/dashboard/guilds/:guildId/studio/:msgId', requireSession, requireGuild, requireMsgId, (req, res) => {
    const doc = studioStore.getMessage(req.params.guildId, req.params.msgId);
    if (!doc) return res.status(404).json({ success: false, error: 'message_not_found' });
    return res.json({ success: true, message: doc });
  });

  router.put('/api/dashboard/guilds/:guildId/studio/:msgId', requireSession, requireGuild, requireMsgId, (req, res) => {
    // Botões da lojinha (calculadora, ticket...) só existem no servidor da Mary.
    if (req.guildAccess.zone !== 'mary' && (Array.isArray(req.body?.buttons) ? req.body.buttons : []).some((b) => b?.action?.type === 'mary')) {
      return res.status(403).json({ success: false, error: 'mary_only' });
    }
    const result = studioStore.saveMessage(req.params.guildId, { ...(req.body || {}), id: req.params.msgId }, { by: req.panelSession.userId });
    if (!result.ok) return res.status(422).json({ success: false, error: 'validation_failed', errors: result.errors });
    return res.json({ success: true, message: result.doc });
  });

  router.delete('/api/dashboard/guilds/:guildId/studio/:msgId', requireSession, requireGuild, requireMsgId, (req, res) => {
    if (!studioStore.deleteMessage(req.params.guildId, req.params.msgId)) return res.status(404).json({ success: false, error: 'message_not_found' });
    return res.json({ success: true });
  });

  router.post('/api/dashboard/guilds/:guildId/studio/:msgId/restore', requireSession, requireGuild, requireMsgId, (req, res) => {
    const result = studioStore.restoreVersion(req.params.guildId, req.params.msgId, Number(req.body?.index), { by: req.panelSession.userId });
    if (!result.ok) return res.status(422).json({ success: false, error: 'validation_failed', errors: result.errors });
    return res.json({ success: true, message: result.doc });
  });

  router.post('/api/dashboard/guilds/:guildId/studio/:msgId/send', requireSession, requireGuild, requireMsgId, async (req, res) => {
    const channelId = String(req.body?.channelId || '');
    if (!GUILD_ID_RE.test(channelId)) return res.status(400).json({ success: false, error: 'invalid_channel' });
    try {
      const sent = await studioStore.sendMessage(req.params.guildId, req.params.msgId, channelId, { fetchImpl: doFetch, by: req.panelSession.userId });
      return res.json({ success: true, sent });
    } catch (err) {
      return studioError(res, err);
    }
  });

  router.post('/api/dashboard/guilds/:guildId/studio/:msgId/update-sent', requireSession, requireGuild, requireMsgId, async (req, res) => {
    try {
      return res.json({ success: true, results: await studioStore.updateSent(req.params.guildId, req.params.msgId, { fetchImpl: doFetch }) });
    } catch (err) {
      return studioError(res, err);
    }
  });

  // O canal de homologação é da staff da Pyxie: só o dono manda prévias para lá.
  router.post('/api/dashboard/guilds/:guildId/studio/:msgId/preview', requireSession, requireGuild, requireMsgId, async (req, res) => {
    if (!access.isOwner(req.panelSession.userId)) return res.status(403).json({ success: false, error: 'owner_only' });
    try {
      return res.json({ success: true, sent: await studioStore.sendHomologationPreview(req.params.guildId, req.params.msgId, { fetchImpl: doFetch }) });
    } catch (err) {
      return studioError(res, err);
    }
  });

  // ---------- Estúdio da Mary: lojinha, ferramentas Robux e aparência da Pyxie (zona mary: a Mary e o dono) ----------
  function requireMary(req, res, next) {
    if (req.guildAccess.zone !== 'mary') return res.status(403).json({ success: false, error: 'mary_only' });
    return next();
  }
  const mary = () => require('../modules/mary-studio/maryDashboard');
  const maryReply = (res, result, okBody) => (result.ok ? res.json({ success: true, ...okBody(result) }) : res.status(result.error === 'roblox_not_found' ? 404 : 400).json({ success: false, error: result.error }));
  const maryUpload = express.raw({ type: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'], limit: '8mb' });

  router.get('/api/dashboard/guilds/:guildId/mary/store', requireSession, requireGuild, requireMary, (req, res) => {
    return res.json({ success: true, store: mary().getStore(), templates: mary().listTemplates() });
  });

  router.put('/api/dashboard/guilds/:guildId/mary/store', requireSession, requireGuild, requireMary, async (req, res) => {
    const body = req.body || {};
    const lists = { channels: [], roles: [] };
    try {
      if (body.channelTickets || body.channelReviews) lists.channels = await bridge.request('GUILD_CHANNELS', { guildId: req.params.guildId });
      if (body.roleClient) lists.roles = await bridge.request('GUILD_ROLES', { guildId: req.params.guildId });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    return maryReply(res, mary().saveStore(body, lists), (r) => ({ store: r.store }));
  });

  router.post('/api/dashboard/guilds/:guildId/mary/calc', requireSession, requireGuild, requireMary, (req, res) => {
    return maryReply(res, mary().calc(req.body || {}), ({ ok, ...r }) => ({ result: r }));
  });

  router.get('/api/dashboard/guilds/:guildId/mary/roblox/gamepass', requireSession, requireGuild, requireMary, async (req, res) => {
    return maryReply(res, await mary().inspectGamepass(req.query.input), (r) => ({ gamepass: r.gamepass }));
  });

  router.get('/api/dashboard/guilds/:guildId/mary/roblox/user', requireSession, requireGuild, requireMary, async (req, res) => {
    return maryReply(res, await mary().inspectUser(req.query.username), (r) => ({ user: r.user }));
  });

  router.post('/api/dashboard/guilds/:guildId/mary/receipt', requireSession, requireGuild, requireMary, async (req, res) => {
    try {
      return maryReply(res, await mary().sendReceipt(req.params.guildId, req.body || {}, { fetchImpl: doFetch }), (r) => ({ messageId: r.messageId }));
    } catch (err) {
      return studioError(res, err);
    }
  });

  router.post('/api/dashboard/guilds/:guildId/mary/giveaway', requireSession, requireGuild, requireMary, async (req, res) => {
    try {
      return maryReply(res, await mary().createGiveaway(req.params.guildId, req.body || {}, { fetchImpl: doFetch }), ({ ok, ...r }) => r);
    } catch (err) {
      return studioError(res, err);
    }
  });

  router.get('/api/dashboard/guilds/:guildId/mary/profile', requireSession, requireGuild, requireMary, (req, res) => {
    return res.json({ success: true, profile: mary().getProfile() });
  });

  router.put('/api/dashboard/guilds/:guildId/mary/profile', requireSession, requireGuild, requireMary, async (req, res) => {
    return maryReply(res, await mary().saveProfile(req.params.guildId, req.body || {}), (r) => ({ profile: r.profile }));
  });

  router.post('/api/dashboard/guilds/:guildId/mary/upload', requireSession, requireGuild, requireMary, maryUpload, (req, res) => {
    const result = require('../modules/mary-studio/maryStudioManager').saveUpload(req.body);
    return result.ok ? res.json({ success: true, url: result.url }) : res.status(result.error === 'file_too_large' ? 413 : 400).json({ success: false, error: result.error });
  });

  router.post('/api/dashboard/guilds/:guildId/mary/templates/:templateId', requireSession, requireGuild, requireMary, (req, res) => {
    return maryReply(res, mary().createFromTemplate(req.params.guildId, req.params.templateId, { by: req.panelSession.userId }), (r) => ({ id: r.id }));
  });

  // ---------- Parcerias da Cringelândia: texto da DM de aprovação puxado do fórum (plano 5.4) ----------
  function requireCringelandiaOwner(req, res, next) {
    if (req.guildAccess.zone !== 'cringelandia' || req.guildAccess.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'cringelandia_owner_only' });
    }
    return next();
  }

  router.get('/api/dashboard/guilds/:guildId/partnership-dm', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const partnerships = require('../modules/partnerships/partnershipManager');
    return res.json({ success: true, dmSource: partnerships.getConfig().dmSource });
  });

  router.put('/api/dashboard/guilds/:guildId/partnership-dm', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const partnerships = require('../modules/partnerships/partnershipManager');
    const saved = partnerships.saveConfig({ dmSource: req.body || {} });
    return res.json({ success: true, dmSource: saved.dmSource });
  });

  // Catálogo de comandos (montado do código a cada pedido): o que vale neste servidor e por quê.
  router.get('/api/dashboard/guilds/:guildId/commands', requireSession, requireGuild, (req, res) => {
    const catalog = require('../services/commandCatalog');
    const perms = require('../services/commandPermissions');
    return res.json({
      success: true,
      commands: catalog.forGuild(req.params.guildId, { isOwner: access.isOwner(req.panelSession.userId) }),
      permissionRules: perms.getRules(req.params.guildId),
    });
  });

  // ---------- Item #2 & #5: Diagnóstico de comando, Regras de permissão e Sincronização do Menu de Barra ----------
  router.get('/api/dashboard/guilds/:guildId/commands/:commandName/diagnose', requireSession, requireGuild, (req, res) => {
    const diag = require('../services/commandDiagnostics');
    const channelId = GUILD_ID_RE.test(String(req.query.channelId || '')) ? String(req.query.channelId) : '';
    const userId = GUILD_ID_RE.test(String(req.query.userId || '')) ? String(req.query.userId) : req.panelSession.userId;
    const roleIds = String(req.query.roleIds || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => GUILD_ID_RE.test(s));
    const report = diag.diagnoseCommand({
      commandName: String(req.params.commandName || ''),
      guildId: req.params.guildId,
      channelId: channelId || null,
      userId,
      roleIds,
      isAdmin: req.query.asMember === '1' ? false : req.guildAccess.role === 'owner' || req.guildAccess.role === 'admin',
    });
    return res.json({ success: true, report });
  });

  router.get('/api/dashboard/guilds/:guildId/command-permissions', requireSession, requireGuild, (req, res) => {
    const perms = require('../services/commandPermissions');
    return res.json({ success: true, rules: perms.getRules(req.params.guildId), syncStatus: perms.getMenuSyncStatus(req.params.guildId) });
  });

  router.put('/api/dashboard/guilds/:guildId/command-permissions', requireSession, requireGuild, (req, res) => {
    const perms = require('../services/commandPermissions');
    const rules = perms.setRules(req.params.guildId, Array.isArray(req.body?.rules) ? req.body.rules : []);
    return res.json({ success: true, rules });
  });

  router.post('/api/dashboard/guilds/:guildId/commands/sync-menu', requireSession, requireGuild, async (req, res) => {
    const perms = require('../services/commandPermissions');
    const result = await perms.syncGuildSlashMenu(req.params.guildId);
    if (!result.ok) {
      const status = result.error === 'cooldown' ? 429 : 502;
      return res.status(status).json({ success: false, error: result.error, retryAfterSec: result.retryAfterSeconds });
    }
    return res.json({ success: true, syncedCount: result.syncedCount, hiddenCount: result.hiddenCount });
  });

  router.get('/api/dashboard/guilds/:guildId/emoji-usage', requireSession, requireGuild, async (req, res) => {
    try {
      const emojis = await bridge.request('GUILD_EMOJIS', { guildId: req.params.guildId });
      const usage = require('../services/guildActivity').readEmojiUsage(req.params.guildId);
      return res.json({ success: true, since: usage.since, emojis: emojis.map((e) => ({ ...e, count: usage.emojis[e.id]?.count || 0, lastUsedAt: usage.emojis[e.id]?.last || null })) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.get('/api/dashboard/guilds/:guildId/activity', requireSession, requireGuild, (req, res) => {
    const guildId = req.params.guildId;
    const base = require('../services/guildActivity').summary(guildId);
    const autoSummary = require('../services/automationStats').summary(guildId);
    const safety = require('../services/guildSafety');
    const modCases = require('../services/modCasesService');
    const emergencyMode = require('../services/emergencyMode');
    const welcomeFlow = require('../services/welcomeFlow');
    const periodic = require('../services/periodicMessages');
    const campfire = require('../services/campfire');
    const wellbeing = require('../services/wellbeingService');

    // Top comandos executados neste servidor (telemetria real).
    const ranking = commandTelemetry.getRanking({ guildId }) || [];
    const topCommands = ranking
      .filter((c) => c.total > 0)
      .slice(0, 8)
      .map((c) => ({
        name: c.name,
        category: c.category || 'utilidades',
        total: c.total,
        calls: c.total,
        errors: c.errors || 0,
        lastUsed: c.lastUsed || 0,
      }));

    const { counters } = safety.readEvents(guildId);
    const allCases = modCases.listCases(guildId, { limit: 200 });
    const activeWarnings = allCases.filter((c) => c.action === 'warn' && c.active).length;
    const wf = welcomeFlow.getConfig(guildId);
    const per = periodic.getConfig(guildId);
    const wbCfg = wellbeing.getWellbeingGuildConfig(guildId);
    const wbStats = wellbeing.getGuildWellbeingStats(guildId);
    const emojiData = require('../services/guildActivity').readEmojiUsage(guildId);
    const emojiEntries = Object.values(emojiData.emojis || {});
    const emojiStats = {
      trackedCount: emojiEntries.length,
      totalUses: emojiEntries.reduce((acc, e) => acc + Number(e.count || 0), 0),
    };
    const emergencyActive = Boolean(emergencyMode.getEmergencyStatus(guildId)?.active);
    const campEnabled = Boolean(campfire.getConfig(guildId).enabled);

    return res.json({
      success: true,
      ...base,
      topCommands,
      automations: autoSummary,
      emojiStats,
      security: {
        counters,
        totalCases: allCases.length,
        activeWarnings,
        emergencyActive,
      },
      modules: {
        welcomeEnabled: Boolean(wf.enabled),
        checkinEnabled: Boolean(wf.checkin?.enabled),
        periodicBumpEnabled: Boolean(per.bumpGuide?.enabled),
        periodicTarotEnabled: Boolean(per.tarot?.enabled),
        campfireEnabled: campEnabled,
        welcome: Boolean(wf.enabled),
        checkin24h: Boolean(wf.checkin?.enabled),
        bumpGuide: Boolean(per.bumpGuide?.enabled),
        tarotDaily: Boolean(per.tarot?.enabled),
        campfire: campEnabled,
        emergency: emergencyActive,
        studioMessagesCount: studioStore.listMessages(guildId).length,
        wellbeing: {
          remindersEnabled: wbCfg.remindersEnabled !== false,
          afkEnabled: wbCfg.afkEnabled !== false,
          birthdaysEnabled: wbCfg.birthdaysEnabled !== false,
          ...wbStats,
        },
      },
    });
  });

  router.get('/api/dashboard/guilds/:guildId/bot-permissions', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, ...(await bridge.request('BOT_PERMISSIONS', { guildId: req.params.guildId })) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  // ---------- Automações (esquema declarativo: o mesmo esquema monta a tela e valida aqui) ----------
  router.get('/api/dashboard/guilds/:guildId/automations', requireSession, requireGuild, (req, res) => {
    const auto = require('../services/automations');
    const autoStats = require('../services/automationStats');
    const schema = auto.publicSchema();
    const configs = Object.fromEntries(Object.keys(schema).map((k) => [k, auto.getConfig(req.params.guildId, k, { fresh: true })]));
    // Ciclo do bump (bumps, sequência, ranking e próximo aviso) para o painel mostrar números reais.
    let bumpState = null;
    try {
      const bump = require('../services/bumpReminder');
      const autoState = require('../services/autoState');
      bumpState = bump.insights(autoState.read(req.params.guildId, 'bump.json'), auto.getConfig(req.params.guildId, 'bumpReminder', { fresh: true }));
    } catch (_) {
      bumpState = null;
    }
    return res.json({
      success: true,
      schema,
      configs,
      stats: autoStats.read(req.params.guildId),
      summary: autoStats.summary(req.params.guildId),
      bumpState,
    });
  });

  router.post('/api/dashboard/guilds/:guildId/automations/bulk', requireSession, requireGuild, async (req, res) => {
    const auto = require('../services/automations');
    const autoStats = require('../services/automationStats');
    const guildId = req.params.guildId;
    const action = req.body?.action;
    const group = req.body?.group;
    const configs = req.body?.configs;
    if (action === 'enable_group' || action === 'disable_group') {
      const enabled = action === 'enable_group';
      const patch = {};
      for (const [k, def] of Object.entries(auto.SCHEMA)) {
        if (k === 'automodPresets') continue; // AutoMod preset requires Discord REST sync individually
        if (!group || group === 'all' || def.group === group) {
          patch[k] = { enabled };
        }
      }
      const updated = auto.saveBulk(guildId, patch);
      const schema = auto.publicSchema();
      const allConfigs = Object.fromEntries(Object.keys(schema).map((k) => [k, auto.getConfig(guildId, k, { fresh: true })]));
      return res.json({ success: true, updatedCount: Object.keys(updated).length, configs: allConfigs, summary: autoStats.summary(guildId) });
    }
    if (action === 'import' && configs && typeof configs === 'object') {
      let guildChannels = [];
      let guildRoles = [];
      try {
        guildChannels = await bridge.request('GUILD_CHANNELS', { guildId });
        guildRoles = await bridge.request('GUILD_ROLES', { guildId });
      } catch (_) {}
      const chanSet = new Set((guildChannels || []).map((c) => c.id));
      const roleSet = new Set((guildRoles || []).map((r) => r.id));
      const validPatch = {};
      for (const [k, cfg] of Object.entries(configs)) {
        if (!auto.SCHEMA[k] || k === 'automodPresets' || !cfg || typeof cfg !== 'object') continue;
        const candidate = auto.normalize(k, cfg);
        const check = auto.idsToCheck(k, candidate);
        const idsOk = check.channels.every((id) => chanSet.has(id)) && check.roles.every((id) => roleSet.has(id));
        if (idsOk) {
          validPatch[k] = cfg;
        } else {
          const stripped = { ...cfg };
          for (const f of auto.SCHEMA[k].fields) {
            if (['channel', 'channels', 'role', 'roles'].includes(f.type)) delete stripped[f.key];
          }
          validPatch[k] = stripped;
        }
      }
      const updated = auto.saveBulk(guildId, validPatch);
      const schema = auto.publicSchema();
      const allConfigs = Object.fromEntries(Object.keys(schema).map((k) => [k, auto.getConfig(guildId, k, { fresh: true })]));
      return res.json({ success: true, updatedCount: Object.keys(updated).length, configs: allConfigs, summary: autoStats.summary(guildId) });
    }
    return res.status(400).json({ success: false, error: 'invalid_bulk_action' });
  });

  router.post('/api/dashboard/guilds/:guildId/automations/:key/reset-stats', requireSession, requireGuild, (req, res) => {
    const auto = require('../services/automations');
    const autoStats = require('../services/automationStats');
    const key = req.params.key === 'all' ? null : req.params.key;
    if (key && !auto.SCHEMA[key]) return res.status(404).json({ success: false, error: 'unknown_automation' });
    const stats = autoStats.reset(req.params.guildId, key);
    return res.json({ success: true, stats, summary: autoStats.summary(req.params.guildId) });
  });

  // Bump: zera bumps/sequência/ranking e mantém o ciclo em andamento e a config intacta.
  router.post('/api/dashboard/guilds/:guildId/automations/bumpReminder/reset-state', requireSession, requireGuild, (req, res) => {
    const auto = require('../services/automations');
    const autoState = require('../services/autoState');
    const bump = require('../services/bumpReminder');
    const guildId = req.params.guildId;
    const saved = bump.normalizeState(autoState.read(guildId, 'bump.json'));
    const reset = { ...bump.clearCounters(), lastBump: saved.lastBump, reminder: saved.reminder };
    autoState.write(guildId, 'bump.json', reset);
    return res.json({ success: true, bumpState: bump.insights(reset, auto.getConfig(guildId, 'bumpReminder', { fresh: true })) });
  });

  // ---------- Assinatura mensal do servidor (Básico/Premium) ----------
  router.get('/api/dashboard/guilds/:guildId/plan', requireSession, requireGuild, (req, res) => {
    const payments = require('../services/planPayments');
    return res.json({ success: true, ...payments.guildPlanInfo(req.params.guildId) });
  });

  router.post('/api/dashboard/guilds/:guildId/plan/checkout', requireSession, requireGuild, async (req, res) => {
    const payments = require('../services/planPayments');
    const plan = String(req.body?.plan || '');
    const method = String(req.body?.method || 'pix');
    const lang = req.body?.lang === 'en' ? 'en' : 'pt';
    if (!['basic', 'premium'].includes(plan)) return res.status(400).json({ success: false, error: 'invalid_plan' });
    const checkout = method === 'card'
      ? await payments.createCardSubscription({ guildId: req.params.guildId, plan, lang })
      : await payments.createPixCharge({ guildId: req.params.guildId, plan, lang });
    if (!checkout.ok) return res.status(503).json({ success: false, error: checkout.reason || 'provider' });
    return res.json({ success: true, checkout });
  });

  router.post('/api/dashboard/guilds/:guildId/plan/cancel', requireSession, requireGuild, async (req, res) => {
    const plansSvc = require('../services/guildPlans');
    const payments = require('../services/planPayments');
    const info = payments.guildPlanInfo(req.params.guildId);
    const preapprovalId = String(req.body?.preapprovalId || info.lastCard?.id || '');
    if (preapprovalId) await payments.cancelCardSubscription(preapprovalId).catch(() => null);
    plansSvc.revokePlan(req.params.guildId, 'canceled');
    return res.json({ success: true, plan: plansSvc.getPlan(req.params.guildId) });
  });

  router.put('/api/dashboard/guilds/:guildId/automations/:key', requireSession, requireGuild, async (req, res) => {
    const auto = require('../services/automations');
    const config = auto.normalize(req.params.key, req.body || {});
    if (!config) return res.status(404).json({ success: false, error: 'unknown_automation' });
    const want = auto.idsToCheck(req.params.key, config);
    try {
      if (want.channels.length) {
        const channels = await bridge.request('GUILD_CHANNELS', { guildId: req.params.guildId });
        if (!want.channels.every((id) => channels.some((c) => c.id === id))) return res.status(400).json({ success: false, error: 'invalid_channel' });
      }
      if (want.roles.length) {
        const roles = await bridge.request('GUILD_ROLES', { guildId: req.params.guildId });
        if (!want.roles.every((id) => roles.some((r) => r.id === id))) return res.status(400).json({ success: false, error: 'invalid_role' });
      }
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    // Filtros prontos do AutoMod: a regra nativa é criada/ajustada antes de salvar.
    if (req.params.key === 'automodPresets') {
      try {
        await require('../services/automodPresets').sync(req.params.guildId, config, { discord: (method, route, body) => studioStore.discord(method, route, body, doFetch) });
      } catch (err) {
        const error = err.code === 'automod_exists' ? 'automod_exists' : err.status === 403 ? 'missing_permission' : 'automod_error';
        return res.status(err.code === 'automod_exists' ? 409 : 502).json({ success: false, error });
      }
    }
    return res.json({ success: true, config: auto.saveConfig(req.params.guildId, req.params.key, config) });
  });

  // ---------- Injeções: catálogo de pacotes (fixo no código) e ações pelo bot ----------
  router.get('/api/dashboard/guilds/:guildId/injections', requireSession, requireGuild, async (req, res) => {
    const { PACKS } = require('../data/injectionPacks');
    const packs = Object.fromEntries(Object.entries(PACKS).map(([id, p]) => [id, { emoji: p.emoji, defaultMode: p.defaultMode, items: p.items.map(({ id: itemId, pt, en, stripes, emoji }) => ({ id: itemId, pt, en, stripes, emoji })) }]));
    try {
      return res.json({ success: true, packs, info: await bridge.request('INJECT_INFO', { guildId: req.params.guildId }) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.post('/api/dashboard/guilds/:guildId/injections', requireSession, requireGuild, async (req, res) => {
    const { pack, options, lang } = req.body || {};
    const opts = require('../services/injections').normalizeOptions(String(pack || ''), options || {});
    if (!opts) return res.status(400).json({ success: false, error: 'invalid_request' });
    if (opts.publish && opts.channelId) {
      try {
        const channels = await bridge.request('GUILD_CHANNELS', { guildId: req.params.guildId });
        if (!channels.some((c) => c.id === opts.channelId)) return res.status(400).json({ success: false, error: 'invalid_channel' });
      } catch (err) {
        return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
      }
    }
    try {
      const started = await bridge.request('INJECT_START', { guildId: req.params.guildId, pack, options: opts, lang: lang === 'en' ? 'en' : 'pt', by: req.panelSession.userId });
      return res.json({ success: true, ...started });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.get('/api/dashboard/guilds/:guildId/injections/jobs/:jobId', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, job: await bridge.request('INJECT_STATUS', { guildId: req.params.guildId, jobId: String(req.params.jobId).slice(0, 16) }) });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.code || 'job_not_found' });
    }
  });

  router.delete('/api/dashboard/guilds/:guildId/injections/:injectionId', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, ...(await bridge.request('INJECT_REMOVE', { guildId: req.params.guildId, injectionId: String(req.params.injectionId).slice(0, 16), deleteRoles: req.query.roles === '1' })) });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  // ---------- Fogueira de voz (todos os servidores, desligada por padrão) ----------
  router.get('/api/dashboard/guilds/:guildId/campfire', requireSession, requireGuild, (req, res) => {
    return res.json({ success: true, campfire: require('../services/campfire').getConfig(req.params.guildId) });
  });

  router.put('/api/dashboard/guilds/:guildId/campfire', requireSession, requireGuild, async (req, res) => {
    const body = req.body || {};
    const channelId = String(body.channelId || '');
    const pingRoleId = String(body.pingRoleId || '');
    try {
      const bad = await checkGuildIds(req.params.guildId, {
        channels: channelId ? [channelId] : [],
        roles: pingRoleId ? [pingRoleId] : [],
      });
      if (bad) return res.status(400).json({ success: false, error: bad });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    return res.json({ success: true, campfire: require('../services/campfire').saveConfig(req.params.guildId, body) });
  });

  // ---------- Agenda e mensagens periódicas (todos os servidores) ----------
  // Confere ao vivo que canais e cargos escolhidos são deste servidor (o cargo @everyone não vale).
  async function checkGuildIds(guildId, { channels = [], roles = [] }) {
    const want = { channels: channels.filter(Boolean), roles: roles.filter(Boolean) };
    if (want.roles.includes(guildId)) return 'invalid_role';
    if (want.channels.length) {
      const list = await bridge.request('GUILD_CHANNELS', { guildId });
      if (!want.channels.every((id) => list.some((c) => c.id === id))) return 'invalid_channel';
    }
    if (want.roles.length) {
      const list = await bridge.request('GUILD_ROLES', { guildId });
      if (!want.roles.every((id) => list.some((r) => r.id === id))) return 'invalid_role';
    }
    return null;
  }

  router.get('/api/dashboard/guilds/:guildId/agenda', requireSession, requireGuild, (req, res) => {
    return res.json({ success: true, agenda: require('../services/guildAgenda').getGuildAgenda(req.params.guildId) });
  });

  function periodicView(guildId) {
    const periodic = require('../services/periodicMessages');
    return { ...periodic.getConfig(guildId), tarotChannelId: periodic.tarotChannelId(guildId), lastBumpGuideAt: periodic.readState(guildId).bumpGuideAt || null, sites: periodic.SITES };
  }

  router.get('/api/dashboard/guilds/:guildId/periodic', requireSession, requireGuild, (req, res) => {
    return res.json({ success: true, periodic: periodicView(req.params.guildId) });
  });

  router.put('/api/dashboard/guilds/:guildId/periodic', requireSession, requireGuild, async (req, res) => {
    const periodic = require('../services/periodicMessages');
    const { guildId } = req.params;
    const body = req.body || {};
    const next = periodic.normalize({ bumpGuide: body.bumpGuide, tarot: body.tarot }, guildId);
    const tarotChannelId = body.tarotChannelId === undefined ? null : GUILD_ID_RE.test(String(body.tarotChannelId)) ? String(body.tarotChannelId) : '';
    try {
      const bad = await checkGuildIds(guildId, {
        channels: [next.bumpGuide.channelId, tarotChannelId],
        roles: [next.tarot.roleId, next.bumpGuide.pingRoleId],
      });
      if (bad) return res.status(400).json({ success: false, error: bad });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    periodic.saveConfig(guildId, next);
    if (tarotChannelId !== null && tarotChannelId !== periodic.tarotChannelId(guildId)) {
      const gcs = require('../services/guildConfigService');
      if (tarotChannelId) gcs.setTarotChannelId(guildId, tarotChannelId);
      else gcs.updateGuildConfig(guildId, { tarotChannelId: null });
    }
    return res.json({ success: true, periodic: periodicView(guildId) });
  });

  // ---------- Acolhimento inicial: boas-vindas, verificação e pacote de bem-estar (todos os servidores) ----------
  router.get('/api/dashboard/guilds/:guildId/welcome', requireSession, requireGuild, (req, res) => {
    const welcomeFlow = require('../services/welcomeFlow');
    const wellbeing = require('../services/wellbeingService');
    return res.json({
      success: true,
      welcome: welcomeFlow.getView(req.params.guildId),
      layouts: welcomeFlow.LAYOUTS,
      wellbeing: wellbeing.getWellbeingGuildConfig(req.params.guildId),
    });
  });

  router.put('/api/dashboard/guilds/:guildId/welcome', requireSession, requireGuild, async (req, res) => {
    const welcomeFlow = require('../services/welcomeFlow');
    const { guildId } = req.params;
    const body = req.body || {};
    const flow = welcomeFlow.normalize({ ...welcomeFlow.getConfig(guildId), ...body, checkin: { ...welcomeFlow.getConfig(guildId).checkin, ...(body.checkin || {}) } }, guildId);
    const idOrEmpty = (v) => (GUILD_ID_RE.test(String(v || '')) ? String(v) : '');
    const https = (v) => (/^https:\/\/\S{1,500}$/.test(String(v || '')) ? String(v) : '');
    const message = {
      channelId: idOrEmpty(body.channelId),
      title: String(body.title || '').slice(0, 256),
      description: String(body.description || '').slice(0, 2000),
      color: /^#[0-9a-f]{6}$/i.test(String(body.color || '')) ? String(body.color) : '#8b5cf6',
      imageUrl: https(body.imageUrl),
      autoReactions: (Array.isArray(body.autoReactions) ? body.autoReactions : []).map((e) => String(e).trim().slice(0, 64)).filter(Boolean).slice(0, 5),
      autoRoleId: idOrEmpty(body.autoRoleId),
    };
    try {
      const bad = await checkGuildIds(guildId, {
        channels: [message.channelId, flow.rulesChannelId, flow.guidesChannelId, flow.rolesChannelId, flow.checkin.channelId],
        roles: [message.autoRoleId, flow.pingRoleId, flow.checkin.silentRoleId],
      });
      if (bad) return res.status(400).json({ success: false, error: bad });
      // O cargo automático precisa estar abaixo do cargo da Pyxie.
      if (message.autoRoleId) {
        const roles = await bridge.request('GUILD_ROLES', { guildId });
        if (roles.find((r) => r.id === message.autoRoleId)?.assignable === false) return res.status(400).json({ success: false, error: 'role_not_assignable' });
      }
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    welcomeFlow.saveConfig(guildId, flow);
    const gcs = require('../services/guildConfigService');
    const { channelId, ...rest } = message;
    if (channelId !== welcomeFlow.welcomeChannelId(guildId)) gcs.setWelcomeConfig(guildId, { channelId: channelId || null });
    gcs.setWelcomeConfig(guildId, rest);
    return res.json({ success: true, welcome: welcomeFlow.getView(guildId) });
  });

  // ---------- Item #6: Pacote de Bem-Estar e Convivência (Lembretes, AFK e Aniversários) ----------
  router.get('/api/dashboard/guilds/:guildId/wellbeing', requireSession, requireGuild, (req, res) => {
    const wellbeing = require('../services/wellbeingService');
    return res.json({ success: true, wellbeing: wellbeing.getWellbeingGuildConfig(req.params.guildId) });
  });

  router.put('/api/dashboard/guilds/:guildId/wellbeing', requireSession, requireGuild, async (req, res) => {
    const wellbeing = require('../services/wellbeingService');
    const body = req.body || {};
    const bdayChannel = String(body.birthdayChannelId || '');
    const bdayRole = String(body.birthdayRoleId || '');
    try {
      const bad = await checkGuildIds(req.params.guildId, {
        channels: bdayChannel ? [bdayChannel] : [],
        roles: bdayRole ? [bdayRole] : [],
      });
      if (bad) return res.status(400).json({ success: false, error: bad });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    const saved = wellbeing.setWellbeingGuildConfig(req.params.guildId, body);
    return res.json({ success: true, wellbeing: saved });
  });

  // ---------- Faxina de convites (o bot lista e revoga; precisa de Gerenciar Servidor) ----------
  router.get('/api/dashboard/guilds/:guildId/invites/stale', requireSession, requireGuild, async (req, res) => {
    const days = Math.min(90, Math.max(3, parseInt(req.query.days, 10) || require('../services/guildSafety').getConfig(req.params.guildId).invites.days));
    try {
      return res.json({ success: true, days, invites: await bridge.request('INVITES_STALE', { guildId: req.params.guildId, days }) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.post('/api/dashboard/guilds/:guildId/invites/revoke', requireSession, requireGuild, async (req, res) => {
    const codes = (Array.isArray(req.body?.codes) ? req.body.codes : []).map(String).filter((c) => /^[\w-]{2,32}$/.test(c)).slice(0, 200);
    const days = Math.min(90, Math.max(3, parseInt(req.body?.days, 10) || 7));
    try {
      return res.json({ success: true, ...(await bridge.request('INVITES_REVOKE', { guildId: req.params.guildId, codes, days, by: req.panelSession.userId })) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  // ---------- Apelação de banimento: qualquer pessoa logada vê os próprios banimentos ----------
  router.get('/api/dashboard/appeals', requireSession, async (req, res) => {
    try {
      return res.json({ success: true, servers: await bridge.request('APPEAL_LIST', { userId: req.panelSession.userId }) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.post('/api/dashboard/appeals/:guildId', requireSession, async (req, res) => {
    if (!GUILD_ID_RE.test(req.params.guildId)) return res.status(400).json({ success: false, error: 'invalid_guild' });
    const text = String(req.body?.text || '').trim();
    if (text.length < 20) return res.status(400).json({ success: false, error: 'too_short' });
    if (text.length > 1500) return res.status(400).json({ success: false, error: 'too_long' });
    const s = req.panelSession;
    try {
      const appeal = await bridge.request('APPEAL_SUBMIT', { guildId: req.params.guildId, userId: s.userId, username: s.globalName || s.username, text });
      return res.json({ success: true, appeal });
    } catch (err) {
      const code = err.code || 'bridge_error';
      return res.status(['bridge_offline', 'bridge_timeout'].includes(code) ? 503 : 400).json({ success: false, error: code });
    }
  });

  // ---------- Segurança (todos os servidores): escudo de links, guardião, antinuke, emergência, verificação e casos ----------
  router.get('/api/dashboard/guilds/:guildId/security', requireSession, requireGuild, (req, res) => {
    const safety = require('../services/guildSafety');
    const emergencyMode = require('../services/emergencyMode');
    const modCases = require('../services/modCasesService');
    const { counters, events } = safety.readEvents(req.params.guildId);
    return res.json({
      success: true,
      security: safety.getConfig(req.params.guildId, { fresh: true }),
      emergencyStatus: emergencyMode.getEmergencyStatus(req.params.guildId),
      warningsConfig: modCases.getGuildWarningsConfig(req.params.guildId),
      cases: modCases.listCases(req.params.guildId, { limit: 25 }),
      counters,
      events: events.slice(0, 20),
    });
  });

  router.put('/api/dashboard/guilds/:guildId/security', requireSession, requireGuild, async (req, res) => {
    const safety = require('../services/guildSafety');
    const body = req.body || {};
    const staffLogChannelId = String(body.staffLogChannelId || '');
    const appealsChannelId = String(body.appeals?.channelId || '');
    const verChannelId = String(body.verification?.channelId || '');
    const verRoleId = String(body.verification?.verifiedRoleId || '');
    const unverRoleId = String(body.verification?.unverifiedRoleId || '');
    const linkExemptRoles = Array.isArray(body.linkShield?.exemptRoleIds) ? body.linkShield.exemptRoleIds.map(String) : [];
    const linkExemptChans = Array.isArray(body.linkShield?.exemptChannelIds) ? body.linkShield.exemptChannelIds.map(String) : [];
    const fileExemptRoles = Array.isArray(body.fileShield?.exemptRoleIds) ? body.fileShield.exemptRoleIds.map(String) : [];
    const fileExemptChans = Array.isArray(body.fileShield?.exemptChannelIds) ? body.fileShield.exemptChannelIds.map(String) : [];
    // Os canais e cargos escolhidos precisam ser deste servidor (o bot confere ao vivo).
    try {
      const bad = await checkGuildIds(req.params.guildId, {
        channels: [staffLogChannelId, appealsChannelId, verChannelId, ...linkExemptChans, ...fileExemptChans].filter(Boolean),
        roles: [verRoleId, unverRoleId, ...linkExemptRoles, ...fileExemptRoles].filter(Boolean),
      });
      if (bad) return res.status(400).json({ success: false, error: bad });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
    const security = safety.saveConfig(req.params.guildId, {
      staffLogChannelId,
      linkShield: body.linkShield || {},
      guard: body.guard || {},
      antiNuke: body.antiNuke || {},
      verification: body.verification || {},
      antiRaid: body.antiRaid || {},
      appeals: body.appeals ? { enabled: body.appeals.enabled === true, channelId: appealsChannelId } : {},
      fileShield: body.fileShield || {},
      invites: body.invites || {},
    });
    return res.json({ success: true, security });
  });

  // Item #4: Modo de Emergência Global pelo painel
  router.post(['/api/dashboard/guilds/:guildId/emergency', '/api/dashboard/guilds/:guildId/security/emergency'], requireSession, requireGuild, async (req, res) => {
    const active = Boolean(req.body?.active);
    const reason = String(req.body?.reason || '').trim().slice(0, 200);
    try {
      const result = await bridge.request('EMERGENCY_TOGGLE', {
        guildId: req.params.guildId,
        active,
        actorId: req.panelSession.userId,
        reason,
      });
      return res.json({ success: true, emergency: result, status: result });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  // Item #7: Publicar painel de Verificação Acessível por Botão
  router.post(['/api/dashboard/guilds/:guildId/verification/publish', '/api/dashboard/guilds/:guildId/security/verification/publish'], requireSession, requireGuild, async (req, res) => {
    try {
      const result = await bridge.request('VERIFICATION_PUBLISH', { guildId: req.params.guildId });
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.code || err.message || 'bridge_error' });
    }
  });

  // ---------- Item #3: Casos de moderação numerados (#123) e Advertências por pontos ----------
  router.get(['/api/dashboard/guilds/:guildId/cases', '/api/dashboard/guilds/:guildId/moderation/cases'], requireSession, requireGuild, (req, res) => {
    const modCases = require('../services/modCasesService');
    const targetId = GUILD_ID_RE.test(String(req.query.userId || '')) ? String(req.query.userId) : '';
    return res.json({
      success: true,
      config: modCases.getGuildWarningsConfig(req.params.guildId),
      cases: modCases.listCases(req.params.guildId, { targetId, limit: 50 }),
    });
  });

  router.put(['/api/dashboard/guilds/:guildId/warnings-config', '/api/dashboard/guilds/:guildId/moderation/warnings-config'], requireSession, requireGuild, (req, res) => {
    const modCases = require('../services/modCasesService');
    const config = modCases.setGuildWarningsConfig(req.params.guildId, req.body || {});
    return res.json({ success: true, config });
  });

  const updateCaseHandler = async (req, res) => {
    const modCases = require('../services/modCasesService');
    const num = Number(req.params.caseNumber);
    if (!Number.isInteger(num) || num < 1) return res.status(400).json({ success: false, error: 'invalid_case_number' });
    if (req.body?.revoke === true) {
      await modCases.revokeWarningByCase(req.params.guildId, num, req.panelSession.userId);
    }
    if (typeof req.body?.reason === 'string' && req.body.reason.trim()) {
      await modCases.updateCaseReason(req.params.guildId, num, req.body.reason, req.panelSession.userId);
    }
    const updated = modCases.getCase(req.params.guildId, num);
    if (!updated) return res.status(404).json({ success: false, error: 'case_not_found' });
    return res.json({ success: true, caseRecord: updated });
  };

  router.put(['/api/dashboard/guilds/:guildId/cases/:caseNumber', '/api/dashboard/guilds/:guildId/moderation/cases/:caseNumber'], requireSession, requireGuild, updateCaseHandler);
  router.patch(['/api/dashboard/guilds/:guildId/cases/:caseNumber', '/api/dashboard/guilds/:guildId/moderation/cases/:caseNumber'], requireSession, requireGuild, updateCaseHandler);

  // ---------- Moderação da Cringelândia: modo blindagem (AutoMod) e controle de brigas ----------
  router.get('/api/dashboard/guilds/:guildId/moderation', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const shieldMode = require('../services/shieldMode');
    const conflictWatch = require('../services/conflictWatch');
    return res.json({
      success: true,
      shield: shieldMode.getShield(req.params.guildId),
      conflict: conflictWatch.getConfig(req.params.guildId),
      incidents: conflictWatch.listIncidents(req.params.guildId),
    });
  });

  router.put('/api/dashboard/guilds/:guildId/moderation/shield', requireSession, requireGuild, requireCringelandiaOwner, async (req, res) => {
    const shieldMode = require('../services/shieldMode');
    const { t } = require('../utils/i18n');
    try {
      const shield = await shieldMode.applyShield(req.params.guildId, req.body || {}, {
        discord: (method, route, body) => studioStore.discord(method, route, body, doFetch),
        defaultMessage: t('moderation.shieldBlocked', 'pt'),
      });
      return res.json({ success: true, shield });
    } catch (err) {
      return res.status(502).json({ success: false, error: err.code || 'automod_error' });
    }
  });

  router.put('/api/dashboard/guilds/:guildId/moderation/conflict', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const conflict = require('../services/conflictWatch').saveConfig(req.params.guildId, req.body || {});
    return res.json({ success: true, conflict });
  });

  router.delete('/api/dashboard/guilds/:guildId/moderation/incidents', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    require('../services/conflictWatch').clearIncidents(req.params.guildId);
    return res.json({ success: true, incidents: [] });
  });

  // ---------- Pyxie Hyperfokus: Fila de Validação e Publicação Editorial ----------
  router.get('/api/dashboard/guilds/:guildId/hyperfokus/queue', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const articleStore = require('../modules/hyperfokus/articleStore');
    const result = articleStore.listArticles({ status: 'PENDING_REVIEW', limit: 50 });
    return res.json({ success: true, queue: result.items });
  });

  router.get('/api/dashboard/guilds/:guildId/hyperfokus/articles', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const articleStore = require('../modules/hyperfokus/articleStore');
    const status = req.query.status || null;
    const result = articleStore.listArticles({ status, limit: 50 });
    return res.json({ success: true, articles: result.items, total: result.total });
  });

  router.get('/api/dashboard/guilds/:guildId/hyperfokus/articles/:id', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const articleStore = require('../modules/hyperfokus/articleStore');
    const art = articleStore.getArticleById(req.params.id);
    if (!art) return res.status(404).json({ success: false, error: 'article_not_found' });
    return res.json({ success: true, article: art });
  });

  router.put('/api/dashboard/guilds/:guildId/hyperfokus/articles/:id', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const articleStore = require('../modules/hyperfokus/articleStore');
    const { markdownToHtml } = require('../modules/hyperfokus/markdown');
    const { title, seoTitle, metaDescription, contentMarkdown, coverImage, categoryTags, slug } = req.body || {};
    
    const patch = {};
    if (title) patch.title = String(title).slice(0, 200);
    if (seoTitle !== undefined) patch.seoTitle = String(seoTitle || '').slice(0, 100);
    if (metaDescription !== undefined) patch.metaDescription = String(metaDescription || '').slice(0, 250);
    if (slug) patch.slug = String(slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (coverImage !== undefined) patch.coverImage = coverImage ? String(coverImage) : null;
    if (Array.isArray(categoryTags)) patch.categoryTags = categoryTags.map(String);
    if (contentMarkdown) {
      patch.contentMarkdown = String(contentMarkdown);
      patch.contentHtml = markdownToHtml(patch.contentMarkdown);
    }
    patch.editedBy = req.session?.userId || 'owner';

    const updated = articleStore.updateArticle(req.params.id, patch);
    if (!updated) return res.status(404).json({ success: false, error: 'article_not_found' });
    return res.json({ success: true, article: updated });
  });

  // Rotas de Gestão da Fila do Pinterest (Fase 5)
  router.get('/api/dashboard/guilds/:guildId/hyperfokus/pins', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const pinScheduler = require('../modules/hyperfokus/pinScheduler');
    const pins = pinScheduler.getQueuePins();
    return res.json({ success: true, pins });
  });

  router.post('/api/dashboard/guilds/:guildId/hyperfokus/pins/:id/toggle', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const pinScheduler = require('../modules/hyperfokus/pinScheduler');
    const updated = pinScheduler.togglePinPause(req.params.id);
    if (!updated) return res.status(404).json({ success: false, error: 'pin_not_found' });
    return res.json({ success: true, pin: updated });
  });

  router.delete('/api/dashboard/guilds/:guildId/hyperfokus/pins/:id', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const pinScheduler = require('../modules/hyperfokus/pinScheduler');
    const removed = pinScheduler.removePin(req.params.id);
    return res.json({ success: true, removed });
  });

  // Rota de Analytics Real do Blog (Fase 6)
  router.get('/api/dashboard/guilds/:guildId/hyperfokus/analytics', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const analyticsEngine = require('../modules/hyperfokus/analyticsEngine');
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
    const articleId = req.query.articleId || null;
    const summary = analyticsEngine.getAnalyticsSummary({ days, articleId });
    return res.json({ success: true, summary });
  });

  router.post('/api/dashboard/guilds/:guildId/hyperfokus/articles/:id/publish', requireSession, requireGuild, requireCringelandiaOwner, async (req, res) => {
    const articleStore = require('../modules/hyperfokus/articleStore');
    const indexNow = require('../services/indexNowService');
    const art = articleStore.getArticleById(req.params.id);
    if (!art) return res.status(404).json({ success: false, error: 'article_not_found' });

    // Idempotente: se já publicado, apenas atualiza timestamp e indexNow
    const published = articleStore.updateArticle(req.params.id, {
      status: 'PUBLISHED',
      publishedAt: art.publishedAt || new Date(),
      editedBy: req.session?.userId || 'owner',
    });

    // Enfileira Pin no Pinterest (Orçamento de 3 pins/dia)
    try {
      const pinScheduler = require('../modules/hyperfokus/pinScheduler');
      pinScheduler.enqueuePin({
        source: 'hyperfokus',
        sourceId: published.id,
        title: published.seoTitle || published.title,
        description: published.metaDescription || published.title,
        imageUrl: `${baseUrl}/api/hyperfokus/pin/${published.id}`,
        targetUrl: articleUrl,
        altText: `Pin do artigo: ${published.title}`,
      });
    } catch (_) {}

    // Registra fontes externas no LinkSentinel
    try {
      const linkSentinel = require('../services/linkSentinel');
      const matches = (published.contentHtml || '').match(/href="(https?:\/\/[^"#]+)"/g) || [];
      for (const m of matches) {
        const extUrl = m.replace(/^href="|"/g, '');
        if (!extUrl.includes('pyxie.com.br') && !extUrl.includes('discord.com')) {
          linkSentinel.upsertLink({ url: extUrl, label: published.title, source: `hyperfokus:${published.id}` });
        }
      }
    } catch (_) {}

    // Notifica IndexNow
    const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://pyxie.com.br').replace(/\/+$/, '');
    const articleUrl = `${baseUrl}/hyperfokus/${published.slug}`;
    try {
      await indexNow.submitIndexNowUrls([articleUrl]);
    } catch (_) {}

    // Notifica Discord se houver thread associada
    if (published.discordThreadId && bridge?.client) {
      try {
        const thread = await bridge.client.channels.fetch(published.discordThreadId).catch(() => null);
        if (thread) {
          const { EmbedBuilder } = require('discord.js');
          const authorNames = (published.authors || []).map((a) => a.username).join(' e ') || 'Autor';
          const celebrationEmbed = new EmbedBuilder()
            .setColor('#E60067')
            .setTitle('🎉  ✦  Artigo Aprovado e Publicado!')
            .setDescription(
              `### 🌟 Parabéns aos Autores!\n\n` +
              `O artigo de **${authorNames}** foi revisado e publicado com sucesso no **Pyxie Hyperfokus**!\n\n` +
              `🔗 **[Clique aqui para ler no site](${articleUrl})**\n\n` +
              `-# Obrigado pelo capricho autoral e por enriquecer a comunidade!`
            )
            .setFooter({ text: 'Pyxie Hyperfokus • Publicação Oficial' })
            .setTimestamp();

          await thread.send({ embeds: [celebrationEmbed] }).catch(() => {});
        }
      } catch (_) {}
    }

    return res.json({ success: true, article: published, url: articleUrl });
  });

  router.post('/api/dashboard/guilds/:guildId/hyperfokus/articles/:id/reject', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    const articleStore = require('../modules/hyperfokus/articleStore');
    const { reason = '' } = req.body || {};
    const art = articleStore.getArticleById(req.params.id);
    if (!art) return res.status(404).json({ success: false, error: 'article_not_found' });

    const updated = articleStore.updateArticle(req.params.id, {
      status: 'REJECTED',
      editedBy: req.session?.userId || 'owner',
      metadata: {
        ...(art.metadata || {}),
        rejectionReason: String(reason).slice(0, 500),
        rejectedAt: Date.now(),
      },
    });

    return res.json({ success: true, article: updated });
  });

  // ---------- Comunidade da Cringelândia: fórum de hiperfocos e radar ----------
  router.get('/api/dashboard/guilds/:guildId/community', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    return res.json({ success: true, community: require('../services/communityConfig').getCommunityConfig(req.params.guildId) });
  });

  router.put('/api/dashboard/guilds/:guildId/community', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    return res.json({ success: true, community: require('../services/communityConfig').saveCommunityConfig(req.params.guildId, req.body || {}) });
  });

  // ---------- Canal de cores (plano 5.13): cria os 75 cargos e publica o painel ----------
  router.post('/api/dashboard/guilds/:guildId/colors/publish', requireSession, requireGuild, requireCringelandiaOwner, async (req, res) => {
    const colorRoles = require('../services/colorRoles');
    const { COLORS_CHANNEL_ID } = require('../config');
    const channelId = String(req.body?.channelId || COLORS_CHANNEL_ID);
    if (!GUILD_ID_RE.test(channelId)) return res.status(400).json({ success: false, error: 'invalid_channel' });
    const discord = (method, route, body) => studioStore.discord(method, route, body, doFetch);
    try {
      const channel = await discord('GET', `/channels/${channelId}`);
      if (String(channel.guild_id) !== req.params.guildId) return res.status(403).json({ success: false, error: 'channel_not_in_guild' });
      const sync = await colorRoles.syncRoles(req.params.guildId, discord);
      const panel = await colorRoles.publishPanel(req.params.guildId, channelId, discord, 'pt');
      return res.json({ success: true, created: sync.created, reused: sync.reused, renamed: sync.renamed, messages: panel.messages, edited: panel.edited });
    } catch (err) {
      return res.status(502).json({ success: false, error: err.code || 'colors_error' });
    }
  });

  // ---------- Embeds da Pyxie (plano 5.2): personalizar qualquer embed do bot no servidor oficial ----------
  const embedOverrides = require('../services/embedOverrides');
  const EMBED_KEY_RE = /^[0-9a-f]{12}$/;
  function requireEmbedKey(req, res, next) {
    if (!EMBED_KEY_RE.test(req.params.key)) return res.status(400).json({ success: false, error: 'invalid_key' });
    return next();
  }

  router.get('/api/dashboard/guilds/:guildId/embeds', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    return res.json({ success: true, embeds: embedOverrides.listCatalog(req.params.guildId), global: embedOverrides.loadOverrides(req.params.guildId).global });
  });

  router.put('/api/dashboard/guilds/:guildId/embeds-global', requireSession, requireGuild, requireCringelandiaOwner, (req, res) => {
    return res.json({ success: true, global: embedOverrides.setGlobalSwaps(req.params.guildId, req.body?.emojiSwaps) });
  });

  router.get('/api/dashboard/guilds/:guildId/embeds/:key', requireSession, requireGuild, requireCringelandiaOwner, requireEmbedKey, (req, res) => {
    const found = embedOverrides.getEntry(req.params.guildId, req.params.key);
    if (!found) return res.status(404).json({ success: false, error: 'embed_not_found' });
    return res.json({ success: true, ...found });
  });

  // Prévia sem salvar: aplica a mudança do formulário na última amostra real do embed.
  router.post('/api/dashboard/guilds/:guildId/embeds/:key/preview', requireSession, requireGuild, requireCringelandiaOwner, requireEmbedKey, (req, res) => {
    const found = embedOverrides.getEntry(req.params.guildId, req.params.key);
    if (!found) return res.status(404).json({ success: false, error: 'embed_not_found' });
    const override = embedOverrides.normalizeOverride(req.body?.override || {});
    return res.json({ success: true, before: found.entry.sample, after: embedOverrides.applyToEmbed(found.entry.sample, override, found.global.emojiSwaps) });
  });

  router.put('/api/dashboard/guilds/:guildId/embeds/:key', requireSession, requireGuild, requireCringelandiaOwner, requireEmbedKey, async (req, res) => {
    const found = embedOverrides.getEntry(req.params.guildId, req.params.key);
    if (!found) return res.status(404).json({ success: false, error: 'embed_not_found' });
    const saved = embedOverrides.setOverride(req.params.guildId, req.params.key, req.body?.override || {});
    // Prévia real no canal de homologação (AGENTS.md §11), sem marcar ninguém.
    if (saved) {
      const { HOMOLOGATION_CHANNEL_ID } = require('../config/scopes');
      const after = embedOverrides.applyToEmbed(found.entry.sample, saved, found.global.emojiSwaps);
      await studioStore
        .discord('POST', `/channels/${HOMOLOGATION_CHANNEL_ID}/messages`, { content: `-# Prévia: embed personalizado \`${found.entry.command}\``, embeds: [after], allowed_mentions: { parse: [] } }, doFetch)
        .catch(() => null);
    }
    return res.json({ success: true, override: saved });
  });

  router.delete('/api/dashboard/guilds/:guildId/embeds/:key', requireSession, requireGuild, requireCringelandiaOwner, requireEmbedKey, (req, res) => {
    embedOverrides.setOverride(req.params.guildId, req.params.key, {});
    return res.json({ success: true });
  });

  router.post('/api/dashboard/guilds/:guildId/embeds/:key/update-sent', requireSession, requireGuild, requireCringelandiaOwner, requireEmbedKey, async (req, res) => {
    const discord = (method, route, body) => studioStore.discord(method, route, body, doFetch);
    return res.json({ success: true, ...(await embedOverrides.updateSent(req.params.guildId, req.params.key, discord)) });
  });

  // ---------- Tickets (todos os servidores; a Remoção de Conteúdo do Museu só na zona da Cringelândia) ----------
  // A configuração mora no processo do bot: tudo passa pela ponte (módulo tickets/dashboardBridge.js).
  const TICKET_ID_RE = /^tkt_\d{17,20}_\d{10,16}_[a-z0-9]{1,8}$/;
  const ticketsError = (res, err) => {
    const code = err.code || 'bridge_error';
    const status = ['bridge_offline', 'bridge_timeout'].includes(code) ? 503 : code === 'ticket_not_found' ? 404 : 400;
    return res.status(status).json({ success: false, error: code });
  };

  router.get('/api/dashboard/guilds/:guildId/tickets', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, zone: req.guildAccess.zone, ...(await bridge.request('TICKETS_INFO', { guildId: req.params.guildId })) });
    } catch (err) {
      return ticketsError(res, err);
    }
  });

  router.put('/api/dashboard/guilds/:guildId/tickets', requireSession, requireGuild, async (req, res) => {
    const body = req.body || {};
    const options = body.options && typeof body.options === 'object' ? body.options : {};
    if (options.artRemoval && req.guildAccess.zone !== 'cringelandia') return res.status(403).json({ success: false, error: 'cringelandia_only' });
    const pick = (v) => (v ? String(v) : '');
    const textIds = [pick(body.panelChannelId), pick(body.logChannelId), pick(options.artRemoval?.channelId)].filter(Boolean);
    const categoryId = pick(body.categoryId);
    const roleIds = (Array.isArray(options.staffRoleIds) ? options.staffRoleIds : []).map(String);
    // Canais, categoria e cargos precisam ser deste servidor e do tipo certo (o bot confere ao vivo).
    try {
      if (textIds.length || categoryId) {
        const channels = await bridge.request('GUILD_CHANNELS', { guildId: req.params.guildId });
        const find = (id) => channels.find((c) => c.id === id);
        if (!textIds.every((id) => [0, 5].includes(find(id)?.type))) return res.status(400).json({ success: false, error: 'invalid_channel' });
        if (categoryId && find(categoryId)?.type !== 4) return res.status(400).json({ success: false, error: 'invalid_category' });
      }
      if (roleIds.length) {
        const roles = await bridge.request('GUILD_ROLES', { guildId: req.params.guildId });
        if (!roleIds.every((id) => roles.some((r) => r.id === id))) return res.status(400).json({ success: false, error: 'invalid_role' });
      }
      const saved = await bridge.request('TICKETS_SAVE', { guildId: req.params.guildId, panelChannelId: pick(body.panelChannelId), categoryId, logChannelId: pick(body.logChannelId), options }, { timeoutMs: 15000 });
      return res.json({ success: true, zone: req.guildAccess.zone, ...saved });
    } catch (err) {
      return ticketsError(res, err);
    }
  });

  router.post('/api/dashboard/guilds/:guildId/tickets/publish', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, ...(await bridge.request('TICKETS_PUBLISH', { guildId: req.params.guildId, repost: req.body?.repost === true }, { timeoutMs: 15000 })) });
    } catch (err) {
      return ticketsError(res, err);
    }
  });

  router.post('/api/dashboard/guilds/:guildId/tickets/category', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, ...(await bridge.request('TICKETS_CREATE_CATEGORY', { guildId: req.params.guildId }, { timeoutMs: 15000 })) });
    } catch (err) {
      return ticketsError(res, err);
    }
  });

  router.post('/api/dashboard/guilds/:guildId/tickets/:ticketId/close', requireSession, requireGuild, async (req, res) => {
    if (!TICKET_ID_RE.test(req.params.ticketId)) return res.status(400).json({ success: false, error: 'invalid_ticket' });
    try {
      return res.json({ success: true, ...(await bridge.request('TICKETS_CLOSE', { guildId: req.params.guildId, ticketId: req.params.ticketId, by: req.panelSession.userId }, { timeoutMs: 30000 })) });
    } catch (err) {
      return ticketsError(res, err);
    }
  });

  // O canal de homologação é da staff da Pyxie: só o dono manda prévias para lá.
  router.post('/api/dashboard/guilds/:guildId/tickets/preview', requireSession, requireGuild, async (req, res) => {
    if (!access.isOwner(req.panelSession.userId)) return res.status(403).json({ success: false, error: 'owner_only' });
    try {
      return res.json({ success: true, ...(await bridge.request('TICKETS_PREVIEW', { guildId: req.params.guildId }, { timeoutMs: 15000 })) });
    } catch (err) {
      return ticketsError(res, err);
    }
  });

  // Área global: só o dono da Pyxie.
  function requireOwner(req, res, next) {
    if (!access.isOwner(req.panelSession.userId)) return res.status(403).json({ success: false, error: 'owner_only' });
    return next();
  }

  router.get('/api/dashboard/global/commands', requireSession, requireOwner, (req, res) => {
    return res.json({ success: true, commands: require('../services/commandCatalog').allCommands() });
  });

  router.get('/api/dashboard/global/red-flags', requireSession, requireOwner, async (req, res) => {
    try {
      return res.json({ success: true, redFlags: await bridge.request('RED_FLAGS') });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.get('/api/dashboard/global/servers', requireSession, requireOwner, async (req, res) => {
    try {
      return res.json({ success: true, servers: await bridge.request('GUILD_DIRECTORY') });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  router.get('/api/dashboard/global/health', requireSession, requireOwner, async (req, res) => {
    let bot = null;
    try {
      bot = await bridge.request('BOT_HEALTH');
    } catch (err) {
      bot = { error: err.code || 'bridge_error' };
    }
    const mem = process.memoryUsage();
    return res.json({
      success: true,
      web: {
        rssMb: +(mem.rss / 1024 / 1024).toFixed(1),
        uptimeSec: Math.floor(process.uptime()),
        node: process.version,
        ...(typeof getWebStatus === 'function' ? getWebStatus() : {}),
      },
      bot,
      dataDirMb: +(getDataDirBytes() / 1024 / 1024).toFixed(1),
    });
  });

  router.get('/api/dashboard/global/errors', requireSession, requireOwner, (req, res) => {
    const timeWindow = ['24h', '7d', '30d'].includes(req.query.window) ? req.query.window : '7d';
    const ranking = commandTelemetry.getRanking({ timeWindow });
    const list = (Array.isArray(ranking) ? ranking : ranking.commands || [])
      .filter((c) => c.errors > 0)
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 50)
      .map((c) => ({ name: c.name, errors: c.errors, total: c.total, lastUsed: c.lastUsed || 0 }));
    return res.json({ success: true, window: timeWindow, commands: list });
  });

  // Monitor de links (plano 5.6)
  router.get('/api/dashboard/global/links', requireSession, requireOwner, (req, res) => {
    return res.json({ success: true, links: require('../services/linkSentinel').listLinks() });
  });

  router.post('/api/dashboard/global/links', requireSession, requireOwner, (req, res) => {
    try {
      const link = require('../services/linkSentinel').upsertLink({ ...(req.body || {}), source: 'panel' });
      return res.json({ success: true, link });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.code || 'invalid_url' });
    }
  });

  router.delete('/api/dashboard/global/links/:id', requireSession, requireOwner, (req, res) => {
    const ok = require('../services/linkSentinel').removeLink(String(req.params.id));
    return ok ? res.json({ success: true }) : res.status(404).json({ success: false, error: 'link_not_found' });
  });

  router.post('/api/dashboard/global/links/:id/test', requireSession, requireOwner, async (req, res) => {
    const sentinel = require('../services/linkSentinel');
    const link = sentinel.listLinks().find((l) => l.id === String(req.params.id));
    if (!link) return res.status(404).json({ success: false, error: 'link_not_found' });
    return res.json({ success: true, result: await sentinel.probe(link.url, doFetch) });
  });

  // Registro das artes da Pyxie (origem IA/humana e crédito do artista)
  router.get('/api/dashboard/global/assets', requireSession, requireOwner, (req, res) => {
    const assets = require('../services/pyxieAssets');
    return res.json({ success: true, assets: assets.listAssets(), summary: assets.summary() });
  });

  router.put('/api/dashboard/global/assets', requireSession, requireOwner, (req, res) => {
    try {
      const { file, ...patch } = req.body || {};
      return res.json({ success: true, asset: require('../services/pyxieAssets').updateAsset(String(file || ''), patch) });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.code || 'asset_not_found' });
    }
  });

  // Créditos públicos para o site (só artes humanas com artista informado).
  router.get('/api/public/asset-credits', (req, res) => {
    const list = require('../services/pyxieAssets')
      .listAssets()
      .filter((a) => a.origin === 'human' && a.artist)
      .map(({ url, artist, artistUrl }) => ({ url, artist, artistUrl }));
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json({ success: true, credits: list });
  });

  // Gestão da Voz e Personalidade da Pyxie (Groq Voice Seeder & Acervo)
  router.get('/api/dashboard/global/voice', requireSession, requireOwner, (req, res) => {
    const seeder = require('../services/voiceSeederService');
    const db = seeder.loadDatabase();
    return res.json({
      success: true,
      status: seeder.getStatus(),
      categories: seeder.CATEGORIES,
      lines: db.lines || [],
    });
  });

  router.post('/api/dashboard/global/voice/generate', requireSession, requireOwner, async (req, res) => {
    const seeder = require('../services/voiceSeederService');
    const { count = 4, category = null } = req.body || {};
    try {
      const result = await seeder.generateBatch({ count: Number(count) || 4, category });
      return res.json({ success: true, ...result, status: seeder.getStatus() });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.put('/api/dashboard/global/voice/lines/:id', requireSession, requireOwner, (req, res) => {
    const seeder = require('../services/voiceSeederService');
    const { active, pt, en, category } = req.body || {};
    if (active !== undefined) {
      const updated = seeder.toggleLine(String(req.params.id), Boolean(active));
      if (!updated) return res.status(404).json({ success: false, error: 'line_not_found' });
      return res.json({ success: true, line: updated });
    }
    const updated = seeder.editLine(String(req.params.id), { pt, en, category });
    if (!updated) return res.status(404).json({ success: false, error: 'line_not_found' });
    return res.json({ success: true, line: updated });
  });

  router.delete('/api/dashboard/global/voice/lines/:id', requireSession, requireOwner, (req, res) => {
    const seeder = require('../services/voiceSeederService');
    const ok = seeder.deleteLine(String(req.params.id));
    if (!ok) return res.status(404).json({ success: false, error: 'line_not_found' });
    return res.json({ success: true });
  });

  router.get('/api/dashboard/global/modules', requireSession, requireOwner, (req, res) => {
    if (!moduleManager) return res.status(503).json({ success: false, error: 'modules_unavailable' });
    const modules = moduleManager.getAllModules().map((m) => ({
      id: m.id,
      icon: m.icon || null,
      name: typeof m.nameLocalized === 'object' && m.nameLocalized ? m.nameLocalized : { 'pt-BR': m.name, en: m.name },
      description:
        typeof m.descriptionLocalized === 'object' && m.descriptionLocalized
          ? m.descriptionLocalized
          : { 'pt-BR': m.description, en: m.description },
      enabled: Boolean(m.enabled ?? m.active),
      guildScope: m.guildScope || null,
    }));
    return res.json({ success: true, modules });
  });

  router.post('/api/dashboard/global/modules/:id/toggle', requireSession, requireOwner, (req, res) => {
    if (!moduleManager) return res.status(503).json({ success: false, error: 'modules_unavailable' });
    const { id } = req.params;
    if (!moduleManager.getAllModules().some((m) => m.id === id)) return res.status(404).json({ success: false, error: 'module_not_found' });
    const enabled = Boolean(req.body?.enabled);
    moduleManager.setModuleConfigState(id, enabled);
    if (typeof sendIpcToBot === 'function') sendIpcToBot({ type: 'MODULE_TOGGLE', moduleId: id, enabled });
    return res.json({ success: true, moduleId: id, enabled });
  });

  return router;
}

// Tickets: tela (client/src/dashboard/Tickets.jsx) e API acima existem em todo servidor.
registerDashboardSection({ id: 'tickets' });

module.exports = { createDashboardRouter, registerDashboardSection, getSections, GUILD_ID_RE };
