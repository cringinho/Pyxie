/**
 * Quem pode usar o Estúdio de Loja num servidor.
 *
 * Vale de duas formas:
 *  - zona `mary` (a Mary e o dono), como sempre foi;
 *  - ou qualquer servidor com o extra `lojinha` ativo (`guildAddons`).
 *
 * Fonte única: rotas do painel, handlers do Discord e comandos usam esta mesma função,
 * para não existir um caminho que aceite o que o outro recusa (AGENTS §10).
 */
const { MARY_GUILD_ID } = require('../../config/scopes');
const addons = require('../../services/guildAddons');

function canUseStore(guildId) {
  const id = String(guildId || '');
  if (!id) return false;
  if (id === String(MARY_GUILD_ID)) return true;
  return addons.isActive(id, 'lojinha');
}

module.exports = { canUseStore };
