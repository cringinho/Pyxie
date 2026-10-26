/**
 * Catálogo da Casinha: móveis, decoração de parede, tapetes, pets, papéis de parede e pisos.
 *
 * Arte: Kenney (Roguelike Indoors, Roguelike RPG, Tiny Town, Tiny Dungeon), Clint Bellanger
 * (Tiny Creatures) e slimes do OpenGameArt, todos CC0 (assets/home/CREDITS.md).
 *
 * kind:      floor (móvel no piso) · wall (parede) · rug (tapete, fica por baixo) · pet ·
 *            wallpaper · flooring
 * source:    shop (loja do dia, moedinhas) · premium (feijões) · dungeon (drop) ·
 *            achievement (conquista) · starter (presente de boas-vindas) · craft (oficina) ·
 *            boss (chefe da semana) · festival (caixas da temporada, /py-festival)
 * footprint: células ocupadas; o sprite pode ser mais alto que o footprint (desenhado para cima).
 * tradable:  preparado para a fase de trocas. Itens premium, de conquista e iniciais nunca são trocáveis.
 */

const RARITIES = {
  common: { order: 0, charm: 2, color: '#cbd5e1', pt: 'Comum', en: 'Common' },
  uncommon: { order: 1, charm: 4, color: '#4ade80', pt: 'Incomum', en: 'Uncommon' },
  rare: { order: 2, charm: 8, color: '#60a5fa', pt: 'Raro', en: 'Rare' },
  epic: { order: 3, charm: 15, color: '#c084fc', pt: 'Épico', en: 'Epic' },
  legendary: { order: 4, charm: 30, color: '#fbbf24', pt: 'Lendário', en: 'Legendary' },
  mythic: { order: 5, charm: 60, color: '#f472b6', pt: 'Mítico', en: 'Mythic' },
};

const SETS = {
  jardim: { pt: 'Jardim Secreto', en: 'Secret Garden' },
  laranja: { pt: 'Abóbora Aconchegante', en: 'Cozy Pumpkin' },
  verde: { pt: 'Menta Fresca', en: 'Fresh Mint' },
  lilas: { pt: 'Sonho Lilás', en: 'Lilac Dream' },
  rosa: { pt: 'Algodão-Doce', en: 'Cotton Candy' },
  gotico: { pt: 'Gótico Fofo', en: 'Cute Gothic' },
  arcano: { pt: 'Gabinete Arcano', en: 'Arcane Study' },
  festa: { pt: 'Festa no Quarto', en: 'Bedroom Party' },
  real: { pt: 'Salão Real', en: 'Royal Hall' },
  cozinha: { pt: 'Cozinha da Vovó', en: "Grandma's Kitchen" },
  artesao: { pt: 'Feito à Mão', en: 'Handcrafted' },
  season_halloween: { pt: 'Noite das Abóboras', en: 'Pumpkin Night' },
  season_christmas: { pt: 'Natal Encantado', en: 'Enchanted Christmas' },
  season_newyear: { pt: 'Virada Estrelada', en: 'Starry New Year' },
  season_easter: { pt: 'Caça aos Ovos', en: 'Egg Hunt' },
  season_summer: { pt: 'Férias de Verão', en: 'Summer Break' },
};

// Recolorações do tecido laranja/verde da Kenney para as paletas da Pyxie
const FABRIC_ORANGE = [10, 40];
const FABRIC_GREEN = [100, 175];
const toLilac = (from) => ({ from, to: 275, satMul: 0.85 });
const toRose = (from) => ({ from, to: 330, satMul: 0.9, lightAdd: 0.06 });
const toNight = (from) => ({ from, to: 250, satMul: 0.7, lightAdd: -0.12 });

const I = (x, y, w = 1, h = 1, extra = {}) => ({ sheet: 'indoors', x, y, w, h, ...extra });
const R = (x, y, w = 1, h = 1, extra = {}) => ({ sheet: 'rpg', x, y, w, h, ...extra });
const C = (n) => ({ sheet: 'creatures', n });
const D = (n) => ({ sheet: 'dungeon', n });
const T = (n) => ({ sheet: 'town', n });

function item(id, pt, en, kind, rarity, sprite, opts = {}) {
  const footprint = opts.footprint || [sprite.w || 1, sprite.h || 1];
  const source = opts.source || 'shop';
  return {
    id,
    name: { pt, en },
    kind,
    rarity,
    sprite,
    footprint,
    source,
    price: opts.price || null,
    sets: opts.sets || [],
    light: opts.light || 0,
    maxSupply: opts.maxSupply || 0,
    flippable: opts.flippable !== false,
    tradable: opts.tradable ?? !['premium', 'achievement', 'starter'].includes(source),
    petSpot: Boolean(opts.petSpot),
  };
}

const coins = (n) => ({ coins: n });
const beans = (n) => ({ beans: n });

