const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { PYMONS } = require('./commandNames');
const { getLanguage } = require('../utils/i18n');
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
} = require('../services/vpet/vpetCore');
const {
  buildVpetEmbed,
  buildVpetActionRows,
  buildTrainingChoiceRow,
} = require('../services/vpet/vpetEmbed');
const { resolveSparring } = require('../services/vpet/vpetCombat');
const { VPET_EGGS } = require('../services/vpet/vpetSpecies');
const { buildDungeonTab } = require('../services/vpet/vpetDungeon');
const {
  buildBoxTab,
  buildIncubatorTab,
  buildArenaTab,
} = require('../services/vpet/vpetHub');
const { buildDexView } = require('./dex');
const {
  hatchIncubatorEgg,
  putEggInIncubator,
  useHourglassOnIncubator,
  setActivePet,
  expandPetStorage,
  releasePet,
  getUserPetRecord,
  awardPetXp,
} = require('../services/pets');
const { updateUserAccount } = require('../services/economy');

module.exports = {
  name: 'pymons',
  aliases: ['pymons', 'pymon', 'pet', 'vpet', 'tamagotchi', 'mascote', 'py-pymons', 'py-vpet'],
  data: new SlashCommandBuilder()
    .setName(PYMONS)
    .setDescription('Open your interactive MapleStory-style Pymons screen')
    .setDescriptionLocalizations({
      'pt-BR': 'Abre a tela interativa do seu Pymon estilo MapleStory',
    }),
  buildBoxTab,
  buildDungeonTab,
  buildIncubatorTab,
  buildArenaTab,

  async executeSlash({ interaction }) {
    const user = interaction.user;
    const lang = getLanguage(interaction);
    let pet = getActiveVpet(user.id);

    if (!pet) {
      return handleNewPetOnboarding(interaction, user, lang, false);
    }

    const embed = buildVpetEmbed(pet, user, lang);
    const components = buildVpetActionRows(pet, lang, user.id);

    await interaction.editReply({ embeds: [embed], components, files: [] });
  },

  async executePrefix({ message, args = [] }) {
    const user = message.author;
    const lang = getLanguage(message);
    let pet = getActiveVpet(user.id);

    if (!pet) {
      return handleNewPetOnboarding(message, user, lang, false);
    }

    const embed = buildVpetEmbed(pet, user, lang);
    const components = buildVpetActionRows(pet, lang, user.id);

    await message.channel.send({ embeds: [embed], components, files: [] });
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
    return (
      interaction.customId.startsWith('vpet_') ||
      interaction.customId.startsWith('hub_tab:') ||
      interaction.customId.startsWith('box_') ||
      interaction.customId.startsWith('incubator_') ||
      interaction.customId.startsWith('arena_')
    );
  },

  async handlePetInteraction(interaction) {
    return processVpetInteraction(interaction);
  },
};

/**
 * Processa qualquer ação de botão ou menu do ecossistema Pymons
 */
