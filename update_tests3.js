const fs = require('fs');
let c = fs.readFileSync('tests/themeEmojis.test.js', 'utf8');

c = c.replace(/ship: \{ primaryId: '1551744119670575124', name: '5407rainbowheart', animated: true \}/, "ship: { primaryId: '1551744119670575124', name: 'emoji_1551744119670575124', animated: false }");

fs.writeFileSync('tests/themeEmojis.test.js', c, 'utf8');
