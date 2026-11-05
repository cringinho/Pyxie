# 15. Lógica geral, economia e erros

> Nota da área: 6/10 · A base da economia é boa: diário, mercado, duelo de quiz e comandos do dono estão bem protegidos. Mas há brechas reais para criar moedas do nada (Date Night e Jokenpô com aposta), ganhos que escapam do teto diário e arquivos de dados (mercado, Catacumbas, casamentos) sem proteção contra corrupção.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q281 | Date Night: várias sessões antes do cooldown | 🔴 PROBLEMA | alta |
| Q282 | Date Night: clique simultâneo paga duas vezes | 🔴 PROBLEMA | média |
| Q283 | Jokenpô: aposta do perdedor é garantida? | 🔴 PROBLEMA | alta |
| Q284 | Teto diário vale para todo ganho? | 🔴 PROBLEMA | média |
| Q285 | Diário paga duas vezes com clique duplo? | ✅ OK | info |
| Q286 | Mercado: compra simultânea duplica algo? | ✅ OK | info |
| Q287 | Comandos de saldo só para o dono? | ✅ OK | info |
| Q288 | Mercado/Catacumbas/casamentos protegidos contra corrupção? | 🔴 PROBLEMA | média |
| Q289 | Duelo de Quiz tem limite contra farm? | ✅ OK | info |
| Q290 | Dilema do trabalho expira e some o salário? | 🔴 PROBLEMA | média |
| Q291 | Dilema dá as mesmas recompensas extras? | 🟡 PARCIAL | média |
| Q292 | Expiração do /py-work explica o que houve? | 🟡 PARCIAL | média |
| Q293 | Avisos do /py-work saem privados? | 🔴 PROBLEMA | baixa |
| Q294 | Prazo do Date Night bate com o real? | 🟡 PARCIAL | baixa |
| Q295 | Minigames casuais sem moedas? | ✅ OK | info |
| Q296 | Leitura/trava do economy.json aguenta crescer? | 🟡 PARCIAL | média |
| Q297 | Sessões em memória são limpas? | ✅ OK | info |
| Q298 | Catacumbas: tetos e devolução do ingresso | 🟡 PARCIAL | baixa |
| Q299 | Tratamento de erros em comandos e processo | 🟡 PARCIAL | baixa |
| Q300 | Cofre do Amor: depósito e juros seguros? | 🟡 PARCIAL | baixa |

---

### Q281 — No Date Night do casamento (/py-casamento date), dá para abrir várias sessões antes do cooldown de 12h começar e receber 100 moedas em cada uma?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/modules/marriage/commands/pyCasamento.js:328` `canStartDateNight(user.id)` só na abertura; `:354` `const sessionId = \`date_${marriage.id}_${Date.now()}\`` cria sessão nova a cada uso, sem checar se já existe uma aberta; `src/modules/marriage/marriageManager.js:567` `marriage.lastDateAt = now` só ao resolver; `:571-572` `addCoins(spouse, 100)` sem reconferir o cooldown.
**Achado:** O cooldown de 12h só começa quando um encontro termina. Dentro de 60 segundos o casal pode abrir vários encontros, responder igual em todos e ganhar 100 moedas por pessoa em cada um. Com duas contas combinadas, vira fonte de moedas a cada 12h.
**Recomendação:** Permitir só 1 encontro aberto por casal. Marcar o cooldown já na abertura. Em `resolveDateNight`, recusar o pagamento se o último encontro tiver menos de 12h.
**Revisão:** Confirmado no código. Rebaixado de crítica para alta: o abuso fica limitado à janela de 60s a cada 12h e ao teto diário de `addCoins` (`economy.js:269` passa por `capEarnings`).

