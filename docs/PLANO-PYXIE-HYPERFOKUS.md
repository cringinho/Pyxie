# Plano de implantação: Pyxie Hyperfokus (blog do fórum de Hiperfocos)

> Documento de execução para o agente de código (Gemini 3.8 no Antigravity). Origem: `implantação_blog.pdf` do dono (29/10/2026), relido e confrontado com o `AGENTS.md` e com o código atual.
> Leia este arquivo inteiro antes de começar. Onde o PDF e o `AGENTS.md` discordam, **o `AGENTS.md` vence** (a tabela da seção 2 lista cada caso).

---

## 0. Como usar este plano

1. Trabalhe **uma fase por vez**, na ordem da seção 4. Cada fase termina com o **Portão de validação** dela (seção 6) e um commit.
2. Antes de cada fase, abra só os `docs/agents/NN-*.md` citados nela.
3. Nada de "pronto" sem: `npm test` 100% (pelo `scripts/test-safe.sh` no Windows), prints salvos da validação visual e prévia real no Discord quando houver embed (§11).
4. Ao fim de cada fase, escreva em `docs/hyperfokus/DIARIO.md` (crie o arquivo) o que foi feito, o que foi validado, os prints e o que ficou pendente. É o seu relatório para o dono.
5. **Foco desta semana: o blog.** Divulgação/parcerias (fase 8) e indicação gamificada ficam por último. Se o tempo acabar, pare depois da fase 5 com tudo verde.

---

## 1. O que o dono pediu (resumo fiel do PDF)

**Produto:** transformar o fórum de Hiperfocos da Cringelândia num portal editorial público, **Pyxie Hyperfokus** (`pyxie.com.br/hyperfokus`), com texto 100% autoral (proibido conteúdo gerado por IA), SEO de cauda longa e automações de tráfego.

**Fluxo Discord → Painel → Site**
- Tópico novo no fórum nasce em modo **rascunho**: só o autor e coautores digitam; mensagens de outras pessoas são apagadas na hora, com aviso efêmero/DM educado (Thread Guard). Motivo: tópicos de fórum (`PublicThreadChannel`) não têm `permissionOverwrites` próprios.
- **Sticky** no fim do tópico (debounce de 3 s) explicando `py!add @usuario` / `/py-add` (adicionar coautor), `py!concluir` / `/py-concluir` e botão `✅ Concluir e postar`.
- Ao concluir: o tópico abre para comentários e o pacote (mensagens concatenadas em Markdown, anexos, links, tags do fórum, autores) entra na **fila de validação do painel**.
- No painel, dono/admins aprovam direto ou ajustam num **editor Markdown**, definindo `seoTitle` (Título de SEO, separado do título original) e `metaDescription`.
- Aprovado: publica no site e a Pyxie troca o sticky por um **embed de celebração** com os autores e o link. Recusado: fica só no Discord.
- **Pré-checagem automática** de qualidade na tela de validação: o dono respondeu **Não**. Não construa.

**Autoria e permanência**
- Cada artigo guarda `id/slug`, `discordThreadId`, `publishedAt`, `updatedAt`, `categoryTags` e `authors[]` (índice 0 = autor; `{ userId, username, globalName, cachedAvatarWebp, role: 'AUTHOR'|'COLLABORATOR' }`).
- Avatar baixado e convertido para `.webp` no momento da publicação; se a conta sumir, o site mostra os últimos dados conhecidos.
- Apagar o tópico no Discord **não** apaga o artigo. Backup diário em `data/backups/hyperfokus/backup_{YYYY-MM-DD}.json`.
- Coautores estilo social: `[foto] @A`, `[foto] @A e [foto] @B`, `[foto] @A, [foto] @B e outros N` (o "outros N" sublinhado e clicável abre um modal com todos).
- Página de autor `/hyperfokus/autor/:userId`; quem loga vê seus artigos, curtidas e comentários, **sem botão de excluir**, com `Solicitar remoção via suporte` que abre ticket para a staff.

**Site público** (estética editorial premium tipo Ghost/WordPress + Dark-Kawaii `#121216`, `#1A1A22`, `#8B5CF6`, `#E60067`)
- Home em grade bento/magazine com abas Mais comentados / Mais curtidos / Mais recentes e filtro por categoria (tags do fórum).
- Sidebar: busca instantânea, mais recentes, menu cronológico expansível (Ano → Mês → Artigos), vitrine Shopee contextual (`shopee.json`) e convite da Cringelândia.
- Curtir e comentar com login Discord; deslogado vê um modal convidando a entrar.
- Compartilhamento com marca d'água (barra no rodapé da imagem: logo, título, `@autor`, `pyxie.com.br/hyperfokus`) e botões WhatsApp, X, Reddit, Pinterest, Bluesky, Copiar link.
- Páginas `/hyperfokus/como-participar` e `/hyperfokus/termos-e-regras` (proibição de IA, fontes confiáveis, direitos autorais).

