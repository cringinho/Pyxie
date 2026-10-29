# Pyxie × ZyroX × Red: o que vale trazer

Levantamento de 29/10/2026 sobre dois bots abertos, para decidir o que a Pyxie ganha portando ideias deles:

- **ZyroX** ([RayExo/ZyroX-CV2-AIO-With-Dashboard](https://github.com/RayExo/ZyroX-CV2-AIO-With-Dashboard)): bot "tudo em um" em Python (discord.py 2 com Components V2), API em FastAPI e painel em Next.js 14. Licença **MIT**. 103 estrelas.
- **Red** ([Cog-Creators/Red-DiscordBot](https://github.com/Cog-Creators/Red-DiscordBot)): bot modular em Python, maduro (desde 2016), em que cada função é um "cog" instalável. Licença **GPL-3.0**. 5,7 mil estrelas.

## Resumo

- **O ZyroX faz melhor** na quantidade de recursos prontos de segurança e engajamento: antinuke por limite, modo de emergência, níveis por conversa, música, jogos clássicos, aniversários, AFK. É abrangente, mas raso, e o painel tem uma falha grave de segurança (ver abaixo).
- **O Red faz melhor** na engenharia do núcleo: uma camada de configuração por escopo, regras de permissão por comando, casos de moderação numerados com advertências por pontos, um diagnóstico de "por que não consigo usar este comando" e uma API para apagar os dados de uma pessoa em todos os módulos.
- **A Pyxie já está à frente** em segurança do painel, bilinguismo, testes, estúdio de mensagens, acolhimento e na separação por zonas (Global, Cringelândia, Mary).

## Licença: o que "apropriar" pode significar

Os dois são em Python e a Pyxie é Node 22 (CommonJS). Nada é copiado arquivo por arquivo: a Pyxie porta ideias, desenhos e regras.

| Repositório | Licença | O que a Pyxie pode fazer |
| - | - | - |
| ZyroX | MIT | Traduzir trechos de lógica para JS à vontade. Se um trecho for adaptado de perto, manter o aviso de copyright do MIT num `docs/CREDITOS-TERCEIROS.md`. |
| Red | GPL-3.0 | Usar ideias, arquitetura e nomes de conceito livremente. **Não** copiar nem traduzir código linha a linha: isso faria a Pyxie inteira ter de ser distribuída como GPL-3.0. |

Regra prática: com o ZyroX, pode adaptar de perto e dar o crédito. Com o Red, leia, entenda e escreva do zero.

## Onde a Pyxie já é melhor

| Tema | Pyxie | ZyroX | Red |
| - | - | - | - |
| Segurança do painel | Login com Discord. A cada pedido, o bot confere ao vivo se a pessoa é admin daquele servidor, e canais e cargos são conferidos como do servidor. Há um teste que barra rota de servidor sem essa checagem (`tests/panelDashboard.test.js`). | O painel fala com a API usando **uma chave única exposta no navegador** (`NEXT_PUBLIC_DASHBOARD_API_KEY` em `dashboard/lib/api.ts`), e as rotas `/{guild_id}/...` não conferem quem pede. Quem pegar a chave altera qualquer servidor. | Sem painel web oficial. |
| Idiomas | PT-BR e EN em tudo, com paridade testada. | Só `lang.en.json`. | Traduções por cog via Crowdin; boa ferramenta, mas o bot não é bilíngue por servidor. |
| Testes | `npm test` com teste de fumaça de todos os comandos; o deploy reverte sozinho se algo falhar. | Sem testes. | Testes unitários e CI. |
| Dados | PostgreSQL + Drizzle para transações e JSON com escrita atômica. | Mais de 30 arquivos SQLite, **com dados de uso versionados no repositório** (`bot/db/*.db`). | Camada `Config` com drivers (JSON ou PostgreSQL). |
| Mensagens customizadas | Estúdio no painel (embeds e Components V2, agendamento, webhook, histórico). | Comando `embed` no Discord. | Não tem. |
| Acolhimento e segurança emocional | Crise (188/CVV), acolhimento de 24 h, "ninguém sem resposta", persona calorosa fora dos jogos. | Não tem. | Não tem. |
| Zonas | Funções exclusivas por servidor (`src/config/scopes.js`). | Não tem. | Não tem. |

## Diferenças técnicas que valem portar

### 1. Camada de configuração por escopo (Red: `Config`)
No Red, cada módulo declara os padrões e o escopo (global, servidor, canal, cargo, membro, usuário) e lê e grava pela mesma API, com cache e driver trocável. Na Pyxie, cada módulo tem seu `getConfig/saveConfig`, com o próprio arquivo e a própria normalização.

**Para a Pyxie:** um `src/services/scopedConfig.js` com `define({ guild: {...}, member: {...} })`, normalização por esquema, escrita atômica e cache. Os módulos novos usariam esse serviço, e os antigos migrariam aos poucos. Isso reduz bugs como o de hoje, em que o acolhimento ignorava o `PYXIE_DATA_DIR`.

### 2. Apagar os dados de uma pessoa em todos os módulos (Red: `red_delete_data_for_user`)
No Red, cada cog implementa um método para apagar os dados de um usuário, e o núcleo chama todos. É exatamente o que a LGPD pede.

**Para a Pyxie:** cada módulo exporta `deleteUserData(userId)`. Um comando `/py-privacidade apagar` (com confirmação e espera de 24 h) chama todos e gera um recibo. Entra também no painel e na página de privacidade. **Prioridade alta**, pela missão e pelo público.

### 3. Regras de permissão por comando (Red: cog `permissions`)
No Red, o servidor escolhe permitir ou negar cada comando (ou categoria) por cargo, canal ou pessoa, com hierarquia: regra de canal vence regra de servidor.

**Para a Pyxie:** hoje existem grupos liga/desliga e canais de jogos (`guildFeatures`), e rotas por comando só na Cringelândia. Generalizar para regras "comando × cargo/canal × permitir/negar" no painel, conferidas no carregador de comandos, que é um ponto único.

### 4. Diagnóstico "por que este comando não funciona aqui?" (Red: `_diagnoser.py`)
O Red verifica passo a passo (comando desligado, regra de permissão, permissão do bot no canal, cooldown) e explica qual falhou.

**Para a Pyxie:** muitas dúvidas da staff são "a Pyxie não responde". Um `/py-diagnostico <comando>` e um botão no painel que rodam as mesmas checagens e dizem o motivo em linguagem simples, nos dois idiomas.

### 5. Casos de moderação numerados e advertências por pontos (Red: `modlog` + `warnings`)
No Red, toda ação vira o "caso #123", com motivo editável e moderador. As advertências somam pontos, e passar de um limite dispara uma ação configurada (silenciar 1 h, expulsar etc.).

**Para a Pyxie:** existem o registro de moderação (`modLog`) e os eventos de segurança, mas não há casos nem pontos. Criar uma tabela de casos no PostgreSQL (transacional, §6), com advertências que expiram e ações por limite, tudo configurável no painel. Os textos para quem recebe a advertência precisam ser acolhedores e claros, sem sarcasmo (§12).

### 6. Antinuke por limite, com lista de confiança (ZyroX: `cogs/antinuke`)
O ZyroX vigia cerca de 20 eventos (ban, expulsão, apagar ou criar canal, cargo, webhook, emoji, sticker, prune, bot adicionado, mudança no servidor) e pune quem passar do limite num intervalo, exceto quem está na lista de confiança.

**Para a Pyxie:** o Guardião do Servidor já detecta permissão perigosa, canal privado aberto e webhook vazado, e o anti-raid cuida das entradas. Faltam os **limites por ação em massa** (por exemplo, 3 bans em 30 s), com resposta automática (tirar os cargos de quem fez) e lista de confiança no painel. Estender o `server-guard`, sem criar outro módulo.

### 7. Modo de emergência para qualquer servidor (ZyroX: `emergency`)
Com um comando, o servidor tranca canais, pausa convites e liga filtros duros; outro comando desfaz.

**Para a Pyxie:** a "blindagem" existe só na Cringelândia (seção Moderação). Levar para todos os servidores, com botão no painel e desfazer seguro (guarda o estado anterior de cada canal).

### 8. Ressincronizar emojis do aplicativo ao iniciar (ZyroX: `utils/sync_emojis.py`)
Na partida, o ZyroX compara os emojis do aplicativo com a pasta de assets e envia os que faltam.

**Para a Pyxie:** existe o `appEmojis`, mas sem sincronização automática. Um script de partida que confere o mapa contra `assets/` evita emoji quebrado depois de trocar de aplicativo (como na migração do link de instalação).

### 9. Esquemas tipados e documentação da API (ZyroX: FastAPI + Pydantic)
Cada rota do ZyroX tem esquema de entrada e saída, e a documentação OpenAPI sai sozinha.

**Para a Pyxie:** as rotas do painel normalizam à mão. Um validador por esquema (por exemplo, `zod`) em `dashboardRoutes.js` dá erros consistentes e permite gerar uma página `/api/docs` só para o dono.

### 10. Ligar e desligar comandos de barra por servidor (Red: `app_commands`)
O Red deixa o servidor escolher quais comandos de barra aparecem no menu do Discord e sincroniza só aqueles.

**Para a Pyxie:** os comandos globais são registrados uma vez para todos os servidores, então um grupo desligado no painel provavelmente continua no menu de barra e só recusa ao ser usado (conferir antes de implementar). Registrar por servidor de acordo com os grupos ligados, sem estourar o limite de chamadas da API, deixaria o menu limpo.

## Módulos que a Pyxie ainda não tem

Avaliados pela missão (comunidade segura para pessoas neurodivergentes e em sofrimento) e pelas regras do `AGENTS.md`.

| Módulo | De onde | Vale para a Pyxie? | Cuidados | Esforço |
| - | - | - | - | - |
| **Apagar meus dados (LGPD)** | Red | Sim, prioridade alta. | Confirmação, recibo, cobre PostgreSQL e JSON. | Médio |
| **Advertências por pontos + casos** | Red | Sim. | Textos acolhedores; casos no PostgreSQL. | Médio |
| **Antinuke por limite** | ZyroX | Sim, como extensão do Guardião. | Começar só alertando, como o Guardião. | Médio |
| **Modo de emergência global** | ZyroX | Sim. | Guardar e restaurar o estado de cada canal. | Médio |
| **Regras de permissão por comando** | Red | Sim. | Ponto único no carregador; painel com prévia. | Médio |
| **Diagnóstico de comando** | Red | Sim. | Reaproveitar as mesmas checagens do carregador. | Baixo |
| **Cargos por botão/menu (genérico)** | ZyroX (`reactionroles`) | Sim. As injeções e as cores já fazem pacotes prontos, mas falta um construtor livre no estúdio. | Conferir hierarquia de cargos; sem menção. | Baixo |
| **Verificação por botão na entrada** | ZyroX (`verification`) | Sim, para servidores com raid. O `newAccountGate` cobre só contas novas. | Acessível: nada de captcha visual difícil; botão com texto claro. | Baixo |
| **Aniversários** | ZyroX (`birthday`) | Sim, combina com acolhimento. | Opcional e privado: a pessoa escolhe se aparece; nada de idade. | Baixo |
| **AFK / "volto já"** | ZyroX (`afk`) | Sim. Ajuda quem precisa sair sem explicar. | Mensagem curta e sem expor o motivo. | Baixo |
| **Lembretes pessoais** (`/py-lembrete`) | Red/ZyroX (`timer`) | Sim, útil para TDAH (remédio, pausa, tarefa). | Agendador só no processo do bot (§3); limite por pessoa. | Baixo |
| **Comandos personalizados / tags** | Red (`customcom`, `alias`) | Sim. As respostas de FAQ cobrem parte. | Nasce no estúdio (§13), não em código. | Médio |
| **Trivia com listas editáveis** | Red (`trivia`) | Sim, como extensão do quiz. | Minigame de recreação não dá moedas (§5). | Médio |
| **Jogos clássicos** (termo/wordle em PT, ligue 4, batalha naval, 2048, digitação) | ZyroX (`games/`) | Sim, para recreação. | Sem moedas (§5); em PT e EN; Components V2. | Médio |
| **Alertas de live e vídeo** (Twitch/YouTube) | Red (`streams`) | Talvez. Útil para parceiros e criadores da comunidade. | Respeitar limites das APIs; sem ping em massa por padrão. | Médio |
| **Níveis por conversa + ranking** | ZyroX (`leveling`) | Talvez, desligado por padrão. | Pode criar pressão para falar e incentivar spam, o que vai contra a missão. Se entrar: sem ranking público obrigatório, sem moedas, com teto diário. | Médio |
| **Música (Lavalink)** | ZyroX (`music`) | Talvez, mas caro. | Lavalink pesa na VM Oracle; questões de direitos autorais nas fontes. | Alto |
| **Tradução de mensagens** | ZyroX (`translate`) | Talvez. Ajuda em servidores mistos. | Conteúdo vai para serviço externo: avisar e não usar em canais de desabafo. | Baixo |

## O que não trazer

- **"Snipe"** (mostrar mensagem apagada): expõe quem se arrependeu de um desabafo. Vai contra a segurança da comunidade.
- **Chave de API no navegador e rotas sem dono** (o painel do ZyroX): a Pyxie já resolve isso com sessão assinada e conferência ao vivo.
- **Bancos de dados versionados no repositório** (o ZyroX versiona `bot/db/*.db` com dados reais).
- **Instalar módulos de terceiros pelo chat** (Red: `downloader`): executa código de fora dentro do bot. Para a Pyxie, os módulos ficam no repositório, revisados e testados.
- **Comandos de `eval`/dev em produção** (Red: `dev_commands`): só fazem sentido com isolamento forte, que a Pyxie não precisa.
- **"Nightmode", "encryption", status de Minecraft, "steal" de emojis** (ZyroX): pouco valor para a missão.

## Ordem sugerida

1. Apagar meus dados (LGPD).
2. Diagnóstico de comando.
3. Advertências por pontos + casos de moderação.
4. Antinuke por limite + modo de emergência global (juntos, no Guardião).
5. Regras de permissão por comando + menu de barra por servidor.
6. Lembretes pessoais, AFK e aniversários (pacote de bem-estar e convivência).
7. Cargos por botão no estúdio e verificação por botão.
8. Camada de configuração por escopo, adotada primeiro nos módulos novos desta lista.

Cada item segue o `AGENTS.md`: tela no painel com o backend recusando o que a tela esconde (§10), PT e EN (§1), testes (§2), README do módulo (§3) e prévia no canal de testes para todo embed novo (§11).
