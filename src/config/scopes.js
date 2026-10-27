// Fonte única dos IDs de escopo (zonas Global, Cringelândia e Mary).
// Os valores do .env têm prioridade; os padrões são os IDs oficiais.
require('dotenv').config();

const OWNER_SNOWFLAKE = '214153735281180673';
const CRINGELANDIA_GUILD_ID = process.env.CRINGELANDIA_GUILD_ID || '1453890868980482090';
const MARY_GUILD_ID = process.env.MARY_GUILD_ID || '1557399041443111025';
const MARY_USER_ID = process.env.MARY_USER_ID || '1463644930080637140';
const HOMOLOGATION_CHANNEL_ID = process.env.HOMOLOGATION_CHANNEL_ID || '1461937203214024891';

module.exports = {
  OWNER_SNOWFLAKE,
  CRINGELANDIA_GUILD_ID,
  MARY_GUILD_ID,
  MARY_USER_ID,
  HOMOLOGATION_CHANNEL_ID,
};
