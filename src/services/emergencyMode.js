// Modo de emergência global (Qualquer servidor) — salva o estado anterior de cada canal
// via scopedConfig (emergency_mode) para destrancar com segurança sem quebrar canais privados.
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { registerNamespace } = require('./scopedConfig');
const safety = require('./guildSafety');

const emergencyStore = registerNamespace('emergency_mode', {
  guild: {
    active: false,
    activatedAt: 0,
    activatedBy: '',
    reason: '',
    channelSnapshots: {}, // channelId -> 'allow' | 'deny' | 'neutral'
  },
});

function getEmergencyStatus(guildId) {
  const sec = safety.getConfig(guildId);
  const scoped = emergencyStore.get('guild', guildId);
  const snapshots = scoped.channelSnapshots && typeof scoped.channelSnapshots === 'object' ? scoped.channelSnapshots : {};
  const active = Boolean(sec.emergency?.active || scoped.active);
  return {
    active,
    activatedAt: sec.emergency?.activatedAt || scoped.activatedAt || 0,
    activatedBy: sec.emergency?.activatedBy || scoped.activatedBy || '',
    reason: sec.emergency?.reason || scoped.reason || '',
    lockedCount: Object.keys(snapshots).length,
    channelSnapshots: snapshots,
  };
}

/**
 * Ativa o modo de emergência:
 * 1. Salva o estado anterior de SendMessages de @everyone em cada canal de texto gerenciável.
 * 2. Bloqueia SendMessages para @everyone onde ainda não estava negado.
 * 3. Pausa convites nativos do Discord (se disponível).
 */
async function activateEmergency(guild, { actorId = '', reason = '' } = {}) {
  if (!guild?.id) return { ok: false, error: 'invalid_guild' };
  const current = getEmergencyStatus(guild.id);
  const snapshots = { ...(current.channelSnapshots || {}) };
  const everyoneId = guild.roles?.everyone?.id || guild.id;
  const sendBit = PermissionFlagsBits.SendMessages;
  let lockedCount = 0;

  const channels = guild.channels?.cache ? [...guild.channels.cache.values()] : [];
  for (const ch of channels) {
    if (!ch || ch.type === ChannelType.GuildCategory || ch.isThread?.()) continue;
    if (!ch.isTextBased?.() || ch.manageable === false) continue;

    const ow = ch.permissionOverwrites?.cache?.get?.(everyoneId);
    let prior = 'neutral';
    if (ow) {
      if ((BigInt(ow.deny?.bitfield ?? 0n) & sendBit) === sendBit) prior = 'deny';
      else if ((BigInt(ow.allow?.bitfield ?? 0n) & sendBit) === sendBit) prior = 'allow';
    }

    // Se já estava explicitamente negado antes da emergência, não precisamos mexer nem destrancar depois
    if (prior === 'deny' && !snapshots[ch.id]) continue;

    if (!snapshots[ch.id]) {
      snapshots[ch.id] = prior;
    }

    const ok = await ch.permissionOverwrites
      ?.edit?.(everyoneId, { SendMessages: false }, { reason: `Pyxie: Modo de Emergência (${reason || 'ativado'})` })
      .then(() => true)
      .catch(() => false);
    if (ok) lockedCount += 1;
  }

  // Tenta pausar convites por 6 horas se o servidor e permissões permitirem
  const until = new Date(Date.now() + 6 * 60 * 60 * 1000);
  if (typeof guild.setIncidentActions === 'function') {
    await guild.setIncidentActions({ invitesDisabledUntil: until }).catch(() => null);
  } else if (typeof guild.disableInvites === 'function') {
    await guild.disableInvites(true).catch(() => null);
  }

  const now = Date.now();
  const cleanReason = String(reason || '').trim().slice(0, 200);
  emergencyStore.set('guild', guild.id, {
    active: true,
    activatedAt: now,
    activatedBy: String(actorId || ''),
    reason: cleanReason,
    channelSnapshots: snapshots,
  });

  safety.saveConfig(guild.id, {
    emergency: {
      active: true,
      activatedAt: now,
      activatedBy: String(actorId || ''),
      reason: cleanReason,
    },
  });

  safety.recordEvent(guild.id, {
    type: 'emergency',
    action: 'activated',
    executorId: String(actorId || ''),
    lockedCount: Object.keys(snapshots).length || lockedCount,
    reason: cleanReason,
  });

  return {
    ok: true,
    active: true,
    activatedAt: now,
    activatedBy: String(actorId || ''),
    reason: cleanReason,
    lockedCount: Object.keys(snapshots).length || lockedCount,
  };
}

/**
 * Desativa o modo de emergência e restaura exatamente o estado anterior de cada canal.
 */
async function deactivateEmergency(guild, { actorId = '' } = {}) {
  if (!guild?.id) return { ok: false, error: 'invalid_guild' };
  const current = getEmergencyStatus(guild.id);
  const snapshots = current.channelSnapshots || {};
  const everyoneId = guild.roles?.everyone?.id || guild.id;
  let restoredCount = 0;

  for (const [channelId, prior] of Object.entries(snapshots)) {
    const ch = guild.channels?.cache?.get?.(channelId);
    if (!ch || ch.manageable === false) continue;
    const targetState = prior === 'allow' ? true : prior === 'deny' ? false : null;
    const ok = await ch.permissionOverwrites
      ?.edit?.(everyoneId, { SendMessages: targetState }, { reason: 'Pyxie: Fim do Modo de Emergência' })
      .then(() => true)
      .catch(() => false);
    if (ok) restoredCount += 1;
  }

  if (typeof guild.setIncidentActions === 'function') {
    await guild.setIncidentActions({ invitesDisabledUntil: null }).catch(() => null);
  } else if (typeof guild.disableInvites === 'function') {
    await guild.disableInvites(false).catch(() => null);
  }

  emergencyStore.set('guild', guild.id, {
    active: false,
    activatedAt: 0,
    activatedBy: '',
    reason: '',
    channelSnapshots: {},
  });

  safety.saveConfig(guild.id, {
    emergency: {
      active: false,
      activatedAt: 0,
      activatedBy: '',
      reason: '',
    },
  });

  safety.recordEvent(guild.id, {
    type: 'emergency',
    action: 'deactivated',
    executorId: String(actorId || ''),
    restoredCount,
  });

  return {
    ok: true,
    active: false,
    restoredCount,
  };
}

module.exports = {
  emergencyStore,
  getEmergencyStatus,
  activateEmergency,
  deactivateEmergency,
};

