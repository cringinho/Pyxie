const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

class GiveawayHandler {
  constructor() {
    this.manager = null;
  }

  init(manager) {
    this.manager = manager;

    if (this.manager.ctx?.registerListener) {
      this.manager.ctx.registerListener('interactionCreate', (interaction) => {
        if (interaction.isButton() && interaction.customId.startsWith('mary_giveaway:')) {
          this.handleGiveawayButton(interaction);
        }
      });
    }

    if (this.manager.ctx?.registerInterval) {
      this.manager.ctx.registerInterval(() => {
        this.checkExpiredGiveaways();
      }, 30 * 1000); // Checa a cada 30 segundos
    }
  }

  // post(channelId, body): envio pelo REST quando quem chama é o site (o painel não tem o cliente do bot).
  async createGiveaway({ channelId, prize, durationMinutes = 60, winnersCount = 1 }, { post = null } = {}) {
    let channel = null;
    if (!post) {
      if (!this.manager.client) throw new Error('Cliente Discord offline.');
      channel = await this.manager.client.channels.fetch(channelId).catch(() => null);
      if (!channel || typeof channel.send !== 'function') {
        throw new Error('Canal de sorteio não encontrado.');
      }
    }

    const durationMs = (Number(durationMinutes) || 60) * 60 * 1000;
    const endsAt = Date.now() + durationMs;
    const giveawayId = `gw_${Date.now()}`;

    const embed = new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle('🎉・SORTEIO DE ROBUX DA MARY STORE!')
      .setDescription([
        `🎁 **Prêmio:** **${prize}**`,
        `🏆 **Ganhadores:** ${winnersCount}`,
        `⏳ **Encerra em:** <t:${Math.floor(endsAt / 1000)}:R>`,
        '',
        '👉 Clique no botão abaixo para garantir seu bilhete da sorte!',
      ].join('\n'))
      .setFooter({ text: 'Mary Store • Boa sorte a todos!' })
      .setTimestamp(new Date(endsAt));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`mary_giveaway:enter:${giveawayId}`)
        .setLabel('🎉 Participar (0)')
        .setStyle(ButtonStyle.Success)
    );

    const message = post
      ? await post(channelId, { embeds: [embed.toJSON()], components: [row.toJSON()], allowed_mentions: { parse: [] } })
      : await channel.send({ embeds: [embed], components: [row] });

    const storeData = this.manager.loadStoreData();
    storeData.giveaways[giveawayId] = {
      id: giveawayId,
      channelId,
      messageId: message.id,
      prize,
      endsAt,
      winnersCount: Number(winnersCount) || 1,
      participants: [],
      ended: false,
      winners: [],
    };
    this.manager.saveStoreData(storeData);

    return { success: true, giveawayId, messageId: message.id };
  }

  async handleGiveawayButton(interaction) {
    const parts = interaction.customId.split(':');
    const giveawayId = parts[2];

    const storeData = this.manager.loadStoreData();
    const giveaway = storeData.giveaways[giveawayId];

    if (!giveaway || giveaway.ended) {
      return interaction.reply({ content: '❌ Este sorteio já foi encerrado!', ephemeral: true });
    }

    giveaway.participants = giveaway.participants || [];
    const userId = interaction.user.id;

    if (giveaway.participants.includes(userId)) {
      giveaway.participants = giveaway.participants.filter((id) => id !== userId);
      this.manager.saveStoreData(storeData);
      await this.updateGiveawayMessage(giveaway);
      return interaction.reply({ content: '❌ Você removeu sua participação deste sorteio.', ephemeral: true });
    } else {
      giveaway.participants.push(userId);
      this.manager.saveStoreData(storeData);
      await this.updateGiveawayMessage(giveaway);
      return interaction.reply({ content: '🎉 Parabéns! Você está participando do sorteio!', ephemeral: true });
    }
  }

  async updateGiveawayMessage(giveaway) {
    if (!this.manager.client) return;
    const channel = await this.manager.client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return;
    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!message) return;

    const count = giveaway.participants.length;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`mary_giveaway:enter:${giveaway.id}`)
        .setLabel(`🎉 Participar (${count})`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(Boolean(giveaway.ended))
    );

    await message.edit({ components: [row] }).catch(() => {});
  }

  async checkExpiredGiveaways() {
    const storeData = this.manager.loadStoreData();
    const now = Date.now();

    for (const giveaway of Object.values(storeData.giveaways || {})) {
      if (!giveaway.ended && giveaway.endsAt <= now) {
        giveaway.ended = true;

        const participants = giveaway.participants || [];
        const winners = [];
        const count = Math.min(giveaway.winnersCount || 1, participants.length);

        const shuffled = [...participants].sort(() => 0.5 - Math.random());
        for (let i = 0; i < count; i++) {
          winners.push(shuffled[i]);
        }
        giveaway.winners = winners;
        this.manager.saveStoreData(storeData);

        // Notifica no canal
        if (this.manager.client) {
          const channel = await this.manager.client.channels.fetch(giveaway.channelId).catch(() => null);
          if (channel) {
            const winnersMentions = winners.length > 0 ? winners.map((id) => `<@${id}>`).join(', ') : 'Nenhum participante.';
            const resultEmbed = new EmbedBuilder()
              .setColor('#10b981')
              .setTitle('🎊・RESULTADO DO SORTEIO DA MARY STORE!')
              .setDescription([
                `🎁 **Prêmio:** **${giveaway.prize}**`,
                `👑 **Vencedor(es):** ${winnersMentions}`,
                '',
                'Parabéns! Entrem em contato no canal de tickets para resgatar seu prêmio!',
              ].join('\n'))
              .setTimestamp();

            await channel.send({ content: winners.length > 0 ? winnersMentions : undefined, embeds: [resultEmbed] }).catch(() => {});
            await this.updateGiveawayMessage(giveaway);
          }
        }
      }
    }
  }
}

const instance = new GiveawayHandler();
module.exports = instance;

