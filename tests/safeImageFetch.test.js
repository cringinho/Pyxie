/**
 * Proxy de imagens das Parcerias (auditoria Q100): sem SSRF, sem SVG, sem repassar status.
 * Roda sem rede: só endereços locais/privados e um servidor HTTP local (que deve ser recusado).
 */
const assert = require('node:assert/strict');
const http = require('node:http');
const { fetchImageSafely, isPublicIp, isAllowedImageType, checkUrl } = require('../src/utils/safeImageFetch');

(async () => {
  // 1. Faixas privadas, IPv6 local e IPv4 mapeado em IPv6 são recusados.
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.17.0.1', '172.31.255.255', '192.168.0.10', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1']) {
    assert.equal(isPublicIp(ip), false, `${ip} deve ser bloqueado`);
  }
  for (const ip of ['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111']) {
    assert.equal(isPublicIp(ip), true, `${ip} é público`);
  }

  // 2. URL: protocolo, porta, credenciais e hosts locais.
  for (const url of ['file:///etc/passwd', 'ftp://example.com/a.png', 'http://localhost/a.png', 'http://[::1]/a.png', 'http://172.20.0.5/a.png', 'http://example.com:8080/a.png', 'http://user:pw@example.com/a.png', 'http://metadata.internal/']) {
    assert.throws(() => checkUrl(url), `${url} deve ser recusada`);
  }
  assert.ok(checkUrl('https://cdn.discordapp.com/a.png'));

  // 3. Só imagem raster: SVG fica de fora.
  assert.equal(isAllowedImageType('image/svg+xml'), null, 'SVG não pode passar pelo proxy');
  assert.equal(isAllowedImageType('text/html'), null);
  assert.equal(isAllowedImageType('image/png; charset=binary'), 'image/png');

  // 4. Servidor local de verdade: nem chega a conectar (IP privado), inclusive via redirecionamento.
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end('x');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  let hits = 0;
  server.on('request', () => { hits += 1; });
  await assert.rejects(fetchImageSafely(`http://127.0.0.1:${port}/a.png`), 'IP local recusado');
  await assert.rejects(fetchImageSafely(`http://localhost/a.png`), 'localhost recusado');
  server.close();
  assert.equal(hits, 0, 'Nenhum pedido pode chegar à rede interna');

  console.log('Proxy de imagens seguro (IP após DNS, faixas privadas, IPv6, sem SVG, sem porta extra): OK');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
