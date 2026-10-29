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
      data = [{ id: '1', name: 'geral', type: 0 }, { id: '777777777777777777', name: 'staff', type: 0 }];
    } else if (request === 'GUILD_DIRECTORY') {
      data = [{ id: GUILD_A, name: 'A', icon: null, description: '', memberCount: 10, ownerId: OWNER_A, ownerName: 'dona', createdAt: 1, joinedAt: 2 }];
    } else if (request === 'INJECT_INFO') {
      data = { roleIcons: false, community: false, canManageRoles: true, injections: [] };
    } else if (request === 'INJECT_START') {
      data = { jobId: 'abc123' };
    } else if (request === 'RED_FLAGS') {
      data = [{ id: 'f1', targetType: 'user', targetId: ADMIN_A, severity: 'HIGH', reason: 'pico' }];
    } else if (request === 'APPEAL_LIST') {
      data = [{ guildId: GUILD_A, name: 'A', banned: true, banReason: 'spam', appeal: null, canAppeal: true }];
    } else if (request === 'APPEAL_SUBMIT') {
      bridge.handleLine(`${BRIDGE_PREFIX}${JSON.stringify(payload.text.includes('pendente') ? { id, ok: false, error: 'pending' } : { id, ok: true, data: { status: 'pending', createdAt: 1, decidedAt: null } })}`);
      return;
    } else if (request === 'BOT_PERMISSIONS') {
      data = { permissions: { ManageMessages: true, ViewAuditLog: false }, roleName: 'Pyxie' };
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
    for (const g of [CRINGELANDIA_GUILD_ID, MARY_GUILD_ID]) {
      assert.equal((await call(`/api/dashboard/guilds/${g}`, { cookie: ownerCookie })).status, 200, `Dono vê ${g}`);
    }
    for (const g of [GUILD_A, GUILD_B]) {
      assert.equal((await call(`/api/dashboard/guilds/${g}`, { cookie: ownerCookie })).status, 403, `Dono da Pyxie não abre servidor alheio ${g}`);
    }
    const ownerMe = await (await call('/api/dashboard/me', { cookie: ownerCookie })).json();
    assert.deepEqual(ownerMe.guilds.map((g) => g.id).sort(), [CRINGELANDIA_GUILD_ID, MARY_GUILD_ID].sort(), 'Dono só vê as zonas do projeto e onde é admin');
    const dir = await (await call('/api/dashboard/global/servers', { cookie: ownerCookie })).json();
    assert.deepEqual(Object.keys(dir.servers[0]).sort(), ['createdAt', 'description', 'icon', 'id', 'joinedAt', 'memberCount', 'name', 'ownerId', 'ownerName'], 'Lista só com dados públicos');
    assert.equal((await call('/api/dashboard/global/servers', { cookie: cookieFor(ADMIN_A) })).status, 403, 'Lista de servidores é só do dono');
    const flags = await (await call('/api/dashboard/global/red-flags', { cookie: ownerCookie })).json();
    assert.equal(flags.redFlags[0].severity, 'HIGH', 'Alertas vêm do processo do bot pela ponte');
    assert.equal((await call('/api/dashboard/global/red-flags', { cookie: cookieFor(ADMIN_A) })).status, 403);
    console.log('  ✅ 4. Backend recusa servidores de outra pessoa, Cringelândia e Mary.');

    // 4b. Estúdio da Mary no painel: só na zona mary, IDs conferidos, ação da lojinha só no servidor dela.
    const maryInfo = await (await call(`/api/dashboard/guilds/${MARY_GUILD_ID}`, { cookie: maryCookie })).json();
    for (const id of ['maryStore', 'maryTools', 'maryProfile']) assert.ok(maryInfo.sections.includes(id), `Mary tem a seção ${id}`);
    const adminInfo = await (await call(`/api/dashboard/guilds/${GUILD_A}`, { cookie: adminCookie })).json();
    assert.ok(!adminInfo.sections.some((s) => s.startsWith('mary')), 'Outros servidores não veem as telas da Mary');
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/store`, { cookie: maryCookie })).status, 200);
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/store`, { cookie: ownerCookie })).status, 200, 'O dono também abre a lojinha');
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/store`, { cookie: adminCookie })).status, 403, 'Admin comum não abre a lojinha');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/mary/store`, { cookie: adminCookie })).status, 403, 'Rotas da Mary recusam outra zona');
    let maryRes = await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/store`, { cookie: maryCookie, method: 'PUT', body: { statusLoja: 'fila', estoqueRobux: 5000, preco1k: 35.5 } });
    const savedStore = (await maryRes.json()).store;
    assert.equal(savedStore.statusLoja, 'fila');
    assert.equal(savedStore.variables.preco_1k, 'R$ 35,50', 'Variáveis das mensagens seguem a lojinha');
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/store`, { cookie: maryCookie, method: 'PUT', body: { channelReviews: '888888888888888888' } })).status, 400, 'Canal de fora é recusado');
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/store`, { cookie: maryCookie, method: 'PUT', body: { channelReviews: '777777777777777777' } })).status, 200);
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/store`, { cookie: maryCookie, method: 'PUT', body: { statusLoja: 'aberta' } })).status, 400);
    const calc = await (await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/calc`, { cookie: maryCookie, method: 'POST', body: { robux: 1000 } })).json();
    assert.equal(calc.result.gamepass, 1429, 'Calculadora dos 30%');
    maryRes = await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/mary/templates/vitrine_principal`, { cookie: maryCookie, method: 'POST', body: {} });
    const tplId = (await maryRes.json()).id;
    const tplDoc = (await (await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/studio/${tplId}`, { cookie: maryCookie })).json()).message;
    assert.ok(tplDoc.buttons.some((b) => b.action.type === 'mary' && b.action.kind === 'ticket'), 'Modelo traz botão de ticket da lojinha');
    assert.ok(tplDoc.buttons.some((b) => b.action.type === 'tab') && tplDoc.tabs.length > 0, 'Card explicativo vira aba privada');
    const maryButton = { id: 'b1', label: 'Calcular', style: 'success', action: { type: 'mary', kind: 'calculator' } };
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/studio/loja`, { cookie: adminCookie, method: 'PUT', body: { name: 'Loja', buttons: [maryButton] } })).status, 403, 'Ação da lojinha só no servidor da Mary');
    assert.equal((await call(`/api/dashboard/guilds/${MARY_GUILD_ID}/studio/loja`, { cookie: maryCookie, method: 'PUT', body: { name: 'Loja', envelope: { content: 'Estoque: {estoque}' }, buttons: [maryButton] } })).status, 200);
    const maryPayload = require('../src/services/messageStudio').buildPayload(require('../src/services/messageStudioStore').getMessage(MARY_GUILD_ID, 'loja'), { vars: require('../src/services/messageStudio').guildVars(MARY_GUILD_ID) });
    assert.equal(maryPayload.components[0].components[0].custom_id, 'mary_btn:calculator:b1', 'Botão vai para o handler da lojinha');
    assert.equal(maryPayload.content, 'Estoque: 5.000 R$', 'Variável da lojinha resolvida no envio');
    const upload = (body, type) => fetch(`${base}/api/dashboard/guilds/${MARY_GUILD_ID}/mary/upload`, { method: 'POST', headers: { Cookie: maryCookie, 'X-Pyxie-Panel': '1', 'Content-Type': type }, body });
    const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8cfc0f01f0005000201a5c2b5e10000000049454e44ae426082', 'hex');
    maryRes = await upload(png, 'image/png');
    assert.equal(maryRes.status, 200, 'PNG de verdade é aceito');
    assert.match((await maryRes.json()).url, /\/api\/mary\/media\/mary_\w+\.png$/);
    assert.equal((await upload(Buffer.from('<script>alert(1)</script>'), 'image/png')).status, 400, 'Arquivo que não é imagem é recusado');
    console.log('  ✅ 4b. Telas da Mary: zona, canais conferidos, modelos, botões da lojinha e upload seguro.');

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

    // 6b. Segurança (todos os servidores): padrão ligado, canal de alertas só deste servidor.
    res = await call(`/api/dashboard/guilds/${GUILD_A}/security`, { cookie: adminCookie });
    assert.equal(res.status, 200, 'Admin de servidor comum abre a Segurança');
    let sec = await res.json();
    assert.equal(sec.security.linkShield.enabled, true, 'Escudo de links nasce ligado');
    assert.equal(sec.security.guard.mode, 'alert', 'Guardião nasce só alertando');
    assert.deepEqual(sec.counters, { link: 0, role: 0, channel: 0, raid: 0, file: 0, webhook: 0, invites: 0 });
    const guildInfo = await (await call(`/api/dashboard/guilds/${GUILD_A}`, { cookie: adminCookie })).json();
    assert(guildInfo.sections.includes('security'), 'Seção Segurança aparece para todo servidor');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/security`, { cookie: adminCookie, method: 'PUT', body: { staffLogChannelId: '888888888888888888' } });
    assert.equal(res.status, 400, 'Canal de outro servidor é recusado');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/security`, {
      cookie: adminCookie,
      method: 'PUT',
      body: { staffLogChannelId: '777777777777777777', linkShield: { action: 'warn', allowDomains: ['https://Exemplo.com.br/x', 'lixo'] }, guard: { mode: 'auto' } },
    });
    sec = await res.json();
    assert.equal(sec.security.staffLogChannelId, '777777777777777777');
    assert.equal(sec.security.linkShield.action, 'warn');
    assert.deepEqual(sec.security.linkShield.allowDomains, ['exemplo.com.br'], 'Domínios liberados limpos');
    assert.equal(sec.security.guard.mode, 'auto');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_B}/security`, { cookie: adminCookie })).status, 403, 'Segurança de outro servidor é recusada');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/security`, { cookie: adminCookie, method: 'PUT', body: {}, panelHeader: false })).status, 403, 'Sem cabeçalho do painel (CSRF)');
    // Apelação: qualquer pessoa logada vê os próprios banimentos e manda pedido.
    const memberCookie = cookieFor(MEMBER_A);
    const ap = await (await call('/api/dashboard/appeals', { cookie: memberCookie })).json();
    assert.equal(ap.servers[0].canAppeal, true, 'Membro comum abre a apelação');
    assert.equal((await call('/api/dashboard/appeals')).status, 401, 'Apelação exige login');
    res = await call(`/api/dashboard/appeals/${GUILD_A}`, { cookie: memberCookie, method: 'POST', body: { text: 'curto' } });
    assert.equal(res.status, 400, 'Texto curto é recusado no site');
    res = await call(`/api/dashboard/appeals/${GUILD_A}`, { cookie: memberCookie, method: 'POST', body: { text: 'Peço para voltar, entendi o erro.' } });
    assert.equal((await res.json()).appeal.status, 'pending');
    res = await call(`/api/dashboard/appeals/${GUILD_A}`, { cookie: memberCookie, method: 'POST', body: { text: 'Pedido pendente de novo, por favor.' } });
    assert.equal((await res.json()).error, 'pending', 'Erro do bot chega no site');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/security`, { cookie: adminCookie, method: 'PUT', body: { antiRaid: { joins: 25 }, appeals: { enabled: true, channelId: '777777777777777777' } } });
    sec = await res.json();
    assert.equal(sec.security.antiRaid.joins, 25, 'Ajustes do anti-raid são salvos');
    assert.deepEqual(sec.security.appeals, { enabled: true, channelId: '777777777777777777' });
    // Comandos: catálogo automático por servidor (escopo, dono, grupo desligado).
    const cmdsA = (await (await call(`/api/dashboard/guilds/${GUILD_A}/commands`, { cookie: adminCookie })).json()).commands;
    assert(cmdsA.some((c) => c.name === 'py-marriage'), 'Comandos globais aparecem');
    assert(!cmdsA.some((c) => c.ownerOnly), 'Comandos do dono não aparecem para admin comum');
    assert(!cmdsA.some((c) => c.guildScope.includes(CRINGELANDIA_GUILD_ID)), 'Exclusivos da Cringelândia não aparecem em outro servidor');
    await call(`/api/dashboard/guilds/${GUILD_A}/features`, { cookie: adminCookie, method: 'PUT', body: { groups: { marriage: false } } });
    const married = (await (await call(`/api/dashboard/guilds/${GUILD_A}/commands`, { cookie: adminCookie })).json()).commands.find((c) => c.name === 'py-marriage');
    assert.equal(married.status, 'disabled', 'Grupo desligado em Recursos aparece como desligado');
    const cringeCmds = (await (await call(`/api/dashboard/guilds/${CRINGELANDIA_GUILD_ID}/commands`, { cookie: cookieFor(OWNER_SNOWFLAKE) })).json()).commands;
    assert(cringeCmds.some((c) => c.guildScope.includes(CRINGELANDIA_GUILD_ID)), 'Cringelândia vê os exclusivos dela');
    assert(cringeCmds.some((c) => c.ownerOnly), 'Dono vê os comandos dele');
    const allCmds = (await (await call('/api/dashboard/global/commands', { cookie: cookieFor(OWNER_SNOWFLAKE) })).json()).commands;
    assert(allCmds.length >= cringeCmds.length, 'Visão global tem todos');
    assert.equal((await call('/api/dashboard/global/commands', { cookie: adminCookie })).status, 403);
    // Injeções: catálogo vem do código; pedido inválido é recusado antes de chegar no bot.
    const injData = await (await call(`/api/dashboard/guilds/${GUILD_A}/injections`, { cookie: adminCookie })).json();
    assert(injData.packs.sexuality.items.length >= 25 && injData.packs.gender.items.length >= 10, 'Pacotes no painel');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/injections`, { cookie: adminCookie, method: 'POST', body: { pack: 'nada' } });
    assert.equal(res.status, 400);
    res = await call(`/api/dashboard/guilds/${GUILD_A}/injections`, { cookie: adminCookie, method: 'POST', body: { pack: 'gender', options: { publish: true, channelId: '888888888888888888' } } });
    assert.equal(res.status, 400, 'Canal de outro servidor é recusado');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/injections`, { cookie: adminCookie, method: 'POST', body: { pack: 'gender', options: { publish: false } } });
    assert.equal((await res.json()).jobId, 'abc123');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_B}/injections`, { cookie: adminCookie })).status, 403);
    // Automações: o mesmo esquema monta a tela e valida; canal de fora é recusado.
    const autoData = await (await call(`/api/dashboard/guilds/${GUILD_A}/automations`, { cookie: adminCookie })).json();
    assert(autoData.schema.animator.fields.some((f) => f.key === 'enabled'), 'Esquema do animador com o liga/desliga');
    assert.equal(autoData.configs.animator.enabled, false, 'Animador desligado por padrão');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/automations/animator`, { cookie: adminCookie, method: 'PUT', body: { enabled: true, channelIds: ['888888888888888888'] } });
    assert.equal(res.status, 400, 'Canal de outro servidor é recusado');
    res = await call(`/api/dashboard/guilds/${GUILD_A}/automations/animator`, { cookie: adminCookie, method: 'PUT', body: { enabled: true, channelIds: ['777777777777777777'], maxPerDay: 99, tone: 'rude' } });
    const savedAuto = (await res.json()).config;
    assert.equal(savedAuto.maxPerDay, 6, 'Número fora do limite é ajustado');
    assert.equal(savedAuto.tone, 'cute', 'Opção desconhecida volta ao padrão');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/automations/nada`, { cookie: adminCookie, method: 'PUT', body: {} })).status, 404);
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_B}/automations`, { cookie: adminCookie })).status, 403);
    // Canal de jogos de outro servidor não entra; o deste servidor entra
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/features`, { cookie: adminCookie, method: 'PUT', body: { channels: { games: ['888888888888888888'] } } })).status, 400, 'Canal de jogos de outro servidor é recusado');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_A}/features`, { cookie: adminCookie, method: 'PUT', body: { channels: { games: ['777777777777777777'] } } })).status, 200);
    // Nenhuma rota de servidor pode existir sem a conferência ao vivo (requireGuild)
    const routeSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'routes', 'dashboardRoutes.js'), 'utf8');
    const guildRoutes = [...routeSrc.matchAll(/router\.(?:get|post|put|patch|delete)\('(\/api\/dashboard\/guilds\/:guildId[^']*)',([^\n]*)/g)];
    assert.ok(guildRoutes.length > 20, 'achou as rotas de servidor');
    for (const [, route, rest] of guildRoutes) assert.ok(/requireSession,\s*requireGuild\b/.test(rest), `Rota ${route} sem requireSession + requireGuild`);
    const globalRoutes = [...routeSrc.matchAll(/router\.(?:get|post|put|patch|delete)\('(\/api\/dashboard\/global\/[^']*)',([^\n]*)/g)];
    for (const [, route, rest] of globalRoutes) assert.ok(/requireSession,\s*requireOwner\b/.test(rest), `Rota global ${route} sem requireOwner`);
    const act = await (await call(`/api/dashboard/guilds/${GUILD_A}/activity`, { cookie: adminCookie })).json();
    assert.equal(act.series.length, 30, 'Atividade: série de 30 dias');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_B}/activity`, { cookie: adminCookie })).status, 403);
    const perms = await (await call(`/api/dashboard/guilds/${GUILD_A}/bot-permissions`, { cookie: adminCookie })).json();
    assert.deepEqual(perms.permissions, { ManageMessages: true, ViewAuditLog: false }, 'Permissões da Pyxie conferidas ao vivo');
    assert.equal((await call(`/api/dashboard/guilds/${GUILD_B}/bot-permissions`, { cookie: adminCookie })).status, 403);
    console.log('  ✅ 6b. Segurança: padrões, canal conferido ao vivo, domínios limpos e acesso por servidor.');

    // 7. Logout e painel sem segredo.
    await call('/auth/logout', { cookie: adminCookie, method: 'POST' });
    assert.equal((await call('/api/dashboard/me', { cookie: adminCookie })).status, 401, 'Logout invalida a sessão');
    const saved = process.env.PANEL_SECRET;
    delete process.env.PANEL_SECRET;
    assert.equal((await call('/auth/discord')).status, 503, 'Sem PANEL_SECRET o login não sobe');
    assert.equal((await call('/api/dashboard/me', { cookie: ownerCookie })).status, 401);
    process.env.PANEL_SECRET = saved;
    console.log('  ✅ 7. Logout e recusa sem segredo configurado.');

    // 8. Dicionário das telas do painel: mesmas chaves e placeholders em pt e en.
    const { DASH_I18N } = await import(require('node:url').pathToFileURL(path.join(__dirname, '..', 'client', 'src', 'dashboard', 'i18n.js')).href);
    const ptKeys = Object.keys(DASH_I18N.pt).sort();
    assert.deepEqual(Object.keys(DASH_I18N.en).sort(), ptKeys, 'Painel: chaves pt e en idênticas');
    for (const k of ptKeys) {
      const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
      assert.equal(ph(DASH_I18N.en[k]), ph(DASH_I18N.pt[k]), `Painel: placeholders iguais em ${k}`);
    }
    console.log('  ✅ 8. Telas do painel bilíngues (pt/en).');

    console.log('🎉 [TEST] Painel novo validado!');
  } finally {
    server.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
