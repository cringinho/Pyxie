const path = require('path');
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const {
  getUserAccount,
  getUserRank,
  getTitlesCatalog,
  getUserTitles,
  buyTitle,
  equipTitle,
  unequipTitle,
  getThemesCatalog,
  getUserThemes,
  buyTheme,
  equipTheme,
  setUserBio,
  setProfileStyle,
} = require('../services/economy');
const { LAYOUTS, FRAMES, SHOWCASE_STATS, STICKERS } = require('../services/profileStyle');
const { getSpouseId } = require('../services/marriage');
const marriageManager = require('../modules/marriage/marriageManager');
const { getAlbumStats } = require('../services/tarotAlbumService');
const { generateProfileCard } = require('../services/profileCardGenerator');
const { readJson } = require('../utils/atomicJson');
const professions = require('../services/professions');
const { buildProfileEmbed } = require('./economyHelpers');
const { PROFILE } = require('./commandNames');
const { PYXIE_COLORS, KUROMI_COLORS } = require('../utils/pyxieVoice');
const { getLanguage, t } = require('../utils/i18n');
const { getEmoji } = require('../utils/appEmojis');

function getTargetUser(source) {
  return source.options?.getUser('user') || source.options?.getUser('usuario') || source.user || source.author;
}

async function buildProfileView(targetUser, viewerId, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const account = getUserAccount(targetUser.id);
  const spouseId = getSpouseId(targetUser.id);
  const rank = getUserRank(targetUser.id);
  const titlesCatalog = getTitlesCatalog();
  const equippedTitle = account.equippedTitle ? titlesCatalog[account.equippedTitle] : null;

  const professionKey = account.profession;
  const professionLabel = professionKey
    ? t(`profession.labels.${professionKey}`, source) || professions[professionKey]?.label
    : null;

  const guild = source?.guild || (source?.channel?.guild) || null;
  const client = source?.client || null;

  // 1. Dados do Módulo de Tarot
  const tarotStats = getAlbumStats(targetUser.id, lang);

  // 2. Dados do Módulo de Matrimônio
  let marriageDetails = null;
  try {
    const marriage = marriageManager.getMarriage(targetUser.id);
    if (marriage) {
      let spouseName = isEn ? 'Beloved Spouse' : 'Cônjuge';
      if (spouseId) {
        const spouseUser = client?.users?.cache?.get(spouseId);
        if (spouseUser) spouseName = spouseUser.displayName || spouseUser.username;
      }
      marriageDetails = {
        isMarried: true,
        spouseName,
        lovePoints: Math.round(marriage.lovePoints || 100),
        marriageDays: Math.max(1, Math.floor((Date.now() - (marriage.marriedAt || Date.now())) / (24 * 60 * 60 * 1000))),
        childrenCount: Array.isArray(marriage.children) ? marriage.children.length : 0,
        vaultCoins: Number(marriage.sharedVaultCoins) || 0,
      };
    }
  } catch (_) {}

  // 3. Dados do Museu 3D
  let museumArtsCount = 0;
  try {
    const mData = readJson(path.join(process.cwd(), 'data', 'museumData.json'), { arts: [] });
    if (mData && Array.isArray(mData.arts)) {
      museumArtsCount = mData.arts.filter((a) => a.authorId === targetUser.id).length;
    }
  } catch (_) {}

  // 4. Renderização do Card Declarativo de Alta Fidelidade (Satori + Resvg Rust)
  let attachment = null;
  try {
    const pngBuffer = await generateProfileCard({
      targetUser,
      guild,
      source,
      client,
    });
    if (pngBuffer) {
      attachment = new AttachmentBuilder(pngBuffer, { name: 'profile_card.png' });
    }
  } catch (err) {
    console.error('[ProfileCard] Erro ao renderizar card visual:', err);
  }

  const embed = buildProfileEmbed({
    user: targetUser,
    account,
    spouse: spouseId ? `<@${spouseId}>` : null,
    rankPosition: rank?.position || null,
    professionLabel,
    equippedTitle,
    source,
    tarotStats,
    marriageDetails,
    museumArtsCount,
    hasImageCard: Boolean(attachment),
    guild,
  });

  const components = [];
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`profile_open_titles:${targetUser.id}:${viewerId}`)
      .setLabel(t('profile.btnTitles', source))
      .setEmoji('👑')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`profile_open_themes:${targetUser.id}:${viewerId}`)
      .setLabel(t('profile.btnThemes', source))
      .setEmoji('🎨')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`profile_open_studio:${targetUser.id}:${viewerId}`)
      .setLabel(t('profileStudio.btn_customize', source))
      .setEmoji('🎛️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`profile_open_bio:${targetUser.id}:${viewerId}`)
      .setLabel(t('profile.btnEditBio', source))
      .setEmoji('✏️')
      .setStyle(ButtonStyle.Secondary)
  );
  components.push(actionRow);

  const linkRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(isEn ? 'Inspect 3D Card on Web' : 'Inspecionar Card 3D no Site')
      .setEmoji('🌐')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://pyxie.com.br/u/${targetUser.id}`),
    new ButtonBuilder()
      .setLabel(isEn ? 'Invite Pyxie' : 'Convidar a Pyxie')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Link)
      .setURL('https://pyxie.com.br/convite')
  );
  components.push(linkRow);

  const result = { embeds: [embed], components, attachments: [] };
  if (attachment) {
    result.files = [attachment];
  }
  return result;
}

