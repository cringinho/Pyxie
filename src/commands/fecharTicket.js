const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { closeTicketByCommand } = require('../modules/tickets/ticketManager');
const { CLOSE_TICKET } = require('./commandNames');

const name = CLOSE_TICKET;

module.exports = {
  name,
  aliases: ['fechar', 'close', 'closeticket', 'fecharticket', 'ticket-close', 'py-fechar', 'py-close'],
  description: 'Closes the current ticket channel and schedules deletion (Staff only).',

  data: new SlashCommandBuilder()
    .setName(name)
    .setNameLocalizations({
      'pt-BR': 'py-fechar',
    })
    .setDescription('Closes the current ticket channel and schedules deletion (Staff only).')
    .setDescriptionLocalizations({
      'pt-BR': 'Encerra o atendimento do ticket atual e agenda a exclusão do canal (Apenas Staff).',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executePrefix({ message }) {
    return closeTicketByCommand(message);
  },

  async executeSlash({ interaction }) {
    return closeTicketByCommand(interaction);
  },
};

