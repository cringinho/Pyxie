const cron = require('node-cron');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const {
  loadConfig,
  loadData,
  saveData,
  addSeasonalBalance,
  updateUserProfile,
  resolveSeasonalEmojiObject,
  isSeasonalActive,
} = require('./seasonalManager');
const { cacheArtImage } = require('./imageHelper');

let artJob = null;
const activePromptTimers = new Map();
const pendingSubmissions = new Map();

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
  for (const timer of activePromptTimers.values()) {
    try {
      clearTimeout(timer);
    } catch (_) {}
  }
  activePromptTimers.clear();
}

/**
 * Filtra anexos da mensagem retornando apenas imagens válidas
 */
function extractImagesFromMessage(message) {
  const images = [];

  if (message.attachments && message.attachments.size > 0) {
    for (const att of message.attachments.values()) {
      const type = att.contentType || '';
      const name = att.name || att.url || '';
      if (type.startsWith('image/') || /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(name)) {
        images.push({
          id: att.id,
          url: att.url,
          name: att.name,
        });
      }
    }
  }

  if (images.length === 0 && message.content) {
    const matches = message.content.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)(?:\?\S*)?/gi);
    if (matches) {
      matches.forEach((url, i) => {
        images.push({ id: `text_${i}`, url, name: 'url_image' });
      });
    }
  }

  return images;
}

/**
 * Processa mensagens postadas no canal de artes oficial da Cringelândia
 */
