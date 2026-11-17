/**
 * Planta do servidor "Pyxie Devs": comunicação enxuta sobre os jogos e projetos Roblox.
 * Idioma padrão: inglês (EN). Suporte a espanhol (ES) e português do Brasil (PT-BR).
 * Módulo puro (sem rede): o script `scripts/setup_pyxie_devs.js` aplica; os testes validam.
 */
const { PermissionFlagsBits: P } = require('discord.js');

const CHANNEL_TYPE = { text: 0, voice: 2, category: 4, announcement: 5, stage: 13 };

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
    permissions: [P.ManageMessages, P.ManageThreads, P.MentionEveryone, P.ViewAuditLog, P.ManageNicknames, P.ModerateMembers, P.MuteMembers, P.MoveMembers],
  },
  {
    key: 'mods', name: 'Moderator', color: 0x8b5cf6, hoist: true, mentionable: false,
    permissions: [P.ManageMessages, P.ManageThreads, P.ModerateMembers, P.KickMembers, P.ManageNicknames, P.MuteMembers, P.MoveMembers],
  },
  { key: 'tester', name: 'Playtester', color: 0xf59e0b, hoist: false, mentionable: false, permissions: [] },
  // Idiomas (o membro escolhe no Onboarding)
  { key: 'en', name: 'English', color: 0x38bdf8, hoist: false, mentionable: false, permissions: [] },
  { key: 'es', name: 'Español', color: 0xfbbf24, hoist: false, mentionable: false, permissions: [] },
  { key: 'pt', name: 'Português (BR)', color: 0x10b981, hoist: false, mentionable: false, permissions: [] },
  // Avisos opt-in: ninguém precisa de @everyone, só quem quer é chamado
  { key: 'pingUpdates', name: 'Updates Ping', color: 0x64748b, hoist: false, mentionable: true, permissions: [] },
  { key: 'pingEvents', name: 'Events Ping', color: 0x64748b, hoist: false, mentionable: true, permissions: [] },
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
  '- **13+ only** (Discord rule). Be kind: no harassment, hate or discrimination.',
  '- Keep it friendly for all ages: no NSFW, gore or graphic content.',
  '- Never share personal info (address, school, phone, passwords). Staff will never ask for your password.',
  '- No scams, "free Robux", account trading or unsolicited links. No exploits, cheats or leaks.',
  '- No spam. Keep each language channel in its own language.',
  '- Need help? Ask a Moderator or use the report channel.',
  '',
  '### 📜 Reglas',
  '- **Solo 13+** (regla de Discord). Sé amable: nada de acoso, odio ni discriminación.',
  '- Contenido apto para todas las edades: nada de NSFW ni contenido gráfico.',
  '- Nunca compartas datos personales (dirección, escuela, teléfono, contraseñas). El staff jamás pide tu contraseña.',
  '- Nada de estafas, "Robux gratis", venta de cuentas ni enlaces no solicitados. Nada de exploits, trampas ni filtraciones.',
  '- Nada de spam. Cada canal de idioma se mantiene en su idioma.',
  '- ¿Necesitas ayuda? Habla con un Moderator o usa el canal de reportes.',
  '',
  '### 📜 Regras',
  '- **Apenas 13+** (regra do Discord). Seja gentil: nada de assédio, ódio ou discriminação.',
  '- Conteúdo para todas as idades: nada de NSFW ou conteúdo gráfico.',
  '- Nunca compartilhe dados pessoais (endereço, escola, telefone, senhas). A equipe jamais pede sua senha.',
  '- Nada de golpes, "Robux grátis", venda de contas ou links não solicitados. Nada de exploits, cheats ou vazamentos.',
  '- Nada de spam. Cada canal de idioma fica no seu idioma.',
  '- Precisa de ajuda? Fale com um Moderator ou use o canal de denúncias.',
].join('\n');

const SAFETY_TEXT = [
  '### 🛡️ Stay safe · Mantente seguro · Fique seguro(a)',
  '**EN** – Report anything that makes you uncomfortable to a Moderator. Be careful with strangers who ask you to move to private chats, send links or share personal info. Turn off DMs from server members if you prefer: Server name > Privacy Settings.',
  '**ES** – Reporta a un Moderator cualquier cosa que te incomode. Ten cuidado con desconocidos que piden pasar a chats privados, enviar enlaces o datos personales. Puedes desactivar los mensajes directos del servidor en Ajustes de privacidad.',
  '**PT** – Avise um Moderator sobre qualquer coisa que te deixe desconfortável. Cuidado com desconhecidos que pedem para conversar no privado, mandar links ou dados pessoais. Você pode desativar as mensagens diretas do servidor em Configurações de privacidade.',
  '',
  '-# Pyxie Devs will never ask for your Roblox password, 2-step codes or Robux.',
].join('\n');

