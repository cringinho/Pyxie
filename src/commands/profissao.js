const {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const professions = require('../services/professions');
const {
  getCareerLevel,
  getUserAccount,
  setProfession,
} = require('../services/economy');
const { getRoleTitle } = require('../services/careerHierarchy');
const { formatCoins } = require('./economyHelpers');
const { PROFESSION } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { getEmoji } = require('../utils/appEmojis');

function getProfessionChoices() {
  return Object.entries(professions).map(([value, profession]) => ({
    name: `${profession.isMagic ? '✨ ' : ''}${profession.label}${profession.isMagic ? ` (${profession.beanCost} Feijões)` : ''}`.slice(0, 100),
    value,
  }));
}

function getReply(result, professionKey, source = null) {
  const professionLabel = t(`profession.labels.${professionKey}`, source) || professions[professionKey]?.label || professionKey;
  const beanEmoji = getEmoji('MAGIC_BEAN');

  if (!result.changed && result.reason === 'same') {
    return t('profession.sameProfession', source, { profession: professionLabel });
  }
  if (!result.changed && result.reason === 'insufficient_beans') {
    return t('profession.insufficientBeans', source, {
      cost: result.beanCost,
      beanEmoji,
      balance: result.balanceBeans,
    });
  }
  if (!result.changed && result.reason === 'insufficient') {
    return t('profession.switchCost', source, {
      cost: formatCoins(50, source),
      balance: formatCoins(result.balance, source),
    });
  }
  if (result.unlockedWithBeans) {
    return t('profession.unlockedMagicSuccess', source, {
      profession: professionLabel,
      cost: result.beanCost,
      beanEmoji,
    });
  }
  return result.charged === 0
    ? t('profession.freeSuccess', source, { profession: professionLabel })
    : t('profession.paidSuccess', source, { profession: professionLabel, cost: formatCoins(50, source) });
}

const PROFESSION_ALIASES = {
  gamedev: 'desenvolvedor_jogos',
  game_dev: 'desenvolvedor_jogos',
  'desenvolvedor de jogos': 'desenvolvedor_jogos',
  'desenvolvedor-jogos': 'desenvolvedor_jogos',
  desenvolvedorjogos: 'desenvolvedor_jogos',
  jogos: 'desenvolvedor_jogos',
  games: 'desenvolvedor_jogos',
  'animador de festa': 'animador_festa',
  'animador-festa': 'animador_festa',
  animadorfesta: 'animador_festa',
  animador: 'animador_festa',
  animadora: 'animador_festa',
  recreador: 'animador_festa',
  recreadora: 'animador_festa',
  callcenter: 'telemarketing',
  'call center': 'telemarketing',
  sac: 'telemarketing',
  atendente: 'telemarketing',
  psicologa: 'psicologo',
  psicologo: 'psicologo',
  terapeuta: 'psicologo',
  dubladora: 'dublador',
  dublador: 'dublador',
  voz: 'dublador',
  advogado: 'advogada',
  advogada: 'advogada',
  lawyer: 'advogada',
  attorney: 'advogada',
  jurista: 'advogada',
  alquimista: 'alquimista',
  alchemist: 'alquimista',
  alquimia: 'alquimista',
  mago: 'mago',
  maga: 'mago',
  wizard: 'mago',
  mage: 'mago',
  feiticeiro: 'mago',
  feiticeira: 'mago',
  bruxo: 'mago',
  bruxa: 'mago',
  ferreiro: 'ferreiro',
  ferreira: 'ferreiro',
  blacksmith: 'ferreiro',
  smith: 'ferreiro',
  armeiro: 'ferreiro',
  armeira: 'ferreiro',
  forjador: 'ferreiro',
  forjadora: 'ferreiro',
  rei: 'rei_rainha',
  rainha: 'rei_rainha',
  monarca: 'rei_rainha',
  imperador: 'rei_rainha',
  imperatriz: 'rei_rainha',
  king: 'rei_rainha',
  queen: 'rei_rainha',
  soberano: 'rei_rainha',
  soberana: 'rei_rainha',
  domador: 'domador_feras',
  domadora: 'domador_feras',
  domadordeferas: 'domador_feras',
  'domador de feras': 'domador_feras',
  'domadora de feras': 'domador_feras',
  beast_tamer: 'domador_feras',
  beasttamer: 'domador_feras',
  tamer: 'domador_feras',
  aniquilador: 'aniquilador_vegetais',
  aniquiladora: 'aniquilador_vegetais',
  aniquiladordevegetais: 'aniquilador_vegetais',
  'aniquilador de vegetais': 'aniquilador_vegetais',
  'aniquiladora de vegetais': 'aniquilador_vegetais',
  vegetable_slayer: 'aniquilador_vegetais',
  vegetableslayer: 'aniquilador_vegetais',
  plant_slayer: 'aniquilador_vegetais',
  plantslayer: 'aniquilador_vegetais',
};

function resolveProfession(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (professions[normalized]) return normalized;
  if (PROFESSION_ALIASES[normalized]) return PROFESSION_ALIASES[normalized];
  const underscored = normalized.replace(/[\s-]+/g, '_');
  if (professions[underscored]) return underscored;
  if (PROFESSION_ALIASES[underscored]) return PROFESSION_ALIASES[underscored];
  return null;
}

function buildProfessionEmbed(userId, source) {
  const account = getUserAccount(userId);
  const lang = getLanguage(source);
  const currentKey = account.profession;
  const currentProf = currentKey ? professions[currentKey] : null;
  const currentLabel = currentKey
    ? (t(`profession.labels.${currentKey}`, source) || currentProf?.label || currentKey)
    : t('profession.none', source);
  const currentEmoji = currentProf?.emoji || '💼';
  const careerLevel = getCareerLevel(userId);
  const roleTitle = currentKey ? getRoleTitle(currentKey, careerLevel, lang) : null;
  const unlocked = account.unlockedProfessions || [];

  const commonKeys = Object.keys(professions).filter((k) => !professions[k].isMagic);
  const magicKeys = Object.keys(professions).filter((k) => professions[k].isMagic);

  const beanEmoji = getEmoji('MAGIC_BEAN');
  const coinEmoji = getEmoji('COIN');
  const sparklesEmoji = getEmoji('SPARKLES');

  // Format conventional careers cleanly in rows of 4 with their thematic emojis
  const commonFormattedRows = [];
  for (let i = 0; i < commonKeys.length; i += 4) {
    const chunk = commonKeys.slice(i, i + 4);
    const rowStr = chunk
      .map((k) => `${professions[k].emoji} **${t(`profession.labels.${k}`, source) || professions[k].label}**`)
      .join('  •  ');
    commonFormattedRows.push(rowStr);
  }

  // Format magic vocations with custom application emojis and clean cost tag without duplicate icons
  const magicFormattedList = magicKeys
    .map((k) => {
      const p = professions[k];
      const isOwned = unlocked.includes(k);
      const label = t(`profession.labels.${k}`, source) || p.label;
      if (isOwned) {
        return `${p.emoji} **${label}** — ✅ *${t('profession.unlockedTag', source)}*`;
      }
      const beanUnit = p.beanCost === 1 ? t('profession.beanUnitSingle', source) : t('profession.beanUnitPlural', source);
      const costText = t('profession.beanCostTag', source, { cost: p.beanCost, beanEmoji, beanUnit });
      return `${p.emoji} **${label}** — *${costText}*`;
    })
    .join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`${sparklesEmoji}  ✦  ${t('profession.embedTitle', source)}`)
    .setDescription(t('profession.embedDesc', source, { beanEmoji }))
    .setColor(PYXIE_COLORS.primary || 0xe60067)
    .addFields(
      {
        name: t('profession.currentProfession', source),
        value: `${currentEmoji} **${currentLabel}**${roleTitle ? ` — *${roleTitle}* (Nível ${careerLevel})` : ''}\n> ${t('profession.userBalanceField', source, {
          coinEmoji,
          coins: Number(account.coins || 0).toLocaleString('pt-BR'),
          beanEmoji,
          beans: Number(account.magicBeans || 0).toLocaleString('pt-BR'),
        })}`,
        inline: false,
      },
      {
        name: t('profession.standardCareers', source, { count: commonKeys.length }),
        value: commonFormattedRows.join('\n'),
        inline: false,
      },
      {
        name: t('profession.magicCareers', source, { count: magicKeys.length }),
        value: magicFormattedList,
        inline: false,
      }
    )
    .setFooter({
      text: 'Pyxie • pyxie.com.br • Cringelândia & Global',
      iconURL: 'https://pyxie.com.br/assets/pyxie_avatar.png',
    });

  return embed;
}

