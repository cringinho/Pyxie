# Diário de Execução: Pyxie Hyperfokus

## Fase 0: Fundação & Infraestrutura
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] Correção dos caminhos legados `botMelody` em `.agents/hooks.json` e `docs/agents/08-seo.md`.
  - [x] Criação das skills operacionais `.agents/skills/hyperfokus-blog/SKILL.md` e `.agents/skills/visual-qa/SKILL.md`.
  - [x] Esquema Drizzle das 8 tabelas do Hyperfokus em `src/database/schema.js`:
    - `hyperfokus_articles`, `hyperfokus_article_authors`, `hyperfokus_likes`, `hyperfokus_comments`, `hyperfokus_pin_queue`, `hyperfokus_analytics_daily`, `accounts`, `partner_referrals`.
  - [x] Esqueleto do módulo `src/modules/hyperfokus/` com `README.md`, `index.js`, `draftStore.js` e `articleStore.js`.
  - [x] Registro automático do módulo `hyperfokus` no `moduleManager.js` com escopo Cringelândia (`1453890868980482090`).
  - [x] Integração de canais de fórum via `src/services/communityConfig.js`.
  - [x] Chaves i18n base PT/EN no bot (`src/utils/i18n.js`) e no painel (`client/src/dashboard/i18n.js`), auditadas com 100% de paridade.
  - [x] Criação da suíte `tests/hyperfokus.test.js` e inclusão no pipeline de testes em `package.json`.
- **Validação:**
  - `tests/i18nParity.test.js`: 100% aprovado.
  - `tests/postgresDrizzle.test.js`: 100% aprovado.
  - `tests/hyperfokus.test.js`: 100% aprovado.

---

## Fase 1: Fluxo no Discord (Thread Guard & Comandos)
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] `src/modules/hyperfokus/threadGuard.js`:
    - Trava estrita de digitação no fórum: apaga mensagens de terceiros e envia aviso educado (DM prioritária, fallback de 8s no chat).
    - Detecção contextual de tags sensíveis (saúde mental, autismo, luto, crise) com tom acolhedor e sem ironia, mantendo tsundere leve nos demais tópicos.
    - Isenção automática para bots e membros da staff com `ManageThreads` ou `ManageMessages`.
    - Sticky dinâmico com debounce de 3 segundos no rodapé do tópico com botão interativo `✅ Concluir e postar`.
    - Rate limit contra flood de mensagens não autorizadas.
  - [x] `src/modules/hyperfokus/markdown.js`:
    - Parser seguro com blindagem anti-XSS e estruturação de cabeçalhos (`<h2>`/`<h3>`, zero `<h1>` gerado).
    - Sanitização de links (`javascript:` bloqueado) com atributos `rel="nofollow ugc noopener"` e `target="_blank"`.
  - [x] Comandos de Coautoria e Conclusão:
    - `/py-add` e `py!add`: inclusão de coautores pelo autor original.
    - `/py-concluir` e `py!concluir`: encerramento do rascunho, montagem do pacote e envio para a fila editorial (`PENDING_REVIEW`).
    - Registrados em `COMMAND_CATEGORY_MAP` sob `social` com escopo Cringelândia.
  - [x] Prevenção de concorrência com o módulo `community`: tópicos em `DRAFT` não recebem comentário automático nem premiação prematura.
  - [x] Despacho de prévia real no canal de homologação `1461937203214024891` (Msg ID: `1565503736598503657`).
- **Validação:**
  - `scripts/smoke_all_commands.js`: 132/132 comandos aprovados com 0 erros.
  - `tests/hyperfokus.test.js`: 100% aprovado.

---

