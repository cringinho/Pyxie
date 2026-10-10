# 🧭 Guia Arquitetural: Cringelândia (Matriz) vs. Pyxie Global (SaaS)

Este documento estabelece as diretrizes de engenharia, arquitetura e operação para a convivência harmônica entre o **Servidor Oficial Matriz (Cringelândia)** e os **Servidores Globais Externos (SaaS / Top.gg)** atendidos pela Pyxie.

---

## 1. Visão Geral da Arquitetura Dual-Tier

O projeto foi projetado sob o padrão **Dual-Tier Multi-Tenant**:

```
                       ┌──────────────────────────────────────────────┐
                       │               PYXIE CORE (v14)               │
                       └──────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌───────────────────────────┐                       ┌───────────────────────────┐
       │     ZONA A: GLOBAL        │                       │   ZONA B: CRINGELÂNDIA    │
       │   (Comunidades Externas)  │                       │   (Guild 145389086898048) │
       ├───────────────────────────┤                       ├───────────────────────────┤
       │ • Padrão EN (Internacional)│                       │ • 100% PT-BR Nativo/Imersivo│
       │ • Setup Autônomo Zero-OAuth│                       │ • Canais e Cargos Fixos   │
       │ • Comandos Slash Globais  │                       │ • Módulos com guildScope  │
       │ • Economia, Tarot, Casamento│                      │ • Eventos Sazonais Lab    │
       │ • Web: pyxie.com.br       │                       │ • Easter Eggs e Lore      │
       └───────────────────────────┘                       └───────────────────────────┘
```

---

## 2. Zona B: Especificidades da Cringelândia & Como Realizá-las

A **Cringelândia** (`Guild ID: 1453890868980482090`) é o laboratório de inovação, servidor oficial do criador e ambiente de acolhimento imersivo.

### 2.1 Identificadores Estáticos de Infraestrutura (`src/config.js`)
A matriz possui canais e cargos dedicados monitorados pelo bot:
- `WELCOME_CHANNEL_ID`: Canal de recepção com reações automáticas de corações temáticos.
- `WELCOME_ROLE_ID`: Cargo notificado para acolher novas pessoas.
- `RULES_CHANNEL_ID`, `GUIDES_CHANNEL_ID`, `COLORS_CHANNEL_ID`: Canais fixos apresentados no embed de boas-vindas.
- `TAROT_CHANNEL_ID` & `TAROT_ROLE_ID`: Canal de disparo diário do Tarot à 00:00 BRT com ping no cargo de tarólogos.
- `STARTUP_CHANNEL_ID`: Canal de notificação de boot/reinicialização do bot.

### 2.2 Isolamento de Módulos via `guildScope`
Para criar uma funcionalidade, evento ou comando que deve existir **apenas na Cringelândia** sem poluir os servidores globais:

1. **Defina o `guildScope` no módulo ou comando:**
   ```javascript
   // Exemplo em src/modules/seasonal/commands/pyInfoEvento.js
   module.exports = {
     name: 'py-infoevento',
     guildScope: ['1453890868980482090'], // Trava estrita de guilda!
     // ...
   };
   ```
2. **Registro de Comandos (`src/registerSlashCommands.js`):**
   - Comandos com `guildScope` são enviados exclusivamente via `Routes.applicationGuildCommands(CLIENT_ID, TARGET_GUILD_ID)`.
   - O Discord registra comandos de guilda **instantaneamente**, enquanto comandos globais podem levar até 1 hora para sincronizar.
3. **Despacho em Tempo de Execução (`src/services/moduleManager.js`):**
   - O `moduleManager` intercepta interações e bloqueia a execução fora da guilda autorizada, respondendo com mensagem de contexto restrito.

### 2.3 Como Fazer Alterações Específicas na Cringelândia
- **Novo Cargo ou Canal:** Atualize a variável correspondente em `src/config.js` e em variáveis de ambiente `.env` de produção.
- **Novas Frases / Lore:** Adicione ao handler `handleCringePhrase` em `index.js` respeitando os mapas de cooldown anti-spam (`cringePhraseCooldowns`, `cringeChannelCooldowns`).
- **Eventos Sazonais (Halloween, Natal, etc.):** Configure via `/py-admin evento` ou diretamente em `src/modules/seasonal/seasonalConfig.json`.

---

## 3. Zona A: Funcionalidades Globais da Pyxie (Para Todas as Comunidades)

Qualquer servidor Discord pode adicionar a Pyxie via `https://pyxie.com.br/convite` ou Top.gg. Para essas comunidades, a Pyxie oferece um conjunto completo de ferramentas com zero fricção.

### 3.1 Painel de Setup Autônomo (Zero-OAuth) — `/py-setup`
Comunidades externas não precisam criar conta em sites externos ou conceder permissões OAuth arriscadas. Todas as configurações essenciais são gerenciadas diretamente no Discord:

