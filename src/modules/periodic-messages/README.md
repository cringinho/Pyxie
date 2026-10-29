# 🔁 Mensagens Periódicas

Mensagens que a Pyxie repete sozinha em cada servidor, configuradas no painel (`/dashboard` → servidor → **Mensagens periódicas**). Antes eram fixas da Cringelândia no `index.js`.

## O que ele faz

- **Guia de apoio (bump):** cartão com os jeitos de apoiar o servidor (DISBOARD, Canudinho, Discadia, voto na Pyxie no Top.gg, review no DISBOARD), no canal e no intervalo escolhidos (de `2` a `72` horas). Não marca ninguém. Desligado por padrão.
- **Tarot diário:** o anúncio da meia-noite (Brasília) continua no `index.js`, porque também vira o ciclo das tiragens, mas agora cada servidor escolhe canal, cargo marcado e se quer o anúncio. Fora da Cringelândia o anúncio leva o crédito dela.
- **Agenda:** `/py-agenda` e o painel (**Agenda**) mostram os próximos disparos do próprio servidor, calculados da config salva em `src/services/guildAgenda.js` (guia, tarot, recado agendado, resumo semanal, lembrete de bump e acolhimento de 24h).

Para recado em dia e hora fixos existe a automação **Recado agendado** (`scheduledMessages`, em Automações): este módulo não duplica isso.

## Onde fica cada parte

- `src/services/periodicMessages.js`: config (`data/guilds/<id>/periodic.json`, escrita atômica), estado do bot (`periodicState.json`), montagem do cartão do guia.
- `src/services/guildAgenda.js`: agenda calculada do servidor.
- Este módulo: confere a cada `10` minutos, só no processo do bot, quais guias venceram. Sem estado salvo, procura o último guia no canal antes de postar, para não repetir.
- Rotas: `GET/PUT /api/dashboard/guilds/:guildId/periodic` e `GET /api/dashboard/guilds/:guildId/agenda` (conferência ao vivo de admin; canal e cargo precisam ser do servidor).

## Cringelândia

Nasce com os valores que eram fixos em `src/config.js`: guia em `BUMP_GUIDE_CHANNEL_ID` a cada `12` horas com todos os sites, tarot em `TAROT_CHANNEL_ID` marcando `TAROT_ROLE_ID`, sem crédito. O dono muda tudo pelo painel.

## Comandos

Nenhum comando novo. `py!set tarot #canal` / `/py-setup` continuam definindo o canal do tarot (é o mesmo campo que o painel edita) e `/py-agenda` mostra a agenda do servidor.