## Fase 2: Fila de Validação no Painel (/dashboard)
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] Rotas de API no painel em `src/routes/dashboardRoutes.js`:
    - `GET /api/dashboard/guilds/:guildId/hyperfokus/queue`: lista artigos com status `PENDING_REVIEW`.
    - `GET /api/dashboard/guilds/:guildId/hyperfokus/articles`: lista artigos por status (`PUBLISHED`, `REJECTED`).
    - `GET /api/dashboard/guilds/:guildId/hyperfokus/articles/:id`: detalhes completos do artigo.
    - `PUT /api/dashboard/guilds/:guildId/hyperfokus/articles/:id`: atualização editorial (`seoTitle`, `metaDescription`, `contentMarkdown`, `coverImage`, etc.).
    - `POST /api/dashboard/guilds/:guildId/hyperfokus/articles/:id/publish`: aprovação idempotente com notificação instantânea via IndexNow (`src/services/indexNowService.js`) e anúncio no tópico do Discord.
    - `POST /api/dashboard/guilds/:guildId/hyperfokus/articles/:id/reject`: recusa editorial com motivo.
  - [x] Frontend do Painel em `client/src/dashboard/Hyperfokus.jsx`:
    - Cards de estatísticas (Fila de Validação, Artigos Publicados, Recusados).
    - Abas interativas de navegação.
    - Editor editorial completo com contadores de caracteres (`seoTitle` ≤ 60, `metaDescription` ≤ 160).
    - Split preview com renderização de Markdown em tempo real.
    - Modais de recusa e confirmação de publicação com links oficiais.
  - [x] Integração na barra lateral em `Shell.jsx` (ícone `BookOpen`, grupo `content`) e em `Dashboard.jsx` (`WIDE_SECTIONS` ativo).
  - [x] Registro da seção `hyperfokus` em `SECTION_REGISTRY` restrita à Cringelândia e ao dono.
  - [x] Compilação do cliente Vite com 100% de sucesso (`npm run build:client`).
- **Validação:**
  - `tests/hyperfokus.test.js`: Fila, atualização, limites de caracteres e publicação idempotente aprovados.
  - Despacho de prévia no Discord confirmado (Msg ID: `1565505130823159830`).

---

## Fase 3: Site Público do Blog (SSR & Rotas Web)
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] Motor de renderização SSR `src/modules/hyperfokus/renderer.js`:
    - `/hyperfokus`: Home em layout bento/magazine (Artigo Destaque hero + grid de artigos com tags, autores e tempo de leitura).
    - `/hyperfokus/:slug`: Artigo completo em SSR com título único `<h1>`, metadados de leitura, data no fuso de Brasília (BRT), capa LCP, corpo com auto-internal links e sanitização anti-XSS.
    - `/hyperfokus/categoria/:slug`: Páginas-pilar por categoria com listagem filtrada.
    - `/hyperfokus/autor/:userId`: Perfil público do autor com lista de hiperfocos publicados.
    - `/hyperfokus/como-participar` e `/hyperfokus/termos-e-regras`: Páginas institucionais com compromisso anti-IA e regras de autoria.
  - [x] Leitor Acessível (Kindle style):
    - Barra de ferramentas em CSS nativo (variáveis CSS):
      - 5 níveis de tamanho de fonte (A-/A+, 14px a 22px).
      - 3 larguras de coluna (compacto 640px, normal 780px, largo 960px).
      - 3 espaçamentos de linha (1.4, 1.75, 2.0).
      - Alternância para fonte de alta legibilidade para dislexia.
      - 3 temas: Escuro (`#080410`), Sépia (`#f5eedc`) e Alto Contraste (`#000000`).
    - Persistência em `localStorage` (`hyperfokus_reader_pref`) sem alterar o HTML renderizado pelo servidor e sem gerar impacto no SEO.
  - [x] Modal de Coautores interativo e acessível quando o artigo possui múltiplos autores.
  - [x] Destaque visual "Blog" na navegação principal:
    - `client/src/components/layout/Navbar.jsx` com botão de destaque `#E60067` com efeito neon e paridade PT/EN.
    - `public/index.html` com badge e link no menu principal e no dropdown "Explorar".
    - Compilação dos bundles React/Vite com 100% de sucesso.
  - [x] Rotas de interação:
    - `POST /api/hyperfokus/articles/:id/like`: curtir artigo (com contador dinâmico e suporte a convidados).
    - `POST /api/hyperfokus/articles/:id/comments` e `GET /api/hyperfokus/articles/:id/comments`: envio e listagem de comentários sanitizados (limite de 1000 caracteres).
