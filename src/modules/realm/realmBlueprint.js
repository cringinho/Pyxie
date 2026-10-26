/**
 * Blueprint do servidor oficial Pyxie's Realm (docs/realm/PROMPT-PYXIES-REALM.md).
 * O provisionador (scripts/realm/provision.js) compara isto com o servidor e cria o que faltar.
 * Itens são achados pelo nome; nada que não esteja aqui é apagado.
 */

const GUILD_ID = '1564375898851909653';
const OWNER_ID = '214153735281180673';

const COLORS = {
  pyxie: 0xe60067,
  softPink: 0xff8fb3,
  violet: 0x8b5cf6,
  deepPurple: 0x4b0082,
  gold: 0xf59e0b,
  green: 0x22c55e,
  nyxiel: 0xff2e55,
  ink: 0x1a1a1a,
};

// Cargos de cima para baixo (logo abaixo do cargo do bot). `divider` = separador visual sem permissões.
const ROLES = [
  { key: 'architect', name: '✦ Realm Architect', color: COLORS.deepPurple, hoist: true, grantTo: [OWNER_ID] },
  { key: 'div_prestige', name: '── prestige ──', color: COLORS.ink, divider: true },
  { key: 'nyx_slayer', name: '✦ Nyx Slayer', color: COLORS.nyxiel, hoist: true },
  { key: 'grand_arcanist', name: '✦ Grand Arcanist', color: COLORS.violet, hoist: true },
  { key: 'eternal_covenant', name: '✦ Eternal Covenant', color: COLORS.softPink, hoist: true },
  { key: 'nyxiel_vanguard', name: '✦ Nyxiel Vanguard', color: COLORS.gold, hoist: true },
  { key: 'div_vocations', name: '── vocations ──', color: COLORS.ink, divider: true },
  { key: 'voc_master', name: '❖ Master', color: COLORS.gold },
  { key: 'voc_specialist', name: '❖ Specialist', color: COLORS.violet },
  { key: 'voc_apprentice', name: '❖ Apprentice', color: COLORS.softPink },
  { key: 'voc_novice', name: '❖ Novice', color: COLORS.green },
  { key: 'div_realm', name: '── realm ──', color: COLORS.ink, divider: true },
  { key: 'citizen', name: '🌸 Realm Citizen', color: COLORS.pyxie },
  { key: 'div_languages', name: '── languages ──', color: COLORS.ink, divider: true },
  { key: 'lang_en', name: 'English' },
  { key: 'lang_pt', name: 'Português' },
  { key: 'lang_es', name: 'Español' },
  { key: 'lang_fr', name: 'Français' },
  { key: 'lang_de', name: 'Deutsch' },
  { key: 'lang_ja', name: '日本語' },
  { key: 'lang_other', name: 'Other languages' },
  { key: 'div_interaction', name: '── interaction ──', color: COLORS.ink, divider: true },
  { key: 'int_tone', name: 'Tone Indicators Please' },
  { key: 'int_literal', name: 'Literal & Direct' },
  { key: 'int_battery', name: 'Low Social Battery' },
  { key: 'int_nopings', name: 'No Pings Please' },
  { key: 'div_pronouns', name: '── pronouns ──', color: COLORS.ink, divider: true },
  { key: 'pr_he', name: 'he/him' },
  { key: 'pr_she', name: 'she/her' },
  { key: 'pr_they', name: 'they/them' },
  { key: 'pr_ele', name: 'ele/dele' },
  { key: 'pr_ela', name: 'ela/dela' },
  { key: 'pr_elu', name: 'elu/delu' },
  { key: 'pr_any', name: 'any pronouns' },
  { key: 'pr_ask', name: 'ask me' },
];

// Perfis de permissão do @everyone em cada canal
const ACCESS = {
  open: null, // herda: ver e conversar
  readonly: 'readonly', // ver e reagir, sem escrever
  private: 'private', // só o dono e o bot
};

const SUPPORT_TAGS = [
  { name: 'Needs Comfort', emoji: '🫂' },
  { name: 'Advice Welcome', emoji: '💡' },
  { name: 'Just Listening', emoji: '🕯️' },
];

