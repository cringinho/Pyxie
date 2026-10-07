const { REST } = require('discord.js');

/**
 * Cliente REST mínimo do Discord para o processo WEB (supervisor Express),
 * que não possui um Client do discord.js conectado ao Gateway.
 * Usa o DISCORD_TOKEN já presente no ambiente do bot.
 */
let rest = null;

function getRest() {
  if (rest) return rest;
  const token = process.env.DISCORD_TOKEN || require('../config').DISCORD_TOKEN;
  if (!token) return null;
  rest = new REST({ version: '10' }).setToken(token);
  return rest;
}

async function restGet(route) {
  const r = getRest();
  if (!r) return null;
  try {
    return await r.get(route);
  } catch {
    return null;
  }
}

async function restPost(route, body) {
  const r = getRest();
  if (!r) return null;
  try {
    return await r.post(route, { body });
  } catch {
    return null;
  }
}

module.exports = { restGet, restPost };

