# 10. Layout no Discord: embeds e imagens geradas

> Nota da área: 6/10 · As Catacumbas são o modelo a seguir: embed limpo, cena legível e ícones todos no disco. O que pesa contra: a Galeria de Títulos quebra para quem tem muitos títulos, a home do Hyperfokus corta conteúdo no celular e o painel deixa trocar emojis de embeds que nenhum comando usa. O resto é estilo antigo (✦, CAIXA ALTA, números sem crases) em ajuda e perfil.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q181 | Título e seções do /py-help seguem o §9? | 🟡 PARCIAL | média |
| Q182 | Quantos títulos usam "emoji  ✦  texto"? | 🟡 PARCIAL | baixa |
| Q183 | Galeria de Títulos abre com muitos títulos? | 🔴 PROBLEMA | alta |
| Q184 | Tela de Títulos segue o §9 e usa t()? | 🟡 PARCIAL | baixa |
| Q185 | Avatar repetido no /perfil com card | 🟡 PARCIAL | baixa |
| Q186 | Embed de reserva do /perfil segue o padrão? | 🟡 PARCIAL | baixa |
| Q187 | Card de perfil legível no celular? | 🟡 PARCIAL | baixa |
| Q188 | Cena das Catacumbas legível e com fontes? | 🟡 PARCIAL | baixa |
| Q189 | Ícones da cena existem no disco? | ✅ OK | info |
| Q190 | Aviso quando a cena não chega a tempo | 🟡 PARCIAL | baixa |
| Q191 | Embed da partida respeita limites e §9? | ✅ OK | info |
| Q192 | Home do Hyperfokus cabe em 360px? | 🔴 PROBLEMA | alta |
| Q193 | Artigo e avisos pequenos legíveis? | 🟡 PARCIAL | baixa |
| Q194 | Trocar emoji de slot no painel muda o Discord? | 🔴 PROBLEMA | média |
| Q195 | Prévias do registro seguem §9 e bilíngue? | 🟡 PARCIAL | baixa |
| Q196 | Rota de slot valida embed, slot e emoji? | 🟡 PARCIAL | baixa |
| Q197 | Ajuda protegida contra o limite de 4096? | 🟡 PARCIAL | baixa |
| Q198 | Rostinho no rodapé automático e seguro? | ✅ OK | info |
| Q199 | Botões e rodapé da ajuda traduzidos e no domínio certo? | 🟡 PARCIAL | baixa |
| Q200 | Botões só com emoji são acessíveis? | 🟡 PARCIAL | baixa |

---

### Q181 — O embed do /py-help (Central de Ajuda) segue a regra §9 de título com um só emoji e seções com ### em vez de texto em CAIXA ALTA?

**Veredito:** 🟡 PARCIAL
**Severidade:** média
**Evidência:** `src/utils/i18n.js:1273` `"title": "{emoji}  ✦  Central de Ajuda — {label}"`; `src/utils/i18n.js:1275-1276` `"📖 **MÓDULOS E RECURSOS DO BOT**"` e `"📋 **COMANDOS DESTE MÓDULO ({count})**"`; `src/commands/commandHelpers.js:782` `(${(m.commands || []).length} ${isEn ? 'commands' : 'comandos'})` sem crases.
**Achado:** O título tem o emoji, um ✦ e espaços duplos. As seções usam negrito em CAIXA ALTA em vez de `###`. A contagem de comandos sai sem crases. A ajuda é a porta de entrada do bot e destoa do padrão novo.
**Recomendação:** Título "{emoji} Central de Ajuda: {label}". Cabeçalhos "### 📖 Módulos" e "### 📋 Comandos (`{count}`)". Números entre crases. Fazer o mesmo no bloco `en`.
**Revisão:** Rebaixado de PROBLEMA para PARCIAL. O ✦ (U+2726) não é emoji pela tabela Unicode, então a regra "um só emoji" não é quebrada ao pé da letra. O desvio é de estilo (CAIXA ALTA, crases), não um erro. A linha da contagem é a 782, não a 780.

