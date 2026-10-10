const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pyxie_user:pyxie_secure_pass@localhost:5432/pyxie_db',
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.error('❌ Erro crítico inesperado no Pool do PostgreSQL:', err);
});

const db = drizzle(pool, { schema });

module.exports = { db, pool };
