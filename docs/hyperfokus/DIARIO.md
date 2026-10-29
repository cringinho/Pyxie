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
- **Data de início:** 29/10/2026
- **Status:** Em andamento
- **Planejamento:**
  - [ ] Implementar rotas públicas e SSR no Express em `src/routes/hyperfokusRoutes.js`:
    - `/hyperfokus`: Home bento/magazine (Mais comentados / Mais curtidos / Mais recentes / Tags).
    - `/hyperfokus/:slug`: Artigo completo com SSR (título, metas, autores, tags, HTML sanitizado e JSON-LD BlogPosting).
    - `/hyperfokus/categoria/:slug`: Página-pilar por categoria.
    - `/hyperfokus/autor/:userId`: Perfil público do autor com lista de artigos.
    - `/hyperfokus/como-participar` e `/hyperfokus/termos-e-regras`: Páginas institucionais.
    - `/api/hyperfokus/articles/:id/like` e `/api/hyperfokus/articles/:id/comments`: Curtir e comentar com login.
  - [ ] Registrar rotas no `server.js`.
  - [ ] Leitor Acessível (estilo Kindle): controles de tamanho de fonte, largura da coluna, espaçamento e fonte para dislexia sem alterar o HTML do SSR nem afetar o SEO.
  - [ ] Redesenho da navegação da Home com botão de destaque "Blog" (`#E60067`) em `public/index.html` e `client/src/components/layout/Navbar.jsx`.
