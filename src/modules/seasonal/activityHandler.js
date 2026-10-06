const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const {
  loadConfig,
  loadData,
  saveData,
  addSeasonalBalance,
  resolveSeasonalEmojiObject,
  isSeasonalActive,
} = require('./seasonalManager');

let activityJobs = [];
let morningUsers = new Set();
let nightUsers = new Set();
let isInitialized = false;

/**
 * Retorna a hora atual (0-23) no fuso horário configurado (padrão America/Sao_Paulo).
 */
function getHourInTimezone(date = new Date(), timezone = 'America/Sao_Paulo') {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const parsed = parseInt(formatter.format(date), 10);
    return isNaN(parsed) ? date.getHours() : parsed;
  } catch (_) {
    return date.getHours();
  }
}

/**
 * Identifica a janela de atividade com base na hora:
 * - 'morning': 06:00 às 10:59:59 (hour >= 6 && hour < 11)
 * - 'night': 23:00 às 02:59:59 (hour >= 23 || hour < 3)
 * - null: fora das janelas
 */
function getCurrentWindow(date = new Date(), timezone = 'America/Sao_Paulo') {
  const hour = getHourInTimezone(date, timezone);
  if (hour >= 6 && hour < 11) {
    return 'morning';
  }
  if (hour >= 23 || hour < 3) {
    return 'night';
  }
  return null;
}

/**
 * Carrega o estado salvo em seasonalData.json para a memória
 */
function loadStateFromStorage() {
  const data = loadData();
  const activity = data.activity || {};
  morningUsers = new Set(Array.isArray(activity.morningUserIds) ? activity.morningUserIds : []);
  nightUsers = new Set(Array.isArray(activity.nightUserIds) ? activity.nightUserIds : []);
  isInitialized = true;
}

/**
 * Salva o estado atual da memória em seasonalData.json
 */
function saveStateToStorage() {
  const currentData = loadData();
  currentData.activity = {
    morningUserIds: Array.from(morningUsers),
    nightUserIds: Array.from(nightUsers),
  };
  saveData(currentData);
}

/**
 * Inicia os agendamentos das apurações diárias:
 * - 11:00 BRT: Apuração da janela matinal (+1 moeda)
 * - 03:00 BRT: Apuração da janela noturna (+2 moedas)
 */
function start(client) {
  stop();
  loadStateFromStorage();

  const config = loadConfig();
  const tz = config.dates?.timezone || 'America/Sao_Paulo';

  // 1. Cron matinal: Todos os dias às 11:00 BRT
  const morningJob = cron.schedule(
    '0 11 * * *',
    () => {
      tallyMorning(client).catch((err) => {
        console.error('[Seasonal:Activity] Erro ao apurar atividade matinal:', err);
      });
    },
    { timezone: tz }
  );
  activityJobs.push(morningJob);

  // 2. Cron noturno: Todos os dias às 03:00 BRT
  const nightJob = cron.schedule(
    '0 3 * * *',
    () => {
      tallyNight(client).catch((err) => {
        console.error('[Seasonal:Activity] Erro ao apurar atividade noturna:', err);
      });
    },
    { timezone: tz }
  );
  activityJobs.push(nightJob);

  console.log('[Seasonal:Activity] Crons de atividade (11:00 e 03:00 BRT) iniciados com sucesso.');
}

/**
 * Para todos os jobs e libera memória (Zero Memory Leak)
 */
function stop() {
  for (const job of activityJobs) {
    try {
      job.stop();
    } catch (_) {}
  }
  activityJobs = [];
}

/**
 * Rastreia interações de mensagens no canal oficial de drops durante as janelas de atividade.
 * Retorna true se um novo usuário foi contabilizado nesta janela.
 */
function trackMessage(message) {
  if (!isSeasonalActive()) return false;
  if (!message || !message.author || message.author.bot) return false;

  const config = loadConfig();
  const dropsChannelId = config.channels?.dropsChannelId;
  if (!dropsChannelId || message.channelId !== dropsChannelId) {
    return false;
  }

  if (!isInitialized) {
    loadStateFromStorage();
  }

  const tz = config.dates?.timezone || 'America/Sao_Paulo';
  const windowType = getCurrentWindow(message.createdAt || new Date(), tz);

  if (windowType === 'morning') {
    if (morningUsers.has(message.author.id)) {
      return false;
    }
    morningUsers.add(message.author.id);
    saveStateToStorage();
    return true;
  }

  if (windowType === 'night') {
    if (nightUsers.has(message.author.id)) {
      return false;
    }
    nightUsers.add(message.author.id);
    saveStateToStorage();
    return true;
  }

  return false;
}

/**
 * Divide uma lista de menções para garantir que caiba no limite de 2000 caracteres do Discord.
 */
