const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { INVITE } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

// Permissões recomendadas:
// View Channel (1024) + Send Messages (2048) + Send in Threads (274877906944) +
// Embed Links (16384) + Attach Files (32768) + Read History (65536) +
// Add Reactions (64) + Use External Emojis (262144) + Manage Messages (8192)
const RECOMMENDED_PERMISSIONS = 277025770560n;
const ADMIN_PERMISSIONS = 8;

const DEFAULT_BOT_ID = '1543650200718155897';
const TOPGG_BOT_ID = '1453888365618270331';
const COMMUNITY_SERVER_URL = 'https://disboard.org/pt-br/server/1453890868980482090';
function getWebBonusUrl() {
  const base = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';
  return `${base.replace(/\/$/, '')}/bonus`;
}

function getInviteUrl(clientId = null, permissions = RECOMMENDED_PERMISSIONS) {
  const id = clientId || process.env.DISCORD_CLIENT_ID || DEFAULT_BOT_ID;
  return `https://discord.com/oauth2/authorize?client_id=${id}&permissions=${permissions}&scope=bot%20applications.commands`;
}

function buildInviteComponents(clientId, isEn = false) {
  const { getEmoji } = require('../utils/appEmojis');
  const recommendedUrl = getInviteUrl(clientId, RECOMMENDED_PERMISSIONS);
  const adminUrl = getInviteUrl(clientId, ADMIN_PERMISSIONS);
  const voteUrl = `https://top.gg/bot/${TOPGG_BOT_ID}/vote`;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(isEn ? 'Add Pyxie (Recommended)' : 'Adicionar Pyxie (Recomendado)')
      .setEmoji(getEmoji('SPARKLES'))
      .setStyle(ButtonStyle.Link)
      .setURL(recommendedUrl),
    new ButtonBuilder()
      .setLabel(isEn ? 'Admin Invite' : 'Convite Administrador')
      .setEmoji(getEmoji('CROWN'))
      .setStyle(ButtonStyle.Link)
      .setURL(adminUrl)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(isEn ? 'Community Server' : 'Servidor da Comunidade')
      .setEmoji('🏰')
      .setStyle(ButtonStyle.Link)
      .setURL(COMMUNITY_SERVER_URL),
    new ButtonBuilder()
      .setLabel(isEn ? 'Vote on Top.gg' : 'Votar no Top.gg')
      .setEmoji(getEmoji('STAR'))
      .setStyle(ButtonStyle.Link)
      .setURL(voteUrl),
    new ButtonBuilder()
      .setLabel(isEn ? 'Web Bonus (10s)' : 'Bônus Web (10s)')
      .setEmoji(getEmoji('GIFT'))
      .setStyle(ButtonStyle.Link)
      .setURL(getWebBonusUrl())
  );

  return [row1, row2];
}

function buildInviteEmbed(client, guildOrSource = null, adminOnly = false) {
  const lang = getLanguage(guildOrSource);
  const isEn = lang === 'en';
  const clientId = client?.user?.id || process.env.DISCORD_CLIENT_ID || DEFAULT_BOT_ID;

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple || '#9b5de5')
    .setTitle(t('invite.title', guildOrSource))
    .setDescription(t('invite.desc', guildOrSource))
    .addFields(
      {
        name: t('invite.careersTitle', guildOrSource),
        value: t('invite.careersDesc', guildOrSource),
        inline: false,
      },
      {
        name: t('invite.dungeonsTitle', guildOrSource),
        value: t('invite.dungeonsDesc', guildOrSource),
        inline: false,
      },
      {
        name: t('invite.economyTitle', guildOrSource),
        value: t('invite.economyDesc', guildOrSource),
        inline: false,
      },
      {
        name: t('invite.tarotTitle', guildOrSource),
        value: t('invite.tarotDesc', guildOrSource),
        inline: false,
      }
    )
    .setFooter({ text: t('invite.footer', guildOrSource) })
    .setTimestamp();

  const avatarUrl = client?.user?.displayAvatarURL({ dynamic: true, size: 256 });
  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
  }

  const components = buildInviteComponents(clientId, isEn);

  return { embeds: [embed], components };
}

module.exports = {
  name: INVITE,
  aliases: ['invite', 'convite', 'py-convite', 'py-invite', 'adicionar', 'addbot', 'botinvite'],
  getInviteUrl,
  getWebBonusUrl,
  buildInviteEmbed,
  data: new SlashCommandBuilder()
    .setName(INVITE)
    .setDescription('Get official invite links to add Pyxie to your Discord server.')
    .setDescriptionLocalizations({
      'pt-BR': 'Obtenha links oficiais de convite para adicionar a Pyxie ao seu servidor.',
    })
    .addBooleanOption((option) =>
      option
        .setName('admin')
        .setNameLocalizations({
          'en-US': 'admin',
          'en-GB': 'admin',
          'pt-BR': 'administrador',
        })
        .setDescription('Show administrator permissions invite directly.')
        .setDescriptionLocalizations({
          'pt-BR': 'Exibe diretamente o convite com permissão de Administrador.',
        })
        .setRequired(false)
    ),
  async executePrefix({ message, args, client }) {
    const discordClient = client || message.client;
    const adminOnly = Boolean(args && args.some((a) => a.toLowerCase().includes('admin')));
    const view = buildInviteEmbed(discordClient, message, adminOnly);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const discordClient = interaction.client;
    const adminOnly =
      interaction.options.getBoolean('admin') ||
      interaction.options.getBoolean('administrador') ||
      false;
    const view = buildInviteEmbed(discordClient, interaction, adminOnly);
    await interaction.editReply(view);
  },
};
