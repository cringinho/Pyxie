# Plano de renda passiva do ecossistema Pyxie

Escrito em 12/11/2026. Ponto de partida: os anúncios da Shopee não estão rendendo como deveriam e ela é a principal fonte de renda.

> **Atualização:** a Shopee é a principal fonte de renda. Seção 1 e Pilar H foram refeitos em torno dela.
>
> **Aviso de honestidade.** Quem escreveu este plano não vê o tráfego, as assinaturas nem os cliques de produção. Os números abaixo são **cenários para fazer conta**, não previsões. Cada pilar tem uma "métrica que decide" para você conferir com dados reais antes de gastar tempo.

---

## 1. A Shopee é o pilar. O que está travando o resultado

Atualização de 12/11/2026: a Shopee é a **principal fonte de renda**, então o plano parte dela e as outras fontes ficam como reforço. A primeira versão deste plano tratava a Shopee como complemento e estava errada. A análise abaixo vem do catálogo e do código atual (`src/data/shopee.json`, `ShopeeBentoGrid`, `shopeeContext`).

**O que os dados mostram**

| Achado | Impacto |
|---|---|
| **38 dos 58 produtos estão desligados** (`active: false`). Só 20 aparecem. | Mais da metade do catálogo não rende nada |
| **Última checagem de preço/estoque: até 47 dias atrás.** | Link de produto esgotado ou preço velho perde a venda |
| A vitrine do site mostra **4 produtos sorteados** (`slice(0, 4)`) e **não registra cliques**. | Você não sabe o que funciona e o melhor produto aparece por sorte |
| O widget do blog usa UTM, mas **a vitrine do site não**. | Relatório da Shopee não diz de onde veio a venda |
| **Quem tem prova social rende pouco por venda; quem rende muito não tem prova.** Pelúcia Kuromi: 2 mil+ vendas e `R$ 5,04` (9%). Camiseta Goth: 521 vendas e `R$ 12,78` (16%). Almofada Hello Kitty: `R$ 50,37` (28%) com 0 vendas. | Vitrine sorteada ao acaso trata tudo igual |
| A comissão no catálogo vai de **9% a 48%**. Sanrio MINISO ~23%, Hello Kitty/Kuromi roupas ~26-33%, K-pop 38-48%. | Escolher a categoria certa vale mais que mais cliques |
| O widget do blog sugere produtos de **autismo/setup/tecnologia**, mas o catálogo é **Sanrio/gótico/K-pop**. | Produto e público não combinam no blog |

**Em uma frase:** o gargalo não é só o tráfego. É catálogo parado, vitrine aleatória e zero medição.

---

## 2. Princípios (não negociáveis)

- **Nada de pay-to-win.** Já é regra (AGENTS §5, `PLANO-PLANOS-E-PARCERIAS.md`): sem multiplicador de moedas por plano e sem vender moeda do jogo. Vende-se **conveniência, aparência e apoio**.
- **Passivo de verdade = automático.** Pix/Mercado Pago com webhook, entrega sem você. O que exige atendimento manual não entra.
- **Comunidade segura primeiro** (AGENTS §12). Nada de anúncio que atrapalhe leitura em páginas de acolhimento ou crise.
- **Medir antes de construir.** Cada pilar começa com uma coleta barata.

---

## 3. Os pilares (o H, Shopee, vem primeiro na prática; os demais são reforço)

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

### Pilar H. Shopee como motor principal (o foco)
Objetivo: ganhar mais por clique que já existe e colocar o link onde a pessoa deseja comprar.

**H1. Catálogo vivo**
- Rodar a checagem de disponibilidade nos 58 produtos (o gestor já tem a função) e **reativar os que estão de pé**. Meta: 60 a 100 produtos ativos.
- Checagem **automática semanal**, com aviso no painel quando um produto cai. Produto esgotado sai da vitrine sozinho.
- Cadastrar em lote (colar links) para o catálogo crescer sem esforço.

**H2. Ranking por ganho esperado, não sorteio**
- Ordenar a vitrine por `comissão em reais × força da prova social` (vendas, avaliação), e **sorteio só dentro do topo**.
- Dois papéis no mesmo bloco: **isca** (alta venda, ex.: pelúcia Kuromi) e **destaque** (comissão alta, ex.: almofada e roupas Sanrio).
- Mostrar mais de 4 produtos e agrupar por categoria ("Pelúcias", "Roupas", "Chaveiros").

**H3. Medir de ponta a ponta**
- Registrar o **clique por produto, por página e por posição** (o motor de analytics já aceita `shopee_click`).
- Colocar **UTM e sub-ID** em todo link (blog, vitrine, Pinterest, Discord, tarô). Se o painel de afiliados da Shopee aceitar sub-ID, é ele que liga o clique à venda no relatório.
- Painel do dono: cliques, páginas que mais levam à Shopee e **comissão por origem**, comparando com o relatório da Shopee.

**H4. Onde a intenção de compra existe**
- **Pinterest é rede de busca de produto.** Fazer pins **do próprio produto** ("look gótico Kuromi", "setup Sanrio") levando a uma **página de achadinhos** no site com o link de afiliado. O pipeline de pins já existe.
- **Páginas de tarô e do museu**: bloco "combina com" (baralhos, cadernos, lápis, decoração).
- **Discord (Cringelândia)**: "achadinho da semana" com a voz da Pyxie, em canal opcional, criado no estúdio de mensagens. Nada de spam e sempre marcado como link de afiliado.
- **Casinha e perfil**: itens do jogo com "tem na vida real" apontando o produto parecido.

