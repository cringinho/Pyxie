const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🤖 Testes das automações (segurança, moderação e utilidade)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-autos-'));

const { AuditLogEvent, ChannelType } = require('discord.js');
const rules = require('../src/services/autoRules');
const auto = require('../src/services/automations');
const safety = require('../src/services/guildSafety');
const automod = require('../src/services/automodPresets');
const sec = require('../src/modules/auto-safety');
const mod = require('../src/modules/auto-moderation');
const util = require('../src/modules/auto-utility');

const G = '1453890868980482090';
const LOG = '444000000000000001';
const STAFF = '444000000000000002';
const ids = (n) => String(500000000000000000n + BigInt(n));

// Canal e servidor falsos com o mínimo que os módulos usam.
function fakeChannel(id, extra = {}) {
  const ch = {
    id,
    sent: [],
    deleted: [],
    edited: [],
    rateLimitPerUser: 0,
    isTextBased: () => true,
    send: async (p) => {
      ch.sent.push(p);
      return { id: `s${ch.sent.length}`, delete: async () => true };
    },
    messages: { delete: async (mid) => ch.deleted.push(mid), edit: async (mid, p) => ch.edited.push([mid, p]) },
    setRateLimitPerUser: async (s) => {
      ch.rateLimitPerUser = s;
    },
    ...extra,
  };
  return ch;
}
const channels = new Map([LOG, STAFF, ids(1), ids(2), ids(3)].map((id) => [id, fakeChannel(id)]));
const guild = { id: G, name: 'Teste', ownerId: ids(99), vanityURLCode: 'meuserver', channels: { cache: channels }, roles: { cache: new Map() }, members: { me: { roles: { highest: { position: 10 } } } } };
const client = { user: { id: ids(98) }, guilds: { cache: new Map([[G, guild]]) }, fetchInvite: async (code) => ({ guild: { id: code === 'nosso' ? G : ids(77) } }) };
const lastStaff = () => channels.get(STAFF).sent.at(-1)?.embeds?.[0]?.data;

