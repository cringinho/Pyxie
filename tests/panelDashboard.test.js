const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🔐 Testes do painel novo: login com Discord, papéis, whitelist e ponte com o bot...');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-panel-'));
process.env.PYXIE_DATA_DIR = tmpDir;
process.env.PANEL_SECRET = 'panel-test-secret-only-for-ci';
process.env.DISCORD_CLIENT_SECRET = 'client-secret-test';
process.env.PANEL_PUBLIC_URL = 'https://pyxie.test';

const express = require('express');
const { createBotBridge, BRIDGE_PREFIX } = require('../src/services/botBridge');
const sessions = require('../src/services/panelSessions');
const panelAccess = require('../src/services/panelAccess');
const { createDashboardRouter } = require('../src/routes/dashboardRoutes');
const { OWNER_SNOWFLAKE, CRINGELANDIA_GUILD_ID, MARY_GUILD_ID, MARY_USER_ID } = require('../src/config/scopes');

const GUILD_A = '111111111111111111';
const GUILD_B = '222222222222222222';
const ADMIN_A = '333333333333333333';
const MEMBER_A = '444444444444444444';
const OWNER_A = '555555555555555555';

// Estado "ao vivo" que o bot devolveria.
const live = {
  guilds: [GUILD_A, GUILD_B, CRINGELANDIA_GUILD_ID, MARY_GUILD_ID],
  members: {
    [`${GUILD_A}:${ADMIN_A}`]: { isAdmin: true, isGuildOwner: false, roleIds: ['900000000000000001'] },
    [`${GUILD_A}:${MEMBER_A}`]: { isAdmin: false, isGuildOwner: false, roleIds: [] },
    [`${GUILD_A}:${OWNER_A}`]: { isAdmin: true, isGuildOwner: true, roleIds: [] },
    [`${CRINGELANDIA_GUILD_ID}:${ADMIN_A}`]: { isAdmin: true, isGuildOwner: false, roleIds: [] },
    [`${MARY_GUILD_ID}:${MARY_USER_ID}`]: { isAdmin: true, isGuildOwner: true, roleIds: [] },
    [`${MARY_GUILD_ID}:${ADMIN_A}`]: { isAdmin: true, isGuildOwner: false, roleIds: [] },
  },
};

// Bot falso do outro lado da ponte: responde pelo mesmo protocolo de linhas.
let bridge;
function fakeBotSend(msg) {
  setImmediate(() => {
    const { id, request, payload } = msg;
    let data;
    if (request === 'GUILD_LIST') {
      data = live.guilds.map((g) => ({ id: g, name: `Guild ${g.slice(0, 3)}`, icon: null, memberCount: 10 }));
    } else if (request === 'MEMBER_ACCESS') {
      const botInGuild = live.guilds.includes(payload.guildId);
      const m = live.members[`${payload.guildId}:${payload.userId}`];
      data = m ? { inGuild: true, botInGuild, ...m } : { inGuild: false, botInGuild };
    } else if (request === 'GUILD_CHANNELS') {
      data = [{ id: '1', name: 'geral', type: 0 }];
    } else if (request === 'GUILD_ROLES') {
      data = [{ id: '2', name: 'Staff' }];
    }
    bridge.handleLine(`${BRIDGE_PREFIX}${JSON.stringify({ id, ok: true, data })}`);
  });
  return true;
}
bridge = createBotBridge({ send: fakeBotSend, timeoutMs: 500 });

// Discord falso para o OAuth.
const fakeDiscord = {
  user: { id: ADMIN_A, username: 'admin_a' },
  guilds: [
    { id: GUILD_A, name: 'A', owner: false, permissions: '8' },
    { id: GUILD_B, name: 'B', owner: false, permissions: '0' },
    { id: CRINGELANDIA_GUILD_ID, name: 'Cringe', owner: false, permissions: '8' },
    { id: MARY_GUILD_ID, name: 'Mary', owner: false, permissions: '8' },
  ],
  revoked: 0,
};
async function fakeFetch(url) {
  const json = (body, ok = true) => ({ ok, status: ok ? 200 : 400, json: async () => body });
  if (url.endsWith('/oauth2/token')) return json({ access_token: 'tok' });
  if (url.endsWith('/oauth2/token/revoke')) {
    fakeDiscord.revoked++;
    return json({});
  }
  if (url.endsWith('/users/@me')) return json(fakeDiscord.user);
  if (url.endsWith('/users/@me/guilds')) return json(fakeDiscord.guilds);
  return json({}, false);
}

