# 13. Pagamentos (Mercado Pago, PayPal, passe, planos, top.gg)

> Nota da área: 4/10 · O valor cobrado é sempre conferido no servidor e o voto do Top.gg está bem protegido. Mas há falhas que custam dinheiro ou confiança: a assinatura no cartão libera o plano em dobro, qualquer admin pode cancelar o plano, e as doações por Pix não chegam ao ranking. A tela de Planos não confirma o pagamento e cancela tudo em um clique, sem pedir confirmação.

Observação: não há integração com PayPal no código revisado. Os pagamentos passam só pelo Mercado Pago (Pix e cartão).

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q241 | Assinatura no cartão libera só um ciclo? | 🔴 PROBLEMA | alta |
| Q242 | Quem pode cancelar a assinatura no painel? | 🔴 PROBLEMA | alta |
| Q243 | Doação Pix do /py-home chega ao ranking? | 🔴 PROBLEMA | alta |
| Q244 | Ranking de doadores mostra o nome e protege a identidade? | 🔴 PROBLEMA | media |
| Q245 | Estorno/chargeback retira o benefício? | 🔴 PROBLEMA | media |
| Q246 | Falha ao gravar faz o Mercado Pago reenviar o aviso? | 🔴 PROBLEMA | media |
| Q247 | Webhooks exigem a assinatura x-signature? | 🟡 PARCIAL | baixa |
| Q248 | Aviso duplicado credita duas vezes? Valor é conferido? | 🟡 PARCIAL | baixa |
| Q249 | Prazo do Pix na tela bate com o real? Painel mostra o Pix pendente? | 🔴 PROBLEMA | media |
| Q250 | Caixa do Pix ajuda a pagar e confirma o pagamento? | 🟡 PARCIAL | media |
| Q251 | "Pagar no cartão" sempre leva ao Mercado Pago? | 🔴 PROBLEMA | alta |
| Q252 | "Cancelar assinatura" explica e pede confirmação? | 🔴 PROBLEMA | alta |
| Q253 | Comprar Básico com Premium ativo preserva o pago? | 🔴 PROBLEMA | media |
| Q254 | Depois de assinar no cartão, a página confirma? | 🔴 PROBLEMA | media |
| Q255 | Lembretes de vencimento respeitam quem paga no cartão? | 🔴 PROBLEMA | media |
| Q256 | Voto do Top.gg protegido contra fraude e repetição? | ✅ OK | info |
| Q257 | Erros de pagamento são claros? | 🔴 PROBLEMA | media |
| Q258 | Tela Planos e /passe funcionam no celular? | ✅ OK | info |
| Q259 | Imagens e controles têm texto alternativo certo? | 🟡 PARCIAL | baixa |
| Q260 | Botões de pagamento dão retorno visual? | 🟡 PARCIAL | baixa |

---

### Q241 — Na assinatura do plano no cartão (Mercado Pago Preapproval), um pagamento libera só um ciclo de plano?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/services/planPayments.js:293-319` (evento `preapproval` autorizado chama `plans.grantPlan`, chave `pre:${dataId}:${month}` tirada de `next_payment_date`); `src/services/planPayments.js:322-350` (evento `subscription_authorized_payment` chama `grantPlan` de novo, chave `mp:${dataId}`); `src/services/guildPlans.js:94-95` (cada `grantPlan` soma 30 dias ao `paidUntil`).
**Achado:** O mesmo pagamento no cartão libera o plano mais de uma vez. A assinatura autorizada já soma 1 mês (ou 12 no anual). A primeira cobrança aprovada soma outro. Quando a data da próxima cobrança muda de mês, a chave muda e o aviso da assinatura soma de novo. Quem assina no cartão ganha cerca de 2 meses pagando 1. Nesse fluxo o valor da cobrança também não é conferido (no Pix é, em `planPayments.js:249-251`).
**Recomendação:** Libere tempo de plano só quando chegar uma cobrança aprovada (`subscription_authorized_payment`). O aviso de assinatura autorizada deve só guardar o status. Confira valor e moeda da cobrança, como já é feito no Pix.
**Revisão:** Confirmado no código. Rebaixado de crítica para alta: é perda de receita (o cliente ganha tempo extra), não exposição de dados nem cobrança indevida. O valor da assinatura é definido pelo servidor ao criar a assinatura, então a falta de conferência de valor tem risco baixo.

