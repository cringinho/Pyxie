const path = require('node:path');
const fs = require('node:fs');
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
  RELICS,
  ENGINEER_RECIPES,
  TIER_NEGOTIATION_RULES,
  gloomGraph,
  getGloomTide,
  getGloomUser,
  forage,
  negotiateSpirit,
  leaveTrace,
  getTraces,
  getBossStatus,
  attackBoss,
  isLocationBanned,
  checkMapTravelCooldown,
  buyMerchantRelic,
  upgradeRelicsWithEngineer,
} = require('../services/gloomRealm');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { getEmoji } = require('../utils/appEmojis');

const LOCATION_EMOJIS = {
  portao_penumbra: 'PORTAL',
  floresta_sussurros: 'TREE',
  cemiterio_espinhos: 'SKULL',
  pantano_lagrimas: 'MUSHROOM',
  biblioteca_esquecida: 'BOOK',
  mausoleu_ancestral: 'BAT',
  ponte_abismo: 'ARROW',
  catacumba_sangue_roxo: 'ZOMBIE',
  jardim_fadas_negras: 'FAIRY',
  santuario_touca_preta: 'CROWN',
};

const FORAGE_COIN_MESSAGES = {
  pt: [
    '✨ Entre raízes orvalhadas e musgo violeta, você desencavou **+{coins} Phantom Coins 👻**!',
    '🍃 Uma rajada de vento gélido soprou as folhas secas, revelando **+{coins} Phantom Coins 👻**!',
    '🪵 Ao investigar o interior de um tronco oco carcomido, você resgatou **+{coins} Phantom Coins 👻**!',
    '🔮 Sussurros etéreos guiaram seus passos até uma fenda úmida com **+{coins} Phantom Coins 👻**!',
    '🪦 Você removeu uma lápide tombada e encontrou um brilho arroxeado: **+{coins} Phantom Coins 👻**!',
    '🍄 Debaixo de um círculo de cogumelos luminescentes, repousavam **+{coins} Phantom Coins 👻**!',
    '👣 Seguindo pegadas fantasmagóricas no lodo, você desenterrou **+{coins} Phantom Coins 👻**!',
    '🌫️ Uma bruma repentina se dissipou, deixando para trás **+{coins} Phantom Coins 👻** cintilantes!',
    '🌿 Você tateou entre pedras frias cobertas de hera e pescou **+{coins} Phantom Coins 👻**!',
    '🗝️ Gotas de orvalho caíram sobre um cofre enferrujado contendo **+{coins} Phantom Coins 👻**!',
    '🪶 Um corvo de olhos violeta bicou o solo e voou, abandonando **+{coins} Phantom Coins 👻**!',
    '👢 Remexendo a terra escura com a ponta da bota, você topou com **+{coins} Phantom Coins 👻**!',
    '🥀 Atrás de uma cortina de trepadeiras com espinhos negros, você achou **+{coins} Phantom Coins 👻**!',
    '💧 Ao iluminar o fundo de uma poça de água estagnada, você pescou **+{coins} Phantom Coins 👻**!',
    '🌙 Um aroma doce de flores noturnas revelou uma fresta com **+{coins} Phantom Coins 👻**!',
  ],
  en: [
    '✨ Between dewy roots and violet moss, you unearthed **+{coins} Phantom Coins 👻**!',
    '🍃 A chill gust swept dry leaves aside, unveiling **+{coins} Phantom Coins 👻**!',
    '🪵 Peering into a hollow rotted log, you retrieved **+{coins} Phantom Coins 👻**!',
    '🔮 Ethereal whispers guided your steps to a damp crevice containing **+{coins} Phantom Coins 👻**!',
    '🪦 Prying away a fallen tombstone, you found a purple gleam: **+{coins} Phantom Coins 👻**!',
    '🍄 Beneath a fairy ring of glowing mushrooms lay **+{coins} Phantom Coins 👻**!',
    '👣 Tracking spectral footprints in the mud, you dug up **+{coins} Phantom Coins 👻**!',
    '🌫️ A sudden fog dissolved, leaving behind **+{coins} glittering Phantom Coins 👻**!',
    '🌿 Groping between cold ivy-clad stones, you fished out **+{coins} Phantom Coins 👻**!',
    '🗝️ Dewdrops dripped over a rusted lockbox holding **+{coins} Phantom Coins 👻**!',
    '🪶 A violet-eyed raven pecked the dirt and took flight, abandoning **+{coins} Phantom Coins 👻**!',
    '👢 Stirring the dark loam with your boot tip, you kicked up **+{coins} Phantom Coins 👻**!',
    '🥀 Behind a curtain of black-thorn vines, you discovered **+{coins} Phantom Coins 👻**!',
    '💧 Shining light into a still, brackish puddle, you scooped up **+{coins} Phantom Coins 👻**!',
    '🌙 A sweet scent of nightshade revealed a forgotten hollow containing **+{coins} Phantom Coins 👻**!',
  ],
};

const FORAGE_ITEM_MESSAGES = {
  pt: [
    '📦 Você vasculhou os escombros e encontrou **1x {item}**!',
    '🎒 Preso entre galhos retorcidos, você resgatou **1x {item}**!',
    '🏺 No fundo de uma cavidade sombria repousava **1x {item}**!',
  ],
  en: [
    '📦 You searched through the rubble and discovered **1x {item}**!',
    '🎒 Tangled among twisted briars, you retrieved **1x {item}**!',
    '🏺 Resting at the bottom of a shadowy recess was **1x {item}**!',
  ],
};

function getForageSuccessCoinsText(coins, source = null) {
  const lang = getLanguage(source);
  const list = FORAGE_COIN_MESSAGES[lang] || FORAGE_COIN_MESSAGES.en;
  const tpl = list[Math.floor(Math.random() * list.length)];
  return tpl.replace('{coins}', coins);
}

function getForageSuccessItemText(itemName, source = null) {
  const lang = getLanguage(source);
  const list = FORAGE_ITEM_MESSAGES[lang] || FORAGE_ITEM_MESSAGES.en;
  const tpl = list[Math.floor(Math.random() * list.length)];
  return tpl.replace('{item}', itemName);
}

