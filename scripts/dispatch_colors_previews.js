#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) do painel de cores (plano 5.13) no canal 1461937203214024891.
 * Usa dados temporários (sem mapa de cargos, os nomes aparecem como texto). Uso: node scripts/dispatch_colors_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-colors-preview-'));

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const colorRoles = require('../src/services/colorRoles');
const { t } = require('../src/utils/i18n');

async function main() {
  const panel = colorRoles.buildPanel('1453890868980482090', lang);
  for (const [i, msg] of panel.entries()) {
    const r = await dispatchHomologationPreview({ commandName: lang === 'pt' ? 'Canal de cores' : 'Color channel', context: `${i + 1}/${panel.length} (${lang})`, embeds: msg.embeds, components: msg.components, includeHeader: i === 0 });
    console.log('[ColorsPreview]', i + 1, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
  const r = await dispatchHomologationPreview({
    commandName: lang === 'pt' ? 'Canal de cores' : 'Color channel',
    context: lang === 'pt' ? 'Respostas privadas' : 'Private replies',
    embeds: [{ color: 0x8b5cf6, title: '💬 Respostas', description: ['applied', 'cleared', 'error'].map((k) => `• ${t(`colors.${k}`, lang, { color: '**Heliotrope**' })}`).join('\n\n') }],
  });
  console.log('[ColorsPreview] respostas', r.simulated ? 'simulado' : `enviado (${r.messageId})`);
}

main()
  .catch((err) => {
    console.error('[ColorsPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