### Q242 — Quem pode usar "Cancelar assinatura" na tela Planos do painel, e de qual assinatura?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/routes/dashboardRoutes.js:1075-1082` (rota `/plan/cancel` só usa `requireSession, requireGuild`, sem `canManageAccess`; usa `req.body?.preapprovalId`); `src/services/panelAccess.js:116-122` (admin comum entra, `canManageAccess: Boolean(member.isGuildOwner)`); comparação: `src/routes/dashboardRoutes.js:372-374` (extras exigem o dono, `guild_owner_only`).
**Achado:** Qualquer admin com acesso ao painel, e não só o dono, pode cancelar o plano pago do servidor. O cancelamento também apaga planos vitalícios de cortesia (`revokePlan` zera tudo). A rota aceita um id de assinatura enviado pelo navegador e cancela esse id com a chave da Pyxie. Quem souber o id da assinatura de outro servidor consegue cancelá-la.
**Recomendação:** Libere o cancelamento só para o dono (`canManageAccess`), como nos extras. Ignore o `preapprovalId` vindo do navegador e use só a assinatura guardada para aquele servidor.
**Revisão:** Confirmado. Não há middleware nem checagem extra na rota. Mantida alta: o ataque entre servidores exige conhecer um id que não é público, mas o cancelamento por qualquer admin é direto.

### Q243 — A doação por Pix feita na loja da casinha (botão Doar no /py-home) chega ao registro e ao ranking?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/services/donations.js:80` (`notification_url: .../api/plans/webhook/mercadopago`); `server.js:780-791` (essa rota só chama `planPayments.handleWebhook` e responde 200); `src/services/planPayments.js:245-246` (referência `donation|...` não é reconhecida → `reason: 'reference'`); `server.js:754-757` (`donations.handleWebhook` só roda na rota do Passe). `reconcilePending` (`planPayments.js:357`) só olha cobranças de plano.
**Achado:** O aviso de pagamento da doação vai para a rota dos planos. Ela não reconhece doação, responde "recebido" e descarta. A pessoa paga, mas a doação não entra no ranking nem no total. Só seria salva se o Mercado Pago também mandasse avisos da conta inteira para a rota do Passe, e isso não aparece no código.
**Recomendação:** Aponte o aviso da doação para `/api/pass/webhook/mercadopago`, ou faça a rota dos planos chamar `donations.handleWebhook` primeiro. Crie uma conferência periódica das doações pendentes, como já existe nos planos.
**Revisão:** Confirmado. Procurei outro caminho que grave doações (cron, reconciliação, outra rota) e não encontrei.

### Q244 — O ranking público de doadores (/api/public/donations e botão Ranking do /py-home) mostra o nome certo e protege a identidade?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/services/donations.js:175` (`return applyDonation(payment)` sem `name`); `donations.js:117` (nome fica vazio); `donations.js:144` (`label: ... entry.name || entry.userId`); `server.js:610-619` (rota pública devolve a lista com `userId`); `src/modules/home/commands/pyHome.js:135-136` (`createPixDonation` sem `anonymous`).
**Achado:** O nome da pessoa se perde quando o pagamento é confirmado. O ranking mostra o ID numérico do Discord no lugar do nome. Esse ID também sai na API pública, aberta a qualquer um. A tela não oferece doar como anônimo, embora o código e os textos falem em anonimato.
**Recomendação:** Guarde o nome no momento em que o Pix é criado e use esse nome na confirmação. Tire o `userId` da resposta pública. Ofereça "doar como anônimo" no menu de valor.
**Revisão:** Confirmado. Hoje o efeito fica escondido pelo Q243 (as doações nem chegam), mas aparece assim que o Q243 for corrigido.

