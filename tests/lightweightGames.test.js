const assert = require('node:assert/strict');
const { getCookieStatus, claimCookie, grantExtraCookie, COOKIE_WISDOMS } = require('../src/services/cookie');
const { createBonusSession, verifyAndClaimBonus, BONUS_SECRET } = require('../src/services/bonusTimer');
const { getBalance, addCoins, spendCoins, setUserBalance } = require('../src/services/economy');

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
assert.equal(claimBonusRes.action, 'cookie_bonus', 'Ação do bônus deve ser cookie_bonus.');
assert.equal(getBalance(testUserId), balanceBeforeBonus + 100, 'Deve creditar 100 moedas ao resgatar bônus de biscoito.');

const statusAfterBonus = getCookieStatus(testUserId);
assert.equal(statusAfterBonus.canOpen, true, 'Após o bônus, o usuário deve poder abrir um biscoito extra.');
assert.ok(statusAfterBonus.extraCookies >= 1, 'Deve possuir crédito de biscoito extra.');

const extraOpen = claimCookie(testUserId);
assert.equal(extraOpen.success, true, 'Biscoito extra deve ser aberto com sucesso.');

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