**As 12+1 automações de tráfego**
1. Espelhamento local da mídia do Discord CDN (links expiram) → `.webp` com nome pelo slug e `alt` descritivo.
2. Ping IndexNow ao aprovar/editar.
3. Sitemap dinâmico `/sitemap-hyperfokus.xml` com `lastmod` real + WebSub.
4. Auto-Internal Linker (palavras-chave de outros artigos viram link interno).
5. JSON-LD (`BlogPosting`, `BreadcrumbList`, `Person`, `Organization`).
6. Extrator de FAQ (subtítulos terminados em `?` → `FAQPage`).
7. Capa OpenGraph 1200×630 gerada com sharp.
8. Fila do Pinterest com pin vertical 1000×1500.
9. Páginas-pilar por categoria `/hyperfokus/categoria/:slug`.
10. Parede de engajamento suave (passou de 60% de leitura → card convidando para a Cringelândia / "Como publicar").
11. linkSentinel também nas fontes citadas, com fallback Wayback Machine.
12. Shopee contextual por tag do artigo.
13. Analytics próprio no painel: origem do tráfego, páginas de entrada, termos buscados, profundidade de rolagem (25/50/75/100%), tempo de leitura, cliques Shopee por artigo, cliques no convite.

**Ideias complementares** do PDF: ferramentas interativas indexáveis (o dono anotou "inúteis para 99% da humanidade": **não faça**), glossário "Wiki-Fokus" (dono não entendeu; **fica fora**, só registre como ideia no diário), Google Discover (imagens ≥1200 px + `max-image-preview:large`).

**Comentários do dono (prioridade alta, vieram depois do PDF)**
- **Pinterest:** a conta tomou shadowban por ~10 pins/dia no mesmo horário. Os pins antigos serão apagados pelo dono. Quer **3 pins por dia, espalhados nos horários de pico**, com alt text, hashtags relacionadas, link do site e o que mais ajudar SEO/reputação. A fila precisa ser organizada a partir do RSS.
- **Acessibilidade e personalização:** controles de leitura estilo Kindle (aumentar/diminuir texto etc.) **sem afetar o SEO**.
- **Conta sem Discord** (e-mail e senha). Qualquer conta envia posts para análise. Diferença: pelo Discord o tópico aparece no fórum mesmo antes da aprovação; pelo site, o texto fica como rascunho na conta até ser enviado para análise.
- **Editor de código sofisticado** no site, com busca em repositórios do GitHub para citar código (fase posterior, ver fase 7).
- **Botão de destaque do Blog na home do site.** Os menus atuais não comportam mais opções nem as subcategorias que já existem: redesenhar a navegação.
- **Lembrete de bump** como automação no painel, com cargo para marcar. **Regra geral nova: todo seletor de cargo para marcar aceita vários cargos.**
- **Dúvida:** login centralizado ou um OAuth por área? Resposta na seção 3.1.

---

## 2. Conflitos do PDF com as regras do projeto (resolva assim)

| O PDF diz | Regra do projeto | Faça |
| --- | --- | --- |
| Fila em `/admin/hyperfokus`, analytics em `/admin/analytics` | §10: `/admin` está desligado, nada novo lá | Seções novas no `/dashboard` (área global do dono + Cringelândia), API em `src/routes/dashboardRoutes.js` |
| Telemetria em SQLite | §12: stack fixa PostgreSQL + Drizzle | Analytics em PostgreSQL (tabelas agregadas por dia), nada de SQLite |
| `articles.json` como banco | §6: transações em PostgreSQL; JSON só com escrita atômica | Ver decisão 3.2 |
| `client.guilds.cache.has()` no site | O site (`server.js`) e o bot (`index.js`) são processos diferentes | Perguntar ao bot pelo `src/services/botBridge.js` ou ler `data/liveGuildsSnapshot.json` |
| Cron/backup/pins dentro do site | §3: agendadores só no processo do bot | `ctx.registerCron` / `ctx.registerInterval` com `ctx.isBotProcess` |
| Textos fixos em português no prompt | §1: tudo PT/EN | Toda string via `t()` com par `pt`/`en`; páginas com `?lang=en`; seoRenderer com os dois |
| `src/modules/hyperfokus/` novo, sem citar o que existe | Já existe o fórum de hiperfocos no módulo `community` (`src/modules/community/index.js`, `data/hyperfocusPending.json`, `src/services/communityConfig.js`, que comenta tópicos sem resposta e paga `rewardCoins`) | Criar o módulo `hyperfokus` **reaproveitando** `communityConfig.hyperfocus.forumIds`. O comentário automático do `community` **não pode** disparar em tópico em rascunho. Não crie segunda recompensa em moedas na aprovação (§5); se o dono quiser, só com teto, cooldown e atomicidade |
| "Pinga o Googlebot" via sitemap | O ping de sitemap do Google foi desativado em 2023 | Use `lastmod` correto e Search Console; WebSub só para o feed RSS/Atom (hub `pubsubhubbub.appspot.com`). IndexNow cobre Bing/Yandex/Naver/Seznam, não o Google |
| `NewsArticle` + `BlogPosting` juntos | Tipos duplicados confundem o Google | Use `BlogPosting`. `NewsArticle` só se o dono cadastrar no Google News |
| FAQPage como rich snippet | Desde 2023 o Google só mostra FAQ rico para sites de governo/saúde | Implemente (é barato e ajuda Bing/IA), mas prioridade baixa |

