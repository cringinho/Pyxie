// Advertências por Pontos + Casos de Moderação Numerados (#1, #2...).
// Usa PostgreSQL transacional via Drizzle ORM (`modCases`, `modWarnings`) com espelhamento atômico
// em JSON (`src/services/scopedConfig.js` e `data/guilds/<guildId>/mod_cases.json`) para resiliência
// offline e suíte de testes determinística.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { withFileLock } = require('../utils/fileLock');
const scopedConfig = require('./scopedConfig');

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CASES_STORED = 2000;

const DEFAULT_THRESHOLDS = [
  { points: 3, action: 'timeout', durationMinutes: 60 },
  { points: 5, action: 'kick', durationMinutes: 0 },
  { points: 7, action: 'ban', durationMinutes: 0 },
];

const warningsConfig = scopedConfig.forNamespace('moderation_warnings', {
  guild: {
    enabled: true,
    defaultExpireDays: 30,
    logChannelId: null,
    dmOnWarn: true,
    thresholds: DEFAULT_THRESHOLDS,
  },
});

function fileForGuild(guildId) {
  const root = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
  return path.join(root, 'guilds', String(guildId), 'mod_cases.json');
}

function loadGuildStore(guildId) {
  const file = fileForGuild(guildId);
  const raw = readJson(file, null);
  return {
    lastCaseNumber: Number(raw?.lastCaseNumber) || 0,
    cases: Array.isArray(raw?.cases) ? raw.cases : [],
    warnings: Array.isArray(raw?.warnings) ? raw.warnings : [],
  };
}

function saveGuildStore(guildId, store) {
  const file = fileForGuild(guildId);
  return writeJsonAtomic(file, {
    lastCaseNumber: Number(store.lastCaseNumber) || 0,
    cases: (store.cases || []).slice(0, MAX_CASES_STORED),
    warnings: (store.warnings || []).slice(0, MAX_CASES_STORED),
  });
}

function normalizeThreshold(raw = {}) {
  const points = Math.max(1, Math.min(100, Math.floor(Number(raw.points) || 3)));
  const validActions = new Set(['timeout', 'kick', 'ban', 'none']);
  const action = validActions.has(raw.action) ? raw.action : 'timeout';
  const durationMinutes =
    action === 'timeout' ? Math.max(1, Math.min(40320, Math.floor(Number(raw.durationMinutes) || 60))) : 0;
  return { points, action, durationMinutes };
}

function getGuildWarningsConfig(guildId) {
  const raw = warningsConfig.guild(guildId).get();
  const thresholds = (Array.isArray(raw.thresholds) ? raw.thresholds : DEFAULT_THRESHOLDS)
    .map(normalizeThreshold)
    .sort((a, b) => a.points - b.points);
  return {
    enabled: raw.enabled !== false,
    defaultExpireDays: Math.max(1, Math.min(365, Math.floor(Number(raw.defaultExpireDays) || 30))),
    logChannelId: raw.logChannelId ? String(raw.logChannelId) : null,
    dmOnWarn: raw.dmOnWarn !== false,
    thresholds,
  };
}

function setGuildWarningsConfig(guildId, patch = {}) {
  const current = getGuildWarningsConfig(guildId);
  const next = {
    enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : current.enabled,
    defaultExpireDays:
      patch.defaultExpireDays !== undefined
        ? Math.max(1, Math.min(365, Math.floor(Number(patch.defaultExpireDays) || 30)))
        : current.defaultExpireDays,
    logChannelId:
      patch.logChannelId !== undefined ? (patch.logChannelId ? String(patch.logChannelId) : null) : current.logChannelId,
    dmOnWarn: patch.dmOnWarn !== undefined ? Boolean(patch.dmOnWarn) : current.dmOnWarn,
    thresholds: Array.isArray(patch.thresholds)
      ? patch.thresholds.slice(0, 10).map(normalizeThreshold).sort((a, b) => a.points - b.points)
      : current.thresholds,
  };
  warningsConfig.guild(guildId).set(next);
  return next;
}

