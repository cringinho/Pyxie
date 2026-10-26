# Módulo Festival da Temporada

Temporadas globais que abrem sozinhas pelo calendário (horário de Brasília), com uma moeda
própria: as **Fagulhas** 🎇 (*Sparks* em inglês). Faz parte do Mundo Pyxie: some quando o
servidor está no modo clássico (`/py-setup`).

Não confundir com o módulo `seasonal` (evento da Cringelândia com as Abóboras): o Festival vale
para todos os servidores e não mexe nele.

## Temporadas
| Temporada | Janela | Itens |
| :--- | :--- | :--- |
| 🏖️ Férias de Verão | 15/01 a 15/02 | pets do mar, piscina, sorvetes |
| 🐰 Caça aos Ovos | 14 dias antes até 7 depois da Páscoa | coelhinhos, ovos, flores |
| 🎃 Noite das Abóboras | 15/10 a 05/11 | fantasminhas, abóboras, piano assombrado |
| 🎄 Natal Encantado | 08/12 a 28/12 | renas, iéti, árvore, lareira |
| 🎆 Virada Estrelada | 29/12 a 10/01 | fogos, relógio da contagem, brindes |

Os itens de temporada (`source: 'festival'` no catálogo da Casinha) só saem das caixas enquanto a
temporada está aberta. Depois, só no mercado. Todos são negociáveis.

## Como ganhar Fagulhas
- **Catacumbas:** cerca de 20% das descidas em temporada vêm com monstros fantasiados (chapéu de
  bruxa, gorro de Natal, orelhas de coelho, chapéu de festa ou de palha desenhados por cima). Cada
  monstro vale 1 Fagulha e cada guardião 3, creditadas no fim da descida.
- **Trabalho:** 5% de chance de 1 a 3 Fagulhas em cada turno certo do `/py-work`.
- **Mercado:** Fagulhas são vendidas em lote no `/py-market`, como os materiais da oficina.

Fagulhas nunca viram moedinhas (AGENTS.md §5).

## Caixas (`/py-festival`)
| Caixa | Preço | Comum | Incomum | Raro | Épico | Lendário | Garantia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Caixa da Temporada | 25 Fagulhas | 52% | 30% | 13% | 4,5% | 0,5% | épico a cada 15 |
| Baú de Moedinhas | 450 moedinhas | 62% | 29% | 8% | 1% | — | raro a cada 10 |

- As chances e a lista completa de prêmios ficam no botão **Chances** do comando.
- Raridade que a temporada não tem passa a chance para a raridade de baixo.
- A garantia é por temporada (cada edição anual começa do zero).
- O Baú de Moedinhas tem limite de 5 por dia e as moedinhas saem da economia.
- Se a mochila estiver cheia ou a entrega falhar, nada é cobrado.

## Arquivos
- `src/services/festival.js`: calendário, carteira de Fagulhas, caixas, garantia e estatísticas
  (`data/festival.json`).
- `festivalViews.js`: vitrine, chances e prêmio.
- `commands/pyFestival.js`: comando e botões `fest:*`.
- Ganchos: `dungeonStore.startRun` (fantasia), `dungeonEngine.winCombat` (Fagulhas por monstro),
  `dungeonStore.settleRun` (crédito), `trabalho.js` (drop de 5%), `market.js` (lotes de Fagulhas),
  `dungeonRenderer.js` (chapéus).

## Painel e site
`getStatus()` aparece na aba Módulos do `/admin`; `/api/public/system-truth` expõe
`milestones.festival` (temporada, Fagulhas em circulação, caixas abertas e moedinhas retiradas).
