# 06. Painel (dashboard): estrutura, navegação e shell

> Nota da área: 5/10 · O painel tem boa base: menu com ícones completos, busca rápida, paywall integrado e área do dono bem trancada no servidor. Mas falha onde o cliente mais olha: a lista de servidores estoura a tela do celular com um nome comprido, os números de "7 dias" mostram 30 dias, e servidores comuns veem cadeados de "Premium" que a compra não abre. Erros (sessão vencida, API fora) deixam a pessoa sem saída.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q101 | Lista "Seus servidores" cabe em 360px com nome comprido | 🔴 PROBLEMA | alta |
| Q102 | Visão geral e barra do topo cabem em 360px | 🟡 PARCIAL | baixa |
| Q103 | Cadeados de plano somem depois da compra | 🔴 PROBLEMA | alta |
| Q104 | Números de "Atividade" batem com rótulo e idioma | 🔴 PROBLEMA | alta |
| Q105 | Recursos mostra erro se a API falhar | 🔴 PROBLEMA | média |
| Q106 | Gaveta do menu no celular funciona com teclado/leitor de tela | 🔴 PROBLEMA | média |
| Q107 | Busca rápida (Ctrl+K) mantém o item escolhido visível | 🔴 PROBLEMA | baixa |
| Q108 | Tela de erro mantém o menu de pé, como promete | 🔴 PROBLEMA | média |
| Q109 | Salvar dá retorno claro e evita clique duplo | 🟡 PARCIAL | baixa |
| Q110 | Botões de salvar, fechar e filtros seguem um padrão | 🟡 PARCIAL | baixa |
| Q111 | Sessão vencida ou erro desconhecido explica o que fazer | 🔴 PROBLEMA | média |
| Q112 | Login trata "não configurado" e erro estranho na URL | 🟡 PARCIAL | baixa |
| Q113 | Visão geral conta certo as seções liberadas e travadas | 🔴 PROBLEMA | média |
| Q114 | Ícones de servidor e avatar têm plano B se a imagem falhar | 🟡 PARCIAL | baixa |
| Q115 | Painel carrega leve em internet fraca | 🟡 PARCIAL | baixa |
| Q116 | Cada seção tem ícone próprio e sem repetição confusa | 🟡 PARCIAL | baixa |
| Q117 | Textos legíveis e alvos de toque bons no celular | 🟡 PARCIAL | baixa |
| Q118 | Troca rápida de servidor não mostra dados do anterior | 🟡 PARCIAL | média |
| Q119 | Campo de IDs em Acesso ajuda e avisa o que descartou | 🔴 PROBLEMA | média |
| Q120 | Telas globais fechadas para quem não é o dono | ✅ OK | info |

---

### Q101 — Na tela "Seus servidores" (Picker), a lista cabe na largura de um celular de 360px quando algum servidor tem nome comprido?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/dashboard/Dashboard.jsx:241` `<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">` (sem coluna definida abaixo de 640px). O nome usa `truncate` (linha 251), que não corta porque a coluna cresce até o texto inteiro. Medição: `scrollWidth=631` com tela de 360. Captura `/tmp/aud-painel-estrutura/ovf2.png`: todos os cartões passam da borda direita.
**Achado:** No celular, basta um servidor com nome grande para todos os cartões ficarem com 631px. Metade de cada cartão some para a direita e o nome não vira "...". A primeira tela do painel já aparece torta.
**Recomendação:** Pôr `grid-cols-1` (ou `minmax(0,1fr)`) no celular e `min-w-0` no item da lista. O nome comprido passa a terminar em "..." e o cartão cabe na tela.
**Revisão:** Confirmado. Conferi o código e a captura; não há CSS em `index.css` que limite a largura do `.dash-card`.

