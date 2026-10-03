const { SlashCommandBuilder } = require('discord.js');
const pyInfoEvento = require('./pyInfoEvento');

module.exports = {
  name: 'evento',
  category: 'economia',
  aliases: [
    'py-evento',
    'pyevento',
    'eventos',
    'py-eventos',
    'pyeventos',
  ],
  data: new SlashCommandBuilder()
    .setName('py-evento')
    .setDescription('Quick access to Cringelândia seasonal event guide and status.')
    .setDescriptionLocalizations({
      'pt-BR': 'Acesso rápido ao guia e regras do evento sazonal da Cringelândia.',
    }),
  buildInfoEventoView: pyInfoEvento.buildInfoEventoView,
  async executePrefix(ctx) {
    return pyInfoEvento.executePrefix(ctx);
  },
  async executeSlash(ctx) {
    return pyInfoEvento.executeSlash(ctx);
  },
};
