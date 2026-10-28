// Atividade do servidor: conta mensagens, entradas, saídas e comandos por dia para o painel.
// Só números: nada de conteúdo nem de quem mandou. Grava em lote a cada 5 minutos.
const activity = require('../../services/guildActivity');

const FLUSH_MS = 5 * 60 * 1000;

module.exports = {
  id: 'activity-stats',
  name: { 'pt-BR': 'Atividade do Servidor', en: 'Server Activity' },
  description: {
    'pt-BR': 'Conta mensagens, entradas, saídas e comandos por dia para mostrar no painel. Só números, sem conteúdo nem nomes.',
    en: 'Counts messages, joins, leaves and commands per day for the dashboard. Numbers only, no content or names.',
  },
  icon: '📊',
  defaultEnabled: true,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('messageCreate', (message) => {
      if (!message.guildId || message.author?.bot) return;
      activity.bump(message.guildId, 'messages');
      if (/^py!/i.test(message.content || '')) activity.bump(message.guildId, 'commands');
    });
    ctx.registerListener('guildMemberAdd', (member) => activity.bump(member.guild.id, 'joins'));
    ctx.registerListener('guildMemberRemove', (member) => activity.bump(member.guild.id, 'leaves'));
    ctx.registerListener('interactionCreate', (interaction) => {
      if (interaction.guildId && interaction.isChatInputCommand?.()) activity.bump(interaction.guildId, 'commands');
    });
    ctx.registerInterval(() => {
      try {
        activity.flush();
      } catch (err) {
        console.error('[ActivityStats] Erro ao gravar contagens:', err);
      }
    }, FLUSH_MS);
  },

  async onUnload() {
    try {
      activity.flush();
    } catch (_) {}
  },
};
