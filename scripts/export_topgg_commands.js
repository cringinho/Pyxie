#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { commands: rootCommands } = require('../src/commands');
const { OWNER_ONLY_COMMANDS } = require('../src/commands/commandHelpers');
const moduleManager = require('../src/services/moduleManager');

/**
 * Gera a listagem de comandos para o Top.gg (Bot → Edit → Commands) a partir dos comandos reais.
 *
 * - topgg_commands.json: catálogo público em inglês (nome e descrição base dos slash commands),
 *   sem comandos exclusivos do Criador, de guildas restritas (guildScope) ou do Estúdio da Mary.
 * - topgg_commands_all.json: todos os comandos globais, para conferência.
 *
 * As localizações pt-BR ficam fora do arquivo: o Top.gg mostra só o texto base.
 * Uso: node scripts/export_topgg_commands.js
 */

const PRIVATE_MODULES = new Set(['mary-studio']);
const root = path.join(__dirname, '..');

function stripLocalizations(value) {
  if (Array.isArray(value)) return value.map(stripLocalizations);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, inner] of Object.entries(value)) {
    if (key.endsWith('_localizations') || key === 'contexts' || key === 'integration_types') continue;
    if (key === 'default_member_permissions' || key === 'dm_permission' || key === 'nsfw') continue;
    out[key] = stripLocalizations(inner);
  }
  return out;
}

function collect() {
  const discovered = moduleManager.discoverModules();
  const entries = rootCommands.map((cmd) => ({ cmd, moduleId: null }));
  for (const mod of discovered.values()) {
    for (const cmd of mod.commands || []) {
      entries.push({ cmd, moduleId: mod.id, guildScope: cmd.guildScope || mod.guildScope });
    }
  }

  const all = [];
  const publicList = [];
  const seen = new Set();
  for (const { cmd, moduleId, guildScope } of entries) {
    if (!cmd?.data || typeof cmd.data.toJSON !== 'function') continue;
    const json = cmd.data.toJSON();
    if (!json.name || seen.has(json.name)) continue;
    if (json.type && json.type !== 1) continue; // menus de contexto não entram no catálogo
    seen.add(json.name);

    const isRestricted = Array.isArray(guildScope) && guildScope.length > 0;
    if (isRestricted) continue;
    const clean = stripLocalizations(json);
    all.push(clean);

    const bare = json.name.replace(/^py-/, '');
    const ownerOnly = OWNER_ONLY_COMMANDS.has(json.name) || OWNER_ONLY_COMMANDS.has(bare);
    if (!ownerOnly && !PRIVATE_MODULES.has(moduleId)) publicList.push(clean);
  }
  return { all, publicList };
}

function main() {
  const { all, publicList } = collect();
  fs.writeFileSync(path.join(root, 'topgg_commands.json'), `${JSON.stringify(publicList, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(root, 'topgg_commands_all.json'), `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  console.log(`[Top.gg] ${publicList.length} comandos públicos em topgg_commands.json (${all.length} globais no total).`);
}

if (require.main === module) main();

module.exports = { collect, stripLocalizations };
