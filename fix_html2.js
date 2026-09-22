const fs = require('fs');
let content = fs.readFileSync('public/index.html', 'utf8');

content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551356441112084641\.gif" class="emoji-icon-xl" alt="career" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444230588956683\.gif" class="emoji-icon-xl" alt="career" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548444230588956683.gif" class="emoji-icon-xl" alt="career" />');

content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551356299500064858\.gif" class="emoji-icon-xl" alt="diamond" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548443880066777098\.gif" class="emoji-icon-xl" alt="diamond" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548443880066777098.gif" class="emoji-icon-xl" alt="diamond" />');

content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551356087611957269\.gif" class="emoji-icon-xl" alt="tarot" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1548444111319605330\.gif" class="emoji-icon-xl" alt="tarot" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1548444111319605330.gif" class="emoji-icon-xl" alt="tarot" />');

content = content.replace(/<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551356415543742554\.gif" class="emoji-icon-xl" alt="heart" \/>\s*<img src="https:\/\/cdn\.discordapp\.com\/emojis\/1551355541148667954\.gif" class="emoji-icon-xl" alt="heart" \/>/g, '<img src="https://cdn.discordapp.com/emojis/1551355541148667954.gif" class="emoji-icon-xl" alt="heart" />');

fs.writeFileSync('public/index.html', content, 'utf8');
