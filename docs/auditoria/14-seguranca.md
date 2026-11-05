# 14. Segurança geral (painel, OAuth, rotas, uploads, XSS)

> Nota da área: 5/10 · O painel novo (login com Discord, conferência por servidor, pagamentos) está bem protegido. Mas a conta do site por e-mail pode ser sequestrada pelo "Esqueci a senha", e as rotas antigas do dono ainda aceitam pedido só pelo IP. Esses dois pontos precisam de correção antes de divulgar o cadastro por e-mail.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q261 | "Esqueci a senha" devolve o código na tela? | 🔴 PROBLEMA | crítica |
| Q262 | Cadastro devolve código de verificação / revela e-mails? | 🔴 PROBLEMA | média |
| Q263 | Rotas do dono liberadas só por IP? | 🔴 PROBLEMA | alta |
| Q264 | Admin de um servidor abre outro trocando o ID? | ✅ OK | info |
| Q265 | Login Discord protegido (state e ?next=)? | ✅ OK | info |
| Q266 | Cookies com HttpOnly/Secure/SameSite? | ✅ OK | info |
| Q267 | Chave mestra no navegador ou na URL? | 🔴 PROBLEMA | média |
| Q268 | CSP e HSTS ajudam de verdade? | 🟡 PARCIAL | média |
| Q269 | Vitrine Shopee sem escape no HTML? | 🔴 PROBLEMA | baixa |
| Q270 | Blog escapa comentários e artigos? | ✅ OK | info |
| Q271 | Upload da Lojinha tem tipo, tamanho e cota? | 🟡 PARCIAL | média |
| Q272 | Limite de pedidos em cadastro, comentários e ao vivo? | 🟡 PARCIAL | média |
| Q273 | Aviso do Mercado Pago exige assinatura? | 🟡 PARCIAL | baixa |
| Q274 | Passe confere moeda, valor e repetição? | ✅ OK | info |
| Q275 | Risco de SQL injection? | ✅ OK | info |
| Q276 | Segredos ou dados pessoais no código? | 🟡 PARCIAL | baixa |
| Q277 | Widget para outros sites funciona? | 🔴 PROBLEMA | baixa |
| Q278 | Erros de login/acesso explicados em palavras simples? | ✅ OK | info |
| Q279 | Doc de acesso do dono bate com o código? | 🔴 PROBLEMA | baixa |
| Q280 | Lista de servidores acompanha mudança de cargo? | ✅ OK | info |

---

### Q261 — No fluxo "Esqueci a senha" (POST /api/auth/forgot-password), o código de redefinição chega só por e-mail ou volta na resposta?

- **Veredito**: 🔴 PROBLEMA
- **Severidade**: crítica
- **Evidência**: `src/routes/accountRoutes.js:116-121` `const token = accountStore.createPasswordResetToken(email); ... token, // exposto para testes locais`; `src/modules/accounts/accountStore.js:275-306` `resetPasswordWithToken` só pede código + senha nova e não derruba sessões.
- **Achado**: Qualquer pessoa digita o e-mail de outra, recebe o código na própria tela e troca a senha dela. É sequestro de conta (blog, comentários, perfil). As sessões já abertas da vítima continuam valendo depois da troca.
- **Recomendação**: Tirar o campo `token` da resposta e mandar o código só por e-mail. Ao redefinir a senha, derrubar todas as sessões daquela conta.
- **Revisão**: Confirmado. Procurei filtro ou middleware que tirasse o campo em produção: não existe. A rota está montada em `server.js:352`.

### Q262 — No cadastro por e-mail e no "Esqueci a senha", dá para provar posse do e-mail sem abrir a caixa de entrada, ou descobrir quem tem conta?

