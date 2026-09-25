# 🌸 Pyxie — Bot Mágico de Economia, Lazer & Comunidade para Discord

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-blue?style=for-the-badge&logo=node.js" alt="Node Version">
  <img src="https://img.shields.io/badge/discord.js-v14-purple?style=for-the-badge&logo=discord" alt="Discord.js">
  <img src="https://img.shields.io/badge/Status-Produção_Online-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Licença-Source--Available-pink?style=for-the-badge" alt="License">
</p>

A **Pyxie** é uma aplicação completa de entretenimento, economia virtual, lazer e integração comunitária para o Discord. Com carreiras e profissões interativas, sistema monetário dinâmico, trocas seguras de itens, Tarot místico com 78 arcanos ilustrados em Canvas, matrimônio e painel de controle web em tempo real, o projeto foi projetado para alta escalabilidade e retenção de usuários.

> ⚖️ **Aviso Legal & Propriedade Intelectual:**  
> A Pyxie é uma obra 100% original e proprietária. Todas as ilustrações, temas, sistemas, diálogos e códigos-fonte são criações autorais exclusivas, sem vínculo, afiliação ou infração de direitos de terceiros.

---

## ✨ Recursos em Destaque

### 💼 1. Economia Viva, Carreiras & Vocações
- **Sistema Monetário:** Moedinhas Mágicas 🪙 e Feijões Mágicos 🌱 (moeda nobre rara).
- **Mini-games de Trabalho (`/py-work`):** Escolha sua profissão e participe de desafios interativos para subir de nível e faturar moedas.
- **Recompensas Diárias (`/py-daily`):** Resgate de moedas com chances de bônus épico de Feijões Mágicos.
- **Rankings Globais (`/py-rank`):** Classificação em tempo real de riqueza em Moedinhas e Feijões.

### 🎒 2. Lojinha Mágica & Baús Misteriosos
- **Catálogo de Itens (`/py-shop`):** Adquira Baús Rústicos, Prateados ou Lendários, além de cafés revigorantes e relíquias raras.
- **Mochila & Inventário (`/py-inventory`):** Abra baús com surpresas de moedas e relíquias, ou venda itens sobressalentes.
- **Mercado & Trocas Seguras (`/py-trade`):** Sistema com confirmação bilateral atômica e cooldown de 30 minutos.

### 🎲 3. Minigames Rápidos & Integração Social
- **Jokenpô PvP (`/py-jokenpo`):** Desafie amigos com botões e apostas opcionais de moedas.
- **Biscoito da Sorte (`/py-cookie`):** Previsões diárias com números da sorte e bônus web.
- **Quem é Mais Provável (`/py-likely`):** Enquetes ao vivo de 60 segundos com votação interativa.
- **Dados de RPG (`/py-dice`):** Rola dados poliédricos (d4 a d100) com destaque de acertos críticos.
- **Cara ou Coroa (`/py-coinflip`):** Dobre suas moedas na sorte pura contra a Pyxie.

### 🔮 4. Tarot Místico, Amor & Casamentos
- **Tarot Místico (`/py-tarot`):** 78 cartas arcanas ilustradas com renderização nativa em Canvas e interpretações diretas e invertidas.
- **Calculadora de Afinidade (`/py-ship`):** Meça a compatibilidade de romance e amizade entre membros com artes exclusivas.
- **Matrimônio no Servidor (`/py-marriage`):** Pedidos oficiais de casamento e divórcio com registro no perfil.

### 👑 5. Customização de Perfil & Cosméticos
- **Personalização de Perfil (`/py-profile`):** Títulos raros e temas visuais coloridos (*Ouro Real, Esmeralda Mística, Nebulosa Cósmica, Rosa Neon, Fogo Carmesim*) compráveis com Feijões Mágicos.
- **Bilinguismo Nativo (PT-BR & EN):** Suporte completo e bidirecional com detecção automática de servidor e usuário.

---

## 🚀 Como Rodar o Projeto (Guia Rápido)

### 1️⃣ Instale as Dependências
Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado e execute:
```bash
npm install
```

### 2️⃣ Configure as Chaves (`.env`)
Copie o arquivo de exemplo `.env.example` e renomeie para `.env`:
```bash
cp .env.example .env
```
Abra o `.env` e preencha as variáveis:
```env
DISCORD_TOKEN=seu_discord_bot_token
DISCORD_CLIENT_ID=seu_client_id
API_SECRET_TOKEN=sua_chave_secreta_para_o_painel_web
TOPGG_WEBHOOK_SECRET=seu_secret_do_topgg
PORT=3000
```

### 3️⃣ Inicie a Aplicação

| O que você quer abrir? | Comando | No Windows | O que acontece |
| :--- | :--- | :--- | :--- |
| **Painel Web + Bot** | `npm run web` | Dê 2 cliques em `start.bat` | Abre o painel em `http://localhost:3000` e inicia o bot |
| **Apenas o Bot** | `npm start` | — | Roda somente o bot no terminal |
| **Registrar Comandos** | `npm run register` | — | Atualiza os Slash Commands no Discord |
| **Rodar Testes** | `npm test` | — | Executa a suíte de testes unitários |

---

## 📂 Estrutura do Repositório

```text
kuromi/
├── index.js                  # Ponto de entrada do Bot no Discord (eventos e inicialização)
├── server.js                 # Servidor Express do Painel Web e Webhooks (Top.gg)
├── package.json              # Dependências e scripts npm
├── ecosystem.config.js       # Configurações de processo PM2 para produção
├── deploy.sh                 # Script seguro de deploy e backup na VM
│
├── src/                      # Código-fonte principal
│   ├── config.js             # Configurações de ambiente e constantes
│   ├── registerSlashCommands.js # Publicador de comandos slash na API do Discord
│   ├── commands/             # Comandos modulares (/py-work, /py-tarot, /py-trocar, etc.)
│   ├── services/             # Lógica de negócios (Economia, Tarot, Trocas, Top.gg)
│   ├── data/                 # Catálogos estáticos (Itens, Tarot)
│   └── utils/                # Cooldowns, formatação de voz, i18n e lock de processo
│
├── public/                   # Frontend do painel web e página de bônus
├── data/                     # Banco de dados local em formato JSON
├── docs/                     # Manuais técnicos detalhados
│   ├── COMANDOS.md           # Guia completo de comandos e parâmetros
│   ├── INFRAESTRUTURA-ORACLE.md # Topologia completa da VM na Oracle Cloud (OCI)
│   └── VM-ATUALIZACAO.md     # Manual de deploy na VM e rotinas de manutenção
│
└── tests/                    # Suíte completa de testes automatizados com paridade i18n
```

---

## 🔒 Arquitetura & Segurança

- **Menor Privilégio no Convite:** Permissões estritas sem necessidade de permissões perigosas.
- **Isolamento por Servidor:** Configurações e faixas econômicas armazenadas por `guild_id`.
- **Painel Web Protegido:** Endpoints administrativos no Express protegidos por HMAC Magic Tokens e IP Allowlist.
- **Otimizado para Nuvem:** Consumo estável e leve de memória RAM, executando em produção na Oracle Cloud Infrastructure (OCI).

---

## 📄 Licença & Propriedade Intelectual

Este projeto é disponibilizado sob a **Custom Source-Available License**.
- ✅ **Permitido:** Leitura, auditoria de segurança, estudo educacional e testes em instâncias locais/privadas.
- ❌ **Proibido:** Hospedagem pública concorrente no Discord, cobrança financeira de usuários, criação de bots derivados para fins comerciais ou distribuição não autorizada.
