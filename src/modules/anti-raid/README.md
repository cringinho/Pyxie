# 🚨 Anti-raid

## O que é este módulo?

Num ataque (raid), dezenas de contas entram no servidor de uma vez para mandar spam ou golpe por DM. O Anti-raid percebe essa entrada em massa e liga a pausa do próprio Discord para **convites** e **DMs entre membros**. A pausa tem prazo: quando acaba, o Discord desfaz sozinho, mesmo se a Pyxie estiver fora do ar.

Ninguém é expulso nem castigado. Quem já está no servidor continua conversando normalmente.

## O que ele é capaz de fazer?

- **Percebe a entrada em massa:** por padrão, 10 contas em 30 segundos, ou metade disso só de contas com menos de 7 dias.
- **Não confunde divulgação com ataque:** em servidor grande o limite sobe sozinho (1 a cada 2.000 membros).
- **Pausa convites e DMs** pelo tempo escolhido (30 min a 24 h).
- **Avisa a staff** no canal de alertas (ou por DM para quem é dono do servidor), com o botão **Encerrar pausa agora**.
- **Um alerta por ataque:** enquanto a pausa vale, não dispara de novo.

## Comandos no Discord

Nenhum. O alerta traz o botão **Encerrar pausa agora** (dono do servidor ou quem tem Gerenciar Servidor).

## Canais, cargos e permissões

- **Gerenciar Servidor:** para ligar e encerrar a pausa. Sem ela, o alerta explica como pausar à mão.
- **Canal de alertas da staff** (opcional, compartilhado com o Guardião).

## Recursos no site e web

Painel → servidor → **Segurança** → Anti-raid: ligar ou desligar, quantas entradas, em quantos segundos e quanto tempo dura a pausa. As ocorrências aparecem na lista da mesma tela.

## Ferramentas e bibliotecas usadas

- Evento de entrada de membro, que a Pyxie já recebe (sem intent novo).
- Contagem só em memória (`src/services/raidWatch.js`), limpa a cada 5 minutos.
- Pausa nativa do Discord (`incident-actions`), com prazo de até 24 h.
