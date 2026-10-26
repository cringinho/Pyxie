const pyBoss = require('./commands/pyBoss');
const store = require('./bossStore');

/**
 * Módulo Chefe da Semana (Cog Pattern): um guardião das Catacumbas sobe para cada servidor
 * toda segunda 00:00 BRT. Todo mundo bate junto (3 ataques por dia, postura certa contra o
 * plano do dia dobra o dano), com ranking de dano e recompensas modestas quando ele cai.
 * Estado em data/guildBoss.json. Faz parte do Mundo Pyxie (some no modo clássico).
 */
module.exports = {
  id: 'guildBoss',
  name: {
    'pt-BR': 'Chefe da Semana',
    en: 'Weekly Boss',
  },
  description: {
    'pt-BR': 'Chefe semanal por servidor: luta em grupo com ataques diários, ranking de dano e recompensas quando ele cai.',
    en: 'Weekly boss per server: group fight with daily attacks, damage ranking and rewards when it falls.',
  },
  category: 'economia',
  icon: '👹',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyBoss],

  async onLoad(ctx) {
    if (!ctx.client) return;
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyBoss.isBossInteraction(interaction)) return;
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      if (await require('../../commands/setup').denyInteractionIfBlocked(interaction, 'py-boss')) return;
      try {
        await pyBoss.handleBossInteraction(interaction);
      } catch (err) {
        console.error('[guildBoss] Erro ao processar interação:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('common.actionErrorShort', getLanguage(interaction)), flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    });
  },

  getStatus() {
    return store.getBossStats();
  },
};
