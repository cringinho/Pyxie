const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const securityGuard = require('../utils/securityGuard');
const robloxHelper = require('../utils/robloxHelper');

class TicketHandler {
  constructor() {
    this.manager = null;
  }

  init(manager) {
    this.manager = manager;

    if (this.manager.ctx?.registerListener) {
      this.manager.ctx.registerListener('interactionCreate', (interaction) => {
        if (interaction.isButton() && interaction.customId.startsWith('mary_ticket:')) {
          this.handleTicketButton(interaction);
        }
      });
    }
  }

  async openTicket(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({ content: 'Tickets só podem ser abertos dentro do servidor.', ephemeral: true });
    }

    const config = this.manager.loadConfig();
    if (!config.featureFlags?.ticketModule) {
      return interaction.reply({
        content: '💬 O sistema de tickets está temporariamente desativado no painel. Chame a Mary diretamente!',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    const sanitizedName = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'cliente';
    const channelName = `🛒・compra-${sanitizedName}`;

    // Checa se já tem ticket aberto
    const existingChannel = guild.channels.cache.find(
      (c) => c.name === channelName && c.type === ChannelType.GuildText
    );
    if (existingChannel) {
      return interaction.editReply({
        content: `Você já possui um canal de atendimento aberto: <#${existingChannel.id}>`,
      });
    }

    // Configura permissões
    const permissionOverwrites = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: securityGuard.MARY_DISCORD_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ManageMessages,
        ],
      },
    ];

