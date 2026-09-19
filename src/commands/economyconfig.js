const { SlashCommandBuilder } = require('discord.js');
const { getEconomyConfig, setEconomyConfig } = require('../services/database');
const { ECONOMY_CONFIG } = require('./commandNames');
const { OWNER_SNOWFLAKE } = require('../services/adminAuth');
const { t } = require('../utils/i18n');

function parseValues(minimum, maximum) {
  const parsedMinimum = Number(minimum);
  const parsedMaximum = Number(maximum);
  if (!Number.isInteger(parsedMinimum) || !Number.isInteger(parsedMaximum) || parsedMinimum < 0 || parsedMaximum < parsedMinimum) {
    return null;
  }
  return { minimum: parsedMinimum, maximum: parsedMaximum };
}

function isOwner(source) {
  const userId = source.user?.id || source.author?.id;
  return userId === OWNER_SNOWFLAKE;
}

function buildReply(config, source = null) {
  return t('admin.economyConfigSuccess', source, {
    min: config.minimum,
    max: config.maximum,
    coins: t('common.coins', source),
  });
}

module.exports = {
  name: ECONOMY_CONFIG,
  aliases: ['ecoconfig', 'economyconfig', 'configeconomia', 'py-configeconomia', 'py-ecoconfig'],
  data: new SlashCommandBuilder()
    .setName(ECONOMY_CONFIG)
    .setDescription('Configure daily minimum and maximum Coins rewards.')
    .setDescriptionLocalizations({
      'pt-BR': 'Configura a quantidade de Moedinhas do diário.',
    })
    .setDefaultMemberPermissions(0n)
    .addIntegerOption((option) =>
      option
        .setName('minimo')
        .setNameLocalizations({
          'en-US': 'minimum',
          'en-GB': 'minimum',
          'pt-BR': 'minimo',
        })
        .setDescription('Minimum value for daily coins')
        .setDescriptionLocalizations({
          'pt-BR': 'Valor mínimo para o diário',
        })
        .setMinValue(0)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('maximo')
        .setNameLocalizations({
          'en-US': 'maximum',
          'en-GB': 'maximum',
          'pt-BR': 'maximo',
        })
        .setDescription('Maximum value for daily coins')
        .setDescriptionLocalizations({
          'pt-BR': 'Valor máximo para o diário',
        })
        .setMinValue(0)
        .setRequired(true)
    ),
  async executePrefix({ message, args }) {
    if (!isOwner(message)) {
      return message.reply(t('admin.onlyOwner', message, { owner: `<@${OWNER_SNOWFLAKE}>` }));
    }
    const values = parseValues(args[0], args[1]);
    if (!values) return message.reply(t('admin.economyConfigInvalid', message));
    await message.reply(buildReply(setEconomyConfig(values.minimum, values.maximum), message));
  },
  async executeSlash({ interaction }) {
    if (!isOwner(interaction)) {
      return interaction.editReply(t('admin.onlyOwner', interaction, { owner: `<@${OWNER_SNOWFLAKE}>` }));
    }
    const minVal = interaction.options.getInteger('minimo') ?? interaction.options.getInteger('minimum');
    const maxVal = interaction.options.getInteger('maximo') ?? interaction.options.getInteger('maximum');
    const values = parseValues(minVal, maxVal);
    if (!values) return interaction.editReply(t('admin.economyConfigInvalid', interaction));
    await interaction.editReply(buildReply(setEconomyConfig(values.minimum, values.maximum), interaction));
  },
};