const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getLanguage, t } = require('../../../utils/i18n');
const draftStore = require('../draftStore');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';
const name = 'py-add';
const aliases = ['add', 'coautor', 'coauthor', 'py-coautor'];

module.exports = {
  name,
  aliases,
  category: 'social',
  scopes: [CRINGELANDIA_GUILD_ID],
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Add a collaborator to the current hyperfocus editorial draft.')
    .setDescriptionLocalizations({
      'pt-BR': 'Adiciona um coautor ao rascunho editorial de hiperfoco atual.',
    })
    .addUserOption((opt) =>
      opt
        .setName('user')
        .setDescription('User to add as collaborator')
        .setDescriptionLocalizations({
          'pt-BR': 'Usuário para adicionar como coautor',
        })
        .setRequired(true)
    ),

  async executeSlash({ interaction }) {
    const lang = getLanguage(interaction.guildId);
    if (!interaction.channel || !interaction.channel.isThread()) {
      return interaction.editReply({
        content: lang === 'pt' ? 'Este comando só pode ser usado dentro de um tópico de hiperfoco.' : 'This command can only be used inside a hyperfocus thread.',
      });
    }

    const threadId = interaction.channelId;
    const draft = draftStore.getDraft(threadId);
    if (!draft || draft.status !== 'DRAFT') {
      return interaction.editReply({
        content: lang === 'pt' ? 'Nenhum rascunho editorial ativo encontrado neste tópico.' : 'No active editorial draft found in this thread.',
      });
    }

    if (draft.ownerId !== interaction.user.id) {
      return interaction.editReply({
        content: t('hyperfokus.addOnlyOwner', lang),
      });
    }

    const targetUser = interaction.options.getUser('user');
    if (!targetUser) {
      return interaction.editReply({ content: 'Usuário inválido.' });
    }

    if (targetUser.id === draft.ownerId || draft.collaborators.includes(targetUser.id)) {
      return interaction.editReply({
        content: t('hyperfokus.addAlready', lang, { user: targetUser.toString() }),
      });
    }

    draftStore.addCollaborator(threadId, targetUser.id);
    const embed = new EmbedBuilder()
      .setColor('#8B5CF6')
      .setTitle('👥  ✦  Novo Coautor Adicionado!')
      .setDescription(t('hyperfokus.addSuccess', lang, { user: targetUser.toString() }))
      .setFooter({ text: 'Pyxie Hyperfokus • Coautoria' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },

  async executePrefix({ message, args }) {
    const lang = getLanguage(message.guildId);
    if (!message.channel || !message.channel.isThread()) {
      return message.reply(
        lang === 'pt' ? 'Este comando só pode ser usado dentro de um tópico de hiperfoco.' : 'This command can only be used inside a hyperfocus thread.'
      );
    }

    const threadId = message.channelId;
    const draft = draftStore.getDraft(threadId);
    if (!draft || draft.status !== 'DRAFT') {
      return message.reply(
        lang === 'pt' ? 'Nenhum rascunho editorial ativo encontrado neste tópico.' : 'No active editorial draft found in this thread.'
      );
    }

    if (draft.ownerId !== message.author.id) {
      return message.reply(t('hyperfokus.addOnlyOwner', lang));
    }

    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply(
        lang === 'pt' ? 'Mencione um usuário: `py!add @usuario`' : 'Mention a user: `py!add @user`'
      );
    }

    if (targetUser.id === draft.ownerId || draft.collaborators.includes(targetUser.id)) {
      return message.reply(t('hyperfokus.addAlready', lang, { user: targetUser.toString() }));
    }

    draftStore.addCollaborator(threadId, targetUser.id);
    const embed = new EmbedBuilder()
      .setColor('#8B5CF6')
      .setTitle('👥  ✦  Novo Coautor Adicionado!')
      .setDescription(t('hyperfokus.addSuccess', lang, { user: targetUser.toString() }))
      .setFooter({ text: 'Pyxie Hyperfokus • Coautoria' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
