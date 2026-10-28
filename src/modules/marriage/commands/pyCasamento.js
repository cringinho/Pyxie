const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { getBalance, spendCoins, getMagicBeans } = require('../../../services/economy');
const {
  MARRIAGE_COST,
  TREE_COST_BEANS,
  hasSharedHome,
  getMarriage,
  getSpouseId,
  createMarriageProposal,
  resolveMarriageProposal,
  cancelMarriageProposal,
  unlockSharedFeature,
  cultivateTree,
  depositVault,
  claimVaultInterest,
  estimateVaultYield,
  VAULT_DAILY_CAP,
  canStartDateNight,
  getRandomDateQuestion,
  sanitizeDateQuestionText,
  resolveDateNight,
  canHaveChild,
  addChild,
} = require('../marriageManager');
const { playChildBirthAnimation } = require('../marriageAnimations');
const bondViews = require('../bondViews');
const coupleBond = require('../coupleBond');
const { formatCoins, getLanguage, t } = require('../../../utils/i18n');
const { MARRIAGE } = require('../../../commands/commandNames');

const name = MARRIAGE || 'py-marriage';

function getTargetUser(source) {
  return (
    source.options?.getUser('user') ||
    source.options?.getUser('usuario') ||
    source.mentions?.users?.first()
  );
}