async function renderCardAttachment(targetUser, source, overrides = null) {
  try {
    const png = await generateProfileCard({
      targetUser,
      guild: source?.guild || source?.channel?.guild || null,
      source,
      client: source?.client || null,
      overrides,
    });
    return png ? new AttachmentBuilder(png, { name: 'profile_card.png' }) : null;
  } catch (err) {
    console.error('[ProfileCard] Erro ao renderizar prévia:', err);
    return null;
  }
}

const SHOWCASE_EMOJIS = { coins: '🪙', beans: '🌱', rank: '🏆', level: '💼', tarot: '🔮', works: '🔨', streak: '🔥', museum: '🎨', love: '💍' };
const LAYOUT_EMOJIS = { glass: '🪟', neon: '💡', minimal: '◽' };
const FRAME_EMOJIS = { circle: '⭕', squircle: '🟪', halo: '💫' };

/**
 * Estúdio do Perfil: personalização gratuita com prévia ao vivo do card.
 */
async function buildStudioView(targetUser, viewerId, source = null) {
  const account = getUserAccount(targetUser.id);
  const style = account.profileStyle;
  const isEn = getLanguage(source) === 'en';
  const themesCatalog = getThemesCatalog();
  const theme = themesCatalog[account.equippedTheme] || themesCatalog.default;
  const guildName = source?.guild?.name || 'Pyxie';
  const ids = `${targetUser.id}:${viewerId}`;

  const attachment = await renderCardAttachment(targetUser, source);
  const showcaseText = style.showcase.map((k) => t(`profileCard.stat_${k}`, source)).join(', ');

  const embed = new EmbedBuilder()
    .setColor(theme.color || '#8B5CF6')
    .setTitle(t('profileStudio.title', source))
    .setDescription(
      [
        t('profileStudio.intro', source),
        t('profileStudio.section_current', source),
        t('profileStudio.line_theme', source, { value: `${theme.emoji} ${isEn ? theme.nameEn || theme.name : theme.name}` }),
        t('profileStudio.line_layout', source, { value: t(`profileStudio.layout_${style.layout}`, source) }),
        t('profileStudio.line_frame', source, { value: t(`profileStudio.frame_${style.frame}`, source) }),
        t('profileStudio.line_showcase', source, { value: showcaseText }),
        t('profileStudio.line_sticker', source, { value: style.sticker === 'none' ? t('profileStudio.sticker_none', source) : style.sticker }),
        t('profileStudio.themes_hint', source),
      ].join('\n\n')
    )
    .setFooter({ text: t('profileStudio.footer', source, { guild: guildName }) });
  if (attachment) embed.setImage('attachment://profile_card.png');

  const layoutRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`profile_studio_layout:${ids}`)
      .setPlaceholder(t('profileStudio.ph_layout', source))
      .addOptions(LAYOUTS.map((key) => ({
        label: t(`profileStudio.layout_${key}`, source),
        description: t(`profileStudio.layout_${key}_desc`, source),
        value: key,
        emoji: LAYOUT_EMOJIS[key],
        default: style.layout === key,
      })))
  );
  const frameRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`profile_studio_frame:${ids}`)
      .setPlaceholder(t('profileStudio.ph_frame', source))
      .addOptions(FRAMES.map((key) => ({
        label: t(`profileStudio.frame_${key}`, source),
        description: t(`profileStudio.frame_${key}_desc`, source),
        value: key,
        emoji: FRAME_EMOJIS[key],
        default: style.frame === key,
      })))
  );
  const showcaseRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`profile_studio_showcase:${ids}`)
      .setPlaceholder(t('profileStudio.ph_showcase', source))
      .setMinValues(1)
      .setMaxValues(4)
      .addOptions(SHOWCASE_STATS.map((key) => ({
        label: t(`profileCard.stat_${key}`, source),
        value: key,
        emoji: SHOWCASE_EMOJIS[key],
        default: style.showcase.includes(key),
      })))
  );
  const stickerRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`profile_studio_sticker:${ids}`)
      .setPlaceholder(t('profileStudio.ph_sticker', source))
      .addOptions(STICKERS.map((value) => (value === 'none'
        ? { label: t('profileStudio.sticker_none', source), value, emoji: '🚫', default: style.sticker === value }
        : { label: value, value, default: style.sticker === value })))
  );
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`profile_view_main:${ids}`)
      .setLabel(t('profileStudio.back', source))
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary)
  );

  const view = { embeds: [embed], components: [layoutRow, frameRow, showcaseRow, stickerRow, backRow], attachments: [] };
  if (attachment) view.files = [attachment];
  return view;
}

