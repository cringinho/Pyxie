const fs = require('fs');
let c = fs.readFileSync('src/utils/appEmojis.js', 'utf8');

c = c.replace(/CROWN:\s*\{[^}]+\}/, "CROWN: { name: 'coroa', aliases: ['crown'], fallback: '<:crown:1551356621316300890>' }");

fs.writeFileSync('src/utils/appEmojis.js', c, 'utf8');