Também conserte, porque afetam você (agente):
- `.agents/hooks.json` aponta para `E:/botMelody/.agents/hooks/pre-tool-validator.sh`. O repositório agora é `E:/Pyxie`: o gancho não roda. Corrija o caminho.
- `docs/agents/08-seo.md` tem links `file:///e:/botMelody/...`. Troque por caminhos relativos.

---

## 3. Decisões de arquitetura (já tomadas; siga)

### 3.1 Login: **uma identidade, uma sessão, permissões por área**
Resposta à dúvida do dono. Não crie um OAuth por área.
- Um único app OAuth do Discord (`src/services/discordOAuth.js` já existe) e **uma conta Pyxie** por pessoa (`accounts`), ligada a um Snowflake do Discord **ou** a e-mail+senha (e, depois, os dois ligados).
- Uma sessão para o site inteiro. Hoje o painel usa `src/services/panelSessions.js` (cookie `pyxie_panel`, `data/panelSessions.json`, HMAC com `PANEL_SECRET`). Generalize para uma sessão de site (cookie `HttpOnly`, `Secure`, `SameSite=Lax`) e mantenha o painel exigindo escopo `guilds` e as checagens de `src/services/panelAccess.js`.
- **Escopos incrementais:** o blog só pede `identify`. O painel pede `identify guilds` quando a pessoa entra nele. Assim ninguém dá acesso à lista de servidores só para curtir um artigo.
- **Autorização por área** (blog, `/meu-perfil`, divulgação, painel) em funções separadas no backend. Ser dono do Snowflake de um artigo não dá nada no painel e vice-versa.
- Por quê: uma conta só deixa o `/meu-perfil` juntar artigos e divulgações, a indicação contar certo e o anti-autoindicação funcionar. Separar sessões só traria logins repetidos e contas duplicadas.

### 3.2 Persistência
- **PostgreSQL + Drizzle** (`src/database/schema.js`, migração nova) para: `hyperfokus_articles`, `hyperfokus_article_authors`, `hyperfokus_likes`, `hyperfokus_comments`, `accounts` (+ `account_identities`), `hyperfokus_analytics_daily`, `hyperfokus_pin_queue`, `partner_referrals`. Curtidas, comentários e contadores têm concorrência; JSON não aguenta.
- **JSON atômico** (`.tmp` + rename) para configuração e estado efêmero: `data/hyperfokus/config.json`, `data/hyperfokus/drafts.json` (rascunhos do Discord).
- **Backup diário** exporta artigos + autores + caminhos de mídia para `data/backups/hyperfokus/backup_{YYYY-MM-DD}.json`, guardando os últimos 30.
- Mídia: `public/uploads/hyperfokus/` (imagens dos artigos) e `public/uploads/hyperfokus/avatars/{snowflake}_{timestamp}.webp`.
- Se o PostgreSQL não estiver disponível no ambiente de teste, siga o padrão do `tests/postgresDrizzle.test.js` (não invente mock de dados na tela: §12 "zero mock").

