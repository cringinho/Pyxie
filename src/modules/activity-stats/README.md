# 📊 Atividade do Servidor

## O que é este módulo?

Conta quantas mensagens, entradas, saídas e comandos o servidor teve em cada dia, para o painel mostrar números reais na Visão geral. Só guarda números: nunca o conteúdo das mensagens nem quem mandou.

## O que ele é capaz de fazer?

- **Contagem diária:** mensagens (sem contar bots), entradas, saídas e comandos (barra e `py!`).
- **Leve:** soma em memória e grava no disco só a cada 5 minutos, em lote.
- **30 dias:** guarda o último mês; o resto é apagado sozinho.
- **Dia de Brasília:** o dia vira à meia-noite no horário de Brasília.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

Nenhuma configuração. Usa eventos que a Pyxie já recebe.

## Recursos no site e web

Painel → servidor → **Visão geral**: mensagens de hoje, entradas, saídas e comandos dos últimos 7 dias e o gráfico de mensagens dos últimos 30 dias. Os números atualizam a cada 5 minutos.

## Ferramentas e bibliotecas usadas

- `src/services/guildActivity.js`, gravando em `data/guilds/<id>/activity.json` com escrita atômica.