- **Veredito**: 🔴 PROBLEMA
- **Severidade**: média
- **Evidência**: `src/routes/accountRoutes.js:43` e `:52` `verifyToken` volta na resposta do cadastro; `:143-146` `/api/auth/verify-email?token=` marca o e-mail como verificado; `accountStore.js:256-258` devolve `null` quando a conta não existe.
- **Achado**: Quem cadastra com o e-mail de outra pessoa já recebe o código e marca o e-mail como "verificado" sozinho. No "Esqueci a senha", a resposta muda (null ou código), apesar da mensagem dizer que não revela nada. O cadastro também revela, pelo erro 409 `email_already_registered`.
- **Recomendação**: Enviar o código de verificação só por e-mail. Responder sempre igual no "Esqueci a senha".
- **Revisão**: Confirmado. Ajuste: descobrir quem tem conta já era possível pelo cadastro (409), então o peso maior aqui é a verificação falsa de e-mail.

### Q263 — As rotas do dono (Sazonal, Museu, Parcerias e POST /admin/emojis) aceitam pedido só porque veio de um IP da lista?

- **Veredito**: 🔴 PROBLEMA
- **Severidade**: alta
- **Evidência**: `src/services/adminAuth.js:261-263` `if (isIpAllowed(req)) return next();`; `:20-31` lista fixa de IPs; `:76-80` libera qualquer `192.168.x` e `10.x`; `server.js:335` `express.urlencoded(...)` aceita formulário comum; usado em `seasonalManager.js:1171-1344`, `partnershipManager.js:1030-1096`, `museumManager.js:750-806` e `server.js:1263-1270`.
- **Achado**: Se o dono estiver em casa e abrir um site malicioso, esse site pode enviar um formulário escondido que dispara drops, muda configurações, apaga parcerias ou edita emojis, sem login. O servidor aceita formulário comum, então nem precisa de truque. IP de casa muda: quem herdar aquele IP vira "dono".
- **Recomendação**: Tirar a liberação por IP do `requireAdminAuth` e do POST /admin/emojis. Exigir sempre o login do painel com Discord e o cabeçalho `X-Pyxie-Panel`, como o painel novo já faz.
- **Revisão**: Confirmado. Procurei proteção anti-CSRF nessas rotas: o cabeçalho `X-Pyxie-Panel` só é cobrado em `dashboardRoutes.js:132-133`, não aqui.

### Q264 — No painel /dashboard, um admin do servidor A abre o servidor B trocando o ID na URL?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: `src/routes/dashboardRoutes.js:139-145` `requireGuild` chama `access.checkGuildAccess` a cada pedido; 111 rotas usam `requireSession, requireGuild`; nenhuma rota `/api/dashboard/guilds/:guildId` sem `requireGuild` no grep.
- **Achado**: Cada pedido é conferido na hora pelo bot. Trocar o ID na URL devolve 403.
- **Recomendação**: Manter. Toda rota nova de servidor deve usar `requireSession` + `requireGuild`.
- **Revisão**: Confirmado por amostragem.

### Q265 — O login com Discord protege contra login forjado e contra redirecionamento para site externo via ?next=?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: `src/routes/dashboardRoutes.js:205-208` state aleatório em cookie `HttpOnly; Secure; SameSite=Lax`; `:221-225` compara o state; `:207` e `:238` `/^\/(?![/\\])[^\r\n]*$/` só aceita caminho interno; `:229` revoga o token do Discord.
- **Achado**: State conferido, `next` só aceita caminhos do próprio site e o token do Discord é descartado após ler o perfil.
- **Recomendação**: Manter.
- **Revisão**: Confirmado.

### Q266 — Os cookies de sessão usam HttpOnly, Secure e SameSite de forma consistente?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: `src/services/panelSessions.js:114` `HttpOnly; Secure; SameSite=Lax`; `src/services/accountSessions.js:98-99` Secure quando `NODE_ENV=production`; `ecosystem.config.js:13` `NODE_ENV: 'production'` e `deploy.sh:193` sobe com esse arquivo; `hyperfokusRoutes.js:426` `pyxie_referrer` sem HttpOnly.
- **Achado**: Em produção os dois cookies de sessão têm Secure. O `pyxie_referrer` só guarda o nome de quem indicou, não dá acesso a nada, e não é lido em nenhum outro lugar do código.
- **Recomendação**: Opcional: deixar o Secure fixo no cookie da conta, para não depender do `NODE_ENV`.
- **Revisão**: Rebaixado de PARCIAL/baixa para OK. O deploy real (pm2) já define `NODE_ENV=production`, e o cookie de indicação não é sensível.