function buildProfessionSelectRow(userId, source) {
  const account = getUserAccount(userId);
  const unlocked = account.unlockedProfessions || [];
  const options = Object.entries(professions).map(([value, prof]) => {
    const isMagic = Boolean(prof.isMagic);
    const isOwned = unlocked.includes(value);
    const label = t(`profession.labels.${value}`, source) || prof.label;
    let desc = '';
    if (isMagic) {
      desc = isOwned
        ? (source && getLanguage(source) === 'en' ? 'Arcane Calling (Unlocked)' : 'Vocação Arcana (Desbloqueada)')
        : (source && getLanguage(source) === 'en'
            ? `Arcane Calling (Costs ${prof.beanCost} Magic Beans)`
            : `Vocação Arcana (Requer ${prof.beanCost} Feijões Mágicos)`);
    } else {
      desc = source && getLanguage(source) === 'en'
        ? 'Standard Career (50 coins switch)'
        : 'Carreira Convencional (50 moedas p/ troca)';
    }

    return {
      label: label.slice(0, 100),
      value,
      description: desc.slice(0, 100),
      emoji: prof.emoji || (isMagic ? '✨' : '💼'),
      default: account.profession === value,
    };
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`profession_select_${userId}`)
    .setPlaceholder(t('profession.selectPlaceholder', source))
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

function attachCollector(responseMsg, source, userId) {
  if (!responseMsg || typeof responseMsg.createMessageComponentCollector !== 'function') return;
  const collector = responseMsg.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === userId && i.customId === `profession_select_${userId}`,
    time: 60_000,
  });

  collector.on('collect', async (i) => {
    const chosenKey = i.values[0];
    const result = setProfession(userId, chosenKey);
    const feedback = getReply(result, chosenKey, source);
    const updatedEmbed = buildProfessionEmbed(userId, source);
    const updatedRow = buildProfessionSelectRow(userId, source);

    await i.update({
      content: feedback,
      embeds: [updatedEmbed],
      components: [updatedRow],
    }).catch(() => {});
  });

  collector.on('end', async () => {
    try {
      const disabledRow = buildProfessionSelectRow(userId, source);
      if (disabledRow.components && disabledRow.components[0]) {
        disabledRow.components[0].setDisabled(true);
      }
      if (responseMsg.edit) {
        await responseMsg.edit({ components: [disabledRow] }).catch(() => {});
      }
    } catch (_) {}
  });
}

