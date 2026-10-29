const express = require('express');
const { getRanking, getTimeseries, getSummary, getCategoryBreakdown } = require('../services/commandTelemetry');
const {
  blacklistTarget,
  unblacklistTarget,
  getBlacklist,
  getActiveRedFlags,
  exportComplianceDossier,
} = require('../services/trustAndSafety');
const {
  getVmOverview,
  getModuleMetrics,
  getSubpanelMetrics,
} = require('../services/resourceTelemetry');
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

  // 2.1 Funil de crescimento: convites por origem, entradas/saídas, ativação, retenção e listas de bots
  router.get('/api/admin/growth', requireAdminAuth, (req, res) => {
    const { getFunnelSummary } = require('../services/growthFunnel');
    const { getBotListStatus } = require('../services/botListStats');
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
    res.json({ success: true, funnel: getFunnelSummary({ days }), botLists: getBotListStatus() });
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

  // 8. Embeds Theme (Task 10)
  router.get('/api/admin/embeds/theme', requireAdminAuth, (req, res) => {
    res.json({ success: true, theme: getEmbedTheme() });
  });

  router.post('/api/admin/embeds/theme', requireAdminAuth, (req, res) => {
    const RUNTIME_DATA_DIR = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
    const THEME_PATH = path.join(RUNTIME_DATA_DIR, 'embedTheme.json');
    try {
      const current = getEmbedTheme();
      const updated = {
        ...current,
        colors: { ...current.colors, ...(req.body.colors || {}) },
        footer: { ...current.footer, ...(req.body.footer || {}) },
        updatedAt: new Date().toISOString(),
      };
      fs.mkdirSync(RUNTIME_DATA_DIR, { recursive: true });
      const tmp = `${THEME_PATH}.${Date.now()}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(updated, null, 2), 'utf8');
      fs.renameSync(tmp, THEME_PATH);
      res.json({ success: true, theme: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = { createAdminMasterRouter };

