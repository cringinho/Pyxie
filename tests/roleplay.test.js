const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-rp-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const store = require('../src/modules/roleplay/characterStore');
const safety = require('../src/modules/roleplay/safety');
const narrator = require('../src/modules/roleplay/narrator');
const pyCharacter = require('../src/modules/roleplay/commands/pyCharacter');
const groq = require('../src/services/groqClient');
const realm = require('../src/modules/realm');
const { GUILD_ID, CATEGORIES } = require('../src/modules/realm/realmBlueprint');
const { t } = require('../src/utils/i18n');

const TALES = CATEGORIES.flatMap((c) => c.channels).find((c) => c.key === 'tales').name;
const A = 'rp_user_a';
const B = 'rp_user_b';

function fakeThread(id = 'thread_1') {
  const sent = [];
  const npc = [];
  const hook = { owner: { id: 'bot' }, name: 'Pyxie NPCs', send: async (p) => npc.push(p) };
  return {
    sent,
    npc,
    id,
    name: 'The Velvet Door',
    guildId: GUILD_ID,
    guild: { id: GUILD_ID },
    isThread: () => true,
    client: { user: { id: 'bot' } },
    parent: { id: 'forum', name: TALES, fetchWebhooks: async () => [hook], createWebhook: async () => hook },
    send: async (p) => {
      sent.push(p);
      return { delete: async () => null };
    },
    sendTyping: async () => null,
  };
}

function groqReply(obj) {
  groq.resolveModel = async () => 'openai/gpt-oss-120b';
  groq.chatCompletionNow = async () => ({ ok: true, data: { choices: [{ message: { content: JSON.stringify(obj) } }] } });
}

console.log('🧪 [TEST] Roleplay: fichas, narradora, rolagens e segurança...');

