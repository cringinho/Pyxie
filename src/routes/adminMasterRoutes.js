const express = require('express');
const { getRanking, getTimeseries, getSummary, getCategoryBreakdown } = require('../services/commandTelemetry');
const {
  isBlacklisted,
  blacklistTarget,
  unblacklistTarget,
  getBlacklist,
  getActiveRedFlags,
  forceLeaveGuild,
  exportComplianceDossier,
} = require('../services/trustAndSafety');
const {
  getVmOverview,
  getModuleMetrics,
  getSubpanelMetrics,
} = require('../services/resourceTelemetry');
const {
  METADATA_DICTIONARY,
  queryPartition,
  updateRecord,
  registerSseClient,
} = require('../services/visualDbExplorer');
const {
  getEcosystemMap,
  toggleRoute,
} = require('../services/webRoutesManager');
const {
  getAllCommandScopes,
  updateCommandScope,
  simulateVisibility,
} = require('../services/commandScopeManager');
const { getGuildsDirectory } = require('../services/guildDirectory');
const { getEmbedTheme } = require('../utils/embedBuilderHelper');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Cria o Router para as rotas do Master SaaS Dashboard
 * @param {Object} options
 * @param {Function} options.requireAdminAuth
 * @param {Function} options.sendIpcToBot
 * @returns {express.Router}
 */