async function handleArtSubmission(message, client) {
  if (!isSeasonalActive()) return false;
  if (!message || message.author?.bot) return false;

  const config = loadConfig();
  if (!config.channels?.artChannelId) return false;
  if (message.channelId !== config.channels.artChannelId) return false;

  // Ignora mensagens com mais de 7 dias
  if (message.createdTimestamp && Date.now() - message.createdTimestamp > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }

  const images = extractImagesFromMessage(message);
  if (images.length === 0) {
    return false;
  }

  const targetChannel = message.channel || (client && client.channels && typeof client.channels.fetch === 'function' ? await client.channels.fetch(message.channelId || message.channel?.id).catch(() => null) : null);
  if (!targetChannel || typeof targetChannel.send !== 'function') {
    return false;
  }

  // CENÁRIO 1: O autor postou mais de 1 arte de uma vez só
  // Aviso educado SEM marcá-lo, com botão de "Entendido" que fecha na hora ou em 10 minutos
  if (images.length > 1) {
    const noticeEmbed = new EmbedBuilder()
      .setColor('#f59e0b')
      .setTitle('⚠️  ✦  Aviso de Postagem: Arte da Semana')
      .setDescription(
        'Notamos que você postou mais de uma imagem nesta mesma mensagem!\n\n' +
        'Para participar do concurso de **Arte da Semana**, poste **apenas 1 arte por mensagem**. ' +
        'Assim a galera da Cringelândia consegue votar individualmente na sua obra favorita.\n\n' +
        'Se você deseja concorrer, poste a sua arte preferida sozinha aqui no canal! 🎨'
      )
      .setFooter({ text: 'Dica da Pyxie • Some em 30 segundos ou clique em Entendido' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`seasonal_multi_art_dismiss:${message.id}`)
        .setLabel('Entendido')
        .setEmoji('👍')
        .setStyle(ButtonStyle.Secondary)
    );

    try {
      const replyOptions = {
        embeds: [noticeEmbed],
        components: [row],
        allowedMentions: { repliedUser: false },
      };
      const noticeMsg = typeof message.reply === 'function'
        ? await message.reply(replyOptions).catch(() => targetChannel.send(replyOptions))
        : await targetChannel.send(replyOptions);

      // Auto-delete após 30 segundos para despoluir rapidamente o canal de artes
      const timer = setTimeout(async () => {
        try {
          if (noticeMsg && typeof noticeMsg.delete === 'function') {
            await noticeMsg.delete().catch(() => null);
          }
        } catch (_) {}
      }, 30 * 1000);
      if (timer && typeof timer.unref === 'function') timer.unref();

      if (noticeMsg?.id) {
        activePromptTimers.set(`notice_${noticeMsg.id}`, timer);
      }
    } catch (err) {
      console.warn('[Seasonal:Art] Falha ao enviar aviso de múltiplas imagens:', err.message);
    }

    return true;
  }

  // CENÁRIO 2: O autor postou exatamente 1 arte
  const targetImage = images[0];
  const imageUrl = targetImage.url;

  // Previne duplicatas de artes já registradas na semana ou apuradas no passado
  const data = loadData();
  const currentWeek = data.currentWeekArt || [];
  const pastTallied = data.history?.talliedArtMessageIds || [];

  if (pastTallied.includes(message.id)) {
    return false;
  }
  if (currentWeek.some((item) => item.messageId === message.id)) {
    return true;
  }

  // Atualiza perfil do autor imediatamente para garantir nome e avatar sincronizados
  if (message.author) {
    updateUserProfile(message.author.id, {
      username: message.author.username,
      displayName: message.author.displayName || message.author.username,
      avatarUrl: typeof message.author.displayAvatarURL === 'function' ? message.author.displayAvatarURL({ extension: 'png', size: 128 }) : null,
    });
  }

  // Salva submissão pendente para vincular a imagem caso o author confirme
  pendingSubmissions.set(message.id, {
    messageId: message.id,
    authorId: message.author.id,
    imageUrl,
    channelId: targetChannel.id || message.channelId,
    message,
  });

  // Mensagem com botões somente para o autor, marcando-o para ver rápido
  // Explicada em linguagem "pra criança entender"
  const promptEmbed = new EmbedBuilder()
    .setColor('#a855f7')
    .setTitle('🎨  ✦  Arte da Semana na Cringelândia!')
    .setDescription(
      `Oi <@${message.author.id}>! ✨ Que desenho bonito!\n\n` +
      `Conta pra mim: **essa arte foi feita por você mesmo(a)?**\n\n` +
      `Se for autoral sua, você gostaria de colocá-la na nossa **Votação de Arte da Semana**?\n\n` +
      `📌 **Como funciona (bem facinho de entender):**\n` +
      `• Se você clicar em **Sim**, sua arte vai para a nossa galeria no site e o pessoal do servidor poderá votar nela reagindo com 🎃!\n` +
      `• No domingo às 10h da manhã, a arte mais votada vence e você ganha **+5 Abóboras**!\n` +
      `• Se você clicar em **Não**, tá tudo bem! Sua arte continua aqui no canal pra todo mundo admirar, mas sem entrar na disputa de pontos.\n\n` +
      `O que você prefere fazer?`
    )
    .setFooter({ text: 'Apenas você pode responder a esta pergunta usando os botões abaixo.' });

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`seasonal_art_confirm:${message.id}:${message.author.id}`)
      .setLabel('Sim, quero participar!')
      .setEmoji('🎨')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`seasonal_art_decline:${message.id}:${message.author.id}`)
      .setLabel('Não, é só pra ver')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Secondary)
  );

  try {
    const promptOptions = {
      content: `<@${message.author.id}>`,
      embeds: [promptEmbed],
      components: [confirmRow],
    };
    const promptMsg = typeof message.reply === 'function'
      ? await message.reply(promptOptions).catch(() => targetChannel.send(promptOptions))
      : await targetChannel.send(promptOptions);

    // Auto-delete do prompt caso fique sem resposta por 2 minutos para não poluir o canal
    const promptTimer = setTimeout(async () => {
      try {
        if (promptMsg && typeof promptMsg.delete === 'function') {
          await promptMsg.delete().catch(() => null);
        }
      } catch (_) {}
    }, 2 * 60 * 1000);
    if (promptTimer && typeof promptTimer.unref === 'function') promptTimer.unref();

    if (promptMsg?.id) {
      activePromptTimers.set(`prompt_${promptMsg.id}`, promptTimer);
    }
  } catch (err) {
    console.error('[Seasonal:Art] Falha ao enviar pergunta ao autor da arte:', err);
  }

  return true;
}

/**
 * Trata as interações dos botões de confirmação de arte e dismiss de avisos
 */
