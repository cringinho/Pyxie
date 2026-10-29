---
name: visual-qa
description: Roteiro e checklist automatizado de validação visual, responsividade, acessibilidade e SEO do Pyxie Hyperfokus.
---

# Visual QA & Quality Gate — Pyxie Hyperfokus

## 1. Checklist de Responsividade e Temas
Para cada página nova ou alterada no blog (`/hyperfokus*`):
- [ ] **Viewports:**
  - [ ] Mobile: 360px de largura (sem overflow horizontal, margens mínimas de 16px).
  - [ ] Tablet: 768px de largura.
  - [ ] Desktop: 1440px de largura.
- [ ] **Bilinguismo:**
  - [ ] `?lang=pt`: 100% dos textos em Português.
  - [ ] `?lang=en`: 100% dos textos em Inglês, sem misturas.
- [ ] **Acessibilidade:**
  - [ ] Zoom do navegador em 200%: layout flexível sem quebras ou sobreposição.
  - [ ] Controles de leitura (A-/A+, fontes disléxicas): aplicam apenas CSS no cliente, sem afetar SEO.
  - [ ] `prefers-reduced-motion`: transições e animações suspensas.
  - [ ] Zero erros críticos no `axe-core`.
- [ ] **Estados da Interface:**
  - [ ] Vazio (sem artigos cadastrados).
  - [ ] Carregando (Spinner oficial da Pyxie).
  - [ ] Com artigos reais.
  - [ ] Deslogado (modal de convite suave ao curtir/comentar) e Logado.
  - [ ] Coautores: 1 autor, 2 autores e lista expandida (+N outros em modal).

## 2. Auditoria de Imagens Geradas
Salvas em `data/screenshots/hyperfokus/<fase>/`:
- [ ] **OpenGraph (1200×630):** Título legível, acentuação correta, avatares redondos, margens de segurança.
- [ ] **Pinterest Pin (1000×1500):** Vertical, tipografia destacada, branding sutil, sem IDs do Discord.
- [ ] **Share Image com Marca d'Água:** Barra inferior `#121216` com logo, autor e URL oficial, contraste ≥ 4.5:1.

## 3. SEO e SSR
- [ ] **SSR no Express:** `curl -A "Googlebot" http://localhost:PORT/hyperfokus/<slug>` retorna o artigo renderizado no HTML puro.
- [ ] **Paridade Robô/Humano:** Zero cloaking (mesmo conteúdo servido para bots e navegadores).
- [ ] **JSON-LD Válido:** Tipo `BlogPosting`, `headline`, `author`, `image`, `datePublished`.
- [ ] **Estrutura:** Exatamente um `<h1>` por página; todas as `<img>` possuem `alt` descritivo.
- [ ] **Feeds & Sitemaps:** `/sitemap-hyperfokus.xml` e `/hyperfokus/rss.xml` válidos.

## 4. Script Auxiliar de Captura (Playwright / Node)
Pode ser executado com Node:
```javascript
// scripts/capture_hyperfokus_qa.js
const { chromium } = require('playwright');
// Navega pelas rotas em 360, 768 e 1440px salvando em data/screenshots/hyperfokus/
```
