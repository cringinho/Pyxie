const fs = require('fs');
let c = fs.readFileSync('src/commands/economyHelpers.js', 'utf8');

const descLines = [
  "  const description = [",
  "    bioQuote,",
  "    '',",
  "    t('profile.treasureHeader', source),",
  "    '',",
  "    t('profile.coins', source, { coins: coinsVal.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR') }),",
  "    t('profile.magicBeans', source, { beans: magicBeansVal.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR') }),",
  "    t('profile.ranking', source, { rank: rankStr }),",
  "    '',",
  "    t('profile.careerHeader', source),",
  "    '',",
  "    t('profile.profession', source, { profession: professionLabel || t('profile.noProfession', source) }),",
  "    t('profile.workCount', source, { count: workVal }),",
  "    t('profile.dedication', source, { level: dedicationLevel }),",
  "    '',",
  "    t('profile.socialHeader', source),",
  "    '',",
  "    marriageDisplay,",
  "  ].join('\\n');"
].join('\n');

c = c.replace(/  const description = \[\s*bioQuote,\s*'',\s*t\('profile\.treasureHeader', source\),[\s\S]*?marriageDisplay,\s*\]\.join\('\\n'\);/, descLines);

fs.writeFileSync('src/commands/economyHelpers.js', c, 'utf8');
