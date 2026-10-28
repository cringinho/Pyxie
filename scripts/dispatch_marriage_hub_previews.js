#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) do painel único do casamento no canal 1461937203214024891.
 * Uso: node scripts/dispatch_marriage_hub_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-marriage-hub-'));
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const hub = require('../src/modules/marriage/hubViews');

async function main() {
  const source = { user: { id: '214153735281180673' }, lang };
  const r = await dispatchHomologationPreview({ commandName: '/py-marriage', context: `Painel (${lang}, sem casamento)`, includeHeader: true, ...hub.buildHub(source) });
  console.log('[MarriageHubPreview]', r.simulated ? 'simulado' : `enviado (${r.messageId})`);
}

main()
  .catch((err) => {
    console.error('[MarriageHubPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