const FAQ_TEXT = [
  '### ❓ FAQ',
  '**EN** – Pick your language and pings in Channels & Roles. Official news is in the Announcements channels. Found a bug? Use the bug-reports channel.',
  '**ES** – Elige tu idioma y avisos en Canales y roles. Las noticias oficiales están en los canales de anuncios. ¿Encontraste un error? Usa el canal de bug-reports.',
  '**PT** – Escolha seu idioma e avisos em Canais e cargos. As novidades oficiais ficam nos canais de anúncios. Achou um bug? Use o canal bug-reports.',
].join('\n');

// Categorias e canais, na ordem em que aparecem. `post` marca o texto fixado ao criar.
// Canais de voz/palco ficam sem `topic`. Todos os nomes de texto: minúsculas e hífen.
const CATEGORIES = [
  {
    name: 'START HERE',
    channels: [
      { name: 'welcome', access: ACCESS.readonly, topic: 'Welcome · Bienvenido · Bem-vindo', post: WELCOME_TEXT },
      { name: 'rules', access: ACCESS.readonly, topic: 'Server rules · Reglas · Regras', post: RULES_TEXT },
      { name: 'safety', access: ACCESS.readonly, topic: 'Stay safe · Seguridad · Segurança', post: SAFETY_TEXT },
      { name: 'faq', access: ACCESS.readonly, topic: 'Quick answers · Respuestas rápidas · Respostas rápidas', post: FAQ_TEXT },
    ],
  },
  {
    name: 'ANNOUNCEMENTS',
    channels: [
      { name: 'announcements', type: 'announcement', access: ACCESS.readonly, topic: 'Official news (English)' },
      { name: 'anuncios-es', type: 'announcement', access: ACCESS.readonly, topic: 'Noticias oficiales (Español)' },
      { name: 'anuncios-pt-br', type: 'announcement', access: ACCESS.readonly, topic: 'Novidades oficiais (Português BR)' },
      { name: 'game-updates', type: 'announcement', access: ACCESS.readonly, topic: 'Patch notes and releases · Notas de versión · Notas de atualização' },
      { name: 'devlog', access: ACCESS.readonly, topic: 'Behind the scenes of our games · Detrás de cámaras · Bastidores' },
      { name: 'events', access: ACCESS.readonly, topic: 'Events, codes and giveaways · Eventos y códigos · Eventos e códigos' },
    ],
  },
  {
    name: 'COMMUNITY',
    channels: [
      { name: 'general', access: ACCESS.open, topic: 'Chat in English' },
      { name: 'comunidad-es', access: ACCESS.open, topic: 'Charla en Español' },
      { name: 'comunidade-pt-br', access: ACCESS.open, topic: 'Bate-papo em Português (BR)' },
      { name: 'showcase', access: ACCESS.open, topic: 'Share screenshots, builds and fan art · Comparte capturas y arte · Compartilhe prints e artes' },
      { name: 'looking-for-group', access: ACCESS.open, topic: 'Find people to play with · Busca equipo · Procure galera para jogar' },
      { name: 'off-topic', access: ACCESS.open, topic: 'Everything else, kept friendly · Todo lo demás · Todo o resto' },
    ],
  },
  {
    name: 'CREATORS',
    channels: [
      { name: 'creators-corner', access: ACCESS.open, topic: 'Scripting, building and Roblox Studio help · Ayuda de Studio · Ajuda com Studio' },
    ],
  },
  {
    name: 'HELP & FEEDBACK',
    channels: [
      { name: 'support', access: ACCESS.open, topic: 'Questions about our games · Preguntas · Dúvidas sobre os jogos' },
      { name: 'bug-reports', access: ACCESS.open, topic: 'Found a bug? Tell us what happened and where · Reporta errores · Reporte bugs' },
      { name: 'suggestions', access: ACCESS.open, topic: 'Ideas for our games · Ideas · Ideias' },
      { name: 'report-an-issue', access: ACCESS.open, topic: 'Report a user or a safety concern to the team · Reportes · Denúncias' },
    ],
  },
  {
    name: 'VOICE',
    channels: [
      { name: 'Lounge EN', type: 'voice', access: ACCESS.open },
      { name: 'Lounge ES', type: 'voice', access: ACCESS.open },
      { name: 'Lounge PT-BR', type: 'voice', access: ACCESS.open },
      { name: 'Game Party', type: 'voice', access: ACCESS.open },
      { name: 'Dev Talks', type: 'stage', access: ACCESS.readonly },
    ],
  },
  {
    name: 'STAFF',
    channels: [
      { name: 'staff-chat', access: ACCESS.staff, topic: 'Team only' },
      { name: 'mod-log', access: ACCESS.staff, topic: 'Moderation log' },
      { name: 'reports-inbox', access: ACCESS.staff, topic: 'Reports to review' },
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
  SAFETY_TEXT, FAQ_TEXT,
  CHANNEL_TYPE, GUILD_SETTINGS, ROLES, ACCESS, CATEGORIES, COMMUNITY_CHANNELS,
  WELCOME_TEXT, RULES_TEXT, allChannelNames, overwritesFor, planChanges, findExtras,
};
