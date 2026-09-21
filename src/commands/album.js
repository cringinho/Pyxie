const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const {
  TOTAL_CARDS,
  getCardByNumber,
  getCardAssetPath,
  getLockedAssetPath,
} = require('../data/tarotCardsCatalog');
const {
  getUserAlbum,
  getAlbumStats,
  claimAchievement,
} = require('../services/tarotAlbumService');
const { t, getLanguage, formatCoins } = require('../utils/i18n');
const { getAnimatedEmoji } = require('../utils/serverEmojis');

const name = 'py-album';
const aliases = ['album', 'albumdetarot', 'py-albumdetarot', 'tarot-album', 'py-tarot-album'];

/**
 * Formata timestamp em data legível local (DD/MM/YYYY HH:mm).
 */
function formatDiscoveryDate(timestamp, lang = 'pt') {
  if (!timestamp) return '---';
  const date = new Date(timestamp);
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Constrói a visualização da Tab 1: Folhear Cartas (1 a 78).
 */
function buildCardsView(userId, pageNumber, source = null) {
  const page = Math.max(1, Math.min(TOTAL_CARDS, Number.parseInt(pageNumber, 10) || 1));
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const card = getCardByNumber(page);
  const userAlbum = getUserAlbum(userId);
  const stats = getAlbumStats(userId, lang);

  const isDiscovered = userAlbum.discoveredCards.includes(page);
  const discoveryTimestamp = userAlbum.firstDiscoveryDates[String(page)];
  const discoveryDateStr = formatDiscoveryDate(discoveryTimestamp, lang);

  const guild = source?.guild || (source?.name ? source : null);
  const isCringelandia = guild?.id === '1453890868980482090';

  let embedColor = isDiscovered ? '#9b5de5' : '#475569';
  if (isDiscovered && card.suit === 'major') embedColor = '#E60067';

  const collectorHeader = t('album.collector', source, {
    user: userId,
    discovered: stats.discoveredCount,
    percent: stats.percent,
  });

  const suitName = isEn ? card.suitNameEn : card.suitNamePt;

  let cardFieldsDesc = '';
  if (isDiscovered) {
    cardFieldsDesc = [
      `🔢 **${t('album.position', source)}:** **#${String(page).padStart(2, '0')}/${TOTAL_CARDS}**`,
      `🔮 **${t('album.name', source)}:** **${card.num ? `${card.num}. ` : ''}${card.name}**`,
      `${card.suitEmoji} **${t('album.suit', source)}:** **${suitName}**`,
      `🏷️ **Palavras-chave:** *${card.keywords.join('  •  ')}*`,
      '',
      `✨ **${t('album.status', source)}:** **${t('album.statusDiscovered', source, { date: discoveryDateStr })}**`,
      `📜 **Mensagem:** *"${card.upright}"*`,
    ].join('\n');
  } else {
    cardFieldsDesc = [
      `🔢 **${t('album.position', source)}:** **#${String(page).padStart(2, '0')}/${TOTAL_CARDS}**`,
      `🔮 **${t('album.name', source)}:** **${t('album.lockedName', source)}**`,
      `${card.suitEmoji} **${t('album.suit', source)}:** **${suitName}**`,
      '',
      `🔒 **${t('album.status', source)}:** **${t('album.statusLocked', source)}**`,
      '',
      `> ${t('album.lockedDesc', source)}`,
    ].join('\n');
  }

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${getAnimatedEmoji(guild, ['book', 'tarot', 'magic'], '📖')}  ✦  ${t('album.title', source)}`)
    .setDescription(`${collectorHeader}\n\n${cardFieldsDesc}`)
    .setImage('attachment://card.webp')
    .setFooter({ text: `Pyxie • Carta #${page} de ${TOTAL_CARDS}` })
    .setTimestamp();

  const assetPath = isDiscovered ? getCardAssetPath(page) : getLockedAssetPath();
  const attachment = new AttachmentBuilder(assetPath, { name: 'card.webp' });

  // Linha 1: Navegação de Páginas
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`album:first:${userId}:${page}`)
      .setLabel(t('album.btnFirst', source))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`album:prev:${userId}:${page}`)
      .setLabel(t('album.btnPrev', source))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`album:goto:${userId}:${page}`)
      .setLabel(t('album.btnGoto', source))
      .setEmoji('🔍')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`album:next:${userId}:${page}`)
      .setLabel(t('album.btnNext', source))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= TOTAL_CARDS),
    new ButtonBuilder()
      .setCustomId(`album:last:${userId}:${page}`)
      .setLabel(t('album.btnLast', source))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= TOTAL_CARDS)
  );

  // Linha 2: Abas (Cartas vs Conquistas)
  const tabRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`album:tab_cards:${userId}:${page}`)
      .setLabel(t('album.btnBackToAlbum', source))
      .setEmoji('📖')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`album:tab_achievements:${userId}:${page}`)
      .setLabel(
        stats.readyToClaimCount > 0
          ? `${t('album.btnAchievements', source)} (${stats.readyToClaimCount})`
          : t('album.btnAchievements', source)
      )
      .setEmoji('🏆')
      .setStyle(stats.readyToClaimCount > 0 ? ButtonStyle.Danger : ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    files: [attachment],
    components: [navRow, tabRow],
  };
}

