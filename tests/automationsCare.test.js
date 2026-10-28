const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('💜 Testes das automações do lote 3 (bem-estar, moderação leve e ferramentas)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-care-'));

const { ChannelType } = require('discord.js');
const r3 = require('../src/services/autoRules3');
const auto = require('../src/services/automations');
const safety = require('../src/services/guildSafety');
const care = require('../src/modules/auto-wellbeing');
const guard = require('../src/modules/auto-guard');
const tools = require('../src/modules/auto-tools');
const { TRANSLATIONS } = require('../src/utils/i18n');

const G = '1453890868980482090';
const ids = (n) => String(600000000000000000n + BigInt(n));
const STAFF = ids(1);
const H = 3600000;
// Segunda-feira, 10:00 em Brasília (13:00 UTC).
const MON10 = Date.UTC(2026, 10, 2, 13, 0, 0);

function fakeChannel(id, extra = {}) {
  const ch = {
    id,
    sent: [],
    rateLimitPerUser: 0,
    isTextBased: () => true,
    isThread: () => false,
    send: async (p) => {
      ch.sent.push(p);
      return { id: `s${ch.sent.length}`, delete: async () => true };
    },
    setRateLimitPerUser: async (s) => {
      ch.rateLimitPerUser = s;
    },
    messages: { delete: async () => true },
    ...extra,
  };
  return ch;
}
const channels = new Map([STAFF, ids(2), ids(3), ids(4)].map((id) => [id, fakeChannel(id)]));
const guild = { id: G, name: 'Teste', memberCount: 100, channels: { cache: channels }, roles: { cache: new Map() }, members: { me: {} } };
const client = { user: { id: ids(99) }, guilds: { cache: new Map([[G, guild]]) }, channels: { cache: channels } };
const msg = (extra) => ({
  guild,
  id: `m${Math.random()}`,
  channel: channels.get(ids(2)),
  author: { id: ids(10), send: async () => ({}) },
  member: { roles: { cache: new Map() }, permissions: { has: () => false }, joinedTimestamp: Date.now() - H },
  content: '',
  attachments: new Map(),
  reply: async (p) => p,
  delete: async () => true,
  ...extra,
});

