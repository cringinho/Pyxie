const fs = require('fs');
let content = fs.readFileSync('public/index.html', 'utf8');

// 1. Pyxie Logo
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444149785694238\.gif" alt="Pyxie" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551356640782057502\.gif" alt="Pyxie" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1551356640782057502.gif" alt="Pyxie" />');

// 2. Comandos (nav bar)
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444319730499664\.gif" class="emoji-icon" alt="commands" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444173747621918\.gif" class="emoji-icon" alt="commands" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548444173747621918.gif" class="emoji-icon" alt="commands" />');

// 3. Bonus (nav bar) - already replaced maybe, but let's check
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444204202459136\.gif" class="emoji-icon" alt="gift" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548443978414817331\.png" class="emoji-icon" alt="gift" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548443978414817331.png" class="emoji-icon" alt="gift" />');

// 4. Hero actions - Wings
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444149785694238\.gif" class="emoji-icon" alt="wings" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551356640782057502\.gif" class="emoji-icon" alt="wings" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1551356640782057502.gif" class="emoji-icon" alt="wings" />');

// 5. Hero actions - Bonus
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444204202459136\.gif" class="emoji-icon" alt="gift" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548443978414817331\.png" class="emoji-icon" alt="gift" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548443978414817331.png" class="emoji-icon" alt="gift" />');

// 6. Stats - Commands
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444319730499664\.gif" class="emoji-icon-lg" alt="controller" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444173747621918\.gif" class="emoji-icon-lg" alt="controller" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548444173747621918.gif" class="emoji-icon-lg" alt="controller" />');

// 7. Stats - Users
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551356277194625224\.gif" class="emoji-icon-lg" alt="kuromi" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551355544185344112\.png" class="emoji-icon-lg" alt="kuromi" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1551355544185344112.png" class="emoji-icon-lg" alt="kuromi" />');

// 8. Stats - Messages
content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444230588956683\.gif" class="emoji-icon-lg" alt="coin" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548443880066777098\.gif" class="emoji-icon-lg" alt="coin" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548443880066777098.gif" class="emoji-icon-lg" alt="coin" />');

fs.writeFileSync('public/index.html', content, 'utf8');
console.log('Done replacement.');
