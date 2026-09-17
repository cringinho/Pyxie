const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { VPET, PYMONS } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const {
  getActiveVpet,
  createNewVpet,
  feedMeat,
  feedPill,
  cleanPoop,
  toggleLight,
  curePet,
  trainPet,
  evolvePet,
  checkEvolution,
} = require('../services/vpet/vpetCore');
const {
  buildVpetEmbed,
  buildVpetActionRows,
  buildTrainingChoiceRow,
} = require('../services/vpet/vpetEmbed');
const { resolveSparring } = require('../services/vpet/vpetCombat');
const { VPET_EGGS } = require('../services/vpet/vpetSpecies');

const { buildDungeonTab } = require('../services/vpet/vpetDungeon');

module.exports = {
  name: 'pymons',
  aliases: ['pymons', 'pymon', 'pet', 'vpet', 'tamagotchi', 'mascote', 'py-pymons', 'py-vpet'],
  data: new SlashCommandBuilder()
    .setName(PYMONS)
    .setDescription('Open your interactive MapleStory-style Pymons screen')
    .setDescriptionLocalizations({
      'pt-BR': 'Abre a tela interativa do seu Pymon estilo MapleStory',
    }),
  buildDungeonTab,

  async executeSlash({ interaction }) {
    const user = interaction.user;
    const lang = getLanguage(interaction);
    let pet = getActiveVpet(user.id);

    if (!pet) {
      return handleNewPetOnboarding(interaction, user, lang, false);
    }

    const embed = buildVpetEmbed(pet, user, lang);
    const components = buildVpetActionRows(pet, lang);

    const message = await interaction.editReply({ embeds: [embed], components });
    createVpetInteractionCollector(message, user.id, lang);
  },

  async executePrefix({ message, args = [] }) {
    const user = message.author;
    const lang = getLanguage(message);
    let pet = getActiveVpet(user.id);

    // Se o usuário ainda não tiver um pet, exibe a tela de escolha de ovo inicial
    if (!pet) {
      return handleNewPetOnboarding(message, user, lang, false);
    }

    const embed = buildVpetEmbed(pet, user, lang);
    const components = buildVpetActionRows(pet, lang);

    const replyMsg = await message.channel.send({ embeds: [embed], components });
    createVpetInteractionCollector(replyMsg, user.id, lang);
  },

  async execute(context, args = []) {
    const isInteraction = typeof context.isCommand === 'function' && context.isCommand();
    if (isInteraction) {
      return this.executeSlash({ interaction: context });
    }
    return this.executePrefix({ message: context, args });
  },

  isPetInteraction(interaction) {
    if (!interaction.customId) return false;
    return interaction.customId.startsWith('vpet_') || interaction.customId.startsWith('hub_tab:pet:');
  },
  async handlePetInteraction(interaction) {
    return processVpetInteraction(interaction);
  },
};

/**
 * Processa qualquer ação de botão do Pymon (seja via coletor local ou despachante global)
 */
