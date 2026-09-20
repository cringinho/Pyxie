const assert = require('node:assert/strict');
const encounters = require('../src/data/encounters.json');

console.log('Iniciando auditoria de desafio e obviedade das negociações (Protocolo SMT V3)...');

assert.ok(Array.isArray(encounters.encounters), 'Base de encontros deve conter array encounters.');
assert.equal(encounters.encounters.length, 24, 'Base deve conter 24 encontros catalogados.');

encounters.encounters.forEach((enc) => {
  assert.ok(enc.id, 'Encontro deve ter ID');
  assert.ok(enc.tier >= 1 && enc.tier <= 5, 'Tier deve ser entre 1 e 5');
  assert.ok(Array.isArray(enc.options) && enc.options.length === 3, `Encontro ${enc.id} deve conter exatamente 3 opções.`);

  // 1. Limite de tamanho <= 60 chars
  enc.options.forEach((opt) => {
    assert.ok(opt.text?.pt && opt.text.pt.length <= 60, `Encontro ${enc.id} opção ${opt.id} PT excede 60 chars (${opt.text?.pt?.length})`);
    assert.ok(opt.text?.en && opt.text.en.length <= 60, `Encontro ${enc.id} opção ${opt.id} EN excede 60 chars (${opt.text?.en?.length})`);
  });

  // 2. Paridade de tamanho (max - min <= 25)
  const lengthsPt = enc.options.map((o) => o.text.pt.length);
  const maxLenPt = Math.max(...lengthsPt);
  const minLenPt = Math.min(...lengthsPt);
  assert.ok(maxLenPt - minLenPt <= 25, `Encontro ${enc.id} variação de tamanho PT muito alta (${maxLenPt - minLenPt})`);

  const lengthsEn = enc.options.map((o) => o.text.en.length);
  const maxLenEn = Math.max(...lengthsEn);
  const minLenEn = Math.min(...lengthsEn);
  assert.ok(maxLenEn - minLenEn <= 25, `Encontro ${enc.id} variação de tamanho EN muito alta (${maxLenEn - minLenEn})`);

  // 3. Tiers 4 e 5 sem facilitadores (+2)
  if (enc.tier >= 4) {
    const hasPlusTwo = enc.options.some((o) => o.success_chance_modifier >= 2);
    assert.equal(hasPlusTwo, false, `Encontro ${enc.id} de Tier ${enc.tier} não deve conter modificador >= +2`);
  }
});

console.log('✅ Auditoria de Negociações V3: Todas as 24 negociações passaram no teste de desafio e limites.');
