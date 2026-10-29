// Comando /py-privacy (py!privacidade, py!lgpd) — Apagar meus dados (LGPD).
// Tom acolhedor, transparente e sem ironia (AGENTS.md §12). Pede confirmação explícita por botão
// e entrega recibo criptográfico após apagar nas tabelas PostgreSQL, arquivos JSON e scopedConfig.
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} = require('discord.js');
const privacyService = require('../services/privacyService');
const { t } = require('../utils/i18n');

const name = 'py-privacy';
const aliases = ['privacy', 'privacidade', 'py-privacidade', 'lgpd', 'py-lgpd', 'apagardados', 'deletedata'];
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function buildInspectPayload(userId, source) {
  const summary = privacyService.inspectUserData(userId);
  const presentIn = Array.isArray(summary.presentIn)
    ? summary.presentIn
    : Array.isArray(summary.categories)
      ? summary.categories
      : [];
  const items = presentIn.length
    ? presentIn.map((k) => `\`${t(`privacy.store.${k}`, source)}\``).join(', ')
    : `\`${t('privacy.noneFound', source)}\``;

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle(t('privacy.title', source))
    .setDescription(
      [
        t('privacy.intro', source),
        `### 📦 ${t('privacy.foundHeader', source)}`,
        t('privacy.foundList', source, { count: `\`${summary.totalCategories}\``, stores: items }),
        `> ${t('privacy.lgpdNote', source)}`,
        `-# ${t('privacy.confirmHint', source)}`,
      ].join('\n\n')
    )
    .setFooter({ text: t('privacy.footer', source) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`lgpd:confirm:${userId}`)
      .setLabel(t('privacy.btnConfirm', source))
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`lgpd:cancel:${userId}`)
      .setLabel(t('privacy.btnCancel', source))
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row], allowedMentions: NO_PING };
}

function buildErasedPayload(receipt, source) {
  const stores = Array.isArray(receipt.erasedCategories)
    ? receipt.erasedCategories
    : [
        ...(receipt.clearedStores?.database || []),
        ...(receipt.clearedStores?.jsonFiles || []),
        ...(receipt.clearedStores?.scopedNamespaces || []),
      ];
  const storeText = stores.length ? stores.map((s) => `\`${s}\``).join(', ') : `\`${t('privacy.noneFound', source)}\``;

  const embed = new EmbedBuilder()
    .setColor(0x10b981)
    .setTitle(t('privacy.erasedTitle', source))
    .setDescription(
      [
        t('privacy.erasedBody', source, { receipt: `\`${receipt.receiptId}\`` }),
        t('privacy.erasedStores', source, { stores: storeText }),
        `> ${t('privacy.retainedNote', source)}`,
      ].join('\n\n')
    )
    .setFooter({ text: `${t('privacy.footer', source)} • ${receipt.receiptId}` })
    .setTimestamp();

  return { embeds: [embed], components: [], allowedMentions: NO_PING };
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  ephemeral: true,
  buildInspectPayload,
  buildErasedPayload,

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Inspect or permanently erase your personal data stored by Pyxie (LGPD).')
    .setDescriptionLocalizations({
      'pt-BR': 'Consulte ou apague definitivamente os seus dados pessoais guardados pela Pyxie (LGPD).',
    }),

  async executeSlash({ interaction }) {
    const payload = buildInspectPayload(interaction.user.id, interaction);
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply(payload);
    }
    return interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
  },

  async executePrefix({ message }) {
    const payload = buildInspectPayload(message.author.id, message);
    return message.reply(payload);
  },

  isPrivacyInteraction(interaction) {
    return Boolean(interaction?.isButton?.() && typeof interaction.customId === 'string' && interaction.customId.startsWith('lgpd:'));
  },

  async handlePrivacyInteraction(interaction) {
    const [, action, targetUserId] = String(interaction.customId || '').split(':');
    if (interaction.user.id !== targetUserId) {
      return interaction.reply({
        content: t('privacy.onlyOwnData', interaction),
        flags: MessageFlags.Ephemeral,
        allowedMentions: NO_PING,
      });
    }

    if (action === 'cancel') {
      const embed = new EmbedBuilder()
        .setColor(0x64748b)
        .setTitle(t('privacy.cancelledTitle', interaction))
        .setDescription(t('privacy.cancelledBody', interaction))
        .setFooter({ text: t('privacy.footer', interaction) });
      return interaction.update({ embeds: [embed], components: [], allowedMentions: NO_PING });
    }

    if (action === 'confirm') {
      const receipt = await privacyService.eraseUserData(interaction.user.id);
      return interaction.update(buildErasedPayload(receipt, interaction));
    }
    return null;
  },
};
