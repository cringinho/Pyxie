const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require('discord.js');
const { t, setGuildLanguage, CRINGELANDIA_GUILD_ID } = require('../utils/i18n');
const { getEmoji } = require('../utils/appEmojis');
const { getVoteUrl } = require('./topgg');
const { emojify } = require('../utils/emojify');

/**
 * Primeiro contato da Pyxie com um servidor novo (guildCreate).
 *
 * O idioma inicial vem do idioma preferido do servidor (Community → preferredLocale).
 * Como a maioria dos servidores pequenos fica em en-US por padrão, a mensagem traz
 * botões para quem pode Gerenciar Servidor trocar o idioma na hora.
 */

const SITE_URL = 'https://pyxie.com.br';
const SUPPORT_URL = `${SITE_URL}/discord?ref=welcome`;
const LANG_BUTTON_PREFIX = 'onboard_lang:';
const CUSTOM_EMOJI = /^<a?:\w+:\d+>$/;

/** Emoji do catálogo do bot ou o Unicode de reserva. */
function icon(name, fallback) {
  const formatted = getEmoji(name);
  return CUSTOM_EMOJI.test(formatted || '') ? formatted : fallback;
}

/** Menção clicável de slash command (</nome:id>) quando o ID está em cache, senão `/nome`. */
function commandMention(client, name) {
  const cached = client?.application?.commands?.cache?.find?.((cmd) => cmd.name === name);
  return cached ? `</${name}:${cached.id}>` : `\`/${name}\``;
}

function detectInitialLanguage(guild) {
  if (guild?.id === CRINGELANDIA_GUILD_ID) return 'pt';
  const locale = String(guild?.preferredLocale || '').toLowerCase();
  return locale.startsWith('pt') ? 'pt' : 'en';
}

function buildWelcomeMessage(guild, client, lang) {
  const source = { lang, guild };
  const replacements = {
    guild: guild?.name || '',
    daily: commandMention(client, 'py-daily'),
    tarot: commandMention(client, 'py-tarot'),
    dungeon: commandMention(client, 'py-dungeon'),
    help: commandMention(client, 'py-help'),
    setup: commandMention(client, 'py-setup'),
    languageCmd: commandMention(client, 'py-language'),
    language: t(`growth.languageName.${lang}`, source),
    coin: icon('COIN', '🪙'),
    tarotIcon: icon('TAROT', '🔮'),
    dungeonIcon: icon('DUNGEON', '🕯️'),
    helpIcon: icon('6449spellbook', '📖'),
    globe: icon('16017pinkearth', '🌐'),
  };

  const description = [
    t('growth.welcome.intro', source, replacements),
    t('growth.welcome.startHeader', source, replacements),
    t('growth.welcome.daily', source, replacements),
    t('growth.welcome.tarot', source, replacements),
    t('growth.welcome.dungeon', source, replacements),
    t('growth.welcome.help', source, replacements),
    t('growth.welcome.setup', source, replacements),
    t('growth.welcome.languageHeader', source, replacements),
    t('growth.welcome.languageBody', source, replacements),
  ].join('\n\n');

  const embed = new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle(t('growth.welcome.title', source, { fairy: icon('fairy', '🧚') }))
    .setDescription(emojify(description))
    .setFooter({ text: t('growth.welcome.footer', source, replacements) })
    .setTimestamp();

  const languageRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${LANG_BUTTON_PREFIX}pt`)
      .setLabel(t('growth.languageName.pt', source))
      .setEmoji('🇧🇷')
      .setStyle(lang === 'pt' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${LANG_BUTTON_PREFIX}en`)
      .setLabel(t('growth.languageName.en', source))
      .setEmoji('🇺🇸')
      .setStyle(lang === 'en' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );

  const linksRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('growth.welcome.btnSite', source))
      .setEmoji(icon('9130heartweb', '🌐'))
      .setStyle(ButtonStyle.Link)
      .setURL(`${SITE_URL}/${lang === 'en' ? '?lang=en' : ''}`),
    new ButtonBuilder()
      .setLabel(t('growth.welcome.btnSupport', source))
      .setEmoji(icon('chat92', '💬'))
      .setStyle(ButtonStyle.Link)
      .setURL(SUPPORT_URL),
    new ButtonBuilder()
      .setLabel(t('growth.welcome.btnVote', source))
      .setEmoji(icon('MAGIC_BEAN', '🌱'))
      .setStyle(ButtonStyle.Link)
      .setURL(getVoteUrl(client?.user?.id))
  );

  return {
    embeds: [embed],
    components: [languageRow, linksRow],
    allowedMentions: { parse: [] },
  };
}

/** Primeiro canal de texto em que a Pyxie pode falar: canal de sistema ou o primeiro com permissão. */
function pickWelcomeChannel(guild, botMember) {
  const canSpeak = (channel) =>
    channel?.isTextBased?.() &&
    !channel.isThread?.() &&
    botMember &&
    channel.permissionsFor(botMember)?.has([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
    ]);

  if (canSpeak(guild.systemChannel)) return guild.systemChannel;
  return guild.channels.cache
    .filter(canSpeak)
    .sort((a, b) => (a.rawPosition ?? a.position ?? 0) - (b.rawPosition ?? b.position ?? 0))
    .first() || null;
}

async function sendGuildWelcome(guild, client) {
  const lang = detectInitialLanguage(guild);
  setGuildLanguage(guild.id, lang);

  const botMember = guild.members.me || (await guild.members.fetchMe().catch(() => null));
  const channel = pickWelcomeChannel(guild, botMember);
  if (!channel) return { sent: false, lang };

  if (client?.application?.commands && client.application.commands.cache.size === 0) {
    await client.application.commands.fetch().catch(() => null);
  }

  const message = await channel.send(buildWelcomeMessage(guild, client, lang)).catch(() => null);
  return { sent: Boolean(message), lang, channelId: channel.id };
}

function isWelcomeLanguageButton(customId) {
  return typeof customId === 'string' && customId.startsWith(LANG_BUTTON_PREFIX);
}

/** Troca o idioma do servidor pelos botões da mensagem de boas-vindas (exige Gerenciar Servidor). */
async function handleWelcomeLanguageButton(interaction) {
  const lang = interaction.customId.slice(LANG_BUTTON_PREFIX.length) === 'pt' ? 'pt' : 'en';
  const canManage = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);

  if (!interaction.guild || !canManage) {
    return interaction.reply({
      content: t('growth.welcome.langNoPermission', interaction),
      flags: MessageFlags.Ephemeral,
    });
  }

  setGuildLanguage(interaction.guild.id, lang);
  await interaction.update(buildWelcomeMessage(interaction.guild, interaction.client, lang));
  return interaction.followUp({
    content: t('growth.welcome.langChanged', { lang }, { language: t(`growth.languageName.${lang}`, { lang }) }),
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = {
  SITE_URL,
  commandMention,
  detectInitialLanguage,
  buildWelcomeMessage,
  pickWelcomeChannel,
  sendGuildWelcome,
  isWelcomeLanguageButton,
  handleWelcomeLanguageButton,
};
