#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) da Força do Laço (/py-marriage bond) no canal
 * 1461937203214024891. Usa contas de teste e dados temporários; menções só dentro do embed
 * (sem ping). Uso: node scripts/dispatch_bond_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-bond-preview-'));
process.env.PYXIE_DATA_DIR = tmp;
process.env.MARRIAGE_DATA_PATH = path.join(tmp, 'marriageData.json');
process.env.DUNGEON_DATA_PATH = path.join(tmp, 'dungeon.json');

const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const economy = require('../src/services/economy');
const manager = require('../src/modules/marriage/marriageManager');
const bond = require('../src/modules/marriage/coupleBond');
const bondViews = require('../src/modules/marriage/bondViews');

const stamp = Date.now();
const A = `user_test_bond_preview_a_${stamp}`;
const B = `user_test_bond_preview_b_${stamp}`;
const source = { lang };

async function send(context, payload) {
  const result = await dispatchHomologationPreview({ commandName: '/py-marriage bond', context, embeds: payload.embeds, components: payload.components });
  console.log(`[BondPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  const proposal = manager.createMarriageProposal(A, B, 'preview');
  manager.resolveMarriageProposal(proposal.id, B, true);
  const data = manager.readData();
  const marriage = Object.values(data.marriages)[0];
  marriage.createdAt = Date.now() - 42 * 24 * 60 * 60 * 1000;
  marriage.bond = { xp: 330, streak: 0, bestStreak: 6 };
  manager.writeData(data);
  bond.doGesture(B, 'coffee');
  await send(`Laço antes do gesto (${lang})`, bondViews.buildBondView({ viewerId: A, source }));
  const result = bond.doGesture(A, 'note');
  await send(`Gesto e Sintonia (${lang})`, bondViews.buildBondView({ viewerId: A, source, notice: bondViews.gestureNotice(result, lang) }));
}

main()
  .catch((err) => {
    console.error('[BondPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    economy.purgeTestAccounts();
    fs.rmSync(tmp, { recursive: true, force: true });
  });
