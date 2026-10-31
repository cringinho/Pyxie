const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🎨 Testes dos AppEmojis nos temas do /py-profile...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-profile-'));

const economy = require('../src/services/economy');
const { getEmoji } = require('../src/utils/appEmojis');

const themes = Object.keys(economy.THEMES_CATALOG);
assert.ok(themes.length >= 12, 'Catálogo de temas completo');

for (const id of themes) {
  const pack = economy.getThemeEmojiPack(id);
  assert.ok(Array.isArray(pack) && pack.length >= 1, `${id}: pacote de emojis`);
  for (const emoji of pack) {
    assert.equal(typeof emoji, 'string');
    assert.ok(emoji.length > 0 && !emoji.includes('undefined'), `${id}: emoji inválido (${emoji})`);
  }
}

// O tema padrão usa AppEmojis de verdade (markup <:nome:id>), não unicode puro.
const defaultPack = economy.getThemeEmojiPack('default');
assert.ok(defaultPack.some((emoji) => emoji.startsWith('<')), 'Tema padrão com AppEmoji customizado');
assert.ok(getEmoji('pink_ribbon').startsWith('<'), 'pink_ribbon resolve no catálogo de AppEmojis');

// Tema inexistente cai no padrão sem quebrar.
assert.ok(economy.getThemeEmojiPack('nao-existe').length >= 1);
console.log('✅ Temas com AppEmojis: tudo certo.');
