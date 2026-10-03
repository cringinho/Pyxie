const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const {
  loadConfig,
  loadData,
  saveData,
  addSeasonalBalance,
  resolveSeasonalEmoji,
  isSeasonalActive,
} = require('./seasonalManager');

let artJob = null;

function start(client) {
  stop();

  const config = loadConfig();
  // Agendamento: Todo domingo às 10:00 BRT
  artJob = cron.schedule(
    '0 10 * * 0',
    () => {
      tallyWeeklyArt(client).catch((err) => {
        console.error('[Seasonal:Art] Erro ao apurar arte da semana:', err);
      });
    },
    { timezone: config.dates?.timezone || 'America/Sao_Paulo' }
  );

  console.log('[Seasonal:Art] Cron de apuração de arte (domingos às 10:00 BRT) iniciado.');
}

function stop() {
  if (artJob) {
    try {
      artJob.stop();
    } catch (_) {}
    artJob = null;
  }
}

async function handleArtSubmission(message, client) {
  if (!isSeasonalActive()) return false;
  if (!message || message.author?.bot) return false;

  const config = loadConfig();
  if (!config.channels?.artChannelId) return false;
  if (message.channelId !== config.channels.artChannelId) return false;

  // Verifica se o bot foi mencionado
  const isMentioned =
    message.mentions.has(client?.user) ||
    message.mentions.users?.has(client?.user?.id) ||
    (client?.user?.id && message.content.includes(client.user.id));

  if (!isMentioned) return false;

  // Validação de imagem anexada ou URL direta de imagem
  let imageUrl = null;
  if (message.attachments?.size > 0) {
    const imgAtt = message.attachments.find((att) => {
      const type = att.contentType || '';
      const name = att.name || att.url || '';
      return type.startsWith('image/') || /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(name);
    });
    if (imgAtt) imageUrl = imgAtt.url;
  }

  if (!imageUrl && message.content) {
    const match = message.content.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)(?:\?\S*)?/i);
    if (match) imageUrl = match[0];
  }

  if (!imageUrl) {
    // Menção sem imagem no canal de artes: aviso sarcástico
    await message.react('❓').catch(() => null);
    return false;
  }

  // Previne submissão duplicada da mesma mensagem
  const data = loadData();
  const currentWeek = data.currentWeekArt || [];
  if (currentWeek.some((item) => item.messageId === message.id)) {
    return true;
  }

  // Emoji oficial de contagem da Pyxie
  const artEmojiConfig = config.assets?.emojis?.artOfWeek?.[0] || '8320_hallowee';
  const resolvedEmoji = resolveSeasonalEmoji(client, artEmojiConfig, '🎨');

  try {
    await message.react(resolvedEmoji);
  } catch (err) {
    console.warn('[Seasonal:Art] Falha ao reagir com emoji personalizado, usando fallback:', err.message);
    await message.react('🎨').catch(() => null);
  }

  // Registra a obra na lista da semana
  currentWeek.push({
    messageId: message.id,
    authorId: message.author.id,
    channelId: message.channel?.id || message.channelId,
    imageUrl,
    submittedAt: Date.now(),
  });

  data.currentWeekArt = currentWeek;
  saveData(data);

  console.log(`[Seasonal:Art] Nova arte submetida por ${message.author.tag} (${message.author.id})`);
  return true;
}

async function tallyWeeklyArt(client) {
  const config = loadConfig();
  const data = loadData();
  const submissions = data.currentWeekArt || [];

  const artChannelId = config.channels?.artChannelId;
  let channel = null;
  if (client && artChannelId) {
    channel = await client.channels.fetch(artChannelId).catch(() => null);
  }

  if (!submissions.length) {
    console.log('[Seasonal:Art] Nenhuma arte submetida nesta semana.');
    if (channel && channel.isTextBased()) {
      const emptyEmbed = new EmbedBuilder()
        .setColor('#7c3aed')
        .setTitle('🎨 ARTE DA SEMANA — CICLO ENCERRADO')
        .setDescription('Ninguém postou arte nenhuma essa semana? Que preguiça coletiva. Nenhum ponto distribuído!')
        .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
        .setTimestamp();
      await channel.send({ embeds: [emptyEmbed] }).catch(() => null);
    }
    return { success: true, winner: null, message: 'Sem artes submetidas.' };
  }

  const artEmojiConfig = config.assets?.emojis?.artOfWeek?.[0] || '8320_hallowee';
  let bestSubmission = null;
  let maxVotes = -1;

  for (const sub of submissions) {
    let votes = 0;
    try {
      const subChannel = (client && sub.channelId) ? await client.channels.fetch(sub.channelId).catch(() => channel) : channel;
      if (subChannel) {
        const msg = await subChannel.messages.fetch(sub.messageId).catch(() => null);
        if (msg) {
          const reaction = msg.reactions.cache.find((r) => {
            const name = r.emoji?.name || '';
            const id = r.emoji?.id || '';
            return name === artEmojiConfig || id === artEmojiConfig || name === '🎨';
          });

          if (reaction) {
            // Desconsidera a reação do próprio bot
            votes = Math.max(0, reaction.count - (reaction.me ? 1 : 0));
          }
        }
      }
    } catch (err) {
      console.warn(`[Seasonal:Art] Erro ao buscar reações da mensagem ${sub.messageId}:`, err.message);
    }

    if (votes > maxVotes) {
      maxVotes = votes;
      bestSubmission = { ...sub, votes };
    }
  }

  // Esvazia o ciclo da semana
  data.currentWeekArt = [];
  saveData(data);

  if (!bestSubmission || maxVotes <= 0) {
    if (channel && channel.isTextBased()) {
      const noVotesEmbed = new EmbedBuilder()
        .setColor('#7c3aed')
        .setTitle('🎨 ARTE DA SEMANA — SEM VENCEDOR')
        .setDescription('Tivemos artes postadas, mas ninguém votou em nada! Que comunidade desanimada. Moedas acumuladas para a próxima rodada.')
        .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
        .setTimestamp();
      await channel.send({ embeds: [noVotesEmbed] }).catch(() => null);
    }
    return { success: true, winner: null, message: 'Nenhuma arte recebeu votos.' };
  }

  // Premia o vencedor com +5 moedas sazonais
  const rewardAmount = 5;
  addSeasonalBalance(bestSubmission.authorId, rewardAmount);

  // Anúncio do vencedor no canal de artes
  if (channel && channel.isTextBased()) {
    const rawTemplate = config.templates?.artOfWeekWinner || '🎨 Parabéns {author}, sua arte foi a mais votada e você garantiu +5 {currencyName}!';
    const descText = rawTemplate
      .replace(/{author}/g, `<@${bestSubmission.authorId}>`)
      .replace(/{currencyName}/g, config.currencyName || 'Abóboras');

    const winnerEmbed = new EmbedBuilder()
      .setColor('#a855f7')
      .setTitle('🎨 ARTE DA SEMANA DEFINIDA!')
      .setDescription(`${descText}\n\n**Total de Votos:** ${maxVotes} 🗳️`)
      .setImage(bestSubmission.imageUrl)
      .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
      .setTimestamp();

    await channel.send({
      content: `🎉 <@${bestSubmission.authorId}> venceu a Arte da Semana!`,
      embeds: [winnerEmbed],
    }).catch(() => null);
  }

  console.log(`[Seasonal:Art] Vencedor da semana: ${bestSubmission.authorId} com ${maxVotes} votos.`);
  return { success: true, winner: bestSubmission, votes: maxVotes };
}

module.exports = {
  start,
  stop,
  handleArtSubmission,
  tallyWeeklyArt,
};
