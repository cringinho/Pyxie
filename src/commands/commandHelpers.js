const {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { getLanguage, t } = require('../utils/i18n');

const MODULE_ICONS = {
  todos: 'https://cdn.discordapp.com/emojis/1548444149785694238.gif', // pinkeing (Asas Mágicas Animadas)
  bosque: 'https://cdn.discordapp.com/emojis/1548443941144109181.gif', // emojitree38 (Árvore Mística Animada)
  economia: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif', // shineygoldcoinsi (Moedinha Dourada Brilhante)
  loja: 'https://cdn.discordapp.com/emojis/1551356299500064858.gif', // 9862_holo_diamond (Diamante Holográfico)
  tarot: 'https://cdn.discordapp.com/emojis/1551356087611957269.gif', // 8212crystalmoon (Lua de Cristal Animada)
  social: 'https://cdn.discordapp.com/emojis/1551356415543742554.gif', // 37775purplecrystalheart (Coração de Cristal Roxo)
  utilidades: 'https://cdn.discordapp.com/emojis/1548444319730499664.gif', // ykawaiicontrolle (Controle Gamer Kawaii)
};

const COMMAND_ICONS = {
  // Bosque da Pyxie
  explore: 'https://cdn.discordapp.com/emojis/1548444170488778954.gif',
  explorar: 'https://cdn.discordapp.com/emojis/1548444170488778954.gif',
  gloom: 'https://cdn.discordapp.com/emojis/1548443941144109181.gif',
  bosque: 'https://cdn.discordapp.com/emojis/1548443941144109181.gif',
  grimorio: 'https://cdn.discordapp.com/emojis/1551355882447704124.gif',
  grimoire: 'https://cdn.discordapp.com/emojis/1551355882447704124.gif',
  vasculhar: 'https://cdn.discordapp.com/emojis/1548443807694069760.gif',
  scavenge: 'https://cdn.discordapp.com/emojis/1548443807694069760.gif',
  wiki: 'https://cdn.discordapp.com/emojis/1551356435521339452.gif',

  // Economia & Carreiras
  trade: 'https://cdn.discordapp.com/emojis/1548443977429028955.gif',
  trocar: 'https://cdn.discordapp.com/emojis/1548443977429028955.gif',
  daily: 'https://cdn.discordapp.com/emojis/1548444204202459136.gif',
  diario: 'https://cdn.discordapp.com/emojis/1548444204202459136.gif',
  wallet: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif',
  carteira: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif',
  profession: 'https://cdn.discordapp.com/emojis/1551356441112084641.gif',
  profissao: 'https://cdn.discordapp.com/emojis/1551356441112084641.gif',
  work: 'https://cdn.discordapp.com/emojis/1548444173747621918.gif',
  trabalho: 'https://cdn.discordapp.com/emojis/1548444173747621918.gif',
  rank: 'https://cdn.discordapp.com/emojis/1548443887025266739.gif',
  ranking: 'https://cdn.discordapp.com/emojis/1548443887025266739.gif',
  vote: 'https://cdn.discordapp.com/emojis/1551356493050413159.gif',
  votar: 'https://cdn.discordapp.com/emojis/1551356493050413159.gif',
  bonus: 'https://cdn.discordapp.com/emojis/1548444204202459136.gif',
  recompensa: 'https://cdn.discordapp.com/emojis/1548444204202459136.gif',
  seteco: 'https://cdn.discordapp.com/emojis/1548444225635483672.png',
  setareconomia: 'https://cdn.discordapp.com/emojis/1548444225635483672.png',
  reseteco: 'https://cdn.discordapp.com/emojis/1548444272628465694.png',
  resetareconomia: 'https://cdn.discordapp.com/emojis/1548444272628465694.png',
  ecoconfig: 'https://cdn.discordapp.com/emojis/1548444225635483672.png',
  configeconomia: 'https://cdn.discordapp.com/emojis/1548444225635483672.png',

  // Loja & Mochila
  shop: 'https://cdn.discordapp.com/emojis/1548444209328033913.png',
  loja: 'https://cdn.discordapp.com/emojis/1548444209328033913.png',
  inventory: 'https://cdn.discordapp.com/emojis/1548443778359103579.png',
  inventario: 'https://cdn.discordapp.com/emojis/1548443778359103579.png',
  mochila: 'https://cdn.discordapp.com/emojis/1548443778359103579.png',
  buy: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif',
  comprar: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif',
  sell: 'https://cdn.discordapp.com/emojis/1548443977429028955.gif',
  vender: 'https://cdn.discordapp.com/emojis/1548443977429028955.gif',

  // Tarot Místico
  tarot: 'https://cdn.discordapp.com/emojis/1551356087611957269.gif',

  // Social & Casamentos & Minigames
  ship: 'https://cdn.discordapp.com/emojis/1548444199970545756.gif',
  casal: 'https://cdn.discordapp.com/emojis/1548444199970545756.gif',
  marriage: 'https://cdn.discordapp.com/emojis/1551355484131299439.gif',
  marry: 'https://cdn.discordapp.com/emojis/1551355484131299439.gif',
  casamento: 'https://cdn.discordapp.com/emojis/1551355484131299439.gif',
  divorce: 'https://cdn.discordapp.com/emojis/1548444272628465694.png',
  divorcio: 'https://cdn.discordapp.com/emojis/1548444272628465694.png',
  profile: 'https://cdn.discordapp.com/emojis/1551356277194625224.gif',
  perfil: 'https://cdn.discordapp.com/emojis/1551356277194625224.gif',
  cookie: 'https://cdn.discordapp.com/emojis/1551356672260444220.gif',
  biscoito: 'https://cdn.discordapp.com/emojis/1551356672260444220.gif',
  jokenpo: 'https://cdn.discordapp.com/emojis/1548444319730499664.gif',
  likely: 'https://cdn.discordapp.com/emojis/1548444134443065446.gif',
  provavel: 'https://cdn.discordapp.com/emojis/1548444134443065446.gif',
  dados: 'https://cdn.discordapp.com/emojis/1551356333272596572.gif',
  dice: 'https://cdn.discordapp.com/emojis/1551356333272596572.gif',
  coinflip: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif',
  moeda: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif',

  // Utilidades & Sistema
  help: 'https://cdn.discordapp.com/emojis/1551355882447704124.gif',
  ajuda: 'https://cdn.discordapp.com/emojis/1551355882447704124.gif',
  ping: 'https://cdn.discordapp.com/emojis/1548444326621741096.png',
  info: 'https://cdn.discordapp.com/emojis/1551355784124825731.gif',
  invite: 'https://cdn.discordapp.com/emojis/1548444149785694238.gif',
  convite: 'https://cdn.discordapp.com/emojis/1548444149785694238.gif',
  welcome: 'https://cdn.discordapp.com/emojis/1548443766799732837.gif',
  boasvindas: 'https://cdn.discordapp.com/emojis/1548443766799732837.gif',
  setwelcome: 'https://cdn.discordapp.com/emojis/1548443766799732837.gif',
  schedule: 'https://cdn.discordapp.com/emojis/1548444158245736481.gif',
  agenda: 'https://cdn.discordapp.com/emojis/1548444158245736481.gif',
  emojis: 'https://cdn.discordapp.com/emojis/1548444202621214840.gif',
  language: 'https://cdn.discordapp.com/emojis/1551356365065166998.gif',
  idioma: 'https://cdn.discordapp.com/emojis/1551356365065166998.gif',
  sixseven: 'https://cdn.discordapp.com/emojis/1551356116481482754.gif',
  admin: 'https://cdn.discordapp.com/emojis/1551356439736352878.png',
};

const MODULE_METADATA = {
  todos: { id: 'todos', label: 'Visão Geral', emoji: '📖', iconUrl: MODULE_ICONS.todos, desc: 'Visão geral e índice de todas as categorias' },
  bosque: { id: 'bosque', label: 'Bosque da Pyxie', emoji: '🌲', iconUrl: MODULE_ICONS.bosque, desc: 'Exploração de cenários pixel, espíritos, fusão de almas e chefão comunitário' },
  economia: { id: 'economia', label: 'Economia & Carreiras', emoji: '🪙', iconUrl: MODULE_ICONS.economia, desc: 'Moedinhas, trabalho, profissões, rankings, trocas e cofres' },
  loja: { id: 'loja', label: 'Loja & Mochila', emoji: '🎒', iconUrl: MODULE_ICONS.loja, desc: 'Baús misteriosos, itens e inventário' },
  tarot: { id: 'tarot', label: 'Tarot Místico', emoji: '🔮', iconUrl: MODULE_ICONS.tarot, desc: 'Tiragens diárias, 78 arcanos e oráculo do destino' },
  social: { id: 'social', label: 'Social & Casamentos', emoji: '💑', iconUrl: MODULE_ICONS.social, desc: 'Casamentos, divórcios, perfil de aventureiro e afinidade' },
  utilidades: { id: 'utilidades', label: 'Utilidades & Sistema', emoji: '⚙️', iconUrl: MODULE_ICONS.utilidades, desc: 'Status operacional, ping, convite, agenda, idioma e configurações' },
};

const MODULE_KEYS = ['todos', 'bosque', 'economia', 'loja', 'tarot', 'social', 'utilidades'];
const MODULE_EMOJIS = {
  todos: '📖',
  bosque: '🌲',
  economia: '🪙',
  loja: '🎒',
  tarot: '🔮',
  social: '💑',
  utilidades: '⚙️',
};

const COMMAND_CATEGORY_MAP = {
  // Bosque da Pyxie
  explore: 'bosque',
  'py-explore': 'bosque',
  explorar: 'bosque',
  'py-explorar': 'bosque',
  gloom: 'bosque',
  'py-gloom': 'bosque',
  bosque: 'bosque',
  'py-bosque': 'bosque',
  grimorio: 'bosque',
  'py-grimorio': 'bosque',
  grimoire: 'bosque',
  'py-grimoire': 'bosque',
  vasculhar: 'bosque',
  'py-vasculhar': 'bosque',
  scavenge: 'bosque',
  'py-scavenge': 'bosque',
  wiki: 'bosque',
  'py-wiki': 'bosque',

  // Economia & Carreiras
  trade: 'economia',
  'py-trade': 'economia',
  trocar: 'economia',
  'py-trocar': 'economia',
  daily: 'economia',
  'py-daily': 'economia',
  diario: 'economia',
  'py-diario': 'economia',
  wallet: 'economia',
  'py-wallet': 'economia',
  carteira: 'economia',
  'py-carteira': 'economia',
  profession: 'economia',
  'py-profession': 'economia',
  profissao: 'economia',
  'py-profissao': 'economia',
  work: 'economia',
  'py-work': 'economia',
  trabalho: 'economia',
  'py-trabalho': 'economia',
  rank: 'economia',
  'py-rank': 'economia',
  ranking: 'economia',
  'py-ranking': 'economia',
  vote: 'economia',
  'py-vote': 'economia',
  votar: 'economia',
  'py-votar': 'economia',
  ecoconfig: 'economia',
  'py-ecoconfig': 'economia',
  configeconomia: 'economia',
  'py-configeconomia': 'economia',
  seteco: 'economia',
  'py-seteco': 'economia',
  setareconomia: 'economia',
  'py-setareconomia': 'economia',
  reseteco: 'economia',
  'py-reseteco': 'economia',
  resetareconomia: 'economia',
  'py-resetareconomia': 'economia',
  bonus: 'economia',
  'py-bonus': 'economia',
  recompensa: 'economia',
  'py-recompensa': 'economia',

  // Loja & Mochila
  shop: 'loja',
  'py-shop': 'loja',
  loja: 'loja',
  'py-loja': 'loja',
  inventory: 'loja',
  'py-inventory': 'loja',
  inventario: 'loja',
  'py-inventario': 'loja',
  buy: 'loja',
  'py-buy': 'loja',
  comprar: 'loja',
  'py-comprar': 'loja',
  sell: 'loja',
  'py-sell': 'loja',
  vender: 'loja',
  'py-vender': 'loja',
  mochila: 'loja',
  'py-mochila': 'loja',

  // Tarot Místico
  tarot: 'tarot',
  'py-tarot': 'tarot',

  // Social & Casamentos
  ship: 'social',
  'py-ship': 'social',
  casal: 'social',
  'py-casal': 'social',
  marriage: 'social',
  'py-marriage': 'social',
  marry: 'social',
  'py-marry': 'social',
  casamento: 'social',
  'py-casamento': 'social',
  divorce: 'social',
  'py-divorce': 'social',
  divorcio: 'social',
  'py-divorcio': 'social',
  profile: 'social',
  'py-profile': 'social',
  perfil: 'social',
  'py-perfil': 'social',
  jokenpo: 'social',
  'py-jokenpo': 'social',
  rps: 'social',
  'py-rps': 'social',
  likely: 'social',
  'py-likely': 'social',
  provavel: 'social',
  'py-provavel': 'social',
  dice: 'social',
  'py-dice': 'social',
  dado: 'social',
  'py-dado': 'social',
  cookie: 'economia',
  'py-cookie': 'economia',
  biscoito: 'economia',
  'py-biscoito': 'economia',
  coinflip: 'economia',
  'py-coinflip': 'economia',
  caraoucoroa: 'economia',
  'py-caraoucoroa': 'economia',

  // Utilidades & Sistema
  help: 'utilidades',
  'py-help': 'utilidades',
  ajuda: 'utilidades',
  'py-ajuda': 'utilidades',
  ping: 'utilidades',
  'py-ping': 'utilidades',
  status: 'utilidades',
  'py-status': 'utilidades',
  invite: 'utilidades',
  'py-invite': 'utilidades',
  convite: 'utilidades',
  'py-convite': 'utilidades',
  welcome: 'utilidades',
  'py-welcome': 'utilidades',
  boasvindas: 'utilidades',
  'py-boasvindas': 'utilidades',
  setwelcome: 'utilidades',
  schedule: 'utilidades',
  'py-schedule': 'utilidades',
  agenda: 'utilidades',
  'py-agenda': 'utilidades',
  emojis: 'utilidades',
  'py-emojis': 'utilidades',
  language: 'utilidades',
  'py-language': 'utilidades',
  idioma: 'utilidades',
  'py-idioma': 'utilidades',
  sixseven: 'utilidades',
  'py-sixseven': 'utilidades',
  admin: 'utilidades',
  'py-admin': 'utilidades',
};

let _loadedCommands = null;

function setLoadedCommands(cmds) {
  _loadedCommands = cmds;
}

const OWNER_ONLY_COMMANDS = new Set([
  'py-seteco',
  'seteco',
  'py-setareconomia',
  'setareconomia',
  'py-reseteco',
  'reseteco',
  'py-resetareconomia',
  'resetareconomia',
  'py-ecoconfig',
  'ecoconfig',
  'py-configeconomia',
  'configeconomia',
  'py-admin',
  'admin',
]);

const { OWNER_SNOWFLAKE } = require('../services/adminAuth');

function isOwnerUser(source) {
  if (!source) return false;
  if (typeof source === 'object') {
    if (source.isOwner === true) return true;
    const uid = source.user?.id || source.author?.id || source.userId;
    if (uid === OWNER_SNOWFLAKE) return true;
  }
  if (typeof source === 'string' && source === OWNER_SNOWFLAKE) {
    return true;
  }
  return false;
}

function getHelpModules(customCommands = null, source = null) {
  let commandsList = customCommands || _loadedCommands;
  if (!commandsList) {
    try {
      commandsList = require('./index').commands || [];
    } catch (e) {
      commandsList = [];
    }
  }

  const isEn = getLanguage(source) === 'en';
  const isOwner = isOwnerUser(source);

  const moduleCommands = {
    bosque: [],
    economia: [],
    loja: [],
    tarot: [],
    social: [],
    utilidades: [],
  };

  const seen = new Set();
  for (const cmd of commandsList) {
    const name = cmd.data?.name || cmd.name;
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const bareName = name.startsWith('py-') ? name.slice(3) : name;
    if (!isOwner && (OWNER_ONLY_COMMANDS.has(name) || OWNER_ONLY_COMMANDS.has(bareName))) {
      continue;
    }

    let desc = '';
    if (isEn) {
      desc = cmd.data?.description || cmd.description || 'Pyxie command';
    } else {
      desc = cmd.data?.description_localizations?.['pt-BR'] ||
        cmd.data?.descriptionLocalizations?.['pt-BR'] ||
        cmd.description ||
        cmd.data?.description ||
        'Comando da Pyxie';
    }

    const category = cmd.category || COMMAND_CATEGORY_MAP[name] || 'utilidades';
    const targetBucket = moduleCommands[category] || moduleCommands.utilidades;
    const iconUrl = COMMAND_ICONS[bareName] || COMMAND_ICONS[name] || MODULE_ICONS[category] || null;

    targetBucket.push({
      name: `/${name}`,
      desc,
      aliases: cmd.aliases || [],
      iconUrl,
    });
  }

  return MODULE_KEYS.map((key) => {
    const label = t(`help.categories.${key}.label`, source) || MODULE_METADATA[key]?.label || key;
    const desc = t(`help.categories.${key}.desc`, source) || MODULE_METADATA[key]?.desc || '';
    const emoji = MODULE_EMOJIS[key] || '📖';
    const iconUrl = MODULE_ICONS[key] || MODULE_METADATA[key]?.iconUrl || null;
    if (key === 'todos') {
      return { id: key, label, emoji, iconUrl, desc };
    }
    return { id: key, label, emoji, iconUrl, desc, commands: moduleCommands[key] || [] };
  });
}

function buildModularHelpEmbed(moduleId = 'todos', guildName = '', source = null) {
  const isEn = getLanguage(source) === 'en';
  const modules = getHelpModules(null, source);
  const mod = modules.find((m) => m.id === moduleId) || modules[0];

  const embed = new EmbedBuilder()
    .setColor('#E60067')
    .setTitle(t('help.title', source, { emoji: mod.emoji, label: mod.label }))
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();

  if (mod.id === 'todos') {
    const moduleLines = modules
      .filter((m) => m.id !== 'todos')
      .map((m) => `**${m.emoji} ${m.label}** (${(m.commands || []).length} ${isEn ? 'commands' : 'comandos'})\n> *${m.desc}*`);

    const serverPrefix = guildName ? ` (**${guildName}**)` : '';
    const desc = [
      t('help.welcome', source, { server: serverPrefix }),
      '',
      t('help.modulesHeader', source),
      '',
      moduleLines.join('\n\n'),
      '',
      t('help.tipDropdown', source),
    ].join('\n');

    embed.setDescription(desc);
  } else {
    const cmdLines = (mod.commands || []).length > 0
      ? mod.commands.map((cmd) => `**\`${cmd.name}\`**\n> *${cmd.desc}*`)
      : [t('help.noCommands', source)];

    const desc = [
      `*« ${mod.desc} »*`,
      '',
      t('help.commandsHeader', source, { count: mod.commands?.length || 0 }),
      '',
      cmdLines.join('\n\n'),
      '',
      t('help.tipNav', source),
    ].join('\n');

    embed.setDescription(desc);
  }

  return embed;
}

function buildModularHelpComponents(currentModuleId = 'todos', userId = '', source = null) {
  const ctx = source || (userId ? { userId } : null);
  const modules = getHelpModules(null, ctx);
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`help_module_select:${userId}`)
    .setPlaceholder(t('help.selectPlaceholder', ctx))
    .addOptions(
      modules.map((m) => ({
        label: m.label,
        value: m.id,
        emoji: m.emoji,
        description: (m.desc || '').slice(0, 100),
        default: m.id === currentModuleId,
      }))
    );

  return [new ActionRowBuilder().addComponents(selectMenu)];
}

function buildHelpMessage(requestedModule = 'todos', userId = '', source = null) {
  const embed = buildModularHelpEmbed(requestedModule, '', source);
  const components = buildModularHelpComponents(requestedModule, userId, source);
  return { embed, components, page: 1, totalPages: 1 };
}

module.exports = {
  MODULE_METADATA,
  COMMAND_CATEGORY_MAP,
  get HELP_MODULES() {
    return getHelpModules();
  },
  setLoadedCommands,
  getHelpModules,
  buildModularHelpEmbed,
  buildModularHelpComponents,
  buildHelpMessage,
};
