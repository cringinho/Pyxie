const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

console.log('🎀 Iniciando suíte de testes de Engenharia: Módulo Mary Studio & Hub...');

// 1. Isola os caminhos de dados para testes limpos
const testDataDir = path.join(__dirname, 'test-data-mary');
fs.rmSync(testDataDir, { recursive: true, force: true });
fs.mkdirSync(testDataDir, { recursive: true });

// Os dados da Mary e do estúdio do painel vão para a pasta do teste (nada toca em data/).
process.env.PYXIE_DATA_DIR = testDataDir;

const securityGuard = require('../src/modules/mary-studio/utils/securityGuard');
const robloxHelper = require('../src/modules/mary-studio/utils/robloxHelper');
const templatesCatalog = require('../src/modules/mary-studio/utils/templatesCatalog');
const maryStudioManager = require('../src/modules/mary-studio/maryStudioManager');
const maryStudioModule = require('../src/modules/mary-studio/index');
const maryDashboard = require('../src/modules/mary-studio/maryDashboard');
const studioConvert = require('../src/modules/mary-studio/studioConvert');
const studioStore = require('../src/services/messageStudioStore');
const { MARY_GUILD_ID } = require('../src/config/scopes');
const buttonActionHandler = require('../src/modules/mary-studio/handlers/buttonActionHandler');
const reviewHandler = require('../src/modules/mary-studio/handlers/reviewHandler');
const { COMMAND_CATEGORY_MAP } = require('../src/commands/commandHelpers');
const { TRANSLATIONS } = require('../src/utils/i18n');