### Q282 — No botão de resposta do Date Night (date_ans), quando os dois cônjuges clicam quase juntos, o encontro pode ser pago duas vezes?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/modules/marriage/index.js:216` `session.answers[interaction.user.id] = optIdx;`; `:217` `await interaction.reply(...)` antes de checar; `:224-227` checa as duas respostas e chama `resolveDateNight`; só em `:228` apaga a sessão.
**Achado:** Entre gravar a resposta e checar se os dois responderam, o bot espera o Discord. Se os dois cliques chegam nessa janela, os dois handlers veem as duas respostas e os dois pagam: 200 moedas por pessoa e +30% de amor em vez de +15%.
**Recomendação:** Logo depois de gravar a resposta, antes de qualquer espera, checar se os dois já responderam e marcar a sessão como resolvida. Só quem marcar primeiro paga.
**Revisão:** Confirmado. Rebaixado de alta para média: depende de cliques quase simultâneos e o ganho extra é de 100 moedas por encontro, que já tem cooldown de 12h.

### Q283 — No /py-jokenpo com aposta, a aposta de quem perde é reservada e a cobrança é conferida antes de pagar quem venceu?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/commands/jokenpo.js:197-199` só confere `currentBalance < game.bet`, sem reservar; `:281-282` `spendCoins(loserId, game.bet); addCoins(winnerId, game.bet);` ignora se a cobrança falhou; `:229` `await interaction.reply(...)` antes de `:237` checar as duas jogadas e `:238` apagar o jogo; `:359` `.setMinValue(10)` sem valor máximo.
**Achado:** A aposta não fica guardada. Se quem perde gastar as moedas antes do resultado, a cobrança falha mas o vencedor recebe igual: moedas criadas do nada. Além disso, o jogo tem a mesma janela do Q282: se os dois jogam quase juntos, o resultado pode ser pago duas vezes. Não há teto de aposta.
**Recomendação:** Tirar a aposta dos dois na hora do aceite e devolver em empate ou expiração. Só pagar o vencedor se a cobrança deu certo. Checar e apagar o jogo antes de qualquer espera. Pôr um valor máximo na aposta.
**Revisão:** Confirmado. Corrigido: a parte dos "valores quebrados no prefixo" estava errada, pois `:377` usa `/^\d+$/` (só números inteiros). Acrescentada a corrida de clique duplo. Rebaixado de crítica para alta: exige duas contas combinadas e o ganho do vencedor passa pelo teto diário.

### Q284 — O teto diário de moedas (AGENTS §5, dailyCoinCap) vale para todos os ganhos do /py-work, envelopes, dilema e xícaras do /py-daily?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/services/economy.js:26` `capEarnings` só é usado em `addCoins`/diário; créditos diretos em `:814` e `:861` (`finishWork`), `:1085` `if (win) acc.coins += DAILY_CUPS_PRIZE`, `:1140` (`claimProjectBonus`), `:1177` e `:1249` (dilema); `:16` `DAILY_COIN_CAP_DEFAULT = 50000`; `src/services/database.js:146` aceita teto mínimo de 1000.
**Achado:** Salário do trabalho, prêmio de projeto, dilema e xícaras somam direto no saldo sem passar pelo teto do dia. E o teto padrão de 50.000 é alto demais para segurar algo. A regra "toda moeda tem teto" não está valendo na prática.
**Recomendação:** Fazer todo ganho passar por uma única função de crédito com teto. Definir um teto realista, perto do que um jogador ativo ganha num dia bom.
**Revisão:** Confirmado. Os números de linha mudaram um pouco (814/861/1140/1177/1249), mas os trechos existem. Severidade mantida.

### Q285 — No /py-daily, dois cliques ou dois comandos ao mesmo tempo pagam o diário duas vezes?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/services/economy.js:1020` `if (last && now - last < DAILY_COOLDOWN_MS) return;` dentro de `updateUserAccount`, que usa `withFileLock` (`:245`); `:1078` xícaras checam `acc.dailyCupsAt === acc.lastDailyAt` sob a mesma trava.
**Achado:** O diário e as xícaras reconferem o prazo dentro da trava antes de pagar. Clique duplo não paga duas vezes.
**Recomendação:** Manter. Usar o mesmo padrão no casamento e no jokenpô.
**Revisão:** Confirmado por amostragem.