### Q182 — Quantos títulos de embed fora da ajuda ainda usam o padrão antigo "emoji  ✦  texto"?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `grep -c "  ✦  " src/utils/i18n.js` = 82 linhas, todas em chaves de título (PT e EN somadas); em outros `.js` de `src/` são 64 linhas, 57 delas em `setTitle`/`title:` (ex.: `src/commands/perfil.js:339` Galeria de Títulos).
**Achado:** Cerca de 140 linhas de título usam "emoji + ✦". Como as 82 do i18n contam PT e EN, são uns 100 títulos diferentes. A identidade visual fica dividida entre telas novas (sem ✦) e antigas.
**Recomendação:** Troca em massa de "  ✦  " por um espaço nos títulos, nos dois idiomas. Um teste que falhe se um título tiver "✦".
**Revisão:** Rebaixado de PROBLEMA/média para PARCIAL/baixa. O ✦ não é emoji Unicode, então é inconsistência de estilo, não quebra direta do §9. A conta "quase 150 textos" exagerava: as linhas do i18n contam cada título duas vezes (PT e EN).

### Q183 — A Galeria de Títulos do /perfil continua abrindo quando a pessoa tem muitos títulos de conquista?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/commands/perfil.js:345` gera uma opção por título da loja; `src/commands/perfil.js:376-388` acrescenta uma opção por título de conquista, sem limite; `src/commands/perfil.js:395` `.addOptions(options)`; `src/services/economy.js:54-110` `TITLES_CATALOG` com 7 títulos; `src/data/achievementTitles.js` com 28 `id:`; `src/services/economy.js:430` títulos mensais do Passe (`pass_title_`). Não há `slice(0, 25)` no arquivo.
**Achado:** O menu do Discord aceita no máximo 25 opções. Com 7 da loja, quem tiver 19 ou mais títulos de conquista/Passe passa do limite e a tela de Títulos dá erro. Atinge os jogadores mais dedicados.
**Recomendação:** Paginar o menu (◀️ ▶️) ou dividir em dois menus, "Loja" e "Conquistas", cada um com até 25. Pôr o título equipado sempre na primeira página.
**Revisão:** Confirmado. Nenhum chamador (linhas 606, 658, 668, 691, 701) corta a lista antes. Severidade mantida: a tela some de vez para esses jogadores.

### Q184 — A tela de Títulos do /perfil mostra saldo, título equipado e rodapé no formato §9 (### , números em código, rodapé com servidor, textos via t())?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/commands/perfil.js:326` `` `${beanEmoji} **SEU SALDO**` ``; `src/commands/perfil.js:327` `**${account.magicBeans || 0} ${beanEmoji}**`; `src/commands/perfil.js:342` `.setFooter({ text: 'Pyxie' })`; `src/commands/perfil.js:309-335` textos fixos em ternário `isEn`.
**Achado:** O saldo sai em negrito, sem crases, com o emoji do feijão três vezes na mesma linha. Cabeçalhos em CAIXA ALTA. O rodapé não mostra o servidor. Os textos estão no código, fora do i18n, o que contraria o §1 ("zero texto fixo").
**Recomendação:** "### 🌱 Seu saldo" e "`12` feijões". Rodapé "Pyxie • {servidor}". Mover os textos para `t()`.
**Revisão:** Confirmado, mas rebaixado de média para baixa. A tela funciona e está nos dois idiomas; o problema é de acabamento.

