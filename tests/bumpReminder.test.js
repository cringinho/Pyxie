const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('⏰ Testes do lembrete de bump 2.0 (cartão, contadores, silêncio e agenda)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-bump-'));

const bump = require('../src/services/bumpReminder');
const auto = require('../src/services/automations');
const autoState = require('../src/services/autoState');
const tools = require('../src/modules/auto-tools');
const stats = require('../src/services/automationStats');
const { getGuildAgenda } = require('../src/services/guildAgenda');

const G = '1453890868980482090'; // Cringelândia: PT
const EN = '111111111111111111'; // servidor comum: EN
const ids = (n) => String(700000000000000000n + BigInt(n));
const CH = ids(2);
const ROLE_A = ids(3);
const ROLE_B = ids(4);
const USER = ids(10);
const H = 3600000;
const MIN = 60000;
// Segunda-feira, 2 de novembro de 2026, 10:00 em Brasília (13:00 UTC).
const MON10 = Date.UTC(2026, 10, 2, 13, 0, 0);

const DISBOARD_ID = '302050872383242240';
const disboard = (extra = {}) => ({
  id: ids(50),
  guild: { id: G },
  channel: { id: CH },
  author: { id: DISBOARD_ID, username: 'DISBOARD', bot: true },
  member: { displayName: 'DISBOARD' },
  interaction: { user: { id: USER, username: 'ana', globalName: 'Ana' } },
  embeds: [{ description: 'Bump done! :thumbsup:' }],
  content: '',
  createdTimestamp: MON10,
  ...extra,
});

function fakeChannel(id) {
  const ch = {
    id,
    sent: [],
    deleted: false,
    messages: {
      fetch: async (messageId) => ({ id: messageId, delete: async () => (ch.deleted = true) }),
    },
    send: async (payload) => {
      ch.sent.push(payload);
      return { id: ids(90 + ch.sent.length), delete: async () => (ch.deleted = true) };
    },
  };
  return ch;
}

