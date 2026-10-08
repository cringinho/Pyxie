/**
 * Sistema Central de Hierarquia de Carreiras da Pyxie
 * 
 * Mapeia os 4 níveis de cargos da vida real para cada profissão,
 * com progressão salarial exponencial e dificuldade alinhada.
 */

const CAREER_HIERARCHIES = {
  programador: [
    { level: 1, pt: 'Estagiário de Desenvolvimento', en: 'Development Intern' },
    { level: 2, pt: 'Desenvolvedor Júnior', en: 'Junior Developer' },
    { level: 3, pt: 'Desenvolvedor Pleno', en: 'Mid-Level Developer' },
    { level: 4, pt: 'Tech Lead / Arquiteto Sênior', en: 'Tech Lead / Senior Architect' },
  ],
  cozinheiro: [
    { level: 1, pt: 'Ajudante de Cozinha (Commis)', en: 'Kitchen Assistant (Commis)' },
    { level: 2, pt: 'Cozinheiro Júnior (Demi Chef)', en: 'Junior Cook (Demi Chef)' },
    { level: 3, pt: 'Chefe de Praça (Chef de Partie)', en: 'Station Chef (Chef de Partie)' },
    { level: 4, pt: 'Chef Executivo', en: 'Executive Chef' },
  ],
  professor: [
    { level: 1, pt: 'Monitor de Sala / Estagiário', en: 'Teaching Assistant / Intern' },
    { level: 2, pt: 'Professor Assistente', en: 'Assistant Teacher' },
    { level: 3, pt: 'Professor Titular', en: 'Tenured Teacher' },
    { level: 4, pt: 'Coordenador Pedagógico', en: 'Pedagogical Coordinator' },
  ],
  agricultor: [
    { level: 1, pt: 'Ajudante de Campo / Aprendiz', en: 'Field Hand / Apprentice' },
    { level: 2, pt: 'Produtor Rural', en: 'Rural Farmer' },
    { level: 3, pt: 'Administrador de Fazenda', en: 'Farm Manager' },
    { level: 4, pt: 'Mestre Agrônomo', en: 'Master Agronomist' },
  ],
  medico: [
    { level: 1, pt: 'Interno de Medicina (Residente R1)', en: 'Medical Intern (Resident R1)' },
    { level: 2, pt: 'Médico Plantonista', en: 'Attending Physician' },
    { level: 3, pt: 'Médico Especialista', en: 'Specialist Physician' },
    { level: 4, pt: 'Diretor Clínico', en: 'Clinical Director' },
  ],
  musico: [
    { level: 1, pt: 'Músico Aprendiz / Roadie', en: 'Apprentice Musician / Roadie' },
    { level: 2, pt: 'Músico de Apoio (Sideman)', en: 'Session Musician (Sideman)' },
    { level: 3, pt: 'Solista Principal', en: 'Principal Soloist' },
    { level: 4, pt: 'Maestro / Diretor Musical', en: 'Maestro / Musical Director' },
  ],
  fotografo: [
    { level: 1, pt: 'Assistente de Iluminação', en: 'Lighting Assistant' },
    { level: 2, pt: 'Fotógrafo Assistente', en: 'Associate Photographer' },
    { level: 3, pt: 'Fotógrafo de Estúdio', en: 'Studio Photographer' },
    { level: 4, pt: 'Diretor de Fotografia', en: 'Director of Photography' },
  ],
  mecanico: [
    { level: 1, pt: 'Auxiliar de Oficina', en: 'Shop Helper' },
    { level: 2, pt: 'Mecânico Assistente', en: 'Assistant Mechanic' },
    { level: 3, pt: 'Mecânico Especialista', en: 'Master Mechanic' },
    { level: 4, pt: 'Chefe de Oficina', en: 'Shop Foreman' },
  ],
  vendedor: [
    { level: 1, pt: 'Promotor de Vendas Trainee', en: 'Retail Trainee' },
    { level: 2, pt: 'Executivo de Vendas', en: 'Sales Representative' },
    { level: 3, pt: 'Consultor Comercial Sênior', en: 'Senior Sales Consultant' },
    { level: 4, pt: 'Diretor Comercial', en: 'Commercial Director' },
  ],
  artista: [
    { level: 1, pt: 'Aprendiz de Ateliê', en: 'Studio Apprentice' },
    { level: 2, pt: 'Ilustrador Assistente', en: 'Associate Illustrator' },
    { level: 3, pt: 'Artista Plástico Titular', en: 'Lead Visual Artist' },
    { level: 4, pt: 'Mestre de Artes / Diretor de Arte', en: 'Master Artist / Art Director' },
  ],
  dublador: [
    { level: 1, pt: 'Estagiário de Estúdio (Ponta de Voz)', en: 'Studio Intern (Background Voice)' },
    { level: 2, pt: 'Dublador Júnior (Voz Coadjuvante)', en: 'Junior Voice Actor (Secondary Character)' },
    { level: 3, pt: 'Dublador Titular (Protagonista)', en: 'Principal Voice Actor (Protagonist)' },
    { level: 4, pt: 'Diretor de Dublagem', en: 'Dubbing Director' },
  ],
  desenvolvedor_jogos: [
    { level: 1, pt: 'Game Tester (QA Júnior)', en: 'Game Tester (Junior QA)' },
    { level: 2, pt: 'Game Designer Júnior', en: 'Junior Game Designer' },
    { level: 3, pt: 'Gameplay Engineer Pleno', en: 'Mid Gameplay Engineer' },
    { level: 4, pt: 'Game Director / Lead Producer', en: 'Game Director / Lead Producer' },
  ],
  psicologo: [
    { level: 1, pt: 'Estagiário de Psicologia Clínica', en: 'Clinical Psychology Intern' },
    { level: 2, pt: 'Acompanhante Terapêutico (AT)', en: 'Therapeutic Companion' },
    { level: 3, pt: 'Psicólogo Clínico Titular', en: 'Licensed Clinical Psychologist' },
    { level: 4, pt: 'Supervisor Clínico / Mestre em Psicologia', en: 'Clinical Supervisor / Master Psychologist' },
  ],
  telemarketing: [
    { level: 1, pt: 'Atendente Receptivo Trainee', en: 'Call Center Trainee' },
    { level: 2, pt: 'Operador de Retenção / Suporte N2', en: 'Retention Agent / Tier 2 Support' },
    { level: 3, pt: 'Monitor de Qualidade & SAC', en: 'Quality Assurance & Customer Care' },
    { level: 4, pt: 'Supervisor de Operações', en: 'Operations Supervisor' },
  ],
  animador_festa: [
    { level: 1, pt: 'Auxiliar de Recreação & Figurino', en: 'Recreation Assistant & Mascot Helper' },
    { level: 2, pt: 'Recreador Infantil & Pintor Facial', en: 'Children\'s Party Entertainer' },
    { level: 3, pt: 'Animador Principal & Mestre de Cerimônias', en: 'Lead Entertainer & Master of Ceremonies' },
    { level: 4, pt: 'Diretor de Espetáculos Infantis', en: 'Children\'s Show Director' },
  ],
  advogada: [
    { level: 1, pt: 'Estagiária de Direito / Paralegal', en: 'Law Intern / Paralegal' },
    { level: 2, pt: 'Advogada Júnior', en: 'Junior Associate Attorney' },
    { level: 3, pt: 'Advogada Plena / Especialista', en: 'Senior Legal Counsel' },
    { level: 4, pt: 'Sócia do Escritório / Desembargadora Honorária', en: 'Law Firm Partner / Managing Partner' },
  ],
};