### Q102 — Na Visão geral do servidor em 360px, os cartões de atividade e a barra do topo cabem sem cortar nada?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/dashboard/Dashboard.jsx:480` `grid gap-3 md:grid-cols-2` (mesma grade sem coluna no celular). Medição: `scrollWidth=365` (5px a mais). Topo: `client/src/dashboard/Shell.jsx:424` `<span className="truncate ...md:hidden">` divide a linha com busca, idioma, avatar e sair (linhas 425-482), todos `shrink-0`.
**Achado:** A borda direita de quatro cartões fica 5px cortada no celular. O título do topo mostra só "Visão ..." porque sobra pouco espaço ao lado de quatro botões.
**Recomendação:** Usar `grid-cols-1` no celular nessa grade. No celular, levar o botão de idioma para dentro do menu e deixar mais espaço para o título.
**Revisão:** Confirmado. A conta de larguras no código bate com o corte medido.

### Q103 — Os cadeados de plano no menu lateral (Embeds "Premium", Aparência da Pyxie "Básico") somem quando o servidor compra o plano pedido?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/routes/dashboardRoutes.js:310` `all = getSections({ ...req.guildAccess, zone: 'cringelandia', role: 'owner' }, ...)` e linha 322 `.filter((id) => !allowed.includes(id) || !planFeatures.canUse(plan, id))`. Para servidor comum, `embeds`, `community` e `seasonal` só entram com zona Cringelândia (`dashboardRoutes.js:50`); `hyperfokus` só na Cringelândia (linha 43); `maryProfile` só com zona Mary ou extra `lojinha` (linhas 40-41). As rotas de Embeds ainda exigem `requireCringelandiaOwner` (linha 1715). O cliente mostra o paywall no lugar da tela (`client/src/dashboard/Dashboard.jsx:605,623-624`).
**Achado:** Um servidor comum vê Embeds, Comunidade, Evento sazonal e Hyperfokus com cadeado "Premium", e Aparência com "Básico". Depois de assinar, continuam travados, porque nenhum plano libera essas telas fora da zona certa. O painel promete algo que a compra não entrega.
**Recomendação:** Só mostrar cadeado quando o plano de fato libera a tela naquele servidor. Tela que depende de zona deve sumir; tela que depende de extra deve dizer "exige o extra Lojinha". Criar um teste: servidor Premium comum não pode ter cadeado que a compra não resolve.
**Revisão:** Confirmado. Procurei filtro no cliente e no `planFeatures.js`; não há. Só escapam dono do servidor, vitalício e zonas Mary/Cringelândia (`dashboardRoutes.js:313-317`).

### Q104 — Os números de "Atividade" na Visão geral batem com os rótulos e com o idioma escolhido?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/dashboard/Dashboard.jsx:324` período padrão `'30d'`; linhas 409-428 mostram `periodTotals` com rótulos `activity.joinsWeek` etc. = "Entradas (7 dias)" (`client/src/dashboard/i18n.js:741-743`). Datas montadas à mão em DD/MM (`Dashboard.jsx:455,468,475`). Texto fixo `{c.errors} err` (`Dashboard.jsx:491`).
**Achado:** Com o padrão "30 dias", os cartões "Entradas/Saídas/Comandos (7 dias)" mostram números de 30 dias. O dono lê dados errados do próprio servidor. Em inglês as datas saem como 30/10 em vez de 10/30, e "err" não é traduzido.
**Recomendação:** Trocar o rótulo junto com o período ("Entradas (30 dias)"). Formatar datas com `toLocaleDateString` no idioma ativo. Passar "err" pelo `t()`.
**Revisão:** Confirmado no código. Mantida alta: é a primeira tela do servidor e o erro aparece no padrão, sem a pessoa mexer em nada.

### Q105 — Se a API de Recursos (#/guild/<id>/features) falhar, a pessoa vê uma mensagem de erro?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/dashboard/Dashboard.jsx:763` `if (features.loading || !draft) return <Spinner .../>;` vem antes da linha 764 `if (features.error) return <ErrorNotice .../>;`. Com erro, `draft` fica `null` e a linha 764 nunca roda. Captura do auditor `/tmp/aud-painel-estrutura/features-fail.png`.
**Achado:** Quando a tela Recursos falha, ela fica em "Carregando..." para sempre. A pessoa não sabe o que houve nem tem botão para tentar de novo.
**Recomendação:** Testar o erro antes do spinner (a tela Acesso já faz assim, `Dashboard.jsx:945`). Pôr um botão "Tentar de novo" que chama `reload()`.
**Revisão:** Confirmado, mas rebaixado de alta para média: só acontece quando a API falha, e recarregar a página resolve quando a API volta.