const FURNITURE = [
  // Cadeiras e assentos
  item('chair_cushion', 'Cadeira com Almofada', 'Cushioned Chair', 'floor', 'common', I(0, 2), { price: coins(60), sets: ['laranja'] }),
  item('chair_wood', 'Cadeira de Madeira', 'Wooden Chair', 'floor', 'common', I(0, 4), { price: coins(45) }),
  item('chair_carved', 'Cadeira Entalhada', 'Carved Chair', 'floor', 'uncommon', I(0, 6), { price: coins(140), sets: ['real'] }),
  item('chair_white', 'Cadeira de Porcelana', 'Porcelain Chair', 'floor', 'uncommon', I(0, 8), { price: coins(160) }),
  item('chair_lilac', 'Cadeira Lilás', 'Lilac Chair', 'floor', 'rare', I(0, 2, 1, 1, { recolor: toLilac(FABRIC_ORANGE) }), { price: coins(320), sets: ['lilas'] }),
  item('stool', 'Banquinho', 'Little Stool', 'floor', 'common', I(16, 3), { price: coins(40) }),
  item('pouf', 'Pufe Redondo', 'Round Pouf', 'floor', 'common', I(17, 3), { price: coins(55) , petSpot: true }),
  // Mesas
  item('table_small', 'Mesinha', 'Small Table', 'floor', 'common', I(4, 2), { price: coins(80) }),
  item('table_round', 'Mesa Redonda', 'Round Table', 'floor', 'common', I(7, 0), { price: coins(90) }),
  item('table_dining', 'Mesa de Jantar', 'Dining Table', 'floor', 'uncommon', I(0, 0, 3, 1), { price: coins(380), sets: ['cozinha'] }),
  item('table_oval', 'Mesa Oval', 'Oval Table', 'floor', 'uncommon', I(3, 0, 2, 1), { price: coins(300) }),
  item('table_cloth_orange', 'Mesa com Toalha de Abóbora', 'Pumpkin Tablecloth Table', 'floor', 'rare', I(16, 8, 3, 1), { price: coins(620), sets: ['laranja', 'festa'] }),
  item('table_cloth_green', 'Mesa com Toalha de Menta', 'Mint Tablecloth Table', 'floor', 'rare', I(16, 10, 3, 1), { price: coins(620), sets: ['verde', 'festa'] }),
  item('table_cloth_lilac', 'Mesa com Toalha Lilás', 'Lilac Tablecloth Table', 'floor', 'epic', I(16, 8, 3, 1, { recolor: toLilac(FABRIC_ORANGE) }), { price: beans(3), source: 'premium', sets: ['lilas', 'festa'] }),
  item('table_oval_cloth', 'Mesa Oval de Chá', 'Oval Tea Table', 'floor', 'rare', I(19, 8, 2, 1), { price: coins(540), sets: ['laranja'] }),
  item('table_snack', 'Mesinha com Lanche', 'Snack Table', 'floor', 'uncommon', R(11, 4), { price: coins(150), sets: ['cozinha', 'festa'] }),
  item('table_cheese', 'Tábua de Queijos', 'Cheese Board', 'floor', 'uncommon', R(13, 4), { price: coins(170), sets: ['cozinha', 'festa'] }),
  item('table_potion', 'Bancada de Poções', 'Potion Bench', 'floor', 'rare', R(12, 4), { price: coins(450), sets: ['arcano'] }),
  // Camas
  item('bed_green', 'Cama de Menta', 'Mint Bed', 'floor', 'uncommon', I(14, 8, 2, 1), { price: coins(420), sets: ['verde'] }),
  item('bed_orange', 'Cama de Abóbora', 'Pumpkin Bed', 'floor', 'uncommon', I(14, 6, 2, 1), { price: coins(420), sets: ['laranja'] }),
  item('bed_lilac', 'Cama dos Sonhos Lilás', 'Lilac Dream Bed', 'floor', 'epic', I(14, 6, 2, 1, { recolor: toLilac(FABRIC_ORANGE) }), { price: beans(4), source: 'premium', sets: ['lilas'] }),
  item('bed_rose', 'Cama de Algodão-Doce', 'Cotton Candy Bed', 'floor', 'epic', I(14, 8, 2, 1, { recolor: toRose(FABRIC_GREEN) }), { price: beans(4), source: 'premium', sets: ['rosa'] }),
  item('bed_night', 'Cama da Meia-Noite', 'Midnight Bed', 'floor', 'legendary', I(14, 6, 2, 1, { recolor: toNight(FABRIC_ORANGE) }), { source: 'dungeon', sets: ['gotico'] }),
  item('pet_bed_orange', 'Caminha de Pet', 'Pet Bed', 'floor', 'common', I(14, 9), { price: coins(90), sets: ['laranja'] , petSpot: true }),
  item('pet_bed_green', 'Caminha de Pet de Menta', 'Mint Pet Bed', 'floor', 'common', I(14, 11), { price: coins(90), sets: ['verde'] , petSpot: true }),
  item('tent_green', 'Cabaninha de Lençol', 'Blanket Fort', 'floor', 'rare', R(46, 10, 2, 2), { price: coins(700), sets: ['festa', 'verde'] }),
  item('tent_cream', 'Cabaninha de Creme', 'Cream Blanket Fort', 'floor', 'rare', R(48, 10, 2, 2), { price: coins(700), sets: ['festa'] }),
  // Armários, estantes e utilidades
  item('bookshelf', 'Estante de Livros', 'Bookshelf', 'floor', 'uncommon', R(43, 12), { price: coins(200), sets: ['arcano'] }),
  item('bookshelf_tall', 'Estante Alta', 'Tall Bookshelf', 'floor', 'rare', R(43, 12, 1, 2), { price: coins(480), sets: ['arcano'], footprint: [1, 1] }),
  item('wardrobe', 'Guarda-Roupa', 'Wardrobe', 'floor', 'uncommon', R(28, 3, 1, 2), { price: coins(260), footprint: [1, 1] }),
  item('vanity', 'Penteadeira', 'Vanity', 'floor', 'rare', R(29, 3, 1, 2), { price: coins(520), sets: ['rosa'], footprint: [1, 1] }),
  item('drawer', 'Cômoda', 'Dresser', 'floor', 'common', R(23, 5), { price: coins(120) }),
  item('stove', 'Fogão a Lenha', 'Wood Stove', 'floor', 'uncommon', I(14, 14), { price: coins(240), sets: ['cozinha'] }),
  item('barrel', 'Barril', 'Barrel', 'floor', 'common', R(24, 0), { price: coins(50), sets: ['cozinha'] }),
  item('sacks', 'Sacos de Farinha', 'Flour Sacks', 'floor', 'common', R(25, 2), { price: coins(50), sets: ['cozinha'] }),
  item('bucket', 'Balde d’Água', 'Water Bucket', 'floor', 'common', I(21, 4), { price: coins(35) }),
  item('anvil', 'Bigorna', 'Anvil', 'floor', 'uncommon', R(15, 0), { price: coins(220) }),
  item('chest', 'Baú de Tesouro', 'Treasure Chest', 'floor', 'uncommon', D(89), { price: coins(260) }),
  item('mimic', 'Mímico Domesticado', 'Tamed Mimic', 'floor', 'legendary', D(92), { source: 'dungeon', sets: ['gotico'] }),
  item('piano', 'Piano de Cauda', 'Grand Piano', 'floor', 'epic', I(23, 8, 2, 2), { price: coins(1800), sets: ['real'] }),
  item('fireplace', 'Lareira Acesa', 'Lit Fireplace', 'floor', 'rare', R(13, 0), { price: coins(650), light: 3, sets: ['real'] }),
  item('campfire', 'Fogueirinha', 'Tiny Campfire', 'floor', 'rare', R(15, 8), { price: coins(500), light: 3, sets: ['festa'] }),
  // Luz
  item('candle', 'Vela', 'Candle', 'floor', 'common', I(16, 6), { price: coins(30), light: 1, sets: ['gotico'] }),
  item('candelabra', 'Candelabro de Mesa', 'Table Candelabra', 'floor', 'uncommon', I(16, 7), { price: coins(180), light: 2, sets: ['gotico', 'real'] }),
  item('floor_lamp', 'Candelabro de Pé', 'Standing Candelabra', 'floor', 'rare', I(19, 3, 1, 3), { price: coins(560), light: 3, sets: ['real'], footprint: [1, 1] }),
  // Vasos, plantas e jardim
  item('plant_pot', 'Vasinho de Planta', 'Potted Plant', 'floor', 'common', I(16, 0), { price: coins(40), sets: ['jardim'] }),
  item('plant_pot_2', 'Samambaia', 'Fern', 'floor', 'common', I(17, 0), { price: coins(40), sets: ['jardim'] }),
  item('bush', 'Arbusto Redondo', 'Round Bush', 'floor', 'common', R(19, 9), { price: coins(60), sets: ['jardim'] }),
  item('berry_bush', 'Arbusto de Frutinhas', 'Berry Bush', 'floor', 'uncommon', R(23, 9), { price: coins(150), sets: ['jardim'] }),
  item('cactus', 'Cacto Fofo', 'Cute Cactus', 'floor', 'common', R(22, 9), { price: coins(55), sets: ['jardim'] }),
  item('flowers_blue', 'Flores Azuis', 'Blue Flowers', 'floor', 'common', R(28, 9), { price: coins(45), sets: ['jardim'] }),
  item('flowers_red', 'Flores Vermelhas', 'Red Flowers', 'floor', 'common', R(29, 9), { price: coins(45), sets: ['jardim'] }),
  item('lily', 'Lírio', 'Lily', 'floor', 'uncommon', R(25, 11), { price: coins(130), sets: ['jardim'] }),
  item('mushrooms', 'Cogumelos', 'Mushrooms', 'floor', 'common', T(29), { price: coins(50), sets: ['jardim', 'gotico'] }),
  item('tree_small', 'Arvorezinha', 'Little Tree', 'floor', 'uncommon', R(13, 10, 1, 2), { price: coins(260), sets: ['jardim'], footprint: [1, 1] }),
  item('tree_autumn', 'Arvorezinha de Outono', 'Autumn Tree', 'floor', 'rare', R(14, 10, 1, 2), { price: coins(480), sets: ['jardim', 'laranja'], footprint: [1, 1] }),
  item('tree_pine', 'Pinheirinho', 'Little Pine', 'floor', 'uncommon', R(16, 10, 1, 2), { price: coins(260), sets: ['jardim'], footprint: [1, 1] }),
  item('dead_tree', 'Árvore Assombrada', 'Haunted Tree', 'floor', 'epic', R(27, 9, 1, 3), { price: coins(1200), sets: ['gotico'], footprint: [1, 1] }),
  item('vase_bronze', 'Vaso de Bronze', 'Bronze Vase', 'floor', 'uncommon', I(16, 4), { price: coins(160), sets: ['real'] }),
  item('vase_silver', 'Vaso de Prata', 'Silver Vase', 'floor', 'rare', I(17, 4), { price: coins(420), sets: ['real'] }),
  item('vase_gold', 'Vaso de Ouro', 'Golden Vase', 'floor', 'epic', I(18, 4), { price: coins(1100), sets: ['real'] }),
  item('beehive', 'Colmeia', 'Beehive', 'floor', 'uncommon', T(94), { price: coins(180), sets: ['jardim'] }),
  // Arcano, gótico e tesouros
  item('skull', 'Caveirinha Decorativa', 'Decorative Skull', 'floor', 'uncommon', R(49, 9), { price: coins(130), sets: ['gotico'] }),
  item('gravestone', 'Lápide de Estimação', 'Pet Gravestone', 'floor', 'rare', R(52, 9), { price: coins(400), sets: ['gotico'] }),
  item('crystal_orb', 'Orbe Arcano', 'Arcane Orb', 'floor', 'epic', R(50, 9), { price: coins(1500), light: 2, sets: ['arcano'] }),
  item('gargoyle', 'Gárgula Guardiã', 'Guardian Gargoyle', 'floor', 'legendary', R(50, 10, 1, 2), { source: 'dungeon', sets: ['gotico'], footprint: [1, 1] }),
  item('gold_pile', 'Pilha de Ouro', 'Gold Pile', 'floor', 'legendary', R(41, 11), { source: 'dungeon', light: 1, sets: ['real'] }),
  // Chefe semanal do servidor (src/modules/guildBoss): troféu de quem mais bateu, estandarte de quem participou
  item('boss_trophy', 'Troféu do Chefe da Semana', 'Weekly Boss Trophy', 'floor', 'legendary', R(50, 10, 1, 2, { recolor: { from: [0, 360], to: 45, minSat: 0, satMul: 1.5, lightAdd: 0.12 } }), { source: 'boss', light: 1, sets: ['real'], footprint: [1, 1] }),
  item('boss_banner', 'Estandarte da Vitória', 'Victory Banner', 'wall', 'epic', R(49, 0, 1, 2, { recolor: { from: [0, 360], to: 275, minSat: 0, satMul: 1.3 } }), { source: 'boss', sets: ['real', 'gotico'] }),
  item('gems', 'Cristais Brilhantes', 'Shiny Crystals', 'floor', 'rare', R(32, 9), { price: coins(520), light: 1, sets: ['arcano'] }),
  item('potion_red', 'Poção do Amor', 'Love Potion', 'floor', 'uncommon', D(115), { price: coins(110), sets: ['arcano'] }),
  item('potion_blue', 'Poção de Mana', 'Mana Potion', 'floor', 'uncommon', D(116), { price: coins(110), sets: ['arcano'] }),
  item('potion_cabinet', 'Armário de Poções', 'Potion Cabinet', 'floor', 'rare', I(20, 17), { price: coins(560), sets: ['arcano'] }),
  item('training_dummy', 'Alvo de Treino', 'Training Target', 'floor', 'common', T(95), { price: coins(70) }),
  // Exclusivos de conquista (nunca à venda)
  item('throne_nyx', 'Trono da Nyx', "Nyx's Throne", 'floor', 'mythic', I(0, 6, 1, 1, { recolor: { from: [0, 360], to: 350, minSat: 0, satMul: 1.6, lightAdd: -0.1 } }), { source: 'achievement', light: 2, sets: ['gotico', 'real'], maxSupply: 0 }),
  item('golden_piano', 'Piano Dourado', 'Golden Piano', 'floor', 'mythic', I(23, 8, 2, 2, { recolor: { from: [0, 360], to: 45, minSat: 0, satMul: 1.4, lightAdd: 0.08 } }), { source: 'achievement', sets: ['real'] }),
];

