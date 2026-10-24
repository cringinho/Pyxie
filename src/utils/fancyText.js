/**
 * Texto estilizado com os alfabetos matemáticos do Unicode (𝕯𝖊𝖛𝖔𝖗𝖆𝖉𝖔𝖗𝖆, 𝓞𝓻𝓪́𝓬𝓾𝓵𝓸, ʟᴇɴᴅᴀ...).
 * Usado nos títulos de conquistas muito difíceis, para aparecerem diferentes de tudo no Discord.
 *
 * Acentos: o texto é decomposto (NFD), a letra base vira a estilizada e o acento combinante
 * continua depois dela. Leitores de tela leem mal esses alfabetos, então quem exibe o título
 * deve guardar também o nome comum (plain) para acessibilidade.
 */

const OFFSETS = {
  bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  boldItalic: { upper: 0x1d468, lower: 0x1d482 },
  boldScript: { upper: 0x1d4d0, lower: 0x1d4ea },
  boldFraktur: { upper: 0x1d56c, lower: 0x1d586 },
  doubleStruck: { upper: 0x1d538, lower: 0x1d552, digit: 0x1d7d8 },
  sansBold: { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  sansBoldItalic: { upper: 0x1d63c, lower: 0x1d656 },
  monospace: { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 },
  circled: { upper: 0x24b6, lower: 0x24d0 },
};

// Letras que o Unicode guardou em outro bloco (não existem no alfabeto contínuo)
const EXCEPTIONS = {
  doubleStruck: { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 },
};

const SMALL_CAPS = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
  n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};

function mapChar(ch, alphabet) {
  if (alphabet === 'smallCaps') return SMALL_CAPS[ch.toLowerCase()] || ch;
  const table = OFFSETS[alphabet];
  if (!table) return ch;
  const exception = EXCEPTIONS[alphabet]?.[ch];
  if (exception) return String.fromCodePoint(exception);
  const code = ch.codePointAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(table.upper + (code - 65));
  if (code >= 97 && code <= 122) return String.fromCodePoint(table.lower + (code - 97));
  if (code >= 48 && code <= 57 && table.digit) return String.fromCodePoint(table.digit + (code - 48));
  return ch;
}

/** Converte o texto para um alfabeto estilizado, preservando acentos e espaços. */
function stylize(text, alphabet) {
  return [...String(text ?? '').normalize('NFD')].map((ch) => mapChar(ch, alphabet)).join('');
}

/**
 * Estilos dos títulos de conquista: alfabeto + moldura. O mesmo id define o selo visual no
 * cartão de perfil (cores em profileCardGenerator).
 */
const TITLE_STYLES = {
  eclipse: { alphabet: 'boldFraktur', left: '☾', right: '☽', colors: ['#0f0a1e', '#f5c542'] },
  void: { alphabet: 'smallCaps', left: '⸸', right: '⸸', colors: ['#050208', '#9f7aea'] },
  arcane: { alphabet: 'boldScript', left: '✧', right: '✧', colors: ['#2e1065', '#c4b5fd'] },
  aurora: { alphabet: 'doubleStruck', left: '꧁', right: '꧂', colors: ['#0e7490', '#f0abfc'] },
  royal: { alphabet: 'boldItalic', left: '♛', right: '♛', colors: ['#7f1d1d', '#fbbf24'] },
  ember: { alphabet: 'sansBold', left: '✦', right: '✦', colors: ['#7c2d12', '#fb923c'] },
  prism: { alphabet: 'circled', left: '❀', right: '❀', colors: ['#db2777', '#38bdf8'] },
  stardust: { alphabet: 'sansBoldItalic', left: '⋆｡˚', right: '˚｡⋆', colors: ['#1e1b4b', '#fde68a'] },
  bloom: { alphabet: 'monospace', left: '✿', right: '✿', colors: ['#9d174d', '#fbcfe8'] },
  // Estilos de séries que evoluem (meta 1 → 4): cada degrau fica mais enfeitado
  spark: { alphabet: 'sansBold', left: '✦', right: '✦', colors: ['#4c1d95', '#a78bfa'] },
  celestial: { alphabet: 'boldFraktur', left: '꧁༺', right: '༻꧂', colors: ['#020617', '#fde68a'] },
};

/** Título pronto para o Discord: moldura + alfabeto do estilo. Sem estilo, devolve o texto. */
function formatStyledTitle(name, style) {
  const config = TITLE_STYLES[style];
  if (!config) return String(name ?? '');
  return `${config.left} ${stylize(name, config.alphabet)} ${config.right}`;
}

module.exports = {
  TITLE_STYLES,
  stylize,
  formatStyledTitle,
};