function buildRelicsView(userId, source = null) {
  const user = getGloomUser(userId);
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const userRelics = Object.entries(user.inventory || {})
    .filter(([id, count]) => count > 0 && RELICS[id]);

  let desc = '';
  if (userRelics.length === 0) {
    desc = isEn
      ? '🏺 *You have not acquired any dark relics yet. Scavenge the Grove or visit the traveling merchant to unearth ancient artifacts!*'
      : '🏺 *Você ainda não possui relíquias sombrias. Vasculhe o Bosque ou encontre o mercador para desenterrar artefatos ancestrais!*';
  } else {
    const lines = [];
    for (let tier = 1; tier <= 5; tier++) {
      const items = userRelics.filter(([id]) => (RELICS[id]?.tier || 1) === tier);
      if (items.length > 0) {
        lines.push(`**⭐ Tier ${tier}:**`);
        for (const [id, count] of items) {
          const r = RELICS[id];
          const name = isEn ? r.name.en : r.name.pt;
          const rDesc = isEn ? r.desc.en : r.desc.pt;
          lines.push(`> • 🏺 **${name}** (x${count})\n>   *« ${rDesc} »*`);
        }
      }
    }
    desc = lines.join('\n');
  }

  const tip = isEn
    ? '\n\n💡 *Relics cannot be sold in the shop. They can be traded with other players via `/py-trade` or upgraded at the Relic Engineer!*'
    : '\n\n💡 *Relíquias não podem ser vendidas na loja. Elas podem ser negociadas com outros jogadores via `/py-trade` ou aprimoradas no Engenheiro de Relíquias!*';

  const embed = new EmbedBuilder()
    .setColor('#a855f7')
    .setTitle(isEn ? '🏺  ✦  Grove Relics Collection' : '🏺  ✦  Coleção de Relíquias do Bosque')
    .setDescription(desc + tip)
    .setFooter({ text: pyxieFooter(isEn ? 'Pyxie • Relic Vault' : 'Pyxie • Cofre de Relíquias', source) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:view:${userId}`)
      .setLabel(isEn ? 'Back to Grove' : 'Voltar ao Bosque')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}

function buildLocationView(userId, guildId, source = null, feedbackMessage = '') {
  const user = getGloomUser(userId);
  const banStatus = isLocationBanned(user, user.currentLocation);
  if (banStatus.banned) {
    user.currentLocation = 'portao_penumbra';
    const { updateGloomUser } = require('../services/gloomRealm');
    updateGloomUser(userId, { currentLocation: 'portao_penumbra' });
    const banMsg = t('gloom.explore.roomBanned', source, { time: banStatus.remainingMinutes });
    feedbackMessage = feedbackMessage ? `${banMsg}\n\n${feedbackMessage}` : banMsg;
  }

  const location = gloomGraph.getLocation(user.currentLocation);
  const tide = getGloomTide();
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const imagePath = path.join(__dirname, '..', '..', 'assets', 'locations', location.image);
  const attachment = new AttachmentBuilder(imagePath, { name: location.image });

  const locationName = isEn ? location.name.en : location.name.pt;
  const locationDesc = isEn ? location.desc.en : location.desc.pt;
  const tideName = isEn ? tide.name.en : tide.name.pt;


  const dangerText = t('gloom.explore.dangerLevel', source, {
    tier: 'T' + (location.tier || 1) + ' ' + '<:skull:1551356384451493968>'.repeat(location.tier || 1),
    banMinutes: location.banMinutes || 30,
  });

  const embed = new EmbedBuilder()
    .setColor(tide.color || PYXIE_COLORS.purple)
    .setTitle(t('gloom.explore.title', source, { emoji: '🌙', name: locationName, tide: tideName }))
    .setDescription(
      `${feedbackMessage ? `**${feedbackMessage}**\n\n` : ''}` +
      `*« ${locationDesc} »*\n\n` +
      `${dangerText}\n\n` +
      `${t('gloom.explore.stamina', source, { current: user.energy, max: 10 })}\n\n` +
      `${t('gloom.explore.phantomCoins', source, { coins: user.phantomCoins })}\n\n` +
      `${t('gloom.explore.tideLabel', source, { tide: tideName })}`
    )
    .setImage(`attachment://${location.image}`)
    .setFooter({ text: pyxieFooter(t('gloom.footer', source), source) })
    .setTimestamp();

  if (feedbackMessage) {
    embed.addFields({
      name: isEn ? '🔍 Exploration & Search Result' : '🔍 Resultado da Exploração',
      value: feedbackMessage,
      inline: false,
    });
  }

  // Linha 1: Ações Principais
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:forage:${userId}`)
      .setLabel(t('gloom.explore.btnForage', source, { cost: 1 }))
      .setEmoji(getEmoji('MUSHROOM'))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(user.energy <= 0),
    new ButtonBuilder()
      .setCustomId(`gloom:grimoire:${userId}`)
      .setLabel(t('gloom.explore.btnGrimoire', source, { count: (user.grimoire || []).length }))
      .setEmoji(getEmoji('BOOK'))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`gloom:relics:${userId}`)
      .setLabel(t('gloom.explore.btnRelics', source))
      .setEmoji('🏺')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`gloom:boss:${userId}`)
      .setLabel(t('gloom.explore.btnBoss', source))
      .setEmoji('☠️')
      .setStyle(ButtonStyle.Danger)
  );

  // Linha 2: Botões Direcionais de Navegação com Emojis Contextuais e Tiers
  const neighbors = gloomGraph.getAvailableNeighbors(location.id, user, tide);
  const navButtons = neighbors.slice(0, 4).map((n) => {
    const destName = isEn ? n.location.name.en : n.location.name.pt;
    const locEmojiKey = 'MAP';
    const btn = new ButtonBuilder()
      .setCustomId(`gloom:move:${userId}:${n.location.id}`)
      .setLabel(`${destName} (T${n.location.tier})`.slice(0, 80))
      .setStyle(n.canEnter ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(!n.canEnter)
      .setEmoji(getEmoji(locEmojiKey));

    if (n.reason === 'banned') {
      btn.setEmoji(getEmoji('ALERT'));
      btn.setStyle(ButtonStyle.Danger);
      btn.setLabel(`${destName} (T${n.location.tier}) [${n.banRemainingMinutes}m]`.slice(0, 80));
    } else if (!n.canEnter) {
      btn.setEmoji('🔒');
    }
    return btn;
  });

  // Inclui acesso direto à Câmara do Colosso (Chefe) na linha de locomoção
  if (navButtons.length < 5) {
    navButtons.push(
      new ButtonBuilder()
        .setCustomId(`gloom:boss:${userId}`)
        .setLabel(isEn ? 'Boss Chamber' : 'Câmara do Colosso')
        .setEmoji('☠️')
        .setStyle(ButtonStyle.Danger)
    );
  }

  const components = [actionRow];
  if (navButtons.length > 0) {
    components.push(new ActionRowBuilder().addComponents(navButtons));
  }

  return { embeds: [embed], files: [attachment], components };
}

function buildNegotiationView(
  userId,
  spirit,
  source = null,
  encounter = null,
  phase = 1,
  currentScore = 0,
  neutralsCount = 0,
  lastReaction = null,
  canBailout = false,
  bailoutCost = 0
) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const user = getGloomUser(userId);

  const spiritName = encounter
    ? (isEn ? encounter.creature_concept?.en : encounter.creature_concept?.pt)
    : (isEn ? spirit?.name?.en : spirit?.name?.pt);

  const tier = encounter?.tier || spirit?.tier || 1;
  const rules = TIER_NEGOTIATION_RULES[tier] || TIER_NEGOTIATION_RULES[1];
  const totalRounds = encounter ? rules.rounds : 1;
  const targetScore = encounter ? rules.targetScore : 1;

  const encounterTag = encounter?.id || 'none';
  const spiritTag = spirit?.id || 'errante';

  // Resolução da Imagem / GIF do Monstro
  const candidateIds = [
    spirit?.id,
    spiritTag,
    encounter?.monster_id,
    encounter?.id,
  ].filter(Boolean);

  let spiritImageName = null;
  if (spirit && spirit.image) {
    spiritImageName = path.basename(spirit.image);
  }

  if (!spiritImageName) {
    for (const cid of candidateIds) {
      if (SPIRITS[cid]?.image) {
        spiritImageName = path.basename(SPIRITS[cid].image);
        break;
      }
      if (cid && cid !== 'errante' && cid !== 'none') {
        const potentialName = cid.endsWith('.gif') ? cid : `${cid}.gif`;
        const p1 = path.join(__dirname, '..', '..', 'assets', 'spirits', potentialName);
        const p2 = path.join(__dirname, '..', '..', 'public', 'assets', 'spirits', potentialName);
        if (fs.existsSync(p1) || fs.existsSync(p2)) {
          spiritImageName = potentialName;
          break;
        }
      }
    }
  }

  let spiritAttachment = null;
  if (spiritImageName) {
    const p1 = path.join(__dirname, '..', '..', 'assets', 'spirits', spiritImageName);
    const p2 = path.join(__dirname, '..', '..', 'public', 'assets', 'spirits', spiritImageName);
    const imagePath = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);
    if (imagePath) {
      spiritAttachment = new AttachmentBuilder(imagePath, { name: spiritImageName });
    }
  }

  // Se for o caso especial de Resgate Extorsivo (Bailout)
  if (canBailout) {
    const descParts = [];
    if (lastReaction) {
      descParts.push(`> 🗣️ *« "${lastReaction}" »*\n`);
    }
    descParts.push(t('gloom.negotiate.bailoutOffer', source, { cost: bailoutCost }));
    descParts.push(`\n🪙 ${t('gloom.explore.phantomCoins', source, { coins: user.phantomCoins })}`);

    const embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.gold || '#f59e0b')
      .setTitle(`💸  ✦  ${t('gloom.negotiate.btnBailout', source, { cost: bailoutCost })}`)
      .setDescription(descParts.join('\n'))
      .setFooter({ text: t('gloom.negotiate.footer', source) })
      .setTimestamp();

    if (spiritAttachment) {
      embed.setThumbnail(`attachment://${spiritImageName}`);
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`gloom:bailout:${userId}:${encounterTag}:${spiritTag}:${bailoutCost}`)
        .setLabel(t('gloom.negotiate.btnBailout', source, { cost: bailoutCost }))
        .setEmoji(getEmoji('COIN_PURPLE'))
        .setStyle(ButtonStyle.Success)
        .setDisabled(user.phantomCoins < bailoutCost),
      new ButtonBuilder()
        .setCustomId(`gloom:flee:${userId}`)
        .setLabel(t('gloom.negotiate.btnFlee', source))
        .setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row], files: spiritAttachment ? [spiritAttachment] : [] };
  }

  // Diálogo & Cenário da Fase Atual
  let question = encounter
    ? (isEn ? encounter.monster_dialogue?.en : encounter.monster_dialogue?.pt)
    : (isEn ? spirit?.dialogue?.question?.en : spirit?.dialogue?.question?.pt);

  if (encounter && Array.isArray(encounter.phases) && encounter.phases[phase - 1]) {
    const ph = encounter.phases[phase - 1];
    const phQ = isEn ? (ph.question?.en || ph.monster_dialogue?.en) : (ph.question?.pt || ph.monster_dialogue?.pt);
    if (phQ) question = phQ;
  }

  const sceneText = encounter
    ? (isEn ? encounter.text_box_scene?.en : encounter.text_box_scene?.pt)
    : null;

  const moodNote = encounter
    ? (isEn ? encounter.mood_note?.en : encounter.mood_note?.pt)
    : null;

  const descParts = [];
  if (lastReaction) {
    descParts.push(`> 🗣️ *« "${lastReaction}" »*\n`);
  }
  if (sceneText) {
    descParts.push(`*« ${sceneText} »*\n`);
  }
  descParts.push(`> 💬 **"${question}"**`);
  if (moodNote) {
    descParts.push(`> 🎭 *${moodNote}*`);
  }

  const tensionBoxes = [];
  for (let i = 1; i <= targetScore; i++) {
    tensionBoxes.push(currentScore >= i ? '🟩' : '⬜');
  }
  const tensionLine = `🎭 **Tensão & Afinidade:** [${tensionBoxes.join('')}] (${currentScore}/${targetScore} pts) • **Fase ${phase}/${totalRounds}** (T${tier})`;
  descParts.push(`\n${tensionLine}`);
  descParts.push(`🪙 ${t('gloom.explore.phantomCoins', source, { coins: user.phantomCoins })}`);

  // Opções de Diálogo da Fase
  let choices = (encounter && Array.isArray(encounter.options))
    ? encounter.options
    : (spirit?.dialogue?.choices || []);
  if (encounter && Array.isArray(encounter.phases) && encounter.phases[phase - 1]?.options) {
    choices = encounter.phases[phase - 1].options;
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const shuffledChoices = shuffleArray(choices.slice(0, 3));
  const letters = ['A', 'B', 'C'];

  const choicesText = shuffledChoices.map((c, i) => {
    const rawLabel = isEn ? (c.text?.en || c.label?.en) : (c.text?.pt || c.label?.pt);
    return `**[ ${letters[i]} ]** 💬 *« ${rawLabel || '...'} »*`;
  }).join('\n\n');

  descParts.push(`\n${choicesText}`);

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.neonPink)
    .setTitle(t('gloom.negotiate.title', source, { name: spiritName }))
    .setFooter({ text: pyxieFooter(t('gloom.negotiate.footer', source), source) })
    .setTimestamp();

  if (spiritAttachment) {
    embed.setThumbnail(`attachment://${spiritImageName}`);
  }

  const choiceButtons = shuffledChoices.map((c, i) => {
    return new ButtonBuilder()
      .setCustomId(`gloom:c:${userId}:${encounterTag}:${spiritTag}:${c.id}:${phase}:${currentScore}:${neutralsCount}`)
      .setLabel(`[ ${letters[i]} ]`)
      .setStyle(ButtonStyle.Primary);
  });

  const row1 = new ActionRowBuilder().addComponents(choiceButtons);

  // Botão de Extorsão / Tributo Hardcore
  let bribeBtn;
  const bribeCost = rules.baseBribe;

  if (tier === 4) {
    bribeBtn = new ButtonBuilder()
      .setCustomId(`gloom:bribe:${userId}:${spiritTag}:${encounterTag}`)
      .setLabel(`${t('gloom.negotiate.demandCoins', source, { cost: bribeCost })} + 3⚡`)
      .setEmoji(getEmoji('COIN_PURPLE'))
      .setStyle(ButtonStyle.Success)
      .setDisabled(user.phantomCoins < bribeCost || (user.energy || 0) < 3);
  } else if (tier === 5) {
    const hasT4orT5Relic = user.inventory && Object.keys(user.inventory).some(
      (rId) => (user.inventory[rId] > 0) && (RELICS[rId]?.tier === 4 || RELICS[rId]?.tier === 5)
    );
    const relicLabel = isEn ? 'Relic T4/T5' : 'Relíquia T4/T5';
    bribeBtn = new ButtonBuilder()
      .setCustomId(`gloom:bribe:${userId}:${spiritTag}:${encounterTag}`)
      .setLabel(`${t('gloom.negotiate.demandCoins', source, { cost: bribeCost })} + 100%⚡ + ${relicLabel}`)
      .setEmoji(getEmoji('COIN_PURPLE'))
      .setStyle(ButtonStyle.Success)
      .setDisabled(user.phantomCoins < bribeCost || !hasT4orT5Relic);
  } else {
    bribeBtn = new ButtonBuilder()
      .setCustomId(`gloom:bribe:${userId}:${spiritTag}:${encounterTag}`)
      .setLabel(t('gloom.negotiate.btnBribe', source, { cost: bribeCost }))
      .setEmoji(getEmoji('COIN_PURPLE'))
      .setStyle(ButtonStyle.Success)
      .setDisabled(user.phantomCoins < bribeCost);
  }

  const row2 = new ActionRowBuilder().addComponents(
    bribeBtn,
    new ButtonBuilder()
      .setCustomId(`gloom:flee:${userId}`)
      .setLabel(t('gloom.negotiate.btnFlee', source))
      .setEmoji('🏃')
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row1, row2], files: spiritAttachment ? [spiritAttachment] : [] };
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
      `${t('gloom.boss.yourDamage', source, { damage: participant.damageDealt })}\n` +
      `🪙 ${t('gloom.explore.phantomCoins', source, { coins: user.phantomCoins })}`
    )
    .setFooter({ text: t('gloom.boss.footer', source) })
    .setTimestamp();

  const buttons = [];

  if (boss.defeatedInCycle || boss.currentHp <= 0) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`gloom:boss_defeated_btn:${userId}`)
        .setLabel(isEn ? 'Behemoth Pacified!' : 'Colosso Apaziguado!')
        .setEmoji(getEmoji('TROPHY'))
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
    );
  } else if (canFreeAttack) {
    const attackLabel = participant.extraUnlocked
      ? t('gloom.boss.btnAttackExtra', source)
      : t('gloom.boss.btnAttack', source);
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`gloom:boss_attack:${userId}`)
        .setLabel(attackLabel)
        .setEmoji(getEmoji('PURPLE_FLAME'))
        .setStyle(ButtonStyle.Danger)
    );
  } else {
    // Botão web de 10s via bonusTimer + Botão de atualizar após assistir
    const { createBonusSession } = require('../services/bonusTimer');
    const session = createBonusSession(userId, 'gloom_boss', {}, lang);
    buttons.push(
      new ButtonBuilder()
        .setLabel(t('gloom.boss.btnWebBonus', source))
        .setEmoji(getEmoji('GIFT'))
        .setStyle(ButtonStyle.Link)
        .setURL(session.url),
      new ButtonBuilder()
        .setCustomId(`gloom:boss_refresh:${userId}`)
        .setLabel(t('gloom.boss.btnRefresh', source))
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Success)
    );
  }

  buttons.push(
    new ButtonBuilder()
      .setCustomId(`gloom:view:${userId}`)
      .setLabel(t('gloom.grimoire.btnBack', source))
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(buttons)] };
}