### Q245 — O que acontece com o Passe, o plano ou o extra quando o pagamento é estornado, devolvido ou contestado (chargeback)?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/services/passPayments.js:146` e `src/services/planPayments.js:288` (todo status diferente de `approved` vira `pending: true`); busca por `refund|charged_back|estorn|reembols` em `src` e `server.js` não acha tratamento de pagamento; `src/services/guildPlans.js:16` (status `refunded` existe e nunca é gravado); `public/passe.html:140` ("Arrependimento em até 7 dias...").
**Achado:** Estorno e contestação não retiram nada. Quem pede o dinheiro de volta continua com o Premium do Passe ou com o plano. A página do Passe promete arrependimento em 7 dias, mas não há esse fluxo no sistema. Também não há botão no painel para retirar o Premium do Passe na mão.
**Recomendação:** Quando chegar `refunded` ou `charged_back`, retire o benefício e grave o status `refunded`. Crie no painel do dono uma ação de reembolso que já retira o benefício.
**Revisão:** Confirmado. Rebaixado de alta para media: os valores são pequenos (R$ 7 a R$ 20), estornos são raros e o dono pode reembolsar pelo painel do Mercado Pago. O problema é perder o benefício pago e a promessa sem fluxo.

### Q246 — Se gravar o benefício falhar depois de um pagamento aprovado, o Mercado Pago reenvia o aviso para tentar de novo?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/services/battlePass.js:388` (`if (!save(state)) return { ok: false, reason: 'save' }`); `server.js:768-771` (só `signature` e `provider` geram erro; o resto recebe 200); `src/services/planPayments.js:253-254` (`markProcessed` antes do `grantPlan` em `:267`).
**Achado:** No Passe, se a gravação falhar, o servidor responde "recebido" e o Mercado Pago não reenvia. A pessoa paga e fica sem o Premium. Nos planos, o pagamento é marcado como processado antes de liberar. Se a liberação falhar, o reenvio e a conferência automática acham que já foi feito, e o plano nunca é liberado.
**Recomendação:** Responda erro 500 quando o benefício não for gravado. Marque o pagamento como processado só depois que a liberação der certo.
**Revisão:** Confirmado. Rebaixado de alta para media: só acontece se a gravação no disco falhar, o que é raro. Nos planos, um erro de disco gera 500 (o `try/catch` em `server.js:792-794`), mas o reenvio cai como duplicado.

### Q247 — Os avisos (webhooks) do Mercado Pago do Passe, dos planos e das doações exigem a assinatura x-signature?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/services/passPayments.js:120-122` e `src/services/planPayments.js:220-222` (`if (!secret) return true` quando falta `MERCADOPAGO_WEBHOOK_SECRET`); status e valor sempre lidos na API (`passPayments.js:143`, `planPayments.js:285`).
**Achado:** A assinatura é bem conferida (HMAC e comparação segura), mas só quando a variável `MERCADOPAGO_WEBHOOK_SECRET` existe. Sem ela, o servidor aceita qualquer aviso. Mesmo assim, ninguém consegue inventar um pagamento: o status e o valor vêm da API do Mercado Pago. Um estranho só consegue forçar consultas.
**Recomendação:** Em produção, recuse os avisos quando a variável faltar. Mostre um alerta no painel do dono quando ela não estiver configurada.
**Revisão:** Confirmado o comportamento. Rebaixado de media para baixa: sem a variável não dá para criar pagamento falso, só gerar consultas extras.

### Q248 — O mesmo aviso de pagamento entregue duas vezes pode creditar duas vezes, e o valor é conferido no servidor?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/services/battlePass.js:383` (Passe idempotente por `paymentId`, sem corte); `src/services/passPayments.js:149` (confere BRL e preço); `src/services/planPayments.js:249-251` e `src/services/donations.js:107` (conferem valor); `planPayments.js:17,103` (`processed.slice(-500)`); `donations.js:15,51` (`processed.slice(-2000)`).
**Achado:** O valor sempre vem do servidor e da API, nunca do navegador. O Passe nunca credita duas vezes. Nos planos e nas doações, a lista de pagamentos já processados é cortada (500 e 2000). Um aviso antigo reenviado depois do corte credita de novo.
**Recomendação:** Não corte a lista de pagamentos processados, ou guarde esses ids no banco com chave única.
**Revisão:** Confirmado. Severidade baixa mantida: com o volume atual, o corte demora para ser atingido.

