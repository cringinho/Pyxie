# 8. Política Mandatória de SEO Profissional e Dinâmico (Web & Search Engine Trust)
Toda página web pública (`public/*.html`), rota servida pelo Express (`server.js`) ou módulo que disponibilize interface pública DEVE seguir rigorosamente os padrões de SEO técnico, rastreabilidade e integridade para mecanismos de busca (Google, Bing, Yandex, Yahoo, DuckDuckGo):

### 1. Paridade Bilíngue Mandatória no SEO
- Toda página DEVE ter metadados equivalentes e otimizados em `src/utils/seoRenderer.js` para `pt` (pt_BR) e `en` (en_US).
- **Hreflang Bidirecional Obrigatório**:
  - `<link rel="alternate" hreflang="pt-BR" href="https://pyxie.com.br/rota" />`
  - `<link rel="alternate" hreflang="en" href="https://pyxie.com.br/rota?lang=en" />`
  - `<link rel="alternate" hreflang="x-default" href="https://pyxie.com.br/rota" />`
- **Canonical URLs Estritas**:
  - A URL canônica nunca deve conter query parameters acidentais ou fragmentos hash (ex: `https://pyxie.com.br/tarot` é a canônica principal; variações `?lang=en` devem possuir tags canônicas coerentes e links alternativos autorreferenciais).
- **Sitemap Dinâmico/Estático (`public/sitemap.xml`)**:
  - Toda nova página DEVE ser registrada no `public/sitemap.xml` com as entradas canônicas em português, versões em inglês (`?lang=en`) e os blocos `xhtml:link rel="alternate"` correspondentes.

### 2. Entrega Dinâmica Otimizada para Crawlers (`seoRenderer.js`)
- Os motores de busca e rastreadores de redes sociais (WhatsApp, Twitterbot, Discordbot, Pinterestbot, Bingbot, Googlebot) NÃO esperam execução de scripts pesados do lado do cliente.
- O Express DEVE utilizar `getLocalizedHtml(pageKey, lang, publicDir)` em `server.js` para injetar em tempo de compilação/serviço os metadados corretos de `<title>`, `<meta name="description">`, OpenGraph (`og:title`, `og:description`, `og:image`, `og:locale`), Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`) e Schema.org no cabeçalho antes de entregar o HTML.

### 3. Integridade On-Page e Acessibilidade (Core Web Vitals)
- **Hierarquia Semântica Estrita**:
  - Cada página DEVE conter **exatamente 1 tag `<h1>`** descritiva e orientada a intenção de busca.
  - Subseções devem usar hierarquia estrita `<h2>` e `<h3>`.
- **Imagens e Mídia**:
  - É expressamente PROIBIDO tags `<img>` sem o atributo `alt` ou com `alt=""` vazio. Toda imagem deve ter texto alternativo descritivo em seu respectivo idioma.
  - Imagens de destaque (`og:image`) DEVEM possuir dimensões mínimas recomendadas (ex: 1200x630 para banners horizontais ou proporção 2:3 / 9:16 para cards de Tarot/Pinterest).
- **Dados Estruturados Schema.org (`application/ld+json`)**:
  - Toda página pública deve conter bloco JSON-LD válido com `@context: "https://schema.org"`.
  - Páginas de utilidades e oráculos: tipo `WebApplication` ou `CreativeWork`.
  - Documentação/Guias: tipo `TechArticle` ou `AboutPage`.
  - Página inicial: tipo `SoftwareApplication` com `offers` e `applicationCategory`.

### 4. Protocolo IndexNow e Sindicação Autônoma
- Sempre que novas rotas, páginas ou conteúdos dinâmicos forem publicados, o serviço [`src/services/indexNowService.js`](../../src/services/indexNowService.js) DEVE ser acionado para notificar instantaneamente os mecanismos de busca parceiros (Bing, Yandex, Seznam, Naver).
- Manter feeds de sindicação (`/rss.xml`, `/atom.xml`, `/feed.json`) sempre válidos e sincronizados via [`src/services/feedGenerator.js`](../../src/services/feedGenerator.js) com tags de mídia enriquecidas (`<enclosure>`, `<media:content>`) para alimentar Pinterest e agregadores externos.

### 5. Prevenção de Erros de Desindexação e Penalidades (Anti-Blackhat)
- **Proibido Cloaking ou Conteúdo Oculto Danoso**: O conteúdo entregue ao bot/crawler de busca deve refletir fielmente o conteúdo consumido pelo usuário humano.
- **Proteção do `robots.txt`**: Rotas administrativas (`/admin`, `/api/admin/`, `/console`, `/mary`) DEVEM permanecer com `Disallow` explícito no `public/robots.txt` para preservar a segurança e evitar indexação de telas de login ou dados confidenciais.
- **Quality Gate de SEO**: O teste `tests/seoBilingual.test.js` é executado obrigatoriamente dentro de `npm test`. Nenhuma alteração web pode quebrar os requisitos auditados de tags, canonicals, sitemap ou robots.
