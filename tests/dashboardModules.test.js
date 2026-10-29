const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🗓️ Testes dos módulos que ganharam tela no painel: mensagens periódicas, agenda e acolhimento...');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-dashmods-'));
process.env.PYXIE_DATA_DIR = tmpDir;
process.env.PANEL_SECRET = 'panel-test-secret-only-for-ci';
process.env.DISCORD_CLIENT_SECRET = 'client-secret-test';

const express = require('express');
const config = require('../src/config');
const periodic = require('../src/services/periodicMessages');
const { getGuildAgenda, nextWeekly } = require('../src/services/guildAgenda');
const agendaCmd = require('../src/commands/agenda');
const periodicModule = require('../src/modules/periodic-messages');
const { createBotBridge, BRIDGE_PREFIX } = require('../src/services/botBridge');
const sessions = require('../src/services/panelSessions');
const { createDashboardRouter, getSections } = require('../src/routes/dashboardRoutes');

const CRINGE = config.CRINGELANDIA_GUILD_ID;
const G = '111111111111111111';
const ADMIN = '333333333333333333';
const CH = '444444444444444444';
const ROLE = '555555555555555555';
const HOUR = 3600000;

let bridge;
function fakeBotSend(msg) {
  setImmediate(() => {
    const { id, request, payload } = msg;
    let data;
    if (request === 'GUILD_LIST') data = [{ id: G, name: 'G', icon: null, memberCount: 3 }];
    else if (request === 'MEMBER_ACCESS') data = payload.userId === ADMIN ? { inGuild: true, botInGuild: true, isAdmin: true, isGuildOwner: false, roleIds: [] } : { inGuild: true, botInGuild: true, isAdmin: false, isGuildOwner: false, roleIds: [] };
    else if (request === 'GUILD_CHANNELS') data = [{ id: CH, name: 'geral', type: 0 }];
    else if (request === 'GUILD_ROLES') data = [{ id: ROLE, name: 'Tarot' }];
    bridge.handleLine(`${BRIDGE_PREFIX}${JSON.stringify({ id, ok: true, data })}`);
  });
  return true;
}
bridge = createBotBridge({ send: fakeBotSend, timeoutMs: 500 });

function cookieFor(userId) {
  const { cookieValue } = sessions.createSession({ user: { id: userId, username: 'u' }, guilds: [{ id: G, name: 'G', owner: false, permissions: '8' }] });
  return `${sessions.COOKIE_NAME}=${encodeURIComponent(cookieValue)}`;
}