### Q249 — O horário "Código válido até" do Pix (plano, extra e doação) bate com o prazo real no Mercado Pago, e o painel mostra a cobrança pendente?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/services/planPayments.js:136` e `src/services/donations.js:81` (`new Date(now + PIX_TTL_MS).toISOString().replace('Z', '-03:00')`); `planPayments.js:153` (a tela recebe `now + PIX_TTL_MS`); `src/services/planPayments.js:382` (`guildPlanInfo` devolve `pending`); `client/src/dashboard/Plans.jsx` não usa `pending` (busca vazia).
**Achado:** O horário em UTC é enviado como se fosse horário de Brasília. Com isso, o Pix fica pagável por cerca de 3h30, mas a tela diz 30 minutos. Se a pessoa recarrega a página, o QR some, porque o painel ignora a cobrança pendente. Ela gera outro QR e pode pagar duas vezes.
**Recomendação:** Envie a data de expiração com o fuso certo (sem trocar o "Z"). No painel, mostre a cobrança pendente que a API já devolve, com o QR e o prazo, antes de deixar gerar outra.
**Revisão:** Confirmado. Observação: se a pessoa pagar dois QRs, recebe o tempo dos dois (o `grantPlan` soma). Ela não perde o dinheiro, mas paga adiantado sem querer.

### Q250 — A caixa do Pix na tela Planos ajuda a pessoa a pagar e a saber que o pagamento caiu?
**Veredito:** 🟡 PARCIAL
**Severidade:** media
**Evidência:** `client/src/dashboard/Plans.jsx:288-303` (imagem do QR e código em `<code>`, sem botão de copiar); nenhum `setInterval` ou nova consulta depois do QR no arquivo; `client/src/dashboard/i18n.js:547` ("O plano ativa sozinho quando o pagamento cai").
**Achado:** No celular, quem paga pelo app do banco no mesmo aparelho precisa selecionar à mão um código longo. Depois de pagar, a tela não muda. A pessoa não sabe se deu certo e só vê o plano ativo se recarregar a página.
**Recomendação:** Adicione o botão "Copiar código Pix" com aviso de copiado. Consulte o plano a cada 5 a 10 segundos enquanto o QR estiver aberto e mostre "Pagamento confirmado" quando ativar.
**Revisão:** Confirmado (a quebra do código usa `break-all` em `:301`, não em `:298` como citado).

### Q251 — Ao clicar em "Pagar no cartão" de um plano na tela Planos, a pessoa sempre chega ao Mercado Pago?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/dashboard/Plans.jsx:76-79` (`window.open(data.initPoint, ...)` só depois do `await`; `setCheckout` fica no `else` e não roda no cartão); o bloco com link `:306-320` nunca aparece para plano; nos extras aparece (`:97-100`).
**Achado:** A nova aba só abre depois de esperar a resposta do servidor. Safari e navegadores de celular costumam bloquear janelas abertas assim. Se ela for bloqueada, nada aparece na tela e o botão parece não funcionar.
**Recomendação:** Chame `setCheckout(data)` também no cartão, para mostrar o botão "Ir para o Mercado Pago". Se quiser, mantenha a tentativa de abrir a aba sozinha.
**Revisão:** Confirmado. Com `'noopener'`, o `window.open` sempre devolve `null`, então o código nem conseguiria detectar o bloqueio.

