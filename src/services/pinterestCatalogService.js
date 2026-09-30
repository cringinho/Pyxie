const fs = require('node:fs');
const path = require('node:path');
const { LOCATIONS } = require('./gloomRealm');
const { TAROT_CATALOG } = require('../data/tarotCardsCatalog');
const shopeeManager = require('./shopeeManager');

const BASE_URL = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';

// Mapeamento 100% individualizado para cada um dos 58 produtos da Shopee
const CUSTOM_SHOPEE_COPY = {
  // 0. Pelúcia Kuromi 25cm
  "23798670825": {
    title: "Boneca Pelúcia Kuromi 25cm Sanrio Original Macia Kawaii",
    desc: "🖤 A queridinha dos fãs de Sanrio! Pelúcia oficial da Kuromi super fofinha de 25cm com toque aveludado e detalhes perfeitos. Ideal para presentear, decorar o quarto ou colecionar. Garanta a sua com cupom e frete grátis na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "kuromi, pelucia kuromi, sanrio brasil, kawaii aesthetic, quarto aesthetic, presentes fofos, comprinhas shopee"
  },
  // 1. Camiseta Hello Kitty & Kuromi Algodão
  "58265449372": {
    title: "Camiseta Hello Kitty & Kuromi Aesthetic Goth Y2K Algodão",
    desc: "🎀🖤 O combo perfeito entre a fofura e o estilo dark! Camiseta feminina 100% algodão premium com estampa de alta durabilidade da Hello Kitty e Kuromi. Look indispensável para quem ama moda alternativa, e-girl e Y2K. Compre na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta hello kitty, kuromi tshirt, moda egirl, y2k aesthetic, roupas alternativas, look goth, achadinhos shopee"
  },
  // 2. Rash Guard Hello Kitty & Kuromi
  "54816935616": {
    title: "Rash Guard Hello Kitty & Kuromi Feminina Esportiva",
    desc: "⚡ Treine com estilo e atitude! Camiseta de compressão Rash Guard temática Hello Kitty & Kuromi com proteção UV, tecido térmico respirável e caimento perfeito no corpo. Ideal para academia, jiu-jitsu e esportes. Confira na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "rash guard feminina, kuromi esportiva, moda fitness, jiu jitsu feminino, roupas de academia, hello kitty gym"
  },
  // 3. Anéis Vintage Goth Espinhos
  "28812198611": {
    title: "Par de Anéis Vintage Goth com Espinhos Spikes Regulável",
    desc: "⛓️ Estilo punk rock autêntico para os seus dedos! Conjunto de anéis vintage com textura de espinhos góticos, ajustáveis e feitos em liga metálica resistente. Perfeito para casais alternativos ou compor seu look e-girl/grunge. Aproveite na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "aneis goticos, anel de espinho, acessorios punk, moda grunge, joias alternativas, anel de casal, aesthetic goth"
  },
  // 4. Anel Camafeu Roxo
  "58212898323": {
    title: "Anel Gótico Camafeu Vitoriano com Pedra Roxa Dark Aesthetic",
    desc: "💜 Toque de nobreza sombria e elegância vitoriana! Anel gótico ornamentado com pedra oval roxa profunda e moldura barroca detalhada. Uma joia clássica que transforma qualquer visual alternativo ou dark fairy. Peça já o seu na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "anel camafeu, joia gotica, anel roxo, estilo vitoriano, dark academia, dark fairy, acessorios aesthetic"
  },
  // 5. Chaveiro Kunai Naruto
  "53709861240": {
    title: "Chaveiro Metálico Kunai Naruto Shippuden Cosplay Anime",
    desc: "🍃 Para os verdadeiros shinobis da Aldeia da Folha! Chaveiro em miniatura da Kunai do Naruto feito em metal de alta qualidade com acabamento impecável. Perfeito para mochilas, chaves e colecionadores otakus. Garanta o seu na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "chaveiro naruto, kunai naruto, cosplay anime, presentes geek, chaveiro metal, anime shippuden, shopee geek"
  },
  // 6. Kit Chaveiros Hollow Knight
  "23099667422": {
    title: "Kit Chaveiros Hollow Knight & Hornet Colecionável Gamer",
    desc: "⚔️ O clássico dos games indie nas suas mãos! Kit exclusivo com chaveiros do Cavaleiro e da Hornet com acabamento nítido e super detalhado. Presente imperdível para todo fã de Hollow Knight e Silksong. Compre com desconto na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "hollow knight, silksong, chaveiro gamer, jogos indie, chaveiro hornet, produtos geek, achadinhos shopee"
  },
  // 7. Kit Chaveiros Signos do Zodíaco
  "58217140837": {
    title: "Kit Chaveiros dos Signos do Zodíaco MDF Geek Personalizado",
    desc: "✨ Qual é o seu signo? Kit de chaveiros colecionáveis em MDF recortado a laser com ilustrações exclusivas dos signos astrológicos. Leve, resistente e super charmoso para bolsas e chaves. Escolha o seu na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "chaveiro signo, signos do zodiaco, astrologia, chaveiro mdf, lembrancinhas, presentes geek, shopee brasil"
  },
  // 8. Chaveiro Haikyuu
  "23098082556": {
    title: "Chaveiro Acrílico Dupla Face Haikyuu Vôlei Anime",
    desc: "🏐 Leve seus jogadores favoritos para todo lugar! Chaveiro acrílico de alta transparência com impressão dupla face dos personagens de Haikyuu. Cores vibrantes e película protetora anti-risco. Confira os modelos na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "haikyuu, chaveiro anime, hinata kageyama, volei anime, acessorios otaku, compras shopee, papelaria geek"
  },
  // 9. Maneki Neko Sanrio
  "48711799504": {
    title: "Figure Sanrio Maneki Neko Gato da Fortuna Colecionável",
    desc: "🍀 Sorte, fofura e prosperidade! Action figure oficial TOPTOY dos personagens Sanrio estilizados como o tradicional Maneki Neko japonês. Acabamento primoroso e pintura brilhante para sua estante. Garanta o seu na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "maneki neko sanrio, toptoy brasil, figure colecionavel, gato da sorte, kuromi figure, presentes kawaii"
  },
  // 10. Kuromi no Ofurô Blind Box
  "51061796738": {
    title: "Blind Box Caixa Surpresa Kuromi no Ofurô Sanrio TOPTOY",
    desc: "🛁 A surpresa mais relaxante e fofa! Caixa misteriosa original da Kuromi curtindo um banho de ofurô perfumado com diversos modelos colecionáveis super detalhados. Viva a emoção do unboxing direto da Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "blind box sanrio, kuromi surpresa, caixa misteriosa, unboxing kawaii, toptoy sanrio, colecao kuromi"
  },
  // 11. Chubby Sanrio Japão
  "50717960447": {
    title: "Mini Pelúcia Chubby Sanrio Japão Edição Limitada Rara",
    desc: "🌸 Importada e super exclusiva! Mini bola de pelúcia estilo Chubby dos personagens clássicos da Sanrio direto do Japão. Toque aveludado e formato esférico irresistível para apertar e colecionar. Peça já na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "pelucia sanrio japao, chubby sanrio, pelucia de apertar, importados kawaii, my melody, cinamoroll"
  },
  // 12. Bonecos Hello Kitty com Expositor
  "58200714991": {
    title: "Coleção Mini Figures Hello Kitty & Friends com Expositor 7cm",
    desc: "🎀 Todo o universo Sanrio reunido! Conjunto de mini bonecos colecionáveis de 7cm com Hello Kitty, Kuromi, My Melody e amigos, acompanhando caixinha expositora transparente. Perfeito para mesa e decoração. Compre na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "figures hello kitty, bonecos sanrio, caixa expositora, miniaturas fofas, decoracao quarto, shopee achados"
  },
  // 13. Vinil Sanrio Ilha da Raposa
  "46568118283": {
    title: "Action Figure Vinil Sanrio Ilha da Raposa Edição Ampla",
    desc: "🦊 A magia dos contos de fadas no seu quarto! Estatueta de vinil de luxo da série Ilha da Raposa da Sanrio com pintura fosca e acabamento impecável de alta linha. Uma verdadeira obra de arte para colecionadores na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "sanrio ilha da raposa, figure vinil, estatueta colecionavel, toptoy brasil, decoracao aesthetic, presentes premium"
  },
  // 14. Bonecos Pop Hello Kitty
  "23594291024": {
    title: "Bonecos Colecionáveis Pop Hello Kitty & Sanrio Figures",
    desc: "💖 Estilo Funko Pop super detalhado! Bonecos estilizados dos personagens mais icônicos da Sanrio em vinil maciço com base de apoio firme. O presente que encanta qualquer fã de cultura kawaii na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "bonecos pop hello kitty, figures sanrio, presentes fofos, colecionaveis kawaii, decoracao estante"
  },
  // 15. Balanço Sanrio Cinnamoroll & Melody
  "41233335407": {
    title: "Miniatura Balanço Sanrio Cinnamoroll My Melody & Pompompurin",
    desc: "🎠 Cenário interativo em miniatura com os personagens da Sanrio em um lindo balanço de parque! Peça decorativa charmosa para mesas de estudo, setup gamer e prateleiras. Compre com cupom na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "balanco sanrio, cinnamoroll decoracao, my melody miniatura, setup kawaii, enfeites fofos"
  },
  // 16. Almofada com Manta Hello Kitty
  "22897558194": {
    title: "Almofada 2 em 1 com Manta de Casal Hello Kitty Oficial",
    desc: "🛏️ O conforto térmico que você merece! Almofada fofinha que se abre e vira uma manta quentinha e macia com estampa oficial da Hello Kitty. Perfeita para viagens, maratonar séries no sofá e noites frias. Confira na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "almofada manta hello kitty, cobertor sanrio, cama fofa, decoracao quarto, presentes aconchegantes"
  },
  // 17. Bombas de Banho Sanrio
  "58216019732": {
    title: "Kit Bath Bombs Bombas de Banho Efervescentes Sanrio",
    desc: "🛁✨ Transforme seu banho em um spa perfumado e relaxante! Bombas de banho efervescentes aromáticas com cores pasteis e surpresas temáticas dos personagens Sanrio. Um mimo especial para autocuidado na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "bath bombs sanrio, bombas de banho, spa em casa, banho relaxante, presentes criativos, autocuidado kawaii"
  },
  // 18. Camiseta Preta Kuromi Hello Kitty
  "23298733870": {
    title: "Camiseta Preta 100% Algodão Kuromi & Hello Kitty Gothic Look",
    desc: "🖤 Estampa marcante em tecido preto puro de alta gramatura! Camiseta unissex confortável com os personagens Sanrio em traço gótico alternativo. Combina com qualquer visual e-girl, grunge ou street. Garanta na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta preta kuromi, hello kitty dark, moda streetwear, roupas alternativas, tshirt algodao"
  },
  // 19. Camiseta Moderna Sanrio Feminina
  "23798884243": {
    title: "Camiseta Feminina Girl Power Sanrio Algodão Premium",
    desc: "🌸 Modelagem moderna com caimento perfeito que valoriza o corpo! Camiseta casual feminina em algodão respirável com estampa delicada e cores suaves. Ideal para looks do dia a dia e passeios. Peça na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta feminina sanrio, moda casual kawaii, tshirt algodao, look dia a dia, roupas fofas"
  },
  // 20. Camiseta Casual Sanrio Voando
  "21198287538": {
    title: "Camiseta Casual Sanrio Friends Voando nas Nuvens",
    desc: "☁️ Leveza e nostalgia! Camiseta com estampa artística dos personagens voando entre nuvens e estrelas. Tecido leve que não esquenta, perfeito para o clima brasileiro. Aproveite o frete grátis na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta sanrio friends, estampa fofa nuvens, moda pastel, tshirt confortavel, achadinhos shopee"
  },
  // 21. Camiseta T-Shirt Cinnamoroll
  "23194383379": {
    title: "T-Shirt Feminina Cinnamoroll Estilo Baby Blue Kawaii",
    desc: "💙 O cachorrinho orelhudo mais amado do mundo na sua camiseta favorita! T-shirt em tom azul pastel suave com estampa em alta definição do Cinnamoroll. Conforto e charme instantâneos na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta cinnamoroll, moda baby blue, roupas kawaii brasil, tshirt feminina fofa, estilo pastel"
  },
  // 22. MINISO Sanrio Volta às Aulas
  "46703273896": {
    title: "Kit Volta às Aulas MINISO Sanrio Hello Kitty Papelaria",
    desc: "📚 Comece as aulas com o material mais fofo da turma! Linha oficial MINISO com estojos, canetas e acessórios temáticos da Hello Kitty com a qualidade reconhecida mundialmente. Confira na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "miniso volta as aulas, material escolar hello kitty, papelaria miniso, estojo sanrio, canetas fofas"
  },
  // 23. MINISO Sanrio Fantasy Paradise Kuromi
  "47953273594": {
    title: "Coleção MINISO Fantasy Paradise Kuromi Sonhadora",
    desc: "🔮 Coleção temática dos sonhos! Itens de decoração e acessórios da série Fantasy Paradise com a Kuromi em versão celestial com asas e brilhos violetas. Uma edição mágica na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "miniso kuromi, fantasy paradise, colecao sonhadora, decoracao quarto roxo, itens colecionaveis"
  },
  // 24. MINISO Pelúcia Ilha da Raposa
  "47511231282": {
    title: "Pelúcia Luxo MINISO Sanrio Série Ilha da Raposa 30cm",
    desc: "🦊 Toque de nuvem e acabamento impecável! Pelúcia original MINISO com roupinha tradicional oriental e orelhinhas macias. O presente perfeito para quem ama Sanrio e estética japonesa. Compre na Shopee!",
    board: "Achadinhos Shopee • Sanrio & Hello Kitty",
    keywords: "pelucia miniso raposa, sanrio original miniso, presentes especiais, pelucia grande macia, shopee brasil"
  },
  // 25. Camiseta Kpop BTS Integrantes
  "45106253657": {
    title: "Camiseta K-Pop Bangtan Boys BTS Integrantes Algodão 100%",
    desc: "💜 Mostre seu amor de Army com muito estilo! Camiseta casual com estampa dos integrantes do BTS (Jungkook, Jimin, V, Suga, Jin, RM, J-Hope) em malha 100% algodão macia e respirável. Conforto total para shows e rolês na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta bts, bts army, jungkook jimin, moda kpop, camiseta algodao bts, look show bts, achadinhos kpop"
  },
  // 26. Camiseta BTS Army Fio 30.1
  "55665304578": {
    title: "Camiseta BTS Army Fio 30.1 Penteado Estampa Minimalista",
    desc: "✨ Qualidade de alfaiataria streetwear! Camiseta oficial Army em algodão nobre fio 30.1 penteado que não encolhe e não desbota. Design clean e moderno para usar em qualquer ocasião. Compre direto na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "bts tshirt, fio 30.1 penteado, camiseta army minimalista, moda coreana, kpop streetwear, presentes army"
  },
  // 27. Chaveiro Koya
  "22298720166": {
    title: "Chaveiro Koya BT21 Coala Kawaii Idol Coreano Colecionável",
    desc: "🐨 O coala mais calmo e sábio do universo K-Pop! Chaveiro emborrachado 3D do Koya com argola reforçada e pingente complementar. Deixe sua mochila ou chaves com a energia fofa do líder Namjoon. Confira na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "chaveiro koya, bt21 chaveiro, namjoon bts, papelaria kpop, chaveiro emborrachado, presentes bts"
  },
  // 28. Chaveiro Cosmic21 Modelo A
  "58200546904": {
    title: "Chaveiro BT21 Cosmic Modelo A K-Pop Idol Astronauta",
    desc: "🚀 Uma viagem interestelar com os personagens do BT21! Chaveiro comemorativo Cosmic Edition Modelo A com traje espacial metalizado e cores holográficas. Item de colecionador que se destaca em qualquer bolsa na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "bt21 cosmic, chaveiro espaco, kpop colecionavel, bts astronauta, chaveiro holografico, compras shopee"
  },
  // 29. Chaveiro Cosmic21 Modelo B
  "23499167818": {
    title: "Chaveiro BT21 Cosmic Modelo B K-Pop Espacial Galáxia",
    desc: "🌌 Design futurista e brilhante! Chaveiro temático Cosmic Modelo B com detalhes em resina cristalina e acabamento resistente. Colecione a dupla espacial e leve o estilo K-Pop com você para onde for. Garanta na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "bt21 galaxia, chaveiro bts cosmic, acessorios kpop, chaveiro resina, presentes colecionaveis, shopee kpop"
  },
  // 30. Chaveiro K-Pop Premium
  "22699018325": {
    title: "Chaveiro Premium BTS Metal & Resina Idol Colecionável",
    desc: "💎 Luxo e durabilidade em cada detalhe! Chaveiro oficial versão premium com mosquetão reforçado, pingentes de alta precisão e acabamento em banho metálico brilhante. O acessório definitivo para Armys exigentes na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "chaveiro premium bts, acessorios luxo kpop, mosquetao chaveiro, presente army, bts oficial, shopee achados"
  },
  // 31. Mini Cartela Adesivos Mini21
  "58253955903": {
    title: "Mini Cartela Adesivos BT21 Mini21 Bullet Journal Papelaria",
    desc: "📝 Decore seus cadernos, planners e celular com pura fofura! Cartela com mini adesivos recortados dos integrantes do BT21 em papel fotográfico à prova de respingos. Cores vivas para seu bujo e scrapbook na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "adesivos bt21, bullet journal kpop, papelaria fofa, stickers bts, scrapbook, papelaria kawaii"
  },
  // 32. Adesivos Baby Cooky
  "23199440691": {
    title: "Adesivos Baby Cooky Glitter K-Pop Coelhinho Rosa Fofo",
    desc: "🐰✨ Muito brilho e energia com o coelhinho mais forte do K-Pop! Cartela de adesivos Baby Cooky com laminação holográfica brilhante. Perfeito para capinhas de celular, notebooks e agendas. Peça já o seu na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "baby cooky, adesivo jungkook, stickers glitter, papelaria rosa, coelho fofo, bts stickers"
  },
  // 33. Bloco de Notas Mang
  "58259201521": {
    title: "Bloco de Notas Mang Baby21 Papelaria Kawaii BTS J-Hope",
    desc: "🐴💖 Anote suas ideias, metas e recados com a alegria do Mang! Bloco de notas destacável com 50 folhas de alta gramatura que não vazam a tinta da caneta. Ideal para estudos e organização diária na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "bloco de notas mang, papelaria jhope, memo pad kawaii, bloquinho bts, papelaria de estudos"
  },
  // 34. Bloco de Anotações Koya
  "58209207715": {
    title: "Bloco de Anotações Koya Baby21 Aesthetic Pastel BTS",
    desc: "🌿 Organização tranquila e charmosa! Bloco de notas temático do Koya em tons pastéis suaves para planejar sua rotina com calma e foco. Papel encorpado com impressão nítida de alta qualidade na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "bloco de notas koya, papelaria pastel, memo pad bts, organizacao estudos, papelaria fofa shopee"
  },
  // 35. Botton Pin Baby Chimmy
  "58259299201": {
    title: "Botton Pin Metal Baby Chimmy Jimin K-Pop Esmaltado",
    desc: "💛 O cachorrinho de moletom amarelo mais querido do mundo! Botton pin metálico esmaltado com fecho seguro tipo borboleta. Perfeito para jaquetas jeans, mochilas, estojos e boinas. Adquira na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "botton chimmy, pin esmaltado, jimin bts, broche kpop, acessorios jaqueta, pin metalico"
  },
  // 36. Mini Chaveiro Kpop Mini
  "19899844283": {
    title: "Mini Chaveiro K-Pop Idol Colecionável Emborrachado",
    desc: "🌟 Pequeno, leve e super resistente! Mini chaveiro emborrachado com design compacto perfeito para pendurar no zíper de estojos, fones de ouvido e chaves de casa. Colecione todos os modelos na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "mini chaveiro kpop, chaveiro emborrachado fofo, acessorios chave, lembrancinha kpop, shopee compras"
  },
  // 37. Caderno Capivara Kawaii
  "18498293667": {
    title: "Caderno Capivara Kawaii 12x18 Pautado Capa Dura Meme",
    desc: "☕ A paz interior em forma de caderno! Caderno de anotações tamanho compacto 12x18 com capa dura e ilustrações hilárias da Capivara Aesthetic. Folhas pautadas de alta qualidade para o seu dia a dia na Shopee!",
    board: "Achadinhos Shopee • Papelaria Fofa & K-Pop",
    keywords: "caderno capivara, meme capivara, capybara kawaii, caderno pautado, papelaria criativa, presentes engraçados"
  },
  // 38. Camiseta Capivara Poses
  "23498878646": {
    title: "Camiseta Capivara Poses Meme Engraçada 100% Algodão",
    desc: "🐾 Viva a vida no modo capivara: relaxado e sem estresse! Camiseta divertida com estampa de várias poses fofas de capivaras em tecido 100% algodão super confortável. O presente ideal para quem ama memes na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta capivara, t-shirt capybara, meme camiseta, moda divertida, roupas unissex, achados shopee"
  },
  // 39. Camiseta Drácula
  "58203304101": {
    title: "Camiseta Gótica Drácula Vampiro Darkwear Oversized",
    desc: "🦇 Estilo vampírico e imponente! Camiseta unissex estampa clássica Drácula em malha encorpada com caimento oversized perfeito. A peça central para looks dark goth, metal e grunge sombrio. Compre já na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta dracula, moda vampiro, darkwear oversized, gothic tshirt, camiseta preta gotica, roupas metal"
  },
  // 40. Cropped Gótico
  "23398560196": {
    title: "Cropped Feminino Gótico Dark Aesthetic com Renda e Cruz",
    desc: "🖤 Sensualidade, elegância e mistério! Cropped gótico com decote detalhado, cruz frontal e acabamento de renda sombria. Modela a cintura e combina perfeitamente com saias plissadas e calças wide leg. Confira na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "cropped gotico, top egirl, blusa com cruz, moda dark, roupas alternativas femininas, look balada goth"
  },
  // 41. Colar Pérolas e Espinhos
  "58260523339": {
    title: "Colar Gótico Pérolas Negras com Spikes Rebites Grunge Punk",
    desc: "⛓️ A fusão perfeita entre a delicadeza das pérolas e o impacto dos rebites punks! Colar choker moderno com fecho resistente e design marcante que valoriza qualquer decote ou camiseta básica. Adquira na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "colar perolas spikes, choker punk, colar gotico, gargantilha rebite, acessorios grunge, joias egirl"
  },
  // 42. Colar Coffin
  "15922582654": {
    title: "Colar Gargantilha Caixão Coffin E-Girl Goth Vampire",
    desc: "⚰️ Pingente de caixão com relevo sombrio em corrente de elos escuros. Acessório clássico da cultura gótica que expressa personalidade única e amor pela estética dark e horror. Peça o seu na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "colar caixao, pingente coffin, acessorios vampiro, joias goticas, colar egirl, moda alternativa"
  },
  // 43. Choker Couro Cravos
  "56467045490": {
    title: "Choker Gargantilha de Couro com Spikes Cravos Punk Rock",
    desc: "⚡ Atitude pura! Gargantilha de couro sintético ecológico com cravos pontiagudos de metal e fivela com ajuste para vários tamanhos de pescoço. O acessório indispensável para fãs de rock, metal e goth. Compre na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "choker couro, gargantilha spikes, coleira punk, acessorios rock, moda gotica feminina, choker cravos"
  },
  // 44. Gargantilha Borboleta e Cruz
  "50067825252": {
    title: "Gargantilha Gótica Borboleta e Cruz de Couro PU Halloween",
    desc: "🦋🖤 Simbolismo poético e estética alternativa! Choker de couro com pingente central de borboleta negra e cruz pendente. Ideal para compor fantasias de Halloween, cosplays ou looks diários cheios de atitude na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "gargantilha borboleta, colar cruz gotica, choker halloween, cosplay gothic, acessorios alternativos"
  },
  // 45. Luvas Sem Dedos + Choker
  "49667672454": {
    title: "Kit Luvas de Couro Sem Dedos com Choker Coração E-Girl",
    desc: "🖤 O combo visual dos sonhos para e-girls e cosplayers! Par de luvas sem dedos em couro PU com fivela ajustável e gargantilha com argola em formato de coração. Transforme seu look com esse kit na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "luvas sem dedos, luva couro egirl, kit choker coracao, cosplay dark, moda alternativa, acessorios anime"
  },
  // 46. Camiseta Ambitious Y2K
  "58212762970": {
    title: "Camiseta Oversized Streetwear Ambitious Y2K Goth Grunge",
    desc: "🛹 Caimento solto e estampa impactante no estilo streetwear internacional! Camiseta Ambitious em algodão premium com tipografia gótica moderna. Conforto e visual marcante para quem domina a cena alternativa na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta oversized, streetwear y2k, moda grunge, t-shirt ambitious, roupas largas aesthetic, estilo skatista"
  },
  // 47. Kit 7 Peças Punk Goth
  "41284431274": {
    title: "Kit 7 Peças Joias Punk Goth Pulseiras Cinto & Chokers",
    desc: "⛓️ O arsenal completo para montar qualquer look alternativo! Conjunto com 7 itens incluindo pulseiras de rebite, cinto com correntes, chokers e braceletes de couro. Economia e estilo reunidos em um só kit na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "kit acessorios punk, pulseiras spikes, cinto com corrente, joias goticas, combo alternativo, shopee moda"
  },
  // 48. Carteira Caveira
  "40683175184": {
    title: "Carteira Corrente Caveira Gótica Couro Punk Rocker Bifold",
    desc: "💀 Segurança e atitude para o seu bolso! Carteira bifold de couro resistente com estampa de caveira em relevo e corrente metálica pesada para prender na calça. Nunca mais perca seus pertences. Adquira na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "carteira com corrente, carteira caveira, moda motociclista, carteira punk rock, acessorios masculinos goticos"
  },
  // 49. Óculos Punk Spikes
  "47615453544": {
    title: "Óculos de Sol Punk Spikes Rebites Goth Rock Futurista",
    desc: "🕶️ Visual futurista e rebelde que chama a atenção onde você passar! Óculos de sol com proteção UV e armação cravejada de rebites spikes metálicos pontiagudos. O acessório dos palcos e festivais na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "oculos punk, oculos com spikes, oculos futurista, rave aesthetic, festival look, acessorios cyberpunk"
  },
  // 50. Camiseta Goth Darkness
  "23793943276": {
    title: "Camiseta Goth Darkness Estampa Sombria Streetwear",
    desc: "🖤 A escuridão traduzida em moda de rua! Camiseta preta com estampa gráfica de alta resolução 'Darkness' em tecido respirável e toque suave. Combine com coturnos e calças destroyed para um visual arrasador na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "camiseta darkness, dark aesthetic, roupas sombrias, streetwear gotico, camiseta unissex preta"
  },
  // 51. Baby Tee Hello Kitty Strass
  "58211239001": {
    title: "Baby Tee Hello Kitty Strass Brilho Goth Y2K Vintage",
    desc: "✨ O charme das baby tees dos anos 2000 está de volta! Camiseta cropped ajustada com a Hello Kitty em aplicação de strass brilhantes. Confortável, nostálgica e super tendência no TikTok. Garanta a sua na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "baby tee strass, hello kitty y2k, camiseta brilho, moda anos 2000, cropped vintage, aesthetic pinterest"
  },
  // 52. Blusa Grunge Cruz Y2K
  "58206275470": {
    title: "Blusa Grunge Goth Cruz Punk Manga Longa Y2K Alternativa",
    desc: "⛓️ Visual despojado e autêntico para dias frescos! Blusa de manga longa com estampa de cruzes góticas e corte solto no estilo grunge noventista. Tecido leve que combina perfeitamente com sobreposições na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "blusa manga longa gotica, blusa grunge, camiseta cruz punk, moda y2k, sobreposicao aesthetic"
  },
  // 53. Choker Whimsical Goth
  "20499318640": {
    title: "Choker Gargantilha Whimsical Goth Veludo com Pingente",
    desc: "🌙 Magia, fadas da noite e elegância misteriosa! Choker com fita de veludo macio e pingente delicado com estética whimsical goth. Confortável para usar horas a fio sem machucar o pescoço. Compre na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "choker veludo, whimsical goth, gargantilha fada escura, colar vintage gotico, joias delicadas dark"
  },
  // 54. Calça Mall Goth Cruz
  "55465826792": {
    title: "Calça Pantalona Mall Goth Estampa Cruz Darkwear E-Girl",
    desc: "🖤 Caimento amplo, cintura alta e muito estilo! Calça pantalona wide leg com estampa de cruzes e tecido fluido de caimento perfeito. Cria silhuetas incríveis para fotos e eventos alternativos. Veja na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "calca mall goth, pantalona gotica, wide leg egirl, calca estampa cruz, darkwear calcas, moda aesthetic"
  },
  // 55. Camiseta Melanie Martinez
  "58214366811": {
    title: "Camiseta Melanie Martinez Portais Fada Cogumelo Aesthetic",
    desc: "🍄🌸 O mundo mágico e surreal do álbum Portals! Camiseta comemorativa com arte oficial de fada e cogumelos da Melanie Martinez. Cores vibrantes em malha macia de toque suave. Um item indispensável para fãs na Shopee!",
    board: "Achadinhos Shopee • Moda Alternativa & E-Girl",
    keywords: "melanie martinez portals, camiseta fada, cogumelo aesthetic, camiseta fan art, moda indie pop, presentes criativos"
  },
  // 56. Unhas Postiças Cat Eye
  "43134720207": {
    title: "Unhas Postiças Magnéticas Cat Eye Cristal Negro Goth",
    desc: "💅 Unhas de salão profissional feitas em 5 minutos em casa! Kit de unhas postiças com efeito olho de gato (Cat Eye) magnético e cristais negros lapidados. Alta durabilidade e acabamento ultrabrilhante na Shopee!",
    board: "Achadinhos Shopee • Acessórios Goth & Punk",
    keywords: "unhas posticas cat eye, unhas goticas, nail art preto, unhas magneticas, manicure facil, beleza dark"
  },
  // 57. 100 Mini Tartarugas Brilham no Escuro
  "47016910618": {
    title: "Kit 100 Mini Tartarugas que Brilham no Escuro Resina Decor",
    desc: "🐢✨ Magia luminosa para o seu aquário, vasos de plantas ou estante! Pacote com 100 miniaturas de tartaruguinhas feitas em resina fotoluminescente que absorvem a luz e brilham no escuro. Fofura garantida na Shopee!",
    board: "Achadinhos Shopee • Tendências & Presentes",
    keywords: "brilha no escuro, miniaturas resina, decoracao aquario, tartarugas fofas, presentes criativos, achadinhos divertidos"
  }
};

