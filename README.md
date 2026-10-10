# 🌸 Pyxie — Bot Mágico de Economia, Lazer & Comunidade para Discord

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B_ARM64-blue?style=for-the-badge&logo=node.js" alt="Node Version">
  <img src="https://img.shields.io/badge/discord.js-v14-purple?style=for-the-badge&logo=discord" alt="Discord.js">
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/Three.js-3D_WebGL-black?style=for-the-badge&logo=threedotjs" alt="Three.js">
  <img src="https://img.shields.io/badge/Status-Produção_Online-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Licença-Source--Available-pink?style=for-the-badge" alt="License">
</p>

A **Pyxie** é uma aplicação completa e moderna de entretenimento, economia viva, lazer e integração comunitária para o Discord e Web. Construída com arquitetura de alta performance (Node.js ARM64, PostgreSQL 16 com Drizzle ORM e transações ACID atômicas, Three.js e React no frontend), o ecossistema opera sob o modelo **Dual-Tier Multi-Tenant** atendendo tanto o servidor oficial matriz (**Cringelândia**) quanto comunidades internacionais (**Global SaaS**).

> ⚖️ **Aviso Legal & Propriedade Intelectual:**  
> A Pyxie é uma obra 100% original e proprietária. Todas as ilustrações, temas, sistemas, diálogos, mecânicas e códigos-fonte são criações autorais exclusivas, sem vínculo, afiliação ou infração de direitos de terceiros.

---

## ✨ Os 5 Pilares Oficiais da Pyxie

### 💼 1. Economia Viva & 16 Vocações Profissionais
- **Sistema Monetário Unificado:** Moedinhas Mágicas 🪙 e Feijões Mágicos 🌱 (moeda rara de prestígio).
- **Minigames de Trabalho (`/py-work`):** Expedientes interativos com mais de 400 cenários técnicos bilíngues e desafios de tomada de decisão.
- **Carreiras Especializadas (`/py-profession`):** 16 caminhos profissionais com progressão e salários escalonados.
- **Consulta & Rankings (`/py-wallet`, `/py-rank`):** Consulta instantânea de patrimônio e tabelas de classificação global em tempo real.
- **Recompensas Diárias (`/py-daily`, `/py-bonus`):** Resgate de moedas com multiplicadores de sequência diária e bônus web.

### 🔮 2. Tarot Místico & Álbum dos 78 Arcanos
- **Tiragens Diárias (`/py-tarot`):** 78 cartas arcanas (maiores e menores) renderizadas sob demanda com visualização privada, interpretações normais e invertidas.
- **Álbum Colecionável (`/py-album`):** Grimório pessoal com 10 páginas de colecionador e recompensas por marcos de cartas descobertas.
- **Consulta de Grimório (`/py-cardinfo`):** Ficha detalhada sobre o significado arcano de cada carta.

### 💍 3. Matrimônio, Romance & Dinâmica Familiar
- **Casamento no Servidor (`/py-marriage`):** Proposta formal com anel arcano, registro matrimonial público e Barra do Amor viva (com decaimento lazy caso negligenciado).
- **Date Night & Afinidade:** Teste interativo de sintonia de casal com mais de 400 perguntas bilíngues e bônus bilateral de moedas.
- **Árvore da Vida & Cofre Familiar:** Desbloqueio bilateral de rendimentos diários e cofre compartilhado com juros proporcionais.
- **Adoção de Filhos (`/py-child`):** Adoção de até 5 dependentes com envio para estágios remunerados de 24 horas.
- **Divórcio Formal (`/py-divorce`):** Dissolução matrimonial com partilha justa de patrimônio e taxas cartoriais.

