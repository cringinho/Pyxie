#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { AttachmentBuilder } = require('discord.js');

/**
 * Preview de homologação (AGENTS.md §11) da Casinha e das conquistas no canal 1461937203214024891.
 * Usa um diretório de dados temporário: nada é gravado em data/.
 * Uso: node scripts/dispatch_home_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-home-preview-'));

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const views = require('../src/modules/home/homeViews');
const store = require('../src/modules/home/homeStore');
const vault = require('../src/services/itemVault');
const achievements = require('../src/services/achievements');
const { getAchievement } = require('../src/data/achievementsCatalog');

const owner = { id: '100000000000000001', username: 'homologacao', displayName: 'Homologação' };
const source = { lang, guild: { name: 'Homologação' } };

async function send(commandName, context, payload) {
  const files = (payload.files || []).map((file) => (file instanceof AttachmentBuilder ? file : new AttachmentBuilder(file.attachment, { name: file.name })));
  const result = await dispatchHomologationPreview({ commandName, context, embeds: payload.embeds, components: payload.components, files });
  console.log(`[HomePreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  store.ensureHome(owner.id);
  for (const itemId of ['bed_lilac', 'curtain_lilac', 'rug_square_lilac', 'pet_fairy', 'floor_lamp', 'bookshelf_tall']) {
    vault.grantItem(owner.id, itemId, { source: 'admin', detail: 'preview' });
  }
  await send('py-home', `Casinha (${lang})`, await views.buildHomeView({ owner, viewer: owner, source }));
  await send('py-home', `Loja do dia (${lang})`, await views.buildShopView({ owner, source }));
  await send('py-home', `Decorar (${lang})`, await views.buildPickView({ owner, source }));
  await send('py-home', `Mochila (${lang})`, await views.buildBagView({ owner, source }));

  const unlocked = [
    { entry: getAchievement('dungeon_victory'), delivered: { coins: 0, beans: 0, items: [{ itemId: 'throne_nyx', serial: 1 }], title: 'eclipse_nyx' } },
  ];
  await send('py-achievements', `Conquista desbloqueada (${lang})`, { embeds: [achievements.buildUnlockEmbed(unlocked, source)] });
  const { buildAchievementsView } = require('../src/commands/conquistas');
  await send('py-achievements', `Conquistas (${lang})`, buildAchievementsView({ owner, viewerId: owner.id, source, category: 'dungeon' }));
}

main().catch((error) => {
  console.error('[HomePreview] Falha:', error);
  process.exit(1);
});
