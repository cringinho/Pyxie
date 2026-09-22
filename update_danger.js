const fs = require('fs');
let c = fs.readFileSync('src/utils/i18n.js', 'utf8');

c = c.replace(/"dangerLevel": "⚡ \*\*Perigo:\*\* Tier \{tier\} • Penalidade por Falha Crítica: Ban de \{banMinutes\}m"/, '"dangerLevel": "⚡ **Perigo:** {tier} • Penalidade por Falha Crítica: Ban de {banMinutes}m"');
c = c.replace(/"dangerLevel": "⚡ \*\*Danger:\*\* Tier \{tier\} • Critical Failure Penalty: \{banMinutes\}m Room Ban"/, '"dangerLevel": "⚡ **Danger:** {tier} • Critical Failure Penalty: {banMinutes}m Room Ban"');

fs.writeFileSync('src/utils/i18n.js', c, 'utf8');

let exp = fs.readFileSync('src/commands/explore.js', 'utf8');
exp = exp.replace(/tier:\s*location\.tier\s*\|\|\s*1,/, "tier: 'T' + (location.tier || 1) + ' ' + '<:skull:1551356384451493968>'.repeat(location.tier || 1),");
fs.writeFileSync('src/commands/explore.js', exp, 'utf8');

console.log('Updated dangerLevel');
