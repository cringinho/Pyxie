# 💳 Assinatura dos Servidores

## O que é este módulo?

O plano mensal do servidor: **Básico (R$ 7)** e **Premium (R$ 20)**, pagos por **Pix** (renovação manual) ou **cartão** (Mercado Pago Preapproval, cobra sozinho). Sem pagamento, os benefícios são pausados e o dono recebe DM.

## O que ele faz

- A cada 30 min, reconcilia cobranças **Pix pendentes** direto na API do Mercado Pago (webhook pode atrasar) e ativa o plano quando o pagamento é aprovado.
- Marca **D-7, D-3, D-0** e o **corte** no `data/planNotices.json` e envia **DM ao dono** (PT/EN, sem pings).
- Entrega a fila de avisos gravada pelo webhook (plano ativado) — o processo web só enfileira, quem manda é o bot.
- **Nunca apaga dados**: plano vencido volta ao Free e as vantagens voltam ao normal; pagar de novo reativa na hora.

## Onde ficam as regras

- Catálogo/preços/validade: `src/services/guildPlans.js` e `src/services/guildPerks.js`.
- Cobrança (Pix, cartão, webhook, reconciliação): `src/services/planPayments.js`.
- Fila e marcações: `src/services/planNotices.js`.
- Tela: painel → servidor → **Planos** (`/api/dashboard/guilds/:id/plan`).

## Canais, cargos e permissões

Nenhuma permissão do Discord é necessária. A cobrança usa `MERCADOPAGO_ACCESS_TOKEN`; o webhook fica em `/api/plans/webhook/mercadopago` e deve ter `MERCADOPAGO_WEBHOOK_SECRET` configurado no Mercado Pago.

## Recursos no site e web

Painel → **Planos** (QR Pix, cartão, status e cancelamento). Suporte único: `cringe.support@gmail.com`.

## Ferramentas e bibliotecas usadas

`discord.js` (DM), `node:crypto` (assinatura HMAC), `fetch` (API do Mercado Pago), `withFileLock`/`atomicJson` para escrita segura.
