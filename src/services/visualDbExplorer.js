const fs = require('node:fs');
const path = require('node:path');
const { CAREER_HIERARCHIES } = require('./careerHierarchy');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const ECONOMY_FILE = path.join(DATA_DIR, 'economy.json');
const GUILD_CONFIGS_FILE = path.join(DATA_DIR, 'guildConfigs.json');
const SEASONAL_FILE = path.join(DATA_DIR, 'seasonalState.json');
const SEASONAL_CONFIG_FILE = path.join(DATA_DIR, 'seasonalConfig.json');
const CRING_SEASONAL_FILE = path.join(DATA_DIR, 'cringelandia', 'seasonalData.json');
const CRING_SEASONAL_CFG = path.join(DATA_DIR, 'cringelandia', 'seasonalConfig.json');
const MARY_FILE = path.join(DATA_DIR, 'maryStudioConfig.json');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';

// Dicionário Semântico de Metadados
const METADATA_DICTIONARY = {
  // Usuário / Economia
  coins: { label: 'Moedinhas de Ouro', icon: '🪙', type: 'number', description: 'Saldo na carteira do usuário para compras, minigames e transferências.' },
  bank: { label: 'Banco Celestial', icon: '🏦', type: 'number', description: 'Saldo guardado no cofre bancário, imune a furtos e perdas acidentais.' },
  magicBeans: { label: 'Feijões Mágicos', icon: '🌱', type: 'number', description: 'Moeda arcana e sagrada da Pyxie ganha exclusivamente em eventos especiais.' },
  career: { label: 'Carreira / Profissão', icon: '💼', type: 'string', description: 'Profissão atual do usuário definida via /py-profissao (ex: alquimista, programador, bardo).' },
  careerLevel: {
    label: '⭐ Nível de Carreira (L1-L4 /py-work)',
    icon: '⭐',
    type: 'number',
    description: 'Progressão profissional no comando /py-work (L1 Aprendiz até L4 Mestre). Define o bônus salarial e a complexidade dos cenários.',
  },
  socialLevel: {
    label: '💬 Nível Social (XP)',
    icon: '💬',
    type: 'number',
    description: 'Nível de atividade e experiência social do usuário obtido através de interações nos canais de texto.',
  },
  dailyCooldown: { label: 'Cooldown do Diário', icon: '⏰', type: 'timestamp', description: 'Timestamp em milissegundos para liberação do próximo /py-daily.' },
  workCooldown: { label: 'Cooldown de Trabalho', icon: '⏱️', type: 'timestamp', description: 'Timestamp em milissegundos para liberação do próximo turno do /py-work.' },
  streak: { label: 'Sequência Diária (Streak)', icon: '🔥', type: 'number', description: 'Dias consecutivos de resgate do bônus diário que aumentam as recompensas.' },

  // Servidor / Guilda
  prefix: { label: 'Prefixo do Bot', icon: '⌨️', type: 'string', description: 'Prefixo de comandos por texto exclusivo deste servidor (padrão: py!).' },
  lang: { label: 'Idioma do Servidor', icon: '🌐', type: 'string', description: 'Idioma nativo configurado para o servidor: pt-BR ou en.' },
  welcomeChannelId: { label: 'Canal de Boas-Vindas', icon: '👋', type: 'string', description: 'ID do canal do Discord onde novos membros são anunciados.' },
  adminRoleIds: { label: 'Cargos de Mod/Admin', icon: '🛡️', type: 'array', description: 'Lista de IDs de cargos do Discord autorizados a usar comandos de moderação.' },
  activeModules: { label: 'Módulos Ativos', icon: '🧩', type: 'array', description: 'Lista de identificadores de subsistemas habilitados neste servidor específico.' },

  // Global
  active: { label: 'Ativação do Módulo', icon: '🟢', type: 'boolean', description: 'Indica se o subsistema está ativo na Pyxie.' },
  eventTitle: { label: 'Título do Evento', icon: '🎃', type: 'string', description: 'Nome público do evento sazonal ativo exibido no /py-infoevento.' },
  status: { label: 'Condição Operacional', icon: '📊', type: 'string', description: 'Estado atual de integridade, escopo de servidores e saúde do serviço.' },

  // Catacumbas de Veludo (data/dungeon.json)
  dungeonRuns: { label: 'Descidas nas Catacumbas', icon: '🕯️', type: 'number', description: 'Total de descidas iniciadas no /py-dungeon (cada uma cobra o ticket de entrada).' },
  dungeonActiveRuns: { label: 'Descidas em Andamento', icon: '🗺️', type: 'number', description: 'Runs abertos agora, retomáveis pelo botão Continuar descida.' },
  dungeonCoinsIn: { label: 'Moedinhas em Tickets', icon: '🎟️', type: 'number', description: 'Soma real dos tickets debitados na entrada das Catacumbas.' },
  dungeonCoinsOut: { label: 'Moedinhas Pagas', icon: '🪙', type: 'number', description: 'Soma real paga em fugas, vitórias e salvamentos (já com tetos por run e por dia).' },
  dungeonDeepestFloor: { label: 'Andar Mais Fundo', icon: '🏆', type: 'number', description: 'Recorde global de profundidade alcançada (1 a 5).' },
  // Casinha da Pyxie (data/homes.json + data/itemVault.json) e conquistas (data/achievements.json)
  homesCount: { label: 'Casinhas Criadas', icon: '🏡', type: 'number', description: 'Pessoas que já abriram o /py-home (cada uma ganha o kit inicial).' },
  homePlacedItems: { label: 'Itens à Mostra', icon: '🛋️', type: 'number', description: 'Soma real dos móveis, pets e decorações posicionados em todas as casinhas.' },
  homeCoinsSpent: { label: 'Moedinhas na Loja do Dia', icon: '🪙', type: 'number', description: 'Moedinhas que saíram da economia em compras da Casinha (dreno anti-inflação).' },
  homeBeansSpent: { label: 'Feijões na Loja Premium', icon: '🌱', type: 'number', description: 'Feijões mágicos gastos nos itens premium da Loja do dia.' },
  homeBestCharm: { label: 'Maior Charme', icon: '✨', type: 'number', description: 'Maior pontuação de Charme entre todas as casinhas.' },
  vaultItems: { label: 'Itens no Cofre', icon: '🎒', type: 'number', description: 'Instâncias de itens que as pessoas possuem (loja, dungeon, conquistas, kit inicial).' },
  vaultMythic: { label: 'Itens Míticos', icon: '🌌', type: 'number', description: 'Itens míticos em circulação (todos numerados).' },
  achievementsUnlocked: { label: 'Conquistas Desbloqueadas', icon: '🏆', type: 'number', description: 'Total de conquistas desbloqueadas (cada uma paga a recompensa uma única vez).' },
};

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error(`[visualDbExplorer] Erro ao salvar arquivo ${filePath}:`, err.message);
  }
}

