const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {
  LOCATIONS,
  SPIRITS,
  FUSION_RECIPES,
  RELICS,
  ENGINEER_RECIPES,
  ROOM_BAN_DURATIONS_MS,
  gloomGraph,
  getGloomTide,
  getGloomUser,
  updateGloomUser,
  forage,
  scavengeLocation,
  isLocationBanned,
  banUserFromLocation,
  generateMerchantStock,
  buyMerchantRelic,
  upgradeRelicsWithEngineer,
  negotiateSpirit,
  fuseSpirits,
  equipFamiliar,
  leaveTrace,
  getTraces,
  getBossStatus,
  attackBoss,
  unlockBossExtraAttack,
  getEncounters,
  getEncounterById,
  getEncounterForSpirit,
  getRandomEncounter,
} = require('../src/services/gloomRealm');
const { handleDirectMove, handleDirectVasculhar } = require('../src/commands/explore');

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

// Garantir que o Boss tenha HP suficiente para não resetar ciclo por morte durante o teste
const currentBoss = getBossStatus();
if (currentBoss.currentHp < 500) {
  currentBoss.currentHp = currentBoss.maxHp;
}

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

// Teste de Acesso ao Santuário Secreto (Requer ter atacado o boss no ciclo atual)
const uidSanctuary = `user_sanc_${Date.now()}`;
const userSanctuary = getGloomUser(uidSanctuary);
const tideTest = getGloomTide();
const neighborsBeforeAttack = gloomGraph.getAvailableNeighbors('mausoleu_ancestral', userSanctuary, tideTest);
const sancNeighborBefore = neighborsBeforeAttack.find((n) => n.location.id === 'santuario_touca_preta');
assert.equal(sancNeighborBefore.canEnter, false, 'Não deve entrar no Santuário Secreto antes de participar do Chefão');
assert.equal(sancNeighborBefore.reason, 'requires_boss');

// Usuário ataca o Chefão
attackBoss(uidSanctuary, 'strike', 'pt');
const neighborsAfterAttack = gloomGraph.getAvailableNeighbors('mausoleu_ancestral', userSanctuary, tideTest);
const sancNeighborAfter = neighborsAfterAttack.find((n) => n.location.id === 'santuario_touca_preta');
assert.equal(sancNeighborAfter.canEnter, true, 'Deve poder entrar no Santuário Secreto após participar do Chefão');

// Simulação de expiração de 6 horas do ciclo
const gloomPath = path.join(__dirname, '..', 'data', 'gloom.json');
const diskDataCycle = JSON.parse(fs.readFileSync(gloomPath, 'utf8'));
diskDataCycle.worldBoss.cycleStart = Date.now() - (7 * 60 * 60 * 1000); // 7 horas atrás
fs.writeFileSync(gloomPath, JSON.stringify(diskDataCycle, null, 2), 'utf8');
try { fs.utimesSync(gloomPath, new Date(Date.now() + 2000), new Date(Date.now() + 2000)); } catch (_) {}

// Ao consultar o status do boss, o ciclo é resetado e a permissão revogada para o novo ciclo
getBossStatus();
const neighborsNewCycle = gloomGraph.getAvailableNeighbors('mausoleu_ancestral', userSanctuary, tideTest);
const sancNeighborNewCycle = neighborsNewCycle.find((n) => n.location.id === 'santuario_touca_preta');
assert.equal(sancNeighborNewCycle.canEnter, false, 'Acesso ao Santuário deve expirar com o novo ciclo de 6 horas');
assert.equal(sancNeighborNewCycle.reason, 'requires_boss');
console.log('✅ Ciclo de 6 horas do Chefão e acesso temporário ao Santuário Secreto validados.');

// 9. Teste de Invalidação de Cache Multi-Processo via mtimeMs
const uidCache = `user_cache_${Date.now()}`;
const userCache = getGloomUser(uidCache);
assert.equal(userCache.phantomCoins, 50);

const diskData = JSON.parse(fs.readFileSync(gloomPath, 'utf8'));
diskData.users[uidCache].phantomCoins = 999;
fs.writeFileSync(gloomPath, JSON.stringify(diskData, null, 2), 'utf8');
try { fs.utimesSync(gloomPath, new Date(Date.now() + 4000), new Date(Date.now() + 4000)); } catch (_) {}

