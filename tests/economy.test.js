const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const economyFile = path.join(__dirname, '..', 'data', 'economy.json');
const settingsFile = path.join(__dirname, '..', 'data', 'settings.json');
const marriageFile = path.join(__dirname, '..', 'data', 'marriages.json');
const originalEconomy = fs.existsSync(economyFile) ? fs.readFileSync(economyFile, 'utf8') : '{}';
const originalSettings = fs.readFileSync(settingsFile, 'utf8');
const originalMarriage = fs.existsSync(marriageFile) ? fs.readFileSync(marriageFile, 'utf8') : null;

const { setEconomyConfig } = require('../src/services/database');
const {
  claimDaily,
  getBalance,
  getMagicBeans,
  addMagicBeans,
  spendMagicBeans,
  getCurrencyBalances,
  getDailyStatus,
  getUserRank,
  finishWork,
  getWorkStatus,
  getCareerLevel,
  setCareerLevel,
  resetUserEconomy,
  setProfession,
  setUserBalance,
  spendCoins,
  startWork,
  getTitlesCatalog,
  getUserTitles,
  buyTitle,
  equipTitle,
  unequipTitle,
  setUserBio,
  getUserAccount,
  getRanking,
  registerUserVote,
  hasActiveVote,
  resolveCorruptionDilemma,
  startQuiz,
  recordQuizQuestion,
} = require('../src/services/economy');
const { createMarriageRequest, endMarriage, getSpouseId, resolveMarriageRequest } = require('../src/services/marriage');