function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (_) {}
  return {};
}

// Clientes SSE ativos para zero CPU no watcher
const activeSseClients = new Set();

function broadcastDbDiff(diff) {
  if (activeSseClients.size === 0) return;
  const payload = `event: db_diff\ndata: ${JSON.stringify({ ...diff, timestamp: Date.now() })}\n\n`;
  for (const client of activeSseClients) {
    try {
      client.write(payload);
    } catch (_) {
      activeSseClients.delete(client);
    }
  }
}

function registerSseClient(res) {
  activeSseClients.add(res);
  res.on('close', () => {
    activeSseClients.delete(res);
  });
}

/**
 * Resolve o título descritivo do nível de carreira de acordo com a profissão
 */
function formatCareerLevel(profession, level = 1) {
  const lvl = Math.min(4, Math.max(1, Number(level) || 1));
  const profKey = String(profession || '').toLowerCase().trim();
  const tiers = CAREER_HIERARCHIES[profKey];

  if (tiers && tiers[lvl - 1]) {
    return `Nível ${lvl} • ${tiers[lvl - 1].pt}`;
  }

  const genericTiers = { 1: 'Aprendiz', 2: 'Praticante', 3: 'Especialista', 4: 'Mestre' };
  return `Nível ${lvl} • ${genericTiers[lvl] || 'Aventureiro'}`;
}

