# 05. Bonus, Parcerias, Museu, Tarot, Widget, Perfil

> Nota da área: 4/10 · Nenhuma página escorrega para o lado, mas a área tem duas falhas sérias de segurança (código injetável em /u/ e no Museu; segredo reserva e cupom sem limite no bônus) e um widget que não funciona fora do site. No uso, faltam retorno claro (valor ganho, erros, carregando), idioma coerente e honestidade (artistas inventados, links de afiliado sem aviso).

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q081 | Rolagem horizontal em 360/768/1280px | ✅ OK | info |
| Q082 | Botão "Resgatar" visível no celular | 🔴 PROBLEMA | média |
| Q083 | Bônus mostra quanto o usuário ganhou | 🔴 PROBLEMA | média |
| Q084 | Erros do resgate na página e no idioma certo | 🔴 PROBLEMA | média |
| Q085 | Bônus/Museu/Perfil respeitam o idioma | 🔴 PROBLEMA | média |
| Q086 | Título "Globo 3D" do Museu bate com a página | 🔴 PROBLEMA | média |
| Q087 | Museu tem "carregando" e "falha" separados | 🔴 PROBLEMA | média |
| Q088 | Link /museu?art=ID abre obra fora da 1ª página | 🔴 PROBLEMA | média |
| Q089 | Compartilhar no celular, ESC e rótulos de ícones | 🟡 PARCIAL | baixa |
| Q090 | Cena 3D pesa no celular | 🔴 PROBLEMA | média |
| Q091 | Cena 3D mostra obras reais quando a API falha | 🔴 PROBLEMA | média |
| Q092 | Vitrine Shopee avisa afiliado e mostra preço confiável | 🔴 PROBLEMA | média |
| Q093 | Contadores e botão "Impulsionar" em Parcerias | 🟡 PARCIAL | baixa |
| Q094 | HTML antigo (bonus/partnerships/museum) roda à toa | 🔴 PROBLEMA | média |
| Q095 | Tarot com mesmo cabeçalho/rodapé e bom no celular | 🟡 PARCIAL | média |
| Q096 | Tarot: "toque para revelar" acontece mesmo | 🔴 PROBLEMA | média |
| Q097 | Widget funciona em outro site e mostra dado real | 🔴 PROBLEMA | alta |
| Q098 | Perfil /u/ mostra identidade e trata erros | 🟡 PARCIAL | média |
| Q099 | Texto do Museu e ID do Perfil entram seguros no HTML | 🔴 PROBLEMA | crítica |
| Q100 | Bônus web e proxy de imagens protegidos contra abuso | 🔴 PROBLEMA | alta |

---

### Q081 — As páginas da área criam rolagem horizontal no celular (360px), tablet (768px) ou desktop (1280px)?
- **Veredito:** ✅ OK
- **Severidade:** info
- **Evidência:** medição em `/tmp/aud-paginas-especiais/result.json`: `sw == vw` em todas as telas (ex.: `"page": "bonus", "w": 360, "sw": 360`). Os itens "largos" são as auroras do fundo e as fileiras de filtros com `overflow-x-auto`.
- **Achado:** Nenhuma página faz a tela inteira escorregar para o lado. As fileiras de categorias (Parcerias) e de artistas (Museu) passam da borda, mas rolam dentro da própria faixa.
- **Recomendação:** Manter. Para o usuário perceber que a faixa rola, pôr um degradê na borda direita das fileiras de filtros.
- **Revisão:** Confirmado pela leitura do `result.json`.

