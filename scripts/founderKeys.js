/**
 * Gera as chaves do Programa Fundador e imprime o texto de DM pronto para colar.
 *
 * NAda é enviado automaticamente (AGENTS §11): o dono copia e manda.
 *
 * Uso:
 *   node scripts/founderKeys.js --list
 *   node scripts/founderKeys.js --create=5 --note="parceiros de outubro"
 *   node scripts/founderKeys.js --show=<CODE>
 */
const founder = require('../src/services/founderProgram');

const args = process.argv.slice(2);
const val = (name) => {
  const inline = args.find((a) => a.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : null;
};

function dmText(code, note) {
  return [
    'Oi. Você foi escolhido para o **Programa Fundador** da Pyxie — 20 vagas e a sua é uma delas.',
    '',
    `### 🎟️ Sua chave`,
    `\`${code}\``,
    '',
    '### Como resgatar',
    '1. Adicione a Pyxie no seu servidor: `pyxie.com.br/invite?ref=fundador`',
    '2. Use `/py-fundador` (ou `py!fundador`) e cole a chave.',
    '3. Pronto: **Básico liberado por 12 meses**, sem cartão e sem cobrança.',
    '',
    '### O que eu espero de volta',
    '- Um canal liberado para a Pyxie falar com o servidor.',
    '- Um anúncio da Pyxie no seu servidor.',
    '- Movimento: pelo menos uma conversa por semana por lá.',
    '',
    '-# A chave expira em 7 dias e vale uma vez. Se passar do prazo, me chama que eu resolvo — reclamando, mas resolvo.',
    note ? `-# ${note}` : '',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

if (args.includes('--list') || args.length === 0) {
  const s = founder.stats();
  console.log(`\n🎟️ Fundador: ${s.total}/${s.seats} vagas usadas · ${s.available} disponíveis · ${s.active} ativas · ${s.paused} pausadas`);
  for (const seat of founder.list()) {
    const when = seat.keyExpiresAt ? new Date(seat.keyExpiresAt).toISOString().slice(0, 10) : '—';
    console.log(
      `  ${seat.code}  status=${seat.status}  servidor=${seat.guildId || '—'}  expira=${when}  checklist=${seat.checklistDone}/3`
    );
  }
  console.log('');
  process.exit(0);
}

const showCode = val('--show');
if (showCode) {
  const seat = founder.list().find((s) => s.code === String(showCode).toUpperCase());
  if (!seat) {
    console.error(`Chave ${showCode} não encontrada.`);
    process.exit(1);
  }
  console.log(dmText(seat.code, seat.note));
  process.exit(0);
}

const count = Math.max(1, Number(val('--create')) || 0);
if (!count) {
  console.error('Nada a fazer. Use --create=N ou --list.');
  process.exit(1);
}

const note = val('--note') || '';
console.log(`\n🎟️ Criando ${count} chave(s)...\n`);
for (let i = 0; i < count; i += 1) {
  const result = founder.createKey({ note, by: 'owner' });
  if (!result.ok) {
    console.error(`❌ ${result.reason} (vagas usadas: ${result.seats}/${founder.SEATS})`);
    break;
  }
  console.log('─'.repeat(60));
  console.log(dmText(result.seat.code, result.seat.note));
  console.log('─'.repeat(60));
}
console.log('');
