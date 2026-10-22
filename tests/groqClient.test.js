const assert = require('node:assert');

process.env.GROQ_API_KEY = 'test-key';
process.env.GROQ_MIN_INTERVAL_MS = '30';

const groqClient = require('../src/services/groqClient');

console.log('🧪 Iniciando testes do cliente Groq compartilhado (fila única, backoff e agendamento)...');

(async () => {
  // 1. Parser do tempo pedido pela Groq
  const { parseRetryDelayMs, computeFirstRunDelay } = groqClient;
  assert.equal(parseRetryDelayMs(null, 'Please try again in 7.5s. Need more tokens?'), 7500);
  assert.equal(parseRetryDelayMs(null, 'Please try again in 2m30.5s.'), 150500);
  assert.equal(parseRetryDelayMs(null, 'Please try again in 1h2m3s.'), 3723000);
  assert.equal(parseRetryDelayMs(null, 'Please try again in 450ms.'), 450);
  assert.equal(parseRetryDelayMs('12', ''), 12000);
  assert.equal(parseRetryDelayMs('3', 'try again in 9s'), 9000, 'Deve usar o maior entre header e mensagem.');
  assert.equal(parseRetryDelayMs(null, 'Rate limit reached'), null);
  console.log('  ✅ 1. Parser de retry-after e "try again in" validado (s, m, h, ms).');

  // 2. Agendamento sem lote no boot
  const hour = 60 * 60 * 1000;
  const now = 10 * hour;
  assert.equal(computeFirstRunDelay(0, 3 * hour, now), 3 * hour, 'Sem histórico: espera o intervalo cheio.');
  assert.equal(computeFirstRunDelay(now - hour, 3 * hour, now), 2 * hour, 'Respeita o tempo restante desde o último lote.');
  assert.equal(computeFirstRunDelay(now - 5 * hour, 3 * hour, now), 10 * 60 * 1000, 'Lote atrasado: aguarda o mínimo de 10 min após o boot.');
  console.log('  ✅ 2. Reinícios do PM2 não disparam lote imediato.');

  // 3. Fila única: chamadas concorrentes nunca se sobrepõem
  const originalFetch = global.fetch;
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(' '));

  let inFlight = 0;
  let maxInFlight = 0;
  const callTimes = [];
  global.fetch = async () => {
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    callTimes.push(Date.now());
    await new Promise((r) => setTimeout(r, 15));
    inFlight--;
    return new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }), { status: 200 });
  };

  try {
    const results = await Promise.all([
      groqClient.chatCompletion({ model: 'm' }, { label: 'A' }),
      groqClient.chatCompletion({ model: 'm' }, { label: 'B' }),
      groqClient.chatCompletion({ model: 'm' }, { label: 'C' }),
    ]);
    assert.ok(results.every((r) => r.ok), 'Todas as chamadas devem concluir.');
    assert.equal(maxInFlight, 1, 'Apenas uma requisição Groq pode estar em voo por vez.');
    for (let i = 1; i < callTimes.length; i++) {
      assert.ok(callTimes[i] - callTimes[i - 1] >= 25, 'Deve respeitar o espaçamento mínimo entre chamadas.');
    }
    console.log = originalLog;
    console.log('  ✅ 3. Fila única serializa work, quiz e matemática com espaçamento mínimo.');

    // 4. Backoff respeitando o tempo pedido e desistindo após maxRetries
    console.log = (...args) => logs.push(args.join(' '));
    let calls = 0;
    global.fetch = async () => {
      calls++;
      if (calls === 1) {
        return new Response(JSON.stringify({ error: { message: 'Please try again in 10ms.' } }), { status: 429 });
      }
      return new Response(JSON.stringify({ choices: [] }), { status: 200 });
    };
    const retried = await groqClient.chatCompletion({ model: 'm' }, { label: 'Retry' });
    assert.ok(retried.ok, 'Após o 429 a chamada deve ser refeita e concluir.');
    assert.equal(calls, 2);

    calls = 0;
    global.fetch = async () => {
      calls++;
      return new Response(JSON.stringify({ error: { message: 'Please try again in 10ms.' } }), { status: 429 });
    };
    const noRetry = await groqClient.chatCompletion({ model: 'm' }, { label: 'NoRetry', maxRetries: 0 });
    assert.equal(noRetry.rateLimited, true);
    assert.equal(calls, 1, 'maxRetries 0 não deve repetir a chamada.');
    console.log = originalLog;
    console.log('  ✅ 4. Backoff respeita o tempo pedido pela Groq e o limite de tentativas.');

    // 5. Cota diária esgotada pausa a fila sem bloquear o processo
    console.log = (...args) => logs.push(args.join(' '));
    calls = 0;
    global.fetch = async () => {
      calls++;
      return new Response(JSON.stringify({ error: { message: 'Limit tokens per day. Please try again in 12m5s.' } }), { status: 429 });
    };
    const exhausted = await groqClient.chatCompletion({ model: 'm' }, { label: 'Quota' });
    assert.equal(exhausted.error, 'quota_exhausted');
    const paused = await groqClient.chatCompletion({ model: 'm' }, { label: 'Quota' });
    assert.equal(paused.error, 'paused');
    assert.equal(calls, 1, 'Com a fila pausada nenhuma nova requisição deve sair.');
    assert.ok(groqClient.getQueueStatus().pausedUntil > Date.now());
    console.log = originalLog;
    console.log('  ✅ 5. Cota esgotada pausa a fila em vez de martelar a API.');

    assert.ok(logs.every((l) => !/warn|error/i.test(l)), 'Logs de 429 devem ser informativos.');
  } finally {
    global.fetch = originalFetch;
    console.log = originalLog;
  }

  console.log('🎉 tests/groqClient.test.js concluído com 100% de sucesso!');
})().catch((err) => {
  console.error('❌ Falha nos testes do cliente Groq:', err);
  process.exit(1);
});
