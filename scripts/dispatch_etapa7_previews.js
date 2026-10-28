#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) das mensagens da etapa 7 no canal 1461937203214024891:
 * falas prontas da Pyxie, comentário do fórum de hiperfocos, radar (staff e publicação) e
 * respostas do [Título] Nick. Uso: node scripts/dispatch_etapa7_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { t } = require('../src/utils/i18n');

async function main() {
  const lines = (event) => Object.keys(require('../src/utils/i18n').TRANSLATIONS[lang].pyxieVoice[event]).map((k) => `-# 🧚 ${t(`pyxieVoice.${event}.${k}`, lang)}`).join('\n\n');
  const r1 = await dispatchHomologationPreview({
    commandName: lang === 'pt' ? 'Voz da Pyxie' : 'Pyxie voice',
    context: lang === 'pt' ? 'Falas prontas (fora da Cringelândia ou sem Groq)' : 'Fallback lines (outside Cringelândia or without Groq)',
    embeds: [
      { color: 0x8b5cf6, title: '🧚 /py-daily', description: lines('daily') },
      { color: 0x10b981, title: '🧚 /py-work', description: lines('work') },
      { color: 0x9333ea, title: '🧚 /py-tarot', description: lines('tarot') },
    ],
    includeHeader: true,
  });
  console.log('[Etapa7Preview] Voz:', r1.simulated ? 'simulado' : `enviado (${r1.messageId})`);

  const r2 = await dispatchHomologationPreview({
    commandName: lang === 'pt' ? 'Comunidade' : 'Community',
    context: lang === 'pt' ? 'Fórum de hiperfocos, radar e [Título] Nick' : 'Hyperfocus forum, radar and [Title] Nick',
    embeds: [
      {
        color: 0x8b5cf6,
        title: lang === 'pt' ? '🌱 Primeiro comentário no fórum' : '🌱 First forum comment',
        description: `${t('hyperfocus.comments.1', lang, { topic: 'Sonic', name: 'Ana' })}\n\n${t('hyperfocus.reward', lang, { coins: 15 })}`,
      },
      {
        color: 0x8b5cf6,
        title: '📡 Lei garante prioridade para pessoas autistas (exemplo)',
        description: [lang === 'pt' ? 'Resumo neutro de exemplo em até três frases.' : 'Example neutral summary in up to three sentences.', `-# ${t('radar.reviewHint', 'pt')}`].join('\n\n'),
      },
      {
        color: 0x8b5cf6,
        title: '📡 Lei garante prioridade para pessoas autistas (exemplo)',
        description: [lang === 'pt' ? 'Resumo neutro de exemplo.' : 'Example neutral summary.', `🔗 [${t('radar.source', 'pt')}](https://pyxie.com.br)`, `-# ${t('radar.disclaimer', 'pt')}`].join('\n\n'),
      },
      {
        color: 0x8b5cf6,
        title: '🏷️ [Título] Nick',
        description: ['enabled', 'disabled', 'cannot'].map((k) => `• ${t(`titleNick.${k}`, lang, { nick: '[Rainha] Aninha' })}`).join('\n\n'),
      },
    ],
    includeHeader: true,
  });
  console.log('[Etapa7Preview] Comunidade:', r2.simulated ? 'simulado' : `enviado (${r2.messageId})`);
}

main().catch((err) => {
  console.error('[Etapa7Preview] Falha:', err);
  process.exitCode = 1;
});