async function handleButtonInteraction(interaction) {
  if (!interaction || (typeof interaction.isButton === 'function' && !interaction.isButton())) return false;
  const customId = interaction.customId;
  if (!customId) return false;

  // 1. Fechar aviso de múltiplas artes (qualquer um pode clicar para despoluir)
  if (customId.startsWith('seasonal_multi_art_dismiss:')) {
    try {
      if (typeof interaction.deferUpdate === 'function') {
        await interaction.deferUpdate().catch(() => null);
      }
      if (interaction.message && typeof interaction.message.delete === 'function') {
        await interaction.message.delete().catch(() => null);
      }
    } catch (_) {}
    return true;
  }

  // 2. Confirmação / Declínio de arte autoral
  if (customId.startsWith('seasonal_art_confirm:') || customId.startsWith('seasonal_art_decline:')) {
    const parts = customId.split(':');
    const action = parts[0];
    const messageId = parts[1];
    const authorId = parts[2];

    const clickerId = interaction.user ? interaction.user.id : interaction.userId;

    // Segurança: Somente o autor da postagem pode decidir
    if (clickerId !== authorId) {
      if (typeof interaction.reply === 'function') {
        await interaction.reply({
          content: `❌ Apenas o autor desta arte (<@${authorId}>) pode decidir se deseja participar do concurso!`,
          flags: MessageFlags.Ephemeral,
        }).catch(() => null);
      }
      return true;
    }

    // Se o autor recusou participar
    if (action === 'seasonal_art_decline') {
      pendingSubmissions.delete(messageId);
      const declineEmbed = new EmbedBuilder()
        .setColor('#64748b')
        .setDescription(`Sem problemas, <@${authorId}>! Sua arte continua aqui no canal pra todo mundo admirar com carinho! 💖`);

      if (typeof interaction.update === 'function') {
        await interaction.update({
          content: null,
          embeds: [declineEmbed],
          components: [],
        }).catch(() => null);
      }

      const declineTimer = setTimeout(async () => {
        try {
          if (interaction.message && typeof interaction.message.delete === 'function') {
            await interaction.message.delete().catch(() => null);
          }
        } catch (_) {}
      }, 6000);
      if (declineTimer && typeof declineTimer.unref === 'function') declineTimer.unref();
      activePromptTimers.set(`decline_${messageId}`, declineTimer);
      return true;
    }

    // Se o autor aceitou participar
    if (action === 'seasonal_art_confirm') {
      const config = loadConfig();
      const pending = pendingSubmissions.get(messageId);
      let originalMsg = pending?.message || null;
      if (!originalMsg && interaction.channel?.messages?.fetch) {
        try {
          originalMsg = await interaction.channel.messages.fetch(messageId).catch(() => null);
        } catch (_) {}
      }

      let targetImageUrl = pending?.imageUrl || null;
      if (!targetImageUrl && originalMsg) {
        const imgs = extractImagesFromMessage(originalMsg);
        if (imgs.length > 0) targetImageUrl = imgs[0].url;
      }

      // Baixa e salva a imagem localmente em disco imediatamente para NUNCA QUEBRAR no site
      let cachedPublicUrl = null;
      if (targetImageUrl) {
        cachedPublicUrl = await cacheArtImage(targetImageUrl, messageId);
      }

      // Registra a obra na lista da semana
      const data = loadData();
      data.currentWeekArt = data.currentWeekArt || [];

      if (!data.currentWeekArt.some((item) => item.messageId === messageId)) {
        data.currentWeekArt.push({
          messageId,
          authorId,
          channelId: interaction.channelId || interaction.channel?.id || pending?.channelId,
          imageUrl: cachedPublicUrl || `/api/sazonal/art-image/${messageId}`,
          originalUrl: targetImageUrl,
          submittedAt: Date.now(),
        });
        saveData(data);
      }

      pendingSubmissions.delete(messageId);

      // Reage na mensagem original com o emoji oficial de contagem de votos da Pyxie
      if (originalMsg && typeof originalMsg.react === 'function') {
        const artEmojiConfig = config.assets?.emojis?.artOfWeek?.[0] || '1548443988745261086';
        const resolvedArtObj = resolveSeasonalEmojiObject(interaction.client || originalMsg.client, artEmojiConfig, '🎨');
        try {
          await originalMsg.react(resolvedArtObj.reactable);
        } catch (err) {
          console.warn('[Seasonal:Art] Falha ao reagir com emoji personalizado, usando fallback:', err.message);
          await originalMsg.react('🎨').catch(() => null);
        }
      }

      // Notifica o autor com sucesso
      const successEmbed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('🎉  ✦  Arte Confirmada na Votação da Semana!')
        .setDescription(
          `Eba, <@${authorId}>! Seu desenho foi registrado com sucesso!\n\n` +
          `✨ **Sua arte já está concorrendo e aparecendo na nossa galeria no site!**\n` +
          `Peça para os seus amigos votarem reagindo com 🎃 na sua publicação acima. Boa sorte! 💜`
        )
        .setFooter({ text: 'A apuração dos votos ocorre todo domingo às 10h BRT!' });

      if (typeof interaction.update === 'function') {
        await interaction.update({
          content: null,
          embeds: [successEmbed],
          components: [],
        }).catch(() => null);
      }

      // Auto-delete do aviso após 60 segundos para manter o canal limpo
      const confirmTimer = setTimeout(async () => {
        try {
          if (interaction.message && typeof interaction.message.delete === 'function') {
            await interaction.message.delete().catch(() => null);
          }
        } catch (_) {}
      }, 60000);
      if (confirmTimer && typeof confirmTimer.unref === 'function') confirmTimer.unref();
      activePromptTimers.set(`confirm_${messageId}`, confirmTimer);

      console.log(`[Seasonal:Art] Arte ${messageId} confirmada pelo autor ${authorId} e salva com sucesso.`);
      return true;
    }
  }

  return false;
}