const CATEGORIES = [
  {
    key: 'gateway',
    name: '✦ THE FAIRY GATEWAY',
    channels: [
      { key: 'rules', name: '╭📜・realm-laws', type: 'text', access: ACCESS.readonly, topic: "⚖️ The laws of Pyxie's Realm and the story of our war against Nyxiel. Buttons below translate them to Português and Español." },
      { key: 'status', name: '┃🗺️・realm-status', type: 'text', access: ACCESS.readonly, topic: '🗺️ What is happening in the Realm right now: the weekly boss, the season and the latest roleplay tales. Pyxie updates it every 30 minutes.' },
      { key: 'announcements', name: '╰📢・dramatic-supervision', type: 'announcement', access: ACCESS.readonly, topic: '🦇 Updates, events and dramatic announcements from Pyxie. "It\'s not affection. It\'s dramatic supervision."' },
    ],
  },
  {
    key: 'heart',
    name: '✦ HEART OF THE REALM',
    channels: [
      { key: 'plaza', name: '╭💬・crystal-plaza', type: 'text', topic: "💜 Main lounge, in English. Check people's interaction roles before joking around. Speak another language? Pick it in Channels & Roles and your cottage shows up." },
      { key: 'introductions', name: '╰🪪・introductions', type: 'forum', topic: '✨ Tell the realm who you are: name, pronouns, what you love, what you\'re playing. Share only what you want to share.', defaultReaction: '🌸' },
    ],
  },
  {
    key: 'voice',
    name: '✦ VOICE LOUNGES',
    channels: [
      { key: 'breeze', name: '╭🌙・whispering-breeze', type: 'voice' },
      { key: 'voice_en', name: '╰🇬🇧・english-lounge', type: 'voice' },
    ],
  },
  {
    // Cada casinha (texto + voz) só aparece para quem tem o cargo da língua, escolhido no onboarding
    key: 'cottages',
    name: '✦ LANGUAGE COTTAGES',
    channels: [
      { key: 'cottage_pt', name: '🇧🇷・casinha-português', type: 'text', access: { role: 'lang_pt' }, topic: '🏡 A casinha de quem fala português. Conversa à vontade!' },
      { key: 'voice_pt', name: '🇧🇷・sala-português', type: 'voice', access: { role: 'lang_pt' } },
      { key: 'cottage_es', name: '🇪🇸・casita-español', type: 'text', access: { role: 'lang_es' }, topic: '🏡 La casita de quienes hablan español. ¡Siéntete en casa!' },
      { key: 'voice_es', name: '🇪🇸・sala-español', type: 'voice', access: { role: 'lang_es' } },
      { key: 'cottage_fr', name: '🇫🇷・maisonnette-français', type: 'text', access: { role: 'lang_fr' }, topic: '🏡 La maisonnette des francophones. Fais comme chez toi !' },
      { key: 'voice_fr', name: '🇫🇷・salon-français', type: 'voice', access: { role: 'lang_fr' } },
      { key: 'cottage_de', name: '🇩🇪・häuschen-deutsch', type: 'text', access: { role: 'lang_de' }, topic: '🏡 Das Häuschen für alle, die Deutsch sprechen. Fühl dich wie zu Hause!' },
      { key: 'voice_de', name: '🇩🇪・lounge-deutsch', type: 'voice', access: { role: 'lang_de' } },
      { key: 'cottage_ja', name: '🇯🇵・日本語コテージ', type: 'text', access: { role: 'lang_ja' }, topic: '🏡 日本語を話す人のためのコテージです。ゆっくりしていってね！' },
      { key: 'voice_ja', name: '🇯🇵・日本語ラウンジ', type: 'voice', access: { role: 'lang_ja' } },
      { key: 'cottage_other', name: '🌐・polyglot-cottage', type: 'text', access: { role: 'lang_other' }, topic: '🏡 For every other language. Say which one you speak and find your people.' },
      { key: 'voice_other', name: '🌐・polyglot-lounge', type: 'voice', access: { role: 'lang_other' } },
    ],
  },
  {
    key: 'haven',
    name: '✦ SAFE HAVEN',
    channels: [
      { key: 'sanctuary', name: '╭🦋・cozy-sanctuary', type: 'text', slowmode: 10, topic: '🌱 A calm room for neurodivergent and disabled citizens and anyone who needs a slower chat. Tone indicators welcome, no judgment.' },
      { key: 'pods', name: '╰🕯️・support-pods', type: 'forum', slowmode: 10, topic: '🕯️ Vent and get support. Pick a tag: Needs Comfort, Advice Welcome or Just Listening (no replies, only kind reactions). Add a content warning to heavy topics.', tags: SUPPORT_TAGS, requireTag: true, defaultReaction: '🫂' },
    ],
  },
  {
    key: 'pavilion',
    name: '✦ MYSTIC PAVILION',
    channels: [
      { key: 'tarot', name: '╭🔮・tarot-and-oracles', type: 'text', commands: ['py-tarot', 'py-album'], topic: '🃏 Draw your fate with /py-tarot and show off your 78-card binder with /py-album.' },
      { key: 'vocations', name: '┃💼・guild-of-vocations', type: 'text', commands: ['py-work', 'py-profession', 'py-daily', 'py-wallet', 'py-craft', 'py-rank'], topic: '🛠️ Work shifts with /py-work, change careers with /py-profession, claim /py-daily and craft furniture with /py-craft.' },
      { key: 'love', name: '┃💍・love-and-cottages', type: 'text', commands: ['py-ship', 'py-marriage', 'py-divorce', 'py-child', 'py-home'], topic: '💖 /py-ship, /py-marriage and your cozy cottage with /py-home.' },
      { key: 'market', name: '┃🛒・market-square', type: 'text', commands: ['py-market', 'py-festival', 'py-pass'], topic: '🪙 Trade items with /py-market, open Festival boxes with /py-festival and level your /py-pass.' },
      { key: 'arcade', name: '╰🎲・arcade', type: 'text', commands: ['py-quiz', 'py-likely', 'py-jokenpo', 'py-coinflip', 'py-dice', 'py-duel', 'py-challenge', 'py-anime', 'py-sixseven', 'py-math', 'py-minesweeper', 'py-tictactoe'], topic: '🎮 /py-quiz, /py-likely, /py-jokenpo, /py-coinflip and /py-dice.' },
    ],
  },
  {
    key: 'border',
    name: '✦ NYXIEL BORDER',
    channels: [
      { key: 'frontline', name: '╭⚔️・nyxiel-frontline', type: 'text', commands: ['py-boss'], topic: "⚠️ The border with Nyxiel. The weekly boss (/py-boss) lands here, and Nyx's rifts open without warning." },
      { key: 'catacombs', name: '┃🕯️・catacombs', type: 'text', commands: ['py-dungeon'], topic: '🕯️ Descend into the Velvet Catacombs with /py-dungeon. Every run gets its own thread. Nyx waits on the last floor.' },
      {
        key: 'tales',
        name: '╰🎭・roleplay-tales',
        type: 'forum',
        topic:
          '📖 Tales in the Realm and Nyxiel, narrated by Pyxie. Create your sheet with /py-character create, open a post and write *actions* and "speech". Pyxie answers a few seconds after the last message, voices the NPCs and asks for d20 rolls. ((double parentheses)) = out of character. SFW only, tag your genre and add a content warning when needed.',
        tags: [
          { name: 'Adventure', emoji: '⚔️' },
          { name: 'Slice of Life', emoji: '🏡' },
          { name: 'Mystery', emoji: '🔮' },
          { name: 'Nyxiel War', emoji: '💀' },
          { name: 'Content Warning', emoji: '⚠️' },
        ],
        defaultReaction: '✨',
      },
    ],
  },
  {
    key: 'museum',
    name: '✦ MUSEUM & ALLIANCES',
    channels: [
      { key: 'art', name: '╭🎨・art-museum', type: 'text', commands: ['py-museum'], topic: '🖼️ Share your original art (attachments only). Credit other artists, always.' },
      { key: 'alliances', name: '┃🤝・realm-alliances', type: 'text', access: ACCESS.readonly, topic: '🌐 Communities, creators and projects allied with the Realm.' },
      { key: 'partners', name: '╰📋・partnership-requests', type: 'text', commands: ['py-partner'], access: ACCESS.readonly, topic: '✨ Want to partner with the Realm? Use the panel here.' },
    ],
  },
  {
    key: 'crown',
    name: '✦ CROWN',
    access: ACCESS.private,
    channels: [{ key: 'logs', name: '🔒・pyxie-logs', type: 'text', access: ACCESS.private, topic: 'AutoMod alerts, Discord safety alerts and Pyxie reports. Owner only.' }],
  },
];

