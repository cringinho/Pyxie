# Módulo Pyxie Hyperfokus (Portal Editorial do Fórum)

Módulo responsável pela curadoria, moderação e publicação editorial de tópicos do fórum de Hiperfocos da Cringelândia (`1453890868980482090`) no portal editorial público da Pyxie (`/hyperfokus`).

## 1. Responsabilidades
- **Thread Guard:** Proteção de rascunhos no fórum Discord (apenas autor e coautores digitam durante a fase `DRAFT`).
- **Sticky com Debounce:** Orientação dinâmica de coautoria (`/py-add` e `py!add`) e conclusão (`/py-concluir` e `py!concluir`).
- **Pipeline de Validação:** Envio do rascunho formatado para moderação no `/dashboard`.
- **Publicação & SEO:** Conversão de Markdown para HTML sanitizado, arquivamento de mídia para `.webp` local, geração de OpenGraph (1200x630), Pinterest Pin (1000x1500), ping IndexNow e sitemap.
- **Celebração:** Substituição do sticky por embed oficial celebrando os autores e apontando o link do blog.

## 2. Estrutura de Arquivos
- `index.js`: Ciclo de vida (`onLoad`, `onUnload`, listeners, agendadores só no bot).
- `threadGuard.js`: Interceptação de mensagens, remoção de intromissões com aviso educado e debounce de sticky.
- `draftStore.js`: Armazenamento atômico de rascunhos em `data/hyperfokus/drafts.json`.
- `articleStore.js`: Persistência relacional (PostgreSQL / Drizzle) e fallback seguro em `data/hyperfokus/articles.json`.
- `mediaArchiver.js`: Download seguro e conversão de mídias Discord para WebP local.
- `markdown.js`: Parser de Markdown com sanitização rigorosa anti-XSS e estruturação de cabeçalhos.
- `seoEngine.js`: Geração de JSON-LD (`BlogPosting`, `BreadcrumbList`), linkagem interna e feeds.
- `imageCards.js`: Geração visual via sharp (OG 1200x630, Pin 1000x1500 e marca d'água).
- `pinScheduler.js`: Agendamento estrito de 3 pins/dia para o Pinterest.
- `commands/`:
  - `pyAdd.js`: Adicionar coautor ao rascunho (`/py-add`, `py!add`).
  - `pyConcluir.js`: Concluir rascunho e enviar para revisão (`/py-concluir`, `py!concluir`).

## 3. Escopo e Segurança
- Módulo restrito ao escopo da Cringelândia (`CRINGELANDIA_GUILD_ID`).
- Agendadores rodam estritamente quando `ctx.isBotProcess` for verdadeiro.
- Zero dados de exemplo (Zero Mock Policy).