/**
 * Escapa valores para CSV padrão RFC 4180.
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/[\r\n]+/g, ' ').trim();
  if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Normaliza preço para o formato estrito do Pinterest ('XX.XX BRL').
 */
function normalizePrice(rawPrice) {
  if (!rawPrice) return '0.00 BRL';
  const cleaned = String(rawPrice).replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return '0.00 BRL';
  return `${num.toFixed(2)} BRL`;
}

/**
 * Gera todos os itens do catálogo formatados para o feed do Pinterest.
 */
function getCatalogItems() {
  const items = [];

  // 1. Cenários em Pixel Art do Bosque da Penumbra
  for (const [id, loc] of Object.entries(LOCATIONS)) {
    const locNamePt = loc.name?.pt || id;
    const locDescPt = loc.desc?.pt || 'Cenário misterioso do Bosque da Penumbra na Pyxie.';
    const imgUrl = `${BASE_URL}/assets/locations/${loc.image}`;
    const targetLink = `${BASE_URL}/wiki`;

    items.push({
      id: `bosque_${id}`,
      title: `Pyxie • ${locNamePt} (Pixel Art & RPG)`,
      description: `${locDescPt} Explore o Bosque da Penumbra, negocie com espíritos de personalidades Atlus e desvende mistérios no bot Pyxie para Discord.`,
      link: targetLink,
      image_link: imgUrl,
      price: '0.00 BRL',
      availability: 'in stock',
      condition: 'new',
      brand: 'Pyxie',
      item_group_id: 'cenarios_bosque',
      google_product_category: 'Arts & Entertainment > Hobbies & Creative Arts > Collectibles',
    });
  }

  // 2. Baralho Canônico dos 78 Arcanos do Tarot da Pyxie
  for (const card of TAROT_CATALOG) {
    const suitName = card.suitNamePt || card.suit;
    const meaning = card.upright || (card.keywords && card.keywords.join(', ')) || 'Arcano Místico';
    const jpgFileName = card.fileName.replace(/\.webp$/i, '.jpg');
    const imgUrl = `${BASE_URL}/assets/tarot/cards/${jpgFileName}`;
    const targetLink = `${BASE_URL}/`;

    items.push({
      id: `tarot_card_${card.number}`,
      title: `Tarot da Pyxie • ${card.name} (${suitName})`,
      description: `Carta nº ${card.number} do Baralho Oficial dos 78 Arcanos da Pyxie. Significado divinatório: ${meaning}. Consulte sua tiragem diária no Discord.`,
      link: targetLink,
      image_link: imgUrl,
      price: '0.00 BRL',
      availability: 'in stock',
      condition: 'new',
      brand: 'Pyxie Tarot',
      item_group_id: 'tarot_deck',
      google_product_category: 'Arts & Entertainment > Hobbies & Creative Arts > Collectibles',
    });
  }

  // 3. Mascote & Artes Oficiais da Pyxie
  items.push(
    {
      id: 'pyxie_mascot_art',
      title: 'Pyxie • Mascote Oficial Fada Mágica para Discord',
      description: 'Pyxie é a fada mágica do Discord com RPG do Bosque da Penumbra, Tarot de 78 Arcanos, Economia viva com feijões mágicos e 10 carreiras interativas.',
      link: `${BASE_URL}/`,
      image_link: `${BASE_URL}/assets/pyxie/pyxie_mascot.png`,
      price: '0.00 BRL',
      availability: 'in stock',
      condition: 'new',
      brand: 'Pyxie',
      item_group_id: 'artes_oficiais',
      google_product_category: 'Software > Digital Goods',
    },
    {
      id: 'pyxie_space_banner',
      title: 'Pyxie • Arte Oficial Galáxia & Estrelas',
      description: 'Banner oficial temático da Pyxie para comunidades e servidores do Discord.',
      link: `${BASE_URL}/`,
      image_link: `${BASE_URL}/assets/pyxie/pyxie_space_banner.jpg`,
      price: '0.00 BRL',
      availability: 'in stock',
      condition: 'new',
      brand: 'Pyxie',
      item_group_id: 'artes_oficiais',
      google_product_category: 'Arts & Entertainment > Hobbies & Creative Arts > Collectibles',
    }
  );

  // 4. Produtos & Achadinhos Temáticos (Shopee & Sanrio)
  const shopeeProducts = shopeeManager.getAllItems();
  for (const prod of shopeeProducts) {
    if (prod.active === false && !prod.titulo) continue;
    const custom = CUSTOM_SHOPEE_COPY[prod.id] || {};
    const title = custom.title || prod.titulo || 'Achadinho Temático Shopee';
    const desc = custom.desc || `Produto selecionado para a comunidade: ${title}. Categoria: ${prod.tag || 'Sanrio / Moda'}. Disponível na Shopee.`;
    const targetLink = prod.link || prod.productLink || `${BASE_URL}/promo`;
    let imgUrl = prod.imagem || `${BASE_URL}/assets/locations/portao_penumbra.png`;
    if (imgUrl.includes('susercontent.com') && !imgUrl.match(/\.(jpg|jpeg|png)$/i)) {
      imgUrl = `${imgUrl}.jpg`;
    }
    const priceFormatted = normalizePrice(prod.preco);

    items.push({
      id: `shopee_${prod.id}`,
      title: `${title} (Achadinhos da Pyxie)`,
      description: desc,
      link: targetLink,
      image_link: imgUrl,
      price: priceFormatted,
      availability: 'in stock',
      condition: 'new',
      brand: 'Shopee / Pyxie',
      item_group_id: 'achadinhos_shopee',
      google_product_category: 'Apparel & Accessories',
    });
  }

  return items;
}

