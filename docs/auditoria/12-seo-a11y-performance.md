# 12. SEO, acessibilidade e performance web

> Nota da área: 4.5/10 · A base técnica é boa: compressão, cache, fontes locais, sitemap e as páginas das 78 cartas são um modelo. Mas há duas brechas de código malicioso no HTML (Museu e perfil /u), o idioma da página não segue a URL (/en/ pode abrir em português e vice-versa), e várias páginas têm números falsos, prévias de link erradas e menus que estouram no celular.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q221 | Perfil /u/:userId escapa o endereço no HTML? | 🔴 PROBLEMA | alta |
| Q222 | Link de obra do Museu escapa descrição e autor? | 🔴 PROBLEMA | crítica |
| Q223 | Menu de Privacidade, Para pais e Transparência cabe no celular? | 🔴 PROBLEMA | alta |
| Q224 | /en/ mostra inglês e URL PT mostra português? | 🔴 PROBLEMA | alta |
| Q225 | Números e status "Online" da home são reais? | 🔴 PROBLEMA | média |
| Q226 | og:image de 6 páginas tem o tamanho declarado? | 🔴 PROBLEMA | média |
| Q227 | Logo pequeno e banner de prévia têm peso adequado? | 🟡 PARCIAL | baixa |
| Q228 | Cena 3D da home só baixa quando aparece? | 🟡 PARCIAL | média |
| Q229 | Compressão e cache corretos? | ✅ OK | info |
| Q230 | /u/:userId dá 404 para ID inválido e hreflang certo? | 🔴 PROBLEMA | média |
| Q231 | Foco do teclado visível? | ✅ OK | info |
| Q232 | Contraste de textos apagados em /u e Hyperfokus? | 🔴 PROBLEMA | média |
| Q233 | Textos menores que 12px no celular? | 🟡 PARCIAL | baixa |
| Q234 | Emojis do Discord na home com alt e tamanho? | 🟡 PARCIAL | info |
| Q235 | /museu já traz o h1 no HTML do servidor? | 🔴 PROBLEMA | baixa |
| Q236 | Script antigo do Museu roda junto com o React? | 🔴 PROBLEMA | baixa |
| Q237 | /en/ entrega o corpo em inglês no HTML? | 🟡 PARCIAL | média |
| Q238 | Sitemap do Hyperfokus anunciado aos buscadores? | 🔴 PROBLEMA | baixa |
| Q239 | Sitemap completo e áreas privadas escondidas? | ✅ OK | info |
| Q240 | Páginas das 78 cartas boas em 360/768/1280? | ✅ OK | info |

---

### Q221 — A página pública de perfil /u/:userId protege o endereço contra código malicioso antes de colocá-lo no HTML (canonical e og:url)?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `server.js:806` `const userId = String(req.params.userId || '').trim();` sem validação; `server.js:823` `const canonical = \`https://pyxie.com.br/u/${userId}\`;` inserido por `.replace(...)` em `server.js:827-830` sem escapar. A CSP em `server.js:285` permite `script-src 'self' 'unsafe-inline'`. Já a rota `/api/profile` valida com `/^\d{15,25}$/` (`server.js:849`). Os cookies de sessão são `HttpOnly` (`src/services/accountSessions.js:99`, `src/services/panelSessions.js:114`).
**Achado:** Qualquer pessoa pode montar um link /u/ com código no lugar do ID. O servidor cola esse texto direto no HTML, e a política de segurança deixa o script rodar. Quem clicar roda código dentro de pyxie.com.br. O cookie não pode ser lido (é HttpOnly), mas o código pode agir em nome da pessoa logada no painel ou no Hyperfokus.
**Recomendação:** Aceitar só IDs numéricos do Discord (15 a 25 dígitos) e devolver 404 para o resto. Escapar todo texto antes de inserir no HTML. Depois, tirar `'unsafe-inline'` do script-src.
**Revisão:** Confirmado no código. Rebaixado de crítica para alta: o ataque exige que a vítima clique num link montado, e os cookies são HttpOnly, então não há "roubo de sessão" direto.

