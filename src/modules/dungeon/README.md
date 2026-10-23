# Módulo Catacumbas de Veludo (Dungeon Crawler da Pyxie)

Roguelike longo e difícil, fofo e sombrio, jogado por botões no Discord. A jogadora é a Pyxie,
acompanhada do Astaroth, descendo 5 andares procedurais em busca de ouro.

## Como funciona
- **Entrada:** `/py-dungeon` (ou `py!dungeon`, `py!masmorra`, `py!catacumbas`, `py!cripta`) abre o menu.
  Cada descida cobra um ticket de **50 moedinhas**.
- **Andares:** grade 7x7 gerada como árvore de salas (estilo Isaac), com névoa de guerra.
  Salas: monstro, baú (pode ser mímico), tesouro trancado, altar, mercadora, poça de luar, armadilha,
  estoque de velas e o **guardião** na ponta mais distante.
  1. Porão das Velas Tortas
  2. Biblioteca Sussurrante
  3. Jardim de Ossos
  4. Salão dos Espelhos Rachados
  5. Coração da Cripta, com a chefe final Nyx, a Mariposa Devora-Luz
- **Luz de vela:** cada sala gasta luz. Abaixo de 25 fica escuro: os monstros batem 25% mais
  forte e a névoa esconde tudo.
- **Combate por turnos:** a intenção do inimigo é sempre telegrafada. Ações: Atacar, Defender
  (bloqueio e +1 de brilho), Raio Lunar (ignora escudo), Patada do Astaroth (distrai e corta o
  próximo golpe pela metade), Poção e Fugir (não vale contra guardiões).
- **Bênçãos:** 16 amuletos que mudam o build. Você escolhe 1 de 3 após cada guardião e acha outros
  em tesouros, altares e na mercadora.
- **Fogueira:** depois de cada guardião você decide se desce mais fundo ou foge com o ouro.
  Fugir cedo paga a Taxa da Lanterna (30% no andar 1, 20% no 2, 10% no 3, 0% a partir do 4).
  Morrer salva só 10% do ouro.
- **Talentos (meta-progressão):** toda descida rende Ecos, mesmo na derrota. Ecos compram 6
  talentos permanentes e **nunca viram moedinhas**.

## Proteção econômica (AGENTS.md §5)
| Ajuste | Padrão | Faixa aceita |
| --- | --- | --- |
| `ticket` | 50 | 1 a 1000 |
| `dailyEntries` (descidas por dia, BRT) | 3 | 1 a 20 |
| `runPayoutCap` (teto por descida) | 500 | 0 a 5000 |
| `dailyPayoutCap` (teto por dia) | 600 | 0 a 20000 |
| `abandonAfterHours` | 48 | 1 a 720 |

- Os ajustes ficam em `data/modulesConfig.json` (`modules.dungeon.data`) e são editados no `/admin`
  em **Módulos → Catacumbas de Veludo → Configurar**. Valem na próxima descida, sem reiniciar o bot.
- O ticket é debitado antes de criar o run. Se a gravação falhar, ele é devolvido.
- Cada botão carrega o `step` do run: cliques duplos e botões antigos são recusados e a tela se atualiza.
- O run sai de `data/dungeon.json` antes do crédito, então uma liquidação nunca paga duas vezes.
  Um crédito que falhe fica em `pendingPayout` e entra na próxima abertura do menu.
- O RNG (mulberry32) fica salvo no run, então sair e voltar não rerrola nenhum resultado.
- Runs parados além do limite são encerrados como "resgatados pelo Astaroth", com 10% do ouro.

Na simulação de balanceamento (2000 runs por perfil), uma iniciante sem talentos recebe em média ~21
moedinhas por ticket de 50. Sem talentos, quem joga bem ainda perde um pouco. Com talentos e risco
profundo o retorno fica entre ~100 e ~200 por descida, e só ~9% das descidas de quem tem talentos no
máximo vencem a Nyx.

## Arquivos
- `dungeonData.js`: conteúdo bilíngue (andares, inimigos, amuletos, talentos, salas vazias).
- `dungeonEngine.js`: motor puro e determinístico (mapa, eventos, combate, liquidação).
- `dungeonStore.js`: persistência atômica, ticket, limites, tetos, talentos e métricas.
- `dungeonViews.js`: embeds, botões e textos localizados da cena.
- `dungeonRenderer.js`: cena pixel art 800x640 (`@napi-rs/canvas`) com os assets da Pyxie e do Astaroth.
- `commands/pyDungeon.js`: comando e roteador de botões (`dgn:*`).

## Painel, API e testes
- Métricas reais: `getDungeonStats()` no `/admin` (modal do módulo), no registro `dungeon_state`
  do Visual DB e em `milestones.dungeon` de `/api/public/system-truth`.
- Preview obrigatória: `node scripts/dispatch_dungeon_previews.js [pt|en]` envia as telas para o
  canal de homologação.
- Testes: `tests/dungeonCrawler.test.js`, incluído no `npm test`.
