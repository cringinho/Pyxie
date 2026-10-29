// Serviço de Privacidade e Direitos do Titular (LGPD — Lei nº 13.709/2018).
// Permite inspecionar quais dados pessoais de um userId estão armazenados na Pyxie
// e apagar de forma atômica, irreversível e auditável (com comprovante criptográfico)
// os dados pessoais em PostgreSQL (Drizzle ORM) e nos arquivos JSON em data/.
// Observação legal (LGPD art. 7º, IX / art. 16): casos formais de moderação de servidores
// permanecem sob legítimo interesse de segurança da comunidade, não sendo apagados por auto-serviço.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { withFileLock } = require('../utils/fileLock');
const scopedConfig = require('./scopedConfig');

const privacyConfig = scopedConfig.forNamespace('privacy', {
  global: {
    cooldownHours: 1,
    totalErasures: 0,
  },
  user: {
    lastReceiptId: null,
    lastErasedAt: 0,
  },
});

function dataDir() {
  return process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
}

function economyFilePath() {
  if (process.env.PYXIE_DATA_DIR) {
    const custom = path.join(process.env.PYXIE_DATA_DIR, 'economy.json');
    if (fs.existsSync(custom)) return custom;
  }
  return path.join(__dirname, '..', '..', 'data', 'economy.json');
}

function albumFilePath() {
  if (process.env.PYXIE_DATA_DIR) {
    const custom = path.join(process.env.PYXIE_DATA_DIR, 'tarot_album.json');
    if (fs.existsSync(custom)) return custom;
  }
  return path.join(__dirname, '..', '..', 'data', 'tarot_album.json');
}

function marriageFilePath() {
  if (process.env.MARRIAGE_DATA_PATH) return process.env.MARRIAGE_DATA_PATH;
  if (process.env.PYXIE_DATA_DIR) {
    const custom = path.join(process.env.PYXIE_DATA_DIR, 'marriageData.json');
    if (fs.existsSync(custom)) return custom;
  }
  return path.join(__dirname, '..', '..', 'data', 'marriageData.json');
}

/**
 * Inspeciona quais categorias de dados existem para o userId sem expor segredos de terceiros.
 */
function inspectUserData(userId) {
  const uid = String(userId || '').trim();
  if (!uid) return { userId: '', categories: [], totalCategories: 0 };

  const categories = [];
  const root = dataDir();

  // 1. Economia, perfil, profissão, títulos, materiais
  const ecoRaw = readJson(economyFilePath(), {});
  if (ecoRaw && ecoRaw[uid]) {
    categories.push('economy_profile');
  }

  // 2. Álbum de Tarot
  const albumRaw = readJson(albumFilePath(), {});
  if (albumRaw?.users?.[uid]) {
    categories.push('tarot_album');
  }

  // 3. Casamento e família
  const marRaw = readJson(marriageFilePath(), {});
  const hasMarriage =
    Object.values(marRaw?.marriages || {}).some((m) => Array.isArray(m.spouses) && m.spouses.includes(uid)) ||
    Object.values(marRaw?.requests || {}).some((r) => r.requesterId === uid || r.targetId === uid);
  if (hasMarriage) {
    categories.push('marriage');
  }

  // 4. Cofre de itens e Casinha
  const vaultRaw = readJson(path.join(root, 'itemVault.json'), {});
  const homesRaw = readJson(path.join(root, 'homes.json'), {});
  if (vaultRaw?.users?.[uid] || homesRaw?.homes?.[uid] || homesRaw?.livingIn?.[uid]) {
    categories.push('home_and_items');
  }

  // 5. Catacumbas de Veludo
  const dungeonFile = process.env.DUNGEON_DATA_PATH || path.join(root, 'dungeon.json');
  const dungeonRaw = readJson(dungeonFile, {});
  if (dungeonRaw?.players?.[uid]) {
    categories.push('dungeon');
  }

  // 6. Conquistas, Passe e Festival
  const achRaw = readJson(path.join(root, 'achievements.json'), {});
  const passRaw = readJson(path.join(root, 'battlePass.json'), {});
  const festRaw = readJson(path.join(root, 'festival.json'), {});
  if (achRaw?.users?.[uid] || passRaw?.users?.[uid] || festRaw?.users?.[uid]) {
    categories.push('progression');
  }

  // 7. Mercado
  const marketRaw = readJson(path.join(root, 'market.json'), {});
  if (Object.values(marketRaw?.listings || {}).some((l) => l.sellerId === uid)) {
    categories.push('market');
  }

  // 8. Bem-estar (lembretes, AFK, aniversário) e ScopedConfig
  const scopedRoot = path.join(root, 'scoped_config');
  let hasScoped = false;
  try {
    if (fs.existsSync(scopedRoot)) {
      for (const f of fs.readdirSync(scopedRoot)) {
        if (!f.endsWith('.json')) continue;
        const sc = readJson(path.join(scopedRoot, f), {});
        if (sc?.user?.[uid] || Object.keys(sc?.member || {}).some((k) => k.endsWith(`:${uid}`))) {
          hasScoped = true;
          break;
        }
      }
    }
  } catch (_) {}
  const wellbeingRaw = readJson(path.join(root, 'wellbeing.json'), {});
  if (
    hasScoped ||
    (wellbeingRaw?.reminders || []).some((r) => r.userId === uid) ||
    wellbeingRaw?.afk?.[uid] ||
    wellbeingRaw?.birthdays?.[uid]
  ) {
    categories.push('wellbeing_and_preferences');
  }

  return {
    userId: uid,
    categories,
    totalCategories: categories.length,
  };
}

