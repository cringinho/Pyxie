const fs = require('fs');
const path = require('path');

const csvRaw = `23798670825,Kuromi Sanrio Boneca de pelúcia fofa 25cm Kuromi Sanrio,"55,99",2mil+,Dengo Dengo,9%,"R$5,04",https://shopee.com.br/product/1112387737/23798670825,https://s.shopee.com.br/1BMdNQEU79
58265449372,Camiseta Feminina Premium Hello Kitty Kuromi 100% Algodão,"34,90",0,Galeria Prime7,34%,"R$11,87",https://shopee.com.br/product/1010587534/58265449372,https://s.shopee.com.br/1AfzHIvTw
54816935616,Camiseta Rash Guard Hello Kitty Kuromi modelagem Feminino Infantil Jiu Jitsu Manga Longa Compressão,"119,92",9,KOD SPORTS,33%,"R$39,57",https://shopee.com.br/product/439251150/54816935616,https://s.shopee.com.br/BU6BaII8z
28812198611,EEBR Vintage Goth Espinhos Casal Anéis Para Homens Mulheres Irregularidade Abertura Punk Anel Festa Jóias Presentes Acessórios .,"12,06",277,Moda Hoje,8%,"R$0,96",https://shopee.com.br/product/364518714/28812198611,https://s.shopee.com.br/LnWNtHeo2
58212898323,Anel gótico camafeu roxo pedra roxa oval moldura ornamental vintage vitoriano ajustável moda gótica goth alternativo y2k,"29,90",12,DarkMoth - Acessórios Alternativos,13%,"R$3,89",https://shopee.com.br/product/327741598/58212898323,https://s.shopee.com.br/W6waCH1T5
53709861240,Chaveiro Naruto Personalizado Kunai  Anime Naruto Shippuden | Chaveiro Geek Otaku  Presente Criativo,"14,99",24,J&T Studio,3%,"R$0,45",https://shopee.com.br/product/1763103490/53709861240,https://s.shopee.com.br/20vkMxBJQO
23099667422,Kit Chaveiros Hollow Knight e Hornet | Chaveiro Geek Gamer | Colecionável 3D,"27,97",2,Nautryx,3%,"R$0,84",https://shopee.com.br/product/481391108/23099667422,https://s.shopee.com.br/2BFAZGAg5R
58217140837,Kit Chaveiros Signos do Zodíaco MDF Geek Colecionável Geek Colecionável,"12,90",2,NerdZitos,9%,"R$1,16",https://shopee.com.br/product/1516734366/58217140837,https://s.shopee.com.br/2LYalZA2kU
23098082556,"Chaveiro Uma Face e Dupla Face HAIKYU - ANIME, DESENHO, GEEK, NERD HAIKYUU- FANMADE Feito por fã - Chaveiros","12,00",298,GATOSSOL,3%,"R$0,36",https://shopee.com.br/product/379665594/23098082556,https://s.shopee.com.br/2Vs0xs9PPX
48711799504,TOPTOY Sanrio Série Personagens Sanrio Gato da Fortuna da Sorte Série Pingente de Pelúcia Caixa Misteriosa Kuromi (9 cm,"85,43",2,Brand Choice,13%,"R$11,11",https://shopee.com.br/product/1672861664/48711799504,https://s.shopee.com.br/1Lg3ZjDqmK
51061796738,TOPTOY Sanrio Kuromi no Ofurô Mistério Caixa Surpresa de PVC - Brinquedo Colecionável para Fãs de Sanrio,"67,76",0,Brand Choice,13%,"R$8,81",https://shopee.com.br/product/1672861664/51061796738,https://s.shopee.com.br/1VzTm2DDRN
50717960447,Chubby sanrio limitado japão sanrio personagem mini bola ornamentos canela cão kuromi,"55,43",0,gdiyzahuobaofeipianyuan678,3%,"R$1,66",https://shopee.com.br/product/1930362183/50717960447,https://s.shopee.com.br/1gItyLCa6Q
58200714991,Bonecos Hello Kitty and Friends Com Caixa Expositora 7 Cm Sanrio Kuromi My Melody Divertidamente,"38,19",434,MBM Coleções,3%,"R$1,15",https://shopee.com.br/product/266299391/58200714991,https://s.shopee.com.br/1qcKAeBwlT
46568118283,W versão ampla sanrio it ilha raposa série de vinil caixa misteriosa boneca fofa pingente boneca sanrio caixa misteriosa,"157,16",0,dadahouseholdsupplies,3%,"R$4,71",https://shopee.com.br/product/1928669081/46568118283,https://s.shopee.com.br/3LR7xP6Eim
23594291024,"Bonecos Colecionáveis Pop Hello Kitty, Sanrio, Figuras Anime, Kuromi, My Melody, Cinnamoroll","39,90",38,Amoradora E-commerce,11%,"R$4,39",https://shopee.com.br/product/387151720/23594291024,https://s.shopee.com.br/3VkY9i5bNp
41233335407,"Balanço Sanrio com bonecos Cinnamoroll, My Melody, Pompompurin e KT Sanrio como decoração de cena.","79,32",0,dingdingguag.br,3%,"R$2,38",https://shopee.com.br/product/1909598407/41233335407,https://s.shopee.com.br/3g3yM14y2s
22897558194,ALMOFADA COM MANTA HELLO KITTY OFICIAL SANRIO CAMA,"179,90",0,Lilium Presentes Criativos ,28%,"R$50,37",https://shopee.com.br/product/333769153/22897558194,https://s.shopee.com.br/3qNOYK4Khv
58216019732,【direto do Japão】Bombas de banho com personagens da Sanrio,"28,00",0,Tudo_bem_from_Japan.br,28%,"R$7,84",https://shopee.com.br/product/1917249785/58216019732,https://s.shopee.com.br/2gBRAB8m4i
23298733870,Camiseta ALGODÃO preta Sanrio Kuromi Hello Kitty Melody Cinnamoroll Japonês Harajuku 25 25 26,"44,89",26,chicc.com,26%,"R$11,67",https://shopee.com.br/product/1546444942/23298733870,https://s.shopee.com.br/2qUrMU88jl
23798884243,Camiseta Moderna Sanrio Feminina Girl 100% Algodão Personagem Cinnamonroll,"26,04",12,Boas Vibes,33%,"R$8,59",https://shopee.com.br/product/1399365261/23798884243,https://s.shopee.com.br/30oHYn7VOo
21198287538,Camiseta Casual Sanrio Feminina Voando Woman Girls 100% Algodão Personagem Cinnamonroll,"26,04",8,Boas Vibes,33%,"R$8,59",https://shopee.com.br/product/1399365261/21198287538,https://s.shopee.com.br/3B7hl66s3r
23194383379,Camiseta T-shirt Feminina Girls Sanrio Coleção Cinnamonroll Moda Estilo Retrô Blusa Passeio,"26,04",4,Boas Vibes,33%,"R$8,59",https://shopee.com.br/product/1399365261/23194383379,https://s.shopee.com.br/4fwVXr1A1A
46703273896,MINISO  sanrio volta às aulas série - adorável hello kitty & kuromi figuras caixas cegas presente para crianças 7cm ×,"57,44",5,Brand Choice,23%,"R$13,21",https://shopee.com.br/product/1672861664/46703273896,https://s.shopee.com.br/4qFvkA0WgD
47953273594,"MINISO  sanrio “fantasy paradise” série - kuromi sonhador, cinnamoroll e mais figuras de caixas cegas (entrega","82,52",6,Brand Choice,23%,"R$18,98",https://shopee.com.br/product/1672861664/47953273594,https://s.shopee.com.br/50ZLwSztLG
47511231282,MINISO Personagem Sanrio Série Ilha da Raposa Pelúcia de Vinil Caixa Surpresa Figura Misteriosa Macia e Colecionável,"122,30",3,Choice Oficial,23%,"R$28,13",https://shopee.com.br/product/1006215031/47511231282,https://s.shopee.com.br/5Asm8lzG0J
45106253657,Camiseta Kpop Estampa Boys JungKook Jimin Jhope Teahyung,"35,96",1,Latzi,48%,"R$17,26",https://shopee.com.br/product/681967866/45106253657,https://s.shopee.com.br/40gokd3hN6
55665304578,Camiseta BTS Bangtan Boys Army Kpop Algodão 100% Fio 30.1 Presente Criativo Amigo Secreto,"54,93",0,ANTONIETT Oficial,46%,"R$25,27",https://shopee.com.br/product/419079781/55665304578,https://s.shopee.com.br/4B0Eww3429
22298720166,Chaveiro Koya – KPOP Fofo Idol Coreano Kawaii Kpopper Colecionável Acessório Mochila Chaves Charm BTS BT21 RM Namjoon,"19,90",87,Empório Lunari,38%,"R$7,56",https://shopee.com.br/product/1441286806/22298720166,https://s.shopee.com.br/4LJf9F2QhC
58200546904,Chaveiro Cosmic21 – KPOP Fofo Idol Coreano Kawaii Kpopper Colecionável Acessório Mochila Chaves Charm,"23,90",4,Empório Lunari,38%,"R$9,08",https://shopee.com.br/product/1441286806/58200546904,https://s.shopee.com.br/4Vd5LY1nMF
23499167818,Chaveiro Cosmic21 – KPOP Fofo Idol Coreano Kawaii Kpopper Colecionável Acessório Mochila Chaves Charm,"23,90",5,Empório Lunari,38%,"R$9,08",https://shopee.com.br/product/1441286806/23499167818,https://s.shopee.com.br/60Rt8Iw5JY
22699018325,[Maiores Quantidades] Chaveiro – KPOP Fofo Idol Coreano Kawaii Kpopper Colecionável Acessório Mochila Chaves,"36,99",10,Empório Lunari,38%,"R$14,06",https://shopee.com.br/product/1441286806/22699018325,https://s.shopee.com.br/6AlJKbvRyb
58253955903,Mini Cartela de Adesivos Mini21 – KPOP Fofo Idol Coreano Kawaii Colecionável Decoração Toploader BT21 BTS,"3,99",275,Empório Lunari,38%,"R$1,52",https://shopee.com.br/product/1441286806/58253955903,https://s.shopee.com.br/6L4jWuuode
23199440691,Mini Cartela de Adesivos Baby Cooky ✨ – KPOP Fofo Idol Coreano Kawaii Colecionável Decoração Toploader,"3,99",26,Empório Lunari,38%,"R$1,52",https://shopee.com.br/product/1441286806/23199440691,https://s.shopee.com.br/6VO9jDuBIh
58259201521,Blocos de Anotações Mang (Coleção Baby21) – BTS Army JHope Hoseok BT21 Papelaria Fofa KPOP Kawaii,"10,90",12,Empório Lunari,38%,"R$4,14",https://shopee.com.br/product/1441286806/58259201521,https://s.shopee.com.br/5LCCL4ycfU
58209207715,Blocos de Anotações Koya (Coleção Baby21) – BTS Army Namjoon BT21 Papelaria Fofa KPOP Kawaii Coreano,"10,90",17,Empório Lunari,38%,"R$4,14",https://shopee.com.br/product/1441286806/58209207715,https://s.shopee.com.br/5VVcXNxzKX
58259299201,Bottons Premium Baby Chimmy ✨– KPOP Fofo Idol Coreano Kawaii BTS BT21 Army Decoração Prova d'Água,"10,90",8,Empório Lunari,38%,"R$4,14",https://shopee.com.br/product/1441286806/58259299201,https://s.shopee.com.br/5fp2jgxLza
19899844283,Chaveiro – KPOP Fofo Idol Coreano Kawaii Kpopper Colecionável Acessório Mochila Chaves Charm BTS BT21 Van,"19,90",4,Empório Lunari,38%,"R$7,56",https://shopee.com.br/product/1441286806/19899844283,https://s.shopee.com.br/5q8Svzwied
18498293667,Caderno Note Book Capybara Kawaii Fofo tamanho 12X18,"19,89",1,ZigZag Bazar e Magazine,23%,"R$4,57",https://shopee.com.br/product/367951476/18498293667,https://s.shopee.com.br/7KxGikr0bw
23498878646,Camiseta Kawaii Moda Capybara Capivara Desenho Meme Poses Estilo,"25,51",4,Boas Vibes,33%,"R$8,42",https://shopee.com.br/product/1399365261/23498878646,https://s.shopee.com.br/7VGgv3qNGz
58203304101,Camiseta Dracula Qualidade Algodão Unissex Lançamento Gotico Emo Dark Goth Temos Plus Size Envio Rapido,"31,20",0,123compracerta,22%,"R$6,86",https://shopee.com.br/product/1485078693/58203304101,https://s.shopee.com.br/7fa77Mpjw2
23398560196,"Cropped Gótico Feminino, Estilo Alternativo, Goth, Gothic, Y2k, Punk","49,00",38,La Domme,19%,"R$9,31",https://shopee.com.br/product/1344277126/23398560196,https://s.shopee.com.br/7ptXJfp6b5
58260523339,Colar de pérolas e espinho rebite estilo gótico punk rock goth lolita,"44,99",1,Boo-Boo,19%,"R$8,55",https://shopee.com.br/product/331050574/58260523339,https://s.shopee.com.br/6fhZvWtXxs
15922582654,Colar Coffin egirl goth aesthetic,"30,00",12,Sugar & Spice,19%,"R$5,70",https://shopee.com.br/product/318556087/15922582654,https://s.shopee.com.br/6q107psucv
56467045490,Punk Cravado Gargantilha Colar Para Mulheres Preto Couro Do Plutônio Rebite Pico Goth Rock Ajustável Pescoço Jóias Festa,"9,99",12,JIANOCSE-PUNK,18%,"R$1,80",https://shopee.com.br/product/987902592/56467045490,https://s.shopee.com.br/70KQK8sHHy
50067825252,Halloween Cruz Couro Do Plutônio Gargantilha Colar Borboleta Escorpião Colares Para Mulheres Goth Ajustável Punk Jóias,"26,99",0,JIANOCSE-PUNK,18%,"R$4,86",https://shopee.com.br/product/987902592/50067825252,https://s.shopee.com.br/7AdqWRrdx1
49667672454,2 Pçs Luvas Sem Dedos De Couro Com Coração Gargantilha Colar Punk Goth Cosplay Traje,"38,99",0,JIANOCSE-PUNK,18%,"R$7,02",https://shopee.com.br/product/987902592/49667672454,https://s.shopee.com.br/8fSeJClvuK
58212762970,Camiseta Oversized Ambitious Y2K T-shirt Streetwear Unissex Algodão Goth Alternativa Moda Feminina,"49,72",0,Skin.privat,18%,"R$8,95",https://shopee.com.br/product/1167060112/58212762970,https://s.shopee.com.br/8pm4VVlIZN
41284431274,"7 Peças Punk Goth Joias Emo Pulseiras Cinto Gargantilha Ponta | Roupa Gótica Dos Anos 80 , De Couro Cravejado , Y2k Para","68,99",0,JIANOCSE-PUNK,18%,"R$12,42",https://shopee.com.br/product/987902592/41284431274,https://s.shopee.com.br/905UhokfEQ
40683175184,"Crânio Gótico Corrente Carteira De Couro Punk Bifold Halloween Goth Acessórios Unissex , Preto","99,99",0,JIANOCSE-PUNK,18%,"R$18,00",https://shopee.com.br/product/987902592/40683175184,https://s.shopee.com.br/9AOuu7k1tT
47615453544,"Óculos De Sol Punk Spike Goth Rock Com Rebites Longos Exclusivos , Acessório De Halloween Para Fantasia Y2k Cosplay","37,99",15,JIANOCSE-PUNK,18%,"R$6,84",https://shopee.com.br/product/987902592/47615453544,https://s.shopee.com.br/80CxVyoTGG
23793943276,"Camiseta Unissex \"\"Goth Darkness\"\"","79,90",521,Sua vibe wear,16%,"R$12,78",https://shopee.com.br/product/612510044/23793943276,https://s.shopee.com.br/8AWNiHnpvJ
58211239001,"Baby Tee Hello Kitty Strass feminina | Goth, alternativo, dark","42,00",20,VOIDRA,16%,"R$6,72",https://shopee.com.br/product/1273511292/58211239001,https://s.shopee.com.br/8KpnuanCaM
58206275470,Blusa Y2k Feminina Grunge Goth Alternativo de cruz Punk Emo Punk Dark Affliction,"58,00",14,VOIDRA,17%,"R$9,86",https://shopee.com.br/product/1273511292/58206275470,https://s.shopee.com.br/8V9E6tmZFP
20499318640,choker whimsical goth,"41,00",14,Sugar & Spice,16%,"R$6,56",https://shopee.com.br/product/318556087/20499318640,https://s.shopee.com.br/9zy1tegrCi
55465826792,Calças Femininas de Perna Larga Estilo Mall Goth Cross Harajuku Punk Fairy Grunge Dark Aesthetic Emo Alt Fashion C 7F1X,"83,12",0,Loja de alta qualidade NO16,33%,"R$27,43",https://shopee.com.br/product/1245807039/55465826792,https://s.shopee.com.br/AAHS5xgDrl
58214366811,Camiseta Melanie Martinez Portais Cogumelo Rosa Fada Ilustração Estilo Dark Fairy Oversized Unissex Algodão Premium,"43,98",0,Tshirt8505,16%,"R$7,04",https://shopee.com.br/product/1352448085/58214366811,https://s.shopee.com.br/AKasIGfaWo
43134720207,Misscheering Nail Enhancement Extreme Black Crystal Cat Eye Glitter Dark Fairy Esmalte,"19,00",0,Manicure.br,7%,"R$1,33",https://shopee.com.br/product/721595906/43134720207,https://s.shopee.com.br/AUuIUZexBr
47016910618,100 Pcs Glow the Dark Mini Turtle Figurines Resin Turtles for Fairy Garden Decoration with Storage Box – Cute Landscap,"37,02",0,moreorders1.br,3%,"R$1,11",https://shopee.com.br/product/289671343/47016910618,https://s.shopee.com.br/9KiL6QjOYe`;

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

