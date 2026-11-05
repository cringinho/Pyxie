# 09. Imagens, ícones, fontes e assets

> Nota da área: 6/10 · As páginas públicas não quebram imagem e quase nenhuma rola para o lado; o favicon e o alt estão presentes em quase tudo. O peso é o maior problema: logos de 135 KB, "ícones" SVG de 300 KB e fontes baixadas várias vezes. Há também arte repetida ou sem uso, e crédito de artista que nunca aparece. No bot, o baú sazonal tem um link provisório como imagem padrão.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q161 | Imagens duplicadas em `assets/` e `public/assets/` | 🟡 PARCIAL | baixa |
| Q162 | Arquivos repetidos ou mal nomeados em `public/assets/pyxie` | 🔴 PROBLEMA | baixa |
| Q163 | Uso de formatos leves (WebP/AVIF) | 🟡 PARCIAL | média |
| Q164 | Imagem grande para ícone pequeno | 🔴 PROBLEMA | média |
| Q165 | SVG do Astaroth são vetores leves? | 🔴 PROBLEMA | média |
| Q166 | Imagem padrão do Baú Misterioso | 🔴 PROBLEMA | média |
| Q167 | Fotos da vitrine Shopee batem com o produto? | 🔴 PROBLEMA | média |
| Q168 | Menu da Transparência cabe no celular? | 🔴 PROBLEMA | média |
| Q169 | Rolagem lateral e imagem quebrada nas demais páginas | ✅ OK | info |
| Q170 | Textos alternativos (alt) em português | 🟡 PARCIAL | baixa |
| Q171 | Carta do Tarô depende do domínio de produção? | 🟡 PARCIAL | baixa |
| Q172 | Favicons, ícone Apple e manifest completos | 🟡 PARCIAL | baixa |
| Q173 | Painel usa o mesmo ícone e fontes do site? | 🟡 PARCIAL | baixa |
| Q174 | Fonte dos títulos na Wiki e em Planos | 🔴 PROBLEMA | baixa |
| Q175 | Fontes baixadas uma vez só e todas usadas? | 🔴 PROBLEMA | média |
| Q176 | Emoji proibido do portal bloqueado em todo lugar? | 🟡 PARCIAL | baixa |
| Q177 | Crédito do artista aparece no site e nos embeds? | 🔴 PROBLEMA | média |
| Q178 | Imagem de prévia (og:image) de Bônus e Cringelândia | 🔴 PROBLEMA | baixa |
| Q179 | Imagens publicadas sem uso | 🟡 PARCIAL | baixa |
| Q180 | Campo "Imagem do baú" valida e mostra prévia? | 🔴 PROBLEMA | média |

---

### Q161 — As imagens que existem ao mesmo tempo em assets/ e public/assets/ são realmente usadas nas duas pastas, ou uma delas é cópia morta?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `server.js:407` monta `express.static('public')` antes de tudo, então `/assets/...` sai primeiro de `public/assets`. Só depois vêm `server.js:429` (`assets/`) e `server.js:433` (`public/assets`). Medição `cmp`: 165 arquivos existem nas duas pastas, todos idênticos (cerca de 10 MB). O bot lê a pasta `assets/`: `src/modules/dungeon/dungeonRenderer.js:33` e `src/utils/pyxieEmotions.js:6`. O site lê `public/assets`: `src/services/pyxieAssets.js:8`, `src/modules/seasonal/cardRenderer.js:246`. `src/modules/dungeon/README.md:64` manda tratar as duas pastas.
**Achado:** As duas cópias são usadas: o site usa `public/assets` e o bot usa `assets/`. Nenhuma é cópia morta. Mas são 10 MB repetidos. Se alguém trocar uma arte só numa pasta, o site e o bot passam a mostrar artes diferentes.
**Recomendação:** Guardar cada arte em uma só pasta e apontar o bot e o site para ela. Se precisar manter as duas, criar um script que copie de uma para a outra e um teste que avise quando elas ficarem diferentes.
**Revisão:** Rebaixado de PROBLEMA/média. O auditor inverteu a ordem: quem ganha é `public/assets` (linha 407), não `assets/`. A cópia em `assets/` serve ao bot. Sobra só a duplicação.

