const { SlashCommandBuilder } = require('discord.js');
const { resetUserEconomy } = require('../services/economy');
const { formatCoins } = require('./economyHelpers');
const { RESET_ECONOMY } = require('./commandNames');
const { OWNER_SNOWFLAKE } = require('../services/adminAuth');
const { t } = require('../utils/i18n');

function isOwner(source) {
  const userId = source.user?.id || source.author?.id;
  return userId === OWNER_SNOWFLAKE;
}

function getTargetUser(source, args = []) {
  return source.options?.getUser('user') || source.options?.getUser('usuario') || source.mentions.users.first() || source.guild?.members.cache.get(args[0])?.user;
}

module.exports = {
  name: RESET_ECONOMY,
  aliases: ['reseteco', 'reseteconomy', 'reseteconomia', 'resetareconomia', 'py-resetareconomia', 'py-reseteco'],
  data: new SlashCommandBuilder()
    .setName(RESET_ECONOMY)
    .setDescription('Reset a user\'s Coins and daily cooldown.')
    .setDescriptionLocalizations({
      'pt-BR': 'Zera as Moedinhas e o cooldown diário de um usuário.',
    })
    .setDefaultMemberPermissions(0n)
    .addUserOption((option) =>
      option
        .setName('user')
        .setNameLocalizations({
          'en-US': 'user',
          'en-GB': 'user',
          'pt-BR': 'usuario',
        })
        .setDescription('User whose economy data will be reset.')
        .setDescriptionLocalizations({
          'pt-BR': 'Usuário que terá os dados de economia resetados.',
        })
        .setRequired(true)
    ),
  async executePrefix({ message, args }) {
    if (!isOwner(message)) {
      return message.reply(t('admin.onlyOwner', message, { owner: `<@${OWNER_SNOWFLAKE}>` }));
    }
    const target = getTargetUser(message, args);
    if (!target) return message.reply(t('admin.resetEconomyInvalid', message));
    resetUserEconomy(target.id);
    await message.reply(
      t('admin.resetEconomySuccess', message, {
        user: target.displayName || target.username || target,
        coins: formatCoins(0, message),
      })
    );
  },
  async executeSlash({ interaction }) {
    if (!isOwner(interaction)) {
      return interaction.editReply(t('admin.onlyOwner', interaction, { owner: `<@${OWNER_SNOWFLAKE}>` }));
    }
    const target = getTargetUser(interaction);
    resetUserEconomy(target.id);
    await interaction.editReply(
      t('admin.resetEconomySuccess', interaction, {
        user: target.displayName || target.username || target,
        coins: formatCoins(0, interaction),
      })
    );
  },
};