const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const {
  loadConfig,
  loadData,
  saveData,
  addSeasonalBalance,
  updateUserProfile,
  resolveSeasonalEmoji,
  resolveSeasonalEmojiObject,
  isSeasonalActive,
} = require('./seasonalManager');

let dropJobs = [];
const activeCollectors = new Set();
const activeTimers = new Set();

const DECOY_NAMES = {
  '82336witchscaul': 'Caldeirão da Bruxa',
  '82336witchscauldron': 'Caldeirão da Bruxa',
  '1552115015199227924': 'Caldeirão da Bruxa',
  '4124hellokit': 'Hello Kitty Aboborada',
  '4124hellokittypumpkin': 'Hello Kitty Aboborada',
  '1551355578066931763': 'Hello Kitty Aboborada',
  'ardiscordzomb': 'Zumbicord',
  'ardiscordzombie': 'Zumbicord',
  '1548443801515720719': 'Zumbicord',
  'purplecandy': 'Balinha',
  '1548444196074033242': 'Balinha',
  '31772purpleween': 'Gatinho Trevinhas',
  '1551356387475595375': 'Gatinho Trevinhas',
  'witchwumpus': 'Wumpus Bruxinho',
  '1548444308401684530': 'Wumpus Bruxinho',
  'halloweenabobora': 'Abóbora de Halloween',
  '1548443994902757427': 'Abóbora de Halloween',
  'kuromiwitch': 'Kuromi Bruxa',
  '1548444056982655099': 'Kuromi Bruxa',
  'halloweenpokemon': 'Morceguinho Noturno',
  '1548443998283235461': 'Morceguinho Noturno',
  'cafehalloweenbat': 'Morcego do Café',
  '1548443839247818802': 'Morcego do Café',
};

function normalizeDecoy(item) {
  if (!item) return null;
  if (typeof item === 'object') {
    const id = String(item.id || item.name || '').trim();
    if (!id) return null;
    return {
      id,
      label: item.label ? String(item.label).trim() : null,
    };
  }
  const id = String(item).trim();
  if (!id) return null;
  return {
    id,
    label: null,
  };
}

function getEmojiDisplayName(targetItem, resolvedFormatted, targetObj) {
  const customName =
    targetItem?.label ||
    DECOY_NAMES[targetItem?.id] ||
    DECOY_NAMES[targetObj?.id] ||
    DECOY_NAMES[targetObj?.name] ||
    targetObj?.name ||
    'Emoji Secreto';
  return `${resolvedFormatted} **${customName}**`;
}

/**
 * Calcula os próximos horários agendados de drops
 */
