# 03. Wiki e catálogo de comandos

> Nota da área: 4/10 · O catálogo carrega os comandos da API, mas o site lê campos com nomes errados. Por isso as descrições e os nomes das categorias somem, e a busca por assunto não funciona. A wiki também mostra números fixos que não batem com o jogo, uma prévia de embed inventada e textos só em português no modo inglês.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q041 | Cards mostram a descrição do comando? | 🔴 PROBLEMA | alta |
| Q042 | Filtros de categoria mostram o nome? | 🔴 PROBLEMA | alta |
| Q043 | Campo de busca filtra a grade ao digitar? | 🔴 PROBLEMA | média |
| Q044 | Paleta Ctrl+K acha comandos por assunto? | 🔴 PROBLEMA | média |
| Q045 | Paleta avisa que há mais resultados? | 🟡 PARCIAL | baixa |
| Q046 | Estados de carregando, erro e vazio são diferentes? | 🔴 PROBLEMA | média |
| Q047 | Modal mostra recarga e permissão reais? | 🔴 PROBLEMA | alta |
| Q048 | "Resposta Real no Discord" é real? | 🔴 PROBLEMA | média |
| Q049 | Apelidos py! estão corretos e sem repetição? | 🔴 PROBLEMA | média |
| Q050 | "Copiar Deep Link" abre o comando certo? | 🔴 PROBLEMA | média |
| Q051 | Modal fecha com ESC e toque fora, e é anunciado como janela? | 🔴 PROBLEMA | média |
| Q052 | Cards funcionam só com teclado? | 🔴 PROBLEMA | média |
| Q053 | Rolagem lateral, imagem quebrada ou texto pequeno? | 🟡 PARCIAL | baixa |
| Q054 | No celular dá para ver a aba ativa? | 🟡 PARCIAL | baixa |
| Q055 | Catálogo repete título e espaçamento da wiki? | 🟡 PARCIAL | baixa |
| Q056 | Cards usam o ícone ou emoji da categoria? | 🟡 PARCIAL | baixa |
| Q057 | Números de vocações e comandos batem? | 🔴 PROBLEMA | média |
| Q058 | Comandos citados nas abas existem com esse nome? | 🔴 PROBLEMA | média |
| Q059 | /api/commands protege o segredo do painel? | 🟡 PARCIAL | baixa |
| Q060 | Modo inglês mostra tudo em inglês? | 🔴 PROBLEMA | média |

---

### Q041 — Os cards do Catálogo de Comandos mostram a descrição de cada comando que vem de /api/commands?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/commands/commandHelpers.js:747` a API envia `desc`; `client/src/components/wiki/CommandCard.jsx:53` lê `{command.description}`. O mesmo campo errado aparece em `CommandDetailModal.jsx:53`, `CommandPaletteModal.jsx:21` e `:110`, `CommandGrid.jsx:75` e `DiscordEmbedPreview.jsx:70`. Nenhum componente da wiki lê `desc`. Medição do auditor (Playwright): 7 de 7 cards com descrição vazia em 360, 768 e 1280 px.
**Achado:** Todo card aparece só com o nome (/py-daily), sem explicação. No detalhe a descrição também some. O visitante não descobre o que o comando faz.
**Recomendação:** Fazer o site ler o campo `desc`, que é o nome usado pela API (card, detalhe, paleta, filtro e prévia). Depois gerar o build de novo.
**Revisão:** Confirmado. Não há tradução de `desc` para `description` nem no servidor (`server.js:1018-1027` repassa `getHelpModules` direto) nem no cliente.

### Q042 — Os botões de filtro por categoria acima da grade mostram o nome da categoria?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/components/wiki/CommandGrid.jsx:141` `{m.title || m.name}`; a API envia `label` e `emoji` (`src/commands/commandHelpers.js:764`). O build publicado tem o mesmo código (`public/dist/assets/index.js` contém `.title||k.name`). Medição do auditor: botões "Todos (7)", "(3)", "(1)", "(1)", "(2)".
**Achado:** Os filtros viram números soltos entre parênteses. O usuário não sabe qual botão é Economia e qual é Social.
**Recomendação:** Mostrar `m.label` e `m.emoji`, que a API já envia (exemplo: "🪙 Economia (3)").
**Revisão:** Confirmado. Os módulos da API não têm `title` nem `name`.

