const commands = [
  require('./ping'),
  require('./status'),
  require('./help'),
  require('./set'),
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
  require('./setup'),
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
  require('./matematica'),
  require('./jogodavelha'),
  require('./campominado'),
  require('./fecharTicket'),
  require('./sorteio'),
  require('./duelo'),
  require('./desafio'),
  require('./anime'),
  require('./conquistas'),
];

const { setLoadedCommands } = require('./commandHelpers');
setLoadedCommands(commands);

// Comandos restritos a contexto de guilda e administração
const GUILD_ONLY_COMMANDS = new Set([
  'setup', 'py-setup',
  'set', 'py-set', 'configurar', 'py-configurar',
  'schedule', 'py-schedule', 'agenda', 'py-agenda',
  'admin', 'py-admin',
  'exportar', 'py-exportar', 'export', 'py-export', 'export-messages', 'py-export-messages',
  'seteco', 'py-seteco', 'setareconomia', 'py-setareconomia',
  'reseteco', 'py-reseteco', 'resetareconomia', 'py-resetareconomia',
  'ecoconfig', 'py-ecoconfig', 'configeconomia', 'py-configeconomia',
  'fechar', 'py-fechar', 'closeticket', 'fecharticket', 'ticket-close', 'py-close',
  'sorteio', 'py-sorteio', 'giveaway', 'py-giveaway', 'sorteios', 'py-sorteios',
  'duel', 'py-duel', 'duelo', 'py-duelo', 'quizduel', 'py-quizduel', 'duelquiz',
]);

// Suporte nativo a User Apps (Discord Apps v2)
// Permite que a Pyxie seja instalada na conta do usuário e usada em qualquer servidor, grupo ou DM
for (const command of commands) {
  if (command.data) {
    const cmdName = command.data.name || command.name;

    if (GUILD_ONLY_COMMANDS.has(cmdName)) {
      // Comandos administrativos e de infraestrutura rodam apenas em servidores
      if (typeof command.data.setContexts === 'function') {
        command.data.setContexts([0]); // 0 = Guild
      }
      if (typeof command.data.setIntegrationTypes === 'function') {
        command.data.setIntegrationTypes([0]); // 0 = Guild Install
      }
    } else {
      // Comandos sociais, lúdicos, utilitários e econômicos rodam em qualquer lugar (Guild + Bot DM + Private Channels)
      if (typeof command.data.setContexts === 'function') {
        command.data.setContexts([0, 1, 2]); // 0 = Guild, 1 = Bot DM, 2 = Private Channels / DMs
      }
      if (typeof command.data.setIntegrationTypes === 'function') {
        command.data.setIntegrationTypes([0, 1]); // 0 = Guild Install, 1 = User Install (User App)
      }
    }
  }
}

const commandsByName = new Map();
const slashCommands = [];

for (const command of commands) {
  commandsByName.set(command.name, command);

  if (Array.isArray(command.aliases)) {
    for (const alias of command.aliases) {
      commandsByName.set(alias, command);
    }
  }

  if (command.data) {
    slashCommands.push(command.data);
  }
}

module.exports = {
  commands,
  commandsByName,
  slashCommands,
};