function getNextScheduledDrops(count = 5, baseDate = new Date()) {
  const drops = [];
  const weekdayTimes = [
    [9, 30],
    [15, 30],
    [21, 0],
  ];
  const weekendTimes = [
    [10, 0],
    [13, 0],
    [16, 0],
    [18, 30],
    [21, 0],
    [23, 30],
  ];

  for (let d = 0; d < 7 && drops.length < count; d++) {
    const dayDate = new Date(baseDate.getTime() + d * 24 * 60 * 60 * 1000);
    const spOffset = -3 * 60; // America/Sao_Paulo (UTC-3 em minutos)
    const utcTime = dayDate.getTime() + (dayDate.getTimezoneOffset() * 60000);
    const spDate = new Date(utcTime + (spOffset * 60000));
    const dayOfWeek = spDate.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    const times = isWeekend ? weekendTimes : weekdayTimes;

    for (const [h, m] of times) {
      const scheduledSp = new Date(spDate.getFullYear(), spDate.getMonth(), spDate.getDate(), h, m, 0, 0);
      const scheduledUtc = scheduledSp.getTime() - (spOffset * 60000);

      if (scheduledUtc > baseDate.getTime()) {
        const diffMs = scheduledUtc - baseDate.getTime();
        const diffHours = Math.floor(diffMs / (3600 * 1000));
        const diffMins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
        let relativeText = '';
        if (diffHours > 0) {
          relativeText = `em ${diffHours}h ${diffMins}m`;
        } else {
          relativeText = `em ${diffMins} minutos`;
        }

        const dayName = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek];
        const timeFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} BRT`;

        drops.push({
          timestamp: scheduledUtc,
          dayName,
          timeFormatted,
          relativeText,
          isWeekend,
        });

        if (drops.length >= count) break;
      }
    }
  }

  return drops;
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
  for (const job of dropJobs) {
    try {
      job.stop();
    } catch (_) {}
  }
  dropJobs = [];

  for (const collector of activeCollectors) {
    try {
      collector.stop('shutdown');
    } catch (_) {}
  }
  activeCollectors.clear();

  for (const timer of activeTimers) {
    try {
      clearTimeout(timer);
    } catch (_) {}
  }
  activeTimers.clear();
}

async function triggerDrop(client, force = false) {
  if (!force && !isSeasonalActive()) {
    console.warn('[Seasonal:Drop] Não é possível disparar drop: evento está inativo (active: false).');
    return false;
  }
  if (!client) {
    console.warn('[Seasonal:Drop] Client do Discord não fornecido.');
    return false;
  }

  const config = loadConfig();
  const dropsChannelId = config.channels?.dropsChannelId;
  if (!dropsChannelId) {
    console.warn('[Seasonal:Drop] Canal de drops não configurado no seasonalConfig.');
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

  const rawDecoys = (config.assets?.emojis?.dropDecoys && config.assets.emojis.dropDecoys.length >= 2)
    ? config.assets.emojis.dropDecoys
    : [
        { id: '82336witchscaul', label: 'Caldeirão da Bruxa' },
        { id: '1551355578066931763', label: 'Hello Kitty Aboborada' },
        { id: '1548443801515720719', label: 'Zumbicord' },
        { id: '1548444196074033242', label: 'Balinha' },
        { id: '1551356387475595375', label: 'Gatinho Trevinhas' },
        { id: '1548444308401684530', label: 'Wumpus Bruxinho' },
      ];

  const decoys = rawDecoys.map(normalizeDecoy).filter(Boolean);

  const resolvedDecoyObjects = decoys.map((d) => {
    const resolved = resolveSeasonalEmojiObject(client, d.id, '🎃');
    const label = d.label || DECOY_NAMES[d.id] || DECOY_NAMES[resolved.id] || DECOY_NAMES[resolved.name] || resolved.name || 'Emoji Secreto';
    return {
      ...resolved,
      rawDecoy: d,
      label,
    };
  });

  const targetObj = resolvedDecoyObjects[Math.floor(Math.random() * resolvedDecoyObjects.length)];
  const targetLabel = getEmojiDisplayName(targetObj.rawDecoy, targetObj.formatted, targetObj);

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

  // Registra no histórico de drops (Ledger para visualização administrativa)
  const data = loadData();
  data.history = data.history || {};
  data.history.lastDropMessageId = dropMsg.id;
  data.history.drops = data.history.drops || [];

  const dropRecord = {
    id: `drop_${dropMsg.id}`,
    messageId: dropMsg.id,
    channelId: dropsChannelId,
    sentAt: Date.now(),
    targetEmoji: {
      id: targetObj.id,
      name: targetObj.name,
      label: targetObj.label,
      formatted: targetObj.formatted,
    },
    status: 'ativo',
    winner: null,
  };

  data.history.drops.unshift(dropRecord);
  if (data.history.drops.length > 50) {
    data.history.drops = data.history.drops.slice(0, 50);
  }
  saveData(data);

  // Adiciona reações decoys na mensagem de forma ordenada
  for (const decoyObj of resolvedDecoyObjects) {
    try {
      await dropMsg.react(decoyObj.reactable);
    } catch (err) {
      console.warn(`[Seasonal:Drop] Falha ao reagir com ${decoyObj.name} (${decoyObj.reactable}):`, err.message);
      await dropMsg.react('🎃').catch(() => null);
    }
  }

  let claimed = false;
  const filter = (reaction, user) => !user.bot;
  const collector = dropMsg.createReactionCollector({ filter, time: 5 * 60 * 1000 });
  activeCollectors.add(collector);

  collector.on('collect', async (reaction, user) => {
    if (claimed) return;

    const reactionName = (reaction.emoji?.name || '').toLowerCase();
    const reactionId = String(reaction.emoji?.id || '');
    const reactionToString = typeof reaction.emoji?.toString === 'function' ? reaction.emoji.toString() : '';

    const isTarget =
      (targetObj.id && (reactionId === String(targetObj.id) || reactionId.includes(String(targetObj.id)))) ||
      (targetObj.name && (reactionName === targetObj.name.toLowerCase() || reactionName.includes(targetObj.name.toLowerCase()))) ||
      (targetObj.formatted && (reactionToString === targetObj.formatted || reactionId === targetObj.formatted)) ||
      (targetObj.isUnicode && (reaction.emoji?.name === targetObj.reactable || reactionToString === targetObj.reactable));

    if (isTarget) {
      claimed = true;
      collector.stop('claimed');

      const amount = Math.floor(Math.random() * 2) + 1;
      let member = null;
      try {
        member = dropMsg.guild?.members?.cache?.get(user.id) || await dropMsg.guild?.members?.fetch(user.id).catch(() => null);
      } catch (_) {}

      const userDisplayName = member?.displayName || user.displayName || user.globalName || user.username;
      const userAvatar = (member && typeof member.displayAvatarURL === 'function')
        ? member.displayAvatarURL({ extension: 'png', size: 128 })
        : (typeof user.displayAvatarURL === 'function' ? user.displayAvatarURL({ extension: 'png', size: 128 }) : null);

      updateUserProfile(user.id, {
        username: user.username,
        displayName: userDisplayName,
        avatarUrl: userAvatar,
      });

      // Registra ganho no histórico financeiro de abóboras (Ledger)
      const updatedBalance = addSeasonalBalance(user.id, amount, {
        source: 'drop',
        description: `Baú Misterioso da Pyxie aberto (+${amount} Abóboras)`,
        messageId: dropMsg.id,
      });

      // Atualiza o registro do drop no histórico de drops
      const currentData = loadData();
      const storedDrop = (currentData.history?.drops || []).find((d) => d.messageId === dropMsg.id);
      if (storedDrop) {
        storedDrop.status = 'reivindicado';
        storedDrop.winner = {
          userId: user.id,
          username: user.username,
          displayName: userDisplayName,
          avatarUrl: userAvatar,
          amount,
          claimedAt: Date.now(),
        };
        saveData(currentData);
      }

      const currencyEmoji = resolveSeasonalEmoji(client, config.assets?.emojis?.currency, '🎃');
      const winEmbed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('🎉 BAÚ ABERTO COM SUCESSO! 🎉')
        .setDescription(
          `<@${user.id}> foi mais rápido que a luz e abriu o baú primeiro!\n\n` +
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
      // Atualiza status para expirado no histórico
      const currentData = loadData();
      const storedDrop = (currentData.history?.drops || []).find((d) => d.messageId === dropMsg.id);
      if (storedDrop && storedDrop.status === 'ativo') {
        storedDrop.status = 'expirado';
        saveData(currentData);
      }

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
  if (deleteTimer && typeof deleteTimer.unref === 'function') deleteTimer.unref();
  activeTimers.add(deleteTimer);

  return true;
}

module.exports = {
  start,
  stop,
  triggerDrop,
  getNextScheduledDrops,
};
