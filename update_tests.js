const fs = require('fs');
let c = fs.readFileSync('tests/themeEmojis.test.js', 'utf8');

c = c.replace(/dice: \{ primaryId: '1551355542700822538'/, "dice: { primaryId: '1551356619647094814'");
c = c.replace(/ship: \{ primaryId: '1551355720874725386'/, "ship: { primaryId: '1551744119670575124'");

fs.writeFileSync('tests/themeEmojis.test.js', c, 'utf8');
