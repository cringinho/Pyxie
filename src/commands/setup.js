const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { getWelcomeChannel, setWelcomeChannel } = require('../services/database');
const { getGuildConfig, getWelcomeConfig, assignDedicatedChannel, updateGuildConfig } = require('../services/guildConfigService');
const guildFeatures = require('../services/guildFeatures');
const { getLanguage, setGuildLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

/**
 * Central da Pyxie (/py-setup): um painel só para quem administra o servidor, no lugar do
 * /py-set e do antigo painel. Idioma, Mundo Pyxie (modo completo, teste de 7 dias ou clássico),
 * canais permitidos, módulos por servidor e os canais de boas-vindas, desabafos, tarot e tickets.
 */

const name = 'py-setup';
const aliases = ['setup', 'config', 'py-config', 'configurar', 'py-configurar', 'servidor', 'py-servidor', 'painel', 'py-painel'];

const SECTIONS = ['overview', 'mmo', 'channels', 'modules', 'welcome', 'vent', 'tarot', 'tickets', 'language'];
const SECTION_EMOJI = {
  overview: '⚙️', mmo: '🗺️', channels: '📍', modules: '🧩', welcome: '👋', vent: '🫂', tarot: '🔮', tickets: '🎫', language: '🌐',
};
const DEDICATED = { welcome: 'welcome', vent: 'vent', tarot: 'tarot', tickets: 'tickets' };
const TOGGLEABLE_GROUPS = Object.keys(guildFeatures.FEATURE_GROUPS).filter((g) => guildFeatures.FEATURE_GROUPS[g].toggleable);

/** O que o Mundo Pyxie oferece. Sistemas novos entram aqui e em setup.mmo.features.<id>. */
const MMO_SHOWCASE = ['dungeon', 'boss', 'home', 'market', 'vault', 'achievements'];

function langOf(source, guildId) {
  if (source === 'pt' || source === 'en') return source;
  return getLanguage(source || guildId);
}

function hasAdminPerms(member) {
  if (!member) return false;
  return Boolean(
    member.permissions?.has?.(PermissionFlagsBits.Administrator) ||
    member.permissions?.has?.(PermissionFlagsBits.ManageGuild)
  );
}

const ts = (ms, style = 'R') => `<t:${Math.floor(ms / 1000)}:${style}>`;

function channelList(ids, lang) {
  if (!ids || ids.length === 0) return t('setup.channels.everywhere', lang);
  return ids.map((id) => `<#${id}>`).join(', ');
}

function dedicatedChannelOf(guildId, feature) {
  const cfg = getGuildConfig(guildId);
  if (feature === 'welcome') return cfg.welcomeChannelId || cfg.welcomeConfig?.channelId || getWelcomeChannel(guildId) || null;
  if (feature === 'vent') return cfg.ventChannelId || null;
  if (feature === 'tarot') return cfg.tarotChannelId || null;
  if (feature === 'tickets') return cfg.ticketPanelChannelId || null;
  return null;
}

function mmoStateLine(guildId, lang, now = Date.now()) {
  const state = guildFeatures.getMmoState(guildId, now);
  if (state === 'trial') {
    return t('setup.mmo.stateTrial', lang, { time: ts(guildFeatures.getGuildFeatures(guildId).mmoTrialUntil) });
  }
  return t(state === 'full' ? 'setup.mmo.stateFull' : 'setup.mmo.stateClassic', lang);
}

function navRow(current, lang) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('setup:nav')
      .setPlaceholder(t('setup.nav.placeholder', lang))
      .addOptions(
        SECTIONS.map((section) => ({
          label: t(`setup.sections.${section}.label`, lang),
          description: t(`setup.sections.${section}.desc`, lang),
          value: section,
          emoji: SECTION_EMOJI[section],
          default: section === current,
        }))
      )
  );
}

function baseEmbed(title, lang) {
  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.violet || '#8b5cf6')
    .setTitle(title)
    .setFooter({ text: t('setup.footer', lang) });
}

// ---------------------------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------------------------

