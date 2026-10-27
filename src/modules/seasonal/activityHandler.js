const cron = require('node-cron');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const {
  loadConfig,
  loadData,
  saveData,
  addSeasonalBalance,
  resolveSeasonalEmojiObject,
  isSeasonalActive,
  isUserExcluded,
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

  // Usuários ou cargos inelegíveis não são rastreados para atividade
  if (isUserExcluded(message.author.id, message.member)) {
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
 * Divide os premiados em mensagens de até ~1800 caracteres. Quem ligou a marcação silenciosa
 * (mentionPrefs) aparece em **negrito**, sem ping; os outros são marcados normalmente.
 * Devolve [{ text, allowedUserIds }].
 */
function splitMentions(userIds, guild = null, maxChars = 1800) {
  const mentionPrefs = require('../../services/mentionPrefs');
  const chunks = [];
  let current = { parts: [], users: [] };
  let length = 0;

  for (const id of userIds) {
    const member = guild?.members?.cache?.get(id);
    const { text, allowedUserIds } = guild
      ? mentionPrefs.formatMentions(guild.id, [{ id, displayName: member?.displayName || member?.user?.username }], ' ')
      : { text: `<@${id}>`, allowedUserIds: [id] };
    // O Discord aceita no máximo 100 IDs em allowedMentions.users por mensagem.
    if (current.parts.length && (length + text.length + 1 > maxChars || current.users.length + allowedUserIds.length > 100)) {
      chunks.push({ text: current.parts.join(' '), allowedUserIds: current.users });
      current = { parts: [], users: [] };
      length = 0;
    }
    current.parts.push(text);
    current.users.push(...allowedUserIds);
    length += text.length + 1;
  }

  if (current.parts.length) chunks.push({ text: current.parts.join(' '), allowedUserIds: current.users });
  return chunks;
}

// Botão do próprio anúncio para a pessoa ligar ou desligar a marcação silenciosa (tratado pelo message-studio).
function silentToggleRow(guild) {
  const { t } = require('../../utils/i18n');
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('pyxs:silent:seasonal:toggle')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔕')
      .setLabel(t('messageStudio.silent_button', guild || 'pt'))
  );
}

async function announceWinners(channel, header, embed, userIds, config) {
  const chunks = splitMentions(userIds, channel.guild);
  const flags = config.silentAnnouncements ? MessageFlags.SuppressNotifications : undefined;
  for (let i = 0; i < chunks.length; i++) {
    await channel
      .send({
        content: i === 0 ? `${header}\n${chunks[i].text}` : chunks[i].text,
        embeds: i === 0 ? [embed] : [],
        components: i === chunks.length - 1 ? [silentToggleRow(channel.guild)] : [],
        allowedMentions: { parse: [], users: chunks[i].allowedUserIds },
        flags,
      })
      .catch(() => null);
  }
}

/**
 * Apuração da janela matinal (06:00 às 11:00):
 * Premia cada usuário ativo com +1 moeda sazonal e envia anúncio no canal de drops marcando todos.
 */
async function tallyMorning(client) {
  if (!isSeasonalActive()) return { success: false, reason: 'inactive' };
  loadStateFromStorage();

  const userIds = Array.from(morningUsers).filter((id) => !isUserExcluded(id));
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

        await announceWinners(channel, '📢 **Membros premiados pela presença matinal:**', embed, userIds, config);
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

  const userIds = Array.from(nightUsers).filter((id) => !isUserExcluded(id));
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

        await announceWinners(channel, '📢 **Membros premiados pela vigília noturna:**', embed, userIds, config);
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

