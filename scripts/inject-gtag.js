const fs = require('fs');
const path = require('path');

const GTAG_SNIPPET = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-T4CBHKWHH6"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-T4CBHKWHH6');
  </script>
`;

const publicPages = [
  'public/index.html',
  'public/terms.html',
  'public/wiki.html',
  'public/tarot.html',
  'public/bonus.html',
  'public/museum.html',
  'public/partnerships.html',
  'src/modules/seasonal/views/rankingSazonal.ejs'
];

publicPages.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) return;
  let html = fs.readFileSync(fullPath, 'utf8');

  if (html.includes('G-T4CBHKWHH6')) {
    console.log('Already present in:', relPath);
    return;
  }

  // Insert right after <head> or <head ...>
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/(<head[^>]*>\r?\n)/i, `$1${GTAG_SNIPPET}`);
    fs.writeFileSync(fullPath, html, 'utf8');
    console.log('✅ Injected Google Analytics gtag into:', relPath);
  } else {
    console.warn('⚠️ No <head> tag found in:', relPath);
  }
});

