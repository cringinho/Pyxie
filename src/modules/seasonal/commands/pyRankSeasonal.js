const { EmbedBuilder } = require('discord.js');
const {
  isSeasonalActive,
  loadConfig,
  getTopSeasonalBalances,
  resolveSeasonalEmoji,
} = require('../seasonalManager');

function buildSeasonalRankingView(client, viewerId) {
  if (!isSeasonalActive()) {
    return {
      content: 'Nenhum evento sazonal ativo no momento na Cringelândia.',
      embeds: [],
    };
  }

  const config = loadConfig();
  const top10 = getTopSeasonalBalances(10);
  const currencyEmoji = resolveSeasonalEmoji(client, config.assets?.emojis?.currency, '🎃');

  const lines = top10.length
    ? top10.map((entry, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `**#${idx + 1}**`;
        const prizeInfo = idx === 0 && config.prizes?.firstPlace ? ` — 🎁 *${config.prizes.firstPlace}*` :
                          idx === 1 && config.prizes?.secondPlace ? ` — 🎁 *${config.prizes.secondPlace}*` :
                          idx === 2 && config.prizes?.thirdPlace ? ` — 🎁 *${config.prizes.thirdPlace}*` : '';
        return `${medal} <@${entry.userId}>${prizeInfo}\n> ${currencyEmoji} **${entry.balance} ${config.currencyName || 'Abóbora'}**`;
      })
    : ['> *Ninguém pontuou no evento sazonal ainda. Abra os baús ou envie artes para liderar!*'];

  const desc = [
    `Top 10 aventureiros acumulando **${config.currencyName}** no evento **${config.eventName}**:`,
    '',
    ...lines,
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor('#7c3aed')
    .setTitle(`🏆 PLACAR DO EVENTO: ${config.eventName.toUpperCase()}`)
    .setDescription(desc);

  const thumbUrl = config.assets?.chestImageUrl || config.assets?.infoEventImageUrl;
  if (thumbUrl && thumbUrl.startsWith('http')) {
    embed.setThumbnail(thumbUrl);
  }

  embed.setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
    .setTimestamp();

  return { embeds: [embed] };
}

module.exports = {
  buildSeasonalRankingView,
  getTopSeasonalBalances,
};
