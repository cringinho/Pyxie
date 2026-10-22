const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { buildHubPayload } = require('../modules/giveaways/giveawayManager');

const name = 'py-sorteio';

module.exports = {
  name,
  aliases: ['sorteio', 'giveaway', 'py-giveaway', 'sorteios', 'py-sorteios'],
  description: 'Gerencie e crie sorteios interativos para a comunidade com regras e apuração justa.',

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Manage and create interactive community giveaways with fair drawing.')
    .setDescriptionLocalizations({
      'pt-BR': 'Gerencie e crie sorteios interativos para a comunidade com regras e apuração justa.',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executePrefix({ message }) {
    if (
      !message.member?.permissions?.has(PermissionFlagsBits.ManageGuild) &&
      !message.member?.permissions?.has(PermissionFlagsBits.ManageChannels)
    ) {
      return message.reply('❌ Você não possui permissão de gerenciar canais ou o servidor para acessar os sorteios.');
    }

    const embed = new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle('🎉  ✦  Central de Sorteios Pyxie')
      .setDescription(
        `### 🎁 Painel Administrativo de Sorteios\n\n` +
        `Para garantir sua privacidade e comodidade, clique no botão abaixo para abrir a Central de Sorteios de forma interativa.\n\n` +
        `-# 🌷 Pyxie Community Engine`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gw:hub:open')
        .setLabel('Abrir Central de Sorteios')
        .setEmoji('🎁')
        .setStyle(ButtonStyle.Primary)
    );

    return message.reply({ embeds: [embed], components: [row] });
  },

  async executeSlash({ interaction }) {
    if (
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild) &&
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)
    ) {
      return interaction.reply({
        content: '❌ Você não possui permissão de gerenciar canais ou o servidor para acessar os sorteios.',
        ephemeral: true,
      });
    }

    const payload = buildHubPayload();
    return interaction.reply({ ...payload, ephemeral: true });
  },
};

