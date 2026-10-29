---
name: browser-and-screenshot
description: "Controla navegadores headless e captura prints de telas, embeds e componentes do dashboard da Pyxie via Chrome/Puppeteer/Playwright. Use para auditar visualmente páginas web, rotas do painel e layouts sem desperdiçar tokens lendo código linha por linha."
---

# Controle de Navegador e Captura de Screenshots

Esta skill define o protocolo para inspecionar e capturar telas do painel web e páginas públicas da Pyxie de forma automatizada, evitando a leitura linha a linha de arquivos grandes no contexto do agente.

## 1. Princípios de Economia de Tokens
- **Zero leituras gigantescas de código**: Para inspecionar visualmente um componente ou página, execute um script de captura de tela em vez de ler 1.000 linhas de JSX.
- **Captura Seletiva**: Capture a tela inteira (`fullPage: true`) ou selecione apenas o seletor do componente (ex.: `.dash-card`, `#hub-preview`).
- **Armazenamento de Evidências**: Salve capturas em `data/screenshots/` ou na pasta de artefatos do agente.

## 2. Execução Automatizada via Node.js
Quando precisar inspecionar a interface ou tirar prints de verificação:

```javascript
// Exemplo de script de captura rápida (Puppeteer / Chrome DevTools)
const puppeteer = require('puppeteer');

async function captureScreen(url, outputPath, selector = null) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  if (selector) {
    const element = await page.$(selector);
    if (element) {
      await element.screenshot({ path: outputPath });
      await browser.close();
      return;
    }
  }

  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
}
```

## 3. Verificação do Dashboard Local
- Inicie o servidor do dashboard em porta de teste quando necessário (`npm run dev` ou `node server.js`).
- Navegue para as rotas `#guild/<id>/automations`, `#guild/<id>/tickets`, etc.
- Inspecione elementos através do DOM e capture o estado renderizado para diagnóstico imediato.

