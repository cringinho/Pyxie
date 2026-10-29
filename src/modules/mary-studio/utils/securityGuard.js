// Quem pode usar as ações da Mary no Discord (atalhos do py!mary, macros dos tickets, mensagens fixas).
// No painel, o acesso é o login com Discord do /dashboard (src/services/panelAccess.js).
const { MARY_USER_ID, OWNER_SNOWFLAKE } = require('../../../config/scopes');

const MARY_DISCORD_ID = MARY_USER_ID;

function isAuthorizedUser(userId) {
  if (!userId || typeof userId !== 'string') return false;
  return userId === MARY_DISCORD_ID || userId === OWNER_SNOWFLAKE;
}

module.exports = {
  MARY_DISCORD_ID,
  OWNER_SNOWFLAKE,
  isAuthorizedUser,
};