function buildMerchantView(userId, stock, source = null, feedbackMessage = '') {
  const user = getGloomUser(userId);
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const stockIds = stock.map((relic) => relic.id).join(',');

  const embed = new EmbedBuilder()
    .setColor('#f59e0b')
    .setTitle(t('gloom.merchant.title', source))
    .setDescription(
      `${feedbackMessage ? `**${feedbackMessage}**\n\n` : ''}` +
      `${t('gloom.merchant.desc', source)}\n\n` +
      `${t('gloom.merchant.phantomCoins', source, { coins: user.phantomCoins })}\n\n` +
      `${t('gloom.merchant.stockHeader', source)}\n` +
      stock.map((relic) => {
        const rName = isEn ? relic.name.en : relic.name.pt;
        const rDesc = isEn ? relic.desc.en : relic.desc.pt;
        return `> 🏺 **${rName}** (Tier ${relic.tier}) — \`${relic.cost}👻\`\n> *« ${rDesc} »*`;
      }).join('\n\n')
    )
    .setFooter({ text: t('gloom.merchant.footer', source) })
    .setTimestamp();

  const buyButtons = stock.map((relic) => {
    const rName = isEn ? relic.name.en : relic.name.pt;
    return new ButtonBuilder()
      .setCustomId(`gloom:merchant_buy:${userId}:${relic.id}:${stockIds}`)
      .setLabel(t('gloom.merchant.btnBuy', source, { item: rName.slice(0, 50), cost: relic.cost }).slice(0, 80))
      .setEmoji(getEmoji('COIN_PURPLE'))
      .setStyle(ButtonStyle.Success)
      .setDisabled(user.phantomCoins < relic.cost);
  });

  const row1 = new ActionRowBuilder().addComponents(buyButtons);
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:view:${userId}`)
      .setLabel(t('gloom.merchant.btnBack', source))
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2] };
}

function buildEngineerView(userId, source = null, feedbackMessage = '') {
  const user = getGloomUser(userId);
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  user.inventory = user.inventory || {};
  const countsByTier = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const [itemId, count] of Object.entries(user.inventory)) {
    if (count > 0 && RELICS[itemId]) {
      countsByTier[RELICS[itemId].tier] = (countsByTier[RELICS[itemId].tier] || 0) + count;
    }
  }

  const rates = { 1: 100, 2: 100, 3: 75, 4: 50 };
  const recipeLines = [1, 2, 3, 4].map((tier) => {
    const nextTier = tier + 1;
    const cost = ENGINEER_RECIPES[tier].cost;
    const rate = rates[tier];
    return t('gloom.engineer.recipeLine', source, { tier, nextTier, cost, rate });
  }).join('\n');

  const myRelicsText = t('gloom.engineer.myRelics', source, {
    t1: countsByTier[1],
    t2: countsByTier[2],
    t3: countsByTier[3],
    t4: countsByTier[4],
    t5: countsByTier[5],
  });

  const embed = new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle(t('gloom.engineer.title', source))
    .setDescription(
      `${feedbackMessage ? `**${feedbackMessage}**\n\n` : ''}` +
      `${t('gloom.engineer.desc', source)}\n\n` +
      `${t('gloom.engineer.phantomCoins', source, { coins: user.phantomCoins })}\n` +
      `${myRelicsText}\n\n` +
      `${t('gloom.engineer.recipesHeader', source)}\n` +
      recipeLines
    )
    .setFooter({ text: t('gloom.engineer.footer', source) })
    .setTimestamp();

  const upgradeButtons = [1, 2, 3, 4].map((tier) => {
    const cost = ENGINEER_RECIPES[tier].cost;
    const canAfford = user.phantomCoins >= cost;
    const hasMaterials = countsByTier[tier] >= 2;
    return new ButtonBuilder()
      .setCustomId(`gloom:engineer_upgrade:${userId}:${tier}`)
      .setLabel(t('gloom.engineer.btnUpgrade', source, { tier, cost }))
      .setEmoji(getEmoji('SPARKLES'))
      .setStyle(tier >= 3 ? ButtonStyle.Danger : ButtonStyle.Primary)
      .setDisabled(!canAfford || !hasMaterials);
  });

  const row1 = new ActionRowBuilder().addComponents(upgradeButtons);
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:view:${userId}`)
      .setLabel(t('gloom.engineer.btnBack', source))
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2] };
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

  // 1. Forrageamento / Vasculhar
  if (action === 'forage') {
    const user = getGloomUser(interaction.user.id);
    const result = forage(interaction.user.id, user.currentLocation);

    if (!result.success) {
      if (result.reason === 'room_banned') {
        return interaction.reply({
          content: t('gloom.explore.roomBanned', interaction, { time: result.banRemainingMinutes }),
          ephemeral: true,
        });
      }
      return interaction.reply({
        content: t('gloom.explore.forageNoEnergy', interaction, { time: result.timeRemainingSec }),
        ephemeral: true,
      });
    }

    // Feedback de loot (moedas ou itens vasculhados)
    let lootFeedback = '';
    if (result.rewardCoins > 0) {
      lootFeedback = getForageSuccessCoinsText(result.rewardCoins, interaction);
    } else if (result.rewardItem) {
      const itemName = isEn ? result.rewardItem.name.en : result.rewardItem.name.pt;
      lootFeedback = getForageSuccessItemText(itemName, interaction);
    }

    if (result.openedRarePortal) {
      lootFeedback += `\n${t('gloom.explore.portalOpened', interaction)}`;
    }

    // Eventos Raros ao Vasculhar (configurados em explorationEvents.json)
    if (result.rareEvent) {
      if (result.rareEvent.type === 'wild_horse_saddle') {
        const horseMsg = isEn
          ? '🐎 **Wild Horse Encounter!** You encountered a wild horse in the grove and received a **Horse Saddle (T2) 🐎** in your backpack!'
          : '🐎 **Cavalo Selvagem Encontrado!** Você se deparou com um cavalo no bosque e recebeu uma **Sela de Cavalo (T2) 🐎** na sua mochila!';
        lootFeedback = lootFeedback ? `${horseMsg}\n\n${lootFeedback}` : horseMsg;
      } else if (result.rareEvent.type === 'relic_merchant') {
        await interaction.deferUpdate();
        const merchView = buildMerchantView(interaction.user.id, result.rareEvent.stock, interaction, lootFeedback);
        return interaction.editReply(merchView);
      } else if (result.rareEvent.type === 'relic_engineer') {
        await interaction.deferUpdate();
        const engView = buildEngineerView(interaction.user.id, interaction, lootFeedback);
        return interaction.editReply(engView);
      }
    }

    if (result.encounteredSpirit) {
      await interaction.deferUpdate();
      const negView = buildNegotiationView(interaction.user.id, result.encounteredSpirit, interaction, result.encounteredEncounter);
      return interaction.editReply(negView);
    }

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, lootFeedback);
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
      const reasonText = reasonKey === 'banned'
        ? t('gloom.explore.reasons.banned', interaction, { time: targetNeighbor?.banRemainingMinutes || 30 })
        : (t(`gloom.explore.reasons.${reasonKey}`, interaction) || 'Bloqueado.');
      return interaction.reply({
        content: t('gloom.explore.travelLocked', interaction, { reason: reasonText }),
        ephemeral: true,
      });
    }

    // Validação de Cooldown de Viagem de 10 min
    const travelStatus = checkMapTravelCooldown(user);
    if (!travelStatus.canTravel) {
      return interaction.reply({
        content: isEn
          ? `⏳ **Travel Fatigue!** Please wait **${travelStatus.remainingMinutes} min** before changing maps again, or use a **Horse Saddle 🐎 / Wings 🪽** in your backpack to bypass this cooldown!`
          : `⏳ **Fadiga de Viagem!** Aguarde **${travelStatus.remainingMinutes} min** para trocar de mapa novamente, ou use uma **Sela de Cavalo 🐎 / Asas 🪽** na sua mochila para anular este tempo!`,
        ephemeral: true,
      });
    }

    user.currentLocation = destId;
    user.lastMapMoveAt = Date.now();
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

  // 3. Escolha de Diálogo na Negociação SMT Hardcore
  if (action === 'c' || action === 'choice') {
    let encounterTag, spiritTag, choiceId, phase, currentScore, neutralsCount;
    if (action === 'c') {
      encounterTag = parts[3] !== '0' && parts[3] !== 'none' ? parts[3] : null;
      spiritTag = parts[4] !== '0' && parts[4] !== 'errante' ? parts[4] : null;
      choiceId = parts[5];
      phase = parseInt(parts[6], 10) || 1;
      currentScore = parseInt(parts[7], 10) || 0;
      neutralsCount = parseInt(parts[8], 10) || 0;
    } else {
      spiritTag = parts[3] !== '0' && parts[3] !== 'errante' ? parts[3] : null;
      choiceId = parts[4];
      encounterTag = parts[5] && parts[5] !== 'none' ? parts[5] : null;
      phase = 1;
      currentScore = 0;
      neutralsCount = 0;
    }

    const result = negotiateSpirit(
      interaction.user.id,
      spiritTag,
      choiceId,
      false,
      encounterTag,
      phase,
      currentScore,
      neutralsCount
    );
    const spiritName = isEn
      ? (result.spirit?.name?.en || result.spirit?.name)
      : (result.spirit?.name?.pt || result.spirit?.name);

    const reactionObj = result.recruited
      ? (result.choice?.success_dialogue || result.choice?.monster_reaction)
      : (result.choice?.failure_dialogue || result.choice?.monster_reaction);
    const rawReaction = reactionObj
      ? (isEn ? (reactionObj.en || reactionObj.pt) : (reactionObj.pt || reactionObj.en))
      : null;
    const reactionPrefix = rawReaction ? `> 🗣️ *« "${rawReaction}" »*\n\n` : '';

    if (result.inProgress) {
      await interaction.deferUpdate();
      const nextView = buildNegotiationView(
        interaction.user.id,
        result.spirit,
        interaction,
        result.encounter,
        result.nextPhase,
        result.currentScore,
        result.neutralsCount,
        rawReaction
      );
      return interaction.editReply(nextView);
    }

    if (result.canBailout) {
      await interaction.deferUpdate();
      const bailoutView = buildNegotiationView(
        interaction.user.id,
        result.spirit,
        interaction,
        result.encounter,
        result.targetScore,
        result.finalScore,
        0,
        rawReaction,
        true,
        result.bailoutCost
      );
      return interaction.editReply(bailoutView);
    }

    let text = '';
    if (result.recruited) {
      text = reactionPrefix + t('gloom.negotiate.successWit', interaction, { spirit: spiritName, coins: result.rewardCoins });
      if (result.isDuplicate) {
        text += '\n\n' + t('gloom.negotiate.duplicateEssence', interaction, { coins: result.duplicateBonus });
      }
    } else if (result.criticalFailure) {
      const loc = LOCATIONS[result.bannedLocation] || LOCATIONS.portao_penumbra;
      const locName = isEn ? loc.name.en : loc.name.pt;
      text = reactionPrefix;
      if (result.isSycophancy) {
        text += t('gloom.negotiate.sycophancyPenalty', interaction, { stolen: result.theftCoins }) + '\n\n';
      }
      if (result.hesitationDecay) {
        text += t('gloom.negotiate.hesitationPenalty', interaction) + '\n\n';
      }
      text += t('gloom.negotiate.criticalFailure', interaction, { location: locName, time: result.banDurationMinutes });
      if (result.ejectionFine > 0) {
        text += `\n${t('gloom.negotiate.ejectionFine', interaction, { fine: result.ejectionFine })}`;
      }
    } else {
      text = reactionPrefix + t('gloom.negotiate.failed', interaction, { spirit: spiritName });
    }

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, text);
    return interaction.editReply(locView);
  }

  // 3.1 Compra com o Comerciante de Relíquias
  if (action === 'merchant_buy') {
    const relicId = parts[3];
    const encodedStock = parts[4] || '';
    const result = buyMerchantRelic(interaction.user.id, relicId);
    let feedback = '';
    if (result.success) {
      const rName = isEn ? result.relic.name.en : result.relic.name.pt;
      feedback = t('gloom.merchant.buySuccess', interaction, { item: rName, cost: result.relic.cost });
    } else {
      feedback = t('gloom.merchant.insufficientCoins', interaction, { cost: result.cost || 0 });
    }
    await interaction.deferUpdate();

    const remainingStockIds = encodedStock.split(',').filter((id) => id && id !== relicId);
    const remainingStock = remainingStockIds.map((id) => RELICS[id]).filter(Boolean);

    if (result.success && remainingStock.length > 0) {
      const merchView = buildMerchantView(interaction.user.id, remainingStock, interaction, feedback);
      return interaction.editReply(merchView);
    }

    const locView = buildLocationView(interaction.user.id, guildId, interaction, feedback);
    return interaction.editReply(locView);
  }

  // 3.2 Aprimoramento com o Engenheiro de Relíquias
  if (action === 'engineer_upgrade') {
    const sourceTier = parseInt(parts[3], 10);
    const result = upgradeRelicsWithEngineer(interaction.user.id, sourceTier, null, lang);
    let feedback = '';
    if (result.upgraded) {
      const rName = isEn ? result.targetRelic.name.en : result.targetRelic.name.pt;
      feedback = t('gloom.engineer.success', interaction, { item: rName, tier: result.targetTier });
    } else if (result.destroyed) {
      feedback = t('gloom.engineer.failure', interaction, { quote: result.sarcasticQuote });
    } else if (result.reason === 'insufficient_materials') {
      feedback = t('gloom.engineer.insufficientMaterials', interaction, { tier: sourceTier });
    } else if (result.reason === 'insufficient_coins') {
      feedback = t('gloom.engineer.insufficientCoins', interaction, { cost: result.cost });
    }
    await interaction.deferUpdate();
    const engView = buildEngineerView(interaction.user.id, interaction, feedback);
    return interaction.editReply(engView);
  }

  // 4. Suborno / Extorsão de Espírito
  if (action === 'bribe') {
    const spiritTag = parts[3] !== '0' && parts[3] !== 'errante' ? parts[3] : null;
    const encounterTag = parts[4] && parts[4] !== 'none' && parts[4] !== '0' ? parts[4] : null;
    const result = negotiateSpirit(interaction.user.id, spiritTag, null, true, encounterTag);
    const spiritName = isEn ? (result.spirit?.name?.en || result.spirit?.name) : (result.spirit?.name?.pt || result.spirit?.name);

    let text = '';
    if (result.success && result.recruited) {
      text = t('gloom.negotiate.successBribe', interaction, { spirit: spiritName, cost: result.cost });
      if (result.isDuplicate) {
        text += '\n\n' + t('gloom.negotiate.duplicateEssence', interaction, { coins: result.duplicateBonus });
      }
    } else if (result.reason === 'insufficient_energy') {
      text = isEn ? `⚡ Insufficient stamina! Requires ${result.requiredEnergy} stamina.` : `⚡ Vigor insuficiente! Requer ${result.requiredEnergy} pontos de vigor.`;
    } else if (result.reason === 'missing_relic_t4_t5') {
      text = isEn ? '🏺 Extortion failed! You must possess at least one Tier 4 or Tier 5 relic.' : '🏺 Extorsão falhou! Você precisa possuir pelo menos uma Relíquia Tier 4 ou Tier 5.';
    } else {
      text = t('gloom.explore.insufficientCoins', interaction, { cost: result.cost || 25 });
    }

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, text);
    return interaction.editReply(locView);
  }

  // 4.1 Resgate Extorsivo (Bailout)
  if (action === 'bailout') {
    const encounterTag = parts[3] !== '0' && parts[3] !== 'none' ? parts[3] : null;
    const spiritTag = parts[4] !== '0' && parts[4] !== 'errante' ? parts[4] : null;
    const result = negotiateSpirit(interaction.user.id, spiritTag, null, false, encounterTag, 1, 0, 0, true);
    const spiritName = isEn ? (result.spirit?.name?.en || result.spirit?.name) : (result.spirit?.name?.pt || result.spirit?.name);

    let text = '';
    if (result.success && result.recruited) {
      text = t('gloom.negotiate.bailoutSuccess', interaction, { spirit: spiritName, cost: result.cost });
      if (result.isDuplicate) {
        text += '\n\n' + t('gloom.negotiate.duplicateEssence', interaction, { coins: result.duplicateBonus });
      }
    } else {
      text = t('gloom.explore.insufficientCoins', interaction, { cost: result.cost || 100 });
    }

    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, text);
    return interaction.editReply(locView);
  }

  // 5. Fugir da negociação
  if (action === 'flee') {
    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction, t('gloom.negotiate.fled', interaction));
    return interaction.editReply(locView);
  }

  // 6. Voltar à visualização da localização
  if (action === 'view') {
    await interaction.deferUpdate();
    const locView = buildLocationView(interaction.user.id, guildId, interaction);
    return interaction.editReply(locView);
  }

  // 6.1 Visualização das Relíquias do Bosque
  if (action === 'relics') {
    await interaction.deferUpdate();
    const relicsView = buildRelicsView(interaction.user.id, interaction);
    return interaction.editReply(relicsView);
  }

  // 6.2 Seleção de Familiar no Select Menu do Grimório
  if (action === 'select_familiar') {
    const spiritId = interaction.values?.[0];
    const { equipFamiliar } = require('../services/gloomRealm');
    const { buildGrimoireView } = require('./grimorio');
    const result = equipFamiliar(interaction.user.id, spiritId);
    let msg = '';
    const sp = SPIRITS[spiritId];
    const spName = isEn ? sp?.name?.en : sp?.name?.pt;
    if (result.success) {
      if (result.action === 'unequipped') {
        msg = t('gloom.grimoire.unbindSuccess', interaction, { spirit: spName });
      } else {
        msg = t('gloom.grimoire.bindSuccess', interaction, { spirit: spName });
      }
    } else {
      msg = t('gloom.grimoire.maxSlots', interaction);
    }
    await interaction.deferUpdate();
    const grimView = buildGrimoireView(interaction.user.id, interaction, msg);
    return interaction.editReply(grimView);
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
      if (result.reason === 'already_defeated') {
        feedback = t('gloom.boss.alreadyDefeated', interaction);
      } else {
        feedback = t('gloom.boss.cooldown', interaction);
      }
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
      : t('gloom.explore.insufficientCoins', interaction, { cost: result.cost });

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
      if (res.isDuplicate) {
        feedback += '\n\n' + t('gloom.fusion.duplicateEssence', interaction, { coins: res.duplicateBonus });
      }
    } else if (res.reason === 'insufficient_coins') {
      feedback = t('gloom.fusion.insufficientCoins', interaction, { cost: res.cost });
    } else {
      feedback = t('gloom.fusion.cannotFuse', interaction);
    }

    const grimView = buildGrimoireView(interaction.user.id, interaction, feedback);
    return interaction.editReply(grimView);
  }
}

