# Plano de renda passiva do ecossistema Pyxie

Escrito em 12/11/2026. Ponto de partida: os anúncios da Shopee não estão rendendo.

> **Aviso de honestidade.** Quem escreveu este plano não vê o tráfego, as assinaturas nem os cliques de produção. Os números abaixo são **cenários para fazer conta**, não previsões. Cada pilar tem uma "métrica que decide" para você conferir com dados reais antes de gastar tempo.

---

## 1. Por que a Shopee não rende (diagnóstico)

Pelo que está no código (`src/data/shopee.json`, `ShopeeBentoGrid`):

1. **Comissão pequena por venda.** Exemplo do catálogo: pelúcia de R$ 55,99 com 9% rende `R$ 5,04`. Para ganhar R$ 500/mês seriam ~100 vendas.
2. **Pouco catálogo.** Dos 58 produtos, só 20 estão ativos.
3. **Intenção de compra baixa.** Quem está no Discord ou no Pinterest veio brincar, não comprar. A conta típica de afiliado é 1 a 2 compras a cada 100 cliques (hipótese a medir), ou seja, ~5 a 10 mil cliques/mês para R$ 500.
4. **Anúncio solto.** A vitrine fica na Home, no Bônus e em Parcerias, longe do momento em que a pessoa deseja a coisa (carta de tarô, obra do museu, fala da Pyxie).

**Conclusão:** Shopee vira **complemento**, não pilar. O pilar precisa ter margem alta e repetição.

---

## 2. Princípios (não negociáveis)

- **Nada de pay-to-win.** Já é regra (AGENTS §5, `PLANO-PLANOS-E-PARCERIAS.md`): sem multiplicador de moedas por plano e sem vender moeda do jogo. Vende-se **conveniência, aparência e apoio**.
- **Passivo de verdade = automático.** Pix/Mercado Pago com webhook, entrega sem você. O que exige atendimento manual não entra.
- **Comunidade segura primeiro** (AGENTS §12). Nada de anúncio que atrapalhe leitura em páginas de acolhimento ou crise.
- **Medir antes de construir.** Cada pilar começa com uma coleta barata.

---

## 3. Os pilares (do mais forte ao mais fraco)

### Pilar A. Assinaturas recorrentes (a base)
**Já existe:** Básico R$ 7/mês, Premium R$ 20/mês, Lojinha R$ 3/mês, cobrança por Pix e cartão recorrente, cobrança com aviso D-7/D-3/D-0.
**O que falta é conversão, não código.** Ideias:
- **Plano anual com desconto** (ex.: 10 meses pagos por 12): entra dinheiro de uma vez e reduz cancelamento.
- **Prova do valor na hora certa:** aviso no painel quando o servidor chega a um limite que o plano resolve (ex.: usa muitas automações).
- **Página `/planos` com comparativo e perguntas frequentes** (SEO, já existe a base).
- **Gancho para donos de servidor:** o que já funciona para *eles* (lembrete de bump, automações, estúdio de mensagens) é o produto. A Cringelândia é a vitrine ao vivo.

Cenário só para conta: 20 Premium + 50 Básico + 30 Lojinha = `R$ 400 + R$ 350 + R$ 90` = **R$ 840/mês**.
**Métrica que decide:** quantos servidores ativos veem o painel e quantos clicam em "planos" (taxa de conversão).

### Pilar B. Cosméticos e passe por dinheiro real
**Já existe:** Passe mensal com trilha premium (Mercado Pago/PayPal).
**Expandir (sem vantagem de jogo):**
- **Pacotes sazonais de aparência:** temas de perfil, molduras de Casinha, cores, títulos de colecionador. Uma vez feito, vende todo mês.
- **Edições limitadas por tempo** (Natal, Halloween, aniversário da Pyxie). Escassez real, sem custo extra.
- **Passe de presente:** o amigo compra para o amigo. O custo de convencer cai.
**Métrica que decide:** taxa de compra do Passe entre quem chegou ao nível 10 no passe grátis.

### Pilar C. Apoio recorrente
**Já existe:** doação Pix avulsa, ranking e transparência.
**Melhorar:** virar **apoio mensal** (Mercado Pago recorrente) com um selo no perfil e nome no ranking. O dinheiro avulso é imprevisível, o mensal é renda.
**Métrica que decide:** quantas doações avulsas por mês você tem hoje. Se for pouco, o mensal ajuda pouco. Veja antes.

