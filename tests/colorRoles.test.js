const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🎨 Testes do canal de cores (75 cores)...');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-colors-'));
const colorRoles = require('../src/services/colorRoles');
const { TRANSLATIONS } = require('../src/utils/i18n');

const G = '1453890868980482090';

(async () => {
  try {
    // 1. Catálogo: 75 cores únicas, números de 1 a 75, hex válido
    assert.equal(colorRoles.CATALOG.length, 75);
    assert.deepEqual(colorRoles.CATALOG.map((c) => c.n), Array.from({ length: 75 }, (_, i) => i + 1));
    assert.ok(colorRoles.CATALOG.every((c) => /^#[0-9a-f]{6}$/.test(c.hex) && c.name));
    assert.equal(new Set(colorRoles.CATALOG.map((c) => c.hex)).size, 75, 'Sem cor repetida');
    console.log('  ✅ 1. Catálogo com 75 cores únicas.');

    // 2. Sincronização: reaproveita 1–51 pelo número, cria 52–75 logo abaixo
    const existing = Array.from({ length: 51 }, (_, i) => ({ id: `9000000000000000${String(i + 1).padStart(2, '0')}`, name: `${i + 1} Velha`, position: 126 - i }));
    existing.push({ id: '800000000000000001', name: 'Staff', position: 140 });
    const calls = [];
    let nextId = 100;
    const discord = async (method, route, body) => {
      calls.push({ method, route, body });
      if (method === 'GET') return existing;
      if (method === 'POST') return { id: `70000000000000${nextId++}`, ...body };
      return {};
    };
    const sync = await colorRoles.syncRoles(G, discord);
    assert.equal(sync.reused, 51);
    assert.equal(sync.created, 24);
    const posts = calls.filter((c) => c.method === 'POST');
    assert.equal(posts[0].body.name, '52 Bordô');
    assert.equal(posts[0].body.permissions, '0', 'Cargo de cor sem permissões');
    const patch = calls.find((c) => c.method === 'PATCH');
    assert.equal(patch.body[0].position, 75, 'Primeiro cargo novo logo abaixo do 51 (posição 76)');
    assert.equal(colorRoles.loadMap(G)[1], existing[0].id);
    console.log('  ✅ 2. Reaproveita os 51 cargos e cria os 24 que faltam no lugar certo.');

    // 3. Painel: 3 menus de 25 + botão; limites do Discord; legível (blocos de 5)
    for (const lang of ['pt', 'en']) {
      const panel = colorRoles.buildPanel(G, lang);
      assert.equal(panel.length, 4);
      for (const msg of panel.slice(0, 3)) {
        const menu = msg.components[0].components[0];
        assert.equal(menu.options.length, 25);
        assert.ok(menu.options.every((o) => o.label.length <= 100));
        assert.ok(msg.embeds[0].description.length <= 4096);
        assert.ok(msg.embeds[0].title.length <= 256);
        assert.deepEqual(msg.allowed_mentions, { parse: [] }, 'Menções de cargo não notificam ninguém');
        assert.ok(!/━|═|-{6,}/.test(msg.embeds[0].description), 'Sem divisores ASCII');
      }
      assert.equal(panel[3].components[0].components[0].custom_id, 'colors:clear');
    }
    console.log('  ✅ 3. Painel com 3 menus de 25 cores e botão de tirar a cor.');

    // 4. Textos PT/EN
    assert.deepEqual(Object.keys(TRANSLATIONS.pt.colors).sort(), Object.keys(TRANSLATIONS.en.colors).sort());
    console.log('  ✅ 4. Textos PT/EN.');
    console.log('🎉 [TEST] Canal de cores validado!');
  } finally {
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
