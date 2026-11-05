# 01. Site público: Home, Navbar, Footer, hero

> Nota da área: 5/10 · A Home é bonita, não escorrega para o lado e o botão principal aparece logo na primeira tela do celular. Mas mostra dados inventados (artistas fictícios, "99.9%", selos "Online" fixos, comandos que não existem), ignora o idioma da URL e expõe IDs do Discord de usuários em `/api/stats`. O HTML antigo segue rodando por baixo do React, gastando bateria e mostrando outro menu.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q001 | Rolagem lateral em 360/768/1280px | ✅ OK | info |
| Q002 | Abas do simulador cabem inteiras | 🔴 PROBLEMA | média |
| Q003 | Grade de 5 Pilares equilibrada | 🟡 PARCIAL | baixa |
| Q004 | Museu no celular sem cortes | 🔴 PROBLEMA | média |
| Q005 | Links /#pilares e /#comandos caem no lugar | 🔴 PROBLEMA | média |
| Q006 | Carrossel do Museu sem artistas falsos | 🔴 PROBLEMA | alta |
| Q007 | Selo "99.9%" vem de dado real | 🔴 PROBLEMA | média |
| Q008 | Selos "Online" refletem o status real | 🔴 PROBLEMA | média |
| Q009 | Comandos do simulador existem | 🔴 PROBLEMA | média |
| Q010 | Idioma segue a URL e se mantém | 🔴 PROBLEMA | média |
| Q011 | Nomes dos botões coerentes | 🟡 PARCIAL | baixa |
| Q012 | Botão principal visível sem rolar (360px) | ✅ OK | info |
| Q013 | Footer leva à Privacidade | 🔴 PROBLEMA | média |
| Q014 | Ícones da Navbar consistentes | 🟡 PARCIAL | baixa |
| Q015 | Peso e alt das imagens | 🟡 PARCIAL | média |
| Q016 | Script do HTML antigo para de rodar | 🔴 PROBLEMA | média |
| Q017 | Viabilidade de duas Homes | 🔴 PROBLEMA | média |
| Q018 | Respeita "reduzir movimento" | 🟡 PARCIAL | média |
| Q019 | Textos pequenos e links do rodapé legíveis | 🟡 PARCIAL | baixa |
| Q020 | `/api/stats` expõe dados de usuários | 🔴 PROBLEMA | alta |

---

### Q001 — A Home cria rolagem lateral em 360, 768 ou 1280px?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `client/src/App.jsx:117` usa `overflow-x-hidden` no contêiner raiz. Medição Playwright (`/tmp/aud-site-home/measure.js`): `scrollWidth` igual a `innerWidth` nas três larguras.
**Achado:** Nenhuma largura testada deixa a página escorregar para o lado. O celular rola só para baixo.
**Recomendação:** Manter. Ao criar seções novas, testar em 360px antes de publicar.
**Revisão:** Confirmado por amostragem (classe presente na linha citada). Ressalva: o `overflow-x-hidden` esconde sintomas; o botão do Museu (Q004) encosta na borda sem gerar rolagem.

### Q002 — As três abas do simulador do Hero aparecem inteiras?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/hero/TerminalSimulator.jsx:49` barra com `overflow-x-auto`; rótulos longos em `client/src/utils/i18n.js:23-25` (`'/py-work (Expediente)'`, `'/py-casamento (Amor)'`, `'/py-tarot (Oráculo)'`). Captura `/tmp/aud-site-home/home-1280.png` mostra "/py-tarot (O" cortado no desktop.
**Achado:** A aba do Tarot fica cortada até no computador. No celular só cabe aba e meia, e a barra de rolagem some (no celular ela é invisível). O visitante pode nem descobrir a aba do Tarot.
**Recomendação:** Encurtar os rótulos ("Trabalho", "Casamento", "Tarot") ou quebrar as abas em duas linhas. Elas precisam caber em 320px.
**Revisão:** Confirmado no código e na captura. No desktop existe uma barra fina de 8px (`client/src/index.css:67-70`), mas é discreta; a severidade média se mantém pelo celular.

### Q003 — A grade de 5 cards dos Pilares fica equilibrada?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/components/hero/PillarsSection.jsx:64` `grid md:grid-cols-2 lg:grid-cols-3` com 5 itens.
**Achado:** No desktop fica 3+2 e no tablet 2+2+1, com um buraco na última linha. Parece que falta um card.
**Recomendação:** Centralizar a última linha (flex-wrap com `justify-center`) ou usar 5 colunas compactas no desktop.
**Revisão:** Confirmado. Grade de 3 colunas com 5 itens sempre deixa sobra. Problema estético, severidade baixa mantida.

