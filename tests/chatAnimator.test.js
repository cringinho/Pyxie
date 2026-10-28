const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🎉 Testes do Animador de chat (quando falar, o que postar, pausa e limites)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-anim-'));

const animator = require('../src/services/animator');
const auto = require('../src/services/automations');
const BANK = require('../src/data/animatorBank');
const mod = require('../src/modules/chat-animator');
const { TRANSLATIONS } = require('../src/utils/i18n');

const G = '1453890868980482090';
const CH = '444000000000000009';
const BOT = '999000000000000001';
// 15:00 em Brasília (18:00 UTC).
const NOW = Date.UTC(2026, 9, 28, 18, 0, 0);
const MIN = 60000;

(async () => {
  try {
    // 1. Regras de quando falar.
    const cfg = auto.normalize('animator', { enabled: true, channelIds: [CH] });
    const ch = { lastHumanAt: NOW - 100 * MIN, recent24h: 20, lastWasBot: false, failures: 0, pausedUntil: 0, postsToday: 0, postsDay: '' };
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch }), 'post');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch, blocked: true }), 'off', 'Desabafo/raid/blindagem bloqueiam');
    assert.equal(animator.shouldPost({ now: NOW, cfg: { ...cfg, enabled: false }, ch }), 'off');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch: { ...ch, pausedUntil: NOW + MIN } }), 'paused');
    assert.equal(animator.shouldPost({ now: NOW, cfg: { ...cfg, hourStart: 20, hourEnd: 23 }, ch }), 'hours');
    assert.equal(animator.shouldPost({ now: NOW, cfg: { ...cfg, hourStart: 22, hourEnd: 16 }, ch }), 'post', 'Janela que vira a noite');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch: { ...ch, recent24h: 2 } }), 'dead', 'Canal morto não é animado');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch: { ...ch, lastWasBot: true } }), 'bot_last');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch: { ...ch, lastHumanAt: NOW - 10 * MIN } }), 'not_quiet', 'Nunca interrompe conversa');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch: { ...ch, failures: 3 } }), 'not_quiet', 'Sem resposta 3x: espera o dobro');
    assert.equal(animator.waitFactor(30), 8, 'Espera no máximo 8x');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch: { ...ch, postsToday: 2, postsDay: animator.brtDay(NOW) } }), 'limit');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch: { ...ch, postsToday: 2, postsDay: '2020-01-01' } }), 'post', 'Limite zera no dia seguinte');
    assert.equal(animator.shouldPost({ now: NOW, cfg, ch, guildLastPostAt: NOW - 5 * MIN }), 'guild_gap');
    console.log('  ✅ 1. Só fala no silêncio, no horário, com limite e espera crescente.');

    // 2. Conteúdo: todos os tipos nos dois idiomas; palavra embaralhada diferente da original.
    for (const lang of ['pt', 'en']) {
      for (const type of ['question', 'thisOrThat', 'poll', 'creative', 'fact', 'scramble']) {
        const c = animator.pickContent({ types: [type], lang }, () => 0.3);
        assert(c && c.type === type, `${lang}/${type}`);
        if (type === 'scramble') assert.notEqual(animator.shuffleWord(c.answer).toLowerCase(), c.answer.toLowerCase(), 'Embaralhada');
        if (type === 'poll') assert(c.answers.length >= 2 && c.answers.length <= 10);
      }
    }
    assert.equal(animator.pickContent({ types: ['house'], lang: 'pt', houseLines: [] }, Math.random), null, 'Sem perguntas da casa, nada');
    assert.equal(animator.pickContent({ types: ['house'], lang: 'pt', houseLines: ['Oi?'] }, Math.random).text, 'Oi?');
    assert(BANK.question.length >= 20 && BANK.scramble.pt.length >= 20 && BANK.scramble.en.length >= 20, 'Banco com volume');
    assert(TRANSLATIONS.pt.animator && TRANSLATIONS.en.animator, 'Textos PT/EN');
    console.log('  ✅ 2. Conteúdo PT/EN em todos os tipos.');

    // 3. Módulo: conta conversa, posta no silêncio sem marcar ninguém, pausa pelo botão da staff.
    auto.saveConfig(G, 'animator', { enabled: true, channelIds: [CH], types: ['question'] });
    const sent = [];
    const channel = {
      id: CH,
      isTextBased: () => true,
      permissionsFor: () => ({ has: () => true }),
      send: async (payload) => {
        sent.push(payload);
        return { id: `m${sent.length}` };
      },
      messages: { delete: async () => true },
    };
    const guild = { id: G, channels: { cache: new Map([[CH, channel]]) }, members: { me: {} } };
    const client = { user: { id: BOT }, guilds: { cache: new Map([[G, guild]]) } };
    for (let i = 0; i < 6; i += 1) {
      mod.onMessage({ guild, channel, author: { id: `u${i}`, bot: false }, content: 'oi', createdTimestamp: NOW - 120 * MIN + i * MIN }, client);
    }
    await mod.tick(client, NOW, () => 0.1);
    assert.equal(sent.length, 1, 'Postou uma vez no silêncio');
    assert.deepEqual(sent[0].allowedMentions.parse, [], 'Sem pings');
    assert(sent[0].content.includes('###'), 'Formato do Discord');
    await mod.tick(client, NOW + 5 * MIN, () => 0.1);
    assert.equal(sent.length, 1, 'Não fala de novo logo depois da própria mensagem');

    let replied = null;
    const staffClick = {
      customId: `anim:pause:${G}:${CH}`,
      guild,
      channel,
      locale: 'pt-BR',
      member: { permissionsIn: () => ({ has: () => false }) },
      reply: async (r) => {
        replied = r;
      },
    };
    await mod.handleInteraction(staffClick);
    assert.equal(replied.flags, 64, 'Quem não é staff recebe aviso privado');
    staffClick.member = { permissionsIn: () => ({ has: () => true }) };
    await mod.handleInteraction(staffClick);
    assert(mod._channels.get(CH).pausedUntil > Date.now(), 'Staff pausa por 24 h');
    const saved = JSON.parse(fs.readFileSync(path.join(process.env.PYXIE_DATA_DIR, 'guilds', G, 'animator.json'), 'utf8'));
    assert(saved.channels[CH].pausedUntil > 0, 'Pausa sobrevive a reinício');
    console.log('  ✅ 3. Módulo posta no silêncio, sem pings, e a staff pausa.');

    console.log('🎉 Animador de chat: tudo certo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha nos testes do Animador:', err);
    process.exit(1);
  }
})();
