# Módulo Mercado entre Jogadores

Compra e venda de itens da Casinha e materiais da oficina entre as pessoas, com garantia.
Faz parte do Mundo Pyxie: some quando o servidor está no modo clássico (`/py-setup`).

## Como funciona
- **Comando:** `/py-market` (ou `py!mercado`, `py!feira`, `py!trade`) abre a vitrine em privado.
- **Anunciar:** escolha um item negociável que não esteja à mostra na Casinha (ou um material) e
  diga o preço. O item sai da mochila na hora (garantia) e fica 7 dias na vitrine. Dá para
  anunciar só para uma pessoa (oferta particular).
- **Comprar:** o anúncio sai da vitrine antes da cobrança, então dois cliques nunca compram duas
  vezes. Se faltar moedinha ou a entrega falhar, tudo volta ao lugar.
- **Taxa:** `5%` de cada venda (mínimo 1) sai da economia (AGENTS.md §5). Quem vende recebe o resto
  e um aviso por DM.
- **Limites:** até 10 anúncios por pessoa; preço entre 1 e 1.000.000.
- **Histórico de preços:** última venda, média de 7 dias e gráfico de 30 dias, no bot e na página
  pública `/mercado` do site (`/api/market/prices`).

## Itens que não entram no mercado
Itens de conquista e do kit inicial ficam vinculados à conta (`tradable: false` no catálogo).

## Arquivos
- `src/services/market.js`: anúncios, garantia, compra, vencimento e histórico (`data/market.json`).
- `marketViews.js`: vitrine, anúncio, venda de item e de material, meus anúncios e modais.
- `commands/pyMarket.js`: comando e interações `mkt:*`.
