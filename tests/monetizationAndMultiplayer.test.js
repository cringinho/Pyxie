const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { createTradeProposal, confirmTrade, cancelTrade } = require('../src/services/trade');
const { getBalance, addCoins, addMagicBeans, buyTheme, equipTheme, getUserAccount } = require('../src/services/economy');
const { addItem, hasItem } = require('../src/services/inventory');
const { processTopggVote, verifyWebhookAuth } = require('../src/services/topgg');

const testRunId = Date.now();
const testUserA = `user_test_a_${testRunId}`;
const testUserB = `user_test_b_${testRunId}`;

try {
  // 1. Setup inicial de contas
  addCoins(testUserA, 2000);
  addCoins(testUserB, 2000);
  addMagicBeans(testUserA, 10);

  // 2. Teste de Trocas Seguras (Itens e Moedas)
  addItem(testUserA, 'ametista', 3);
  const tradeProp = createTradeProposal(testUserA, testUserB, { type: 'item', id: 'ametista', amount: 1 });
  assert.equal(tradeProp.success, true, 'Proposta de troca válida deve ser criada.');

  const confirm1 = confirmTrade(tradeProp.session.id, testUserA);
  assert.equal(confirm1.completed, false, 'Apenas 1 confirmação não deve concluir a troca.');

  const confirm2 = confirmTrade(tradeProp.session.id, testUserB);
  assert.equal(confirm2.completed, true, 'Após ambas as confirmações, a troca deve ser concluída.');
  assert.ok(hasItem(testUserB, 'ametista', 1), 'O receptor deve ter recebido o item.');

  // Teste de cancelamento de troca
  const testUserC = `user_test_c_${testRunId}`;
  const testUserD = `user_test_d_${testRunId}`;
  addItem(testUserC, 'ametista', 2);
  const cancelProp = createTradeProposal(testUserC, testUserD, { type: 'item', id: 'ametista', amount: 1 });
  assert.equal(cancelProp.success, true);
  const cancelRes = cancelTrade(cancelProp.session.id, testUserC);
  assert.equal(cancelRes.success, true, 'Cancelamento da proposta de troca deve funcionar.');

  // 3. Teste de Temas Visuais com Feijões Mágicos
  const themeBuy = buyTheme(testUserA, 'ouro');
  assert.equal(themeBuy.success, true, 'Compra de tema com Feijões Mágicos deve ter sucesso.');
  const userAcc = getUserAccount(testUserA);
  assert.equal(userAcc.equippedTheme, 'ouro', 'Tema Ouro deve estar equipado no perfil.');

  // 4. Teste de Votos Top.gg (Recompensas e Bônus Fim de Semana)
  assert.equal(verifyWebhookAuth('teste'), true, 'Sem secret configurado deve validar webhook.');

  const voteNormal = processTopggVote({ user: testUserA, isWeekend: false });
  assert.equal(voteNormal.success, true, 'Voto comum no Top.gg deve ser processado.');
  assert.equal(voteNormal.coins, 50, 'Recompensa comum deve ser 50 moedas.');
  assert.equal(hasItem(testUserA, 'ametista', 3), true, 'Usuário deve receber 1x Ametista Reluzente.');

  const voteWeekend = processTopggVote({ user: testUserB, isWeekend: true });
  assert.equal(voteWeekend.success, true, 'Voto no fim de semana no Top.gg deve ser processado.');
  assert.equal(voteWeekend.coins, 100, 'Recompensa de fim de semana deve ser 100 moedas (2x).');
  assert.equal(hasItem(testUserB, 'esmeralda', 1), true, 'Usuário deve receber 1x Esmeralda Nobre.');
  const accB = getUserAccount(testUserB);
  assert.equal(accB.magicBeans, 1, 'Fim de semana deve conceder 1 Feijão Mágico.');

  console.log('Verificação de Top.gg, Trocas Seguras e Temas Visuais com Feijões Mágicos: OK');
} finally {
  const cleanFiles = [
    path.join(__dirname, '..', 'data', 'economy.json'),
    path.join(__dirname, '..', 'data', 'inventory.json'),
    path.join(__dirname, '..', 'data', 'trades.json'),
  ];

  for (const file of cleanFiles) {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        delete data[testUserA];
        delete data[testUserB];
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {}
    }
  }
}
