import { openSqlite } from './adapter.js';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';
import { initDb } from './init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mary_diary.db');

export const sqlite = openSqlite(dbPath);

// Configuração de alto desempenho e integridade WAL
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('busy_timeout = 5000');

// Criação idempotente do schema das tabelas
initDb(sqlite);

export const db = drizzle(sqlite, { schema });
export { schema };
