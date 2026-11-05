const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { getVentChannelId, updateGuildConfig, getGuildConfig } = require('./guildConfigService');
const { t } = require('../utils/i18n');

const ventDebounceTimers = new Map(); // guildId -> Timeout
const activeStickyMessageIds = new Map(); // guildId -> messageId

// O canal de desabafo existe em qualquer servidor: todo texto vem de `ventSpace.*`
// no idioma do servidor (AGENTS §1). Sem contexto, fica em português (Cringelândia).
const vt = (key, source, vars) => t(`ventSpace.${key}`, source || 'pt', vars);

/**
 * Constrói o Embed Sticky oficial de Desabafos
 */
function buildVentStickyEmbed(source = 'pt') {
  return new EmbedBuilder()
    .setColor('#4c1d95')
    .setTitle(vt('stickyTitle', source))
    .setDescription([
      vt('stickyIntro', source),
      vt('stickyRulesTitle', source),
      vt('rule1', source),
      vt('rule2', source),
      vt('rule3', source),
      vt('rule4', source),
      vt('rule5', source),
      vt('stickyHowTitle', source),
      vt('howPublic', source),
      vt('howAnon', source),
      vt('stickyNote', source),
    ].join('\n\n'))
    .setFooter({ text: vt('stickyFooter', source) })
    .setTimestamp();
}

/**
 * Constrói os botões da mensagem Sticky
 */
function buildVentStickyComponents(source = 'pt') {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('vent:help')
        .setLabel(vt('btnHelp', source))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('vent:anonymous')
        .setLabel(vt('btnAnon', source))
        .setStyle(ButtonStyle.Primary)
    ),
  ];
}

/**
 * Constrói o Embed completo de Autoajuda.
 * Em português: Brasil primeiro. Em inglês: emergência local e diretório mundial
 * primeiro, Brasil depois. O Disque 100 fica separado, como canal de denúncia
 * (não é linha de apoio emocional).
 */
function buildAutohelpEmbed(source = 'pt') {
  return new EmbedBuilder()
    .setColor('#059669')
    .setTitle(vt('helpTitle', source))
    .setDescription([vt('helpIntro', source), vt('helpEmergency', source)].join('\n\n'))
    .addFields(
      { name: vt('helpFirstTitle', source), value: vt('helpFirstValue', source), inline: false },
      { name: vt('helpSecondTitle', source), value: vt('helpSecondValue', source), inline: false },
      { name: vt('helpRightsTitle', source), value: vt('helpRightsValue', source), inline: false }
    )
    .setFooter({ text: vt('helpFooter', source) })
    .setTimestamp();
}

/**
 * Agenda o reposicionamento da mensagem Sticky com debounce de 4 segundos
 */
function scheduleStickyReposition(guild, channel) {
  if (!guild || !channel || !channel.isTextBased()) return;
  const guildId = guild.id;

  if (ventDebounceTimers.has(guildId)) {
    clearTimeout(ventDebounceTimers.get(guildId));
  }

  const timer = setTimeout(async () => {
    ventDebounceTimers.delete(guildId);
    try {
      // 1. Apaga sticky anterior
      const lastId = activeStickyMessageIds.get(guildId) || getGuildConfig(guildId).lastVentStickyId;
      if (lastId) {
        await channel.messages.delete(lastId).catch(() => null);
      }

      // 2. Envia nova sticky
      const newSticky = await channel.send({
        embeds: [buildVentStickyEmbed(guildId)],
        components: buildVentStickyComponents(guildId),
      });

      activeStickyMessageIds.set(guildId, newSticky.id);
      updateGuildConfig(guildId, { lastVentStickyId: newSticky.id });
    } catch (err) {
      console.warn(`[ventService] Falha ao reposicionar mensagem sticky em ${guildId}:`, err.message);
    }
  }, 30000);

  ventDebounceTimers.set(guildId, timer);
}

/**
 * Intercepta mensagens no canal de desabafos
 */
async function onMessageCreate(message) {
  if (!message || message.author?.bot || !message.guild) return;

  const ventChannelId = getVentChannelId(message.guild.id);
  if (!ventChannelId || message.channel.id !== ventChannelId) return;

  // Se o usuário digitou no canal, envia a pergunta de preferência vinculada
  const lang = message.guild.id;
  try {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`vent_pref:allow:${message.author.id}:${message.id}`)
        .setLabel(vt('prefAllow', lang))
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`vent_pref:silence:${message.author.id}:${message.id}`)
        .setLabel(vt('prefSilence', lang))
        .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({
      content: vt('published', lang, { user: `${message.author}` }),
      components: [row],
      allowedMentions: { repliedUser: false, users: [message.author.id] },
    }).catch(() => null);
  } catch (_) {}

  // Dispara debounce do sticky
  scheduleStickyReposition(message.guild, message.channel);
}

/**
 * Gerenciador central de interações de desabafo (Botões e Modais)
 */
