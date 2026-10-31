// E1: os dados do Estúdio de Loja são por servidor. A Mary mantém o arquivo legado;
// qualquer outro servidor grava no próprio diretório e nunca enxerga a Mary.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🏬 Testes do armazenamento por servidor (Estúdio de Loja)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-store-'));

const { MARY_GUILD_ID } = require('../src/config/scopes');
const manager = require('../src/modules/mary-studio/maryStudioManager');

const DATA = process.env.PYXIE_DATA_DIR;
const OTHER = '123456789012345678';

// 1. Mary mantém os padrões dela
const maryCfg = manager.loadConfig(MARY_GUILD_ID);
assert.equal(maryCfg.statusLoja, 'online');
assert.equal(maryCfg.estoqueRobux, 25000);
assert.equal(maryCfg.macros.length, 6, 'Mary mantém as macros dela');
console.log('  ✅ 1. Configuração da Mary continua igual (status online, 6 macros).');

// 2. Servidor novo nasce neutro e offline (não herda nada da Mary)
const fresh = manager.loadConfig(OTHER);
assert.equal(fresh.statusLoja, 'offline', 'lojinha nova nasce fechada');
assert.equal(fresh.estoqueRobux, 0);
assert.equal(fresh.pixKey, '');
assert.equal(fresh.macros.length, 0);
assert.equal(fresh.pixName, '', 'não herda o nome PIX da Mary');
console.log('  ✅ 2. Servidor novo nasce offline, sem estoque, sem PIX e sem macros da Mary.');

// 3. Gravar no servidor novo não toca no arquivo da Mary
manager.saveConfig({ ...fresh, estoqueRobux: 999, pixKey: 'chave-do-cliente' }, OTHER);
const maryAfter = manager.loadConfig(MARY_GUILD_ID);
const otherAfter = manager.loadConfig(OTHER);
assert.equal(otherAfter.estoqueRobux, 999);
assert.equal(otherAfter.pixKey, 'chave-do-cliente');
assert.equal(maryAfter.estoqueRobux, 25000, 'Mary não pode ser afetada');
assert.equal(maryAfter.pixKey, '', 'PIX da Mary não pode vazar para o cliente');
console.log('  ✅ 3. Salvar em um servidor não altera a Mary (isolamento de configuração).');

// 4. Arquivos separados no disco
const maryFile = path.join(DATA, 'maryStudioConfig.json');
const otherFile = path.join(DATA, 'guilds', OTHER, 'store', 'config.json');
assert.ok(fs.existsSync(maryFile), 'arquivo legado da Mary existe');
assert.ok(fs.existsSync(otherFile), 'arquivo do servidor novo existe');
console.log('  ✅ 4. Cada servidor tem o seu próprio arquivo.');

// 5. Tickets/avaliações também são por servidor
const maryData = manager.loadStoreData(MARY_GUILD_ID);
assert.equal(Object.keys(maryData.tickets || {}).length, 0);
manager.saveStoreData({ ...manager.loadStoreData(OTHER), tickets: { t1: { status: 'open' } } }, OTHER);
assert.equal(Object.keys(manager.loadStoreData(OTHER).tickets).length, 1);
assert.equal(Object.keys(manager.loadStoreData(MARY_GUILD_ID).tickets).length, 0, 'ticket do cliente não aparece na Mary');
console.log('  ✅ 5. Tickets e avaliações isolados por servidor.');

// 6. Uploads vão para pastas diferentes e URLs diferentes
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.alloc(24, 1)]);
const maryUpload = manager.saveUpload(png, MARY_GUILD_ID);
const otherUpload = manager.saveUpload(png, OTHER);
assert.equal(maryUpload.ok, true);
assert.ok(maryUpload.url.includes('/api/mary/media/'), 'Mary mantém a rota legada');
assert.ok(otherUpload.url.includes(`/api/store/media/${OTHER}/`), 'cliente usa a rota do servidor');
assert.ok(fs.existsSync(path.join(DATA, 'uploads', 'store', OTHER, otherUpload.fileName)));
console.log('  ✅ 6. Imagens separadas por servidor, com URL própria.');

console.log('🏬 Armazenamento por servidor: tudo certo.');