### Q222 — O link de compartilhamento de obra do Museu (/museu?art=ID) escapa a descrição e o autor da obra antes de trocar <title> e og:title?

**Veredito:** 🔴 PROBLEMA
**Severidade:** crítica
**Evidência:** `src/utils/seoRenderer.js:438` `const rawTitle = art.description ? art.description.slice(0, 50) : ...` e `:447` `.replace(/<title>[\s\S]*?<\/title>/i, \`<title>${artTitle}</title>\`)`, sem escape. A descrição vem do texto da mensagem no canal: `src/modules/museum/museumManager.js:186` `description: (msg.content || '').trim().slice(0, 1000)`. O autor (`authorHandle`, `:440`) também entra sem escape.
**Achado:** Um membro que posta uma imagem no canal do museu com texto como `</title><script>...` faz esse código rodar para todo visitante que abrir o link daquela obra. O ataque fica guardado no acervo e funciona contra qualquer pessoa, inclusive a equipe logada.
**Recomendação:** Escapar `& < > " '` em título, descrição e autor antes de injetar no HTML (`src/services/tarotCardPages.js:96` já tem `escapeHtml`). Remover `'unsafe-inline'` da CSP quando possível.
**Revisão:** Confirmado. Não há escape nem validação em nenhum ponto do caminho (coleta → JSON → HTML). Severidade mantida.

### Q223 — O menu do topo de Privacidade, Para pais e Transparência cabe em celular (360px) e tablet (768px) sem rolagem lateral?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** Medição Playwright (`/tmp/aud-seo-a11y-performance/result-pt.json`): pais-e-profissionais@360 `sw: 752`, elemento `div.nav-links r=752`, botão `button.lang-btn r=752`. `public/transparencia.html:160` `.nav-links { display: flex; align-items: center; gap: 18px; }` sem quebra; o único `@media (max-width: 768px)` (`:336`) só remove o blur. O mesmo bloco existe em `public/privacy.html:162` e `public/pais-e-profissionais.html:159`. Nenhuma folha de estilo externa nessas páginas.
**Achado:** No celular, a página arrasta para o lado e os links Termos, Para pais, Transparência e o botão de idioma ficam fora da tela. Pais e profissionais, o público dessas páginas, não acham o botão EN/PT.
**Recomendação:** Usar o mesmo menu hambúrguer da Navbar do React nessas 3 páginas, ou no mínimo `flex-wrap: wrap` no `.nav-links` abaixo de 800px. Deixar o botão de idioma sempre visível.
**Revisão:** Confirmado no CSS e na medição. Severidade mantida.

### Q224 — Quem abre /en/... vê o site em inglês e quem abre a URL em PT vê português, como prometem o canonical e o hreflang?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/App.jsx:15-24` — o idioma vem de `?lang`, `localStorage` ou `navigator.language`, nunca do caminho `/en/`; `:92` troca `document.documentElement.lang`. O mesmo em `public/tarot.html:751`, `public/terms.html:876`, `public/transparencia.html:508`, `public/privacy.html:616`, e `public/index.html:3164-3175` (`resolveInitialLang`). O servidor redireciona `?lang=` com 301 (`src/utils/seoRenderer.js:409-418`). Há 22 links `?lang=` (14 em `Navbar.jsx`, 8 em `Footer.jsx`).
**Achado:** Quem tem o navegador em inglês e abre pyxie.com.br/ recebe a página em inglês; quem escolheu PT antes abre /en/wiki e vê português. O robô do Google costuma rodar com navegador em inglês, então a versão PT pode ser indexada em inglês, e as duas URLs ficam com o mesmo conteúdo. Tarot e Termos caem em inglês para qualquer idioma não-PT; Transparência e Privacidade caem em PT.
**Recomendação:** Fazer o caminho mandar: /en/ é sempre inglês, sem /en/ é sempre português. Usar navegador e preferência salva só para sugerir a troca com um aviso. Trocar os 22 links `?lang=` pelos caminhos /en/... para evitar o 301 a cada clique.
**Revisão:** Confirmado. Nenhum script lê o caminho `/en/` para definir o idioma. Severidade mantida.

