const workSeederService = require('../src/services/workSeederService');

async function main() {
  const cliCount = parseInt(process.argv[2], 10);
  const countPerProf = Number.isInteger(cliCount) && cliCount > 0 ? cliCount : 1;

  console.log('⚡ Disparando gerador autônomo via Groq Cloud...');
  const initialStatus = workSeederService.getStatus();
  console.log(`📊 Status atual: ${initialStatus.currentTotal}/${initialStatus.targetTotal} (${initialStatus.progressPercentage}%)`);

  if (initialStatus.isCompleted) {
    console.log('🎉 A meta de 100 cenários por carreira (1000 no total) já foi atingida!');
    process.exit(0);
  }

  console.log(`🎯 Solicitando +${countPerProf} por profissão (respeitando rate limit de 12s entre chamadas)...`);
  const result = await workSeederService.generateBatch({ countPerProfession: countPerProf });

  const finalStatus = workSeederService.getStatus();
  console.log(`\n✅ Lote concluído! +${result.added} cenários adicionados.`);
  console.log(`📈 Novo total: ${finalStatus.currentTotal}/${finalStatus.targetTotal} (${finalStatus.progressPercentage}%)`);
  console.log('Detalhamento por profissão:');
  console.table(finalStatus.perProfession);
}

main().catch((err) => {
  console.error('❌ Erro na execução:', err);
  process.exit(1);
});