- **Validação:**
  - `tests/hyperfokus.test.js`: Todos os testes de SSR, contagem única de `<h1>` e formulários aprovados.

---

## Fase 4: Motor de SEO (Automações 1-7, 9, 11, 12)
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] `src/modules/hyperfokus/mediaArchiver.js`:
    - Download seguro de imagens exclusivo de `cdn.discordapp.com` e `media.discordapp.net` (prevenção rigorosa de SSRF).
    - Teto estrito de 15 MB por arquivo com verificação de tipo real via Sharp e conversão otimizada para `.webp` em `public/uploads/hyperfokus/`.
  - [x] `src/modules/hyperfokus/imageCards.js`:
    - Capa OpenGraph (1200 × 630 px, WebP) com contraste de texto sobre fundo superior a 4.5:1, logo Pyxie, tags e créditos do autor.
    - Pin do Pinterest (1000 × 1500 px, proporção 2:3 vertical, WebP).
    - Marca d'água permanente para compartilhamento e downloads via `/api/hyperfokus/share-image/:id`. Imagens dentro do artigo permanecem limpas para leitura fluida e indexação limpa no Google Imagens.
  - [x] `src/modules/hyperfokus/seoEngine.js`:
    - Canonical autorreferencial sem query string, tags `hreflang` (pt-BR, en e x-default), `robots: max-image-preview:large`.
    - Schema.org JSON-LD estruturado: `BlogPosting`, `BreadcrumbList`, `Person` (com avatar e URL de autor), `Organization` e `FAQPage` (extraída dinamicamente de cabeçalhos `##`/`###` terminados em `?`).
    - Auto-Internal Linker em tempo de renderização: máximo 1 link por artigo-alvo, teto de 5 links internos por página, sem auto-ligação e ignorando blocos `<code>`, `<pre>`, `<a>`, `<h1-6>` e `<blockquote>`.
    - Sitemap dedicado em `/sitemap-hyperfokus.xml` com `lastmod` real para cada artigo publicado.
    - Feed RSS 2.0 em `/hyperfokus/rss.xml` com WebSub.
  - [x] `src/modules/hyperfokus/shopeeContext.js`:
    - Mapeamento contextual de tags do artigo para categorias e produtos ativos do `shopeeManager`.
    - Links afiliados formatados obrigatoriamente com `rel="sponsored nofollow"`.
  - [x] Integração com `linkSentinel` (`src/services/linkSentinel.js`):
    - Fontes externas de artigos aprovados registradas automaticamente para monitoramento diário e contingência pelo Web Archive.
- **Validação:**
  - `tests/hyperfokus.test.js`: Schemas, Sharp, dimensões de imagem, Auto-Internal Linker e Sitemap XML 100% verificados.

---

## Fase 5: Fila do Pinterest (Orçamento de 3 pins/dia)
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] `src/modules/hyperfokus/pinScheduler.js`:
    - Orçamento unificado de estritamente 3 pins por dia para a conta inteira.
    - Horários de pico em Brasília: ~12h30, ~18h30 e ~21h30 BRT.
    - Jitter determinístico de ±20 minutos baseado no hash do ID para nunca repetir o minuto exato e evitar shadowban.
    - Resolução automática de conflitos: espaçamento mínimo de 2 horas entre pins.
    - Limites estritos do Pinterest: título ≤ 100 caracteres, descrição ≤ 500 caracteres, tags e link com parâmetros UTM.
    - Gestão de fila: enfileirar, listar, pausar/despausar e remover pins agendados.
  - [x] Integração do Feed Dedicado `/rss-pinterest.xml` em `src/services/feedGenerator.js`:
    - Alimenta o feed do Pinterest apenas com pins cujo `releaseAt <= agora`.
    - Enclosures WebP de alta resolução com tags `<media:content>` de 1000×1500 px.
  - [x] Rotas de API no painel para a fila de pins em `src/routes/dashboardRoutes.js`:
    - `GET /api/dashboard/guilds/:guildId/hyperfokus/pins`: lista da fila ordenada.
    - `POST /api/dashboard/guilds/:guildId/hyperfokus/pins/:id/toggle`: alternar pausa.
    - `DELETE /api/dashboard/guilds/:guildId/hyperfokus/pins/:id`: excluir da fila.
    - Clientes de API integrados em `client/src/dashboard/api.js`.