const WALL = [
  item('window', 'Janela', 'Window', 'wall', 'common', R(40, 0), { price: coins(70) }),
  item('window_white', 'Janela Branca', 'White Window', 'wall', 'common', R(41, 0), { price: coins(70) }),
  item('window_round', 'Janela Redonda', 'Round Window', 'wall', 'uncommon', R(45, 0), { price: coins(150) }),
  item('window_stained', 'Escotilha Azul', 'Blue Porthole', 'wall', 'rare', R(46, 1), { price: coins(460), sets: ['gotico', 'arcano'] }),
  item('window_tall', 'Janelão em Arco', 'Tall Arched Window', 'wall', 'rare', R(44, 2, 1, 2), { price: coins(520), sets: ['real'] }),
  item('curtain_orange', 'Cortina de Abóbora', 'Pumpkin Curtain', 'wall', 'uncommon', R(54, 0, 1, 2), { price: coins(180), sets: ['laranja'] }),
  item('curtain_green', 'Cortina de Menta', 'Mint Curtain', 'wall', 'uncommon', R(55, 0, 1, 2), { price: coins(180), sets: ['verde'] }),
  item('curtain_teal', 'Cortina Oceano', 'Ocean Curtain', 'wall', 'uncommon', R(56, 0, 1, 2), { price: coins(180) }),
  item('curtain_lilac', 'Cortina Lilás', 'Lilac Curtain', 'wall', 'epic', R(54, 0, 1, 2, { recolor: toLilac(FABRIC_ORANGE) }), { price: beans(2), source: 'premium', sets: ['lilas'] }),
  item('bunting_orange', 'Guirlanda de Abóbora', 'Pumpkin Garland', 'wall', 'uncommon', R(51, 2, 3, 1), { price: coins(200), sets: ['festa', 'laranja'] }),
  item('bunting_teal', 'Guirlanda Oceano', 'Ocean Garland', 'wall', 'uncommon', R(51, 5, 3, 1), { price: coins(200), sets: ['festa'] }),
  item('bunting_green', 'Guirlanda de Menta', 'Mint Garland', 'wall', 'uncommon', R(51, 8, 3, 1), { price: coins(200), sets: ['festa', 'verde'] }),
  item('banner_orange', 'Estandarte de Abóbora', 'Pumpkin Banner', 'wall', 'rare', R(49, 0, 1, 2), { price: coins(380), sets: ['real', 'laranja'] }),
  item('banner_teal', 'Estandarte Oceano', 'Ocean Banner', 'wall', 'rare', R(49, 3, 1, 2), { price: coins(380), sets: ['real'] }),
  item('painting_small_green', 'Quadrinhos Verdes', 'Little Green Paintings', 'wall', 'common', I(16, 12), { price: coins(60), sets: ['verde'] }),
  item('painting_small_orange', 'Quadrinhos Laranja', 'Little Orange Paintings', 'wall', 'common', I(17, 12), { price: coins(60), sets: ['laranja'] }),
  item('painting_landscape', 'Quadro de Paisagem', 'Landscape Painting', 'wall', 'uncommon', R(29, 10), { price: coins(180), sets: ['jardim'] }),
  item('painting_pumpkin', 'Quadro da Abóbora', 'Pumpkin Painting', 'wall', 'uncommon', R(30, 10), { price: coins(180), sets: ['laranja'] }),
  item('painting_sea', 'Quadro do Mar', 'Sea Painting', 'wall', 'uncommon', R(31, 10), { price: coins(180) }),
  item('painting_framed_green', 'Paisagem em Moldura Dourada', 'Gilded Landscape', 'wall', 'rare', I(19, 12), { price: coins(420), sets: ['real'] }),
  item('map', 'Mapa do Tesouro', 'Treasure Map', 'wall', 'rare', I(20, 12, 2, 1), { price: coins(460), sets: ['arcano'] }),
  item('tapestry_green', 'Tapeçaria de Menta', 'Mint Tapestry', 'wall', 'rare', I(19, 15, 1, 2), { price: coins(400), sets: ['verde', 'real'] }),
  item('tapestry_orange', 'Tapeçaria de Abóbora', 'Pumpkin Tapestry', 'wall', 'rare', I(20, 15, 1, 2), { price: coins(400), sets: ['laranja', 'real'] }),
  item('tapestry_teal', 'Tapeçaria Oceano', 'Ocean Tapestry', 'wall', 'rare', I(21, 15, 1, 2), { price: coins(400), sets: ['real'] }),
  item('mirror_gilded', 'Espelho Dourado', 'Gilded Mirror', 'wall', 'epic', I(22, 16, 1, 2), { price: coins(1300), sets: ['real', 'rosa'] }),
  item('mirror', 'Espelhinho', 'Little Mirror', 'wall', 'common', R(23, 7), { price: coins(80), sets: ['rosa'] }),
  item('mirror_round', 'Espelho Redondo', 'Round Mirror', 'wall', 'uncommon', R(24, 8), { price: coins(160), sets: ['rosa'] }),
  item('mirror_tall', 'Espelho de Corpo Inteiro', 'Full-Length Mirror', 'wall', 'rare', R(25, 7, 1, 2), { price: coins(450), sets: ['rosa', 'real'] }),
  item('cuckoo_clock', 'Relógio Cuco', 'Cuckoo Clock', 'wall', 'rare', R(26, 8), { price: coins(500) }),
  item('shield_round', 'Escudo Redondo', 'Round Shield', 'wall', 'uncommon', I(22, 8), { price: coins(170), sets: ['real'] }),
  item('shield_crest', 'Brasão', 'Crest', 'wall', 'rare', I(22, 10), { price: coins(400), sets: ['real'] }),
  item('sconce', 'Arandela', 'Wall Sconce', 'wall', 'common', I(21, 0), { price: coins(70), light: 2, sets: ['gotico'] }),
  item('torch', 'Tocha de Parede', 'Wall Torch', 'wall', 'uncommon', I(20, 6), { price: coins(140), light: 2, sets: ['gotico'] }),
  item('hanging_pots', 'Panelas Penduradas', 'Hanging Pots', 'wall', 'common', R(31, 3), { price: coins(90), sets: ['cozinha'] }),
  item('clothesline', 'Varal de Roupinhas', 'Little Clothesline', 'wall', 'uncommon', I(16, 1, 3, 2), { price: coins(220) }),
  item('shelf_plates', 'Prateleira de Pratos', 'Plate Shelf', 'wall', 'common', R(31, 2), { price: coins(90), sets: ['cozinha'] }),
  item('stained_glass_nyx', 'Vitral Estelar', 'Starlit Porthole', 'wall', 'mythic', R(46, 1, 1, 1, { recolor: { from: [0, 360], to: 285, minSat: 0.2, satMul: 1.2 } }), { source: 'achievement', light: 2, sets: ['gotico', 'arcano'] }),
];

