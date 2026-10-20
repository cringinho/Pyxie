const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const securityGuard = require('../utils/securityGuard');
const { t } = require('../../../utils/i18n');

module.exports = {
  name: 'py-mary-edit-context',
  category: 'utilidades',
  data: new ContextMenuCommandBuilder()
    .setName('✏️ Editar na Pyxie')
    .setNameLocalizations({
      'pt-BR': '✏️ Editar na Pyxie',
      'en-US': "✏️ Edit in Pyxie",
      'en-GB': "✏️ Edit in Pyxie",
    })
    .setType(ApplicationCommandType.Message),

  async executeContext({ interaction }) {
    if (!securityGuard.isAuthorizedUser(interaction.user.id)) {
      return interaction.reply({
        content: t('mary.access_denied', interaction),
        ephemeral: true,
      });
    }

    const targetMessage = interaction.targetMessage;
    if (!targetMessage) {
      return interaction.reply({
        content: '❌ Mensagem alvo não encontrada.',
        ephemeral: true,
      });
    }

    const magic = securityGuard.createMagicLink(interaction.user.id, {
      editMessageId: targetMessage.id,
      channelId: targetMessage.channelId,
    });

    const embed = new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle('✏️・Editar Mensagem no Estúdio da Mary')
      .setDescription([
        `Você selecionou a mensagem \`${targetMessage.id}\` no canal <#${targetMessage.channelId}>.`,
        '',
        'Toque no botão abaixo para abrir seu Estúdio no navegador com esta mensagem pronta para alteração de texto, imagem e botões!',
      ].join('\n'))
      .setFooter({ text: '🎀 Mary Store • Edição Visual com 1 Clique' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('✏️ Abrir Editor no Navegador')
        .setStyle(ButtonStyle.Link)
        .setURL(magic.url)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
