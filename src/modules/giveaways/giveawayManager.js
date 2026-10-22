const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

const DATA_FILE = path.join(__dirname, '..', '..', '..', 'data', 'giveawaysData.json');
const wizardDrafts = new Map(); // userId -> draft
const pendingUpdates = new Map(); // giveawayId -> timeoutId

// Fallback visual theme color
const EMBED_PINK = '#ec4899';
const EMBED_MUTED = '#64748b';
const EMBED_SUCCESS = '#10b981';

/**
 * Lê e grava dados de sorteios atomicamente
 */
function loadGiveawaysData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const initial = { giveaways: {} };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw) || { giveaways: {} };
  } catch (err) {
    console.error('[giveawayManager] Erro ao ler giveawaysData.json:', err.message);
    return { giveaways: {} };
  }
}

function saveGiveawaysData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, DATA_FILE);
    return true;
  } catch (err) {
    console.error('[giveawayManager] Erro ao salvar giveawaysData.json:', err.message);
    return false;
  }
}

/**
 * Converte string DD/MM/AAAA HH:mm ou AGORA para timestamp
 */
function parseDateTime(input) {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();
  if (clean.toUpperCase() === 'AGORA') return Date.now();

  const match = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const min = parseInt(match[5], 10);

  const dt = new Date(year, month, day, hour, min, 0);
  const ts = dt.getTime();
  return isNaN(ts) ? null : ts;
}

/**
 * Hub Ephemeral principal do /py-sorteio
 */
function buildHubPayload() {
  const embed = new EmbedBuilder()
    .setColor(EMBED_PINK)
    .setTitle('🎉  ✦  Central de Sorteios Pyxie')
    .setDescription(
      `### 🎁 Gerencie seus Sorteios com Facilidade\n\n` +
      `Crie sorteios modernos com regras avançadas de cargos, multiplicadores de chances e apuração justa via Fisher-Yates.\n\n` +
      `• **Criar Sorteio:** Inicia o assistente interativo passo a passo.\n\n` +
      `• **Cancelar Sorteio:** Encerre sorteios ativos ou agendados antecipadamente.\n\n` +
      `-# 🌷 Pyxie Community Engine • Feito para comunidades ativas`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('gw:hub:create')
      .setLabel('Criar Sorteio')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('gw:hub:cancel')
      .setLabel('Cancelar um Sorteio')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

/**
 * Modal Passo 1 - Dados Básicos
 */
function buildStep1Modal() {
  const modal = new ModalBuilder()
    .setCustomId('gw:modal:step1')
    .setTitle('Novo Sorteio - Dados Básicos');

  const titleInput = new TextInputBuilder()
    .setCustomId('title')
    .setLabel('Título / Nome do Sorteio')
    .setPlaceholder('Ex: Nitro Mensal 💖')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  const startInput = new TextInputBuilder()
    .setCustomId('startsAt')
    .setLabel('Data & Hora de Início (ou AGORA)')
    .setPlaceholder('DD/MM/AAAA HH:mm ou AGORA')
    .setValue('AGORA')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const endInput = new TextInputBuilder()
    .setCustomId('endsAt')
    .setLabel('Data & Hora de Término')
    .setPlaceholder('DD/MM/AAAA HH:mm (mínimo 1 min)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const winnersInput = new TextInputBuilder()
    .setCustomId('winnersCount')
    .setLabel('Quantidade de Ganhadores (1 a 5)')
    .setPlaceholder('1')
    .setValue('1')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(startInput),
    new ActionRowBuilder().addComponents(endInput),
    new ActionRowBuilder().addComponents(winnersInput)
  );

  return modal;
}

/**
 * Modal Passo 2 - Prêmios
 */
function buildStep2Modal(winnersCount = 1) {
  const modal = new ModalBuilder()
    .setCustomId('gw:modal:step2')
    .setTitle(`Prêmios (${winnersCount} Ganhador${winnersCount > 1 ? 'es' : ''})`);

  if (winnersCount === 1) {
    const prizeInput = new TextInputBuilder()
      .setCustomId('prize')
      .setLabel('Prêmio do Sorteio')
      .setPlaceholder('Ex: Discord Nitro Mensal')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(prizeInput));
  } else {
    const prizesInput = new TextInputBuilder()
      .setCustomId('prizes_list')
      .setLabel('Prêmios por Colocação (1 por linha)')
      .setPlaceholder('1º Lugar: Nitro Mensal\n2º Lugar: 50.000 Moedas')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(prizesInput));
  }

  return modal;
}