- **Validação:**
  - `tests/hyperfokus.test.js`: Agendamento, limites, jitter, conflito de slots e geração de feed validados.
  - `tests/museumPartnerships.test.js`: Feed do Pinterest mantém 100% de compatibilidade regressiva.

---

## Fase 6: Analytics no Painel (Zero-Mock & Conformidade LGPD)
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] `src/modules/hyperfokus/analyticsEngine.js`:
    - Coleta ultra-leve no servidor Express + beacons assíncronos (`navigator.sendBeacon`).
    - Anonimização estrita em conformidade com a LGPD: IPs crus NUNCA são salvos; hashes descartáveis de 16 caracteres com salt diário rotativo.
    - Filtro de robôs e rastreadores baseado em User-Agent para métricas 100% humanas.
    - Buffer em memória com teto e descarga periódica (`flush` a cada 30 segundos ou 100 eventos) para proteger I/O e respeitar o `memoryGuard`.
    - Agregação diária por artigo e global (`analytics_daily.json` com espelhamento para tabela `hyperfokus_analytics_daily` no PostgreSQL via Drizzle).
    - Métricas monitoradas: Page Views, Visitantes Únicos, Tempo Médio de Leitura Ativa, Funil de Rolagem (25%, 50%, 75%, 100%), Cliques em produtos contextuais Shopee e Entradas no Discord.
    - Origens de tráfego por detecção de `Referer` e parâmetros UTM (Google, Bing, Pinterest, Discord, Reddit, WhatsApp, Twitter/X, Direto).
  - [x] Rastreamento Frontend e Parede de Engajamento no `src/modules/hyperfokus/renderer.js`:
    - Script inline nativo com `sendBeacon` sem scripts de terceiros pesados.
    - Registro de visibilidade de página (`document.visibilityState`) para tempo de leitura puramente ativo.
    - Automação 10: Parede de Engajamento Tsundere da Pyxie disparada sutilmente no canto inferior direito aos 70% de rolagem (máximo 1x por sessão, fácil de fechar, sem cobrir o texto).
  - [x] Rota e Interface no `/dashboard` (`client/src/dashboard/Hyperfokus.jsx`):
    - 6 KPI tiles dinâmicos em tempo real: Page Views, Visitantes Únicos, Tempo Médio Ativo, Conclusão 100%, Cliques Shopee e Entradas Discord.
    - Funil visual de retenção de leitura (25%, 50%, 75%, 100%).
    - Tabela de origens de tráfego com contagem e percentual.
    - Gestão completa da fila agendada do Pinterest com visualização de cards, thumbnails, data/hora no fuso de Brasília, pausar/retomar e remoção.
    - Regra Zero-Mock estrita: estado vazio honesto quando não há dados no período.
- **Validação:**
  - `tests/hyperfokus.test.js`: Teste 15 validando anonimização LGPD, filtros anti-robô, beacons de rolagem, cliques e consolidação analítica diária.
  - `npm run build:client`: Compilação de produção do Vite 100% limpa.

---