### Q004 — No celular, o Museu mostra o botão e o crédito do artista sem cortes?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/3d/MuseumScene.jsx:485` `<div className="mt-8 text-center">` sem margem lateral, e o texto do botão é longo (`i18n.js:44` "Explorar Galeria Completa da Comunidade ➔"). `MuseumScene.jsx:451` caixa de 380px, mas os cards têm `h-[352px]` + `py-8` (`:457`, `:462`) = 416px; a sombra `h-28` (`:480`) cai sobre o nome e a legenda. Captura `/tmp/aud-site-home/museu-360.png`.
**Achado:** No celular o botão do Museu cola nas duas bordas da tela e parece quebrado. O nome do artista fica sob uma sombra e aparece apagado, justo o crédito que o Museu promete.
**Recomendação:** Pôr `px-4` no contêiner do botão e encurtar o texto ("Ver galeria completa"). Ajustar a altura da caixa ao card ou reduzir a sombra para não cobrir o texto.
**Revisão:** Confirmado no código e na captura. Ajuste: o nome do artista continua legível, só apagado (não "quase some").

### Q005 — Quem chega por "Recursos" (/#pilares) ou "Comandos" (/#comandos) cai no lugar certo?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/pages/Home.jsx:36` reserva só `h-64` (256px) enquanto a cena carrega; `Home.jsx:23` carrega a cena depois (idle, até 2,5s); a cena final tem `h-[380px] sm:h-[480px] lg:h-[540px]` mais título e botão (`MuseumScene.jsx:451`). Não há `scroll-margin`/`scroll-padding` no projeto (busca vazia em `client/src` e `public/`), e a Navbar é `sticky` com 64px (`Navbar.jsx:89-90`).
**Achado:** A cena do Museu chega depois e empurra tudo para baixo. Quem clicou em "Recursos" vindo de outra página vê outra seção ou o título escondido atrás do menu.
**Recomendação:** Reservar no espaço vazio a altura real da seção do Museu e adicionar `scroll-margin-top` de ~72px nas seções com âncora.
**Revisão:** Confirmado. Linha corrigida (era `Home.jsx:32`, o certo é `:36`). Os números de CLS vêm da medição do auditor, não refeita aqui.

### Q006 — Sem artes reais, o carrossel da Home mostra artistas reais?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/components/3d/MuseumScene.jsx:27-55` `defaultArts` com autores "Pyxie Core", "Melody Labs", "Cringelândia Art", "Pixel Guild" e `createdAt: new Date()`; `:63-70` usa essa lista se a API falhar ou vier vazia. A legenda "Astaroth no Portal Arcano" vai sobre `pyxie_space_banner.jpg` (`:31-32`). Captura `museu-360.png` mostra "@Pyxie Core".
**Achado:** O site inventa artistas e legendas que não batem com a imagem. Isso contradiz a promessa de "crédito para cada artista" e a regra "Zero mock" do AGENTS.md §12.
**Recomendação:** Sem artes reais, mostrar um estado vazio honesto ("O Mural ainda está sendo pintado. Envie a sua arte!") com botão para o Museu. Nunca usar autores fictícios.
**Revisão:** Confirmado. Não há outro fallback; o código troca para a lista falsa em qualquer falha.

### Q007 — O selo "99.9%" do Hero vem de dado real?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/App.jsx:26-30` valores iniciais fixos (`uptime: '99.9%'`); `App.jsx:66` só atualiza se `data.success`, mas `server.js:1735-1739` devolve `{ ...stats, uptime }` sem `success`. Logo o valor nunca muda. `HeroSection.jsx:47` mostra `stats?.uptime` sem rótulo.
**Achado:** O "99.9%" é sempre o mesmo número inventado e sem rótulo; o visitante nem sabe o que ele mede. Se o bot cair, o site continua prometendo 99.9%.
**Recomendação:** Tirar o selo ou ligá-lo a um dado real com rótulo claro ("No ar há 12 dias"). Corrigir o teste de `success` e apagar os números fixos 18 e 2450.
**Revisão:** Confirmado, mas rebaixado de alta para média: os números 18 e 2450 não aparecem em nenhuma tela (só `stats.uptime` é usado, `HeroSection.jsx:47` é o único uso). O dano visível é um selo.