async function processVpetInteraction(interaction) {
  try {
    if (!interaction || !interaction.customId) return;
    const userId = interaction.user.id;
    const userTag = interaction.user.displayName || interaction.user.username;
    const lang = getLanguage(interaction);
    const customId = interaction.customId;
    const isPt = lang === 'pt';

    // 1. Navegação Central entre Abas do Hub
    if (customId.startsWith('hub_tab:')) {
      const parts = customId.split(':');
      const targetTab = parts[1];
      const targetUserId = parts[2];

      if (targetUserId && targetUserId !== userId) {
        return interaction.reply({
          content: isPt ? '⚠️ Este painel pertence a outro aventureiro!' : '⚠️ This panel belongs to another adventurer!',
          ephemeral: true,
        });
      }

      if (targetTab === 'pet') {
        const pet = getActiveVpet(userId);
        if (!pet) {
          return handleNewPetOnboarding(interaction, interaction.user, lang, true);
        }
        const embed = buildVpetEmbed(pet, interaction.user, lang);
        const components = buildVpetActionRows(pet, lang, userId);
        return await safeUpdateInteraction(interaction, { embeds: [embed], components, files: [] });
      }

      if (targetTab === 'box') {
        const view = buildBoxTab(userId, userTag, interaction);
        return await safeUpdateInteraction(interaction, view);
      }

      if (targetTab === 'dungeon') {
        const view = buildDungeonTab(userId, userTag, interaction);
        return await safeUpdateInteraction(interaction, view);
      }

      if (targetTab === 'incubator') {
        const view = buildIncubatorTab(userId, userTag, interaction);
        return await safeUpdateInteraction(interaction, view);
      }

      if (targetTab === 'dex') {
        const view = buildDexView(userId, userTag, 'cinna', false, interaction);
        return await safeUpdateInteraction(interaction, view);
      }

      if (targetTab === 'arena') {
        const view = buildArenaTab(userId, userTag, interaction);
        return await safeUpdateInteraction(interaction, view);
      }
    }

    // 2. Ações da PC Box (Trocar Pymon Ativo, Desbloquear Slots, Soltar)
    if (customId.startsWith('box_')) {
      if (customId.startsWith('box_select_active:')) {
        const selectedValue = interaction.values?.[0];
        if (selectedValue && selectedValue.startsWith('box_set_active:')) {
          const parts = selectedValue.split(':');
          const targetPetId = parts[1];
          const res = setActivePet(userId, targetPetId);
          const notice = res.success
            ? (isPt ? `🌟 **${res.pet.name}** agora é o seu Pymon ativo!` : `🌟 **${res.pet.name}** is now your active Pymon!`)
            : (isPt ? '⚠️ Não foi possível alterar o Pymon ativo.' : '⚠️ Could not change active Pymon.');
          const view = buildBoxTab(userId, userTag, interaction, notice);
          return await safeUpdateInteraction(interaction, view);
        }
      }

      if (customId.startsWith('box_unlock_slot:')) {
        const res = expandPetStorage(userId);
        const view = buildBoxTab(userId, userTag, interaction, res.message);
        return await safeUpdateInteraction(interaction, view);
      }

      if (customId.startsWith('box_release_start:')) {
        const record = getUserPetRecord(userId);
        const pets = record.pets || [];
        if (pets.length <= 1) {
          const view = buildBoxTab(userId, userTag, interaction, isPt ? '⚠️ Você não pode soltar seu único Pymon!' : '⚠️ You cannot release your only Pymon!');
          return await safeUpdateInteraction(interaction, view);
        }

        const candidate = pets.find((p) => p.id !== record.activePetId) || pets[pets.length - 1];
        const res = releasePet(userId, candidate.id);
        const view = buildBoxTab(userId, userTag, interaction, res.message);
        return await safeUpdateInteraction(interaction, view);
      }
    }

    // 3. Ações da Chocadeira
    if (customId.startsWith('incubator_')) {
      if (customId.startsWith('incubator_hatch:')) {
        const parts = customId.split(':');
        const slotIdx = Number(parts[1]);
        const res = hatchIncubatorEgg(userId, slotIdx);
        const notice = res.success
          ? (isPt ? `🎉 ${res.message}` : `🎉 Egg hatched successfully!`)
          : res.message;
        const view = buildIncubatorTab(userId, userTag, interaction, notice);
        return await safeUpdateInteraction(interaction, view);
      }

      if (customId.startsWith('incubator_place:')) {
        const parts = customId.split(':');
        const eggItemId = parts[1];
        const slotIdx = Number(parts[2]);
        const res = putEggInIncubator(userId, eggItemId, slotIdx);
        const notice = res.success
          ? (isPt ? '🥚 Ovo colocado no ninho com sucesso!' : '🥚 Egg placed in nest successfully!')
          : res.message;
        const view = buildIncubatorTab(userId, userTag, interaction, notice);
        return await safeUpdateInteraction(interaction, view);
      }

      if (customId.startsWith('incubator_hourglass:')) {
        const parts = customId.split(':');
        const slotIdx = Number(parts[1]);
        const res = useHourglassOnIncubator(userId, slotIdx, 'ampulheta_tempo');
        const notice = res.success
          ? (isPt ? '⌛ Ampulheta usada! Tempo reduzido em 2 horas!' : '⌛ Hourglass used! Incubator speed increased!')
          : res.message;
        const view = buildIncubatorTab(userId, userTag, interaction, notice);
        return await safeUpdateInteraction(interaction, view);
      }
    }

    // 4. Ações da Arena
    if (customId.startsWith('arena_')) {
      if (customId.startsWith('arena_duel_info:')) {
        const notice = isPt
          ? '⚔️ Para desafiar um treinador valendo moedas, use: `/py-duelo usuario:@Amigo aposta:100`'
          : '⚔️ To challenge another trainer for coins, use: `/py-duel user:@Friend bet:100`';
        const view = buildArenaTab(userId, userTag, interaction, notice);
        return await safeUpdateInteraction(interaction, view);
      }
    }

    // 5. Ações do Mascote / Cuidados
    let pet = getActiveVpet(userId);

    if (!pet) {
      if (customId.startsWith('vpet_egg_')) {
        const eggKey = customId.replace('vpet_', '');
        const newPet = createNewVpet(userId, 'slime', eggKey);
        const successNotice = isPt
          ? `🎉 O ovo chocou! Nasceu uma adorável gotinha mágica **${newPet.name}**!`
          : `🎉 The egg hatched! A cute magical **${newPet.name}** was born!`;
        const petEmbed = buildVpetEmbed(newPet, interaction.user, lang, {
          actionNotice: successNotice,
          animState: 'attack',
          dialogueState: 'happy',
        });
        const petRows = buildVpetActionRows(newPet, lang, userId);
        return await safeUpdateInteraction(interaction, { embeds: [petEmbed], components: petRows, files: [] });
      }
      return await handleNewPetOnboarding(interaction, interaction.user, lang, true);
    }

    let actionNotice = null;
    let animState = 'idle';
    let dialogueState = null;

    if (customId === 'vpet_meat') {
      const res = feedMeat(userId);
      if (res.success) {
        actionNotice = isPt
          ? '🍖 Você alimentou seu Pymon com carne suculenta! (+1 Fome, +1g Peso)'
          : '🍖 You fed your Pymon juicy meat! (+1 Hunger, +1g Weight)';
        animState = 'attack';
        dialogueState = 'happy';
      } else {
        actionNotice = res.reason === 'sleeping'
          ? (isPt ? '💤 Seu Pymon está dormindo! Não o acorde agora.' : '💤 Your Pymon is sleeping! Do not wake it up now.')
          : (isPt ? '🍖 Seu Pymon já está de barriga cheia!' : '🍖 Your Pymon is already completely full!');
      }
    } else if (customId === 'vpet_pill') {
      const res = feedPill(userId);
      if (res.success) {
        actionNotice = isPt
          ? '💊 Vitamina de proteína ingerida! (+1 Força, +2g Peso)'
          : '💊 Protein capsule ingested! (+1 Strength, +2g Weight)';
        animState = 'attack';
        dialogueState = 'happy';
      } else {
        actionNotice = isPt
          ? '⚡ A força do seu Pymon já está no limite máximo!'
          : '⚡ Your Pymon strength is already at maximum!';
      }
    } else if (customId === 'vpet_clean') {
      const res = cleanPoop(userId);
      if (res.success) {
        actionNotice = isPt
          ? `🧹 Você varreu ${res.cleanedCount} sujeira(s)! O recinto está brilhando!`
          : `🧹 You swept ${res.cleanedCount} mess(es)! The room is sparkling clean!`;
        dialogueState = 'happy';
      } else {
        actionNotice = isPt ? '✨ O recinto já está perfeitamente limpo!' : '✨ The room is already spotless!';
      }
    } else if (customId === 'vpet_light') {
      const res = toggleLight(userId);
      if (res.success) {
        actionNotice = res.lightOff
          ? (isPt ? '💡 Luz apagada. Boa noite, Pymon!' : '💡 Lights turned off. Sweet dreams!')
          : (isPt ? '💡 Luz acesa. Bom dia, Pymon!' : '💡 Lights turned on. Rise and shine!');
      }
    } else if (customId === 'vpet_cure') {
      const res = curePet(userId);
      if (res.success) {
        actionNotice = isPt
          ? '💉 A injeção médica fez efeito imediato! Seu Pymon está curado!'
          : '💉 Medical injection took effect! Your Pymon is fully cured!';
        dialogueState = 'happy';
      } else {
        actionNotice = isPt ? '✨ Seu Pymon está saudável e não precisa de remédio.' : '✨ Your Pymon is healthy and does not need medicine.';
      }
    } else if (customId.startsWith('vpet_train') && !customId.startsWith('vpet_train_')) {
      const choiceRow = buildTrainingChoiceRow(lang);
      const notice = isPt
        ? '🥊 Escolha a direção do golpe de treino:'
        : '🥊 Choose strike direction for training:';
      const trainEmbed = buildVpetEmbed(pet, interaction.user, lang, { actionNotice: notice });
      return await safeUpdateInteraction(interaction, { embeds: [trainEmbed], components: [choiceRow], files: [] });
    } else if (customId.startsWith('vpet_train_')) {
      const dir = customId.replace('vpet_train_', '');
      const res = trainPet(userId, dir);
      if (res.success) {
        if (res.win) {
          actionNotice = isPt
            ? `🥊 Treino Perfeito! Acertou o golpe! (+${res.coinsWon}🪙, +${res.xpWon} XP, +1 Força, -2g Peso)`
            : `🥊 Perfect Training! Strike landed! (+${res.coinsWon}🪙, +${res.xpWon} XP, +1 Strength, -2g Weight)`;
          animState = 'attack';
          dialogueState = 'happy';
        } else {
          actionNotice = isPt
            ? `⚠️ O Pymon errou o tempo do golpe (alvo era ${res.targetDirection}). (+${res.coinsWon}🪙, +${res.xpWon} XP, -1g Peso)`
            : `⚠️ Pymon mistimed the strike (target was ${res.targetDirection}). (+${res.coinsWon}🪙, +${res.xpWon} XP, -1g Weight)`;
          animState = 'hit';
        }
      }
    } else if (customId.startsWith('vpet_spar')) {
      const sparRes = resolveSparring(pet, null, lang);
      pet.battlesCount = (pet.battlesCount || 0) + 1;

      // Credita moedas e XP na carteira e no pet
      updateUserAccount(userId, (acc) => {
        acc.coins = (Number(acc.coins) || 0) + sparRes.coinsWon;
      });
      awardPetXp(userId, sparRes.xpWon);

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
        actionNotice = isPt
          ? `🧬 INCRÍVEL! Seu Pymon evoluiu para **${evoRes.pet.species}**!`
          : `🧬 INCREDIBLE! Your Pymon evolved into **${evoRes.pet.species}**!`;
        animState = 'attack';
        dialogueState = 'happy';
      } else {
        actionNotice = isPt
          ? '🧬 Seu Pymon ainda não cumpre todos os requisitos de evolução.'
          : '🧬 Your Pymon does not yet meet all evolution requirements.';
      }
    } else if (customId === 'vpet_talk') {
      actionNotice = isPt ? '💬 Você fez carinho e conversou com seu Pymon!' : '💬 You stroked and chatted with your Pymon!';
      dialogueState = 'happy';
    } else if (customId === 'vpet_new') {
      return await handleNewPetOnboarding(interaction, interaction.user, lang, true);
    } else if (customId === 'vpet_back') {
      // Volta para tela principal
    }

    pet = getActiveVpet(userId);
    const updatedEmbed = buildVpetEmbed(pet, interaction.user, lang, {
      dialogueState,
      actionNotice,
      animState,
    });
    const updatedComponents = buildVpetActionRows(pet, lang, userId);

    await safeUpdateInteraction(interaction, { embeds: [updatedEmbed], components: updatedComponents, files: [] });
  } catch (err) {
    if (err.code === 10062 || err.code === 40060) return;
    console.error('[pymons] Error in processVpetInteraction:', err);
  }
}

