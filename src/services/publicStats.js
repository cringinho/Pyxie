/**
 * Status público do bot (rotas sem login /api/status e /api/stats).
 *
 * Só números agregados. Nunca a lista de IDs de quem falou com a Pyxie (`uniqueUsers`),
 * logs, PID ou canais: numa comunidade de pessoas em sofrimento isso é dado pessoal (LGPD).
 * Auditoria Q020.
 */
function buildPublicStatus({ running = false, startTime = null, stats = {}, now = Date.now() } = {}) {
  const isRunning = Boolean(running);
  const uptime = isRunning && startTime ? Math.max(0, now - startTime) : 0;
  const raw = stats || {};
  const uniqueUsersCount = Array.isArray(raw.uniqueUsers)
    ? raw.uniqueUsers.filter(Boolean).length
    : typeof raw.uniqueUsers === 'string'
      ? raw.uniqueUsers.split(',').filter(Boolean).length
      : 0;
  return {
    running: isRunning,
    online: isRunning,
    uptime,
    stats: {
      commandsExecuted: Number(raw.commandsExecuted || 0),
      messagesProcessed: Number(raw.messagesProcessed || 0),
      usersEngaged: Number(raw.usersEngaged || 0),
      totalMembers: Number(raw.totalMembers || 0),
      uniqueUsersCount,
    },
  };
}

/** Corpo de /api/stats (formato plano que a Home lê). */
function buildPublicStatsBody(input) {
  const pub = buildPublicStatus(input);
  return { success: true, online: pub.online, uptime: pub.uptime, ...pub.stats };
}

module.exports = { buildPublicStatus, buildPublicStatsBody };
