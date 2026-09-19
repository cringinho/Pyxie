const path = require('node:path');
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { EXPLORE } = require('./commandNames');
const {
  LOCATIONS,
  SPIRITS,
  gloomGraph,
  getGloomTide,
  getGloomUser,
  forage,
  negotiateSpirit,
  leaveTrace,
  getTraces,
  getBossStatus,
  attackBoss,
} = require('../services/gloomRealm');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

function buildLocationView(userId, guildId, source = null, feedbackMessage = '') {
  const user = getGloomUser(userId);
  const location = gloomGraph.getLocation(user.currentLocation);
  const tide = getGloomTide();
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const imagePath = path.join(__dirname, '..', '..', 'assets', 'locations', location.image);
  const attachment = new AttachmentBuilder(imagePath, { name: location.image });

  const locationName = isEn ? location.name.en : location.name.pt;
  const locationDesc = isEn ? location.desc.en : location.desc.pt;
  const tideName = isEn ? tide.name.en : tide.name.pt;

  const traces = getTraces(guildId, location.id);
  const tracesText = traces.length > 0
    ? traces.map((tr) => {
        const offeringStr = tr.offering > 0 ? t('gloom.explore.offeringText', source, { coins: tr.offering }) : '';
        return t('gloom.explore.traceItem', source, {
          author: tr.authorName,
          message: tr.message,
          offering: offeringStr,
        });
      }).join('\n')
    : t('gloom.explore.noTraces', source);

  const embed = new EmbedBuilder()
    .setColor(tide.color || PYXIE_COLORS.purple)
    .setTitle(t('gloom.explore.title', source, { emoji: '🌙', name: locationName, tide: tideName }))
    .setDescription(
      `${feedbackMessage ? `**${feedbackMessage}**\n\n` : ''}` +
      `*« ${locationDesc} »*\n\n` +
      `${t('gloom.explore.stamina', source, { current: user.energy, max: 10 })}\n` +
      `${t('gloom.explore.phantomCoins', source, { coins: user.phantomCoins })}\n` +
      `🌊 **${isEn ? 'Gloom Tide:' : 'Maré da Penumbra:'}** \`${tideName}\`\n\n` +
      `${t('gloom.explore.tracesHeader', source)}\n${tracesText}`
    )
    .setImage(`attachment://${location.image}`)
    .setFooter({ text: isEn ? "Pyxie's Grove • Pyxie" : 'Bosque da Pyxie • Pyxie' })
    .setTimestamp();

  // Linha 1: Ações Principais
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:forage:${userId}`)
      .setLabel(t('gloom.explore.btnForage', source, { cost: 1 }))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(user.energy <= 0),
    new ButtonBuilder()
      .setCustomId(`gloom:grimoire:${userId}`)
      .setLabel(t('gloom.explore.btnGrimoire', source, { count: (user.grimoire || []).length }))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`gloom:trace_prompt:${userId}`)
      .setLabel(t('gloom.explore.btnTrace', source))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(user.phantomCoins < 15),
    new ButtonBuilder()
      .setCustomId(`gloom:boss:${userId}`)
      .setLabel(t('gloom.explore.btnBoss', source))
      .setStyle(ButtonStyle.Danger)
  );

  // Linha 2: Botões Direcionais de Navegação
  const neighbors = gloomGraph.getAvailableNeighbors(location.id, user, tide);
  const navButtons = neighbors.slice(0, 5).map((n) => {
    const destName = isEn ? n.location.name.en : n.location.name.pt;
    const btn = new ButtonBuilder()
      .setCustomId(`gloom:move:${userId}:${n.location.id}`)
      .setLabel(destName.slice(0, 30))
      .setStyle(n.canEnter ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(!n.canEnter);

    if (!n.canEnter) {
      btn.setEmoji('🔒');
    } else {
      btn.setEmoji('🚶');
    }
    return btn;
  });

  const components = [actionRow];
  if (navButtons.length > 0) {
    components.push(new ActionRowBuilder().addComponents(navButtons));
  }

  return { embeds: [embed], files: [attachment], components };
}

function buildNegotiationView(userId, spirit, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const spiritName = isEn ? spirit.name.en : spirit.name.pt;
  const question = isEn ? spirit.dialogue.question.en : spirit.dialogue.question.pt;
  const user = getGloomUser(userId);

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.neonPink)
    .setTitle(t('gloom.negotiate.title', source, { name: spiritName }))
    .setDescription(
      `> 💬 **"${question}"**\n\n` +
      `🪙 ${t('gloom.explore.phantomCoins', source, { coins: user.phantomCoins })}`
    )
    .setFooter({ text: isEn ? 'Atlus Spirit Negotiation • Pyxie' : 'Negociação de Almas • Pyxie' })
    .setTimestamp();

  // Botões com as escolhas de diálogo
  const choiceButtons = spirit.dialogue.choices.map((c) => {
    const label = isEn ? c.label.en : c.label.pt;
    return new ButtonBuilder()
      .setCustomId(`gloom:choice:${userId}:${spirit.id}:${c.id}`)
      .setLabel(label.slice(0, 80))
      .setStyle(ButtonStyle.Primary);
  });

  const row1 = new ActionRowBuilder().addComponents(choiceButtons.slice(0, 3));

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:bribe:${userId}:${spirit.id}`)
      .setLabel(t('gloom.negotiate.btnBribe', source, { cost: spirit.dialogue.bribeCost }))
      .setStyle(ButtonStyle.Success)
      .setDisabled(user.phantomCoins < spirit.dialogue.bribeCost),
    new ButtonBuilder()
      .setCustomId(`gloom:flee:${userId}`)
      .setLabel(t('gloom.negotiate.btnFlee', source))
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row1, row2] };
}

