const pyCharacter = require('./commands/pyCharacter');
const narrator = require('./narrator');
const store = require('./characterStore');

/**
 * Módulo Roleplay: ficha de personagem (/py-character, vale em qualquer servidor) e a narradora com
 * IA nos posts do fórum #roleplay-tales do Pyxie's Realm, no universo da Pyxie e separada das
 * Catacumbas. Os ouvintes conferem sozinhos se a mensagem é de uma cena do Realm.
 */
module.exports = {
  id: 'roleplay',
  name: {
    'pt-BR': 'Roleplay',
    en: 'Roleplay',
  },
  description: {
    'pt-BR': 'Fichas de personagem e uma narradora com IA para histórias no universo da Pyxie, com NPCs da lore e rolagens de d20.',
    en: "Character sheets and an AI narrator for tales in Pyxie's universe, with lore NPCs and d20 rolls.",
  },
  category: 'social',
  icon: '📖',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyCharacter],

  async onLoad(ctx) {
    if (!ctx.client) return;
    ctx.registerListener('threadCreate', (thread, newlyCreated) => narrator.onThreadCreate(thread, newlyCreated).catch((err) => console.error('[roleplay] threadCreate:', err.message)));
    ctx.registerListener('messageCreate', (message) => narrator.onMessage(message).catch((err) => console.error('[roleplay] messageCreate:', err.message)));
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!interaction.isButton?.() || !String(interaction.customId || '').startsWith(`${narrator.PREFIX}:roll:`)) return;
      try {
        await narrator.onRollButton(interaction);
      } catch (err) {
        console.error('[roleplay] Erro na rolagem:', err);
      }
    });
  },

  getStatus() {
    const scenes = store.listScenes();
    const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return { characters: store.countCharacters(), scenes: scenes.length, activeScenes: scenes.filter((s) => (s.lastNarratedAt || 0) >= week).length };
  },
};
