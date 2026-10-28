// Pacotes de cargos prontos para o módulo Injeções. Cada item: id, nomes PT/EN, listras da
// bandeira (cor de cima para baixo; a do meio vira a cor do cargo) e um emoji para o menu.
// As bandeiras seguem as versões mais usadas pela comunidade; o nome é o que importa.
const s = (...hex) => hex;

const GENDER = [
  { id: 'woman', pt: 'Mulher', en: 'Woman', stripes: s('E75480'), emoji: '♀️' },
  { id: 'man', pt: 'Homem', en: 'Man', stripes: s('3B82F6'), emoji: '♂️' },
  { id: 'transwoman', pt: 'Mulher trans', en: 'Trans woman', stripes: s('5BCEFA', 'F5A9B8', 'FFFFFF', 'F5A9B8', '5BCEFA'), emoji: '🏳️‍⚧️' },
  { id: 'transman', pt: 'Homem trans', en: 'Trans man', stripes: s('5BCEFA', 'F5A9B8', 'FFFFFF', 'F5A9B8', '5BCEFA'), emoji: '🏳️‍⚧️' },
  { id: 'nonbinary', pt: 'Não-binárie', en: 'Non-binary', stripes: s('FCF434', 'FFFFFF', '9C59D1', '2C2C2C'), emoji: '💛' },
  { id: 'agender', pt: 'Agênero', en: 'Agender', stripes: s('000000', 'BCC4C7', 'FFFFFF', 'B7F684', 'FFFFFF', 'BCC4C7', '000000'), emoji: '🤍' },
  { id: 'genderfluid', pt: 'Gênero-fluido', en: 'Genderfluid', stripes: s('FF76A4', 'FFFFFF', 'C011D7', '000000', '2F3CBE'), emoji: '🌊' },
  { id: 'bigender', pt: 'Bigênero', en: 'Bigender', stripes: s('C479A2', 'EDA5CD', 'D6C7E8', 'FFFFFF', 'D6C7E8', '9AC7E8', '6D82D1'), emoji: '💗' },
  { id: 'genderqueer', pt: 'Genderqueer', en: 'Genderqueer', stripes: s('B57EDC', 'FFFFFF', '4A8123'), emoji: '💜' },
  { id: 'demigirl', pt: 'Demigirl', en: 'Demigirl', stripes: s('7F7F7F', 'C4C4C4', 'FFAEC9', 'FFFFFF', 'FFAEC9', 'C4C4C4', '7F7F7F'), emoji: '🩷' },
  { id: 'demiboy', pt: 'Demiboy', en: 'Demiboy', stripes: s('7F7F7F', 'C4C4C4', '9AD9EB', 'FFFFFF', '9AD9EB', 'C4C4C4', '7F7F7F'), emoji: '🩵' },
  { id: 'pangender', pt: 'Pangênero', en: 'Pangender', stripes: s('FFF798', 'FEDDCD', 'FFEBFB', 'FFFFFF', 'FFEBFB', 'FEDDCD', 'FFF798'), emoji: '🌟' },
  { id: 'neutrois', pt: 'Neutrois', en: 'Neutrois', stripes: s('FFFFFF', '1F9F00', '000000'), emoji: '💚' },
  { id: 'questioning-g', pt: 'Questionando o gênero', en: 'Questioning gender', stripes: s('9B59B6'), emoji: '❔' },
];