### 3.3 Onde fica cada coisa
```
src/modules/hyperfokus/
  README.md                 # §3 obrigatório
  index.js                  # ciclo de vida, listeners, crons (só no bot)
  threadGuard.js            # trava de digitação + sticky com debounce
  commands/                 # py-add, py-concluir (slash + prefixo, PT/EN)
  draftStore.js             # data/hyperfokus/drafts.json atômico
  articleStore.js           # Drizzle: CRUD de artigos, autores, likes, comentários
  markdown.js               # Markdown do Discord → HTML sanitizado
  mediaArchiver.js          # Discord CDN → webp local
  seoEngine.js              # JSON-LD, FAQ, linker, sitemap, RSS, IndexNow
  imageCards.js             # OG 1200x630, pin 1000x1500, marca d'água
  pinScheduler.js           # fila do Pinterest
  analyticsManager.js       # coleta e agregação
src/routes/hyperfokusRoutes.js   # rotas públicas e API do blog
client/src/pages/hyperfokus/     # páginas React do blog
client/src/dashboard/Hyperfokus.jsx, HyperfokusAnalytics.jsx
tests/hyperfokus.test.js         # entra no "test" do package.json
```
Rotas públicas: `/hyperfokus`, `/hyperfokus/:slug`, `/hyperfokus/categoria/:slug`, `/hyperfokus/autor/:userId`, `/hyperfokus/como-participar`, `/hyperfokus/termos-e-regras`, `/hyperfokus/rss.xml`, `/sitemap-hyperfokus.xml`, `/api/hyperfokus/share-image/:articleId`, `/meu-perfil`.
Rotas privadas no `robots.txt` com `Disallow`: `/meu-perfil`, `/api/hyperfokus/` (exceto a imagem de compartilhamento, se precisar ser rastreável), `/auth/`.

### 3.4 SSR é obrigatório nas páginas de artigo
O Google e os robôs de prévia (Discordbot, WhatsApp, Pinterestbot) precisam do texto completo, título, metas e JSON-LD **na primeira resposta HTML**. Renderize no servidor (Express) o HTML do artigo, das categorias e da home do blog, e deixe o React só hidratar a interatividade (curtir, comentar, controles de leitura, busca). O conteúdo para robô e para gente é o mesmo (proibido cloaking, `docs/agents/08-seo.md` §5).

---

## 4. Fases

Cada fase lista **entregas**, **pontos de atenção** e o portão (seção 6).

### Fase 0: Fundação (meio dia)
- Corrigir os caminhos `botMelody` (seção 2).
- Migração Drizzle das tabelas da 3.2. Esqueleto do módulo `hyperfokus` registrado no `moduleManager` com `README.md`.
- Chaves i18n base em `src/utils/i18n.js` (PT/EN) e `client/src/dashboard/i18n.js`.
- `tests/hyperfokus.test.js` criado e incluído no `npm test`.
- **Atenção:** confirme o ID do canal de fórum pelo `communityConfig` da Cringelândia `1453890868980482090`; não fixe IDs no código.

### Fase 1: Fluxo no Discord
- `threadCreate` no fórum configurado → registra rascunho `{ threadId, ownerId, collaborators: [], status: 'DRAFT', stickyMessageId: null }`.
- `messageCreate`: em `DRAFT`, apaga mensagem de quem não é autor/coautor e avisa (efêmero não existe em `messageCreate`: use DM e, se a DM falhar, uma resposta que se apaga em ~8 s).
- Sticky com debounce de 3 s (uma mensagem só; apaga a anterior antes de reenviar; sem loop quando a própria Pyxie posta).
- `/py-add` e `py!add` (apelidos PT e EN), só dentro de tópicos desse fórum e só pelo autor. `/py-concluir` e `py!concluir` + botão.
- Concluir → `PENDING_REVIEW`, libera o tópico, monta o pacote e manda para a fila.
- Ajuda e catálogo (§4): registrar em `COMMAND_CATEGORY_MAP`, escopo Cringelândia, aparecer em `/api/commands` marcado como Cringelândia.
- **Atenção:**
  - **Isenções da trava:** a própria Pyxie, outros bots do servidor e a staff com `ManageThreads`/`ManageMessages` (para moderar). Registre no diário se o dono quiser tirar a isenção da staff.
  - Reinício do bot: rascunhos vêm do JSON; nada em memória só.
  - Rate limit: apagar mensagens em massa (flood de um troll) não pode derrubar o bot. Use fila por tópico.
  - Voz da Pyxie (§14): aviso de rascunho e sticky em tsundere leve ("Ei, ei! Esse cantinho ainda é do autor... volta quando estiver pronto, hmpf."). **Se o tópico tiver tag sensível** (saúde mental, autismo, sensorial, crise, luto), tom acolhedor e sem ironia.
  - Embeds no padrão §9 e prévia real §11 no canal `1461937203214024891`, sem pings.

