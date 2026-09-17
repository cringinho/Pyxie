const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { getActiveExpedition, startExpedition, claimExpedition } = require('../services/petExpedition');
const { getActivePet } = require('../services/pets');
const { formatCoins, formatRemaining, t, getLanguage } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { EXPEDITION } = require('./commandNames');

function buildExpeditionView(userId, source = null) {
  const activePet = getActivePet(userId);
  const exp = getActiveExpedition(userId);

  if (!activePet) {
    return {
      content: t('expedition.noPet', source),
    };
  }

  // 1. Expedição concluída (Pronta para coletar)
  if (exp && exp.completed) {
    const isEn = getLanguage(source) === 'en';
    const isDoubled = Boolean(exp.doubled);

    let desc = t('expedition.completedDesc', source, {
      pet: `${exp.petEmoji} ${exp.petName}`,
      hours: exp.durationHours,
    });

    if (isDoubled) {
      desc += isEn
        ? '\n\n✨ **MAGIC BONUS ACTIVE:** Rewards will be **DOUBLED (2x)** upon claim!'
        : '\n\n✨ **BÔNUS MÁGICO ATIVO:** As recompensas serão **DOBRADAS (2x)** ao coletar!';
    }

    const embed = new EmbedBuilder()
      .setColor(isDoubled ? (PYXIE_COLORS.gold || '#facc15') : (PYXIE_COLORS.green || '#22c55e'))
      .setTitle(t('expedition.completedTitle', source))
      .setDescription(desc)
      .setFooter({ text: pyxieFooter(t('expedition.btnClaim', source)) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`expedition_claim:${userId}`)
        .setLabel(isDoubled ? (isEn ? '🎁 Claim 2x Rewards' : '🎁 Coletar Dobrado (2x)') : t('expedition.btnClaim', source))
        .setEmoji('🎁')
        .setStyle(ButtonStyle.Success)
    );

    if (!isDoubled) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`expedition_double_link:${userId}`)
          .setLabel(isEn ? '💎 Double 2x (10s)' : '💎 Dobro 2x (10s)')
          .setEmoji('💎')
          .setStyle(ButtonStyle.Primary)
      );
    }

    return { embeds: [embed], components: [row] };
  }

  // 2. Expedição em andamento
  if (exp && !exp.completed) {
    const desc = t('expedition.inProgressDesc', source, {
      pet: `${exp.petEmoji} ${exp.petName}`,
      remaining: formatRemaining(exp.remainingMs, source),
      hours: exp.durationHours,
    });

    const embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.violet || '#8b5cf6')
      .setTitle(t('expedition.inProgressTitle', source))
      .setDescription(desc)
      .setFooter({ text: pyxieFooter('Pyxie Expedition') })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`expedition_refresh:${userId}`)
        .setLabel(t('expedition.btnRefresh', source))
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row] };
  }

  // 3. Nenhuma expedição ativa (Menu para escolher duração)
  const desc = t('expedition.availableDesc', source, {
    pet: `${activePet.emoji} ${activePet.name}`,
  });

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold || '#facc15')
    .setTitle(t('expedition.availableTitle', source))
    .setDescription(desc)
    .setFooter({ text: pyxieFooter('Pyxie Expedition') })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`expedition_start:${userId}:2`)
      .setLabel(t('expedition.btn2h', source))
      .setEmoji('🟢')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`expedition_start:${userId}:4`)
      .setLabel(t('expedition.btn4h', source))
      .setEmoji('🟡')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`expedition_start:${userId}:8`)
      .setLabel(t('expedition.btn8h', source))
      .setEmoji('🟣')
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

function isExpeditionInteraction(interaction) {
  return typeof interaction.customId === 'string' && (
    interaction.customId.startsWith('expedition_start:') ||
    interaction.customId.startsWith('expedition_claim:') ||
    interaction.customId.startsWith('expedition_double_link:') ||
    interaction.customId.startsWith('expedition_refresh:')
  );
}

