# Prompt de implementação: servidor oficial "Pyxie's Realm"

> Versão revisada do prompt gerado no Gemini ("Arquitetura do Servidor Pyxie's Realm").
> Corrige referências a arquivos e comandos que não existem, troca o assistente de verificação
> caseiro pelos recursos nativos do Discord, tira a coleta de dados de saúde e divide o trabalho
> em fases com critério de pronto.

---

Você é o engenheiro responsável pelo bot **Pyxie** (Node.js 22, discord.js v14) no repositório
`cringinho/Pyxie` (na VM: `~/kuromi`). Sua tarefa é construir e manter o servidor oficial
**Pyxie's Realm** (guild `1564375898851909653`, dono `214153735281180673`) como um espaço global,
em inglês por padrão, aberto a todas as línguas, gêneros, orientações e neurotipos, com o mínimo
possível de moderação humana.

Leia antes: `AGENTS.md` (regras do projeto), `docs/realm/` (este prompt), a lore oficial no Google
Docs e `src/services/moduleManager.js` (`registerListener`, `registerCron`).

## 0. Fatos do projeto (não invente)

- Comandos que **existem**: `/py-tarot`, `/py-album`, `/py-work`, `/py-profession`, `/py-daily`,
  `/py-wallet`, `/py-ship`, `/py-marriage`, `/py-likely`, `/py-quiz`, `/py-jokenpo`, `/py-coinflip`,
  `/py-dice`, `/py-dungeon` (Catacumbas de Veludo), `/py-boss` (chefe semanal), `/py-home` (Casinha),
  `/py-craft`, `/py-market`, `/py-festival`, `/py-pass`, `/py-setup`, `/py-admin`, módulos
  `partnerships`, `museum`, `tickets`, `giveaways`.
- **Não existem** (não cite como prontos): `/py-coven`, `/py-sue`, `/py-parceria`, `/py-explore`,
  `/py-love`, o Bosque/Gloom, Phantom Coins, Vigor, relíquias `relic_t1..t5`, `ndGateway`,
  `encounters.json`, `gloom.json`. O `deploy.sh` apaga esses dados como obsoletos.
- Helpers de embed: `src/utils/embedBuilderHelper.js`, `src/utils/embedRegistry.js`,
  `src/utils/embedLayout.js` (colunas duplas + `emojify`), emojis do app via
  `src/utils/appEmojis.js` (catálogo `src/data/discordAppEmojis.json`). Nunca use emoji Unicode
  onde existe emoji do app equivalente.
- Textos sempre em `src/utils/i18n.js` com paridade PT/EN (`tests/i18nParity.test.js`).
- Lore atual: Pyxie (maga fada, dark kawaii, tsundere), Astaroth (gato preto alado, sopro verde que
  limpa vírus), Nyx (fada ceifadora glitch, reina em Nyxiel num trono de monitores) e os servos
  Gárgula Acorrentada, Cavaleiro do Erro, Oráculo Corrompido e Brutamontes Sem Sinal.

## 1. Identidade visual

| Papel | Hex | Uso |
|---|---|---|
| Rosa Pyxie | `#E60067` | cargo da Pyxie, anúncios, ações principais |
| Rosa Suave | `#FF8FB3` | acolhimento, casamento, afinidade |
| Violeta Místico | `#8B5CF6` | tarot, magia, eventos |
| Roxo Profundo | `#4B0082` | fundos, banners |
| Dourado Arcano | `#F59E0B` | economia, conquistas, rankings |
| Verde Astaroth | `#22C55E` | sucesso, confirmações |
| Vermelho Nyxiel | `#FF2E55` | alertas, invasões da Nyx |
| Verde Glitch | `#3DFF8F` | detalhes de Nyxiel |
| Tinta | `#1A1A1A` | divisores de cargos |

- Nomes de canal em letras minúsculas nativas com um glifo de borda e um emoji:
  `╭🌸・fairy-gateway`, `┃💬・crystal-plaza`, `╰🔊・whispering-breeze`.
- **Proibido** usar pseudofontes Unicode (𝔭𝔶𝔵𝔦𝔢, 𝕡𝕪𝕩𝕚𝕖) em canais e cargos: quebram leitor
  de tela e busca.
