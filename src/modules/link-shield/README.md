# 🛡️ Escudo de Links

## O que é este módulo?

Golpistas espalham links que parecem do Discord, da Steam ou de bancos, mas levam para sites que roubam a conta. O Escudo de Links olha o endereço de cada link mandado no servidor e apaga os que imitam um site conhecido. Ele não abre o site: só lê o endereço, então é rápido e não pesa na memória.

Muitas vezes quem mandou nem sabe: a conta foi invadida. Por isso a pessoa recebe uma DM acolhedora explicando o que houve e sugerindo trocar a senha. Ninguém é punido.

## O que ele é capaz de fazer?

- **Letras de outro alfabeto:** `dіscord.com` com o "і" ucraniano, `раураl.com` com letras cirílicas.
- **Letras trocadas por parecidas:** `disc0rd.com`, `steamcommunlty.com`.
- **Erro de digitação proposital:** `discrod.com`, `steamcomunity.com`.
- **Nome certo com final errado:** `discord.xyz`, `steamcommunity.ru`.
- **Marca com isca:** `discord-nitro.gift`, `free-nitro.com`.
- **Endereço verdadeiro no começo de outro site:** `discord.com.login-verify.ru`.
- **Edição depois de enviar:** também confere mensagens editadas.
- **Sem encher o chat:** numa onda de golpe, apaga tudo, mas avisa no canal no máximo uma vez por minuto. O aviso some sozinho em 2 minutos.

Sites legítimos de comunidade, como `discords.com`, `discord.me` e `top.gg`, passam. O servidor pode liberar outros domínios no painel.

## Comandos no Discord

Nenhum. Tudo é configurado no painel.

## Canais, cargos e permissões

- **Gerenciar Mensagens** no canal, para apagar. Sem isso, a Pyxie só avisa respondendo à mensagem.
- **Canal de alertas da staff** (opcional): recebe um registro de cada link barrado.

## Recursos no site e web

Painel → servidor → **Segurança**: ligar ou desligar, escolher entre "apagar e avisar" e "só avisar", liberar domínios e ver as últimas ocorrências com o total de links barrados.

## Ferramentas e bibliotecas usadas

- Conversão de endereços internacionais que já vem no Node (`node:url`).
- Configuração em `data/guilds/<id>/security.json` (só o painel grava) e ocorrências em `data/guilds/<id>/securityEvents.json` (só o bot grava), ambos com escrita atômica.
- Lógica em `src/services/lookalikeLinks.js` (detector) e `src/services/guildSafety.js` (configuração).
