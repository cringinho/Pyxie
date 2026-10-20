const maryStudioManager = require('./maryStudioManager');
const buttonActionHandler = require('./handlers/buttonActionHandler');
const ticketHandler = require('./handlers/ticketHandler');
const reviewHandler = require('./handlers/reviewHandler');
const stickyAndFaqHandler = require('./handlers/stickyAndFaqHandler');
const giveawayHandler = require('./handlers/giveawayHandler');
const pyMaryStudioCmd = require('./commands/pyMaryStudio');
const pyMaryEditContextCmd = require('./commands/pyMaryEditContext');
const securityGuard = require('./utils/securityGuard');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  id: 'mary-studio',
  name: {
    'pt-BR': 'Estúdio & Central da Mary',
    en: "Mary's Studio & Hub",
  },
  description: {
    'pt-BR': 'Painel visual de embeds e central de lojinha de Robux para a Mary.',
    en: "Visual embed studio and Robux store hub for Mary.",
  },
  category: 'utilidades',
  icon: '🎀',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyMaryStudioCmd, pyMaryEditContextCmd],

  async onLoad(ctx) {
    maryStudioManager.buttonActionHandler = buttonActionHandler;
    maryStudioManager.ticketHandler = ticketHandler;
    maryStudioManager.reviewHandler = reviewHandler;
    maryStudioManager.stickyAndFaqHandler = stickyAndFaqHandler;
    maryStudioManager.giveawayHandler = giveawayHandler;

    maryStudioManager.init(ctx.client || null, ctx);

    // Registra listener para os botões rápidos do /py-mary
    if (typeof ctx.registerListener === 'function') {
      ctx.registerListener('interactionCreate', async (interaction) => {
        try {
          // 1. Botões rápidos
          if (interaction.isButton() && interaction.customId.startsWith('mary_quick:')) {
            if (!securityGuard.isAuthorizedUser(interaction.user.id)) {
              return interaction.reply({
                content: '🔒 Acesso negado. Apenas a Mary pode executar estas ações rápidas.',
                ephemeral: true,
              });
            }

            const action = interaction.customId.replace('mary_quick:', '');

            // Alternar status da loja (online -> fila -> offline -> online)
            if (action === 'status') {
              const cfg = maryStudioManager.loadConfig();
              let nextStatus = 'fila';
              if (cfg.statusLoja === 'fila') nextStatus = 'offline';
              else if (cfg.statusLoja === 'offline') nextStatus = 'online';
              else nextStatus = 'fila';

              cfg.statusLoja = nextStatus;
              maryStudioManager.saveConfig(cfg);

              let badge = '🟢 Online';
              if (nextStatus === 'fila') badge = '🟡 Fila de Pedidos';
              if (nextStatus === 'offline') badge = '🔴 Offline / Fechada';

              return interaction.reply({
                content: `🔄 **Status da lojinha atualizado para:** \`${badge}\`!`,
                ephemeral: true,
              });
            }

            // Modal de Estoque e Preço Rápido
            if (action === 'stock_modal') {
              const cfg = maryStudioManager.loadConfig();
              const modal = new ModalBuilder()
                .setCustomId('mary_quick_modal:stock')
                .setTitle('💎 Atualizar Estoque & Preço');

              const stockInput = new TextInputBuilder()
                .setCustomId('stock_val')
                .setLabel('Quantidade em Estoque (Robux):')
                .setValue(String(cfg.estoqueRobux || 25000))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

              const priceInput = new TextInputBuilder()
                .setCustomId('price_val')
                .setLabel('Preço de 1.000 Robux em R$:')
                .setValue(String(cfg.preco1k || 37.0))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

              modal.addComponents(
                new ActionRowBuilder().addComponents(stockInput),
                new ActionRowBuilder().addComponents(priceInput)
              );

              return interaction.showModal(modal);
            }

            // Desconectar todos os aparelhos
            if (action === 'logout_all') {
              const result = securityGuard.revokeAllSessions();
              return interaction.reply({
                content: `🚨 **Pronto!** Todas as sessões ativas (${result.count}) foram desconectadas por segurança.`,
                ephemeral: true,
              });
            }

            // Fixar atalho na DM
            if (action === 'send_dm') {
              const magic = securityGuard.createMagicLink(interaction.user.id);
              const dmEmbed = new EmbedBuilder()
                .setColor('#ec4899')
                .setTitle('🎀・Atalho Permanente • Estúdio da Mary')
                .setDescription([
                  'Guarde esta mensagem aqui no seu privado!',
                  'Sempre que quiser entrar no seu painel pelo celular ou PC, use o botão abaixo para entrar direto sem senha:',
                ].join('\n'))
                .setFooter({ text: '🎀 Mary Store • Atalho Seguro' });

              const dmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel('🌐 Entrar no Meu Estúdio')
                  .setStyle(ButtonStyle.Link)
                  .setURL(magic.url)
              );

              await interaction.user.send({ embeds: [dmEmbed], components: [dmRow] }).catch(() => {});
              return interaction.reply({
                content: '📩 **Atalho enviado na sua DM!** Dê uma olhadinha no seu privado.',
                ephemeral: true,
              });
            }
          }

          // 2. Modais rápidos
          if (interaction.isModalSubmit() && interaction.customId === 'mary_quick_modal:stock') {
            if (!securityGuard.isAuthorizedUser(interaction.user.id)) {
              return interaction.reply({ content: '🔒 Acesso negado.', ephemeral: true });
            }

            const rawStock = interaction.fields.getTextInputValue('stock_val');
            const rawPrice = interaction.fields.getTextInputValue('price_val');

            const stockNum = parseInt(rawStock.replace(/\D/g, ''), 10) || 0;
            const priceNum = parseFloat(rawPrice.replace(',', '.')) || 37.0;

            const cfg = maryStudioManager.loadConfig();
            cfg.estoqueRobux = stockNum;
            cfg.preco1k = priceNum;
            maryStudioManager.saveConfig(cfg);

            return interaction.reply({
              content: `💎 **Estoque e Cotação atualizados com sucesso!**\n• Estoque: \`${stockNum.toLocaleString('pt-BR')} Robux\`\n• Preço 1k: \`R$ ${priceNum.toFixed(2).replace('.', ',')}\``,
              ephemeral: true,
            });
          }
        } catch (e) {
          console.error('[MaryStudio] Erro na interação rápida:', e);
        }
      });
    }
  },

  async onUnload() {
    maryStudioManager.stop();
  },

  setupWebRoutes(app, ctx) {
    maryStudioManager.setupWebRoutes(app, ctx);
  },
};