/**
 * Resolve identidade humana (username e avatar) de um Snowflake ID
 */
function resolveUserIdentity(userId) {
  // 1. Criador canônico da Pyxie
  if (userId === '214153735281180673') {
    return {
      username: 'zululuga',
      displayName: 'Criador da Pyxie',
      avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    };
  }

  // 2. Busca em perfis sazonais da Cringelândia
  const cringData = readJsonSafe(CRING_SEASONAL_FILE);
  if (cringData.userProfiles && cringData.userProfiles[userId]) {
    const prof = cringData.userProfiles[userId];
    return {
      username: prof.username || `user_${userId.slice(-4)}`,
      displayName: prof.displayName || prof.username || `Membro ${userId.slice(-4)}`,
      avatarUrl: prof.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/1.png',
    };
  }

  return {
    username: `user_${userId.slice(-4)}`,
    displayName: `Membro ${userId.slice(-4)}`,
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/2.png',
  };
}

/**
 * Estado real do módulo Catacumbas de Veludo (data/dungeon.json + data/modulesConfig.json)
 */
function buildDungeonRecord() {
  const modulesCfg = readJsonSafe(process.env.MODULES_CONFIG_PATH || path.join(DATA_DIR, 'modulesConfig.json'));
  const entry = modulesCfg.modules?.dungeon;
  const active = entry && entry.enabled !== undefined ? Boolean(entry.enabled) : true;
  let stats = { totals: {}, activeRuns: 0, deepestFloor: 0 };
  try {
    stats = require('../modules/dungeon/dungeonStore').getDungeonStats();
  } catch (_) {}
  return {
    id: 'dungeon_state',
    name: 'Catacumbas de Veludo (Dungeon)',
    active,
    status: active ? '🟢 Ativo (Global)' : '⏸️ Pausado',
    scope: 'Global',
    dungeonRuns: Number(stats.totals.runs) || 0,
    dungeonActiveRuns: Number(stats.activeRuns) || 0,
    dungeonCoinsIn: Number(stats.totals.coinsIn) || 0,
    dungeonCoinsOut: Number(stats.totals.coinsOut) || 0,
    dungeonDeepestFloor: Number(stats.deepestFloor) || 0,
  };
}

/**
 * Estado real da Casinha da Pyxie, do cofre de itens e das conquistas
 */
function buildHomeRecord() {
  const modulesCfg = readJsonSafe(process.env.MODULES_CONFIG_PATH || path.join(DATA_DIR, 'modulesConfig.json'));
  const entry = modulesCfg.modules?.home;
  const active = entry && entry.enabled !== undefined ? Boolean(entry.enabled) : true;
  let stats = { homes: 0, placedItems: 0, coinsSpent: 0, beansSpent: 0, bestCharm: 0, vault: { totalItems: 0, byRarity: {} } };
  let achievementStats = { unlocked: 0 };
  try {
    stats = require('../modules/home/homeStore').getHomeStats();
  } catch (_) {}
  try {
    achievementStats = require('./achievements').getAchievementStats();
  } catch (_) {}
  return {
    id: 'home_state',
    name: 'Casinha da Pyxie (Itens e Conquistas)',
    active,
    status: active ? '🟢 Ativo (Global)' : '⏸️ Pausado',
    scope: 'Global',
    homesCount: Number(stats.homes) || 0,
    homePlacedItems: Number(stats.placedItems) || 0,
    homeCoinsSpent: Number(stats.coinsSpent) || 0,
    homeBeansSpent: Number(stats.beansSpent) || 0,
    homeBestCharm: Number(stats.bestCharm) || 0,
    vaultItems: Number(stats.vault?.totalItems) || 0,
    vaultMythic: Number(stats.vault?.byRarity?.mythic) || 0,
    achievementsUnlocked: Number(achievementStats.unlocked) || 0,
  };
}