### Q162 — A pasta public/assets/pyxie, que o painel "Artes da Pyxie" lista, tem arquivos repetidos ou com nomes sem sentido?

**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** md5 igual: `1.png` = `pyxie_extrasAssetsSheets.png`, `2.png` = `…Sheets5`, `3.png` = `…Sheets4`, `4.png` = `…Sheets3`, `5.png` = `…Sheets2`, `pyxie all (1).png` = `pyxie_halloweenCosplay.png`, `emojis/astaroth_main_icon.png` = `emojis/astaroth_serious.png`. `src/services/pyxieAssets.js:44-55` (`listAssets`) lista tudo o que está na pasta.
**Achado:** O painel de créditos mostra 7 imagens repetidas, com nomes como "1.png" e "pyxie all (1).png" (com espaço). O dono pode marcar crédito duas vezes para a mesma arte, e a lista fica confusa.
**Recomendação:** Apagar `1.png` a `5.png`, `pyxie all (1).png` e um dos dois Astaroth repetidos. Usar só nomes descritivos, sem espaço.
**Revisão:** Confirmado. Os 7 pares conferem por md5.

### Q163 — As imagens do site já usam formatos leves (WebP/AVIF), como as cartas do tarô e o banner de compartilhamento?

**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `find`: 0 arquivos `.webp`/`.avif` em `public/assets`; 80 `.webp` só em `assets/tarot`. `src/services/tarotCardPages.js:150` troca `.webp` por `.jpg` também nas `<img>` das páginas (`:324`, `:372`). `og_banner_hd.png` tem 552 KB (1200x630). `assets/sapatona_small.gif` tem 2,5 MB, 174x174, 125 quadros, enviado como anexo em `index.js:389-392`.
**Achado:** As páginas de cartas mandam JPG mesmo existindo WebP quase duas vezes menor. O banner de 552 KB também aparece no perfil (`u.html`). No celular, isso deixa as páginas mais lentas. O GIF de 2,5 MB sobe para o Discord toda vez que a frase dispara.
**Recomendação:** Usar `.webp` nas `<img>` das páginas de cartas e manter `.jpg` só no `og:image` e no sitemap de imagens. Converter o banner para JPG/WebP de até 150 KB. Reduzir o GIF (menos quadros ou menos cores).
**Revisão:** Confirmado. Tamanhos e número de quadros conferidos com PIL.

### Q164 — As imagens da Pyxie aparecem no tamanho em que foram salvas, ou o visitante baixa uma imagem grande para ver um ícone pequeno?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** Medição Playwright (`/tmp/aud-imagens-icones-assets/result.json`): `sticker_smile.png` 320px exibido a 32-36px em index, partnerships e u.html; `pyxie_mascot.png` 576x1024 exibido a 36px em `transparencia.html` e a 128px em `404.html`; `og_banner_hd.png` 1200px exibido a 230px em `u.html` (360px); `pyxie_pixelart_face.png` 172px exibido a 38px em `tarot.html`.
**Achado:** Um logo de 36px custa até 135 KB, de 5 a 10 vezes mais que o necessário. Como ele fica no topo de quase todas as páginas, atrasa a primeira tela no celular.
**Recomendação:** Criar versões pequenas para ícone e topo (64px e 128px, WebP de uns 5 KB). Usar a arte grande só onde ela aparece grande. Pode usar `srcset` para servir 1x e 2x.
**Revisão:** Confirmado pela medição. Os tamanhos reais (320x320 e 576x1024) foram conferidos com PIL.

### Q165 — Os ícones SVG do Astaroth na página Parcerias são vetores leves de verdade?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/assets/pyxie/icons/astaroth_heart_icon.svg` tem 311 KB, com 1 `data:image` e 1 `<path>`. Os outros 5 SVG (8-70 KB) também embutem imagens. Referências: `public/partnerships.html:1070`, `:1120`, `:1252` sem `?v` e `client/src/pages/Partnerships.jsx:365` com `?v=2.2.3`. A página carrega o bundle React (`partnerships.html:1512`). A medição registrou 1013 KB de imagens em partnerships.
**Achado:** O "ícone" de coração pesa 300 KB e pode baixar duas vezes, por usar dois endereços diferentes. Só a página de parcerias passa de 1 MB de imagens no celular. Por ser uma imagem dentro de um SVG, ela fica borrada quando ampliada.
**Recomendação:** Exportar o ícone como PNG ou WebP pequeno (64-128px) ou redesenhar como SVG vetorial. Usar o mesmo endereço nos dois lugares.
**Revisão:** Confirmado. O tamanho e a imagem embutida foram conferidos. O download duplo depende do React montar o componente nessa página, o que o bundle carregado indica.