### Q185 — No /perfil com card de imagem, o avatar aparece repetido e a miniatura aperta o texto no celular?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/commands/economyHelpers.js:157-160` `setAuthor({ iconURL: user.displayAvatarURL(...) })`; `src/commands/economyHelpers.js:163` `setThumbnail(user.displayAvatarURL(...))`; `src/commands/economyHelpers.js:168` `setImage('attachment://profile_card.png')`; o card desenha o avatar em `src/services/profileCardGenerator.js:639` `buildAvatar(...)`.
**Achado:** O mesmo avatar aparece três vezes: autor, miniatura e dentro do card. A miniatura à direita estreita a coluna de texto no celular.
**Recomendação:** Com card de imagem, tirar o `setThumbnail` e manter só o ícone do autor.
**Revisão:** Confirmado.

### Q186 — O embed de reserva do /perfil (quando o card de imagem falha) segue o mesmo padrão visual e bilíngue do resto?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/commands/economyHelpers.js:141` `` `**🔮 ${isEn ? 'MYSTIC TAROT' : 'TAROT MÍSTICO'}**` ``; `src/commands/economyHelpers.js:125-133` números em `**negrito**`; `src/commands/economyHelpers.js:164` `setFooter({ text: '✦ Pyxie • pyxie.com.br' })`; `src/commands/economyHelpers.js:152` `descLines.join('\n')`; `src/utils/i18n.js:1324` `"💎 **TESOURO & ECONOMIA**"`. O modo sem imagem só entra quando o card falha (`src/commands/perfil.js:119-134`).
**Achado:** Quando o card falha, o perfil vira um embed antigo: seções em CAIXA ALTA, linhas coladas, números sem crases e alguns textos fixos no código. O perfil muda de cara conforme o gerador de imagem responde.
**Recomendação:** Reescrever o modo sem imagem com `###`, `\n\n`, números entre crases e textos via `t()`. Rodapé "Pyxie • {servidor}".
**Revisão:** Rebaixado de PROBLEMA/média para PARCIAL/baixa. É um caminho de reserva, só visto quando o card falha. "Global" (`:61`) é palavra válida em português, então não é falta de tradução; e o rodapé mostra o domínio como texto, não como link cru.

### Q187 — O card de perfil gerado (Satori) fica legível no celular, onde o Discord mostra a imagem com cerca de 340px de largura?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/services/profileCardGenerator.js:16-17` `CARD_WIDTH = 960` / `CARD_HEIGHT = 1200`; `:492` rótulo `fontSize: '19px'`; `:494` sub `'19px'`; `:671`, `:676-677` `'21px'`; valores em `:493` `'38px'`. Conta: 19 × 340/960 ≈ 6,7px na tela.
**Achado:** Os rótulos das estatísticas e o rodapé do card ficam com uns 7px reais no celular. Os números (38px, cerca de 13px reais) e os ícones de 68px continuam legíveis, então dá para entender o card, mas os rótulos pedem zoom.
**Recomendação:** Subir rótulos e rodapé para 26–28px, ou reduzir o card para 800px de largura mantendo as fontes.
**Revisão:** Rebaixado de média para baixa. Os valores e ícones seguem legíveis; só o texto secundário sofre. A largura de 340px é estimativa (o próprio código cita esse número em `src/modules/dungeon/dungeonRenderer.js:12`).

### Q188 — A cena das Catacumbas (canvas 800x640) mantém textos legíveis no celular e as fontes estão embarcadas?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/modules/dungeon/dungeonRenderer.js:270` `fitText(..., minSize = 24)`; `:617-618` `drawText(ctx, 'pyxie.com.br', ..., { size: 15 })`; `src/utils/canvasFonts.js:20-22` registra `Twemoji.Mozilla.ttf` e `DejaVuSans-Bold.ttf` (presentes em `assets/fonts/`). Contagem de `drawText` com tamanho fixo: o menor é 24, fora a marca d'água de 15.
**Achado:** Fontes no repositório, sem quadradinhos. Textos com pelo menos 24px (uns 10px no celular): dá para ler. Só a marca d'água de 15px some na tela.
**Recomendação:** Manter o mínimo de 24px. Subir a marca d'água para 20px ou aceitar que ela só aparece em print ampliado.
**Revisão:** Confirmado.