/**
 * Consulta registros paginados por partição
 * @param {Object} options
 * @param {'users'|'guilds'|'global'} [options.partition='users']
 * @param {number} [options.page=1]
 * @param {number} [options.limit=15]
 * @param {string} [options.search='']
 */
function queryPartition({ partition = 'users', page = 1, limit = 15, search = '' } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
  const offset = (p - 1) * l;
  const s = String(search || '').toLowerCase().trim();

  let allItems = [];

  if (partition === 'users') {
    const eco = readJsonSafe(ECONOMY_FILE);
    for (const [userId, u] of Object.entries(eco)) {
      // Mapeamento Polimórfico de Carreira (user.profession || user.career || user.job || user.workProfession)
      const profession = u.profession || u.career || u.job || u.workProfession || 'Nenhuma';
      const profLevel = u.professionLevel ?? u.careerLevel ?? u.workLevel ?? 1;
      const levelLabel = formatCareerLevel(profession, profLevel);
      const identity = resolveUserIdentity(userId);

      if (
        s &&
        !userId.includes(s) &&
        !profession.toLowerCase().includes(s) &&
        !identity.username.toLowerCase().includes(s) &&
        !identity.displayName.toLowerCase().includes(s)
      ) {
        continue;
      }

      allItems.push({
        id: userId,
        username: identity.username,
        displayName: identity.displayName,
        avatarUrl: identity.avatarUrl,
        coins: u.coins ?? 0,
        bank: u.bank ?? 0,
        magicBeans: u.magicBeans ?? 0,
        career: profession,
        profession: profession,
        careerLevel: profLevel,
        careerLevelLabel: levelLabel,
        socialLevel: u.socialLevel ?? u.xpLevel ?? 1,
        streak: u.dailyStreak ?? u.streak ?? 0,
        dailyCooldown: u.lastDailyAt || u.dailyCooldown || 0,
        workCooldown: u.lastWorkAt || u.workCooldown || 0,
      });
    }
    allItems.sort((a, b) => (b.coins + b.bank) - (a.coins + a.bank));
  } else if (partition === 'guilds') {
    const cfgs = readJsonSafe(GUILD_CONFIGS_FILE);
    for (const [guildId, g] of Object.entries(cfgs)) {
      if (s && !guildId.includes(s) && !String(g.prefix || '').toLowerCase().includes(s)) {
        continue;
      }
      allItems.push({
        id: guildId,
        prefix: g.prefix || 'py!',
        lang: g.lang || 'pt-BR',
        welcomeChannelId: g.welcomeChannelId || null,
        activeModules: Array.isArray(g.activeModules) ? g.activeModules : ['default'],
        adminRoleIds: Array.isArray(g.adminRoleIds) ? g.adminRoleIds : [],
      });
    }
  } else if (partition === 'global') {
    const seasonal = readJsonSafe(SEASONAL_FILE);
    const seasonalCfg = readJsonSafe(SEASONAL_CONFIG_FILE);
    const cringCfg = readJsonSafe(CRING_SEASONAL_CFG);
    const mary = readJsonSafe(MARY_FILE);

    // Detecção Fiel de Condição Operacional do Módulo Sazonal (Global vs Cringelândia)
    const isSeasonalActive = Boolean(seasonal.active || seasonalCfg.active || cringCfg.active);
    let seasonalStatus = 'Pausado';
    let eventTitle = seasonal.eventTitle || seasonalCfg.eventName || cringCfg.eventName || 'Nenhum';

    if (isSeasonalActive) {
      const isCringelandiaScope =
        (Array.isArray(seasonalCfg.guildScope) && seasonalCfg.guildScope.includes(CRINGELANDIA_GUILD_ID)) ||
        cringCfg.active ||
        seasonal.guildScope === CRINGELANDIA_GUILD_ID;
      seasonalStatus = isCringelandiaScope
        ? '🟢 Ativo (Escopo: Cringelândia)'
        : '🟢 Ativo (Global)';
    }

    allItems = [
      {
        id: 'seasonal_state',
        name: 'Módulo Sazonal',
        active: isSeasonalActive,
        eventTitle,
        status: seasonalStatus,
        scope: seasonalStatus.includes('Cringelândia') ? 'Cringelândia' : 'Global',
      },
      {
        id: 'mary_studio',
        name: 'Estúdio da Mary (SaaS)',
        active: Boolean(mary.active ?? true),
        status: '🟢 Ativo (Escopo: Mary Store)',
        guildId: mary.guildId || CRINGELANDIA_GUILD_ID,
      },
      buildDungeonRecord(),
      buildHomeRecord(),
    ];
  }

  const total = allItems.length;
  const totalPages = Math.ceil(total / l) || 1;
  const paginated = allItems.slice(offset, offset + l);

  return {
    partition,
    page: p,
    limit: l,
    total,
    totalPages,
    records: paginated,
  };
}

