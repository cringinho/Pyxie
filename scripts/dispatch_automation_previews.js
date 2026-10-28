#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) dos avisos das automações no canal 1461937203214024891.
 * Uso: node scripts/dispatch_automation_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { embed } = require('../src/services/autoAlerts');
const { t } = require('../src/utils/i18n');

const U = '`@pessoa`';
const samples = [
  ['newAccount', 'warn', [t('autos.newAccount.body', lang, { user: U, age: '`2` dias' }), `> ${t('autos.newAccount.quarantined', lang, { role: '`@Quarentena`' })}`]],
  ['impersonation', 'danger', [t('autos.impersonation.body', lang, { user: U, name: 'M0deradora', staff: '`@Moderadora`' }), `> ${t('autos.impersonation.hint', lang)}`]],
  ['spam', 'danger', [t('autos.spam.body', lang, { user: U, count: '`3`' }), `> ${t('autos.spam.timeout', lang, { minutes: '`60`' })}`]],
  ['mentions', 'warn', [t('autos.mentions.body', lang, { user: U, count: '`12`', channel: '`#geral`' })]],
  ['canary', 'danger', [t('autos.canary.body', lang, { user: U, count: '`6`', minutes: '`3`' }), `> ${t('autos.canary.alertOnly', lang)}`]],
  ['contrast', 0x8592a8, [t('autos.contrast.body', lang, { role: '`@Noturno`', hex: '1f2a44', ratio: '1.2', min: 3 }), `> ${t('autos.contrast.suggest', lang, { hex: '8592a8', ratio: '3.1' })}`]],
  ['status', 'warn', [t('autos.status.body', lang, { name: 'API', status: 'investigating' }), `> ${t('autos.status.hint', lang)}`, `[${t('autos.status.follow', lang)}](https://discordstatus.com)`]],
];

async function main() {
  let first = true;
  for (const [key, color, lines] of samples) {
    const title = t(`autos.${key}.title`, lang);
    const r = await dispatchHomologationPreview({ commandName: 'Automações', context: `${key} (${lang})`, includeHeader: first, embeds: [embed(lang, { title, lines, color })], allowedMentions: { parse: [] } });
    first = false;
    console.log('[AutomationPreview]', key, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
  for (const key of ['invite.notice', 'longPaste.notice']) {
    const r = await dispatchHomologationPreview({ commandName: 'Automações', context: `${key} (${lang})`, content: t(`autos.${key}`, lang, { user: U, lines: '`58`' }), allowedMentions: { parse: [] } });
    console.log('[AutomationPreview]', key, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
}

main().catch((err) => {
  console.error('[AutomationPreview] Falha:', err);
  process.exitCode = 1;
});