(async () => {
  try {
    // 1. Regras puras.
    assert.equal(rules.cleanName('Joa̶̷̸o discord.gg/abc'), 'Joao');
    assert.equal(rules.cleanName('João'), null, 'Acento normal não é mexido');
    assert.equal(rules.cleanName('!!!Ana', { hoist: true }), 'Ana');
    assert(rules.imitates('M0der4dora', 'Moderadora'));
    assert(rules.imitates('rnoderadora', 'Moderadora'));
    assert(!rules.imitates('Ana', 'Bia'));
    assert.deepEqual(rules.inviteCodes('entra aí discord.gg/abc123 e https://discord.com/invite/xyz'), ['abc123', 'xyz']);
    assert.deepEqual(rules.fixLinks('olha https://x.com/pyxie/status/123?s=20', ['x']), ['https://fxtwitter.com/pyxie/status/123']);
    assert.deepEqual(rules.fixLinks('<https://x.com/pyxie/status/123>', ['x']), [], 'Link entre < > fica quieto');
    assert(rules.contrast('ffffff', '000000') > 20);
    const fixed = rules.suggestColor('1f2a44', 3);
    assert(rules.contrast(fixed, rules.BACKGROUNDS.dark) >= 3, 'Sugestão passa no contraste');
    assert.equal(rules.unresolvedIncidents({ incidents: [{ id: 1, name: 'x', status: 'investigating' }, { id: 2, status: 'resolved' }] }).length, 1);
    console.log('  ✅ 1. Regras puras (nomes, convites, links, contraste, incidentes).');

    // 2. Esquemas: todo campo tem rótulo PT/EN no painel.
    const src = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'dashboard', 'i18n.js'), 'utf8');
    const ptBlock = src.slice(0, src.indexOf('\n  en: {'));
    const enBlock = src.slice(src.indexOf('\n  en: {'));
    for (const [key, def] of Object.entries(auto.publicSchema())) {
      for (const k of [`auto.${key}.title`, `auto.${key}.desc`, ...def.fields.filter((f) => f.key !== 'enabled').map((f) => `auto.${key}.${f.key}`)]) {
        assert(ptBlock.includes(`"${k}"`) && enBlock.includes(`"${k}"`), `Rótulo ${k} em PT e EN`);
      }
      for (const n of def.needs) assert(ptBlock.includes(`"${n.why}"`) && enBlock.includes(`"${n.why}"`), `Permissão ${n.why} explicada`);
    }
    assert(Object.keys(auto.publicSchema()).length >= 22, 'Animador + 21 automações');
    console.log('  ✅ 2. Esquemas com rótulos e permissões nos dois idiomas.');

    // 3. AutoMod: cria, recusa quando já existe regra feita à mão, apaga ao desligar.
    const calls = [];
    let existing = [];
    const discord = async (method, route, body) => {
      calls.push([method, route, body]);
      if (method === 'GET') return existing;
      return { id: 'r1', ...body };
    };
    const cfgOn = auto.normalize('automodPresets', { enabled: true, presets: ['slurs', 'profanity'], mentionLimit: 10 });
    await automod.sync(G, cfgOn, { discord });
    const posts = calls.filter((c) => c[0] === 'POST');
    assert.equal(posts.length, 2, 'Duas regras criadas');
    assert.deepEqual(posts[0][2].trigger_metadata.presets, [3, 1]);
    existing = [{ id: 'm1', name: 'Regra antiga', trigger_type: 4 }];
    await assert.rejects(automod.sync(G, cfgOn, { discord }), /automod_exists/);
    existing = [{ id: 'r1', name: automod.RULE_PRESET, trigger_type: 4 }];
    calls.length = 0;
    await automod.sync(G, { ...cfgOn, enabled: false }, { discord });
    assert(calls.some((c) => c[0] === 'DELETE'), 'Desligar apaga a regra da Pyxie');
    console.log('  ✅ 3. Filtros prontos do AutoMod sincronizados.');

    // 4. Segurança.
    safety.saveConfig(G, { staffLogChannelId: STAFF });
    auto.saveConfig(G, 'newAccountGate', { enabled: true, minAgeDays: 7, roleId: ids(50) });
    const given = [];
    const newbie = { id: ids(10), guild, user: { id: ids(10), username: 'novo', createdTimestamp: Date.now() - 86400000 }, roles: { add: async (r) => given.push(r), cache: new Map() } };
    assert.deepEqual(await sec.checkNewAccount(newbie), { quarantined: true });
    assert.deepEqual(given, [ids(50)]);
    assert(lastStaff().title.includes('🐣'));
    newbie.user.createdTimestamp = Date.now() - 30 * 86400000;
    assert.equal(await sec.checkNewAccount(newbie), null, 'Conta antiga passa');

    auto.saveConfig(G, 'nameSanitizer', { enabled: true });
    let nick = null;
    const zalgo = { id: ids(11), guild, manageable: true, nickname: 'Z̶̷̸e https://golpe.ru', user: { username: 'z' }, setNickname: async (n) => (nick = n) };
    await sec.checkName(zalgo);
    assert.equal(nick, 'Ze');

    auto.saveConfig(G, 'staffImpersonation', { enabled: true, staffRoleIds: [ids(60)] });
    const staffMember = { id: ids(12), nickname: 'Moderadora', user: { username: 'mod' } };
    guild.roles.cache.set(ids(60), { members: new Map([[ids(12), staffMember]]) });
    const fake = { id: ids(13), guild, nickname: 'M0deradora', user: { username: 'x' }, roles: { cache: new Map() } };
    assert.equal(await sec.checkImpersonation(fake), ids(12));
    assert(lastStaff().title.includes('🎭'));

    auto.saveConfig(G, 'crossChannelSpam', { enabled: true, channels: 3, timeoutMinutes: 30 });
    let timedOut = 0;
    const member = { moderatable: true, timeout: async (ms) => (timedOut = ms), permissions: { has: () => false }, roles: { cache: new Map() } };
    const author = { id: ids(14), send: async () => true };
    const at = Date.now();
    for (let i = 1; i <= 3; i += 1) {
      await sec.onMessage({ guild, member, author, channel: channels.get(ids(i)), id: `m${i}`, content: 'ganhe nitro grátis aqui agora', createdTimestamp: at + i, mentions: { users: new Map(), roles: new Map() } }, client);
    }
    assert.deepEqual([1, 2, 3].map((i) => channels.get(ids(i)).deleted.length), [1, 1, 1], 'Apagou nos 3 canais');
    assert.equal(timedOut, 30 * 60000);

    auto.saveConfig(G, 'massMention', { enabled: true, maxMentions: 5, timeoutMinutes: 0 });
    let gone = false;
    const many = new Map(Array.from({ length: 6 }, (_, i) => [ids(200 + i), {}]));
    await sec.checkMentions({ guild, member, author, channel: channels.get(ids(1)), content: 'oi', mentions: { users: many, roles: new Map() }, delete: async () => (gone = true) });
    assert(gone, 'Menções em massa apagadas');

    auto.saveConfig(G, 'inviteFilter', { enabled: true });
    let inv = false;
    const invMsg = (content) => ({ guild, member, author, channel: channels.get(ids(2)), content, delete: async () => (inv = true) });
    assert.equal(await sec.checkInvites(invMsg('vem pro nosso discord.gg/nosso'), client), null, 'Convite deste servidor passa');
    assert.equal(await sec.checkInvites(invMsg('discord.gg/meuserver'), client), null, 'Link personalizado passa');
    assert.equal(await sec.checkInvites(invMsg('olha discord.gg/outro'), client), 'outro');
    assert(inv);

    auto.saveConfig(G, 'modCanary', { enabled: true, maxActions: 3, windowMinutes: 2, action: 'strip' });
    const removed = [];
    const modRole = { id: ids(70), position: 5, managed: false, permissions: { has: () => true } };
    guild.members.fetch = async () => ({ roles: { cache: new Map([[ids(70), modRole]]), remove: async (r) => removed.push(r) } });
    let res = null;
    for (let i = 0; i < 3; i += 1) res = await sec.onAuditLog({ action: AuditLogEvent.MemberBanAdd, executorId: ids(15) }, guild, client, at + i);
    assert.deepEqual(res, { count: 3, stripped: 1 });
    assert.deepEqual(removed, [ids(70)]);
    assert.equal(await sec.onAuditLog({ action: AuditLogEvent.MemberBanAdd, executorId: guild.ownerId }, guild, client), null, 'Dono do servidor não dispara');
    console.log('  ✅ 4. Segurança: quarentena, nome, imitação, spam, menções, convites e alarme.');

    // 5. Moderação.
    auto.saveConfig(G, 'modLog', { enabled: true, channelId: LOG });
    await mod.logDelete({ guild, channelId: ids(1), author: { id: ids(16) }, content: 'apagada @everyone' });
    const logged = channels.get(LOG).sent.at(-1);
    assert(logged.embeds[0].data.title.includes('🗑️'));
    assert.deepEqual(logged.allowedMentions.parse, [], 'Registro sem pings');
    await mod.logEdit({ content: 'a' }, { guild, channelId: ids(1), author: { id: ids(16) }, content: 'a', editedTimestamp: 1, url: 'u' });
    assert.equal(channels.get(LOG).sent.length, 1, 'Edição sem mudança de texto não registra');

    auto.saveConfig(G, 'autoSlowmode', { enabled: true, channelIds: [ids(3)], perMinute: 10, seconds: 5 });
    const busy = channels.get(ids(3));
    for (let i = 0; i < 10; i += 1) await mod.onFlow({ guild, channel: busy }, at + i);
    assert.equal(busy.rateLimitPerUser, 5, 'Modo lento ligado');
    await mod.relaxSlowmode(client, at + 6 * 60000);
    assert.equal(busy.rateLimitPerUser, 0, 'Volta ao normal quando acalma');

    auto.saveConfig(G, 'roleContrast', { enabled: true, minRatio: '3' });
    const sug = await mod.checkContrast({ id: ids(80), guild, color: 0x1f2a44 });
    assert(sug && lastStaff().title.includes('🎨'));
    assert.equal(await mod.checkContrast({ id: ids(81), guild, color: 0xffffff }), null, 'Cor clara passa');
    console.log('  ✅ 5. Moderação: registro, modo lento automático e contraste.');

    // 6. Utilidade.
    auto.saveConfig(G, 'starboard', { enabled: true, channelId: LOG, threshold: 2, emoji: '⭐' });
    const starred = { id: ids(90), guild, channelId: ids(1), url: 'https://discord.com/x', content: 'muito bom', author: { username: 'a', displayAvatarURL: () => null }, attachments: new Map() };
    assert.equal(await util.onReaction({ count: 1, emoji: { name: '⭐' }, message: starred }), null);
    assert.equal(await util.onReaction({ count: 2, emoji: { name: '⭐' }, message: starred }), 'posted');
    assert.equal(await util.onReaction({ count: 3, emoji: { name: '⭐' }, message: starred }), 'updated');

    auto.saveConfig(G, 'linkFixer', { enabled: true, sites: ['x'] });
    let reply = null;
    await util.linkFixer({ guild, content: 'https://twitter.com/a/status/1', suppressEmbeds: async () => true, reply: async (r) => (reply = r) });
    assert(reply.content.includes('fxtwitter.com/a/status/1'));

    auto.saveConfig(G, 'longPaste', { enabled: true, maxLines: 15 });
    let pasteGone = false;
    const lp = channels.get(ids(2));
    assert(await util.longPaste({ guild, channel: lp, author: { id: ids(17) }, content: 'x\n'.repeat(20), delete: async () => (pasteGone = true) }));
    assert(pasteGone && lp.sent.at(-1).files.length === 1, 'Virou arquivo');

    auto.saveConfig(G, 'stickyMessage', { enabled: true, channelId: ids(3), text: 'Leia as regras', every: 3 });
    const st = channels.get(ids(3));
    const before = st.sent.length;
    for (let i = 0; i < 3; i += 1) await util.sticky({ guild, channel: st });
    assert.equal(st.sent.length, before + 1, 'Reposta a cada 3');

    auto.saveConfig(G, 'autoPublish', { enabled: true, channelIds: [ids(1)] });
    let crossed = false;
    await util.autoPublish({ guild, channel: { id: ids(1), type: ChannelType.GuildAnnouncement }, crosspostable: true, crosspost: async () => (crossed = true) });
    assert(crossed);

    auto.saveConfig(G, 'discordStatus', { enabled: true, channelId: LOG });
    const json = (incidents) => async () => ({ ok: true, json: async () => ({ incidents }) });
    await util.statusTick(client, json([{ id: 'i1', name: 'API lenta', status: 'investigating' }]));
    assert(channels.get(LOG).sent.at(-1).embeds[0].data.title.includes('🛰️'));
    await util.statusTick(client, json([]));
    assert(channels.get(LOG).edited.at(-1)[1].embeds[0].data.title.includes('✅'), 'Resolvido edita o aviso');

    auto.saveConfig(G, 'voiceRole', { enabled: true, roleId: ids(55) });
    const vr = new Map();
    const vm = { user: {}, roles: { cache: vr, add: async (r) => vr.set(r, 1), remove: async (r) => vr.delete(r) } };
    assert.equal(await util.onVoice({ guild }, { guild, member: vm, channelId: ids(5) }), 'added');
    assert.equal(await util.onVoice({ guild, member: vm }, { guild, member: vm, channelId: null }), 'removed');
    console.log('  ✅ 6. Utilidade: mural, links, arquivo, fixa, anúncios, status e cargo de call.');

    console.log('🤖 Automações: tudo certo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha nos testes das automações:', err);
    process.exit(1);
  }
})();
