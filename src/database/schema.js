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

// 7. Casos de Moderação Numerados por Servidor (#1, #2...)
const modCases = pgTable('mod_cases', {
  id: text('id').primaryKey(), // '<guildId>:<caseNumber>'
  guildId: text('guild_id').notNull(),
  caseNumber: integer('case_number').notNull(),
  action: text('action').notNull(), // 'warn' | 'timeout' | 'kick' | 'ban' | 'unban' | 'note'
  targetId: text('target_id').notNull(),
  moderatorId: text('moderator_id').notNull(),
  reason: text('reason').default('').notNull(),
  points: integer('points').default(0).notNull(),
  durationMs: bigint('duration_ms', { mode: 'number' }).default(0).notNull(),
  expiresAt: timestamp('expires_at'),
  active: integer('active').default(1).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 8. Advertências por Pontos com Validade
const modWarnings = pgTable('mod_warnings', {
  id: text('id').primaryKey(),
  guildId: text('guild_id').notNull(),
  userId: text('user_id').notNull(),
  moderatorId: text('moderator_id').notNull(),
  caseNumber: integer('case_number').notNull(),
  points: integer('points').default(1).notNull(),
  reason: text('reason').default('').notNull(),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  revokedBy: text('revoked_by'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

module.exports = {
  guildConfigs,
  users,
  tarotAlbums,
  marriages,
  schedulerState,
  cringelandiaLab,
  modCases,
  modWarnings
};
