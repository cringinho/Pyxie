const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

c = c.replace(/tier\.textContent = loc\.tierLabel\[currentLang\] \|\| loc\.tierLabel\.pt;/, "tier.innerHTML = 'T' + loc.tier + ' ' + '<img src=\"https://cdn.discordapp.com/emojis/1551356384451493968.png\" style=\"width: 1em; vertical-align: text-bottom;\">'.repeat(loc.tier);");

fs.writeFileSync('public/index.html', c, 'utf8');
