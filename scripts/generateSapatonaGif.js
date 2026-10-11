/**
 * Script para baixar e redimensionar o GIF "sapatona" mantendo a mesma proporção
 * compacta do GIF "viadinho fofinho" (174x174 px).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const GIF_URL = 'https://static2.klipy.com/ii/4493325008d34b7bf8cd6813cd5c1619/94/1b/tAZCIkR3Ydv1.gif';
const TARGET_PATH = path.join(__dirname, '..', 'assets', 'sapatona_small.gif');
const TEMP_PATH = path.join(__dirname, '..', 'assets', 'sapatona_raw.gif');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  console.log('Baixando GIF da Klipy...');
  await download(GIF_URL, TEMP_PATH);

  console.log('Redimensionando GIF para 174x174 compact com sharp...');
  await sharp(TEMP_PATH, { animated: true })
    .resize(174, 174)
    .gif({ colours: 128 })
    .toFile(TARGET_PATH);

  fs.unlinkSync(TEMP_PATH);
  console.log('GIF sapatona_small.gif gerado com sucesso em:', TARGET_PATH);
}

main().catch(console.error);
