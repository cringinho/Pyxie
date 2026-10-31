/**
 * Sobe uma instância de TESTE da Pyxie com o aplicativo "Pyxie-Testing".
 *
 * Garantias:
 *  - lê SÓ o .env.testing (nunca o .env de produção);
 *  - dados isolados em data-test/ (o banco/arquivos da Pyxie não são tocados);
 *  - DATABASE_URL vazio: cai no armazenamento em JSON, sem Postgres compartilhado;
 *  - canais de anúncio desligados ('0'): o bot não publica nada em servidor nenhum;
 *  - integrações pagas (Groq, Mercado Pago, PayPal, listas) ficam sem chave.
 *
 * Uso: npm run bot:test
 */
const path = require('path');
const fs = require('node:fs');

const ROOT = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(ROOT, '.env.testing') });

if (!process.env.DISCORD_TOKEN) {
  console.error('[teste] DISCORD_TOKEN não encontrado em .env.testing.');
  process.exit(1);
}

// Caminho absoluto: o processo não depende do cwd de quem chamou.
process.env.PYXIE_DATA_DIR = path.resolve(ROOT, process.env.PYXIE_DATA_DIR || 'data-test');
fs.mkdirSync(process.env.PYXIE_DATA_DIR, { recursive: true });

// Blindagens que não podem depender do arquivo de env.
process.env.DATABASE_URL = '';
process.env.STARTUP_CHANNEL_ID = '0';
process.env.TAROT_LOG_CHANNEL_ID = '0';
process.env.HOMOLOGATION_CHANNEL_ID = '0';
process.env.PYXIE_TEST_BOT = '1';
process.env.PORT = process.env.PORT || '3101';

// Integrações externas sem chave (o .env de produção não pode entrar por engano).
for (const key of [
  'GROQ_API_KEY',
  'MERCADOPAGO_ACCESS_TOKEN',
  'MERCADOPAGO_WEBHOOK_SECRET',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'TOPGG_API_TOKEN',
  'TOPGG_WEBHOOK_SECRET',
  'TOPGG_WEBHOOK_AUTH',
  'DISCORDBOTLIST_TOKEN',
  'DISCORDS_TOKEN',
  'DISCORD_BOTS_GG_TOKEN',
  'LOOT_LABS_API_KEY',
  'PASS_TOKEN_SECRET',
]) {
  process.env[key] = '';
}

console.log('════════════════════════════════════════════════════');
console.log(`🧪 Bot de TESTE: ${process.env.BOT_NAME || 'Pyxie-Testing'}`);
console.log(`   app id:  ${process.env.DISCORD_CLIENT_ID}`);
console.log(`   dados:   ${process.env.PYXIE_DATA_DIR}`);
console.log('   postgres: desligado · anúncios: desligados · integrações: sem chave');
console.log('════════════════════════════════════════════════════');

// index.js só inicia quando é o módulo principal (`require.main === module`),
// por isso ele roda como processo filho — herdando o ambiente já blindado acima.
const { spawn } = require('node:child_process');
const child = spawn(process.execPath, [path.join(ROOT, 'index.js')], {
  cwd: ROOT,
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  console.log(`[teste] processo encerrado (code=${code} signal=${signal || '-'})`);
  process.exit(code === null ? 1 : code);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

