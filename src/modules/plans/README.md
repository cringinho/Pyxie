# 🔑 Acesso Vitalício dos Servidores

## O que é este módulo?

A Pyxie **saiu do público e não cobra por nada**. Este módulo cuida do acesso dos servidores:

- **Servidores que já tinham a Pyxie** ganham acesso **vitalício** (plano Fundador + Estúdio de Loja), uma única vez.
- **Chaves**: o dono da Pyxie gera chaves no painel (Pyxie global → Chaves) e entrega a quem quiser. Quem recebe resgata com `/py-fundador chave:FUND-XXXX-XXXX` e o servidor fica vitalício.
- Não existe plano pago, Pix, cartão, preço nem paywall de compra. Recurso trancado no painel só diz como pedir uma chave.

## O que ele faz

- **Migração única** (`src/services/legacyLifetime.js`): quando o bot fica pronto, todo servidor do cache sem plano ativo recebe vitalício (`source: legacy`). O marcador fica em `data/legacyLifetime.json`; servidor que entrar depois **não** é migrado e precisa de chave.
- Nunca rebaixa nem sobrescreve plano que já existe.
- Avisa o dono por DM (PT/EN, sem pings) só de concessões antigas **com prazo** que ainda estejam correndo.
- Vitalício **não pausa por inatividade** e não vence.
- O Passe da Pyxie tem a trilha premium liberada para todo mundo.

## Onde ficam as regras

- Chaves: `src/services/founderProgram.js` (uso único, vale 30 dias para resgatar; resgate liga o servidor ao vitalício).
- Plano efetivo: `src/services/guildPlans.js` (`lifetime: true` nunca expira).
- Recursos por plano: `src/config/planFeatures.js` (bloqueio vale para servidor sem acesso; vitalício passa).
- Tela: painel → servidor → **Planos** (`/api/dashboard/guilds/:id/plan`), só leitura.

## Cobrança (legado, desligada)

`planPayments.js` e `passPayments.js` ficam só para ler e estornar histórico antigo. Criar cobrança nova exige `PYXIE_PAYMENTS=on`, que **nunca** é ligado em produção; os checkouts do painel respondem `410 payments_disabled` e `/planos`, `/passe` e `/invite` apenas redirecionam para a página inicial.

## Canais, cargos e permissões

Nenhuma permissão do Discord é necessária. `/py-fundador` exige `Gerenciar Servidor`.

## Recursos no site e web

Página inicial = Cringelândia (`/`), com a seção **Links importantes** (`#links`). Suporte único: `cringe.support@gmail.com`.

## Ferramentas e bibliotecas usadas

`discord.js` (DM), `withFileLock`/escrita atômica para os JSON.