const reloadedUser = getGloomUser(uidCache);
assert.equal(reloadedUser.phantomCoins, 999, 'getGloomUser deve invalidar o cache em memória e recarregar dados novos do disco');
console.log('✅ Invalidação de cache multi-processo em disco (mtimeMs) validada com sucesso.');

// 10. Validação de Tiers de Sala (1 a 5) e Duração dos Banimentos (ROOM_BAN_DURATIONS_MS)
for (const [locId, loc] of Object.entries(LOCATIONS)) {
  assert([1, 2, 3, 4, 5].includes(loc.tier), `Cenário ${locId} deve possuir Tier entre 1 e 5 (possui: ${loc.tier})`);
}
assert.equal(LOCATIONS.portao_penumbra.tier, 1, 'Portão das Fadas Decaídas deve ser Tier 1');
assert.equal(LOCATIONS.cemiterio_espinhos.tier, 1, 'Cemitério dos Cravos Roxos deve ser Tier 1');
assert.equal(LOCATIONS.mausoleu_ancestral.tier, 3, 'Mausoléu da Melancolia deve ser Tier 3');
assert.equal(LOCATIONS.biblioteca_esquecida.tier, 3, 'Biblioteca dos Manuscritos deve ser Tier 3');
assert.equal(LOCATIONS.catacumba_sangue_roxo.tier, 4, 'Catacumbas do Sangue Púrpura deve ser Tier 4');
assert.equal(LOCATIONS.jardim_fadas_negras.tier, 4, 'Jardim das Rosas de Vidro deve ser Tier 4');
assert.equal(LOCATIONS.santuario_touca_preta.tier, 5, 'Santuário Secreto de Pyxie deve ser Tier 5');

assert.equal(ROOM_BAN_DURATIONS_MS[1], 30 * 60 * 1000, 'Tier 1 deve ter banimento de 30 minutos');
assert.equal(ROOM_BAN_DURATIONS_MS[2], 60 * 60 * 1000, 'Tier 2 deve ter banimento de 1 hora');
assert.equal(ROOM_BAN_DURATIONS_MS[3], 120 * 60 * 1000, 'Tier 3 deve ter banimento de 2 horas');
assert.equal(ROOM_BAN_DURATIONS_MS[4], 180 * 60 * 1000, 'Tier 4 deve ter banimento de 3 horas');
assert.equal(ROOM_BAN_DURATIONS_MS[5], 240 * 60 * 1000, 'Tier 5 deve ter banimento de 4 horas');
console.log('✅ Tiers de dificuldade das 10 salas e durações de banimento validados.');

// 11. Teste de Falha Crítica na Negociação, Banimento de Sala e Ejeção
const uidBan = `user_ban_${Date.now()}`;
const userBan = getGloomUser(uidBan);
userBan.currentLocation = 'cemiterio_espinhos';
updateGloomUser(uidBan, userBan);

// Escolha ofensiva (score: -2 / criticalFailure: true)
const resCrit = negotiateSpirit(uidBan, 'gargula_procrastinador', 'c3');
assert.equal(resCrit.success, true);
assert.equal(resCrit.criticalFailure, true, 'Insulto deve gerar falha crítica');
assert.equal(resCrit.roomBanned, true, 'Falha crítica deve acionar banimento da sala');
assert.equal(resCrit.bannedLocation, 'cemiterio_espinhos', 'Local banido deve ser a sala atual');
assert.equal(resCrit.banDurationMinutes, 30, 'Tier 1 deve ter 30 minutos de banimento');

const userAfterCrit = getGloomUser(uidBan);
assert.equal(userAfterCrit.currentLocation, 'portao_penumbra', 'Jogador expulso deve ser ejetado para o Portão');
const banCheck = isLocationBanned(userAfterCrit, 'cemiterio_espinhos');
assert.equal(banCheck.banned, true, 'isLocationBanned deve retornar true para sala banida');
assert(banCheck.remainingMinutes > 0, 'Deve informar tempo restante');

