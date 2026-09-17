const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  createNewVpet,
  getActiveVpet,
  feedMeat,
  feedPill,
  cleanPoop,
  toggleLight,
  curePet,
  trainPet,
  checkEvolution,
  evolvePet,
  calculateVpetState,
} = require('../src/services/vpet/vpetCore');

const {
  VPET_SPECIES,
  VPET_EGGS,
  STAGES,
  getVpetSpecies,
  getVpetSpriteUrl,
} = require('../src/services/vpet/vpetSpecies');

const { resolveSparring } = require('../src/services/vpet/vpetCombat');
const { getVpetDialogue } = require('../src/services/vpet/vpetDialogues');
const { buildVpetEmbed, buildVpetActionRows } = require('../src/services/vpet/vpetEmbed');

const TEST_USER = `test_vpet_user_${Date.now()}`;

console.log('Iniciando testes do novo sistema V-Pet (Digimon V-Pet + Estilo MapleStory 1)...');

// 1. Criação e Onboarding
const initialPet = createNewVpet(TEST_USER, 'slime', 'egg_mystic', 'Geleinha');
assert.ok(initialPet, 'Pet deve ser criado com sucesso');
assert.equal(initialPet.name, 'Geleinha');
assert.equal(initialPet.key, 'slime');
assert.equal(initialPet.stage, STAGES.BABY_1);
assert.equal(initialPet.hungerHearts, 4);
assert.equal(initialPet.strengthHearts, 4);
assert.equal(initialPet.poopCount, 0);

// 2. Recuperação de Pet Ativo
const active = getActiveVpet(TEST_USER);
assert.equal(active.id, initialPet.id);
assert.equal(active.key, 'slime');

// 3. Alimentação de Carne (+1 fome, +1g peso)
active.hungerHearts = 2;
active.weight = 8;
const feedRes = feedMeat(TEST_USER);
assert.equal(feedRes.success, true);
assert.equal(feedRes.hungerHearts, 3);
assert.equal(feedRes.weight, 9);

// 4. Alimentação de Pílula (+1 força, +2g peso)
active.strengthHearts = 2;
const pillRes = feedPill(TEST_USER);
assert.equal(pillRes.success, true);
assert.equal(pillRes.strengthHearts, 3);
assert.equal(pillRes.weight, 11);

// 5. Higiene e Limpeza de Cocô
active.poopCount = 3;
const cleanRes = cleanPoop(TEST_USER);
assert.equal(cleanRes.success, true);
assert.equal(cleanRes.cleanedCount, 3);
assert.equal(getActiveVpet(TEST_USER).poopCount, 0);

// 6. Luz e Sono
assert.equal(active.lightOff, false);
const lightRes = toggleLight(TEST_USER);
assert.equal(lightRes.success, true);
assert.equal(lightRes.lightOff, true);

// 7. Doença e Cura
active.isSick = true;
const cureRes = curePet(TEST_USER);
assert.equal(cureRes.success, true);
assert.equal(getActiveVpet(TEST_USER).isSick, false);

// 8. Treinamento Interativo
toggleLight(TEST_USER); // Acende a luz para o pet poder treinar
const initialTrains = getActiveVpet(TEST_USER).trainCount || 0;
const trainRes = trainPet(TEST_USER, 'mid');
assert.equal(trainRes.success, true);
assert.equal(trainRes.trainCount, initialTrains + 1);

// 9. Sparring e Combate Leve
const sparRes = resolveSparring(active, 0, 'pt');
assert.ok(sparRes.rounds.length >= 2);
assert.ok(sparRes.petSpriteState === 'attack' || sparRes.petSpriteState === 'hit');

// 10. Balões de Diálogo MapleStory 1
const dialoguePt = getVpetDialogue('slime', 'idle', 'pt');
const dialogueEn = getVpetDialogue('slime', 'idle', 'en');
assert.ok(typeof dialoguePt === 'string' && dialoguePt.length > 5);
assert.ok(typeof dialogueEn === 'string' && dialogueEn.length > 5);

// 11. URLs de Sprites Públicos Dinâmicos (Zero Canvas)
const idleUrl = getVpetSpriteUrl('slime', 'idle');
assert.ok(idleUrl.endsWith('slime_idle.gif'));
const attackUrl = getVpetSpriteUrl('dragon', 'attack');
assert.ok(attackUrl.endsWith('dragon_attack.gif'));
const sleepUrl = getVpetSpriteUrl('reptile', 'idle', true, true);
assert.ok(sleepUrl.includes('sleep.png'));

// 12. Construção de Embeds e Botões
const embed = buildVpetEmbed(active, { id: TEST_USER }, 'pt');
assert.ok(embed.data.title.includes('Geleinha'));
assert.ok(embed.data.thumbnail.url.length > 0);

const buttons = buildVpetActionRows(active, 'pt');
assert.equal(buttons.length, 2, 'Deve ter 2 linhas de botões interativos');

// 13. Cálculo Preguiçoso de Delta-Time
const now = Date.now();
active.lastFedAt = now - (5 * 60 * 60 * 1000); // 5 horas atrás = perde 2 corações
active.lastPoopAt = now - (6 * 60 * 60 * 1000); // 6 horas atrás = +2 cocôs
const updatedState = calculateVpetState(active, now);
assert.equal(updatedState.hungerHearts, 1, 'Após 5h deve ter perdido 2 corações de fome');
assert.equal(updatedState.poopCount, 2, 'Após 6h deve ter acumulado 2 cocôs');

// 14. Evolução Ramificada Digimon V-Pet
// Slime com 10g de peso evolui para mushroom
active.weight = 10;
active.bornAt = Date.now() - (20 * 60 * 1000); // 20 minutos de vida
const evoCheck = checkEvolution(active);
assert.equal(evoCheck.canEvolve, true);
assert.equal(evoCheck.targetSpecies, 'mushroom');

const evolvedRes = evolvePet(TEST_USER);
assert.equal(evolvedRes.success, true);
assert.equal(evolvedRes.newSpecies, 'mushroom');
assert.equal(getActiveVpet(TEST_USER).key, 'mushroom');
assert.equal(getActiveVpet(TEST_USER).stage, STAGES.BABY_2);

console.log('✅ Todos os testes do V-Pet foram aprovados com 100% de sucesso!');
