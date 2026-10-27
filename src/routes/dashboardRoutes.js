// Painel novo: login com Discord e API /api/dashboard/*.
// Toda rota de servidor confere a permissão ao vivo pelo bot (panelAccess.checkGuildAccess):
// esconder na tela não basta, o backend recusa.
const crypto = require('node:crypto');
const express = require('express');
const oauth = require('../services/discordOAuth');
const sessions = require('../services/panelSessions');
const access = require('../services/panelAccess');

const STATE_COOKIE = 'pyxie_oauth_state';
const GUILD_ID_RE = /^\d{17,20}$/;

// Seções de cada servidor. Uma seção só entra aqui quando a tela e a API dela existem.
const SECTION_REGISTRY = [];

function registerDashboardSection(section) {
  SECTION_REGISTRY.push(section);
}

function getSections(guildAccess) {
  const base = ['overview', 'channels', 'roles'];
  if (guildAccess.canManageAccess) base.push('access');
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

function createDashboardRouter({ bridge, fetchImpl } = {}) {
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

  return router;
}

module.exports = { createDashboardRouter, registerDashboardSection, getSections, GUILD_ID_RE };