(async () => {
  try {
    // 1. Ficha: soma 10, cada atributo 1-5, bônus da origem, sem ficha dupla
    assert.equal(store.createCharacter(A, { name: 'Lyra', ancestry: 'fairy', stats: { str: 5, mag: 5, agi: 5, spi: 5 } }).reason, 'stat_total');
    assert.equal(store.createCharacter(A, { name: 'Lyra', ancestry: 'fairy', stats: { str: 0, mag: 5, agi: 3, spi: 2 } }).reason, 'stat_range');
    assert.equal(store.createCharacter(A, { name: 'L', ancestry: 'fairy', stats: { str: 2, mag: 4, agi: 2, spi: 2 } }).reason, 'name');
    const lyra = store.createCharacter(A, { name: 'Lyra', ancestry: 'fairy', bio: 'Collects lost buttons.', stats: { str: 2, mag: 4, agi: 2, spi: 2 } });
    assert.equal(lyra.ok, true);
    assert.equal(lyra.character.stats.mag, 5, 'fada ganha +1 de Magia');
    assert.equal(lyra.character.hp, store.maxHp(lyra.character.stats));
    assert.equal(store.createCharacter(A, { name: 'Lyra', ancestry: 'fairy', stats: { str: 2, mag: 4, agi: 2, spi: 2 } }).reason, 'exists');
    store.createCharacter(B, { name: 'Bram', ancestry: 'nyxiel_defector', stats: { str: 4, mag: 1, agi: 3, spi: 2 } });
    console.log('  ✅ 1. Ficha com pontos, origens e validações.');

    // 2. Efeitos limitados: vida nunca chega a 0, itens e condições curtos
    const hit = store.applyEffects(A, { hp: -99, item_add: 'Moonlit key', condition_add: 'Soaked' });
    assert.equal(hit.applied.hp, -5, 'no máximo 5 por turno');
    for (let i = 0; i < 5; i++) store.applyEffects(A, { hp: -5 });
    assert.equal(store.getCharacter(A).hp, 1, 'ninguém morre sem consentimento');
    assert.deepEqual(store.getCharacter(A).items, ['Moonlit key']);
    assert.equal(store.rest(A).ok, true);
    assert.equal(store.getCharacter(A).hp, store.maxHp(store.getCharacter(A).stats));
    assert.deepEqual(store.getCharacter(A).conditions, []);
    assert.equal(store.rest(A).reason, 'cooldown');
    console.log('  ✅ 2. Efeitos com limites, descanso com recarga.');

    // 3. XP com teto diário e ponto por nível
    const day = Date.UTC(2026, 9, 26, 12);
    let levels = 0;
    for (let i = 0; i < 30; i++) levels += store.grantTurnXp(B, day);
    assert.equal(store.getCharacter(B).xp, 40, 'teto de 40 XP por dia');
    for (let d = 1; d <= 2; d++) for (let i = 0; i < 10; i++) levels += store.grantTurnXp(B, day + d * 86400000);
    assert.equal(levels, 1);
    assert.equal(store.trainStat(B, 'agi').ok, true);
    assert.equal(store.trainStat(B, 'agi').reason, 'no_points');
    console.log('  ✅ 3. XP por cena com teto diário e pontos por nível.');

    // 4. Segurança: palavra inteira, sem falso positivo
    assert.equal(safety.isSexual('nos vemos na sexta-feira'), false);
    assert.equal(safety.isSexual('see you in Essex'), false);
    assert.equal(safety.isSexual('cena de sexo'), true);
    assert.equal(safety.isCrisis('às vezes quero morrer'), true);
    assert.equal(safety.isCrisis('the dragon wants to die'), false);
    assert.equal(narrator.isOutOfCharacter('((brb))'), true);
    assert.equal(narrator.isOutOfCharacter('*abre a porta*'), false);
    console.log('  ✅ 4. Filtro de segurança e mensagens fora do personagem.');

    // 5. Mensagens: sem ficha recebe aviso; com ficha vira turno da cena
    const thread = fakeThread();
    const replies = [];
    const msg = (author, content) => ({ author: { id: author, bot: false }, content, channel: thread, reply: async (p) => (replies.push(p), { delete: async () => null }) });
    await narrator.onMessage(msg('stranger', '*waves*'));
    assert.ok(replies[0].content.includes('/py-character create'));
    await narrator.onMessage(msg(A, '*empurra a porta enferrujada* "Tem alguém aí?"'));
    await narrator.onMessage(msg(B, '((vou jantar já volto))'));
    await narrator.onMessage(msg(B, '*segue Lyra de espada em punho*'));
    const scene = store.getScene(thread.id);
    assert.deepEqual(scene.participants, [A, B]);
    assert.equal(scene.turns.length, 2, 'fora do personagem não entra');
    const messages = narrator.buildMessages(scene, thread);
    assert.ok(messages[0].content.includes('Astaroth') && messages[0].content.includes('SFW'), 'prompt com lore e regras');
    assert.ok(messages[1].content.includes('Lyra (Fairy') && messages[1].content.includes('Bram'), 'fichas na cena');
    console.log('  ✅ 5. Turnos dos jogadores com ficha e contexto da cena.');

    // 6. Narração: embed, NPC com avatar, efeitos na ficha, XP e botão de rolagem
    groqReply({
      narration: '*A porta range.* Um vulto de pixels some no corredor.',
      npcs: [{ npc: 'astaroth', text: 'Miau. Cheiro de vírus.' }],
      roll: { player: 'Bram', stat: 'agi', dc: 13, reason: 'alcançar o vulto' },
      effects: [{ player: 'Lyra', hp: -2, condition_add: 'Covered in dust' }, { player: 'Stranger', hp: -5 }],
      summary: 'Lyra e Bram entram na cripta e veem um vulto de pixels.',
    });
    const before = store.getCharacter(A).hp;
    await narrator.narrate(thread, Date.UTC(2026, 9, 26, 13));
    const narration = thread.sent.find((p) => p.embeds?.[0]?.author);
    assert.ok(narration.embeds[0].description.includes('A porta range'));
    assert.ok(narration.embeds[0].description.includes('Covered in dust'), 'efeitos aparecem embaixo');
    assert.equal(store.getCharacter(A).hp, before - 2);
    assert.equal(thread.npc[0].username, 'Astaroth');
    assert.equal(thread.npc[0].threadId, thread.id);
    const rollMsg = thread.sent.find((p) => p.components?.length);
    assert.ok(rollMsg.content.includes(`<@${B}>`));
    const after = store.getScene(thread.id);
    assert.equal(after.summary, 'Lyra e Bram entram na cripta e veem um vulto de pixels.');
    assert.ok(after.turns.every((turn) => turn.narrated));
    console.log('  ✅ 6. Narração com NPC por webhook, efeitos, XP e pedido de rolagem.');

    // 7. Rolagem: só o dono rola, uma vez; o resultado vira turno
    const customId = rollMsg.components[0].components[0].data.custom_id;
    const button = (userId) => ({ customId, user: { id: userId }, locale: 'en-US', channel: null, message: { content: rollMsg.content }, reply: async (p) => p, update: async (p) => p });
    assert.equal((await narrator.onRollButton(button(A))).content, t('roleplay.rollNotYours', 'en'));
    const result = await narrator.onRollButton(button(B), () => 0.6);
    assert.equal(result.die, 13);
    assert.equal(result.total, 13 + store.getCharacter(B).stats.agi);
    assert.equal(result.success, true);
    assert.equal((await narrator.onRollButton(button(B))).content, t('roleplay.rollGone', 'en'));
    assert.ok(store.getScene(thread.id).turns.some((turn) => turn.role === 'roll' && !turn.narrated));
    console.log('  ✅ 7. Rolagem d20 + atributo só para o dono do personagem.');

    // 8. Saída insegura vira aviso, sem efeitos; JSON quebrado não posta nada
    groqReply({ narration: 'Uma cena de sexo.', npcs: [], roll: null, effects: [{ player: 'Lyra', hp: -5 }], summary: 'x' });
    const hpBefore = store.getCharacter(A).hp;
    await narrator.narrate(thread, Date.UTC(2026, 9, 26, 14));
    assert.equal(thread.sent[thread.sent.length - 1].embeds[0].description.includes(t('roleplay.unsafe', 'en').slice(3, 20)), true);
    assert.equal(store.getCharacter(A).hp, hpBefore);
    assert.equal(narrator.parseReply('not json'), null);
    assert.equal(narrator.parseReply('{"narration": ""}'), null);
    console.log('  ✅ 8. Saída insegura bloqueada e JSON inválido ignorado.');

    // 9. Groq no limite: avisa e tenta de novo depois, sem gastar a cena
    groq.chatCompletionNow = async () => ({ ok: false, rateLimited: true, retryAfterMs: 1000 });
    store.updateScene(thread.id, (s) => s.turns.push({ role: 'player', userId: A, name: 'Lyra', text: '*espera*', narrated: false, at: Date.now() }));
    const sentBefore = thread.sent.length;
    await narrator.narrate(thread, Date.UTC(2026, 9, 26, 15));
    assert.equal(thread.sent[sentBefore], t('roleplay.resting', 'en'));
    assert.ok(store.getScene(thread.id).turns.some((turn) => !turn.narrated), 'turno continua pendente');
    console.log('  ✅ 9. Limite da Groq: aviso e nova tentativa.');

    // 10. Ficha no Discord e painel de status do Realm
    const sheet = pyCharacter.buildSheet(A, 'pt');
    assert.ok(sheet.data.title.includes('Lyra'));
    assert.equal(sheet.data.fields.filter((f) => f.inline).length, 4, 'vitais/atributos e mochila/condições em colunas');
    assert.equal(pyCharacter.data.toJSON().options.map((o) => o.name).join(','), 'create,view,bio,train,rest');
    const status = realm.buildStatusEmbed(GUILD_ID, Date.UTC(2026, 9, 26, 16));
    assert.ok(status.fields.some((f) => f.value.includes(`<#${thread.id}>`)), 'história recente no painel');
    console.log('  ✅ 10. Ficha em colunas, comando e painel do Realm.');

    console.log('🎉 [TEST] Roleplay validado!');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(0);
  } catch (error) {
    console.error('❌ [TEST] Falha no Roleplay:', error);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }
})();