### Q189 — Os ícones e sprites desenhados na cena das Catacumbas existem localmente ou dependem da CDN do Discord?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** Script `/tmp/aud-discord-embeds-imagens/emo.js` rodado de novo: "refs 63 · sem arquivo local 0". Os 15 arquivos do mapa `ASSETS` em `src/modules/dungeon/dungeonRenderer.js:118-136` existem no disco.
**Achado:** Os 63 emojis e as 15 poses (Pyxie e Astaroth) estão no disco. A cena não depende da internet para os ícones.
**Recomendação:** Manter `scripts/sync_dungeon_emojis.js` no fluxo quando entrar emoji novo na dungeon.
**Revisão:** Confirmado por amostragem (script rodado de novo).

### Q190 — Se a cena das Catacumbas demorar, o jogador fica sabendo que a imagem não veio?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/modules/dungeon/dungeonViews.js:21` `RENDER_TIMEOUT_MS = 2000`; `:245-257` `Promise.race` com timeout que devolve `null` sem log; `:544-550` sem `png` o embed sai sem `setImage` e sem aviso.
**Achado:** Se o desenho passar de 2 segundos, a imagem some daquele passo sem aviso. O jogo segue, mas o mapa e o combate ficam só em texto. O estouro de tempo também não aparece no log (só erros).
**Recomendação:** Sem imagem, pôr "-# 🖼️ Cena indisponível agora" no embed (via `t()`). Registrar no log quando o tempo estoura.
**Revisão:** Confirmado.

### Q191 — O embed principal de uma partida das Catacumbas respeita os limites do Discord e o §9?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/modules/dungeon/dungeonViews.js:526` `setDescription(lines.join('\n\n').slice(0, 4000))`; `:531-535` três campos inline com valores em crases; `:123-129` `rowsOf` para em 5 fileiras; `src/utils/i18n.js:2969` `"-# ✨ Brilho \`{spark}/{maxSpark}\` • ..."`; `src/utils/i18n.js:2703` `"Pyxie • Catacumbas de Veludo • {server}"`.
**Achado:** `\n\n` entre blocos, status em `-#`, números em código, rodapé com servidor e corte em 4000 caracteres. É o embed mais alinhado à regra nesta área.
**Recomendação:** Usar como modelo para perfil e ajuda.
**Revisão:** Confirmado por amostragem. Ajuste: `rowsOf` começa na linha 123, não 127.

### Q192 — A home do Hyperfokus (renderHomePage) cabe numa tela de celular de 360px sem cortar conteúdo?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** Captura `/tmp/aud-discord-embeds-imagens/home-360-mid.png` (conferida): "Explorar Artigos", cartões da comunidade e lista da loja cortados à direita; botões de ordenar fora da tela. Código: `src/modules/hyperfokus/renderer.js:248` `grid-template-columns: 1fr 340px`; `:253-256` em telas até 900px vira `1fr`; `:725` cabeçalho `display: flex; justify-content: space-between` sem `flex-wrap`.
**Achado:** No celular, parte da home fica cortada à direita e alguns botões (Recentes/Curtidos, segundo botão de projetos) ficam invisíveis. Em 768 e 1280px não há problema.
**Recomendação:** Trocar `1fr` por `minmax(0, 1fr)` também dentro do `@media (max-width: 900px)` e pôr `flex-wrap: wrap` no cabeçalho de "Explorar Artigos". Testar de novo em 360px.
**Revisão:** Confirmado pela captura. Ajuste na causa: a coluna de 340px já some abaixo de 900px; o corte vem do `1fr` sem `minmax(0, …)`, que deixa o conteúdo largo empurrar a coluna, somado ao cabeçalho sem quebra de linha. Item é do site, não do Discord, mas foi mantido.

