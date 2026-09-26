const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { ADMIN } = require('./commandNames');
const { OWNER_SNOWFLAKE, createOwnerMagicToken } = require('../services/adminAuth');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

function buildAdminView(userId, guildOrSource = null) {
  if (userId !== OWNER_SNOWFLAKE) {
    return {
      content: t('admin.onlyOwner', guildOrSource, { owner: `<@${OWNER_SNOWFLAKE}>` }),
      ephemeral: true,
    };
  }

  const tokenResult = createOwnerMagicToken(userId);
  if (!tokenResult.success) {
    return {
      content: `❌ ${tokenResult.error}`,
      ephemeral: true,
    };
  }

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.crimson || '#ef4444')
    .setTitle(t('admin.title', guildOrSource))
    .setDescription(`${t('admin.desc', guildOrSource)}\n\n🔗 **Link de Acesso Direto:**\n[Abrir Painel Administrativo](${tokenResult.url})\n*(Válido por 15 minutos • Sessão de 12h)*`)
    .setFooter({ text: pyxieFooter(t('admin.footer', guildOrSource)) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('admin.btnOpen', guildOrSource))
      .setEmoji('🛡️')
      .setStyle(ButtonStyle.Link)
      .setURL(tokenResult.url)
  );

  return { embeds: [embed], components: [row], ephemeral: true };
}

module.exports = {
  name: ADMIN,
  ephemeral: true,
  aliases: ['admin', 'painel', 'py-admin', 'dashboard', 'paineldono', 'owner'],
  buildAdminView,
  data: new SlashCommandBuilder()
    .setName(ADMIN)
    .setDescription('Access Pyxie\'s secure owner administration dashboard.')
    .setDescriptionLocalizations({
      'pt-BR': 'Acesse o painel seguro de administração exclusivo do criador da Pyxie.',
    }),
  async executePrefix({ message }) {
    const view = buildAdminView(message.author.id, message);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildAdminView(interaction.user.id, interaction);
    await interaction.editReply(view);
  },
};

