#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) da lojinha da Mary no canal 1461937203214024891: central do
 * /py-mary, atalho na DM, "✏️ Editar na Pyxie", respostas curtas, recibo de entrega e um modelo pronto
 * montado pelo estúdio do painel. Dados temporários. Uso: node scripts/dispatch_mary_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-mary-preview-'));

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const store = require('../src/services/messageStudioStore');
const maryDashboard = require('../src/modules/mary-studio/maryDashboard');
const { buildQuickHubView } = require('../src/modules/mary-studio/commands/pyMaryStudio');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { MARY_GUILD_ID, MARY_USER_ID } = require('../src/config/scopes');
const { t } = require('../src/utils/i18n');

const source = { lang };
const pt = lang === 'pt';
const linkRow = (section, item) =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel(t('mary.btn_open_web', source)).setEmoji('🌐').setStyle(ButtonStyle.Link).setURL(maryDashboard.dashboardUrl(MARY_GUILD_ID, section, item))
  );

async function send(context, embeds, components = []) {
  const result = await dispatchHomologationPreview({ commandName: 'py-mary', context: `${context} (${lang})`, embeds, components, includeHeader: true });
  console.log(`[MaryPreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  const hub = buildQuickHubView(MARY_USER_ID, source);
  await send(pt ? 'Central do /py-mary' : '/py-mary hub', hub.embeds, hub.components);

  const dm = new EmbedBuilder().setColor('#ec4899').setTitle(t('mary.dm_title', source)).setDescription(t('mary.dm_desc', source)).setFooter({ text: t('mary.footer', source) });
  const edit = new EmbedBuilder()
    .setColor('#ec4899')
    .setTitle(t('mary.edit_title', source))
    .setDescription(t('mary.edit_desc', source, { id: '1600000000000000099', channel: '#vitrine-robux' }))
    .setFooter({ text: t('mary.footer', source) });
  await send(pt ? 'Atalho na DM' : 'DM shortcut', [dm], [linkRow('maryStore')]);
  await send(pt ? '✏️ Editar na Pyxie' : '✏️ Edit in Pyxie', [edit], [linkRow('studio', 'mary-vitrine-principal')]);

  const replies = [
    t('mary.status_updated', source, { status: t('mary.status_queue', source) }),
    t('mary.stock_updated', source, { stock: '25.000', price: '37,00' }),
    t('mary.dm_sent', source),
    t('mary.prefix_sent', source),
    t('mary.edit_not_mine', source),
    t('mary.edit_unsupported', source),
    t('mary.access_denied', source),
  ].join('\n\n');
  await send(pt ? 'Respostas curtas' : 'Short replies', [{ color: 0xec4899, title: pt ? '💬 Respostas privadas' : '💬 Private replies', description: replies }]);

  const receipt = maryDashboard.buildReceipt({ clientNick: 'Builderman', clientRobux: 1000, notes: pt ? 'Entregue pela gamepass VIP.' : 'Delivered through the VIP gamepass.' });
  await send(pt ? 'Recibo de entrega (painel → Ferramentas Robux)' : 'Delivery receipt (dashboard → Robux tools)', receipt.payload.embeds, receipt.payload.components);

  const created = maryDashboard.createFromTemplate(MARY_GUILD_ID, 'vitrine_principal');
  if (!created.ok) throw new Error(`Modelo inválido: ${JSON.stringify(created)}`);
  const sent = await store.sendHomologationPreview(MARY_GUILD_ID, created.id);
  console.log(`[MaryPreview] Modelo "Vitrine principal" pelo estúdio: enviado (${sent.messageId})`);
}

main()
  .catch((err) => {
    console.error('[MaryPreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
