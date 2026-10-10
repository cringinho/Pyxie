const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
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

  const eventNameUpper = (config.eventName || 'Evento').toUpperCase();
  const eventName = config.eventName || 'Evento';
  const currencyName = config.currencyName || 'Abóboras';
  const firstPrize = config.prizes?.firstPlace || '';

  // 1. Título Customizável
  const rawTitle = config.templates?.infoEventTitle || '🕸️ {eventName} — GUIA OFICIAL 🕸️';
  const title = rawTitle.replace(/{eventName}/g, eventNameUpper);

  // 2. Descrição / Introdução Customizável
  const defaultDesc = `Bem-vindo(a) ao evento temático oficial da Cringelândia! Acumule **${currencyName}** participando das atividades e dispute o topo do placar.`;
  const rawDesc = config.templates?.infoEventDescription || defaultDesc;
  const description = rawDesc
    .replace(/{eventName}/g, eventName)
    .replace(/{currencyName}/g, currencyName)
    .replace(/{firstPrize}/g, firstPrize);

  // 3. Regras / Como Funciona Customizáveis
  const defaultRules =
    `• **Baú da Pyxie (Drops):** Surgem de surpresa em ${dropsChannelMention} (3x/dia na semana e 6x/dia nos fins de semana). Seja o primeiro a clicar na reação certa!\n` +
    `• **Atividade no Canal de Drops:** Converse e interaja em ${dropsChannelMention} nos horários especiais para ganhar moedas automáticas:\n` +
    `  - ☀️ **Manhã (06:00 às 11:00 BRT):** Ganhe **+1 ${currencyName}** (anúncio e entrega às 11:00 BRT)\n` +
    `  - 🌙 **Madrugada (23:00 às 03:00 BRT):** Ganhe **+2 ${currencyName}** (anúncio e entrega às 03:00 BRT)\n` +
    `• **Arte da Semana:** Poste sua arte em ${artChannelMention} marcando a Pyxie (@Pyxie). A arte mais votada aos domingos (10:00 BRT) ganha **+5 ${currencyName}**!`;
  const rawRules = config.templates?.infoEventRules || defaultRules;
  const rules = rawRules
    .replace(/{eventName}/g, eventName)
    .replace(/{currencyName}/g, currencyName)
    .replace(/{dropsChannel}/g, dropsChannelMention)
    .replace(/{artChannel}/g, artChannelMention)
    .replace(/{firstPrize}/g, firstPrize);

  // 4. Imagem do Banner do Guia
  const imageUrl = config.assets?.infoEventImageUrl || config.assets?.chestImageUrl || 'https://i.imgur.com/link_do_bau_halloween.png';

  const embed = new EmbedBuilder()
    .setColor('#7c3aed')
    .setTitle(title)
    .setDescription(description)
    .addFields(
      {
        name: `${currencyEmoji} Seu Saldo Sazonal`,
        value: `> Atualmente você possui **${userBalance}** ${currencyEmoji} **${currencyName}**`,
        inline: false,
      },
      {
        name: '📖 Como Funciona & Regras do Evento',
        value: rules,
        inline: false,
      },
      {
        name: '🏆 Tabela de Premiações',
        value: prizeLines.length ? prizeLines.join('\n') : '> *Premiações em definição pela moderação.*',
        inline: false,
      }
    );

  // 5. Campo Extra / Lore / Dicas (se preenchido)
  if (config.templates?.infoEventExtra && config.templates.infoEventExtra.trim().length > 0) {
    const rawExtra = config.templates.infoEventExtra;
    const extra = rawExtra
      .replace(/{eventName}/g, eventName)
      .replace(/{currencyName}/g, currencyName)
      .replace(/{firstPrize}/g, firstPrize);
    embed.addFields({
      name: '💡 Informações & Dicas da Pyxie',
      value: extra,
      inline: false,
    });
  }

  // 6. Prazo de Encerramento
  embed.addFields({
    name: '⏰ Prazo de Encerramento',
    value: `> **${formattedEndDate}**\n> *(Fuso Horário Oficial: ${config.dates?.timezone || 'America/Sao_Paulo'})*`,
    inline: false,
  });

  const baseUrl = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';

  // 7. Campo com Link para o Placar & Galeria de Artes Web
  embed.addFields({
    name: '🌐 Placar Ao Vivo & Galeria de Artes',
    value: `> [Clique aqui para abrir o Placar & Galeria de Artes no Site](${baseUrl}/ranking-sazonal)\n> Acompanhe a pontuação dos membros, veja os desenhos e confira as estatísticas!`,
    inline: false,
  });

  embed.setImage(imageUrl)
    .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
    .setTimestamp();

  const linkRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('🏆 Ver Placar & Galeria no Site')
      .setEmoji('🌐')
      .setStyle(ButtonStyle.Link)
      .setURL(`${baseUrl}/ranking-sazonal`),
    new ButtonBuilder()
      .setLabel('🎨 Galeria de Artes')
      .setEmoji('🖼️')
      .setStyle(ButtonStyle.Link)
      .setURL(`${baseUrl}/evento#artes`)
  );

  return { embeds: [embed], components: [linkRow] };
}

module.exports = {
  name: 'infoevento',
  category: 'economia',
  guildScope: ['1453890868980482090'],
  aliases: [
    'py-infoevento',
    'pyinfoevento',
    'infoevento',
    'info-evento',
    'py-info-evento',
    'evento',
    'py-evento',
    'pyevento',
    'infoeventos',
    'py-infoeventos',
    'pyinfoeventos',
    'info-eventos',
    'py-info-eventos',
    'eventos',
    'py-eventos',
    'pyeventos',
  ],
  data: new SlashCommandBuilder()
    .setName('py-infoevento')
    .setDescription('Complete guide, balance and rules for Cringelândia seasonal event.')
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