### Q008 — Os indicadores "Online" refletem o status real do bot?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/layout/Navbar.jsx:101` bolinha verde pulsando e `:107-108` texto fixo "v14 • Online"; `client/src/utils/i18n.js:12` `'hero.badge': 'Online & Operacional • Discord.js v14'`; `TerminalSimulator.jsx:44` "READY". O React só chama `/api/status` como plano B se `/api/stats` falhar (`App.jsx:76`), e nem assim mexe nesses selos.
**Achado:** Os selos dizem "Online" mesmo com o bot fora do ar. "Discord.js v14" é jargão de programador que não diz nada a quem quer um bot.
**Recomendação:** Ligar os selos ao `/api/status` (verde online, cinza offline) ou removê-los. Trocar o texto por um benefício ("Grátis • Em português e inglês").
**Revisão:** Confirmado. Nenhum componente da Home lê o status real.

### Q009 — Os comandos do simulador existem do jeito que aparecem?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `TerminalSimulator.jsx:132` "/py-casamento status" e `:164` "/py-tarot daily". O slash real é `py-marriage` (`src/commands/commandNames.js:13`; `src/modules/marriage/commands/pyCasamento.js:37` e `:465-469` sem subcomandos). `src/commands/tarot.js:297-302` não tem subcomando.
**Achado:** O visitante digita "/py-casamento status" ou "/py-tarot daily" no Discord e nada aparece. A primeira experiência termina em frustração.
**Recomendação:** Mostrar os nomes reais (`/py-marriage`, `/py-tarot`) ou o prefixo que funciona (`py!casamento status`, aceito em `pyCasamento.js:472-479`). O ideal é puxar do `/api/commands`.
**Revisão:** Confirmado. "py-casamento" existe só como apelido do prefixo `py!`, não como slash.

### Q010 — O idioma da Home segue a URL e se mantém nos botões?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/App.jsx:16-24` decide por `?lang` > `localStorage` > navegador e ignora `/en/`. `src/utils/seoRenderer.js:411-422` faz 301 de todo `?lang=` para o caminho do idioma, então o `?lang` some antes do React ler. `Navbar.jsx:115` linka `/?lang=`; `HeroSection.jsx:65` e `CringelandiaSection.jsx:35,41` linkam sem idioma. Textos fixos: `TerminalSimulator.jsx:185` "100% Interativo", `Navbar.jsx:169` "Toggle menu". O script antigo também ignora o caminho (`public/index.html:3164-3178`).
**Achado:** Quem tem navegador em inglês abre a Home em PT e ela vira inglês sozinha. Quem está em inglês e clica em "Visit Cringelândia" cai em português. Cada clique no menu passa por um redirecionamento extra. A captura em inglês mostra "100% Interativo" em português.
**Recomendação:** Fazer o React ler o idioma pelo caminho (`/en/` = inglês), linkar direto para `/en/...` e levar o idioma em todos os botões. Passar os textos fixos para o i18n (AGENTS.md §1).
**Revisão:** Confirmado no código e na captura `home-1280.png`. Nenhum dos dois scripts lê o caminho.

### Q011 — Os botões usam nomes coerentes para o mesmo destino?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `/install` aparece como "Adicionar à minha conta" (`HeroSection.jsx:75`, `i18n.js:19`) e "Usar na minha conta" (`Navbar.jsx:228` com `nav.install`, `Footer.jsx:52` com `footer.install`, `i18n.js:11,74`). `/invite` aparece como "Adicionar Pyxie" (`i18n.js:10`) e "Adicionar ao Discord" (`i18n.js:16`). No menu móvel, "Minha conta" (`Navbar.jsx:208-211`) fica perto de "Usar na minha conta".
**Achado:** O mesmo destino tem nomes diferentes, e "Minha conta" e "Usar na minha conta" levam a lugares distintos. Quem chega pela primeira vez não sabe qual clicar.
**Recomendação:** Um nome por ação ("Adicionar ao servidor" e "Usar no meu perfil do Discord") aplicado em Navbar, Hero, menu móvel e Footer.
**Revisão:** Confirmado. Correção: a Navbar usa a chave `nav.install`, não `footer.install` (mesmo texto).

