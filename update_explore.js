const fs = require('fs');
let c = fs.readFileSync('src/commands/explore.js', 'utf8');

c = c.replace(/const locEmojiKey = LOCATION_EMOJIS\[n\.location\.id\] \|\| 'PORTAL';/, "const locEmojiKey = 'MAP';");

fs.writeFileSync('src/commands/explore.js', c, 'utf8');