### Fase 2: Fila de validação no painel
- Seção nova no `/dashboard` (área da Cringelândia, só o dono, conforme `panelAccess`): lista de pendentes, visualização como ficará no site, editor Markdown com pré-visualização ao vivo, campos `seoTitle` e `metaDescription` (com contador: título ≤ 60, descrição ≤ 160), escolha da imagem de capa, aprovar/recusar com motivo.
- Aprovar dispara, nesta ordem: espelhar mídia → salvar artigo (transação) → gerar OG/pin → sitemap/RSS → IndexNow → trocar o sticky pelo embed de celebração.
- Edição posterior de artigo publicado (atualiza `updatedAt`, reenvia IndexNow).
- **Atenção:**
  - Backend recusa o que a tela esconde (§10); `X-Pyxie-Panel: 1` em tudo que muda.
  - Aprovação **idempotente**: dois cliques não publicam duas vezes.
  - Falha no meio (ex.: CDN fora) não deixa artigo meio publicado: mídia primeiro, publicação depois.
  - **Sem pré-checagem automática** (o dono disse não).

### Fase 3: Site público do blog
- Home bento, artigo, categoria, autor, busca, menu cronológico, sidebar com Shopee e convite, páginas institucionais.
- Coautores com modal "outros N".
- Curtir/comentar com login (modal elegante para deslogado). Comentários com moderação: a staff pode ocultar; denúncia abre ticket.
- **Leitor acessível (pedido do dono):** barra de leitura com tamanho do texto (A−/A+, 5 passos), largura da coluna, espaçamento de linhas, fonte para dislexia (ex.: Atkinson Hyperlegible ou OpenDyslexic, auto-hospedada), tema escuro/sépia/alto contraste, e respeito a `prefers-reduced-motion`. Tudo em CSS (variáveis) e guardado em `localStorage`; para quem está logado, também na conta. **Não muda o HTML servido nem a URL**, então não mexe no SEO.
- **Navegação nova do site:** o dono quer um botão de destaque "Blog" na home e os menus atuais não comportam as subcategorias. Faça um menu com grupos (mega-menu no desktop, gaveta com seções expansíveis no celular) em `client/src/components/layout/Navbar.jsx` e nas páginas estáticas de `public/*.html` que têm menu próprio. O Blog fica em destaque visual (cor `#E60067`).
- **Atenção:**
  - **XSS:** o Markdown vem de usuários. Converta e sanitize no servidor (lista branca de tags/atributos; `rel="nofollow ugc noopener"` em links externos; sem `javascript:`). Sem `dangerouslySetInnerHTML` com texto cru.
  - Exatamente um `<h1>` por página (o título do artigo); os `#` do autor viram `<h2>`/`<h3>`.
  - `alt` em toda imagem, inclusive avatares ("Foto de perfil de @nome").
  - Mobile primeiro: 360 px sem rolagem horizontal; imagens com `srcset` e `loading="lazy"` (menos a capa, que é a LCP).
  - Datas no fuso de Brasília e no formato do idioma.

### Fase 4: Motor de SEO (automações 1 a 7, 9, 11 e 12)
- `mediaArchiver`: baixa **só** de `cdn.discordapp.com` e `media.discordapp.net` (lista fixa; evita SSRF), limite de tamanho (ex.: 15 MB), confere o tipo real com sharp, `.webp` com nome `slug-NN.webp`, `alt` vindo da legenda ou do título.
- `seoEngine`: metadados PT/EN no `seoRenderer.js` (ou função equivalente para rotas dinâmicas), canonical sem query, hreflang, `robots: max-image-preview:large`, JSON-LD `BlogPosting` + `BreadcrumbList` + `Person` (cada autor, com `url` da página de autor) + `Organization`.
- Auto-Internal Linker **na hora de renderizar**, nunca gravando no texto do autor (o texto é autoral). Máximo 1 link por artigo-alvo e 5 por artigo; ignora títulos, código, citações e links já existentes; não liga o artigo nele mesmo.
- FAQPage a partir de `##`/`###` terminados em `?` (prioridade baixa, ver seção 2).
- Capa OG 1200×630 e marca d'água com sharp, reaproveitando os pontos onde o sharp já é carregado (`server.js`, `src/modules/museum/museumManager.js`) e a skill `sharp-image-and-seo-saas`. Contraste do texto sobre a imagem ≥ 4.5:1.
- `/sitemap-hyperfokus.xml` com `lastmod` real, referenciado no `robots.txt` e no `sitemap.xml` principal (índice). RSS/Atom do blog em `/hyperfokus/rss.xml` via `src/services/feedGenerator.js`, com WebSub.
- IndexNow pelo `src/services/indexNowService.js` existente, na aprovação e na edição.
- Páginas-pilar por categoria com texto introdutório (editável no painel) e meta descrição própria.
- linkSentinel (`src/services/linkSentinel.js`): registrar as fontes externas dos artigos aprovados; ao cair, servir o snapshot do Wayback.
- Shopee contextual: mapear tags do artigo para categorias de `shopeeManager.getActiveItems()`; links com `rel="sponsored nofollow"`.
- **Marca d'água "obrigatória":** dentro do artigo as imagens aparecem limpas (leitura e Google Imagens). A versão com a barra Pyxie é a que sai pelos botões de compartilhar/baixar e pelo endpoint `/api/hyperfokus/share-image/:articleId`, e é a usada nos pins e no OG. Registre essa escolha no diário.