### Q082 — No /bonus aberto pelo celular, o botão "Resgatar" aparece sem rolar a tela?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média (era alta)
- **Evidência:** `client/src/pages/Bonus.jsx:143-200` (selo, `h1`, subtítulo, painel `p-8`, mascote `w-20 h-20`, balão, anel `w-44 h-44`) vêm antes do botão em `Bonus.jsx:259`. Captura `/tmp/aud-paginas-especiais/bonus-360.png`: a tela termina no anel do contador; o botão não aparece.
- **Achado:** No celular o usuário vê o contador, mas o botão de resgate fica abaixo da dobra. Ao zerar, o balão diz "Clique no botão abaixo", então ele tende a rolar, mas o momento de recompensa perde força.
- **Recomendação:** No celular, encurtar o topo (tirar o selo "Canalização...", diminuir mascote e anel) ou deixar o botão fixo no rodapé da tela. Ao zerar o tempo, rolar sozinho até o botão.
- **Revisão:** Rebaixado de alta para média: o balão do mascote (`Bonus.jsx:107`) já orienta "Clique no botão abaixo", então o usuário não fica sem pista.

### Q083 — A tela do Bônus mostra quanto o usuário ganhou (75 no diário, 25 + giro no biscoito)?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `Bonus.jsx:9` `const [claimResult, setClaimResult]` só é gravado em `Bonus.jsx:126` e nunca exibido. `Bonus.jsx:255` mostra fixo `{t('bonus.claimed')}`. `Bonus.jsx:96` balão fixo "Moedinhas entregues no seu cofre...". O servidor devolve `message` e `coinsAwarded` em `src/services/bonusTimer.js:131-176`.
- **Achado:** Após o resgate aparece só "Recompensa reivindicada com sucesso!". O valor e o giro extra do biscoito somem. O mascote fala sempre de "moedinhas", mesmo no biscoito.
- **Recomendação:** Mostrar a mensagem e o valor que o servidor devolve (+75, ou +25 e giro extra). Mudar o balão do mascote conforme o tipo de bônus.
- **Revisão:** Confirmado no código.

### Q084 — Os erros do resgate aparecem dentro da página e no idioma certo?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `Bonus.jsx:112` `alert('Token de bônus não informado na URL...')`, `Bonus.jsx:129` `alert(data.error || 'Falha ao reivindicar bônus.')`, `Bonus.jsx:133` `alert('Erro na requisição com o servidor.')`, `Bonus.jsx:248` aviso sem token fixo em PT. No servidor, `bonusTimer.js:70` e `:74` ("Token inválido", "Este bônus já foi resgatado anteriormente!") só em PT.
- **Achado:** Os erros saem numa janela do navegador, fora do visual da Pyxie, e em português mesmo para quem usa inglês. "Erro na requisição com o servidor" não diz o que fazer.
- **Recomendação:** Trocar os `alert` por uma caixa de erro dentro do card, com textos do i18n em PT e EN e um próximo passo ("Gere um novo link com /py-bonus").
- **Revisão:** Confirmado. Ressalva: alguns erros do servidor (expirado, espera de 10s, já resgatado hoje) já vêm em PT/EN (`bonusTimer.js:107-123`, `:150-155`), mas continuam num `alert`.

### Q085 — As telas React (Bônus, Museu, Perfil) respeitam o idioma escolhido?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média (era alta)
- **Evidência:** Captura `bonus-360.png`: h1 "Enchanted Reward Portal" com selo "Canalização de Recompensas Cósmicas" e balão em PT (`Bonus.jsx:148`, `:94-107`). `Museum.jsx:183` "Buscar por obra ou artista...", `:207` "Mural Grid", `:218` "Modo Fórum", `:397` "Nenhuma obra encontrada...". `Profile.jsx:121` "Membro (...)", `:135` "Profissão:", `:139` `toLocaleString('pt-BR')} Moedas`, `:206` "Álbum de Tarot", `:358` "Significado Direto:".
- **Achado:** Quem lê em inglês vê metade da página em inglês e metade em português. Parece inacabado e quebra a regra bilíngue (AGENTS.md item 1).
- **Recomendação:** Passar todos os textos fixos dessas três telas para `t()` com par PT/EN em `client/src/utils/i18n.js`, incluindo balões, botões, rótulos e erros.
- **Revisão:** Confirmado. Rebaixado para média: é problema de acabamento e confiança, não impede o uso.

