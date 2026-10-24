const pyDungeon = require('./commands/pyDungeon');
const store = require('./dungeonStore');

/**
 * Módulo Catacumbas de Veludo (Cog Pattern): dungeon crawler roguelike da Pyxie.
 *
 * - Ticket de 50 moedinhas, 5 andares procedurais, guardiões e a chefe final Nyx.
 * - Cada descida num servidor ganha uma thread própria; parada por 20 minutos vira game over
 *   com resumo por DM. Rankings de sempre, da semana e do servidor.
 * - Combate por turnos com intenções telegrafadas, luz de vela e fuga com tesouro.
 * - Meta-progressão por Ecos (talentos permanentes, nunca convertidos em moedinhas).
 * - Tetos de pagamento e limite diário ajustáveis em data/modulesConfig.json (modules.dungeon.data)
 *   ou na aba Módulos do /admin.
 */
module.exports = {
  id: 'dungeon',
  name: {
    'pt-BR': 'Catacumbas de Veludo',
    en: 'Velvet Catacombs',
  },
  description: {
    'pt-BR': 'Dungeon crawler roguelike: 5 andares, guardiões, luz de vela, bênçãos, talentos e fuga com o tesouro.',
    en: 'Roguelike dungeon crawler: 5 floors, guardians, candlelight, blessings, talents and escaping with the treasure.',
  },
  category: 'economia',
  icon: '🕯️',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyDungeon],

  async onLoad(ctx) {
    if (!ctx.client) return;

    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!pyDungeon.isDungeonInteraction(interaction)) return;
      // A Blacklist Global já é respondida pelo handler principal do index.js
      const { isBlacklisted } = require('../../services/trustAndSafety');
      if (isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id }).blacklisted) return;
      // Servidor no modo clássico ou canal não liberado no /py-setup
      if (await require('../../commands/setup').denyInteractionIfBlocked(interaction, 'py-dungeon')) return;
      try {
        await pyDungeon.handleDungeonInteraction(interaction);
      } catch (err) {
        console.error('[dungeon] Erro ao processar interação:', err);
        const { t, getLanguage } = require('../../utils/i18n');
        const payload = { content: t('dungeon.errors.save', getLanguage(interaction)), flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    });

    // Game over por inatividade: aviso na thread, resumo por DM e thread fechada (a cada minuto)
    let sweeping = false;
    ctx.registerInterval(async () => {
      if (sweeping) return;
      sweeping = true;
      try {
        await require('./dungeonIdle').sweep(ctx.client);
      } catch (err) {
        console.warn('[dungeon] Falha ao fechar descidas paradas:', err.message);
      } finally {
        sweeping = false;
      }
    }, 60 * 1000);

    // Aquece o cache de sprites para o primeiro clique não pagar o carregamento dos assets
    ctx.registerTimeout(async () => {
      try {
        const engine = require('./dungeonEngine');
        const { renderDungeonScene } = require('./dungeonRenderer');
        await renderDungeonScene(engine.createRun({ ownerId: 'warmup', seed: 1 }), { lang: 'pt', text: {} });
      } catch (err) {
        console.warn('[dungeon] Aquecimento do renderizador falhou:', err.message);
      }
    }, 1500);
  },

  getStatus() {
    return store.getDungeonStats();
  },
};
