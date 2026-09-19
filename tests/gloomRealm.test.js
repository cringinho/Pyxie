const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {
  LOCATIONS,
  SPIRITS,
  FUSION_RECIPES,
  gloomGraph,
  getGloomTide,
  getGloomUser,
  updateGloomUser,
  forage,
  negotiateSpirit,
  fuseSpirits,
  equipFamiliar,
  leaveTrace,
  getTraces,
  getBossStatus,
  attackBoss,
  unlockBossExtraAttack,
} = require('../src/services/gloomRealm');

console.log('Iniciando suíte de testes de Crônicas da Penumbra (Pyxie\'s Gloom Realm)...');

// 1. Validação dos 10 Cenários e Imagens Estáticas no Disco
const locationKeys = Object.keys(LOCATIONS);
assert.equal(locationKeys.length, 10, 'Devem existir exatamente 10 cenários configurados');

const assetsLocationsDir = path.join(__dirname, '..', 'assets', 'locations');
for (const [locId, loc] of Object.entries(LOCATIONS)) {
  assert(loc.name.pt && loc.name.en, `Cenário ${locId} deve ter nome bilíngue`);
  assert(loc.desc.pt && loc.desc.en, `Cenário ${locId} deve ter descrição bilíngue`);
  assert(Array.isArray(loc.neighbors) && loc.neighbors.length > 0, `Cenário ${locId} deve ter vizinhos conectados`);

  const imagePath = path.join(assetsLocationsDir, loc.image);
  assert(fs.existsSync(imagePath), `Arquivo de imagem ${loc.image} DEVE existir em assets/locations/`);
  const stat = fs.statSync(imagePath);
  assert(stat.size > 1000, `Imagem ${loc.image} não pode estar vazia`);
}
console.log('✅ 10 Cenários e arquivos de imagem estáticos validados com sucesso.');

// 2. Validação do Grafo de Navegação e Conexões
for (const [locId, loc] of Object.entries(LOCATIONS)) {
  for (const nId of loc.neighbors) {
    assert(LOCATIONS[nId], `Vizinho ${nId} do cenário ${locId} deve existir no catálogo de localidades`);
  }
}

const testUser = {
  userId: 'test_user_graph',
  currentLocation: 'portao_penumbra',
  visitedLocations: ['portao_penumbra'],
  inventory: {},
  phantomCoins: 100,
  equippedFamiliars: [],
};

const tide = getGloomTide();
const neighbors = gloomGraph.getAvailableNeighbors('portao_penumbra', testUser, tide);
assert(neighbors.length >= 2, 'Portão da Penumbra deve ter pelo menos 2 vizinhos acessíveis');
assert(neighbors.some((n) => n.location.id === 'cemiterio_espinhos' && n.canEnter === true), 'Cemitério dos Espinhos deve ser acessível do Portão');
console.log('✅ Grafo de nós direcionado e adjacências validados com sucesso.');

// 3. Validação dos 14 Espíritos / Sombras em 4 Tiers
const spiritKeys = Object.keys(SPIRITS);
assert.equal(spiritKeys.length, 14, 'Devem existir exatamente 14 espíritos catalogados');

const tiers = { 1: 0, 2: 0, 3: 0, 4: 0 };
for (const [sId, spirit] of Object.entries(SPIRITS)) {
  assert(spirit.name.pt && spirit.name.en, `Espírito ${sId} deve ter nome bilíngue`);
  assert(spirit.dialogue.question.pt && spirit.dialogue.question.en, `Espírito ${sId} deve ter pergunta bilíngue`);
  assert(Array.isArray(spirit.dialogue.choices) && spirit.dialogue.choices.length === 3, `Espírito ${sId} deve ter 3 escolhas de diálogo`);
  assert(spirit.dialogue.bribeCost > 0, `Espírito ${sId} deve ter custo de suborno positivo`);
  assert(spirit.aura && spirit.aura.name.pt && spirit.aura.desc.pt, `Espírito ${sId} deve ter aura passiva com descrição`);
  tiers[spirit.tier] = (tiers[spirit.tier] || 0) + 1;
}

