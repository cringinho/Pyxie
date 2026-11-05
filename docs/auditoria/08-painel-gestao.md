# 08. Painel: módulos de moderação, segurança, comunidade e planos

> Nota da área: 5/10 · As telas são completas e quase todas têm rótulos traduzidos, mas várias ações graves (cancelar plano, revogar vaga de fundador, ativar emergência, revogar caso) rodam com um clique, sem confirmação e às vezes sem aviso de erro. Na moderação há recursos invisíveis ou mortos: limites automáticos de punição (até banimento) que a tela não mostra e um canal de log que nada usa.

## Tabela-resumo

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q141 | Antinuke: "IDs confiáveis" é seletor ou ID digitado? | 🔴 PROBLEMA | média |
| Q142 | Sazonal: campos de ID validam antes de excluir/zerar? | 🔴 PROBLEMA | média |
| Q143 | "Cancelar assinatura" confirma e preserva dias pagos? | 🔴 PROBLEMA | crítica |
| Q144 | "Cartão recorrente" mostra o link mesmo com bloqueador de pop-up? | 🔴 PROBLEMA | alta |
| Q145 | Planos: mostra o plano atual e dá retorno ao clicar? | 🟡 PARCIAL | baixa |
| Q146 | Advertências/Casos: erros aparecem na tela? | 🔴 PROBLEMA | alta |
| Q147 | "Ativar Emergência" pede confirmação? | 🟡 PARCIAL | média |
| Q148 | Advertências cumpre "ações automáticas por limite"? Salvar é coerente? | 🔴 PROBLEMA | alta |
| Q149 | Segurança cabe em 360px com nomes longos? | 🟡 PARCIAL | média |
| Q150 | Planos em 360px: títulos e preços inteiros e coerentes? | 🟡 PARCIAL | baixa |
| Q151 | Editar motivo do caso é acessível a leitor de tela? | 🔴 PROBLEMA | baixa |
| Q152 | Monitor de links: erro ao adicionar mantém a lista? | 🔴 PROBLEMA | média |
| Q153 | Seletores múltiplos: mensagem certa para lista vazia/erro? | 🟡 PARCIAL | baixa |
| Q154 | Textos seguem a regra bilíngue? | 🔴 PROBLEMA | média |
| Q155 | Paywall diz o que está travado e o que se ganha? | 🟡 PARCIAL | baixa |
| Q156 | "Canal de log" de advertências funciona e é validado? | 🔴 PROBLEMA | média |
| Q157 | Programa Fundador: revogar vaga pede confirmação? | 🔴 PROBLEMA | média |
| Q158 | Ícones seguem um padrão? | 🟡 PARCIAL | baixa |
| Q159 | Lista de casos mostra quem e qual ação, legível? | 🔴 PROBLEMA | média |
| Q160 | Campos de imagem por URL têm prévia e fallback? | 🟡 PARCIAL | baixa |

---

### Q141 — No card Antinuke da tela Segurança, o campo "IDs confiáveis" usa seletor de cargo/pessoa ou pede IDs digitados?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Security.jsx:481-488` (`<textarea ... placeholder="ID">`); `client/src/dashboard/i18n.js:1699` ("IDs confiáveis na lista branca (separados por vírgula)"); `src/services/guildSafety.js:62-70` e `:106` (`normalizeIdList` descarta em silêncio o que não bate com `ID_RE`).
- **Achado:** O dono precisa colar números de ID à mão, sem ver nomes. Depois de salvo, não dá para saber quem está na lista. Um ID com formato errado é jogado fora sem aviso; um ID de outra pessoa protege a pessoa errada.
- **Recomendação:** Trocar o campo por um seletor de cargos (o mesmo MultiSelect usado nas isenções, logo acima) e uma busca de membro por nome. Mostrar nome e avatar na lista salva. Avisar quando um ID for descartado.
- **Revisão:** Confirmado. O backend só filtra o formato, não avisa nem confere se o ID existe.

