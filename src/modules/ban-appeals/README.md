# 🕊️ Apelação de Banimento

## O que é este módulo?

Quem foi banido perde o acesso ao servidor e, muitas vezes, não tem como falar com a staff. Este módulo abre um caminho justo: a pessoa entra no painel da Pyxie com o Discord, vê o motivo registrado do banimento e escreve um pedido para voltar. A staff lê no canal escolhido e decide com um botão. A pessoa vê a resposta no painel (e recebe DM quando possível).

Vem **desligado**: cada servidor liga quando tiver alguém da staff para responder.

## O que ele é capaz de fazer?

- **Mostra o motivo:** o motivo que ficou registrado no banimento do Discord.
- **Um pedido por vez:** enquanto um pedido espera, não dá para mandar outro.
- **Depois de uma recusa:** 30 dias até poder pedir de novo.
- **Botões para a staff:** **Desbanir** (tira o banimento na hora) e **Recusar**. Só quem pode banir membros (ou o dono do servidor) decide.
- **Sem ping:** o texto da pessoa chega com menções neutralizadas.
- **Resposta acolhedora:** a DM de aceite e de recusa é calma, sem ironia.

## Comandos no Discord

Nenhum. A pessoa usa o link `/dashboard#/appeal`; a staff usa os botões do pedido.

## Canais, cargos e permissões

- **Canal dos pedidos:** escolhido no painel; só a staff deve ver.
- **Banir Membros:** para a Pyxie ver o motivo e desbanir.

## Recursos no site e web

- `/dashboard#/appeal`: página de quem foi banido (login com Discord).
- Painel → servidor → **Segurança** → Apelação de banimento: ligar, escolher o canal e copiar o link para as regras.

## Ferramentas e bibliotecas usadas

- Só o bot grava os pedidos (`data/guilds/<id>/appeals.json`, escrita atômica); o site pede tudo pela ponte com o bot (`APPEAL_LIST`, `APPEAL_SUBMIT`).
- Regras em `src/services/banAppeals.js`.
