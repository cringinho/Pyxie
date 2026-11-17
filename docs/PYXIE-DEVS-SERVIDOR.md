# Servidor Pyxie Devs (Discord)

Servidor enxuto para comunicar os jogos e projetos Roblox. **Idioma padrão: inglês**, com suporte a espanhol e português (BR). O ecossistema Pyxie Devs é em inglês; a Cringelândia continua em PT-BR.

## Estrutura (fonte: `scripts/lib/pyxieDevsBlueprint.js`)
- **START HERE**: `#welcome`, `#rules`, `#safety`, `#faq` (leitura, 3 idiomas, fixados).
- **ANNOUNCEMENTS**: `#announcements` (EN), `#anuncios-es`, `#anuncios-pt-br`, `#game-updates`, `#devlog`, `#events`.
- **COMMUNITY**: `#general`, `#comunidad-es`, `#comunidade-pt-br`, `#showcase`, `#looking-for-group`, `#off-topic`.
- **CREATORS**: `#creators-corner`.
- **HELP & FEEDBACK**: `#support`, `#bug-reports`, `#suggestions`, `#report-an-issue`.
- **VOICE**: `Lounge EN`, `Lounge ES`, `Lounge PT-BR`, `Game Party`, palco `Dev Talks` (só a equipe fala).
- **STAFF** (privado): `#staff-chat`, `#mod-log`, `#reports-inbox`.
- Cargos: `Pyxie Devs`, `Moderator` (sem Administrador), `Playtester`, `English`, `Español`, `Português (BR)`, `Updates Ping`, `Events Ping`.
- Segurança: idade mínima 13+ (regra do Discord), sem dados pessoais, sem golpes de Robux, denúncia fácil.

## Como aplicar
```bash
# 1) Simulação (só lê, não altera nada)
node scripts/setup_pyxie_devs.js --guild <ID_DO_SERVIDOR>
# 2) Criar o que falta (seguro de repetir, nunca duplica)
node scripts/setup_pyxie_devs.js --guild <ID_DO_SERVIDOR> --apply
# 3) Opcional: apagar canais fora da planta (irreversível)
node scripts/setup_pyxie_devs.js --guild <ID> --apply --prune --confirm <ID>
# 4) Só Onboarding e AutoMod
node scripts/setup_pyxie_devs.js --guild <ID> --apply --only-safety
```
Requisitos: `DISCORD_TOKEN` de um bot que esteja no servidor com permissão de Administrador. Depois, atribua o cargo `Pyxie Devs` à equipe.

## Onboarding e AutoMod
O `--apply` também configura (e `--apply --only-safety` refaz só isto):
- **Onboarding**: pergunta obrigatória de idioma (entrega o cargo e os canais de EN, ES ou PT-BR) e pergunta opcional de avisos (`Updates Ping`, `Events Ping`). 16 canais padrão.
- **AutoMod**: palavrões/conteúdo sexual, spam e golpes/links de convite, com alerta em `#mod-log` e a equipe (`Pyxie Devs`, `Moderator`) isenta. A regra padrão "Block Mention Spam" do Discord não aceita edição pela API e segue ativa.

**Hierarquia de cargos:** o bot só entrega cargos abaixo do cargo dele, mesmo sendo administrador. Se o script avisar que um cargo ficou fora do Onboarding, arraste o cargo do bot para o topo em Configurações do servidor > Cargos e rode `--apply --only-safety` de novo. Os cargos antigos do Realm (prestígio, vocações, pronomes etc.) também só podem ser apagados por quem está acima deles.
