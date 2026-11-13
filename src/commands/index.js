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
  require('./oraculo'),
  require('./album'),
  require('./agenda'),
  require('./emojis'),
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
  require('./privacidade'),
  require('./diagnostico'),
  require('./advertencia'),
  require('./casos'),
  require('./emergencia'),
  require('./lembrete'),
  require('./afk'),
  require('./aniversario'),
];

const { setLoadedCommands } = require('./commandHelpers');
setLoadedCommands(commands);

// Pyxie privada: todo comando roda só em servidor autorizado (contexto Guild + instalação no servidor).
// Sem User App, sem DM com o bot e sem canais privados.
for (const command of commands) {
  if (!command.data) continue;
  if (typeof command.data.setContexts === 'function') command.data.setContexts([0]); // 0 = Guild
  if (typeof command.data.setIntegrationTypes === 'function') command.data.setIntegrationTypes([0]); // 0 = Guild Install
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
