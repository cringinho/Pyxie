/**
 * Auditoria Q281/Q282/Q283: corridas de clique duplo e reserva de aposta.
 * Prova que dois cliques "simultâneos" não pagam duas vezes e que o vencedor do
 * Jokenpô só recebe o que de fato saiu do saldo do perdedor.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const testMarriageDataFile = path.join(__dirname, 'marriageData.races.test.json');
const economyFile = path.join(__dirname, '..', 'data', 'economy.json');
const originalEconomy = fs.existsSync(economyFile) ? fs.readFileSync(economyFile, 'utf8') : null;
process.env.MARRIAGE_DATA_PATH = testMarriageDataFile;

const { setUserBalance, getBalance, addMagicBeans } = require('../src/services/economy');
const jokenpo = require('../src/commands/jokenpo');
const marriageManager = require('../src/modules/marriage/marriageManager');
const pyCasamento = require('../src/modules/marriage/commands/pyCasamento');

console.log('🎲 Corridas de economia (Jokenpô e Date Night)...');

try {
  if (fs.existsSync(testMarriageDataFile)) fs.unlinkSync(testMarriageDataFile);

  // ---------------------------------------------------------------- Jokenpô
  const A = 'race_jkp_alice';
  const B = 'race_jkp_bob';
  setUserBalance(A, 100);
  setUserBalance(B, 100);

  const { game } = jokenpo.startJokenpoGame({ challengerId: A, opponentId: B, bet: 100, lang: 'pt' });
  const r1 = jokenpo.commitJokenpoChoice(game.id, A, 'pedra');
  assert.equal(r1.status, 'waiting');
  assert.equal(getBalance(A), 0, 'A aposta sai do saldo na hora da jogada (reserva)');
  const r1b = jokenpo.commitJokenpoChoice(game.id, A, 'papel');
  assert.equal(r1b.status, 'already_chosen', 'clique duplo do mesmo jogador não cobra de novo');
  assert.equal(getBalance(A), 0);

  // Dois cliques "simultâneos" do oponente: só um resolve.
  const results = [
    jokenpo.commitJokenpoChoice(game.id, B, 'tesoura'),
    jokenpo.commitJokenpoChoice(game.id, B, 'tesoura'),
  ];
  assert.equal(results.filter((r) => r.status === 'win').length, 1, 'só um clique resolve a partida');
  assert.equal(results[1].status, 'expired');
  assert.equal(getBalance(A), 200, 'vencedor recebe o pote uma única vez');
  assert.equal(getBalance(B), 0);
  assert.equal(getBalance(A) + getBalance(B), 200, 'nenhuma moeda criada do nada');
  console.log('  ✅ Jokenpô: reserva no aceite e clique duplo não paga duas vezes.');

  // Perdedor sem saldo: a jogada é recusada e ninguém ganha nada.
  setUserBalance(A, 100);
  setUserBalance(B, 100);
  const g2 = jokenpo.startJokenpoGame({ challengerId: A, opponentId: B, bet: 100, lang: 'pt' }).game;
  assert.equal(jokenpo.commitJokenpoChoice(g2.id, A, 'pedra').status, 'waiting');
  setUserBalance(B, 0); // gastou tudo antes de jogar
  const noFunds = jokenpo.commitJokenpoChoice(g2.id, B, 'tesoura');
  assert.equal(noFunds.status, 'no_funds', 'sem saldo, a jogada não entra');
  assert.equal(getBalance(A), 0, 'A ainda está com a aposta reservada');
  assert.equal(jokenpo.cancelJokenpoGame(g2.id), true);
  assert.equal(getBalance(A), 100, 'recusa/expiração devolve a aposta reservada');
  assert.equal(getBalance(B), 0, 'B não ganhou nem perdeu nada');
  console.log('  ✅ Jokenpô: sem saldo não joga, e a aposta reservada volta na expiração.');

  // Empate devolve as duas apostas; teto de aposta.
  setUserBalance(A, 50);
  setUserBalance(B, 50);
  const g3 = jokenpo.startJokenpoGame({ challengerId: A, opponentId: B, bet: 50, lang: 'pt' }).game;
  jokenpo.commitJokenpoChoice(g3.id, A, 'papel');
  assert.equal(jokenpo.commitJokenpoChoice(g3.id, B, 'papel').status, 'tie');
  assert.equal(getBalance(A), 50);
  assert.equal(getBalance(B), 50);
  const g4 = jokenpo.startJokenpoGame({ challengerId: A, opponentId: B, bet: 999999, lang: 'pt' }).game;
  assert.equal(g4.bet, jokenpo.MAX_BET, 'aposta respeita o teto');
  jokenpo.cancelJokenpoGame(g4.id);
  console.log('  ✅ Jokenpô: empate devolve e aposta tem teto.');

  // ---------------------------------------------------------------- Date Night
  const C = 'race_date_carol';
  const D = 'race_date_dave';
  setUserBalance(C, 5000);
  setUserBalance(D, 5000);
  addMagicBeans(C, 5);
  addMagicBeans(D, 5);
  const prop = marriageManager.createMarriageProposal(C, D, 'guild_race_test');
  assert.equal(prop.created, true);
  assert.equal(marriageManager.resolveMarriageProposal(prop.id, D, true).accepted, true);
  const marriage = marriageManager.getMarriage(C);

  const first = marriageManager.startDateNight(C, 'date_race_1');
  assert.equal(first.allowed, true);
  const second = marriageManager.startDateNight(D, 'date_race_2');
  assert.equal(second.allowed, false, 'só um encontro aberto por casal');
  assert.equal(second.reason, 'already_open');

  pyCasamento.activeDateSessions.set('date_race_1', {
    marriageId: marriage.id,
    spouses: [...marriage.spouses],
    questionId: 1,
    answers: {},
    lang: 'pt',
    createdAt: Date.now(),
  });
  const balC = getBalance(C);
  const balD = getBalance(D);
  assert.equal(pyCasamento.recordDateAnswer('date_race_1', C, 0).status, 'recorded');
  const answers = [
    pyCasamento.recordDateAnswer('date_race_1', D, 0),
    pyCasamento.recordDateAnswer('date_race_1', D, 0),
  ];
  assert.equal(answers.filter((a) => a.status === 'resolved').length, 1, 'só um clique resolve o encontro');
  assert.equal(answers[0].outcome.success, true);
  assert.equal(getBalance(C), balC + 100, 'prêmio pago uma vez só');
  assert.equal(getBalance(D), balD + 100);

  // Depois de resolvido, nem nova abertura nem nova resolução pagam dentro das 12h.
  assert.equal(marriageManager.startDateNight(C, 'date_race_3').reason, 'cooldown');
  const again = marriageManager.resolveDateNight(marriage.id, true);
  assert.equal(again.success, false, 'resolveDateNight recusa pagar dentro do cooldown');
  assert.equal(getBalance(C), balC + 100);
  console.log('  ✅ Date Night: 1 encontro por casal, clique duplo e cooldown não pagam de novo.');

  marriageManager.endMarriage(C);

  // ---------------------------------------------------------------- Q183 menu de títulos <= 25
  const { ACHIEVEMENT_TITLES } = require('../src/data/achievementTitles');
  const { grantTitle, equipTitle } = require('../src/services/economy');
  const perfil = require('../src/commands/perfil');
  const T = 'race_titles_user';
  const achIds = Object.keys(ACHIEVEMENT_TITLES);
  for (const id of achIds) grantTitle(T, id);
  equipTitle(T, achIds[achIds.length - 1]);
  const fakeUser = { id: T, username: 'tester', displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png' };
  const page0 = perfil.buildTitlesView(fakeUser, T, null, 0);
  const options0 = page0.components[0].components[0].options;
  assert.ok(options0.length <= 25, 'menu de títulos respeita o limite de 25 opções do Discord');
  assert.ok(options0[0].data.default, 'título equipado aparece no topo da primeira página');
  assert.equal(page0.components.length, 3, 'com mais de 25 títulos, aparece a linha de páginas');
  const page1 = perfil.buildTitlesView(fakeUser, T, null, 1);
  const total = options0.length + page1.components[0].components[0].options.length;
  assert.ok(total > 25, 'a segunda página mostra o restante');
  console.log('  ✅ Galeria de Títulos: menu paginado com até 25 opções.');

  // ---------------------------------------------------------------- Q288 leitura protegida
  const os = require('node:os');
  const { readJsonProtected, writeJsonAtomicWithBackup } = require('../src/utils/atomicJson');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-q288-'));
  try {
    const file = path.join(tmpDir, 'market.json');
    writeJsonAtomicWithBackup(file, { listings: { a: 1 } });
    writeJsonAtomicWithBackup(file, { listings: { a: 1, b: 2 } }); // cria o .bak com a versão anterior
    fs.writeFileSync(file, '{ quebrado', 'utf8');
    const restored = readJsonProtected(file, {});
    assert.deepEqual(restored, { listings: { a: 1 } }, 'arquivo corrompido cai para o .bak');
    assert.ok(fs.readdirSync(tmpDir).some((f) => f.startsWith('market.json.corrupt-')), 'arquivo ruim é guardado, não apagado');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  console.log('  ✅ Persistência: JSON corrompido é guardado e a leitura usa o backup.');

  console.log('🎉 Corridas de economia: OK');
} finally {
  pyCasamento.activeDateSessions.clear();
  if (fs.existsSync(testMarriageDataFile)) fs.unlinkSync(testMarriageDataFile);
  fs.rmSync(`${testMarriageDataFile}.bak`, { force: true });
  if (originalEconomy !== null) fs.writeFileSync(economyFile, originalEconomy, 'utf8');
}
