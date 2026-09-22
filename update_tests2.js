const fs = require('fs');
let c = fs.readFileSync('tests/themeEmojis.test.js', 'utf8');

c = c.replace(/dice: \{ primaryId: '1551356619647094814', name: '3857nat1'/, "dice: { primaryId: '1551356619647094814', name: '96959prided20'");

fs.writeFileSync('tests/themeEmojis.test.js', c, 'utf8');
