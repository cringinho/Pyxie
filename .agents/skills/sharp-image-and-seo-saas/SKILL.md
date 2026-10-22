---
name: sharp-image-and-seo-saas
description: "Implementa o pipeline de edição automática de imagens com Sharp, geração de SEO bilíngue, JSON-LD e feeds RSS, e fluxos de monetização da Pyxie. Utiliza-se ao trabalhar com processamento de imagens, cards OpenGraph, páginas web públicas, sitemap, feeds ou recursos premium."
---

# Protocolo de Processamento de Imagem, SEO Autônomo e Monetização

## 1. Pipeline Sharp para legibilidade e estética profissional

Sempre que uma imagem for processada para o site, cards OpenGraph ou banners do bot, aplique:

```js
const sharp = require('sharp');

const pipeline = sharp(inputBuffer)
  .rotate()
  .normalize()
  .modulate({ brightness: 1.02, saturation: 1.08 })
  .sharpen({ sigma: 1.15, m1: 1.0, m2: 2.0 });

const webp = await pipeline.clone().webp({ quality: 84 }).toBuffer();
const avif = await pipeline.clone().avif({ quality: 75 }).toBuffer();
```

- Com texto sobreposto, componha um gradiente protetor via `.composite()` garantindo contraste mínimo de 4.5:1 (WCAG AA).
- Sirva variantes responsivas com `srcset` para não entregar resolução cheia em celulares 4G.
- `sharp` já é carregado em `server.js` e `src/modules/museum/museumManager.js`. Reutilize esses pontos em vez de criar novas instâncias soltas.
- Imagens `og:image`: mínimo 1200x630 (banner) ou 2:3 / 9:16 (cards de tarot, Pinterest). Scripts de referência: `scripts/generate-og-banner.js`, `scripts/update-og-images.js`.

## 2. SEO, JSON-LD e feeds RSS

Siga a Seção 8 do `AGENTS.md`:

1. Metadados `pt` e `en` em `src/utils/seoRenderer.js`, servidos por `getLocalizedHtml` / `serveLocalizedPage` em `server.js`.
2. Hreflang bidirecional (`pt-BR`, `en`, `x-default`) e canonical sem query.
3. Entrada em `public/sitemap.xml` com alternates.
4. Bloco `<script type="application/ld+json">` com o tipo correto (`SoftwareApplication`, `WebApplication`, `TechArticle`).
5. Feeds `/rss.xml`, `/atom.xml`, `/feed.json` e o feed do Pinterest atualizados via `src/services/feedGenerator.js`, com `<enclosure>` e `<media:content>`.
6. Notificação de novas URLs via `src/services/indexNowService.js`.
7. `tests/seoBilingual.test.js` deve passar.

## 3. Monetização sem mocks

- Recursos premium consultam fontes reais: Entitlements e SKUs da API de Monetização do Discord e, quando existirem, registros de assinatura no PostgreSQL (Drizzle) alimentados por webhooks verificados.
- Nenhuma liberação de recurso premium ou crédito de moeda sem cooldown, atomicidade e validação de permissão (Seção 5 do `AGENTS.md`).
- Comandos que alteram economia continuam exclusivos do criador (`OWNER_SNOWFLAKE = '214153735281180673'`).