// Tentar vasculhar na sala banida deve ser bloqueado
userAfterCrit.currentLocation = 'cemiterio_espinhos';
updateGloomUser(uidBan, userAfterCrit);
const resScavengeBanned = scavengeLocation(uidBan, 'cemiterio_espinhos');
assert.equal(resScavengeBanned.success, false);
assert.equal(resScavengeBanned.reason, 'room_banned', 'Vasculhar em sala banida deve falhar com reason room_banned');

// Grafo deve marcar vizinho banido como canEnter: false e reason: 'banned'
const neighborsOfPortao = gloomGraph.getAvailableNeighbors('portao_penumbra', userAfterCrit, getGloomTide());
const thornNeighbor = neighborsOfPortao.find((n) => n.location.id === 'cemiterio_espinhos');
assert.equal(thornNeighbor.canEnter, false, 'Cemitério dos Espinhos banido não pode ser acessível');
assert.equal(thornNeighbor.reason, 'banned', 'Razão de bloqueio deve ser banned');
console.log('✅ Falha crítica na negociação, banimento temporário por tier e ejeção validados.');

// 12. Teste do Comerciante de Relíquias (Relic Merchant)
const uidMerchant = `user_merch_${Date.now()}`;
const userMerchant = getGloomUser(uidMerchant);
userMerchant.phantomCoins = 500;
updateGloomUser(uidMerchant, userMerchant);

// Catálogo de relíquias T1 a T5
const relicKeys = Object.keys(RELICS);
assert(relicKeys.length >= 8, 'Devem existir pelo menos 8 relíquias cadastradas');
for (const [rId, relic] of Object.entries(RELICS)) {
  assert(relic.name.pt && relic.name.en, `Relíquia ${rId} deve ter nome bilíngue`);
  assert(relic.desc.pt && relic.desc.en, `Relíquia ${rId} deve ter descrição bilíngue`);
  assert([1, 2, 3, 4, 5].includes(relic.tier), `Relíquia ${rId} deve ter tier válido`);
  assert(relic.cost > 0, `Relíquia ${rId} deve ter custo em Phantom Coins`);
}

// Geração de estoque dinâmico
const stock = generateMerchantStock();
assert.equal(stock.length, 3, 'Estoque do comerciante deve ter exatamente 3 itens');

// Compra de relíquia
const resBuy = buyMerchantRelic(uidMerchant, 'amuleto_osso');
assert.equal(resBuy.success, true);
assert.equal(resBuy.relic.id, 'amuleto_osso');
const userAfterBuy = getGloomUser(uidMerchant);
assert.equal(userAfterBuy.inventory.amuleto_osso, 1, 'Item comprado deve estar no inventário');
assert.equal(userAfterBuy.phantomCoins, 500 - RELICS.amuleto_osso.cost, 'Phantom Coins devem ser debitadas');
console.log('✅ Comerciante de Relíquias e economia de Phantom Coins validados.');

// 13. Teste do Engenheiro de Relíquias (Fusão, Risco de Falha e Destruição de Materiais)
const uidEngineer = `user_eng_${Date.now()}`;
const userEngineer = getGloomUser(uidEngineer);
userEngineer.phantomCoins = 300;
userEngineer.inventory = {
  amuleto_osso: 2, // 2x Tier 1
  calice_lagrimas: 2, // 2x Tier 3
};
updateGloomUser(uidEngineer, userEngineer);

// Upgrade 100% de Tier 1 para Tier 2 (Custo: 25👻)
const resUpgradeT1 = upgradeRelicsWithEngineer(uidEngineer, 1);
assert.equal(resUpgradeT1.success, true);
assert.equal(resUpgradeT1.upgraded, true);
assert.equal(resUpgradeT1.targetTier, 2);
const userAfterT1 = getGloomUser(uidEngineer);
assert.equal(userAfterT1.inventory.amuleto_osso || 0, 0, '2x Tier 1 devem ser consumidos');
assert.equal(userAfterT1.phantomCoins, 275, '25 Phantom Coins devem ser debitadas');
assert(Object.keys(userAfterT1.inventory).some((k) => RELICS[k]?.tier === 2), 'Nova relíquia Tier 2 deve ser criada');

