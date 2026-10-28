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
      // Emojis do próprio servidor usados na mensagem (só conta os que pertencem a ele).
      const own = message.guild?.emojis?.cache;
      if (own?.size) for (const [, id] of String(message.content || '').matchAll(/<a?:\w{2,32}:(\d{17,20})>/g)) if (own.has(id)) activity.bumpEmoji(message.guildId, id);
      if (/^py!/i.test(message.content || '')) activity.bump(message.guildId, 'commands');
    });
    ctx.registerListener('guildMemberAdd', (member) => activity.bump(member.guild.id, 'joins'));
    ctx.registerListener('messageReactionAdd', (reaction, user) => {
      const guild = reaction.message?.guild;
      if (!guild || user?.bot || !reaction.emoji?.id || !guild.emojis.cache.has(reaction.emoji.id)) return;
      activity.bumpEmoji(guild.id, reaction.emoji.id);
    });
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
