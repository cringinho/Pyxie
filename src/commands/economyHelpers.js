const { EmbedBuilder } = require('discord.js');
const { PYXIE_COLORS, KUROMI_COLORS } = require('../utils/pyxieVoice');
const { getLanguage, t, formatCoins, formatRemaining } = require('../utils/i18n');

function buildCurrencyFields(currencies, source = null) {
  const lang = getLanguage(source);
  return currencies.map((currency) => ({
    name: `${currency.emoji} ${currency.label}`,
    value: (Number(currency.amount) || 0).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR'),
    inline: true,
  }));
}

function buildWalletEmbed(user, currencies, position, source = null) {
  const lang = getLanguage(source);
  const currencyLines = currencies.map((currency) =>
    `> ${currency.emoji} **${currency.label}:** ${(Number(currency.amount) || 0).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')}`
  );

  const placementText = position ? `#${position}` : t('wallet.unranked', source);

  const desc = [
    t('wallet.desc', source),
    '',
    t('wallet.balancesHeader', source),
    ...currencyLines,
    '',
    t('wallet.rankingHeader', source),
    t('wallet.placement', source, { rank: placementText }),
  ].join('\n');

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold)
    .setTitle(t('wallet.title', source, { user: user.displayName || user.username }))
    .setDescription(desc)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();
}

/**
 * Constrói o Embed de perfil com layout exuberante, espaçamento generoso e dados integrados.
 */
function buildProfileEmbed({
  user,
  account,
  spouse,
  rankPosition,
  professionLabel,
  equippedTitle,
  source = null,
  tarotStats = null,
  marriageDetails = null,
  museumArtsCount = 0,
  hasImageCard = false,
}) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const titlePrefix = equippedTitle ? `[${equippedTitle.emoji} ${equippedTitle.name}] ` : '';
  const coinsVal = Number(account?.coins) || 0;
  const magicBeansVal = Number(account?.magicBeans) || 0;
  const workVal = Number(account?.workCount) || 0;
  const rankStr = rankPosition ? `#${rankPosition} Global` : t('common.unranked', source);

  const dedicationLevel =
    workVal >= 50
      ? t('profile.dedicationMaster', source)
      : (workVal >= 20
        ? t('profile.dedicationVeteran', source)
        : (workVal >= 5 ? t('profile.dedicationPractitioner', source) : t('profile.dedicationNovice', source)));

  let bioText = t('profile.bioDefault', source);
  if (account?.bio && account.bio.trim()) {
    bioText = account.bio.trim();
  } else if (equippedTitle?.desc) {
    bioText = equippedTitle.desc;
  }

  const bioQuote = `> *« ${bioText} »*`;

  const descLines = [
    bioQuote,
    '',
    t('profile.treasureHeader', source),
    t('profile.coins', source, { coins: coinsVal.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR') }),
    t('profile.magicBeans', source, { beans: magicBeansVal.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR') }),
    t('profile.ranking', source, { rank: rankStr }),
    '',
    t('profile.careerHeader', source),
    t('profile.profession', source, { profession: professionLabel || t('profile.noProfession', source) }),
    t('profile.workCount', source, { count: workVal }),
    t('profile.dedication', source, { level: dedicationLevel }),
    '',
    t('profile.socialHeader', source),
  ];

  if (marriageDetails && marriageDetails.isMarried) {
    descLines.push(`> 💍 **${isEn ? 'Spouse' : 'Cônjuge'}:** ${marriageDetails.spouseName}`);
    descLines.push(`> ❤️ **${isEn ? 'Love Bar' : 'Barra do Amor'}:** **${marriageDetails.lovePoints}%** (${marriageDetails.marriageDays} ${isEn ? 'days' : 'dias'})`);
    if (marriageDetails.childrenCount > 0) {
      descLines.push(`> 👶 **${isEn ? 'Children' : 'Filhos'}:** **${marriageDetails.childrenCount}** ${isEn ? 'adopted' : 'adotado(s)'}`);
    }
    if (marriageDetails.vaultCoins > 0) {
      descLines.push(`> 🏦 **${isEn ? 'Family Vault' : 'Cofre Familiar'}:** **${marriageDetails.vaultCoins.toLocaleString()}** ${isEn ? 'Coins' : 'Moedas'}`);
    }
  } else {
    descLines.push(spouse ? t('profile.marriedTo', source, { spouse }) : t('profile.single', source));
  }

  if (tarotStats) {
    descLines.push('');
    descLines.push(`**🔮 ${isEn ? 'MYSTIC TAROT' : 'TAROT MÍSTICO'}**`);
    descLines.push(`> 📖 **${isEn ? 'Arcana Discovered' : 'Arcanos Descobertos'}:** **${tarotStats.discoveredCount}/78** (${tarotStats.percentage}%)`);
    descLines.push(`> 🏆 **${isEn ? 'Achievements' : 'Conquistas'}:** **${tarotStats.achievementsClaimed}/10**`);
  }

  if (museumArtsCount > 0) {
    descLines.push('');
    descLines.push(`**🎨 ${isEn ? '3D MUSEUM' : 'MUSEU 3D'}**`);
    descLines.push(`> 🏛️ **${isEn ? 'Exhibited Arts' : 'Obras no Acervo'}:** **${museumArtsCount}** ${isEn ? 'community art(s)' : 'arte(s) da comunidade'}`);
  }

  const { THEMES_CATALOG } = require('../services/economy');
  const equippedTheme = account?.equippedTheme && THEMES_CATALOG[account.equippedTheme]
    ? THEMES_CATALOG[account.equippedTheme]
    : THEMES_CATALOG.default;

  const embed = new EmbedBuilder()
    .setColor(equippedTheme?.color || PYXIE_COLORS.magenta || '#e60067')
    .setTitle(t('profile.title', source, { title: titlePrefix, user: user.displayName || user.username }))
    .setDescription(descLines.join('\n'))
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: '✦ Pyxie • pyxie.com.br' })
    .setTimestamp();

  if (hasImageCard) {
    embed.setImage('attachment://profile_card.png');
  }

  return embed;
}

function buildRankingEmbed(entries, memberMap, viewerRank, source = null) {
  const lang = getLanguage(source);
  const lines = entries.length
    ? entries.map((entry, index) => {
        const member = memberMap.get(entry.userId);
        const name = member?.displayName || (lang === 'en' ? `User ${entry.userId}` : `Usuário ${entry.userId}`);
        const beans = Number(entry.magicBeans) || 0;
        const beansText = beans > 0 ? `  •  🌱 **${beans} ${t('common.magicBeans', source)}**` : '';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `**#${index + 1}**`;
        return `${medal} **${name}**\n> 🪙 **${formatCoins(entry.coins, source)}**${beansText}`;
      })
    : [t('ranking.emptyCoins', source)];

  const desc = [
    t('ranking.coinsDesc', source),
    '',
    lines.join('\n\n'),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.magenta || '#e60067')
    .setTitle(t('ranking.mainTitle', source))
    .setDescription(desc)
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();

  if (viewerRank) {
    const viewer = memberMap.get(viewerRank.userId);
    if (viewer) embed.setThumbnail(viewer.user.displayAvatarURL({ dynamic: true, size: 256 }));
    embed.addFields({
      name: t('ranking.viewerPlacement', source),
      value: t('ranking.viewerLine', source, { position: viewerRank.position, amount: formatCoins(viewerRank.coins, source) }),
    });
  }

  return embed;
}

module.exports = {
  formatCoins,
  formatRemaining,
  buildCurrencyFields,
  buildWalletEmbed,
  buildProfileEmbed,
  buildRankingEmbed,
};