### Q106 — O menu lateral do celular (botão ☰) dá para usar só no teclado ou com leitor de tela?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/dashboard/Shell.jsx:383-397` a gaveta é `<div>`/`<aside>` sem `role="dialog"`, sem `aria-modal` e sem mover o foco. O `Drawer` de `client/src/dashboard/ui.jsx:188-193` já usa `role="dialog"` e `autoFocus`. Ponto positivo: Esc fecha a gaveta (`Shell.jsx:356`).
**Achado:** Quem usa teclado ou leitor de tela abre o menu e o foco continua no botão ☰. O Tab segue pela página escondida atrás do fundo escuro. A pessoa não percebe que o menu abriu.
**Recomendação:** Dar `role="dialog" aria-modal="true"` à gaveta, levar o foco ao primeiro link ao abrir e devolver ao ☰ ao fechar, igual ao `Drawer` de `ui.jsx`.
**Revisão:** Confirmado. Acrescentei que Esc já fecha; isso não resolve o foco, então a severidade fica.

### Q107 — Na busca rápida (Ctrl+K), as setas do teclado mantêm o item escolhido visível e anunciado?
**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** `client/src/dashboard/Shell.jsx:290-299` as setas só mudam o índice; não há `scrollIntoView` nem `aria-activedescendant`. A lista tem altura máxima `max-h-80 overflow-y-auto` (linha 319).
**Achado:** Com o teclado, o destaque sai da caixa depois de uns 7 itens. A pessoa aperta Enter sem ver o que vai abrir, e o leitor de tela não fala o item escolhido.
**Recomendação:** Ao mudar o índice, rolar o item com `scrollIntoView({ block: 'nearest' })`. Dar `id` a cada opção e pôr `aria-activedescendant` no campo.
**Revisão:** Confirmado, mas rebaixado de média para baixa: digitar já filtra a lista, e mouse/toque não são afetados.

### Q108 — Quando uma tela do painel quebra, a tela de erro (ErrorBoundary) mantém o menu de pé, como promete?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/dashboard/main.jsx:9-11` `<ErrorBoundary><Dashboard /></ErrorBoundary>` é o único uso (grep em `client/src`). Comentário em `client/src/dashboard/ErrorBoundary.jsx:6-7` "o menu continua de pé"; texto `client/src/dashboard/i18n.js:24` "o resto do painel continua funcionando".
**Achado:** Um erro em qualquer seção apaga o painel inteiro: menu, troca de servidor e barra do topo. A mensagem diz que o resto continua funcionando, e isso não é verdade.
**Recomendação:** Pôr um ErrorBoundary só em volta do conteúdo da seção, dentro do Layout, com `key` igual à rota, para o erro sumir ao trocar de tela. Se ficar só no topo, corrigir o texto.
**Revisão:** Confirmado. Não há outro ErrorBoundary no código.

### Q109 — Ao salvar em Recursos, Acesso ou DM de parceria, a pessoa recebe retorno claro e não salva duas vezes sem querer?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/dashboard/Dashboard.jsx:849-853`, `997` e `1063` usam `<Button onClick={save}>` sem `disabled` nem "salvando", embora o `Button` aceite `disabled` (`client/src/dashboard/ui.jsx:55`). O aviso `Notice` é um `<p>` sem `role="status"` (`ui.jsx:80`). Em Recursos, "Salvo!" fica no fim da lista (`Dashboard.jsx:847`), longe da barra fixa.
**Achado:** O botão não mostra que está salvando e aceita vários cliques. Em listas longas, o "Salvo!" fica fora da tela e o leitor de tela não o anuncia. Ele também continua lá depois de novas edições, como se tudo já estivesse salvo.
**Recomendação:** Usar um estado "Salvando..." que desliga o botão. Mostrar o resultado colado ao botão, com `role="status"`. Apagar o "Salvo!" quando algo for editado.
**Revisão:** Rebaixado de média para baixa: os salvamentos são PUT (`client/src/dashboard/api.js:51,53`), então clicar duas vezes grava o mesmo dado, sem estrago. Fica o problema de retorno visual.