### Q086 — O título do Museu ("Globo 3D holográfico") bate com o que a página mostra?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/utils/i18n.js:40-41` "Globo das Artes Mágicas da Pyxie" / "Globo 3D holográfico...". `Museum.jsx:167` e `:170` usam essas chaves, mas não importam a cena 3D (só `Home.jsx:17` faz `import('../components/3d/MuseumScene')`).
- **Achado:** A página promete um globo 3D e entrega uma grade de cartões. O visitante espera uma coisa e recebe outra.
- **Recomendação:** No Museu, usar `museum.mobileTitle` / `museum.mobileSubtitle` (já existem, `i18n.js:42-43`) ou criar um título próprio ("Galeria da Comunidade").
- **Revisão:** Confirmado.

### Q087 — O Museu mostra "carregando" e diferencia "sem obras" de "falha ao carregar"?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `Museum.jsx:19-30` não tem estado de carregamento. `Museum.jsx:59` `.catch((err) => console.error(err))`. `Museum.jsx:397` mostra "Nenhuma obra encontrada para esta pesquisa ou artista." sempre que a lista está vazia.
- **Achado:** Enquanto carrega, ou se o servidor falhar, o visitante lê "Nenhuma obra encontrada" e acha que o museu está vazio.
- **Recomendação:** Mostrar esqueleto de cartões ao carregar; mensagem de erro com botão "Tentar de novo" quando a API falhar; "nenhuma obra" só para busca vazia.
- **Revisão:** Confirmado no código.

### Q088 — O link /museu?art=ID abre a obra certa quando ela não está na 1ª página?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `Museum.jsx:51-56` procura `artParam` só dentro de `data.arts` da página carregada. A API só tem `/api/museum/arts` (lista paginada) e `/api/museum/art-image/:id` (`src/modules/museum/museumManager.js:688`, `:703`); não há busca de obra por ID. O servidor monta a prévia da obra pelo ID (`src/utils/seoRenderer.js:431-455`).
- **Achado:** Quem recebe link de uma obra antiga cai no museu sem a obra aberta, embora a prévia no Discord/WhatsApp mostre a obra. A promessa do link quebra.
- **Recomendação:** Criar uma rota de obra por ID (ex.: `/api/museum/art/:id`) e abrir a visualização dela quando houver `?art=`.
- **Revisão:** Confirmado.

### Q089 — No celular dá para compartilhar pelo cartão e fechar a obra ampliada com ESC?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa (era média)
- **Evidência:** `Museum.jsx:284` botão Compartilhar com `opacity-0 group-hover:opacity-100`. `Museum.jsx:471` `title="Fechar (ESC)"`, sem `keydown`/`Escape` no arquivo. `grep -c aria-label` = 0 em `Museum.jsx` e `Partnerships.jsx`. Porém `Museum.jsx:461` tem Compartilhar dentro da obra ampliada e `:359` no modo fórum.
- **Achado:** O Compartilhar do cartão some no toque, mas o usuário ainda compartilha pela obra ampliada (tocar no cartão abre ela, `Museum.jsx:262`). No PC, ESC não fecha, apesar da dica. Os botões só com ícone usam `title`, que leitores de tela leem, mas sem tradução.
- **Recomendação:** Fazer o ESC fechar a obra ampliada. Mostrar o Compartilhar sempre em telas de toque. Trocar `title` fixo em PT por `aria-label` bilíngue.
- **Revisão:** Rebaixado para PARCIAL/baixa: existe outro caminho de compartilhar no celular e os botões têm `title`, então não estão "sem nome".