/**
 * Constrói a visualização da Tab 2: Conquistas do Álbum.
 */
function buildAchievementsView(userId, pageNumber, source = null) {
  const page = Math.max(1, Math.min(TOTAL_CARDS, Number.parseInt(pageNumber, 10) || 1));
  const lang = getLanguage(source);
  const stats = getAlbumStats(userId, lang);
  const guild = source?.guild || (source?.name ? source : null);

  const summary = t('album.achievementsSummary', source, {
    claimed: stats.claimedCount,
    ready: stats.readyToClaimCount,
  });

  const achievementsList = stats.achievements.map((a) => {
    let statusLine = '';
    if (a.isClaimed) {
      statusLine = `> ${t('album.claimedBadge', source)} (+${a.rewardCoins} 🪙)`;
    } else if (a.isReady) {
      statusLine = `> **${t('album.readyBadge', source)}** (+${a.rewardCoins} 🪙) — *Clique no botão abaixo para resgatar!*`;
    } else {
      statusLine = `> ⏳ **Progresso:** \`${a.progressBar}\` **${a.current}/${a.target}** (${a.percent}%) • Recompensa: **+${a.rewardCoins} 🪙**`;
    }

    return [
      `🏆 **${a.name}**`,
      `> *${a.desc}*`,
      statusLine,
    ].join('\n');
  }).join('\n\n');

  const desc = [
    `📊 **${summary}**`,
    '',
    achievementsList,
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(stats.readyToClaimCount > 0 ? '#10b981' : '#f59e0b')
    .setTitle(`${getAnimatedEmoji(guild, ['trophy', 'star', 'magic'], '🏆')}  ✦  ${t('album.achievementsTitle', source)}`)
    .setDescription(desc)
    .setFooter({ text: 'Pyxie • Sistema de Conquistas do Tarot' })
    .setTimestamp();

  const components = [];

  // Botões de Resgate para Conquistas Prontas
  const readyAchievements = stats.achievements.filter((a) => a.isReady);
  if (readyAchievements.length > 0) {
    const claimRow = new ActionRowBuilder();
    for (const a of readyAchievements.slice(0, 5)) {
      claimRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`album:claim:${a.id}:${userId}:${page}`)
          .setLabel(t('album.claimBtn', source, { coins: a.rewardCoins }))
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎁')
      );
    }
    components.push(claimRow);
  }

  // Linha de Abas (Alternar entre Álbum e Conquistas)
  const tabRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`album:tab_cards:${userId}:${page}`)
      .setLabel(t('album.btnBackToAlbum', source))
      .setEmoji('📖')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`album:tab_achievements:${userId}:${page}`)
      .setLabel(t('album.btnAchievements', source))
      .setEmoji('🏆')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true)
  );
  components.push(tabRow);

  return {
    embeds: [embed],
    files: [],
    components,
  };
}

function isAlbumInteraction(interaction) {
  if (!interaction) return false;
  if (interaction.isButton()) {
    return interaction.customId.startsWith('album:');
  }
  if (interaction.isModalSubmit()) {
    return interaction.customId.startsWith('album:modal_goto');
  }
  return false;
}

