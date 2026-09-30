const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const rssPinGenerator = require('../src/jobs/rssPinGenerator');

console.log('🧪 [TEST] Iniciando testes automatizados do Feed RSS do Pinterest...');

// 1. Teste de geração e estrutura de dados do feed
const generatedFeed = rssPinGenerator.generateDailyPins(5);
assert(Array.isArray(generatedFeed), 'O feed gerado deve ser um Array.');
assert(generatedFeed.length >= 5, 'O feed deve conter pelo menos 5 itens gerados.');

const sample = generatedFeed[0];
assert(typeof sample.id === 'string' && sample.id.length > 0, 'O id do item deve ser uma string não vazia.');
assert(typeof sample.title === 'string' && sample.title.length >= 40 && sample.title.length <= 70, `O título deve ter entre 40 e 70 caracteres. Obtido (${sample.title.length}): "${sample.title}"`);
assert(typeof sample.description === 'string' && sample.description.includes('#afiliado'), 'A descrição deve conter a tag #afiliado.');
assert(typeof sample.link === 'string' && sample.link.startsWith('http'), 'O link deve ser uma URL válida.');
assert(typeof sample.imageUrl === 'string' && sample.imageUrl.match(/\.(jpg|jpeg|png)$/i), `A imagem deve terminar em .jpg ou .png: ${sample.imageUrl}`);
assert(!isNaN(Date.parse(sample.pubDate)), `A data de publicação deve ser um RFC-822 válido: ${sample.pubDate}`);

console.log('  ✅ 1. Estrutura de dados e schema de cada item do feed validados.');

// 2. Teste de persistência no disco (data/pinterest_feed.json)
const feedFilePath = path.join(__dirname, '..', 'data', 'pinterest_feed.json');
assert(fs.existsSync(feedFilePath), 'O arquivo data/pinterest_feed.json deve existir.');
const savedOnDisk = JSON.parse(fs.readFileSync(feedFilePath, 'utf8'));
assert(Array.isArray(savedOnDisk) && savedOnDisk.length > 0, 'O arquivo salvo em disco deve ser um Array não vazio.');
assert(savedOnDisk.length <= 50, 'O arquivo não deve ultrapassar o limite de 50 itens históricos.');

console.log('  ✅ 2. Persistência atômica em data/pinterest_feed.json validada.');

// 3. Teste de geração e conformidade do XML RSS 2.0 com Media RSS
const xml = rssPinGenerator.buildRssXml();
assert(typeof xml === 'string' && xml.length > 0, 'O XML gerado deve ser uma string não vazia.');
assert(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'O XML deve conter declaração XML UTF-8.');
assert(xml.includes('<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"'), 'O XML deve conter o namespace Media RSS.');
assert(xml.includes('<channel>'), 'O XML deve conter a tag <channel>.');
assert(xml.includes('<title>Pyxie • Achadinhos Shopee'), 'O canal deve conter título oficial.');
assert(xml.includes('<item>'), 'O XML deve conter itens <item>.');
assert(xml.includes('<enclosure url="') && xml.includes('type="image/jpeg"'), 'Cada item deve ter tag <enclosure> com tipo image/jpeg.');
assert(xml.includes('<media:content url="') && xml.includes('medium="image"'), 'Cada item deve ter tag <media:content>.');
assert(xml.includes('<guid isPermaLink="false">'), 'Cada item deve ter <guid isPermaLink="false">.');
assert(xml.includes('<![CDATA['), 'A descrição deve estar envolvida em bloco CDATA.');

console.log('  ✅ 3. Conformidade com especificação RSS 2.0 e Media RSS validada.');
console.log('🎉 [TEST] Todos os testes do Feed RSS do Pinterest passaram com 100% de sucesso!\n');