const SEXUALITY = [
  { id: 'lgbt', pt: 'LGBTQIA+', en: 'LGBTQIA+', stripes: s('E40303', 'FF8C00', 'FFED00', '008026', '004DFF', '750787'), emoji: '🏳️‍🌈' },
  { id: 'progress', pt: 'Orgulho Progresso', en: 'Progress Pride', stripes: s('000000', '784F17', '5BCEFA', 'F5A9B8', 'FFFFFF', 'E40303', 'FFED00', '004DFF', '750787'), emoji: '🏳️‍🌈' },
  { id: 'lesbian', pt: 'Lésbica', en: 'Lesbian', stripes: s('D52D00', 'EF7627', 'FF9A56', 'FFFFFF', 'D162A4', 'B55690', 'A30262'), emoji: '🧡' },
  { id: 'gay', pt: 'Gay', en: 'Gay', stripes: s('078D70', '26CEAA', '98E8C1', 'FFFFFF', '7BADE2', '5049CC', '3D1A78'), emoji: '💙' },
  { id: 'bisexual', pt: 'Bissexual', en: 'Bisexual', stripes: s('D60270', 'D60270', '9B4F96', '0038A8', '0038A8'), emoji: '💗' },
  { id: 'pansexual', pt: 'Pansexual', en: 'Pansexual', stripes: s('FF218C', 'FFD800', '21B1FF'), emoji: '💛' },
  { id: 'polysexual', pt: 'Polissexual', en: 'Polysexual', stripes: s('F61CB9', '07D569', '1C92F6'), emoji: '💚' },
  { id: 'omnisexual', pt: 'Omnissexual', en: 'Omnisexual', stripes: s('FE9ACE', 'FF53BF', '200044', '6760FE', '8EA6FF'), emoji: '💞' },
  { id: 'asexual', pt: 'Assexual', en: 'Asexual', stripes: s('000000', 'A3A3A3', 'FFFFFF', '800080'), emoji: '🖤' },
  { id: 'demisexual', pt: 'Demissexual', en: 'Demisexual', stripes: s('FFFFFF', '6E0070', 'D2D2D2'), emoji: '🤍' },
  { id: 'graysexual', pt: 'Grayssexual', en: 'Graysexual', stripes: s('740194', 'AEB1AA', 'FFFFFF', 'AEB1AA', '740194'), emoji: '🩶' },
  { id: 'aromantic', pt: 'Arromântico', en: 'Aromantic', stripes: s('3DA542', 'A7D379', 'FFFFFF', 'A9A9A9', '000000'), emoji: '💚' },
  { id: 'demiromantic', pt: 'Demirromântico', en: 'Demiromantic', stripes: s('FFFFFF', '3DA542', 'D2D2D2'), emoji: '🤍' },
  { id: 'grayromantic', pt: 'Grayromântico', en: 'Grayromantic', stripes: s('3DA542', 'A9A9A9', 'FFFFFF', 'A9A9A9', '3DA542'), emoji: '🩶' },
  { id: 'aroace', pt: 'Aroace', en: 'Aroace', stripes: s('E28C00', 'ECCD00', 'FFFFFF', '62AEDC', '203856'), emoji: '🧡' },
  { id: 'biromantic', pt: 'Birromântico', en: 'Biromantic', stripes: s('D60270', '9B4F96', '0038A8'), emoji: '💜' },
  { id: 'panromantic', pt: 'Panromântico', en: 'Panromantic', stripes: s('FF218C', 'FFD800', '21B1FF'), emoji: '💛' },
  { id: 'abrosexual', pt: 'Abrossexual', en: 'Abrosexual', stripes: s('75CA92', 'B2E4C5', 'FFFFFF', 'E695B5', 'DA446C'), emoji: '🌸' },
  { id: 'androsexual', pt: 'Androssexual', en: 'Androsexual', stripes: s('01CCFF', '603524', 'B799DE'), emoji: '💙' },
  { id: 'gynesexual', pt: 'Ginessexual', en: 'Gynesexual', stripes: s('F4A9B7', '903F2B', '80D25C'), emoji: '💗' },
  { id: 'queer', pt: 'Queer', en: 'Queer', stripes: s('000000', '9AD9EA', '00A3E8', 'B5E51D', 'FFFFFF', 'FFC90D', 'FC6667', 'FEAEC9'), emoji: '🌈' },
  { id: 'polyamory', pt: 'Poliamoroso', en: 'Polyamorous', stripes: s('0000FF', 'FF0000', '000000'), emoji: '❤️' },
  { id: 'hetero', pt: 'Hétero', en: 'Straight', stripes: s('000000', 'FFFFFF', '000000', 'FFFFFF'), emoji: '🤍' },
  { id: 'ally', pt: 'Aliade', en: 'Ally', stripes: s('000000', 'FFFFFF', 'E40303', 'FFED00', '004DFF'), emoji: '🤝' },
  { id: 'questioning-s', pt: 'Questionando a orientação', en: 'Questioning orientation', stripes: s('9B59B6'), emoji: '❔' },
];

