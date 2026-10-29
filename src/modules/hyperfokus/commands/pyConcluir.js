const { SlashCommandBuilder } = require('discord.js');
const { getLanguage, t } = require('../../../utils/i18n');
const draftStore = require('../draftStore');
const threadGuard = require('../threadGuard');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';
const name = 'py-concluir';
const aliases = ['concluir', 'postar', 'conclude', 'publish-draft', 'py-conclude'];

module.exports = {
  name,
  aliases,
  category: 'social',
  scopes: [CRINGELANDIA_GUILD_ID],
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Conclude the hyperfocus draft and send it to editorial review.')
    .setDescriptionLocalizations({
      'pt-BR': 'Conclui o rascunho de hiperfoco e envia para a fila editorial.',
    }),

  async executeSlash({ interaction, client }) {
    const lang = getLanguage(interaction.guildId);
    if (!interaction.channel || !interaction.channel.isThread()) {
      return interaction.editReply({
        content: lang === 'pt' ? 'Este comando só pode ser usado dentro de um tópico de hiperfoco.' : 'This command can only be used inside a hyperfocus thread.',
      });
    }

    const thread = interaction.channel;
    const draft = draftStore.getDraft(thread.id);
    if (!draft) {
      return interaction.editReply({
        content: lang === 'pt' ? 'Nenhum rascunho encontrado neste tópico.' : 'No draft found in this thread.',
      });
    }

    if (draft.status !== 'DRAFT') {
      return interaction.editReply({
        content: t('hyperfokus.concluirAlready', lang),
      });
    }

    if (!draftStore.isAuthorOrCollaborator(thread.id, interaction.user.id)) {
      return interaction.editReply({
        content: t('hyperfokus.concluirOnlyAuthor', lang),
      });
    }

    const res = await threadGuard.concludeDraft({
      thread,
      user: interaction.user,
      interaction,
      client,
    });

    if (res.success) {
      await interaction.editReply({
        content: t('hyperfokus.concluirSuccess', lang),
      });
    } else {
      await interaction.editReply({
        content: `Erro ao concluir: ${res.error}`,
      });
    }
  },

  async executePrefix({ message, client }) {
    const lang = getLanguage(message.guildId);
    if (!message.channel || !message.channel.isThread()) {
      return message.reply(
        lang === 'pt' ? 'Este comando só pode ser usado dentro de um tópico de hiperfoco.' : 'This command can only be used inside a hyperfocus thread.'
      );
    }

    const thread = message.channel;
    const draft = draftStore.getDraft(thread.id);
    if (!draft) {
      return message.reply(
        lang === 'pt' ? 'Nenhum rascunho encontrado neste tópico.' : 'No draft found in this thread.'
      );
    }

    if (draft.status !== 'DRAFT') {
      return message.reply(t('hyperfokus.concluirAlready', lang));
    }

    if (!draftStore.isAuthorOrCollaborator(thread.id, message.author.id)) {
      return message.reply(t('hyperfokus.concluirOnlyAuthor', lang));
    }

    const res = await threadGuard.concludeDraft({
      thread,
      user: message.author,
      client,
    });

    if (res.success) {
      await message.reply(t('hyperfokus.concluirSuccess', lang));
    } else {
      await message.reply(`Erro ao concluir: ${res.error}`);
    }
  },
};