const COMMUNITY = {
  verificationLevel: 2, // MEDIUM: e-mail verificado e conta com mais de 5 minutos
  explicitContentFilter: 2, // ALL_MEMBERS
  rulesChannel: 'rules',
  updatesChannel: 'logs',
  safetyAlertsChannel: 'logs',
  description: "Pyxie's official realm: a cozy, global and SFW home for fairies, humans and everyone in between.",
};

// AutoMod nativo do Discord (todas as regras alertam no #pyxie-logs)
const AUTOMOD = [
  { key: 'presets', name: 'Pyxie • Slurs and sexual content', triggerType: 4, metadata: { presets: [2, 3] }, actions: ['block', 'alert'] },
  { key: 'mentions', name: 'Pyxie • Mention spam', triggerType: 5, metadata: { mention_total_limit: 5, mention_raid_protection_enabled: true }, actions: ['block', 'alert', 'timeout'] },
  { key: 'spam', name: 'Pyxie • Suspected spam', triggerType: 3, metadata: {}, actions: ['block'] },
  {
    key: 'malware',
    name: 'Pyxie • Nyxiel malware (invites and scams)',
    triggerType: 1,
    metadata: {
      keyword_filter: ['*discord.gg/*', '*discord.com/invite/*', '*discordapp.com/invite/*', '*dsc.gg/*', 'free nitro', 'nitro gift', 'steam gift', '*bit.ly/*', '*tinyurl.com/*', '*grabify*', '*iplogger*'],
    },
    exemptChannels: ['alliances', 'partners'],
    actions: ['block', 'alert'],
  },
];

