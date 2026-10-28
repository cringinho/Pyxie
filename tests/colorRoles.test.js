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
    assert.equal(posts[0].body.name, 'Bordô', 'Cargo novo sem número no nome');
    assert.equal(posts[0].body.permissions, '0', 'Cargo de cor sem permissões');
    const renames = calls.filter((c) => c.method === 'PATCH' && /\/roles\/\d+$/.test(c.route));
    assert.equal(sync.renamed, 51);
    assert.equal(renames.length, 51);
    assert.equal(renames[0].body.name, colorRoles.CATALOG[0].name, 'Cargo antigo renomeado sem o número');
    const move = calls.find((c) => c.method === 'PATCH' && c.route.endsWith('/roles'));
    assert.equal(move.body[0].position, 75, 'Primeiro cargo novo logo abaixo do 51 (posição 76)');
    assert.equal(colorRoles.loadMap(G)[1], existing[0].id);
    // Rodar de novo com os cargos já renomeados: acha pelo mapa salvo, sem renomear nem criar nada.
    const renamedRoles = colorRoles.CATALOG.map((c) => ({ id: colorRoles.loadMap(G)[c.n], name: c.name, position: 100 - c.n }));
    calls.length = 0;
    const again = await colorRoles.syncRoles(G, async (method, route) => (calls.push({ method, route }), method === 'GET' ? renamedRoles : {}));
    assert.equal(again.created + again.renamed, 0);
    assert.equal(calls.length, 1, 'Só a leitura dos cargos');
    console.log('  ✅ 2. Reaproveita os 51 cargos, tira o número do nome e cria os 24 que faltam no lugar certo.');

    // 3. Painel: 3 embeds em duas colunas crescentes + menus de 25 + botão; limites do Discord; sem números
    for (const lang of ['pt', 'en']) {
      const panel = colorRoles.buildPanel(G, lang);
      assert.equal(panel.length, 4);
      for (const [g, msg] of panel.slice(0, 3).entries()) {
        const menu = msg.components[0].components[0];
        assert.equal(menu.options.length, 25);
        assert.ok(menu.options.every((o) => o.label.length <= 100 && !/\d/.test(o.label)), 'Opções sem número');
        const embed = msg.embeds[0];
        assert.ok(embed.title.length <= 256);
        assert.equal(embed.fields.length, 2, 'Duas colunas');
        assert.ok(embed.fields.every((f) => f.inline && f.value.length <= 1024));
        const ids = embed.fields.flatMap((f) => f.value.split('\n'));
        const expected = colorRoles.CATALOG.slice(g * 25, g * 25 + 25).map((c) => `<@&${colorRoles.loadMap(G)[c.n]}>`);
        assert.deepEqual(ids, expected, 'Ordem crescente: coluna da esquerda, depois a da direita');
        assert.equal(embed.fields[0].value.split('\n').length, 13);
        assert.deepEqual(msg.allowed_mentions, { parse: [] }, 'Menções de cargo não notificam ninguém');
      }
      assert.equal(panel[3].components[0].components[0].custom_id, 'colors:clear');
    }
    console.log('  ✅ 3. Painel com 3 embeds em duas colunas, menus de 25 cores e botão de tirar a cor.');

    // 3b. Publicar de novo edita o painel que já está no canal, na ordem certa
    const panelMsgs = ['105', '103', '104', '102'].map((id, i) => ({ id, author: { bot: true }, components: [{ components: [{ custom_id: i === 0 ? 'colors:clear' : `colors:pick:${i}` }] }] }));
    const other = { id: '101', author: { bot: false }, components: [] };
    calls.length = 0;
    const pub = await colorRoles.publishPanel(G, '555', async (method, route, body) => (calls.push({ method, route, body }), method === 'GET' ? [...panelMsgs, other] : {}));
    assert.equal(pub.edited, true);
    assert.deepEqual(calls.filter((c) => c.method === 'PATCH').map((c) => c.route.split('/').pop()), ['102', '103', '104', '105']);
    assert.equal(calls.filter((c) => c.method === 'POST').length, 0);
    calls.length = 0;
    const fresh = await colorRoles.publishPanel(G, '555', async (method, route) => (calls.push({ method, route }), method === 'GET' ? [other] : { id: '1' }));
    assert.equal(fresh.edited, false);
    assert.equal(calls.filter((c) => c.method === 'POST').length, 4);
    console.log('  ✅ 3b. Publicar de novo edita o painel no lugar.');

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