const themeThumbs = {
  pelucia: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=400',
  goth: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
  camiseta: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
  chaveiro: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400',
  colecionavel: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=400',
  papelaria: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400',
  acessorio: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=400',
  capivara: 'https://images.unsplash.com/photo-1590422152702-8663445582f3?w=400',
  hollow: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
  esmalte: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400',
};

const lines = csvRaw.trim().split('\n');
console.log('Total de linhas lidas:', lines.length);

const items = lines.map((l, idx) => {
  const parts = parseCSVLine(l);
  const itemId = parts[0] || ('item_' + idx);
  const rawName = parts[1] || 'Achadinho Pyxie';
  const priceVal = parts[2] ? parts[2].replace(/"/g, '') : '29,90';
  const sales = parts[3] ? parts[3].replace(/"/g, '') : '0';
  const store = parts[4] || 'Shopee';
  const commRate = parts[5] || '10%';
  const commission = parts[6] ? parts[6].replace(/"/g, '') : 'R$ 3,00';
  const productLink = parts[7] || '';
  const offerLink = parts[8] || parts[7] || '';

  let cleanName = rawName.replace(/^[【\[].*?[】\]]\s*/, '').trim();
  cleanName = cleanName.replace(/""/g, '"');
  if (cleanName.length > 60) cleanName = cleanName.substring(0, 57) + '...';

  let tag = 'Achadinho';
  let tag_en = 'Featured';
  let img = themeThumbs.colecionavel;

  const low = rawName.toLowerCase();
  if (low.includes('pelúcia') || low.includes('boneca') || low.includes('plush')) {
    tag = 'Pelúcia Sanrio';
    tag_en = 'Sanrio Plush';
    img = themeThumbs.pelucia;
  } else if (low.includes('capybara') || low.includes('capivara')) {
    tag = 'Meme Capivara';
    tag_en = 'Capybara Vibe';
    img = themeThumbs.capivara;
  } else if (low.includes('camiseta') || low.includes('cropped') || low.includes('blusa') || low.includes('rash guard') || low.includes('calças') || low.includes('baby tee')) {
    tag = 'Moda & Estilo';
    tag_en = 'Fashion & Goth';
    img = themeThumbs.camiseta;
  } else if (low.includes('anel') || low.includes('colar') || low.includes('gargantilha') || low.includes('choker') || low.includes('pulseira') || low.includes('óculos') || low.includes('luvas')) {
    tag = 'Acessório Goth';
    tag_en = 'Goth Jewelry';
    img = themeThumbs.goth;
  } else if (low.includes('hollow knight') || low.includes('naruto') || low.includes('haikyu')) {
    tag = 'Geek & Anime';
    tag_en = 'Geek & Anime';
    img = themeThumbs.hollow;
  } else if (low.includes('chaveiro') || low.includes('botton')) {
    tag = 'Chaveiro & Pin';
    tag_en = 'Keychain & Pin';
    img = themeThumbs.chaveiro;
  } else if (low.includes('adesivo') || low.includes('bloco') || low.includes('caderno')) {
    tag = 'Papelaria Fofa';
    tag_en = 'Cute Stationery';
    img = themeThumbs.papelaria;
  } else if (low.includes('esmalte')) {
    tag = 'Dark Fairy';
    tag_en = 'Dark Fairy';
    img = themeThumbs.esmalte;
  } else if (low.includes('boneco') || low.includes('caixa misteriosa') || low.includes('miniso') || low.includes('toptoy')) {
    tag = 'Colecionável Raro';
    tag_en = 'Rare Collectible';
    img = themeThumbs.colecionavel;
  }

  const numPrice = parseFloat(priceVal.replace('.', '').replace(',', '.')) || 25;
  const usdPrice = (numPrice / 5.2).toFixed(2);

  return {
    id: String(itemId),
    titulo: cleanName,
    titulo_en: cleanName,
    preco: 'R$ ' + priceVal,
    preco_en: '$' + usdPrice,
    tag,
    tag_en,
    vendas: sales,
    loja: store,
    taxa_comissao: commRate,
    comissao: commission,
    productLink,
    link: offerLink,
    imagem: img,
    active: true,
    status: 'active',
    lastChecked: Date.now()
  };
});

const targetPath = path.join(__dirname, '..', 'src', 'data', 'shopee.json');
fs.writeFileSync(targetPath, JSON.stringify(items, null, 2), 'utf8');
console.log('✅ Salvos ' + items.length + ' produtos da Shopee em ' + targetPath);
