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
  HOUSE_COST_COINS,
  HOUSE_COST_BEANS,
  HOUSE_REQUIRED_LOVE,
  TREE_COST_BEANS,
  getMarriage,
  getSpouseId,
  createMarriageProposal,
  resolveMarriageProposal,
  cancelMarriageProposal,
  unlockSharedFeature,
  cultivateTree,
  giveAffection,
  depositVault,
  claimVaultInterest,
  canStartDateNight,
  getRandomDateQuestion,
  resolveDateNight,
  canHaveChild,
  addChild,
} = require('../marriageManager');
const { playChildBirthAnimation } = require('../marriageAnimations');
const { formatCoins, t } = require('../../../utils/i18n');
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

  const houseStatus = marriage.house?.unlocked
    ? t('marriage.houseUnlockedLabel', source)
    : t('marriage.houseLockedLabel', source);

  const vaultBalance = marriage.house?.vaultBalance || 0;
  const estYield = Math.floor(vaultBalance * ((marriage.loveBar / 100) * 0.05));
  const vaultText = marriage.house?.unlocked
    ? `${formatCoins(vaultBalance, source)} (${t('marriage.vaultEstYield', source, { yield: formatCoins(estYield, source) })})`
    : t('marriage.houseRequiredForVault', source);

  const childrenCount = (marriage.children || []).length;

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
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  return reply({ embeds: [embed] });
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

// 4. Casa Familiar
async function handleHouse(source, reply) {
  const user = source.user || source.author;
  const marriage = getMarriage(user.id);
  if (!marriage) return reply(t('marriage.notMarried', source));

  if (marriage.house?.unlocked) {
    return reply(t('marriage.houseAlreadyUnlocked', source));
  }

  if (marriage.loveBar < HOUSE_REQUIRED_LOVE) {
    return reply(
      t('marriage.houseNeedLove', source, {
        required: HOUSE_REQUIRED_LOVE,
        current: marriage.loveBar,
      })
    );
  }

  if (getBalance(user.id) < HOUSE_COST_COINS) {
    return reply(t('marriage.houseNeedCoins', source, { cost: formatCoins(HOUSE_COST_COINS, source) }));
  }
  if (getMagicBeans(user.id) < HOUSE_COST_BEANS) {
    return reply(t('marriage.houseNeedBeans', source, { cost: HOUSE_COST_BEANS }));
  }

  const result = unlockSharedFeature(marriage.id, 'house', user.id, HOUSE_COST_COINS, HOUSE_COST_BEANS);
  if (!result.success) {
    return reply(t('marriage.genericError', source));
  }

  return reply(t('marriage.houseUnlockedSuccess', source));
}

// 5. Cofre do Amor Eterno
async function handleVault(source, action, amount, reply) {
  const user = source.user || source.author;
  const marriage = getMarriage(user.id);
  if (!marriage) return reply(t('marriage.notMarried', source));

  if (!marriage.house?.unlocked) {
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
    return reply(
      t('marriage.vaultClaimSuccess', source, {
        yield: formatCoins(res.yieldAmount, source),
        rate: res.interestRate,
      })
    );
  }

  // Mostra resumo do cofre se não especificou ação
  const vaultBal = marriage.house?.vaultBalance || 0;
  const estYield = Math.floor(vaultBal * ((marriage.loveBar / 100) * 0.05));
  return reply(
    t('marriage.vaultSummary', source, {
      balance: formatCoins(vaultBal, source),
      yield: formatCoins(estYield, source),
    })
  );
}

