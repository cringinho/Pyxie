#!/usr/bin/env node
require('dotenv').config();
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { buildCheckinPayload } = require('../src/services/welcomeCheckinService');
const {
  buildVentStickyEmbed,
  buildVentStickyComponents,
  buildAutohelpEmbed,
} = require('../src/services/ventService');
const {
  buildWelcomeControlPanel,
  buildWelcomePreviewEmbed,
} = require('../src/commands/set');

async function run() {
  console.log('🚀 [PreviewBatch4] Despachando homologação automática de todos os novos Embeds para o canal 1461937203214024891...');

  // 1. Preview: Acolhimento 24h para Novatos Tímidos
  const checkinSample = buildCheckinPayload({
    userIds: ['123456789012345678', '987654321098765432'],
    templateIndex: 0,
  });
  await dispatchHomologationPreview({
    commandName: 'Acolhimento 24h',
    context: 'Lote de Acolhimento Gentil (Template 1 + Didática <id:customize>)',
    content: checkinSample.content,
    embeds: checkinSample.embeds,
    components: checkinSample.components,
  });
  await new Promise((r) => setTimeout(r, 600));

  // 2. Preview: Mensagem Sticky de Desabafos (+18, TW, Apoio Profissional)
  await dispatchHomologationPreview({
    commandName: 'Sistema de Desabafos',
    context: 'Embed Fixo (Sticky) do Canal com Regras & 2 Botões',
    embeds: [buildVentStickyEmbed()],
    components: buildVentStickyComponents(),
  });
  await new Promise((r) => setTimeout(r, 600));

  // 3. Preview: Embed de Autoajuda (DM / Ephemeral)
  await dispatchHomologationPreview({
    commandName: 'Autoajuda & Saúde Mental',
    context: 'Embed de Apoio Emocional (Brasil: CVV 188 & Internacional: 988 Lifeline)',
    embeds: [buildAutohelpEmbed()],
  });
  await new Promise((r) => setTimeout(r, 600));

  // 4. Preview: Desabafo Anônimo Publicado
  const sampleAnonEmbed = new EmbedBuilder()
    .setColor('#581c87')
    .setTitle('🎭  ✦  Desabafo Anônimo: Um peso no coração')
    .setDescription(
      'Hoje foi um dia particularmente exaustivo e difícil. Estou sentindo um aperto no peito e apenas precisava colocar isso para fora em um lugar acolhedor...'
    )
    .setFooter({ text: 'Desabafo Anônimo • Identidade 100% protegida pela Pyxie' })
    .setTimestamp();
  await dispatchHomologationPreview({
    commandName: 'Desabafo Anônimo',
    context: 'Publicação sem rastro público de identidade',
    embeds: [sampleAnonEmbed],
  });
  await new Promise((r) => setTimeout(r, 600));

  // 5. Preview: Pergunta Pós-Desabafo (Preferência: Respostas vs. Silêncio)
  const prefRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('demo:allow')
      .setLabel('💬 Não me importo que me respondam')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('demo:silence')
      .setLabel('🤫 Prefiro que mantenham apenas silêncio')
      .setStyle(ButtonStyle.Secondary)
  );
  await dispatchHomologationPreview({
    commandName: 'Preferência de Respostas',
    context: 'Pergunta interativa enviada logo após o desabafo',
    content: 'Seu desabafo foi publicado com carinho. Como você prefere que a comunidade reaja a ele?',
    components: [prefRow],
  });
  await new Promise((r) => setTimeout(r, 600));

  // 6. Preview: Painel Interativo de Boas-Vindas Premium + Auto-Role
  const mockGuild = { id: 'preview_guild', name: 'Comunidade Estelar', memberCount: 150 };
  const mockWelcomeCfg = {
    channelId: '1461937203214024891',
    title: '🎉  ✦  Boas-vindas a {server}!',
    description: 'Que bom ter você aqui, {user}! Você é a nossa pessoa de número #{memberCount}.',
    imageUrl: 'https://cdn.discordapp.com/attachments/1533657882862686218/1541908904487690321/dhj7hfn-842bcc59-b41f-4ef3-888b-dbfc210f4a5c.gif',
    color: '#8b5cf6',
    autoReactions: ['💗', '✨'],
    autoRoleId: '1461925047378645154',
  };
  const controlPanel = buildWelcomeControlPanel(mockGuild, mockWelcomeCfg);
  await dispatchHomologationPreview({
    commandName: 'py!set boas-vindas',
    context: 'Painel Interativo de Boas-Vindas Premium com Auto-Role',
    embeds: controlPanel.embeds,
    components: controlPanel.components,
  });
  await new Promise((r) => setTimeout(r, 600));

  // 7. Preview: Tarot Global com Assinatura e Link Azul Markdown
  const globalTarotEmbed = new EmbedBuilder()
    .setColor('#c084fc')
    .setTitle('🌙  ✦  Tarot Diário — Servidor Externo  ✦')
    .setDescription(
      'Uma carta por dia para iluminar seus caminhos. A leitura é privada e renderizada especialmente para você!\n\n' +
      'Clique no botão abaixo ou use `/py-tarot` (ou `py!tarot`) para receber a sua tiragem de hoje.\n\n' +
      '-# 🔮 Criado e disponibilizado por: [Cringelândia](<https://pyxie.com.br/cringelandia>)'
    )
    .setFooter({ text: 'Tarot Diário • Pyxie supervisiona • Conecte-se com as energias do dia' })
    .setTimestamp();
  const tarotButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('demo:draw')
      .setLabel('🔮 Tirar Tarot do Dia')
      .setStyle(ButtonStyle.Primary)
  );
  await dispatchHomologationPreview({
    commandName: 'Tarot Global',
    context: 'Assinatura com Link Azul Clicável para Servidores Externos (-#)',
    embeds: [globalTarotEmbed],
    components: [tarotButtons],
  });

  console.log('🎉 [PreviewBatch4] Todas as 7 previews foram despachadas com sucesso no canal 1461937203214024891!');
}

run().catch((err) => {
  console.error('[PreviewBatch4] Erro fatal:', err);
  process.exitCode = 1;
});
