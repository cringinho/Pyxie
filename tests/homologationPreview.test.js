const assert = require('node:assert');
const { EmbedBuilder } = require('discord.js');
const {
  HOMOLOGATION_CHANNEL_ID,
  shieldAntiPing,
  sanitizeEmbed,
  buildHeaderEmbed,
  previewsEnabled,
  dispatchHomologationPreview,
} = require('../src/utils/homologationPreviewDispatcher');

console.log('🧪 Iniciando suíte de testes de Engenharia: Homologation Preview Dispatcher...');

// 1. Validar ID canônico do canal de homologação
assert.strictEqual(HOMOLOGATION_CHANNEL_ID, '1461937203214024891', 'ID do canal de homologação deve ser 1461937203214024891');
console.log('  ✅ 1. Canal canônico de homologação (1461937203214024891) validado.');

// 2. Testar Blindagem Anti-Ping (shieldAntiPing)
const rawText = 'Olá <@123456789> e <@!987654321>, cargo <@&1122334455>, canal <#99887766> e alertas @everyone e @here!';
const shielded = shieldAntiPing(rawText);

assert.ok(shielded.includes('`<@123456789>`'), 'Menção de usuário comum deve estar entre crases.');
assert.ok(shielded.includes('`<@987654321>`'), 'Menção de usuário com exclamação deve ser sanitizada.');
assert.ok(shielded.includes('`<@&1122334455>`'), 'Menção de cargo deve estar entre crases.');
assert.ok(shielded.includes('`<#99887766>`'), 'Menção de canal deve estar entre crases.');
assert.ok(shielded.includes('`@everyone`'), '@everyone deve estar entre crases.');
assert.ok(shielded.includes('`@here`'), '@here deve estar entre crases.');
assert.strictEqual(/(?<!`)<@!?123456789>(?!`)/.test(shielded), false, 'Não deve restar menção ativa de usuário sem crases.');
assert.strictEqual(/(?<!`)@everyone(?!`)/.test(shielded), false, 'Não deve restar @everyone desprotegido.');

// Testar texto que já possuía crases
const textWithExistingQuotes = 'Texto já com `<@9999>` e ```@everyone``` intactos.';
const doubleShielded = shieldAntiPing(textWithExistingQuotes);
assert.strictEqual(doubleShielded, textWithExistingQuotes, 'Texto já com crases não deve duplicá-las.');

console.log('  ✅ 2. Blindagem Anti-Ping (Usuários, Cargos, Canais, @everyone/@here) validada com 100% de precisão.');

// 3. Testar Sanitização de Embeds (sanitizeEmbed)
const sourceEmbed = new EmbedBuilder()
  .setTitle('Título com <@123456789>')
  .setDescription('Descrição com cargo <@&1122334455> e @everyone')
  .setAuthor({ name: 'Autor <@444>' })
  .setFooter({ text: 'Rodapé @here' })
  .addFields(
    { name: 'Campo 1 <@999>', value: 'Valor 1 <@&888>', inline: true },
    { name: 'Campo 2', value: 'Alerta geral @everyone', inline: false }
  );

const sanitized = sanitizeEmbed(sourceEmbed);
assert.strictEqual(sanitized.data.title, 'Título com `<@123456789>`');
assert.strictEqual(sanitized.data.description, 'Descrição com cargo `<@&1122334455>` e `@everyone`');
assert.strictEqual(sanitized.data.author.name, 'Autor `<@444>`');
assert.strictEqual(sanitized.data.footer.text, 'Rodapé `@here`');
assert.strictEqual(sanitized.data.fields[0].name, 'Campo 1 `<@999>`');
assert.strictEqual(sanitized.data.fields[0].value, 'Valor 1 `<@&888>`');
assert.strictEqual(sanitized.data.fields[1].value, 'Alerta geral `@everyone`');
console.log('  ✅ 3. Sanitização profunda de EmbedBuilder (Title, Desc, Fields, Author, Footer) validada.');

// 4. Testar Construção do Header Embed
const header = buildHeaderEmbed({
  commandName: '/py-tarot',
  context: 'Atualização de Layout Kawaii',
  extraInfo: 'Adicionado botão de revelação animada',
});

assert.ok(header.data.title.includes('Preview de Homologação'), 'Header deve ter título oficial de homologação.');
assert.ok(header.data.description.includes('/py-tarot'), 'Header deve conter o nome do comando.');
assert.ok(header.data.fields.some((f) => f.name.includes('Blindagem')), 'Header deve confirmar Blindagem Anti-Ping.');
console.log('  ✅ 4. Header informativo oficial de homologação validado com sucesso.');

// 5. Portão opt-in: por padrão NADA é enviado; com force/PYXIE_PREVIEWS=on o despacho segue.
(async () => {
  const previous = process.env.PYXIE_PREVIEWS;
  delete process.env.PYXIE_PREVIEWS;
  assert.strictEqual(previewsEnabled(), false, 'Prévia desligada por padrão');

  let enviado = null;
  const fakeClient = {
    channels: {
      fetch: async () => ({
        isTextBased: () => true,
        send: async (payload) => {
          enviado = payload;
          return { id: 'msg-preview-1' };
        },
      }),
    },
  };

  const skipped = await dispatchHomologationPreview({
    commandName: '/py-profile',
    context: 'Teste de Cobertura Unitária',
    embeds: [sourceEmbed],
    content: 'Preview disparada com menção <@123456789>',
    client: fakeClient,
  });
  assert.strictEqual(skipped.success, true, 'Despacho deve retornar success: true');
  assert.strictEqual(skipped.skipped, true, 'Sem pedido explícito, nada é enviado');
  assert.strictEqual(enviado, null, 'Nenhuma mensagem chega ao Discord');
  assert.ok(skipped.sanitizedPayload && skipped.sanitizedPayload.embedsCount >= 1, 'Payload continua sanitizado para inspeção');

  const forced = await dispatchHomologationPreview({
    commandName: '/py-profile',
    context: 'Envio sob demanda do dono',
    embeds: [sourceEmbed],
    content: 'Preview com menção <@123456789>',
    client: fakeClient,
    force: true,
  });
  assert.strictEqual(forced.messageId, 'msg-preview-1', 'Com force, a prévia é enviada');
  assert.deepStrictEqual(enviado.allowedMentions, { parse: [], users: [], roles: [], repliedUser: false }, 'Sem pings mesmo no envio');
  assert.ok(!/(?<!`)<@!?\d+>(?!`)/.test(enviado.content), 'Menção escapada entre crases');

  process.env.PYXIE_PREVIEWS = 'on';
  assert.strictEqual(previewsEnabled(), true, 'PYXIE_PREVIEWS=on liga o envio');
  if (previous === undefined) delete process.env.PYXIE_PREVIEWS;
  else process.env.PYXIE_PREVIEWS = previous;

  console.log('  ✅ 5. Portão de prévias validado (off por padrão; force ou PYXIE_PREVIEWS=on para enviar).');

  console.log('\n🎉 TODOS OS TESTES DO HOMOLOGATION PREVIEW DISPATCHER PASSARAM COM 100% DE SUCESSO!\n');
})().catch((err) => {
  console.error('❌ Falha nos testes de Homologation Preview:', err);
  process.exit(1);
});