### Q043 — O campo de busca no topo do catálogo filtra a grade quando o usuário digita?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/CommandGrid.jsx:105` `readOnly`; `setSearchTerm` é declarado na linha 10 e nunca chamado. O filtro das linhas 72-78 roda sempre com termo vazio. Texto do campo: `wiki.searchPlaceholder` = "Pressione Ctrl+K ou digite para buscar comandos..." (`client/src/utils/i18n.js:59`).
**Achado:** O texto diz "digite para buscar", mas o campo não aceita digitação. Ele só abre a janela de busca. No celular não há Ctrl+K, então o texto confunde mais.
**Recomendação:** Escolher um comportamento. Ou o campo filtra a grade na hora (tirar o `readOnly` e ligar o `onChange`), ou o texto passa a dizer "Toque para buscar". Apagar o filtro que não é usado.
**Revisão:** Confirmado.

### Q044 — Na paleta de busca (Ctrl+K), procurar por assunto, como "moedas", encontra os comandos de economia?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/CommandPaletteModal.jsx:21` busca em `cmd.description` (sempre vazio, ver Q041). A linha 23 também busca em `cmd.category`, então "economia" ou "tarot" acham resultados, mas "moedas", "casar" ou "carta" não. Não há tratamento de acentos (`toLowerCase` puro, linha 18).
**Achado:** A busca só funciona por nome, apelido ou id exato da categoria. Quem busca pelo que quer fazer não acha nada, e o texto do campo promete "palavra-chave".
**Recomendação:** Ler `desc` na busca, procurar também no rótulo da categoria (`label`) e ignorar acentos (diário = diario).
**Revisão:** Rebaixado de alta para média. A busca por categoria (linha 23) já funciona em parte, e a causa principal é a mesma do Q041; corrigir o Q041 resolve boa parte.

### Q045 — A paleta Ctrl+K avisa quando há mais resultados do que os exibidos?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/components/wiki/CommandPaletteModal.jsx:25` `.slice(0, 8); // Top 8 results`. O rodapé (linhas 131-137) só mostra atalhos de teclado, sem contador.
**Achado:** Com a busca vazia ou ampla ("py"), só 8 comandos aparecem. A pessoa pode achar que o bot só tem esses.
**Recomendação:** Mostrar "8 de N resultados" no rodapé e um botão para ver a lista completa na grade.
**Revisão:** Confirmado.

### Q046 — O catálogo mostra estados diferentes para carregando, erro de rede e categoria vazia?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/CommandGrid.jsx:26` em caso de erro só faz `console.error`; se a API responder `success: false`, nada acontece (linhas 19-24). A linha 161 mostra sempre `catalog.empty` = "Nenhum comando encontrado para esta categoria." (`i18n.js:105`). Não existe estado de carregamento.
**Achado:** Enquanto carrega ou quando o servidor falha, o visitante lê que não há comandos. Parece que o bot está vazio ou quebrado, e não há botão para tentar de novo.
**Recomendação:** Três estados: "Carregando comandos..." com cards de esqueleto; "Não deu para carregar. Tentar de novo" com botão; e o texto de vazio só quando a lista chegou e está vazia.
**Revisão:** Confirmado.

### Q047 — O modal de detalhe do comando mostra a recarga (cooldown) e a permissão reais de cada comando?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/components/wiki/CommandDetailModal.jsx:90` usa `command.cooldown`, que a API não envia (`commandHelpers.js:745-753`), então sempre cai em `cmdModal.cooldownSeconds` = "3 segundos" (`i18n.js:111`). A linha 98 tem `@everyone` fixo. A própria wiki diz que o daily recarrega em 24 h e o trabalho em 3 h (`client/src/pages/Wiki.jsx:78` e `:111`).
**Achado:** A informação está errada em todos os comandos. O site diz 3 segundos para o daily e mostra "@everyone" até em comandos restritos.
**Recomendação:** Enviar na API a recarga e a permissão de cada comando, tiradas do código do próprio comando. Esconder o campo quando o valor não for conhecido, em vez de inventar.
**Revisão:** Confirmado. A própria wiki se contradiz (24 h na FAQ e 3 segundos no modal).

