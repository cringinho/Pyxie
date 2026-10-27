# Diretrizes da Pyxie & Cringelândia (núcleo)

Regras inegociáveis. O detalhe de cada uma está em `docs/agents/` (abra só o arquivo do assunto da tarefa). Os números batem com as referências "AGENTS.md §N" no código.

1. **Bilíngue PT-BR/EN** ([detalhe](docs/agents/01-bilingue.md)). Nada em um idioma só: toda chave de `src/utils/i18n.js` tem par em `pt` e `en` com os mesmos placeholders. Slash com nome/descrição em inglês + `setDescriptionLocalizations({ 'pt-BR' })`; prefixo `py!` com apelidos PT e EN; zero texto fixo ao usuário (`t()`); páginas aceitam `?lang=pt|en`.
2. **Testes** ([detalhe](docs/agents/02-testes.md)). `npm test` 100% antes de encerrar qualquer tarefa (inclui o teste de fumaça de todos os comandos). No Windows, `scripts/test-safe.sh` protege `data/`.
3. **Módulos** ([detalhe](docs/agents/03-modulos.md)). Monólito modular em `src/services/moduleManager.js`; cada módulo com ciclo de vida próprio, `README.md`, e agendadores só no processo do bot.
4. **Ajuda e catálogo** ([detalhe](docs/agents/04-ajuda-e-catalogo.md)). Fonte única: `COMMAND_CATEGORY_MAP`/`MODULE_METADATA` e `/api/commands`; nada de lista fixa no HTML. Comandos de economia (`/py-seteco`, `/py-reseteco`, `/py-ecoconfig`, `/py-admin`) são só do dono `214153735281180673`.
5. **Economia** ([detalhe](docs/agents/05-economia.md)). Minigames de recreação não dão moedas. Toda moeda nova tem teto, cooldown, atomicidade e permissão.
6. **Persistência** ([detalhe](docs/agents/06-persistencia.md)). PostgreSQL + Drizzle para transações; JSON em `data/` sempre com escrita atômica (`.tmp` + rename).
7. **Emojis** ([detalhe](docs/agents/07-emojis.md)). Proibido o portal do Minecraft (`portalframe98`, `1548444170488778954`); use o mapa `<:map:1551355962974273546>`.
8. **SEO** ([detalhe](docs/agents/08-seo.md)). Toda página pública: metadados PT/EN no `seoRenderer.js`, hreflang, canonical sem query, sitemap, um `<h1>`, `alt` em toda imagem, JSON-LD, IndexNow. Áreas privadas com `Disallow` no `robots.txt`.
9. **Embeds** ([detalhe](docs/agents/09-embeds.md)). Título curto com um emoji; espaçamento `\n\n`; `###`, `-#` e `>` do Discord; nada de divisores ASCII; números em `` `código` ``; links mascarados; `setFooter({ text })`.
10. **Painel e governança** ([detalhe](docs/agents/10-painel-e-governanca.md)). Toda entrega aparece no código, no painel (`/dashboard`) e, quando couber, no site. O backend recusa o que a tela esconde. O `/admin` antigo está em transição: nada novo lá.
11. **Prévias** ([detalhe](docs/agents/11-previas.md)). Embed ou mensagem nova/alterada → prévia real no canal `1461937203214024891`, sem pings (menções entre crases, `allowedMentions` vazio).
12. **Missão, persona e stack** ([detalhe](docs/agents/12-missao-e-stack.md)). Comunidade segura para pessoas neurodivergentes e em sofrimento. Pyxie tsundere nos jogos; calorosa e sem ironia em acolhimento, desabafo, crise e segurança. Stack fixa: Node 22 CommonJS, discord.js 14, Express 5, React+Vite+Tailwind no `client/`, PostgreSQL+Drizzle, PM2 na VM Oracle. Zero mock. `AGENTS.md` e `GEMINI.md` idênticos.
13. **Estúdio de mensagens** ([detalhe](docs/agents/13-estudio.md)). Mensagens customizadas de servidor nascem no estúdio do painel, não em código (guia: `docs/GUIA-ESTUDIO-MENSAGENS.md`).

**Zonas** (`src/config/scopes.js`): Global (todos os servidores), Cringelândia `1453890868980482090` (Catacumbas, chefe, Casinha, Oficina, Mercado, Festival, Passe, sazonal, comunidade) e Mary `1557399041443111025` (estúdio da lojinha). Plano em curso: `reestruturarCringelandia.md` do dono.