function resolveLocationId(input) {
  if (!input) return null;
  const clean = String(input).toLowerCase().trim().replace(/^py-/, '').replace(/\s+/g, '_');
  if (LOCATIONS[clean]) return clean;
  for (const [key, loc] of Object.entries(LOCATIONS)) {
    if (key.toLowerCase() === clean) return key;
    if (loc.name.pt.toLowerCase() === input.toLowerCase().trim() ||
        loc.name.en.toLowerCase() === input.toLowerCase().trim() ||
        loc.name.pt.toLowerCase().replace(/\s+/g, '_') === clean ||
        loc.name.en.toLowerCase().replace(/\s+/g, '_') === clean) {
      return key;
    }
  }
  return null;
}

function handleDirectMove(userId, guildId, source, destinationInput) {
  const targetLocId = resolveLocationId(destinationInput);
  if (!targetLocId) {
    return { content: t('gloom.explore.directMoveNotFound', source, { destination: destinationInput }) };
  }

  const user = getGloomUser(userId);
  if (user.currentLocation === targetLocId) {
    return buildLocationView(userId, guildId, source);
  }

  // 1. Verifica banimento temporário na sala de destino
  const banStatus = isLocationBanned(user, targetLocId);
  if (banStatus.banned) {
    const reasonText = t('gloom.explore.reasons.banned', source, { time: banStatus.remainingMinutes });
    return { content: t('gloom.explore.travelLocked', source, { reason: reasonText }) };
  }

  // 2. Verifica vizinhança e marés
  const tide = getGloomTide();
  const neighbors = gloomGraph.getAvailableNeighbors(user.currentLocation, user, tide);
  const targetNeighbor = neighbors.find((n) => n.location.id === targetLocId);

  if (!targetNeighbor) {
    const isEn = getLanguage(source) === 'en';
    const notAdj = isEn ? 'This chamber is not directly adjacent to your current location.' : 'Esta câmara não é adjacente à sua localização atual.';
    return { content: t('gloom.explore.travelLocked', source, { reason: notAdj }) };
  }

  if (!targetNeighbor.canEnter) {
    const reasonKey = targetNeighbor.reason || 'locked_tide';
    const reasonText = reasonKey === 'banned'
      ? t('gloom.explore.reasons.banned', source, { time: targetNeighbor.banRemainingMinutes || 30 })
      : (t(`gloom.explore.reasons.${reasonKey}`, source) || 'Bloqueado.');
    return { content: t('gloom.explore.travelLocked', source, { reason: reasonText }) };
  }

  // Validação de Cooldown de Viagem de 10 min
  const travelStatus = checkMapTravelCooldown(user);
  if (!travelStatus.canTravel) {
    const isEn = getLanguage(source) === 'en';
    return {
      content: isEn
        ? `⏳ **Travel Fatigue!** Please wait **${travelStatus.remainingMinutes} min** before changing maps again, or use a **Horse Saddle 🐎 / Wings 🪽** in your backpack to bypass this cooldown!`
        : `⏳ **Fadiga de Viagem!** Aguarde **${travelStatus.remainingMinutes} min** para trocar de mapa novamente, ou use uma **Sela de Cavalo 🐎 / Asas 🪽** na sua mochila para anular este tempo!`,
    };
  }

  user.currentLocation = targetLocId;
  user.lastMapMoveAt = Date.now();
  user.visitedLocations = user.visitedLocations || [];
  if (!user.visitedLocations.includes(targetLocId)) {
    user.visitedLocations.push(targetLocId);
  }
  user.temporaryPortalOpen = false;

  const { updateGloomUser } = require('../services/gloomRealm');
  updateGloomUser(userId, user);

  return buildLocationView(userId, guildId, source);
}