(async () => {
  try {
    // 1. Estado: formato antigo continua válido e o novo é limitado.
    const legacy = bump.normalizeState({ channelId: CH, at: MON10, reminded: false });
    assert.equal(legacy.reminder.channelId, CH);
    assert.equal(legacy.reminder.at, MON10);
    assert.equal(legacy.counters.total, 0);
    const junk = bump.normalizeState({ reminder: { at: 'x', channelId: 12 }, counters: { total: -3, byUser: { uau: { n: 5 } }, byHour: [1, 2], byWeekday: 'x' } });
    assert.equal(junk.reminder.at, 0);
    assert.equal(junk.reminder.channelId, '12');
    assert.equal(junk.counters.total, 0);
    assert.deepEqual(junk.counters.byUser, {}, 'ID inválido fora do ranking');
    assert.equal(junk.counters.byHour.length, 24);
    assert.equal(junk.counters.byWeekday.length, 7);
    console.log('  ✅ 1. Estado v2, leitura do formato antigo e limites.');


    // 2. Esquema: tetos, enums, migração do cargo único e padrões.
    const cfg = auto.saveConfig(G, 'bumpReminder', {
      enabled: true,
      cooldownMinutes: 999,
      channelMode: 'fixed',
      channelId: CH,
      quietEnabled: true,
      quietStart: 23,
      quietEnd: 8,
      pingMode: 'both',
      roleIds: [ROLE_A, ROLE_B, 'lixo', ROLE_A],
      deleteAfterMinutes: 5000,
      milestoneEvery: 200,
      cardTitle: 'x'.repeat(200),
    });
    assert.equal(cfg.cooldownMinutes, 240, 'Teto de 4 h');
    assert.equal(cfg.deleteAfterMinutes, 1440, 'Teto de 24 h');
    assert.equal(cfg.milestoneEvery, 100, 'Teto do marco');
    assert.equal(cfg.cardTitle.length, 90, 'Título curto');
    assert.deepEqual(cfg.roleIds, [ROLE_A, ROLE_B], 'Sem duplicata e sem lixo');
    assert.equal(cfg.useEmbed, true, 'Cartão é o padrão');
    assert.equal(cfg.countStats, true);
    assert.equal(cfg.cleanPrevious, true);
    assert.equal(cfg.showButton, true);
    assert.equal(auto.normalize('bumpReminder', { roleId: ROLE_A }).roleIds[0], ROLE_A, 'Cargo antigo migra para a lista');
    assert.deepEqual(
      auto.idsToCheck('bumpReminder', { channelMode: 'same', channelId: '999999999999999999', pingMode: 'none', roleIds: ['999999999999999999'] }),
      { channels: [], roles: [] },
      'Campo escondido no painel não é conferido',
    );
    assert.deepEqual(auto.idsToCheck('bumpReminder', { channelMode: 'fixed', channelId: CH, pingMode: 'roles', roleIds: [ROLE_A] }), { channels: [CH], roles: [ROLE_A] });
    console.log('  ✅ 2. Esquema das 20 opções, tetos e migração.');

    // 3. Contagem: dedupe, sequência de dias, ranking e horários.
    let r = bump.recordBump({}, disboard(), MON10);
    assert.equal(r.duplicate, false);
    assert.equal(r.total, 1);
    assert.equal(r.streak, 1);
    assert.equal(r.state.reminder.channelId, CH);
    assert.equal(r.state.reminder.reminded, false);
    const repeat = bump.recordBump(r.state, disboard(), MON10 + 1000);
    assert.equal(repeat.duplicate, true, 'Mesmo evento não conta duas vezes');
    assert.equal(repeat.total, 1);
    r = bump.recordBump(r.state, disboard({ id: ids(51) }), MON10 + 24 * H);
    assert.equal(r.streak, 2, 'Dois dias seguidos');
    r = bump.recordBump(r.state, disboard({ id: ids(52) }), MON10 + 72 * H);
    assert.equal(r.streak, 1, 'Pulou um dia, recomeça');
    assert.equal(r.state.counters.bestStreak, 2);
    assert.equal(r.state.counters.total, 3);
    assert.equal(r.state.counters.byUser[USER].n, 3);
    assert.equal(r.state.counters.byUser[USER].name, 'Ana');
    assert.equal(r.state.counters.byHour.reduce((a, b) => a + b, 0), 3);
    assert.equal(r.state.counters.byWeekday.reduce((a, b) => a + b, 0), 3);
    console.log('  ✅ 3. Dedupe, bumps totais, sequência e ranking.');

    // 4. Relógio: espera, repetição, silêncio de madrugada e ciclo encerrado.
    const waiting = bump.recordBump({}, disboard({ id: ids(60) }), MON10).state;
    const plain = { ...cfg, quietEnabled: false, nagMinutes: 0, cooldownMinutes: 120, channelMode: 'same' };
    assert.equal(bump.nextReminderAt(plain, waiting, MON10), MON10 + 2 * H, 'Avisa depois de 2 h');
    assert.equal(bump.nextReminderAt(plain, {}, MON10), null, 'Sem bump não há aviso');
    const sent = bump.recordReminder(waiting, { messageId: ids(70), channelId: CH }, MON10 + 2 * H);
    assert.equal(sent.reminder.reminded, true);
    assert.equal(sent.counters.reminders, 1);
    assert.equal(bump.nextReminderAt(plain, sent, MON10 + 2 * H), null, 'Sem nag, um aviso por bump');
    assert.equal(bump.nextReminderAt({ ...plain, nagMinutes: 30 }, sent, MON10 + 2 * H), MON10 + 2 * H + 30 * MIN);

    const night = Date.UTC(2026, 10, 3, 0, 30); // 21:30 em Brasília
    const atNight = bump.recordBump({}, disboard({ id: ids(61) }), night).state;
    const quiet = { ...plain, quietEnabled: true, quietStart: 23, quietEnd: 8 };
    assert.equal(bump.isQuiet(quiet, night + 2 * H), true, '23:30 está no silêncio');
    assert.equal(bump.isQuiet(quiet, Date.UTC(2026, 10, 3, 14, 0)), false, '11:00 está fora');
    const resume = bump.nextReminderAt(quiet, atNight, night);
    assert.equal(resume, Date.UTC(2026, 10, 3, 11, 0), 'Retoma às 08:00 de Brasília');
    console.log('  ✅ 4. Espera, repetição e horário de silêncio.');

    // 5. Cartões PT/EN, menções, botão e agradecimento.
    const guild = { id: G, name: 'Cringelândia' };
    const state = bump.recordBump({}, disboard({ id: ids(62) }), MON10).state;
    const payload = bump.buildReminder(guild, { ...cfg, cardTitle: '', quietEnabled: false, roleIds: [ROLE_A, ROLE_B], pingMode: 'both' }, state, 'pt', MON10);
    assert.equal(payload.embeds[0].data.title, '⏰ Bump liberado em Cringelândia');
    assert.ok(payload.embeds[0].data.description.includes('\n\n'), 'Respiro entre blocos (AGENTS §9)');
    assert.ok(!/-{3,}|_{3,}|═/.test(payload.embeds[0].data.description), 'Sem divisores ASCII');
    assert.equal(payload.embeds[0].data.footer.text, 'Cringelândia • `1` bumps no total');
    assert.equal(payload.content, `<@&${ROLE_A}> <@&${ROLE_B}> <@${USER}>`);
    assert.deepEqual(payload.allowedMentions, { parse: [], users: [USER], roles: [ROLE_A, ROLE_B], repliedUser: false });
    assert.equal(payload.components[0].toJSON().components[0].url, `https://disboard.org/server/${G}`);
    const en = bump.buildReminder({ id: EN, name: 'Server' }, { ...cfg, cardTitle: '', roleIds: [], pingMode: 'none' }, state, 'en', MON10);
    assert.equal(en.embeds[0].data.title, '⏰ Bump ready on Server');
    assert.equal(en.content, undefined, 'Sem menção quando ninguém é marcado');
    const textMode = bump.buildReminder(guild, { ...cfg, useEmbed: false, roleIds: [ROLE_A], pingMode: 'roles', showButton: false }, state, 'pt');
    assert.equal(textMode.content, `⏰ <@&${ROLE_A}>, já dá para dar \`/bump\` de novo!`);
    assert.equal(textMode.components.length, 0);
    const custom = bump.buildReminder(guild, { ...cfg, cardTitle: 'Bump de {server}', customMessage: '{user}, são {count} bumps 💜' }, state, 'pt');
    assert.equal(custom.embeds[0].data.title, 'Bump de Cringelândia');
    assert.ok(custom.embeds[0].data.description.includes('são 1 bumps'));

    assert.equal(bump.buildThanks(guild, { ...cfg, thanksEnabled: false }, state, 'pt', { id: USER }), null);
    const thanks = bump.buildThanks(guild, { ...cfg, thanksEnabled: true }, state, 'pt', { id: USER, name: 'Ana' });
    assert.ok(thanks.content.includes(`<@${USER}>`));
    assert.deepEqual(thanks.allowedMentions.users, [USER]);
    const dm = bump.buildDM(guild, { ...cfg, dmBumper: true }, state, 'pt');
    assert.ok(dm.content.includes('Cringelândia'));
    assert.equal(bump.buildDM(guild, { ...cfg, dmBumper: false }, state, 'pt'), null);
    assert.equal(bump.milestoneFor({ milestoneEvery: 5 }, 10), 10);
    assert.equal(bump.milestoneFor({ milestoneEvery: 5 }, 11), 0);
    assert.equal(bump.milestoneFor({ milestoneEvery: 0 }, 10), 0);
    assert.ok(bump.buildMilestone(guild, state, 10, 'pt').content.includes('`10`'));
    console.log('  ✅ 5. Cartão PT/EN, cargos, botão, texto puro, DM e marcos.');


    // 6. Módulo: agradece, avisa depois de 2 h, manda DM, agenda exclusão e respeita canal fixo.
    autoState.write(G, 'bump.json', {});
    const ch = fakeChannel(CH);
    const other = fakeChannel(ids(5));
    let dmPayload = null;
    const guildReal = {
      id: G,
      name: 'Cringelândia',
      channels: { cache: new Map([[CH, ch], [ids(5), other]]) },
      members: { fetch: async () => ({ send: async (p) => ((dmPayload = p), {}) }) },
    };
    const client = { guilds: { cache: new Map([[G, guildReal]]) } };
    auto.saveConfig(G, 'bumpReminder', {
      enabled: true,
      cooldownMinutes: 120,
      channelMode: 'same',
      quietEnabled: false,
      roleIds: [ROLE_A],
      pingMode: 'roles',
      useEmbed: true,
      thanksEnabled: true,
      dmBumper: true,
      deleteAfterMinutes: 60,
      milestoneEvery: 1,
      countStats: true,
    });
    const noteNow = MON10 + 24 * H;
    assert.equal(tools.noteBump({ ...disboard({ id: ids(80) }), guild: guildReal, channel: ch }, noteNow), true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const afterBump = autoState.read(G, 'bump.json');
    assert.equal(afterBump.counters.total, 1);
    assert.equal(afterBump.lastBump.userId, USER, 'Bumper vem da interação, não do bot do Disboard');
    assert.equal(afterBump.lastBump.userName, 'Ana');
    assert.ok(ch.sent.length >= 2, 'Agradecimento e marco saem na hora');
    assert.ok(ch.sent[0].content.includes(`<@${USER}>`));
    assert.equal(tools.noteBump({ guild: guildReal, channel: ch, author: { id: ids(98) }, embeds: [] }, noteNow), false, 'Mensagem comum não é bump');

    await tools.bumpTick(client, noteNow + H);
    assert.equal(ch.sent.filter((p) => p.embeds).length, 0, 'Antes das 2 h, nada de cartão');
    await tools.bumpTick(client, noteNow + 2 * H + 1000);
    const card = ch.sent.filter((p) => p.embeds).at(-1);
    assert.ok(card, 'Cartão sai depois de 2 h');
    assert.equal(card.content, `<@&${ROLE_A}>`);
    assert.ok(dmPayload?.content.includes('Cringelândia'), 'DM para quem bumpou');
    const afterCard = autoState.read(G, 'bump.json');
    assert.equal(afterCard.reminder.reminded, true);
    assert.ok(afterCard.reminder.deleteAt > 0, 'deleteAfterMinutes agendado');

    // Canal fixo e agenda lendo o mesmo cálculo do aviso.
    auto.saveConfig(G, 'bumpReminder', { channelMode: 'fixed', channelId: ids(5) });
    assert.equal(tools.noteBump({ ...disboard({ id: ids(81) }), guild: guildReal, channel: ch }, noteNow + 3 * H), true);
    const agenda = getGuildAgenda(G, noteNow + 4 * H);
    const item = agenda.find((i) => i.id === 'bumpReminder');
    assert.ok(item, 'Agenda lista o lembrete de bump');
    assert.equal(item.channelId, ids(5), 'Agenda usa o canal fixo');
    assert.ok(item.nextAt > noteNow);
    assert.equal(item.every.afterBump, 2);
    await tools.bumpTick(client, noteNow + 5 * H + 1000);
    assert.ok(other.sent.some((p) => p.embeds), 'Aviso sai no canal fixo');

    // Ranking desligado limpa a lista, mas mantém quem bumpou (para marcar e mandar DM).
    const stripped = bump.stripRanking(bump.recordBump({}, disboard({ id: ids(82) }), noteNow).state);
    assert.deepEqual(stripped.counters.byUser, {});
    assert.equal(stripped.lastBump.userId, USER);
    const ins = bump.insights(stripped, { cooldownMinutes: 120, quietEnabled: false, nagMinutes: 0 }, noteNow);
    assert.equal(ins.total, 1);
    assert.ok(ins.nextAt > noteNow);
    assert.equal(bump.clearCounters().counters.total, 0);
    assert.equal(bump.USER_CAP, 200);

    stats.flush();
    const cardStats = stats.read(G).bumpReminder;
    assert.ok(cardStats.bumps >= 1 && cardStats.reminders >= 1, 'Contadores por automação');
    console.log('  ✅ 6. Módulo, agradecimento, DM, exclusão, canal fixo e agenda.');
    console.log('⏰ Lembrete de bump: tudo certo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha nos testes do lembrete de bump:', err);
    process.exit(1);
  }
})();