### Q166 — O embed do "Baú Misterioso" do evento sazonal mostra a imagem do baú quando o admin não configura uma?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/modules/seasonal/seasonalManager.js:35` `chestImageUrl: 'https://i.imgur.com/link_do_bau_halloween.png'`. O mesmo texto é o padrão em `src/modules/seasonal/dropHandler.js:253` e `src/modules/seasonal/commands/pyInfoEvento.js:86`. Ele vai para `setImage` em `dropHandler.js:263`, `:391` e `seasonalManager.js:939`. Nenhum outro arquivo do repositório define uma imagem real (grep `chestImageUrl`).
**Achado:** A imagem padrão é um link provisório, não uma arte real. Sem configuração no painel, o drop do baú, o `/py-infoevento` e o anúncio saem no Discord sem a imagem principal.
**Recomendação:** Colocar uma arte real do baú no site (ex.: `/assets/pyxie/seasonal/bau.png`) e usá-la como padrão. Se não houver imagem, não chamar `setImage`.
**Revisão:** Rebaixado de alta para média. O efeito depende da configuração salva em produção, que não foi possível ver. Uma imagem quebrada só some do embed: a mensagem continua funcionando.

### Q167 — Na vitrine Shopee da Cringelândia, a foto de cada produto corresponde ao produto anunciado?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/cringelandia.html:1775` `<img src="/assets/pyxie/pyxie_mascot.png" alt="Abafador de Ruído Sensorial Confortável">`; `:1789`, `:1803` e `:1817` fazem o mesmo. A lista dinâmica (`:2776-2788`) só troca os cards se `/api/showcase` responder; item sem foto também cai na mascote (`:2788`). Captura: `/tmp/aud-imagens-icones-assets/shopee-360.png`.
**Achado:** Os cards reserva mostram a mascote no lugar do produto, junto com preço e botão de compra. Eles aparecem enquanto a página carrega, quando a API falha ou quando o item não tem foto. O comprador não vê o que está comprando, e o alt descreve um produto que não aparece.
**Recomendação:** Usar a foto real de cada produto. Sem foto, mostrar um card neutro escrito "imagem indisponível", sem a mascote, com alt fiel ao que aparece.
**Revisão:** Rebaixado de alta para média. Com a vitrine configurada e a API no ar, os cards reserva são trocados pelos reais. O problema fica restrito a falha, carregamento e item sem foto.

### Q168 — O menu do topo da página Transparência cabe na tela do celular e do tablet?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** Medição: `transparencia.html` com scrollWidth de 770 nas janelas de 360 e 768px. `public/transparencia.html:160-164` `.nav-links { display: flex; gap: 18px; }` sem quebra de linha. O menu tem 8 links e o botão de idioma (`:356-368`). O único `@media (max-width: 768px)` (`:336`) só desliga o blur. Captura `/tmp/aud-imagens-icones-assets/transp-360.png`: "Pyxie" encosta em "Home" e o menu sai da tela. `tarot.html` passa 1px (361 em 360).
**Achado:** No celular e no tablet, a página de prestação de contas das doações rola para o lado. Vários links e o botão de idioma ficam fora da tela.
**Recomendação:** No `@media` até 768px, deixar o menu quebrar linha (`flex-wrap`) ou trocar por um botão de menu como nas outras páginas. Revisar o 1px a mais no tarô.
**Revisão:** Confirmado, mas rebaixado de alta para média. O conteúdo principal cabe na tela e pode ser lido. Só o menu transborda.

