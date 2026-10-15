import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Adaptador de SQLite com suporte a WAL, Drizzle ORM e compatibilidade total
 * Se better-sqlite3 nativo estiver disponível (ex: Ubuntu VM), utiliza nativo.
 * Se estiver no Windows/Node 24 (sem prebuilts nativos), utiliza node:sqlite embutido.
 */
class SqliteSyncCompat {
  constructor(dbPath) {
    this.rawDb = new DatabaseSync(dbPath);
  }

  pragma(str) {
    return this.rawDb.exec(`PRAGMA ${str};`);
  }

  exec(str) {
    return this.rawDb.exec(str);
  }

  prepare(sql) {
    const rawStmt = this.rawDb.prepare(sql);
    const wrapper = {
      raw(val = true) {
        rawStmt.setReturnArrays(Boolean(val));
        return wrapper;
      },
      run(...args) {
        const res = rawStmt.run(...args);
        return {
          changes: res.changes,
          lastInsertRowid: res.lastInsertRowid
        };
      },
      get(...args) {
        return rawStmt.get(...args);
      },
      all(...args) {
        return rawStmt.all(...args);
      }
    };
    return wrapper;
  }

  transaction(fn) {
    const rawDb = this.rawDb;
    const runner = function (...args) {
      rawDb.exec('BEGIN');
      try {
        const res = fn(...args);
        rawDb.exec('COMMIT');
        return res;
      } catch (err) {
        rawDb.exec('ROLLBACK');
        throw err;
      }
    };
    runner.deferred = runner;
    runner.immediate = runner;
    runner.exclusive = runner;
    return runner;
  }
}

export function openSqlite(dbPath) {
  try {
    // Tenta carregar better-sqlite3 se compilado nativamente
    const BetterSqlite = require('better-sqlite3');
    return new BetterSqlite(dbPath);
  } catch (err) {
    // Fallback gracioso para a engine de SQLite nativa do Node.js
    return new SqliteSyncCompat(dbPath);
  }
}
