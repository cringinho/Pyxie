# Módulo Passe da Pyxie

Passe mensal de 50 níveis (`/py-pass`, ou `py!passe` que chega por DM). Uma temporada por mês no
horário de Brasília, gerada sozinha a partir de uma semente do mês: as recompensas são as mesmas
para todo mundo e mudam a cada mês.

## XP
Cada nível pede 300 XP. O XP vem do que a pessoa já faz (todas essas atividades já têm limite ou
recarga próprios):

| Atividade | XP |
| :--- | :--- |
| Bônus diário (`/py-daily`) | 120 |
| Turno certo no `/py-work` | 60 |
| Descida nas Catacumbas | 40 + 15 por andar além do 1º (até 120) |
| Golpe no chefe da semana | 30 |
| Item feito na oficina | 30 |
| Compra ou venda no mercado (as duas pessoas) | 20 |
| Caixa do Festival | 15 |

## Trilhas
- **Grátis:** materiais, Ecos e Fagulhas nos níveis comuns, `40` moedinhas nos níveis 5/15/25/35/45
  (teto de 200 por mês, AGENTS.md §5), um móvel raro da loja a cada 10 níveis e um épico no 50.
- **Premium:** recompensas em dobro, 1 feijão mágico a cada 10 níveis, um móvel Premium nos outros
  múltiplos de 5 e, no nível 50, o **pet mítico do mês** (um pet do catálogo recolorido com a cor do
  tema, ex.: "Fadinha Abissal") e o **título mítico do mês** (ex.: "Lenda de Outubro 2026"). Os dois
  nunca voltam e não são negociáveis.
- O resgate entrega tudo o que já foi liberado. Se a mochila estiver cheia, os itens ficam guardados
  no Passe. O mês anterior ainda pode ser resgatado por 7 dias.

## Pagamento do Premium (R$ 5)
- O botão **Quero o Premium** leva a `/passe?token=…`, um link assinado (HMAC) com o id da pessoa e
  o mês, válido por 2 horas.
- **Mercado Pago** (Pix e cartão, Brasil): Checkout Pro. O webhook `/api/pass/webhook/mercadopago`
  confere a assinatura `x-signature` (se `MERCADOPAGO_WEBHOOK_SECRET` existir) e busca o pagamento
  na API do Mercado Pago antes de liberar. Quem usa Nubank paga pelo Pix do Mercado Pago (o Nubank
  não tem API de cobrança para terceiros).
- **Pix direto (manual):** o Criador libera pelo `/admin` → Módulos → Passe da Pyxie → Configurar.
- Cada pagamento é registrado pelo id (avisos repetidos não liberam duas vezes). A pessoa recebe
  uma DM quando o Premium é liberado.
- Sem credenciais, cada forma de pagamento fica desligada e o site mostra "em breve".

Variáveis: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `PASS_PUBLIC_URL`,
`PASS_TOKEN_SECRET`.

## Arquivos
- `src/services/battlePass.js`: calendário, trilhas do mês, XP, resgate, Premium e estatísticas
  (`data/battlePass.json`). Pet e título do mês são gerados a partir do id
  (`homeCatalog.getItem('pass_pet_AAAA_MM')`, `economy.getTitleDefinition('pass_title_AAAA_MM')`).
- `src/services/passPayments.js`: link assinado e Mercado Pago.
- `passViews.js` e `commands/pyPass.js`: telas e botões `bp:*`.
- `public/passe.html`: página bilíngue do Passe; termos na seção 6 de `/termos`.

## Painel e site
`getStatus()` aparece na aba Módulos do `/admin` (com o modal de métricas e liberação manual);
`/api/public/system-truth` expõe `milestones.battlePass`.
