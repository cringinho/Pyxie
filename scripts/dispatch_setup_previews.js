#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) da Central do servidor (/py-setup) no canal
 * 1461937203214024891. Usa um diretório de dados temporário: nada é gravado em data/.
 * Uso: node scripts/dispatch_setup_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-setup-preview-'));

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const guildFeatures = require('../src/services/guildFeatures');
const setup = require('../src/commands/setup');

const guild = { id: '100000000000000777', name: 'Homologação', iconURL: () => null };
const admin = { id: '100000000000000001', permissions: { has: () => true } };
const member = { id: '100000000000000002', user: { id: '100000000000000002' }, permissions: { has: () => false } };

async function send(context, payload) {
  const result = await dispatchHomologationPreview({
    commandName: 'py-setup',
    context,
    content: payload.content || undefined,
    embeds: payload.embeds,
    components: payload.components,
  });
  console.log(`[SetupPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  await send(`Visão geral (${lang})`, setup.buildSetupView(guild, 'overview', lang));
  await send(`Canais permitidos (${lang})`, setup.buildSetupView(guild, 'channels', lang));
  await send(`Módulos (${lang})`, setup.buildSetupView(guild, 'modules', lang));

  guildFeatures.setMmoMode(guild.id, 'classic');
  guildFeatures.recordMmoDemand(guild.id, '100000000000000003');
  const access = guildFeatures.checkCommandAccess({ guildId: guild.id, command: 'py-dungeon' });
  const source = { guildId: guild.id, guild, lang };
  await send(`Vitrine para quem administra (${lang})`, setup.handleAccessDenied(access, source, admin));
  await send(`Aviso para membros (${lang})`, setup.handleAccessDenied(access, source, member));
}

main()
  .catch((err) => {
    console.error('[SetupPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