(async () => {
  try {
    // 1. Regras puras.
    assert(r3.isCrisis('eu não aguento mais viver'));
    assert(r3.isCrisis('I want to die'));
    assert(!r3.isCrisis('morri de rir com esse meme'), 'Expressão comum não dispara');
    assert(r3.capsRatio('ISSO É UM GRITO ENORME').ratio > 0.9);
    const pairs = r3.parseFaq(['cargos|cargo => Os cargos ficam em #cargos', 'sem seta']);
    assert.equal(pairs.length, 1);
    assert.equal(r3.matchFaq(pairs, 'Onde pego CARGO?').answer, 'Os cargos ficam em #cargos');
    assert.equal(r3.matchFaq(pairs, 'descargo'), null, 'Palavra inteira');
    assert(r3.isMilestone(500) && r3.isMilestone(3000) && !r3.isMilestone(501));
    assert.equal(r3.brtParts(MON10).weekday, 1);
    assert.equal(r3.brtParts(MON10).hour, 10);
    assert(r3.isBumpDone({ author: { id: r3.DISBOARD_ID }, embeds: [{ description: 'Bump done! :thumbsup:' }] }));
    assert(Array.isArray(TRANSLATIONS.pt.autos3.welcome.lines) && TRANSLATIONS.en.autos3.names.crisisCare, 'Textos PT/EN');
    console.log('  ✅ 1. Regras puras (crise, caps, respostas, marcos, horário, bump).');

    // 2. Bem-estar.
    safety.saveConfig(G, { staffLogChannelId: STAFF });
    auto.saveConfig(G, 'crisisCare', { enabled: true });
    let dm = null;
    const sad = msg({ content: 'acho que vou me matar', author: { id: ids(11), send: async (p) => (dm = p) }, url: 'https://discord.com/x' });
    assert.equal(await care.crisisCare(sad), 'dm');
    assert(dm.embeds[0].data.description.includes('188'), 'DM com o CVV');
    assert(channels.get(STAFF).sent.at(-1).embeds[0].data.title.includes('💜'), 'Staff avisada em particular');
    assert.equal(await care.crisisCare(sad), null, 'Não repete em 6 h');

    auto.saveConfig(G, 'breakReminder', { enabled: true, roleId: ids(50), minutes: 60, messages: 20 });
    const focused = msg({ author: { id: ids(12), send: async () => ({}) }, member: { roles: { cache: new Map([[ids(50), {}]]) } } });
    let out = null;
    for (let i = 0; i <= 70; i += 1) out = (await care.breakReminder(focused, MON10 + i * 60000)) || out;
    assert.equal(out, 'reminded', 'Lembrete depois de 1 h seguida');
    assert.equal(await care.breakReminder(msg({ author: { id: ids(13) } }), MON10), null, 'Sem o cargo, nada');

    auto.saveConfig(G, 'quietHours', { enabled: true, channelIds: [ids(3)], hourStart: 1, hourEnd: 6, mode: 'slow' });
    const night = Date.UTC(2026, 10, 2, 5, 0, 0); // 02:00 em Brasília
    await care.quietTick(client, night);
    assert.equal(channels.get(ids(3)).rateLimitPerUser, 30, 'Modo lento de madrugada');
    await care.quietTick(client, night + 5 * H); // 07:00
    assert.equal(channels.get(ids(3)).rateLimitPerUser, 0, 'Volta de manhã');

    auto.saveConfig(G, 'welcomeBuddy', { enabled: true, channelIds: [ids(2)] });
    const first = await care.welcomeBuddy(msg({ author: { id: ids(14) } }));
    assert(first.content.includes(ids(14)));
    assert.equal(await care.welcomeBuddy(msg({ author: { id: ids(14) } })), null, 'Só a primeira');

    auto.saveConfig(G, 'noOneUnanswered', { enabled: true, channelIds: [ids(4)], minutes: 10, helperRoleId: ids(51) });
    const help = channels.get(ids(4));
    care.trackAnswer(msg({ channel: help, author: { id: ids(15) }, id: 'q1' }), MON10);
    await care.unansweredTick(client, MON10 + 11 * 60000);
    assert.deepEqual(help.sent.at(-1).allowedMentions.roles, [ids(51)], 'Só o cargo de ajudantes é marcado');
    care.trackAnswer(msg({ channel: help, author: { id: ids(15) }, id: 'q2' }), MON10);
    care.trackAnswer(msg({ channel: help, author: { id: ids(16) } }), MON10 + 60000);
    const before = help.sent.length;
    await care.unansweredTick(client, MON10 + 30 * 60000);
    assert.equal(help.sent.length, before, 'Respondida, não avisa');

    auto.saveConfig(G, 'memberMilestones', { enabled: true, channelId: ids(2) });
    assert(await care.milestone({ guild }), 'Marco de 100');
    assert.equal(await care.milestone({ guild }), null, 'Uma vez por marco');
    console.log('  ✅ 2. Bem-estar: crise, pausa, descanso, acolhida, sem resposta e marcos.');

    // 3. Moderação leve.
    auto.saveConfig(G, 'ghostPing', { enabled: true, seconds: 60 });
    await guard.ghostPing({ guild, channel: channels.get(ids(2)), author: { id: ids(20) }, createdTimestamp: Date.now() - 5000, mentions: { users: new Map([[ids(21), { id: ids(21) }]]), roles: new Map() } });
    const g = channels.get(ids(2)).sent.at(-1);
    assert(g.content.includes('👻') && g.allowedMentions.parse.length === 0);

    auto.saveConfig(G, 'capsCalm', { enabled: true, minLength: 10, percent: 75, action: 'warn' });
    assert.equal(await guard.capsCalm(msg({ content: 'POR QUE NINGUEM RESPONDE ISSO' }), MON10), 'warn');
    assert.equal(await guard.capsCalm(msg({ content: 'POR QUE NINGUEM RESPONDE ISSO' }), MON10 + 1000), 'quiet', 'Um lembrete a cada 10 min');

    auto.saveConfig(G, 'mediaOnly', { enabled: true, channelIds: [ids(3)], allowLinks: false });
    assert.equal(await guard.mediaOnly(msg({ channel: channels.get(ids(3)), content: 'oi' })), true);
    assert.equal(await guard.mediaOnly(msg({ channel: channels.get(ids(3)), attachments: new Map([['a', {}]]) })), false, 'Com imagem fica');

    auto.saveConfig(G, 'selfPromoLimit', { enabled: true, channelIds: [ids(2)], hours: 24 });
    const promo = () => msg({ author: { id: ids(22) }, content: 'meu canal https://youtube.com/x' });
    assert.equal(await guard.selfPromo(promo(), MON10), false);
    assert.equal(await guard.selfPromo(promo(), MON10 + H), true, 'Segunda divulgação no mesmo dia sai');

    auto.saveConfig(G, 'spoilerGuard', { enabled: true, channelIds: [ids(4)] });
    const img = { url: 'https://cdn/x.png', name: 'x.png', contentType: 'image/png', size: 10, spoiler: false };
    const ok = await guard.spoilerGuard(msg({ channel: channels.get(ids(4)), attachments: new Map([['a', img]]) }), async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) }));
    assert(ok && channels.get(ids(4)).sent.at(-1).files[0].name.startsWith('SPOILER_'));

    auto.saveConfig(G, 'inviteTracker', { enabled: true, channelId: STAFF });
    let invites = [{ code: 'abc', uses: 1, inviterId: ids(30) }];
    guild.invites = { fetch: async () => new Map(invites.map((i) => [i.code, i])) };
    await guard.snapshotInvites(guild);
    invites = [{ code: 'abc', uses: 2, inviterId: ids(30) }];
    const used = await guard.inviteTracker({ id: ids(31), guild });
    assert.equal(used.code, 'abc');
    console.log('  ✅ 3. Moderação leve: fantasma, caps, mídia, divulgação, spoiler e convites.');

    // 4. Ferramentas.
    auto.saveConfig(G, 'faqReplies', { enabled: true, pairs: ['regras => Leia #regras'] });
    const ans = await tools.faq(msg({ content: 'cadê as regras?' }), MON10);
    assert.equal(ans.content, 'Leia #regras');
    assert.equal(await tools.faq(msg({ content: 'regras?' }), MON10 + 1000), null, 'Pausa de 2 min');

    auto.saveConfig(G, 'scheduledMessages', { enabled: true, channelId: ids(2), weekdays: ['1'], hour: 10, text: 'Roda de conversa hoje!' });
    const sch = channels.get(ids(2));
    const n0 = sch.sent.length;
    await tools.scheduledTick(client, MON10);
    await tools.scheduledTick(client, MON10 + 5 * 60000);
    assert.equal(sch.sent.length, n0 + 1, 'Uma vez por dia');

    auto.saveConfig(G, 'weeklyDigest', { enabled: true, channelId: STAFF, weekday: '1' });
    await tools.digestTick(client, MON10);
    assert(channels.get(STAFF).sent.at(-1).embeds[0].data.title.includes('📊'));
    const nd = channels.get(STAFF).sent.length;
    await tools.digestTick(client, MON10 + H);
    assert.equal(channels.get(STAFF).sent.length, nd, 'Uma vez por semana');

    auto.saveConfig(G, 'tempVoice', { enabled: true, hubChannelId: ids(40) });
    let movedTo = null;
    const room = { id: ids(41), members: new Map(), delete: async () => (room.deleted = true) };
    guild.channels.create = async () => room;
    const member = { id: ids(42), user: {}, displayName: 'Ana', voice: { setChannel: async (c) => (movedTo = c.id) } };
    assert.equal(await tools.tempVoice({ guild }, { guild, member, channelId: ids(40) }), room);
    assert.equal(movedTo, ids(41));
    channels.set(ids(41), room);
    await tools.tempVoice({ guild, channelId: ids(41) }, { guild, member, channelId: null });
    assert(room.deleted, 'Sala vazia some');

    auto.saveConfig(G, 'bumpReminder', { enabled: true });
    assert(tools.noteBump({ guild, channel: { id: ids(2) }, author: { id: r3.DISBOARD_ID }, embeds: [{ description: 'Bump done!' }] }, MON10));
    await tools.bumpTick(client, MON10 + H);
    const nb = sch.sent.length;
    await tools.bumpTick(client, MON10 + 2 * H + 1000);
    assert.equal(sch.sent.length, nb + 1, 'Lembra depois de 2 h');

    auto.saveConfig(G, 'pinArchive', { enabled: true, archiveChannelId: STAFF, keep: 45 });
    const pins = new Map(Array.from({ length: 46 }, (_, i) => [`p${i}`, { id: `p${i}`, createdTimestamp: i, content: `fixada ${i}`, author: { id: ids(5) }, url: 'u', attachments: new Map(), unpin: async () => true }]));
    const moved = await tools.pinArchive({ id: ids(2), guild, messages: { fetchPinned: async () => pins } });
    assert.equal(moved, 2, 'Move as mais antigas até sobrar espaço');
    console.log('  ✅ 4. Ferramentas: respostas, agendado, resumo, sala temporária, bump e fixadas.');

    console.log('💜 Lote 3: tudo certo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha nos testes do lote 3:', err);
    process.exit(1);
  }
})();