### Q267 — A chave mestra (PANEL_SECRET/API_SECRET_TOKEN) fica no navegador ou trafega na URL?

- **Veredito**: 🔴 PROBLEMA
- **Severidade**: média
- **Evidência**: `client/src/pages/Museum.jsx:34` `localStorage.getItem('pyxie_admin_token')`, enviado em `x-admin-token` (`:105`, `:126`); `src/modules/museum/museumManager.js:676-680` compara com a chave mestra; `src/services/adminAuth.js:254-256`, `server.js:246` e `server.js:1022` aceitam `req.query.token`.
- **Achado**: Para editar o Museu, a chave mestra precisa estar salva no navegador (o site nem salva sozinho; o dono teria de colar à mão). Um único XSS rouba a chave que também assina as sessões do painel. Aceitar a chave em `?token=` faz ela aparecer em histórico e logs.
- **Recomendação**: Passar a edição do Museu para o login do painel (cookie + `X-Pyxie-Panel`). Parar de aceitar a chave mestra pela URL. Usar segredos separados para sessão e para acesso de máquina.
- **Revisão**: Confirmado.

### Q268 — Os cabeçalhos de segurança (CSP e HSTS) ajudam a barrar XSS e forçar HTTPS?

- **Veredito**: 🟡 PARCIAL
- **Severidade**: média
- **Evidência**: `server.js:283-286` CSP com `script-src 'self' 'unsafe-inline' 'unsafe-eval'`; nenhum `Strict-Transport-Security` no código; `docs/INFRAESTRUTURA-ORACLE.md:63-65` Caddyfile só com `reverse_proxy`.
- **Achado**: A CSP existe, mas libera script inline e eval, então não barra XSS na prática. Sem HSTS, o primeiro acesso por http pode ser interceptado antes do redirecionamento.
- **Recomendação**: Adicionar HSTS no Caddy. Aos poucos, tirar scripts inline e remover `'unsafe-eval'` e `'unsafe-inline'` da CSP.
- **Revisão**: Confirmado. O Caddy não envia HSTS por padrão, e o Caddyfile documentado não adiciona.

### Q269 — A vitrine Shopee da /cringelandia monta os cards sem escapar título, tag, preço, imagem e link?

- **Veredito**: 🔴 PROBLEMA
- **Severidade**: baixa
- **Evidência**: `public/cringelandia.html:2784-2800` `<span class="product-title">${title}</span>`, `href="${link}"`, `src="${img}"`; título pode vir do og:title externo (`src/services/shopeeManager.js:224-227`, `:266-267`); a galeria da mesma página usa `esc()` (`:3015`).
- **Achado**: Os dados do produto entram direto no HTML. Se um título ou link vier com código, ele roda para todo visitante.
- **Recomendação**: Usar a mesma `esc()` da galeria em todos os campos e aceitar só links `https`.
- **Revisão**: Rebaixado de média para baixa. Os itens são cadastrados pelo dono e o título externo vem da Shopee; o ataque exige que essa página traga `<` cru no og:title. Continua sendo correção barata.

### Q270 — Comentários e artigos do blog Hyperfokus escapam o texto do usuário?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: `src/modules/hyperfokus/renderer.js:1135-1142` `hfEscape(c.username)`, `hfEscape(c.content)`; `src/modules/hyperfokus/markdown.js:56` `escapeHtml(text)`; `:20-27` `sanitizeUrl` só aceita http(s), mailto e `/`.
- **Achado**: Nome e texto do comentário são escapados. O markdown escapa tudo antes de formatar e bloqueia `javascript:`.
- **Recomendação**: Manter. Considerar limite de comentários por minuto por conta.
- **Revisão**: Confirmado por amostragem.

