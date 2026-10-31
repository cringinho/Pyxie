# Lojinha de Robux — kit de venda (`storeProducts`)

Serve o extra `lojinha` (R$ 3/mês) e a zona Mary. Implementa o que a operação real exige:
estoque que não vende o que não tem, entrega nos três formatos do mercado, order bump,
margem com a taxa de 30% do Roblox e alerta de estoque baixo.

Código: `src/services/storeProducts.js` · Rotas: `/api/dashboard/guilds/:id/store/*`
· Testes: `tests/storeProducts.test.js` (16 verificações).

## 1. Os três jeitos de entregar

| `delivery` | Como funciona | Estoque |
|---|---|---|
| `code` | fila de códigos/vouchers; cada venda tira o mais antigo | finito, controlado |
| `message` | link/mensagem fixa (ex.: link da gamepass) | ilimitado |
| `manual` | pedido fica `pending` até o dono confirmar | — |

`deliver()` devolve `{ order, stockCount, lowStock }`. Pedido que não sai (`failOrder`)
**devolve o código para a frente da fila** — o produto não se perde.

## 2. Matemática do Robux (a parte que quase todo mundo erra)

- O Roblox retém **30%**: para o cliente receber `X`, a gamepass tem de custar `ceil(X/7*10)`.
- `robuxNet(gross)` e `robuxGrossFor(net)` usam **inteiros** (`n*7/10`, `n*10/7`). Com
  float, `700/0.7` vira `1000.0000001` e o preço sai R$ 0,01 errado em cima de cada venda.
- `suggestPriceCents(robux)` usa a tabela de mercado (400 → R$ 12–15, 800 → R$ 22–27,
  1.700 → R$ 45–55, 4.500 → R$ 110–135) e, fora dela, o preço de 1k configurado.
- `margin({ priceCents, costCents, feeCents })` devolve lucro, `%` e `healthy` (≥ 20%).

## 3. Order bump

`orderBumpFor(guildId, id)` sugere o próximo pacote maior (ou o `orderBumpId` configurado),
com `deltaCents` e `savingsPercent`. É o que sobe ticket médio sem esforço — dado, não
achismo: quanto o cliente economiza aparece na conta.

## 4. Estoque

- `addStock` ignora código repetido (não vende o mesmo código duas vezes) e trava em `MAX_STOCK`.
- `minStock` por produto; `stockReport()` devolve `low` + `needsAttention`.
- `takeStock` é atômico (`withFileLock`): duas vendas simultâneas não pegam o mesmo código.

## 5. Rotas do painel (só dono / zona Mary / extra ativo)

```
GET    .../store/products              produtos + estoque + vendas + últimos pedidos
PUT    .../store/products              cria/atualiza (nome, preço, custo, robux, entrega)
DELETE .../store/products/:productId
POST   .../store/products/:id/stock    { codes: [...] } (ou { text: "um por linha" })
GET    .../store/products/public       catálogo sem códigos nem custo
POST   .../store/orders/:id/confirm    dono confirma entrega manual
POST   .../store/orders/:id/fail       devolve código e marca falha
POST   .../store/price                 { robux, per1kCents, costCents } → gamepass + margem
```

## 6. Segurança e honestidade (não negociável)

- `publicCatalog` **nunca** devolve `stock` nem `costCents` — vazar custo mata a margem
  e vazar código entrega o produto de graça.
- Vender Robux fora do canal oficial **pode violar os termos do Roblox** e derrubar contas.
  A loja é do dono do servidor: a Pyxie entrega o que ele configurou. O painel deve manter
  o aviso de risco e o canal de provas (§12: comunidade segura, sem incentivo a golpe).
- Não existe "Robux de graça por convite": se um servidor promete isso, é golpe. A lojinha
  não cria esse tipo de oferta.

## 7. O que falta

1. Botões de compra no painel do Discord (hoje a venda é confirmada pelo dono).
2. Card na aba **Planos** do `client/` consumindo `/store/products`.
3. Alerta automático de estoque baixo por DM (o dado já existe em `stockReport`).