### Q110 — Botões de salvar, fechar, filtros e interruptores seguem o mesmo padrão de uma tela para outra?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** Salvar: barra fixa em Recursos (`client/src/dashboard/Dashboard.jsx:849`), botão no fim em Acesso (`Dashboard.jsx:997`), rodapé com "salvando" no hub (`client/src/dashboard/hub.jsx:86-96`). Fechar: caractere `✕` em `client/src/dashboard/ui.jsx:195` e ícone `<X>` em `client/src/dashboard/Shell.jsx:394`. Filtro de período: pílula `text-xs py-1` em Atividade (`Dashboard.jsx:383-391`) e `Button` de 44px em Erros (`Dashboard.jsx:1200-1202`).
**Achado:** Cada tela salva de um jeito: barra fixa, botão no fim ou rodapé lateral. Filtros iguais têm tamanhos diferentes. A pessoa precisa procurar o "Salvar" em cada seção.
**Recomendação:** Criar um rodapé de salvar único (fixo, com "Salvando..." e aviso) e usar em todos os formulários. Padronizar o ícone de fechar e um filtro em pílulas com altura mínima de 40px.
**Revisão:** Confirmado no código.

### Q111 — Quando a sessão expira ou a API dá um erro desconhecido, a mensagem explica o que fazer?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/dashboard/Dashboard.jsx:302-303` código sem tradução vira `t('error.generic', { error: code })` = "Algo deu errado: {error}" (`client/src/dashboard/i18n.js:15`). O servidor responde `not_authenticated` com 401 (`src/routes/dashboardRoutes.js:130`) e não há chave `error.not_authenticated` no i18n nem tratamento de 401 em `client/src/dashboard/api.js:31-34`. Sessão dura 7 dias (`src/services/panelSessions.js:9`).
**Achado:** Quando o login vence com o painel aberto, cada tela mostra "Algo deu errado: not_authenticated", em linguagem técnica. Nada leva de volta ao login, e o que estava sendo editado se perde ao recarregar.
**Recomendação:** No status 401, mostrar "Sua sessão expirou" com botão "Entrar de novo" que guarda o endereço atual (o Login já usa `pyxie_after_login`). Traduzir os erros comuns (`http_500`, `http_404`, `csrf_header_missing`).
**Revisão:** Confirmado.

### Q112 — A tela de login trata bem os casos "login não configurado" e erro desconhecido na URL?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/routes/dashboardRoutes.js:201-204` e `217-220` respondem `res.status(503).json({ ... error: 'panel_not_configured' })`, um JSON cru. A chave `error.panel_not_configured` existe (`client/src/dashboard/i18n.js:14`) mas nunca chega à tela. O Login mostra `t(\`error.${error}\`)` sem plano B (`client/src/dashboard/Dashboard.jsx:186`), então um código desconhecido aparece como "error.xxx".
**Achado:** Se a VM estiver sem a configuração do login, "Entrar com Discord" abre uma página de código em vez de uma mensagem. Um código estranho na URL aparece como texto técnico.
**Recomendação:** Redirecionar para `/dashboard?error=panel_not_configured` em vez de JSON. No Login, quando a chave não existir, mostrar "Não deu para entrar. Tente de novo."
**Revisão:** Rebaixado de média para baixa. O JSON só aparece com a VM mal configurada (o servidor já avisa no log, `dashboardRoutes.js:71-75`). Quando a pessoa cancela no Discord, o retorno cai em `login_state` (linha 225), que tem tradução; `access_denied` só aparece se alguém digitar na URL.