function splitMentions(userIds, maxChars = 1800) {
  const chunks = [];
  let current = '';

  for (const id of userIds) {
    const mention = `<@${id}> `;
    if ((current + mention).length > maxChars) {
      if (current.trim().length > 0) chunks.push(current.trim());
      current = mention;
    } else {
      current += mention;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Apuração da janela matinal (06:00 às 11:00):
 * Premia cada usuário ativo com +1 moeda sazonal e envia anúncio no canal de drops marcando todos.
 */
async function tallyMorning(client) {
  if (!isSeasonalActive()) return { success: false, reason: 'inactive' };
  loadStateFromStorage();

  const userIds = Array.from(morningUsers);
  morningUsers.clear();
  saveStateToStorage();

  if (userIds.length === 0) {
    console.log('[Seasonal:Activity] Apuração matinal (06h-11h): nenhum usuário interagiu na janela.');
    return { success: true, count: 0, userIds: [] };
  }

  const config = loadConfig();
  const currencyName = config.currencyName || 'Abóboras';
  const currencyEmojiObj = resolveSeasonalEmojiObject(client, config.assets?.emojis?.currency, '🎃');
  const rewardAmount = 1;

  // Entrega as moedas atômicas para cada participante
  for (const userId of userIds) {
    addSeasonalBalance(userId, rewardAmount);
  }

  // Notificação com menção no canal de drops
  if (client && config.channels?.dropsChannelId) {
    try {
      const channel = await client.channels.fetch(config.channels.dropsChannelId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor('#f59e0b')
          .setTitle('☀️ RECOMPENSA DE ATIVIDADE MATINAL! ☀️')
          .setDescription(
            `A Cringelândia amanheceu viva! Todos que interagiram neste canal entre **06:00 e 11:00** foram abençoados pela Pyxie.\n\n` +
            `🎁 **Recompensa:** Cada um recebeu **+${rewardAmount} ${currencyEmojiObj.formatted} ${currencyName}**!`
          )
          .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
          .setTimestamp();

        const mentionChunks = splitMentions(userIds);
        if (mentionChunks.length > 0) {
          await channel.send({
            content: `📢 **Membros premiados pela presença matinal:**\n${mentionChunks[0]}`,
            embeds: [embed],
          }).catch(() => null);

          // Se houver mais menções devido a muitos usuários
          for (let i = 1; i < mentionChunks.length; i++) {
            await channel.send({ content: mentionChunks[i] }).catch(() => null);
          }
        }
      }
    } catch (err) {
      console.error('[Seasonal:Activity] Erro ao enviar anúncio matinal no canal:', err);
    }
  }

  console.log(`[Seasonal:Activity] Apuração matinal concluída: ${userIds.length} usuários premiados com +${rewardAmount} moeda(s).`);
  return { success: true, count: userIds.length, userIds, rewardAmount };
}

/**
 * Apuração da janela noturna/madrugada (23:00 às 03:00):
 * Premia cada usuário ativo com +2 moedas sazonais e envia anúncio no canal de drops marcando todos.
 */
async function tallyNight(client) {
  if (!isSeasonalActive()) return { success: false, reason: 'inactive' };
  loadStateFromStorage();

  const userIds = Array.from(nightUsers);
  nightUsers.clear();
  saveStateToStorage();

  if (userIds.length === 0) {
    console.log('[Seasonal:Activity] Apuração noturna (23h-03h): nenhum usuário interagiu na janela.');
    return { success: true, count: 0, userIds: [] };
  }

  const config = loadConfig();
  const currencyName = config.currencyName || 'Abóboras';
  const currencyEmojiObj = resolveSeasonalEmojiObject(client, config.assets?.emojis?.currency, '🎃');
  const rewardAmount = 2;

  // Entrega as moedas atômicas para cada participante
  for (const userId of userIds) {
    addSeasonalBalance(userId, rewardAmount);
  }

  // Notificação com menção no canal de drops
  if (client && config.channels?.dropsChannelId) {
    try {
      const channel = await client.channels.fetch(config.channels.dropsChannelId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor('#8b5cf6')
          .setTitle('🌙 RECOMPENSA DOS MORCEGOS NOTURNOS! 🌙')
          .setDescription(
            `As corujas e almas penadas que mantiveram este canal acordado entre **23:00 e 03:00** foram presenteadas pela Pyxie.\n\n` +
            `🎁 **Recompensa:** Cada um recebeu **+${rewardAmount} ${currencyEmojiObj.formatted} ${currencyName}** por sua vigília sombria!`
          )
          .setFooter({ text: config.templates?.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
          .setTimestamp();

        const mentionChunks = splitMentions(userIds);
        if (mentionChunks.length > 0) {
          await channel.send({
            content: `📢 **Membros premiados pela vigília noturna:**\n${mentionChunks[0]}`,
            embeds: [embed],
          }).catch(() => null);

          // Se houver mais menções devido a muitos usuários
          for (let i = 1; i < mentionChunks.length; i++) {
            await channel.send({ content: mentionChunks[i] }).catch(() => null);
          }
        }
      }
    } catch (err) {
      console.error('[Seasonal:Activity] Erro ao enviar anúncio noturno no canal:', err);
    }
  }

  console.log(`[Seasonal:Activity] Apuração noturna concluída: ${userIds.length} usuários premiados com +${rewardAmount} moeda(s).`);
  return { success: true, count: userIds.length, userIds, rewardAmount };
}

/**
 * Utilitários auxiliares para consulta e testes
 */
function getMorningUsers() {
  if (!isInitialized) loadStateFromStorage();
  return Array.from(morningUsers);
}

function getNightUsers() {
  if (!isInitialized) loadStateFromStorage();
  return Array.from(nightUsers);
}

function clearActivityUsers() {
  morningUsers.clear();
  nightUsers.clear();
  saveStateToStorage();
}

module.exports = {
  start,
  stop,
  trackMessage,
  tallyMorning,
  tallyNight,
  getCurrentWindow,
  getHourInTimezone,
  getMorningUsers,
  getNightUsers,
  clearActivityUsers,
};