async function processVpetInteraction(interaction) {
  const userId = interaction.user.id;
  const lang = getLanguage(interaction);
  const customId = interaction.customId;
  let pet = getActiveVpet(userId);

  if (!pet) {
    if (customId.startsWith('vpet_egg_')) {
      const eggKey = customId.replace('vpet_', '');
      const newPet = createNewVpet(userId, 'slime', eggKey);
      const successNotice = lang === 'pt'
        ? `🎉 O ovo chocou! Nasceu uma adorável gotinha gelatinosa **${newPet.name}**!`
        : `🎉 The egg hatched! A cute little bouncy **${newPet.name}** was born!`;
      const petEmbed = buildVpetEmbed(newPet, interaction.user, lang, {
        actionNotice: successNotice,
        animState: 'attack',
        dialogueState: 'happy',
      });
      const petRows = buildVpetActionRows(newPet, lang);
      return interaction.update({ embeds: [petEmbed], components: petRows });
    }
    return handleNewPetOnboarding(interaction, interaction.user, lang, true);
  }

  let actionNotice = null;
  let animState = 'idle';
  let dialogueState = null;

  if (customId === 'vpet_meat') {
    const res = feedMeat(userId);
    if (res.success) {
      actionNotice = lang === 'pt'
        ? '🍖 Você alimentou seu Pymon com carne suculenta! (+1 Fome, +1g Peso)'
        : '🍖 You fed your Pymon juicy meat! (+1 Hunger, +1g Weight)';
      animState = 'attack';
      dialogueState = 'happy';
    } else {
      actionNotice = res.reason === 'sleeping'
        ? (lang === 'pt' ? '💤 Seu Pymon está dormindo! Não o acorde agora.' : '💤 Your Pymon is sleeping! Do not wake it up now.')
        : (lang === 'pt' ? '🍖 Seu Pymon já está de barriga cheia!' : '🍖 Your Pymon is already completely full!');
    }
  } else if (customId === 'vpet_pill') {
    const res = feedPill(userId);
    if (res.success) {
      actionNotice = lang === 'pt'
        ? '💊 Pílula de proteína ingerida! (+1 Força, +2g Peso)'
        : '💊 Protein capsule ingested! (+1 Strength, +2g Weight)';
      animState = 'attack';
      dialogueState = 'happy';
    } else {
      actionNotice = lang === 'pt'
        ? '⚡ A força do seu Pymon já está no limite máximo!'
        : '⚡ Your Pymon strength is already at maximum!';
    }
  } else if (customId === 'vpet_clean') {
    const res = cleanPoop(userId);
    if (res.success) {
      actionNotice = lang === 'pt'
        ? `🧹 Você varreu ${res.cleanedCount} sujeira(s)! O recinto está brilhando!`
        : `🧹 You swept ${res.cleanedCount} mess(es)! The room is sparkling clean!`;
      dialogueState = 'happy';
    } else {
      actionNotice = lang === 'pt' ? '✨ O recinto já está perfeitamente limpo!' : '✨ The room is already spotless!';
    }
  } else if (customId === 'vpet_light') {
    const res = toggleLight(userId);
    if (res.success) {
      actionNotice = res.lightOff
        ? (lang === 'pt' ? '💡 Luz apagada. Boa noite, Pymon!' : '💡 Lights turned off. Sweet dreams!')
        : (lang === 'pt' ? '💡 Luz acesa. Bom dia, Pymon!' : '💡 Lights turned on. Rise and shine!');
    }
  } else if (customId === 'vpet_cure') {
    const res = curePet(userId);
    if (res.success) {
      actionNotice = lang === 'pt'
        ? '💉 A injeção médica fez efeito imediato! Seu Pymon está curado!'
        : '💉 Medical injection took effect! Your Pymon is fully cured!';
      dialogueState = 'happy';
    } else {
      actionNotice = lang === 'pt' ? '✨ Seu Pymon está saudável e não precisa de remédio.' : '✨ Your Pymon is healthy and does not need medicine.';
    }
  } else if (customId === 'vpet_train') {
    const choiceRow = buildTrainingChoiceRow(lang);
    const notice = lang === 'pt'
      ? '🥊 Escolha a direção do golpe de treino:'
      : '🥊 Choose the strike direction for training:';
    const trainEmbed = buildVpetEmbed(pet, interaction.user, lang, { actionNotice: notice });
    return interaction.update({ embeds: [trainEmbed], components: [choiceRow] });
  } else if (customId.startsWith('vpet_train_')) {
    const dir = customId.replace('vpet_train_', '');
    const res = trainPet(userId, dir);
    if (res.success) {
      if (res.win) {
        actionNotice = lang === 'pt'
          ? `🥊 Treino Perfeito! Acertou o golpe ${dir}! (+1 Força, -2g Peso)`
          : `🥊 Perfect Training! Landed the ${dir} strike! (+1 Strength, -2g Weight)`;
        animState = 'attack';
        dialogueState = 'happy';
      } else {
        actionNotice = lang === 'pt'
          ? `⚠️ O Pymon errou o tempo do golpe (alvo era ${res.targetDirection}). (-1g Peso)`
          : `⚠️ Pymon mistimed the strike (target was ${res.targetDirection}). (-1g Weight)`;
        animState = 'hit';
      }
    }
  } else if (customId === 'vpet_spar') {
    const sparRes = resolveSparring(pet, null, lang);
    pet.battlesCount = (pet.battlesCount || 0) + 1;
    if (sparRes.victory) {
      pet.battlesWon = (pet.battlesWon || 0) + 1;
      pet.weight = Math.max(10, pet.weight - 2);
      actionNotice = sparRes.log;
      animState = 'attack';
      dialogueState = 'happy';
    } else {
      pet.weight = Math.max(10, pet.weight - 1);
      actionNotice = sparRes.log;
      animState = 'hit';
      dialogueState = 'sick';
    }
  } else if (customId === 'vpet_evolve') {
    const evoRes = evolvePet(userId);
    if (evoRes.success) {
      actionNotice = lang === 'pt'
        ? `🧬 INCRÍVEL! Seu Pymon evoluiu para **${evoRes.pet.species}**! Parabéns, tutor!`
        : `🧬 INCREDIBLE! Your Pymon evolved into **${evoRes.pet.species}**! Congratulations!`;
      animState = 'attack';
      dialogueState = 'happy';
    } else {
      actionNotice = lang === 'pt'
        ? '🧬 Seu Pymon ainda não cumpre todos os requisitos de evolução (treinos, maturidade e vitórias).'
        : '🧬 Your Pymon does not yet meet all evolution requirements (training, maturity, and victories).';
    }
  } else if (customId === 'vpet_talk') {
    actionNotice = lang === 'pt' ? '💬 Você fez carinho e conversou com seu Pymon!' : '💬 You stroked and chatted with your Pymon!';
    dialogueState = 'happy';
  } else if (customId === 'vpet_new') {
    return handleNewPetOnboarding(interaction, interaction.user, lang, true);
  } else if (customId === 'vpet_back') {
    // Volta para tela principal
  }

  pet = getActiveVpet(userId);
  const updatedEmbed = buildVpetEmbed(pet, interaction.user, lang, {
    dialogueState,
    actionNotice,
    animState,
  });
  const updatedComponents = buildVpetActionRows(pet, lang);

  await interaction.update({ embeds: [updatedEmbed], components: updatedComponents });
}