### Q225 — Os números e o status que a home e a barra do topo mostram (servidores, usuários, uptime, 'Online') são reais?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/App.jsx:26-30` valores iniciais `guilds: 18, users: 2450, uptime: '99.9%'`, mantidos quando a API falha (`:68-70` `data.guilds || 18`); `client/src/components/hero/HeroSection.jsx:47` `{stats?.uptime || '99.9% Uptime'}`; `client/src/components/layout/Navbar.jsx:101` bolinha verde `animate-pulse` e `:108` texto fixo `v14 • Online`.
**Achado:** Se a API cair ou demorar, o site mostra números inventados e 99.9% de uptime. A barra do topo diz "Online" com luz verde mesmo com o bot fora do ar. Isso engana quem está decidindo adicionar a Pyxie e contraria a regra "zero mock" (AGENTS.md §12).
**Recomendação:** Mostrar um traço ou esqueleto de carregamento até a API responder e esconder o bloco se ela falhar. Ligar o "Online" e a cor da bolinha ao `/api/status` real.
**Revisão:** Confirmado. Severidade mantida.

### Q226 — A imagem de prévia (og:image) das páginas Bônus, Cringelândia, Mercado, Museu, Parcerias e Passe tem o formato e o tamanho declarados?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/bonus.html:44-46`, `public/cringelandia.html:30-32`, `public/mercado.html:20-22`, `public/museum.html:49-51`, `public/partnerships.html:44-46`, `public/passe.html:19-21`: `og:image` = `pyxie_mascot.png` com `og:image:width` 1200 e `height` 630. `file public/assets/pyxie/pyxie_mascot.png` → `576 x 1024` (em pé). O `seoRenderer` não troca `og:image` (só no link de obra do Museu, `seoRenderer.js:452`).
**Achado:** Ao compartilhar essas páginas no Discord, WhatsApp ou Facebook, a prévia mostra a mascote em pé cortada num quadro deitado. As medidas declaradas estão erradas e todas essas páginas ficam com a mesma cara.
**Recomendação:** Criar um banner 1200x630 para cada página (ou usar `og_banner_hd.png`) e declarar as medidas certas.
**Revisão:** Confirmado. Severidade mantida.

### Q227 — As imagens pequenas do topo (logo) e o banner de compartilhamento têm peso adequado para celular?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `public/transparencia.html:353` e `public/privacy.html:355` `<img src="/assets/pyxie/pyxie_mascot.png" alt="Avatar da Pyxie" />`, exibido a 36x36 (`.brand img`, `transparencia.html:153-155`); arquivo 576x1024 com 138.053 bytes. `public/assets/pyxie/og_banner_hd.png` tem 552.447 bytes em PNG.
**Achado:** Para um logo de 36px, o celular baixa 138 KB. A imagem de prévia passa de meio MB, e alguns apps de mensagem podem não mostrar prévia tão pesada.
**Recomendação:** Usar uma versão pequena (72x72, WebP) para o logo dessas páginas. Exportar o banner de prévia em JPG ou WebP abaixo de 300 KB.
**Revisão:** Confirmado nos arquivos. Rebaixado de média para baixa: são páginas institucionais de pouco tráfego e 138 KB não trava a página.

### Q228 — A cena 3D (three.js) da home só é baixada quando o visitante chega até ela?

**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `client/src/pages/Home.jsx:14-25` importa `MuseumScene` em `requestIdleCallback(load, { timeout: 2500 })` em toda visita, sem checar rolagem nem aparelho. `public/dist/assets/MuseumScene-1G9RoolD.js` tem 489.460 bytes. O espaço reservado é `h-64` (256px, `Home.jsx:36`), mas a cena tem `h-[380px] sm:h-[480px] lg:h-[540px]` (`client/src/components/3d/MuseumScene.jsx:451`).
**Achado:** A cena não trava a primeira pintura, mas todo visitante, mesmo no celular e sem rolar, baixa cerca de 124 KB comprimidos e roda WebGL. Quando ela entra, o conteúdo abaixo pula de 124 a 284px para baixo.
**Recomendação:** Carregar a cena só quando ela estiver perto de aparecer (IntersectionObserver). Em celular ou com movimento reduzido, mostrar uma imagem estática. Dar ao espaço reservado a mesma altura da cena.
**Revisão:** Confirmado; a diferença de altura foi medida no código e reforça o pulo de layout.

