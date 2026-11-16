/**
 * Planta do servidor "Pyxie Devs": comunicação enxuta sobre os jogos e projetos Roblox.
 * Idioma padrão: inglês (EN). Suporte a espanhol (ES) e português do Brasil (PT-BR).
 * Módulo puro (sem rede): o script `scripts/setup_pyxie_devs.js` aplica; os testes validam.
 */
const { PermissionFlagsBits: P } = require('discord.js');

const CHANNEL_TYPE = { text: 0, voice: 2, category: 4, announcement: 5 };

const GUILD_SETTINGS = {
  name: 'Pyxie Devs',
  preferredLocale: 'en-US', // inglês é o idioma padrão do servidor
  verificationLevel: 2, // conta com e-mail verificado e 5+ minutos no Discord
  explicitContentFilter: 2, // varre mídia de todos os membros
  defaultMessageNotifications: 1, // só menções: servidor de avisos não deve apitar o tempo todo
};

// Cargos. `key` liga o cargo às permissões dos canais.
const ROLES = [
  {
    key: 'devs', name: 'Pyxie Devs', color: 0xe60067, hoist: true, mentionable: false,
    permissions: [P.ManageMessages, P.ManageThreads, P.MentionEveryone, P.ViewAuditLog, P.ManageNicknames, P.ModerateMembers],
  },
  {
    key: 'mods', name: 'Moderator', color: 0x8b5cf6, hoist: true, mentionable: false,
    permissions: [P.ManageMessages, P.ManageThreads, P.ModerateMembers, P.KickMembers, P.ManageNicknames],
  },
  { key: 'en', name: 'English', color: 0x38bdf8, hoist: false, mentionable: false, permissions: [] },
  { key: 'es', name: 'Español', color: 0xfbbf24, hoist: false, mentionable: false, permissions: [] },
  { key: 'pt', name: 'Português (BR)', color: 0x10b981, hoist: false, mentionable: false, permissions: [] },
];

// Quem pode ver/escrever. `readonly`: todos leem, só a equipe escreve. `staff`: só a equipe vê.
const ACCESS = { open: 'open', readonly: 'readonly', staff: 'staff' };

const WELCOME_TEXT = [
  '### 👋 Welcome to Pyxie Devs!',
  'Here we share news, updates and behind-the-scenes of our Roblox games and projects.',
  '-# Default language: English · Also available in Español and Português (BR).',
  '',
  '### 👋 ¡Bienvenido a Pyxie Devs!',
  'Aquí compartimos novedades, actualizaciones y el detrás de cámaras de nuestros juegos y proyectos de Roblox.',
  '-# Idioma principal: inglés · También disponible en español y portugués (BR).',
  '',
  '### 👋 Bem-vindo(a) à Pyxie Devs!',
  'Aqui compartilhamos novidades, atualizações e bastidores dos nossos jogos e projetos do Roblox.',
  '-# Idioma padrão: inglês · Também disponível em espanhol e português (BR).',
].join('\n');

const RULES_TEXT = [
  '### 📜 Rules',
  '- Be kind and respectful. No harassment, hate speech or discrimination.',
  '- No spam, self-promotion or unsolicited links.',
  '- No exploits, cheats or leaks. Report bugs in the feedback channel.',
  '- Keep each language channel in its own language.',
  '',
  '### 📜 Reglas',
  '- Sé amable y respetuoso. Nada de acoso, odio ni discriminación.',
  '- Nada de spam, autopromoción ni enlaces no solicitados.',
  '- Nada de exploits, trampas ni filtraciones. Reporta errores en el canal de feedback.',
  '- Cada canal de idioma se mantiene en su idioma.',
  '',
  '### 📜 Regras',
  '- Seja gentil e respeitoso(a). Nada de assédio, ódio ou discriminação.',
  '- Nada de spam, autopromoção ou links não solicitados.',
  '- Nada de exploits, cheats ou vazamentos. Reporte bugs no canal de feedback.',
  '- Cada canal de idioma fica no seu idioma.',
].join('\n');

