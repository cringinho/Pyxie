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

const STATE_COOKIE = 'pyxie_oauth_state';
const GUILD_ID_RE = /^\d{17,20}$/;

// Seções de cada servidor. Uma seção só entra aqui quando a tela e a API dela existem.
const SECTION_REGISTRY = [];

function registerDashboardSection(section) {
  SECTION_REGISTRY.push(section);
}

function getSections(guildAccess) {
  const base = ['overview', 'studio', 'features', 'security', 'channels', 'roles'];
  if (guildAccess.canManageAccess) base.push('access');
  if (guildAccess.zone === 'cringelandia' && guildAccess.role === 'owner') base.push('embeds', 'moderation', 'community', 'seasonal', 'partnerships');
  const extra = SECTION_REGISTRY.filter((s) => !s.zones || s.zones.includes(guildAccess.zone))
    .filter((s) => !s.roles || s.roles.includes(guildAccess.role))
    .map((s) => s.id);
  return [...base, ...extra];
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
    res.setHeader(
      'Set-Cookie',
      `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/auth/discord; Max-Age=600`
    );
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
      res.setHeader('Set-Cookie', [clearState, sessions.buildCookie(cookieValue)]);
      return res.redirect('/dashboard');
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

  router.put('/api/dashboard/guilds/:guildId/features', requireSession, requireGuild, (req, res) => {
    const { guildId } = req.params;
    const body = req.body || {};
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

  router.get('/api/dashboard/guilds/:guildId/studio/:msgId', requireSession, requireGuild, requireMsgId, (req, res) => {
    const doc = studioStore.getMessage(req.params.guildId, req.params.msgId);
    if (!doc) return res.status(404).json({ success: false, error: 'message_not_found' });
    return res.json({ success: true, message: doc });
  });

  router.put('/api/dashboard/guilds/:guildId/studio/:msgId', requireSession, requireGuild, requireMsgId, (req, res) => {
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

  router.get('/api/dashboard/guilds/:guildId/activity', requireSession, requireGuild, (req, res) => {
    return res.json({ success: true, ...require('../services/guildActivity').summary(req.params.guildId) });
  });

  router.get('/api/dashboard/guilds/:guildId/bot-permissions', requireSession, requireGuild, async (req, res) => {
    try {
      return res.json({ success: true, ...(await bridge.request('BOT_PERMISSIONS', { guildId: req.params.guildId })) });
    } catch (err) {
      return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
    }
  });

  // ---------- Segurança (todos os servidores): escudo de links e guardião do servidor ----------
  router.get('/api/dashboard/guilds/:guildId/security', requireSession, requireGuild, (req, res) => {
    const safety = require('../services/guildSafety');
    const { counters, events } = safety.readEvents(req.params.guildId);
    return res.json({ success: true, security: safety.getConfig(req.params.guildId, { fresh: true }), counters, events: events.slice(0, 20) });
  });

  router.put('/api/dashboard/guilds/:guildId/security', requireSession, requireGuild, async (req, res) => {
    const safety = require('../services/guildSafety');
    const body = req.body || {};
    const staffLogChannelId = String(body.staffLogChannelId || '');
    // O canal de alertas precisa ser deste servidor (o bot confere ao vivo).
    if (staffLogChannelId) {
      try {
        const channels = await bridge.request('GUILD_CHANNELS', { guildId: req.params.guildId });
        if (!channels.some((c) => c.id === staffLogChannelId)) return res.status(400).json({ success: false, error: 'invalid_channel' });
      } catch (err) {
        return res.status(503).json({ success: false, error: err.code || 'bridge_error' });
      }
    }
    const security = safety.saveConfig(req.params.guildId, { staffLogChannelId, linkShield: body.linkShield || {}, guard: body.guard || {} });
    return res.json({ success: true, security });
  });

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

  // Área global: só o dono da Pyxie.
  function requireOwner(req, res, next) {
    if (!access.isOwner(req.panelSession.userId)) return res.status(403).json({ success: false, error: 'owner_only' });
    return next();
  }

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

module.exports = { createDashboardRouter, registerDashboardSection, getSections, GUILD_ID_RE };