### 🎨 4. Globo das Artes Mágicas 3D & Museu Comunitário
- **Galeria Comunitária no Discord (`/py-art`):** Submissão, aprovação e curadoria de obras criadas por membros da comunidade.
- **Globo 3D em Three.js (`https://pyxie.com.br/museu`):** Visualização tridimensional cósmica com dispersão procedural de Fibonacci esférica, rotação inercial e fallback CSS para dispositivos móveis.
- **Honeypot de Divulgação com Sharp:** Proteção server-side com aplicação de marca d'água oficial (`https://pyxie.com.br/`) e barreiras contra inspeção / raspagem não autorizada de mídias.

### 🎲 5. Minigames Rápidos & Integração Comunitária
- **Calculadora de Afinidade (`/py-ship`):** Medidor gráfico de romance e amizade entre membros.
- **Jokenpô PvP (`/py-jokenpo`):** Duelos dinâmicos de pedra, papel e tesoura via botões.
- **Biscoito da Sorte (`/py-cookie`):** Mensagens inspiradoras com números da sorte diários.
- **Quem é Mais Provável (`/py-likely`):** Enquetes ao vivo com contagem de votos em tempo real.
- **Dados & Moeda (`/py-dice`, `/py-coinflip`):** Rolagem poliédrica com acertos críticos e apostas rápidas.
- **Quiz Comunitário (`/py-quiz`):** Desafios de perguntas e respostas com premiação instantânea.

---

## ⚙️ Painel de Setup Autônomo Zero-OAuth (`/py-setup`)

Comunidades externas não precisam expor suas contas em dashboards externos com OAuth arriscado. A Pyxie é configurada integralmente dentro do Discord:

- **/py-setup (ou `/py-setup view`):** Abre o painel interativo de controle com botões rápidos para alternar o idioma entre 🇧🇷 Português e 🇺🇸 Inglês.
- **/py-setup welcome <canal> (ou `/py-setwelcome`):** Define o canal onde os novos membros serão acolhidos.
- **/py-setup language <pt|en>:** Altera o idioma nativo do servidor com persistência imediata.
- **Segurança Restrita:** Apenas membros com a permissão `Gerenciar Servidor` (`ManageGuild`) ou `Administrador` podem alterar configurações.

---

## 🌐 Arquitetura Dual-Tier: Matriz vs. Global

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

## 🐘 Infraestrutura de Dados & Persistência

