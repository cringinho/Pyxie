module.exports = {
  schema: './src/database/schema.js',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://pyxie_user:pyxie_secure_pass@localhost:5432/pyxie_db'
  }
};
