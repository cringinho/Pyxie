#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) dos painéis das Injeções no canal 1461937203214024891.
 * Uso: node scripts/dispatch_injection_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { PACKS } = require('../src/data/injectionPacks');
const { panelMessage } = require('../src/modules/injections');

async function main() {
  for (const [pack, mode, format] of [['gender', 'multi', 'buttons'], ['sexuality', 'multi', 'select'], ['neuro', 'multi', 'buttons'], ['colors75', 'single', 'select']]) {
    const items = PACKS[pack].items.map((i, n) => ({ id: i.id, label: lang === 'en' ? i.en : i.pt, emoji: i.emoji, roleId: String(1000000000000000000n + BigInt(n)) }));
    const injection = { id: 'preview', pack, lang, items, mode, format, allowedRoleIds: [] };
    const r = await dispatchHomologationPreview({ commandName: 'Injeções', context: `${pack} (${lang})`, includeHeader: pack === 'gender', ...panelMessage(injection) });
    console.log('[InjectionPreview]', pack, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
}

main().catch((err) => {
  console.error('[InjectionPreview] Falha:', err);
  process.exitCode = 1;
});