### Q169 — As demais páginas públicas têm rolagem lateral ou imagens locais quebradas em 360, 768 e 1280px?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `/tmp/aud-imagens-icones-assets/result.json`: scrollWidth igual à largura em index, wiki, bonus, museum, partnerships, mercado, passe, planos, terms, 404, u, widget e cringelandia, nas 3 larguras. Broken = 0 e sem alt = 0 em todas. As falhas são só `404 /api/*`, porque o teste rodou sem backend.
**Achado:** Nessas páginas não há rolagem lateral nem imagem local quebrada.
**Recomendação:** Manter assim. Repetir a medição a cada mudança de layout, incluindo a Transparência depois de corrigida.
**Revisão:** Confirmado por amostragem no `result.json`.

### Q170 — Os textos alternativos (alt) das imagens e ícones ajudam quem usa leitor de tela, em português?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `public/index.html:2542`, `:2546`, `:2550`, `:2557` usam `alt="career"`, `"tarot"`, `"coin"`, `"wings"`. `public/partnerships.html:1065`, `:1070` usam `alt="gem"` e `alt="heart"`. `public/tarot.html:824` monta o alt com `orientation`, que vale `'UPRIGHT'` ou `'REVERSED'` (`:747`), mesmo havendo tradução em `:712`.
**Achado:** Toda imagem tem alt, mas vários ícones de enfeite são lidos em inglês ("coin Moedas"). Na carta do tarô, a pessoa ouve "UPRIGHT" em vez de "em pé" ou "invertida".
**Recomendação:** Usar `alt=""` nos ícones que só enfeitam um texto já escrito. No alt da carta, usar a orientação traduzida.
**Revisão:** Confirmado.

### Q171 — A imagem da carta sorteada na página do Tarô depende do domínio de produção?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `public/tarot.html:822` `` const imgUrl = `https://pyxie.com.br/api/tarot/card-image?...` ``. A CSP permite imagens de qualquer `https:` (`server.js:285`, `img-src 'self' data: blob: https:`). Antes do sorteio, `tarot.html:627` usa `pyxie_mascot.png` com `alt="Carta de Tarot"`, na face que fica escondida atrás do verso (`:620-624`).
**Achado:** Em produção, o visitante não é afetado, porque o domínio é o mesmo. Em teste local ou em outro domínio, a carta vem do servidor oficial, e uma mudança local não aparece. O leitor de tela pode anunciar "Carta de Tarot" para a imagem escondida da mascote.
**Recomendação:** Usar endereço relativo (`/api/tarot/card-image?...`). Na face escondida, usar `alt=""` ou o verso real da carta.
**Revisão:** Rebaixado de PROBLEMA/média. A CSP aceita o endereço, e o visitante em produção vê a carta normalmente. O efeito fica restrito a ambientes de teste.

### Q172 — Favicons, ícone da Apple e manifest estão completos e presentes em todas as páginas?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** Existem `public/favicon.ico`, os PNG 48, 96, 192 e 512 e `apple-touch-icon.png`. `public/planos.html` e `public/planos.en.html` não citam icon, manifest nem apple-touch (grep = 0). `public/site.webmanifest` não tem `start_url`, `description`, `lang` nem ícone `maskable`. `favicon-512x512.png` tem 307 KB. Imagens sem hash no nome recebem `max-age=604800, immutable` (`server.js:417-418`, `:429-436`).
**Achado:** Na página de Planos, a aba ainda mostra o ícone, porque o navegador busca `/favicon.ico` sozinho. Mas, ao salvar a página na tela inicial, o celular não acha o ícone Apple nem o manifest. No Android, o ícone pode sair cortado por não ter versão maskable. Se trocarem uma arte mantendo o nome do arquivo, quem já visitou vê a antiga por até 7 dias.
**Recomendação:** Copiar o bloco de favicons para `planos.html` e `planos.en.html`. Completar o manifest. Comprimir o PNG 512. Ao trocar uma arte, mudar o nome do arquivo.
**Revisão:** Confirmado, com ajuste no achado: a aba não fica sem ícone, porque o navegador busca `/favicon.ico` sozinho.

