const fs = require('fs');
let c = fs.readFileSync('src/commands/perfil.js', 'utf8');

c = c.replace(/'🌱 \*\*YOUR BALANCE\*\*',\n        > 🌱/g, "'🌱 **YOUR BALANCE**',\n        '',\n        > 🌱");
c = c.replace(/'🌱 \*\*SEU SALDO\*\*',\n        > 🌱/g, "'🌱 **SEU SALDO**',\n        '',\n        > 🌱");

c = c.replace(/'👑 \*\*CURRENTLY EQUIPPED TITLE\*\*',\n        equippedDisplay,/g, "'👑 **CURRENTLY EQUIPPED TITLE**',\n        '',\n        equippedDisplay,");
c = c.replace(/'👑 \*\*TÍTULO ATUALMENTE EQUIPADO\*\*',\n        equippedDisplay,/g, "'👑 **TÍTULO ATUALMENTE EQUIPADO**',\n        '',\n        equippedDisplay,");

fs.writeFileSync('src/commands/perfil.js', c, 'utf8');