### Fase 5: Fila do Pinterest (comentário do dono, alta prioridade)
- O Pinterest lê o RSS sozinho. Portanto **a fila é o feed**: cada pin tem `releaseAt`, e o feed `/rss-pinterest.xml` (já existe em `server.js` e `feedGenerator.js`, hoje só com o Museu) só mostra itens com `releaseAt <= agora`.
- **Orçamento único de 3 pins por dia para a conta inteira** (blog + Museu + tarot juntos). Horários padrão em Brasília com variação aleatória de ±20 min para não repetir o minuto exato: ~12h30, ~18h30, ~21h30 (horários editáveis no painel). Nunca dois itens liberados na mesma hora.
- Cada pin: imagem 1000×1500 própria (não a OG cortada), título ≤ 100 caracteres, descrição ≤ 500 com palavras-chave naturais no começo, até ~5 hashtags relevantes (reaproveite `buildPinterestHashtags`, mas reduza o limite de 12 para pins do blog), `alt` descritivo, link com UTM para o artigo.
- Fila visível e reordenável no painel (pausar, adiar, remover). Item novo entra no fim da fila, nunca furando.
- Os pins antigos o dono apaga à mão; você **não** mexe na conta do Pinterest nem em API dele.
- **Atenção:** se o feed liberar tudo de uma vez num deploy (ex.: `releaseAt` vazio em dados antigos), repete o shadowban. Migração: todo item antigo do feed recebe `releaseAt` futuro distribuído ou fica fora do feed. Teste isso.

### Fase 6: Analytics no painel
- Coleta leve no próprio Express (sem script de terceiros): página vista no servidor + um beacon pequeno (`navigator.sendBeacon`) para rolagem 25/50/75/100% e tempo de leitura ativo (aba visível).
- Origem por `Referer` + UTM (Google, Bing, Pinterest, Discord, Reddit, WhatsApp, direto), página de entrada, termos da busca interna, cliques Shopee por artigo, cliques no convite.
- Agregação diária em PostgreSQL; nada de linha por visita guardada para sempre.
- **Atenção (LGPD e memória):** sem IP cru (use hash diário com sal que gira), filtro de robôs por user-agent, limite por IP no beacon, buffer em memória com teto e descarga periódica (o projeto tem `memoryGuard`; respeite). Parede de engajamento (automação 10) aparece uma vez por sessão, fecha fácil e não cobre o texto.
- Tela no `/dashboard` com gráficos; use dados reais. Sem dados ainda → estado vazio honesto, nunca números de exemplo.

### Fase 7: Contas sem Discord, perfil e editor
- Cadastro por e-mail e senha: hash com `argon2id` (ou `bcrypt` custo ≥ 12), verificação de e-mail, recuperação de senha com token de uso único e validade curta, limite de tentativas, CSRF nos formulários, mensagens de erro que não revelam se o e-mail existe.
- Ligar conta Discord a uma conta de e-mail (mesma pessoa = uma conta).
- Envio pelo site: o rascunho fica na conta; "Enviar para análise" coloca na mesma fila do painel (origem marcada `site`). Pelo Discord continua aparecendo no fórum antes da aprovação.
- `/meu-perfil`: aba "Meus artigos" (estatísticas, solicitar remoção → ticket) e, na fase 8, "Minhas divulgações". Preferências de leitura salvas aqui.
- **Editor de código com busca no GitHub:** comece com blocos de código com destaque de sintaxe e um campo "importar trecho de URL do GitHub" (API pública, só `github.com/*/blob/*`, guarda o trecho e o link de origem). Busca completa em repositórios fica registrada como próxima etapa no diário.
- **Atenção:** criação de conta e senha são dados sensíveis: nada em query string, nada em log. Em testes use contas de teste geradas no próprio teste.

