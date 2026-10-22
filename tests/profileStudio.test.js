const assert = require('node:assert/strict');
const { generateProfileCard, prepareCardText, sanitizeCardText, THEME_PALETTES, CARD_WIDTH, CARD_HEIGHT } = require('../src/services/profileCardGenerator');
const { normalizeProfileStyle, THEME_DESIGNS, LAYOUTS, FRAMES, STICKERS } = require('../src/services/profileStyle');
const { toTwemojiCode } = require('../src/utils/twemoji');
const { withEmojiFallback, ensureCanvasFonts, EMOJI_FONT_FAMILY } = require('../src/utils/canvasFonts');
const economy = require('../src/services/economy');
const perfilCmd = require('../src/commands/perfil');
const { TRANSLATIONS } = require('../src/utils/i18n');

console.log('🎛️ Iniciando testes do Estúdio do Perfil, temas 2.0 e correção de emojis (anti-quadradinho)...');

const TEST_USER = `profile_studio_test_${Date.now()}`;
const mockUser = {
  id: TEST_USER,
  username: 'estudio',
  displayName: 'Ana Clara 🦋',
  displayAvatarURL: () => null,
};

function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

(async () => {
  // 1. Texto do card preserva emojis e normaliza letras estilizadas
  assert.equal(prepareCardText('Ana Clara 🦋'), 'Ana Clara 🦋', 'Emojis devem ser mantidos para renderização Twemoji.');
  assert.equal(prepareCardText('🌺 𝑪𝒓𝒊𝒏𝒈𝒆𝒍𝒂̂𝒏𝒅𝒊𝒂'), '🌺 Cringelândia', 'Letras matemáticas viram ASCII com acento recomposto.');
  assert.equal(prepareCardText('🅲🆁🅸🅽🅶🅴'), 'CRINGE', 'Letras enclausuradas viram ASCII.');
  assert.equal(sanitizeCardText('👑 cringinho 🌸', 20), 'cringinho', 'Versão texto puro continua sem emojis.');
  console.log('  ✅ 1. Texto do card mantém emojis e normaliza fontes estilizadas.');

  // 2. Nomes de arquivo Twemoji
  assert.equal(toTwemojiCode('🌸'), '1f338');
  assert.equal(toTwemojiCode('❤️'), '2764', 'FE0F é descartado fora de sequências ZWJ.');
  assert.equal(toTwemojiCode('👩‍💻'), '1f469-200d-1f4bb');
  console.log('  ✅ 2. Conversão de emojis para Twemoji validada.');

  // 3. Fallback de emoji nas renderizações canvas (ship, tarot, sazonal)
  ensureCanvasFonts();
  const { GlobalFonts } = require('@napi-rs/canvas');
  assert.ok(GlobalFonts.has(EMOJI_FONT_FAMILY), 'Fonte de emojis deve estar registrada no canvas.');
  assert.equal(withEmojiFallback('bold 20px sans-serif'), 'bold 20px "DejaVu Sans", PyxieSans, Twemoji', 'Nome genérico vira família concreta + emojis.');
  assert.equal(withEmojiFallback('italic 15px serif'), 'italic 15px "DejaVu Serif", "DejaVu Sans", PyxieSans, Twemoji');
  for (const file of ['../src/services/shipRenderer.js', '../src/services/tarotRenderer.js', '../src/modules/seasonal/cardRenderer.js']) {
    const src = require('node:fs').readFileSync(require('node:path').join(__dirname, file), 'utf8');
    const rawFonts = src.split(/\r?\n/).filter((l) => /ctx\.font\s*=/.test(l) && !l.includes('withEmojiFallback('));
    assert.equal(rawFonts.length, 0, `${file} não pode definir ctx.font sem fallback de emoji.`);
  }
  console.log('  ✅ 3. Renderizadores canvas usam fonte de emojis como fallback.');

  // 4. Estilo do perfil: validação e persistência
  assert.deepEqual(normalizeProfileStyle({ layout: 'hacker', showcase: ['coins', 'x', 'coins', 'tarot', 'rank', 'love', 'works'] }), {
    layout: 'glass',
    frame: 'circle',
    showcase: ['coins', 'tarot', 'rank', 'love'],
    sticker: 'none',
  });
  economy.setProfileStyle(TEST_USER, { layout: 'neon', frame: 'halo', sticker: '🦊', showcase: ['streak', 'museum'] });
  const saved = economy.getUserAccount(TEST_USER).profileStyle;
  assert.equal(saved.layout, 'neon');
  assert.equal(saved.frame, 'halo');
  assert.equal(saved.sticker, '🦊');
  assert.deepEqual(saved.showcase, ['streak', 'museum']);
  economy.setProfileStyle(TEST_USER, { sticker: '<script>' });
  assert.equal(economy.getUserAccount(TEST_USER).profileStyle.sticker, 'none', 'Sticker fora da lista é rejeitado.');
  console.log('  ✅ 4. Estilo do perfil validado e persistido.');

  // 5. Catálogo de temas 2.0 bilíngue e com direção de arte
  const catalog = economy.getThemesCatalog();
  assert.equal(Object.keys(catalog).length, 13);
  for (const [id, theme] of Object.entries(catalog)) {
    assert.ok(theme.nameEn && theme.descEn, `Tema ${id} precisa de nome e descrição em inglês.`);
    assert.ok(THEME_DESIGNS[id], `Tema ${id} precisa de direção de arte.`);
    assert.ok(THEME_PALETTES[id], `Tema ${id} precisa de paleta derivada.`);
  }
  assert.ok(Object.values(THEME_DESIGNS).some((d) => d.mode === 'light'), 'Deve existir ao menos um tema claro.');
  console.log('  ✅ 5. 13 temas com arte própria, modo claro e nomes bilíngues.');

  // 6. Card em retrato para celular, renderizado em todos os temas e estilos
  const themeIds = Object.keys(THEME_DESIGNS);
  for (let i = 0; i < themeIds.length; i++) {
    const png = await generateProfileCard({
      targetUser: mockUser,
      guild: null,
      source: i % 2 ? 'en' : 'pt',
      overrides: {
        theme: themeIds[i],
        style: { layout: LAYOUTS[i % LAYOUTS.length], frame: FRAMES[i % FRAMES.length], sticker: STICKERS[(i % (STICKERS.length - 1)) + 1] },
      },
    });
    const size = pngSize(png);
    assert.equal(size.width, CARD_WIDTH);
    assert.equal(size.height, CARD_HEIGHT);
    assert.ok(size.height > size.width, 'Card deve ser retrato (4:5) para ocupar a tela do celular.');
  }
  console.log(`  ✅ 6. Card ${CARD_WIDTH}x${CARD_HEIGHT} renderizado nos ${themeIds.length} temas, 3 estilos e 3 molduras.`);

  // 7. Estúdio do Perfil: prévia + 4 menus + voltar
  const studio = await perfilCmd.buildStudioView(mockUser, TEST_USER, 'pt');
  assert.equal(studio.components.length, 5, 'Estúdio deve ter 4 menus e 1 linha de botões.');
  assert.equal(studio.files[0].name, 'profile_card.png');
  assert.deepEqual(studio.attachments, [], 'Prévia deve substituir o anexo anterior.');
  const showcaseMenu = studio.components[2].components[0].data;
  assert.equal(showcaseMenu.max_values, 4);
  assert.ok(studio.embeds[0].data.description.includes('\n\n'), 'Descrição do estúdio deve ter respiro \\n\\n.');
  console.log('  ✅ 7. Estúdio do Perfil com prévia ao vivo e menus de layout, moldura, destaques e sticker.');

  // 8. Galeria de temas: experimentar antes de comprar
  const balanceBefore = economy.getUserAccount(TEST_USER).magicBeans;
  const preview = await perfilCmd.buildThemesView(mockUser, TEST_USER, 'pt', 'vaporwave');
  const buttons = preview.components[1].components.map((c) => c.data.custom_id);
  assert.ok(buttons.some((id) => id.startsWith('profile_buy_theme:') && id.endsWith(':vaporwave')), 'Prévia de tema não adquirido mostra botão de desbloqueio.');
  assert.ok(preview.embeds[0].data.description.includes('Experimentando'), 'Prévia deve indicar o tema em teste.');
  assert.equal(economy.getUserAccount(TEST_USER).magicBeans, balanceBefore, 'Pré-visualizar não pode gastar feijões.');
  assert.ok(!economy.getUserAccount(TEST_USER).themes.includes('vaporwave'), 'Pré-visualizar não pode desbloquear o tema.');
  console.log('  ✅ 8. Temas podem ser experimentados no próprio card antes da compra.');

  // 9. Paridade das novas chaves
  for (const sec of ['profileCard', 'profileStudio']) {
    assert.deepEqual(Object.keys(TRANSLATIONS.pt[sec]).sort(), Object.keys(TRANSLATIONS.en[sec]).sort(), `${sec} deve ter paridade PT/EN.`);
  }
  console.log('  ✅ 9. Paridade bilíngue do card e do estúdio.');

  // Limpeza da conta de teste
  const fs = require('node:fs');
  const path = require('node:path');
  const ecoFile = path.join(__dirname, '..', 'data', 'economy.json');
  const eco = JSON.parse(fs.readFileSync(ecoFile, 'utf8'));
  delete eco[TEST_USER];
  fs.writeFileSync(ecoFile, JSON.stringify(eco, null, 2), 'utf8');

  console.log('🎉 tests/profileStudio.test.js concluído com 100% de sucesso!');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Falha nos testes do Estúdio do Perfil:', err);
  process.exit(1);
});