- Cargos: `✦ Nome` para prestígio, `❖ Nome` para vocação, sem colchetes extras.

## 2. Use o que o Discord já faz (antes de escrever código)

1. **Modo Comunidade**: verificação nível médio (e-mail + conta com 5 min), filtro de conteúdo
   explícito para todos, canal de regras e canal de avisos da comunidade.
2. **Onboarding nativo** (`PUT /guilds/{id}/onboarding`) no lugar do "wizard efêmero":
   - Pergunta obrigatória: idiomas (dá o cargo de idioma e mostra a casinha da língua).
   - Perguntas opcionais: pronomes, protocolo de interação (indicadores de tom, literal e direto,
     bateria social, sem pings), interesses (tarot, Catacumbas, casinhas, arte, roleplay).
   - Canais padrão: plaza, regras, anúncios.
   - Quem termina o onboarding vira membro. Não use cargo de quarentena: o próprio onboarding
     e a verificação do servidor fazem esse papel.
3. **Guia do servidor** (Server Guide) com mensagem de boas-vindas da Pyxie e tarefas iniciais.
4. **AutoMod nativo** (`/guilds/{id}/auto-moderation/rules`), respeitando os limites do Discord
   (1 regra de spam, 1 de menções, 1 de presets, até 6 de palavras-chave):
   - Preset de palavras (ofensas, conteúdo sexual) com bloqueio.
   - Menções: no máximo 5 únicas por mensagem, timeout de 10 min.
   - Spam suspeito: bloqueio.
   - Palavras-chave: convites e encurtadores fora de `#realm-alliances`, golpes comuns
     ("free nitro", "steam gift"), discurso de ódio em EN/PT/ES. Todas registram no canal
     `#pyxie-logs` (visível só para o dono).
5. **Fóruns** com tags e reação padrão, slowmode onde fizer sentido.

## 3. Estrutura do servidor

### Cargos (de cima para baixo)
1. `Pyxie` (bot, Administrador, topo).
2. `✦ Realm Architect` (dono).
3. Divisor `── prestige ──`, depois `✦ Nyx Slayer` (venceu a Nyx), `✦ Grand Arcanist`
   (78 arcanos), `✦ Eternal Covenant` (laço nível máximo), `✦ Nyxiel Vanguard` (top do chefe).
4. Divisor `── vocations ──`, `❖ Novice`, `❖ Apprentice`, `❖ Specialist`, `❖ Master`
   (sincronizados com o nível de carreira do `/py-work`).
5. Divisor `── realm ──`, `🌸 Realm Citizen` (todos que terminaram o onboarding).
6. Divisor `── languages ──`: English, Português, Español, Français, Deutsch, 日本語, Other.
7. Divisor `── interaction ──`: Tone Indicators Please, Literal & Direct, Low Social Battery,
   No Pings Please.
8. Divisor `── pronouns ──`: he/him, she/her, they/them, ele/dele, ela/dela, elu/delu,
   any pronouns, ask me.

Regras: cargos de identidade **sem cor e sem exibição separada**, todos opcionais. **Não crie**
cargos de orientação sexual, gênero detalhado, idade ou região: são dados sensíveis, ficam
visíveis no perfil de qualquer pessoa e o servidor mistura adolescentes (13+) com adultos.
Quem quiser se apresentar faz isso no post de apresentação.

### Categorias e canais
- `✦ THE FAIRY GATEWAY`: `╭📜・realm-laws` (regras + lore, canal de regras da Comunidade, botões
  "Ler em Português / Leer en Español" com resposta efêmera), `╰📢・dramatic-supervision`
  (anúncios da Pyxie).
- `✦ HEART OF THE REALM`: `╭💬・crystal-plaza` (chat principal em inglês),
  `┃🌎・world-cottages` (fórum por idioma, um post fixo por língua), `┃🖼️・introductions`
  (fórum de apresentação), `╰🔊・whispering-breeze` (voz de baixo estímulo).
- `✦ SAFE HAVEN`: `╭🦋・cozy-sanctuary` (slowmode 10s), `╰🕯️・support-pods` (fórum com tags
  "Needs Comfort", "Advice Welcome", "Just Listening").