assert(tiers[1] >= 4, 'Tier 1 deve ter pelo menos 4 criaturas');
assert(tiers[2] >= 4, 'Tier 2 deve ter pelo menos 4 criaturas');
assert(tiers[3] >= 4, 'Tier 3 deve ter pelo menos 4 criaturas');
assert(tiers[4] >= 2, 'Tier 4 deve ter pelo menos 2 criaturas lendárias');
console.log('✅ Roster de 14 espíritos em 4 Tiers com auras e diálogos Atlus validado.');

// 4. Teste de Negociação de Espíritos (Atlus DemiKids Style)
const uidNegotiate = `user_neg_${Date.now()}`;
const userNeg = getGloomUser(uidNegotiate);
userNeg.phantomCoins = 100;
userNeg.grimoire = [];
updateGloomUser(uidNegotiate, userNeg);

// Escolha de Sagacidade (Wit) Correta
const resWit = negotiateSpirit(uidNegotiate, 'espectro_baixo_astral', 'c1');
assert.equal(resWit.success, true);
assert.equal(resWit.recruited, true);
assert(resWit.rewardCoins > 0, 'Negociação vitoriosa deve premiar Phantom Coins');
const userAfterWit = getGloomUser(uidNegotiate);
assert(userAfterWit.grimoire.includes('espectro_baixo_astral'), 'Espírito recrutado deve estar no Grimório');

// Escolha Incorreta (Espírito Foge)
const resFail = negotiateSpirit(uidNegotiate, 'gargula_procrastinador', 'c3');
assert.equal(resFail.success, true);
assert.equal(resFail.recruited, false);
assert.equal(resFail.escaped, true);

// Suborno com Phantom Coins
const coinsBeforeBribe = userAfterWit.phantomCoins;
const resBribe = negotiateSpirit(uidNegotiate, 'gargula_procrastinador', null, true);
assert.equal(resBribe.success, true);
assert.equal(resBribe.recruited, true);
assert.equal(resBribe.method, 'bribe');
const userAfterBribe = getGloomUser(uidNegotiate);
assert(userAfterBribe.grimoire.includes('gargula_procrastinador'), 'Espírito subornado deve estar no Grimório');
assert(userAfterBribe.phantomCoins < coinsBeforeBribe, 'Suborno deve deduzir Phantom Coins');
console.log('✅ Sistema de Negociação Atlus (Sagacidade vs Suborno vs Fuga) validado.');

// 5. Teste de Caldeirão de Fusão de Almas (Soul Fusion)
const uidFuse = `user_fuse_${Date.now()}`;
const userFuse = getGloomUser(uidFuse);
userFuse.phantomCoins = 100;
userFuse.grimoire = ['corvo_poeta', 'gargula_procrastinador'];
updateGloomUser(uidFuse, userFuse);

// Fusão Cruzada: Corvo Poeta + Gárgula Procrastinador = Quimera da Madrugada
const resCross = fuseSpirits(uidFuse, 'corvo_poeta', 'gargula_procrastinador');
assert.equal(resCross.success, true);
assert.equal(resCross.resultSpirit.id, 'quimera_madrugada');
const userAfterCross = getGloomUser(uidFuse);
assert(userAfterCross.grimoire.includes('quimera_madrugada'), 'Quimera da Madrugada deve estar no Grimório após fusão');
assert(!userAfterCross.grimoire.includes('corvo_poeta'), 'Ingrediente corvo_poeta deve ser consumido');
assert(!userAfterCross.grimoire.includes('gargula_procrastinador'), 'Ingrediente gargula_procrastinador deve ser consumido');
assert.equal(userAfterCross.phantomCoins, 70, 'Custo de 30 Phantom Coins deve ser deduzido');

// Fusão Pura: 2x Espectro do Baixo Astral = Lorde da Apatia
userAfterCross.grimoire.push('espectro_baixo_astral');
userAfterCross.phantomCoins = 100;
updateGloomUser(uidFuse, userAfterCross);

const resPure = fuseSpirits(uidFuse, 'espectro_baixo_astral', 'espectro_baixo_astral');
assert.equal(resPure.success, true);
assert.equal(resPure.resultSpirit.id, 'lorde_apatia');
const userAfterPure = getGloomUser(uidFuse);
assert(userAfterPure.grimoire.includes('lorde_apatia'), 'Lorde da Apatia deve ser forjado na fusão pura');
console.log('✅ Caldeirão de Fusão de Almas (Fusão Pura e Cruzada DemiKids) validado.');

