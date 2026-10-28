# 🔐 Guardião do Servidor

## O que é este módulo?

Quando a conta de alguém da staff é invadida, o primeiro passo do invasor costuma ser dar Administrador a um cargo ou abrir um canal privado. O Guardião percebe essas mudanças na hora e avisa a staff com um botão para desfazer.

Por padrão ele só alerta: quem decide é a staff. Se o servidor preferir, o modo automático desfaz sozinho e avisa depois.

## O que ele é capaz de fazer?

- **Permissão perigosa num cargo:** avisa quando um cargo novo ou existente ganha Administrador, Gerenciar Servidor, Gerenciar Cargos, Gerenciar Webhooks ou Banir Membros. O botão **Desfazer** tira só essas permissões e deixa o resto como estava.
- **Canal privado que ficou aberto:** avisa quando um canal fica visível para `@everyone` dentro de uma categoria fechada (canal novo, alterado ou trazido de outra categoria). O botão **Trancar** esconde o canal de novo.
- **Quem fez:** mostra quem mudou, pelo registro de auditoria.
- **Dono não gera alerta:** mudanças feitas por quem é dono do servidor passam em silêncio.
- **Modo automático:** desfaz sozinho quando sabe quem mudou (precisa do registro de auditoria). Com ele ligado, só quem é dono do servidor consegue dar essas permissões.
- **Sem repetir:** um alerta por cargo ou canal a cada minuto.

## Comandos no Discord

Nenhum. Os alertas trazem os botões **Desfazer** / **Trancar** e **Foi de propósito**.

| Botão | Quem pode usar |
| --- | --- |
| Desfazer | Dono do servidor ou quem tem Administrador |
| Trancar | Dono, Administrador ou quem tem Gerenciar Canais |
| Foi de propósito | Dono do servidor ou quem tem Administrador |

## Canais, cargos e permissões

- **Canal de alertas da staff** (opcional, no painel). Sem ele, os alertas vão por DM para quem é dono do servidor.
- **Ver registro de auditoria:** para saber quem mudou (e para o modo automático funcionar).
- **Gerenciar Cargos** e ficar acima do cargo na lista, para desfazer.
- **Gerenciar Canais**, para trancar.

## Recursos no site e web

Painel → servidor → **Segurança**: ligar ou desligar, escolher entre "alertar com botão" e "desfazer sozinha", escolher o canal de alertas e ver as últimas ocorrências.

## Ferramentas e bibliotecas usadas

- Eventos do Discord que a Pyxie já recebe (cargos e canais), sem intent novo.
- Regras em `src/services/serverGuard.js`; mensagens em `src/services/securityAlerts.js`; configuração em `src/services/guildSafety.js`.
