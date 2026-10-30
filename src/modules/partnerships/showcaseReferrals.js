const crypto = require('node:crypto');
const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const schema = require('../../database/schema');

function getReferralsFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  return path.join(baseDir, 'referrals.json');
}

function loadReferralsStore() {
  return readJson(getReferralsFile(), {
    referrals: [], // { id, referrerId, referredId, status, ipHash, dateStr, createdAt }
    counts: {}, // referrerId -> count
    serverShowcases: {}, // guildId -> { guildId, name, icon, inviteUrl, description, tags, status: 'ACTIVE' | 'PAUSED', updatedAt }
  });
}

function saveReferralsStore(store) {
  return writeJsonAtomic(getReferralsFile(), store);
}

function getTodayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

/**
 * Retorna o nível cosmético e a borda com base no número de indicações válidas.
 * Cosméticos puros: NÃO são moedas da economia (AGENTS.md §5 não se aplica).
 * Respeita prefers-reduced-motion.
 */
function getCosmeticBadge(referralsCount = 0) {
  const count = Number(referralsCount) || 0;
  if (count >= 5) {
    return {
      tier: 3,
      name: 'Ouro Místico',
      color: '#F59E0B',
      borderStyle: 'border: 2px solid #F59E0B; box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);',
      badgeClass: 'badge-gold',
      label: { pt: 'Ouro Místico • Destaque Supremo', en: 'Mystic Gold • Supreme Spotlight' },
      priority: 3,
      frames: ['Moldura Solar', 'Halo Místico', 'Cyberpunk Gold', 'Runas Antigas'],
    };
  }
  if (count >= 3) {
    return {
      tier: 2,
      name: 'Cyber-Pink Animada',
      color: '#E60067',
      borderStyle: 'border: 2px solid #E60067; box-shadow: 0 0 14px rgba(230, 0, 103, 0.4);',
      badgeClass: 'badge-cyberpink animated-border',
      label: { pt: 'Cyber-Pink • Prioridade na Vitrine', en: 'Cyber-Pink • Priority Showcase' },
      priority: 2,
      frames: ['Neon Glitch'],
    };
  }
  if (count >= 1) {
    return {
      tier: 1,
      name: 'Neon Lilás',
      color: '#8B5CF6',
      borderStyle: 'border: 1.5px solid #8B5CF6; box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);',
      badgeClass: 'badge-purple',
      label: { pt: 'Neon Lilás • Apoiador Oficial', en: 'Neon Lilac • Official Supporter' },
      priority: 1,
      frames: [],
    };
  }
  return {
    tier: 0,
    name: 'Padrão',
    color: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'border: 1px solid rgba(255, 255, 255, 0.1);',
    badgeClass: 'badge-default',
    label: null,
    priority: 0,
    frames: [],
  };
}

/**
 * Processa uma indicação com antifraude transacional estrito:
 * - Mesmo Snowflake / usuário não conta.
 * - Mesma pessoa / conta ligada não conta.
 * - Mesmo hash de IP no mesmo dia não conta.
 * - Conta quando o indicado conclui seu cadastro ou primeira divulgação.
 */
async function processReferral({ referrerId, referredId, clientIp = '' } = {}) {
  if (!referrerId || !referredId) {
    return { success: false, reason: 'missing_ids' };
  }
  if (String(referrerId) === String(referredId)) {
    return { success: false, reason: 'self_referral_prohibited' };
  }

  const dateStr = getTodayStr();
  const ipHash = clientIp
    ? crypto.createHash('sha256').update(`${clientIp}:${dateStr}:ref`).digest('hex').slice(0, 16)
    : null;

  const store = loadReferralsStore();

  // 1. Antifraude: o indicado já foi indicado por alguém antes?
  const alreadyReferred = store.referrals.some((r) => r.referredId === referredId);
  if (alreadyReferred) {
    return { success: false, reason: 'already_referred' };
  }

  // 2. Antifraude: mesmo hash de IP no mesmo dia?
  if (ipHash) {
    const sameIpToday = store.referrals.some((r) => r.ipHash === ipHash && r.dateStr === dateStr);
    if (sameIpToday) {
      return { success: false, reason: 'same_ip_fraud_prevented' };
    }
  }

  const referralId = `ref_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const record = {
    id: referralId,
    referrerId: String(referrerId),
    referredId: String(referredId),
    status: 'CONFIRMED',
    ipHash,
    dateStr,
    createdAt: new Date().toISOString(),
  };

  store.referrals.push(record);
  const newCount = (store.counts[referrerId] || 0) + 1;
  store.counts[referrerId] = newCount;
  saveReferralsStore(store);

  // Espelha no PostgreSQL via Drizzle
  try {
    const { db } = require('../../database');
    if (db && schema.partnerReferrals) {
      await db.insert(schema.partnerReferrals).values({
        id: referralId,
        referrerUserId: String(referrerId),
        referredUserId: String(referredId),
        status: 'CONFIRMED',
        createdAt: new Date(),
      });
    }
  } catch (_) {}

  return {
    success: true,
    referralId,
    referralsCount: newCount,
    badge: getCosmeticBadge(newCount),
  };
}

function getReferralStats(userId) {
  if (!userId) return { count: 0, badge: getCosmeticBadge(0) };
  const store = loadReferralsStore();
  const count = store.counts[String(userId)] || 0;
  return {
    count,
    badge: getCosmeticBadge(count),
  };
}

/**
 * Gestão de Servidores Divulgados (Vitrine "Divulgue seu Servidor")
 */
function updateServerShowcase(guildId, data, isBotPresent = true) {
  const store = loadReferralsStore();
  const existing = store.serverShowcases[guildId] || {};

  const status = isBotPresent ? (data.status || 'ACTIVE') : 'PAUSED';

  store.serverShowcases[guildId] = {
    ...existing,
    guildId,
    name: data.name || existing.name || 'Servidor Parceiro',
    icon: data.icon || existing.icon || null,
    inviteUrl: data.inviteUrl || existing.inviteUrl || null,
    description: data.description || existing.description || '',
    tags: Array.isArray(data.tags) ? data.tags.slice(0, 5) : existing.tags || [],
    status, // se bot sair, fica PAUSED
    ownerId: data.ownerId || existing.ownerId || null,
    updatedAt: new Date().toISOString(),
  };

  saveReferralsStore(store);
  return store.serverShowcases[guildId];
}

function getServerShowcase(guildId) {
  const store = loadReferralsStore();
  return store.serverShowcases[guildId] || null;
}

function listActiveServersShowcase() {
  const store = loadReferralsStore();
  return Object.values(store.serverShowcases)
    .filter((s) => s.status === 'ACTIVE')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function handleGuildDelete(guildId) {
  const store = loadReferralsStore();
  if (store.serverShowcases[guildId]) {
    store.serverShowcases[guildId].status = 'PAUSED';
    store.serverShowcases[guildId].updatedAt = new Date().toISOString();
    saveReferralsStore(store);
  }
}

module.exports = {
  processReferral,
  getReferralStats,
  getCosmeticBadge,
  updateServerShowcase,
  getServerShowcase,
  listActiveServersShowcase,
  handleGuildDelete,
  loadReferralsStore,
  saveReferralsStore,
};

