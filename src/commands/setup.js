const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');
const { getWelcomeChannel, setWelcomeChannel } = require('../services/database');
const { getLanguage, setGuildLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

const name = 'py-setup';
const aliases = ['setup', 'config', 'py-config', 'configurar', 'py-configurar', 'servidor', 'py-servidor'];

function buildSetupDashboard(guild, source = null) {
  const guildId = guild?.id;
  const currentLang = (typeof source === 'string' && (source === 'pt' || source === 'en'))
    ? source
    : getLanguage(source || guildId);
  const isPt = currentLang === 'pt';
  const welcomeChannelId = getWelcomeChannel(guildId);
  const welcomeDisplay = welcomeChannelId ? `<#${welcomeChannelId}> (\`${welcomeChannelId}\`)` : (isPt ? '❌ *Não configurado*' : '❌ *Not configured*');
  const langDisplay = isPt ? '🇧🇷 **Português (Brasil)**' : '🇺🇸 **English (Global)**';

  const title = isPt
    ? `⚙️  ✦  Painel de Configuração — ${guild?.name || 'Servidor'}`
    : `⚙️  ✦  Server Configuration Panel — ${guild?.name || 'Server'}`;

  const desc = isPt
    ? [
        '✨ **Central de Configuração Rápida da Pyxie (Zero-OAuth)**',
        'Gerencie as principais funcionalidades da Pyxie diretamente no seu servidor sem necessidade de autenticação externa.',
        '',
        `🌐 **Idioma do Servidor:** ${langDisplay}`,
        `👋 **Canal de Boas-Vindas:** ${welcomeDisplay}`,
        `👑 **Comunidade:** \`${guild?.name || 'Discord'}\` (\`${guildId || '0'}\`)`,
        '',
        '💡 **Subcomandos Rápidos:**',
        '• `/py-setup welcome <canal>` — Define canal de boas-vindas',
        '• `/py-setup language <idioma>` — Altera o idioma padrão',
        '• `/py-setup view` — Atualiza e reabre este painel',
      ].join('\n')
    : [
        '✨ **Pyxie Quick Setup Dashboard (Zero-OAuth)**',
        'Manage Pyxie core features directly in your server without requiring any external web login.',
        '',
        `🌐 **Server Language:** ${langDisplay}`,
        `👋 **Welcome Channel:** ${welcomeDisplay}`,
        `👑 **Community:** \`${guild?.name || 'Discord'}\` (\`${guildId || '0'}\`)`,
        '',
        '💡 **Quick Subcommands:**',
        '• `/py-setup welcome <channel>` — Configure welcome channel',
        '• `/py-setup language <lang>` — Switch primary language',
        '• `/py-setup view` — Refresh this setup panel',
      ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.violet || '#8b5cf6')
    .setTitle(title)
    .setDescription(desc)
    .setThumbnail(guild?.iconURL({ dynamic: true, size: 256 }) || null)
    .setFooter({ text: pyxieFooter(isPt ? 'Painel de Configuração Autônomo' : 'Autonomous Server Setup', source) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setup_lang:pt:${guildId}`)
      .setLabel('Português 🇧🇷')
      .setStyle(isPt ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`setup_lang:en:${guildId}`)
      .setLabel('English 🇺🇸')
      .setStyle(!isPt ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`setup_refresh:${guildId}`)
      .setLabel(isPt ? 'Atualizar 🔄' : 'Refresh 🔄')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}

function hasAdminPerms(member) {
  if (!member) return false;
  return (
    member.permissions?.has(PermissionFlagsBits.Administrator) ||
    member.permissions?.has(PermissionFlagsBits.ManageGuild)
  );
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  buildSetupDashboard,

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Configure Pyxie settings for your server (Zero-OAuth dashboard).')
    .setDescriptionLocalizations({
      'pt-BR': 'Configura as opções da Pyxie no servidor (Painel Zero-OAuth).',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('view')
        .setNameLocalizations({
          'pt-BR': 'painel',
        })
        .setDescription('View current server configuration and settings')
        .setDescriptionLocalizations({
          'pt-BR': 'Visualiza as configurações ativas do servidor',
        })
    )
    .addSubcommand((sub) =>
      sub
        .setName('welcome')
        .setNameLocalizations({
          'pt-BR': 'boasvindas',
        })
        .setDescription('Configure the welcome announcements channel')
        .setDescriptionLocalizations({
          'pt-BR': 'Configura o canal de anúncios de boas-vindas',
        })
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setNameLocalizations({
              'pt-BR': 'canal',
            })
            .setDescription('Text channel for welcome messages')
            .setDescriptionLocalizations({
              'pt-BR': 'Canal de texto para envio de boas-vindas',
            })
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('language')
        .setNameLocalizations({
          'pt-BR': 'idioma',
        })
        .setDescription('Set the primary bot language for this server')
        .setDescriptionLocalizations({
          'pt-BR': 'Define o idioma principal do bot neste servidor',
        })
        .addStringOption((opt) =>
          opt
            .setName('lang')
            .setNameLocalizations({
              'pt-BR': 'opcao',
            })
            .setDescription('Choose between Portuguese or English')
            .setDescriptionLocalizations({
              'pt-BR': 'Escolha entre Português ou Inglês',
            })
            .addChoices(
              { name: 'Português (Brasil) 🇧🇷', value: 'pt' },
              { name: 'English (US/Global) 🇺🇸', value: 'en' }
            )
            .setRequired(true)
        )
    ),

  async executeSlash({ interaction }) {
    if (!interaction.guild) {
      return interaction.reply({
        content: t('partnerships.guild_only', interaction),
        ephemeral: true,
      });
    }

    if (!hasAdminPerms(interaction.member)) {
      return interaction.reply({
        content: t('admin.noPermission', interaction),
        ephemeral: true,
      });
    }

    const sub = interaction.options.getSubcommand(false) || 'view';

    if (sub === 'welcome' || sub === 'boasvindas') {
      const channel = interaction.options.getChannel('channel') || interaction.options.getChannel('canal');
      if (!channel || !channel.isTextBased()) {
        return interaction.reply({
          content: t('admin.welcomeNeedChannel', interaction),
          ephemeral: true,
        });
      }

      setWelcomeChannel(interaction.guildId, channel.id);
      const isPt = getLanguage(interaction.guildId) === 'pt';
      const msg = isPt
        ? `✅ Canal de boas-vindas configurado com sucesso para ${channel}!`
        : `✅ Welcome channel successfully set to ${channel}!`;

      return interaction.reply({ content: msg, ephemeral: true });
    }

    if (sub === 'language' || sub === 'idioma') {
      const selected = interaction.options.getString('lang') || interaction.options.getString('opcao') || 'pt';
      setGuildLanguage(interaction.guildId, selected);
      const isPt = selected === 'pt';
      const msg = isPt
        ? '✅ Idioma do servidor atualizado com sucesso para **Português (Brasil) 🇧🇷**!'
        : '✅ Server language successfully updated to **English 🇺🇸**!';

      return interaction.reply({ content: msg, ephemeral: true });
    }

    // Default: view
    const view = buildSetupDashboard(interaction.guild, interaction);
    return interaction.reply(view);
  },

  async executePrefix({ message, args = [] }) {
    if (!message.guild) {
      return message.reply(t('partnerships.guild_only', message));
    }

    if (!hasAdminPerms(message.member)) {
      return message.reply(t('admin.noPermission', message));
    }

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'welcome' || sub === 'boasvindas') {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel || !channel.isTextBased()) {
        return message.reply(t('admin.welcomeNeedChannel', message));
      }
      setWelcomeChannel(message.guildId, channel.id);
      const isPt = getLanguage(message.guildId) === 'pt';
      return message.reply(
        isPt
          ? `✅ Canal de boas-vindas configurado com sucesso para ${channel}!`
          : `✅ Welcome channel successfully set to ${channel}!`
      );
    }

    if (sub === 'language' || sub === 'idioma' || sub === 'lang') {
      const choice = (args[1] || '').toLowerCase();
      const selected = choice.startsWith('en') ? 'en' : 'pt';
      setGuildLanguage(message.guildId, selected);
      const isPt = selected === 'pt';
      return message.reply(
        isPt
          ? '✅ Idioma do servidor atualizado com sucesso para **Português (Brasil) 🇧🇷**!'
          : '✅ Server language successfully updated to **English 🇺🇸**!'
      );
    }

    const view = buildSetupDashboard(message.guild, message);
    return message.reply(view);
  },

  isSetupInteraction(interaction) {
    return (
      typeof interaction.customId === 'string' &&
      (interaction.customId.startsWith('setup_lang:') || interaction.customId.startsWith('setup_refresh:'))
    );
  },

  async handleSetupInteraction(interaction) {
    if (!hasAdminPerms(interaction.member)) {
      return interaction.reply({
        content: t('admin.noPermission', interaction),
        ephemeral: true,
      });
    }

    const parts = interaction.customId.split(':');
    const action = parts[0];
    const targetGuildId = interaction.guildId;

    if (action === 'setup_lang') {
      const newLang = parts[1];
      setGuildLanguage(targetGuildId, newLang);
    }

    const updatedView = buildSetupDashboard(interaction.guild, interaction);
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply(updatedView);
    }
    return interaction.update(updatedView);
  },
};
