const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * py!loja (nov/2026): o catálogo inteiro da Casinha à venda por moedinhas, sem raridade nem
 * rotação. Preço do catálogo quando existe, senão a tabela por tipo. Debita antes de entregar e
 * devolve se o cofre recusar. Só quem abriu a vitrine mexe nela. Textos em PT e EN.
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-loja-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const economy = require('../src/services/economy');
const vault = require('../src/services/itemVault');
const store = require('../src/modules/home/homeStore');
const { ITEMS } = require('../src/modules/home/homeCatalog');
const pyLoja = require('../src/modules/home/commands/pyLoja');
const { t } = require('../src/utils/i18n');

const runId = Date.now();
const U = `user_test_loja_${runId}`;
const OTHER = `user_test_loja_b_${runId}`;

function walk(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') walk(v, key, out);
    else out.push(key);
  }
  return out;
}

console.log('🛍️ Iniciando testes da py!loja...');

(async () => {
  try {
    // 1. Catálogo inteiro à venda, sem pets do passe, com preço positivo
    const kinds = store.STORE_KINDS;
    assert.deepEqual([...kinds].sort(), ['floor', 'flooring', 'pet', 'rug', 'wall', 'wallpaper']);
    const sellable = ITEMS.filter((e) => !String(e.id).startsWith('pass_pet_'));
    const listed = kinds.flatMap((k) => store.storeItems(k, 'pt'));
    assert.equal(listed.length, sellable.length, 'Todo item do catálogo aparece na loja');
    for (const { entry, price } of listed) {
      assert.ok(Number.isInteger(price) && price > 0, `${entry.id}: preço válido`);
      if (entry.price?.coins) assert.equal(price, entry.price.coins, `${entry.id}: preço do catálogo vence a tabela`);
      else assert.equal(price, store.STORE_PRICE_BY_KIND[entry.kind], `${entry.id}: tabela por tipo`);
    }
    console.log(`  ✅ 1. ${listed.length} itens à venda, cada um com preço.`);

    // 2. Compra: sem moedinhas não cobra; com moedinhas entrega no cofre
    const { entry, price } = store.storeItems('rug', 'pt')[0];
    economy.setUserBalance(U, price - 1);
    const poor = store.buyFromStore(U, entry.id);
    assert.equal(poor.reason, 'coins');
    assert.equal(economy.getBalance(U), price - 1, 'Nada é cobrado');
    assert.ok(!vault.ownsItem(U, entry.id));
    economy.setUserBalance(U, price + 10);
    const ok = store.buyFromStore(U, entry.id);
    assert.equal(ok.ok, true);
    assert.equal(ok.balance, 10);
    assert.ok(vault.ownsItem(U, entry.id));
    assert.equal(store.buyFromStore(U, 'nao_existe').reason, 'not_in_shop');
    console.log('  ✅ 2. Débito antes da entrega, sem cobrar sem saldo.');

    // 3. Telas em PT e EN, sem chave faltando e dentro dos limites do Discord
    for (const k of walk(require('../src/utils/i18n').TRANSLATIONS?.pt?.loja || {}, 'loja', [])) {
      for (const lang of ['pt', 'en']) assert.ok(!t(k, lang).startsWith('loja.'), `${k} em ${lang}`);
    }
    for (const lang of ['pt', 'en']) {
      for (const kind of kinds) {
        const view = pyLoja.buildStoreView({ userId: U, source: { lang }, kind });
        const embed = view.embeds[0].toJSON();
        assert.ok(embed.title.length <= 40 && !embed.title.startsWith('loja.'));
        assert.ok(embed.description.length <= 4096, `${kind}/${lang}: descrição cabe`);
        assert.ok(embed.footer.text.length > 0);
        assert.ok(!/[─═]{3,}/.test(embed.description), 'Sem divisores ASCII');
        const rows = view.components.map((r) => r.toJSON());
        assert.equal(rows.length, 3);
        assert.ok(rows[1].components[0].options.length <= pyLoja.PAGE_SIZE);
        assert.deepEqual(view.allowedMentions, { parse: [] });
      }
    }
    console.log('  ✅ 3. Vitrine PT/EN com menus e paginação.');

    // 4. Interações: dona da vitrine troca tipo, pagina e compra; outra pessoa é barrada
    const calls = [];
    const make = (customId, userId, values) => ({
      customId,
      values,
      user: { id: userId },
      lang: 'pt',
      isButton: () => !values,
      isStringSelectMenu: () => Boolean(values),
      reply: async (p) => calls.push(['reply', p]),
      update: async (p) => calls.push(['update', p]),
    });
    assert.equal(pyLoja.isLojaInteraction(make(`loja:k:${U}`, U, ['pet'])), true);
    await pyLoja.handleLojaInteraction(make(`loja:k:${OTHER}`, U, ['pet']));
    assert.equal(calls.at(-1)[0], 'reply', 'Vitrine de outra pessoa');
    await pyLoja.handleLojaInteraction(make(`loja:p:${U}:floor:1`, U));
    assert.equal(calls.at(-1)[0], 'update');
    const pet = store.storeItems('pet', 'pt')[0];
    economy.setUserBalance(U, pet.price);
    await pyLoja.handleLojaInteraction(make(`loja:b:${U}:pet:0`, U, [pet.entry.id]));
    assert.ok(vault.ownsItem(U, pet.entry.id), 'Compra pelo menu');
    assert.equal(economy.getBalance(U), 0);
    console.log('  ✅ 4. Só a dona mexe; compra pelo menu.');

    // 5. Catálogo e módulo: py!loja no lugar da oficina, categoria economia (pausada no modo restrito)
    const { COMMAND_CATEGORY_MAP } = require('../src/commands/commandHelpers');
    for (const alias of ['py-loja', ...pyLoja.aliases]) assert.equal(COMMAND_CATEGORY_MAP[alias], 'economia', alias);
    const json = pyLoja.data.toJSON();
    assert.ok(json.description.length <= 100 && json.description_localizations['pt-BR'].length <= 100);
    assert.ok(pyLoja.aliases.includes('loja') && pyLoja.aliases.includes('shop'), 'Apelidos PT e EN');
    console.log('  ✅ 5. Catálogo, apelidos e slash localizado.');

    console.log('✨ py!loja validada.');
  } catch (err) {
    console.error('❌ Falha nos testes da py!loja:', err);
    process.exitCode = 1;
  } finally {
    economy.purgeTestAccounts();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})();