function createAdminMasterRouter({ requireAdminAuth, sendIpcToBot }) {
  const router = express.Router();

  // 1. Command Telemetry (Task 3)
  router.get('/api/admin/telemetry/summary', requireAdminAuth, (req, res) => {
    res.json(getSummary());
  });

  router.get('/api/admin/telemetry/ranking', requireAdminAuth, (req, res) => {
    const { timeWindow, category, lang, guildId, search } = req.query;
    const ranking = getRanking({ timeWindow, category, lang, guildId, search });
    res.json({ success: true, count: ranking.length, ranking });
  });

  router.get('/api/admin/telemetry/timeseries', requireAdminAuth, (req, res) => {
    const { timeWindow, commandName, category } = req.query;
    const points = getTimeseries({ timeWindow, commandName, category });
    res.json({ success: true, count: points.length, points });
  });

  router.get('/api/admin/telemetry/categories', requireAdminAuth, (req, res) => {
    const categories = getCategoryBreakdown();
    res.json({ success: true, count: categories.length, categories });
  });

  // Verification Waves Engine: Reconciliação com Força Real, Retry e Sem Cache (Seção 2)
  router.post('/api/admin/reconcile', requireAdminAuth, async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const tab = req.query.tab || req.body?.tab || null;
    const force = req.query.force === 'true' || req.body?.force === true;

    try {
      const truthEngine = require('../services/truthReconciliationEngine');
      const waveResult = await truthEngine.runVerificationWave({
        force: true,
        trigger: `reconcile_api:${tab || 'all'}`,
        tab,
      });

      res.json({
        success: true,
        ...waveResult,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Servers Directory (Task 4)
  router.get('/api/admin/guilds', requireAdminAuth, (req, res) => {
    const guilds = getGuildsDirectory();
    res.json({ success: true, count: guilds.length, guilds });
  });

  router.post('/api/admin/guilds/:id/force-leave', requireAdminAuth, async (req, res) => {
    const guildId = req.params.id;
    const sent = sendIpcToBot({ type: 'FORCE_LEAVE_GUILD', guildId });
    res.json({ success: true, message: `Ordem de Force Leave enviada para o servidor ${guildId}.`, ipcSent: sent });
  });

  router.post('/api/admin/guilds/sync', requireAdminAuth, (req, res) => {
    const sent = sendIpcToBot({ type: 'SYNC_GUILDS' });
    res.json({ success: true, message: 'Ordem de sincronização enviada.', ipcSent: sent });
  });

  // 3. Trust & Safety & Legal Compliance (Task 2)
  router.get('/api/admin/trust/red-flags', requireAdminAuth, (req, res) => {
    const flags = getActiveRedFlags();
    res.json({ success: true, count: flags.length, redFlags: flags });
  });

  router.get('/api/admin/trust/blacklist', requireAdminAuth, (req, res) => {
    res.json({ success: true, ...getBlacklist() });
  });

  router.post('/api/admin/trust/blacklist', requireAdminAuth, (req, res) => {
    const { type, id, reason } = req.body;
    try {
      const record = blacklistTarget({ type, id, reason, bannedBy: 'admin_dashboard' });
      // Se baniu servidor, dispara force leave preventivo
      if (type === 'guild') {
        sendIpcToBot({ type: 'FORCE_LEAVE_GUILD', guildId: id });
      }
      res.json({ success: true, record });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/api/admin/trust/unblacklist', requireAdminAuth, (req, res) => {
    const { type, id } = req.body;
    try {
      const removed = unblacklistTarget({ type, id });
      res.json({ success: true, removed });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.get('/api/admin/trust/dossier/:type/:id', requireAdminAuth, (req, res) => {
    const { type, id } = req.params;
    const format = req.query.format || 'json';
    try {
      const dossier = exportComplianceDossier(type, id);
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="compliance-dossier-${type}-${id}.csv"`);
        return res.send(dossier.csv);
      }
      res.json({ success: true, ...dossier.json });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 4. VM Resource Telemetry (Task 5)
  router.get('/api/admin/vm/overview', requireAdminAuth, (req, res) => {
    res.json(getVmOverview());
  });

  router.get('/api/admin/vm/modules', requireAdminAuth, (req, res) => {
    res.json({ success: true, modules: getModuleMetrics() });
  });

  router.get('/api/admin/vm/subpanels', requireAdminAuth, (req, res) => {
    res.json({ success: true, subpanels: getSubpanelMetrics() });
  });

  // 5. Visual Database Explorer (Task 6)
  router.get('/api/admin/db/dictionary', requireAdminAuth, (req, res) => {
    res.json({ success: true, dictionary: METADATA_DICTIONARY });
  });

  router.get('/api/admin/db/explore', requireAdminAuth, (req, res) => {
    const { partition, page, limit, search } = req.query;
    const data = queryPartition({ partition, page, limit, search });
    res.json({ success: true, ...data });
  });

  router.post('/api/admin/db/update', requireAdminAuth, (req, res) => {
    const { partition, recordId, field, value } = req.body;
    try {
      const result = updateRecord({ partition, recordId, field, value });
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.get('/api/admin/db/stream', requireAdminAuth, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'db_stream_connected', time: Date.now() })}\n\n`);
    registerSseClient(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (_) {
        clearInterval(heartbeat);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
    });
  });

  // 6. Interactive Web Ecosystem Map (Task 8)
  router.get('/api/admin/routes/map', requireAdminAuth, (req, res) => {
    res.json({ success: true, ...getEcosystemMap() });
  });

  router.post('/api/admin/routes/:id/toggle', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { enabled } = req.body;
    try {
      const updated = toggleRoute(id, enabled);
      res.json({ success: true, route: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Command Scope & Access Control Matrix (Task 9)
  router.get('/api/admin/scopes', requireAdminAuth, (req, res) => {
    const scopes = getAllCommandScopes();
    res.json({ success: true, count: scopes.length, scopes });
  });

  router.post('/api/admin/scopes/:name', requireAdminAuth, (req, res) => {
    const { name } = req.params;
    try {
      const updated = updateCommandScope(name, req.body);
      res.json({ success: true, command: name, scope: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/api/admin/scopes/simulate', requireAdminAuth, (req, res) => {
    const sim = simulateVisibility(req.body);
    res.json({ success: true, ...sim });
  });

  // 8. Embeds Theme (Task 10)
  router.get('/api/admin/embeds/theme', requireAdminAuth, (req, res) => {
    res.json({ success: true, theme: getEmbedTheme() });
  });

  router.post('/api/admin/embeds/theme', requireAdminAuth, (req, res) => {
    const THEME_PATH = path.join(__dirname, '..', 'data', 'embedTheme.json');
    try {
      const current = getEmbedTheme();
      const updated = {
        ...current,
        colors: { ...current.colors, ...(req.body.colors || {}) },
        footer: { ...current.footer, ...(req.body.footer || {}) },
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(THEME_PATH, JSON.stringify(updated, null, 2), 'utf8');
      res.json({ success: true, theme: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = { createAdminMasterRouter };