### Q090 — A cena 3D (three.js) pesa no celular mesmo desligada nele?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/dist/assets/MuseumScene-1G9RoolD.js` = 489.460 bytes (`ls -la`). `client/src/pages/Home.jsx:14-24` faz `import()` sempre, via `requestIdleCallback`. `MuseumScene.jsx:90` (`... || isMobile) return;`) só pula o desenho.
- **Achado:** Todo celular que abre a Home baixa ~490 KB de 3D que nunca aparece. Gasta dados móveis e bateria.
- **Recomendação:** Checar largura/toque antes do `import()`; no celular, não baixar a cena e mostrar só o mural 2D.
- **Revisão:** Confirmado. O carregamento já é adiado (bom), mas não evitado no celular.

### Q091 — Quando a API do Museu falha, a cena 3D mostra obras reais?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/components/3d/MuseumScene.jsx:27-56` `defaultArts` com `author: 'Melody Labs'`, `'Cringelândia Art'`, `'Pixel Guild'`; usados em `:66` e `:70` quando o `fetch('/api/museum/arts?limit=12')` vem vazio ou falha.
- **Achado:** Se a API falhar, o "museu da comunidade" mostra artistas que não existem assinando artes oficiais. Engana o visitante e fere a regra "zero mock" (AGENTS.md item 12).
- **Recomendação:** Tirar os autores inventados. Sem obras, mostrar aviso honesto ("O museu está montando o acervo — envie sua arte no Discord") com link do fórum.
- **Revisão:** Confirmado.

### Q092 — A vitrine Shopee avisa que os links são de afiliado e mostra preços confiáveis?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média (era alta)
- **Evidência:** `client/src/components/shopee/ShopeeBentoGrid.jsx:13-14` `preco: 'R$ 55,99'`, `preco_en: '$10.77'` (fixos). Cabeçalho da seção em `:85-97` ("Setup & Lifestyle", `shopee.title`) sem aviso de publicidade. Links `s.shopee.com.br` (`:17`). Mas os preços fixos só entram se `/api/showcase` falhar ou vier vazio (`:55-75`; rota em `server.js:1032`).
- **Achado:** O usuário vê "Achadinhos da Pyxie" sem saber que são links pagos. Isso fere a confiança e pode contrariar regras de publicidade. Os preços fixos (com dólar inventado) só aparecem quando a vitrine do servidor falha.
- **Recomendação:** Pôr selo visível "Publi • link de afiliado" no topo da seção. Na reserva sem API, trocar o preço por "ver preço na Shopee".
- **Revisão:** Rebaixado para média: o preço normal vem do servidor; o problema confirmado é a falta de aviso de afiliado e o preço velho só na reserva.

### Q093 — O mural de Parcerias mostra contadores coerentes e um botão "Impulsionar" claro no celular?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/pages/Partnerships.jsx:243` busca `/api/partnerships?category=`; `:403` mostra `{catalog.length}` e `:411` `{totalBumps}` da lista filtrada. `:219` `<span className="hidden sm:inline">{t('partnerships.bump')}</span>` (no celular só o foguete; há `title` em `:216`).
- **Achado:** Ao trocar de aba, "Parcerias Ativas" cai, como se parceiros sumissem. No celular, o botão de impulsionar é só um foguete.
- **Recomendação:** Calcular os contadores sobre o catálogo completo. No celular, mostrar o texto "Impulsionar" ao lado do foguete.
- **Revisão:** Confirmado.

### Q094 — As páginas estáticas que o React substitui carregam peso e scripts à toa?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** Tamanhos: `public/bonus.html` 67.860 B, `public/partnerships.html` 53.175 B, `public/museum.html` 30.275 B. Em `partnerships.html:1507` `if (!window.__PYXIE_REACT_ACTIVE__) { applyLang(); load(); }` roda antes do módulo `partnerships.html:1512` (`type="module"`, que executa depois), e a flag só é ligada em `client/src/main.jsx:9`. Logo, `load()` sempre roda e escreve em `$('statPartnersCount')` (`:1475`), que o React apaga.
- **Achado:** O visitante baixa duas versões da página; a antiga roda por trás, repete a chamada à API e gera erro no console. Fica mais lento no celular e confunde quem investiga bugs.
- **Recomendação:** Deixar nesses HTML só o cabeçalho de SEO e um esqueleto leve. Tirar o `<style>` e o `<script>` antigos.
- **Revisão:** Confirmado pela ordem de execução dos scripts.

