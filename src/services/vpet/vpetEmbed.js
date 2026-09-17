const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { STAGE_NAMES, getVpetSpecies, getVpetSpriteUrl, STAGES } = require('./vpetSpecies');
const { getVpetDialogue } = require('./vpetDialogues');
const { checkEvolution } = require('./vpetCore');
const { buildPymonHubHeader } = require('./vpetHub');

const ELEMENT_COLORS = {
  ORVALHO: '#00f5d4',
  BRISA: '#38bdf8',
  SILVESTRE: '#10b981',
  CHARME: '#f472b6',
  TRAVESSURA: '#a855f7',
};

function renderHearts(value, max = 4) {
  const full = Math.min(max, Math.max(0, value));
  const empty = max - full;
  return '♥'.repeat(full) + '·'.repeat(empty);
}

function buildVpetEmbed(pet, user, lang = 'pt', options = {}) {
  const { dialogueState, actionNotice, animState = 'idle' } = options;
  const spec = getVpetSpecies(pet.key);

  const stageName = STAGE_NAMES[pet.stage]?.[lang] || STAGE_NAMES[pet.stage]?.pt || 'Baby';
  const dialogue = getVpetDialogue(
    pet.key,
    dialogueState || (pet.isSick ? 'sick' : (pet.isSleeping ? 'sleepy' : (pet.hungerHearts <= 1 ? 'hungry' : (pet.poopCount >= 2 ? 'dirty' : 'idle')))),
    lang
  );

  const battles = pet.battlesCount || 0;
  const winRate = battles > 0 ? Math.round(((pet.battlesWon || 0) / battles) * 100) : 0;

  // Cor do Embed: se estiver dormindo com a luz apagada, fica azul noite
  let embedColor = ELEMENT_COLORS[spec.element] || '#f472b6';
  if (pet.isSleeping && pet.lightOff) {
    embedColor = '#0f172a';
  }

  const hungerBar = renderHearts(pet.hungerHearts || 0);
  const strengthBar = renderHearts(pet.strengthHearts || 0);

  const hygieneText = pet.poopCount === 0 
    ? (lang === 'pt' ? '✨ Limpo' : '✨ Clean')
    : `💩 x${pet.poopCount} (${lang === 'pt' ? (pet.isSick ? 'Doente' : 'Sujo') : (pet.isSick ? 'Sick' : 'Dirty')})`;

  const sleepText = pet.isSleeping
    ? (pet.lightOff 
        ? (lang === 'pt' ? '🌙 Dormindo (Luz Apagada)' : '🌙 Sleeping (Lights Out)')
        : (lang === 'pt' ? '💤 Dormindo (Luz Acesa ⚠️)' : '💤 Sleeping (Lights On ⚠️)'))
    : (lang === 'pt' ? '☀️ Acordado' : '☀️ Awake');

  const spriteUrl = getVpetSpriteUrl(pet.key, animState, pet.isSleeping, pet.lightOff);

  const titleHeader = `${pet.emoji} ${pet.name}  •  🐾 ${stageName}`;

  const descriptionLines = [
    `> 💬 *"${dialogue}"*`,
    '',
    `🍖 **${lang === 'pt' ? 'Fome' : 'Hunger'}:** \`[ ${hungerBar} ]\`  •  ⚖️ **${lang === 'pt' ? 'Peso' : 'Weight'}:** \`${pet.weight}g\``,
    `⚡ **${lang === 'pt' ? 'Força' : 'Strength'}:** \`[ ${strengthBar} ]\`  •  ⚠️ **${lang === 'pt' ? 'Falhas' : 'Mistakes'}:** \`${pet.careMistakes || 0}\``,
    `🧹 **${lang === 'pt' ? 'Higiene' : 'Hygiene'}:** ${hygieneText}  •  💤 **${lang === 'pt' ? 'Sono' : 'Sleep'}:** ${sleepText}`,
    `⚔️ **Sparring:** \`${pet.battlesWon || 0}V/${battles}L (${winRate}%)\`  •  🏋️ **${lang === 'pt' ? 'Treino' : 'Train'}:** \`${pet.trainCount || 0}\``,
  ];

  if (actionNotice) {
    descriptionLines.push('');
    descriptionLines.push(`> 📢 **${actionNotice}**`);
  }

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(titleHeader)
    .setDescription(descriptionLines.join('\n'))
    .setThumbnail(spriteUrl)
    .setFooter({
      text: lang === 'pt'
        ? `Pyxie Pymons • ID: ${pet.id}`
        : `Pyxie Pymons • ID: ${pet.id}`,
    });

  return embed;
}

