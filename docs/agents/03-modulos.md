# 3. Arquitetura de Subsistemas & Módulos Dinâmicos (`src/services/moduleManager.js`)
A Pyxie utiliza uma arquitetura de **Monólito Modular** com subsistemas isolados gerenciados pelo `moduleManager`:
1. **Módulos Opcionais Nativos do Bot (`src/modules/*`)**:
   - Módulos como Matrimônio (`marriage`) e Eventos Sazonais (`seasonal`) pertencem ao ecossistema global do bot, mas operam desacoplados com ciclo de vida próprio (`onLoad`, `onUnload`, listeners dedicados e crons).
   - Podem ser ligados ou desligados dinamicamente em tempo de execução sem reinicializar o processo e sem interferir nos comandos principais.
2. **Módulo SaaS Isolado (Estúdio da Mary - `src/modules/mary-studio/`)**:
   - Opera como um subsistema SaaS restrito e dedicado exclusivamente ao servidor e à identidade da Mary (`MARY_DEFAULT_GUILD_ID`).
   - As telas ficam no `/dashboard`, na zona `mary` (Lojinha, Ferramentas Robux, Aparência da Pyxie e o estúdio de mensagens com os botões da lojinha), com login pelo Discord e acesso só da Mary e do dono. A API é `/api/dashboard/guilds/<id>/mary/*`; os dados ficam em `data/mary*.json`. Não há mais app web próprio nem link mágico.
   - Permite personalização do perfil local da Pyxie (`PATCH /guilds/{guildId}/members/@me` para nick, avatar e banner) exclusivamente na guilda da Mary, sem alterar em nada a identidade visual global da Pyxie em outros servidores.
3. **Monitoramento e Condição dos Subsistemas**:
   - A condição operacional, status de ativação e saúde de cada módulo são monitorados e expostos via `moduleManager.getStatus()`, rota `/api/status`, painel `/admin` e comando `/py-status`.