**H5. Calendário da Shopee**
- As datas grandes concentram as compras: **Black Friday (27/11)**, **12.12**, **Natal** e as campanhas mensais. Pins e achadinhos precisam estar prontos **antes** (o Pinterest leva semanas para indexar).
- Este ano ainda dá tempo de preparar a Black Friday e o Natal. Começa por esse recorte.

**H6. Regras da casa**
- Sempre `rel="sponsored nofollow"` e aviso claro de que é link de afiliado (já é o padrão no blog).
- **Confirme nos termos do programa de afiliados da Shopee** onde os links podem ser divulgados e se há restrições (anúncios pagos, redes sociais, grupos). Eu não afirmo as regras vigentes: elas mudam.
- Nada de produto em áreas de acolhimento ou crise (AGENTS §12).

**Já entregue (12/11/2026): link rotativo `/go`.**
- `/go` leva a um produto diferente a cada clique (sorteio ponderado por comissão em reais x prova de venda, sem repetir os últimos 6). `/go/<id>` leva ao produto pedido, ou a outro se ele caiu. Só segue para endereços da Shopee.
- O clique é contado no servidor por produto, origem (`?src=bonus`, `?src=pin`, `?src=discord`) e dia, em `data/shopeeClicks.json`, e aparece em `GET /api/admin/shopee` (campo `clicks`). Não depende de UTM no link curto.
- **Portal de bônus (10 s):** o modo padrão agora é **forçado**: ao resgatar, a pessoa recebe as moedas do bônus de sempre e a Shopee abre sozinha em 2 s, sem cancelar. Antes do clique, a página avisa em PT/EN que o resgate leva à Shopee por link de afiliado. Modo no `.env` (`SHOPEE_BONUS_REDIRECT`): `forced` (padrão), `auto` (6 s, dá para cancelar), `button` (botão opcional) ou `off`. A moeda não é nova: continua 1 vez por dia, com espera de 10 s conferida no servidor.
- **Risco assumido pelo dono:** prêmio ligado ao clique em link de afiliado pode ser tratado como tráfego incentivado pelo programa. Se a Shopee reclamar, volte para `button` ou `off` no `.env` e reinicie.
- Variedade automática de verdade (puxar produtos novos sozinho) precisa de uma API de afiliados com credenciais; hoje o catálogo cresce por cadastro em lote. Reativar os 38 produtos desligados também aumenta a variedade na hora.

**Métrica que decide:** comissão por mil visitas (RPM de afiliado) por página e por origem.

### Pilar I. Reforço contra a dependência de uma plataforma
Renda concentrada em um programa é frágil: se as regras ou as comissões mudarem, cai tudo de uma vez. Por isso os pilares A a F continuam no plano, **como seguro**, e não como substituição. Tente chegar a algo como 70% Shopee e 30% outras fontes, e acompanhe isso mês a mês.

---

## 4. Ordem de execução (Shopee primeiro)

| Quando | Entrega | Esforço | Por que primeiro |
|---|---|---|---|
| **Esta semana** | Rodar a checagem nos 58 produtos e reativar os que estão de pé | Baixo | Dinheiro parado: 38 produtos desligados |
| **Esta semana** | Registrar cliques por produto/página e colocar UTM na vitrine | Baixo | Sem medir você não sabe onde melhorar |
| **Antes da Black Friday (27/11)** | Vitrine ranqueada por ganho esperado + página de achadinhos + pins de produto | Médio | Pico de compra mais próximo |
| **Dezembro** | Achadinho da semana no Discord; bloco "combina com" no tarô e no museu | Médio | Natal e 12.12 |
| **Janeiro** | Painel de comissão por origem e relatório de funil | Médio | Decidir com dado onde dobrar a aposta |
| **Em paralelo, sem pressa** | Plano anual, apoio mensal, cosméticos, destaque pago | Baixo-médio | Seguro contra depender de um programa só |
| **Quando houver volume** | Anúncios display | Baixo | Só compensa com tráfego |

---

## 5. O que o dono precisa decidir (fora do código)

1. **Formalização:** renda recorrente por Pix/cartão pede **MEI/CNPJ** e atenção a limites e imposto. Vale conversar com contador antes de crescer.
2. **Arte própria vs. terceiros:** produtos digitais só com direitos claros.
3. **Preço:** testar R$ 7 e R$ 20 contra o anual; manter promessa de "plano vencido volta ao Free sem apagar nada".
4. **Quanto tempo semanal** quer dedicar. Passivo ≠ zero: cosmético sazonal pede arte nova, parceria pede olhar.

---

## 6. O que o código pode entregar (se aprovar)

Em ordem de prioridade:
1. **Checagem automática semanal do catálogo da Shopee**, reativação dos links vivos e aviso de produto caído.
2. **Rastreio de cliques** por produto, página e posição, com UTM e sub-ID em todo link.
3. **Vitrine ranqueada** por ganho esperado, com mais de 4 produtos e grupos por categoria.
4. **Página `/achadinhos`** (PT/EN, SEO, `rel="sponsored"`) para os pins do Pinterest apontarem.
5. **Painel do dono**: cliques e comissão estimada por origem.
6. **Bloco "combina com"** nas páginas de tarô e do museu.
7. **Achadinho da semana** como mensagem periódica opcional na Cringelândia.
8. Depois: plano anual, apoio mensal e destaque pago (seguro contra depender de uma plataforma só).

Cada item segue as regras da casa: bilíngue PT/EN, teste na suíte, painel antes do site, nada fora de lugar.
