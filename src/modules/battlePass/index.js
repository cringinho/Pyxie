const pyPass = require('./commands/pyPass');
const battlePass = require('../../services/battlePass');
const payments = require('../../services/passPayments');

/**
 * Módulo Passe da Pyxie (Cog Pattern): temporada mensal de 50 níveis gerada sozinha, XP das
 * atividades do bot, trilha grátis e Premium (Mercado Pago / PayPal). Estado em
 * data/battlePass.json; rotas de pagamento e a página /passe ficam no server.js.
 */
module.exports = {
  id: 'battlePass',
  // Exclusivo do servidor oficial (plano D5): comandos registrados só em CRINGELANDIA_GUILD_ID.
  guildScope: [require('../../config/scopes').CRINGELANDIA_GUILD_ID],
  name: {
    'pt-BR': 'Passe da Pyxie',
    en: 'Pyxie Pass',
  },
  description: {
    'pt-BR': 'Passe mensal com 50 níveis, trilha grátis e Premium, pet e título míticos exclusivos de cada mês.',
    en: 'Monthly pass with 50 levels, free and Premium tracks, and a mythic pet and title unique to each month.',
  },
  category: 'economia',
  icon: '💎',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyPass],

  async onLoad(ctx) {
    if (!ctx.client) return;
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyPass.isPassInteraction(interaction)) return;
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      try {
        await pyPass.handlePassInteraction(interaction);
      } catch (err) {
        console.error('[battlePass] Erro ao processar interação:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('pass.error', getLanguage(interaction)), flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    });
  },

  getStatus() {
    return { ...battlePass.getPassStats(), providers: payments.providers() };
  },
};
