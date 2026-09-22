const fs = require('fs');
let c = fs.readFileSync('src/commands/commandHelpers.js', 'utf8');

c = c.replace(/explore:\s*'[^']+'/, "explore: 'https://cdn.discordapp.com/emojis/1551356273918746724.png'");
c = c.replace(/explorar:\s*'[^']+'/, "explorar: 'https://cdn.discordapp.com/emojis/1551356273918746724.png'");
c = c.replace(/bosque:\s*'[^']+'/, "bosque: 'https://cdn.discordapp.com/emojis/1551356435521339452.png'");

fs.writeFileSync('src/commands/commandHelpers.js', c, 'utf8');