async function execute(source, reply, value) {
  const userId = source.user?.id || source.author?.id;
  const cleanVal = typeof value === 'string' ? value.trim() : '';

  if (!cleanVal) {
    const embed = buildProfessionEmbed(userId, source);
    const row = buildProfessionSelectRow(userId, source);
    const responseMsg = await reply({ embeds: [embed], components: [row] });
    attachCollector(responseMsg, source, userId);
    return;
  }

  const key = resolveProfession(cleanVal);
  if (!key) {
    const list = Object.keys(professions)
      .map((k) => t(`profession.labels.${k}`, source) || professions[k].label)
      .join(', ');
    return reply(t('profession.invalid', source, { list }));
  }

  const result = setProfession(userId, key);
  const feedback = getReply(result, key, source);
  const embed = buildProfessionEmbed(userId, source);
  const row = buildProfessionSelectRow(userId, source);
  const responseMsg = await reply({ content: feedback, embeds: [embed], components: [row] });
  attachCollector(responseMsg, source, userId);
}

module.exports = {
  name: PROFESSION,
  aliases: ['profession', 'profissao', 'profissão', 'py-profissao', 'py-profession', 'career', 'job'],
  resolveProfession,
  buildProfessionEmbed,
  buildProfessionSelectRow,
  data: new SlashCommandBuilder()
    .setName(PROFESSION)
    .setDescription('Choose or change your profession.')
    .setDescriptionLocalizations({
      'pt-BR': 'Escolhe ou troca sua profissão.',
    })
    .addStringOption((option) =>
      option
        .setName('profession')
        .setNameLocalizations({
          'en-US': 'profession',
          'en-GB': 'profession',
          'pt-BR': 'profissao',
        })
        .setDescription('Desired profession to choose.')
        .setDescriptionLocalizations({
          'pt-BR': 'Profissão desejada para escolher.',
        })
        .setRequired(false)
        .addChoices(...getProfessionChoices())
    ),
  async executePrefix({ message, args }) {
    const rawVal = Array.isArray(args) && args.length > 0 ? args.join(' ') : null;
    await execute(message, (payload) => message.reply(payload), rawVal);
  },
  async executeSlash({ interaction }) {
    const chosen = interaction.options.getString('profession') || interaction.options.getString('profissao');
    await execute(interaction, (payload) => interaction.editReply(payload), chosen);
  },
};