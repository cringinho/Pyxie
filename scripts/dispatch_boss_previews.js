#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) do Chefe da Semana no canal 1461937203214024891.
 * Usa um diretório de dados temporário. Uso: node scripts/dispatch_boss_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-boss-preview-'));

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const store = require('../src/modules/guildBoss/bossStore');
const views = require('../src/modules/guildBoss/bossViews');

const guildId = '100000000000000777';
const fighters = ['100000000000000011', '100000000000000012', '100000000000000013'];

async function main() {
  for (const userId of fighters) for (let i = 0; i < 2; i++) store.attack(guildId, userId, ['strike', 'guard', 'spell'][i % 3]);
  const hit = store.attack(guildId, fighters[0], 'spell');
  const view = views.buildBossView({ guildId, userId: fighters[0], source: { lang }, notice: views.hitNotice(hit, fighters[0], 'spell', lang) });
  const result = await dispatchHomologationPreview({ commandName: '/py-boss', context: `Chefe da semana (${lang})`, embeds: view.embeds, components: view.components });
  console.log('[BossPreview]', result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

main()
  .catch((err) => {
    console.error('[BossPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