### Q142 — Na tela Sazonal (card Restrições), os campos "ID da pessoa" e "ID para zerar o saldo" validam se o ID é real?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Seasonal.jsx:228` e `:254` (só `replace(/\D/g, '')`); `src/modules/seasonal/seasonalManager.js:1356-1360` (aceita qualquer `userId` e responde "Saldo sazonal de ${userId} zerado com sucesso."); `client/src/dashboard/Seasonal.jsx:205` (lista mostra só o número).
- **Achado:** Dá para digitar "123" e ver "zerado com sucesso". A pessoa certa continua com saldo e a tela diz que deu certo. A lista de excluídos mostra só números, sem nome.
- **Recomendação:** Exigir 17 a 20 dígitos na tela (como `client/src/dashboard/OwnerTools.jsx:95` já faz) e no backend. Mostrar nome e avatar do membro antes de confirmar. Recusar com mensagem clara se o ID não existir.
- **Revisão:** Confirmado. Ponto a favor: zerar já pede `window.confirm` (`Seasonal.jsx:251`). A falha é aceitar ID inexistente e dizer "sucesso".

### Q143 — O botão "Cancelar assinatura" da tela Planos pede confirmação e preserva os dias já pagos?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** crítica
- **Evidência:** `client/src/dashboard/Plans.jsx:108-118` e `:135-140` (`onClick={cancel}`, sem confirmação, botão aparece com qualquer plano ativo, inclusive vitalício); `src/routes/dashboardRoutes.js:1074-1081` (sem checar vitalício); `src/services/guildPlans.js:99-100` (`revokePlan` grava `paidUntil: 0, lifetime: false`).
- **Achado:** Um clique cancela na hora e zera o tempo pago. Quem pagou o ano via Pix perde os meses restantes. Em plano vitalício ou de fundador, o clique apaga o vitalício. Não há tela para devolver o plano: `grantPlan` só é chamado por pagamento e pelo programa Fundador.
- **Recomendação:** Pedir confirmação explicando o efeito. Cancelar só a renovação do cartão e manter o plano até `paidUntil`. Esconder o botão em plano vitalício e fazer o backend recusar esse cancelamento.
- **Revisão:** Confirmado. A rota de checkout já recusa vitalício (`dashboardRoutes.js:1062-1065`), mas a de cancelamento não. Severidade mantida: perda de dinheiro do cliente sem caminho de volta.

### Q144 — Ao escolher "Cartão recorrente" num plano, a pessoa sempre vê o caminho para pagar, mesmo com bloqueador de pop-up?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `client/src/dashboard/Plans.jsx:76-79` (`if (method === 'card' && data.initPoint) window.open(...) else setCheckout(data)`); o cartão com o link fica em `Plans.jsx:306-320` e só aparece via `setCheckout`.
- **Achado:** O pop-up abre depois de esperar a API, fora do clique, e navegadores costumam bloquear. Como o checkout não é guardado no caso do cartão, a tela não mostra nada. Parece que o botão não funciona e a venda se perde.
- **Recomendação:** Chamar `setCheckout(data)` também no cartão, para o botão "Ir para o pagamento" aparecer sempre. O pop-up pode continuar como atalho.
- **Revisão:** Confirmado. Os extras não têm esse problema (`Plans.jsx:97` sempre guarda o checkout).

### Q145 — Na tela Planos, a pessoa vê qual plano já tem e recebe retorno ao clicar em pagar?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Plans.jsx:165-194` (cartões Básico/Premium sem marca de "plano atual"); estado `picked` (`Plans.jsx:20`, `:72`) nunca é lido; "Gerando…" só nos extras (`Plans.jsx:238`); captura `/tmp/aud-painel-gestao/planos-360.png` (Básico ativo e cartão Básico com o mesmo "Pay with Pix").
- **Achado:** Quem já tem o Básico vê o mesmo botão de compra no cartão Básico, sem "seu plano". Ao clicar em Pix, o botão só fica cinza, sem texto de "gerando". O topo da tela mostra o plano atual, então a informação existe, só não está no cartão.
- **Recomendação:** Marcar o cartão do plano atual ("Seu plano, ativo até X") e trocar o texto do botão por "Renovar". Mostrar "Gerando Pix…" no botão clicado, como já é feito nos extras.
- **Revisão:** Rebaixado de média para baixa. Pagar de novo não perde dinheiro: `src/services/guildPlans.js:94` soma os dias a partir de `paidUntil`, então vira renovação.

