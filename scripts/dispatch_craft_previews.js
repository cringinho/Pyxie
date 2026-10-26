#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) da Oficina (/py-craft) no canal 1461937203214024891.
 * Usa conta de teste e dados temporários. Uso: node scripts/dispatch_craft_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-craft-preview-'));

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const economy = require('../src/services/economy');
const crafting = require('../src/services/crafting');
const pyCraft = require('../src/modules/home/commands/pyCraft');

const owner = { id: `user_test_craft_preview_${Date.now()}` };

async function send(context, payload) {
  const result = await dispatchHomologationPreview({ commandName: '/py-craft', context, embeds: payload.embeds, components: payload.components, files: payload.files });
  console.log(`[CraftPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  crafting.addMaterials(owner.id, { wood: 4, shell: 3, fabric: 2, crystal: 1 });
  await send(`Oficina (${lang})`, await pyCraft.buildWorkshopView({ owner, source: { lang } }));
  await send(`Receita (${lang})`, await pyCraft.buildRecipeView({ owner, source: { lang }, itemId: 'craft_lantern' }));
}

main()
  .catch((err) => {
    console.error('[CraftPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    economy.purgeTestAccounts();
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  });