function buildTitlesView(targetUser, viewerId, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const account = getUserAccount(targetUser.id);
  const titlesCatalog = getTitlesCatalog();
  const ownedTitles = account.titles || [];
  const equippedId = account.equippedTitle;

  const equippedDisplay = equippedId && titlesCatalog[equippedId]
    ? `> ${titlesCatalog[equippedId].emoji} **${titlesCatalog[equippedId].name}**\n> *« ${titlesCatalog[equippedId].desc} »*`
    : (isEn ? '> 🕊️ *No title equipped (Default display)*' : '> 🕊️ *Nenhum título equipado (Exibição padrão)*');

  const beanEmoji = getEmoji('MAGIC_BEAN') || '🌱';
  const desc = isEn
    ? [
        'Customize your profile header with prestige titles!',
        '',
        `${beanEmoji} **YOUR BALANCE**`,
        `> ${beanEmoji} **Magic Beans:** **${account.magicBeans || 0} ${beanEmoji}**`,
        '',
        '👑 **CURRENTLY EQUIPPED TITLE**',
        '',
        equippedDisplay,
        '',
        '✨ **CATALOG & PURCHASES**',
        'Choose a title in the dropdown menu below to **purchase** or **equip**:',
      ].join('\n')
    : [
        'Personalize o cabeçalho do seu perfil com títulos de prestígio!',
        '',
        `${beanEmoji} **SEU SALDO**`,
        `> ${beanEmoji} **Feijões Mágicos:** **${account.magicBeans || 0} ${beanEmoji}**`,
        '',
        '👑 **TÍTULO ATUALMENTE EQUIPADO**',
        '',
        equippedDisplay,
        '',
        '✨ **CATÁLOGO & AQUISIÇÕES**',
        'Escolha um título no menu suspenso abaixo para **comprar** ou **equipar**:',
      ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold || '#facc15')
    .setTitle(isEn ? `👑  ✦  Titles Gallery — ${targetUser.displayName || targetUser.username}` : `👑  ✦  Galeria de Títulos — ${targetUser.displayName || targetUser.username}`)
    .setDescription(desc)
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();

  const options = Object.values(titlesCatalog).map((title) => {
    const isEquipped = equippedId === title.id;
    const isOwned = ownedTitles.includes(title.id);

    let statusTag = '';
    let optDesc = '';
    let val = '';

    if (isEquipped) {
      statusTag = isEn ? ' [EQUIPPED]' : ' [EQUIPADO]';
      optDesc = isEn ? 'Currently displayed on your profile' : 'Atualmente em exibição no seu perfil';
      val = `equipped:${title.id}`;
    } else if (isOwned) {
      statusTag = isEn ? ' [OWNED]' : ' [ADQUIRIDO]';
      optDesc = isEn ? 'Click to equip this title' : 'Clique para equipar este título';
      val = `equip:${title.id}`;
    } else {
      statusTag = ` [${title.cost} ${beanEmoji}]`;
      optDesc = isEn ? `Purchase for ${title.cost} Magic Bean(s)` : `Comprar por ${title.cost} Feijão(ões) Mágico(s)`;
      val = `buy:${title.id}`;
    }

    return {
      label: `${title.name}${statusTag}`.slice(0, 100),
      description: optDesc.slice(0, 100),
      value: val,
      emoji: title.emoji,
      default: isEquipped,
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`profile_select_title:${targetUser.id}:${viewerId}`)
      .setPlaceholder(isEn ? '👑 Choose a title to purchase or equip...' : '👑 Escolha um título para comprar ou equipar...')
      .addOptions(options)
  );

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`profile_view_main:${targetUser.id}:${viewerId}`)
      .setLabel(isEn ? 'Back to Profile' : 'Voltar ao Perfil')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`profile_unequip:${targetUser.id}:${viewerId}`)
      .setLabel(isEn ? 'Unequip Title' : 'Desequipar Título')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!equippedId)
  );

  return { embeds: [embed], components: [selectRow, buttonRow], attachments: [] };
}

