const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  getBalance,
  spendCoins,
  addCoins,
  getMagicBeans,
  spendMagicBeans,
} = require('../../services/economy');
const dateQuestions = require('./dateQuestions');

function getMarriageDataFile() {
  return (
    process.env.MARRIAGE_DATA_PATH ||
    path.join(__dirname, '..', '..', '..', 'data', 'marriageData.json')
  );
}

const MARRIAGE_COST = 1000;
const DIVORCE_COST = 500;
const TREE_COST_BEANS = 1;
const TREE_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12h
const HOUSE_COST_COINS = 2000;
const HOUSE_COST_BEANS = 2;
const HOUSE_REQUIRED_LOVE = 50;
const VAULT_INTEREST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const DATE_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12h
const AFFECTION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_CHILDREN = 5;
const CHILD_COST = 800; // 1º gratuito, 2º a 5º 800 moedas
const CHILD_WORK_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Lê os dados de persistência do módulo Matrimônio
 */
function readData() {
  const filePath = getMarriageDataFile();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Migração transparente de data/marriages.json se o novo arquivo ainda não existir
  if (!fs.existsSync(filePath)) {
    const oldFile = path.join(dir, 'marriages.json');
    if (fs.existsSync(oldFile)) {
      try {
        const oldRaw = fs.readFileSync(oldFile, 'utf8');
        const oldData = JSON.parse(oldRaw);
        const migrated = { marriages: {}, requests: {} };

        if (oldData.marriages) {
          const processedPairs = new Set();
          for (const [userA, userB] of Object.entries(oldData.marriages)) {
            const pairKey = [userA, userB].sort().join(':');
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              const marId = `mar_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
              migrated.marriages[marId] = {
                id: marId,
                spouses: [userA, userB],
                loveBar: 100,
                lastLoveDecay: Date.now(),
                treeOfLife: { unlocked: false, lastCultivatedAt: 0 },
                house: {
                  unlocked: false,
                  unlockedAt: 0,
                  vaultBalance: 0,
                  lastInterestClaim: 0,
                },
                lastDateAt: 0,
                lastAffectionAt: 0,
                children: [],
              };
            }
          }
        }
        if (oldData.requests) {
          migrated.requests = { ...oldData.requests };
        }
        writeData(migrated);
        return migrated;
      } catch (_) {}
    }

    const initial = { marriages: {}, requests: {}, childProposals: {}, activeDates: {} };
    writeData(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = raw ? JSON.parse(raw) : {};
    return {
      marriages: data.marriages || {},
      requests: data.requests || {},
      childProposals: data.childProposals || {},
      activeDates: data.activeDates || {},
    };
  } catch (error) {
    return { marriages: {}, requests: {}, childProposals: {}, activeDates: {} };
  }
}

/**
 * Gravação atômica segura evitando corrupção de dados
 */
function writeData(data) {
  const filePath = getMarriageDataFile();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

/**
 * Aplica o decaimento preguiçoso (Lazy Decay) na Barra do Amor:
 * A cada 24 horas completas, cai 20%.
 */
function applyLazyDecay(marriage) {
  if (!marriage) return null;
  const now = Date.now();
  const lastDecay = marriage.lastLoveDecay || now;
  const diasDecorridos = Math.floor((now - lastDecay) / 86400000);

  if (diasDecorridos > 0) {
    marriage.loveBar = Math.max(0, (marriage.loveBar ?? 100) - diasDecorridos * 20);
    marriage.lastLoveDecay = now;
  }
  return marriage;
}

/**
 * Obtém o registro de casamento de um usuário (com Lazy Decay aplicado)
 */
function getMarriage(userId) {
  if (!userId) return null;
  const data = readData();
  let updated = false;

  for (const marriage of Object.values(data.marriages)) {
    if (marriage.spouses && marriage.spouses.includes(userId)) {
      const prevDecay = marriage.lastLoveDecay;
      applyLazyDecay(marriage);
      if (marriage.lastLoveDecay !== prevDecay) {
        updated = true;
      }
      if (updated) {
        writeData(data);
      }
      return marriage;
    }
  }
  return null;
}

/**
 * Retorna o ID do parceiro se o usuário for casado
 */
function getSpouseId(userId) {
  const marriage = getMarriage(userId);
  if (!marriage) return null;
  return marriage.spouses.find((id) => id !== userId) || null;
}

/**
 * Cria uma solicitação de casamento
 */
function createMarriageProposal(requesterId, targetId, guildId) {
  const data = readData();
  if (getMarriage(requesterId) || getMarriage(targetId)) {
    return { created: false, reason: 'married' };
  }

  // Verifica se já existe proposta pendente
  const hasPending = Object.values(data.requests).some((req) =>
    [req.requesterId, req.targetId].includes(requesterId) ||
    [req.requesterId, req.targetId].includes(targetId)
  );
  if (hasPending) {
    return { created: false, reason: 'pending' };
  }

  const id = `req_${crypto.randomUUID()}`;
  data.requests[id] = {
    id,
    requesterId,
    targetId,
    guildId,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 60000,
  };
  writeData(data);
  return { created: true, id };
}

/**
 * Cancela uma solicitação de casamento pendente
 */
function cancelMarriageProposal(requestId, requesterId) {
  const data = readData();
  const req = data.requests[requestId];
  if (!req || (requesterId && req.requesterId !== requesterId)) return false;
  delete data.requests[requestId];
  writeData(data);
  return true;
}

/**
 * Resolve (aceita ou rejeita) uma proposta de casamento
 */
function resolveMarriageProposal(requestId, targetId, accepted) {
  const data = readData();
  const req = data.requests[requestId];
  if (!req || req.targetId !== targetId) {
    return { resolved: false, reason: 'invalid' };
  }

  delete data.requests[requestId];

  if (!accepted) {
    writeData(data);
    return { resolved: true, accepted: false, request: req };
  }

  // Criação do novo registro matrimonial completo
  const marId = `mar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  data.marriages[marId] = {
    id: marId,
    spouses: [req.requesterId, req.targetId],
    loveBar: 100,
    lastLoveDecay: Date.now(),
    treeOfLife: {
      unlocked: false,
      lastCultivatedAt: 0,
    },
    house: {
      unlocked: false,
      unlockedAt: 0,
      vaultBalance: 0,
      lastInterestClaim: 0,
    },
    lastDateAt: 0,
    lastAffectionAt: 0,
    children: [],
  };

  writeData(data);
  return { resolved: true, accepted: true, request: req, marriage: data.marriages[marId] };
}

/**
 * Encerra o casamento (Divórcio)
 */
function endMarriage(userId) {
  const data = readData();
  let marriageIdToRemove = null;
  let spouseId = null;

  for (const [id, mar] of Object.entries(data.marriages)) {
    if (mar.spouses && mar.spouses.includes(userId)) {
      marriageIdToRemove = id;
      spouseId = mar.spouses.find((s) => s !== userId);
      break;
    }
  }

  if (!marriageIdToRemove) {
    return { ended: false, reason: 'single' };
  }

  delete data.marriages[marriageIdToRemove];
  writeData(data);
  return { ended: true, spouseId };
}

/**
 * Regra Universal de Financiamento Bilateral:
 * Qualquer upgrade, compra de terreno/casa ou árvore mágica pago por um dos cônjuges
 * desbloqueia o benefício imediatamente para ambos em caráter permanente.
 */
function unlockSharedFeature(marriageId, featureName, payerId, costCoins = 0, costBeans = 0) {
  const data = readData();
  const marriage = data.marriages[marriageId];
  if (!marriage) {
    return { success: false, reason: 'not_found' };
  }
  if (!marriage.spouses.includes(payerId)) {
    return { success: false, reason: 'not_spouse' };
  }

  // Validação de saldo
  if (costCoins > 0 && getBalance(payerId) < costCoins) {
    return { success: false, reason: 'insufficient_coins', cost: costCoins };
  }
  if (costBeans > 0 && getMagicBeans(payerId) < costBeans) {
    return { success: false, reason: 'insufficient_beans', cost: costBeans };
  }

  // Débito dos custos
  if (costCoins > 0) {
    const coinSpend = spendCoins(payerId, costCoins);
    if (!coinSpend.spent) {
      return { success: false, reason: 'insufficient_coins', cost: costCoins };
    }
  }
  if (costBeans > 0) {
    const beanSpend = spendMagicBeans(payerId, costBeans);
    if (!beanSpend.spent) {
      return { success: false, reason: 'insufficient_beans', cost: costBeans };
    }
  }

  // Desbloqueio bilateral do recurso
  if (featureName === 'treeOfLife') {
    marriage.treeOfLife = {
      unlocked: true,
      lastCultivatedAt: marriage.treeOfLife?.lastCultivatedAt || 0,
    };
  } else if (featureName === 'house') {
    marriage.house = {
      unlocked: true,
      unlockedAt: Date.now(),
      vaultBalance: marriage.house?.vaultBalance || 0,
      lastInterestClaim: marriage.house?.lastInterestClaim || 0,
    };
  }

  writeData(data);
  return { success: true, marriage };
}

/**
 * Cultiva a Árvore da Vida:
 * Cooldown compartilhado de 12 horas.
 * Concede +10% imediatos na Barra do Amor.
 */
function cultivateTree(userId) {
  const marriage = getMarriage(userId);
  if (!marriage) return { success: false, reason: 'not_married' };
  if (!marriage.treeOfLife?.unlocked) return { success: false, reason: 'locked' };

  const now = Date.now();
  const lastCultivated = marriage.treeOfLife.lastCultivatedAt || 0;
  if (now - lastCultivated < TREE_COOLDOWN_MS) {
    const remainingMs = TREE_COOLDOWN_MS - (now - lastCultivated);
    return {
      success: false,
      reason: 'cooldown',
      nextAvailable: lastCultivated + TREE_COOLDOWN_MS,
      remainingMs,
    };
  }

  const data = readData();
  const mar = data.marriages[marriage.id];
  mar.loveBar = Math.min(100, (mar.loveBar || 0) + 10);
  mar.treeOfLife.lastCultivatedAt = now;
  writeData(data);

  return { success: true, newLove: mar.loveBar, marriage: mar };
}

/**
 * Carinho diário (+5% de amor, cooldown de 24h)
 */
function giveAffection(userId) {
  const marriage = getMarriage(userId);
  if (!marriage) return { success: false, reason: 'not_married' };

  const now = Date.now();
  const lastAff = marriage.lastAffectionAt || 0;
  if (now - lastAff < AFFECTION_COOLDOWN_MS) {
    const remainingMs = AFFECTION_COOLDOWN_MS - (now - lastAff);
    return {
      success: false,
      reason: 'cooldown',
      nextAvailable: lastAff + AFFECTION_COOLDOWN_MS,
      remainingMs,
    };
  }

  const data = readData();
  const mar = data.marriages[marriage.id];
  mar.loveBar = Math.min(100, (mar.loveBar || 0) + 5);
  mar.lastAffectionAt = now;
  writeData(data);

  return { success: true, newLove: mar.loveBar, marriage: mar };
}

/**
 * Deposita moedas no Cofre do Amor Eterno
 */
function depositVault(userId, amount) {
  const marriage = getMarriage(userId);
  if (!marriage) return { success: false, reason: 'not_married' };
  if (!marriage.house?.unlocked) return { success: false, reason: 'no_house' };

  const qty = Math.floor(Number(amount));
  if (isNaN(qty) || qty <= 0) return { success: false, reason: 'invalid_amount' };

  if (getBalance(userId) < qty) {
    return { success: false, reason: 'insufficient_coins', cost: qty };
  }

  const spend = spendCoins(userId, qty);
  if (!spend.spent) {
    return { success: false, reason: 'insufficient_coins', cost: qty };
  }

  const data = readData();
  const mar = data.marriages[marriage.id];
  mar.house.vaultBalance = (mar.house.vaultBalance || 0) + qty;
  writeData(data);

  return { success: true, newBalance: mar.house.vaultBalance, deposited: qty };
}

/**
 * Resgata rendimento diário do Cofre do Amor Eterno:
 * Rendimento = SaldoNoCofre * ((loveBar / 100) * 0.05)
 * Cooldown de 24h
 */
function claimVaultInterest(userId) {
  const marriage = getMarriage(userId);
  if (!marriage) return { success: false, reason: 'not_married' };
  if (!marriage.house?.unlocked) return { success: false, reason: 'no_house' };

  const vault = marriage.house.vaultBalance || 0;
  if (vault <= 0) return { success: false, reason: 'vault_empty' };

  const now = Date.now();
  const lastClaim = marriage.house.lastInterestClaim || 0;
  if (now - lastClaim < VAULT_INTEREST_COOLDOWN_MS) {
    const remainingMs = VAULT_INTEREST_COOLDOWN_MS - (now - lastClaim);
    return {
      success: false,
      reason: 'cooldown',
      nextAvailable: lastClaim + VAULT_INTEREST_COOLDOWN_MS,
      remainingMs,
    };
  }

  // Rendimento = SaldoNoCofre * ((loveBar / 100) * 0.05)
  const interestRate = (marriage.loveBar / 100) * 0.05;
  const yieldAmount = Math.max(1, Math.floor(vault * interestRate));

  addCoins(userId, yieldAmount);

  const data = readData();
  const mar = data.marriages[marriage.id];
  mar.house.lastInterestClaim = now;
  writeData(data);

  return {
    success: true,
    yieldAmount,
    interestRate: Number((interestRate * 100).toFixed(1)),
    vaultBalance: vault,
  };
}

/**
 * Date Night (Sintonia de Casal):
 * Cooldown de 12 horas.
 */
function canStartDateNight(userId) {
  const marriage = getMarriage(userId);
  if (!marriage) return { allowed: false, reason: 'not_married' };

  const now = Date.now();
  const lastDate = marriage.lastDateAt || 0;
  if (now - lastDate < DATE_COOLDOWN_MS) {
    const remainingMs = DATE_COOLDOWN_MS - (now - lastDate);
    return {
      allowed: false,
      reason: 'cooldown',
      nextAvailable: lastDate + DATE_COOLDOWN_MS,
      remainingMs,
    };
  }
  return { allowed: true, marriage };
}

/**
 * Seleciona uma pergunta aleatória do banco generativo de 400 questões
 */
function getRandomDateQuestion() {
  const randomIndex = Math.floor(Math.random() * dateQuestions.length);
  return dateQuestions[randomIndex];
}

/**
 * Aplica desfecho do Date Night:
 * - Iguais: +15% amor, +100 moedas cada parceiro
 * - Divergentes: +3% amor
 */
function resolveDateNight(marriageId, match) {
  const data = readData();
  const marriage = data.marriages[marriageId];
  if (!marriage) return { success: false, reason: 'not_found' };

  const now = Date.now();
  marriage.lastDateAt = now;

  if (match) {
    marriage.loveBar = Math.min(100, (marriage.loveBar || 0) + 15);
    for (const spouse of marriage.spouses) {
      addCoins(spouse, 100);
    }
    writeData(data);
    return { success: true, match: true, newLove: marriage.loveBar, coinsRewarded: 100 };
  } else {
    marriage.loveBar = Math.min(100, (marriage.loveBar || 0) + 3);
    writeData(data);
    return { success: true, match: false, newLove: marriage.loveBar, coinsRewarded: 0 };
  }
}

/**
 * Verifica condições para gerar filho
 */
function canHaveChild(userId) {
  const marriage = getMarriage(userId);
  if (!marriage) return { allowed: false, reason: 'not_married' };
  if (!marriage.house?.unlocked) return { allowed: false, reason: 'no_house' };

  const currentCount = (marriage.children || []).length;
  if (currentCount >= MAX_CHILDREN) {
    return { allowed: false, reason: 'max_children', count: currentCount };
  }

  const cost = currentCount === 0 ? 0 : CHILD_COST;
  if (cost > 0 && getBalance(userId) < cost) {
    return { allowed: false, reason: 'insufficient_coins', cost };
  }

  return { allowed: true, marriage, cost, currentCount };
}

/**
 * Adiciona um filho ao registro matrimonial
 */
function addChild(marriageId, { name, gender }) {
  const data = readData();
  const marriage = data.marriages[marriageId];
  if (!marriage) return { success: false, reason: 'not_found' };

  if (!marriage.children) marriage.children = [];
  if (marriage.children.length >= MAX_CHILDREN) {
    return { success: false, reason: 'max_children' };
  }

  const childId = `child_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanName = (name || '').trim().substring(0, 32) || 'Bebê Arcano';

  const newChild = {
    id: childId,
    name: cleanName,
    gender: gender === 'male' ? 'male' : 'female',
    bornAt: Date.now(),
    status: 'idle',
    busyUntil: 0,
    pendingReward: 0,
  };

  marriage.children.push(newChild);
  writeData(data);
  return { success: true, child: newChild, marriage };
}

/**
 * Localiza um filho pelo ID ou nome
 */
function findChild(marriage, identifier) {
  if (!marriage || !marriage.children) return null;
  const cleanId = String(identifier || '').trim().toLowerCase();
  return (
    marriage.children.find(
      (c) => c.id.toLowerCase() === cleanId || c.name.toLowerCase() === cleanId
    ) || null
  );
}

/**
 * Envia um filho para estágio com TRAVA ESTRITA DE PROCESSAMENTO (Job Lock):
 * Duração: 24h contínuas (86.400.000 ms).
 * Rendimento retido: 50 a 100 Moedinhas.
 */
function sendChildToWork(userId, identifier) {
  const marriage = getMarriage(userId);
  if (!marriage) return { success: false, reason: 'not_married' };

  const child = findChild(marriage, identifier);
  if (!child) return { success: false, reason: 'child_not_found' };

  const now = Date.now();

  // Cadeia de Bloqueio Rígida (Job Lock):
  if (child.status === 'working' && now < child.busyUntil) {
    return {
      success: false,
      reason: 'job_locked',
      child,
      busyUntil: child.busyUntil,
    };
  }

  // Se já concluiu mas não resgatou
  if (child.status === 'working' && now >= child.busyUntil) {
    return {
      success: false,
      reason: 'ready_to_claim',
      child,
    };
  }

  const data = readData();
  const mar = data.marriages[marriage.id];
  const targetChild = mar.children.find((c) => c.id === child.id);
  if (!targetChild) return { success: false, reason: 'child_not_found' };

  const reward = Math.floor(Math.random() * 51) + 50; // 50 a 100 moedas
  const busyUntil = now + CHILD_WORK_DURATION_MS;

  targetChild.status = 'working';
  targetChild.busyUntil = busyUntil;
  targetChild.pendingReward = reward;

  writeData(data);
  return {
    success: true,
    child: targetChild,
    reward,
    busyUntil,
  };
}

/**
 * Resgata o pagamento do estágio concluído:
 * Libera apenas se child.status === 'working' e Date.now() >= child.busyUntil
 */
function claimChildReward(userId, identifier) {
  const marriage = getMarriage(userId);
  if (!marriage) return { success: false, reason: 'not_married' };

  const child = findChild(marriage, identifier);
  if (!child) return { success: false, reason: 'child_not_found' };

  const now = Date.now();

  if (child.status !== 'working') {
    return { success: false, reason: 'not_working', child };
  }

  // Se ainda estiver em período de trabalho, bloqueia estritamente
  if (now < child.busyUntil) {
    return {
      success: false,
      reason: 'job_locked',
      child,
      busyUntil: child.busyUntil,
    };
  }

  const data = readData();
  const mar = data.marriages[marriage.id];
  const targetChild = mar.children.find((c) => c.id === child.id);
  if (!targetChild) return { success: false, reason: 'child_not_found' };

  const reward = targetChild.pendingReward || 50;
  addCoins(userId, reward);

  targetChild.status = 'idle';
  targetChild.busyUntil = 0;
  targetChild.pendingReward = 0;

  writeData(data);

  return {
    success: true,
    reward,
    child: targetChild,
  };
}

module.exports = {
  MARRIAGE_COST,
  DIVORCE_COST,
  TREE_COST_BEANS,
  TREE_COOLDOWN_MS,
  HOUSE_COST_COINS,
  HOUSE_COST_BEANS,
  HOUSE_REQUIRED_LOVE,
  VAULT_INTEREST_COOLDOWN_MS,
  DATE_COOLDOWN_MS,
  AFFECTION_COOLDOWN_MS,
  MAX_CHILDREN,
  CHILD_COST,
  CHILD_WORK_DURATION_MS,
  readData,
  writeData,
  applyLazyDecay,
  getMarriage,
  getSpouseId,
  createMarriageProposal,
  cancelMarriageProposal,
  resolveMarriageProposal,
  endMarriage,
  unlockSharedFeature,
  cultivateTree,
  giveAffection,
  depositVault,
  claimVaultInterest,
  canStartDateNight,
  getRandomDateQuestion,
  resolveDateNight,
  canHaveChild,
  addChild,
  findChild,
  sendChildToWork,
  claimChildReward,
};
