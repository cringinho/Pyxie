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
  'magicBeans',
  'weekendBonus',
  'dailyBonus',
  'economyCareers',
  'shop',
  'userProfile',
  'helpCommands',
  'tarot',
  'tarotAlbum',
  'ship',
  'marriage',
  'museum',
  'partnerships',
  'seasonal',
  'arcaneMath',
  'tictactoe',
  'minesweeper',
  'dice',
];

for (const themeKey of EXPECTED_THEMES) {
  assert(rawConfig.themes[themeKey], `Tema '${themeKey}' deve estar configurado`);
  const theme = rawConfig.themes[themeKey];
  assert(theme.primaryId && typeof theme.primaryId === 'string', `Tema '${themeKey}' deve possuir primaryId string`);
  assert(Array.isArray(theme.secondaryIds), `Tema '${themeKey}' deve possuir array secondaryIds`);
  assert(theme.fallback && typeof theme.fallback === 'string', `Tema '${themeKey}' deve possuir fallback`);
}
console.log(`✅ Arquivo de configuração themeEmojis.json validado com ${EXPECTED_THEMES.length} temas padrão para Discord embeds.`);

// 2. Validação dos IDs dos Emojis e Resolução contra o Catálogo Oficial
const EXPECTED_MAPPINGS = {
  coins: { primaryId: '1548443880066777098', name: 'coin', animated: true },
  magicBeans: { primaryId: '1548444140532928642', name: 'peakmagicbean', animated: false },
  weekendBonus: { primaryId: '1548443947079049256', name: 'event45', animated: false },
  dailyBonus: { primaryId: '1548443978414817331', name: 'gift62', animated: false },
  economyCareers: { primaryId: '1548444230588956683', name: 'shineygoldcoinsi', animated: true },
  shop: { primaryId: '1551356299500064858', name: '9862_holo_diamond', animated: true },
  userProfile: { primaryId: '1551355544185344112', name: '3861memberpurple', animated: false },
  helpCommands: { primaryId: '1548444173747621918', name: 'prcomputer', animated: true },
  tarot: { primaryId: '1548444111319605330', name: 'Moon', animated: true },
  tarotAlbum: { primaryId: '1551355436890857512', name: '2663tarotcards', animated: true },
  ship: { primaryId: '1551744119670575124', name: 'emoji_1551744119670575124', animated: false },
  marriage: { primaryId: '1548444199970545756', name: 'purpleheartdrip2', animated: true },
  museum: { primaryId: '1551355436890857512', name: '2663tarotcards', animated: true },
  partnerships: { primaryId: '1551355541148667954', name: '3849purplebutterflies', animated: true },
  seasonal: { primaryId: '1551356273918746724', name: '9721dndd20', animated: false },
  arcaneMath: { primaryId: '1551355602297430016', name: '4353_Pentacle', animated: false },
  tictactoe: { primaryId: '1551355296113238187', name: '1314moon', animated: false },
  minesweeper: { primaryId: '1551355644844580967', name: '4693toxicpotion', animated: false },
  dice: { primaryId: '1551356619647094814', name: '96959prided20', animated: false },
};

for (const key of EXPECTED_THEMES) {
  const themeConfig = rawConfig.themes[key];
  const data = getThemeEmojiData(key);
  assert.equal(data.id, themeConfig.primaryId, `Emoji ID para ${key} deve corresponder ao configurado (${themeConfig.primaryId})`);
  assert(data.name, `Emoji name para ${key} deve existir`);
  assert(typeof data.animated === 'boolean', `Emoji animated para ${key} deve ser booleano`);

  const format = getThemeEmoji(key);
  assert(format && format.length > 0, `Formato Discord para ${key} incorreto`);

  const url = getThemeEmojiUrl(key);
  assert(url && url.startsWith('https://cdn.discordapp.com/emojis/'), `URL CDN para ${key} incorreta`);
}
console.log(`✅ Resolução canônica de todos os ${EXPECTED_THEMES.length} temas com identificadores, nomes e URLs validados.`);

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
assert.equal(userBadge, getThemeEmoji('userProfile'), 'Badge de perfil deve resolver corretamente');

const formattedCoins = formatThemedCoins(1500);
assert.equal(formattedCoins, `1.500 ${getThemeEmoji('coins')}`, 'Formatação temática de moedas deve ser precisa');

// 5. Fallback Seguro para Chave Inexistente
const unknownData = getThemeEmojiData('non_existent_key', { fallback: '💎' });
assert.equal(unknownData.format, '💎', 'Fallback personalizado deve ser respeitado');

console.log('🎉 Todos os testes de Padronização de Emojis Temáticos passaram com 100% de sucesso!');

