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


// 9. Pyxie Hyperfokus: Artigos Editoriais do Fórum
const hyperfokusArticles = pgTable('hyperfokus_articles', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  discordThreadId: text('discord_thread_id'),
  title: text('title').notNull(),
  seoTitle: text('seo_title'),
  metaDescription: text('meta_description'),
  contentMarkdown: text('content_markdown').notNull(),
  contentHtml: text('content_html').notNull(),
  coverImage: text('cover_image'),
  categoryTags: text('category_tags').array().default([]).notNull(),
  status: text('status').default('PENDING_REVIEW').notNull(), // 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'
  viewsCount: integer('views_count').default(0).notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  readingTimeMinutes: integer('reading_time_minutes').default(1).notNull(),
  featured: integer('featured').default(0).notNull(),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  editedBy: text('edited_by'),
  metadata: jsonb('metadata').default({}).notNull(),
});

// 10. Coautores e Autores de Artigos
const hyperfokusArticleAuthors = pgTable('hyperfokus_article_authors', {
  id: text('id').primaryKey(), // '<articleId>:<userId>'
  articleId: text('article_id').notNull(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  globalName: text('global_name'),
  cachedAvatarWebp: text('cached_avatar_webp'),
  role: text('role').default('AUTHOR').notNull(), // 'AUTHOR' | 'COLLABORATOR'
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Curtidas em Artigos
const hyperfokusLikes = pgTable('hyperfokus_likes', {
  id: text('id').primaryKey(), // '<articleId>:<userId>'
  articleId: text('article_id').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Comentários Públicos de Artigos
const hyperfokusComments = pgTable('hyperfokus_comments', {
  id: text('id').primaryKey(),
  articleId: text('article_id').notNull(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  cachedAvatarWebp: text('cached_avatar_webp'),
  content: text('content').notNull(),
  hidden: integer('hidden').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Fila de Pins do Pinterest (Orçamento estrito de 3 pins/dia)
const hyperfokusPinQueue = pgTable('hyperfokus_pin_queue', {
  id: text('id').primaryKey(),
  articleId: text('article_id'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  link: text('link').notNull(),
  hashtags: text('hashtags').array().default([]).notNull(),
  altText: text('alt_text'),
  status: text('status').default('SCHEDULED').notNull(), // 'SCHEDULED' | 'RELEASED' | 'PAUSED'
  releaseAt: timestamp('release_at').notNull(),
  releasedAt: timestamp('released_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Telemetria e Analytics Agregado Diário
const hyperfokusAnalyticsDaily = pgTable('hyperfokus_analytics_daily', {
  id: text('id').primaryKey(), // '<date>:<articleId>'
  date: text('date').notNull(),
  articleId: text('article_id').default('global').notNull(),
  pageViews: integer('page_views').default(0).notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
  scroll25: integer('scroll_25').default(0).notNull(),
  scroll50: integer('scroll_50').default(0).notNull(),
  scroll75: integer('scroll_75').default(0).notNull(),
  scroll100: integer('scroll_100').default(0).notNull(),
  totalReadingSeconds: integer('total_reading_seconds').default(0).notNull(),
  shopeeClicks: integer('shopee_clicks').default(0).notNull(),
  inviteClicks: integer('invite_clicks').default(0).notNull(),
  topReferrers: jsonb('top_referrers').default({}).notNull(),
  searchTerms: jsonb('search_terms').default({}).notNull(),
});

// 15. Contas Unificadas e Identidades (Site & Discord)
const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  discordUserId: text('discord_user_id'),
  verifiedEmail: integer('verified_email').default(0).notNull(),
  readingPreferences: jsonb('reading_preferences').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 16. Indicações de Parceiros
const partnerReferrals = pgTable('partner_referrals', {
  id: text('id').primaryKey(),
  referrerUserId: text('referrer_user_id').notNull(),
  referredUserId: text('referred_user_id').notNull(),
  status: text('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

module.exports = {
  guildConfigs,
  users,
  tarotAlbums,
  marriages,
  schedulerState,
  cringelandiaLab,
  modCases,
  modWarnings,
  hyperfokusArticles,
  hyperfokusArticleAuthors,
  hyperfokusLikes,
  hyperfokusComments,
  hyperfokusPinQueue,
  hyperfokusAnalyticsDaily,
  accounts,
  partnerReferrals,
};
