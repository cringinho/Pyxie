# Planos, assinaturas e doações (decisões vigentes)

## Planos do servidor

| Plano | Preço | O que entrega |
|---|---|---|
| Free | R$ 0 | Comandos core, economia padrão |
| **Fundador** | R$ 0 por 12 meses (20 vagas) | Básico liberado para servidores parceiros |
| **Básico** | **R$ 7/mês** | Bônus de +50 moedinhas no `/py-daily` e cores/temas personalizados |
| **Premium** | **R$ 20/mês** | Tudo do Básico, bônus de +120 no `/py-daily` e Oráculo com IA (cota diária) |

Regras invioláveis (AGENTS §5 e §10):
- **Não existe multiplicador de moedinhas** por plano.
- O **cooldown do `/py-daily` continua 24 h** em qualquer plano — o plano só muda o valor pago.
- Teto diário de moedinhas ganhas: **50.000 por pessoa** (BRT), configurável em `settings.economy.dailyCoinCap`; transferências do mercado não consomem o teto.
- Plano vencido **volta ao Free sem apagar nada** (configuração, temas e contadores ficam salvos).

## Cobrança (mensal, obrigatória)

- **Pix manual** (padrão): QR + copia-e-cola, validade de 30 min, ciclo de 30 dias.
- **Cartão recorrente** (opcional): Mercado Pago **Preapproval**, cobra sozinho todo mês.
- Chave da assinatura: `plan|<guildId>|<basic|premium>`; valor **sempre** vem do catálogo (`src/services/guildPlans.js`).
- Webhook único: `https://pyxie.com.br/api/pass/webhook/mercadopago` decide pelo `external_reference` (Passe, plano ou doação) e pelo tipo de evento (Pix, Preapproval, cobrança de assinatura).
- Segurança: `MERCADOPAGO_WEBHOOK_SECRET` no `.env` (assinatura x-signature), conferência de valor/moeda na API e **idempotência por `paymentId`**.
- Reconciliação de Pix pendente a cada 30 min (webhook atrasa).
- **Sem pagamento**: D-7, D-3, D-0 e corte por **DM ao dono**; as vantagens são pausadas na hora do vencimento. Nada de ping.

## Suporte

- **Único**: `cringe.support@gmail.com`. Não é vendido, não tem fila, não tem “canal premium”. Vale para todos os planos.

## Doações

- Pix de **valor livre** (R$ 2 a R$ 500; presets 5/10/25/50) com botão **separado** na Loja do Dia da Casinha.
- **Ranking** do mês e geral (`GET /api/public/donations`), com opção **anônima**.
- Doação **não dá vantagem no jogo** (exigência das regras do Discord e da nossa ética).
- Entra no registro público de transparência.

## Programa Fundador (20 vagas) — implementado

`src/services/founderProgram.js` + rotas do dono em `/api/dashboard/global/founder` (listar, criar chave, resgatar, revogar, checklist). 20 vagas, chave única de 7 dias, Básico por 12 meses, checklist de contrapartida, auto-pausa (30 dias de carência + 4 semanas paradas + 7 dias de aviso) e varredura a cada 30 min no módulo `plans`.

A base de planos já suporta `plan: founder` com validade. Falta apenas o painel do dono com:
- 20 assentos (chave de resgate única por servidor, com data e checklist);
- checklist de contrapartida (canal liberado, anúncio publicado, atividade semanal);
- auto-pausa por inatividade (30 dias) e liberação da vaga;
- expiração em 12 meses com oferta de continuar por R$ 7.

## Operação

1. `.env`: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `PASS_PUBLIC_URL`.
2. Mercado Pago → Integrations → Webhooks: URL acima com **Pagamentos (legacy)** e **Planos e assinaturas** marcados.
3. Deploy/reinício do bot e do web (módulo `plans`, rotas e páginas novas).
4. Página pública: `/planos` (PT) e `/en/plans` (EN), no sitemap e no IndexNow.