function buildBossView(userId, source = null, feedbackMessage = '') {
  const boss = getBossStatus();
  const user = getGloomUser(userId);
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const bossName = isEn ? boss.name.en : boss.name.pt;
  const percent = Math.max(0, Math.round((boss.currentHp / boss.maxHp) * 100));

  const participant = boss.participants?.[userId] || { count: 0, extraUnlocked: false, damageDealt: 0 };
  const canFreeAttack = participant.count === 0 || participant.extraUnlocked;

  const embed = new EmbedBuilder()
    .setColor('#ef4444')
    .setTitle(t('gloom.boss.title', source, { name: bossName }))
    .setDescription(
      `${feedbackMessage ? `**${feedbackMessage}**\n\n` : ''}` +
      `${t('gloom.boss.desc', source)}\n\n` +
      `${t('gloom.boss.hpBar', source, { currentHp: boss.currentHp, maxHp: boss.maxHp, percent })}\n\n` +
      `🛡️ **${isEn ? 'Your Damage Dealt:' : 'Seu Dano Total:'}** \`${participant.damageDealt}\`\n` +
      `🪙 ${t('gloom.explore.phantomCoins', source, { coins: user.phantomCoins })}`
    )
    .setFooter({ text: isEn ? 'Community World Boss • Pyxie' : 'Chefão Comunitário • Pyxie' })
    .setTimestamp();

  const buttons = [];

  if (canFreeAttack) {
    const attackLabel = participant.extraUnlocked
      ? t('gloom.boss.btnAttackExtra', source)
      : t('gloom.boss.btnAttack', source);
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`gloom:boss_attack:${userId}`)
        .setLabel(attackLabel)
        .setStyle(ButtonStyle.Danger)
    );
  } else {
    // Botão web de 10s via bonusTimer + Botão de atualizar após assistir
    const { createBonusSession } = require('../services/bonusTimer');
    const session = createBonusSession(userId, 'gloom_boss', {}, lang);
    buttons.push(
      new ButtonBuilder()
        .setLabel(t('gloom.boss.btnWebBonus', source))
        .setStyle(ButtonStyle.Link)
        .setURL(session.url),
      new ButtonBuilder()
        .setCustomId(`gloom:boss_refresh:${userId}`)
        .setLabel(t('gloom.boss.btnRefresh', source))
        .setStyle(ButtonStyle.Success)
    );
  }

  buttons.push(
    new ButtonBuilder()
      .setCustomId(`gloom:view:${userId}`)
      .setLabel(t('gloom.grimoire.btnBack', source))
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(buttons)] };
}

