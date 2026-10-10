const { pgTable, text, integer, bigint, timestamp, jsonb } = require('drizzle-orm/pg-core');

// 1. Configurações por Servidor (substitui data/guildConfigs.json)
const guildConfigs = pgTable('guild_configs', {
  guildId: text('guild_id').primaryKey(),
  language: text('language').default('pt_BR').notNull(),
  prefix: text('prefix').default('py!').notNull(),
  channels: jsonb('channels').default({}).notNull(),
  roles: jsonb('roles').default({}).notNull(),
  enabledModules: jsonb('enabled_modules').default(['economy', 'tarot', 'social']).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 2. Usuários Globais, Carteira e Carreira (substitui economia em JSON)
const users = pgTable('users', {
  userId: text('user_id').primaryKey(),
  coins: bigint('coins', { mode: 'number' }).default(0).notNull(),
  beans: integer('beans').default(0).notNull(),
  profession: text('profession'),
  professionLevel: integer('profession_level').default(1).notNull(),
  lastDailyAt: timestamp('last_daily_at'),
  lastWorkAt: timestamp('last_work_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 3. Álbum de Tarot das 78 Cartas (substitui data/tarotAlbuns.json)
const tarotAlbums = pgTable('tarot_albums', {
  userId: text('user_id').primaryKey().references(() => users.userId, { onDelete: 'cascade' }),
  discoveredCards: integer('discovered_cards').array().default([]).notNull(),
  claimedAchievements: text('claimed_achievements').array().default([]).notNull(),
  totalPulls: integer('total_pulls').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 4. Módulo Social: Casamentos e Família (substitui data/marriageData.json)
const marriages = pgTable('marriages', {
  id: text('id').primaryKey(),
  user1Id: text('user1_id').notNull().references(() => users.userId),
  user2Id: text('user2_id').notNull().references(() => users.userId),
  lovePoints: integer('love_points').default(0).notNull(),
  marriedAt: timestamp('married_at').defaultNow().notNull(),
  sharedVaultCoins: bigint('shared_vault_coins', { mode: 'number' }).default(0).notNull(),
  children: jsonb('children').default([]).notNull(),
  treeOfLife: jsonb('tree_of_life').default({}).notNull()
});

// 5. Watchdog de Agendamento e Tarefas Automáticas (substitui schedulerState.json)
const schedulerState = pgTable('scheduler_state', {
  jobKey: text('job_key').primaryKey(),
  scope: text('scope').default('global').notNull(),
  lastExecutionAt: timestamp('last_execution_at'),
  metadata: jsonb('metadata').default({}).notNull()
});

// 6. Sandbox da Cringelândia (substitui data/cringelandia/*.json)
const cringelandiaLab = pgTable('cringelandia_lab', {
  key: text('key').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = {
  guildConfigs,
  users,
  tarotAlbums,
  marriages,
  schedulerState,
  cringelandiaLab
};
