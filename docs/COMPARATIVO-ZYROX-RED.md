# Pyxie × ZyroX × Red: o que vale trazer

Levantamento de 29/10/2026 sobre dois bots abertos, para decidir o que a Pyxie ganha portando ideias deles:

### 3. Regras de permissão por comando (Red: cog `permissions`)
No Red, o servidor escolhe permitir ou negar cada comando (ou categoria) por cargo, canal ou pessoa, com hierarquia: regra de canal vence regra de servidor.

**Para a Pyxie:** hoje existem grupos liga/desliga e canais de jogos (`guildFeatures`), e rotas por comando só na Cringelândia. Generalizar para regras "comando × cargo/canal × permitir/negar" no painel, conferidas no carregador de comandos, que é um ponto único.

### 4. Diagnóstico "por que este comando não funciona aqui?" (Red: `_diagnoser.py`)
O Red verifica passo a passo (comando desligado, regra de permissão, permissão do bot no canal, cooldown) e explica qual falhou.

**Para a Pyxie:** muitas dúvidas do owner são "a Pyxie não responde". Um `/py-diagnostico <comando>` e um botão no painel que rodam as mesmas checagens e dizem o motivo em linguagem simples, nos dois idiomas.

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
