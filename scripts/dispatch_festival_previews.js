#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) do Festival da Temporada (/py-festival) e dos monstros
 * fantasiados no canal 1461937203214024891. Usa contas de teste e dados temporários.
 * Uso: node scripts/dispatch_festival_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-festival-preview-'));

const { AttachmentBuilder } = require('discord.js');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const economy = require('../src/services/economy');
const festival = require('../src/services/festival');
const views = require('../src/modules/festival/festivalViews');
const engine = require('../src/modules/dungeon/dungeonEngine');
const dungeonViews = require('../src/modules/dungeon/dungeonViews');
const { renderDungeonScene } = require('../src/modules/dungeon/dungeonRenderer');

const viewer = `user_test_festival_preview_${Date.now()}`;
const source = { lang };
// Temporada aberta (Halloween) e fechada (março) para mostrar as duas telas
const OPEN = Date.UTC(2026, 9, 26, 15);
const CLOSED = Date.UTC(2026, 2, 1, 15);

async function send(context, payload) {
  const result = await dispatchHomologationPreview({ commandName: '/py-festival', context, embeds: payload.embeds, components: payload.components, files: payload.files });
  console.log(`[FestivalPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function costumedScene(season) {
  const run = engine.createRun({ ownerId: viewer, lang, seed: 7 });
  festival.decorateRun(run, OPEN, () => 0);
  run.festival.season = season;
  engine._internals.startCombat(run, 'ghost', { roomKey: run.map.pos, kind: 'monster' });
  const png = await renderDungeonScene(run, { lang, text: dungeonViews.buildRenderText(run, lang) });
  const embed = dungeonViews.buildRunEmbed(run, source, lang, {});
  return { embeds: [embed], components: dungeonViews.buildRunComponents(run, lang), files: [new AttachmentBuilder(Buffer.from(png), { name: `festival-${season}.png` })] };
}

async function main() {
  festival.addSparks(viewer, 80, 'dungeon');
  await send(`Vitrine da temporada (${lang})`, await views.buildFestivalView({ viewerId: viewer, source, now: OPEN }));
  await send(`Chances e prêmios (${lang})`, views.buildOddsView({ viewerId: viewer, source, now: OPEN }));
  const result = festival.openBox(viewer, 'sparks', { now: OPEN, random: () => 0.97 });
  if (result.ok) await send(`Caixa aberta (${lang})`, await views.buildPrizeView({ viewerId: viewer, source, result }));
  await send(`Fora de temporada (${lang})`, await views.buildFestivalView({ viewerId: viewer, source, now: CLOSED }));
  for (const season of ['halloween', 'christmas']) {
    const payload = await costumedScene(season);
    const sent = await dispatchHomologationPreview({ commandName: '/py-dungeon', context: `Monstro fantasiado: ${season} (${lang})`, ...payload });
    console.log(`[FestivalPreview] Monstro ${season}:`, sent.simulated ? 'simulado' : `enviado (${sent.messageId})`);
  }
}

main()
  .catch((err) => {
    console.error('[FestivalPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    economy.purgeTestAccounts();
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  });