/**
 * Atualização segura e atômica de um campo com validação estrita de tipo
 */
function updateRecord({ partition, recordId, field, value }) {
  if (!partition || !recordId || !field) {
    throw new Error('Parâmetros insuficientes para atualização de registro.');
  }

  const meta = METADATA_DICTIONARY[field] || { type: typeof value };
  let sanitizedValue = value;

  if (meta.type === 'number') {
    sanitizedValue = Number(value);
    if (isNaN(sanitizedValue)) throw new Error(`O campo '${field}' exige um valor numérico válido.`);
  } else if (meta.type === 'boolean') {
    sanitizedValue = Boolean(value);
  } else if (meta.type === 'string') {
    sanitizedValue = String(value).trim();
  }

  let targetFile = null;
  let fileData = {};

  if (partition === 'users') {
    targetFile = ECONOMY_FILE;
    fileData = readJsonSafe(targetFile);
    if (!fileData[recordId]) fileData[recordId] = {};

    // Sincroniza polimorficamente carreira/profissão
    if (field === 'career' || field === 'profession') {
      fileData[recordId].career = sanitizedValue;
      fileData[recordId].profession = sanitizedValue;
    } else if (field === 'careerLevel') {
      fileData[recordId].careerLevel = sanitizedValue;
      fileData[recordId].professionLevel = sanitizedValue;
    } else {
      fileData[recordId][field] = sanitizedValue;
    }
  } else if (partition === 'guilds') {
    targetFile = GUILD_CONFIGS_FILE;
    fileData = readJsonSafe(targetFile);
    if (!fileData[recordId]) fileData[recordId] = {};
    fileData[recordId][field] = sanitizedValue;
  } else if (partition === 'global') {
    if (recordId === 'seasonal_state') {
      targetFile = SEASONAL_FILE;
      fileData = readJsonSafe(targetFile);
      fileData[field] = sanitizedValue;
    } else if (recordId === 'mary_studio') {
      targetFile = MARY_FILE;
      fileData = readJsonSafe(targetFile);
      fileData[field] = sanitizedValue;
    }
  }

  if (targetFile) {
    safeAtomicWrite(targetFile, fileData);
    broadcastDbDiff({ partition, recordId, field, value: sanitizedValue });
  }

  return { success: true, recordId, field, value: sanitizedValue };
}

function getMetadataDictionary() {
  return METADATA_DICTIONARY;
}

module.exports = {
  METADATA_DICTIONARY,
  queryPartition,
  updateRecord,
  getMetadataDictionary,
  formatCareerLevel,
  resolveUserIdentity,
  registerSseClient,
  broadcastDbDiff,
};
