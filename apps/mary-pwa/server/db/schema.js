import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  displayName: text('display_name').notNull(),
  nickname: text('nickname'),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  bannerColor: text('banner_color'),
  bio: text('bio'),
  moodStatus: text('mood_status'),
  theme: text('theme').default('dark-romantic').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const memories = sqliteTable('memories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  memoryDate: text('memory_date').notNull(),
  mood: text('mood'),
  tags: text('tags'), // JSON string array: ["tag1", "tag2"]
  location: text('location'),
  isCapsule: integer('is_capsule').default(0).notNull(),
  unlockAt: text('unlock_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const memoryMedia = sqliteTable('memory_media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  memoryId: integer('memory_id').references(() => memories.id, { onDelete: 'cascade' }),
  uploadedBy: integer('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  albumName: text('album_name').default('Geral').notNull(),
  caption: text('caption'),
  fileUrl: text('file_url').notNull(),
  thumbUrl: text('thumb_url'),
  width: integer('width'),
  height: integer('height'),
  isFavorite: integer('is_favorite').default(0).notNull(),
  takenAt: text('taken_at'),
  createdAt: text('created_at').notNull()
});

export const memoryLikes = sqliteTable('memory_likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  memoryId: integer('memory_id').notNull().references(() => memories.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reaction: text('reaction').default('heart').notNull(),
  createdAt: text('created_at').notNull()
}, (t) => [
  unique('uniq_memory_user_like').on(t.memoryId, t.userId)
]);

export const memoryConnections = sqliteTable('memory_connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceMemoryId: integer('source_memory_id').notNull().references(() => memories.id, { onDelete: 'cascade' }),
  targetMemoryId: integer('target_memory_id').notNull().references(() => memories.id, { onDelete: 'cascade' }),
  label: text('label'),
  createdAt: text('created_at').notNull()
});

export const wordNodes = sqliteTable('word_nodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  word: text('word').notNull().unique(),
  normalizedWord: text('normalized_word').notNull().unique(),
  meaningOrNote: text('meaning_or_note'),
  color: text('color').default('#EC4899').notNull(),
  iconName: text('icon_name').default('Sparkles').notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  isCustom: integer('is_custom').default(1).notNull(),
  createdAt: text('created_at').notNull()
});

export const favoriteVerses = sqliteTable('favorite_verses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reference: text('reference').notNull(),
  text: text('text').notNull(),
  bookName: text('book_name').notNull(),
  chapter: integer('chapter').notNull(),
  verse: integer('verse').notNull(),
  savedBy: integer('saved_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  note: text('note'),
  createdAt: text('created_at').notNull()
});

export const coupleSettings = sqliteTable('couple_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  anniversaryDate: text('anniversary_date').default('2026-01-30').notNull(),
  specialDatesJson: text('special_dates_json'),
  pushSubscriptionsJson: text('push_subscriptions_json')
});
