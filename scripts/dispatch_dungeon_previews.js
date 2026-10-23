#!/usr/bin/env node
require('dotenv').config();
const { AttachmentBuilder } = require('discord.js');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const engine = require('../src/modules/dungeon/dungeonEngine');
const views = require('../src/modules/dungeon/dungeonViews');
const { renderDungeonScene } = require('../src/modules/dungeon/dungeonRenderer');

/**
 * Preview de homologação das Catacumbas de Veludo (AGENTS.md §11) no canal 1461937203214024891.
 * Os runs são gerados pelo motor real com sementes fixas e nada é gravado em data/.
 * Uso: node scripts/dispatch_dungeon_previews.js [pt|en]
 */

const PREVIEW_OWNER = '100000000000000000';
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const source = { lang, guild: { name: 'Homologação' } };

/** Joga com uma política simples até a fase pedida (ou até o run acabar). */
function driveUntil(run, phase, maxSteps = 400) {
  for (let i = 0; i < maxSteps && run.phase !== phase && !engine.isTerminal(run); i++) {
    const actions = engine.getAvailableActions(run).filter((a) => a.enabled && !a.id.startsWith('forfeit'));
    const prefer = ['bolt', 'attack', 'open', 'drink', 'pray', 'jump', 'pick', 'descend'];
    let next = prefer.map((id) => actions.find((a) => a.id === id)).find(Boolean);
    if (run.phase === 'explore') {
      const moves = actions.filter((a) => a.id === 'move');
      next = moves[i % moves.length];
    }
    if (run.phase === 'event' && run.event.type === 'merchant') next = actions.find((a) => a.id === 'leave');
    if (!next) break;
    engine.applyAction(run, next.id, next.arg);
  }
  return run;
}

async function scene(run, settlement = null) {
  const png = await renderDungeonScene(run, { lang, text: views.buildRenderText(run, lang, settlement) });
  return new AttachmentBuilder(png, { name: `catacombs-preview-${run.phase}.png` });
}

async function send(commandName, context, run, settlement = null) {
  const embed = views.buildRunEmbed(run, source, lang, { settlement });
  const result = await dispatchHomologationPreview({
    commandName,
    context,
    embeds: [embed],
    components: views.buildRunComponents(run, lang),
    files: [await scene(run, settlement)],
  });
  console.log(`[DungeonPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
  await new Promise((r) => setTimeout(r, 600));
}

async function main() {
  const lobby = views.buildLobbyView({ id: PREVIEW_OWNER }, source);
  await dispatchHomologationPreview({
    commandName: '/py-dungeon',
    context: `Menu das Catacumbas de Veludo (${lang})`,
    embeds: lobby.embeds,
    components: lobby.components,
    files: lobby.files,
  });

  const explore = engine.createRun({ ownerId: PREVIEW_OWNER, lang, seed: 2026 });
  await send('/py-dungeon', 'Exploração com mapa e névoa de guerra', explore);

  const combat = driveUntil(engine.createRun({ ownerId: PREVIEW_OWNER, lang, seed: 7 }), 'combat');
  await send('/py-dungeon', 'Combate com intenção telegrafada', combat);

  const camp = driveUntil(engine.createRun({ ownerId: PREVIEW_OWNER, lang, seed: 7, talents: { vitality: 3, wand: 1 } }), 'camp');
  await send('/py-dungeon', 'Fogueira: descer ou fugir com o tesouro', camp);

  if (camp.phase === 'camp') {
    engine.applyAction(camp, 'extract');
    const gross = engine.computeGrossPayout(camp);
    const settlement = { outcome: camp.outcome, floor: camp.floor, gold: camp.player.gold, gross, payout: gross, cappedBy: null, fee: engine.lanternFee(camp.floor), echoes: engine.computeEchoes(camp), newBest: true };
    await send('/py-dungeon', 'Liquidação da fuga (Taxa da Lanterna)', camp, settlement);
  }
}

main().catch((err) => {
  console.error('[DungeonPreview] Erro fatal:', err);
  process.exit(1);
});