// 6. Carinho diário
async function handleAffection(source, reply) {
  const user = source.user || source.author;
  const result = giveAffection(user.id);
  if (!result.success) {
    if (result.reason === 'not_married') {
      return reply(t('marriage.notMarried', source));
    }
    if (result.reason === 'cooldown') {
      const timeTag = `<t:${Math.floor(result.nextAvailable / 1000)}:R>`;
      return reply(t('marriage.affectionCooldown', source, { time: timeTag }));
    }
    return reply(t('marriage.genericError', source));
  }

  const loveBarDisplay = buildLoveProgressBar(result.newLove);
  return reply(
    t('marriage.affectionSuccess', source, {
      loveBar: loveBarDisplay,
    })
  );
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
  const isEn = source.locale?.startsWith('en') || source.guild?.preferredLocale?.startsWith('en');
  const lang = isEn ? 'en' : 'pt';

  const question = getRandomDateQuestion();
  const qText = question.question[lang] || question.question.pt;
  const qOptions = question.options[lang] || question.options.pt;

  const sessionId = `date_${marriage.id}_${Date.now()}`;
  activeDateSessions.set(sessionId, {
    marriageId: marriage.id,
    spouses: [...marriage.spouses],
    questionId: question.id,
    answers: {},
    lang,
    createdAt: Date.now(),
  });

  // Limpeza automática após 60s
  setTimeout(() => {
    activeDateSessions.delete(sessionId);
  }, 60000);

  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle(t('marriage.dateSessionTitle', source))
    .setDescription(
      t('marriage.dateSessionDesc', source, {
        userA: `<@${user.id}>`,
        userB: `<@${spouseId}>`,
        question: qText,
      })
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  const row = new ActionRowBuilder();
  qOptions.forEach((opt, idx) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`marr:date_ans:${sessionId}:${idx}`)
        .setLabel(opt.length > 80 ? opt.substring(0, 77) + '...' : opt)
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

  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Full Marriage, Romance, Family & Tree of Life system.')
    .setDescriptionLocalizations({
      'pt-BR': 'Sistema completo de Matrimônio, Romance, Família e Árvore da Vida.',
    })
    .addSubcommand((sub) =>
      sub
        .setName('propor')
        .setNameLocalizations({
          'en-US': 'propose',
          'en-GB': 'propose',
          'pt-BR': 'propor',
        })
        .setDescription('Propose marriage to someone for 1000 coins')
        .setDescriptionLocalizations({
          'pt-BR': 'Pede alguém em casamento por 1000 Moedinhas',
        })
        .addUserOption((opt) =>
          opt
            .setName('usuario')
            .setNameLocalizations({
              'en-US': 'user',
              'en-GB': 'user',
              'pt-BR': 'usuario',
            })
            .setDescription('User to propose to')
            .setDescriptionLocalizations({
              'pt-BR': 'Usuário para pedir em casamento',
            })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('status')
        .setNameLocalizations({
          'en-US': 'status',
          'en-GB': 'status',
          'pt-BR': 'status',
        })
        .setDescription('View your marriage stats, Love Bar, house, tree and family')
        .setDescriptionLocalizations({
          'pt-BR': 'Visualiza o status matrimonial, Barra do Amor, casa, árvore e família',
        })
    )
    .addSubcommand((sub) =>
      sub
        .setName('arvore')
        .setNameLocalizations({
          'en-US': 'tree',
          'en-GB': 'tree',
          'pt-BR': 'arvore',
        })
        .setDescription('Buy or cultivate the Tree of Life for +10% Love')
        .setDescriptionLocalizations({
          'pt-BR': 'Compre ou cultive a Árvore da Vida para +10% de Amor',
        })
        .addStringOption((opt) =>
          opt
            .setName('acao')
            .setNameLocalizations({
              'en-US': 'action',
              'en-GB': 'action',
              'pt-BR': 'acao',
            })
            .setDescription('Action: cultivate or buy')
            .setDescriptionLocalizations({
              'pt-BR': 'Ação: cultivar ou comprar',
            })
            .addChoices(
              { name: 'Cultivar / Water (+10% Amor)', value: 'cultivar' },
              { name: 'Comprar / Unlock (1 Feijão Mágico)', value: 'comprar' }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('casa')
        .setNameLocalizations({
          'en-US': 'house',
          'en-GB': 'house',
          'pt-BR': 'casa',
        })
        .setDescription('Purchase the Family House (2000 coins, 2 beans, love >= 50%)')
        .setDescriptionLocalizations({
          'pt-BR': 'Adquire a Casa Familiar (2000 moedas, 2 feijões, amor >= 50%)',
        })
    )
    .addSubcommand((sub) =>
      sub
        .setName('cofre')
        .setNameLocalizations({
          'en-US': 'vault',
          'en-GB': 'vault',
          'pt-BR': 'cofre',
        })
        .setDescription('Manage the Eternal Love Vault and daily interest')
        .setDescriptionLocalizations({
          'pt-BR': 'Gerencie o Cofre do Amor Eterno e os rendimentos diários',
        })
        .addStringOption((opt) =>
          opt
            .setName('acao')
            .setNameLocalizations({
              'en-US': 'action',
              'en-GB': 'action',
              'pt-BR': 'acao',
            })
            .setDescription('Action: deposit or claim')
            .setDescriptionLocalizations({
              'pt-BR': 'Ação: depositar ou resgatar',
            })
            .addChoices(
              { name: 'Depositar / Deposit', value: 'depositar' },
              { name: 'Resgatar Juros / Claim Interest', value: 'resgatar' }
            )
        )
        .addIntegerOption((opt) =>
          opt
            .setName('valor')
            .setNameLocalizations({
              'en-US': 'amount',
              'en-GB': 'amount',
              'pt-BR': 'valor',
            })
            .setDescription('Amount of coins to deposit')
            .setDescriptionLocalizations({
              'pt-BR': 'Quantidade de moedas a depositar',
            })
            .setMinValue(1)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('date')
        .setNameLocalizations({
          'en-US': 'date',
          'en-GB': 'date',
          'pt-BR': 'date',
        })
        .setDescription('Start a Date Night couple harmony trivia (12h cooldown)')
        .setDescriptionLocalizations({
          'pt-BR': 'Inicia um Date Night com teste de sintonia a dois (12h cooldown)',
        })
    )
    .addSubcommand((sub) =>
      sub
        .setName('carinho')
        .setNameLocalizations({
          'en-US': 'affection',
          'en-GB': 'affection',
          'pt-BR': 'carinho',
        })
        .setDescription('Give daily affection to your spouse (+5% Love, 24h cooldown)')
        .setDescriptionLocalizations({
          'pt-BR': 'Dê um carinho diário ao seu amor (+5% Amor, 24h cooldown)',
        })
    )
    .addSubcommand((sub) =>
      sub
        .setName('filho')
        .setNameLocalizations({
          'en-US': 'child',
          'en-GB': 'child',
          'pt-BR': 'filho',
        })
        .setDescription('Adopt or expand your family with a new child')
        .setDescriptionLocalizations({
          'pt-BR': 'Adote ou aumente a família com um novo filho',
        })
    ),

  async executePrefix({ message, args = [] }) {
    const sub = (args[0] || '').toLowerCase();

    // py!casamento @user -> proposta direta
    if (message.mentions.users.size > 0 && !['status', 'arvore', 'casa', 'cofre', 'date', 'carinho', 'filho'].includes(sub)) {
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

    // Padrão: se for casado, mostra status; se não, instrui sobre propor
    const marriage = getMarriage(message.author.id);
    if (marriage) {
      return handleStatus(message, (c) => message.reply(c));
    }
    return handlePropose(message, (c) => message.reply(c));
  },

  async executeSlash({ interaction }) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'propor' || sub === 'propose') {
      return handlePropose(interaction, (c) => interaction.editReply(c));
    }
    if (sub === 'status') return handleStatus(interaction, (c) => interaction.editReply(c));
    if (sub === 'arvore' || sub === 'tree') {
      const action = interaction.options.getString('acao') || interaction.options.getString('action') || 'cultivar';
      return handleTree(interaction, action, (c) => interaction.editReply(c));
    }
    if (sub === 'casa' || sub === 'house') return handleHouse(interaction, (c) => interaction.editReply(c));
    if (sub === 'cofre' || sub === 'vault') {
      const action = interaction.options.getString('acao') || interaction.options.getString('action') || 'resgatar';
      const amount = interaction.options.getInteger('valor') || interaction.options.getInteger('amount') || 0;
      return handleVault(interaction, action, amount, (c) => interaction.editReply(c));
    }
    if (sub === 'date') return handleDateNight(interaction, (c) => interaction.editReply(c));
    if (sub === 'carinho' || sub === 'affection') return handleAffection(interaction, (c) => interaction.editReply(c));
    if (sub === 'filho' || sub === 'child') return handleChildProposal(interaction, (c) => interaction.editReply(c));

    return handleStatus(interaction, (c) => interaction.editReply(c));
  },
};

