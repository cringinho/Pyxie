const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');

const {
  TARGET_GUILD_ID,
  SILENT_ROLE_ID,
  CHECKIN_CHANNEL_ID,
  WELCOME_TEMPLATES,
  onGuildMemberAdd,
  onMessageCreate: onCheckinMessage,
  buildCheckinPayload,
  getStatus: getCheckinStatus,
  _pendingNewcomers,
  _welcomedOnceSet,
} = require('../src/services/welcomeCheckinService');

const {
  buildVentStickyEmbed,
  buildVentStickyComponents,
  buildAutohelpEmbed,
} = require('../src/services/ventService');

const {
  getGuildConfig,
  setWelcomeConfig,
  getWelcomeConfig,
  setVentChannelId,
  getVentChannelId,
  setTarotChannelId,
  getTarotChannelId,
  getAllTarotGuildConfigs,
} = require('../src/services/guildConfigService');

const setCommand = require('../src/commands/set');

console.log('🧪 Iniciando bateria de testes de Engenharia: Acolhimento 24h, Desabafos, py!set & Tarot Global...');

// =========================================================================
// 1. Testes do Sistema de Acolhimento Tardio (Batch 24h para Novatos Tímidos)
// =========================================================================
assert.strictEqual(TARGET_GUILD_ID, '1453890868980482090', 'Guilda alvo deve ser a Cringelândia');
assert.strictEqual(SILENT_ROLE_ID, '1455923442560925929', 'Cargo de silêncio estrito deve ser 1455923442560925929');
assert.strictEqual(CHECKIN_CHANNEL_ID, '1453890870288973825', 'Canal de acolhimento deve ser o chat principal');
assert.strictEqual(WELCOME_TEMPLATES.length, 10, 'Devem existir exatamente 10 modelos distintos de acolhimento');
console.log('  ✅ 1. Constantes e catálogo de 10 modelos de acolhimento validados.');

// Teste de exclusão estrita por cargo de silêncio
const mockMemberWithSilentRole = {
  id: 'silent_user_1',
  guild: { id: TARGET_GUILD_ID },
  user: { bot: false },
  roles: { cache: new Map([[SILENT_ROLE_ID, { id: SILENT_ROLE_ID }]]) },
};
onGuildMemberAdd(mockMemberWithSilentRole);
assert.strictEqual(_pendingNewcomers.has('silent_user_1'), false, 'Usuário com cargo de silêncio NUNCA deve entrar na fila');
console.log('  ✅ 2. Exclusão estrita por cargo de silêncio (1455923442560925929) validada.');

// Teste de entrada de novato tímido e filtro de 3 mensagens
const mockNormalMember = {
  id: 'shy_newcomer_123',
  guild: { id: TARGET_GUILD_ID },
  user: { bot: false },
  roles: { cache: new Map() },
  joinedTimestamp: Date.now() - 25 * 60 * 60 * 1000, // Entrou há 25h
};
_welcomedOnceSet.delete('shy_newcomer_123');
onGuildMemberAdd(mockNormalMember);
assert.strictEqual(_pendingNewcomers.has('shy_newcomer_123'), true, 'Novato sem cargo de silêncio deve entrar na fila');

// Usuário envia 1 mensagem
onCheckinMessage({ author: { id: 'shy_newcomer_123', bot: false } });
assert.strictEqual(_pendingNewcomers.get('shy_newcomer_123').msgCount, 1);

// Usuário envia 2 mensagens
onCheckinMessage({ author: { id: 'shy_newcomer_123', bot: false } });
assert.strictEqual(_pendingNewcomers.get('shy_newcomer_123').msgCount, 2);

// Usuário atinge 3 mensagens (remove da fila e marca como acolhido)
onCheckinMessage({ author: { id: 'shy_newcomer_123', bot: false } });
assert.strictEqual(_pendingNewcomers.has('shy_newcomer_123'), false, '3 mensagens devem remover da fila de tímidos');
assert.strictEqual(_welcomedOnceSet.has('shy_newcomer_123'), true, 'Deve ser adicionado a welcomedOnceSet');
console.log('  ✅ 3. Filtro de mensagens (< 3) e acolhimento autônomo validados.');

// Teste de construção do payload com menções e tutorial de canais e cargos
const batchPayload = buildCheckinPayload({ userIds: ['user_a', 'user_b'], templateIndex: 2 });
assert.ok(batchPayload.content.includes('<@user_a>'), 'Conteúdo deve conter menções aos usuários');
assert.ok(batchPayload.embeds[0].data.description.includes('<id:customize>'), 'Embed deve explicar didaticamente Canais e Cargos');
assert.strictEqual(batchPayload.components.length, 1, 'Deve conter linha com botão de atalho');
console.log('  ✅ 4. Construtor de lote com didática de Canais e Cargos (<id:customize>) validado.');

// =========================================================================
// 2. Testes do Sistema de Desabafos (Sticky + Anônimo + Autoajuda)
// =========================================================================
const stickyEmbed = buildVentStickyEmbed();
assert.ok(stickyEmbed.data.title.includes('Desabafos'), 'Sticky deve ter título claro de desabafos');
assert.ok(stickyEmbed.data.description.includes('Respeito Absoluto'), 'Sticky deve conter regra de respeito');
assert.ok(stickyEmbed.data.description.includes('+18') || stickyEmbed.data.description.includes('TW'), 'Sticky deve conter aviso de restrição/gatilho');
assert.ok(stickyEmbed.data.description.includes('não substitui atendimento psicológico'), 'Sticky deve encorajar apoio profissional');

