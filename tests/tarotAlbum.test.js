const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {
  TOTAL_CARDS,
  TAROT_CATALOG,
  getCardByNumber,
  getCardById,
  getCardAssetPath,
  getLockedAssetPath,
} = require('../src/data/tarotCardsCatalog');
const {
  TAROT_ACHIEVEMENTS,
  getAchievementById,
  evaluateAndSortAchievements,
} = require('../src/data/tarotAchievements');
const {
  getUserAlbum,
  recordCardDiscovery,
  claimAchievement,
  getAlbumStats,
  hasCard,
} = require('../src/services/tarotAlbumService');
const { getBalance, setUserBalance } = require('../src/services/economy');

console.log('🔮 Iniciando suíte de testes do Álbum de Tarot & Conquistas da Cringelândia...');

// 1. Catálogo Canônico de 78 Cartas
assert.equal(TOTAL_CARDS, 78, 'Total de cartas deve ser exatamente 78');
assert.equal(TAROT_CATALOG.length, 78, 'Catálogo deve possuir 78 cartas');

// Validação dos Arcanos Maiores (1 a 22)
for (let i = 1; i <= 22; i++) {
  const card = getCardByNumber(i);
  assert(card, `Carta #${i} deve existir`);
  assert.equal(card.suit, 'major', `Carta #${i} deve ser Arcano Maior`);
  assert(card.name, `Carta #${i} deve ter nome`);
  assert(card.keywords.length > 0, `Carta #${i} deve ter keywords`);
}

// Validação dos Naipes Menores (23 a 78)
const wandsCards = TAROT_CATALOG.filter((c) => c.suit === 'wands');
const swordsCards = TAROT_CATALOG.filter((c) => c.suit === 'swords');
const cupsCards = TAROT_CATALOG.filter((c) => c.suit === 'cups');
const pentaclesCards = TAROT_CATALOG.filter((c) => c.suit === 'pentacles');

assert.equal(wandsCards.length, 14, 'Naipe de Paus deve ter 14 cartas');
assert.equal(swordsCards.length, 14, 'Naipe de Espadas deve ter 14 cartas');
assert.equal(cupsCards.length, 14, 'Naipe de Copas deve ter 14 cartas');
assert.equal(pentaclesCards.length, 14, 'Naipe de Ouros deve ter 14 cartas');

// Verificação de existência dos assets WebP
const lockedAsset = getLockedAssetPath();
assert(fs.existsSync(lockedAsset), `Asset do verso bloqueado deve existir em ${lockedAsset}`);

for (let i = 1; i <= 78; i++) {
  const assetPath = getCardAssetPath(i);
  assert(fs.existsSync(assetPath), `Asset da carta #${i} deve existir em ${assetPath}`);
}
console.log('✅ Catálogo canônico de 78 cartas e assets WebP validados com sucesso.');

// 2. Registro e Persistência de Descobertas
const testUserId = `test_tarot_user_${Date.now()}`;
setUserBalance(testUserId, 0);

const initialAlbum = getUserAlbum(testUserId);
assert.equal(initialAlbum.discoveredCards.length, 0, 'Álbum inicial deve estar vazio');

// Descoberta 1: Carta #1 (O Louco)
const disc1 = recordCardDiscovery(testUserId, 1);
assert.equal(disc1.isNew, true, 'Primeira descoberta deve marcar isNew: true');
assert.equal(disc1.totalDiscovered, 1, 'Total descoberto deve ser 1');
assert(disc1.discoveredCards.includes(1), 'Carta #1 deve estar na lista');
assert(hasCard(testUserId, 1), 'hasCard deve retornar true para carta descoberta');
assert.equal(hasCard(testUserId, 2), false, 'hasCard deve retornar false para carta não descoberta');

// Descoberta Duplicada: Carta #1
const discDup = recordCardDiscovery(testUserId, 1);
assert.equal(discDup.isNew, false, 'Descoberta repetida deve marcar isNew: false');
assert.equal(discDup.totalDiscovered, 1, 'Total descoberto deve continuar 1');

// Descoberta 2: Carta #22 (O Mundo) por ID
const disc2 = recordCardDiscovery(testUserId, 'major_21');
assert.equal(disc2.isNew, true, 'Carta #22 por ID deve ser nova');
assert.equal(disc2.totalDiscovered, 2, 'Total descoberto deve ser 2');

