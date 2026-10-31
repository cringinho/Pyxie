# Mobile P0 — viewport dinâmico e GPU

Correções que valem para **todas** as páginas públicas (`public/*.html`).

## 1. `dvh` com fallback

Todo `100vh` virou um par:

```css
min-height: 100vh;   /* fallback para navegador antigo */
min-height: 100dvh;  /* altura real: barra de endereço móvel já descontada */
```

19 páginas, 24 declarações (`min-height`, `height`, `calc(100vh - 100px)` no wiki).
Onde não há suporte a `dvh`, a primeira declaração continua valendo — nada quebra.

## 2. Orçamento de `backdrop-filter`

O index tinha **28** camadas de `blur`. Em celular modesto isso vira GPU ocupada: scroll
travado e bateria. Bloco injetado em todas as páginas:

```html
<style id="pyxie-mobile-perf">
  @media (max-width: 768px) { * { backdrop-filter: none !important; } }
  @media (prefers-reduced-transparency: reduce) { * { backdrop-filter: none !important; } }
</style>
```

Os fundos já são `rgba` com alfa alto, então o contraste se mantém — muda só o custo.
Quem liga "reduzir transparência" no sistema também ganha o modo sólido.

## 3. Como conferir

Em 360×740 com emulação móvel:

```js
// console do DevTools
document.documentElement.scrollWidth - innerWidth;  // 0 = sem overflow
[...document.querySelectorAll('*')].filter(el => getComputedStyle(el).backdropFilter !== 'none').length; // 0
CSS.supports('height', '100dvh');                   // true
```

Medido em produção (31/10/2026): overflow `0`, blur `0`, **A11y 100**, **SEO 100**
(mobile, Lighthouse). Best Practices 77 vem de terceiros (emojis do Discord e o script do
AdSense/cookies), não do nosso código.

## 4. O que ainda falta neste tema

- Teste manual em 200% de zoom (página de planos e wiki).
- `backdrop-filter` no desktop acima de 768px segue ligado — é intencional (GPU sobra).