### Q229 — O servidor comprime as respostas e usa cache correto em HTML, bundles com hash, fontes e scripts de anúncio, sem bloquear a renderização?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `server.js:263-271` `compression({... threshold: 1024 })`, sem comprimir SSE; `server.js:410-421` HTML `no-cache, no-store, must-revalidate`, arquivos com hash `public, max-age=604800, immutable`, `index.js`/`index.css` sem hash `no-cache, must-revalidate`.
**Achado:** A base de desempenho está boa: compressão ativa, cache longo só no código com hash, fontes do próprio domínio e anúncios assíncronos. Ressalvas: `no-store` no HTML impede o "voltar instantâneo" do navegador; e imagens sem hash no nome (`server.js:417-418`) ficam 7 dias como `immutable`, então trocar uma imagem com o mesmo nome demora até uma semana para chegar a quem já visitou.
**Recomendação:** Manter. Opcional: `no-cache` em vez de `no-store` nas páginas públicas; ao trocar uma imagem, mudar o nome do arquivo.
**Revisão:** Confirmado por amostragem. Acrescentada a ressalva do cache de imagens.

### Q230 — A rota /u/:userId responde 404 para ID inexistente ou inválido, e o hreflang do perfil aponta para a própria página?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `server.js:820` `const name = account?.username || \`Membro (${userId.slice(-4)})\`;` e `res.send(html)` sem status de erro (`server.js:839`); `public/u.html:8-11` canonical e hreflang fixos em `https://pyxie.com.br/u` e `/u?lang=en`; o servidor só reescreve o canonical e `og:url` (`server.js:827-830`), não o hreflang. Não existe rota `/u` sem ID.
**Achado:** /u/qualquercoisa abre um perfil vazio "Membro (...)" com status 200. O Google pode indexar páginas sem valor, e quem digita o ID errado não sabe que errou. O hreflang aponta para /u, que não existe.
**Recomendação:** Validar o ID (só dígitos, 15 a 25) e devolver 404 se a conta não existir. Gerar hreflang `/u/<id>` e `/en/u/<id>` (ou remover) e pôr `noindex` em perfis vazios.
**Revisão:** Confirmado. Severidade mantida.

### Q231 — Quem navega só com o teclado (Tab) vê onde está o foco nas páginas Início, Tarot, Planos, Transparência, Mercado e Wiki?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** Script `/tmp/aud-seo-a11y-performance/focus.js`, 12 Tabs por página a 1280px: index 12/12 com contorno, tarot 12/12, planos 11/11, transparencia 12/12, mercado 6/6, wiki 12/12.
**Achado:** Todos os itens focados mostraram contorno ou sombra. Quem usa teclado consegue se localizar.
**Recomendação:** Manter. Ao usar `outline-none` (ex.: `Navbar.jsx:59`), sempre pôr um `focus-visible:ring` no lugar.
**Revisão:** Mantido com base na medição do auditor; não foi reexecutado nesta revisão (sem navegador nesta etapa).

### Q232 — Os textos apagados do perfil público (/u) e do Hyperfokus no painel têm contraste mínimo de leitura (4.5:1)?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/pages/Profile.jsx:259` `<span className="text-[9px] uppercase tracking-widest text-slate-600">Bloqueado</span>`; contraste calculado de slate-600 (#475569) sobre #080410 = 2,68:1. `client/src/dashboard/Hyperfokus.jsx:433, 453, 482, 588, 612` usam `text-white/40` em texto `xs`/`sm` = 3,71:1.
**Achado:** No álbum de tarot do perfil, "Bloqueado" aparece em 9px quase invisível e fixo em português. No Hyperfokus, avisos de lista vazia e endereços de artigo ficam abaixo do mínimo de leitura, difícil para quem tem baixa visão ou tela com pouco brilho.
**Recomendação:** Usar no mínimo `text-slate-400` ou `text-white/60` em textos informativos, com 11 a 12px. Passar "Bloqueado" pelo `t()` com versão em inglês.
**Revisão:** Confirmado. Removida a linha `Hyperfokus.jsx:504`: ali `text-white/20` colore um ícone decorativo (`<Pin size={20} />`), não texto.