const RUGS = [
  item('runner_teal', 'Passadeira Oceano', 'Ocean Runner', 'rug', 'common', I(16, 14, 3, 1), { price: coins(90) }),
  item('runner_orange', 'Passadeira de Abóbora', 'Pumpkin Runner', 'rug', 'common', I(16, 15, 3, 1), { price: coins(90), sets: ['laranja'] }),
  item('runner_green', 'Passadeira de Menta', 'Mint Runner', 'rug', 'common', I(16, 16, 3, 1), { price: coins(90), sets: ['verde'] }),
  item('runner_cream', 'Passadeira Creme', 'Cream Runner', 'rug', 'common', I(16, 17, 3, 1), { price: coins(90) }),
  item('rug_square_brown', 'Tapete Quadrado', 'Square Rug', 'rug', 'uncommon', R(41, 25, 3, 3), { price: coins(260) }),
  item('rug_square_white', 'Tapete Nuvem', 'Cloud Rug', 'rug', 'uncommon', R(44, 25, 3, 3), { price: coins(260) }),
  item('rug_square_green', 'Tapete Gramado', 'Lawn Rug', 'rug', 'uncommon', R(41, 28, 3, 3), { price: coins(260), sets: ['verde', 'jardim'] }),
  item('rug_square_orange', 'Tapete de Abóbora', 'Pumpkin Rug', 'rug', 'uncommon', R(44, 28, 3, 3), { price: coins(260), sets: ['laranja'] }),
  item('rug_square_teal', 'Tapete Oceano', 'Ocean Rug', 'rug', 'uncommon', R(47, 28, 3, 3), { price: coins(260) }),
  item('rug_square_lilac', 'Tapete Lilás', 'Lilac Rug', 'rug', 'epic', R(44, 28, 3, 3, { recolor: toLilac(FABRIC_ORANGE) }), { price: beans(2), source: 'premium', sets: ['lilas'] }),
  item('rug_square_rose', 'Tapete Algodão-Doce', 'Cotton Candy Rug', 'rug', 'epic', R(41, 28, 3, 3, { recolor: toRose([60, 120]) }), { price: beans(2), source: 'premium', sets: ['rosa'] }),
];

