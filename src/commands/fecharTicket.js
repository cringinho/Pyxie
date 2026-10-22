const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { closeTicketByCommand } = require('../modules/tickets/ticketManager');
const { CLOSE_TICKET } = require('./commandNames');

const name = CLOSE_TICKET;

module.exports = {
  name,
  aliases: ['fechar', 'close', 'closeticket', 'fecharticket', 'ticket-close', 'py-fechar', 'py-close'],
  description: 'Closes the current ticket, sends the transcript and deletes the room (author or Staff).',

  data: new SlashCommandBuilder()
    .setName(name)
    .setNameLocalizations({
      'pt-BR': 'py-fechar',
    })
    .setDescription('Closes the current ticket, sends the transcript and deletes the room (author or Staff).')
    .setDescriptionLocalizations({
      'pt-BR': 'Encerra o atendimento atual, envia a transcrição e apaga a sala (autor ou Staff).',
    })
    .addStringOption((option) =>
      option
        .setName('reason')
        .setNameLocalizations({ 'pt-BR': 'motivo' })
        .setDescription('Optional reason recorded in the Staff log.')
        .setDescriptionLocalizations({ 'pt-BR': 'Motivo opcional registrado nos registros da Staff.' })
        .setMaxLength(500)
        .setRequired(false)
    ),

  async executePrefix({ message, args = [] }) {
    return closeTicketByCommand(message, args.join(' ').trim() || null);
  },

  async executeSlash({ interaction }) {
    return closeTicketByCommand(interaction, interaction.options.getString('reason'));
  },
};
