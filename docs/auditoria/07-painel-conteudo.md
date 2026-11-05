# 07. Painel: módulos de conteúdo e loja

> Nota da área: 5/10 · As telas funcionam e a prévia do Estúdio é segura, mas a loja aceita preço vazio (vira R$ 1,00) e oferece uma entrega por link que não tem campo para o link. Há quebras de layout reais (troca de emoji em Embeds, listas de Emojis e Uso de emojis em celular). Também há vários campos que o servidor corrige ou corta sem avisar, além de erros técnicos sem tradução.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q121 | Preço vazio/0/0,50 na Loja > Produtos | 🔴 PROBLEMA | média |
| Q122 | Entrega "Link fixo (gamepass)" funciona | 🔴 PROBLEMA | média |
| Q123 | Editar produto, repor estoque e apagar com retorno | 🔴 PROBLEMA | média |
| Q124 | Linha de troca de emoji cabe na tela (Embeds) | 🔴 PROBLEMA | alta |
| Q125 | Listas de Emojis e Uso de emojis em 360px | 🔴 PROBLEMA | média |
| Q126 | Contadores do Estúdio seguram o limite | 🟡 PARCIAL | média |
| Q127 | Erro do Estúdio diz qual campo corrigir | 🔴 PROBLEMA | média |
| Q128 | Perguntas do formulário: limite e espaço no celular | 🔴 PROBLEMA | média |
| Q129 | Vários "Cargos para marcar" no guia de apoio | 🔴 PROBLEMA | média |
| Q130 | Intervalo do guia de apoio vazio ou inválido | 🔴 PROBLEMA | média |
| Q131 | Link de imagem errado / texto longo em Embeds | 🟡 PARCIAL | baixa |
| Q132 | Seletor de cor mostra a cor original | 🟡 PARCIAL | baixa |
| Q133 | Upload acima de 8 MB na Mary | 🔴 PROBLEMA | média |
| Q134 | Anúncio Shopee sem foto | 🔴 PROBLEMA | baixa |
| Q135 | Exportar CSV de Uso de emojis | 🔴 PROBLEMA | média |
| Q136 | Campos de Pix da Lojinha da Mary | 🟡 PARCIAL | média |
| Q137 | Boas-vindas: regras de número e imagem | 🟡 PARCIAL | baixa |
| Q138 | Botões só com ícone: nome e área de toque | 🔴 PROBLEMA | média |
| Q139 | Prévia do Estúdio protegida contra código | ✅ OK | info |
| Q140 | "← Voltar" com mudanças não salvas | 🔴 PROBLEMA | média |

---

### Q121 — Em Loja > Produtos, o que acontece se o dono salvar um produto com o Preço vazio, 0 ou 0,50?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média (era alta)
- **Evidência:** `client/src/dashboard/StoreProducts.jsx:54` `cents = (v) => Math.round((Number(...) || 0) * 100)` (vazio vira 0). `src/services/storeProducts.js:110` `priceCents: clampInt(raw.priceCents, MIN_PRICE_CENTS, MAX_PRICE_CENTS, 0)` com `MIN_PRICE_CENTS = 100` (`:24`). O aviso de `:204` (`if (!merged.priceCents) ... 'price_required'`) nunca dispara. Teste com `normalizeProduct`: `0 → 100`, `'' → 100`, `50 → 100`, `99999999 → 5000000`.
- **Achado:** Com o preço vazio, 0 ou R$ 0,50, o produto é salvo valendo R$ 1,00 e a tela diz "Salvo". Valores acima de R$ 50.000 são cortados sem aviso. Se o dono não perceber, o produto vai à venda por R$ 1,00.
- **Recomendação:** Bloquear o botão Criar com o preço vazio ou abaixo de R$ 1,00 e mostrar o motivo embaixo do campo. No servidor, recusar o preço fora da faixa ("price_required" / "price_out_of_range") em vez de corrigir sozinho.
- **Revisão:** Confirmado com teste direto. Rebaixado de alta para média: a lista mostra o preço salvo (`StoreProducts.jsx:159` `brl(p.priceCents / 100)`), então o dono vê "R$ 1,00" logo depois de salvar. Não é venda silenciosa.