async function safeUpdateInteraction(interaction, options) {
  try {
    if (interaction.replied || interaction.deferred) {
      return await interaction.editReply(options);
    }
    return await interaction.update(options);
  } catch (err) {
    if (err.code === 10062 || err.code === 40060) return;
    console.error('[pymons] safeUpdateInteraction error:', err);
  }
}

/**
 * Interface de Onboarding / Chocadeira inicial de Ovos Pymons
 */
async function handleNewPetOnboarding(context, user, lang, isUpdate = false) {
  const isInteraction = typeof context.isCommand === 'function' && context.isCommand() || context.isButton?.();

  const title = lang === 'pt' ? '🥚 Escolha seu Ovo Inicial Pymon' : '🥚 Choose your Starter Pymon Egg';
  const desc = lang === 'pt'
    ? 'Bem-vindo ao mundo dos Pymons da Pyxie!\nEscolha a essência do ovo para chocar o seu primeiro companheiro em pixel art:'
    : 'Welcome to the Pyxie Pymons world!\nChoose the egg essence to hatch your first pixel art companion:';

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
  if (isInteraction) {
    if (isUpdate) {
      await safeUpdateInteraction(context, replyOptions);
    } else if (context.deferred || context.replied) {
      await context.editReply(replyOptions);
    } else {
      await context.reply(replyOptions);
    }
  } else {
    await context.channel.send(replyOptions);
  }
}