### Fase 8: Divulgação e indicação (por último)
- Separar vitrines: **"Divulgue seu servidor"** no `/dashboard/servidores` (exige a Pyxie no servidor; consulta pelo `botBridge`; `guildDelete` pausa a divulgação) e **"Divulgue seu projeto"** em `/hyperfokus/projetos` (criadores, lojas, ONGs etc., triados pelos formulários de `src/modules/partnerships/formSchemas.js`).
- Autoatendimento em `/meu-perfil`: editar título, texto, link, banner; bump (24 h); excluir a própria divulgação.
- Indicação `/divulgar?ref={snowflake}`: conta quando o indicado faz login e tem a primeira divulgação aprovada (ou adiciona a Pyxie e publica). Antifraude: mesmo Snowflake, mesma conta ligada, mesmo hash de IP no mesmo dia não contam. Contador `referralsCount` transacional.
- Bordas cosméticas: 1 indicação → Neon Lilás `#8B5CF6` + selo; 3 → Cyber-Pink animada `#E60067` + prioridade; 5+ → Ouro Místico `#F59E0B` + 4 molduras. Animação respeita `prefers-reduced-motion`. **Não são moedas** (§5 não se aplica, mas registre no diário).
- **Lembrete de bump** como automação no painel (aba de automações), com seleção de **vários cargos** para marcar.
- **Regra nova para todo o painel:** todo seletor de cargo para marcar aceita vários cargos. Faça um levantamento dos seletores existentes (`client/src/dashboard/*.jsx`) e liste no diário quais ainda são de cargo único; troque os que forem simples.

---

## 5. Skills e regras que você deve usar

### Já existem no repositório (`.agents/`)
| Skill/regra | Quando |
| --- | --- |
| `rules/pyxie-persona-voice.md` (sempre ligada) | Todo texto da Pyxie: sticky, avisos, celebração, modal de login, parede de engajamento, páginas institucionais |
| `rules/zero-mock-and-tenant-isolation.md` (sempre ligada) | Painel, APIs e analytics: zero dados de exemplo; nada da Cringelândia vaza para outros servidores |
| `rules/frontend-web-mobile-seo.md` | Qualquer arquivo em `client/`, `public/`, `server.js`, `seoRenderer.js`, `feedGenerator.js` |
| `skills/browser-and-screenshot` | Toda validação visual (seção 6). Instale o Playwright como dependência de desenvolvimento se for usar script; o Puppeteer do exemplo não está instalado |
| `skills/sharp-image-and-seo-saas` | Capas OG, pins, marca d'água, avatares, JSON-LD, RSS, IndexNow |
| `skills/discord-v2-multi-tenant` | Comandos `py-add`/`py-concluir`, embeds, botões, escopo Cringelândia |
| `skills/discord-mcp-integration` | Prévias reais no canal `1461937203214024891` |

### Crie no início (fase 0)
- **`.agents/skills/hyperfokus-blog/SKILL.md`**: um resumo curto deste plano (rotas, tabelas, fluxo de status `DRAFT → PENDING_REVIEW → PUBLISHED | REJECTED`, regras de autoria, Pinterest 3/dia). Serve para você e para sessões futuras não precisarem reler tudo.
- **`.agents/skills/visual-qa/SKILL.md`**: o roteiro da seção 6 em forma de checklist executável, com o script de captura.

### Ferramentas do Antigravity
- **Browser subagent** para navegar no site local, tirar prints, gravar a sequência de cliques (fluxo de login, curtir, abrir modal de coautores) e anexar ao diário.
- **Terminal** para `npm test`, Lighthouse e `curl` de robôs.
- Revisão de artefatos: anexe prints e gravações às suas mensagens de conclusão de fase.

---

## 6. Autovalidação visual e técnica (portões)

Salve as evidências em `data/screenshots/hyperfokus/<fase>/` (a pasta `data/` não vai para o Git) e liste os arquivos no diário.

### 6.1 Roteiro de prints (toda fase com tela)
Para cada página nova ou alterada:
1. Larguras **360**, **768** e **1440** px; tema escuro (padrão) e, onde existir, claro.
2. `?lang=pt` e `?lang=en`: **nenhum texto no idioma errado** (procure por palavras em português na versão em inglês e vice-versa).
3. Zoom do navegador em 200% e o leitor no tamanho máximo de texto: nada cortado, nada sobreposto, sem rolagem horizontal.
4. Com `prefers-reduced-motion: reduce`: bordas animadas e transições paradas.
5. Estados: vazio (zero artigos), com 1 artigo, com muitos (use dados reais criados no teste, não mocks na tela), carregando, erro, deslogado e logado.
6. Coautores com 1, 2 e 7 autores; abrir o modal "outros 5".
7. Compare com prints **de antes** das páginas que já existiam (home, tarot, museu, wiki) depois do menu novo: o menu não pode quebrar nenhuma delas.

### 6.2 Olhar para as imagens geradas
Abra e **olhe de verdade** (leia o PNG/WebP gerado como imagem) cada tipo:
- Capa OG 1200×630: título legível em tela de celular, sem cortar no meio da palavra, acentos certos, avatares redondos, sem texto encostando na borda.
- Pin 1000×1500: hierarquia clara, título grande, marca discreta, nada do Discord vazando (sem nome de canal, sem ID).
- Imagem com marca d'água: a barra não cobre conteúdo importante, contraste ≥ 4.5:1.
- Avatares `.webp` salvos: abrem, têm tamanho razoável (< 30 KB).
Teste com título curto, título com 120 caracteres, título só com emojis e título com acentos e `ç`.

