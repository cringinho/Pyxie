const commands = [
  require('./ping'),
  require('./status'),
  require('./help'),
  require('./setwelcome'),
  require('./sixseven'),
  require('./ship'),
  require('./daily'),
  require('./carteira'),
  require('./perfil'),
  require('./ranking'),
  require('./economyconfig'),
  require('./setareconomia'),
  require('./resetareconomia'),
  require('./profissao'),
  require('./trabalho'),
  require('./loja'),
  require('./comprar'),
  require('./vender'),
  require('./inventario'),
  require('./tarot'),
  require('./album'),
  require('./agenda'),
  require('./emojis'),
  require('./convite'),
  require('./votar'),
  require('./idioma'),
  require('./bonus'),
  require('./jokenpo'),
  require('./biscoito'),
  require('./provavel'),
  require('./dado'),
  require('./coinflip'),
  require('./admin'),
  require('./wiki'),
  require('./exportar'),
  require('./quiz'),
  require('./termos'),
];

const { setLoadedCommands } = require('./commandHelpers');
setLoadedCommands(commands);

// Comandos restritos a contexto de guilda e administração
const GUILD_ONLY_COMMANDS = new Set([
  'welcome', 'py-welcome', 'setwelcome', 'py-setwelcome',
  'schedule', 'py-schedule', 'agenda', 'py-agenda',
  'admin', 'py-admin',
  'exportar', 'py-exportar', 'export', 'py-export', 'export-messages', 'py-export-messages',
  'seteco', 'py-seteco', 'setareconomia', 'py-setareconomia',
  'reseteco', 'py-reseteco', 'resetareconomia', 'py-resetareconomia',
  'ecoconfig', 'py-ecoconfig', 'configeconomia', 'py-configeconomia',
]);

// Suporte nativo a User Apps (Discord Apps v2)
// Permite que a Pyxie seja instalada na conta do usuário e usada em qualquer servidor, grupo ou DM
for (const command of commands) {
  if (command.data) {
    const cmdName = command.data.name || command.name;
    const isGuildOnly = GUILD_ONLY_COMMANDS.has(cmdName);

    if (isGuildOnly) {
      if (typeof command.data.setIntegrationTypes === 'function') {
        command.data.setIntegrationTypes([0]); // GuildInstall
      }
      if (typeof command.data.setContexts === 'function') {
        command.data.setContexts([0]); // Guild only
      }
    } else {
      if (typeof command.data.setIntegrationTypes === 'function') {
        command.data.setIntegrationTypes([0, 1]); // GuildInstall + UserInstall
      }
      if (typeof command.data.setContexts === 'function') {
        command.data.setContexts([0, 1, 2]); // Guild + BotDM + PrivateChannel
      }
    }
  }
}

const commandsByName = new Map(
  commands.flatMap((command) => {
    const mainName = command.name || command.data?.name;
    const entries = [];
    if (mainName) {
      entries.push([mainName, command]);
      if (mainName.startsWith('py-')) {
        entries.push([mainName.slice(3), command]);
      }
    }
    (command.aliases || []).forEach((alias) => {
      entries.push([alias, command]);
      if (alias.startsWith('py-')) {
        entries.push([alias.slice(3), command]);
      } else {
        entries.push([`py-${alias}`, command]);
      }
    });
    return entries;
  })
);

module.exports = {
  commands,
  commandsByName,
  slashCommands: commands.map((command) => command.data.toJSON()),
};