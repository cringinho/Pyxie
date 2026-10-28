#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) dos posts do Animador de chat no canal 1461937203214024891.
 * Uso: node scripts/dispatch_animator_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const animator = require('../src/services/animator');
const auto = require('../src/services/automations');
const { buildPost } = require('../src/modules/chat-animator');

async function main() {
  const tones = { question: 'cute', thisOrThat: 'tsundere', poll: 'neutral', scramble: 'cute', fact: 'neutral' };
  for (const [type, tone] of Object.entries(tones)) {
    const cfg = { ...auto.normalize('animator', {}), tone };
    const content = animator.pickContent({ types: [type], lang }, Math.random);
    const post = buildPost(lang, cfg, content, { guildId: '1453890868980482090', channelId: '1461937203214024891', postKey: 'preview' });
    const r = await dispatchHomologationPreview({ commandName: 'Animador de chat', context: `${type} · ${tone} (${lang})`, includeHeader: type === 'question', ...post });
    console.log('[AnimatorPreview]', type, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
}

main().catch((err) => {
  console.error('[AnimatorPreview] Falha:', err);
  process.exitCode = 1;
});
