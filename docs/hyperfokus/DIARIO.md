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
