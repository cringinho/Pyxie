const assert = require('node:assert/strict');

console.log('🎴 Testes do sorteio sem repetição das falas da Pyxie...');
const deck = require('../src/utils/phraseDeck');
const pyxieVoice = require('../src/services/pyxieVoice');
const tips = require('../src/utils/pyxieVoice');

try {
  // 1. Casos de borda.
  assert.equal(deck.pick([]), null);
  assert.equal(deck.pick(null), null);
  assert.equal(deck.pick(['só uma']), 'só uma');
  assert.equal(deck.openerOf('🎀 Tô **passada**, gente!'), 'to passada');
  assert.equal(deck.openerOf('<:coin:123456789012345678> Moedinha caindo'), 'moedinha caindo');
  console.log('  ✅ 1. Lista vazia, item único e abertura normalizada.');

  // 2. O mesmo banco não repete até girar boa parte da lista.
  deck._reset();
  const list = Array.from({ length: 10 }, (_, i) => `Fala número ${i} diferente ${i}`);
  const run = [];
  for (let i = 0; i < 30; i += 1) run.push(deck.pick(list, { key: 'teste' }));
  for (let i = 0; i + 6 <= run.length; i += 1) {
    assert.equal(new Set(run.slice(i, i + 6)).size, 6, 'Seis seguidas sem repetir numa lista de 10');
  }
  console.log('  ✅ 2. Sem repetição dentro da janela do banco.');

  // 3. A mesma pessoa não vê duas aberturas iguais seguidas, mesmo de bancos diferentes.
  deck._reset();
  const a = ['Plot twist: A', 'Moeda caiu A', 'Olha só A'];
  const b = ['Plot twist: B', 'Moeda caiu B', 'Que dia B'];
  for (let i = 0; i < 20; i += 1) {
    const first = deck.pick(a, { key: 'a', user: 'u1' });
    const second = deck.pick(b, { key: 'b', user: 'u1' });
    assert.notEqual(deck.openerOf(first), deck.openerOf(second), 'Aberturas seguidas diferentes');
  }
  console.log('  ✅ 3. Memória de aberturas por pessoa.');

  // 4. Muletas da IA são barradas e as dicas do rodapé não repetem em seguida.
  for (const crutch of ['Plot twist: moeda', 'Tô passada com isso', "I'm shook", 'Slk que dia', 'Hmpf, tá', 'A fada tá de olho']) {
    assert.equal(pyxieVoice.isCrutch(crutch), true, crutch);
  }
  assert.equal(pyxieVoice.isCrutch('Moedinha caiu do céu, aproveita.'), false);
  assert.equal(tips.ROTATING_TIPS.pt.length, tips.ROTATING_TIPS.en.length);
  assert.ok(tips.ROTATING_TIPS.pt.length >= 12);
  const openers = new Set(tips.ROTATING_TIPS.pt.map((tip) => deck.openerOf(tip)));
  assert.ok(openers.size >= tips.ROTATING_TIPS.pt.length - 2, 'Dicas com aberturas variadas');
  let last = null;
  for (let i = 0; i < 20; i += 1) {
    const now = tips.getRandomTip('en');
    assert.notEqual(now, last);
    last = now;
  }
  console.log('  ✅ 4. Muletas barradas e dicas variadas.');

  console.log('🎴 Sorteio das falas: tudo certo.');
  process.exit(0);
} catch (err) {
  console.error('❌ Falha no sorteio das falas:', err);
  process.exit(1);
}