### Q048 — A seção "Resposta Real no Discord" do modal mostra a resposta verdadeira do comando?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/DiscordEmbedPreview.jsx:17-18` "+100 moedas" e "7 dias (+25 bônus)" fixos; `:72` "✅ Operacional"; `:73` recarga "3s" inventada; `:97` "hoje às 14:32". A linha 51 testa `casamento`/`marry`, mas o nome real é `/py-marriage` (`src/modules/marriage/commands/pyCasamento.js:37`), então o casamento cai na prévia genérica. Título: `cmdModal.liveSimulation` = "Resposta Real no Discord" (`i18n.js:116`).
**Achado:** O título promete resposta real, mas os valores são inventados. O visitante pode esperar 100 moedas por dia e se frustrar. Isso vai contra a regra "Zero mock" (AGENTS.md §12).
**Recomendação:** Mudar o título para "Exemplo ilustrativo" ou montar a prévia com textos reais do i18n do bot. Remover números de recompensa que não vêm da economia.
**Revisão:** Confirmado.

### Q049 — Os apelidos de prefixo listados no card e no modal estão corretos e sem repetição?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/CommandDetailModal.jsx:124` e `CommandCard.jsx:66` colocam `py!` antes de todo apelido; `src/commands/daily.js:188` tem `'py-diario'` e `'py-daily'` nos apelidos. Resultado no modal: "py!daily py!diario py!py-diario py!diaria py!py-daily".
**Achado:** Aparecem formas estranhas, como py!py-diario. A lista fica confusa e o usuário pode copiar uma forma que não esperava.
**Recomendação:** Antes de mostrar, tirar o "py-" do começo dos apelidos e remover os repetidos. O daily ficaria py!daily, py!diario, py!diaria.
**Revisão:** Confirmado. O card mostra só os 2 primeiros (sem o erro no daily), mas o modal mostra todos.

### Q050 — O link gerado por "Copiar Deep Link" (/wiki#py-ping) abre o comando certo para quem recebe?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/CommandDetailModal.jsx:22` gera `#py-ping`. `CommandGrid.jsx:50-52` compara com `c.name` (que vem como `/py-ping`), com `` `py-${c.name}` `` (vira `py-/py-ping`) e com os apelidos. `src/commands/ping.js:25` não tem `py-ping` nos apelidos. O daily funciona só porque tem `py-daily` nos apelidos (`daily.js:188`). `Wiki.jsx:15` abre a aba Comandos para `#py-...`, mas o modal não abre.
**Achado:** O botão de compartilhar gera links que só funcionam para alguns comandos. Quem recebe o link cai no catálogo sem o comando aberto.
**Recomendação:** Tirar a barra do nome antes de comparar (nome sem "/"). Fazer a página abrir a aba Comandos para qualquer âncora que seja um comando conhecido.
**Revisão:** Confirmado pela leitura do código.

### Q051 — O modal de detalhe pode ser fechado com ESC e toque fora, e é anunciado como janela para leitor de tela?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/CommandDetailModal.jsx:29` fundo sem `onClick`; não há listener de tecla no arquivo (o único `Escape` da wiki está em `CommandPaletteModal.jsx:31`, ativo só com a paleta aberta). O botão diz `cmdModal.close` = "Fechar (ESC)" (`i18n.js:117`). Nenhum `role` ou `aria-` nos componentes da wiki. O X fica em `absolute top-5` dentro de um painel com rolagem (`max-h-[90vh] overflow-y-auto`, linha 31), então some ao rolar.
**Achado:** O botão promete ESC, mas a tecla não fecha. Tocar fora também não fecha. No celular, quem rolou o modal precisa voltar ao topo para achar o X.
**Recomendação:** Fechar com ESC e com toque no fundo, como a paleta já faz. Adicionar `role="dialog"` e `aria-modal`. Deixar o X fixo no topo ao rolar.
**Revisão:** Confirmado.

### Q052 — Dá para navegar pelos cards de comando e abrir o detalhe só com o teclado?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/components/wiki/CommandCard.jsx:22-24` o card é uma `<div onClick>` sem `tabIndex` nem `role`. O botão de copiar (linhas 38-48) só tem `title`, sem `aria-label`. O "Detalhes" (linha 80) é um `<span>`.
**Achado:** Quem usa teclado ou leitor de tela não consegue abrir o detalhe de nenhum comando, e os botões de copiar são lidos sem nome.
**Recomendação:** Transformar o card (ou o "Detalhes") em botão de verdade. Dar `aria-label` "Copiar /py-daily" ao botão de copiar.
**Revisão:** Confirmado.