### 6.3 SEO verificável
- `curl -A "Googlebot" http://localhost:<porta>/hyperfokus/<slug>` e o mesmo com `Discordbot`, `Pinterestbot` e `WhatsApp`: o HTML bruto tem título, texto completo, `og:*`, `twitter:*`, canonical, hreflang e JSON-LD. Compare com o que um navegador comum recebe: **mesmo conteúdo**.
- Valide o JSON-LD com um parser (JSON válido, `@context`, campos obrigatórios de `BlogPosting`: `headline`, `image`, `datePublished`, `author`).
- Lighthouse (`npx lighthouse <url> --only-categories=seo,accessibility,performance --form-factor=mobile`): metas **SEO 100, Acessibilidade ≥ 95, Performance ≥ 80 no celular**. Guarde o relatório.
- Verificação de acessibilidade automatizada (axe-core pelo Playwright): zero violações sérias.
- Um `<h1>` por página; toda `<img>` com `alt` não vazio.
- `/sitemap-hyperfokus.xml` e `/hyperfokus/rss.xml` válidos (parse XML sem erro), `robots.txt` com os `Disallow` novos.
- `tests/seoBilingual.test.js` passando e estendido para as rotas do blog.

### 6.4 Discord
- Prévia real (§11) do sticky, do aviso de rascunho, do embed de celebração e da mensagem de recusa no canal `1461937203214024891`, sem pings. Tire print da prévia e confira: título curto com um emoji, `\n\n`, números em `código`, links mascarados, `setFooter({ text })`.
- Teste do Thread Guard no servidor de testes: pessoa de fora digita → mensagem some e o aviso chega; coautor adicionado digita → fica; depois de concluir → todo mundo comenta.

### 6.5 Pinterest
- Teste automatizado: com 10 itens na fila, o feed nunca expõe mais de 3 por dia, nunca dois na mesma hora, e um deploy não libera o acumulado.
- Abra `/rss-pinterest.xml` no navegador e confira os itens liberados.

### 6.6 Testes e encerramento
- `npm test` 100% (no Windows, `bash scripts/test-safe.sh`). Inclui o teste de fumaça dos comandos novos e a paridade i18n.
- `npm run build:client` sem erro e sem aviso novo.
- Commit por fase, mensagem descritiva. **Deploy na VM só com o OK do dono.**

---

## 7. Onde se atentar mais (lista curta, em ordem de risco)

1. **Segurança do conteúdo de usuário:** sanitização do Markdown, upload/espelhamento de mídia (SSRF, tamanho, tipo), comentários. É o lugar mais fácil de abrir um buraco.
2. **Contas e senhas (fase 7):** hash forte, verificação de e-mail, limite de tentativas, CSRF, cookies `HttpOnly`/`Secure`. Nada de senha ou token em log ou URL.
3. **Pinterest:** nunca liberar mais de 3 por dia nem em rajada depois de deploy. Um erro aqui repete o shadowban.
4. **SSR e paridade robô/humano:** artigo sem SSR não ranqueia; conteúdo diferente para robô é penalizado.
5. **Bilinguismo:** cada string nova com par PT/EN; o teste de paridade pega chaves, mas não pega texto fixo em JSX. Procure à mão.
6. **Processos separados:** site e bot não compartilham memória. Tudo que precisa do Discord passa pelo `botBridge`; crons só no bot.
7. **Integridade da autoria:** texto do autor nunca é alterado ao gravar (linker só na renderização); edição do admin fica registrada (`editedBy`, `editedAt`); "últimos dados conhecidos" quando a conta some.
8. **Voz da Pyxie:** tsundere nas mensagens do fluxo; acolhedora e sem ironia quando o tema é sensível. Nada de "Claro!"/"Aqui está" nem vilão arcaico.
9. **LGPD e privacidade no analytics:** sem IP cru, sem dado pessoal em URL, página de privacidade (`public/privacy.html`) atualizada com o que o blog coleta, em PT e EN.
10. **Desempenho na VM ARM:** geração de imagens com sharp em fila (uma por vez), cache das imagens geradas em disco, sem regenerar a cada visita.

---

## 8. Fora do escopo (não faça sem pedido novo)
- Ferramentas interativas indexáveis (tarot online, calculadora de ship etc.) como iscas de tráfego.
- Glossário "Wiki-Fokus".
- Pré-checagem automática de qualidade na fila.
- Postar no Pinterest por API ou mexer na conta do Pinterest.
- Qualquer coisa no `/admin` antigo.
- Deploy sem o OK do dono.