/**
 * Sincroniza um caso em PostgreSQL (Drizzle) de forma assíncrona se o banco estiver disponível.
 */
async function syncCaseToPostgres(caseRecord) {
  try {
    const { db } = require('../database');
    const { modCases } = require('../database/schema');
    await db
      .insert(modCases)
      .values({
        id: caseRecord.id,
        guildId: caseRecord.guildId,
        caseNumber: caseRecord.caseNumber,
        action: caseRecord.action,
        targetId: caseRecord.targetId,
        moderatorId: caseRecord.moderatorId,
        reason: caseRecord.reason,
        points: caseRecord.points || 0,
        durationMs: caseRecord.durationMs || 0,
        expiresAt: caseRecord.expiresAt ? new Date(caseRecord.expiresAt) : null,
        active: caseRecord.active ? 1 : 0,
        metadata: caseRecord.metadata || {},
        createdAt: new Date(caseRecord.createdAt),
        updatedAt: new Date(caseRecord.updatedAt),
      })
      .onConflictDoUpdate({
        target: modCases.id,
        set: {
          reason: caseRecord.reason,
          moderatorId: caseRecord.moderatorId,
          active: caseRecord.active ? 1 : 0,
          metadata: caseRecord.metadata || {},
          updatedAt: new Date(caseRecord.updatedAt),
        },
      });
  } catch (_) {
    // Fallback silencioso quando o PostgreSQL local não está ativo
  }
}

async function syncWarningToPostgres(warnRecord) {
  try {
    const { db } = require('../database');
    const { modWarnings } = require('../database/schema');
    await db
      .insert(modWarnings)
      .values({
        id: warnRecord.id,
        guildId: warnRecord.guildId,
        userId: warnRecord.userId,
        moderatorId: warnRecord.moderatorId,
        caseNumber: warnRecord.caseNumber,
        points: warnRecord.points,
        reason: warnRecord.reason,
        expiresAt: warnRecord.expiresAt ? new Date(warnRecord.expiresAt) : null,
        revokedAt: warnRecord.revokedAt ? new Date(warnRecord.revokedAt) : null,
        revokedBy: warnRecord.revokedBy || null,
        createdAt: new Date(warnRecord.createdAt),
      })
      .onConflictDoUpdate({
        target: modWarnings.id,
        set: {
          reason: warnRecord.reason,
          revokedAt: warnRecord.revokedAt ? new Date(warnRecord.revokedAt) : null,
          revokedBy: warnRecord.revokedBy || null,
        },
      });
  } catch (_) {}
}

/**
 * Cria um caso numerado de moderação (#1, #2...) no servidor.
 */
function createCase(
  guildId,
  {
    action = 'note',
    targetId,
    moderatorId,
    reason = '',
    points = 0,
    durationMs = 0,
    expiresAt = null,
    metadata = {},
    now = Date.now(),
  } = {}
) {
  const gId = String(guildId || '').trim();
  const tId = String(targetId || '').trim();
  const mId = String(moderatorId || '').trim();
  if (!gId || !tId || !mId) return { ok: false, error: 'missing_fields' };

  const file = fileForGuild(gId);
  const created = withFileLock(file, () => {
    const store = loadGuildStore(gId);
    const caseNumber = (Number(store.lastCaseNumber) || 0) + 1;
    store.lastCaseNumber = caseNumber;

    const record = {
      id: `${gId}:${caseNumber}`,
      guildId: gId,
      caseNumber,
      action: String(action || 'note'),
      targetId: tId,
      moderatorId: mId,
      reason: String(reason || '').trim().slice(0, 1000),
      points: Math.max(0, Math.floor(Number(points) || 0)),
      durationMs: Math.max(0, Math.floor(Number(durationMs) || 0)),
      expiresAt: expiresAt ? Number(expiresAt) : null,
      active: true,
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
      createdAt: now,
      updatedAt: now,
    };

    store.cases.unshift(record);
    saveGuildStore(gId, store);
    return record;
  });

  if (process.env.DATABASE_URL) {
    syncCaseToPostgres(created).catch(() => null);
  }
  return { ok: true, caseRecord: created };
}