### Q146 — No card Advertências e Casos (Segurança), erros ao salvar, editar motivo ou revogar caso aparecem para o usuário?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `client/src/dashboard/Security.jsx:212` (só mostra aviso quando `status === 'ok'`; o erro é guardado em `:159` e nunca aparece); `Security.jsx:166` e `:173` (`catch (_) {}` em `saveReason` e `revokeCase`); `Security.jsx:237-239` (Revogar sem confirmação).
- **Achado:** Se salvar falhar (bot fora, sessão vencida), nada aparece. Ao revogar um caso que falhou, o botão continua lá e a pessoa acha que revogou. Num módulo de punição, isso deixa advertências ativas sem ninguém saber.
- **Recomendação:** Mostrar aviso de erro nos três casos (o card de Emergência, `Security.jsx:133`, já faz isso). Pedir confirmação antes de revogar.
- **Revisão:** Confirmado. O padrão certo já existe na mesma tela, só não foi usado aqui.

### Q147 — O botão "Ativar Emergência" (Segurança) pede confirmação antes de trancar o servidor?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Security.jsx:103-115` (`toggle()` chama `api.toggleEmergency` direto); `Security.jsx:132-134` (`<Button onClick={toggle}>`, cor padrão); `client/src/dashboard/i18n.js:1686` ("Tranca o envio de mensagens nos canais públicos e pausa convites…").
- **Achado:** Um toque, até sem querer no celular, tranca todos os canais públicos e pausa convites. O motivo é opcional. O estado anterior é salvo, então dá para desfazer, mas a comunidade fica muda até alguém perceber.
- **Recomendação:** Pedir confirmação ("Trancar os canais públicos agora?"). Sugerir preencher o motivo. Usar cor de perigo no botão de ativar.
- **Revisão:** Confirmado como PARCIAL: a ação é reversível e mostra erro (`Security.jsx:133`), mas falta a confirmação.

### Q148 — O card Advertências cumpre o que promete ("ações automáticas por limite") e o jeito de salvar a tela Segurança é coerente?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `client/src/dashboard/i18n.js:1709` (promete "ações automáticas por limite"); `src/services/modCasesService.js:15-19` (limites padrão: 3 pontos = castigo de 1h, 5 = expulsão, 7 = banimento); `src/commands/advertencia.js:181-182` (aplica a ação); `client/src/dashboard/Security.jsx:177-210` (tela sem limites e sem "avisar por DM", embora o backend aceite em `modCasesService.js:88-91`); dois botões de salvar: `Security.jsx:208` e `:614-618`.
- **Achado:** Os limites automáticos existem e funcionam, mas são invisíveis. A staff pode banir alguém sem saber, só por dar a 7ª advertência. Não dá para ver nem mudar os limites. A tela tem dois "Salvar": o do rodapé não salva as advertências e o das advertências não salva o resto.
- **Recomendação:** Mostrar e permitir editar a lista de limites (pontos e ação), com o banimento destacado. Adicionar o interruptor "avisar por DM". Juntar os salvamentos ou dizer em cada botão o que ele salva.
- **Revisão:** Severidade elevada de média para alta. A promessa não é falsa (os limites padrão existem), mas esconder um banimento automático é mais grave do que o auditor descreveu.

