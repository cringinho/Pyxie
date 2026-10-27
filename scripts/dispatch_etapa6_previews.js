#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) das mensagens da etapa 6 no canal 1461937203214024891:
 * aviso, modo lento, DM do castigo e registro para a staff do controle de brigas, e o alerta do
 * monitor de links. Menções entre crases. Uso: node scripts/dispatch_etapa6_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-etapa6-preview-'));

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const linkModule = require('../src/modules/link-sentinel');
const { t } = require('../src/utils/i18n');

async function main() {
  const a = '`<@111111111111111111>`';
  const b = '`<@222222222222222222>`';
  const r1 = await dispatchHomologationPreview({
    commandName: lang === 'pt' ? 'Controle de brigas' : 'Conflict care',
    context: lang === 'pt' ? 'Mensagens no canal e DM' : 'Channel messages and DM',
    embeds: [
      {
        color: 0x8b5cf6,
        title: lang === 'pt' ? '🍵 Degraus do controle de brigas' : '🍵 Conflict care steps',
        description: [
          `### 1 · ${t('moderation.action.warn', lang)}`,
          `> ${t('moderation.warn', lang, { a, b })}`,
          `### 2 · ${t('moderation.action.slowmode', lang)}`,
          `> ${t('moderation.slowmode', lang, { seconds: 30, minutes: 10 })}`,
          `### 3 · DM`,
          `> ${t('moderation.timeoutDm', lang, { server: 'Cringelândia' })}`,
          `### AutoMod`,
          `> ${t('moderation.shieldBlocked', lang)}`,
        ].join('\n\n'),
      },
      {
        color: 0xef4444,
        title: t('moderation.logTitle', lang, { level: 3 }),
        description: [
          t('moderation.logWho', lang, { a, b, channel: '`#chati`' }),
          t('moderation.logVerdict', lang, { label: 'hostil' }),
          t('moderation.logAction', lang, { action: t('moderation.action.timeout', lang) }),
          `### ${t('moderation.logExcerpt', lang)}`,
          '**Ana:** ...\n\n**Bia:** ...',
        ].join('\n\n'),
      },
    ],
    includeHeader: true,
  });
  console.log('[Etapa6Preview] Moderação:', r1.simulated ? 'simulado' : `enviado (${r1.messageId})`);

  const alert = linkModule.alertPayload({
    kind: 'down',
    diagnosis: 'HTTP 404',
    replacement: 'https://web.archive.org/web/2026/https://exemplo.gov.br/ciptea',
    link: { id: 'abc123', url: 'https://exemplo.gov.br/ciptea', label: 'Guia CIPTEA (SP)', source: 'cringelandia' },
  });
  const r2 = await dispatchHomologationPreview({
    commandName: lang === 'pt' ? 'Monitor de links' : 'Link monitor',
    context: lang === 'pt' ? 'DM ao dono (os textos do alerta são sempre em PT)' : 'Owner DM (alert texts are always PT)',
    embeds: alert.embeds,
    components: alert.components,
    includeHeader: true,
  });
  console.log('[Etapa6Preview] Links:', r2.simulated ? 'simulado' : `enviado (${r2.messageId})`);
}

main()
  .catch((err) => {
    console.error('[Etapa6Preview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
