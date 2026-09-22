const fs = require('fs');
let c = fs.readFileSync('src/commands/inventario.js', 'utf8');

c = c.replace(/description: item \? \(item\.description \|\| ''\)\.slice\(0, 100\) : Quantidade: \$\{count\}/g, "description: item ? (item.description || Quantidade: +count).slice(0, 100) : Quantidade: +count");

fs.writeFileSync('src/commands/inventario.js', c, 'utf8');
