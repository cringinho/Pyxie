const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { GRIMOIRE } = require('./commandNames');
const {
  SPIRITS,
  getGloomUser,
  equipFamiliar,
  fuseSpirits,
} = require('../services/gloomRealm');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

function buildGrimoireView(userId, source = null, feedbackMessage = '') {
  const user = getGloomUser(userId);
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const equipped = (user.equippedFamiliars || []).map((id) => SPIRITS[id]).filter(Boolean);
  const collected = (user.grimoire || []).map((id) => SPIRITS[id]).filter(Boolean);

  let maxSlots = 2;
  for (const f of equipped) {
    if (f.aura?.extraGrimoireSlot) maxSlots += f.aura.extraGrimoireSlot;
  }

  const equippedText = equipped.length > 0
    ? equipped.map((sp) => {
        const spName = isEn ? sp.name.en : sp.name.pt;
        const auraName = isEn ? sp.aura.name.en : sp.aura.name.pt;
        const auraDesc = isEn ? sp.aura.desc.en : sp.aura.desc.pt;
        return `> 🔮 **${spName}** — *${auraName}* (${auraDesc})`;
      }).join('\n')
    : t('gloom.grimoire.noEquipped', source);

  const collectedText = collected.length > 0
    ? collected.map((sp) => {
        const spName = isEn ? sp.name.en : sp.name.pt;
        const isEq = (user.equippedFamiliars || []).includes(sp.id);
        const tag = isEq ? ` ${t('gloom.grimoire.tagActive', source)}` : '';
        return `> • **${spName}** (Tier ${sp.tier} — ${sp.rarity.toUpperCase()})${tag}`;
      }).join('\n')
    : t('gloom.grimoire.noSpirits', source);

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple)
    .setTitle(t('gloom.grimoire.title', source, { user: source?.user?.displayName || source?.author?.displayName || 'Aventureiro' }))
    .setDescription(
      `${feedbackMessage ? `**${feedbackMessage}**\n\n` : ''}` +
      `${t('gloom.grimoire.desc', source)}\n\n` +
      `${t('gloom.grimoire.phantomCoins', source, { coins: user.phantomCoins })}\n\n` +
      `${t('gloom.grimoire.equippedHeader', source, { count: equipped.length, max: maxSlots })}\n` +
      `${equippedText}\n\n` +
      `${t('gloom.grimoire.collectedHeader', source, { count: collected.length })}\n` +
      `${collectedText}`
    )
    .setFooter({ text: t('gloom.footer', source) })
    .setTimestamp();

  const components = [];

  // Botões de Equipar/Desequipar (até 5 espíritos da coleção)
  // Menu de Seleção de Espíritos para Equipar/Desequipar (até 25 espíritos)
  if (collected.length > 0) {
    const selectOptions = collected.slice(0, 25).map((sp) => {
      const spName = isEn ? sp.name.en : sp.name.pt;
      const isEq = (user.equippedFamiliars || []).includes(sp.id);
      const auraName = isEn ? sp.aura?.name?.en : sp.aura?.name?.pt;
      const actionHint = isEq
        ? (isEn ? 'Click to unbind' : 'Clique para desequipar')
        : (isEn ? 'Click to bind' : 'Clique para equipar');
      return {
        label: `${isEq ? '⭐ ' : ''}${spName} (T${sp.tier})`.slice(0, 100),
        value: sp.id,
        description: `${auraName || 'Aura'} • ${actionHint}`.slice(0, 100),
        emoji: isEq ? '⭐' : '🔮',
        default: false,
      };
    });

    const familiarSelect = new StringSelectMenuBuilder()
      .setCustomId(`gloom:select_familiar:${userId}`)
      .setPlaceholder(isEn ? '🔮 Select a familiar to bind or unbind...' : '🔮 Escolha um espírito para equipar ou desequipar...')
      .addOptions(selectOptions);

    components.push(new ActionRowBuilder().addComponents(familiarSelect));
  }

  const { getEmoji } = require('../utils/appEmojis');
  // Linha de Navegação: Fusão e Voltar
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:fusion_menu:${userId}`)
      .setLabel(t('gloom.grimoire.btnFuse', source))
      .setEmoji(getEmoji('POTION') || '⚗️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(collected.length < 2 || user.phantomCoins < 30),
    new ButtonBuilder()
      .setCustomId(`gloom:view:${userId}`)
      .setLabel(t('gloom.grimoire.btnBack', source))
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
  );
  components.push(navRow);

  return { embeds: [embed], components };
}

function buildFusionMenuView(userId, source = null, feedbackMessage = '') {
  const user = getGloomUser(userId);
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const collected = (user.grimoire || []).map((id) => SPIRITS[id]).filter(Boolean);

  const embed = new EmbedBuilder()
    .setColor('#a855f7')
    .setTitle(t('gloom.fusion.title', source))
    .setDescription(
      `${feedbackMessage ? `**${feedbackMessage}**\n\n` : ''}` +
      `${t('gloom.fusion.desc', source)}\n\n` +
      `${t('gloom.fusion.ritualCost', source, { cost: 30 })}\n` +
      `${t('gloom.grimoire.phantomCoins', source, { coins: user.phantomCoins })}`
    )
    .setFooter({ text: t('gloom.fusion.footer', source) })
    .setTimestamp();

  const options = collected.map((sp) => {
    const spName = isEn ? sp.name.en : sp.name.pt;
    return {
      label: spName.slice(0, 100),
      value: sp.id,
      description: `Tier ${sp.tier} • ${sp.rarity.toUpperCase()}`,
      emoji: '🔮',
    };
  });

  const select = new StringSelectMenuBuilder()
    .setCustomId(`gloom:select_fuse:${userId}`)
    .setPlaceholder(t('gloom.fusion.selectPlaceholder', source))
    .setMinValues(2)
    .setMaxValues(2)
    .addOptions(options.slice(0, 25));

  const selectRow = new ActionRowBuilder().addComponents(select);
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gloom:grimoire:${userId}`)
      .setLabel(t('gloom.grimoire.btnBack', source))
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [selectRow, backRow] };
}

module.exports = {
  name: GRIMOIRE,
  aliases: ['grimorio', 'grimoire', 'py-grimorio', 'py-grimoire'],
  data: new SlashCommandBuilder()
    .setName(GRIMOIRE)
    .setNameLocalizations({
      'pt-BR': 'py-grimorio',
    })
    .setDescription('View your collected spirits, equipped familiars and perform soul fusion.')
    .setDescriptionLocalizations({
      'pt-BR': 'Veja seus espíritos coletados, familiares equipados e faça fusão de almas.',
    }),
  async executeSlash({ interaction }) {
    const view = buildGrimoireView(interaction.user.id, interaction);
    await interaction.editReply(view);
  },
  async executePrefix({ message }) {
    const view = buildGrimoireView(message.author.id, message);
    await message.reply(view);
  },
  buildGrimoireView,
  buildFusionMenuView,
};

