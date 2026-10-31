/**
 * Injeta uma defesa de acessibilidade para "texto com gradiente" em todas as páginas
 * públicas. Gradiente em texto depende de `-webkit-text-fill-color: transparent`;
 * quando o navegador ignora isso (contraste forçado, alto contraste, modo de leitura),
 * o texto fica transparente ou escuro sobre fundo escuro.
 *
 * O bloco entra antes de `</head>`, com id fixo, e é idempotente: rodar duas vezes
 * não duplica nada. Não altera o visual quando o gradiente funciona.
 *
 * Uso: node scripts/inject-text-fallback.js [--check]
 */
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MARKER = 'id="pyxie-text-fallback"';

const BLOCK = `  <style ${MARKER}>
    /* Defesa: se o navegador não honrar texto com gradiente, volta para cor sólida. */
    @media (forced-colors: active), (prefers-contrast: more) {
      h1, h2, h3, [class*="title"], [class*="gradient"] {
        -webkit-text-fill-color: currentColor !important;
        background-image: none !important;
      }
    }
    @supports not ((-webkit-background-clip: text) or (background-clip: text)) {
      h1, h2, h3, [class*="title"], [class*="gradient"] {
        -webkit-text-fill-color: currentColor !important;
        background-image: none !important;
      }
    }
  </style>
`;

const checkOnly = process.argv.includes('--check');
const files = fs.readdirSync(PUBLIC_DIR).filter((f) => f.endsWith('.html'));
let changed = 0;
let already = 0;
const pending = [];

for (const file of files) {
  const full = path.join(PUBLIC_DIR, file);
  const html = fs.readFileSync(full, 'utf8');
  if (html.includes(MARKER)) {
    already += 1;
    continue;
  }
  if (!html.includes('</head>')) {
    pending.push(`${file} (sem </head>)`);
    continue;
  }
  if (checkOnly) {
    pending.push(file);
    continue;
  }
  fs.writeFileSync(full, html.replace('</head>', `${BLOCK}</head>`), 'utf8');
  changed += 1;
}

if (checkOnly) {
  if (pending.length) {
    console.log(`⚠️ Sem a defesa de texto (${pending.length}): ${pending.join(', ')}`);
    process.exit(1);
  }
  console.log(`✅ Todas as ${already} páginas já têm a defesa de texto.`);
  process.exit(0);
}

console.log(`✅ Defesa injetada em ${changed} página(s); ${already} já tinham.`);
if (pending.length) console.log(`⚠️ Ignoradas: ${pending.join(', ')}`);
