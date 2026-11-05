const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { buildHubPayload } = require('../modules/giveaways/giveawayManager');
const { GIVEAWAY } = require('./commandNames');
const { t } = require('../utils/i18n');

const name = GIVEAWAY;

module.exports = {
  name,
  aliases: ['sorteio', 'giveaway', 'py-giveaway', 'py-sorteio', 'sorteios', 'py-sorteios'],
  description: 'Manage and create interactive community giveaways with fair drawing.',

  data: new SlashCommandBuilder()
    .setName(name)
    .setNameLocalizations({
      'pt-BR': 'py-sorteio',
    })
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
      return message.reply(t('giveawayWizard.noPermission', message));
    }

    const embed = new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle(t('giveawayWizard.hubTitle', message))
      .setDescription(t('giveawayWizard.prefixBody', message));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gw:hub:open')
        .setLabel(t('giveawayWizard.prefixOpen', message))
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
        content: t('giveawayWizard.noPermission', interaction),
        ephemeral: true,
      });
    }

    const payload = buildHubPayload(interaction.guildId || interaction);
    return interaction.reply({ ...payload, ephemeral: true });
  },
};