/**
 * Retorna os itens da Shopee formatados com links diretos de afiliados e boards temáticos.
 */
function getShopeeBulkItems() {
  const shopeeProducts = shopeeManager.getAllItems();
  const seenTitles = new Set();
  const items = [];

  for (const prod of shopeeProducts) {
    if (prod.active === false && !prod.titulo) continue;
    const custom = CUSTOM_SHOPEE_COPY[prod.id] || {};

    let title = custom.title || prod.titulo || 'Achadinho Temático Shopee';
    if (seenTitles.has(title)) {
      if (prod.tag) {
        title = `${title} (${prod.tag})`;
      } else {
        title = `${title} (Item #${prod.id || Math.floor(Math.random() * 1000)})`;
      }
    }
    seenTitles.add(title);

    let imgUrl = prod.imagem || `${BASE_URL}/assets/locations/portao_penumbra.png`;
    if (imgUrl.includes('susercontent.com') && !imgUrl.match(/\.(jpg|jpeg|png)$/i)) {
      imgUrl = `${imgUrl}.jpg`;
    }

    const board = custom.board || 'Achadinhos Shopee • Tendências & Presentes';
    const desc = custom.desc || `✨ ${title} ✨ Por apenas ${prod.preco || 'o melhor valor'}! Compre com cupom de desconto e frete grátis direto na Shopee Oficial.`;
    const keywords = custom.keywords || 'sanrio, kuromi, hello kitty, moda alternativa, e-girl, achadinhos shopee, presentes, aesthetic, comprinhas';
    const directLink = prod.link || prod.productLink || `${BASE_URL}/promo`;

    items.push({
      Title: title.slice(0, 100),
      'Media URL': imgUrl,
      'Pinterest board': board,
      Thumbnail: '',
      Description: desc.slice(0, 500),
      Link: directLink,
      'Publish date': '',
      Keywords: keywords,
    });
  }

  return items;
}