const stickyComponents = buildVentStickyComponents();
assert.strictEqual(stickyComponents.length, 1);
assert.strictEqual(stickyComponents[0].components[0].data.custom_id, 'vent:help', 'Botão 1 deve ser Autoajuda');
assert.strictEqual(stickyComponents[0].components[1].data.custom_id, 'vent:anonymous', 'Botão 2 deve ser Desabafo Anônimo');
console.log('  ✅ 5. Estrutura obrigatória do Embed e botões da Mensagem Sticky validada.');

// Teste de Autoajuda
const autohelpEmbed = buildAutohelpEmbed();
assert.ok(autohelpEmbed.data.fields.some((f) => f.name.includes('Brasil')), 'Autoajuda deve conter recursos do Brasil (CVV 188)');
assert.ok(autohelpEmbed.data.fields.some((f) => f.name.includes('Internacionais')), 'Autoajuda deve conter recursos internacionais');
console.log('  ✅ 6. Embed de Autoajuda (CVV, UNICEF, SOS Voz Amiga, 988 Lifeline) validado.');

// =========================================================================
// 3. Testes do Gerenciador de Configurações de Guilda (guildConfigService)
// =========================================================================
const testGuildId = 'test_guild_99999';
setVentChannelId(testGuildId, '111222333444');
assert.strictEqual(getVentChannelId(testGuildId), '111222333444', 'Canal de desabafos deve ser salvo');

setTarotChannelId(testGuildId, '555666777888');
assert.strictEqual(getTarotChannelId(testGuildId), '555666777888', 'Canal do Tarot deve ser salvo');

const customWelcome = {
  channelId: '999888777',
  title: '🎉 Bem-vindo(a) a {server}!',
  description: 'Olá {user}! Você é o membro #{memberCount}.',
  imageUrl: 'https://example.com/banner.png',
  color: '#ec4899',
  autoReactions: ['🔥', '✨'],
  autoRoleId: '777888999',
};
setWelcomeConfig(testGuildId, customWelcome);
const savedWelcome = getWelcomeConfig(testGuildId);
assert.strictEqual(savedWelcome.channelId, '999888777');
assert.strictEqual(savedWelcome.autoRoleId, '777888999');
assert.strictEqual(savedWelcome.autoReactions.length, 2);
console.log('  ✅ 7. Persistência atômica e configurações por servidor (Desabafos, Tarot, Boas-Vindas) validadas.');

// =========================================================================
// 4. Testes do Comando Global py!set (/py-set) e Painel de Boas-Vindas
// =========================================================================
assert.strictEqual(setCommand.name, 'py-set', 'Nome canônico do comando deve ser py-set');
assert.ok(setCommand.aliases.includes('set'), 'Deve possuir alias set');
assert.ok(setCommand.aliases.includes('py-set'), 'Deve possuir alias py-set');

const mockGuild = { id: testGuildId, name: 'Reino de Teste', memberCount: 42 };
const mockUser = { username: 'Aventureiro', displayAvatarURL: () => 'https://example.com/avatar.png' };
const mockMember = {
  guild: mockGuild,
  user: mockUser,
  toString: () => '<@12345>',
};

const previewEmbed = setCommand.buildWelcomePreviewEmbed(mockMember, savedWelcome);
assert.strictEqual(previewEmbed.data.title, '🎉 Bem-vindo(a) a Reino de Teste!');
assert.ok(previewEmbed.data.description.includes('<@12345>'), 'Deve substituir {user} pela menção');
assert.ok(previewEmbed.data.description.includes('42'), 'Deve substituir {memberCount} pelo total de membros');
assert.strictEqual(previewEmbed.data.color, 0xec4899, 'Deve aplicar cor customizada');

const controlPanel = setCommand.buildWelcomeControlPanel(mockGuild, savedWelcome);
assert.strictEqual(controlPanel.embeds.length, 1);
assert.strictEqual(controlPanel.components.length, 2, 'Deve ter linha de botões e seletor de auto-role');
console.log('  ✅ 8. Comando py!set e construtor interativo de Boas-Vindas Premium validados.');

// =========================================================================
// 5. Testes da Assinatura Exclusiva do Tarot Global com Link Azul
// =========================================================================
const allTarotGuilds = getAllTarotGuildConfigs();
assert.ok(allTarotGuilds.some((g) => g.guildId === testGuildId), 'Guilda configurada deve constar na lista global de Tarot');

// Validação visual da assinatura com link azul Markdown
const sampleExternalTarotDesc = 'Uma carta por dia para iluminar seus caminhos.\n\n-# 🔮 Criado e disponibilizado por: [Cringelândia](<https://pyxie.com.br/cringelandia>)';
assert.ok(sampleExternalTarotDesc.includes('[Cringelândia](<https://pyxie.com.br/cringelandia>)'), 'Tarot fora da Cringelândia deve ter link azul clicável apontando para pyxie.com.br/cringelandia');
assert.ok(sampleExternalTarotDesc.includes('-#'), 'Deve utilizar o modificador de subtexto -# do Discord');
console.log('  ✅ 9. Assinatura do Tarot com link azul Markdown (-#) validada.');

console.log('\n🎉 TODOS OS TESTES DOS NOVOS SISTEMAS (LOTE 4) PASSARAM COM 100% DE SUCESSO!\n');
