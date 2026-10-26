const pyFestival = require('./commands/pyFestival');
const festival = require('../../services/festival');

/**
 * Módulo Festival (Cog Pattern): temporadas globais pelo calendário com as Fagulhas, monstros
 * fantasiados na dungeon, drop no /py-work e caixas temáticas com chances públicas e garantia.
 * Faz parte do Mundo Pyxie (some no modo clássico). Estado em data/festival.json.
 */
module.exports = {
  id: 'festival',
  name: {
    'pt-BR': 'Festival da Temporada',
    en: 'Seasonal Festival',
  },
  description: {
    'pt-BR': 'Temporadas globais com Fagulhas, monstros fantasiados, caixas temáticas e itens por tempo limitado.',
    en: 'Global seasons with Sparks, costumed monsters, themed boxes and limited-time items.',
  },
  category: 'economia',
  icon: '🎇',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyFestival],

  async onLoad(ctx) {
    if (!ctx.client) return;
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyFestival.isFestivalInteraction(interaction)) return;
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      if (await require('../../commands/setup').denyInteractionIfBlocked(interaction, 'py-festival')) return;
      try {
        await pyFestival.handleFestivalInteraction(interaction);
      } catch (err) {
        console.error('[festival] Erro ao processar interação:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('festival.reasons.save', getLanguage(interaction)), flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    });
  },

  getStatus() {
    return festival.getFestivalStats();
  },
};
