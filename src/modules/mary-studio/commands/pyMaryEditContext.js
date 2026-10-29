const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const securityGuard = require('../utils/securityGuard');
const maryDashboard = require('../maryDashboard');
const { t } = require('../../../utils/i18n');

module.exports = {
  // Zona da Mary (plano 5.1): registrado e usado só no servidor dela.
  guildScope: [require('../../../config/scopes').MARY_GUILD_ID],
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

  // Leva a mensagem para o estúdio do painel (ou acha a que já está lá) e manda o link da tela de edição.
  async executeContext({ interaction }) {
    if (!securityGuard.isAuthorizedUser(interaction.user.id)) {
      return interaction.reply({ content: t('mary.access_denied', interaction), ephemeral: true });
    }

    const targetMessage = interaction.targetMessage;
    if (!targetMessage || !interaction.guildId) {
      return interaction.reply({ content: t('mary.edit_not_found', interaction), ephemeral: true });
    }
    if (targetMessage.author?.id !== interaction.client.user.id || targetMessage.webhookId) {
      return interaction.reply({ content: t('mary.edit_not_mine', interaction), ephemeral: true });
    }

    let result;
    try {
      result = maryDashboard.importDiscordMessage(interaction.guildId, targetMessage);
    } catch (err) {
      console.error('[MaryStudio] Falha ao levar a mensagem para o estúdio:', err);
      result = { ok: false, error: 'failed' };
    }
    if (!result.ok) {
      const key = result.error === 'unsupported_buttons' ? 'mary.edit_unsupported' : 'mary.edit_failed';
      return interaction.reply({ content: t(key, interaction), ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle(t('mary.edit_title', interaction))
      .setDescription(t('mary.edit_desc', interaction, { id: targetMessage.id, channel: `<#${targetMessage.channelId}>` }))
      .setFooter({ text: t('mary.footer', interaction) });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(t('mary.btn_open_web', interaction))
        .setEmoji('✏️')
        .setStyle(ButtonStyle.Link)
        .setURL(maryDashboard.dashboardUrl(interaction.guildId, 'studio', result.id))
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
