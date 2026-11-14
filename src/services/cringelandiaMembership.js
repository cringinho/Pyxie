// Quem escreve no Hyperfokus precisa ser membro da Cringelândia (o blog é parte da comunidade).
// O site pergunta ao bot pela ponte (MEMBER_ACCESS) e guarda a resposta por pouco tempo.
const { CRINGELANDIA_GUILD_ID } = require('../config/scopes');

const MEMBER_TTL_MS = 5 * 60 * 1000;
const NOT_MEMBER_TTL_MS = 60 * 1000;
const cache = new Map();

/**
 * Resultado: { ok: true } ou { ok: false, reason } com reason em
 * 'discord_not_linked' | 'not_member' | 'membership_unavailable'.
 * Sem resposta do bot, a escrita fica fechada (nada passa sem confirmação).
 */
async function checkWriter(account, bridge, now = Date.now()) {
  const userId = String(account?.discordUserId || '');
  if (!/^\d{17,20}$/.test(userId)) return { ok: false, reason: 'discord_not_linked' };

  const hit = cache.get(userId);
  if (hit && hit.expiresAt > now) return hit.result;

  if (!bridge || typeof bridge.request !== 'function') return { ok: false, reason: 'membership_unavailable' };
  let access;
  try {
    access = await bridge.request('MEMBER_ACCESS', { guildId: CRINGELANDIA_GUILD_ID, userId });
  } catch (_) {
    return { ok: false, reason: 'membership_unavailable' };
  }
  if (!access || access.botInGuild === false) return { ok: false, reason: 'membership_unavailable' };

  const result = access.inGuild ? { ok: true } : { ok: false, reason: 'not_member' };
  cache.set(userId, { result, expiresAt: now + (result.ok ? MEMBER_TTL_MS : NOT_MEMBER_TTL_MS) });
  return result;
}

/** Middleware para as rotas de escrita: responde 403 com o motivo quando a pessoa não pode escrever. */
function requireCringelandiaWriter(bridge) {
  return async (req, res, next) => {
    const result = await checkWriter(req.account, bridge);
    if (result.ok) return next();
    return res.status(403).json({ success: false, error: result.reason });
  };
}

function clearCache() {
  cache.clear();
}

module.exports = { checkWriter, requireCringelandiaWriter, clearCache, CRINGELANDIA_GUILD_ID };