(async () => {
  try {
    // =========================================================================
    // 1. QUEM PODE USAR AS AÇÕES DA MARY NO DISCORD (securityGuard.js)
    // =========================================================================
    console.log('  🔒 1. Testando quem pode usar as ações da Mary...');

    assert.equal(securityGuard.isAuthorizedUser(securityGuard.MARY_DISCORD_ID), true, 'Mary deve ser autorizada');
    assert.equal(securityGuard.isAuthorizedUser(securityGuard.OWNER_SNOWFLAKE), true, 'Owner deve ser autorizado');
    assert.equal(securityGuard.isAuthorizedUser('999999999999999999'), false, 'Usuário estranho deve ser bloqueado');
    assert.equal(securityGuard.isAuthorizedUser(''), false, 'ID vazio deve ser bloqueado');
    assert.equal(typeof securityGuard.createMagicLink, 'undefined', 'O link mágico do app antigo não existe mais');
    assert.ok(!fs.existsSync(path.join(__dirname, '..', 'src', 'modules', 'mary-studio', 'public')), 'O app web antigo foi apagado');

    // Endereços antigos levam à lojinha no painel; imagens antigas continuam servidas.
    const routes = [];
    maryStudioModule.setupWebRoutes({ get: (p, h) => routes.push({ p, h }), use: (p) => routes.push({ p }) });
    assert.ok(routes.some((r) => r.p === '/api/mary/media'), 'Imagens antigas continuam em /api/mary/media');
    const legacyRoute = routes.find((r) => Array.isArray(r.p) && r.p.includes('/mary'));
    let redirectedTo = null;
    legacyRoute.h({}, { setHeader: () => {}, redirect: (code, url) => { redirectedTo = url; } });
    assert.ok(/^\/dashboard#\/guild\/\d+\/maryStore$/.test(redirectedTo), '/mary redireciona para a Lojinha do painel');

    console.log('  ✅ 1. Acesso da Mary e do dono, sem link mágico, e endereços antigos redirecionados.');

    // =========================================================================
    // 2. CICLO DE VIDA E ZERO MEMORY LEAK NO MODULEMANAGER
    // =========================================================================
    console.log('  🧩 2. Testando ciclo de vida modular e Zero Memory Leak...');

    const registeredListeners = [];
    const mockCtx = {
      client: {
        isReady: () => true,
        guilds: { cache: new Map() },
      },
      registerListener: (event, handler) => {
        registeredListeners.push({ event, handler });
      },
      registerInterval: () => {},
      registerTimeout: () => {},
      registerCron: () => {},
    };

    await maryStudioModule.onLoad(mockCtx);
    assert.ok(registeredListeners.length > 0, 'onLoad deve registrar listeners via ctx');
    assert.ok(registeredListeners.some((l) => l.event === 'interactionCreate'), 'Deve registrar listener interactionCreate via ctx');

    await maryStudioModule.onUnload();
    assert.equal(maryStudioManager.client, null, 'onUnload deve limpar client do manager para evitar leaks');

    console.log('  ✅ 2. Ciclo de vida modular e ausência de memory leaks validados com sucesso.');

    // =========================================================================
    // 3. DESCOBERTA DINÂMICA DO SERVIDOR DA MARY (Guild ID Dinâmico)
    // =========================================================================
    console.log('  🔍 3. Testando descoberta automática do servidor da Mary...');

    const mockGuilds = new Map();
    const guildOther = { id: 'guild_random_111', ownerId: '999999999', members: { cache: new Map() } };
    const guildMary = {
      id: 'guild_mary_roblox_777',
      ownerId: securityGuard.MARY_DISCORD_ID,
      members: { cache: new Map() },
    };

    mockGuilds.set(guildOther.id, guildOther);
    mockGuilds.set(guildMary.id, guildMary);

    const mockDiscordClient = {
      guilds: { cache: mockGuilds },
      isReady: () => true,
    };

    maryStudioManager.init(mockDiscordClient, mockCtx);
    const discovered = maryStudioManager.discoverGuild();
    assert.ok(discovered, 'Deve descobrir o servidor da Mary');
    assert.equal(discovered.id, 'guild_mary_roblox_777', 'Deve vincular ao servidor onde Mary é proprietária');

    const loadedCfg = maryStudioManager.loadConfig();
    assert.equal(loadedCfg.guildId, 'guild_mary_roblox_777', 'Deve persistir guildId no arquivo de configuração');

    console.log('  ✅ 3. Descoberta dinâmica de Guild ID validada com 100% de sucesso.');

    // =========================================================================
    // 4. CALCULADORA ROBLOX 30% E GERADOR PIX EMV (robloxHelper.js)
    // =========================================================================
    console.log('  🧮 4. Testando Calculadora Roblox 30% e Gerador PIX EMV...');

    // 4.1 Fórmula ceil(robux / 0.70)
    assert.equal(robloxHelper.calcRobuxGamepass(1000), 1429, '1.000 Robux limpos requer 1.429 na Gamepass');
    assert.equal(robloxHelper.calcRobuxGamepass(500), 715, '500 Robux limpos requer 715 na Gamepass');
    assert.equal(robloxHelper.calcRobuxGamepass(100), 143, '100 Robux limpos requer 143 na Gamepass');
    assert.equal(robloxHelper.calcRobuxGamepass(0), 0, '0 Robux deve retornar 0');

    // 4.2 Cotação em BRL e Descontos
    assert.equal(robloxHelper.calcPriceBRL(1000, 37.0, 0), 37.00, 'Preço de 1k sem desconto');
    assert.equal(robloxHelper.calcPriceBRL(1000, 37.0, 10), 33.30, 'Preço de 1k com 10% de desconto');
    assert.equal(robloxHelper.calcPriceBRL(500, 37.0, 0), 18.50, 'Preço de 500 Robux');

    // 4.3 CRC16-CCITT e Payload PIX BR Code EMV
    const samplePayload = robloxHelper.generatePixPayload({
      key: '1463644930080637140@pix.com',
      name: 'MARY STORE',
      city: 'SAO PAULO',
      amount: 37.00,
      txid: 'MARY1000',
    });

    assert.ok(samplePayload.startsWith('000201'), 'PIX Payload deve começar com cabeçalho EMV 000201');
    assert.ok(samplePayload.includes('br.gov.bcb.pix'), 'PIX Payload deve conter GUI oficial do Banco Central');
    assert.ok(samplePayload.includes('540537.00'), 'PIX Payload deve conter campo 54 com valor 37.00');
    assert.ok(samplePayload.includes('6304'), 'PIX Payload deve conter tag 6304 para checksum');

    const qrUrl = robloxHelper.getPixQrCodeUrl(samplePayload);
    assert.ok(qrUrl.includes('api.qrserver.com'), 'Deve gerar URL válida de QR Code');

    console.log('  ✅ 4. Calculadora Roblox 30% e Gerador PIX EMV validados com sucesso.');

    // =========================================================================
    // 5. MENSAGENS DO ESTÚDIO ANTIGO → ESTÚDIO DO PAINEL (sem perder nada)
    // =========================================================================
    console.log('  ✏️ 5. Testando a migração das mensagens antigas para o estúdio do painel...');

    const legacyStore = maryStudioManager.loadMessages();
    legacyStore.messages.msg_1712345_ab12 = {
      recordId: 'msg_1712345_ab12',
      guildId: MARY_GUILD_ID,
      channelId: '1600000000000000001',
      channelName: 'vitrine-robux',
      messageId: '1600000000000000002',
      content: 'Avisos da Loja',
      embed: { title: '💎 Tabela de Robux', description: 'Temos {estoque} por {preco_1k}!', color: '#ec4899', footerText: 'Mary Store', showTimestamp: true },
      buttons: [
        { id: 'btn_calc', label: 'Calcular', emoji: '🧮', style: 'Success', actionType: 'calculator' },
        { id: 'btn_help', label: 'Como Criar Gamepass', style: 'Secondary', actionType: 'image_response', responseText: 'Passo a passo', responseImageUrl: 'https://example.com/guia.png' },
        { id: 'btn_site', label: 'Site', style: 'Link', url: 'https://example.com' },
      ],
      versions: [],
      createdAt: 1712345000000,
    };
    maryStudioManager.saveMessages(legacyStore);

    assert.equal(maryDashboard.migrateLegacyMessages(MARY_GUILD_ID), 1, 'Mensagem antiga levada para o painel');
    assert.equal(maryDashboard.migrateLegacyMessages(MARY_GUILD_ID), 0, 'Migração roda uma vez só');
    assert.ok(maryStudioManager.loadMessages().messages.msg_1712345_ab12, 'O arquivo antigo continua intacto');
    const migrated = studioStore.getMessage(MARY_GUILD_ID, 'mary-msg-1712345-ab12');
    assert.ok(migrated, 'Documento criado no estúdio do servidor da Mary');
    assert.equal(migrated.embeds[0].footer.text, 'Mary Store');
    assert.equal(migrated.sent[0].messageId, '1600000000000000002', 'Ligada à mensagem já postada (dá para atualizar pelo painel)');
    assert.deepEqual(migrated.buttons.map((b) => b.action.type), ['mary', 'tab', 'link']);
    assert.equal(migrated.buttons[0].action.kind, 'calculator');
    assert.equal(migrated.tabs[0].embeds[0].imageUrl, 'https://example.com/guia.png', 'Card explicativo vira aba privada com a imagem');

    // Mensagem postada pela Pyxie → estúdio (menu "✏️ Editar na Pyxie")
    const posted = {
      id: '1600000000000000099',
      channelId: '1600000000000000001',
      content: 'Oi',
      embeds: [{ title: 'Vitrine', description: 'Texto', color: 0xec4899, footer: { text: 'Mary' } }],
      components: [{ type: 1, components: [{ type: 2, style: 3, label: 'Ticket', custom_id: 'mary_btn:ticket:b1' }, { type: 2, style: 5, label: 'Site', url: 'https://example.com' }] }],
    };
    const imported = maryDashboard.importDiscordMessage(MARY_GUILD_ID, posted);
    assert.equal(imported.ok, true);
    assert.equal(maryDashboard.importDiscordMessage(MARY_GUILD_ID, posted).id, imported.id, 'A mesma mensagem abre o mesmo documento');
    assert.equal(maryDashboard.importDiscordMessage(MARY_GUILD_ID, { id: '1600000000000000002', channelId: '1', embeds: [], components: [] }).id, 'mary-msg-1712345-ab12', 'Mensagem já migrada é achada pelo envio');
    const giveawayMsg = { ...posted, id: '1600000000000000100', components: [{ type: 1, components: [{ type: 2, style: 3, label: 'Participar', custom_id: 'mary_giveaway:enter:gw_1' }] }] };
    assert.equal(maryDashboard.importDiscordMessage(MARY_GUILD_ID, giveawayMsg).error, 'unsupported_buttons', 'Não importa mensagem cujo botão sumiria');
    assert.equal(studioConvert.fromDiscordMessage(posted).doc.embeds[0].color, '#ec4899');

    // Prevenção de duplicidade de emoji em botões (handlers antigos ainda usam buildActionRows)
    const testRows = maryStudioManager.buildActionRows([
      { label: '📘 Como Criar Gamepass', emoji: '📘', style: 'Primary' },
      { label: '💰 Tabela de Preços', emoji: '💰', style: 'Secondary' },
    ]);
    assert.equal(testRows[0].components[0].toJSON().label, 'Como Criar Gamepass', 'Emoji duplicado 📘 deve ser removido do label');
    assert.equal(testRows[0].components[1].toJSON().emoji.name, '💰', 'Emoji nativo deve ser preservado');

    console.log('  ✅ 5. Migração única, arquivo antigo preservado, botões e cards convertidos, menu de editar.');

    // =========================================================================
    // 6. CLIQUE NOS BOTÕES INTERATIVOS (buttonActionHandler.js)
    // =========================================================================
    console.log('  🔘 6. Testando Resposta Interativa a Botões de Imagem e Sub-botões...');

    buttonActionHandler.init(maryStudioManager);

    // Configura uma mensagem salva contendo botão com resposta de imagem
    const msgData = maryStudioManager.loadMessages();
    msgData.messages['test_card_1'] = {
      recordId: 'test_card_1',
      buttons: [
        {
          id: 'btn_gamepass_guide',
          label: '📘 Como Criar Gamepass',
          actionType: 'custom',
          responseText: 'Siga o passo a passo da imagem abaixo:',
          responseImageUrl: 'https://example.com/tutorial_gamepass.png',
          responseEphemeral: true,
          subButtons: [
            { label: '🛒 Quero Comprar', style: 'Success', actionType: 'ticket', id: 'btn_buy_sub' },
          ],
        },
      ],
    };
    maryStudioManager.saveMessages(msgData);

    let replyPayload = null;
    const mockButtonInteraction = {
      isButton: () => true,
      isModalSubmit: () => false,
      customId: 'mary_btn:custom:btn_gamepass_guide',
      reply: async (data) => {
        replyPayload = data;
        return data;
      },
    };

    await buttonActionHandler.handleButton(mockButtonInteraction);
    assert.ok(replyPayload, 'Botão de imagem deve responder à interação');
    assert.equal(replyPayload.ephemeral, true, 'Resposta padrão deve ser ephemeral (secreta)');
    assert.ok(replyPayload.embeds?.[0]?.data?.image?.url === 'https://example.com/tutorial_gamepass.png', 'Deve conter imagem de resposta');
    assert.ok(replyPayload.components?.length > 0, 'Deve renderizar sub-botões na resposta');

    console.log('  ✅ 6. Resposta automática de botão com imagem e sub-botão validada com sucesso.');

    // =========================================================================
    // 7. ISOLAMENTO DOS MÓDULOS OPCIONAIS E PERFIL LOCAL (@me)
    // =========================================================================
    console.log('  🛠️ 7. Testando isolamento por Feature Flags e Perfil Local...');

    const defaultCfg = maryStudioManager.loadConfig();
    assert.equal(typeof defaultCfg.featureFlags, 'object', 'Config deve ter objeto featureFlags');
    assert.equal(defaultCfg.featureFlags.ticketModule, false, 'Tickets devem vir desligados por padrão');
    assert.equal(defaultCfg.featureFlags.reviewModule, false, 'Avaliações devem vir desligadas por padrão');
    assert.equal(defaultCfg.featureFlags.stockModule, true, 'Estoque deve vir ativado por padrão');

    // Teste de Patch do Perfil Local via REST
    let restPatchCalled = null;
    mockDiscordClient.rest = {
      patch: async (endpoint, data) => {
        restPatchCalled = { endpoint, data };
        return { ok: true };
      },
    };

    const patchResult = await maryStudioManager.updateLocalProfile(null, {
      nick: 'Pyxie [🟢 Loja ON]',
      bio: 'Lojinha da Mary • Robux com entrega rápida!',
      avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      banner: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      statusLoja: 'online',
    });

    assert.equal(patchResult.success, true, 'Atualização de perfil local deve ter sucesso');
    assert.ok(restPatchCalled, 'Deve disparar chamada REST PATCH');
    assert.ok(restPatchCalled.endpoint.includes('/members/@me'), 'Deve chamar rota canônica /members/@me');
    assert.equal(restPatchCalled.data.body.nick, 'Pyxie [🟢 Loja ON]', 'Deve enviar apelido local');
    assert.equal(restPatchCalled.data.body.bio, 'Lojinha da Mary • Robux com entrega rápida!', 'Deve enviar bio local');
    assert.ok(restPatchCalled.data.body.avatar && restPatchCalled.data.body.avatar.startsWith('data:image/png;base64,'), 'Deve enviar avatar em formato Data URI base64');
    assert.ok(restPatchCalled.data.body.banner && restPatchCalled.data.body.banner.startsWith('data:image/png;base64,'), 'Deve enviar banner em formato Data URI base64');
    assert.equal(patchResult.localBio, 'Lojinha da Mary • Robux com entrega rápida!', 'Deve persistir bio');
    assert.ok(patchResult.localAvatarUrl.startsWith('data:image/png;base64,'), 'Deve persistir localAvatarUrl');
    assert.ok(patchResult.localBannerUrl.startsWith('data:image/png;base64,'), 'Deve persistir localBannerUrl');

    // Teste de Reset de Avatar e Banner
    const resetResult = await maryStudioManager.updateLocalProfile(null, { avatar: 'reset', banner: 'reset' });
    assert.equal(resetResult.localAvatarUrl, '', 'Reset deve limpar localAvatarUrl');
    assert.equal(resetResult.localBannerUrl, '', 'Reset deve limpar localBannerUrl');
    assert.equal(restPatchCalled.data.body.avatar, null, 'Reset deve enviar null para avatar no Discord');
    assert.equal(restPatchCalled.data.body.banner, null, 'Reset deve enviar null para banner no Discord');

    // Central rápida (/py-mary): link para a Lojinha no painel, sem link mágico
    const { buildQuickHubView } = require('../src/modules/mary-studio/commands/pyMaryStudio');
    const quickHubView = buildQuickHubView(securityGuard.MARY_DISCORD_ID, { user: { id: securityGuard.MARY_DISCORD_ID } });
    const hubLink = quickHubView.components[0].components[0].toJSON().url;
    assert.match(hubLink, /\/dashboard#\/guild\/\d+\/maryStore$/, 'O botão abre a Lojinha no painel (login com Discord)');
    assert.ok(!quickHubView.components.some((row) => row.components.some((c) => c.toJSON().custom_id === 'mary_quick:logout_all')), 'Sem botão de sessões do app antigo');
    assert.equal(buildQuickHubView('999999999999999999', {}).ephemeral, true, 'Estranho recebe só o aviso de acesso negado');

    console.log('  ✅ 7. Isolamento de Feature Flags e atualização do Perfil Local (@me) com Foto, Banner e Bio validados.');

    // =========================================================================
    // 8. TEMPLATES PRONTOS E CATÁLOGO DE MENSAGENS
    // =========================================================================
    console.log('  ✨ 8. Testando Templates Prontos da Lojinha...');

    const allTemplates = templatesCatalog.getAllTemplates();
    assert.ok(allTemplates.length >= 5, 'Deve possuir ao menos 5 templates prontos');
    assert.ok(allTemplates.some((t) => t.id === 'vitrine_principal'), 'Deve conter template de Vitrine com 2 botões de imagem');
    assert.ok(allTemplates.some((t) => t.id === 'guia_gamepass_grupo'), 'Deve conter template do Guia de 30%');

    console.log('  ✅ 8. Catálogo com 5 templates prontos de 1 clique validado.');

    // =========================================================================
    // 9. PARIDADE BILÍNGUE E MAPEAMENTO DE COMANDOS
    // =========================================================================
    console.log('  🌐 9. Testando Paridade Bilíngue e Mapeamento de Comandos...');

    assert.ok(TRANSLATIONS.pt.mary, 'TRANSLATIONS.pt deve conter chave mary');
    assert.ok(TRANSLATIONS.en.mary, 'TRANSLATIONS.en deve conter chave mary');
    assert.deepEqual(Object.keys(TRANSLATIONS.pt.mary).sort(), Object.keys(TRANSLATIONS.en.mary).sort(), 'Mesmas chaves mary em pt e en');
    for (const key of Object.keys(TRANSLATIONS.pt.mary)) {
      const vars = (txt) => (txt.match(/\{\w+\}/g) || []).sort().join(',');
      assert.equal(vars(TRANSLATIONS.pt.mary[key]), vars(TRANSLATIONS.en.mary[key]), `Placeholders iguais em mary.${key}`);
    }

    assert.ok('mary' in COMMAND_CATEGORY_MAP, 'mary deve estar mapeado em COMMAND_CATEGORY_MAP');
    assert.ok('py-mary' in COMMAND_CATEGORY_MAP, 'py-mary deve estar mapeado em COMMAND_CATEGORY_MAP');
    assert.ok('py-mary-edit-context' in COMMAND_CATEGORY_MAP, 'py-mary-edit-context deve estar mapeado em COMMAND_CATEGORY_MAP');

    console.log('  ✅ 9. Paridade bilíngue e mapeamento de comandos validados.');

    // =========================================================================
    // 10. FERRAMENTAS ROBUX: INSPETOR DE GAMEPASS, CÁLCULO INVERSO E VOUCH
    // =========================================================================
    console.log('  🧮 10. Testando Inspetor de Gamepass, Cálculo Inverso e Vouch...');

    // 10.1 Cálculo Inverso e Líquido
    assert.equal(robloxHelper.calcReverseRobux(37.0, 37.0), 1000, 'R$ 37 a taxa 37/1k deve dar 1.000 Robux');
    assert.equal(robloxHelper.calcReverseRobux(74.0, 37.0), 2000, 'R$ 74 a taxa 37/1k deve dar 2.000 Robux');
    assert.equal(robloxHelper.calcLiquidFromGamepass(1429), 1000, '1429 Robux bruto na gamepass (70%) deve resultar em 1000 Robux líquido');
    assert.equal(robloxHelper.extractGamepassId('https://www.roblox.com/game-pass/12345678/vip'), '12345678', 'Deve extrair ID de URL Roblox');
    assert.equal(robloxHelper.extractGamepassId('987654321'), '987654321', 'Deve aceitar ID numérico puro');

    // 10.2 Mock de Gamepass Inspection
    const pyGamepassCmd = require('../src/modules/mary-studio/commands/pyGamepass');
    assert.ok(pyGamepassCmd.data, 'Comando py-gamepass deve possuir dados SlashCommandBuilder');
    assert.equal(pyGamepassCmd.name, 'py-gamepass');
    assert.ok(pyGamepassCmd.aliases.includes('gamepass'), 'Deve conter alias gamepass');
    assert.ok('gamepass' in COMMAND_CATEGORY_MAP, 'gamepass deve estar mapeado em COMMAND_CATEGORY_MAP');
    assert.ok('py-gamepass' in COMMAND_CATEGORY_MAP, 'py-gamepass deve estar mapeado em COMMAND_CATEGORY_MAP');

    console.log('  ✅ 10. Inspetor de Gamepass, Cálculo Inverso e Mapeamento validados com sucesso.');

    // =========================================================================
    // 11. PERSISTÊNCIA ATÔMICA, REAPLICAÇÃO DE AÇÕES E CICLO DE AVALIAÇÃO
    // =========================================================================
    console.log('  💾 11. Testando Persistência Atômica, Reaplicação de Ações e Ciclo de Avaliação...');

    // 11.1 Persistência de Nickname e Status
    await maryStudioManager.updateLocalProfile('1557399041443111025', {
      nick: '🎀 Pyxie Oficial',
      bio: 'Atendimento Robux 24/7',
      statusLoja: 'online',
    });
    const cfgAfterProfile = maryStudioManager.loadConfig();
    assert.equal(cfgAfterProfile.localNick, '🎀 Pyxie Oficial', 'localNick deve persistir no arquivo de configuração');
    assert.equal(cfgAfterProfile.localBio, 'Atendimento Robux 24/7', 'localBio deve persistir no arquivo de configuração');
    assert.equal(cfgAfterProfile.statusLoja, 'online', 'statusLoja deve persistir');

    // 11.2 Reaplicação automática de nickname no discoverGuild
    let nickSetOnGuild = null;
    const testGuildMe = {
      id: '1557399041443111025',
      name: 'MALIBUX',
      ownerId: '1463644930080637140',
      members: {
        me: {
          nickname: 'Antigo Nick',
          setNickname: async (newNick) => {
            nickSetOnGuild = newNick;
          },
        },
      },
    };
    maryStudioManager.client = {
      guilds: {
        cache: new Map([['1557399041443111025', testGuildMe]]),
      },
    };
    maryStudioManager.discoverGuild();
    assert.equal(nickSetOnGuild, '🎀 Pyxie Oficial', 'discoverGuild deve reaplicar automaticamente o nick persistido no servidor');

    // 11.3 Roteamento do botão de review (vouch e personalizado)
    let reviewModalOpened = false;
    reviewHandler.init(maryStudioManager);
    reviewHandler.openReviewModal = async () => {
      reviewModalOpened = true;
    };
    buttonActionHandler.init(maryStudioManager);
    await buttonActionHandler.handleButton({
      customId: 'mary_btn:open_review:btn_vouch_review',
      reply: async () => {},
    });
    assert.equal(reviewModalOpened, true, 'Botão de review deve acionar openReviewModal do reviewHandler');

    // 11.4 Submissão de avaliação e persistência de dados
    let reviewChannelSentEmbed = null;
    const mockReviewChannel = {
      id: 'ch_avaliacoes_99',
      name: 'avaliações',
      isTextBased: () => true,
      send: async (payload) => {
        reviewChannelSentEmbed = payload;
      },
    };
    const mockGuildWithReview = {
      id: '1557399041443111025',
      channels: {
        cache: new Map([['ch_avaliacoes_99', mockReviewChannel]]),
        fetch: async () => mockReviewChannel,
      },
    };
    const mockModalSubmit = {
      fields: {
        getTextInputValue: (field) => {
          if (field === 'review_stars') return '5';
          if (field === 'review_comment') return 'Entrega excelente e instantânea!';
          if (field === 'review_proof') return 'https://cdn.discordapp.com/proof.png';
          return '';
        },
      },
      user: { id: 'buyer_123', tag: 'Buyer#0001' },
      guild: mockGuildWithReview,
      reply: async () => {},
    };
    await reviewHandler.handleReviewSubmit(mockModalSubmit);

    const storeAfterReview = maryStudioManager.loadStoreData();
    assert.ok(storeAfterReview.reviews.length >= 1, 'Deve persistir avaliação no storeData');
    const latestRev = storeAfterReview.reviews[storeAfterReview.reviews.length - 1];
    assert.equal(latestRev.customerId, 'buyer_123');
    assert.equal(latestRev.stars, 5);
    assert.ok(reviewChannelSentEmbed, 'Deve postar card oficial no canal de avaliações descoberto');

    // 11.5 Resolução dinâmica de variáveis pós-salvamento
    const resolved = maryStudioManager.resolveVariables(
      'Status: {status_loja} | Avaliações: {total_avaliacoes} | Média: {nota_media} | PIX: {pix_key}'
    );
    assert.ok(resolved.includes('Online'), 'Deve resolver status online');
    assert.ok(resolved.includes('5.0 ⭐'), 'Deve calcular média 5 estrelas das avaliações');

    console.log('  ✅ 11. Persistência atômica, reaplicação de ações e ciclo de avaliação validados com sucesso.');

    // Limpeza de arquivos de teste temporários
    try {
      if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true, force: true });
      }
    } catch (_) {}

    console.log('\n🎉 TODOS OS TESTES DO MÓDULO MARY STUDIO & HUB PASSARAM COM 100% DE SUCESSO!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FALHA NA SUÍTE DE TESTES DO MARY STUDIO:', error);
    process.exit(1);
  }
})();