(async () => {
  const app = express();
  app.use(express.json());
  app.use('/', createDashboardRouter({ bridge, fetchImpl: async () => ({ ok: false, json: async () => ({}) }) }));
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (p, { cookie, method = 'GET', body } = {}) =>
    fetch(`${base}${p}`, {
      method,
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { 'X-Pyxie-Panel': '1' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });

  try {
    // 1. Config por servidor: a Cringelândia herda os valores antigos; os outros nascem desligados.
    const c = periodic.getConfig(CRINGE);
    assert.equal(c.bumpGuide.enabled, true);
    assert.equal(c.bumpGuide.channelId, config.BUMP_GUIDE_CHANNEL_ID);
    assert.equal(c.bumpGuide.intervalHours, 12);
    assert.deepEqual(c.bumpGuide.sites, periodic.SITES);
    assert.equal(c.tarot.roleId, config.TAROT_ROLE_ID);
    assert.equal(c.tarot.credit, false);
    assert.equal(periodic.tarotChannelId(CRINGE), config.TAROT_CHANNEL_ID);
    const g = periodic.getConfig(G);
    assert.equal(g.bumpGuide.enabled, false);
    assert.equal(g.tarot.credit, true);
    assert.equal(periodic.tarotChannelId(G), '');
    const saved = periodic.saveConfig(G, { bumpGuide: { enabled: true, channelId: CH, intervalHours: 999, sites: ['disboard', 'nope'] }, tarot: { credit: false } });
    assert.equal(saved.bumpGuide.intervalHours, 72, 'Intervalo tem teto');
    assert.deepEqual(saved.bumpGuide.sites, ['disboard']);
    assert.equal(saved.tarot.credit, true, 'O crédito não é editável');
    assert.ok(fs.existsSync(path.join(tmpDir, 'guilds', G, 'periodic.json')));
    assert.ok(!fs.existsSync(path.join(tmpDir, 'guilds', G, 'periodic.json.tmp')), 'Escrita atômica');
    console.log('  ✅ 1. Config por servidor com os valores antigos da Cringelândia.');

    // 2. Guia de apoio: PT/EN, sites escolhidos, sem marcar ninguém; vence pelo intervalo.
    const pt = periodic.buildBumpGuide({ id: CRINGE, name: 'Cringelândia' }, c.bumpGuide);
    assert.equal(pt.embeds[0].data.title, '🚀 Como apoiar Cringelândia');
    assert.ok(pt.embeds[0].data.description.includes('### 🐢 Canudinho'));
    assert.equal(pt.components[0].components[0].data.url, config.SERVER_REVIEW_URL);
    assert.deepEqual(pt.allowedMentions, { parse: [] });
    const en = periodic.buildBumpGuide({ id: G, name: 'G' }, saved.bumpGuide);
    assert.equal(en.embeds[0].data.title, '🚀 How to support G');
    assert.ok(!en.embeds[0].data.description.includes('Canudinho'));
    assert.equal(en.components[0].components.length, 1);
    const now = Date.now();
    assert.equal(periodic.bumpGuideDue(G, now), true);
    periodic.writeState(G, { bumpGuideAt: now - 10 * HOUR });
    assert.equal(periodic.bumpGuideDue(G, now), false, 'Intervalo de 72h: ainda não');
    periodic.saveConfig(G, { bumpGuide: { intervalHours: 8 } });
    assert.equal(periodic.bumpGuideDue(G, now), true);
    periodic.saveConfig(G, { bumpGuide: { intervalHours: 12 } });
    assert.equal(periodic.bumpGuideDue(G, now), false);
    assert.equal(periodic.bumpGuideNextAt(G, now), now + 2 * HOUR);
    console.log('  ✅ 2. Guia de apoio bilíngue e no intervalo escolhido.');

    // 3. Módulo: posta uma vez, grava o estado e não repete; sem estado, acha o guia recente.
    periodic.writeState(G, {});
    const sent = [];
    const guild = { id: G, name: 'G', channels: { cache: new Map([[CH, { id: CH, send: async (p) => sent.push(p) || { id: 'm' }, messages: { fetch: async () => new Map() } }]]) } };
    const client = { user: { id: 'bot' }, guilds: { cache: new Map([[G, guild]]) } };
    assert.equal(await periodicModule.tick(client, now), 1);
    assert.equal(await periodicModule.tick(client, now + HOUR), 0);
    assert.equal(periodic.readState(G).bumpGuideAt, now);
    periodic.writeState(G, {});
    const recent = new Map([['x', { author: { id: 'bot' }, createdTimestamp: now - HOUR, embeds: [{ title: '🚀 How to support G' }] }]]);
    recent.filter = (fn) => { const m = new Map([...recent].filter(([, v]) => fn(v))); m.map = (f) => [...m.values()].map(f); return m; };
    guild.channels.cache.get(CH).messages.fetch = async () => recent;
    assert.equal(await periodicModule.tick(client, now), 0, 'Guia recente no canal: não repete');
    assert.equal(periodic.readState(G).bumpGuideAt, now - HOUR);
    console.log('  ✅ 3. Agendador do guia sem repetir depois de reiniciar.');

    // 4. Tarot diário: alvos por servidor (cargo, crédito, desligado).
    let targets = periodic.tarotTargets([G]);
    assert.deepEqual(targets.find((x) => x.guildId === CRINGE), { guildId: CRINGE, channelId: config.TAROT_CHANNEL_ID, roleId: config.TAROT_ROLE_ID, credit: false });
    assert.ok(!targets.some((x) => x.guildId === G), 'Sem canal, sem anúncio');
    periodic.saveConfig(CRINGE, { tarot: { enabled: false } });
    targets = periodic.tarotTargets([]);
    assert.ok(!targets.some((x) => x.guildId === CRINGE), 'Desligado no painel');
    periodic.saveConfig(CRINGE, { tarot: { enabled: true } });
    console.log('  ✅ 4. Anúncio do tarot por servidor.');

    // 5. Agenda calculada: mesma coisa no comando e no painel.
    const a = getGuildAgenda(CRINGE, now);
    assert.deepEqual(a.map((i) => i.id).sort(), ['bumpGuide', 'tarotDaily']);
    assert.ok(a.every((i) => i.nextAt >= now && i.remainingMs >= 0));
    const wed10 = Date.UTC(2026, 9, 28, 13); // quarta 10:00 BRT
    assert.equal(nextWeekly(wed10 + 30 * 60000, ['3'], 10), wed10 + 30 * 60000, 'Dentro da hora: agora');
    assert.equal(nextWeekly(wed10 + 2 * HOUR, ['3'], 10), wed10 + 7 * 24 * HOUR);
    assert.equal(nextWeekly(wed10, ['4'], 9), wed10 + 23 * HOUR);
    const embedPt = agendaCmd.buildAgendaEmbed({ id: CRINGE, name: 'Cringe' }, now, 'pt').data;
    assert.ok(embedPt.title.includes('Agenda de Automações'));
    assert.ok(embedPt.description.includes('### 🚀 Guia de apoio') && embedPt.description.includes('a cada `12` horas'));
    const embedEn = agendaCmd.buildAgendaEmbed({ id: '999999999999999999', name: 'X' }, now, 'en').data;
    assert.ok(embedEn.description.includes('No automations scheduled'));
    console.log('  ✅ 5. Agenda do próprio servidor no /py-agenda.');

    // 6. Painel: seção para todos, admin conferido ao vivo, canal e cargo do servidor.
    assert.ok(getSections({ zone: 'global', role: 'admin' }).includes('periodic'));
    assert.ok(getSections({ zone: 'global', role: 'admin' }).includes('agenda'));
    const admin = cookieFor(ADMIN);
    assert.equal((await call(`/api/dashboard/guilds/${G}/periodic`, { cookie: cookieFor('666666666666666666') })).status, 403, 'Quem não é admin não vê');
    const got = await (await call(`/api/dashboard/guilds/${G}/periodic`, { cookie: admin })).json();
    assert.equal(got.periodic.bumpGuide.channelId, CH);
    let res = await call(`/api/dashboard/guilds/${G}/periodic`, { cookie: admin, method: 'PUT', body: { bumpGuide: { channelId: '888888888888888888' } } });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_channel');
    res = await call(`/api/dashboard/guilds/${G}/periodic`, { cookie: admin, method: 'PUT', body: { tarot: { roleId: G } } });
    assert.equal((await res.json()).error, 'invalid_role', '@everyone não vale');
    res = await call(`/api/dashboard/guilds/${G}/periodic`, { cookie: admin, method: 'PUT', body: { tarotChannelId: CH, tarot: { roleId: ROLE } } });
    const ok = await res.json();
    assert.equal(ok.periodic.tarotChannelId, CH);
    assert.equal(ok.periodic.tarot.roleId, ROLE);
    assert.equal(require('../src/services/guildConfigService').getTarotChannelId(G), CH, 'Mesmo campo do py!set tarot');
    res = await call(`/api/dashboard/guilds/${G}/periodic`, { cookie: admin, method: 'PUT', body: { tarotChannelId: '' } });
    assert.equal((await res.json()).periodic.tarotChannelId, '');
    const ag = await (await call(`/api/dashboard/guilds/${G}/agenda`, { cookie: admin })).json();
    assert.ok(Array.isArray(ag.agenda));
    console.log('  ✅ 6. Rotas do painel com conferência ao vivo de canal e cargo.');

    // 7. Acolhimento: Cringelândia com os valores antigos; outros servidores configuram tudo.
    const welcomeFlow = require('../src/services/welcomeFlow');
    const checkin = require('../src/services/welcomeCheckinService');
    const w = welcomeFlow.getConfig(CRINGE);
    assert.equal(w.layout, 'guide');
    assert.equal(w.pingRoleId, config.WELCOME_ROLE_ID);
    assert.deepEqual([w.rulesChannelId, w.guidesChannelId, w.rolesChannelId], [config.RULES_CHANNEL_ID, config.GUIDES_CHANNEL_ID, config.COLORS_CHANNEL_ID]);
    assert.deepEqual(w.checkin, { enabled: true, channelId: config.WELCOME_CHANNEL_ID, silentRoleId: checkin.SILENT_ROLE_ID });
    const member = (guild, uid = '777777777777777777') => ({ id: uid, guild, displayName: 'Lua', user: { username: 'lua', bot: false, displayAvatarURL: () => null }, roles: { cache: new Map() }, joinedTimestamp: now - 25 * HOUR, toString: () => `<@${uid}>` });
    const cg = { id: CRINGE, name: 'Cringelândia', memberCount: 10 };
    const guideMsg = welcomeFlow.buildWelcomeMessage(member(cg), { ...w, ...welcomeFlow.getView(CRINGE) });
    assert.equal(guideMsg.content, `<@777777777777777777> chegou! <@&${config.WELCOME_ROLE_ID}>, recebam nossa nova pessoa com carinho 💗`);
    assert.deepEqual(guideMsg.allowedMentions, { parse: [], users: ['777777777777777777'], roles: [config.WELCOME_ROLE_ID] });
    assert.ok(guideMsg.embeds[0].data.description.includes(`<#${config.RULES_CHANNEL_ID}>`));
    assert.ok(guideMsg.embeds[0].data.image.url.startsWith('https://cdn.discordapp.com/'));
    assert.equal(welcomeFlow.reactionsFor({ layout: 'guide', autoReactions: ['🔥'] }).length, 1, 'Guia: um coração sorteado');
    const gv = welcomeFlow.getView(G);
    assert.equal(gv.layout, 'custom');
    assert.equal(gv.channelId, '');
    const customMsg = welcomeFlow.buildWelcomeMessage(member({ id: G, name: 'G', memberCount: 3 }), { ...gv, title: 'Oi {username} em {server}' });
    assert.equal(customMsg.embeds[0].data.title, 'Oi lua em G');
    assert.equal(customMsg.content, 'Welcome <@777777777777777777> to **G**! ✨');
    console.log('  ✅ 7. Boas-vindas por servidor, com a Cringelândia igual a antes.');

    // 8. Acolhimento de 24h por servidor: desligado não entra na fila; ligado manda um lote por dia.
    const uid = `9${String(now).slice(-17).padStart(17, '0')}`;
    const gGuild = { id: G, name: 'G', memberCount: 3 };
    checkin.onGuildMemberAdd(member(gGuild, uid));
    assert.equal(checkin._pendingNewcomers.has(`${G}:${uid}`), false);
    welcomeFlow.saveConfig(G, { checkin: { enabled: true, channelId: CH, silentRoleId: ROLE } });
    const silent = member(gGuild, `${uid.slice(0, -1)}1`);
    silent.roles.cache.set(ROLE, {});
    checkin.onGuildMemberAdd(silent);
    assert.equal(checkin._pendingNewcomers.has(`${G}:${silent.id}`), false, 'Cargo de silêncio nunca entra');
    checkin.onGuildMemberAdd(member(gGuild, uid));
    assert.equal(checkin._pendingNewcomers.has(`${G}:${uid}`), true);
    assert.ok(checkin.nextBatchAt(G, now) >= now);
    assert.ok(getGuildAgenda(G, now).some((i) => i.id === 'welcomeCheckin'));
    const posted = [];
    const ch = { id: CH, isTextBased: () => true, send: async (p) => posted.push(p) || { id: 'm1' } };
    const fakeGuild = { ...gGuild, members: { cache: new Map([[uid, member(gGuild, uid)]]), fetch: async () => null }, channels: { cache: new Map([[CH, ch]]), fetch: async () => null } };
    const res1 = await checkin.checkAndDispatchBatch({ guilds: { cache: new Map([[G, fakeGuild]]) } }, { now });
    assert.equal(res1[G].dispatched, true);
    assert.equal(posted[0].content, `🌸 A warm hug to our new friends: <@${uid}>`);
    assert.deepEqual(posted[0].allowedMentions.users, [uid]);
    assert.ok(posted[0].embeds[0].data.footer.text.startsWith('G • '));
    const res2 = await checkin.checkAndDispatchBatch({ guilds: { cache: new Map([[G, fakeGuild]]) } }, { now: now + HOUR });
    assert.equal(res2[G].reason, 'COOLDOWN_ACTIVE');
    console.log('  ✅ 8. Acolhimento de 24h por servidor, com cargo de silêncio e um lote por dia.');

    // 9. Painel do acolhimento: canal e cargos conferidos ao vivo; py!set lê os mesmos campos.
    res = await call(`/api/dashboard/guilds/${G}/welcome`, { cookie: admin, method: 'PUT', body: { channelId: '888888888888888888' } });
    assert.equal((await res.json()).error, 'invalid_channel');
    res = await call(`/api/dashboard/guilds/${G}/welcome`, { cookie: admin, method: 'PUT', body: { channelId: CH, checkin: { silentRoleId: '999999999999999999' } } });
    assert.equal((await res.json()).error, 'invalid_role');
    res = await call(`/api/dashboard/guilds/${G}/welcome`, { cookie: admin, method: 'PUT', body: { channelId: CH, layout: 'guide', pingRoleId: ROLE, title: 'Oi', imageUrl: 'javascript:alert(1)', autoReactions: ['💗', '✨', '🌸', '🌙', '⭐', '🔥'] } });
    const wv = (await res.json()).welcome;
    assert.equal(wv.channelId, CH);
    assert.equal(wv.layout, 'guide');
    assert.equal(wv.imageUrl, '', 'Só links https');
    assert.equal(wv.autoReactions.length, 5);
    assert.equal(require('../src/services/guildConfigService').getWelcomeConfig(G).channelId, CH, 'Mesmo campo do py!set welcome');
    assert.ok(getSections({ zone: 'global', role: 'admin' }).includes('welcome'));
    console.log('  ✅ 9. Rotas do acolhimento com conferência ao vivo.');

    console.log('💜 Módulos no painel: tudo certo.');
  } finally {
    server.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