// Pets: Tiny Creatures (Clint Bellanger) e slimes do OpenGameArt, todos CC0
const pet = (id, pt, en, rarity, sprite, opts = {}) => item(id, pt, en, 'pet', rarity, sprite, { flippable: true, ...opts });
const SLIME = (row) => ({ sheet: 'slimes', x: 0, y: row });
const CAT = (palette) => ({ pixels: { art: 'cat', palette } });

const PETS = [
  pet('pet_chick', 'Galinha', 'Hen', 'common', C(151), { price: coins(120), sets: ['jardim'] }),
  pet('pet_bunny', 'Coelhinho', 'Bunny', 'common', C(178), { price: coins(140), sets: ['jardim'] }),
  pet('pet_squirrel', 'Esquilo', 'Squirrel', 'common', C(176), { price: coins(130), sets: ['jardim'] }),
  pet('pet_raccoon', 'Guaxinim', 'Raccoon', 'uncommon', C(179), { price: coins(260) }),
  pet('pet_fox', 'Raposinha', 'Little Fox', 'uncommon', C(170), { price: coins(280), sets: ['laranja'] }),
  pet('pet_owl', 'Corujinha', 'Little Owl', 'uncommon', C(118), { price: coins(260), sets: ['arcano'] }),
  pet('pet_turtle', 'Tartaruga', 'Turtle', 'common', C(150), { price: coins(120), sets: ['verde'] }),
  pet('pet_frog', 'Lagartixa', 'Little Lizard', 'common', C(147), { price: coins(110), sets: ['verde', 'jardim'] }),
  pet('pet_bee', 'Abelhinha', 'Bumblebee', 'common', C(141), { price: coins(100), sets: ['jardim'] }),
  pet('pet_sheep', 'Ovelhinha', 'Little Sheep', 'common', C(154), { price: coins(130) }),
  pet('pet_goat', 'Cabritinho', 'Little Goat', 'common', C(153), { price: coins(130) }),
  pet('pet_cow', 'Vaquinha', 'Little Cow', 'uncommon', C(152), { price: coins(220) }),
  pet('pet_penguin', 'Texugo', 'Badger', 'uncommon', C(180), { price: coins(300) }),
  pet('pet_polar_bear', 'Ursinho Polar', 'Polar Cub', 'rare', C(165), { price: coins(620) }),
  pet('pet_tiger', 'Tigrinho', 'Tiger Cub', 'rare', C(158), { price: coins(680), sets: ['laranja'] }),
  pet('pet_lion', 'Leãozinho', 'Lion Cub', 'rare', C(157), { price: coins(680), sets: ['real'] }),
  pet('pet_elephant', 'Elefantinho', 'Baby Elephant', 'rare', C(159), { price: coins(700) }),
  pet('pet_giraffe', 'Girafinha', 'Baby Giraffe', 'rare', C(160), { price: coins(700), sets: ['jardim'] }),
  pet('pet_bat', 'Morceguinho', 'Little Bat', 'uncommon', C(139), { price: coins(240), sets: ['gotico'] }),
  pet('pet_crow', 'Corvo', 'Crow', 'uncommon', C(137), { price: coins(240), sets: ['gotico'] }),
  pet('pet_mushroom', 'Cogumelinho Andante', 'Walking Mushroom', 'rare', C(14), { price: coins(560), sets: ['jardim', 'gotico'] }),
  pet('pet_flytrap', 'Planta Carnívora', 'Flytrap', 'rare', C(9), { price: coins(560), sets: ['jardim', 'gotico'] }),
  pet('pet_fire_wisp', 'Chaminha', 'Fire Wisp', 'epic', C(56), { price: coins(1400), light: 2, sets: ['arcano'] }),
  pet('pet_water_drop', 'Gotinha', 'Water Drop', 'epic', C(57), { price: coins(1400), sets: ['arcano'] }),
  pet('pet_ice_drop', 'Floquinho', 'Ice Sprite', 'epic', C(60), { price: coins(1400), sets: ['arcano'] }),
  pet('pet_fairy', 'Fadinha', 'Little Fairy', 'epic', C(13), { price: beans(5), source: 'premium', light: 1, sets: ['lilas', 'arcano'] }),
  pet('pet_unicorn', 'Unicórnio', 'Unicorn', 'legendary', C(52), { source: 'dungeon', sets: ['rosa'] }),
  pet('pet_griffin', 'Grifinho', 'Baby Griffin', 'legendary', C(105), { source: 'dungeon', sets: ['real'] }),
  pet('pet_dragon_red', 'Dragãozinho Rubi', 'Ruby Dragonling', 'legendary', C(34), { source: 'dungeon', light: 1, sets: ['laranja'] }),
  pet('pet_dragon_blue', 'Dragãozinho Safira', 'Sapphire Dragonling', 'legendary', C(32), { source: 'dungeon' }),
  pet('pet_dragon_green', 'Dragãozinho Esmeralda', 'Emerald Dragonling', 'legendary', C(35), { source: 'dungeon', sets: ['verde'] }),
  pet('pet_dragon_white', 'Dragãozinho de Luar', 'Moonlight Dragonling', 'mythic', C(31), { source: 'achievement', light: 2 }),
  pet('pet_pegasus', 'Pégaso', 'Pegasus', 'mythic', C(53), { source: 'achievement', sets: ['real'] }),
  pet('pet_eye', 'Olhinho Curioso', 'Curious Eye', 'epic', C(6), { source: 'dungeon', sets: ['gotico'] }),
  pet('slime_green', 'Slime de Menta', 'Mint Slime', 'common', SLIME(1), { price: coins(100), sets: ['verde'] }),
  pet('slime_cyan', 'Slime Oceano', 'Ocean Slime', 'common', SLIME(2), { price: coins(100) }),
  pet('slime_purple', 'Slime de Uva', 'Grape Slime', 'uncommon', SLIME(3), { price: coins(200), sets: ['lilas'] }),
  pet('slime_pink', 'Slime de Chiclete', 'Bubblegum Slime', 'uncommon', SLIME(4), { price: coins(200), sets: ['rosa'] }),
  pet('slime_red', 'Slime de Morango', 'Strawberry Slime', 'common', SLIME(5), { price: coins(100) }),
  pet('slime_orange', 'Slime de Abóbora', 'Pumpkin Slime', 'common', SLIME(6), { price: coins(100), sets: ['laranja'] }),
  pet('slime_gray', 'Slime de Nuvem', 'Cloud Slime', 'common', SLIME(7), { price: coins(100) }),
  // Gatinhos desenhados à mão (pixel art própria da Pyxie)
  pet('pet_astaroth', 'Astaroth Pequenino', 'Tiny Astaroth', 'rare', CAT({ o: '#0b0710', b: '#2a2035', s: '#1a1324', e: '#4ade80', n: '#f9a8d4', w: '#b794f6' }), { source: 'starter', sets: ['gotico'] }),
  pet('pet_cat_orange', 'Gatinho Laranja', 'Orange Kitten', 'uncommon', CAT({ o: '#3b1d0a', b: '#f59e0b', s: '#d97706', e: '#14532d', n: '#fda4af', w: '#fcd34d' }), { price: coins(240), sets: ['laranja'] }),
  pet('pet_cat_white', 'Gatinha Nuvem', 'Cloud Kitten', 'uncommon', CAT({ o: '#3b3446', b: '#f8fafc', s: '#cbd5e1', e: '#3b82f6', n: '#f9a8d4', w: '#ffffff' }), { price: coins(240) }),
  pet('pet_cat_lilac', 'Gatinha Lilás', 'Lilac Kitten', 'epic', CAT({ o: '#2e1065', b: '#c4b5fd', s: '#a78bfa', e: '#fdf4ff', n: '#f0abfc', w: '#ede9fe' }), { price: beans(3), source: 'premium', sets: ['lilas'] }),
  pet('pet_cat_galaxy', 'Gato Galáxia', 'Galaxy Cat', 'mythic', CAT({ o: '#020617', b: '#312e81', s: '#1e1b4b', e: '#fde68a', n: '#f472b6', w: '#a5b4fc' }), { source: 'achievement', light: 1, sets: ['arcano'] }),
];