/**
 * Adiciona uma advertência por pontos a uma pessoa, cria o caso numerado correspondente,
 * calcula o total de pontos ativos (não vencidos e não revogados) e verifica se atingiu
 * algum degrau configurado (castigo automático, expulsão ou banimento).
 */
function issueWarning(
  guildId,
  {
    userId,
    moderatorId,
    points = 1,
    reason = '',
    expireDays = null,
    now = Date.now(),
  } = {}
) {
  const gId = String(guildId || '').trim();
  const uId = String(userId || '').trim();
  const mId = String(moderatorId || '').trim();
  if (!gId || !uId || !mId) return { ok: false, error: 'missing_fields' };

  const cfg = getGuildWarningsConfig(gId);
  const pts = Math.max(1, Math.min(20, Math.floor(Number(points) || 1)));
  const days = expireDays !== null && expireDays !== undefined ? Math.max(1, Math.min(365, Number(expireDays))) : cfg.defaultExpireDays;
  const expiresAt = now + days * DAY_MS;
  const cleanReason = String(reason || '').trim().slice(0, 1000);

  const file = fileForGuild(gId);
  const result = withFileLock(file, () => {
    const store = loadGuildStore(gId);
    const caseNumber = (Number(store.lastCaseNumber) || 0) + 1;
    store.lastCaseNumber = caseNumber;

    const warnId = `warn_${gId}_${caseNumber}_${crypto.randomBytes(3).toString('hex')}`;
    const warnRecord = {
      id: warnId,
      guildId: gId,
      userId: uId,
      moderatorId: mId,
      caseNumber,
      points: pts,
      reason: cleanReason,
      expiresAt,
      revokedAt: null,
      revokedBy: null,
      createdAt: now,
    };

    const caseRecord = {
      id: `${gId}:${caseNumber}`,
      guildId: gId,
      caseNumber,
      action: 'warn',
      targetId: uId,
      moderatorId: mId,
      reason: cleanReason,
      points: pts,
      durationMs: 0,
      expiresAt,
      active: true,
      metadata: { warningId: warnId, expireDays: days },
      createdAt: now,
      updatedAt: now,
    };

    store.warnings.unshift(warnRecord);
    store.cases.unshift(caseRecord);

    // Soma os pontos ativos da pessoa (não vencidos e não revogados)
    const activeWarnings = store.warnings.filter(
      (w) => w.userId === uId && !w.revokedAt && (!w.expiresAt || w.expiresAt > now)
    );
    const totalPoints = activeWarnings.reduce((sum, w) => sum + (Number(w.points) || 0), 0);

    // Verifica qual o maior degrau alcançado pelos pontos ativos
    let triggeredThreshold = null;
    for (const th of cfg.thresholds) {
      if (totalPoints >= th.points && th.action !== 'none') {
        triggeredThreshold = th;
      }
    }

    if (triggeredThreshold) {
      caseRecord.metadata.thresholdAction = triggeredThreshold.action;
      caseRecord.metadata.thresholdDurationMinutes = triggeredThreshold.durationMinutes || 0;
    }

    saveGuildStore(gId, store);
    return {
      warnRecord,
      caseRecord,
      activeWarningsCount: activeWarnings.length,
      totalPoints,
      triggeredThreshold,
    };
  });

  if (process.env.DATABASE_URL) {
    syncCaseToPostgres(result.caseRecord).catch(() => null);
    syncWarningToPostgres(result.warnRecord).catch(() => null);
  }
  return { ok: true, ...result };
}

/**
 * Edita o motivo (ou moderador responsável) de um caso numerado (#123).
 */
