const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const {
  loadConfig,
  loadData,
  saveData,
  addSeasonalBalance,
  resolveSeasonalEmoji,
  resolveSeasonalEmojiObject,
  isSeasonalActive,
} = require('./seasonalManager');

let dropJobs = [];
const activeCollectors = new Set();
const activeTimers = new Set();

const DECOY_NAMES = {
  '82336witchscaul': 'Caldeirão da Bruxa',
  '4124hellokit': 'Gatinha Trevosa',
  'ardiscordzomb': 'Zumbi da Cringelândia',
  'ardiscordzombie': 'Zumbi da Cringelândia',
  'purplecandy': 'Balinha Enfeitiçada',
  '31772purpleween': 'Abóbora Maligna',
  'halloweenabobora': 'Abóbora de Halloween',
  'kuromiwitch': 'Kuromi Feiticeira',
  'witchwumpus': 'Wumpus Feiticeiro',
  'halloweenpokemon': 'Morceguinho Noturno',
  'cafehalloweenbat': 'Morcego do Café',
};

function getEmojiDisplayName(identifier, resolved, name) {
  const customName = DECOY_NAMES[identifier] || DECOY_NAMES[name] || name || identifier;
  return `${resolved} **${customName}**`;
}

function start(client) {
  stop();

  const config = loadConfig();
  const tz = config.dates?.timezone || 'America/Sao_Paulo';

  // 1. Segunda a Sexta: 3x ao dia (09:30, 15:30, 21:00 BRT)
  const weekdaySchedules = [
    '30 9 * * 1-5',
    '30 15 * * 1-5',
    '0 21 * * 1-5',
  ];

  // 2. Sábado e Domingo: 6x ao dia (10:00, 13:00, 16:00, 18:30, 21:00, 23:30 BRT)
  const weekendSchedules = [
    '0 10 * * 0,6',
    '0 13 * * 0,6',
    '0 16 * * 0,6',
    '30 18 * * 0,6',
    '0 21 * * 0,6',
    '30 23 * * 0,6',
  ];

  const allSchedules = [...weekdaySchedules, ...weekendSchedules];

  for (const exp of allSchedules) {
    const job = cron.schedule(
      exp,
      () => {
        triggerDrop(client).catch((err) => {
          console.error('[Seasonal:Drop] Erro no disparo de drop agendado:', err);
        });
      },
      { timezone: tz }
    );
    dropJobs.push(job);
  }

  console.log(`[Seasonal:Drop] ${dropJobs.length} horários de drops sazonais agendados.`);
}

function stop() {
  // Para todos os crons
  for (const job of dropJobs) {
    try {
      job.stop();
    } catch (_) {}
  }
  dropJobs = [];

  // Cancela coletores de reação pendentes
  for (const collector of activeCollectors) {
    try {
      collector.stop('shutdown');
    } catch (_) {}
  }
  activeCollectors.clear();

  // Cancela timers de auto-delete pendentes
  for (const timer of activeTimers) {
    try {
      clearTimeout(timer);
    } catch (_) {}
  }
  activeTimers.clear();
}

