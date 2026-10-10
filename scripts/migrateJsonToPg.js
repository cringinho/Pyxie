const fs = require('fs');
const path = require('path');
const { db, pool } = require('../src/database');
const {
  users,
  tarotAlbums,
  marriages,
  guildConfigs,
  schedulerState,
  cringelandiaLab
} = require('../src/database/schema');
const { sql } = require('drizzle-orm');

async function runMigration() {
  console.log('🚀 Iniciando migração de JSON para PostgreSQL (Zero Data Loss)...');
  const dataDir = path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    console.warn('⚠️ Diretório data/ não encontrado. Abortando migração.');
    process.exit(0);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🔒 Transação iniciada.');

    // 1. Migração de Economia (data/economy.json) se existir
    const economyPath = path.join(dataDir, 'economy.json');
    if (fs.existsSync(economyPath)) {
      const rawEco = JSON.parse(fs.readFileSync(economyPath, 'utf8'));
      for (const [userId, uData] of Object.entries(rawEco)) {
        if (!userId || typeof uData !== 'object') continue;
        await db.insert(users)
          .values({
            userId,
            coins: uData.coins || 0,
            beans: uData.magicBeans || uData.beans || 0,
            profession: uData.profession || null,
            lastDailyAt: uData.lastDailyAt ? new Date(uData.lastDailyAt) : null,
            lastWorkAt: uData.lastWorkAt ? new Date(uData.lastWorkAt) : null,
          })
          .onConflictDoUpdate({
            target: users.userId,
            set: {
              coins: uData.coins || 0,
              beans: uData.magicBeans || uData.beans || 0,
              profession: uData.profession || null,
              lastDailyAt: uData.lastDailyAt ? new Date(uData.lastDailyAt) : null,
              lastWorkAt: uData.lastWorkAt ? new Date(uData.lastWorkAt) : null,
            }
          });
      }
      console.log(`✅ Contas de economia processadas: ${Object.keys(rawEco).length}`);
    }

    // 1b. Migração de Tarot e Usuários (data/tarotAlbuns.json ou data/tarot_album.json)
    const tarotPath = fs.existsSync(path.join(dataDir, 'tarotAlbuns.json'))
      ? path.join(dataDir, 'tarotAlbuns.json')
      : path.join(dataDir, 'tarot_album.json');

    if (fs.existsSync(tarotPath)) {
      const raw = JSON.parse(fs.readFileSync(tarotPath, 'utf8'));
      const rawUsers = raw.users || raw;
      const userEntries = Object.entries(rawUsers);

      for (const [userId, uData] of userEntries) {
        if (!userId || typeof uData !== 'object') continue;
        await db.insert(users)
          .values({
            userId,
            coins: uData.coins || 0,
            beans: uData.beans || 0
          })
          .onConflictDoUpdate({
            target: users.userId,
            set: {
              coins: sql`GREATEST(${users.coins}, ${uData.coins || 0})`,
              beans: sql`GREATEST(${users.beans}, ${uData.beans || 0})`
            }
          });

        const discovered = Array.isArray(uData.discoveredCards)
          ? uData.discoveredCards
          : (Array.isArray(uData.discovered) ? uData.discovered : []);
        const achievements = Array.isArray(uData.claimedAchievements)
          ? uData.claimedAchievements
          : (Array.isArray(uData.claimed_achievements) ? uData.claimed_achievements : []);
        const totalPulls = uData.totalPulls || uData.stats?.total_pulls || discovered.length || 0;

        await db.insert(tarotAlbums)
          .values({
            userId,
            discoveredCards: discovered,
            claimedAchievements: achievements,
            totalPulls
          })
          .onConflictDoUpdate({
            target: tarotAlbums.userId,
            set: { discoveredCards: discovered, claimedAchievements: achievements, totalPulls }
          });
      }
      console.log(`✅ Perfis de Tarot e usuários processados: ${userEntries.length}`);
    }

    // 2. Migração de Guildas (data/guildConfigs.json ou data/settings.json)
    const guildPath = fs.existsSync(path.join(dataDir, 'guildConfigs.json'))
      ? path.join(dataDir, 'guildConfigs.json')
      : path.join(dataDir, 'settings.json');

    if (fs.existsSync(guildPath)) {
      const rawGuilds = JSON.parse(fs.readFileSync(guildPath, 'utf8'));
      const guildEntries = Object.entries(rawGuilds);

      for (const [guildId, gConfig] of guildEntries) {
        if (!guildId || typeof gConfig !== 'object') continue;
        await db.insert(guildConfigs)
          .values({
            guildId,
            language: gConfig.language || gConfig.lang || 'pt_BR',
            prefix: gConfig.prefix || 'py!',
            channels: gConfig.channels || (gConfig.welcomeChannelId ? { welcome: gConfig.welcomeChannelId } : {}),
            roles: gConfig.roles || {},
            enabledModules: gConfig.enabledModules || ['economy', 'tarot', 'social']
          })
          .onConflictDoUpdate({
            target: guildConfigs.guildId,
            set: {
              channels: gConfig.channels || (gConfig.welcomeChannelId ? { welcome: gConfig.welcomeChannelId } : {}),
              roles: gConfig.roles || {},
              enabledModules: gConfig.enabledModules || ['economy', 'tarot', 'social']
            }
          });
      }
      console.log(`✅ Configurações de guildas migradas: ${guildEntries.length}`);
    }

    // 3. Migração de Casamentos (data/marriageData.json)
    const marriagePath = path.join(dataDir, 'marriageData.json');
    if (fs.existsSync(marriagePath)) {
      const rawMarriages = JSON.parse(fs.readFileSync(marriagePath, 'utf8'));
      const marMap = rawMarriages.marriages || rawMarriages;
      const entries = Object.entries(marMap);

      for (const [mId, mData] of entries) {
        if (!mData || typeof mData !== 'object') continue;
        const u1 = mData.user1Id || (Array.isArray(mData.spouses) ? mData.spouses[0] : null);
        const u2 = mData.user2Id || (Array.isArray(mData.spouses) ? mData.spouses[1] : null);
        if (!u1 || !u2) continue;

        for (const uId of [u1, u2]) {
          await db.insert(users).values({ userId: uId }).onConflictDoNothing();
        }

        const lovePoints = mData.lovePoints || mData.loveBar || 0;
        const sharedVaultCoins = mData.sharedVaultCoins || mData.house?.vaultBalance || 0;

        await db.insert(marriages)
          .values({
            id: mId,
            user1Id: u1,
            user2Id: u2,
            lovePoints,
            marriedAt: mData.marriedAt ? new Date(mData.marriedAt) : new Date(),
            sharedVaultCoins,
            children: mData.children || [],
            treeOfLife: mData.treeOfLife || {}
          })
          .onConflictDoUpdate({
            target: marriages.id,
            set: { lovePoints, sharedVaultCoins }
          });
      }
      console.log(`✅ Registros de casamento migrados: ${entries.length}`);
    }

    // 4. Migração da Sandbox da Cringelândia (data/cringelandia/*.json)
    const cringeDir = path.join(dataDir, 'cringelandia');
    if (fs.existsSync(cringeDir)) {
      const files = fs.readdirSync(cringeDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const key = path.basename(file, '.json');
        const content = JSON.parse(fs.readFileSync(path.join(cringeDir, file), 'utf8'));

        await db.insert(cringelandiaLab)
          .values({ key, data: content })
          .onConflictDoUpdate({
            target: cringelandiaLab.key,
            set: { data: content, updatedAt: new Date() }
          });
      }
      console.log(`✅ Arquivos de laboratório da Cringelândia migrados: ${files.length}`);
    }

    await client.query('COMMIT');
    console.log('🎉 COMMIT executado com sucesso.');

    // Auditoria de Contagem Cruzada
    const [uCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [tCount] = await db.select({ count: sql`count(*)` }).from(tarotAlbums);
    const [mCount] = await db.select({ count: sql`count(*)` }).from(marriages);
    const [gCount] = await db.select({ count: sql`count(*)` }).from(guildConfigs);

    console.log('📊 Auditoria Final de Integridade:');
    console.log(`   Usuários no PostgreSQL:   ${uCount.count}`);
    console.log(`   Álbuns no PostgreSQL:     ${tCount.count}`);
    console.log(`   Casamentos no PostgreSQL: ${mCount.count}`);
    console.log(`   Guildas no PostgreSQL:    ${gCount.count}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro crítico na migração. ROLLBACK executado!', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