## Fase 7: Contas sem Discord, Perfil e Editor Autoral
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] Módulo de Contas Unificadas (`src/modules/accounts/accountStore.js` e `index.js`):
    - Hashing seguro de senhas com `crypto.scrypt` (OWASP/NIST recomendado, equivalente a Argon2id, sem binários nativos que falham na VM ARM).
    - Comparação em tempo constante com `crypto.timingSafeEqual` para blindagem contra ataques de temporização (timing attacks).
    - Proteção ativa contra força bruta com rate limiting em memória (máximo 5 tentativas a cada 15 minutos por IP/email).
    - Tokens criptográficos seguros de uso único com expiração (verificação de e-mail em 24h e recuperação de senha em 1h).
    - Mensagens de erro opacas para impedir enumeração de usuários cadastrados.
    - Sessões HttpOnly protegidas com cookies assinados via HMAC (`pyxie_account`).
    - Ligar conta Discord a conta de e-mail (`linkDiscordAccount`), fundindo identidades (mesma pessoa = uma conta única).
    - Persistência híbrida: PostgreSQL com Drizzle ORM (`accounts` table) e escrita atômica em `data/accounts.json`.
  - [x] Rascunhos Web e Submissão para Moderação (`src/modules/hyperfokus/webDraftStore.js`):
    - Usuários logados podem criar e salvar rascunhos diretamente pelo site (`/meu-perfil/escrever`).
    - Botão "Enviar para Moderação" valida título (≥ 5 caracteres) e conteúdo (≥ 100 caracteres), convertendo o rascunho em artigo com status `PENDING_REVIEW` e metadados `source: 'site'`.
    - Os artigos entram diretamente na mesma fila editorial do `/dashboard` para revisão e aprovação unificada.
  - [x] Importador Seguro de Código do GitHub (`src/modules/hyperfokus/githubImporter.js`):
    - Blindagem anti-SSRF: aceita estritamente links públicos de blob do GitHub (`https://github.com/:owner/:repo/blob/:branch/:filepath#L10-L30`).
    - Converte para `raw.githubusercontent.com` com timeout de 6s e teto de 500 KB.
    - Recorta intervalos de linhas indicados no hash `#L...-L...`.
    - Mapeamento automático de linguagens de programação e inclusão de bloco de código formatado com link de atribuição e licença do autor.
  - [x] Telas SSR de Autenticação, Perfil e Editor (`src/modules/hyperfokus/renderer.js`):
    - `/login` e `/cadastro`: Formulários acessíveis, voz tsundere da Pyxie sem tom de assistente, mensagens de erro e paridade PT/EN.
    - `/meu-perfil`: Visão geral da conta, estatísticas consolidadas (artigos, curtidas, comentários), listagem de artigos com botão de ticket de remoção, e sincronização de preferências de leitura acessível (tema, tamanho de fonte, dislexia) persistidas no perfil.
    - `/meu-perfil/escrever`: Ambiente de escrita focado, split preview em tempo real, ferramenta de importação do GitHub e aviso do compromisso anti-IA.
  - [x] Rotas de API e Web:
    - Rotas de autenticação, rascunhos e preferências em `src/routes/accountRoutes.js` montadas em `server.js`.
    - Botão de acesso ao Perfil de Autor adicionado na Navbar desktop e mobile (`client/src/components/layout/Navbar.jsx`).
- **Validação:**
  - `tests/hyperfokus.test.js`: Teste 16 validando criação de conta, login, recuperação de senha, submissão de rascunhos web, regex do GitHub e SSR com exatamente um `<h1>`.
  - `npm run build:client`: Compilação Vite limpa.

---