### Q193 — A página de artigo do Hyperfokus e os avisos de texto pequeno ficam legíveis em 360, 768 e 1280px?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/modules/hyperfokus/renderer.js:791-792` `<p style="font-size: 0.7rem; ...">* Link afiliado Shopee...` (0,7 × 16 = 11,2px). Capturas `/tmp/aud-discord-embeds-imagens/article-360.png`, `-768.png`, `-1280.png`.
**Achado:** A página de artigo está boa nas três larguras. O aviso de link afiliado na home tem 11,2px, pequeno para um aviso que precisa ser lido.
**Recomendação:** Subir o aviso para 0.8rem (12,8px) ou mais e aumentar o contraste.
**Revisão:** Confirmado no código (0.7rem). A medição do artigo vem do auditor original e não foi refeita.

### Q194 — Quando o dono troca o emoji de um slot de embed no painel (ex.: cabeçalho do work_crisis), o embed real no Discord muda?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `server.js:1449-1468` `POST /api/admin/embeds/slot` grava `${embedId}.${slotKey}` e responde "atualizado com sucesso"; `src/utils/embedRegistry.js:407-427` grava a chave; `src/utils/embedRegistry.js:157` `buildEmbed` só é repassado em `src/services/moduleManager.js:354-356` e `:687-689`, sem nenhum chamador em `src/` (o `buildEmbed` de `mary-studio` é outra função); `src/utils/appEmojis.js:262` `getEmoji` não lê chaves com prefixo de embed. Tela: `client/src/dashboard/Emojis.jsx:70-75`.
**Achado:** O painel lista 50 embeds com emojis editáveis e confirma a troca, mas nenhum comando monta embeds pelo registro. A mudança não aparece no Discord. O dono acha que personalizou e nada acontece.
**Recomendação:** Ou ligar os comandos ao `buildEmbed` do registro, ou marcar no painel "só prévia" e esconder os slots sem efeito. O backend deve recusar slots que nenhum embed usa (§10).
**Revisão:** Confirmado. Severidade baixada de alta para média: afeta só o dono no painel, sem dano ao jogador. O sistema separado de personalização por servidor (`src/services/embedOverrides.js`, com troca de emojis por servidor) funciona, mas não usa estes slots.

### Q195 — As prévias de embed cadastradas no registro (vistas no painel) seguem o §9 e o bilinguismo?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/utils/embedRegistry.js:467` `previewDesc` com `\n` simples; `:473-474` `'35 {coins}'`, `'90 segundos {timer}'` sem crases; `:1213` `'/museu?user=123456789'` cru; `:1329` `'{header} Você não está sozinho(a) 💖'`; 50 `registerEmbed({`, nenhum com campo em inglês.
**Achado:** As prévias ensinam o padrão errado: linhas coladas, números sem crases, caminho cru e título com dois emojis. Não há versão em inglês.
**Recomendação:** Revisar as 50 prévias com `\n\n`, crases e links mascarados. Pares pt/en em `previewTitle`/`previewDesc`.
**Revisão:** Confirmado, mas rebaixado de média para baixa. Como mostra a Q194, essas prévias só aparecem no painel do dono e não chegam ao Discord.

### Q196 — A rota que salva o emoji de um slot valida se o embed, o slot e o ID do emoji existem?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `server.js:1451-1454` só exige `embedId` e `slotKey` no corpo; `src/utils/embedRegistry.js:407-427` aceita qualquer `emojiId`; `src/utils/embedRegistry.js:121-129` ID desconhecido vira `<:emoji_${id}:${id}>`. A tela usa um seletor do catálogo: `client/src/dashboard/Emojis.jsx:139-145`.
**Achado:** Pela tela, o dono só escolhe emojis do catálogo, então erro de digitação é improvável. Mas a rota grava qualquer embed, slot ou ID que chegar, o que quebra a regra §10 ("o backend recusa o que a tela esconde"). Nas prévias, um ID ruim vira texto quebrado.
**Recomendação:** Recusar com 400 se `embedId`/`slotKey` não existirem no registro ou se o `emojiId` não estiver no catálogo.
**Revisão:** Confirmado. O risco real é menor que o descrito: o seletor do painel já limita as escolhas. A rota exige login de admin.