### Q286 — Na compra do /py-market, dois compradores clicando ao mesmo tempo ou uma cobrança que falha podem duplicar item ou moedas?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/services/market.js:218` `return locked(() => {`; `:226-227` remove o anúncio e grava antes de cobrar; `:233-236` `restore()` se `spendCoins` falha; `:242` devolve com `{ bypassCap: true }` se a entrega falha.
**Achado:** A compra é bem amarrada. O anúncio sai da vitrine antes da cobrança e tudo volta se algo falhar. A taxa de 5% tira moedas da economia.
**Recomendação:** Manter. Vale registrar em log quando `restore()` for usado.
**Revisão:** Confirmado.

### Q287 — Os comandos do dono que mexem em saldo só funcionam para o dono?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/commands/setareconomia.js:8-10` `userId === OWNER_SNOWFLAKE`, `:38` `.setDefaultMemberPermissions(0n)`; `resetareconomia.js:42` e `:56`; `economyconfig.js:70` e `:78`; `index.js:758` `if (interaction.user.id !== OWNER_SNOWFLAKE)`; `index.js:949-956` lista `ephemeralCommands` sem `setareconomia`.
**Achado:** Os três comandos e os botões do painel conferem o dono antes de agir. Porém a resposta do /py-setareconomia é pública, então o novo saldo aparece no canal.
**Recomendação:** Manter a checagem. Pôr os comandos de dono na lista de respostas privadas.
**Revisão:** Confirmado.

### Q288 — Se data/market.json, data/dungeon.json ou o arquivo de casamentos corromper, o bot protege os dados como faz com economy.json?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/utils/atomicJson.js:8-11` `readJson` devolve o valor vazio em erro; usado em `src/services/market.js:35` e `src/modules/dungeon/dungeonStore.js:86`; `src/modules/marriage/marriageManager.js:103-104` `catch` devolve `{ marriages: {} ... }`; só `src/services/economy.js:166-190` guarda `.corrupt` e lê do `.bak`.
**Achado:** Só a economia tem plano B. Se um desses arquivos corromper, o bot lê como vazio e, na próxima gravação, apaga tudo: anúncios com itens, progresso das Catacumbas e todos os casamentos.
**Recomendação:** Usar nos três a mesma proteção da economia: guardar o arquivo ruim, ler do backup e nunca gravar por cima de um estado vazio vindo de erro.
**Revisão:** Confirmado. Rebaixado de alta para média: as gravações já são atômicas (`atomicJson.js:17-21`, `marriageManager.js:116-117`), então a corrupção é rara (disco cheio, edição manual). O estrago, se ocorrer, é grande.

### Q289 — O Duelo de Quiz (/py-duel) tem limite para não virar farm de moedas entre duas contas?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/services/quizDuelService.js:14-15` `WIN_REWARD = 5`, `DAILY_REWARD_LIMIT = 3`; `:142-150` zera por dia e corta após 3 vitórias; `src/commands/duelo.js:198` paga via `addCoins`.
**Achado:** O vencedor ganha no máximo 15 moedas por dia. Mesmo com contas combinadas, o ganho é pequeno.
**Recomendação:** Manter.
**Revisão:** Confirmado por amostragem.

### Q290 — No /py-work, quando aparece o Dilema de Corrupção e a pessoa não clica a tempo, ela perde o salário que já tinha ganho?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/commands/trabalho.js:2546-2560` com dilema não chama `finishWork`; `:2562-2565` apaga a sessão após `5 * 60 * 1000`; `:2832` `startWork(...)` já iniciou o cooldown; `src/utils/i18n.js:1806-1813` textos do dilema sem prazo.
**Achado:** A pessoa acerta a pergunta, aparece o dilema e, se não escolher em 5 minutos (ou se o bot reiniciar), não recebe nada e ainda espera 3h. O texto não avisa que há prazo. Pune quem acertou.
**Recomendação:** Ao expirar, pagar o salário base automaticamente. Mostrar o prazo no embed com contador (`<t:...:R>`).
**Revisão:** Confirmado. Rebaixado de alta para média: a perda é um turno (salário de 15 a 40 moedas, `trabalho.js:58-59`) e só acontece em ~10% dos acertos.

