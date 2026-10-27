#!/usr/bin/env node
/**
 * Teste de fumaça (plano, etapa 5): roda o executeSlash de todos os comandos (raiz e módulos) com
 * uma interação simulada em PT e EN, em dados temporários e sem Discord, e lista os que quebram.
 *
 * Uso: node scripts/smoke_all_commands.js [--json]
 * Sai com código 1 se algum comando lançar erro de código (TypeError, ReferenceError, SyntaxError).
 * Erros por falta de Discord de verdade (fetch de canal, permissões) aparecem como "aviso".
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-smoke-'));
process.env.DISCORD_TOKEN = '';
process.env.GROQ_API_KEY = '';
process.env.DATABASE_URL = '';

const { CRINGELANDIA_GUILD_ID } = require('../src/config/scopes');
const CODE_ERRORS = new Set(['TypeError', 'ReferenceError', 'SyntaxError', 'RangeError']);
const TIMEOUT_MS = 4000;

function collection(items = []) {
  const map = new Map(items.map((i) => [i.id, i]));
  map.filter = (fn) => collection([...map.values()].filter(fn));
  map.find = (fn) => [...map.values()].find(fn);
  map.map = (fn) => [...map.values()].map(fn);
  map.some = (fn) => [...map.values()].some(fn);
  map.first = () => [...map.values()][0];
  map.toJSON = () => [...map.values()];
  return map;
}

function mockInteraction(cmdName, lang) {
  const calls = [];
  const user = { id: `user_test_smoke_${lang}`, username: 'smoke', globalName: 'Smoke', bot: false, displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png', avatarURL: () => null, toString: () => '<@1>' };
  const channel = {
    id: '1461937203214024891',
    name: 'teste',
    type: 0,
    guildId: CRINGELANDIA_GUILD_ID,
    isTextBased: () => true,
    isThread: () => false,
    send: async (p) => (calls.push(['channel.send', p]), { id: '1', edit: async () => {}, react: async () => {}, createMessageComponentCollector: () => ({ on: () => {}, stop: () => {} }) }),
    messages: { fetch: async () => collection() },
    permissionsFor: () => ({ has: () => true }),
  };
  // Opções obrigatórias (ex.: oponente) sempre chegam preenchidas no Discord de verdade.
  const opponent = { id: 'user_test_smoke_opponent', username: 'rival', bot: false, displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/1.png', avatarURL: () => null, toString: () => '<@2>' };
  const member = { id: user.id, user, displayName: 'Smoke', roles: { cache: collection(), add: async () => {}, remove: async () => {} }, permissions: { has: () => true } };
  const opponentMember = { id: opponent.id, user: opponent, displayName: 'Rival', roles: { cache: collection() }, permissions: { has: () => false } };
  const guild = {
    id: CRINGELANDIA_GUILD_ID,
    name: 'Cringelândia',
    ownerId: '214153735281180673',
    memberCount: 500,
    preferredLocale: lang === 'pt' ? 'pt-BR' : 'en-US',
    iconURL: () => null,
    members: { cache: collection([member, opponentMember]), fetch: async (arg) => (arg ? member : collection([member, opponentMember])), me: member },
    channels: { cache: collection([channel]), fetch: async () => channel },
    roles: { cache: collection(), everyone: { id: CRINGELANDIA_GUILD_ID } },
    emojis: { cache: collection() },
  };
  const options = {
    getSubcommand: () => null,
    getSubcommandGroup: () => null,
    getString: () => null,
    getInteger: () => null,
    getNumber: () => null,
    getBoolean: () => null,
    getUser: () => opponent,
    getMember: () => opponentMember,
    getChannel: () => null,
    getRole: () => null,
    getAttachment: () => null,
    getFocused: () => '',
    get: () => null,
    data: [],
  };
  const reply = (kind) => async (p) => {
    calls.push([kind, p]);
    return { id: '2', edit: async () => {}, createMessageComponentCollector: () => ({ on: () => {}, stop: () => {} }), awaitMessageComponent: () => new Promise(() => {}) };
  };
  const interaction = {
    id: '3',
    commandName: cmdName,
    user,
    member,
    guild,
    guildId: guild.id,
    channel,
    channelId: channel.id,
    locale: lang === 'pt' ? 'pt-BR' : 'en-US',
    guildLocale: guild.preferredLocale,
    options,
    replied: false,
    deferred: false,
    client: { user: { id: '1543650200718155897', username: 'Pyxie', displayAvatarURL: () => '' }, guilds: { cache: collection([guild]) }, channels: { fetch: async () => channel }, users: { fetch: async () => user }, ws: { ping: 50 }, application: { id: '1543650200718155897' } },
    isChatInputCommand: () => true,
    isButton: () => false,
    isStringSelectMenu: () => false,
    isModalSubmit: () => false,
    isRepliable: () => true,
    inGuild: () => true,
    reply: reply('reply'),
    deferReply: async (p) => { interaction.deferred = true; calls.push(['deferReply', p]); },
    editReply: reply('editReply'),
    followUp: reply('followUp'),
    showModal: async (p) => calls.push(['showModal', p]),
    fetchReply: async () => ({ id: '2', createMessageComponentCollector: () => ({ on: () => {}, stop: () => {} }) }),
  };
  return { interaction, calls };
}

function allCommands() {
  const list = [...require('../src/commands').commands];
  const modulesDir = path.join(__dirname, '..', 'src', 'modules');
  for (const dir of fs.readdirSync(modulesDir)) {
    try {
      const mod = require(path.join(modulesDir, dir));
      for (const cmd of mod.commands || []) list.push(cmd);
    } catch (_) {}
  }
  return list.filter((c) => c?.data && typeof (c.executeSlash || c.execute) === 'function');
}

async function run() {
  const results = [];
  for (const cmd of allCommands()) {
    const name = cmd.data.name;
    for (const lang of ['pt', 'en']) {
      const { interaction, calls } = mockInteraction(name, lang);
      // Igual ao index.js: executeSlash({ interaction }) ou execute(interaction), com a resposta já adiada.
      interaction.deferred = !cmd.ephemeral;
      const call = cmd.executeSlash ? () => cmd.executeSlash({ interaction }) : () => cmd.execute(interaction);
      let outcome = { name, lang, status: 'ok' };
      try {
        await Promise.race([
          Promise.resolve(call()),
          new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { name: 'Timeout' })), TIMEOUT_MS)),
        ]);
        if (!calls.length) outcome = { name, lang, status: 'silent' };
      } catch (err) {
        const kind = CODE_ERRORS.has(err?.name) ? 'error' : 'warning';
        outcome = { name, lang, status: kind, error: `${err?.name || 'Error'}: ${String(err?.message || err).slice(0, 160)}` };
      }
      results.push(outcome);
    }
  }
  return results;
}

run()
  .then((results) => {
    const bad = results.filter((r) => r.status === 'error');
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      for (const r of results.filter((x) => x.status !== 'ok')) console.log(`${r.status.padEnd(7)} /${r.name} [${r.lang}] ${r.error || ''}`);
      console.log(`\n${results.length} execuções: ${results.filter((r) => r.status === 'ok').length} ok, ${results.filter((r) => r.status === 'warning').length} avisos, ${results.filter((r) => r.status === 'silent').length} sem resposta, ${bad.length} erros de código.`);
    }
    process.exitCode = bad.length ? 1 : 0;
  })
  .catch((err) => {
    console.error('[Smoke] Falha geral:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
    setTimeout(() => process.exit(process.exitCode), 200).unref();
  });
