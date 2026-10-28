const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID, CRINGELANDIA_GUILD_ID } = require('./config');
const { commands: rootCommands } = require('./commands');
const moduleManager = require('./services/moduleManager');

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// Comandos de módulos que também funcionam instalados na conta do usuário (User App),
// em servidores sem a Pyxie, grupos e DMs. Os comandos da raiz já são marcados em src/commands/index.js.
// Os comandos da Cringelândia (Catacumbas, Casinha, Oficina, Mercado, Festival, Passe) são de servidor: não entram aqui.
const USER_INSTALLABLE_MODULE_COMMANDS = new Set(['py-tarot', 'py-album']);
const TARGET_GUILD_ID = process.env.CRINGELANDIA_GUILD_ID || CRINGELANDIA_GUILD_ID || '1453890868980482090';

// Impressão digital do último payload enviado ao Discord. O deploy roda este script sempre;
// ele só chama a API quando algum comando (de src/commands ou de qualquer módulo) mudou.
// Use --force para registrar mesmo sem mudanças.
const HASH_FILE = path.join(__dirname, '..', '.slash-commands.hash');
const FORCE = process.argv.includes('--force');

(async () => {
  try {
    console.log('Descobrindo comandos da Pyxie (Global e por servidor)...');
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
    // guildId -> Map(nome -> json). Cada servidor de algum guildScope recebe o próprio registro.
    const guildCommandMaps = new Map();
    // A Cringelândia sempre recebe um PUT (mesmo vazio) para limpar comandos que saíram do escopo dela.
    guildCommandMaps.set(TARGET_GUILD_ID, new Map());

    for (const cmd of allDiscoveredCommands) {
      if (!cmd || !cmd.data || typeof cmd.data.toJSON !== 'function') continue;
      const json = cmd.data.toJSON();
      if (!json || !json.name) continue;
      if (USER_INSTALLABLE_MODULE_COMMANDS.has(json.name)) {
        json.integration_types = [0, 1];
        json.contexts = [0, 1, 2];
      }

      const scope = Array.isArray(cmd.guildScope) ? cmd.guildScope.filter(Boolean).map(String) : [];
      if (scope.length > 0) {
        globalCommandMap.delete(json.name);
        for (const guildId of scope) {
          if (!guildCommandMaps.has(guildId)) guildCommandMaps.set(guildId, new Map());
          guildCommandMaps.get(guildId).set(json.name, json);
        }
      } else if (![...guildCommandMaps.values()].some((m) => m.has(json.name))) {
        globalCommandMap.set(json.name, json);
      }
    }

    const globalCommands = Array.from(globalCommandMap.values());
    const guildCommands = Object.fromEntries(
      [...guildCommandMaps.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, m]) => [id, Array.from(m.values())])
    );
    const guildSummary = Object.entries(guildCommands).map(([id, list]) => `${id}: ${list.length}`).join(', ');

    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ clientId: DISCORD_CLIENT_ID, globalCommands, guildCommands }))
      .digest('hex');
    const lastHash = fs.existsSync(HASH_FILE) ? fs.readFileSync(HASH_FILE, 'utf8').trim() : '';
    if (!FORCE && lastHash === payloadHash) {
      console.log(`✅ Nenhum slash command novo ou alterado (${globalCommands.length} globais; por servidor: ${guildSummary}). Registro ignorado.`);
      return;
    }

    console.log(`📡 [Global]: Enviando ${globalCommands.length} slash commands universais para a API do Discord...`);
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: globalCommands });
    console.log('✅ Slash commands universais registrados globalmente com sucesso!');

    let failedGuilds = 0;
    for (const [guildId, list] of Object.entries(guildCommands)) {
      console.log(`🏠 [Servidor ${guildId}]: Enviando ${list.length} slash commands exclusivos...`);
      try {
        await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId), { body: list });
        console.log(`✅ Slash commands do servidor ${guildId} registrados.`);
      } catch (err) {
        // Servidor sem a Pyxie (ex.: 50001 Missing Access) não pode derrubar o registro dos outros.
        console.warn(`⚠️ Não foi possível registrar no servidor ${guildId}: ${err.code || ''} ${err.message}`);
        if (guildId === TARGET_GUILD_ID) throw err;
        failedGuilds++;
      }
    }

    // Sem gravar a impressão digital, o próximo deploy tenta de novo os servidores que falharam.
    if (failedGuilds > 0) return;

    fs.writeFileSync(HASH_FILE, `${payloadHash}\n`);
  } catch (error) {
    console.error('Erro ao registrar slash commands:', error);
    process.exit(1);
  }
})();