### Q291 — Quando o turno do /py-work termina pelo dilema, a pessoa recebe as mesmas recompensas extras de um turno normal?
**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `src/commands/trabalho.js:2608-2619` turno normal chama `grantWorkMaterials`, `safeAddXp`, `recordActivity` e festival; `handleDilemmaInteraction` (`:2250` em diante) só chama `resolveCorruptionDilemma`, sem nenhuma dessas.
**Achado:** Quando o turno vira dilema, a pessoa fica sem XP do Passe, sem materiais, sem chance de Fagulhas e sem contar a missão do casal. Parece um turno "pior", sem aviso.
**Recomendação:** Juntar as recompensas extras numa função única e chamar nos dois caminhos.
**Revisão:** Confirmado.

### Q292 — Se a pessoa não responde a pergunta do /py-work em 90s, a mensagem explica que o turno foi perdido e o cooldown já correu?
**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `src/commands/trabalho.js:2832` cooldown começa antes da resposta; `:60` `WORK_TIMEOUT_MS = 90 * 1000`; `:2852-2856` o timer só apaga a sessão, sem editar a mensagem; `src/utils/i18n.js:1768` "Este expediente já foi finalizado ou expirou".
**Achado:** O limite de 1min30 aparece na pergunta, mas quem clica depois só vê "expirou". Não diz que perdeu o turno nem quanto falta. Os botões continuam ativos.
**Recomendação:** Ao expirar, desativar os botões e escrever "turno perdido, próximo em X" com horário.
**Revisão:** Confirmado.

### Q293 — As mensagens de "sem profissão" e "em cooldown" do /py-work saem só para quem usou o comando?
**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** `src/commands/trabalho.js:2750-2761` pede `ephemeral: true`; `:2926` usa `interaction.editReply`; `index.js:984` `deferReply` público, pois py-work não está em `ephemeralCommands` (`:949-956`) e o comando não tem `ephemeral`.
**Achado:** Depois de uma resposta pública adiada, o "privado" é ignorado. Esses avisos aparecem para o canal todo e expõem o cooldown da pessoa.
**Recomendação:** Checar profissão e cooldown antes do deferReply, ou responder esses casos com mensagem privada à parte.
**Revisão:** Confirmado.

### Q294 — O prazo do Date Night mostrado ao casal bate com o prazo real da sessão?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/utils/i18n.js:1455` "em até 45s"; `src/modules/marriage/commands/pyCasamento.js:364-366` apaga a sessão em `60000` ms.
**Achado:** O texto diz 45 segundos, mas a sessão dura 60. Não prejudica, mas o número mostrado não é o real.
**Recomendação:** Usar uma única constante no texto e no timer.
**Revisão:** Confirmado.

### Q295 — Os minigames de recreação estão sem dar moedas, como manda o AGENTS §5?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** busca por `addCoins|addMagicBeans|coins +=` em `src/commands/matematica.js`, `jogodavelha.js`, `campominado.js`, `biscoito.js`, `provavel.js` e `src/services/arcaneMathService.js`: nenhuma ocorrência.
**Achado:** Os jogos casuais não mexem em saldo. A regra está cumprida.
**Recomendação:** Manter e conferir em cada minigame novo.
**Revisão:** Confirmado (busca refeita).