const NEURO = [
  { id: 'neurodivergent', pt: 'Neurodivergente', en: 'Neurodivergent', stripes: s('E40303', 'FF8C00', 'FFED00', '008026', '004DFF', '750787'), emoji: '♾️' },
  { id: 'autistic', pt: 'Autista', en: 'Autistic', stripes: s('D4AF37'), emoji: '♾️' },
  { id: 'adhd', pt: 'TDAH', en: 'ADHD', stripes: s('F28C28'), emoji: '⚡' },
  { id: 'audhd', pt: 'AuDHD', en: 'AuDHD', stripes: s('D4AF37', 'F28C28'), emoji: '🌀' },
  { id: 'dyslexia', pt: 'Dislexia', en: 'Dyslexia', stripes: s('3B82F6'), emoji: '📖' },
  { id: 'dyscalculia', pt: 'Discalculia', en: 'Dyscalculia', stripes: s('22C55E'), emoji: '🔢' },
  { id: 'dyspraxia', pt: 'Dispraxia', en: 'Dyspraxia', stripes: s('A855F7'), emoji: '🧩' },
  { id: 'dysgraphia', pt: 'Disgrafia', en: 'Dysgraphia', stripes: s('06B6D4'), emoji: '✍️' },
  { id: 'tourette', pt: 'Tourette', en: 'Tourette', stripes: s('14B8A6'), emoji: '💬' },
  { id: 'ocd', pt: 'TOC', en: 'OCD', stripes: s('0EA5E9'), emoji: '🔁' },
  { id: 'gifted', pt: 'Altas habilidades', en: 'Gifted', stripes: s('EAB308'), emoji: '✨' },
  { id: 'sensory', pt: 'Processamento sensorial', en: 'Sensory processing', stripes: s('EC4899'), emoji: '🎧' },
  { id: 'synesthesia', pt: 'Sinestesia', en: 'Synesthesia', stripes: s('F472B6', '60A5FA', 'FDE047'), emoji: '🌈' },
];

// 24 tons do círculo cromático; o pacote de 48 traz cada um em versão clara e escura.
const HUES = [
  ['Vermelho', 'Red', 'E11D48'], ['Coral', 'Coral', 'FF6F61'], ['Laranja', 'Orange', 'F97316'], ['Âmbar', 'Amber', 'F59E0B'],
  ['Amarelo', 'Yellow', 'FACC15'], ['Lima', 'Lime', '84CC16'], ['Verde', 'Green', '22C55E'], ['Esmeralda', 'Emerald', '10B981'],
  ['Menta', 'Mint', '6EE7B7'], ['Turquesa', 'Turquoise', '14B8A6'], ['Ciano', 'Cyan', '06B6D4'], ['Celeste', 'Sky', '38BDF8'],
  ['Azul', 'Blue', '3B82F6'], ['Anil', 'Indigo', '6366F1'], ['Violeta', 'Violet', '8B5CF6'], ['Roxo', 'Purple', 'A855F7'],
  ['Lavanda', 'Lavender', 'C4B5FD'], ['Magenta', 'Magenta', 'D946EF'], ['Rosa', 'Pink', 'EC4899'], ['Rosa-chiclete', 'Bubblegum', 'F9A8D4'],
  ['Marrom', 'Brown', '92400E'], ['Bege', 'Beige', 'E7D3B0'], ['Cinza', 'Gray', '9CA3AF'], ['Branco', 'White', 'FFFFFF'],
];

function shade(hex, factor) {
  const n = parseInt(hex, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(factor > 0 ? c + (255 - c) * factor : c * (1 + factor)));
  return ch.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

const COLORS_24 = HUES.map(([pt, en, hex], i) => ({ id: `c24-${i + 1}`, pt, en, stripes: [hex], emoji: '🎨' }));
const COLORS_48 = HUES.flatMap(([pt, en, hex], i) => [
  { id: `c48-${i + 1}a`, pt: `${pt} claro`, en: `Light ${en.toLowerCase()}`, stripes: [shade(hex, 0.35)], emoji: '🎨' },
  { id: `c48-${i + 1}b`, pt: `${pt} escuro`, en: `Dark ${en.toLowerCase()}`, stripes: [shade(hex, -0.35)], emoji: '🎨' },
]);
const COLORS_75 = require('./colorRoles.json').colors.map((c) => ({ id: `c75-${c.n}`, pt: c.name, en: c.name, stripes: [c.hex.replace('#', '').toUpperCase()], emoji: '🎨' }));

const PACKS = {
  gender: { emoji: '⚧️', defaultMode: 'multi', items: GENDER },
  sexuality: { emoji: '🏳️‍🌈', defaultMode: 'multi', items: SEXUALITY },
  neuro: { emoji: '♾️', defaultMode: 'multi', items: NEURO },
  colors24: { emoji: '🎨', defaultMode: 'single', items: COLORS_24 },
  colors48: { emoji: '🎨', defaultMode: 'single', items: COLORS_48 },
  colors75: { emoji: '🎨', defaultMode: 'single', items: COLORS_75 },
};

module.exports = { PACKS };