### Q053 — A aba Catálogo de Comandos tem rolagem lateral, imagem quebrada ou texto pequeno demais em 360, 768 e 1280 px?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** Medição do auditor (Playwright): sem rolagem lateral e 0 imagens quebradas nas três larguras; 17 a 20 textos entre 9 e 10 px. No código: selos das abas `text-[10px]` (`client/src/pages/Wiki.jsx:175`), contadores `text-[10px]` (`CommandGrid.jsx:142`), "+N" `text-[10px]` (`CommandCard.jsx:70`). O "v14 • Online" de 9 px é da barra do topo (`client/src/components/layout/Navbar.jsx:108`), fora desta área.
**Achado:** A estrutura cabe bem e as imagens carregam. Mas selos e contadores de 10 px ficam difíceis de ler no celular, sobretudo para quem tem baixa visão ou dislexia.
**Recomendação:** Usar no mínimo 12 px para selos e contadores no celular. Contadores das categorias com o mesmo tamanho do nome.
**Revisão:** Confirmado, com ajuste: o exemplo de 9 px é da Navbar, não da wiki.

### Q054 — No celular (360 px), quem abre /wiki#comandos vê qual aba está ativa?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/pages/Wiki.jsx:154` `overflow-x-auto ... scrollbar-none`; não há `scrollIntoView` para a aba ativa no arquivo. A aba "Catálogo de Comandos" é a sexta de sete (`Wiki.jsx:63`). Medição do auditor: aba ativa entre 1254 e 1512 px, fora da tela de 360 px.
**Achado:** A aba ativa fica escondida e a barra de rolagem foi removida. A pessoa não percebe que existem mais abas nem em qual está.
**Recomendação:** Ao abrir, rolar a barra até a aba ativa. Mostrar sombra ou seta na borda indicando mais abas. No celular, uma opção é trocar por um menu de seleção.
**Revisão:** Rebaixado de média para baixa. O conteúdo do catálogo aparece logo abaixo, então a pessoa chega aos comandos; o problema é de orientação.

### Q055 — A aba Catálogo de Comandos repete títulos e espaçamentos da página principal da wiki?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** H1 "Guia Oficial & Enciclopédia Interativa" em `client/src/pages/Wiki.jsx:127-128` e H2 com o mesmo texto em `CommandGrid.jsx:88-89` (`wiki.title`, `i18n.js:50`). `CommandGrid.jsx:81` usa `py-12 md:py-20 max-w-7xl px-4` dentro do container de `Wiki.jsx:120`, que já tem `max-w-7xl` e padding (a grade é montada em `Wiki.jsx:711`).
**Achado:** O mesmo título gigante aparece duas vezes e há um vão grande antes da grade. No celular, os comandos ficam várias telas abaixo.
**Recomendação:** Trocar o H2 por algo curto, como "Todos os comandos", ou removê-lo. Tirar o padding extra quando a grade estiver dentro da aba.
**Revisão:** Confirmado.

### Q056 — Os cards e a paleta usam o ícone ou o emoji da categoria que a API já envia?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/commands/commandHelpers.js:742-743` e `:750-752` enviam `emoji` e `iconUrl` por comando. `CommandCard.jsx:33`, `CommandPaletteModal.jsx:103` e `CommandDetailModal.jsx:46` usam sempre o ícone `<Terminal>`. Busca por `iconUrl`, `.emoji` e `.label` em `client/src/components/wiki/` não acha nada.
**Achado:** Todos os comandos têm o mesmo ícone. Fica difícil distinguir economia, tarot e social de relance, ainda mais sem descrição.
**Recomendação:** Mostrar o emoji ou a imagem da categoria no card, na paleta e no topo do modal, com `alt` descritivo.
**Revisão:** Confirmado.

