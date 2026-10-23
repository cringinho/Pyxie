---
name: discord-minigame-module
description: "Constrói minigames longos e interativos por botões como módulos da Pyxie (src/modules/<id>/): motor puro e determinístico, persistência atômica com travas econômicas, cena pixel art no canvas, embeds bilíngues e simulação de balanceamento. Utiliza-se ao criar ou alterar jogos com várias etapas, apostas ou recompensas em moedinhas (ex.: /py-dungeon)."
---

# Protocolo de Minigame Modular (referência: `src/modules/dungeon/`)

## 1. Separação em camadas

| Arquivo | Papel | Regra |
| --- | --- | --- |
| `<id>Data.js` | Conteúdo do jogo | Todo texto em pares `{ pt, en }`; emojis por chave do `appEmojis.js` |
| `<id>Engine.js` | Regras puras | Sem I/O, sem `Date.now()` escondido, sem `Math.random()` |
| `<id>Store.js` | Persistência e economia | `writeJsonAtomic` em `data/<id>.json`, travas do AGENTS.md §5 |
| `<id>Views.js` | Embeds, botões e textos da cena | Só `t()` e `localized()`; AGENTS.md §9 |
| `<id>Renderer.js` | Imagem (`@napi-rs/canvas`) | Recebe textos já localizados; nunca escreve palavras fixas |
| `commands/py<Id>.js` | Slash, prefixo e roteador de botões | Aliases PT e EN, `setDescriptionLocalizations` |

## 2. Motor determinístico
- Guarde o estado do RNG (ex.: mulberry32) dentro do próprio run. Sair e voltar nunca rerrola um resultado.
- Exponha `getAvailableActions(run)` e faça `applyAction` recusar, sem mutar nada, qualquer ação fora dessa lista.
- Registre a narrativa como entradas estruturadas `{ k, p }`. As views traduzem com `t('<ns>.log.<k>')`, e um teste confere que toda chave usada no motor existe em PT e EN.
- Incremente `run.step` a cada ação válida.

## 3. Botões seguros
- Formato do customId: `<prefixo>:<tipo>:<dono>:<tag do run>:<step>:<ação>[:<arg>]`, com no máximo 100 caracteres.
- Clique de outra pessoa: resposta privada (`flags: 64`).
- Step ou run divergente: atualize a mensagem para o estado real em vez de só recusar.
- Registre o listener no `onLoad` com `ctx.registerListener('interactionCreate', ...)`. O profiler do moduleManager mede CPU e rede automaticamente.

## 4. Economia (AGENTS.md §5)
- Debite a entrada antes de criar o run e devolva-a se a gravação falhar.
- Ao liquidar, remova o run do arquivo **antes** de creditar. Guarde o crédito que falhar em `pendingPayout`.
- Aplique teto por run, teto diário e limite de entradas por dia (BRT, `src/utils/brtDate.js`).
- Deixe os ajustes em `data/modulesConfig.json` (`modules.<id>.data`), sanitizados por faixas e editáveis no modal do módulo no `/admin`.
- Antes de definir números, rode uma simulação com uma política heurística (milhares de runs por perfil: iniciante, hábil e com progressão). Ajuste até que jogar mal perca moedas e só o risco real dê lucro.

## 5. Visual mobile-first
- A cena tem 800x640, fonte mínima de 24px e contraste de 4.5:1. Use `ensureCanvasFonts()` e `withEmojiFallback()`.
- Personagens, inimigos e ícones vêm dos **Application Emojis do bot** (catálogo do Developer Portal em `src/data/discordAppEmojis.json`, mais de mil emojis). Escolha-os visualmente montando folhas de contato a partir da CDN (`https://cdn.discordapp.com/emojis/<id>.png?size=128`). Empacote os escolhidos em `assets/<id>/emojis` com um script de sincronização e mantenha a CDN e o glifo Twemoji apenas como reserva.
- Cuidado com emojis animados: a CDN entrega o primeiro quadro, que pode ser ruim (uma moeda girando aparece de lado). Prefira versões estáticas.
- Desenhe emojis e artes ilustradas na resolução original com `imageSmoothingQuality = 'high'`. Reduzir e ampliar sem suavização deixa as bordas serrilhadas. Reserve a ampliação sem suavização (`imageSmoothingEnabled = false`) para pixel art de verdade (ex.: `pyxie_pixelart.png`). Em sprites escuros sobre fundo escuro, use um brilho macio (`shadowBlur`) em vez de contorno em degrau.
- Antes de usar PNGs transparentes da Pyxie ou do Astaroth, passe `src/utils/spriteCleanup.js` (`scripts/clean_pyxie_assets.js`). Ele remove o halo claro da remoção de fundo e reconstrói a borda antisserrilhada. Não deixe o alfa binário em arte ilustrada.
- Botões podem usar emojis do bot, desde que exista uma reserva Unicode reenviada automaticamente quando o Discord responder 50035.
- Mantenha o render abaixo de ~150 ms com cache de sprites no módulo. Na view, faça `Promise.race` com um timeout para responder sem imagem se algo travar.
- Nas mensagens com imagem, envie `files` junto com `attachments: []` para substituir a cena anterior.

## 6. Sincronização tripla e homologação
- Registre os nomes e aliases no `COMMAND_CATEGORY_MAP`, os schemas no `embedRegistry.js` e os emojis no `appEmojis.js`.
- Exponha métricas reais em `visualDbExplorer.js` (Estado Global) e `truthReconciliationEngine.js` (`milestones`).
- Crie `scripts/dispatch_<id>_previews.js` usando `homologationPreviewDispatcher.js` (AGENTS.md §11).
- Escreva `tests/<id>.test.js` e inclua-o no `npm test`. Cubra o mapa ou estado, o determinismo, a economia (ticket, tetos, duplo clique, liquidação única), embeds e botões (títulos de até 8 palavras, rótulos de até 34 caracteres), o renderizador, o fluxo completo com interações mock e o hook `.agents/hooks/pre-tool-validator.sh`. Faça backup e restaure `data/economy.json`.