### Q149 — A tela Segurança cabe no celular (360px) sem rolagem lateral, mesmo com nomes de canal longos?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** média
- **Evidência:** Medição Playwright com API simulada (`/tmp/aud-painel-gestao/run.js`): com canal de 43 letras, `scrollWidth` 395 > 360; captura `/tmp/aud-painel-gestao/security-360.png` tem 395px de largura. Com nomes curtos (`security-short-360.png`) fica em 360. Causa: `client/src/dashboard/Security.jsx:417-426` (grid sem `min-w-0`), e o `truncate` de `client/src/dashboard/ui.jsx:171` não consegue cortar.
- **Achado:** Em servidores com nomes de canal longos (comum, como "📢・avisos-importantes-…"), a tela anda para o lado no celular. Os blocos de isenção ficam cortados na borda.
- **Recomendação:** Pôr `min-w-0` nos blocos em volta do MultiSelect (ou no próprio componente) para o nome terminar em "…". Testar com nomes de 100 caracteres.
- **Revisão:** Confirmado pela largura da captura.

### Q150 — No layout da tela Planos em 360px, títulos e textos de preço aparecem inteiros e coerentes com o backend?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** Captura `/tmp/aud-painel-gestao/planos-360.png` ("What the Store Studio incl…" cortado); `client/src/dashboard/ui.jsx:16` (`truncate` no título do Card); `client/src/dashboard/i18n.js:565` ("Extra de R$ 3/mês" escrito à mão); `client/src/dashboard/Plans.jsx:223-224` (`Math.round(a.priceMonthly / 100)`); `src/config/planAddons.js:17` (`priceMonthly: 300`).
- **Achado:** No celular, o título do card da lojinha some no meio. O preço aparece escrito no texto e também vem da API. Hoje os dois batem (R$ 3), mas se o preço mudar a tela mostra dois valores. O arredondamento esconderia centavos (R$ 2,50 viraria R$ 3).
- **Recomendação:** Deixar o título do Card quebrar linha em vez de cortar. Montar o preço do texto com o valor da API e formatar com centavos (`toLocaleString('pt-BR')`).
- **Revisão:** Confirmado, com ressalva: a diferença de preço na captura (R$ 15 contra R$ 3) vem da API simulada; com o valor real eles coincidem. O risco é futuro.

### Q151 — O botão de editar motivo do caso (Segurança) e os controles da lista de casos são acessíveis para leitor de tela?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Security.jsx:226-235` (`<Button variant="ghost">✏️</Button>`, sem rótulo); `Security.jsx:246` (campo de edição sem `aria-label`); `client/src/dashboard/ui.jsx:55-70` (o componente `Button` nem repassa `aria-label`).
- **Achado:** O leitor de tela lê só "lápis", sem dizer de qual caso é. O campo de editar o motivo aparece sem nome.
- **Recomendação:** Fazer o `Button` aceitar `aria-label` e usar "Editar motivo do caso #12". Trocar o emoji pelo ícone Pencil. Dar rótulo ao campo de edição.
- **Revisão:** Confirmado. A causa é mais funda: o `Button` compartilhado não aceita rótulo, o que afeta outras telas também.

### Q152 — No Monitor de links (área do dono, Safety.jsx Links), um erro ao adicionar link mantém a lista e explica o problema?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Safety.jsx:199-205` (`add()` faz `setError(e.code)`); `Safety.jsx:195` (`if (error) return <Notice …>` troca a tela inteira); `Safety.jsx:211-214` (`remove()` sem confirmação e com erro engolido).
- **Achado:** Se a URL for recusada, a lista inteira some e só fica "Erro: …". O texto digitado se perde e é preciso recarregar. "Remover" apaga na hora, sem perguntar, e se falhar não avisa.
- **Recomendação:** Mostrar o erro de adicionar abaixo do formulário, sem apagar a tela. Validar "https://" antes de enviar. Confirmar antes de remover e avisar se falhar.
- **Revisão:** Confirmado. Área só do dono, por isso a severidade fica em média.

