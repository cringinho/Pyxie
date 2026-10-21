#!/usr/bin/env node
require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { getEmbedSchema, buildEmbed } = require('../src/utils/embedRegistry');

async function main() {
  const args = process.argv.slice(2);
  const embedId = args[0] || 'help_menu';
  const commandName = args[1] || `/${embedId}`;

  console.log(`[HomologationCLI] Preparando preview para embed: "${embedId}"...`);

  let targetEmbed;
  const schema = getEmbedSchema(embedId);

  if (schema) {
    targetEmbed = buildEmbed(embedId, {
      useSchemaTitle: true,
      description: schema.previewDesc || schema.description || 'Demonstração de layout homologado.',
      fields: schema.previewFields || [],
    });
  } else {
    targetEmbed = new EmbedBuilder()
      .setColor('#5E2B8C')
      .setTitle(`✨ Embed Personalizado: ${embedId}`)
      .setDescription(`Esta é uma demonstração automática de formatação para ${commandName}.`)
      .addFields(
        { name: '🌟 Status', value: 'Preview gerada via script CLI', inline: true },
        { name: '🛡️ Proteção', value: 'Menções ativas desativadas', inline: true }
      );
  }

  const result = await dispatchHomologationPreview({
    commandName,
    context: `Despacho Manual / Teste de Embed (${embedId})`,
    embeds: [targetEmbed],
    includeHeader: true,
  });

  if (result.success) {
    console.log(`[HomologationCLI] 🎉 Preview enviada com sucesso! Message ID: ${result.messageId}`);
    return;
  } else {
    console.error(`[HomologationCLI] ❌ Falha no despacho da preview:`, result.error);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[HomologationCLI] Erro fatal:', err);
  process.exit(1);
});