### Q113 — A Visão geral informa direito quantas seções estão liberadas e quais estão travadas pelo plano?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/dashboard/Dashboard.jsx:716` `shortcuts = ids.filter((id) => id !== 'overview')` inclui as travadas, porque a API soma as travadas em `sections` (`src/routes/dashboardRoutes.js:337`). O cartão usa "{count} seções liberadas para você" (`client/src/dashboard/i18n.js:635`). `SectionGrid` (`Dashboard.jsx:688-711`) não recebe o mapa de travas e não mostra cadeado.
**Achado:** O resumo diz "20 seções liberadas", mas parte delas está travada. Os atalhos não mostram cadeado, então a pessoa clica esperando a tela e cai no paywall.
**Recomendação:** Contar só as seções sem cadeado. Passar `lockedMap` ao `SectionGrid` e mostrar o mesmo selo de plano do menu.
**Revisão:** Confirmado.

### Q114 — Os ícones de servidor e o avatar da pessoa têm plano B quando a imagem não carrega?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/dashboard/ui.jsx:139` `<img src={guild.icon} alt={guild.name} ...>` e `client/src/dashboard/Shell.jsx:463` (avatar), ambos sem `onError`. O avatar vem do hash salvo no login (`src/routes/dashboardRoutes.js:273`). O substituto com a inicial (`ui.jsx:141-149`) só aparece quando não há ícone nenhum.
**Achado:** Se a pessoa troca o avatar no Discord, o endereço salvo deixa de existir e aparece uma imagem quebrada no topo, com o texto alternativo vazando do círculo. O mesmo vale para ícones de servidor que falham.
**Recomendação:** No `GuildIcon` e no avatar, guardar "falhou" com `onError` e mostrar a inicial com degradê.
**Revisão:** Confirmado no código.

### Q115 — O painel carrega leve num celular com internet fraca?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `public/dist/dashboard/assets/dashboard-B5Y1G9KG.js` = 780.816 bytes (210.632 com gzip), arquivo único. `client/src/dashboard/Dashboard.jsx` não usa `React.lazy`/`Suspense` (grep vazio). `client/src/dashboard/i18n.js` tem 4.096 linhas, PT e EN juntos. `public/assets/pyxie/sticker/sticker_smile.png`: 320x320, 137.943 bytes, usado como ícone pequeno (`client/src/dashboard/Shell.jsx:52`).
**Achado:** Quem abre o painel só para virar um interruptor baixa o código de todas as telas, os dois idiomas e uma imagem de 138KB para um ícone pequeno. Em 3G isso pesa alguns segundos de "Carregando...".
**Recomendação:** Carregar cada seção sob demanda com `React.lazy`. Separar os idiomas em arquivos. Gerar uma versão de 96px em WebP do ícone (menos de 10KB).
**Revisão:** Medições conferidas. Rebaixado de média para baixa: 210KB com gzip é comum para um painel, e o uso principal é de quem administra servidor, muitas vezes no PC.

### Q116 — Todas as seções do menu têm ícone próprio e coerente, sem ícone genérico nem repetição com outro sentido?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/dashboard/Shell.jsx:59-99` `SECTION_META` cobre as seções. Repetições: `HeartHandshake` em `community` (linha 74) e no link "Cringelândia" (linha 107); `BookOpen` em `hyperfokus` (linha 94) e no link do blog (linha 105). `tools` (linha 77) não aparece em nenhuma rota de `src/routes/dashboardRoutes.js` (grep vazio).
**Achado:** Os ícones estão completos. Mas o mesmo desenho quer dizer "abrir site" no topo e "abrir seção" no menu, o que confunde quem olha só o ícone.
**Recomendação:** Usar ícones diferentes para links externos, ou somar um pequeno ↗. Tirar `tools` do mapa.
**Revisão:** Confirmado. Impacto pequeno: os links do topo só aparecem a partir de 768px e têm dica ao passar o mouse (`Shell.jsx:432-438`).

