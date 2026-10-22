---
trigger: glob
description: "Aplica padrões obrigatórios de performance 3D em celulares fracos, SEO bilíngue, feeds RSS, acessibilidade neurodivergente e tratamento de imagens nas páginas públicas e no frontend React/Vite."
globs: "public/**/*.html, client/src/**, server.js, src/utils/seoRenderer.js, src/services/feedGenerator.js"
---

# Regra de Engenharia Web: 3D Mobile-First, SEO, RSS e UX Seguro

## Performance 3D (Three.js) em celulares fracos

- Antes de criar um contexto WebGL, verifique `prefers-reduced-motion` e a capacidade do dispositivo (memória, `hardwareConcurrency`, falha ao obter contexto `webgl2`). Em dispositivos fracos ou com movimento reduzido, não monte a cena: exiba um fallback estático em WebP/AVIF com animação CSS suave.
- Limite o `devicePixelRatio` do renderer entre `1.0` e `2.0` e reduza-o quando o tempo de quadro cair abaixo da meta (60 FPS desktop, 30 FPS celulares de entrada).
- Proibido alocar geometrias ou materiais dentro do loop de animação. Reutilize instâncias e use `InstancedMesh` para partículas.
- Cenas estáticas renderizam sob demanda, não em loop contínuo.

## SEO, OpenGraph, RSS e JSON-LD

- Toda página pública segue a Seção 8 do `AGENTS.md`: metadados injetados via `getLocalizedHtml` / `serveLocalizedPage` (`src/utils/seoRenderer.js`), hreflang bidirecional, canonical sem query, entrada no `public/sitemap.xml` e bloco JSON-LD válido.
- Exponha `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` e mantenha `/rss.xml`, `/atom.xml` e `/feed.json` sincronizados via `src/services/feedGenerator.js`.
- Novas rotas disparam `src/services/indexNowService.js`.

## Acessibilidade neurodivergente (WCAG 2.2 e UX informado por trauma)

- Respeite WCAG 2.2 (2.4.6 cabeçalhos descritivos, 3.2.3 navegação consistente, 3.3.2 rótulos claros) e contraste mínimo de 4.5:1.
- Proibido autoplay de áudio ou vídeo. Animações em loop duram de 6 a 10 segundos e respeitam `prefers-reduced-motion`.
- Sem temporizadores regressivos ansiogênicos, sem mensagens de erro acusatórias e sem mudanças bruscas de contexto ou layout (CLS).
- Conteúdo potencialmente gatilho (self-harm, crise) fica colapsado por padrão, com aviso explícito antes de expandir.
