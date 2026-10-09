const fs = require('fs');
const path = require('path');

const targetFiles = [
  'public/index.html',
  'public/terms.html',
  'public/wiki.html',
  'public/tarot.html'
];

targetFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) return;
  let html = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  if (html.includes('https://pyxie.com.br/assets/pyxie/pyxie_mascot.png')) {
    html = html.split('https://pyxie.com.br/assets/pyxie/pyxie_mascot.png')
               .join('https://pyxie.com.br/assets/pyxie/og_banner_hd.png');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, html, 'utf8');
    console.log('✅ Updated banner in:', relPath);
  } else {
    console.log('ℹ️ Already updated or not found in:', relPath);
  }
});