// Teste de Fracasso Forçado (Tier 3 -> Tier 4, Risco de Falha com destruição total)
const resFailUpgrade = upgradeRelicsWithEngineer(uidEngineer, 3, false, 'pt');
assert.equal(resFailUpgrade.success, true);
assert.equal(resFailUpgrade.upgraded, false);
assert.equal(resFailUpgrade.destroyed, true, 'Falha no aprimoramento deve destruir os materiais');
assert(resFailUpgrade.sarcasticQuote && resFailUpgrade.sarcasticQuote.length > 5, 'Deve retornar deboche do engenheiro');
const userAfterFail = getGloomUser(uidEngineer);
assert.equal(userAfterFail.inventory.calice_lagrimas || 0, 0, 'Materiais sacrificados devem ser perdidos para sempre');
assert.equal(userAfterFail.phantomCoins, 175, '100 Phantom Coins da tentativa devem ser debitadas');
console.log('✅ Engenheiro de Relíquias (aprimoramento e destruição permanente de materiais) validado.');
 
// 14. Validação da Tabela de Encontros Atlus SMT V2 (src/data/encounters.json)
const encounters = getEncounters();
assert(Array.isArray(encounters), 'Tabela de encontros deve ser uma lista');
assert.equal(encounters.length, 24, 'Devem existir exatamente 24 encontros catalogados (14 fixos + 10 errantes)');

const catalogedEncounters = encounters.filter((e) => e.is_cataloged === true);
const wandererEncounters = encounters.filter((e) => e.is_cataloged === false);
assert.equal(catalogedEncounters.length, 14, 'Devem existir exatamente 14 espíritos catalogados na tabela');
assert.equal(wandererEncounters.length, 10, 'Devem existir exatamente 10 criaturas errantes na tabela');

for (const enc of encounters) {
  assert(enc.id && typeof enc.id === 'string', `Encontro deve possuir ID válido: ${JSON.stringify(enc)}`);
  assert([1, 2, 3, 4, 5].includes(enc.tier), `Encontro ${enc.id} deve ter tier válido entre 1 e 5`);
  assert(enc.creature_concept?.pt && enc.creature_concept?.en, `Encontro ${enc.id} deve ter conceito bilíngue`);
  assert(enc.text_box_scene?.pt && enc.text_box_scene?.en, `Encontro ${enc.id} deve ter cena descritiva bilíngue`);
  assert(enc.monster_dialogue?.pt && enc.monster_dialogue?.en, `Encontro ${enc.id} deve ter diálogo inicial bilíngue`);
  assert(enc.mood_note?.pt && enc.mood_note?.en, `Encontro ${enc.id} deve ter nota de humor bilíngue`);

  if (enc.is_cataloged) {
    assert(enc.monster_id && SPIRITS[enc.monster_id], `Encontro catalogado ${enc.id} deve mapear para monstro válido em SPIRITS`);
  } else {
    assert.equal(enc.monster_id, null, `Encontro errante ${enc.id} deve ter monster_id nulo`);
  }

  assert(Array.isArray(enc.options) && enc.options.length >= 2, `Encontro ${enc.id} deve ter no mínimo 2 opções de resposta`);
  for (const opt of enc.options) {
    assert(opt.id && typeof opt.id === 'string', `Opção em ${enc.id} deve ter ID`);
    assert(opt.text?.pt && opt.text?.en, `Opção em ${enc.id} deve ter texto bilíngue`);
    assert(opt.text.pt.length <= 60, `Botão PT em ${enc.id} não pode exceder 60 caracteres: "${opt.text.pt}"`);
    assert(opt.text.en.length <= 60, `Botão EN em ${enc.id} não pode exceder 60 caracteres: "${opt.text.en}"`);
    assert(opt.success_dialogue?.pt && opt.success_dialogue?.en, `Opção em ${enc.id} deve ter diálogo de sucesso bilíngue`);
    assert(opt.failure_dialogue?.pt && opt.failure_dialogue?.en, `Opção em ${enc.id} deve ter diálogo de fracasso bilíngue`);
    assert([-2, -1, 0, 1, 2].includes(opt.success_chance_modifier), `Opção em ${enc.id} deve ter modificador válido`);
  }

  assert(enc.extortion_phase, `Encontro ${enc.id} deve ter fase de extorsão`);
  assert(['phantom_coins', 'energy', 'relic'].includes(enc.extortion_phase.demand_type), `Tipo de tributo em ${enc.id} deve ser phantom_coins, energy ou relic`);
}