### Q122 — No formulário de novo produto, a opção de entrega "Link fixo (gamepass)" funciona?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média (era alta)
- **Evidência:** `client/src/dashboard/StoreProducts.jsx:216-222` oferece `['code', 'message', 'manual']`; o `save` (`:68-79`) não envia `deliveryUrl`; não existe campo de link no formulário. `src/services/storeProducts.js:206` `if (merged.delivery === 'message' && !merged.deliveryUrl) return { ok: false, reason: 'delivery_url_required' }`. Busca por `deliveryUrl` no `client/src`: nenhum resultado. O erro aparece por `error.generic` (`StoreProducts.jsx:24`): "Algo deu errado: delivery_url_required".
- **Achado:** A opção aparece no menu, mas nunca dá para salvar com ela. O dono recebe uma mensagem técnica em inglês e não entende o que falta.
- **Recomendação:** Quando "Link fixo" for escolhido, mostrar o campo obrigatório "Link da gamepass (https://)". Traduzir o erro para "Cole o link da gamepass".
- **Revisão:** Confirmado: nenhum lugar do painel envia o link. Rebaixado de alta para média: o problema bloqueia a opção, mas não causa perda de dinheiro, e as entregas "código" e "manual" funcionam.

### Q123 — Na lista de produtos, o dono consegue corrigir um produto já criado e recebe retorno claro ao repor o estoque ou apagar?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `StoreProducts.jsx:176-178` botão `×` chama `remove(p.id)` direto, sem `confirm`. `:82-86` `addStock` descarta a resposta `{ added, skipped, stockCount }` que o servidor devolve (`storeProducts.js:249-255`). `storeProducts.js:189` `duplicate_id` ao criar com o mesmo nome; `:245` corta em `MAX_STOCK = 500`. A tela não tem botão Editar, embora `saveProduct` aceite atualizar (`:180-183`).
- **Achado:** Para mudar o preço ou o custo, é preciso apagar e recriar o produto, e os códigos em estoque se perdem. Um toque no "×" apaga na hora. Ao repor códigos, a tela só diz "Salvo", sem contar repetidos ignorados nem dizer se o teto de 500 cortou parte da lista.
- **Recomendação:** Adicionar Editar (abre o formulário preenchido). Pedir confirmação antes de apagar. Depois de repor, mostrar "X adicionados, Y repetidos ignorados, total Z/500".
- **Revisão:** Confirmado. O servidor já sabe editar e já devolve os números; falta só a tela usar.

### Q124 — Na tela Embeds, a linha de troca de emoji ("🪙 → {emoji:...}") cabe na tela em celular, tablet e desktop?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `client/src/dashboard/Embeds.jsx:76` `className={`${field} w-20 shrink-0 text-center`}`, em que `field` já traz `w-full` (`:8`). No CSS gerado (`public/dist/assets/*.css`), `.w-full` vem depois de `.w-20` e vence. Medição: `scrollWidth` 498 em 360px, 894 em 768px e 1406 em 1280px; o campo de destino fica com 26px (`/tmp/aud-painel-conteudo/result.json`). O mesmo `SwapList` é usado no editor de cada embed (`Embeds.jsx:264`).
- **Achado:** A linha vaza para fora do cartão em todas as larguras. O campo do emoji de origem toma a linha toda, o campo do emoji novo fica quase invisível e os botões 🙂 e ✕ saem da tela.
- **Recomendação:** Trocar `w-full` por largura fixa no campo de origem e dar `min-w-0` ao campo de destino. Em celular, pôr os botões numa segunda linha.
- **Revisão:** Confirmado pela ordem das classes no CSS compilado e pela medição. Severidade mantida: o campo principal fica inutilizável em qualquer tela.

