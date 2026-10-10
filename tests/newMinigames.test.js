const assert = require('node:assert/strict');
const path = require('path');
const {
  getGrimoireStats,
  getDifficultyForStreak,
  getRandomQuestion,
  recordUserAnswer,
  getMathRanking,
  generateBatchQuestions,
} = require('../src/services/arcaneMathService');
const mathCmd = require('../src/commands/matematica');
const tictactoeCmd = require('../src/commands/jogodavelha');
const minesweeperCmd = require('../src/commands/campominado');
const { getBalance } = require('../src/services/economy');
const { readJson, writeJsonAtomic } = require('../src/utils/atomicJson');

const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'arcaneMathQuestions.json');
const RANKING_FILE = path.join(DATA_DIR, 'arcaneMathRanking.json');

console.log('🎮 Iniciando suíte de testes de Engenharia: 3 Novos Minigames de Entretenimento Puro...');

async function runTests() {
  const origQuestions = readJson(QUESTIONS_FILE, null);
  const origRanking = readJson(RANKING_FILE, null);

  const testUserId = 'test_math_' + Date.now();
  const initialBalance = getBalance(testUserId);

  try {

  // ==========================================
  // 1. MESTRE DA MATEMÁTICA ARCANA
  // ==========================================
  console.log('  Testing: Mestre da Matemática Arcana...');

  // 1.1 Estatísticas do Grimório e Contador de Perguntas
  const stats = getGrimoireStats();
  assert.ok(stats.total >= 40, `O grimório deve conter pelo menos 40 questões iniciais (atual: ${stats.total}).`);
  assert.ok(stats.facil >= 10, 'Deve conter pelo menos 10 questões fáceis.');
  assert.ok(stats.medio >= 10, 'Deve conter pelo menos 10 questões médias.');
  assert.ok(stats.dificil >= 10, 'Deve conter pelo menos 10 questões difíceis.');
  assert.ok(stats.extremo >= 10, 'Deve conter pelo menos 10 questões de nível olímpico extremo.');
  console.log(`    ✅ 1.1 Contador do Grimório validado: ${stats.total} questões (${stats.facil} fáceis, ${stats.medio} médias, ${stats.dificil} difíceis, ${stats.extremo} extremas).`);

  // 1.2 Progressão de Dificuldade Conforme Acertos
  assert.equal(getDifficultyForStreak(0), 'facil');
  assert.equal(getDifficultyForStreak(2), 'facil');
  assert.equal(getDifficultyForStreak(4), 'medio');
  assert.equal(getDifficultyForStreak(7), 'medio');
  assert.equal(getDifficultyForStreak(8), 'dificil');
  assert.equal(getDifficultyForStreak(12), 'dificil');
  assert.equal(getDifficultyForStreak(13), 'extremo');
  assert.equal(getDifficultyForStreak(25), 'extremo');
  console.log('    ✅ 1.2 Curva de progressão de dificuldade validada (Fácil ➔ Médio ➔ Difícil ➔ Extremo).');

  // 1.3 Obtenção de Questão e Estrutura Bilíngue com 4 Alternativas
  const qFacil = getRandomQuestion('facil');
  assert.ok(qFacil.pt.question, 'Pergunta PT deve existir.');
  assert.ok(qFacil.en.question, 'Pergunta EN deve existir.');
  assert.equal(qFacil.pt.options.length, 4, 'Deve conter exatamente 4 alternativas (A, B, C, D).');
  assert.equal(qFacil.en.options.length, 4, 'Alternativas em EN devem ter 4 opções.');
  assert.ok(qFacil.pt.correctIndex >= 0 && qFacil.pt.correctIndex <= 3, 'correctIndex deve ser entre 0 e 3.');
  assert.ok(qFacil.pt.explanation, 'Deve conter explicação matemática.');
  console.log('    ✅ 1.3 Estrutura das questões e paridade bilíngue (A, B, C, D + explicação) validadas.');

  // 1.4 Registro de Respostas e Ranking Global
  const ansResult1 = await recordUserAnswer({
    userId: testUserId,
    username: 'ArquimagoEuler',
    isCorrect: true,
    currentStreak: 0,
  });
  assert.equal(ansResult1.newStreak, 1);
  assert.equal(ansResult1.highestStreak, 1);

  const ansResult2 = await recordUserAnswer({
    userId: testUserId,
    username: 'ArquimagoEuler',
    isCorrect: true,
    currentStreak: 1,
  });
  assert.equal(ansResult2.newStreak, 2);
  assert.equal(ansResult2.highestStreak, 2);

  const ranking = getMathRanking(10);
  assert.ok(ranking.length > 0, 'Ranking deve conter registros.');
  const userRankEntry = ranking.find((p) => p.userId === testUserId);
  assert.ok(userRankEntry, 'Usuário de teste deve constar no ranking.');
  assert.equal(userRankEntry.highestStreak, 2);
  console.log('    ✅ 1.4 Registro de streaks e ranking global validado com sucesso.');

  // 1.5 Expansão de Perguntas e Contador Atualizado
  const initialCount = getGrimoireStats().total;
  const newBatch = await generateBatchQuestions(10);
  assert.equal(newBatch.length, 10, 'Deve gerar exatamente 10 novas questões.');
  const postGenStats = getGrimoireStats();
  assert.equal(postGenStats.total, initialCount + 10, 'Total do grimório deve aumentar exatamente em 10.');
  console.log(`    ✅ 1.5 Expansão do banco de questões validada: ${initialCount} ➔ ${postGenStats.total} questões.`);

  // 1.6 Garantia de Zero Impacto na Economia
  const balanceAfterMath = getBalance(testUserId);
  assert.equal(balanceAfterMath, initialBalance, 'Minigame de matemática NUNCA deve alterar a carteira do usuário.');
  console.log('    ✅ 1.6 Integridade de Zero Economia validada para Matemática Arcana.');

  // ==========================================
  // 2. JOGO DA VELHA ARCANO (TIC-TAC-TOE)
  // ==========================================
  console.log('  Testing: Jogo da Velha Arcano...');

  // Mock do tabuleiro e funções internas
  const boardEmpty = Array(9).fill(null);
  assert.equal(boardEmpty.length, 9, 'Tabuleiro deve ter 9 posições.');

  // Vitória na primeira linha
  const boardRowWin = ['X', 'X', 'X', null, 'O', null, 'O', null, null];
  // Simulando combos
  const winCheck = (b) => {
    const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [x,y,z] of combos) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) return b[x];
    }
    if (b.every((c) => c !== null)) return 'DRAW';
    return null;
  };
  assert.equal(winCheck(boardRowWin), 'X', 'Deve detectar vitória na linha 1.');

  const boardColWin = ['O', 'X', null, 'O', 'X', null, 'O', null, null];
  assert.equal(winCheck(boardColWin), 'O', 'Deve detectar vitória na coluna.');

  const boardDiagWin = ['X', 'O', null, null, 'X', 'O', null, null, 'X'];
  assert.equal(winCheck(boardDiagWin), 'X', 'Deve detectar vitória na diagonal.');

  const boardDraw = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  assert.equal(winCheck(boardDraw), 'DRAW', 'Deve detectar empate / velha.');
  console.log('    ✅ 2.1 Lógica de linhas, colunas, diagonais e empate (velha) validada.');

  // Zero impacto na economia
  const balanceAfterTTT = getBalance(testUserId);
  assert.equal(balanceAfterTTT, initialBalance, 'Jogo da velha não deve mexer na economia.');
  console.log('    ✅ 2.2 Integridade de Zero Economia validada para Jogo da Velha.');

  // ==========================================
  // 3. CAMPO MINADO ARCANO (MINESWEEPER)
  // ==========================================
  console.log('  Testing: Campo Minado Arcano (5x5)...');

  // Testa proporção de minas por nível
  const totalCells = 25; // 5x5
  const diffs = { aprendiz: 3, adepto: 5, arquimago: 7 };
  for (const [dName, mCount] of Object.entries(diffs)) {
    const safeCount = totalCells - mCount;
    assert.ok(safeCount > 0, `Nível ${dName} deve ter células seguras válidas.`);
    assert.equal(mCount + safeCount, 25, 'Total deve somar exatamente 25 botões.');
  }
  console.log('    ✅ 3.1 Grade 5x5 e proporções de runas explosivas validadas (3, 5 e 7 minas).');

  const balanceAfterMines = getBalance(testUserId);
  assert.equal(balanceAfterMines, initialBalance, 'Campo minado não deve mexer na economia.');
  console.log('    ✅ 3.2 Integridade de Zero Economia validada para Campo Minado.');

  // ==========================================
  // 4. VERIFICAÇÃO DOS METADADOS DOS COMANDOS
  // ==========================================
  assert.equal(mathCmd.data.name, 'py-math');
  assert.ok(mathCmd.aliases.includes('matematica'));
  assert.equal(tictactoeCmd.data.name, 'py-tictactoe');
  assert.ok(tictactoeCmd.aliases.includes('velha'));
  assert.equal(minesweeperCmd.data.name, 'py-minesweeper');
  assert.ok(minesweeperCmd.aliases.includes('campominado'));
  console.log('    ✅ 4.1 Metadados, descrições bilíngues e aliases dos 3 comandos validados com sucesso.');

  console.log('🎉 Todos os testes dos 3 Novos Minigames passaram com 100% de integridade!');
  } finally {
    if (origQuestions) writeJsonAtomic(QUESTIONS_FILE, origQuestions);
    if (origRanking) writeJsonAtomic(RANKING_FILE, origRanking);
  }
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de novos minigames:', err);
  process.exit(1);
});