/**
 * Resumo de restrições formatado
 */
function formatRestrictionsSummary(restrictions = {}) {
  const parts = [];
  if (restrictions.allowedRoles && restrictions.allowedRoles.length > 0) {
    parts.push(`• **Cargos Permitidos:** ${restrictions.allowedRoles.map((r) => `<@&${r}>`).join(', ')}`);
  }
  if (restrictions.blockedRoles && restrictions.blockedRoles.length > 0) {
    parts.push(`• **Cargos Bloqueados:** ${restrictions.blockedRoles.map((r) => `<@&${r}>`).join(', ')}`);
  }
  if (restrictions.bonusRoles && restrictions.bonusRoles.length > 0) {
    parts.push(`• **Cargos Bônus (2x chances):** ${restrictions.bonusRoles.map((r) => `<@&${r}>`).join(', ')}`);
  }
  if (restrictions.minAccountAgeDays && restrictions.minAccountAgeDays > 0) {
    parts.push(`• **Idade Mínima de Conta:** \`${restrictions.minAccountAgeDays} dias\``);
  }
  if (parts.length === 0) return '';
  return `${parts.join('\n\n')}\n\n`;
}

/**
 * Constrói payload do Card Público do Sorteio
 */
function buildPublicCardPayload(giveaway) {
  const isActive = giveaway.status === 'ACTIVE';
  const isFinished = giveaway.status === 'FINISHED';
  const isCancelled = giveaway.status === 'CANCELLED';

  const embed = new EmbedBuilder();

  if (isActive) {
    embed.setColor(EMBED_PINK);
    embed.setTitle(`${giveaway.emoji || '🎉'}  ✦  ${giveaway.title}`);
    embed.setDescription(
      `### 🎁 Sorteio Oficial da Comunidade\n\n` +
      `Participe agora clicando no botão abaixo para concorrer!\n\n` +
      `• **Prêmio(s):** ${giveaway.prizes.map((p) => `\`${p}\``).join(' • ')}\n\n` +
      `• **Ganhadores:** \`${giveaway.winnersCount}\`\n\n` +
      `• **Criado por:** <@${giveaway.createdBy}>\n\n` +
      `• **Encerramento:** <t:${Math.floor(giveaway.endsAt / 1000)}:f> (<t:${Math.floor(giveaway.endsAt / 1000)}:R>)\n\n` +
      formatRestrictionsSummary(giveaway.restrictions) +
      `-# 🛡️ Sorteio verificado pela Pyxie • ID: \`${giveaway.id}\``
    );
  } else if (isFinished) {
    embed.setColor(EMBED_SUCCESS);
    embed.setTitle(`🏁  ✦  Sorteio Encerrado: ${giveaway.title}`);

    let winnersText = '*Nenhum participante elegível entrou no sorteio.*';
    if (giveaway.winners && giveaway.winners.length > 0) {
      winnersText = giveaway.winners
        .map((w, idx) => {
          const prizeName = giveaway.prizes[idx] || giveaway.prizes[0] || 'Prêmio';
          return `🏆 **${idx + 1}º Lugar:** <@${w}> — \`${prizeName}\``;
        })
        .join('\n\n');
    }

    embed.setDescription(
      `### 🎁 Resultado Oficial da Apuração\n\n` +
      `${winnersText}\n\n` +
      `• **Total de Entradas:** \`${Object.keys(giveaway.participants || {}).length}\` participantes\n\n` +
      `• **Encerrado em:** <t:${Math.floor((giveaway.endedAt || Date.now()) / 1000)}:f>\n\n` +
      `-# 🌷 Parabéns aos vencedores! Pyxie Community Engine`
    );
  } else if (isCancelled) {
    embed.setColor(EMBED_MUTED);
    embed.setTitle(`🚫  ✦  Sorteio Cancelado: ${giveaway.title}`);
    embed.setDescription(
      `### 🛑 Este sorteio foi cancelado pela administração do servidor.\n\n` +
      `• **ID do Sorteio:** \`${giveaway.id}\`\n\n` +
      `• **Cancelado em:** <t:${Math.floor(Date.now() / 1000)}:f>\n\n` +
      `-# 🌷 Pyxie Community Engine`
    );
  } else {
    // Scheduled
    embed.setColor(EMBED_PINK);
    embed.setTitle(`⏰  ✦  Sorteio Agendado: ${giveaway.title}`);
    embed.setDescription(
      `### 🎁 Este sorteio iniciará em breve!\n\n` +
      `• **Início Previsto:** <t:${Math.floor(giveaway.startsAt / 1000)}:f> (<t:${Math.floor(giveaway.startsAt / 1000)}:R>)\n\n` +
      `• **Prêmio(s):** ${giveaway.prizes.map((p) => `\`${p}\``).join(' • ')}\n\n` +
      `• **Ganhadores:** \`${giveaway.winnersCount}\`\n\n` +
      `-# 🛡️ Sorteio verificado pela Pyxie • ID: \`${giveaway.id}\``
    );
  }

  const participantsCount = Object.keys(giveaway.participants || {}).length;

  let btn;
  if (isActive) {
    btn = new ButtonBuilder()
      .setCustomId(`gw:join:${giveaway.id}`)
      .setLabel(`Participar (${participantsCount})`)
      .setEmoji(giveaway.emoji || '🎉')
      .setStyle(ButtonStyle.Primary);
  } else if (isFinished) {
    btn = new ButtonBuilder()
      .setCustomId(`gw:disabled:${giveaway.id}`)
      .setLabel(`Sorteio Encerrado (${participantsCount})`)
      .setEmoji('🏁')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
  } else {
    btn = new ButtonBuilder()
      .setCustomId(`gw:disabled:${giveaway.id}`)
      .setLabel(`Sorteio Cancelado (${participantsCount})`)
      .setEmoji('🚫')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
  }

  const row = new ActionRowBuilder().addComponents(btn);
  return { embeds: [embed], components: [row] };
}