### Q296 — O jeito como a economia lê e trava o economy.json aguenta muitos jogadores sem travar o bot?
**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `src/services/economy.js:235-237` `getUserAccount` lê o arquivo inteiro a cada chamada (`parseEconomyFile` em `:156-158`, sem cache); `src/utils/fileLock.js:17-19` `Atomics.wait` e `:21` `timeoutMs = 3000`.
**Achado:** Cada consulta de saldo lê o arquivo de todos os jogadores. A trava espera parando o bot inteiro, até 3s, se o site estiver gravando. Com a base crescendo, o bot fica lento para todos e pode estourar o prazo do Discord.
**Recomendação:** Manter a economia em memória e só gravar no arquivo, ou levar os saldos para o PostgreSQL. Reduzir o tempo máximo de espera da trava.
**Revisão:** Confirmado; não há cache de leitura.

### Q297 — As sessões em memória e o filtro de interações repetidas são limpos para não acumular memória?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/commands/trabalho.js:2852-2859` e `:2562-2567` timers com `unref`; `pyCasamento.js:364-366`; `src/commands/coinflip.js:57` limita a 5000; `index.js:745-751` limpa `processedInteractionIds` acima de 1000.
**Achado:** As sessões têm timer de limpeza e os mapas têm limite. Não há acúmulo de memória nesses fluxos.
**Recomendação:** Manter. A limpeza em memória faz perder sessões quando o bot reinicia (ver Q290 e Q292).
**Revisão:** Confirmado por amostragem.

### Q298 — As Catacumbas (/py-dungeon) têm teto por descida, teto diário e devolução correta do ingresso quando a gravação falha?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/modules/dungeon/dungeonStore.js:29-35` ingresso 50, 3 entradas, teto 500/descida e 600/dia; `:202-204` aplica os dois tetos; `:418` `economy.addCoins(userId, settings.ticket)` sem `bypassCap`.
**Achado:** Os tetos estão certos. Mas a devolução do ingresso, quando a gravação falha, conta como ganho do dia. Se a pessoa já estiver no teto diário, a devolução vira zero e ela perde 50 moedas.
**Recomendação:** Devolver o ingresso com `{ bypassCap: true }`, igual ao mercado.
**Revisão:** Confirmado.

### Q299 — Quando um comando ou botão dá erro, o bot responde à pessoa sem cair em "interaction already replied" e sem deixar o processo em estado ruim?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `index.js:984` `deferReply` de todo comando slash; `:1037-1041` escolhe `editReply` ou `reply` conforme `deferred || replied`, com `.catch(() => null)`; `:1084-1086` `uncaughtException` só registra no log.
**Achado:** O erro nas interações é bem tratado. Mas uma falha grave fora de interação só vai para o log e o bot segue rodando, talvez com dados pela metade, sem avisar o dono.
**Recomendação:** Em `uncaughtException`, gravar o pendente (já existe `handleAppShutdown` em `:1088`), avisar o dono e reiniciar de forma controlada.
**Revisão:** Confirmado.

### Q300 — No Cofre do Amor Eterno (/py-casamento cofre), o depósito e o resgate de juros são seguros contra perda ou duplicação de moedas?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/modules/marriage/marriageManager.js:441` `spendCoins` antes de `:449` `writeData` (sem desfazer); `:488` `addCoins(userId, yieldAmount)` antes de gravar `lastInterestClaim` (`:492-493`); `:30` `VAULT_DAILY_CAP = 200`; `:116-117` grava com .tmp + rename, sem trava de arquivo.
**Achado:** Tem teto de 200/dia e cooldown de 24h. Mas a ordem está invertida: se a gravação falhar, o depósito tira as moedas sem guardar no cofre, e o resgate paga sem registrar o horário.
**Recomendação:** Gravar o cofre primeiro e só depois mexer no saldo, ou desfazer se a gravação falhar. Usar trava de arquivo nos casamentos.
**Revisão:** Confirmado, mas rebaixado de média para baixa: as duas funções são síncronas (sem espera no meio), então não há corrida entre cliques no bot; o problema só aparece se a gravação em disco falhar, o que é raro.