### Q095 — O Tarot usa o mesmo cabeçalho e rodapé do site e cabe bem no celular?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** média
- **Evidência:** `public/tarot.html` não carrega `/dist/assets/index.js` (grep vazio) e tem cabeçalho próprio (`tarot.html:598` `class="btn-lang"`). `result.json` (tarot, 360px): `smallTargets` "Página Principal 101x17", "Museu 42x17", "Feed RSS 62x17".
- **Achado:** O Tarot parece outro site: menu, fonte e rodapé diferentes. No celular, os links do rodapé têm 17px de altura, pequenos para o dedo.
- **Recomendação:** Usar a Navbar e o Footer do React ou copiar o padrão (menu hambúrguer). Dar aos links do rodapé área de toque de ~44px.
- **Revisão:** Confirmado. A página não quebra no celular, por isso fica PARCIAL.

### Q096 — No Tarot, o "toque na carta misteriosa para revelar" acontece de verdade?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `tarot.html:613` "toque na carta misteriosa abaixo para revelar". `tarot.html:905-907` já mostra ao carregar `todayIndex = Math.floor(Date.now() / (1000*60*60*24)) % allTarotCards.length` sempre `'UPRIGHT'`; `renderCardDetails` adiciona `revealed` (`:826`). `tarot.html:877` `if (!allTarotCards || allTarotCards.length === 0) return;` sem aviso.
- **Achado:** A carta já vem aberta, igual para todo mundo no dia e sempre na posição direta. Se as cartas não carregarem, tocar não faz nada e nada é avisado.
- **Recomendação:** Começar com a carta virada e revelar no toque. Se for "carta do dia", dizer isso no texto. Mostrar erro amigável se as cartas não carregarem.
- **Revisão:** Confirmado.

### Q097 — O widget (widget.js → /widget/card) funciona em outro site e mostra informação real?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `server.js:280` `res.setHeader('X-Frame-Options', 'SAMEORIGIN')` para todas as rotas; a CSP (`server.js:285`) não tem `frame-ancestors`; nenhum `removeHeader` no projeto. `server.js:963` serve `/widget/card`. `public/widget.js:6` cria iframe para outro site. `public/widget.html:131` "Online no Discord" fixo, `:134` "22 Carreiras", `:138` "22 Profissões"; `src/services/professions.js` exporta 28 profissões (medido com `node`). `widget.html` não lê `lang` (grep só acha `lang="pt-BR"`).
- **Achado:** Quando um parceiro cola o widget no site dele, o navegador bloqueia a moldura e aparece um quadro vazio. Mesmo funcionando, mostraria "online" sem checar, número de profissões errado e sempre em português.
- **Recomendação:** Na rota `/widget/card`, liberar a moldura (sem `X-Frame-Options`, com `frame-ancestors *`). Respeitar `?lang=en`. Puxar status e números de `/api/stats`.
- **Revisão:** Confirmado; não há outro ponto que libere o embed.

### Q098 — O Perfil público (/u/ID) mostra a identidade do membro e trata bem erros?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** média
- **Evidência:** `client/src/pages/Profile.jsx:107` avatar fixo `sticker_smile.png`; `:113-114` selo `✓` verde fixo; `:121` `Membro ({resolvedUserId.slice(-4)})`. `Profile.jsx:13` `loading` começa `true` e `:20` `if (!resolvedUserId) return;` não o desliga (fica em "Sintonizando perfil cósmico...", `:67`). `Profile.jsx:267` usa `card.name` sempre.
- **Achado:** O perfil, feito para compartilhar, não mostra quem é a pessoa: todos têm o mesmo avatar e nome genérico. O "✓" verde sugere "verificado" sem motivo. Sem ID, a tela gira para sempre.
- **Recomendação:** Mostrar nome e avatar do Discord (ou apelido escolhido). Tirar o "✓". Sem ID, mostrar "Perfil não encontrado". Usar o nome em inglês da carta no modo EN.
- **Revisão:** Confirmado. A rota `/u/:userId` do servidor exige ID, então o caso "sem ID" é raro; por isso segue PARCIAL.

