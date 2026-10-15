/**
 * Inicialização idempotente das tabelas SQLite
 */
export function initDb(sqlite) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      nickname TEXT,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      banner_color TEXT,
      bio TEXT,
      mood_status TEXT,
      theme TEXT NOT NULL DEFAULT 'dark-romantic',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      memory_date TEXT NOT NULL,
      mood TEXT,
      tags TEXT,
      location TEXT,
      is_capsule INTEGER NOT NULL DEFAULT 0,
      unlock_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memory_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memory_id INTEGER REFERENCES memories(id) ON DELETE CASCADE,
      uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      album_name TEXT NOT NULL DEFAULT 'Geral',
      caption TEXT,
      file_url TEXT NOT NULL,
      thumb_url TEXT,
      width INTEGER,
      height INTEGER,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      taken_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memory_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reaction TEXT NOT NULL DEFAULT 'heart',
      created_at TEXT NOT NULL,
      UNIQUE(memory_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS memory_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
      target_memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
      label TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS word_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      normalized_word TEXT NOT NULL UNIQUE,
      meaning_or_note TEXT,
      color TEXT NOT NULL DEFAULT '#EC4899',
      icon_name TEXT NOT NULL DEFAULT 'Sparkles',
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      is_custom INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorite_verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL,
      text TEXT NOT NULL,
      book_name TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      saved_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS couple_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anniversary_date TEXT NOT NULL DEFAULT '2026-01-30',
      special_dates_json TEXT,
      push_subscriptions_json TEXT
    );
  `);
}