function handleDirectVasculhar(userId, guildId, source) {
  const user = getGloomUser(userId);
  const result = forage(userId, user.currentLocation);
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  if (!result.success) {
    if (result.reason === 'room_banned') {
      return { content: t('gloom.explore.roomBanned', source, { time: result.banRemainingMinutes }) };
    }
    return { content: t('gloom.explore.forageNoEnergy', source, { time: result.timeRemainingSec }) };
  }

  let lootFeedback = '';
  if (result.rewardCoins > 0) {
    lootFeedback = t('gloom.explore.forageSuccessCoins', source, { coins: result.rewardCoins });
  } else if (result.rewardItem) {
    const itemName = isEn ? result.rewardItem.name.en : result.rewardItem.name.pt;
    lootFeedback = t('gloom.explore.forageSuccessItem', source, { item: itemName });
  }

  if (result.openedRarePortal) {
    lootFeedback += `\n${t('gloom.explore.portalOpened', source)}`;
  }

  if (result.rareEvent) {
    if (result.rareEvent.type === 'relic_merchant') {
      return buildMerchantView(userId, result.rareEvent.stock, source, lootFeedback);
    } else {
      return buildEngineerView(userId, source, lootFeedback);
    }
  }

  if (result.encounteredSpirit) {
    return buildNegotiationView(userId, result.encounteredSpirit, source, result.encounteredEncounter);
  }

  return buildLocationView(userId, guildId, source, lootFeedback);
}

module.exports = {
  name: EXPLORE,
  aliases: ['explorar', 'explore', 'gloom', 'py-explorar', 'py-gloom', 'bosque', 'py-bosque', 'vasculhar', 'py-vasculhar', 'scavenge', 'py-scavenge'],
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
  async executePrefix({ message, args = [], prefix = 'py!' }) {
    const guildId = message.guildId || 'global';
    const invoked = message.content.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase();
    if (['vasculhar', 'py-vasculhar', 'scavenge', 'py-scavenge'].includes(invoked)) {
      const view = handleDirectVasculhar(message.author.id, guildId, message);
      return message.reply(view);
    }
    if (args.length > 0) {
      const dest = args.join(' ');
      const view = handleDirectMove(message.author.id, guildId, message, dest);
      return message.reply(view);
    }
    const view = buildLocationView(message.author.id, guildId, message);
    await message.reply(view);
  },
  isGloomInteraction,
  handleGloomInteraction,
  buildLocationView,
  buildRelicsView,
  buildMerchantView,
  buildEngineerView,
  buildBossView,
  handleDirectMove,
  handleDirectVasculhar,
};
