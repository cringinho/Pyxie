# 🧪 Escudo de Arquivos

## O que é este módulo?

Golpistas mandam arquivos "de presente" (nitro grátis, mod de jogo, script de bot) que, quando rodados, roubam o token do Discord e as senhas salvas no navegador. O Escudo de Arquivos lê só arquivos pequenos de texto e script e apaga os que fazem isso. Quem mandou recebe uma DM acolhedora, porque muitas vezes a conta dele foi invadida.

## O que ele é capaz de fazer?

- **Scripts que roubam conta:** `.py`, `.js`, `.bat`, `.ps1`, `.vbs`, `.txt` e parecidos, até 256 KB. Só marca quando o arquivo junta duas pistas: procura pastas de dados do Discord/navegador, manda dados para fora (webhook, Telegram, sites de upload) ou traz a regra de formato do token do Discord. Código comum que só usa um webhook passa.
- **Programas:** `.exe`, `.scr`, `.msi`, `.lnk` e parecidos (pode desligar no painel).
- **Apagar ou só avisar**, com aviso no canal que some em 2 minutos e registro para a staff.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

- **Gerenciar Mensagens** para apagar; sem ela, só avisa.
- **Canal de alertas da staff** (opcional, o mesmo da Segurança).

## Recursos no site e web

Painel → servidor → **Segurança** → Escudo de arquivos.

## Ferramentas e bibliotecas usadas

- `fetch` do Node para baixar o anexo (5 s de limite, 256 KB). Regras em `src/services/fileThreats.js`.