- **/py-setup view (ou `/py-setup` sem argumentos):**
  - Abre o painel interativo exibindo o idioma ativo, canal de boas-vindas configurado e botões rápidos para alternar o idioma entre 🇧🇷 Português e 🇺🇸 Inglês.
- **/py-setup welcome <canal>:**
  - Define o canal onde os novos membros serão recepcionados.
- **/py-setup language <pt|en>:**
  - Define o idioma padrão do servidor. A escolha é salva persistentemente no arquivo `data/settings.json`.
- **Restrição de Segurança:**
  - Exclusivo para administradores do servidor (`PermissionFlagsBits.ManageGuild` / `Administrator`).

### 3.2 Arquitetura Bilíngue Mandatória
- **Padrão Internacional:** Servidores externos sem configuração de idioma assumem **Inglês (`en`)** por padrão.
- **Detecção Inteligente:** Comandos slash respeitam o `interaction.locale` do usuário, garantindo que usuários falantes de português recebam respostas em português e usuários internacionais recebam em inglês.
- **Regra de Nomes Canônicos:** Todos os slash commands e subcommands possuem nomes e descrições base canônicos em **Inglês**, com localização em **Português (`pt-BR`)** via `.setNameLocalizations()` e `.setDescriptionLocalizations()`.

### 3.3 Sistemas Globais Disponíveis para Todos os Servidores
1. **Economia Viva & 16 Carreiras com Minigames:**
   - Moedinhas e Feijões Mágicos unificados.
   - `/py-work`: Expedientes interativos com tomada de decisão técnica e 400+ cenários bilíngues.
   - `/py-wallet`: Consulta de saldo.
   - `/py-profession`: Escolha e progressão nas 16 carreiras.
   - `/py-rank`: Leaderboard global de patrimônio e sequências diárias.
2. **Matrimônio, Romance & Família:**
   - `/py-marriage`: Proposta formal com anel por 1000 moedas.
   - Barra do Amor viva (com decaimento lazy de 20%/dia sem atenção mútua).
   - Árvore da Vida, Casa Familiar e Cofre do Amor Eterno com rendimentos proporcionais.
   - Date Night com teste de sintonia do casal (400 perguntas bilíngues).
   - `/py-child`: Adoção e envio de filhos para estágios de 24 horas.
   - `/py-divorce`: Separação com partilha e taxas.
3. **Oráculo de Tarot Místico:**
   - `/py-tarot`: Tiragens privadas com imagens em alta definição geradas em canvas.
   - `/py-album`: Álbum interativo dos 78 arcanos com 10 páginas e resgate de conquistas.
4. **Minigames Sociais:**
   - `/py-ship`: Afinidade amorosa com cards gráficos.
   - `/py-jokenpo`: Pedra, papel e tesoura multiplayer.
   - `/py-cookie`: Biscoito da sorte com sabedorias e recompensas.
   - `/py-likely`: "Quem é mais provável" com votação em tempo real.
   - `/py-dice` & `/py-coinflip`: Apostas e diversão leve.
5. **Ecossistema Web Integrado:**
   - `pyxie.com.br`: Website moderno em React + Vite.
   - `/museu`: Globo das Artes Mágicas 3D e galeria comunitária.
   - `/wiki`: Enciclopédia viva de sistemas.
   - `/bonus`: Resgate de bônus web de 10s.

---

## 4. Guia de Manutenção e Quality Gate

Antes de publicar qualquer alteração ou realizar deploy em produção:

### 4.1 Validação de Testes Automáticos
Execute localmente:
```bash
npm test
```
O Quality Gate executa 15 suítes de teste que validam:
- Paridade de chaves e placeholders no `i18n.js` (100% simétrico entre PT e EN).
- Categorização de 100% dos comandos em `COMMAND_CATEGORY_MAP`.
- Integridade do sistema de permissões de dono (Snowflake `214153735281180673`).
- Ciclo de vida dos módulos de Casamento, Tarot, Museu, Parcerias e Sazonal.
- SEO técnico bilíngue (Canonicals, Hreflang, Schema.org e OpenGraph).

### 4.2 Compilação do Frontend Web
Se houver alterações em `client/`:
```bash
npm run build:client
```
Gera os assets otimizados em `public/dist/assets/`.

### 4.3 Registro de Comandos no Discord
Ao criar, renomear ou adicionar subcomandos slash:
```bash
npm run register
```
Sincroniza os comandos com a API do Discord (Globais na Zona A e Cringelândia na Zona B).

### 4.4 Deploy em Produção (Oracle Cloud VM)
```bash
git push origin main
ssh oracle "cd ~/kuromi && ./deploy.sh"
```
O script `deploy.sh` puxa o código, compila o cliente se necessário, atualiza dependências e reinicia o serviço via PM2 (`pm2 reload pyxie`).