### Q271 — O envio de imagem da Lojinha/Estúdio confere tipo, tamanho, nome e espaço usado por servidor?

- **Veredito**: 🟡 PARCIAL
- **Severidade**: média
- **Evidência**: `src/routes/dashboardRoutes.js:592` `limit: '8mb'`; `src/modules/mary-studio/maryStudioManager.js:601-618` confere bytes PNG/JPG/GIF/WebP e gera nome aleatório; `:583-586` bloqueia `../`; nenhuma cota nem limpeza no arquivo.
- **Achado**: Tipo, tamanho e caminho estão protegidos. Mas não há limite de quantas imagens um servidor envia, e nada é apagado. Um admin mal-intencionado pode encher o disco da VM e derrubar o site.
- **Recomendação**: Cota por servidor (ex.: 200 MB), limite de envios por minuto e limpeza de imagens sem uso.
- **Revisão**: Confirmado. Atenuante: só admin com o extra Lojinha (ou a Mary) chega nessa rota (`dashboardRoutes.js:588`).

### Q272 — Existe limite de pedidos para cadastro, comentários, importador e conexões ao vivo (/api/events/live)?

- **Veredito**: 🟡 PARCIAL
- **Severidade**: média
- **Evidência**: `server.js:324-327` só limite geral de 120/min por IP em `/api/`; `sensitiveRouteLimiter` só em `:709` e `:1641`; `server.js:376-385` SSE adiciona conexão sem teto; `accountStore.js:29-32` cada cadastro roda `scryptSync`.
- **Achado**: Um IP pode criar até 120 contas por minuto, cada uma pesando na CPU, e manter muitas conexões ao vivo abertas. O limite fica na memória e zera a cada reinício.
- **Recomendação**: Aplicar o limite sensível (20/min) em cadastro, "Esqueci a senha", comentários e importador. Limitar conexões ao vivo por IP (ex.: 3) e no total.
- **Revisão**: Confirmado. O login já tem bloqueio próprio por tentativas erradas (`accountRoutes.js:79-87`), mas o cadastro não.

### Q273 — O aviso do Mercado Pago (/api/pass/webhook/mercadopago) recusa pedidos sem assinatura válida?

- **Veredito**: 🟡 PARCIAL
- **Severidade**: baixa
- **Evidência**: `src/services/passPayments.js:121-122` `if (!secret) return true;` (igual em `planPayments.js:221-222`); `:143-146` sempre consulta o pagamento na API do Mercado Pago.
- **Achado**: Sem `MERCADOPAGO_WEBHOOK_SECRET` no .env, qualquer um chama o aviso. Não dá para ganhar Premium de graça, mas gasta cota da API e polui os logs.
- **Recomendação**: Recusar o aviso quando o segredo faltar e mostrar alerta no painel de saúde.
- **Revisão**: Confirmado.

### Q274 — Ao liberar o Passe Premium, o sistema confere moeda, valor e se o pagamento já foi usado?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: `src/services/passPayments.js:147-149` `payment.currency_id !== 'BRL' || Number(payment.transaction_amount) < battlePass.PRICE.BRL`; `src/services/battlePass.js:383` `if (state.payments[paymentId]) return { ok: true, duplicate: true }`.
- **Achado**: Só libera pagamento aprovado, em reais e no valor certo, e o mesmo pagamento não libera duas vezes.
- **Recomendação**: Manter.
- **Revisão**: Confirmado.

### Q275 — Alguma consulta ao banco monta SQL juntando texto do usuário?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: grep por `sql.raw` e `.query(` com texto em `src` e `server.js`: nenhum resultado.
- **Achado**: As consultas usam o Drizzle com parâmetros.
- **Recomendação**: Manter. Proibir `sql.raw` com dado do usuário nas regras do projeto.
- **Revisão**: Confirmado por amostragem.

