const fs = require('node:fs');
const p = 'client/src/dashboard/i18n.js';
let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const swap = (a, b, label) => {
  if (!s.includes(a)) throw new Error('ancora: ' + label);
  s = s.replace(a, b);
};

// 1. Indentação consistente (4 espaços) nas chaves novas
s = s.replace(/^  "store\.prod\./gm, '    "store.prod.');

// 2. PT: rótulo e descrição sem "Mary"
swap('    "section.maryStore": "Lojinha",', '    "section.maryStore": "Loja",', 'pt section');
swap(
  '    "sectionDesc.maryStore": "Status, estoque, PIX, tickets, respostas rápidas e modelos prontos.",',
  '    "sectionDesc.maryStore": "Status, estoque, PIX, produtos, tickets, respostas rápidas e modelos prontos.",',
  'pt desc'
);

// 3. EN: mesmas chaves e rótulo neutro
const EN = `    "store.prod.title": "Store products",
    "store.prod.hint": "Every product has price, cost, stock and a delivery type. Stock drops by itself on each sale and warns when it is running out.",
    "store.prod.name": "Product name",
    "store.prod.price": "Price (R$)",
    "store.prod.cost": "Cost (R$)",
    "store.prod.robux": "Robux delivered",
    "store.prod.delivery": "Delivery",
    "store.prod.delivery.code": "Code from stock",
    "store.prod.delivery.message": "Fixed link (gamepass)",
    "store.prod.delivery.manual": "Manual (owner delivers)",
    "store.prod.stock": "In stock",
    "store.prod.addStock": "Add stock",
    "store.prod.stockHint": "One code per line. Duplicates are ignored.",
    "store.prod.create": "Save product",
    "store.prod.empty": "No products yet. Create the first package below.",
    "store.prod.margin": "Margin",
    "store.prod.low": "Low stock",
    "store.prod.out": "Sold out",
    "store.prod.suggested": "Suggested",
    "store.prod.gamepass": "Gamepass",
    "store.prod.sales": "Sales (30 days)",
    "store.prod.revenue": "Revenue",
    "store.prod.ticket": "Average ticket",
    "store.prod.storeName": "Store name",
    "store.prod.storeNameHint": "Shown on the delivery receipt and in the Discord panels.",
    "nav.group.mary": "Store",`;

swap('    "nav.group.mary": "Mary\'s store",', EN, 'en block');
swap(
  '    "sectionDesc.maryStore": "Status, stock, PIX, tickets, quick replies and ready-made templates.",',
  '    "sectionDesc.maryStore": "Status, stock, PIX, products, tickets, quick replies and ready-made templates.",',
  'en desc'
);

fs.writeFileSync(p, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('i18n: rótulos neutros e chaves de produto nos dois idiomas');