### Q125 — As listas das telas Emojis e Uso de emojis cabem em 360px quando o nome ou a descrição é longo?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Emojis.jsx:113` `<li className="dash-card rounded-2xl p-4">` é item de grade sem `min-w-0`. `client/src/dashboard/EmojiUsage.jsx:59` `<li className="dash-card flex ...">` é igual. Medição em 360px: Emojis `scrollWidth` 472 (botão "Padrão" em `right=455`); Uso de emojis `scrollWidth` 414 (contador em `right=401`).
- **Achado:** Em celular, os cartões ficam mais largos que a tela e a página rola para o lado. O botão "Padrão" fica fora da área visível. O corte com reticências dos nomes compridos não funciona.
- **Recomendação:** Pôr `min-w-0` nos `li` dessas grades. Em celular, deixar "Trocar" e "Padrão" numa linha própria embaixo do texto.
- **Revisão:** Confirmado. Corrigida a linha citada do Uso de emojis (o arquivo tem 75 linhas; o item fica na `:59`, não na `:211`).

### Q126 — No Estúdio, os contadores "x/limite" impedem passar do limite do Discord, inclusive o total de 6000 e os blocos do formato novo?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Studio.jsx:39-47` e `:51-60` mostram `{length}/{maxLength}`, mas o `<input>`/`<textarea>` não recebe `maxLength` e o texto continua `text-white/40` mesmo passando do limite. `Studio.jsx:321` e `:330` usam `TextArea` sem `maxLength`. `src/services/messageStudio.js:16` `embedTotal: 6000` e `:28` `v2Text: 4000` só são checados ao salvar (`:250`, `:266`). Busca por "6000"/"total" no Studio.jsx: nada.
- **Achado:** O contador aparece, mas não segura nem alerta: dá para digitar 5000 letras numa descrição de 4096. O total de 6000 por mensagem e o limite de 4000 do formato novo não aparecem na tela. A pessoa só descobre ao salvar.
- **Recomendação:** Deixar o contador vermelho ao passar do limite e mostrar "Total: x/6000" (ou x/4000 no formato novo). Nos campos simples, usar `maxLength`.
- **Revisão:** Confirmado. O servidor recusa o excesso, então nada quebra no Discord; o problema é só o aviso tardio.

### Q127 — Quando o Estúdio recusa uma mensagem, o aviso diz em linguagem simples qual campo corrigir?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Studio.jsx:614-616` `t(`studio.err.${err.code}`, { path: err.path, ... })`, exibido em `:971`. `client/src/dashboard/i18n.js:461` "Longo demais em {path} (máx. {limit})." `src/services/messageStudio.js:241` usa o caminho `${p}.fields.${j}.value`.
- **Achado:** O erro aparece como "Longo demais em embeds.0.fields.2.value". Para quem não programa, isso não diz onde está o problema, e o campo com erro não fica marcado.
- **Recomendação:** Traduzir o caminho ("Embed 1 › Campo 3 › Valor", "Botão 4 › Link"), contar a partir de 1, pintar a borda do campo de vermelho e rolar até ele.
- **Revisão:** Confirmado: o caminho chega cru à tela e não há outra tradução.

### Q128 — No botão "Abrir formulário" do Estúdio, as perguntas têm limite e espaço suficiente em celular?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Studio.jsx:452` campo da pergunta sem `maxLength`; `:453` `select` com `${field} w-28`, em que `field` tem `w-full` (`:6`), então os dois dividem a linha. `src/services/messageStudio.js:97` `label: str(f?.label, 45)` corta sem gerar erro. Medição em 360px: `INPUT[text] w=105` e `SELECT w=105` (`result.json`, captura `studio-crop1.png`).
- **Achado:** O Discord só aceita perguntas de até 45 letras, e o servidor corta o resto sem avisar, então a pergunta pode chegar pela metade ao membro. Em celular, o campo da pergunta tem 105px e não dá para ler o que foi escrito.
- **Recomendação:** Limitar a 45 com contador. Em celular, pôr a pergunta numa linha inteira e o tipo (Curta/Longa) e o × embaixo.
- **Revisão:** Confirmado. O título do formulário já tem limite (`:444` `maxLength={45}`), as perguntas não.