### Q173 — O painel do dono usa o mesmo ícone de aba e as mesmas fontes do site?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/dashboard.html:11` `<link rel="icon" href="https://cdn.discordapp.com/emojis/1548443951596306552.webp">` e `:8-10` com fontes de `fonts.googleapis.com`. O mesmo vale para o build `public/dist/dashboard/dashboard.html`. O site usa `/favicon.ico` e `/css/fonts.css` local.
**Achado:** No painel, a aba mostra outro ícone (a fada do Discord), e as fontes vêm do Google. Se o CDN do Discord falhar, a aba fica sem ícone. Carregar fontes do Google envia o IP de quem usa o painel a terceiros.
**Recomendação:** Em `client/dashboard.html`, usar os favicons do site e o `/css/fonts.css` local. Depois, gerar o build de novo.
**Revisão:** Confirmado no arquivo-fonte e no build.

### Q174 — Os títulos da Wiki e da página de Planos aparecem na fonte que o design pede?

**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** `public/wiki.html:125` `--font-title: 'Fredoka', sans-serif;`, mas `public/css/fonts.css` só declara Cinzel, JetBrains Mono, Outfit e Plus Jakarta Sans. `public/planos.html:34`, `:38` pedem `'Outfit'` e `'Cinzel'`, mas a página não carrega `fonts.css` (grep = 0). A medição registrou 0 KB de fontes em planos.
**Achado:** Os títulos da Wiki e todo o texto de Planos aparecem na fonte padrão do aparelho. A página de venda e a Wiki ficam com cara diferente do resto do site.
**Recomendação:** Incluir `<link rel="stylesheet" href="/css/fonts.css">` em `planos.html` e `planos.en.html`. Na Wiki, trocar `'Fredoka'` por Outfit ou Cinzel, ou adicionar a Fredoka ao `fonts.css`.
**Revisão:** Confirmado.

### Q175 — As fontes do site e do bot são baixadas uma vez só, e todas são usadas?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** md5 em `public/assets/fonts`: dois grupos de 6 arquivos Outfit idênticos e três grupos de 5 Plus Jakarta idênticos. `public/css/fonts.css:40-59` aponta cada peso para outro nome de arquivo. Medição: `index.html` baixou 298-325 KB de fontes. `assets/fonts/Fredoka-Bold.ttf` e `CormorantGaramond-600.ttf` não são carregadas: o bot só lê Twemoji e DejaVu (`src/utils/canvasFonts.js:20-22`) e Quicksand, Cinzel e DejaVu (`src/services/profileCardGenerator.js:31-35`).
**Achado:** Cada peso aponta para um nome de arquivo diferente, então o navegador baixa a mesma fonte várias vezes. Isso deixa a primeira visita bem mais pesada. Duas fontes do bot estão sobrando.
**Recomendação:** No `fonts.css`, declarar cada família uma vez, com `font-weight` em faixa (ex.: `400 900`), apontando para um único arquivo. Apagar as cópias. Remover Fredoka e Cormorant se não forem usadas.
**Revisão:** Confirmado. Conferido também que o bot não lê a pasta de fontes inteira: ele carrega só arquivos com nome fixo.

### Q176 — O emoji proibido do portal do Minecraft (AGENTS §7) está bloqueado em todas as listas de emoji?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** Bloqueado em `src/services/messageStudio.js:301`, `src/utils/appEmojis.js:266`, `src/utils/embedRegistry.js:113`, `:339`, `:411`, com teste em `tests/messageStudio.test.js:81`. Sem filtro: `src/modules/seasonal/seasonalManager.js:225-237` (`getSimplifiedAppEmojis`) e o resolvedor `resolveSeasonalEmojiObject` (`:286-297`), que aceita qualquer ID do catálogo. O mesmo vale para `src/utils/themeEmojis.js:18-30`. Nenhuma tela usa `GET /api/admin/sazonal/emojis` (grep em `client/src` e `public` = 0).
**Achado:** O painel Sazonal usa um campo de texto livre para a moeda e as iscas (`client/src/dashboard/Seasonal.jsx:169`). Se o admin digitar o ID do portal, o evento usa o emoji sem bloqueio. Ele não aparece numa lista visível, como dizia o auditor.
**Recomendação:** Criar uma função única de "emoji permitido" e usá-la em `resolveSeasonalEmojiObject`, em `getSimplifiedAppEmojis` e em `themeEmojis`. Adicionar um teste.
**Revisão:** Confirmado com ajuste. A rota de lista não é consumida por nenhuma tela. A brecha real é o resolvedor sazonal aceitar o ID digitado.