/**
 * Gera itens para a ferramenta "Criação de Pins em Massa" geral.
 */
function getBulkPinItems() {
  const items = [];

  // 1. Cenários do Bosque da Penumbra
  for (const [id, loc] of Object.entries(LOCATIONS)) {
    const locNamePt = loc.name?.pt || id;
    const locDescPt = loc.desc?.pt || 'Cenário misterioso do Bosque da Penumbra na Pyxie.';
    const imgUrl = `${BASE_URL}/assets/locations/${loc.image}`;

    items.push({
      Title: `Pyxie • ${locNamePt} (Pixel Art & RPG)`.slice(0, 100),
      'Media URL': imgUrl,
      'Pinterest board': 'Pyxie • Bosque da Penumbra (RPG)',
      Thumbnail: '',
      Description: `${locDescPt} Explore o Bosque da Penumbra, negocie com espíritos de personalidades Atlus e desvende mistérios no bot Pyxie para Discord.`.slice(0, 500),
      Link: `${BASE_URL}/wiki`,
      'Publish date': '',
      Keywords: 'pixel art, rpg discord, bot discord, dark fantasy, bosque da penumbra, atlus, indie game, gothic aesthetic',
    });
  }

  // 2. Baralho Canônico dos 78 Arcanos do Tarot da Pyxie
  for (const card of TAROT_CATALOG) {
    const suitName = card.suitNamePt || card.suit;
    const meaning = card.upright || (card.keywords && card.keywords.join(', ')) || 'Arcano Místico';
    const jpgFileName = card.fileName.replace(/\.webp$/i, '.jpg');
    const imgUrl = `${BASE_URL}/assets/tarot/cards/${jpgFileName}`;

    items.push({
      Title: `Tarot da Pyxie • ${card.name} (${suitName})`.slice(0, 100),
      'Media URL': imgUrl,
      'Pinterest board': 'Pyxie • Tarot dos 78 Arcanos',
      Thumbnail: '',
      Description: `Carta nº ${card.number} do Baralho Oficial dos 78 Arcanos da Pyxie. Significado divinatório: ${meaning}. Consulte sua tiragem diária no Discord.`.slice(0, 500),
      Link: `${BASE_URL}/`,
      'Publish date': '',
      Keywords: 'tarot, arcanos maiores, arcanos menores, baralho tarot, tarot card, esoterismo, tiragem de tarot, divinação, bot discord',
    });
  }

  // 3. Mascote & Artes Oficiais da Pyxie
  items.push(
    {
      Title: 'Pyxie • Mascote Oficial Fada Mágica para Discord'.slice(0, 100),
      'Media URL': `${BASE_URL}/assets/pyxie/pyxie_mascot.png`,
      'Pinterest board': 'Pyxie • Artes Oficiais & Mascote',
      Thumbnail: '',
      Description: 'Pyxie é a fada mágica do Discord com RPG do Bosque da Penumbra, Tarot de 78 Arcanos, Economia viva com feijões mágicos e 10 carreiras interativas.'.slice(0, 500),
      Link: `${BASE_URL}/`,
      'Publish date': '',
      Keywords: 'bot discord, discord bot, mascote fada, fairy, anime aesthetic, bot de rpg, economia discord, tarot discord',
    },
    {
      Title: 'Pyxie • Arte Oficial Galáxia & Estrelas'.slice(0, 100),
      'Media URL': `${BASE_URL}/assets/pyxie/pyxie_space_banner.jpg`,
      'Pinterest board': 'Pyxie • Artes Oficiais & Mascote',
      Thumbnail: '',
      Description: 'Banner oficial temático da Pyxie para comunidades e servidores do Discord.'.slice(0, 500),
      Link: `${BASE_URL}/`,
      'Publish date': '',
      Keywords: 'banner discord, discord theme, galaxy aesthetic, gothic fairy, pyxie bot',
    }
  );

  // 4. Produtos & Achadinhos Temáticos (Shopee & Sanrio)
  items.push(...getShopeeBulkItems());

  return items;
}

