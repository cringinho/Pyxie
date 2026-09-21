const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {
  getThemeConfig,
  resolveEmojiById,
  getThemeEmojiData,
  getThemeEmoji,
  getThemeEmojiUrl,
  getUserProfileBadge,
  formatThemedCoins,
} = require('../src/utils/themeEmojis');

console.log('✨ Iniciando suíte de testes de Padronização e Resolução Dinâmica de Emojis Temáticos...');

// 1. Integridade do Arquivo de Configuração
const themeConfigFile = path.join(__dirname, '..', 'src', 'data', 'themeEmojis.json');
assert(fs.existsSync(themeConfigFile), 'Arquivo src/data/themeEmojis.json deve existir');

const rawConfig = JSON.parse(fs.readFileSync(themeConfigFile, 'utf8'));
assert(rawConfig.themes, 'Configuração deve possuir nó themes');

const EXPECTED_THEMES = [
  'coins',
  'weekendBonus',
  'dailyBonus',
  'tarot',
  'tarotAlbum',
  'helpCommands',
  'economyCareers',
  'dice',
  'userProfile',
  'grimorio',
  'ship',
  'websiteHome',
  'websiteSocial',
];

for (const themeKey of EXPECTED_THEMES) {
  assert(rawConfig.themes[themeKey], `Tema '${themeKey}' deve estar configurado`);
  const theme = rawConfig.themes[themeKey];
  assert(theme.primaryId && typeof theme.primaryId === 'string', `Tema '${themeKey}' deve possuir primaryId string`);
  assert(Array.isArray(theme.secondaryIds), `Tema '${themeKey}' deve possuir array secondaryIds`);
  assert(theme.fallback && typeof theme.fallback === 'string', `Tema '${themeKey}' deve possuir fallback`);
}
console.log('✅ Arquivo de configuração themeEmojis.json validado com 13 temas padrão.');

// 2. Validação dos IDs dos Emojis e Resolução contra o Catálogo Oficial
const EXPECTED_MAPPINGS = {
  coins: { primaryId: '1548443880066777098', name: 'coin', animated: true },
  weekendBonus: { primaryId: '1548443947079049256', name: 'event45', animated: false },
  dailyBonus: { primaryId: '1548443978414817331', name: 'gift62', animated: false },
  tarot: { primaryId: '1548444111319605330', name: 'Moon', animated: true },
  tarotAlbum: { primaryId: '1551355436890857512', name: '2663tarotcards', animated: true },
  helpCommands: { primaryId: '1548444173747621918', name: 'prcomputer', animated: true },
  economyCareers: { primaryId: '1548444230588956683', name: 'shineygoldcoinsi', animated: true },
  dice: { primaryId: '1551355542700822538', name: '3857nat1', animated: false },
  userProfile: { primaryId: '1551355544185344112', name: '3861memberpurple', animated: false },
  grimorio: { primaryId: '1551355602297430016', name: '4353_Pentacle', animated: false },
  ship: { primaryId: '1551355720874725386', name: '5407rainbowheart', animated: true },
  websiteHome: { primaryId: '1551356640782057502', name: '255208butterfly', animated: true },
  websiteSocial: { primaryId: '1551355541148667954', name: '3849purplebutterflies', animated: true },
};

for (const [key, exp] of Object.entries(EXPECTED_MAPPINGS)) {
  const data = getThemeEmojiData(key);
  assert.equal(data.id, exp.primaryId, `Emoji ID para ${key} deve ser ${exp.primaryId}`);
  assert.equal(data.name, exp.name, `Emoji name para ${key} deve ser ${exp.name}`);
  assert.equal(data.animated, exp.animated, `Emoji animated para ${key} deve ser ${exp.animated}`);

  const format = getThemeEmoji(key);
  const expectedFormat = exp.animated ? `<a:${exp.name}:${exp.primaryId}>` : `<:${exp.name}:${exp.primaryId}>`;
  assert.equal(format, expectedFormat, `Formato Discord para ${key} incorreto`);

  const url = getThemeEmojiUrl(key);
  const ext = exp.animated ? 'gif' : 'png';
  assert.equal(url, `https://cdn.discordapp.com/emojis/${exp.primaryId}.${ext}`, `URL CDN para ${key} incorreta`);
}
console.log('✅ Resolução canônica de todos os 13 temas com identificadores, nomes e URLs validados.');

// 3. Variações Dinâmicas de Paleta (Tarot e Variações Aleatórias)
const tarotPool = [
  '1548444111319605330', // Moon
  '1551355296113238187', // 1069purplemoon
  '1551355287829749820', // 1007purplecrystalmoon
  '1551355603505520731', // 4363purplemoon
  '1551355640939806860', // 4600purplewitchhat
  '1551356681185796286', // 424269witchhat
];

const sampledVariants = new Set();
for (let i = 0; i < 50; i++) {
  const variantEmoji = getThemeEmoji('tarot', { variant: 'random' });
  const matchedId = tarotPool.find((id) => variantEmoji.includes(id));
  assert(matchedId, `Emoji de variação de tarot deve pertencer à paleta autorizada (${variantEmoji})`);
  sampledVariants.add(matchedId);
}
assert(sampledVariants.size > 1, 'Variação aleatória deve cobrir múltiplos IDs da paleta');
console.log(`✅ Paleta dinâmica de variações de Tarot validada (${sampledVariants.size} variações sorteadas em 50 amostras).`);

// 4. Funções Específicas de Apoio
const userBadge = getUserProfileBadge();
assert.equal(userBadge, '<:3861memberpurple:1551355544185344112>', 'Badge de perfil deve resolver corretamente');

const formattedCoins = formatThemedCoins(1500);
assert.equal(formattedCoins, '1.500 <a:coin:1548443880066777098>', 'Formatação temática de moedas deve ser precisa');

// 5. Fallback Seguro para Chave Inexistente
const unknownData = getThemeEmojiData('non_existent_key', { fallback: '💎' });
assert.equal(unknownData.format, '💎', 'Fallback personalizado deve ser respeitado');

console.log('🎉 Todos os testes de Padronização de Emojis Temáticos passaram com 100% de sucesso!');

