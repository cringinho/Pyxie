const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID, CRINGELANDIA_GUILD_ID } = require('./config');
const { commands: rootCommands } = require('./commands');
const moduleManager = require('./services/moduleManager');

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
const TARGET_GUILD_ID = process.env.CRINGELANDIA_GUILD_ID || CRINGELANDIA_GUILD_ID || '1453890868980482090';

(async () => {
  try {
    console.log('Descobrindo comandos da Pyxie (Zona A - Global vs Zona B - Cringelândia Lab)...');
    const discovered = moduleManager.discoverModules();

    // Reúne todos os comandos (raiz + módulos)
    const allDiscoveredCommands = [...rootCommands];
    for (const mod of discovered.values()) {
      if (Array.isArray(mod.commands)) {
        for (const cmd of mod.commands) {
          if (Array.isArray(mod.guildScope) && !cmd.guildScope) {
            cmd.guildScope = mod.guildScope;
          }
          allDiscoveredCommands.push(cmd);
        }
      }
    }

    const globalCommandMap = new Map();
    const guildCommandMap = new Map();

    for (const cmd of allDiscoveredCommands) {
      if (!cmd || !cmd.data || typeof cmd.data.toJSON !== 'function') continue;
      const json = cmd.data.toJSON();
      if (!json || !json.name) continue;

      const isGuildScoped = Array.isArray(cmd.guildScope) && cmd.guildScope.length > 0;
      if (isGuildScoped) {
        // Se for restrito à guilda, adiciona ao mapa da guilda
        guildCommandMap.set(json.name, json);
        // Garante que não esteja no mapa global
        globalCommandMap.delete(json.name);
      } else {
        // Se já foi registrado como comando de guilda, mantém como guilda
        if (!guildCommandMap.has(json.name)) {
          globalCommandMap.set(json.name, json);
        }
      }
    }

    const globalCommands = Array.from(globalCommandMap.values());
    const guildCommands = Array.from(guildCommandMap.values());

    console.log(`📡 [Zona A - Global]: Enviando ${globalCommands.length} slash commands universais para a API do Discord...`);
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: globalCommands });
    console.log('✅ Slash commands universais registrados globalmente com sucesso!');

    console.log(`🧪 [Zona B - Cringelândia Lab]: Enviando ${guildCommands.length} slash commands para a guilda ${TARGET_GUILD_ID}...`);
    await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, TARGET_GUILD_ID), { body: guildCommands });
    console.log(`✅ Slash commands exclusivos da Cringelândia registrados com sucesso (${TARGET_GUILD_ID})!`);
  } catch (error) {
    console.error('Erro ao registrar slash commands:', error);
    process.exit(1);
  }
})();