### Q129 — No guia de apoio, o campo "Cargos para marcar" (vários cargos) é respeitado pelo servidor?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média (era alta)
- **Evidência:** `client/src/dashboard/Periodic.jsx:71-75` `MultiSelect` grava `pingRoleIds: v, pingRoleId: v[0]` e `emptyLabel={t('app.loading')}`. `src/services/periodicMessages.js:69` só guarda `pingRoleId: id(b.pingRoleId)`; `pingRoleIds` não existe em `src/`. `client/src/dashboard/ui.jsx:154` mostra o `emptyLabel` quando não há opções; `Periodic.jsx:34` engole o erro ao carregar cargos.
- **Achado:** A tela deixa marcar vários cargos, mas só o primeiro é salvo; ao reabrir, os outros sumiram sem aviso. Sem cargos (ou se a busca falhar), a caixa diz "Carregando…" para sempre.
- **Recomendação:** Escolher um caminho: aceitar vários cargos no servidor ou trocar por escolha de um cargo só. Trocar o texto vazio por "Nenhum cargo disponível".
- **Revisão:** Confirmado. Linhas corrigidas (o arquivo tem 146 linhas). Rebaixado de alta para média: o guia continua saindo e marca o primeiro cargo; a perda é de alcance, não de função.

### Q130 — O campo "Intervalo (horas, de 2 a 72)" do guia de apoio aceita valores inválidos ou vazios?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Periodic.jsx:63` `bump({ intervalHours: e.target.value })` envia texto; não há `<form>`, então `min`/`max` não bloqueiam. `src/services/periodicMessages.js:15` `clamp` usa `Number.isFinite(Number(n))`, e `Number('')` dá 0 (finito); `:63` `clamp(b.intervalHours, 2, 72, 12)` vira 2. `:72` `maxPerDay` padrão 0 = sem teto. A Hora do tarot (`Periodic.jsx:124`) e a Hora dos parabéns (`Welcome.jsx:188`) usam `Number(e.target.value)`: campo vazio vira 0h (meia-noite).
- **Achado:** Se a pessoa apaga o número e salva, o intervalo vira 2 horas em vez do padrão 12. O guia passa a sair 12 vezes por dia, o que vira spam no canal. Com tarot e parabéns, campo vazio agenda para meia-noite sem aviso.
- **Recomendação:** Validar antes de salvar com o aviso "Use de 2 a 72 horas". No servidor, tratar vazio como "usar padrão" (12h).
- **Revisão:** Confirmado com teste de `Number('')`. Linha corrigida de `:290` para `:63`.

### Q131 — Na edição de um embed (tela Embeds), um link de imagem errado ou um texto longo demais é avisado antes de salvar?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa (era média, PROBLEMA)
- **Evidência:** `client/src/dashboard/Embeds.jsx:242` e `:260` são campos de texto sem validação; `TextField` (`:128-141`) sem contador. `src/services/embedOverrides.js:88` `isUrl` só aceita `https://`; `:107-108` descarta o resto; `:207` `fit()` corta com "…". Mas `Embeds.jsx:162-169` pede a prévia ao servidor, "com a mesma regra do bot", meio segundo depois de digitar, e mostra em "Com mudanças" (`:200-201`).
- **Achado:** Não há aviso nem contador. Porém a prévia ao lado já mostra o resultado real: com `http://` a imagem some da prévia, e o texto longo aparece cortado com "…". Quem olha a prévia percebe; quem não olha só descobre no Discord.
- **Recomendação:** Mostrar um aviso curto ("Use um link https") quando o servidor descartar o link e pôr contadores de título (256) e descrição (4096).
- **Revisão:** Rebaixado: a prévia do servidor (`Embeds.jsx:162-169`) já mostra o efeito antes de salvar, então o problema é falta de aviso explícito, não erro escondido.

### Q132 — O seletor de cor da tela Embeds mostra corretamente quando a cor original está mantida?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Embeds.jsx:212` `<input type="color" value={o.color || '#8b5cf6'}>`; o botão "manter cor" (`:213-217`) só aparece com uma cor escolhida.
- **Achado:** Sem mudança, o quadradinho mostra roxo `#8b5cf6` em vez da cor real do embed. A prévia "Original" ao lado mostra a cor certa, mas o quadradinho confunde.
- **Recomendação:** Quando vazio, mostrar a cor do embed original com a legenda "cor da Pyxie". Opcional: campo de texto #RRGGBB ao lado.
- **Revisão:** Confirmado. Retirada a parte "o seletor não aceita colar hex em celulares", que não foi verificada.