function buildOverview(guild, lang, now = Date.now()) {
  const guildId = guild?.id;
  const features = guildFeatures.getGuildFeatures(guildId);
  const state = guildFeatures.getMmoState(guildId, now);
  const demand = state === 'classic' ? guildFeatures.getMmoDemand(guildId, now) : 0;
  const on = t('setup.modules.on', lang);
  const off = t('setup.modules.off', lang);
  const notSet = t('setup.notSet', lang);

  const lines = [
    t('setup.overview.intro', lang, { server: guild?.name || 'Discord' }),
    `### ${SECTION_EMOJI.mmo} ${t('setup.sections.mmo.label', lang)}`,
    mmoStateLine(guildId, lang, now),
  ];
  if (demand > 0) lines.push(t('setup.overview.demand', lang, { count: demand }));
  if (state === 'classic' && !features.mmoTrialUsed) lines.push(t('setup.overview.trialHint', lang));

  lines.push(
    `### ${SECTION_EMOJI.channels} ${t('setup.sections.channels.label', lang)}`,
    `• **${t('setup.groups.mmo', lang)}:** ${channelList(features.channels.mmo, lang)}`,
    `• **${t('setup.groups.games', lang)}:** ${channelList(features.channels.games, lang)}`,
    `### ${SECTION_EMOJI.modules} ${t('setup.sections.modules.label', lang)}`,
    ...TOGGLEABLE_GROUPS.map(
      (group) => `• **${guildFeatures.FEATURE_GROUPS[group].emoji} ${t(`setup.groups.${group}`, lang)}:** ${features.disabled.includes(group) ? off : on}`
    ),
    `### 📣 ${t('setup.overview.systems', lang)}`,
    ...Object.keys(DEDICATED).map((feature) => {
      const channelId = dedicatedChannelOf(guildId, feature);
      return `• **${SECTION_EMOJI[feature]} ${t(`setup.sections.${feature}.label`, lang)}:** ${channelId ? `<#${channelId}>` : notSet}`;
    }),
    `### ${SECTION_EMOJI.language} ${t('setup.sections.language.label', lang)}`,
    lang === 'pt' ? '🇧🇷 **Português (Brasil)**' : '🇺🇸 **English**',
    t('setup.overview.adminOnly', lang)
  );

  const embed = baseEmbed(t('setup.overview.title', lang), lang).setDescription(lines.join('\n\n'));
  const icon = typeof guild?.iconURL === 'function' ? guild.iconURL({ size: 256 }) : null;
  if (icon) embed.setThumbnail(icon);

  const quick = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup:go:mmo').setLabel(t('setup.sections.mmo.label', lang)).setEmoji(SECTION_EMOJI.mmo).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setup:go:channels').setLabel(t('setup.sections.channels.label', lang)).setEmoji(SECTION_EMOJI.channels).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('setup:go:overview').setLabel(t('setup.refresh', lang)).setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [navRow('overview', lang), quick] };
}

/** Vitrine do Mundo Pyxie com os botões de ligar, testar e voltar ao clássico. */
function buildMmoSection(guild, lang, now = Date.now()) {
  const guildId = guild?.id;
  const features = guildFeatures.getGuildFeatures(guildId);
  const state = guildFeatures.getMmoState(guildId, now);
  const demand = guildFeatures.getMmoDemand(guildId, now);

  const lines = [
    mmoStateLine(guildId, lang, now),
    `### ${t('setup.mmo.whatTitle', lang)}`,
    ...MMO_SHOWCASE.map((feature) => t(`setup.mmo.features.${feature}`, lang)),
    `### ${t('setup.mmo.classicTitle', lang)}`,
    t('setup.mmo.classicWhat', lang),
    t('setup.mmo.classicKeeps', lang),
  ];
  if (state === 'classic' && demand > 0) lines.push(t('setup.overview.demand', lang, { count: demand }));
  if (state === 'classic' && features.mmoTrialUsed) lines.push(t('setup.mmo.trialAlreadyUsed', lang));
  lines.push(t('setup.overview.adminOnly', lang));

  const buttons = [];
  if (state !== 'full') {
    buttons.push(new ButtonBuilder().setCustomId('setup:mmo:full').setLabel(t('setup.mmo.btnEnable', lang)).setEmoji('✨').setStyle(ButtonStyle.Success));
  }
  if (state === 'classic' && !features.mmoTrialUsed) {
    buttons.push(new ButtonBuilder().setCustomId('setup:mmo:trial').setLabel(t('setup.mmo.btnTrial', lang)).setEmoji('🧪').setStyle(ButtonStyle.Primary));
  }
  if (state !== 'classic') {
    buttons.push(new ButtonBuilder().setCustomId('setup:mmo:classic').setLabel(t('setup.mmo.btnClassic', lang)).setEmoji('🪙').setStyle(ButtonStyle.Secondary));
  }

  const embed = baseEmbed(t('setup.mmo.title', lang), lang).setDescription(lines.join('\n\n'));
  const components = [navRow('mmo', lang)];
  if (buttons.length) components.push(new ActionRowBuilder().addComponents(...buttons));
  return { embeds: [embed], components };
}

