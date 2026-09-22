const fs = require('fs');
let c = fs.readFileSync('src/commands/economyHelpers.js', 'utf8');

c = c.replace(
  "t('profile.treasureHeader', source),\n    t('profile.coins'",
  "t('profile.treasureHeader', source),\n    '',\n    t('profile.coins'"
);

c = c.replace(
  "t('profile.careerHeader', source),\n    t('profile.profession'",
  "t('profile.careerHeader', source),\n    '',\n    t('profile.profession'"
);

c = c.replace(
  "t('profile.socialHeader', source),\n    marriageDisplay",
  "t('profile.socialHeader', source),\n    '',\n    marriageDisplay"
);

fs.writeFileSync('src/commands/economyHelpers.js', c, 'utf8');
