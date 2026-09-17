const {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { getLanguage, t } = require('../utils/i18n');

const MODULE_METADATA = {
  todos: { id: 'todos', label: 'Visão Geral', emoji: '📖', desc: 'Visão geral e índice de todas as categorias' },
  economia: { id: 'economia', label: 'Economia & Carreiras', emoji: '🪙', desc: 'Moedinhas, trabalho, profissões, rankings, trocas e cofres' },
  loja: { id: 'loja', label: 'Loja & Mochila', emoji: '🎒', desc: 'Baús misteriosos, itens e inventário' },
  tarot: { id: 'tarot', label: 'Tarot Místico', emoji: '🔮', desc: 'Tiragens diárias, 78 arcanos e oráculo do destino' },
  social: { id: 'social', label: 'Social & Casamentos', emoji: '💑', desc: 'Casamentos, divórcios, perfil de aventureiro e afinidade' },
  utilidades: { id: 'utilidades', label: 'Utilidades & Sistema', emoji: '⚙️', desc: 'Status operacional, ping, convite, agenda, idioma e configurações' },
};

const MODULE_KEYS = ['todos', 'economia', 'loja', 'tarot', 'social', 'utilidades'];
const MODULE_EMOJIS = {
  todos: '📖',
  economia: '🪙',
  loja: '🎒',
  tarot: '🔮',
  social: '💑',
  utilidades: '⚙️',
};

const COMMAND_CATEGORY_MAP = {
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

    targetBucket.push({
      name: `/${name}`,
      desc,
      aliases: cmd.aliases || [],
    });
  }

  return MODULE_KEYS.map((key) => {
    const label = t(`help.categories.${key}.label`, source) || MODULE_METADATA[key]?.label || key;
    const desc = t(`help.categories.${key}.desc`, source) || MODULE_METADATA[key]?.desc || '';
    const emoji = MODULE_EMOJIS[key] || '📖';
    if (key === 'todos') {
      return { id: key, label, emoji, desc };
    }
    return { id: key, label, emoji, desc, commands: moduleCommands[key] || [] };
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
        description: (m.desc || '').slice(0, 50),
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