/**
 * Apuração dominical da arte da semana
 */
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

  const artEmojiConfig = config.assets?.emojis?.artOfWeek?.[0] || '1548443988745261086';
  const resolvedArtObj = resolveSeasonalEmojiObject(client, artEmojiConfig, '🎨');
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
            const rName = (r.emoji?.name || '').toLowerCase();
            const rId = String(r.emoji?.id || '');
            if (resolvedArtObj.id && rId === String(resolvedArtObj.id)) return true;
            if (resolvedArtObj.name && rName === resolvedArtObj.name.toLowerCase()) return true;
            if (rId === String(artEmojiConfig) || rName === String(artEmojiConfig).toLowerCase()) return true;
            if (rName === '🎨' || rName === '8320_hallowee' || rName === '36577halloween') return true;
            return false;
          });

          if (reaction) {
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

  // Registra no histórico de apurações e limpa o ciclo da semana
  const talliedIds = submissions.map((s) => s.messageId);
  data.history = data.history || {};
  data.history.talliedArtMessageIds = [
    ...(data.history.talliedArtMessageIds || []),
    ...talliedIds,
  ].slice(-300);
  data.history.lastArtTallyAt = Date.now();
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

  // Premia o vencedor com +5 moedas sazonais e registra no histórico de auditoria
  const rewardAmount = 5;
  addSeasonalBalance(bestSubmission.authorId, rewardAmount, {
    source: 'art_weekly',
    description: `Vencedor da Arte da Semana (${maxVotes} votos)`,
    messageId: bestSubmission.messageId,
  });

  // Salva vencedor histórico para exibição permanente na galeria do site sem sobrescrever o saldo recém-adicionado
  const currentData = loadData();
  currentData.history = currentData.history || {};
  currentData.history.lastArtWinner = {
    messageId: bestSubmission.messageId,
    authorId: bestSubmission.authorId,
    votes: maxVotes,
    imageUrl: bestSubmission.imageUrl,
    originalUrl: bestSubmission.originalUrl,
    talliedAt: Date.now(),
  };
  currentData.history.pastArtWinners = [
    ...(currentData.history.pastArtWinners || []),
    currentData.history.lastArtWinner,
  ].slice(-50);
  saveData(currentData);

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
      .setImage(bestSubmission.originalUrl || bestSubmission.imageUrl)
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
  handleButtonInteraction,
  tallyWeeklyArt,
  extractImagesFromMessage,
};
