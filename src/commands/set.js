const {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  RoleSelectMenuBuilder,
} = require('discord.js');
const { SET } = require('./commandNames');
const {
  getGuildConfig,
  setWelcomeConfig,
  setVentChannelId,
  setTarotChannelId,
  getWelcomeConfig,
} = require('../services/guildConfigService');
const { scheduleStickyReposition } = require('../services/ventService');
const { t } = require('../utils/i18n');

/**
 * Constrói o Painel Interativo de Configuração de Boas-Vindas Premium
 */
function buildWelcomeControlPanel(guild, welcomeConfig) {
  const channelDisplay = welcomeConfig.channelId ? `<#${welcomeConfig.channelId}>` : '*Nenhum canal definido*';
  const autoRoleDisplay = welcomeConfig.autoRoleId ? `<@&${welcomeConfig.autoRoleId}>` : '*Nenhum cargo configurado*';
  const autoReactionsDisplay = (welcomeConfig.autoReactions && welcomeConfig.autoReactions.length > 0)
    ? welcomeConfig.autoReactions.join(' ')
    : '*Nenhuma reação*';

  const embed = new EmbedBuilder()
    .setColor(welcomeConfig.color || '#8b5cf6')
    .setTitle('✨  ✦  Painel de Boas-Vindas Premium')
    .setDescription(
      `Configure as boas-vindas do **${guild.name}** com estilo moderno, limpo e personalizável!\n\n` +

      `### 📋 Configuração Atual\n\n` +

      `📍 **Canal de Envio:** ${channelDisplay}\n\n` +
      `🏷️ **Título:** \`${welcomeConfig.title || 'Sem título'}\`\n\n` +
      `💬 **Mensagem:**\n> ${welcomeConfig.description || 'Sem mensagem'}\n\n` +
      `🎨 **Cor:** \`${welcomeConfig.color || '#8b5cf6'}\`\n\n` +
      `🖼️ **Imagem / GIF:** ${welcomeConfig.imageUrl ? `[Link Visual](${welcomeConfig.imageUrl})` : '*Nenhum*'}\n\n` +
      `🎭 **Reações Automáticas:** ${autoReactionsDisplay}\n\n` +
      `👑 **Cargo Automático (Auto-Role):** ${autoRoleDisplay}\n\n` +

      '### 🧩 Variáveis Disponíveis\n\n' +
      '• `{user}` (menção) • `{username}` (nome puro)\n\n' +
      '• `{server}` (servidor) • `{memberCount}` (total de membros)\n\n' +
      '-# 💡 Utilize os botões abaixo para editar interativamente via modal.'
    )
    .setFooter({ text: 'Pyxie Premium • Boas-Vindas & Auto-Role sem limitações' })
    .setTimestamp();

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`welcome_preview:${guild.id}`)
      .setLabel('👀 Testar Preview de Boas-Vindas')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`welcome_edit_text:${guild.id}`)
      .setLabel('✏️ Editar Texto')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`welcome_edit_visual:${guild.id}`)
      .setLabel('🎨 Imagem & Cor')
      .setStyle(ButtonStyle.Secondary)
  );

  const roleRow = new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId(`welcome_autorole_select:${guild.id}`)
      .setPlaceholder('Escolha um cargo para atribuir automaticamente na entrada')
      .setMinValues(0)
      .setMaxValues(1)
  );

  return { embeds: [embed], components: [buttonRow, roleRow] };
}

/**
 * Constrói a Preview real do Embed de Boas-Vindas
 */
