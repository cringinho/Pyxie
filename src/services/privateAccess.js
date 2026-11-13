// Pyxie privada: só fica em servidor que o dono autorizou (acesso vitalício por migração, chave ou
// concessão manual). Sem autorização — nem "free" — ela sai sozinha. Cringelândia e Mary são sempre da casa.
const plans = require('./guildPlans');
const legacy = require('./legacyLifetime');
const { CRINGELANDIA_GUILD_ID, MARY_GUILD_ID } = require('../config/scopes');

const HOME_GUILDS = () => new Set([String(CRINGELANDIA_GUILD_ID), String(MARY_GUILD_ID)]);

/** O servidor tem permissão do dono para ter a Pyxie? */
function isAuthorized(guildId, now = Date.now()) {
  const id = String(guildId || '');
  if (HOME_GUILDS().has(id)) return true;
  return plans.getPlan(id, now).active === true;
}

/** Servidores do cliente sem autorização. Só avalia depois da migração dos servidores existentes. */
function unauthorizedGuilds(client, now = Date.now()) {
  if (!legacy.isDone() || !client?.guilds?.cache) return [];
  return [...client.guilds.cache.values()].filter((guild) => !isAuthorized(guild.id, now));
}

/** Sai de cada servidor não autorizado. Devolve os IDs de onde saiu. */
async function enforce(client, now = Date.now()) {
  const left = [];
  for (const guild of unauthorizedGuilds(client, now)) {
    const ok = await guild.leave().then(() => true).catch(() => false);
    if (ok) {
      left.push(guild.id);
      console.warn(`[Acesso privado] Saí de ${guild.name} (${guild.id}): sem autorização do dono.`);
    }
  }
  return left;
}

module.exports = { isAuthorized, unauthorizedGuilds, enforce };
