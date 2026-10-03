const { SlashCommandBuilder } = require('discord.js');
const pyInfoEvento = require('./pyInfoEvento');

module.exports = {
  name: 'infoeventos',
  category: 'economia',
  aliases: [
    'py-infoeventos',
    'pyinfoeventos',
  ],
  data: new SlashCommandBuilder()
    .setName('py-infoeventos')
    .setDescription('Complete guide, balance and rules for Cringelândia seasonal events.')
    .setDescriptionLocalizations({
      'pt-BR': 'Guia completo, saldo e regras dos eventos sazonais da Cringelândia.',
    }),
  buildInfoEventoView: pyInfoEvento.buildInfoEventoView,
  async executePrefix(ctx) {
    return pyInfoEvento.executePrefix(ctx);
  },
  async executeSlash(ctx) {
    return pyInfoEvento.executeSlash(ctx);
  },
};