// Papéis de parede e pisos: padrões em pixel art com as paletas da Pyxie
const pattern = (kind, colors) => ({ pattern: { kind, colors } });

const WALLPAPERS = [
  item('wp_cream', 'Parede Creme', 'Cream Wall', 'wallpaper', 'common', pattern('plain', ['#efe2c8', '#e2d2b4']), { source: 'starter' }),
  item('wp_lilac_stripes', 'Listras Lilás', 'Lilac Stripes', 'wallpaper', 'common', pattern('stripes', ['#c9b3e6', '#b79cdb']), { price: coins(120), sets: ['lilas'] }),
  item('wp_mint_dots', 'Bolinhas de Menta', 'Mint Dots', 'wallpaper', 'common', pattern('dots', ['#bfe8d4', '#9fd8bd']), { price: coins(120), sets: ['verde'] }),
  item('wp_rose_hearts', 'Coraçõezinhos', 'Little Hearts', 'wallpaper', 'uncommon', pattern('hearts', ['#f7c6d9', '#ee93b5']), { price: coins(240), sets: ['rosa'] }),
  item('wp_pumpkin_checks', 'Xadrez de Abóbora', 'Pumpkin Plaid', 'wallpaper', 'uncommon', pattern('checks', ['#f3c58f', '#eaa865']), { price: coins(240), sets: ['laranja'] }),
  item('wp_brick', 'Tijolinhos', 'Little Bricks', 'wallpaper', 'common', pattern('bricks', ['#c98b6b', '#a86a4e']), { price: coins(120), sets: ['cozinha'] }),
  item('wp_royal', 'Damasco Real', 'Royal Damask', 'wallpaper', 'rare', pattern('diamonds', ['#7a1f3d', '#a8325a']), { price: coins(520), sets: ['real'] }),
  item('wp_night_stars', 'Céu Estrelado', 'Starry Night', 'wallpaper', 'rare', pattern('stars', ['#1e1b4b', '#fde68a', '#a5b4fc']), { price: coins(560), sets: ['arcano'] }),
  item('wp_gothic_moons', 'Luas Góticas', 'Gothic Moons', 'wallpaper', 'epic', pattern('moons', ['#1a1023', '#c084fc', '#f0abfc']), { price: beans(2), source: 'premium', sets: ['gotico'] }),
  item('wp_aurora', 'Aurora da Pyxie', "Pyxie's Aurora", 'wallpaper', 'mythic', pattern('stars', ['#3b0764', '#f0abfc', '#67e8f9']), { source: 'achievement', sets: ['lilas', 'arcano'] }),
];