/**
 * Agrupador debounced de atualização visual de mensagens públicas do Discord (1500ms)
 */
function scheduleCardUpdate(giveaway, client) {
  if (!giveaway || !giveaway.channelId || !giveaway.messageId) return;

  const existingTimer = pendingUpdates.get(giveaway.id);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(async () => {
    pendingUpdates.delete(giveaway.id);
    try {
      if (!client) return;
      const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
      if (!channel || !channel.isTextBased()) return;
      const msg = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (!msg) return;

      const payload = buildPublicCardPayload(giveaway);
      await msg.edit(payload).catch(() => null);
    } catch (err) {
      console.warn(`[giveawayManager] Falha ao atualizar card do sorteio ${giveaway.id}:`, err.message);
    }
  }, 1500);

  pendingUpdates.set(giveaway.id, timer);
}

/**
 * Realiza apuração justa do sorteio via Fisher-Yates
 */
async function finishGiveaway(giveaway, client) {
  giveaway.status = 'FINISHED';
  giveaway.endedAt = Date.now();

  const participants = giveaway.participants || {};
  const entries = Object.entries(participants);

  // Constrói pool ponderado por pesos de cargos bônus
  const pool = [];
  for (const [uid, meta] of entries) {
    const weight = meta.weight || 1;
    for (let i = 0; i < weight; i++) {
      pool.push(uid);
    }
  }

  // Embaralhamento Fisher-Yates com semente criptográfica
  for (let i = pool.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Extrai vencedores únicos
  const winners = [];
  for (const uid of pool) {
    if (!winners.includes(uid)) {
      winners.push(uid);
      if (winners.length >= giveaway.winnersCount) break;
    }
  }

  giveaway.winners = winners;

  // Persiste dados atualizados
  const data = loadGiveawaysData();
  data.giveaways[giveaway.id] = giveaway;
  saveGiveawaysData(data);

  // Atualiza mensagem no canal
  if (client && giveaway.channelId && giveaway.messageId) {
    try {
      const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const msg = await channel.messages.fetch(giveaway.messageId).catch(() => null);
        if (msg) {
          const payload = buildPublicCardPayload(giveaway);
          await msg.edit(payload).catch(() => null);
        }

        // Envia anúncio público mencionando EXCLUSIVAMENTE os vencedores (sem @everyone ou @here)
        if (winners.length > 0) {
          const mentions = winners.map((w) => `<@${w}>`).join(', ');
          await channel.send({
            content: `🎉 Parabéns aos ganhadores: ${mentions}! Entrem em contato com <@${giveaway.createdBy}> para resgatar seus prêmios. 🎁`,
            allowedMentions: { users: winners, parse: [] },
          }).catch(() => null);
        } else {
          await channel.send({
            content: `🏁 O sorteio **${giveaway.title}** foi encerrado, mas não houve participantes suficientes para definir um vencedor.`,
            allowedMentions: { parse: [] },
          }).catch(() => null);
        }
      }
    } catch (err) {
      console.warn(`[giveawayManager] Erro ao finalizar sorteio ${giveaway.id}:`, err.message);
    }
  }
}

