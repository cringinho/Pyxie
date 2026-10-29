#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) dos tickets personalizáveis pelo painel no canal 1461937203214024891:
 * painel padrão (servidor comum e Cringelândia), painel com textos próprios e recepção da sala com mensagem própria.
 * Uso: node scripts/dispatch_tickets_previews.js
 */
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const tm = require('../src/modules/tickets/ticketManager');
const { normalizeTicketOptions } = require('../src/modules/tickets/ticketOptions');
const { CRINGELANDIA_GUILD_ID, OWNER_SNOWFLAKE } = require('../src/config/scopes');

const GLOBAL_GUILD = { id: '999888777666555444', name: 'Servidor Exemplo' };
const CRING_GUILD = { id: CRINGELANDIA_GUILD_ID, name: 'Cringelândia' };

// Botões desativados: a prévia não abre salas de verdade
function disabled(components) {
  return components.map((row) => {
    const json = row.toJSON();
    return { ...json, components: json.components.map((c) => ({ ...c, disabled: true })) };
  });
}

async function main() {
  const custom = {
    panelTitle: '🎧 Fale com a moderação',
    panelIntro: 'Algo te incomodou ou ficou com dúvida? Escolha abaixo e abrimos uma sala só sua com a equipe.',
    types: { help: { label: 'Suporte', description: 'dúvidas, sugestões ou qualquer ajuda com o servidor.' }, report: { enabled: false } },
    roomMessage: '### 💬 Como funciona\n\n• **Conte o que houve:** sem pressa, do seu jeito.\n\n• **Tem prints?** Anexe aqui.',
  };
  const sends = [
    { context: 'Painel padrão em servidor comum (en)', guild: GLOBAL_GUILD, options: null },
    { context: 'Painel padrão na Cringelândia (pt), com Remoção de Conteúdo', guild: CRING_GUILD, options: null },
    { context: 'Painel com textos do painel web e Denúncia desligada (pt)', guild: CRING_GUILD, options: { ...custom, artRemoval: { enabled: false } } },
  ];
  for (const s of sends) {
    const panel = tm.buildTicketPanel(s.guild, s.options);
    const r = await dispatchHomologationPreview({ commandName: 'Tickets', context: s.context, embeds: panel.embeds, components: disabled(panel.components) });
    console.log('[TicketsPreview]', s.context, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
  const room = tm.buildRoomWelcomeEmbed({
    source: CRING_GUILD.id,
    number: 12,
    type: 'help',
    userId: OWNER_SNOWFLAKE,
    guildName: CRING_GUILD.name,
    options: normalizeTicketOptions(CRING_GUILD.id, custom),
  });
  const r = await dispatchHomologationPreview({ commandName: 'Tickets', context: 'Recepção da sala com mensagem própria (pt)', embeds: [room] });
  console.log('[TicketsPreview] Recepção', r.simulated ? 'simulado' : `enviado (${r.messageId})`);
}

main().catch((err) => {
  console.error('[TicketsPreview] Falha:', err);
  process.exitCode = 1;
});
