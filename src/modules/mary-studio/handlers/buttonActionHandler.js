const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const robloxHelper = require('../utils/robloxHelper');

class ButtonActionHandler {
  constructor() {
    this.manager = null;
  }

  init(manager) {
    this.manager = manager;

    if (this.manager.ctx?.registerListener) {
      this.manager.ctx.registerListener('interactionCreate', (interaction) => {
        this.handleInteraction(interaction);
      });
    }
  }

  async handleInteraction(interaction) {
    try {
      if (interaction.isButton() && interaction.customId.startsWith('mary_btn:')) {
        await this.handleButton(interaction);
      } else if (interaction.isModalSubmit() && interaction.customId.startsWith('mary_modal:')) {
        await this.handleModal(interaction);
      }
    } catch (err) {
      console.error('[ButtonActionHandler] Erro ao processar interação:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar esta ação. Tente novamente mais tarde.',
          ephemeral: true,
        }).catch(() => {});
      }
    }
  }

  async handleButton(interaction) {
    const parts = interaction.customId.split(':');
    const actionType = parts[1];
    const actionId = parts.slice(2).join(':');

    // 1. Calculadora 30% Roblox (Abre Modal)
    if (actionType === 'calculator' || actionId === 'calc') {
      const modal = new ModalBuilder()
        .setCustomId('mary_modal:calc')
        .setTitle('🧮 Calculadora de Taxa do Roblox (30%)');

      const robuxInput = new TextInputBuilder()
        .setCustomId('robux_amount')
        .setLabel('Quantos Robux você deseja receber na conta?')
        .setPlaceholder('Ex: 1000')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(8);

      const couponInput = new TextInputBuilder()
        .setCustomId('coupon_code')
        .setLabel('Possui cupom de desconto? (Opcional)')
        .setPlaceholder('Digite seu cupom aqui ou deixe em branco')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(robuxInput),
        new ActionRowBuilder().addComponents(couponInput)
      );

      return interaction.showModal(modal);
    }

    // 2. Verificador de Conta Roblox (Abre Modal)
    if (actionType === 'roblox_check') {
      const modal = new ModalBuilder()
        .setCustomId('mary_modal:roblox_check')
        .setTitle('🔍 Conferir Conta do Roblox');

      const userInput = new TextInputBuilder()
        .setCustomId('roblox_username')
        .setLabel('Qual o seu @nick no Roblox?')
        .setPlaceholder('Ex: Builderman')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(userInput));
      return interaction.showModal(modal);
    }

    // 3. Abrir Ticket
    if (actionType === 'ticket') {
      if (this.manager.ticketHandler?.openTicket) {
        return this.manager.ticketHandler.openTicket(interaction);
      }
      return interaction.reply({
        content: '🎫 Para realizar seu pedido, entre em contato direto com a Mary ou a equipe de atendimento.',
        ephemeral: true,
      });
    }

    // 4. Abrir Modal de Avaliação (ex: botão de vouch ou botão personalizado)
    if (actionType === 'open_review' || actionId === 'btn_vouch_review' || actionType === 'review') {
      if (this.manager.reviewHandler?.openReviewModal) {
        return this.manager.reviewHandler.openReviewModal(interaction);
      }
    }

    // 5. Auto-Cargo por Botão
    if (actionType === 'role') {
      const roleId = actionId;
      const member = interaction.member;
      if (!member || !member.roles) {
        return interaction.reply({ content: 'Não foi possível gerenciar seus cargos.', ephemeral: true });
      }

      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId).catch(() => {});
        return interaction.reply({ content: '🏷️ Cargo removido com sucesso!', ephemeral: true });
      } else {
        await member.roles.add(roleId).catch(() => {});
        return interaction.reply({ content: '🏷️ Cargo adicionado com sucesso!', ephemeral: true });
      }
    }

    // 5. Resposta com Imagem / Card Explicativo
    // Busca a definição do botão na mensagem salva
    const savedMessages = this.manager.loadMessages();
    let targetBtn = null;

    for (const record of Object.values(savedMessages.messages || {})) {
      if (Array.isArray(record.buttons)) {
        const found = record.buttons.find((b) => b.id === actionId || `btn_${actionId}` === b.id);
        if (found) {
          targetBtn = found;
          break;
        }
      }
    }

    if (targetBtn && (targetBtn.responseImageUrl || targetBtn.responseText)) {
      const embed = new EmbedBuilder().setColor('#ec4899');
      if (targetBtn.responseText) {
        embed.setDescription(this.manager.resolveVariables(targetBtn.responseText));
      }
      if (targetBtn.responseImageUrl) {
        embed.setImage(targetBtn.responseImageUrl);
      }
      embed.setFooter({ text: '🎀 Mary Store • Guia Exclusivo' });

      // Sub-botões
      let components = [];
      if (Array.isArray(targetBtn.subButtons) && targetBtn.subButtons.length > 0) {
        components = this.manager.buildActionRows(targetBtn.subButtons);
      }

      return interaction.reply({
        embeds: [embed],
        components,
        ephemeral: targetBtn.responseEphemeral !== false,
      });
    }

    // Fallback genérico se não achou configuração detalhada
    return interaction.reply({
      content: '✨ Você tocou em uma ação da lojinha da Mary!',
      ephemeral: true,
    });
  }

  async handleModal(interaction) {
    const parts = interaction.customId.split(':');
    const modalType = parts[1];

    if (modalType === 'calc') {
      const rawAmount = interaction.fields.getTextInputValue('robux_amount');
      const couponCode = interaction.fields.getTextInputValue('coupon_code')?.trim().toUpperCase();
      const amount = parseInt(rawAmount.replace(/\D/g, ''), 10);

      if (!amount || isNaN(amount) || amount <= 0) {
        return interaction.reply({
          content: '❌ Por favor, digite uma quantidade de Robux válida (apenas números).',
          ephemeral: true,
        });
      }

      const config = this.manager.loadConfig();
      const storeData = this.manager.loadStoreData();

      // Checa cupom
      let discountPercent = 0;
      let couponMsg = '';
      if (couponCode && storeData.coupons?.[couponCode]) {
        const cup = storeData.coupons[couponCode];
        if (!cup.validUntil || cup.validUntil > Date.now()) {
          discountPercent = cup.discountPercent || 0;
          couponMsg = `\n🎟️ **Cupom Aplicado:** \`${couponCode}\` (${discountPercent}% de desconto!)`;
        }
      }

      const gamepassCost = robloxHelper.calcRobuxGamepass(amount);
      const priceBRL = robloxHelper.calcPriceBRL(amount, config.preco1k || 37.0, discountPercent);

      const embed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('🧮・Resultado da Calculadora de 30% do Roblox')
        .setDescription([
          `Para receber exatamente **${amount.toLocaleString('pt-BR')} Robux** na sua conta:`,
          '',
          `💎 **Configure o valor da sua Gamepass para:** \`${gamepassCost.toLocaleString('pt-BR')} Robux\``,
          `*(O Roblox retém 30% e você recebe os ${amount.toLocaleString('pt-BR')} limpos!)*`,
          '',
          `💵 **Valor a pagar via PIX:** \`R$ ${priceBRL.toFixed(2).replace('.', ',')}\`${couponMsg}`,
          '',
          '📌 **Lembre-se:** Desative a opção de *Preços Regionais* na criação da Gamepass no site do Roblox!',
        ].join('\n'))
        .setFooter({ text: '🎀 Mary Store • Calculadora Automática' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('mary_btn:ticket:calc_buy')
          .setLabel('Fazer Este Pedido Agora')
          .setEmoji('🛒')
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    }

    if (modalType === 'roblox_check') {
      await interaction.deferReply({ ephemeral: true });
      const username = interaction.fields.getTextInputValue('roblox_username');
      const result = await robloxHelper.fetchRobloxUser(username);

      if (!result.success) {
        return interaction.editReply({
          content: `❌ ${result.error}`,
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle(`👤・Conta do Roblox: ${result.displayName} (@${result.name})`)
        .setDescription([
          `✅ **Usuário encontrado com sucesso!**`,
          `🆔 **ID do Roblox:** \`${result.id}\``,
          `🔗 **Perfil:** [Acessar Perfil](${result.profileUrl})`,
          `🎮 **Criações / Passes:** [Ver Inventário de Jogos](${result.creationsUrl})`,
          '',
          'Confira se a foto do avatar acima corresponde à sua conta antes de criar a Gamepass!',
        ].join('\n'))
        .setThumbnail(result.avatarUrl)
        .setFooter({ text: '🎀 Mary Store • Verificação de Segurança' });

      return interaction.editReply({ embeds: [embed] });
    }
  }
}

const instance = new ButtonActionHandler();
module.exports = instance;