function buildVpetActionRows(pet, lang = 'pt', userId = null) {
  const uid = userId || pet.userId || pet.ownerId || pet.id || 'me';
  const headerRow = buildPymonHubHeader(uid, 'pet', lang);
  const evoCheck = checkEvolution(pet);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('vpet_meat')
      .setLabel(lang === 'pt' ? 'Comer' : 'Feed')
      .setEmoji('🍖')
      .setStyle(ButtonStyle.Success)
      .setDisabled(pet.isSleeping && pet.lightOff),
    new ButtonBuilder()
      .setCustomId('vpet_pill')
      .setLabel(lang === 'pt' ? 'Vitamina' : 'Pill')
      .setEmoji('💊')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pet.isSleeping && pet.lightOff),
    new ButtonBuilder()
      .setCustomId('vpet_clean')
      .setLabel(lang === 'pt' ? 'Limpar' : 'Clean')
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pet.poopCount === 0),
    new ButtonBuilder()
      .setCustomId('vpet_light')
      .setLabel(lang === 'pt' ? (pet.lightOff ? 'Acender' : 'Apagar') : (pet.lightOff ? 'Light On' : 'Light Off'))
      .setEmoji('💡')
      .setStyle(pet.lightOff ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('vpet_cure')
      .setLabel(lang === 'pt' ? 'Remédio' : 'Cure')
      .setEmoji('💉')
      .setStyle(pet.isSick ? ButtonStyle.Danger : ButtonStyle.Secondary)
      .setDisabled(!pet.isSick)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('vpet_train')
      .setLabel(lang === 'pt' ? 'Treinar' : 'Train')
      .setEmoji('🏋️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled((pet.isSleeping && pet.lightOff) || pet.isSick),
    new ButtonBuilder()
      .setCustomId('vpet_spar')
      .setLabel(lang === 'pt' ? 'Batalha' : 'Spar')
      .setEmoji('⚔️')
      .setStyle(ButtonStyle.Danger)
      .setDisabled((pet.isSleeping && pet.lightOff) || pet.isSick),
    new ButtonBuilder()
      .setCustomId('vpet_evolve')
      .setLabel(lang === 'pt' ? 'Evoluir' : 'Evolve')
      .setEmoji('🧬')
      .setStyle(evoCheck.canEvolve ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(!evoCheck.canEvolve),
    new ButtonBuilder()
      .setCustomId('vpet_talk')
      .setLabel(lang === 'pt' ? 'Carinho' : 'Pet')
      .setEmoji('💬')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('vpet_new')
      .setLabel(lang === 'pt' ? 'Novo' : 'New')
      .setEmoji('🥚')
      .setStyle(ButtonStyle.Secondary)
  );

  return [headerRow, row1, row2];
}

function buildTrainingChoiceRow(lang = 'pt') {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('vpet_train_high')
      .setLabel(lang === 'pt' ? '⬆️ Golpe Alto' : '⬆️ High Strike')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('vpet_train_mid')
      .setLabel(lang === 'pt' ? '➡️ Golpe Médio' : '➡️ Mid Strike')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('vpet_train_low')
      .setLabel(lang === 'pt' ? '⬇️ Golpe Baixo' : '⬇️ Low Strike')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('vpet_back')
      .setLabel(lang === 'pt' ? 'Voltar' : 'Back')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  buildVpetEmbed,
  buildVpetActionRows,
  buildTrainingChoiceRow,
};