### Q133 — No envio de imagem da Mary (recibo, avatar, banner), o painel avisa direito quando o arquivo passa de 8 MB?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Mary.jsx:87-99` envia sem checar `file.size`. `src/routes/dashboardRoutes.js:592` `express.raw({ ..., limit: '8mb' })` gera erro 413 antes da rota. O único tratador antes do fim (`server.js:356-361`) só cuida de JSON malformado; o erro cai em `server.js:1842-1845` → 500 "Erro interno no servidor.". O texto amigável existe em `client/src/dashboard/i18n.js:230` (`mary.err.file_too_large`), mas só para o erro da `maryStudioManager.js:603`, que nunca é alcançado porque o limite é o mesmo (8 MB).
- **Achado:** Uma foto de celular acima de 8 MB mostra "Algo deu errado: Erro interno no servidor.". Parece que o site quebrou, quando o problema é só o tamanho.
- **Recomendação:** Checar o tamanho no navegador antes de enviar e mostrar "Imagem grande demais (até 8 MB)". No servidor, transformar o erro 413 em `file_too_large`.
- **Revisão:** Confirmado. Retirada a parte "envia o arquivo inteiro antes de recusar", que não foi medida.

### Q134 — Na vitrine da Shopee (área do dono), o que aparece quando um anúncio não tem foto?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Shopee.jsx:106` `<img src={item.imagem} alt={item.titulo} ...>` sem checar vazio. Medição: imagem quebrada com `src` vazio em 360, 768 e 1280px. O botão de buscar foto já existe (`Shopee.jsx:118-121`, `shopee.syncOne`).
- **Achado:** Um anúncio sem foto mostra o ícone de imagem quebrada. O texto alternativo repete o título, que já aparece ao lado, e o leitor de tela lê duas vezes.
- **Recomendação:** Sem foto, mostrar um quadrado com ícone de sacola. Usar `alt=""`, porque o título já está ao lado.
- **Revisão:** Confirmado. Linha corrigida (o arquivo tem 138 linhas; era `:337`). O botão "Buscar foto" já existe, só falta o espaço vazio bonito.

### Q135 — O arquivo "Exportar CSV" da tela Uso de emojis traz informação correta e legível?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/EmojiUsage.jsx:31` `data.emojis.map((e) => `...,${e.lastUsedAt || 0},${Boolean(e.idle)}`)`. O campo `idle` só existe na lista calculada (`:20`). A rota `src/routes/dashboardRoutes.js:858` não envia `idle`.
- **Achado:** A coluna "idle" (parado) sai sempre `false`, mesmo para emojis parados há meses. A data sai como número grande (milissegundos), não como data. O filtro "só parados" da tela é ignorado. O arquivo não ajuda a decidir quais emojis apagar.
- **Recomendação:** Exportar a lista já calculada (com "parado" certo e o filtro atual), com data em dd/mm/aaaa e nomes entre aspas.
- **Revisão:** Confirmado. Linhas corrigidas (`:31` e `:20`, não `:183` e `:172`).

### Q136 — Os campos de Pix da Lojinha da Mary (chave, nome, cidade) têm limites coerentes com o padrão Pix e com o servidor?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Mary.jsx:225`, `:229`, `:232` `maxLength` 77/25/15. `src/modules/mary-studio/maryDashboard.js:77-79` `str(..., 77/25/15)`. `src/modules/mary-studio/utils/robloxHelper.js:204-219` só faz `trim` na chave; nome e cidade perdem acentos e viram maiúsculas.
- **Achado:** Os limites batem com o padrão Pix e com o servidor, e os acentos são tratados. A chave não tem nenhuma checagem de formato: um erro de digitação gera um código Pix que o banco do cliente não reconhece, e a venda trava.
- **Recomendação:** Validar a chave ao digitar (CPF/CNPJ só números, e-mail com @, telefone +55, chave aleatória com 36 caracteres) e mostrar o tipo detectado. Oferecer "Gerar Pix de teste".
- **Revisão:** Confirmado: não há validação de chave em nenhum lado.

