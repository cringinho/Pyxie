# Módulo Casinha da Pyxie

Quarto em pixel art que cada pessoa decora com móveis, decoração de parede, tapetes, pets,
papéis de parede e pisos. Visto de cima, no estilo das casinhas de RPG.

## Como funciona
- **Entrada:** `/py-home` (ou `py!casa`, `py!casinha`, `py!home`, `py!quarto`). Com `user:`
  (ou mencionando alguém no prefixo) você visita a casinha de outra pessoa.
- **Kit inicial:** a primeira abertura entrega e monta um cantinho: janela, vela, mesinha,
  cadeira, passadeira, vasinho, caminha e o **Astaroth Pequenino** (pixel art própria).
- **Decorar:** escolha um item da mochila, mova com as setas (↔️ espelha) e coloque. Pets podem
  deitar em caminhas e pufes. **Arrumar** mexe no que já está no quarto (mover ou guardar).
- **Quarto:** 12 colunas, parede com 2 fileiras e piso com 6. Até 48 itens e 6 pets.
- **Luz:** segue o horário de Brasília. À noite o quarto escurece e velas, lareira, orbes e
  pets mágicos brilham; de dia as janelas iluminam.

## Economia (AGENTS.md §5)
- **Loja do dia:** 8 itens por moedinhas e 2 premium por feijões mágicos, sorteados pela data
  (igual para todo mundo) e trocados à meia-noite BRT. A loja é um dreno de moedinhas.
- **Premium:** 1 de cada item por dia. Feijões continuam premium e nunca são trocáveis.
- **Compra:** debita antes de entregar e devolve se a entrega falhar.
- **Nenhuma moeda sai da Casinha:** curtidas, visitas e Charme não pagam nada.

## Itens (`src/services/itemVault.js`)
- Cada item possuído é uma instância com origem (`shop`, `premium`, `dungeon`, `achievement`,
  `starter`). Lendários e míticos são **numerados** (#7); `maxSupply` cria tiragem limitada.
- `tradable` já está marcado em cada item para a fase de trocas: premium, conquistas e kit
  inicial são vinculados à conta.
- Origens: loja do dia, drops das Catacumbas (`src/modules/dungeon/dungeonDrops.js`) e
  conquistas (`src/services/achievements.js`).

## Charme
Soma da raridade de tudo que está à mostra (parede e piso incluídos), variedade, **conjuntos**
(4+ peças do mesmo tema: Jardim Secreto, Sonho Lilás, Gótico Fofo, Salão Real…), luz, pets e
curtidas recebidas (1 por visitante por dia). O ranking fica no botão **Ranking**.

## Arte
Folhas CC0 em `assets/home/sheets` (Kenney, Clint Bellanger, OpenGameArt), créditos em
`assets/home/CREDITS.md`. Variantes de cor são recolorações seletivas (`homeSprites.js`) e os
papéis de parede, pisos e gatinhos são pixel art desenhada no próprio código.

## Arquivos
| Arquivo | Papel |
| --- | --- |
| `homeCatalog.js` | Itens, raridades, conjuntos, kit inicial |
| `homeSprites.js` | Recorte das folhas, recoloração, padrões e pixel art própria |
| `homeEngine.js` | Geometria, validação de posição, Charme, loja do dia |
| `homeStore.js` | `data/homes.json`, compras, curtidas, visitas, ranking |
| `homeRenderer.js` | Cena 800x608 (quarto 4x, luz, cursor) e vitrines |
| `homeViews.js` | Embeds, botões e menus |
| `commands/pyHome.js` | Slash/prefixo e roteamento dos cliques (`home:*`) |

## Painel e API
- `getStatus()` alimenta a aba Módulos; o registro `home_state` aparece no Visual DB → Estado Global.
- `/api/public/system-truth` expõe `milestones.home` e `milestones.achievements`.
- Previews de homologação: `node scripts/dispatch_home_previews.js`.

## Doações (Pix livre)

- Botão próprio na loja do dia, em linha separada dos itens: R$ 5, 10, 25 ou 50.
- O Pix é gerado no Mercado Pago (30 min) e o apoio entra no ranking do mês e no registro público de transparência.
- Doar não dá vantagem no jogo, e quem escolhe anonimato não aparece com nome.