### Q233 — Há textos menores que 12px nas páginas principais em celular?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** Medição (`result-pt.json`): index@360 com 9 textos abaixo de 12px, wiki@360 com 14, cringelandia@1280 com 71. `client/src/components/layout/Navbar.jsx:107` `text-[9px]` em "v14 • Online".
**Achado:** Etiquetas, selos e botões como "Ver na Shopee" aparecem com 9 a 11px. No celular isso é difícil de ler, sobretudo para pessoas com dislexia ou TDAH, público da comunidade.
**Recomendação:** Definir 12px como piso para qualquer texto e 14px para botões e links de ação. Revisar as classes `text-[9px]`, `text-[10px]` e `text-[11px]`.
**Revisão:** Confirmado por amostragem da medição e do código. Severidade mantida.

### Q234 — Os ícones de emoji do Discord na home têm texto alternativo coerente e tamanho reservado?

**Veredito:** 🟡 PARCIAL
**Severidade:** info
**Evidência:** `public/index.html` tem 23 `<img src="https://cdn.discordapp.com/emojis/..." class="emoji-icon" alt="career">`; o mesmo emoji `1548444111319605330` tem `alt="tarot"` e `alt="arte"`. Porém o CSS já reserva tamanho: `public/index.html:211-213` `.emoji-icon { width: 1.3em; height: 1.3em; }` (e `-lg`, `-xl`). E todos estão dentro de `<div id="pyxie-app">` (linhas 2330 a 2862), que o React substitui ao montar (`client/src/main.jsx:6-10`).
**Achado:** O texto não pula, porque o CSS já fixa o tamanho. Para quem tem JavaScript, esses ícones somem quando o React carrega. O alt em inglês solto só aparece para buscadores e para quem está sem JavaScript.
**Recomendação:** Quando mexer nesse HTML estático, usar `alt=""` em ícones decorativos ao lado de um título e copiar os emojis para `/assets/` para não depender do CDN do Discord.
**Revisão:** Rebaixado de baixa para info. "Sem tamanho reservado" foi refutado pelo CSS, e o impacto em leitor de tela é quase nulo porque o React troca esse bloco.

### Q235 — O HTML que o servidor entrega para /museu já traz o título principal (<h1>) preenchido para buscadores e para quem está sem JavaScript?

**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** `public/museum.html:627` `<h1 id="title"></h1>` e `:628` `<p class="sub" id="subtitle"></p>` vazios; o texto só aparece depois do JavaScript (`client/src/pages/Museum.jsx:166`). O `seoRenderer` preenche `<title>` e metas, mas não o h1.
**Achado:** Quem lê só o HTML encontra o Museu sem título principal. A regra "um `<h1>` por página" (AGENTS.md §8) só vale depois do JavaScript.
**Recomendação:** Escrever no HTML o h1 "Museu da Comunidade" e o subtítulo em PT, como já é feito na home e no tarot.
**Revisão:** Confirmado. Rebaixado de média para baixa: o Google executa JavaScript e o título da aba e as prévias de link já vêm prontas do servidor, então a perda no Google é pequena.

### Q236 — O script antigo da página do Museu ainda roda junto com o React e causa erro ou pedido duplicado?

**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** Medição: `museum@768` e `@1280` com erro `Cannot set properties of null (setting 'textContent')`. `public/museum.html:794` `fetch('/api/museum/arts?page=' + page + '&limit=24')` e `:776` `fetch('/api/shopee/hourly-promo')`, sem checar `window.__PYXIE_REACT_ACTIVE__` (grep vazio no arquivo); o React também busca as obras (`client/src/pages/Museum.jsx:39`).
**Achado:** Todo visitante do Museu baixa a lista de obras duas vezes, e o console mostra erro. Gasta dados móveis e servidor, e o erro atrapalha achar falhas reais.
**Recomendação:** Envolver o script antigo em `if (!window.__PYXIE_REACT_ACTIVE__)`, como em Parcerias, ou removê-lo se o React já cobre tudo.
**Revisão:** Confirmado. Severidade mantida.

