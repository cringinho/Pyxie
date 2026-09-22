const fs = require('fs');
let c = fs.readFileSync('src/commands/perfil.js', 'utf8');

c = c.replace(/'🌱 \*\*YOUR BALANCE\*\*',\r?\n\s+> 🌱/g, "'🌱 **YOUR BALANCE**',\n        '',\n        > 🌱");
c = c.replace(/'🌱 \*\*SEU SALDO\*\*',\r?\n\s+> 🌱/g, "'🌱 **SEU SALDO**',\n        '',\n        > 🌱");

c = c.replace(/'👑 \*\*CURRENTLY EQUIPPED TITLE\*\*',\r?\n\s+equippedDisplay,/g, "'👑 **CURRENTLY EQUIPPED TITLE**',\n        '',\n        equippedDisplay,");
c = c.replace(/'👑 \*\*TÍTULO ATUALMENTE EQUIPADO\*\*',\r?\n\s+equippedDisplay,/g, "'👑 **TÍTULO ATUALMENTE EQUIPADO**',\n        '',\n        equippedDisplay,");

fs.writeFileSync('src/commands/perfil.js', c, 'utf8');