### Q252 — O botão "Cancelar assinatura" explica o que acontece e pede confirmação?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `client/src/dashboard/Plans.jsx:108-118` e `:135-140` (cancela em um clique, sem `confirm`); `src/services/guildPlans.js:99-100` (`revokePlan` zera `paidUntil` e `lifetime`); `Plans.jsx:135` (o botão aparece para qualquer plano ativo, inclusive vitalício); `src/routes/dashboardRoutes.js:1062-1065` (o checkout bloqueia vitalício, mas o cancelamento não).
**Achado:** Um clique tira o plano na hora e apaga os dias já pagos, inclusive no Pix e em planos vitalícios de cortesia. Os textos da tela passam a ideia de que cancelar só para a renovação.
**Recomendação:** Peça confirmação com texto claro. Cancelar deve parar a renovação e manter o plano até a data paga. Esconda o botão em planos vitalícios.
**Revisão:** Confirmado. Não há confirmação no componente `Button` nem na rota.

### Q253 — Comprar o Básico na tela Planos enquanto o Premium está ativo preserva o que já foi pago?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/services/guildPlans.js:94-96` (`grantPlan` soma o tempo ao `paidUntil` atual e troca `plan` pelo novo); `client/src/dashboard/Plans.jsx:165-195` (mostra os dois cards sem marcar o plano ativo); a rota de checkout (`dashboardRoutes.js:1055-1072`) não bloqueia a troca para um plano menor.
**Achado:** Se o dono pagar o Básico com o Premium ativo, o servidor cai para o Básico na hora. Os dias de Premium que faltavam viram dias de Básico. A tela não avisa e não marca qual plano está ativo.
**Recomendação:** Marque o card do plano atual. Ao trocar para um plano menor, avise e aplique a troca só no fim do período pago, ou bloqueie e explique.
**Revisão:** Confirmado.

### Q254 — Depois de assinar o plano no cartão, a pessoa volta para uma página que confirma a assinatura?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/services/planPayments.js:176` (`back_url: .../passe?status=plan`); `public/passe.html:253` (só conhece `ok`, `pending`, `fail`, `cancel`); `public/passe.html:266-268` (sem token mostra o aviso para abrir o /py-pass).
**Achado:** Quem assina um plano de servidor volta para a página do Passe de batalha, que não tem relação com o plano. Não aparece mensagem de sucesso, só o convite para comprar o Passe. No próprio Passe, voltar com `status=ok` e sem token também mostra "pagamento recebido" junto com o aviso de compra.
**Recomendação:** Faça o retorno do plano ir para o painel, na aba Planos, com uma mensagem própria. No Passe, esconda o aviso de compra quando houver status na URL.
**Revisão:** Confirmado.

### Q255 — Os lembretes por DM de vencimento do plano (D-7, D-3, D-0) levam em conta quem paga no cartão automático?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/modules/plans/index.js:107-115` (lembrete para todo plano ativo com `paidUntil`, sem olhar `source: 'mercadopago-card'`); `src/utils/i18n.js:779` ("Renove no painel para não pausar as vantagens").
**Achado:** Quem tem renovação automática no cartão recebe "renove no painel". A pessoa pode pagar de novo por Pix sem precisar, ou achar que o cartão falhou.
**Recomendação:** Para assinaturas no cartão, mande outro texto: "a cobrança automática acontece em DD/MM". Mande o pedido de renovação só para quem paga por Pix ou quando a cobrança no cartão falhar.
**Revisão:** Confirmado.

### Q256 — A recompensa de voto do Top.gg (/py-votar) tem proteção contra votos falsos e pagamento repetido?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/services/topgg.js:32-38` (sem segredo, recusa tudo); `:44-58` (HMAC com janela de 15 min e comparação segura); `:127-131` (teste não paga); `:135-147` (repetição em 11h não paga); `:14-15` (1 ou 2 feijões, nunca moedas); `server.js:329-333` (guarda o corpo bruto).
**Achado:** O voto só paga com assinatura válida, e um aviso antigo não pode ser reaproveitado. O Top.gg reentregar o mesmo voto não paga duas vezes. O botão de teste não dá nada. A recompensa é pequena e segue a regra de economia.
**Recomendação:** Nada urgente. Opcional: não atualizar `lastVotedAt` em entrega repetida, para não mexer no tempo de espera do /py-votar.
**Revisão:** Confirmado por amostragem. O formato antigo (cabeçalho Authorization) não tem janela de tempo, mas a trava de 11h impede pagar duas vezes.

