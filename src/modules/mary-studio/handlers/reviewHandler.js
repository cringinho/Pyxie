const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require('discord.js');

class ReviewHandler {
  constructor() {
    this.manager = null;
  }

  init(manager) {
    this.manager = manager;

    if (this.manager.ctx?.registerListener) {
      this.manager.ctx.registerListener('interactionCreate', (interaction) => {
        if (interaction.isButton() && interaction.customId === 'mary_review:open_modal') {
          this.openReviewModal(interaction);
        } else if (interaction.isModalSubmit() && interaction.customId === 'mary_modal:review') {
          this.handleReviewSubmit(interaction);
        }
      });
    }
  }

  async openReviewModal(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('mary_modal:review')
      .setTitle('⭐ Avaliar Atendimento • Mary Store');

    const starsInput = new TextInputBuilder()
      .setCustomId('review_stars')
      .setLabel('De 1 a 5 estrelas, qual nota você dá?')
      .setPlaceholder('Digite um número de 1 a 5')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(1);

    const commentInput = new TextInputBuilder()
      .setCustomId('review_comment')
      .setLabel('Deixe seu depoimento sobre a compra:')
      .setPlaceholder('Ex: Chegou super rápido e fui muito bem atendido!')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(500);

    const proofInput = new TextInputBuilder()
      .setCustomId('review_proof')
      .setLabel('Link do print dos Robux pendentes (Opcional):')
      .setPlaceholder('Cole o link da imagem aqui')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(starsInput),
      new ActionRowBuilder().addComponents(commentInput),
      new ActionRowBuilder().addComponents(proofInput)
    );

    return interaction.showModal(modal);
  }

  async handleReviewSubmit(interaction) {
    const rawStars = interaction.fields.getTextInputValue('review_stars');
    const comment = interaction.fields.getTextInputValue('review_comment');
    const proofUrl = interaction.fields.getTextInputValue('review_proof')?.trim() || '';

    const starsNum = Math.max(1, Math.min(5, parseInt(rawStars, 10) || 5));
    const starString = '⭐'.repeat(starsNum);

    const storeData = this.manager.loadStoreData();
    storeData.reviews = storeData.reviews || [];

    const reviewIndex = storeData.reviews.length + 1;
    const reviewRecord = {
      id: `rev_${Date.now()}`,
      index: reviewIndex,
      customerId: interaction.user.id,
      customerTag: interaction.user.tag,
      stars: starsNum,
      comment,
      proofUrl,
      createdAt: Date.now(),
    };

    storeData.reviews.push(reviewRecord);
    this.manager.saveStoreData(storeData);

    const config = this.manager.loadConfig();

    // Se houver canal de avaliações configurado, posta o card oficial
    if (config.channelReviews && interaction.guild) {
      const channel = await interaction.guild.channels.fetch(config.channelReviews).catch(() => null);
      if (channel && typeof channel.send === 'function') {
        const sum = storeData.reviews.reduce((acc, r) => acc + (Number(r.stars) || 5), 0);
        const avg = (sum / storeData.reviews.length).toFixed(1);

        const embed = new EmbedBuilder()
          .setColor('#f59e0b')
          .setTitle(`⭐・Avaliação #${reviewIndex} da Mary Store`)
          .setDescription([
            `👤 **Cliente:** <@${interaction.user.id}> (\`${interaction.user.tag}\`)`,
            `🌟 **Nota:** ${starString} **(${starsNum}/5)**`,
            '',
            `💬 **Depoimento:**`,
            `> "${comment}"`,
          ].join('\n'))
          .setFooter({
            text: `Mary Store • Total: ${storeData.reviews.length} avaliações • Média Geral: ${avg} ⭐`,
          })
          .setTimestamp();

        if (proofUrl && proofUrl.startsWith('http')) {
          embed.setImage(proofUrl);
        }

        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    return interaction.reply({
      content: `🎉 **Muito obrigado pela sua avaliação!** Sua nota ${starString} foi registrada com sucesso!`,
      ephemeral: true,
    });
  }
}

const instance = new ReviewHandler();
module.exports = instance;

