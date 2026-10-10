const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Isola o arquivo de dados durante o teste
const testMarriageDataFile = path.join(__dirname, 'marriageData.test.json');
const testEconomyFile = path.join(__dirname, '..', 'data', 'economy.json');
process.env.MARRIAGE_DATA_PATH = testMarriageDataFile;

const marriageManager = require('../src/modules/marriage/marriageManager');
const {
  setUserBalance,
  getBalance,
  addMagicBeans,
  getMagicBeans,
} = require('../src/services/economy');
const dateQuestions = require('../src/modules/marriage/dateQuestions');
const { playChildBirthAnimation } = require('../src/modules/marriage/marriageAnimations');

console.log('💍 Iniciando suíte de testes de Engenharia: Módulo Matrimônio & Família (Marriage Core)...');

try {
  // Limpa estado anterior do teste
  if (fs.existsSync(testMarriageDataFile)) fs.unlinkSync(testMarriageDataFile);

  const userA = 'user_marry_alice_1';
  const userB = 'user_marry_bob_2';

  // Configura saldos iniciais
  setUserBalance(userA, 5000);
  setUserBalance(userB, 5000);
  addMagicBeans(userA, 5);
  addMagicBeans(userB, 5);

  // 1. Banco de Perguntas Date Night
  assert.equal(dateQuestions.length, 400, 'Banco generativo deve conter exatamente 400 perguntas');
  const sampleQ = marriageManager.getRandomDateQuestion();
  assert.ok(sampleQ.question.pt && sampleQ.question.en, 'Pergunta deve ter paridade bilíngue PT e EN');
  assert.equal(sampleQ.options.pt.length, 3, 'Pergunta PT deve ter 3 opções');
  assert.equal(sampleQ.options.en.length, 3, 'Pergunta EN deve ter 3 opções');
  console.log('  ✅ 1. Banco generativo com 400 questões bilíngues e 3 opções validado.');

  // 2. Proposta e Celebração do Casamento
  const prop = marriageManager.createMarriageProposal(userA, userB, 'guild_test_1');
  assert.equal(prop.created, true, 'Proposta de casamento deve ser criada com sucesso');
  assert.ok(prop.id, 'Proposta deve possuir ID único');

  // Resolução aceita pelo cônjuge B
  const resolveRes = marriageManager.resolveMarriageProposal(prop.id, userB, true);
  assert.equal(resolveRes.resolved, true, 'Proposta deve ser resolvida');
  assert.equal(resolveRes.accepted, true, 'Proposta deve ser aceita');

  const marriage = marriageManager.getMarriage(userA);
  assert.ok(marriage, 'Casamento deve existir para userA');
  assert.equal(marriage.loveBar, 100, 'Barra do Amor inicial deve ser 100%');
  assert.equal(marriageManager.getSpouseId(userA), userB, 'Cônjuge de userA deve ser userB');
  assert.equal(marriageManager.getSpouseId(userB), userA, 'Cônjuge de userB deve ser userA');
  console.log('  ✅ 2. Criação matrimonial com Barra do Amor a 100% e IDs bilaterais validada.');

  // 3. Decaimento Preguiçoso (Lazy Decay)
  // Simula passagem de 3 dias (72h sem carinho/interação: 3 x 20% = -60%)
  const dbData = marriageManager.readData();
  dbData.marriages[marriage.id].lastLoveDecay = Date.now() - 3 * 86400000;
  marriageManager.writeData(dbData);

  const marDecayed = marriageManager.getMarriage(userA);
  assert.equal(marDecayed.loveBar, 40, 'Após 72h (3 dias), amor deve cair para 40% (100 - 60)');
  console.log('  ✅ 3. Decaimento Preguiçoso (Lazy Decay de 20%/dia) validado sob demanda.');

  // 4. Árvore da Vida e Financiamento Bilateral
  // Usuário A paga 1 Feijão Mágico, e a Árvore desbloqueia para AMBOS
  const treeUnlock = marriageManager.unlockSharedFeature(marriage.id, 'treeOfLife', userA, 0, 1);
  assert.equal(treeUnlock.success, true, 'Desbloqueio da Árvore da Vida deve ter sucesso');

  const marAfterTree = marriageManager.getMarriage(userB);
  assert.equal(marAfterTree.treeOfLife.unlocked, true, 'Benefício da Árvore deve estar ativo para o cônjuge B');

  // Cultivo da árvore: concede +10% de amor e entra em cooldown de 12h
  const cult1 = marriageManager.cultivateTree(userB);
  assert.equal(cult1.success, true, 'Cônjuge B deve conseguir cultivar a árvore');
  assert.equal(cult1.newLove, 50, 'Amor deve subir de 40% para 50%');

  // Tentativa durante cooldown deve ser bloqueada para ambos
  const cultCooldownA = marriageManager.cultivateTree(userA);
  assert.equal(cultCooldownA.success, false, 'Cônjuge A deve ser bloqueado durante o cooldown compartilhado');
  assert.equal(cultCooldownA.reason, 'cooldown');
  console.log('  ✅ 4. Árvore da Vida: Desbloqueio bilateral, +10% Amor e Cooldown de 12h validados.');

  // 5. Casa Familiar e Cofre do Amor Eterno
  // Com amor a 50%, userB compra a Casa (custo: 2000 moedas e 2 feijões)
  const initialCoinsB = getBalance(userB);
  const houseUnlock = marriageManager.unlockSharedFeature(marriage.id, 'house', userB, 2000, 2);
  assert.equal(houseUnlock.success, true, 'Compra da Casa Familiar deve ter sucesso');
  assert.equal(getBalance(userB), initialCoinsB - 2000, 'Moedas de userB devem ser debitadas');

  const marAfterHouse = marriageManager.getMarriage(userA);
  assert.equal(marAfterHouse.house.unlocked, true, 'Casa deve estar desbloqueada para userA');

  // Depósito no cofre por userA
  const depRes = marriageManager.depositVault(userA, 1000);
  assert.equal(depRes.success, true, 'Depósito de 1000 moedas deve ser registrado');
  assert.equal(depRes.newBalance, 1000, 'Saldo do cofre deve ser 1000');

  // Resgate de juros diários (Amor atual = 50% -> Rendimento = 1000 * 50% * 5% = 25 moedas)
  const balBeforeInterest = getBalance(userB);
  const claimRes = marriageManager.claimVaultInterest(userB);
  assert.equal(claimRes.success, true, 'Resgate de juros diários deve ser liberado');
  assert.equal(claimRes.yieldAmount, 25, 'Com 50% de amor, o rendimento de 1000 moedas deve ser 25 moedas');
  assert.equal(getBalance(userB), balBeforeInterest + 25, 'Juros devem ser creditados');

  // Tentativa durante o cooldown de 24h
  const claimCooldown = marriageManager.claimVaultInterest(userA);
  assert.equal(claimCooldown.success, false, 'Segundo resgate antes de 24h deve falhar');
  assert.equal(claimCooldown.reason, 'cooldown');
  console.log('  ✅ 5. Casa Familiar & Cofre do Amor Eterno: Depósitos, Juros proporcionais e Cooldown validados.');

  // 6. Date Night (Teste de Sintonia)
  // Simula acerto mútuo (+15% amor e +100 moedas cada)
  const balAStart = getBalance(userA);
  const balBStart = getBalance(userB);
  const dateResMatch = marriageManager.resolveDateNight(marriage.id, true);
  assert.equal(dateResMatch.success, true);
  assert.equal(dateResMatch.match, true);
  assert.equal(dateResMatch.newLove, 65, 'Amor deve subir de 50% para 65%');
  assert.equal(getBalance(userA), balAStart + 100, 'User A deve receber +100 moedas');
  assert.equal(getBalance(userB), balBStart + 100, 'User B deve receber +100 moedas');

  // Cooldown de 12h para novo date
  const dateCheck = marriageManager.canStartDateNight(userA);
  assert.equal(dateCheck.allowed, false, 'Novo Date Night deve respeitar cooldown de 12h');
  console.log('  ✅ 6. Date Night: Resposta em sintonia (+15% amor, +100 moedas para cada) e cooldown validados.');

  // 7. Sistema de Filhos (1º Gratuito, Animação e Limite Máximo de 5)
  const canChild1 = marriageManager.canHaveChild(userA);
  assert.equal(canChild1.allowed, true);
  assert.equal(canChild1.cost, 0, '1º filho deve ser gratuito');

  const addC1 = marriageManager.addChild(marriage.id, { name: 'Luna', gender: 'female' });
  assert.equal(addC1.success, true);
  assert.equal(addC1.child.name, 'Luna');
  assert.equal(addC1.child.gender, 'female');
  assert.equal(addC1.child.status, 'idle');

  // 2º filho: deve custar 800 moedas
  const canChild2 = marriageManager.canHaveChild(userA);
  assert.equal(canChild2.cost, 800, '2º filho deve custar 800 moedas');
  marriageManager.addChild(marriage.id, { name: 'Apollo', gender: 'male' });
  marriageManager.addChild(marriage.id, { name: 'Estela', gender: 'female' });
  marriageManager.addChild(marriage.id, { name: 'Orion', gender: 'male' });
  marriageManager.addChild(marriage.id, { name: 'Maya', gender: 'female' });

  // 6º filho: deve exceder o limite de 5
  const canChild6 = marriageManager.canHaveChild(userA);
  assert.equal(canChild6.allowed, false, '6º filho deve ser bloqueado pelo limite');
  assert.equal(canChild6.reason, 'max_children');
  console.log('  ✅ 7. Sistema de Filhos: 1º gratuito, custo de 800 moedas e limite estrito de 5 filhos validados.');

  // 8. Trava Estrita de Estágio (Job Lock)
  // Envia Luna para estágio de 24h
  const workRes = marriageManager.sendChildToWork(userA, 'Luna');
  assert.equal(workRes.success, true, 'Envio de Luna para estágio deve ter sucesso');
  assert.equal(workRes.child.status, 'working');
  assert.ok(workRes.reward >= 50 && workRes.reward <= 100, 'Recompensa deve estar entre 50 e 100 moedas');
  assert.ok(workRes.busyUntil > Date.now(), 'busyUntil deve ser no futuro');

  // TRAVA DE PROCESSAMENTO: Tentativa de mandar trabalhar novamente enquanto ocupada
  const lockedWork = marriageManager.sendChildToWork(userB, 'Luna');
  assert.equal(lockedWork.success, false, 'Filho trabalhando não pode receber novo comando de trabalho');
  assert.equal(lockedWork.reason, 'job_locked');
  assert.equal(lockedWork.busyUntil, workRes.busyUntil, 'Deve expor busyUntil para formatação de timestamp no Discord');

  // Tentativa de resgate precoce: bloqueado
  const earlyClaim = marriageManager.claimChildReward(userA, 'Luna');
  assert.equal(earlyClaim.success, false, 'Resgate prematuro deve ser bloqueado');
  assert.equal(earlyClaim.reason, 'job_locked');

  // Simula conclusão das 24 horas
  const data = marriageManager.readData();
  const lunaDb = data.marriages[marriage.id].children.find((c) => c.name === 'Luna');
  lunaDb.busyUntil = Date.now() - 1000; // Concluído há 1 segundo
  marriageManager.writeData(data);

  // Resgate bem-sucedido
  const balBeforeClaim = getBalance(userA);
  const finalClaim = marriageManager.claimChildReward(userA, 'Luna');
  assert.equal(finalClaim.success, true, 'Resgate após término deve ter sucesso');
  assert.equal(finalClaim.child.status, 'idle', 'Status de Luna deve voltar para idle');
  assert.equal(finalClaim.child.busyUntil, 0, 'busyUntil deve ser zerado');
  assert.equal(getBalance(userA), balBeforeClaim + finalClaim.reward, 'Salário retido deve ser pago');
  console.log('  ✅ 8. Trava Estrita de Estágio (Job Lock de 24h) e Resgate de Moedas validados.');

  // 9. Divórcio
  const divorceRes = marriageManager.endMarriage(userA);
  assert.equal(divorceRes.ended, true, 'Divórcio deve ser processado');
  assert.equal(marriageManager.getMarriage(userA), null, 'userA não deve mais estar casado');
  assert.equal(marriageManager.getMarriage(userB), null, 'userB não deve mais estar casado');
  console.log('  ✅ 9. Encerramento matrimonial (Divórcio) com limpeza de dados validado.');

  console.log('🎉 Todos os testes de Engenharia do Módulo Matrimônio & Família passaram com 100% de integridade!');
} finally {
  if (fs.existsSync(testMarriageDataFile)) {
    fs.unlinkSync(testMarriageDataFile);
  }
}