function buildClassicConfirm(lang) {
  const embed = baseEmbed(t('setup.mmo.confirmTitle', lang), lang)
    .setColor(PYXIE_COLORS.gold || '#f59e0b')
    .setDescription([t('setup.mmo.confirmBody', lang), t('setup.mmo.classicKeeps', lang)].join('\n\n'));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup:mmo:classic_confirm').setLabel(t('setup.mmo.btnConfirmClassic', lang)).setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('setup:go:mmo').setLabel(t('setup.mmo.btnKeep', lang)).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [navRow('mmo', lang), row] };
}

function buildChannelsSection(guild, lang) {
  const features = guildFeatures.getGuildFeatures(guild?.id);
  const embed = baseEmbed(t('setup.channels.title', lang), lang).setDescription(
    [
      t('setup.channels.intro', lang),
      `### ${guildFeatures.FEATURE_GROUPS.mmo.emoji} ${t('setup.groups.mmo', lang)}`,
      channelList(features.channels.mmo, lang),
      `### ${guildFeatures.FEATURE_GROUPS.games.emoji} ${t('setup.groups.games', lang)}`,
      channelList(features.channels.games, lang),
      t('setup.channels.threads', lang),
    ].join('\n\n')
  );

  const picker = (group) =>
    new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId(`setup:chan:${group}`)
        .setPlaceholder(t(`setup.channels.pick_${group}`, lang))
        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setMinValues(0)
        .setMaxValues(guildFeatures.MAX_CHANNELS)
        .setDefaultChannels(features.channels[group].slice(0, guildFeatures.MAX_CHANNELS))
    );
  const clear = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup:chanclear:mmo').setLabel(t('setup.channels.clear_mmo', lang)).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('setup:chanclear:games').setLabel(t('setup.channels.clear_games', lang)).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [navRow('channels', lang), picker('mmo'), picker('games'), clear] };
}

function buildModulesSection(guild, lang) {
  const features = guildFeatures.getGuildFeatures(guild?.id);
  const embed = baseEmbed(t('setup.modules.title', lang), lang).setDescription(
    [
      t('setup.modules.intro', lang),
      ...TOGGLEABLE_GROUPS.map((group) => {
        const enabled = !features.disabled.includes(group);
        return `• **${guildFeatures.FEATURE_GROUPS[group].emoji} ${t(`setup.groups.${group}`, lang)}:** ${t(enabled ? 'setup.modules.on' : 'setup.modules.off', lang)}\n${t(`setup.modules.desc_${group}`, lang)}`;
      }),
      t('setup.modules.mmoHint', lang),
    ].join('\n\n')
  );
  const row = new ActionRowBuilder().addComponents(
    ...TOGGLEABLE_GROUPS.map((group) => {
      const enabled = !features.disabled.includes(group);
      return new ButtonBuilder()
        .setCustomId(`setup:mod:${group}`)
        .setLabel(`${t(`setup.groups.${group}`, lang)}: ${t(enabled ? 'setup.modules.onShort' : 'setup.modules.offShort', lang)}`)
        .setEmoji(guildFeatures.FEATURE_GROUPS[group].emoji)
        .setStyle(enabled ? ButtonStyle.Success : ButtonStyle.Secondary);
    })
  );
  return { embeds: [embed], components: [navRow('modules', lang), row] };
}

function buildDedicatedSection(guild, feature, lang) {
  const channelId = dedicatedChannelOf(guild?.id, feature);
  const embed = baseEmbed(t(`setup.dedicated.${feature}.title`, lang), lang).setDescription(
    [
      t(`setup.dedicated.${feature}.body`, lang),
      `**${t('setup.dedicated.current', lang)}:** ${channelId ? `<#${channelId}>` : t('setup.notSet', lang)}`,
      t('setup.dedicated.unique', lang),
    ].join('\n\n')
  );
  const select = new ChannelSelectMenuBuilder()
    .setCustomId(`setup:ded:${feature}`)
    .setPlaceholder(t('setup.dedicated.pick', lang))
    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setMinValues(1)
    .setMaxValues(1);
  if (channelId) select.setDefaultChannels([channelId]);

  const components = [navRow(feature, lang), new ActionRowBuilder().addComponents(select)];
  if (feature === 'welcome') {
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('setup:welcomepanel').setLabel(t('setup.dedicated.welcome.editBtn', lang)).setEmoji('✏️').setStyle(ButtonStyle.Primary)
      )
    );
  }
  return { embeds: [embed], components };
}