function buildWelcomePreviewEmbed(member, welcomeConfig) {
  const guildName = member.guild?.name || 'Comunidade';
  const memberCount = member.guild?.memberCount || 100;
  const username = member.user?.username || 'Novato';

  const title = (welcomeConfig.title || '🎉  ✦  Boas-vindas a {server}!')
    .replaceAll('{server}', guildName)
    .replaceAll('{user}', `${member}`)
    .replaceAll('{username}', username)
    .replaceAll('{memberCount}', memberCount);

  const description = (welcomeConfig.description || 'Que bom ter você aqui, {user}!')
    .replaceAll('{server}', guildName)
    .replaceAll('{user}', `${member}`)
    .replaceAll('{username}', username)
    .replaceAll('{memberCount}', memberCount);

  const embed = new EmbedBuilder()
    .setColor(welcomeConfig.color || '#8b5cf6')
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(member.user?.displayAvatarURL({ dynamic: true, size: 256 }) || null)
    .setFooter({ text: `${guildName} • Membro #${memberCount}` })
    .setTimestamp();

  if (welcomeConfig.imageUrl) {
    embed.setImage(welcomeConfig.imageUrl);
  }

  return embed;
}

module.exports = {
  name: SET,
  aliases: ['set', 'py-set', 'configurar', 'py-configurar'],
  data: new SlashCommandBuilder()
    .setName(SET)
    .setDescription('Configures channels and server features (Welcome, Vent, Tarot).')
    .setDescriptionLocalizations({
      'pt-BR': 'Configura canais e recursos avançados da Pyxie no servidor.',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('boas-vindas')
        .setNameLocalizations({ 'pt-BR': 'boas-vindas', 'en-US': 'welcome', 'en-GB': 'welcome' })
        .setDescription('Configures the customizable welcome channel and auto-role.')
        .setDescriptionLocalizations({
          'pt-BR': 'Configura o canal de boas-vindas customizável e cargo automático.',
        })
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel', 'en-GB': 'channel' })
            .setDescription('Text channel for welcome messages.')
            .setDescriptionLocalizations({ 'pt-BR': 'Canal de texto para envio de boas-vindas.' })
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('desabafos')
        .setNameLocalizations({ 'pt-BR': 'desabafos', 'en-US': 'vent', 'en-GB': 'vent' })
        .setDescription('Configures the vent channel with sticky messages and anonymous venting.')
        .setDescriptionLocalizations({
          'pt-BR': 'Configura o canal de desabafos com mensagem fixa e desabafo anônimo.',
        })
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel', 'en-GB': 'channel' })
            .setDescription('Text channel for vents and mutual support.')
            .setDescriptionLocalizations({ 'pt-BR': 'Canal de texto para desabafos e apoio mútuo.' })
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('tarot')
        .setNameLocalizations({ 'pt-BR': 'tarot', 'en-US': 'tarot', 'en-GB': 'tarot' })
        .setDescription('Configures the channel for daily automatic tarot announcements.')
        .setDescriptionLocalizations({
          'pt-BR': 'Configura o canal para postagem diária automática do Tarot.',
        })
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setNameLocalizations({ 'pt-BR': 'canal', 'en-US': 'channel', 'en-GB': 'channel' })
            .setDescription('Text channel for daily tarot announcements.')
            .setDescriptionLocalizations({ 'pt-BR': 'Canal de texto para anúncios diários do Tarot.' })
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    ),

  async executePrefix({ message, args, prefix }) {
    if (!message.member?.permissions?.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply(t('admin.noPermission', message));
      return;
    }

    const sub = (args[0] || '').toLowerCase();

    // Se executado sem argumentos, lista as opções
    if (!sub || !['boas-vindas', 'boasvindas', 'welcome', 'desabafos', 'desabafo', 'vent', 'tarot'].includes(sub)) {
      const helpEmbed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('⚙️  ✦  Central de Configuração `py!set`')
        .setDescription(
          `Utilize o comando \`${prefix || 'py!'}set\` para ativar os recursos oficiais da Pyxie no seu servidor:\n\n` +
          `• \`${prefix || 'py!'}set boas-vindas <#canal>\` — Configura o sistema de Boas-Vindas customizável e Auto-Role.\n\n` +
          `• \`${prefix || 'py!'}set desabafos <#canal>\` — Configura o canal de Desabafos com mensagem Sticky, Autoajuda na DM e Desabafo Anônimo.\n\n` +
          `• \`${prefix || 'py!'}set tarot <#canal>\` — Configura o canal para postagem diária automática do Tarot às 00:00 BRT.`
        )
        .setFooter({ text: 'Pyxie • Configurações Globais do Servidor' });

      await message.reply({ embeds: [helpEmbed] });
      return;
    }

    const channel = message.mentions.channels.first() || message.guild?.channels.cache.get(args[1]);
    if (!channel || !channel.isTextBased()) {
      await message.reply(t('admin.welcomeNeedChannel', message));
      return;
    }

    // 1. Subcomando Boas-Vindas
    if (['boas-vindas', 'boasvindas', 'welcome'].includes(sub)) {
      const updated = setWelcomeConfig(message.guildId, { channelId: channel.id });
      const panel = buildWelcomeControlPanel(message.guild, updated.welcomeConfig);
      await message.reply(panel);
      return;
    }

    // 2. Subcomando Desabafos
    if (['desabafos', 'desabafo', 'vent'].includes(sub)) {
      setVentChannelId(message.guildId, channel.id);
      scheduleStickyReposition(message.guild, channel);
      await message.reply({
        content: `✅ Canal de desabafos configurado para <#${channel.id}>! A mensagem fixa de acolhimento e autoajuda já foi ativada.`,
      });
      return;
    }

    // 3. Subcomando Tarot
    if (sub === 'tarot') {
      setTarotChannelId(message.guildId, channel.id);
      await message.reply({
        content: `✅ Canal do Tarot Diário configurado para <#${channel.id}>! As tiragens e anúncios diários serão postados automaticamente aqui à 00:00 BRT.`,
      });
      return;
    }
  },

  async executeSlash({ interaction }) {
    if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: t('admin.noPermission', interaction), ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand(false);

    if (!sub) {
      const helpEmbed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('⚙️  ✦  Central de Configuração `/py-set`')
        .setDescription(
          `Escolha uma das opções abaixo para configurar seu servidor:\n\n` +
          `• \`/py-set boas-vindas canal:#canal\` — Boas-Vindas customizáveis e Auto-Role.\n\n` +
          `• \`/py-set desabafos canal:#canal\` — Canal de Desabafos, Sticky e Anônimo.\n\n` +
          `• \`/py-set tarot canal:#canal\` — Postagem diária do Tarot às 00:00 BRT.`
        );
      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel('channel') || interaction.options.getChannel('canal');
    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: t('admin.welcomeNeedChannel', interaction), ephemeral: true });
      return;
    }

    // 1. Subcomando Boas-Vindas
    if (['boas-vindas', 'welcome'].includes(sub)) {
      const updated = setWelcomeConfig(interaction.guildId, { channelId: channel.id });
      const panel = buildWelcomeControlPanel(interaction.guild, updated.welcomeConfig);
      await interaction.reply({ ...panel, ephemeral: true });
      return;
    }

    // 2. Subcomando Desabafos
    if (['desabafos', 'vent'].includes(sub)) {
      setVentChannelId(interaction.guildId, channel.id);
      scheduleStickyReposition(interaction.guild, channel);
      await interaction.reply({
        content: `✅ Canal de desabafos configurado para <#${channel.id}> com sucesso!`,
        ephemeral: true,
      });
      return;
    }

    // 3. Subcomando Tarot
    if (sub === 'tarot') {
      setTarotChannelId(interaction.guildId, channel.id);
      await interaction.reply({
        content: `✅ Canal do Tarot Diário configurado para <#${channel.id}>! As tiragens diárias serão anunciadas aqui à 00:00 BRT.`,
        ephemeral: true,
      });
      return;
    }
  },

  async handleWelcomeInteraction(interaction) {
    if (!interaction) return false;

    // 1. Preview
    if (interaction.isButton() && interaction.customId.startsWith('welcome_preview:')) {
      const cfg = getWelcomeConfig(interaction.guildId);
      const previewEmbed = buildWelcomePreviewEmbed(interaction.member, cfg);
      await interaction.reply({
        content: '👀 **Preview do Embed de Boas-Vindas:**',
        embeds: [previewEmbed],
        ephemeral: true,
      });
      return true;
    }

    // 2. Modal de Textos
    if (interaction.isButton() && interaction.customId.startsWith('welcome_edit_text:')) {
      const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const cfg = getWelcomeConfig(interaction.guildId);
      const modal = new ModalBuilder()
        .setCustomId(`welcome_modal_text:${interaction.guildId}`)
        .setTitle('✏️ Textos de Boas-Vindas');

      const titleInput = new TextInputBuilder()
        .setCustomId('welcome_input_title')
        .setLabel('Título do Embed')
        .setStyle(TextInputStyle.Short)
        .setValue(cfg.title || '🎉  ✦  Boas-vindas a {server}!')
        .setRequired(true);

      const descInput = new TextInputBuilder()
        .setCustomId('welcome_input_desc')
        .setLabel('Mensagem do Embed')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(cfg.description || 'Que bom ter você aqui, {user}!')
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(descInput)
      );

      await interaction.showModal(modal);
      return true;
    }

    // 3. Modal Visual (Imagem, Cor, Reações)
    if (interaction.isButton() && interaction.customId.startsWith('welcome_edit_visual:')) {
      const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const cfg = getWelcomeConfig(interaction.guildId);
      const modal = new ModalBuilder()
        .setCustomId(`welcome_modal_visual:${interaction.guildId}`)
        .setTitle('🎨 Imagem, Cor & Reações');

      const imgInput = new TextInputBuilder()
        .setCustomId('welcome_input_img')
        .setLabel('URL da Imagem / GIF de Destaque')
        .setStyle(TextInputStyle.Short)
        .setValue(cfg.imageUrl || '')
        .setRequired(false);

      const colorInput = new TextInputBuilder()
        .setCustomId('welcome_input_color')
        .setLabel('Cor Hexadecimal (Ex: #8b5cf6)')
        .setStyle(TextInputStyle.Short)
        .setValue(cfg.color || '#8b5cf6')
        .setRequired(false);

      const reactInput = new TextInputBuilder()
        .setCustomId('welcome_input_react')
        .setLabel('Emojis para Reagir (Separados por espaço)')
        .setStyle(TextInputStyle.Short)
        .setValue((cfg.autoReactions || []).join(' '))
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(imgInput),
        new ActionRowBuilder().addComponents(colorInput),
        new ActionRowBuilder().addComponents(reactInput)
      );

      await interaction.showModal(modal);
      return true;
    }

    // 4. Seleção de Cargo Automático
    if (interaction.isRoleSelectMenu() && interaction.customId.startsWith('welcome_autorole_select:')) {
      const roleId = interaction.values[0] || null;
      const updated = setWelcomeConfig(interaction.guildId, { autoRoleId: roleId });
      const panel = buildWelcomeControlPanel(interaction.guild, updated.welcomeConfig);
      await interaction.update(panel);
      return true;
    }

    // 5. Submissão do Modal de Textos
    if (interaction.isModalSubmit() && interaction.customId.startsWith('welcome_modal_text:')) {
      const title = interaction.fields.getTextInputValue('welcome_input_title');
      const description = interaction.fields.getTextInputValue('welcome_input_desc');
      const updated = setWelcomeConfig(interaction.guildId, { title, description });
      const panel = buildWelcomeControlPanel(interaction.guild, updated.welcomeConfig);
      await interaction.update(panel);
      return true;
    }

    // 6. Submissão do Modal Visual
    if (interaction.isModalSubmit() && interaction.customId.startsWith('welcome_modal_visual:')) {
      const imageUrl = interaction.fields.getTextInputValue('welcome_input_img')?.trim() || '';
      const color = interaction.fields.getTextInputValue('welcome_input_color')?.trim() || '#8b5cf6';
      const autoReactions = (interaction.fields.getTextInputValue('welcome_input_react') || '')
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = setWelcomeConfig(interaction.guildId, { imageUrl, color, autoReactions });
      const panel = buildWelcomeControlPanel(interaction.guild, updated.welcomeConfig);
      await interaction.update(panel);
      return true;
    }

    return false;
  },

  buildWelcomeControlPanel,
  buildWelcomePreviewEmbed,
};