### Q137 — Na tela Boas-vindas, os campos de número e de imagem seguem as mesmas regras do servidor?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Welcome.jsx:162` `min={6} max={72}`, mas `src/services/welcomeFlow.js:57` aceita de 1 a 72. `Welcome.jsx:102` `type="url"` aceita `http://`, mas `welcomeFlow.js:65` só guarda `https://` e apaga o resto. Não há `<form>`, então `min`/`max` não bloqueiam. `guideImageUrl` só aparece na `:102`: não há miniatura.
- **Achado:** A tela sugere no mínimo 6 horas, mas o servidor aceita 1. A imagem do guia com `http://` some depois de salvar, e a tela ainda diz "Salvo". Não há miniatura para conferir o link.
- **Recomendação:** Igualar os limites nos dois lados, avisar "use um link https" e mostrar a miniatura da imagem embaixo do campo.
- **Revisão:** Confirmado.

### Q138 — Os botões só com ícone (🙂, ✕, ×, Padrão) nas telas Embeds, Loja e Emojis têm nome para leitor de tela e área de toque suficiente?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Embeds.jsx:78-83` botões 🙂 e ✕ da troca sem `aria-label`; `client/src/dashboard/StoreProducts.jsx:176-178` "×" sem `aria-label` e sem confirmação. Medição: "Padrão" em Emojis com 16px de altura; o 🙂 de cada campo em Embeds com 24px. Em Shopee, o botão de apagar já tem `aria-label` e `window.confirm` (`Shopee.jsx:126-127`), mas a área de toque mede 15px.
- **Achado:** O leitor de tela não diz o que os botões ✕ e × apagam. Em celular, "Padrão" e o apagar da Shopee têm 15-16px, fáceis de errar com o dedo. O "×" da loja e o "Padrão" de Emojis agem sem perguntar.
- **Recomendação:** Dar `aria-label` claro ("Apagar troca", "Apagar produto", "Voltar ao emoji padrão"), garantir 44px de área de toque e pedir confirmação antes de apagar.
- **Revisão:** Confirmado com ajuste: o botão da Shopee já tem nome e confirmação; só a área de toque é pequena.

### Q139 — A prévia estilo Discord do Estúdio, que monta HTML a partir do texto digitado, está protegida contra código malicioso?
- **Veredito:** ✅ OK
- **Severidade:** info
- **Evidência:** `client/src/dashboard/Studio.jsx:80-82` `escapeHtml` (&, <, >, ") roda antes de qualquer troca (`:86`); emoji personalizado só aceita id numérico (`:92`); `{server}` também é escapado (`:96`); link markdown não insere a URL (`:111`); imagens só com `https` e via JSX (`:156-161`).
- **Achado:** O texto é escapado antes de virar HTML. Colar `<script>` ou `<img onerror>` aparece só como texto na prévia.
- **Recomendação:** Manter assim. Se novas marcações entrarem na prévia, continuar escapando primeiro e nunca pôr a URL do usuário dentro de atributos.
- **Revisão:** Confirmado por amostragem.

### Q140 — No editor do Estúdio, tocar em "← Voltar" com mudanças não salvas avisa antes de descartar?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Studio.jsx:851-853` `onClick={onClose}` e `:721-725` `setEditing(null)` sem comparar com o salvo. O mesmo em `client/src/dashboard/Embeds.jsx:190-192` e `:330`. Busca por `beforeunload`, `localStorage` ou rascunho nesses arquivos: nada.
- **Achado:** Quem passa minutos montando uma mensagem e toca em Voltar (ou no menu lateral) perde tudo sem aviso. No celular, o Voltar fica no topo e é fácil de tocar sem querer.
- **Recomendação:** Guardar uma cópia do último salvo e, se houver diferença, perguntar "Sair sem salvar?". Opcional: rascunho no navegador.
- **Revisão:** Confirmado: não há aviso nem rascunho.
