const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const {
  isSeasonalActive,
  loadConfig,
  getSeasonalBalance,
  resolveSeasonalEmoji,
} = require('../seasonalManager');

function buildInfoEventoView(userId, client) {
  if (!isSeasonalActive()) {
    return {
      content: 'Nenhum evento sazonal ativo no momento na Cringelândia. Volte mais tarde, desocupado.',
      embeds: [],
    };
  }

  const config = loadConfig();
  const userBalance = getSeasonalBalance(userId);
  const currencyEmoji = resolveSeasonalEmoji(client, config.assets?.emojis?.currency, '🎃');

  let formattedEndDate = 'Em breve';
  try {
    const d = new Date(config.dates?.endDate);
    if (!isNaN(d.getTime())) {
      formattedEndDate = d.toLocaleString('pt-BR', {
        timeZone: config.dates?.timezone || 'America/Sao_Paulo',
        dateStyle: 'full',
        timeStyle: 'medium',
      });
    }
  } catch (_) {}

  const prizeLines = [];
  if (config.prizes?.firstPlace) {
    prizeLines.push(`🥇 **1º Lugar:** ${config.prizes.firstPlace}`);
  }
  if (config.prizes?.secondPlace) {
    prizeLines.push(`🥈 **2º Lugar:** ${config.prizes.secondPlace}`);
  }
  if (config.prizes?.thirdPlace) {
    prizeLines.push(`🥉 **3º Lugar:** ${config.prizes.thirdPlace}`);
  }

  const artChannelMention = config.channels?.artChannelId ? `<#${config.channels.artChannelId}>` : '`#canal-de-artes`';
  const dropsChannelMention = config.channels?.dropsChannelId ? `<#${config.channels.dropsChannelId}>` : '`#canal-de-drops`';

  const defaultTitle = '🕸️ {eventName} — GUIA OFICIAL 🕸️';
  const infoTitle = (config.templates?.infoEventTitle || defaultTitle)
    .replace(/{eventName}/g, (config.eventName || 'Evento').toUpperCase());

  const defaultDesc =
    'Bem-vindo(a) ao evento temático oficial da Cringelândia! Participe das atividades, acumule **{currencyName}** e dispute os prêmios no topo do placar.';
  const infoDesc = (config.templates?.infoEventDescription || defaultDesc)
    .replace(/{eventName}/g, config.eventName || 'Evento')
    .replace(/{currencyName}/g, config.currencyName || 'Moedas')
    .replace(/{firstPrize}/g, config.prizes?.firstPlace || '');

  const defaultRules =
    `• **Baú da Pyxie (Drops):** Surgem de surpresa em ${dropsChannelMention} (3x/dia na semana e 6x/dia nos fins de semana). Seja o primeiro a clicar na reação certa!\n` +
    `• **Arte da Semana:** Poste sua arte em ${artChannelMention} marcando a Pyxie (@Pyxie). A arte mais votada aos domingos (10:00 BRT) ganha **+5 ${config.currencyName}**!\n` +
    `• **Regras Gerais:** Proibido uso de multicontas ou trapaças automatizadas sob pena de desclassificação imediata.`;

  const rulesText = (config.templates?.infoEventRules || defaultRules)
    .replace(/{eventName}/g, config.eventName || 'Evento')
    .replace(/{currencyName}/g, config.currencyName || 'Moedas')
    .replace(/{dropsChannel}/g, dropsChannelMention)
    .replace(/{artChannel}/g, artChannelMention)
    .replace(/{firstPrize}/g, config.prizes?.firstPlace || '');

  const embed = new EmbedBuilder()
    .setColor('#7c3aed')
    .setTitle(infoTitle)
    .setDescription(infoDesc)
    .addFields(
      {
        name: `${currencyEmoji} Seu Saldo Sazonal`,
        value: `> Atualmente você possui **${userBalance}** ${currencyEmoji} **${config.currencyName}**`,
        inline: false,
      },
      {
        name: '📖 Como Funciona & Regras do Evento',
        value: rulesText,
        inline: false,
      },
      {
        name: '🏆 Tabela de Premiações',
        value: prizeLines.length ? prizeLines.join('\n') : '> *Premiações em definição pela moderação.*',
        inline: false,
      }
    );

  if (config.templates?.infoEventExtra && config.templates.infoEventExtra.trim().length > 0) {
    const extraText = config.templates.infoEventExtra
      .replace(/{eventName}/g, config.eventName || 'Evento')
      .replace(/{currencyName}/g, config.currencyName || 'Moedas')
      .replace(/{firstPrize}/g, config.prizes?.firstPlace || '');
    embed.addFields({
      name: '💡 Informações & Dicas da Pyxie',
      value: extraText,
      inline: false,
    });
  }

  embed.addFields({
    name: '⏳ Prazo de Encerramento',
    value: `> **${formattedEndDate}**\n> *(Fuso Horário Oficial: ${config.dates?.timezone || 'America/Sao_Paulo'})*`,
    inline: false,
  });

  const bannerImg = config.assets?.infoEventImageUrl || config.assets?.chestImageUrl;
  if (bannerImg && bannerImg.startsWith('http')) {
    embed.setImage(bannerImg);
  }

  embed.setFooter({
    text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!',
  });
  embed.setTimestamp();

  return { embeds: [embed] };
}

module.exports = {
  name: 'infoevento',
  aliases: ['py-infoevento', 'info-evento', 'py-info-evento', 'evento', 'py-evento'],
  data: new SlashCommandBuilder()
    .setName('py-infoevento')
    .setDescription('Informações completas, saldo e regras do evento sazonal da Cringelândia.')
    .setDescriptionLocalizations({
      'pt-BR': 'Informações completas, saldo e regras do evento sazonal da Cringelândia.',
    }),
  buildInfoEventoView,
  async executePrefix({ message }) {
    const view = buildInfoEventoView(message.author.id, message.client);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildInfoEventoView(interaction.user.id, interaction.client);
    if (interaction.deferred) {
      await interaction.editReply(view);
    } else {
      await interaction.reply(view);
    }
  },
};