### Q117 — A densidade de informação tem textos legíveis e alvos de toque bons no celular?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** Filtros "7 dias/30 dias" e "Mensagens/Comandos" com `py-1 text-xs` (`client/src/dashboard/Dashboard.jsx:388,441`), cerca de 24px de altura. Selos de plano `text-[10px]` (`client/src/dashboard/Shell.jsx:252`); "Ctrl K" `text-[10px]` (`Shell.jsx:445`). Dicas dos números `truncate text-[11px]` (`client/src/dashboard/ui.jsx:131`). A dica de mensagens termina em " · " quando não há variação (`Dashboard.jsx:408`).
**Achado:** Vários controles do celular ficam bem abaixo de 44px e são difíceis de tocar. Selos de plano e dicas dos números têm 10-11px e muitas vezes saem cortados, então a informação mais útil do cartão some.
**Recomendação:** Altura mínima de 40px em filtros e links. Selos e dicas com no mínimo 12px. No celular, deixar a dica quebrar linha em vez de cortar. Só mostrar " · " quando houver variação.
**Revisão:** Confirmado no código.

### Q118 — Ao trocar de servidor rápido pela trilha à esquerda, o painel pode mostrar dados do servidor anterior?
**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `client/src/dashboard/Dashboard.jsx:285-296` `useLoad` faz `loader().then(...)` sem cancelar nem conferir se o pedido ainda vale. `GuildView` é montado sem `key` (`Dashboard.jsx:132`). As seções (ex.: Recursos, linha 754) usam o mesmo `useLoad` e salvam no `guildId` da rota atual.
**Achado:** Se a pessoa clica no servidor A e logo no B, e a resposta do A chega por último, a tela do B pode mostrar o rascunho do A. Ao salvar, a configuração do A vai para o B. É raro, mas pode estragar a configuração de outro servidor.
**Recomendação:** Em `useLoad`, ignorar respostas antigas (contador de pedidos ou `AbortController`). Ou pôr `key={guildId}` no `GuildView`.
**Revisão:** Confirmado. Mantida média: além de mostrar dado errado, o rascunho velho pode ser salvo no servidor novo.

### Q119 — O campo "IDs de usuários (um por linha)" em Acesso ajuda a preencher certo e avisa o que foi descartado?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `client/src/dashboard/Dashboard.jsx:977-983` textarea livre, sem exemplo nem validação. O backend descarta em silêncio o que não for ID de 17-20 dígitos e corta acima de 100 (`src/services/panelAccess.js:64`). A tela troca o texto pela lista limpa e mostra "Salvo!" (`Dashboard.jsx:952-953`). Cargos: `emptyLabel={t('app.loading')}` (`Dashboard.jsx:989`), e o `MultiSelect` mostra esse texto quando a lista está vazia (`client/src/dashboard/ui.jsx:154`).
**Achado:** Se o dono cola "@fulano" ou um nome, a linha some depois de salvar e a tela diz "Salvo!". A pessoa acha que liberou alguém que ficou de fora. Sem cargos, ou com erro na lista, aparece "Carregando..." para sempre.
**Recomendação:** Validar cada linha antes de salvar e marcar as inválidas ("isso não é um ID do Discord"). Mostrar "X de 100 pessoas" e um link de como copiar o ID. Trocar o texto vazio de cargos por "Nenhum cargo encontrado" e mostrar o erro quando a lista falhar.
**Revisão:** Confirmado.

### Q120 — As telas globais do dono (#/global/...) ficam fechadas para quem não é o dono, na tela e no servidor?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `client/src/dashboard/Dashboard.jsx:133` só abre `GlobalView` com `me?.user?.isOwner`; senão cai no Picker. `src/routes/dashboardRoutes.js:1842-1845` `requireOwner` responde 403 `owner_only`; grep confirma que todas as rotas `/api/dashboard/global/` usam `requireOwner`. Mudanças exigem o cabeçalho `X-Pyxie-Panel` (`dashboardRoutes.js:131-133`).
**Achado:** Quem não é o dono não vê o atalho "Pyxie (global)" e, mesmo digitando o endereço, volta para a lista de servidores. A API também recusa. A regra "a tela esconde e o servidor recusa" está cumprida.
**Recomendação:** Manter. Opcional: mostrar "Área só do dono" em vez de voltar em silêncio, para não parecer link quebrado.
**Revisão:** Confirmado por amostragem.