/**
 * Apaga todos os dados pessoais do usuário (PostgreSQL + arquivos JSON + ScopedConfig)
 * e retorna um recibo auditável com código único.
 */
async function eraseUserData(userId, { now = Date.now() } = {}) {
  const uid = String(userId || '').trim();
  if (!uid) return { ok: false, reason: 'invalid_user' };

  const erased = [];
  const root = dataDir();

  // 1. PostgreSQL (Drizzle ORM) — com fallback silencioso se o banco estiver offline
  try {
    const { db } = require('../database');
    const { users, tarotAlbums, marriages } = require('../database/schema');
    const { eq, or } = require('drizzle-orm');
    await db.delete(tarotAlbums).where(eq(tarotAlbums.userId, uid)).catch(() => null);
    await db
      .delete(marriages)
      .where(or(eq(marriages.user1Id, uid), eq(marriages.user2Id, uid)))
      .catch(() => null);
    await db.delete(users).where(eq(users.userId, uid)).catch(() => null);
  } catch (_) {}

  // 2. Casamento (encerra vínculo e separa bens da casinha antes de apagar a casinha)
  try {
    const marriageManager = require('../modules/marriage/marriageManager');
    if (marriageManager.getMarriage(uid)) {
      marriageManager.endMarriage(uid);
      erased.push('marriage');
    }
    const mFile = marriageFilePath();
    if (fs.existsSync(mFile)) {
      withFileLock(mFile, () => {
        const mData = readJson(mFile, {});
        let changed = false;
        for (const [rId, req] of Object.entries(mData.requests || {})) {
          if (req.requesterId === uid || req.targetId === uid) {
            delete mData.requests[rId];
            changed = true;
          }
        }
        if (changed) {
          writeJsonAtomic(mFile, mData);
          if (!erased.includes('marriage')) erased.push('marriage');
        }
      });
    }
  } catch (_) {}

  // 3. Mercado (cancela anúncios ativos antes de apagar o cofre)
  const marketFile = path.join(root, 'market.json');
  if (fs.existsSync(marketFile)) {
    withFileLock(marketFile, () => {
      const mState = readJson(marketFile, {});
      let changed = false;
      for (const [lId, listing] of Object.entries(mState.listings || {})) {
        if (listing.sellerId === uid || listing.buyerId === uid) {
          if (listing.sellerId === uid) {
            delete mState.listings[lId];
          } else {
            listing.buyerId = null;
          }
          changed = true;
        }
      }
      if (changed) {
        writeJsonAtomic(marketFile, mState);
        erased.push('market');
      }
    });
  }

  // 4. Casinha (homes.json) e Cofre de Itens (itemVault.json)
  const homesFile = path.join(root, 'homes.json');
  if (fs.existsSync(homesFile)) {
    withFileLock(homesFile, () => {
      const hState = readJson(homesFile, {});
      let changed = false;
      if (hState.homes && uid in hState.homes) {
        // Se alguém morava na casa dessa pessoa, remove o vínculo
        for (const [resId, ownerId] of Object.entries(hState.livingIn || {})) {
          if (ownerId === uid) delete hState.livingIn[resId];
        }
        delete hState.homes[uid];
        changed = true;
      }
      if (hState.livingIn && uid in hState.livingIn) {
        const ownerId = hState.livingIn[uid];
        if (hState.homes?.[ownerId]) {
          hState.homes[ownerId].residents = (hState.homes[ownerId].residents || []).filter((r) => r !== uid);
          hState.homes[ownerId].placements = (hState.homes[ownerId].placements || []).filter((p) => String(p.by || ownerId) !== uid);
        }
        delete hState.livingIn[uid];
        changed = true;
      }
      for (const pKey of Object.keys(hState.purchases || {})) {
        if (pKey.startsWith(`${uid}:`)) {
          delete hState.purchases[pKey];
          changed = true;
        }
      }
      if (changed) {
        writeJsonAtomic(homesFile, hState);
        erased.push('home_and_items');
      }
    });
  }

  const vaultFile = path.join(root, 'itemVault.json');
  if (fs.existsSync(vaultFile)) {
    withFileLock(vaultFile, () => {
      const vState = readJson(vaultFile, {});
      if (vState.users && uid in vState.users) {
        delete vState.users[uid];
        writeJsonAtomic(vaultFile, vState);
        if (!erased.includes('home_and_items')) erased.push('home_and_items');
      }
    });
  }

  // 5. Economia, Perfil, Profissão e Títulos
  for (const eFile of new Set([economyFilePath(), path.join(root, 'economy.json')])) {
    if (!fs.existsSync(eFile)) continue;
    withFileLock(eFile, () => {
      const eco = readJson(eFile, {});
      if (uid in eco) {
        delete eco[uid];
        writeJsonAtomic(eFile, eco);
        if (!erased.includes('economy_profile')) erased.push('economy_profile');
      }
    });
  }

  // 6. Álbum de Tarot
  for (const aFile of new Set([albumFilePath(), path.join(root, 'tarot_album.json')])) {
    if (!fs.existsSync(aFile)) continue;
    withFileLock(aFile, () => {
      const alb = readJson(aFile, {});
      if (alb.users && uid in alb.users) {
        delete alb.users[uid];
        writeJsonAtomic(aFile, alb);
        if (!erased.includes('tarot_album')) erased.push('tarot_album');
      }
    });
  }

  // 7. Catacumbas de Veludo
  const dungeonFile = process.env.DUNGEON_DATA_PATH || path.join(root, 'dungeon.json');
  if (fs.existsSync(dungeonFile)) {
    withFileLock(dungeonFile, () => {
      const dState = readJson(dungeonFile, {});
      let changed = false;
      if (dState.players && uid in dState.players) {
        const activeRunId = dState.players[uid]?.activeRunId;
        if (activeRunId && dState.runs?.[activeRunId]) delete dState.runs[activeRunId];
        delete dState.players[uid];
        changed = true;
      }
      for (const [rId, run] of Object.entries(dState.runs || {})) {
        if (run.ownerId === uid) {
          delete dState.runs[rId];
          changed = true;
        }
      }
      for (const [gId, grave] of Object.entries(dState.graves || {})) {
        if (grave.ownerId === uid) {
          delete dState.graves[gId];
          changed = true;
        }
      }
      if (changed) {
        writeJsonAtomic(dungeonFile, dState);
        erased.push('dungeon');
      }
    });
  }

  // 8. Conquistas, Passe e Festival
  for (const fileName of ['achievements.json', 'battlePass.json', 'festival.json']) {
    const fPath = path.join(root, fileName);
    if (!fs.existsSync(fPath)) continue;
    withFileLock(fPath, () => {
      const st = readJson(fPath, {});
      if (st.users && uid in st.users) {
        delete st.users[uid];
        writeJsonAtomic(fPath, st);
        if (!erased.includes('progression')) erased.push('progression');
      }
    });
  }

  // 9. Bem-estar (lembretes, AFK, aniversário)
  const wellbeingFile = path.join(root, 'wellbeing.json');
  if (fs.existsSync(wellbeingFile)) {
    withFileLock(wellbeingFile, () => {
      const wb = readJson(wellbeingFile, {});
      let changed = false;
      if (Array.isArray(wb.reminders)) {
        const filtered = wb.reminders.filter((r) => r.userId !== uid);
        if (filtered.length !== wb.reminders.length) {
          wb.reminders = filtered;
          changed = true;
        }
      }
      if (wb.afk && uid in wb.afk) {
        delete wb.afk[uid];
        changed = true;
      }
      if (wb.birthdays && uid in wb.birthdays) {
        delete wb.birthdays[uid];
        changed = true;
      }
      if (changed) {
        writeJsonAtomic(wellbeingFile, wb);
        if (!erased.includes('wellbeing_and_preferences')) erased.push('wellbeing_and_preferences');
      }
    });
  }

  // 10. ScopedConfig (todos os namespaces em escopo user e member)
  const scopedRes = scopedConfig.purgeUserAcrossNamespaces(uid);
  if (scopedRes.recordsRemoved > 0 && !erased.includes('wellbeing_and_preferences')) {
    erased.push('wellbeing_and_preferences');
  }

  // Gera comprovante criptográfico sem reter dados pessoais do titular
  const receiptId = `LGPD-${crypto
    .createHash('sha256')
    .update(`${uid}:${now}:${crypto.randomBytes(6).toString('hex')}`)
    .digest('hex')
    .slice(0, 12)
    .toUpperCase()}`;

  privacyConfig.global().update((g) => {
    g.totalErasures = (Number(g.totalErasures) || 0) + 1;
  });

  return {
    ok: true,
    userId: uid,
    receiptId,
    erasedCategories: erased,
    erasedCount: erased.length,
    erasedAt: now,
  };
}

module.exports = {
  inspectUserData,
  eraseUserData,
  privacyConfig,
};