### Q057 — Os números mostrados na wiki (vocações e total de comandos) batem entre si e com o código?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/pages/Wiki.jsx:60` aba "16 Vocações & Trabalho"; `:133` e `:142` "22 vocações"; `:115` FAQ "Todos os 37 comandos". `src/services/professions.js` exporta 28 profissões (contado com node). `src/commands/index.js:1-53` carrega 52 comandos, sem contar os de módulos (casamento etc.).
**Achado:** Na mesma tela aparecem 16 e 22 vocações, e o jogo tem 28. A FAQ diz 37 comandos, mas há mais de 50. Passa descuido e engana quem planeja jogar.
**Recomendação:** Tirar números fixos do texto. Puxar a contagem da API (total de `/api/commands` e de profissões) ou escrever sem número ("dezenas de vocações").
**Revisão:** Rebaixado de alta para média. Os números estão errados, mas não impedem o uso do bot.

### Q058 — Os comandos citados nas abas de conteúdo da wiki (Tarot, Casamento, Economia) existem com esse nome de barra?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/pages/Wiki.jsx:471` e `:620` "/py-suborno": é um botão do tarot (`src/commands/tarot.js:41` `tarot_subornar`), não um comando. `Wiki.jsx:686` "/py-casamento • /py-filho • /py-divorcio" e FAQ `:107` "/py-casamento". O nome real de barra é `py-marriage` (`src/modules/marriage/commands/pyCasamento.js:37`). `py-child` e `py-divorce` nem têm comando de barra: `data: undefined` (`pyFilho.js:141`, `pyDivorcio.js:50`), viraram botões no painel do /py-marriage e só funcionam por `py!`.
**Achado:** Quem digita /py-suborno, /py-casamento, /py-filho ou /py-divorcio no Discord não encontra nada. A wiki ensina um caminho que não existe.
**Recomendação:** Escrever "/py-marriage (ou py!casamento)", e explicar que filho e divórcio são botões dentro do /py-marriage. Para o suborno, escrever "botão Suborno dentro do /py-tarot". Melhor: gerar essas listas a partir de `/api/commands`, como manda o AGENTS.md §4.
**Revisão:** Confirmado e reforçado: filho e divórcio não têm versão de barra.

### Q059 — A rota /api/commands, que mostra comandos exclusivos do dono, protege o segredo de acesso?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `server.js:1018-1022` aceita `req.query.token` comparado com o segredo do painel (variáveis `PANEL_SECRET` / `API_SECRET_TOKEN`, `src/services/adminAuth.js:9`) via `isMasterSecretValid`, que usa `timingSafeEqual` (`adminAuth.js:226-233`). Existe limite global em todas as rotas `/api/`: `publicApiLimiter` de 120 pedidos por minuto (`server.js:324` e `:327`). O site não usa o `?token=` (`CommandGrid.jsx:16` chama só `?lang=`).
**Achado:** O risco de tentativa sem limite não procede, porque há limite por minuto. Sobra o risco menor: se alguém usar o `?token=`, o segredo mestre fica salvo em histórico do navegador e em logs.
**Recomendação:** Remover o `?token=` dessa rota e aceitar só a sessão por cookie do painel, que já funciona. Se precisar manter, usar cabeçalho em vez de URL.
**Revisão:** Rebaixado de média para baixa. O auditor disse que não havia limite de tentativas, mas `server.js:327` aplica limite em todo `/api/`.

### Q060 — No modo inglês (?lang=en), os cards, o modal e a prévia do catálogo aparecem todos em inglês?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** Textos fixos em PT: `client/src/components/wiki/CommandCard.jsx:45` "Copiar comando", `:76` "Slash Oficial", `:80` "Detalhes"; `DiscordEmbedPreview.jsx:17` "+100 moedas", `:72` "Operacional", `:97` "hoje às 14:32"; `client/src/pages/Wiki.jsx:139-148` selos "78 Arcanos em HD", "22 Vocações Únicas", "100% Gratuita & Segura", "Bilíngue PT-BR & EN" sem versão EN. No sentido inverso, `CommandDetailModal.jsx:137` mostra "Live Simulation" em inglês no modo PT.
**Achado:** O visitante em inglês vê partes em português no meio da tela, e o visitante em português vê um selo em inglês. Isso quebra a regra bilíngue (AGENTS.md §1).
**Recomendação:** Trocar todos esses textos por chaves `t()` com par PT/EN em `client/src/utils/i18n.js`, incluindo os selos do topo e os valores da prévia.
**Revisão:** Confirmado, com um caso extra ("Live Simulation" fixo em inglês).
