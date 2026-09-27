const fs = require('fs');
const path = require('path');

const csvRaw = `Offer Name,Offer Period,Commission Rate,Offer Link,Trackable Link_short
PNGeek Store,"start: 2026-09-09\nend: No limit",up to 43%,https://shopee.com.br/shop/1425663969,https://s.shopee.com.br/7VGji3Dtaj
Geekinart,"start: 2026-06-06\nend: No limit",up to 43%,https://shopee.com.br/shop/1681757304,https://s.shopee.com.br/7fa9uMDGFm
Geekverso_Store,"start: 2025-09-08\nend: No limit",up to 28%,https://shopee.com.br/shop/618625235,https://s.shopee.com.br/7pta6fCcup
GeekWorld!,"start: 2025-11-28\nend: No limit",up to 23%,https://shopee.com.br/shop/1226121876,https://s.shopee.com.br/6fhciWH4Hc
ARKAN Presentes Geeks👾,"start: 2026-05-11\nend: No limit",up to 23%,https://shopee.com.br/shop/410840712,https://s.shopee.com.br/6q12upGQwf
SorvoLetra - Livros e Produtos Geek,"start: 2026-08-16\nend: No limit",up to 23%,https://shopee.com.br/shop/1152831724,https://s.shopee.com.br/70KT78Fnbi
geekimpstore,"start: 2026-08-16\nend: No limit",up to 22%,https://shopee.com.br/shop/1860610467,https://s.shopee.com.br/7AdtJRFAGl
Midori Geek,"start: 2026-01-22\nend: No limit",up to 22%,https://shopee.com.br/shop/330598091,https://s.shopee.com.br/8fSh6C9SE4
Ravy Geek Store,"start: 2026-06-03\nend: No limit",up to 21%,https://shopee.com.br/shop/221306340,https://s.shopee.com.br/8pm7IV8ot7
Cusco Geek 3D,"start: 2026-09-09\nend: No limit",up to 20%,https://shopee.com.br/shop/519816482,https://s.shopee.com.br/905XUo8BYA
ArtgeekLoja,"start: 2026-07-08\nend: No limit",up to 20%,https://shopee.com.br/shop/1022239710,https://s.shopee.com.br/9AOxh77YDD
NxtArt Geek,"start: 2026-06-10\nend: No limit",up to 20%,https://shopee.com.br/shop/507521532,https://s.shopee.com.br/80D0IyBza0
OTAHERO GEEK,"start: 2025-05-22\nend: No limit",up to 20%,https://shopee.com.br/shop/389211998,https://s.shopee.com.br/8AWQVHBMF3
Arcade Geek®,"start: 2024-04-13\nend: No limit",up to 19%,https://shopee.com.br/shop/384927178,https://s.shopee.com.br/8KpqhaAiu6
Geekdospampas,"start: 2026-09-09\nend: No limit",up to 19%,https://shopee.com.br/shop/826769230,https://s.shopee.com.br/8V9GttA5Z9
GEEK_MAGAZINE,"start: 2026-07-22\nend: No limit",up to 19%,https://shopee.com.br/shop/1824951191,https://s.shopee.com.br/9zy4ge4NWS
Hot Cloud Geek Shop,"start: 2025-06-20\nend: No limit",up to 19%,https://shopee.com.br/shop/388359459,https://s.shopee.com.br/AAHUsx3kBV
decoracaogeek,"start: 2025-08-16\nend: No limit",up to 19%,https://shopee.com.br/shop/369085939,https://s.shopee.com.br/AKav5G36qY
WannaGeek,"start: 2025-05-18\nend: No limit",up to 18%,https://shopee.com.br/shop/231119110,https://s.shopee.com.br/AUuLHZ2TVb
Geek Squad,"start: 2026-09-01\nend: No limit",up to 18%,https://shopee.com.br/shop/1640288819,https://s.shopee.com.br/9KiNtQ6usO
kadu Modas,"start: 2024-10-16\nend: No limit",up to 80%,https://shopee.com.br/shop/284550999,https://s.shopee.com.br/9V1o5j6HXR
MALUKA MODAS,"start: 2025-05-20\nend: No limit",up to 80%,https://shopee.com.br/shop/424060106,https://s.shopee.com.br/9fLEI25eCU
P & F MODAS,"start: 2026-01-02\nend: No limit",up to 63%,https://shopee.com.br/shop/1418033025,https://s.shopee.com.br/9peeUL50rX
Yudis Modas,"start: 2025-06-17\nend: No limit",up to 59%,https://shopee.com.br/shop/1269019626,https://s.shopee.com.br/gQPZUduSm
Bau_Modas,"start: 2026-03-03\nend: No limit",up to 58%,https://shopee.com.br/shop/936690134,https://s.shopee.com.br/qjplndH7p
Isah Modas23,"start: 2025-06-02\nend: No limit",up to 58%,https://shopee.com.br/shop/1072740738,https://s.shopee.com.br/113Fy6cdms
SALUMODASSALU,"start: 2024-08-01\nend: No limit",up to 54%,https://shopee.com.br/shop/1010897026,https://s.shopee.com.br/1BMgAPc0Rv
DuoKids Moda Infantil,"start: 2024-08-29\nend: No limit",up to 47%,https://shopee.com.br/shop/1213891795,https://s.shopee.com.br/1AimGgRoi
Lira Modas 333,"start: 2026-08-27\nend: No limit",up to 45%,https://shopee.com.br/shop/451641644,https://s.shopee.com.br/BU8yZfoTl
LD TRICOT MODA,"start: 2026-08-28\nend: No limit",up to 43%,https://shopee.com.br/shop/1856103040,https://s.shopee.com.br/LnZAsfB8o
JBR Modas,"start: 2026-08-17\nend: No limit",up to 43%,https://shopee.com.br/shop/1845318362,https://s.shopee.com.br/W6zNBeXnr
Modas Emy,"start: 2026-08-16\nend: No limit",up to 43%,https://shopee.com.br/shop/1302734125,https://s.shopee.com.br/20vn9wYplA
hysa modas,"start: 2026-01-10\nend: No limit",up to 43%,https://shopee.com.br/shop/1572635877,https://s.shopee.com.br/2BFDMFYCQD
R&A Confecções - Moda Infantil,"start: 2024-09-27\nend: No limit",up to 43%,https://shopee.com.br/shop/1176377089,https://s.shopee.com.br/2LYdYYXZ5G
Loja Querubins moda infantil,"start: 2024-12-10\nend: No limit",up to 42%,https://shopee.com.br/shop/985427186,https://s.shopee.com.br/2Vs3krWvkJ
modas.rafaela,"start: 2025-06-03\nend: No limit",up to 42%,https://shopee.com.br/shop/1188080262,https://s.shopee.com.br/1Lg6MibN76
Moda flor store,"start: 2026-04-04\nend: No limit",up to 40%,https://shopee.com.br/shop/1261175525,https://s.shopee.com.br/1VzWZ1ajm9
H.M Moda ,"start: 2025-07-23\nend: No limit",up to 40%,https://shopee.com.br/shop/427849608,https://s.shopee.com.br/1gIwlKa6RC
Sunshine Moda,"start: 2026-05-08\nend: No limit",up to 39%,https://shopee.com.br/shop/1640895813,https://s.shopee.com.br/1qcMxdZT6F
Milmar Moda Praia e Confecções,"start: 2026-03-14\nend: No limit",up to 39%,https://shopee.com.br/shop/680822342,https://s.shopee.com.br/3LRAkOTl3Y
Resident Fantasy Games,"start: 2025-10-16\nend: No limit",up to 25%,https://shopee.com.br/shop/407991628,https://s.shopee.com.br/3VkawhT7ib
Conceito's Gamer,"start: 2026-07-24\nend: No limit",up to 23%,https://shopee.com.br/shop/1825946662,https://s.shopee.com.br/3g4190SUNe
Game1 Esportes & Diversão,"start: 2026-04-10\nend: No limit",up to 23%,https://shopee.com.br/shop/334094602,https://s.shopee.com.br/3qNRLJRr2h
GameFit,"start: 2025-03-21\nend: No limit",up to 23%,https://shopee.com.br/shop/260484161,https://s.shopee.com.br/2gBTxAWIPU
Viros Games,"start: 2026-01-25\nend: No limit",up to 21%,https://shopee.com.br/shop/1087274961,https://s.shopee.com.br/2qUu9TVf4X
infogamesjpa,"start: 2025-07-14\nend: No limit",up to 20%,https://shopee.com.br/shop/1066149614,https://s.shopee.com.br/30oKLmV1ja
RJGAMES ,"start: 2025-09-28\nend: No limit",up to 20%,https://shopee.com.br/shop/1422178423,https://s.shopee.com.br/3B7kY5UOOd
EDGAMES_ADESIVOS,"start: 2026-01-10\nend: No limit",up to 19%,https://shopee.com.br/shop/520176894,https://s.shopee.com.br/4fwYKqOgLw
HotGamesSP,"start: 2026-05-25\nend: No limit",up to 19%,https://shopee.com.br/shop/1653954906,https://s.shopee.com.br/4qFyX9O30z
Jsg26.infogames,"start: 2024-03-07\nend: No limit",up to 19%,https://shopee.com.br/shop/422644808,https://s.shopee.com.br/50ZOjSNPg2
GameXvendas,"start: 2025-10-08\nend: No limit",up to 19%,https://shopee.com.br/shop/536659959,https://s.shopee.com.br/5AsovlMmL5
Papelaria Lords Gamer,"start: 2026-02-06\nend: No limit",up to 18%,https://shopee.com.br/shop/717443900,https://s.shopee.com.br/40grXcRDhs
"Bianchi Discos, Dvd's e games","start: 2025-03-19\nend: No limit",up to 18%,https://shopee.com.br/shop/303561166,https://s.shopee.com.br/4B0HjvQaMv
ALB GAMES E ACESSORIOS,"start: 2026-01-15\nend: No limit",up to 18%,https://shopee.com.br/shop/1302752751,https://s.shopee.com.br/4LJhwEPx1y
Skins Games,"start: 2025-11-07\nend: No limit",up to 18%,https://shopee.com.br/shop/352499133,https://s.shopee.com.br/4Vd88XPJh1
GamesAtacadoH,"start: 2025-11-09\nend: No limit",up to 18%,https://shopee.com.br/shop/1181767945,https://s.shopee.com.br/6VOCWDHhdQ
Games dos Reis,"start: 2025-07-30\nend: No limit",up to 18%,https://shopee.com.br/shop/337269387,https://s.shopee.com.br/6L4mJuIKyP
Bambu Games,"start: 2024-03-05\nend: No limit",up to 18%,https://shopee.com.br/shop/674460327,https://s.shopee.com.br/6AlM7bIyJO
xp_games_retro,"start: 2025-07-25\nend: No limit",up to 18%,https://shopee.com.br/shop/1075262733,https://s.shopee.com.br/60RvvIJbeN
FIESA GAMES,"start: 2026-08-12\nend: No limit",up to 17%,https://shopee.com.br/shop/349372119,https://s.shopee.com.br/5q8VizKEzM
NOVI GAMING,"start: 2024-03-06\nend: No limit",up to 15%,https://shopee.com.br/shop/438129953,https://s.shopee.com.br/5fp5WgKsKL
GAMING STORE,"start: 2025-08-12\nend: No limit",up to 13%,https://shopee.com.br/shop/528000934,https://s.shopee.com.br/5VVfKNLVfK
Kysona Gaming Gear,"start: 2026-07-30\nend: No limit",up to 11%,https://shopee.com.br/shop/1823478555,https://s.shopee.com.br/5LCF84M90J
Kysona Gaming Gear BR,"start: 2026-08-06\nend: No limit",up to 11%,https://shopee.com.br/shop/1809718536,https://s.shopee.com.br/7pta6fCcvo
gamingexpert.br,"start: 2024-09-10\nend: No limit",up to 8%,https://shopee.com.br/shop/473038110,https://s.shopee.com.br/7fa9uMDGGn
COUGAR GAMING,"start: 2026-02-27\nend: No limit",up to 5%,https://shopee.com.br/shop/837599815,https://s.shopee.com.br/7VGji3Dtbm
gamingshack.br,"start: 2026-04-01\nend: No limit",up to 3%,https://shopee.com.br/shop/998752732,https://s.shopee.com.br/7KxJVkEWwl
Mestre Computadores,"start: 2026-07-25\nend: No limit",up to 22%,https://shopee.com.br/shop/299192634,https://s.shopee.com.br/7AdtJRFAHk
Mi7 Computadores,"start: 2025-09-23\nend: No limit",up to 17%,https://shopee.com.br/shop/1141313566,https://s.shopee.com.br/70KT78Fncj
CPA Computadores,"start: 2025-02-06\nend: No limit",up to 16%,https://shopee.com.br/shop/373256435,https://s.shopee.com.br/6q12upGQxi
Infobet Computadores,"start: 2026-07-30\nend: No limit",up to 14%,https://shopee.com.br/shop/1884463224,https://s.shopee.com.br/6fhciWH4Ih
Ibiart Bordados Computadorizados,"start: 2025-08-30\nend: No limit",up to 14%,https://shopee.com.br/shop/347449691,https://s.shopee.com.br/9AOxh77YEC
Digi Blu Sky Audio e Computadores ,"start: 2026-04-11\nend: No limit",up to 7%,https://shopee.com.br/shop/210177177,https://s.shopee.com.br/905XUo8BZB
Eleczone Computadores Acessórios,"start: 2026-08-21\nend: No limit",up to 7%,https://shopee.com.br/shop/408192674,https://s.shopee.com.br/8pm7IV8ouA
Chuyi Computador Loja ,"start: 2026-03-16\nend: No limit",up to 6%,https://shopee.com.br/shop/191095419,https://s.shopee.com.br/8fSh6C9SF9
ELEKTRA COMPUTADORES,"start: 2025-11-03\nend: No limit",up to 6%,https://shopee.com.br/shop/415255931,https://s.shopee.com.br/8V9GttA5a8`;

// Parse CSV lines
function parseCSV(text) {
  const result = [];
  let row = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentField.trim());
      currentField = '';
      if (row.length > 1) {
        result.push(row);
      }
      row = [];
    } else {
      currentField += char;
    }
  }
  if (currentField || row.length > 0) {
    row.push(currentField.trim());
    if (row.length > 1) {
      result.push(row);
    }
  }
  return result;
}

const parsed = parseCSV(csvRaw);
const header = parsed[0];
const stores = [];

for (let i = 1; i < parsed.length; i++) {
  const [name, period, commission, offerLink, shortLink] = parsed[i];
  if (shortLink && shortLink.startsWith('https://s.shopee.com.br/')) {
    stores.push({
      id: i,
      name: name ? name.replace(/^"|"$/g, '').trim() : '',
      commission: commission || '',
      offerLink: offerLink || '',
      link: shortLink.trim(),
    });
  }
}

console.log('Total stores parsed:', stores.length);
const targetPath = path.join(__dirname, '..', 'src', 'data', 'shopeeStores.json');
fs.writeFileSync(targetPath, JSON.stringify(stores, null, 2), 'utf8');
console.log('Saved to:', targetPath);
