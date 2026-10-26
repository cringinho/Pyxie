const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getCookieStatus, claimCookie, grantExtraCookie, COOKIE_WISDOMS } = require('../src/services/cookie');
const { createBonusSession, verifyAndClaimBonus, BONUS_SECRET } = require('../src/services/bonusTimer');
const { getBalance, addCoins, spendCoins, setUserBalance } = require('../src/services/economy');

const economyFile = path.join(__dirname, '..', 'data', 'economy.json');
const originalEconomy = fs.existsSync(economyFile) ? fs.readFileSync(economyFile, 'utf8') : '{}';

try {
const testUserId = `test_gamer_${Date.now()}`;
setUserBalance(testUserId, 1000);

console.log('Iniciando testes dos novos jogos e utilidades leves...');

// 1. Teste do Biscoito da Sorte
const statusInitial = getCookieStatus(testUserId);
assert.equal(statusInitial.canOpen, true, 'Usuário novo deve poder quebrar o primeiro biscoito.');

const firstOpen = claimCookie(testUserId);
assert.equal(firstOpen.success, true, 'Abertura do primeiro biscoito deve ter sucesso.');
assert.ok(firstOpen.wisdom && firstOpen.wisdom.length > 0, 'Biscoito deve conter uma frase de sabedoria.');
assert.equal(firstOpen.luckyNumbers.length, 6, 'Biscoito deve conter 6 números da sorte.');

// 2. Teste do Cooldown do Biscoito (só 1x ao dia)
const secondOpen = claimCookie(testUserId);
assert.equal(secondOpen.success, false, 'Segunda abertura imediata deve ser barrada pelo cooldown.');
assert.equal(secondOpen.error, 'cooldown', 'Erro deve ser de cooldown.');
assert.ok(secondOpen.timeRemainingMs > 0, 'Deve informar o tempo restante.');

// 3. Teste de Bônus de Biscoito Extra via Bônus Web (Monetização)
const crypto = require('node:crypto');
const pastCreatedAt = Date.now() - 10000;
const nonce = crypto.randomBytes(8).toString('hex');
const payload = JSON.stringify({ userId: testUserId, action: 'cookie_bonus', metadata: {}, createdAt: pastCreatedAt, nonce });
const hmac = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');
const validCookieToken = Buffer.from(JSON.stringify({ payload, sig: hmac })).toString('base64url');

const balanceBeforeBonus = getBalance(testUserId);
const claimBonusRes = verifyAndClaimBonus(validCookieToken);
assert.equal(claimBonusRes.success, true, 'Resgate do bônus web de biscoito deve ser aprovado.');
assert.equal(getBalance(testUserId), balanceBeforeBonus + 25, 'Deve creditar 25 moedas ao resgatar bônus de biscoito.');

const statusAfterBonus = getCookieStatus(testUserId);
assert.equal(statusAfterBonus.canOpen, true, 'Após o bônus, o usuário deve poder abrir um biscoito extra.');
assert.ok(statusAfterBonus.extraCookies >= 1, 'Deve possuir crédito de biscoito extra.');

const extraOpen = claimCookie(testUserId);
assert.equal(extraOpen.success, true, 'Biscoito extra deve ser aberto com sucesso.');

// 3.1 Teste de Execução do Comando Biscoito (Prefix e Slash com Cooldown)
const biscoitoCommand = require('../src/commands/biscoito');
let prefixReplyResult = null;
biscoitoCommand.executePrefix({
  message: {
    author: { id: testUserId },
    reply: (payload) => {
      prefixReplyResult = payload;
    },
  },
});
assert.ok(prefixReplyResult && prefixReplyResult.embeds.length > 0, 'Comando biscoito em cooldown deve responder embed.');
assert.ok(prefixReplyResult.components.length > 0, 'Comando biscoito em cooldown deve oferecer botão de bônus.');

let slashReplyResult = null;
biscoitoCommand.executeSlash({
  interaction: {
    user: { id: testUserId },
    editReply: (payload) => {
      slashReplyResult = payload;
    },
  },
});
assert.ok(slashReplyResult && slashReplyResult.embeds.length > 0, 'Slash py-cookie em cooldown deve responder embed.');

// 4. Teste de Coinflip (Cara ou Coroa)
setUserBalance(testUserId, 500);
const coinflipCommand = require('../src/commands/coinflip');
assert.ok(coinflipCommand.name, 'Comando coinflip deve ter nome.');
assert.ok(coinflipCommand.aliases.includes('caraoucoroa'), 'Comando coinflip deve ter alias caraoucoroa.');
assert.ok(coinflipCommand.aliases.includes('coinflip'), 'Comando coinflip deve ter alias coinflip.');
assert.ok(coinflipCommand.aliases.includes('flip'), 'Comando coinflip deve ter alias flip.');

// 5. Teste de Jokenpô
const jokenpoCommand = require('../src/commands/jokenpo');
assert.ok(jokenpoCommand.name, 'Comando jokenpo deve ter nome.');
assert.ok(jokenpoCommand.aliases.includes('ppt'), 'Comando jokenpo deve ter alias ppt.');
assert.ok(jokenpoCommand.aliases.includes('rps'), 'Comando jokenpo deve ter alias rps.');

// 6. Teste de Quem é Mais Provável
const likelyCommand = require('../src/commands/provavel');
assert.ok(likelyCommand.name, 'Comando provavel deve ter nome.');
assert.ok(likelyCommand.aliases.includes('provavel'), 'Comando provavel deve ter alias provavel.');
assert.ok(likelyCommand.aliases.includes('likely'), 'Comando provavel deve ter alias likely.');

const mockAuthor = { id: 'author_1', displayName: 'Jogador A' };
const mockTarget = { id: 'target_2', displayName: 'Jogador B' };
const mockSecond = { id: 'target_3', displayName: 'Jogador C' };

const pair1 = likelyCommand.pickTwoMembers(null, mockTarget, null, mockAuthor);
assert.deepStrictEqual(pair1, [mockAuthor, mockTarget], 'Deve selecionar Autor vs Alvo quando apenas 1 alvo é escolhido.');

const pair2 = likelyCommand.pickTwoMembers(null, mockTarget, mockSecond, mockAuthor);
assert.deepStrictEqual(pair2, [mockTarget, mockSecond], 'Deve selecionar Alvo 1 vs Alvo 2 quando 2 membros são fornecidos.');

const pollRes = likelyCommand.startLikelyPoll({
  guild: null,
  candidateA: mockAuthor,
  candidateB: mockTarget,
  scenario: 'dormir na call',
  lang: 'pt',
});
assert.ok(pollRes.pollId, 'Deve gerar pollId.');
assert.ok(pollRes.embed, 'Deve gerar embed.');
assert.equal(pollRes.components.length, 1, 'Deve conter 1 action row com botões dos dois alvos.');


// 7. Teste de Dados
const dadoCommand = require('../src/commands/dado');
assert.ok(dadoCommand.name, 'Comando dado deve ter nome.');
assert.ok(dadoCommand.aliases.includes('dado'), 'Comando dado deve ter alias dado.');
assert.ok(dadoCommand.aliases.includes('dice'), 'Comando dado deve ter alias dice.');

// 8. Teste de Suporte a Inglês no Biscoito (Wisdoms em EN)
assert.ok(Array.isArray(COOKIE_WISDOMS.en), 'Deve possuir lista de sabedoria em inglês.');
assert.ok(COOKIE_WISDOMS.en.length > 30, 'Deve possuir mais de 30 frases em inglês.');
const testEnUser = `test_en_gamer_${Date.now()}`;
grantExtraCookie(testEnUser);
const enCookie = claimCookie(testEnUser, 'en');
assert.ok(enCookie.wisdom, 'Deve gerar sabedoria em inglês.');
// 9. Teste do Comando de Convite Bilíngue (Invite / Convite)
const inviteCommand = require('../src/commands/convite');
assert.ok(inviteCommand.name, 'Comando convite deve ter nome.');
assert.ok(inviteCommand.aliases.includes('invite'), 'Comando convite deve ter alias invite.');
assert.ok(inviteCommand.aliases.includes('convite'), 'Comando convite deve ter alias convite.');
assert.ok(inviteCommand.aliases.includes('py-invite'), 'Comando convite deve ter alias py-invite.');

const mockClient = {
  user: {
    id: '1543650200718155897',
    displayAvatarURL: () => 'https://cdn.discordapp.com/avatars/1543650200718155897/avatar.png',
  },
};

const invitePt = inviteCommand.buildInviteEmbed(mockClient, 'pt');
assert.ok(invitePt.embeds && invitePt.embeds.length === 1, 'Deve gerar 1 embed de convite em PT.');
assert.ok(!invitePt.embeds[0].data.title.includes('invite.title'), 'Título PT não deve ser a chave literal.');
assert.ok(invitePt.embeds[0].data.title.includes('Convide a Pyxie'), 'Título PT deve convidar a Pyxie.');
assert.equal(invitePt.components.length, 2, 'Deve conter 2 linhas de botões.');

const inviteEn = inviteCommand.buildInviteEmbed(mockClient, 'en');
assert.ok(inviteEn.embeds && inviteEn.embeds.length === 1, 'Deve gerar 1 embed de convite em EN.');
assert.ok(!inviteEn.embeds[0].data.title.includes('invite.title'), 'Título EN não deve ser a chave literal.');
assert.ok(inviteEn.embeds[0].data.title.includes('Invite Pyxie'), 'Título EN deve convidar a Pyxie em inglês.');

const inviteUrl = inviteCommand.getInviteUrl('1543650200718155897');
assert.ok(inviteUrl.includes('client_id=1543650200718155897'), 'URL de convite deve conter o Client ID.');
assert.ok(inviteUrl.includes('permissions='), 'URL de convite deve conter permissões.');
assert.ok(inviteUrl.includes('scope=bot%20applications.commands'), 'URL de convite deve conter os escopos bot e applications.commands.');

console.log('Verificação dos comandos leves e convite bilíngue (Biscoito, Jokenpô, Provável, Dados, Coinflip, Convite e Bônus Web): OK');
// 10. Teste do Comando de Trabalho Bilíngue e Bônus Web por Idioma
const trabalhoCommand = require('../src/commands/trabalho');
const { PROFESSION_MINIGAMES } = trabalhoCommand;
const professionsDef = require('../src/services/professions');
const { t } = require('../src/utils/i18n');
const bonusTimer = require('../src/services/bonusTimer');

const activeProfessions = Object.keys(professionsDef);
assert.equal(activeProfessions.length, 28, 'Devem existir 28 profissões no sistema (22 convencionais + 6 mágicas).');

for (const profKey of activeProfessions) {
  const games = PROFESSION_MINIGAMES[profKey];
  assert.ok(Array.isArray(games) && games.length >= 3, `A profissão ${profKey} deve ter pelo menos 3 minigames.`);

  // Testar labels de profissão em PT e EN
  const labelPt = t(`profession.labels.${profKey}`, 'pt');
  const labelEn = t(`profession.labels.${profKey}`, 'en');
  assert.ok(labelPt && !labelPt.startsWith('profession.labels'), `Label PT de ${profKey} deve existir.`);
  assert.ok(labelEn && !labelEn.startsWith('profession.labels'), `Label EN de ${profKey} deve existir.`);

  games.forEach((game, idx) => {
    // Validação em Português
    assert.ok(game.pt, `Minigame #${idx} de ${profKey} deve ter versão PT.`);
    assert.ok(typeof game.pt.scenario === 'string' && game.pt.scenario.length > 10, `Cenário PT de ${profKey} #${idx} deve ser válido.`);
    assert.ok(typeof game.pt.correct === 'string' && game.pt.correct.length > 3, `Resposta correta PT de ${profKey} #${idx} deve ser válida.`);
    assert.ok(Array.isArray(game.pt.wrongs) && game.pt.wrongs.length === 3, `Respostas incorretas PT de ${profKey} #${idx} devem ser exatamente 3.`);
    assert.ok(!game.pt.wrongs.includes(game.pt.correct), `Resposta correta PT não deve estar entre os wrongs em ${profKey} #${idx}.`);

    // Validação em Inglês
    assert.ok(game.en, `Minigame #${idx} de ${profKey} deve ter versão EN.`);
    assert.ok(typeof game.en.scenario === 'string' && game.en.scenario.length > 10, `Cenário EN de ${profKey} #${idx} deve ser válido.`);
    assert.ok(typeof game.en.correct === 'string' && game.en.correct.length > 3, `Resposta correta EN de ${profKey} #${idx} deve ser válida.`);
    assert.ok(Array.isArray(game.en.wrongs) && game.en.wrongs.length === 3, `Respostas incorretas EN de ${profKey} #${idx} devem ser exatamente 3.`);
    assert.ok(!game.en.wrongs.includes(game.en.correct), `Resposta correta EN não deve estar entre os wrongs em ${profKey} #${idx}.`);
  });
}

// Validação da Sessão de Bônus Web Bilíngue
const sessionPt = bonusTimer.createBonusSession('test-user-pt', 'pt');
assert.ok(sessionPt.url.includes('lang=pt'), 'URL do bônus PT deve conter lang=pt');
const sessionEn = bonusTimer.createBonusSession('test-user-en', 'en');
assert.ok(sessionEn.url.includes('lang=en'), 'URL do bônus EN deve conter lang=en');

// Validação do Embed e Botões [A] [B] [C] [D] no comando de trabalho
(async () => {
  const { setProfession } = require('../src/services/economy');
  const workerId = `test_worker_${Date.now()}`;
  setProfession(workerId, 'programador', 0);

  let workReply = null;
  await trabalhoCommand.executePrefix({
    message: {
      author: { id: workerId },
      guild: { id: '1453890868980482090' },
      reply: (payload) => { workReply = payload; },
    },
  });

  assert.ok(workReply && workReply.embeds && workReply.embeds.length > 0, 'O comando de trabalho deve retornar um embed.');
  const workEmbedDesc = workReply.embeds[0].data.description;
  assert.ok(workEmbedDesc.includes('**[A]**'), 'A descrição do embed deve conter a alternativa [A].');
  assert.ok(workEmbedDesc.includes('**[B]**'), 'A descrição do embed deve conter a alternativa [B].');
  assert.ok(workEmbedDesc.includes('**[C]**'), 'A descrição do embed deve conter a alternativa [C].');
  assert.ok(workEmbedDesc.includes('**[D]**'), 'A descrição do embed deve conter a alternativa [D].');

  assert.ok(workReply.components && workReply.components.length > 0, 'Deve retornar a linha de botões.');
  const workButtons = workReply.components[0].components;
  assert.equal(workButtons.length, 4, 'Devem existir 4 botões de escolha.');
  assert.equal(workButtons[0].data.label, '[A]', 'O botão 1 deve ser [A].');
  assert.equal(workButtons[1].data.label, '[B]', 'O botão 2 deve ser [B].');
  assert.equal(workButtons[2].data.label, '[C]', 'O botão 3 deve ser [C].');
  assert.equal(workButtons[3].data.label, '[D]', 'O botão 4 deve ser [D].');

  // 13. Testes do Quiz Cultural (500 Questões, 10 Moedas/Acerto, 3h Cooldown e Dificuldade Progressiva)
  const quizCommand = require('../src/commands/quiz');
  const quizSeeder = require('../src/services/quizSeederService');
  const { getQuizStatus, startQuiz } = require('../src/services/economy');

  assert.ok(quizCommand.name, 'Comando quiz deve ter nome.');
  assert.ok(quizCommand.aliases.includes('quiz'), 'Comando quiz deve ter alias quiz.');
  assert.ok(quizCommand.aliases.includes('py-quiz'), 'Comando quiz deve ter alias py-quiz.');
  assert.ok(quizCommand.aliases.includes('trivia'), 'Comando quiz deve ter alias trivia.');

  // Verifica se o banco de 500 questões foi carregado e estruturado
  const quizDb = quizSeeder.loadDatabase();
  assert.ok(Array.isArray(quizDb), 'Banco de perguntas deve ser um array.');
  assert.equal(quizDb.length, 600, 'Banco de perguntas do quiz deve conter exatamente 600 questões.');

  const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const q of quizDb) {
    assert.ok(q.pt && q.en, 'Pergunta deve ter paridade bilíngue em PT e EN.');
    assert.ok(q.pt.question && q.en.question, 'Texto da pergunta em PT e EN deve existir.');
    assert.ok(q.pt.correct && q.en.correct, 'Resposta correta em PT e EN deve existir.');
    assert.equal(q.pt.wrongs.length, 3, 'Devem existir exatamente 3 alternativas incorretas em PT.');
    assert.equal(q.en.wrongs.length, 3, 'Devem existir exatamente 3 alternativas incorretas em EN.');
    assert.ok(q.level >= 1 && q.level <= 4, 'Nível deve estar entre 1 e 4.');
    levelCounts[q.level]++;
  }
  assert.equal(levelCounts[1], 150, 'Nível 1 deve ter 150 questões.');
  assert.equal(levelCounts[2], 150, 'Nível 2 deve ter 150 questões.');
  assert.equal(levelCounts[3], 150, 'Nível 3 deve ter 150 questões.');
  assert.equal(levelCounts[4], 150, 'Nível 4 deve ter 150 questões.');

  // Teste de cooldown de 3 horas do Quiz
  const testQuizUser = `test_quiz_player_${Date.now()}`;
  const initialQuizStatus = getQuizStatus(testQuizUser);
  assert.strictEqual(initialQuizStatus.available, true, 'Novo jogador deve ter quiz disponível.');

  const started = startQuiz(testQuizUser);
  assert.strictEqual(started.started, true, 'startQuiz deve registrar o início.');
  const afterStartStatus = getQuizStatus(testQuizUser);
  assert.strictEqual(afterStartStatus.available, false, 'Jogador que iniciou deve entrar em cooldown.');
  assert.ok(afterStartStatus.remainingMs > 2.9 * 60 * 60 * 1000, 'Cooldown restante deve ser de aproximadamente 3 horas.');

  // Execução do comando quiz
  let quizReply = null;
  const mockQuizUser = `quiz_exec_${Date.now()}`;
  await quizCommand.executePrefix({
    message: {
      author: { id: mockQuizUser },
      guild: { id: '1453890868980482090' },
      reply: (payload) => { quizReply = payload; },
    },
  });

  assert.ok(quizReply && quizReply.embeds && quizReply.embeds.length > 0, 'Comando quiz deve retornar embed.');
  assert.ok(quizReply.components && quizReply.components.length > 0, 'Comando quiz deve retornar botões.');
  assert.equal(quizReply.components[0].components.length, 4, 'Primeira linha de botões deve ter as 4 alternativas [A, B, C, D].');

  // Execução do comando quiz via Slash Command (garantindo que interaction.deferred use editReply)
  let slashQuizReply = null;
  const mockSlashQuizUser = `quiz_slash_${Date.now()}`;
  await quizCommand.executeSlash({
    interaction: {
      user: { id: mockSlashQuizUser },
      guild: { id: '1453890868980482090' },
      deferred: true,
      editReply: (payload) => { slashQuizReply = payload; },
      reply: () => { throw new Error('InteractionAlreadyReplied'); },
    },
  });
  assert.ok(slashQuizReply && slashQuizReply.embeds && slashQuizReply.embeds.length > 0, 'Comando quiz via slash deferred deve responder com editReply sem erros.');

  // Validação do Sistema de Baralho Anti-Repetição e Cache do Quiz
  const testDeckQuestions = [
    { id: 'q1', level: 1, pt: { question: 'P1', correct: 'C1', wrongs: ['W1', 'W2', 'W3'] }, en: { question: 'Q1', correct: 'C1', wrongs: ['W1', 'W2', 'W3'] } },
    { id: 'q2', level: 1, pt: { question: 'P2', correct: 'C2', wrongs: ['W1', 'W2', 'W3'] }, en: { question: 'Q2', correct: 'C2', wrongs: ['W1', 'W2', 'W3'] } },
    { id: 'q3', level: 1, pt: { question: 'P3', correct: 'C3', wrongs: ['W1', 'W2', 'W3'] }, en: { question: 'Q3', correct: 'C3', wrongs: ['W1', 'W2', 'W3'] } },
  ];
  const qPick1 = quizCommand.selectQuestionForLevel(testDeckQuestions, 1, new Set(['q1', 'q2']), []);
  assert.equal(quizCommand.getQuizQuestionKey(qPick1), 'q3', 'selectQuestionForLevel deve excluir questões já vistas na sessão.');

  const qPickHistory = quizCommand.selectQuestionForLevel(testDeckQuestions, 1, new Set(), ['q1', 'q3']);
  assert.equal(quizCommand.getQuizQuestionKey(qPickHistory), 'q2', 'selectQuestionForLevel deve excluir questões do histórico recente.');

  // Teste de gravação de chave recente em recentQuizQuestions
  const antiRepeatUser = `quiz_antirepeat_${Date.now()}`;
  const { getUserAccount, recordQuizQuestion } = require('../src/services/economy');
  recordQuizQuestion(antiRepeatUser, 'q_test_key_1');
  recordQuizQuestion(antiRepeatUser, 'q_test_key_2');
  const antiRepeatAcc = getUserAccount(antiRepeatUser);
  assert.deepEqual(antiRepeatAcc.recentQuizQuestions, ['q_test_key_1', 'q_test_key_2'], 'recentQuizQuestions deve armazenar as chaves de perguntas vistas.');

  // 14. Testes dos Geradores Autônomos de IA (Work Seeder com 16 Carreiras e Quiz Seeder)
  const workSeeder = require('../src/services/workSeederService');
  assert.equal(workSeeder.PROFESSIONS.length, 28, 'Work Seeder deve ter 28 profissões (22 convencionais + 6 mágicas).');
  assert.ok(workSeeder.PROFESSIONS.includes('dublador'), 'Work Seeder deve incluir dublador.');
  assert.ok(workSeeder.PROFESSIONS.includes('desenvolvedor_jogos'), 'Work Seeder deve incluir desenvolvedor_jogos.');
  assert.ok(workSeeder.PROFESSIONS.includes('psicologo'), 'Work Seeder deve incluir psicologo.');
  assert.ok(workSeeder.PROFESSIONS.includes('telemarketing'), 'Work Seeder deve incluir telemarketing.');
  assert.ok(workSeeder.PROFESSIONS.includes('animador_festa'), 'Work Seeder deve incluir animador_festa.');
  assert.ok(workSeeder.PROFESSIONS.includes('advogada'), 'Work Seeder deve incluir advogada.');
  assert.ok(workSeeder.PROFESSIONS.includes('alquimista'), 'Work Seeder deve incluir alquimista.');
  assert.ok(workSeeder.PROFESSIONS.includes('mago'), 'Work Seeder deve incluir mago.');
  assert.ok(workSeeder.PROFESSIONS.includes('ferreiro'), 'Work Seeder deve incluir ferreiro.');
  assert.ok(workSeeder.PROFESSIONS.includes('rei_rainha'), 'Work Seeder deve incluir rei_rainha.');
  assert.ok(workSeeder.PROFESSIONS.includes('domador_feras'), 'Work Seeder deve incluir domador_feras.');
  assert.ok(workSeeder.PROFESSIONS.includes('aniquilador_vegetais'), 'Work Seeder deve incluir aniquilador_vegetais.');

  const workStatus = workSeeder.getStatus();
  assert.equal(workStatus.targetTotal, 2800, 'Work Seeder targetTotal deve ser 2800 (28 profissões x 100).');
  assert.equal(Object.keys(workStatus.perProfession).length, 28, 'Work Seeder perProfession deve conter 28 profissões.');

  const quizStatus = quizSeeder.getStatus();
  assert.equal(quizStatus.targetTotal, 600, 'Quiz Seeder targetTotal deve ser 600.');
  assert.equal(quizStatus.perLevel[1], 150, 'Quiz Seeder Nível 1 deve ter 150 perguntas.');
  assert.equal(quizStatus.perLevel[2], 150, 'Quiz Seeder Nível 2 deve ter 150 perguntas.');
  assert.equal(quizStatus.perLevel[3], 150, 'Quiz Seeder Nível 3 deve ter 150 perguntas.');
  assert.equal(quizStatus.perLevel[4], 150, 'Quiz Seeder Nível 4 deve ter 150 perguntas.');

  // 15. Testes de Engajamento Positivo do Trabalho (Resposta Rápida, Ajuda de Custo e Botões Desabilitados)
  const fastWorkerId = `test_fast_worker_${Date.now()}`;
  setProfession(fastWorkerId, 'programador', 0);

  let fastWorkReply = null;
  await trabalhoCommand.executePrefix({
    message: {
      author: { id: fastWorkerId },
      guild: { id: '1453890868980482090' },
      reply: (payload) => { fastWorkReply = payload; },
    },
  });

  assert.ok(fastWorkReply && fastWorkReply.components && fastWorkReply.components.length > 0);

  // Simula resposta correta rápida (< 12s)
  // Extrai customId e simula o clique no botão correto
  // Como activeWorkSessions é interno, podemos interagir pelo handler
  // Testamos o fluxo de erro com ajuda de custo e estilização de botões
  const wrongWorkerId = `test_wrong_worker_${Date.now()}`;
  setProfession(wrongWorkerId, 'psicologo', 0);
  setUserBalance(wrongWorkerId, 0);

  let wrongWorkReply = null;
  await trabalhoCommand.executePrefix({
    message: {
      author: { id: wrongWorkerId },
      guild: { id: '1453890868980482090' },
      reply: (payload) => { wrongWorkReply = payload; },
    },
  });

  assert.ok(wrongWorkReply);
  let updatedWrongPayload = null;
  await trabalhoCommand.handleWorkInteraction({
    customId: `work_ans:999:${wrongWorkerId}`, // Índice intencionalmente errado
    user: { id: wrongWorkerId },
    update: (payload) => { updatedWrongPayload = payload; },
  });

  assert.ok(updatedWrongPayload, 'handleWorkInteraction deve atualizar a interação.');
  assert.ok(updatedWrongPayload.embeds && updatedWrongPayload.embeds.length > 0, 'Deve retornar embed de erro educativo.');
  const errorDesc = updatedWrongPayload.embeds[0].data.description;
  assert.ok(errorDesc.includes('Ajuda de Custo') || errorDesc.includes('Stipend Allowance'), 'Embed de erro deve mencionar Ajuda de Custo.');
  assert.ok(errorDesc.includes('Escudo de Estabilidade') || errorDesc.includes('Stability Shield'), 'Embed de erro deve mencionar Escudo de Estabilidade.');

  // Verifica botões desabilitados pós-clique
  assert.ok(updatedWrongPayload.components && updatedWrongPayload.components.length > 0, 'Deve manter a linha de botões desabilitados.');
  const postButtons = updatedWrongPayload.components[0].components;
  assert.equal(postButtons.length, 4, 'Devem existir 4 botões.');
  for (const b of postButtons) {
    assert.equal(b.data.disabled, true, 'Todos os botões devem estar desabilitados.');
  }

  // Verifica se o usuário recebeu a ajuda de custo (pelo menos 5 moedas)
  const wrongBalance = getBalance(wrongWorkerId);
  assert.ok(wrongBalance >= 5, `Usuário que errou deve receber ajuda de custo mínima de 5 moedas (recebeu: ${wrongBalance}).`);

  // 16. Testes do Serviço de Auditoria de Acervo (acervoAuditService)
  const acervoAuditService = require('../src/services/acervoAuditService');
  const levelDist = acervoAuditService.auditLevelDistribution({ targetPerLevel: 10 });
  assert.equal(levelDist.totalProfessions, 28, 'Deve auditar exatamente 28 profissões.');
  assert.ok(typeof levelDist.complianceRate === 'number', 'complianceRate deve ser numérico.');
  assert.ok(Array.isArray(levelDist.underTargetProfessions), 'underTargetProfessions deve ser array.');

  const lengthBias = acervoAuditService.auditAnswerLengthBias({ biasThreshold: 0.35 });
  assert.equal(lengthBias.biasThreshold, 0.35, 'Threshold deve ser 0.35.');
  assert.ok(lengthBias.totalAudited > 0, 'Total de questões auditadas deve ser maior que zero.');
  assert.ok(typeof lengthBias.overallBiasRate === 'number', 'overallBiasRate deve ser numérico.');

  const auditReport = acervoAuditService.generateAuditReport({ targetPerLevel: 10, biasThreshold: 0.35 });
  assert.ok(auditReport.healthScore >= 0 && auditReport.healthScore <= 100, 'Health score deve estar entre 0 e 100.');
  assert.ok(auditReport.summaryMarkdown.includes('RELATÓRIO DE AUDITORIA ERGONÔMICA DO ACERVO'), 'Markdown deve conter cabeçalho canônico.');
  assert.ok(auditReport.recommendations.length > 0, 'Deve conter recomendações.');

  const acervoStats = acervoAuditService.getAcervoStats();
  assert.ok(acervoStats.careers, 'Deve conter estatísticas de carreiras.');
  assert.ok(acervoStats.quiz, 'Deve conter estatísticas do quiz.');
  assert.ok(acervoStats.ergonomics, 'Deve conter estatísticas de ergonomia.');

  // 17. Testes de Psicologia Comportamental (Efeito Zeigarnik e Near-Miss em Envelopes)
  const envWorkerId = `test_env_worker_${Date.now()}`;
  setProfession(envWorkerId, 'programador', 0);
  setUserBalance(envWorkerId, 0);

  // Simula 2 turnos prévios concluídos para que o próximo atinja 3/3
  const { updateUserAccount: updateWorkerAcc } = require('../src/services/economy');
  updateWorkerAcc(envWorkerId, (acc) => { acc.projectProgress = 2; });

  let envWorkReply = null;
  await trabalhoCommand.executePrefix({
    message: {
      author: { id: envWorkerId },
      guild: { id: '1453890868980482090' },
      reply: (payload) => { envWorkReply = payload; },
    },
  });

  assert.ok(envWorkReply);
  const activeSession = trabalhoCommand.activeWorkSessions.get(envWorkerId);
  assert.ok(activeSession, 'Sessão ativa de trabalho deve existir.');

  // Acerta a questão clicando na alternativa correta
  let updatedSuccessPayload = null;
  await trabalhoCommand.handleWorkInteraction({
    customId: `work_ans:${activeSession.correctIndex}:${envWorkerId}`,
    user: { id: envWorkerId },
    update: (payload) => { updatedSuccessPayload = payload; },
  });

  assert.ok(updatedSuccessPayload, 'Payload de acerto deve ser retornado.');
  const successDesc = updatedSuccessPayload.embeds[0].data.description;
  assert.ok(successDesc.includes('Projeto da Carreira') || successDesc.includes('Career Project'), 'Deve exibir barra de projeto.');
  assert.ok(successDesc.includes('[███] 3/3'), 'Deve exibir barra cheia 3/3.');

  // Deve conter 2 rows: botões de resposta desabilitados e botões dos 3 envelopes
  assert.equal(updatedSuccessPayload.components.length, 2, 'Deve retornar 2 linhas de botões (respostas + envelopes).');
  const envelopeButtons = updatedSuccessPayload.components[1].components;
  assert.equal(envelopeButtons.length, 3, 'Devem existir 3 envelopes para escolha.');
  assert.ok(envelopeButtons[0].data.label.includes('Envelope A'), 'Deve conter Envelope A.');
  assert.ok(envelopeButtons[1].data.label.includes('Envelope B'), 'Deve conter Envelope B.');
  assert.ok(envelopeButtons[2].data.label.includes('Envelope C'), 'Deve conter Envelope C.');

  // Verifica se a sessão de envelope foi criada
  assert.ok(trabalhoCommand.activeEnvelopeSessions.has(envWorkerId), 'Sessão de envelope deve estar ativa.');

  // Simula clique no Envelope B
  let envelopeRewardPayload = null;
  await trabalhoCommand.handleWorkInteraction({
    customId: `work_env:B:${envWorkerId}`,
    user: { id: envWorkerId },
    message: {
      embeds: updatedSuccessPayload.embeds,
      components: updatedSuccessPayload.components,
    },
    update: (payload) => { envelopeRewardPayload = payload; },
  });

  assert.ok(envelopeRewardPayload, 'Payload de resgate de envelope deve ser retornado.');
  assert.ok(envelopeRewardPayload.embeds.length >= 2, 'Deve retornar embed original e embed de revelação.');
  const revealDesc = envelopeRewardPayload.embeds[1].data.description;
  assert.ok(revealDesc.includes('Envelope B'), 'Deve confirmar a abertura do Envelope B.');
  assert.ok(revealDesc.includes('Envelope A') && revealDesc.includes('Envelope C'), 'Deve revelar os outros dois envelopes.');

  // Verifica botões de envelope desabilitados
  const disabledEnvButtons = envelopeRewardPayload.components[1].components;
  for (const eb of disabledEnvButtons) {
    assert.equal(eb.data.disabled, true, 'Todos os envelopes devem estar desabilitados pós-escolha.');
  }
  // Botão B deve ser Success (verde, código 3)
  assert.equal(disabledEnvButtons[1].data.style, 3, 'Envelope B escolhido deve ter estilo Success (3).');

  // Sessão de envelope consumida
  assert.equal(trabalhoCommand.activeEnvelopeSessions.has(envWorkerId), false, 'Sessão de envelope deve ser removida após escolha.');

  // 18. Testes do Comando de Profissão com Maestria (Currículo Lendário)
  const profCmd = require('../src/commands/profissao');
  const profWorkerId = `test_prof_master_${Date.now()}`;
  setProfession(profWorkerId, 'programador', 0);
  updateWorkerAcc(profWorkerId, (acc) => {
    acc.masteredProfessions = ['programador', 'alquimista'];
  });

  let profReply = null;
  await profCmd.executePrefix({
    message: {
      author: { id: profWorkerId },
      guild: { id: '1453890868980482090' },
      reply: (payload) => { profReply = payload; },
    },
  });

  assert.ok(profReply && profReply.embeds && profReply.embeds.length > 0);
  const profEmbedDesc = profReply.embeds[0].data.description;
  assert.ok(profEmbedDesc.includes('Carreiras Dominadas: 2/28 (+6% de Bônus Salarial Global)'), 'Embed deve exibir contador de maestria no topo.');

  // Verifica se o ícone ⭐ Mestre aparece na listagem
  const fields = profReply.embeds[0].data.fields;
  const standardField = fields.find((f) => f.name.includes('Carreiras Convencionais'));
  assert.ok(standardField && standardField.value.includes('⭐ Mestre'), 'Profissão dominada deve exibir ⭐ Mestre.');

  // 19. Testes de Dilemas de Corrupção / Proposta Sombria (Papers, Please & Reigns)
  const {
    PROFESSION_DILEMMAS,
    getDilemmaScenario,
    activeDilemmaSessions,
    handleDilemmaInteraction,
  } = trabalhoCommand;

  // 19.1 Verifica cenários contextuais bilíngues para todas as 28 profissões canônicas
  assert.ok(Object.keys(PROFESSION_DILEMMAS).length >= 22, 'Devem existir no mínimo 22 cenários de dilema.');
  for (const profKey of activeProfessions) {
    const ptScenario = getDilemmaScenario(profKey, 'pt');
    assert.ok(ptScenario && ptScenario.length > 15, `Cenário em PT para ${profKey} deve ser descritivo.`);
    const enScenario = getDilemmaScenario(profKey, 'en');
    assert.ok(enScenario && enScenario.length > 15, `Cenário em EN para ${profKey} deve ser descritivo.`);
  }

  // 19.2 Teste de interação de dilema com usuário não autorizado
  let unauthorizedReply = null;
  await handleDilemmaInteraction({
    customId: 'work_dil:accept:user_owner_123',
    user: { id: 'impostor_999' },
    reply: (payload) => { unauthorizedReply = payload; },
  });
  assert.ok(unauthorizedReply && unauthorizedReply.flags === 64, 'Interação de dilema por outro usuário deve ser rejeitada como efêmera.');

  // 19.3 Teste de interação de dilema com sessão expirada
  let expiredReply = null;
  await handleDilemmaInteraction({
    customId: 'work_dil:accept:expired_user_123',
    user: { id: 'expired_user_123' },
    reply: (payload) => { expiredReply = payload; },
  });
  assert.ok(expiredReply && expiredReply.flags === 64, 'Interação de dilema com sessão expirada deve ser rejeitada como efêmera.');

  // 19.4 Teste de Aceitar Esquema (accept)
  const dilWorkerId = `test_dil_worker_${Date.now()}`;
  setUserBalance(dilWorkerId, 100);
  activeDilemmaSessions.set(dilWorkerId, {
    userId: dilWorkerId,
    professionKey: 'programador',
    professionLabel: 'Programador Mágico',
    baseSalary: 45,
    startedAt: Date.now(),
    lang: 'pt',
  });

  let acceptOutcomePayload = null;
  await handleDilemmaInteraction({
    customId: `work_dil:accept:${dilWorkerId}`,
    user: { id: dilWorkerId },
    message: {
      components: [
        {
          components: [
            { data: { customId: 'btn1', disabled: true } },
          ],
        },
      ],
    },
    update: (payload) => { acceptOutcomePayload = payload; },
  });

  assert.ok(acceptOutcomePayload, 'Payload de resolução do dilema deve ser retornado.');
  assert.ok(acceptOutcomePayload.embeds && acceptOutcomePayload.embeds.length > 0, 'Deve retornar embed com o desfecho.');
  assert.equal(acceptOutcomePayload.embeds[0].data.footer.text, 'Pyxie', 'Embed deve conter footer da Pyxie.');
  assert.ok(acceptOutcomePayload.components && acceptOutcomePayload.components.length >= 2, 'Deve conter botões anteriores e botões de dilema desabilitados.');
  const dilemmaButtons = acceptOutcomePayload.components[1].components;
  assert.equal(dilemmaButtons[0].data.disabled, true, 'Botão de aceitar deve estar desabilitado.');
  assert.equal(dilemmaButtons[1].data.disabled, true, 'Botão de denunciar deve estar desabilitado.');
  assert.equal(activeDilemmaSessions.has(dilWorkerId), false, 'Sessão de dilema deve ser removida após resolução.');

  // 19.5 Teste de Denunciar ao Conselho (report)
  const reportWorkerId = `test_report_worker_${Date.now()}`;
  setUserBalance(reportWorkerId, 100);
  activeDilemmaSessions.set(reportWorkerId, {
    userId: reportWorkerId,
    professionKey: 'mago',
    professionLabel: 'Arcane Mage',
    baseSalary: 50,
    startedAt: Date.now(),
    lang: 'en',
  });

  let reportOutcomePayload = null;
  await handleDilemmaInteraction({
    customId: `work_dil:report:${reportWorkerId}`,
    user: { id: reportWorkerId },
    message: { components: [] },
    update: (payload) => { reportOutcomePayload = payload; },
  });

  assert.ok(reportOutcomePayload, 'Payload de denúncia ao conselho deve ser retornado.');
  assert.ok(reportOutcomePayload.embeds && reportOutcomePayload.embeds.length > 0);
  const repButtons = reportOutcomePayload.components[0].components;
  assert.equal(repButtons[1].data.disabled, true);
  assert.equal(repButtons[1].data.style, 3, 'Botão de report deve estar estilizado como Success (3).');
  assert.equal(activeDilemmaSessions.has(reportWorkerId), false);

  // 19.6 Teste de Conclusão de Projeto (3/3) durante Dilema Moral com Liberação de Envelopes
  const dilEnvWorkerId = `test_dil_env_worker_${Date.now()}`;
  setUserBalance(dilEnvWorkerId, 50);
  updateWorkerAcc(dilEnvWorkerId, (acc) => { acc.projectProgress = 2; });

  activeDilemmaSessions.set(dilEnvWorkerId, {
    userId: dilEnvWorkerId,
    professionKey: 'alquimista',
    professionLabel: 'Alquimista',
    baseSalary: 40,
    startedAt: Date.now(),
    isGoldenShift: true,
    isFastResponse: true,
    masteryBonusPercent: 6,
    lang: 'pt',
  });

  let dilEnvPayload = null;
  await handleDilemmaInteraction({
    customId: `work_dil:report:${dilEnvWorkerId}`,
    user: { id: dilEnvWorkerId },
    message: {
      components: [
        { components: [{ data: { customId: 'btn_ans', disabled: true } }] },
      ],
    },
    update: (payload) => { dilEnvPayload = payload; },
  });

  assert.ok(dilEnvPayload, 'Payload deve ser retornado.');
  const dilEnvDesc = dilEnvPayload.embeds[0].data.description;
  assert.ok(dilEnvDesc.includes('Demanda de Alta Demanda') || dilEnvDesc.includes('Turno de Alta Demanda') || dilEnvDesc.includes('Demanda VIP'), 'Deve exibir badge de Golden Shift.');
  assert.ok(dilEnvDesc.includes('Resposta Rápida') || dilEnvDesc.includes('Fast Response'), 'Deve exibir badge de Resposta Rápida.');
  assert.ok(dilEnvDesc.includes('Projeto da Carreira') || dilEnvDesc.includes('Career Project'), 'Deve exibir barra de projeto.');
  assert.ok(dilEnvDesc.includes('[███] 3/3'), 'Deve exibir 3/3 concluído.');

  // Verifica se gerou a linha de envelopes (Row 0: ans, Row 1: dilemma, Row 2: envelopes)
  assert.equal(dilEnvPayload.components.length, 3, 'Deve conter 3 ActionRows.');
  assert.ok(trabalhoCommand.activeEnvelopeSessions.has(dilEnvWorkerId), 'Sessão de envelopes deve estar ativa para o usuário do dilema.');

  // Resgata o Envelope A
  let chosenEnvPayload = null;
  await trabalhoCommand.handleWorkInteraction({
    customId: `work_env:A:${dilEnvWorkerId}`,
    user: { id: dilEnvWorkerId },
    message: {
      embeds: dilEnvPayload.embeds,
      components: dilEnvPayload.components,
    },
    update: (payload) => { chosenEnvPayload = payload; },
  });

  assert.ok(chosenEnvPayload, 'Payload pós-envelope retornado.');
  assert.equal(chosenEnvPayload.components.length, 3, 'Deve preservar as 3 ActionRows intactas.');
  assert.equal(chosenEnvPayload.components[2].components[0].data.disabled, true, 'Envelopes devem estar desabilitados.');
  assert.equal(trabalhoCommand.activeEnvelopeSessions.has(dilEnvWorkerId), false, 'Sessão de envelope consumida.');

  // Teste de Baralho Anti-Repetição (Deck Shuffle / No-Repeat Window) para Desenvolvedor de Jogos
  const { setProfession: setProfLocal, updateUserAccount: updateAccLocal } = require('../src/services/economy');
  const devWorkerId = 'dev_antirepeat_tester';
  setProfLocal(devWorkerId, 'desenvolvedor_jogos');

  const chosenKeys = [];
  for (let shift = 1; shift <= 10; shift++) {
    let capturedPayload = null;
    // Bypassa cooldown resetando lastWorkAt para testar rotação contínua
    updateAccLocal(devWorkerId, (acc) => { acc.lastWorkAt = null; });
    await trabalhoCommand.executePrefix({
      message: {
        author: { id: devWorkerId },
        guild: { id: 'test_guild' },
        reply: (payload) => { capturedPayload = payload; },
      },
    });

    assert.ok(capturedPayload, `Turno ${shift} deve gerar payload`);
    const session = trabalhoCommand.activeWorkSessions.get(devWorkerId);
    assert.ok(session && session.questionKey, `Turno ${shift} deve registrar questionKey na sessão`);
    chosenKeys.push(session.questionKey);
  }

  // Verifica que em 10 turnos sucessivos não houve repetição consecutiva
  for (let i = 1; i < chosenKeys.length; i++) {
    assert.notEqual(chosenKeys[i], chosenKeys[i - 1], `Questão no turno ${i + 1} não pode ser idêntica à do turno ${i}`);
  }
  const uniqueCount = new Set(chosenKeys).size;
  assert.ok(uniqueCount >= 8, `De 10 turnos, deve sortear pelo menos 8 questões distintas (obtido: ${uniqueCount})`);

})().then(() => {
  console.log('Verificação dos comandos leves, convite bilíngue e desafios de trabalho em PT/EN: OK');
  console.log('Verificação do Quiz Cultural (600 Questões, 10 Moedas/Questão, Cooldown 3h e Tiers): OK');
  fs.writeFileSync(economyFile, originalEconomy, 'utf8');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  fs.writeFileSync(economyFile, originalEconomy, 'utf8');
  process.exit(1);
});
} catch (e) {
  fs.writeFileSync(economyFile, originalEconomy, 'utf8');
  process.exit(1);
}



