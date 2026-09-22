const fs = require('fs');
let c = fs.readFileSync('src/utils/appEmojis.js', 'utf8');

c = c.replace(/CHEST:\s*\{[^}]+\}/, "CHEST: { name: 'bau', aliases: ['chest'], fallback: '<:chest:1551744119670575124>' }");
c = c.replace(/TREE:\s*\{[^}]+\}/, "TREE: { name: 'bosque', aliases: ['tree', 'arvore'], fallback: '<:tree:1551356435521339452>' }");

fs.writeFileSync('src/utils/appEmojis.js', c, 'utf8');
console.log('Updated appEmojis');
