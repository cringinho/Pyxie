#!/usr/bin/env node
require('dotenv').config();
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { buildWelcomeMessage } = require('../src/services/guildOnboarding');
const { buildVoteView } = require('../src/commands/votar');

/**
 * Preview de homologação (AGENTS.md §11) das boas-vindas do guildCreate e do /py-vote,
 * em PT e EN, no canal 1461937203214024891. Nada é gravado em data/.
 * Uso: node scripts/dispatch_growth_previews.js
 */

const guild = { id: '0', name: 'Homologação' };

async function main() {
  for (const lang of ['pt', 'en']) {
    const welcome = buildWelcomeMessage(guild, null, lang);
    const welcomeResult = await dispatchHomologationPreview({
      commandName: 'guildCreate',
      context: `Boas-vindas ao entrar num servidor (${lang})`,
      embeds: welcome.embeds,
      components: welcome.components,
    });
    console.log(`[GrowthPreview] boas-vindas ${lang}:`, welcomeResult.simulated ? 'simulado' : `enviado (${welcomeResult.messageId})`);

    const vote = buildVoteView({ lang, guild }, null, null);
    const voteResult = await dispatchHomologationPreview({
      commandName: 'py-vote',
      context: `Voto no Top.gg com feijões (${lang})`,
      embeds: vote.embeds,
      components: vote.components,
    });
    console.log(`[GrowthPreview] voto ${lang}:`, voteResult.simulated ? 'simulado' : `enviado (${voteResult.messageId})`);
  }
}

main().catch((error) => {
  console.error('[GrowthPreview] Falha:', error);
  process.exit(1);
});
