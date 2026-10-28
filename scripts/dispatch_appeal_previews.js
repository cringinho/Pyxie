#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) da apelação de banimento no canal 1461937203214024891.
 * Uso: node scripts/dispatch_appeal_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { staffMessage } = require('../src/modules/ban-appeals');
const { t } = require('../src/utils/i18n');

async function main() {
  const guild = { id: '1453890868980482090', name: 'Cringelândia', lang };
  const appeal = { id: 'abc123', userId: '214153735281180673', username: 'Exemplo', text: 'Peço desculpas pelo que escrevi no chat geral.\nEntendi as regras e queria voltar.', banReason: 'Ofensas no chat geral', createdAt: Date.now() };
  const r1 = await dispatchHomologationPreview({ commandName: 'Apelação', context: `Pedido para a staff (${lang})`, includeHeader: true, ...staffMessage(guild, appeal) });
  const r2 = await dispatchHomologationPreview({ commandName: 'Apelação', context: `Decidido (${lang})`, ...staffMessage(guild, appeal, { decided: t('appeals.decidedRejected', lang, { user: '`<@214153735281180673>`' }) }) });
  const r3 = await dispatchHomologationPreview({
    commandName: 'Apelação',
    context: `DMs (${lang})`,
    embeds: [{ color: 0x8b5cf6, title: '✉️ DM', description: ['dmApproved', 'dmRejected'].map((k) => t(`appeals.${k}`, lang, { server: 'Cringelândia' })).join('\n\n') }],
  });
  for (const r of [r1, r2, r3]) console.log('[AppealPreview]', r.simulated ? 'simulado' : `enviado (${r.messageId})`);
}

main().catch((err) => {
  console.error('[AppealPreview] Falha:', err);
  process.exitCode = 1;
});