const SALARY_RANGES = {
  1: { min: 15, max: 40 },  // Nível 1: Base (15-40 moedas)
  2: { min: 25, max: 55 },  // Nível 2: Pleno Inicial (25-55 moedas)
  3: { min: 40, max: 75 },  // Nível 3: Sênior (40-75 moedas)
  4: { min: 60, max: 100 }, // Nível 4: Diretor / Mestre (60-100 moedas)
};

/**
 * Retorna o título formatado do cargo conforme o nível da hierarquia e idioma.
 */
function getRoleTitle(professionKey, level = 1, lang = 'pt') {
  const roles = CAREER_HIERARCHIES[professionKey] || CAREER_HIERARCHIES.programador;
  const clampedLevel = Math.max(1, Math.min(4, Number(level) || 1));
  const roleObj = roles[clampedLevel - 1] || roles[0];
  const isEn = String(lang).toLowerCase().startsWith('en');
  return isEn ? roleObj.en : roleObj.pt;
}

/**
 * Calcula o salário aleatório de acordo com o nível hierárquico da carreira.
 */
function calculateSalaryForLevel(level = 1) {
  const clampedLevel = Math.max(1, Math.min(4, Number(level) || 1));
  const range = SALARY_RANGES[clampedLevel] || SALARY_RANGES[1];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

/**
 * Filtra minigames compatíveis com o nível da hierarquia.
 */
function filterMinigamesByLevel(minigames, level = 1) {
  if (!Array.isArray(minigames) || minigames.length === 0) return [];
  const clampedLevel = Math.max(1, Math.min(4, Number(level) || 1));
  const exactMatch = minigames.filter((g) => Number(g.level) === clampedLevel);
  if (exactMatch.length > 0) return exactMatch;
  return minigames;
}

module.exports = {
  CAREER_HIERARCHIES,
  SALARY_RANGES,
  getRoleTitle,
  calculateSalaryForLevel,
  filterMinigamesByLevel,
};

