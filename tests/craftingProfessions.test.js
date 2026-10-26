const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Profissões novas, materiais do trabalho e a oficina (/py-craft): cada turno certo rende o
 * material da profissão, receitas gastam materiais e uma taxa sob a trava, devolvem tudo se o
 * cofre recusar, e os móveis de artesanato só existem pela oficina.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-craft-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const crafting = require('../src/services/crafting');
const professions = require('../src/services/professions');
const { CAREER_HIERARCHIES } = require('../src/services/careerHierarchy');
const trabalho = require('../src/commands/trabalho');
const profissao = require('../src/commands/profissao');
const pyCraft = require('../src/modules/home/commands/pyCraft');
const { getItem } = require('../src/modules/home/homeCatalog');
const { t } = require('../src/utils/i18n');

const runId = Date.now();
const U = `user_test_craft_${runId}`;
const NEW = ['minerador', 'pescador', 'florista', 'marceneiro', 'costureiro', 'arqueologo'];

console.log('🛠️ Iniciando testes da oficina e das profissões novas...');

(async () => {
  try {
    // 1. Profissões novas completas (PT/EN, cargos, minigames, dilemas, material)
    for (const key of NEW) {
      assert.ok(professions[key] && professions[key].words.length >= 100, key);
      assert.equal(CAREER_HIERARCHIES[key].length, 4, `${key}: 4 cargos`);
      assert.ok(trabalho.PROFESSION_MINIGAMES[key].length >= 6, `${key}: minigames`);
      assert.ok(trabalho.PROFESSION_DILEMMAS[key], `${key}: dilema`);
      for (const lang of ['pt', 'en']) assert.ok(!t(`profession.labels.${key}`, lang).startsWith('profession.'), `${key}: rótulo ${lang}`);
      assert.ok(crafting.PROFESSION_MATERIALS[key], `${key}: material`);
      const levels = new Set(trabalho.PROFESSION_MINIGAMES[key].map((game) => game.level));
      assert.deepEqual([...levels].sort(), [1, 2, 3, 4], `${key}: perguntas em todos os níveis`);
    }
    for (const key of Object.keys(professions)) assert.ok(crafting.PROFESSION_MATERIALS[key], `Toda profissão traz material: ${key}`);
    assert.equal(profissao.resolveProfession('carpinteira'), 'marceneiro');
    assert.equal(profissao.resolveProfession('fisherman'), 'pescador');
    console.log('  ✅ 1. Seis profissões novas completas em PT/EN.');

    // 2. Autocompletar no lugar das 25 escolhas fixas
    const json = profissao.data.toJSON();
    assert.equal(json.options[0].autocomplete, true);
    let responded = null;
    await profissao.autocomplete({ locale: 'pt-BR', options: { getFocused: () => 'pesc' }, respond: async (list) => { responded = list; } });
    assert.deepEqual(responded.map((c) => c.value), ['pescador']);
    await profissao.autocomplete({ locale: 'en-US', options: { getFocused: () => '' }, respond: async (list) => { responded = list; } });
    assert.ok(responded.length <= 25);
    console.log('  ✅ 2. /py-profession com autocompletar.');

    // 3. Material do turno: 1, +1 na alta demanda, +1 do nível 3 em diante
    const drops = crafting.grantWorkMaterials(U, 'pescador', { golden: true, level: 3, random: () => 0 });
    assert.deepEqual(drops, [{ material: 'shell', qty: 3 }]);
    assert.equal(crafting.getMaterials(U).shell, 3);
    assert.deepEqual(crafting.grantWorkMaterials(U, 'inexistente'), []);
    assert.equal(crafting.addMaterials(U, { shell: -10 }).ok, false, 'Nunca fica negativo');
    assert.equal(crafting.getMaterials(U).shell, 3);
    console.log('  ✅ 3. Materiais do trabalho.');

    // 4. Oficina: falta material, falta moedinha, sucesso e item só de artesanato
    economy.setUserBalance(U, 10);
    assert.equal(crafting.craft(U, 'craft_shell_jar').reason, 'coins');
    assert.equal(crafting.getMaterials(U).shell, 3, 'Sem moedinhas, nada é gasto');
    economy.setUserBalance(U, 100);
    assert.deepEqual(crafting.craft(U, 'craft_quilt').missing, { fabric: 4 });
    const made = crafting.craft(U, 'craft_shell_jar');
    assert.equal(made.ok, true);
    assert.equal(crafting.getMaterials(U).shell, 0);
    assert.equal(economy.getBalance(U), 80);
    assert.ok(vault.ownsItem(U, 'craft_shell_jar'));
    assert.equal(crafting.craft(U, 'nope').reason, 'unknown_recipe');
    for (const recipe of crafting.RECIPES) {
      const entry = getItem(recipe.itemId);
      assert.ok(entry && entry.source === 'craft' && entry.price === null, `${recipe.itemId} só sai da oficina`);
      assert.ok(entry.sets.includes('artesao'));
    }
    console.log('  ✅ 4. Oficina gasta sob trava e entrega móveis exclusivos.');

    // 5. Telas da oficina
    crafting.addMaterials(U, { fabric: 4 });
    const view = await pyCraft.buildWorkshopView({ owner: { id: U }, source: { lang: 'pt' } });
    assert.equal(view.embeds[0].data.title, t('craft.title', 'pt'));
    assert.equal(view.components[0].toJSON().components[0].options.length, crafting.RECIPES.length);
    assert.equal(view.files.length, 1, 'Vitrine das receitas renderizada');
    const recipe = await pyCraft.buildRecipeView({ owner: { id: U }, source: { lang: 'en' }, itemId: 'craft_quilt' });
    const make = recipe.components[1].toJSON().components[0];
    assert.equal(make.custom_id, `craft:make:${U}:craft_quilt`);
    assert.equal(make.disabled, false, 'Com material, o botão Fazer libera');
    const calls = [];
    await pyCraft.handleCraftInteraction({
      customId: `craft:make:${U}:craft_quilt`, user: { id: U }, lang: 'pt',
      isButton: () => true, isStringSelectMenu: () => false,
      update: async (p) => calls.push(['update', p]), reply: async (p) => calls.push(['reply', p]),
    });
    assert.ok(calls[0][1].embeds[0].data.description.includes('Pronto, fiz'));
    assert.ok(vault.ownsItem(U, 'craft_quilt'));
    await pyCraft.handleCraftInteraction({
      customId: `craft:back:${U}`, user: { id: 'outra_pessoa' }, lang: 'pt',
      isButton: () => true, isStringSelectMenu: () => false,
      update: async (p) => calls.push(['update', p]), reply: async (p) => calls.push(['reply', p]),
    });
    assert.equal(calls[1][1].content, t('craft.notYours', 'pt'));
    console.log('  ✅ 5. Telas e botões da oficina.');

    console.log('✨ Oficina e profissões novas validadas.');
  } catch (err) {
    console.error('❌ Falha nos testes da oficina:', err);
    process.exitCode = 1;
  } finally {
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})();
