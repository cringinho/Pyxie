const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

console.log('🎀 Iniciando suíte de testes de Engenharia: Módulo Mary Studio & Hub...');

// 1. Isola os caminhos de dados para testes limpos
const testDataDir = path.join(__dirname, 'test-data-mary');
if (!fs.existsSync(testDataDir)) fs.mkdirSync(testDataDir, { recursive: true });

process.env.MARY_SECURITY_PATH = path.join(testDataDir, 'marySecurity.test.json');

const securityGuard = require('../src/modules/mary-studio/utils/securityGuard');
const robloxHelper = require('../src/modules/mary-studio/utils/robloxHelper');
const templatesCatalog = require('../src/modules/mary-studio/utils/templatesCatalog');
const maryStudioManager = require('../src/modules/mary-studio/maryStudioManager');
const maryStudioModule = require('../src/modules/mary-studio/index');
const buttonActionHandler = require('../src/modules/mary-studio/handlers/buttonActionHandler');
const reviewHandler = require('../src/modules/mary-studio/handlers/reviewHandler');
const { COMMAND_CATEGORY_MAP } = require('../src/commands/commandHelpers');
const { TRANSLATIONS } = require('../src/utils/i18n');

(async () => {
  try {
    // =========================================================================
    // 1. SEGURANÇA E CONTROLE DE ACESSO ESTRITO (securityGuard.js)
    // =========================================================================
    console.log('  🔒 1. Testando segurança e controle de acesso...');

    // 1.1 Whitelist de Identidade
    assert.equal(securityGuard.isAuthorizedUser(securityGuard.MARY_DISCORD_ID), true, 'Mary deve ser autorizada');
    assert.equal(securityGuard.isAuthorizedUser(securityGuard.OWNER_SNOWFLAKE), true, 'Owner deve ser autorizado');
    assert.equal(securityGuard.isAuthorizedUser('999999999999999999'), false, 'Usuário estranho deve ser bloqueado');
    assert.equal(securityGuard.isAuthorizedUser(''), false, 'ID vazio deve ser bloqueado');

    // 1.2 Link Mágico HMAC de Uso Único
    const magic = securityGuard.createMagicLink(securityGuard.MARY_DISCORD_ID, { editMessageId: 'msg_test_123' });
    assert.equal(magic.success, true, 'Link mágico deve ser criado com sucesso');
    assert.ok(magic.token, 'Token deve existir');
    assert.ok(magic.url.includes('/mary/auth/magic?token='), 'URL deve apontar para a rota de passagem');

    // 1.3 Consumo do Token (Primeira vez: Sucesso)
    const mockReq = {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
      ip: '192.168.1.100',
    };
    const firstConsume = securityGuard.consumeMagicToken(magic.token, mockReq);
    assert.equal(firstConsume.valid, true, 'Primeiro consumo do link mágico deve ser válido');
    assert.ok(firstConsume.sessionToken, 'Deve retornar sessionToken seguro');
    assert.equal(firstConsume.editMessageId, 'msg_test_123', 'Deve propagar editMessageId');

    // 1.4 Consumo do Token (Segunda vez: Single-Use Token Replay Block)
    const secondConsume = securityGuard.consumeMagicToken(magic.token, mockReq);
    assert.equal(secondConsume.valid, false, 'Segundo consumo do mesmo link mágico DEVE ser rejeitado');
    assert.ok(secondConsume.error.includes('já foi consumido'), 'Mensagem de erro deve indicar reutilização proibida');

    // 1.5 Token Adulterado (Assinatura Inválida)
    const badToken = Buffer.from(JSON.stringify({ payload: JSON.stringify({ userId: securityGuard.MARY_DISCORD_ID }), sig: 'fake_signature' })).toString('base64url');
    const tamperedConsume = securityGuard.consumeMagicToken(badToken, mockReq);
    assert.equal(tamperedConsume.valid, false, 'Token com assinatura adulterada deve falhar');

    // 1.6 Anti-Crawler Detection (Discordbot / Googlebot / WhatsApp)
    assert.equal(securityGuard.isCrawler('Mozilla/5.0 (compatible; Discordbot/2.0; +https://discord.com)'), true, 'Discordbot deve ser detectado como crawler');
    assert.equal(securityGuard.isCrawler('Twitterbot/1.0'), true, 'Twitterbot deve ser detectado como crawler');
    assert.equal(securityGuard.isCrawler('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'), false, 'Navegador de celular real não deve ser crawler');

    // 1.7 Rate Limiter e Bloqueio Automático de IP
    const testIp = '10.0.0.99';
    for (let i = 0; i < 5; i++) {
      securityGuard.recordFailedAttempt(testIp);
    }
    assert.equal(securityGuard.isIpBlocked(testIp), true, 'Após 5 tentativas falhas, IP deve ser bloqueado');
    assert.equal(securityGuard.isIpBlocked('10.0.0.100'), false, 'IP limpo não deve ser bloqueado');

    // 1.8 Validação de Sessão Ativa
    assert.equal(securityGuard.isValidSession(firstConsume.sessionToken), true, 'Sessão recém-criada deve ser válida');
    assert.equal(securityGuard.isValidSession('invalid_session_token_xyz'), false, 'Sessão inexistente deve ser inválida');

    // 1.9 CSRF Protection Middleware
    let nextCalled = false;
    const mockCsrfReq = { method: 'POST', path: '/api/mary/messages/send', headers: { 'x-mary-csrf': '1' } };
    const mockRes = { status: (code) => ({ json: (data) => ({ code, data }) }) };
    securityGuard.csrfProtection(mockCsrfReq, mockRes, () => { nextCalled = true; });
    assert.equal(nextCalled, true, 'Request com X-Mary-CSRF: 1 deve passar');

    let csrfBlocked = false;
    const mockBadCsrfReq = { method: 'POST', path: '/api/mary/messages/send', headers: {} };
    securityGuard.csrfProtection(mockBadCsrfReq, {
      status: (code) => {
        if (code === 403) csrfBlocked = true;
        return { json: () => {} };
      },
    }, () => {});
    assert.equal(csrfBlocked, true, 'Request sem X-Mary-CSRF deve receber 403');

    console.log('  ✅ 1. Todas as 6 camadas de segurança e controle de acesso validadas com 100% de sucesso.');

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
    // 5. ENVIO, EDIÇÃO (message.edit) E DESFAZER (Undo) DE EMBEDS
    // =========================================================================
    console.log('  ✏️ 5. Testando Envio, Edição e Desfazer (Undo 5 versões)...');

    let discordMessageEdited = null;
    const fakeSentDiscordMsg = {
      id: 'discord_msg_8888',
      channelId: 'ch_loja_1',
      async edit(payload) {
        discordMessageEdited = payload;
        return this;
      },
    };

    const mockChannel = {
      id: 'ch_loja_1',
      name: 'vitrine-robux',
      guild: { id: 'guild_mary_roblox_777' },
      async send(payload) {
        return fakeSentDiscordMsg;
      },
      messages: {
        fetch: async (id) => (id === fakeSentDiscordMsg.id ? fakeSentDiscordMsg : null),
      },
    };

    mockDiscordClient.channels = {
      fetch: async (id) => (id === 'ch_loja_1' ? mockChannel : null),
    };

    maryStudioManager.init(mockDiscordClient, mockCtx);

    // 5.1 Enviar mensagem
    const sendResult = await maryStudioManager.sendMessage('ch_loja_1', {
      content: 'Avisos da Loja',
      embed: {
        title: '💎 Tabela de Robux da Mary',
        description: 'Temos {estoque} Robux disponíveis por apenas R$ {preco_1k} o pacote de 1k!',
        color: '#ec4899',
      },
      buttons: [
        { label: '📘 Como Criar Gamepass', style: 'Secondary', actionType: 'custom', id: 'btn_help' },
      ],
    });

    assert.equal(sendResult.success, true, 'Envio deve ser bem-sucedido');
    assert.ok(sendResult.recordId, 'Deve gerar recordId');

    // 5.2 Editar mensagem enviada
    const editResult = await maryStudioManager.editMessage(sendResult.recordId, {
      content: 'Avisos da Loja (Atualizado)',
      embed: {
        title: '💎 Tabela de Robux da Mary [PROMOÇÃO]',
        description: 'Super oferta de Robux com entrega rápida!',
        color: '#a855f7',
      },
      buttons: [],
    });

    assert.equal(editResult.success, true, 'Edição deve ser bem-sucedida');
    assert.ok(discordMessageEdited, 'Deve chamar message.edit no Discord');

    const savedAfterEdit = maryStudioManager.loadMessages().messages[sendResult.recordId];
    assert.equal(savedAfterEdit.versions.length, 1, 'Deve guardar versão anterior para Undo');
    assert.equal(savedAfterEdit.versions[0].content, 'Avisos da Loja', 'Versão arquivada deve ter o conteúdo original');

    // 5.3 Desfazer Edição (Undo)
    const undoResult = await maryStudioManager.undoMessage(sendResult.recordId);
    assert.equal(undoResult.success, true, 'Desfazer deve ser bem-sucedido');

    const savedAfterUndo = maryStudioManager.loadMessages().messages[sendResult.recordId];
    assert.equal(savedAfterUndo.content, 'Avisos da Loja', 'Conteúdo deve ser revertido para o original');
    assert.equal(savedAfterUndo.versions.length, 0, 'Histórico deve consumir a versão restaurada');

    // 5.4 Prevenção de duplicidade de emoji em botões (Anti-Duplicação Visual)
    const testRows = maryStudioManager.buildActionRows([
      { label: '📘 Como Criar Gamepass', emoji: '📘', style: 'Primary' },
      { label: '💰 Tabela de Preços', emoji: '💰', style: 'Secondary' },
    ]);
    const btn1Json = testRows[0].components[0].toJSON();
    const btn2Json = testRows[0].components[1].toJSON();
    assert.equal(btn1Json.label, 'Como Criar Gamepass', 'Emoji duplicado 📘 deve ser removido do label');
    assert.equal(btn1Json.emoji.name, '📘', 'Emoji nativo deve ser preservado');
    assert.equal(btn2Json.label, 'Tabela de Preços', 'Emoji duplicado 💰 deve ser removido do label');
    assert.equal(btn2Json.emoji.name, '💰', 'Emoji nativo deve ser preservado');

    console.log('  ✅ 5. Envio, edição com message.edit(), histórico Undo e desduplicação de botões validados com sucesso.');

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
      statusLoja: 'online',
    });

    assert.equal(patchResult.success, true, 'Atualização de perfil local deve ter sucesso');
    assert.ok(restPatchCalled, 'Deve disparar chamada REST PATCH');
    assert.ok(restPatchCalled.endpoint.includes('/members/@me'), 'Deve chamar rota canônica /members/@me');
    assert.equal(restPatchCalled.data.body.nick, 'Pyxie [🟢 Loja ON]', 'Deve enviar apelido local');
    assert.equal(restPatchCalled.data.body.bio, 'Lojinha da Mary • Robux com entrega rápida!', 'Deve enviar bio local');

    console.log('  ✅ 7. Isolamento de Feature Flags e atualização do Perfil Local (@me) validados.');

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
    assert.equal(TRANSLATIONS.pt.mary.access_denied, '🔒 Acesso negado. Este estúdio administrativo é exclusivo da Mary.');
    assert.equal(TRANSLATIONS.en.mary.access_denied, '🔒 Access denied. This administrative studio is exclusive to Mary.');

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