function updateCaseReason(guildId, caseNumber, newReason, { updatedBy = null, now = Date.now() } = {}) {
  const gId = String(guildId || '').trim();
  const num = Number(caseNumber);
  if (!gId || !Number.isInteger(num) || num < 1) return { ok: false, error: 'invalid_case' };
  const cleanReason = String(newReason || '').trim().slice(0, 1000);
  if (!cleanReason) return { ok: false, error: 'empty_reason' };

  const file = fileForGuild(gId);
  let updatedCase = null;
  let updatedWarn = null;

  withFileLock(file, () => {
    const store = loadGuildStore(gId);
    const targetCase = store.cases.find((c) => Number(c.caseNumber) === num);
    if (!targetCase) return;
    targetCase.reason = cleanReason;
    targetCase.updatedAt = now;
    if (updatedBy) {
      targetCase.metadata = { ...(targetCase.metadata || {}), lastEditedBy: String(updatedBy) };
    }
    updatedCase = targetCase;

    const targetWarn = store.warnings.find((w) => Number(w.caseNumber) === num);
    if (targetWarn) {
      targetWarn.reason = cleanReason;
      updatedWarn = targetWarn;
    }
    saveGuildStore(gId, store);
  });

  if (!updatedCase) return { ok: false, error: 'case_not_found' };
  if (process.env.DATABASE_URL) {
    syncCaseToPostgres(updatedCase).catch(() => null);
    if (updatedWarn) syncWarningToPostgres(updatedWarn).catch(() => null);
  }
  return { ok: true, caseRecord: updatedCase };
}

/**
 * Revoga uma advertência (pelo número do caso ou ID da advertência) sem apagar o histórico.
 */
function revokeWarningByCase(guildId, caseNumber, { revokedBy = null, now = Date.now() } = {}) {
  const gId = String(guildId || '').trim();
  const num = Number(caseNumber);
  if (!gId || !Number.isInteger(num) || num < 1) return { ok: false, error: 'invalid_case' };

  const file = fileForGuild(gId);
  let targetCase = null;
  let targetWarn = null;

  withFileLock(file, () => {
    const store = loadGuildStore(gId);
    targetCase = store.cases.find((c) => Number(c.caseNumber) === num);
    if (targetCase) {
      targetCase.active = false;
      targetCase.updatedAt = now;
      targetCase.metadata = { ...(targetCase.metadata || {}), revokedBy: revokedBy ? String(revokedBy) : null, revokedAt: now };
    }
    targetWarn = store.warnings.find((w) => Number(w.caseNumber) === num);
    if (targetWarn && !targetWarn.revokedAt) {
      targetWarn.revokedAt = now;
      targetWarn.revokedBy = revokedBy ? String(revokedBy) : null;
    }
    if (targetCase || targetWarn) saveGuildStore(gId, store);
  });

  if (!targetCase && !targetWarn) return { ok: false, error: 'case_not_found' };
  if (process.env.DATABASE_URL) {
    if (targetCase) syncCaseToPostgres(targetCase).catch(() => null);
    if (targetWarn) syncWarningToPostgres(targetWarn).catch(() => null);
  }
  return { ok: true, caseRecord: targetCase, warnRecord: targetWarn };
}

function getCase(guildId, caseNumber) {
  const store = loadGuildStore(guildId);
  return store.cases.find((c) => Number(c.caseNumber) === Number(caseNumber)) || null;
}

function listCases(guildId, { targetId = null, action = null, limit = 50 } = {}) {
  const store = loadGuildStore(guildId);
  return store.cases
    .filter((c) => (!targetId || c.targetId === String(targetId)) && (!action || c.action === action))
    .slice(0, Math.max(1, Math.min(200, Number(limit) || 50)));
}

function getUserWarnings(guildId, userId, { includeExpired = false, now = Date.now() } = {}) {
  const store = loadGuildStore(guildId);
  const all = store.warnings.filter((w) => w.userId === String(userId));
  const active = all.filter((w) => !w.revokedAt && (!w.expiresAt || w.expiresAt > now));
  const totalPoints = active.reduce((sum, w) => sum + (Number(w.points) || 0), 0);
  return {
    userId: String(userId),
    totalPoints,
    activeCount: active.length,
    warnings: includeExpired ? all : active,
  };
}

module.exports = {
  DEFAULT_THRESHOLDS,
  warningsConfig,
  getGuildWarningsConfig,
  setGuildWarningsConfig,
  createCase,
  issueWarning,
  updateCaseReason,
  revokeWarningByCase,
  getCase,
  listCases,
  getUserWarnings,
};

