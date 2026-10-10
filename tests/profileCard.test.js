const assert = require('node:assert/strict');
const { generateProfileCard } = require('../src/services/profileCardGenerator');
const perfilCmd = require('../src/commands/perfil');

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
    name: 'Cringelândia',
    iconURL: () => 'https://example.com/icon.png',
  };

  // 1. Renderização em Português
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
  console.log('  ✅ 1. Renderização em Português (PT-BR) com Satori e Resvg validada com sucesso.');

  // 2. Renderização em Inglês (Paridade Bilíngue)
  const cardBufferEn = await generateProfileCard({
    targetUser: mockUser,
    guild: mockGuild,
    source: 'en',
  });

  assert.ok(Buffer.isBuffer(cardBufferEn), 'O card gerado em EN deve ser um Buffer válido.');
  assert.ok(cardBufferEn.length > 20000, 'O buffer PNG em EN deve ter tamanho substancial.');
  console.log('  ✅ 2. Renderização em Inglês (EN) com Satori e Resvg validada com sucesso.');

  // 3. Resiliência sem Guilda (DM ou Servidor sem Ícone)
  const cardBufferNoGuild = await generateProfileCard({
    targetUser: mockUser,
    guild: null,
    source: 'pt',
  });
  assert.ok(Buffer.isBuffer(cardBufferNoGuild), 'O card sem guilda deve renderizar com fallback elegante.');
  console.log('  ✅ 3. Resiliência a servidor nulo / DM validada com sucesso.');

  // 4. Integração do Comando /py-profile
  const profileView = await perfilCmd.buildProfileView(mockUser, 'viewer-1', 'pt');
  assert.ok(profileView.embeds && profileView.embeds.length > 0, 'View deve conter embed de perfil.');
  assert.equal(profileView.components.length, 2, 'View deve conter 2 ActionRows (Customização + Honeypot Links).');
  assert.ok(profileView.files && profileView.files.length > 0, 'View deve conter anexo do card PNG.');
  assert.equal(profileView.files[0].name, 'profile_card.png', 'Nome do arquivo deve ser profile_card.png.');
  console.log('  ✅ 4. Integração do comando /py-profile com os 5 Pilares e links de divulgação validada.');

  console.log('🎉 Todos os testes do Card de Identidade Arcana passaram com 100% de sucesso!');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de perfil:', err);
  process.exit(1);
});