/**
 * Worker periódico (a cada 15s) para transição de estados dos sorteios
 */
async function checkGiveawaysLifecycle(client) {
  if (!client) return;
  const data = loadGiveawaysData();
  const list = Object.values(data.giveaways || {});
  const now = Date.now();

  for (const gw of list) {
    // 1. SCHEDULED -> ACTIVE
    if (gw.status === 'SCHEDULED' && now >= gw.startsAt) {
      gw.status = 'ACTIVE';
      if (!gw.messageId && gw.channelId) {
        try {
          const channel = await client.channels.fetch(gw.channelId).catch(() => null);
          if (channel && channel.isTextBased()) {
            const payload = buildPublicCardPayload(gw);
            const msg = await channel.send(payload);
            gw.messageId = msg.id;
          }
        } catch (_) {}
      }
      data.giveaways[gw.id] = gw;
      saveGiveawaysData(data);
    }

    // 2. ACTIVE -> FINISHED
    if (gw.status === 'ACTIVE' && now >= gw.endsAt) {
      await finishGiveaway(gw, client);
    }
  }
}

/**
 * Roteador central de interações de Sorteios ('gw:*')
 */
async function handleGiveawayInteraction(interaction, client) {
  if (!interaction || interaction.replied || interaction.deferred) return;

  const { customId } = interaction;
  if (!customId || !customId.startsWith('gw:')) return;

  // 0. Abrir Hub Ephemeral (a partir de comando por prefixo)
  if (customId === 'gw:hub:open') {
    if (
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild) &&
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)
    ) {
      await interaction.reply({
        content: '❌ Você não tem permissão de gerenciar canais ou o servidor para acessar os sorteios.',
        ephemeral: true,
      });
      return;
    }

    const hub = buildHubPayload();
    await interaction.reply({ ...hub, ephemeral: true });
    return;
  }

  // 1. Abrir modal passo 1 a partir do hub
  if (customId === 'gw:hub:create') {
    if (
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild) &&
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)
    ) {
      await interaction.reply({
        content: '❌ Você não tem permissão de gerenciar canais ou o servidor para criar sorteios.',
        ephemeral: true,
      });
      return;
    }

    const modal = buildStep1Modal();
    await interaction.showModal(modal);
    return;
  }

  // 2. Cancelar sorteio a partir do hub
  if (customId === 'gw:hub:cancel') {
    if (
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild) &&
      !interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)
    ) {
      await interaction.reply({
        content: '❌ Você não tem permissão para cancelar sorteios.',
        ephemeral: true,
      });
      return;
    }

    const data = loadGiveawaysData();
    const active = Object.values(data.giveaways || {}).filter(
      (g) => g.guildId === interaction.guildId && (g.status === 'ACTIVE' || g.status === 'SCHEDULED')
    );

    if (active.length === 0) {
      await interaction.reply({
        content: 'ℹ️ Não há sorteios ativos ou agendados neste servidor no momento.',
        ephemeral: true,
      });
      return;
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('gw:cancel:select')
      .setPlaceholder('Escolha o sorteio que deseja cancelar...')
      .addOptions(
        active.slice(0, 25).map((g) => ({
          label: g.title.substring(0, 50),
          value: g.id,
          description: `Status: ${g.status} | Ganhadores: ${g.winnersCount}`,
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);
    await interaction.reply({
      content: '🗑️ **Selecione o sorteio que deseja encerrar/cancelar:**',
      components: [row],
      ephemeral: true,
    });
    return;
  }

  // 3. Seleção de sorteio para cancelamento
  if (customId === 'gw:cancel:select') {
    const gwId = interaction.values?.[0];
    const data = loadGiveawaysData();
    const gw = data.giveaways?.[gwId];

    if (!gw) {
      await interaction.update({ content: '❌ Sorteio não encontrado.', components: [] });
      return;
    }

    gw.status = 'CANCELLED';
    gw.cancelledAt = Date.now();
    data.giveaways[gw.id] = gw;
    saveGiveawaysData(data);

    // Atualiza mensagem pública se existir
    if (client && gw.channelId && gw.messageId) {
      try {
        const channel = await client.channels.fetch(gw.channelId).catch(() => null);
        if (channel && channel.isTextBased()) {
          const msg = await channel.messages.fetch(gw.messageId).catch(() => null);
          if (msg) {
            const payload = buildPublicCardPayload(gw);
            await msg.edit(payload).catch(() => null);
          }
        }
      } catch (_) {}
    }

    await interaction.update({
      content: `✅ O sorteio **${gw.title}** foi cancelado com sucesso.`,
      components: [],
    });
    return;
  }

  // 4. Submissão do Modal Passo 1
  if (interaction.isModalSubmit() && customId === 'gw:modal:step1') {
    const title = interaction.fields.getTextInputValue('title')?.trim();
    const startsAtRaw = interaction.fields.getTextInputValue('startsAt')?.trim();
    const endsAtRaw = interaction.fields.getTextInputValue('endsAt')?.trim();
    const winnersCountRaw = interaction.fields.getTextInputValue('winnersCount')?.trim();

    const startsAt = parseDateTime(startsAtRaw);
    const endsAt = parseDateTime(endsAtRaw);
    const winnersCount = parseInt(winnersCountRaw, 10);

    if (!title) {
      await interaction.reply({ content: '❌ O título do sorteio é obrigatório.', ephemeral: true });
      return;
    }

    if (!startsAt) {
      await interaction.reply({
        content: '❌ Data de início inválida. Use `DD/MM/AAAA HH:mm` ou `AGORA`.',
        ephemeral: true,
      });
      return;
    }

    if (!endsAt) {
      await interaction.reply({
        content: '❌ Data de término inválida. Use o formato `DD/MM/AAAA HH:mm`.',
        ephemeral: true,
      });
      return;
    }

    if (endsAt <= startsAt || endsAt < Date.now() + 50000) {
      await interaction.reply({
        content: '❌ A data de término deve ser no mínimo 1 minuto no futuro e posterior ao início.',
        ephemeral: true,
      });
      return;
    }

    if (isNaN(winnersCount) || winnersCount < 1 || winnersCount > 5) {
      await interaction.reply({
        content: '❌ A quantidade de ganhadores deve ser um número entre 1 e 5.',
        ephemeral: true,
      });
      return;
    }

    // Salva rascunho
    wizardDrafts.set(interaction.user.id, {
      guildId: interaction.guildId,
      createdBy: interaction.user.id,
      title,
      startsAt,
      endsAt,
      winnersCount,
      prizes: [],
      channelId: null,
      allowedRoles: [],
      blockedRoles: [],
      bonusRoles: [],
      minAccountAgeDays: 0,
      emoji: '🎉',
    });

    const step2Embed = new EmbedBuilder()
      .setColor(EMBED_PINK)
      .setTitle('🎁  ✦  Passo 2: Definição dos Prêmios')
      .setDescription(
        `### 🏆 Prêmios do Sorteio\n\n` +
        `Você configurou **${winnersCount} ganhador(es)** para este sorteio.\n\n` +
        `Clique no botão abaixo para preencher a descrição dos prêmios!`
      );

    const step2Row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gw:btn:open_step2')
        .setLabel('Configurar Prêmios')
        .setEmoji('🎁')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [step2Embed], components: [step2Row], ephemeral: true });
    return;
  }

  // 5. Botão para abrir o Modal Passo 2
  if (customId === 'gw:btn:open_step2') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (!draft) {
      await interaction.reply({
        content: '❌ Rascunho expirado. Execute `/py-sorteio` novamente.',
        ephemeral: true,
      });
      return;
    }

    const modal = buildStep2Modal(draft.winnersCount);
    await interaction.showModal(modal);
    return;
  }

  // 6. Submissão do Modal Passo 2
  if (interaction.isModalSubmit() && customId === 'gw:modal:step2') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (!draft) {
      await interaction.reply({ content: '❌ Rascunho expirado.', ephemeral: true });
      return;
    }

    let prizes = [];
    if (draft.winnersCount === 1) {
      const p = interaction.fields.getTextInputValue('prize')?.trim();
      prizes = [p || 'Prêmio Especial'];
    } else {
      const raw = interaction.fields.getTextInputValue('prizes_list')?.trim() || '';
      prizes = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (prizes.length === 0) prizes = ['Prêmio Especial'];
    }

    draft.prizes = prizes;

    // Passo 3: Escolher Canal
    const channelEmbed = new EmbedBuilder()
      .setColor(EMBED_PINK)
      .setTitle('📢  ✦  Passo 3: Canal de Publicação')
      .setDescription(
        `### 📍 Onde o sorteio acontecerá?\n\n` +
        `Selecione o canal de texto do servidor onde o card público do sorteio será publicado.`
      );

    const channelRow = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('gw:select:channel')
        .setPlaceholder('Selecione o canal do sorteio...')
        .setChannelTypes(ChannelType.GuildText)
    );

    await interaction.reply({ embeds: [channelEmbed], components: [channelRow], ephemeral: true });
    return;
  }

  // 7. Seleção de Canal (Passo 3)
  if (customId === 'gw:select:channel') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (!draft) {
      await interaction.update({ content: '❌ Rascunho expirado.', embeds: [], components: [] });
      return;
    }

    const channelId = interaction.values?.[0];
    draft.channelId = channelId;

    // Passo 4: Restrições
    const restEmbed = new EmbedBuilder()
      .setColor(EMBED_PINK)
      .setTitle('🛡️  ✦  Passo 4: Restrições & Requisitos')
      .setDescription(
        `### ⚙️ Regras Opcionais de Participação\n\n` +
        `Personalize quem pode participar e configure vantagens exclusivas.\n\n` +
        `• **Cargos Permitidos (Whitelist):** Somente membros com esses cargos poderão entrar.\n\n` +
        `• **Cargos Bloqueados (Blacklist):** Membros com esses cargos não poderão entrar.\n\n` +
        `• **Cargos Bônus (2x chances):** Entradas terão peso dobrado na apuração.\n\n` +
        `• **Idade Mínima de Conta:** Protege o sorteio contra contas recém-criadas.`
      );

    const allowedRow = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('gw:roles:allowed')
        .setPlaceholder('Cargos Permitidos (Whitelist - Opcional)')
        .setMinValues(0)
        .setMaxValues(5)
    );

    const blockedRow = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('gw:roles:blocked')
        .setPlaceholder('Cargos Bloqueados (Blacklist - Opcional)')
        .setMinValues(0)
        .setMaxValues(5)
    );

    const bonusRow = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('gw:roles:bonus')
        .setPlaceholder('Cargos Bônus (Chances Extras - Opcional)')
        .setMinValues(0)
        .setMaxValues(5)
    );

    const ageRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('gw:age:0').setLabel('Sem Mínimo').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gw:age:7').setLabel('7 Dias').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gw:age:30').setLabel('30 Dias').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gw:step:to_emoji').setLabel('Avançar').setEmoji('➡️').setStyle(ButtonStyle.Success)
    );

    await interaction.update({
      embeds: [restEmbed],
      components: [allowedRow, blockedRow, bonusRow, ageRow],
    });
    return;
  }

  // 8. Configuração de cargos de restrição
  if (customId === 'gw:roles:allowed') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (draft) draft.allowedRoles = interaction.values || [];
    await interaction.deferUpdate();
    return;
  }

  if (customId === 'gw:roles:blocked') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (draft) draft.blockedRoles = interaction.values || [];
    await interaction.deferUpdate();
    return;
  }

  if (customId === 'gw:roles:bonus') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (draft) draft.bonusRoles = interaction.values || [];
    await interaction.deferUpdate();
    return;
  }

  if (customId.startsWith('gw:age:')) {
    const days = parseInt(customId.split(':')[2], 10) || 0;
    const draft = wizardDrafts.get(interaction.user.id);
    if (draft) draft.minAccountAgeDays = days;
    await interaction.deferUpdate();
    return;
  }

  // 9. Avançar para Passo 5: Emojis
  if (customId === 'gw:step:to_emoji') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (!draft) {
      await interaction.update({ content: '❌ Rascunho expirado.', embeds: [], components: [] });
      return;
    }

    const emojiEmbed = new EmbedBuilder()
      .setColor(EMBED_PINK)
      .setTitle('🎨  ✦  Passo 5: Emoji de Participação')
      .setDescription(
        `### 🌟 Escolha o Emoji do Botão\n\n` +
        `Selecione qual emoji será exibido no botão interativo de participação do card público.`
      );

    const emojiRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('gw:emoji:tada').setLabel('Festa').setEmoji('🎉').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gw:emoji:gift').setLabel('Presente').setEmoji('🎁').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gw:emoji:gem').setLabel('Gema').setEmoji('💎').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gw:emoji:star').setLabel('Estrela').setEmoji('🌟').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('gw:emoji:clover').setLabel('Trevo').setEmoji('🍀').setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [emojiEmbed], components: [emojiRow] });
    return;
  }

  // 10. Seleção de Emoji -> Passo 6: Confirmação
  if (customId.startsWith('gw:emoji:')) {
    const draft = wizardDrafts.get(interaction.user.id);
    if (!draft) {
      await interaction.update({ content: '❌ Rascunho expirado.', embeds: [], components: [] });
      return;
    }

    const type = customId.split(':')[2];
    const emojiMap = { tada: '🎉', gift: '🎁', gem: '💎', star: '🌟', clover: '🍀' };
    draft.emoji = emojiMap[type] || '🎉';

    const confirmEmbed = new EmbedBuilder()
      .setColor(EMBED_PINK)
      .setTitle('✅  ✦  Passo 6: Confirmação & Agendamento')
      .setDescription(
        `### 📋 Resumo da Configuração do Sorteio\n\n` +
        `• **Título:** ${draft.title}\n\n` +
        `• **Canal de Destino:** <#${draft.channelId}>\n\n` +
        `• **Início:** <t:${Math.floor(draft.startsAt / 1000)}:f> (<t:${Math.floor(draft.startsAt / 1000)}:R>)\n\n` +
        `• **Término:** <t:${Math.floor(draft.endsAt / 1000)}:f> (<t:${Math.floor(draft.endsAt / 1000)}:R>)\n\n` +
        `• **Quantidade de Ganhadores:** \`${draft.winnersCount}\`\n\n` +
        `• **Prêmio(s):** ${draft.prizes.join(', ')}\n\n` +
        `• **Emoji do Botão:** ${draft.emoji}\n\n` +
        `• **Idade Mínima de Conta:** ${draft.minAccountAgeDays ? `\`${draft.minAccountAgeDays} dias\`` : 'Sem restrição'}\n\n` +
        `• **Cargos Permitidos:** ${draft.allowedRoles?.length ? draft.allowedRoles.map((r) => `<@&${r}>`).join(', ') : 'Todos os membros'}\n\n` +
        `• **Cargos Bloqueados:** ${draft.blockedRoles?.length ? draft.blockedRoles.map((r) => `<@&${r}>`).join(', ') : 'Nenhum'}\n\n` +
        `• **Cargos com Bônus (2x):** ${draft.bonusRoles?.length ? draft.bonusRoles.map((r) => `<@&${r}>`).join(', ') : 'Nenhum'}`
      );

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gw:action:publish')
        .setLabel('Confirmar & Publicar Sorteio')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('gw:action:discard')
        .setLabel('Descartar')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [confirmEmbed], components: [confirmRow] });
    return;
  }

  // 11. Descartar Sorteio
  if (customId === 'gw:action:discard') {
    wizardDrafts.delete(interaction.user.id);
    await interaction.update({
      content: '❌ Configuração de sorteio descartada com sucesso.',
      embeds: [],
      components: [],
    });
    return;
  }

  // 12. Confirmar & Publicar Sorteio
  if (customId === 'gw:action:publish') {
    const draft = wizardDrafts.get(interaction.user.id);
    if (!draft) {
      await interaction.update({ content: '❌ Rascunho expirado.', embeds: [], components: [] });
      return;
    }

    const now = Date.now();
    const isNow = draft.startsAt <= now;
    const gwId = `gw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const giveaway = {
      id: gwId,
      guildId: draft.guildId,
      channelId: draft.channelId,
      createdBy: interaction.user.id,
      createdAt: now,
      title: draft.title,
      startsAt: draft.startsAt,
      endsAt: draft.endsAt,
      winnersCount: draft.winnersCount,
      prizes: draft.prizes,
      emoji: draft.emoji,
      restrictions: {
        allowedRoles: draft.allowedRoles || [],
        blockedRoles: draft.blockedRoles || [],
        bonusRoles: draft.bonusRoles || [],
        minAccountAgeDays: draft.minAccountAgeDays || 0,
      },
      participants: {},
      status: isNow ? 'ACTIVE' : 'SCHEDULED',
      messageId: null,
      winners: [],
    };

    if (isNow && client) {
      try {
        const channel = await client.channels.fetch(draft.channelId).catch(() => null);
        if (channel && channel.isTextBased()) {
          const payload = buildPublicCardPayload(giveaway);
          const msg = await channel.send(payload);
          giveaway.messageId = msg.id;
        }
      } catch (err) {
        console.warn('[giveawayManager] Erro ao enviar mensagem inicial do sorteio:', err.message);
      }
    }

    const data = loadGiveawaysData();
    data.giveaways[giveaway.id] = giveaway;
    saveGiveawaysData(data);

    wizardDrafts.delete(interaction.user.id);

    const statusNotice = isNow
      ? `✅ Sorteio publicado com sucesso no canal <#${draft.channelId}>!`
      : `⏰ Sorteio agendado com sucesso para iniciar em <t:${Math.floor(draft.startsAt / 1000)}:f> no canal <#${draft.channelId}>!`;

    await interaction.update({
      content: statusNotice,
      embeds: [],
      components: [],
    });
    return;
  }

  // 13. Participar / Sair do Sorteio (gw:join:<id>) com Debounce
  if (customId.startsWith('gw:join:')) {
    const gwId = customId.split(':')[2];
    const data = loadGiveawaysData();
    const gw = data.giveaways?.[gwId];

    if (!gw || gw.status !== 'ACTIVE') {
      await interaction.reply({
        content: '❌ Este sorteio não está mais ativo para novas inscrições.',
        ephemeral: true,
      });
      return;
    }

    const user = interaction.user;
    const member = interaction.member;
    const rest = gw.restrictions || {};

    // Valida idade da conta
    if (rest.minAccountAgeDays && rest.minAccountAgeDays > 0) {
      const ageDays = (Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24);
      if (ageDays < rest.minAccountAgeDays) {
        await interaction.reply({
          content: `❌ Sua conta no Discord precisa ter pelo menos **${rest.minAccountAgeDays} dias** para participar deste sorteio.`,
          ephemeral: true,
        });
        return;
      }
    }

    // Valida cargos bloqueados
    if (rest.blockedRoles && rest.blockedRoles.length > 0 && member) {
      const hasBlocked = rest.blockedRoles.some((r) => member.roles?.cache?.has(r));
      if (hasBlocked) {
        await interaction.reply({
          content: '❌ Você possui um cargo que não tem permissão para participar deste sorteio.',
          ephemeral: true,
        });
        return;
      }
    }

    // Valida cargos permitidos
    if (rest.allowedRoles && rest.allowedRoles.length > 0 && member) {
      const hasAllowed = rest.allowedRoles.some((r) => member.roles?.cache?.has(r));
      if (!hasAllowed) {
        await interaction.reply({
          content: '❌ Este sorteio é restrito a cargos específicos que você não possui.',
          ephemeral: true,
        });
        return;
      }
    }

    // Calcula peso (bônus)
    let weight = 1;
    if (rest.bonusRoles && rest.bonusRoles.length > 0 && member) {
      if (rest.bonusRoles.some((r) => member.roles?.cache?.has(r))) {
        weight = 2;
      }
    }

    // Toggle: entrar ou sair
    if (gw.participants && gw.participants[user.id]) {
      delete gw.participants[user.id];
      data.giveaways[gw.id] = gw;
      saveGiveawaysData(data);
      scheduleCardUpdate(gw, client);

      await interaction.reply({
        content: '👋 Você saiu do sorteio com sucesso.',
        ephemeral: true,
      });
    } else {
      if (!gw.participants) gw.participants = {};
      gw.participants[user.id] = {
        joinedAt: Date.now(),
        weight,
      };
      data.giveaways[gw.id] = gw;
      saveGiveawaysData(data);
      scheduleCardUpdate(gw, client);

      const bonusNotice = weight > 1 ? '\n\n🌟 *Você possui cargo bônus: suas chances são dobradas!*' : '';
      await interaction.reply({
        content: `🎉 **Inscrição Confirmada!** Você está participando do sorteio **${gw.title}**!${bonusNotice}`,
        ephemeral: true,
      });
    }
  }
}

function clearDebounces() {
  for (const timer of pendingUpdates.values()) {
    clearTimeout(timer);
  }
  pendingUpdates.clear();
}

module.exports = {
  loadGiveawaysData,
  saveGiveawaysData,
  parseDateTime,
  buildHubPayload,
  buildPublicCardPayload,
  handleGiveawayInteraction,
  checkGiveawaysLifecycle,
  clearDebounces,
};
