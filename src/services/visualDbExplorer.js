const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const ECONOMY_FILE = path.join(DATA_DIR, 'economy.json');
const GUILD_CONFIGS_FILE = path.join(DATA_DIR, 'guildConfigs.json');
const SEASONAL_FILE = path.join(DATA_DIR, 'seasonalState.json');
const MARY_FILE = path.join(DATA_DIR, 'maryStudioConfig.json');

// Dicionário Semântico de Metadados
const METADATA_DICTIONARY = {
  // Usuário / Economia
  coins: { label: 'Moedinhas de Ouro', icon: '🪙', type: 'number', description: 'Saldo na carteira do usuário para compras, minigames e transferências.' },
  bank: { label: 'Banco Celestial', icon: '🏦', type: 'number', description: 'Saldo guardado no cofre bancário, imune a furtos e perdas acidentais.' },
  magicBeans: { label: 'Feijões Mágicos', icon: '🌱', type: 'number', description: 'Moeda arcana e sagrada da Pyxie ganha exclusivamente em eventos especiais.' },
  career: { label: 'Carreira / Profissão', icon: '💼', type: 'string', description: 'Profissão atual do usuário definida via /py-profissao (ex: alquimista, dev, bardo).' },
  careerLevel: { label: 'Nível Profissional', icon: '⭐', type: 'number', description: 'Nível de experiência na carreira que concede bônus de salário no /py-work.' },
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
  active: { label: 'Ativação do Módulo', icon: '🟢', type: 'boolean', description: 'Indica se o subsistema está ativo globalmente na Pyxie.' },
  eventTitle: { label: 'Título do Evento', icon: '🎃', type: 'string', description: 'Nome público do evento sazonal ativo exibido no /py-infoevento.' },
  status: { label: 'Condição Operacional', icon: '📊', type: 'string', description: 'Estado atual de integridade e saúde do serviço.' },
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

/**
 * Registra um cliente SSE para transmissão de diffs
 */
function registerSseClient(res) {
  activeSseClients.add(res);
  res.on('close', () => {
    activeSseClients.delete(res);
  });
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
      if (s && !userId.includes(s) && !String(u.career || '').toLowerCase().includes(s)) {
        continue;
      }
      allItems.push({
        id: userId,
        coins: u.coins ?? 0,
        bank: u.bank ?? 0,
        magicBeans: u.magicBeans ?? 0,
        career: u.career || 'Nenhuma',
        careerLevel: u.careerLevel ?? 1,
        streak: u.streak ?? 0,
        dailyCooldown: u.dailyCooldown || 0,
        workCooldown: u.workCooldown || 0,
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
    const mary = readJsonSafe(MARY_FILE);
    allItems = [
      { id: 'seasonal_state', name: 'Módulo Sazonal', active: Boolean(seasonal.active), eventTitle: seasonal.eventTitle || 'Nenhum', status: seasonal.active ? 'Ativo' : 'Pausado' },
      { id: 'mary_studio', name: 'Estúdio da Mary (SaaS)', active: Boolean(mary.active ?? true), status: 'Isolado', guildId: mary.guildId || '1453890868980482090' },
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
    fileData[recordId][field] = sanitizedValue;
  } else if (partition === 'guilds') {
    targetFile = GUILD_CONFIGS_FILE;
    fileData = readJsonSafe(targetFile);
    if (!fileData[recordId]) fileData[recordId] = {};
    fileData[recordId][field] = sanitizedValue;
  } else if (partition === 'global') {
    if (recordId === 'seasonal_state') targetFile = SEASONAL_FILE;
    else if (recordId === 'mary_studio') targetFile = MARY_FILE;
    if (targetFile) {
      fileData = readJsonSafe(targetFile);
      fileData[field] = sanitizedValue;
    }
  }

  if (targetFile) {
    safeAtomicWrite(targetFile, fileData);
    const diff = { partition, recordId, field, value: sanitizedValue };
    broadcastDbDiff(diff);
    return { success: true, diff };
  }

  throw new Error(`Partição ou arquivo não encontrado para '${partition}'.`);
}

module.exports = {
  METADATA_DICTIONARY,
  queryPartition,
  updateRecord,
  registerSseClient,
};