### Q177 — O crédito dos artistas das artes da Pyxie aparece no site e nos embeds, como o registro de artes promete?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/services/pyxieAssets.js:1-3` diz que "o site e os embeds leem o crédito", mas `creditFor` (`:77`) só aparece na definição e no `module.exports` (`:83`). Grep em `src`, `client/src`, `public` e `server.js`: nenhum uso. `src/data/pyxieAssets.json` tem 0 artes marcadas.
**Achado:** O painel deixa marcar a arte como humana ou IA e dar crédito ao artista, mas essa informação nunca chega ao público. A promessa de transparência sobre arte humana fica sem efeito.
**Recomendação:** Mostrar "Arte: Nome" (com link) no rodapé dos embeds que usam a arte e nas páginas onde ela aparece. Marcar no painel as artes principais (mascote, stickers, banner).
**Revisão:** Confirmado.

### Q178 — A imagem de prévia ao compartilhar as páginas Bônus e Cringelândia (og:image) tem o formato e as medidas que declara?

**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** `public/bonus.html:44-46` e `public/cringelandia.html:30-32` usam `pyxie_mascot.png` (576x1024, vertical) e declaram `og:image:width 1200` e `height 630`, com `twitter:card summary_large_image` (`bonus.html:53`, `cringelandia.html:40`). `public/index.html:54` `og:image:alt "Pyxie Discord Bot Avatar & Mascot"` em inglês.
**Achado:** No WhatsApp, no Discord e no X, a prévia dessas páginas mostra a mascote em pé cortada num retângulo deitado. Na página inicial, a descrição da prévia está em inglês.
**Recomendação:** Criar banners 1200x630 próprios para Bônus e Cringelândia (ou usar `og_banner_hd`). Escrever `og:image:alt` em português.
**Revisão:** Confirmado. As medidas reais foram conferidas com PIL.

### Q179 — Existem imagens publicadas que nenhuma página, embed ou comando usa?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** Grep por nome em `src`, `client/src`, `public/*.html`, `public/js`, `scripts`, `index.js` e `server.js` = 0 para `pyxie_pose_running`, `pyxie_gear`, `pyxie_logo`, `pyxie_simplelogo`, `pyxie_tinyframe`, `pyxie_full.jpg` e `extrasAssetsSheets`. Elas só aparecem na listagem do painel (`src/services/pyxieAssets.js:44`). Ressalva: `astaroth_potion` é usado como apelido de emoji (`src/utils/appEmojis.js:173`), então a contagem de 30 sem uso está um pouco inflada.
**Achado:** Várias artes (poses, itens, logos, molduras) estão publicadas, mas o visitante nunca as vê. Ao mesmo tempo, o site usa emojis do Discord ou a mascote grande onde essas artes caberiam.
**Recomendação:** Decidir arte por arte: usar (ex.: poses na Wiki, itens no Mercado e no Passe) ou mover para um acervo fora de `public/`. As folhas de sprites (`extrasAssetsSheets`) não devem ficar públicas.
**Revisão:** Confirmado por amostragem, com a ressalva sobre `astaroth_potion`.

### Q180 — O campo "Imagem do baú" no painel Sazonal valida o endereço e mostra prévia antes de salvar?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/dashboard/Seasonal.jsx:165` `<input value={cfg.assets?.chestImageUrl || ''} …>` sem `type="url"`, sem placeholder e sem prévia. `POST /api/admin/sazonal/config` (`src/modules/seasonal/seasonalManager.js:1171-1181`) chama `saveConfig(updates)`, que só junta os dados (`:147-169`) sem checar o endereço. Campo vazio cai no link provisório do Q166 (`dropHandler.js:253`).
**Achado:** O admin pode colar um link errado ou um link de página em vez de imagem. Ele só descobre quando o baú cai no servidor sem imagem. Se deixar vazio, volta o link provisório. Um texto que não é URL pode fazer o Discord recusar o embed.
**Recomendação:** Validar no painel e no servidor (começar com `https://` e terminar em png, jpg, gif ou webp). Mostrar uma miniatura ao lado do campo e um exemplo no placeholder.
**Revisão:** Confirmado. Não há validação nem no painel nem no servidor.