/**
 * Galeria de temas com prévia ao vivo: escolher um tema não adquirido mostra o card com ele antes da compra.
 */
async function buildThemesView(targetUser, viewerId, source = null, previewThemeId = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const account = getUserAccount(targetUser.id);
  const themesCatalog = getThemesCatalog();
  const ownedThemes = account.themes || ['default'];
  const equippedId = account.equippedTheme || 'default';
  const previewTheme = previewThemeId && themesCatalog[previewThemeId] ? themesCatalog[previewThemeId] : null;
  const shownTheme = previewTheme || themesCatalog[equippedId] || themesCatalog.default;
  const beanEmoji = getEmoji('MAGIC_BEAN') || '🌱';
  const nameOf = (theme) => (isEn ? theme.nameEn || theme.name : theme.name);
  const descOf = (theme) => (isEn ? theme.descEn || theme.desc : theme.desc);
  const ids = `${targetUser.id}:${viewerId}`;

  const attachment = await renderCardAttachment(targetUser, source, previewTheme ? { theme: previewTheme.id } : null);

  const headline = previewTheme
    ? (isEn ? `### 👀 Previewing: ${previewTheme.emoji} ${nameOf(previewTheme)}` : `### 👀 Experimentando: ${previewTheme.emoji} ${nameOf(previewTheme)}`)
    : (isEn ? `### 🎨 Current Theme: ${shownTheme.emoji} ${nameOf(shownTheme)}` : `### 🎨 Tema Atual: ${shownTheme.emoji} ${nameOf(shownTheme)}`);

  const desc = [
    isEn
      ? 'Each theme changes the whole card: banner art, colors and light or dark mode. Pick one below to try it on your own card.'
      : 'Cada tema muda o cartão inteiro: arte do banner, cores e modo claro ou escuro. Escolha um abaixo para experimentar no seu próprio card.',
    headline,
    `> *${descOf(shownTheme)}*`,
    isEn
      ? `• **Your Magic Beans:** \`${account.magicBeans || 0}\` ${beanEmoji}`
      : `• **Seus Feijões Mágicos:** \`${account.magicBeans || 0}\` ${beanEmoji}`,
  ].join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(shownTheme.color || PYXIE_COLORS.magenta)
    .setTitle(isEn ? '🎨 Profile Themes' : '🎨 Temas do Perfil')
    .setDescription(desc)
    .setFooter({ text: `Pyxie • ${source?.guild?.name || 'Pyxie'}` });
  if (attachment) embed.setImage('attachment://profile_card.png');

  const options = Object.values(themesCatalog).map((theme) => {
    const isEquipped = equippedId === theme.id;
    const isOwned = ownedThemes.includes(theme.id) || theme.cost === 0;
    let statusTag;
    let optDesc;
    let val;
    if (isEquipped) {
      statusTag = isEn ? ' • Equipped' : ' • Equipado';
      optDesc = isEn ? 'Active on your profile' : 'Ativo no seu perfil';
      val = `equipped:${theme.id}`;
    } else if (isOwned) {
      statusTag = isEn ? ' • Owned' : ' • Adquirido';
      optDesc = isEn ? 'Tap to equip' : 'Toque para equipar';
      val = `equip:${theme.id}`;
    } else {
      statusTag = ` • ${theme.cost} ${isEn ? 'beans' : 'feijões'}`;
      optDesc = descOf(theme);
      val = `preview:${theme.id}`;
    }
    return {
      label: `${nameOf(theme)}${statusTag}`.slice(0, 100),
      description: optDesc.slice(0, 100),
      value: val,
      emoji: theme.emoji,
      default: previewTheme ? previewTheme.id === theme.id : isEquipped,
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`profile_select_theme:${ids}`)
      .setPlaceholder(isEn ? '🎨 Pick a theme to try or equip...' : '🎨 Escolha um tema para experimentar ou equipar...')
      .addOptions(options)
  );

  const buttons = [
    new ButtonBuilder()
      .setCustomId(`profile_view_main:${ids}`)
      .setLabel(isEn ? 'Back to Profile' : 'Voltar ao Perfil')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary),
  ];
  if (previewTheme && !ownedThemes.includes(previewTheme.id)) {
    buttons.unshift(
      new ButtonBuilder()
        .setCustomId(`profile_buy_theme:${ids}:${previewTheme.id}`)
        .setLabel(isEn ? `Unlock for ${previewTheme.cost} beans` : `Desbloquear por ${previewTheme.cost} feijões`)
        .setEmoji('🔓')
        .setStyle(ButtonStyle.Success)
        .setDisabled((account.magicBeans || 0) < previewTheme.cost)
    );
  }

  const view = { embeds: [embed], components: [selectRow, new ActionRowBuilder().addComponents(...buttons)], attachments: [] };
  if (attachment) view.files = [attachment];
  return view;
}