### Q012 — No celular, o botão "Adicionar ao Discord" aparece sem rolar?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `HeroSection.jsx:53-61` botão `w-full` com `py-4` no celular. Medição do auditor em 360x800: topo em 598px. Menu móvel também tem o convite (`Navbar.jsx:214-221`).
**Achado:** O botão principal aparece grande na primeira tela do celular, com o secundário logo abaixo.
**Recomendação:** Manter. Se o texto do Hero crescer, conferir em 360x640 (celulares menores), onde 598px fica no limite.
**Revisão:** Mantido por amostragem (código coerente com a medição; medição não refeita).

### Q013 — O Footer leva às páginas legais (Termos, Privacidade)?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/layout/Footer.jsx:22-56` tem 11 links (Termos, Pais e profissionais, Transparência), nenhum para Privacidade. A página existe: `server.js:585` `/privacidade`, `server.js:594` `/privacy`, `public/privacy.html`. O HTML antigo também não linka (busca por "privac" em `public/index.html` vazia).
**Achado:** Quem quer saber o que a Pyxie faz com seus dados não acha a Política de Privacidade no rodapé. Numa comunidade sensível, isso pesa na confiança e na LGPD.
**Recomendação:** Adicionar "Privacidade" (`/privacidade` e `/en/privacy`) no Footer, ao lado de Termos, com chave no i18n.
**Revisão:** Confirmado. Não há link em nenhuma das duas Homes.

### Q014 — Os ícones da Navbar e do menu móvel são consistentes?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `Navbar.jsx:115-117` "Recursos" e `:131-133` "Suporte" sem ícone; os demais têm. O mesmo no menu móvel (`:180-182`, `:205-207`). O botão "Adicionar" usa `Sparkles` (`:161`), enquanto o HTML antigo usava o logo do Discord (`public/index.html:2445`).
**Achado:** Alguns itens têm ícone e outros não, e a coluna de ícones do menu móvel fica com buracos. O botão de adicionar não mostra o logo do Discord, o sinal mais reconhecível dessa ação.
**Recomendação:** Dar ícone a todos os itens (ex.: grade para Recursos, boia para Suporte) e usar o logo do Discord no "Adicionar".
**Revisão:** Confirmado. Severidade baixa mantida.

### Q015 — As imagens da Home têm peso e texto alternativo adequados?

**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `public/assets/pyxie/sticker/sticker_smile.png` tem 320x320 e ~138KB, exibido com 36px (`Navbar.jsx:95-99`) e 32px (`Footer.jsx:10-14`). O HTML antigo referencia `pyxie_mascot.png` (~138KB, `public/index.html:2848`), `pyxie_space_banner.jpg` (~102KB, `:2656`) e `pyxie_pixelart.png` (~47KB, `:2590`). `og_banner_hd.png` (~552KB) entra no fallback do Museu (`MuseumScene.jsx:39`). Alt: `MuseumScene.jsx:466` e `:513` "Arte por @X no Museu da Pyxie • Visite https://pyxie.com.br/".
**Achado:** No 4G, o visitante baixa bem mais imagem do que vê, e o logo é 10 vezes maior que o necessário. Quem usa leitor de tela ouve um endereço de site em cada arte.
**Recomendação:** Gerar o logo em 72px WebP (menos de 10KB), tirar as imagens do HTML antigo e usar versões menores no Museu. Alt só com "Arte de @autor: título".
**Revisão:** Confirmado com ressalva: as três imagens do HTML antigo também são as do fallback falso do Museu (`MuseumScene.jsx:32,46,53`), então não são todas "descartadas" pelo React. O total de rede é medição do auditor, não refeita.

### Q016 — Depois que o React monta, o script do HTML antigo para de rodar?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/index.html:2866-2925` animação de partículas com `requestAnimationFrame(render)` em loop sem parada; o canvas fica dentro de `#pyxie-app` (`:2330`, `:2351`), que o React substitui (`client/src/main.jsx:6-10`). `index.html:3635-3638` `initLiveSync()` (SSE) e `setInterval` a cada 15s e 30s. Nenhuma checagem de `__PYXIE_REACT_ACTIVE__` no arquivo.
**Achado:** Cada aba aberta da Home segue animando partículas invisíveis e consultando o servidor sem parar. Gasta bateria do celular e carrega o servidor à toa.
**Recomendação:** No script antigo, sair cedo quando `window.__PYXIE_REACT_ACTIVE__` estiver ativo, ou remover esse script e deixar só o React.
**Revisão:** Confirmado. Busca por `__PYXIE_REACT_ACTIVE__` em `public/index.html` vazia; nada cancela o loop nem os intervalos.