async function handleAlbumInteraction(interaction) {
  const customId = interaction.customId;

  // 1. Tratamento de Modal Submit: "Ir para Carta"
  if (interaction.isModalSubmit() && customId.startsWith('album:modal_goto')) {
    const parts = customId.split(':');
    const targetUserId = parts[2];
    const currentPage = Number.parseInt(parts[3], 10) || 1;

    if (interaction.user.id !== targetUserId) {
      await interaction.reply({
        content: t('album.onlyAuthor', interaction),
        flags: 64,
      });
      return;
    }

    const inputVal = interaction.fields.getTextInputValue('album:input_page')?.trim();
    const targetPage = Number.parseInt(inputVal, 10);

    if (Number.isNaN(targetPage) || targetPage < 1 || targetPage > TOTAL_CARDS) {
      await interaction.reply({
        content: t('album.gotoModalInvalid', interaction),
        flags: 64,
      });
      return;
    }

    const view = buildCardsView(targetUserId, targetPage, interaction);
    await interaction.update({
      embeds: view.embeds,
      files: view.files,
      components: view.components,
    });
    return;
  }

  if (!interaction.isButton()) return;

  const parts = customId.split(':');
  const action = parts[1]; // first, prev, next, last, goto, tab_cards, tab_achievements, claim
  let targetUserId = parts[2];
  let page = Number.parseInt(parts[3], 10) || 1;

  // Para 'claim', a estrutura é album:claim:achievementId:userId:page
  let claimAchievementId = null;
  if (action === 'claim') {
    claimAchievementId = parts[2];
    targetUserId = parts[3];
    page = Number.parseInt(parts[4], 10) || 1;
  }

  // Validação de Propriedade
  if (interaction.user.id !== targetUserId) {
    await interaction.reply({
      content: t('album.onlyAuthor', interaction),
      flags: 64,
    });
    return;
  }

  // Ação: Abrir Modal "Ir para Carta"
  if (action === 'goto') {
    const modal = new ModalBuilder()
      .setCustomId(`album:modal_goto:${targetUserId}:${page}`)
      .setTitle(t('album.gotoModalTitle', interaction));

    const pageInput = new TextInputBuilder()
      .setCustomId('album:input_page')
      .setLabel(t('album.gotoModalInputLabel', interaction))
      .setPlaceholder(t('album.gotoModalInputPlaceholder', interaction))
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(2)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(pageInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
    return;
  }

  // Ação: Resgate de Conquista
  if (action === 'claim' && claimAchievementId) {
    const lang = getLanguage(interaction);
    const result = await claimAchievement(targetUserId, claimAchievementId, lang);

    if (!result.success) {
      await interaction.reply({
        content: t('album.claimError', interaction),
        flags: 64,
      });
      return;
    }

    const achName = lang === 'en' ? result.achievement.nameEn : result.achievement.namePt;
    await interaction.reply({
      content: t('album.claimSuccess', interaction, {
        name: achName,
        coins: result.rewardCoins,
        balance: result.newBalance,
      }),
      flags: 64,
    });

    // Atualiza a visualização das conquistas
    const updatedView = buildAchievementsView(targetUserId, page, interaction);
    await interaction.message.edit({
      embeds: updatedView.embeds,
      files: updatedView.files,
      components: updatedView.components,
    });
    return;
  }

  // Ação: Trocar para Tab Conquistas
  if (action === 'tab_achievements') {
    const view = buildAchievementsView(targetUserId, page, interaction);
    await interaction.update({
      embeds: view.embeds,
      files: view.files,
      components: view.components,
    });
    return;
  }

  // Ação: Trocar para Tab Cartas
  if (action === 'tab_cards') {
    const view = buildCardsView(targetUserId, page, interaction);
    await interaction.update({
      embeds: view.embeds,
      files: view.files,
      components: view.components,
    });
    return;
  }

  // Ações de Navegação
  let newPage = page;
  if (action === 'first') newPage = 1;
  else if (action === 'prev') newPage = Math.max(1, page - 1);
  else if (action === 'next') newPage = Math.min(TOTAL_CARDS, page + 1);
  else if (action === 'last') newPage = TOTAL_CARDS;

  const view = buildCardsView(targetUserId, newPage, interaction);
  await interaction.update({
    embeds: view.embeds,
    files: view.files,
    components: view.components,
  });
}

module.exports = {
  name,
  aliases,
  category: 'tarot',
  isAlbumInteraction,
  handleAlbumInteraction,
  buildCardsView,
  buildAchievementsView,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Open and browse your 78-card Tarot Album and claim achievements.')
    .setDescriptionLocalizations({
      'pt-BR': 'Abra e folheie seu Álbum de 78 cartas do Tarot e resgate conquistas.',
    })
    .addIntegerOption((option) =>
      option
        .setName('pagina')
        .setDescription('Card number to open directly in the album (1 to 78)')
        .setDescriptionLocalizations({
          'pt-BR': 'Número da carta para abrir diretamente no álbum (1 a 78)',
        })
        .setMinValue(1)
        .setMaxValue(TOTAL_CARDS)
        .setRequired(false)
    ),
  async executeSlash({ interaction }) {
    const targetPage = interaction.options.getInteger('pagina') || 1;
    const view = buildCardsView(interaction.user.id, targetPage, interaction);

    await interaction.editReply({
      embeds: view.embeds,
      files: view.files,
      components: view.components,
    });
  },
  async executePrefix({ message, args }) {
    let targetPage = 1;
    if (args && args.length > 0) {
      const parsed = Number.parseInt(args[0], 10);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_CARDS) {
        targetPage = parsed;
      }
    }

    const view = buildCardsView(message.author.id, targetPage, message);
    await message.reply({
      embeds: view.embeds,
      files: view.files,
      components: view.components,
    });
  },
};