### Q276 — O repositório tem segredos ou dados pessoais do dono no código?

- **Veredito**: 🟡 PARCIAL
- **Severidade**: baixa
- **Evidência**: `.gitignore:2` `.env` e `:4-5` `data/*.json`; busca por padrões de token (Discord, Mercado Pago, GitHub, AWS) sem resultado; `src/services/adminAuth.js:20-31` lista de IPs da casa do dono no código.
- **Achado**: Nenhum token vazado. Mas os IPs de casa ficam no código, o que revela localização aproximada e alimenta a Q263.
- **Recomendação**: Mover para `ADMIN_ALLOWED_IPS` no .env, ou apagar se a liberação por IP sair.
- **Revisão**: Confirmado.

### Q277 — O widget para outros sites (public/widget.js → /widget/card) aparece num site de terceiros?

- **Veredito**: 🔴 PROBLEMA
- **Severidade**: baixa
- **Evidência**: `public/widget.js:5-6` iframe para `https://pyxie.com.br/widget/card`; `server.js:280` `X-Frame-Options: SAMEORIGIN` em todas as respostas; `server.js:963-964` a rota não troca o cabeçalho.
- **Achado**: O navegador bloqueia o iframe fora do pyxie.com.br. Quem colar o widget vê um quadro vazio.
- **Recomendação**: Na rota /widget/card, trocar o `X-Frame-Options` por CSP `frame-ancestors *`. Ou apagar o widget, se não for usado.
- **Revisão**: Rebaixado de alta para baixa. O bloqueio é real, mas nenhuma página do site ou da doc divulga o código do widget (só `widget.js` cita `data-pyxie-widget`), então ninguém de fora depende dele hoje.

### Q278 — Quando o login no painel falha ou o acesso é negado, a tela explica o motivo em palavras simples?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: `client/src/dashboard/i18n.js:12-22` `'error.login_state': 'O login expirou. Tente de novo.'`, `'error.not_whitelisted': ...`; versão em inglês no mesmo arquivo.
- **Achado**: Erros de acesso têm mensagem clara em PT e EN.
- **Recomendação**: Manter. Adicionar mensagem própria para 429 e `csrf_header_missing` (não encontradas no i18n).
- **Revisão**: Confirmado.

### Q279 — A documentação de acesso ao painel do dono bate com o código (/admin e /py-admin)?

- **Veredito**: 🔴 PROBLEMA
- **Severidade**: baixa
- **Evidência**: `docs/INFRAESTRUTURA-ORACLE.md:75` "requer Magic Token HMAC gerado via `/py-admin` ou chave mestra"; `server.js:1169` `/admin` só redireciona para `/dashboard#/global/health`; `src/commands/setup.js:143` "era o /py-admin"; `createOwnerMagicToken` não é chamado em lugar nenhum.
- **Achado**: A doc manda usar um comando e um link mágico que não existem mais. Quem seguir fica sem acesso e pode tentar a chave mestra na URL.
- **Recomendação**: Atualizar a doc para "login com Discord em /dashboard" e apagar o código do link mágico sem uso.
- **Revisão**: Confirmado.

### Q280 — A lista de servidores no seletor do painel acompanha mudanças de cargo depois do login?

- **Veredito**: ✅ OK
- **Severidade**: info
- **Evidência**: `src/services/panelSessions.js:9` sessão de 7 dias e `:66-72` guarda a lista do login; `src/services/panelAccess.js:79-91` usa `session.guilds`; `client/src/dashboard/Dashboard.jsx:277-279` link "Atualizar servidores" para `/auth/discord`.
- **Achado**: A lista é a do login, mas o seletor já tem o link "Atualizar servidores", que refaz o login e traz a lista nova. As ações sempre conferem o cargo na hora.
- **Recomendação**: Opcional: deixar o link mais visível (hoje é texto pequeno no fim da página).
- **Revisão**: Rebaixado de PARCIAL/baixa para OK. A recomendação do auditor (botão "Atualizar servidores") já existe.