async function handleVentInteraction(interaction) {
  if (!interaction) return false;
  const lang = interaction.guildId || interaction;

  // 1. Botão: Receber Autoajuda (DM)
  if (interaction.isButton() && interaction.customId === 'vent:help') {
    const helpEmbed = buildAutohelpEmbed(lang);
    try {
      await interaction.user.send({ embeds: [helpEmbed] });
      await interaction.reply({
        content: vt('dmSent', lang),
        ephemeral: true,
      });
    } catch (err) {
      // Fallback: se a DM estiver trancada, envia como resposta efêmera
      await interaction.reply({
        content: vt('dmClosed', lang),
        embeds: [helpEmbed],
        ephemeral: true,
      });
    }
    return true;
  }

  // 2. Botão: Abrir Modal de Desabafo Anônimo
  if (interaction.isButton() && interaction.customId === 'vent:anonymous') {
    const modal = new ModalBuilder()
      .setCustomId('vent_modal_submit')
      .setTitle(vt('modalTitle', lang));

    const titleInput = new TextInputBuilder()
      .setCustomId('vent_title')
      .setLabel(vt('modalTitleLabel', lang))
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(vt('modalTitlePlaceholder', lang))
      .setRequired(true)
      .setMaxLength(100);

    const bodyInput = new TextInputBuilder()
      .setCustomId('vent_body')
      .setLabel(vt('modalBodyLabel', lang))
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(vt('modalBodyPlaceholder', lang))
      .setRequired(true)
      .setMaxLength(2000);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(bodyInput)
    );

    await interaction.showModal(modal);
    return true;
  }

  // 3. Submissão do Modal de Desabafo Anônimo
  if (interaction.isModalSubmit() && interaction.customId === 'vent_modal_submit') {
    const title = interaction.fields.getTextInputValue('vent_title');
    const body = interaction.fields.getTextInputValue('vent_body');

    const ventEmbed = new EmbedBuilder()
      .setColor('#581c87')
      .setTitle(vt('anonTitle', lang, { title }).slice(0, 256))
      .setDescription(body)
      .setFooter({ text: vt('anonFooter', lang) })
      .setTimestamp();

    const channel = interaction.channel;
    if (channel && channel.isTextBased()) {
      const ventMsg = await channel.send({ embeds: [ventEmbed] });

      // Envia na confirmação efêmera os 2 botões de preferência vinculados ao desabafo recém-postado
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`vent_pref:allow:anon:${ventMsg.id}`)
          .setLabel(vt('prefAllowAnon', lang))
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`vent_pref:silence:anon:${ventMsg.id}`)
          .setLabel(vt('prefSilenceAnon', lang))
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({
        content: vt('anonPublished', lang),
        components: [row],
        ephemeral: true,
      });

      scheduleStickyReposition(interaction.guild, channel);
    }
    return true;
  }

  // 4. Botão de Preferência (Silêncio vs. Resposta)
  if (interaction.isButton() && interaction.customId.startsWith('vent_pref:')) {
    const parts = interaction.customId.split(':');
    const action = parts[1]; // 'allow' ou 'silence'
    const targetAuthorOrAnon = parts[2]; // authorId ou 'anon'
    const ventMsgId = parts[3];

    // Se for desabafo direto, apenas o autor pode responder
    if (targetAuthorOrAnon !== 'anon' && interaction.user.id !== targetAuthorOrAnon) {
      await interaction.reply({
        content: vt('onlyAuthor', lang),
        ephemeral: true,
      });
      return true;
    }

    const prefText = action === 'allow'
      ? vt('prefAllowText', lang)
      : vt('prefSilenceText', lang);

    // Se a interação foi na pergunta pública
    if (interaction.message && !interaction.message.flags?.has(64)) {
      await interaction.update({
        content: prefText,
        components: [],
      });
    } else {
      // Se foi na efêmera do anônimo, envia uma mensagem pública discreta abaixo do desabafo
      const channel = interaction.channel;
      if (channel && ventMsgId) {
        await channel.send({
          content: `> ${prefText}`,
          allowedMentions: { parse: [] },
        }).catch(() => null);
      }
      await interaction.update({
        content: vt('prefSaved', lang, { pref: prefText }),
        components: [],
      });
    }

    scheduleStickyReposition(interaction.guild, interaction.channel);
    return true;
  }

  return false;
}

/**
 * Remove resíduos de mensagem Sticky do canal anterior em caso de migração
 */
async function cleanupOldChannelSticky(guild, oldChannelId) {
  if (!guild || !oldChannelId) return;
  try {
    const lastId = activeStickyMessageIds.get(guild.id) || getGuildConfig(guild.id).lastVentStickyId;
    if (lastId) {
      const oldChan = await guild.channels.fetch(oldChannelId).catch(() => null);
      if (oldChan && oldChan.isTextBased()) {
        await oldChan.messages.delete(lastId).catch(() => null);
      }
    }
  } catch (_) {}
}

module.exports = {
  buildVentStickyEmbed,
  buildVentStickyComponents,
  buildAutohelpEmbed,
  scheduleStickyReposition,
  cleanupOldChannelSticky,
  onMessageCreate,
  handleVentInteraction,
};

