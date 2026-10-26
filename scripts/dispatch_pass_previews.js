#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) do Passe da Pyxie (/py-pass) no canal 1461937203214024891.
 * Usa contas de teste e dados temporários. Uso: node scripts/dispatch_pass_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-pass-preview-'));
process.env.DUNGEON_DATA_PATH = path.join(process.env.PYXIE_DATA_DIR, 'dungeon.json');

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const economy = require('../src/services/economy');
const battlePass = require('../src/services/battlePass');
const views = require('../src/modules/battlePass/passViews');

const viewer = `user_test_pass_preview_${Date.now()}`;
const source = { lang };

async function send(context, payload) {
  const result = await dispatchHomologationPreview({ commandName: '/py-pass', context, embeds: payload.embeds, components: payload.components, files: payload.files });
  console.log(`[PassPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  battlePass.addXp(viewer, 'preview', { amount: 12 * battlePass.XP_PER_LEVEL + 150 });
  await send(`Passe grátis (${lang})`, await views.buildPassView({ viewerId: viewer, source }));
  await send(`Níveis 1 a 10 (${lang})`, views.buildLevelsView({ viewerId: viewer, source, page: 0 }));
  battlePass.activatePremium(viewer, battlePass.monthKey(), { paymentId: `preview:${viewer}`, provider: 'manual' });
  const claim = battlePass.claimAll(viewer);
  await send(`Premium com resgate (${lang})`, await views.buildPassView({ viewerId: viewer, source, notice: views.claimNotice(claim, lang) }));
}

main()
  .catch((err) => {
    console.error('[PassPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    economy.purgeTestAccounts();
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  });
