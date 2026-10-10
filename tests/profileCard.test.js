const assert = require('node:assert/strict');
const { generateProfileCard, sanitizeCardText, THEME_PALETTES } = require('../src/services/profileCardGenerator');
const perfilCmd = require('../src/commands/perfil');
const { buildProfileEmbed } = require('../src/commands/economyHelpers');

console.log('🌸 Iniciando suíte de testes de Engenharia: Card de Identidade Arcana (Satori + Resvg Rust)...');

async function runTests() {
  const mockUser = {
    id: '214153735281180673',
    username: 'cringinho',
    displayName: 'cringinho',
    displayAvatarURL: () => 'https://example.com/avatar.png',
  };

  const mockGuild = {
    id: '1453890868980482090',
    name: '🅲🆁🅸🅽🅶🅴🅻🅰🅽🅳🅸🅰 ✨',
    iconURL: () => 'https://example.com/icon.png',
  };

  // 1. Sanitização de Texto e Emojis (Anti-Tofu / Glyphs)
  const sanitizedGuild = sanitizeCardText(mockGuild.name);
  assert.equal(sanitizedGuild, 'CRINGELANDIA', 'Caracteres enclausurados e emojis devem ser normalizados para ASCII limpo.');
  const sanitizedUser = sanitizeCardText('👑 cringinho 🌸', 20);
  assert.equal(sanitizedUser, 'cringinho', 'Emojis devem ser removidos do nome renderizado no card.');
  console.log('  ✅ 1. Sanitização de texto e remoção de caracteres tofu validada com sucesso.');

  // 2. Renderização em Português
  const cardBufferPt = await generateProfileCard({
    targetUser: mockUser,
    guild: mockGuild,
    source: 'pt',
  });

  assert.ok(Buffer.isBuffer(cardBufferPt), 'O card gerado deve ser um Buffer válido.');
  assert.ok(cardBufferPt.length > 20000, `O buffer PNG deve ter tamanho substancial (gerado: ${cardBufferPt.length} bytes).`);

  // Assinatura PNG (primeiros 8 bytes: 89 50 4E 47 0D 0A 1A 0A)
  const isPng = cardBufferPt[0] === 0x89 && cardBufferPt[1] === 0x50 && cardBufferPt[2] === 0x4E && cardBufferPt[3] === 0x47;
  assert.ok(isPng, 'O buffer deve conter cabeçalho PNG válido.');
  console.log('  ✅ 2. Renderização em Português (PT-BR) com Satori e Resvg validada com sucesso.');

  // 3. Renderização em Inglês (Paridade Bilíngue)
  const cardBufferEn = await generateProfileCard({
    targetUser: mockUser,
    guild: mockGuild,
    source: 'en',
  });

  assert.ok(Buffer.isBuffer(cardBufferEn), 'O card gerado em EN deve ser um Buffer válido.');
  assert.ok(cardBufferEn.length > 20000, 'O buffer PNG em EN deve ter tamanho substancial.');
  console.log('  ✅ 3. Renderização em Inglês (EN) com Satori e Resvg validada com sucesso.');

  // 4. Resiliência sem Guilda (DM ou Servidor sem Ícone)
  const cardBufferNoGuild = await generateProfileCard({
    targetUser: mockUser,
    guild: null,
    source: 'pt',
  });
  assert.ok(Buffer.isBuffer(cardBufferNoGuild), 'O card sem guilda deve renderizar com fallback elegante.');
  console.log('  ✅ 4. Resiliência a servidor nulo / DM validada com sucesso.');

  // 5. Validação das 7 Paletas de Temas Visuais
  const themeKeys = Object.keys(THEME_PALETTES);
  assert.equal(themeKeys.length, 7, 'Devem existir 7 temas com paletas customizadas completas.');
  for (const tKey of themeKeys) {
    const palette = THEME_PALETTES[tKey];
    assert.ok(palette.color, `Tema ${tKey} deve possuir cor primária.`);
    assert.ok(palette.bgGradient, `Tema ${tKey} deve possuir gradiente atmosférico.`);
    assert.ok(palette.avatarRing, `Tema ${tKey} deve possuir anel temático de avatar.`);
    assert.ok(palette.titleBg, `Tema ${tKey} deve possuir estilo de título prestige.`);
  }
  console.log('  ✅ 5. Todas as 7 paletas de temas visuais com gradientes e prestígio validadas com sucesso.');

  // 6. Integração do Comando /py-profile e Desduplicação de Embed
  const profileView = await perfilCmd.buildProfileView(mockUser, 'viewer-1', 'pt');
  assert.ok(profileView.embeds && profileView.embeds.length > 0, 'View deve conter embed de perfil.');
  assert.equal(profileView.components.length, 2, 'View deve conter 2 ActionRows (Customização + Honeypot Links).');
  assert.ok(profileView.files && profileView.files.length > 0, 'View deve conter anexo do card PNG.');
  assert.equal(profileView.files[0].name, 'profile_card.png', 'Nome do arquivo deve ser profile_card.png.');

  const embedDesc = profileView.embeds[0].data.description;
  assert.ok(!embedDesc.includes('TESOURO & ECONOMIA'), 'Embed com imagem não deve duplicar o texto de Tesouro & Economia.');
  assert.ok(!embedDesc.includes('CARREIRA & VOCAÇÃO'), 'Embed com imagem não deve duplicar o texto de Carreira.');
  assert.ok(!embedDesc.includes('undefined%'), 'Embed não deve conter porcentagem undefined.');
  assert.ok(!embedDesc.includes('undefined/10'), 'Embed não deve conter conquistas undefined.');
  assert.ok(embedDesc.includes('Tema:'), 'Embed deve exibir o tema visual equipado.');
  console.log('  ✅ 6. Desduplicação do Embed (showcase limpo sem repetição dos 5 pilares) validada com sucesso.');

  // 7. Validação do Modo Contingência de Texto (hasImageCard = false)
  const fallbackEmbed = buildProfileEmbed({
    user: mockUser,
    account: { coins: 5000, magicBeans: 3, workCount: 15 },
    equippedTitle: null,
    source: 'pt',
    tarotStats: { discoveredCount: 12, percent: 15.4, claimedCount: 2 },
    hasImageCard: false,
    guild: mockGuild,
  });
  const fallbackDesc = fallbackEmbed.data.description;
  assert.ok(fallbackDesc.includes('TESOURO & ECONOMIA'), 'Modo contingência deve exibir os blocos de texto.');
  assert.ok(fallbackDesc.includes('15.4%'), 'Modo contingência deve exibir porcentagem correta do tarot.');
  assert.ok(fallbackDesc.includes('2/10'), 'Modo contingência deve exibir contagem de conquistas correta.');
  console.log('  ✅ 7. Modo de contingência em texto completo validado com 100% de integridade.');

  console.log('🎉 Todos os testes do Card de Identidade Arcana passaram com 100% de sucesso!');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de perfil:', err);
  process.exit(1);
});