function isProfileInteraction(interaction) {
  return typeof interaction.customId === 'string' && interaction.customId.startsWith('profile_');
}

async function handleProfileInteraction(interaction) {
  const customId = interaction.customId;
  const parts = customId.split(':');
  const action = parts[0];
  const targetId = parts[1];
  const ownerId = parts[2] || targetId;
  const isEn = getLanguage(interaction) === 'en';

  // 1. Abrir Modal de Edição de Bio
  if (action === 'profile_open_bio') {
    if (interaction.user.id !== targetId) {
      return interaction.reply({
        content: isEn ? '❌ You can only edit your own profile biography!' : '❌ Você só pode editar a biografia do seu próprio perfil!',
        flags: 64,
      });
    }

    const account = getUserAccount(targetId);
    const modal = new ModalBuilder()
      .setCustomId(`profile_bio_modal:${targetId}:${ownerId}`)
      .setTitle(isEn ? '✏️ Customize Biography' : '✏️ Personalizar Biografia');

    const bioInput = new TextInputBuilder()
      .setCustomId('profile_bio_input')
      .setLabel(isEn ? 'Biography (highlight quote)' : 'Biografia (frase de destaque no perfil)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(isEn ? 'Write something about yourself or your adventures...' : 'Escreva algo sobre você ou suas aventuras...')
      .setMaxLength(120)
      .setRequired(false);

    if (account.bio) {
      bioInput.setValue(account.bio);
    }

    const modalRow = new ActionRowBuilder().addComponents(bioInput);
    modal.addComponents(modalRow);

    return interaction.showModal(modal);
  }

  // 2. Submissão do Modal de Bio
  if (action === 'profile_bio_modal') {
    if (interaction.user.id !== targetId) {
      return interaction.reply({
        content: isEn ? '❌ You can only edit your own profile biography!' : '❌ Você só pode editar a biografia do seu próprio perfil!',
        flags: 64,
      });
    }

    const newBio = interaction.fields.getTextInputValue('profile_bio_input');
    setUserBio(targetId, newBio);

    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = await buildProfileView(targetUser, interaction.user.id, interaction);
    return interaction.update(view);
  }

  // 3. Validar autoridade da interação para outras ações
  if (interaction.user.id !== ownerId && interaction.user.id !== targetId) {
    return interaction.reply({
      content: isEn ? '❌ Only the owner of this profile can modify its titles or settings.' : '❌ Apenas o dono deste perfil pode alterar seus títulos ou configurações.',
      flags: 64,
    });
  }

  // 4. Voltar para o Perfil Principal
  if (action === 'profile_view_main') {
    await interaction.deferUpdate();
    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = await buildProfileView(targetUser, interaction.user.id, interaction);
    return interaction.editReply(view);
  }

  // 5. Abrir Galeria de Títulos
  if (action === 'profile_open_titles') {
    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = buildTitlesView(targetUser, interaction.user.id, interaction);
    return interaction.update(view);
  }

  // 6. Abrir Galeria de Temas
  if (action === 'profile_open_themes') {
    await interaction.deferUpdate();
    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = await buildThemesView(targetUser, interaction.user.id, interaction);
    return interaction.editReply(view);
  }

  // 6b. Estúdio do Perfil (só o dono do perfil)
  if (action.startsWith('profile_studio_') || action === 'profile_open_studio') {
    if (interaction.user.id !== targetId) {
      return interaction.reply({ content: t('profileStudio.only_owner', interaction), flags: 64 });
    }
    const values = interaction.values || [];
    if (action === 'profile_studio_layout') setProfileStyle(targetId, { layout: values[0] });
    if (action === 'profile_studio_frame') setProfileStyle(targetId, { frame: values[0] });
    if (action === 'profile_studio_showcase') setProfileStyle(targetId, { showcase: values });
    if (action === 'profile_studio_sticker') setProfileStyle(targetId, { sticker: values[0] });

    await interaction.deferUpdate();
    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = await buildStudioView(targetUser, interaction.user.id, interaction);
    return interaction.editReply(view);
  }

  // 6c. Comprar tema após a prévia
  if (action === 'profile_buy_theme') {
    if (interaction.user.id !== targetId) {
      return interaction.reply({ content: t('profileStudio.only_owner', interaction), flags: 64 });
    }
    const res = buyTheme(targetId, parts[3]);
    if (!res.success) {
      return interaction.reply({ content: `❌ ${res.message}`, flags: 64 });
    }
    await interaction.deferUpdate();
    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = await buildThemesView(targetUser, interaction.user.id, interaction);
    return interaction.editReply(view);
  }

  // 7. Desequipar Título
  if (action === 'profile_unequip') {
    unequipTitle(targetId);
    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = buildTitlesView(targetUser, interaction.user.id, interaction);
    return interaction.update(view);
  }

  // 8. Seleção de Título no Dropdown
  if (action === 'profile_select_title') {
    const selectedVal = interaction.values[0];
    const [operation, titleId] = selectedVal.split(':');

    if (operation === 'equipped') {
      return interaction.reply({
        content: isEn ? '👑 This title is already equipped on your profile!' : '👑 Este título já está equipado no seu perfil!',
        flags: 64,
      });
    }

    if (operation === 'equip') {
      equipTitle(targetId, titleId);
      const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
      const view = buildTitlesView(targetUser, interaction.user.id, interaction);
      return interaction.update(view);
    }

    if (operation === 'buy') {
      const res = buyTitle(targetId, titleId);
      if (!res.success) {
        return interaction.reply({ content: `❌ ${res.message}`, flags: 64 });
      }
      const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
      const view = buildTitlesView(targetUser, interaction.user.id, interaction);
      return interaction.update(view);
    }
  }

  // 9. Seleção de Tema no Dropdown
  if (action === 'profile_select_theme') {
    const [operation, themeId] = interaction.values[0].split(':');
    if (operation === 'equipped') {
      return interaction.reply({
        content: isEn ? '🎨 This visual theme is already active on your profile!' : '🎨 Este tema visual já está ativo no seu perfil!',
        flags: 64,
      });
    }
    if (operation === 'equip' && interaction.user.id === targetId) {
      equipTheme(targetId, themeId);
    }
    await interaction.deferUpdate();
    const targetUser = await interaction.client.users.fetch(targetId).catch(() => interaction.user);
    const view = await buildThemesView(targetUser, interaction.user.id, interaction, operation === 'preview' ? themeId : null);
    return interaction.editReply(view);
  }
}

module.exports = {
  name: PROFILE,
  aliases: ['profile', 'perfil', 'py-perfil', 'py-profile'],
  buildProfileView,
  buildTitlesView,
  buildThemesView,
  buildStudioView,
  isProfileInteraction,
  handleProfileInteraction,
  data: new SlashCommandBuilder()
    .setName(PROFILE)
    .setDescription('Display your adventurer profile with custom titles, themes, and stats.')
    .setDescriptionLocalizations({
      'pt-BR': 'Exibe seu perfil com títulos e temas customizáveis, vocação, moedas e Feijões Mágicos.',
    })
    .addUserOption((option) =>
      option
        .setName('user')
        .setNameLocalizations({
          'en-US': 'user',
          'en-GB': 'user',
          'pt-BR': 'usuario',
        })
        .setDescription('User to inspect profile')
        .setDescriptionLocalizations({
          'pt-BR': 'Usuário para consultar o perfil',
        })
        .setRequired(false)
    ),
  async executePrefix({ message }) {
    const target = message.mentions.users.first() || message.author;
    const view = await buildProfileView(target, message.author.id, message);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const target = getTargetUser(interaction);
    const view = await buildProfileView(target, interaction.user.id, interaction);
    await interaction.editReply(view);
  },
};