console.log('✅ Descobertas de cartas e deduplicação atômica validadas.');

// 3. Algoritmo de Ordenação Dinâmica de Conquistas
// Neste momento, o usuário possui as cartas [1, 22].
// Conquistas disponíveis:
// - first_card: 1/1 (Pronta)
// - fools_journey: 2/2 (Pronta - tem 1 e 22)
// - queens_court: 0/4 (Em Progresso)
// - kings_banquet: 0/4 (Em Progresso)
// - suit_wands_complete: 0/14 (Em Progresso)
// - major_mastery: 2/22 (Em Progresso)
// - full_deck_78: 2/78 (Em Progresso)

const sorted1 = evaluateAndSortAchievements([1, 22], [], 'pt');
assert.equal(sorted1.length, 7, 'Devem existir 7 conquistas avaliadas');

// As 2 primeiras devem ser as prontas para resgate (Nível 1)
assert.equal(sorted1[0].isReady, true, 'Primeira conquista deve estar pronta para resgate');
assert.equal(sorted1[1].isReady, true, 'Segunda conquista deve estar pronta para resgate');
assert.equal(sorted1[0].isClaimed, false);
assert.equal(sorted1[1].isClaimed, false);

// As 5 seguintes devem estar em progresso (Nível 2)
for (let i = 2; i < 7; i++) {
  assert.equal(sorted1[i].isReady, false, `Conquista índice ${i} não deve estar pronta`);
  assert.equal(sorted1[i].isClaimed, false, `Conquista índice ${i} não deve estar resgatada`);
}

console.log('✅ Ordenação dinâmica de conquistas por prioridade (Pronta -> Progresso -> Resgatada) validada.');

// 4. Resgate de Conquistas & Prevenção de Double-Claim
(async () => {
  // Tentativa de resgate de conquista incompleta (queens_court)
  const failClaim = await claimAchievement(testUserId, 'queens_court', 'pt');
  assert.equal(failClaim.success, false, 'Não deve permitir resgate de conquista não cumprida');
  assert.equal(failClaim.reason, 'requirements_not_met');

  // Resgate legítimo de 'first_card' (Recompensa: 100 moedas)
  const initialBalance = getBalance(testUserId);
  const successClaim = await claimAchievement(testUserId, 'first_card', 'pt');
  assert.equal(successClaim.success, true, 'Resgate de first_card deve ter sucesso');
  assert.equal(successClaim.rewardCoins, 100);
  assert.equal(getBalance(testUserId), initialBalance + 100, 'Saldo deve receber +100 moedas');

  // Tentativa de Double-Claim em 'first_card'
  const doubleClaim = await claimAchievement(testUserId, 'first_card', 'pt');
  assert.equal(doubleClaim.success, false, 'Double claim deve ser impedido');
  assert.equal(doubleClaim.reason, 'already_claimed');
  assert.equal(getBalance(testUserId), initialBalance + 100, 'Saldo não deve ser alterado em double-claim');

  // Resgate de 'fools_journey' (Recompensa: 500 moedas)
  const successClaim2 = await claimAchievement(testUserId, 'fools_journey', 'pt');
  assert.equal(successClaim2.success, true);
  assert.equal(getBalance(testUserId), initialBalance + 100 + 500);

  // Verificação de Stats após resgates
  const statsAfter = getAlbumStats(testUserId, 'pt');
  assert.equal(statsAfter.discoveredCount, 2);
  assert.equal(statsAfter.claimedCount, 2);
  assert.equal(statsAfter.readyToClaimCount, 0);

  // Ordenação dinâmica atualizada:
  // As 5 em progresso devem vir primeiro, e as 2 resgatadas devem ir para o final (Nível 3)
  assert.equal(statsAfter.achievements[5].isClaimed, true);
  assert.equal(statsAfter.achievements[6].isClaimed, true);

  console.log('✅ Resgate de conquistas com adição de moedas e prevenção contra double-claim validados com sucesso!');
  console.log('🎉 Todos os testes do Álbum de Tarot passaram com 100% de integridade!');
})();
