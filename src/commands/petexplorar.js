const { SlashCommandBuilder } = require('discord.js');
const { getActivePet } = require('../services/pets');
const { startProceduralRun } = require('../services/proceduralExplorer');
const { PET_EXPLORE } = require('./commandNames');
const { buildDungeonTab } = require('./pet');
const { getLanguage } = require('../utils/i18n');

module.exports = {
  name: PET_EXPLORE,
  aliases: ['explore', 'explorar', 'py-explorar', 'py-explore', 'dungeon', 'aventura'],
  data: new SlashCommandBuilder()
    .setName(PET_EXPLORE)
    .setDescription('Explore procedural 2D dungeons with your active Pymon.')
    .setDescriptionLocalizations({
      'pt-BR': 'Inicia expedições em masmorras procedurais 2D com seu Pymon.',
    })
    .addStringOption((option) =>
      option
        .setName('zona')
        .setNameLocalizations({
          'en-US': 'zone',
          'en-GB': 'zone',
          'pt-BR': 'zona',
        })
        .setDescription('Dungeon zone to explore.')
        .setDescriptionLocalizations({
          'pt-BR': 'Zona da masmorra para explorar.',
        })
        .setRequired(false)
        .addChoices(
          { name: '🌲 Chime Woods (Lv. 1+)', nameLocalizations: { 'pt-BR': '🌲 Bosque dos Guizos (Nv. 1+)' }, value: 'bosque' },
          { name: '💧 Singing Reefs (Lv. 2+)', nameLocalizations: { 'pt-BR': '💧 Recifes Cantantes (Nv. 2+)' }, value: 'recife' },
          { name: '🪶 Sweet Wind Hills (Lv. 3+)', nameLocalizations: { 'pt-BR': '🪶 Colinas do Vento Doce (Nv. 3+)' }, value: 'colina' },
          { name: '🏰 Pyxie Mischief Castle (Lv. 5+)', nameLocalizations: { 'pt-BR': '🏰 Castelo Travesso de Pyxie (Nv. 5+)' }, value: 'castelo' }
        )
    ),
  async executeSlash({ interaction }) {
    const userId = interaction.user.id;
    const userTag = interaction.user.displayName || interaction.user.username;
    const isEn = getLanguage(interaction) === 'en';
    const { isPetOnExpedition, getActiveExpedition } = require('../services/petExpedition');
    if (isPetOnExpedition(userId)) {
      const exp = getActiveExpedition(userId);
      const remainingMins = Math.ceil((exp?.remainingMs || 0) / 60000);
      await interaction.editReply({
        content: isEn
          ? `🧭 **Your Pymon is currently on an expedition!**\nExpected return in **${remainingMins} minute(s)**. Use \`/expedicao\` to claim rewards after return before entering dungeons.`
          : `🧭 **Seu Pymon está atualmente em uma expedição!**\nRetorno previsto em **${remainingMins} minuto(s)**. Use \`/expedicao\` para coletar as recompensas após o retorno antes de entrar em masmorras.`,
      });
      return;
    }

    const directZone = interaction.options?.getString('zona') || interaction.options?.getString('zone');

    if (directZone) {
      const activePet = getActivePet(userId);
      startProceduralRun(userId, directZone, activePet);
    }

    const view = buildDungeonTab(userId, userTag, interaction);
    await interaction.editReply(view);
  },
  async executePrefix({ message }) {
    const userId = message.author.id;
    const userTag = message.author.displayName || message.author.username;
    const isEn = getLanguage(message) === 'en';
    const { isPetOnExpedition, getActiveExpedition } = require('../services/petExpedition');
    if (isPetOnExpedition(userId)) {
      const exp = getActiveExpedition(userId);
      const remainingMins = Math.ceil((exp?.remainingMs || 0) / 60000);
      await message.reply(
        isEn
          ? `🧭 **Your Pymon is currently on an expedition!**\nExpected return in **${remainingMins} minute(s)**. Use \`/expedicao\` to claim rewards after return before entering dungeons.`
          : `🧭 **Seu Pymon está atualmente em uma expedição!**\nRetorno previsto em **${remainingMins} minuto(s)**. Use \`/expedicao\` para coletar as recompensas após o retorno antes de entrar em masmorras.`
      );
      return;
    }

    const view = buildDungeonTab(userId, userTag, message);
    await message.reply(view);
  },
  isDungeonInteraction(interaction) {
    if (!interaction.customId) return false;
    return (
      interaction.customId.startsWith('dungeon_start:') ||
      interaction.customId.startsWith('dungeon_move:') ||
      interaction.customId.startsWith('dungeon_retreat:') ||
      interaction.customId.startsWith('dungeon_flee:')
    );
  },
  async handleDungeonInteraction(interaction) {
    const parts = interaction.customId.split(':');
    const action = parts[0];
    const targetUserId = parts[parts.length - 1];

    if (targetUserId && targetUserId !== interaction.user.id) {
      return interaction.reply({
        content: '⚠️ Esta masmorra não pertence a você!',
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const userTag = interaction.user.displayName || interaction.user.username;
    const { awardPetXp } = require('../services/pets');
    const activePet = getActivePet(userId);

    if (action === 'dungeon_start') {
      const zoneId = parts[1];
      startProceduralRun(userId, zoneId, activePet);
    } else if (action === 'dungeon_move') {
      const direction = parts[1];
      const { movePlayer } = require('../services/proceduralExplorer');
      movePlayer(userId, direction, activePet, awardPetXp);
    } else if (action === 'dungeon_retreat') {
      const { retreatRun } = require('../services/proceduralExplorer');
      retreatRun(userId, activePet, awardPetXp);
    } else if (action === 'dungeon_flee') {
      const { panicFlee } = require('../services/proceduralExplorer');
      panicFlee(userId, activePet);
    }

    const view = buildDungeonTab(userId, userTag, interaction);
    await interaction.update(view);
  },
};