### Pilar D. Produtos digitais (custo zero por venda)
Faz uma vez, vende para sempre, entrega automática por Pix:
- **Pacotes de papéis de parede e stickers** (Pyxie, Kuromi-estilo próprio, tarô).
- **Emojis para servidores** (pacotes temáticos).
- **Kit "meu servidor aconchegante"** (templates de canais, regras e mensagens prontas do estúdio).
- **Baralho de tarô da Pyxie em PDF** para imprimir.
Cuidado de direitos: nada que copie arte de terceiros. Só o que for **arte original** (da Mary, sua ou de artistas com acordo por escrito).
**Métrica que decide:** pedidos espontâneos nos tickets e no museu ("tem em alta resolução?").

### Pilar E. Tráfego orgânico que paga (Pinterest + SEO)
**Já existe:** páginas de cartas de tarô PT/EN, feed e pins do Pinterest, museu, wiki. É o ativo que **cresce sozinho**.
Duas formas de monetizar:
1. **Afiliados contextuais** (a evolução da Shopee): na página de cada carta, "baralhos e livros de tarô" (Amazon, Mercado Livre, Shopee). Na obra do museu, "materiais de desenho". Combina com o que a pessoa está lendo.
2. **Anúncios display (ex.: AdSense)** só em páginas de conteúdo longo e **nunca** em acolhimento, crise ou museu. Em português o valor por mil visualizações costuma ser baixo, então só vale com volume. Meta de referência: considerar a partir de ~50 mil visualizações/mês nessas páginas.
**Métrica que decide:** visualizações mensais das páginas de tarô e cliques de saída.

### Pilar F. Vitrine paga para outros servidores
**Já existe:** módulo de Parcerias.
**Ideia:** **destaque pago semanal** na vitrine de parcerias (valor fixo, reservado e pago por Pix, expira sozinho). Servidores e criadores já querem divulgação. Custo para você: zero depois de pronto.
**Métrica que decide:** quantos pedidos de parceria chegam hoje por mês.

### Pilar G. Recursos nativos do Discord (verificar elegibilidade)
O Discord tem **assinaturas e compras dentro do app** para bots. Há regras de região, verificação e taxa. **Confirme no Portal do Desenvolvedor se sua conta é elegível no Brasil** antes de planejar. Se for, vira mais um canal de venda do Pilar A com um clique.

### Pilar H. Afiliados e Shopee (o que sobra)
Mantém, mas:
- Reduz para os **8 a 12 produtos com melhor comissão e preço** (menos é mais).
- Move para **onde a pessoa deseja** (Pilar E).
- Troca por **produtos de ticket maior** (fandom Sanrio/gótico, setup).
- Compara com outros programas (Amazon, Mercado Livre) pelo mesmo produto.

---

## 4. Ordem de execução

| Quando | Entrega | Esforço | Por que primeiro |
|---|---|---|---|
| **Semana 1** | Medir: cliques da Shopee por página, visitas por página, funil de planos | Baixo | Sem isso o resto é chute |
| **Semanas 1-2** | Plano anual com desconto + faixa "apoio mensal" | Baixo-médio | Usa Pix e Mercado Pago que já existem |
| **Semanas 2-4** | Afiliados contextuais nas páginas de tarô; enxugar Shopee | Médio | Aproveita o tráfego do Pinterest |
| **Mês 2** | Pacote sazonal de cosméticos (Natal/Verão) | Médio | Passe e Casinha já têm a estrutura |
| **Mês 2-3** | Destaque pago na vitrine de parcerias | Médio | Dinheiro de terceiros, entrega automática |
| **Mês 3** | Produtos digitais (primeiro pacote) | Médio-alto | Depende de arte pronta |
| **Quando houver volume** | Anúncios display | Baixo | Só compensa com tráfego |

---

## 5. O que o dono precisa decidir (fora do código)

1. **Formalização:** renda recorrente por Pix/cartão pede **MEI/CNPJ** e atenção a limites e imposto. Vale conversar com contador antes de crescer.
2. **Arte própria vs. terceiros:** produtos digitais só com direitos claros.
3. **Preço:** testar R$ 7 e R$ 20 contra o anual; manter promessa de "plano vencido volta ao Free sem apagar nada".
4. **Quanto tempo semanal** quer dedicar. Passivo ≠ zero: cosmético sazonal pede arte nova, parceria pede olhar.

---

## 6. O que o código pode entregar (se aprovar)

- Painel do dono: **funil** (visitas → clique em planos → pagamento) e **cliques de afiliado por página**.
- **Plano anual** no catálogo de planos (`guildPlans.js`) com o mesmo webhook.
- **Apoio mensal** com selo (preapproval do Mercado Pago já suportado).
- **Bloco de afiliados contextual** nas páginas de tarô e do museu (PT/EN, `rel="sponsored"`, sem anúncio em páginas de acolhimento).
- **Destaque pago** no módulo de Parcerias.

Cada item segue as regras da casa: bilíngue PT/EN, teste na suíte, painel antes do site, nada fora de lugar.
