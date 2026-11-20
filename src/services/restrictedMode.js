// Modo restrito: liga com PYXIE_RESTRICTED_MODE=1 quando a Pyxie roda com banco e data/ provisórios
// (migração de servidor, resgate de dados). Tudo que grava progresso de pessoas (economia, tarot,
// casamento, diário, quiz, MMO, passe, museu, blog...) responde com um aviso de instabilidade, para que
// nada seja escrito num lugar que depois será substituído pelos dados reais. Moderação, boas-vindas,
// registros, cores, site e painel continuam.
const { t } = require('../utils/i18n');

// Categorias de COMMAND_CATEGORY_MAP / MODULE_METADATA (src/commands/commandHelpers.js) que gravam
// dados de usuário.
const RESTRICTED_CATEGORIES = new Set(['economia', 'tarot', 'social', 'community']);

// Comandos "social" que são só brincadeira na hora, sem gravar nada de ninguém.
const ALLOWED_SOCIAL = new Set([
  'ship', 'jokenpo', 'likely', 'dice', 'dado', 'dados',
  'tictactoe', 'velha', 'minesweeper', 'campominado',
]);

// Comandos de outras categorias que também gravam dados de pessoas.
const EXTRA_RESTRICTED = new Set(['sorteio', 'giveaway', 'birthday', 'aniversario']);

// Comandos dos módulos pausados (registrados pelo moduleManager ao pular o módulo), para que também
// respondam com o aviso em vez de "comando indisponível".
const skippedModuleCommands = new Set();

function registerSkippedModule(mod) {
  for (const cmd of mod?.commands || []) {
    const name = cmd?.name || cmd?.data?.name;
    if (name) skippedModuleCommands.add(String(name).toLowerCase().replace(/^py-/, ''));
    for (const alias of cmd?.aliases || []) skippedModuleCommands.add(String(alias).toLowerCase().replace(/^py-/, ''));
  }
}

// Módulos (src/modules/<id>) que não sobem no modo restrito: escutam botões, agendam crons e gravam
// progresso. Os demais (moderação, boas-vindas, logs, cores, ferramentas...) sobem normalmente.
const RESTRICTED_MODULE_CATEGORIES = new Set(['economia', 'tarot', 'social', 'community']);
const RESTRICTED_MODULE_IDS = new Set(['giveaways']);

function isActive(env = process.env) {
  return /^(1|true|on|sim|yes)$/i.test(String(env.PYXIE_RESTRICTED_MODE || '').trim());
}

function baseName(name) {
  return String(name || '').toLowerCase().trim().replace(/^py-/, '');
}

/** O comando grava dados de usuário? (vale com ou sem o prefixo py-) */
function isCommandRestricted(name, category) {
  const base = baseName(name);
  if (!base) return false;
  if (EXTRA_RESTRICTED.has(base) || skippedModuleCommands.has(base)) return true;
  let cat = category;
  if (!cat) {
    const { COMMAND_CATEGORY_MAP } = require('../commands/commandHelpers');
    cat = COMMAND_CATEGORY_MAP[name] || COMMAND_CATEGORY_MAP[base] || COMMAND_CATEGORY_MAP[`py-${base}`];
  }
  if (!cat || !RESTRICTED_CATEGORIES.has(cat)) return false;
  if (cat === 'social' && ALLOWED_SOCIAL.has(base)) return false;
  return true;
}

/** No modo restrito, este comando deve ser bloqueado agora? */
function shouldBlockCommand(name, category, env = process.env) {
  return isActive(env) && isCommandRestricted(name, category);
}

/** No modo restrito, este módulo não deve subir? */
function shouldSkipModule(mod, env = process.env) {
  if (!isActive(env) || !mod) return false;
  return RESTRICTED_MODULE_IDS.has(mod.id) || RESTRICTED_MODULE_CATEGORIES.has(mod.category);
}

/** Aviso bilíngue mostrado a quem tenta um recurso pausado. */
function notice(source) {
  return { content: t('restricted.notice', source), allowedMentions: { parse: [] } };
}

module.exports = {
  isActive,
  isCommandRestricted,
  shouldBlockCommand,
  shouldSkipModule,
  registerSkippedModule,
  notice,
  RESTRICTED_CATEGORIES,
  ALLOWED_SOCIAL,
};
