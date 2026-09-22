const fs = require('fs');
let c = fs.readFileSync('src/utils/appEmojis.js', 'utf8');

if (!c.includes('MAP:')) {
  c = c.replace(/(PORTAL:\s*\{[^}]+\},)/, "\n  MAP: { name: 'mapa', aliases: ['map'], fallback: '<:map:1551355962974273546>' },");
  fs.writeFileSync('src/utils/appEmojis.js', c, 'utf8');
}