### Q237 — A versão em inglês (/en/...) entrega o corpo da página em inglês já no HTML do servidor, ou só o título e as metas?

**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `src/utils/seoRenderer.js:391-401`: para `en`, só troca `<html lang>`, `<title>`, description, `og:*` e `twitter:*`; o corpo continua o arquivo PT. Só planos tem arquivo próprio (`seoRenderer.js:66` `fileEn: 'planos.en.html'`; único `public/*.en.html`).
**Achado:** Em /en/tarot, o título da aba está em inglês, mas o texto chega em português até o JavaScript traduzir (e, por Q224, pode nem traduzir). Buscadores e prévias veem página EN com conteúdo PT.
**Recomendação:** Traduzir o corpo no servidor (aplicar os `data-i18n` no `seoRenderer`) ou gerar arquivos `.en.html` como em planos. Começar por home, tarot e wiki.
**Revisão:** Confirmado. Severidade mantida.

### Q238 — O sitemap próprio do blog Hyperfokus está anunciado aos buscadores no robots.txt ou no sitemap principal?

**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** `src/routes/hyperfokusRoutes.js:60` serve `/sitemap-hyperfokus.xml`; `public/robots.txt` só tem `Sitemap: https://pyxie.com.br/sitemap.xml`; `public/sitemap.xml` é um `<urlset>` sem nenhuma URL do Hyperfokus (0 ocorrências). Atenuante: ao publicar um artigo, o painel avisa o IndexNow (`src/routes/dashboardRoutes.js:1631` `indexNow.submitIndexNowUrls([articleUrl])`).
**Achado:** Nenhum buscador é avisado de que o sitemap do blog existe. O Bing recebe cada artigo novo pelo IndexNow, mas o Google não usa IndexNow e só acha os textos rastreando links, a não ser que o sitemap seja cadastrado à mão no Search Console.
**Recomendação:** Adicionar `Sitemap: https://pyxie.com.br/sitemap-hyperfokus.xml` ao robots.txt.
**Revisão:** Confirmado. Rebaixado de média para baixa pelo IndexNow já existente e por ser uma correção de uma linha.

### Q239 — O sitemap.xml lista todas as páginas públicas reais nos dois idiomas, e o robots.txt e o noindex escondem as áreas privadas?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `public/sitemap.xml` com 186 `<url>` gerado do `SEO_CONFIG`; `public/robots.txt` com `Disallow` para `/admin`, `/api/admin/`, `/auth/`, `/console`, `/dashboard`, `/mary`, `/meu-perfil`, `/boas-vindas`; `src/routes/dashboardRoutes.js:196` `X-Robots-Tag: noindex, nofollow`. As 186 datas `<lastmod>` são todas `2026-10-31`.
**Achado:** O mapa do site confere com as páginas que existem e as áreas privadas estão fora do Google. Ressalva: todas as datas de alteração são iguais, o que tira valor desse sinal.
**Recomendação:** Manter. Opcional: usar a data real de alteração de cada arquivo no gerador do sitemap.
**Revisão:** Confirmado por amostragem.

### Q240 — As páginas de significado das 78 cartas (/tarot/carta/:slug) e o índice /tarot/cartas funcionam bem em 360, 768 e 1280px, com um h1, imagens com tamanho e texto escapado?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/services/tarotCardPages.js:96` `function escapeHtml(value)`, usado em `:199-216` (title e metas); `:324` `<img ... width="${CARD_IMAGE_WIDTH}" height="${CARD_IMAGE_HEIGHT}" />`; `:372` imagens do índice com tamanho. Capturas `/tmp/aud-seo-a11y-performance/carta-360.png` e `hub-360.png`.
**Achado:** As páginas das cartas são o melhor modelo do site: não arrastam para o lado, a imagem já reserva espaço, há um título por página, o texto é protegido e cada idioma tem URL própria.
**Recomendação:** Usar este gerador (HTML pronto no servidor, `escapeHtml`, width e height) como padrão para corrigir Museu, perfil /u e versões EN.
**Revisão:** Confirmado por amostragem do código.