## Fase 8: Vitrines Separadas, Indicações Antifraude e Bordas Cosméticas
- **Data de conclusão:** 29/10/2026
- **Status:** Concluída ✅
- **Entregas Realizadas:**
  - [x] Motor de Parcerias e Indicações Antifraude (`src/modules/partnerships/showcaseReferrals.js`):
    - Antifraude transacional estrito:
      - Auto-indicação proibida (`referrerId === referredId`).
      - Mesma pessoa/conta já indicada anteriormente bloqueada (`already_referred`).
      - Mesmo hash de IP no mesmo dia bloqueado (`same_ip_fraud_prevented`).
    - Incremento atômico de `referralsCount` tanto em arquivo (`data/referrals.json`) quanto no PostgreSQL via Drizzle (`partnerReferrals`).
    - Desativação automática de vitrine de servidor quando o bot é removido da guilda (`handleGuildDelete` aciona status `PAUSED`).
  - [x] Bordas Cosméticas Progressivas por Nível de Indicação:
    - Tier 1 (1 indicação): **Neon Lilás** (`#8B5CF6`) com brilho suave.
    - Tier 2 (3 indicações): **Cyber-Pink animada** (`#E60067`) com efeito cintilante e degradê pulsante.
    - Tier 3 (5+ indicações): **Ouro Místico** (`#F59E0B`) com aura dourada de prestígio.
    - Acessibilidade: Todas as animações CSS respeitam `@media (prefers-reduced-motion: reduce)` estritamente, congelando transições e pulsos para usuários sensíveis a movimento.
    - **Conformidade AGENTS.md §5:** As bordas cosméticas são distinções visuais puramente decorativas. Não constituem moedas, não interferem em saldos e não geram vantagens no sistema de economia.
  - [x] Vitrines Especializadas e Separação Arquitetural:
    - `/hyperfokus/projetos`: Vitrine pública SSR de projetos autorais e criações da comunidade com filtros por categoria (Dev, Arte, Games, etc.), cards com bordas cosméticas de criador e links diretos.
    - `/dashboard/servidores`: Gestão e exibição separada de servidores/guildas parceiras no painel com convites de comunidade.
    - Autoatendimento no perfil do usuário (`/meu-perfil`) com gerenciamento de projetos e botão de destaque ("bump") com cooldown de 24 horas.
  - [x] Rota Pública de Indicação:
    - `/divulgar?ref={snowflake}`: Rota que registra a indicação referenciada com antifraude de IP e redireciona o usuário para o portal ou cadastro.
  - [x] Modernização de Componentes do Painel:
    - Upgrade dos seletores de cargos nativos (`<select>`) em `client/src/dashboard/Periodic.jsx` e `Campfire.jsx` para o componente moderno `MultiSelect` com busca, badges e seleção amigável.
- **Validação:**
  - `tests/hyperfokus.test.js`: Teste 17 validando cálculo de tiers de badge, auto-indicação, duplicatas, colisão de IP no mesmo dia, vitrine de servidores e desativação em `guildDelete`.
  - `npm run build:client`: Compilação de produção Vite 100% limpa.
  - `npm test`: Suíte global de testes do projeto 100% aprovada.

---

## Conclusão do Plano Pyxie Hyperfokus
Todas as 9 fases (Fases 0 a 8) do documento `docs/PLANO-PYXIE-HYPERFOKUS.md` foram integralmente implementadas, testadas e validadas:
- **Fase 0:** Fundação, infraestrutura Drizzle, schemas relacionais, módulos Cog e testes unitários.
- **Fase 1:** Fluxo no Discord, comandos `/py-add` e `/py-concluir`, debounce com sticky em threads e prévia de homologação.
- **Fase 2:** Fila de validação editorial no painel `/dashboard` com tela de revisão e edição de SEO.
- **Fase 3:** Site público SSR, leitor acessível estilo Kindle, suporte a dislexia e páginas institucionais.
- **Fase 4:** Motor de SEO e distribuição, geração Sharp de cards OG (1200x630) e Pins (1000x1500) com marca d'água, Schemas BlogPosting/FAQPage, Auto-Internal Linker, sitemaps e RSS.
- **Fase 5:** Fila agendada do Pinterest com teto de 3 pins/dia nos horários nobres de Brasília e variação anti-bloqueio.
- **Fase 6:** Analytics sem cookies de terceiros, 100% aderente à LGPD com hash de IP rotativo diário, retenção por funil e métricas no painel.
- **Fase 7:** Contas sem Discord, hashing Scrypt com timing-safe, rascunhos web, importador SSRF-safe do GitHub e página de perfil com preferências sincronizadas.
- **Fase 8:** Vitrines separadas de projetos e servidores, indicações antifraude, bordas cosméticas acessíveis e seletores MultiSelect no painel.
