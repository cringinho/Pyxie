const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const securityGuard = require('../utils/securityGuard');

class StickyAndFaqHandler {
  constructor() {
    this.manager = null;
    this.stickyDebounce = new Map(); // channelId -> timeoutId
  }

  init(manager) {
    this.manager = manager;

    if (this.manager.ctx?.registerListener) {
      this.manager.ctx.registerListener('messageCreate', (message) => {
        this.handleMessage(message);
      });
    }
  }

  async handleMessage(message) {
    if (!message || message.author?.bot || !message.guild) return;

    const config = this.manager.loadConfig();

    // 1. Filtro Anti-Link Opcional
    if (config.featureFlags?.antiLinkModule) {
      const isStaff =
        message.member?.permissions?.has(PermissionFlagsBits.ManageMessages) ||
        message.member?.permissions?.has(PermissionFlagsBits.Administrator) ||
        securityGuard.isAuthorizedUser(message.author.id);

      if (!isStaff) {
        const text = message.content.toLowerCase();
        const hasInvite = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)/i.test(text);

        if (hasInvite) {
          await message.delete().catch(() => {});
          const warning = await message.channel.send({
            content: `⚠️ <@${message.author.id}>, o envio de convites de outros servidores não é permitido aqui!`,
          }).catch(() => null);

          if (warning) {
            setTimeout(() => warning.delete().catch(() => {}), 5000);
          }
          return;
        }
      }
    }

    // 2. Mensagem Fixa (Sticky Message) com Debounce
    if (config.featureFlags?.stickyModule) {
      const storeData = this.manager.loadStoreData();
      const sticky = storeData.stickyMessages?.[message.channel.id];

      if (sticky && (sticky.text || sticky.embed)) {
        if (this.stickyDebounce.has(message.channel.id)) {
          clearTimeout(this.stickyDebounce.get(message.channel.id));
        }

        const timeout = setTimeout(async () => {
          this.stickyDebounce.delete(message.channel.id);
          try {
            // Apaga anterior se existir
            if (sticky.lastMessageId) {
              const oldMsg = await message.channel.messages.fetch(sticky.lastMessageId).catch(() => null);
              if (oldMsg) await oldMsg.delete().catch(() => {});
            }

            const embeds = sticky.embed ? [this.manager.buildEmbed(sticky.embed, config)] : [];
            const newMsg = await message.channel.send({
              content: sticky.text ? this.manager.resolveVariables(sticky.text, config) : undefined,
              embeds: embeds.length > 0 ? embeds : undefined,
            });

            sticky.lastMessageId = newMsg.id;
            this.manager.saveStoreData(storeData);
          } catch (err) {
            console.warn('[StickyHandler] Erro ao postar sticky message:', err.message);
          }
        }, 3000); // 3 segundos de debounce para evitar flood

        this.stickyDebounce.set(message.channel.id, timeout);
      }
    }
  }
}

const instance = new StickyAndFaqHandler();
module.exports = instance;