const FLOORINGS = [
  item('fl_oak', 'Piso de Carvalho', 'Oak Floor', 'flooring', 'common', pattern('planks', ['#c08552', '#9a6538', '#d29a66']), { source: 'starter' }),
  item('fl_cherry', 'Piso de Cerejeira', 'Cherry Floor', 'flooring', 'common', pattern('planks', ['#a14e3a', '#7d3829', '#b8644d']), { price: coins(140) }),
  item('fl_ebony', 'Piso de Ébano', 'Ebony Floor', 'flooring', 'uncommon', pattern('planks', ['#3b2a2a', '#241818', '#4d3838']), { price: coins(260), sets: ['gotico'] }),
  item('fl_lilac_wood', 'Piso Lilás', 'Lilac Floor', 'flooring', 'rare', pattern('planks', ['#a58bc9', '#8a6fb3', '#bba4dc']), { price: coins(480), sets: ['lilas'] }),
  item('fl_checker', 'Xadrez Clássico', 'Classic Checker', 'flooring', 'uncommon', pattern('tiles', ['#f1f5f9', '#334155', '#94a3b8']), { price: coins(260), sets: ['cozinha'] }),
  item('fl_pink_tiles', 'Ladrilhos de Morango', 'Strawberry Tiles', 'flooring', 'uncommon', pattern('tiles', ['#fde2ec', '#f9a8c9', '#f472b6']), { price: coins(260), sets: ['rosa'] }),
  item('fl_mint_tiles', 'Ladrilhos de Menta', 'Mint Tiles', 'flooring', 'uncommon', pattern('tiles', ['#e3f6ec', '#a7e3c3', '#6cc79a']), { price: coins(260), sets: ['verde'] }),
  item('fl_carpet_wine', 'Carpete Vinho', 'Wine Carpet', 'flooring', 'rare', pattern('carpet', ['#7f1d3b', '#9f2a4f']), { price: coins(500), sets: ['real'] }),
  item('fl_stone', 'Pedra de Castelo', 'Castle Stone', 'flooring', 'rare', pattern('stone', ['#8b8ea0', '#6b6e80', '#a3a6b8']), { price: coins(500), sets: ['gotico', 'real'] }),
  item('fl_cloud', 'Carpete de Nuvem', 'Cloud Carpet', 'flooring', 'epic', pattern('carpet', ['#ede9fe', '#ddd6fe']), { price: beans(2), source: 'premium', sets: ['lilas'] }),
];

// Artesanato (/py-craft): só saem da oficina, feitos com os materiais do trabalho.
// A arte reaproveita peças do catálogo com cores novas.
const craftBase = (id, recolor) => {
  const base = [...FURNITURE, ...WALL, ...RUGS].find((entry) => entry.id === id);
  return { sprite: { ...base.sprite, recolor }, footprint: base.footprint };
};
const crafted = (id, pt, en, kind, rarity, baseId, recolor, opts = {}) => {
  const { sprite, footprint } = craftBase(baseId, recolor);
  return item(id, pt, en, kind, rarity, sprite, { ...opts, source: 'craft', footprint, sets: ['artesao', ...(opts.sets || [])] });
};
const hue = (to, extra = {}) => ({ from: [0, 360], to, minSat: 0, satMul: 1.2, ...extra });