function buildLanguageSection(guild, lang) {
  const embed = baseEmbed(t('setup.language.title', lang), lang).setDescription(
    [t('setup.language.body', lang), lang === 'pt' ? '🇧🇷 **Português (Brasil)**' : '🇺🇸 **English**'].join('\n\n')
  );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup:lang:pt').setLabel('Português').setEmoji('🇧🇷').setStyle(lang === 'pt' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('setup:lang:en').setLabel('English').setEmoji('🇺🇸').setStyle(lang === 'en' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [navRow('language', lang), row] };
}

function buildSetupView(guild, section = 'overview', source = null, { notice = null, now = Date.now() } = {}) {
  const lang = langOf(source, guild?.id);
  let view;
  if (section === 'mmo') view = buildMmoSection(guild, lang, now);
  else if (section === 'channels') view = buildChannelsSection(guild, lang);
  else if (section === 'modules') view = buildModulesSection(guild, lang);
  else if (DEDICATED[section]) view = buildDedicatedSection(guild, section, lang);
  else if (section === 'language') view = buildLanguageSection(guild, lang);
  else view = buildOverview(guild, lang, now);
  return { content: notice || '', ...view, allowedMentions: { parse: [] } };
}

/** Visão geral (mantida com este nome para os testes e chamadas antigas). */
function buildSetupDashboard(guild, source = null) {
  return buildSetupView(guild, 'overview', source);
}

// ---------------------------------------------------------------------------------------------
// Bloqueios por servidor (modo clássico, módulo desligado, canal não liberado)
// ---------------------------------------------------------------------------------------------

/**
 * Resposta para quem tentou um comando bloqueado aqui. Quem administra recebe a vitrine do
 * Mundo Pyxie com os botões; as demais pessoas ficam sabendo como pedir, e o pedido entra na
 * contagem de procura que a administração vê no painel.
 */
function handleAccessDenied(access, source, member, now = Date.now()) {
  const lang = langOf(source);
  const guildId = source?.guildId || source?.guild?.id;
  const groupName = t(`setup.groups.${access.group}`, lang);
  const isAdmin = hasAdminPerms(member);

  if (access.reason === 'classic') {
    if (isAdmin) {
      const pitch = buildMmoSection(source?.guild || { id: guildId }, lang, now);
      return {
        content: t('setup.blocked.classicAdmin', lang),
        embeds: pitch.embeds,
        components: pitch.components.slice(1),
        allowedMentions: { parse: [] },
      };
    }
    const userId = member?.user?.id || member?.id || source?.user?.id || source?.author?.id;
    const count = guildFeatures.recordMmoDemand(guildId, userId, now);
    return {
      content: [t('setup.blocked.classicMember', lang), t('setup.blocked.demand', lang, { count })].join('\n\n'),
      allowedMentions: { parse: [] },
    };
  }
  if (access.reason === 'disabled') {
    return { content: t('setup.blocked.disabled', lang, { group: groupName }), allowedMentions: { parse: [] } };
  }
  return {
    content: t('setup.blocked.channel', lang, { group: groupName, channels: channelList(access.channels, lang) }),
    allowedMentions: { parse: [] },
  };
}

/**
 * Para botões e menus dos módulos: se o servidor bloqueia o comando aqui, responde em privado e
 * devolve true para o módulo parar.
 */
async function denyInteractionIfBlocked(interaction, commandName) {
  const access = guildFeatures.checkCommandAccess({
    guildId: interaction.guildId,
    channel: interaction.channel || { id: interaction.channelId },
    command: commandName,
  });
  if (access.allowed) return false;
  const payload = { ...handleAccessDenied(access, interaction, interaction.member), ephemeral: true };
  if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => null);
  else await interaction.reply(payload).catch(() => null);
  return true;
}

