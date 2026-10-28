// Catálogo de comandos para o painel, montado do código a cada pedido (nada de lista fixa):
// comandos do núcleo + comandos de todos os módulos (ligados ou não), com escopo, grupo e,
// para um servidor, se vale ali e por quê (mesma regra que o bot usa: checkCommandAccess).
const moduleManager = require('./moduleManager');
const guildFeatures = require('./guildFeatures');
const { OWNER_ONLY_COMMANDS, COMMAND_CATEGORY_MAP } = require('../commands/commandHelpers');

function describe(cmd) {
  const data = cmd.data && typeof cmd.data.toJSON === 'function' ? cmd.data.toJSON() : cmd.data || {};
  const en = data.description || cmd.description || '';
  const pt = data.description_localizations?.['pt-BR'] || cmd.description || en;
  return { pt, en: en || pt };
}

function entry(cmd, mod) {
  const name = cmd.data?.name || cmd.name;
  const bare = name.startsWith('py-') ? name.slice(3) : name;
  const scope = (Array.isArray(cmd.guildScope) ? cmd.guildScope : Array.isArray(mod?.guildScope) ? mod.guildScope : []).map(String);
  return {
    name,
    slash: Boolean(cmd.data),
    aliases: (cmd.aliases || []).filter((a) => a !== name).slice(0, 8),
    description: describe(cmd),
    category: cmd.category || mod?.category || COMMAND_CATEGORY_MAP[name] || 'utilidades',
    moduleId: mod?.id || null,
    moduleEnabled: mod ? moduleManager.isModuleEnabled(mod.id) : true,
    ownerOnly: OWNER_ONLY_COMMANDS.has(name) || OWNER_ONLY_COMMANDS.has(bare),
    guildScope: scope,
    group: guildFeatures.getCommandGroup(cmd),
  };
}

function allCommands() {
  if (!moduleManager.modules.size) moduleManager.discoverModules();
  const seen = new Set();
  const out = [];
  const add = (cmd, mod) => {
    const name = cmd?.data?.name || cmd?.name;
    if (!name || seen.has(name)) return;
    seen.add(name);
    out.push(entry(cmd, mod));
  };
  for (const cmd of require('../commands').commands) add(cmd, null);
  for (const mod of moduleManager.modules.values()) for (const cmd of mod.commands || []) add(cmd, mod);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// Comandos que valem num servidor: globais + os do escopo dele. Exclusivos do dono só para o dono.
function forGuild(guildId, { isOwner = false } = {}) {
  const features = guildFeatures.getGuildFeatures(guildId);
  return allCommands()
    .filter((c) => (!c.guildScope.length || c.guildScope.includes(String(guildId))) && (isOwner || !c.ownerOnly))
    .map((c) => {
      const access = guildFeatures.checkCommandAccess({ guildId, command: c.name });
      const route = features.commandChannels[c.name] || [];
      const groupChannels = c.group ? features.channels[c.group] || [] : [];
      let status = 'on';
      if (!c.moduleEnabled) status = 'module_off';
      else if (!access.allowed) status = access.reason;
      return { ...c, status, channels: route.length ? route : groupChannels };
    });
}

module.exports = { allCommands, forGuild };