// Helpers de encontro
const encFada = getEncounterForSpirit('fada_desencantada');
assert(encFada, 'Deve encontrar encontro para fada_desencantada');
assert.equal(encFada.monster_id, 'fada_desencantada');
assert.equal(encFada.is_cataloged, true);

const encById = getEncounterById('enc_t5_arquiteto_vazio');
assert(encById, 'Deve encontrar encontro do Tier 5 por ID');
assert.equal(encById.tier, 5);
assert.equal(encById.is_cataloged, false);

const encRandom = getRandomEncounter(2);
assert(encRandom && encRandom.tier === 2, 'getRandomEncounter deve retornar encontro do tier solicitado');
console.log('✅ Tabela de Encontros Atlus SMT V2 (24 encontros, limites de botão <= 60 chars, tributos estritos) validada.');

// 15. Teste de Armazenamento Atômico de room_cooldowns e Bloqueio de Comandos Diretos
const uidDirect = `user_direct_${Date.now()}`;
const userDirect = getGloomUser(uidDirect);
userDirect.currentLocation = 'portao_penumbra';
userDirect.phantomCoins = 200;
userDirect.energy = 5;
updateGloomUser(uidDirect, userDirect);

// Aplicar banimento na Floresta dos Sussurros
banUserFromLocation(uidDirect, 'floresta_sussurros');
const userAfterBanDirect = getGloomUser(uidDirect);
assert(userAfterBanDirect.room_cooldowns, 'user.room_cooldowns deve existir no perfil');
assert(userAfterBanDirect.room_cooldowns['floresta_sussurros'] > Date.now(), 'Cooldown da sala deve estar registrado no futuro');

// Tentar movimentação direta para sala banida deve retornar mensagem irônica
const moveBlockedResult = handleDirectMove(uidDirect, 'guild_test', { user: { id: uidDirect } }, 'floresta_sussurros');
assert(moveBlockedResult.content, 'Deve retornar mensagem de bloqueio');
assert(
  moveBlockedResult.content.includes('bloqueado') ||
  moveBlockedResult.content.includes('sealed') ||
  moveBlockedResult.content.includes('locked'),
  'Mensagem deve indicar bloqueio'
);
assert(
  moveBlockedResult.content.includes('banido') ||
  moveBlockedResult.content.includes('barred') ||
  moveBlockedResult.content.includes('banned'),
  'Mensagem deve citar o banimento da sala'
);

// Movimentação para sala válida não banida
const moveAllowedResult = handleDirectMove(uidDirect, 'guild_test', { user: { id: uidDirect } }, 'cemiterio_espinhos');
assert(moveAllowedResult.embeds, 'Movimentação permitida deve retornar Embed da localidade');
const userMoved = getGloomUser(uidDirect);
assert.equal(userMoved.currentLocation, 'cemiterio_espinhos', 'Jogador deve ter se movido para o Cemitério');

// Tentar vasculhar em sala banida via comando direto
userMoved.currentLocation = 'floresta_sussurros';
updateGloomUser(uidDirect, userMoved);
const scavengeBlocked = handleDirectVasculhar(uidDirect, 'guild_test', { user: { id: uidDirect } });
assert(scavengeBlocked.content, 'Vasculhar em sala banida deve retornar mensagem');
assert(
  scavengeBlocked.content.includes('banido') ||
  scavengeBlocked.content.includes('expulsaram') ||
  scavengeBlocked.content.includes('expelled') ||
  scavengeBlocked.content.includes('banned'),
  'Mensagem deve avisar que está banido da câmara'
);

console.log('✅ Armazenamento atômico de room_cooldowns, bloqueio irônico de movimento e vasculhar validados.');

console.log('\n🎉 Todos os testes de Bosque da Pyxie (Pyxie\'s Grove) passaram com 100% de sucesso!');