function generatePinterestCsv() {
  const headers = ['id', 'title', 'description', 'link', 'image_link', 'price', 'availability', 'condition', 'brand', 'item_group_id', 'google_product_category'];
  const items = getCatalogItems();
  const rows = [headers.join(',')];
  for (const item of items) {
    rows.push(headers.map((h) => escapeCsv(item[h])).join(','));
  }
  return rows.join('\r\n');
}

function generatePinterestBulkPinsCsv() {
  const headers = ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords'];
  const items = getBulkPinItems();
  const rows = [headers.join(',')];
  for (const item of items) {
    rows.push(headers.map((h) => escapeCsv(item[h])).join(','));
  }
  return rows.join('\r\n');
}

function generatePinterestShopeeBulkPinsCsv() {
  const headers = ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords'];
  const items = getShopeeBulkItems();
  const rows = [headers.join(',')];
  for (const item of items) {
    rows.push(headers.map((h) => escapeCsv(item[h])).join(','));
  }
  return rows.join('\r\n');
}

/**
 * Salva os arquivos CSV atualizados em public/ e Downloads/.
 */
function syncPinterestCatalogFile() {
  try {
    const publicDir = path.join(__dirname, '..', '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 1. Catálogo de Produtos
    const csvContent = generatePinterestCsv();
    const targetPath = path.join(publicDir, 'pinterest-catalog.csv');
    fs.writeFileSync(targetPath, '\uFEFF' + csvContent, 'utf8');

    // 2. Criação Geral de Pins em Massa
    const bulkPinsContent = generatePinterestBulkPinsCsv();
    const bulkPinsPath = path.join(publicDir, 'pinterest-bulk-pins.csv');
    fs.writeFileSync(bulkPinsPath, '\uFEFF' + bulkPinsContent, 'utf8');

    // 3. Criação Exclusiva Shopee Pins em Massa
    const shopeeBulkContent = generatePinterestShopeeBulkPinsCsv();
    const shopeeBulkPath = path.join(publicDir, 'pinterest-shopee-bulk-pins.csv');
    fs.writeFileSync(shopeeBulkPath, '\uFEFF' + shopeeBulkContent, 'utf8');

    // Sincroniza também diretamente na pasta de Downloads do usuário
    const downloadsDir = path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'Downloads');
    if (fs.existsSync(downloadsDir)) {
      fs.writeFileSync(path.join(downloadsDir, 'pinterest-shopee-bulk-pins.csv'), '\uFEFF' + shopeeBulkContent, 'utf8');
      fs.writeFileSync(path.join(downloadsDir, 'pinterest-shopee-bulk-pins (1).csv'), '\uFEFF' + shopeeBulkContent, 'utf8');
      fs.writeFileSync(path.join(downloadsDir, 'pinterest-bulk-pins.csv'), '\uFEFF' + bulkPinsContent, 'utf8');
      fs.writeFileSync(path.join(downloadsDir, 'pinterest-bulk-pins (1).csv'), '\uFEFF' + bulkPinsContent, 'utf8');
    }

    return {
      success: true,
      catalogCount: getCatalogItems().length,
      bulkPinsCount: getBulkPinItems().length,
      shopeeBulkCount: getShopeeBulkItems().length,
    };
  } catch (err) {
    console.error('Erro ao sincronizar arquivos do Pinterest:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getCatalogItems,
  getBulkPinItems,
  getShopeeBulkItems,
  generatePinterestCsv,
  generatePinterestBulkPinsCsv,
  generatePinterestShopeeBulkPinsCsv,
  syncPinterestCatalogFile,
};
