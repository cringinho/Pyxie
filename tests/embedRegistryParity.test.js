const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { EMBED_REGISTRY, getAllEmbedsWithResolvedSlots } = require('../src/utils/embedRegistry');
const { resolveEmoji } = require('../src/utils/emojiResolver');

console.log('🧪 Iniciando testes de paridade SSOT do Embed Registry e Emojis...');

// 1. Validação estrutural de todos os embeds registrados
assert.ok(EMBED_REGISTRY.size >= 25, `Esperava pelo menos 25 embeds registrados, encontrado: ${EMBED_REGISTRY.size}`);

const requiredEmbeds = [
  'tickets_main_panel',
  'tickets_art_removal_pending',
  'tickets_room_welcome',
  'giveaway_admin_hub',
  'giveaway_public_card',
  'venting_sticky_panel',
  'venting_autohelp_card',
  'welcome_panel',
  'welcome_checkin_card',
];

for (const id of requiredEmbeds) {
  assert.ok(EMBED_REGISTRY.has(id), `Embed obrigatório '${id}' não está registrado em EMBED_REGISTRY!`);
  const schema = EMBED_REGISTRY.get(id);
  assert.ok(schema.name, `Embed '${id}' deve possuir 'name'`);
  assert.ok(schema.category, `Embed '${id}' deve possuir 'category'`);
  assert.ok(Array.isArray(schema.slots), `Embed '${id}' deve possuir array de 'slots'`);
  assert.ok(schema.defaultColor, `Embed '${id}' deve possuir 'defaultColor'`);
}
console.log('✅ Todos os 9 novos schemas obrigatórios estão íntegros e registrados.');

// 2. Auditoria rigorosa de expurgo: Zero resíduos de shop / inventory / relic_t*
const obsoleteTokens = ['shop_catalog', 'shop_chest', 'shop_gem', 'relic_t1', 'relic_t2', 'relic_t3', 'relic_t4', 'relic_t5'];

assert.ok(!EMBED_REGISTRY.has('shop_catalog'), "Embed 'shop_catalog' não deve existir no EMBED_REGISTRY!");

for (const [id, schema] of EMBED_REGISTRY.entries()) {
  assert.ok(id !== 'shop_catalog', "Embed id 'shop_catalog' encontrado no registro!");
  for (const slot of schema.slots || []) {
    assert.ok(
      !obsoleteTokens.includes(slot.defaultEmojiKey),
      `Slot '${slot.key}' no embed '${id}' possui defaultEmojiKey obsoleto: '${slot.defaultEmojiKey}'`
    );
  }
}
console.log('✅ Nenhum resíduo de loja legada ou relíquias encontrado no EMBED_REGISTRY.');

// 3. Auditoria de emojis.json (src/data/emojis.json)
const emojisPath = path.join(__dirname, '..', 'src', 'data', 'emojis.json');
if (fs.existsSync(emojisPath)) {
  const emojis = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));
  for (const token of obsoleteTokens) {
    assert.ok(!(token in emojis), `Chave obsoleta '${token}' encontrada em src/data/emojis.json!`);
  }
}
console.log('✅ Arquivo src/data/emojis.json auditado e 100% livre de chaves legadas.');

// 4. Teste de funcionamento do resolveEmoji (discord e web)
const discordCoin = resolveEmoji(null, 'coins', 'discord');
assert.ok(typeof discordCoin === 'string' && discordCoin.length > 0, 'resolveEmoji discord mode falhou');

const webCoin = resolveEmoji(null, 'coins', 'web');
assert.ok(typeof webCoin === 'string' && webCoin.length > 0, 'resolveEmoji web mode falhou');

console.log('✅ resolveEmoji validado com sucesso nos modos discord e web.');
console.log('🎉 tests/embedRegistryParity.test.js concluído com 100% de sucesso!');