const CRAFTED = [
  crafted('craft_lantern', 'Lanterna Artesanal', 'Handmade Lantern', 'floor', 'rare', 'floor_lamp', hue(35, { lightAdd: 0.05 }), { light: 2, sets: ['laranja'] }),
  crafted('craft_bookcase', 'Estante do Arqueólogo', "Archaeologist's Bookcase", 'floor', 'rare', 'bookshelf_tall', hue(25, { satMul: 0.9 }), { sets: ['arcano'] }),
  crafted('craft_quilt', 'Tapete de Retalhos', 'Patchwork Rug', 'rug', 'rare', 'rug_square_orange', hue(330, { satMul: 1.1 }), { sets: ['rosa'] }),
  crafted('craft_flowerbed', 'Canteiro de Flores', 'Flower Bed', 'floor', 'uncommon', 'flowers_blue', hue(300), { sets: ['jardim'] }),
  crafted('craft_shell_mirror', 'Espelho de Conchas', 'Shell Mirror', 'wall', 'rare', 'mirror_round', hue(185)),
  crafted('craft_crystal_lamp', 'Abajur de Cristal', 'Crystal Lamp', 'floor', 'epic', 'crystal_orb', hue(190, { lightAdd: 0.08 }), { light: 2, sets: ['arcano'] }),
  crafted('craft_tapestry', 'Tapeçaria Bordada', 'Embroidered Tapestry', 'wall', 'rare', 'tapestry_teal', hue(280), { sets: ['lilas'] }),
  crafted('craft_shell_jar', 'Pote de Conchas', 'Jar of Shells', 'floor', 'uncommon', 'vase_silver', hue(170, { satMul: 1.4 })),
  crafted('craft_alchemy_table', 'Mesa de Alquimia', 'Alchemy Table', 'floor', 'epic', 'table_potion', hue(270, { satMul: 1.5 }), { sets: ['arcano', 'gotico'] }),
  crafted('craft_star_globe', 'Globo Estelar', 'Star Globe', 'floor', 'epic', 'crystal_orb', hue(48, { satMul: 1.5, lightAdd: 0.1 }), { light: 3, sets: ['real'] }),
  crafted('craft_polished_anvil', 'Bigorna Polida', 'Polished Anvil', 'floor', 'uncommon', 'anvil', hue(210, { lightAdd: 0.1 }), { sets: ['real'] }),
  crafted('craft_fishing_net', 'Rede de Pesca', 'Fishing Net', 'wall', 'uncommon', 'clothesline', hue(195), { sets: ['verde'] }),
];

// Itens sazonais e extras: folhas CC0 listadas em assets/home/seasonal-candidates.json.
// Os de temporada (source 'festival') só saem das caixas do Festival (/py-festival) enquanto a
// temporada está aberta; os gerais entram na rotação da loja do dia.
const CANDIDATES = require('../../../assets/home/seasonal-candidates.json');
const EXTRA_PRICE = { common: 70, uncommon: 200, rare: 520, epic: 1500, legendary: 3200 };
const SHEET_KEYS = {
  'kenney-roguelike-indoors.png': 'indoors',
  'kenney-roguelike-rpg.png': 'rpg',
  'kenney-tiny-town.png': 'town',
  'kenney-tiny-dungeon.png': 'dungeon',
  'tiny-creatures.png': 'creatures',
  'blob-slimes.png': 'slimes',
};
const sheetKeyOf = (file) => SHEET_KEYS[file] || file.replace(/\.png$/, '');

const EXTRAS = CANDIDATES.items.map((c) => {
  const general = c.season === 'general';
  const { sheet, n, x, y, w, h } = c.sprite;
  const sprite = n !== undefined && SHEET_KEYS[sheet] ? { sheet: sheetKeyOf(sheet), n } : { sheet: sheetKeyOf(sheet), x, y, w, h };
  // Parede tem 2 linhas: peças mais altas ocupam 2 e o desenho sobe
  const footprint = c.kind === 'wall' ? [c.footprint[0], Math.min(2, c.footprint[1])] : c.footprint;
  const entry = item(c.id, c.name.pt, c.name.en, c.kind, c.rarity, sprite, {
    footprint,
    source: general ? 'shop' : 'festival',
    price: general ? coins(EXTRA_PRICE[c.rarity] || 70) : null,
    sets: general ? [] : [`season_${c.season}`],
    light: c.light || 0,
  });
  if (!general) entry.season = c.season;
  return entry;
});

const ITEMS = [...FURNITURE, ...WALL, ...RUGS, ...PETS, ...WALLPAPERS, ...FLOORINGS, ...CRAFTED, ...EXTRAS];
const ITEM_BY_ID = new Map(ITEMS.map((entry) => [entry.id, entry]));

const STARTER_ITEMS = ['pet_astaroth', 'wp_cream', 'fl_oak', 'chair_wood', 'table_small', 'plant_pot', 'pet_bed_orange', 'window', 'candle', 'runner_cream'];
const DEFAULT_WALLPAPER = 'wp_cream';
const DEFAULT_FLOORING = 'fl_oak';

/** Item fixo do catálogo (sem os gerados por mês). */
function getBaseItem(id) {
  return ITEM_BY_ID.get(id) || null;
}

/**
 * Item por id. O pet mítico de cada mês do Passe (`pass_pet_AAAA_MM`) é gerado na hora a partir
 * de um pet do catálogo (src/services/battlePass.js) e fica guardado no mapa.
 */
function getItem(id) {
  const found = ITEM_BY_ID.get(id);
  if (found) return found;
  const match = /^pass_pet_(\d{4})_(\d{2})$/.exec(String(id || ''));
  if (!match) return null;
  const entry = require('../../services/battlePass').buildMonthlyPet(`${match[1]}-${match[2]}`);
  if (entry) ITEM_BY_ID.set(entry.id, entry);
  return entry;
}

function itemName(entry, lang = 'pt') {
  return entry?.name?.[lang === 'en' ? 'en' : 'pt'] || entry?.id || '?';
}

function rarityInfo(rarity) {
  return RARITIES[rarity] || RARITIES.common;
}

module.exports = {
  RARITIES,
  SETS,
  ITEMS,
  STARTER_ITEMS,
  DEFAULT_WALLPAPER,
  DEFAULT_FLOORING,
  getItem,
  getBaseItem,
  itemName,
  rarityInfo,
};
