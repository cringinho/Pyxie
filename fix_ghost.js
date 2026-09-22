const fs = require('fs');
let c = fs.readFileSync('src/commands/grimorio.js', 'utf8');

c = c.replace(/👻 \$\{t\('gloom\.grimoire\.phantomCoins', source, \{ coins: user\.phantomCoins \}\)\}/g, "${t('gloom.grimoire.phantomCoins', source, { coins: user.phantomCoins })}");

fs.writeFileSync('src/commands/grimorio.js', c, 'utf8');