### Q257 — As mensagens de erro no pagamento (doação no /py-home e checkout na tela Planos) dizem o que houve em linguagem clara?
**Veredito:** 🔴 PROBLEMA
**Severidade:** media
**Evidência:** `src/modules/home/commands/pyHome.js:137-143` (usa `home.donate.errors.<reason>` e esconde o texto se a chave faltar); `src/utils/i18n.js:2463-2467` (só `unavailable`, `invalid_amount`, `provider`; faltam `qr_missing` e `invalid_user`); `client/src/dashboard/Plans.jsx:125` + `client/src/dashboard/i18n.js:15` (`'Algo deu errado: {error}'` com o código cru).
**Achado:** Na doação, alguns erros não mostram mensagem e a tela só volta ao menu. No painel, a pessoa vê códigos técnicos em inglês, como "Algo deu errado: provider" ou "plan_lifetime", sem saber o que fazer.
**Recomendação:** Crie textos em PT e EN para cada código (`provider`, `qr_missing`, `invalid_user`, `plan_lifetime`, `addon_lifetime`, `guild_owner_only`), cada um com o próximo passo. Use uma mensagem padrão amigável para códigos desconhecidos.
**Revisão:** Confirmado. O i18n do painel não tem chaves `error.provider` nem `error.plan_lifetime`.

### Q258 — A tela Planos e a página /passe funcionam bem em celular?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `client/src/dashboard/Plans.jsx:165` (`grid gap-3 sm:grid-cols-2`); `:127`, `:143`, `:183`, `:203` (`flex-wrap`); `:301` (código Pix com `break-all`); `:296` (QR de 220px); `public/passe.html:94` (`@media (max-width: 768px)`).
**Achado:** Os cards ficam em uma coluna no celular e em duas em telas médias. Os botões quebram de linha, o código Pix não estoura a largura e o QR cabe em telas de 320px.
**Recomendação:** Nada urgente. Teste na largura de 320px quando o botão "Copiar código" for criado.
**Revisão:** Confirmado por amostragem, com base nas classes do código. Não foi testado em aparelho real.

### Q259 — As imagens e controles de pagamento têm texto alternativo e rótulos corretos para leitor de tela?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/dashboard/Plans.jsx:295` (alt do QR traduzido, `client/src/dashboard/i18n.js:549`); `public/passe.html:105` (alt fixo em PT, sem `data-i18n`, então a troca de idioma em `:251` não o alcança); `Plans.jsx:143` (`aria-label={t('plan.cycle.month')}` = "Mensal").
**Achado:** O QR tem descrição nos dois idiomas. Na página do Passe em inglês, a imagem continua descrita em português. O seletor Mensal/Anual é anunciado como "Mensal", e não como "Ciclo de cobrança".
**Recomendação:** Traduza o alt da imagem do Passe junto com o resto da página. Crie a chave `plan.cycle.label` ("Ciclo de cobrança" / "Billing cycle") para o rótulo do grupo.
**Revisão:** Confirmado.

### Q260 — Os botões e ícones de pagamento dos planos dão retorno visual ao clicar?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `client/src/dashboard/Plans.jsx:184-191` (ícones `QrCode` e `CreditCard` com `aria-hidden`); `:20` (estado `picked` criado e nunca lido); `:238` (`plan.generating` só nos extras).
**Achado:** Os ícones são coerentes: QR para Pix e cartão para cartão. Mas nos planos o botão só fica desativado ao clicar, sem "Gerando…" e sem marcar a opção escolhida. Nos extras esse retorno existe. Parece um clique perdido.
**Recomendação:** Use o estado `busy`/`picked` nos botões dos planos para mostrar "Gerando…" e destacar a opção clicada, como nos extras.
**Revisão:** Confirmado. O próprio comentário em `:19` diz que `picked` deveria dar esse retorno.