### Q153 — Os seletores múltiplos de canais/cargos (Moderação, Fogueira, Parcerias) mostram uma mensagem certa quando a lista está vazia ou não carregou?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Safety.jsx:101` e `:143`, `client/src/dashboard/Campfire.jsx:62`, `client/src/dashboard/Partnerships.jsx:81` (`emptyLabel={t('app.loading')}`); `client/src/dashboard/ui.jsx:153` (mostra `emptyLabel` quando a lista está vazia); cargas com `.catch(() => {})` em `Safety.jsx:11`, `Campfire.jsx:16-17`, `Partnerships.jsx:26-27`.
- **Achado:** Se o servidor não tem canais daquele tipo ou a API falhou, o campo fica "Carregando…" para sempre. A pessoa espera algo que nunca chega.
- **Recomendação:** Separar "carregando", "vazio" e "erro". Usar textos como "Nenhum canal encontrado" e "Não deu para carregar. Tentar de novo".
- **Revisão:** Confirmado. O jeito certo já existe em `Campfire.jsx:82` (`t('channels.empty')`) e na tela Segurança (`t('auto.none')`).

### Q154 — Os textos desta área seguem a regra bilíngue (t() com PT e EN) ou há texto fixo num idioma só?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Tickets.jsx:199` (`placeholder="Pyxie · Atendimento"`); `client/src/dashboard/Community.jsx:70` (`placeholder="Ex: Que hiperfoco incrível!"`); `client/src/dashboard/Seasonal.jsx:55` e `client/src/dashboard/OwnerTools.jsx:16` (mostram `e.data.error`/`message` cru); backend só em PT: `server.js:1685`, `src/modules/seasonal/seasonalManager.js:1314`; `client/src/dashboard/Hyperfokus.jsx` com 74 trechos `lang === 'pt' ? … : …` e 2 `t(`.
- **Achado:** Quem usa o painel em inglês vê dicas e mensagens de erro em português. O Hyperfokus é bilíngue, mas fora do dicionário central, o que espalha as traduções. Isso fere a regra 1 do AGENTS.md.
- **Recomendação:** Mover esses textos para chaves do `i18n.js` com par PT/EN. No backend, devolver códigos de erro (ex.: `invalid_user`) e a tela traduz com `t('error.<código>')`.
- **Revisão:** Confirmado. Ajuste: o Hyperfokus não é monolíngue (tem os dois idiomas por ternário); o problema real são os placeholders e erros só em PT.

### Q155 — O paywall (Paywall.jsx) diz claramente qual recurso está travado e o que se ganha ao assinar?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Paywall.jsx:33` (`feature` só aparece se for passado); nenhum chamador passa `feature` (`client/src/dashboard/Dashboard.jsx:301`, `:624`, `Mary.jsx:69`, `Plans.jsx:53`, `Studio.jsx:981`); `client/src/dashboard/i18n.js:533` (texto genérico); `Dashboard.jsx:609-611` (o cabeçalho da página mostra o nome da seção acima do paywall).
- **Achado:** O cadeado mostra o plano exigido e leva à compra. O nome da seção aparece no topo, mas o paywall não diz o que o recurso faz, nem o preço, nem as vantagens. A pessoa precisa adivinhar se vale assinar.
- **Recomendação:** Passar `feature` com uma frase sobre o recurso e listar 2 ou 3 vantagens do plano, com o preço ("a partir de R$ 7/mês").
- **Revisão:** Confirmado em parte. Refutado o "não diz o nome do recurso" quando o paywall está numa seção: o `PageHeader` mostra o nome. Continua faltando o benefício e o preço.

### Q156 — O campo "Canal de log" de Advertências (Segurança) realmente faz o bot postar nesse canal, e o backend confere se o canal é do servidor?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Security.jsx:189-203` (seletor de canal); `src/routes/dashboardRoutes.js:1454-1458` (salva sem `checkGuildIds`, ao contrário de `:1392-1396`); `src/services/modCasesService.js:72` e `:86-87` são os únicos usos de `logChannelId` do aviso; `src/commands/advertencia.js:172-198` lê a config só para `dmOnWarn` e responde no próprio canal.
- **Achado:** A tela deixa escolher um canal de registro de casos, mas nenhum código posta nele. A staff espera um registro que nunca aparece. O backend também aceita qualquer ID sem conferir se o canal é do servidor.
- **Recomendação:** Fazer o `/advertencia` postar o caso no canal escolhido, ou tirar o campo da tela. No salvamento, validar o canal com `checkGuildIds`, como na configuração de segurança.
- **Revisão:** Confirmado. Rebaixado de alta para média: é um recurso que não funciona, mas não causa punição errada nem expõe dados (o ID não validado não é usado para nada).