- **PostgreSQL 16 Local:** Instância conteinerizada via Docker restrita a `127.0.0.1:5432` com volume persistente.
- **Drizzle ORM & Driver pg:** Tipagem segura, migrações estruturadas e transações atômicas ACID (`BEGIN ... COMMIT / ROLLBACK`), eliminando qualquer travamento de concorrência entre o bot (`index.js`) e o servidor Express (`server.js`).
- **Contingência Zero-Data-Loss:** Os arquivos da pasta `data/` são preservados como contingência e utilizam escrita atômica via arquivos temporários (`writeJsonAtomic`).
- **Tabelas Canônicas:**
  - `guild_configs`: Configurações de servidores e canais de boas-vindas.
  - `users`: Saldos de moedinhas, feijões, carreiras e cooldowns.
  - `tarot_albums`: Descobertas e conquistas dos 78 arcanos.
  - `marriages`: Dinâmica matrimonial, cofre, árvore da vida e filhos.
  - `scheduler_state`: Watchdog de tarefas automáticas e cronograma.
  - `cringelandia_lab`: Armazenamento isolado de experimentos da matriz.

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Instale as Dependências
Requer [Node.js](https://nodejs.org/) v18+ (suporte nativo ARM64/x64) e [Docker](https://www.docker.com/):
```bash
npm install
```

### 2️⃣ Inicie o Banco de Dados (PostgreSQL)
```bash
docker compose up -d
```

### 3️⃣ Configure as Variáveis de Ambiente (`.env`)
Copie o exemplo e preencha suas chaves:
```bash
cp .env.example .env
```
```env
DATABASE_URL=postgresql://pyxie_user:pyxie_secure_pass@localhost:5432/pyxie_db
DISCORD_TOKEN=seu_discord_token
DISCORD_CLIENT_ID=seu_client_id
API_SECRET_TOKEN=seu_token_hmac
PORT=3000
```

### 4️⃣ Execute a Suíte de Testes (Quality Gate)
```bash
npm test
```
*Executa todas as 16 suítes de teste (paridade i18n, banco PostgreSQL, SEO, módulos e permissões).*

### 5️⃣ Inicie a Aplicação

| Modo | Comando | Descrição |
| :--- | :--- | :--- |
| **Painel Web + Bot** | `npm run web` | Inicia o servidor Express (`http://localhost:3000`) e o bot |
| **Apenas o Bot** | `npm start` | Inicia somente o bot no terminal |
| **Build do Frontend** | `npm run build:client` | Compila os assets do cliente Vite em `public/dist/` |
| **Registrar Comandos** | `npm run register` | Sincroniza os Slash Commands com a API do Discord |

---

## 📂 Estrutura do Repositório

```text
kuromi/
├── index.js                  # Ponto de entrada do Bot no Discord (eventos e inicialização)
├── server.js                 # Servidor Express (Rotas Web, APIs públicas e Webhooks)
├── docker-compose.yml        # Infraestrutura local do PostgreSQL 16
├── drizzle.config.js         # Configurações do Drizzle ORM
├── package.json              # Dependências e scripts npm
├── ecosystem.config.js       # Gerenciamento de processos PM2 para produção
├── deploy.sh                 # Script seguro de deploy e backup na Oracle Cloud VM
│
├── client/                   # Frontend SPA moderno em React + Vite + Three.js
│   ├── src/pages/            # Páginas (Home, Museum 3D, Wiki, Parcerias, etc.)
│   └── src/components/3d/    # Cena Three.js com dispersão esférica de Fibonacci
│
├── src/                      # Código-fonte principal
│   ├── config.js             # Configurações de ambiente, canais e constantes
│   ├── registerSlashCommands.js # Publicador de comandos slash na API do Discord
│   ├── database/             # Conexão Drizzle ORM e esquemas relacionais
│   ├── commands/             # Comandos globais modulares (/py-setup, /py-work, etc.)
│   ├── modules/              # Módulos de cogs isolados (marriage, museum, tarot, etc.)
│   ├── services/             # Lógica de negócios (Economia, Tarot, Automação, Casamento)
│   └── utils/                # Cooldowns, SEO dinâmico, i18n bilíngue, atomicidade
│
├── public/                   # Frontend estático, páginas públicas e sitemap SEO
├── data/                     # Dados de contingência local e backups a frio
├── docs/                     # Manuais técnicos e guias de arquitetura
└── tests/                    # Suíte completa de 16 testes automatizados
```

---

## 🔒 Arquitetura, Segurança & Performance

- **Zero Memory Leak:** Listeners, crons e intervalos são registrados no escopo controlado de cada módulo e limpos no `onUnload`.
- **Menor Privilégio:** Permissões estritas no convite (`/convite`), sem necessidade de permissões administrativas perigosas.
- **Paridade Bilíngue Mandatória:** 100% dos textos, comandos e embeds possuem equivalência simétrica entre `pt-BR` e `en`.
- **Honeypot de Mídia:** Entrega de imagens de comunidade via `/api/museum/art-image/:id` com marca d'água embutida via `sharp` para proteção de propriedade intelectual e divulgação orgânica.
- **Otimizado para Nuvem:** Executa em produção na Oracle Cloud Infrastructure (OCI - Ampere A1 Flex) com PM2.

---

## 📄 Licença & Propriedade Intelectual

Este projeto é disponibilizado sob a **Custom Source-Available License**.
- ✅ **Permitido:** Leitura, auditoria de segurança, estudo educacional e testes em instâncias locais/privadas.
- ❌ **Proibido:** Hospedagem pública concorrente no Discord, cobrança financeira de usuários, criação de bots derivados para fins comerciais ou distribuição não autorizada sem consentimento prévio do autor.