### Q197 — A lista de comandos de um módulo no /py-help tem proteção contra o limite de 4096 caracteres da descrição?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `/tmp/aud-discord-embeds-imagens/help3.js` rodado de novo: 68 comandos; utilidades 26 (≈2.224 caracteres), economia 23 (≈2.123). `src/commands/commandHelpers.js:796-812` sem corte; `:865-869` `buildHelpMessage` devolve `totalPages: 1`.
**Achado:** Hoje cabe, com cerca de 54% do limite. Não há corte. Uns 20 comandos a mais em Utilidades fazem a ajuda dar erro.
**Recomendação:** Paginar (15 comandos por página) ou cortar com "-# e mais N comandos no site". Dividir Utilidades em categorias menores.
**Revisão:** Confirmado (medição refeita). Risco futuro, não atual.

### Q198 — O rostinho da Pyxie no rodapé é aplicado de forma automática, com arquivos válidos e sem aparecer em contexto de crise?

**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/services/embedOverrides.js:42-47` `decorateFooter` escolhe o rosto pelo tom; `:32-33` `SENSITIVE_RE` pula desabafo/CVV/crise; `assets/pyxie/sticker/footer/{happy,sad,smile,worried}.png` com 96x96 (comando `file`); `server.js:429` serve `/assets`.
**Achado:** Os quatro rostinhos existem em 96x96. São escolhidos sozinhos e ficam de fora em acolhimento e crise, como pede o §12.
**Recomendação:** Nada urgente. Conferir as palavras-chave de tom quando entrarem textos novos.
**Revisão:** Confirmado por amostragem.

### Q199 — Os botões e o rodapé da ajuda estão traduzidos e apontam para o mesmo domínio configurado?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/utils/i18n.js:1282` `"btnWebsite": "Website"` no bloco pt; `src/commands/commandHelpers.js:776` `setFooter({ text: 'Pyxie' })`; `:835-856` três botões usam `PANEL_PUBLIC_URL` e o de Suporte usa `'https://pyxie.com.br/discord?ref=bot'` fixo.
**Achado:** O botão aparece como "Website" em português. O rodapé não mostra o servidor, ao contrário das Catacumbas. Num ambiente de teste com outro domínio, o Suporte leva para o site de produção.
**Recomendação:** Traduzir para "Site". Rodapé "Pyxie • {servidor}". Montar o link de Suporte com `PANEL_PUBLIC_URL`.
**Revisão:** Confirmado.

### Q200 — Botões e menus só com emoji (setas das Catacumbas, stickers do Estúdio do Perfil) são compreensíveis para quem usa leitor de tela?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `src/modules/dungeon/dungeonViews.js:426` `MOVE_EMOJI = { w: '⬅️', n: '⬆️', s: '⬇️', e: '➡️' }`; `:447` `button({ id, emoji: MOVE_EMOJI[a.arg], ... })` sem `label`; `src/commands/perfil.js:280` opções de sticker `{ label: value, value }`; `src/services/profileStyle.js:27` `STICKERS` com 23 emojis.
**Achado:** As setas de andar e as 23 opções de sticker não têm texto, só emoji. O leitor de tela lê o nome Unicode, sem dizer a ação. Para o público neurodivergente, rótulos curtos ajudam.
**Recomendação:** Rótulos curtos nas setas ("Oeste", "Norte"...) via `t()`. Nos stickers, um nome no label ("🌸 Flor", "🐉 Dragão").
**Revisão:** Confirmado. Ajuste de linha: as opções de sticker estão em `perfil.js:280`.