function cookieFor(userId, guilds = []) {
  const { cookieValue } = sessions.createSession({ user: { id: userId, username: `u${userId.slice(0, 3)}` }, guilds });
  return `${sessions.COOKIE_NAME}=${encodeURIComponent(cookieValue)}`;
}

(async () => {
  const app = express();
  app.use(express.json());
  app.use('/', createDashboardRouter({ bridge, fetchImpl: fakeFetch }));
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (p, { cookie, method = 'GET', body, panelHeader = true } = {}) =>
    fetch(`${base}${p}`, {
      method,
      redirect: 'manual',
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(panelHeader && method !== 'GET' ? { 'X-Pyxie-Panel': '1' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  try {
    // 1. Ponte: resposta, timeout e bot desligado.
    const list = await bridge.request('GUILD_LIST');
    assert.equal(list.length, 4);
    const silent = createBotBridge({ send: () => true, timeoutMs: 50 });
    await assert.rejects(silent.request('GUILD_LIST'), (e) => e.code === 'bridge_timeout');
    const offline = createBotBridge({ send: () => false });
    await assert.rejects(offline.request('GUILD_LIST'), (e) => e.code === 'bridge_offline');
    assert.equal(bridge.handleLine('linha comum de log'), false, 'Linhas comuns continuam indo para o log');
    console.log('  ✅ 1. Ponte site ↔ bot: resposta, timeout e bot desligado.');

    // 2. Login com Discord: state obrigatório, sessão criada, token revogado, cookie seguro.
    let res = await call('/auth/discord');
    assert.equal(res.status, 302);
    const loc = new URL(res.headers.get('location'));
    assert.equal(loc.searchParams.get('scope'), 'identify guilds', 'Escopos só identify guilds (sem email)');
    assert.equal(loc.searchParams.get('redirect_uri'), 'https://pyxie.test/auth/discord/callback');
    const state = loc.searchParams.get('state');
    res = await call(`/auth/discord/callback?code=abc&state=${state}`);
    assert.equal(res.headers.get('location'), '/dashboard?error=login_state', 'Sem cookie de state o login é recusado');
    res = await call(`/auth/discord/callback?code=abc&state=${state}`, { cookie: `pyxie_oauth_state=${state}` });
    assert.equal(res.headers.get('location'), '/dashboard');
    const setCookie = res.headers.getSetCookie().find((c) => c.startsWith(`${sessions.COOKIE_NAME}=`));
    assert(setCookie && /HttpOnly/.test(setCookie) && /Secure/.test(setCookie) && /SameSite=Lax/.test(setCookie));
    assert.equal(fakeDiscord.revoked, 1, 'O token do Discord é revogado logo após o login');
    const stored = JSON.parse(fs.readFileSync(path.join(tmpDir, 'panelSessions.json'), 'utf8'));
    assert(!JSON.stringify(stored).includes('tok'), 'O access token nunca é guardado');
    const adminCookie = setCookie.split(';')[0];
    console.log('  ✅ 2. Login com Discord: state, sessão em arquivo, token descartado, cookie seguro.');

    // 3. Seletor: admin vê só onde é admin; nunca Cringelândia nem Mary.
    res = await call('/api/dashboard/me', { cookie: adminCookie });
    const me = await res.json();
    assert.deepEqual(me.guilds.map((g) => g.id), [GUILD_A], 'Admin só vê servidores onde é admin, sem Cringelândia nem Mary');
    assert.equal(me.user.isOwner, false);
    res = await call('/api/dashboard/me');
    assert.equal(res.status, 401);
    res = await call('/api/dashboard/me', { cookie: `${sessions.COOKIE_NAME}=forjado.123` });
    assert.equal(res.status, 401, 'Cookie forjado é recusado');
    console.log('  ✅ 3. Seletor de servidores filtrado por papel.');

    // 4. Backend recusa: outro servidor, Cringelândia, Mary.
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}`, { cookie: adminCookie })).status, 200);
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_B}`, { cookie: adminCookie })).status, 403, 'Admin de um servidor não lê outro');
    assert.equal((await call(`/api/dashboard/guilds/${CRINGELANDIA_GUILD_ID}`, { cookie: adminCookie })).status, 403, 'Não-dono não vê a Cringelândia');
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}`, { cookie: adminCookie })).status, 403, 'Admin comum não vê o servidor da Mary');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/channels`, { cookie: cookieFor(MEMBER_A) })).status, 403, 'Membro sem Administrator é recusado');
    const maryCookie = cookieFor(MARY_USER_ID);
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}`, { cookie: maryCookie })).status, 200, 'Mary vê o servidor dela');
    assert.equal((await call(`/api/dashboard/guilds/${CRINGELANDIA_GUILD_ID}`, { cookie: maryCookie })).status, 403);
    const ownerCookie = cookieFor(OWNER_SNOWFLAKE);
    for (const g of [CRINGELANDIA_GUILD_ID, MARY_GUILD_ID, GUILD_B]) {
      assert.equal((await call(`/api/dashboard/guilds/${g}`, { cookie: ownerCookie })).status, 200, `Dono vê ${g}`);
    }
    const ownerMe = await (await call('/api/dashboard/me', { cookie: ownerCookie })).json();
    assert.equal(ownerMe.guilds.length, 4, 'Dono vê todos os servidores da Pyxie');
    console.log('  ✅ 4. Backend recusa servidores de outra pessoa, Cringelândia e Mary.');

    // 5. Permissão conferida ao vivo: perdeu o cargo, perdeu o acesso.
    live.members[`${GUILD_A}:${ADMIN_A}`].isAdmin = false;
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}`, { cookie: adminCookie })).status, 403);
    live.members[`${GUILD_A}:${ADMIN_A}`].isAdmin = true;
    console.log('  ✅ 5. Permissão conferida ao vivo a cada pedido.');

    // 6. Whitelist: desligada por padrão; só o dono da guild mexe; quando ligada, filtra admins.
    const ownerACookie = cookieFor(OWNER_A);
    assert.equal(panelAccess.readWhitelist(GUILD_A).enabled, false, 'Whitelist desligada por padrão');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/access`, { cookie: adminCookie })).status, 403, 'Admin comum não mexe na whitelist');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/access`, {
      cookie: ownerACookie,
      method: 'PUT',
      body: { enabled: true, userIds: [OWNER_A], roleIds: [] },
    });
    assert.equal(res.status, 200);
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}`, { cookie: adminCookie })).status, 403, 'Whitelist ligada barra admin fora da lista');
    await call(`/api/dashboard/guilds/${GUILD_A}/access`, {
      cookie: ownerACookie,
      method: 'PUT',
      body: { enabled: true, userIds: [], roleIds: ['900000000000000001'] },
    });
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}`, { cookie: adminCookie })).status, 200, 'Whitelist por cargo libera');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/access`, {
      cookie: ownerACookie,
      method: 'PUT',
      body: { enabled: false },
      panelHeader: false,
    });
    assert.equal(res.status, 403, 'Pedido que muda algo sem o cabeçalho do painel é recusado (CSRF)');
    console.log('  ✅ 6. Whitelist por servidor e proteção contra CSRF.');

    // 7. Logout e painel sem segredo.
    await call('/auth/logout', { cookie: adminCookie, method: 'POST' });
    assert.equal((await call('/api/dashboard/me', { cookie: adminCookie })).status, 401, 'Logout invalida a sessão');
    const saved = process.env.PANEL_SECRET;
    delete process.env.PANEL_SECRET;
    assert.equal((await call('/auth/discord')).status, 503, 'Sem PANEL_SECRET o login não sobe');
    assert.equal((await call('/api/dashboard/me', { cookie: ownerCookie })).status, 401);
    process.env.PANEL_SECRET = saved;
    console.log('  ✅ 7. Logout e recusa sem segredo configurado.');

    console.log('🎉 [TEST] Painel novo (etapa 1) validado!');
  } finally {
    server.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
