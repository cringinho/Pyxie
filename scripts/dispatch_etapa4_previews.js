#!/usr/bin/env node
require('dotenv').config();
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Preview de homologação (AGENTS.md §11) das mensagens novas da etapa 4 no canal 1461937203214024891:
 * anúncio do sazonal com marcação silenciosa (botão incluso) e os avisos ao dono da DM de parceria.
 * Menções sempre entre crases. Uso: node scripts/dispatch_etapa4_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-etapa4-preview-'));

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const mentionPrefs = require('../src/services/mentionPrefs');
const { CRINGELANDIA_GUILD_ID } = require('../src/config/scopes');
const { t } = require('../src/utils/i18n');

async function main() {
  const source = { lang };
  mentionPrefs.toggleSilent(CRINGELANDIA_GUILD_ID, '111111111111111111');
  const { text } = mentionPrefs.formatMentions(CRINGELANDIA_GUILD_ID, [
    { id: '111111111111111111', displayName: 'Ana' },
    { id: '222222222222222222', displayName: 'Bia' },
  ]);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('pyxs:silent:seasonal:toggle').setStyle(ButtonStyle.Secondary).setEmoji('🔕').setLabel(t('messageStudio.silent_button', source))
  );
  const r1 = await dispatchHomologationPreview({
    commandName: lang === 'pt' ? 'Evento sazonal' : 'Seasonal event',
    context: lang === 'pt' ? 'Premiados com marcação silenciosa (Ana no silencioso)' : 'Winners with silent mentions (Ana is silent)',
    embeds: [
      {
        color: 0xf59e0b,
        title: '☀️ RECOMPENSA DE ATIVIDADE MATINAL! ☀️',
        description: `📢 **Membros premiados pela presença matinal:**\n${text.replace(/<@(\d+)>/g, '`<@$1>`')}`,
      },
    ],
    components: [row],
    includeHeader: true,
  });
  console.log('[Etapa4Preview] Sazonal:', r1.simulated ? 'simulado' : `enviado (${r1.messageId})`);

  const vars = { user: '`<@555555555555555555>`', id: '555555555555555555', text: lang === 'pt' ? 'Bem-vinda à rede de parcerias!' : 'Welcome to the partner network!', error: 'Missing Access' };
  const lines = ['dm_source_sent', 'dm_source_copy', 'dm_source_missing', 'dm_source_closed', 'dm_source_failed']
    .map((k) => `• **${k}:**\n${t(`partnerships.${k}`, source, vars)}`)
    .join('\n\n');
  const r2 = await dispatchHomologationPreview({
    commandName: lang === 'pt' ? 'Parcerias' : 'Partnerships',
    context: lang === 'pt' ? 'Avisos ao dono da DM pelo fórum' : 'Owner reports for the forum DM',
    embeds: [{ color: 0x8b5cf6, title: lang === 'pt' ? '🤝 Retorno da DM de parceria' : '🤝 Partnership DM report', description: lines }],
    includeHeader: true,
  });
  console.log('[Etapa4Preview] Parcerias:', r2.simulated ? 'simulado' : `enviado (${r2.messageId})`);
}

main()
  .catch((err) => {
    console.error('[Etapa4Preview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true }));