async function triggerDrop(client) {
  if (!isSeasonalActive()) return false;
  if (!client) return false;

  const config = loadConfig();
  const dropsChannelId = config.channels?.dropsChannelId;
  if (!dropsChannelId) {
    console.warn('[Seasonal:Drop] Canal de drops não configurado.');
    return false;
  }

  let channel = null;
  try {
    channel = await client.channels.fetch(dropsChannelId).catch(() => null);
  } catch (_) {}

  if (!channel || !channel.isTextBased()) {
    console.warn(`[Seasonal:Drop] Canal de drops inválido ou inacessível: ${dropsChannelId}`);
    return false;
  }

  const decoys = (config.assets?.emojis?.dropDecoys && config.assets.emojis.dropDecoys.length >= 2)
    ? config.assets.emojis.dropDecoys
    : [
        '1548443801515720719', // ardiscordzombie
        '1548444196074033242', // purplecandy
        '1548443994902757427', // halloweenabobora
        '1548444056982655099', // kuromiwitch
        '1548443998283235461', // halloweenpokemon
        '1548443839247818802', // cafehalloweenbat
      ];

  // Resolve todos os decoys para objetos estruturados garantindo ID para reações
  const resolvedDecoyObjects = decoys.map((d) => resolveSeasonalEmojiObject(client, d, '🎃'));

  // Sorteia aleatoriamente 1 emoji correto da rodada
  const targetObj = resolvedDecoyObjects[Math.floor(Math.random() * resolvedDecoyObjects.length)];
  const targetLabel = getEmojiDisplayName(targetObj.id || targetObj.name, targetObj.formatted, targetObj.name);

  const chestImageUrl = config.assets?.chestImageUrl || 'https://i.imgur.com/link_do_bau_halloween.png';

  const dropEmbed = new EmbedBuilder()
    .setColor('#7c3aed')
    .setTitle('🎃 BAÚ MISTERIOSO DA PYXIE DESPENCOU! 🎃')
    .setDescription(
      `Um baú suspeito caiu com tudo no meio da Cringelândia!\n\n` +
      `⚡ **Rápido! Clique na reação ${targetLabel} antes dos outros para abrir o baú!**\n\n` +
      `*Apenas o primeiro a acertar leva o saque. Reações erradas só dão vergonha alheia.*`
    )
    .setImage(chestImageUrl)
    .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
    .setTimestamp();

  let dropMsg = null;
  try {
    dropMsg = await channel.send({ embeds: [dropEmbed] });
  } catch (err) {
    console.error('[Seasonal:Drop] Falha ao enviar mensagem de drop:', err);
    return false;
  }

  // Registra o ID no histórico de drops
  const data = loadData();
  data.history.lastDropMessageId = dropMsg.id;
  saveData(data);

  // Adiciona as 6 reações decoys na mensagem de forma ordenada
  for (const decoyObj of resolvedDecoyObjects) {
    try {
      await dropMsg.react(decoyObj.reactable);
    } catch (err) {
      console.warn(`[Seasonal:Drop] Falha ao reagir com ${decoyObj.name} (${decoyObj.reactable}):`, err.message);
      await dropMsg.react('🎃').catch(() => null);
    }
  }

  // Coletor de Reação Rápida com Auto-claim
  let claimed = false;
  const filter = (reaction, user) => !user.bot;
  const collector = dropMsg.createReactionCollector({ filter, time: 5 * 60 * 1000 });
  activeCollectors.add(collector);

  collector.on('collect', async (reaction, user) => {
    if (claimed) return;

    const reactionName = (reaction.emoji?.name || '').toLowerCase();
    const reactionId = String(reaction.emoji?.id || '');
    const reactionToString = typeof reaction.emoji?.toString === 'function' ? reaction.emoji.toString() : '';

    // Verifica se corresponde com precisão ao emoji premiado (por ID, nome, unicode ou formatted)
    const isTarget =
      (targetObj.id && (reactionId === String(targetObj.id) || reactionId.includes(String(targetObj.id)))) ||
      (targetObj.name && (reactionName === targetObj.name.toLowerCase() || reactionName.includes(targetObj.name.toLowerCase()))) ||
      (targetObj.formatted && (reactionToString === targetObj.formatted || reactionId === targetObj.formatted)) ||
      (targetObj.isUnicode && (reaction.emoji?.name === targetObj.reactable || reactionToString === targetObj.reactable));

    if (isTarget) {
      claimed = true;
      collector.stop('claimed');

      // Recompensa aleatória entre 1 e 2 moedas sazonais
      const amount = Math.floor(Math.random() * 2) + 1;
      const updatedBalance = addSeasonalBalance(user.id, amount);
      const currencyEmoji = resolveSeasonalEmoji(client, config.assets?.emojis?.currency, '🎃');

      const winEmbed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('🎉 BAÚ ABERTO COM SUCESSO! 🎉')
        .setDescription(
          `<@${user.id}> foi mais rápido que a luz (ou usou pacto) e abriu o baú primeiro!\n\n` +
          `💰 **Saque:** +${amount} ${currencyEmoji} ${config.currencyName || 'Abóboras'}!\n` +
          `💳 **Saldo Atual:** ${updatedBalance} ${currencyEmoji}\n\n` +
          `*Os outros que fiquem comendo poeira.*`
        )
        .setImage(chestImageUrl)
        .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
        .setTimestamp();

      await dropMsg.edit({ embeds: [winEmbed] }).catch(() => null);
      console.log(`[Seasonal:Drop] Drop reivindicado por ${user.tag} (${user.id}): +${amount} moedas.`);
    }
  });

  collector.on('end', (_collected, reason) => {
    activeCollectors.delete(collector);
    if (!claimed && reason !== 'shutdown') {
      const expiredEmbed = new EmbedBuilder()
        .setColor('#6b7280')
        .setTitle('💨 O BAÚ DA PYXIE EVAPOROU!')
        .setDescription('Todo mundo dormiu no ponto e o baú desapareceu nas sombras. Ninguém ganhou nada!')
        .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
        .setTimestamp();

      dropMsg.edit({ embeds: [expiredEmbed] }).catch(() => null);
    }
  });

  // Auto-delete limpo após 5 minutos para despoluir o canal
  const deleteTimer = setTimeout(async () => {
    activeTimers.delete(deleteTimer);
    try {
      await dropMsg.delete().catch(() => null);
    } catch (_) {}
  }, 5 * 60 * 1000);
  activeTimers.add(deleteTimer);

  return true;
}

module.exports = {
  start,
  stop,
  triggerDrop,
};
