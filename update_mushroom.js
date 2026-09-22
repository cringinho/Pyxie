const fs = require('fs');
let c = fs.readFileSync('src/utils/appEmojis.js', 'utf8');

c = c.replace(/MUSHROOM:\s*\{[^}]+\}/, "MUSHROOM: { name: 'cogumelo', aliases: ['mushroom', 'explore'], fallback: '<:explore:1551356273918746724>' }");

fs.writeFileSync('src/utils/appEmojis.js', c, 'utf8');
