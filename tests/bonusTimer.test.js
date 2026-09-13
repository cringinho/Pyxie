const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { createBonusSession, verifyAndClaimBonus, BONUS_SECRET } = require('../src/services/bonusTimer');
const { putEggInIncubator, getIncubator, adoptPet } = require('../src/services/pets');
const { addItem } = require('../src/services/inventory');
const { startExpedition, getActiveExpedition, claimExpedition, markExpeditionDoubled } = require('../src/services/petExpedition');

const testRunId = Date.now();
const testUserBonus = `user_bonus_${testRunId}`;

try {
  // 1. Setup inicial
  adoptPet(testUserBonus, 'cinna');
  addItem(testUserBonus, 'ovo_silvestre', 2);
  const placeRes = putEggInIncubator(testUserBonus, 'ovo_silvestre', 0);
  assert.equal(placeRes.success, true, 'Ovo deve ser colocado na chocadeira.');

  // 2. Teste de criação de sessão
  const session = createBonusSession(testUserBonus, 'incubator_boost');
  assert.ok(session.token, 'Sessão deve gerar um token.');
  assert.ok(session.url.includes('/bonus?token='), 'URL deve apontar para /bonus.');
  assert.equal(session.action, 'incubator_boost', 'Ação deve ser incubator_boost.');

  // 3. Teste de rejeição por tempo prematuro (< 8s)
  const prematureClaim = verifyAndClaimBonus(session.token);
  assert.equal(prematureClaim.success, false, 'Resgate prematuro (<8s) deve ser rejeitado pelo servidor.');
  assert.ok(prematureClaim.error.includes('Aguarde os 10 segundos'), 'Mensagem deve instruir aguardar o tempo.');

  // 4. Teste de resgate válido com token forjado no passado para simular 10s decorridos
  const crypto = require('node:crypto');
  const pastCreatedAt = Date.now() - 10000; // 10 segundos atrás
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = JSON.stringify({ userId: testUserBonus, action: 'incubator_boost', metadata: {}, createdAt: pastCreatedAt, nonce });
  const hmac = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');
  const validToken = Buffer.from(JSON.stringify({ payload, sig: hmac })).toString('base64url');

  const incubatorBefore = getIncubator(testUserBonus);
  const eggSlotBefore = incubatorBefore.slots.find((s) => s.slotIndex === 0);
  const timeBeforeMs = eggSlotBefore.tempoRestanteMs;

  const claimRes = verifyAndClaimBonus(validToken);
  assert.equal(claimRes.success, true, 'Resgate com tempo válido deve ser aprovado.');
  assert.equal(claimRes.action, 'incubator_boost', 'Ação confirmada deve ser incubator_boost.');

  const incubatorAfter = getIncubator(testUserBonus);
  const eggSlotAfter = incubatorAfter.slots.find((s) => s.slotIndex === 0);
  assert.ok(eggSlotAfter.tempoRestanteMs < timeBeforeMs, 'Tempo restante do ovo deve ter sido reduzido.');

  // 5. Teste de anti-replay (não permite reutilizar o mesmo token)
  const doubleClaim = verifyAndClaimBonus(validToken);
  assert.equal(doubleClaim.success, false, 'Reutilizar o mesmo token deve ser rejeitado (anti-replay).');

  // 6. Teste de Expedição com Bônus Dobro (2x)
  startExpedition(testUserBonus, 2);
  const pastExpCreatedAt = Date.now() - 10000;
  const expNonce = crypto.randomBytes(8).toString('hex');
  const expPayload = JSON.stringify({ userId: testUserBonus, action: 'expedition_double', metadata: {}, createdAt: pastExpCreatedAt, nonce: expNonce });
  const expHmac = crypto.createHmac('sha256', BONUS_SECRET).update(expPayload).digest('hex');
  const validExpToken = Buffer.from(JSON.stringify({ payload: expPayload, sig: expHmac })).toString('base64url');

  const claimExpRes = verifyAndClaimBonus(validExpToken);
  assert.equal(claimExpRes.success, true, 'Resgate de bônus de expedição deve ser aprovado.');

  const expData = getActiveExpedition(testUserBonus);
  assert.equal(expData.doubled, true, 'Expedição deve estar marcada como doubled.');

  // Forçar expedição como concluída para testar claim
  const expFile = path.join(__dirname, '..', 'data', 'expeditions.json');
  const allExp = JSON.parse(fs.readFileSync(expFile, 'utf8'));
  allExp[testUserBonus].finishAt = Date.now() - 1000;
  fs.writeFileSync(expFile, JSON.stringify(allExp, null, 2), 'utf8');

  const claimFinal = claimExpedition(testUserBonus);
  assert.equal(claimFinal.success, true, 'Resgate da expedição deve funcionar.');
  assert.equal(claimFinal.doubled, true, 'Resultado deve indicar que as recompensas foram dobradas.');
  assert.ok(claimFinal.xpGained >= 300, 'XP deve refletir o multiplicador de 2x.');

  // 7. Teste de token adulterado
  const fakeToken = 'eyJmb28iOiJiYXIifQ';
  const fakeRes = verifyAndClaimBonus(fakeToken);
  assert.equal(fakeRes.success, false, 'Token inválido deve ser rejeitado.');

  console.log('Verificação da Página de Bônus da Pyxie (HMAC, Timer 10s, Chocadeira -2h e Expedição 2x): OK');
} finally {
  const cleanFiles = [
    path.join(__dirname, '..', 'data', 'pets.json'),
    path.join(__dirname, '..', 'data', 'expeditions.json'),
    path.join(__dirname, '..', 'data', 'inventory.json'),
    path.join(__dirname, '..', 'data', 'economy.json'),
  ];
  for (const file of cleanFiles) {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        delete data[testUserBonus];
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {}
    }
  }
}