try {
  fs.writeFileSync(economyFile, '{}', 'utf8');
  setEconomyConfig(10, 10);

  const firstClaim = claimDaily('economy-test-user', Date.parse('2026-01-01T00:00:00.000Z'));
  assert.equal(firstClaim.claimed, true, 'O primeiro daily deve ser aceito.');
  assert.equal(firstClaim.amount, 10, 'O daily deve respeitar o mínimo e máximo configurados.');
  assert.equal(getBalance('economy-test-user'), 11, 'O saldo deve ser persistido (10 do diário + 1 do primeiro dia da sequência).');

  const secondClaim = claimDaily('economy-test-user', Date.parse('2026-01-01T12:00:00.000Z'));
  assert.equal(secondClaim.claimed, false, 'O segundo daily antes de 24h deve ser bloqueado.');

  const afterCooldown = claimDaily('economy-test-user', Date.parse('2026-01-02T00:00:00.000Z'));
  assert.equal(afterCooldown.claimed, true, 'O daily deve voltar após 24h.');
  assert.equal(getUserRank('economy-test-user').position, 1, 'O usuário deve aparecer no ranking.');
  assert.equal(getDailyStatus('economy-test-user', Date.parse('2026-01-02T01:00:00.000Z')).available, false);

  fs.writeFileSync(economyFile, JSON.stringify({ 'string-balance': { coins: '150', lastDailyAt: null } }), 'utf8');
  setEconomyConfig(1, 1);
  const stringBalanceClaim = claimDaily('string-balance', Date.parse('2026-01-01T00:00:00.000Z'));
  assert.equal(stringBalanceClaim.balance, 152, 'O diário deve tratar saldos persistidos como números (1 + 1 da sequência).');
  assert.equal(getBalance('string-balance'), 152, 'O saldo não deve concatenar a recompensa como texto.');

  fs.writeFileSync(economyFile, JSON.stringify({ proposer: { coins: 1200, lastDailyAt: null } }), 'utf8');
  assert.equal(getCurrencyBalances('proposer')[0].label, 'Moedinhas');
  assert.equal(getCurrencyBalances('proposer')[1].label, 'Feijões Mágicos');
  const request = createMarriageRequest('proposer', 'recipient', 'test-guild');
  assert.equal(request.created, true, 'O pedido de casamento deve ser criado.');
  assert.equal(spendCoins('proposer', 1000).spent, true, 'O pedido deve cobrar 1000 Moedinhas.');
  assert.equal(getBalance('proposer'), 200, 'O saldo deve descontar o custo do casamento.');
  assert.equal(resolveMarriageRequest(request.id, 'recipient', true).resolved, true, 'O destinatário deve poder aceitar.');
  assert.equal(getSpouseId('proposer'), 'recipient', 'O vínculo deve ser salvo para quem solicitou.');
  assert.equal(getSpouseId('recipient'), 'proposer', 'O vínculo deve ser salvo para quem aceitou.');
  setUserBalance('proposer', 700);
  assert.equal(spendCoins('proposer', 500).spent, true, 'O divórcio deve cobrar 500 Moedinhas.');
  assert.equal(endMarriage('proposer').ended, true, 'O casamento deve ser encerrado.');
  assert.equal(getSpouseId('proposer'), null, 'O vínculo de quem pediu o divórcio deve ser removido.');
  assert.equal(getSpouseId('recipient'), null, 'O vínculo do cônjuge também deve ser removido.');

  setUserBalance('admin-target', 500);
  const cooldownAccount = JSON.parse(fs.readFileSync(economyFile, 'utf8'))['admin-target'];
  cooldownAccount.lastDailyAt = '2026-01-02T00:00:00.000Z';
  fs.writeFileSync(economyFile, JSON.stringify({ ...JSON.parse(fs.readFileSync(economyFile, 'utf8')), 'admin-target': cooldownAccount }), 'utf8');
  setUserBalance('admin-target', 900);
  assert.equal(getDailyStatus('admin-target', Date.parse('2026-01-02T01:00:00.000Z')).available, false, 'Setar saldo deve preservar o cooldown.');
  resetUserEconomy('admin-target');
  assert.equal(getBalance('admin-target'), 0, 'Resetar economia deve zerar o saldo.');
  assert.equal(getMagicBeans('admin-target'), 0, 'Resetar economia deve zerar os feijões mágicos.');
  assert.equal(getDailyStatus('admin-target').available, true, 'Resetar economia deve liberar o diário.');

  // Testes de Feijões Mágicos & Títulos
  assert.equal(getMagicBeans('beans-user'), 0, 'Saldo inicial de feijões deve ser 0.');
  addMagicBeans('beans-user', 5);
  assert.equal(getMagicBeans('beans-user'), 5, 'Deve creditar 5 feijões mágicos.');
  assert.equal(spendMagicBeans('beans-user', 2).spent, true, 'Deve gastar 2 feijões.');
  assert.equal(getMagicBeans('beans-user'), 3, 'Saldo deve ser 3 feijões.');
  assert.equal(spendMagicBeans('beans-user', 10).spent, false, 'Não deve permitir saldo negativo de feijões.');

  const titlesCatalog = getTitlesCatalog();
  assert.ok(titlesCatalog.cultivador, 'O título cultivador deve existir.');
  assert.equal(titlesCatalog.cultivador.cost, 1, 'Cultivador deve custar 1 feijão.');

  const buyRes = buyTitle('beans-user', 'cultivador');
  assert.equal(buyRes.success, true, 'Compra de título deve ser bem-sucedida.');
  assert.equal(getUserAccount('beans-user').equippedTitle, 'cultivador', 'Título recém-adquirido deve ser equipado.');
  assert.equal(getUserTitles('beans-user').includes('cultivador'), true, 'Título deve constar na lista de possuídos.');
  assert.equal(getMagicBeans('beans-user'), 2, 'Deve debitar 1 feijão (3 - 1 = 2).');

  unequipTitle('beans-user');
  assert.equal(getUserAccount('beans-user').equippedTitle, null, 'Desequipar título deve limpar o campo.');
  equipTitle('beans-user', 'cultivador');
  assert.equal(getUserAccount('beans-user').equippedTitle, 'cultivador', 'Equipar título possuído deve funcionar.');

  setUserBio('beans-user', 'Colecionador de riquezas e mestre dos negócios.');
  assert.equal(getUserAccount('beans-user').bio, 'Colecionador de riquezas e mestre dos negócios.', 'Biografia deve ser salva corretamente.');
  setUserBio('beans-user', '   ');
  assert.equal(getUserAccount('beans-user').bio, null, 'Biografia vazia deve ser redefinida para null.');

  const firstProfession = setProfession('worker', 'agricultor');
  assert.equal(firstProfession.changed, true, 'A primeira profissão deve ser gratuita.');
  setUserBalance('worker', 60);
  const changedProfession = setProfession('worker', 'programador');
  assert.equal(changedProfession.charged, 50, 'A troca de profissão deve custar 50 Moedinhas.');
  const work = startWork('worker', { profession: 'programador' }, Date.parse('2026-01-03T00:00:00.000Z'));
  assert.equal(work.started, true, 'O trabalho deve iniciar quando o cooldown estiver disponível.');
  assert.equal(work.workCount, 0, 'O trabalho não deve incrementar o contador antes de concluído com sucesso.');
  assert.equal(getWorkStatus('worker', Date.parse('2026-01-03T01:00:00.000Z')).available, false, 'O trabalho deve ter cooldown de 3 horas.');

  const workFinish = finishWork('worker', true, 35, true);
  assert.equal(workFinish.amount, 35, 'O trabalho concluído deve pagar o salário.');
  assert.equal(workFinish.workCount, 1, 'O trabalho concluído com sucesso deve incrementar o contador.');
  assert.equal(getUserAccount('worker').workCount, 1, 'Conta deve ter 1 trabalho registrado.');
  assert.equal(workFinish.bonusBean, true, 'O bônus de feijão mágico deve ser registrado.');
  assert.equal(getMagicBeans('worker'), 1, 'Trabalhador deve ter recebido 1 feijão de bônus.');

  // Testes de Progressão de Carreira: Metas Garantidas por Expedientes Concluídos
  const promoWorker = 'promo-worker-1';
  setProfession(promoWorker, 'programador', 0);
  setCareerLevel(promoWorker, 1);
  // Simula 9 expedientes prévios
  const { updateUserAccount } = require('../src/services/economy');
  updateUserAccount(promoWorker, (acc) => { acc.workCount = 9; });
  // O 10º expediente garante promoção para o Nível 2
  const promoResult = finishWork(promoWorker, true, 30);
  assert.equal(promoResult.workCount, 10, 'Deve ter completado 10 expedientes.');
  assert.equal(promoResult.promoted, true, 'Deve ser promovido com 10 expedientes garantidos.');
  assert.equal(promoResult.careerLevel, 2, 'Novo cargo deve ser Nível 2.');

  // Teste de Promoção Garantida por Sequência de Acertos (Streak de 5 no Nível 1)
  const streakWorker = 'streak-worker-1';
  setProfession(streakWorker, 'psicologo', 0);
  setCareerLevel(streakWorker, 1);
  updateUserAccount(streakWorker, (acc) => { acc.workCount = 0; acc.careerStreak = 4; });
  const streakPromo = finishWork(streakWorker, true, 25);
  assert.equal(streakPromo.promoted, true, 'Deve ser promovido ao atingir streak de 5 no Nível 1.');
  assert.equal(streakPromo.careerLevel, 2, 'Cargo promovido para Nível 2.');
  assert.equal(streakPromo.careerStreak, 0, 'Sequência deve resetar após promoção.');

  // Teste de Proteção contra Rebaixamento Injusto (1 e 2 erros não rebaixam)
  const safeWorker = 'safe-worker-1';
  setProfession(safeWorker, 'desenvolvedor_jogos', 0);
  setCareerLevel(safeWorker, 2);
  const fail1 = finishWork(safeWorker, false, 0);
  assert.equal(fail1.demoted, false, '1º erro nunca deve rebaixar o usuário.');
  assert.equal(fail1.careerMistakes, 1, 'Deve registrar 1 erro.');
  assert.equal(fail1.careerLevel, 2, 'Deve manter o Nível 2.');
  const fail2 = finishWork(safeWorker, false, 0);
  assert.equal(fail2.demoted, false, '2º erro consecutivo não deve rebaixar.');
  assert.equal(fail2.careerMistakes, 2, 'Deve registrar 2 erros.');
  assert.equal(fail2.careerLevel, 2, 'Deve manter o Nível 2.');

  // Erros acumulados excessivos (5 seguidos) garantem rebaixamento com justiça
  updateUserAccount(safeWorker, (acc) => { acc.careerMistakes = 4; });
  const failGuaranteed = finishWork(safeWorker, false, 0);
  assert.equal(failGuaranteed.demoted, true, '5º erro consecutivo deve rebaixar para Nível 1.');
  assert.equal(failGuaranteed.careerLevel, 1, 'Nível rebaixado para 1.');
  assert.equal(failGuaranteed.careerMistakes, 0, 'Erros devem ser zerados após rebaixamento.');

  // Teste da Barra de Projeto de 3 Turnos (Efeito Zeigarnik: 0 -> 1 -> 2 -> 0)
  const zeigWorker = 'zeigarnik-worker-1';
  setProfession(zeigWorker, 'programador', 0);
  updateUserAccount(zeigWorker, (acc) => { acc.projectProgress = 0; });

  const shift1 = finishWork(zeigWorker, true, 20);
  assert.equal(shift1.projectProgress, 1, 'Após 1º acerto, projectProgress deve ser 1.');
  assert.equal(shift1.projectProgressDisplay, 1, 'Display deve indicar 1/3.');
  assert.equal(shift1.projectCompleted, false, 'Projeto ainda não deve estar concluído.');

  // Erro não altera nem reseta o progresso
  const shiftFail = finishWork(zeigWorker, false, 5);
  assert.equal(shiftFail.projectProgress, 1, 'Erro não deve alterar projectProgress.');
  assert.equal(getUserAccount(zeigWorker).projectProgress, 1, 'Conta deve reter projectProgress = 1 após erro.');

  const shift2 = finishWork(zeigWorker, true, 20);
  assert.equal(shift2.projectProgress, 2, 'Após 2º acerto, projectProgress deve ser 2.');
  assert.equal(shift2.projectProgressDisplay, 2, 'Display deve indicar 2/3.');
  assert.equal(shift2.projectCompleted, false, 'Projeto ainda não deve estar concluído.');

  const shift3 = finishWork(zeigWorker, true, 20);
  assert.equal(shift3.projectProgress, 0, 'Após 3º acerto, projectProgress deve resetar para 0.');
  assert.equal(shift3.projectProgressDisplay, 3, 'Display deve indicar 3/3.');
  assert.equal(shift3.projectCompleted, true, 'projectCompleted deve ser true.');
  assert.equal(getUserAccount(zeigWorker).projectProgress, 0, 'Conta deve ter projectProgress resetado para 0.');

  // Teste de claimProjectBonus (Moedas e Feijões Mágicos)
  const { claimProjectBonus } = require('../src/services/economy');
  const bonusCoins = claimProjectBonus(zeigWorker, { type: 'coins', amount: 75 });
  assert.ok(bonusCoins.balance >= 75, 'Bônus de moedas deve ser creditado com sucesso.');
  const bonusBeans = claimProjectBonus(zeigWorker, { type: 'beans', amount: 1 });
  assert.ok(bonusBeans.magicBeans >= 1, 'Bônus de Feijão Mágico deve ser creditado com sucesso.');

  // Testes do Sistema de Maestria de Carreira (Currículo Lendário)
  const { getMasteryBonusPercent, getUserMasteredProfessions } = require('../src/services/economy');
  const masterWorker = 'master-worker-1';
  setProfession(masterWorker, 'programador', 0);
  assert.equal(getMasteryBonusPercent(masterWorker), 0, 'Usuário sem maestria deve ter 0% de bônus.');
  assert.deepEqual(getUserMasteredProfessions(masterWorker), [], 'Lista de dominadas deve começar vazia.');

  // Promoção ao Nível 4 adiciona à lista de maestria
  setCareerLevel(masterWorker, 4);
  assert.deepEqual(getUserMasteredProfessions(masterWorker), ['programador'], 'Nível 4 deve adicionar a profissão a masteredProfessions.');
  assert.equal(getMasteryBonusPercent(masterWorker), 3, '1 profissão dominada concede +3% de bônus.');

  // Concluir expediente já no Nível 4 não duplica
  const shiftLevel4 = finishWork(masterWorker, true, 40);
  assert.deepEqual(getUserMasteredProfessions(masterWorker), ['programador'], 'Não deve duplicar profissão já dominada.');
  assert.equal(shiftLevel4.newlyMastered, false, 'newlyMastered deve ser false se já estava dominada.');

  // Troca de profissão redefine careerLevel para 1, mas preserva masteredProfessions
  setProfession(masterWorker, 'cozinheiro', 0);
  assert.equal(getCareerLevel(masterWorker), 1, 'Troca de profissão deve redefinir careerLevel para 1.');
  assert.deepEqual(getUserMasteredProfessions(masterWorker), ['programador'], 'masteredProfessions deve ser preservado após troca.');

  // Domina a 2ª profissão (cozinheiro)
  setCareerLevel(masterWorker, 4);
  assert.equal(getUserMasteredProfessions(masterWorker).length, 2, 'Deve ter 2 profissões dominadas.');
  assert.equal(getMasteryBonusPercent(masterWorker), 6, '2 profissões dominadas concedem +6% de bônus.');

  // Simula 16 profissões dominadas para testar o teto de 45%
  updateUserAccount(masterWorker, (acc) => {
    acc.masteredProfessions = [
      'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8',
      'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16'
    ];
  });
  assert.equal(getMasteryBonusPercent(masterWorker), 45, 'O bônus de maestria deve ser limitado no teto de +45%.');

  // Testes de Profissões Mágicas & Gênero Inclusivo
  const professionsData = require('../src/services/professions');
  const { getRoleTitle } = require('../src/services/careerHierarchy');

  assert.equal(professionsData.advogada.label, 'Advogado(a)', 'Advogado deve ter rótulo para ambos os gêneros.');
  assert.equal(getRoleTitle('advogada', 1, 'pt'), 'Estagiário(a) de Direito / Paralegal', 'Cargo de nível 1 deve ser de ambos os gêneros.');
  assert.equal(getRoleTitle('advogada', 2, 'pt'), 'Advogado(a) Júnior', 'Cargo de nível 2 deve ser de ambos os gêneros.');

  const magicKeys = ['alquimista', 'mago', 'ferreiro', 'rei_rainha', 'domador_feras', 'aniquilador_vegetais'];
  for (const mKey of magicKeys) {
    assert.ok(professionsData[mKey], `Profissão mágica ${mKey} deve existir.`);
    assert.equal(professionsData[mKey].isMagic, true, `${mKey} deve ter isMagic true.`);
    assert.ok(professionsData[mKey].words.length >= 100, `${mKey} deve ter pelo menos 100 palavras.`);
    assert.ok([1, 2].includes(professionsData[mKey].beanCost), `${mKey} deve ter custo de 1 ou 2 feijões.`);
    assert.ok(getRoleTitle(mKey, 1, 'pt'), `${mKey} deve ter título no nível 1 PT.`);
    assert.ok(getRoleTitle(mKey, 4, 'en'), `${mKey} deve ter título no nível 4 EN.`);
  }
  assert.equal(professionsData.rei_rainha.beanCost, 2, 'Rei/Rainha deve custar 2 feijões.');
  assert.equal(professionsData.domador_feras.beanCost, 2, 'Domador de feras deve custar 2 feijões.');
  assert.equal(professionsData.aniquilador_vegetais.beanCost, 2, 'Aniquilador de vegetais deve custar 2 feijões.');
  assert.equal(professionsData.alquimista.beanCost, 1, 'Alquimista deve custar 1 feijão.');
  assert.equal(professionsData.mago.beanCost, 1, 'Mago deve custar 1 feijão.');
  assert.equal(professionsData.ferreiro.beanCost, 1, 'Ferreiro deve custar 1 feijão.');

  // Teste de desbloqueio com feijões mágicos
  const magicCandidate = 'magic-user';
  const tryWithoutBeans = setProfession(magicCandidate, 'alquimista');
  assert.equal(tryWithoutBeans.changed, false, 'Não deve permitir desbloquear profissão mágica sem feijões.');
  assert.equal(tryWithoutBeans.reason, 'insufficient_beans');

  addMagicBeans(magicCandidate, 1);
  const unlockAlchemist = setProfession(magicCandidate, 'alquimista');
  assert.equal(unlockAlchemist.changed, true, 'Deve desbloquear alquimista com 1 feijão.');
  assert.equal(unlockAlchemist.unlockedWithBeans, true);
  assert.equal(getMagicBeans(magicCandidate), 0, 'Saldo de feijões deve ser 0 após desbloqueio.');
  assert.equal(getUserAccount(magicCandidate).profession, 'alquimista');
  assert.ok(getUserAccount(magicCandidate).unlockedProfessions.includes('alquimista'), 'Alquimista deve estar nas profissões desbloqueadas.');

  // Teste de vocação de 2 feijões (rei_rainha)
  addMagicBeans(magicCandidate, 1);
  setUserBalance(magicCandidate, 100);
  const tryKingWith1Bean = setProfession(magicCandidate, 'rei_rainha');
  assert.equal(tryKingWith1Bean.changed, false, 'Rei/Rainha custa 2 feijões e deve falhar com apenas 1.');
  assert.equal(tryKingWith1Bean.reason, 'insufficient_beans');

  addMagicBeans(magicCandidate, 1); // Agora tem 2 feijões
  const unlockKing = setProfession(magicCandidate, 'rei_rainha');
  assert.equal(unlockKing.changed, true, 'Deve desbloquear Rei/Rainha com 2 feijões.');
  assert.equal(unlockKing.beanCost, 2);
  assert.equal(getMagicBeans(magicCandidate), 0, 'Deve gastar os 2 feijões.');
  assert.ok(getUserAccount(magicCandidate).unlockedProfessions.includes('rei_rainha'));

  // Alternar de volta para alquimista (já desbloqueado) deve cobrar moedas convencionais e não feijões
  const switchBackToAlchemist = setProfession(magicCandidate, 'alquimista');
  assert.equal(switchBackToAlchemist.changed, true, 'Deve permitir troca para profissão mágica já desbloqueada.');
  assert.equal(switchBackToAlchemist.charged, 50, 'Deve cobrar 50 moedas normais.');
  assert.equal(getMagicBeans(magicCandidate), 0, 'Não deve cobrar feijões de profissão já desbloqueada.');

  // Teste de Daily Streak
  setEconomyConfig(20, 20);
  const sDay1 = claimDaily('streak-user', Date.parse('2026-03-01T12:00:00.000Z'));
  assert.equal(sDay1.claimed, true);
  assert.equal(sDay1.streak, 1, 'Primeiro dia deve ter streak 1');
  assert.equal(sDay1.streakBonus, 1, 'Cada dia da sequência vale +1 moedinha');
  assert.equal(sDay1.totalAmount, 21);

  const sDay2 = claimDaily('streak-user', Date.parse('2026-03-02T13:00:00.000Z'));
  assert.equal(sDay2.claimed, true);
  assert.equal(sDay2.streak, 2, 'Segundo dia consecutivo deve ter streak 2');
  assert.equal(sDay2.streakBonus, 2, 'Streak 2 deve pagar +2 moedas');
  assert.equal(sDay2.totalAmount, 22);

  const sDay3 = claimDaily('streak-user', Date.parse('2026-03-03T14:00:00.000Z'));
  assert.equal(sDay3.claimed, true);
  assert.equal(sDay3.streak, 3, 'Terceiro dia consecutivo deve ter streak 3');
  assert.equal(sDay3.streakBonus, 3, 'Streak 3 deve pagar +3 moedas');
  assert.equal(sDay3.totalAmount, 23);

  // Testes de Voto no Top.gg e Bônus no /py-daily
  const voteTime = Date.parse('2026-04-01T10:00:00.000Z');
  assert.equal(hasActiveVote('voter-daily-user', voteTime), false, 'Usuário novo não tem voto ativo');
  registerUserVote('voter-daily-user', voteTime);
  assert.equal(hasActiveVote('voter-daily-user', voteTime), true, 'Usuário deve ter voto ativo após registrar');
  assert.equal(hasActiveVote('voter-daily-user', voteTime + 11 * 3600 * 1000), true, 'Voto deve ser válido dentro de 12 horas');
  assert.equal(hasActiveVote('voter-daily-user', voteTime + 13 * 3600 * 1000), false, 'Voto deve expirar após 12 horas');

  // Claim diário sem bônus de voto (bônus removidos)
  setEconomyConfig(15, 15);
  const voteClaim = claimDaily('voter-daily-user', voteTime);
  assert.equal(voteClaim.claimed, true);
  assert.equal(voteClaim.hasVoted, false, 'Claim diário não deve atribuir hasVoted de bônus');
  assert.equal(voteClaim.voteBonus, 0, 'Claim diário não deve conceder bônus pelo voto');
  assert.equal(voteClaim.totalAmount, 16, 'Total deve ser o base (15) + 1 do primeiro dia da sequência, sem bônus de voto');

  // Teste de ranking com dailyStreak exposto
  const rankList = getRanking(10);
  const streakRankEntry = rankList.find(e => e.userId === 'streak-user');
  assert.ok(streakRankEntry, 'streak-user deve estar presente no ranking');
  // Testes de Interface & Embed do comando de profissão
  const { resolveProfession, buildProfessionEmbed, buildProfessionSelectRow } = require('../src/commands/profissao');
  assert.equal(resolveProfession('mago'), 'mago');
  assert.equal(resolveProfession('maga'), 'mago');
  assert.equal(resolveProfession('wizard'), 'mago');
  assert.equal(resolveProfession('ferreiro'), 'ferreiro');
  assert.equal(resolveProfession('blacksmith'), 'ferreiro');
  assert.equal(resolveProfession('rei'), 'rei_rainha');
  assert.equal(resolveProfession('rainha'), 'rei_rainha');
  assert.equal(resolveProfession('domador de feras'), 'domador_feras');
  assert.equal(resolveProfession('beast tamer'), 'domador_feras');
  assert.equal(resolveProfession('aniquilador de vegetais'), 'aniquilador_vegetais');
  assert.equal(resolveProfession('vegetable slayer'), 'aniquilador_vegetais');
  assert.equal(resolveProfession('advogado'), 'advogada');
  assert.equal(resolveProfession('advogada'), 'advogada');

  const fakeSource = { author: { id: magicCandidate } };
  const embed = buildProfessionEmbed(magicCandidate, fakeSource);
  assert.ok(embed.data.title.includes('Profissões') || embed.data.title.includes('Careers'), 'Embed deve ter título de profissões');
  assert.ok(embed.data.fields.length >= 3, 'Embed deve conter os campos de status, comuns e mágicas');

  const selectRow = buildProfessionSelectRow(magicCandidate, fakeSource);
  assert.ok(selectRow.components && selectRow.components[0], 'SelectRow deve conter o select menu');
  assert.equal(selectRow.components[0].options.length, 22, 'Menu de carreiras convencionais com 22 opções');
  const { buildProfessionSelectRows } = require('../src/commands/profissao');
  const rows = buildProfessionSelectRows(magicCandidate, fakeSource);
  assert.equal(rows.length, 2, 'Convencionais e arcanas em menus separados (limite de 25 do Discord)');
  assert.equal(rows[1].components[0].options.length, 6, 'Menu das 6 vocações arcanas');

    // Testes de Dilemas de Corrupção / Proposta Sombria (resolveCorruptionDilemma)
  const dilUserId = 'test_dilemma_user';
  setUserBalance(dilUserId, 100);
  setCareerLevel(dilUserId, 2);

  // 1. Escolha 'report' (Denunciar ao Conselho): +20 moedas seguras, limpa careerMistakes = 0
  const reportRes = resolveCorruptionDilemma(dilUserId, 'report', 30);
  assert.equal(reportRes.choice, 'report');
  assert.equal(reportRes.outcome, 'council');
  assert.equal(reportRes.bonus, 20);
  assert.equal(reportRes.amount, 50, 'Salário base (30) + Bônus de Denúncia (20) deve ser 50');
  assert.equal(reportRes.careerMistakes, 0, 'Denúncia deve zerar falhas na carreira');
  assert.equal(getBalance(dilUserId), 150, 'Saldo deve refletir +50 moedas');

  // 2. Escolha 'accept' com Sucesso (Math.random < 0.65): +70 moedas bônus
  const origRandom = Math.random;
  try {
    Math.random = () => 0.10; // Força sucesso (< 0.65)
    const acceptSuccessRes = resolveCorruptionDilemma(dilUserId, 'accept', 30);
    assert.equal(acceptSuccessRes.choice, 'accept');
    assert.equal(acceptSuccessRes.outcome, 'success');
    assert.equal(acceptSuccessRes.bonus, 70);
    assert.equal(acceptSuccessRes.amount, 100, 'Salário base (30) + Bônus do Esquema (70) deve ser 100');
    assert.equal(getBalance(dilUserId), 250);

    // 3. Escolha 'accept' com Flagrante da Auditoria (Math.random >= 0.65): 0 moedas, +1 careerMistakes
    Math.random = () => 0.80; // Força auditoria (>= 0.65) e sem rebaixamento (demotion roll < 0.15)
    const auditRes = resolveCorruptionDilemma(dilUserId, 'accept', 30);
    assert.equal(auditRes.choice, 'accept');
    assert.equal(auditRes.outcome, 'audit');
    assert.equal(auditRes.bonus, 0);
    assert.equal(auditRes.amount, 0, 'Auditoria deve confiscar o salário (0 moedas)');
    assert.equal(auditRes.careerMistakes, 1, 'Auditoria deve registrar +1 falha');
    assert.equal(getBalance(dilUserId), 250, 'Saldo não deve ser alterado');

    // 4. Conclusão de Projeto (3/3) via denúncia
    const completeProjectRes = resolveCorruptionDilemma(dilUserId, 'report', 30);
    assert.equal(completeProjectRes.projectCompleted, true, 'Deve concluir o projeto ao atingir 3 turnos');
    assert.equal(completeProjectRes.projectProgressDisplay, 3);
    assert.equal(getUserAccount(dilUserId).projectProgress, 0, 'Progresso deve ser resetado para 0 após conclusão');

    // 5. Sistema de Baralho Anti-Repetição (Deck Shuffle / No-Repeat Window)
    const deckWorker = 'test_deck_worker';
    setProfession(deckWorker, 'programador');
    assert.deepEqual(getUserAccount(deckWorker).recentWorkQuestions, [], 'Histórico recente deve iniciar vazio');

    startWork(deckWorker, { profession: 'programador', questionKey: 'Questao_A' }, Date.now());
    assert.deepEqual(getUserAccount(deckWorker).recentWorkQuestions, ['Questao_A'], 'Deve registrar Questao_A no histórico');

    // Simula próximo turno
    startWork(deckWorker, { profession: 'programador', questionKey: 'Questao_B' }, Date.now() + 4 * 3600 * 1000);
    assert.deepEqual(getUserAccount(deckWorker).recentWorkQuestions, ['Questao_A', 'Questao_B'], 'Deve reter ordem de histórico');

    // Troca de profissão limpa o histórico
    setUserBalance(deckWorker, 100);
    const switchRes = setProfession(deckWorker, 'cozinheiro');
    assert.equal(switchRes.changed, true, 'Deve permitir troca de carreira com saldo suficiente');
    assert.deepEqual(getUserAccount(deckWorker).recentWorkQuestions, [], 'Troca de carreira deve resetar o histórico');

    // Validação do Histórico Anti-Repetição do Quiz Cultural
    const quizDeckUser = 'deck_quiz_user';
    assert.deepEqual(getUserAccount(quizDeckUser).recentQuizQuestions, [], 'Histórico recente do quiz deve iniciar vazio');
    startQuiz(quizDeckUser, Date.now(), 'Quiz_Q1');
    assert.deepEqual(getUserAccount(quizDeckUser).recentQuizQuestions, ['Quiz_Q1'], 'startQuiz deve registrar a questão inicial');
    recordQuizQuestion(quizDeckUser, 'Quiz_Q2');
    assert.deepEqual(getUserAccount(quizDeckUser).recentQuizQuestions, ['Quiz_Q1', 'Quiz_Q2'], 'recordQuizQuestion deve registrar novas questões');
  } finally {
    Math.random = origRandom;
  }

  console.log('Verificação da economia, cooldown, ranking, Feijões Mágicos e Títulos: OK');
} finally {
  fs.writeFileSync(economyFile, originalEconomy, 'utf8');
  fs.writeFileSync(settingsFile, originalSettings, 'utf8');
  if (originalMarriage === null) {
    if (fs.existsSync(marriageFile)) fs.unlinkSync(marriageFile);
  } else {
    fs.writeFileSync(marriageFile, originalMarriage, 'utf8');
  }
}