async function handleExpeditionInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[0];
  const targetId = parts[1];
  const hours = Number(parts[2]) || 2;

  if (interaction.user.id !== targetId) {
    return interaction.reply({
      content: t('expedition.onlyOwner', interaction),
      flags: 64,
    });
  }

  if (action === 'expedition_refresh') {
    const view = buildExpeditionView(targetId, interaction);
    return interaction.update(view);
  }

  if (action === 'expedition_double_link') {
    const { createBonusSession } = require('../services/bonusTimer');
    const lang = getLanguage(interaction);
    const session = createBonusSession(targetId, 'expedition_double', {}, lang);
    const isEn = lang === 'en';

    const doubleEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.gold || '#facc15')
      .setTitle(isEn ? '💎  ✦  Double Expedition Rewards (2x)' : '💎  ✦  Dobrar Recompensas da Expedição (2x)')
      .setDescription(
        isEn
          ? 'Want **2x XP**, **2x Coins**, and doubled item drops?\n\n' +
            '1️⃣ Click the **💎 Double Rewards (10s)** button below.\n' +
            '2️⃣ Wait **10 seconds** on the magic page.\n' +
            '3️⃣ Return here and click **Claim** to collect your doubled loot!'
          : 'Quer receber **o dobro de XP**, **o dobro de Moedas** e drops duplicados?\n\n' +
            '1️⃣ Clique no botão **💎 Dobrar Recompensas (10s)** abaixo.\n' +
            '2️⃣ Aguarde a barra de **10 segundos** carregar na página mágica.\n' +
            '3️⃣ Retorne aqui e clique em **Coletar Dobrado (2x)**!'
      )
      .setFooter({ text: pyxieFooter('Pyxie Expedition') })
      .setTimestamp();

    const linkRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(isEn ? '💎 Double Rewards (10s)' : '💎 Dobrar Recompensas (10s)')
        .setStyle(ButtonStyle.Link)
        .setURL(session.url)
    );

    return interaction.reply({
      embeds: [doubleEmbed],
      components: [linkRow],
      flags: 64,
    });
  }

  if (action === 'expedition_start') {
    const result = startExpedition(targetId, hours);
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, flags: 64 });
    }
    const view = buildExpeditionView(targetId, interaction);
    return interaction.update(view);
  }

  if (action === 'expedition_claim') {
    const result = claimExpedition(targetId);
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, flags: 64 });
    }

    const isEn = getLanguage(interaction) === 'en';
    const itemsText = result.itemsGained.length > 0
      ? result.itemsGained.map((i) => `> 📦 **${i}**`).join('\n')
      : (isEn ? '> 📦 *No special items found this time.*' : '> 📦 *Nenhum item especial encontrado desta vez.*');

    const rewardsHeader = isEn ? '🎁 **CLAIMED REWARDS:**' : '🎁 **RECOMPENSAS RESGATADAS:**';
    const xpLine = isEn ? `> ⭐ **+${result.xpGained} XP** for your Pymon` : `> ⭐ **+${result.xpGained} XP** para seu Pymon`;
    const coinsLine = isEn ? `> 💰 **+${formatCoins(result.coinsGained, interaction)}** added to your wallet` : `> 💰 **+${formatCoins(result.coinsGained, interaction)}** adicionadas à sua carteira`;
    const beanLine = result.magicBeansGained > 0
      ? (isEn ? '> ✨ **+1x Magic Bean 🌱** (Epic Luck!)' : '> ✨ **+1x Feijão Mágico 🌱** (Sorte Épica!)')
      : '';
    const itemsHeader = isEn ? '📦 **COLLECTED ITEMS:**' : '📦 **ITENS COLETADOS:**';
    const heroLine = isEn
      ? `🎉 **${result.petEmoji} ${result.petName}** bravely completed the mission!`
      : `🎉 **${result.petEmoji} ${result.petName}** concluiu sua missão com bravura!`;

    const desc = [
      heroLine,
      '',
      rewardsHeader,
      xpLine,
      coinsLine,
      beanLine,
      '',
      itemsHeader,
      itemsText,
    ].filter(Boolean).join('\n');

    const embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.gold || '#facc15')
      .setTitle(isEn ? '🎉  ✦  Expedition Rewards Collected!' : '🎉  ✦  Recompensas de Expedição Coletadas!')
      .setDescription(desc)
      .setFooter({ text: pyxieFooter(isEn ? 'Your Pymon is rested and ready for another run!' : 'Seu Pymon já está descansado e pronto para outra!') })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`expedition_refresh:${targetId}`)
        .setLabel(t('expedition.availableTitle', interaction))
        .setEmoji('🧭')
        .setStyle(ButtonStyle.Primary)
    );

    return interaction.update({ embeds: [embed], components: [row] });
  }
}

module.exports = {
  name: EXPEDITION,
  aliases: ['expedition', 'expedicao', 'py-expedicao', 'py-expedition', 'afk', 'exploracaoafk'],
  buildExpeditionView,
  isExpeditionInteraction,
  handleExpeditionInteraction,
  data: new SlashCommandBuilder()
    .setName(EXPEDITION)
    .setDescription('Send your Pymon on an AFK expedition for 2h, 4h, or 8h.')
    .setDescriptionLocalizations({
      'pt-BR': 'Envia seu Pymon em uma expedição passiva (AFK) de 2h, 4h ou 8h para coletar recursos.',
    })
    .addIntegerOption((opt) =>
      opt
        .setName('duracao')
        .setNameLocalizations({
          'en-US': 'duration',
          'en-GB': 'duration',
          'pt-BR': 'duracao',
        })
        .setDescription('Expedition duration in hours')
        .setDescriptionLocalizations({
          'pt-BR': 'Duração da expedição em horas',
        })
        .setRequired(false)
        .addChoices(
          { name: '🟢 2 Hours', nameLocalizations: { 'pt-BR': '🟢 2 Horas' }, value: 2 },
          { name: '🟡 4 Hours', nameLocalizations: { 'pt-BR': '🟡 4 Horas' }, value: 4 },
          { name: '🟣 8 Hours', nameLocalizations: { 'pt-BR': '🟣 8 Horas' }, value: 8 }
        )
    ),
  async executeSlash({ interaction }) {
    const dur = interaction.options.getInteger('duracao') || interaction.options.getInteger('duration');
    if (dur) {
      const startRes = startExpedition(interaction.user.id, dur);
      if (!startRes.success) {
        return interaction.editReply({ content: `❌ ${startRes.message}` });
      }
    }
    const view = buildExpeditionView(interaction.user.id, interaction);
    await interaction.editReply(view);
  },
  async executePrefix({ message, args }) {
    const dur = Number(args[0]);
    if ([2, 4, 8].includes(dur)) {
      const startRes = startExpedition(message.author.id, dur);
      if (!startRes.success) {
        return message.reply(`❌ ${startRes.message}`);
      }
    }
    const view = buildExpeditionView(message.author.id, message);
    await message.reply(view);
  },
};
