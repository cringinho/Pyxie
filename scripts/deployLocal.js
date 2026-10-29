const { execSync } = require('child_process');
const path = require('path');
const nodeDir = path.dirname(process.execPath);
const gitBin = 'C:\\Program Files\\Git\\bin';
process.env.PATH = `${nodeDir};${gitBin};${process.env.PATH}`;


function run(cmd, desc) {
  console.log(`\n🚀 [Deploy] ${desc}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ [Deploy] Falha na etapa: ${desc}`);
    process.exit(1);
  }
}

console.log('====================================================');
console.log('📦 Iniciando Pipeline Automático de Deploy da Pyxie');
console.log('====================================================');

// 1. Quality Gate Automático (AGENTS.md §2: test-safe protege data/)
const fs = require('fs');
const testCmd = fs.existsSync('scripts/test-safe.sh') ? 'bash scripts/test-safe.sh' : 'npm test';
run(testCmd, `1/4 Executando suíte de testes (${testCmd})`);

// 2. Commit local de alterações pendentes
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status) {
    const customMsg = process.argv.slice(2).join(' ');
    const commitMsg = customMsg || `fix/feat: update ${new Date().toLocaleString('pt-BR')}`;
    run('git add .', '2a/4 Adicionando modificações ao git');
    run(`git commit -m "${commitMsg}"`, `2b/4 Efetuando commit ("${commitMsg}")`);
  } else {
    console.log('\n✅ 2/4 Nenhuma modificação pendente no repositório local.');
  }
} catch (err) {
  console.error('Erro na verificação de status do git:', err.message);
  process.exit(1);
}

// 3. Sync com repositório remoto (GitHub)
run('git push origin main', '3/4 Enviando alterações para o GitHub (git push origin main)');

// 4. Invocação remota do deploy.sh na VM da Oracle Cloud
run('ssh oracle "cd ~/kuromi && ./deploy.sh --force"', '4/4 Executando atualização de produção na Oracle Cloud VM');

console.log('\n✨ ====================================================');
console.log('🎉 Deploy concluído com sucesso! A Pyxie está 100% online.');
console.log('✨ ====================================================');