// 6. Teste de Energia e Limite de 10 Forrageamentos/Hora
const uidEnergy = `user_energy_${Date.now()}`;
const userEnergy = getGloomUser(uidEnergy);
assert.equal(userEnergy.energy, 10, 'Novo aventureiro deve iniciar com 10 de energia');

for (let i = 0; i < 10; i++) {
  const res = forage(uidEnergy, 'portao_penumbra');
  assert.equal(res.success, true, `Forrageamento ${i + 1} deve ter sucesso`);
}

// 11º forrageamento no mesmo período deve falhar por falta de energia
const resExhausted = forage(uidEnergy, 'portao_penumbra');
assert.equal(resExhausted.success, false, '11º forrageamento deve falhar');
assert.equal(resExhausted.reason, 'no_energy');
assert(resExhausted.timeRemainingSec > 0, 'Deve retornar o tempo restante para recarga');
console.log('✅ Limite de 10 forrageamentos/hora e controle de energia validados.');

// 7. Teste de Rastros de Giz Roxo com Custo de Phantom Coins
const uidTrace = `user_trace_${Date.now()}`;
const userTrace = getGloomUser(uidTrace);
userTrace.phantomCoins = 50;
updateGloomUser(uidTrace, userTrace);

const guildTest = 'guild_test_traces';
const resTrace = leaveTrace(guildTest, 'portao_penumbra', uidTrace, 'Leandro', 'Cuidado com os corvos violeta.', 10);
assert.equal(resTrace.success, true);
assert.equal(resTrace.cost, 25, 'Custo deve ser 15 base + 10 de oferenda = 25 Phantom Coins');
const userAfterTrace = getGloomUser(uidTrace);
assert.equal(userAfterTrace.phantomCoins, 25, 'Saldo de Phantom Coins deve ser debitado');

const tracesFound = getTraces(guildTest, 'portao_penumbra');
assert(tracesFound.length > 0, 'Rastro gravado deve ser recuperado com sucesso');
assert.equal(tracesFound[0].message, 'Cuidado com os corvos violeta.');
assert.equal(tracesFound[0].offering, 10);
console.log('✅ Rastros de giz roxo com cobrança de Phantom Coins validados.');

// 8. Teste de Chefão Comunitário e Bônus Web Patrocinado de 10s
const uidBoss = `user_boss_${Date.now()}`;
const userBoss = getGloomUser(uidBoss);
userBoss.phantomCoins = 0;
updateGloomUser(uidBoss, userBoss);

// 1ª Investida Gratuita
const resBoss1 = attackBoss(uidBoss, 'strike', 'pt');
assert.equal(resBoss1.success, true);
assert(resBoss1.damage >= 50, 'Dano deve ser de pelo menos 50');
assert.equal(resBoss1.rewardCoins, 35, 'Investida deve recompensar 35 Phantom Coins');

// 2ª Investida Sem Anúncio (Bloqueada por Cooldown)
const resBoss2 = attackBoss(uidBoss, 'strike', 'pt');
assert.equal(resBoss2.success, false);
assert.equal(resBoss2.reason, 'cooldown_web_bonus');
assert(resBoss2.bonusUrl && resBoss2.bonusUrl.includes('/bonus?token='), 'Deve gerar URL de bônus web de 10s');

// Desbloqueio da 2ª Investida via Bônus Web
const resUnlock = unlockBossExtraAttack(uidBoss);
assert.equal(resUnlock.success, true);
assert.equal(resUnlock.phantomCoins, 85, 'Deve receber +50 Phantom Coins pelo anúncio de 10s');

// 2ª Investida Após Anúncio (Sucesso Garantido)
const resBoss3 = attackBoss(uidBoss, 'strike', 'pt');
assert.equal(resBoss3.success, true, '2ª investida após bônus deve ser executada com sucesso');
console.log('✅ Chefão Comunitário com investida grátis e bônus patrocinado de 10s validado.');

console.log('\n🎉 Todos os testes de Crônicas da Penumbra (Pyxie\'s Gloom Realm) passaram com 100% de sucesso!');