### Q157 — No Programa Fundador (Founder.jsx), revogar a vaga de um servidor parceiro pede confirmação?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Founder.jsx:69` (`revoke` chama `api.founderRevoke` direto); `Founder.jsx:149-157` (lixeira 32px ao lado dos botões do checklist, sem confirmação); `Founder.jsx:129` (linha mostra só o ID); `src/routes/dashboardRoutes.js:1866` (rota só do dono, `requireOwner`).
- **Achado:** Um toque na lixeira tira o plano grátis de um parceiro na hora. A lixeira fica colada nos botões do checklist, então é fácil errar no celular. A linha não mostra o nome do servidor.
- **Recomendação:** Pedir confirmação com o nome do servidor ("Revogar a vaga de X? O plano grátis acaba agora"). Mostrar o nome do servidor na linha e afastar a lixeira.
- **Revisão:** Confirmado. Rebaixado de alta para média: só o dono do bot vê e usa esta tela, então o risco fica com uma pessoa.

### Q158 — Os ícones da área de moderação seguem um padrão (lucide) ou misturam emojis e ícones?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Security.jsx:234` (emoji "✏️" no editar); cards sem ícone: `Security.jsx:369` (Canal da staff) e `:620` (Eventos), ao lado de cards com ícone lucide.
- **Achado:** A mistura de emoji com ícones desenhados deixa a tela irregular, e o emoji muda de visual em cada sistema. Cards sem ícone quebram o ritmo da página.
- **Recomendação:** Usar Pencil do lucide no editar e dar ícone aos cards que faltam (ScrollText para Canal da staff, History para Eventos).
- **Revisão:** Confirmado em parte. Refutado o trecho de Tickets: `TYPE_EMOJI` (`Tickets.jsx:10`) só é usado na prévia que imita o Discord (`Tickets.jsx:136`, `:144`), onde emoji é o certo.

### Q159 — A lista de Casos de Moderação mostra quem foi punido e qual ação, de forma legível?

- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `client/src/dashboard/Security.jsx:222` (`<Badge>{c.action}</Badge> · <code>{c.targetId}</code>`); o caso guarda `moderatorId` (`src/services/modCasesService.js` no registro do caso) mas a tela não mostra; a API aceita filtro `?userId` (`src/routes/dashboardRoutes.js:1447`) que a tela não usa.
- **Achado:** O caso aparece como "#12 · warn · 400000000000000001". Não diz o nome da pessoa, quem aplicou nem a data. A ação aparece em código inglês ("warn") mesmo em PT. Para revisar, a staff precisa copiar o ID e procurar no Discord.
- **Recomendação:** Mostrar nome e avatar do alvo e do moderador, e a data. Traduzir a ação com `t('sec.caseAction.<ação>')`. Adicionar filtro por pessoa.
- **Revisão:** Confirmado.

### Q160 — Nos campos de imagem por URL (edição de Parceria e capa do Hyperfokus), a tela mostra prévia e lida com imagem quebrada?

- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `client/src/dashboard/Partnerships.jsx:110-112` (`imageUrl` é texto, sem prévia); `Partnerships.jsx:125` (`<img src={p.imageUrl}>` sem `onError`); `client/src/dashboard/Hyperfokus.jsx:787-796` ("URL da Imagem de Capa" sem prévia nem validação).
- **Achado:** Quem edita cola um link e só descobre que a imagem não abre depois de salvar. Na lista de parceiros, um link quebrado mostra o ícone de imagem quebrada do navegador.
- **Recomendação:** Mostrar uma miniatura ao lado do campo, com aviso "imagem não carregou". Na lista, trocar imagem quebrada por um quadrado com a inicial do projeto. Validar "https://" antes de salvar.
- **Revisão:** Confirmado. A imagem da lista tem `alt`, o que é bom.