// ---------------------------------------------------------------------------------------------
// Comando
// ---------------------------------------------------------------------------------------------

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  // O painel é só de quem administra: o index.js abre o deferReply em modo privado
  ephemeral: true,
  SECTIONS,
  MMO_SHOWCASE,
  buildSetupDashboard,
  buildSetupView,
  handleAccessDenied,
  denyInteractionIfBlocked,
  hasAdminPerms,

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Pyxie control center for your server: modules, MMO mode, channels and more.')
    .setDescriptionLocalizations({
      'pt-BR': 'Central da Pyxie no servidor: módulos, modo MMO, canais e tudo mais.',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) =>
      opt
        .setName('section')
        .setNameLocalizations({ 'pt-BR': 'secao' })
        .setDescription('Open a specific section directly')
        .setDescriptionLocalizations({ 'pt-BR': 'Abre direto uma seção do painel' })
        .setRequired(false)
        .addChoices(
          { name: 'Overview', name_localizations: { 'pt-BR': 'Visão geral' }, value: 'overview' },
          { name: 'Pyxie World (RPG/MMO)', name_localizations: { 'pt-BR': 'Mundo Pyxie (RPG/MMO)' }, value: 'mmo' },
          { name: 'Allowed channels', name_localizations: { 'pt-BR': 'Canais permitidos' }, value: 'channels' },
          { name: 'Server modules', name_localizations: { 'pt-BR': 'Módulos do servidor' }, value: 'modules' },
          { name: 'Welcome', name_localizations: { 'pt-BR': 'Boas-vindas' }, value: 'welcome' },
          { name: 'Vent channel', name_localizations: { 'pt-BR': 'Desabafos' }, value: 'vent' },
          { name: 'Daily tarot', name_localizations: { 'pt-BR': 'Tarot diário' }, value: 'tarot' },
          { name: 'Tickets', name_localizations: { 'pt-BR': 'Tickets' }, value: 'tickets' },
          { name: 'Language', name_localizations: { 'pt-BR': 'Idioma' }, value: 'language' }
        )
    ),

  async executeSlash({ interaction }) {
    const respond = (payload) =>
      interaction.deferred || interaction.replied ? interaction.editReply(payload) : interaction.reply({ ...payload, ephemeral: true });

    if (!interaction.guild) {
      return respond({ content: t('partnerships.guild_only', interaction) });
    }
    if (!hasAdminPerms(interaction.member)) {
      return respond({ content: t('admin.noPermission', interaction) });
    }
    const section = interaction.options?.getString?.('section') || 'overview';
    return respond(buildSetupView(interaction.guild, SECTIONS.includes(section) ? section : 'overview', interaction));
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
      return message.reply(t('setup.saved', message));
    }

    if (sub === 'language' || sub === 'idioma' || sub === 'lang') {
      const choice = (args[1] || '').toLowerCase();
      const selected = setGuildLanguage(message.guildId, choice.startsWith('en') ? 'en' : 'pt');
      return message.reply(t('setup.language.changed', selected));
    }

    const aliasesBySection = { mmo: 'mmo', canais: 'channels', channels: 'channels', modulos: 'modules', modules: 'modules', tarot: 'tarot', tickets: 'tickets', desabafos: 'vent', vent: 'vent' };
    return message.reply(buildSetupView(message.guild, aliasesBySection[sub] || 'overview', message));
  },

  isSetupInteraction(interaction) {
    const id = interaction?.customId;
    return typeof id === 'string' && (id.startsWith('setup:') || id.startsWith('setup_lang:') || id.startsWith('setup_refresh:'));
  },

  async handleSetupInteraction(interaction) {
    const lang = langOf(interaction);
    if (!interaction.guild || !hasAdminPerms(interaction.member)) {
      return interaction.reply({ content: t('setup.adminOnlyAction', lang), ephemeral: true });
    }

    const guild = interaction.guild;
    const guildId = interaction.guildId;
    const [prefix, action, arg] = interaction.customId.split(':');
    const show = (section, notice = null) => {
      const view = buildSetupView(guild, section, interaction, { notice });
      return interaction.deferred || interaction.replied ? interaction.editReply(view) : interaction.update(view);
    };

    // Botões antigos (painel anterior)
    if (prefix === 'setup_lang') {
      setGuildLanguage(guildId, action);
      return show('language', t('setup.language.changed', action));
    }
    if (prefix === 'setup_refresh') return show('overview');

    if (action === 'nav') return show(SECTIONS.includes(interaction.values?.[0]) ? interaction.values[0] : 'overview');
    if (action === 'go') return show(SECTIONS.includes(arg) ? arg : 'overview');

    if (action === 'mmo') {
      // Vindo de uma mensagem pública (comando bloqueado), a resposta vai em privado
      const reply = (section, notice) =>
        interaction.message?.flags?.has?.(64)
          ? show(section, notice)
          : interaction.reply({ ...buildSetupView(guild, section, interaction, { notice }), ephemeral: true });

      if (arg === 'full') {
        guildFeatures.setMmoMode(guildId, 'full', { by: interaction.user.id });
        return reply('mmo', t('setup.mmo.enabled', lang));
      }
      if (arg === 'trial') {
        const result = guildFeatures.startMmoTrial(guildId, { by: interaction.user.id });
        const notice = result.ok
          ? t('setup.mmo.trialStarted', lang, { time: ts(result.until) })
          : t(result.reason === 'already_full' ? 'setup.mmo.alreadyFull' : 'setup.mmo.trialAlreadyUsed', lang);
        return reply('mmo', notice);
      }
      if (arg === 'classic') {
        const view = { content: '', ...buildClassicConfirm(lang), allowedMentions: { parse: [] } };
        return interaction.message?.flags?.has?.(64) ? interaction.update(view) : interaction.reply({ ...view, ephemeral: true });
      }
      if (arg === 'classic_confirm') {
        guildFeatures.setMmoMode(guildId, 'classic', { by: interaction.user.id });
        return show('mmo', t('setup.mmo.classicDone', lang));
      }
    }

    if (action === 'chan' && (arg === 'mmo' || arg === 'games')) {
      guildFeatures.setGroupChannels(guildId, arg, interaction.values || []);
      // O canal único antigo dos duelos sai de cena quando a lista nova é usada
      if (arg === 'games') updateGuildConfig(guildId, { gamesChannelId: null });
      return show('channels', t('setup.channels.saved', lang));
    }
    if (action === 'chanclear' && (arg === 'mmo' || arg === 'games')) {
      guildFeatures.setGroupChannels(guildId, arg, []);
      if (arg === 'games') updateGuildConfig(guildId, { gamesChannelId: null });
      return show('channels', t('setup.channels.cleared', lang));
    }

    if (action === 'mod' && TOGGLEABLE_GROUPS.includes(arg)) {
      const enabled = guildFeatures.isGroupEnabled(guildId, arg);
      guildFeatures.setGroupEnabled(guildId, arg, !enabled);
      return show('modules', t(enabled ? 'setup.modules.turnedOff' : 'setup.modules.turnedOn', lang, { group: t(`setup.groups.${arg}`, lang) }));
    }

    if (action === 'ded' && DEDICATED[arg]) {
      const channelId = interaction.values?.[0];
      const channel = channelId ? guild.channels?.cache?.get(channelId) : null;
      if (!channelId) return show(arg);
      const setCommand = require('./set');
      const assignRes = assignDedicatedChannel(guildId, DEDICATED[arg], channelId);
      const feedback = setCommand.buildChannelFeedback(assignRes, interaction);

      if (arg === 'welcome' && !feedback.isAlreadySet) setWelcomeChannel(guildId, channelId);
      if (arg === 'vent' && !feedback.isAlreadySet && channel) {
        const { scheduleStickyReposition, cleanupOldChannelSticky } = require('../services/ventService');
        if (assignRes.previousChannelId && assignRes.previousChannelId !== channelId) {
          await cleanupOldChannelSticky(guild, assignRes.previousChannelId).catch(() => null);
        }
        scheduleStickyReposition(guild, channel);
      }

      const notice = [feedback.text, feedback.isAlreadySet ? null : t('setup.dedicated.saved', lang, { channel: `<#${channelId}>` })]
        .filter(Boolean)
        .join('\n\n');
      await show(arg, notice);
      if (arg === 'tickets' && channel) {
        await interaction.followUp({ ...setCommand.buildCategorySelectionPayload(channel, '', interaction), ephemeral: true }).catch(() => null);
      }
      return null;
    }

    if (action === 'welcomepanel') {
      const setCommand = require('./set');
      return interaction.reply({ ...setCommand.buildWelcomeControlPanel(guild, getWelcomeConfig(guildId)), ephemeral: true });
    }

    if (action === 'lang' && (arg === 'pt' || arg === 'en')) {
      setGuildLanguage(guildId, arg);
      return show('language', t('setup.language.changed', arg));
    }

    return show('overview');
  },
};
