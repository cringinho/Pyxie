const {
  checkGiveawaysLifecycle,
  handleGiveawayInteraction,
  clearDebounces,
} = require('./giveawayManager');

module.exports = {
  id: 'giveaways',
  name: 'Sorteios & Recompensas',
  description: 'Sistema completo de sorteios estilo Loritta com agendamento, restrições e apuração Fisher-Yates.',
  defaultEnabled: true,
  guildScope: null, // global
  handleInteraction: handleGiveawayInteraction,

  async onLoad(ctx) {
    // 1. Worker autônomo a cada 15 segundos (Zero Memory Leak)
    ctx.registerInterval(() => {
      checkGiveawaysLifecycle(ctx.client);
    }, 15000);

    // 2. Listener central para interações de sorteio ('gw:*')
    ctx.registerListener('interactionCreate', async (interaction) => {
      try {
        await handleGiveawayInteraction(interaction, ctx.client);
      } catch (err) {
        console.error('[GiveawaysModule] Erro ao processar interação:', err);
      }
    });
  },

  async onUnload() {
    clearDebounces();
  },
};