// Categorias e canais, na ordem em que aparecem. `post` marca o texto fixado ao criar.
const CATEGORIES = [
  {
    name: 'START HERE',
    channels: [
      { name: 'welcome', access: ACCESS.readonly, topic: 'Welcome · Bienvenido · Bem-vindo', post: WELCOME_TEXT },
      { name: 'rules', access: ACCESS.readonly, topic: 'Server rules · Reglas · Regras', post: RULES_TEXT },
    ],
  },
  {
    name: 'ANNOUNCEMENTS',
    channels: [
      { name: 'announcements', type: 'announcement', access: ACCESS.readonly, topic: 'Official news (English)' },
      { name: 'anuncios-es', type: 'announcement', access: ACCESS.readonly, topic: 'Noticias oficiales (Español)' },
      { name: 'anuncios-pt-br', type: 'announcement', access: ACCESS.readonly, topic: 'Novidades oficiais (Português BR)' },
      { name: 'game-updates', type: 'announcement', access: ACCESS.readonly, topic: 'Patch notes, releases and events · Notas de versión · Notas de atualização' },
    ],
  },
  {
    name: 'COMMUNITY',
    channels: [
      { name: 'general', access: ACCESS.open, topic: 'Chat in English' },
      { name: 'comunidad-es', access: ACCESS.open, topic: 'Charla en Español' },
      { name: 'comunidade-pt-br', access: ACCESS.open, topic: 'Bate-papo em Português (BR)' },
      { name: 'feedback-and-bugs', access: ACCESS.open, topic: 'Ideas and bug reports · Ideas y errores · Ideias e bugs' },
    ],
  },
  {
    name: 'STAFF',
    channels: [
      { name: 'staff-chat', access: ACCESS.staff, topic: 'Team only' },
      { name: 'mod-log', access: ACCESS.staff, topic: 'Moderation log' },
    ],
  },
];

/** Canais que o Discord Community usa (regras e avisos oficiais). */
const COMMUNITY_CHANNELS = { rules: 'rules', publicUpdates: 'announcements', system: 'welcome' };

function allChannelNames() {
  return CATEGORIES.flatMap((c) => c.channels.map((ch) => ch.name));
}

/**
 * Permissões de um canal, como lista `permission_overwrites` da API.
 * `roleIds` = { everyone, devs, mods } já resolvidos pelo script.
 */
function overwritesFor(access, roleIds) {
  const bit = (...flags) => String(flags.reduce((acc, f) => acc | f, 0n));
  const staff = [roleIds.devs, roleIds.mods].filter(Boolean);
  const staffAllow = bit(P.ViewChannel, P.SendMessages, P.ManageMessages, P.ReadMessageHistory);
  const out = [];
  if (access === ACCESS.staff) {
    out.push({ id: roleIds.everyone, type: 0, allow: '0', deny: bit(P.ViewChannel) });
  } else if (access === ACCESS.readonly) {
    out.push({
      id: roleIds.everyone, type: 0, allow: '0',
      deny: bit(P.SendMessages, P.SendMessagesInThreads, P.CreatePublicThreads, P.CreatePrivateThreads),
    });
  }
  for (const id of staff) out.push({ id, type: 0, allow: staffAllow, deny: '0' });
  return out;
}

/**
 * Compara a planta com o que já existe e devolve as ações (idempotente).
 * `existing` = { roles: [{id,name}], channels: [{id,name,type,parent_id}] }.
 */
function planChanges(existing) {
  const actions = [];
  const haveRole = new Set(existing.roles.map((r) => r.name.toLowerCase()));
  for (const role of ROLES) {
    if (!haveRole.has(role.name.toLowerCase())) actions.push({ op: 'create-role', name: role.name });
  }
  const catByName = new Map(existing.channels.filter((c) => c.type === CHANNEL_TYPE.category).map((c) => [c.name.toLowerCase(), c]));
  for (const cat of CATEGORIES) {
    const found = catByName.get(cat.name.toLowerCase());
    if (!found) actions.push({ op: 'create-category', name: cat.name });
    for (const ch of cat.channels) {
      const exists = existing.channels.some((c) => c.type !== CHANNEL_TYPE.category && c.name === ch.name && (!found || c.parent_id === found.id));
      if (!exists) actions.push({ op: 'create-channel', name: ch.name, category: cat.name });
    }
  }
  return actions;
}

/** Canais que existem no servidor mas não fazem parte da planta (candidatos a limpeza). */
function findExtras(existing) {
  const keep = new Set(allChannelNames());
  const keepCats = new Set(CATEGORIES.map((c) => c.name.toLowerCase()));
  return existing.channels.filter((c) =>
    c.type === CHANNEL_TYPE.category ? !keepCats.has(c.name.toLowerCase()) : !keep.has(c.name),
  );
}

module.exports = {
  CHANNEL_TYPE, GUILD_SETTINGS, ROLES, ACCESS, CATEGORIES, COMMUNITY_CHANNELS,
  WELCOME_TEXT, RULES_TEXT, allChannelNames, overwritesFor, planChanges, findExtras,
};