### Q017 — É viável manter duas Homes (HTML estático + React)?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/index.html` tem 3644 linhas, com Navbar própria ("Explorar" em `:2386-2389`, Top.gg em `:2403`, selo "10s" em `:2383`), diferente de `Navbar.jsx` ("Comunidade", Museu, Cringelândia). `main.jsx:6` substitui `#pyxie-app`. Textos do Hero duplicados (`index.html` com `data-i18n` x `client/src/utils/i18n.js:12-22`).
**Achado:** O Google e quem tem internet lenta veem um menu e textos diferentes dos que aparecem depois. Toda mudança precisa ser feita em dois lugares, e um deles sempre fica desatualizado.
**Recomendação:** Deixar o HTML estático só como casca mínima para SEO (título, H1, descrição, links), gerada do mesmo i18n, ou pré-renderizar o React no build.
**Revisão:** Confirmado. As diferenças de menu estão no código.

### Q018 — A Home respeita quem pede menos movimento?

**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `client/src/index.css:349-365` desliga aurora, grade, glifos e Reveal. Mas `App.jsx:38-47` liga o Lenis (rolagem suave) sempre, e `animate-ping`/`animate-pulse` seguem sem `motion-safe` (`HeroSection.jsx:19`, `Navbar.jsx:101`, `TerminalSimulator.jsx:43,136,145,177`). O painel já usa `motion-reduce` (`client/src/dashboard/ui.jsx:86`), prova de que o padrão é conhecido.
**Achado:** Com "reduzir movimento" ligado, a rolagem continua escorregando e as bolinhas seguem piscando. Isso incomoda pessoas sensíveis a movimento, parte do público neurodivergente.
**Recomendação:** Não iniciar o Lenis quando `prefers-reduced-motion: reduce` for verdadeiro e usar `motion-safe:animate-ping` / `motion-safe:animate-pulse`.
**Revisão:** Confirmado. Linha corrigida: a bolinha da Navbar está em `Navbar.jsx:101` (não `:104`).

### Q019 — Textos pequenos e links do rodapé são legíveis no celular?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `Navbar.jsx:107` "v14 • Online" em `text-[9px]` com `text-purple-300/70`; `TerminalSimulator.jsx:44` "READY" em `text-[10px]`; `TerminalSimulator.jsx:183-184` "Pyxie Discord Engine v14" em `text-[11px] text-slate-500`. Links do Footer sem padding vertical (`Footer.jsx:22-56`, só `text-sm`).
**Achado:** Alguns textos são pequenos e apagados demais para ler no celular, e os links do rodapé são alvos de toque baixos (cerca de 20px).
**Recomendação:** Usar no mínimo 12px e `slate-400` nesses textos e dar `py-2` aos links do Footer (alvo de 36–44px).
**Revisão:** Confirmado no código. O valor de contraste (~4,2:1) é medição do auditor, não refeita.

### Q020 — O `/api/stats`, chamado pela Home, expõe dados de usuários?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/App.jsx:63` chama `/api/stats`. `server.js:1735-1739` devolve `{ ...getStats(), uptime }` sem login (só o limite de taxa geral de `server.js:327`; o filtro de rotas `src/services/webRoutesManager.js:124` não cobre essa rota). `src/services/logging.js:172-176` guarda `uniqueUsers` como lista de IDs separada por vírgula, e `recordUniqueUser` é chamado para todo autor de mensagem e interação (`index.js:627`, `:784`, `:826`).
**Achado:** Qualquer pessoa que abrir `/api/stats` recebe a lista de IDs do Discord de quem já falou perto da Pyxie ou usou um comando. Numa comunidade de pessoas neurodivergentes e em sofrimento, isso é exposição de dados pessoais (LGPD).
**Recomendação:** Remover `uniqueUsers` e campos internos da resposta pública. Devolver só números agregados (servidores, tempo no ar). O próprio `server.js:1718` já mostra o jeito certo: só a contagem (`uniqueUsersCount`).
**Revisão:** Confirmado e reforçado: a lista inclui autores de mensagens comuns (`index.js:627`), não só quem usou comandos.
