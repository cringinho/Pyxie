# 💉 Injeções

## O que é este módulo?

Montar cargos de identidade e de cor à mão dá trabalho e costuma sair sem padrão. As Injeções criam, de uma vez, pacotes prontos de cargos (com nome em português ou inglês, cor e bandeira) e publicam um painel para cada pessoa escolher os seus. Também dá para colocar as opções em **Canais e cargos** do Discord.

Tudo é opcional para os membros: o painel diz isso e tem o botão **Tirar tudo**.

## O que ele é capaz de fazer?

- **Pacotes:** Gêneros (14), Sexualidades (25), Neurodivergências (13), Cores (24, 48 ou as 75 da Cringelândia).
- **Antes de publicar:** escolher quais itens entram, onde os cargos ficam (logo abaixo da Pyxie ou no fim), se cada pessoa pega um só ou vários, quem pode pegar (cargos liberados), se publica painel e em qual canal, formato (lista ou botões até 20 itens), título e texto próprios.
- **Bandeiras:** com boost nível 2, viram o ícone do cargo; sem boost, o cargo fica com a cor mais viva da bandeira.
- **Reaproveita:** cargo com o mesmo nome não é duplicado.
- **Canais e cargos (onboarding):** em servidores Comunidade, acrescenta uma pergunta (até 50 opções cada) sem mexer nas que já existem.
- **Sem permissões:** os cargos criados não têm permissão nenhuma e não podem ser marcados.
- **Remover:** tira o painel; se pedir, apaga os cargos daquela injeção.
- **Limite:** recusa se passar dos 250 cargos do Discord.

## Comandos no Discord

Nenhum: tudo no painel. Os membros usam o painel publicado (lista ou botões).

## Canais, cargos e permissões

- **Gerenciar Cargos** (criar, posicionar, dar e tirar).
- **Gerenciar Servidor** só para Canais e cargos.

## Recursos no site e web

Painel → servidor → **Injeções**.

## Ferramentas e bibliotecas usadas

- `sharp` para desenhar a bandeira em PNG; catálogo em `src/data/injectionPacks.js`; regras em `src/services/injections.js`.
- A criação roda como tarefa no bot (o painel acompanha o progresso), porque criar dezenas de cargos respeita o limite de pedidos do Discord.
