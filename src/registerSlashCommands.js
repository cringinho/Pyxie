const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = require('./config');
const { slashCommands } = require('./commands');
const moduleManager = require('./services/moduleManager');

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
const CRINGELANDIA_GUILD_ID = '1453890868980482090';

(async () => {
  try {
    console.log('Descobrindo slash commands de módulos adicionais...');
    const discovered = moduleManager.discoverModules();
    const moduleSlash = [];
    for (const mod of discovered.values()) {
      if (Array.isArray(mod.commands)) {
        for (const cmd of mod.commands) {
          if (cmd.data && typeof cmd.data.toJSON === 'function') {
            moduleSlash.push(cmd.data.toJSON());
          }
        }
      }
    }

    const allSlashCommands = [...slashCommands, ...moduleSlash];
    console.log(`Enviando ${allSlashCommands.length} slash commands para a API do Discord (${slashCommands.length} core + ${moduleSlash.length} de módulos)...`);

    // 1. Registro Global (para todos os servidores onde a Pyxie está presente)
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: allSlashCommands });
    console.log('✅ Slash commands registrados globalmente com sucesso!');

    // 2. Registro Instantâneo na Cringelândia (Guild Oficial - Atualização imediata sem esperar cache do Discord)
    try {
      await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, CRINGELANDIA_GUILD_ID), { body: allSlashCommands });
      console.log(`✅ Slash commands registrados instantaneamente na Cringelândia (${CRINGELANDIA_GUILD_ID})!`);
    } catch (guildErr) {
      console.warn('Aviso: Não foi possível registrar na guilda específica:', guildErr.message);
    }
  } catch (error) {
    console.error('Erro ao registrar slash commands:', error);
    process.exit(1);
  }
})();