- `✦ MYSTIC PAVILION`: `╭🔮・tarot-and-oracles`, `┃💼・guild-of-vocations`,
  `┃💍・love-and-cottages`, `┃🛒・market-square`, `╰🎲・arcade`.
- `✦ NYXIEL BORDER`: `╭⚔️・nyxiel-frontline` (chefe semanal e invasões), `┃🕯️・catacombs`
  (Catacumbas, cada descida já abre um tópico próprio), `╰🎭・roleplay-tales` (fórum de roleplay
  com tags de gênero e aviso de conteúdo).
- `✦ MUSEUM & ALLIANCES`: `╭🎨・art-museum` (só mensagens com anexo), `┃🤝・realm-alliances`
  (somente leitura), `╰📋・partnership-requests` (painel do módulo `partnerships`).
- `✦ CROWN`: `#pyxie-logs` (só dono e bot).

A Safe Haven fica **aberta a todos os cidadãos**: nada de verificação por laudo ou relato de
saúde. O que protege o espaço é slowmode, AutoMod mais rígido nos dois canais e as regras.

## 4. Regras do Reino (EN no canal, PT/ES por botão)
1. Everyone is welcome: no hate for language, nationality, gender, sexuality, neurotype or
   disability.
2. Respect people's interaction roles (tone indicators, literal & direct, no pings).
3. 100% SFW, everywhere: we have teenagers here.
4. Vents go to the support pods, with a content warning. No judging people who are struggling.
5. Art belongs to whoever made it. Fanart of Pyxie is welcome; selling it is not.
6. No spam, scams, self-promo or suspicious links outside the alliances channel.
7. Follow Discord's Terms of Service and Community Guidelines.

## 5. Fases e critério de pronto

**Fase 1 — Provisionador idempotente** (`scripts/realm/provision.js` + blueprint em
`src/modules/realm/realmBlueprint.js`):
- `--dry-run` (padrão) lista o que criaria ou mudaria; `--apply` executa.
- Encontra itens existentes pelo nome e guarda IDs em `data/realmState.json`. Rodar duas vezes
  não cria nada novo. Nunca apaga canais ou cargos que não criou.
- Respeita rate limit (fila com `Retry-After`).
- Pronto quando: cargos, categorias, canais, permissões, tags de fórum, Comunidade, AutoMod e
  Onboarding batem com o blueprint e um segundo `--apply` não muda nada.

**Fase 2 — Conteúdo**: embeds de regras, lore e boas-vindas (via `embedLayout`), posts fixos do
fórum de idiomas, botões de tradução efêmera, Guia do servidor.

**Fase 3 — Automação** (módulos novos, cada um com teste):
1. `supportPods`: tópico com a tag "Just Listening" é trancado para respostas e recebe uma
   mensagem acolhedora com linhas de apoio (CVV 188, 988 nos EUA, findahelpline.com).
2. `nyxielRifts`: invasões curtas no `#nyxiel-frontline` usando os servos da Nyx; botões
   cooperativos, recompensa com teto diário, sem coletor em memória (customId stateless).
3. `roleSync`: cargos de prestígio e de vocação atualizados pelos dados reais (vitória sobre a
   Nyx, álbum completo, nível do laço, carreira).
4. `translate`: comando de contexto "Translate with Pyxie" (resposta efêmera, idioma do cargo).
5. `communityShield`: comando de contexto "Report to Pyxie". Só conta denúncia de cidadão com
   conta de 30+ dias e 7+ dias no servidor; 4 denúncias distintas em 10 min ocultam a mensagem e
   dão timeout de 1 h; avisa o dono por DM com botão para desfazer; um alvo só sofre isso uma vez
   por dia; abuso de denúncia tira o direito de denunciar.

**Fase 4 — Parcerias automáticas**: allowlist de domínios, checagem do convite
(`nsfw_level`, membros, validade) e revisão do dono por botão quando algo for duvidoso.

Para todas as fases: `npm test` verde, textos com paridade PT/EN, nenhum segredo em log,
e nada de valores fixos falsos no `/admin`.
