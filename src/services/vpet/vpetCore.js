const fs = require('node:fs');
const path = require('node:path');
const { VPET_SPECIES, VPET_EGGS, STAGES, getVpetSpecies } = require('./vpetSpecies');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');
const PETS_FILE = path.join(DATA_DIR, 'pets.json');

const HUNGER_DECAY_MS = 2.5 * 60 * 60 * 1000; // 2.5 hours per heart
const STRENGTH_DECAY_MS = 3.5 * 60 * 60 * 1000; // 3.5 hours per heart
const POOP_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours per poop
const CARE_MISTAKE_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins unanswered call

let petsMemoryCache = null;

function loadAllPets() {
  if (petsMemoryCache) return petsMemoryCache;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PETS_FILE)) {
    fs.writeFileSync(PETS_FILE, JSON.stringify({}, null, 2), 'utf8');
    petsMemoryCache = {};
    return petsMemoryCache;
  }
  try {
    const raw = fs.readFileSync(PETS_FILE, 'utf8');
    petsMemoryCache = JSON.parse(raw);
  } catch {
    petsMemoryCache = {};
  }
  return petsMemoryCache;
}

function saveAllPets() {
  if (!petsMemoryCache) return;
  try {
    fs.writeFileSync(PETS_FILE, JSON.stringify(petsMemoryCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[vpetCore] Error saving pets.json:', err);
  }
}

function migrateOldPet(pet) {
  if (pet.vpetV2) return pet; // Already migrated

  // Map old keys to new CC0 species
  let newKey = 'slime';
  const oldKey = String(pet.key || '').toLowerCase();
  const lvl = pet.level || 1;

  if (oldKey === 'bonorka') {
    newKey = lvl >= 15 ? 'boar' : (lvl >= 6 ? 'turtle' : 'slime');
  } else if (oldKey === 'cinna') {
    newKey = lvl >= 15 ? 'dragon' : (lvl >= 6 ? 'ghost' : 'slime');
  } else if (oldKey === 'pomcorin' || oldKey === 'clovis') {
    newKey = lvl >= 15 ? 'reptile' : (lvl >= 6 ? 'dino' : 'mushroom');
  } else if (oldKey === 'bakuphant') {
    newKey = lvl >= 15 ? 'giant' : 'boar';
  } else if (oldKey === 'nekomandra' || oldKey === 'nekoterra') {
    newKey = lvl >= 15 ? 'snake' : 'bat';
  } else if (oldKey === 'rionator') {
    newKey = lvl >= 20 ? 'dragon' : 'tyranno';
  } else if (oldKey === 'kerobola' || oldKey === 'spiromuffin') {
    newKey = 'mimic';
  }

  const spec = getVpetSpecies(newKey);

  pet.vpetV2 = true;
  pet.key = spec.key;
  pet.species = spec.name.pt;
  pet.element = spec.element;
  pet.emoji = spec.emoji;
  pet.stage = spec.stage;
  pet.hungerHearts = Math.min(4, Math.max(1, Math.round((pet.hunger || 80) / 25)));
  pet.strengthHearts = 3;
  pet.weight = spec.minWeight + Math.min(10, lvl);
  pet.poopCount = 0;
  pet.careMistakes = 0;
  pet.trainCount = Math.max(0, (lvl - 1) * 3);
  pet.battlesCount = 0;
  pet.battlesWon = 0;
  pet.isSick = false;
  pet.lightOff = false;
  pet.bornAt = pet.createdAt || Date.now();
  pet.lastFedAt = Date.now();
  pet.lastTrainedAt = Date.now();
  pet.lastPoopAt = Date.now();
  pet.lastInteraction = Date.now();
  pet.lastMistakeCheckAt = Date.now();

  return pet;
}

/**
 * Motor puramente preguiçoso de Delta-Time.
 * Calcula estado atualizado sem timers em background.
 */
function calculateVpetState(pet, now = Date.now()) {
  if (!pet) return null;
  migrateOldPet(pet);

  const elapsed = Math.max(0, now - (pet.lastInteraction || now));
  pet.lastInteraction = now;

  // 1. Decaimento de fome
  const hungerElapsed = now - (pet.lastFedAt || now);
  const heartsLost = Math.floor(hungerElapsed / HUNGER_DECAY_MS);
  if (heartsLost > 0) {
    pet.hungerHearts = Math.max(0, (pet.hungerHearts || 4) - heartsLost);
    pet.lastFedAt = now - (hungerElapsed % HUNGER_DECAY_MS);
  }

  // 2. Decaimento de força
  const trainElapsed = now - (pet.lastTrainedAt || now);
  const strengthLost = Math.floor(trainElapsed / STRENGTH_DECAY_MS);
  if (strengthLost > 0) {
    pet.strengthHearts = Math.max(0, (pet.strengthHearts || 3) - strengthLost);
    pet.lastTrainedAt = now - (trainElapsed % STRENGTH_DECAY_MS);
  }

  // 3. Acúmulo de cocô
  const poopElapsed = now - (pet.lastPoopAt || now);
  const poopsGenerated = Math.floor(poopElapsed / POOP_INTERVAL_MS);
  if (poopsGenerated > 0) {
    pet.poopCount = Math.min(4, (pet.poopCount || 0) + poopsGenerated);
    pet.lastPoopAt = now - (poopElapsed % POOP_INTERVAL_MS);
  }

  // Se acumular 4 cocôs por mais de 1 hora, adoece
  if (pet.poopCount >= 4 && !pet.isSick) {
    pet.isSick = true;
  }

  // 4. Sono
  // Horário natural de sono entre 22:00 e 07:00
  const hour = new Date(now).getHours();
  const isNightTime = hour >= 22 || hour < 7;
  pet.isSleeping = isNightTime;

  // 5. Erros de cuidado (Care Mistakes)
  const isCalling = pet.hungerHearts === 0 || (pet.isSleeping && !pet.lightOff);
  if (isCalling) {
    const unattendedDuration = now - (pet.lastMistakeCheckAt || now);
    if (unattendedDuration >= CARE_MISTAKE_TIMEOUT_MS) {
      const newMistakes = Math.min(3, Math.floor(unattendedDuration / CARE_MISTAKE_TIMEOUT_MS));
      pet.careMistakes = (pet.careMistakes || 0) + newMistakes;
      pet.lastMistakeCheckAt = now;
    }
  } else {
    pet.lastMistakeCheckAt = now;
  }

  return pet;
}

function getUserData(userId) {
  const all = loadAllPets();
  if (!all[userId]) {
    all[userId] = {
      activePetId: null,
      maxPets: 3,
      pets: [],
      claimedStarterKit: false,
      incubator: { maxSlots: 3, slots: [] },
    };
  }
  return all[userId];
}

function getActiveVpet(userId) {
  const udata = getUserData(userId);
  if (!udata.activePetId || !Array.isArray(udata.pets) || udata.pets.length === 0) {
    return null;
  }
  const pet = udata.pets.find((p) => p.id === udata.activePetId) || udata.pets[0];
  return calculateVpetState(pet);
}

function createNewVpet(userId, speciesKey = 'slime', eggKey = 'egg_mystic', customName = null) {
  const udata = getUserData(userId);
  const spec = getVpetSpecies(speciesKey);

  const petId = `vpet_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const newPet = {
    id: petId,
    vpetV2: true,
    key: spec.key,
    name: customName || spec.name.pt,
    species: spec.name.pt,
    element: spec.element,
    emoji: spec.emoji,
    eggOrigin: eggKey,
    stage: spec.stage,
    level: 1,
    stats: { ...spec.baseStats },
    hungerHearts: 4,
    strengthHearts: 4,
    weight: spec.minWeight + 2,
    poopCount: 0,
    careMistakes: 0,
    trainCount: 0,
    battlesCount: 0,
    battlesWon: 0,
    isSick: false,
    lightOff: false,
    isSleeping: false,
    bornAt: Date.now(),
    lastFedAt: Date.now(),
    lastTrainedAt: Date.now(),
    lastPoopAt: Date.now(),
    lastInteraction: Date.now(),
    lastMistakeCheckAt: Date.now(),
  };

  udata.pets.push(newPet);
  udata.activePetId = petId;
  udata.claimedStarterKit = true;
  saveAllPets();
  return newPet;
}

function feedMeat(userId) {
  const pet = getActiveVpet(userId);
  if (!pet) return { success: false, reason: 'no_pet' };
  if (pet.isSleeping && pet.lightOff) return { success: false, reason: 'sleeping' };
  if (pet.hungerHearts >= 4) return { success: false, reason: 'already_full' };

  pet.hungerHearts = Math.min(4, pet.hungerHearts + 1);
  pet.weight += 1;
  pet.lastFedAt = Date.now();
  pet.lastMistakeCheckAt = Date.now();
  saveAllPets();

  return {
    success: true,
    hungerHearts: pet.hungerHearts,
    weight: pet.weight,
    pet,
  };
}

function feedPill(userId) {
  const pet = getActiveVpet(userId);
  if (!pet) return { success: false, reason: 'no_pet' };
  if (pet.isSleeping && pet.lightOff) return { success: false, reason: 'sleeping' };
  if (pet.strengthHearts >= 4) return { success: false, reason: 'already_max_strength' };

  pet.strengthHearts = Math.min(4, pet.strengthHearts + 1);
  pet.weight += 2;
  pet.lastTrainedAt = Date.now();
  saveAllPets();

  return {
    success: true,
    strengthHearts: pet.strengthHearts,
    weight: pet.weight,
    pet,
  };
}

function cleanPoop(userId) {
  const pet = getActiveVpet(userId);
  if (!pet) return { success: false, reason: 'no_pet' };
  if (pet.poopCount === 0) return { success: false, reason: 'already_clean' };

  const cleaned = pet.poopCount;
  pet.poopCount = 0;
  pet.lastPoopAt = Date.now();
  saveAllPets();

  return {
    success: true,
    cleanedCount: cleaned,
    pet,
  };
}

function toggleLight(userId) {
  const pet = getActiveVpet(userId);
  if (!pet) return { success: false, reason: 'no_pet' };

  pet.lightOff = !pet.lightOff;
  pet.lastMistakeCheckAt = Date.now();
  saveAllPets();

  return {
    success: true,
    lightOff: pet.lightOff,
    isSleeping: pet.isSleeping,
    pet,
  };
}

function curePet(userId) {
  const pet = getActiveVpet(userId);
  if (!pet) return { success: false, reason: 'no_pet' };
  if (!pet.isSick) return { success: false, reason: 'not_sick' };

  pet.isSick = false;
  saveAllPets();

  return {
    success: true,
    pet,
  };
}

function trainPet(userId, playerDirection) {
  const pet = getActiveVpet(userId);
  if (!pet) return { success: false, reason: 'no_pet' };
  if (pet.isSleeping && pet.lightOff) return { success: false, reason: 'sleeping' };
  if (pet.isSick) return { success: false, reason: 'sick' };

  const directions = ['high', 'mid', 'low'];
  const targetDir = directions[Math.floor(Math.random() * directions.length)];
  const win = playerDirection === targetDir;

  const spec = getVpetSpecies(pet.key);
  pet.trainCount = (pet.trainCount || 0) + 1;

  if (win) {
    pet.strengthHearts = Math.min(4, (pet.strengthHearts || 0) + 1);
    pet.weight = Math.max(spec.minWeight, pet.weight - 2);
    pet.lastTrainedAt = Date.now();
  } else {
    pet.weight = Math.max(spec.minWeight, pet.weight - 1);
  }

  saveAllPets();

  return {
    success: true,
    win,
    targetDirection: targetDir,
    trainCount: pet.trainCount,
    strengthHearts: pet.strengthHearts,
    weight: pet.weight,
    pet,
  };
}

function checkEvolution(pet) {
  if (!pet) return { canEvolve: false };
  const spec = getVpetSpecies(pet.key);
  if (!spec.evolutions || spec.evolutions.length === 0) {
    return { canEvolve: false, reason: 'max_stage' };
  }

  const ageMinutes = Math.floor((Date.now() - pet.bornAt) / (60 * 1000));
  const battles = pet.battlesCount || 0;
  const winRate = battles > 0 ? ((pet.battlesWon || 0) / battles) * 100 : 0;
  const mistakes = pet.careMistakes || 0;
  const trains = pet.trainCount || 0;

  for (const evo of spec.evolutions) {
    if (evo.minAgeMinutes && ageMinutes < evo.minAgeMinutes) continue;
    if (evo.minMistakes !== undefined && mistakes < evo.minMistakes) continue;
    if (evo.maxMistakes !== undefined && mistakes > evo.maxMistakes) continue;
    if (evo.minTrain !== undefined && trains < evo.minTrain) continue;
    if (evo.minBattles !== undefined && battles < evo.minBattles) continue;
    if (evo.minWinRate !== undefined && winRate < evo.minWinRate) continue;
    if (evo.minWeight !== undefined && pet.weight < evo.minWeight) continue;
    if (evo.maxWeight !== undefined && pet.weight > evo.maxWeight) continue;

    return {
      canEvolve: true,
      targetSpecies: evo.target,
      nextSpec: getVpetSpecies(evo.target),
    };
  }

  return { canEvolve: false, reason: 'requirements_not_met' };
}

function evolvePet(userId) {
  const pet = getActiveVpet(userId);
  if (!pet) return { success: false, reason: 'no_pet' };

  const check = checkEvolution(pet);
  if (!check.canEvolve) {
    return { success: false, reason: check.reason };
  }

  const prevKey = pet.key;
  const nextSpec = check.nextSpec;

  pet.key = nextSpec.key;
  pet.species = nextSpec.name.pt;
  pet.stage = nextSpec.stage;
  pet.element = nextSpec.element;
  pet.emoji = nextSpec.emoji;
  pet.stats = { ...nextSpec.baseStats };
  pet.weight = Math.max(nextSpec.minWeight, pet.weight);
  pet.lastInteraction = Date.now();

  saveAllPets();

  return {
    success: true,
    previousSpecies: prevKey,
    newSpecies: nextSpec.key,
    pet,
  };
}

module.exports = {
  loadAllPets,
  saveAllPets,
  getUserData,
  getActiveVpet,
  createNewVpet,
  calculateVpetState,
  feedMeat,
  feedPill,
  cleanPoop,
  toggleLight,
  curePet,
  trainPet,
  checkEvolution,
  evolvePet,
};

