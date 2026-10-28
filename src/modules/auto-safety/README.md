# 🛡️ Automações de Segurança

## O que é este módulo?

Oito proteções prontas que cada servidor liga em Painel → **Automações** (grupo Segurança). Todas desligadas por padrão, com prévia do aviso antes de salvar. Os avisos vão para o canal de alertas da Segurança (ou DM de quem é dono do servidor).

## O que ele é capaz de fazer?

- **Conta nova em quarentena:** conta criada há menos de N dias ganha um cargo de quarentena ao entrar.
- **Nome limpo:** tira zalgo, caracteres invisíveis, links e (opcional) símbolos de furar a lista do apelido.
- **Imitação da staff:** avisa quando um nome fica parecido com o de alguém da staff (acentos, números, `rn`→`m`).
- **Spam em vários canais:** mesma mensagem em N canais em 1 minuto → apaga todas, castigo e DM acolhedora (conta invadida).
- **Menções em massa:** apaga e dá castigo opcional.
- **Convites de fora:** apaga convites de outros servidores; convites deste servidor e o link personalizado passam.
- **Filtros prontos do AutoMod:** palavrões, conteúdo sexual e ofensas do próprio Discord, mais limite de menções (`src/services/automodPresets.js`, sincronizado ao salvar).
- **Alarme de moderação:** muitas ações de banir/expulsar/castigar em poucos minutos → aviso com botão, ou tira os cargos de moderação na hora.

A staff (Gerenciar Mensagens) não é afetada pelos filtros de mensagem. Quem é dono do servidor nunca dispara o alarme.

## Comandos no Discord

Nenhum. Botão **Tirar cargos de moderação** no alarme (só Administrador).

## Canais, cargos e permissões

Gerenciar Cargos, Gerenciar Apelidos, Gerenciar Mensagens, Castigar Membros, Ver Registro de Auditoria e Gerenciar Servidor (AutoMod). O painel mostra o que falta em cada cartão.

## Recursos no site e web

Painel → servidor → **Automações**.

## Ferramentas e bibliotecas usadas

`src/services/autoRules.js` (regras puras), `src/services/autoAlerts.js` (embeds §9), intent `GuildModeration` (eventos de auditoria).
