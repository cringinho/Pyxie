const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { closeTicketByCommand } = require('../modules/tickets/ticketManager');

const name = 'py-fechar';

module.exports = {
  name,
  aliases: ['fechar', 'close', 'closeticket', 'fecharticket', 'ticket-close', 'py-close'],
  description: 'Encerra o atendimento do ticket atual e agenda a exclusão do canal (Apenas Staff).',

  data: new SlashCommandBuilder()
    .setName(name)
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

