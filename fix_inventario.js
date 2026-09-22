const fs = require('fs');
let c = fs.readFileSync('src/commands/inventario.js', 'utf8');

c = c.replace(/description: rDesc\.slice\(0, 100\),/g, "description: (rDesc || 'Relíquia').slice(0, 100),");

fs.writeFileSync('src/commands/inventario.js', c, 'utf8');