function createVpetInteractionCollector(message, userId, initialLang) {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 15 * 60 * 1000,
  });

  collector.on('collect', async (interaction) => {
    if (interaction.user.id !== userId) {
      const errTxt = initialLang === 'pt'
        ? '⚠️ Este não é o seu Pymon! Use `/py-pymons` para abrir o seu.'
        : '⚠️ This is not your Pymon! Use `/py-pymons` to open yours.';
      return interaction.reply({ content: errTxt, ephemeral: true });
    }
    await processVpetInteraction(interaction);
  });

  collector.on('end', () => {
    message.edit({ components: [] }).catch(() => {});
  });
}

/**
 * Interface de Onboarding / Chocadeira inicial de Ovos
 */
async function handleNewPetOnboarding(context, user, lang, isUpdate = false) {
  const isInteraction = typeof context.isCommand === 'function' && context.isCommand() || context.isButton?.();

  const title = lang === 'pt' ? '🥚 Escolha seu Ovo Inicial de V-Pet' : '🥚 Choose your Starter V-Pet Egg';
  const desc = lang === 'pt'
    ? 'Bem-vindo ao mundo dos Mascotes Virtuais da Pyxie!\nEscolha a essência do ovo para chocar o seu primeiro pet em pixel art:'
    : 'Welcome to the Pyxie Virtual Pet world!\nChoose the egg essence to hatch your first pixel art pet:';

  const rows = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('vpet_egg_mystic').setLabel(lang === 'pt' ? 'Místico' : 'Mystic').setEmoji('✨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('vpet_egg_water').setLabel(lang === 'pt' ? 'Marés' : 'Tides').setEmoji('💧').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('vpet_egg_grass').setLabel(lang === 'pt' ? 'Floresta' : 'Forest').setEmoji('🍃').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('vpet_egg_fire').setLabel(lang === 'pt' ? 'Vulcânico' : 'Volcano').setEmoji('🔥').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('vpet_egg_golden').setLabel(lang === 'pt' ? 'Dourado' : 'Golden').setEmoji('🌟').setStyle(ButtonStyle.Secondary)
  );

  const embed = {
    color: 0xf472b6,
    title,
    description: desc,
    thumbnail: { url: VPET_EGGS.egg_mystic.sprite },
    footer: { text: lang === 'pt' ? 'Toque em um botão para chocar o ovo' : 'Tap a button to hatch your egg' },
  };

  const replyOptions = { embeds: [embed], components: [rows] };
  let msg;
  if (isInteraction) {
    if (isUpdate) {
      msg = await context.update({ ...replyOptions, fetchReply: true });
    } else if (context.deferred || context.replied) {
      msg = await context.editReply({ ...replyOptions });
    } else {
      msg = await context.reply({ ...replyOptions, fetchReply: true });
    }
  } else {
    msg = await context.channel.send(replyOptions);
  }

  const targetMsg = msg || (await context.fetchReply?.());
  if (!targetMsg) return;

  const filter = (i) => i.user.id === user.id && i.customId.startsWith('vpet_egg_');
  const collected = await targetMsg.awaitMessageComponent({ filter, time: 60000 }).catch(() => null);

  if (!collected) return;

  const eggKey = collected.customId.replace('vpet_', '');
  const newPet = createNewVpet(user.id, 'slime', eggKey);

  const successNotice = lang === 'pt'
    ? `🎉 O ovo chocou! Nasceu uma adorável gotinha gelatinosa **${newPet.name}**!`
    : `🎉 The egg hatched! A cute little bouncy **${newPet.name}** was born!`;

  const petEmbed = buildVpetEmbed(newPet, user, lang, {
    actionNotice: successNotice,
    animState: 'attack',
    dialogueState: 'happy',
  });
  const petRows = buildVpetActionRows(newPet, lang);

  await collected.update({ embeds: [petEmbed], components: petRows });
  createVpetInteractionCollector(targetMsg, user.id, lang);
}