### Q099 — O texto das obras (Museu) e o ID na URL do Perfil entram no HTML do servidor de forma segura?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** crítica
- **Evidência:** `src/utils/seoRenderer.js:442-450` usa `art.description.slice(0, 50)` direto em `<title>` e nas metas, sem escape; `description` vem de `msg.content` do fórum (`src/modules/museum/museumManager.js:186`). `server.js:805-831`: `userId` de `req.params` sem validação vai para `canonical` e `og:url` (`const canonical = \`https://pyxie.com.br/u/${userId}\``); `getUserAccount` não valida o ID (`src/services/economy.js:235-238`). Só a API `/api/profile` valida `/^\d{15,25}$/` (`server.js:845`). CSP com `script-src 'self' 'unsafe-inline'` (`server.js:285`).
- **Achado:** Um link /u/ montado com aspas e script faz código rodar no site pyxie.com.br para quem clicar. Um membro que poste uma "arte" com código nos primeiros 50 caracteres faz o mesmo para quem abrir /museu?art=ID. Os cookies de sessão são HttpOnly (não dá para copiá-los), mas o código pode agir em nome de quem está logado, inclusive no painel, que fica no mesmo domínio.
- **Recomendação:** Escapar `& < > " '` antes de pôr textos no HTML nas duas rotas. Em `/u/`, aceitar só IDs numéricos (mesma regra da API) e responder 404 nos outros. Planejar tirar `'unsafe-inline'` da CSP.
- **Revisão:** Confirmado. Ajustado o texto: os cookies têm `HttpOnly` (`src/services/accountSessions.js:99`, `src/services/panelSessions.js:114`), então não há "roubo de cookie", mas o risco de ações em nome do usuário mantém a severidade.

### Q100 — O resgate de bônus web e o proxy de imagens das Parcerias estão protegidos contra abuso?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `src/services/bonusTimer.js:5` usa uma chave reserva fixa no código quando falta a variável `BONUS_SECRET`; ela não está em `.env.example` nem é exigida na partida (grep). `bonusTimer.js:131-146` paga `cookie_bonus` (+25 e giro) sem limite diário; `src/commands/biscoito.js:21` gera um link novo a cada `/py-cookie` em espera. `bonusTimer.js:11`, `:125-128`: tokens usados ficam só na memória e são apagados ao passar de 5000 ou reiniciar. `src/modules/partnerships/partnershipManager.js:960-1006`: proxy aceita qualquer URL, bloqueia só alguns prefixos (falta `172.17-31`, IPv6 além de `::1`, domínios que apontam para IP interno), segue redirecionamentos, repassa o código de status (`:995`) e aceita `image/svg+xml`.
- **Achado:** Sem `BONUS_SECRET` no servidor, qualquer pessoa forja tokens e gera moedas. Mesmo com ela, repetir `/py-cookie` em espera rende +25 moedas por link, sem teto. O proxy pode sondar a rede interna e servir SVG de fora pelo domínio do site.
- **Recomendação:** Recusar iniciar sem `BONUS_SECRET`. Limitar o bônus do biscoito por dia e guardar tokens usados em disco/banco. No proxy, aceitar só domínios de imagem conhecidos, bloquear SVG, não seguir redirecionamentos e checar o IP resolvido.
- **Revisão:** Confirmado e reforçado: a falta de teto no biscoito vale mesmo com o segredo configurado. Não foi possível verificar se `BONUS_SECRET` está definida em produção.