function isGloomInteraction(interaction) {
  return typeof interaction.customId === 'string' && interaction.customId.startsWith('gloom:');
}

async function handleGloomInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[1];
  const targetUserId = parts[2];
  const lang = getLanguage(interaction);
  const isEn = lang === 'en';

  if (targetUserId && interaction.user.id !== targetUserId) {
    return interaction.reply({
      content: t('common.onlyOwner', interaction),
      ephemeral: true,
    });
  }

  const guildId = interaction.guildId || 'global';

  // 1. Forrageamento
  if (action === 'forage') {
    const user = getGloomUser(interaction.user.id);
    const result = forage(interaction.user.id, user.currentLocation);

    if (!result.success) {
      return interaction.reply({
        content: t('gloom.explore.forageNoEnergy', interaction, { time: result.timeRemainingSec }),
        ephemeral: true,
      });
    }

    if (result.encounteredSpirit) {
      await interaction.deferUpdate();
      const negView = buildNegotiationView(interaction.user.id, result.encounteredSpirit, interaction);
      return interaction.editReply(negView);
    }

    let feedback = '';
    if (result.rewardCoins > 0) {
      feedback = t('gloom.explore.forageSuccessCoins', interaction, { coins: result.rewardCoins });
    } else if (result.rewardItem) {
      const itemName = isEn ? result.rewardItem.name.en : result.rewardItem.name.pt;
      feedback = t('gloom.explore.forageSuccessItem', interaction, { item: itemName });
    }

    if (result.openedRarePortal) {
      feedback += `\n${t('gloom.explore.portalOpened', interaction)}`;
    }

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, feedback);
    return interaction.editReply(locView);
  }

  // 2. Movimentação entre nós
  if (action === 'move') {
    const destId = parts[3];
    const user = getGloomUser(interaction.user.id);
    const tide = getGloomTide();
    const neighbors = gloomGraph.getAvailableNeighbors(user.currentLocation, user, tide);
    const targetNeighbor = neighbors.find((n) => n.location.id === destId);

    if (!targetNeighbor || !targetNeighbor.canEnter) {
      const reasonKey = targetNeighbor?.reason || 'locked_tide';
      const reasonText = t(`gloom.explore.reasons.${reasonKey}`, interaction) || 'Bloqueado.';
      return interaction.reply({
        content: t('gloom.explore.travelLocked', interaction, { reason: reasonText }),
        ephemeral: true,
      });
    }

    user.currentLocation = destId;
    user.visitedLocations = user.visitedLocations || [];
    if (!user.visitedLocations.includes(destId)) {
      user.visitedLocations.push(destId);
    }
    user.temporaryPortalOpen = false; // Fecha portal após travessia

    const { updateGloomUser } = require('../services/gloomRealm');
    updateGloomUser(interaction.user.id, user);

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction);
    return interaction.editReply(locView);
  }

  // 3. Escolha de Diálogo na Negociação
  if (action === 'choice') {
    const spiritId = parts[3];
    const choiceId = parts[4];
    const result = negotiateSpirit(interaction.user.id, spiritId, choiceId, false);
    const spiritName = isEn ? result.spirit.name.en : result.spirit.name.pt;

    let text = '';
    if (result.recruited) {
      text = t('gloom.negotiate.successWit', interaction, { spirit: spiritName, coins: result.rewardCoins });
    } else {
      text = t('gloom.negotiate.failed', interaction, { spirit: spiritName });
    }

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, text);
    return interaction.editReply(locView);
  }

  // 4. Suborno de Espírito
  if (action === 'bribe') {
    const spiritId = parts[3];
    const result = negotiateSpirit(interaction.user.id, spiritId, null, true);
    const spiritName = isEn ? result.spirit.name.en : result.spirit.name.pt;

    let text = '';
    if (result.success) {
      text = t('gloom.negotiate.successBribe', interaction, { spirit: spiritName, cost: result.spirit.dialogue.bribeCost });
    } else {
      text = `❌ Saldo insuficiente! Requer ${result.cost} Phantom Coins 👻.`;
    }

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, text);
    return interaction.editReply(locView);
  }

  // 5. Fugir da negociação
  if (action === 'flee') {
    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, isEn ? '🏃 You slipped away into the shadows.' : '🏃 Você se esgueirou de volta pelas sombras.');
    return interaction.editReply(locView);
  }

  // 6. Voltar à visualização da localização
  if (action === 'view') {
    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction);
    return interaction.editReply(locView);
  }

  // 7. Abertura do Grimório a partir da exploração
  if (action === 'grimoire') {
    const { buildGrimoireView } = require('./grimorio');
    await interaction.deferUpdate();
    const grimView = buildGrimoireView(interaction.user.id, interaction);
    return interaction.editReply(grimView);
  }

  // 8. Visualização / Atualização do Boss
  if (action === 'boss' || action === 'boss_refresh') {
    await interaction.deferUpdate();
    const bossView = buildBossView(interaction.user.id, interaction);
    return interaction.editReply(bossView);
  }

  // 9. Investida contra o Boss
  if (action === 'boss_attack') {
    const result = attackBoss(interaction.user.id, 'strike', lang);
    let feedback = '';

    if (!result.success) {
      feedback = t('gloom.boss.cooldown', interaction);
    } else {
      feedback = t('gloom.boss.attackSuccess', interaction, { damage: result.damage, coins: result.rewardCoins });
      if (result.defeated) {
        feedback += `\n\n${t('gloom.boss.defeated', interaction)}`;
      }
    }

    await interaction.deferUpdate();
    const bossView = buildBossView(interaction.user.id, interaction, feedback);
    return interaction.editReply(bossView);
  }

  // 10. Modal de Rastro de Giz Roxo
  if (action === 'trace_prompt') {
    const modal = new ModalBuilder()
      .setCustomId(`gloom:trace_submit:${interaction.user.id}`)
      .setTitle(isEn ? 'Etch Purple Chalk Trace' : 'Gravar Rastro de Giz Roxo');

    const msgInput = new TextInputBuilder()
      .setCustomId('trace_message')
      .setLabel(isEn ? 'Melancholic Message or Tip' : 'Mensagem Melancólica ou Dica')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(120)
      .setRequired(true)
      .setPlaceholder(isEn ? 'Whisper something to future explorers...' : 'Deixe um aviso ou reflexão para os próximos viajantes...');

    const offerInput = new TextInputBuilder()
      .setCustomId('trace_offering')
      .setLabel(isEn ? 'Phantom Coins Offering (Optional)' : 'Oferenda em Phantom Coins (Opcional)')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)
      .setRequired(false)
      .setPlaceholder('0');

    modal.addComponents(
      new ActionRowBuilder().addComponents(msgInput),
      new ActionRowBuilder().addComponents(offerInput)
    );

    return interaction.showModal(modal);
  }

  // 11. Submissão do Modal de Rastro
  if (action === 'trace_submit') {
    const messageText = interaction.fields.getTextInputValue('trace_message');
    const offeringVal = Number(interaction.fields.getTextInputValue('trace_offering')) || 0;
    const user = getGloomUser(interaction.user.id);

    const result = leaveTrace(
      guildId,
      user.currentLocation,
      interaction.user.id,
      interaction.user.displayName || interaction.user.username,
      messageText,
      offeringVal
    );

    await interaction.deferUpdate();
    const feedback = result.success
      ? t('gloom.explore.traceSuccess', interaction)
      : `❌ Phantom Coins insuficientes! Requer ${result.cost} 👻.`;

    const locView = buildLocationView(interaction.user.id, guildId, interaction, feedback);
    return interaction.editReply(locView);
  }

  // 12. Equipar / Desequipar Familiar
  if (action === 'equip') {
    const spiritId = parts[3];
    const { equipFamiliar } = require('../services/gloomRealm');
    const { buildGrimoireView } = require('./grimorio');
    const res = equipFamiliar(interaction.user.id, spiritId);
    const spName = isEn ? res.spirit?.name?.en : res.spirit?.name?.pt;

    let feedback = '';
    if (res.action === 'equipped') {
      const aName = isEn ? res.spirit?.aura?.name?.en : res.spirit?.aura?.name?.pt;
      const aDesc = isEn ? res.spirit?.aura?.desc?.en : res.spirit?.aura?.desc?.pt;
      feedback = t('gloom.grimoire.equipSuccess', interaction, { spirit: spName, aura: aName, desc: aDesc });
    } else {
      feedback = t('gloom.grimoire.unequipSuccess', interaction, { spirit: spName });
    }

    await interaction.deferUpdate();
    const grimView = buildGrimoireView(interaction.user.id, interaction, feedback);
    return interaction.editReply(grimView);
  }

  // 13. Menu de Fusão
  if (action === 'fusion_menu') {
    const { buildFusionMenuView } = require('./grimorio');
    await interaction.deferUpdate();
    const fuseView = buildFusionMenuView(interaction.user.id, interaction);
    return interaction.editReply(fuseView);
  }

  // 14. Executar Fusão via Select Menu
  if (action === 'select_fuse') {
    const [spiritA, spiritB] = interaction.values || [];
    const { fuseSpirits } = require('../services/gloomRealm');
    const { buildGrimoireView } = require('./grimorio');
    const res = fuseSpirits(interaction.user.id, spiritA, spiritB);

    await interaction.deferUpdate();
    let feedback = '';
    if (res.success) {
      const resName = isEn ? res.resultSpirit?.name?.en : res.resultSpirit?.name?.pt;
      feedback = t('gloom.fusion.success', interaction, { spirit: resName, tier: res.resultSpirit?.tier || 3 });
    } else if (res.reason === 'insufficient_coins') {
      feedback = t('gloom.fusion.insufficientCoins', interaction, { cost: res.cost });
    } else {
      feedback = '❌ Não foi possível fundir estes espíritos.';
    }

    const grimView = buildGrimoireView(interaction.user.id, interaction, feedback);
    return interaction.editReply(grimView);
  }
}

module.exports = {
  name: EXPLORE,
  aliases: ['explorar', 'explore', 'gloom', 'py-explorar', 'py-gloom', 'bosque', 'py-bosque'],
  data: new SlashCommandBuilder()
    .setName(EXPLORE)
    .setDescription("Explore the gothic pixel realms of Pyxie's Grove and negotiate with spirits.")
    .setDescriptionLocalizations({
      'pt-BR': 'Explore os cenários pixel góticos do Bosque da Pyxie e negocie com espíritos.',
    }),
  async executeSlash({ interaction }) {
    const guildId = interaction.guildId || 'global';
    const view = buildLocationView(interaction.user.id, guildId, interaction);
    await interaction.editReply(view);
  },
  async executePrefix({ message }) {
    const guildId = message.guildId || 'global';
    const view = buildLocationView(message.author.id, guildId, message);
    await message.reply(view);
  },
  isGloomInteraction,
  handleGloomInteraction,
  buildLocationView,
  buildBossView,
};