function buildLoveProgressBar(percentage) {
  const totalBars = 10;
  const clamped = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const filled = Math.round((clamped / 100) * totalBars);
  const empty = totalBars - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] **${clamped}%**`;
}

// 1. Proposta de Casamento
async function handlePropose(source, reply) {
  const requester = source.user || source.author;
  const target = getTargetUser(source);

  if (!target) return reply(t('marriage.noTarget', source));
  if (target.bot) return reply(t('marriage.botMarriage', source));
  if (target.id === requester.id) return reply(t('marriage.selfMarriage', source));
  if (getSpouseId(requester.id) || getSpouseId(target.id)) {
    return reply(t('marriage.alreadyMarried', source));
  }

  if (getBalance(requester.id) < MARRIAGE_COST) {
    return reply(t('marriage.insufficientCoins', source, { cost: formatCoins(MARRIAGE_COST, source) }));
  }

  const proposal = createMarriageProposal(requester.id, target.id, source.guild?.id);
  if (!proposal.created) {
    if (proposal.reason === 'married') return reply(t('marriage.alreadyMarried', source));
    if (proposal.reason === 'pending') return reply(t('marriage.pendingProposal', source));
    return reply(t('marriage.expired', source));
  }

  const payment = spendCoins(requester.id, MARRIAGE_COST);
  if (!payment.spent) {
    cancelMarriageProposal(proposal.id, requester.id);
    return reply(t('marriage.insufficientCoins', source, { cost: formatCoins(MARRIAGE_COST, source) }));
  }

  const embed = new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(t('marriage.proposeTitle', source))
    .setDescription(
      t('marriage.proposeDesc', source, {
        target: target.toString(),
        requester: requester.displayName || requester.username,
        cost: formatCoins(MARRIAGE_COST, source),
      })
    )
    .setThumbnail(requester.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`marr:aceitar:${proposal.id}`)
      .setLabel(t('marriage.btnAccept', source))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`marr:recusar:${proposal.id}`)
      .setLabel(t('marriage.btnReject', source))
      .setStyle(ButtonStyle.Secondary)
  );

  return reply({ embeds: [embed], components: [row] });
}

// 2. Status do Casamento
async function handleStatus(source, reply) {
  const user = source.user || source.author;
  const marriage = getMarriage(user.id);
  if (!marriage) return reply(t('marriage.notMarried', source));

  const spouseId = marriage.spouses.find((id) => id !== user.id);
  const spouseMention = spouseId ? `<@${spouseId}>` : '???';
  const userMention = `<@${user.id}>`;

  const loveBarDisplay = buildLoveProgressBar(marriage.loveBar);
  const treeStatus = marriage.treeOfLife?.unlocked
    ? t('marriage.treeUnlockedLabel', source)
    : t('marriage.treeLockedLabel', source);

  const together = hasSharedHome(marriage);
  const houseStatus = together ? t('marriage.houseTogether', source) : t('marriage.houseApart', source);

  const vaultBalance = marriage.house?.vaultBalance || 0;
  const estYield = estimateVaultYield(vaultBalance, marriage.loveBar);
  const vaultText = together
    ? `${formatCoins(vaultBalance, source)} (${t('marriage.vaultEstYield', source, { yield: formatCoins(estYield, source) })})`
    : t('marriage.houseRequiredForVault', source);

  const childrenCount = (marriage.children || []).length;
  const bondStatus = coupleBond.getBondStatus(user.id);
  const lang = getLanguage(source);

  const embed = new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(t('marriage.statusTitle', source))
    .setDescription(
      t('marriage.statusDesc', source, {
        userA: userMention,
        userB: spouseMention,
      })
    )
    .addFields(
      {
        name: t('marriage.fieldLoveBar', source),
        value: loveBarDisplay,
        inline: false,
      },
      {
        name: t('bond.fieldName', source),
        value: bondStatus
          ? t('bond.fieldValue', source, { level: bondStatus.level, name: bondStatus.levelName[lang === 'en' ? 'en' : 'pt'], streak: bondStatus.streak })
          : '-',
        inline: false,
      },
      {
        name: t('marriage.fieldTree', source),
        value: treeStatus,
        inline: true,
      },
      {
        name: t('marriage.fieldHouse', source),
        value: houseStatus,
        inline: true,
      },
      {
        name: t('marriage.fieldVault', source),
        value: vaultText,
        inline: false,
      },
      {
        name: t('marriage.fieldChildren', source),
        value: `${childrenCount}/5`,
        inline: true,
      }
    )
    .setFooter({ text: t('bond.statusFooter', source) })
    .setTimestamp();

  return reply({ embeds: [embed], components: [bondViews.bondButtonRow(user.id, lang)] });
}

// 3. Árvore da Vida
async function handleTree(source, action, reply) {
  const user = source.user || source.author;
  const marriage = getMarriage(user.id);
  if (!marriage) return reply(t('marriage.notMarried', source));

  const sub = (action || '').toLowerCase();

  // Comprar / Desbloquear Árvore
  if (sub === 'comprar' || sub === 'buy' || (!marriage.treeOfLife?.unlocked && sub !== 'cultivar' && sub !== 'water')) {
    if (marriage.treeOfLife?.unlocked) {
      return reply(t('marriage.treeAlreadyUnlocked', source));
    }
    const result = unlockSharedFeature(marriage.id, 'treeOfLife', user.id, 0, TREE_COST_BEANS);
    if (!result.success) {
      if (result.reason === 'insufficient_beans') {
        return reply(t('marriage.treeNeedBean', source));
      }
      return reply(t('marriage.genericError', source));
    }
    return reply(t('marriage.treeUnlockedSuccess', source));
  }

  // Cultivar / Regar Árvore
  const cultResult = cultivateTree(user.id);
  if (!cultResult.success) {
    if (cultResult.reason === 'locked') {
      return reply(t('marriage.treeLockedNeedBean', source));
    }
    if (cultResult.reason === 'cooldown') {
      const timeTag = `<t:${Math.floor(cultResult.nextAvailable / 1000)}:R>`;
      return reply(t('marriage.treeCooldown', source, { time: timeTag }));
    }
    return reply(t('marriage.genericError', source));
  }

  const loveBarDisplay = buildLoveProgressBar(cultResult.newLove);
  return reply(
    t('marriage.treeCultivatedSuccess', source, {
      loveBar: loveBarDisplay,
    })
  );
}

// 4. Casa do casal: agora é a Casinha (/py-home), onde quem tem casa chama o cônjuge para morar junto
async function handleHouse(source, reply) {
  const user = source.user || source.author;
  const marriage = getMarriage(user.id);
  if (!marriage) return reply(t('marriage.notMarried', source));
  const { HOUSE_PRICE, FREE_HOUSE_FLOOR } = require('../../home/homeStore');
  return reply(t('marriage.houseRedirect', source, { floor: FREE_HOUSE_FLOOR, coins: HOUSE_PRICE.coins, beans: HOUSE_PRICE.beans }));
}

// 5. Cofre do Amor Eterno
async function handleVault(source, action, amount, reply) {
  const user = source.user || source.author;
  const marriage = getMarriage(user.id);
  if (!marriage) return reply(t('marriage.notMarried', source));

  if (!hasSharedHome(marriage)) {
    return reply(t('marriage.vaultRequiresHouse', source));
  }

  const sub = (action || '').toLowerCase();

  // Depositar
  if (sub === 'depositar' || sub === 'deposit') {
    const qty = parseInt(amount, 10);
    if (isNaN(qty) || qty <= 0) {
      return reply(t('marriage.vaultInvalidAmount', source));
    }
    const res = depositVault(user.id, qty);
    if (!res.success) {
      if (res.reason === 'insufficient_coins') {
        return reply(t('marriage.insufficientCoins', source, { cost: formatCoins(qty, source) }));
      }
      return reply(t('marriage.genericError', source));
    }
    return reply(
      t('marriage.vaultDepositSuccess', source, {
        amount: formatCoins(qty, source),
        balance: formatCoins(res.newBalance, source),
      })
    );
  }

  // Resgatar juros diários
  if (sub === 'resgatar' || sub === 'claim') {
    const res = claimVaultInterest(user.id);
    if (!res.success) {
      if (res.reason === 'vault_empty') {
        return reply(t('marriage.vaultEmpty', source));
      }
      if (res.reason === 'cooldown') {
        const timeTag = `<t:${Math.floor(res.nextAvailable / 1000)}:R>`;
        return reply(t('marriage.vaultCooldown', source, { time: timeTag }));
      }
      return reply(t('marriage.genericError', source));
    }
    const claimText = t('marriage.vaultClaimSuccess', source, {
      yield: formatCoins(res.yieldAmount, source),
      rate: res.interestRate,
    });
    return reply(res.capped ? `${claimText}\n\n${t('marriage.vaultCapNote', source, { cap: formatCoins(VAULT_DAILY_CAP, source) })}` : claimText);
  }

  // Mostra resumo do cofre se não especificou ação
  const vaultBal = marriage.house?.vaultBalance || 0;
  const estYield = estimateVaultYield(vaultBal, marriage.loveBar);
  return reply(
    `${t('marriage.vaultSummary', source, {
      balance: formatCoins(vaultBal, source),
      yield: formatCoins(estYield, source),
    })}\n\n${t('marriage.vaultCapNote', source, { cap: formatCoins(VAULT_DAILY_CAP, source) })}`
  );
}

// 6. Carinho diário
async function handleAffection(source, reply) {
  // O carinho agora é o gesto do dia (abraço) da Força do Laço
  const user = source.user || source.author;
  const result = coupleBond.doGesture(user.id, 'hug');
  if (!result.ok && result.reason === 'not_married') return reply(t('marriage.notMarried', source));
  return reply(bondViews.buildBondView({ viewerId: user.id, source, notice: bondViews.gestureNotice(result, getLanguage(source)) }));
}

// Força do Laço: nível, gestos do dia e missão da semana
async function handleBond(source, reply) {
  const user = source.user || source.author;
  if (!getMarriage(user.id)) return reply(t('marriage.notMarried', source));
  return reply(bondViews.buildBondView({ viewerId: user.id, source }));
}

// Armazenamento em memória para sessões ativas de Date Night (Zero Memory Leak)
const activeDateSessions = new Map();

// 7. Date Night
async function handleDateNight(source, reply) {
  const user = source.user || source.author;
  const check = canStartDateNight(user.id);
  if (!check.allowed) {
    if (check.reason === 'not_married') {
      return reply(t('marriage.notMarried', source));
    }
    if (check.reason === 'cooldown') {
      const timeTag = `<t:${Math.floor(check.nextAvailable / 1000)}:R>`;
      return reply(t('marriage.dateCooldown', source, { time: timeTag }));
    }
    return reply(t('marriage.genericError', source));
  }

  const marriage = check.marriage;
  const spouseId = marriage.spouses.find((id) => id !== user.id);
  const lang = getLanguage(source);

  const question = getRandomDateQuestion();
  const qText = sanitizeDateQuestionText(question.question[lang] || question.question.pt);
  const qOptions = question.options[lang] || question.options.pt;

  const letters = ['A', 'B', 'C', 'D', 'E'];
  const optionsFormatted = qOptions
    .map((opt, idx) => `**[${letters[idx] || idx + 1}]** ${opt}`)
    .join('\n');

  const sessionId = `date_${marriage.id}_${Date.now()}`;
  activeDateSessions.set(sessionId, {
    marriageId: marriage.id,
    spouses: [...marriage.spouses],
    questionId: question.id,
    answers: {},
    lang,
    createdAt: Date.now(),
  });

  // Limpeza automática após 60s (Zero Memory Leak & Event Loop Friendly)
  const cleanTimer = setTimeout(() => {
    activeDateSessions.delete(sessionId);
  }, 60000);
  if (cleanTimer.unref) cleanTimer.unref();

  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle(t('marriage.dateSessionTitle', source))
    .setDescription(
      t('marriage.dateSessionDesc', source, {
        userA: `<@${user.id}>`,
        userB: `<@${spouseId}>`,
        question: qText,
        options: optionsFormatted,
      })
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  const row = new ActionRowBuilder();
  qOptions.forEach((_, idx) => {
    const letter = letters[idx] || String.fromCharCode(65 + idx);
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`marr:date_ans:${sessionId}:${idx}`)
        .setLabel(`[${letter}]`)
        .setStyle(ButtonStyle.Primary)
    );
  });

  return reply({ embeds: [embed], components: [row] });
}

// 8. Filiação (Criação de Filho)
async function handleChildProposal(source, reply) {
  const user = source.user || source.author;
  const check = canHaveChild(user.id);
  if (!check.allowed) {
    if (check.reason === 'not_married') {
      return reply(t('marriage.notMarried', source));
    }
    if (check.reason === 'no_house') {
      return reply(t('marriage.childRequiresHouse', source));
    }
    if (check.reason === 'max_children') {
      return reply(t('marriage.childMaxReached', source));
    }
    if (check.reason === 'insufficient_coins') {
      return reply(t('marriage.childNeedCoins', source, { cost: formatCoins(check.cost, source) }));
    }
    return reply(t('marriage.genericError', source));
  }

  const marriage = check.marriage;
  const spouseId = marriage.spouses.find((id) => id !== user.id);
  const cost = check.cost;

  const embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle(t('marriage.childProposalTitle', source))
    .setDescription(
      t('marriage.childProposalDesc', source, {
        proposer: `<@${user.id}>`,
        spouse: `<@${spouseId}>`,
        cost: cost === 0 ? t('marriage.childCostFree', source) : formatCoins(cost, source),
      })
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`marr:filho_aceitar:${marriage.id}:${user.id}`)
      .setLabel(t('marriage.btnAccept', source))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`marr:filho_recusar:${marriage.id}:${user.id}`)
      .setLabel(t('marriage.btnReject', source))
      .setStyle(ButtonStyle.Secondary)
  );

  return reply({ embeds: [embed], components: [row] });
}

module.exports = {
  name,
  aliases: [
    'marriage',
    'marry',
    'casamento',
    'py-casamento',
    'py-marriage',
    'py-marry',
    'casar',
    'propose',
  ],
  MARRIAGE_COST,
  activeDateSessions,
  handlers: { handlePropose, handleStatus, handleTree, handleHouse, handleVault, handleDateNight, handleAffection, handleChildProposal, handleBond },

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Full Marriage, Romance, Family & Tree of Life system.')
    .setDescriptionLocalizations({
      'pt-BR': 'Sistema completo de Matrimônio, Romance, Família e Árvore da Vida.',
    }),

  async executePrefix({ message, args = [] }) {
    const sub = (args[0] || '').toLowerCase();

    // py!casamento @user -> proposta direta
    if (message.mentions.users.size > 0 && !['status', 'arvore', 'casa', 'cofre', 'date', 'carinho', 'filho', 'laco', 'laço', 'bond'].includes(sub)) {
      return handlePropose(message, (c) => message.reply(c));
    }

    if (sub === 'status') return handleStatus(message, (c) => message.reply(c));
    if (sub === 'arvore' || sub === 'tree') {
      return handleTree(message, args[1] || 'cultivar', (c) => message.reply(c));
    }
    if (sub === 'casa' || sub === 'house') return handleHouse(message, (c) => message.reply(c));
    if (sub === 'cofre' || sub === 'vault') {
      return handleVault(message, args[1] || 'resgatar', args[2], (c) => message.reply(c));
    }
    if (sub === 'date') return handleDateNight(message, (c) => message.reply(c));
    if (sub === 'carinho' || sub === 'hug' || sub === 'affection') {
      return handleAffection(message, (c) => message.reply(c));
    }
    if (sub === 'filho' || sub === 'child') return handleChildProposal(message, (c) => message.reply(c));
    if (sub === 'laco' || sub === 'laço' || sub === 'bond') return handleBond(message, (c) => message.reply(c));

    // Padrão: painel com botões para tudo do casamento.
    return message.reply(require('../hubViews').buildHub(message));
  },

  // Um comando só: abre o painel com botões (os subcomandos antigos viraram botões).
  async executeSlash({ interaction }) {
    return interaction.editReply(require('../hubViews').buildHub(interaction));
  },
};