    if (guild.members.me) {
      permissionOverwrites.push({
        id: guild.members.me.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ManageChannels,
        ],
      });
    }

    try {
      const parentCategory = config.channelTickets || null;
      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: parentCategory,
        permissionOverwrites,
        topic: `Ticket de compra de ${interaction.user.tag} (ID: ${interaction.user.id})`,
      });

      // Salva no banco de tickets
      const storeData = this.manager.loadStoreData();
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      storeData.tickets[ticketId] = {
        id: ticketId,
        channelId: ticketChannel.id,
        customerId: interaction.user.id,
        customerTag: interaction.user.tag,
        status: 'open',
        createdAt: Date.now(),
      };
      this.manager.saveStoreData(storeData);

      // Monta embed inicial do ticket
      const initialEmbed = new EmbedBuilder()
        .setColor('#ec4899')
        .setTitle('🎀・Central de Pedido • Mary Store')
        .setDescription([
          `Olá, <@${interaction.user.id}>! Seja bem-vindo(a) ao seu canal privado de compra!`,
          '',
          'Por favor, envie aqui:',
          '1. **Quantos Robux** você deseja comprar;',
          '2. O link da sua **Gamepass** ou seu **@nick do Roblox**;',
          '3. O comprovante do PIX assim que efetuar o pagamento.',
          '',
          'A Mary ou alguém da equipe já foi notificada e atenderá você em breve!',
        ].join('\n'))
        .setFooter({ text: '🎀 Mary Store • Pedido Seguro' })
        .setTimestamp();

      // Painel PIX se configurado
      let pixContent = '';
      if (config.pixKey) {
        const pixPayload = robloxHelper.generatePixPayload({
          key: config.pixKey,
          name: config.pixName || 'MARY STORE',
          city: config.pixCity || 'SAO PAULO',
        });
        if (pixPayload) {
          pixContent = `\n🔑 **Chave PIX da Loja:** \`${config.pixKey}\`\n📋 **Código Copia-e-Cola:**\n\`\`\`${pixPayload}\`\`\``;
          initialEmbed.addFields({
            name: '💳 Dados para Pagamento PIX',
            value: pixContent,
            inline: false,
          });
        }
      }

      // Linhas de Ações do Ticket (Macros para a Mary e ações para o cliente)
      const maryMacroRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`mary_ticket:macro:saudacao:${ticketId}`)
          .setLabel('👋 Já Estou Conferindo')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`mary_ticket:macro:pendente:${ticketId}`)
          .setLabel('⏳ Robux Comprados')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`mary_ticket:macro:regional:${ticketId}`)
          .setLabel('📸 Preços Regionais')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`mary_ticket:confirm_pay:${ticketId}`)
          .setLabel('✅ Pago')
          .setStyle(ButtonStyle.Success)
      );

      const maryMacroRow2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`mary_ticket:deliver:${ticketId}`)
          .setLabel('💎 Robux Entregues (Baixa Estoque)')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`mary_ticket:request_review:${ticketId}`)
          .setLabel('⭐ Pedir Avaliação')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`mary_ticket:close:${ticketId}`)
          .setLabel('🔒 Fechar Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `<@${interaction.user.id}> <@${securityGuard.MARY_DISCORD_ID}>`,
        embeds: [initialEmbed],
        components: [maryMacroRow1, maryMacroRow2],
      });

      return interaction.editReply({
        content: `✅ Seu ticket foi aberto com sucesso! Clique aqui para acessar: <#${ticketChannel.id}>`,
      });
    } catch (err) {
      console.error('[TicketHandler] Erro ao criar ticket:', err);
      return interaction.editReply({
        content: '❌ Ocorreu um erro ao criar a sala de atendimento. Avise a Mary no canal geral!',
      });
    }
  }

  async handleTicketButton(interaction) {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const subAction = parts[2];
    const ticketId = parts[3] || parts[2];

    const isStaff = securityGuard.isAuthorizedUser(interaction.user.id);

    // 1. Macros exclusivas da Mary
    if (action === 'macro') {
      if (!isStaff) {
        return interaction.reply({
          content: '🔒 Apenas a Mary e a equipe de atendimento podem utilizar as respostas rápidas.',
          ephemeral: true,
        });
      }

      if (subAction === 'saudacao') {
        return interaction.reply({
          content: '👋 Olá! Seja muito bem-vindo(a) à Mary Store! Já estou verificando seu pedido, um momentinho por favor.',
        });
      }
      if (subAction === 'pendente') {
        return interaction.reply({
          content: '⏳ **Seus Robux já foram comprados na sua Gamepass!**\nVocê pode conferir em tempo real em: https://www.roblox.com/transactions\n*(O Roblox deixa o saldo como pendente durante o prazo de 5 dias corridos).*',
        });
      }
      if (subAction === 'regional') {
        return interaction.reply({
          content: '📸 **Importante:** certifique-se de que a opção de **Preços Regionais** foi desmarcada na sua Gamepass no Roblox para que o valor em Robux não seja alterado!',
        });
      }
    }

    // 2. Confirmação de Pagamento
    if (action === 'confirm_pay') {
      if (!isStaff) {
        return interaction.reply({ content: '🔒 Apenas a equipe pode confirmar pagamentos.', ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('✅ Pagamento Confirmado com Sucesso!')
        .setDescription('Seu pagamento foi localizado em nosso sistema. Estamos efetuando a compra dos seus Robux agora mesmo!')
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    // 3. Robux Entregues
    if (action === 'deliver') {
      if (!isStaff) {
        return interaction.reply({ content: '🔒 Apenas a Mary pode confirmar a entrega.', ephemeral: true });
      }

      const config = this.manager.loadConfig();
      const storeData = this.manager.loadStoreData();
      const ticket = storeData.tickets[ticketId];

      // Entrega cargo @Cliente se configurado
      if (ticket?.customerId && config.roleClient && interaction.guild) {
        const member = await interaction.guild.members.fetch(ticket.customerId).catch(() => null);
        if (member && member.roles) {
          await member.roles.add(config.roleClient).catch(() => {});
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('🎉・Entrega Concluída!')
        .setDescription([
          'Seus Robux foram enviados com sucesso! Muito obrigado pela preferência e confiança na Mary Store.',
          '',
          '⭐ Se puder nos avaliar no canal de avaliações, você nos ajuda muito a crescer!',
        ].join('\n'))
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // 4. Pedir Avaliação
    if (action === 'request_review') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('mary_review:open_modal')
          .setLabel('⭐ Deixar Minha Avaliação')
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        content: '🌟 **Gostou do nosso atendimento?** Clique no botão abaixo para deixar seu feedback e avaliação de 1 a 5 estrelas:',
        components: [row],
      });
    }

    // 5. Fechar Ticket
    if (action === 'close') {
      await interaction.reply({ content: '🔒 O ticket foi encerrado e este canal será excluído em 5 segundos...' });
      const storeData = this.manager.loadStoreData();
      if (storeData.tickets[ticketId]) {
        storeData.tickets[ticketId].status = 'closed';
        storeData.tickets[ticketId].closedAt = Date.now();
        this.manager.saveStoreData(storeData);
      }

      setTimeout(() => {
        interaction.channel?.delete('Ticket encerrado pela Mary Store').catch(() => {});
      }, 5000);
    }
  }
}

const instance = new TicketHandler();
module.exports = instance;
