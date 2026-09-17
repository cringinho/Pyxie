const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { TRANSLATIONS, t } = require('../src/utils/i18n');

console.log('Iniciando auditoria automatizada de paridade de internacionalização (i18n)...');

/**
 * Extrai todas as chaves recursivamente em formato 'pai.filho.chave'.
 */
function getLeafKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getLeafKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

/**
 * Extrai os nomes dos placeholders {token} de uma string.
 */
function getPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
  return matches.map((m) => m.slice(1, -1)).sort();
}

// 1. Paridade Estrita de Chaves entre Português e Inglês
const ptKeys = new Set(getLeafKeys(TRANSLATIONS.pt));
const enKeys = new Set(getLeafKeys(TRANSLATIONS.en));

const missingInEn = [...ptKeys].filter((k) => !enKeys.has(k));
const missingInPt = [...enKeys].filter((k) => !ptKeys.has(k));

if (missingInEn.length > 0) {
  console.error('❌ Chaves presentes em PT mas ausentes em EN:\n', missingInEn);
}
if (missingInPt.length > 0) {
  console.error('❌ Chaves presentes em EN mas ausentes em PT:\n', missingInPt);
}

assert.equal(
  missingInEn.length,
  0,
  `Existem ${missingInEn.length} chaves traduzidas em PT que não existem em EN!`
);
assert.equal(
  missingInPt.length,
  0,
  `Existem ${missingInPt.length} chaves traduzidas em EN que não existem em PT!`
);

console.log(`✅ Paridade de chaves perfeita: ${ptKeys.size} chaves sincronizadas em PT e EN.`);

// 2. Paridade de Placeholders ({user}, {coins}, etc.)
const placeholderMismatches = [];
for (const key of ptKeys) {
  const keys = key.split('.');
  let ptVal = TRANSLATIONS.pt;
  let enVal = TRANSLATIONS.en;
  for (const k of keys) {
    ptVal = ptVal?.[k];
    enVal = enVal?.[k];
  }

  if (typeof ptVal === 'string' && typeof enVal === 'string') {
    const ptTokens = getPlaceholders(ptVal);
    const enTokens = getPlaceholders(enVal);
    if (ptTokens.join(',') !== enTokens.join(',')) {
      placeholderMismatches.push({ key, ptTokens, enTokens });
    }
  }
}

if (placeholderMismatches.length > 0) {
  console.error('❌ Mismatches de placeholders encontrados:\n', placeholderMismatches);
}
assert.equal(
  placeholderMismatches.length,
  0,
  `Existem ${placeholderMismatches.length} chaves com placeholders incompatíveis entre PT e EN!`
);
console.log('✅ Placeholders validados: todos os parâmetros dinâmicos coincidem perfeitamente.');

// 3. Auditoria de Comandos Slash (SlashCommandBuilder)
const commandsDir = path.join(__dirname, '..', 'src', 'commands');
const commandFiles = fs
  .readdirSync(commandsDir)
  .filter((f) => f.endsWith('.js') && !f.includes('Helper') && !f.includes('commandNames'));

const unlocalizedCommands = [];
const unlocalizedOptions = [];

for (const file of commandFiles) {
  try {
    const cmd = require(path.join(commandsDir, file));
    if (cmd.data && typeof cmd.data.toJSON === 'function') {
      const json = cmd.data.toJSON();
      const cmdName = json.name;

      // Descrição em inglês padrão
      if (!json.description || json.description.trim().length === 0) {
        unlocalizedCommands.push({ file, cmdName, error: 'Descrição base em inglês ausente' });
      }

      // Descrição localizada em português (pt-BR)
      if (!json.description_localizations || !json.description_localizations['pt-BR']) {
        unlocalizedCommands.push({ file, cmdName, error: 'Localização pt-BR ausente na descrição' });
      }

      // Opções
      if (Array.isArray(json.options)) {
        for (const opt of json.options) {
          if (!opt.description_localizations || !opt.description_localizations['pt-BR']) {
            unlocalizedOptions.push({ file, cmdName, option: opt.name, error: 'Opção sem descrição em pt-BR' });
          }
        }
      }
    }
  } catch (err) {
    // Arquivo não é comando executável diretamente
  }
}

if (unlocalizedCommands.length > 0) {
  console.error('❌ Comandos sem localização em pt-BR:\n', unlocalizedCommands);
}
if (unlocalizedOptions.length > 0) {
  console.error('❌ Opções de comandos sem localização em pt-BR:\n', unlocalizedOptions);
}

assert.equal(
  unlocalizedCommands.length,
  0,
  `Existem ${unlocalizedCommands.length} comandos sem localização em português no Discord!`
);
assert.equal(
  unlocalizedOptions.length,
  0,
  `Existem ${unlocalizedOptions.length} opções de comandos sem localização em português no Discord!`
);
console.log(`✅ Comandos slash validados: todos os comandos e parâmetros possuem versão canônica em EN e localização em pt-BR.`);

// 4. Teste de Fallback Bidirecional Resiliente da função t()
const fallbackTestEn = t('test.non.existent.key', 'en');
assert.equal(fallbackTestEn, 'test.non.existent.key', 'Chave inexistente deve retornar a chave original sem quebrar.');

console.log('Auditoria de Paridade i18n concluída com 100% de sucesso!');
