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
// 5. Auditoria de Paridade Dinâmica: Comandos do Bot vs Catálogo de Ajuda (COMMAND_CATEGORY_MAP)
const { COMMAND_CATEGORY_MAP, getHelpModules } = require('../src/commands/commandHelpers');
const allBotCommands = require('../src/commands/index').commands;

const unmappedCommands = [];
for (const cmd of allBotCommands) {
  const name = cmd.name || cmd.data?.name;
  if (!name) continue;
  const bareName = name.startsWith('py-') ? name.slice(3) : name;
  const prefixedName = name.startsWith('py-') ? name : `py-${name}`;

  if (!COMMAND_CATEGORY_MAP[name] && !COMMAND_CATEGORY_MAP[bareName] && !COMMAND_CATEGORY_MAP[prefixedName]) {
    unmappedCommands.push(name);
  }
}

if (unmappedCommands.length > 0) {
  console.error('❌ Comandos registrados no bot que não possuem categoria em COMMAND_CATEGORY_MAP:\n', unmappedCommands);
}
assert.equal(
  unmappedCommands.length,
  0,
  `Existem ${unmappedCommands.length} comandos não mapeados na central de ajuda e catálogo web!`
);
console.log(`✅ Catálogo do Help & Web validado: 100% dos ${allBotCommands.length} comandos estão categorizados.`);

// 6. Verificação do Endpoint Dinâmico de Comandos (/api/commands)
const ptModules = getHelpModules(null, 'pt');
const enModules = getHelpModules(null, 'en');
assert(Array.isArray(ptModules) && ptModules.length > 0, 'Módulos em PT devem ser gerados');
assert(Array.isArray(enModules) && enModules.length > 0, 'Módulos em EN devem ser gerados');
const ptCmdCount = ptModules.reduce((acc, m) => acc + (m.commands?.length || 0), 0);
const enCmdCount = enModules.reduce((acc, m) => acc + (m.commands?.length || 0), 0);
assert.equal(ptCmdCount, enCmdCount, 'Quantidade de comandos nos módulos do Help/Web deve ser idêntica em PT e EN');
assert(ptCmdCount > 0, 'Deve haver comandos catalogados');
console.log(`✅ Sincronização Dinâmica Web/Help validada: ${ptCmdCount} comandos ativos em ${ptModules.length} módulos.`);

// 6.1 Verificação de Ocultação de Comandos do Criador para Não-Donos
const publicCmdNames = ptModules.flatMap((m) => m.commands || []).map((c) => c.name);
const ownerRestrictedNames = ['/py-seteco', '/py-reseteco', '/py-ecoconfig', '/py-admin'];
for (const restricted of ownerRestrictedNames) {
  assert(
    !publicCmdNames.includes(restricted),
    `Comando exclusivo do dono (${restricted}) NÃO deve ser exibido para o público ou não-donos!`
  );
}

// 6.2 Verificação de Exibição de Comandos do Criador para o Dono
const { OWNER_SNOWFLAKE, createOwnerMagicToken, verifyMagicToken, isIpAllowed } = require('../src/services/adminAuth');
const ownerModules = getHelpModules(null, { lang: 'pt', userId: OWNER_SNOWFLAKE });
const ownerCmdNames = ownerModules.flatMap((m) => m.commands || []).map((c) => c.name);
for (const restricted of ownerRestrictedNames) {
  assert(
    ownerCmdNames.includes(restricted),
    `Comando exclusivo do dono (${restricted}) DEVE ser exibido na central quando o dono solicitar!`
  );
}
assert.equal(ownerCmdNames.length, 37, 'Dono deve ver todos os 37 comandos na central');
console.log(`✅ Sincronização Dinâmica Web/Help validada: ${ptCmdCount} comandos públicos e ${ownerCmdNames.length} comandos de dono em ${ptModules.length} módulos.`);

// 7. Validação de Segurança do Dono (Snowflake 214153735281180673 & HMAC)
assert.equal(OWNER_SNOWFLAKE, '214153735281180673', 'Snowflake do dono deve ser estritamente 214153735281180673');

const forbiddenRes = createOwnerMagicToken('999999999999999999');
assert.equal(forbiddenRes.success, false, 'Usuário aleatório não pode gerar token de admin');

const ownerRes = createOwnerMagicToken(OWNER_SNOWFLAKE);
assert.equal(ownerRes.success, true, 'Proprietário deve conseguir gerar token mágico HMAC');
assert(ownerRes.token && ownerRes.token.length > 20, 'Token HMAC deve ser gerado');

const verifyRes = verifyMagicToken(ownerRes.token);
assert.equal(verifyRes.valid, true, 'Token HMAC recém-gerado deve ser válido');
assert.equal(verifyRes.userId, OWNER_SNOWFLAKE);

const replayRes = verifyMagicToken(ownerRes.token);
assert.equal(replayRes.valid, false, 'Anti-replay: token consumido não pode ser reutilizado');

assert.equal(isIpAllowed({ ip: '127.0.0.1', headers: {} }), true, 'Localhost deve ser autorizado');
assert.equal(isIpAllowed({ ip: '179.153.90.39', headers: {} }), true, 'IP do criador deve ser autorizado');
assert.equal(isIpAllowed({ ip: '198.51.100.23', headers: {} }), false, 'IP desconhecido deve ser bloqueado');
console.log('✅ Segurança do Dono validada: Snowflake, HMAC Magic Tokens e IP Allowlist operando perfeitamente.');

// 7.1 Validação de Bloqueio em Comandos de Economia por Não-Donos
const setecoCmd = require('../src/commands/setareconomia');
const resetecoCmd = require('../src/commands/resetareconomia');
const ecoconfigCmd = require('../src/commands/economyconfig');

let repliedMsg = '';
const fakeAdminMessage = {
  author: { id: '999999999999999999' },
  member: { permissions: { has: () => true } }, // Admin normal de servidor
  reply: (msg) => { repliedMsg = typeof msg === 'string' ? msg : msg.content; },
};

setecoCmd.executePrefix({ message: fakeAdminMessage, args: [] });
assert(repliedMsg.includes('Acesso Restrito') || repliedMsg.includes('Restricted Access'), 'seteco deve bloquear administrador que não seja o dono');

repliedMsg = '';
resetecoCmd.executePrefix({ message: fakeAdminMessage, args: [] });
assert(repliedMsg.includes('Acesso Restrito') || repliedMsg.includes('Restricted Access'), 'reseteco deve bloquear administrador que não seja o dono');

repliedMsg = '';
ecoconfigCmd.executePrefix({ message: fakeAdminMessage, args: [] });
assert(repliedMsg.includes('Acesso Restrito') || repliedMsg.includes('Restricted Access'), 'ecoconfig deve bloquear administrador que não seja o dono');

console.log('✅ Segurança do Dono validada: Snowflake, HMAC Magic Tokens, IP Allowlist e Comandos de Economia operando perfeitamente.');

console.log('Auditoria de Paridade i18n e Catálogo concluída com 100% de sucesso!');