const TIMEOUT_SECONDS = 600;

// Canais criados antes e tirados do blueprint (o provisionador só apaga se o ID estiver no próprio estado)
const RETIRED_CHANNELS = ['cottages'];

// Onboarding nativo: idioma é obrigatório (e dá o cargo de cidadão); o resto é opcional
const ONBOARDING = {
  defaultChannels: ['rules', 'announcements', 'plaza', 'introductions', 'sanctuary', 'tarot', 'vocations', 'arcade', 'frontline', 'catacombs', 'art'],
  prompts: [
    {
      title: 'Which languages do you speak?',
      required: true,
      single: false,
      options: [
        { title: 'English', emoji: '🇬🇧', roles: ['lang_en', 'citizen'] },
        { title: 'Português', emoji: '🇧🇷', roles: ['lang_pt', 'citizen'] },
        { title: 'Español', emoji: '🇪🇸', roles: ['lang_es', 'citizen'] },
        { title: 'Français', emoji: '🇫🇷', roles: ['lang_fr', 'citizen'] },
        { title: 'Deutsch', emoji: '🇩🇪', roles: ['lang_de', 'citizen'] },
        { title: '日本語', emoji: '🇯🇵', roles: ['lang_ja', 'citizen'] },
        { title: 'Other languages', emoji: '🌐', roles: ['lang_other', 'citizen'] },
      ],
    },
    {
      title: 'How should people talk to you?',
      required: false,
      single: false,
      options: [
        { title: 'Tone indicators, please', description: '/j, /srs, /lh help me read the vibe', emoji: '💬', roles: ['int_tone'] },
        { title: 'Literal & direct', description: 'Skip sarcasm and hints with me', emoji: '🎯', roles: ['int_literal'] },
        { title: 'Low social battery', description: 'I might stay quiet, and that is okay', emoji: '🔋', roles: ['int_battery'] },
        { title: 'No pings, please', description: 'Do not mention me unless it is important', emoji: '🔕', roles: ['int_nopings'] },
      ],
    },
    {
      title: 'Your pronouns (optional)',
      required: false,
      single: false,
      options: [
        { title: 'he/him', emoji: '💙', roles: ['pr_he'] },
        { title: 'she/her', emoji: '💗', roles: ['pr_she'] },
        { title: 'they/them', emoji: '💜', roles: ['pr_they'] },
        { title: 'ele/dele', emoji: '🩵', roles: ['pr_ele'] },
        { title: 'ela/dela', emoji: '🩷', roles: ['pr_ela'] },
        { title: 'elu/delu', emoji: '🤍', roles: ['pr_elu'] },
        { title: 'any pronouns', emoji: '🌈', roles: ['pr_any'] },
        { title: 'ask me', emoji: '💬', roles: ['pr_ask'] },
      ],
    },
    {
      title: 'What brings you to the Realm?',
      required: false,
      single: false,
      options: [
        { title: 'Tarot & oracles', emoji: '🔮', channels: ['tarot'] },
        { title: 'Catacombs & bosses', emoji: '⚔️', channels: ['catacombs', 'frontline'] },
        { title: 'Cottages, love & economy', emoji: '🏡', channels: ['love', 'vocations', 'market'] },
        { title: 'Games & quizzes', emoji: '🎲', channels: ['arcade'] },
        { title: 'Roleplay', emoji: '🎭', channels: ['tales'] },
        { title: 'Art & creators', emoji: '🎨', channels: ['art', 'alliances'] },
        { title: 'A calm place to talk', emoji: '🦋', channels: ['sanctuary', 'pods'] },
      ],
    },
  ],
};

// Tela de boas-vindas (Comunidade): até 5 canais
const WELCOME_SCREEN = {
  description: "A cozy realm built by a very dramatic fairy. Pick your languages and come say hi.",
  channels: [
    { channel: 'rules', description: 'Read the laws of the Realm', emoji: '📜' },
    { channel: 'plaza', description: 'Say hi in the main lounge', emoji: '💬' },
    { channel: 'tarot', description: 'Draw your fate with Pyxie', emoji: '🔮' },
    { channel: 'introductions', description: 'Introduce yourself', emoji: '🪪' },
    { channel: 'catacombs', description: 'Fight Nyx in the Catacombs', emoji: '⚔️' },
  ],
};

module.exports = { GUILD_ID, OWNER_ID, COLORS, ROLES, CATEGORIES, ACCESS, COMMUNITY, AUTOMOD, TIMEOUT_SECONDS, RETIRED_CHANNELS, ONBOARDING, WELCOME_SCREEN };
