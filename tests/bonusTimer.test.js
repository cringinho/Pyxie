const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { createBonusSession, verifyAndClaimBonus, BONUS_SECRET } = require('../src/services/bonusTimer');
const { getUserInventory } = require('../src/services/inventory');
const { getUserAccount } = require('../src/services/economy');

const testRunId = Date.now();
const testUserBonus = `user_bonus_${testRunId}`;

try {
  // 1. Teste de criação de sessão
  const session = createBonusSession(testUserBonus, 'item_bonus');
  assert.ok(session.token, 'Sessão deve gerar um token.');
  assert.ok(session.url.includes('/bonus?token='), 'URL deve apontar para /bonus.');
  assert.equal(session.action, 'item_bonus', 'Ação deve ser item_bonus.');

  // 2. Teste de rejeição por tempo prematuro (< 8s)
  const prematureClaim = verifyAndClaimBonus(session.token);
  assert.equal(prematureClaim.success, false, 'Resgate prematuro (<8s) deve ser rejeitado pelo servidor.');
  assert.ok(prematureClaim.error.includes('Aguarde os 10 segundos'), 'Mensagem deve instruir aguardar o tempo.');

  // 3. Teste de resgate válido com token gerado no passado (simulando 10s decorridos)
  const pastCreatedAt = Date.now() - 10000;
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = JSON.stringify({ userId: testUserBonus, action: 'item_bonus', metadata: {}, createdAt: pastCreatedAt, nonce, lang: 'pt' });
  const hmac = crypto.createHmac('sha256', BONUS_SECRET).update(payload).digest('hex');
  const validToken = Buffer.from(JSON.stringify({ payload, sig: hmac })).toString('base64url');

  const claimRes = verifyAndClaimBonus(validToken);
  assert.equal(claimRes.success, true, 'Resgate com tempo válido deve ser aprovado.');
  assert.equal(claimRes.coinsAwarded, 75, 'Deve conceder 75 moedas.');
  assert.equal(claimRes.beansAwarded, 1, 'Deve conceder 1 feijão mágico.');

  const invUser = getUserInventory(testUserBonus);
  assert.equal(invUser.bau_madeira, 1, 'Mochila do usuário deve conter 1x Baú Rústico.');

  const accUser = getUserAccount(testUserBonus);
  assert.equal(accUser.coins, 75, 'Usuário deve ter recebido 75 moedas.');
  assert.equal(accUser.magicBeans, 1, 'Usuário deve ter recebido 1 feijão mágico.');

  // 4. Teste de anti-replay (não permite reutilizar o mesmo token)
  const doubleClaim = verifyAndClaimBonus(validToken);
  assert.equal(doubleClaim.success, false, 'Reutilizar o mesmo token deve ser rejeitado (anti-replay).');

  // 5. Teste de bônus de biscoito da sorte (cookie_bonus)
  const userCookie = `user_cookie_${testRunId}`;
  const cookiePayload = JSON.stringify({ userId: userCookie, action: 'cookie_bonus', metadata: {}, createdAt: pastCreatedAt, nonce: crypto.randomBytes(8).toString('hex'), lang: 'pt' });
  const cookieHmac = crypto.createHmac('sha256', BONUS_SECRET).update(cookiePayload).digest('hex');
  const validCookieToken = Buffer.from(JSON.stringify({ payload: cookiePayload, sig: cookieHmac })).toString('base64url');

  const claimCookieRes = verifyAndClaimBonus(validCookieToken);
  assert.equal(claimCookieRes.success, true, 'Resgate de cookie_bonus deve ser aprovado.');
  assert.ok(claimCookieRes.message.includes('Biscoito da Sorte Extra Desbloqueado'), 'Mensagem de biscoito deve constar.');

  // 5.1 Teste de bônus do Chefão do Bosque (gloom_boss)
  const userGloomBoss = `user_gboss_${testRunId}`;
  const gloomBossPayload = JSON.stringify({ userId: userGloomBoss, action: 'gloom_boss', metadata: {}, createdAt: pastCreatedAt, nonce: crypto.randomBytes(8).toString('hex'), lang: 'pt' });
  const gloomBossHmac = crypto.createHmac('sha256', BONUS_SECRET).update(gloomBossPayload).digest('hex');
  const validGloomBossToken = Buffer.from(JSON.stringify({ payload: gloomBossPayload, sig: gloomBossHmac })).toString('base64url');

  const claimGloomBossRes = verifyAndClaimBonus(validGloomBossToken);
  assert.equal(claimGloomBossRes.success, true, 'Resgate de gloom_boss deve ser aprovado.');
  assert.equal(claimGloomBossRes.phantomCoinsAwarded, 50, 'Deve conceder 50 Phantom Coins.');
  assert.ok(claimGloomBossRes.message.includes('Investida Extra Desbloqueada'), 'Mensagem deve ser exclusiva da investida extra.');
  assert.ok(!claimGloomBossRes.message.includes('Moedinhas'), 'Não deve mencionar Moedinhas no minigame.');
  assert.ok(!claimGloomBossRes.message.includes('Feijão Mágico'), 'Não deve mencionar Feijão Mágico.');

  const invBossUser = getUserInventory(userGloomBoss);
  assert.equal(invBossUser.bau_madeira || 0, 0, 'Não deve dar Baú de Madeira no bônus do minigame.');

  const accBossUser = getUserAccount(userGloomBoss);
  assert.equal(accBossUser.coins, 0, 'Não deve dar moedas comuns no bônus do minigame.');

  // 6. Teste de token adulterado
  const fakeToken = 'eyJmb28iOiJiYXIifQ';
  const fakeRes = verifyAndClaimBonus(fakeToken);
  assert.equal(fakeRes.success, false, 'Token inválido deve ser rejeitado.');

  console.log('Verificação da Página de Bônus da Pyxie (HMAC, Timer 10s, Moedas, Feijão e Baú): OK');
} finally {
  const cleanFiles = [
    path.join(__dirname, '..', 'data', 'inventory.json'),
    path.join(__dirname, '..', 'data', 'economy.json'),
    path.join(__dirname, '..', 'data', 'gloom.json'),
  ];
  for (const file of cleanFiles) {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        delete data[testUserBonus];
        delete data[`user_cookie_${testRunId}`];
        if (data.users) delete data.users[`user_gboss_${testRunId}`];
        if (data.worldBoss?.participants) delete data.worldBoss.participants[`user_gboss_${testRunId}`];
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {}
    }
  }
}
